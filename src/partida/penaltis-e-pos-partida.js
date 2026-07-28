async function resolverVencedorMataMataComPenaltisInterativos(idA, idB, golsA, golsB, forcaA, forcaB, meuTimeId) {
    if (golsA !== golsB || (meuTimeId !== idA && meuTimeId !== idB)) {
        return resolverVencedorMataMata(idA, idB, golsA, golsB, forcaA, forcaB);
    }
    return await disputaPenaltisInterativa(idA, idB, forcaA, forcaB, meuTimeId);
}

function _shootoutDecisaoAntecipada(scoreA, scoreB, tomadasA, tomadasB) {
    const restantesA = Math.max(0, 5 - tomadasA), restantesB = Math.max(0, 5 - tomadasB);
    return (scoreA > scoreB + restantesB) || (scoreB > scoreA + restantesA);
}

// 🎯 O modelo do jogo não tem um atributo "Pênaltis" dedicado (nem
// Compostura/Reação/Posicionamento/Elasticidade/Defesa de Pênaltis) — só os
// 11 atributos base (finalizacao, velocidade, passe, defesa, cabeceamento,
// drible, resistencia, forca, reflexos, reposicao, jogoAereo) + inteligência
// e moral (só no jogador real). Por isso aproximamos cada atributo pedido
// pelo mais próximo que já existe:
//   Cobrador  → Pênaltis/Finalização ≈ finalizacao · Compostura ≈ inteligência (só existe no jogador; NPC usa forca) · Moral ≈ moral
//   Goleiro   → Reflexos ≈ reflexos · Reação ≈ reflexos · Posicionamento ≈ reposicao · Elasticidade ≈ velocidade · Defesa de Pênaltis ≈ defesa
function notaPenaltiCobranca(p) {
    if (!p) return 60;
    const finalizacao = p.finalizacao ?? p.geral ?? 60;
    const compostura = p.isMe ? (p.inteligencia ?? p.geral ?? 60) : (p.forca ?? p.geral ?? 60);
    const moral = p.isMe ? (p.moral ?? 55) : 60;
    return finalizacao * 0.5 + compostura * 0.25 + moral * 0.25;
}

function notaPenaltiDefesa(p) {
    if (!p) return 60;
    const reflexos = p.reflexos ?? p.geral ?? 60;
    const reposicao = p.reposicao ?? p.geral ?? 60;
    const velocidade = p.velocidade ?? p.geral ?? 60;
    const defesa = p.defesa ?? p.geral ?? 60;
    const moral = p.isMe ? (p.moral ?? 55) : 60;
    return reflexos * 0.35 + reposicao * 0.2 + velocidade * 0.15 + defesa * 0.2 + moral * 0.1;
}

// 🏆 Ordem de cobradores: entre quem terminou a partida em campo (titulares
// do clube — o modelo do jogo não simula substituições jogador a jogador, e
// os titulares são a melhor aproximação disponível de "quem está em campo"),
// exclui goleiros e ordena do melhor pro pior atributo de cobrança. O TEU
// jogador entra nessa mesma disputa — se teu atributo só te deixa em 3º,
// bates 3º, nem que a posição "oficial" de cobrador durante o jogo seja
// outra.
function determinarOrdemCobradoresPenalti(clubeId) {
    const clube = obterTitularesClube(clubeId);
    const idsTitulares = new Set(clube?.titularesIds || []);
    let pool = jogadoresIA.filter(j => idsTitulares.has(j.id) && j.posicao !== "Goleiro" && j.posicao !== "Goleiro Libero");
    if (jogador && jogador.clubeId === clubeId && jogador.posicao !== "Goleiro" && jogador.posicao !== "Goleiro Libero") {
        pool = [{ ...jogador, id: "player", isMe: true }, ...pool];
    }
    return pool.sort((a, b) => notaPenaltiCobranca(b) - notaPenaltiCobranca(a)).slice(0, 5);
}

async function disputaPenaltisInterativa(idA, idB, forcaA, forcaB, meuTimeId) {
    const clubA = clubes.find(c => c.id === idA), clubB = clubes.find(c => c.id === idB);
    const nomeA = clubA?.nome || idA, nomeB = clubB?.nome || idB;

    let overlay = document.getElementById("shootoutOverlay");
    if (!overlay) { overlay = document.createElement("div"); overlay.id = "shootoutOverlay"; document.body.appendChild(overlay); }
    overlay.className = "shootout-overlay";
    overlay.innerHTML = `
        <div class="shootout-modal">
            <h2 class="shootout-titulo">🎯 DISPUTA DE PÊNALTIS</h2>
            <div class="shootout-placar">
                <div class="shootout-time"><img loading="lazy" decoding="async" src="${obterUrlImagem(clubA,'clube')}"><span>${nomeA}</span><strong id="shootoutScoreA">0</strong></div>
                <div class="shootout-vs">×</div>
                <div class="shootout-time"><strong id="shootoutScoreB">0</strong><span>${nomeB}</span><img loading="lazy" decoding="async" src="${obterUrlImagem(clubB,'clube')}"></div>
            </div>
            <div class="shootout-bolas" id="shootoutBolasA"></div>
            <div class="shootout-bolas" id="shootoutBolasB"></div>
            <p class="shootout-status" id="shootoutStatus">A preparar a disputa de pênaltis...</p>
        </div>`;
    overlay.classList.remove("oculto");
    window.tocarSom('notificacao', 0.4);

    let scoreA = 0, scoreB = 0;
    const setStatus = (t) => { const el = document.getElementById("shootoutStatus"); if (el) el.textContent = t; };
    const setPlacar = () => { setText("shootoutScoreA", scoreA); setText("shootoutScoreB", scoreB); };
    const addBola = (lado, converteu) => {
        const el = document.getElementById(lado === "A" ? "shootoutBolasA" : "shootoutBolasB");
        if (el) el.innerHTML += `<span class="shootout-bola ${converteu ? 'gol' : 'falhou'}">${converteu ? '⚽' : '❌'}</span>`;
    };

    const souGoleiro = jogador.posicao === "Goleiro" || jogador.posicao === "Goleiro Libero";
    const meuLado = meuTimeId === idA ? "A" : "B";

    // 🎯 Ordem real de cobradores do TEU time, definida pelos atributos (ver
    // determinarOrdemCobradoresPenalti) — substitui a antiga regra fixa de
    // "só bato se for o 1º cobrador oficial do jogo". Se não estiveres entre
    // os 5 melhores do teu time, você simplesmente não bate nesta disputa
    // (mas ainda pode ser sorteado como goleiro, se for o caso).
    const ordemMeuTime = souGoleiro ? [] : determinarOrdemCobradoresPenalti(meuTimeId);
    const minhaPosicaoNaOrdem = ordemMeuTime.findIndex(p => p.id === "player") + 1; // 0 = não está no top 5

    // ladoSou = true quando é a cobrança do MEU clube.
    const cobrar = async (ladoSou, numeroCobranca) => {
        const estaCobrandoOMeuTime = (ladoSou && meuLado === "A") || (!ladoSou && meuLado === "B");
        const souEuQueBato = estaCobrandoOMeuTime && minhaPosicaoNaOrdem > 0 && numeroCobranca === minhaPosicaoNaOrdem;
        const souEuQueDefendo = !estaCobrandoOMeuTime && souGoleiro;
        let converteu;
        if (souEuQueBato || souEuQueDefendo) {
            setStatus(souEuQueBato ? "🎯 É a tua vez de cobrar!" : "🧤 Defende esta cobrança!");
            const forcaRival = estaCobrandoOMeuTime ? (ladoSou ? forcaB : forcaA) : (ladoSou ? forcaA : forcaB);
            // 🛡️ FIX (minigame ficava travado atrás do placar da disputa): o
            // overlay #shootoutOverlay (placar + bolinhas indo e vindo) tem
            // z-index 99997 e ficava visível o tempo TODO, inclusive quando o
            // #modalPenaltiMinigame (mira/força) abria por cima. Como os dois
            // ocupam a tela inteira, o placar acabava capturando os cliques e
            // o jogador não conseguia mirar nem chutar/defender. Agora ele é
            // escondido bem na hora de abrir o minigame, e volta a aparecer
            // assim que a cobrança termina (o minigame já se fecha sozinho
            // antes de resolver a Promise — ver finalizarPenalti).
            overlay.classList.add("oculto");
            const resultado = await new Promise(resolve => window.abrirMinigamePenalti({ ehGoleiro: souEuQueDefendo, forcaRival }, resolve));
            overlay.classList.remove("oculto");
            converteu = !!resultado?.gol;
        } else {
            const forcaLado = (ladoSou ? forcaA : forcaB);
            setStatus(`${ladoSou ? nomeA : nomeB} vai cobrar...`);
            await new Promise(r => setTimeout(r, 750));
            converteu = Math.random() < Math.max(0.55, Math.min(0.92, 0.68 + (forcaLado - 70) * 0.004));
        }
        window.tocarSom(converteu ? 'gol' : 'erro', 0.4);
        return converteu;
    };

    let tomadasA = 0, tomadasB = 0, rodada = 1;
    while (true) {
        // 🔁 Morte súbita repete o MESMO ciclo de 5 cobradores (na mesma
        // ordem por atributo) em vez de um "sem cobrador designado" — assim
        // o goleiro (e o cobrador, se estiver no top 5) continuam
        // participando ativamente mesmo além da 5ª cobrança.
        const numeroCobranca = ((rodada - 1) % 5) + 1;
        const convA = await cobrar(true, numeroCobranca); tomadasA++;
        if (convA) scoreA++; addBola("A", convA); setPlacar();
        await new Promise(r => setTimeout(r, 350));

        const convB = await cobrar(false, numeroCobranca); tomadasB++;
        if (convB) scoreB++; addBola("B", convB); setPlacar();
        await new Promise(r => setTimeout(r, 350));

        if (rodada <= 5) {
            // Dentro das 5 cobranças normais: para se já está matematicamente
            // decidido, ou se chegaram ao fim das 5 com placares diferentes.
            if (_shootoutDecisaoAntecipada(scoreA, scoreB, tomadasA, tomadasB) || (rodada === 5 && scoreA !== scoreB)) break;
        } else {
            // Morte súbita: decide assim que uma rodada completa termina com placares diferentes.
            if (scoreA !== scoreB) break;
        }
        rodada++;
    }

    const vencedorId = scoreA > scoreB ? idA : idB;
    setStatus(`🏆 ${vencedorId === idA ? nomeA : nomeB} venceu a disputa de pênaltis!`);
    window.tocarSom(vencedorId === meuTimeId ? 'vitoria' : 'derrota');
    await new Promise(r => setTimeout(r, 2200));
    overlay.remove();
    return { vencedorId, penaltis: true, placarPen: `${scoreA}-${scoreB}` };
}

async function resolverLogicaPosPartida(comp, gc, gv, golsJogador = 0, assistsJogador = 0) {
    if (comp.isSelecao) {
        const key = comp.compId;
        const estado = selecoesEstado.torneios?.[key];
        const minhaSel = jogador.selecaoId;
        if(minhaSel) {
            registrarPlantelTorneio(key, minhaSel, ["player"]);
            atualizarStatsSelecao(jogador, 1, golsJogador, assistsJogador);
            registrarEstatisticaCompeticao(jogador, comp.compConfigId || key, 1, golsJogador, assistsJogador);
        }
        if(estado?.tipo === "grupos" && estado.grupos) {
            estado.grupos.forEach(grp => {
                const m = grp.equipas.find(e => e.id === minhaSel);
                const a = grp.equipas.find(e => e.id === comp.adversarioId);
                if(m && a) { m.j++; a.j++; m.gf += gc; m.gs += gv; a.gf += gv; a.gs += gc; if(gc>gv) m.pts += 3; else if(gv>gc) a.pts += 3; else { m.pts++; a.pts++; } }
            });
        } else if(estado?.tipo === "liga" && estado.tabela) {
            const m = estado.tabela.find(e => e.id === minhaSel);
            const a = estado.tabela.find(e => e.id === comp.adversarioId);
            if(m && a) { m.j++; a.j++; m.gf += gc; m.gs += gv; a.gf += gv; a.gs += gc; if(gc>gv) m.pts += 3; else if(gv>gc) a.pts += 3; else { m.pts++; a.pts++; } }
        } else if(estado?.tipo === "mata-mata" && estado.confrontos) {
            const conf = estado.confrontos.find(c => c.timeA.id === minhaSel || c.timeB.id === minhaSel);
            if(conf) {
                const isA = conf.timeA.id === minhaSel;
                conf.golsA = isA ? gc : gv;
                conf.golsB = isA ? gv : gc;
                const fA = calcularForcaSelecao(conf.timeA.id), fB = calcularForcaSelecao(conf.timeB.id);
                const res = resolverVencedorMataMata(conf.timeA.id, conf.timeB.id, conf.golsA, conf.golsB, fA, fB);
                conf.vencedorId = res.vencedorId; conf.penaltis = res.penaltis;
                if(estado.fase === "Final" && conf.vencedorId) {
                    estado.fase = "Campeão Definido"; estado.campeaoId = conf.vencedorId;
                    concederTituloInternacional(conf.vencedorId, estado.nome, key);
                    if(conf.vencedorId === minhaSel) {
                        const sel = SELECOES.find(s => s.id === minhaSel);
                        dispararAnimacaoCampeao(`Seleção ${sel?.nome}`, estado.nome, sel?.logo || "");
                    }
                } else if(estado.confrontos.every(c => c.vencedorId)) avancarMataMataInternacional(key);
            }
        }
        return;
    }
    // 🛡️ FIX (Champions/Europa League travada na Rodada 1): o evento da "Fase
    // de Liga" (formato suíço) também tem isMataMata:false e fase !== "Grupos",
    // então caía sempre neste PRIMEIRO if — pensado só para ligas domésticas.
    // Como tabelasLigas["uefa_cl"] não existe (tabelasLigas só guarda ligas
    // nacionais), `t` vinha undefined e nada era feito — e o branch CORRETO do
    // formato suíço (mais abaixo) nunca era alcançado. Resultado: a partida do
    // jogador na Champions nunca era marcada como resolvida em estado.fixtures,
    // e como a rodada só avança quando TODAS as partidas dela (incluindo a do
    // jogador) estão resolvidas, a fase de liga ficava travada na Rodada 1 para
    // sempre. Agora a "Fase de Liga" é excluída explicitamente deste if, para
    // cair no branch correto (else if comp.fase === "Fase de Liga", abaixo).
    if (comp.isMataMata === false && comp.fase !== "Grupos" && comp.fase !== "Fase de Liga") {
        let t = tabelasLigas[comp.compId];
        if (t) {
            let mt = t.find(x => x.id === jogador.clubeId); let advt = t.find(x => x.id === comp.adversarioId);
            if(mt) { mt.jogos++; mt.gols = (mt.gols||0)+gc; mt.golsSofridos = (mt.golsSofridos||0)+gv; if(gc > gv){ mt.pontos+=3; mt.vitorias=(mt.vitorias||0)+1;} else if(gc===gv){ mt.pontos+=1; mt.empates=(mt.empates||0)+1; } else {mt.derrotas=(mt.derrotas||0)+1;} }
            if(advt) { advt.jogos++; advt.gols = (advt.gols||0)+gv; advt.golsSofridos = (advt.golsSofridos||0)+gc; if(gv > gc){ advt.pontos+=3; advt.vitorias=(advt.vitorias||0)+1;} else if(gc===gv){ advt.pontos+=1; advt.empates=(advt.empates||0)+1; } else {advt.derrotas=(advt.derrotas||0)+1;} }
        }
    } else if(comp.fase === "Grupos") {
        let estado = copasEstado[comp.compId];
        if(estado && estado.tipo === "grupos") {
            estado.grupos.forEach(grp => {
                let mGrp = grp.equipas.find(e => e.id === jogador.clubeId); let aGrp = grp.equipas.find(e => e.id === comp.adversarioId);
                if(mGrp && aGrp) { mGrp.j++; aGrp.j++; mGrp.gf+=gc; mGrp.gs+=gv; aGrp.gf+=gv; aGrp.gs+=gc; if(gc>gv) mGrp.pts+=3; else if(gv>gc) aGrp.pts+=3; else { mGrp.pts+=1; aGrp.pts+=1; } }
            });
        }
    } else if(comp.fase === "Fase de Liga") {
        // 🆕 FORMATO SUÍÇO: registra o meu jogo na tabela única e marca a partida
        // correspondente em estado.fixtures como resolvida, para que a simulação
        // semanal saiba que pode fechar a rodada e seguir em frente.
        let estado = copasEstado[comp.compId];
        if(estado && estado.tipo === "liga_unica") {
            const meuGol = comp.emCasa !== false ? gc : gv;
            const advGol = comp.emCasa !== false ? gv : gc;
            const fixture = (estado.fixtures || []).find(f => f.rodada === comp.rodadaLigaSuica && (f.home.id === jogador.clubeId || f.away.id === jogador.clubeId));
            if (fixture) {
                fixture.golsHome = fixture.home.id === jogador.clubeId ? meuGol : advGol;
                fixture.golsAway = fixture.away.id === jogador.clubeId ? meuGol : advGol;
            }
            const m = estado.tabela.find(e => e.id === jogador.clubeId);
            const a = estado.tabela.find(e => e.id === comp.adversarioId);
            if(m && a) { m.j++; a.j++; m.gf+=gc; m.gs+=gv; a.gf+=gv; a.gs+=gc; if(gc>gv) m.pts+=3; else if(gv>gc) a.pts+=3; else { m.pts+=1; a.pts+=1; } }
        }
    } else {
        let estado = copasEstado[comp.compId];
        if(estado && estado.tipo === "mata-mata" && estado.confrontos) {
            let conf = estado.confrontos.find(c => c.timeA.id === jogador.clubeId || c.timeB.id === jogador.clubeId);
            if(conf) {
                let isTimeA = conf.timeA.id === jogador.clubeId;
                if(comp.perna === 1) {
                    if(isTimeA) { conf.golsAIda = gc; conf.golsBIda = gv; } else { conf.golsBIda = gc; conf.golsAIda = gv; }
                    if(comp.isFinal || estado.jogoUnico || (estado.fase.includes("Final") && estado.pernasFinal !== 2)) {
                        const fA = clubes.find(c=>c.id===conf.timeA.id)?.reputacao || 70;
                        const fB = clubes.find(c=>c.id===conf.timeB.id)?.reputacao || 70;
                        const res = await resolverVencedorMataMataComPenaltisInterativos(conf.timeA.id, conf.timeB.id, isTimeA ? gc : gv, isTimeA ? gv : gc, fA, fB, jogador.clubeId);
                        conf.vencedorId = res.vencedorId; conf.penaltis = res.penaltis;
                        if (conf.vencedorId === jogador.clubeId) {
                            let nomeCop = competicoes.find(c=>c.id === comp.compId)?.nome || "Copa";
                            let meuC = clubes.find(c=>c.id===jogador.clubeId);
                            dispararAnimacaoCampeao(meuC.nome, nomeCop, obterUrlImagem(meuC, 'clube'));
                        }
                    }
                } 
                else {
                    if(isTimeA) { conf.golsAVolta = gc; conf.golsBVolta = gv; } else { conf.golsBVolta = gc; conf.golsAVolta = gv; }
                    let aggA = (conf.golsAIda||0) + (conf.golsAVolta||0); let aggB = (conf.golsBIda||0) + (conf.golsBVolta||0);
                    const fA = clubes.find(c=>c.id===conf.timeA.id)?.reputacao || 70;
                    const fB = clubes.find(c=>c.id===conf.timeB.id)?.reputacao || 70;
                    const res = await resolverVencedorMataMataComPenaltisInterativos(conf.timeA.id, conf.timeB.id, aggA, aggB, fA, fB, jogador.clubeId);
                    conf.vencedorId = res.vencedorId; conf.penaltis = res.penaltis;
                    if (conf.vencedorId === jogador.clubeId && (estado.fase.includes("Final") || comp.isFinal)) {
                        let nomeCop = competicoes.find(c=>c.id === comp.compId)?.nome || "Copa";
                        let meuC = clubes.find(c=>c.id===jogador.clubeId);
                        dispararAnimacaoCampeao(meuC.nome, nomeCop, obterUrlImagem(meuC, 'clube'));
                    }
                }
            }
        }
    }
}

// ==========================================
// MODE SELECTION EVENT HANDLERS
// ==========================================

document.getElementById("btnModoOffline")?.addEventListener("click", () => {
    // Check for existing save
    if (carregarJogo()) {
        mudarTela("view-hub");
    } else {
        mudarTela("telaCriacao");
    }
});

document.getElementById("btnModoOnline")?.addEventListener("click", () => {
    // Initialize online mode
    if (window.firebaseIntegration && window.firebaseIntegration.initializeOnlineMode()) {
        // Check for existing save
        if (carregarJogo()) {
            mudarTela("view-hub");
            mudarTela("view-amigos");
        } else {
            mudarTela("telaCriacao");
        }
    }
});

// ==========================================
// FRIENDS LOBBY EVENT HANDLERS
// ==========================================

document.getElementById("btnCopyCode")?.addEventListener("click", () => {
    const code = document.getElementById("myFriendCode").textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert("Código copiado para a área de transferência!");
    });
});

document.getElementById("btnConnectFriend")?.addEventListener("click", () => {
    const friendCode = document.getElementById("inputFriendCode").value.toUpperCase().trim();
    if (friendCode.length === 6) {
        if (window.firebaseIntegration) {
            window.firebaseIntegration.connectWithFriend(friendCode);
        }
    } else {
        alert("Código inválido. Deve ter 6 caracteres.");
    }
});

document.getElementById("btnToggleReady")?.addEventListener("click", () => {
    if (window.firebaseIntegration) {
        window.firebaseIntegration.toggleReadyStatus();
    }
});

document.getElementById("btnCancelarReconexao")?.addEventListener("click", () => {
    if (window.firebaseIntegration) {
        window.firebaseIntegration.cancelReconnection();
    }
});

// New Game Flow Architecture
window.gameMode = null; // 'player' or 'manager'
window.connectionMode = null; // 'offline' or 'online'
window.currentRoomId = null;
window.isHost = false;
window.lobbyPlayerId = null;

document.getElementById("btnModoJogador")?.addEventListener("click", () => {
    window.gameMode = 'player';
    configurarNavegacaoPorModo();
    mudarTela("telaConexao");
});

document.getElementById("btnModoManager")?.addEventListener("click", () => {
    window.gameMode = 'manager';
    window.connectionMode = 'offline';
    configurarNavegacaoPorModo();
    mudarTela("telaCriacaoManager");
    renderizarListaClubesCriacaoManager();
});

document.getElementById("btnVoltarCriacaoManager")?.addEventListener("click", () => {
    window.gameMode = null;
    window.clubeEscolhidoManagerCriacao = null;
    mudarTela("telaModo");
});

// 🏟️ Lista de clubes pra escolher qual vai treinar — filtra por nome ou país
// (usa o nome da liga como aproximação de país/competição).

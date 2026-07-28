window.toggleSidebarMobile = function() {
    document.querySelector(".dashboard-layout")?.classList.toggle("sidebar-aberta-mobile");
};
window.fecharSidebarMobile = function() {
    document.querySelector(".dashboard-layout")?.classList.remove("sidebar-aberta-mobile");
};

document.addEventListener("click", function(event) {
    const btn = event.target.closest(".menu-item");
    if (btn) {
        // Os atalhos do menu Manager apontam para subabas da própria central,
        // evitando que Tática, Elenco e Mercado pareçam telas do modo Jogador.
        if (btn.dataset.managerTab) window.managerAbaAtiva = btn.dataset.managerTab;
        document.querySelectorAll(".menu-item").forEach(item => item.classList.remove("ativo")); btn.classList.add("ativo");
        document.querySelectorAll(".view-section").forEach(aba => { aba.classList.add("oculto"); aba.style.display = "none"; });
        const elDest = document.getElementById(btn.dataset.view);
        if (elDest) {
            elDest.classList.remove("oculto"); elDest.style.display = "block";
            // Ao entrar em qualquer secção que não seja de exploração livre de
            // outras competições, repõe sempre o fundo da competição atual do jogador.
            if (!VIEWS_EXPLORACAO_LIVRE.includes(btn.dataset.view) && typeof restaurarTemaJogadorAtual === 'function') {
                restaurarTemaJogadorAtual();
            }
            atualizarConteudoAbaAtiva();
        }
        // 🆕 No mobile, a sidebar é uma gaveta — escolher uma seção deve fechá-la
        // automaticamente (senão o conteúdo fica escondido atrás do menu aberto).
        fecharSidebarMobile();
    }
});
document.addEventListener("change", function(event) {
    if (event.target.tagName.toLowerCase() === "select") { if (typeof atualizarConteudoAbaAtiva === 'function') atualizarConteudoAbaAtiva(); }
});

// Atalho "Minha Tabela": salta a navegação manual do menu lateral e leva o
// jogador diretamente para a tabela de classificação da SUA liga atual.
window.abrirMinhaTabela = function() {
    if (!jogador) { if (typeof mostrarToast === 'function') mostrarToast("Aviso", "Nenhuma carreira ativa encontrada.", "warning"); return; }
    const meuClube = clubes.find(c => c.id === jogador.clubeId);
    if (!meuClube || !meuClube.ligaId) {
        if (typeof mostrarToast === 'function') mostrarToast("Sem liga", "O teu clube ainda não está associado a uma liga.", "warning");
        return;
    }
    const ligaId = meuClube.ligaId;

    // Navega diretamente para a secção de Tabelas, sem passar pela navegação
    // manual do menu lateral (país -> divisão -> liga).
    document.querySelectorAll(".menu-item").forEach(item => item.classList.remove("ativo"));
    document.querySelector('.menu-item[data-view="view-classificacao"]')?.classList.add("ativo");
    document.querySelectorAll(".view-section").forEach(aba => { aba.classList.add("oculto"); aba.style.display = "none"; });
    const elDest = document.getElementById("view-classificacao");
    if (!elDest) return;
    elDest.classList.remove("oculto"); elDest.style.display = "block";

    if (typeof inicializarInterfaceTabelasClean === 'function') inicializarInterfaceTabelasClean();

    const gridPaises = document.getElementById("paises-grid");
    const divisoesCtx = document.getElementById("divisoes-container");
    const localTabela = document.getElementById("areaTabelaEspecifica");
    if (!gridPaises || !divisoesCtx || !localTabela) return;

    const prefix = obterPaisCompeticaoId(ligaId);
    const compsDoPais = competicoes.filter(c => (c.tipo === "liga" || c.tipo === "liga_grupos" || c.tipo === "liga_conferencias" || c.tipo === "mata_mata" || c.tipo === "acesso_playoff" || c.tipo === "playoffs" || c.tipo === "copa" || c.tipo === "supercopa" || c.tipo === "estadual") && obterPaisCompeticaoId(c.id) === prefix)
        .sort((a,b) => { const peso = { liga: 0, liga_grupos: 0, liga_conferencias: 0, mata_mata: 1, acesso_playoff: 1, playoffs: 1, copa: 2, supercopa: 3, estadual: 4 }; return (peso[a.tipo] ?? 9) - (peso[b.tipo] ?? 9) || (a.div || 99) - (b.div || 99) || a.nome.localeCompare(b.nome); });

    gridPaises.querySelectorAll(".btn-pais-filtro").forEach(b => b.classList.toggle("ativo", b.dataset.prefix === prefix));

    const infoPaisBtn = gridPaises.querySelector(`.btn-pais-filtro[data-prefix="${prefix}"]`);
    const infoPais = { nome: infoPaisBtn?.querySelector(".pais-label")?.textContent || prefix, prefix };
    renderizarSubdivisoesPais(compsDoPais, divisoesCtx, localTabela, infoPais);

    // Garante que a divisão/liga ativa é exatamente a do jogador (mesmo que
    // não seja a primeira divisão do país) e mostra a tabela correspondente.
    const btnDivAlvo = divisoesCtx.querySelector(`.btn-divisao[data-comp-id="${ligaId}"]`);
    if (btnDivAlvo) {
        divisoesCtx.querySelectorAll(".btn-divisao").forEach(b => b.classList.remove("ativo"));
        btnDivAlvo.classList.add("ativo");
    }
    exibirTabelaLigaCodigo(ligaId, localTabela);

    elDest.scrollIntoView({ behavior: "smooth", block: "start" });
};
document.getElementById("btnMinhaTabela")?.addEventListener("click", () => {
    if (typeof abrirMinhaTabela === 'function') abrirMinhaTabela();
});

// ==========================================
// ⚙️ INÍCIO, PARTIDAS E BOTÕES MESTRES
// ==========================================

// Botão "JOGAR" do menu principal - apenas navega para a seleção de modo
document.getElementById("btnJogar")?.addEventListener("click", () => {
    mudarTela("telaModo");
});

// Botão "Entrar em Relvado" do hub do jogo - simulação de partida
// 🛡️ FIX: liga a trava anti-clique-duplo/duplicação de partida, com uma REDE
// DE SEGURANÇA — se por qualquer motivo (bug não previsto, aba em segundo
// plano, etc.) ela nunca for liberada normalmente por atualizarHub(), este
// timer solta-a sozinha depois de 6 minutos, para nunca deixar o jogador
// travado no botão "Entrar em Relvado" para sempre.
window.ativarPartidaEmAndamento = function() {
    window.partidaEmAndamento = true;
    clearTimeout(window._watchdogPartidaEmAndamento);
    window._watchdogPartidaEmAndamento = setTimeout(() => {
        if (window.partidaEmAndamento) {
            console.warn("Rede de segurança: a libertar 'partidaEmAndamento' presa há demasiado tempo.");
            window.partidaEmAndamento = false;
        }
    }, 6 * 60 * 1000);
};

document.getElementById("btnJogarHub")?.addEventListener("click", async () => {
    // 🛡️ FIX: impede que a partida/rodada seja iniciada DUAS VEZES ao mesmo
    // tempo (ex: clique duplo por impaciência, ou o retry automático do
    // sistema de "pronto" disparando junto com um clique manual). Sem isto,
    // no modo online isso podia criar duas simulações em paralelo — cada uma
    // a transmitir os seus próprios eventos para o Firebase — resultando numa
    // partida "bugada" que parecia nunca acabar e com estatísticas duplicadas.
    if (window.partidaEmAndamento) {
        console.warn("Ignorado: já existe uma partida/rodada em processamento.");
        return;
    }
    // 🎽➡️👔 Jogador aposentado: o botão vira atalho pro Hall da Fama em vez
    // de tentar simular uma partida que não existe mais para ele.
    if (window.gameMode !== "manager" && jogador?.aposentado) {
        document.querySelector('[data-view="view-historico"]')?.click();
        return;
    }
    window.ativarPartidaEmAndamento();
    try {
        // In-game hub - proceed with match simulation
        inicializarEstadoCarreiraJogador();

        // 🌐 MUNDO COMPARTILHADO: sistema de "pronto" — ambos começam a rodada
        // exatamente ao mesmo tempo. Só avança quando o amigo também estiver pronto.
        if (window.connectionMode === 'online') {
            const pronto = await window.aguardarSincronizacaoRodada('btnJogarHub');
            if (!pronto) { window.partidaEmAndamento = false; return; }
        }

        let comp = agendaTemporada[rodadaAtual - 1];
        let textoBtn = document.getElementById("btnJogarHub").innerText.toLowerCase();

        // Check if in online room mode and handle ready state
        if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode() && window.firebaseIntegration.getRoomId()) {
            if (textoBtn.includes("gala")) {
                await window.processarFimTemporadaOnline();
                return;
            }

            if (!textoBtn.includes("avançar semana") && comp) {
                // Set ready for match and wait for room sync
                window.firebaseIntegration.setReadyForMatch(true);
                mostrarToast("Sala Online", "Aguardando amigo para simular partida...", "info");
                document.getElementById("btnJogarHub").disabled = true;
                document.getElementById("btnJogarHub").innerText = "Aguardando...";
                return;
            }
        }

        if (textoBtn.includes("avançar semana")) {
            await window.simularRodadaMundialOnline(); rodadaAtual++; window.salvarJogo(); atualizarHub();
            mostrarToast("Simulação", "Semana global avançada com sucesso.", "info");
            return;
        } else if (textoBtn.includes("gala")) {
            await window.processarFimTemporadaOnline();
            return;
        } else if (textoBtn.includes("descanso") && comp.isFolga) {
            // Handle bye week - give bonus energy recovery
            jogador.energia = Math.min(100, jogador.energia + 30);
            if(jogador.lesaoRodadas > 0) jogador.lesaoRodadas = Math.max(0, jogador.lesaoRodadas - 1);
            jogador.moral = Math.min(100, jogador.moral + 5);
            await window.simularRodadaMundialOnline(); rodadaAtual++; window.salvarJogo(); atualizarHub();
            mostrarToast("Recuperação", "Recuperaste energia e moral durante a semana de folga!", "success");
            return;
        }
        if(!comp) return;

        // VALIDATION: Check player state before match
        if (typeof jogador === 'undefined' || !jogador) {
            mostrarToast("Erro", "Dados do jogador não encontrados. Recarrega o jogo.", "danger");
            return;
        }

        if(jogador.lesaoRodadas > 0) {
            mostrarToast("Departamento Médico", `Estás lesionado por ${jogador.lesaoRodadas} semana(s). A equipa jogou sem ti.`, "warning");
            await window.simularRodadaMundialOnline(); rodadaAtual++; window.salvarJogo(); atualizarHub();
            return;
        }

        // VALIDATION: Check energy/fitness
        if (typeof jogador.energia === 'undefined' || jogador.energia === null || jogador.energia < 0) {
            jogador.energia = 100;
            console.warn("Energy was invalid, reset to 100");
        }

        const isSel = !!comp.isSelecao;
        const mandanteId = isSel ? (comp.mandanteId || jogador.selecaoId) : jogador.clubeId;
        const visitanteId = comp.adversarioId;
        
        // VALIDATION: Check opponent exists
        if (!visitanteId) {
            mostrarToast("Erro", "Adversário não encontrado. Contacta o suporte.", "danger");
            return;
        }

        const advPre = isSel ? SELECOES.find(s => s.id === visitanteId) : clubes.find(c => c.id === visitanteId);
        if (!advPre) {
            mostrarToast("Erro", "Dados do adversário não encontrados.", "danger");
            return;
        }

        // VALIDATION: Check Manager Mode starting XI
        if (window.managerState && window.managerState.ativo) {
            // Ensure valid starting XI is set
            if (!window.managerState.táticas || !window.managerState.táticas.formação) {
                mostrarToast("Erro", "Formação não definida. Configura as tuas táticas.", "warning");
                return;
            }
        }

        // Contexto do confronto (clássico, jogo grande, forma, novo técnico...) usado nas entrevistas e na escalação.
        const contextoJogo = avaliarContextoJogo(comp, advPre, isSel);
        // Escalação: seleção sempre chama o jogador como titular; no clube, a comissão técnica decide.
        const escalacao = isSel ? { statusAtual: "titular", minutoEntrada: null, entra: true } : decidirEscalacaoJogador();
        if(!isSel && contextoJogo.clube) jogador.tecnicoConhecido = contextoJogo.clube.tecnico;

        // ==========================================
        // VÍDEO/CINEMÁTICA DE ABERTURA — 1º jogo do ano de cada competição
        // continental ou internacional. Se existir um ficheiro de vídeo local
        // em assets/intros/{compId}.mp4 ele é tocado; caso contrário (ou se
        // falhar/não existir), cai automaticamente para uma cinemática animada
        // gerada no próprio jogo (logo real da competição + cores oficiais).
        // ==========================================
        const COMPETICOES_COM_INTRO = new Set([
            "uefa_cl", "uefa_el", "uefa_col", "conmebol_lib", "conmebol_sul", "concacaf_clc", "afc_cla", "afc_cla2",
            "copa_mundo", "euro", "copa_america", "olimpiadas", "gold_cup", "copa_africa", "copa_asia",
            "mundial_sub17", "mundial_sub21"
        ]);

        function precisaIntroCompeticao(compAtual) {
            const compId = compAtual?.compId || compAtual?.compConfigId;
            if (!compId || !COMPETICOES_COM_INTRO.has(compId)) return null;
            const chave = `${compId}_${anoAtual}`;
            if (introsExibidas[chave]) return null;
            return { compId, chave };
        }

        function exibirIntroCompeticao(compId, chave, onFinish) {
            introsExibidas[chave] = true;
            window.salvarJogo();
            // 🛡️ FIX: competições de SELEÇÃO (Copa do Mundo, Euro, Sub-17...) não
            // vivem no array "competicoes" (esse é só de clubes) — sem este
            // fallback, a intro delas aparecia sem nome nem logo nenhum.
            const compInfo = competicoes.find(c => c.id === compId)
                || COMPETICOES_SELECOES.find(c => c.id === compId)
                || COMPETICOES_SELECOES_BASE.find(c => c.id === compId);
            const cor = CORES_COMP?.[compId] || "#facc15";

            let overlay = document.getElementById("introCompeticaoOverlay");
            if (!overlay) { overlay = document.createElement("div"); overlay.id = "introCompeticaoOverlay"; document.body.appendChild(overlay); }
            overlay.className = "intro-comp-overlay";
            overlay.innerHTML = `
                <video id="introCompeticaoVideo" class="intro-comp-video oculto" playsinline></video>
                <div class="intro-comp-fallback" id="introCompeticaoFallback">
                    <div class="intro-comp-rays" style="--intro-cor:${cor};"></div>
                    ${compInfo?.logo ? `<img loading="lazy" decoding="async" src="${compInfo.logo}" class="intro-comp-logo" onerror="this.style.display='none'">` : ""}
                    <h1 class="intro-comp-title" style="--intro-cor:${cor};">${compInfo?.nome || ""}</h1>
                    <p class="intro-comp-sub">Temporada ${anoAtual}</p>
                </div>
                <button class="intro-comp-skip" onclick="window.pularIntroCompeticao()">Pular ⏭</button>`;
            overlay.classList.remove("oculto");

            // 🛡️ FIX: guarda todos os timers pendentes da intro para poder
            // cancelá-los assim que ela terminar (por vídeo, por "Pular" ou por
            // fallback) — antes, um timer "esquecido" podia disparar segundos
            // depois, já com a partida seguinte em curso, mexendo no overlay ou
            // relançando o callback de início de partida por engano. Isso é o
            // suspeito mais provável para "as próximas partidas ficam bugadas
            // depois da intro".
            const timersIntro = [];
            let terminou = false;
            const finalizar = () => {
                if (terminou) return;
                terminou = true;
                timersIntro.forEach(t => clearTimeout(t));
                const v = document.getElementById("introCompeticaoVideo");
                if (v) { v.onended = null; v.onerror = null; v.onloadeddata = null; v.pause(); v.src = ""; }
                overlay.remove(); // 🛡️ remove do DOM por completo, não só esconde — zero estado residual
                onFinish();
            };
            window.pularIntroCompeticao = finalizar;

            const videoEl = document.getElementById("introCompeticaoVideo");
            const fallbackEl = document.getElementById("introCompeticaoFallback");
            const usarFallback = () => {
                if (terminou) return; // 🛡️ nunca reagir depois de já ter terminado
                fallbackEl.classList.remove("oculto"); videoEl.classList.add("oculto");
                timersIntro.push(setTimeout(finalizar, 4200));
            };
            videoEl.src = `assets/intros/${compId}.mp4`;
            videoEl.onerror = usarFallback;
            videoEl.onended = finalizar;
            videoEl.onloadeddata = () => {
                if (terminou) return;
                videoEl.classList.remove("oculto"); fallbackEl.classList.add("oculto");
                // 🔊 FIX: o vídeo estava sempre mudo (atributo "muted" fixo no
                // HTML) — por isso "o som não sai". Agora tenta tocar COM som;
                // se o navegador bloquear autoplay com áudio (política comum
                // de browsers sem interação prévia do utilizador), tenta de
                // novo mudo em vez de simplesmente desistir do vídeo inteiro.
                videoEl.muted = false;
                videoEl.play().catch(() => {
                    videoEl.muted = true;
                    videoEl.play().catch(usarFallback);
                });
            };
            // Se não existir ficheiro local nenhum, o navegador não dispara onloadeddata
            // nem sempre onerror rapidamente — este timeout garante que a cinemática
            // animada aparece de qualquer forma, sem travar o jogador numa tela preta.
            timersIntro.push(setTimeout(() => { if (!terminou && videoEl.readyState === 0) usarFallback(); }, 900));
        }

        // Função que efetivamente arranca a partida (só é chamada depois de fechadas
        // a conversa com o técnico e a eventual entrevista pré-jogo, evitando que
        // tudo apareça sobreposto e a simulação já ande enquanto o modal está aberto).
        function iniciarSimulacaoAoVivo() {
            const introInfo = precisaIntroCompeticao(comp);
            if (introInfo) { exibirIntroCompeticao(introInfo.compId, introInfo.chave, iniciarSimulacaoAoVivoReal); return; }
            iniciarSimulacaoAoVivoReal();
        }
        function iniciarSimulacaoAoVivoReal() {
            let mP = document.getElementById("modalPartida"); if(mP) mP.classList.remove("oculto");
            const minutoEntradaJogador = escalacao.statusAtual === "titular" ? null : (escalacao.entra ? escalacao.minutoEntrada : 999);

            // 🌐 CONFRONTO DIRETO ONLINE: quando o adversário desta partida é
            // exatamente o clube do amigo online, os dois assistem ao MESMO
            // jogo em tempo real. Um dos dois (determinado de forma
            // determinística, sem negociação) corre o motor de verdade e
            // transmite cada evento; o outro só reproduz o que chega.
            // Cobre dois casos: (a) os clubes são rivais e se enfrentam esta rodada,
            // ou (b) vocês estão no MESMO clube — nesse caso, toda partida do
            // clube é vivida pelos dois ao mesmo tempo (um joga, o outro assiste).
            const mesmoClubeQueAmigo = !isSel && window.connectionMode === 'online' && window.onlinePartnerClubeId && jogador.clubeId === window.onlinePartnerClubeId;
            const enfrentandoAmigo = !isSel && window.connectionMode === 'online' && window.onlinePartnerClubeId && visitanteId === window.onlinePartnerClubeId;
            const ehConfrontoDiretoOnline = (mesmoClubeQueAmigo || enfrentandoAmigo) && !!window.onlinePartnerId;
            const souHostConfronto = ehConfrontoDiretoOnline && window.lobbyPlayerId < window.onlinePartnerId;
            const matchKeyConfronto = ehConfrontoDiretoOnline ? `${[window.lobbyPlayerId, window.onlinePartnerId].sort().join('_')}_r${rodadaAtual}_${anoAtual}` : null;

            let engine;
            if (ehConfrontoDiretoOnline && !souHostConfronto) {
                // Sou o "convidado" deste confronto — não simulo nada, só assisto
                // em tempo real ao que o meu amigo está a jogar.
                const meuClubeObj = clubes.find(c => c.id === mandanteId);
                const advClubeObj = clubes.find(c => c.id === visitanteId);
                engine = {
                    isSelecao: false,
                    clubeMandanteId: mandanteId,
                    clubeVisitanteId: visitanteId,
                    nomeMandante: meuClubeObj?.nome || "Mandante",
                    nomeVisitante: advClubeObj?.nome || "Visitante",
                    simularPartidaAoVivo(onTick, onComplete) {
                        window.firebaseIntegration.assistirTransmissaoPartida(matchKeyConfronto, {
                            // Se somos rivais, o anfitrião trata-se como "mandante" no motor
                            // dele, então o MEU placar é o dele invertido. Se somos do MESMO
                            // clube, é exatamente o mesmo jogo — nada a inverter.
                            onTick: (min, gcHost, gvHost, log) => {
                                if (mesmoClubeQueAmigo) onTick(min, gcHost, gvHost, log);
                                else onTick(min, gvHost, gcHost, log);
                            },
                            onFinal: (dados) => {
                                const minhasGc = mesmoClubeQueAmigo ? dados.gc : dados.gv;
                                const minhasGv = mesmoClubeQueAmigo ? dados.gv : dados.gc;
                                const minutosJogadosMeus = escalacao.statusAtual === "titular" ? 90 : (escalacao.entra ? Math.max(0, 90 - escalacao.minutoEntrada) : 0);
                                onComplete(minhasGc, minhasGv, [], minutosJogadosMeus > 0, minutosJogadosMeus);
                            }
                        });
                    }
                };
            } else {
                engine = new MatchEngine(jogador, mandanteId, visitanteId, minutoEntradaJogador);
                if (ehConfrontoDiretoOnline && souHostConfronto) {
                    window.firebaseIntegration.limparTransmissaoPartida?.(matchKeyConfronto);
                }
            }

            if(isSel) {
                engine.isSelecao = true;
                const selM = SELECOES.find(s => s.id === mandanteId);
                const selV = SELECOES.find(s => s.id === visitanteId);
                if(selM) { engine.nomeMandante = selM.nome; engine.forcaMandante = calcularForcaSelecao(selM.id); }
                if(selV) { engine.nomeVisitante = selV.nome; engine.forcaVisitante = calcularForcaSelecao(selV.id); }
            }
            let casaObj = isSel ? SELECOES.find(s => s.id === mandanteId) : (clubes.find(c => c.id === engine.clubeMandanteId) || engine.nomeMandante);
            let visitaObj = isSel ? SELECOES.find(s => s.id === visitanteId) : (clubes.find(c => c.id === engine.clubeVisitanteId) || engine.nomeVisitante);

            let imgC = document.getElementById("imgTimeCasa"); if(imgC) imgC.src = isSel ? (casaObj?.logo || "") : obterUrlImagem(casaObj, 'clube');
            let imgV = document.getElementById("imgTimeVisita"); if(imgV) imgV.src = isSel ? (visitaObj?.logo || "") : obterUrlImagem(visitaObj, 'clube');
            setText("placarTimeCasa", engine.nomeMandante); setText("placarTimeVisita", engine.nomeVisitante);
            setText("placarMarcadorCasa", "0"); setText("placarMarcadorVisita", "0"); setText("uiMinutoJogo", "0'");
            // Inicializa a transmissão tática opcional para o Modo Jogador.
            // Os mesmos callbacks abaixo atualizam relato, placar e mini-campo.
            // 🎛️ Referência do motor em andamento para os botões de velocidade
            // (1x/2x/4x/8x) e play/pause da transmissão tática — eles só
            // reagendam o intervalo do tick (ver definirVelocidade/pausar/
            // retomar em match.js), nunca mexem no resultado da partida.
            window.engineAoVivo = engine;
            window.prepararVisualizacaoPartida(engine.nomeMandante, engine.nomeVisitante, isSel ? null : engine.clubeMandanteId, isSel ? null : engine.clubeVisitanteId);
            const avisoEscalacao = ehConfrontoDiretoOnline
                ? "🌐 Confronto direto! Tu e o teu amigo estão a assistir a este jogo ao mesmo tempo."
                : (escalacao.statusAtual === "titular" ? "⚽ O árbitro apita para o início do jogo!"
                : (escalacao.statusAtual === "banco" ? "🪑 Começas no banco. Aguarda a tua oportunidade..." : "🪑 Não estás nos relacionados de hoje para entrar em campo."));
            // 📋 A Central da Partida (feed/estatísticas/elenco) já foi montada
            // por prepararVisualizacaoPartida logo acima; aqui só troca o card
            // de "apito inicial" genérico por um aviso específico do teu status
            // nesta escalação (titular/banco/fora), como o antigo texto fazia.
            const cpListaInicial = document.getElementById("cpEventosList");
            if (cpListaInicial) cpListaInicial.innerHTML = `<div class="cp-event cp-event-kickoff"><span class="cp-event-min">0'</span><div class="cp-event-main"><span class="cp-event-body">${avisoEscalacao}</span></div></div>`;

            let _ultimoMin = 0, _ultimoGc = 0, _ultimoGv = 0;
            engine.simularPartidaAoVivo((min, gc, gv, log, snapshot) => {
                _ultimoMin = min; _ultimoGc = gc; _ultimoGv = gv;

                // 🌐 Sinais especiais de "pênalti em curso" vindos do amigo que está a
                // jogar (não são eventos reais de jogo — nunca aparecem no log nem
                // fazem soar apitos/golos). Mostram/escondem um aviso para quem está
                // só a assistir, para não parecer que o jogo travou sem motivo.
                if (log === "__PENALTY_WAIT__") {
                    let banner = document.getElementById("avisoPenaltiAmigo");
                    if (!banner) {
                        banner = document.createElement("div");
                        banner.id = "avisoPenaltiAmigo";
                        banner.style.cssText = "background:rgba(250,204,21,0.15); border:1px solid #facc15; color:#facc15; font-weight:800; text-align:center; padding:10px; border-radius:8px; margin-bottom:8px;";
                        banner.textContent = "⏳ O seu amigo está a bater/defender um pênalti... aguarde a cobrança!";
                        document.getElementById("cpEventosList")?.prepend(banner);
                    }
                    return;
                }
                if (log === "__PENALTY_RESUME__") {
                    document.getElementById("avisoPenaltiAmigo")?.remove();
                    return;
                }

                if (ehConfrontoDiretoOnline && souHostConfronto) {
                    window.firebaseIntegration.transmitirTick(matchKeyConfronto, { min, gc, gv, log: log || "" });
                }
                if (min <= 1) window.tocarSom('apito_inicio'); // 🔊 apito inicial, só uma vez no começo
                setText("uiMinutoJogo", `${min}'`); setText("placarMarcadorCasa", gc); setText("placarMarcadorVisita", gv);
                window.atualizarVisualizacaoPartida(min, log || "Bola em jogo", gc, gv);
                if (log) {
                    // 🔊 Detecção do "é meu gol" prioriza o snapshot estruturado
                    // (jogadorId === "player", sempre confiável); só cai para o
                    // texto quando não há snapshot (espectador online, que só
                    // recebe o log puro via Firebase).
                    const meuGol = snapshot ? (snapshot.evento?.tipo === "gol" && snapshot.evento?.jogadorId === "player") : (log.includes("É SEU") || log.includes(jogador.nome));
                    const golTime = !meuGol && (log.includes("GOLO") || log.includes("GOL"));
                    if (meuGol || golTime) window.tocarSom('gol', meuGol ? 0.7 : 0.5); // 🔊 som de gol (mais forte se for teu)
                }
                window.atualizarCentralPartida(min, log, snapshot);
            }, (gc, gv, marcadores, entrouEmCampo, minutosJogados) => {
                try {
                    window.tocarSom('apito_fim'); // 🔊 apito final
                    if (ehConfrontoDiretoOnline && souHostConfronto) {
                        window.firebaseIntegration.finalizarTransmissaoPartida(matchKeyConfronto, { gc, gv });
                    }
                    const fatorParticipacao = Math.max(0, Math.min(1, (minutosJogados ?? 90) / 90));
                    jogador.energia = Math.max(0, jogador.energia - Math.max(3, Math.round(25 * fatorParticipacao)));
                    const meuTimeId = isSel ? jogador.selecaoId : jogador.clubeId;
                    const souMandante = engine.clubeMandanteId === meuTimeId;
                    let pGolo = ({ "Atacante":0.65, "Ponta":0.48, "Meia Ofensivo":0.34, "Meio-Campista":0.22, "Volante":0.10, "Lateral":0.08, "Zagueiro":0.05, "Goleiro":0.01 })[jogador.posicao] ?? 0.25;
                    let pAssist = ({ "Atacante":0.25, "Ponta":0.42, "Meia Ofensivo":0.58, "Meio-Campista":0.50, "Volante":0.26, "Lateral":0.32, "Zagueiro":0.08, "Goleiro":0.02 })[jogador.posicao] ?? 0.25;
                    // ⚙️ Atributos individuais (finalização/passe) escalam estas chances
                    // continuamente, em vez de um bônus fixo só para quem tem OVR≥84.
                    pGolo = Math.min(0.9, pGolo * fatorAtributoIndividual(jogador, "finalizacao"));
                    pAssist = Math.min(0.9, pAssist * fatorAtributoIndividual(jogador, "passe"));

                    let golosAAtribuir = entrouEmCampo ? Math.max(0, Math.floor((souMandante ? gc : gv) * fatorParticipacao)) : 0;
                    let golsJogadorPartida = 0; let assistsJogadorPartida = 0;

                    // Track stats separately for club vs international
                    if(!isSel) {
                        if(entrouEmCampo) jogador.estatisticasAtuais.jogos++;
                        if(!jogador.estatisticasAtuais.assistencias) jogador.estatisticasAtuais.assistencias = 0;
    if(!jogador.estatisticasAtuais.defesas) jogador.estatisticasAtuais.defesas = 0;
                        // 🛡️ FIX: estatísticas defensivas REAIS para quando TU és
                        // defensor/goleiro (antes só existiam para NPCs via fórmula
                        // inventada — agora também acumulas de verdade).
                        if (entrouEmCampo && ["Zagueiro","Lateral","Goleiro"].includes(jogador.posicao)) {
                            const golsSofridosNoJogo = souMandante ? gv : gc;
                            if(!jogador.estatisticasAtuais.desarmes) jogador.estatisticasAtuais.desarmes = 0;
                            if(!jogador.estatisticasAtuais.interceptacoes) jogador.estatisticasAtuais.interceptacoes = 0;
                            if(!jogador.estatisticasAtuais.jogosSemSofrerGol) jogador.estatisticasAtuais.jogosSemSofrerGol = 0;
                            const fatorOvr = Math.max(0, (jogador.geral - 58)) / 100;
                            if (jogador.posicao === "Goleiro") {
                                const fatorReflexos = fatorAtributoIndividual(jogador, "reflexos");
                                jogador.estatisticasAtuais.defesas += Math.max(0, Math.round(((1.5 + fatorOvr * 3.2) * fatorReflexos + Math.random() * 2 - golsSofridosNoJogo * 0.3) * fatorParticipacao));
                            } else {
                                const fatorDefesa = fatorAtributoIndividual(jogador, "defesa");
                                jogador.estatisticasAtuais.desarmes += Math.round(((0.6 + fatorOvr * 2.0) * fatorDefesa + Math.random() * 1.4) * fatorParticipacao);
                                jogador.estatisticasAtuais.interceptacoes += Math.round(((0.5 + fatorOvr * 1.6) * fatorDefesa + Math.random() * 1.2) * fatorParticipacao);
                            }
                            if (golsSofridosNoJogo === 0) jogador.estatisticasAtuais.jogosSemSofrerGol++;
                        }
                        if(golosAAtribuir > 0) { for(let i=0; i<golosAAtribuir; i++) { if(Math.random() < pGolo) { jogador.estatisticasAtuais.gols++; golsJogadorPartida++; } else if(Math.random() < pAssist) { jogador.estatisticasAtuais.assistencias++; assistsJogadorPartida++; } } }
                        if(entrouEmCampo) registrarEstatisticaCompeticao(jogador, comp.compId, 1, golsJogadorPartida, assistsJogadorPartida);
                    } else {
                        // 🛡️ FIX: NÃO incrementa jogador.statsSelecao aqui — isso já é
                        // feito uma única vez em resolverLogicaPosPartida() via
                        // atualizarStatsSelecao(). Incrementar nos dois lugares
                        // duplicava jogos/gols/assistências da seleção a cada partida.
                        if(golosAAtribuir > 0) {
                            for(let i=0; i<golosAAtribuir; i++) {
                                if(Math.random() < pGolo) { golsJogadorPartida++; }
                                else if(Math.random() < pAssist) { assistsJogadorPartida++; }
                            }
                        }
                    }

                    const { recorde: recordePessoal, nota: notaPartida } = registrarMelhorAtuacao(golsJogadorPartida, assistsJogadorPartida, advPre?.nome || comp.adversarioId);
                    if(golsJogadorPartida > 0) registrarNoticia(isSel ? "Destaque na seleção" : "Protagonista da partida", `${jogador.nome} marcou ${golsJogadorPartida} gol(s)${isSel ? " pela seleção" : " e saiu em destaque no relato ao vivo"}.`, isSel ? "Seleção" : "Partida", { nome: jogador.nome, foto: jogador.foto }, "jogador");
                    else if(assistsJogadorPartida > 0) registrarNoticia("Grande atuação", `${jogador.nome} deu ${assistsJogadorPartida} assistência(s)${isSel ? " pela seleção" : " e foi um dos destaques do jogo"}.`, isSel ? "Seleção" : "Partida", { nome: jogador.nome, foto: jogador.foto }, "jogador");
                    if(recordePessoal) registrarNoticia("Melhor atuação da carreira", `${jogador.nome} bateu a própria marca pessoal em campo.`, "Números", { nome: jogador.nome, foto: jogador.foto }, "jogador");
                    // 🆕 XP de fim de partida: só quem realmente entrou em campo ganha,
                    // e quanto melhor a nota da atuação, mais XP.
                    if(entrouEmCampo) concederXPPorDesempenho(notaPartida, golsJogadorPartida, assistsJogadorPartida);
                    
                    // Allow training after playing a match
                    if(entrouEmCampo) {
                        jogador.jogouPartidaDesdeUltimoTreino = true;
                        jogador.treinosHoje = 0; // Reset training counter for new match
                        
                        // Decrease interview buff duration after match
                        if(jogador.buffEntrevista && jogador.buffEntrevista.expiresAfter > 0) {
                            jogador.buffEntrevista.expiresAfter--;
                            if(jogador.buffEntrevista.expiresAfter <= 0) {
                                delete jogador.buffEntrevista;
                            }
                        }
                    }

                    let msgBtn = document.getElementById("btnFecharModalPartida");
                    if(msgBtn) {
                        msgBtn.classList.remove("oculto");
                        msgBtn.onclick = async () => {
                            try {
                                msgBtn.classList.add("oculto"); if(mP) mP.classList.add("oculto");
                                await resolverLogicaPosPartida(comp, gc, gv, golsJogadorPartida, assistsJogadorPartida);

                                const meusGols = souMandante ? gc : gv; const golsSofridos = souMandante ? gv : gc;
                                if(!isSel) registrarFormaResultado(meusGols > golsSofridos ? "V" : (meusGols === golsSofridos ? "E" : "D"));

                                let participouBem = golosAAtribuir > 0 || (meusGols > golsSofridos);
                                if(!isSel) {
                                    if(!entrouEmCampo) ajustarTitularidade(-4); // ficar fora do jogo custa espaço no plantel
                                    else ajustarTitularidade(participouBem ? (escalacao.statusAtual === "banco" ? 7 : 4) : -3);
                                }
                                jogador.moral = Math.max(0, Math.min(100, jogador.moral + (entrouEmCampo ? (participouBem ? 4 : -3) : -1)));

                                // Entrevista pós-jogo: escolhe o tipo mais adequado ao contexto do resultado.
                                let tipoPos = "pos", chancePos = 0.25;
                                if(recordePessoal) { tipoPos = "pos_recorde"; chancePos = 0.6; }
                                else if(!isSel && contextoJogo.isClassico) { tipoPos = "pos_classico"; chancePos = 0.55; }
                                else if(golsSofridos - meusGols >= 3) { tipoPos = "pos_derrota_vexame"; chancePos = 0.65; }
                                else if(meusGols - golsSofridos >= 3 && contextoJogo.jogoGrande) { tipoPos = "pos_vitoria_grande"; chancePos = 0.6; }
                                else if(contextoJogo.jogoGrande) { chancePos = 0.4; }

                                const finalizarRodada = async () => {
                                    await window.simularRodadaMundialOnline(); rodadaAtual++; window.salvarJogo(); atualizarHub();
                                    if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode() && window.firebaseIntegration.getRoomId()) {
                                        window.firebaseIntegration.setReadyForMatch(false);
                                    }
                                };
                                if(Math.random() < chancePos) abrirEntrevista(tipoPos, { placar: `${gc}-${gv}`, adversario: contextoJogo.nomeAdversario, jogoGrande: contextoJogo.jogoGrande }, finalizarRodada);
                                else finalizarRodada();
                            } catch (error) {
                                console.error("Error processing match result:", error);
                                mostrarToast("Erro", "Erro ao processar resultado da partida.", "danger");
                            }
                        };
                    }
                } catch (error) {
                    console.error("Erro no callback pós-jogo:", error);
                }
            }, (tipo, resolverCallback) => {
                // 🎮 GAMEPLAY: pênalti interativo — chamado pelo motor quando és TU
                // quem bate ou quem defende. Mostra o mini-jogo de escolher o lado
                // e só continua a partida depois de resolveres.
                // 🌐 Se for um confronto direto online, avisa o teu amigo que estás
                // a bater/defender um pênalti, para ele não ver o jogo "congelado"
                // sem explicação enquanto tu decides o lado.
                if (ehConfrontoDiretoOnline && souHostConfronto) {
                    window.firebaseIntegration.transmitirTick(matchKeyConfronto, { min: _ultimoMin, gc: _ultimoGc, gv: _ultimoGv, log: "__PENALTY_WAIT__" });
                }
                abrirMiniJogoPenalti(tipo, (zonaEscolhida) => {
                    if (ehConfrontoDiretoOnline && souHostConfronto) {
                        window.firebaseIntegration.transmitirTick(matchKeyConfronto, { min: _ultimoMin, gc: _ultimoGc, gv: _ultimoGv, log: "__PENALTY_RESUME__" });
                    }
                    resolverCallback(zonaEscolhida);
                });
            });
        }

        // Fluxo sequencial: 1) conversa com o técnico sobre a escalação (só se mudou) →
        // 2) entrevista pré-jogo (contextual, mais provável em jogos grandes) → 3) começa a partida.
        function dispararEntrevistaPreEIniciar() {
            let tipoEsc = "pre", chance = 0.22;
            if(!isSel && contextoJogo.isClassico) { tipoEsc = "pre_classico"; chance = 0.55; }
            else if(contextoJogo.jogoGrande) { tipoEsc = "pre_grande"; chance = 0.5; }
            else if(!isSel && contextoJogo.novoTecnico) { tipoEsc = "novotecnico"; chance = 0.45; }
            else if(!isSel && contextoJogo.forma === "boa") { tipoEsc = "pre_boafase"; chance = 0.3; }
            else if(!isSel && contextoJogo.forma === "ma") { tipoEsc = "pre_mafase"; chance = 0.32; }

            if(Math.random() < chance) abrirEntrevista(tipoEsc, { adversario: contextoJogo.nomeAdversario, jogoGrande: contextoJogo.jogoGrande, tecnico: contextoJogo.nomeTecnico }, iniciarSimulacaoAoVivo);
            else iniciarSimulacaoAoVivo();
        }

        if(!isSel) conversarComTecnico(escalacao, contextoJogo, dispararEntrevistaPreEIniciar);
        else dispararEntrevistaPreEIniciar();
    } catch (outerError) {
        console.error("Erro geral no botão jogar:", outerError);
        window.partidaEmAndamento = false; // 🛡️ FIX: nunca deixa o jogador travado por causa de um erro
    }
});

document.getElementById("btnDescansar")?.addEventListener("click", async () => {
    // 🛡️ FIX: mesma guarda anti-clique-duplo/retry-duplicado do botão principal.
    if (window.partidaEmAndamento) {
        console.warn("Ignorado: já existe uma partida/rodada em processamento.");
        return;
    }
    window.ativarPartidaEmAndamento();
    try {
    inicializarEstadoCarreiraJogador();

    // 🌐 MUNDO COMPARTILHADO: mesmo sistema de "pronto" do botão principal.
    if (window.connectionMode === 'online') {
        const pronto = await window.aguardarSincronizacaoRodada('btnDescansar');
        if (!pronto) { window.partidaEmAndamento = false; return; }
    }

    let comp = agendaTemporada[rodadaAtual - 1]; 
    let textoBtn = document.getElementById("btnJogarHub").innerText.toLowerCase();
    
    if (textoBtn.includes("avançar semana")) { await window.simularRodadaMundialOnline(); rodadaAtual++; window.salvarJogo(); atualizarHub(); return; }
    if (textoBtn.includes("gala")) { await window.processarFimTemporadaOnline(); return; }
    if (!comp) return;

    let energyRecovery = 40;
    // Apply energy recovery multiplier from lifestyle upgrades
    if(jogador.lifestyle && jogador.lifestyle.multipliers.energyRecoveryMultiplier) {
        energyRecovery = Math.floor(energyRecovery * jogador.lifestyle.multipliers.energyRecoveryMultiplier);
    }
    jogador.energia = Math.min(100, jogador.energia + energyRecovery); 
    if(jogador.lesaoRodadas > 0) jogador.lesaoRodadas = Math.max(0, jogador.lesaoRodadas - 1);
    else ajustarTitularidade(-2);
    let cCasa = clubes.find(c => c.id === jogador.clubeId); let cVisita = clubes.find(c => c.id === comp.adversarioId);
    let diff = ((cCasa?.reputacao || 60) - (cVisita?.reputacao || 60)) / 20; 
    let pCasa = Math.random() + diff + 0.15; let pVisita = Math.random() - diff;
    let gc = pCasa > 0.5 ? (pCasa > 1.2 ? 3 : (pCasa > 0.8 ? 2 : 1)) : 0; let gv = pVisita > 0.6 ? (pVisita > 1.2 ? 3 : (pVisita > 0.9 ? 2 : 1)) : 0;
    
    await resolverLogicaPosPartida(comp, gc, gv);
    await window.simularRodadaMundialOnline(); 
    rodadaAtual++; 
    window.salvarJogo(); 
    atualizarHub();
    mostrarToast("Descanso", "A tua equipa jogou sem ti. Foste poupado esta rodada!", "info");
    } catch (erroDescanso) {
        console.error("Erro no botão Descansar:", erroDescanso);
        window.partidaEmAndamento = false; // 🛡️ FIX: nunca deixa o jogador travado por causa de um erro
    }
});

// Botão "Sair / Apagar Save" - apaga o progresso guardado e volta ao menu principal
document.getElementById("btnReset")?.addEventListener("click", () => {
    const confirmado = confirm("Tens a certeza que queres apagar o teu save? Esta ação é irreversível e vais perder todo o progresso da carreira.");
    if (!confirmado) return;

    try {
        localStorage.removeItem("rumo_estrelato_pro_vivo");

        // Se estiver numa sala online, sai da sala antes de recarregar
        if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode() && window.firebaseIntegration.getRoomId()) {
            window.firebaseIntegration.leaveRoom?.();
        }

        mostrarToast("Save Apagado", "O teu progresso foi apagado. A reiniciar...", "success");
        setTimeout(() => location.reload(), 800);
    } catch (error) {
        console.error("Erro ao apagar save:", error);
        mostrarToast("Erro", "Não foi possível apagar o save.", "danger");
    }
});

// ==========================================
// 🏋️ NOVO SISTEMA DE TREINO — por atributo, com pontos ganhos por nível
// ==========================================
// Substitui o antigo botão único "Treinar" (que só dava XP aleatório e, ao
// acumular o suficiente, subia TODOS os atributos igual, sem escolha
// nenhuma do jogador — e não tinha relação real com o desempenho em
// campo). Agora treinar abre um menu: cada ponto de treino (ganho ao subir
// de nível, ver concederXPJogador/concederXPPorDesempenho) pode ser gasto
// num atributo específico de verdade usado no jogo.

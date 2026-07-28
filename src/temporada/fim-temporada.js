function advanceSeasonInternal() {
    anoAtual++;
    rodadaAtual = 1;
    agendaTemporada = [];
    copasEstado = {};
    selecoesEstado.torneios = {};
    selecoesEstado.premiosLigaAno = {};
    janelaMeioAnoProcessada = false;
    
    jogador.energia = 100;
    jogador.melhorAtuacao = { gols: 0, assistencias: 0, nota: 0, adversario: "", rodada: 0 };
    resetarStatsNovaTemporada();
    gerarJovensGenericos(34);

    inicializarTabelas();
    processarMercadoTransferencias("principal");
    inicializarCopasNacionaisEContinentais();
    gerarAgenda();

    window.salvarJogo();
    atualizarHub();

    document.getElementById("btnJogarHub").disabled = false;
    mostrarToast("Ano Novo", `Bem-vindo à Temporada ${anoAtual}!`, "success");
}

// Apura os campeões de ligas, copas nacionais, torneios continentais, supercopas
// e do torneio intercontinental — e já credita os pontos de título (ver PONTOS_TITULO)
// a quem os conquistou NESTA temporada. É chamada a partir de processarFimTemporada(),
// ou seja, antes da Gala — assim quem foi campeão da Champions em maio concorre à
// Bola de Ouro de junho com esse troféu já valendo, e não só no ano seguinte.
function apurarCampeoesTemporada() {
    window.vagasContinentais = { uefa_cl: [], uefa_el: [], uefa_col: [], conmebol_lib: [], conmebol_sul: [], concacaf_clc: [], afc_cla: [], afc_cla2: [] };
    campeoesAnoAnterior = { ligas: {}, copas: {} };
    titulosClubesPendentes = [];

    for (const [ligaId, tabela] of Object.entries(tabelasLigas)) {
        let comp = competicoes.find(c => c.id === ligaId);
        // 🛡️ SÉRIE D (liga_grupos): não tem "campeão de tabela" — o campeão real
        // é decidido pelo mata-mata (ver loop de copasEstado abaixo), então esta
        // tabela "de bastidores" (só usada pelo modo Manager) não deve coroar
        // ninguém aqui, ou geraríamos um segundo campeão falso e conflitante.
        if (comp?.tipo === "liga_grupos") continue;
        let tabOrd = [...tabela].sort((a,b) => b.pontos - a.pontos || ((b.gols||0) - (b.golsSofridos||0)) - ((a.gols||0) - (a.golsSofridos||0)) || (b.gols||0) - (a.gols||0));

        if(tabOrd[0]) {
            let campeaoClube = clubes.find(c => c.id === tabOrd[0].id);
            if(campeaoClube) {
                campeoesAnoAnterior.ligas[ligaId] = campeaoClube.id;
                if(!campeaoClube.historicoTitulos) campeaoClube.historicoTitulos = [];
                campeaoClube.historicoTitulos.unshift(`${anoAtual} - ${comp?.nome || ligaId}`);

                // 📰 Antes, ganhar uma liga não gerava NENHUMA notícia. Agora: se
                // for o TEU clube, é manchete; ligas de topo de outros países
                // rendem uma nota para dar variedade ao feed.
                if (campeaoClube.id === jogador.clubeId) {
                    registrarNoticia(`${campeaoClube.nome} é CAMPEÃO!`, `${campeaoClube.nome} conquistou a ${comp?.nome || ligaId} de ${anoAtual}, com ${jogador.nome} no elenco campeão!`, "Partida", { nome: comp?.nome || ligaId }, "trofeu", true);
                } else if (comp?.div === 1) {
                    registrarNoticia(`${campeaoClube.nome} conquista a ${comp?.nome}`, `${campeaoClube.nome} garantiu o título da ${comp?.nome} na temporada de ${anoAtual}.`, "Partida", { nome: comp?.nome || ligaId }, "trofeu");
                }

                const pontosTitulo = (comp?.div === 1) ? PONTOS_TITULO.ligaPrincipal : PONTOS_TITULO.ligaSecundaria;
                let elencoCamp = getElencoClube(campeaoClube.id);
                elencoCamp.forEach(j => {
                    const alvo = creditarPontosPremio(j, pontosTitulo);
                    titulosClubesPendentes.push({ playerId: alvo === jogador ? "player" : alvo.id, nomeTrofeu: comp?.nome || ligaId });
                });
            }
        }

        if(ligaId.endsWith("_1") || !ligaId.includes("_")) {
            let rV = CONFIG_VAGAS_CONTINENTAIS[ligaId] || (ligaId.includes("br")||ligaId.includes("arg") ? CONFIG_VAGAS_CONTINENTAIS["default_conmebol"] : (ligaId.includes("ara") ? CONFIG_VAGAS_CONTINENTAIS["default_asia"] : (ligaId.includes("usa") ? CONFIG_VAGAS_CONTINENTAIS["default_concacaf"] : CONFIG_VAGAS_CONTINENTAIS["default_uefa"])));
            if (rV.cl !== undefined) { window.vagasContinentais.uefa_cl.push(...tabOrd.slice(0, rV.cl).map(t=>t.id)); window.vagasContinentais.uefa_el.push(...tabOrd.slice(rV.cl, rV.cl + rV.el).map(t=>t.id)); window.vagasContinentais.uefa_col.push(...tabOrd.slice(rV.cl + rV.el, rV.cl + rV.el + rV.col).map(t=>t.id)); }
            else if (rV.lib !== undefined) { window.vagasContinentais.conmebol_lib.push(...tabOrd.slice(0, rV.lib).map(t=>t.id)); window.vagasContinentais.conmebol_sul.push(...tabOrd.slice(rV.lib, rV.lib + rV.sul).map(t=>t.id)); }
            else if (rV.cla !== undefined) { window.vagasContinentais.afc_cla.push(...tabOrd.slice(0, rV.cla).map(t=>t.id)); if (rV.cla2 > 0) window.vagasContinentais.afc_cla2.push(...tabOrd.slice(rV.cla, rV.cla + rV.cla2).map(t=>t.id)); }
            else if (rV.clc !== undefined) { window.vagasContinentais.concacaf_clc.push(...tabOrd.slice(0, rV.clc).map(t=>t.id)); }
        }
    }

    for (const [compId, estado] of Object.entries(copasEstado)) {
        let comp = competicoes.find(c => c.id === compId); if(!comp) continue;
        // 🛡️ PLAYOFF DE ACESSO DA SÉRIE D: decide só a última vaga de acesso à
        // Série C, não é uma "taça" — não deve virar troféu/notícia de título.
        if (compId === "br_4_acesso") continue;
        let campeaoCopaId = estado.campeaoId || estado.confrontos?.[0]?.vencedorId;
        if(campeaoCopaId) {
            let campeaoClube = clubes.find(c=>c.id===campeaoCopaId);
            campeoesAnoAnterior.copas[compId] = campeaoCopaId;
            if(campeaoClube) {
                if(!campeaoClube.historicoTitulos) campeaoClube.historicoTitulos = [];
                campeaoClube.historicoTitulos.unshift(`${anoAtual} - ${comp.nome}`);

                if (campeaoClube.id === jogador.clubeId) {
                    registrarNoticia(`${campeaoClube.nome} LEVANTA A TAÇA!`, `${campeaoClube.nome} venceu a ${comp.nome} de ${anoAtual}, com ${jogador.nome} no elenco campeão!`, "Partida", { nome: comp.nome }, "trofeu", true);
                } else {
                    registrarNoticia(`${campeaoClube.nome} conquista a ${comp.nome}`, `${campeaoClube.nome} venceu a final e é o novo campeão da ${comp.nome} de ${anoAtual}.`, "Partida", { nome: comp.nome }, "trofeu");
                }

                let elencoCamp = getElencoClube(campeaoClube.id);
                const pontosTitulo = pontosTituloClube(comp);
                elencoCamp.forEach(j => {
                    const alvo = creditarPontosPremio(j, pontosTitulo);
                    titulosClubesPendentes.push({ playerId: alvo === jogador ? "player" : alvo.id, nomeTrofeu: comp.nome });
                });
            }
        }
    }

    // 🆕 O campeão da Champions League E o campeão da Europa League garantem
    // vaga direta na Champions League da temporada seguinte, mesmo que não
    // tenham terminado a liga doméstica numa posição classificável — reflete
    // a regra real da UEFA (título garante entrada independente da posição).
    [campeoesAnoAnterior.copas.uefa_cl, campeoesAnoAnterior.copas.uefa_el].forEach(campeaoId => {
        if (campeaoId && !window.vagasContinentais.uefa_cl.includes(campeaoId)) {
            window.vagasContinentais.uefa_cl.push(campeaoId);
        }
    });
}

function processarFimTemporada() {
    forcarFimDeCopas();
    apurarCampeoesTemporada();

    try {
        // ==========================================
        // 🏅 CALCULO REALISTA DA BOLA DE OURO
        // Compara cada jogador só com outros da mesma posição, pesa gols/assistências
        // pela importância da competição e soma os pontos de título da temporada.
        // ==========================================
        let todos = [jogador, ...jogadoresIA.filter(x=>!x.aposentado)].map(p => {
            const g = p.estatisticasAtuais ? p.estatisticasAtuais.gols : (p.statsTemporada?.gols || 0);
            const a = p.estatisticasAtuais ? p.estatisticasAtuais.assistencias : (p.statsTemporada?.assistencias || 0);
            const { golsP, assistP, jogosTotais } = statsPonderadosTemporada(p, g, a);
            const liga = obterClubeJogador(p)?.ligaId;
            const grupo = grupoPosicaoPremio(p.posicao);
            const media = Math.max(4.0, Math.min(9.8, (p.geral || 60) / 14 + (jogosTotais > 0 ? ((golsP * (grupo === "defensor" || grupo === "goleiro" ? 0.4 : 1.0)) + assistP * 0.7) / jogosTotais : 0)));
            const perfilDef = (grupo === "defensor" || grupo === "goleiro") ? estimarPerfilDefensivo(p, liga, jogosTotais) : null;
            return { p, g, a, golsP, assistP, jogosTotais, ovr: p.geral, idade: p.idade, pos: p.posicao, grupo, media, perfilDef, ligaId: liga };
        });

        // Métrica bruta específica de cada bloco de posição (ver pedido: atacantes
        // são julgados por gols/assistências, defensores por solidez defensiva, etc.)
        todos.forEach(x => {
            if(x.grupo === "atacante") {
                x.metricaBruta = x.golsP * 1.7 + x.assistP * 0.9 + (x.golsP + x.assistP) * 0.5 + x.media * 1.3;
            } else if(x.grupo === "meia") {
                x.metricaBruta = x.assistP * 1.7 + x.golsP * 0.9 + x.media * 1.5;
            } else if(x.grupo === "defensor") {
                x.metricaBruta = (x.perfilDef.jogosSemSofrerGol * 1.4) + (x.perfilDef.desarmes * 0.5) + (x.perfilDef.interceptacoes * 0.5) + x.media * 1.6 + x.golsP * 1.1;
            } else {
                x.metricaBruta = (x.perfilDef.jogosSemSofrerGol * 1.7) + (x.perfilDef.defesas * 0.35) + (x.perfilDef.penaltisDefendidos * 3) + x.media * 1.5;
            }
        });

        // Normaliza a métrica bruta (0-100) dentro do próprio grupo de posição,
        // para que atacantes não dominem sempre o prêmio.
        // 🛡️ FIX (zagueiros vencendo tudo): o teto de cada grupo era calculado com
        // TODOS os jogadores do mundo, inclusive ligas fracas/obscuras. Gols têm
        // variância enorme (um artilheiro fora da curva numa liga fraquinha podia
        // acumular uma quantidade absurda), enquanto estatísticas defensivas
        // (desarmes, interceptações, jogos sem sofrer gol) são bem mais "amontoadas"
        // entre si. Resultado: esse outlier virava o teto do grupo "atacante" e
        // achatava a nota normalizada até dos verdadeiros craques das 5 grandes
        // ligas — enquanto o zagueiro top de verdade batia perto do teto do
        // próprio grupo com facilidade. Agora o teto de cada grupo é calculado
        // só entre os candidatos de elite (top 5 ligas europeias ou clubes de
        // alta reputação), que é o universo que realmente disputa esses prêmios.
        const candidatosElite = todos.filter(x => TOP5_LIGAS_EUROPA.includes(x.ligaId) || (obterClubeJogador(x.p)?.reputacao >= 80));
        const poolTeto = candidatosElite.length > 0 ? candidatosElite : todos;
        const maxPorGrupo = {};
        poolTeto.forEach(x => { maxPorGrupo[x.grupo] = Math.max(maxPorGrupo[x.grupo] || 0, x.metricaBruta); });
        todos.forEach(x => {
            let posicional = normalizarNoGrupo(x.metricaBruta, maxPorGrupo[x.grupo]);
            // Prêmios individuais imitam o viés real do futebol: praticamente sempre
            // vão para as 5 grandes ligas europeias. Fora delas dá pra aparecer no
            // Top 30 numa temporada excepcional, mas é raro vencer de fato — por
            // isso é um desconto forte na força do desempenho, não um teto rígido.
            const forcaLiga = TOP5_LIGAS_EUROPA.includes(x.ligaId) ? 1.0 : (obterClubeJogador(x.p)?.reputacao >= 85 ? 0.55 : 0.3);
            posicional *= forcaLiga;
            // 🛡️ REALISMO POR GRUPO DE POSIÇÃO: no mundo real, atacantes e meias
            // dominam Bola de Ouro / The Best / UEFA Player quase sempre — zagueiros
            // venceram raras vezes (Beckenbauer, Matthäus, Sammer, Cannavaro) e
            // goleiros praticamente nunca (só Yashin, 1963). Antes só o goleiro
            // tinha desconto; agora o zagueiro/lateral também recebe um desconto
            // forte (mas não zero, pra ainda ser possível numa temporada excepcional).
            if(x.grupo === "goleiro") posicional *= 0.62;
            if(x.grupo === "defensor") posicional *= 0.45;
            const prestigioLiga = TOP5_LIGAS_EUROPA.includes(x.ligaId) ? 8 : (obterClubeJogador(x.p)?.reputacao >= 85 ? 4 : 0);
            const prestigioSelecao = Math.min(10, ((x.p.statsSelecao?.gols || 0) + (x.p.statsSelecao?.assistencias || 0)) * 0.4);
            x.scoreFinal = posicional + (x.p.pontosPremioTemporada || 0) + prestigioLiga + prestigioSelecao;
            x.ligaId = x.ligaId;
            // Pontuação específica para prêmios internacionais (pesa mais o desempenho pela seleção nacional)
            x.scoreInternacional = x.scoreFinal + (x.p.statsSelecao?.gols || 0) * 3 + (x.p.statsSelecao?.assistencias || 0) * 2 + (x.p.titulosSelecao?.length || 0) * 20;
        });
        let rankingBolaOuro = [...todos].sort((a,b) => b.scoreFinal - a.scoreFinal);

        let bonusUser = 0; if (jogador.estatisticasAtuais.gols + jogador.estatisticasAtuais.assistencias > 20) bonusUser += 2;
        if (jogador.idade < 24) bonusUser += 2; if (jogador.idade > 31) bonusUser -= 2;
        evoluirAtributosEGeral(jogador, bonusUser);
        jogador.valorMercadoNum = calcularValorMercadoJogador(jogador);
        
        registrarNoticia("Fim de temporada", "A grande janela de transferências vai abrir junto com a nova época.", "Mercado");

        // Manager Mode season review — piggybacks on the exact same season
        // rollover as everyone else, since the manager's club lives in the same
        // tabelasLigas used by the rest of the world.
        if(managerEstado?.ativo && managerEstado.clubeId) {
            const clubeMgr = clubes.find(c => c.id === managerEstado.clubeId);
            const tabelaMgr = clubeMgr ? tabelasLigas[clubeMgr.ligaId] : null;
            if(clubeMgr && tabelaMgr) {
                const tabOrd = [...tabelaMgr].sort((a,b) => b.pontos - a.pontos || ((b.gols||0)-(b.golsSofridos||0)) - ((a.gols||0)-(a.golsSofridos||0)));
                const posicaoFinal = tabOrd.findIndex(t => t.id === clubeMgr.id) + 1;
                const totalTimes = tabOrd.length;
                let ajusteConfianca = 0;
                if(posicaoFinal === 1) ajusteConfianca = 15;
                else if(posicaoFinal <= Math.ceil(totalTimes * 0.25)) ajusteConfianca = 8;
                else if(posicaoFinal <= Math.ceil(totalTimes * 0.6)) ajusteConfianca = 0;
                else if(posicaoFinal <= totalTimes - 3) ajusteConfianca = -8;
                else ajusteConfianca = -18;

                managerEstado.confianca = Math.max(0, Math.min(100, managerEstado.confianca + ajusteConfianca));
                registrarNoticia(
                    posicaoFinal === 1 ? "Campeões!" : "Temporada encerrada",
                    `${clubeMgr.nome} terminou a época em ${posicaoFinal}º/${totalTimes} lugar sob o comando de ${managerEstado.treinador?.nome || "seu treinador"}.`,
                    "Manager"
                );

                if(managerEstado.confianca <= 0) {
                    registrarNoticia("Demitido", `${managerEstado.treinador?.nome || "O treinador"} foi demitido pela diretoria do ${clubeMgr.nome} após a fraca campanha.`, "Manager");
                    managerEstado = estadoManagerPadrao();
                } else {
                    // Refresh transfer budget and bring through a new youth intake for the new season.
                    managerEstado.orcamentoTransferencias += Math.floor((clubeMgr.reputacao || 70) * (clubeMgr.reputacao >= 84 ? 900000 : 350000));
                    managerEstado.base = gerarBaseManager(clubeMgr);
                    managerEstado.promocoesBaseTemporada = 0;
                    managerEstado.auxiliaresDisponiveis = gerarAuxiliaresDisponiveis(clubeMgr);
                }
            }
        }

        premiarLigasTemporada();
        simularGalaEpica(rankingBolaOuro);
        
    } catch (e) { console.error(e); mostrarToast("Erro", "Falha na Gala.", "danger"); }
}

// ==========================================
// 🌐 FIM DE TEMPORADA COMPARTILHADO (GALA IGUAL PARA OS DOIS)
// ==========================================
// No modo online, só o anfitrião do mundo calcula a Gala de verdade (Bola de
// Ouro, campeões, envelhecimento da IA) — já considerando as estatísticas
// reais do amigo, que estão sincronizadas dentro de jogadoresIA. O resultado
// inteiro é transmitido para o amigo aplicar, para que os dois vejam
// exatamente os mesmos campeões e prémios.
window.processarFimTemporadaOnline = async function() {
    // 🤝 PESSOAL: a promessa feita ao técnico usa só as minhas próprias
    // estatísticas — por isso é avaliada sempre, em qualquer modo, e mesmo
    // para quem não é o "anfitrião do mundo" no online.
    avaliarPromessasTecnico();

    if (window.connectionMode !== 'online' || !window.firebaseIntegration) {
        processarFimTemporada();
        return;
    }

    const souHost = window.firebaseIntegration.souHostDoMundo();
    if (souHost) {
        processarFimTemporada();

        // Se o amigo ganhou algo nesta Gala, avisa-o (ele não corre este código).
        const meuParceiro = jogadoresIA.find(j => j.id === window.onlinePartnerId);
        if (meuParceiro?.historicoCarreira?.[0]?.trofeus && meuParceiro.historicoCarreira[0].trofeus !== "-") {
            window.firebaseIntegration.pushAchievementForPlayerToFirebase(window.onlinePartnerId, meuParceiro.historicoCarreira[0].trofeus, "Fim de Temporada");
        }

        window.firebaseIntegration.transmitirFimDeTemporada(anoAtual, {
            tabelasLigas: JSON.parse(JSON.stringify(tabelasLigas)),
            copasEstado: JSON.parse(JSON.stringify(copasEstado)),
            campeoesAnoAnterior: JSON.parse(JSON.stringify(campeoesAnoAnterior)),
            jogadoresIA: JSON.parse(JSON.stringify(jogadoresIA.filter(j => !j.isFirebasePlayer && !j.isOnlinePlayer))),
            parceiroResultado: meuParceiro ? JSON.parse(JSON.stringify({ historicoCarreira: meuParceiro.historicoCarreira, pontosPremio: meuParceiro.pontosPremio, titulosSelecao: meuParceiro.titulosSelecao })) : null
        });
    } else {
        const estado = await window.firebaseIntegration.obterFimDeTemporada(anoAtual);
        if (estado) {
            for (let key in tabelasLigas) delete tabelasLigas[key];
            Object.assign(tabelasLigas, estado.tabelasLigas || {});
            for (let key in copasEstado) delete copasEstado[key];
            Object.assign(copasEstado, estado.copasEstado || {});
            campeoesAnoAnterior = estado.campeoesAnoAnterior || campeoesAnoAnterior;
            if (estado.jogadoresIA) { jogadoresIA.length = 0; estado.jogadoresIA.forEach(n => jogadoresIA.push(n)); }

            // Aplica o MEU próprio troféu/prémio (o anfitrião já apurou isto no cálculo dele).
            if (estado.parceiroResultado) {
                if (estado.parceiroResultado.historicoCarreira?.[0] && jogador.historicoCarreira?.[0]) {
                    jogador.historicoCarreira[0].trofeus = estado.parceiroResultado.historicoCarreira[0].trofeus;
                }
                if (typeof estado.parceiroResultado.pontosPremio === 'number') jogador.pontosPremio = estado.parceiroResultado.pontosPremio;
                if (estado.parceiroResultado.titulosSelecao) jogador.titulosSelecao = estado.parceiroResultado.titulosSelecao;
            }

            // Aplica o meu próprio bónus de OVR/valor de mercado de fim de temporada
            // (o anfitrião só ajustou o dele próprio).
            let bonusUser = 0;
            if (jogador.estatisticasAtuais.gols + jogador.estatisticasAtuais.assistencias > 20) bonusUser += 2;
            if (jogador.idade < 24) bonusUser += 2; if (jogador.idade > 31) bonusUser -= 2;
            evoluirAtributosEGeral(jogador, bonusUser);
            jogador.valorMercadoNum = calcularValorMercadoJogador(jogador);

            registrarNoticia("Fim de temporada", "A grande janela de transferências vai abrir junto com a nova época.", "Mercado");
        } else {
            // Rede de segurança em caso de falha de rede/timeout.
            processarFimTemporada();
        }
    }
};

// Monta o "Melhor 11 do Mundo" da temporada: escolhe o melhor jogador disponível para
// cada posição de uma formação 4-3-3, sem repetir jogador em mais de uma vaga.
function montarMelhor11(ranking) {
    // Em vez de posicionar cada jogador com coordenadas absolutas (que cortavam o
    // cartão do goleiro e dos pontas em telas menores), o time é montado em LINHAS
    // (Goleiro / Defesa / Meio / Ataque) — um layout que se adapta a qualquer altura
    // de tela sem cortar nada.
    const formacao = [
        { pos: "Goleiro", label: "GOL", linha: "goleiro" },
        { pos: "Lateral", label: "LE", linha: "defesa" },
        { pos: "Zagueiro", label: "ZAG", linha: "defesa" },
        { pos: "Zagueiro", label: "ZAG", linha: "defesa" },
        { pos: "Lateral", label: "LD", linha: "defesa" },
        { pos: "Volante", label: "VOL", linha: "meio" },
        { pos: "Meio-Campista", label: "MC", linha: "meio" },
        { pos: "Meia Ofensivo", label: "MEI", linha: "meio" },
        { pos: "Ponta", label: "PE", linha: "ataque" },
        { pos: "Atacante", label: "ATA", linha: "ataque" },
        { pos: "Ponta", label: "PD", linha: "ataque" }
    ];
    const chave = (p) => p === jogador ? "player" : (p.id || p.nome);
    const usados = new Set();
    const porPosicao = {};
    ranking.forEach(x => { if(!porPosicao[x.pos]) porPosicao[x.pos] = []; porPosicao[x.pos].push(x); });
    Object.keys(porPosicao).forEach(pos => porPosicao[pos].sort((a,b) => b.scoreFinal - a.scoreFinal));
    return formacao.map(slot => {
        const cands = (porPosicao[slot.pos] || []).filter(x => !usados.has(chave(x.p)));
        const escolhido = cands[0] || null;
        if(escolhido) usados.add(chave(escolhido.p));
        return { ...slot, escolhido };
    });
}

// 🎉 Confete da Gala — reaproveita a keyframe cairConfete (já existia no CSS
// mas nunca tinha sido usada aqui). Uma rajada de 50 partículas douradas,
// disparada nos dois momentos altos: a revelação do vencedor da Bola de Ouro
// e o resumo final. Some sozinha depois de alguns segundos.
function dispararConfeteGala() {
    const camada = document.createElement("div");
    camada.style.cssText = "position:fixed; inset:0; z-index:99999; pointer-events:none; overflow:hidden;";
    const cores = ["#facc15", "#fff7ad", "#f59e0b", "#ffffff", "#fde68a"];
    for (let i = 0; i < 50; i++) {
        const p = document.createElement("div");
        const cor = cores[Math.floor(Math.random() * cores.length)];
        p.style.cssText = `position:absolute; left:${Math.random() * 100}vw; top:-24px; width:${6 + Math.random() * 7}px; height:${10 + Math.random() * 8}px; background:${cor}; border-radius:${Math.random() > 0.5 ? '50%' : '2px'}; opacity:${0.6 + Math.random() * 0.4}; animation:cairConfete ${2.4 + Math.random() * 2}s linear forwards; animation-delay:${(Math.random() * 0.5).toFixed(2)}s;`;
        camada.appendChild(p);
    }
    document.body.appendChild(camada);
    setTimeout(() => camada.remove(), 4800);
}

function simularGalaEpica(ranking) {
    const top30 = ranking.slice(0, 30);
    let top1 = top30[0]; let top2 = top30[1]; let top3 = top30[2];
    if (!top1 || !top2 || !top3) { mostrarToast("Gala", "Ainda nao ha jogadores suficientes para a premiacao.", "warning"); return; }

    // 🥇 CHUTEIRA DE OURO (mundial, da Gala): agora só concorre quem joga numa
    // das 5 grandes ligas europeias (Premier League, La Liga, Serie A,
    // Bundesliga, Ligue 1) — do jeito que o prêmio realmente funciona no
    // mundo real (nenhum artilheiro de liga menor levanta essa taça).
    const porGolsTop5 = ranking.filter(x => TOP5_LIGAS_EUROPA.includes(x.ligaId)).sort((a,b) => b.g - a.g || b.scoreFinal - a.scoreFinal);
    const porGols = porGolsTop5.length > 0 ? porGolsTop5 : [...ranking].sort((a,b) => b.g - a.g || b.scoreFinal - a.scoreFinal);
    const porAssistencias = [...ranking].sort((a,b) => b.a - a.a || b.scoreFinal - a.scoreFinal);
    const sub21 = ranking.filter(x => x.idade <= 21).sort((a,b) => b.scoreFinal - a.scoreFinal);
    const goleiros = ranking.filter(x => x.pos === "Goleiro").sort((a,b) => b.ovr - a.ovr || b.scoreFinal - a.scoreFinal);
    const rankingInternacional = [...ranking].sort((a,b) => b.scoreInternacional - a.scoreInternacional);
    const rankingEuropa = ranking.filter(x => ehLigaEuropeia(x.ligaId)).sort((a,b) => b.scoreFinal - a.scoreFinal);
    const candidatosUefa = rankingEuropa.length >= 3 ? rankingEuropa : ranking;

    // Ícone de cada prêmio: para os troféus ligados a uma competição real (UEFA / FIFA),
    // usamos a logo verdadeira da competição em vez de um emoji genérico.
    const iconEmoji = (e) => e;
    const iconLogoComp = (nomeComp) => `<img loading="lazy" decoding="async" src="${obterUrlImagem(nomeComp, 'trofeu')}" alt="${nomeComp}" style="height:1.1em;width:1.1em;object-fit:contain;vertical-align:-0.2em;">`;

    // A Bola de Ouro tem tratamento próprio (Top 30 revelado aos poucos) e por isso
    // fica fora da lista genérica de prêmios abaixo.
    const premios = [
        { nome: "Chuteira de Ouro", icon: iconEmoji("⚽"), candidatos: porGols.slice(0, 3), vencedor: porGols[0], metrica: x => `${x.g} gols na temporada`, pontos: 35, grande: false },
        { nome: "Rei das Assistencias", icon: iconEmoji("🎯"), candidatos: porAssistencias.slice(0, 3), vencedor: porAssistencias[0], metrica: x => `${x.a} assistencias`, pontos: 30, grande: false },
        { nome: "Golden Boy", icon: iconEmoji("⭐"), candidatos: sub21.slice(0, 3), vencedor: sub21[0], metrica: x => `${x.idade} anos • OVR ${x.ovr}`, pontos: 25, grande: false },
        { nome: "Luva de Ouro", icon: iconEmoji("🧤"), candidatos: goleiros.slice(0, 3), vencedor: goleiros[0], metrica: x => `Goleiro • OVR ${x.ovr}`, pontos: 30, grande: false },
        { nome: "UEFA Best Player", icon: iconLogoComp("Champions League"), candidatos: candidatosUefa.slice(0, 3), vencedor: candidatosUefa[0], metrica: x => `${obterClubeJogador(x.p)?.nome || "Clube europeu"} • ${x.g}G ${x.a}A`, pontos: 55, grande: true },
        { nome: "FIFA The Best", icon: iconLogoComp("Copa do Mundo"), candidatos: rankingInternacional.slice(0, 3), vencedor: rankingInternacional[0], metrica: x => `${x.g} gols de clube • ${x.p.statsSelecao?.gols || 0} pela seleção`, pontos: 65, grande: true }
    ].filter(p => p.vencedor && p.candidatos.length > 0);

    const premioBolaOuro = { nome: "Bola de Ouro", icon: iconEmoji("🏆"), candidatos: [top1, top2, top3], vencedor: top1, metrica: x => `${x.g} gols • ${x.a} ast • OVR ${x.ovr}`, pontos: 80, grande: true };
    const todosPremiosResumo = [...premios, premioBolaOuro];

    premiosIndividuaisPendentes = todosPremiosResumo.map(p => ({ nome: p.nome, playerId: p.vencedor.p.id || (p.vencedor.p === jogador ? "player" : ""), pontos: p.pontos }));

    todosPremiosResumo.forEach(p => {
        registrarNoticia(`${p.nome}: ${p.vencedor.p.nome} é o vencedor!`, `${p.vencedor.p.nome} conquistou o prêmio ${p.nome} da temporada (${p.metrica(p.vencedor)}).`, "Prémios", { nome: p.vencedor.p.nome, foto: p.vencedor.p.foto }, "jogador", !!p.grande);
    });

    const melhor11 = montarMelhor11(ranking);
    melhor11.filter(v => v.escolhido).forEach(v => {
        premiosIndividuaisPendentes.push({ nome: "Melhor 11 do Mundo", playerId: v.escolhido.p.id || (v.escolhido.p === jogador ? "player" : ""), pontos: 15 });
    });
    registrarNoticia("Melhor 11 do Mundo revelado", `A seleção com os destaques da temporada por posição foi anunciada: ${melhor11.filter(v=>v.escolhido).map(v=>v.escolhido.p.nome).join(", ")}.`, "Prémios");

    const renderTrofeu = (nome) => `<img loading="lazy" decoding="async" src="${obterUrlImagem(nome, 'trofeu')}" alt="${nome}" onerror="this.outerHTML='🏆'">`;
    const atualizarTrofeu = (nome) => { const el = document.getElementById("trofeuGalaAtual"); if(el) el.innerHTML = renderTrofeu(nome); };
    const finalizarGala = () => {
        mB.classList.add("oculto");

        // Set ready for season end if in online room mode
        if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode() && window.firebaseIntegration.getRoomId()) {
            window.firebaseIntegration.setReadyForSeasonEnd(true);
            mostrarToast("Sala Online", "Aguardando amigo para avançar temporada...", "info");
            return;
        }

        window.avancarTemporada();
        if(propostasPendentes.length > 0) {
            mostrarToast("MERCADO ABERTO", "Propostas recebidas!", "warning");
            document.querySelector("[data-view='view-mercado']")?.click();
        }
    };

    // Nenhum "favorito" é indicado antes da revelação — todos os nomeados aparecem
    // em pé de igualdade, exatamente como numa cerimônia real.
    const renderCandidatos = (premio, revelar = false) => `
        <div class="gala-premio-palco">
            <h3>${premio.icon} ${premio.nome}</h3>
            <p style="margin:0; color:#a1a1aa; font-weight:700;">${revelar ? 'Vencedor revelado. O teatro veio abaixo.' : 'Os tres nomeados aparecem no telao...'}</p>
            <div class="gala-candidatos-grid">
                ${premio.candidatos.map(c => `
                    <div class="gala-candidato ${revelar && c.p.id === premio.vencedor.p.id ? 'vencedor' : ''}">
                        <img loading="lazy" decoding="async" src="${obterUrlImagem(c.p, 'jogador')}" alt="${c.p.nome}">
                        <strong>${revelar && c.p.id === premio.vencedor.p.id ? '👑 ' : ''}${c.p.nome}</strong>
                        <span>${premio.metrica(c)}</span>
                    </div>`).join("")}
            </div>
        </div>`;

    const renderCandidatosGrandes = (premio, revelar = false) => {
        // A ordem de exibição embaralha os nomeados (não é 3º/2º/1º) até a revelação,
        // para que ninguém consiga adivinhar o vencedor pela posição no ecrã.
        const ordemExibicao = premio._ordemExibicao || (premio._ordemExibicao = [...premio.candidatos].sort(() => Math.random() - 0.5));
        return `
        <div class="gala-premio-palco">
            <h3>${premio.icon} ${premio.nome}</h3>
            <p style="margin:0; color:#a1a1aa; font-weight:700;">${revelar ? 'Vencedor revelado. O teatro veio abaixo.' : 'Os tres nomeados aparecem no telao...'}</p>
            <div class="finalistas-grid">
                ${ordemExibicao.map((item) => {
                    const venceu = revelar && item.p.id === premio.vencedor.p.id;
                    return `<div class="finalista-card revelado ${venceu ? 'vencedor' : ''}">
                        <img loading="lazy" decoding="async" src="${obterUrlImagem(item.p, 'jogador')}" alt="${item.p.nome}">
                        <span style="color:${venceu ? '#facc15' : '#a1a1aa'}; font-weight:900; text-transform:uppercase; font-size:0.78rem;">${venceu ? '👑 Vencedor' : 'Nomeado'}</span>
                        <h4>${item.p.nome}</h4>
                        <div class="finalista-stats"><span>OVR ${item.ovr}</span><span>${item.g} Gols</span><span>${item.a} Ast</span></div>
                    </div>`;
                }).join("")}
            </div>
        </div>`;
    };

    const renderMelhor11 = () => `
        <div class="gala-premio-palco">
            <h3>🧩 Melhor 11 do Mundo</h3>
            <p style="margin:0 0 4px; color:#a1a1aa; font-weight:700;">Um jogador por posição, eleito pelo desempenho da temporada.</p>
            <div class="melhor11-campo">
                ${["goleiro","defesa","meio","ataque"].map(linha => `
                    <div class="melhor11-linha melhor11-linha-${linha}">
                        ${melhor11.filter(v => v.linha === linha).map((v, i) => `
                            <div class="melhor11-vaga" style="animation-delay:${(i*0.09).toFixed(2)}s;">
                                ${v.escolhido ? `<img loading="lazy" decoding="async" src="${obterUrlImagem(v.escolhido.p, 'jogador')}" alt="${v.escolhido.p.nome}">` : `<div class="melhor11-avatar-vazio">?</div>`}
                                <strong>${v.escolhido ? v.escolhido.p.nome : "—"}</strong>
                                <span>${v.label}</span>
                            </div>`).join("")}
                    </div>`).join("")}
            </div>
        </div>`;

    // Placar da Bola de Ouro: mostra sempre as 30 posições, mas só preenche os
    // nomes das que já foram reveladas (de trás para frente, do 30º ao 1º lugar).
    const renderTop30Board = (reveladosDoFim) => `
        <div class="gala-premio-palco">
            <h3>🏆 Bola de Ouro — Top 30</h3>
            <p style="margin:0 0 4px; color:#a1a1aa; font-weight:700;">A lista vai sendo revelada de trás para a frente. Quem chegará ao topo?</p>
            <div class="top30-board">
                ${top30.map((x, i) => {
                    const rank = i + 1;
                    const posDoFim = top30.length - rank + 1;
                    const revelado = posDoFim <= reveladosDoFim;
                    return `<div class="top30-slot ${revelado ? 'revelado' : ''} ${rank <= 3 ? 'top3' : ''}">
                        <span class="top30-rank">${rank}º</span>
                        ${revelado ? `<img loading="lazy" decoding="async" src="${obterUrlImagem(x.p, 'jogador')}" alt="${x.p.nome}">` : `<div class="top30-avatar-oculto">?</div>`}
                        <div class="top30-info">
                            <strong>${revelado ? x.p.nome : '???'}</strong>
                            <span>${revelado ? `${x.g}G ${x.a}A • OVR ${x.ovr}` : ''}</span>
                        </div>
                    </div>`;
                }).join("")}
            </div>
        </div>`;

    let mB = document.getElementById("modalBolaOuro");
    if(!mB) return;

    const progressoHTML = `<div class="gala-progresso" id="galaProgresso">
        ${premios.map(p => `<span data-nome="${p.nome}">${p.icon} ${p.nome}</span>`).join("")}
        <span data-nome="Bola de Ouro">🏆 Bola de Ouro</span>
        <span data-nome="Melhor 11 do Mundo">🧩 Melhor 11</span>
    </div>`;

    mB.innerHTML = `
        <div class="modal-content gala-container-premium">
            <div class="gala-stage">
                <button id="btnPularGala" class="gala-skip-btn">Avancar</button>
                <div class="gala-kicker">Noite de gala mundial</div>
                <h2 class="gala-luxo">Premios da Temporada ${anoAtual}</h2>
                ${progressoHTML}
                <div class="bola-de-ouro-trofeu" id="trofeuGalaAtual">${renderTrofeu(premios[0]?.nome || 'Bola de Ouro')}</div>
                <p class="gala-subtitle" id="statusGalaText">Os principais nomes do ano estao chegando ao palco.</p>
                <div id="vencedorReveladoCtx" style="min-height:220px;"></div>
            </div>
        </div>`;
    mB.classList.remove("oculto");
    document.getElementById("btnPularGala").onclick = finalizarGala;

    const ctx = () => document.getElementById("vencedorReveladoCtx");
    const status = () => document.getElementById("statusGalaText");
    const marcarProgresso = (nomeAtivo) => {
        document.querySelectorAll("#galaProgresso span").forEach(el => {
            const nome = el.dataset.nome;
            el.classList.toggle("ativo", nome === nomeAtivo);
            if(nome === nomeAtivo) el.classList.remove("feito");
        });
    };
    const marcarConcluido = (nome) => { document.querySelector(`#galaProgresso span[data-nome="${CSS.escape(nome)}"]`)?.classList.add("feito"); document.querySelector(`#galaProgresso span[data-nome="${CSS.escape(nome)}"]`)?.classList.remove("ativo"); };

    function mostrarResumoFinal() {
        marcarConcluido("Melhor 11 do Mundo");
        dispararConfeteGala();
        if(ctx()) ctx().innerHTML = `
            <h1 class="gala-winner-name">👑 ${top1.p.nome}</h1>
            <p style="margin:0; color:#d4d4d8; font-weight:800;">Bola de Ouro confirmada: ${top1.g} gols, ${top1.a} assistencias e OVR ${top1.ovr}</p>
            <div class="gala-awards-grid">
                ${todosPremiosResumo.map(p => `<div class="gala-award ${p.grande ? 'premio-especial' : ''}"><img loading="lazy" decoding="async" src="${obterUrlImagem(p.nome, 'trofeu')}" alt="${p.nome}"><small>${p.icon} ${p.nome}</small><strong>${p.vencedor.p.nome}</strong><span>${p.metrica(p.vencedor)}</span></div>`).join("")}
            </div>
            ${renderMelhor11()}
            <div class="gala-final-actions"><button id="btnFecharGalaNovo" style="padding:15px 40px; background:linear-gradient(90deg, #facc15, #f59e0b); color:#000; border:none; border-radius:12px; font-weight:900; font-size:1.05rem; cursor:pointer; text-transform:uppercase; box-shadow:0 12px 26px rgba(250,204,21,0.22);">Avancar Temporada ➔</button></div>`;
        document.getElementById("btnFecharGalaNovo").onclick = finalizarGala;
    }

    function revelarMelhor11() {
        marcarProgresso("Melhor 11 do Mundo");
        atualizarTrofeu("Melhor 11 do Mundo");
        if(status()) status().innerHTML = "E agora, o Melhor 11 do Mundo da temporada!";
        if(ctx()) ctx().innerHTML = renderMelhor11();
        setTimeout(mostrarResumoFinal, 2600);
    }

    // A Bola de Ouro é revelada em ondas de 4, de trás para a frente (30º ➝ 4º),
    // e só então o pódio (3º, 2º e o vencedor) é anunciado passo a passo — sem
    // jamais indicar quem é o favorito antes da hora.
    function revelarBolaDeOuro() {
        marcarProgresso("Bola de Ouro");
        atualizarTrofeu("Bola de Ouro");
        const totalFundo = Math.max(0, top30.length - 3);
        let reveladosDoFim = 0;
        if(status()) status().innerHTML = "A lista da Bola de Ouro comeca a ser revelada, de tras para frente...";
        if(ctx()) ctx().innerHTML = renderTop30Board(0);

        function passoLote() {
            reveladosDoFim = Math.min(totalFundo, reveladosDoFim + 4);
            if(ctx()) ctx().innerHTML = renderTop30Board(reveladosDoFim);
            if(reveladosDoFim < totalFundo) setTimeout(passoLote, 700);
            else setTimeout(revelarTerceiro, 1300);
        }
        function revelarTerceiro() {
            if(status()) status().innerHTML = "E o terceiro colocado da Bola de Ouro e...";
            setTimeout(() => {
                if(ctx()) ctx().innerHTML = renderTop30Board(totalFundo + 1);
                setTimeout(revelarSegundo, 1900);
            }, 1300);
        }
        function revelarSegundo() {
            if(status()) status().innerHTML = "Em segundo lugar...";
            setTimeout(() => {
                if(ctx()) ctx().innerHTML = renderTop30Board(totalFundo + 2);
                setTimeout(revelarVencedor, 2100);
            }, 1300);
        }
        function revelarVencedor() {
            if(status()) status().innerHTML = "E a Bola de Ouro vai para...";
            setTimeout(() => {
                if(ctx()) ctx().innerHTML = renderTop30Board(totalFundo + 3);
                marcarConcluido("Bola de Ouro");
                dispararConfeteGala();
                setTimeout(revelarMelhor11, 2600);
            }, 1800);
        }
        setTimeout(passoLote, 900);
    }

    function revelarPremio(idx) {
        const premio = premios[idx];
        if(!premio) { revelarBolaDeOuro(); return; }

        marcarProgresso(premio.nome);
        atualizarTrofeu(premio.nome);
        if(status()) status().innerHTML = `Agora: ${premio.nome}. Quem leva?`;
        if(ctx()) ctx().innerHTML = premio.grande ? renderCandidatosGrandes(premio, false) : renderCandidatos(premio, false);
        setTimeout(() => {
            if(status()) status().innerHTML = `${premio.nome}: vencedor revelado!`;
            if(ctx()) ctx().innerHTML = premio.grande ? renderCandidatosGrandes(premio, true) : renderCandidatos(premio, true);
            marcarConcluido(premio.nome);
            setTimeout(() => revelarPremio(idx + 1), premio.grande ? 2400 : 1700);
        }, premio.grande ? 2300 : 1600);
    }

    setTimeout(() => revelarPremio(0), 700);
}

// ==========================================
// 🧠 MODO MANAGER
// ==========================================
// ==========================================
// 👔 MERCADO DE TREINADORES
// ==========================================
// Cada treinador tem nome, ESTILO DE JOGO próprio (mesmo vocabulário do
// bonusTaticoManager: pressao/posse/retranca/contra/equilibrado) e reputação
// — e está sempre ligado a um clube OU a uma seleção, nunca aos dois. O
// campo clube.tecnico continua a existir como string simples (usado em toda
// a parte de "conversa com o técnico" do Modo Jogador) mas passa a ser só um
// reflexo do treinador de verdade — nunca a fonte da informação.

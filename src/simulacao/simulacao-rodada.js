function gerarAgenda() {
    // 🛡️ FIX: esta função monta o calendário de partidas do PRÓPRIO jogador —
    // no Modo Manager não existe personagem jogável, então não há agenda
    // pessoal pra gerar aqui (o Manager tem seu próprio calendário de clube).
    if (!jogador) return;
    let meuClube = clubes.find(c => c.id === jogador.clubeId); if (!meuClube) return;
    let pais = meuClube.ligaId.split("_")[0];
    const perfilPais = obterPerfilCalendarioPais(pais);
    let adversariosLiga = clubes.filter(c => c.ligaId === meuClube.ligaId && c.id !== meuClube.id);
    
    if (adversariosLiga.length % 2 !== 0 && adversariosLiga.length > 0) {
        adversariosLiga.push({ id: "folga_temp", nome: "Folga" });
    }

    agendaTemporada = [];
    inicializarTodosTorneiosTemporada();

    competicoes.filter(c => c.tipo === "supercopa" && obterPaisCompeticaoId(c.id) === pais).forEach(sc => {
        let scState = copasEstado[sc.id];
        if (scState && scState.confrontos && scState.confrontos.length > 0) {
            let conf = scState.confrontos[0];
            if (conf.timeA.id === meuClube.id || conf.timeB.id === meuClube.id) {
                let adv = conf.timeA.id === meuClube.id ? conf.timeB : conf.timeA;
                const cfgCal = obterConfigCalendarioCompeticao(sc.id);
                adicionarEventoCalendario({ tipo: `${sc.nome} (Final)`, compId: sc.id, adversarioId: adv.id, isMataMata: true, perna: 1, isFinal: true, fase: "Final" }, obterSlotCompeticaoCalendario(sc.id, "Final", 1), cfgCal.janela, cfgCal.modelo);
            }
        }
    });

    let nomeLiga = competicoes.find(c=>c.id===meuClube.ligaId)?.nome || "Liga Nacional";
    // 🛡️ SÉRIE D (liga_grupos): NÃO usa este gerador genérico de calendário
    // (que cria turno/returno contra TODOS os clubes da divisão) — o clube só
    // enfrenta os times do seu próprio grupo, e isso já é tratado no bloco
    // dedicado "🏆 SÉRIE D (Brasil) - formato de grupos" mais abaixo. Sem esta
    // trava, o jogador acabava jogando contra a divisão inteira (~96 clubes)
    // em vez de só os 5 adversários do seu grupo de 6.
    const ligaDoJogadorInfo = competicoes.find(c => c.id === meuClube.ligaId);
    const jogadorEstaEmLigaDeGrupos = ligaDoJogadorInfo?.tipo === "liga_grupos";
    const jogosLiga = jogadorEstaEmLigaDeGrupos ? 0 : adversariosLiga.filter(a => a.id !== "folga_temp").length * 2;
    const slotsLiga = distribuirSlots(jogosLiga || 1, perfilPais.ligaInicio, perfilPais.ligaFim);
    let jogoLigaIdx = 0;
    
    // 📅 Calendário realista com folgas estratégicas distribuídas ao longo da temporada
    // Adiciona folgas em pontos estratégicos: 25%, 50%, 75% da temporada + período de Natal/férias
    const byeWeekSlots = [
        Math.floor(jogosLiga * 0.25),
        Math.floor(jogosLiga * 0.5),
        Math.floor(jogosLiga * 0.75),
        Math.floor(jogosLiga * 0.9) // Folga antes das rodadas finais
    ];
    
    if (!jogadorEstaEmLigaDeGrupos) {
        for(let r = 0; r < adversariosLiga.length * 2; r++) {
            let adv = adversariosLiga[r % adversariosLiga.length];
            
            // Check if this round should be a bye week
            if (byeWeekSlots.includes(jogoLigaIdx)) {
                adicionarEventoCalendario({ tipo: "Folga (Recuperação)", compId: "folga", adversarioId: null, isMataMata: false, fase: "Folga", isFolga: true }, slotsLiga[jogoLigaIdx] || perfilPais.ligaFim, "Folga", "europeu");
            } else if(adv.id !== "folga_temp") {
                // 🌐 MUNDO COMPARTILHADO: se o adversário desta rodada de liga é
                // exatamente o clube do amigo online, marca como confronto direto —
                // o jogo vai sincronizar essa partida em tempo real para os dois.
                const isConfrontoDireto = !!(window.connectionMode === 'online' && window.onlinePartnerClubeId && adv.id === window.onlinePartnerClubeId);
                adicionarEventoCalendario({ tipo: `${nomeLiga} (J${jogoLigaIdx + 1})`, compId: meuClube.ligaId, adversarioId: adv.id, isMataMata: false, fase: "Liga", isConfrontoDireto }, slotsLiga[jogoLigaIdx] || perfilPais.ligaFim, nomeLiga, perfilPais.modelo);
            }
            jogoLigaIdx++;
        }
    }
    
    // 🏆 CAMPEONATOS ESTADUAIS (Brasil): usa o mesmo mecanismo genérico das
    // copas nacionais — o .find() abaixo já garante que só entra no calendário
    // a competição estadual em que o clube do jogador realmente está inscrito.
    competicoes.filter(c => (c.tipo.includes("copa") || c.tipo === "estadual") && obterPaisCompeticaoId(c.id) === pais && c.tipo !== "supercopa").forEach((copa, idx) => {
        let state = copasEstado[copa.id];
        if(state && state.confrontos) {
            let conf = state.confrontos.find(c => c.timeA.id === meuClube.id || c.timeB.id === meuClube.id);
            if(conf) {
                let adv = conf.timeA.id === meuClube.id ? conf.timeB : conf.timeA;
                const cfgCal = obterConfigCalendarioCompeticao(copa.id);
                adicionarEventoCalendario({ tipo: `${copa.nome} (${state.fase} - Ida)`, compId: copa.id, adversarioId: adv.id, isMataMata: true, perna: 1, fase: state.fase }, obterSlotCopaCalendario(copa.id, state.fase, 1), cfgCal.janela, cfgCal.modelo);
                if (state.fase !== "Final") adicionarEventoCalendario({ tipo: `${copa.nome} (${state.fase} - Volta)`, compId: copa.id, adversarioId: adv.id, isMataMata: true, perna: 2, fase: state.fase }, obterSlotCopaCalendario(copa.id, state.fase, 2), cfgCal.janela, cfgCal.modelo);
            }
        }
    });

    for (const [torneioId, estado] of Object.entries(copasEstado)) {
        const compTorneio = competicoes.find(c=>c.id===torneioId);
        
        // 🏆 SÉRIE D (Brasil) - formato de grupos com jogos ida e volta
        if (compTorneio?.tipo === "liga_grupos" && estado.tipo === "grupos") {
            estado.grupos.forEach(grp => {
                if(grp.equipas.find(e => e.id === meuClube.id)) {
                    let advs = grp.equipas.filter(e => e.id !== meuClube.id);
                    let nome = compTorneio.nome || "Série D";
                    const cfgCal = obterConfigCalendarioCompeticao(torneioId);
                    
                    // Jogos ida e volta contra cada adversário do grupo (10 jogos no total)
                    let rodada = 1;
                    advs.forEach(adv => {
                        // Jogo de ida
                        adicionarEventoCalendario({ tipo: `${nome} (${grp.nome} - Ida)`, compId: torneioId, fase: "Grupos", adversarioId: adv.id, isMataMata: false, emCasa: true, rodadaGrupo: rodada }, obterSlotCompeticaoCalendario(torneioId, "Grupos", 1, rodada), cfgCal.janela, cfgCal.modelo);
                        rodada++;
                        // Jogo de volta
                        adicionarEventoCalendario({ tipo: `${nome} (${grp.nome} - Volta)`, compId: torneioId, fase: "Grupos", adversarioId: adv.id, isMataMata: false, emCasa: false, rodadaGrupo: rodada }, obterSlotCompeticaoCalendario(torneioId, "Grupos", 1, rodada), cfgCal.janela, cfgCal.modelo);
                        rodada++;
                    });
                }
            });
        }
        
        if (compTorneio?.isContinental || ["continental", "supercopa_continental", "torneio_intercontinental"].includes(compTorneio?.tipo)) {
            if (estado.tipo === "liga_unica" && estado.fixtures) {
                let meusJogos = estado.fixtures.filter(f => f.home.id === meuClube.id || f.away.id === meuClube.id).sort((a,b) => a.rodada - b.rodada);
                let nome = competicoes.find(c => c.id === torneioId)?.nome || "Fase de Liga";
                meusJogos.forEach(f => {
                    const souMandante = f.home.id === meuClube.id;
                    const advId = souMandante ? f.away.id : f.home.id;
                    const cfgCal = obterConfigCalendarioCompeticao(torneioId);
                    adicionarEventoCalendario({ tipo: `${nome} (Fase de Liga J${f.rodada})`, compId: torneioId, fase: "Fase de Liga", adversarioId: advId, isMataMata: false, emCasa: souMandante, rodadaLigaSuica: f.rodada }, obterSlotContinentalCalendario(torneioId, "Fase de Liga", 1, f.rodada), cfgCal.janela, cfgCal.modelo);
                });
            } else if(estado.tipo === "grupos") {
                estado.grupos.forEach(grp => {
                    if(grp.equipas.find(e => e.id === meuClube.id)) {
                        let advs = grp.equipas.filter(e => e.id !== meuClube.id);
                        let nome = competicoes.find(c => c.id === torneioId)?.nome || "Continental";
                        for(let r=0; r<6; r++) {
                            const cfgCal = obterConfigCalendarioCompeticao(torneioId);
                            adicionarEventoCalendario({ tipo: `${nome} (Grupo J${r+1})`, compId: torneioId, fase: "Grupos", adversarioId: advs[r%advs.length].id, isMataMata: false }, obterSlotContinentalCalendario(torneioId, "Grupos", 1, r + 1), cfgCal.janela, cfgCal.modelo);
                        }
                    }
                });
            } else if(estado.tipo === "mata-mata" && estado.confrontos) {
                let conf = estado.confrontos.find(c => c.timeA.id === meuClube.id || c.timeB.id === meuClube.id);
                if(conf && !conf.vencedorId) { 
                    let adv = conf.timeA.id === meuClube.id ? conf.timeB : conf.timeA;
                    let nome = competicoes.find(c => c.id === torneioId)?.nome || "Continental";
                    const cfgCal = obterConfigCalendarioCompeticao(torneioId);
                    adicionarEventoCalendario({ tipo: `${nome} (${estado.fase} - Ida)`, compId: torneioId, adversarioId: adv.id, isMataMata: true, perna: 1, fase: estado.fase }, obterSlotContinentalCalendario(torneioId, estado.fase, 1), cfgCal.janela, cfgCal.modelo);
                    if (numeroPernasConfronto(torneioId, estado, estado.fase) === 2) adicionarEventoCalendario({ tipo: `${nome} (${estado.fase} - Volta)`, compId: torneioId, adversarioId: adv.id, isMataMata: true, perna: 2, fase: estado.fase }, obterSlotContinentalCalendario(torneioId, estado.fase, 2), cfgCal.janela, cfgCal.modelo);
                }
            }
        }
    }
    agendarJogosInternacionais();
    normalizarAgendaCalendario();
}

function simularRodadaMundial() {
    let compAtual = agendaTemporada[rodadaAtual - 1];
    verificarJanelaMeioAno();
    processarEventosAleatorios();
    if (jogador?.lifestyle && typeof window.awardWeeklyTrainingPoints === 'function') window.awardWeeklyTrainingPoints();
    // 🛡️ NOTA: processarJanelaSelecoes()/processarJanelaSelecoesBase() NÃO são
    // chamadas aqui de propósito — no modo online, esta função só corre no
    // "anfitrião do mundo" (ver simularRodadaMundialOnline), mas a convocação
    // para a seleção é algo PESSOAL de cada jogador. Por isso são chamadas
    // separadamente, sempre, por window.simularRodadaMundialOnline() abaixo.
    simularTorneiosInternacionais();
    
    for (const [ligaId, tabela] of Object.entries(tabelasLigas)) {
        let maxJogos = (tabela.length - 1) * 2;
        let timesParaSimular = tabela.filter(t =>
            t.jogos < maxJogos &&
            (ligaId !== competicoes.find(c=>c.id===compAtual?.compId)?.id || t.id !== jogador.clubeId) &&
            !(managerEstado?.ativo && t.id === managerEstado.clubeId)
        );
        timesParaSimular.sort(() => Math.random() - 0.5);
        for (let i = 0; i < timesParaSimular.length - 1; i += 2) {
            let tC = timesParaSimular[i]; let tV = timesParaSimular[i+1];
            let cC = clubes.find(c => c.id === tC.id); let cV = clubes.find(c => c.id === tV.id);
            let diff = ((cC?.reputacao || 60) - (cV?.reputacao || 60)) / 20;
            let gC = Math.random() + diff + 0.1 > 0.5 ? Math.floor(Math.random()*4) : 0; 
            let gV = Math.random() - diff > 0.6 ? Math.floor(Math.random()*3) : 0;
            
            tC.jogos++; tV.jogos++; tC.gols+=gC; tC.golsSofridos+=gV; tV.gols+=gV; tV.golsSofridos+=gC;
            if(gC>gV){ tC.pontos+=3; tC.vitorias=(tC.vitorias||0)+1; tV.derrotas=(tV.derrotas||0)+1; } 
            else if(gV>gC){ tV.pontos+=3; tV.vitorias=(tV.vitorias||0)+1; tC.derrotas=(tC.derrotas||0)+1; } 
            else { tC.pontos+=1; tV.pontos+=1; tC.empates=(tC.empates||0)+1; tV.empates=(tV.empates||0)+1; }
            atribuirEstatisticaNPC(tC.id, gC, ligaId, gV); atribuirEstatisticaNPC(tV.id, gV, ligaId, gC);
        }
    }

    for (const [compId, estado] of Object.entries(copasEstado)) {
        if (estado.tipo === "grupos") {
            // 🛡️ FIX (Série D nunca chegava ao mata-mata — "o ano acabava antes"):
            // esta competição "grupos" no nível de clube é usada SÓ pela Série D
            // (br_4). O "hasPlayerFixture" abaixo comparava adversarioId/
            // mandanteId ao ID DO PRÓPRIO CLUBE do jogador — campos que nunca
            // guardam isso (adversarioId é sempre o ADVERSÁRIO, e os jogos da
            // Série D nem têm "mandanteId", usam "emCasa"). Ou seja,
            // hasPlayerFixture era SEMPRE falso, e como "br_4" também não bate
            // em nenhum dos includes() de isContinentalCup, a simulação de
            // fundo (as OUTRAS 15 equipas do grupo) só avançava com 25% de
            // chance por semana — precisando de ~40 semanas em média para
            // completar as 10 rodadas, quando só há ~27 disponíveis (slots
            // 12 a 39) antes do failsafe de fim de temporada forçar a Gala.
            // Resultado: o grupo nunca fechava e o mata-mata da Série D nunca
            // começava. Como o fechamento já é protegido corretamente logo
            // abaixo por grupoDoJogadorCompleto (só fecha depois que os
            // jogos do PRÓPRIO jogador realmente terminaram), não há motivo
            // pra também travar o avanço de fundo — agora ele roda toda
            // semana, como qualquer rodada normal de liga.
            if (estado.rodadaAtual <= (estado.maxRodadas || 6)) {
                estado.grupos.forEach(grp => {
                    let tSim = grp.equipas.filter(e => e.id !== jogador.clubeId); tSim.sort(() => Math.random() - 0.5);
                    for(let i=0; i<tSim.length-1; i+=2) {
                        let tA = tSim[i]; let tB = tSim[i+1];
                        let cA = clubes.find(c=>c.id===tA.id); let cB = clubes.find(c=>c.id===tB.id);
                        let df = ((cA?.reputacao||60) - (cB?.reputacao||60))/20;
                        let gA = Math.random()+df+0.1>0.6?Math.floor(Math.random()*3)+1:0; let gB = Math.random()-df>0.6?Math.floor(Math.random()*3)+1:0;
                        tA.j++; tB.j++; tA.gf+=gA; tA.gs+=gB; tB.gf+=gB; tB.gs+=gA;
                        if(gA>gB) tA.pts+=3; else if(gB>gA) tB.pts+=3; else { tA.pts+=1; tB.pts+=1; }
                        atribuirEstatisticaNPC(tA.id, gA, compId, gB); atribuirEstatisticaNPC(tB.id, gB, compId, gA);
                    }
                });
                estado.rodadaAtual++;
            }
            if (estado.rodadaAtual > (estado.maxRodadas || 6) && grupoDoJogadorCompleto(estado, estado.maxRodadas || 6)) {
                processarFimGruposClube(compId, estado);
            }
        } else if (estado.tipo === "liga_unica" && estado.fixtures && estado.rodadaAtual <= 8) {
            // Mesmo princípio da correção acima: só considera que "tenho jogo
            // pendente" nesta rodada se o MEU jogo desta rodada específica ainda
            // não foi resolvido — nunca trava esperando uma rodada que já passou.
            const jogosRodada = estado.fixtures.filter(f => f.rodada === estado.rodadaAtual);
            const meuJogoPendente = jogosRodada.some(f => (f.home.id === jogador.clubeId || f.away.id === jogador.clubeId) && f.golsHome === undefined);
            const simularHoje = (!compAtual) || (compAtual.compId === compId) || (!meuJogoPendente && rodadaAtual % 3 === 0);

            if (simularHoje) {
                jogosRodada.forEach(f => {
                    if (f.home.id === jogador.clubeId || f.away.id === jogador.clubeId) return; // meu jogo é resolvido quando eu jogo, na tela de partida
                    if (f.golsHome !== undefined) return;
                    const cA = clubes.find(c=>c.id===f.home.id); const cB = clubes.find(c=>c.id===f.away.id);
                    let df = ((cA?.reputacao||60) - (cB?.reputacao||60))/20;
                    let gA = Math.random()+df+0.1>0.5?Math.floor(Math.random()*3):0;
                    let gB = Math.random()-df>0.5?Math.floor(Math.random()*3):0;
                    f.golsHome = gA; f.golsAway = gB;
                    const tH = estado.tabela.find(t=>t.id===f.home.id); const tA = estado.tabela.find(t=>t.id===f.away.id);
                    if (tH) { tH.j++; tH.gf+=gA; tH.gs+=gB; if(gA>gB) tH.pts+=3; else if(gA===gB) tH.pts+=1; }
                    if (tA) { tA.j++; tA.gf+=gB; tA.gs+=gA; if(gB>gA) tA.pts+=3; else if(gA===gB) tA.pts+=1; }
                    atribuirEstatisticaNPC(f.home.id, gA, compId, gB); atribuirEstatisticaNPC(f.away.id, gB, compId, gA);
                });
                if (jogosRodada.every(f => f.golsHome !== undefined)) {
                    estado.rodadaAtual++;
                    if (estado.rodadaAtual > 8) processarFimLigaSuica(compId);
                }
            }
        } else if (estado.tipo === "mata-mata" && estado.confrontos) {
            // sem checar se já tinha vencedorId. Resultado: assim que eu jogava a
            // minha ida/volta e o meu confronto ficava resolvido, o meu confronto
            // continuava "presente" no array — então temJogoMeu ficava true PARA
            // SEMPRE naquela fase, e os OUTROS confrontos (só entre times da IA)
            // nunca mais eram simulados (porque só simulavam quando compAtual
            // fosse essa competição, ou quando eu não tivesse jogo nela). A fase
            // ficava travada, sem nunca ter todos os vencedorId definidos, então
            // avancarFaseMataMata() nunca era chamado — e a próxima fase (ex:
            // Quartas) só era "resolvida" à força, com placares aleatórios, no
            // forcarFimDeCopas() lá no fim da temporada. Isso é exatamente o bug
            // relatado: oitavas acontecem normalmente, mas quartas em diante ficam
            // travadas e os adversários que aparecem depois não batem com quem
            // realmente avançou.
            let temJogoMeu = estado.confrontos.some(c => (c.timeA.id === jogador.clubeId || c.timeB.id === jogador.clubeId) && !c.vencedorId);
            let simularHoje = (!compAtual) || (compAtual.compId === compId) || (!temJogoMeu && rodadaAtual % 3 === 0);

            if (simularHoje) {
                estado.confrontos.forEach(conf => {
                    if(conf.timeA.id !== jogador.clubeId && conf.timeB.id !== jogador.clubeId && !conf.vencedorId) {
                        let cC = clubes.find(c=>c.id===conf.timeA.id); let cV = clubes.find(c=>c.id===conf.timeB.id);
                        let df = ((cC?.reputacao||60) - (cV?.reputacao||60))/20;
                        let gC = Math.random()+df>0.5?Math.floor(Math.random()*3):0; let gV = Math.random()-df>0.5?Math.floor(Math.random()*2):0;
                        
                        if(conf.golsAIda === null) { 
                            conf.golsAIda = gC; conf.golsBIda = gV; 
                            const fA = clubes.find(c=>c.id===conf.timeA.id)?.reputacao || 70;
                            const fB = clubes.find(c=>c.id===conf.timeB.id)?.reputacao || 70;
                            const res = resolverVencedorMataMata(conf.timeA.id, conf.timeB.id, gC, gV, fA, fB);
                            if (estado.jogoUnico || ((estado.fase === "Final" || estado.fase.includes("Supercopa")) && estado.pernasFinal !== 2)) { conf.vencedorId = res.vencedorId; conf.penaltis = res.penaltis; }
                        } else if (conf.golsAVolta === null) { 
                            conf.golsAVolta = gC; conf.golsBVolta = gV; 
                            let agA = conf.golsAIda + conf.golsAVolta; let agB = conf.golsBIda + conf.golsBVolta;
                            const fA = clubes.find(c=>c.id===conf.timeA.id)?.reputacao || 70;
                            const fB = clubes.find(c=>c.id===conf.timeB.id)?.reputacao || 70;
                            const res = resolverVencedorMataMata(conf.timeA.id, conf.timeB.id, agA, agB, fA, fB);
                            conf.vencedorId = res.vencedorId; conf.penaltis = res.penaltis;
                        }
                        atribuirEstatisticaNPC(conf.timeA.id, gC, compId, gV); atribuirEstatisticaNPC(conf.timeB.id, gV, compId, gC);
                    }
                });
                if(estado.confrontos.every(c => c.vencedorId) && estado.confrontos.length >= 1) avancarFaseMataMataDispatch(compId);
            }
        }
    }
}

// ==========================================
// 🌐 MUNDO REALMENTE COMPARTILHADO — SIMULAÇÃO ÚNICA
// ==========================================
// No modo online, a rodada mundial (tabelas de todas as ligas + copas) só
// pode ser calculada por UM dos dois jogadores (o "anfitrião do mundo",
// decidido automaticamente) e depois partilhada — senão cada um vê ligas
// diferentes (ex: "no meu Bayern lidera, no teu é o Borussia"). Esta função
// substitui as chamadas diretas a simularRodadaMundial() nos pontos em que
// a rodada avança.
window.simularRodadaMundialOnline = async function() {
    // 🧑 PESSOAL: a convocação para a seleção (principal e de base) é sempre
    // processada no MEU cliente, mesmo quando não sou o "anfitrião do mundo"
    // (que só calcula as tabelas/copas partilhadas). Sem isto, quem não fosse
    // anfitrião nunca seria convocado para a seleção enquanto jogasse online.
    processarJanelaSelecoes();
    processarJanelaSelecoesBase();

    if (window.connectionMode !== 'online' || !window.firebaseIntegration) {
        simularRodadaMundial();
        return;
    }

    const souHost = window.firebaseIntegration.souHostDoMundo();
    if (souHost) {
        simularRodadaMundial();
        window.firebaseIntegration.transmitirEstadoMundial(rodadaAtual, anoAtual, {
            tabelasLigas: JSON.parse(JSON.stringify(tabelasLigas)),
            copasEstado: JSON.parse(JSON.stringify(copasEstado))
        });
    } else {
        const estado = await window.firebaseIntegration.obterEstadoMundial(rodadaAtual, anoAtual);
        if (estado && estado.tabelasLigas) {
            for (let key in tabelasLigas) delete tabelasLigas[key];
            Object.assign(tabelasLigas, estado.tabelasLigas);
            for (let key in copasEstado) delete copasEstado[key];
            Object.assign(copasEstado, estado.copasEstado || {});
        } else {
            // Falha de rede/timeout: melhor simular localmente do que travar o jogador para sempre.
            simularRodadaMundial();
        }
    }
};

// ==========================================
// 🚨 VIRADA DE TEMPORADA E FIM DE COPAS
// ==========================================
function forcarFimDeCopas() {
    let loopSafety = 100;
    while(loopSafety > 0) {
        let pendente = false;
        for (const [compId, estado] of Object.entries(copasEstado)) {
            if (estado.tipo === "liga_unica" && estado.fixtures) {
                pendente = true;
                // Preenche à força qualquer jogo restante (incluindo o meu, se eu não
                // tiver conseguido jogar todas as 8 rodadas) só para a fase de liga
                // conseguir fechar e o playoff/oitavas serem gerados corretamente.
                estado.fixtures.forEach(f => {
                    if (f.golsHome === undefined) {
                        const gA = Math.floor(Math.random()*3); const gB = Math.floor(Math.random()*2);
                        f.golsHome = gA; f.golsAway = gB;
                        const tH = estado.tabela.find(t=>t.id===f.home.id); const tA = estado.tabela.find(t=>t.id===f.away.id);
                        if (tH) { tH.j++; tH.gf+=gA; tH.gs+=gB; if(gA>gB) tH.pts+=3; else if(gA===gB) tH.pts+=1; }
                        if (tA) { tA.j++; tA.gf+=gB; tA.gs+=gA; if(gB>gA) tA.pts+=3; else if(gA===gB) tA.pts+=1; }
                    }
                });
                processarFimLigaSuica(compId);
                continue;
            }
            if (estado.tipo === "grupos" && estado.grupos && estado.fase !== "Campeão Definido") {
                pendente = true;
                processarFimGruposClube(compId, estado);
                continue;
            }
            if (estado.fase !== "Campeão Definido" && estado.fase !== "Vaga Definida" && estado.confrontos && estado.confrontos.length > 0) {
                pendente = true;
                estado.confrontos.forEach(conf => {
                    if(!conf.vencedorId) {
                        let gC = Math.floor(Math.random()*3); let gV = Math.floor(Math.random()*2);
                        const fA = clubes.find(c=>c.id===conf.timeA.id)?.reputacao || 70;
                        const fB = clubes.find(c=>c.id===conf.timeB.id)?.reputacao || 70;
                        if(conf.golsAIda === null) { conf.golsAIda = gC; conf.golsBIda = gV;
                        if (estado.jogoUnico || (estado.fase === "Final" && estado.pernasFinal !== 2)) { const res = resolverVencedorMataMata(conf.timeA.id, conf.timeB.id, gC, gV, fA, fB); conf.vencedorId = res.vencedorId; conf.penaltis = res.penaltis; }
                        } else if (conf.golsAVolta === null) { conf.golsAVolta = gC; conf.golsBVolta = gV;
                            let agA = conf.golsAIda + conf.golsAVolta; let agB = conf.golsBIda + conf.golsBVolta;
                            const res = resolverVencedorMataMata(conf.timeA.id, conf.timeB.id, agA, agB, fA, fB);
                            conf.vencedorId = res.vencedorId; conf.penaltis = res.penaltis;
                        }
                    }
                });
                if(estado.confrontos.every(c => c.vencedorId)) avancarFaseMataMataDispatch(compId);
            }
        }
        if(!pendente) break;
        loopSafety--;
    }
}


window.avancarTemporada = function() {
    try {
        forcarFimDeCopas();

        if(!jogador.estatisticasAtuais.assistencias) jogador.estatisticasAtuais.assistencias = 0;
    if(!jogador.estatisticasAtuais.defesas) jogador.estatisticasAtuais.defesas = 0;
        jogador.historicoCarreira.unshift({ ano: anoAtual, clube: clubes.find(c=>c.id===jogador.clubeId)?.nome || "Livre", jogos: jogador.estatisticasAtuais.jogos, gols: jogador.estatisticasAtuais.gols, assistencias: jogador.estatisticasAtuais.assistencias, trofeus: "-" });
        if(jogador.clubeOrigemEmprestimo && jogador.emprestadoAte <= anoAtual) {
            let origem = clubes.find(c => c.id === jogador.clubeOrigemEmprestimo);
            registrarNoticia("Fim de empréstimo", `${jogador.nome} regressou ao ${origem?.nome || "clube de origem"} após o fim da temporada.`, "Mercado");
            jogador.clubeId = jogador.clubeOrigemEmprestimo; delete jogador.clubeOrigemEmprestimo; delete jogador.emprestadoAte;
            jogador.jogosNoClubeAtual = 0; jogador.tecnicoConhecido = null; jogador.statusEscalacaoAnterior = null;
        }
        jogador.idade = (jogador.idade || 17) + 1;
        {
            // 📈📉 Delta anual de OVR por idade — igual ao critério de antes,
            // só que agora aplicado através de evoluirAtributosEGeral() para
            // também mexer nos atributos individuais, não só no número do OVR.
            let deltaJogador = 0;
            if(jogador.idade <= 22) deltaJogador += Math.floor(Math.random() * 2) + 1;
            else if(jogador.idade <= 27 && Math.random() > 0.55) deltaJogador += 1;
            // O declínio só começa DEPOIS dos 35. A partir daí, os atributos
            // individuais (e por consequência o OVR) caem a cada temporada.
            if(jogador.idade > 35) deltaJogador -= Math.floor(Math.random() * 2) + 1;
            evoluirAtributosEGeral(jogador, deltaJogador);
        }

        // A aposentadoria do personagem é uma decisão exclusiva do jogador.
        // Não há mais sorteio automático, nem para clube nem para seleção.

        // Clear rejected clubs at start of new season (fresh start)
        if(jogador.clubesRejeitados) jogador.clubesRejeitados = [];
        
        // Increment years at current club
        jogador.anoNoClubeAtual = (jogador.anoNoClubeAtual || 0) + 1;

        jogadoresIA.forEach(j => {
            if(j.aposentado) return;
            if(!j.historicoCarreira) j.historicoCarreira = [];
            j.historicoCarreira.unshift({ ano: anoAtual, clube: clubes.find(c=>c.id===j.clubeId)?.nome || "Livre", jogos: j.statsTemporada?.jogos || 0, gols: j.statsTemporada?.gols || 0, assistencias: j.statsTemporada?.assistencias || 0, trofeus: "-" });
            if(j.clubeOrigemEmprestimo && j.emprestadoAte <= anoAtual) {
                j.clubeId = j.clubeOrigemEmprestimo; delete j.clubeOrigemEmprestimo; delete j.emprestadoAte;
            }
            j.idade = (j.idade || 20) + 1;
            {
                let deltaJ = 0;
                if (j.idade <= 22) deltaJ += Math.floor(Math.random() * 3) + 1; else if (j.idade <= 25 && Math.random() > 0.6) deltaJ += 1;
                if (j.idade > 35) deltaJ -= Math.floor(Math.random() * 3) + 1;
                // 🆕 Desacelera perto do teto de potencial — sem isto, um jovem
                // "mediano" continuava subindo até virar craque só por causa da
                // idade, sem nenhum limite pessoal de talento.
                if (deltaJ > 0) {
                    const potencial = obterOuGerarPotencial(j);
                    const margem = potencial - (j.geral || 60);
                    deltaJ = margem <= 0 ? 0 : Math.min(deltaJ, Math.max(1, Math.ceil(margem * 0.5)));
                }
                evoluirAtributosEGeral(j, deltaJ);
            }
            j.valorMercadoNum = calcularValorMercadoJogador(j);
            if (Math.random() < (j.idade >= 39 ? 1.0 : (j.idade >= 36 ? 0.45 : 0))) { j.aposentado = true; j.clubeId = "aposentado"; j.valorMercadoNum = 0; j.contrato = 0; }
        });

        premiosIndividuaisPendentes.forEach(premio => {
            let vencedor = premio.playerId === "player" ? jogador : jogadoresIA.find(j => j.id === premio.playerId);
            if(!vencedor || !vencedor.historicoCarreira?.[0]) return;
            let hist = vencedor.historicoCarreira[0];
            hist.trofeus = hist.trofeus === "-" ? premio.nome : hist.trofeus + ", " + premio.nome;
            vencedor.pontosPremio = (vencedor.pontosPremio || 0) + (premio.pontos || 15);
        });
        premiosIndividuaisPendentes = [];

        // Os campeões e os pontos de título desta temporada já foram apurados mais
        // cedo (ver apurarCampeoesTemporada, chamada antes da Gala) para que a Bola
        // de Ouro reflita as taças ganhas NESTA mesma época. Aqui só escrevemos o
        // nome do troféu no histórico de carreira, que só passou a existir agora.
        titulosClubesPendentes.forEach(t => {
            let vencedor = t.playerId === "player" ? jogador : jogadoresIA.find(j => j.id === t.playerId);
            if(!vencedor || !vencedor.historicoCarreira?.[0]) return;
            let hist = vencedor.historicoCarreira[0];
            hist.trofeus = hist.trofeus === "-" ? t.nomeTrofeu : hist.trofeus + ", " + t.nomeTrofeu;
        });
        titulosClubesPendentes = [];

        let descidas = [];
        let subidas = [];

        for (const [ligaId, tabela] of Object.entries(tabelasLigas)) {
            let tabOrd = [...tabela].sort((a,b) => b.pontos - a.pontos || ((b.gols||0) - (b.golsSofridos||0)) - ((a.gols||0) - (a.golsSofridos||0)) || (b.gols||0) - (a.gols||0));

            // ==========================================
            // 🔄 NOVA LÓGICA DINÂMICA DE ASCENSÃO E QUEDA
            // ==========================================
            let matchDiv = ligaId.match(/_(\d+)$/); // Captura o número da divisão no fim do ID (ex: 1, 2, 3, 4)

            if (matchDiv) {
                let divAtual = parseInt(matchDiv[1]);

                // 📉 REGRA DE REBAIXAMENTO (Cair)
                let proximaDivId = ligaId.replace(`_${divAtual}`, `_${divAtual + 1}`);
                if (tabelasLigas[proximaDivId] && tabOrd.length > 4) {
                    descidas.push({ from: ligaId, to: proximaDivId, teams: tabOrd.slice(-3).map(t => t.id) });
                }

                // 📈 REGRA DE ACESSO (Subir)
                // 🛡️ SÉRIE D (liga_grupos): não usa a tabela genérica de bastidores
                // para decidir o acesso — o acesso já é decidido pelo próprio
                // mata-mata (2 finalistas + vencedor do playoff de acesso), ver bloco
                // dedicado logo abaixo.
                const compInfoAtual = competicoes.find(c => c.id === ligaId);
                let divAnteriorId = ligaId.replace(`_${divAtual}`, `_${divAtual - 1}`);
                if (divAtual > 1 && tabelasLigas[divAnteriorId] && tabOrd.length > 3 && compInfoAtual?.tipo !== "liga_grupos") {
                    subidas.push({ from: ligaId, to: divAnteriorId, teams: tabOrd.slice(0, 3).map(t => t.id) });
                }
            }
        }

        // 🏆 SÉRIE D (Brasil): acesso à Série C é definido pelo mata-mata — os 2
        // finalistas (garantidos ao chegarem à final) e o vencedor do Playoff de
        // Acesso entre os 2 eliminados nas semifinais (jogo único).
        competicoes.filter(c => c.tipo === "liga_grupos").forEach(comp => {
            const estadoSerieD = copasEstado[comp.id];
            if (estadoSerieD && Array.isArray(estadoSerieD.promovidosSerieC) && estadoSerieD.promovidosSerieC.length > 0) {
                const divAnteriorId = comp.id.replace(`_${comp.div}`, `_${comp.div - 1}`);
                if (tabelasLigas[divAnteriorId]) {
                    subidas.push({ from: comp.id, to: divAnteriorId, teams: estadoSerieD.promovidosSerieC.slice(0, 3) });
                }
            }
        });

        // Executa as transferências de liga de forma definitiva
        descidas.forEach(d => d.teams.forEach(tId => { let c = clubes.find(x=>x.id===tId); if(c) c.ligaId = d.to; }));
        subidas.forEach(s => s.teams.forEach(tId => { let c = clubes.find(x=>x.id===tId); if(c) c.ligaId = s.to; }));

        // 👔 Carrossel de treinadores da temporada — precisa correr AQUI, com
        // a tabelasLigas ainda com os dados da época que terminou (antes de
        // advanceSeasonInternal() limpar tudo para a próxima).
        processarCarrosselTreinadores(tabelasLigas);
        avaliarContinuidadeManagerJogador();

        // Check if all players are ready before advancing season (online mode)
        if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode()) {
            window.firebaseIntegration.canAdvanceToNextSeason().then(canAdvance => {
                if (!canAdvance) {
                    mostrarToast("Aguardando Amigo", "Seu amigo ainda não terminou a temporada atual.", "warning");
                    document.getElementById("btnJogarHub").disabled = false;
                    return;
                }
                // Proceed with season advancement
                advanceSeasonInternal();
            });
            return; // Exit early, will be called by the promise
        }

        advanceSeasonInternal();
    } catch (e) {
        console.error("Erro ao avançar temporada:", e);
        mostrarToast("Erro Crítico", "Ocorreu um erro ao virar a temporada.", "danger");
    }
};

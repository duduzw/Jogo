function normalizarNacionalidade(valor) {
    const n = normalizarTexto(String(valor || ""));
    if(n.includes("brasil")) return "Brasil";
    if(n.includes("argentina")) return "Argentina";
    if(n.includes("uruguai")) return "Uruguai";
    if(n.includes("col")) return "Colombia";
    if(n.includes("equador")) return "Equador";
    if(n.includes("portugal")) return "Portugal";
    if(n.includes("espan")) return "Espanha";
    if(n.includes("ital")) return "Italia";
    if(n.includes("ingla")) return "Inglaterra";
    if(n.includes("fran") || n.includes("frana")) return "França";
    if(n.includes("aleman") || n.includes("german")) return "Alemanha";
    if(n.includes("holanda") || n.includes("paises baixos")) return "Holanda";
    if(n.includes("belg")) return "Belgica";
    if(n.includes("turq")) return "Turquia";
    if(n.includes("mex")) return "Mexico";
    if(n.includes("estado") || n.includes("eua")) return "Estados Unidos";
    if(n.includes("senegal")) return "Senegal";
    if(n.includes("marro")) return "Marrocos";
    if(n.includes("jap")) return "Japao";
    if(n.includes("coreia")) return "Coreia do Sul";
    if(n.includes("chile")) return "Chile";
    if(n.includes("paragu")) return "Paraguai";
    if(n.includes("peru")) return "Peru";
    if(n.includes("venez")) return "Venezuela";
    if(n.includes("boliv")) return "Bolivia";
    if(n.includes("croac")) return "Croacia";
    if(n.includes("suic")) return "Suica";
    if(n.includes("austri")) return "Austria";
    if(n.includes("polon")) return "Polonia";
    if(n.includes("suec")) return "Suecia";
    if(n.includes("norue")) return "Noruega";
    if(n.includes("dinam")) return "Dinamarca";
    if(n.includes("serv")) return "Servia";
    if(n.includes("ucr")) return "Ucrania";
    if(n.includes("costa r")) return "Costa Rica";
    if(n.includes("canad")) return "Canada";
    if(n.includes("jamaic")) return "Jamaica";
    if(n.includes("egito")) return "Egito";
    if(n.includes("niger")) return "Nigeria";
    if(n.includes("camar")) return "Camaroes";
    if(n.includes("gana")) return "Gana";
    if(n.includes("argel")) return "Argelia";
    if(n.includes("austral")) return "Australia";
    if(n.includes("arab") || n.includes("saud")) return "Arabia Saudita";
    if(n.includes("ira") && !n.includes("irland")) return "Ira";
    if(n.includes("cata")) return "Catar";
    if(n.includes("costa")) return "Costa do Marfim";
    return valor || "Sem seleção";
}

function obterSelecaoPorNacionalidade(nacionalidade) {
    const alvo = normalizarNacionalidade(nacionalidade);
    return SELECOES.find(s => normalizarNacionalidade(s.pais) === alvo) || { id:`sel_${normalizarTexto(alvo).slice(0,3)}`, pais:alvo, nome:alvo, conf:"GLOBAL", logo:"", cor:"#00ff88" };
}

function obterDivisaoNations(selecao) {
    if(selecao.conf !== "UEFA") return null;
    if(selecoesEstado.nationsDiv?.[selecao.id]) return selecoesEstado.nationsDiv[selecao.id];
    const pais = normalizarNacionalidade(selecao.pais);
    const tierA = ["França", "Alemanha", "Espanha", "Inglaterra", "Italia", "Portugal", "Holanda", "Belgica"];
    const tierB = ["Turquia"];
    let div = tierA.includes(pais) ? "A" : tierB.includes(pais) ? "B" : "C";
    if(!selecoesEstado.nationsDiv) selecoesEstado.nationsDiv = {};
    selecoesEstado.nationsDiv[selecao.id] = div;
    return div;
}

function obterCompeticaoSelecao(selecao, ano = anoAtual, rodada = rodadaAtual) {
    const slotAtual = Math.floor(obterSlotCalendarioAtual());
    const janelaFinalTemporada = slotAtual >= 44;
    const janelaMeioAno = slotAtual >= 22 && slotAtual <= 28;

    if(ano % 4 === 2 && janelaFinalTemporada) return COMPETICOES_SELECOES.find(c => c.id === "copa_mundo");
    if(ano % 4 === 0 && slotAtual >= 49) return COMPETICOES_SELECOES.find(c => c.id === "olimpiadas");
    if(ano % 4 === 0 && janelaFinalTemporada && selecao.conf === "UEFA") return COMPETICOES_SELECOES.find(c => c.id === "euro");
    if(ano % 4 === 0 && janelaMeioAno && selecao.conf === "CONMEBOL") return COMPETICOES_SELECOES.find(c => c.id === "copa_america");
    if(ano % 4 === 0 && janelaMeioAno && selecao.conf === "CONCACAF") return COMPETICOES_SELECOES.find(c => c.id === "gold_cup");
    if(ano % 4 === 0 && slotAtual >= 22 && slotAtual <= 26 && selecao.conf === "CAF") return COMPETICOES_SELECOES.find(c => c.id === "copa_africa");
    if(ano % 4 === 0 && slotAtual >= 22 && slotAtual <= 26 && selecao.conf === "AFC") return COMPETICOES_SELECOES.find(c => c.id === "copa_asia");
    if(ano % 4 === 0 && janelaMeioAno && selecao.conf === "OFC") return COMPETICOES_SELECOES.find(c => c.id === "oceania_cup");
    if(selecao.conf === "UEFA" && ano % 2 === 1 && ehJanelaSelecaoCalendario(slotAtual)) {
        const div = (obterDivisaoNations(selecao) || "C").toLowerCase();
        return COMPETICOES_SELECOES.find(c => c.id === `nations_${div}`) || COMPETICOES_SELECOES.find(c => c.id === "nations_c");
    }
    if(selecao.conf === "UEFA" && ano % 4 === 3 && ehJanelaSelecaoCalendario(slotAtual)) return COMPETICOES_SELECOES.find(c => c.id === "euro_qualy");
    if(ano % 4 === 1 && ehJanelaSelecaoCalendario(slotAtual)) {
        const mapElim = { UEFA:"eliminatorias_uefa", CONMEBOL:"eliminatorias_conmebol", CONCACAF:"eliminatorias_concacaf", CAF:"eliminatorias_caf", AFC:"eliminatorias_afc", OFC:"eliminatorias_ofc" };
        return COMPETICOES_SELECOES.find(c => c.id === (mapElim[selecao.conf] || "eliminatorias_uefa"));
    }
    if(ehJanelaSelecaoCalendario(slotAtual)) return COMPETICOES_SELECOES.find(c => c.id === "amistoso");
    return COMPETICOES_SELECOES.find(c => c.id === "amistoso");
}

function obterJogadoresNacionalidade(pais) {
    const alvo = normalizarNacionalidade(pais);
    // 🛡️ FIX: antes o jogador humano entrava no plantel de QUALQUER país
    // (mesmo não sendo da nacionalidade dele), pois era sempre colocado à
    // frente do array sem checar a nacionalidade. Isso fazia com que, toda
    // vez que a IA simulava um jogo de OUTRA seleção qualquer, o motor de
    // estatísticas (obterPlantelSelecaoParaStatsIA/atribuirStatsPartidaSelecaoIA)
    // pudesse sortear o próprio jogador como autor de jogo/gol/assistência
    // daquele país, inflando jogos/gols da seleção do jogador para valores
    // absurdos (ex: 500 jogos, 700 gols) mesmo tendo jogado só 1 partida real.
    const souDesseTime = jogador && !jogador.aposentadoSelecao && normalizarNacionalidade(jogador.nacionalidade) === alvo;
    return [...(souDesseTime ? [jogador] : []), ...jogadoresIA.filter(j => !j.aposentado && normalizarNacionalidade(j.nacionalidade) === alvo)];
}

function calcularForcaSelecao(selecaoId, sub23 = false) {
    const sel = SELECOES.find(s => s.id === selecaoId);
    if (!sel) return 70;
    let pool = obterJogadoresNacionalidade(sel.pais).filter(j => !j.aposentado);
    if (sub23) {
        const u23 = pool.filter(j => j.idade <= 23).sort((a, b) => (b.geral || 0) - (a.geral || 0));
        const over = pool.filter(j => j.idade > 23).sort((a, b) => (b.geral || 0) - (a.geral || 0)).slice(0, 3);
        pool = [...u23.slice(0, 11), ...over].slice(0, 14);
    } else {
        pool = pool.sort((a, b) => (b.geral || 0) - (a.geral || 0)).slice(0, 14);
    }
    if (pool.length === 0) return 68;
    return pool.reduce((acc, j) => acc + (j.geral || 60), 0) / pool.length;
}

function registrarPlantelTorneio(torneioKey, selecaoId, ids) {
    if(!selecoesEstado.planteisTorneio[torneioKey]) selecoesEstado.planteisTorneio[torneioKey] = {};
    const atual = new Set(selecoesEstado.planteisTorneio[torneioKey][selecaoId] || []);
    ids.forEach(id => atual.add(id));
    selecoesEstado.planteisTorneio[torneioKey][selecaoId] = [...atual];
}

function concederTituloInternacional(selecaoId, nomeComp, torneioKey) {
    const compId = selecoesEstado.torneios?.[torneioKey]?.compConfigId;
    if (isEliminatoria(compId)) return;
    if(!selecoesEstado.campeoes[selecaoId]) selecoesEstado.campeoes[selecaoId] = [];
    selecoesEstado.campeoes[selecaoId].unshift({ ano: anoAtual, nome: nomeComp, torneioKey });
    const pontosTitulo = pontosTituloSelecao(compId);
    let plantel = selecoesEstado.planteisTorneio[torneioKey]?.[selecaoId] || [];
    // 🛡️ FIX: o plantel só era registado para a MINHA própria seleção (e só
    // se eu tivesse sido convocado nessa janela específica) — para qualquer
    // outra seleção campeã (ex: a do "Bruno" nesse exemplo), o plantel ficava
    // vazio e NINGUÉM recebia o troféu nem as estatísticas. Se estiver vazio,
    // reconstrói um plantel plausível na hora, usando o mesmo critério de
    // convocação normal.
    if (plantel.length === 0) {
        const selFallback = SELECOES.find(s => s.id === selecaoId);
        if (selFallback) {
            const compFallback = COMPETICOES_SELECOES.find(c => c.nome === nomeComp) || { id: compId };
            plantel = gerarConvocacaoSelecao(selFallback, compFallback).convocados.map(p => p.id);
        }
    }
    plantel.forEach(pid => {
        const p = pid === "player" ? jogador : jogadoresIA.find(j => j.id === pid);
        if(!p) return;
        if(!p.titulosSelecao) p.titulosSelecao = [];
        p.titulosSelecao.unshift({ ano: anoAtual, selecao: SELECOES.find(s=>s.id===selecaoId)?.nome || "", trofeu: nomeComp });
        if(p.historicoCarreira?.[0]) {
            p.historicoCarreira[0].trofeus = p.historicoCarreira[0].trofeus === "-" ? nomeComp : p.historicoCarreira[0].trofeus + ", " + nomeComp;
        }
        p.pontosPremio = (p.pontosPremio || 0) + pontosTitulo;
        p.pontosPremioTemporada = (p.pontosPremioTemporada || 0) + pontosTitulo;
        if (pid === "player") window.tocarSom('trofeu'); // 🔊 som de troféu quando é o jogador humano
        
        // Push achievement to Firebase if this is the human player and online mode is active
        if (pid === "player" && window.firebaseIntegration && window.firebaseIntegration.isOnlineMode()) {
            window.firebaseIntegration.pushAchievementToFirebase(nomeComp, nomeComp);
        }
        // 🌐 Se quem ganhou foi o AMIGO online (o seu perfil sincronizado está
        // dentro de jogadoresIA com isFirebasePlayer), avisa-o também — mesmo
        // mecanismo usado para os troféus de clube/Bola de Ouro na Gala.
        if (p.isFirebasePlayer && window.firebaseIntegration && window.firebaseIntegration.pushAchievementForPlayerToFirebase) {
            window.firebaseIntegration.pushAchievementForPlayerToFirebase(p.id, nomeComp, nomeComp);
        }
    });
    const sel = SELECOES.find(s => s.id === selecaoId);
    registrarNoticia(`${sel?.nome || "Seleção"} campeã!`, `A Seleção ${sel?.nome} conquistou a ${nomeComp} ${anoAtual}!`, "Seleções", nomeComp, "trofeu", true);
}

function selecionarTimesTorneio(fmt, compConfig) {
    let pool = [...SELECOES];
    if(fmt.conf) pool = pool.filter(s => s.conf === fmt.conf);
    if(fmt.formato === "nations_grupos") pool = pool.filter(s => s.conf === "UEFA");
    else if(fmt.div) pool = pool.filter(s => (obterDivisaoNations(s) || "C") === fmt.div);
    if(fmt.sub23) pool = pool.map(s => ({ ...s, forca: calcularForcaSelecao(s.id) * 0.92 }));
    pool.sort((a,b) => calcularForcaSelecao(b.id) - calcularForcaSelecao(a.id));
    const max = fmt.grupos ? fmt.grupos * fmt.porGrupo : (fmt.maxTimes || pool.length);
    return pool.slice(0, max).map(criarTimeTorneio);
}

function criarGruposTorneio(times, fmt) {
    const grupos = [];
    const shuffled = [...times].sort(() => Math.random() - 0.5);
    for (let g = 0; g < fmt.grupos; g++) {
        const slice = shuffled.slice(g * fmt.porGrupo, (g + 1) * fmt.porGrupo);
        if (slice.length < 2) continue;
        grupos.push({ nome: `Grupo ${String.fromCharCode(65 + g)}`, equipas: slice.map(t => ({ id: t.id, nome: t.nome, pts: 0, j: 0, gf: 0, gs: 0 })) });
    }
    return grupos;
}

function inicializarTorneioInternacional(compConfig) {
    const fmt = FORMATOS_INT[compConfig.id];
    if (!fmt || fmt.formato === "amistoso") return null;
    const key = chaveTorneio(compConfig.id, anoAtual);
    if (selecoesEstado.torneios[key]) return selecoesEstado.torneios[key];

    const times = selecionarTimesTorneio(fmt, compConfig);
    const estado = { compConfigId: compConfig.id, nome: compConfig.nome, ano: anoAtual, historicoFases: [], cor: CORES_COMP[compConfig.id] || CORES_COMP.default };

    if (["grupos_mata", "grupos", "nations_grupos"].includes(fmt.formato)) {
        estado.tipo = "grupos";
        estado.fase = "Fase de Grupos";
        estado.grupos = criarGruposTorneio(times, fmt);
        estado.rodadaAtual = 1;
        estado.maxRodadas = fmt.jogosGrupo || 3;
        estado.avancam = fmt.avancam || fmt.avancamTop || 2;
        estado.fmtInterno = fmt.formato;
    } else if (fmt.formato === "liga") {
        estado.tipo = "liga";
        estado.fase = compConfig.nome;
        estado.tabela = times.map(t => ({ id: t.id, nome: t.nome, pts: 0, j: 0, gf: 0, gs: 0 }));
        estado.rodadaAtual = 1;
        estado.maxRodadas = fmt.jogosRound ? times.length - 1 : 4;
    }

    selecoesEstado.torneios[key] = estado;
    return estado;
}

function obterCompeticoesAtivasTemporada(ano = anoAtual) {
    // 🛡️ FIX: as competições de BASE (Sub-17/Sub-21) vivem numa lista à parte
    // (COMPETICOES_SELECOES_BASE) — sem juntar as duas listas aqui, elas nunca
    // apareciam no dashboard de Competições Internacionais, mesmo já estando
    // ativas no calendário (idsCompeticoesAtivas).
    const todasAsCompeticoes = [...COMPETICOES_SELECOES, ...COMPETICOES_SELECOES_BASE];
    return idsCompeticoesAtivas(ano).map(id => todasAsCompeticoes.find(c => c.id === id)).filter(Boolean);
}

function atualizarRankingFIFA() {
    selecoesEstado.ranking = [...SELECOES]
        .map(s => ({ id: s.id, nome: s.nome, forca: Math.round(calcularForcaSelecao(s.id)) }))
        .sort((a, b) => b.forca - a.forca)
        .map((x, i) => ({ ...x, pos: i + 1 }));
}

function inicializarTodosTorneiosTemporada() {
    obterCompeticoesAtivasTemporada().forEach(comp => inicializarTorneioInternacional(comp));
    atualizarRankingFIFA();
}

function processarFimGruposInternacional(key, estado, fmt) {
    arquivarFaseInt(key);
    
    // 1️⃣ CASO: NATIONS LEAGUE (GRUPO E MATA-MATA/REBAIXAMENTO)
    if (fmt.formato === "nations_grupos") {
        const classificados = [], rebaixados = [];
        
        estado.grupos.forEach(grp => {
            grp.equipas.sort((a, b) => b.pts - a.pts || (b.gf - b.gs) - (a.gf - a.gs));
            
            // Primeiros colocados vão para o mata-mata
            classificados.push(criarTimeTorneio(SELECOES.find(s => s.id === grp.equipas[0].id)), criarTimeTorneio(SELECOES.find(s => s.id === grp.equipas[1].id)));
            
            // Últimos colocados vão para a lista de rebaixamento
            if (grp.equipas[3]) rebaixados.push(grp.equipas[3].id);
        });
        
        const confrontos = [];
        const flat = classificados.filter(Boolean);
        flat.sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < flat.length; i += 2) {
            if (flat[i + 1]) confrontos.push({ timeA: flat[i], timeB: flat[i + 1], golsA: null, golsB: null, vencedorId: null, penaltis: false });
        }
        
        estado.tipo = "mata-mata";
        estado.fase = "Quartas de Final (Nations A)";
        estado.confrontos = confrontos;
        delete estado.grupos;
        
        // CORREÇÃO DO REB: Movido para cima do uso!
        const reb = rebaixados.filter(Boolean);
        if (reb.length >= 2) {
            estado.rebaixamento = { confrontos: [{ timeA: reb[0], timeB: reb[1], golsA: null, golsB: null, vencedorId: null }, { timeA: reb[2], timeB: reb[3] || reb[0], golsA: null, golsB: null, vencedorId: null }].filter(c => c.timeB) };
        }

        // AGENDAMENTO NO CALENDÁRIO GLOBAL
        agendarMataMataNoCalendario(key, confrontos);
        return;
    }
    
    // 2️⃣ CASO: ELIMINATÓRIAS PURAS (APENAS GRUPOS PARA DEFINIR VAGAS)
    if (fmt.eliminatoria && fmt.formato === "grupos") {
        const classificados = [];
        estado.grupos.forEach(grp => {
            grp.equipas.sort((a, b) => b.pts - a.pts || (b.gf - b.gs) - (a.gf - a.gs));
            for (let i = 0; i < (fmt.avancam || 1); i++) {
                if (grp.equipas[i]?.id) classificados.push(grp.equipas[i].id);
            }
        });
        estado.fase = "Vagas Definidas";
        estado.classificados = classificados;
        const dest = anoTorneioDestino(estado.compConfigId, estado.ano);
        const destId = fmt.destino || "copa_mundo";
        if (dest) {
            if (!selecoesEstado.vagasTorneio) selecoesEstado.vagasTorneio = {};
            selecoesEstado.vagasTorneio[`${destId}_${dest}`] = [...classificados];
        }
        delete estado.grupos;
        return;
    }
    
    // 3️⃣ CASO: TORNEIOS CONTINENTAIS / MUNDIAL (GRUPOS + MATA-MATA)
    if (fmt.formato === "grupos_mata" || (fmt.formato === "grupos" && fmt.avancam >= 2 && !fmt.eliminatoria)) {
        const classificados = [];
        estado.grupos.forEach(grp => {
            grp.equipas.sort((a, b) => b.pts - a.pts || (b.gf - b.gs) - (a.gf - a.gs));
            for (let i = 0; i < (fmt.avancam || 2); i++) {
                const sel = SELECOES.find(s => s.id === grp.equipas[i]?.id);
                if (sel) classificados.push(criarTimeTorneio(sel));
            }
        });
        
        const confrontos = [];
        const flat = classificados.filter(Boolean);
        flat.sort(() => Math.random() - 0.5); // Sorteio das chaves
        
        for (let i = 0; i < flat.length; i += 2) {
            if (flat[i + 1]) confrontos.push({ timeA: flat[i], timeB: flat[i + 1], golsA: null, golsB: null, vencedorId: null, penaltis: false });
        }
        
        estado.tipo = "mata-mata";
        estado.fase = flat.length >= 16 ? "Oitavas de Final" : flat.length >= 8 ? "Oitavas de Final" : "Quartos de Final";
        estado.confrontos = confrontos;
        delete estado.grupos;
        
        // AGENDAMENTO NO CALENDÁRIO GLOBAL (Faz o jogo contra o Palmeiras ou outras ligas rodar!)
        agendarMataMataNoCalendario(key, confrontos);
        return;
    }
    
    // 4️⃣ CASO: CLASSIFICAÇÃO DEFINIDA POR PONTOS CORRIDOS
    estado.fase = "Classificação Definida";
    estado.classificados = estado.grupos.map(grp => {
        grp.equipas.sort((a, b) => b.pts - a.pts || (b.gf - b.gs) - (a.gf - a.gs));
        return grp.equipas[0]?.id;
    }).filter(Boolean);
    
    if (isEliminatoria(estado.compConfigId)) {
        const dest = anoTorneioDestino(estado.compConfigId, estado.ano);
        const destId = FORMATOS_INT[estado.compConfigId]?.destino || "copa_mundo";
        if (dest) {
            if (!selecoesEstado.vagasTorneio) selecoesEstado.vagasTorneio = {};
            const chaveVaga = `${destId}_${dest}`;
            const existentes = new Set(selecoesEstado.vagasTorneio[chaveVaga] || []);
            estado.classificados.forEach(id => existentes.add(id));
            selecoesEstado.vagasTorneio[chaveVaga] = [...existentes];
        }
    }
}

// 🛡️ FUNÇÃO AUXILIAR PARA INJETAR OS CONFRONTOS NA AGENDA PRINCIPAL DO JOGO
function agendarMataMataNoCalendario(competicaoId, confrontos) {
    if (!window.agendaTemporada) window.agendaTemporada = [];

    confrontos.forEach((inf, index) => {
        window.agendaTemporada.push({
            id: `mata_${competicaoId}_${window.anoAtual}_${index}`,
            competicaoId: competicaoId,
            timeHome: inf.timeA,
            timeAway: inf.timeB,
            placarHome: null,
            placarAway: null,
            rodada: window.rodadaAtual + 1, // Agenda para a rodada seguinte imediata
            status: "agendado"
        });
    });
    
    console.log(`Mata-mata de ${competicaoId} injetado com sucesso na agenda da temporada!`);
}

function arquivarFaseInt(key) {
    const e = selecoesEstado.torneios[key]; if(!e) return;
    if(!e.historicoFases) e.historicoFases = [];
    e.historicoFases.push(JSON.parse(JSON.stringify({ tipo: e.tipo, fase: e.fase, grupos: e.grupos, confrontos: e.confrontos, tabela: e.tabela })));
}

function avancarMataMataInternacional(key) {
    const estado = selecoesEstado.torneios[key];
    const vencedores = (estado.confrontos || []).map(c => c.vencedorId).filter(Boolean);
    if(!vencedores.length) return;
    arquivarFaseInt(key);
    const times = vencedores.map(id => SELECOES.find(s => s.id === id)).filter(Boolean).map(criarTimeTorneio);
    let novaFase = "Oitavas de Final";
    if(times.length >= 8) novaFase = "Quartos de Final";
    else if(times.length >= 4) novaFase = "Semifinal";
    else if(times.length === 2) novaFase = "Final";
    else if(times.length === 1) {
        estado.fase = "Campeão Definido"; estado.campeaoId = times[0].id; estado.confrontos = [];
        concederTituloInternacional(times[0].id, estado.nome, key);
        return;
    }
    const confrontos = [];
    times.sort(() => Math.random() - 0.5);
    for(let i = 0; i < times.length; i += 2) {
        if(times[i+1]) confrontos.push({ timeA: times[i], timeB: times[i+1], golsA: null, golsB: null, vencedorId: null, penaltis: false });
    }
    estado.tipo = "mata-mata"; estado.fase = novaFase; estado.confrontos = confrontos; delete estado.grupos;
}

function simularRodadaGruposInt(estado) {
    const fmt = FORMATOS_INT[estado.compConfigId] || {};
    const sub23 = !!fmt.sub23;
    estado.grupos.forEach(grp => {
        const eq = [...grp.equipas].sort(() => Math.random() - 0.5);
        for (let i = 0; i < eq.length - 1; i += 2) {
            
            // 👇 ESCUDO: Se o grupo ficar com número ímpar de times, evita o crash
            if (!eq[i] || !eq[i + 1]) continue; 
            
            if (eq[i].id === jogador?.selecaoId || eq[i + 1].id === jogador?.selecaoId) continue;
            const fA = calcularForcaSelecao(eq[i].id, sub23), fB = calcularForcaSelecao(eq[i + 1].id, sub23);
            const { gA, gB } = simularPlacarSelecao(fA, fB);
            eq[i].j++; eq[i + 1].j++;
            eq[i].gf += gA; eq[i].gs += gB; eq[i + 1].gf += gB; eq[i + 1].gs += gA;
            if (gA > gB) eq[i].pts += 3; else if (gB > gA) eq[i + 1].pts += 3; else { eq[i].pts++; eq[i + 1].pts++; }
            // 🛡️ FIX: atribui o jogo/gols/assistências a jogadores reais de cada seleção.
            atribuirStatsPartidaSelecaoIA(eq[i].id, eq[i + 1].id, gA, gB);
        }
    });
}

function simularConfrontoMataMataInt(conf, sub23 = false) {
    if (conf.vencedorId) return;
    if (!conf.timeA || !conf.timeB) { 
        conf.vencedorId = conf.timeA ? conf.timeA.id : (conf.timeB ? conf.timeB.id : "WO"); 
        return; }
    if (conf.timeA.id === jogador?.selecaoId || conf.timeB.id === jogador?.selecaoId) return;
    const fA = calcularForcaSelecao(conf.timeA.id, sub23), fB = calcularForcaSelecao(conf.timeB.id, sub23);
    const { gA, gB } = simularPlacarSelecao(fA, fB, true);
    conf.golsA = gA; conf.golsB = gB;
    const res = resolverVencedorMataMata(conf.timeA.id, conf.timeB.id, gA, gB, fA, fB);
    conf.vencedorId = res.vencedorId; conf.penaltis = res.penaltis; conf.placarPen = res.placarPen;
    // 🛡️ FIX: atribui o jogo/gols/assistências a jogadores reais de cada seleção.
    atribuirStatsPartidaSelecaoIA(conf.timeA.id, conf.timeB.id, gA, gB);
}

function processarRebaixamentoNations(estado, key) {
    const reb = estado.rebaixamento;
    if (!reb?.confrontos) return;
    reb.confrontos.forEach(c => simularConfrontoMataMataInt(c));
    reb.confrontos.forEach(c => {
        if (c.vencedorId) return;
        const perdedor = c.timeA.id;
        if (!selecoesEstado.nationsDiv) selecoesEstado.nationsDiv = {};
        selecoesEstado.nationsDiv[perdedor] = "B";
    });
    delete estado.rebaixamento;
}

// Helper function to determine if a tournament should advance in the current global round
function shouldTournamentAdvanceThisRound(compId, estado, maxRod) {
    // Check if player has an active fixture in this tournament for the current round
    const hasPlayerFixture = agendaTemporada.some(a =>
        a.compId === compId &&
        a.isSelecao &&
        (a.adversarioId === jogador?.selecaoId || a.mandanteId === jogador?.selecaoId)
    );

    // If player has a fixture, always advance
    if (hasPlayerFixture) return true;

    // CRITICAL FIX: Ensure international tournaments advance exactly ONE round per global round
    // Track last advanced round to prevent skipping
    if (!estado.lastAdvancedRound) {
        estado.lastAdvancedRound = 0;
    }

    const isInternationalTournament = compId.includes("copa_mundo") || 
                                      compId.includes("euro") || 
                                      compId.includes("copa_america") ||
                                      compId.includes("afcup") ||
                                      compId.includes("nations") ||
                                      compId.includes("libertadores") ||
                                      compId.includes("champions");

    if (isInternationalTournament) {
        // Only advance if we haven't advanced in the current global round yet
        // This ensures exactly one match day per global round click
        if (estado.lastAdvancedRound < rodadaAtual) {
            estado.lastAdvancedRound = rodadaAtual;
            return true;
        }
        return false;
    }

    // For domestic cups, advance with lower probability
    return Math.random() < 0.25;
}

// 🛡️ FIX: verifica se o jogador ainda tem algum jogo AGENDADO (mas ainda não
// disputado) nesta competição de seleções. Usado para impedir que a fase de
// grupos/liga feche e elimine o jogador antes que os seus jogos marcados no
// calendário (que seguem as janelas internacionais reais, bem mais espaçadas
// que o ritmo semanal da simulação da IA) cheguem a ser disputados.
function existePendenteJogadorNoTorneio(compId) {
    if (!jogador?.selecaoId) return false;
    return agendaTemporada.some((a, idx) =>
        idx >= (rodadaAtual - 1) &&
        a.isSelecao && a.compId === compId &&
        (a.adversarioId === jogador.selecaoId || a.mandanteId === jogador.selecaoId)
    );
}

function simularTorneiosInternacionais() {
    for (const [key, estado] of Object.entries(selecoesEstado.torneios || {})) {
        if (["Campeão Definido", "Classificação Definida", "Vagas Definidas"].includes(estado.fase)) continue;
        const fmt = FORMATOS_INT[estado.compConfigId] || {};
        const maxRod = estado.maxRodadas || fmt.jogosGrupo || 3;

        // CRITICAL FIX: Only advance ONE round per global round click
        // Check if this tournament should advance in the current global round
        const shouldAdvanceThisRound = shouldTournamentAdvanceThisRound(key, estado, maxRod);
        
        if (!shouldAdvanceThisRound) continue;

        if (estado.tipo === "grupos" && estado.grupos && estado.rodadaAtual <= maxRod) {
            simularRodadaGruposInt(estado);
            estado.rodadaAtual++;
            // 🛡️ FIX: só fecha a fase de grupos quando o jogador não tiver mais
            // nenhum jogo agendado e por disputar nesta competição — antes disso,
            // a simulação da IA fica "em espera" (sem avançar mais rodadas) até
            // que o jogo marcado no calendário realmente aconteça.
            if (estado.rodadaAtual > maxRod && (!existePendenteJogadorNoTorneio(key) || Math.floor(obterSlotCalendarioAtual()) >= 51)) {
                processarFimGruposInternacional(key, estado, fmt);
            }
        } else if (estado.tipo === "liga" && estado.tabela) {
            
            // 👇 ESCUDO ANTI-CRASH: Se a liga estiver vazia (ex: Nations D), encerra ela silenciosamente
            if (estado.tabela.length === 0) {
                estado.fase = "Campeão Definido"; 
                estado.campeaoId = "Nenhum";
                continue; 
            }

            const maxRodLiga = estado.maxRodadas || 4;
            if ((estado.rodadaAtual || 1) <= maxRodLiga) {
                const tab = [...estado.tabela].sort(() => Math.random() - 0.5);
                for (let i = 0; i < tab.length - 1; i += 2) {
                    if (!tab[i] || !tab[i+1]) continue; // Escudo extra de segurança na rodada
                    if (tab[i].id === jogador?.selecaoId || tab[i + 1].id === jogador?.selecaoId) continue;
                    const fA = calcularForcaSelecao(tab[i].id), fB = calcularForcaSelecao(tab[i + 1].id);
                    const { gA, gB } = simularPlacarSelecao(fA, fB);
                    tab[i].j++; tab[i + 1].j++;
                    tab[i].gf += gA; tab[i].gs += gB; tab[i + 1].gf += gB; tab[i + 1].gs += gA;
                    if (gA > gB) tab[i].pts += 3; else if (gB > gA) tab[i + 1].pts += 3; else { tab[i].pts++; tab[i + 1].pts++; }
                    // 🛡️ FIX: atribui o jogo/gols/assistências a jogadores reais de cada seleção.
                    atribuirStatsPartidaSelecaoIA(tab[i].id, tab[i + 1].id, gA, gB);
                }
                estado.rodadaAtual = (estado.rodadaAtual || 1) + 1;
            }
            
            // 🛡️ FIX: só fecha/coroa a liga quando o jogador não tiver mais jogo
            // agendado e por disputar nesta competição (mesmo motivo do fix acima
            // na fase de grupos — evita eliminar o jogador antes da hora real do
            // seu jogo marcado no calendário).
            if (estado.rodadaAtual > maxRodLiga && (!existePendenteJogadorNoTorneio(key) || Math.floor(obterSlotCalendarioAtual()) >= 51)) {
                estado.tabela.sort((a, b) => b.pts - a.pts || (b.gf - b.gs) - (a.gf - a.gs));
                const fmtLiga = FORMATOS_INT[estado.compConfigId] || {};
                
                if (isEliminatoria(estado.compConfigId)) {
                    const vagas = fmtLiga.vagas || 4;
                    estado.classificados = estado.tabela.slice(0, vagas).map(t => t.id);
                    estado.fase = "Vagas Definidas";
                    const dest = anoTorneioDestino(estado.compConfigId, estado.ano);
                    const destId = fmtLiga.destino || "copa_mundo";
                    if (dest) {
                        if (!selecoesEstado.vagasTorneio) selecoesEstado.vagasTorneio = {};
                        selecoesEstado.vagasTorneio[`${destId}_${dest}`] = [...estado.classificados];
                    }
                } else {
                    // 👇 ESCUDO EXTRA AO COROAR CAMPEÃO
                    if (estado.tabela.length > 0) {
                        const campeao = estado.tabela[0].id;
                        if (estado.compConfigId?.includes("nations_b")) {
                            if (!selecoesEstado.nationsDiv) selecoesEstado.nationsDiv = {};
                            selecoesEstado.nationsDiv[campeao] = "A";
                            selecoesEstado.nationsDiv[estado.tabela[estado.tabela.length - 1].id] = "C";
                        } else if (estado.compConfigId?.includes("nations_c")) {
                            if (!selecoesEstado.nationsDiv) selecoesEstado.nationsDiv = {};
                            selecoesEstado.nationsDiv[campeao] = "B";
                        }
                        if (estado.compConfigId === "nations_b" || estado.compConfigId === "nations_c" || estado.compConfigId === "nations_d") {
                            concederTituloInternacional(campeao, estado.nome, key);
                        }
                        estado.campeaoId = campeao;
                    }
                    estado.fase = "Campeão Definido"; 
                }
            }
        } else if (estado.tipo === "mata-mata" && estado.confrontos) {
            const sub23 = !!fmt.sub23;
            estado.confrontos.forEach(conf => simularConfrontoMataMataInt(conf, sub23));
            if (estado.rebaixamento) processarRebaixamentoNations(estado, key);
            if (estado.confrontos.every(c => c.vencedorId)) {
                if (estado.confrontos.length === 1) {
                    const campeao = estado.confrontos[0].vencedorId;
                    estado.fase = "Campeão Definido"; estado.campeaoId = campeao;
                    concederTituloInternacional(campeao, estado.nome, key);
                } else avancarMataMataInternacional(key);
            }
        }
    }
    atualizarRankingFIFA();
}
function agendarJogosInternacionais() {
    if(!jogador?.naSelecao || !jogador.selecaoId) return;

    // --- NOVA TRAVA DE FIM DE TEMPORADA ---
    const slotAtual = obterSlotCalendarioAtual();
    if (slotAtual >= 52) {
        return; // O ano acabou, não agenda mais nada para a seleção.
    }
    // --------------------------------------

    const selecao = obterSelecaoPorNacionalidade(jogador.nacionalidade);
    const comp = obterCompeticaoSelecao(selecao);
    
    // Proteção extra contra indefinidos
    if (!comp) return; 

    const fmt = FORMATOS_INT[comp.id];
    const cfgCal = CALENDARIO_SELECOES_REALISTA[comp.id] || CALENDARIO_SELECOES_REALISTA.amistoso;

    if(comp.id === "amistoso") {
        const rivais = SELECOES.filter(s => s.id !== selecao.id).sort(() => Math.random() - 0.5);
        const rival = rivais[0];
        const jaExiste = agendaTemporada.some(a => a.isSelecao && a.compConfigId === "amistoso" && Math.floor(a.slot || 0) === Math.floor(obterProximoSlotSelecao("amistoso")));
        if(rival && !jaExiste) {
            adicionarEventoCalendario({
                tipo: `Amistoso Internacional`, compId: `int_amistoso_${anoAtual}_${rodadaAtual}`, compConfigId: "amistoso",
                adversarioId: rival.id, isSelecao: true, isMataMata: false, mandanteId: selecao.id
            }, obterProximoSlotSelecao("amistoso"), cfgCal.janela, cfgCal.modelo);
        }
        return;
    }

    const key = chaveTorneio(comp.id, anoAtual);
    let estado = selecoesEstado.torneios[key] || inicializarTorneioInternacional(comp);
    if(!estado) return;

    const conv = selecoesEstado.convocacoes?.[0];
    if(conv?.convocado) registrarPlantelTorneio(key, selecao.id, conv.ids || ["player"]);

    if(estado.tipo === "grupos" && estado.grupos) {
        const meuGrupo = estado.grupos.find(g => g.equipas.some(e => e.id === selecao.id));
        if(meuGrupo) {
            meuGrupo.equipas.filter(e => e.id !== selecao.id).forEach((adv, idx) => {
                if(!agendaTemporada.find(a => a.isSelecao && a.adversarioId === adv.id && a.compId === key)) {
                    const slot = cfgCal.slots?.[idx] || obterProximoSlotSelecao(comp.id, idx);
                    adicionarEventoCalendario({
                        tipo: `${comp.nome} (${meuGrupo.nome})`, compId: key, compConfigId: comp.id,
                        adversarioId: adv.id, isSelecao: true, isMataMata: false, fase: "Grupos", mandanteId: selecao.id
                    }, slot, cfgCal.janela, cfgCal.modelo);
                }
            });
        }
    } else if(estado.tipo === "mata-mata" && estado.confrontos) {
    const conf = estado.confrontos.find(c => c.timeA && c.timeB && (c.timeA.id === selecao.id || c.timeB.id === selecao.id) && !c.vencedorId);
        if(conf) {
            const adv = conf.timeA.id === selecao.id ? conf.timeB : conf.timeA;
            // 🐛 FIX: faltava esta trava de duplicado — as ramificações "grupos" e
            // "liga" logo acima já verificavam antes de adicionar, mas esta não.
            // Como este mesmo confronto de mata-mata fica "pendente" (sem
            // vencedorId) durante várias semanas até ser disputado, cada chamada
            // de agendarJogosInternacionais() nesse meio tempo empurrava outra
            // cópia do MESMO jogo pro calendário — daí aparecerem 3, 4, 5 linhas
            // idênticas de "Quartos de Final vs Fulano" na agenda.
            if(!agendaTemporada.find(a => a.isSelecao && a.adversarioId === adv.id && a.compId === key && a.fase === estado.fase)) {
                const idxFase = indiceFaseCalendario(estado.fase);
                adicionarEventoCalendario({
                    tipo: `${comp.nome} (${estado.fase})`, compId: key, compConfigId: comp.id,
                    adversarioId: adv.id, isSelecao: true, isMataMata: true, fase: estado.fase, mandanteId: selecao.id, isFinal: estado.fase === "Final"
                }, cfgCal.slots?.[Math.min(idxFase + 3, cfgCal.slots.length - 1)] || obterProximoSlotSelecao(comp.id), cfgCal.janela, cfgCal.modelo);
            }
        }
    } else if(estado.tipo === "liga" && estado.tabela) {
        const rivais = estado.tabela.filter(t => t.id !== selecao.id).slice(0, 2);
        rivais.forEach((adv, idx) => {
            if(agendaTemporada.find(a => a.isSelecao && a.adversarioId === adv.id && a.compId === key)) return;
            adicionarEventoCalendario({
                tipo: `${comp.nome} (J${idx+1})`, compId: key, compConfigId: comp.id,
                adversarioId: adv.id, isSelecao: true, isMataMata: false, mandanteId: selecao.id
            }, cfgCal.slots?.[idx] || obterProximoSlotSelecao(comp.id, idx), cfgCal.janela, cfgCal.modelo);
        });
    }
}

function premiarLigasTemporada() {
    if (!selecoesEstado.premiosLigaAno) selecoesEstado.premiosLigaAno = {};
    const chaveAno = String(anoAtual);
    if (selecoesEstado.premiosLigaAno[chaveAno]?.concluido) return;

    competicoes.filter(c => c.tipo === "liga" && c.div === 1).forEach(liga => {
        if (selecoesEstado.premiosLigaAno[chaveAno]?.[liga.id]) return;
        const clubesLiga = new Set(clubes.filter(c => c.ligaId === liga.id).map(c => c.id));
        const pool = [jogador, ...jogadoresIA.filter(j => !j.aposentado && clubesLiga.has(j.clubeId))];
        const comStats = pool.map(p => {
            const st = p.statsCompeticoes?.[liga.id] || (p === jogador ? p.estatisticasAtuais : p.statsTemporada) || { gols: 0, assistencias: 0 };
            return { p, g: st.gols || 0, a: st.assistencias || 0 };
        });
        const art = [...comStats].sort((a, b) => b.g - a.g || b.a - a.a)[0];
        const ast = [...comStats].sort((a, b) => b.a - a.a || b.g - a.g)[0];
        if (!selecoesEstado.premiosLigaAno[chaveAno]) selecoesEstado.premiosLigaAno[chaveAno] = {};
        if (art?.g > 0) {
            const nomePremio = `Chuteira de Ouro — ${liga.nome}`;
            selecoesEstado.premiosLigaAno[chaveAno][liga.id] = { artilheiro: art.p.nome, gols: art.g };
            art.p.pontosPremio = (art.p.pontosPremio || 0) + 18;
            art.p.pontosPremioTemporada = (art.p.pontosPremioTemporada || 0) + 18;
            if (art.p.historicoCarreira?.[0]) art.p.historicoCarreira[0].trofeus = art.p.historicoCarreira[0].trofeus === "-" ? nomePremio : art.p.historicoCarreira[0].trofeus + ", " + nomePremio;
            registrarNoticia(nomePremio, `${art.p.nome} foi o artilheiro da ${liga.nome} com ${art.g} gols.`, "Prémios", { nome: art.p.nome, foto: art.p.foto }, "jogador");
            if ((art.p.id || "player") === "player") {
                evoluirAtributosEGeral(jogador, 2);
                jogador.moral = Math.min(100, jogador.moral + 12);
                jogador.pontosPremio = (jogador.pontosPremio || 0) + 18;
                jogador.valorMercadoNum = calcularValorMercadoJogador(jogador);
                mostrarToast("Chuteira de Ouro", `Artilheiro da ${liga.nome}! +2 OVR e visibilidade no mercado.`, "success");
            }
        }
        if (ast?.a > 0) {
            const nomePremio = `Garçom da Liga — ${liga.nome}`;
            ast.p.pontosPremio = (ast.p.pontosPremio || 0) + 14;
            ast.p.pontosPremioTemporada = (ast.p.pontosPremioTemporada || 0) + 14;
            if (ast.p.historicoCarreira?.[0]) ast.p.historicoCarreira[0].trofeus = ast.p.historicoCarreira[0].trofeus === "-" ? nomePremio : ast.p.historicoCarreira[0].trofeus + ", " + nomePremio;
            registrarNoticia(nomePremio, `${ast.p.nome} liderou as assistências da ${liga.nome} com ${ast.a}.`, "Prémios", { nome: ast.p.nome, foto: ast.p.foto }, "jogador");
            if ((ast.p.id || "player") === "player") {
                evoluirAtributosEGeral(jogador, 1);
                jogador.moral = Math.min(100, jogador.moral + 8);
                jogador.pontosPremio = (jogador.pontosPremio || 0) + 14;
                mostrarToast("Garçom da Liga", `Líder de assistências da ${liga.nome}!`, "success");
            }
        }
    });
    selecoesEstado.premiosLigaAno[chaveAno].concluido = true;
}

function resetarStatsNovaTemporada() {
    const zerar = (p) => {
        p.statsTemporada = { jogos: 0, gols: 0, assistencias: 0, notas: [] };
        p.statsCompeticoes = {};
        // pontosPremioTemporada mede apenas os méritos DESTA temporada (troféus + prêmios
        // conquistados agora), diferente de pontosPremio, que é o prestígio acumulado na carreira.
        p.pontosPremioTemporada = 0;
        if(p === jogador) p.estatisticasAtuais = { jogos: 0, gols: 0, assistencias: 0, defesas: 0, penaltisMarcados: 0, penaltisDefendidos: 0 };
    };
    zerar(jogador);
    jogadoresIA.forEach(j => { if(!j.aposentado) zerar(j); });
}

window.abrirPerfilSelecao = function(selecaoId) {
    const sel = SELECOES.find(s => s.id === selecaoId) || SELECOES.find(s => normalizarNacionalidade(s.pais) === normalizarNacionalidade(selecaoId));
    if(!sel) return;
    const titulos = selecoesEstado.campeoes?.[sel.id] || [];
    const rankPos = selecoesEstado.ranking?.find(r => r.id === sel.id)?.pos || "—";
    const forca = Math.round(calcularForcaSelecao(sel.id));
    // 🛡️ FIX (mostrava o país inteiro, tipo 55 jogadores): antes usava
    // obterJogadoresNacionalidade(), que traz TODO jogador elegível daquela
    // nacionalidade no mundo — não é "o elenco da seleção", é o país inteiro.
    // Agora usa a mesma lógica de convocação por mérito (gerarConvocacaoSelecao)
    // usada de verdade pra convocar — o mesmo corte de ~23 nomes, nas mesmas
    // posições, que apareceria numa convocação real agora.
    const competicaoAtual = obterCompeticaoSelecao(sel);
    const convocacaoAtual = gerarConvocacaoSelecao(sel, competicaoAtual);
    const elenco = convocacaoAtual.convocados.sort((a,b) => b.geral - a.geral);
    const htmlTitulos = titulos.length ? `<div class="selecao-titulos-grid">${titulos.map(t => `
        <div class="card-conquista card-conquista-grande"><img loading="lazy" decoding="async" src="${obterUrlImagem(t.nome, 'trofeu')}" class="trofeu-icon" style="width:92px;height:92px;"><div><strong style="color:var(--gold); font-size:1.15rem;">${t.nome}</strong><br><span style="color:#ccc; font-size:1rem;">${t.ano}</span></div></div>`).join("")}</div>`
        : `<p style="color:#aaa; padding:20px; text-align:center;">Nenhum título internacional registrado ainda.</p>`;
    // 🎨 REDESIGN: linha própria (selecao-convocado-row) em vez de reaproveitar
    // .convocado-row (feita pra tela de animação de convocação, com grid de 5
    // colunas — aqui sobravam colunas vazias, já que só tinha foto + nome/OVR).
    const htmlElenco = elenco.map(p => `
        <div class="selecao-convocado-row" onclick="abrirPerfilJogador('${p.id}')">
            <img loading="lazy" decoding="async" src="${obterUrlImagem(p,'jogador')}">
            <div><strong>${p.nome}</strong><br><small>OVR ${p.geral} • ${p.posicao}</small></div>
        </div>`).join("");
    const modal = document.getElementById("modalPerfilJogador");
    if(!modal) return;
    const inner = modal.querySelector(".modal-content") || modal.firstElementChild;
    inner.innerHTML = `
        <div class="selecao-perfil-header">
            <img loading="lazy" decoding="async" src="${sel.logo}" class="selecao-perfil-escudo" onerror="this.style.display='none'">
            <div class="selecao-perfil-titulo">
                <h1>Seleção ${sel.nome}</h1>
                <p><span>${sel.conf}</span><span>FIFA #${rankPos}</span><span>Força ${forca}</span></p>
            </div>
            <button class="close-btn" onclick="document.getElementById('modalPerfilJogador').classList.add('oculto')">✖</button>
        </div>
        <h3 style="color:var(--gold);">🏆 Palmarés</h3>${htmlTitulos}
        <h3 style="color:var(--theme-primary); margin-top:24px;">Elenco Atual (${elenco.length})</h3>
        <div class="selecao-elenco-lista">${htmlElenco}</div>`;
    modal.classList.remove("oculto");
};

function renderArvoreMataMata(confrontos, corComp = "#00ff88", faseLabel = "") {
    if (!confrontos?.length) return "";
    const label = faseLabel || (confrontos.length === 1 ? "Final" : confrontos.length === 2 ? "Semifinal" : confrontos.length === 4 ? "Quartas" : "Oitavas");
    const slots = confrontos.map(conf => {
        const jogado = conf.golsA !== null && conf.golsA !== undefined;
        const pen = conf.penaltis ? `<span class="penalty-badge">🎯 ${conf.placarPen || "Pênaltis"}</span>` : "";
        const meuJogo = conf.timeA?.id === jogador?.selecaoId || conf.timeB?.id === jogador?.selecaoId;
        const team = (t, gols, win) => {
            if (!t) return `<div class="bracket-slot-team tbd"><span class="bracket-slot-crest tbd-crest">?</span><span class="bracket-slot-name">A definir</span><span class="bracket-slot-goals">–</span></div>`;
            const elim = conf.vencedorId && conf.vencedorId !== t.id;
            return `<div class="bracket-slot-team ${win ? "winner" : ""} ${elim ? "eliminated" : ""}" onclick="abrirPerfilSelecao('${t.id}')">
                <img loading="lazy" decoding="async" class="bracket-slot-crest" src="${t.logo || ""}" onerror="this.style.visibility='hidden'">
                <span class="bracket-slot-name">${t.nome}</span>
                <span class="bracket-slot-goals">${jogado ? gols : "–"}</span>
                ${win ? '<span class="bracket-slot-check">✓</span>' : ""}
            </div>`;
        };
        return `<div class="bracket-slot ${meuJogo ? "meu-jogo" : ""} ${jogado ? "concluido" : "pendente"}" style="--comp-cor:${corComp}">
            ${team(conf.timeA, conf.golsA, conf.vencedorId === conf.timeA?.id)}
            <div class="bracket-slot-mid"><span class="bracket-slot-vs">${jogado ? "FT" : "VS"}</span>${pen}</div>
            ${team(conf.timeB, conf.golsB, conf.vencedorId === conf.timeB?.id)}
        </div>`;
    }).join("");
    return `<div class="bracket-tree"><div class="bracket-round"><div class="bracket-round-label">${label}</div><div class="bracket-round-slots">${slots}</div></div></div>`;
}

function renderEtapasTorneio(tor) {
    const vistas = [...(tor.historicoFases || []).map(f => f.fase), tor.fase];
    const passos = vistas.filter((f, i) => i === 0 || f !== vistas[i - 1]);
    if (passos.length < 2) return "";
    return `<div class="comp-stepper">${passos.map((f, i) => {
        const atual = i === passos.length - 1;
        return `${i > 0 ? '<span class="comp-step-line"></span>' : ""}<div class="comp-step ${atual ? "atual" : "feito"}"><span class="comp-step-dot">${atual ? i + 1 : "✓"}</span><span class="comp-step-label">${f}</span></div>`;
    }).join("")}</div>`;
}

function rotuloFaseTorneo(tor) {
    if (tor.fase === "Vagas Definidas" || tor.fase === "Classificação Definida") return "Classificados definidos";
    if (tor.fase === "Campeão Definido" && isEliminatoria(tor.compConfigId)) return "Classificados definidos";
    return tor.fase;
}

function renderClassificadosElim(tor, cor) {
    const ids = tor.classificados || [];
    if (!ids.length) return "";
    const meta = metaCompeticao(tor.compConfigId, tor.ano);
    return `<div class="comp-vagas-banner" style="--comp-cor:${cor}">
        <span class="comp-vagas-icon">🎫</span>
        <div><strong>${meta.destinoNome ? `Classificados para ${meta.destinoNome} ${meta.destinoAno}` : "Vagas garantidas"}</strong>
        <div class="comp-vagas-flags">${ids.map(id => {
            const s = SELECOES.find(x => x.id === id);
            return s ? `<img loading="lazy" decoding="async" src="${s.logo}" title="${s.nome}" onclick="abrirPerfilSelecao('${id}')">` : "";
        }).join("")}</div></div>
    </div>`;
}

// 🏆 Logo oficial de uma competição internacional, para usar no lugar dos
// emojis genéricos. Tenta primeiro o nome exato da competição (usa o mesmo
// catálogo de obterUrlImagem já usado para troféus de clube); eliminatórias
// não têm um logo próprio "oficial" de verdade, então cai para o logo do
// torneio de destino (ex: "Eliminatórias AFC" usa o logo da Copa do Mundo).
// Se mesmo assim não encontrar nada catalogado, devolve null (quem chama
// decide o fallback visual, normalmente meta.icon).
function obterLogoTorneioInternacional(nome, meta) {
    let url = obterUrlImagem(nome, 'trofeu');
    if (!url && meta?.destinoNome) url = obterUrlImagem(meta.destinoNome, 'trofeu');
    return url || null;
}

function renderTorneioInternacionalCompleto(tor, key) {
    const cor = tor.cor || CORES_COMP[tor.compConfigId] || CORES_COMP.default;
    const meta = metaCompeticao(tor.compConfigId, tor.ano);
    const logoTorneio = obterLogoTorneioInternacional(tor.nome, meta);
    const elim = isEliminatoria(tor.compConfigId);
    const prog = tor.tipo === "grupos" && tor.maxRodadas ? Math.min(100, Math.round(((tor.rodadaAtual || 1) - 1) / tor.maxRodadas * 100)) : (["Vagas Definidas", "Classificação Definida", "Campeão Definido"].includes(tor.fase) ? 100 : 50);
    let html = `<div class="comp-int-card comp-int-premium" style="--comp-cor:${cor}">
        <div class="comp-int-header">
            <div class="comp-int-title-block">
                ${logoTorneio ? `<img loading="lazy" decoding="async" class="comp-int-icon" src="${logoTorneio}" alt="${tor.nome}" onerror="this.outerHTML='<span class=&quot;comp-int-icon&quot;>${meta.icon}</span>'">` : `<span class="comp-int-icon">${meta.icon}</span>`}
                <div><h3>${tor.nome}</h3>
                <p>${meta.subtitulo || `Temporada ${tor.ano}`}${elim ? " • Sem troféu — apenas vagas" : ""}</p></div>
            </div>
            <span class="meta-pill comp-fase-pill">${rotuloFaseTorneo(tor)}</span>
        </div>
        <div class="comp-progress-wrap"><div class="comp-progress-bar" style="width:${prog}%"></div></div>
        ${renderEtapasTorneio(tor)}`;
    let fasesHtml = "";
    if (tor.historicoFases?.length) tor.historicoFases.forEach(f => { fasesHtml += renderBlocoFaseInternacional(f, cor); });
    if (tor.tipo === "grupos" && tor.grupos) fasesHtml += renderBlocoFaseInternacional(tor, cor);
    else if (tor.tipo === "liga" && tor.tabela) {
        const ord = [...tor.tabela].sort((a, b) => b.pts - a.pts || (b.gf - b.gs) - (a.gf - a.gs));
        const cutoff = elim ? (FORMATOS_INT[tor.compConfigId]?.vagas || 4) : null;
        fasesHtml += `<div class="fase-bloco bracket-phase"><h4 class="bracket-title">${elim ? "Tabela — vagas em jogo" : "Classificação"}</h4>
        <div class="bracket-group-card comp-table-premium">
        <table class="grupo-table"><thead><tr><th class="col-pos">#</th><th class="col-team">Seleção</th><th>P</th><th>J</th><th>SG</th></tr></thead><tbody>
            ${ord.map((e, i) => {
                const s = SELECOES.find(x => x.id === e.id);
                const qual = elim && i < cutoff;
                const rankClass = i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : "";
                return `<tr class="${qual ? "row-qualifica" : ""} ${elim && i === cutoff - 1 ? "linha-corte" : ""}" onclick="abrirPerfilSelecao('${e.id}')"><td class="col-pos"><span class="grupo-pos ${rankClass}">${qual ? "✓" : i + 1}</span></td><td class="col-team"><img loading="lazy" decoding="async" src="${s?.logo || ""}" class="bracket-flag">${s?.nome || e.nome}</td><td><strong>${e.pts}</strong></td><td>${e.j}</td><td>${e.gf - e.gs > 0 ? "+" : ""}${e.gf - e.gs}</td></tr>`;
            }).join("")}
        </tbody></table></div></div>`;
    } else if (tor.tipo === "mata-mata" && tor.confrontos) {
        fasesHtml += `<div class="fase-bloco bracket-phase"><h4 class="bracket-title">${tor.fase}</h4>${renderArvoreMataMata(tor.confrontos, cor, tor.fase)}</div>`;
    }
    html += `<div class="bracket-container">${fasesHtml}</div>`;
    if (tor.fase === "Campeão Definido" && !elim) {
        const camp = SELECOES.find(s => s.id === tor.campeaoId);
        html += `<div class="comp-campeao-banner">Campeão: ${camp?.nome || tor.campeaoId}</div>`;
    }
    if (["Vagas Definidas", "Classificação Definida"].includes(tor.fase) || (elim && tor.classificados?.length)) {
        html += renderClassificadosElim(tor, cor);
    }
    return html + `</div>`;
}

function renderizarCompeticoesInternacionais() {
    const el = document.getElementById("view-comp-int");
    if (!el) return;
    inicializarTodosTorneiosTemporada();
    const ativas = obterCompeticoesAtivasTemporada();
    const filtroCat = uiFiltroCompInt;
    let torneios = ativas.map(c => {
        const key = chaveTorneio(c.id, anoAtual);
        const tor = selecoesEstado.torneios[key] || inicializarTorneioInternacional(c);
        return { comp: c, key, tor, cat: categoriaComp(c.id), meta: metaCompeticao(c.id, anoAtual) };
    }).filter(x => x.tor);
    if (filtroCat !== "todos") torneios = torneios.filter(t => t.cat === filtroCat);
    const compAtual = torneios.find(t => t.comp.id === uiSelectCompInt) || torneios[0];
    if (compAtual) uiSelectCompInt = compAtual.comp.id;
    if (compAtual) aplicarTemaCompeticao(compAtual.comp.id);

    const cats = [
        { id: "todos", label: "Todos" },
        { id: "eliminatorias", label: " Eliminatórias" },
        { id: "continental", label: " Continentais" },
        { id: "mundial", label: " Mundial / Olimpíadas" },
        { id: "nations", label: " Nations League" },
        { id: "base", label: "🧒 Seleções de Base" }
    ];

    // Callout pessoal: contextualiza o dashboard em torno da campanha do
    // próprio jogador pela seleção, em vez de só listar torneios genéricos.
    const selecaoJogador = jogador?.selecaoId && jogador.selecaoId !== "none" ? SELECOES.find(s => s.id === jogador.selecaoId) : null;
    const stSel = jogador?.statsSelecao || { jogos: 0, gols: 0, assistencias: 0 };
    const minhaCampanhaHtml = selecaoJogador ? `
        <div class="comp-int-minha-selecao">
            <img loading="lazy" decoding="async" src="${selecaoJogador.logo || ''}" alt="${selecaoJogador.nome}" onerror="this.style.visibility='hidden'">
            <div>
                <span class="comp-int-kicker" style="margin:0;">Minha Seleção</span>
                <h3>${selecaoJogador.nome}</h3>
                <span class="comp-int-status-badge ${jogador.naSelecao ? 'convocado' : 'fora'}">${jogador.naSelecao ? '✓ Convocado' : 'Fora da última lista'}</span>
            </div>
            <div class="comp-int-minha-stats">
                <div><strong>${stSel.jogos || 0}</strong><span>Jogos</span></div>
                <div><strong>${stSel.gols || 0}</strong><span>Gols</span></div>
                <div><strong>${stSel.assistencias || 0}</strong><span>Assist.</span></div>
                <div><strong>${(jogador.titulosSelecao || []).length}</strong><span>Títulos</span></div>
            </div>
        </div>` : `
        <div class="comp-int-minha-selecao comp-int-minha-selecao-vazia">
            <span style="font-size:1.8rem;">🌍</span>
            <div><span class="comp-int-kicker" style="margin:0;">Minha Seleção</span><h3>Ainda sem seleção</h3><p style="margin:2px 0 0; color:#999; font-size:0.82rem;">Continue a ter boas atuações para ser convocado.</p></div>
        </div>`;

    el.innerHTML = `
        <div class="comp-int-shell comp-int-page">
            <div class="comp-int-hero">
                <div class="comp-int-hero-glow"></div>
                <div class="comp-int-hero-content">
                    <span class="comp-int-kicker">Seleções • Temporada ${anoAtual}</span>
                    <h2>Competições Internacionais</h2>
                    <p>Acompanhe eliminatórias, torneios e Nations League — convocado ou não.</p>
                </div>
                <div class="comp-int-hero-stats">
                    <div class="comp-stat-box"><strong>${ativas.length}</strong><span>Ativas este ano</span></div>
                    <div class="comp-stat-box"><strong>${anoAtual % 4 === 1 ? anoAtual + 1 : anoAtual % 4 === 3 ? anoAtual + 1 : "—"}</strong><span>Próximo torneio grande</span></div>
                </div>
            </div>
            ${minhaCampanhaHtml}
            <div class="comp-cat-tabs">${cats.map(c => `<button type="button" class="comp-cat-tab ${filtroCat === c.id ? "ativo" : ""}" data-cat="${c.id}">${c.label}</button>`).join("")}</div>
            <div class="comp-int-cards-strip">
                ${torneios.length ? torneios.map(t => {
                    const elim = isEliminatoria(t.comp.id);
                    const done = ["Vagas Definidas", "Classificação Definida"].includes(t.tor.fase) || (t.tor.fase === "Campeão Definido" && !elim);
                    const camp = !elim && t.tor.campeaoId ? SELECOES.find(s => s.id === t.tor.campeaoId)?.nome : null;
                    const prog = t.tor.tipo === "grupos" && t.tor.maxRodadas ? Math.min(100, Math.round(((t.tor.rodadaAtual || 1) - 1) / t.tor.maxRodadas * 100)) : (done ? 100 : 50);
                    const logoCard = obterLogoTorneioInternacional(t.comp.nome, t.meta);
                    return `<button type="button" class="comp-tournament-card ${t.comp.id === compAtual?.comp.id ? "ativo" : ""}" data-comp="${t.comp.id}" style="--comp-cor:${t.tor.cor || CORES_COMP.default}">
                        <div class="comp-tournament-card-top">
                            ${logoCard ? `<img loading="lazy" decoding="async" class="comp-tournament-icon" src="${logoCard}" alt="${t.comp.nome}" onerror="this.outerHTML='<span class=&quot;comp-tournament-icon&quot;>${t.meta.icon}</span>'">` : `<span class="comp-tournament-icon">${t.meta.icon}</span>`}
                            ${camp ? `<span class="comp-tournament-crown" title="${camp}">👑</span>` : ""}
                        </div>
                        <strong>${t.comp.nome.replace("Eliminatórias ", "").replace(" — Divisão ", " Div. ")}</strong>
                        <small>${t.meta.subtitulo || rotuloFaseTorneo(t.tor)}</small>
                        <div class="comp-tournament-progress"><div style="width:${prog}%"></div></div>
                        ${camp ? `<em class="comp-tournament-tag tag-champ">Campeão: ${camp}</em>` : (elim && done ? `<em class="comp-tournament-tag tag-vagas">🎫 Vagas definidas</em>` : `<em class="comp-tournament-tag">${rotuloFaseTorneo(t.tor)}</em>`)}
                    </button>`;
                }).join("") : `<p class="comp-empty-sidebar">Nenhuma competição neste filtro.</p>`}
            </div>
            <main class="comp-int-main comp-int-main-full">
                ${compAtual ? renderTorneioInternacionalCompleto(compAtual.tor, compAtual.key) : `<div class="comp-empty-main"><span>🌍</span><p>Nenhum torneio internacional ativo nesta temporada.</p><small>Eliminatórias da Copa rodam em anos como ${anoAtual % 4 === 1 ? anoAtual : anoAtual + (1 - (anoAtual % 4))}. Euro/Eliminatórias Euro em ${anoAtual % 4 === 3 ? anoAtual : anoAtual + (3 - (anoAtual % 4))}.</small></div>`}
            </main>
        </div>`;

    el.querySelectorAll(".comp-cat-tab").forEach(btn => btn.onclick = () => {
        uiFiltroCompInt = btn.dataset.cat;
        renderizarCompeticoesInternacionais();
    });
    el.querySelectorAll(".comp-tournament-card").forEach(btn => btn.onclick = () => {
        uiSelectCompInt = btn.dataset.comp;
        aplicarTemaCompeticao(uiSelectCompInt);
        renderizarCompeticoesInternacionais();
    });
}

function renderBlocoFaseInternacional(faseObj, corComp) {
    if(faseObj.tipo === "grupos" && faseObj.grupos) {
        const avancam = faseObj.avancam || 2;
        let grid = `<div class="grupo-grid">`;
        faseObj.grupos.forEach(grp => {
            const ord = [...grp.equipas].sort((a,b) => b.pts - a.pts || (b.gf-b.gs) - (a.gf-a.gs));
            grid += `<div class="bracket-group-card" style="--comp-cor:${corComp || "var(--theme-primary)"}">
                <div class="grupo-card-head"><h4>${grp.nome}</h4><span class="grupo-card-meta">${avancam} classificam</span></div>
                <table class="grupo-table"><thead><tr><th class="col-pos">#</th><th class="col-team">Seleção</th><th>P</th><th>J</th><th>SG</th></tr></thead><tbody>
                ${ord.map((e,i) => {
                    const s = SELECOES.find(x=>x.id===e.id);
                    const rankClass = i===0?"rank-1":i===1?"rank-2":i===2?"rank-3":"";
                    const qualifica = i < avancam;
                    return `<tr class="${e.id===jogador?.selecaoId?'bracket-row-me':''} ${qualifica?'row-qualifica':''} ${i===avancam-1?'linha-corte':''}" onclick="abrirPerfilSelecao('${e.id}')">
                        <td class="col-pos"><span class="grupo-pos ${rankClass}">${i+1}</span></td>
                        <td class="col-team"><img loading="lazy" decoding="async" src="${s?.logo||''}" class="bracket-flag">${s?.nome||e.nome}</td>
                        <td><strong>${e.pts}</strong></td><td>${e.j}</td><td>${e.gf-e.gs > 0 ? "+" : ""}${e.gf-e.gs}</td>
                    </tr>`;
                }).join("")}</tbody></table></div>`;
        });
        grid += `</div>`;
        return `<div class="fase-bloco bracket-phase"><h4 class="bracket-title">${faseObj.fase}</h4>${grid}</div>`;
    }
    if(faseObj.tipo === "mata-mata" && faseObj.confrontos) {
        const cor = corComp || CORES_COMP.default;
        return `<div class="fase-bloco bracket-phase"><h4 class="bracket-title">${faseObj.fase}</h4>${renderArvoreMataMata(faseObj.confrontos, cor)}</div>`;
    }
    return "";
}

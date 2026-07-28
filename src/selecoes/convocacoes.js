function normalizarElencosEPosicoes() {
    const mapa = {
        j_rossi:"Goleiro", j_emerson:"Lateral", j_lucasm:"Ponta", j_calleri:"Atacante", j_luciano:"Meia Ofensivo", j_rafael:"Goleiro", j_pablomaia:"Volante",
        j_matheuzinho:"Lateral", j_hugo:"Lateral", j_bidon:"Meio-Campista", j_martinez:"Volante", j_garro:"Meia Ofensivo", j_coronado:"Meia Ofensivo", j_lingard:"Meia Ofensivo", j_talles:"Ponta",
        j_giuliano:"Meia Ofensivo", j_schmidt:"Volante", j_pituca:"Volante", j_ney:"Ponta", j_guilherme:"Ponta",
        j_arana:"Lateral", j_zaracho:"Meio-Campista", j_everson:"Goleiro", j_scarpa:"Meia Ofensivo",
        j_arias:"Ponta", j_tsilva:"Zagueiro", j_ganso:"Meia Ofensivo", j_fabio:"Goleiro", j_martineli:"Volante",
        j_soteldo:"Ponta", j_cristaldo:"Meia Ofensivo", j_villasanti:"Volante", j_marchesin:"Goleiro", j_dcosta:"Atacante",
        j_apatrick:"Meia Ofensivo", j_valencia:"Atacante", j_borre:"Atacante", j_rochet:"Goleiro", j_tmaia:"Volante", j_wanderson:"Ponta",
        j_mpereira:"Meia Ofensivo", j_william:"Lateral", j_cassio:"Goleiro", j_lromero:"Volante", j_lhenrique:"Ponta", j_savarino:"Ponta", j_john:"Goleiro",
        j_fernandinho:"Volante", j_theleno:"Zagueiro", j_zapelli:"Meia Ofensivo", j_canobbio:"Ponta", j_leolinck:"Goleiro",
        j_gvardiol:"Lateral", j_lewis:"Lateral", j_rodri:"Volante", j_reijnders:"Meio-Campista", j_silva:"Meia Ofensivo", j_savinho:"Ponta", j_doku:"Ponta", j_cherki:"Meia Ofensivo", j_foden:"Meia Ofensivo",
        j_saka:"Ponta", j_odegaard:"Meia Ofensivo", j_rice:"Volante", j_saliba:"Zagueiro", j_gabriel:"Zagueiro", j_raya:"Goleiro", j_gyokeres:"Atacante",
        j_vandijk:"Zagueiro", j_alisson:"Goleiro", j_trent:"Lateral", j_macallister:"Meio-Campista", j_diaz:"Ponta",
        j_enzo:"Meio-Campista", j_caicedo:"Volante", j_james:"Lateral", j_jackson:"Atacante", j_nkunku:"Meia Ofensivo",
        j_dalot:"Lateral", j_shaw:"Lateral", j_mazraoui:"Lateral", j_ugarte:"Volante", j_casemiro:"Volante", j_bruno:"Meia Ofensivo", j_mbeumo:"Ponta", j_amad:"Ponta", j_matheus_cunha:"Meia Ofensivo", j_zirkzee:"Atacante", j_sesko:"Atacante"
    };
    jogadoresIA.forEach(j => { if(mapa[j.id]) j.posicao = mapa[j.id]; });
    const porClube = {};
    jogadoresIA.forEach(j => {
        if(!porClube[j.clubeId]) porClube[j.clubeId] = [];
        porClube[j.clubeId].push(j);
        j.nacionalidade = normalizarNacionalidade(j.nacionalidade);
        if(!j.statsSelecao) j.statsSelecao = { jogos:0, gols:0, assistencias:0, convocacoes:0 };
    });
    const template = ["Goleiro","Zagueiro","Zagueiro","Lateral","Lateral","Volante","Meio-Campista","Meia Ofensivo","Ponta","Ponta","Atacante","Atacante"];
    Object.values(porClube).forEach(lista => {
        lista.sort((a,b) => (b.geral || 0) - (a.geral || 0));
        lista.forEach((j, idx) => {
            if(!j.posicao || j.posicao === "Base") j.posicao = template[idx % template.length];
            // ⚙️ ATRIBUTOS INDIVIDUAIS: todo jogador (não só o teu) passa a ter
            // finalização, velocidade, passe, defesa ("carrinho"), cabeceamento,
            // drible, resistência e força próprios — gerados a partir da posição
            // e do OVR, com uma pitada de variação individual. Isto é o que o
            // motor de partida (match.js) usa para decidir quem marca, quem
            // assiste e quem defende, em vez de só olhar pro OVR genérico.
            // 🆕 Preenche só o que ESTIVER FALTANDO em cada jogador, um campo de
            // cada vez — nunca sobrescreve um atributo que já exista. Isso é o
            // que permite fixar atributos específicos direto em jogadores.js
            // (ex: Harry Kane sempre com 96 de finalização em todo save): antes,
            // definir só 1 campo fazia o motor pular o jogador inteiro e deixar
            // os outros 8 atributos undefined pro resto do jogo.
            const gerados = gerarAtributosParaJogador(j.posicao, j.geral || 60);
            Object.keys(gerados).forEach(attr => { if (typeof j[attr] === "undefined") j[attr] = gerados[attr]; });
        });
    });
}

function obterClubeJogador(p) {
    return clubes.find(c => c.id === p?.clubeId);
}

function bonusLigaTop5(p) {
    return TOP5_LIGAS_EUROPA.includes(obterClubeJogador(p)?.ligaId) ? 1 : 0;
}

function pontuarJogadorSelecao(p, competicao = null) {
    const st = p === jogador ? (p.estatisticasAtuais || {}) : (p.statsTemporada || {});
    let score = (p.geral || 60) * 1.65 + (st.jogos || 0) * 0.45;
    const criador = ["Ponta", "Meia Ofensivo", "Meio-Campista"].includes(p.posicao);
    const finalizador = ["Atacante", "Ponta", "Meia Ofensivo"].includes(p.posicao);
    score += (st.gols || 0) * (finalizador ? 5.2 : 2.0);
    score += (st.assistencias || 0) * (criador ? 4.8 : 2.0);
    if(bonusLigaTop5(p)) score += 12;
    if(obterClubeJogador(p)?.reputacao >= 85) score += 7;
    if(p.idade <= 23) score += 2;
    if(competicao?.sub23 && p.idade > 23) score -= 45;
    if(p.lesaoRodadas > 0) score -= 999;
    return score;
}

function agruparConvocados(lista) {
    return {
        goleiros: lista.filter(p => POSICOES_CONVOCACAO.goleiros.includes(p.posicao)),
        laterais: lista.filter(p => POSICOES_CONVOCACAO.laterais.includes(p.posicao)),
        defensores: lista.filter(p => POSICOES_CONVOCACAO.defensores.includes(p.posicao)),
        meio: lista.filter(p => POSICOES_CONVOCACAO.meio.includes(p.posicao)),
        ataque: lista.filter(p => POSICOES_CONVOCACAO.ataque.includes(p.posicao))
    };
}

function gerarConvocacaoSelecao(selecao, competicao = null) {
    const todos = [jogador, ...jogadoresIA.filter(j => !j.aposentado)].filter(p => !p?.aposentadoSelecao);
    const elegiveis = todos
        .filter(p => normalizarNacionalidade(p.nacionalidade) === normalizarNacionalidade(selecao.pais))
        .map(p => ({ p, score:pontuarJogadorSelecao(p, competicao) }))
        .filter(x => x.score > 0);
    const porPos = {
        goleiros: elegiveis.filter(x => POSICOES_CONVOCACAO.goleiros.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,3),
        laterais: elegiveis.filter(x => POSICOES_CONVOCACAO.laterais.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,4),
        defensores: elegiveis.filter(x => POSICOES_CONVOCACAO.defensores.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,5),
        meio: elegiveis.filter(x => POSICOES_CONVOCACAO.meio.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,7),
        ataque: elegiveis.filter(x => POSICOES_CONVOCACAO.ataque.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,6)
    };
    let convocados = Object.values(porPos).flat().map(x => x.p);
    const ids = new Set(convocados.map(p => p.id));
    elegiveis.sort((a,b)=>b.score-a.score).forEach(x => {
        if(convocados.length < 23 && !ids.has(x.p.id)) { convocados.push(x.p); ids.add(x.p.id); }
    });
    const meuScore = pontuarJogadorSelecao(jogador, competicao);
    const corte = Math.max(112, elegiveis[22]?.score || 112);
    convocados = convocados.slice(0, 23);
    return { selecao, competicao, convocados, grupos:agruparConvocados(convocados), meuScore, corte, convocado:convocados.some(p => p.id === "player") };
}

function reconstruirConvocacaoDeEstado(ultima, selecao, competicao) {
    if(!ultima?.ids) return null;
    const resolver = (id) => id === "player" ? jogador : jogadoresIA.find(j => j.id === id);
    const convocados = ultima.ids.map(resolver).filter(Boolean);
    return { selecao, competicao: COMPETICOES_SELECOES.find(c => c.nome === ultima.competicao) || competicao, convocados, grupos: agruparConvocados(convocados), convocado: ultima.convocado };
}

// ==========================================
// 🧒 CONVOCAÇÃO PARA SELEÇÕES DE BASE (Sub-17 / Sub-21)
// ==========================================
// Praticamente idêntica a gerarConvocacaoSelecao(), mas o "elenco do país"
// considerado é filtrado por idade PRIMEIRO (idadeMax do torneio). Como a
// pontuação (pontuarJogadorSelecao) é sempre relativa aos outros jogadores
// elegíveis, um jovem de 17 anos só compete com outros jovens de até 17 anos
// — não precisa ser "nível seleção principal" para ser convocado aqui.
function gerarConvocacaoSelecaoBase(selecao, competicaoBase) {
    const idadeMax = competicaoBase.idadeMax;
    const todos = [jogador, ...jogadoresIA.filter(j => !j.aposentado)];
    const elegiveis = todos
        .filter(p => (p.idade || 99) <= idadeMax)
        .filter(p => normalizarNacionalidade(p.nacionalidade) === normalizarNacionalidade(selecao.pais))
        .map(p => ({ p, score: pontuarJogadorSelecao(p, null) })) // sem penalização "sub23", a idade já foi filtrada acima
        .filter(x => x.score > 0);
    const porPos = {
        goleiros: elegiveis.filter(x => POSICOES_CONVOCACAO.goleiros.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,3),
        laterais: elegiveis.filter(x => POSICOES_CONVOCACAO.laterais.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,4),
        defensores: elegiveis.filter(x => POSICOES_CONVOCACAO.defensores.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,5),
        meio: elegiveis.filter(x => POSICOES_CONVOCACAO.meio.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,7),
        ataque: elegiveis.filter(x => POSICOES_CONVOCACAO.ataque.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,6)
    };
    let convocados = Object.values(porPos).flat().map(x => x.p);
    const ids = new Set(convocados.map(p => p.id));
    elegiveis.sort((a,b)=>b.score-a.score).forEach(x => {
        if(convocados.length < 23 && !ids.has(x.p.id)) { convocados.push(x.p); ids.add(x.p.id); }
    });
    convocados = convocados.slice(0, 23);
    return { selecao, competicao: competicaoBase, convocados, grupos: agruparConvocados(convocados), convocado: convocados.some(p => p.id === "player") };
}

// Processa a janela de convocação de BASE (Sub-17/Sub-21) para o jogador
// local — irmã de processarJanelaSelecoes(), mas totalmente independente da
// seleção principal (um jogador pode estar fora da seleção principal e ainda
// assim ser convocado para o Sub-17/Sub-21, ou vice-versa).
function processarJanelaSelecoesBase() {
    if(!jogador || jogador.idade > 21) return; // acima do limite do escalão mais velho (Sub-21): nada a fazer aqui
    const chave = `base-${anoAtual}-${rodadaAtual}`;
    const competicaoBase = obterCompeticaoSelecaoBase();
    if(!competicaoBase) return;
    if(jogador.idade > competicaoBase.idadeMax) return; // ex: tem 19 anos mas é janela do Sub-17
    if(selecoesEstado.ultimaChaveBase === chave) return;
    selecoesEstado.ultimaChaveBase = chave;

    const selecao = obterSelecaoPorNacionalidade(jogador.nacionalidade);
    const convocacao = gerarConvocacaoSelecaoBase(selecao, competicaoBase);

    if(!selecoesEstado.convocacoesBase) selecoesEstado.convocacoesBase = [];
    selecoesEstado.convocacoesBase.unshift({
        ano:anoAtual, rodada:rodadaAtual, selecao:selecao.nome, selecaoId:selecao.id, competicao:competicaoBase.nome,
        convocado:convocacao.convocado, ids:convocacao.convocados.map(p=>p.id)
    });
    selecoesEstado.convocacoesBase = selecoesEstado.convocacoesBase.slice(0, 8);

    if(convocacao.convocado) {
        if(!jogador.statsSelecaoBase) jogador.statsSelecaoBase = { jogos:0, gols:0, assistencias:0, convocacoes:0 };
        jogador.statsSelecaoBase.convocacoes++;
        registrarNoticia(`Convocado para o ${competicaoBase.nome}!`, `${jogador.nome} foi chamado para representar ${selecao.nome} no ${competicaoBase.nome} ${anoAtual}.`, "Seleções");
        mostrarToast("Seleção de Base", `Convocado para o ${competicaoBase.nome}! 🧒⚽`, "success");
        inicializarTorneioInternacional({ ...competicaoBase, sub23: false, isBase: true });
        agendarJogosInternacionais();
    }
    renderizarSelecoes();
}

function atualizarStatsSelecao(p, jogos, gols, assistencias) {
    if(!p.statsSelecao) p.statsSelecao = { jogos:0, gols:0, assistencias:0, convocacoes:0 };
    p.statsSelecao.jogos += jogos;
    p.statsSelecao.gols += gols;
    p.statsSelecao.assistencias += assistencias;
    p.statsSelecao.selecao = normalizarNacionalidade(p.nacionalidade);
}

// ==========================================
// 🌍 ESTATÍSTICAS DE SELEÇÃO PARA QUALQUER PAÍS (não só o do jogador)
// ==========================================
// simularTorneiosInternacionais() simula centenas de jogos entre seleções
// (ex: Alemanha 2x1 França) mas SÓ ao nível do placar agregado do país —
// nunca atribuía o jogo/gol/assistência a jogadores específicos. Por isso,
// qualquer jogador que não fosse convocado junto do jogador humano (ex: um
// "Bruno" que joga por outra seleção) ficava sempre com estatísticas em 0,
// mesmo sendo campeão. Esta cache+função corrige isso na raiz.
const _cachePlantelSelecaoIA = {};
function obterPlantelSelecaoParaStatsIA(selecaoId) {
    const chaveCache = `${selecaoId}_${anoAtual}`;
    if (_cachePlantelSelecaoIA[chaveCache]) return _cachePlantelSelecaoIA[chaveCache];
    const sel = SELECOES.find(s => s.id === selecaoId);
    if (!sel) return [];
    const pool = obterJogadoresNacionalidade(sel.pais).filter(p => !p.aposentado).sort((a,b) => (b.geral||0) - (a.geral||0)).slice(0, 18);
    // 🆕 Define titulares (11) e capitão desta seleção junto com o plantel, para
    // que nem todo o grupo de 18 receba minutos/estatísticas por igual.
    if (pool.length > 0) { const { titularesIds, capitaoId } = definirTitularesECapitao(pool); pool.titularesIds = titularesIds; pool.capitaoId = capitaoId; }
    _cachePlantelSelecaoIA[chaveCache] = pool;
    return pool;
}

// Reduz um plantel de seleção (18 ou o convocados de uma convocação) aos 11
// titulares + um banco rotativo pequeno (até 4), em vez do grupo inteiro —
// mesmo princípio do montarEscalacaoJogo() usado nos clubes.
function montarEscalacaoSelecao(pool, titularesIds) {
    if (!titularesIds || !titularesIds.length) return pool;
    const idsTit = new Set(titularesIds);
    const titulares = pool.filter(p => idsTit.has(p.id));
    const bancoTotal = pool.filter(p => !idsTit.has(p.id));
    const nEntram = Math.min(4, bancoTotal.length);
    const poolCopia = [...bancoTotal]; const entram = [];
    while (entram.length < nEntram && poolCopia.length > 0) {
        const idx = Math.floor(Math.random() * poolCopia.length);
        entram.push(poolCopia.splice(idx, 1)[0]);
    }
    return [...titulares, ...entram];
}

// Atribui o resultado de UM jogo entre duas seleções (gA gols para o país A,
// gB para o país B) a jogadores específicos de cada plantel — mesma lógica
// de pesos por posição usada em simularPartidasSelecao, só que aplicada a
// qualquer confronto simulado pelo motor de torneios internacionais.
function atribuirStatsPartidaSelecaoIA(paisAId, paisBId, gA, gB) {
    const pesosGol = { "Atacante":0.95, "Ponta":0.72, "Meia Ofensivo":0.58, "Meio-Campista":0.30, "Volante":0.10, "Lateral":0.06, "Zagueiro":0.03, "Goleiro":0.002 };
    const pesosAst = { "Atacante":0.36, "Ponta":0.70, "Meia Ofensivo":0.86, "Meio-Campista":0.70, "Volante":0.42, "Lateral":0.48, "Zagueiro":0.10, "Goleiro":0.02 };
    const sortear = (pool, campo) => {
        const pesos = campo === "gols" ? pesosGol : pesosAst;
        const total = pool.reduce((acc,p) => acc + Math.pow((p.geral||60)/100, 4.6) * (pesos[p.posicao]||0.22), 0);
        if (total <= 0) return null;
        let alvo = Math.random() * total;
        for (const p of pool) {
            alvo -= Math.pow((p.geral||60)/100, 4.6) * (pesos[p.posicao]||0.22);
            if (alvo <= 0) return p;
        }
        return pool[0];
    };
    const processarLado = (paisId, gols) => {
        const plantel = obterPlantelSelecaoParaStatsIA(paisId);
        if (!plantel.length) return;
        const pool = montarEscalacaoSelecao(plantel, plantel.titularesIds);
        pool.forEach(p => atualizarStatsSelecao(p, 1, 0, 0));
        for (let g = 0; g < gols; g++) {
            const autor = sortear(pool, "gols");
            const assist = Math.random() < 0.78 ? sortear(pool, "assistencias") : null;
            if (autor) atualizarStatsSelecao(autor, 0, 1, 0);
            if (assist && assist.id !== autor?.id) atualizarStatsSelecao(assist, 0, 0, 1);
        }
    };
    processarLado(paisAId, gA);
    processarLado(paisBId, gB);
}

function simularPartidasSelecao(convocacao) {
    const jogos = Math.max(1, convocacao.competicao?.jogos || 1);
    const pesosGol = { "Atacante":0.95, "Ponta":0.72, "Meia Ofensivo":0.58, "Meio-Campista":0.30, "Volante":0.10, "Lateral":0.06, "Zagueiro":0.03, "Goleiro":0.002 };
    const pesosAst = { "Atacante":0.36, "Ponta":0.70, "Meia Ofensivo":0.86, "Meio-Campista":0.70, "Volante":0.42, "Lateral":0.48, "Zagueiro":0.10, "Goleiro":0.02 };
    const poolTotal = convocacao.convocados;
    if(poolTotal.length === 0) return;
    const { titularesIds } = definirTitularesECapitao(poolTotal);
    const sortear = (pool, campo) => {
        const pesos = campo === "gols" ? pesosGol : pesosAst;
        const total = pool.reduce((acc,p) => acc + Math.pow((p.geral || 60) / 100, 4.6) * (pesos[p.posicao] || 0.22), 0);
        let alvo = Math.random() * total;
        for(const p of pool) {
            alvo -= Math.pow((p.geral || 60) / 100, 4.6) * (pesos[p.posicao] || 0.22);
            if(alvo <= 0) return p;
        }
        return pool[0];
    };
    // Convocação conta pra todo o grupo (foi convocado, independente de jogar).
    poolTotal.forEach(p => {
        if(!p.statsSelecao) p.statsSelecao = { jogos:0, gols:0, assistencias:0, convocacoes:0 };
        p.statsSelecao.convocacoes++;
    });
    // 🆕 "Jogos" (minutos reais) só para quem entra em campo naquela partida
    // específica: os titulares + um banco rotativo pequeno — não o grupo
    // convocado inteiro, que antes recebia jogo por igual mesmo sem jogar.
    for(let j=0; j<jogos; j++) {
        const pool = montarEscalacaoSelecao(poolTotal, titularesIds);
        pool.forEach(p => atualizarStatsSelecao(p, 1, 0, 0));
        const golsTime = Math.max(0, Math.floor(Math.random()*3) + (pool.some(p=>p.geral>=88) ? 1 : 0));
        for(let g=0; g<golsTime; g++) {
            const autor = sortear(pool, "gols");
            const assist = Math.random() < 0.78 ? sortear(pool, "assistencias") : null;
            if(autor) atualizarStatsSelecao(autor, 0, 1, 0);
            if(assist && assist.id !== autor?.id) atualizarStatsSelecao(assist, 0, 0, 1);
        }
    }
}

function cardConvocadoAnimado(p, delay, ehTitular = false, ehCapitao = false) {
    const clube = obterClubeJogador(p);
    const logoClube = clube ? obterUrlImagem(clube, 'clube') : "";
    return `<div class="convocado-card convocado-anim ${p.id === "player" ? "eu" : ""} ${ehTitular ? "titular" : "reserva"}" style="animation-delay:${delay}s;">
        <img loading="lazy" decoding="async" class="convocado-foto" src="${obterUrlImagem(p,'jogador')}" alt="${p.nome}">
        <div style="flex:1; min-width:0;">
            <strong>${p.nome}${p.id === "player" ? " ⭐" : ""}${ehCapitao ? ' <span class="badge-capitao" title="Capitão">C</span>' : ''}</strong><br>
            <small style="color:#aaa; font-weight:700;">${p.posicao}${ehTitular ? " • Titular" : ""}</small>
        </div>
        ${logoClube ? `<img loading="lazy" decoding="async" class="convocado-clube" src="${logoClube}" alt="${clube?.nome || ''}" title="${clube?.nome || ''}">` : ""}
        <span class="meta-pill">OVR ${p.geral}</span>
    </div>`;
}

let convocacaoAnimationTimeouts = [];
let convocacaoAnimationIntervals = [];

// Preferência do jogador: pular automaticamente a animação de convocação
// nas ocasiões em que ele NÃO for convocado (evita perder tempo com listas irrelevantes).
let pularConvocacaoAutomatico = localStorage.getItem("rumo_pref_pular_convocacao") === "true";

window.alternarPularConvocacaoAutomatico = function() {
    pularConvocacaoAutomatico = !pularConvocacaoAutomatico;
    localStorage.setItem("rumo_pref_pular_convocacao", pularConvocacaoAutomatico ? "true" : "false");
    mostrarToast(
        "Preferência Guardada",
        pularConvocacaoAutomatico
            ? "A partir de agora, quando não fores convocado, a animação será pulada automaticamente."
            : "A animação de convocação voltará a ser exibida normalmente.",
        "info"
    );
    renderizarSelecoes();
};

function mostrarAnimacaoConvocacao(convocacao, forcarExibicao = false) {
    if (convocacao.convocado) window.tocarSom('convocacao'); // 🔊 som ao ser convocado
    // Se o jogador ativou "pular quando não for convocado" e esta não é uma consulta manual,
    // mostra apenas um toast rápido em vez de abrir o modal com a animação completa.
    if (!forcarExibicao && !convocacao.convocado && pularConvocacaoAutomatico) {
        mostrarToast(
            `Convocação ${convocacao.selecao.nome}`,
            `${jogador.nome} ficou de fora da lista para ${convocacao.competicao?.nome || "Data FIFA"} desta vez.`,
            "warning"
        );
        return;
    }

    const antigo = document.getElementById("modalConvocacaoSelecao");
    if(antigo) antigo.remove();
    
    // Clear any existing animation timers
    convocacaoAnimationTimeouts.forEach(t => clearTimeout(t));
    convocacaoAnimationIntervals.forEach(i => clearInterval(i));
    convocacaoAnimationTimeouts = [];
    convocacaoAnimationIntervals = [];
    
    const labels = { goleiros:"Goleiros", laterais:"Laterais", defensores:"Defensores", meio:"Meio-campistas", ataque:"Ataque" };
    let delay = 0;
    const euConvocado = convocacao.convocado;
    // 🆕 Mesmo cálculo de titulares/capitão usado na aba Seleções, aplicado
    // aqui pra já aparecer na animação de revelação da lista.
    const todosConvocadosModal = Object.values(convocacao.grupos).flat();
    const { titularesIds: titularesModalIds, capitaoId: capitaoModalId } = todosConvocadosModal.length ? definirTitularesECapitao(todosConvocadosModal) : { titularesIds: [], capitaoId: null };
    const setTitularesModal = new Set(titularesModalIds);
    const banner = euConvocado
        ? `<div class="convocacao-convocado-banner">⭐ ${jogador.nome} FOI CONVOCADO pela Seleção ${convocacao.selecao.nome}!</div>`
        : `<div class="convocacao-nao-convocado">❌ ${jogador.nome} não atingiu o nível exigido e ficou DE FORA da convocação.</div>`;
    const bloco = (key) => `
        <div class="convocacao-grupo">
            <h4>${labels[key]}</h4>
            <div class="convocacao-modal-grid">
                ${(convocacao.grupos[key] || []).map(p => { delay += 0.05; return cardConvocadoAnimado(p, delay, setTitularesModal.has(p.id), p.id === capitaoModalId); }).join("")}
            </div>
        </div>`;
    const modal = document.createElement("div");
    modal.id = "modalConvocacaoSelecao";
    modal.className = "modal";
    modal.innerHTML = `
        <div class="modal-convocacao-card slide-in">
            <div class="modal-convocacao-head">
                <div style="display:flex; align-items:center; gap:14px;">
                    <img loading="lazy" decoding="async" src="${convocacao.selecao.logo}" alt="${convocacao.selecao.nome}" onerror="this.style.display='none'">
                    <div><span style="color:var(--theme-primary); font-weight:900; text-transform:uppercase;">Convocação oficial</span><h2 style="margin:4px 0 0;">${convocacao.selecao.nome}</h2><p style="margin:4px 0 0; color:#aaa;">${convocacao.competicao?.nome || "Data FIFA"} • ${anoAtual}</p></div>
                </div>
                <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; justify-content:flex-end;">
                    <label style="display:flex; align-items:center; gap:5px; font-size:0.72rem; color:#aaa; cursor:pointer; user-select:none;">
                        <input type="checkbox" onchange="window.alternarPularConvocacaoAutomatico()" ${pularConvocacaoAutomatico ? "checked" : ""} style="width:14px; height:14px; cursor:pointer;">
                        Sempre pular quando não for convocado
                    </label>
                    <button class="btn-skip-anim" onclick="window.pularAnimacaoConvocacao()" style="padding:8px 16px; border-radius:8px; border:1px solid var(--warning); background:rgba(250,204,21,0.15); color:var(--warning); font-weight:700; cursor:pointer; font-size:0.85rem; text-transform:uppercase;">⏭️ Pular Animação</button>
                    <button class="close-btn" onclick="document.getElementById('modalConvocacaoSelecao')?.remove()">×</button>
                </div>
            </div>
            ${banner}
            ${["goleiros","laterais","defensores","meio","ataque"].map(bloco).join("")}
            <div style="text-align:center; margin-top:20px;"><button class="btn btn-primary" onclick="document.getElementById('modalConvocacaoSelecao')?.remove()">Fechar Lista ➔</button></div>
        </div>`;
    document.body.appendChild(modal);
}

window.pularAnimacaoConvocacao = function() {
    // Clear all animation timers
    convocacaoAnimationTimeouts.forEach(t => clearTimeout(t));
    convocacaoAnimationIntervals.forEach(i => clearInterval(i));
    convocacaoAnimationTimeouts = [];
    convocacaoAnimationIntervals = [];
    
    // Immediately show all animated elements
    const modal = document.getElementById("modalConvocacaoSelecao");
    if(modal) {
        const animElements = modal.querySelectorAll('.convocado-anim');
        animElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0) scale(1)';
        });
    }
};

function processarJanelaSelecoes(forcar = false) {
    if(!jogador) return;
    const chave = `${anoAtual}-${rodadaAtual}`;
    const compAtualAgenda = agendaTemporada[rodadaAtual - 1];
    const slotAtual = obterSlotCalendarioAtual();
    const janela = forcar || rodadaAtual === 1 || compAtualAgenda?.isSelecao || ehJanelaSelecaoCalendario(slotAtual);
    const selecao = obterSelecaoPorNacionalidade(jogador.nacionalidade);
    const competicao = obterCompeticaoSelecao(selecao);

    if(forcar) {
        const ultima = selecoesEstado.convocacoes?.find(c => c.selecaoId === selecao.id);
        const convocacao = ultima ? reconstruirConvocacaoDeEstado(ultima, selecao, competicao) : gerarConvocacaoSelecao(selecao, competicao);
        if(convocacao) mostrarAnimacaoConvocacao(convocacao, true);
        return;
    }

    if(!janela || selecoesEstado.ultimaChave === chave) return;
    selecoesEstado.ultimaChave = chave;

    const convocacao = gerarConvocacaoSelecao(selecao, competicao);
    selecoesEstado.convocacoes.unshift({
        ano:anoAtual, rodada:rodadaAtual, selecao:selecao.nome, selecaoId:selecao.id, competicao:competicao.nome, convocado:convocacao.convocado,
        ids:convocacao.convocados.map(p=>p.id),
        grupos:Object.fromEntries(Object.entries(convocacao.grupos).map(([k,lista]) => [k, lista.map(p=>p.id)]))
    });
    selecoesEstado.convocacoes = selecoesEstado.convocacoes.slice(0, 12);
    const listaNomes = convocacao.convocados.slice(0, 8).map(p => p.nome).join(", ");
    registrarNoticia(`Convocação da Seleção ${selecao.nome}`, `Esta é a lista oficial para ${competicao.nome}: ${listaNomes}${convocacao.convocados.length > 8 ? "..." : ""}.`, "Seleções");

    if((jogador.lesaoRodadas || 0) > 0 && normalizarNacionalidade(jogador.nacionalidade) === normalizarNacionalidade(selecao.pais)) {
        jogador.naSelecao = false;
        registrarNoticia("Cortado por lesão", `${jogador.nome} ficou fora da convocação da Seleção ${selecao.nome} por problema físico.`, "Seleções");
        mostrarAnimacaoConvocacao(convocacao);
    } else if(convocacao.convocado) {
        jogador.naSelecao = true;
        jogador.selecaoId = selecao.id;
        if(!jogador.statsSelecao) jogador.statsSelecao = { jogos:0, gols:0, assistencias:0, convocacoes:0 };
        registrarNoticia("Chamado para a seleção", `${jogador.nome} entrou na lista da Seleção ${selecao.nome} para ${competicao.nome}.`, "Seleções");
        if(Math.random() < 0.55) abrirEntrevista("selecao", { selecao:selecao.nome, competicao:competicao.nome });
    } else {
        jogador.naSelecao = false;
        registrarNoticia("Fora da lista", `${jogador.nome} não atingiu o corte da Seleção ${selecao.nome}: desempenho e concorrência pesaram na decisão.`, "Seleções");
    }
    mostrarAnimacaoConvocacao(convocacao);
    if (convocacao.convocado) {
        // 🛡️ FIX: os companheiros de seleção (jogadores da IA convocados junto
        // contigo) nunca acumulavam jogos/gols/assistências pela seleção —
        // a função que faz isso (simularPartidasSelecao) existia no código mas
        // nunca era chamada por ninguém. As TUAS estatísticas continuam a vir
        // do jogo ao vivo (mais precisas: minutos reais, etc.), por isso aqui
        // simulo só para os teus companheiros de seleção.
        simularPartidasSelecao({ ...convocacao, convocados: convocacao.convocados.filter(p => p.id !== "player") });
    }
    if(convocacao.convocado && FORMATOS_INT[competicao.id]?.formato !== "amistoso") inicializarTorneioInternacional(competicao);
    if(convocacao.convocado) agendarJogosInternacionais();
    renderizarSelecoes();
}
window.processarJanelaSelecoes = processarJanelaSelecoes;
window.renderizarCompeticoesInternacionais = renderizarCompeticoesInternacionais;

function renderizarSelecoes() {
    const el = document.getElementById("view-selecoes");
    if(!el || !jogador) return;
    // 🌐 RIVALIDADE ONLINE: card exclusivo do modo online — compara, lado a
    // lado, as tuas estatísticas com as do teu amigo (usa o perfil dele já
    // sincronizado em jogadoresIA). Não existe no modo offline porque não há
    // ninguém para comparar.
    const cardRivalidade = (() => {
        if (window.connectionMode !== 'online' || !window.onlinePartnerId) return "";
        const amigo = jogadoresIA.find(j => j.id === window.onlinePartnerId);
        if (!amigo) return "";
        const linha = (label, meu, dele) => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px dashed rgba(255,255,255,0.08);">
                <strong style="color:${meu >= dele ? 'var(--success)' : '#fff'};">${meu}</strong>
                <span style="color:#aaa; font-size:0.85rem;">${label}</span>
                <strong style="color:${dele >= meu ? 'var(--success)' : '#fff'};">${dele}</strong>
            </div>`;
        return `<div class="selecao-card" style="margin-bottom:18px; grid-column:1/-1; border:1px solid var(--theme-primary);">
            <h3 style="margin-top:0; text-align:center;">🌐 Rivalidade — Tu vs ${amigo.nome}</h3>
            ${linha("Overall (OVR)", jogador.geral, amigo.geral || 0)}
            ${linha("Gols na época", jogador.estatisticasAtuais.gols, amigo.statsTemporada?.gols || 0)}
            ${linha("Assistências na época", jogador.estatisticasAtuais.assistencias, amigo.statsTemporada?.assistencias || 0)}
            ${linha("Troféus pela seleção", jogador.titulosSelecao?.length || 0, amigo.titulosSelecao?.length || 0)}
        </div>`;
    })();
    const selecao = obterSelecaoPorNacionalidade(jogador.nacionalidade);
    const proxima = obterCompeticaoSelecao(selecao);
    const ultima = selecoesEstado.convocacoes?.find(c => c.selecaoId === selecao.id);
    const todos = [jogador, ...jogadoresIA.filter(j => !j.aposentado)];
    const resolver = (id) => id === "player" ? jogador : jogadoresIA.find(j => j.id === id);
    const grupos = ultima?.grupos ? Object.fromEntries(Object.entries(ultima.grupos).map(([k, ids]) => [k, ids.map(resolver).filter(Boolean)])) : gerarConvocacaoSelecao(selecao, proxima).grupos;
    // 🆕 Titulares + capitão desta convocação — assim dá pra ver não só quem
    // foi chamado, mas quem realmente começa jogando e quem usa a braçadeira.
    const todosConvocados = Object.values(grupos).flat();
    const { titularesIds: titularesConvocacaoIds, capitaoId: capitaoConvocacaoId } = todosConvocados.length ? definirTitularesECapitao(todosConvocados) : { titularesIds: [], capitaoId: null };
    const setTitularesConvocacao = new Set(titularesConvocacaoIds);
    const labels = { goleiros:"Goleiros", laterais:"Laterais", defensores:"Defensores", meio:"Meio-campistas", ataque:"Ataque" };
    const iconesPos = { goleiros:"🧤", laterais:"↔️", defensores:"🛡️", meio:"⚙️", ataque:"⚔️" };
    const bloco = (key) => `
        <div class="convocacao-grupo">
            <h4>${iconesPos[key] || ""} ${labels[key]} <span class="convocacao-grupo-count">${(grupos[key] || []).length}</span></h4>
            ${(grupos[key] || []).map(p => {
                const clube = obterClubeJogador(p);
                const ehCapitao = p.id === capitaoConvocacaoId;
                const ehTitular = setTitularesConvocacao.has(p.id);
                return `<div class="convocado-row ${p.id === "player" ? "eu" : ""} ${ehTitular ? "titular" : "reserva"}" onclick="abrirPerfilJogador('${p.id}')">
                    <img loading="lazy" decoding="async" src="${obterUrlImagem(p,'jogador')}" alt="${p.nome}">
                    <div>
                        <strong>${p.nome}${ehCapitao ? ' <span class="badge-capitao" title="Capitão">C</span>' : ''}</strong>
                        <small>${clube?.nome || "Livre"} • ${p.posicao} • ${p.statsSelecao?.jogos || 0}J ${p.statsSelecao?.gols || 0}G ${p.statsSelecao?.assistencias || 0}A</small>
                    </div>
                    ${clube ? `<img loading="lazy" decoding="async" class="convocado-escudo" src="${obterUrlImagem(clube,'clube')}">` : `<span></span>`}
                    <span class="convocado-status-tag ${ehTitular ? "titular" : "reserva"}">${ehTitular ? "Titular" : "Banco"}</span>
                    <span class="meta-pill">OVR ${p.geral}</span>
                </div>`;
            }).join("") || `<p style="color:#aaa;">Sem nomes suficientes.</p>`}
        </div>`;
    const rankingSelecao = todos
        .filter(p => normalizarNacionalidade(p.nacionalidade) === normalizarNacionalidade(selecao.pais))
        .sort((a,b) => (b.statsSelecao?.gols || 0) - (a.statsSelecao?.gols || 0) || (b.geral || 0) - (a.geral || 0))
        .slice(0, 8);
    el.innerHTML = `
        ${cardRivalidade}
        <div class="selecao-shell">
            <section>
                <div class="selecao-hero">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <img loading="lazy" decoding="async" src="${selecao.logo}" alt="${selecao.nome}" onerror="this.style.display='none'">
                        <div><span style="color:var(--theme-primary); font-weight:900; text-transform:uppercase;">Carreira internacional</span><h2 style="margin:4px 0;">Seleção ${selecao.nome}</h2><p style="margin:0; color:#aaa;">Próxima janela: ${proxima.nome}${proxima.div ? ` • Divisão ${proxima.div}` : ""}</p></div>
                    </div>
                    <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap; justify-content:flex-end;">
                        <label style="display:flex; align-items:center; gap:6px; font-size:0.78rem; color:#aaa; cursor:pointer; user-select:none; max-width:170px; line-height:1.2;">
                            <input type="checkbox" id="chkPularConvocacao" onchange="window.alternarPularConvocacaoAutomatico()" ${pularConvocacaoAutomatico ? "checked" : ""} style="width:16px; height:16px; cursor:pointer; flex-shrink:0;">
                            Pular animação quando eu não for convocado
                        </label>
                        <button class="btn btn-primary" onclick="processarJanelaSelecoes(true)">Ver convocação</button>
                    </div>
                </div>
                <div class="selecao-card" style="margin-top:16px;">
                    <h3 style="margin-top:0;">Lista ${ultima ? `${ultima.competicao} ${ultima.ano}` : "prévia"}</h3>
                    <div class="convocacao-resumo">
                        <span>👥 ${todosConvocados.length} convocados</span>
                        <span>🧢 Capitão: ${resolver(capitaoConvocacaoId)?.nome || "—"}</span>
                        <span>🏟️ ${new Set(todosConvocados.map(p => obterClubeJogador(p)?.id).filter(Boolean)).size} clubes representados</span>
                        <span>⭐ ${jogador?.naSelecao ? "Você está na lista" : "Você está fora da lista"}</span>
                    </div>
                    ${["goleiros","laterais","defensores","meio","ataque"].map(bloco).join("")}
                </div>
            </section>
            <aside class="selecao-card">
                <h3 style="margin-top:0;">Teus números pela seleção</h3>
                <div class="selecao-stats-grid">
                    <div class="selecao-stat"><strong>${jogador.statsSelecao?.jogos || 0}</strong><span>Jogos</span></div>
                    <div class="selecao-stat"><strong>${jogador.statsSelecao?.gols || 0}</strong><span>Gols</span></div>
                    <div class="selecao-stat"><strong>${jogador.statsSelecao?.assistencias || 0}</strong><span>Assistências</span></div>
                </div>
                <p style="color:#aaa; line-height:1.6;">Status: <strong style="color:${jogador.naSelecao ? 'var(--success)' : '#f87171'};">${jogador.naSelecao ? "Convocado recentemente" : "Fora da última lista"}</strong></p>
                <h4 style="color:var(--theme-primary);">Competições no ciclo</h4>
                ${COMPETICOES_SELECOES.filter(c => c.conf === "GLOBAL" || c.conf === selecao.conf).map(c => `<div style="padding:10px 0; border-bottom:1px dashed rgba(255,255,255,0.09);"><strong>${c.nome}</strong><br><small style="color:#aaa;">${c.div ? `Divisão ${c.div}` : c.ciclo}</small></div>`).join("")}
                <h4 style="color:var(--theme-primary); margin-top:18px;">Destaques da seleção</h4>
                ${rankingSelecao.map(p => {
                    const clube = obterClubeJogador(p);
                    return `<div class="convocado-row" onclick="abrirPerfilJogador('${p.id}')">
                        <img loading="lazy" decoding="async" src="${obterUrlImagem(p,'jogador')}">
                        <div><strong>${p.nome}</strong><br><small>${clube?.nome || "Livre"} • ${p.statsSelecao?.jogos || 0}J • ${p.statsSelecao?.gols || 0}G • ${p.statsSelecao?.assistencias || 0}A</small></div>
                        ${clube ? `<img loading="lazy" decoding="async" src="${obterUrlImagem(clube,'clube')}" style="width:24px;height:24px;object-fit:contain;background:#fff;border-radius:4px;padding:2px;">` : ""}
                        <span class="meta-pill">OVR ${p.geral}</span>
                    </div>`;
                }).join("")}
            </aside>
        </div>
        ${(() => {
            const key = chaveTorneio(proxima.id, anoAtual);
            const tor = selecoesEstado.torneios?.[key];
            if(!tor) return `<div class="selecao-card" style="margin-top:18px; grid-column:1/-1;"><p style="color:#aaa; text-align:center; padding:20px;">Nenhum torneio internacional ativo nesta temporada. Convoca-te e disputa a próxima janela FIFA.</p></div>`;
            let html = `<div class="selecao-card" style="margin-top:18px; grid-column:1/-1;"><h3 style="margin-top:0;">🏆 ${tor.nome} ${tor.ano}</h3><div class="bracket-container">`;
            if(tor.historicoFases?.length) tor.historicoFases.slice(-2).forEach(f => { html += renderBlocoFaseInternacional(f); });
            html += renderBlocoFaseInternacional(tor);
            if(tor.fase === "Campeão Definido") {
                const camp = SELECOES.find(s => s.id === tor.campeaoId);
                html += `<p style="text-align:center; color:var(--gold); font-weight:900; font-size:1.2rem;">👑 Campeão: ${camp?.nome || tor.campeaoId}</p>`;
            }
            return html + `</div></div>`;
        })()}
        ${(() => {
            // 🧒 Bloco da seleção de BASE — só aparece se o jogador ainda está
            // dentro do limite de idade (≤21) de algum escalão de base.
            if (jogador.idade > 21) return "";
            const competicaoBase = obterCompeticaoSelecaoBase();
            const ultimaBase = selecoesEstado.convocacoesBase?.find(c => c.selecaoId === selecao.id);
            const statsBase = jogador.statsSelecaoBase || { jogos:0, gols:0, assistencias:0, convocacoes:0 };
            let html = `<div class="selecao-card" style="margin-top:18px; grid-column:1/-1; border:1px dashed var(--theme-primary);">
                <h3 style="margin-top:0;">🧒 Seleção de Base ${jogador.idade <= 17 ? "(Sub-17 e Sub-21)" : "(Sub-21)"}</h3>
                <p style="color:#aaa;">Mesmo fora do nível da seleção principal, jogadores até 21 anos podem disputar os torneios de base do seu país.</p>
                <div class="selecao-stats-grid">
                    <div class="selecao-stat"><strong>${statsBase.jogos}</strong><span>Jogos</span></div>
                    <div class="selecao-stat"><strong>${statsBase.gols}</strong><span>Gols</span></div>
                    <div class="selecao-stat"><strong>${statsBase.assistencias}</strong><span>Assistências</span></div>
                    <div class="selecao-stat"><strong>${statsBase.convocacoes}</strong><span>Convocações</span></div>
                </div>`;
            if (competicaoBase && jogador.idade <= competicaoBase.idadeMax) {
                const keyBase = chaveTorneio(competicaoBase.id, anoAtual);
                const torBase = selecoesEstado.torneios?.[keyBase];
                html += `<p style="color:var(--theme-primary); font-weight:700;">📅 Janela ativa: ${competicaoBase.nome} ${anoAtual}${ultimaBase ? ` — ${ultimaBase.convocado ? "Convocado! 🎉" : "Não convocado desta vez."}` : ""}</p>`;
                if (torBase) {
                    html += `<div class="bracket-container">${renderBlocoFaseInternacional(torBase)}</div>`;
                    if (torBase.fase === "Campeão Definido") {
                        const camp = SELECOES.find(s => s.id === torBase.campeaoId);
                        html += `<p style="text-align:center; color:var(--gold); font-weight:900;">👑 Campeão: ${camp?.nome || torBase.campeaoId}</p>`;
                    }
                }
            } else {
                html += `<p style="color:#aaa;">Nenhuma janela de base ativa nesta temporada para a tua idade.</p>`;
            }
            return html + `</div>`;
        })()}`;
}

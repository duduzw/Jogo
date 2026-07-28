// ==========================================
// 🔍 CLUB ROSTER FETCHING (WITH FRIENDS)
// ==========================================

// ==========================================
// 🧢 TITULARES E CAPITÃO (clubes)
// ==========================================
// Antes, TODO o elenco (até 60 jogadores) recebia "jogos++" em toda partida
// simulada — um reserva do sub-20 acumulava a mesma quantidade de jogos que o
// titular absoluto. Agora cada clube define os seus 11 titulares (melhor
// jogador por posição, respeitando uma formação básica 4-2-3-1) mais um banco
// rotativo, e só esse grupo (titulares + banco daquele jogo) conta partida —
// o resto do elenco (jovens, reservas profundas) fica de fora da rotação real,
// como num time de verdade.
const FORMACAO_BASE_TITULARES = [["Goleiro", 1], ["Zagueiro", 2], ["Lateral", 2], ["Volante", 2], ["Meio-Campista", 1], ["Meia Ofensivo", 1], ["Ponta", 1], ["Atacante", 1]];

function definirTitularesECapitao(elenco) {
    const porPos = {};
    elenco.forEach(j => { if(!porPos[j.posicao]) porPos[j.posicao] = []; porPos[j.posicao].push(j); });
    Object.values(porPos).forEach(lista => lista.sort((a,b) => (b.geral||60) - (a.geral||60)));

    let titulares = [];
    FORMACAO_BASE_TITULARES.forEach(([pos, qtd]) => { titulares.push(...(porPos[pos] || []).slice(0, qtd)); });
    if (titulares.length < 11) {
        const idsJa = new Set(titulares.map(j => j.id));
        const restantes = elenco.filter(j => !idsJa.has(j.id)).sort((a,b) => (b.geral||60) - (a.geral||60));
        titulares.push(...restantes.slice(0, 11 - titulares.length));
    }

    // Capitão: entre os titulares, prioriza quem tem mais "peso" de liderança
    // (geral alto + veterania), com leve preferência por zagueiros/volantes
    // (perfil clássico de braçadeira).
    const pesoLideranca = (j) => (j.geral||60) + (j.idade||24) * 0.35 + (["Zagueiro","Volante","Goleiro"].includes(j.posicao) ? 3 : 0);
    const capitao = [...titulares].sort((a,b) => pesoLideranca(b) - pesoLideranca(a))[0] || null;

    return { titularesIds: titulares.map(j => j.id), capitaoId: capitao?.id || null };
}

function obterTitularesClube(clubeId) {
    const clube = clubes.find(c => c.id === clubeId);
    if (!clube) return null;
    const elenco = jogadoresIA.filter(j => j.clubeId === clubeId && !j.aposentado);
    if (elenco.length === 0) return null;
    if (clube._titularesCacheTam === elenco.length && clube.titularesIds) return clube;

    const { titularesIds, capitaoId } = definirTitularesECapitao(elenco);
    clube.titularesIds = titularesIds;
    clube.capitaoId = capitaoId;
    clube._titularesCacheTam = elenco.length;
    return clube;
}

// Monta a escalação real de UM jogo: os 11 titulares + um banco de até 7
// jogadores sorteados (com preferência aos melhores) entre os reservas de
// maior nível — em vez do elenco inteiro. É essa lista (não o elenco inteiro)
// que deve receber estatísticas/minutos daquele jogo específico.
function montarEscalacaoJogo(clubeId) {
    const elenco = jogadoresIA.filter(j => j.clubeId === clubeId && !j.aposentado);
    if (elenco.length === 0) return elenco;
    const clube = obterTitularesClube(clubeId);
    if (!clube || !clube.titularesIds) return elenco; // elenco pequeno/incomum: mantém comportamento antigo como fallback seguro

    const idsTitulares = new Set(clube.titularesIds);
    const titulares = elenco.filter(j => idsTitulares.has(j.id));
    let reservas = elenco.filter(j => !idsTitulares.has(j.id)).sort((a,b) => (b.geral||60) - (a.geral||60));
    if (reservas.length === 0) return titulares;

    const poolBanco = reservas.slice(0, Math.min(reservas.length, 14)); // banco real sai só dos 14 melhores reservas
    const tamanhoBanco = Math.min(7, poolBanco.length);
    const banco = [];
    const poolCopia = [...poolBanco];
    while (banco.length < tamanhoBanco && poolCopia.length > 0) {
        const idx = Math.floor(Math.random() * poolCopia.length);
        banco.push(poolCopia.splice(idx, 1)[0]);
    }
    return [...titulares, ...banco];
}

function getElencoClube(clubeId, incluirAposentados = false) {
    // Use Firebase integration if online mode is active
    if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode()) {
        return window.firebaseIntegration.fetchClubRosterWithFriends(clubeId);
    }
    
    // Fallback to original behavior
    let elenco = jogadoresIA.filter(j => j.clubeId === clubeId && (incluirAposentados || !j.aposentado));
    if (jogador && jogador.clubeId === clubeId) {
        elenco.unshift({ ...jogador, id: 'player', isMe: true });
    }
    return elenco;
}

/** Motor de torneios internacionais e utilitários de seleções */

export const FORMATOS_INT = {
    amistoso: { formato: "amistoso" },
    eliminatorias_uefa: { formato: "grupos", conf: "UEFA", grupos: 2, porGrupo: 6, avancam: 1, jogosGrupo: 10, eliminatoria: true, destino: "copa_mundo" },
    eliminatorias_conmebol: { formato: "liga", conf: "CONMEBOL", maxTimes: 10, jogosRound: 2, eliminatoria: true, destino: "copa_mundo", vagas: 4 },
    eliminatorias_concacaf: { formato: "grupos", conf: "CONCACAF", grupos: 3, porGrupo: 4, avancam: 1, jogosGrupo: 6, eliminatoria: true, destino: "copa_mundo" },
    eliminatorias_caf: { formato: "grupos", conf: "CAF", grupos: 5, porGrupo: 4, avancam: 1, jogosGrupo: 6, eliminatoria: true, destino: "copa_mundo" },
    eliminatorias_afc: { formato: "grupos", conf: "AFC", grupos: 4, porGrupo: 4, avancam: 1, jogosGrupo: 6, eliminatoria: true, destino: "copa_mundo" },
    // 🌊 OFC (Oceania) — confederação pequena, então as eliminatórias são uma
    // liguinha única (todos contra todos) em vez de vários grupos, e a Copa
    // das Nações da Oceania (oceania_cup) segue o mesmo formato "grupos_mata"
    // dos outros campeonatos continentais.
    eliminatorias_ofc: { formato: "liga", conf: "OFC", maxTimes: 6, jogosRound: 2, eliminatoria: true, destino: "copa_mundo", vagas: 1 },
    oceania_cup: { formato: "grupos_mata", grupos: 2, porGrupo: 3, avancam: 2, mataLegs: 1, conf: "OFC", jogosGrupo: 2 },
    copa_mundo: { formato: "grupos_mata", grupos: 8, porGrupo: 4, avancam: 2, mataLegs: 1, jogosGrupo: 3 },
    olimpiadas: { formato: "grupos_mata", grupos: 4, porGrupo: 4, avancam: 2, mataLegs: 1, sub23: true, jogosGrupo: 3 },
    euro: { formato: "grupos_mata", grupos: 6, porGrupo: 4, avancam: 2, mataLegs: 1, conf: "UEFA", jogosGrupo: 3 },
    copa_america: { formato: "grupos_mata", grupos: 4, porGrupo: 4, avancam: 2, mataLegs: 1, conf: "CONMEBOL", jogosGrupo: 3 },
    gold_cup: { formato: "grupos_mata", grupos: 3, porGrupo: 4, avancam: 2, mataLegs: 1, conf: "CONCACAF", jogosGrupo: 3 },
    copa_africa: { formato: "grupos_mata", grupos: 4, porGrupo: 4, avancam: 2, mataLegs: 1, conf: "CAF", jogosGrupo: 3 },
    copa_asia: { formato: "grupos_mata", grupos: 4, porGrupo: 4, avancam: 2, mataLegs: 1, conf: "AFC", jogosGrupo: 3 },
    euro_qualy: { formato: "grupos", conf: "UEFA", grupos: 5, porGrupo: 5, avancam: 2, jogosGrupo: 8, eliminatoria: true, destino: "euro" },
    nations_a: { formato: "nations_grupos", conf: "UEFA", div: "A", grupos: 4, porGrupo: 4, avancamTop: 2, avancamBottom: 1 },
    nations_b: { formato: "liga", conf: "UEFA", div: "B", maxTimes: 8 },
    nations_c: { formato: "liga", conf: "UEFA", div: "C", maxTimes: 8 },
    nations_d: { formato: "liga", conf: "UEFA", div: "D", maxTimes: 6 },
    // ==========================================
    // 🧒 SELEÇÕES DE BASE (Sub-17 e Sub-21)
    // ==========================================
    // Mesmo formato "grupos_mata" dos torneios continentais adultos, mas com
    // um limite de idade (idadeMax) que restringe quem pode ser convocado.
    // Dão a jogadores jovens — mesmo sem nível para a seleção principal — uma
    // competição de verdade para representar o seu país.
    mundial_sub17: { formato: "grupos_mata", grupos: 6, porGrupo: 4, avancam: 2, mataLegs: 1, jogosGrupo: 3, idadeMax: 17 },
    mundial_sub21: { formato: "grupos_mata", grupos: 6, porGrupo: 4, avancam: 2, mataLegs: 1, jogosGrupo: 3, idadeMax: 21 }
};

// Diz se uma competição é uma fase eliminatória/classificatória (que dá vaga
// para outra competição maior), em vez de um torneio final em si.
export function isEliminatoria(compId) {
    return compId?.startsWith("eliminatorias_") || compId === "euro_qualy";
}

// Gera uma chave única para identificar um torneio internacional específico
// (competição + ano), usada para guardar o estado do torneio em selecoesEstado.
export function chaveTorneio(compId, ano) {
    return `int_${compId}_${ano}`;
}

// Converte os dados de uma seleção (país) num objeto "time" simples, no
// formato que o motor de mata-mata/grupos espera (id, nome, logo, país).
export function criarTimeTorneio(selecao) {
    return { id: selecao.id, nome: selecao.nome, logo: selecao.logo, pais: selecao.pais };
}

/** Ano do torneio principal (ex: 2025 elim → Copa 2026) */
export function anoTorneioDestino(compId, anoElim) {
    const fmt = FORMATOS_INT[compId];
    if (!fmt?.destino) return null;
    if (fmt.destino === "copa_mundo") return anoElim + 1;
    if (fmt.destino === "euro") return anoElim + 1;
    return null;
}

/** Calendário real: eliminatórias em anos ímpares/alternados, torneios no ano seguinte ou par */
export function idsCompeticoesAtivas(ano) {
    const ids = [];
    // Eliminatórias Copa (ex: 2025 → Copa 2026)
    if (ano % 4 === 1) {
        ids.push("eliminatorias_uefa", "eliminatorias_conmebol", "eliminatorias_concacaf", "eliminatorias_caf", "eliminatorias_afc", "eliminatorias_ofc");
    }
    // Copa do Mundo (ex: 2026)
    if (ano % 4 === 2) ids.push("copa_mundo");
    // Olimpíadas (anos múltiplos de 4: 2024, 2028)
    if (ano % 4 === 0) ids.push("olimpiadas");
    // Eliminatórias Euro (ex: 2027 → Euro 2028)
    if (ano % 4 === 3) ids.push("euro_qualy");
    // Torneios continentais (ex: 2028 Euro, Copa América)
    if (ano % 4 === 0) {
        ids.push("euro", "copa_america", "gold_cup", "copa_africa", "copa_asia", "oceania_cup");
    }
    // Nations League (anos ímpares: 2025, 2027)
    if (ano % 2 === 1) ids.push("nations_a", "nations_b", "nations_c", "nations_d");
    // 🧒 Mundial Sub-17: em anos ímpares (não coincide com a Copa do Mundo adulta).
    if (ano % 2 === 1) ids.push("mundial_sub17");
    // 🧒 Mundial Sub-21: em anos pares que NÃO são de Copa do Mundo nem Olimpíadas
    // (para não sobrecarregar o calendário de base no mesmo ano de dois grandes torneios adultos).
    if (ano % 2 === 0 && ano % 4 !== 2 && ano % 4 !== 0) ids.push("mundial_sub21");
    return ids;
}

// Classifica uma competição internacional numa categoria ampla, usada para
// escolher o ícone e a organização visual na tela de Competições Internacionais.
export function categoriaComp(compId) {
    if (isEliminatoria(compId)) return "eliminatorias";
    if (compId.startsWith("nations_")) return "nations";
    if (compId === "amistoso") return "amistosos";
    if (compId === "copa_mundo" || compId === "olimpiadas") return "mundial";
    if (compId.startsWith("mundial_sub")) return "base";
    return "continental";
}

// Monta os metadados de exibição (categoria, ícone, subtítulo "classificatório
// para X") de uma competição, para as telas de seleções/competições internacionais.
export function metaCompeticao(compId, ano) {
    const cat = categoriaComp(compId);
    const dest = anoTorneioDestino(compId, ano);
    const nomes = {
        copa_mundo: "Copa do Mundo",
        euro: "Eurocopa",
        copa_america: "Copa América",
        gold_cup: "Gold Cup",
        copa_africa: "Copa Africana",
        copa_asia: "Copa da Ásia",
        oceania_cup: "Copa das Nações da Oceania"
    };
    const destinoNome = dest && FORMATOS_INT[compId]?.destino ? nomes[FORMATOS_INT[compId].destino] : null;
    return {
        categoria: cat,
        destinoAno: dest,
        destinoNome,
        subtitulo: destinoNome ? `Classificatório • Rumo à ${destinoNome} ${dest}` : null,
        // Usado só como ÚLTIMO recurso quando nenhum logo oficial é encontrado
        // (ver obterUrlImagem/obterLogoTorneioInternacional no main.js).
        icon: cat === "eliminatorias" ? "🎫" : cat === "mundial" ? "🌍" : cat === "continental" ? "🏆" : cat === "nations" ? "⚔️" : cat === "base" ? "🧒" : "🤝"
    };
}

// Simula uma disputa de pênaltis entre duas seleções/times, com a força de
// cada lado (0-100) influenciando a chance de acertar/defender cada cobrança.
export function simularPenaltis(forcaA, forcaB) {
    const atkA = forcaA * 0.82 + 8;
    const atkB = forcaB * 0.82 + 8;
    const gkA = forcaA * 0.72 + 6;
    const gkB = forcaB * 0.72 + 6;
    let penA = 0, penB = 0, rodada = 0;
    const cobrar = (atk, gk) => Math.random() * (gk + 18) < atk;
    while (rodada < 30) {
        if (cobrar(atkA, gkB)) penA++;
        if (cobrar(atkB, gkA)) penB++;
        rodada++;
        if (rodada >= 5 && penA !== penB && rodada % 2 === 0) break;
        if (rodada >= 10 && penA !== penB && rodada % 2 === 0) break;
    }
    return { penA, penB, venceA: penA > penB };
}

// Decide o vencedor de um confronto de mata-mata: quem fez mais gols agregados
// vence direto; em caso de empate, vai para os pênaltis (ver simularPenaltis).
export function resolverVencedorMataMata(idA, idB, golsA, golsB, forcaA = 75, forcaB = 75) {
    if (golsA > golsB) return { vencedorId: idA, penaltis: false, placarPen: null };
    if (golsB > golsA) return { vencedorId: idB, penaltis: false, placarPen: null };
    const pens = simularPenaltis(forcaA, forcaB);
    const vencedorId = pens.venceA ? idA : idB;
    return { vencedorId, penaltis: true, placarPen: `${pens.penA}-${pens.penB}` };
}

// Simula o placar de um jogo entre duas seleções, a partir da força (0-100)
// de cada lado. Em mata-mata, garante que não fica empatado (soma +1 gol
// aleatório a favor de quem tem mais força/sorte para desempatar).
export function simularPlacarSelecao(forcaA, forcaB, isMataMata = false) {
    const total = forcaA + forcaB;
    let chanceA = (forcaA / total) * 0.05 + 0.008;
    let chanceB = (forcaB / total) * 0.05;
    let gA = 0, gB = 0;
    for (let i = 0; i < 90; i += 8) {
        const r = Math.random();
        if (r < chanceA) gA++;
        else if (r < chanceA + chanceB) gB++;
    }
    if (isMataMata && gA === gB) {
        if (Math.random() < forcaA / total) gA++;
        else gB++;
    }
    return { gA, gB };
}

// Cores de destaque usadas na UI para cada competição (barras, badges, etc.).
export const CORES_COMP = {
    copa_mundo: "#facc15",
    euro: "#3b82f6",
    copa_america: "#22c55e",
    nations_a: "#a855f7",
    olimpiadas: "#f97316",
    eliminatorias_uefa: "#60a5fa",
    eliminatorias_conmebol: "#4ade80",
    euro_qualy: "#818cf8",
    mundial_sub17: "#2dd4bf",
    mundial_sub21: "#38bdf8",
    oceania_cup: "#0ea5e9",
    eliminatorias_ofc: "#0ea5e9",
    default: "#00ff88"
};
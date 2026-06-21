/** Motor de torneios internacionais e utilitários de seleções */

export const FORMATOS_INT = {
    amistoso: { formato: "amistoso" },
    eliminatorias_uefa: { formato: "grupos", conf: "UEFA", grupos: 2, porGrupo: 6, avancam: 1, jogosGrupo: 10, eliminatoria: true, destino: "copa_mundo" },
    eliminatorias_conmebol: { formato: "liga", conf: "CONMEBOL", maxTimes: 10, jogosRound: 2, eliminatoria: true, destino: "copa_mundo", vagas: 4 },
    eliminatorias_concacaf: { formato: "grupos", conf: "CONCACAF", grupos: 3, porGrupo: 4, avancam: 1, jogosGrupo: 6, eliminatoria: true, destino: "copa_mundo" },
    eliminatorias_caf: { formato: "grupos", conf: "CAF", grupos: 5, porGrupo: 4, avancam: 1, jogosGrupo: 6, eliminatoria: true, destino: "copa_mundo" },
    eliminatorias_afc: { formato: "grupos", conf: "AFC", grupos: 4, porGrupo: 4, avancam: 1, jogosGrupo: 6, eliminatoria: true, destino: "copa_mundo" },
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
    nations_d: { formato: "liga", conf: "UEFA", div: "D", maxTimes: 6 }
};

export function isEliminatoria(compId) {
    return compId?.startsWith("eliminatorias_") || compId === "euro_qualy";
}

export function chaveTorneio(compId, ano) {
    return `int_${compId}_${ano}`;
}

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
        ids.push("eliminatorias_uefa", "eliminatorias_conmebol", "eliminatorias_concacaf", "eliminatorias_caf", "eliminatorias_afc");
    }
    // Copa do Mundo (ex: 2026)
    if (ano % 4 === 2) ids.push("copa_mundo");
    // Olimpíadas (anos múltiplos de 4: 2024, 2028)
    if (ano % 4 === 0) ids.push("olimpiadas");
    // Eliminatórias Euro (ex: 2027 → Euro 2028)
    if (ano % 4 === 3) ids.push("euro_qualy");
    // Torneios continentais (ex: 2028 Euro, Copa América)
    if (ano % 4 === 0) {
        ids.push("euro", "copa_america", "gold_cup", "copa_africa", "copa_asia");
    }
    // Nations League (anos ímpares: 2025, 2027)
    if (ano % 2 === 1) ids.push("nations_a", "nations_b", "nations_c", "nations_d");
    return ids;
}

export function categoriaComp(compId) {
    if (isEliminatoria(compId)) return "eliminatorias";
    if (compId.startsWith("nations_")) return "nations";
    if (compId === "amistoso") return "amistosos";
    if (compId === "copa_mundo" || compId === "olimpiadas") return "mundial";
    return "continental";
}

export function metaCompeticao(compId, ano) {
    const cat = categoriaComp(compId);
    const dest = anoTorneioDestino(compId, ano);
    const nomes = {
        copa_mundo: "Copa do Mundo",
        euro: "Eurocopa",
        copa_america: "Copa América",
        gold_cup: "Gold Cup",
        copa_africa: "Copa Africana",
        copa_asia: "Copa da Ásia"
    };
    const destinoNome = dest && FORMATOS_INT[compId]?.destino ? nomes[FORMATOS_INT[compId].destino] : null;
    return {
        categoria: cat,
        destinoAno: dest,
        destinoNome,
        subtitulo: destinoNome ? `Classificatório • Rumo à ${destinoNome} ${dest}` : null,
        icon: cat === "eliminatorias" ? "🛤️" : cat === "mundial" ? "🌍" : cat === "continental" ? "🏆" : cat === "nations" ? "⚔️" : "🤝"
    };
}

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

export function resolverVencedorMataMata(idA, idB, golsA, golsB, forcaA = 75, forcaB = 75) {
    if (golsA > golsB) return { vencedorId: idA, penaltis: false, placarPen: null };
    if (golsB > golsA) return { vencedorId: idB, penaltis: false, placarPen: null };
    const pens = simularPenaltis(forcaA, forcaB);
    const vencedorId = pens.venceA ? idA : idB;
    return { vencedorId, penaltis: true, placarPen: `${pens.penA}-${pens.penB}` };
}

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

export const CORES_COMP = {
    copa_mundo: "#facc15",
    euro: "#3b82f6",
    copa_america: "#22c55e",
    nations_a: "#a855f7",
    olimpiadas: "#f97316",
    eliminatorias_uefa: "#60a5fa",
    eliminatorias_conmebol: "#4ade80",
    euro_qualy: "#818cf8",
    default: "#00ff88"
};

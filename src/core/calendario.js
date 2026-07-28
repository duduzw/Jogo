const CALENDARIO_MODELOS = {
    europeu: [
        { de: 1, ate: 2, mes: "Julho", periodo: "Pre-temporada" },
        { de: 3, ate: 6, mes: "Agosto", periodo: "Abertura da temporada" },
        { de: 7, ate: 10, mes: "Setembro", periodo: "Data FIFA e ligas" },
        { de: 11, ate: 14, mes: "Outubro", periodo: "Grupos continentais" },
        { de: 15, ate: 18, mes: "Novembro", periodo: "Copas e Data FIFA" },
        { de: 19, ate: 22, mes: "Dezembro", periodo: "Fecho do ano" },
        { de: 23, ate: 26, mes: "Janeiro", periodo: "Retorno e supercopas" },
        { de: 27, ate: 30, mes: "Fevereiro", periodo: "Copas nacionais" },
        { de: 31, ate: 34, mes: "Marco", periodo: "Data FIFA e oitavas" },
        { de: 35, ate: 38, mes: "Abril", periodo: "Quartas e semis" },
        { de: 39, ate: 44, mes: "Maio", periodo: "Finais e ultima rodada" },
        { de: 45, ate: 50, mes: "Junho", periodo: "Selecoes" },
        { de: 51, ate: 54, mes: "Julho", periodo: "Torneios de selecoes" },
        { de: 55, ate: 58, mes: "Agosto", periodo: "Pre-temporada próxima" },
        { de: 59, ate: 60, mes: "Agosto", periodo: "Férias e descanso" }
    ],
    ano: [
        { de: 1, ate: 3, mes: "Janeiro", periodo: "Pre-temporada" },
        { de: 4, ate: 7, mes: "Fevereiro", periodo: "Supercopas e estaduais" },
        { de: 8, ate: 11, mes: "Marco", periodo: "Inicio da liga" },
        { de: 12, ate: 15, mes: "Abril", periodo: "Copas nacionais" },
        { de: 16, ate: 19, mes: "Maio", periodo: "Liga e copas" },
        { de: 20, ate: 23, mes: "Junho", periodo: "Data FIFA" },
        { de: 24, ate: 27, mes: "Julho", periodo: "Meio da temporada" },
        { de: 28, ate: 31, mes: "Agosto", periodo: "Copas continentais" },
        { de: 32, ate: 35, mes: "Setembro", periodo: "Data FIFA" },
        { de: 36, ate: 39, mes: "Outubro", periodo: "Decisoes de copa" },
        { de: 40, ate: 45, mes: "Novembro", periodo: "Finais continentais" },
        { de: 46, ate: 50, mes: "Dezembro", periodo: "Ultimas rodadas" },
        { de: 51, ate: 54, mes: "Dezembro", periodo: "Férias e descanso" }
    ]
};

const CALENDARIO_PERFIS_PAIS = {
    default: { modelo: "europeu", ligaInicio: 3, ligaFim: 50, supercopaSlot: 2, copaSlots: [20, 30, 38, 46] },
    eng: { modelo: "europeu", ligaInicio: 3, ligaFim: 50, supercopaSlot: 2, copaSlots: [21, 30, 38, 45] },
    esp: { modelo: "europeu", ligaInicio: 3, ligaFim: 50, supercopaSlot: 24, copaSlots: [19, 28, 36, 44] },
    ita: { modelo: "europeu", ligaInicio: 3, ligaFim: 50, supercopaSlot: 24, copaSlots: [14, 27, 36, 44] },
    ger: { modelo: "europeu", ligaInicio: 3, ligaFim: 48, supercopaSlot: 2, copaSlots: [16, 26, 37, 46] },
    fra: { modelo: "europeu", ligaInicio: 3, ligaFim: 49, supercopaSlot: 2, copaSlots: [17, 28, 38, 45] },
    pt: { modelo: "europeu", ligaInicio: 3, ligaFim: 49, supercopaSlot: 2, copaSlots: [17, 27, 37, 45] },
    nl: { modelo: "europeu", ligaInicio: 3, ligaFim: 49, supercopaSlot: 2, copaSlots: [16, 27, 37, 45] },
    br: { modelo: "ano", ligaInicio: 8, ligaFim: 50, supercopaSlot: 4, copaSlots: [15, 25, 37, 45] },
    arg: { modelo: "ano", ligaInicio: 7, ligaFim: 48, supercopaSlot: 4, copaSlots: [16, 26, 38, 46] },
    uy: { modelo: "ano", ligaInicio: 7, ligaFim: 48, supercopaSlot: 4, copaSlots: [17, 27, 38, 46] },
    usa: { modelo: "ano", ligaInicio: 8, ligaFim: 45, supercopaSlot: 24, copaSlots: [17, 25, 34, 39] },
    mx: { modelo: "ano", ligaInicio: 5, ligaFim: 42, supercopaSlot: 3, copaSlots: [13, 21, 30, 37] }
};

const CALENDARIO_COMPETICOES_REALISTAS = {
    carabao_eng: { modelo: "europeu", slots: [8, 16, 24, 32], janela: "Carabao Cup" },
    copa_eng: { modelo: "europeu", slots: [21, 30, 38, 45], janela: "FA Cup" },
    supercopa_eng: { modelo: "europeu", slots: [2], janela: "Community Shield" },
    copa_esp: { modelo: "europeu", slots: [19, 28, 36, 44], janela: "Copa del Rey" },
    supercopa_esp: { modelo: "europeu", slots: [24], janela: "Supercopa da Espanha" },
    copa_ita: { modelo: "europeu", slots: [14, 27, 36, 44], janela: "Coppa Italia" },
    supercopa_ita: { modelo: "europeu", slots: [24], janela: "Supercoppa" },
    copa_ger: { modelo: "europeu", slots: [16, 26, 37, 46], janela: "DFB-Pokal" },
    copa_fra: { modelo: "europeu", slots: [17, 28, 38, 45], janela: "Coupe de France" },
    copa_pt: { modelo: "europeu", slots: [17, 27, 37, 45], janela: "Taça de Portugal" },
    copa_nl: { modelo: "europeu", slots: [16, 27, 37, 45], janela: "KNVB Beker" },
    copa_br: { modelo: "ano", slots: [15, 25, 37, 45], janela: "Copa do Brasil" },
    copa_arg: { modelo: "ano", slots: [16, 26, 38, 46], janela: "Copa Argentina" },
    copa_uy: { modelo: "ano", slots: [17, 27, 38, 46], janela: "Copa Uruguay" },
    copa_usa: { modelo: "ano", slots: [17, 25, 34, 39], janela: "Open Cup" },
    copa_mx: { modelo: "ano", slots: [13, 21, 30, 37], janela: "Copa MX" },
    usa_1: { modelo: "ano", slots: [5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53], janela: "MLS Regular Season" },
    usa_1_playoffs: { modelo: "ano", mata: { "Wildcard": [55], "Round 1": [57, 58, 59], "Conference Semifinals": [61, 62, 63], "Conference Finals": [65, 66, 67], "MLS Cup": [69] }, janela: "MLS Cup Playoffs" },
    br_4: { modelo: "ano", grupos: [12, 15, 18, 21, 24, 27, 30, 33, 36, 39], mata: { "1/32 de Final": [41, 42], "1/16 de Final": [44, 45], "Oitavas de Final": [47, 48], "Quartas de Final": [50, 51], "Semifinal": [53, 54], "Final": [56, 57] }, janela: "Série D" },
    br_4_acesso: { modelo: "ano", slots: [53], mata: { "Repescagem": [53] }, janela: "Repescagem de Acesso Série D" },
    uefa_cl: { modelo: "europeu", liga: [7, 10, 13, 16, 19, 22, 25, 28], mata: { "Playoff": [32, 33], "Oitavos de Final": [36, 37], "Quartas de Final": [39, 40], "Semifinal": [42, 43], "Final": [46] }, janela: "Champions League" },
    uefa_el: { modelo: "europeu", liga: [7, 10, 13, 16, 19, 22, 25, 28], mata: { "Playoff": [31, 32], "Oitavos de Final": [35, 36], "Quartas de Final": [38, 39], "Semifinal": [41, 42], "Final": [45] }, janela: "Europa League" },
    uefa_col: { modelo: "europeu", liga: [7, 10, 13, 16, 19, 22, 25, 28], mata: { "Playoff": [30, 31], "Oitavos de Final": [34, 35], "Quartas de Final": [37, 38], "Semifinal": [40, 41], "Final": [44] }, janela: "Conference League" },
    conmebol_lib: { modelo: "ano", grupos: [12, 17, 22, 27, 32, 37], mata: { "Oitavos de Final": [40, 41], "Quartas de Final": [43, 44], "Semifinal": [46, 47], "Final": [48] }, janela: "Libertadores" },
    conmebol_sul: { modelo: "ano", grupos: [12, 17, 22, 27, 32, 37], mata: { "Oitavos de Final": [39, 40], "Quartas de Final": [42, 43], "Semifinal": [45, 46], "Final": [47] }, janela: "Sul-Americana" },
    concacaf_clc: { modelo: "ano", grupos: [10, 14, 18, 22, 26, 30], mata: { "Semifinal": [34, 35], "Final": [40] }, janela: "Concacaf Champions Cup" },
    afc_cla: { modelo: "europeu", grupos: [10, 14, 18, 22, 26, 30], mata: { "Oitavos de Final": [33, 34], "Quartas de Final": [37, 38], "Semifinal": [41, 42], "Final": [46] }, janela: "AFC Champions" },
    afc_cla2: { modelo: "europeu", grupos: [10, 14, 18, 22, 26, 30], mata: { "Oitavos de Final": [33, 34], "Quartas de Final": [37, 38], "Semifinal": [41, 42], "Final": [45] }, janela: "AFC Champions 2" },
    afc_qualy: { modelo: "europeu", grupos: [6, 9, 12, 15], mata: { "Playoff": [18, 19], "Final": [22] }, janela: "AFC Qualification Zone" },
    uefa_supercup: { modelo: "europeu", slots: [2], mata: { "Final": [2] }, janela: "Supercopa da UEFA" },
    conmebol_recopa: { modelo: "ano", slots: [6, 7], mata: { "Final": [6, 7] }, janela: "Recopa Sul-Americana" },
    intercontinental_cup: { modelo: "ano", slots: [49, 50, 51], mata: { "Playoff Intercontinental": [49], "Final do Desafiante": [50], "Final": [51] }, janela: "Copa Intercontinental da FIFA" }
};

const CALENDARIO_SELECOES_REALISTA = {
    // 🤝 Só os amistosos continuam espalhados ao longo do ano (janelas normais
    // de "Data FIFA"). Tudo o resto — eliminatórias, Nations League, e todos
    // os torneios continentais — agora fica concentrado no FINAL da
    // temporada, sem competições internacionais "a sério" no meio do ano.
    amistoso: { modelo: "europeu", slots: [8, 15, 24, 33, 47], janela: "Data FIFA" },
    eliminatorias_uefa: { modelo: "europeu", slots: [47, 48, 49, 50, 51], janela: "Eliminatorias UEFA" },
    eliminatorias_conmebol: { modelo: "europeu", slots: [47, 48, 49, 50, 51], janela: "Eliminatorias CONMEBOL" },
    eliminatorias_concacaf: { modelo: "europeu", slots: [47, 48, 49, 50, 51], janela: "Eliminatorias CONCACAF" },
    eliminatorias_caf: { modelo: "europeu", slots: [47, 48, 49, 50, 51], janela: "Eliminatorias CAF" },
    eliminatorias_afc: { modelo: "europeu", slots: [47, 48, 49, 50, 51], janela: "Eliminatorias AFC" },
    eliminatorias_ofc: { modelo: "europeu", slots: [47, 48, 49, 50, 51], janela: "Eliminatorias OFC" },
    euro_qualy: { modelo: "europeu", slots: [47, 48, 49, 50, 51], janela: "Eliminatorias da Euro" },
    nations_a: { modelo: "europeu", slots: [47, 48, 49, 50], janela: "Nations League" },
    nations_b: { modelo: "europeu", slots: [47, 48, 49, 50], janela: "Nations League" },
    nations_c: { modelo: "europeu", slots: [47, 48, 49, 50], janela: "Nations League" },
    nations_d: { modelo: "europeu", slots: [47, 48, 49, 50], janela: "Nations League" },
    copa_mundo: { modelo: "europeu", slots: [48, 49, 50, 51, 52, 53, 54], janela: "Copa do Mundo" },
    euro: { modelo: "europeu", slots: [48, 49, 50, 51, 52, 53, 54], janela: "Eurocopa" },
    copa_america: { modelo: "europeu", slots: [48, 49, 50, 51, 52, 53], janela: "Copa America" },
    gold_cup: { modelo: "europeu", slots: [48, 49, 50, 51, 52], janela: "Gold Cup" },
    copa_africa: { modelo: "europeu", slots: [48, 49, 50, 51, 52], janela: "Copa Africana" },
    copa_asia: { modelo: "europeu", slots: [48, 49, 50, 51, 52], janela: "Copa da Asia" },
    oceania_cup: { modelo: "europeu", slots: [48, 49, 50, 51], janela: "Copa das Nacoes da Oceania" },
    olimpiadas: { modelo: "europeu", slots: [52, 53, 54, 55], janela: "Olimpiadas" }
};

function obterPerfilCalendarioPais(pais) {
    return { ...CALENDARIO_PERFIS_PAIS.default, ...(CALENDARIO_PERFIS_PAIS[pais] || {}) };
}

function obterConfigCalendarioCompeticao(compId) {
    const cfg = CALENDARIO_COMPETICOES_REALISTAS[compId];
    if (cfg) return cfg;
    const perfil = obterPerfilCalendarioPais(obterPaisCompeticaoId(compId));
    return { modelo: perfil.modelo, slots: perfil.copaSlots, janela: "Calendario nacional" };
}

function infoSlotCalendario(slot, modelo = "europeu") {
    const base = Math.max(1, Math.floor(Number(slot) || 1));
    const blocos = CALENDARIO_MODELOS[modelo] || CALENDARIO_MODELOS.europeu;
    const info = blocos.find(b => base >= b.de && base <= b.ate) || blocos[blocos.length - 1];
    const semana = Math.max(1, base - info.de + 1);
    return { ...info, semana, slot: base };
}

function anoDoSlotCalendario(slot, modelo = "europeu") {
    const base = Math.floor(Number(slot) || 1);
    return modelo === "europeu" && base >= 23 ? anoAtual + 1 : anoAtual;
}

function formatarDataCalendario(evento) {
    const slot = evento?.slot || rodadaAtual;
    const modelo = evento?.calendarioModelo || obterConfigCalendarioCompeticao(evento?.compId || "")?.modelo || "europeu";
    const info = infoSlotCalendario(slot, modelo);
    const diaSemana = obterDiaSemana(slot, modelo);
    return `${diaSemana}, ${info.mes} ${anoDoSlotCalendario(slot, modelo)} • ${evento?.janelaCalendario || info.periodo}`;
}

function distribuirSlots(qtd, inicio, fim) {
    if (qtd <= 1) return [fim];
    const passo = (fim - inicio) / (qtd - 1);
    return Array.from({ length: qtd }, (_, i) => Number((inicio + passo * i).toFixed(2)));
}

// 📅 Determina o dia da semana para um slot do calendário (para exibição realista)
function obterDiaSemana(slot, modelo = "europeu") {
    const base = Math.floor(Number(slot) || 1);
    // Simulação de dias da semana: slot 1 = sábado, slot 2 = domingo, slot 3 = sexta, etc.
    // Padrão realista: jogos de liga nos fins de semana, copas na semana
    const dias = ["Sábado", "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
    const diaIdx = (base - 1) % 7;
    return dias[diaIdx];
}

// 📅 Determina se um slot deve ser jogo de fim de semana ou meio de semana
function isJogoFimDeSemana(slot, tipoCompeticao = "liga") {
    const base = Math.floor(Number(slot) || 1);
    // Ligas geralmente nos fins de semana, copas podem ser na semana
    if (tipoCompeticao === "liga") {
        return (base % 7) < 2; // Sábado ou domingo
    }
    return (base % 7) >= 2 && (base % 7) <= 4; // Segunda a quarta para copas
}

function indiceFaseCalendario(fase = "") {
    const f = normalizarTexto(fase);
    if (f.includes("oitav")) return 0;
    if (f.includes("quart")) return 1;
    if (f.includes("semi")) return 2;
    if (f.includes("final")) return 3;
    return 0;
}

function obterSlotCopaCalendario(compId, fase = "", perna = 1) {
    const cfg = obterConfigCalendarioCompeticao(compId);
    const slots = cfg.slots || obterPerfilCalendarioPais(obterPaisCompeticaoId(compId)).copaSlots;
    const idx = Math.min(indiceFaseCalendario(fase), Math.max(0, slots.length - 1));
    return Number((slots[idx] + (perna === 2 ? 0.35 : 0)).toFixed(2));
}

function obterSlotContinentalCalendario(compId, fase = "", perna = 1, rodadaGrupo = 1) {
    const cfg = CALENDARIO_COMPETICOES_REALISTAS[compId] || {};
    if (fase === "Fase de Liga") {
        const liga = cfg.liga || cfg.grupos || [6, 9, 12, 15, 18, 21, 24, 27];
        return liga[Math.min(Math.max(rodadaGrupo - 1, 0), liga.length - 1)];
    }
    if (fase === "Grupos" || String(fase).includes("Grupo")) {
        const grupos = cfg.grupos || [7, 10, 13, 16, 19, 22];
        return grupos[Math.min(Math.max(rodadaGrupo - 1, 0), grupos.length - 1)];
    }
    const mata = cfg.mata || {};
    const chave = Object.keys(mata).find(k => normalizarTexto(fase).includes(normalizarTexto(k).split(" ")[0])) || fase;
    const slots = mata[chave] || mata[fase] || [34, 35];
    return Number((slots[Math.min(perna - 1, slots.length - 1)] || slots[0] || 34).toFixed(2));
}

function obterSlotCompeticaoCalendario(compId, fase = "", perna = 1, rodadaGrupo = 1) {
    const comp = competicoes.find(c => c.id === compId);
    if (comp?.tipo === "continental" || CALENDARIO_COMPETICOES_REALISTAS[compId]?.grupos || CALENDARIO_COMPETICOES_REALISTAS[compId]?.liga) {
        return obterSlotContinentalCalendario(compId, fase, perna, rodadaGrupo);
    }
    if (comp?.tipo === "supercopa") {
        const cfg = CALENDARIO_COMPETICOES_REALISTAS[compId];
        const perfil = obterPerfilCalendarioPais(obterPaisCompeticaoId(compId));
        return cfg?.slots?.[0] || perfil.supercopaSlot || 2;
    }
    return obterSlotCopaCalendario(compId, fase, perna);
}

function numeroPernasConfronto(compId, estado, fase = "") {
    if(estado?.jogoUnico) return 1;
    if(estado?.pernasFinal === 2 && normalizarTexto(fase || estado.fase).includes("final")) return 2;
    if(normalizarTexto(fase || estado?.fase).includes("final")) return 1;
    return 2;
}

function obterSlotCalendarioAtual() {
    return Number(agendaTemporada[rodadaAtual - 1]?.slot || rodadaAtual || 1);
}

function normalizarSlotFuturo(slot) {
    const atual = obterSlotCalendarioAtual();
    let alvo = Number(slot || atual + 1);
    if (rodadaAtual > 0 && alvo <= atual) alvo = Number((atual + 0.18).toFixed(2));
    return alvo;
}

function ordenarAgendaPreservandoPassado() {
    const corte = Math.max(0, rodadaAtual - 1);
    const passados = agendaTemporada.slice(0, corte);
    const futuros = agendaTemporada.slice(corte).sort((a, b) => (Number(a.slot) || 99) - (Number(b.slot) || 99) || (a.ordemCalendario || 0) - (b.ordemCalendario || 0));
    agendaTemporada = [...passados, ...futuros];
}

function adicionarEventoCalendario(evento, slot, janela = "", modelo = null) {
    const compId = evento.compConfigId || evento.compId;
    const cfg = evento.isSelecao ? (CALENDARIO_SELECOES_REALISTA[evento.compConfigId] || {}) : obterConfigCalendarioCompeticao(compId);
    const slotFinal = normalizarSlotFuturo(slot);
    const item = {
        ...evento,
        slot: slotFinal,
        janelaCalendario: janela || cfg.janela || evento.tipo,
        calendarioModelo: modelo || cfg.modelo || "europeu",
        ordemCalendario: agendaTemporada.length
    };
    item.dataCalendario = formatarDataCalendario(item);
    agendaTemporada.push(item);
    ordenarAgendaPreservandoPassado();
    return item;
}

function normalizarAgendaCalendario() {
    agendaTemporada.forEach((evento, idx) => {
        if (!evento.slot) evento.slot = idx + 1;
        if (!evento.calendarioModelo) {
            const cfg = evento.isSelecao ? CALENDARIO_SELECOES_REALISTA[evento.compConfigId] : obterConfigCalendarioCompeticao(evento.compId);
            evento.calendarioModelo = cfg?.modelo || "europeu";
        }
        
        // ❌ A LINHA DO dados.managerEstado FOI REMOVIDA DAQUI
        
        if (!evento.janelaCalendario) {
            const cfg = evento.isSelecao ? CALENDARIO_SELECOES_REALISTA[evento.compConfigId] : obterConfigCalendarioCompeticao(evento.compId);
            evento.janelaCalendario = cfg?.janela || infoSlotCalendario(evento.slot, evento.calendarioModelo).periodo;
        }
        evento.dataCalendario = formatarDataCalendario(evento);
        evento.ordemCalendario = evento.ordemCalendario ?? idx;
    });
}
function obterProximoSlotSelecao(compId, offset = 0) {
    const cfg = CALENDARIO_SELECOES_REALISTA[compId] || CALENDARIO_SELECOES_REALISTA.amistoso;
    const atual = obterSlotCalendarioAtual();
    const slotEncontrado = (cfg.slots || []).find(s => s > atual + 0.05);
    
    // Trava de segurança: se passou do slot 48 e não tem jogo oficial, limita ao teto de 52 semanas
    if (!slotEncontrado && atual >= 48) {
        return 52; 
    }
    
    const slot = slotEncontrado || (atual + 1 + offset);
    return Number((slot + offset * 0.15).toFixed(2));
}

function ehJanelaSelecaoCalendario(slot = obterSlotCalendarioAtual()) {
    const base = Math.floor(Number(slot) || 1);
    return Object.values(CALENDARIO_SELECOES_REALISTA).some(cfg => (cfg.slots || []).some(s => Math.floor(s) === base));
}

const CONFIG_VAGAS_CONTINENTAIS = {
    "eng_1": { cl: 4, el: 2, col: 1 }, "esp_1": { cl: 4, el: 2, col: 1 }, "ita_1": { cl: 4, el: 2, col: 1 },
    "ger_1": { cl: 4, el: 2, col: 1 }, "fra_1": { cl: 3, el: 2, col: 1 }, "pt_1":  { cl: 2, el: 2, col: 1 },
    "nl_1":  { cl: 2, el: 2, col: 1 }, "tr_1":  { cl: 1, el: 1, col: 1 }, "sco_1":  { cl: 1, el: 1, col: 1 }, 
    "nor_1": { cl: 1, el: 1, col: 1 }, "be_1": { cl: 1, el: 1, col: 1 }, "sui_1": { cl: 1, el: 1, col: 1 },
    "gre_1": { cl: 1, el: 1, col: 1 }, "aut_1": { cl: 1, el: 1, col: 1 },

    "br_1":  { lib: 6, sul: 6 }, "arg_1": { lib: 5, sul: 6 },"uy_1":  { lib: 4, sul: 4 }, 

    "ara_1": { cla: 4, cla2: 4 }, 
    
    "usa_1": { clc: 4 }, "mx_1": { clc: 4 },"nga_1": { clc: 4 },"civ_1": { clc: 2 },

    "default_uefa": { cl: 1, el: 1, col: 1 }, "default_conmebol": { lib: 2, sul: 2 },
    "default_asia": { cla: 4, cla2: 4 }, "default_concacaf": { clc: 4 },
};

// Cores fixas por tipo de zona de qualificação/despromoção nas tabelas de liga
const CORES_ZONAS_TABELA = {
    champions: { cor: "#3b82f6", label: "" },
    europa: { cor: "#f97316", label: "" },
    conference: { cor: "#22c55e", label: "" },
    libertadores: { cor: "#facc15", label: "" },
    sula: { cor: "#1693f9", label: "" },
    afc: { cor: "#9a10f7", label: "" },
    afc2: { cor: "#104ef7", label: "" },
    concacaf: { cor: "#7baeff", label: "" },
    rebaixamento: { cor: "#ef4444", label: "" }
};

// Devolve, para uma liga específica, as faixas de posições (0-based) que dão acesso
// a cada competição continental, mais a faixa de rebaixamento — sempre calculado
// dinamicamente a partir do número real de vagas dessa liga (ex: 4 na Premier vs 2 na Liga Portugal).
function obterZonasQualificacaoLiga(ligaId, totalClubes) {
    const zonas = [];
    const rV = CONFIG_VAGAS_CONTINENTAIS[ligaId] || (ligaId.includes("br") || ligaId.includes("arg") || ligaId.includes("uy") ? CONFIG_VAGAS_CONTINENTAIS["default_conmebol"] : (ligaId.includes("ara") ? CONFIG_VAGAS_CONTINENTAIS["default_asia"] : (ligaId.includes("usa") || ligaId.includes("mx") ? CONFIG_VAGAS_CONTINENTAIS["default_concacaf"] : CONFIG_VAGAS_CONTINENTAIS["default_uefa"])));
    const somenteDivisaoPrincipal = ligaId.endsWith("_1") || !/_\d+$/.test(ligaId);

    if (somenteDivisaoPrincipal && rV) {
        let idx = 0;
        if (rV.cl !== undefined) {
            if (rV.cl > 0) { zonas.push({ inicio: idx, fim: idx + rV.cl, ...CORES_ZONAS_TABELA.champions }); idx += rV.cl; }
            if (rV.el > 0) { zonas.push({ inicio: idx, fim: idx + rV.el, ...CORES_ZONAS_TABELA.europa }); idx += rV.el; }
            if (rV.col > 0) { zonas.push({ inicio: idx, fim: idx + rV.col, ...CORES_ZONAS_TABELA.conference }); idx += rV.col; }
        } else if (rV.lib !== undefined) {
            if (rV.lib > 0) { zonas.push({ inicio: idx, fim: idx + rV.lib, ...CORES_ZONAS_TABELA.libertadores }); idx += rV.lib; }
            if (rV.sul > 0) { zonas.push({ inicio: idx, fim: idx + rV.sul, ...CORES_ZONAS_TABELA.sula }); idx += rV.sul; }
        } else if (rV.cla !== undefined) {
            if (rV.cla > 0) { zonas.push({ inicio: idx, fim: idx + rV.cla, ...CORES_ZONAS_TABELA.afc }); idx += rV.cla; }
            if (rV.cla2 > 0) { zonas.push({ inicio: idx, fim: idx + rV.cla2, ...CORES_ZONAS_TABELA.afc2 }); idx += rV.cla2; }
        } else if (rV.clc !== undefined) {
            if (rV.clc > 0) zonas.push({ inicio: idx, fim: idx + rV.clc, ...CORES_ZONAS_TABELA.concacaf });
        }
    }

    // --- NOVA LÓGICA DE REBAIXAMENTO DINÂMICO ---
    const matchDiv = ligaId.match(/_(\d+)$/);
    if (matchDiv) {
        const divAtual = parseInt(matchDiv[1]);
        const proximaDivId = ligaId.replace(`_${divAtual}`, `_${divAtual + 1}`);
        
        // Verifica se existe uma divisão inferior ou se é uma liga que sabemos que rebaixa
        const existeDivisaoInferior = typeof tabelasLigas !== 'undefined' && tabelasLigas[proximaDivId];

        if (existeDivisaoInferior) {
            // Busca no config. Se não achar, usa lógica de fallback (Brasil=4, resto=3)
            let qtdRebaixados = CONFIG_REBAIXAMENTO[ligaId];
            
            if (qtdRebaixados === undefined) {
                qtdRebaixados = ligaId.includes("br") ? 4 : 3; // Fallback inteligente
            }

            // Só adiciona a zona se a quantidade for maior que zero (evita bugs com MLS ou ligas fechadas)
            if (qtdRebaixados > 0 && totalClubes > qtdRebaixados) {
                zonas.push({ 
                    inicio: totalClubes - qtdRebaixados, 
                    fim: totalClubes, 
                    ...CORES_ZONAS_TABELA.rebaixamento 
                });
            }
        }
    }

    return zonas;
}
function obterZonaDaPosicao(zonas, indexPos) {
    return zonas.find(z => indexPos >= z.inicio && indexPos < z.fim) || null;
}

const TOP5_LIGAS_EUROPA = ["eng_1", "esp_1", "ita_1", "ger_1", "fra_1"];
const PAISES_FORA_DA_UEFA = ["br", "arg", "uy", "ara", "usa", "mx", "nga", "cvi", "sel"];
function ehLigaEuropeia(ligaId) {
    if (!ligaId) return false;
    const prefixo = ligaId.split("_")[0];
    return !PAISES_FORA_DA_UEFA.includes(prefixo);
}
const CONFIG_REBAIXAMENTO = {
    // Brasil (4 rebaixados na Série A e B)
    "br_1": 4,
    "br_2": 4,
    "br_3": 4,

    // Inglaterra (Premier League e Championship caem 3)
    "eng_1": 3,
    "eng_2": 3,
    "eng_3": 4, // League One caem 4

    // Espanha (La Liga cai 3)
    "esp_1": 3,
    "esp_2": 4,

    // Itália (Serie A cai 3)
    "ita_1": 3,
    "ita_2": 4,

    // Alemanha (Bundesliga caem 2 diretos + 1 playoff, podemos usar 3 como padrão ou 2 diretos)
    "ger_1": 3, 
    "ger_2": 3,

    // França (Ligue 1 agora com 18 times caem 2 diretos + 1 playoff)
    "fra_1": 2,

    // Portugal (Primeira Liga caem 2 diretos + 1 playoff)
    "por_1": 2,
    
    // Arábia Saudita / MLS / Outros
    "ara_1": 3,
    "usa_1": 0 // MLS não tem rebaixamento!
};

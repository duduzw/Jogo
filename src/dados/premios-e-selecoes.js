// ==========================================
// 🏅 REALISMO DA BOLA DE OURO — pesos por competição, pontos de título
// e comparação justa entre posições.
// ==========================================

// Quanto cada gol/assistência vale, de acordo com a competição em que foi feito.
// Marcar 10 gols na Champions vale mais do que 10 gols em amistosos.
const PESO_COMPETICAO = {
    uefa_cl: 1.50, conmebol_lib: 1.20,
    uefa_el: 1.15, conmebol_sul: 1.10, concacaf_clc: 1.00, afc_cla: 1.05, afc_cla2: 1.00, uefa_col: 1.00,
    uefa_supercup: 0.60, conmebol_recopa: 0.60,
    intercontinental_cup: 1.50,
    copa_mundo: 1.80, euro: 1.55, copa_america: 1.45,
    gold_cup: 1.20, copa_africa: 1.30, copa_asia: 1.20, olimpiadas: 1.00,
    eliminatorias_uefa: 0.70, eliminatorias_conmebol: 0.70, eliminatorias_concacaf: 0.70,
    eliminatorias_caf: 0.70, eliminatorias_afc: 0.70, euro_qualy: 0.70,
    nations_a: 0.85, nations_b: 0.55, nations_c: 0.45, nations_d: 0.40,
    amistoso: 0.20
};
// Peso genérico por tipo de competição, usado quando o id não está no mapa acima
// (ligas nacionais, copas nacionais, etc., que têm um id diferente por país).
// 🆕 PRESTÍGIO DE LIGA (Bola de Ouro / Gala): antes, qualquer liga de divisão
// 1 valia o mesmo (1.00) pra pontuação de prêmios individuais — um artilheiro
// da Saudi Pro League competia de igual pra igual com um da Premier League.
// Agora cada liga div-1 tem seu próprio peso de prestígio: quanto mais longe
// do top 5 europeu (e principalmente fora da Europa), menor a pontuação que
// os gols/assistências daquele jogador valem na disputa da Gala — do jeito
// que realmente funciona o debate do prêmio no mundo real.
const PESO_LIGA_PRESTIGIO = {
    // Top 5 europeu
    eng_1: 1.35, esp_1: 1.35, ita_1: 1.30, ger_1: 1.30, fra_1: 1.20,
    // Outras ligas europeias tradicionais/fortes
    pt_1: 1.10, nl_1: 1.05,
    tr_1: 0.95, be_1: 0.90, sco_1: 0.85, sui_1: 0.85, aut_1: 0.80, gre_1: 0.80, nor_1: 0.75,
    // Sul-americanas de maior destaque (ainda abaixo da Europa)
    br_1: 0.85, arg_1: 0.80, uy_1: 0.65,
    // Resto do mundo (fora da Europa e das duas grandes sul-americanas)
    ara_1: 0.55, usa_1: 0.55, mx_1: 0.55, nga_1: 0.45, civ_1: 0.45
};
function pesoCompeticaoPorTipo(comp) {
    if (!comp) return 1.00;
    if (comp.tipo === "liga") {
        if (comp.div !== 1) return 0.55;
        return PESO_LIGA_PRESTIGIO[comp.id] ?? 0.50; // ligas não listadas: tratadas como "menor prestígio"
    }
    if (comp.tipo === "copa") return 0.80;
    if (comp.tipo === "supercopa") return 0.60;
    if (comp.tipo === "supercopa_continental") return 0.60;
    if (comp.tipo === "continental") return comp.div === 1 ? 1.50 : 1.15;
    if (comp.tipo === "torneio_intercontinental") return 1.50;
    if (comp.tipo === "selecao") return comp.div >= 1 ? 1.20 : 0.70;
    return 1.00;
}
function pesoCompeticaoId(compId) {
    if (PESO_COMPETICAO[compId] !== undefined) return PESO_COMPETICAO[compId];
    return pesoCompeticaoPorTipo(competicoes.find(c => c.id === compId));
}

// Pontos concedidos por título conquistado na temporada — a Champions e a
// Libertadores valem o mesmo, uma Supercopa vale bem menos que um título nacional.
const PONTOS_TITULO = {
    ligaPrincipal: 35, ligaSecundaria: 10,
    copaNacional: 20,
    continentalElite: 50, continentalSecundaria: 30,
    supercopaClube: 10, supercopaContinental: 15,
    intercontinental: 40,
    selecaoMundial: 60, selecaoContinentalMenor: 30,
    selecaoOlimpiadas: 35, selecaoNations: 15
};
function pontosTituloClube(comp) {
    if (!comp) return 15;
    if (comp.tipo === "copa") return PONTOS_TITULO.copaNacional;
    if (comp.tipo === "supercopa") return PONTOS_TITULO.supercopaClube;
    if (comp.tipo === "supercopa_continental") return PONTOS_TITULO.supercopaContinental;
    if (comp.tipo === "torneio_intercontinental") return PONTOS_TITULO.intercontinental;
    if (comp.tipo === "continental") return comp.div === 1 ? PONTOS_TITULO.continentalElite : PONTOS_TITULO.continentalSecundaria;
    return 15;
}
function pontosTituloSelecao(compConfigId) {
    if (["copa_mundo", "euro", "copa_america"].includes(compConfigId)) return PONTOS_TITULO.selecaoMundial;
    if (["gold_cup", "copa_africa", "copa_asia"].includes(compConfigId)) return PONTOS_TITULO.selecaoContinentalMenor;
    if (compConfigId === "olimpiadas") return PONTOS_TITULO.selecaoOlimpiadas;
    if ((compConfigId || "").startsWith("nations_")) return PONTOS_TITULO.selecaoNations;
    return 15;
}

// Agrupa posições em 4 grandes blocos para comparar "iguais com iguais" na hora
// de pontuar a Bola de Ouro — assim atacantes não dominam sempre o prêmio.
function grupoPosicaoPremio(pos) {
    if (["Atacante", "Ponta"].includes(pos)) return "atacante";
    if (["Meia Ofensivo", "Meio-Campista", "Volante"].includes(pos)) return "meia";
    if (["Zagueiro", "Lateral"].includes(pos)) return "defensor";
    if (pos === "Goleiro") return "goleiro";
    return "meia";
}

// Soma os gols/assistências do jogador em todas as competições que disputou na
// temporada, cada uma já multiplicada pelo peso da competição (ver PESO_COMPETICAO).
function statsPonderadosTemporada(p, totalGolsFallback = 0, totalAssistFallback = 0) {
    const stats = p.statsCompeticoes || {};
    const chaves = Object.keys(stats);
    if (chaves.length === 0) return { golsP: totalGolsFallback, assistP: totalAssistFallback, jogosTotais: 0 };
    let golsP = 0, assistP = 0, jogosTotais = 0;
    chaves.forEach(compId => {
        const st = stats[compId] || {};
        const peso = pesoCompeticaoId(compId);
        golsP += (st.gols || 0) * peso;
        assistP += (st.assistencias || 0) * peso;
        jogosTotais += (st.jogos || 0);
    });
    return { golsP, assistP, jogosTotais };
}

// O motor de partidas não simula cada desarme ou defesa individualmente, então
// estes números são estimados a partir de dados reais da temporada (gols sofridos
// pelo clube, jogos disputados e o nível geral do jogador) — o suficiente para dar
// a zagueiros, laterais e goleiros critérios próprios na disputa da Bola de Ouro.
// 🛡️ FIX: agora que desarmes/interceptações/defesas/jogosSemSofrerGol são
// acumulados de VERDADE a cada partida (ver atribuirEstatisticaNPC), esta
// função só entra como reserva para quem ainda não tem esses dados reais
// (ex: jogador muito jovem que ainda não completou uma temporada inteira).
function estimarPerfilDefensivo(p, ligaId, jogosNaLiga) {
    const st = p === jogador ? p.estatisticasAtuais : p.statsTemporada;
    if (st && (st.desarmes || st.interceptacoes || st.defesas || st.jogosSemSofrerGol)) {
        return {
            jogosSemSofrerGol: st.jogosSemSofrerGol || 0,
            desarmes: st.desarmes || 0,
            interceptacoes: st.interceptacoes || 0,
            defesas: st.defesas || 0,
            penaltisDefendidos: st.penaltisDefendidos || 0
        };
    }
    const ovr = p.geral || 60;
    const tabela = ligaId ? tabelasLigas[ligaId] : null;
    const clube = tabela ? tabela.find(t => t.id === p.clubeId) : null;
    let shareClean = 0.32;
    if (clube && clube.jogos > 0) {
        const mediaSofridaPorJogo = (clube.golsSofridos || 0) / clube.jogos;
        shareClean = Math.max(0.05, Math.min(0.78, 1 - mediaSofridaPorJogo / 1.4));
    }
    const jogos = jogosNaLiga || 0;
    const fatorOvr = Math.max(0, (ovr - 58)) / 100;
    return {
        jogosSemSofrerGol: Math.round(jogos * shareClean),
        desarmes: Math.round(jogos * (0.9 + fatorOvr * 2.2)),
        interceptacoes: Math.round(jogos * (0.7 + fatorOvr * 1.8)),
        defesas: Math.round(jogos * (2.4 + fatorOvr * 2.6)),
        penaltisDefendidos: Math.round(jogos * 0.045 * (ovr / 80))
    };
}

// Normaliza uma métrica (0 a 100) comparando o valor do jogador com o melhor
// valor do MESMO grupo de posição naquela temporada.
function normalizarNoGrupo(valor, maxDoGrupo) {
    if (!maxDoGrupo || maxDoGrupo <= 0) return 0;
    return Math.max(0, Math.min(100, (valor / maxDoGrupo) * 100));
}

// getElencoClube() devolve uma CÓPIA do jogador principal (para poder marcar isMe),
// então somar pontos direto nessa cópia nunca chegaria ao objeto real. Esta função
// garante que o crédito vai sempre para o "jogador" verdadeiro quando for o caso.
function creditarPontosPremio(j, pontos) {
    const alvo = (j.id === "player" || j.isMe) ? jogador : j;
    alvo.pontosPremio = (alvo.pontosPremio || 0) + pontos;
    alvo.pontosPremioTemporada = (alvo.pontosPremioTemporada || 0) + pontos;
    return alvo;
}
const POSICOES_CONVOCACAO = {
    goleiros: ["Goleiro"],
    laterais: ["Lateral"],
    defensores: ["Zagueiro"],
    meio: ["Volante", "Meio-Campista", "Meia Ofensivo"],
    ataque: ["Ponta", "Atacante"]
};
const SELECOES = [
    { id:"sel_bra", pais:"Brasil", nome:"Brasil", conf:"CONMEBOL", logo:"https://i.ibb.co/XrCdg4NJ/logo-selecao-brasileira-brasil-novo-logo-2019-com-estrelas-4096.webp", cor:"#facc15" },
    { id:"sel_arg", pais:"Argentina", nome:"Argentina", conf:"CONMEBOL", logo:"https://upload.wikimedia.org/wikipedia/pt/thumb/f/fc/230px-Afa_logo.svg.png/250px-230px-Afa_logo.svg.png", cor:"#75aadb" },
    { id:"sel_uru", pais:"Uruguai", nome:"Uruguai", conf:"CONMEBOL", logo:"https://upload.wikimedia.org/wikipedia/pt/0/04/AUF.png", cor:"#7dd3fc" },
    { id:"sel_col", pais:"Colombia", nome:"Colômbia", conf:"CONMEBOL", logo:"https://flagcdn.com/w160/co.png", cor:"#facc15" },
    { id:"sel_equ", pais:"Equador", nome:"Equador", conf:"CONMEBOL", logo:"https://flagcdn.com/w160/ec.png", cor:"#fbbf24" },
    { id:"sel_chi", pais:"Chile", nome:"Chile", conf:"CONMEBOL", logo:"https://flagcdn.com/w160/cl.png", cor:"#ef4444" },
    { id:"sel_par", pais:"Paraguai", nome:"Paraguai", conf:"CONMEBOL", logo:"https://flagcdn.com/w160/py.png", cor:"#dc2626" },
    { id:"sel_per", pais:"Peru", nome:"Peru", conf:"CONMEBOL", logo:"https://flagcdn.com/w160/pe.png", cor:"#ef4444" },
    { id:"sel_ven", pais:"Venezuela", nome:"Venezuela", conf:"CONMEBOL", logo:"https://flagcdn.com/w160/ve.png", cor:"#facc15" },
    { id:"sel_bol", pais:"Bolivia", nome:"Bolívia", conf:"CONMEBOL", logo:"https://flagcdn.com/w160/bo.png", cor:"#22c55e" },
    { id:"sel_por", pais:"Portugal", nome:"Portugal", conf:"UEFA", logo:"https://i.ibb.co/1JPSQ0v6/5332dc84e5df11eda500e9d6cabd8134.webp", cor:"#ef4444" },
    { id:"sel_esp", pais:"Espanha", nome:"Espanha", conf:"UEFA", logo:"https://upload.wikimedia.org/wikipedia/pt/3/31/Spain_National_Football_Team_badge.png", cor:"#dc2626" },
    { id:"sel_ita", pais:"Italia", nome:"Itália", conf:"UEFA", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Logo_Italy_National_Football_Team_-_2023.svg/120px-Logo_Italy_National_Football_Team_-_2023.svg.png", cor:"#22c55e" },
    { id:"sel_ing", pais:"Inglaterra", nome:"Inglaterra", conf:"UEFA", logo:"https://flagcdn.com/w160/gb-eng.png", cor:"#e5e7eb" },
    { id:"sel_fra", pais:"França", nome:"França", conf:"UEFA", logo:"https://upload.wikimedia.org/wikipedia/pt/thumb/f/fb/France_national_football_team_seal.png/120px-France_national_football_team_seal.png", cor:"#2563eb" },
    { id:"sel_ger", pais:"Alemanha", nome:"Alemanha", conf:"UEFA", logo:"https://upload.wikimedia.org/wikipedia/pt/thumb/a/a9/DFBEagle.png/250px-DFBEagle.png", cor:"#f3f4f6" },
    { id:"sel_hol", pais:"Holanda", nome:"Holanda", conf:"UEFA", logo:"https://imgs.search.brave.com/Ej1gNLV-1gckEH19PNO0q6UZDNGV1CHbSviX_7xjvP4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvZW4vdGh1bWIv/Ny83OC9OZXRoZXJs/YW5kc19uYXRpb25h/bF9mb290YmFsbF90/ZWFtX2xvZ28uc3Zn/LzI1MHB4LU5ldGhl/cmxhbmRzX25hdGlv/bmFsX2Zvb3RiYWxs/X3RlYW1fbG9nby5z/dmcucG5n", cor:"#fb923c" },
    { id:"sel_bel", pais:"Belgica", nome:"Bélgica", conf:"UEFA", logo:"https://upload.wikimedia.org/wikipedia/pt/thumb/b/b0/Royal_Belgian_FA_logo_2019.png/120px-Royal_Belgian_FA_logo_2019.png", cor:"#facc15" },
    { id:"sel_tur", pais:"Turquia", nome:"Turquia", conf:"UEFA", logo:"https://flagcdn.com/w160/tr.png", cor:"#ef4444" },
    { id:"sel_cro", pais:"Croacia", nome:"Croácia", conf:"UEFA", logo:"https://flagcdn.com/w160/hr.png", cor:"#ef4444" },
    { id:"sel_sui", pais:"Suica", nome:"Suíça", conf:"UEFA", logo:"https://flagcdn.com/w160/ch.png", cor:"#ef4444" },
    { id:"sel_aut", pais:"Austria", nome:"Áustria", conf:"UEFA", logo:"https://flagcdn.com/w160/at.png", cor:"#ef4444" },
    { id:"sel_pol", pais:"Polonia", nome:"Polônia", conf:"UEFA", logo:"https://flagcdn.com/w160/pl.png", cor:"#ef4444" },
    { id:"sel_swe", pais:"Suecia", nome:"Suécia", conf:"UEFA", logo:"https://flagcdn.com/w160/se.png", cor:"#facc15" },
    { id:"sel_nor", pais:"Noruega", nome:"Noruega", conf:"UEFA", logo:"https://flagcdn.com/w160/no.png", cor:"#ef4444" },
    { id:"sel_den", pais:"Dinamarca", nome:"Dinamarca", conf:"UEFA", logo:"https://flagcdn.com/w160/dk.png", cor:"#ef4444" },
    { id:"sel_srb", pais:"Servia", nome:"Sérvia", conf:"UEFA", logo:"https://flagcdn.com/w160/rs.png", cor:"#ef4444" },
    { id:"sel_ukr", pais:"Ucrania", nome:"Ucrânia", conf:"UEFA", logo:"https://flagcdn.com/w160/ua.png", cor:"#facc15" },
    { id:"sel_usa", pais:"Estados Unidos", nome:"Estados Unidos", conf:"CONCACAF", logo:"https://flagcdn.com/w160/us.png", cor:"#60a5fa" },
    { id:"sel_mex", pais:"Mexico", nome:"México", conf:"CONCACAF", logo:"https://flagcdn.com/w160/mx.png", cor:"#22c55e" },
    { id:"sel_crc", pais:"Costa Rica", nome:"Costa Rica", conf:"CONCACAF", logo:"https://flagcdn.com/w160/cr.png", cor:"#ef4444" },
    { id:"sel_can", pais:"Canada", nome:"Canadá", conf:"CONCACAF", logo:"https://flagcdn.com/w160/ca.png", cor:"#ef4444" },
    { id:"sel_jam", pais:"Jamaica", nome:"Jamaica", conf:"CONCACAF", logo:"https://flagcdn.com/w160/jm.png", cor:"#facc15" },
    { id:"sel_sen", pais:"Senegal", nome:"Senegal", conf:"CAF", logo:"https://flagcdn.com/w160/sn.png", cor:"#22c55e" },
    { id:"sel_mar", pais:"Marrocos", nome:"Marrocos", conf:"CAF", logo:"https://flagcdn.com/w160/ma.png", cor:"#ef4444" },
    { id:"sel_egy", pais:"Egito", nome:"Egito", conf:"CAF", logo:"https://flagcdn.com/w160/eg.png", cor:"#ef4444" },
    { id:"sel_nga", pais:"Nigeria", nome:"Nigéria", conf:"CAF", logo:"https://upload.wikimedia.org/wikipedia/pt/thumb/b/be/NigeriaFA.png/250px-NigeriaFA.png", cor:"#22c55e" },
    { id:"sel_cmr", pais:"Camaroes", nome:"Camarões", conf:"CAF", logo:"https://flagcdn.com/w160/cm.png", cor:"#facc15" },
    { id:"sel_gha", pais:"Gana", nome:"Gana", conf:"CAF", logo:"https://flagcdn.com/w160/gh.png", cor:"#facc15" },
    { id:"sel_alg", pais:"Argelia", nome:"Argélia", conf:"CAF", logo:"https://flagcdn.com/w160/dz.png", cor:"#22c55e" },
    { id:"sel_jap", pais:"Japao", nome:"Japão", conf:"AFC", logo:"https://flagcdn.com/w160/jp.png", cor:"#f9fafb" },
    { id:"sel_kor", pais:"Coreia do Sul", nome:"Coreia do Sul", conf:"AFC", logo:"https://flagcdn.com/w160/kr.png", cor:"#f9fafb" },
    { id:"sel_aus", pais:"Australia", nome:"Austrália", conf:"AFC", logo:"https://flagcdn.com/w160/au.png", cor:"#facc15" },
    { id:"sel_ksa", pais:"Arabia Saudita", nome:"Arábia Saudita", conf:"AFC", logo:"https://flagcdn.com/w160/sa.png", cor:"#22c55e" },
    { id:"sel_irn", pais:"Ira", nome:"Irã", conf:"AFC", logo:"https://flagcdn.com/w160/ir.png", cor:"#22c55e" },
    { id:"sel_qat", pais:"Catar", nome:"Catar", conf:"AFC", logo:"https://flagcdn.com/w160/qa.png", cor:"#ef4444" },
    { id:"sel_costmf", pais:"Costa do Marfim", nome:"Costa do Marfim", conf:"CAF", logo:"https://upload.wikimedia.org/wikipedia/pt/a/a1/F%C3%A9d%C3%A9ration_Ivorienne_de_Football.png?_=20151125183758", cor:"#ef4444" },
    { id:"sel_chn", pais:"China", nome:"China", conf:"AFC", logo:"https://flagcdn.com/w160/cn.png", cor:"#ef4444" },
    { id:"sel_irq", pais:"Iraque", nome:"Iraque", conf:"AFC", logo:"https://flagcdn.com/w160/iq.png", cor:"#22c55e" },
    { id:"sel_uae", pais:"Emirados Arabes Unidos", nome:"Emirados Árabes Unidos", conf:"AFC", logo:"https://flagcdn.com/w160/ae.png", cor:"#ef4444" },
    { id:"sel_ind", pais:"India", nome:"Índia", conf:"AFC", logo:"https://flagcdn.com/w160/in.png", cor:"#f59e0b" },
    { id:"sel_tha", pais:"Tailandia", nome:"Tailândia", conf:"AFC", logo:"https://flagcdn.com/w160/th.png", cor:"#2563eb" },
    { id:"sel_idn", pais:"Indonesia", nome:"Indonésia", conf:"AFC", logo:"https://flagcdn.com/w160/id.png", cor:"#ef4444" },
    { id:"sel_nzl", pais:"Nova Zelandia", nome:"Nova Zelândia", conf:"OFC", logo:"https://flagcdn.com/w160/nz.png", cor:"#111827" },
    // 🌊 OCEANIA (OFC) — as demais seleções da confederação, além da Nova
    // Zelândia que já existia.
    { id:"sel_fij", pais:"Fiji", nome:"Fiji", conf:"OFC", logo:"https://flagcdn.com/w160/fj.png", cor:"#60a5fa" },
    { id:"sel_png", pais:"Papua Nova Guine", nome:"Papua Nova Guiné", conf:"OFC", logo:"https://flagcdn.com/w160/pg.png", cor:"#ef4444" },
    { id:"sel_sol", pais:"Ilhas Salomao", nome:"Ilhas Salomão", conf:"OFC", logo:"https://flagcdn.com/w160/sb.png", cor:"#22c55e" },
    { id:"sel_tah", pais:"Taiti", nome:"Taiti", conf:"OFC", logo:"https://flagcdn.com/w160/pf.png", cor:"#ef4444" },
    { id:"sel_nca", pais:"Nova Caledonia", nome:"Nova Caledônia", conf:"OFC", logo:"https://flagcdn.com/w160/nc.png", cor:"#60a5fa" },
    { id:"sel_van", pais:"Vanuatu", nome:"Vanuatu", conf:"OFC", logo:"https://flagcdn.com/w160/vu.png", cor:"#22c55e" },
    { id:"sel_tun", pais:"Tunisia", nome:"Tunísia", conf:"CAF", logo:"https://flagcdn.com/w160/tn.png", cor:"#ef4444" },
    { id:"sel_rsa", pais:"Africa do Sul", nome:"África do Sul", conf:"CAF", logo:"https://flagcdn.com/w160/za.png", cor:"#22c55e" },
    { id:"sel_eth", pais:"Etiopia", nome:"Etiópia", conf:"CAF", logo:"https://flagcdn.com/w160/et.png", cor:"#22c55e" },
    { id:"sel_ken", pais:"Quenia", nome:"Quênia", conf:"CAF", logo:"https://flagcdn.com/w160/ke.png", cor:"#111827" },
    { id:"sel_pan", pais:"Panama", nome:"Panamá", conf:"CONCACAF", logo:"https://flagcdn.com/w160/pa.png", cor:"#ef4444" },
    { id:"sel_hon", pais:"Honduras", nome:"Honduras", conf:"CONCACAF", logo:"https://flagcdn.com/w160/hn.png", cor:"#2563eb" },
    { id:"sel_slv", pais:"El Salvador", nome:"El Salvador", conf:"CONCACAF", logo:"https://flagcdn.com/w160/sv.png", cor:"#2563eb" },
    { id:"sel_cze", pais:"Republica Checa", nome:"República Checa", conf:"UEFA", logo:"https://flagcdn.com/w160/cz.png", cor:"#2563eb" },
    { id:"sel_fin", pais:"Finlandia", nome:"Finlândia", conf:"UEFA", logo:"https://flagcdn.com/w160/fi.png", cor:"#2563eb" },
    { id:"sel_gre", pais:"Grecia", nome:"Grécia", conf:"UEFA", logo:"https://flagcdn.com/w160/gr.png", cor:"#2563eb" },
    { id:"sel_rus", pais:"Russia", nome:"Rússia", conf:"UEFA", logo:"https://flagcdn.com/w160/ru.png", cor:"#2563eb" },
    { id:"sel_sco", pais:"Escocia", nome:"Escócia", conf:"UEFA", logo:"https://flagcdn.com/w160/gb-sct.png", cor:"#2563eb" },
    { id:"sel_irl", pais:"Irlanda", nome:"Irlanda", conf:"UEFA", logo:"https://flagcdn.com/w160/ie.png", cor:"#22c55e" },
];
const COMPETICOES_SELECOES = [
    { id:"amistoso", nome:"Amistosos Internacionais", conf:"GLOBAL", ciclo:"Data FIFA", jogos:1 },
    { id:"eliminatorias_uefa", nome:"Eliminatórias UEFA (Copa)", conf:"UEFA", ciclo:"regular", jogos:10 },
    { id:"eliminatorias_conmebol", nome:"Eliminatórias CONMEBOL", conf:"CONMEBOL", ciclo:"regular", jogos:18 },
    { id:"eliminatorias_concacaf", nome:"Eliminatórias CONCACAF", conf:"CONCACAF", ciclo:"regular", jogos:6 },
    { id:"eliminatorias_caf", nome:"Eliminatórias CAF", conf:"CAF", ciclo:"regular", jogos:6 },
    { id:"eliminatorias_afc", nome:"Eliminatórias AFC", conf:"AFC", ciclo:"regular", jogos:6 },
    { id:"eliminatorias_ofc", nome:"Eliminatórias OFC", conf:"OFC", ciclo:"regular", jogos:10 },
    { id:"eliminatorias_wc", nome:"Eliminatórias da Copa do Mundo", conf:"GLOBAL", ciclo:"regular", jogos:2 },
    { id:"copa_mundo", nome:"Copa do Mundo", conf:"GLOBAL", ciclo:"mundial", jogos:7 },
    { id:"olimpiadas", nome:"Olimpíadas (Sub-23)", conf:"GLOBAL", ciclo:"olimpico", jogos:6, sub23:true },
    { id:"mundial_sub17", nome:"Mundial Sub-17", conf:"GLOBAL", ciclo:"base", jogos:6, sub17:true },
    { id:"mundial_sub21", nome:"Mundial Sub-21", conf:"GLOBAL", ciclo:"base", jogos:6, sub21:true },
    { id:"euro", nome:"Eurocopa", conf:"UEFA", ciclo:"continental", jogos:7 },
    { id:"copa_america", nome:"Copa América", conf:"CONMEBOL", ciclo:"continental", jogos:6 },
    { id:"gold_cup", nome:"Gold Cup", conf:"CONCACAF", ciclo:"continental", jogos:5 },
    { id:"copa_africa", nome:"Copa Africana de Nações", conf:"CAF", ciclo:"continental", jogos:5 },
    { id:"copa_asia", nome:"Copa da Ásia", conf:"AFC", ciclo:"continental", jogos:5 },
    { id:"oceania_cup", nome:"Copa das Nações da Oceania", conf:"OFC", ciclo:"continental", jogos:4 },
    { id:"euro_qualy", nome:"Eliminatórias da Eurocopa", conf:"UEFA", ciclo:"regular", jogos:8 },
    { id:"nations_a", nome:"Nations League — Divisão A", conf:"UEFA", ciclo:"nations", jogos:6, div:"A" },
    { id:"nations_b", nome:"Nations League — Divisão B", conf:"UEFA", ciclo:"nations", jogos:6, div:"B" },
    { id:"nations_c", nome:"Nations League — Divisão C", conf:"UEFA", ciclo:"nations", jogos:6, div:"C" },
    { id:"nations_d", nome:"Nations League — Divisão D", conf:"UEFA", ciclo:"nations", jogos:4, div:"D" }
];

// ==========================================
// 🧒 SELEÇÕES DE BASE (Sub-17 e Sub-21)
// ==========================================
// Lista separada da lista de seleções principais (COMPETICOES_SELECOES).
// idadeMax define o limite de idade para ser convocável nesta competição —
// aplicado em gerarConvocacaoSelecaoBase().
const COMPETICOES_SELECOES_BASE = [
    { id:"mundial_sub17", nome:"Mundial Sub-17", conf:"GLOBAL", ciclo:"base", jogos:5, idadeMax:17 },
    { id:"mundial_sub21", nome:"Mundial Sub-21", conf:"GLOBAL", ciclo:"base", jogos:5, idadeMax:21 }
];

// Descobre se há um torneio de BASE (Sub-17/Sub-21) ativo para a seleção do
// jogador nesta janela — completamente independente da seleção principal,
// para que um jogador que não tem nível para a seleção adulta ainda possa
// disputar estes torneios de base normalmente.
function obterCompeticaoSelecaoBase(ano = anoAtual, rodada = rodadaAtual) {
    const slotAtual = Math.floor(obterSlotCalendarioAtual());
    const janelaFinalTemporada = slotAtual >= 47; // Ajustado para calendário expandido (60 slots)
    if (ano % 2 === 1 && janelaFinalTemporada) return COMPETICOES_SELECOES_BASE.find(c => c.id === "mundial_sub17");
    if (ano % 2 === 0 && ano % 4 !== 2 && ano % 4 !== 0 && janelaFinalTemporada) return COMPETICOES_SELECOES_BASE.find(c => c.id === "mundial_sub21");
    return null;
}

// ==========================================
// 🔍 FUNÇÕES DE APOIO E UTILIDADES
// ==========================================
function normalizarTexto(texto) { return texto ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : ""; }

function obterPaisCompeticaoId(compId) {
    const partes = String(compId || "").split("_");
    if (partes[0] === "copa" || partes[0] === "supercopa" || partes[0] === "carabao") return partes[1] || partes[0];
    // 🛡️ FIX: campeonatos estaduais (estadual_sp, estadual_rj, ...) são todos
    // brasileiros — sem isto, o jogo tentava (erradamente) tratá-los como um
    // "país" chamado "estadual", quebrando o calendário e o agrupamento por país.
    if (partes[0] === "estadual") return "br";
    // 🛡️ FIX: competições continentais (afc_cla, conmebol_lib, uefa_cl, etc.)
    // retornam o prefixo da conferação
    if (partes[0] === "afc" || partes[0] === "conmebol" || partes[0] === "uefa" || partes[0] === "concacaf" || partes[0] === "caf") return partes[0];
    return partes[0];
}

function obterUrlImagem(entidade, tipo) {
    if (!entidade) return "";
    if (tipo === 'trofeu') {
        if(entidade.includes("Bola de Ouro") || entidade.includes("Melhor do Mundo")) return "https://i.ibb.co/4Z0zvRz7/d9404dec-5649-4fd5-95e9-2e9be21bb805.png";
        if(entidade.includes("Golden Boy")) return "https://i.ibb.co/b5Sd7xcQ/9643960f-eb44-407e-bbaf-bf60218a4c6b.png";
        if(entidade.includes("Chuteira de Ouro")) return "https://i.ibb.co/ch87vZpv/41f6515d-fe2a-4628-9d9d-15fa1a8fe84f.png";
        if(entidade.includes("Assist") || entidade.includes("Maestro") || entidade.includes("Rei das Assistencias")) return "https://cdn-icons-png.flaticon.com/512/1004/1004314.png";
        if(entidade.includes("Luva de Ouro")) return "https://i.ibb.co/Kj8b22RW/3c80b476-f71c-4436-90f5-a0e16a48e56d.png";
        if(entidade.includes("UEFA Best Player")) return "https://tmssl.akamaized.net//images/titel/medium/152.png?lm=1396275124";
        if(entidade.includes("FIFA The Best")) return "https://tmssl.akamaized.net//images/titel/medium/195.png?lm=1575286754";
        if(entidade.includes("Melhor 11 do Mundo")) return "https://tmssl.akamaized.net//images/titel/medium/195.png?lm=1575286754";

        if(entidade.includes("Champions League") || entidade.includes("uefa_cl")) return "https://i.ibb.co/4nKhHSYv/5491af57-2610-4491-8266-979218ed4fb0.png";
        if(entidade.includes("Europa League") || entidade.includes("uefa_el")) return "https://i.ibb.co/bRsmDFBX/bdf3a3e3-0934-46d3-b907-7677c066f624.png";
        if(entidade.includes("Conference League") || entidade.includes("uefa_col")) return "https://i.ibb.co/B2CLnqDj/a86536a9-4c52-40f5-a1af-3615694c2d46.png";

        if(entidade.includes("Copa do Mundo") || entidade.includes("sel_copa_mundo")) return "https://i.ibb.co/8ngb5Csz/031efcc4-f6b7-422f-8e52-9d252579b9b2.png";
        if(entidade.includes("Eurocopa") || entidade.includes("sel_euro") || entidade.includes("euro")) return "https://tmssl.akamaized.net//images/erfolge/medium/102.png?lm=1520606997";
        if(entidade.includes("Copa América") || entidade.includes("sel_copa_america")) return "https://tmssl.akamaized.net//images/erfolge/medium/106.png?lm=1461847499";
        if(entidade.includes("Nations League") || entidade.includes("sel_nations_a")) return "https://tmssl.akamaized.net//images/erfolge/medium/601.png?lm=1653914395";
        if(entidade.includes("Gold Cup") || entidade.includes("concacaf_gold_cup"))  return "https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/2025_CONCACAF_Gold_Cup_logo.svg/512px-2025_CONCACAF_Gold_Cup_logo.svg.png";
        if(entidade.includes("Copa Africana") || entidade.includes("afcon")) return "https://upload.wikimedia.org/wikipedia/en/thumb/3/31/Africa_Cup_of_Nations_logo.svg/512px-Africa_Cup_of_Nations_logo.svg.png";
        if(entidade.includes("Copa da Ásia") || entidade.includes("asian_cup")) return "https://upload.wikimedia.org/wikipedia/en/thumb/0/08/AFC_Asian_Cup_logo.svg/512px-AFC_Asian_Cup_logo.svg.png";
        if(entidade.includes("Oceania Cup") || entidade.includes("ofc_nations_cup") || entidade.includes("Copa das Nações da Oceania") || entidade.includes("oceania_cup")) return "https://tmssl.akamaized.net//images/erfolge/medium/108.png?lm=1461847499";

        if(entidade.includes("Mundial Sub17") || entidade.includes("mundial_sub17")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Trophy_U17.png/250px-Trophy_U17.png";
        if(entidade.includes("Mundial Sub21") || entidade.includes("mundial_sub21")) return "https://tmssl.akamaized.net//images/erfolge/medium/158.png?lm=1657627706";


        if(entidade.includes("Libertadores") || entidade.includes("conmebol_lib")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/328-3287452_copa-libertadores-primer-trofeo-hd-png-download.png/250px-328-3287452_copa-libertadores-primer-trofeo-hd-png-download.png";
        if(entidade.includes("Sulamericana") || entidade.includes("conmebol_sul")) return "https://tmssl.akamaized.net//images/erfolge/medium/154.png?lm=1520606999";

            if(entidade.includes("afc_cla2") || entidade.includes("AFC Champions 2")) return "https://i.ibb.co/0ynKNm0g/image.png";
            if(entidade.includes("afc_cla") || entidade.includes("AFC Champions")) return "https://r2.thesportsdb.com/images/media/league/trophy/5dzvma1747117869.png/medium";
            
        if(entidade.includes("concacaf_clc") || entidade.includes("Concacaf Champions Cup")) return "https://tmssl.akamaized.net//images/erfolge/medium/306.png?lm=1654760845";

        if(entidade.includes("intercontinental_cup") || entidade.includes("Intercontinental FIFA")) return "https://tmssl.akamaized.net//images/erfolge/medium/1100.png?lm=1734608335";
        if(entidade.includes("uefa_supercup") || entidade.includes("Supercopa da UEFA")) return "https://tmssl.akamaized.net//images/erfolge/medium/354.png?lm=1780326884";
        if(entidade.includes("conmebol_recopa") || entidade.includes("Recopa Sudamericana")) return "https://tmssl.akamaized.net//images/erfolge/medium/338.png?lm=1461847499";
    
    
    
       
        //AMERICA SUL
        if(entidade.includes("Brasileirão Série A") || entidade.includes("br_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/262.png?lm=1466586549";
        if(entidade.includes("Brasileirão Série B") || entidade.includes("br_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/462.png?lm=1466588515";
        if(entidade.includes("Brasileirão Série C") || entidade.includes("br_3")) return "https://i.ibb.co/1J8Mxb0y/ec693812-f11f-4a50-9424-4a319cfb05c6.png";
        if(entidade.includes("Brasileirão Série D") || entidade.includes("br_4")) return "https://i.ibb.co/LXC52Z2K/445d2bf5-5565-4bfa-b870-d8f08a0d7005.png";
        if(entidade.includes("Copa do Brasil") || entidade.includes("copa_br")) return "https://tmssl.akamaized.net//images/erfolge/medium/263.png?lm=1461847499";
        if(entidade.includes("Supercopa do Brasil") || entidade.includes("supercopa_br")) return "https://tmssl.akamaized.net//images/erfolge/medium/648.png?lm=1654593971";
        if (entidade.includes("Campeonato Paulista") || entidade.includes("estadual_sp")) return "https://tmssl.akamaized.net//images/erfolge/medium/1107.png?lm=1739982163";
        if (entidade.includes("Campeonato Carioca") || entidade.includes("estadual_rj")) return "https://tmssl.akamaized.net//images/erfolge/medium/1108.png?lm=1739982183";
        if (entidade.includes("Campeonato Mineiro") || entidade.includes("estadual_mg")) return "https://tmssl.akamaized.net/images/erfolge/medium/1112.png";
        if (entidade.includes("Campeonato Gaúcho") || entidade.includes("estadual_rs")) return "https://tmssl.akamaized.net/images/erfolge/medium/1110.png";
        if (entidade.includes("Campeonato Paranaense") || entidade.includes("estadual_pr")) return "https://i.ibb.co/m5tCHN5v/0fcd6b58-a07f-44c9-9ac1-ec52b308a46d.png";
        if (entidade.includes("Campeonato Catarinense") || entidade.includes("estadual_sc")) return "https://i.ibb.co/wZzFgB4r/image.png";
        if (entidade.includes("Campeonato Goiano") || entidade.includes("estadual_go")) return "https://i.ibb.co/LXhYc3DP/bd935139-1fe4-4b76-9020-c3b7e1489b41.png";
        if (entidade.includes("Campeonato Pernambucano") || entidade.includes("estadual_pe")) return "https://i.ibb.co/m5tCHN5v/0fcd6b58-a07f-44c9-9ac1-ec52b308a46d.png";
        if (entidade.includes("Campeonato Baiano") || entidade.includes("estadual_ba")) return "https://tmssl.akamaized.net//images/erfolge/medium/1113.png?lm=1739982048";
        if (entidade.includes("Campeonato Cearense") || entidade.includes("estadual_ce")) return "https://i.ibb.co/JFwg8KcQ/image.png";

        if (entidade.includes("Liga Profesional Argentina") || entidade.includes("arg_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/297.png?lm=1704400701";
        if (entidade.includes("Copa Argentina") || entidade.includes("copa_arg")) return "https://tmssl.akamaized.net//images/erfolge/medium/843.png?lm=1647532051";
        if (entidade.includes("Supercopa Argentina") || entidade.includes("supercopa_arg")) return "https://tmssl.akamaized.net//images/erfolge/medium/970.png?lm=1686235805";

        if (entidade == ("Primera División Uruguaya") || entidade.includes("uy_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/251.png?lm=1767143424";


        
        //EUROPA
        if(entidade == ("Premier League") || entidade.includes("eng_1")) return "https://i.ibb.co/cSZyLnqP/bff12c7f-4c7a-4313-a4d8-7d67d1e68cb0.png";
        if(entidade.includes("Championship") || entidade.includes("eng_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/869.png?lm=1646225519";
        if(entidade.includes("Carabao Cup") || entidade.includes("carabao_eng")) return "https://tmssl.akamaized.net//images/erfolge/medium/47.png?lm=1520606999";
        if(entidade.includes("FA Cup") || entidade.includes("copa_eng")) return "https://tmssl.akamaized.net//images/erfolge/medium/29.png?lm=1520606999";
        if(entidade.includes("Community Shield") || entidade.includes("supercopa_eng")) return "https://tmssl.akamaized.net//images/erfolge/medium/316.png?lm=1520606999";

        if(entidade.includes("Bundesliga") || entidade.includes("ger_1")) return "https://tmssl.akamaized.net//images/erfolge/header/10.png?lm=1520606996";
        if(entidade.includes("Bundesliga 2") || entidade.includes("ger_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/378.png?lm=1461847499";
        if(entidade.includes("DFB-Pokal") || entidade.includes("copa_ger")) return "https://tmssl.akamaized.net//images/erfolge/medium/27.png?lm=1520606999";
        if(entidade.includes("DFL-Supercup") || entidade.includes("supercopa_ge")) return "https://tmssl.akamaized.net//images/erfolge/medium/312.png?lm=1520606999";

        if(entidade == ("La Liga") || entidade.includes("esp_1")) return "https://i.ibb.co/v6QhJQFn/bfa85829-8d60-4816-a4c8-453fba80dd94.png";
        if (entidade == ("La Liga 2") || entidade.includes("esp_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/878.png?lm=1647419746";
        if(entidade.includes("Copa del Rey") || entidade.includes("copa_esp")) return "https://tmssl.akamaized.net//images/erfolge/medium/94.png?lm=1520606999";
        if(entidade.includes("Supercopa da Espanha") || entidade.includes("supercopa_esp")) return "https://tmssl.akamaized.net//images/erfolge/medium/93.png?lm=1520606999";

        if(entidade.includes("Serie A") || entidade.includes("ita_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/13.png?lm=1520606997";
        if (entidade.includes("Serie B") || entidade.includes("ita_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/436.png?lm=1651745299";
        if(entidade.includes("Coppa Italia") || entidade.includes("copa_ita")) return "https://tmssl.akamaized.net//images/erfolge/medium/96.png?lm=1520606999";
        if(entidade.includes("Supercoppa Italiana") || entidade.includes("supercopa_ita")) return "https://tmssl.akamaized.net//images/erfolge/medium/97.png?lm=1520606999";

        if(entidade.includes("Liga Portugal") || entidade.includes("pt_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/15.png?lm=1520606999";
        if(entidade.includes("Liga Portugal 2") || entidade.includes("pt_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/458.png?lm=1511173307";
        if(entidade.includes("Taca de Portugal") || entidade.includes("copa_pt")) return "https://tmssl.akamaized.net//images/erfolge/medium/100.png?lm=1520606996";
        if(entidade.includes("Supertaca de Portugal") || entidade.includes("supercopa_pt")) return "https://tmssl.akamaized.net//images/erfolge/medium/337.png?lm=1520606999";

        if(entidade.includes("Ligue 1") || entidade.includes("fra_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/14.png?lm=1729163534";  
        if (entidade == ("Ligue 2") || entidade.includes("fra_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/981.png?lm=1734352209";
        if(entidade.includes("Coupe de France") || entidade.includes("copa_fra")) return "https://tmssl.akamaized.net//images/erfolge/medium/35.png?lm=1520606999";
        if(entidade.includes("Trophee des Champions") || entidade.includes("supercopa_fra")) return "https://tmssl.akamaized.net//images/erfolge/medium/321.png?lm=1704485193";

        if(entidade.includes("Eredivise") || entidade.includes("nl_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/16.png?lm=1520606999";
        if(entidade.includes("KNVB Cup") || entidade.includes("copa_nl")) return "https://tmssl.akamaized.net//images/erfolge/medium/151.png?lm=1520606999";
        if(entidade.includes("Johan Cruyff Shield") || entidade.includes("supercopa_nl")) return "https://tmssl.akamaized.net//images/erfolge/medium/288.png?lm=1511173147";

        if(entidade.includes("Süper Lig") || entidade.includes("tr_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/20.png?lm=1780043166";
         if (entidade.includes("1.Lig") || entidade.includes("tr_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/947.png?lm=1780043224";
        if(entidade.includes("Turkish Cup") || entidade.includes("copa_tr")) return "https://tmssl.akamaized.net//images/erfolge/medium/148.png?lm=1780049586";
        if(entidade.includes("Turkish Super Cup") || entidade.includes("Süpercopa_tr")) return "https://tmssl.akamaized.net//images/erfolge/medium/149.png?lm=1780055873";

        if(entidade.includes("Eliteserien") || entidade.includes("nor_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/295.png?lm=1461847499";
        if (entidade.includes("Taça NM") || entidade.includes("copa_nor")) return "https://tmssl.akamaized.net//images/erfolge/medium/294.png?lm=1461847499";
        if (entidade.includes("Mesterfinalen") || entidade.includes("supercopa_nor")) return "";

        if (entidade.includes("Jupiler Pro League") || entidade.includes("be_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/18.png?lm=1461847499";
        if (entidade.includes("Croky Cup") || entidade.includes("copa_be")) return "https://tmssl.akamaized.net//images/erfolge/medium/150.png?lm=1520606999";
        if (entidade.includes("Pro League Super Cup") || entidade.includes("supercopa_be")) return "https://tmssl.akamaized.net//images/erfolge/medium/488.png?lm=1511178751";

        if (entidade == ("Scottish Premiership") || entidade.includes("sco_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/19.png?lm=1461847499";
        if (entidade.includes("Scottish Challenge Cup") || entidade.includes("copa_sco")) return "https://tmssl.akamaized.net//images/erfolge/medium/87.png?lm=1461847499";
        if (entidade.includes("Scottish Super Cup") || entidade.includes("supercopa_sco")) return "https://tmssl.akamaized.net//images/erfolge/medium/88.png?lm=1461847499";

        if (entidade == ("Brack Super League") || entidade.includes("sui_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/23.png?lm=1655896213";
        if (entidade == ("Schweizer Cup") || entidade.includes("copa_sui")) return "https://tmssl.akamaized.net//images/erfolge/medium/99.png?lm=1520606999";
        

         //ASIA
        if(entidade.includes("Saudi Pro") || entidade.includes("ara_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/271.png?lm=1748099013";
        if(entidade.includes("Kings Cup") || entidade.includes("copa_ara")) return "https://tmssl.akamaized.net//images/erfolge/medium/456.png?lm=1626256782";
        if(entidade.includes("Saudi Super Cup") || entidade.includes("Supercopa_ara")) return "https://tmssl.akamaized.net//images/erfolge/medium/457.png?lm=1616407405";

         if(entidade.includes("Nigeria Professional Football League") || entidade.includes("nga_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/516.png?lm=1780133279";
         if (entidade ==("Ligue 1 Côte d'Ivoire") || entidade.includes("civ_1")) return "https://i.ibb.co/B592MmYZ/image.png";
  
        
         //AMERICA NORTE
        if(entidade.includes("MLS") || entidade.includes("usa_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/241.png?lm=1520606999";
        if(entidade.includes("Open Cup") || entidade.includes("copa_usa")) return "https://tmssl.akamaized.net//images/erfolge/medium/244.png?lm=1466586047";
        if(entidade.includes("Leagues Cup") || entidade.includes("Supercopa_usa")) return "https://tmssl.akamaized.net//images/erfolge/medium/604.png?lm=1606063811";

        if(entidade == ("Liga MX Apertura") || entidade.includes("mx_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/153.png?lm=1461847499";
        if(entidade == ("Copa Mexico") || entidade.includes("copa_mx")) return "https://tmssl.akamaized.net//images/erfolge/medium/392.png?lm=1654154831";
        if(entidade == ("Campeón de Campeones") || entidade.includes("supercopa_mx")) return "https://tmssl.akamaized.net//images/erfolge/medium/577.png?lm=1653896973";

    }
    let entidadex = entidade;
    if (typeof entidade === 'string') {
        if (tipo === 'jogador') { let enc = jogadoresIA.find(j => j.nome === entidade || j.id === entidade); if (enc) entidadex = enc; } 
        else if (tipo === 'clube') { let enc = clubes.find(c => c.id === entidade || c.nome === entidade); if (enc) entidadex = enc; } 
        else if (tipo === 'competicao') { let enc = competicoes.find(c => c.id === entidade); if (enc) entidadex = enc; }
        else if (tipo === 'tecnico') { let enc = (treinadoresIA || []).find(t => t.nome === entidade || t.id === entidade); if (enc) entidadex = enc; }
    }
    const urlDatabase = entidadex.foto || entidadex.logo;
    if (urlDatabase && urlDatabase.trim() !== "") return urlDatabase;

    // 👔 Técnico sem foto ainda: dispara busca assíncrona na Wikipedia (só uma
    // vez por técnico) e, enquanto isso, cai no avatar gerado logo abaixo.
    if (tipo === 'tecnico' && typeof entidadex === 'object' && entidadex.id) carregarFotoTecnico(entidadex);

    let nome = entidadex.nome || entidadex; let limpo = encodeURIComponent(nome);
    if(tipo === 'jogador') return `https://ui-avatars.com/api/?name=${limpo}&background=random&color=fff&size=150&font-size=0.4`;
    if(tipo === 'clube') return `https://ui-avatars.com/api/?name=${limpo}&background=18181b&color=00ff88&size=150&rounded=true&font-size=0.4`;
    if(tipo === 'competicao') return `https://ui-avatars.com/api/?name=${limpo}&background=facc15&color=000&size=150&rounded=true&font-size=0.4`;
    if(tipo === 'tecnico') return `https://ui-avatars.com/api/?name=${limpo}&background=27272a&color=00ff88&size=150&rounded=true&font-size=0.4&bold=true`;
    return "";
}

// 💾 Cache persistente (localStorage) das fotos de técnico já resolvidas —
// sem isto, toda vez que o jogo carregava (nova sessão/reload) todos os
// técnicos com foto ainda não vista voltavam a bater na API da Wikipedia do
// zero. Guarda tanto os acertos (URL da foto) quanto os "não achei nada"
// (null), pra nunca repetir a mesma busca falha.
const CACHE_FOTO_TECNICO_KEY = "fotosTecnicosCache_v1";
function _lerCacheFotoTecnico() {
    try { return JSON.parse(localStorage.getItem(CACHE_FOTO_TECNICO_KEY) || "{}"); } catch (e) { return {}; }
}
function _salvarCacheFotoTecnico(cache) {
    try { localStorage.setItem(CACHE_FOTO_TECNICO_KEY, JSON.stringify(cache)); } catch (e) { /* localStorage cheio ou indisponível: perde só o cache, não quebra nada */ }
}

// 🌐 Busca a foto real de um técnico na Wikipedia (API pública, com CORS
// liberado para leitura anônima) e guarda em treinador.foto para as próximas
// renderizações. Não repete a busca se já tentou antes (fotoIndisponivel) ou
// se já tem foto. Chamado internamente por obterUrlImagem — nunca precisa
// ser chamado à mão.
const _tecnicosBuscandoFoto = new Set();
async function carregarFotoTecnico(treinador) {
    if (!treinador || treinador.foto || treinador.fotoIndisponivel) return;
    if (_tecnicosBuscandoFoto.has(treinador.id)) return;
    _tecnicosBuscandoFoto.add(treinador.id);
    try {
        const titulo = (treinador.wikiNome || treinador.nome || "").trim();
        if (!titulo) { treinador.fotoIndisponivel = true; return; }

        const cache = _lerCacheFotoTecnico();
        const cacheKey = titulo.toLowerCase();
        if (cache[cacheKey] !== undefined) {
            if (cache[cacheKey]) {
                treinador.foto = cache[cacheKey];
                document.querySelectorAll(`img[data-tecnico-id="${treinador.id}"]`).forEach(img => { img.src = treinador.foto; });
            } else {
                treinador.fotoIndisponivel = true;
            }
            return;
        }

        const tituloEnc = encodeURIComponent(titulo);
        const resp = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${tituloEnc}`);
        let dados = resp.ok ? await resp.json() : null;
        if (!dados?.thumbnail?.source) {
            // Fallback para a Wikipedia em inglês quando não existe verbete em PT.
            const resp2 = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${tituloEnc}`);
            dados = resp2.ok ? await resp2.json() : null;
        }
        if (dados?.thumbnail?.source) {
            treinador.foto = dados.thumbnail.source;
            cache[cacheKey] = treinador.foto;
            _salvarCacheFotoTecnico(cache);
            // 🔄 Atualiza ao vivo qualquer <img data-tecnico-id="..."> já na tela
            // (grade de Técnicos, perfil do clube, modal do técnico) sem precisar
            // re-renderizar a view inteira.
            document.querySelectorAll(`img[data-tecnico-id="${treinador.id}"]`).forEach(img => { img.src = treinador.foto; });
        } else {
            treinador.fotoIndisponivel = true;
            cache[cacheKey] = null;
            _salvarCacheFotoTecnico(cache);
        }
    } catch (e) {
        treinador.fotoIndisponivel = true;
    } finally {
        _tecnicosBuscandoFoto.delete(treinador.id);
    }
}

function calcularValorNumerico(geral, idade) {
    let base = Math.pow(Math.max(1, geral - 40), 2.55) * 1350;
    if (idade <= 19) base *= 3.0; else if (idade <= 22) base *= 2.05; else if (idade <= 26) base *= 1.28;
    else if (idade >= 34) base *= 0.22; else if (idade >= 31) base *= 0.45; else if (idade >= 29) base *= 0.72;
    if (geral >= 92) base *= 1.9; else if (geral >= 88) base *= 1.55; else if (geral >= 84) base *= 1.22;
    return Math.floor(base);
}
function obterEstatisticasCarreira(j) {
    const hist = j?.historicoCarreira || [];
    const atual = j === jogador ? (j.estatisticasAtuais || {}) : (j.statsTemporada || {});
    return hist.reduce((acc, h) => {
        acc.jogos += h.jogos || 0; acc.gols += h.gols || 0; acc.assistencias += h.assistencias || 0;
        return acc;
    }, { jogos: atual.jogos || 0, gols: atual.gols || 0, assistencias: atual.assistencias || 0 });
}
function calcularValorMercadoJogador(j) {
    let valor = calcularValorNumerico(j.geral || 60, j.idade || 24);
    const st = j === jogador ? (j.estatisticasAtuais || {}) : (j.statsTemporada || {});
    const jogos = st.jogos || 0;
    const participacoes = (st.gols || 0) + (st.assistencias || 0);
    let fator = 1;
    if(jogos < 5) fator *= 0.72; else if(jogos < 12) fator *= 0.88;
    if(jogos >= 8) {
        const media = participacoes / jogos;
        if(media >= 0.9) fator *= 1.28; else if(media >= 0.55) fator *= 1.12; else if(media < 0.18 && (j.posicao === "Atacante" || j.posicao === "Meio-Campista")) fator *= 0.82;
    }
    if(j === jogador) {
        if(j.lesaoRodadas > 0) fator *= 0.84;
        if(j.titularidade < 42) fator *= 0.88; else if(j.titularidade > 72) fator *= 1.08;
        if((j.felicidade || 55) < 35) fator *= 0.9;
    }
    return Math.max(50000, Math.floor(valor * fator));
}

// Salário semanal "de mercado" para o jogador, com base no seu valor e na
// força/reputação do clube (real ou hipotético). Clubes de maior reputação
// pagam salários bem acima do valor de mercado "puro"; clubes pequenos
// pagam abaixo. Serve de referência para ofertas iniciais em negociações
// e como salário-base fora de qualquer negociação ativa.
function calcularSalarioSemanalJogador(clubeRef = null, jogadorRef = null) {
    const alvo = jogadorRef || jogador;
    if (!alvo) return 20000;
    const clube = clubeRef || clubes.find(c => c.id === alvo.clubeId);
    const valorMercado = alvo.valorMercadoNum || calcularValorMercadoJogador(alvo);
    let base = Math.max(8000, valorMercado * 0.019);
    const reputacao = clube?.reputacao || 65;
    // ~0.75x para clubes modestos (rep. baixa) até ~1.75x para gigantes (rep. alta)
    const fatorClube = 0.55 + (reputacao / 100) * 1.2;
    base *= fatorClube;
    // 🆕 Clubes árabes (Saudi Pro League) pagam bem acima do que a reputação
    // esportiva sugeriria — igual à realidade (Al-Hilal, Al-Nassr etc. pagando
    // salários de topo mundial mesmo sendo uma liga competitivamente mediana).
    // O "prêmio" cresce com o nível do jogador: craques (85+ de geral) são o
    // alvo dessas propostas turbinadas, não qualquer reserva.
    if (clube?.ligaId?.startsWith("ara")) {
        const nivel = alvo.geral || 65;
        base *= 1.5 + Math.max(0, nivel - 65) * 0.045;
    }
    if ((alvo.idade || 24) >= 32) base *= 0.92; // veteranos custam um pouco menos em folha
    if ((alvo.idade || 24) <= 21 && (alvo.geral || 60) >= 75) base *= 1.1; // jovens-promessa custam mais
    return Math.max(8000, Math.floor(base));
}

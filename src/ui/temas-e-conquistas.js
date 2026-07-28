function gerarJovensGenericos(qtd = 34) {
    const nomes = ["Mateus", "João", "Lucas", "Enzo", "Rafael", "Gabriel", "Pedro", "Diego", "Nico", "Luan", "André", "Thiago", "Samuel", "Bruno", "Tomás", "Hugo"];
    const sobrenomes = ["Silva", "Costa", "Ferreira", "Almeida", "Pereira", "Santos", "Oliveira", "Lima", "Gomes", "Martins", "Rocha", "Cardoso", "Ribeiro", "Mendes", "Castro", "Araujo"];
    const posicoes = ["Goleiro","Zagueiro","Lateral","Volante","Meio-Campista","Meia Ofensivo","Ponta","Atacante"];
    const nacionalidades = SELECOES.map(s => s.pais);
    const clubesBase = clubes.filter(c => c.ligaId && c.reputacao >= 58).sort(() => Math.random() - 0.5);
    let criados = 0;
    while(criados < qtd && clubesBase.length) {
        const clube = clubesBase[criados % clubesBase.length];
        const idade = 16 + Math.floor(Math.random() * 5);
        const potencialLiga = clube.reputacao >= 85 ? 70 : clube.reputacao >= 78 ? 66 : 61;
        const geral = Math.max(50, Math.min(76, potencialLiga + Math.floor(Math.random() * 11) - 5));
        const nome = `${nomes[Math.floor(Math.random()*nomes.length)]} ${sobrenomes[Math.floor(Math.random()*sobrenomes.length)]}`;
        const posicaoJovem = posicoes[Math.floor(Math.random()*posicoes.length)];
        jogadoresIA.push({
            id:`j_newgen_${anoAtual}_${criados}_${Date.now().toString(36)}`,
            nome,
            idade,
            geral,
            clubeId:clube.id,
            nacionalidade:nacionalidades[Math.floor(Math.random()*nacionalidades.length)],
            posicao:posicaoJovem,
            foto:"",
            contrato:Math.floor(Math.random()*3)+2,
            felicidade:60 + Math.floor(Math.random()*25),
            inteligencia:45 + Math.floor(Math.random()*28),
            potencial: gerarPotencialJogador(geral),
            // ⚙️ Atributos individuais desde a estreia — mesmo critério (posição + OVR) usado para todo o resto do elenco.
            ...gerarAtributosParaJogador(posicaoJovem, geral),
            statsTemporada:{ jogos:0, gols:0, assistencias:0, notas:[] },
            statsSelecao:{ jogos:0, gols:0, assistencias:0, convocacoes:0 },
            historicoCarreira:[]
        });
        criados++;
    }
    if(criados) registrarNoticia("Nova geração chega aos clubes", `${criados} jovens jogadores foram integrados às bases e elencos profissionais para renovar o mercado.`, "Base");
}

const TEMAS_COMPETICOES = {
    hub: { cor: "#00ff88", img: "" },
    eng_1: { cor: "#00D8FF", img: "https://i.ibb.co/5h5QGVXb/Texture-Theme-EPL.png" },
    carabao_eng: { cor: "#00A651", img: "https://i.ibb.co/6J0nTwZy/fab2128c-e881-42c9-8881-579531cfb3f6.png" },
    copa_eng: { cor: "#E53935", img: "https://i.ibb.co/XrChpJRJ/896acbef-567b-4032-8b47-95da84007ff8.png" },
    eng_2: { cor: "#FF6F00", img: "https://i.ibb.co/FbYZqHZK/240a1554-0b80-40a4-b171-8abbbb8717f0.png" },
    supercopa_eng: { cor: "#FFD700", img: "https://i.ibb.co/xSP6ykD6/image.png" },
    esp: { cor: "#FF4D4D", img: "https://i.ibb.co/8nhCpHTN/Texture-Theme-La-Liga.png" },
    ita: { cor: "#0099FF", img: "https://i.ibb.co/Cpmcn1Mp/d3565473-9dd0-4955-928b-64e68b18b129.png" },
    ger_1: { cor: "#E30613", img: "https://i.ibb.co/8Wn88Pg/Texture-Theme-Bundesliga.png" },
    ger_2: { cor: "#E30613", img: "https://i.ibb.co/wfQS1Jd/044964fd-a840-443e-8888-af6f8df56dfb.png" },
    fra_1: { cor: "#0057B8", img: "https://i.ibb.co/Q7nv3KTN/Texture-Theme-Ligue-One.png" },
    fra_2: { cor: "#0057B8", img: "https://i.ibb.co/v48yM4tz/image.png" },
    pt_1: { cor: "#003B8E", img: "https://i.ibb.co/sJ2Y60xC/e095fab0-74a4-43cc-9f84-188c30c3547b.png" },
    pt_2: { cor: "#5A6F8F", img: "https://i.ibb.co/5hFBYD98/2fd0a86e-0ce0-43f6-91b3-c8334e4cffdd.png" },
    copa_pt: { cor: "#00843D", img: "https://i.ibb.co/gFHDSPKs/19c8ab77-cb3a-4bad-ae89-b852bbedd14a.png" },
    supercopa_pt: { cor: "#C9A227", img: "https://i.ibb.co/v4d4w9GT/5ff59a0c-c14d-4be1-9a56-d108ee8f8bb6.png" },
    nl_1: { cor: "#FF6A00", img: "https://i.ibb.co/qLHVMYR5/image.png" },
    copa_nl: { cor: "#0066CC", img: "https://i.ibb.co/N6JLPQRb/image.png" },
    supercopa_nl: { cor: "#FFD54F", img: "https://i.ibb.co/S4cydYMY/image.png" },
    tr_1: { cor: "#D32F2F", img: "https://i.ibb.co/b53LXDvK/image.png" },
    copa_tr: { cor: "#C62828", img: "https://i.ibb.co/b53LXDvK/image.png" },
    nor_1: { cor: "#0D47A1", img: "https://i.ibb.co/ZR91SHc7/8ee30dbe-49d9-421f-9c5f-a538b9339374.png" },
    sco_1: { cor: "#4B0082", img: "https://i.ibb.co/RJNRCCX/71d22928-10b9-486d-857f-23991e4665f5.png" },
    br_1: { cor: "#FFD700", img: "https://i.ibb.co/pjvQT62J/0c3b5a89-2f6d-48fb-b787-86c1e2e3f0ba.png" },
    br_2: { cor: "#1E88E5", img: "https://i.ibb.co/DHxF4wF8/402a4527-80cb-47d1-8837-d224b722ceaa.png" },
    br_3: { cor: "#2E7D32", img: "https://i.ibb.co/NdD2BHBm/b7017d32-e1cc-489c-be49-c3c52d7285be.png" },
    br_4: { cor: "#2E7D32", img: "https://i.ibb.co/xtBMDR8k/5a320c73-d40c-462e-87ec-1d2efdfef13e.png" },
    copa_br: { cor: "#009739", img: "https://i.ibb.co/DXDc6GD/65ee9eff-8305-4340-af28-8d5e0435cbca.png" },
    supercopa_br: { cor: "#FFC107", img: "https://i.ibb.co/07cm20F/c0b21d32-8b09-443b-a972-2c427b4da9c4.png" },
    arg: { cor: "#7dd3fc", img: "https://i.pinimg.com/1200x/9f/94/1b/9f941bf6562c668c1d0cfec152b43ec1.jpg" },
    usa: { cor: "#60a5fa", img: "https://i.ibb.co/p631bhjv/Texture-Theme-MLS.png" },
    ara: { cor: "#045712", img: "https://i.ibb.co/XkywSZ5T/8b754c3d-8759-47ac-9bc7-1921110aac8e.png" },
    mx: { cor: "#22c55e", img: "https://i.ibb.co/VYfvFMQN/7703dbb3-294f-44de-b9ef-e451c4c091ca.png" },
    uefa_cl: { cor: "#93c5fd", img: "https://i.ibb.co/MxG3hvhK/Texture-Theme-UCL.png" },
    uefa_el: { cor: "#fb923c", img: "https://i.ibb.co/Wvr2Z0QH/Texture-Theme-Euro-League.png" },
    uefa_col: { cor: "#22c55e", img: "https://i.ibb.co/Rx14dxQ/Texture-Theme-UECL.png" },
    uefa_supercup: { cor: "#93c5fd", img: "https://i.pinimg.com/736x/63/0a/39/630a39bb6e12fe5fb897b45964f5ac71.jpg" },
    conmebol_lib: { cor: "#f59e0b", img: "https://i.ibb.co/8LCFn0Df/6a6deb85-920a-4b42-8beb-2bf148aef7e7.png" },
    conmebol_sul: { cor: "#22c55e", img: "https://i.ibb.co/Fk6C2qTQ/Texture-Theme-Sudamericana.png" },
    concacaf_clc: { cor: "#22c55e", img: "https://i.ibb.co/1CppSPw/32963585-348c-4cb2-8ccc-abcd9a6cf321.png" },
    copa_mundo: { cor: "#facc15", img: "https://wallpapercave.com/wp/wp16426287.webp" },
    euro: { cor: "#3b82f6", img: "https://static.vecteezy.com/system/resources/thumbnails/041/933/077/small_2x/background-of-euro-2024-in-germany-with-the-tournament-logo-free-vector.jpg" },
    copa_america: { cor: "#22c55e", img: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000&auto=format&fit=crop" },
    amistoso: { cor: "#a7f3d0", img: "https://i.ibb.co/MxX9NRZM/b2268041-c169-4da2-80e1-1eb51ccc2802.png" }
};

function obterTemaCompeticao(compId) {
    const id = String(compId || "hub");
    const prefix = obterPaisCompeticaoId(id);
    return TEMAS_COMPETICOES[id] || TEMAS_COMPETICOES[prefix] || (id.includes("uefa") ? TEMAS_COMPETICOES.uefa_cl : null) || (id.includes("conmebol") ? TEMAS_COMPETICOES.conmebol_lib : null) || TEMAS_COMPETICOES.hub;
}

// Aplica o tema GLOBAL (fundo da página + cor principal). Deve refletir sempre
// a competição que o jogador realmente está a disputar (hub, próximo jogo, etc.)
window.aplicarTemaCompeticao = function(compId) {
    const id = String(compId || "hub");
    const tema = obterTemaCompeticao(id);

    document.documentElement.style.setProperty("--theme-primary", tema.cor);
    document.body.dataset.competicaoTema = id;

    if (tema.img) {
        document.body.style.backgroundImage = `url('${tema.img}')`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
    } else {
        document.body.style.backgroundImage = "";
    }
};

// Aplica apenas uma cor de destaque LOCAL (--comp-cor) num container específico,
// sem alterar o fundo global da página. Usado ao explorar tabelas/competições
// que não são as do próprio jogador (não deve "vazar" para o resto do jogo).
window.aplicarCorLocalCompeticao = function(compId, containerEl) {
    const tema = obterTemaCompeticao(compId);
    if (containerEl && containerEl.style) containerEl.style.setProperty("--comp-cor", tema.cor);
    return tema.cor;
};

// Descobre a competição que o jogador está de facto a disputar nesta semana
// (o compromisso agendado) para poder repor corretamente o tema do fundo.
function obterCompeticaoAtualDoJogador() {
    if (!jogador) return "hub";
    const comp = agendaTemporada && agendaTemporada[rodadaAtual - 1];
    if (comp && !comp.isFolga) return comp.compConfigId || comp.compId || "hub";
    if (jogador.clubeId) {
        const meuClube = clubes.find(c => c.id === jogador.clubeId);
        if (meuClube && meuClube.ligaId) return meuClube.ligaId;
    }
    return "hub";
}

// Repõe o fundo/tema global de acordo com a competição atual do jogador.
// Chamar sempre que se navega para fora das secções de exploração de
// tabelas/competições/chaveamentos de outras equipas.
window.restaurarTemaJogadorAtual = function() {
    aplicarTemaCompeticao(obterCompeticaoAtualDoJogador());
};
window.mudarAbaModal = function(abaId) {
    document.querySelectorAll('.aba-conteudo').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn-modal').forEach(b => { b.style.background = 'none'; b.style.color = '#aaa'; });
    let targetAba = document.getElementById('aba-' + abaId); let targetBtn = document.getElementById('btn-aba-' + abaId);
    if(targetAba) targetAba.style.display = 'block';
    if(targetBtn) { targetBtn.style.background = 'rgba(0, 255, 136, 0.1)'; targetBtn.style.color = '#00ff88'; }
}

window.toggleConquistaDetalhes = function(el) {
    el.classList.toggle("aberto");
};

function montarCardConquista(nome, detalhes) {
    const safeNome = nome || "Conquista";
    const detalheHTML = detalhes.map(d => `<div>${d.ano || "-"} - ${d.clube || "Clube"}</div>`).join("");

    // Check if this is an international trophy (contains "Seleção" in any detail)
    const isInternational = detalhes.some(d => d.clube && d.clube.includes("Seleção"));

    return `
        <div class="card-conquista conquista-stack ${isInternational ? 'international-trophy' : ''}" onclick="toggleConquistaDetalhes(this)">
            <img loading="lazy" decoding="async" src="${obterUrlImagem(safeNome, 'trofeu')}" style="width:60px; height:60px; filter: drop-shadow(0 0 10px rgba(255,215,0,0.6));">
            ${detalhes.length > 1 ? `<span class="conquista-count">x${detalhes.length}</span>` : ""}
            ${isInternational ? `<span class="international-badge">🌍</span>` : ""}
            <div>
                <strong style="color:${isInternational ? 'var(--world-cup-gold)' : 'var(--gold)'}; font-size:1.35rem;">${safeNome}</strong><br>
                <span style="font-size:0.95rem; color:#aaa;">${detalhes.length > 1 ? "Clique para ver anos e clubes" : `Ano ${detalhes[0]?.ano || "-"} - ${detalhes[0]?.clube || "Clube"}`}</span>
                <div class="conquista-detalhes">${detalheHTML}</div>
            </div>
        </div>`;
}

function agruparTrofeusJogador(j) {
    const grupos = {};
    (j.historicoCarreira || []).forEach(h => {
        if(!h.trofeus || h.trofeus === "-") return;
        h.trofeus.split(", ").forEach(tr => {
            const nome = tr.trim();
            if(!nome) return;
            if(!grupos[nome]) grupos[nome] = [];
            grupos[nome].push({ ano: h.ano, clube: h.clube });
        });
    });
    (j.titulosSelecao || []).forEach(t => {
        const nome = t.trofeu || "Título Internacional";
        if(!grupos[nome]) grupos[nome] = [];
        grupos[nome].push({ ano: t.ano, clube: `Seleção ${t.selecao}` });
    });
    return Object.entries(grupos).map(([nome, detalhes]) => montarCardConquista(nome, detalhes)).join("");
}

function agruparTrofeusClube(c) {
    const grupos = {};
    (c.historicoTitulos || []).forEach(t => {
        const partes = String(t).split(" - ");
        const ano = partes.length > 1 ? partes.shift() : "-";
        const nome = partes.join(" - ") || String(t);
        if(!grupos[nome]) grupos[nome] = [];
        grupos[nome].push({ ano, clube: c.nome });
    });
    return Object.entries(grupos).map(([nome, detalhes]) => montarCardConquista(nome, detalhes)).join("");
}

const HISTORICO_REAL_JOGADORES = {
    j_cr7: [
    { ano: "2002/03", clube: "Sporting", jogos: 31, gols: 5, assistencias: 6, trofeus: "" },
    { ano: "2003/04", clube: "Manchester United", jogos: 40, gols: 6, assistencias: 8, trofeus: "FA Cup" },
    { ano: "2004/05", clube: "Manchester United", jogos: 50, gols: 9, assistencias: 9, trofeus: "" },
    { ano: "2005/06", clube: "Manchester United", jogos: 47, gols: 12, assistencias: 8, trofeus: "Carabao Cup" },
    { ano: "2006/07", clube: "Manchester United", jogos: 53, gols: 23, assistencias: 20, trofeus: "Premier League" },
    { ano: "2007/08", clube: "Manchester United", jogos: 49, gols: 42, assistencias: 8, trofeus: "Champions League, Premier League, Community Shield, Bola de Ouro, Chuteira de Ouro" },
    { ano: "2008/09", clube: "Manchester United", jogos: 53, gols: 26, assistencias: 12, trofeus: "Premier League, Copa Intercontinental da FIFA" },
    { ano: "2009/10", clube: "Real Madrid", jogos: 35, gols: 33, assistencias: 10, trofeus: "" },
    { ano: "2010/11", clube: "Real Madrid", jogos: 54, gols: 53, assistencias: 14, trofeus: "Copa del Rey, Chuteira de Ouro" },
    { ano: "2011/12", clube: "Real Madrid", jogos: 55, gols: 60, assistencias: 15, trofeus: "La Liga" },
    { ano: "2012/13", clube: "Real Madrid", jogos: 55, gols: 55, assistencias: 14, trofeus: "Bola de Ouro, Supercopa da Espanha" },
    { ano: "2013/14", clube: "Real Madrid", jogos: 47, gols: 51, assistencias: 15, trofeus: "Champions League, Copa del Rey, Bola de Ouro, Chuteira de Ouro" },
    { ano: "2014/15", clube: "Real Madrid", jogos: 54, gols: 61, assistencias: 22, trofeus: "Copa Intercontinental da FIFA, Chuteira de Ouro" },
    { ano: "2015/16", clube: "Real Madrid", jogos: 48, gols: 51, assistencias: 15, trofeus: "Champions League, Bola de Ouro" },
    { ano: "2016/17", clube: "Real Madrid", jogos: 46, gols: 42, assistencias: 12, trofeus: "Champions League, La Liga, Bola de Ouro, Supercopa da Espanha" },
    { ano: "2017/18", clube: "Real Madrid", jogos: 44, gols: 44, assistencias: 8, trofeus: "Champions League" },
    { ano: "2018/19", clube: "Juventus", jogos: 43, gols: 28, assistencias: 10, trofeus: "Serie A" },
    { ano: "2019/20", clube: "Juventus", jogos: 46, gols: 37, assistencias: 7, trofeus: "Serie A" },
    { ano: "2020/21", clube: "Juventus", jogos: 44, gols: 36, assistencias: 4, trofeus: "Coppa Italia" },
    { ano: "2021/22", clube: "Manchester United", jogos: 38, gols: 24, assistencias: 3, trofeus: "" },
    { ano: "2022/23", clube: "Al Nassr", jogos: 19, gols: 14, assistencias: 2, trofeus: "" },
    { ano: "2023/24", clube: "Al Nassr", jogos: 50, gols: 50, assistencias: 13, trofeus: "Artilheiro Saudi Pro" },
    { ano: "2024/25", clube: "Al Nassr", jogos: 41, gols: 35, assistencias: 4, trofeus: "" }
],
    j_messi: [
    { ano: "2004/05", clube: "Barcelona", jogos: 9, gols: 1, assistencias: 0, trofeus: "La Liga" },
    { ano: "2005/06", clube: "Barcelona", jogos: 25, gols: 8, assistencias: 3, trofeus: "Champions League, La Liga" },
    { ano: "2006/07", clube: "Barcelona", jogos: 36, gols: 17, assistencias: 3, trofeus: "Supercopa da Espanha" },
    { ano: "2007/08", clube: "Barcelona", jogos: 40, gols: 16, assistencias: 13, trofeus: "" },
    { ano: "2008/09", clube: "Barcelona", jogos: 51, gols: 38, assistencias: 18, trofeus: "Champions League, La Liga, Copa del Rey" },
    { ano: "2009/10", clube: "Barcelona", jogos: 53, gols: 47, assistencias: 11, trofeus: "La Liga, Bola de Ouro, Supercopa da Espanha, Chuteira de Ouro" },
    { ano: "2010/11", clube: "Barcelona", jogos: 55, gols: 53, assistencias: 24, trofeus: "Champions League, La Liga, Bola de Ouro, Supercopa da Espanha" },
    { ano: "2011/12", clube: "Barcelona", jogos: 60, gols: 73, assistencias: 30, trofeus: "Copa del Rey, Bola de Ouro, Chuteira de Ouro, Supercopa da Espanha" },
    { ano: "2012/13", clube: "Barcelona", jogos: 50, gols: 60, assistencias: 15, trofeus: "La Liga, Bola de Ouro, Chuteira de Ouro" },
    { ano: "2013/14", clube: "Barcelona", jogos: 46, gols: 41, assistencias: 14, trofeus: "Supercopa da Espanha" },
    { ano: "2014/15", clube: "Barcelona", jogos: 57, gols: 58, assistencias: 27, trofeus: "Champions League, La Liga, Copa del Rey, Bola de Ouro" },
    { ano: "2015/16", clube: "Barcelona", jogos: 49, gols: 41, assistencias: 23, trofeus: "La Liga, Copa del Rey" },
    { ano: "2016/17", clube: "Barcelona", jogos: 52, gols: 54, assistencias: 16, trofeus: "Copa del Rey, Supercopa da Espanha, Chuteira de Ouro" },
    { ano: "2017/18", clube: "Barcelona", jogos: 54, gols: 45, assistencias: 18, trofeus: "La Liga, Copa del Rey, Chuteira de Ouro" },
    { ano: "2018/19", clube: "Barcelona", jogos: 50, gols: 51, assistencias: 19, trofeus: "La Liga, Bola de Ouro, Chuteira de Ouro, Supercopa da Espanha" },
    { ano: "2019/20", clube: "Barcelona", jogos: 44, gols: 31, assistencias: 26, trofeus: "" },
    { ano: "2020/21", clube: "Barcelona", jogos: 47, gols: 38, assistencias: 14, trofeus: "Copa del Rey, Bola de Ouro" },
    { ano: "2021/22", clube: "PSG", jogos: 34, gols: 11, assistencias: 15, trofeus: "Ligue 1" },
    { ano: "2022/23", clube: "PSG", jogos: 41, gols: 21, assistencias: 20, trofeus: "Ligue 1, Copa do Mundo, The Best FIFA, Bola de Ouro" },
    { ano: "2023/24", clube: "Inter Miami", jogos: 29, gols: 25, assistencias: 16, trofeus: "Leagues Cup" },
    { ano: "2024/25", clube: "Inter Miami", jogos: 39, gols: 28, assistencias: 18, trofeus: "Supporters' Shield" }
],

j_ney: [
    { ano: "2009", clube: "Santos", jogos: 48, gols: 14, assistencias: 8, trofeus: "" },
    { ano: "2010", clube: "Santos", jogos: 60, gols: 42, assistencias: 16, trofeus: "Copa do Brasil, Campeonato Paulista" },
    { ano: "2011", clube: "Santos", jogos: 47, gols: 24, assistencias: 11, trofeus: "Libertadores, Puskas" },
    { ano: "2012", clube: "Santos", jogos: 47, gols: 43, assistencias: 18, trofeus: "Recopa Sudamericana, Campeonato Paulista" },
    { ano: "2013", clube: "Barcelona", jogos: 49, gols: 24, assistencias: 12, trofeus: "" },
    { ano: "2013/14", clube: "Barcelona", jogos: 41, gols: 15, assistencias: 15, trofeus: "" },
    { ano: "2014/15", clube: "Barcelona", jogos: 51, gols: 39, assistencias: 10, trofeus: "Champions League, La Liga, Copa del Rey" },
    { ano: "2015/16", clube: "Barcelona", jogos: 49, gols: 31, assistencias: 25, trofeus: "La Liga, Copa del Rey, Copa Intercontinental da FIFA" },
    { ano: "2016/17", clube: "Barcelona", jogos: 45, gols: 20, assistencias: 27, trofeus: "Copa del Rey" },
    { ano: "2017/18", clube: "PSG", jogos: 30, gols: 28, assistencias: 16, trofeus: "Ligue 1, Coupe de France" },
    { ano: "2018/19", clube: "PSG", jogos: 28, gols: 23, assistencias: 13, trofeus: "Ligue 1" },
    { ano: "2019/20", clube: "PSG", jogos: 27, gols: 19, assistencias: 12, trofeus: "Ligue 1, Coupe de France," },
    { ano: "2020/21", clube: "PSG", jogos: 31, gols: 17, assistencias: 11, trofeus: "Coupe de France" },
    { ano: "2021/22", clube: "PSG", jogos: 28, gols: 13, assistencias: 8, trofeus: "Ligue 1" },
    { ano: "2022/23", clube: "PSG", jogos: 29, gols: 18, assistencias: 17, trofeus: "Ligue 1" },
    { ano: "2023/24", clube: "Al Hilal", jogos: 5, gols: 1, assistencias: 3, trofeus: "Saudi Pro" },
    { ano: "2024/25", clube: "Santos", jogos: 24, gols: 9, assistencias: 11, trofeus: "" }
],
    j_benzema: [
        { ano: "2021/22", clube: "Real Madrid", jogos: 46, gols: 44, assistencias: 15, trofeus: "Champions League, La Liga, Supercopa da Espanha, Bola de Ouro" },
        { ano: "2017/18", clube: "Real Madrid", jogos: 47, gols: 12, assistencias: 11, trofeus: "Champions League" },
        { ano: "2015/16", clube: "Real Madrid", jogos: 36, gols: 28, assistencias: 8, trofeus: "Champions League" }
    ],
    j_suarez: [
        { ano: "2013/14", clube: "Liverpool", jogos: 37, gols: 31, assistencias: 17, trofeus: "Chuteira de Ouro, Jogador do Ano PFA" },
        { ano: "2014/15", clube: "Barcelona", jogos: 43, gols: 25, assistencias: 20, trofeus: "Champions League, La Liga, Copa do Rei" },
        { ano: "2015/16", clube: "Barcelona", jogos: 53, gols: 59, assistencias: 24, trofeus: "La Liga, Copa do Rei, Chuteira de Ouro" }
    ]
};

function obterHistoricoRealJogador(j) {
    if(!j) return [];
    return HISTORICO_REAL_JOGADORES[j.id] || HISTORICO_REAL_JOGADORES[normalizarTexto(j.nome)] || [];
}

function renderizarHistoricoRealJogador(j) {
    const hist = obterHistoricoRealJogador(j);
    if(hist.length === 0) return "";
    return `
        <div style="display:grid; gap:12px;">
            ${hist.map(h => `
                <div style="background:rgba(0,0,0,0.38); border:1px solid rgba(255,255,255,0.1); border-left:4px solid var(--gold); border-radius:10px; padding:16px;">
                    <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; flex-wrap:wrap;">
                        <div>
                            <strong style="color:var(--gold); font-size:1.25rem;">${h.ano} - ${h.clube}</strong>
                            <p style="margin:6px 0 0; color:#cbd5e1;">${h.trofeus}</p>
                        </div>
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <span class="meta-pill">${h.jogos} jogos</span>
                            <span class="meta-pill">${h.gols} gols</span>
                            <span class="meta-pill">${h.assistencias} ast</span>
                        </div>
                    </div>
                </div>`).join("")}
        </div>`;
}

function aplicarHistoricoRealJogador(j) {
    const histReal = obterHistoricoRealJogador(j);
    if(!j || histReal.length === 0) return;
    if(j.historicoRealAplicado) return;
    if(!j.historicoCarreira) j.historicoCarreira = [];

    const chavesExistentes = new Set(j.historicoCarreira.map(h => `${h.ano}|${h.clube}`));
    const entradas = histReal
        .filter(h => !chavesExistentes.has(`${h.ano}|${h.clube}`))
        .map(h => ({
            ano: h.ano,
            clube: h.clube,
            jogos: h.jogos,
            gols: h.gols,
            assistencias: h.assistencias,
            trofeus: h.trofeus,
            real: true
        }));
    j.historicoCarreira.push(...entradas);
    j.historicoCarreira.sort((a,b) => String(b.ano).localeCompare(String(a.ano)));
    j.historicoRealAplicado = true;
}

function aplicarHistoricosReaisIniciais() {
    jogadoresIA.forEach(aplicarHistoricoRealJogador);
}

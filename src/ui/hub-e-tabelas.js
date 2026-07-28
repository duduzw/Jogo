function renderizarCalendarioTemporada() {
    const el = document.getElementById("uiCalendarioTemporada");
    const resumo = document.getElementById("uiCalendarioResumo");
    if(!el) return;
    normalizarAgendaCalendario();
    const proximos = agendaTemporada.slice(Math.max(0, rodadaAtual - 1), Math.max(0, rodadaAtual - 1) + 8);
    if(resumo) resumo.textContent = `${Math.min(rodadaAtual, agendaTemporada.length || 1)}/${agendaTemporada.length || 0} datas`;
    if(!proximos.length) {
        el.innerHTML = `<div class="calendar-empty">Temporada sem jogos pendentes.</div>`;
        return;
    }
    el.innerHTML = proximos.map((ev, idx) => {
        const compInfo = competicoes.find(c => c.id === ev.compId) || COMPETICOES_SELECOES.find(c => c.id === ev.compConfigId);
        const adv = ev.isSelecao ? SELECOES.find(s => s.id === ev.adversarioId) : clubes.find(c => c.id === ev.adversarioId);
        const logo = ev.isSelecao ? (compInfo?.logo || adv?.logo || "") : obterUrlImagem(compInfo || ev.compId, "competicao");
        const data = ev.dataCalendario || formatarDataCalendario(ev);
        return `
            <div class="calendar-row ${idx === 0 ? "atual" : ""}" onclick="aplicarTemaCompeticao('${ev.compConfigId || ev.compId || "hub"}')">
                <div class="calendar-date"><strong>${data.split(" • ")[0]}</strong><span>${data.split(" • ")[1] || ev.janelaCalendario || "Jogo"}</span></div>
                <div class="calendar-logo">${logo ? `<img loading="lazy" decoding="async" src="${logo}" alt="">` : "🏆"}</div>
                <div class="calendar-main"><strong>${ev.tipo}</strong><span>${ev.isSelecao ? "Selecao" : "Clube"} vs ${adv?.nome || "Adversario a definir"}</span></div>
                <div class="calendar-tag">${ev.isFinal ? "Final" : (ev.isMataMata ? "Mata-mata" : "Liga")}</div>
            </div>`;
    }).join("");
}

function atualizarHub() {
    // No Manager, o mesmo container do Hub recebe dados do clube em vez de
    // estatísticas individuais, mantendo uma única porta de entrada por época.
    if (window.gameMode === "manager") {
        configurarNavegacaoPorModo();
        renderizarHubManager();
        if (managerEstado.ativo) renderizarManager();
        return;
    }
    if (jogador) { inicializarEstadoCarreiraJogador(); atualizarProgressoObjetivos(); }
    else return;
    // 🛡️ FIX: atualizarHub() é sempre chamado no fim de qualquer avanço de
    // rodada/partida — é um ponto seguro para "destrancar" o botão de jogar,
    // liberando window.partidaEmAndamento (ver guarda anti-clique-duplo em
    // btnJogarHub/btnDescansar mais abaixo).
    window.partidaEmAndamento = false;

    // 🌍👋 Despedida da seleção (independente de aposentar de vez): mostra o
    // resumo internacional uma vez, mas deixa o hub seguir normal (o jogador
    // continua em atividade pelo clube).
    if (window.despedidaSelecaoRecente) { window.despedidaSelecaoRecente = false; mostrarModalAposentadoriaSelecao(); }

    // 🎽➡️👔 Carreira encerrada: mostra a despedida (uma vez) e troca o hub
    // pra um cartão de "Carreira Encerrada" em vez de tentar montar o próximo
    // jogo (que não existe mais pra quem está aposentado).
    if (jogador.aposentado) {
        if (window.carreiraRecemEncerrada) { window.carreiraRecemEncerrada = false; mostrarModalAposentadoria(); }
        let uiProxAp = document.getElementById("uiProximoComp");
        if (uiProxAp) uiProxAp.innerHTML = `<div style="font-size:1.2rem; font-weight:700; color:var(--gold);">🏁 Carreira encerrada em ${jogador.anoAposentadoria || anoAtual}. Reveja tudo no Hall da Fama.</div>`;
        setText("btnJogarHub", "📜 Ver Hall da Fama");
        const btnAp = document.getElementById("btnJogarHub"); if (btnAp) btnAp.disabled = false;
        setText("sideClube", "Aposentado"); setText("uiIdade", jogador.idade);
        renderizarNoticias();
        atualizarConteudoAbaAtiva();
        return;
    }

    normalizarAgendaCalendario();
    let meuClube = clubes.find(c => c.id === jogador.clubeId);
    jogador.valorMercadoNum = calcularValorMercadoJogador(jogador); 
    jogador.valorMercado = formatarMoeda(jogador.valorMercadoNum);
    
    let imgJ = document.getElementById('sidePlayerImg'); if(imgJ) imgJ.src = obterUrlImagem(jogador, 'jogador');
    let imgC = document.getElementById('sideClubeLogo'); if(imgC) imgC.src = meuClube ? obterUrlImagem(meuClube, 'clube') : '';

    setText("sideNome", jogador.nome); setText("sideGeral", jogador.geral); setText("sideClube", meuClube ? meuClube.nome : "Livre"); setText("uiIdade", jogador.idade);
    setText("uiValorMercado", jogador.valorMercado); setText("uiValorMercadoSide", jogador.valorMercado); setText("uiEnergiaTexto", `${Math.floor(jogador.energia)}%`);
    setText("uiStatusSelecao", statusTitularidade());
    // Show saves for goalkeepers, goals for other positions
    const labelEl = document.getElementById("labelGolsTemp");
    const golsEl = document.getElementById("estGolsTemp");
    const defesasEl = document.getElementById("estDefesasTemp");
    if(jogador.posicao === "Goleiro") {
        if(labelEl) labelEl.textContent = "Defesas Feitas";
        if(golsEl) golsEl.style.display = "none";
        if(defesasEl) {
            defesasEl.style.display = "block";
            defesasEl.textContent = jogador.estatisticasAtuais.defesas || 0;
        }
    } else {
        if(labelEl) labelEl.textContent = "Golos Marcados";
        if(golsEl) {
            golsEl.style.display = "block";
            golsEl.textContent = jogador.estatisticasAtuais.gols;
        }
        if(defesasEl) defesasEl.style.display = "none";
    }
    setText("estJogosTemp", jogador.estatisticasAtuais.jogos);
    setText("estNivelGeral", jogador.geral); setText("uiAnoAtual", anoAtual);
    const melhor = jogador.melhorAtuacao;
    const uiMelhor = document.getElementById("uiMelhorAtuacao");
    if(uiMelhor) {
        uiMelhor.innerHTML = melhor?.nota > 0
            ? `Nota <strong style="color:var(--gold);">${melhor.nota}</strong> — ${melhor.gols}G / ${melhor.assistencias}A vs ${melhor.adversario} (Rod. ${melhor.rodada})`
            : "Ainda sem destaque registrado.";
    }

    let enBar = document.getElementById("uiEnergiaBarra"); if(enBar) { enBar.style.width = `${jogador.energia}%`; enBar.style.background = jogador.energia > 50 ? "var(--success)" : "var(--danger)"; }

    let comp = agendaTemporada[rodadaAtual - 1]; let uiProx = document.getElementById("uiProximoComp");
    
    // FAILSAFE SUPREMO: Se a agenda estourou, o jogo força o fim da temporada sem perguntar pelos NPCs.
    let agendaEsgotada = (!comp);
    let failsafeAtivado = (rodadaAtual > agendaTemporada.length + 5);

    if (uiProx) {
        if (!agendaEsgotada) {
            // Check if this is a bye week (folga)
            if (comp.isFolga) {
                uiProx.innerHTML = `
                    <div class="next-match-meta"><span>🏆 ${comp.tipo}</span><strong>${formatarDataCalendario(comp)}</strong></div>
                    <div style="font-size:1.4rem; font-weight:700; color:var(--success);">🛌 Semana de Recuperação</div>
                    <div style="font-size:0.9rem; color:var(--text-muted);">Aproveita para recuperar energia e treinar</div>
                `;
                setText("btnJogarHub", "Passar Semana (Descanso) ➔"); aplicarTemaCompeticao("hub"); document.getElementById("btnJogarHub").disabled = false;
            } else {
                const minhaSelecao = comp.isSelecao ? SELECOES.find(s => s.id === (comp.mandanteId || jogador.selecaoId)) : null;
                let adv = comp.isSelecao ? SELECOES.find(s => s.id === comp.adversarioId) : clubes.find(c => c.id === comp.adversarioId);
                const meuNomeCard = comp.isSelecao ? (minhaSelecao?.nome || "Selecao") : (meuClube ? meuClube.nome : "Teu clube");
                const meuLogoCard = comp.isSelecao ? (minhaSelecao?.logo || "") : (meuClube ? obterUrlImagem(meuClube, 'clube') : "");
                const advLogoCard = comp.isSelecao ? (adv?.logo || "") : (adv ? obterUrlImagem(adv, 'clube') : "");
                const compLogoCard = comp.isSelecao ? (COMPETICOES_SELECOES.find(c => c.id === comp.compConfigId)?.logo || advLogoCard) : obterUrlImagem(comp.compId, 'competicao');
                const dataCompromisso = comp.dataCalendario || formatarDataCalendario(comp);
                uiProx.innerHTML = `
                    <div class="next-match-meta"><span><img loading="lazy" decoding="async" src="${compLogoCard}" class="comp-logo" onerror="this.style.display='none'"> 🏆 ${comp.tipo}</span><strong>${dataCompromisso}</strong></div>
                    <div style="font-size:1.4rem; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center;"><div style="width:35px;height:35px;display:flex;align-items:center;justify-content:center;margin-right:10px;"><img loading="lazy" decoding="async" src="${meuLogoCard}" style="max-width:100%;max-height:100%;object-fit:contain;"></div><span style="color:var(--theme-primary); font-weight:800; font-size:1.6rem;">${meuNomeCard}</span></div> 
                        <span style="color:var(--text-muted); font-size:1rem; margin:0 15px;">VS</span> 
                        <div style="display:flex; align-items:center;"><span style="font-weight:600; font-size:1.6rem; margin-right:10px;">${adv?.nome || 'Rival'}</span><div style="width:35px;height:35px;display:flex;align-items:center;justify-content:center;"><img loading="lazy" decoding="async" src="${advLogoCard}" style="max-width:100%;max-height:100%;object-fit:contain;"></div></div>
                    </div>`;
                const textoAcao = jogador.lesaoRodadas > 0 ? "Fora por Lesão ➔" : (jogador.titularidade >= 68 ? "Entrar em Relvado ➔" : "Entrar do Banco ➔");
                setText("btnJogarHub", textoAcao); aplicarTemaCompeticao(comp.compConfigId || comp.compId); document.getElementById("btnJogarHub").disabled = false;
            }
        } else if (!failsafeAtivado) { 
            uiProx.innerHTML = `<div style="font-size:1.2rem; font-weight:700; color:var(--warning);">⏳ Sem jogos marcados. Finais e decisões globais a decorrer...</div>`;
            setText("btnJogarHub", "Avançar Semana Global ➔"); aplicarTemaCompeticao("hub"); document.getElementById("btnJogarHub").disabled = false;
        } else {
            uiProx.innerHTML = `<div style="font-size:1.2rem; font-weight:700; color:var(--success);">🏁 A Época terminou! O mundo aguarda a Gala.</div>`;
            setText("btnJogarHub", "Ir para a Gala Ouro ➔"); aplicarTemaCompeticao("hub"); document.getElementById("btnJogarHub").disabled = false;
        }
    }
    renderizarCalendarioTemporada();
    atualizarConteudoAbaAtiva(); renderizarMercado(); renderizarTransferencias(); renderizarNoticias();
}

function inicializarInterfaceTabelasClean() {
    let elDest = document.getElementById("view-classificacao");
    if(!elDest) return;
    if(!document.getElementById("paises-grid")) {
        elDest.innerHTML = `
            <div class="classificacao-shell">
                <div id="regioes-filtro" class="regioes-filtro"></div>
                <div id="paises-grid" class="paises-grid"></div>
                <div id="divisoes-container" class="divisoes-container" style="display:none;"></div>
                <div id="areaTabelaEspecifica"></div>
            </div>`;
    }

    const gridRegioes = document.getElementById("regioes-filtro");

    const gridPaises = document.getElementById("paises-grid");
    const divisoesCtx = document.getElementById("divisoes-container");
    const localTabela = document.getElementById("areaTabelaEspecifica");
    const paisInfo = {
        br: { nome: "Brasil", regiao: "CONMEBOL" },
        arg: { nome: "Argentina", regiao: "CONMEBOL" },
        eng: { nome: "Inglaterra", regiao: "UEFA" },
        esp: { nome: "Espanha", regiao: "UEFA" },
        ita: { nome: "Italia", regiao: "UEFA" },
        ger: { nome: "Alemanha", regiao: "UEFA" },
        fra: { nome: "Franca", regiao: "UEFA" },
        pt: { nome: "Portugal", regiao: "UEFA" },
        nl: { nome: "Holanda", regiao: "UEFA" },
        tr: { nome: "Turquia", regiao: "UEFA" },
        usa: { nome: "Estados Unidos", regiao: "CONCACAF" },
        ara: { nome: "Arabia", regiao: "AFC" },
        be: { nome: "Belgica", regiao: "UEFA" },
        uy: { nome: "Uruguai", regiao: "CONMEBOL" },
        mx: { nome: "Mexico", regiao: "CONCACAF" },
        sco: { nome: "Escócia", regiao: "UEFA" },
        gre: { nome: "Grecia", regiao: "UEFA" },
        sui: { nome: "Suiça", regiao: "UEFA" },
        nor: { nome: "Noruega", regiao: "UEFA" },
        aut: { nome: "Austria", regiao: "UEFA" },
        nga: { nome: "Nigeria", regiao: "CONCACAF" },
        civ: { nome: "Costa Marfim", regiao: "CONCACAF" },
        afc: { nome: "AFC", regiao: "AFC" },
        conmebol: { nome: "CONMEBOL", regiao: "CONMEBOL" },
        uefa: { nome: "UEFA", regiao: "UEFA" },
        concacaf: { nome: "CONCACAF", regiao: "CONCACAF" },
        caf: { nome: "CAF", regiao: "CAF" },
        
    };

    let paisesMapeados = {};
    const compsUnicas = Array.from(new Map(competicoes.filter(c => c.tipo === "liga" || c.tipo === "liga_grupos" || c.tipo === "liga_conferencias" || c.tipo === "mata_mata" || c.tipo === "acesso_playoff" || c.tipo === "playoffs" || c.tipo === "copa" || c.tipo === "supercopa" || c.tipo === "estadual").map(c => [c.id, c])).values());
    compsUnicas.forEach(comp => {
        let prefix = obterPaisCompeticaoId(comp.id);
        let info = paisInfo[prefix] || { nome: "Outros", regiao: "Mundo" };
        if (!paisesMapeados[info.nome]) {
            let primeiraDivisao = competicoes.find(c => c.id === `${prefix}_1`) || competicoes.find(c => c.tipo === "liga" && obterPaisCompeticaoId(c.id) === prefix);
            paisesMapeados[info.nome] = { info: { ...info, prefix, logo: primeiraDivisao?.logo || "" }, competicoes: [] };
        }
        paisesMapeados[info.nome].competicoes.push(comp);
    });

    const ordenarCompeticoesPais = (lista) => lista.sort((a,b) => {
        const peso = { continental: 0, liga: 1, liga_grupos: 1, liga_conferencias: 1, mata_mata: 2, acesso_playoff: 2, playoffs: 2, copa: 3, supercopa: 4, continental_qualy: 5, estadual: 6 };
        return (peso[a.tipo] ?? 9) - (peso[b.tipo] ?? 9) || (a.div || 99) - (b.div || 99) || a.nome.localeCompare(b.nome);
    });

    gridPaises.innerHTML = "";
    Object.keys(paisesMapeados).sort().forEach((pais, index) => {
        const grupo = paisesMapeados[pais];
        ordenarCompeticoesPais(grupo.competicoes);
        const totalCopas = grupo.competicoes.filter(c => c.tipo !== "liga").length;
        const totalLigas = grupo.competicoes.filter(c => c.tipo === "liga").length;
        const logoHTML = grupo.info.logo ? `<span class="pais-logo"><img loading="lazy" decoding="async" src="${grupo.info.logo}" alt="${pais}"></span>` : `<span class="pais-logo">${grupo.info.prefix.toUpperCase().slice(0,2)}</span>`;
        const btnPais = document.createElement("button");
        btnPais.className = `btn-pais-filtro ${index === 0 ? 'ativo' : ''}`; 
        // 🛡️ Pedido do utilizador: mostrar só a logo da liga principal + nome
        // do país (sem o resumo "UEFA • 2 ligas • 2 copas").
        btnPais.innerHTML = `${logoHTML}<span class="pais-label">${pais}</span>`;
        btnPais.dataset.pais = pais;
        btnPais.dataset.prefix = grupo.info.prefix;
        btnPais.dataset.regiao = grupo.info.regiao;
        btnPais.onclick = () => {
            gridPaises.querySelectorAll(".btn-pais-filtro").forEach(b => b.classList.remove("ativo"));
            btnPais.classList.add("ativo");
            aplicarCorLocalCompeticao(grupo.competicoes[0]?.id || grupo.info.prefix, localTabela);
            renderizarSubdivisoesPais(grupo.competicoes, divisoesCtx, localTabela, grupo.info);
        };
        gridPaises.appendChild(btnPais);
    });

    // 🆕 FILTRO POR REGIÃO: com muitos países/competições cadastrados, mostrar
    // todos de uma vez vira poluição visual. Estes chips (Todos, UEFA,
    // CONMEBOL, CONCACAF, AFC, CAF...) escondem/mostram só os países daquela
    // confederação — o país já guarda sua região em paisInfo, então é só
    // filtrar os botões já renderizados acima, sem duplicar lógica.
    if (gridRegioes) {
        const ORDEM_REGIOES = ["UEFA", "CONMEBOL", "CONCACAF", "AFC", "CAF", "Mundo"];
        const regioesPresentes = [...new Set(Object.values(paisesMapeados).map(g => g.info.regiao))]
            .sort((a, b) => (ORDEM_REGIOES.indexOf(a) === -1 ? 99 : ORDEM_REGIOES.indexOf(a)) - (ORDEM_REGIOES.indexOf(b) === -1 ? 99 : ORDEM_REGIOES.indexOf(b)));

        const aplicarFiltroRegiao = (regiao, chipEl) => {
            gridRegioes.querySelectorAll(".regiao-filtro-chip").forEach(c => c.classList.remove("ativo"));
            chipEl.classList.add("ativo");
            const botoesPais = [...gridPaises.querySelectorAll(".btn-pais-filtro")];
            let primeiroVisivel = null;
            botoesPais.forEach(b => {
                const visivel = regiao === "todos" || b.dataset.regiao === regiao;
                b.style.display = visivel ? "" : "none";
                if (visivel && !primeiroVisivel) primeiroVisivel = b;
            });
            // Se o país atualmente selecionado ficou escondido pelo filtro,
            // seleciona automaticamente o primeiro país ainda visível.
            const ativoAtual = gridPaises.querySelector(".btn-pais-filtro.ativo");
            if (primeiroVisivel && (!ativoAtual || ativoAtual.style.display === "none")) {
                primeiroVisivel.click();
            }
        };

        gridRegioes.innerHTML = "";
        const chipTodos = document.createElement("span");
        chipTodos.className = "regiao-filtro-chip ativo";
        chipTodos.textContent = "🌐 Todos";
        chipTodos.onclick = () => aplicarFiltroRegiao("todos", chipTodos);
        gridRegioes.appendChild(chipTodos);
        regioesPresentes.forEach(regiao => {
            const chip = document.createElement("span");
            chip.className = "regiao-filtro-chip";
            chip.textContent = regiao;
            chip.onclick = () => aplicarFiltroRegiao(regiao, chip);
            gridRegioes.appendChild(chip);
        });
    }

    let primeirosPaises = Object.keys(paisesMapeados).sort();
    if(primeirosPaises.length > 0) {
        let primeiro = paisesMapeados[primeirosPaises[0]];
        renderizarSubdivisoesPais(primeiro.competicoes, divisoesCtx, localTabela, primeiro.info);
    }
}

function renderizarSubdivisoesPais(competicoesDoPais, divisoesCtx, localTabela, infoPais = null) {
    divisoesCtx.style.display = "flex"; divisoesCtx.innerHTML = ""; localTabela.innerHTML = "";

    const rotuloTipoDe = (comp) => {
        if (comp.tipo === "liga" || comp.tipo === "liga_grupos" || comp.tipo === "liga_conferencias") return `${comp.div || 1}ª Divisão`;
        if (comp.tipo === "continental") return "Continental";
        if (comp.tipo === "supercopa") return "Supercopa";
        if (comp.tipo === "estadual") return "Estadual";
        if (comp.tipo === "mata_mata") return "Mata-Mata";
        if (comp.tipo === "acesso_playoff") return "Playoff de Acesso";
        if (comp.tipo === "playoffs") return "Playoffs";
        if (comp.tipo === "continental_qualy") return "Qualificação";
        return "Copa";
    };

    // 🛡️ Pedido do utilizador: mostrar só a LOGO da competição (não o nome
    // em texto "Bundesliga / 1a divisao"). O nome fica disponível via
    // tooltip (title) para quem passar o mouse por cima.
    const criarBotaoDivisao = (comp, ativo) => {
        const btnDiv = document.createElement("button");
        btnDiv.className = `btn-divisao btn-divisao-logo ${ativo ? 'ativo' : ''}`;
        btnDiv.title = `${comp.nome} — ${rotuloTipoDe(comp)}`;
        btnDiv.innerHTML = `<img loading="lazy" decoding="async" src="${obterUrlImagem(comp, 'competicao')}" alt="${comp.nome}" style="width:100%; height:100%; object-fit:contain;">`;
        btnDiv.dataset.compId = comp.id;
        btnDiv.onclick = () => {
            divisoesCtx.querySelectorAll(".btn-divisao").forEach(b => b.classList.remove("ativo"));
            btnDiv.classList.add("ativo");
            if(comp.tipo === "liga" || comp.tipo === "liga_grupos" || comp.tipo === "liga_conferencias") exibirTabelaLigaCodigo(comp.id, localTabela);
            else exibirCompeticaoEliminatoriaCodigo(comp.id, localTabela);
        };
        return btnDiv;
    };

    const principais = competicoesDoPais.filter(c => c.tipo !== "estadual");
    const estaduais = competicoesDoPais.filter(c => c.tipo === "estadual");

    const linhaPrincipal = document.createElement("div");
    linhaPrincipal.className = "divisoes-linha-principal";
    divisoesCtx.appendChild(linhaPrincipal);

    principais.forEach((comp, idx) => linhaPrincipal.appendChild(criarBotaoDivisao(comp, idx === 0)));

    // 🆕 FILTRO DE ESTADUAIS: em vez de encher a tela com um ícone pra cada um
    // dos ~27 campeonatos estaduais, eles ficam agrupados atrás de um único
    // botão "🗺️" — clicando, abre/fecha um painel só com eles.
    if (estaduais.length > 0) {
        const btnToggle = document.createElement("button");
        btnToggle.className = "btn-divisao btn-divisao-logo btn-estaduais-toggle";
        btnToggle.title = `Campeonatos Estaduais (${estaduais.length})`;
        btnToggle.innerHTML = `<span style="font-size:1.6rem;">🌎</span>`;
        linhaPrincipal.appendChild(btnToggle);

        const painelEstaduais = document.createElement("div");
        painelEstaduais.className = "painel-estaduais oculto";
        painelEstaduais.innerHTML = `<div class="painel-estaduais-header">🌎 Campeonatos Estaduais <span>${estaduais.length}</span></div><div class="painel-estaduais-grid"></div>`;
        const gridEstaduais = painelEstaduais.querySelector(".painel-estaduais-grid");
        [...estaduais].sort((a, b) => a.nome.localeCompare(b.nome)).forEach(comp => {
            const btnEstadual = criarBotaoDivisao(comp, false);
            const onclickOriginal = btnEstadual.onclick;
            btnEstadual.onclick = () => { onclickOriginal(); btnToggle.classList.add("ativo"); };
            gridEstaduais.appendChild(btnEstadual);
        });
        divisoesCtx.appendChild(painelEstaduais);

        btnToggle.onclick = () => {
            const abrindo = painelEstaduais.classList.contains("oculto");
            painelEstaduais.classList.toggle("oculto");
            // Só marca como "ativo" (destacado) quando aberto E nenhum estadual
            // específico está selecionado — assim que escolher um, o botão do
            // estadual escolhido fica ativo e o toggle volta ao normal.
            if (!abrindo) btnToggle.classList.remove("ativo");
        };
    }

    if (principais.length > 0) {
        if(principais[0].tipo === "liga" || principais[0].tipo === "liga_grupos" || principais[0].tipo === "liga_conferencias") exibirTabelaLigaCodigo(principais[0].id, localTabela);
        else exibirCompeticaoEliminatoriaCodigo(principais[0].id, localTabela);
    } else if (estaduais.length > 0) {
        exibirCompeticaoEliminatoriaCodigo(estaduais[0].id, localTabela);
    }
}

// Exibe um mata-mata (copa) na área de tabelas. Também assume o tema/fundo
// global da competição sendo visualizada, para que o jogador sinta que está
// "dentro" da competição enquanto navega/explora outras ligas e copas.
function exibirCompeticaoEliminatoriaCodigo(compId, containerTarget) {
    aplicarCorLocalCompeticao(compId, containerTarget);
    if (typeof aplicarTemaCompeticao === 'function') aplicarTemaCompeticao(compId);
    let compInfo = competicoes.find(c => c.id === compId);
    let estado = copasEstado[compId];
    let tipoLabel = compInfo?.tipo === "supercopa" ? "Supercopa nacional" : (compInfo?.tipo === "supercopa_continental" ? "Supercopa continental" : (compInfo?.tipo === "torneio_intercontinental" ? "Intercontinental" : "Copa nacional"));
    let html = `<div class="liga-header-card"><div class="liga-title-wrap"><div class="liga-logo-frame"><img loading="lazy" decoding="async" src="${obterUrlImagem(compInfo || compId, 'competicao')}" alt="${compInfo?.nome || 'Competicao'}"></div><div><span>${tipoLabel}</span><h2>${compInfo?.nome || 'Competicao'}</h2></div></div><div class="meta-pill">Mata-mata</div></div>`;
    if(!estado) {
        containerTarget.innerHTML = `<div class="comp-detail-grid"><div>${html}<div style="width:100%; text-align:center; padding:34px; color:#aaa; font-size:1.05rem; background:rgba(0,0,0,0.28); border:1px solid rgba(255,255,255,0.1); border-radius:14px;">Sorteio ainda nao realizado.</div></div>${montarRankingCompeticao(compId)}</div>`;
        return;
    }
    if (estado.tipo === "liga_unica") {
        html += renderTabelaLigaSuica(estado);
        containerTarget.innerHTML = `<div class="comp-detail-grid"><div>${html}</div>${montarRankingCompeticao(compId)}</div>`;
        return;
    }
    let todasFases = [...(estado.historicoFases || []), estado];
    html += renderChaveamentoComAbas(todasFases);
    containerTarget.innerHTML = `<div class="comp-detail-grid"><div>${html}</div>${montarRankingCompeticao(compId)}</div>`;
}

// 🆕 Tabela única da Fase de Liga (formato suíço). Mostra as 3 faixas de
// classificação (direto às oitavas / playoff / eliminado) com uma legenda.
function renderTabelaLigaSuica(estado) {
    const tabOrd = [...estado.tabela].sort((a,b) => b.pts - a.pts || (b.gf-b.gs) - (a.gf-a.gs) || b.gf - a.gf);
    let html = `<div class="meta-pill" style="margin-bottom:10px;">Fase de Liga • Rodada ${Math.min(estado.rodadaAtual||1,8)}/8</div>`;
    html += `<table class="tabela-classificacao grupo-table" style="width:100%; border-collapse:collapse; text-align:left;">
        <thead><tr><th>Pos</th><th>Clube</th><th>Pts</th><th>J</th><th>GM</th><th>GS</th><th>SG</th></tr></thead><tbody>`;
    tabOrd.forEach((item, index) => {
        let clb = clubes.find(c => c.id === item.id);
        let ehMeuClube = jogador && clb?.id === jogador.clubeId;
        let zonaCor = index < 8 ? "#22c55e" : index < 24 ? "#facc15" : "#ef4444";
        let bgL = ehMeuClube ? "rgba(0,255,136,0.15)" : (index % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent");
        html += `<tr style="background:${bgL}; border-left:4px solid ${zonaCor}; cursor:pointer;" onclick="abrirPerfilClube('${item.id}')">
            <td style="font-weight:bold;">${index+1}º</td>
            <td style="display:flex; align-items:center; font-weight:bold; color:${ehMeuClube ? 'var(--theme-primary)' : '#fff'};">
                <div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;margin-right:12px;"><img loading="lazy" decoding="async" src="${obterUrlImagem(clb,'clube')}" style="max-width:100%;max-height:100%;object-fit:contain;"></div>
                ${clb ? clb.nome : 'Clube'}${ehMeuClube ? ' <span class="tag-meu-clube">TU</span>' : ''}
            </td>
            <td style="color:#ffd700; font-weight:bold;">${item.pts}</td>
            <td>${item.j}</td><td>${item.gf}</td><td>${item.gs}</td><td>${(item.gf||0)-(item.gs||0)}</td>
        </tr>`;
    });
    html += `</tbody></table><div class="tabela-legenda" style="margin-top:10px;">
        <span class="tabela-legenda-item"><i style="background:#22c55e;"></i>1º-8º: Oitavas direto</span>
        <span class="tabela-legenda-item"><i style="background:#facc15;"></i>9º-24º: Playoff</span>
        <span class="tabela-legenda-item"><i style="background:#ef4444;"></i>25º-36º: Eliminado</span>
    </div>`;
    return html;
}
// Exibe a tabela de classificação de uma liga. Também assume o tema/fundo
// global da liga sendo visualizada (ver comentário acima).
function exibirTabelaLigaCodigo(ligaId, containerTarget) {
    aplicarCorLocalCompeticao(ligaId, containerTarget);
    if (typeof aplicarTemaCompeticao === 'function') aplicarTemaCompeticao(ligaId);
    let compInfo = competicoes.find(c => c.id === ligaId);
    if (!compInfo) { containerTarget.innerHTML = "<p style='color:#aaa;'>Competição não encontrada.</p>"; return; }

    // Para competições com formato de grupos (Série D)
    if (compInfo.tipo === "liga_grupos") {
        let estado = copasEstado[ligaId];
        if (!estado) { containerTarget.innerHTML = "<p style='color:#aaa;'>Nenhum dado para esta competição.</p>"; return; }

        // 🛡️ FIX ("Minha Tabela" ficava em branco assim que os grupos da
        // Série D terminavam): esta view só sabia desenhar a TABELA de
        // grupos (estado.grupos) — que é apagada de propósito assim que o
        // mata-mata começa (ver processarFimGruposClube). Sem um fallback,
        // a tela mostrava "Nenhum dado" pro resto da temporada inteira,
        // mesmo com o mata-mata rolando normalmente nos bastidores. Agora,
        // se os grupos já acabaram mas existe um chaveamento (confrontos),
        // mostra o chaveamento em vez da tabela.
        if (!estado.grupos) {
            if (estado.tipo === "mata-mata" && estado.confrontos) {
                let htmlBracket = `<div style="display:flex; align-items:center; margin-bottom:25px; border-bottom:1px solid #333; padding-bottom:15px;"><img loading="lazy" decoding="async" src="${obterUrlImagem(compInfo, 'competicao')}" style="width:50px; height:50px; margin-right:20px; border-radius:8px; object-fit:contain;"><h2 style="color:var(--theme-primary); margin:0; font-size:2rem;">${compInfo.nome}</h2></div>`;
                htmlBracket += renderChaveamentoComAbas([...(estado.historicoFases || []), estado]);
                containerTarget.innerHTML = `<div class="comp-detail-grid"><div>${htmlBracket}</div>${montarRankingCompeticao(ligaId)}</div>`;
                return;
            }
            containerTarget.innerHTML = "<p style='color:#aaa;'>Nenhum dado para esta competição.</p>";
            return;
        }

        let html = `
            <div class="liga-header-card"><div class="liga-title-wrap"><div class="liga-logo-frame"><img loading="lazy" decoding="async" src="${obterUrlImagem(compInfo, 'competicao')}" alt="${compInfo.nome}"></div><div><span>Fase de Grupos</span><h2>${compInfo.nome}</h2></div></div><div class="meta-pill">${estado.grupos.length} grupos</div></div>
            <div class="grupo-grid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:15px; margin-top:20px;">
        `;

        estado.grupos.forEach(grupo => {
            let ord = [...grupo.equipas].sort((a,b) => b.pts - a.pts || (b.gf - b.gs) - (a.gf - a.gs));
            html += `
                <div class="bracket-group-card" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; overflow:hidden;">
                    <div class="grupo-card-head" style="background:rgba(0,0,0,0.3); padding:12px 15px; display:flex; justify-content:space-between; align-items:center;">
                        <h4 style="margin:0; color:#fff;">${grupo.nome}</h4>
                        <span class="grupo-card-meta" style="color:#aaa; font-size:0.85rem;">${estado.avancam} classificam</span>
                    </div>
                    <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
                        <thead><tr style="background:rgba(0,0,0,0.2);"><th style="padding:8px 10px; text-align:left; color:#888;">Pos</th><th style="padding:8px 10px; text-align:left; color:#888;">Clube</th><th style="padding:8px 10px; text-align:center; color:#888;">Pts</th><th style="padding:8px 10px; text-align:center; color:#888;">J</th><th style="padding:8px 10px; text-align:center; color:#888;">SG</th></tr></thead>
                        <tbody>
            `;
            ord.forEach((eq, idx) => {
                let clb = clubes.find(c => c.id === eq.id);
                let ehMeuClube = jogador && clb?.id === jogador.clubeId;
                let bg = ehMeuClube ? "rgba(0, 255, 136, 0.15)" : (idx < estado.avancam ? "rgba(0, 255, 136, 0.08)" : (idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)"));
                let borda = idx < estado.avancam ? "border-left:3px solid #00ff88;" : "border-left:3px solid transparent;";
                html += `
                    <tr style="background:${bg}; ${borda} cursor:pointer;" onclick="abrirPerfilClube('${eq.id}')">
                        <td style="padding:8px 10px; font-weight:bold; color:${idx < estado.avancam ? '#00ff88' : '#fff'};">${idx + 1}º</td>
                        <td style="padding:8px 10px; display:flex; align-items:center; color:${ehMeuClube ? 'var(--theme-primary)' : '#fff'};">
                            <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center; margin-right:10px;">
                                <img loading="lazy" decoding="async" src="${obterUrlImagem(clb, 'clube')}" style="max-width:100%; max-height:100%; object-fit:contain;">
                            </div>
                            ${clb ? clb.nome : eq.id}${ehMeuClube ? ' <span class="tag-meu-clube"></span>' : ''}
                        </td>
                        <td style="padding:8px 10px; text-align:center; color:#ffd700; font-weight:bold;">${eq.pts}</td>
                        <td style="padding:8px 10px; text-align:center;">${eq.j}</td>
                        <td style="padding:8px 10px; text-align:center;">${eq.gf - eq.gs}</td>
                    </tr>
                `;
            });
            html += `</tbody></table></div>`;
        });
        html += `</div>`;
        containerTarget.innerHTML = html;
        return;
    }

    // Para ligas normais (tabela única)
    let dadosTabela = tabelasLigas[ligaId];
    if (!dadosTabela) { containerTarget.innerHTML = "<p style='color:#aaa;'>Nenhum dado para esta liga.</p>"; return; }

    let tabOrd = [...dadosTabela].sort((a,b) => b.pontos - a.pontos || ((b.gols||0) - (b.golsSofridos||0)) - ((a.gols||0) - (a.golsSofridos||0)) || (b.gols||0) - (a.gols||0));
    let zonas = obterZonasQualificacaoLiga(ligaId, tabOrd.length);

    let legendaHTML = zonas.length ? `<div class="tabela-legenda">${zonas.map(z => `<span class="tabela-legenda-item"><i style="background:${z.cor};"></i>${z.label} (${z.fim - z.inicio})</span>`).join("")}</div>` : "";

    let html = `
        <div class="liga-header-card"><div class="liga-title-wrap"><div class="liga-logo-frame"><img loading="lazy" decoding="async" src="${obterUrlImagem(compInfo, 'competicao')}" alt="${compInfo.nome}"></div><div><span>Classificacao atual</span><h2>${compInfo.nome}</h2></div></div><div class="meta-pill">${dadosTabela.length} clubes</div></div>
        ${legendaHTML}
        <table class="tabela-classificacao grupo-table" style="width:100%; border-collapse:collapse; text-align:left;">
            <thead><tr><th>Pos</th><th>Clube</th><th>Pts</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GM</th><th>GS</th><th>SG</th></tr></thead>
            <tbody>
    `;

    tabOrd.forEach((item, index) => {
        let clb = clubes.find(c => c.id === item.id);
        let ehMeuClube = jogador && clb?.id === jogador.clubeId;
        let zona = obterZonaDaPosicao(zonas, index);
        let bgL = ehMeuClube ? "rgba(0, 255, 136, 0.15)" : (zona ? `color-mix(in srgb, ${zona.cor} 10%, transparent)` : (index % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"));
        let borda = zona ? `border-left:4px solid ${zona.cor};` : "border-left:4px solid transparent;";
        html += `
            <tr style="background:${bgL}; ${borda} cursor:pointer;" onclick="abrirPerfilClube('${item.id}')" title="${zona ? zona.label : ''}">
                <td style="font-weight:bold;">${index + 1}º</td>
                <td style="display:flex; align-items:center; font-weight:bold; color:${ehMeuClube ? 'var(--theme-primary)' : '#fff'};">
                    <div style="width:30px; height:30px; display:flex; align-items:center; justify-content:center; margin-right:15px;">
                        <img loading="lazy" decoding="async" src="${obterUrlImagem(clb, 'clube')}" style="max-width:100%; max-height:100%; object-fit:contain;">
                    </div>
                    ${clb ? clb.nome : 'Clube'}${ehMeuClube ? ' <span class="tag-meu-clube"></span>' : ''}
                </td>
                <td style="color:#ffd700; font-weight:bold;">${item.pontos}</td>
                <td>${item.jogos}</td><td>${item.vitorias||0}</td><td>${item.empates||0}</td><td>${item.derrotas||0}</td>
                <td>${item.gols}</td><td>${item.golsSofridos}</td><td>${(item.gols||0) - (item.golsSofridos||0)}</td>
            </tr>`;
    });
    html += `</tbody></table>`; containerTarget.innerHTML = `<div class="comp-detail-grid"><div>${html}</div>${montarRankingCompeticao(ligaId)}</div>`;
}

function renderizarChaveamentosVisuais(copaSelecionada) {
    aplicarTemaCompeticao(copaSelecionada);
    const estado = copasEstado[copaSelecionada];
    if (!estado) return `<div style="width:100%; text-align:center; padding:40px; color:#aaa; font-size:1.2rem;">Sorteio ainda não realizado.</div>`; 

    let comp = competicoes.find(c=>c.id===copaSelecionada);
    let html = `<div style="display:flex; align-items:center; margin-bottom:25px; border-bottom:1px solid #333; padding-bottom:15px;"><img loading="lazy" decoding="async" src="${obterUrlImagem(copaSelecionada, 'competicao')}" style="width:50px; height:50px; margin-right:20px; border-radius:8px; object-fit:contain;"><h2 style="color:var(--theme-primary); margin:0; font-size: 2rem;">${comp?.nome}</h2></div>`;

    if (estado.tipo === "liga_unica") {
        html += renderTabelaLigaSuica(estado);
        return `<div class="comp-detail-grid"><div>${html}</div>${montarRankingCompeticao(copaSelecionada)}</div>`;
    }
    html += renderChaveamentoComAbas([...(estado.historicoFases || []), estado]);
    return `<div class="comp-detail-grid"><div>${html}</div>${montarRankingCompeticao(copaSelecionada)}</div>`;
}

// Monta o HTML de um único confronto de mata-mata (cartão com os 2 clubes,
// placar, e estado). Reaproveitado tanto pela árvore horizontal quanto por
// qualquer outro contexto que precise mostrar um confronto isolado.
function montarConfrontoCardHtml(conf) {
    const isMeuJogo = conf.timeA.id === jogador.clubeId || conf.timeB.id === jogador.clubeId;
    const pen = conf.penaltis ? `<span class="penalty-badge">Pênaltis</span>` : "";
    const duasPartidas = conf.golsAIda !== null || conf.golsAVolta !== null;
    let placarA, placarB, subInfo = "";
    if (duasPartidas) {
        const aggA = (conf.golsAIda||0)+(conf.golsAVolta||0), aggB = (conf.golsBIda||0)+(conf.golsBVolta||0);
        if (conf.vencedorId) { placarA = aggA; placarB = aggB; subInfo = "Agregado"; }
        else { placarA = conf.golsAIda ?? "–"; placarB = conf.golsBIda ?? "–"; subInfo = "Jogo de ida"; }
    } else {
        const jogado = conf.golsA !== null && conf.golsA !== undefined;
        placarA = jogado ? conf.golsA : "–";
        placarB = jogado ? conf.golsB : "–";
    }
    const jogadoFinal = !!conf.vencedorId || (!duasPartidas && conf.golsA !== null && conf.golsA !== undefined);
    const team = (t, gols, win) => {
        if (!t) return conf.bye
            ? `<div class="bracket-slot-team tbd"><span class="bracket-slot-crest tbd-crest">–</span><span class="bracket-slot-name">Bye (folga)</span><span class="bracket-slot-goals">–</span></div>`
            : `<div class="bracket-slot-team tbd"><span class="bracket-slot-crest tbd-crest">?</span><span class="bracket-slot-name">A definir</span><span class="bracket-slot-goals">–</span></div>`;
        const elim = conf.vencedorId && conf.vencedorId !== t.id;
        return `<div class="bracket-slot-team ${win ? "winner" : ""} ${elim ? "eliminated" : ""}" onclick="abrirPerfilClube('${t.id}')">
            <img loading="lazy" decoding="async" class="bracket-slot-crest" src="${obterUrlImagem(t,'clube')}" onerror="this.style.visibility='hidden'">
            <span class="bracket-slot-name">${t.nome}</span>
            <span class="bracket-slot-goals">${gols}</span>
            ${win ? '<span class="bracket-slot-check">✓</span>' : ""}
        </div>`;
    };
    return `<div class="bracket-slot ${isMeuJogo ? "meu-jogo" : ""} ${jogadoFinal ? "concluido" : "pendente"}">
        ${team(conf.timeA, placarA, conf.vencedorId === conf.timeA.id)}
        <div class="bracket-slot-mid"><span class="bracket-slot-vs">${subInfo || (jogadoFinal ? "FT" : "VS")}</span>${pen}</div>
        ${team(conf.timeB, placarB, conf.vencedorId === conf.timeB.id)}
    </div>`;
}

// Renderiza o conteúdo de UMA fase de grupos, sem o wrapper de título/bloco
// antigo — o título passa a viver na aba correspondente. Fases de mata-mata
// já não passam por aqui: são combinadas numa árvore única (ver
// renderArvoreHorizontalMataMata), em vez de uma aba por rodada.
function renderConteudoFaseUnica(faseObj) {
    let html = ``;
    if(faseObj.tipo === "grupos") {
        const avancam = faseObj.avancam || 2;
        let gridGrupos = `<div class="grupo-grid">`;
        faseObj.grupos.forEach(grp => {
            let tOrd = [...grp.equipas].sort((a,b) => b.pts - a.pts || (b.gf-b.gs) - (a.gf-a.gs));
            gridGrupos += `<div class="bracket-group-card">
                <div class="grupo-card-head"><h4>${grp.nome}</h4><span class="grupo-card-meta">${avancam} classificam</span></div>
                <table class="grupo-table"><thead><tr><th class="col-pos">#</th><th class="col-team">Clube</th><th>P</th><th>J</th><th>SG</th></tr></thead><tbody>
                ${tOrd.map((e,i) => {
                    let c = clubes.find(x=>x.id===e.id);
                    const rankClass = i===0?"rank-1":i===1?"rank-2":i===2?"rank-3":"";
                    const qualifica = i < avancam;
                    return `<tr class="${c?.id===jogador.clubeId?'bracket-row-me':''} ${qualifica?'row-qualifica':''} ${i===avancam-1?'linha-corte':''}" onclick="abrirPerfilClube('${c?.id}')">
                        <td class="col-pos"><span class="grupo-pos ${rankClass}">${i+1}</span></td>
                        <td class="col-team"><img loading="lazy" decoding="async" src="${obterUrlImagem(c,'clube')}" class="bracket-flag">${c?.nome||''}</td>
                        <td><strong>${e.pts}</strong></td><td>${e.j}</td><td>${e.gf-e.gs > 0 ? "+" : ""}${e.gf-e.gs}</td>
                    </tr>`;
                }).join("")}</tbody></table></div>`;
        });
        gridGrupos += `</div>`;
        html += gridGrupos;
    }
    return html;
}

// ==========================================
// ÁRVORE DE CHAVEAMENTO HORIZONTAL (mata-mata)
// ==========================================
// Combina TODAS as rodadas de mata-mata (Oitavas, Quartas, Semis, Final...) num
// único painel, lado a lado horizontalmente, com linhas conectoras precisas
// ligando cada par de confrontos ao confronto da rodada seguinte — em vez da
// navegação antiga por abas (uma rodada por vez).
// Agrupa as fases de mata-mata em "blocos" visuais. Um bloco é uma sequência
// de fases onde cada uma tem exatamente METADE dos confrontos da anterior
// (Oitavas -> Quartas -> Semis -> Final, o "chaveamento" normal). Sempre que
// isso quebra — por exemplo o Playoff da Fase de Liga (8 confrontos) que gera
// as Oitavas (também 8 confrontos, porque 8 vencedores se juntam a mais 8
// classificados diretos) — a fase seguinte começa um bloco novo. Sem isto, a
// árvore tentava centralizar/conectar confrontos que não têm relação de
// "pai/filho" real entre si, e alguns times apareciam meio soltos/desalinhados.
function agruparFasesMataMataEmBlocos(fasesMataMata) {
    const blocos = [];
    let blocoAtual = [];
    fasesMataMata.forEach((fase, i) => {
        if (i === 0) { blocoAtual = [fase]; return; }
        const anterior = fasesMataMata[i - 1];
        const meiaMetade = fase.confrontos.length * 2 === anterior.confrontos.length;
        if (meiaMetade) { blocoAtual.push(fase); }
        else { blocos.push(blocoAtual); blocoAtual = [fase]; }
    });
    if (blocoAtual.length) blocos.push(blocoAtual);
    return blocos;
}

function renderArvoreHorizontalMataMata(fasesMataMata) {
    if (!fasesMataMata || !fasesMataMata.length) return `<div style="width:100%; text-align:center; padding:40px; color:#aaa;">Sorteio ainda não realizado.</div>`;

    const blocos = agruparFasesMataMataEmBlocos(fasesMataMata);
    return blocos.map((bloco, i) => {
        const arvore = renderBlocoArvoreMataMata(bloco);
        if (i === 0) return arvore;
        // Separador visual entre blocos que não se conectam diretamente (ex: Playoff -> Oitavas),
        // deixando claro que times classificados diretamente entram aqui.
        return `<div class="bracket-tree-bloco-sep"><span>➔ classificados diretos entram na chave ➔</span></div>${arvore}`;
    }).join("");
}

function renderBlocoArvoreMataMata(fasesMataMata) {
    const MATCH_H = 120;  // altura de cada cartão de confronto (2 linhas de time + "vs" + padding)
    const GAP0 = 30;      // espaço vertical entre confrontos na 1ª rodada
    const UNIT = MATCH_H + GAP0;
    const COL_W = 232;    // largura de cada cartão/coluna
    const COL_GAP = 54;   // largura do corredor de linhas conectoras entre rodadas

    const nRounds = fasesMataMata.length;
    const nMatchesRound0 = fasesMataMata[0].confrontos.length;
    const totalHeight = Math.max(MATCH_H, nMatchesRound0 * UNIT - GAP0);

    // Pré-calcula o "top" (posição vertical) de cada confronto em cada rodada,
    // de forma que cada par da rodada r fique perfeitamente centrado sobre o
    // confronto correspondente da rodada r+1.
    const tops = fasesMataMata.map((fase, r) => {
        const mult = Math.pow(2, r);
        return fase.confrontos.map((_, i) => i * UNIT * mult + (UNIT * (mult - 1)) / 2);
    });

    const colunas = fasesMataMata.map((fase, r) => {
        const cardsHtml = fase.confrontos.map((conf, i) => {
            return `<div class="bracket-tree-match" style="top:${tops[r][i]}px; height:${MATCH_H}px; width:${COL_W}px;">${montarConfrontoCardHtml(conf)}</div>`;
        }).join("");
        return `<div class="bracket-tree-round" style="width:${COL_W}px;">
            <div class="bracket-tree-round-title">${fase.fase || `Rodada ${r+1}`}</div>
            <div class="bracket-tree-round-body" style="height:${totalHeight}px; width:${COL_W}px;">${cardsHtml}</div>
        </div>`;
    });

    // Linhas SVG conectando cada par de confrontos da rodada r ao confronto
    // correspondente da rodada r+1 (posições calculadas com a mesma fórmula
    // usada acima, então os pontos batem exatamente).
    const conectores = [];
    for (let r = 0; r < nRounds - 1; r++) {
        const topsR = tops[r];
        const paths = [];
        for (let i = 0; i < topsR.length; i += 2) {
            if (topsR[i+1] === undefined) continue;
            const yA = topsR[i] + MATCH_H/2;
            const yB = topsR[i+1] + MATCH_H/2;
            const yMid = (yA + yB) / 2;
            const half = COL_GAP/2;
            paths.push(`<path d="M0,${yA} H${half} M0,${yB} H${half} M${half},${yA} V${yB} M${half},${yMid} H${COL_GAP}" stroke="var(--theme-primary,#00ff88)" stroke-width="2" fill="none" opacity="0.5"/>`);
        }
        conectores.push(`<svg class="bracket-tree-connector" width="${COL_GAP}" height="${totalHeight}" viewBox="0 0 ${COL_GAP} ${totalHeight}" preserveAspectRatio="none">${paths.join("")}</svg>`);
    }

    let corpo = "";
    for (let r = 0; r < nRounds; r++) {
        corpo += colunas[r];
        if (r < nRounds - 1) corpo += conectores[r];
    }

    return `<div class="bracket-tree-scroll"><div class="bracket-tree">${corpo}</div></div>`;
}

// Monta a navegação por abas/seções do mata-mata (Fase de Grupos, Oitavas,
// Quartas, Semis, Final...). Cada aba mostra apenas os seus confrontos, em
// grid, sem exigir scroll vertical da página inteira para ver as chaves.
function renderChaveamentoComAbas(fases) {
    const listaFases = (fases || []).filter(f => f && (f.tipo === "grupos" || f.tipo === "mata-mata"));
    if (!listaFases.length) return `<div style="width:100%; text-align:center; padding:40px; color:#aaa; font-size:1.05rem;">Sorteio ainda não realizado.</div>`;

    const fasesGrupos = listaFases.filter(f => f.tipo === "grupos");
    const fasesMataMata = listaFases.filter(f => f.tipo === "mata-mata");

    // Cada fase de grupos continua com a sua própria aba. Todas as fases de
    // mata-mata (Oitavas, Quartas, Semis, Final...) são combinadas numa única
    // aba, mostradas como uma árvore horizontal conectada — em vez de forçar
    // o utilizador a trocar de aba para ver cada rodada isoladamente.
    const abas = fasesGrupos.map(f => ({ titulo: f.fase || "Fase de Grupos", conteudo: renderConteudoFaseUnica(f) }));
    if (fasesMataMata.length) {
        abas.push({
            titulo: fasesMataMata.length > 1 ? "Mata-Mata" : (fasesMataMata[0].fase || "Mata-Mata"),
            conteudo: renderArvoreHorizontalMataMata(fasesMataMata)
        });
    }

    const idxAtiva = abas.length - 1; // por padrão mostra a fase mais recente/atual
    const tabsHtml = abas.map((a, i) => `<button class="bracket-tab-btn ${i === idxAtiva ? 'ativo' : ''}" data-fase-tab="${i}" onclick="mudarAbaBracket(this, ${i})">${a.titulo}</button>`).join("");
    const panelsHtml = abas.map((a, i) => `<div class="bracket-tab-panel ${i === idxAtiva ? 'ativo' : ''}" data-fase-panel="${i}">${a.conteudo}</div>`).join("");

    return `<div class="bracket-tabs-wrap">
        <div class="bracket-tabs">${tabsHtml}</div>
        <div class="bracket-tab-panels">${panelsHtml}</div>
    </div>`;
}

// Alterna a aba ativa dentro do container mais próximo (permite múltiplas
// instâncias de chaveamento com abas na mesma página, se necessário).
window.mudarAbaBracket = function(btn, idx) {
    const wrap = btn.closest(".bracket-tabs-wrap");
    if (!wrap) return;
    wrap.querySelectorAll(".bracket-tab-btn").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    wrap.querySelectorAll(".bracket-tab-panel").forEach(p => p.classList.remove("ativo"));
    const painel = wrap.querySelector(`.bracket-tab-panel[data-fase-panel="${idx}"]`);
    if (painel) painel.classList.add("ativo");
};

function atualizarConteudoAbaAtiva() {
    let btnAtivo = document.querySelector(".menu-item.ativo"); if (!btnAtivo) return;
    let abaAtivaId = btnAtivo.dataset.view;

    if (abaAtivaId === "view-classificacao") { if (typeof inicializarInterfaceTabelasClean === 'function') inicializarInterfaceTabelasClean(); } 
    else if (abaAtivaId === "view-chaveamentos") {
        if (typeof renderizarChaveamentosVisuais === 'function') {
            let cs = document.getElementById("selectFiltroCopa")?.value;
            let container = document.getElementById("containerChaveamento");
            if (container) container.innerHTML = renderizarChaveamentosVisuais(cs);
        }
    }
    else if (abaAtivaId === "view-mercado") { if (typeof renderizarMercado === 'function') renderizarMercado(); }
    else if (abaAtivaId === "view-transferencias") { if (typeof renderizarTransferencias === 'function') renderizarTransferencias(); }
    else if (abaAtivaId === "view-selecoes") { if (typeof renderizarSelecoes === 'function') renderizarSelecoes(); }
    else if (abaAtivaId === "view-comp-int") { if (typeof renderizarCompeticoesInternacionais === 'function') renderizarCompeticoesInternacionais(); }
    else if (abaAtivaId === "view-manager") {
        if (typeof renderizarManager === 'function') renderizarManager();
        if (window.managerAbaAtiva) window.abrirAbaManager?.(window.managerAbaAtiva);
    }
    else if (abaAtivaId === "view-lifestyle") { if (typeof renderLifestyleSystem === 'function') renderLifestyleSystem(); }
    else if (abaAtivaId === "view-noticias") { if (typeof renderizarNoticias === 'function') renderizarNoticias(); }
    else if (abaAtivaId === "view-historico") { if (typeof renderizarHistorico === 'function') renderizarHistorico(); }
    else if (abaAtivaId === "view-tecnicos") { if (typeof renderizarTecnicos === 'function') renderizarTecnicos(); }
    else if (abaAtivaId === "view-atributos") { if (typeof renderizarAtributosJogador === 'function') renderizarAtributosJogador(); }
}

// Views onde o jogador está livremente a "passear" por competições/tabelas
// que podem não ser as suas. Nestas, a navegação lateral (menu) não repõe
// automaticamente o fundo do jogador — mas o fundo MUDA dinamicamente
// conforme a liga/copa que estiver a ser visualizada (ver exibirTabelaLigaCodigo
// e exibirCompeticaoEliminatoriaCodigo), e é restaurado ao sair para outra secção.
const VIEWS_EXPLORACAO_LIVRE = ["view-classificacao", "view-chaveamentos", "view-comp-int", "view-selecoes"];

// ==========================================
// 📱 MENU LATERAL RETRÁTIL (mobile/tablet)
// ==========================================
// Em telas largas a sidebar fica sempre visível (como sempre foi). Abaixo do
// breakpoint definido no CSS, ela vira uma gaveta escondida fora da tela —
// estas funções abrem/fecham essa gaveta e escurecem o fundo (overlay).

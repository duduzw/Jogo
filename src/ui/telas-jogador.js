const GRUPOS_ATRIBUTOS_JOGADOR = [
    { titulo: "⚽ Ataque & Técnica", campos: [["finalizacao", "Finalização"], ["drible", "Drible"], ["passe", "Passe"], ["cabeceamento", "Cabeceamento"]] },
    { titulo: "💪 Físico", campos: [["velocidade", "Velocidade"], ["forca", "Força"], ["resistencia", "Resistência"]] },
    { titulo: "🛡️ Defesa & Inteligência", campos: [["defesa", "Defesa"], ["inteligencia", "Inteligência"]] },
    { titulo: "🧤 Guarda-Redes", campos: [["reflexos", "Reflexos"], ["reposicao", "Reposição"], ["jogoAereo", "Jogo Aéreo"]] }
];

function renderizarAtributosJogador() {
    const el = document.getElementById("view-atributos");
    if (!el || !jogador) return;
    const ehGoleiro = jogador.posicao === "Goleiro" || jogador.posicao === "Goleiro Libero";
    const moral = jogador.moral ?? 55;

    const barra = (rotulo, valor) => {
        const v = Math.max(1, Math.min(99, Math.round(valor)));
        const classe = classeForcaAtributo(v);
        return `<div class="atributo-jogador-linha">
            <span class="atributo-jogador-rotulo">${rotulo}</span>
            <div class="atributo-jogador-track"><div class="atributo-jogador-fill ${classe}" style="width:${v}%"></div></div>
            <span class="atributo-jogador-valor ${classe}">${v}</span>
        </div>`;
    };

    const grupos = GRUPOS_ATRIBUTOS_JOGADOR
        .filter(g => g.titulo !== "🧤 Guarda-Redes" || ehGoleiro) // grupo de goleiro só aparece pra quem joga no gol
        .map(g => `<div class="atributos-jogador-grupo"><h4>${g.titulo}</h4>${g.campos.map(([campo, rotulo]) => barra(rotulo, jogador[campo] ?? 60)).join("")}</div>`)
        .join("");

    // 🎯 Notas derivadas usadas na disputa de pênaltis (ver notaPenaltiCobranca/
    // notaPenaltiDefesa) — mostradas aqui pra dar contexto de onde vêm.
    const notaExtra = ehGoleiro
        ? barra("Nota de defesa em pênaltis", notaPenaltiDefesa({ ...jogador, isMe: true }))
        : barra("Nota de cobrança de pênaltis", notaPenaltiCobranca({ ...jogador, isMe: true }));

    el.innerHTML = `
        <div class="dashboard-card atributos-jogador-header">
            <img src="${obterUrlImagem(jogador, 'jogador')}" onerror="this.style.visibility='hidden'" class="atributos-jogador-foto">
            <div>
                <h2 style="margin:0;">${jogador.nome}</h2>
                <p style="margin:4px 0 0; color:var(--text-muted);">${jogador.posicao} • ${jogador.idade || "?"} anos • ${jogador.nacionalidade || "—"}</p>
            </div>
            <div class="atributos-jogador-geral">
                <span>OVR</span>
                <strong>${jogador.geral ?? "—"}</strong>
            </div>
            <div class="atributos-jogador-geral">
                <span>Moral</span>
                <strong class="${classeForcaAtributo(moral)}">${moral}</strong>
            </div>
            <div class="atributos-jogador-geral">
                <span>Nível ${jogador.nivel ?? 1}</span>
                <strong style="font-size:1.1rem;">${jogador.xp ?? 0}/${jogador.xpProximoNivel ?? 100} XP</strong>
            </div>
            <div class="atributos-jogador-geral">
                <span>Pontos de treino</span>
                <strong class="${(jogador.pontosTreino || 0) > 0 ? "forte" : ""}">${jogador.pontosTreino ?? 0}</strong>
            </div>
        </div>
        <div class="atributos-jogador-grid">${grupos}</div>
        <div class="atributos-jogador-grupo">
            <h4>🎯 Pênaltis (nota derivada)</h4>
            ${notaExtra}
            <p style="margin:8px 0 0; color:var(--text-muted); font-size:.8rem;">Calculada a partir dos atributos acima — não é um atributo treinável à parte.</p>
        </div>`;
}

// 📜 HALL DA FAMA — antes a view existia no HTML mas nenhuma função a
// preenchia (a tabela #corpoHistorico ficava sempre vazia). Os dados em si
// já eram gravados certinho em jogador.historicoCarreira (ano a ano) e em
// jogador.titulosSelecao (troféus pela seleção) — só faltava mesmo desenhar.
function renderizarHistorico() {
    const el = document.getElementById("view-historico");
    if(!el) return;
    // 📖 O resumo de carreira fica disponível o tempo todo — enquanto o
    // jogador ainda está ativo, mostra o progresso ATÉ AGORA (não precisa
    // aposentar pra ver estatísticas e troféus já conquistados).
    const hist = jogador.historicoCarreira || [];

    const carreira = obterEstatisticasCarreira(jogador);
    const sel = jogador.statsSelecao || { jogos: 0, gols: 0, assistencias: 0 };
    const jogouPelaSelecao = sel.jogos > 0 || (jogador.titulosSelecao || []).length > 0;

    // Conta cada troféu distinto ganho ao longo da carreira: de clube +
    // prêmios individuais (guardados como texto em historicoCarreira.trofeus)
    // e troféus pela seleção (guardados à parte em titulosSelecao).
    const contagemTrofeus = {};
    hist.forEach(h => {
        if (!h.trofeus || h.trofeus === "-") return;
        h.trofeus.split(",").map(t => t.trim()).filter(Boolean).forEach(nome => {
            contagemTrofeus[nome] = (contagemTrofeus[nome] || 0) + 1;
        });
    });
    (jogador.titulosSelecao || []).forEach(t => {
        contagemTrofeus[t.trofeu] = (contagemTrofeus[t.trofeu] || 0) + 1;
    });
    const trofeusOrdenados = Object.entries(contagemTrofeus).sort((a,b) => b[1] - a[1]);
    const totalTrofeus = Object.values(contagemTrofeus).reduce((a,b) => a+b, 0);

    const linhasTabela = hist.map(h => `
        <tr>
            <td>${h.ano}</td>
            <td>${h.clube}</td>
            <td>${h.jogos}</td>
            <td>${h.gols}</td>
            <td>${h.trofeus && h.trofeus !== "-" ? h.trofeus.split(",").map(t => `<span class="hof-trofeu-tag">🏆 ${t.trim()}</span>`).join(" ") : `<span style="color:#666;">—</span>`}</td>
        </tr>`).join("");

    el.innerHTML = `
        <div class="dashboard-card hof-header">
            <div class="hof-avatar"><img loading="lazy" decoding="async" src="${jogador.foto || ''}" onerror="this.style.display='none'"><span>🐐</span></div>
            <div>
                <span style="text-transform:uppercase; font-weight:900; color:var(--gold); letter-spacing:1px; font-size:0.8rem;">📜 Hall da Fama</span>
                <h2 style="margin:6px 0;">${jogador.nome}</h2>
                <p style="margin:0; color:#aaa;">${hist.length} temporada${hist.length === 1 ? "" : "s"} de carreira registada${hist.length === 1 ? "" : "s"} • ${jogador.aposentado ? `Carreira encerrada em ${jogador.anoAposentadoria || anoAtual}` : "Carreira em andamento"}</p>
            </div>
        </div>
        <p style="text-transform:uppercase; font-size:0.75rem; font-weight:800; letter-spacing:1px; color:#888; margin:18px 4px 6px;">⚽ Carreira de clube</p>
        <div class="hof-stats-grid">
            <div class="hof-stat-card"><strong>${carreira.jogos}</strong><span>Jogos</span></div>
            <div class="hof-stat-card"><strong>${carreira.gols}</strong><span>Gols</span></div>
            <div class="hof-stat-card"><strong>${carreira.assistencias}</strong><span>Assistências</span></div>
            <div class="hof-stat-card destaque"><strong>${totalTrofeus}</strong><span>Troféus</span></div>
        </div>
        ${jogouPelaSelecao ? `
        <p style="text-transform:uppercase; font-size:0.75rem; font-weight:800; letter-spacing:1px; color:#888; margin:18px 4px 6px;">🌍 Carreira pela seleção</p>
        <div class="hof-stats-grid">
            <div class="hof-stat-card"><strong>${sel.jogos}</strong><span>Jogos</span></div>
            <div class="hof-stat-card"><strong>${sel.gols}</strong><span>Gols</span></div>
            <div class="hof-stat-card"><strong>${sel.assistencias}</strong><span>Assistências</span></div>
            <div class="hof-stat-card destaque"><strong>${(jogador.titulosSelecao || []).length}</strong><span>Títulos</span></div>
        </div>` : ""}
        <div class="dashboard-card" style="padding:25px; margin-top:18px;">
            <h3 style="margin:0 0 16px;">🏆 Vitrine de Troféus</h3>
            ${trofeusOrdenados.length ? `<div class="hof-trofeu-grid">
                ${trofeusOrdenados.map(([nome, qtd]) => `
                    <div class="hof-trofeu-item" title="${nome}">
                        <img loading="lazy" decoding="async" src="${obterUrlImagem(nome, 'trofeu')}" onerror="this.outerHTML='<span class=&quot;hof-trofeu-fallback&quot;>🏆</span>'">
                        <span>${nome}</span>
                        ${qtd > 1 ? `<em>×${qtd}</em>` : ""}
                    </div>`).join("")}
            </div>` : `<p style="color:#aaa;">Ainda sem troféus. A glória está por vir! 🌱</p>`}
        </div>
        <div class="dashboard-card" style="padding:25px; margin-top:18px;">
            <h3 style="margin:0 0 15px 0;">📅 O Teu Legado, Ano a Ano</h3>
            <table class="data-table">
                <thead><tr><th>Ano</th><th>Clube</th><th>Partidas</th><th>Golos</th><th>Troféus</th></tr></thead>
                <tbody id="corpoHistorico">${linhasTabela || `<tr><td colspan="5" style="text-align:center; color:#aaa; padding:20px;">Ainda sem temporadas completas registadas. Avança de época para começar a escrever a tua história.</td></tr>`}</tbody>
            </table>
        </div>`;
}

// 👔 GALERIA DE TÉCNICOS — todos os treinadores (curados ou gerados), com
// foto (Wikipedia, buscada sob demanda por obterUrlImagem/carregarFotoTecnico),
// clube ou seleção atual, nacionalidade, estilo de jogo e reputação. Filtro
// de texto reconstrói só a grade (desenharGridTecnicos), não a view inteira.
const ROTULOS_ESTILO_TECNICO = { pressao: "Pressão", posse: "Posse de Bola", retranca: "Retranca", contra: "Contra-Ataque", equilibrado: "Equilibrado" };

function renderizarTecnicos() {
    const el = document.getElementById("view-tecnicos");
    if (!el) return;
    el.innerHTML = `
        <div class="dashboard-card" style="padding:25px;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:15px; flex-wrap:wrap; margin-bottom:18px;">
                <h3 style="margin:0;">👔 Técnicos <span style="color:#888; font-weight:400; font-size:0.95rem;">(${(treinadoresIA || []).length})</span></h3>
                <input type="text" id="filtroTecnicos" placeholder="🔎 Nome, clube, seleção ou nacionalidade..." style="flex:1; min-width:220px; max-width:420px; padding:10px 14px; border-radius:8px; border:1px solid #333; background:#18181b; color:#fff;">
            </div>
            <div id="gridTecnicos" class="tecnicos-grid"></div>
        </div>`;
    document.getElementById("filtroTecnicos")?.addEventListener("input", (e) => desenharGridTecnicos(e.target.value));
    desenharGridTecnicos("");
}

function desenharGridTecnicos(filtro) {
    const grid = document.getElementById("gridTecnicos");
    if (!grid) return;
    const termo = _normalizarNomeParaComparacao(filtro);
    const lista = (treinadoresIA || []).filter(t => {
        if (!termo) return true;
        const clube = clubes.find(c => c.id === t.clubeId);
        const sel = (typeof SELECOES !== "undefined" && Array.isArray(SELECOES)) ? SELECOES.find(s => s.id === t.selecaoId) : null;
        const alvo = [t.nome, t.nacionalidade, clube?.nome, sel?.pais || sel?.nome].filter(Boolean).map(_normalizarNomeParaComparacao).join(" ");
        return alvo.includes(termo);
    }).sort((a, b) => (b.reputacao || 0) - (a.reputacao || 0));

    if (!lista.length) { grid.innerHTML = `<p style="color:#aaa; grid-column:1/-1;">Nenhum técnico encontrado para "${filtro}".</p>`; return; }

    grid.innerHTML = lista.map(t => {
        const clube = clubes.find(c => c.id === t.clubeId);
        const sel = (typeof SELECOES !== "undefined" && Array.isArray(SELECOES)) ? SELECOES.find(s => s.id === t.selecaoId) : null;
        const vinculo = clube ? `⚽ ${clube.nome}` : (sel ? `🌍 ${sel.pais || sel.nome}` : `<span style="color:#666;">Sem clube</span>`);
        return `
        <button type="button" class="tecnico-card" onclick="window.abrirPerfilTecnico('${t.id}')" title="Ver histórico de ${t.nome}">
            <img loading="lazy" decoding="async" class="tecnico-foto" data-tecnico-id="${t.id}" src="${obterUrlImagem(t, 'tecnico')}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(t.nome)}&background=27272a&color=00ff88'">
            <p class="tecnico-nome">${t.nome}</p>
            <p class="tecnico-vinculo">${vinculo}</p>
            <div class="tecnico-meta"><span>🌐 ${t.nacionalidade || "—"}</span></div>
            <span class="tecnico-estilo-chip">${ROTULOS_ESTILO_TECNICO[t.estiloJogo] || t.estiloJogo || "—"}</span>
            <div class="tecnico-rep">⭐ ${t.reputacao ?? "-"} REP</div>
            <small style="display:block; margin-top:9px; color:#9ca3af; font-size:0.68rem;">Clique para ver histórico</small>
        </button>`;
    }).join("");
}

// Perfil clicável do técnico. O histórico é mantido no próprio save e registra
// cada passagem por clube a partir do início da carreira.
window.abrirPerfilTecnico = function(tecnicoId) {
    const t = (treinadoresIA || []).find(x => x.id === tecnicoId);
    if (!t) return;
    const clubeAtual = clubes.find(c => c.id === t.clubeId);
    const selecaoAtual = (typeof SELECOES !== "undefined" && Array.isArray(SELECOES)) ? SELECOES.find(s => s.id === t.selecaoId) : null;
    garantirHistoricoTecnico(t, clubeAtual, selecaoAtual);
    const historico = [...(t.historicoTecnico || [])].reverse();
    const vinculo = clubeAtual ? `⚽ ${clubeAtual.nome}` : (selecaoAtual ? `🌍 ${selecaoAtual.pais || selecaoAtual.nome}` : "Livre no mercado");
    const linhas = historico.length ? historico.map(h => {
        const periodo = h.fim ? `${h.inicio}–${h.fim}` : `${h.inicio}–atual`;
        return `<tr><td>${periodo}</td><td>${h.nome}</td><td>${h.motivo || "Em atividade"}</td></tr>`;
    }).join("") : `<tr><td colspan="3" style="color:#aaa; text-align:center; padding:14px;">Ainda sem passagens registadas.</td></tr>`;
    const modal = document.createElement("div");
    modal.id = "modalPerfilTecnico";
    modal.className = "modal";
    modal.style.cssText = "z-index:1100; background:rgba(0,0,0,0.85); backdrop-filter:blur(6px);";
    modal.innerHTML = `
        <div class="coach-talk-card" style="width:min(660px, 94vw); max-height:88vh; overflow:auto; border-top-color:var(--theme-primary);">
            <button class="close-btn" id="btnFecharPerfilTecnico" style="float:right;">✖</button>
            <div style="display:flex; gap:16px; align-items:center; padding-right:26px;">
                <img loading="lazy" decoding="async" data-tecnico-id="${t.id}" src="${obterUrlImagem(t, 'tecnico')}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(t.nome)}&background=27272a&color=00ff88'" style="width:82px; height:82px; object-fit:cover; border-radius:50%; border:3px solid var(--theme-primary);">
                <div><span class="coach-talk-tag">👔 Perfil de técnico</span><h2 style="margin:7px 0 4px;">${t.nome}</h2><p style="margin:0; color:#aaa;">${vinculo}</p></div>
            </div>
            <div class="hof-stats-grid" style="margin:20px 0 18px;">
                <div class="hof-stat-card"><strong>${t.reputacao ?? "-"}</strong><span>Reputação</span></div>
                <div class="hof-stat-card"><strong>${t.temporadasNoCargo || 0}</strong><span>Temporadas</span></div>
                <div class="hof-stat-card"><strong>${t.titulos || 0}</strong><span>Títulos</span></div>
                <div class="hof-stat-card"><strong>${t.demissoes || 0}</strong><span>Demissões</span></div>
            </div>
            <p style="margin:0 0 6px; color:#aaa; font-size:.86rem;">🌐 ${t.nacionalidade || "—"} &nbsp; • &nbsp; ${ROTULOS_ESTILO_TECNICO[t.estiloJogo] || t.estiloJogo || "—"} &nbsp; • &nbsp; ${t.curado ? "Configurado na database" : "Técnico genérico"}</p>
            <h3 style="margin:20px 0 8px;">Histórico de clubes</h3>
            <div style="overflow:auto;"><table class="tabela-historico"><thead><tr><th>Período</th><th>Clube / Seleção</th><th>Saída</th></tr></thead><tbody>${linhas}</tbody></table></div>
        </div>`;
    document.body.appendChild(modal);
    document.getElementById("btnFecharPerfilTecnico").onclick = () => modal.remove();
};

function renderizarNoticias() {
    const el = document.getElementById("view-noticias");
    if(!el) return;
    const noticias = [...eventosRecentes, ...feedNoticias].slice(0, 50);
    const categoriaEstilo = {
        "Mercado": { icone: "💰", cor: "#22c55e" }, "Seleções": { icone: "🌍", cor: "#3b82f6" }, "Prémios": { icone: "🏆", cor: "#eab308" },
        "Treino": { icone: "🏋️", cor: "#f97316" }, "Lesão": { icone: "🩹", cor: "#ef4444" }, "Entrevista": { icone: "🎤", cor: "#a855f7" },
        "Mídia": { icone: "📺", cor: "#ec4899" }, "Rumor": { icone: "🔍", cor: "#94a3b8" }, "Olheiros": { icone: "🔭", cor: "#06b6d4" },
        "Bastidores": { icone: "🗣️", cor: "#f59e0b" }, "Tática": { icone: "📋", cor: "#0ea5e9" }, "Torcida": { icone: "📣", cor: "#facc15" },
        "Base": { icone: "🌱", cor: "#4ade80" }, "Manager": { icone: "👔", cor: "#818cf8" }, "Partida": { icone: "⚽", cor: "#16a34a" },
        "Finanças": { icone: "🏦", cor: "#10b981" }, "Mundo": { icone: "🌐", cor: "#38bdf8" }, "Números": { icone: "📊", cor: "#c084fc" },
        "Marketing": { icone: "📢", cor: "#f472b6" }, "Arbitragem": { icone: "🟨", cor: "#eab308" }, "Calendário": { icone: "🗓️", cor: "#60a5fa" },
        "Clássico": { icone: "🔥", cor: "#f87171" }
    };
    const categoriasPresentes = [...new Set(noticias.map(n => (n.data || "").split(" • ")[0]).filter(Boolean))];
    const filtroAtivo = window._filtroNoticiaAtivo || null;
    const noticiasFiltradas = filtroAtivo ? noticias.filter(n => (n.categoria || (n.data || "").split(" • ")[0]) === filtroAtivo) : noticias;
    el.innerHTML = `
        <div class="dashboard-card" style="padding:25px; border-top:4px solid #3b82f6;">
            <h2 style="margin-top:0;">📰 Central de Notícias</h2>
            ${categoriasPresentes.length ? `<div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:18px;">
                <span class="noticia-filtro-chip ${!filtroAtivo ? "ativo" : ""}" style="--chip-cor:#94a3b8;" onclick="window.filtrarNoticias(null)">🗞️ Todas</span>
                ${categoriasPresentes.map(cat => {
                    const est = categoriaEstilo[cat] || { icone: "📰", cor: "#94a3b8" };
                    return `<span class="noticia-filtro-chip ${filtroAtivo === cat ? "ativo" : ""}" style="--chip-cor:${est.cor};" onclick="window.filtrarNoticias('${cat}')">${est.icone} ${cat}</span>`;
                }).join("")}
            </div>` : ""}
            <div style="display:grid; gap:16px;">
                ${noticiasFiltradas.length ? noticiasFiltradas.map(n => {
                    const cat = n.categoria || (n.data || "").split(" • ")[0];
                    const est = categoriaEstilo[cat] || { icone: "📰", cor: "#3b82f6" };
                    const img = n.refImagem ? obterUrlImagem(n.refImagem, n.tipoImagem || 'jogador') : "";
                    if (n.formato === "manchete") {
                        return `
                        <div class="noticia-manchete-card">
                            <span class="noticia-manchete-tag">🔴 ÚLTIMA HORA</span>
                            <div class="noticia-manchete-body">
                                ${img ? `<img loading="lazy" decoding="async" class="noticia-manchete-img" src="${img}" onerror="this.remove()">` : ""}
                                <div>
                                    <h2 class="noticia-manchete-headline">${n.manchete}</h2>
                                    <p class="noticia-manchete-texto">${n.corpo}</p>
                                    <span class="noticia-manchete-cat" style="color:${est.cor};">${est.icone} ${cat} • ${n.data}</span>
                                </div>
                            </div>
                        </div>`;
                    }
                    if (n.formato === "post") {
                        return `
                        <div class="noticia-post-card">
                            <div class="noticia-post-header">
                                ${img ? `<img loading="lazy" decoding="async" class="noticia-post-avatar" src="${img}" onerror="this.outerHTML='<div class=&quot;noticia-post-avatar-fallback&quot;>${est.icone}</div>'">` : `<div class="noticia-post-avatar-fallback">${est.icone}</div>`}                                <div>
                                    <strong>${n.handle || "@ImprensaGlobal"}${n.verificado === false ? "" : " ✔️"}</strong>
                                    <span class="noticia-post-cat" style="color:${est.cor};">${est.icone} ${cat}</span>
                                </div>
                            </div>
                            <p class="noticia-post-manchete">${n.manchete}</p>
                            <p class="noticia-post-corpo">${n.corpo}</p>
                            <div class="noticia-post-footer">
                                <span>❤️ ${(n.curtidas || 0).toLocaleString('pt-BR')}</span>
                                <span>💬 ${Math.max(1, Math.round((n.curtidas || 100) / 38))}</span>
                                <span>🔁 ${Math.max(0, Math.round((n.curtidas || 100) / 90))}</span>
                            </div>
                        </div>`;
                    }
                    return `
                    <div class="noticia-jornal-card">
                        <div class="noticia-jornal-masthead"><span>${est.icone} ${cat.toUpperCase()}</span><span>${n.data}</span></div>
                        <div class="noticia-jornal-body">
                            ${img ? `<img loading="lazy" decoding="async" class="noticia-jornal-img" src="${img}" onerror="this.remove()">` : ""}
                            <div>
                                <h3 class="noticia-jornal-headline">${n.manchete}</h3>
                                <p class="noticia-jornal-texto">${n.corpo}</p>
                            </div>
                        </div>
                    </div>`;
                }).join("") : `<p style="color:#aaa;">Sem notícias nesta categoria por enquanto.</p>`}
            </div>
        </div>`;
}

// Filtra o feed de notícias por categoria (clique num chip). Passar null
// remove o filtro e volta a mostrar tudo.
window.filtrarNoticias = function(categoria) {
    window._filtroNoticiaAtivo = categoria;
    renderizarNoticias();
};

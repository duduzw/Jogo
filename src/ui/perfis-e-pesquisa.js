function dispararAnimacaoCampeao(nomeTime, nomeCompeticao, logoTimeUrl) {
    const modal = document.createElement("div");
    modal.className = "modal-campeao";
    modal.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,30,0.98)); z-index:10000; display:flex; flex-direction:column; align-items:center; justify-content:center; animation:fadeIn 0.5s ease-out; overflow:hidden; text-align:center; padding:20px;";

    // Enhanced confetti
    for (let i = 0; i < 200; i++) {
        let confete = document.createElement("div");
        confete.className = "confete";
        confete.style.cssText = `
            position: absolute;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${["#ffd700", "#ffffff", "#00ff88", "#ff4444", "#00a2e0", "#ff69b4"][Math.floor(Math.random() * 6)]};
            left: ${Math.random() * 100}vw;
            top: -20px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            animation: cairConfete ${Math.random() * 3 + 2}s linear infinite;
            opacity: ${Math.random() * 0.5 + 0.5};
        `;
        modal.appendChild(confete);
    }

    const trofeuUrl = obterUrlImagem(nomeCompeticao, 'trofeu');
    const conteudo = document.createElement("div");
    conteudo.style.cssText = "position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; max-width:90vw;";
    conteudo.innerHTML = `
        <div style="width:170px; height:170px; margin-bottom:6px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:5.5rem; background:radial-gradient(circle at 35% 30%, #fff7ad, #facc15 40%, #b45309 78%); box-shadow:0 0 40px rgba(250,204,21,0.4); animation:popIn 0.6s ease-out both, erguerTaca 1.6s ease-in-out 0.6s infinite alternate, glowTaca 1.6s ease-in-out 0.6s infinite alternate; padding:20px; overflow:hidden;">
            <img loading="lazy" decoding="async" src="${trofeuUrl}" alt="${nomeCompeticao}" style="width:100%; height:100%; object-fit:contain;" onerror="this.outerHTML='🏆'">
        </div>
        <span style="color:#facc15; font-weight:900; text-transform:uppercase; letter-spacing:2px; font-size:0.95rem; margin-top:10px; opacity:0; animation:popIn 0.5s ease-out 0.3s forwards;">🏆 Campeão</span>
        <h1 style="margin:6px 0 2px; font-size:2.5rem; color:#fff; text-transform:uppercase; text-shadow:0 0 24px rgba(255,255,255,0.25); opacity:0; animation:popIn 0.5s ease-out 0.42s forwards;">${nomeCompeticao}</h1>
        <div style="display:flex; align-items:center; gap:14px; margin-top:14px; opacity:0; animation:popIn 0.5s ease-out 0.55s forwards;">
            ${logoTimeUrl ? `<img loading="lazy" decoding="async" src="${logoTimeUrl}" alt="${nomeTime}" style="width:56px; height:56px; object-fit:contain; background:#fff; border-radius:12px; padding:6px;" onerror="this.style.display='none'">` : ""}
            <span style="font-size:1.4rem; font-weight:900; color:#facc15;">${nomeTime}</span>
        </div>
        <button id="btnFecharModalCampeao" style="margin-top:32px; padding:14px 38px; background:linear-gradient(90deg, #facc15, #f59e0b); color:#000; border:none; border-radius:12px; font-weight:900; font-size:1rem; cursor:pointer; text-transform:uppercase; box-shadow:0 12px 26px rgba(250,204,21,0.25); opacity:0; animation:popIn 0.5s ease-out 0.7s forwards;">Continuar ➔</button>
    `;
    modal.appendChild(conteudo);
    document.body.appendChild(modal);

    const fechar = () => modal.remove();
    conteudo.querySelector("#btnFecharModalCampeao").onclick = fechar;
    modal.addEventListener("click", (e) => { if (e.target === modal) fechar(); });
    setTimeout(fechar, 9000); // fecha sozinho se ninguém clicar
}

// ==========================================
// 🔎 PESQUISA E PERFIS
// ==========================================
document.getElementById("inputPesquisa")?.addEventListener("input", (e) => {
    let q = normalizarTexto(e.target.value);
    let resBox = document.getElementById("resultadoPesquisa");
    let modalP = document.getElementById("modalPesquisa");
    if(q.length < 3) { if(resBox) resBox.innerHTML = "<p style='text-align:center; color:#aaa; font-size:1.2rem; margin-top:40px;'>Digite pelo menos 3 letras para pesquisar...</p>"; return; }
    
    let resJ = jogadoresIA.filter(j => normalizarTexto(j.nome).includes(q));
    let resC = clubes.filter(c => normalizarTexto(c.nome).includes(q));
    let resS = SELECOES.filter(s => normalizarTexto(s.nome).includes(q) || normalizarTexto(s.pais).includes(q));
    let html = "";
    resS.forEach(s => {
        const titulos = selecoesEstado.campeoes?.[s.id]?.length || 0;
        html += `<div style="background:rgba(0,0,0,0.5); padding:15px; border-radius:8px; border:1px solid var(--border); margin-bottom:10px; cursor:pointer; display:flex; align-items:center;" onclick="abrirPerfilSelecao('${s.id}')"><img loading="lazy" decoding="async" src="${s.logo}" style="width:60px; height:42px; margin-right:20px; object-fit:cover; border-radius:6px;"><div><h4 style="margin:0; font-size:1.3rem; color:var(--warning);">Seleção ${s.nome}</h4><p style="margin:0; font-size:0.95rem; color:#aaa;">${s.conf} • Força ${Math.round(calcularForcaSelecao(s.id))} • ${titulos} título(s)</p></div></div>`;
    });
    resC.forEach(c => html += `<div style="background:rgba(0,0,0,0.5); padding:15px; border-radius:8px; border:1px solid var(--border); margin-bottom:10px; cursor:pointer; display:flex; align-items:center;" onclick="abrirPerfilClube('${c.id}')"><img loading="lazy" decoding="async" src="${obterUrlImagem(c, 'clube')}" style="border-radius:8px; width:60px; height:60px; margin-right:20px; object-fit: contain;"><div><h4 style="margin:0; font-size:1.3rem; color:var(--success);">${c.nome}</h4><p style="margin:0; font-size:0.95rem; color:#aaa;">OVR: ${c.reputacao} | Orçamento: ${formatarMoeda(c.orcamento||0)}</p></div></div>`);
    resJ.forEach(j => html += `<div style="background:rgba(0,0,0,0.5); padding:15px; border-radius:8px; border:1px solid var(--border); margin-bottom:10px; cursor:pointer; display:flex; align-items:center;" onclick="abrirPerfilJogador('${j.id}')"><img loading="lazy" decoding="async" src="${obterUrlImagem(j, 'jogador')}" style="width:60px; height:60px; margin-right:20px; border-radius:50%; filter: ${j.aposentado ? 'grayscale(100%)' : 'none'}; object-fit: cover;"><div><h4 style="margin:0; font-size:1.3rem; color:var(--theme-primary);">${j.nome} ${j.aposentado ? '<span class="aposentado-tag">APOSENTADO</span>' : ''}</h4><p style="margin:5px 0 0; font-size:0.95rem; color:#ccc;">OVR: <strong style="color:#fff;">${j.geral}</strong> | ${j.posicao || 'Base'}</p></div></div>`);
    
    if(resBox) resBox.innerHTML = html || "<p style='text-align:center; font-size:1.2rem; color:#aaa;'>Nenhum resultado.</p>"; 
    if(modalP) modalP.classList.remove("oculto");
});
document.getElementById("btnFecharPesquisa")?.addEventListener("click", () => { let m = document.getElementById("modalPesquisa"); if(m) m.classList.add("oculto"); });
document.getElementById("btnFecharPerfil")?.addEventListener("click", () => { let m = document.getElementById("modalPerfilJogador"); if(m) m.classList.add("oculto"); });

window.abrirPerfilJogador = function(id) {
    let j = id === "player" ? jogador : jogadoresIA.find(x => x.id === id); if(!j) return;
    let cAtual = clubes.find(c => c.id === j.clubeId); 
    
    // Puxa a bandeira do banco de dados das seleções
    let selecaoInfo = obterSelecaoPorNacionalidade(j.nacionalidade);
    let bandeiraHTML = selecaoInfo.logo ? `<img loading="lazy" decoding="async" src="${selecaoInfo.logo}" style="width: 26px; height: 18px; border-radius: 3px; object-fit: cover; box-shadow: 0 0 5px rgba(0,0,0,0.6);">` : `🌍`;

    let conteudoHTML = `
        <div style="display: flex; gap: 30px; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #333;">
            <img loading="lazy" decoding="async" src="${obterUrlImagem(j, 'jogador')}" class="foto-perfil-gigante" style="${j.aposentado ? 'filter: grayscale(100%);' : ''}">
            <div style="flex-grow:1;">
                <h1 style="margin: 0; font-size: 3rem; text-transform: uppercase; color:var(--theme-primary); line-height: 1.1;">${j.nome} ${j.aposentado ? '<span class="aposentado-tag" style="font-size:1rem;">APOSENTADO</span>' : ''}</h1>
                
                <div style="display: flex; align-items: center; gap: 10px; margin: 8px 0; font-size: 1.1rem; color: #ccc; font-weight: bold; text-transform: uppercase;">
                    ${bandeiraHTML} <span>${j.nacionalidade}</span>
                </div>

                <p class="status-texto-grande" style="color: #fff; font-size: 1.8rem; margin:10px 0;">OVR: <strong style="color:var(--success); font-size:2.2rem;">${j.geral}</strong> | <span class='pos-badge pos-${(j.posicao||'').replace(" ","-")}'>${j.posicao || 'Base'}</span></p>
                <div style="display:flex; gap:30px; margin-top:20px;">
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Idade</span> <strong>${j.idade} Anos</strong></p>
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Clube</span> <strong style="color:var(--success); cursor:pointer; display:flex; align-items:center; gap:8px;" onclick="abrirPerfilClube('${j.clubeId}')"><img loading="lazy" decoding="async" src="${cAtual ? obterUrlImagem(cAtual, 'clube') : ''}" style="width:28px; height:28px; object-fit:contain; background:#fff; border-radius:6px; padding:2px;" onerror="this.style.display='none'">${cAtual ? cAtual.nome : (j.aposentado ? 'Lenda' : 'Livre')}</strong></p>
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Contrato</span> <strong>${j.contrato || 0} anos</strong></p>
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Mercado</span> <strong>${j.aposentado ? 'Lenda' : formatarMoeda(calcularValorMercadoJogador(j))}</strong></p>
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Felicidade</span> <strong>${Math.round(j.felicidade || 60)}/100</strong></p>
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Inteligência</span> <strong>${Math.round(j.inteligencia || 60)}/100</strong></p>
                    ${j.id === "player" || id === "player" ? `<p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Elenco</span> <strong style="color:var(--theme-primary);">${statusTitularidade()}</strong></p>` : ""}
                </div>
            </div>
            <button class="close-btn" style="position:absolute; top:20px; right:30px; font-size:2rem; background:none; border:none; color:#fff; cursor:pointer;" onclick="document.getElementById('modalPerfilJogador').classList.add('oculto')">✖</button>
        </div>
    `;
    
    // (O resto da função continua exatamente igual a partir daqui, começando por let st = id === "player"...)

    // ⚙️ ATRIBUTOS INDIVIDUAIS: barras com os 8 atributos do jogador. Cada
    // barra mostra o valor real e é colorida conforme o nível (vermelho fraco
    // → verde/dourado elite), para ficar fácil bater o olho e ver o perfil.
    const corBarraAtributo = (v) => v >= 85 ? "#facc15" : v >= 75 ? "#22c55e" : v >= 60 ? "#3b82f6" : v >= 45 ? "#f97316" : "#ef4444";
    const ATRIBUTOS_LABEL = j.posicao === "Goleiro"
        ? { reflexos: "🧤 Reflexos", jogoAereo: "🙌 Jogo Aéreo", reposicao: "🚀 Reposição", velocidade: "💨 Velocidade", passe: "🎯 Passe (curto)", resistencia: "🔋 Resistência", forca: "💪 Força" }
        : { finalizacao: "⚽ Finalização", velocidade: "💨 Velocidade", passe: "🎯 Passe", defesa: "🛡️ Carrinho", cabeceamento: "🦸 Cabeceamento", drible: "🌀 Drible", resistencia: "🔋 Resistência", forca: "💪 Força" };
    const htmlAtributos = `
        <div style="margin-top:18px; background:rgba(0,0,0,0.32); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:18px;">
            <h3 style="margin:0 0 14px; color:var(--theme-primary);">⚙️ Atributos</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px 20px;">
                ${Object.entries(ATRIBUTOS_LABEL).map(([campo, label]) => {
                    const v = Math.round(j[campo] ?? j.geral ?? 60);
                    const cor = corBarraAtributo(v);
                    return `<div>
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;"><span style="color:#ccc; font-weight:700;">${label}</span><span style="color:${cor}; font-weight:900;">${v}</span></div>
                        <div style="height:8px; background:rgba(255,255,255,0.08); border-radius:4px; overflow:hidden;"><div style="height:100%; width:${v}%; background:${cor}; border-radius:4px;"></div></div>
                    </div>`;
                }).join("")}
            </div>
        </div>`;

    let st = id === "player" ? j.estatisticasAtuais : (j.statsTemporada || {jogos:0, gols:0, assistencias:0});
    let carreiraTotal = obterEstatisticasCarreira(j);
    let compStatsHTML = j.statsCompeticoes ? Object.entries(j.statsCompeticoes).map(([cid, stc]) => {
        const comp = competicoes.find(c=>c.id===cid);
        return `<div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.08);"><strong style="color:var(--theme-primary);">${comp?.nome || cid}</strong><br><span style="color:#ccc;">${stc.jogos}J • ${stc.gols}G • ${stc.assistencias}A</span></div>`;
    }).join("") : "";
    let htmlStats = `
        <div style="display:flex; justify-content:space-around; text-align:center; background:rgba(0,0,0,0.4); padding:30px; border-radius:12px; border:1px solid #333; margin-top:20px;">
            <div><div style="font-size:3rem; color:#fff; font-weight:900; margin-bottom:10px;">${st.jogos || 0}</div><div style="font-size:1.1rem; color:#aaa; text-transform:uppercase; font-weight:bold;">Jogos na Época</div></div>
            <div><div style="font-size:3rem; color:var(--success); font-weight:900; margin-bottom:10px;">${st.gols || 0}</div><div style="font-size:1.1rem; color:#aaa; text-transform:uppercase; font-weight:bold;">Golos</div></div>
            <div><div style="font-size:3rem; color:var(--theme-primary); font-weight:900; margin-bottom:10px;">${st.assistencias || 0}</div><div style="font-size:1.1rem; color:#aaa; text-transform:uppercase; font-weight:bold;">Assistências</div></div>
        </div>
        ${["Zagueiro","Lateral","Goleiro"].includes(j.posicao) ? `
        <div style="display:flex; justify-content:space-around; text-align:center; background:rgba(0,0,0,0.32); padding:22px; border-radius:12px; border:1px solid rgba(168,85,247,0.3); margin-top:14px;">
            ${j.posicao === "Goleiro" ? `
            <div><div style="font-size:2.2rem; color:#a855f7; font-weight:900;">${st.defesas || 0}</div><div style="font-size:0.95rem; color:#aaa; text-transform:uppercase; font-weight:bold;">Defesas</div></div>
            ` : `
            <div><div style="font-size:2.2rem; color:#a855f7; font-weight:900;">${st.desarmes || 0}</div><div style="font-size:0.95rem; color:#aaa; text-transform:uppercase; font-weight:bold;">Desarmes</div></div>
            <div><div style="font-size:2.2rem; color:#a855f7; font-weight:900;">${st.interceptacoes || 0}</div><div style="font-size:0.95rem; color:#aaa; text-transform:uppercase; font-weight:bold;">Interceptações</div></div>
            `}
            <div><div style="font-size:2.2rem; color:var(--gold); font-weight:900;">${st.jogosSemSofrerGol || 0}</div><div style="font-size:0.95rem; color:#aaa; text-transform:uppercase; font-weight:bold;">Jogos sem Sofrer Gol</div></div>
        </div>` : ""}
        <div style="margin-top:18px; background:rgba(0,0,0,0.32); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:18px;">
            <h3 style="margin:0 0 12px; color:var(--gold);">Estatísticas de Carreira</h3>
            <div style="display:flex; gap:12px; flex-wrap:wrap;">
                <span class="meta-pill">${carreiraTotal.jogos} jogos</span><span class="meta-pill">${carreiraTotal.gols} gols</span><span class="meta-pill">${carreiraTotal.assistencias} assistências</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; margin-top:14px;">${compStatsHTML || "<p style='color:#aaa;'>Sem estatísticas por competição ainda.</p>"}</div>
        </div>`;

    let histHTML = (j.historicoCarreira && j.historicoCarreira.length > 0) ? j.historicoCarreira.map(h => `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding:15px 20px; background:rgba(255,255,255,0.02); margin-bottom:5px; border-radius:8px;">
            <span style="color:#aaa; width:90px; font-size:1.2rem; font-weight:bold;">${h.ano}${h.real ? '<br><small style="color:var(--gold); font-size:0.65rem;"></small>' : ''}</span> 
            <span style="flex-grow:1; display:flex; align-items:center; gap:12px; font-size:1.2rem; font-weight:bold;"><img loading="lazy" decoding="async" src="${obterUrlImagem(h.clube, 'clube')}" style="width:35px; height:35px; object-fit:contain; border-radius:8px;"> ${h.clube}</span> 
            <span style="font-weight:900; color:var(--success); min-width:150px; text-align:right; font-size:1.2rem;">⚽ ${h.gols} | 👟 ${h.assistencias||0} <span style="color:#aaa; font-size:1rem; font-weight:normal;">(${h.jogos || 0}J)</span></span>
        </div>`).join("") : "<div style='text-align:center; padding:30px; color:#aaa; font-size:1.2rem;'>Nenhum registo histórico.</div>";
    
    let premeadosHTML = agruparTrofeusJogador(j);

    const stSel = j.statsSelecao || { jogos:0, gols:0, assistencias:0, convocacoes:0 };
    const htmlSelecao = `
        <div class="selecao-perfil-hero">
            <img loading="lazy" decoding="async" src="${selecaoInfo.logo}" alt="${selecaoInfo.nome}" onerror="this.style.display='none'">
            <div>
                <span style="color:var(--theme-primary); font-weight:900; text-transform:uppercase; font-size:0.8rem;">Carreira internacional</span>
                <h3 style="margin:4px 0 0; font-size:1.6rem;">Seleção ${selecaoInfo.nome || j.nacionalidade}</h3>
                <p style="margin:4px 0 0; color:#aaa;">Números exclusivos pela seleção nacional</p>
            </div>
        </div>
        <div class="selecao-stats-panel">
            <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px;">
                <div class="selecao-stat-card"><strong>${stSel.jogos}</strong><span>Jogos</span></div>
                <div class="selecao-stat-card"><strong style="color:var(--success);">${stSel.gols}</strong><span>Gols</span></div>
                <div class="selecao-stat-card"><strong style="color:var(--theme-primary);">${stSel.assistencias}</strong><span>Assistências</span></div>
                <div class="selecao-stat-card"><strong style="color:var(--gold);">${stSel.convocacoes || 0}</strong><span>Convocações</span></div>
            </div>
            <p style="margin:16px 0 0; color:#cbd5e1; line-height:1.6;">Clube atual: <img loading="lazy" decoding="async" src="${cAtual ? obterUrlImagem(cAtual,'clube') : ''}" style="width:22px;height:22px;vertical-align:middle;border-radius:4px;background:#fff;padding:1px;" onerror="this.style.display='none'"> <strong>${cAtual?.nome || 'Livre'}</strong> — estatísticas de seleção são independentes do clube.</p>
            ${(j.titulosSelecao?.length) ? `<div style="margin-top:18px;"><h4 style="color:var(--gold); margin:0 0 10px;">Títulos pela Seleção</h4>${j.titulosSelecao.map(t => `<div class="card-conquista"><img loading="lazy" decoding="async" src="${obterUrlImagem(t.trofeu,'trofeu')}" class="trofeu-icon" style="width:44px;height:44px;"><div><strong style="color:var(--gold);">${t.trofeu}</strong><br><span style="color:#aaa;">${t.selecao} • ${t.ano}</span></div></div>`).join("")}</div>` : ""}
        </div>`;

    conteudoHTML += `
        <div style="display:flex; gap:15px; margin-top:10px; border-bottom:2px solid #333; padding-bottom:15px; flex-wrap:wrap;">
            <button id="btn-aba-stats" class="tab-btn-modal" onclick="mudarAbaModal('stats')" style="background:rgba(0, 255, 136, 0.1); color:var(--theme-primary); border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">Estatísticas Atuais</button>
            <button id="btn-aba-atributos" class="tab-btn-modal" onclick="mudarAbaModal('atributos')" style="background:none; color:#aaa; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">⚙️ Atributos</button>
            <button id="btn-aba-selecao" class="tab-btn-modal" onclick="mudarAbaModal('selecao')" style="background:none; color:#aaa; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">🌍 Seleção</button>
            <button id="btn-aba-hist" class="tab-btn-modal" onclick="mudarAbaModal('hist')" style="background:none; color:#aaa; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">Histórico de Épocas</button>
            <button id="btn-aba-premios" class="tab-btn-modal" onclick="mudarAbaModal('premios')" style="background:none; color:#aaa; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">🏆 Sala de Troféus</button>
        </div>
        <div id="aba-stats" class="aba-conteudo" style="margin-top:20px; overflow-y:auto; padding:0 10px;">${htmlStats}</div>
        <div id="aba-atributos" class="aba-conteudo" style="display:none; margin-top:20px; overflow-y:auto; padding:0 10px;">${htmlAtributos}</div>
        <div id="aba-selecao" class="aba-conteudo" style="display:none; margin-top:20px; overflow-y:auto; padding:0 10px;">${htmlSelecao}</div>
        <div id="aba-hist" class="aba-conteudo" style="display:none; margin-top:20px; overflow-y:auto; padding:0 10px;">${histHTML}</div>
        <div id="aba-premios" class="aba-conteudo" style="display:none; margin-top:20px; overflow-y:auto; padding:0 10px;">${premeadosHTML || `<p style="color:#aaa; font-size:1.2rem; text-align:center; padding:30px;">O museu particular está vazio.</p>`}</div>
    `;
    
    let modal = document.getElementById("modalPerfilJogador"); 
    if(modal) { let innerDiv = modal.querySelector(".modal-content") || modal.firstElementChild; innerDiv.innerHTML = conteudoHTML; modal.classList.remove("oculto"); mudarAbaModal('stats'); }
}

window.abrirPerfilClube = function(clubeId) {
    let c = clubes.find(x => x.id === clubeId); if(!c) return;
    const tecnicoObj = (treinadoresIA || []).find(t => t.clubeId === c.id);
    const fotoTecnicoHTML = tecnicoObj
        ? `<img loading="lazy" decoding="async" data-tecnico-id="${tecnicoObj.id}" src="${obterUrlImagem(tecnicoObj, 'tecnico')}" style="width:34px; height:34px; border-radius:50%; object-fit:cover; border:2px solid var(--theme-primary); vertical-align:middle; margin-right:8px;" onerror="this.style.display='none'">`
        : "";
    let conteudoHTML = `
        <div style="display: flex; gap: 30px; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #333;">
            <img loading="lazy" decoding="async" src="${obterUrlImagem(c, 'clube')}" class="foto-perfil-gigante" style="border-radius:16px; object-fit: contain !important;">
            <div style="flex-grow:1;">
                <h1 style="margin: 0; font-size: 3rem; text-transform: uppercase; color:var(--success);">${c.nome}</h1>
                <p class="status-texto-grande" style="color: #fff; font-size: 1.6rem; margin:15px 0;">OVR Plantel: <strong style="color:var(--success); font-size:2rem;">${c.reputacao}</strong></p>
                <div style="display:flex; gap:28px; margin-top:20px; flex-wrap:wrap;">
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Orçamento</span> <strong style="color:var(--gold);">${formatarMoeda(c.orcamento || 0)}</strong></p>
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Técnico</span> <strong ${tecnicoObj ? `style="cursor:pointer;" onclick="window.abrirPerfilTecnico('${tecnicoObj.id}')" title="Ver perfil do técnico"` : ""}>${fotoTecnicoHTML}${c.tecnico || "Interino"}${tecnicoObj?.nacionalidade ? ` <small style="color:#aaa; font-weight:400;">(${tecnicoObj.nacionalidade})</small>` : ""}</strong></p>
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Tática</span> <strong style="color:var(--theme-primary);">${c.tatica || "Equilibrado"}</strong></p>
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Scout</span> <strong>${c.inteligenciaMercado || 60}/100</strong></p>
                </div>
            </div>
            <button class="close-btn" style="position:absolute; top:20px; right:30px; font-size:2rem; background:none; border:none; color:#fff; cursor:pointer;" onclick="document.getElementById('modalPerfilJogador').classList.add('oculto')">✖</button>
        </div>
    `;
    
    let elenco = getElencoClube(c.id); 

    let htmlElenco = elenco.sort((a,b)=>b.geral - a.geral).map(j => `
        <div style="background:rgba(0,0,0,0.4); padding:15px; border-radius:12px; border:2px solid ${j.isMe ? 'var(--theme-primary)' : '#222'}; margin-bottom:12px; cursor:pointer; display:flex; align-items:center; transition:0.2s;" onclick="abrirPerfilJogador('${j.id}')">
            <img loading="lazy" decoding="async" src="${obterUrlImagem(j, 'jogador')}" style="width:60px; height:60px; border-radius:50%; margin-right:20px; object-fit:cover; border:3px solid ${j.isMe ? 'var(--theme-primary)' : 'transparent'};">
            <div style="flex-grow:1;">
                <div style="font-weight:900; font-size:1.3rem; color:${j.isMe ? 'var(--theme-primary)' : '#fff'};">${j.nome} ${j.isMe ? '<span style="font-size:0.8rem; background:var(--theme-primary); color:#000; padding:2px 6px; border-radius:4px;">TU</span>' : ''}</div>
                <div style="font-size:1rem; color:#ccc; margin-top:4px;">OVR: <strong style="color:var(--success); font-size:1.2rem;">${j.geral}</strong> | <span class='pos-badge pos-${(j.posicao||'').replace(" ","-")}'>${j.posicao || 'Base'}</span></div>
            </div>
            <div style="text-align:right; padding:10px; background:rgba(255,255,255,0.05); border-radius:8px;">
                <span style="font-size:0.9rem; color:#aaa; text-transform:uppercase;">Contrato</span><br><strong style="color:var(--warning); font-size:1.2rem;">${j.contrato||0} anos</strong>
            </div>
        </div>`).join("");

    let titulosHTML = agruparTrofeusClube(c) || "<div style='text-align:center; padding:30px; font-size:1.2rem; color:#aaa;'>O museu do clube está vazio.</div>";

    conteudoHTML += `
        <div style="display:flex; gap:15px; margin-top:10px; border-bottom:2px solid #333; padding-bottom:15px;">
            <button id="btn-aba-elenco" class="tab-btn-modal" onclick="mudarAbaModal('elenco')" style="background:rgba(0, 255, 136, 0.1); color:var(--theme-primary); border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">👥 Elenco Principal</button>
            <button id="btn-aba-trofeus" class="tab-btn-modal" onclick="mudarAbaModal('trofeus')" style="background:none; color:#aaa; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">🏆 Palmarés Histórico</button>
        </div>
        <div id="aba-elenco" class="aba-conteudo" style="margin-top:20px; overflow-y:auto; padding:0 10px;">${htmlElenco || "<p style='color:#aaa;'>Sem jogadores ativos.</p>"}</div>
        <div id="aba-trofeus" class="aba-conteudo" style="display:none; margin-top:20px; overflow-y:auto; padding:0 10px;">${titulosHTML}</div>
    `;
    let modal = document.getElementById("modalPerfilJogador"); 
    if(modal) { let innerDiv = modal.querySelector(".modal-content") || modal.firstElementChild; innerDiv.innerHTML = conteudoHTML; modal.classList.remove("oculto"); mudarAbaModal('elenco'); }
}

// ==========================================
// 💼 SISTEMA DE TRANSFERÊNCIAS E OVR
// ==========================================
// 💰 Orçamento de transferências a partir da reputação do clube — curva
// exponencial (não linear!) porque na vida real a diferença entre um gigante
// e um time pequeno é de ORDENS DE GRANDEZA, não só um múltiplo pequeno.
// Calibrada em dois pontos reais do próprio banco de clubes: reputação ~49
// (fundo da Série D) ≈ €60 mil; reputação ~92 (Real Madrid) ≈ €200 milhões.
// Usada tanto pelo mundo simulado (c.orcamento) quanto pelo Modo Manager
// (managerEstado.orcamentoTransferencias), pra nunca haver dois números
// diferentes de "quanto esse clube tem pra gastar".

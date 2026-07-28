// =====================================================================
// NEGOCIAÇÃO DE CONTRATO — renovação ou ingresso em novo clube.
// Simula uma "reunião" de negociação com propostas e contrapropostas,
// avaliadas de forma inteligente com base no orçamento/reputação do
// clube e no poder de negociação (leverage) do jogador.
// =====================================================================

// Oferta inicial "realista" de um clube: clubes grandes pagam bem acima
// do valor de mercado puro, oferecem mais anos e maiores luvas em
// transferências; clubes pequenos são mais conservadores.
function calcularOfertaInicialClube(clube, tipo) {
    const salarioRef = calcularSalarioSemanalJogador(clube);
    const fatorTipo = tipo === "renovacao" ? 1.0 : 0.9; // clube novo começa mais conservador
    const salario = Math.max(8000, Math.floor(salarioRef * fatorTipo * (0.9 + Math.random() * 0.18)));
    let anos = (clube.reputacao || 65) >= 82 ? ((jogador.idade || 24) < 29 ? 4 : 2) : ((jogador.idade || 24) < 26 ? 3 : 2);
    if (tipo !== "renovacao" && Math.random() < 0.3) anos = Math.max(2, anos - 1);
    const bonusGol = Math.max(300, Math.floor(salario * (0.025 + Math.random() * 0.03)));
    const bonusVitoria = Math.max(200, Math.floor(salario * (0.012 + Math.random() * 0.018)));
    const luvas = tipo === "renovacao" ? 0 : Math.floor(salario * (3 + Math.random() * 7));
    const direitosImagem = (clube.reputacao || 65) >= 80 ? 8 + Math.floor(Math.random() * 10) : 4 + Math.floor(Math.random() * 8);
    return { salario, anos, bonusGol, bonusVitoria, luvas, direitosImagem };
}

// Avalia a contraproposta do jogador do ponto de vista do clube: pesa o
// custo total pedido contra a capacidade orçamental do clube e o poder
// de negociação (leverage) do jogador naquele momento da carreira.
function avaliarContraPropostaClube(neg, pedido) {
    const clube = clubes.find(c => c.id === neg.clubeId);
    const oferta = neg.ofertaClube;
    const custoAnualPedido = pedido.salario * 52 + pedido.luvas + pedido.bonusGol * 8 + pedido.bonusVitoria * 12;
    const capacidadeOrcamental = Math.max((clube?.orcamento || 0) * 0.28, calcularSalarioSemanalJogador(clube) * 52 * 1.5);

    let leverage = 0.5;
    leverage += ((jogador.geral || 65) - (clube?.reputacao || 65)) / 110; // jogador melhor que o nível do clube = mais poder
    leverage += (jogador.contrato <= 1 ? 0.14 : -0.04); // perto de ficar livre = mais poder de barganha
    leverage += ((jogador.titularidade || 55) - 55) / 300;
    leverage += (propostasPendentes.filter(p => p.tipo !== "renovacao").length > 1 ? 0.1 : 0); // concorrência por ele
    leverage += (jogador.lifestyle?.multipliers?.negotiationMultiplier || 0);
    leverage = Math.max(0.12, Math.min(0.92, leverage));

    const razaoPedido = custoAnualPedido / capacidadeOrcamental;

    if (razaoPedido <= 0.82 + leverage * 0.28) {
        return { decisao: "aceitar", oferta: pedido };
    }
    if (razaoPedido <= 1.3 + leverage * 0.4 && neg.rodada < neg.maxRodadas) {
        const cede = 0.3 + leverage * 0.32;
        const nova = {
            salario: Math.floor(oferta.salario + (pedido.salario - oferta.salario) * cede),
            anos: Math.random() < 0.5 ? pedido.anos : oferta.anos,
            bonusGol: Math.max(0, Math.floor(oferta.bonusGol + (pedido.bonusGol - oferta.bonusGol) * cede)),
            bonusVitoria: oferta.bonusVitoria,
            luvas: Math.max(0, Math.floor(oferta.luvas + (pedido.luvas - oferta.luvas) * cede)),
            direitosImagem: Math.max(0, Math.min(50, Math.round(oferta.direitosImagem + (pedido.direitosImagem - oferta.direitosImagem) * cede)))
        };
        return { decisao: "contraproposta", oferta: nova };
    }
    if (neg.rodada >= neg.maxRodadas) return { decisao: "final", oferta: oferta };
    return { decisao: "recusar", oferta: oferta };
}

window.abrirNegociacaoRenovacao = function() {
    const clubeAtual = clubes.find(c => c.id === jogador.clubeId);
    if (!clubeAtual) { mostrarToast("Aviso", "Sem clube ativo para negociar.", "warning"); return; }
    
    // Check if club has rejected player previously
    if(jogador.clubesRejeitados && jogador.clubesRejeitados.includes(clubeAtual.id)) {
        mostrarToast("Negociação Bloqueada", `O ${clubeAtual.nome} fechou as portas após rejeição anterior. Tenta novamente na próxima temporada.`, "danger");
        return;
    }
    
    let idx = propostasPendentes.findIndex(p => p.id === clubeAtual.id && p.tipo === "renovacao");
    if (idx === -1) {
        propostasPendentes.push({ id: clubeAtual.id, nome: clubeAtual.nome, reputacao: clubeAtual.reputacao, valor: 0, tipo: "renovacao", janela: "Reunião solicitada" });
        idx = propostasPendentes.length - 1;
    }
    iniciarNegociacao(idx);
};

window.iniciarNegociacao = function(index) {
    const proposta = propostasPendentes[index];
    if (!proposta) return;
    const clube = clubes.find(c => c.id === proposta.id);
    if (!clube) return;
    const ofertaInicial = calcularOfertaInicialClube(clube, proposta.tipo);
    negociacaoAtual = {
        propostaIndex: index,
        clubeId: clube.id,
        nome: clube.nome,
        tipo: proposta.tipo,
        valorTransfer: proposta.valor || 0,
        janela: proposta.janela,
        rodada: 1,
        maxRodadas: 4,
        ofertaClube: ofertaInicial,
        rascunho: {
            salario: Math.floor(ofertaInicial.salario * 1.12),
            anos: ofertaInicial.anos,
            bonusGol: Math.floor(ofertaInicial.bonusGol * 1.15),
            bonusVitoria: ofertaInicial.bonusVitoria,
            luvas: ofertaInicial.luvas,
            direitosImagem: Math.min(50, ofertaInicial.direitosImagem + 5)
        },
        historico: [{ autor: "clube", texto: `${clube.nome} apresenta proposta inicial: ${formatarMoeda(ofertaInicial.salario)}/semana por ${ofertaInicial.anos} ano(s)${ofertaInicial.luvas ? `, com luvas de ${formatarMoeda(ofertaInicial.luvas)}` : ""}.` }],
        finalizada: false
    };
    document.getElementById("modalNegociacao")?.classList.remove("oculto");
    renderNegociacaoModal();
};

function renderNegociacaoModal() {
    const modal = document.getElementById("modalNegociacao");
    const body = document.getElementById("negociacaoBody");
    if (!modal || !body || !negociacaoAtual) return;
    const clube = clubes.find(c => c.id === negociacaoAtual.clubeId);
    const tituloEl = document.getElementById("negTituloClube");
    if (tituloEl) tituloEl.innerHTML = `💼 Negociação — ${clube?.nome || negociacaoAtual.nome}`;
    const o = negociacaoAtual.ofertaClube;
    const tipoLabel = negociacaoAtual.tipo === "renovacao" ? "Renovação de contrato" : (negociacaoAtual.tipo === "emprestimo" ? "Empréstimo" : "Transferência");

    const historicoHtml = negociacaoAtual.historico.map(h => `
        <div style="display:flex; ${h.autor === "jogador" ? "justify-content:flex-end;" : ""} margin-bottom:8px;">
            <div style="max-width:82%; padding:10px 14px; border-radius:10px; font-size:0.85rem; ${h.autor === "jogador" ? "background:rgba(0,255,136,0.15); border:1px solid var(--theme-primary);" : "background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);"}">
                <strong style="display:block; margin-bottom:3px; color:${h.autor === "jogador" ? "var(--theme-primary)" : "#aaa"};">${h.autor === "jogador" ? "Você / Agente" : (clube?.nome || "Clube")}</strong>
                ${h.texto}
            </div>
        </div>`).join("");

    body.innerHTML = `
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.1);">
            <img loading="lazy" decoding="async" src="${obterUrlImagem(clube,'clube')}" style="width:52px; height:52px; object-fit:contain; background:#fff; border-radius:8px; padding:4px;">
            <div><span class="meta-pill">${tipoLabel}</span><h3 style="margin:6px 0 0;">${clube?.nome || ""}</h3></div>
            <div style="margin-left:auto; text-align:right;"><span style="color:#888; font-size:0.75rem; text-transform:uppercase; font-weight:800;">Rodada</span><br><strong>${negociacaoAtual.rodada}/${negociacaoAtual.maxRodadas}</strong></div>
        </div>

        <div style="max-height:170px; overflow-y:auto; margin-bottom:18px; padding-right:4px;">${historicoHtml}</div>

        <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:16px; margin-bottom:16px;">
            <h4 style="margin:0 0 10px; color:var(--theme-primary);">📄 Oferta atual do clube</h4>
            <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:10px; font-size:0.85rem; color:#ccc;">
                <div>Salário semanal <strong style="display:block; color:#fff;">${formatarMoeda(o.salario)}</strong></div>
                <div>Contrato <strong style="display:block; color:#fff;">${o.anos} ano(s)</strong></div>
                <div>Bônus por gol <strong style="display:block; color:#fff;">${formatarMoeda(o.bonusGol)}</strong></div>
                <div>Bônus por vitória <strong style="display:block; color:#fff;">${formatarMoeda(o.bonusVitoria)}</strong></div>
                ${o.luvas ? `<div>Luvas (assinatura) <strong style="display:block; color:var(--gold);">${formatarMoeda(o.luvas)}</strong></div>` : ""}
                <div>Direitos de imagem <strong style="display:block; color:#fff;">${o.direitosImagem}%</strong></div>
            </div>
            <p style="margin:10px 0 0; color:#888; font-size:0.78rem;">Estimativa anual (salário): <strong style="color:var(--success);">${formatarMoeda(o.salario * 52)}</strong></p>
        </div>

        ${negociacaoAtual.finalizada ? `
            <div style="text-align:center; padding:14px; border-radius:10px; background:rgba(255,255,255,0.05); margin-bottom:16px;">
                <p style="margin:0; color:#ccc;">Esta é a proposta final do clube nesta negociação. Aceita ou encerra sem acordo.</p>
            </div>` : `
        <div style="background:rgba(0,0,0,0.22); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px; margin-bottom:16px;">
            <h4 style="margin:0 0 10px;">✍️ A tua contraproposta</h4>
            <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:12px;">
                <div><label style="font-size:0.75rem; color:#888;">Salário semanal (€)</label>
                    <input type="number" id="negInputSalario" value="${negociacaoAtual.rascunho.salario}" step="1000" style="width:100%; padding:8px; border-radius:6px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); color:#fff;"></div>
                <div><label style="font-size:0.75rem; color:#888;">Anos de contrato</label>
                    <select id="negInputAnos" style="width:100%; padding:8px; border-radius:6px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); color:#fff;">
                        ${[1,2,3,4,5].map(n => `<option value="${n}" ${n===negociacaoAtual.rascunho.anos?"selected":""}>${n} ano${n>1?"s":""}</option>`).join("")}
                    </select></div>
                <div><label style="font-size:0.75rem; color:#888;">Bônus por gol (€)</label>
                    <input type="number" id="negInputBonusGol" value="${negociacaoAtual.rascunho.bonusGol}" step="200" style="width:100%; padding:8px; border-radius:6px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); color:#fff;"></div>
                <div><label style="font-size:0.75rem; color:#888;">Direitos de imagem (%)</label>
                    <input type="number" id="negInputImagem" value="${negociacaoAtual.rascunho.direitosImagem}" min="0" max="50" style="width:100%; padding:8px; border-radius:6px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); color:#fff;"></div>
            </div>
            <button class="btn btn-primary btn-block" style="margin-top:14px;" onclick="enviarContrapropostaNegociacao()">📨 Enviar contraproposta</button>
        </div>`}

        <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn btn-success" style="flex:1;" onclick="aceitarOfertaNegociacao()">✅ Aceitar oferta atual</button>
            <button class="btn btn-danger" style="flex:1;" onclick="cancelarNegociacao()">🚪 Encerrar sem acordo</button>
        </div>`;
}

window.enviarContrapropostaNegociacao = function() {
    if (!negociacaoAtual || negociacaoAtual.finalizada) return;
    const pedido = {
        salario: Math.max(5000, parseInt(document.getElementById("negInputSalario")?.value) || negociacaoAtual.ofertaClube.salario),
        anos: parseInt(document.getElementById("negInputAnos")?.value) || negociacaoAtual.ofertaClube.anos,
        bonusGol: Math.max(0, parseInt(document.getElementById("negInputBonusGol")?.value) || 0),
        bonusVitoria: negociacaoAtual.ofertaClube.bonusVitoria,
        luvas: negociacaoAtual.ofertaClube.luvas,
        direitosImagem: Math.min(50, Math.max(0, parseInt(document.getElementById("negInputImagem")?.value) || 0))
    };
    negociacaoAtual.historico.push({ autor: "jogador", texto: `Pede ${formatarMoeda(pedido.salario)}/semana, ${pedido.anos} ano(s), ${formatarMoeda(pedido.bonusGol)} por gol e ${pedido.direitosImagem}% de imagem.` });

    const resultado = avaliarContraPropostaClube(negociacaoAtual, pedido);
    negociacaoAtual.rodada++;

    if (resultado.decisao === "aceitar") {
        negociacaoAtual.ofertaClube = resultado.oferta;
        negociacaoAtual.historico.push({ autor: "clube", texto: `Combinado! O ${negociacaoAtual.nome} aceita os teus termos.` });
        negociacaoAtual.finalizada = true;
    } else if (resultado.decisao === "contraproposta") {
        negociacaoAtual.ofertaClube = resultado.oferta;
        negociacaoAtual.rascunho = { ...negociacaoAtual.rascunho, salario: Math.floor((pedido.salario + resultado.oferta.salario) / 2) };
        negociacaoAtual.historico.push({ autor: "clube", texto: `O ${negociacaoAtual.nome} ajusta a proposta: ${formatarMoeda(resultado.oferta.salario)}/semana, ${resultado.oferta.anos} ano(s).` });
    } else if (resultado.decisao === "final") {
        negociacaoAtual.ofertaClube = resultado.oferta;
        negociacaoAtual.historico.push({ autor: "clube", texto: `O ${negociacaoAtual.nome} diz que esta é a proposta final. É pegar ou largar.` });
        negociacaoAtual.finalizada = true;
    } else {
        negociacaoAtual.historico.push({ autor: "clube", texto: `O ${negociacaoAtual.nome} recusa esses termos e encerra a negociação. As portas estão fechadas.` });
        // Add club to rejected list
        if(!jogador.clubesRejeitados) jogador.clubesRejeitados = [];
        if(!jogador.clubesRejeitados.includes(negociacaoAtual.clubeId)) {
            jogador.clubesRejeitados.push(negociacaoAtual.clubeId);
        }
        // Remove from pending proposals
        const idx = propostasPendentes.findIndex(p => p.id === negociacaoAtual.clubeId);
        if(idx !== -1) propostasPendentes.splice(idx, 1);
        negociacaoAtual.finalizada = true;
        registrarNoticia("Negociação encerrada", `${jogador.nome} e ${negociacaoAtual.nome} não chegaram a acordo. O clube fechou as portas.`, "Mercado");
    }
    renderNegociacaoModal();
};

window.aceitarOfertaNegociacao = function() {
    if (!negociacaoAtual) return;
    const clube = clubes.find(c => c.id === negociacaoAtual.clubeId);
    const oferta = negociacaoAtual.ofertaClube;
    const tipo = negociacaoAtual.tipo;

    jogador.salarioSemanal = oferta.salario;
    jogador.bonusGol = oferta.bonusGol;
    jogador.bonusVitoria = oferta.bonusVitoria;
    jogador.direitosImagem = oferta.direitosImagem;
    jogador.contrato = oferta.anos;
    if (jogador.lifestyle) jogador.lifestyle.salary = Math.floor(oferta.salario * (jogador.lifestyle.multipliers?.salaryMultiplier || 1));

    if (tipo === "renovacao") {
        jogador.felicidade = Math.min(100, (jogador.felicidade || 60) + 10);
        registrarNoticia("Contrato renovado", `${jogador.nome} acertou renovação com ${clube.nome}: ${formatarMoeda(oferta.salario)}/semana por ${oferta.anos} ano(s), com bônus de ${formatarMoeda(oferta.bonusGol)} por gol.`, "Mercado");
        mostrarToast("Renovação", `Novo contrato assinado com o ${clube.nome}!`, "success");
    } else {
        const cAntigo = clubes.find(c => c.id === jogador.clubeId);
        if (clube) clube.orcamento = (clube.orcamento || 0) - (negociacaoAtual.valorTransfer || 0);
        if (cAntigo && tipo !== "emprestimo") cAntigo.orcamento = (cAntigo.orcamento || 0) + (negociacaoAtual.valorTransfer || 0);
        registrarMovimentacao({ jogadorNome: jogador.nome, jogadorId: "player", tipo: tipo, valor: negociacaoAtual.valorTransfer || 0, origemId: jogador.clubeId, destinoId: clube.id, janela: negociacaoAtual.janela });
        // Reset years at club and captain status on transfer
        jogador.anoNoClubeAtual = 0;
        jogador.eCapitao = false;
        if (tipo === "emprestimo") { jogador.clubeOrigemEmprestimo = jogador.clubeId; jogador.emprestadoAte = anoAtual; jogador.clubeId = clube.id; }
        else { jogador.clubeId = clube.id; delete jogador.clubeOrigemEmprestimo; delete jogador.emprestadoAte; }
        jogador.jogosNoClubeAtual = 0; jogador.tecnicoConhecido = null; jogador.statusEscalacaoAnterior = null;
        jogador.titularidade = Math.min(jogador.titularidade || 48, 52); // chega ao novo clube tendo de reconquistar a titularidade
        reconstruirAgendaAposTrocaClube();
        registrarNoticia(tipo === "emprestimo" ? "Empréstimo fechado" : "Transferência confirmada", `${jogador.nome} acertou com ${clube.nome}: ${formatarMoeda(oferta.salario)}/semana por ${oferta.anos} ano(s).`, "Mercado");
        mostrarToast(tipo === "emprestimo" ? "Empréstimo" : "Transferência", `Acordo fechado com o ${clube.nome}!`, "success");
        setTimeout(() => abrirEntrevista("transferencia", { clube: clube.nome }), 500);
    }

    propostasPendentes = [];
    negociacaoAtual = null;
    document.getElementById("modalNegociacao")?.classList.add("oculto");
    window.salvarJogo(); atualizarHub(); mudarTela("view-hub");
};

window.cancelarNegociacao = function() {
    if (negociacaoAtual) {
        const clube = clubes.find(c => c.id === negociacaoAtual.clubeId);
        mostrarToast("Negociação encerrada", `Encerraste as conversas com o ${clube?.nome || negociacaoAtual.nome} sem acordo.`, "warning");
    }
    negociacaoAtual = null;
    document.getElementById("modalNegociacao")?.classList.add("oculto");
};
document.getElementById("btnFecharNegociacao")?.addEventListener("click", () => {
    if (managerNegociacaoAtual) window.managerFecharNegociacao(true);
    else window.cancelarNegociacao();
});

function registrarEstatisticaCompeticao(j, compId, jogos = 0, gols = 0, assistencias = 0) {
    if(!j || !compId) return;
    if(!j.statsCompeticoes) j.statsCompeticoes = {};
    if(!j.statsCompeticoes[compId]) j.statsCompeticoes[compId] = { jogos: 0, gols: 0, assistencias: 0 };
    j.statsCompeticoes[compId].jogos += jogos;
    j.statsCompeticoes[compId].gols += gols;
    j.statsCompeticoes[compId].assistencias += assistencias;
}
function montarRankingCompeticao(compId) {
    const todos = [jogador, ...jogadoresIA.filter(j => !j.aposentado)].filter(p => p && !p?.aposentadoSelecao);
    const base = todos.map(j => ({ j, st: j?.statsCompeticoes?.[compId] || { jogos:0, gols:0, assistencias:0 } }));

    // 🛡️ FIX (jogador sumia da artilharia): antes só se mostravam os 5 primeiros
    // de cada lista — se o jogador não estivesse entre eles, sua posição real
    // não aparecia em lugar nenhum, mesmo tendo marcado gols/assistências nessa
    // competição. Agora a lista sempre calcula a posição de VERDADE do jogador
    // (entre todos que marcaram) e, se ele ficar fora do Top 5, sua linha é
    // acrescentada por baixo, destacada, mostrando a colocação real (ex: "12º").
    const montarInfo = (campo) => {
        const comStat = base.filter(x => x.st[campo] > 0).sort((a,b) => b.st[campo] - a.st[campo]);
        const top5 = comStat.slice(0, 5);
        const idxJogador = comStat.findIndex(x => x.j === jogador);
        return { comStat, top5, idxJogador };
    };

    const linhaJogador = (info, campo) => {
        if (info.idxJogador < 0 || info.idxJogador < 5) return ""; // já está no top5 ou não marcou nada ainda
        const item = info.comStat[info.idxJogador];
        return `<div class="ranking-mini-row ranking-mini-row-eu"><span style="display:flex; align-items:center; gap:8px;"><strong>${info.idxJogador + 1}º</strong><img loading="lazy" decoding="async" src="${obterUrlImagem(jogador,'jogador')}">${jogador.nome} (tu)</span><strong>${item.st[campo]}</strong></div>`;
    };

    const bloco = (titulo, info, campo) => `<h4>${titulo}</h4>${info.top5.length ? info.top5.map((x,i)=>`
        <div class="ranking-mini-row${x.j === jogador ? " ranking-mini-row-eu" : ""}"><span style="display:flex; align-items:center; gap:8px;"><strong>${i+1}</strong><img loading="lazy" decoding="async" src="${obterUrlImagem(x.j,'jogador')}">${x.j.nome}${x.j === jogador ? " (tu)" : ""}</span><strong style="color:var(--gold);">${x.st[campo]}</strong></div>`).join("") : `<p style="color:#aaa; font-size:0.82rem;">Ainda sem dados.</p>`}${linhaJogador(info, campo)}`;

    const golsInfo = montarInfo("gols");
    const assistInfo = montarInfo("assistencias");
    return `<aside class="ranking-mini">${bloco("Artilharia", golsInfo, "gols")}${bloco("Assistências", assistInfo, "assistencias")}</aside>`;
}
function formatarMoeda(valor) { return valor >= 1000000 ? `€${(valor / 1000000).toFixed(1)}M` : `€${(valor / 1000).toFixed(0)}K`; }

function preencherDropdowns() {
    const sCopa = document.getElementById("selectFiltroCopa");
    if(sCopa) {
        const compsMataMata = competicoes.filter(c => ["continental", "supercopa_continental", "torneio_intercontinental"].includes(c.tipo));
        sCopa.innerHTML = compsMataMata.map(c => `<option value="${c.id}">${c.nome}</option>`).join("");
    }
}

function setText(id, value) { const el = document.getElementById(id); if (el) el.innerHTML = value; }
function mudarTela(id) {
    document.querySelectorAll(".tela").forEach(t => t.classList.add("oculto"));
    let tela = document.getElementById(id);
    if (tela) tela.classList.remove("oculto");
    // 🎵 Música fixa na tela de criação de jogador; qualquer outra tela usa a playlist normal.
    if (id === "telaCriacao" || id === "telaAtributosIniciais") window.tocarMusicaTelaCriacao?.();
    else window.retomarPlaylistNormal?.();
}
// 🛡️ FIX: expõe no window — firebase-integration.js (script clássico) chama
// mudarTela(...) diretamente e sem isto o lobby online travava em silêncio.
window.mudarTela = mudarTela;

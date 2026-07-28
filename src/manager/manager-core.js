function estadoManagerPadrao() {
    return { ativo: false, treinador: null, clubeId: null, confianca: 65, tatica: { formacao: "4-3-3", estilo: "pressao", mentalidade: "equilibrado", pressao: "média", largura: "normal" }, orcamentoTransferencias: 0, folhaSalarial: 0, base: [], propostasRecebidas: [], promocoesBaseTemporada: 0, auxiliarTecnico: null, auxiliaresDisponiveis: [] };
}

// 📈🔥 O que acontece com o treinador-jogador a cada fim de temporada: pode
// ser demitido (confiança zerada) ou receber propostas de clubes melhores —
// ou, raramente, de uma seleção — se estiver a fazer um bom trabalho.
function avaliarContinuidadeManagerJogador() {
    if (!managerEstado?.ativo) return;
    if (managerEstado.clubeId) {
        const clube = clubeManagerAtual();
        if (!clube) return;
        if (managerEstado.confianca <= 0) {
            registrarNoticia("Demitido!", `A diretoria do ${clube.nome} demitiu ${managerEstado.treinador?.nome || "o treinador"} apos uma temporada decepcionante.`, "Manager");
            mostrarToast("Demitido", `Foste demitido do ${clube.nome}. Hora de procurar um novo desafio.`, "danger");
            contratarNovoTecnico(clube);
            managerEstado.clubeId = null;
            managerEstado.confianca = 55;
            managerEstado.propostasRecebidas = [];
            window.salvarJogo();
            return;
        }
        if (managerEstado.confianca < 72 || Math.random() > 0.35) return;
        const meuTreinador = managerEstado.treinador;
        const jaPropostos = (managerEstado.propostasRecebidas || []).map(p => p.clubeId || p.selecaoId);
        const candidatosClube = clubes.filter(c => c.id !== clube.id && (c.reputacao || 60) > (clube.reputacao || 60) + 4 && (c.reputacao || 60) <= (meuTreinador?.reputacao || 65) + 12 && !jaPropostos.includes(c.id));
        const podeSelecao = typeof SELECOES !== "undefined" && SELECOES.length && Math.random() < 0.15;
        managerEstado.propostasRecebidas = managerEstado.propostasRecebidas || [];
        if (podeSelecao && Math.random() < 0.5) {
            const sel = SELECOES[Math.floor(Math.random() * SELECOES.length)];
            if (!jaPropostos.includes(sel.id)) {
                managerEstado.propostasRecebidas.push({ tipo: "selecao", selecaoId: sel.id, nome: sel.nome });
                mostrarToast("Convite internacional!", `A selecao ${sel.nome} quer voce no comando.`, "success");
            }
        } else if (candidatosClube.length) {
            const alvo = candidatosClube[Math.floor(Math.random() * candidatosClube.length)];
            managerEstado.propostasRecebidas.push({ tipo: "clube", clubeId: alvo.id, nome: alvo.nome, reputacao: alvo.reputacao });
            mostrarToast("Proposta recebida!", `O ${alvo.nome} quer contratar voce.`, "success");
        }
        window.salvarJogo();
    } else if (managerEstado.selecaoId) {
        if (managerEstado.confianca < 75 || Math.random() > 0.25) return;
        const meuTreinador = managerEstado.treinador;
        const jaPropostos = (managerEstado.propostasRecebidas || []).map(p => p.clubeId);
        const candidatosClube = clubes.filter(c => (c.reputacao || 60) <= (meuTreinador?.reputacao || 65) + 10 && (c.reputacao || 60) >= 70 && !jaPropostos.includes(c.id));
        if (!candidatosClube.length) return;
        const alvo = candidatosClube[Math.floor(Math.random() * candidatosClube.length)];
        managerEstado.propostasRecebidas = managerEstado.propostasRecebidas || [];
        managerEstado.propostasRecebidas.push({ tipo: "clube", clubeId: alvo.id, nome: alvo.nome, reputacao: alvo.reputacao });
        mostrarToast("Proposta recebida!", `O ${alvo.nome} quer contratar voce.`, "success");
        window.salvarJogo();
    }
}

window.managerAceitarProposta = function(indice) {
    const proposta = managerEstado.propostasRecebidas?.[indice];
    if (!proposta) return;
    managerEstado.propostasRecebidas = [];
    if (proposta.tipo === "clube") {
        iniciarManagerNoClube(proposta.clubeId);
    } else if (proposta.tipo === "selecao") {
        const clubeAntigo = clubeManagerAtual();
        if (clubeAntigo) contratarNovoTecnico(clubeAntigo);
        managerEstado.clubeId = null;
        managerEstado.selecaoId = proposta.selecaoId;
        managerEstado.confianca = 68;
        managerEstado.jogosSelecao = managerEstado.jogosSelecao || { vitorias: 0, empates: 0, derrotas: 0 };
        const sel = SELECOES.find(s => s.id === proposta.selecaoId);
        registrarNoticia("Nova selecao, novo desafio", `${managerEstado.treinador?.nome || "O treinador"} assume o comando da selecao ${sel?.nome || ""}.`, "Manager");
        mostrarToast("Parabens!", `Agora treinas a selecao ${sel?.nome || ""}!`, "success");
        window.salvarJogo();
        renderizarManager();
    }
};
window.managerRecusarProposta = function(indice) {
    if (!managerEstado.propostasRecebidas) return;
    managerEstado.propostasRecebidas.splice(indice, 1);
    window.salvarJogo();
    renderizarManager();
};

// 🌍 Painel simplificado de gestão de SELEÇÃO — reaproveita a identidade do
// Modo Manager (treinador, confiança, propostas) mas com um ciclo de jogo
// mais leve que um clube (sem mercado de transferências/orçamento: não faz
// sentido "comprar" jogadores para uma seleção).
function renderizarManagerSelecao(el, treinador) {
    const sel = SELECOES.find(s => s.id === managerEstado.selecaoId);
    if (!sel) { managerEstado.selecaoId = null; renderizarManager(); return; }
    const elenco = (typeof obterJogadoresNacionalidade === "function" ? obterJogadoresNacionalidade(sel.pais) : jogadoresIA.filter(j => j.nacionalidade === sel.pais)).filter(j => !j.aposentado).sort((a, b) => (b.geral || 0) - (a.geral || 0)).slice(0, 26);
    const stats = managerEstado.jogosSelecao || { vitorias: 0, empates: 0, derrotas: 0 };
    let painel = document.getElementById("manager-selecao-screen");
    if (!painel) { painel = document.createElement("div"); painel.id = "manager-selecao-screen"; el.insertBefore(painel, el.firstChild); }
    painel.style.display = "block";
    const propostas = managerEstado.propostasRecebidas || [];
    painel.innerHTML = `
        <div class="manager-shell">
            <div class="manager-hero">
                <div style="display:flex; align-items:center; gap:14px;">
                    <img loading="lazy" decoding="async" src="${sel.logo}" alt="${sel.nome}" style="width:56px; height:56px; object-fit:contain;" onerror="this.style.visibility='hidden'">
                    <div><span class="comp-int-kicker">Seleção Nacional</span><h2>${sel.nome}</h2><p>${treinador?.nome || "Treinador"} • Confiança da federação: ${managerEstado.confianca}%</p></div>
                </div>
                <div class="manager-license"><strong>REP ${treinador?.reputacao ?? 65}</strong><span>${treinador?.estiloJogo || "Equilibrado"}</span></div>
            </div>
            ${propostas.length ? `<div class="dashboard-card" style="padding:18px; margin-top:16px; border:1px solid rgba(250,204,21,.4);">
                <h3 style="margin:0 0 10px;">📨 Propostas Recebidas</h3>
                ${propostas.map((p, i) => `<div style="display:flex; justify-content:space-between; align-items:center; gap:12px; padding:8px 0; border-bottom:1px solid rgba(255,255,255,.08);">
                    <span>${p.tipo === "clube" ? `⚽ ${p.nome} (rep. ${p.reputacao})` : `🌍 Seleção ${p.nome}`}</span>
                    <span style="display:flex; gap:6px;"><button class="btn btn-success btn-sm" onclick="managerAceitarProposta(${i})">Aceitar</button><button class="btn btn-danger btn-sm" onclick="managerRecusarProposta(${i})">Recusar</button></span>
                </div>`).join("")}
            </div>` : ""}
            <div class="manager-hub-grid" style="margin-top:16px;">
                <div class="manager-next-match">
                    <h3 style="margin-top:0;">Próximo Compromisso</h3>
                    <p style="color:#aaa;">Amistoso / janela internacional</p>
                    <div class="manager-next-clubs"><span>${sel.nome}</span><span>vs</span><span>Adversário a sortear</span></div>
                    <button class="btn btn-primary" onclick="managerSimularJogoSelecao()">Simular Próximo Jogo</button>
                </div>
                <div class="manager-panel">
                    <h3>📈 Retrospecto</h3>
                    <div class="manager-summary-list">
                        <div><span>✅ Vitórias</span><strong style="color:#10b981;">${stats.vitorias}</strong></div>
                        <div><span>➖ Empates</span><strong style="color:#facc15;">${stats.empates}</strong></div>
                        <div><span>❌ Derrotas</span><strong style="color:#f87171;">${stats.derrotas}</strong></div>
                    </div>
                </div>
            </div>
            <div class="dashboard-card" style="padding:20px; margin-top:16px;">
                <h3 style="margin-top:0;">Convocados (top 26 disponíveis)</h3>
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px,1fr)); gap:8px;">
                    ${elenco.map(j => `<div style="background:rgba(255,255,255,.04); padding:8px 10px; border-radius:8px; font-size:.82rem;">${j.nome} <span style="color:#8a9a90;">(${j.geral})</span></div>`).join("") || "<p style='color:#aaa;'>Sem jogadores elegíveis suficientes.</p>"}
                </div>
            </div>
        </div>`;
}

window.managerSimularJogoSelecao = function() {
    const sel = SELECOES.find(s => s.id === managerEstado.selecaoId);
    if (!sel) return;
    const outras = SELECOES.filter(s => s.id !== sel.id);
    const adversario = outras[Math.floor(Math.random() * outras.length)];
    const forcaMinha = calcularForcaSelecao(sel.id);
    const forcaAdv = calcularForcaSelecao(adversario.id);
    const { gA, gB } = simularPlacarSelecao(forcaMinha, forcaAdv);
    managerEstado.jogosSelecao = managerEstado.jogosSelecao || { vitorias: 0, empates: 0, derrotas: 0 };
    if (gA > gB) { managerEstado.jogosSelecao.vitorias++; managerEstado.confianca = Math.min(100, managerEstado.confianca + 4); }
    else if (gA < gB) { managerEstado.jogosSelecao.derrotas++; managerEstado.confianca = Math.max(0, managerEstado.confianca - 5); }
    else { managerEstado.jogosSelecao.empates++; managerEstado.confianca = Math.min(100, managerEstado.confianca + 1); }
    registrarNoticia(`${sel.nome} ${gA}-${gB} ${adversario.nome}`, `Resultado do compromisso internacional sob o comando de ${managerEstado.treinador?.nome || "treinador"}.`, "Manager");
    mostrarToast("Resultado", `${sel.nome} ${gA} x ${gB} ${adversario.nome}`, gA >= gB ? "success" : "danger");
    window.salvarJogo();
    renderizarManager();
};

function clubeManagerAtual() {
    return clubes.find(c => c.id === managerEstado.clubeId);
}

function calcularFolhaClube(clubeId) {
    const clube = clubes.find(c => c.id === clubeId);
    const reputacao = clube?.reputacao || 65;
    const fatorClube = 0.55 + (reputacao / 100) * 1.2;
    const fatorArabe = clube?.ligaId?.startsWith("ara") ? 1.6 : 1;
    return jogadoresIA.filter(p => p.clubeId === clubeId && !p.aposentado).reduce((acc, p) => acc + Math.max(12000, (p.valorMercadoNum || calcularValorMercadoJogador(p)) * 0.018) * fatorClube * fatorArabe, 0);
}

function gerarBaseManager(clube) {
    const nomes = ["Rafael", "Leo", "Iago", "Davi", "Noah", "Caio", "Hugo", "Breno", "Luis", "Tomas"];
    const posicoes = ["Goleiro","Zagueiro","Lateral","Volante","Meio-Campista","Meia Ofensivo","Ponta","Atacante"];
    return Array.from({ length: 6 }, (_, i) => {
        const potencial = Math.min(94, Math.max(70, (clube?.reputacao || 70) + Math.floor(Math.random() * 18) - 4));
        return {
            id: `base_${anoAtual}_${clube?.id || "livre"}_${i}_${Date.now().toString(36)}`,
            nome: `${nomes[Math.floor(Math.random()*nomes.length)]} ${["Silva","Costa","Rocha","Nunes","Mendes"][Math.floor(Math.random()*5)]}`,
            idade: 16 + Math.floor(Math.random() * 3),
            geral: Math.max(48, potencial - 20 - Math.floor(Math.random() * 10)),
            potencial,
            posicao: posicoes[Math.floor(Math.random()*posicoes.length)],
            nacionalidade: jogador?.nacionalidade || "Brasil",
            foto: ""
        };
    });
}

function iniciarManagerNoClube(clubeId) {
    const clube = clubes.find(c => c.id === clubeId);
    if(!clube) return;
    // 🚪 Se já geria outro clube (ou uma seleção), sai de lá — o clube antigo
    // não pode ficar "órfão", precisa de um treinador de verdade também.
    const clubeAntigo = managerEstado.ativo && managerEstado.clubeId ? clubes.find(c => c.id === managerEstado.clubeId) : null;
    if (clubeAntigo && clubeAntigo.id !== clube.id) contratarNovoTecnico(clubeAntigo);
    window.gameMode = "manager";
    managerEstado = {
        ...estadoManagerPadrao(),
        ativo: true,
        treinador: managerEstado.treinador || { nome: jogador?.nome ? `Mister ${jogador.nome}` : "Novo Treinador", reputacao: Math.max(45, Math.min(88, Math.round((jogador?.geral || 65) * 0.9))), ataque: 62, defesa: 62, tatica: 62 },
        clubeId: clube.id,
        selecaoId: null,
        confianca: clube.reputacao >= 84 ? 58 : 72,
        tatica: managerEstado.tatica || { formacao: "4-3-3", estilo: "pressao", mentalidade: "equilibrado", pressao: "média", largura: "normal" },
        orcamentoTransferencias: calcularOrcamentoBaseClube(clube.reputacao),
        folhaSalarial: calcularFolhaClube(clube.id),
        base: gerarBaseManager(clube),
        auxiliaresDisponiveis: gerarAuxiliaresDisponiveis(clube)
    };
    registrarNoticia("Novo treinador anunciado", `${managerEstado.treinador.nome} assumiu o comando do ${clube.nome}.`, "Manager");
    configurarNavegacaoPorModo();
    window.salvarJogo();
    renderizarManager();
}

// 🔻 OVR efetivo de um jogador numa posição diferente da natural dele. Quanto
// mais distante a posição jogada está da natural (na escala defesa→ataque),
// maior a queda — jogar de goleiro improvisado (ou colocar um jogador de
// linha na baliza) é sempre o pior caso. Só afeta a força/exibição do
// Modo Manager, nunca o "posicao" real do jogador nem a lógica do Match Engine.
const ORDEM_POSICOES_OVR = ["Goleiro", "Zagueiro", "Lateral", "Volante", "Meio-Campista", "Meia Ofensivo", "Ponta", "Atacante"];
function calcularOvrNaPosicao(jogadorAlvo, posicaoNoJogo) {
    const geralBase = jogadorAlvo?.geral || 60;
    if (!jogadorAlvo || !posicaoNoJogo || jogadorAlvo.posicao === posicaoNoJogo) return geralBase;
    if (jogadorAlvo.posicao === "Goleiro" || posicaoNoJogo === "Goleiro") return Math.max(20, Math.round(geralBase - 30));
    const iReal = ORDEM_POSICOES_OVR.indexOf(jogadorAlvo.posicao);
    const iSlot = ORDEM_POSICOES_OVR.indexOf(posicaoNoJogo);
    const distancia = (iReal >= 0 && iSlot >= 0) ? Math.abs(iReal - iSlot) : 3;
    const penalidade = Math.min(30, 5 + distancia * 4);
    return Math.max(20, Math.round(geralBase - penalidade));
}

// ==========================================
// 👥 COMISSÃO TÉCNICA — Auxiliares Técnicos
// ==========================================
// Cada especialidade dá um pequeno bônus tático extra (ver bonusTaticoManager)
// — não é decorativo, soma de verdade na força efetiva do clube nos jogos do
// Manager. Reutiliza os mesmos geradores de nome/nacionalidade dos técnicos
// principais (gerarNomeTreinador / sortearNacionalidadeTreinador) pra manter
// a coerência do elenco de nomes do jogo.
const ESPECIALIDADES_AUXILIAR = [
    { tipo: "Auxiliar Ofensivo", icone: "⚔️", desc: "Reforça o entrosamento ofensivo do time." },
    { tipo: "Auxiliar Defensivo", icone: "🛡️", desc: "Reforça a organização defensiva do time." },
    { tipo: "Preparador Físico", icone: "💪", desc: "Mantém o elenco em melhor forma física." },
    { tipo: "Analista de Desempenho", icone: "📊", desc: "Ajuda a extrair o máximo da tática escolhida." }
];

function gerarAuxiliaresDisponiveis(clube = null) {
    const fatorClube = Math.max(0.7, (clube?.reputacao || 70) / 70);
    return ESPECIALIDADES_AUXILIAR.map((esp, i) => ({
        id: `aux_${Date.now().toString(36)}_${i}_${Math.floor(Math.random() * 9999)}`,
        nome: gerarNomeTreinador(),
        nacionalidade: sortearNacionalidadeTreinador(),
        tipo: esp.tipo,
        icone: esp.icone,
        desc: esp.desc,
        bonus: Math.round((1 + Math.random() * 1.5) * 10) / 10, // 1.0 a 2.5
        custoAnual: Math.round((70000 + Math.random() * 130000) * fatorClube)
    }));
}

window.managerContratarAuxiliar = function(auxId) {
    const clube = clubeManagerAtual();
    if (!clube) return;
    const candidato = (managerEstado.auxiliaresDisponiveis || []).find(a => a.id === auxId);
    if (!candidato) return;
    if (managerEstado.auxiliarTecnico) {
        managerEstado.folhaSalarial = Math.max(0, (managerEstado.folhaSalarial || 0) - managerEstado.auxiliarTecnico.custoAnual);
    }
    managerEstado.auxiliarTecnico = candidato;
    managerEstado.folhaSalarial = (managerEstado.folhaSalarial || 0) + candidato.custoAnual;
    registrarNoticia("Novo auxiliar técnico", `${candidato.nome} (${candidato.tipo}) se junta à comissão técnica do ${clube.nome}.`, "Manager");
    mostrarToast("Comissão Técnica", `${candidato.nome} contratado como ${candidato.tipo}.`, "success");
    window.salvarJogo();
    renderizarManager();
};

window.managerDemitirAuxiliar = function() {
    const clube = clubeManagerAtual();
    if (!clube || !managerEstado.auxiliarTecnico) return;
    managerEstado.folhaSalarial = Math.max(0, (managerEstado.folhaSalarial || 0) - managerEstado.auxiliarTecnico.custoAnual);
    registrarNoticia("Saída da comissão técnica", `${managerEstado.auxiliarTecnico.nome} deixa o ${clube.nome}.`, "Manager");
    managerEstado.auxiliarTecnico = null;
    if (!managerEstado.auxiliaresDisponiveis?.length) managerEstado.auxiliaresDisponiveis = gerarAuxiliaresDisponiveis(clube);
    window.salvarJogo();
    renderizarManager();
};

function bonusTaticoManager(clube = null) {
    const t = managerEstado.tatica || {};
    let bonus = 0;
    if(t.formacao === "4-3-3" && t.estilo === "pressao") bonus += 3;
    if(t.formacao === "4-2-3-1" && t.estilo === "posse") bonus += 3;
    if(t.formacao === "5-3-2" && t.estilo === "retranca") bonus += 4;
    if(t.formacao === "5-3-2" && t.estilo === "contra") bonus += 3;
    if(t.formacao === "3-5-2" && t.estilo === "contra") bonus += 2;
    if(t.mentalidade === "ofensiva") bonus += 1;
    if(t.mentalidade === "conservadora") bonus += 1;
    if(t.pressao === "alta" && t.estilo === "pressao") bonus += 1.5;
    if(t.pressao === "baixa" && t.estilo === "retranca") bonus += 1;
    if(t.largura === "larga" && ["4-3-3", "4-2-3-1", "4-4-2"].includes(t.formacao)) bonus += 0.5;
    if(t.largura === "estreita" && ["5-3-2", "3-5-2"].includes(t.formacao)) bonus += 0.5;

    // 🎯 Encaixe posicional: cada titular fora da sua posição natural (o
    // mesmo aviso ⚠ que aparece no campo tático) perde OVR de verdade — ver
    // calcularOvrNaPosicao — e essa queda média é o que pesa contra o bónus,
    // em vez de um desconto fixo igual pra qualquer desencaixe.
    const alvo = clube || clubeManagerAtual();
    if (alvo) {
        const slots = FORMACOES_SLOTS[t.formacao] || FORMACOES_SLOTS["4-3-3"];
        const esc = managerEstado.escalacao;
        if (esc && esc.titulares && Object.keys(esc.titulares).length > 0) {
            let somaPenalidade = 0, preenchidos = 0;
            slots.forEach(slot => {
                const pid = esc.titulares[slot.id];
                if (!pid) return;
                preenchidos++;
                const p = jogadorManagerPorId(pid);
                if (p && p.posicao !== slot.pos) somaPenalidade += (p.geral || 60) - calcularOvrNaPosicao(p, slot.pos);
            });
            if (preenchidos > 0) bonus -= (somaPenalidade / preenchidos) * 0.35;
        }
    }
    // 👥 Bônus da comissão técnica: um auxiliar contratado soma força extra,
    // igual a um bom encaixe tático ou uma boa formação.
    if (managerEstado.auxiliarTecnico) bonus += managerEstado.auxiliarTecnico.bonus;
    return bonus;
}

function objetivoDiretoria(clube) {
    if(!clube) return "Assumir um clube";
    if(clube.reputacao >= 86) return "Brigar por todos os titulos";
    if(clube.reputacao >= 78) return "Classificar para competicao continental";
    if(clube.reputacao >= 68) return "Meio de tabela seguro";
    return "Evitar rebaixamento e revelar jovens";
}

window.managerAssumirClube = iniciarManagerNoClube;

window.managerDefinirTatica = function(campo, valor) {
    if(!managerEstado.tatica) managerEstado.tatica = { formacao: "4-3-3", estilo: "pressao", mentalidade: "equilibrado", pressao: "média", largura: "normal" };
    managerEstado.tatica[campo] = valor;
    managerEstado.confianca = Math.min(100, managerEstado.confianca + 1);
    window.salvarJogo();
    renderizarManager();
};

// 💰 Venda um jogador do TEU elenco para outro clube (ou libera como agente
// livre se não houver comprador plausível). Espelha o mesmo fluxo da compra
// (managerEnviarProposta): valor derivado do mercado, orçamento e folha
// salarial atualizados, movimentação registrada no histórico de transferências.
window.managerVenderJogador = function(playerId) {
    const clube = clubeManagerAtual();
    const alvo = jogadoresIA.find(p => p.id === playerId && p.clubeId === clube?.id && !p.aposentado);
    if (!clube || !alvo) return;
    if (playerId === "player" || (jogador && jogador.id === playerId)) {
        mostrarToast("Manager", "Não é possível vender o teu próprio jogador (Modo Jogador).", "warning");
        return;
    }
    const valorBase = alvo.valorMercadoNum || calcularValorMercadoJogador(alvo);
    if (!confirm(`Vender ${alvo.nome} por aproximadamente ${formatarMoeda(valorBase)}? Esta ação não pode ser desfeita.`)) return;

    // Compradores plausíveis: clubes de reputação parecida (±25) com a do teu
    // clube E compatíveis com o NÍVEL do próprio jogador — evita tanto um
    // reserva "vender" pra um gigante quanto uma joia rara ser desperdiçada
    // num time muito mais fraco. Sem candidato à altura, vira agente livre.
    const candidatos = clubes.filter(c => c.id !== clube.id && !String(c.id).startsWith("clube_generico_")
        && Math.abs((c.reputacao || 70) - (clube.reputacao || 70)) <= 25
        && (c.reputacao || 70) >= alvo.geral - 16);
    const comprador = candidatos.length ? candidatos[Math.floor(Math.random() * candidatos.length)] : null;
    // Clubes mais fortes pagam mais perto (ou acima) do valor de mercado;
    // mais fracos pechincham. Sem comprador claro, vira liberação (venda mais baixa).
    const fatorComprador = comprador ? Math.max(0.68, Math.min(1.1, (comprador.reputacao || 70) / 100 + 0.32)) : 0.55;
    const valorVenda = Math.max(50000, Math.floor(valorBase * (fatorComprador + Math.random() * 0.14)));

    const origemId = alvo.clubeId;
    alvo.clubeId = comprador ? comprador.id : "";
    alvo.contrato = comprador ? Math.max(2, alvo.contrato || 2) : 0;
    managerEstado.orcamentoTransferencias += valorVenda;
    managerEstado.folhaSalarial = calcularFolhaClube(clube.id);
    registrarMovimentacao({ jogadorNome: alvo.nome, jogadorId: alvo.id, tipo: "venda", valor: valorVenda, origemId, destinoId: alvo.clubeId || null, janela: "Modo Manager" });
    mostrarToast("Jogador vendido", `${alvo.nome} foi vendido${comprador ? ` para o ${comprador.nome}` : " e virou agente livre"} por ${formatarMoeda(valorVenda)}.`, "success");
    window.salvarJogo();
    renderizarManager();
};

// 💵 Salário semanal "oficial" de um jogador do elenco. Antes disso o valor
// era só estimado on-the-fly (calcularFolhaClube) sem nunca ser persistido —
// agora, assim que alguém negocia ou recebe uma proposta, o número fica
// gravado no próprio jogador, então uma renovação lembra do salário anterior.
function salarioAtualJogador(p) {
    if (p.salarioSemanal) return p.salarioSemanal;
    const base = Math.max(12000, (p.valorMercadoNum || calcularValorMercadoJogador(p)) * 0.018);
    p.salarioSemanal = Math.floor(base);
    return p.salarioSemanal;
}

// 📨 Chance por rodada de um clube rival mandar uma proposta não-solicitada
// por alguém do TEU elenco. Pesa mais os jogadores de OVR mais alto (ninguém
// manda proposta do nada por um reserva genérico) e evita duplicar proposta
// pendente pro mesmo atleta. Chamada uma vez a cada avanço de rodada do Manager.
function gerarPropostasRecebidas(clube) {
    if (!clube) return;
    managerEstado.propostasRecebidas = (managerEstado.propostasRecebidas || [])
        .filter(o => o.status === "pendente" || (rodadaAtual - (o.rodada || 0)) <= 3)
        .slice(0, 25);
    if (Math.random() > 0.22) return;
    const elenco = jogadoresIA.filter(p => p.clubeId === clube.id && !p.aposentado && p.id !== "player" && !(jogador && p.id === jogador.id));
    if (elenco.length === 0) return;
    const jaPendente = new Set(managerEstado.propostasRecebidas.filter(o => o.status === "pendente").map(o => o.jogadorId));
    const pool = elenco.filter(p => !jaPendente.has(p.id)).map(p => ({ p, peso: Math.max(0.15, (p.geral - 55) / 10) }));
    if (pool.length === 0) return;
    const total = pool.reduce((acc, x) => acc + x.peso, 0);
    let alvo = Math.random() * total;
    let escolhido = pool[0].p;
    for (const item of pool) { alvo -= item.peso; if (alvo <= 0) { escolhido = item.p; break; } }

    // 🚫 Um craque já bem estabelecido num clube grande dificilmente recebe (ou
    // topa considerar) proposta séria — quanto maior a distância entre o nível
    // dele e o do PRÓPRIO clube atual, menor a chance de sequer chegar oferta.
    const gapNoClubeAtual = escolhido.geral - (clube.reputacao || 70);
    if (gapNoClubeAtual > 10 && Math.random() < Math.min(0.85, (gapNoClubeAtual - 10) * 0.07)) return;

    // Só clubes plausíveis (reputação compatível com o nível do jogador) mandam proposta.
    const candidatos = clubes.filter(c => c.id !== clube.id && !String(c.id).startsWith("clube_generico_") && (c.reputacao || 70) >= (escolhido.geral - 11));
    const comprador = candidatos.length ? candidatos[Math.floor(Math.random() * candidatos.length)] : null;
    if (!comprador) return;

    const valorBase = escolhido.valorMercadoNum || calcularValorMercadoJogador(escolhido);
    // Contrato curto = mais pressão pro comprador oferecer bem (é agora ou nunca).
    const fatorContrato = (escolhido.contrato || 0) <= 1 ? -0.08 : 0;
    const fatorComprador = Math.max(0.75, Math.min(1.4, (comprador.reputacao || 70) / 100 + 0.42 + fatorContrato));
    const valor = Math.max(80000, Math.floor(valorBase * (fatorComprador + Math.random() * 0.18)));

    managerEstado.propostasRecebidas.push({
        id: `prop_${Date.now().toString(36)}_${Math.floor(Math.random() * 9999)}`,
        jogadorId: escolhido.id, jogadorNome: escolhido.nome,
        clubeCompradorId: comprador.id, clubeCompradorNome: comprador.nome,
        valor, status: "pendente", rodada: rodadaAtual
    });
    registrarNoticia("Proposta recebida", `${comprador.nome} apresentou uma proposta de ${formatarMoeda(valor)} por ${escolhido.nome}.`, "Mercado");
}

// ✅❌🤝 Resolve uma proposta recebida: aceitar (vende de verdade, mesmo fluxo
// de managerVenderJogador), rejeitar (sem custo, só fecha), ou contrapropor
// (pede 20% a mais — o comprador pode topar ou desistir, numa única rodada
// de negociação em vez de um vai-e-vem longo).
window.managerResponderProposta = function(propostaId, acao) {
    const clube = clubeManagerAtual();
    const prop = managerEstado.propostasRecebidas?.find(o => o.id === propostaId);
    if (!clube || !prop || prop.status !== "pendente") return;
    const alvo = jogadoresIA.find(p => p.id === prop.jogadorId && p.clubeId === clube.id);
    if (!alvo) { prop.status = "expirada"; renderizarManager(); return; }

    if (acao === "aceitar") {
        if (!confirm(`Aceitar a proposta de ${formatarMoeda(prop.valor)} do ${prop.clubeCompradorNome} por ${alvo.nome}?`)) return;
        alvo.clubeId = prop.clubeCompradorId;
        alvo.contrato = Math.max(2, alvo.contrato || 2);
        managerEstado.orcamentoTransferencias += prop.valor;
        managerEstado.folhaSalarial = calcularFolhaClube(clube.id);
        registrarMovimentacao({ jogadorNome: alvo.nome, jogadorId: alvo.id, tipo: "venda", valor: prop.valor, origemId: clube.id, destinoId: prop.clubeCompradorId, janela: "Modo Manager" });
        mostrarToast("Proposta aceite", `${alvo.nome} foi vendido para o ${prop.clubeCompradorNome} por ${formatarMoeda(prop.valor)}.`, "success");
        prop.status = "aceite";
    } else if (acao === "rejeitar") {
        prop.status = "rejeitada";
        mostrarToast("Proposta recusada", `Recusaste a proposta do ${prop.clubeCompradorNome} por ${alvo.nome}.`, "info");
    } else if (acao === "contraproposta") {
        const novoValor = Math.floor(prop.valor * 1.2);
        // Contrato longo = mais poder de barganha (o comprador precisa te convencer mais).
        const chanceTopar = 0.42 - ((alvo.contrato || 0) >= 3 ? 0.12 : 0);
        if (Math.random() < chanceTopar) {
            prop.valor = novoValor;
            mostrarToast("Contraproposta aceite", `${prop.clubeCompradorNome} topou pagar ${formatarMoeda(novoValor)} por ${alvo.nome}. Aceita para confirmar.`, "success");
        } else {
            prop.status = "retirada";
            mostrarToast("Proposta retirada", `${prop.clubeCompradorNome} desistiu depois da tua contraproposta por ${alvo.nome}.`, "warning");
        }
    }
    window.salvarJogo();
    renderizarManager();
};

// 📄 Renegocia o contrato de alguém do TEU elenco: sugere uma proposta (anos
// + salário) a partir do perfil do jogador, deixa ajustar os números, e
// resolve a aceitação com base em quão perto a proposta fica da expectativa
// dele (OVR, idade, felicidade, urgência de quem está a 1 ano de ficar livre).
window.managerAbrirNegociacaoContrato = function(playerId) {
    const painel = document.getElementById(`negociacao-contrato-${playerId}`);
    if (!painel) return;
    const aberto = painel.classList.toggle("ativo");
    if (aberto) painel.querySelector("input[data-campo='anos']")?.focus();
};

window.managerPropoRenovacao = function(playerId) {
    const clube = clubeManagerAtual();
    const alvo = jogadoresIA.find(p => p.id === playerId && p.clubeId === clube?.id && !p.aposentado);
    if (!clube || !alvo) return;
    const inputAnos = document.getElementById(`renovar-anos-${playerId}`);
    const inputSalario = document.getElementById(`renovar-salario-${playerId}`);
    const anos = Math.max(1, Math.min(6, parseInt(inputAnos?.value) || 3));
    const salario = Math.max(5000, parseInt(inputSalario?.value) || salarioAtualJogador(alvo));

    // Expectativa do jogador: quanto melhor o OVR frente ao clube e quanto
    // mais feliz ele está, mais salário/tempo ele espera pra assinar.
    const salarioBase = salarioAtualJogador(alvo);
    const fatorOvr = 1 + Math.max(0, (alvo.geral - (clube.reputacao || 70))) * 0.03;
    const fatorFelicidade = 0.9 + ((alvo.felicidade || 60) / 100) * 0.3;
    const expectativaSalario = salarioBase * fatorOvr * fatorFelicidade;
    const razaoOferta = salario / expectativaSalario;
    const urgencia = (alvo.contrato || 0) <= 1 ? 0.15 : 0; // quem tá quase livre topa mais fácil
    const chanceAceitar = Math.max(0.05, Math.min(0.97, 0.35 + (razaoOferta - 1) * 1.4 + urgencia));

    if (Math.random() < chanceAceitar) {
        alvo.contrato = anos;
        alvo.salarioSemanal = salario;
        alvo.felicidade = Math.min(100, (alvo.felicidade || 60) + 6);
        managerEstado.folhaSalarial = calcularFolhaClube(clube.id);
        managerEstado.confianca = Math.min(100, managerEstado.confianca + 1);
        registrarNoticia("Renovação de contrato", `${alvo.nome} renovou com o ${clube.nome} por mais ${anos} ano(s), a ${formatarMoeda(salario)}/semana.`, "Manager");
        mostrarToast("Renovação fechada", `${alvo.nome} assinou por ${anos} ano(s) a ${formatarMoeda(salario)}/semana.`, "success");
    } else {
        const pedidoJogador = Math.floor(expectativaSalario * (1.03 + Math.random() * 0.08));
        alvo.felicidade = Math.max(0, (alvo.felicidade || 60) - 3);
        mostrarToast("Proposta insuficiente", `${alvo.nome} quer algo perto de ${formatarMoeda(pedidoJogador)}/semana para renovar.`, "warning");
        if (inputSalario) inputSalario.value = pedidoJogador;
    }
    window.salvarJogo();
    renderizarManager();
};

// 🤝 CONTRATAÇÃO EM DUAS ETAPAS: primeiro se negocia o VALOR da transferência
// com o clube dono do jogador, e só depois — com o valor já fechado — se
// negociam os TERMOS PESSOAIS (salário/anos) com o próprio jogador. Reaproveita
// o mesmo modal do modo Jogador (modalNegociacao/negociacaoBody), mas com
// estado e funções próprias do Manager pra não colidir com aquele fluxo.
let managerNegociacaoAtual = null;

window.managerAbrirNegociacaoContratacao = function(playerId) {
    const alvo = jogadoresIA.find(p => p.id === playerId && !p.aposentado);
    const clube = clubeManagerAtual();
    if (!alvo || !clube) return;
    if (playerId === "player" || (jogador && jogador.id === playerId)) {
        mostrarToast("Manager", "Não é possível contratar o teu próprio jogador (Modo Jogador).", "warning");
        return;
    }
    const gapNivel = alvo.geral - (clube.reputacao || 70);
    if (gapNivel > 22) {
        mostrarToast("Manager", `${alvo.nome} está muito acima do patamar do ${clube.nome} — nem considera a proposta.`, "warning");
        return;
    }
    const valorMercado = alvo.valorMercadoNum || calcularValorMercadoJogador(alvo);
    const clubeVendedor = clubes.find(c => c.id === alvo.clubeId);
    managerNegociacaoAtual = {
        fase: "clube",
        jogadorId: alvo.id,
        clubeVendedorId: alvo.clubeId,
        gapNivel,
        valorMercado,
        valorPedido: Math.floor(valorMercado * (1.08 + Math.max(0, gapNivel) * 0.045)),
        rodadaClube: 1,
        maxRodadasClube: 3,
        valorAcordado: 0,
        rodadaJogador: 1,
        maxRodadasJogador: 3,
        historicoClube: [{ autor: "clube", texto: `${clubeVendedor?.nome || "O clube"} sinaliza que só libera ${alvo.nome} por valores próximos de ${formatarMoeda(Math.floor(valorMercado * 1.08))}.` }],
        historicoJogador: []
    };
    document.getElementById("negTituloClube")?.replaceChildren(document.createTextNode(`💼 Contratação — ${alvo.nome}`));
    document.getElementById("modalNegociacao")?.classList.remove("oculto");
    renderManagerNegociacaoModal();
};
// Compatibilidade: qualquer chamada antiga a managerEnviarProposta agora abre a negociação em duas etapas.
window.managerEnviarProposta = window.managerAbrirNegociacaoContratacao;

function renderManagerNegociacaoModal() {
    const n = managerNegociacaoAtual;
    const body = document.getElementById("negociacaoBody");
    const tituloEl = document.getElementById("negTituloClube");
    if (!n || !body) return;
    const alvo = jogadoresIA.find(p => p.id === n.jogadorId);
    const clubeComprador = clubeManagerAtual();
    const clubeVendedor = clubes.find(c => c.id === n.clubeVendedorId);
    if (!alvo || !clubeComprador) { window.managerFecharNegociacao(); return; }
    if (tituloEl) tituloEl.textContent = `💼 Contratação — ${alvo.nome}`;

    if (n.fase === "clube") {
        const historicoHtml = n.historicoClube.map(h => `
            <div style="display:flex; ${h.autor === "voce" ? "justify-content:flex-end;" : ""} margin-bottom:8px;">
                <div style="max-width:82%; padding:10px 14px; border-radius:10px; font-size:0.85rem; ${h.autor === "voce" ? "background:rgba(0,255,136,0.15); border:1px solid var(--theme-primary);" : "background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);"}">
                    <strong style="display:block; margin-bottom:3px; color:${h.autor === "voce" ? "var(--theme-primary)" : "#aaa"};">${h.autor === "voce" ? `${clubeComprador.nome} (tu)` : (clubeVendedor?.nome || "Clube vendedor")}</strong>
                    ${h.texto}
                </div>
            </div>`).join("");
        body.innerHTML = `
            <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.1);">
                <img loading="lazy" decoding="async" src="${obterUrlImagem(alvo,'jogador')}" onerror="this.style.visibility='hidden'" style="width:52px; height:52px; object-fit:cover; border-radius:8px;">
                <div><span class="meta-pill">Etapa 1 de 2 — Valor da transferência</span><h3 style="margin:6px 0 0;">${alvo.nome} <small style="color:#888;">(${clubeVendedor?.nome || "sem clube"})</small></h3></div>
                <div style="margin-left:auto; text-align:right;"><span style="color:#888; font-size:0.75rem; text-transform:uppercase; font-weight:800;">Rodada</span><br><strong>${n.rodadaClube}/${n.maxRodadasClube}</strong></div>
            </div>
            <div style="max-height:170px; overflow-y:auto; margin-bottom:18px; padding-right:4px;">${historicoHtml}</div>
            <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:16px; margin-bottom:16px;">
                <h4 style="margin:0 0 10px; color:var(--theme-primary);">💰 Pedido atual do ${clubeVendedor?.nome || "clube vendedor"}</h4>
                <strong style="font-size:1.2rem; color:#fff;">${formatarMoeda(n.valorPedido)}</strong>
                <p style="margin:6px 0 0; color:#888; font-size:0.78rem;">Valor de mercado estimado: ${formatarMoeda(n.valorMercado)} • Orçamento disponível: ${formatarMoeda(managerEstado.orcamentoTransferencias)}</p>
            </div>
            <div style="background:rgba(0,0,0,0.22); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px; margin-bottom:16px;">
                <h4 style="margin:0 0 10px;">✍️ A tua oferta</h4>
                <label style="font-size:0.75rem; color:#888;">Valor a propor (€)</label>
                <input type="number" id="negManagerValorInput" value="${n.ultimaOferta || Math.floor(n.valorMercado * 1.05)}" step="50000" style="width:100%; padding:8px; border-radius:6px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); color:#fff;">
                <button class="btn btn-primary btn-block" style="margin-top:14px;" onclick="managerProporValorClube()">📨 Propor valor</button>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="btn btn-danger" style="flex:1;" onclick="managerFecharNegociacao()">🚪 Desistir da contratação</button>
            </div>`;
        return;
    }

    // fase === "jogador": termos pessoais, com o valor da transferência já fechado.
    const salarioAtual = salarioAtualJogador(alvo);
    const historicoHtml = n.historicoJogador.map(h => `
        <div style="display:flex; ${h.autor === "voce" ? "justify-content:flex-end;" : ""} margin-bottom:8px;">
            <div style="max-width:82%; padding:10px 14px; border-radius:10px; font-size:0.85rem; ${h.autor === "voce" ? "background:rgba(0,255,136,0.15); border:1px solid var(--theme-primary);" : "background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);"}">
                <strong style="display:block; margin-bottom:3px; color:${h.autor === "voce" ? "var(--theme-primary)" : "#aaa"};">${h.autor === "voce" ? `${clubeComprador.nome} (tu)` : alvo.nome}</strong>
                ${h.texto}
            </div>
        </div>`).join("");
    body.innerHTML = `
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.1);">
            <img loading="lazy" decoding="async" src="${obterUrlImagem(alvo,'jogador')}" onerror="this.style.visibility='hidden'" style="width:52px; height:52px; object-fit:cover; border-radius:8px;">
            <div><span class="meta-pill" style="background:var(--success); color:#062512;">✅ Valor fechado: ${formatarMoeda(n.valorAcordado)}</span><h3 style="margin:6px 0 0;">Etapa 2 de 2 — Termos com ${alvo.nome}</h3></div>
            <div style="margin-left:auto; text-align:right;"><span style="color:#888; font-size:0.75rem; text-transform:uppercase; font-weight:800;">Rodada</span><br><strong>${n.rodadaJogador}/${n.maxRodadasJogador}</strong></div>
        </div>
        <div style="max-height:170px; overflow-y:auto; margin-bottom:18px; padding-right:4px;">${historicoHtml || `<p style="color:#888; font-size:0.85rem;">O clube já topou o valor com o ${clubeVendedor?.nome || "clube vendedor"} — agora falta convencer o próprio ${alvo.nome} a assinar.</p>`}</div>
        <div style="background:rgba(0,0,0,0.22); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px; margin-bottom:16px;">
            <h4 style="margin:0 0 10px;">✍️ A tua proposta pessoal</h4>
            <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:12px;">
                <div><label style="font-size:0.75rem; color:#888;">Salário semanal (€)</label>
                    <input type="number" id="negManagerSalarioInput" value="${n.salarioProposto || salarioAtual}" step="1000" style="width:100%; padding:8px; border-radius:6px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); color:#fff;"></div>
                <div><label style="font-size:0.75rem; color:#888;">Anos de contrato</label>
                    <select id="negManagerAnosInput" style="width:100%; padding:8px; border-radius:6px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); color:#fff;">
                        ${[1,2,3,4,5].map(a => `<option value="${a}" ${a === (n.anosPropostos || 3) ? "selected" : ""}>${a} ano${a > 1 ? "s" : ""}</option>`).join("")}
                    </select></div>
            </div>
            <p style="margin:10px 0 0; color:#888; font-size:0.78rem;">Salário atual dele (${clubeVendedor?.nome || "clube atual"}): ${formatarMoeda(salarioAtual)}/semana.</p>
            <button class="btn btn-primary btn-block" style="margin-top:14px;" onclick="managerProporTermosJogador()">📨 Propor ao jogador</button>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn btn-danger" style="flex:1;" onclick="managerFecharNegociacao()">🚪 Desistir da contratação</button>
        </div>`;
}

// 💰 Etapa 1: negociação do valor com o clube vendedor. Mesma lógica de
// aceitação por "prêmio necessário" que já existia na contratação instantânea,
// só que agora iterativa — o clube pode aceitar, contrapor um valor mais alto,
// ou fechar as portas depois de rodadas demais.
window.managerProporValorClube = function() {
    const n = managerNegociacaoAtual;
    if (!n || n.fase !== "clube") return;
    const alvo = jogadoresIA.find(p => p.id === n.jogadorId);
    const clubeComprador = clubeManagerAtual();
    const clubeVendedor = clubes.find(c => c.id === n.clubeVendedorId);
    if (!alvo || !clubeComprador) return;
    const oferta = Math.max(1, parseInt(document.getElementById("negManagerValorInput")?.value) || n.valorPedido);
    n.ultimaOferta = oferta;
    n.historicoClube.push({ autor: "voce", texto: `Propõe ${formatarMoeda(oferta)} por ${alvo.nome}.` });

    if (oferta > managerEstado.orcamentoTransferencias) {
        n.historicoClube.push({ autor: "clube", texto: `Orçamento insuficiente para cobrir essa oferta.` });
        renderManagerNegociacaoModal();
        return;
    }

    const premioNecessario = n.gapNivel >= 15 ? 1.65 : n.gapNivel >= 8 ? 1.22 : 1.02;
    const pisoAceitavel = n.valorMercado * premioNecessario;
    n.rodadaClube++;

    if (oferta >= n.valorPedido) {
        n.valorAcordado = oferta;
        n.historicoClube.push({ autor: "clube", texto: `Combinado! O ${clubeVendedor?.nome || "clube"} aceita ${formatarMoeda(oferta)} por ${alvo.nome}.` });
        n.fase = "jogador";
        n.salarioProposto = Math.floor(salarioAtualJogador(alvo) * 1.1);
        n.anosPropostos = 3;
    } else if (oferta >= pisoAceitavel && n.rodadaClube <= n.maxRodadasClube) {
        // Oferta razoável mas abaixo do pedido: o clube contrapõe um valor intermediário.
        n.valorPedido = Math.floor((oferta + n.valorPedido) / 2);
        n.historicoClube.push({ autor: "clube", texto: `O ${clubeVendedor?.nome || "clube"} recua um pouco: aceita a partir de ${formatarMoeda(n.valorPedido)}.` });
    } else if (n.rodadaClube > n.maxRodadasClube) {
        n.historicoClube.push({ autor: "clube", texto: `O ${clubeVendedor?.nome || "clube"} encerra as conversas — valor longe demais do esperado.` });
        setTimeout(() => window.managerFecharNegociacao(true), 1400);
    } else {
        n.historicoClube.push({ autor: "clube", texto: `Valor considerado baixo demais. O ${clubeVendedor?.nome || "clube"} mantém o pedido em ${formatarMoeda(n.valorPedido)}.` });
    }
    renderManagerNegociacaoModal();
};

// 🖋️ Etapa 2: termos pessoais com o próprio jogador — mesma lógica de
// expectativa (OVR frente ao NOVO clube + salário atual) usada em
// managerPropoRenovacao, adaptada pra uma contratação em vez de renovação.
window.managerProporTermosJogador = function() {
    const n = managerNegociacaoAtual;
    if (!n || n.fase !== "jogador") return;
    const alvo = jogadoresIA.find(p => p.id === n.jogadorId);
    const clubeComprador = clubeManagerAtual();
    if (!alvo || !clubeComprador) return;
    const salario = Math.max(5000, parseInt(document.getElementById("negManagerSalarioInput")?.value) || salarioAtualJogador(alvo));
    const anos = Math.max(1, Math.min(5, parseInt(document.getElementById("negManagerAnosInput")?.value) || 3));
    n.salarioProposto = salario; n.anosPropostos = anos;
    n.historicoJogador.push({ autor: "voce", texto: `Propõe ${formatarMoeda(salario)}/semana por ${anos} ano(s).` });

    const salarioBase = salarioAtualJogador(alvo);
    const fatorOvr = 1 + Math.max(0, (alvo.geral - (clubeComprador.reputacao || 70))) * 0.03;
    const fatorFelicidade = 0.9 + ((alvo.felicidade || 60) / 100) * 0.3;
    const expectativaSalario = salarioBase * fatorOvr * fatorFelicidade;
    const razaoOferta = salario / expectativaSalario;
    n.rodadaJogador++;
    const chanceAceitar = Math.max(0.05, Math.min(0.97, 0.35 + (razaoOferta - 1) * 1.4));

    if (Math.random() < chanceAceitar) {
        n.historicoJogador.push({ autor: "jogador", texto: `Topo! Assino por ${formatarMoeda(salario)}/semana, ${anos} ano(s).` });
        window.managerConcluirContratacao();
    } else if (n.rodadaJogador > n.maxRodadasJogador) {
        n.historicoJogador.push({ autor: "jogador", texto: `Não chegamos a um acordo sobre os termos pessoais. Prefiro ficar onde estou.` });
        setTimeout(() => window.managerFecharNegociacao(true), 1400);
    } else {
        const pedidoJogador = Math.floor(expectativaSalario * (1.02 + Math.random() * 0.06));
        n.historicoJogador.push({ autor: "jogador", texto: `Isso fica curto. Quero algo perto de ${formatarMoeda(pedidoJogador)}/semana.` });
        n.salarioProposto = pedidoJogador;
    }
};

// 🎯 MENU DE CONTEXTO DO JOGADOR - clique direito para definir funções
window.abrirMenuContextoJogador = function(event, jogadorId) {
    event.preventDefault();
    event.stopPropagation();
    
    // Remove menu existente
    const menuExistente = document.getElementById("menu-contexto-jogador");
    if (menuExistente) menuExistente.remove();
    
    const jogador = jogadoresIA.find(p => p.id === jogadorId) || (jogador && jogador.id === jogadorId ? jogador : null);
    if (!jogador) return;
    
    const clube = clubeManagerAtual();
    if (!clube) return;
    
    // Inicializa funções do jogador se não existirem
    if (!managerEstado.funcoesJogadores) managerEstado.funcoesJogadores = {};
    if (!managerEstado.funcoesJogadores[jogadorId]) {
        managerEstado.funcoesJogadores[jogadorId] = {
            capitao: false,
            cobradorFalta: false,
            cobradorPenalti: false,
            estiloComBola: "equilibrado",
            estiloSemBola: "equilibrado"
        };
    }
    
    const funcoes = managerEstado.funcoesJogadores[jogadorId];
    
    // Verifica capitão atual
    let capitaoAtualId = null;
    Object.values(managerEstado.funcoesJogadores).forEach(f => {
        if (f.capitao) capitaoAtualId = Object.keys(managerEstado.funcoesJogadores).find(k => managerEstado.funcoesJogadores[k] === f);
    });
    
    const menu = document.createElement("div");
    menu.id = "menu-contexto-jogador";
    menu.style.cssText = `
        position: fixed;
        left: ${event.clientX}px;
        top: ${event.clientY}px;
        background: rgba(20, 20, 30, 0.98);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        padding: 8px 0;
        min-width: 220px;
        z-index: 10000;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
    `;
    
    const estilosComBola = ["defensivo", "equilibrado", "ofensivo"];
    const estilosSemBola = ["passivo", "equilibrado", "agressivo"];
    
    menu.innerHTML = `
        <div style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 8px;">
            <strong style="color: #fff; font-size: 0.95rem;">${jogador.nome}</strong>
            <div style="color: #888; font-size: 0.8rem;">${jogador.posicao} • OVR ${jogador.geral}</div>
        </div>
        
        <div class="menu-item" onclick="alternarFuncaoJogador('${jogadorId}', 'capitao')" style="padding: 10px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: ${funcoes.capitao ? '#10b981' : '#fff'}; hover:rgba(255,255,255,0.05);">
            <span>🧢 Capitão</span>
            <span style="font-size: 0.8rem;">${funcoes.capitao ? '✓' : ''}</span>
        </div>
        
        <div class="menu-item" onclick="alternarFuncaoJogador('${jogadorId}', 'cobradorFalta')" style="padding: 10px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: ${funcoes.cobradorFalta ? '#10b981' : '#fff'};">
            <span>⚽ Cobrador de Falta</span>
            <span style="font-size: 0.8rem;">${funcoes.cobradorFalta ? '✓' : ''}</span>
        </div>
        
        <div class="menu-item" onclick="alternarFuncaoJogador('${jogadorId}', 'cobradorPenalti')" style="padding: 10px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: ${funcoes.cobradorPenalti ? '#10b981' : '#fff'};">
            <span>🎯 Cobrador de Pênalti</span>
            <span style="font-size: 0.8rem;">${funcoes.cobradorPenalti ? '✓' : ''}</span>
        </div>
        
        <div style="padding: 8px 16px; margin: 8px 0; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div style="color: #888; font-size: 0.75rem; margin-bottom: 4px;">Estilo com Bola</div>
            ${estilosComBola.map(estilo => `
                <div onclick="definirEstiloJogador('${jogadorId}', 'estiloComBola', '${estilo}')" 
                     style="padding: 6px 12px; cursor: pointer; border-radius: 6px; color: ${funcoes.estiloComBola === estilo ? '#10b981' : '#aaa'}; background: ${funcoes.estiloComBola === estilo ? 'rgba(16, 185, 129, 0.15)' : 'transparent'}; font-size: 0.85rem; margin-bottom: 2px;">
                    ${estilo.charAt(0).toUpperCase() + estilo.slice(1)}${funcoes.estiloComBola === estilo ? ' ✓' : ''}
                </div>
            `).join('')}
        </div>
        
        <div style="padding: 8px 16px;">
            <div style="color: #888; font-size: 0.75rem; margin-bottom: 4px;">Estilo sem Bola</div>
            ${estilosSemBola.map(estilo => `
                <div onclick="definirEstiloJogador('${jogadorId}', 'estiloSemBola', '${estilo}')" 
                     style="padding: 6px 12px; cursor: pointer; border-radius: 6px; color: ${funcoes.estiloSemBola === estilo ? '#10b981' : '#aaa'}; background: ${funcoes.estiloSemBola === estilo ? 'rgba(16, 185, 129, 0.15)' : 'transparent'}; font-size: 0.85rem; margin-bottom: 2px;">
                    ${estilo.charAt(0).toUpperCase() + estilo.slice(1)}${funcoes.estiloSemBola === estilo ? ' ✓' : ''}
                </div>
            `).join('')}
        </div>
    `;
    
    // Adiciona hover effects
    menu.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('mouseenter', () => item.style.background = 'rgba(255,255,255,0.08)');
        item.addEventListener('mouseleave', () => item.style.background = 'transparent');
    });
    
    document.body.appendChild(menu);
    
    // Fecha menu ao clicar fora
    setTimeout(() => {
        document.addEventListener('click', fecharMenuContextoJogador, { once: true });
    }, 0);
};

window.fecharMenuContextoJogador = function() {
    const menu = document.getElementById("menu-contexto-jogador");
    if (menu) menu.remove();
};

window.alternarFuncaoJogador = function(jogadorId, funcao) {
    if (!managerEstado.funcoesJogadores) managerEstado.funcoesJogadores = {};
    if (!managerEstado.funcoesJogadores[jogadorId]) {
        managerEstado.funcoesJogadores[jogadorId] = {
            capitao: false,
            cobradorFalta: false,
            cobradorPenalti: false,
            estiloComBola: "equilibrado",
            estiloSemBola: "equilibrado"
        };
    }
    
    // Se for capitão, remove de qualquer outro jogador
    if (funcao === 'capitao') {
        Object.keys(managerEstado.funcoesJogadores).forEach(id => {
            if (managerEstado.funcoesJogadores[id].capitao) {
                managerEstado.funcoesJogadores[id].capitao = false;
            }
        });
    }
    
    // Se for cobrador, remove de qualquer outro jogador (apenas um por função)
    if (funcao === 'cobradorFalta' || funcao === 'cobradorPenalti') {
        Object.keys(managerEstado.funcoesJogadores).forEach(id => {
            if (managerEstado.funcoesJogadores[id][funcao]) {
                managerEstado.funcoesJogadores[id][funcao] = false;
            }
        });
    }
    
    managerEstado.funcoesJogadores[jogadorId][funcao] = !managerEstado.funcoesJogadores[jogadorId][funcao];
    
    window.salvarJogo();
    fecharMenuContextoJogador();
    renderizarManager(); // Re-render para mostrar mudanças
};

window.definirEstiloJogador = function(jogadorId, tipo, valor) {
    if (!managerEstado.funcoesJogadores) managerEstado.funcoesJogadores = {};
    if (!managerEstado.funcoesJogadores[jogadorId]) {
        managerEstado.funcoesJogadores[jogadorId] = {
            capitao: false,
            cobradorFalta: false,
            cobradorPenalti: false,
            estiloComBola: "equilibrado",
            estiloSemBola: "equilibrado",
            papel: null // Papel tático (Armador, Mezzala, etc.)
        };
    }
    
    managerEstado.funcoesJogadores[jogadorId][tipo] = valor;
    
    window.salvarJogo();
    fecharMenuContextoJogador();
    mostrarToast("Funções", `Estilo ${tipo === 'estiloComBola' ? 'com bola' : 'sem bola'} definido para ${valor}`, "success");
};

// 🎭 PAPÉIS TÁTICOS POR POSIÇÃO
const PAPÉIS_POR_POSICAO = {
    "GOL": ["Goleiro Clássico", "Goleiro Libero", "Sweeper Keeper"],
    "ZAG": ["Zagueiro Central", "Zagueiro Libero", "Zagueiro Bola"],
    "LE": ["Lateral Clássico", "Lateral Ala", "Lateral Invertido", "Carrilero"],
    "LD": ["Lateral Clássico", "Lateral Ala", "Lateral Invertido", "Carrilero"],
    "VOL": ["Volante Defensivo", "Volante Box-to-Box", "Mezzala", "Regista", "Segundo Volante"],
    "MEI": ["Armador Clássico", "Mezzala", "Segundo Volante", "Box-to-Box", "Organizador Recuado", "Carrilero", "Winger"],
    "PE": ["Ponta Clássico", "Ponta Invertido", "Winger", "Inside Forward"],
    "PD": ["Ponta Clássico", "Ponta Invertido", "Winger", "Inside Forward"],
    "ATA": ["Homem-Alvo", "Falso 9", "Caçador", "Pressionador", "Atacante Completo", "Segundo Atacante"]
};

// 📋 INSTRUÇÕES INDIVIDUAIS POR POSIÇÃO
const INSTRUÇÕES_POR_POSICAO = {
    "ATA": ["Pressionar zagueiros", "Ficar centralizado", "Atacar profundidade", "Recuar para criar", "Segurar a bola", "Virar para o gol"],
    "PE": ["Cortar para dentro", "Ir à linha de fundo", "Voltar para marcar", "Flutuar livremente", "Cruzar sempre", "Chutar mais"],
    "PD": ["Cortar para dentro", "Ir à linha de fundo", "Voltar para marcar", "Flutuar livremente", "Cruzar sempre", "Chutar mais"],
    "MEI": ["Ficar recuado", "Subir ao ataque", "Marcar individualmente", "Cobrir laterais", "Criar jogadas", "Chutar de longe"],
    "VOL": ["Ficar na frente da defesa", "Subir ao ataque", "Marcar individualmente", "Cobrir laterais", "Iniciar jogadas", "Pressionar alto"],
    "LE": ["Nunca subir", "Apoiar o ataque", "Atacar sempre", "Inverter para o meio", "Cruzar sempre", "Marcar individualmente"],
    "LD": ["Nunca subir", "Apoiar o ataque", "Atacar sempre", "Inverter para o meio", "Cruzar sempre", "Marcar individualmente"],
    "ZAG": ["Marcar por zona", "Marcar individualmente", "Subir em escanteios", "Sair com a bola", "Ficar recuado", "Pressionar alto"],
    "GOL": ["Sair com os pés", "Ficar na linha", "Antecipar jogadas", "Lançar rápido", "Segurar bola"]
};

window.abrirMenuContextoJogador = function(event, jogadorId) {
    event.preventDefault();
    event.stopPropagation();
    
    // Remove menu existente
    const menuExistente = document.getElementById("menu-contexto-jogador");
    if (menuExistente) menuExistente.remove();
    
    const jogador = jogadoresIA.find(p => p.id === jogadorId) || (jogador && jogador.id === jogadorId ? jogador : null);
    if (!jogador) return;
    
    const clube = clubeManagerAtual();
    if (!clube) return;
    
    // Inicializa funções do jogador se não existirem
    if (!managerEstado.funcoesJogadores) managerEstado.funcoesJogadores = {};
    if (!managerEstado.funcoesJogadores[jogadorId]) {
        managerEstado.funcoesJogadores[jogadorId] = {
            capitao: false,
            cobradorFalta: false,
            cobradorPenalti: false,
            estiloComBola: "equilibrado",
            estiloSemBola: "equilibrado",
            papel: null
        };
    }
    
    // Inicializa instruções individuais se não existirem
    if (!managerEstado.instrucoesIndividuais) managerEstado.instrucoesIndividuais = {};
    if (!managerEstado.instrucoesIndividuais[jogadorId]) {
        managerEstado.instrucoesIndividuais[jogadorId] = [];
    }
    
    const funcoes = managerEstado.funcoesJogadores[jogadorId];
    const instrucoes = managerEstado.instrucoesIndividuais[jogadorId];
    
    // Obtém papéis disponíveis para a posição
    const posicaoNormalizada = jogador.posicao.toUpperCase();
    const papéisDisponiveis = PAPÉIS_POR_POSICAO[posicaoNormalizada] || ["Universal"];
    const instrucoesDisponiveis = INSTRUÇÕES_POR_POSICAO[posicaoNormalizada] || [];
    
    const menu = document.createElement("div");
    menu.id = "menu-contexto-jogador";
    menu.style.cssText = `
        position: fixed;
        left: ${event.clientX}px;
        top: ${event.clientY}px;
        background: rgba(20, 20, 30, 0.98);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        padding: 8px 0;
        min-width: 260px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 10000;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
    `;
    
    const estilosComBola = ["defensivo", "equilibrado", "ofensivo"];
    const estilosSemBola = ["passivo", "equilibrado", "agressivo"];
    
    let menuHTML = `
        <div style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 8px;">
            <strong style="color: #fff; font-size: 0.95rem;">${jogador.nome}</strong>
            <div style="color: #888; font-size: 0.8rem;">${jogador.posicao} • OVR ${jogador.geral}</div>
        </div>
        
        <div style="padding: 8px 16px; margin: 8px 0; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div style="color: #10b981; font-size: 0.75rem; font-weight: 700; margin-bottom: 6px;">🎭 PAPEL TÁTICO</div>
            ${papéisDisponiveis.map(papel => `
                <div onclick="definirPapelJogador('${jogadorId}', '${papel}')" 
                     style="padding: 6px 12px; cursor: pointer; border-radius: 6px; color: ${funcoes.papel === papel ? '#10b981' : '#aaa'}; background: ${funcoes.papel === papel ? 'rgba(16, 185, 129, 0.15)' : 'transparent'}; font-size: 0.85rem; margin-bottom: 2px;">
                    ${papel}${funcoes.papel === papel ? ' ✓' : ''}
                </div>
            `).join('')}
            <div onclick="definirPapelJogador('${jogadorId}', null)" 
                 style="padding: 6px 12px; cursor: pointer; border-radius: 6px; color: ${!funcoes.papel ? '#10b981' : '#aaa'}; background: ${!funcoes.papel ? 'rgba(16, 185, 129, 0.15)' : 'transparent'}; font-size: 0.85rem; margin-bottom: 2px;">
                Nenhum${!funcoes.papel ? ' ✓' : ''}
            </div>
        </div>
        
        <div class="menu-item" onclick="alternarFuncaoJogador('${jogadorId}', 'capitao')" style="padding: 10px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: ${funcoes.capitao ? '#10b981' : '#fff'};">
            <span>🧢 Capitão</span>
            <span style="font-size: 0.8rem;">${funcoes.capitao ? '✓' : ''}</span>
        </div>
        
        <div class="menu-item" onclick="alternarFuncaoJogador('${jogadorId}', 'cobradorFalta')" style="padding: 10px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: ${funcoes.cobradorFalta ? '#10b981' : '#fff'};">
            <span>⚽ Cobrador de Falta</span>
            <span style="font-size: 0.8rem;">${funcoes.cobradorFalta ? '✓' : ''}</span>
        </div>
        
        <div class="menu-item" onclick="alternarFuncaoJogador('${jogadorId}', 'cobradorPenalti')" style="padding: 10px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: ${funcoes.cobradorPenalti ? '#10b981' : '#fff'};">
            <span>🎯 Cobrador de Pênalti</span>
            <span style="font-size: 0.8rem;">${funcoes.cobradorPenalti ? '✓' : ''}</span>
        </div>
        
        <div style="padding: 8px 16px; margin: 8px 0; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div style="color: #888; font-size: 0.75rem; margin-bottom: 4px;">Estilo com Bola</div>
            ${estilosComBola.map(estilo => `
                <div onclick="definirEstiloJogador('${jogadorId}', 'estiloComBola', '${estilo}')" 
                     style="padding: 6px 12px; cursor: pointer; border-radius: 6px; color: ${funcoes.estiloComBola === estilo ? '#10b981' : '#aaa'}; background: ${funcoes.estiloComBola === estilo ? 'rgba(16, 185, 129, 0.15)' : 'transparent'}; font-size: 0.85rem; margin-bottom: 2px;">
                    ${estilo.charAt(0).toUpperCase() + estilo.slice(1)}${funcoes.estiloComBola === estilo ? ' ✓' : ''}
                </div>
            `).join('')}
        </div>
        
        <div style="padding: 8px 16px;">
            <div style="color: #888; font-size: 0.75rem; margin-bottom: 4px;">Estilo sem Bola</div>
            ${estilosSemBola.map(estilo => `
                <div onclick="definirEstiloJogador('${jogadorId}', 'estiloSemBola', '${estilo}')" 
                     style="padding: 6px 12px; cursor: pointer; border-radius: 6px; color: ${funcoes.estiloSemBola === estilo ? '#10b981' : '#aaa'}; background: ${funcoes.estiloSemBola === estilo ? 'rgba(16, 185, 129, 0.15)' : 'transparent'}; font-size: 0.85rem; margin-bottom: 2px;">
                    ${estilo.charAt(0).toUpperCase() + estilo.slice(1)}${funcoes.estiloSemBola === estilo ? ' ✓' : ''}
                </div>
            `).join('')}
        </div>
    `;
    
    // Adiciona instruções individuais se disponíveis
    if (instrucoesDisponiveis.length > 0) {
        menuHTML += `
            <div style="padding: 8px 16px; margin: 8px 0; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="color: #f59e0b; font-size: 0.75rem; font-weight: 700; margin-bottom: 6px;">📋 INSTRUÇÕES INDIVIDUAIS</div>
                ${instrucoesDisponiveis.map(inst => `
                    <div onclick="alternarInstrucaoJogador('${jogadorId}', '${inst}')" 
                         style="padding: 6px 12px; cursor: pointer; border-radius: 6px; color: ${instrucoes.includes(inst) ? '#f59e0b' : '#aaa'}; background: ${instrucoes.includes(inst) ? 'rgba(245, 158, 11, 0.15)' : 'transparent'}; font-size: 0.85rem; margin-bottom: 2px;">
                        ${instrucoes.includes(inst) ? '✓ ' : ''}${inst}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    menu.innerHTML = menuHTML;
    
    // Adiciona hover effects
    menu.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('mouseenter', () => item.style.background = 'rgba(255,255,255,0.08)');
        item.addEventListener('mouseleave', () => item.style.background = 'transparent');
    });
    
    document.body.appendChild(menu);
    
    // Fecha menu ao clicar fora
    setTimeout(() => {
        document.addEventListener('click', fecharMenuContextoJogador, { once: true });
    }, 0);
};

window.definirPapelJogador = function(jogadorId, papel) {
    if (!managerEstado.funcoesJogadores) managerEstado.funcoesJogadores = {};
    if (!managerEstado.funcoesJogadores[jogadorId]) {
        managerEstado.funcoesJogadores[jogadorId] = {
            capitao: false,
            cobradorFalta: false,
            cobradorPenalti: false,
            estiloComBola: "equilibrado",
            estiloSemBola: "equilibrado",
            papel: null
        };
    }
    
    managerEstado.funcoesJogadores[jogadorId].papel = papel;
    
    window.salvarJogo();
    fecharMenuContextoJogador();
    renderizarManager();
    mostrarToast("Papel Tático", papel ? `Papel definido: ${papel}` : "Papel removido", "success");
};

window.alternarInstrucaoJogador = function(jogadorId, instrucao) {
    if (!managerEstado.instrucoesIndividuais) managerEstado.instrucoesIndividuais = {};
    if (!managerEstado.instrucoesIndividuais[jogadorId]) {
        managerEstado.instrucoesIndividuais[jogadorId] = [];
    }
    
    const instrucoes = managerEstado.instrucoesIndividuais[jogadorId];
    const index = instrucoes.indexOf(instrucao);
    
    if (index > -1) {
        instrucoes.splice(index, 1);
    } else {
        instrucoes.push(instrucao);
    }
    
    window.salvarJogo();
    fecharMenuContextoJogador();
    renderizarManager();
};

// ✅ Fecha o acordo de verdade: só agora o dinheiro muda de mãos e o jogador
// troca de clube — antes disso (enquanto a negociação corre) nada é debitado.
window.managerConcluirContratacao = function() {
    const n = managerNegociacaoAtual;
    if (!n) return;
    const alvo = jogadoresIA.find(p => p.id === n.jogadorId);
    const clube = clubeManagerAtual();
    if (!alvo || !clube) { window.managerFecharNegociacao(); return; }
    const origem = alvo.clubeId;
    alvo.clubeId = clube.id;
    alvo.contrato = n.anosPropostos || 3;
    alvo.salarioSemanal = n.salarioProposto;
    alvo.felicidade = Math.min(100, (alvo.felicidade || 60) + 8);
    managerEstado.orcamentoTransferencias -= n.valorAcordado;
    managerEstado.folhaSalarial = calcularFolhaClube(clube.id);
    managerEstado.confianca = Math.min(100, managerEstado.confianca + (alvo.geral >= clube.reputacao ? 4 : 2));
    registrarMovimentacao({ jogadorNome: alvo.nome, jogadorId: alvo.id, tipo: "transferencia", valor: n.valorAcordado, origemId: origem, destinoId: clube.id, janela: "Modo Manager" });
    mostrarToast("Reforço contratado", `${alvo.nome} assinou com o ${clube.nome} por ${formatarMoeda(n.valorAcordado)} + ${formatarMoeda(n.salarioProposto)}/semana.`, "success");
    setTimeout(() => window.managerFecharNegociacao(), 900);
    window.salvarJogo();
    renderizarManager();
};

window.managerFecharNegociacao = function(semAcordo = false) {
    if (managerNegociacaoAtual && semAcordo) {
        mostrarToast("Negociação encerrada", "A contratação não foi fechada.", "warning");
    }
    managerNegociacaoAtual = null;
    document.getElementById("modalNegociacao")?.classList.add("oculto");
};

window.managerPromoverJovem = function(baseId) {
    const clube = clubeManagerAtual();
    const jovem = managerEstado.base?.find(j => j.id === baseId);
    if(!clube || !jovem) return;
    const jaPromovidos = managerEstado.promocoesBaseTemporada || 0;
    if (jaPromovidos >= LIMITE_PROMOCOES_BASE_POR_TEMPORADA) {
        mostrarToast("Limite atingido", `Você já promoveu ${LIMITE_PROMOCOES_BASE_POR_TEMPORADA} jovens da base nesta temporada. Espere a próxima janela para promover mais.`, "danger");
        return;
    }
    jogadoresIA.push({
        ...jovem,
        clubeId: clube.id,
        contrato: 3,
        felicidade: 75,
        inteligencia: 55,
        statsTemporada: { jogos:0, gols:0, assistencias:0, notas:[] },
        historicoCarreira: []
    });
    managerEstado.base = managerEstado.base.filter(j => j.id !== baseId);
    managerEstado.promocoesBaseTemporada = jaPromovidos + 1;
    managerEstado.confianca = Math.min(100, managerEstado.confianca + 2);
    registrarNoticia("Promocao da base", `${jovem.nome} subiu ao profissional do ${clube.nome}.`, "Base");
    window.salvarJogo();
    renderizarManager();
};

// 🎮 MOTOR REAL DO MANAGER
// Roda a mesma classe MatchEngine que já move o Modo Jogador — minuto a
// minuto, com remates, defesas, escanteios e pênaltis de verdade — só que
// sem um jogador humano em campo, então quem marca/assiste sai sorteado
// dentro do próprio elenco de cada clube (como já acontece com qualquer NPC).
window.reproduzirSimulacaoManagerReal = function(engine, casa, visita) {
    return new Promise(resolve => {
        const modal = document.getElementById("modalPartida");
        if (!modal) { resolve({ gc: 0, gv: 0, marcadores: [] }); return; }
        modal.classList.remove("oculto");
        setText("placarTimeCasa", casa.nome); setText("placarTimeVisita", visita.nome);
        setText("placarMarcadorCasa", "0"); setText("placarMarcadorVisita", "0"); setText("uiMinutoJogo", "0'");
        const imgCasa = document.getElementById("imgTimeCasa"); const imgVisita = document.getElementById("imgTimeVisita");
        if (imgCasa) imgCasa.src = obterUrlImagem(casa, "clube");
        if (imgVisita) imgVisita.src = obterUrlImagem(visita, "clube");
        const botaoFechar = document.getElementById("btnFecharModalPartida");
        if (botaoFechar) { botaoFechar.classList.add("oculto"); botaoFechar.onclick = null; }
        // O botão "Simular com visual" do Manager sempre abre a transmissão,
        // mesmo que o jogador tenha usado a opção rápida na partida anterior.
        window.visualPartidaAtiva = true;
        window.engineAoVivo = engine;
        window.prepararVisualizacaoPartida(casa.nome, visita.nome, casa.id, visita.id);
        engine.simularPartidaAoVivo((min, gc, gv, evento, snapshot) => {
            setText("uiMinutoJogo", `${min}'`); setText("placarMarcadorCasa", gc); setText("placarMarcadorVisita", gv);
            window.atualizarVisualizacaoPartida(min, evento || "Bola em jogo", gc, gv);
            if (evento) {
                const textoPuro = evento.replace(/<[^>]*>/g, "");
                if (/GOLO|GOL /i.test(textoPuro)) window.tocarSom?.("gol", 0.5);
            }
            window.atualizarCentralPartida(min, evento, snapshot);
        }, (gc, gv, marcadores) => {
            window.tocarSom?.("apito_fim");
            setText("placarMarcadorCasa", gc); setText("placarMarcadorVisita", gv);
            const listaEventos = document.getElementById("cpEventosList");
            if (listaEventos) listaEventos.insertAdjacentHTML("afterbegin", `<div class="cp-event cp-event-fim"><span class="cp-event-min">90'</span><div class="cp-event-main"><span class="cp-event-badge cp-badge-fim">FIM DE JOGO</span><span class="cp-event-body">${casa.nome} ${gc} x ${gv} ${visita.nome}</span></div></div>`);
            if (botaoFechar) {
                botaoFechar.textContent = "Confirmar Resultado ➔";
                botaoFechar.classList.remove("oculto");
                botaoFechar.onclick = () => { modal.classList.add("oculto"); resolve({ gc, gv, marcadores }); };
            } else resolve({ gc, gv, marcadores });
        }, (tipo, callback) => window.abrirMiniJogoPenalti(tipo, callback));
    });
};

// Depois do motor terminar, os gols/assistências dos artilheiros já foram
// creditados ao statsTemporada em tempo real pelo próprio MatchEngine (é ele
// quem sorteia o autor a cada lance). Falta só o que o motor não faz sozinho
// para NPCs: contar jogo disputado, gerar estatística defensiva real para
// zagueiros/laterais/goleiros, e preencher o balde de artilharia POR
// competição (statsCompeticoes), separado do total da temporada.
function creditarPartidaManagerReal(clubeMandanteId, clubeVisitanteId, golsCasa, golsVisita, marcadores, compId) {
    [[clubeMandanteId, golsVisita], [clubeVisitanteId, golsCasa]].forEach(([clubeId, golsSofridos]) => {
        const elenco = montarEscalacaoJogo(clubeId);
        if (elenco.length === 0) return;
        const jogoLimpo = golsSofridos === 0;
        elenco.forEach(j => {
            if (!j.statsTemporada) j.statsTemporada = { jogos: 0, gols: 0, assistencias: 0 };
            j.statsTemporada.jogos++;
            registrarEstatisticaCompeticao(j, compId, 1, 0, 0);
            if (["Zagueiro", "Lateral", "Goleiro"].includes(j.posicao)) {
                if (!j.statsTemporada.desarmes) j.statsTemporada.desarmes = 0;
                if (!j.statsTemporada.interceptacoes) j.statsTemporada.interceptacoes = 0;
                if (!j.statsTemporada.defesas) j.statsTemporada.defesas = 0;
                if (!j.statsTemporada.jogosSemSofrerGol) j.statsTemporada.jogosSemSofrerGol = 0;
                const fatorOvr = Math.max(0, ((j.geral || 60) - 58)) / 100;
                if (j.posicao === "Goleiro") {
                    const fatorReflexos = fatorAtributoIndividual(j, "reflexos");
                    j.statsTemporada.defesas += Math.round((1.5 + fatorOvr * 3.2) * fatorReflexos + Math.random() * 2 - golsSofridos * 0.3);
                } else {
                    const fatorDefesa = fatorAtributoIndividual(j, "defesa");
                    j.statsTemporada.desarmes += Math.round((0.6 + fatorOvr * 2.0) * fatorDefesa + Math.random() * 1.4);
                    j.statsTemporada.interceptacoes += Math.round((0.5 + fatorOvr * 1.6) * fatorDefesa + Math.random() * 1.2);
                }
                if (jogoLimpo) j.statsTemporada.jogosSemSofrerGol++;
            }
        });
    });
    (marcadores || []).forEach(id => {
        const autor = id === "player" ? jogador : jogadoresIA.find(j => j.id === id);
        if (autor) registrarEstatisticaCompeticao(autor, compId, 0, 1, 0);
    });
}

// Reproduz o resultado já decidido pelo Manager como uma transmissão curta.
// Não usa o MatchEngine para não duplicar a rodada mundial; só apresenta os
// lances antes de aplicar a mesma atualização de tabela que já existia.
window.reproduzirSimulacaoManager = function(casa, visita, golsCasa, golsVisita, usarVisual = true) {
    if (!usarVisual) return Promise.resolve();
    return new Promise(resolve => {
        const modal = document.getElementById("modalPartida");
        if (!modal) { resolve(); return; }
        modal.classList.remove("oculto");
        setText("placarTimeCasa", casa.nome); setText("placarTimeVisita", visita.nome);
        setText("placarMarcadorCasa", "0"); setText("placarMarcadorVisita", "0"); setText("uiMinutoJogo", "0'");
        const imgCasa = document.getElementById("imgTimeCasa"); const imgVisita = document.getElementById("imgTimeVisita");
        if (imgCasa) imgCasa.src = obterUrlImagem(casa, "clube");
        if (imgVisita) imgVisita.src = obterUrlImagem(visita, "clube");
        const botaoFechar = document.getElementById("btnFecharModalPartida");
        if (botaoFechar) { botaoFechar.classList.add("oculto"); botaoFechar.onclick = null; }
        // 🎙️ Minutos mais numerosos e espalhados por todo o jogo (em vez de só
        // 7 marcas) para que a transmissão pareça uma partida inteira, não uma
        // sequência de golos. Os golos são distribuídos entre os minutos do
        // meio do jogo, e o resto é preenchido com lances variados (remates,
        // defesas, escanteios) que alimentam a barra de estatísticas ao vivo.
        const minutos = [1, 6, 11, 17, 23, 29, 35, 40, 45, 51, 57, 63, 69, 75, 81, 86, 90];
        const slotsGol = minutos.map((_, i) => i).filter(i => i > 0 && i < minutos.length - 1);
        for (let i = slotsGol.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [slotsGol[i], slotsGol[j]] = [slotsGol[j], slotsGol[i]]; }
        const eventosPorSlot = {};
        const eventosGols = [...Array(golsCasa).fill(casa.nome), ...Array(golsVisita).fill(visita.nome)];
        eventosGols.forEach((nomeTime, idx) => {
            const slot = slotsGol[idx % slotsGol.length];
            eventosPorSlot[slot] = `GOLO do ${nomeTime}`;
        });
        const LANCES = [
            { tipo: "chute", texto: "chuta ao alvo e obriga a defesa" },
            { tipo: "ataque", texto: "arranca em contra-ataque" },
            { tipo: "escanteio", texto: "cobra escanteio na área" },
            { tipo: "fora", texto: "finaliza mas manda por cima" },
            { tipo: "pressao", texto: "pressiona a saída de bola" }
        ];
        let passo = 0; let exibidosCasa = 0; let exibidosVisita = 0;

        // 📊 Este replay não roda o MatchEngine (o placar já foi decidido em
        // outro lugar, pra não duplicar a rodada) — mas monta o MESMO formato
        // de estatísticas/notas que o motor real usa, com autor/assistência
        // sorteados por posição entre os jogadores de verdade dos dois
        // elencos, pra Central da Partida ficar consistente em qualquer modo.
        const elencoCasa = (typeof montarEscalacaoJogo === "function" ? montarEscalacaoJogo(casa.id) : []).slice(0, 11);
        const elencoVisita = (typeof montarEscalacaoJogo === "function" ? montarEscalacaoJogo(visita.id) : []).slice(0, 11);
        const estatisticas = { casa: cpNovoQuadroStats(), visita: cpNovoQuadroStats() };
        const notas = new Map();
        const garantirNota = (j, lado) => {
            if (!j?.id) return null;
            if (!notas.has(j.id)) notas.set(j.id, { nome: j.nome, lado, nota: 6.0, condicao: 100, cartao: null, gols: 0, assist: 0 });
            return notas.get(j.id);
        };
        const ajustarNota = (j, lado, delta) => { const e = garantirNota(j, lado); if (e) e.nota = Math.max(3.5, Math.min(10, +(e.nota + delta).toFixed(1))); };
        const elencoDoLado = (lado) => lado === "casa" ? elencoCasa : elencoVisita;

        // O botão "Simular com visual" do Manager sempre abre a transmissão,
        // mesmo que o jogador tenha usado a opção rápida na partida anterior.
        window.visualPartidaAtiva = true;
        window.prepararVisualizacaoPartida(casa.nome, visita.nome, casa.id, visita.id);
        const timer = setInterval(() => {
            const minuto = minutos[passo] || 90;
            const ladoGol = eventosPorSlot[passo];
            let textoEvento, evento = null;

            if (ladoGol) {
                const elencoAtaque = elencoDoLado(ladoGol);
                const nomeTime = ladoGol === "casa" ? casa.nome : visita.nome;
                const autor = sortearPonderado(elencoAtaque, PESO_GOL_POS) || { nome: "Autor desconhecido" };
                const assist = Math.random() < 0.6 ? sortearPonderado(elencoAtaque.filter(j => j.id !== autor.id), PESO_AST_POS) : null;
                if (ladoGol === "casa") exibidosCasa++; else exibidosVisita++;
                textoEvento = `GOLO do ${nomeTime}! ${autor.nome}${assist ? ` (assist. ${assist.nome})` : ""} balança as redes.`;
                estatisticas[ladoGol].remates++; estatisticas[ladoGol].alvo++; estatisticas[ladoGol].area++;
                estatisticas[ladoGol].xg = +(estatisticas[ladoGol].xg + 0.4 + Math.random() * 0.2).toFixed(2);
                if (assist) estatisticas[ladoGol].xa = +(estatisticas[ladoGol].xa + 0.35).toFixed(2);
                ajustarNota(autor, ladoGol, 1.0);
                if (assist) ajustarNota(assist, ladoGol, 0.5);
                evento = { tipo: "gol", minuto, lado: ladoGol, jogadorId: autor.id, jogadorNome: autor.nome, assistNome: assist?.nome || null, texto: textoEvento };
            } else if (passo === 0) {
                textoEvento = "Início de jogo";
            } else {
                const ladoAtaque = Math.random() < 0.5 ? "casa" : "visita";
                const nomeTime = ladoAtaque === "casa" ? casa.nome : visita.nome;
                const lance = LANCES[passo % LANCES.length];
                textoEvento = `${nomeTime} ${lance.texto}`;
                const atirador = sortearPonderado(elencoDoLado(ladoAtaque), PESO_GOL_POS);
                const statsAtaque = estatisticas[ladoAtaque];
                let tipoEvento = "defesa";
                if (lance.tipo === "chute") {
                    statsAtaque.remates++; statsAtaque.alvo++; statsAtaque.area++;
                    statsAtaque.xg = +(statsAtaque.xg + 0.15 + Math.random() * 0.1).toFixed(2);
                } else if (lance.tipo === "fora") {
                    statsAtaque.remates++; statsAtaque.fora++;
                    statsAtaque.xg = +(statsAtaque.xg + 0.05 + Math.random() * 0.08).toFixed(2);
                    tipoEvento = "trave";
                } else if (lance.tipo === "escanteio") {
                    statsAtaque.escanteios++;
                    tipoEvento = "escanteio";
                }
                evento = { tipo: tipoEvento, minuto, lado: ladoAtaque, jogadorId: atirador?.id || null, jogadorNome: atirador?.nome || null, texto: textoEvento };
            }

            estatisticas.casa.posse = Math.max(35, Math.min(65, Math.round(estatisticas.casa.posse + (Math.random() * 10 - 5))));
            estatisticas.visita.posse = 100 - estatisticas.casa.posse;
            notas.forEach(n => { n.condicao = Math.max(70, Math.round(100 - (minuto / 90) * 20 - Math.random() * 3)); });
            const snapshot = { estatisticas: { casa: { ...estatisticas.casa }, visita: { ...estatisticas.visita } }, notas: Array.from(notas.entries()).map(([id, d]) => ({ id, ...d })), evento };

            setText("uiMinutoJogo", `${minuto}'`); setText("placarMarcadorCasa", exibidosCasa); setText("placarMarcadorVisita", exibidosVisita);
            window.atualizarVisualizacaoPartida(minuto, textoEvento, exibidosCasa, exibidosVisita);
            window.atualizarCentralPartida(minuto, textoEvento, snapshot);
            passo++;
            if (passo >= minutos.length) {
                clearInterval(timer);
                setText("placarMarcadorCasa", golsCasa); setText("placarMarcadorVisita", golsVisita);
                const listaEventos = document.getElementById("cpEventosList");
                if (listaEventos) listaEventos.insertAdjacentHTML("afterbegin", `<div class="cp-event cp-event-fim"><span class="cp-event-min">90'</span><div class="cp-event-main"><span class="cp-event-badge cp-badge-fim">FIM DE JOGO</span><span class="cp-event-body">${casa.nome} ${golsCasa} x ${golsVisita} ${visita.nome}</span></div></div>`);
                if (botaoFechar) {
                    botaoFechar.textContent = "Confirmar Resultado ➔";
                    botaoFechar.classList.remove("oculto");
                    botaoFechar.onclick = () => { modal.classList.add("oculto"); resolve(); };
                } else resolve();
            }
        }, 900);
    });
};

// ==========================================
// 🎤 COLETIVA DE IMPRENSA (pré e pós-jogo, Modo Manager)
// ==========================================
// Pausa o fluxo da partida (a função é async e usa await na Promise) até o
// treinador escolher uma resposta. Cada resposta mexe na confiança da
// diretoria — não é só decorativo, é outra alavanca de confiança além do
// próprio resultado do jogo.
window.abrirColetivaImprensa = function(momento, ctx = {}) {
    return new Promise(resolve => {
        const clube = clubeManagerAtual();
        const nomeRival = ctx.rival?.nome || "adversário";
        let titulo, pergunta, respostas;

        if (momento === "pre") {
            titulo = "🎤 Coletiva Pré-Jogo";
            pergunta = `Como o ${clube?.nome || "clube"} chega para o confronto contra o ${nomeRival} nesta rodada?`;
            respostas = [
                { texto: "🔥 \"Vamos com tudo, queremos os três pontos.\"", confianca: 2 },
                { texto: "⚖️ \"Respeitamos o rival, mas confiamos no nosso trabalho.\"", confianca: 1 },
                { texto: "🛡️ \"A prioridade é não tomar riscos desnecessários.\"", confianca: 0 }
            ];
        } else {
            const gA = ctx.gA ?? 0, gB = ctx.gB ?? 0;
            titulo = "🎤 Coletiva Pós-Jogo";
            if (gA > gB) {
                pergunta = `Vitória por ${gA} x ${gB} sobre o ${nomeRival}. Qual a sua reação?`;
                respostas = [
                    { texto: "🎉 \"Elenco de parabéns, jogo espetacular!\"", confianca: 3 },
                    { texto: "📈 \"Foi só o começo, tem muito trabalho pela frente.\"", confianca: 1 },
                    { texto: "🙏 \"Fomos felizes, mas ainda precisamos melhorar.\"", confianca: 1 }
                ];
            } else if (gB > gA) {
                pergunta = `Derrota por ${gA} x ${gB} para o ${nomeRival}. Como explica o resultado?`;
                respostas = [
                    { texto: "🤝 \"Assumo a responsabilidade por essa derrota.\"", confianca: 1 },
                    { texto: "😐 \"O adversário foi melhor hoje.\"", confianca: 0 },
                    { texto: "😡 \"A arbitragem prejudicou o nosso time.\"", confianca: -3 }
                ];
            } else {
                pergunta = `Empate em ${gA} x ${gB} com o ${nomeRival}. Qual o balanço da partida?`;
                respostas = [
                    { texto: "👍 \"Resultado justo, seguimos trabalhando.\"", confianca: 1 },
                    { texto: "😕 \"Deveríamos ter vencido esse jogo.\"", confianca: 0 },
                    { texto: "🛡️ \"Um ponto fora de casa sempre vale.\"", confianca: 1 }
                ];
            }
        }

        let modal = document.getElementById("modalColetivaImprensa");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "modalColetivaImprensa";
            modal.className = "modal oculto";
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="modal-content coletiva-modal-content">
                <div class="coletiva-header">
                    <span class="coletiva-flash"></span><span class="coletiva-flash"></span><span class="coletiva-flash"></span>
                    <div class="coletiva-header-inner">
                        <span class="coletiva-mic">🎙️</span>
                        <div><span class="coletiva-kicker">Sala de Imprensa</span><h2>${titulo}</h2></div>
                    </div>
                </div>
                <div class="coletiva-body">
                    <div class="coletiva-pergunta">
                        <span class="coletiva-jornalista">🗞️ Jornalista</span>
                        <p>"${pergunta}"</p>
                    </div>
                    <span class="coletiva-instrucao">Escolhe a tua resposta:</span>
                    <div id="coletivaRespostas" class="coletiva-respostas"></div>
                </div>
            </div>`;
        const areaRespostas = modal.querySelector("#coletivaRespostas");
        respostas.forEach(r => {
            const tom = r.confianca > 0 ? "positiva" : r.confianca < 0 ? "negativa" : "neutra";
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = `coletiva-resposta-btn tom-${tom}`;
            btn.innerHTML = `<span class="coletiva-resposta-texto">${r.texto}</span><span class="coletiva-resposta-tag tom-${tom}">${r.confianca > 0 ? `+${r.confianca}` : r.confianca}</span>`;
            btn.onclick = () => {
                managerEstado.confianca = Math.max(0, Math.min(100, managerEstado.confianca + r.confianca));
                modal.classList.add("oculto");
                if (r.confianca > 0) mostrarToast("Coletiva de Imprensa", `A diretoria gostou da resposta (+${r.confianca} confiança).`, "success");
                else if (r.confianca < 0) mostrarToast("Coletiva de Imprensa", `A resposta não caiu bem na diretoria (${r.confianca} confiança).`, "danger");
                resolve();
            };
            areaRespostas.appendChild(btn);
        });
        modal.classList.remove("oculto");
    });
};

window.managerSimularPartida = async function(comVisual = true) {
    const clube = clubeManagerAtual();
    if(!clube) return;

    // 🌐 MUNDO COMPARTILHADO: sistema de "pronto" — só avança quando o amigo também estiver pronto para esta rodada.
    if (window.connectionMode === 'online' && window.firebaseIntegration && window.firebaseIntegration.aguardarProntoRodada) {
        const pronto = await window.firebaseIntegration.aguardarProntoRodada(rodadaAtual, () => {
            mostrarToast("Mundo Compartilhado", "O teu amigo ficou pronto! A continuar a rodada...", "success");
            window.managerSimularPartida();
        });
        if (!pronto) {
            mostrarToast("Mundo Compartilhado", "Ficaste pronto! A aguardar o teu amigo terminar a rodada dele...", "info");
            return;
        }
    }

    // The global football calendar (agendaTemporada) is the PLAYER-character's
    // personal calendar — gerarAgenda() only builds it when there is a
    // `jogador` (it early-returns otherwise, see comment there). In a pure
    // Manager career (no jogador at all) that array is always empty, so this
    // guard must only apply when a personal calendar actually exists — otherwise
    // it fired on literally the first match and made Manager Mode unplayable.
    if (jogador && agendaTemporada.length > 0) {
        const comp = agendaTemporada[rodadaAtual - 1];
        if(!comp) {
            mostrarToast("Diretoria", "A época terminou para todos os clubes. Fecha a Gala de fim de temporada antes de continuar.", "info");
            return;
        }
    }

    // Guard against managing the same club the player-character already plays
    // for — that fixture is already resolved live via o Modo Jogador, simulating
    // it again here would double-count it in the table.
    if(jogador && clube.id === jogador.clubeId) {
        mostrarToast("Manager", "Este clube já é o teu clube como jogador — disputa esta partida pelo Modo Jogador.", "warning");
        return;
    }

    if(Object.keys(tabelasLigas).length === 0) inicializarTabelas();
    const tabela = tabelasLigas[clube.ligaId];
    if(!tabela) { mostrarToast("Erro", "Tabela da liga do teu clube não foi encontrada.", "danger"); return; }

    const mt = tabela.find(t => t.id === clube.id);
    if(!mt) { mostrarToast("Erro", "O teu clube não consta na tabela desta liga.", "danger"); return; }

    const maxJogos = (tabela.length - 1) * 2;

    // Manager's club already finished its fixtures for this league season — just
    // keep the rest of the world moving (cups, internationals, other leagues)
    // until the global season rolls over to the Gala.
    if(mt.jogos >= maxJogos) {
        mostrarToast("Diretoria", "O teu clube já disputou todos os jogos da liga esta época. A avançar o resto do mundo...", "info");
        await window.simularRodadaMundialOnline();
        gerarPropostasRecebidas(clube);
        rodadaAtual++;
        window.salvarJogo();
        if(typeof atualizarHub === 'function') atualizarHub();
        renderizarManager();
        return;
    }

    const rivaisElegiveis = tabela.filter(t => t.id !== clube.id && t.jogos < maxJogos);
    const advEntry = rivaisElegiveis[Math.floor(Math.random() * rivaisElegiveis.length)];
    if(!advEntry) {
        mostrarToast("Diretoria", "Nenhum adversário disponível esta semana. A avançar a semana...", "info");
        await window.simularRodadaMundialOnline();
        gerarPropostasRecebidas(clube);
        rodadaAtual++;
        window.salvarJogo();
        if(typeof atualizarHub === 'function') atualizarHub();
        renderizarManager();
        return;
    }
    const rival = clubes.find(c => c.id === advEntry.id);

    // 🎤 Coletiva pré-jogo: pausa aqui até o treinador responder.
    await window.abrirColetivaImprensa("pre", { rival });

    // 🎮 MOTOR REAL: com transmissão, o Manager passa a usar o mesmo
    // MatchEngine (minuto a minuto, com remates/defesas/pênaltis de verdade)
    // que já roda o Modo Jogador — os golos saem do sorteio real dentro do
    // elenco de cada clube, não de uma fórmula de diferença de reputação à
    // parte. O bónus tático e a confiança da diretoria continuam a valer,
    // só que agora entram como reputação efetiva DENTRO do motor.
    // A opção "sem transmissão" mantém a fórmula rápida antiga — é o atalho
    // para quem só quer avançar a rodada sem esperar a simulação completa.
    let gA, gB, resultadoMotor = null;
    if (comVisual && rival) {
        const jogadorFantasma = {
            id: "npc_fantasma_manager", nome: "—", geral: 60, posicao: "Meio-Campista",
            energia: 100, clubeId: "__nenhum__", selecaoId: "__nenhum__",
            estatisticasAtuais: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, lifestyle: {}
        };
        const repOriginal = clube.reputacao;
        clube.reputacao = repOriginal + bonusTaticoManager() + (managerEstado.confianca - 50) / 10;
        const engine = new MatchEngine(jogadorFantasma, clube.id, rival.id);
        clube.reputacao = repOriginal;
        resultadoMotor = await window.reproduzirSimulacaoManagerReal(engine, clube, rival || { nome: "Rival" });
        gA = resultadoMotor.gc; gB = resultadoMotor.gv;
    } else {
        const forcaA = (clube.reputacao || 70) + bonusTaticoManager() + (managerEstado.confianca - 50) / 10;
        const forcaB = rival?.reputacao || 70;
        const diff = (forcaA - forcaB) / 20;
        gA = Math.random() + diff + 0.1 > 0.5 ? Math.floor(Math.random() * 4) : 0;
        gB = Math.random() - diff > 0.6 ? Math.floor(Math.random() * 3) : 0;
        await window.reproduzirSimulacaoManager(clube, rival || { nome: "Rival" }, gA, gB, comVisual);
    }

    // Aplica o placar somente depois da transmissão: assim fechar o modal é a
    // confirmação explícita do treinador e o mundo não avança escondido.
    mt.jogos++; advEntry.jogos++;
    mt.gols = (mt.gols || 0) + gA; mt.golsSofridos = (mt.golsSofridos || 0) + gB;
    advEntry.gols = (advEntry.gols || 0) + gB; advEntry.golsSofridos = (advEntry.golsSofridos || 0) + gA;
    if(gA > gB) {
        mt.pontos += 3; mt.vitorias = (mt.vitorias || 0) + 1; advEntry.derrotas = (advEntry.derrotas || 0) + 1;
        managerEstado.confianca = Math.min(100, managerEstado.confianca + 5);
    } else if(gB > gA) {
        advEntry.pontos += 3; advEntry.vitorias = (advEntry.vitorias || 0) + 1; mt.derrotas = (mt.derrotas || 0) + 1;
        managerEstado.confianca = Math.max(0, managerEstado.confianca - 7);
    } else {
        mt.pontos += 1; advEntry.pontos += 1; mt.empates = (mt.empates || 0) + 1; advEntry.empates = (advEntry.empates || 0) + 1;
        managerEstado.confianca = Math.max(0, Math.min(100, managerEstado.confianca + 1));
    }
    if (resultadoMotor) {
        creditarPartidaManagerReal(clube.id, rival.id, gA, gB, resultadoMotor.marcadores, clube.ligaId);
    } else if (typeof atribuirEstatisticaNPC === 'function') {
        atribuirEstatisticaNPC(mt.id, gA, clube.ligaId, gB);
        atribuirEstatisticaNPC(advEntry.id, gB, clube.ligaId, gA);
    }

    if(managerEstado.confianca <= 0) {
        registrarNoticia("Demitido", `${managerEstado.treinador?.nome || "O treinador"} perdeu o cargo no ${clube.nome}.`, "Manager");
        managerEstado = estadoManagerPadrao();
        mostrarToast("Diretoria", "Confiança zerada. Procura um novo clube.", "danger");
    } else {
        registrarNoticia("Jogo do manager", `${clube.nome} ${gA} x ${gB} ${rival?.nome || "Rival"} sob o comando de ${managerEstado.treinador?.nome}.`, "Manager");
        mostrarToast("Resultado Manager", `${clube.nome} ${gA} x ${gB} ${rival?.nome || "Rival"}`, gA >= gB ? "success" : "warning");
        // 🎤 Coletiva pós-jogo: só faz sentido se o treinador ainda tem o cargo.
        await window.abrirColetivaImprensa("pos", { rival, gA, gB });
    }

    // Mantém o calendário mundial sincronizado após a partida do Manager.
    await window.simularRodadaMundialOnline();
    gerarPropostasRecebidas(clube);
    rodadaAtual++;
    window.salvarJogo();
    if(typeof atualizarHub === 'function') atualizarHub();
    renderizarManager();
};

// ==========================================
// MODO MANAGER — ESCALAÇÃO EM CAMPO (formações, banco, drag & clique)
// ==========================================

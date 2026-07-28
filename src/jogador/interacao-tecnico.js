const ESPECTRO_POSICOES = ["Zagueiro", "Lateral", "Volante", "Meio-Campista", "Meia Ofensivo", "Ponta", "Atacante"];
const RELACAO_MINIMA_PEDIR_POSICAO = 60; // precisa de uma relação BOA com o técnico para sequer pedir

// Monta o bloco HTML do pedido de mudança de posição, dentro do modal
// "Falar com o Técnico". Jogadores de Goleiro não podem pedir mudança (e
// ninguém pode pedir para virar Goleiro) — é uma mudança de posição, não de
// função no jogo.
function htmlSolicitarPosicao(relacaoTecnico) {
    if (jogador.posicao === "Goleiro") return "";
    const jaPediuEsteAno = jogador.ultimoPedidoPosicaoAno === anoAtual;
    const opcoes = ESPECTRO_POSICOES.filter(p => p !== jogador.posicao);
    const relacaoOk = relacaoTecnico >= RELACAO_MINIMA_PEDIR_POSICAO;
    return `
        <div style="margin:15px 0; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:var(--gold);">🔄 Solicitar Mudança de Posição</h4>
            <p style="margin:0 0 10px; font-size:0.85rem; color:#aaa;">Posição atual: <strong>${jogador.posicao}</strong>. A decisão final é sempre do técnico — não podes mudar de posição por conta própria.</p>
            ${!relacaoOk ? `<p style="color:#ff8c00; font-size:0.85rem;">⚠️ Precisas de uma relação BOA (${RELACAO_MINIMA_PEDIR_POSICAO}+) com o técnico para ele sequer considerar isto.</p>` : ""}
            ${jaPediuEsteAno ? `<p style="color:#aaa; font-size:0.85rem;">Já fizeste um pedido de posição esta temporada. Tenta de novo na próxima.</p>` : `
            <select id="selectNovaPosicao" ${!relacaoOk ? "disabled" : ""} style="width:100%; padding:8px; border-radius:6px; background:#111; color:#fff; border:1px solid #333; margin-bottom:8px;">
                ${opcoes.map(p => `<option value="${p}">${p}</option>`).join("")}
            </select>
            <button ${!relacaoOk ? "disabled" : ""} onclick="solicitarMudancaPosicao(document.getElementById('selectNovaPosicao').value)" style="width:100%; padding:10px; background:${relacaoOk ? 'var(--theme-primary)' : '#333'}; color:#000; border:none; border-radius:8px; font-weight:bold; cursor:${relacaoOk ? 'pointer' : 'not-allowed'};">Pedir mudança de posição</button>
            `}
        </div>`;
}

// Processa o pedido de mudança de posição. A chance de sucesso depende da
// relação com o técnico E de quão "radical" é o pedido (posições distantes
// no espectro são mais arriscadas). Só pode ser pedido uma vez por temporada.
window.solicitarMudancaPosicao = function(novaPosicao) {
    const relacaoTecnico = jogador.relacaoTecnico || 50;
    if (relacaoTecnico < RELACAO_MINIMA_PEDIR_POSICAO) {
        mostrarToast("Técnico", "Ele nem quer ouvir falar nisso agora. Melhora a tua relação primeiro.", "warning");
        return;
    }
    if (jogador.ultimoPedidoPosicaoAno === anoAtual) return;
    jogador.ultimoPedidoPosicaoAno = anoAtual;

    const idxAtual = ESPECTRO_POSICOES.indexOf(jogador.posicao);
    const idxNova = ESPECTRO_POSICOES.indexOf(novaPosicao);
    const distancia = (idxAtual === -1 || idxNova === -1) ? 3 : Math.abs(idxAtual - idxNova);

    // Base de 55% (com relação mínima exigida) subindo com relação extra,
    // e caindo com a distância entre as posições.
    const chanceSucesso = Math.max(0.05, Math.min(0.9, 0.35 + (relacaoTecnico - RELACAO_MINIMA_PEDIR_POSICAO) * 0.008 - distancia * 0.13));

    const clube = clubes.find(c => c.id === jogador.clubeId);
    const nomeTecnico = clube?.tecnico || "O treinador";

    if (Math.random() < chanceSucesso) {
        jogador.posicao = novaPosicao;
        jogador.relacaoTecnico = Math.min(100, relacaoTecnico + 5);
        registrarNoticia("Mudança de posição aceite!", `${nomeTecnico} aceitou reposicionar ${jogador.nome} para ${novaPosicao}.`, "Clube");
        mostrarModalConversaTecnico(nomeTecnico, "Pedido aceite", `"Pensei bem nisso... vamos tentar-te como ${novaPosicao}. Não me desiludas."`);
    } else {
        jogador.relacaoTecnico = Math.max(0, relacaoTecnico - 5);
        mostrarModalConversaTecnico(nomeTecnico, "Pedido recusado", `"Entendo a tua vontade, mas por agora preciso de ti como ${jogador.posicao}. Continua a mostrar serviço."`);
    }
    window.salvarJogo();
    document.getElementById("btnFalarTecnico")?.click();
};

// ==========================================
// 🤝 PROMESSAS AO TÉCNICO
// ==========================================
// O jogador pode comprometer-se com uma meta para o resto da temporada. É
// avaliada automaticamente no fim da época (ver avaliarPromessasTecnico) e
// afeta a relação para melhor (se cumprida) ou para pior (se quebrada).
const METAS_PROMESSA = [
    { tipo: "gols", meta: 10, label: "Vou marcar 10 gols até ao fim da temporada" },
    { tipo: "gols", meta: 20, label: "Vou marcar 20 gols até ao fim da temporada" },
    { tipo: "assistencias", meta: 10, label: "Vou dar 10 assistências até ao fim da temporada" },
    { tipo: "condicionamento", meta: 80, label: "Vou melhorar o meu condicionamento físico (jogar 80%+ dos jogos)" }
];

function htmlFazerPromessa() {
    if (jogador.promessaTecnico) {
        const p = jogador.promessaTecnico;
        const atual = p.tipo === "gols" ? jogador.estatisticasAtuais.gols
            : p.tipo === "assistencias" ? jogador.estatisticasAtuais.assistencias
            : Math.round(((jogador.estatisticasAtuais.jogos || 0) / Math.max(1, jogador.jogosDisputaveisTemporada || 38)) * 100);
        return `
        <div style="margin:15px 0; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:var(--gold);">🤝 Promessa em Andamento</h4>
            <p style="margin:0; color:#ccc;">"${METAS_PROMESSA.find(m => m.tipo === p.tipo && m.meta === p.meta)?.label || p.tipo}"</p>
            <p style="margin:8px 0 0; font-size:0.85rem; color:#aaa;">Progresso atual: <strong style="color:var(--theme-primary);">${atual}${p.tipo === "condicionamento" ? "%" : ""} / ${p.meta}${p.tipo === "condicionamento" ? "%" : ""}</strong> — avaliada no fim da temporada ${p.ano}.</p>
        </div>`;
    }
    return `
        <div style="margin:15px 0; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:var(--gold);">🤝 Fazer uma Promessa</h4>
            <p style="margin:0 0 10px; font-size:0.85rem; color:#aaa;">Compromete-te publicamente com o técnico. Se cumprires, a relação melhora MUITO. Se falhares, ele não vai esquecer.</p>
            <select id="selectPromessa" style="width:100%; padding:8px; border-radius:6px; background:#111; color:#fff; border:1px solid #333; margin-bottom:8px;">
                ${METAS_PROMESSA.map((m, i) => `<option value="${i}">${m.label}</option>`).join("")}
            </select>
            <button onclick="fazerPromessaTecnico(parseInt(document.getElementById('selectPromessa').value))" style="width:100%; padding:10px; background:var(--theme-primary); color:#000; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Fazer promessa</button>
        </div>`;
}

window.fazerPromessaTecnico = function(indice) {
    if (jogador.promessaTecnico) return; // só uma promessa ativa de cada vez
    const escolha = METAS_PROMESSA[indice];
    if (!escolha) return;
    jogador.promessaTecnico = { tipo: escolha.tipo, meta: escolha.meta, ano: anoAtual };
    jogador.relacaoTecnico = Math.min(100, (jogador.relacaoTecnico || 50) + 3); // o técnico gosta da ambição, já de início
    const clube = clubes.find(c => c.id === jogador.clubeId);
    mostrarModalConversaTecnico(clube?.tecnico || "O treinador", "Promessa feita", `"Gosto de ouvir isso. Vou lembrar-me desta conversa no fim da temporada."`);
    window.salvarJogo();
    document.getElementById("btnFalarTecnico")?.click();
};

// Avalia, no fim da temporada, se a promessa feita ao técnico foi cumprida.
// É uma verificação PESSOAL (usa só as estatísticas do próprio jogador), por
// isso corre sempre — mesmo no modo online e mesmo para quem não é o
// "anfitrião do mundo" (ver window.processarFimTemporadaOnline).
function avaliarPromessasTecnico() {
    if (!jogador?.promessaTecnico || jogador.promessaTecnico.ano !== anoAtual) return;
    const p = jogador.promessaTecnico;
    let atingiu = false;
    if (p.tipo === "gols") atingiu = jogador.estatisticasAtuais.gols >= p.meta;
    else if (p.tipo === "assistencias") atingiu = jogador.estatisticasAtuais.assistencias >= p.meta;
    else if (p.tipo === "condicionamento") {
        const pct = ((jogador.estatisticasAtuais.jogos || 0) / Math.max(1, jogador.jogosDisputaveisTemporada || 38)) * 100;
        atingiu = pct >= p.meta;
    }
    const clube = clubes.find(c => c.id === jogador.clubeId);
    const nomeTecnico = clube?.tecnico || "O treinador";
    if (atingiu) {
        jogador.relacaoTecnico = Math.min(100, (jogador.relacaoTecnico || 50) + 20);
        registrarNoticia("Promessa cumprida!", `${jogador.nome} cumpriu a promessa feita a ${nomeTecnico} no início da temporada.`, "Clube");
        mostrarToast("Promessa cumprida", `Cumpriste a tua promessa! A relação com ${nomeTecnico} disparou. 🤝`, "success");
    } else {
        jogador.relacaoTecnico = Math.max(0, (jogador.relacaoTecnico || 50) - 15);
        registrarNoticia("Promessa quebrada", `${jogador.nome} não cumpriu a promessa feita a ${nomeTecnico}. A confiança foi abalada.`, "Clube");
        mostrarToast("Promessa quebrada", `Não cumpriste a promessa. ${nomeTecnico} está desapontado.`, "danger");
    }
    jogador.promessaTecnico = null;
}

// Talk to coach system for captaincy and squad role
document.getElementById("btnFalarTecnico")?.addEventListener("click", () => {
    const clube = clubes.find(c => c.id === jogador.clubeId);
    if(!clube) {
        mostrarToast("Sem clube", "Precisas de estar num clube para falar com o técnico.", "warning");
        return;
    }
    
    const anosNoClube = jogador.anoNoClubeAtual || 0;
    const titularidade = jogador.titularidade || 48;
    const geral = jogador.geral || 60;
    const relacaoTecnico = jogador.relacaoTecnico || 50;
    const funcaoAtual = jogador.funcaoNoElenco || "promessa";
    
    // Determine squad role based on performance and relationship
    let funcaoSugerida = "banco";
    if(jogador.eCapitao) funcaoSugerida = "capitao";
    else if(anosNoClube >= 5 && geral >= 85 && titularidade >= 80) funcaoSugerida = "lenda";
    else if(titularidade >= 70 && geral >= 75) funcaoSugerida = "importante";
    else if(titularidade >= 50 && geral >= 65) funcaoSugerida = "rodizio";
    else if(geral >= 60 && anosNoClube < 2) funcaoSugerida = "promessa";
    
    // Relationship status
    let statusRelacao = "";
    let corRelacao = "";
    if(relacaoTecnico >= 80) { statusRelacao = "Excelente"; corRelacao = "var(--success)"; }
    else if(relacaoTecnico >= 60) { statusRelacao = "Boa"; corRelacao = "#00a2e0"; }
    else if(relacaoTecnico >= 40) { statusRelacao = "Neutra"; corRelacao = "#aaa"; }
    else if(relacaoTecnico >= 20) { statusRelacao = "Ruim"; corRelacao = "#ff8c00"; }
    else { statusRelacao = "Crítica"; corRelacao = "#ff4444"; }
    
    // Captain requirements
    const podeSerCapitao = anosNoClube >= 3 && geral >= 75 && titularidade >= 60 && relacaoTecnico >= 60;
    
    const htmlFuncoes = `
        <div style="margin:15px 0; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:var(--gold);">Função no Elenco</h4>
            <p style="margin:0 0 10px; font-size:0.8rem; color:#aaa;">🔒 = precisas de mais relação com o técnico para ele considerar este pedido.</p>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-bottom:10px;">
                ${['promessa', 'rodizio', 'importante', 'banco', 'lenda', 'capitao'].map(f => {
                    const bloqueado = relacaoTecnico < (RELACAO_MINIMA_FUNCAO[f] ?? 0);
                    return `
                    <div style="padding:8px; border-radius:6px; text-align:center; cursor:pointer; opacity:${bloqueado ? 0.55 : 1}; border:2px solid ${funcaoAtual === f ? 'var(--theme-primary)' : '#333'}; background:${funcaoAtual === f ? 'rgba(0,255,136,0.1)' : 'rgba(0,0,0,0.2)'};" onclick="mudarFuncaoElenco('${f}')">
                        <div style="font-size:1.5rem;">${bloqueado ? '🔒' : (f === 'promessa' ? '⭐' : f === 'rodizio' ? '🔄' : f === 'importante' ? '💪' : f === 'banco' ? '🪑' : f === 'lenda' ? '👑' : '🎯')}</div>
                        <div style="font-size:0.75rem; margin-top:4px; text-transform:uppercase;">${f}</div>
                    </div>
                `;}).join('')}
            </div>
            <p style="margin:5px 0 0; font-size:0.85rem; color:#aaa;">Função sugerida pelo técnico: <strong style="color:var(--success);">${funcaoSugerida}</strong></p>
        </div>
        
        <div style="margin:15px 0; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:var(--gold);">Relação com o Técnico</h4>
            <div style="display:flex; align-items:center; gap:15px;">
                <div style="flex:1; height:20px; background:#333; border-radius:10px; overflow:hidden;">
                    <div style="width:${relacaoTecnico}%; height:100%; background:linear-gradient(90deg, #ff4444, #ff8c00, #00a2e0, var(--success)); transition:width 0.5s;"></div>
                </div>
                <strong style="color:${corRelacao}; font-size:1.1rem;">${statusRelacao} (${relacaoTecnico}/100)</strong>
            </div>
            <p style="margin:10px 0 0; font-size:0.85rem; color:#aaa;">${relacaoTecnico < 40 ? '⚠️ Relação ruim pode levar ao banco e lista de transferências' : '✓ Boa relação aumenta chances de titularidade'}</p>
        </div>
        
        <div style="margin:15px 0; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:var(--gold);">Listas do Clube</h4>
            <div style="display:flex; gap:15px;">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" ${jogador.naListaTransferencias ? 'checked' : ''} onchange="toggleListaTransferencias(this.checked)">
                    <span>Lista de Transferências</span>
                </label>
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" ${jogador.naListaEmprestimo ? 'checked' : ''} onchange="toggleListaEmprestimo(this.checked)">
                    <span>Lista de Empréstimo</span>
                </label>
            </div>
        </div>

        ${htmlSolicitarPosicao(relacaoTecnico)}
        ${htmlFazerPromessa()}

        <div style="margin:15px 0; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:var(--gold);">🎯 Pedir Feedback de Desempenho</h4>
            <p style="margin:0 0 10px; font-size:0.85rem; color:#aaa;">Pergunta ao técnico como ele avalia a tua temporada até agora, com base nos teus objetivos.</p>
            <button onclick="pedirFeedbackTecnico()" style="width:100%; padding:10px; background:var(--theme-primary); color:#000; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Pedir feedback</button>
        </div>

        <div style="margin:15px 0; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:var(--gold);">📋 Perguntar sobre a Tática</h4>
            <p style="margin:0 0 10px; font-size:0.85rem; color:#aaa;">Descobre qual é a filosofia de jogo que o técnico quer implementar na equipa.</p>
            <button onclick="perguntarTaticaTecnico()" style="width:100%; padding:10px; background:var(--theme-primary); color:#000; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Perguntar sobre a tática</button>
        </div>

        ${(titularidade < 68 && jogador.ultimaReclamacaoMinutosAno !== anoAtual) ? `
        <div style="margin:15px 0; padding:15px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:#f87171;">🎤 Reclamar por Mais Minutos</h4>
            <p style="margin:0 0 10px; font-size:0.85rem; color:#aaa;">Arriscado: pode te render mais espaço na equipa, ou irritar o técnico e piorar a relação. Só podes tentar uma vez por temporada.</p>
            <button onclick="reclamarMinutos()" style="width:100%; padding:10px; background:#ef4444; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Reclamar por minutos</button>
        </div>` : ''}

        <div style="margin:15px 0; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px; text-align:center;">
            <h4 style="margin:0 0 10px; color:var(--gold);">🗣️ Conversa Coletiva</h4>
            <p style="margin:0 0 10px; font-size:0.85rem; color:#aaa;">Fala com o grupo e o técnico sobre o momento da equipa.</p>
            <button onclick="document.getElementById('modalConversaTecnico')?.remove(); abrirEntrevista('coletiva_time', {}, null)" style="width:100%; padding:10px; background:var(--theme-primary); color:#000; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Iniciar conversa coletiva</button>
        </div>
        
        ${podeSerCapitao && !jogador.eCapitao ? `
        <div style="margin:15px 0; padding:15px; background:rgba(255,215,0,0.1); border:1px solid rgba(255,215,0,0.3); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:var(--gold);">🎯 Capitania Disponível</h4>
            <p style="margin:0; font-size:0.9rem; color:#ccc;">Reuniste os requisitos para ser capitão. O técnico está disposto a oferecer a braçadeira.</p>
            <button onclick="aceitarCapitania()" style="margin-top:10px; padding:10px 20px; background:var(--gold); color:#000; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Aceitar Capitania</button>
        </div>
        ` : ''}
    `;
    
    mostrarModalConversaTecnicoExpandido(clube.tecnico || "O treinador", "Conversa com o Técnico", htmlFuncoes);
});

function mostrarModalConversaTecnico(nomeTecnico, titulo, mensagem, mostrarAceitar = false) {
    mostrarModalConversaTecnicoExpandido(nomeTecnico, titulo, `<p class="coach-talk-quote">${mensagem}</p>`, mostrarAceitar);
}

function mostrarModalConversaTecnicoExpandido(nomeTecnico, titulo, conteudoHTML, mostrarAceitar = false) {
    // Remove existing modal if present
    const existingModal = document.getElementById("modalConversaTecnico");
    if(existingModal) existingModal.remove();
    
    const modal = document.createElement("div");
    modal.id = "modalConversaTecnico";
    modal.className = "modal";
    modal.innerHTML = `
        <div class="coach-talk-card" style="max-width:600px; max-height:80vh; overflow-y:auto;">
            <div class="coach-talk-avatar">🧑‍💼</div>
            <span class="coach-talk-tag">Conversa com ${nomeTecnico}</span>
            <h3 style="margin: 10px 0; color: var(--gold);">${titulo}</h3>
            ${conteudoHTML}
            <div style="display: flex; gap: 10px; margin-top:20px;">
                ${mostrarAceitar ? 
                    `<button class="coach-talk-btn" id="btnAceitarCapitania" style="flex: 1; background: var(--success);">Aceitar</button>` : 
                    ''}
                <button class="coach-talk-btn" id="btnFecharConversaTecnico" style="${mostrarAceitar ? 'flex: 1;' : ''}">Fechar</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    
    const fecharBtn = document.getElementById("btnFecharConversaTecnico");
    if(fecharBtn) {
        fecharBtn.onclick = () => {
            modal.remove();
        };
    }
    
    if(mostrarAceitar) {
        const aceitarBtn = document.getElementById("btnAceitarCapitania");
        if(aceitarBtn) {
            aceitarBtn.onclick = () => {
                jogador.eCapitao = true;
                jogador.funcaoNoElenco = "capitao";
                registrarNoticia("Nova capitania", `${jogador.nome} foi nomeado capitão do ${clubes.find(c => c.id === jogador.clubeId)?.nome || "seu clube"}!`, "Clube");
                mostrarToast("Capitão", "Foste nomeado capitão da equipa! Podes treinar 2 vezes por partida.", "success");
                modal.remove();
                atualizarUI();
                window.salvarJogo();
            };
        }
    }
}

// Exigência mínima de relação com o técnico para CADA função no elenco — o
// jogador só pode PEDIR, o técnico é quem decide se aceita. Funções "para
// baixo" (banco, promessa) não têm exigência: ninguém recusa um jogador que
// aceita um papel menor.
const RELACAO_MINIMA_FUNCAO = { promessa: 0, banco: 0, rodizio: 25, importante: 55, lenda: 75, capitao: 60 };

// 🎯 Descrições de estilo de jogo usadas na resposta do técnico quando o
// jogador pergunta sobre a tática (ver ROTULOS_ESTILO_TECNICO, usado na aba
// "Técnicos", pros rótulos curtos — aqui é a versão falada, mais longa).
const DESCRICOES_ESTILO_TECNICO = {
    pressao: "pressão alta, recuperar a bola rápido e sufocar o adversário no campo dele",
    posse: "controlar a posse de bola e ter paciência na construção das jogadas",
    retranca: "solidez defensiva antes de tudo, explorando os erros do rival",
    contra: "esperar o momento certo e ser letal nas transições de contra-ataque",
    equilibrado: "equilíbrio entre ataque e defesa, sem exageros para nenhum dos lados"
};

// 🎯 Pedir Feedback de Desempenho — usa os objetivos já gerados no início da
// temporada (gerarObjetivosParaClube/atualizarProgressoObjetivos) pra dar uma
// resposta personalizada sobre como o técnico vê a época do jogador até agora.
window.pedirFeedbackTecnico = function() {
    const clube = clubes.find(c => c.id === jogador.clubeId);
    const nomeTecnico = clube?.tecnico || "O treinador";
    const objetivos = jogador.objetivosCarreira || [];
    let frase;
    if (!objetivos.length) {
        frase = `"Ainda é cedo pra avaliar a temporada. Continua a trabalhar e conversamos mais pra frente."`;
    } else {
        const ratio = objetivos.filter(o => o.concluido).length / objetivos.length;
        frase = ratio >= 0.75
            ? `"Estás a cumprir praticamente tudo o que se esperava de ti esta época. Continua assim."`
            : ratio >= 0.4
            ? `"Estás no caminho certo, mas ainda há objetivos por cumprir. Não relaxes agora."`
            : `"Sinceramente, esperava mais de ti esta temporada. Precisas de dar um passo em frente."`;
    }
    const detalhes = objetivos.map(o => `<li style="margin-bottom:4px;">${o.concluido ? "✅" : "❌"} ${o.desc} <strong style="color:${o.concluido ? 'var(--success)' : '#aaa'};">(${o.atual}/${o.meta})</strong></li>`).join("");
    mostrarModalConversaTecnicoExpandido(nomeTecnico, "Feedback de Desempenho", `
        <p class="coach-talk-quote">${frase}</p>
        ${objetivos.length ? `<ul style="text-align:left; padding-left:20px; margin:10px 0 0; color:#ddd; font-size:0.9rem;">${detalhes}</ul>` : ""}
    `);
};

// 📋 Perguntar sobre a Tática — revela o estiloJogo do treinador de verdade
// (treinadoresIA), com uma pequena recompensa de relação (uma vez por
// temporada) por mostrar interesse na filosofia da equipa.
window.perguntarTaticaTecnico = function() {
    const clube = clubes.find(c => c.id === jogador.clubeId);
    const t = (treinadoresIA || []).find(x => x.clubeId === jogador.clubeId);
    const nomeTecnico = clube?.tecnico || "O treinador";
    const estilo = t?.estiloJogo || "equilibrado";
    const desc = DESCRICOES_ESTILO_TECNICO[estilo] || DESCRICOES_ESTILO_TECNICO.equilibrado;
    mostrarModalConversaTecnico(nomeTecnico, "Sobre a Tática", `"A minha ideia pra esta equipa é clara: ${desc}. Quero todos alinhados com isso, tu incluído."`);
    if (jogador.ultimaPerguntaTaticaAno !== anoAtual) {
        jogador.ultimaPerguntaTaticaAno = anoAtual;
        jogador.relacaoTecnico = Math.min(100, (jogador.relacaoTecnico || 50) + 1);
        window.salvarJogo();
    }
};

// 🎤 Reclamar por Mais Minutos — opção arriscada, só uma vez por temporada.
// Chance de sucesso sobe com boa relação e titularidade já próxima; sucesso dá
// um empurrão real na titularidade, fracasso custa caro na relação.
window.reclamarMinutos = function() {
    const clube = clubes.find(c => c.id === jogador.clubeId);
    const nomeTecnico = clube?.tecnico || "O treinador";
    if (jogador.ultimaReclamacaoMinutosAno === anoAtual) return;
    jogador.ultimaReclamacaoMinutosAno = anoAtual;
    const titularidade = jogador.titularidade || 48;
    const relacaoTecnico = jogador.relacaoTecnico || 50;
    const chanceSucesso = Math.max(0.05, Math.min(0.75, 0.25 + (relacaoTecnico - 50) * 0.006 + (titularidade - 40) * 0.004));
    if (Math.random() < chanceSucesso) {
        jogador.titularidade = Math.min(100, titularidade + 8);
        jogador.relacaoTecnico = Math.min(100, relacaoTecnico + 3);
        mostrarModalConversaTecnico(nomeTecnico, "Reclamação ouvida", `"Tens razão, mereces mais oportunidades. Vou pensar em te dar mais minutos."`);
    } else {
        jogador.relacaoTecnico = Math.max(0, relacaoTecnico - 8);
        mostrarModalConversaTecnico(nomeTecnico, "Reclamação mal recebida", `"Minutos se conquistam no treino, não em reclamações. Volta ao trabalho."`);
    }
    window.salvarJogo();
    document.getElementById("btnFalarTecnico")?.click();
};

window.mudarFuncaoElenco = function(novaFuncao) {
    const relacaoTecnico = jogador.relacaoTecnico || 50;
    const minimoExigido = RELACAO_MINIMA_FUNCAO[novaFuncao] ?? 0;
    const clube = clubes.find(c => c.id === jogador.clubeId);
    const nomeTecnico = clube?.tecnico || "O treinador";

    // 🛡️ FIX: a função no elenco já não é escolhida livremente — é um PEDIDO
    // que depende da relação com o técnico (exatamente como o pedido de
    // mudança de posição). "Capitão" também exige os requisitos normais de
    // capitania (anos no clube, OVR, titularidade), iguais aos do bloco
    // "Capitania Disponível".
    if (relacaoTecnico < minimoExigido) {
        mostrarModalConversaTecnico(nomeTecnico, "Pedido recusado", `"Ainda não confio o suficiente em ti para te dar esse papel no plantel. Continua a mostrar serviço."`);
        return;
    }
    if (novaFuncao === "capitao") {
        const anosNoClube = jogador.anoNoClubeAtual || 0;
        const podeSerCapitao = anosNoClube >= 3 && (jogador.geral || 60) >= 75 && (jogador.titularidade || 48) >= 60 && relacaoTecnico >= 60;
        if (!podeSerCapitao) {
            mostrarModalConversaTecnico(nomeTecnico, "Pedido recusado", `"A braçadeira é uma responsabilidade grande. Ainda não estás pronto para isso."`);
            return;
        }
    }

    jogador.funcaoNoElenco = novaFuncao;
    
    // Relationship impact based on role change
    if(novaFuncao === 'banco') {
        jogador.relacaoTecnico = Math.max(0, (jogador.relacaoTecnico || 50) - 10);
        mostrarToast("Função alterada", "Foste colocado no banco. O técnico não está satisfeito.", "warning");
    } else if(novaFuncao === 'importante' || novaFuncao === 'lenda' || novaFuncao === 'capitao') {
        jogador.relacaoTecnico = Math.min(100, (jogador.relacaoTecnico || 50) + 5);
        mostrarToast("Função alterada", `A tua função é agora: ${novaFuncao}`, "success");
    } else {
        mostrarToast("Função alterada", `A tua função é agora: ${novaFuncao}`, "info");
    }
    
    window.salvarJogo();
    // Refresh modal
    document.getElementById("btnFalarTecnico")?.click();
};

window.toggleListaTransferencias = function(checked) {
    jogador.naListaTransferencias = checked;
    if(checked) {
        jogador.relacaoTecnico = Math.max(0, (jogador.relacaoTecnico || 50) - 15);
        mostrarToast("Lista de Transferências", "Foste colocado na lista. O técnico pode não gostar disto.", "warning");
    } else {
        mostrarToast("Lista de Transferências", "Removido da lista de transferências.", "info");
    }
    window.salvarJogo();
};

window.toggleListaEmprestimo = function(checked) {
    jogador.naListaEmprestimo = checked;
    if(checked) {
        jogador.relacaoTecnico = Math.max(0, (jogador.relacaoTecnico || 50) - 10);
        mostrarToast("Lista de Empréstimo", "Disponível para empréstimo.", "info");
    } else {
        mostrarToast("Lista de Empréstimo", "Removido da lista de empréstimo.", "info");
    }
    window.salvarJogo();
};

window.aceitarCapitania = function() {
    jogador.eCapitao = true;
    jogador.funcaoNoElenco = "capitao";
    jogador.relacaoTecnico = Math.min(100, (jogador.relacaoTecnico || 50) + 15);
    registrarNoticia("Nova capitania", `${jogador.nome} foi nomeado capitão do ${clubes.find(c => c.id === jogador.clubeId)?.nome || "seu clube"}!`, "Clube");
    mostrarToast("Capitão", "Foste nomeado capitão da equipa! Podes treinar 2 vezes por partida.", "success");
    window.salvarJogo();
    document.getElementById("modalConversaTecnico")?.remove();
    atualizarUI();
};

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

aplicarHistoricosReaisIniciais();

// ⚙️ Bolinha flutuante de configurações — reúne efeitos sonoros, música de
// fundo, volume e "próxima faixa" num único botão, pra não poluir a tela com
// vários botões soltos. Clique na bolinha pra abrir/fechar o painel.
(function criarBolinhaConfig() {
    const bolinha = document.createElement("button");
    bolinha.id = "btnConfigBolinha";
    bolinha.title = "Configurações";
    bolinha.textContent = "⚙️";
    bolinha.style.cssText = "position:fixed; bottom:14px; right:14px; z-index:9999; width:48px; height:48px; border-radius:50%; border:1px solid rgba(255,255,255,0.15); background:rgba(0,0,0,0.7); color:#fff; font-size:1.3rem; cursor:pointer; backdrop-filter:blur(6px); box-shadow:0 2px 10px rgba(0,0,0,0.4); transition:transform .2s ease;";
    bolinha.onmouseenter = () => bolinha.style.transform = "scale(1.08)";
    bolinha.onmouseleave = () => bolinha.style.transform = "scale(1)";

    const painel = document.createElement("div");
    painel.id = "painelConfigBolinha";
    painel.style.cssText = "position:fixed; bottom:70px; right:14px; z-index:9999; display:none; flex-direction:column; gap:10px; background:rgba(15,15,15,0.92); border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:14px; width:210px; backdrop-filter:blur(8px); box-shadow:0 4px 18px rgba(0,0,0,0.5);";

    // --- Linha: efeitos sonoros ---
    const linhaSons = document.createElement("div");
    linhaSons.style.cssText = "display:flex; align-items:center; justify-content:space-between; color:#fff; font-size:0.85rem;";
    const btnSons = document.createElement("button");
    btnSons.style.cssText = "width:36px; height:36px; border-radius:50%; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06); color:#fff; font-size:1.05rem; cursor:pointer;";
    const atualizarIconeSons = () => { btnSons.textContent = somAtivado() ? "🔊" : "🔇"; };
    atualizarIconeSons();
    btnSons.onclick = () => { window.alternarSons(); atualizarIconeSons(); };
    linhaSons.innerHTML = `<span>Efeitos sonoros</span>`;
    linhaSons.appendChild(btnSons);

    // --- Linha: música (liga/desliga + pular faixa) ---
    const linhaMusica = document.createElement("div");
    linhaMusica.style.cssText = "display:flex; align-items:center; justify-content:space-between; color:#fff; font-size:0.85rem;";
    const grupoBotoesMusica = document.createElement("div");
    grupoBotoesMusica.style.cssText = "display:flex; gap:6px;";
    const btnMusica = document.createElement("button");
    btnMusica.style.cssText = "width:36px; height:36px; border-radius:50%; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06); color:#fff; font-size:1.05rem; cursor:pointer;";
    const atualizarIconeMusica = () => { btnMusica.textContent = musicaAtivada() ? "🎵" : "🔕"; };
    atualizarIconeMusica();
    btnMusica.title = "Ligar/desligar música";
    btnMusica.onclick = () => { window.alternarMusica(); atualizarIconeMusica(); atualizarNomeFaixa(); };
    // Setinha para pular para a próxima faixa da playlist.
    const btnProxima = document.createElement("button");
    btnProxima.textContent = "⏭️";
    btnProxima.title = "Próxima música";
    btnProxima.style.cssText = "width:36px; height:36px; border-radius:50%; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06); color:#fff; font-size:1rem; cursor:pointer;";
    btnProxima.onclick = () => { window.proximaMusica(); atualizarIconeMusica(); };
    grupoBotoesMusica.appendChild(btnMusica);
    grupoBotoesMusica.appendChild(btnProxima);
    linhaMusica.innerHTML = `<span>Música de fundo</span>`;
    linhaMusica.appendChild(grupoBotoesMusica);

    // --- Linha: nome da faixa tocando agora ---
    const linhaFaixaAtual = document.createElement("div");
    linhaFaixaAtual.id = "linhaFaixaAtualBolinha";
    linhaFaixaAtual.style.cssText = "color:#00ff88; font-size:0.78rem; font-style:italic; text-align:center; min-height:1em;";
    const atualizarNomeFaixa = () => {
        const nome = window.obterNomeMusicaAtual?.();
        linhaFaixaAtual.textContent = musicaAtivada() && nome ? `🎶 Tocando: ${nome}` : "";
    };
    atualizarNomeFaixa();
    // Atualiza sozinha sempre que a faixa trocar (troca automática, pular, ou entrar/sair da tela de criação).
    document.addEventListener("musicaTrocou", atualizarNomeFaixa);

    // --- Linha: volume da música ---
    const linhaVolume = document.createElement("div");
    linhaVolume.style.cssText = "display:flex; flex-direction:column; gap:4px; color:#fff; font-size:0.8rem;";
    const painelVolume = document.createElement("input");
    painelVolume.type = "range"; painelVolume.min = "0"; painelVolume.max = "1"; painelVolume.step = "0.05";
    painelVolume.value = String(volumeMusica());
    painelVolume.style.cssText = "width:100%; accent-color:#00ff88; cursor:pointer;";
    painelVolume.oninput = () => window.definirVolumeMusica(painelVolume.value);
    linhaVolume.innerHTML = `<span>Volume da música</span>`;
    linhaVolume.appendChild(painelVolume);

    painel.appendChild(linhaSons);
    painel.appendChild(linhaMusica);
    painel.appendChild(linhaFaixaAtual);
    painel.appendChild(linhaVolume);

    let aberto = false;
    bolinha.onclick = () => {
        aberto = !aberto;
        painel.style.display = aberto ? "flex" : "none";
    };
    // Fecha o painel se o jogador clicar fora dele.
    document.addEventListener("click", (e) => {
        if (aberto && !painel.contains(e.target) && e.target !== bolinha) {
            aberto = false;
            painel.style.display = "none";
        }
    });

    document.body.appendChild(painel);
    document.body.appendChild(bolinha);
})();

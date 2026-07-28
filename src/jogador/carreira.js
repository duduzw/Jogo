function inicializarEstadoCarreiraJogador() {
    if(!jogador) return;
    if(typeof jogador.moral === "undefined") jogador.moral = 55;
    if(typeof jogador.felicidade === "undefined") jogador.felicidade = 60;
    if(typeof jogador.inteligencia === "undefined") jogador.inteligencia = Math.max(45, Math.min(95, (jogador.geral || 60) + 4));
    // ⚙️ ATRIBUTOS INDIVIDUAIS: mesma migração aplicada aos jogadores de IA
    // (ver normalizarElencosEPosicoes) — se por algum motivo ainda faltar
    // algum destes 8 atributos (save antigo, criação de personagem), gera-os
    // a partir da posição/OVR do próprio jogador.
    if(typeof jogador.finalizacao === "undefined" || typeof jogador.velocidade === "undefined" || typeof jogador.passe === "undefined" ||
       typeof jogador.defesa === "undefined" || typeof jogador.cabeceamento === "undefined" || typeof jogador.drible === "undefined" ||
       typeof jogador.resistencia === "undefined" || typeof jogador.forca === "undefined") {
        const gerados = gerarAtributosParaJogador(jogador.posicao, jogador.geral || 60);
        if(typeof jogador.finalizacao === "undefined") jogador.finalizacao = gerados.finalizacao;
        if(typeof jogador.velocidade === "undefined") jogador.velocidade = gerados.velocidade;
        if(typeof jogador.passe === "undefined") jogador.passe = gerados.passe;
        if(typeof jogador.defesa === "undefined") jogador.defesa = gerados.defesa;
        if(typeof jogador.cabeceamento === "undefined") jogador.cabeceamento = gerados.cabeceamento;
        if(typeof jogador.drible === "undefined") jogador.drible = gerados.drible;
        if(typeof jogador.resistencia === "undefined") jogador.resistencia = gerados.resistencia;
        if(typeof jogador.forca === "undefined") jogador.forca = gerados.forca;
        if(typeof jogador.reflexos === "undefined") jogador.reflexos = gerados.reflexos;
        if(typeof jogador.reposicao === "undefined") jogador.reposicao = gerados.reposicao;
        if(typeof jogador.jogoAereo === "undefined") jogador.jogoAereo = gerados.jogoAereo;
    }
    // 🧤 Migração incremental para quem já tinha os 8 atributos base mas ainda
    // não tinha os 3 exclusivos de guarda-redes.
    if(typeof jogador.reflexos === "undefined") {
        const gerados = gerarAtributosParaJogador(jogador.posicao, jogador.geral || 60);
        jogador.reflexos = gerados.reflexos;
        jogador.reposicao = gerados.reposicao;
        jogador.jogoAereo = gerados.jogoAereo;
    }
    if(typeof jogador.titularidade === "undefined") jogador.titularidade = 48;
    // 🆕 NÍVEL / XP / PONTOS DE TREINO — migração pra saves que começaram
    // antes deste sistema existir (a carreira nova já nasce com isto, ver
    // btnConfirmarAtributosIniciais).
    if(typeof jogador.nivel === "undefined") jogador.nivel = 1;
    if(typeof jogador.xp === "undefined") jogador.xp = 0;
    if(typeof jogador.xpProximoNivel === "undefined") jogador.xpProximoNivel = 100;
    if(typeof jogador.pontosTreino === "undefined") jogador.pontosTreino = 0;
    if(typeof jogador.lesaoRodadas === "undefined") jogador.lesaoRodadas = 0;
    if(typeof jogador.entrevistasRespondidas === "undefined") jogador.entrevistasRespondidas = 0;
    if(!Array.isArray(jogador.formaResultados)) jogador.formaResultados = [];
    if(typeof jogador.jogosNoClubeAtual === "undefined") jogador.jogosNoClubeAtual = 0;
    if(typeof jogador.tecnicoConhecido === "undefined") jogador.tecnicoConhecido = null;
    if(typeof jogador.statusEscalacaoAnterior === "undefined") jogador.statusEscalacaoAnterior = null;
    if(typeof jogador.clubesRejeitados === "undefined") jogador.clubesRejeitados = [];
    if(!jogador.estatisticasAtuais.penaltisMarcados) jogador.estatisticasAtuais.penaltisMarcados = 0;
    
    // Relationship systems
    if(typeof jogador.relacaoTecnico === "undefined") jogador.relacaoTecnico = 50; // 0-100
    if(typeof jogador.relacaoTorcida === "undefined") jogador.relacaoTorcida = 50; // 0-100
    if(typeof jogador.funcaoNoElenco === "undefined") jogador.funcaoNoElenco = "promessa"; // promessa, rodizio, importante, banco, lenda, capitao
    if(typeof jogador.naListaTransferencias === "undefined") jogador.naListaTransferencias = false;
    if(typeof jogador.naListaEmprestimo === "undefined") jogador.naListaEmprestimo = false;
    if(typeof jogador.pressaoTorcida === "undefined") jogador.pressaoTorcida = 0; // 0-100, fan pressure on coach
    if(!jogador.estatisticasAtuais.penaltisDefendidos) jogador.estatisticasAtuais.penaltisDefendidos = 0;
    if(typeof jogador.eCapitao === "undefined") jogador.eCapitao = false;
    if(!jogador.statsSelecao) jogador.statsSelecao = { jogos:0, gols:0, assistencias:0, convocacoes:0 };
    if(!jogador.melhorAtuacao) jogador.melhorAtuacao = { gols:0, assistencias:0, nota:0, adversario:"", rodada:0 };
    if(!jogador.listaDesejos) jogador.listaDesejos = [];
    if(!jogador.objetivosCarreira) jogador.objetivosCarreira = [];
    if(!jogador.clubeAlvoId) jogador.clubeAlvoId = null;
    if(typeof jogador.salarioSemanal === "undefined") jogador.salarioSemanal = null;
    if(typeof jogador.bonusGol === "undefined") jogador.bonusGol = 0;
    if(typeof jogador.bonusVitoria === "undefined") jogador.bonusVitoria = 0;
    if(typeof jogador.direitosImagem === "undefined") jogador.direitosImagem = 5;
    // Migração defensiva para saves antigos: garante que novos campos do
    // sistema de lifestyle/treino/negociação sempre existem.
    if(jogador.lifestyle) {
        const t = jogador.lifestyle.upgrades?.training;
        if(t) { 
            if(typeof t.pace === "undefined") t.pace = 0; 
            if(typeof t.strength === "undefined") t.strength = 0; 
            if(typeof t.vision === "undefined") t.vision = 0;
            if(typeof t.ballControl === "undefined") t.ballControl = 0;
            if(typeof t.agility === "undefined") t.agility = 0;
            if(typeof t.composure === "undefined") t.composure = 0;
            if(typeof t.positioning === "undefined") t.positioning = 0;
            if(typeof t.leadership === "undefined") t.leadership = 0;
            if(typeof t.workRate === "undefined") t.workRate = 0;
            if(typeof t.interceptions === "undefined") t.interceptions = 0;
            if(typeof t.longShots === "undefined") t.longShots = 0;
            if(typeof t.acceleration === "undefined") t.acceleration = 0;
            // 🧤 FIX: os 3 treinos novos de guarda-redes (reflexos/reposição/jogo
            // aéreo) precisam existir aqui como contador — sem isto,
            // upgradeTrainingSkill() faria "undefined++" (vira NaN) na primeira
            // vez que o jogador tentasse treiná-los.
            if(typeof t.reflexes === "undefined") t.reflexes = 0;
            if(typeof t.distribution === "undefined") t.distribution = 0;
            if(typeof t.aerialCommand === "undefined") t.aerialCommand = 0;
        }
        const l = jogador.lifestyle.upgrades?.lifestyle;
        if(l) { if(typeof l.personalChef === "undefined") l.personalChef = false; if(typeof l.mediaTraining === "undefined") l.mediaTraining = false; if(typeof l.eliteAgent === "undefined") l.eliteAgent = false; }
        if(jogador.lifestyle.multipliers && typeof jogador.lifestyle.multipliers.negotiationMultiplier === "undefined") jogador.lifestyle.multipliers.negotiationMultiplier = 0;
    }
}

function gerarObjetivosParaClube(clubeId) {
    const c = clubes.find(x => x.id === clubeId);
    if (!c) return [];
    const rep = c.reputacao || 70;
    const metaGols = Math.max(6, Math.floor(rep / 10));
    const metaOvr = Math.min(99, Math.max(jogador.geral, rep - 2));
    const metaJogos = rep >= 82 ? 18 : 12;
    return [
        { id: "gols", desc: `Marcar ${metaGols} gols na temporada`, meta: metaGols, atual: jogador.estatisticasAtuais?.gols || 0, concluido: false },
        { id: "ovr", desc: `Atingir OVR ${metaOvr}`, meta: metaOvr, atual: jogador.geral, concluido: false },
        { id: "jogos", desc: `Disputar ${metaJogos} jogos oficiais`, meta: metaJogos, atual: jogador.estatisticasAtuais?.jogos || 0, concluido: false },
        { id: "titular", desc: "Ser titular (≥68 titularidade)", meta: 68, atual: jogador.titularidade || 0, concluido: false }
    ];
}

function atualizarProgressoObjetivos() {
    if (!jogador?.objetivosCarreira?.length) return;
    jogador.objetivosCarreira.forEach(o => {
        if (o.id === "gols") o.atual = jogador.estatisticasAtuais?.gols || 0;
        if (o.id === "jogos") o.atual = jogador.estatisticasAtuais?.jogos || 0;
        if (o.id === "ovr") o.atual = jogador.geral;
        if (o.id === "titular") o.atual = jogador.titularidade || 0;
        o.concluido = o.atual >= o.meta;
    });
}

function objetivosTransferenciaCumpridos() {
    atualizarProgressoObjetivos();
    return jogador.objetivosCarreira?.length > 0 && jogador.objetivosCarreira.every(o => o.concluido);
}

window.adicionarClubeDesejos = function(clubeId) {
    inicializarEstadoCarreiraJogador();
    if (jogador.listaDesejos.length >= 5) { mostrarToast("Lista de desejos", "Máximo de 5 clubes na lista.", "warning"); return; }
    if (jogador.listaDesejos.includes(clubeId) || clubeId === jogador.clubeId) return;
    jogador.listaDesejos.push(clubeId);
    mostrarToast("Lista de desejos", `${clubes.find(c=>c.id===clubeId)?.nome} adicionado!`, "success");
    renderizarMercado();
};

window.removerClubeDesejos = function(clubeId) {
    jogador.listaDesejos = (jogador.listaDesejos || []).filter(id => id !== clubeId);
    if (jogador.clubeAlvoId === clubeId) { jogador.clubeAlvoId = null; jogador.objetivosCarreira = []; }
    renderizarMercado();
};

window.definirClubeAlvo = function(clubeId) {
    inicializarEstadoCarreiraJogador();
    jogador.clubeAlvoId = clubeId;
    jogador.objetivosCarreira = gerarObjetivosParaClube(clubeId);
    const nome = clubes.find(c => c.id === clubeId)?.nome;
    registrarNoticia("Objetivo de carreira", `${jogador.nome} definiu o ${nome} como clube dos sonhos. Cumpre os objetivos para pedir transferência.`, "Mercado");
    mostrarToast("Clube alvo", `Objetivos definidos para ir ao ${nome}!`, "info");
    renderizarMercado();
};

window.pedirTransferenciaClube = function(clubeId, tipo) {
    inicializarEstadoCarreiraJogador();
    if (jogador.clubeAlvoId !== clubeId) { mostrarToast("Objetivos", "Define este clube como alvo e cumpre os objetivos primeiro.", "warning"); return; }
    if (!objetivosTransferenciaCumpridos()) { mostrarToast("Objetivos pendentes", "Ainda faltam metas para liberar o pedido.", "warning"); renderizarMercado(); return; }
    const c = clubes.find(x => x.id === clubeId);
    if (!c) return;
    const valor = calcularValorMercadoJogador(jogador);
    const encaixe = Math.abs(c.reputacao - jogador.geral) <= 8;
    if (!encaixe && c.reputacao > jogador.geral + 10) {
        mostrarToast("Recusado", `${c.nome} acha que ainda precisas evoluir mais (OVR ${jogador.geral} vs clube ${c.reputacao}).`, "warning");
        return;
    }
    propostasPendentes.push({
        id: c.id, nome: c.nome, reputacao: c.reputacao,
        valor: tipo === "emprestimo" ? Math.floor(valor * 0.08) : valor,
        tipo, janela: "Pedido do jogador"
    });
    registrarNoticia(tipo === "emprestimo" ? "Pedido de empréstimo" : "Pedido de transferência", `${jogador.nome} solicitou ${tipo === "emprestimo" ? "empréstimo" : "transferência"} para o ${c.nome} após cumprir os objetivos.`, "Mercado");
    mostrarToast("Pedido enviado", `${c.nome} analisará tua proposta na aba de propostas!`, "success");
    renderizarMercado();
};

// 🆕 NÍVEL / XP: concede XP ao jogador e processa subidas de nível — cada
// nível concedido dá 1 ponto de treino pra investir num atributo real (ver
// janela de treino, substitui o antigo botão único "Treinar" que só subia
// tudo igual sem escolha nenhuma).
function concederXPJogador(quantidade, motivo = "") {
    if (!jogador || !quantidade) return;
    inicializarEstadoCarreiraJogador();
    jogador.xp += quantidade;
    let subiuNivel = false;
    while (jogador.xp >= jogador.xpProximoNivel) {
        jogador.xp -= jogador.xpProximoNivel;
        jogador.nivel++;
        jogador.pontosTreino++;
        jogador.xpProximoNivel = Math.floor(jogador.xpProximoNivel * 1.15);
        subiuNivel = true;
    }
    if (subiuNivel) {
        mostrarToast("Subiu de Nível!", `${jogador.nome} alcançou o nível ${jogador.nivel} — +1 ponto de treino disponível.`, "success");
        registrarNoticia("Subida de nível", `${jogador.nome} chegou ao nível ${jogador.nivel} e ganhou um novo ponto de treino.`, "Treino", { nome: jogador.nome, foto: jogador.foto }, "jogador");
    }
}

// 🆕 XP DE FIM DE PARTIDA: quanto melhor a atuação (gols, assistências, e o
// quanto o OVR do jogador está acima da média), mais XP — em vez do XP fixo
// e aleatório que o botão "Treinar" antigo dava sem relação nenhuma com o
// desempenho em campo.
function concederXPPorDesempenho(nota, golsJogadorPartida, assistsJogadorPartida) {
    const base = 14; // XP de participação, só por ter entrado em campo
    const bonusNota = Math.max(0, Math.round((nota - 5.5) * 7));
    const total = base + bonusNota;
    concederXPJogador(total, "desempenho em campo");
    return total;
}

function registrarMelhorAtuacao(gols, assistencias, adversario) {
    if(!jogador) return { recorde: false, nota: 0 };
    inicializarEstadoCarreiraJogador();
    const nota = 5.5 + (gols * 1.4) + (assistencias * 0.9) + ((jogador.geral || 60) - 60) * 0.04;
    const atual = jogador.melhorAtuacao?.nota || 0;
    if(nota > atual) {
        jogador.melhorAtuacao = { gols, assistencias, nota: Math.round(nota * 10) / 10, adversario: adversario || "Rival", rodada: rodadaAtual };
        return { recorde: atual > 0, nota }; // só é "recorde" se já existia uma marca anterior para bater
    }
    return { recorde: false, nota };
}

function statusTitularidade() {
    inicializarEstadoCarreiraJogador();
    if(jogador.lesaoRodadas > 0) return `Lesionado (${jogador.lesaoRodadas} sem.)`;
    if(jogador.titularidade >= 68) return "Titular";
    if(jogador.titularidade >= 42) return "Disputando vaga";
    return "Banco";
}

function ajustarTitularidade(delta) {
    inicializarEstadoCarreiraJogador();
    jogador.titularidade = Math.max(0, Math.min(100, jogador.titularidade + delta));
}

// ==========================================
// 🧠 CONTEXTO DE JOGO (clássicos, fase, jogos grandes) E ESCALAÇÃO INTELIGENTE
// ==========================================

// Encontra o principal rival de um clube (maior reputação na mesma liga).
function obterRivalClube(clubeId) {
    const c = clubes.find(x => x.id === clubeId);
    if (!c || !c.ligaId) return null;
    return clubes.filter(x => x.ligaId === c.ligaId && x.id !== c.id).sort((a, b) => b.reputacao - a.reputacao)[0] || null;
}

// Regista o resultado da partida na sequência recente do jogador (para detetar boa/má fase).
function registrarFormaResultado(resultado) {
    inicializarEstadoCarreiraJogador();
    jogador.formaResultados.push(resultado);
    if (jogador.formaResultados.length > 5) jogador.formaResultados.shift();
}

function avaliarFormaAtual() {
    const seq = jogador.formaResultados || [];
    const ultimos3 = seq.slice(-3);
    const vitorias = ultimos3.filter(r => r === "V").length;
    const derrotas = ultimos3.filter(r => r === "D").length;
    if (ultimos3.length >= 3 && vitorias >= 2 && derrotas === 0) return "boa";
    if (ultimos3.length >= 3 && derrotas >= 2) return "ma";
    return "neutra";
}

// Analisa o confronto e devolve o contexto usado para escolher e ponderar as entrevistas.
function avaliarContextoJogo(comp, advObj, isSel) {
    const clube = isSel ? null : clubes.find(c => c.id === jogador.clubeId);
    const rival = isSel ? null : obterRivalClube(jogador.clubeId);
    const isClassico = !isSel && rival && advObj && rival.id === advObj.id;
    const repAdversario = advObj?.reputacao || 70;
    const isFinalOuMataMata = !!(comp.isFinal || comp.isMataMata);
    const compGrandeSelecao = isSel && ["copa_mundo", "euro", "copa_america", "olimpiadas"].some(id => (comp.compConfigId || "").includes(id));
    const jogoGrande = isFinalOuMataMata || isClassico || repAdversario >= 84 || compGrandeSelecao;

    const forma = avaliarFormaAtual();
    const novoTecnico = !isSel && clube && jogador.tecnicoConhecido && clube.tecnico && clube.tecnico !== jogador.tecnicoConhecido;
    const transferenciaRecente = !isSel && (jogador.jogosNoClubeAtual || 0) <= 2;

    return {
        clube, rival, isClassico, jogoGrande, isFinalOuMataMata, forma, novoTecnico, transferenciaRecente,
        nomeAdversario: advObj?.nome || "o adversário", nomeClube: clube?.nome || "", nomeTecnico: clube?.tecnico || "o treinador"
    };
}

// Decide, antes do jogo, se o jogador começa titular, entra do banco (e em que minuto) ou fica fora dos planos.
// Reflete a "inteligência" da comissão técnica: um jogador precisa de titularidade para começar,
// e mesmo estando no banco pode nem entrar se a titularidade for muito baixa.
function decidirEscalacaoJogador() {
    inicializarEstadoCarreiraJogador();
    const t = jogador.titularidade;
    if (t >= 68) return { statusAtual: "titular", minutoEntrada: null, entra: true };
    if (t >= 35) {
        // Disputando vaga: entra do banco na maioria dos jogos, com o minuto de entrada a variar conforme a titularidade.
        const baseMin = Math.round(82 - (t - 35) * 0.55); // quanto maior a titularidade, mais cedo entra
        const minutoEntrada = Math.max(55, Math.min(85, baseMin + Math.floor(Math.random() * 10) - 5));
        return { statusAtual: "banco", minutoEntrada, entra: true };
    }
    // Titularidade muito baixa: o treinador pode simplesmente não contar com o jogador nesta partida.
    const entra = Math.random() < 0.32;
    return { statusAtual: entra ? "banco" : "fora", minutoEntrada: entra ? Math.max(70, 90 - Math.floor(Math.random() * 15)) : null, entra };
}

// Mostra (só quando algo muda) uma conversa rápida com o técnico sobre a escalação, depois chama onFechar().
function conversarComTecnico(escalacao, contexto, onFechar) {
    const statusAnterior = jogador.statusEscalacaoAnterior;
    jogador.statusEscalacaoAnterior = escalacao.statusAtual;
    if (statusAnterior === escalacao.statusAtual || document.getElementById("modalConversaTecnico")) {
        onFechar();
        return;
    }
    if (statusAnterior === null) { onFechar(); return; } // primeiro jogo: não interrompe com aviso

    const nomeTecnico = contexto.nomeTecnico || "O treinador";
    const tecnicoObj = contexto.clube ? (treinadoresIA || []).find(t => t.clubeId === contexto.clube.id) : null;
    const avatarTecnicoHTML = tecnicoObj
        ? `<img loading="lazy" decoding="async" data-tecnico-id="${tecnicoObj.id}" src="${obterUrlImagem(tecnicoObj, 'tecnico')}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'🧑\\u200d💼'}))">`
        : "🧑\u200d💼";
    let tag = "", frase = "";
    if (escalacao.statusAtual === "titular") {
        tag = "titular";
        const opcoes = [
            `"Você ganhou a posição no treino. Vai começar hoje entre os titulares."`,
            `"Chegou a sua vez. Confio em você desde o apito inicial."`,
            `"Você mostrou nível suficiente. Hoje começa jogando."`
        ];
        frase = opcoes[Math.floor(Math.random() * opcoes.length)];
    } else if (escalacao.statusAtual === "banco") {
        tag = "banco";
        const opcoes = statusAnterior === "titular" ? [
            `"Vou fazer uma rotação hoje. Você começa no banco, mas pode entrar."`,
            `"Preciso gerir o desgaste do grupo. Hoje começas de fora, mas fica atento."`,
            `"Não é castigo, é gestão de plantel. Começas no banco."`
        ] : [
            `"Continue a treinar assim. Hoje começas no banco, mas com chances reais de entrar."`,
            `"Estás mais perto. Começas no banco, mas de olho em te dar minutos."`
        ];
        frase = opcoes[Math.floor(Math.random() * opcoes.length)];
    } else {
        tag = "fora";
        frase = `"Sinceramente, não estás nos meus planos para este jogo. Continua a trabalhar."`;
    }

    const modal = document.createElement("div");
    modal.id = "modalConversaTecnico";
    modal.className = "modal";
    modal.innerHTML = `
        <div class="coach-talk-card">
            <div class="coach-talk-avatar">${avatarTecnicoHTML}</div>
            <span class="coach-talk-tag ${tag}">Conversa com ${nomeTecnico}</span>
            <p class="coach-talk-quote">${frase}</p>
            <button class="coach-talk-btn" id="btnFecharConversaTecnico">Entendido ➔</button>
        </div>`;
    document.body.appendChild(modal);
    document.getElementById("btnFecharConversaTecnico").onclick = () => {
        modal.remove();
        onFechar();
    };
}

// 🛡️ FIX: exposta no window porque é chamada a partir de botões com
// onclick="abrirEntrevista(...)" no HTML (que resolvem no escopo global, não
// no escopo deste módulo) — sem isto, o botão de "Conversa Coletiva" (e
// qualquer outro onclick que a chame diretamente) não fazia absolutamente
// nada ao clicar, sem nenhum erro visível para o jogador.
function abrirEntrevista(tipo, contexto = {}, aoFechar = null) {
    inicializarEstadoCarreiraJogador();
    if(document.getElementById("modalEntrevista")) { if(aoFechar) aoFechar(); return; }
    const nomeTecnicoAtual = contexto.tecnico || clubes.find(c => c.id === jogador.clubeId)?.tecnico || "O treinador";
    const perguntas = {
        pre: [{
            titulo: "Entrevista pré-jogo",
            pergunta: `Hoje é dia de jogo. Como vais encarar ${contexto.adversario || "o adversário"}?`,
            opcoes: [
                { texto: "Respeitamos o rival, mas vamos jogar para vencer.", moral: 4, titularidade: 2, noticia: "Discurso equilibrado antes do jogo" },
                { texto: "Quero decidir. Estes são os jogos que eu gosto.", moral: 7, titularidade: 4, noticia: "Craque chama responsabilidade" },
                { texto: "Prefiro responder dentro de campo.", moral: 2, titularidade: 1, noticia: "Resposta curta mantém foco total" }
            ]
        }, {
            titulo: "Coletiva pré-jogo",
            pergunta: `A imprensa pergunta se vais começar entre os titulares contra ${contexto.adversario || "o rival"}. Qual é a tua resposta?`,
            opcoes: [
                { texto: "Estou pronto para qualquer função que o treinador pedir.", moral: 4, titularidade: 3, noticia: "Resposta profissional antes da partida" },
                { texto: "Treinei para ser titular. Quero mostrar isso no relvado.", moral: 6, titularidade: 5, noticia: "Ambição por titularidade aumenta expectativa" },
                { texto: "O grupo está fechado e isso importa mais que nomes.", moral: 5, titularidade: 2, noticia: "Discurso coletivo fortalece vestiário" }
            ]
        }, {
            titulo: "Conferência tática",
            pergunta: `Falam muito da força de ${contexto.adversario || "do adversário"}. O plano é atacar ou controlar?`,
            opcoes: [
                { texto: "Temos de ser inteligentes: pressionar quando der e sofrer juntos quando precisar.", moral: 5, titularidade: 3, noticia: "Leitura tática recebe elogios" },
                { texto: "A melhor defesa é manter a bola e fazer o rival correr.", moral: 4, titularidade: 4, noticia: "Confiança no plano de posse ganha destaque" },
                { texto: "Jogo grande pede coragem. Vamos para cima.", moral: 7, titularidade: 3, noticia: "Tom agressivo agita a antevisão" }
            ]
        }],
        pre_grande: [{
            titulo: "Antevisão do jogo grande",
            pergunta: `Tudo aponta para um duelo decisivo contra ${contexto.adversario || "o adversário"}. Sentes a pressão?`,
            opcoes: [
                { texto: "Jogos assim são o motivo pelo qual joguei futebol a vida toda.", moral: 8, titularidade: 4, noticia: "Craque assume protagonismo antes do jogo grande" },
                { texto: "É só mais uma partida de três pontos, não vou dramatizar.", moral: 3, titularidade: 2, noticia: "Discurso frio tenta baixar a temperatura" },
                { texto: "Sinto a responsabilidade, mas confio no trabalho da semana.", moral: 5, titularidade: 3, noticia: "Equilíbrio marca antevisão de jogo grande" }
            ]
        }, {
            titulo: "Coletiva de decisão",
            pergunta: `Este confronto contra ${contexto.adversario || "o rival"} pode definir a temporada. Qual é a mensagem para a torcida?`,
            opcoes: [
                { texto: "Vamos entrar para vencer, sem medo do tamanho do jogo.", moral: 7, titularidade: 4, noticia: "Mensagem de confiança antes da decisão" },
                { texto: "Precisamos de foco total, um erro pode custar caro.", moral: 4, titularidade: 3, noticia: "Cautela antes do jogo decisivo" },
                { texto: "A torcida pode confiar, estamos preparados para este momento.", moral: 6, titularidade: 3, noticia: "Jogador tranquiliza os adeptos" }
            ]
        }],
        pre_classico: [{
            titulo: "Antevisão do clássico",
            pergunta: `É semana de clássico contra ${contexto.adversario || "o rival histórico"}. Como se prepara a cabeça para este jogo?`,
            opcoes: [
                { texto: "Clássico é diferente de tudo. Vamos honrar a camisa.", moral: 7, titularidade: 4, noticia: "Discurso emociona a torcida antes do clássico" },
                { texto: "É mais um jogo, três pontos importantes como qualquer outro.", moral: 3, titularidade: 2, noticia: "Postura fria antes do clássico gera debate" },
                { texto: "Sabemos o que este jogo significa para a torcida. Vamos com tudo.", moral: 6, titularidade: 3, noticia: "Jogador reconhece peso histórico do clássico" }
            ]
        }],
        pre_boafase: [{
            titulo: "Coletiva em alta",
            pergunta: `Depois de uma sequência de bons resultados, a expectativa aumentou. Como lidas com isso?`,
            opcoes: [
                { texto: "Estamos confiantes, mas com os pés no chão.", moral: 5, titularidade: 3, noticia: "Confiança equilibrada marca boa fase" },
                { texto: "Quero continuar decidindo. É a minha melhor fase.", moral: 8, titularidade: 5, noticia: "Jogador em alta assume responsabilidade" },
                { texto: "O mérito é do grupo. Estamos entrosados.", moral: 5, titularidade: 2, noticia: "Discurso coletivo valoriza o elenco" }
            ]
        }],
        pre_mafase: [{
            titulo: "Coletiva sob pressão",
            pergunta: `A sequência recente de resultados ruins aumentou a pressão sobre a equipa. Qual é a resposta?`,
            opcoes: [
                { texto: "Sabemos que não estamos bem, mas vamos reagir juntos.", moral: 4, titularidade: 2, noticia: "Discurso de união em momento de crise" },
                { texto: "A culpa é de todos, incluindo minha. Vou dar a volta nisso.", moral: 3, titularidade: 4, noticia: "Autocrítica forte em meio à má fase" },
                { texto: "A pressão externa não deveria existir tanto assim.", moral: 1, titularidade: 1, noticia: "Fala sobre pressão irrita torcida em má fase" }
            ]
        }],
        novotecnico: [{
            titulo: "Chegada do novo treinador",
            pergunta: `Com a chegada de ${contexto.tecnico || "um novo treinador"}, como está a adaptação?`,
            opcoes: [
                { texto: "Estou totalmente à disposição para provar meu valor de novo.", moral: 5, titularidade: 3, noticia: "Jogador se coloca à disposição do novo técnico" },
                { texto: "Cada treinador tem suas ideias, vou me adaptar rápido.", moral: 4, titularidade: 2, noticia: "Discurso profissional marca chegada de treinador" },
                { texto: "Espero manter o espaço que conquistei no time.", moral: 3, titularidade: 1, noticia: "Jogador demonstra receio com nova comissão técnica" }
            ]
        }],
        transferencia: [{
            titulo: "Apresentação no novo clube",
            pergunta: `Bem-vindo ao ${contexto.clube || "novo clube"}! Quais são as suas expectativas para esta nova etapa?`,
            opcoes: [
                { texto: "Vim para ganhar espaço e ajudar a equipa desde já.", moral: 7, titularidade: 3, noticia: "Nova contratação promete impacto imediato" },
                { texto: "Sei que preciso de tempo para me adaptar, mas vou trabalhar duro.", moral: 5, titularidade: 1, noticia: "Reforço pede paciência na adaptação" },
                { texto: "Quero conquistar títulos importantes com esta camisa.", moral: 6, titularidade: 2, noticia: "Ambição alta marca chegada de reforço" }
            ]
        }],
        pos: [{
            titulo: "Entrevista pós-jogo",
            pergunta: `Fim de jogo: ${contexto.placar || "resultado definido"}. O que dizes aos adeptos?`,
            opcoes: [
                { texto: "A equipa vem primeiro. O importante é continuar a evoluir.", moral: 4, titularidade: 3, noticia: "Postura coletiva agrada balneário" },
                { texto: "Fico feliz pelo meu desempenho, trabalhei muito por isto.", moral: 6, titularidade: 4, noticia: "Confiança cresce após atuação" },
                { texto: "Não foi suficiente. Tenho de entregar mais.", moral: 3, titularidade: 5, noticia: "Autocrítica forte chama atenção" }
            ]
        }, {
            titulo: "Zona mista",
            pergunta: `Depois do ${contexto.placar || "resultado"}, perguntam sobre a tua influência no jogo.`,
            opcoes: [
                { texto: "Cada minuto conta. Quero transformar oportunidade em impacto.", moral: 5, titularidade: 4, noticia: "Fala sobre impacto chama atenção da comissão" },
                { texto: "Ainda posso ser mais decisivo. Vou cobrar isso de mim.", moral: 4, titularidade: 5, noticia: "Exigência pessoal marca pós-jogo" },
                { texto: "A torcida empurrou muito. Isso muda uma partida.", moral: 6, titularidade: 2, noticia: "Jogador valoriza ambiente no estádio" }
            ]
        }, {
            titulo: "Coletiva pós-jogo",
            pergunta: `O treinador elogiou a entrega da equipa no ${contexto.placar || "jogo"}. Como respondes?`,
            opcoes: [
                { texto: "O elogio é do grupo todo. Ninguém ganha sozinho.", moral: 5, titularidade: 3, noticia: "Humildade agrada o elenco" },
                { texto: "É bom ouvir isso, mas amanhã começa outra luta.", moral: 4, titularidade: 4, noticia: "Mentalidade competitiva vira manchete" },
                { texto: "Quando tenho confiança, consigo decidir mais jogos.", moral: 7, titularidade: 3, noticia: "Confiança pública aumenta expectativa" }
            ]
        }],
        pos_vitoria_grande: [{
            titulo: "Coletiva da vitória histórica",
            pergunta: `Vitória por ${contexto.placar || "um grande placar"} num jogo enorme! O que significa este resultado?`,
            opcoes: [
                { texto: "É um resultado para entrar na história do clube.", moral: 8, titularidade: 4, noticia: "Vitória em jogo grande vira manchete histórica" },
                { texto: "Ganhamos um jogo, agora é pensar no próximo.", moral: 4, titularidade: 3, noticia: "Discurso comedido após vitória importante" },
                { texto: "Mostramos que podemos brigar com qualquer adversário.", moral: 6, titularidade: 3, noticia: "Confiança cresce após triunfo em jogo grande" }
            ]
        }],
        pos_derrota_vexame: [{
            titulo: "Coletiva do vexame",
            pergunta: `Derrota dolorosa por ${contexto.placar || "um placar constrangedor"}. Como explicar o que aconteceu?`,
            opcoes: [
                { texto: "Não existe desculpa. Foi um dos piores dias da nossa carreira.", moral: -6, titularidade: 2, noticia: "Autocrítica dura após vexame" },
                { texto: "Precisamos analisar com calma e corrigir os erros.", moral: -3, titularidade: 1, noticia: "Discurso ponderado tenta conter crise após goleada" },
                { texto: "A responsabilidade é de todos, sem exceção.", moral: -4, titularidade: 3, noticia: "Jogador assume parte da culpa pelo vexame" }
            ]
        }],
        pos_classico: [{
            titulo: "Coletiva do clássico",
            pergunta: `Fim do clássico contra ${contexto.adversario || "o rival"}: ${contexto.placar || "resultado definido"}. O que representa este resultado?`,
            opcoes: [
                { texto: "Vencer um clássico não tem preço para a torcida.", moral: 7, titularidade: 4, noticia: "Vitória em clássico eleva moral do elenco" },
                { texto: "Clássico é sempre especial, ganhando ou perdendo aprendemos algo.", moral: 3, titularidade: 2, noticia: "Discurso maduro após o clássico" },
                { texto: "Vamos digerir este resultado e focar no próximo desafio.", moral: 2, titularidade: 2, noticia: "Foco no futuro após o clássico" }
            ]
        }],
        pos_recorde: [{
            titulo: "Coletiva da marca pessoal",
            pergunta: `Nova melhor atuação da carreira! O que representa esse recorde pessoal?`,
            opcoes: [
                { texto: "Estou trabalhando cada dia para chegar mais longe.", moral: 8, titularidade: 4, noticia: "Novo recorde pessoal repercute na imprensa" },
                { texto: "Números são consequência do trabalho coletivo.", moral: 5, titularidade: 3, noticia: "Humildade marca resposta após nova marca pessoal" },
                { texto: "Quero continuar quebrando as minhas próprias marcas.", moral: 7, titularidade: 4, noticia: "Ambição de superação chama atenção da mídia" }
            ]
        }],
        lesao: [{
            titulo: "Coletiva médica",
            pergunta: "A imprensa pergunta sobre a tua recuperação. Qual é o tom?",
            opcoes: [
                { texto: "Vou respeitar os médicos e voltar mais forte.", moral: 4, titularidade: 0, noticia: "Mensagem madura após lesão" },
                { texto: "Quero voltar o quanto antes, não sei ficar parado.", moral: 6, titularidade: -1, noticia: "Ansiedade por retorno movimenta coletiva" },
                { texto: "É frustrante, mas faz parte da carreira.", moral: 2, titularidade: 0, noticia: "Frustração controlada no departamento médico" }
            ]
        }],
        selecao: [{
            titulo: "Coletiva da seleção",
            pergunta: `Foste chamado pela Seleção ${contexto.selecao || ""} para ${contexto.competicao || "a Data FIFA"}. O que significa esta convocação?`,
            opcoes: [
                { texto: "É uma honra enorme, mas sei que preciso provar todos os dias.", moral: 6, titularidade: 2, noticia: "Resposta madura na seleção" },
                { texto: "Quero ser protagonista também com esta camisa.", moral: 8, titularidade: 3, noticia: "Ambição internacional vira manchete" },
                { texto: "A convocação é do grupo. Vou ajudar onde o treinador precisar.", moral: 5, titularidade: 2, noticia: "Discurso coletivo agrada comissão da seleção" }
            ]
        }, {
            titulo: "Perguntas internacionais",
            pergunta: `A imprensa pergunta se a pressão da Seleção ${contexto.selecao || ""} é maior que a do clube.`,
            opcoes: [
                { texto: "A pressão é privilégio. Eu queria estar neste palco.", moral: 7, titularidade: 2, noticia: "Frase forte marca coletiva internacional" },
                { texto: "O segredo é manter a mesma rotina e não mudar quem eu sou.", moral: 5, titularidade: 3, noticia: "Equilíbrio chama atenção na seleção" },
                { texto: "Vou deixar a resposta para o campo.", moral: 4, titularidade: 1, noticia: "Foco total antes dos jogos internacionais" }
            ]
        }],
        final: [{
            titulo: "Coletiva de Grande Final",
            pergunta: `A final de ${contexto.competicao || "título"} está chegando. Como encaras este momento decisivo?`,
            opcoes: [
                { texto: "Finais são para serem ganhas. Vamos dar tudo.", moral: 10, titularidade: 5, noticia: "Determinação total antes da final" },
                { texto: "É o jogo da vida. Não posso errar.", moral: 5, titularidade: 3, noticia: "Pressão evidente na coletiva de final" },
                { texto: "Vou aproveitar cada segundo em campo.", moral: 8, titularidade: 4, noticia: "Foco no momento presente antes da decisão" }
            ]
        }, {
            titulo: "Expectativa da Final",
            pergunta: `Milhões de adeptos vão assistir. Qual é a mensagem para quem acredita em ti?`,
            opcoes: [
                { texto: "Vamos trazer o título para casa. Prometo.", moral: 12, titularidade: 6, noticia: "Promessa de título agita a torcida antes da final" },
                { texto: "O apoio de vocês é nossa força extra.", moral: 9, titularidade: 4, noticia: "Jogador valoriza apoio da torcida antes da decisão" },
                { texto: "Vamos fazer história juntos.", moral: 10, titularidade: 5, noticia: "Discurso de união marca antevisão de final" }
            ]
        }],
        final_vitoria: [{
            titulo: "Coletiva Pós-Título",
            pergunta: `CAMPEÃO! Como descreves este momento histórico?`,
            opcoes: [
                { texto: "É um sonho realizado. Dedico este título a todos.", moral: 15, titularidade: 8, noticia: "Emoção marca coletiva pós-título" },
                { texto: "Trabalhamos muito por isto. Merecemos.", moral: 12, titularidade: 6, noticia: "Jogador celebra conquista com orgulho" },
                { texto: "Isto é só o começo. Queremos mais.", moral: 10, titularidade: 7, noticia: "Ambição cresce após conquistar título" }
            ]
        }],
        final_derrota: [{
            titulo: "Coletiva Pós-Frustração",
            pergunta: `A final não saiu como planejado. O que dizes aos adeptos?`,
            opcoes: [
                { texto: "Peço desculpas. Vamos voltar mais fortes.", moral: 3, titularidade: 2, noticia: "Humildade marca derrota na final" },
                { texto: "Dói muito, mas vamos reagir.", moral: 5, titularidade: 3, noticia: "Resiliência após derrota na decisão" },
                { texto: "Não foi o nosso dia, mas a cabeça erguida.", moral: 4, titularidade: 2, noticia: "Dignidade na derrota chama atenção" }
            ]
        }],
        // 🗣️ Conversa coletiva com o grupo/técnico — acessível a qualquer
        // momento pelo botão "Falar com o Técnico" (não depende de haver jogo).
        coletiva_time: [{
            titulo: "Reunião coletiva com o elenco",
            pergunta: `${nomeTecnicoAtual} reúne o grupo antes do treino: "Preciso que este grupo puxe uns pelos outros. Alguém quer dizer alguma coisa?"`,
            opcoes: [
                { texto: "Levanto a voz e cobro mais entrega do grupo.", moral: 6, titularidade: 3, noticia: "Discurso de liderança agita o vestiário" },
                { texto: "Prefiro liderar pelo exemplo, sem grandes discursos.", moral: 3, titularidade: 1, noticia: "Atitude discreta é elogiada nos bastidores" },
                { texto: "Fico de fora. Não é a minha praia falar em público.", moral: -1, titularidade: -1, noticia: "Ausência em momento de união do grupo chama atenção" }
            ]
        }, {
            titulo: "Balanço com o técnico",
            pergunta: `${nomeTecnicoAtual} chama-te à parte: "Como sentes que está a correr a tua temporada até agora?"`,
            opcoes: [
                { texto: "Sinto que posso dar muito mais. Quero mais responsabilidade.", moral: 5, titularidade: 4, noticia: "Jogador pede mais protagonismo em conversa reservada" },
                { texto: "Estou satisfeito com a minha evolução, mas focado no grupo.", moral: 4, titularidade: 2, noticia: "Equilíbrio marca conversa com o técnico" },
                { texto: "Sinceramente, esperava estar a jogar mais.", moral: 2, titularidade: 3, noticia: "Jogador expressa insatisfação em conversa privada" }
            ]
        }]
    };
    const lista = perguntas[tipo] || perguntas.pre;
    const cfg = lista[Math.floor(Math.random() * lista.length)];
    const grandeBadge = contexto.jogoGrande ? `<span class="interview-tag-grande">Jogo Grande</span>` : "";
    const modal = document.createElement("div");
    modal.id = "modalEntrevista";
    modal.className = "modal";
    modal.innerHTML = `
        <div class="interview-card slide-in">
            <div style="display:flex; justify-content:space-between; gap:14px; align-items:flex-start;">
                <div>
                    <span style="color:var(--theme-primary); font-weight:900; text-transform:uppercase;">${cfg.titulo}</span>${grandeBadge}
                    <h2 style="margin:8px 0 10px;">${cfg.pergunta}</h2>
                    <p style="margin:0 0 14px; color:#aaa;">A resposta mexe com moral, imprensa e luta pela titularidade.</p>
                </div>
                <button class="close-btn" onclick="window.fecharEntrevista()">×</button>
            </div>
            ${cfg.opcoes.map((op, i) => `<button class="interview-option" onclick="responderEntrevista('${tipo}', ${i})">${op.texto}</button>`).join("")}
        </div>`;
    modal.dataset.tipo = tipo;
    modal._opcoes = cfg.opcoes;
    modal._aoFechar = aoFechar;
    modal._fechado = false;
    document.body.appendChild(modal);
}

// Fecha a entrevista sem responder (botão ×) e ainda assim avança o fluxo (ex.: início da partida).
window.fecharEntrevista = function() {
    const modal = document.getElementById("modalEntrevista");
    if(!modal) return;
    const cb = modal._aoFechar; modal._fechado = true;
    modal.remove();
    if(cb) cb();
};

// 🛡️ FIX: expõe abrirEntrevista no window (ver nota acima da função) —
// necessário para botões com onclick="abrirEntrevista(...)" no HTML.
window.abrirEntrevista = abrirEntrevista;

window.responderEntrevista = function(tipo, idx) {
    const modal = document.getElementById("modalEntrevista");
    const op = modal?._opcoes?.[idx];
    const cb = modal?._aoFechar;
    if(!op) { if(!modal?._fechado) cb?.(); modal?.remove(); return; }
    jogador.moral = Math.max(0, Math.min(100, (jogador.moral || 55) + op.moral));
    ajustarTitularidade(op.titularidade);
    jogador.entrevistasRespondidas = (jogador.entrevistasRespondidas || 0) + 1;
    
    // Interview effects on gameplay
    if(!jogador.buffEntrevista) jogador.buffEntrevista = {};
    
    // Apply temporary buffs based on interview type and response
    if(tipo === 'pre' || tipo === 'pre_grande' || tipo === 'pre_classico') {
        // Pre-match interviews boost morale and confidence
        jogador.buffEntrevista.moral = Math.min(100, (jogador.buffEntrevista.moral || 0) + 5);
        jogador.buffEntrevista.confidence = Math.min(100, (jogador.buffEntrevista.confidence || 0) + 3);
    } else if(tipo === 'pos' || tipo === 'pos_vitoria' || tipo === 'pos_derrota') {
        // Post-match interviews affect media perception and fan support
        jogador.buffEntrevista.mediaReputation = Math.min(100, (jogador.buffEntrevista.mediaReputation || 50) + op.moral);
        if(op.moral > 5) {
            // Good responses increase fan base slightly
            if(jogador.lifestyle?.fanBase) {
                jogador.lifestyle.fanBase = Math.min(1000000, jogador.lifestyle.fanBase + Math.floor(Math.random() * 500) + 100);
            }
        }
    } else if(tipo === 'selecao') {
        // National team interviews boost international reputation
        jogador.buffEntrevista.internationalReputation = Math.min(100, (jogador.buffEntrevista.internationalReputation || 0) + 4);
    }
    
    // Buff duration: affects next match
    jogador.buffEntrevista.expiresAfter = (jogador.buffEntrevista.expiresAfter || 0) + 1;
    
    registrarNoticia(op.noticia, `${jogador.nome}: "${op.texto}"`, "Entrevista", { nome: jogador.nome, foto: jogador.foto }, "jogador");
    mostrarToast("Coletiva", op.moral > 5 ? "Resposta positiva repercutiu bem na imprensa!" : "Resposta registrada pela mídia.", op.moral > 5 ? "success" : "info");
    modal._fechado = true;
    modal.remove();
    window.salvarJogo();
    atualizarHub();
    if(cb) cb();
};

// 🏆 Animação de título — antes esta função criava os confetes mas NUNCA
// anexava o modal ao body nem desenhava nada além deles (nomeTime,
// nomeCompeticao e logoTimeUrl eram recebidos e simplesmente ignorados), então
// na prática nada aparecia na tela. Agora monta a taça (imagem real da
// competição via obterUrlImagem/'trofeu', com emoji de reserva se a imagem
// falhar), o nome do título e o escudo do campeão, e efetivamente insere tudo
// no documento — fechando sozinho se o jogador não clicar em "Continuar".

let jogador;
let anoAtual = 2026;
let rodadaAtual = 1;

// ==========================================
// 🌐 SINCRONIZAÇÃO DE TEMPORADA — LOBBY ONLINE
// ==========================================
// Chamado (via window) quando o lobby pré-jogo (telaPregameLobby) inicia a
// carreira partilhada depois de ambos os jogadores ficarem "Prontos".
// Garante que anfitrião e convidado começam exatamente na mesma temporada
// e rodada, independentemente de qualquer estado local anterior na aba.
window.sincronizarTemporadaOnline = function(ano = 2026, rodada = 1) {
    anoAtual = ano;
    rodadaAtual = rodada;
    window.anoAtual = ano;
    window.rodadaAtual = rodada;
    console.log(`🌐 Carreira online sincronizada — Temporada ${ano}, Rodada ${rodada}`);
};

// Bridge "ao vivo": como anoAtual/rodadaAtual são variáveis locais do módulo
// (não ficam sincronizadas automaticamente em window.*), o firebase-integration.js
// (script clássico) usa esta função para ler sempre o valor atual, e não uma
// cópia potencialmente desatualizada.
window.obterEstadoTemporadaAtual = function() {
    return { ano: anoAtual, rodada: rodadaAtual };
};

// ==========================================
// 🌐 SISTEMA DE "PRONTO" POR RODADA
// ==========================================
// Marca-me como pronto para a rodada atual e só deixa continuar quando o
// amigo também estiver. Se ele ainda não estiver pronto, avisa e retoma
// automaticamente (reclicando o botão indicado) assim que ele ficar.
window.aguardarSincronizacaoRodada = function(idBotaoParaRetomar) {
    if (window.connectionMode !== 'online' || !window.firebaseIntegration || !window.firebaseIntegration.aguardarProntoRodada) {
        return Promise.resolve(true);
    }
    return window.firebaseIntegration.aguardarProntoRodada(rodadaAtual, () => {
        mostrarToast("Mundo Compartilhado", "O teu amigo ficou pronto! A continuar a rodada...", "success");
        document.getElementById(idBotaoParaRetomar)?.click();
    }).then(pronto => {
        if (!pronto) {
            mostrarToast("Mundo Compartilhado", "Ficaste pronto! A aguardar o teu amigo terminar a rodada dele...", "info");
        }
        return pronto;
    });
};

let agendaTemporada = [];
let propostasPendentes = [];
let negociacaoAtual = null;
let premiosIndividuaisPendentes = [];
let titulosClubesPendentes = [];
let transferenciasHistorico = [];
let eventosRecentes = [];
let janelaMeioAnoProcessada = false;
let copasEstado = {};
let selecoesEstado = { convocacoes: [], ultimaChave: "", campeoes: {}, ranking: {}, nationsDiv: {}, torneios: {}, planteisTorneio: {}, premiosLigaAno: {}, vagasTorneio: {} };
window.vagasContinentais = { uefa_cl: [], uefa_el: [], uefa_col: [], conmebol_lib: [], conmebol_sul: [], concacaf_clc: [], afc_cla: [], afc_cla2: [] };
let campeoesAnoAnterior = { ligas: {}, copas: {} };
let uiFiltroCompInt = "todos";
let uiSelectCompInt = null;
let managerEstado = { ativo: false, treinador: null, clubeId: null, confianca: 65, tatica: { 
    formacao: "4-3-3", 
    estilo: "pressao", 
    mentalidade: "equilibrado", 
    pressao: "média", 
    largura: "normal",
    // 🎯 Estilos de posse de bola
    posseBola: "equilibrado", // contra-ataque, jogo-direto, tiki-taka, vertical, cruzamentos, chutes-longe
    // 🏗️ Construção
    construcao: "curta", // curta, longa, mista
    goleiroConstrucao: false,
    zagueirosAbertos: false,
    volanteRecuado: false,
    // ⚔️ Ataque
    direcaoAtaque: "meio", // meio, lados, misto
    inverterJogo: false,
    sobreposicaoLaterais: true,
    subidasLaterais: "equilibrado", // nunca, apoio, sempre
    liberdadeCriativa: false,
    tipoCruzamento: "misto", // baixo, alto, misto
    // 🛡️ Defesa
    linhaDefensiva: "media", // baixa, media, alta
    linhaPressao: "media", // baixa, media, alta
    intensidadeMarcacao: "media", // baixa, media, alta
    pressaoAposPerda: true,
    recuarAposPerda: false,
    tipoMarcacao: "zona", // zona, individual, mista
    armadilhaImpedimento: false
}, orcamentoTransferencias: 0, folhaSalarial: 0, base: [], propostasRecebidas: [], funcoesJogadores: {}, instrucoesIndividuais: {}, promocoesBaseTemporada: 0, auxiliarTecnico: null, auxiliaresDisponiveis: [] };
// 🛡️ Limite realista de promoções da base por temporada: sem isto o
// treinador-jogador podia subir o elenco inteiro da base de uma vez, o que
// não acontece nem nos maiores clubes do mundo — normalmente só um punhado
// de jovens sobe ao profissional a cada ano.
const LIMITE_PROMOCOES_BASE_POR_TEMPORADA = 3;
// 👔 MERCADO DE TREINADORES — cada clube (e cada seleção) tem um técnico de
// verdade (nome, estilo de jogo próprio, reputação), não só uma string
// decorativa. Pode ser demitido e contratado a cada temporada; uma fatia bem
// pequena de jogadores recém-aposentados pode virar técnico. Ver
// gerarTreinadoresIniciais / processarCarrosselTreinadores.
let treinadoresIA = [];
// Controla quais competições já mostraram o vídeo/cinemática de abertura este ano (chave: `${compId}_${ano}`)
let introsExibidas = {};

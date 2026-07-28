// ==========================================
// 💾 SISTEMA DE GRAVAÇÃO (GLOBAL)
// ==========================================
window.salvarJogo = function() { 
    // 🛡️ FIX: nunca persistir os jogadores online sincronizados (Firebase) no
    // save — eles são temporários e devem ser sempre recarregados ao vivo pelo
    // listener, senão ficam "presos" como NPCs fantasmas em sessões futuras.
    const npcsParaGuardar = jogadoresIA.filter(j => !j.isFirebasePlayer && !j.isOnlinePlayer);

    localStorage.setItem("rumo_estrelato_pro_vivo", JSON.stringify({ 
        jogador, ano: anoAtual, rodada: rodadaAtual, agenda: agendaTemporada, 
        tabelas: tabelasLigas, copas: copasEstado, vagasContinentais: window.vagasContinentais, 
        campeoesAnoAnterior: campeoesAnoAnterior, premiosIndividuaisPendentes: premiosIndividuaisPendentes, titulosClubesPendentes: titulosClubesPendentes,
        transferenciasHistorico: transferenciasHistorico, eventosRecentes: eventosRecentes, janelaMeioAnoProcessada: janelaMeioAnoProcessada,
        selecoesEstado: selecoesEstado,
        managerEstado: managerEstado,
        treinadoresIA: treinadoresIA,
        introsExibidas: introsExibidas,
        clubesSave: clubes, npcsSave: npcsParaGuardar,
        // 🛡️ FIX: guarda a identidade online (quem sou eu, quem é o meu amigo,
        // em que clube ele está) — sem isto, recarregar a página a meio de uma
        // carreira online perdia a ligação com o amigo silenciosamente, e o
        // jogo "voltava a ser offline" sem avisar ninguém.
        connectionMode: window.connectionMode || null,
        lobbyPlayerId: window.lobbyPlayerId || null,
        onlinePartnerId: window.onlinePartnerId || null,
        onlinePartnerClubeId: window.onlinePartnerClubeId || null
    })); 
    
    // Sync to Firebase if online mode is active
    if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode()) {
        window.firebaseIntegration.syncPlayerDataToFirebase();
    }
};

function carregarJogo() {
    const save = localStorage.getItem("rumo_estrelato_pro_vivo");
    if (save) {
        let dados = JSON.parse(save);
        jogador = dados.jogador; anoAtual = dados.ano; rodadaAtual = dados.rodada; agendaTemporada = dados.agenda || []; copasEstado = dados.copas || {};
        window.jogador = jogador; // 🛡️ FIX: mantém window.jogador (usado pelo firebase-integration.js) na mesma referência
        // Backwards compatibility: initialize training flag for existing saves
        if(jogador && typeof jogador.jogouPartidaDesdeUltimoTreino === 'undefined') jogador.jogouPartidaDesdeUltimoTreino = false;
        inicializarEstadoCarreiraJogador();
        if(dados.vagasContinentais) window.vagasContinentais = dados.vagasContinentais;
        if(dados.campeoesAnoAnterior) campeoesAnoAnterior = dados.campeoesAnoAnterior;
        if(dados.premiosIndividuaisPendentes) premiosIndividuaisPendentes = dados.premiosIndividuaisPendentes;
        if(dados.titulosClubesPendentes) titulosClubesPendentes = dados.titulosClubesPendentes;
        if(dados.transferenciasHistorico) transferenciasHistorico = dados.transferenciasHistorico;
        if(dados.eventosRecentes) eventosRecentes = dados.eventosRecentes;
        if(dados.managerEstado) managerEstado = { ativo: false, treinador: null, clubeId: null, confianca: 65, tatica: { formacao: "4-3-3", estilo: "pressao", mentalidade: "equilibrado", pressao: "média", largura: "normal" }, orcamentoTransferencias: 0, folhaSalarial: 0, base: [], propostasRecebidas: [], promocoesBaseTemporada: 0, auxiliarTecnico: null, auxiliaresDisponiveis: [], ...dados.managerEstado };
        treinadoresIA = dados.treinadoresIA || [];
        // Um save de treinador deve voltar direto para a navegação exclusiva
        // do Manager, sem ressuscitar abas pessoais do modo Jogador.
        if (managerEstado.ativo) window.gameMode = "manager";
        if(dados.introsExibidas) introsExibidas = dados.introsExibidas;
        if(dados.selecoesEstado) {
            selecoesEstado = { convocacoes: [], ultimaChave: "", campeoes: {}, ranking: {}, nationsDiv: {}, torneios: {}, planteisTorneio: {}, ...dados.selecoesEstado };
            selecoesEstado.torneios = selecoesEstado.torneios || {};
            selecoesEstado.planteisTorneio = selecoesEstado.planteisTorneio || {};
            selecoesEstado.campeoes = selecoesEstado.campeoes || {};
            selecoesEstado.nationsDiv = selecoesEstado.nationsDiv || {};
            selecoesEstado.premiosLigaAno = selecoesEstado.premiosLigaAno || {};
            selecoesEstado.vagasTorneio = selecoesEstado.vagasTorneio || {};
        }
        if(typeof dados.janelaMeioAnoProcessada !== 'undefined') janelaMeioAnoProcessada = dados.janelaMeioAnoProcessada;
        if(dados.clubesSave) { clubes.length = 0; dados.clubesSave.forEach(cs => clubes.push(cs)); }
        if(dados.npcsSave) {
            jogadoresIA.length = 0;
            // 🛡️ FIX: descarta qualquer jogador online sincronizado que tenha
            // ficado preso num save antigo (de testes anteriores) — eles são
            // recarregados ao vivo pelo Firebase quando necessário.
            dados.npcsSave.filter(n => !n.isFirebasePlayer && !n.isOnlinePlayer).forEach(n => jogadoresIA.push(n));
        }

        // 🛡️ FIX: reconecta ao mundo partilhado se esta carreira era online —
        // sem isto, um simples F5/recarregar a meio de uma carreira online
        // perdia a ligação com o amigo (voltava tudo a offline, em silêncio).
        if (dados.connectionMode === 'online' && dados.lobbyPlayerId && window.firebaseIntegration) {
            window.connectionMode = 'online';
            window.lobbyPlayerId = dados.lobbyPlayerId;
            window.onlinePartnerId = dados.onlinePartnerId || null;
            window.onlinePartnerClubeId = dados.onlinePartnerClubeId || null;
            window.firebaseIntegration.activateSharedWorld(dados.lobbyPlayerId, dados.onlinePartnerId || null);
        }
        normalizarElencosEPosicoes();
        sincronizarTodosOversComAtributos();
        garantirTreinadoresIniciais();
        aplicarHistoricosReaisIniciais();
        for (let key in tabelasLigas) delete tabelasLigas[key]; Object.assign(tabelasLigas, dados.tabelas);
        
        if(clubes.length < 30) preencherLigasVazias(); if(Object.keys(tabelasLigas).length === 0) inicializarTabelas();
        atualizarOVRClubes(); inicializarOrcamentosEContratos(); preencherDropdowns();
        if(Object.keys(copasEstado).length === 0) inicializarCopasNacionaisEContinentais();
        if(agendaTemporada.length === 0) gerarAgenda();
        else normalizarAgendaCalendario();
        
        configurarNavegacaoPorModo(); atualizarHub(); mudarTela("view-hub"); 
        let homeV = document.getElementById("view-home"); if(homeV) { homeV.classList.remove("oculto"); homeV.style.display="block"; }
        if(jogador?.estatisticasAtuais && !jogador.estatisticasAtuais.assistencias) jogador.estatisticasAtuais.assistencias = 0;
        if(jogador?.estatisticasAtuais && !jogador.estatisticasAtuais.defesas) jogador.estatisticasAtuais.defesas = 0;
        return true;
    } return false;
}
// 🛡️ FIX: expõe no window — firebase-integration.js checa "window.carregarJogo"
// no fluxo de reconexão automática de sessão.
window.carregarJogo = carregarJogo;

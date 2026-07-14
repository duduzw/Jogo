// Helper functions for coach conversation system - append to main.js

window.mudarFuncaoElenco = function(novaFuncao) {
    jogador.funcaoNoElenco = novaFuncao;
    
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

aplicarHistoricosReaisIniciais();

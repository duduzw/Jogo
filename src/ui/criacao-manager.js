function renderizarListaClubesCriacaoManager(termo = "") {
    const el = document.getElementById("listaClubesCriacaoManager");
    if (!el) return;
    const t = termo.trim().toLowerCase();
    const lista = clubes
        .filter(c => !t || c.nome.toLowerCase().includes(t) || (c.ligaId || "").toLowerCase().includes(t) || (competicoes.find(comp => comp.id === c.ligaId)?.nome || "").toLowerCase().includes(t))
        .sort((a, b) => b.reputacao - a.reputacao)
        .slice(0, 60);
    el.innerHTML = lista.map(c => `
        <div class="clube-criacao-manager-row ${window.clubeEscolhidoManagerCriacao === c.id ? "selecionado" : ""}" onclick="selecionarClubeCriacaoManager('${c.id}')">
            <img src="${obterUrlImagem(c, 'clube')}" onerror="this.style.visibility='hidden'">
            <span><strong>${c.nome}</strong><small>${competicoes.find(comp => comp.id === c.ligaId)?.nome || c.ligaId} • OVR ${c.reputacao}</small></span>
            ${window.clubeEscolhidoManagerCriacao === c.id ? '<span class="clube-criacao-manager-check">✔</span>' : ""}
        </div>`).join("") || `<p style="color:#888; text-align:center; padding:20px;">Nenhum clube encontrado.</p>`;
}

window.selecionarClubeCriacaoManager = function(clubeId) {
    window.clubeEscolhidoManagerCriacao = clubeId;
    const c = clubes.find(x => x.id === clubeId);
    const label = document.getElementById("clubeEscolhidoManagerLabel");
    if (label && c) { label.textContent = c.nome; label.style.color = "var(--theme-primary)"; }
    renderizarListaClubesCriacaoManager(document.getElementById("inputBuscaClubeManager")?.value || "");
};

document.getElementById("inputBuscaClubeManager")?.addEventListener("input", (e) => renderizarListaClubesCriacaoManager(e.target.value));

document.getElementById("btnConfirmarCriacaoManager")?.addEventListener("click", () => {
    const nomeManager = document.getElementById("inputNomeManager")?.value?.trim();
    if (!nomeManager) { mostrarToast("Criação de Manager", "Digite o teu nome antes de continuar.", "warning"); return; }
    if (!window.clubeEscolhidoManagerCriacao) { mostrarToast("Criação de Manager", "Escolhe um clube antes de continuar.", "warning"); return; }

    // 🌍 O Manager não cria nenhum jogador jogável, mas precisa do MESMO
    // mundo pronto que o Modo Jogador monta (ligas, tabelas, orçamentos,
    // calendário) — sem isso não haveria nem clubes nem campeonato pra gerir.
    selecoesEstado = { convocacoes: [], ultimaChave: "", campeoes: {}, ranking: {}, nationsDiv: {}, torneios: {}, planteisTorneio: {}, premiosLigaAno: {}, vagasTorneio: {} };
    preencherLigasVazias(); inicializarTabelas(); inicializarOrcamentosEContratos(); inicializarCopasNacionaisEContinentais(); gerarAgenda(); preencherDropdowns(); atualizarOVRClubes();

    managerEstado.treinador = { nome: nomeManager, reputacao: 60, ataque: 60, defesa: 60, tatica: 60 };
    iniciarManagerNoClube(window.clubeEscolhidoManagerCriacao);

    configurarNavegacaoPorModo();
    window.salvarJogo();
    mudarTela("view-hub");
    document.querySelector('.menu-item[data-view="view-manager"]')?.click();
});

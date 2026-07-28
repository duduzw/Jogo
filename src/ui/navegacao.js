// ==========================================
// 🧭 NAVEGAÇÃO EXCLUSIVA DO MODO MANAGER
// ==========================================
// O Manager não reutiliza Lifestyle, negociações do atleta ou telas pessoais.
// Esta função troca apenas os atalhos laterais e mantém o Hub da Época como
// ponto de entrada comum entre as duas carreiras.
const MENU_MANAGER_HTML = `
    <button class="menu-item ativo" data-view="view-home">🏟️ Hub da Época</button>
    <button class="menu-item" data-view="view-manager" data-manager-tab="view-manager-tactics">🧠 Central Tática</button>
    <button class="menu-item" data-view="view-manager" data-manager-tab="view-manager-squad">👥 Elenco & Reservas</button>
    <button class="menu-item" data-view="view-manager" data-manager-tab="view-manager-transfers">💼 Mercado do Manager</button>
    <button class="menu-item" data-view="view-manager" data-manager-tab="view-manager-contracts">📄 Contratos do Manager</button>
    <button class="menu-item" data-view="view-manager" data-manager-tab="view-manager-finance">🏦 Finanças & Base</button>
    <button class="menu-item" data-view="view-classificacao">📊 Tabelas Globais</button>
    <button class="menu-item" data-view="view-chaveamentos">🏆 Chaveamentos</button>
    <button class="menu-item" data-view="view-noticias">📰 Notícias do Clube</button>`;
let menuJogadorOriginal = null;

function configurarNavegacaoPorModo() {
    const menu = document.querySelector(".sidebar-menu");
    if (!menu) return;
    if (!menuJogadorOriginal) menuJogadorOriginal = menu.innerHTML;
    const eManager = window.gameMode === "manager";
    const stats = document.querySelector(".sidebar-stats");
    if (stats && !stats.dataset.playerStats) stats.dataset.playerStats = stats.innerHTML;
    document.body.classList.toggle("modo-manager", eManager);
    if (eManager && !menu.dataset.managerMenu) {
        menu.innerHTML = MENU_MANAGER_HTML;
        menu.dataset.managerMenu = "true";
    } else if (!eManager && menu.dataset.managerMenu) {
        menu.innerHTML = menuJogadorOriginal;
        delete menu.dataset.managerMenu;
    }
    // Ao retornar ao modo Jogador, restaura também a ficha lateral original.
    if (!eManager && stats?.dataset.playerStats) stats.innerHTML = stats.dataset.playerStats;
}
window.configurarNavegacaoPorModo = configurarNavegacaoPorModo;

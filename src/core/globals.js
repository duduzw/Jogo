// Make jogadoresIA available globally for Firebase integration
window.jogadoresIA = jogadoresIA;
window.tabelasLigas = tabelasLigas;
window.clubes = clubes;
window.competicoes = competicoes;
window.feedNoticias = feedNoticias;

// ==========================================
// 🛡️ INICIALIZAÇÃO SEGURA DO ESCOPO GLOBAL (window)
// ==========================================
// Evita o erro 'before initialization' injetando direto no escopo do navegador
if (typeof window.jogador === 'undefined') window.jogador = undefined;
if (typeof window.anoAtual === 'undefined') window.anoAtual = 2026;
if (typeof window.currentRoomId === 'undefined') window.currentRoomId = null;
if (typeof window.rodadaAtual === 'undefined') window.rodadaAtual = 1;
if (typeof window.agendaTemporada === 'undefined') window.agendaTemporada = null;
if (typeof window.selecoesEstado === 'undefined') window.selecoesEstado = null;
if (typeof window.copasEstado === 'undefined') window.copasEstado = null;
if (typeof window.gameMode === 'undefined') window.gameMode = 'jogador'; // Pode ser alterado para 'manager'
if (typeof window.connectionMode === 'undefined') window.connectionMode = 'offline';
if (typeof window.isHost === 'undefined') window.isHost = false;
if (typeof window.lobbyPlayerId === 'undefined') window.lobbyPlayerId = null;

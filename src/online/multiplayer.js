// ==========================================
// 🌐 ROOM-BASED MULTIPLAYER SYNC
// ==========================================

window.handleRoomUpdate = function(roomData) {
    if (!roomData) return;

    const seasonState = roomData.seasonState;
    const matchData = roomData.matchData;

    // Sync season and round
    if (seasonState) {
        if (seasonState.currentSeason && seasonState.currentSeason !== window.anoAtual) {
            console.log("Syncing season from room:", seasonState.currentSeason);
            window.anoAtual = seasonState.currentSeason;
        }
        if (seasonState.currentRound && seasonState.currentRound !== window.rodadaAtual) {
            console.log("Syncing round from room:", seasonState.currentRound);
            window.rodadaAtual = seasonState.currentRound;
        }
    }

    // Sync match results if available
    if (matchData && matchData.matchResults) {
        const results = matchData.matchResults;
        Object.keys(results).forEach(matchId => {
            const result = results[matchId];
            // Apply match results to local state
            // This would integrate with your existing match result handling
            console.log("Syncing match result:", matchId, result);
        });
    }

    // Update UI to reflect synced state
    atualizarHub();
};

// ==========================================
// 🌐 ONLINE LOBBY SCREEN
// ==========================================

let lobbyReadyStates = {};

function renderOnlineLobby() {
    const el = document.getElementById("view-online-lobby");
    if (!el) return;

    const roomId = window.firebaseIntegration?.getRoomId();
    if (!roomId) {
        mostrarToast("Erro", "Não conectado a uma sala.", "danger");
        return;
    }

    // Get room players from Firebase
    const db = window.firebaseIntegration?.db;
    if (!db) return;

    db.ref(`rooms/${roomId}/players`).once("value", (snapshot) => {
        const players = snapshot.val();
        if (!players) return;

        const container = document.getElementById("lobby-players-container");
        container.innerHTML = "";

        Object.entries(players).forEach(([playerId, playerData]) => {
            const isMe = playerId === window.firebaseIntegration?.playerId;
            const isReady = lobbyReadyStates[playerId] || playerData.readyForLobby || false;

            const card = document.createElement("div");
            card.className = `lobby-player-card ${isReady ? 'ready' : 'not-ready'}`;
            card.innerHTML = `
                <div class="lobby-player-info">
                    <img loading="lazy" decoding="async" src="${playerData.foto || ''}" class="lobby-player-avatar" onerror="this.src='https://via.placeholder.com/60'">
                    <div class="lobby-player-details">
                        <h4>${playerData.nome || 'Jogador'}</h4>
                        <p>${playerData.nacionalidade || '—'} • ${playerData.posicao || '—'}</p>
                    </div>
                </div>
                ${isMe ? `<button class="lobby-ready-toggle ${isReady ? 'ready' : 'not-ready'}" onclick="toggleLobbyReady('${playerId}')">
                    ${isReady ? '✓ PRONTO' : 'AGUARDANDO'}
                </button>` : `<div style="text-align:center; font-weight:700; color:${isReady ? 'var(--success)' : 'var(--warning)'}">
                    ${isReady ? '✓ PRONTO' : 'AGUARDANDO'}
                </div>`}
            `;
            container.appendChild(card);
        });

        // Check if all players are ready
        const allReady = Object.values(players).every(p => lobbyReadyStates[p.id] || p.readyForLobby);
        const advanceBtn = document.getElementById("btn-advance-to-team");
        if (advanceBtn) {
            advanceBtn.disabled = !allReady;
        }
    });
}

window.toggleLobbyReady = function(playerId) {
    const isReady = !lobbyReadyStates[playerId];
    lobbyReadyStates[playerId] = isReady;

    // Update Firebase
    const roomId = window.firebaseIntegration?.getRoomId();
    const db = window.firebaseIntegration?.db;
    if (roomId && db) {
        db.ref(`rooms/${roomId}/players/${playerId}/readyForLobby`).set(isReady);
    }

    renderOnlineLobby();
};

document.getElementById("btn-advance-to-team")?.addEventListener("click", () => {
    // All players ready, proceed to team selection
    mudarTela("view-selecao-clube");
});

// Modify character creation flow to redirect to lobby when in online mode
const originalFinalizarCriacao = window.finalizarCriacao;
if (originalFinalizarCriacao) {
    window.finalizarCriacao = function() {
        originalFinalizarCriacao();

        // Check if in online mode and redirect to lobby
        if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode() && window.firebaseIntegration.getRoomId()) {
            renderOnlineLobby();
            mudarTela("view-online-lobby");
        } else {
            mudarTela("view-selecao-clube");
        }
    };
}

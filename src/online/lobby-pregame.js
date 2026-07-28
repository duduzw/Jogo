document.getElementById("btnVoltarMenu")?.addEventListener("click", () => {
    window.gameMode = null;
    mudarTela("telaModoSelecao");
});

document.getElementById("btnJogarOffline")?.addEventListener("click", () => {
    window.connectionMode = 'offline';
    mudarTela("telaCriacao");
});

document.getElementById("btnJogarOnline")?.addEventListener("click", () => {
    window.connectionMode = 'online';
    mudarTela("telaPregameLobby");
});

document.getElementById("btnVoltarModo")?.addEventListener("click", () => {
    window.connectionMode = null;
    mudarTela("telaModo");
});

// Pre-Game Lobby Functions
window.createPregameRoom = function() {
    if (!window.firebaseIntegration || !window.firebaseIntegration.createRoom) {
        mostrarToast("Erro", "Firebase não inicializado", "danger");
        return;
    }
    
    const roomCode = generateRoomCode();
    window.currentRoomId = roomCode;
    window.isHost = true;
    window.lobbyPlayerId = generatePlayerId();
    
    // Clear container to prevent ghost rows
    document.getElementById("lobbyPlayersContainer").innerHTML = "";
    
    // Create room in Firebase without pushing to global players
    window.firebaseIntegration.createPregameRoom(roomCode, window.lobbyPlayerId, window.gameMode);
    
    document.getElementById("lobbyRoomControls").classList.add("oculto");
    document.getElementById("lobbyRoomInfo").classList.remove("oculto");
    document.getElementById("lobbyRoomId").textContent = roomCode;
    document.getElementById("btnStartCareer").classList.remove("oculto");
    document.getElementById("btnStartCareer").disabled = true;
    
    mostrarToast("Sala Criada", `Código: ${roomCode}`, "success");
};

window.joinPregameRoom = function() {
    const roomCode = document.getElementById("inputRoomCode").value.trim().toUpperCase();
    
    if (!roomCode || roomCode.length !== 6) {
        mostrarToast("Erro", "Código inválido. Use 6 caracteres.", "danger");
        return;
    }
    
    if (!window.firebaseIntegration || !window.firebaseIntegration.joinPregameRoom) {
        mostrarToast("Erro", "Firebase não inicializado", "danger");
        return;
    }
    
    window.currentRoomId = roomCode;
    window.isHost = false;
    window.lobbyPlayerId = generatePlayerId();
    
    // Clear container to prevent ghost rows
    document.getElementById("lobbyPlayersContainer").innerHTML = "";
    
    window.firebaseIntegration.joinPregameRoom(roomCode, window.lobbyPlayerId, window.gameMode);
    
    document.getElementById("lobbyRoomControls").classList.add("oculto");
    document.getElementById("lobbyRoomInfo").classList.remove("oculto");
    document.getElementById("lobbyRoomId").textContent = roomCode;
    
    mostrarToast("Entrando", `A juntar-se à sala ${roomCode}...`, "info");
};

window.leavePregameLobby = function() {
    if (window.firebaseIntegration && window.firebaseIntegration.leavePregameLobby) {
        window.firebaseIntegration.leavePregameLobby(window.currentRoomId, window.lobbyPlayerId);
    }
    
    window.currentRoomId = null;
    window.isHost = false;
    window.lobbyPlayerId = null;
    
    document.getElementById("lobbyRoomControls").classList.remove("oculto");
    document.getElementById("lobbyRoomInfo").classList.add("oculto");
    document.getElementById("btnStartCareer").classList.add("oculto");
    document.getElementById("lobbyPlayersContainer").innerHTML = "";
    
    mudarTela("telaConexao");
};

window.toggleLobbyReady = function() {
    if (!window.firebaseIntegration || !window.firebaseIntegration.toggleLobbyReady) {
        return;
    }
    
    window.firebaseIntegration.toggleLobbyReady(window.currentRoomId, window.lobbyPlayerId);
};

window.startCareerFromLobby = function() {
    if (!window.isHost) {
        mostrarToast("Erro", "Apenas o anfitrião pode iniciar", "danger");
        return;
    }
    
    if (!window.firebaseIntegration || !window.firebaseIntegration.startCareerFromLobby) {
        return;
    }
    
    window.firebaseIntegration.startCareerFromLobby(window.currentRoomId);
};

function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function generatePlayerId() {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Render lobby players with container clearing to prevent duplicates
window.renderLobbyPlayers = function(players) {
    const container = document.getElementById("lobbyPlayersContainer");
    if (!container) return;
    
    // CRITICAL: Clear container to prevent duplicate player bug
    container.innerHTML = "";
    
    if (!players || Object.keys(players).length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); text-align:center; grid-column:1/-1;">Aguardando jogadores...</p>';
        return;
    }
    
    Object.entries(players).forEach(([playerId, playerData]) => {
        const isReady = playerData.ready || false;
        const isMe = playerId === window.lobbyPlayerId;
        
        const card = document.createElement("div");
        card.className = `lobby-player-card ${isReady ? 'ready' : 'not-ready'}`;
        card.innerHTML = `
            <div class="lobby-player-avatar">👤</div>
            <div class="lobby-player-name">${playerData.name || 'Jogador'}</div>
            <div class="lobby-player-status">${isReady ? 'PRONTO' : 'AGUARDANDO'}</div>
            ${isMe ? `<button class="lobby-ready-toggle ${isReady ? 'ready' : 'not-ready'}" onclick="toggleLobbyReady()">
                ${isReady ? '✓ PRONTO' : 'AGUARDANDO'}
            </button>` : `<div style="font-weight:700; color:${isReady ? 'var(--success)' : 'var(--warning)'}; font-size:0.9rem;">
                ${isReady ? '✓ PRONTO' : 'AGUARDANDO'}
            </div>`}
        `;
        container.appendChild(card);
    });
};

// Update start button state based on all players ready
window.updateLobbyStartButton = function(allReady) {
    const btn = document.getElementById("btnStartCareer");
    if (!btn) return;
    
    if (window.isHost) {
        btn.disabled = !allReady;
        btn.style.opacity = allReady ? '1' : '0.5';
    }
};

document.getElementById("btnCreateRoom")?.addEventListener("click", createPregameRoom);
document.getElementById("btnJoinRoom")?.addEventListener("click", joinPregameRoom);
document.getElementById("btnLeaveLobby")?.addEventListener("click", leavePregameLobby);
document.getElementById("btnStartCareer")?.addEventListener("click", startCareerFromLobby);

// 🎯 ATRIBUTOS INICIAIS ALEATÓRIOS POR POSIÇÃO
// Antes disto todo mundo nascia com o mesmo "molde" genérico (jogadorModelo)
// e só distribuía manualmente 10 pontos extras — o resultado final quase não
// variava de um jogador pro outro e não refletia a posição escolhida. Agora
// os atributos nascem sorteados dentro de faixas que dependem da posição: os
// atributos PRINCIPAIS dela saem bem mais fortes, os FRACOS saem mais baixos
// (ex: um atacante nasce com finalização/velocidade alta e defesa baixa; um
// zagueiro nasce forte em defesa/força e fraco em finalização).

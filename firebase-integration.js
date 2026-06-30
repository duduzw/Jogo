// ==========================================
// FIREBASE INTEGRATION FOR SHARED UNIVERSE
// ==========================================
// Add Firebase SDK scripts to index.html before this file:
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>

// Firebase Configuration - Replace with your own config
const firebaseConfig = {
  apiKey: "AIzaSyAIvQluyh1X5ZVrlc40O-IlkMwgeqaKY3A",
  authDomain: "jogo-61df7.firebaseapp.com",
  databaseURL: "https://jogo-61df7-default-rtdb.firebaseio.com", // <-- IMPORTANTE: O Firebase não gera essa linha sozinho na Web, mas seu jogo precisa dela!
  projectId: "jogo-61df7",
  storageBucket: "jogo-61df7.firebasestorage.app",
  messagingSenderId: "795951389443",
  appId: "1:795951389443:web:4a960683e62a9d4be1e736",
  measurementId: "G-PHMLWC5ZSW"
};

// Global Firebase State
let db = null;
let playerId = null;
let friendId = null;
let lobbyId = null;
let roomId = null;
let isOnlineMode = false;
let isHost = false;
let friendData = null;
let achievementListener = null;
let lobbyListener = null;
let playersListener = null;
let roomListener = null;
let heartbeatInterval = null;
let pregameRoomListener = null;

// ==========================================
// INITIALIZATION
// ==========================================

function initializeFirebase() {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        console.log("Firebase initialized successfully");
        return true;
    } catch (error) {
        console.error("Firebase initialization error:", error);
        return false;
    }
}

function initializeOnlineMode() {
    if (!db) {
        const initialized = initializeFirebase();
        if (!initialized) {
            alert("Erro ao inicializar Firebase. Verifique a configuração.");
            return false;
        }
    }

    // Generate or retrieve player ID from localStorage
    playerId = localStorage.getItem("sharedUniverse_playerId");
    if (!playerId) {
        playerId = "player_" + generateFriendCode();
        localStorage.setItem("sharedUniverse_playerId", playerId);
    }

    isOnlineMode = true;
    
    // Generate friend code
    const friendCode = generateFriendCode();
    document.getElementById("myFriendCode").textContent = friendCode;
    
    // Store friend code in Firebase
    db.ref(`connections/${playerId}/friendCode`).set(friendCode);
    
    // Update UI
    updateConnectionUI(true);
    
    // Check for existing friend connection
    checkExistingFriendConnection();
    
    // Set up achievement listener
    setupAchievementListener();
    
    // Load Firebase players into local state
    loadFirebasePlayersIntoLocalState();
    
    // Set up Firebase players listener for real-time sync
    setupFirebasePlayersListener();
    
    console.log("Online mode initialized with player ID:", playerId);
    return true;
}

// ==========================================
// SESSION PERSISTENCE & AUTO-RECONNECT
// ==========================================

function saveSessionToStorage(lobbyIdParam, friendIdParam) {
    localStorage.setItem("sharedUniverse_lobbyId", lobbyIdParam);
    localStorage.setItem("sharedUniverse_friendId", friendIdParam);
    localStorage.setItem("sharedUniverse_isOnline", "true");
    console.log("Session saved to localStorage:", { lobbyId: lobbyIdParam, friendId: friendIdParam });
}

function clearSessionFromStorage() {
    localStorage.removeItem("sharedUniverse_lobbyId");
    localStorage.removeItem("sharedUniverse_friendId");
    localStorage.removeItem("sharedUniverse_isOnline");
    console.log("Session cleared from localStorage");
}

function hasExistingSession() {
    return localStorage.getItem("sharedUniverse_lobbyId") !== null;
}

async function autoReconnectToSession() {
    const savedLobbyId = localStorage.getItem("sharedUniverse_lobbyId");
    const savedFriendId = localStorage.getItem("sharedUniverse_friendId");
    
    if (!savedLobbyId || !savedFriendId) {
        console.log("No existing session found");
        return false;
    }

    console.log("Attempting to reconnect to session:", { lobbyId: savedLobbyId, friendId: savedFriendId });
    
    // Show reconnection screen
    document.getElementById("telaReconexao").classList.remove("oculto");
    document.getElementById("telaModoSelecao").classList.add("oculto");
    updateReconnectionStatus("Inicializando Firebase...");
    
    // Initialize Firebase
    if (!db) {
        const initialized = initializeFirebase();
        if (!initialized) {
            updateReconnectionStatus("Erro ao inicializar Firebase", true);
            return false;
        }
    }

    // Retrieve or generate player ID
    playerId = localStorage.getItem("sharedUniverse_playerId");
    if (!playerId) {
        playerId = "player_" + generateFriendCode();
        localStorage.setItem("sharedUniverse_playerId", playerId);
    }

    isOnlineMode = true;
    lobbyId = savedLobbyId;
    friendId = savedFriendId;

    updateReconnectionStatus("Verificando lobby...");

    // Check if lobby still exists
    try {
        const lobbySnapshot = await db.ref(`lobbies/${lobbyId}`).once("value");
        
        if (!lobbySnapshot.exists()) {
            updateReconnectionStatus("Lobby não encontrado", true);
            setTimeout(() => {
                clearSessionFromStorage();
                alert("Lobby expirou ou foi fechado pelo outro jogador.");
                document.getElementById("telaReconexao").classList.add("oculto");
                document.getElementById("telaModoSelecao").classList.remove("oculto");
            }, 2000);
            return false;
        }

        const lobbyData = lobbySnapshot.val();
        
        // Check if player is still in the lobby
        if (!lobbyData.players || !lobbyData.players[playerId]) {
            updateReconnectionStatus("Jogador não encontrado no lobby", true);
            setTimeout(() => {
                clearSessionFromStorage();
                alert("Você foi removido do lobby.");
                document.getElementById("telaReconexao").classList.add("oculto");
                document.getElementById("telaModoSelecao").classList.remove("oculto");
            }, 2000);
            return false;
        }

        updateReconnectionStatus("Reconectando ao lobby...");

        // Re-attach lobby listener
        listenForLobbyUpdates();
        
        // Re-attach achievement listener
        setupAchievementListener();
        
        // Load Firebase players into local state
        loadFirebasePlayersIntoLocalState();
        
        // Set up Firebase players listener for real-time sync
        setupFirebasePlayersListener();
        
        // Load friend data
        await getFriendData();
        
        updateReconnectionStatus("Conexão restaurada com sucesso!");
        
        setTimeout(() => {
            document.getElementById("telaReconexao").classList.add("oculto");
            
            // Load game save
            if (window.carregarJogo && window.carregarJogo()) {
                window.mudarTela("view-hub");
                window.mudarTela("view-amigos");
            } else {
                document.getElementById("telaModoSelecao").classList.remove("oculto");
            }
        }, 1000);

        return true;

    } catch (error) {
        console.error("Error during reconnection:", error);
        updateReconnectionStatus("Erro ao reconectar", true);
        setTimeout(() => {
            clearSessionFromStorage();
            alert("Erro ao reconectar: " + error.message);
            document.getElementById("telaReconexao").classList.add("oculto");
            document.getElementById("telaModoSelecao").classList.remove("oculto");
        }, 2000);
        return false;
    }
}

function updateReconnectionStatus(message, isError = false) {
    const statusEl = document.getElementById("reconexaoStatus");
    if (statusEl) {
        statusEl.innerHTML = `<span style="color: ${isError ? 'var(--danger)' : 'var(--text-muted)'};">${message}</span>`;
    }
}

function cancelReconnection() {
    clearSessionFromStorage();
    document.getElementById("telaReconexao").classList.add("oculto");
    document.getElementById("telaModoSelecao").classList.remove("oculto");
}

function generateFriendCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ==========================================
// CONNECTION MANAGEMENT
// ==========================================

function connectWithFriend(friendCode) {
    if (!db || !playerId) {
        alert("Modo online não inicializado");
        return;
    }

    // Search for friend by code
    db.ref("connections").orderByChild("friendCode").equalTo(friendCode).once("value")
        .then((snapshot) => {
            if (snapshot.exists()) {
                const friendData = Object.entries(snapshot.val())[0];
                const friendPlayerId = friendData[0];
                
                if (friendPlayerId === playerId) {
                    alert("Não pode conectar consigo mesmo!");
                    return;
                }

                // Send friend request
                sendFriendRequest(friendPlayerId);
            } else {
                alert("Código de amigo não encontrado");
            }
        })
        .catch((error) => {
            console.error("Error searching for friend:", error);
            alert("Erro ao buscar amigo");
        });
}

function sendFriendRequest(targetPlayerId) {
    const request = {
        from: playerId,
        timestamp: Date.now(),
        status: "pending"
    };

    db.ref(`connections/${targetPlayerId}/friendRequests/${playerId}`).set(request)
        .then(() => {
            alert("Pedido de amigo enviado! Aguarde aceitação.");
            listenForFriendRequests();
        })
        .catch((error) => {
            console.error("Error sending friend request:", error);
            alert("Erro ao enviar pedido");
        });
}

function listenForFriendRequests() {
    db.ref(`connections/${playerId}/friendRequests`).on("value", (snapshot) => {
        const requests = snapshot.val();
        if (requests) {
            Object.entries(requests).forEach(([requesterId, request]) => {
                if (request.status === "pending") {
                    const accept = confirm(`Pedido de amigo de ${requesterId}. Aceitar?`);
                    if (accept) {
                        acceptFriendRequest(requesterId);
                    } else {
                        db.ref(`connections/${playerId}/friendRequests/${requesterId}`).remove();
                    }
                }
            });
        }
    });
}

function acceptFriendRequest(requesterId) {
    // Add to both players' friend lists
    db.ref(`connections/${playerId}/friends/${requesterId}`).set({
        friendId: requesterId,
        connectedAt: Date.now(),
        status: "accepted"
    });

    db.ref(`connections/${requesterId}/friends/${playerId}`).set({
        friendId: playerId,
        connectedAt: Date.now(),
        status: "accepted"
    });

    // Remove request
    db.ref(`connections/${playerId}/friendRequests/${requesterId}`).remove();

    // Set as current friend
    friendId = requesterId;
    localStorage.setItem("sharedUniverse_friendId", friendId);

    // Create lobby
    createLobby();

    alert("Amigo conectado com sucesso!");
    updateConnectionUI(true);
}

function checkExistingFriendConnection() {
    const savedFriendId = localStorage.getItem("sharedUniverse_friendId");
    if (savedFriendId) {
        friendId = savedFriendId;
        db.ref(`connections/${playerId}/friends/${friendId}`).once("value")
            .then((snapshot) => {
                if (snapshot.exists()) {
                    updateConnectionUI(true);
                    showLobbySection();
                    joinExistingLobby();
                } else {
                    localStorage.removeItem("sharedUniverse_friendId");
                    friendId = null;
                }
            });
    }
}

// ==========================================
// LOBBY & READY CHECK SYSTEM
// ==========================================

function createLobby() {
    lobbyId = `lobby_${playerId}_${friendId}`;
    
    const lobbyData = {
        createdAt: Date.now(),
        seasonSync: {
            currentSeason: 2026,
            allPlayersReady: false,
            seasonInProgress: false
        },
        players: {}
    };

    db.ref(`lobbies/${lobbyId}`).set(lobbyData)
        .then(() => {
            addPlayerToLobby(playerId);
            listenForLobbyUpdates();
            showLobbySection();
            // Save session to localStorage for persistence
            saveSessionToStorage(lobbyId, friendId);
        })
        .catch((error) => {
            console.error("Error creating lobby:", error);
        });
}

function joinExistingLobby() {
    // Try to find existing lobby with friend
    db.ref("lobbies").orderByChild(`players/${playerId}`).once("value")
        .then((snapshot) => {
            if (snapshot.exists()) {
                const lobbyData = Object.entries(snapshot.val())[0];
                lobbyId = lobbyData[0];
                listenForLobbyUpdates();
                showLobbySection();
                // Save session to localStorage for persistence
                saveSessionToStorage(lobbyId, friendId);
            } else {
                createLobby();
            }
        });
}

function addPlayerToLobby(playerIdToAdd) {
    if (!lobbyId || !db) return;

    // Type safety checks to prevent Firebase crashes when character not created
    const playerData = {
        nome: (typeof window.jogador !== 'undefined' && window.jogador.nome) ? window.jogador.nome : null,
        ready: false,
        currentSeason: (typeof window.anoAtual !== 'undefined') ? window.anoAtual : 2026,
        clubeId: (typeof window.jogador !== 'undefined' && window.jogador.clubeId) ? window.jogador.clubeId : null
    };

    db.ref(`lobbies/${lobbyId}/players/${playerIdToAdd}`).set(playerData);
}

function toggleReadyStatus() {
    if (!lobbyId || !db) return;

    db.ref(`lobbies/${lobbyId}/players/${playerId}/ready`).once("value")
        .then((snapshot) => {
            const currentStatus = snapshot.val() || false;
            const newStatus = !currentStatus;
            
            db.ref(`lobbies/${lobbyId}/players/${playerId}/ready`).set(newStatus)
                .then(() => {
                    updateReadyButton(newStatus);
                    checkAllPlayersReady();
                });
        });
}

// Expose to window for use in main.js
window.toggleReadyStatus = toggleReadyStatus;

function checkAllPlayersReady() {
    if (!lobbyId || !db) return;

    db.ref(`lobbies/${lobbyId}/players`).once("value")
        .then((snapshot) => {
            const players = snapshot.val();
            if (!players) return;

            const playerIds = Object.keys(players);
            const allReady = playerIds.every(id => players[id].ready === true);

            if (allReady && playerIds.length >= 2) {
                db.ref(`lobbies/${lobbyId}/seasonSync/allPlayersReady`).set(true);
                document.getElementById("lobbyStatusText").textContent = "Todos prontos! Temporada pode começar.";
                document.getElementById("lobbyStatus").style.borderColor = "var(--success)";
                
                // Enable start button if it exists
                const startBtn = document.getElementById("btnStartCareer");
                if (startBtn) {
                    startBtn.classList.remove("oculto");
                    startBtn.disabled = false;
                }
            } else {
                db.ref(`lobbies/${lobbyId}/seasonSync/allPlayersReady`).set(false);
                
                // Disable start button if it exists
                const startBtn = document.getElementById("btnStartCareer");
                if (startBtn) {
                    startBtn.disabled = true;
                }
            }
        });
}

function listenForLobbyUpdates() {
    if (!lobbyId || !db) return;

    lobbyListener = db.ref(`lobbies/${lobbyId}`).on("value", (snapshot) => {
        const lobbyData = snapshot.val();
        if (!lobbyData) return;

        updateLobbyUI(lobbyData);
        checkSeasonSync(lobbyData);
    });
}

function updateLobbyUI(lobbyData) {
    const container = document.getElementById("lobbyPlayers");
    if (!container) {
        console.warn("lobbyPlayers container not found");
        return;
    }
    
    // CRITICAL: Clear container immediately to prevent duplicate player bug
    container.innerHTML = "";

    if (!lobbyData.players) {
        container.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:20px;">Aguardando jogadores...</div>';
        return;
    }

    Object.entries(lobbyData.players).forEach(([pid, player]) => {
        const isReady = player.ready || false;
        const isMe = pid === playerId;
        
        // Use placeholder name if player.nome doesn't exist (character not created yet)
        const playerName = player.nome || `Manager/Player #${pid.substring(0, 4)} (Aguardando Criação)`;
        const clubName = player.clubeId || "---";
        const season = player.currentSeason || "---";
        
        const card = document.createElement("div");
        card.className = `lobby-player-card ${isReady ? "ready" : "not-ready"}`;
        card.style.cssText = `
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid ${isReady ? "rgba(0, 255, 136, 0.4)" : "rgba(255, 255, 255, 0.1)"};
            border-radius: 12px;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 10px;
            transition: all 0.3s;
        `;
        
        card.innerHTML = `
            <div style="flex:1;">
                <strong style="color:var(--text-main); display:block; margin-bottom:4px;">${playerName}</strong>
                <div style="font-size:0.85rem; color:var(--text-muted);">
                    ${clubName} • Temporada ${season}
                </div>
            </div>
            ${isMe ? `<button class="lobby-ready-toggle ${isReady ? "ready" : "not-ready"}" onclick="window.toggleReadyStatus()" style="
                padding: 8px 16px;
                border-radius: 6px;
                border: none;
                font-weight: 700;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.3s;
                background: ${isReady ? "rgba(255, 193, 7, 0.2)" : "rgba(0, 255, 136, 0.2)"};
                color: ${isReady ? "#ffc107" : "#00ff88"};
                border: 1px solid ${isReady ? "rgba(255, 193, 7, 0.4)" : "rgba(0, 255, 136, 0.4)"};
            ">
                ${isReady ? "⏸️ PRONTO" : "✅ PRONTO"}
            </button>` : `<span class="lobby-status-badge ${isReady ? "ready" : "not-ready"}" style="
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: 700;
                text-transform: uppercase;
                background: ${isReady ? "rgba(0, 255, 136, 0.2)" : "rgba(255, 255, 255, 0.1)"};
                color: ${isReady ? "#00ff88" : "var(--text-muted)"};
                border: 1px solid ${isReady ? "rgba(0, 255, 136, 0.4)" : "rgba(255, 255, 255, 0.2)"};
            ">
                ${isReady ? "PRONTO" : "AGUARDANDO"}
            </span>`}
        `;
        
        container.appendChild(card);
    });
    
    // Ensure ready button is visible and functional
    const readyBtn = document.getElementById("btnToggleReady");
    if (readyBtn) {
        readyBtn.classList.remove("oculto");
        const myPlayerData = lobbyData.players[playerId];
        if (myPlayerData) {
            updateReadyButton(myPlayerData.ready || false);
        }
    }
}

function checkSeasonSync(lobbyData) {
    if (!lobbyData.seasonSync) return;

    const seasonSync = lobbyData.seasonSync;
    const statusText = document.getElementById("lobbyStatusText");
    const statusDiv = document.getElementById("lobbyStatus");
    
    if (!statusText || !statusDiv) {
        console.warn("lobbyStatus elements not found");
        return;
    }

    if (seasonSync.allPlayersReady) {
        statusText.textContent = "Todos prontos! Temporada pode começar.";
        statusDiv.style.borderColor = "var(--success)";
        statusDiv.style.background = "rgba(16, 185, 129, 0.1)";
    } else {
        statusText.textContent = "Aguardando jogadores ficarem prontos...";
        statusDiv.style.borderColor = "var(--border)";
        statusDiv.style.background = "rgba(0, 0, 0, 0.3)";
    }

    // Check if seasons match
    if (lobbyData.players) {
        const seasons = Object.values(lobbyData.players).map(p => p.currentSeason);
        const allMatch = seasons.every(s => s === seasons[0]);
        
        if (!allMatch) {
            statusText.textContent = "⚠️ Temporadas desincronizadas! Aguarde amigo terminar temporada atual.";
            statusDiv.style.borderColor = "var(--danger)";
            statusDiv.style.background = "rgba(244, 63, 94, 0.1)";
        }
    }
}

function updateReadyButton(isReady) {
    const btn = document.getElementById("btnToggleReady");
    if (!btn) {
        console.warn("btnToggleReady not found");
        return;
    }
    if (isReady) {
        btn.textContent = "⏸️ Cancelar Pronto";
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-warning");
        btn.style.background = "rgba(255, 193, 7, 0.2)";
        btn.style.color = "#ffc107";
        btn.style.borderColor = "rgba(255, 193, 7, 0.4)";
    } else {
        btn.textContent = "✅ Pronto para Iniciar";
        btn.classList.remove("btn-warning");
        btn.classList.add("btn-primary");
        btn.style.background = "var(--theme-primary)";
        btn.style.color = "#000";
        btn.style.borderColor = "var(--theme-primary)";
    }
}

function canAdvanceToNextSeason() {
    if (!isOnlineMode || !lobbyId || !db) return true;

    return db.ref(`lobbies/${lobbyId}/seasonSync/allPlayersReady`).once("value")
        .then((snapshot) => {
            const allReady = snapshot.val();
            if (!allReady) {
                alert("Aguarde seu amigo ficar pronto para avançar para a próxima temporada!");
                return false;
            }
            return true;
        });
}

function syncSeasonEnd() {
    if (!isOnlineMode || !lobbyId || !db) return;

    // Update current season in lobby
    db.ref(`lobbies/${lobbyId}/players/${playerId}/currentSeason`).set(anoAtual + 1);
    db.ref(`lobbies/${lobbyId}/players/${playerId}/ready`).set(false);
    
    // Reset season sync
    db.ref(`lobbies/${lobbyId}/seasonSync/allPlayersReady`).set(false);
    
    updateReadyButton(false);
}

// ==========================================
// DATA SYNC
// ==========================================

function syncPlayerDataToFirebase() {
    if (!isOnlineMode || !db || !playerId) return;

    // Safely access jogador from window scope
    const jogador = window.jogador;
    const anoAtual = window.anoAtual;

    if (!jogador) {
        console.warn("syncPlayerDataToFirebase: jogador not available yet");
        return;
    }

    const profileData = {
        nome: jogador.nome,
        idade: jogador.idade,
        nacionalidade: jogador.nacionalidade,
        posicao: jogador.posicao,
        geral: jogador.geral,
        valorMercado: jogador.valorMercado,
        clubeId: jogador.clubeId,
        foto: jogador.foto || ""
    };

    // Separate club and international stats
    const statsData = {
        club: {
            jogos: jogador.estatisticasAtuais?.jogos || 0,
            gols: jogador.estatisticasAtuais?.gols || 0,
            assistencias: jogador.estatisticasAtuais?.assistencias || 0,
            notas: jogador.estatisticasAtuais?.notas || []
        },
        international: {
            jogos: jogador.statsSelecao?.jogos || 0,
            gols: jogador.statsSelecao?.gols || 0,
            assistencias: jogador.statsSelecao?.assistencias || 0,
            titulosSelecao: jogador.titulosSelecao || []
        }
    };

    const achievementsData = (jogador.historicoCarreira || []).map(h => ({
        trofeu: h.trofeus,
        ano: h.ano,
        competicao: h.clube,
        tipo: "club"
    }));

    // Add international trophies to achievements
    if (jogador.titulosSelecao) {
        jogador.titulosSelecao.forEach(t => {
            achievementsData.push({
                trofeu: t.trofeu,
                ano: t.ano,
                competicao: t.competicao,
                tipo: "international"
            });
        });
    }

    db.ref(`players/${playerId}/profile`).set(profileData);
    db.ref(`players/${playerId}/stats`).set(statsData);
    db.ref(`players/${playerId}/achievements`).set(achievementsData);
    db.ref(`players/${playerId}/lastUpdated`).set(Date.now());
    db.ref(`players/${playerId}/currentSeason`).set(anoAtual || 2026);
}

// ==========================================
// LOAD FIREBASE PLAYERS INTO LOCAL STATE
// ==========================================

function loadFirebasePlayersIntoLocalState() {
    if (!db) {
        console.error("Cannot load Firebase players: db not available");
        return;
    }

    if (!window.jogadoresIA) {
        console.warn("jogadoresIA not yet available, will retry in 500ms");
        setTimeout(loadFirebasePlayersIntoLocalState, 500);
        return;
    }

    console.log("Loading Firebase players into local state...");

    db.ref("players").once("value")
        .then((snapshot) => {
            if (!snapshot.exists()) {
                console.log("No Firebase players found");
                return;
            }

            const playersData = snapshot.val();
            let loadedCount = 0;

            Object.entries(playersData).forEach(([firebasePlayerId, playerData]) => {
                // Skip current player (already in local state as 'jogador')
                if (firebasePlayerId === playerId) return;

                // Skip if player already exists in local array
                const existingIndex = window.jogadoresIA.findIndex(j => j.id === firebasePlayerId);
                if (existingIndex !== -1) {
                    // Update existing player
                    updateLocalPlayerFromFirebase(firebasePlayerId, playerData, existingIndex);
                    loadedCount++;
                    return;
                }

                // Convert Firebase data to local player structure
                const localPlayer = convertFirebasePlayerToLocal(firebasePlayerId, playerData);
                if (localPlayer) {
                    window.jogadoresIA.push(localPlayer);
                    loadedCount++;
                }
            });

            console.log(`Loaded/updated ${loadedCount} Firebase players into local state`);
        })
        .catch((error) => {
            console.error("Error loading Firebase players:", error);
        });
}

function convertFirebasePlayerToLocal(firebasePlayerId, playerData) {
    if (!playerData.profile) return null;

    const profile = playerData.profile;
    const stats = playerData.stats || { jogos: 0, gols: 0, assistencias: 0, notas: [] };
    const achievements = playerData.achievements || [];

    return {
        id: firebasePlayerId,
        nome: profile.nome,
        idade: profile.idade,
        nacionalidade: profile.nacionalidade,
        posicao: profile.posicao,
        geral: profile.geral,
        valorMercado: profile.valorMercado,
        clubeId: profile.clubeId,
        foto: profile.foto || "",
        statsTemporada: {
            jogos: stats.jogos || 0,
            gols: stats.gols || 0,
            assistencias: stats.assistencias || 0,
            notas: stats.notas || []
        },
        historicoCarreira: achievements.map(a => ({
            trofeus: a.trofeu,
            ano: a.ano,
            clube: a.competicao
        })),
        isFirebasePlayer: true // Flag to identify Firebase-loaded players
    };
}

function updateLocalPlayerFromFirebase(firebasePlayerId, playerData, existingIndex) {
    if (!playerData.profile) return;

    const profile = playerData.profile;
    const stats = playerData.stats || { jogos: 0, gols: 0, assistencias: 0, notas: [] };
    const achievements = playerData.achievements || [];

    window.jogadoresIA[existingIndex] = {
        ...window.jogadoresIA[existingIndex],
        nome: profile.nome,
        idade: profile.idade,
        nacionalidade: profile.nacionalidade,
        posicao: profile.posicao,
        geral: profile.geral,
        valorMercado: profile.valorMercado,
        clubeId: profile.clubeId,
        foto: profile.foto || "",
        statsTemporada: {
            jogos: stats.jogos || 0,
            gols: stats.gols || 0,
            assistencias: stats.assistencias || 0,
            notas: stats.notas || []
        },
        historicoCarreira: achievements.map(a => ({
            trofeus: a.trofeu,
            ano: a.ano,
            clube: a.competicao
        }))
    };
}

function setupFirebasePlayersListener() {
    const currentDb = typeof database !== 'undefined' ? database : (typeof db !== 'undefined' ? db : null);
    if (!currentDb || playersListener) return;

    console.log("Setting up Firebase players listener...");

    playersListener = currentDb.ref("players").on("value", (snapshot) => {
        if (!snapshot.exists()) return;

        // 🔥 CORREÇÃO 1: Em vez de dar return e desistir, nós criamos o array se ele não existir
        if (!window.jogadoresIA) {
            window.jogadoresIA = [];
        }

        const playersData = snapshot.val();

        Object.entries(playersData).forEach(([firebasePlayerId, playerData]) => {
            // Pula o próprio jogador local para não duplicar
            if (firebasePlayerId === playerId) return;

            // 🔥 CORREÇÃO 2: Proteção caso o perfil do player no Firebase esteja incompleto
            if (!playerData || !playerData.profile) return;

            const existingIndex = window.jogadoresIA.findIndex(j => j.id === firebasePlayerId);

            try {
                if (existingIndex !== -1) {
                    // Se você tiver a função abaixo, garanta que ela use try/catch ou use a nossa direta:
                    if (typeof updateLocalPlayerFromFirebase === 'function') {
                        updateLocalPlayerFromFirebase(firebasePlayerId, playerData, existingIndex);
                    } else {
                        // Atualização direta e segura caso a outra função quebre
                        const p = playerData.profile;
                        window.jogadoresIA[existingIndex].nome = p.nome;
                        window.jogadoresIA[existingIndex].geral = p.geral || 60;
                        window.jogadoresIA[existingIndex].clubeId = p.clubeId;
                    }
                } else {
                    // Adicionar novo jogador com segurança
                    if (typeof convertFirebasePlayerToLocal === 'function') {
                        const localPlayer = convertFirebasePlayerToLocal(firebasePlayerId, playerData);
                        if (localPlayer) window.jogadoresIA.push(localPlayer);
                    } else {
                        // Criação direta e segura
                        const p = playerData.profile;
                        window.jogadoresIA.push({
                            id: firebasePlayerId,
                            nome: p.nome,
                            idade: p.idade || 18,
                            nacionalidade: p.nacionalidade || "Brasil",
                            posicao: p.posicao || "ATA",
                            geral: p.geral || 60,
                            clubeId: p.clubeId,
                            valorMercado: p.valorMercado || 0,
                            foto: p.foto || "",
                            isOnlinePlayer: true
                        });
                    }
                }
            } catch (err) {
                console.error("Erro ao processar dados de um player específico:", firebasePlayerId, err);
            }
        });

        console.log("Firebase players synced to local state successfully.");
    });
}

function removeFirebasePlayersListener() {
    if (playersListener && db) {
        db.ref("players").off("value", playersListener);
        playersListener = null;
        console.log("Firebase players listener removed");
    }
}

// ==========================================
// PRE-GAME LOBBY SYSTEM (Before Character Creation)
// ==========================================

function createPregameRoom(roomCode, lobbyPlayerId, gameMode) {
    if (!db || !roomCode || !lobbyPlayerId) {
        console.error("Cannot create pregame room: missing parameters");
        return null;
    }

    const roomData = {
        metadata: {
            createdAt: Date.now(),
            hostId: lobbyPlayerId,
            maxPlayers: 2,
            status: "waiting",
            gameMode: gameMode || "player"
        },
        players: {
            [lobbyPlayerId]: {
                sessionId: lobbyPlayerId,
                displayName: `${gameMode === "manager" ? "Treinador" : "Jogador"} #1 (Host)`,
                gameMode: gameMode || "player",
                joinedAt: Date.now(),
                lastActive: Date.now(),
                status: "connected",
                readyState: false
            }
        }
    };

    return db.ref(`pregameRooms/${roomCode}`).set(roomData)
        .then(() => {
            console.log("Pre-game room created:", roomCode);
            setupPregameRoomListener(roomCode);
            return roomCode;
        })
        .catch((error) => {
            console.error("Error creating pregame room:", error);
            return null;
        });
}

function joinPregameRoom(roomCode, lobbyPlayerId, gameMode) {
    if (!db || !roomCode || !lobbyPlayerId) {
        console.error("Cannot join pregame room: missing parameters");
        return false;
    }

    return db.ref(`pregameRooms/${roomCode}`).once("value")
        .then((snapshot) => {
            if (!snapshot.exists()) {
                console.error("Pre-game room not found:", roomCode);
                return false;
            }

            const roomData = snapshot.val();
            const players = roomData.players || {};

            // Check if room is full
            if (Object.keys(players).length >= roomData.metadata.maxPlayers) {
                console.error("Pre-game room is full");
                return false;
            }

            // Check if already in room
            if (players[lobbyPlayerId]) {
                setupPregameRoomListener(roomCode);
                return true;
            }

            // Determine player number
            const playerNumber = Object.keys(players).length + 1;
            const displayName = `${gameMode === "manager" ? "Treinador" : "Jogador"} #${playerNumber}`;

            // Add player to room
            const playerData = {
                sessionId: lobbyPlayerId,
                displayName: displayName,
                gameMode: gameMode || "player",
                joinedAt: Date.now(),
                lastActive: Date.now(),
                status: "connected",
                readyState: false
            };

            return db.ref(`pregameRooms/${roomCode}/players/${lobbyPlayerId}`).set(playerData)
                .then(() => {
                    setupPregameRoomListener(roomCode);
                    console.log("Joined pre-game room:", roomCode);
                    return true;
                });
        })
        .catch((error) => {
            console.error("Error joining pregame room:", error);
            return false;
        });
}

function setupPregameRoomListener(roomCode) {
    if (!roomCode || !db) return;

    // Remove existing listener if any
    if (pregameRoomListener) {
        db.ref(`pregameRooms/${roomCode}`).off("value", pregameRoomListener);
    }

    console.log("Setting up pregame room listener for:", roomCode);

    pregameRoomListener = db.ref(`pregameRooms/${roomCode}`).on("value", (snapshot) => {
        if (!snapshot.exists()) {
            console.error("Pre-game room no longer exists");
            return;
        }

        const roomData = snapshot.val();
        renderPregameLobby(roomData);
    });
}

function renderPregameLobby(roomData) {
    const container = document.getElementById("lobbyPlayersContainer");
    if (!container) return;

    // CRITICAL: Clear container to prevent ghost rows
    container.innerHTML = "";

    if (!roomData.players) return;

    const players = roomData.players;
    const playerIds = Object.keys(players);
    const isHost = window.isHost;
    const myPlayerId = window.lobbyPlayerId;

    // Render each player card with ready toggle
    playerIds.forEach((pid, index) => {
        const player = players[pid];
        const isMe = pid === myPlayerId;
        const isReady = player.readyState || false;

        const card = document.createElement("div");
        card.className = `lobby-player-card ${isReady ? "ready" : "not-ready"}`;
        card.style.cssText = `
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid ${isReady ? "rgba(0, 255, 136, 0.4)" : "rgba(255, 255, 255, 0.1)"};
            border-radius: 16px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            transition: all 0.3s;
        `;

        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(30, 64, 175, 0.2)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                    ${player.gameMode === "manager" ? "🧠" : "⚽"}
                </div>
                <div>
                    <strong style="color: #fff; font-size: 1rem; display: block;">${player.displayName}</strong>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${isMe ? "(Você)" : ""}</span>
                </div>
            </div>
            ${isMe ? `
                <button class="btn-ready-toggle" data-player-id="${pid}" style="
                    padding: 12px 20px;
                    border-radius: 10px;
                    border: none;
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: ${isReady ? "rgba(255, 193, 7, 0.2)" : "rgba(0, 255, 136, 0.2)"};
                    color: ${isReady ? "#ffc107" : "#00ff88"};
                    border: 1px solid ${isReady ? "rgba(255, 193, 7, 0.4)" : "rgba(0, 255, 136, 0.4)"};
                ">
                    ${isReady ? "⏸️ CANCELAR PRONTO" : "✅ DEFINIR PRONTO"}
                </button>
            ` : `
                <span class="lobby-status-badge" style="
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    background: ${isReady ? "rgba(0, 255, 136, 0.2)" : "rgba(255, 255, 255, 0.1)"};
                    color: ${isReady ? "#00ff88" : "var(--text-muted)"};
                    border: 1px solid ${isReady ? "rgba(0, 255, 136, 0.4)" : "rgba(255, 255, 255, 0.2)"};
                ">
                    ${isReady ? "PRONTO" : "AGUARDANDO"}
                </span>
            `}
        `;

        container.appendChild(card);
    });

    // Add event listeners for ready toggles
    container.querySelectorAll(".btn-ready-toggle").forEach(btn => {
        btn.addEventListener("click", () => {
            const pid = btn.dataset.playerId;
            togglePregameReady(pid);
        });
    });

    // Check if all players are ready and update start button
    const allReady = playerIds.every(id => players[id].readyState === true);
    const startBtn = document.getElementById("btnStartCareer");
    
    if (startBtn && isHost) {
        startBtn.disabled = !allReady;
        startBtn.textContent = allReady ? "🚀 INICIAR CARREIRA" : "🚀 INICIAR CARREIRA (Aguardando todos prontos)";
    }
}

function togglePregameReady(playerId) {
    if (!window.currentRoomId || !db) return;

    db.ref(`pregameRooms/${window.currentRoomId}/players/${playerId}/readyState`).once("value")
        .then((snapshot) => {
            const currentStatus = snapshot.val() || false;
            const newStatus = !currentStatus;
            
            return db.ref(`pregameRooms/${window.currentRoomId}/players/${playerId}/readyState`).set(newStatus);
        })
        .catch((error) => {
            console.error("Error toggling ready state:", error);
        });
}

function leavePregameLobby(roomCode, lobbyPlayerId) {
    if (!roomCode || !db) return;

    // Remove player from room
    db.ref(`pregameRooms/${roomCode}/players/${lobbyPlayerId}`).remove()
        .then(() => {
            // Remove listener
            if (pregameRoomListener) {
                db.ref(`pregameRooms/${roomCode}`).off("value", pregameRoomListener);
                pregameRoomListener = null;
            }
            console.log("Left pre-game room:", roomCode);
        })
        .catch((error) => {
            console.error("Error leaving pregame room:", error);
        });
}

function startCareerFromLobby(roomCode) {
    if (!roomCode || !db || !window.isHost) return;

    // Update room status to starting
    db.ref(`pregameRooms/${roomCode}/metadata/status`).set("starting")
        .then(() => {
            // Redirect all players to character creation
            window.mudarTela("telaCriacao");
        })
        .catch((error) => {
            console.error("Error starting career from lobby:", error);
        });
}

// ==========================================
// ROOM-BASED MULTIPLAYER SYSTEM (In-Game)
// ==========================================

function createRoom() {
    if (!db || !playerId) {
        console.error("Cannot create room: db or playerId not available");
        return null;
    }

    // Generate a unique room ID
    const newRoomId = "room_" + generateFriendCode();

    const roomData = {
        metadata: {
            createdAt: Date.now(),
            hostId: playerId,
            maxPlayers: 2,
            status: "waiting"
        },
        players: {
            [playerId]: {
                nome: window.jogador ? window.jogador.nome : "Player",
                clubeId: window.jogador ? window.jogador.clubeId : "",
                joinedAt: Date.now(),
                lastActive: Date.now(),
                status: "connected",
                currentSeason: window.anoAtual || 2026,
                readyForMatch: false,
                readyForSeasonEnd: false
            }
        },
        seasonState: {
            currentSeason: window.anoAtual || 2026,
            currentRound: 1,
            seasonInProgress: false,
            allPlayersReadyForMatch: false,
            allPlayersReadyForSeasonEnd: false
        },
        matchData: {
            currentMatchId: null,
            matchResults: {}
        },
        leagueTables: {}
    };

    return db.ref(`rooms/${newRoomId}`).set(roomData)
        .then(() => {
            roomId = newRoomId;
            isHost = true;
            console.log("Room created:", roomId);
            return roomId;
        })
        .catch((error) => {
            console.error("Error creating room:", error);
            return null;
        });
}

function joinRoom(roomIdToJoin) {
    if (!db || !playerId) {
        console.error("Cannot join room: db or playerId not available");
        return false;
    }

    return db.ref(`rooms/${roomIdToJoin}`).once("value")
        .then((snapshot) => {
            if (!snapshot.exists()) {
                console.error("Room not found:", roomIdToJoin);
                return false;
            }

            const roomData = snapshot.val();
            const players = roomData.players || {};

            // Check if room is full
            if (Object.keys(players).length >= roomData.metadata.maxPlayers) {
                console.error("Room is full");
                return false;
            }

            // Check if already in room
            if (players[playerId]) {
                roomId = roomIdToJoin;
                isHost = roomData.metadata.hostId === playerId;
                setupRoomListener();
                return true;
            }

            // Add player to room
            const playerData = {
                nome: window.jogador ? window.jogador.nome : "Player",
                clubeId: window.jogador ? window.jogador.clubeId : "",
                currentSeason: window.anoAtual || 2026,
                readyForMatch: false,
                readyForSeasonEnd: false,
                joinedAt: Date.now(),
                lastActive: Date.now(),
                status: "connected"
            };

            return db.ref(`rooms/${roomIdToJoin}/players/${playerId}`).set(playerData)
                .then(() => {
                    roomId = roomIdToJoin;
                    isHost = roomData.metadata.hostId === playerId;
                    setupRoomListener();
                    console.log("Joined room:", roomId);
                    return true;
                });
        })
        .catch((error) => {
            console.error("Error joining room:", error);
            return false;
        });
}

function setupRoomListener() {
    if (!roomId || !db || roomListener) return;

    console.log("Setting up room listener for:", roomId);

    roomListener = db.ref(`rooms/${roomId}`).on("value", (snapshot) => {
        if (!snapshot.exists()) {
            console.error("Room no longer exists");
            return;
        }

        const roomData = snapshot.val();
        handleRoomUpdate(roomData);
    });

    // Start heartbeat to keep connection alive
    startHeartbeat();
}

// HEARTBEAT: Keep player connection alive
function startHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
    }

    heartbeatInterval = setInterval(() => {
        if (roomId && playerId && db) {
            db.ref(`rooms/${roomId}/players/${playerId}/lastActive`).set(Date.now())
                .catch((error) => {
                    console.error("Heartbeat error:", error);
                });
        }
    }, 60 * 1000); // Update every 60 seconds
}

function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

// CLEANUP: Remove disconnected/obsolete players from room
function cleanupDisconnectedPlayers(roomPlayers) {
    if (!roomPlayers || !roomId || !db) return;

    const now = Date.now();
    const DISCONNECT_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    Object.entries(roomPlayers).forEach(([playerId, playerData]) => {
        // Check if player has been inactive for too long
        const lastActive = playerData.lastActive || playerData.joinedAt || 0;
        const isInactive = (now - lastActive) > DISCONNECT_TIMEOUT;

        // Also check if player has explicitly disconnected
        const isDisconnected = playerData.status === "disconnected";

        if (isInactive || isDisconnected) {
            console.log(`Cleaning up inactive/disconnected player: ${playerId}`);
            db.ref(`rooms/${roomId}/players/${playerId}`).remove()
                .then(() => {
                    console.log(`Removed inactive player ${playerId} from room`);
                })
                .catch((error) => {
                    console.error(`Error removing inactive player ${playerId}:`, error);
                });
        }
    });
}

function handleRoomUpdate(roomData) {
    const seasonState = roomData.seasonState;
    const players = roomData.players;

    // CLEANUP: Remove disconnected/obsolete players from room
    cleanupDisconnectedPlayers(players);

    // Sync local season if different from room
    if (seasonState && seasonState.currentSeason !== window.anoAtual) {
        console.log("Syncing season from room:", seasonState.currentSeason);
        window.anoAtual = seasonState.currentSeason;
    }

    // Load only room members into local jogadoresIA
    loadRoomPlayersIntoLocalState(players);

    // Check if all players are ready for match
    if (seasonState && seasonState.allPlayersReadyForMatch && isHost) {
        // Host simulates the match
        simulateMatchForRoom();
    }

    // Check if all players are ready for season end
    if (seasonState && seasonState.allPlayersReadyForSeasonEnd && isHost) {
        // Host advances the season
        advanceSeasonForRoom();
    }

    // Update UI with room state
    updateRoomUI(roomData);
}

function loadRoomPlayersIntoLocalState(roomPlayers) {
    if (!window.jogadoresIA) return;

    // Clear existing Firebase-loaded players (keep local AI players)
    window.jogadoresIA = window.jogadoresIA.filter(j => !j.isFirebasePlayer && !j.isOnlinePlayer);

    // Load only room members
    Object.entries(roomPlayers).forEach(([roomPlayerId, playerData]) => {
        // Skip current player (already in local state as 'jogador')
        if (roomPlayerId === playerId) return;

        // Convert room player data to local structure
        const localPlayer = {
            id: roomPlayerId,
            nome: playerData.nome,
            idade: window.jogador ? window.jogador.idade : 18,
            nacionalidade: window.jogador ? window.jogador.nacionalidade : "Brasil",
            posicao: window.jogador ? window.jogador.posicao : "Atacante",
            geral: 70, // Default OVR for online players
            valorMercado: "€1M",
            clubeId: playerData.clubeId,
            foto: "",
            statsTemporada: {
                jogos: 0,
                gols: 0,
                assistencias: 0,
                notas: []
            },
            historicoCarreira: [],
            isOnlinePlayer: true
        };

        window.jogadoresIA.push(localPlayer);
    });

    console.log("Loaded room players into local state");
}

function setReadyForMatch(ready) {
    if (!roomId || !db || !playerId) return;

    db.ref(`rooms/${roomId}/players/${playerId}/readyForMatch`).set(ready)
        .then(() => {
            checkAllPlayersReadyForMatch();
        });
}

// INTELLIGENT ASYNC: Determine if players need to synchronize based on their fixtures
function doPlayersNeedSync(players) {
    const playerIds = Object.keys(players);
    if (playerIds.length < 2) return false; // No sync needed for single player

    // Get current round from room season state
    const currentRound = window.rodadaAtual || 1;
    const currentSeason = window.anoAtual || 2026;

    // Check if all players are on the same league round
    // If they are in different leagues or different rounds, they don't need to sync
    const playerClubs = playerIds.map(id => players[id].clubeId);
    const allSameLeague = playerClubs.every(clubId => clubId === playerClubs[0]);

    if (!allSameLeague) {
        // Players in different leagues - only sync for shared tournaments
        // Check if they have shared international fixtures this round
        return haveSharedInternationalFixture(players, currentRound, currentSeason);
    }

    // Players in same league - check if they're on the same round
    // For now, assume same league means they need to sync
    // This could be enhanced to check actual fixture schedules
    return true;
}

// Check if players have shared international fixtures (World Cup, Euros, etc.)
function haveSharedInternationalFixture(players, currentRound, currentSeason) {
    // This would check if players' national teams have fixtures in the same tournament
    // For now, return false to allow async progression for international fixtures
    // This can be enhanced later with actual fixture data
    return false;
}

function checkAllPlayersReadyForMatch() {
    if (!roomId || !db) return;

    db.ref(`rooms/${roomId}/players`).once("value")
        .then((snapshot) => {
            const players = snapshot.val();
            if (!players) return;

            // INTELLIGENT ASYNC: Check if players need to sync for current round
            const needsSync = doPlayersNeedSync(players);
            
            if (!needsSync) {
                // Players have different fixtures, allow independent progression
                console.log("Players have different fixtures, allowing async progression");
                db.ref(`rooms/${roomId}/seasonState/allPlayersReadyForMatch`).set(true);
                return;
            }

            // Players have shared fixtures, require all to be ready
            const playerIds = Object.keys(players);
            const allReady = playerIds.every(id => players[id].readyForMatch === true);

            db.ref(`rooms/${roomId}/seasonState/allPlayersReadyForMatch`).set(allReady);
        });
}

function setReadyForSeasonEnd(ready) {
    if (!roomId || !db || !playerId) return;

    db.ref(`rooms/${roomId}/players/${playerId}/readyForSeasonEnd`).set(ready)
        .then(() => {
            checkAllPlayersReadyForSeasonEnd();
        });
}

function checkAllPlayersReadyForSeasonEnd() {
    if (!roomId || !db) return;

    db.ref(`rooms/${roomId}/players`).once("value")
        .then((snapshot) => {
            const players = snapshot.val();
            if (!players) return;

            const playerIds = Object.keys(players);
            const allReady = playerIds.every(id => players[id].readyForSeasonEnd === true);

            db.ref(`rooms/${roomId}/seasonState/allPlayersReadyForSeasonEnd`).set(allReady);
        });
}

function simulateMatchForRoom() {
    if (!roomId || !db || !isHost) return;

    console.log("Host simulating match for room...");

    // Get current round and season
    db.ref(`rooms/${roomId}/seasonState`).once("value")
        .then((snapshot) => {
            const seasonState = snapshot.val();
            const currentRound = seasonState.currentRound || 1;
            const currentSeason = seasonState.currentSeason || window.anoAtual;

            // Generate match ID
            const matchId = `match_${currentSeason}_r${currentRound}_${Date.now()}`;

            // Simulate match results (this should integrate with your existing match engine)
            const matchResult = generateMatchResult(currentSeason, currentRound);

            // Save match result to Firebase
            db.ref(`rooms/${roomId}/matchData/matchResults/${matchId}`).set(matchResult)
                .then(() => {
                    db.ref(`rooms/${roomId}/matchData/currentMatchId`).set(matchId);

                    // Increment round
                    db.ref(`rooms/${roomId}/seasonState/currentRound`).set(currentRound + 1);

                    // Reset ready states
                    resetPlayerReadyStates();

                    console.log("Match simulated and saved:", matchId);
                });
        });
}

function generateMatchResult(season, round) {
    // This should integrate with your existing match engine
    // For now, return a placeholder structure
    return {
        round: round,
        season: season,
        homeTeam: "Team A",
        awayTeam: "Team B",
        homeScore: Math.floor(Math.random() * 4),
        awayScore: Math.floor(Math.random() * 4),
        goalscorers: [],
        assists: [],
        simulatedBy: playerId,
        simulatedAt: Date.now()
    };
}

function advanceSeasonForRoom() {
    if (!roomId || !db || !isHost) return;

    console.log("Host advancing season for room...");

    db.ref(`rooms/${roomId}/seasonState`).once("value")
        .then((snapshot) => {
            const seasonState = snapshot.val();
            const newSeason = (seasonState.currentSeason || window.anoAtual) + 1;

            // Update season in Firebase
            db.ref(`rooms/${roomId}/seasonState/currentSeason`).set(newSeason);
            db.ref(`rooms/${roomId}/seasonState/currentRound`).set(1);
            db.ref(`rooms/${roomId}/seasonState/seasonInProgress`).set(false);
            db.ref(`rooms/${roomId}/seasonState/allPlayersReadyForSeasonEnd`).set(false);

            // Update room status
            db.ref(`rooms/${roomId}/metadata/status`).set("waiting");

            // Reset ready states
            resetPlayerReadyStates();

            console.log("Season advanced to:", newSeason);
        });
}

function resetPlayerReadyStates() {
    if (!roomId || !db) return;

    db.ref(`rooms/${roomId}/players`).once("value")
        .then((snapshot) => {
            const players = snapshot.val();
            if (!players) return;

            Object.keys(players).forEach(playerId => {
                db.ref(`rooms/${roomId}/players/${playerId}/readyForMatch`).set(false);
                db.ref(`rooms/${roomId}/players/${playerId}/readyForSeasonEnd`).set(false);
            });
        });
}

function updateRoomUI(roomData) {
    // Update UI elements with room state
    const statusElement = document.getElementById("roomStatus");
    if (statusElement) {
        const status = roomData.metadata.status;
        statusElement.textContent = `Room Status: ${status}`;
    }

    const playersElement = document.getElementById("roomPlayers");
    if (playersElement) {
        const players = roomData.players || {};
        playersElement.innerHTML = Object.entries(players).map(([pid, p]) => `
            <div class="room-player">
                <strong>${p.nome}</strong> (${p.clubeId})
                <span class="ready-badge ${p.readyForMatch ? 'ready' : 'not-ready'}">
                    ${p.readyForMatch ? '✓' : '○'}
                </span>
            </div>
        `).join("");
    }
}

function leaveRoom() {
    if (!roomId || !db) return;

    // Remove player from room
    db.ref(`rooms/${roomId}/players/${playerId}`).remove()
        .then(() => {
            // If host is leaving and there are other players, transfer host
            if (isHost) {
                db.ref(`rooms/${roomId}/players`).once("value")
                    .then((snapshot) => {
                        const players = snapshot.val();
                        if (players && Object.keys(players).length > 0) {
                            const newHostId = Object.keys(players)[0];
                            db.ref(`rooms/${roomId}/metadata/hostId`).set(newHostId);
                        } else {
                            // No players left, delete room
                            db.ref(`rooms/${roomId}`).remove();
                        }
                    });
            }

            // Cleanup
            if (roomListener) {
                db.ref(`rooms/${roomId}`).off("value", roomListener);
                roomListener = null;
            }

            roomId = null;
            isHost = false;
            console.log("Left room");
        });
}

function getFriendData() {
    if (!friendId || !db) return null;

    return db.ref(`players/${friendId}`).once("value")
        .then((snapshot) => {
            if (snapshot.exists()) {
                friendData = snapshot.val();
                return friendData;
            }
            return null;
        });
}

// ==========================================
// ACHIEVEMENT SYNC
// ==========================================

function pushAchievementToFirebase(trophy, competition) {
    if (!isOnlineMode || !db || !playerId) return;

    const achievement = {
        type: detectTrophyType(competition),
        trophy: trophy,
        year: anoAtual,
        timestamp: Date.now(),
        playerName: jogador.nome
    };

    db.ref(`events/${playerId}/achievements`).push(achievement);
}

function detectTrophyType(competition) {
    const comp = competition.toLowerCase();
    if (comp.includes("champions") || comp.includes("uefa_cl")) return "CHAMPIONS_LEAGUE_WIN";
    if (comp.includes("libertadores") || comp.includes("conmebol_lib")) return "LIBERTADORES_WIN";
    if (comp.includes("liga") || comp.includes("campeonato")) return "LEAGUE_TITLE";
    if (comp.includes("bola") || comp.includes("ballon")) return "BALLON_DOR";
    if (comp.includes("world") || comp.includes("copa do mundo")) return "WORLD_CUP";
    return "OTHER_TROPHY";
}

function setupAchievementListener() {
    if (!friendId || !db) return;

    achievementListener = db.ref(`events/${friendId}/achievements`).on("child_added", (snapshot) => {
        const achievement = snapshot.val();
        addFriendAchievementToFeed(achievement);
    });
}

function addFriendAchievementToFeed(achievement) {
    if (!friendData) return;

    const manchete = `🌟 ${achievement.playerName} venceu ${achievement.trophy}!`;
    const corpo = `Seu amigo conquistou a ${achievement.trophy} na temporada ${achievement.year}.`;
    
    // Add to local feed
    feedNoticias.unshift({
        manchete: manchete,
        corpo: corpo,
        data: `Amigo • ${achievement.year}`
    });

    // Also add to eventosRecentes
    eventosRecentes.unshift({
        manchete: manchete,
        corpo: corpo,
        data: `Amigo • ${achievement.year}`
    });

    // Limit to 60 items
    eventosRecentes = eventosRecentes.slice(0, 60);

    console.log("Friend achievement added to feed:", achievement);
}

// ==========================================
// CLUB ROSTER WITH FRIENDS
// ==========================================

function fetchClubRosterWithFriends(clubeId) {
    // 🔥 BUSCA O JOGADOR LOCAL DO ESCOPO GLOBAL DO NAVEGADOR
    const localPlayer = window.jogador;

    // Get AI players for this club
    let roster = window.jogadoresIA ? window.jogadoresIA.filter(j => j.clubeId === clubeId) : [];

    // Add local human player if they belong to this club (Usando localPlayer com segurança)
    if (localPlayer && localPlayer.clubeId === clubeId) {
        // Evita duplicar se ele já estiver na lista por algum motivo
        if (!roster.some(j => j.id === "player")) {
            roster.push({
                id: "player",
                nome: localPlayer.nome,
                idade: localPlayer.idade,
                geral: localPlayer.geral,
                clubeId: localPlayer.clubeId,
                nacionalidade: localPlayer.nacionalidade,
                posicao: localPlayer.posicao,
                foto: localPlayer.foto,
                statsTemporada: localPlayer.estatisticasAtuais,
                historicoCarreira: localPlayer.historicoCarreira
            });
        }
    }

    // Add friend's player if they belong to this club (Garante que as variáveis do amigo existem)
    const currentFriendData = typeof friendData !== 'undefined' ? friendData : null;
    const currentFriendId = typeof friendId !== 'undefined' ? friendId : null;

    if (currentFriendData && currentFriendData.profile && currentFriendData.profile.clubeId === clubeId) {
        if (currentFriendId && !roster.some(j => j.id === currentFriendId)) {
            roster.push({
                id: currentFriendId,
                nome: currentFriendData.profile.nome,
                idade: currentFriendData.profile.idade,
                geral: currentFriendData.profile.geral,
                clubeId: currentFriendData.profile.clubeId,
                nacionalidade: currentFriendData.profile.nacionalidade,
                posicao: currentFriendData.profile.posicao,
                foto: currentFriendData.profile.foto,
                statsTemporada: currentFriendData.stats,
                historicoCarreira: currentFriendData.achievements
            });
        }
    }

    return roster;
}

// ==========================================
// UI HELPERS
// ==========================================

function updateConnectionUI(connected) {
    const statusBanner = document.getElementById("sharedUniverseStatus");
    const indicator = statusBanner.querySelector(".status-indicator");
    const text = statusBanner.querySelector("span:last-child");
    const leaveLobbyBtn = document.getElementById("btnLeaveLobby");

    if (connected) {
        indicator.classList.remove("disconnected");
        indicator.classList.add("connected");
        text.textContent = "Universo compartilhado ativado";
        statusBanner.style.background = "rgba(16, 185, 129, 0.1)";
        statusBanner.style.borderColor = "var(--success)";
        
        document.getElementById("friendCodeSection").classList.remove("oculto");
        document.getElementById("connectSection").classList.remove("oculto");
        
        // Show leave lobby button when connected to a lobby
        if (leaveLobbyBtn && lobbyId) {
            leaveLobbyBtn.classList.remove("oculto");
        }
    } else {
        indicator.classList.remove("connected");
        indicator.classList.add("disconnected");
        text.textContent = "Universo compartilhado desativado";
        statusBanner.style.background = "rgba(239, 68, 68, 0.1)";
        statusBanner.style.borderColor = "var(--danger)";
        
        document.getElementById("friendCodeSection").classList.add("oculto");
        document.getElementById("connectSection").classList.add("oculto");
        document.getElementById("lobbySection").classList.add("oculto");
        document.getElementById("friendsList").classList.add("oculto");
        
        // Hide leave lobby button when disconnected
        if (leaveLobbyBtn) {
            leaveLobbyBtn.classList.add("oculto");
        }
    }
}

function showLobbySection() {
    document.getElementById("lobbySection").classList.remove("oculto");
    document.getElementById("friendsList").classList.remove("oculto");
    document.getElementById("connectSection").classList.add("oculto");
    renderFriendsList();
}

function renderFriendsList() {
    const container = document.getElementById("friendsContainer");
    container.innerHTML = "";

    if (friendId && friendData) {
        const card = document.createElement("div");
        card.className = "friend-card";
        card.innerHTML = `
            <img src="${friendData.profile.foto || ''}" class="friend-avatar" alt="${friendData.profile.nome}">
            <div class="friend-info">
                <h4>${friendData.profile.nome}</h4>
                <p>${friendData.profile.clubeId} • OVR ${friendData.profile.geral}</p>
                <p class="friend-stats">${friendData.stats.gols} gols • ${friendData.stats.jogos} jogos</p>
            </div>
            <button class="btn btn-sm btn-primary" onclick="viewFriendProfile()">Ver Perfil</button>
        `;
        container.appendChild(card);
    }
}

function viewFriendProfile() {
    if (!friendData) return;

    // Populate the existing modal with friend data
    document.getElementById("mpNome").textContent = friendData.profile.nome;
    document.getElementById("mpGeral").textContent = friendData.profile.geral;
    document.getElementById("mpIdade").textContent = friendData.profile.idade;
    document.getElementById("mpClube").textContent = friendData.profile.clubeId;
    document.getElementById("mpNac").textContent = friendData.profile.nacionalidade;
    document.getElementById("mpValor").textContent = friendData.profile.valorMercado;
    document.getElementById("mpImagem").src = friendData.profile.foto || "";

    // Show achievements
    const titulosDiv = document.getElementById("mpTitulos");
    if (friendData.achievements && friendData.achievements.length > 0) {
        titulosDiv.innerHTML = friendData.achievements.map(a => 
            `<div>${a.ano}: ${a.trofeu}</div>`
        ).join("");
    } else {
        titulosDiv.innerHTML = "Sem troféus registrados";
    }

    // Show modal
    document.getElementById("modalPerfilJogador").classList.remove("oculto");
}

// ==========================================
// CLEANUP
// ==========================================

function cleanupFirebaseListeners() {
    if (achievementListener) {
        db.ref(`events/${friendId}/achievements`).off("child_added", achievementListener);
        achievementListener = null;
    }
    if (lobbyListener) {
        db.ref(`lobbies/${lobbyId}`).off("value", lobbyListener);
        lobbyListener = null;
    }
    if (roomListener) {
        db.ref(`rooms/${roomId}`).off("value", roomListener);
        roomListener = null;
    }
    removeFirebasePlayersListener();
}

function leaveLobby() {
    // Mark player as disconnected before leaving
    if (roomId && playerId && db) {
        db.ref(`rooms/${roomId}/players/${playerId}/status`).set("disconnected")
            .then(() => {
                console.log("Player marked as disconnected");
            })
            .catch((error) => {
                console.error("Error marking player as disconnected:", error);
            });
    }

    // Remove player from lobby
    if (lobbyId && playerId && db) {
        db.ref(`lobbies/${lobbyId}/players/${playerId}`).remove()
            .then(() => {
                console.log("Player removed from lobby");
            })
            .catch((error) => {
                console.error("Error removing player from lobby:", error);
            });
    }

    // Clear session from localStorage
    clearSessionFromStorage();

    // Cleanup listeners and heartbeat
    cleanupFirebaseListeners();
    stopHeartbeat();

    // Reset state
    lobbyId = null;
    friendId = null;
    roomId = null;
    isOnlineMode = false;
    friendData = null;

    // Update UI
    updateConnectionUI(false);
    document.getElementById("lobbySection").classList.add("oculto");
    document.getElementById("friendsList").classList.add("oculto");
    document.getElementById("friendCodeSection").classList.add("oculto");
    document.getElementById("connectSection").classList.remove("oculto");

    console.log("Left lobby successfully");
}

// ==========================================
// PRE-GAME LOBBY FUNCTIONS (Separate from game rooms)
// ==========================================

function createPregameRoom(roomCode, playerId, gameMode) {
    if (!db) return;
    
    const roomRef = db.ref(`pregameRooms/${roomCode}`);
    
    const roomData = {
        createdAt: Date.now(),
        hostId: playerId,
        gameMode: gameMode,
        status: 'waiting',
        players: {
            [playerId]: {
                name: 'Host',
                ready: false,
                joinedAt: Date.now()
            }
        }
    };
    
    roomRef.set(roomData).then(() => {
        console.log(`Created pre-game room: ${roomCode}`);
        setupPregameRoomListener(roomCode, playerId);
    }).catch(error => {
        console.error("Error creating pre-game room:", error);
    });
}

function joinPregameRoom(roomCode, playerId, gameMode) {
    if (!db) return;
    
    const roomRef = db.ref(`pregameRooms/${roomCode}`);
    
    roomRef.once('value').then(snapshot => {
        if (!snapshot.exists()) {
            mostrarToast("Erro", "Sala não encontrada", "danger");
            return;
        }
        
        const roomData = snapshot.val();
        
        if (roomData.gameMode !== gameMode) {
            mostrarToast("Erro", "Modo de jogo incompatível", "danger");
            return;
        }
        
        if (roomData.status !== 'waiting') {
            mostrarToast("Erro", "Sala já iniciou", "danger");
            return;
        }
        
        // Add player to room
        roomRef.child(`players/${playerId}`).set({
            name: 'Player',
            ready: false,
            joinedAt: Date.now()
        }).then(() => {
            console.log(`Joined pre-game room: ${roomCode}`);
            setupPregameRoomListener(roomCode, playerId);
        }).catch(error => {
            console.error("Error joining pre-game room:", error);
        });
    }).catch(error => {
        console.error("Error checking room:", error);
    });
}

function leavePregameLobby(roomCode, playerId) {
    if (!db || !roomCode || !playerId) return;
    
    const roomRef = db.ref(`pregameRooms/${roomCode}`);
    
    // Remove player from room
    roomRef.child(`players/${playerId}`).remove().then(() => {
        console.log(`Left pre-game room: ${roomCode}`);
        
        // If host left and room is empty, delete the room
        roomRef.once('value').then(snapshot => {
            if (snapshot.exists()) {
                const roomData = snapshot.val();
                if (roomData.hostId === playerId) {
                    // Host left - delete room if no other players
                    const playerCount = Object.keys(roomData.players || {}).length;
                    if (playerCount === 0) {
                        roomRef.remove();
                    }
                }
            }
        });
        
        // Remove listener
        if (pregameRoomListener) {
            pregameRoomListener.off();
            pregameRoomListener = null;
        }
    }).catch(error => {
        console.error("Error leaving pre-game room:", error);
    });
}

function toggleLobbyReady(roomCode, playerId) {
    if (!db || !roomCode || !playerId) return;
    
    const roomRef = db.ref(`pregameRooms/${roomCode}/players/${playerId}/ready`);
    
    roomRef.once('value').then(snapshot => {
        const currentReady = snapshot.val() || false;
        roomRef.set(!currentReady).then(() => {
            console.log(`Toggled ready status for ${playerId}`);
        });
    }).catch(error => {
        console.error("Error toggling ready status:", error);
    });
}

function startCareerFromLobby(roomCode) {
    if (!db || !roomCode) return;
    
    const roomRef = db.ref(`pregameRooms/${roomCode}`);
    
    roomRef.update({
        status: 'starting'
    }).then(() => {
        console.log(`Starting career from room: ${roomCode}`);
        
        // Redirect all players to character creation
        mudarTela("telaCriacao");
        
        // Clean up pre-game room after a delay
        setTimeout(() => {
            roomRef.remove();
        }, 5000);
    }).catch(error => {
        console.error("Error starting career:", error);
    });
}

function setupPregameRoomListener(roomCode, playerId) {
    if (!db) return;
    
    // Remove existing listener
    if (pregameRoomListener) {
        pregameRoomListener.off();
    }
    
    const roomRef = db.ref(`pregameRooms/${roomCode}`);
    pregameRoomListener = roomRef;
    
    roomRef.on('value', snapshot => {
        if (!snapshot.exists()) {
            console.log("Room no longer exists");
            leavePregameLobby(roomCode, playerId);
            mudarTela("telaConexao");
            return;
        }
        
        const roomData = snapshot.val();
        
        // Check if host started the game
        if (roomData.status === 'starting') {
            mudarTela("telaCriacao");
            return;
        }
        
        // Render players
        if (window.renderLobbyPlayers) {
            window.renderLobbyPlayers(roomData.players);
        }
        
        // Check if all players are ready
        const players = roomData.players || {};
        const allReady = Object.values(players).every(p => p.ready === true);
        
        if (window.updateLobbyStartButton) {
            window.updateLobbyStartButton(allReady);
        }
    });
}

// Export functions for use in main.js
window.firebaseIntegration = {
    initializeOnlineMode,
    connectWithFriend,
    toggleReadyStatus,
    fetchClubRosterWithFriends,
    syncPlayerDataToFirebase,
    pushAchievementToFirebase,
    canAdvanceToNextSeason,
    syncSeasonEnd,
    cleanupFirebaseListeners,
    leaveLobby,
    hasExistingSession,
    autoReconnectToSession,
    cancelReconnection,
    isOnlineMode: () => isOnlineMode,
    getFriendData,
    loadFirebasePlayersIntoLocalState,
    setupFirebasePlayersListener,
    removeFirebasePlayersListener,
    // Room-based multiplayer functions
    createRoom,
    joinRoom,
    leaveRoom,
    setReadyForMatch,
    setReadyForSeasonEnd,
    // Pre-game lobby functions
    createPregameRoom,
    joinPregameRoom,
    leavePregameLobby,
    toggleLobbyReady,
    startCareerFromLobby,
    isHost: () => isHost,
    getRoomId: () => roomId
};
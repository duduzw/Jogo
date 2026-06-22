// ==========================================
// FIREBASE INTEGRATION FOR SHARED UNIVERSE
// ==========================================
// Add Firebase SDK scripts to index.html before this file:
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>

// Firebase Configuration - Replace with your own config
// 🔥 SUAS CREDENCIAIS REAIS DO FIREBASE:
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

// Inicializa o Firebase usando a estrutura que o seu jogo já tem:
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Global Firebase State
let db = null;
let playerId = null;
let friendId = null;
let lobbyId = null;
let isOnlineMode = false;
let friendData = null;
let achievementListener = null;
let lobbyListener = null;

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

    const playerData = {
        nome: jogador.nome,
        ready: false,
        currentSeason: anoAtual,
        clubeId: jogador.clubeId
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
            } else {
                db.ref(`lobbies/${lobbyId}/seasonSync/allPlayersReady`).set(false);
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
    container.innerHTML = "";

    if (lobbyData.players) {
        Object.entries(lobbyData.players).forEach(([pid, player]) => {
            const isReady = player.ready;
            const card = document.createElement("div");
            card.className = `lobby-player-card ${isReady ? "ready" : "not-ready"}`;
            
            card.innerHTML = `
                <div style="flex:1;">
                    <strong>${player.nome}</strong>
                    <div style="font-size:0.85rem; color:var(--text-muted);">
                        ${player.clubeId} • Temporada ${player.currentSeason}
                    </div>
                </div>
                <span class="lobby-status-badge ${isReady ? "ready" : "not-ready"}">
                    ${isReady ? "PRONTO" : "AGUARDANDO"}
                </span>
            `;
            
            container.appendChild(card);
        });
    }
}

function checkSeasonSync(lobbyData) {
    if (!lobbyData.seasonSync) return;

    const seasonSync = lobbyData.seasonSync;
    const statusText = document.getElementById("lobbyStatusText");

    if (seasonSync.allPlayersReady) {
        statusText.textContent = "Todos prontos! Temporada pode começar.";
        document.getElementById("lobbyStatus").style.borderColor = "var(--success)";
    } else {
        statusText.textContent = "Aguardando jogadores ficarem prontos...";
        document.getElementById("lobbyStatus").style.borderColor = "var(--border)";
    }

    // Check if seasons match
    if (lobbyData.players) {
        const seasons = Object.values(lobbyData.players).map(p => p.currentSeason);
        const allMatch = seasons.every(s => s === seasons[0]);
        
        if (!allMatch) {
            statusText.textContent = "⚠️ Temporadas desincronizadas! Aguarde amigo terminar temporada atual.";
            document.getElementById("lobbyStatus").style.borderColor = "var(--danger)";
        }
    }
}

function updateReadyButton(isReady) {
    const btn = document.getElementById("btnToggleReady");
    if (isReady) {
        btn.textContent = "⏸️ Cancelar Pronto";
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-warning");
    } else {
        btn.textContent = "✅ Pronto para Iniciar";
        btn.classList.remove("btn-warning");
        btn.classList.add("btn-primary");
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
    if (!isOnlineMode || !db || !playerId || !jogador) return;

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

    const statsData = {
        jogos: jogador.estatisticasAtuais.jogos,
        gols: jogador.estatisticasAtuais.gols,
        assistencias: jogador.estatisticasAtuais.assistencias || 0,
        notas: jogador.estatisticasAtuais.notas || []
    };

    const achievementsData = jogador.historicoCarreira.map(h => ({
        trofeu: h.trofeus,
        ano: h.ano,
        competicao: h.clube
    }));

    db.ref(`players/${playerId}/profile`).set(profileData);
    db.ref(`players/${playerId}/stats`).set(statsData);
    db.ref(`players/${playerId}/achievements`).set(achievementsData);
    db.ref(`players/${playerId}/lastUpdated`).set(Date.now());
    db.ref(`players/${playerId}/currentSeason`).set(anoAtual);
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
    // Busca os jogadores da IA direto do objeto global (usa uma lista vazia se ainda estiver carregando)
    const baseJogadores = window.jogadoresIA || [];
    let roster = baseJogadores.filter(j => j.clubeId === clubeId);

    // Pega o jogador local direto do objeto global
    const localPlayer = window.jogador;

    // Adiciona o jogador humano local se ele pertencer a este clube
    if (localPlayer && localPlayer.clubeId === clubeId) {
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

    // Adiciona o jogador do seu amigo se ele pertencer a este clube
    if (typeof friendData !== 'undefined' && friendData && friendData.profile && friendData.profile.clubeId === clubeId) {
        roster.push({
            id: typeof friendId !== 'undefined' ? friendId : "friend",
            nome: friendData.profile.nome,
            idade: friendData.profile.idade,
            geral: friendData.profile.geral,
            clubeId: friendData.profile.clubeId,
            nacionalidade: friendData.profile.nacionalidade,
            posicao: friendData.profile.posicao,
            foto: friendData.profile.foto,
            statsTemporada: friendData.stats,
            historicoCarreira: friendData.achievements
        });
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
}

function leaveLobby() {
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

    // Cleanup listeners
    cleanupFirebaseListeners();

    // Reset state
    lobbyId = null;
    friendId = null;
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
    getFriendData
};

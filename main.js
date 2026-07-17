import { jogadorModelo, competicoes, clubes, jogadoresIA, tabelasLigas, feedNoticias, preencherLigasVazias } from './data/database.js';
import { MatchEngine, MORAL_TECNICO_MINIMA_PENALTI, NIVEL_PENALTIS_MINIMO, PERFIS_ATRIBUTOS_POSICAO, gerarAtributosParaJogador } from './engine/match.js';
import { FORMATOS_INT, resolverVencedorMataMata, simularPlacarSelecao, criarTimeTorneio, chaveTorneio, idsCompeticoesAtivas, CORES_COMP, isEliminatoria, metaCompeticao, categoriaComp, anoTorneioDestino } from './engine/selecoes.js';

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

// ==========================================
// 🧠 MODO MANAGER - CLUB MANAGEMENT ARCHITECTURE
// ==========================================

window.managerState = {
    ativo: false,
    clubeId: null,
    clubeNome: null,
    orçamentoTransferências: 0,
    orçamentoSalários: 0,
    confiançaDiretoria: 100,
    objetivosTemporada: {
        posiçãoLiga: null,
        títuloLiga: false,
        títuloCopa: false,
        títuloInternacional: false
    },
    elenco: [],
    táticas: {
        formação: "4-4-2",
        mentalidade: "Equilibrada",
        estiloJogo: "Posse"
    },
    transferências: {
        jogadoresInteresse: [],
        ofertasPendentes: [],
        históricoTransferências: []
    }
};

// Initialize Manager Mode with club selection
window.inicializarModoManager = function(clubeId) {
    const clube = window.clubes.find(c => c.id === clubeId);
    if (!clube) {
        console.error("Clube não encontrado:", clubeId);
        return;
    }

    // ACTIVATE MANAGER MODE - COMPLETELY ISOLATE FROM PLAYER MODE
    window.managerState.ativo = true;
    window.managerState.clubeId = clubeId;
    window.managerState.clubeNome = clube.nome;
    window.managerState.orçamentoTransferências = clube.orçamento || 50000000;
    window.managerState.orçamentoSalários = clube.orçamentoSalários || 20000000;
    window.managerState.confiançaDiretoria = 100;

    // Extract squad from club
    window.managerState.elenco = window.jogadoresIA.filter(j => j.clubeId === clubeId);

    // DISABLE PLAYER MODE TRIGGERS AND INTERFACES
    // Clear player career state to prevent conflicts
    window.jogador = undefined;
    
    // Hide player-specific UI elements
    const playerElements = document.querySelectorAll('[data-view="view-home"], [data-view="view-classificacao"], [data-view="view-chaveamentos"]');
    playerElements.forEach(el => {
        if (el.classList.contains('menu-item')) {
            // Keep navigation but mark as player-only if needed
        }
    });

    console.log("Modo Manager inicializado para:", clube.nome);
    console.log("Elenco:", window.managerState.elenco.length, "jogadores");
    console.log("Player Mode desativado - Manager Mode ativo");
};

// Get available formations
window.getFormaçõesDisponíveis = function() {
    return [
        { id: "4-4-2", nome: "4-4-2 Clássico", descrição: "Equilibrado, focado em alas" },
        { id: "4-3-3", nome: "4-3-3 Ofensivo", descrição: "Três atacantes, pressão alta" },
        { id: "3-5-2", nome: "3-5-2 Meio Campo", descrição: "Controle do meio" },
        { id: "5-3-2", nome: "5-3-2 Defensivo", descrição: "Linha defensiva forte" },
        { id: "4-2-3-1", nome: "4-2-3-1 Moderno", descrição: "Volante duplo, criativo" }
    ];
};

// Get available mentalities
window.getMentalidadesDisponíveis = function() {
    return [
        { id: "Defensiva", nome: "Defensiva", descrição: "Foco em defesa, contra-ataques" },
        { id: "Equilibrada", nome: "Equilibrada", descrição: "Equilíbrio entre ataque e defesa" },
        { id: "Atacante", nome: "Atacante", descrição: "Pressão alta, posse ofensiva" }
    ];
};

// Get player roles
window.getPapéisJogador = function() {
    return [
        { id: "padrão", nome: "Padrão", descrição: "Jogo normal" },
        { id: "falso9", nome: "Falso 9", descrição: "Centroavante que cai para meio" },
        { id: "volante", nome: "Volante de Contenção", descrição: "Proteção defensiva" },
        { id: "ponta", nome: "Ponta Construtor", descrição: "Criatividade nas alas" },
        { id: "box", nome: "Box-to-Box", descrição: "Meia que vai e volta" },
        { id: "libero", nome: "Líbero", descrição: "Zagueiro que avança" }
    ];
};

// Formation position mappings
window.getFormationPositions = function(formation) {
    const positions = {
        "4-4-2": [
            { row: 0, col: 2, label: "GK" },
            { row: 1, col: 0, label: "LB" }, { row: 1, col: 1, label: "CB" }, { row: 1, col: 2, label: "CB" }, { row: 1, col: 3, label: "RB" },
            { row: 2, col: 0, label: "LM" }, { row: 2, col: 1, label: "CM" }, { row: 2, col: 2, label: "CM" }, { row: 2, col: 3, label: "RM" },
            { row: 3, col: 1, label: "ST" }, { row: 3, col: 2, label: "ST" }
        ],
        "4-3-3": [
            { row: 0, col: 2, label: "GK" },
            { row: 1, col: 0, label: "LB" }, { row: 1, col: 1, label: "CB" }, { row: 1, col: 2, label: "CB" }, { row: 1, col: 3, label: "RB" },
            { row: 2, col: 1, label: "CM" }, { row: 2, col: 2, label: "CM" }, { row: 2, col: 3, label: "CM" },
            { row: 3, col: 0, label: "LW" }, { row: 3, col: 2, label: "ST" }, { row: 3, col: 3, label: "RW" }
        ],
        "3-5-2": [
            { row: 0, col: 2, label: "GK" },
            { row: 1, col: 1, label: "CB" }, { row: 1, col: 2, label: "CB" }, { row: 1, col: 3, label: "CB" },
            { row: 2, col: 0, label: "LWB" }, { row: 2, col: 1, label: "CM" }, { row: 2, col: 2, label: "CM" }, { row: 2, col: 3, label: "CM" }, { row: 2, col: 4, label: "RWB" },
            { row: 3, col: 1, label: "ST" }, { row: 3, col: 2, label: "ST" }
        ],
        "5-3-2": [
            { row: 0, col: 2, label: "GK" },
            { row: 1, col: 0, label: "LWB" }, { row: 1, col: 1, label: "CB" }, { row: 1, col: 2, label: "CB" }, { row: 1, col: 3, label: "CB" }, { row: 1, col: 4, label: "RWB" },
            { row: 2, col: 1, label: "CM" }, { row: 2, col: 2, label: "CM" }, { row: 2, col: 3, label: "CM" },
            { row: 3, col: 1, label: "ST" }, { row: 3, col: 2, label: "ST" }
        ],
        "4-2-3-1": [
            { row: 0, col: 2, label: "GK" },
            { row: 1, col: 0, label: "LB" }, { row: 1, col: 1, label: "CB" }, { row: 1, col: 2, label: "CB" }, { row: 1, col: 3, label: "RB" },
            { row: 2, col: 1, label: "CDM" }, { row: 2, col: 2, label: "CDM" },
            { row: 3, col: 0, label: "CAM" }, { row: 3, col: 2, label: "CAM" }, { row: 3, col: 3, label: "CAM" },
            { row: 4, col: 2, label: "ST" }
        ]
    };
    return positions[formation] || positions["4-4-2"];
};

// Render squad list for tactics
window.renderSquadList = function() {
    const squadList = document.getElementById("squad-list");
    if (!squadList || !window.managerState.elenco) return;

    squadList.innerHTML = "";

    window.managerState.elenco.forEach(player => {
        const item = document.createElement("div");
        item.className = "squad-player-item";
        item.draggable = true;
        item.dataset.playerId = player.id;
        
        item.innerHTML = `
            <div class="squad-player-avatar">⚽</div>
            <div class="squad-player-info">
                <span class="squad-player-name">${player.nome}</span>
                <span class="squad-player-pos">${player.posicao}</span>
            </div>
            <span class="squad-player-ovr">${player.geral}</span>
        `;

        // Add drag events
        item.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", player.id);
            e.dataTransfer.effectAllowed = "move";
        });

        squadList.appendChild(item);
    });
};

// Render tactical pitch with formation
window.renderTacticalPitch = function(formation) {
    const pitch = document.getElementById("tactical-pitch");
    if (!pitch) return;

    const positions = window.getFormationPositions(formation);
    
    pitch.innerHTML = `
        <div class="pitch-grid">
            ${Array(4).fill().map((_, row) => 
                Array(5).fill().map((_, col) => {
                    const pos = positions.find(p => p.row === row && p.col === col);
                    return `
                        <div class="pitch-position" data-row="${row}" data-col="${col}">
                            ${pos ? `<span class="pitch-position-label">${pos.label}</span>` : ''}
                        </div>
                    `;
                }).join('')
            ).join('')}
        </div>
    `;

    // Add drop events to positions
    pitch.querySelectorAll(".pitch-position").forEach(position => {
        position.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            position.classList.add("drag-over");
        });

        position.addEventListener("dragleave", () => {
            position.classList.remove("drag-over");
        });

        position.addEventListener("drop", (e) => {
            e.preventDefault();
            position.classList.remove("drag-over");
            
            const playerId = e.dataTransfer.getData("text/plain");
            const player = window.managerState.elenco.find(p => p.id === playerId);
            
            if (player) {
                // Remove existing player token if any
                const existingToken = position.querySelector(".pitch-player-token");
                if (existingToken) existingToken.remove();

                // Add player token
                const token = document.createElement("div");
                token.className = "pitch-player-token";
                token.innerHTML = `
                    ⚽
                    <span class="pitch-player-ovr">${player.geral}</span>
                `;
                token.draggable = true;
                token.dataset.playerId = player.id;

                // Allow repositioning on pitch
                token.addEventListener("dragstart", (e) => {
                    e.dataTransfer.setData("text/plain", player.id);
                    e.dataTransfer.effectAllowed = "move";
                });

                position.appendChild(token);
            }
        });
    });
};

// Initialize tactics screen
window.inicializarTelaTáticas = function() {
    if (!window.managerState.clubeId) {
        console.warn("Manager mode not initialized");
        return;
    }

    // Update UI with manager state
    document.getElementById("manager-club-name").textContent = window.managerState.clubeNome;
    document.getElementById("manager-budget").textContent = window.formatarMoeda(window.managerState.orçamentoTransferências);
    document.getElementById("manager-confidence").textContent = window.managerState.confiançaDiretoria + "%";
    document.getElementById("manager-squad-size").textContent = window.managerState.elenco.length;

    // Render squad list
    window.renderSquadList();

    // Render tactical pitch with default formation
    window.renderTacticalPitch(window.managerState.táticas.formação);

    // Add formation change listener
    document.getElementById("formation-select").addEventListener("change", (e) => {
        window.managerState.táticas.formação = e.target.value;
        window.renderTacticalPitch(e.target.value);
    });

    // Add mentality change listener
    document.getElementById("mentality-select").addEventListener("change", (e) => {
        window.managerState.táticas.mentalidade = e.target.value;
    });
};

// Format currency helper
window.formatarMoeda = function(valor) {
    if (valor >= 1000000) {
        return "€" + (valor / 1000000).toFixed(1) + "M";
    } else if (valor >= 1000) {
        return "€" + (valor / 1000).toFixed(0) + "K";
    }
    return "€" + valor;
};

// ==========================================
// 💼 MANAGER TRANSFER MARKET SYSTEM
// ==========================================

// Search players in transfer market
window.buscarJogadoresMercado = function(query) {
    if (!window.jogadoresIA) return [];

    const searchTerm = query.toLowerCase();
    
    return window.jogadoresIA.filter(player => {
        const nomeMatch = player.nome && player.nome.toLowerCase().includes(searchTerm);
        const posMatch = player.posicao && player.posicao.toLowerCase().includes(searchTerm);
        const clubeMatch = player.clubeId && window.clubes.find(c => c.id === player.clubeId)?.nome.toLowerCase().includes(searchTerm);
        
        return nomeMatch || posMatch || clubeMatch;
    }).slice(0, 20); // Limit to 20 results
};

// Render transfer market results
window.renderTransferResults = function(jogadores) {
    const resultsContainer = document.getElementById("transfer-results");
    if (!resultsContainer) return;

    resultsContainer.innerHTML = "";

    if (jogadores.length === 0) {
        resultsContainer.innerHTML = "<p style='color: var(--text-muted); text-align: center; grid-column: 1/-1;'>Nenhum jogador encontrado</p>";
        return;
    }

    jogadores.forEach(player => {
        const clube = window.clubes.find(c => c.id === player.clubeId);
        const card = document.createElement("div");
        card.className = "transfer-player-card";
        
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="width: 50px; height: 50px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(30, 64, 175, 0.2)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">⚽</div>
                <div>
                    <strong style="color: #fff; font-size: 1rem; display: block;">${player.nome}</strong>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${player.posicao} • ${clube?.nome || "Sem Clube"}</span>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="color: var(--world-cup-gold); font-weight: 900; font-size: 1.2rem;">${player.geral}</span>
                <span style="color: var(--text-muted); font-size: 0.9rem;">${window.formatarMoeda(player.valorMercado || 1000000)}</span>
            </div>
            <button class="btn btn-sm btn-success" data-player-id="${player.id}" style="width: 100%; padding: 10px;">
                Fazer Oferta
            </button>
        `;

        // Add offer button listener
        card.querySelector("button").addEventListener("click", () => {
            window.abrirModalOferta(player);
        });

        resultsContainer.appendChild(card);
    });
};

// Open transfer offer modal
window.abrirModalOferta = function(player) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;

    modal.innerHTML = `
        <div class="card-criacao" style="width: 100%; max-width: 500px; padding: 30px;">
            <h3 style="margin: 0 0 20px 0; color: var(--world-cup-gold);">Oferta de Transferência</h3>
            <p style="margin-bottom: 20px; color: var(--text-muted);">
                Jogador: <strong>${player.nome}</strong><br>
                Clube Atual: ${window.clubes.find(c => c.id === player.clubeId)?.nome || "Sem Clube"}<br>
                Valor Estimado: ${window.formatarMoeda(player.valorMercado || 1000000)}
            </p>
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Valor da Oferta:</label>
                <input type="number" id="offer-amount" value="${Math.floor((player.valorMercado || 1000000) * 1.1)}" style="width: 100%; padding: 12px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #fff; font-size: 1rem;">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Salário Semanal (€):</label>
                <input type="number" id="offer-wage" value="${Math.floor((player.valorMercado || 1000000) * 0.001)}" style="width: 100%; padding: 12px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #fff; font-size: 1rem;">
            </div>
            <div style="display: flex; gap: 12px;">
                <button id="cancel-offer" class="btn btn-danger" style="flex: 1; padding: 12px;">Cancelar</button>
                <button id="submit-offer" class="btn btn-success" style="flex: 1; padding: 12px;">Enviar Oferta</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Cancel button
    modal.querySelector("#cancel-offer").addEventListener("click", () => {
        document.body.removeChild(modal);
    });

    // Submit offer
    modal.querySelector("#submit-offer").addEventListener("click", () => {
        const offerAmount = parseInt(document.getElementById("offer-amount").value);
        const offerWage = parseInt(document.getElementById("offer-wage").value);

        if (offerAmount > window.managerState.orçamentoTransferências) {
            alert("Orçamento insuficiente para esta oferta!");
            return;
        }

        // Add to pending offers
        window.managerState.transferências.ofertasPendentes.push({
            playerId: player.id,
            playerNome: player.nome,
            valorOferta: offerAmount,
            salarioOferecido: offerWage,
            status: "pending",
            data: Date.now()
        });

        // Deduct from budget (temporarily)
        window.managerState.orçamentoTransferências -= offerAmount;

        document.body.removeChild(modal);
        alert("Oferta enviada com sucesso!");
        window.atualizarInterfaceFinanças();
    });
};

// Update finance interface
window.atualizarInterfaceFinanças = function() {
    document.getElementById("manager-budget").textContent = window.formatarMoeda(window.managerState.orçamentoTransferências);
    document.getElementById("finance-transfer-budget").textContent = window.formatarMoeda(window.managerState.orçamentoTransferências);
    document.getElementById("finance-wage-budget").textContent = window.formatarMoeda(window.managerState.orçamentoSalários);
    
    // Calculate current wage bill
    const folhaSalarial = window.managerState.elenco.reduce((total, player) => {
        return total + (player.salario || 10000);
    }, 0);
    
    document.getElementById("finance-current-wages").textContent = window.formatarMoeda(folhaSalarial);
};

// Initialize transfer market
window.inicializarMercadoTransferências = function() {
    const searchBtn = document.getElementById("transfer-search-btn");
    const searchInput = document.getElementById("transfer-search-input");

    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => {
            const query = searchInput.value.trim();
            if (query) {
                const results = window.buscarJogadoresMercado(query);
                window.renderTransferResults(results);
            }
        });

        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                const query = searchInput.value.trim();
                if (query) {
                    const results = window.buscarJogadoresMercado(query);
                    window.renderTransferResults(results);
                }
            }
        });
    }

    // Load initial results (top players)
    const topPlayers = (window.jogadoresIA || [])
        .sort((a, b) => b.geral - a.geral)
        .slice(0, 10);
    window.renderTransferResults(topPlayers);
};

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
                    <img src="${playerData.foto || ''}" class="lobby-player-avatar" onerror="this.src='https://via.placeholder.com/60'">
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
window.vagasContinentais = { uefa_cl: [], uefa_el: [], uefa_col: [], conmebol_lib: [], conmebol_sul: [], concacaf_clc: [], afc_cla: [] };
let campeoesAnoAnterior = { ligas: {}, copas: {} };
let uiFiltroCompInt = "todos";
let uiSelectCompInt = null;
let managerEstado = { ativo: false, treinador: null, clubeId: null, confianca: 65, tatica: { formacao: "4-3-3", estilo: "pressao", mentalidade: "equilibrado", pressao: "média", largura: "normal" }, orcamentoTransferencias: 0, folhaSalarial: 0, base: [] };
// Controla quais competições já mostraram o vídeo/cinemática de abertura este ano (chave: `${compId}_${ano}`)
let introsExibidas = {};

// ==========================================
// 🔍 CLUB ROSTER FETCHING (WITH FRIENDS)
// ==========================================

// ==========================================
// 🧢 TITULARES E CAPITÃO (clubes)
// ==========================================
// Antes, TODO o elenco (até 60 jogadores) recebia "jogos++" em toda partida
// simulada — um reserva do sub-20 acumulava a mesma quantidade de jogos que o
// titular absoluto. Agora cada clube define os seus 11 titulares (melhor
// jogador por posição, respeitando uma formação básica 4-2-3-1) mais um banco
// rotativo, e só esse grupo (titulares + banco daquele jogo) conta partida —
// o resto do elenco (jovens, reservas profundas) fica de fora da rotação real,
// como num time de verdade.
const FORMACAO_BASE_TITULARES = [["Goleiro", 1], ["Zagueiro", 2], ["Lateral", 2], ["Volante", 2], ["Meio-Campista", 1], ["Meia Ofensivo", 1], ["Ponta", 1], ["Atacante", 1]];

function definirTitularesECapitao(elenco) {
    const porPos = {};
    elenco.forEach(j => { if(!porPos[j.posicao]) porPos[j.posicao] = []; porPos[j.posicao].push(j); });
    Object.values(porPos).forEach(lista => lista.sort((a,b) => (b.geral||60) - (a.geral||60)));

    let titulares = [];
    FORMACAO_BASE_TITULARES.forEach(([pos, qtd]) => { titulares.push(...(porPos[pos] || []).slice(0, qtd)); });
    if (titulares.length < 11) {
        const idsJa = new Set(titulares.map(j => j.id));
        const restantes = elenco.filter(j => !idsJa.has(j.id)).sort((a,b) => (b.geral||60) - (a.geral||60));
        titulares.push(...restantes.slice(0, 11 - titulares.length));
    }

    // Capitão: entre os titulares, prioriza quem tem mais "peso" de liderança
    // (geral alto + veterania), com leve preferência por zagueiros/volantes
    // (perfil clássico de braçadeira).
    const pesoLideranca = (j) => (j.geral||60) + (j.idade||24) * 0.35 + (["Zagueiro","Volante","Goleiro"].includes(j.posicao) ? 3 : 0);
    const capitao = [...titulares].sort((a,b) => pesoLideranca(b) - pesoLideranca(a))[0] || null;

    return { titularesIds: titulares.map(j => j.id), capitaoId: capitao?.id || null };
}

function obterTitularesClube(clubeId) {
    const clube = clubes.find(c => c.id === clubeId);
    if (!clube) return null;
    const elenco = jogadoresIA.filter(j => j.clubeId === clubeId && !j.aposentado);
    if (elenco.length === 0) return null;
    if (clube._titularesCacheTam === elenco.length && clube.titularesIds) return clube;

    const { titularesIds, capitaoId } = definirTitularesECapitao(elenco);
    clube.titularesIds = titularesIds;
    clube.capitaoId = capitaoId;
    clube._titularesCacheTam = elenco.length;
    return clube;
}

// Monta a escalação real de UM jogo: os 11 titulares + um banco de até 7
// jogadores sorteados (com preferência aos melhores) entre os reservas de
// maior nível — em vez do elenco inteiro. É essa lista (não o elenco inteiro)
// que deve receber estatísticas/minutos daquele jogo específico.
function montarEscalacaoJogo(clubeId) {
    const elenco = jogadoresIA.filter(j => j.clubeId === clubeId && !j.aposentado);
    if (elenco.length === 0) return elenco;
    const clube = obterTitularesClube(clubeId);
    if (!clube || !clube.titularesIds) return elenco; // elenco pequeno/incomum: mantém comportamento antigo como fallback seguro

    const idsTitulares = new Set(clube.titularesIds);
    const titulares = elenco.filter(j => idsTitulares.has(j.id));
    let reservas = elenco.filter(j => !idsTitulares.has(j.id)).sort((a,b) => (b.geral||60) - (a.geral||60));
    if (reservas.length === 0) return titulares;

    const poolBanco = reservas.slice(0, Math.min(reservas.length, 14)); // banco real sai só dos 14 melhores reservas
    const tamanhoBanco = Math.min(7, poolBanco.length);
    const banco = [];
    const poolCopia = [...poolBanco];
    while (banco.length < tamanhoBanco && poolCopia.length > 0) {
        const idx = Math.floor(Math.random() * poolCopia.length);
        banco.push(poolCopia.splice(idx, 1)[0]);
    }
    return [...titulares, ...banco];
}

function getElencoClube(clubeId, incluirAposentados = false) {
    // Use Firebase integration if online mode is active
    if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode()) {
        return window.firebaseIntegration.fetchClubRosterWithFriends(clubeId);
    }
    
    // Fallback to original behavior
    let elenco = jogadoresIA.filter(j => j.clubeId === clubeId && (incluirAposentados || !j.aposentado));
    if (jogador && jogador.clubeId === clubeId) {
        elenco.unshift({ ...jogador, id: 'player', isMe: true });
    }
    return elenco;
}

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
        if(typeof jogador.jogouPartidaDesdeUltimoTreino === 'undefined') jogador.jogouPartidaDesdeUltimoTreino = false;
        inicializarEstadoCarreiraJogador();
        if(dados.vagasContinentais) window.vagasContinentais = dados.vagasContinentais;
        if(dados.campeoesAnoAnterior) campeoesAnoAnterior = dados.campeoesAnoAnterior;
        if(dados.premiosIndividuaisPendentes) premiosIndividuaisPendentes = dados.premiosIndividuaisPendentes;
        if(dados.titulosClubesPendentes) titulosClubesPendentes = dados.titulosClubesPendentes;
        if(dados.transferenciasHistorico) transferenciasHistorico = dados.transferenciasHistorico;
        if(dados.eventosRecentes) eventosRecentes = dados.eventosRecentes;
        if(dados.managerEstado) managerEstado = { ativo: false, treinador: null, clubeId: null, confianca: 65, tatica: { formacao: "4-3-3", estilo: "pressao", mentalidade: "equilibrado", pressao: "média", largura: "normal" }, orcamentoTransferencias: 0, folhaSalarial: 0, base: [], ...dados.managerEstado };
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
        aplicarHistoricosReaisIniciais();
        for (let key in tabelasLigas) delete tabelasLigas[key]; Object.assign(tabelasLigas, dados.tabelas);
        
        if(clubes.length < 30) preencherLigasVazias(); if(Object.keys(tabelasLigas).length === 0) inicializarTabelas();
        atualizarOVRClubes(); inicializarOrcamentosEContratos(); preencherDropdowns();
        if(Object.keys(copasEstado).length === 0) inicializarCopasNacionaisEContinentais();
        if(agendaTemporada.length === 0) gerarAgenda();
        else normalizarAgendaCalendario();
        
        atualizarHub(); mudarTela("view-hub"); 
        let homeV = document.getElementById("view-home"); if(homeV) { homeV.classList.remove("oculto"); homeV.style.display="block"; }
        if(!jogador.estatisticasAtuais.assistencias) jogador.estatisticasAtuais.assistencias = 0;
    if(!jogador.estatisticasAtuais.defesas) jogador.estatisticasAtuais.defesas = 0;
        return true;
    } return false;
}
// 🛡️ FIX: expõe no window — firebase-integration.js checa "window.carregarJogo"
// no fluxo de reconexão automática de sessão.
window.carregarJogo = carregarJogo;

const CONFIG_VAGAS_CONTINENTAIS = {
    "eng_1": { cl: 4, el: 2, col: 1 }, "esp_1": { cl: 4, el: 2, col: 1 }, "ita_1": { cl: 4, el: 2, col: 1 },
    "ger_1": { cl: 4, el: 2, col: 1 }, "fra_1": { cl: 3, el: 2, col: 1 }, "pt_1":  { cl: 2, el: 2, col: 1 },
    "nl_1":  { cl: 2, el: 2, col: 1 }, "tr_1":  { cl: 1, el: 1, col: 1 }, "sco_1":  { cl: 1, el: 1, col: 1 }, 
    "nor_1": { cl: 1, el: 1, col: 1 }, "be_1": { cl: 1, el: 1, col: 1 }, "sui_1": { cl: 1, el: 1, col: 1 },
    "gre_1": { cl: 1, el: 1, col: 1 }, "aut_1": { cl: 1, el: 1, col: 1 },

    "br_1":  { lib: 6, sul: 6 }, "arg_1": { lib: 5, sul: 6 },"uy_1":  { lib: 4, sul: 4 }, 

    "ara_1": { cla: 4 }, 
    
    "usa_1": { clc: 4 }, "mx_1": { clc: 4 },"nga_1": { clc: 4 },"cvi_1": { clc: 2 },

    "default_uefa": { cl: 1, el: 1, col: 1 }, "default_conmebol": { lib: 2, sul: 2 },
    "default_asia": { cla: 4 }, "default_concacaf": { clc: 4 },
};

// Cores fixas por tipo de zona de qualificação/despromoção nas tabelas de liga
const CORES_ZONAS_TABELA = {
    champions: { cor: "#3b82f6", label: "" },
    europa: { cor: "#f97316", label: "" },
    conference: { cor: "#22c55e", label: "" },
    libertadores: { cor: "#facc15", label: "" },
    sula: { cor: "#1693f9", label: "" },
    afc: { cor: "#9a10f7", label: "" },
    concacaf: { cor: "#7baeff", label: "" },
    rebaixamento: { cor: "#ef4444", label: "" }
};

// Devolve, para uma liga específica, as faixas de posições (0-based) que dão acesso
// a cada competição continental, mais a faixa de rebaixamento — sempre calculado
// dinamicamente a partir do número real de vagas dessa liga (ex: 4 na Premier vs 2 na Liga Portugal).
function obterZonasQualificacaoLiga(ligaId, totalClubes) {
    const zonas = [];
    const rV = CONFIG_VAGAS_CONTINENTAIS[ligaId] || (ligaId.includes("br") || ligaId.includes("arg") || ligaId.includes("uy") ? CONFIG_VAGAS_CONTINENTAIS["default_conmebol"] : (ligaId.includes("ara") ? CONFIG_VAGAS_CONTINENTAIS["default_asia"] : (ligaId.includes("usa") || ligaId.includes("mx") ? CONFIG_VAGAS_CONTINENTAIS["default_concacaf"] : CONFIG_VAGAS_CONTINENTAIS["default_uefa"])));
    const somenteDivisaoPrincipal = ligaId.endsWith("_1") || !/_\d+$/.test(ligaId);

    if (somenteDivisaoPrincipal && rV) {
        let idx = 0;
        if (rV.cl !== undefined) {
            if (rV.cl > 0) { zonas.push({ inicio: idx, fim: idx + rV.cl, ...CORES_ZONAS_TABELA.champions }); idx += rV.cl; }
            if (rV.el > 0) { zonas.push({ inicio: idx, fim: idx + rV.el, ...CORES_ZONAS_TABELA.europa }); idx += rV.el; }
            if (rV.col > 0) { zonas.push({ inicio: idx, fim: idx + rV.col, ...CORES_ZONAS_TABELA.conference }); idx += rV.col; }
        } else if (rV.lib !== undefined) {
            if (rV.lib > 0) { zonas.push({ inicio: idx, fim: idx + rV.lib, ...CORES_ZONAS_TABELA.libertadores }); idx += rV.lib; }
            if (rV.sul > 0) { zonas.push({ inicio: idx, fim: idx + rV.sul, ...CORES_ZONAS_TABELA.sula }); idx += rV.sul; }
        } else if (rV.cla !== undefined) {
            if (rV.cla > 0) zonas.push({ inicio: idx, fim: idx + rV.cla, ...CORES_ZONAS_TABELA.afc });
        } else if (rV.clc !== undefined) {
            if (rV.clc > 0) zonas.push({ inicio: idx, fim: idx + rV.clc, ...CORES_ZONAS_TABELA.concacaf });
        }
    }

    // Zona de rebaixamento: só existe se houver uma divisão abaixo desta no jogo
    const matchDiv = ligaId.match(/_(\d+)$/);
    if (matchDiv && totalClubes > 4) {
        const divAtual = parseInt(matchDiv[1]);
        const proximaDivId = ligaId.replace(`_${divAtual}`, `_${divAtual + 1}`);
        if (typeof tabelasLigas !== 'undefined' && tabelasLigas[proximaDivId]) {
            zonas.push({ inicio: totalClubes - 3, fim: totalClubes, ...CORES_ZONAS_TABELA.rebaixamento });
        }
    }
    return zonas;
}

function obterZonaDaPosicao(zonas, indexPos) {
    return zonas.find(z => indexPos >= z.inicio && indexPos < z.fim) || null;
}

const TOP5_LIGAS_EUROPA = ["eng_1", "esp_1", "ita_1", "ger_1", "fra_1"];
const PAISES_FORA_DA_UEFA = ["br", "arg", "uy", "ara", "usa", "mx", "nga", "cvi", "sel"];
function ehLigaEuropeia(ligaId) {
    if (!ligaId) return false;
    const prefixo = ligaId.split("_")[0];
    return !PAISES_FORA_DA_UEFA.includes(prefixo);
}

// ==========================================
// 🏅 REALISMO DA BOLA DE OURO — pesos por competição, pontos de título
// e comparação justa entre posições.
// ==========================================

// Quanto cada gol/assistência vale, de acordo com a competição em que foi feito.
// Marcar 10 gols na Champions vale mais do que 10 gols em amistosos.
const PESO_COMPETICAO = {
    uefa_cl: 1.50, conmebol_lib: 1.50,
    uefa_el: 1.15, conmebol_sul: 1.15, concacaf_clc: 1.15, afc_cla: 1.15, uefa_col: 1.00,
    uefa_supercup: 0.60, conmebol_recopa: 0.60,
    intercontinental_cup: 1.50,
    copa_mundo: 1.80, euro: 1.55, copa_america: 1.45,
    gold_cup: 1.20, copa_africa: 1.30, copa_asia: 1.20, olimpiadas: 1.00,
    eliminatorias_uefa: 0.70, eliminatorias_conmebol: 0.70, eliminatorias_concacaf: 0.70,
    eliminatorias_caf: 0.70, eliminatorias_afc: 0.70, euro_qualy: 0.70,
    nations_a: 0.85, nations_b: 0.55, nations_c: 0.45, nations_d: 0.40,
    amistoso: 0.20
};
// Peso genérico por tipo de competição, usado quando o id não está no mapa acima
// (ligas nacionais, copas nacionais, etc., que têm um id diferente por país).
// 🆕 PRESTÍGIO DE LIGA (Bola de Ouro / Gala): antes, qualquer liga de divisão
// 1 valia o mesmo (1.00) pra pontuação de prêmios individuais — um artilheiro
// da Saudi Pro League competia de igual pra igual com um da Premier League.
// Agora cada liga div-1 tem seu próprio peso de prestígio: quanto mais longe
// do top 5 europeu (e principalmente fora da Europa), menor a pontuação que
// os gols/assistências daquele jogador valem na disputa da Gala — do jeito
// que realmente funciona o debate do prêmio no mundo real.
const PESO_LIGA_PRESTIGIO = {
    // Top 5 europeu
    eng_1: 1.35, esp_1: 1.35, ita_1: 1.30, ger_1: 1.30, fra_1: 1.20,
    // Outras ligas europeias tradicionais/fortes
    pt_1: 1.10, nl_1: 1.05,
    tr_1: 0.95, be_1: 0.90, sco_1: 0.85, sui_1: 0.85, aut_1: 0.80, gre_1: 0.80, nor_1: 0.75,
    // Sul-americanas de maior destaque (ainda abaixo da Europa)
    br_1: 0.85, arg_1: 0.80, uy_1: 0.65,
    // Resto do mundo (fora da Europa e das duas grandes sul-americanas)
    ara_1: 0.55, usa_1: 0.55, mx_1: 0.55, nga_1: 0.45, civ_1: 0.45
};
function pesoCompeticaoPorTipo(comp) {
    if (!comp) return 1.00;
    if (comp.tipo === "liga") {
        if (comp.div !== 1) return 0.55;
        return PESO_LIGA_PRESTIGIO[comp.id] ?? 0.50; // ligas não listadas: tratadas como "menor prestígio"
    }
    if (comp.tipo === "copa") return 0.80;
    if (comp.tipo === "supercopa") return 0.60;
    if (comp.tipo === "supercopa_continental") return 0.60;
    if (comp.tipo === "continental") return comp.div === 1 ? 1.50 : 1.15;
    if (comp.tipo === "torneio_intercontinental") return 1.50;
    if (comp.tipo === "selecao") return comp.div >= 1 ? 1.20 : 0.70;
    return 1.00;
}
function pesoCompeticaoId(compId) {
    if (PESO_COMPETICAO[compId] !== undefined) return PESO_COMPETICAO[compId];
    return pesoCompeticaoPorTipo(competicoes.find(c => c.id === compId));
}

// Pontos concedidos por título conquistado na temporada — a Champions e a
// Libertadores valem o mesmo, uma Supercopa vale bem menos que um título nacional.
const PONTOS_TITULO = {
    ligaPrincipal: 35, ligaSecundaria: 10,
    copaNacional: 20,
    continentalElite: 50, continentalSecundaria: 30,
    supercopaClube: 10, supercopaContinental: 15,
    intercontinental: 40,
    selecaoMundial: 60, selecaoContinentalMenor: 30,
    selecaoOlimpiadas: 35, selecaoNations: 15
};
function pontosTituloClube(comp) {
    if (!comp) return 15;
    if (comp.tipo === "copa") return PONTOS_TITULO.copaNacional;
    if (comp.tipo === "supercopa") return PONTOS_TITULO.supercopaClube;
    if (comp.tipo === "supercopa_continental") return PONTOS_TITULO.supercopaContinental;
    if (comp.tipo === "torneio_intercontinental") return PONTOS_TITULO.intercontinental;
    if (comp.tipo === "continental") return comp.div === 1 ? PONTOS_TITULO.continentalElite : PONTOS_TITULO.continentalSecundaria;
    return 15;
}
function pontosTituloSelecao(compConfigId) {
    if (["copa_mundo", "euro", "copa_america"].includes(compConfigId)) return PONTOS_TITULO.selecaoMundial;
    if (["gold_cup", "copa_africa", "copa_asia"].includes(compConfigId)) return PONTOS_TITULO.selecaoContinentalMenor;
    if (compConfigId === "olimpiadas") return PONTOS_TITULO.selecaoOlimpiadas;
    if ((compConfigId || "").startsWith("nations_")) return PONTOS_TITULO.selecaoNations;
    return 15;
}

// Agrupa posições em 4 grandes blocos para comparar "iguais com iguais" na hora
// de pontuar a Bola de Ouro — assim atacantes não dominam sempre o prêmio.
function grupoPosicaoPremio(pos) {
    if (["Atacante", "Ponta"].includes(pos)) return "atacante";
    if (["Meia Ofensivo", "Meio-Campista", "Volante"].includes(pos)) return "meia";
    if (["Zagueiro", "Lateral"].includes(pos)) return "defensor";
    if (pos === "Goleiro") return "goleiro";
    return "meia";
}

// Soma os gols/assistências do jogador em todas as competições que disputou na
// temporada, cada uma já multiplicada pelo peso da competição (ver PESO_COMPETICAO).
function statsPonderadosTemporada(p, totalGolsFallback = 0, totalAssistFallback = 0) {
    const stats = p.statsCompeticoes || {};
    const chaves = Object.keys(stats);
    if (chaves.length === 0) return { golsP: totalGolsFallback, assistP: totalAssistFallback, jogosTotais: 0 };
    let golsP = 0, assistP = 0, jogosTotais = 0;
    chaves.forEach(compId => {
        const st = stats[compId] || {};
        const peso = pesoCompeticaoId(compId);
        golsP += (st.gols || 0) * peso;
        assistP += (st.assistencias || 0) * peso;
        jogosTotais += (st.jogos || 0);
    });
    return { golsP, assistP, jogosTotais };
}

// O motor de partidas não simula cada desarme ou defesa individualmente, então
// estes números são estimados a partir de dados reais da temporada (gols sofridos
// pelo clube, jogos disputados e o nível geral do jogador) — o suficiente para dar
// a zagueiros, laterais e goleiros critérios próprios na disputa da Bola de Ouro.
// 🛡️ FIX: agora que desarmes/interceptações/defesas/jogosSemSofrerGol são
// acumulados de VERDADE a cada partida (ver atribuirEstatisticaNPC), esta
// função só entra como reserva para quem ainda não tem esses dados reais
// (ex: jogador muito jovem que ainda não completou uma temporada inteira).
function estimarPerfilDefensivo(p, ligaId, jogosNaLiga) {
    const st = p === jogador ? p.estatisticasAtuais : p.statsTemporada;
    if (st && (st.desarmes || st.interceptacoes || st.defesas || st.jogosSemSofrerGol)) {
        return {
            jogosSemSofrerGol: st.jogosSemSofrerGol || 0,
            desarmes: st.desarmes || 0,
            interceptacoes: st.interceptacoes || 0,
            defesas: st.defesas || 0,
            penaltisDefendidos: st.penaltisDefendidos || 0
        };
    }
    const ovr = p.geral || 60;
    const tabela = ligaId ? tabelasLigas[ligaId] : null;
    const clube = tabela ? tabela.find(t => t.id === p.clubeId) : null;
    let shareClean = 0.32;
    if (clube && clube.jogos > 0) {
        const mediaSofridaPorJogo = (clube.golsSofridos || 0) / clube.jogos;
        shareClean = Math.max(0.05, Math.min(0.78, 1 - mediaSofridaPorJogo / 1.4));
    }
    const jogos = jogosNaLiga || 0;
    const fatorOvr = Math.max(0, (ovr - 58)) / 100;
    return {
        jogosSemSofrerGol: Math.round(jogos * shareClean),
        desarmes: Math.round(jogos * (0.9 + fatorOvr * 2.2)),
        interceptacoes: Math.round(jogos * (0.7 + fatorOvr * 1.8)),
        defesas: Math.round(jogos * (2.4 + fatorOvr * 2.6)),
        penaltisDefendidos: Math.round(jogos * 0.045 * (ovr / 80))
    };
}

// Normaliza uma métrica (0 a 100) comparando o valor do jogador com o melhor
// valor do MESMO grupo de posição naquela temporada.
function normalizarNoGrupo(valor, maxDoGrupo) {
    if (!maxDoGrupo || maxDoGrupo <= 0) return 0;
    return Math.max(0, Math.min(100, (valor / maxDoGrupo) * 100));
}

// getElencoClube() devolve uma CÓPIA do jogador principal (para poder marcar isMe),
// então somar pontos direto nessa cópia nunca chegaria ao objeto real. Esta função
// garante que o crédito vai sempre para o "jogador" verdadeiro quando for o caso.
function creditarPontosPremio(j, pontos) {
    const alvo = (j.id === "player" || j.isMe) ? jogador : j;
    alvo.pontosPremio = (alvo.pontosPremio || 0) + pontos;
    alvo.pontosPremioTemporada = (alvo.pontosPremioTemporada || 0) + pontos;
    return alvo;
}
const POSICOES_CONVOCACAO = {
    goleiros: ["Goleiro"],
    laterais: ["Lateral"],
    defensores: ["Zagueiro"],
    meio: ["Volante", "Meio-Campista", "Meia Ofensivo"],
    ataque: ["Ponta", "Atacante"]
};
const SELECOES = [
    { id:"sel_bra", pais:"Brasil", nome:"Brasil", conf:"CONMEBOL", logo:"https://i.ibb.co/XrCdg4NJ/logo-selecao-brasileira-brasil-novo-logo-2019-com-estrelas-4096.webp", cor:"#facc15" },
    { id:"sel_arg", pais:"Argentina", nome:"Argentina", conf:"CONMEBOL", logo:"https://upload.wikimedia.org/wikipedia/pt/thumb/f/fc/230px-Afa_logo.svg.png/250px-230px-Afa_logo.svg.png", cor:"#75aadb" },
    { id:"sel_uru", pais:"Uruguai", nome:"Uruguai", conf:"CONMEBOL", logo:"https://upload.wikimedia.org/wikipedia/pt/0/04/AUF.png", cor:"#7dd3fc" },
    { id:"sel_col", pais:"Colombia", nome:"Colômbia", conf:"CONMEBOL", logo:"https://flagcdn.com/w160/co.png", cor:"#facc15" },
    { id:"sel_equ", pais:"Equador", nome:"Equador", conf:"CONMEBOL", logo:"https://flagcdn.com/w160/ec.png", cor:"#fbbf24" },
    { id:"sel_chi", pais:"Chile", nome:"Chile", conf:"CONMEBOL", logo:"https://flagcdn.com/w160/cl.png", cor:"#ef4444" },
    { id:"sel_par", pais:"Paraguai", nome:"Paraguai", conf:"CONMEBOL", logo:"https://flagcdn.com/w160/py.png", cor:"#dc2626" },
    { id:"sel_per", pais:"Peru", nome:"Peru", conf:"CONMEBOL", logo:"https://flagcdn.com/w160/pe.png", cor:"#ef4444" },
    { id:"sel_ven", pais:"Venezuela", nome:"Venezuela", conf:"CONMEBOL", logo:"https://flagcdn.com/w160/ve.png", cor:"#facc15" },
    { id:"sel_bol", pais:"Bolivia", nome:"Bolívia", conf:"CONMEBOL", logo:"https://flagcdn.com/w160/bo.png", cor:"#22c55e" },
    { id:"sel_por", pais:"Portugal", nome:"Portugal", conf:"UEFA", logo:"https://i.ibb.co/1JPSQ0v6/5332dc84e5df11eda500e9d6cabd8134.webp", cor:"#ef4444" },
    { id:"sel_esp", pais:"Espanha", nome:"Espanha", conf:"UEFA", logo:"https://upload.wikimedia.org/wikipedia/pt/3/31/Spain_National_Football_Team_badge.png", cor:"#dc2626" },
    { id:"sel_ita", pais:"Italia", nome:"Itália", conf:"UEFA", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Logo_Italy_National_Football_Team_-_2023.svg/120px-Logo_Italy_National_Football_Team_-_2023.svg.png", cor:"#22c55e" },
    { id:"sel_ing", pais:"Inglaterra", nome:"Inglaterra", conf:"UEFA", logo:"https://flagcdn.com/w160/gb-eng.png", cor:"#e5e7eb" },
    { id:"sel_fra", pais:"França", nome:"França", conf:"UEFA", logo:"https://upload.wikimedia.org/wikipedia/pt/thumb/f/fb/France_national_football_team_seal.png/120px-France_national_football_team_seal.png", cor:"#2563eb" },
    { id:"sel_ger", pais:"Alemanha", nome:"Alemanha", conf:"UEFA", logo:"https://upload.wikimedia.org/wikipedia/pt/thumb/a/a9/DFBEagle.png/250px-DFBEagle.png", cor:"#f3f4f6" },
    { id:"sel_hol", pais:"Holanda", nome:"Holanda", conf:"UEFA", logo:"https://imgs.search.brave.com/Ej1gNLV-1gckEH19PNO0q6UZDNGV1CHbSviX_7xjvP4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvZW4vdGh1bWIv/Ny83OC9OZXRoZXJs/YW5kc19uYXRpb25h/bF9mb290YmFsbF90/ZWFtX2xvZ28uc3Zn/LzI1MHB4LU5ldGhl/cmxhbmRzX25hdGlv/bmFsX2Zvb3RiYWxs/X3RlYW1fbG9nby5z/dmcucG5n", cor:"#fb923c" },
    { id:"sel_bel", pais:"Belgica", nome:"Bélgica", conf:"UEFA", logo:"https://upload.wikimedia.org/wikipedia/pt/thumb/b/b0/Royal_Belgian_FA_logo_2019.png/120px-Royal_Belgian_FA_logo_2019.png", cor:"#facc15" },
    { id:"sel_tur", pais:"Turquia", nome:"Turquia", conf:"UEFA", logo:"https://flagcdn.com/w160/tr.png", cor:"#ef4444" },
    { id:"sel_cro", pais:"Croacia", nome:"Croácia", conf:"UEFA", logo:"https://flagcdn.com/w160/hr.png", cor:"#ef4444" },
    { id:"sel_sui", pais:"Suica", nome:"Suíça", conf:"UEFA", logo:"https://flagcdn.com/w160/ch.png", cor:"#ef4444" },
    { id:"sel_aut", pais:"Austria", nome:"Áustria", conf:"UEFA", logo:"https://flagcdn.com/w160/at.png", cor:"#ef4444" },
    { id:"sel_pol", pais:"Polonia", nome:"Polônia", conf:"UEFA", logo:"https://flagcdn.com/w160/pl.png", cor:"#ef4444" },
    { id:"sel_swe", pais:"Suecia", nome:"Suécia", conf:"UEFA", logo:"https://flagcdn.com/w160/se.png", cor:"#facc15" },
    { id:"sel_nor", pais:"Noruega", nome:"Noruega", conf:"UEFA", logo:"https://flagcdn.com/w160/no.png", cor:"#ef4444" },
    { id:"sel_den", pais:"Dinamarca", nome:"Dinamarca", conf:"UEFA", logo:"https://flagcdn.com/w160/dk.png", cor:"#ef4444" },
    { id:"sel_srb", pais:"Servia", nome:"Sérvia", conf:"UEFA", logo:"https://flagcdn.com/w160/rs.png", cor:"#ef4444" },
    { id:"sel_ukr", pais:"Ucrania", nome:"Ucrânia", conf:"UEFA", logo:"https://flagcdn.com/w160/ua.png", cor:"#facc15" },
    { id:"sel_usa", pais:"Estados Unidos", nome:"Estados Unidos", conf:"CONCACAF", logo:"https://flagcdn.com/w160/us.png", cor:"#60a5fa" },
    { id:"sel_mex", pais:"Mexico", nome:"México", conf:"CONCACAF", logo:"https://flagcdn.com/w160/mx.png", cor:"#22c55e" },
    { id:"sel_crc", pais:"Costa Rica", nome:"Costa Rica", conf:"CONCACAF", logo:"https://flagcdn.com/w160/cr.png", cor:"#ef4444" },
    { id:"sel_can", pais:"Canada", nome:"Canadá", conf:"CONCACAF", logo:"https://flagcdn.com/w160/ca.png", cor:"#ef4444" },
    { id:"sel_jam", pais:"Jamaica", nome:"Jamaica", conf:"CONCACAF", logo:"https://flagcdn.com/w160/jm.png", cor:"#facc15" },
    { id:"sel_sen", pais:"Senegal", nome:"Senegal", conf:"CAF", logo:"https://flagcdn.com/w160/sn.png", cor:"#22c55e" },
    { id:"sel_mar", pais:"Marrocos", nome:"Marrocos", conf:"CAF", logo:"https://flagcdn.com/w160/ma.png", cor:"#ef4444" },
    { id:"sel_egy", pais:"Egito", nome:"Egito", conf:"CAF", logo:"https://flagcdn.com/w160/eg.png", cor:"#ef4444" },
    { id:"sel_nga", pais:"Nigeria", nome:"Nigéria", conf:"CAF", logo:"https://upload.wikimedia.org/wikipedia/pt/thumb/b/be/NigeriaFA.png/250px-NigeriaFA.png", cor:"#22c55e" },
    { id:"sel_cmr", pais:"Camaroes", nome:"Camarões", conf:"CAF", logo:"https://flagcdn.com/w160/cm.png", cor:"#facc15" },
    { id:"sel_gha", pais:"Gana", nome:"Gana", conf:"CAF", logo:"https://flagcdn.com/w160/gh.png", cor:"#facc15" },
    { id:"sel_alg", pais:"Argelia", nome:"Argélia", conf:"CAF", logo:"https://flagcdn.com/w160/dz.png", cor:"#22c55e" },
    { id:"sel_jap", pais:"Japao", nome:"Japão", conf:"AFC", logo:"https://flagcdn.com/w160/jp.png", cor:"#f9fafb" },
    { id:"sel_kor", pais:"Coreia do Sul", nome:"Coreia do Sul", conf:"AFC", logo:"https://flagcdn.com/w160/kr.png", cor:"#f9fafb" },
    { id:"sel_aus", pais:"Australia", nome:"Austrália", conf:"AFC", logo:"https://flagcdn.com/w160/au.png", cor:"#facc15" },
    { id:"sel_ksa", pais:"Arabia Saudita", nome:"Arábia Saudita", conf:"AFC", logo:"https://flagcdn.com/w160/sa.png", cor:"#22c55e" },
    { id:"sel_irn", pais:"Ira", nome:"Irã", conf:"AFC", logo:"https://flagcdn.com/w160/ir.png", cor:"#22c55e" },
    { id:"sel_qat", pais:"Catar", nome:"Catar", conf:"AFC", logo:"https://flagcdn.com/w160/qa.png", cor:"#ef4444" },
    { id:"sel_costmf", pais:"Costa do Marfim", nome:"Costa do Marfim", conf:"CAF", logo:"https://upload.wikimedia.org/wikipedia/pt/a/a1/F%C3%A9d%C3%A9ration_Ivorienne_de_Football.png?_=20151125183758", cor:"#ef4444" },
    { id:"sel_chn", pais:"China", nome:"China", conf:"AFC", logo:"https://flagcdn.com/w160/cn.png", cor:"#ef4444" },
    { id:"sel_irq", pais:"Iraque", nome:"Iraque", conf:"AFC", logo:"https://flagcdn.com/w160/iq.png", cor:"#22c55e" },
    { id:"sel_uae", pais:"Emirados Arabes Unidos", nome:"Emirados Árabes Unidos", conf:"AFC", logo:"https://flagcdn.com/w160/ae.png", cor:"#ef4444" },
    { id:"sel_ind", pais:"India", nome:"Índia", conf:"AFC", logo:"https://flagcdn.com/w160/in.png", cor:"#f59e0b" },
    { id:"sel_tha", pais:"Tailandia", nome:"Tailândia", conf:"AFC", logo:"https://flagcdn.com/w160/th.png", cor:"#2563eb" },
    { id:"sel_idn", pais:"Indonesia", nome:"Indonésia", conf:"AFC", logo:"https://flagcdn.com/w160/id.png", cor:"#ef4444" },
    { id:"sel_nzl", pais:"Nova Zelandia", nome:"Nova Zelândia", conf:"OFC", logo:"https://flagcdn.com/w160/nz.png", cor:"#111827" },
    // 🌊 OCEANIA (OFC) — as demais seleções da confederação, além da Nova
    // Zelândia que já existia.
    { id:"sel_fij", pais:"Fiji", nome:"Fiji", conf:"OFC", logo:"https://flagcdn.com/w160/fj.png", cor:"#60a5fa" },
    { id:"sel_png", pais:"Papua Nova Guine", nome:"Papua Nova Guiné", conf:"OFC", logo:"https://flagcdn.com/w160/pg.png", cor:"#ef4444" },
    { id:"sel_sol", pais:"Ilhas Salomao", nome:"Ilhas Salomão", conf:"OFC", logo:"https://flagcdn.com/w160/sb.png", cor:"#22c55e" },
    { id:"sel_tah", pais:"Taiti", nome:"Taiti", conf:"OFC", logo:"https://flagcdn.com/w160/pf.png", cor:"#ef4444" },
    { id:"sel_nca", pais:"Nova Caledonia", nome:"Nova Caledônia", conf:"OFC", logo:"https://flagcdn.com/w160/nc.png", cor:"#60a5fa" },
    { id:"sel_van", pais:"Vanuatu", nome:"Vanuatu", conf:"OFC", logo:"https://flagcdn.com/w160/vu.png", cor:"#22c55e" },
    { id:"sel_tun", pais:"Tunisia", nome:"Tunísia", conf:"CAF", logo:"https://flagcdn.com/w160/tn.png", cor:"#ef4444" },
    { id:"sel_rsa", pais:"Africa do Sul", nome:"África do Sul", conf:"CAF", logo:"https://flagcdn.com/w160/za.png", cor:"#22c55e" },
    { id:"sel_eth", pais:"Etiopia", nome:"Etiópia", conf:"CAF", logo:"https://flagcdn.com/w160/et.png", cor:"#22c55e" },
    { id:"sel_ken", pais:"Quenia", nome:"Quênia", conf:"CAF", logo:"https://flagcdn.com/w160/ke.png", cor:"#111827" },
    { id:"sel_pan", pais:"Panama", nome:"Panamá", conf:"CONCACAF", logo:"https://flagcdn.com/w160/pa.png", cor:"#ef4444" },
    { id:"sel_hon", pais:"Honduras", nome:"Honduras", conf:"CONCACAF", logo:"https://flagcdn.com/w160/hn.png", cor:"#2563eb" },
    { id:"sel_slv", pais:"El Salvador", nome:"El Salvador", conf:"CONCACAF", logo:"https://flagcdn.com/w160/sv.png", cor:"#2563eb" },
    { id:"sel_cze", pais:"Republica Checa", nome:"República Checa", conf:"UEFA", logo:"https://flagcdn.com/w160/cz.png", cor:"#2563eb" },
    { id:"sel_fin", pais:"Finlandia", nome:"Finlândia", conf:"UEFA", logo:"https://flagcdn.com/w160/fi.png", cor:"#2563eb" },
    { id:"sel_gre", pais:"Grecia", nome:"Grécia", conf:"UEFA", logo:"https://flagcdn.com/w160/gr.png", cor:"#2563eb" },
    { id:"sel_rus", pais:"Russia", nome:"Rússia", conf:"UEFA", logo:"https://flagcdn.com/w160/ru.png", cor:"#2563eb" },
    { id:"sel_sco", pais:"Escocia", nome:"Escócia", conf:"UEFA", logo:"https://flagcdn.com/w160/gb-sct.png", cor:"#2563eb" },
    { id:"sel_irl", pais:"Irlanda", nome:"Irlanda", conf:"UEFA", logo:"https://flagcdn.com/w160/ie.png", cor:"#22c55e" },
];
const COMPETICOES_SELECOES = [
    { id:"amistoso", nome:"Amistosos Internacionais", conf:"GLOBAL", ciclo:"Data FIFA", jogos:1 },
    { id:"eliminatorias_uefa", nome:"Eliminatórias UEFA (Copa)", conf:"UEFA", ciclo:"regular", jogos:10 },
    { id:"eliminatorias_conmebol", nome:"Eliminatórias CONMEBOL", conf:"CONMEBOL", ciclo:"regular", jogos:18 },
    { id:"eliminatorias_concacaf", nome:"Eliminatórias CONCACAF", conf:"CONCACAF", ciclo:"regular", jogos:6 },
    { id:"eliminatorias_caf", nome:"Eliminatórias CAF", conf:"CAF", ciclo:"regular", jogos:6 },
    { id:"eliminatorias_afc", nome:"Eliminatórias AFC", conf:"AFC", ciclo:"regular", jogos:6 },
    { id:"eliminatorias_ofc", nome:"Eliminatórias OFC", conf:"OFC", ciclo:"regular", jogos:10 },
    { id:"eliminatorias_wc", nome:"Eliminatórias da Copa do Mundo", conf:"GLOBAL", ciclo:"regular", jogos:2 },
    { id:"copa_mundo", nome:"Copa do Mundo", conf:"GLOBAL", ciclo:"mundial", jogos:7 },
    { id:"olimpiadas", nome:"Olimpíadas (Sub-23)", conf:"GLOBAL", ciclo:"olimpico", jogos:6, sub23:true },
    { id:"mundial_sub17", nome:"Mundial Sub-17", conf:"GLOBAL", ciclo:"base", jogos:6, sub17:true },
    { id:"mundial_sub21", nome:"Mundial Sub-21", conf:"GLOBAL", ciclo:"base", jogos:6, sub21:true },
    { id:"euro", nome:"Eurocopa", conf:"UEFA", ciclo:"continental", jogos:7 },
    { id:"copa_america", nome:"Copa América", conf:"CONMEBOL", ciclo:"continental", jogos:6 },
    { id:"gold_cup", nome:"Gold Cup", conf:"CONCACAF", ciclo:"continental", jogos:5 },
    { id:"copa_africa", nome:"Copa Africana de Nações", conf:"CAF", ciclo:"continental", jogos:5 },
    { id:"copa_asia", nome:"Copa da Ásia", conf:"AFC", ciclo:"continental", jogos:5 },
    { id:"oceania_cup", nome:"Copa das Nações da Oceania", conf:"OFC", ciclo:"continental", jogos:4 },
    { id:"euro_qualy", nome:"Eliminatórias da Eurocopa", conf:"UEFA", ciclo:"regular", jogos:8 },
    { id:"nations_a", nome:"Nations League — Divisão A", conf:"UEFA", ciclo:"nations", jogos:6, div:"A" },
    { id:"nations_b", nome:"Nations League — Divisão B", conf:"UEFA", ciclo:"nations", jogos:6, div:"B" },
    { id:"nations_c", nome:"Nations League — Divisão C", conf:"UEFA", ciclo:"nations", jogos:6, div:"C" },
    { id:"nations_d", nome:"Nations League — Divisão D", conf:"UEFA", ciclo:"nations", jogos:4, div:"D" }
];

// ==========================================
// 🧒 SELEÇÕES DE BASE (Sub-17 e Sub-21)
// ==========================================
// Lista separada da lista de seleções principais (COMPETICOES_SELECOES).
// idadeMax define o limite de idade para ser convocável nesta competição —
// aplicado em gerarConvocacaoSelecaoBase().
const COMPETICOES_SELECOES_BASE = [
    { id:"mundial_sub17", nome:"Mundial Sub-17", conf:"GLOBAL", ciclo:"base", jogos:5, idadeMax:17 },
    { id:"mundial_sub21", nome:"Mundial Sub-21", conf:"GLOBAL", ciclo:"base", jogos:5, idadeMax:21 }
];

// Descobre se há um torneio de BASE (Sub-17/Sub-21) ativo para a seleção do
// jogador nesta janela — completamente independente da seleção principal,
// para que um jogador que não tem nível para a seleção adulta ainda possa
// disputar estes torneios de base normalmente.
function obterCompeticaoSelecaoBase(ano = anoAtual, rodada = rodadaAtual) {
    const slotAtual = Math.floor(obterSlotCalendarioAtual());
    const janelaFinalTemporada = slotAtual >= 44;
    if (ano % 2 === 1 && janelaFinalTemporada) return COMPETICOES_SELECOES_BASE.find(c => c.id === "mundial_sub17");
    if (ano % 2 === 0 && ano % 4 !== 2 && ano % 4 !== 0 && janelaFinalTemporada) return COMPETICOES_SELECOES_BASE.find(c => c.id === "mundial_sub21");
    return null;
}

const CALENDARIO_MODELOS = {
    europeu: [
        { de: 1, ate: 1, mes: "Julho", periodo: "Pre-temporada" },
        { de: 2, ate: 5, mes: "Agosto", periodo: "Abertura da temporada" },
        { de: 6, ate: 9, mes: "Setembro", periodo: "Data FIFA e ligas" },
        { de: 10, ate: 13, mes: "Outubro", periodo: "Grupos continentais" },
        { de: 14, ate: 17, mes: "Novembro", periodo: "Copas e Data FIFA" },
        { de: 18, ate: 21, mes: "Dezembro", periodo: "Fecho do ano" },
        { de: 22, ate: 25, mes: "Janeiro", periodo: "Retorno e supercopas" },
        { de: 26, ate: 29, mes: "Fevereiro", periodo: "Copas nacionais" },
        { de: 30, ate: 33, mes: "Marco", periodo: "Data FIFA e oitavas" },
        { de: 34, ate: 37, mes: "Abril", periodo: "Reta final" },
        { de: 38, ate: 43, mes: "Maio", periodo: "Finais e ultima rodada" },
        { de: 44, ate: 48, mes: "Junho", periodo: "Selecoes" },
        { de: 49, ate: 52, mes: "Julho", periodo: "Torneios de selecoes" }
    ],
    ano: [
        { de: 1, ate: 2, mes: "Janeiro", periodo: "Pre-temporada" },
        { de: 3, ate: 6, mes: "Fevereiro", periodo: "Supercopas e estaduais" },
        { de: 7, ate: 10, mes: "Marco", periodo: "Inicio da liga" },
        { de: 11, ate: 14, mes: "Abril", periodo: "Copas nacionais" },
        { de: 15, ate: 18, mes: "Maio", periodo: "Liga e copas" },
        { de: 19, ate: 22, mes: "Junho", periodo: "Data FIFA" },
        { de: 23, ate: 26, mes: "Julho", periodo: "Meio da temporada" },
        { de: 27, ate: 30, mes: "Agosto", periodo: "Copas continentais" },
        { de: 31, ate: 34, mes: "Setembro", periodo: "Data FIFA" },
        { de: 35, ate: 38, mes: "Outubro", periodo: "Decisoes de copa" },
        { de: 39, ate: 43, mes: "Novembro", periodo: "Finais continentais" },
        { de: 44, ate: 48, mes: "Dezembro", periodo: "Ultimas rodadas" }
    ]
};

const CALENDARIO_PERFIS_PAIS = {
    default: { modelo: "europeu", ligaInicio: 3, ligaFim: 42, supercopaSlot: 2, copaSlots: [17, 27, 36, 41] },
    eng: { modelo: "europeu", ligaInicio: 3, ligaFim: 42, supercopaSlot: 2, copaSlots: [18, 27, 35, 40] },
    esp: { modelo: "europeu", ligaInicio: 3, ligaFim: 42, supercopaSlot: 22, copaSlots: [16, 25, 33, 39] },
    ita: { modelo: "europeu", ligaInicio: 3, ligaFim: 42, supercopaSlot: 22, copaSlots: [11, 24, 33, 39] },
    ger: { modelo: "europeu", ligaInicio: 3, ligaFim: 40, supercopaSlot: 2, copaSlots: [13, 23, 34, 41] },
    fra: { modelo: "europeu", ligaInicio: 3, ligaFim: 41, supercopaSlot: 2, copaSlots: [14, 25, 35, 40] },
    pt: { modelo: "europeu", ligaInicio: 3, ligaFim: 41, supercopaSlot: 2, copaSlots: [14, 24, 34, 40] },
    nl: { modelo: "europeu", ligaInicio: 3, ligaFim: 41, supercopaSlot: 2, copaSlots: [13, 24, 34, 40] },
    br: { modelo: "ano", ligaInicio: 8, ligaFim: 48, supercopaSlot: 4, copaSlots: [12, 22, 34, 42] },
    arg: { modelo: "ano", ligaInicio: 7, ligaFim: 45, supercopaSlot: 4, copaSlots: [13, 23, 35, 43] },
    uy: { modelo: "ano", ligaInicio: 7, ligaFim: 45, supercopaSlot: 4, copaSlots: [14, 24, 35, 43] },
    usa: { modelo: "ano", ligaInicio: 8, ligaFim: 40, supercopaSlot: 23, copaSlots: [14, 22, 31, 36] },
    mx: { modelo: "ano", ligaInicio: 5, ligaFim: 36, supercopaSlot: 3, copaSlots: [10, 18, 27, 34] }
};

const CALENDARIO_COMPETICOES_REALISTAS = {
    carabao_eng: { modelo: "europeu", slots: [7, 14, 22, 28], janela: "Carabao Cup" },
    copa_eng: { modelo: "europeu", slots: [18, 27, 35, 40], janela: "FA Cup" },
    supercopa_eng: { modelo: "europeu", slots: [2], janela: "Community Shield" },
    copa_esp: { modelo: "europeu", slots: [16, 25, 33, 39], janela: "Copa del Rey" },
    supercopa_esp: { modelo: "europeu", slots: [22], janela: "Supercopa da Espanha" },
    copa_ita: { modelo: "europeu", slots: [11, 24, 33, 39], janela: "Coppa Italia" },
    supercopa_ita: { modelo: "europeu", slots: [22], janela: "Supercoppa" },
    copa_ger: { modelo: "europeu", slots: [13, 23, 34, 41], janela: "DFB-Pokal" },
    copa_br: { modelo: "ano", slots: [12, 22, 34, 42], janela: "Copa do Brasil" },
    copa_arg: { modelo: "ano", slots: [13, 23, 35, 43], janela: "Copa Argentina" },
    copa_usa: { modelo: "ano", slots: [14, 22, 31, 36], janela: "Open Cup" },
    uefa_cl: { modelo: "europeu", liga: [6, 9, 12, 15, 18, 21, 24, 27], mata: { "Playoff": [30, 31], "Oitavos de Final": [34, 35], "Quartas de Final": [37, 38], "Semifinal": [40, 41], "Final": [44] }, janela: "Champions League" },
    uefa_el: { modelo: "europeu", liga: [6, 9, 12, 15, 18, 21, 24, 27], mata: { "Playoff": [29, 30], "Oitavos de Final": [33, 34], "Quartas de Final": [36, 37], "Semifinal": [39, 40], "Final": [43] }, janela: "Europa League" },
    uefa_col: { modelo: "europeu", liga: [6, 9, 12, 15, 18, 21, 24, 27], mata: { "Playoff": [28, 29], "Oitavos de Final": [32, 33], "Quartas de Final": [35, 36], "Semifinal": [38, 39], "Final": [42] }, janela: "Conference League" },
    conmebol_lib: { modelo: "ano", grupos: [12, 16, 20, 24, 28, 32], mata: { "Oitavos de Final": [35, 36], "Quartas de Final": [38, 39], "Semifinal": [41, 42], "Final": [43] }, janela: "Libertadores" },
    conmebol_sul: { modelo: "ano", grupos: [12, 16, 20, 24, 28, 32], mata: { "Oitavos de Final": [34, 35], "Quartas de Final": [37, 38], "Semifinal": [40, 41], "Final": [42] }, janela: "Sul-Americana" },
    concacaf_clc: { modelo: "ano", grupos: [8, 11, 14, 17, 20, 23], mata: { "Semifinal": [28, 29], "Final": [33] }, janela: "Concacaf Champions Cup" },
    afc_cla: { modelo: "europeu", grupos: [8, 11, 14, 17, 20, 23], mata: { "Oitavos de Final": [29, 30], "Quartas de Final": [33, 34], "Semifinal": [37, 38], "Final": [41] }, janela: "AFC Champions" },
    uefa_supercup: { modelo: "europeu", slots: [2], mata: { "Final": [2] }, janela: "Supercopa da UEFA" },
    conmebol_recopa: { modelo: "ano", slots: [5, 6], mata: { "Final": [5, 6] }, janela: "Recopa Sul-Americana" },
    intercontinental_cup: { modelo: "ano", slots: [44, 45, 46], mata: { "Playoff Intercontinental": [44], "Final do Desafiante": [45], "Final": [46] }, janela: "Copa Intercontinental da FIFA" }
};

const CALENDARIO_SELECOES_REALISTA = {
    // 🤝 Só os amistosos continuam espalhados ao longo do ano (janelas normais
    // de "Data FIFA"). Tudo o resto — eliminatórias, Nations League, e todos
    // os torneios continentais — agora fica concentrado no FINAL da
    // temporada, sem competições internacionais "a sério" no meio do ano.
    amistoso: { modelo: "europeu", slots: [7, 13, 22, 31, 44], janela: "Data FIFA" },
    eliminatorias_uefa: { modelo: "europeu", slots: [44, 45, 46, 47, 48], janela: "Eliminatorias UEFA" },
    eliminatorias_conmebol: { modelo: "europeu", slots: [44, 45, 46, 47, 48], janela: "Eliminatorias CONMEBOL" },
    eliminatorias_concacaf: { modelo: "europeu", slots: [44, 45, 46, 47, 48], janela: "Eliminatorias CONCACAF" },
    eliminatorias_caf: { modelo: "europeu", slots: [44, 45, 46, 47, 48], janela: "Eliminatorias CAF" },
    eliminatorias_afc: { modelo: "europeu", slots: [44, 45, 46, 47, 48], janela: "Eliminatorias AFC" },
    eliminatorias_ofc: { modelo: "europeu", slots: [44, 45, 46, 47, 48], janela: "Eliminatorias OFC" },
    euro_qualy: { modelo: "europeu", slots: [44, 45, 46, 47, 48], janela: "Eliminatorias da Euro" },
    nations_a: { modelo: "europeu", slots: [44, 45, 46, 47], janela: "Nations League" },
    nations_b: { modelo: "europeu", slots: [44, 45, 46, 47], janela: "Nations League" },
    nations_c: { modelo: "europeu", slots: [44, 45, 46, 47], janela: "Nations League" },
    nations_d: { modelo: "europeu", slots: [44, 45, 46, 47], janela: "Nations League" },
    copa_mundo: { modelo: "europeu", slots: [45, 46, 47, 48, 49, 50, 51], janela: "Copa do Mundo" },
    euro: { modelo: "europeu", slots: [45, 46, 47, 48, 49, 50, 51], janela: "Eurocopa" },
    copa_america: { modelo: "europeu", slots: [45, 46, 47, 48, 49, 50], janela: "Copa America" },
    gold_cup: { modelo: "europeu", slots: [45, 46, 47, 48, 49], janela: "Gold Cup" },
    copa_africa: { modelo: "europeu", slots: [45, 46, 47, 48, 49], janela: "Copa Africana" },
    copa_asia: { modelo: "europeu", slots: [45, 46, 47, 48, 49], janela: "Copa da Asia" },
    oceania_cup: { modelo: "europeu", slots: [45, 46, 47, 48], janela: "Copa das Nacoes da Oceania" },
    olimpiadas: { modelo: "europeu", slots: [49, 50, 51, 52], janela: "Olimpiadas" }
};

function obterPerfilCalendarioPais(pais) {
    return { ...CALENDARIO_PERFIS_PAIS.default, ...(CALENDARIO_PERFIS_PAIS[pais] || {}) };
}

function obterConfigCalendarioCompeticao(compId) {
    const cfg = CALENDARIO_COMPETICOES_REALISTAS[compId];
    if (cfg) return cfg;
    const perfil = obterPerfilCalendarioPais(obterPaisCompeticaoId(compId));
    return { modelo: perfil.modelo, slots: perfil.copaSlots, janela: "Calendario nacional" };
}

function infoSlotCalendario(slot, modelo = "europeu") {
    const base = Math.max(1, Math.floor(Number(slot) || 1));
    const blocos = CALENDARIO_MODELOS[modelo] || CALENDARIO_MODELOS.europeu;
    const info = blocos.find(b => base >= b.de && base <= b.ate) || blocos[blocos.length - 1];
    const semana = Math.max(1, base - info.de + 1);
    return { ...info, semana, slot: base };
}

function anoDoSlotCalendario(slot, modelo = "europeu") {
    const base = Math.floor(Number(slot) || 1);
    return modelo === "europeu" && base >= 22 ? anoAtual + 1 : anoAtual;
}

function formatarDataCalendario(evento) {
    const slot = evento?.slot || rodadaAtual;
    const modelo = evento?.calendarioModelo || obterConfigCalendarioCompeticao(evento?.compId || "")?.modelo || "europeu";
    const info = infoSlotCalendario(slot, modelo);
    return `${info.mes} ${anoDoSlotCalendario(slot, modelo)} • ${evento?.janelaCalendario || info.periodo}`;
}

function distribuirSlots(qtd, inicio, fim) {
    if (qtd <= 1) return [fim];
    const passo = (fim - inicio) / (qtd - 1);
    return Array.from({ length: qtd }, (_, i) => Number((inicio + passo * i).toFixed(2)));
}

function indiceFaseCalendario(fase = "") {
    const f = normalizarTexto(fase);
    if (f.includes("oitav")) return 0;
    if (f.includes("quart")) return 1;
    if (f.includes("semi")) return 2;
    if (f.includes("final")) return 3;
    return 0;
}

function obterSlotCopaCalendario(compId, fase = "", perna = 1) {
    const cfg = obterConfigCalendarioCompeticao(compId);
    const slots = cfg.slots || obterPerfilCalendarioPais(obterPaisCompeticaoId(compId)).copaSlots;
    const idx = Math.min(indiceFaseCalendario(fase), Math.max(0, slots.length - 1));
    return Number((slots[idx] + (perna === 2 ? 0.35 : 0)).toFixed(2));
}

function obterSlotContinentalCalendario(compId, fase = "", perna = 1, rodadaGrupo = 1) {
    const cfg = CALENDARIO_COMPETICOES_REALISTAS[compId] || {};
    if (fase === "Fase de Liga") {
        const liga = cfg.liga || cfg.grupos || [6, 9, 12, 15, 18, 21, 24, 27];
        return liga[Math.min(Math.max(rodadaGrupo - 1, 0), liga.length - 1)];
    }
    if (fase === "Grupos" || String(fase).includes("Grupo")) {
        const grupos = cfg.grupos || [7, 10, 13, 16, 19, 22];
        return grupos[Math.min(Math.max(rodadaGrupo - 1, 0), grupos.length - 1)];
    }
    const mata = cfg.mata || {};
    const chave = Object.keys(mata).find(k => normalizarTexto(fase).includes(normalizarTexto(k).split(" ")[0])) || fase;
    const slots = mata[chave] || mata[fase] || [34, 35];
    return Number((slots[Math.min(perna - 1, slots.length - 1)] || slots[0] || 34).toFixed(2));
}

function obterSlotCompeticaoCalendario(compId, fase = "", perna = 1, rodadaGrupo = 1) {
    const comp = competicoes.find(c => c.id === compId);
    if (comp?.tipo === "continental" || CALENDARIO_COMPETICOES_REALISTAS[compId]?.grupos || CALENDARIO_COMPETICOES_REALISTAS[compId]?.liga) {
        return obterSlotContinentalCalendario(compId, fase, perna, rodadaGrupo);
    }
    if (comp?.tipo === "supercopa") {
        const cfg = CALENDARIO_COMPETICOES_REALISTAS[compId];
        const perfil = obterPerfilCalendarioPais(obterPaisCompeticaoId(compId));
        return cfg?.slots?.[0] || perfil.supercopaSlot || 2;
    }
    return obterSlotCopaCalendario(compId, fase, perna);
}

function numeroPernasConfronto(compId, estado, fase = "") {
    if(estado?.jogoUnico) return 1;
    if(estado?.pernasFinal === 2 && normalizarTexto(fase || estado.fase).includes("final")) return 2;
    if(normalizarTexto(fase || estado?.fase).includes("final")) return 1;
    return 2;
}

function obterSlotCalendarioAtual() {
    return Number(agendaTemporada[rodadaAtual - 1]?.slot || rodadaAtual || 1);
}

function normalizarSlotFuturo(slot) {
    const atual = obterSlotCalendarioAtual();
    let alvo = Number(slot || atual + 1);
    if (rodadaAtual > 0 && alvo <= atual) alvo = Number((atual + 0.18).toFixed(2));
    return alvo;
}

function ordenarAgendaPreservandoPassado() {
    const corte = Math.max(0, rodadaAtual - 1);
    const passados = agendaTemporada.slice(0, corte);
    const futuros = agendaTemporada.slice(corte).sort((a, b) => (Number(a.slot) || 99) - (Number(b.slot) || 99) || (a.ordemCalendario || 0) - (b.ordemCalendario || 0));
    agendaTemporada = [...passados, ...futuros];
}

function adicionarEventoCalendario(evento, slot, janela = "", modelo = null) {
    const compId = evento.compConfigId || evento.compId;
    const cfg = evento.isSelecao ? (CALENDARIO_SELECOES_REALISTA[evento.compConfigId] || {}) : obterConfigCalendarioCompeticao(compId);
    const slotFinal = normalizarSlotFuturo(slot);
    const item = {
        ...evento,
        slot: slotFinal,
        janelaCalendario: janela || cfg.janela || evento.tipo,
        calendarioModelo: modelo || cfg.modelo || "europeu",
        ordemCalendario: agendaTemporada.length
    };
    item.dataCalendario = formatarDataCalendario(item);
    agendaTemporada.push(item);
    ordenarAgendaPreservandoPassado();
    return item;
}

function normalizarAgendaCalendario() {
    agendaTemporada.forEach((evento, idx) => {
        if (!evento.slot) evento.slot = idx + 1;
        if (!evento.calendarioModelo) {
            const cfg = evento.isSelecao ? CALENDARIO_SELECOES_REALISTA[evento.compConfigId] : obterConfigCalendarioCompeticao(evento.compId);
            evento.calendarioModelo = cfg?.modelo || "europeu";
        }
        
        // ❌ A LINHA DO dados.managerEstado FOI REMOVIDA DAQUI
        
        if (!evento.janelaCalendario) {
            const cfg = evento.isSelecao ? CALENDARIO_SELECOES_REALISTA[evento.compConfigId] : obterConfigCalendarioCompeticao(evento.compId);
            evento.janelaCalendario = cfg?.janela || infoSlotCalendario(evento.slot, evento.calendarioModelo).periodo;
        }
        evento.dataCalendario = formatarDataCalendario(evento);
        evento.ordemCalendario = evento.ordemCalendario ?? idx;
    });
}
function obterProximoSlotSelecao(compId, offset = 0) {
    const cfg = CALENDARIO_SELECOES_REALISTA[compId] || CALENDARIO_SELECOES_REALISTA.amistoso;
    const atual = obterSlotCalendarioAtual();
    const slotEncontrado = (cfg.slots || []).find(s => s > atual + 0.05);
    
    // Trava de segurança: se passou do slot 48 e não tem jogo oficial, limita ao teto de 52 semanas
    if (!slotEncontrado && atual >= 48) {
        return 52; 
    }
    
    const slot = slotEncontrado || (atual + 1 + offset);
    return Number((slot + offset * 0.15).toFixed(2));
}

function ehJanelaSelecaoCalendario(slot = obterSlotCalendarioAtual()) {
    const base = Math.floor(Number(slot) || 1);
    return Object.values(CALENDARIO_SELECOES_REALISTA).some(cfg => (cfg.slots || []).some(s => Math.floor(s) === base));
}

function normalizarNacionalidade(valor) {
    const n = normalizarTexto(String(valor || ""));
    if(n.includes("brasil")) return "Brasil";
    if(n.includes("argentina")) return "Argentina";
    if(n.includes("uruguai")) return "Uruguai";
    if(n.includes("col")) return "Colombia";
    if(n.includes("equador")) return "Equador";
    if(n.includes("portugal")) return "Portugal";
    if(n.includes("espan")) return "Espanha";
    if(n.includes("ital")) return "Italia";
    if(n.includes("ingla")) return "Inglaterra";
    if(n.includes("fran") || n.includes("frana")) return "França";
    if(n.includes("aleman") || n.includes("german")) return "Alemanha";
    if(n.includes("holanda") || n.includes("paises baixos")) return "Holanda";
    if(n.includes("belg")) return "Belgica";
    if(n.includes("turq")) return "Turquia";
    if(n.includes("mex")) return "Mexico";
    if(n.includes("estado") || n.includes("eua")) return "Estados Unidos";
    if(n.includes("senegal")) return "Senegal";
    if(n.includes("marro")) return "Marrocos";
    if(n.includes("jap")) return "Japao";
    if(n.includes("coreia")) return "Coreia do Sul";
    if(n.includes("chile")) return "Chile";
    if(n.includes("paragu")) return "Paraguai";
    if(n.includes("peru")) return "Peru";
    if(n.includes("venez")) return "Venezuela";
    if(n.includes("boliv")) return "Bolivia";
    if(n.includes("croac")) return "Croacia";
    if(n.includes("suic")) return "Suica";
    if(n.includes("austri")) return "Austria";
    if(n.includes("polon")) return "Polonia";
    if(n.includes("suec")) return "Suecia";
    if(n.includes("norue")) return "Noruega";
    if(n.includes("dinam")) return "Dinamarca";
    if(n.includes("serv")) return "Servia";
    if(n.includes("ucr")) return "Ucrania";
    if(n.includes("costa r")) return "Costa Rica";
    if(n.includes("canad")) return "Canada";
    if(n.includes("jamaic")) return "Jamaica";
    if(n.includes("egito")) return "Egito";
    if(n.includes("niger")) return "Nigeria";
    if(n.includes("camar")) return "Camaroes";
    if(n.includes("gana")) return "Gana";
    if(n.includes("argel")) return "Argelia";
    if(n.includes("austral")) return "Australia";
    if(n.includes("arab") || n.includes("saud")) return "Arabia Saudita";
    if(n.includes("ira") && !n.includes("irland")) return "Ira";
    if(n.includes("cata")) return "Catar";
    if(n.includes("costa")) return "Costa do Marfim";
    return valor || "Sem seleção";
}

function obterSelecaoPorNacionalidade(nacionalidade) {
    const alvo = normalizarNacionalidade(nacionalidade);
    return SELECOES.find(s => normalizarNacionalidade(s.pais) === alvo) || { id:`sel_${normalizarTexto(alvo).slice(0,3)}`, pais:alvo, nome:alvo, conf:"GLOBAL", logo:"", cor:"#00ff88" };
}

function obterDivisaoNations(selecao) {
    if(selecao.conf !== "UEFA") return null;
    if(selecoesEstado.nationsDiv?.[selecao.id]) return selecoesEstado.nationsDiv[selecao.id];
    const pais = normalizarNacionalidade(selecao.pais);
    const tierA = ["França", "Alemanha", "Espanha", "Inglaterra", "Italia", "Portugal", "Holanda", "Belgica"];
    const tierB = ["Turquia"];
    let div = tierA.includes(pais) ? "A" : tierB.includes(pais) ? "B" : "C";
    if(!selecoesEstado.nationsDiv) selecoesEstado.nationsDiv = {};
    selecoesEstado.nationsDiv[selecao.id] = div;
    return div;
}

function obterCompeticaoSelecao(selecao, ano = anoAtual, rodada = rodadaAtual) {
    const slotAtual = Math.floor(obterSlotCalendarioAtual());
    const janelaFinalTemporada = slotAtual >= 44;
    const janelaMeioAno = slotAtual >= 22 && slotAtual <= 28;

    if(ano % 4 === 2 && janelaFinalTemporada) return COMPETICOES_SELECOES.find(c => c.id === "copa_mundo");
    if(ano % 4 === 0 && slotAtual >= 49) return COMPETICOES_SELECOES.find(c => c.id === "olimpiadas");
    if(ano % 4 === 0 && janelaFinalTemporada && selecao.conf === "UEFA") return COMPETICOES_SELECOES.find(c => c.id === "euro");
    if(ano % 4 === 0 && janelaMeioAno && selecao.conf === "CONMEBOL") return COMPETICOES_SELECOES.find(c => c.id === "copa_america");
    if(ano % 4 === 0 && janelaMeioAno && selecao.conf === "CONCACAF") return COMPETICOES_SELECOES.find(c => c.id === "gold_cup");
    if(ano % 4 === 0 && slotAtual >= 22 && slotAtual <= 26 && selecao.conf === "CAF") return COMPETICOES_SELECOES.find(c => c.id === "copa_africa");
    if(ano % 4 === 0 && slotAtual >= 22 && slotAtual <= 26 && selecao.conf === "AFC") return COMPETICOES_SELECOES.find(c => c.id === "copa_asia");
    if(ano % 4 === 0 && janelaMeioAno && selecao.conf === "OFC") return COMPETICOES_SELECOES.find(c => c.id === "oceania_cup");
    if(selecao.conf === "UEFA" && ano % 2 === 1 && ehJanelaSelecaoCalendario(slotAtual)) {
        const div = (obterDivisaoNations(selecao) || "C").toLowerCase();
        return COMPETICOES_SELECOES.find(c => c.id === `nations_${div}`) || COMPETICOES_SELECOES.find(c => c.id === "nations_c");
    }
    if(selecao.conf === "UEFA" && ano % 4 === 3 && ehJanelaSelecaoCalendario(slotAtual)) return COMPETICOES_SELECOES.find(c => c.id === "euro_qualy");
    if(ano % 4 === 1 && ehJanelaSelecaoCalendario(slotAtual)) {
        const mapElim = { UEFA:"eliminatorias_uefa", CONMEBOL:"eliminatorias_conmebol", CONCACAF:"eliminatorias_concacaf", CAF:"eliminatorias_caf", AFC:"eliminatorias_afc", OFC:"eliminatorias_ofc" };
        return COMPETICOES_SELECOES.find(c => c.id === (mapElim[selecao.conf] || "eliminatorias_uefa"));
    }
    if(ehJanelaSelecaoCalendario(slotAtual)) return COMPETICOES_SELECOES.find(c => c.id === "amistoso");
    return COMPETICOES_SELECOES.find(c => c.id === "amistoso");
}

function obterJogadoresNacionalidade(pais) {
    const alvo = normalizarNacionalidade(pais);
    // 🛡️ FIX: antes o jogador humano entrava no plantel de QUALQUER país
    // (mesmo não sendo da nacionalidade dele), pois era sempre colocado à
    // frente do array sem checar a nacionalidade. Isso fazia com que, toda
    // vez que a IA simulava um jogo de OUTRA seleção qualquer, o motor de
    // estatísticas (obterPlantelSelecaoParaStatsIA/atribuirStatsPartidaSelecaoIA)
    // pudesse sortear o próprio jogador como autor de jogo/gol/assistência
    // daquele país, inflando jogos/gols da seleção do jogador para valores
    // absurdos (ex: 500 jogos, 700 gols) mesmo tendo jogado só 1 partida real.
    const souDesseTime = jogador && normalizarNacionalidade(jogador.nacionalidade) === alvo;
    return [...(souDesseTime ? [jogador] : []), ...jogadoresIA.filter(j => !j.aposentado && normalizarNacionalidade(j.nacionalidade) === alvo)];
}

function calcularForcaSelecao(selecaoId, sub23 = false) {
    const sel = SELECOES.find(s => s.id === selecaoId);
    if (!sel) return 70;
    let pool = obterJogadoresNacionalidade(sel.pais).filter(j => !j.aposentado);
    if (sub23) {
        const u23 = pool.filter(j => j.idade <= 23).sort((a, b) => (b.geral || 0) - (a.geral || 0));
        const over = pool.filter(j => j.idade > 23).sort((a, b) => (b.geral || 0) - (a.geral || 0)).slice(0, 3);
        pool = [...u23.slice(0, 11), ...over].slice(0, 14);
    } else {
        pool = pool.sort((a, b) => (b.geral || 0) - (a.geral || 0)).slice(0, 14);
    }
    if (pool.length === 0) return 68;
    return pool.reduce((acc, j) => acc + (j.geral || 60), 0) / pool.length;
}

function registrarPlantelTorneio(torneioKey, selecaoId, ids) {
    if(!selecoesEstado.planteisTorneio[torneioKey]) selecoesEstado.planteisTorneio[torneioKey] = {};
    const atual = new Set(selecoesEstado.planteisTorneio[torneioKey][selecaoId] || []);
    ids.forEach(id => atual.add(id));
    selecoesEstado.planteisTorneio[torneioKey][selecaoId] = [...atual];
}

function concederTituloInternacional(selecaoId, nomeComp, torneioKey) {
    const compId = selecoesEstado.torneios?.[torneioKey]?.compConfigId;
    if (isEliminatoria(compId)) return;
    if(!selecoesEstado.campeoes[selecaoId]) selecoesEstado.campeoes[selecaoId] = [];
    selecoesEstado.campeoes[selecaoId].unshift({ ano: anoAtual, nome: nomeComp, torneioKey });
    const pontosTitulo = pontosTituloSelecao(compId);
    let plantel = selecoesEstado.planteisTorneio[torneioKey]?.[selecaoId] || [];
    // 🛡️ FIX: o plantel só era registado para a MINHA própria seleção (e só
    // se eu tivesse sido convocado nessa janela específica) — para qualquer
    // outra seleção campeã (ex: a do "Bruno" nesse exemplo), o plantel ficava
    // vazio e NINGUÉM recebia o troféu nem as estatísticas. Se estiver vazio,
    // reconstrói um plantel plausível na hora, usando o mesmo critério de
    // convocação normal.
    if (plantel.length === 0) {
        const selFallback = SELECOES.find(s => s.id === selecaoId);
        if (selFallback) {
            const compFallback = COMPETICOES_SELECOES.find(c => c.nome === nomeComp) || { id: compId };
            plantel = gerarConvocacaoSelecao(selFallback, compFallback).convocados.map(p => p.id);
        }
    }
    plantel.forEach(pid => {
        const p = pid === "player" ? jogador : jogadoresIA.find(j => j.id === pid);
        if(!p) return;
        if(!p.titulosSelecao) p.titulosSelecao = [];
        p.titulosSelecao.unshift({ ano: anoAtual, selecao: SELECOES.find(s=>s.id===selecaoId)?.nome || "", trofeu: nomeComp });
        if(p.historicoCarreira?.[0]) {
            p.historicoCarreira[0].trofeus = p.historicoCarreira[0].trofeus === "-" ? nomeComp : p.historicoCarreira[0].trofeus + ", " + nomeComp;
        }
        p.pontosPremio = (p.pontosPremio || 0) + pontosTitulo;
        p.pontosPremioTemporada = (p.pontosPremioTemporada || 0) + pontosTitulo;
        if (pid === "player") window.tocarSom('trofeu'); // 🔊 som de troféu quando é o jogador humano
        
        // Push achievement to Firebase if this is the human player and online mode is active
        if (pid === "player" && window.firebaseIntegration && window.firebaseIntegration.isOnlineMode()) {
            window.firebaseIntegration.pushAchievementToFirebase(nomeComp, nomeComp);
        }
        // 🌐 Se quem ganhou foi o AMIGO online (o seu perfil sincronizado está
        // dentro de jogadoresIA com isFirebasePlayer), avisa-o também — mesmo
        // mecanismo usado para os troféus de clube/Bola de Ouro na Gala.
        if (p.isFirebasePlayer && window.firebaseIntegration && window.firebaseIntegration.pushAchievementForPlayerToFirebase) {
            window.firebaseIntegration.pushAchievementForPlayerToFirebase(p.id, nomeComp, nomeComp);
        }
    });
    const sel = SELECOES.find(s => s.id === selecaoId);
    registrarNoticia(`${sel?.nome || "Seleção"} campeã!`, `A Seleção ${sel?.nome} conquistou a ${nomeComp} ${anoAtual}!`, "Seleções", nomeComp, "trofeu", true);
}

function selecionarTimesTorneio(fmt, compConfig) {
    let pool = [...SELECOES];
    if(fmt.conf) pool = pool.filter(s => s.conf === fmt.conf);
    if(fmt.formato === "nations_grupos") pool = pool.filter(s => s.conf === "UEFA");
    else if(fmt.div) pool = pool.filter(s => (obterDivisaoNations(s) || "C") === fmt.div);
    if(fmt.sub23) pool = pool.map(s => ({ ...s, forca: calcularForcaSelecao(s.id) * 0.92 }));
    pool.sort((a,b) => calcularForcaSelecao(b.id) - calcularForcaSelecao(a.id));
    const max = fmt.grupos ? fmt.grupos * fmt.porGrupo : (fmt.maxTimes || pool.length);
    return pool.slice(0, max).map(criarTimeTorneio);
}

function criarGruposTorneio(times, fmt) {
    const grupos = [];
    const shuffled = [...times].sort(() => Math.random() - 0.5);
    for (let g = 0; g < fmt.grupos; g++) {
        const slice = shuffled.slice(g * fmt.porGrupo, (g + 1) * fmt.porGrupo);
        if (slice.length < 2) continue;
        grupos.push({ nome: `Grupo ${String.fromCharCode(65 + g)}`, equipas: slice.map(t => ({ id: t.id, nome: t.nome, pts: 0, j: 0, gf: 0, gs: 0 })) });
    }
    return grupos;
}

function inicializarTorneioInternacional(compConfig) {
    const fmt = FORMATOS_INT[compConfig.id];
    if (!fmt || fmt.formato === "amistoso") return null;
    const key = chaveTorneio(compConfig.id, anoAtual);
    if (selecoesEstado.torneios[key]) return selecoesEstado.torneios[key];

    const times = selecionarTimesTorneio(fmt, compConfig);
    const estado = { compConfigId: compConfig.id, nome: compConfig.nome, ano: anoAtual, historicoFases: [], cor: CORES_COMP[compConfig.id] || CORES_COMP.default };

    if (["grupos_mata", "grupos", "nations_grupos"].includes(fmt.formato)) {
        estado.tipo = "grupos";
        estado.fase = "Fase de Grupos";
        estado.grupos = criarGruposTorneio(times, fmt);
        estado.rodadaAtual = 1;
        estado.maxRodadas = fmt.jogosGrupo || 3;
        estado.avancam = fmt.avancam || fmt.avancamTop || 2;
        estado.fmtInterno = fmt.formato;
    } else if (fmt.formato === "liga") {
        estado.tipo = "liga";
        estado.fase = compConfig.nome;
        estado.tabela = times.map(t => ({ id: t.id, nome: t.nome, pts: 0, j: 0, gf: 0, gs: 0 }));
        estado.rodadaAtual = 1;
        estado.maxRodadas = fmt.jogosRound ? times.length - 1 : 4;
    }

    selecoesEstado.torneios[key] = estado;
    return estado;
}

function obterCompeticoesAtivasTemporada(ano = anoAtual) {
    // 🛡️ FIX: as competições de BASE (Sub-17/Sub-21) vivem numa lista à parte
    // (COMPETICOES_SELECOES_BASE) — sem juntar as duas listas aqui, elas nunca
    // apareciam no dashboard de Competições Internacionais, mesmo já estando
    // ativas no calendário (idsCompeticoesAtivas).
    const todasAsCompeticoes = [...COMPETICOES_SELECOES, ...COMPETICOES_SELECOES_BASE];
    return idsCompeticoesAtivas(ano).map(id => todasAsCompeticoes.find(c => c.id === id)).filter(Boolean);
}

function atualizarRankingFIFA() {
    selecoesEstado.ranking = [...SELECOES]
        .map(s => ({ id: s.id, nome: s.nome, forca: Math.round(calcularForcaSelecao(s.id)) }))
        .sort((a, b) => b.forca - a.forca)
        .map((x, i) => ({ ...x, pos: i + 1 }));
}

function inicializarTodosTorneiosTemporada() {
    obterCompeticoesAtivasTemporada().forEach(comp => inicializarTorneioInternacional(comp));
    atualizarRankingFIFA();
}

function processarFimGruposInternacional(key, estado, fmt) {
    arquivarFaseInt(key);
    
    // 1️⃣ CASO: NATIONS LEAGUE (GRUPO E MATA-MATA/REBAIXAMENTO)
    if (fmt.formato === "nations_grupos") {
        const classificados = [], rebaixados = [];
        
        estado.grupos.forEach(grp => {
            grp.equipas.sort((a, b) => b.pts - a.pts || (b.gf - b.gs) - (a.gf - a.gs));
            
            // Primeiros colocados vão para o mata-mata
            classificados.push(criarTimeTorneio(SELECOES.find(s => s.id === grp.equipas[0].id)), criarTimeTorneio(SELECOES.find(s => s.id === grp.equipas[1].id)));
            
            // Últimos colocados vão para a lista de rebaixamento
            if (grp.equipas[3]) rebaixados.push(grp.equipas[3].id);
        });
        
        const confrontos = [];
        const flat = classificados.filter(Boolean);
        flat.sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < flat.length; i += 2) {
            if (flat[i + 1]) confrontos.push({ timeA: flat[i], timeB: flat[i + 1], golsA: null, golsB: null, vencedorId: null, penaltis: false });
        }
        
        estado.tipo = "mata-mata";
        estado.fase = "Quartas de Final (Nations A)";
        estado.confrontos = confrontos;
        delete estado.grupos;
        
        // CORREÇÃO DO REB: Movido para cima do uso!
        const reb = rebaixados.filter(Boolean);
        if (reb.length >= 2) {
            estado.rebaixamento = { confrontos: [{ timeA: reb[0], timeB: reb[1], golsA: null, golsB: null, vencedorId: null }, { timeA: reb[2], timeB: reb[3] || reb[0], golsA: null, golsB: null, vencedorId: null }].filter(c => c.timeB) };
        }

        // AGENDAMENTO NO CALENDÁRIO GLOBAL
        agendarMataMataNoCalendario(key, confrontos);
        return;
    }
    
    // 2️⃣ CASO: ELIMINATÓRIAS PURAS (APENAS GRUPOS PARA DEFINIR VAGAS)
    if (fmt.eliminatoria && fmt.formato === "grupos") {
        const classificados = [];
        estado.grupos.forEach(grp => {
            grp.equipas.sort((a, b) => b.pts - a.pts || (b.gf - b.gs) - (a.gf - a.gs));
            for (let i = 0; i < (fmt.avancam || 1); i++) {
                if (grp.equipas[i]?.id) classificados.push(grp.equipas[i].id);
            }
        });
        estado.fase = "Vagas Definidas";
        estado.classificados = classificados;
        const dest = anoTorneioDestino(estado.compConfigId, estado.ano);
        const destId = fmt.destino || "copa_mundo";
        if (dest) {
            if (!selecoesEstado.vagasTorneio) selecoesEstado.vagasTorneio = {};
            selecoesEstado.vagasTorneio[`${destId}_${dest}`] = [...classificados];
        }
        delete estado.grupos;
        return;
    }
    
    // 3️⃣ CASO: TORNEIOS CONTINENTAIS / MUNDIAL (GRUPOS + MATA-MATA)
    if (fmt.formato === "grupos_mata" || (fmt.formato === "grupos" && fmt.avancam >= 2 && !fmt.eliminatoria)) {
        const classificados = [];
        estado.grupos.forEach(grp => {
            grp.equipas.sort((a, b) => b.pts - a.pts || (b.gf - b.gs) - (a.gf - a.gs));
            for (let i = 0; i < (fmt.avancam || 2); i++) {
                const sel = SELECOES.find(s => s.id === grp.equipas[i]?.id);
                if (sel) classificados.push(criarTimeTorneio(sel));
            }
        });
        
        const confrontos = [];
        const flat = classificados.filter(Boolean);
        flat.sort(() => Math.random() - 0.5); // Sorteio das chaves
        
        for (let i = 0; i < flat.length; i += 2) {
            if (flat[i + 1]) confrontos.push({ timeA: flat[i], timeB: flat[i + 1], golsA: null, golsB: null, vencedorId: null, penaltis: false });
        }
        
        estado.tipo = "mata-mata";
        estado.fase = flat.length >= 16 ? "Oitavas de Final" : flat.length >= 8 ? "Oitavas de Final" : "Quartos de Final";
        estado.confrontos = confrontos;
        delete estado.grupos;
        
        // AGENDAMENTO NO CALENDÁRIO GLOBAL (Faz o jogo contra o Palmeiras ou outras ligas rodar!)
        agendarMataMataNoCalendario(key, confrontos);
        return;
    }
    
    // 4️⃣ CASO: CLASSIFICAÇÃO DEFINIDA POR PONTOS CORRIDOS
    estado.fase = "Classificação Definida";
    estado.classificados = estado.grupos.map(grp => {
        grp.equipas.sort((a, b) => b.pts - a.pts || (b.gf - b.gs) - (a.gf - a.gs));
        return grp.equipas[0]?.id;
    }).filter(Boolean);
    
    if (isEliminatoria(estado.compConfigId)) {
        const dest = anoTorneioDestino(estado.compConfigId, estado.ano);
        const destId = FORMATOS_INT[estado.compConfigId]?.destino || "copa_mundo";
        if (dest) {
            if (!selecoesEstado.vagasTorneio) selecoesEstado.vagasTorneio = {};
            const chaveVaga = `${destId}_${dest}`;
            const existentes = new Set(selecoesEstado.vagasTorneio[chaveVaga] || []);
            estado.classificados.forEach(id => existentes.add(id));
            selecoesEstado.vagasTorneio[chaveVaga] = [...existentes];
        }
    }
}

// 🛡️ FUNÇÃO AUXILIAR PARA INJETAR OS CONFRONTOS NA AGENDA PRINCIPAL DO JOGO
function agendarMataMataNoCalendario(competicaoId, confrontos) {
    if (!window.agendaTemporada) window.agendaTemporada = [];

    confrontos.forEach((inf, index) => {
        window.agendaTemporada.push({
            id: `mata_${competicaoId}_${window.anoAtual}_${index}`,
            competicaoId: competicaoId,
            timeHome: inf.timeA,
            timeAway: inf.timeB,
            placarHome: null,
            placarAway: null,
            rodada: window.rodadaAtual + 1, // Agenda para a rodada seguinte imediata
            status: "agendado"
        });
    });
    
    console.log(`Mata-mata de ${competicaoId} injetado com sucesso na agenda da temporada!`);
}

function arquivarFaseInt(key) {
    const e = selecoesEstado.torneios[key]; if(!e) return;
    if(!e.historicoFases) e.historicoFases = [];
    e.historicoFases.push(JSON.parse(JSON.stringify({ tipo: e.tipo, fase: e.fase, grupos: e.grupos, confrontos: e.confrontos, tabela: e.tabela })));
}

function avancarMataMataInternacional(key) {
    const estado = selecoesEstado.torneios[key];
    const vencedores = (estado.confrontos || []).map(c => c.vencedorId).filter(Boolean);
    if(!vencedores.length) return;
    arquivarFaseInt(key);
    const times = vencedores.map(id => SELECOES.find(s => s.id === id)).filter(Boolean).map(criarTimeTorneio);
    let novaFase = "Oitavas de Final";
    if(times.length >= 8) novaFase = "Quartos de Final";
    else if(times.length >= 4) novaFase = "Semifinal";
    else if(times.length === 2) novaFase = "Final";
    else if(times.length === 1) {
        estado.fase = "Campeão Definido"; estado.campeaoId = times[0].id; estado.confrontos = [];
        concederTituloInternacional(times[0].id, estado.nome, key);
        return;
    }
    const confrontos = [];
    times.sort(() => Math.random() - 0.5);
    for(let i = 0; i < times.length; i += 2) {
        if(times[i+1]) confrontos.push({ timeA: times[i], timeB: times[i+1], golsA: null, golsB: null, vencedorId: null, penaltis: false });
    }
    estado.tipo = "mata-mata"; estado.fase = novaFase; estado.confrontos = confrontos; delete estado.grupos;
}

function simularRodadaGruposInt(estado) {
    const fmt = FORMATOS_INT[estado.compConfigId] || {};
    const sub23 = !!fmt.sub23;
    estado.grupos.forEach(grp => {
        const eq = [...grp.equipas].sort(() => Math.random() - 0.5);
        for (let i = 0; i < eq.length - 1; i += 2) {
            
            // 👇 ESCUDO: Se o grupo ficar com número ímpar de times, evita o crash
            if (!eq[i] || !eq[i + 1]) continue; 
            
            if (eq[i].id === jogador?.selecaoId || eq[i + 1].id === jogador?.selecaoId) continue;
            const fA = calcularForcaSelecao(eq[i].id, sub23), fB = calcularForcaSelecao(eq[i + 1].id, sub23);
            const { gA, gB } = simularPlacarSelecao(fA, fB);
            eq[i].j++; eq[i + 1].j++;
            eq[i].gf += gA; eq[i].gs += gB; eq[i + 1].gf += gB; eq[i + 1].gs += gA;
            if (gA > gB) eq[i].pts += 3; else if (gB > gA) eq[i + 1].pts += 3; else { eq[i].pts++; eq[i + 1].pts++; }
            // 🛡️ FIX: atribui o jogo/gols/assistências a jogadores reais de cada seleção.
            atribuirStatsPartidaSelecaoIA(eq[i].id, eq[i + 1].id, gA, gB);
        }
    });
}

function simularConfrontoMataMataInt(conf, sub23 = false) {
    if (conf.vencedorId) return;
    if (!conf.timeA || !conf.timeB) { 
        conf.vencedorId = conf.timeA ? conf.timeA.id : (conf.timeB ? conf.timeB.id : "WO"); 
        return; }
    if (conf.timeA.id === jogador?.selecaoId || conf.timeB.id === jogador?.selecaoId) return;
    const fA = calcularForcaSelecao(conf.timeA.id, sub23), fB = calcularForcaSelecao(conf.timeB.id, sub23);
    const { gA, gB } = simularPlacarSelecao(fA, fB, true);
    conf.golsA = gA; conf.golsB = gB;
    const res = resolverVencedorMataMata(conf.timeA.id, conf.timeB.id, gA, gB, fA, fB);
    conf.vencedorId = res.vencedorId; conf.penaltis = res.penaltis; conf.placarPen = res.placarPen;
    // 🛡️ FIX: atribui o jogo/gols/assistências a jogadores reais de cada seleção.
    atribuirStatsPartidaSelecaoIA(conf.timeA.id, conf.timeB.id, gA, gB);
}

function processarRebaixamentoNations(estado, key) {
    const reb = estado.rebaixamento;
    if (!reb?.confrontos) return;
    reb.confrontos.forEach(c => simularConfrontoMataMataInt(c));
    reb.confrontos.forEach(c => {
        if (c.vencedorId) return;
        const perdedor = c.timeA.id;
        if (!selecoesEstado.nationsDiv) selecoesEstado.nationsDiv = {};
        selecoesEstado.nationsDiv[perdedor] = "B";
    });
    delete estado.rebaixamento;
}

// Helper function to determine if a tournament should advance in the current global round
function shouldTournamentAdvanceThisRound(compId, estado, maxRod) {
    // Check if player has an active fixture in this tournament for the current round
    const hasPlayerFixture = agendaTemporada.some(a =>
        a.compId === compId &&
        a.isSelecao &&
        (a.adversarioId === jogador?.selecaoId || a.mandanteId === jogador?.selecaoId)
    );

    // If player has a fixture, always advance
    if (hasPlayerFixture) return true;

    // CRITICAL FIX: Ensure international tournaments advance exactly ONE round per global round
    // Track last advanced round to prevent skipping
    if (!estado.lastAdvancedRound) {
        estado.lastAdvancedRound = 0;
    }

    const isInternationalTournament = compId.includes("copa_mundo") || 
                                      compId.includes("euro") || 
                                      compId.includes("copa_america") ||
                                      compId.includes("afcup") ||
                                      compId.includes("nations") ||
                                      compId.includes("libertadores") ||
                                      compId.includes("champions");

    if (isInternationalTournament) {
        // Only advance if we haven't advanced in the current global round yet
        // This ensures exactly one match day per global round click
        if (estado.lastAdvancedRound < rodadaAtual) {
            estado.lastAdvancedRound = rodadaAtual;
            return true;
        }
        return false;
    }

    // For domestic cups, advance with lower probability
    return Math.random() < 0.25;
}

// 🛡️ FIX: verifica se o jogador ainda tem algum jogo AGENDADO (mas ainda não
// disputado) nesta competição de seleções. Usado para impedir que a fase de
// grupos/liga feche e elimine o jogador antes que os seus jogos marcados no
// calendário (que seguem as janelas internacionais reais, bem mais espaçadas
// que o ritmo semanal da simulação da IA) cheguem a ser disputados.
function existePendenteJogadorNoTorneio(compId) {
    if (!jogador?.selecaoId) return false;
    return agendaTemporada.some((a, idx) =>
        idx >= (rodadaAtual - 1) &&
        a.isSelecao && a.compId === compId &&
        (a.adversarioId === jogador.selecaoId || a.mandanteId === jogador.selecaoId)
    );
}

function simularTorneiosInternacionais() {
    for (const [key, estado] of Object.entries(selecoesEstado.torneios || {})) {
        if (["Campeão Definido", "Classificação Definida", "Vagas Definidas"].includes(estado.fase)) continue;
        const fmt = FORMATOS_INT[estado.compConfigId] || {};
        const maxRod = estado.maxRodadas || fmt.jogosGrupo || 3;

        // CRITICAL FIX: Only advance ONE round per global round click
        // Check if this tournament should advance in the current global round
        const shouldAdvanceThisRound = shouldTournamentAdvanceThisRound(key, estado, maxRod);
        
        if (!shouldAdvanceThisRound) continue;

        if (estado.tipo === "grupos" && estado.grupos && estado.rodadaAtual <= maxRod) {
            simularRodadaGruposInt(estado);
            estado.rodadaAtual++;
            // 🛡️ FIX: só fecha a fase de grupos quando o jogador não tiver mais
            // nenhum jogo agendado e por disputar nesta competição — antes disso,
            // a simulação da IA fica "em espera" (sem avançar mais rodadas) até
            // que o jogo marcado no calendário realmente aconteça.
            if (estado.rodadaAtual > maxRod && (!existePendenteJogadorNoTorneio(key) || Math.floor(obterSlotCalendarioAtual()) >= 51)) {
                processarFimGruposInternacional(key, estado, fmt);
            }
        } else if (estado.tipo === "liga" && estado.tabela) {
            
            // 👇 ESCUDO ANTI-CRASH: Se a liga estiver vazia (ex: Nations D), encerra ela silenciosamente
            if (estado.tabela.length === 0) {
                estado.fase = "Campeão Definido"; 
                estado.campeaoId = "Nenhum";
                continue; 
            }

            const maxRodLiga = estado.maxRodadas || 4;
            if ((estado.rodadaAtual || 1) <= maxRodLiga) {
                const tab = [...estado.tabela].sort(() => Math.random() - 0.5);
                for (let i = 0; i < tab.length - 1; i += 2) {
                    if (!tab[i] || !tab[i+1]) continue; // Escudo extra de segurança na rodada
                    if (tab[i].id === jogador?.selecaoId || tab[i + 1].id === jogador?.selecaoId) continue;
                    const fA = calcularForcaSelecao(tab[i].id), fB = calcularForcaSelecao(tab[i + 1].id);
                    const { gA, gB } = simularPlacarSelecao(fA, fB);
                    tab[i].j++; tab[i + 1].j++;
                    tab[i].gf += gA; tab[i].gs += gB; tab[i + 1].gf += gB; tab[i + 1].gs += gA;
                    if (gA > gB) tab[i].pts += 3; else if (gB > gA) tab[i + 1].pts += 3; else { tab[i].pts++; tab[i + 1].pts++; }
                    // 🛡️ FIX: atribui o jogo/gols/assistências a jogadores reais de cada seleção.
                    atribuirStatsPartidaSelecaoIA(tab[i].id, tab[i + 1].id, gA, gB);
                }
                estado.rodadaAtual = (estado.rodadaAtual || 1) + 1;
            }
            
            // 🛡️ FIX: só fecha/coroa a liga quando o jogador não tiver mais jogo
            // agendado e por disputar nesta competição (mesmo motivo do fix acima
            // na fase de grupos — evita eliminar o jogador antes da hora real do
            // seu jogo marcado no calendário).
            if (estado.rodadaAtual > maxRodLiga && (!existePendenteJogadorNoTorneio(key) || Math.floor(obterSlotCalendarioAtual()) >= 51)) {
                estado.tabela.sort((a, b) => b.pts - a.pts || (b.gf - b.gs) - (a.gf - a.gs));
                const fmtLiga = FORMATOS_INT[estado.compConfigId] || {};
                
                if (isEliminatoria(estado.compConfigId)) {
                    const vagas = fmtLiga.vagas || 4;
                    estado.classificados = estado.tabela.slice(0, vagas).map(t => t.id);
                    estado.fase = "Vagas Definidas";
                    const dest = anoTorneioDestino(estado.compConfigId, estado.ano);
                    const destId = fmtLiga.destino || "copa_mundo";
                    if (dest) {
                        if (!selecoesEstado.vagasTorneio) selecoesEstado.vagasTorneio = {};
                        selecoesEstado.vagasTorneio[`${destId}_${dest}`] = [...estado.classificados];
                    }
                } else {
                    // 👇 ESCUDO EXTRA AO COROAR CAMPEÃO
                    if (estado.tabela.length > 0) {
                        const campeao = estado.tabela[0].id;
                        if (estado.compConfigId?.includes("nations_b")) {
                            if (!selecoesEstado.nationsDiv) selecoesEstado.nationsDiv = {};
                            selecoesEstado.nationsDiv[campeao] = "A";
                            selecoesEstado.nationsDiv[estado.tabela[estado.tabela.length - 1].id] = "C";
                        } else if (estado.compConfigId?.includes("nations_c")) {
                            if (!selecoesEstado.nationsDiv) selecoesEstado.nationsDiv = {};
                            selecoesEstado.nationsDiv[campeao] = "B";
                        }
                        if (estado.compConfigId === "nations_b" || estado.compConfigId === "nations_c" || estado.compConfigId === "nations_d") {
                            concederTituloInternacional(campeao, estado.nome, key);
                        }
                        estado.campeaoId = campeao;
                    }
                    estado.fase = "Campeão Definido"; 
                }
            }
        } else if (estado.tipo === "mata-mata" && estado.confrontos) {
            const sub23 = !!fmt.sub23;
            estado.confrontos.forEach(conf => simularConfrontoMataMataInt(conf, sub23));
            if (estado.rebaixamento) processarRebaixamentoNations(estado, key);
            if (estado.confrontos.every(c => c.vencedorId)) {
                if (estado.confrontos.length === 1) {
                    const campeao = estado.confrontos[0].vencedorId;
                    estado.fase = "Campeão Definido"; estado.campeaoId = campeao;
                    concederTituloInternacional(campeao, estado.nome, key);
                } else avancarMataMataInternacional(key);
            }
        }
    }
    atualizarRankingFIFA();
}
function agendarJogosInternacionais() {
    if(!jogador?.naSelecao || !jogador.selecaoId) return;

    // --- NOVA TRAVA DE FIM DE TEMPORADA ---
    const slotAtual = obterSlotCalendarioAtual();
    if (slotAtual >= 52) {
        return; // O ano acabou, não agenda mais nada para a seleção.
    }
    // --------------------------------------

    const selecao = obterSelecaoPorNacionalidade(jogador.nacionalidade);
    const comp = obterCompeticaoSelecao(selecao);
    
    // Proteção extra contra indefinidos
    if (!comp) return; 

    const fmt = FORMATOS_INT[comp.id];
    const cfgCal = CALENDARIO_SELECOES_REALISTA[comp.id] || CALENDARIO_SELECOES_REALISTA.amistoso;

    if(comp.id === "amistoso") {
        const rivais = SELECOES.filter(s => s.id !== selecao.id).sort(() => Math.random() - 0.5);
        const rival = rivais[0];
        const jaExiste = agendaTemporada.some(a => a.isSelecao && a.compConfigId === "amistoso" && Math.floor(a.slot || 0) === Math.floor(obterProximoSlotSelecao("amistoso")));
        if(rival && !jaExiste) {
            adicionarEventoCalendario({
                tipo: `Amistoso Internacional`, compId: `int_amistoso_${anoAtual}_${rodadaAtual}`, compConfigId: "amistoso",
                adversarioId: rival.id, isSelecao: true, isMataMata: false, mandanteId: selecao.id
            }, obterProximoSlotSelecao("amistoso"), cfgCal.janela, cfgCal.modelo);
        }
        return;
    }

    const key = chaveTorneio(comp.id, anoAtual);
    let estado = selecoesEstado.torneios[key] || inicializarTorneioInternacional(comp);
    if(!estado) return;

    const conv = selecoesEstado.convocacoes?.[0];
    if(conv?.convocado) registrarPlantelTorneio(key, selecao.id, conv.ids || ["player"]);

    if(estado.tipo === "grupos" && estado.grupos) {
        const meuGrupo = estado.grupos.find(g => g.equipas.some(e => e.id === selecao.id));
        if(meuGrupo) {
            meuGrupo.equipas.filter(e => e.id !== selecao.id).forEach((adv, idx) => {
                if(!agendaTemporada.find(a => a.isSelecao && a.adversarioId === adv.id && a.compId === key)) {
                    const slot = cfgCal.slots?.[idx] || obterProximoSlotSelecao(comp.id, idx);
                    adicionarEventoCalendario({
                        tipo: `${comp.nome} (${meuGrupo.nome})`, compId: key, compConfigId: comp.id,
                        adversarioId: adv.id, isSelecao: true, isMataMata: false, fase: "Grupos", mandanteId: selecao.id
                    }, slot, cfgCal.janela, cfgCal.modelo);
                }
            });
        }
    } else if(estado.tipo === "mata-mata" && estado.confrontos) {
    const conf = estado.confrontos.find(c => c.timeA && c.timeB && (c.timeA.id === selecao.id || c.timeB.id === selecao.id) && !c.vencedorId);
        if(conf) {
            const adv = conf.timeA.id === selecao.id ? conf.timeB : conf.timeA;
            // 🐛 FIX: faltava esta trava de duplicado — as ramificações "grupos" e
            // "liga" logo acima já verificavam antes de adicionar, mas esta não.
            // Como este mesmo confronto de mata-mata fica "pendente" (sem
            // vencedorId) durante várias semanas até ser disputado, cada chamada
            // de agendarJogosInternacionais() nesse meio tempo empurrava outra
            // cópia do MESMO jogo pro calendário — daí aparecerem 3, 4, 5 linhas
            // idênticas de "Quartos de Final vs Fulano" na agenda.
            if(!agendaTemporada.find(a => a.isSelecao && a.adversarioId === adv.id && a.compId === key && a.fase === estado.fase)) {
                const idxFase = indiceFaseCalendario(estado.fase);
                adicionarEventoCalendario({
                    tipo: `${comp.nome} (${estado.fase})`, compId: key, compConfigId: comp.id,
                    adversarioId: adv.id, isSelecao: true, isMataMata: true, fase: estado.fase, mandanteId: selecao.id, isFinal: estado.fase === "Final"
                }, cfgCal.slots?.[Math.min(idxFase + 3, cfgCal.slots.length - 1)] || obterProximoSlotSelecao(comp.id), cfgCal.janela, cfgCal.modelo);
            }
        }
    } else if(estado.tipo === "liga" && estado.tabela) {
        const rivais = estado.tabela.filter(t => t.id !== selecao.id).slice(0, 2);
        rivais.forEach((adv, idx) => {
            if(agendaTemporada.find(a => a.isSelecao && a.adversarioId === adv.id && a.compId === key)) return;
            adicionarEventoCalendario({
                tipo: `${comp.nome} (J${idx+1})`, compId: key, compConfigId: comp.id,
                adversarioId: adv.id, isSelecao: true, isMataMata: false, mandanteId: selecao.id
            }, cfgCal.slots?.[idx] || obterProximoSlotSelecao(comp.id, idx), cfgCal.janela, cfgCal.modelo);
        });
    }
}

function premiarLigasTemporada() {
    if (!selecoesEstado.premiosLigaAno) selecoesEstado.premiosLigaAno = {};
    const chaveAno = String(anoAtual);
    if (selecoesEstado.premiosLigaAno[chaveAno]?.concluido) return;

    competicoes.filter(c => c.tipo === "liga" && c.div === 1).forEach(liga => {
        if (selecoesEstado.premiosLigaAno[chaveAno]?.[liga.id]) return;
        const clubesLiga = new Set(clubes.filter(c => c.ligaId === liga.id).map(c => c.id));
        const pool = [jogador, ...jogadoresIA.filter(j => !j.aposentado && clubesLiga.has(j.clubeId))];
        const comStats = pool.map(p => {
            const st = p.statsCompeticoes?.[liga.id] || (p === jogador ? p.estatisticasAtuais : p.statsTemporada) || { gols: 0, assistencias: 0 };
            return { p, g: st.gols || 0, a: st.assistencias || 0 };
        });
        const art = [...comStats].sort((a, b) => b.g - a.g || b.a - a.a)[0];
        const ast = [...comStats].sort((a, b) => b.a - a.a || b.g - a.g)[0];
        if (!selecoesEstado.premiosLigaAno[chaveAno]) selecoesEstado.premiosLigaAno[chaveAno] = {};
        if (art?.g > 0) {
            const nomePremio = `Chuteira de Ouro — ${liga.nome}`;
            selecoesEstado.premiosLigaAno[chaveAno][liga.id] = { artilheiro: art.p.nome, gols: art.g };
            art.p.pontosPremio = (art.p.pontosPremio || 0) + 18;
            art.p.pontosPremioTemporada = (art.p.pontosPremioTemporada || 0) + 18;
            if (art.p.historicoCarreira?.[0]) art.p.historicoCarreira[0].trofeus = art.p.historicoCarreira[0].trofeus === "-" ? nomePremio : art.p.historicoCarreira[0].trofeus + ", " + nomePremio;
            registrarNoticia(nomePremio, `${art.p.nome} foi o artilheiro da ${liga.nome} com ${art.g} gols.`, "Prémios", { nome: art.p.nome, foto: art.p.foto }, "jogador");
            if ((art.p.id || "player") === "player") {
                evoluirAtributosEGeral(jogador, 2);
                jogador.moral = Math.min(100, jogador.moral + 12);
                jogador.pontosPremio = (jogador.pontosPremio || 0) + 18;
                jogador.valorMercadoNum = calcularValorMercadoJogador(jogador);
                mostrarToast("Chuteira de Ouro", `Artilheiro da ${liga.nome}! +2 OVR e visibilidade no mercado.`, "success");
            }
        }
        if (ast?.a > 0) {
            const nomePremio = `Garçom da Liga — ${liga.nome}`;
            ast.p.pontosPremio = (ast.p.pontosPremio || 0) + 14;
            ast.p.pontosPremioTemporada = (ast.p.pontosPremioTemporada || 0) + 14;
            if (ast.p.historicoCarreira?.[0]) ast.p.historicoCarreira[0].trofeus = ast.p.historicoCarreira[0].trofeus === "-" ? nomePremio : ast.p.historicoCarreira[0].trofeus + ", " + nomePremio;
            registrarNoticia(nomePremio, `${ast.p.nome} liderou as assistências da ${liga.nome} com ${ast.a}.`, "Prémios", { nome: ast.p.nome, foto: ast.p.foto }, "jogador");
            if ((ast.p.id || "player") === "player") {
                evoluirAtributosEGeral(jogador, 1);
                jogador.moral = Math.min(100, jogador.moral + 8);
                jogador.pontosPremio = (jogador.pontosPremio || 0) + 14;
                mostrarToast("Garçom da Liga", `Líder de assistências da ${liga.nome}!`, "success");
            }
        }
    });
    selecoesEstado.premiosLigaAno[chaveAno].concluido = true;
}

function resetarStatsNovaTemporada() {
    const zerar = (p) => {
        p.statsTemporada = { jogos: 0, gols: 0, assistencias: 0, notas: [] };
        p.statsCompeticoes = {};
        // pontosPremioTemporada mede apenas os méritos DESTA temporada (troféus + prêmios
        // conquistados agora), diferente de pontosPremio, que é o prestígio acumulado na carreira.
        p.pontosPremioTemporada = 0;
        if(p === jogador) p.estatisticasAtuais = { jogos: 0, gols: 0, assistencias: 0, defesas: 0, penaltisMarcados: 0, penaltisDefendidos: 0 };
    };
    zerar(jogador);
    jogadoresIA.forEach(j => { if(!j.aposentado) zerar(j); });
}

window.abrirPerfilSelecao = function(selecaoId) {
    const sel = SELECOES.find(s => s.id === selecaoId) || SELECOES.find(s => normalizarNacionalidade(s.pais) === normalizarNacionalidade(selecaoId));
    if(!sel) return;
    const titulos = selecoesEstado.campeoes?.[sel.id] || [];
    const rankPos = selecoesEstado.ranking?.find(r => r.id === sel.id)?.pos || "—";
    const forca = Math.round(calcularForcaSelecao(sel.id));
    // 🛡️ FIX: antes só mostrava os 15 primeiros — não dava para ver o elenco
    // completo da seleção. Agora mostra todos os jogadores elegíveis (com
    // scroll interno na lista, para não estourar o modal).
    const elenco = obterJogadoresNacionalidade(sel.pais).sort((a,b) => b.geral - a.geral);
    // 🛡️ FIX: troféus da seleção estavam pequenos demais (50x50) e sem
    // destaque nenhum — aumentado e com cartão maior/mais vistoso.
    const htmlTitulos = titulos.length ? `<div class="selecao-titulos-grid">${titulos.map(t => `
        <div class="card-conquista card-conquista-grande"><img src="${obterUrlImagem(t.nome, 'trofeu')}" class="trofeu-icon" style="width:92px;height:92px;"><div><strong style="color:var(--gold); font-size:1.15rem;">${t.nome}</strong><br><span style="color:#ccc; font-size:1rem;">${t.ano}</span></div></div>`).join("")}</div>`
        : `<p style="color:#aaa; padding:20px; text-align:center;">Nenhum título internacional registrado ainda.</p>`;
    const htmlElenco = elenco.map(p => `
        <div class="convocado-row" onclick="abrirPerfilJogador('${p.id}')">
            <img src="${obterUrlImagem(p,'jogador')}"><div><strong>${p.nome}</strong><br><small>OVR ${p.geral} • ${p.posicao}</small></div>
        </div>`).join("");
    const modal = document.getElementById("modalPerfilJogador");
    if(!modal) return;
    const inner = modal.querySelector(".modal-content") || modal.firstElementChild;
    inner.innerHTML = `
        <div style="display:flex; gap:24px; align-items:center; padding-bottom:20px; border-bottom:1px solid #333;">
            <img src="${sel.logo}" style="width:100px; border-radius:12px;" onerror="this.style.display='none'">
            <div><h1 style="margin:0; color:var(--theme-primary);">Seleção ${sel.nome}</h1>
            <p style="color:#aaa; margin:8px 0 0;">${sel.conf} • FIFA #${rankPos} • Força ${forca}</p></div>
            <button class="close-btn" onclick="document.getElementById('modalPerfilJogador').classList.add('oculto')">✖</button>
        </div>
        <h3 style="color:var(--gold);">🏆 Palmarés</h3>${htmlTitulos}
        <h3 style="color:var(--theme-primary); margin-top:24px;">Elenco completo (${elenco.length})</h3>
        <div style="max-height:420px; overflow-y:auto; padding-right:6px;">${htmlElenco}</div>`;
    modal.classList.remove("oculto");
};

function renderArvoreMataMata(confrontos, corComp = "#00ff88", faseLabel = "") {
    if (!confrontos?.length) return "";
    const label = faseLabel || (confrontos.length === 1 ? "Final" : confrontos.length === 2 ? "Semifinal" : confrontos.length === 4 ? "Quartas" : "Oitavas");
    const slots = confrontos.map(conf => {
        const jogado = conf.golsA !== null && conf.golsA !== undefined;
        const pen = conf.penaltis ? `<span class="penalty-badge">🎯 ${conf.placarPen || "Pênaltis"}</span>` : "";
        const meuJogo = conf.timeA?.id === jogador?.selecaoId || conf.timeB?.id === jogador?.selecaoId;
        const team = (t, gols, win) => {
            if (!t) return `<div class="bracket-slot-team tbd"><span class="bracket-slot-crest tbd-crest">?</span><span class="bracket-slot-name">A definir</span><span class="bracket-slot-goals">–</span></div>`;
            const elim = conf.vencedorId && conf.vencedorId !== t.id;
            return `<div class="bracket-slot-team ${win ? "winner" : ""} ${elim ? "eliminated" : ""}" onclick="abrirPerfilSelecao('${t.id}')">
                <img class="bracket-slot-crest" src="${t.logo || ""}" onerror="this.style.visibility='hidden'">
                <span class="bracket-slot-name">${t.nome}</span>
                <span class="bracket-slot-goals">${jogado ? gols : "–"}</span>
                ${win ? '<span class="bracket-slot-check">✓</span>' : ""}
            </div>`;
        };
        return `<div class="bracket-slot ${meuJogo ? "meu-jogo" : ""} ${jogado ? "concluido" : "pendente"}" style="--comp-cor:${corComp}">
            ${team(conf.timeA, conf.golsA, conf.vencedorId === conf.timeA?.id)}
            <div class="bracket-slot-mid"><span class="bracket-slot-vs">${jogado ? "FT" : "VS"}</span>${pen}</div>
            ${team(conf.timeB, conf.golsB, conf.vencedorId === conf.timeB?.id)}
        </div>`;
    }).join("");
    return `<div class="bracket-tree"><div class="bracket-round"><div class="bracket-round-label">${label}</div><div class="bracket-round-slots">${slots}</div></div></div>`;
}

function renderEtapasTorneio(tor) {
    const vistas = [...(tor.historicoFases || []).map(f => f.fase), tor.fase];
    const passos = vistas.filter((f, i) => i === 0 || f !== vistas[i - 1]);
    if (passos.length < 2) return "";
    return `<div class="comp-stepper">${passos.map((f, i) => {
        const atual = i === passos.length - 1;
        return `${i > 0 ? '<span class="comp-step-line"></span>' : ""}<div class="comp-step ${atual ? "atual" : "feito"}"><span class="comp-step-dot">${atual ? i + 1 : "✓"}</span><span class="comp-step-label">${f}</span></div>`;
    }).join("")}</div>`;
}

function rotuloFaseTorneo(tor) {
    if (tor.fase === "Vagas Definidas" || tor.fase === "Classificação Definida") return "Classificados definidos";
    if (tor.fase === "Campeão Definido" && isEliminatoria(tor.compConfigId)) return "Classificados definidos";
    return tor.fase;
}

function renderClassificadosElim(tor, cor) {
    const ids = tor.classificados || [];
    if (!ids.length) return "";
    const meta = metaCompeticao(tor.compConfigId, tor.ano);
    return `<div class="comp-vagas-banner" style="--comp-cor:${cor}">
        <span class="comp-vagas-icon">🎫</span>
        <div><strong>${meta.destinoNome ? `Classificados para ${meta.destinoNome} ${meta.destinoAno}` : "Vagas garantidas"}</strong>
        <div class="comp-vagas-flags">${ids.map(id => {
            const s = SELECOES.find(x => x.id === id);
            return s ? `<img src="${s.logo}" title="${s.nome}" onclick="abrirPerfilSelecao('${id}')">` : "";
        }).join("")}</div></div>
    </div>`;
}

// 🏆 Logo oficial de uma competição internacional, para usar no lugar dos
// emojis genéricos. Tenta primeiro o nome exato da competição (usa o mesmo
// catálogo de obterUrlImagem já usado para troféus de clube); eliminatórias
// não têm um logo próprio "oficial" de verdade, então cai para o logo do
// torneio de destino (ex: "Eliminatórias AFC" usa o logo da Copa do Mundo).
// Se mesmo assim não encontrar nada catalogado, devolve null (quem chama
// decide o fallback visual, normalmente meta.icon).
function obterLogoTorneioInternacional(nome, meta) {
    let url = obterUrlImagem(nome, 'trofeu');
    if (!url && meta?.destinoNome) url = obterUrlImagem(meta.destinoNome, 'trofeu');
    return url || null;
}

function renderTorneioInternacionalCompleto(tor, key) {
    const cor = tor.cor || CORES_COMP[tor.compConfigId] || CORES_COMP.default;
    const meta = metaCompeticao(tor.compConfigId, tor.ano);
    const logoTorneio = obterLogoTorneioInternacional(tor.nome, meta);
    const elim = isEliminatoria(tor.compConfigId);
    const prog = tor.tipo === "grupos" && tor.maxRodadas ? Math.min(100, Math.round(((tor.rodadaAtual || 1) - 1) / tor.maxRodadas * 100)) : (["Vagas Definidas", "Classificação Definida", "Campeão Definido"].includes(tor.fase) ? 100 : 50);
    let html = `<div class="comp-int-card comp-int-premium" style="--comp-cor:${cor}">
        <div class="comp-int-header">
            <div class="comp-int-title-block">
                ${logoTorneio ? `<img class="comp-int-icon" src="${logoTorneio}" alt="${tor.nome}" onerror="this.outerHTML='<span class=&quot;comp-int-icon&quot;>${meta.icon}</span>'">` : `<span class="comp-int-icon">${meta.icon}</span>`}
                <div><h3>${tor.nome}</h3>
                <p>${meta.subtitulo || `Temporada ${tor.ano}`}${elim ? " • Sem troféu — apenas vagas" : ""}</p></div>
            </div>
            <span class="meta-pill comp-fase-pill">${rotuloFaseTorneo(tor)}</span>
        </div>
        <div class="comp-progress-wrap"><div class="comp-progress-bar" style="width:${prog}%"></div></div>
        ${renderEtapasTorneio(tor)}`;
    let fasesHtml = "";
    if (tor.historicoFases?.length) tor.historicoFases.forEach(f => { fasesHtml += renderBlocoFaseInternacional(f, cor); });
    if (tor.tipo === "grupos" && tor.grupos) fasesHtml += renderBlocoFaseInternacional(tor, cor);
    else if (tor.tipo === "liga" && tor.tabela) {
        const ord = [...tor.tabela].sort((a, b) => b.pts - a.pts || (b.gf - b.gs) - (a.gf - a.gs));
        const cutoff = elim ? (FORMATOS_INT[tor.compConfigId]?.vagas || 4) : null;
        fasesHtml += `<div class="fase-bloco bracket-phase"><h4 class="bracket-title">${elim ? "Tabela — vagas em jogo" : "Classificação"}</h4>
        <div class="bracket-group-card comp-table-premium">
        <table class="grupo-table"><thead><tr><th class="col-pos">#</th><th class="col-team">Seleção</th><th>P</th><th>J</th><th>SG</th></tr></thead><tbody>
            ${ord.map((e, i) => {
                const s = SELECOES.find(x => x.id === e.id);
                const qual = elim && i < cutoff;
                const rankClass = i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : "";
                return `<tr class="${qual ? "row-qualifica" : ""} ${elim && i === cutoff - 1 ? "linha-corte" : ""}" onclick="abrirPerfilSelecao('${e.id}')"><td class="col-pos"><span class="grupo-pos ${rankClass}">${qual ? "✓" : i + 1}</span></td><td class="col-team"><img src="${s?.logo || ""}" class="bracket-flag">${s?.nome || e.nome}</td><td><strong>${e.pts}</strong></td><td>${e.j}</td><td>${e.gf - e.gs > 0 ? "+" : ""}${e.gf - e.gs}</td></tr>`;
            }).join("")}
        </tbody></table></div></div>`;
    } else if (tor.tipo === "mata-mata" && tor.confrontos) {
        fasesHtml += `<div class="fase-bloco bracket-phase"><h4 class="bracket-title">${tor.fase}</h4>${renderArvoreMataMata(tor.confrontos, cor, tor.fase)}</div>`;
    }
    html += `<div class="bracket-container">${fasesHtml}</div>`;
    if (tor.fase === "Campeão Definido" && !elim) {
        const camp = SELECOES.find(s => s.id === tor.campeaoId);
        html += `<div class="comp-campeao-banner">Campeão: ${camp?.nome || tor.campeaoId}</div>`;
    }
    if (["Vagas Definidas", "Classificação Definida"].includes(tor.fase) || (elim && tor.classificados?.length)) {
        html += renderClassificadosElim(tor, cor);
    }
    return html + `</div>`;
}

function renderizarCompeticoesInternacionais() {
    const el = document.getElementById("view-comp-int");
    if (!el) return;
    inicializarTodosTorneiosTemporada();
    const ativas = obterCompeticoesAtivasTemporada();
    const filtroCat = uiFiltroCompInt;
    let torneios = ativas.map(c => {
        const key = chaveTorneio(c.id, anoAtual);
        const tor = selecoesEstado.torneios[key] || inicializarTorneioInternacional(c);
        return { comp: c, key, tor, cat: categoriaComp(c.id), meta: metaCompeticao(c.id, anoAtual) };
    }).filter(x => x.tor);
    if (filtroCat !== "todos") torneios = torneios.filter(t => t.cat === filtroCat);
    const compAtual = torneios.find(t => t.comp.id === uiSelectCompInt) || torneios[0];
    if (compAtual) uiSelectCompInt = compAtual.comp.id;
    if (compAtual) aplicarTemaCompeticao(compAtual.comp.id);

    const cats = [
        { id: "todos", label: "Todos" },
        { id: "eliminatorias", label: " Eliminatórias" },
        { id: "continental", label: " Continentais" },
        { id: "mundial", label: " Mundial / Olimpíadas" },
        { id: "nations", label: " Nations League" },
        { id: "base", label: "🧒 Seleções de Base" }
    ];

    // Callout pessoal: contextualiza o dashboard em torno da campanha do
    // próprio jogador pela seleção, em vez de só listar torneios genéricos.
    const selecaoJogador = jogador?.selecaoId && jogador.selecaoId !== "none" ? SELECOES.find(s => s.id === jogador.selecaoId) : null;
    const stSel = jogador?.statsSelecao || { jogos: 0, gols: 0, assistencias: 0 };
    const minhaCampanhaHtml = selecaoJogador ? `
        <div class="comp-int-minha-selecao">
            <img src="${selecaoJogador.logo || ''}" alt="${selecaoJogador.nome}" onerror="this.style.visibility='hidden'">
            <div>
                <span class="comp-int-kicker" style="margin:0;">Minha Seleção</span>
                <h3>${selecaoJogador.nome}</h3>
                <span class="comp-int-status-badge ${jogador.naSelecao ? 'convocado' : 'fora'}">${jogador.naSelecao ? '✓ Convocado' : 'Fora da última lista'}</span>
            </div>
            <div class="comp-int-minha-stats">
                <div><strong>${stSel.jogos || 0}</strong><span>Jogos</span></div>
                <div><strong>${stSel.gols || 0}</strong><span>Gols</span></div>
                <div><strong>${stSel.assistencias || 0}</strong><span>Assist.</span></div>
                <div><strong>${(jogador.titulosSelecao || []).length}</strong><span>Títulos</span></div>
            </div>
        </div>` : `
        <div class="comp-int-minha-selecao comp-int-minha-selecao-vazia">
            <span style="font-size:1.8rem;">🌍</span>
            <div><span class="comp-int-kicker" style="margin:0;">Minha Seleção</span><h3>Ainda sem seleção</h3><p style="margin:2px 0 0; color:#999; font-size:0.82rem;">Continue a ter boas atuações para ser convocado.</p></div>
        </div>`;

    el.innerHTML = `
        <div class="comp-int-shell comp-int-page">
            <div class="comp-int-hero">
                <div class="comp-int-hero-glow"></div>
                <div class="comp-int-hero-content">
                    <span class="comp-int-kicker">Seleções • Temporada ${anoAtual}</span>
                    <h2>Competições Internacionais</h2>
                    <p>Acompanhe eliminatórias, torneios e Nations League — convocado ou não.</p>
                </div>
                <div class="comp-int-hero-stats">
                    <div class="comp-stat-box"><strong>${ativas.length}</strong><span>Ativas este ano</span></div>
                    <div class="comp-stat-box"><strong>${anoAtual % 4 === 1 ? anoAtual + 1 : anoAtual % 4 === 3 ? anoAtual + 1 : "—"}</strong><span>Próximo torneio grande</span></div>
                </div>
            </div>
            ${minhaCampanhaHtml}
            <div class="comp-cat-tabs">${cats.map(c => `<button type="button" class="comp-cat-tab ${filtroCat === c.id ? "ativo" : ""}" data-cat="${c.id}">${c.label}</button>`).join("")}</div>
            <div class="comp-int-cards-strip">
                ${torneios.length ? torneios.map(t => {
                    const elim = isEliminatoria(t.comp.id);
                    const done = ["Vagas Definidas", "Classificação Definida"].includes(t.tor.fase) || (t.tor.fase === "Campeão Definido" && !elim);
                    const camp = !elim && t.tor.campeaoId ? SELECOES.find(s => s.id === t.tor.campeaoId)?.nome : null;
                    const prog = t.tor.tipo === "grupos" && t.tor.maxRodadas ? Math.min(100, Math.round(((t.tor.rodadaAtual || 1) - 1) / t.tor.maxRodadas * 100)) : (done ? 100 : 50);
                    const logoCard = obterLogoTorneioInternacional(t.comp.nome, t.meta);
                    return `<button type="button" class="comp-tournament-card ${t.comp.id === compAtual?.comp.id ? "ativo" : ""}" data-comp="${t.comp.id}" style="--comp-cor:${t.tor.cor || CORES_COMP.default}">
                        <div class="comp-tournament-card-top">
                            ${logoCard ? `<img class="comp-tournament-icon" src="${logoCard}" alt="${t.comp.nome}" onerror="this.outerHTML='<span class=&quot;comp-tournament-icon&quot;>${t.meta.icon}</span>'">` : `<span class="comp-tournament-icon">${t.meta.icon}</span>`}
                            ${camp ? `<span class="comp-tournament-crown" title="${camp}">👑</span>` : ""}
                        </div>
                        <strong>${t.comp.nome.replace("Eliminatórias ", "").replace(" — Divisão ", " Div. ")}</strong>
                        <small>${t.meta.subtitulo || rotuloFaseTorneo(t.tor)}</small>
                        <div class="comp-tournament-progress"><div style="width:${prog}%"></div></div>
                        ${camp ? `<em class="comp-tournament-tag tag-champ">Campeão: ${camp}</em>` : (elim && done ? `<em class="comp-tournament-tag tag-vagas">🎫 Vagas definidas</em>` : `<em class="comp-tournament-tag">${rotuloFaseTorneo(t.tor)}</em>`)}
                    </button>`;
                }).join("") : `<p class="comp-empty-sidebar">Nenhuma competição neste filtro.</p>`}
            </div>
            <main class="comp-int-main comp-int-main-full">
                ${compAtual ? renderTorneioInternacionalCompleto(compAtual.tor, compAtual.key) : `<div class="comp-empty-main"><span>🌍</span><p>Nenhum torneio internacional ativo nesta temporada.</p><small>Eliminatórias da Copa rodam em anos como ${anoAtual % 4 === 1 ? anoAtual : anoAtual + (1 - (anoAtual % 4))}. Euro/Eliminatórias Euro em ${anoAtual % 4 === 3 ? anoAtual : anoAtual + (3 - (anoAtual % 4))}.</small></div>`}
            </main>
        </div>`;

    el.querySelectorAll(".comp-cat-tab").forEach(btn => btn.onclick = () => {
        uiFiltroCompInt = btn.dataset.cat;
        renderizarCompeticoesInternacionais();
    });
    el.querySelectorAll(".comp-tournament-card").forEach(btn => btn.onclick = () => {
        uiSelectCompInt = btn.dataset.comp;
        aplicarTemaCompeticao(uiSelectCompInt);
        renderizarCompeticoesInternacionais();
    });
}

function renderBlocoFaseInternacional(faseObj, corComp) {
    if(faseObj.tipo === "grupos" && faseObj.grupos) {
        const avancam = faseObj.avancam || 2;
        let grid = `<div class="grupo-grid">`;
        faseObj.grupos.forEach(grp => {
            const ord = [...grp.equipas].sort((a,b) => b.pts - a.pts || (b.gf-b.gs) - (a.gf-a.gs));
            grid += `<div class="bracket-group-card" style="--comp-cor:${corComp || "var(--theme-primary)"}">
                <div class="grupo-card-head"><h4>${grp.nome}</h4><span class="grupo-card-meta">${avancam} classificam</span></div>
                <table class="grupo-table"><thead><tr><th class="col-pos">#</th><th class="col-team">Seleção</th><th>P</th><th>J</th><th>SG</th></tr></thead><tbody>
                ${ord.map((e,i) => {
                    const s = SELECOES.find(x=>x.id===e.id);
                    const rankClass = i===0?"rank-1":i===1?"rank-2":i===2?"rank-3":"";
                    const qualifica = i < avancam;
                    return `<tr class="${e.id===jogador?.selecaoId?'bracket-row-me':''} ${qualifica?'row-qualifica':''} ${i===avancam-1?'linha-corte':''}" onclick="abrirPerfilSelecao('${e.id}')">
                        <td class="col-pos"><span class="grupo-pos ${rankClass}">${i+1}</span></td>
                        <td class="col-team"><img src="${s?.logo||''}" class="bracket-flag">${s?.nome||e.nome}</td>
                        <td><strong>${e.pts}</strong></td><td>${e.j}</td><td>${e.gf-e.gs > 0 ? "+" : ""}${e.gf-e.gs}</td>
                    </tr>`;
                }).join("")}</tbody></table></div>`;
        });
        grid += `</div>`;
        return `<div class="fase-bloco bracket-phase"><h4 class="bracket-title">${faseObj.fase}</h4>${grid}</div>`;
    }
    if(faseObj.tipo === "mata-mata" && faseObj.confrontos) {
        const cor = corComp || CORES_COMP.default;
        return `<div class="fase-bloco bracket-phase"><h4 class="bracket-title">${faseObj.fase}</h4>${renderArvoreMataMata(faseObj.confrontos, cor)}</div>`;
    }
    return "";
}

// ==========================================
// 🛠️ INJEÇÃO DINÂMICA DE CSS
// ==========================================
const styleOverrides = document.createElement('style');
styleOverrides.innerHTML = `
    .oculto { display: none !important; }
    .view-section { display: none; }
    .view-section.ativo { display: block; }
    
    .foto-perfil-gigante { width: 180px; height: 180px; border-radius: 50%; object-fit: cover !important; border: 4px solid var(--theme-primary); box-shadow: 0 0 15px rgba(0, 255, 136, 0.4); margin-right: 25px; }
    .status-texto-grande { font-size: 1.2rem; margin: 8px 0; color: #ccc; }
    .trofeu-icon { width: 35px; height: 35px; vertical-align: middle; margin-right: 12px; filter: drop-shadow(0 0 5px rgba(255,215,0,0.6)); }
    .card-conquista { display: flex; align-items: center; gap:14px; background: rgba(255,215,0,0.05); padding: 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid rgba(255,215,0,0.3); transition: 0.3s; }
    .card-conquista:hover { background: rgba(255,215,0,0.1); transform: translateX(5px); }
    /* 🛡️ FIX: troféus da seleção tinham pouco destaque — versão maior usada
       no palmarés de seleções (abrirPerfilSelecao) e no perfil do jogador. */
    .selecao-titulos-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:14px; }
    .card-conquista-grande { padding:18px; border-radius:14px; background:linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,215,0,0.03)); border:1px solid rgba(255,215,0,0.4); box-shadow:0 10px 24px rgba(0,0,0,0.3); }
    .card-conquista-grande:hover { transform:translateY(-3px) scale(1.02); box-shadow:0 14px 30px rgba(255,215,0,0.15); }
    
    .bracket-container { display: flex; flex-direction: column; gap: 40px; padding: 20px 0; }
    .fase-bloco { background: rgba(0,0,0,0.5); border-radius: 16px; padding: 25px; border: 1px solid #333; }
    .match-card { background: linear-gradient(145deg, #18181b, #09090b); border: 1px solid #333; border-radius: 12px; padding: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.4); transition: 0.3s; }
    .match-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,255,136,0.15); border-color: #555; }
    .match-card.meu-jogo { border-color: var(--theme-primary); box-shadow: 0 0 15px rgba(0,255,136,0.2); background: linear-gradient(145deg, rgba(0,255,136,0.1), #09090b); }
    
    body { background-size: cover; background-position: center; background-attachment: fixed; transition: background-image 0.5s ease-in-out; }
    #modalPerfilJogador > div, #modalPesquisa > div { width: 95vw !important; max-width: 1400px !important; height: 90vh !important; display: flex; flex-direction: column; }
    .aba-conteudo { flex-grow: 1; max-height: none !important; overflow-y: auto; padding-bottom: 20px; }
    
    /* FIX DE ACHATAMENTO DE IMAGENS */
    img { object-fit: contain !important; }
    .comp-logo { width: 40px; height: 40px; border-radius: 8px; margin-right: 10px; background: #fff; padding: 2px;}
    .pos-badge { font-size: 0.85rem; padding: 3px 8px; border-radius: 4px; border: 1px solid #555; background: rgba(0,0,0,0.5); font-weight: bold; }
    
        /* DESIGN PREMIUM: CLASSIFICACOES E GALA */
    .classificacao-shell { display:flex; flex-direction:column; gap:18px; }
    .classificacao-hero { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:22px; border:1px solid rgba(255,255,255,0.12); border-radius:16px; background:linear-gradient(135deg, rgba(0,255,136,0.12), rgba(59,130,246,0.09) 45%, rgba(0,0,0,0.55)); box-shadow:0 18px 45px rgba(0,0,0,0.35); }
    .classificacao-hero h2 { margin:0; font-size:2rem; font-weight:900; letter-spacing:0; }
    .classificacao-hero p { margin:6px 0 0; color:var(--text-muted); font-weight:600; }
    .classificacao-meta { display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end; }
    .meta-pill { padding:8px 12px; border-radius:999px; border:1px solid rgba(255,255,255,0.12); background:rgba(0,0,0,0.35); color:#dbeafe; font-weight:800; font-size:0.82rem; text-transform:uppercase; }
    .paises-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:12px; }
    .btn-pais-filtro { min-height:74px; border:1px solid rgba(255,255,255,0.11); border-radius:12px; background:linear-gradient(145deg, rgba(24,24,27,0.9), rgba(9,9,11,0.9)); color:#fff; cursor:pointer; font-family:'Montserrat'; text-align:left; padding:14px 16px; display:flex; align-items:center; gap:12px; transition:0.22s ease; box-shadow:0 10px 24px rgba(0,0,0,0.22); }
    .btn-pais-filtro:hover { transform:translateY(-2px); border-color:rgba(0,255,136,0.45); background:linear-gradient(145deg, rgba(24,24,27,1), rgba(0,255,136,0.08)); }
    .btn-pais-filtro.ativo { border-color:var(--theme-primary); box-shadow:0 0 0 1px rgba(0,255,136,0.24), 0 18px 36px rgba(0,255,136,0.1); background:linear-gradient(145deg, rgba(0,255,136,0.18), rgba(24,24,27,0.95)); }
    .pais-flag { width:38px; height:38px; flex:0 0 38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.55rem; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); }
    .pais-logo { width:38px; height:38px; flex:0 0 38px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.92); border:1px solid rgba(255,255,255,0.18); padding:5px; color:#111; font-weight:900; font-size:0.82rem; overflow:hidden; }
    .pais-logo img { width:100%; height:100%; object-fit:contain !important; }
    .pais-label { display:block; font-size:1rem; font-weight:900; }
    .pais-sub { display:block; margin-top:3px; color:var(--text-muted); font-size:0.75rem; font-weight:700; text-transform:uppercase; }
    .divisoes-container { display:flex; gap:10px; flex-wrap:wrap; padding:12px; border-radius:14px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.28); }
    .btn-divisao { border:1px solid rgba(255,255,255,0.12); color:#d4d4d8; background:rgba(255,255,255,0.04); padding:11px 15px; border-radius:10px; font-family:'Montserrat'; font-weight:900; cursor:pointer; transition:0.2s ease; }
    .btn-divisao small { display:block; margin-top:3px; color:#a1a1aa; font-size:0.68rem; text-transform:uppercase; }
    .btn-divisao.ativo small { color:rgba(0,0,0,0.65); }
    .btn-divisao:hover { color:#fff; border-color:rgba(255,255,255,0.28); transform:translateY(-1px); }
    .btn-divisao.ativo { color:#000; background:var(--theme-primary); border-color:var(--theme-primary); box-shadow:0 10px 22px rgba(0,255,136,0.18); }
    /* 🛡️ Variante "só logo" das abas de competição (Bundesliga, Bundesliga 2, DFB-Pokal...) */
    .btn-divisao-logo { width:56px; height:56px; padding:8px; display:flex; align-items:center; justify-content:center; }
    .btn-divisao-logo.ativo { background:rgba(0,255,136,0.14); }
    .liga-header-card { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:15px; background:linear-gradient(135deg, rgba(0,0,0,0.65), rgba(24,24,27,0.92)); padding:18px; border-radius:14px; border:1px solid rgba(255,255,255,0.12); }
    .liga-title-wrap { display:flex; align-items:center; gap:14px; min-width:0; }
    .liga-title-wrap h2 { margin:0; color:#fff; font-size:1.55rem; }
    .liga-title-wrap span { color:var(--theme-primary); font-weight:900; font-size:0.8rem; text-transform:uppercase; }
    .liga-logo-frame { width:56px; height:56px; flex:0 0 56px; border-radius:12px; display:flex; align-items:center; justify-content:center; background:#fff; padding:6px; box-shadow:0 10px 24px rgba(0,0,0,0.35); }
    .liga-logo-frame img { max-width:100%; max-height:100%; object-fit:contain; }
    .next-match-meta { display:flex; align-items:center; justify-content:space-between; gap:12px; color:var(--text-muted); margin-bottom:14px; font-weight:800; font-size:0.82rem; text-transform:uppercase; }
    .next-match-meta span { display:flex; align-items:center; min-width:0; }
    .next-match-meta strong { color:var(--theme-primary); padding:7px 10px; border-radius:999px; border:1px solid rgba(255,255,255,0.12); background:rgba(0,0,0,0.28); white-space:nowrap; }
    .season-calendar-card { margin-top:15px; padding:18px; border-left:4px solid var(--theme-primary); background:linear-gradient(135deg, rgba(24,24,27,0.88), rgba(0,0,0,0.46)); }
    .season-calendar-head { display:flex; align-items:center; justify-content:space-between; gap:14px; margin-bottom:12px; }
    .season-calendar-head h3 { margin:4px 0 0; font-size:1.1rem; }
    .season-timeline { display:flex; flex-direction:column; gap:8px; }
    .calendar-row { display:grid; grid-template-columns:150px 44px minmax(0,1fr) auto; gap:12px; align-items:center; padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.035); cursor:pointer; transition:0.2s ease; }
    .calendar-row:hover { transform:translateX(3px); border-color:var(--theme-primary); background:rgba(255,255,255,0.07); }
    .calendar-row.atual { border-color:rgba(250,204,21,0.46); background:linear-gradient(90deg, rgba(250,204,21,0.13), rgba(255,255,255,0.035)); }
    .calendar-date strong, .calendar-main strong { display:block; color:#fff; font-size:0.88rem; line-height:1.2; }
    .calendar-date span, .calendar-main span { display:block; color:#a1a1aa; font-size:0.73rem; font-weight:800; margin-top:3px; text-transform:uppercase; }
    .calendar-logo { width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.92); color:#111; padding:5px; font-size:1.35rem; }
    .calendar-logo img { width:100%; height:100%; object-fit:contain !important; }
    .calendar-tag { justify-self:end; font-size:0.7rem; color:var(--theme-primary); font-weight:900; text-transform:uppercase; padding:6px 9px; border-radius:999px; background:rgba(0,0,0,0.32); border:1px solid rgba(255,255,255,0.1); }
    .calendar-empty { color:#a1a1aa; text-align:center; padding:18px; border:1px dashed rgba(255,255,255,0.14); border-radius:12px; }

    .gala-container-premium { width:min(1060px, 94vw) !important; max-height:92vh; overflow-y:auto; margin:auto; border:1px solid rgba(251,191,36,0.35); background:radial-gradient(circle at 50% 0%, rgba(251,191,36,0.18), transparent 34%), linear-gradient(145deg, #111113 0%, #050505 100%); box-shadow:0 30px 90px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.08); }
    .gala-stage { position:relative; padding:30px; text-align:center; overflow:hidden; }
    .gala-stage:before { content:''; position:absolute; inset:0; background:linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.06) 45%, transparent 70%); transform:translateX(-100%); animation:galaSpotlight 5s ease-in-out infinite; pointer-events:none; }
    .gala-kicker { color:#facc15; font-weight:900; text-transform:uppercase; letter-spacing:2px; font-size:0.8rem; }
    .gala-luxo { margin:8px 0 4px; font-size:3rem; font-weight:900; color:#fff; text-transform:uppercase; text-shadow:0 0 26px rgba(251,191,36,0.45); }
    .gala-subtitle { margin:0 auto 22px; max-width:720px; color:#a1a1aa; font-weight:600; }
    .bola-de-ouro-trofeu { width:150px; height:150px; margin:8px auto 18px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:4.1rem; background:radial-gradient(circle at 35% 30%, #fff7ad, #facc15 36%, #b45309 72%); box-shadow:0 0 45px rgba(251,191,36,0.45), inset -12px -18px 30px rgba(0,0,0,0.25); animation:trofeuFloat 2.8s ease-in-out infinite; overflow:hidden; padding:16px; }
    .bola-de-ouro-trofeu img { width:100%; height:100%; object-fit:contain !important; filter:drop-shadow(0 8px 18px rgba(0,0,0,0.35)); }
    .gala-skip-btn { position:absolute; top:14px; right:14px; z-index:5; padding:10px 14px; border-radius:10px; border:1px solid rgba(250,204,21,0.35); background:rgba(0,0,0,0.55); color:#facc15; font-family:'Montserrat'; font-weight:900; cursor:pointer; text-transform:uppercase; }
    .gala-final-actions { position:sticky; bottom:0; padding:14px 0 2px; background:linear-gradient(180deg, transparent, rgba(5,5,5,0.96) 35%); }
    .finalistas-grid { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:16px; align-items:end; margin:26px 0 18px; }
    .finalista-card { background:linear-gradient(180deg, rgba(255,255,255,0.07), rgba(0,0,0,0.42)); border:1px solid rgba(255,255,255,0.11); padding:18px; border-radius:16px; min-height:230px; width:auto; transition:all 0.75s ease; opacity:0; transform:translateY(30px); display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; overflow:hidden; }
    .finalista-card:before { content:attr(data-rank); position:absolute; top:12px; left:12px; color:rgba(255,255,255,0.22); font-size:2.4rem; font-weight:900; }
    .finalista-card.revelado { opacity:1; transform:translateY(0); border-color:rgba(255,255,255,0.22); }
    .finalista-card.vencedor { border-color:#facc15; background:linear-gradient(180deg, rgba(250,204,21,0.24), rgba(0,0,0,0.5)); box-shadow:0 0 50px rgba(250,204,21,0.42); transform:scale(1.08) translateY(-12px); z-index:10; }
    .finalista-card img { width:92px; height:92px; border-radius:50%; margin-bottom:12px; object-fit:cover !important; border:3px solid rgba(255,255,255,0.18); }
    .finalista-card.vencedor img { border-color:#facc15; box-shadow:0 0 26px rgba(250,204,21,0.45); }
    .finalista-card h4 { margin:6px 0; font-size:1.08rem; }
    .finalista-stats { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-top:10px; }
    .finalista-stats span { padding:6px 8px; border-radius:999px; background:rgba(255,255,255,0.08); color:#e5e7eb; font-size:0.76rem; font-weight:800; }
    .gala-awards-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin:24px 0; }
    .gala-award { background:rgba(255,255,255,0.055); padding:15px; border-radius:14px; border:1px solid rgba(255,255,255,0.12); text-align:left; }
    .gala-award img { width:46px; height:46px; object-fit:contain !important; float:right; margin-left:10px; filter:drop-shadow(0 5px 12px rgba(0,0,0,0.45)); }
    .gala-award small { display:block; color:#a1a1aa; font-weight:900; text-transform:uppercase; margin-bottom:8px; }
    .gala-award strong { display:block; color:#fff; line-height:1.25; }
    .gala-award span { display:block; margin-top:8px; color:#facc15; font-weight:900; }
    .gala-premio-palco { margin-top:24px; padding:18px; border:1px solid rgba(250,204,21,0.2); border-radius:16px; background:rgba(0,0,0,0.34); animation:popIn 0.35s ease-out; }
    .gala-premio-palco h3 { margin:0 0 6px; color:#facc15; font-size:1.45rem; text-transform:uppercase; }
    .gala-candidatos-grid { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:12px; margin-top:16px; }
    .gala-candidato { border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:14px; background:rgba(255,255,255,0.055); transition:0.35s ease; }
    .gala-candidato.vencedor { border-color:#facc15; background:rgba(250,204,21,0.14); box-shadow:0 0 28px rgba(250,204,21,0.25); transform:translateY(-5px); }
    .gala-candidato img { width:70px; height:70px; border-radius:50%; object-fit:cover !important; border:2px solid rgba(255,255,255,0.18); }
    .gala-candidato strong { display:block; margin-top:8px; color:#fff; }
    .gala-candidato span { display:block; margin-top:5px; color:#a1a1aa; font-weight:800; font-size:0.82rem; }
    .conquista-stack { position:relative; cursor:pointer; }
    .conquista-count { position:absolute; top:8px; left:58px; min-width:34px; padding:4px 7px; border-radius:999px; background:var(--gold); color:#000; font-weight:900; text-align:center; box-shadow:0 6px 14px rgba(0,0,0,0.35); }
    .conquista-detalhes { display:none; margin-top:10px; color:#cbd5e1; font-size:0.92rem; line-height:1.6; }
    .conquista-stack.aberto .conquista-detalhes { display:block; }
    .transfer-card { display:grid; grid-template-columns:1.2fr 1fr 1fr 0.9fr; gap:14px; align-items:center; padding:16px; border-radius:14px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.32); margin-bottom:12px; }
    .transfer-person, .transfer-club { display:flex; align-items:center; gap:12px; min-width:0; }
    .transfer-person img { width:58px; height:58px; border-radius:50%; object-fit:cover !important; border:2px solid rgba(255,255,255,0.16); }
    .transfer-club img { width:46px; height:46px; border-radius:10px; object-fit:contain !important; background:#fff; padding:4px; }
    .transfer-arrow { color:var(--theme-primary); font-weight:900; text-align:center; }
    .interview-card { width:min(720px, 92vw); background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(0,255,136,0.28); border-radius:16px; padding:26px; box-shadow:0 24px 70px rgba(0,0,0,0.75); }
    .interview-option { width:100%; margin-top:10px; text-align:left; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.06); color:#fff; border-radius:10px; padding:14px; font-family:'Montserrat'; font-weight:800; cursor:pointer; }
    .interview-option:hover { border-color:var(--theme-primary); background:rgba(0,255,136,0.1); }
    .gala-winner-name { color:#facc15; font-size:3rem; margin:14px 0 4px; text-transform:uppercase; text-shadow:0 0 22px rgba(250,204,21,0.55); }
    @keyframes galaSpotlight { 0%, 35% { transform:translateX(-100%); } 60%, 100% { transform:translateX(100%); } }
    @keyframes trofeuFloat { 0%,100% { transform:translateY(0) scale(1); } 50% { transform:translateY(-8px) scale(1.03); } }
    @keyframes popIn { 0% { transform: scale(0.5) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
    @keyframes erguerTaca { from { transform: scale(0.9) translateY(10px); } to { transform: scale(1.1) translateY(-10px); } }
    @keyframes glowTaca { from { filter: drop-shadow(0 0 15px rgba(255,215,0,0.4)); } to { filter: drop-shadow(0 0 40px rgba(255,215,0,0.9)); } }
    @keyframes brilhoTexto { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    @keyframes pulsarVencedor { from { box-shadow: 0 0 20px rgba(212,175,55,0.3); } to { box-shadow: 0 0 50px rgba(212,175,55,0.8); } }
    @keyframes cairConfete { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(360deg); opacity: 0; } }
    @media (max-width: 760px) { .classificacao-hero { align-items:flex-start; flex-direction:column; } .finalistas-grid, .gala-awards-grid, .gala-candidatos-grid { grid-template-columns:1fr; } .gala-luxo, .gala-winner-name { font-size:2rem; } }

    /* POLIMENTO: PARTIDA, COLETIVAS, RANKINGS */
    #modalEntrevista { background:linear-gradient(rgba(0,0,0,0.72), rgba(0,0,0,0.86)), url('https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1800&auto=format&fit=crop'); background-size:cover; background-position:center; }
    .interview-card { position:relative; overflow:hidden; border-top:4px solid var(--theme-primary); background:linear-gradient(145deg, rgba(24,24,27,0.97), rgba(9,9,11,0.97)); }
    .interview-card:before { content:''; position:absolute; left:0; right:0; top:0; height:76px; background:linear-gradient(90deg, rgba(0,255,136,0.18), transparent); pointer-events:none; }
    .match-scoreboard { background:radial-gradient(circle at 50% 0%, rgba(0,255,136,0.12), transparent 40%), linear-gradient(180deg, rgba(24,24,27,0.96), rgba(9,9,11,1)); padding:34px !important; }
    .match-scoreboard h2 { color:#e5e7eb !important; font-size:1.25rem !important; font-weight:900; }
    .match-logo { width:58px !important; height:58px !important; border-radius:12px !important; background:rgba(255,255,255,0.95); padding:5px; object-fit:contain !important; }
    .score-number { font-size:4.8rem !important; color:#fff; text-shadow:0 0 24px rgba(255,255,255,0.28); }
    .match-log { background:linear-gradient(180deg, #050505, #0b0b0f) !important; height:230px !important; color:#d1d5db !important; font-family:'Montserrat', monospace !important; }
    .match-log div { border-bottom:1px dashed rgba(255,255,255,0.09) !important; }
    .match-log .gol-meu { color:#facc15 !important; background:rgba(250,204,21,0.08); border:1px solid rgba(250,204,21,0.25); border-radius:8px; padding:10px; box-shadow:0 0 18px rgba(250,204,21,0.12); }
    .match-log .gol-time { color:#00ff88 !important; font-weight:900; }
    .comp-detail-grid { display:grid; grid-template-columns:minmax(0,1fr) 280px; gap:16px; align-items:start; }
    .ranking-mini { background:rgba(0,0,0,0.36); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:14px; position:sticky; top:0; }
    .ranking-mini h4 { margin:0 0 10px; color:var(--theme-primary); text-transform:uppercase; font-size:0.82rem; }
    .ranking-mini-row { display:flex; align-items:center; gap:8px; justify-content:space-between; padding:8px 0; border-bottom:1px dashed rgba(255,255,255,0.08); font-size:0.82rem; }
    .ranking-mini-row img { width:26px; height:26px; border-radius:50%; object-fit:cover !important; }

    /* CONVERSA COM O TÉCNICO (avisos de escalação) */
    #modalConversaTecnico { z-index:1000; background:rgba(0,0,0,0.82); backdrop-filter:blur(6px); }
    .coach-talk-card { width:min(560px, 90vw); background:linear-gradient(145deg, rgba(24,24,27,0.98), rgba(9,9,11,0.98)); border:1px solid rgba(255,255,255,0.14); border-top:4px solid var(--theme-primary); border-radius:16px; padding:24px; box-shadow:0 24px 70px rgba(0,0,0,0.75); position:relative; animation:popIn 0.3s ease-out; }
    .coach-talk-tag { color:var(--theme-primary); font-weight:900; text-transform:uppercase; letter-spacing:1.5px; font-size:0.78rem; }
    .coach-talk-tag.banco { color:#f97316; }
    .coach-talk-tag.fora { color:#ef4444; }
    .coach-talk-avatar { width:54px; height:54px; border-radius:50%; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; font-size:1.6rem; margin-bottom:10px; }
    .coach-talk-quote { margin:10px 0 18px; color:#e5e7eb; font-size:1.08rem; line-height:1.5; font-style:italic; }
    .coach-talk-btn { width:100%; padding:13px; border:none; border-radius:10px; background:var(--theme-primary); color:#000; font-family:'Montserrat'; font-weight:900; cursor:pointer; text-transform:uppercase; letter-spacing:0.5px; }
    .coach-talk-btn:hover { filter:brightness(1.08); }
    .match-log .gol-substituicao { color:#facc15 !important; font-weight:800; background:rgba(250,204,21,0.06); border:1px dashed rgba(250,204,21,0.3); border-radius:8px; padding:8px; }
    .interview-card .interview-tag-grande { display:inline-block; margin-left:8px; padding:3px 9px; border-radius:999px; background:rgba(239,68,68,0.18); color:#f87171; font-size:0.68rem; font-weight:900; text-transform:uppercase; vertical-align:middle; }

    /* HALL DA FAMA */
    .hof-header { display:flex; align-items:center; gap:18px; padding:22px 25px; background:linear-gradient(120deg, rgba(250,204,21,0.10), rgba(255,255,255,0.02)); border:1px solid rgba(250,204,21,0.25); }
    .hof-avatar { width:64px; height:64px; border-radius:50%; background:rgba(250,204,21,0.12); border:2px solid rgba(250,204,21,0.4); display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0; font-size:1.8rem; }
    .hof-avatar img { width:100%; height:100%; object-fit:cover; }
    .hof-stats-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:12px; margin-top:16px; }
    .hof-stat-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:16px; text-align:center; }
    .hof-stat-card strong { display:block; font-size:1.8rem; font-weight:900; color:#fff; }
    .hof-stat-card span { font-size:0.75rem; color:#94a3b8; text-transform:uppercase; font-weight:700; letter-spacing:0.5px; }
    .hof-stat-card.destaque { background:rgba(250,204,21,0.10); border-color:rgba(250,204,21,0.35); }
    .hof-stat-card.destaque strong { color:var(--gold); }
    .hof-trofeu-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(110px, 1fr)); gap:14px; }
    .hof-trofeu-item { display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px 8px; position:relative; transition:transform 0.15s, border-color 0.15s; }
    .hof-trofeu-item:hover { transform:translateY(-3px); border-color:rgba(250,204,21,0.4); }
    .hof-trofeu-item img { width:44px; height:44px; object-fit:contain; }
    .hof-trofeu-fallback { font-size:2rem; }
    .hof-trofeu-item span { font-size:0.74rem; color:#d4d4d8; font-weight:700; line-height:1.25; }
    .hof-trofeu-item em { position:absolute; top:6px; right:8px; font-style:normal; font-size:0.7rem; font-weight:900; color:var(--gold); background:rgba(0,0,0,0.5); border-radius:8px; padding:1px 6px; }
    .hof-trofeu-tag { display:inline-block; background:rgba(250,204,21,0.12); color:#facc15; border:1px solid rgba(250,204,21,0.3); border-radius:999px; padding:2px 8px; font-size:0.72rem; font-weight:700; margin:2px 3px 2px 0; white-space:nowrap; }

    /* NOTÍCIAS: chips de filtro (clicáveis) */
    .noticia-filtro-chip { font-size:0.72rem; font-weight:800; padding:5px 10px; border-radius:20px; background:color-mix(in srgb, var(--chip-cor) 13%, transparent); color:var(--chip-cor); border:1px solid color-mix(in srgb, var(--chip-cor) 35%, transparent); cursor:pointer; user-select:none; transition:transform 0.12s, filter 0.12s; }
    .noticia-filtro-chip:hover { transform:translateY(-1px); filter:brightness(1.15); }
    .noticia-filtro-chip.ativo { background:var(--chip-cor); color:#000; border-color:var(--chip-cor); }

    /* NOTÍCIAS: cartão "última hora" — reservado a grandes momentos (título, Bola de Ouro, seleção campeã) */
    .noticia-manchete-card { position:relative; background:linear-gradient(135deg, rgba(239,68,68,0.14), rgba(250,204,21,0.08)); border:1px solid rgba(239,68,68,0.4); border-radius:16px; padding:20px; overflow:hidden; }
    .noticia-manchete-card::before { content:''; position:absolute; inset:0; background:repeating-linear-gradient(-45deg, rgba(255,255,255,0.02) 0 12px, transparent 12px 24px); pointer-events:none; }
    .noticia-manchete-tag { display:inline-block; background:#ef4444; color:#fff; font-weight:900; font-size:0.68rem; letter-spacing:1px; padding:4px 10px; border-radius:999px; margin-bottom:12px; animation:pulseManchete 1.8s infinite; }
    @keyframes pulseManchete { 0%,100% { opacity:1; } 50% { opacity:0.55; } }
    .noticia-manchete-body { display:flex; gap:18px; align-items:center; }
    .noticia-manchete-img { width:90px; height:90px; object-fit:contain; background:rgba(255,255,255,0.06); border-radius:12px; padding:8px; flex-shrink:0; }
    .noticia-manchete-headline { margin:0 0 8px; font-size:1.4rem; font-weight:900; color:#fff; line-height:1.2; }
    .noticia-manchete-texto { margin:0 0 8px; color:#e4e4e7; line-height:1.5; }
    .noticia-manchete-cat { font-size:0.75rem; font-weight:800; text-transform:uppercase; }

    /* NOTÍCIAS: cartão estilo "post" de rede social */
    .noticia-post-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:16px 18px; }
    .noticia-post-header { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
    .noticia-post-avatar, .noticia-post-avatar-fallback { width:38px; height:38px; border-radius:50%; object-fit:cover; background:rgba(255,255,255,0.08); flex-shrink:0; }
    .noticia-post-avatar-fallback { display:flex; align-items:center; justify-content:center; font-size:1.1rem; }
    .noticia-post-header strong { display:block; color:#fff; font-size:0.92rem; }
    .noticia-post-cat { font-size:0.72rem; font-weight:800; text-transform:uppercase; }
    .noticia-post-manchete { margin:0 0 4px; color:#f4f4f5; font-weight:800; font-size:1.02rem; }
    .noticia-post-corpo { margin:0 0 12px; color:#cbd5e1; line-height:1.5; }
    .noticia-post-footer { display:flex; gap:18px; color:#94a3b8; font-size:0.82rem; font-weight:700; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px; }

    /* NOTÍCIAS: cartão estilo "manchete de jornal" */
    .noticia-jornal-card { background:#f4f1e8; color:#1a1a1a; border-radius:6px; padding:16px 20px; box-shadow:0 8px 22px rgba(0,0,0,0.35); }
    .noticia-jornal-masthead { display:flex; justify-content:space-between; font-family:'Georgia', serif; font-weight:900; letter-spacing:1px; font-size:0.72rem; border-bottom:2px solid #1a1a1a; padding-bottom:6px; margin-bottom:10px; color:#1a1a1a; text-transform:uppercase; }
    .noticia-jornal-body { display:flex; gap:14px; align-items:flex-start; }
    .noticia-jornal-img { width:88px; height:88px; object-fit:cover; border:1px solid #1a1a1a; filter:grayscale(0.4) contrast(1.05); flex-shrink:0; }
    .noticia-jornal-headline { font-family:'Georgia', serif; font-weight:900; font-size:1.28rem; margin:0 0 6px; line-height:1.15; color:#111; }
    .noticia-jornal-texto { font-family:'Georgia', serif; margin:0; color:#333; line-height:1.45; font-size:0.92rem; column-count:1; }

    /* GALA — barra de progresso das categorias */
    .gala-progresso { display:flex; justify-content:center; gap:6px; margin:14px 0 4px; flex-wrap:wrap; }
    .gala-progresso span { padding:5px 10px; border-radius:999px; font-size:0.68rem; font-weight:900; text-transform:uppercase; background:rgba(255,255,255,0.06); color:#71717a; border:1px solid rgba(255,255,255,0.08); }
    .gala-progresso span.ativo { background:rgba(250,204,21,0.18); color:#facc15; border-color:rgba(250,204,21,0.4); }
    .gala-progresso span.feito { color:#a1a1aa; }

    /* GALA — Melhor 11 do Mundo (campo tático) */
    .melhor11-pitch { position:relative; width:min(720px, 92vw); aspect-ratio:1.55/1; margin:20px auto; border-radius:16px; background:linear-gradient(180deg, #1c6e3a, #14532d); border:3px solid rgba(255,255,255,0.55); overflow:hidden; box-shadow:inset 0 0 60px rgba(0,0,0,0.4); }
    .melhor11-pitch::before { content:''; position:absolute; inset:0; background-image:repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 10%, transparent 10% 20%); }
    .melhor11-pitch::after { content:''; position:absolute; left:50%; top:50%; width:26%; aspect-ratio:1/1; border:2px solid rgba(255,255,255,0.5); border-radius:50%; transform:translate(-50%,-50%); }
    .melhor11-vaga { position:absolute; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; gap:4px; width:96px; opacity:0; animation:popIn 0.4s ease-out forwards; }
    .melhor11-vaga img { width:46px; height:46px; border-radius:50%; object-fit:cover; border:2px solid #facc15; background:#222; box-shadow:0 4px 12px rgba(0,0,0,0.5); }
    .melhor11-vaga .melhor11-avatar-vazio { width:46px; height:46px; border-radius:50%; background:rgba(255,255,255,0.15); border:2px dashed rgba(255,255,255,0.4); display:flex; align-items:center; justify-content:center; font-size:0.8rem; color:#fff; }
    .melhor11-vaga strong { font-size:0.68rem; color:#fff; text-align:center; text-shadow:0 1px 3px rgba(0,0,0,0.8); line-height:1.1; background:rgba(0,0,0,0.45); padding:2px 5px; border-radius:5px; }
    .melhor11-vaga span { font-size:0.6rem; color:#facc15; font-weight:900; text-shadow:0 1px 3px rgba(0,0,0,0.8); }
    .gala-award.premio-especial { border-color:rgba(250,204,21,0.4); background:linear-gradient(135deg, rgba(250,204,21,0.1), rgba(255,255,255,0.04)); }
    .fase-bloco { border-radius:14px !important; background:linear-gradient(145deg, rgba(24,24,27,0.92), rgba(0,0,0,0.58)) !important; border:1px solid rgba(255,255,255,0.12) !important; }
    .match-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:14px; }
    .selecao-shell { display:grid; grid-template-columns:minmax(0,1.4fr) minmax(280px,0.8fr); gap:18px; align-items:start; }
    .selecao-hero { position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.12); border-radius:18px; padding:24px; background:radial-gradient(circle at 18% 0%, rgba(0,255,136,0.18), transparent 40%), linear-gradient(145deg, rgba(24,24,27,0.97), rgba(0,0,0,0.8)); display:flex; justify-content:space-between; gap:16px; align-items:center; box-shadow:0 20px 50px rgba(0,0,0,0.4); }
    .selecao-hero::before { content:""; position:absolute; inset:0; background:linear-gradient(120deg, transparent 60%, rgba(255,255,255,0.035) 100%); pointer-events:none; }
    .selecao-hero img { width:86px; height:60px; border-radius:10px; object-fit:cover !important; box-shadow:0 12px 30px rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); }
    .selecao-card { border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.32); border-radius:14px; padding:16px; }
    .convocacao-resumo { display:flex; flex-wrap:wrap; gap:8px; margin:14px 0 4px; }
    .convocacao-resumo span { font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.03em; color:#a1a1aa; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:999px; padding:5px 12px; }
    .convocacao-grupo { margin-top:16px; }
    .convocacao-grupo h4 { display:flex; align-items:center; gap:8px; margin:0 0 10px; color:var(--theme-primary); text-transform:uppercase; font-size:0.82rem; letter-spacing:0.04em; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.08); }
    .convocacao-grupo-count { margin-left:auto; font-size:0.68rem; color:#888; background:rgba(255,255,255,0.06); border-radius:999px; padding:2px 9px; letter-spacing:0; }
    .convocado-row { display:grid; grid-template-columns:44px 1fr 26px auto auto; gap:10px; align-items:center; padding:9px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.035); margin-bottom:7px; cursor:pointer; transition:background 0.15s ease, transform 0.15s ease, border-color 0.15s ease; }
    .convocado-row:hover { background:rgba(255,255,255,0.07); transform:translateX(2px); border-color:rgba(255,255,255,0.2); }
    .convocado-row.eu { border-color:#facc15; background:rgba(250,204,21,0.12); box-shadow:0 0 20px rgba(250,204,21,0.12); }
    .convocado-row.titular { border-left:3px solid var(--theme-primary); }
    .convocado-row.reserva { opacity:0.82; }
    .convocado-row img { width:44px; height:44px; border-radius:50%; object-fit:cover !important; border:1px solid rgba(255,255,255,0.12); }
    .convocado-row div strong { display:block; font-size:0.9rem; }
    .convocado-row small { color:#999; font-weight:700; font-size:0.74rem; }
    .convocado-escudo { width:24px; height:24px; object-fit:contain !important; background:#fff; border-radius:5px; padding:2px; }
    .convocado-status-tag { font-size:0.62rem; font-weight:800; text-transform:uppercase; letter-spacing:0.03em; padding:4px 8px; border-radius:999px; white-space:nowrap; }
    .convocado-status-tag.titular { color:var(--theme-primary); background:rgba(0,255,136,0.12); border:1px solid rgba(0,255,136,0.3); }
    .convocado-status-tag.reserva { color:#999; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); }
    @media (max-width: 640px) {
        .convocado-row { grid-template-columns:38px 1fr auto; }
        .convocado-escudo, .convocado-status-tag { display:none; }
    }
    .selecao-stats-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; }
    .selecao-stat { padding:14px; border-radius:12px; background:rgba(255,255,255,0.055); text-align:center; border:1px solid rgba(255,255,255,0.08); }
    .selecao-stat strong { display:block; font-size:2rem; color:#fff; }
    .modal-convocacao-card { width:min(1100px,94vw); max-height:92vh; overflow:auto; border:1px solid rgba(0,255,136,0.34); border-radius:18px; padding:26px; background:radial-gradient(circle at 50% 0%, rgba(0,255,136,0.2), transparent 32%), linear-gradient(145deg, #141417, #050505); box-shadow:0 28px 90px rgba(0,0,0,0.8); }
    .modal-convocacao-head { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:18px; }
    .modal-convocacao-head img { width:84px; height:58px; object-fit:cover !important; border-radius:10px; }
    .convocacao-modal-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; }
    .convocado-anim { opacity:0; transform:translateY(18px) scale(0.96); animation:convocadoEntrada 0.5s ease forwards; }
    @keyframes convocadoEntrada { to { opacity:1; transform:translateY(0) scale(1); } }
    .bracket-phase { background:linear-gradient(145deg, rgba(15,15,18,0.95), rgba(0,0,0,0.85)); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:20px; margin-bottom:20px; }
    .bracket-title { color:var(--theme-primary); text-transform:uppercase; font-size:0.9rem; letter-spacing:1px; margin:0 0 16px; }
    .knockout-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:14px; }
    .knockout-card { background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:14px; display:flex; flex-direction:column; gap:8px; transition:0.25s; }
    .knockout-card.meu-jogo { border-color:var(--theme-primary); box-shadow:0 0 20px rgba(0,255,136,0.15); }
    .knockout-team { display:flex; align-items:center; gap:10px; padding:8px; border-radius:8px; cursor:pointer; font-weight:700; }
    .knockout-team.winner { color:var(--success); background:rgba(16,185,129,0.12); }
    .knockout-team img { width:28px; height:20px; object-fit:cover; border-radius:4px; }
    .knockout-score { text-align:center; font-size:1.4rem; font-weight:900; color:#fff; padding:6px 0; }
    .penalty-badge { display:inline-block; margin-left:8px; font-size:0.7rem; padding:3px 8px; border-radius:999px; background:rgba(250,204,21,0.2); color:#facc15; font-weight:800; text-transform:uppercase; }
    .bracket-group-card { background:rgba(0,0,0,0.5); border:1px solid #444; border-radius:12px; padding:14px; }
    .bracket-group-card h4 { color:var(--theme-primary); margin:0 0 10px; }
    .bracket-row-me { background:rgba(0,255,136,0.12) !important; color:var(--theme-primary); font-weight:800; }
    .bracket-flag { width:22px; height:15px; margin-right:8px; border-radius:3px; vertical-align:middle; }
    .bracket-tree { display:flex; gap:28px; overflow-x:auto; padding:16px 8px 24px; align-items:stretch; }
    .bracket-round { display:flex; flex-direction:column; justify-content:space-around; gap:18px; min-width:200px; position:relative; }
    .bracket-round:not(:last-child)::after { content:''; position:absolute; right:-14px; top:10%; bottom:10%; width:2px; background:linear-gradient(180deg, transparent, var(--comp-cor, #00ff88), transparent); opacity:0.45; }
    .bracket-round-label { text-align:center; font-size:0.72rem; font-weight:900; text-transform:uppercase; color:var(--comp-cor, var(--theme-primary)); letter-spacing:1px; margin-bottom:4px; }
    .bracket-slot { background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:10px; display:flex; flex-direction:column; gap:6px; position:relative; transition:0.25s; }
    .bracket-slot.meu-jogo { border-color:var(--theme-primary); box-shadow:0 0 18px rgba(0,255,136,0.2); }
    .bracket-slot-score { text-align:center; font-weight:900; font-size:1.1rem; color:#fff; padding:4px 0; border-top:1px dashed rgba(255,255,255,0.1); border-bottom:1px dashed rgba(255,255,255,0.1); }
    .comp-int-shell { padding:4px 0; }
    .comp-int-card { background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:20px; margin-bottom:16px; border-left:4px solid var(--comp-cor, var(--theme-primary)); }
    .comp-int-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px; }
    .comp-int-header h3 { margin:0; font-size:1.4rem; }
    .comp-int-header small { color:#aaa; font-weight:700; }
    .comp-int-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-top:12px; }
    .comp-int-mini { background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.1); border-left:3px solid var(--comp-cor); border-radius:10px; padding:14px; cursor:pointer; transition:0.2s; display:flex; flex-direction:column; gap:4px; }
    .comp-int-mini:hover { transform:translateY(-2px); border-color:var(--comp-cor); }
    .comp-int-mini strong { color:#fff; font-size:0.95rem; }
    .comp-int-mini span { color:#aaa; font-size:0.8rem; }
    .comp-int-mini small { color:var(--gold); font-weight:800; }
    .comp-campeao-banner { text-align:center; padding:20px; margin-top:16px; border-radius:12px; background:linear-gradient(135deg, rgba(250,204,21,0.2), rgba(0,0,0,0.5)); color:var(--gold); font-weight:900; font-size:1.3rem; }
    .comp-int-page { padding:4px 0 24px; }
    .comp-int-hero { position:relative; border-radius:20px; padding:28px 32px; margin-bottom:22px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); background:linear-gradient(135deg, rgba(0,255,136,0.08), rgba(59,130,246,0.06) 50%, rgba(0,0,0,0.6)); display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap; }
    .comp-int-hero-glow { position:absolute; inset:0; background:radial-gradient(circle at 80% 0%, rgba(250,204,21,0.12), transparent 45%); pointer-events:none; }
    .comp-int-hero-content { position:relative; z-index:1; }
    .comp-int-kicker { color:var(--theme-primary); font-weight:900; text-transform:uppercase; font-size:0.75rem; letter-spacing:2px; }
    .comp-int-hero h2 { margin:6px 0 8px; font-size:2rem; font-weight:900; }
    .comp-int-hero p { margin:0; color:#a1a1aa; max-width:520px; }
    .comp-int-hero-stats { display:flex; gap:12px; position:relative; z-index:1; }
    .comp-stat-box { background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:14px 20px; text-align:center; min-width:100px; }
    .comp-stat-box strong { display:block; font-size:1.8rem; color:#fff; line-height:1; }
    .comp-stat-box span { font-size:0.72rem; color:#aaa; text-transform:uppercase; font-weight:800; margin-top:6px; display:block; }
    .comp-cat-tabs { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; }
    .comp-cat-tab { border:1px solid rgba(255,255,255,0.12); background:rgba(0,0,0,0.35); color:#ccc; padding:10px 16px; border-radius:999px; cursor:pointer; font-family:'Montserrat'; font-weight:800; font-size:0.82rem; transition:0.2s; }
    .comp-cat-tab:hover { border-color:var(--theme-primary); color:#fff; }
    .comp-cat-tab.ativo { background:var(--theme-primary); color:#000; border-color:var(--theme-primary); }
    .comp-int-layout { display:grid; grid-template-columns:minmax(240px, 300px) 1fr; gap:20px; align-items:start; }
    .comp-int-sidebar { background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:16px; max-height:70vh; overflow-y:auto; }
    .comp-int-sidebar h4 { margin:0 0 14px; color:var(--theme-primary); font-size:0.85rem; text-transform:uppercase; letter-spacing:1px; }
    .comp-sidebar-item { width:100%; display:flex; gap:12px; align-items:flex-start; text-align:left; padding:12px; margin-bottom:8px; border:1px solid rgba(255,255,255,0.08); border-left:3px solid var(--comp-cor); border-radius:12px; background:rgba(255,255,255,0.03); cursor:pointer; transition:0.2s; font-family:'Montserrat'; color:#fff; }
    .comp-sidebar-item:hover { background:rgba(255,255,255,0.07); transform:translateX(3px); }
    .comp-sidebar-item.ativo { background:rgba(0,255,136,0.1); border-color:var(--theme-primary); box-shadow:0 0 20px rgba(0,255,136,0.12); }
    .comp-sidebar-item strong { display:block; font-size:0.88rem; line-height:1.25; }
    .comp-sidebar-item small { display:block; color:#888; font-size:0.72rem; margin-top:4px; }
    .comp-sidebar-item em { display:block; font-style:normal; color:var(--gold); font-size:0.72rem; font-weight:800; margin-top:4px; }
    .comp-int-main { min-width:0; }
    .comp-int-premium { border-left-width:4px; }
    .comp-int-title-block { display:flex; gap:14px; align-items:center; }
    .comp-int-icon { font-size:2rem; line-height:1; }
    img.comp-int-icon { width:2.4rem; height:2.4rem; object-fit:contain; background:rgba(255,255,255,0.06); border-radius:8px; padding:4px; flex-shrink:0; }
    .comp-int-title-block h3 { margin:0; font-size:1.35rem; }
    .comp-int-title-block p { margin:4px 0 0; color:#888; font-size:0.85rem; }
    .comp-fase-pill { background:rgba(0,0,0,0.4) !important; border-color:var(--comp-cor, var(--theme-primary)) !important; color:var(--comp-cor, var(--theme-primary)) !important; }
    .comp-progress-wrap { height:4px; background:rgba(255,255,255,0.08); border-radius:999px; margin:12px 0 18px; overflow:hidden; }
    .comp-progress-bar { height:100%; background:linear-gradient(90deg, var(--comp-cor, var(--theme-primary)), rgba(255,255,255,0.5)); border-radius:999px; transition:width 0.4s ease; }
    .comp-vagas-banner { display:flex; gap:16px; align-items:center; margin-top:16px; padding:18px; border-radius:14px; background:linear-gradient(135deg, rgba(96,165,250,0.12), rgba(0,0,0,0.5)); border:1px solid rgba(96,165,250,0.25); }
    .comp-vagas-icon { font-size:2rem; }
    .comp-vagas-flags { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
    .comp-vagas-flags img { width:36px; height:24px; object-fit:cover; border-radius:4px; cursor:pointer; border:2px solid transparent; transition:0.2s; }
    .comp-vagas-flags img:hover { border-color:var(--theme-primary); transform:scale(1.1); }
    .comp-table-premium tr.row-qualified { background:rgba(0,255,136,0.1) !important; color:var(--theme-primary); font-weight:700; }
    .comp-empty-main, .comp-empty-sidebar { text-align:center; color:#888; padding:30px 16px; }
    .comp-empty-main span { font-size:3rem; display:block; margin-bottom:12px; }
    .mercado-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:20px; }
    .mercado-panel { background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:20px; }
    .mercado-panel h3 { margin:0 0 14px; color:var(--theme-primary); font-size:1rem; text-transform:uppercase; }
    .desejo-clube { display:flex; align-items:center; gap:12px; padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); margin-bottom:8px; background:rgba(255,255,255,0.03); }
    .desejo-clube img { width:40px; height:40px; object-fit:contain; background:#fff; border-radius:8px; padding:4px; }
    .objetivo-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px dashed rgba(255,255,255,0.08); }
    .objetivo-row.done { color:var(--success); }
    .objetivo-bar { height:6px; background:rgba(255,255,255,0.1); border-radius:999px; margin-top:6px; overflow:hidden; }
    .objetivo-bar-fill { height:100%; background:var(--theme-primary); border-radius:999px; }
    @media (max-width: 900px) { .comp-int-layout { grid-template-columns:1fr; } .mercado-grid { grid-template-columns:1fr; } }
    .grupo-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:14px; }
  .match-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px; }
    @media (max-width: 900px) { .comp-detail-grid, .selecao-shell { grid-template-columns:1fr; } .ranking-mini { position:static; } }

    /* REFINO 2026: MATA-MATAS, SELECOES E COMPETICOES INT */
    .bracket-phase { position:relative; overflow:hidden; border-radius:18px !important; padding:22px !important; background:radial-gradient(circle at 18% 0%, rgba(255,255,255,0.08), transparent 30%), linear-gradient(145deg, rgba(17,17,20,0.96), rgba(0,0,0,0.86)) !important; box-shadow:0 22px 48px rgba(0,0,0,0.32); }
    .bracket-phase::before { content:''; position:absolute; inset:0 0 auto; height:3px; background:linear-gradient(90deg, var(--theme-primary), transparent); opacity:0.9; }
    .bracket-title { display:flex; align-items:center; gap:8px; color:var(--theme-primary) !important; font-size:0.86rem !important; }
    .bracket-title::before { content:'●'; font-size:0.62rem; }
    .knockout-grid { grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)) !important; gap:16px !important; }
    .knockout-card { position:relative; display:grid !important; grid-template-rows:auto auto auto; gap:8px !important; padding:12px !important; border-radius:16px !important; background:linear-gradient(180deg, rgba(255,255,255,0.065), rgba(0,0,0,0.45)) !important; box-shadow:0 18px 34px rgba(0,0,0,0.28); overflow:hidden; }
    .knockout-card::after { content:''; position:absolute; inset:auto 14px 0; height:1px; background:linear-gradient(90deg, transparent, var(--theme-primary), transparent); opacity:0.35; }
    .knockout-card:hover { transform:translateY(-3px); border-color:rgba(255,255,255,0.28); }
    .knockout-card.meu-jogo { border-color:var(--theme-primary) !important; box-shadow:0 0 0 1px rgba(255,255,255,0.08), 0 22px 42px rgba(0,0,0,0.4) !important; }
    .knockout-team { display:grid !important; grid-template-columns:38px minmax(0,1fr); align-items:center; min-height:54px; padding:10px !important; border-radius:12px !important; background:rgba(255,255,255,0.04); font-weight:800 !important; }
    .knockout-team:hover { background:rgba(255,255,255,0.08); }
    .knockout-team.winner { color:var(--success) !important; background:linear-gradient(90deg, rgba(16,185,129,0.18), rgba(255,255,255,0.04)) !important; }
    .knockout-team img { width:38px !important; height:38px !important; border-radius:9px !important; object-fit:contain !important; background:#fff; padding:4px; }
    .knockout-score { font-size:1rem !important; padding:9px 10px !important; border-radius:999px; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); text-transform:uppercase; }
    .bracket-group-card { background:linear-gradient(145deg, rgba(255,255,255,0.055), rgba(0,0,0,0.44)) !important; border:1px solid rgba(255,255,255,0.12) !important; border-radius:14px !important; box-shadow:0 16px 32px rgba(0,0,0,0.2); }
    .bracket-tree { scrollbar-color:var(--theme-primary) rgba(255,255,255,0.08); }
    .bracket-slot { background:linear-gradient(180deg, rgba(255,255,255,0.07), rgba(0,0,0,0.48)) !important; border-radius:14px !important; box-shadow:0 16px 30px rgba(0,0,0,0.28); }
    .comp-int-hero { background:radial-gradient(circle at 80% 0%, rgba(250,204,21,0.13), transparent 36%), radial-gradient(circle at 12% 15%, rgba(0,255,136,0.14), transparent 42%), linear-gradient(145deg, rgba(20,20,24,0.96), rgba(0,0,0,0.72)) !important; border-color:rgba(255,255,255,0.12) !important; box-shadow:0 24px 60px rgba(0,0,0,0.38); }
    .comp-sidebar-item { background:linear-gradient(90deg, rgba(255,255,255,0.045), rgba(0,0,0,0.18)) !important; }
    .comp-sidebar-item.ativo { background:linear-gradient(90deg, color-mix(in srgb, var(--theme-primary) 18%, transparent), rgba(0,0,0,0.2)) !important; }
    .selecao-hero { border-radius:18px !important; background:radial-gradient(circle at 18% 0%, rgba(255,255,255,0.1), transparent 30%), linear-gradient(145deg, rgba(24,24,27,0.96), rgba(0,0,0,0.76)) !important; box-shadow:0 22px 50px rgba(0,0,0,0.32); }
    .manager-shell { display:flex; flex-direction:column; gap:18px; }
    .manager-hero { display:flex; align-items:center; justify-content:space-between; gap:18px; padding:24px; border-radius:18px; border:1px solid rgba(255,255,255,0.12); background:radial-gradient(circle at 85% 0%, rgba(250,204,21,0.14), transparent 34%), linear-gradient(145deg, rgba(24,24,27,0.96), rgba(0,0,0,0.7)); box-shadow:0 22px 55px rgba(0,0,0,0.34); }
    .manager-hero h2 { margin:4px 0; font-size:2rem; }
    .manager-hero p { margin:0; color:#a1a1aa; max-width:620px; }
    .manager-license { min-width:160px; padding:16px; border-radius:14px; background:rgba(0,0,0,0.42); border:1px solid rgba(255,255,255,0.1); text-align:center; }
    .manager-license strong { display:block; color:var(--theme-primary); font-size:1.45rem; }
    .manager-license span { color:#aaa; font-size:0.82rem; font-weight:800; }
    .manager-club-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; }
    .manager-club-card { min-height:160px; border:1px solid rgba(255,255,255,0.1); border-radius:16px; background:linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.36)); color:#fff; font-family:'Montserrat'; cursor:pointer; padding:18px; text-align:left; transition:0.2s; }
    .manager-club-card:hover { transform:translateY(-3px); border-color:var(--theme-primary); }
    .manager-club-card img { width:58px; height:58px; background:#fff; border-radius:12px; padding:6px; margin-bottom:12px; }
    .manager-club-card strong { display:block; font-size:1rem; }
    .manager-club-card span { display:block; color:#aaa; font-size:0.78rem; font-weight:800; margin-top:6px; }
    .manager-club-title { display:flex; align-items:center; gap:16px; }
    .manager-club-title img { width:72px; height:72px; border-radius:14px; background:#fff; padding:8px; }
    .manager-kpis { display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; }
    .manager-kpis div { padding:16px; border-radius:14px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.34); }
    .manager-kpis span { display:block; color:#aaa; font-size:0.72rem; text-transform:uppercase; font-weight:900; }
    .manager-kpis strong { display:block; color:#fff; font-size:1.35rem; margin-top:6px; }
    .manager-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:start; }
    .manager-panel { padding:18px; border-radius:16px; border:1px solid rgba(255,255,255,0.1); background:linear-gradient(145deg, rgba(24,24,27,0.9), rgba(0,0,0,0.48)); }
    .manager-panel h3 { margin:0 0 14px; color:var(--theme-primary); text-transform:uppercase; font-size:0.9rem; }
    .manager-controls { display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; }
    .manager-controls label { color:#aaa; font-size:0.72rem; font-weight:900; text-transform:uppercase; }
    .manager-controls select { width:100%; margin-top:6px; padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.12); background:#09090b; color:#fff; font-family:'Montserrat'; }
    .manager-mini-note { margin-top:12px; color:#facc15; font-weight:900; font-size:0.82rem; }
    .manager-row { display:grid; grid-template-columns:42px minmax(0,1fr) auto; gap:10px; align-items:center; padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.035); margin-bottom:8px; }
    .manager-row img { width:42px; height:42px; border-radius:10px; object-fit:cover !important; background:#111; }
    .manager-row strong { display:block; color:#fff; line-height:1.2; }
    .manager-row small { color:#aaa; font-weight:800; }
    .manager-row em { font-style:normal; color:#facc15; font-weight:900; font-size:0.82rem; }
    .manager-row .btn { padding:8px 10px; font-size:0.72rem; }
    @media (max-width: 900px) { .manager-grid, .manager-kpis, .manager-controls { grid-template-columns:1fr; } .manager-hero { align-items:flex-start; flex-direction:column; } }

    /* ==========================================
       🏆 REDESIGN 2026: COMPETIÇÕES INT — GRUPOS & MATA-MATA
       Camada final e definitiva — sobrepõe qualquer regra antiga
       ========================================== */

    /* ---- Bloco de fase (cabeçalho de cada etapa) ---- */
    .bracket-phase { position:relative !important; overflow:visible !important; background:linear-gradient(150deg, rgba(255,255,255,0.045), rgba(0,0,0,0.55)) !important; border:1px solid rgba(255,255,255,0.08) !important; border-radius:18px !important; padding:22px !important; margin-bottom:22px !important; box-shadow:0 18px 40px rgba(0,0,0,0.3) !important; }
    .bracket-phase::before { content:'' !important; position:absolute !important; inset:0 0 auto 0 !important; height:3px !important; border-radius:18px 18px 0 0 !important; background:linear-gradient(90deg, var(--comp-cor, var(--theme-primary)), transparent) !important; opacity:0.9 !important; }
    .bracket-title { display:flex !important; align-items:center !important; gap:9px !important; margin:0 0 18px !important; padding:0 !important; color:var(--comp-cor, var(--theme-primary)) !important; font-size:0.82rem !important; font-weight:900 !important; text-transform:uppercase !important; letter-spacing:1.5px !important; }
    .bracket-title::after { content:'' !important; flex:1 !important; height:1px !important; background:linear-gradient(90deg, rgba(255,255,255,0.18), transparent) !important; }
    .bracket-title::before { content:'●' !important; font-size:0.55rem !important; color:var(--comp-cor, var(--theme-primary)) !important; }

    /* ---- Stepper de etapas do torneio ---- */
    .comp-stepper { display:flex; align-items:center; gap:0; overflow-x:auto; margin:2px 0 6px; padding-bottom:4px; }
    .comp-step { display:flex; align-items:center; gap:8px; flex-shrink:0; }
    .comp-step-dot { display:flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; font-size:0.68rem; font-weight:900; background:rgba(255,255,255,0.08); color:#9a9aa2; flex-shrink:0; }
    .comp-step-label { font-size:0.72rem; font-weight:800; color:#9a9aa2; text-transform:uppercase; letter-spacing:0.4px; white-space:nowrap; }
    .comp-step.feito .comp-step-dot { background:rgba(16,185,129,0.18); color:var(--success); }
    .comp-step.feito .comp-step-label { color:#c9c9cf; }
    .comp-step.atual .comp-step-dot { background:var(--comp-cor, var(--theme-primary)); color:#000; box-shadow:0 0 0 4px color-mix(in srgb, var(--comp-cor, var(--theme-primary)) 22%, transparent); }
    .comp-step.atual .comp-step-label { color:#fff; }
    .comp-step-line { width:26px; height:2px; background:rgba(255,255,255,0.14); margin:0 6px; flex-shrink:0; }

    /* ---- Fase de grupos ---- */
    .grupo-grid { display:grid !important; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)) !important; gap:16px !important; margin-top:0 !important; }
    .bracket-group-card { background:linear-gradient(160deg, rgba(255,255,255,0.05), rgba(0,0,0,0.5)) !important; border:1px solid rgba(255,255,255,0.09) !important; border-left:3px solid var(--comp-cor, var(--theme-primary)) !important; border-radius:14px !important; padding:16px !important; backdrop-filter:none !important; box-shadow:0 12px 26px rgba(0,0,0,0.25) !important; transition:0.25s !important; }
    .bracket-group-card:hover { transform:translateY(-2px) !important; border-color:var(--comp-cor, var(--theme-primary)) !important; box-shadow:0 16px 32px rgba(0,0,0,0.32) !important; }
    .grupo-card-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:12px; }
    .bracket-group-card h4 { margin:0 !important; padding:0 !important; color:#fff !important; font-size:0.95rem !important; font-weight:900 !important; text-transform:uppercase !important; letter-spacing:1px !important; }
    .bracket-group-card h4::before { content:none !important; }
    .grupo-card-meta { font-size:0.65rem; color:var(--comp-cor, var(--theme-primary)); font-weight:800; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap; }

    .grupo-table { width:100% !important; border-collapse:collapse !important; border-spacing:0 !important; }
    .grupo-table thead th { text-align:left !important; padding:0 8px 8px !important; color:#7c7c85 !important; font-size:0.6rem !important; text-transform:uppercase !important; letter-spacing:1px !important; font-weight:900 !important; border-bottom:1px solid rgba(255,255,255,0.08) !important; background:none !important; }
    .grupo-table th.col-pos, .grupo-table td.col-pos { text-align:center !important; width:30px; }
    .grupo-table th:not(.col-team):not(.col-pos), .grupo-table td:not(.col-team):not(.col-pos) { text-align:center !important; }
    .grupo-table tbody tr { cursor:pointer; transition:0.15s; }
    .grupo-table tbody tr:hover td { background:rgba(255,255,255,0.045) !important; }
    .grupo-table td { padding:9px 8px !important; font-size:0.85rem !important; font-weight:600 !important; color:#e4e4e7 !important; background:none !important; border-radius:0 !important; border-bottom:1px solid rgba(255,255,255,0.05) !important; }
    .grupo-table tbody tr:last-child td { border-bottom:none !important; }
    .grupo-table tr td:first-child, .grupo-table tr td:last-child { border-radius:0 !important; padding-left:8px !important; padding-right:8px !important; }
    .grupo-table td.col-team { display:flex; align-items:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .grupo-table td strong { color:#fff !important; font-weight:900 !important; }

    .grupo-pos { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; background:rgba(255,255,255,0.08); font-weight:900; font-size:0.72rem; color:#aaa; }
    .grupo-pos.rank-1 { background:linear-gradient(135deg, #fde68a, #d97706); color:#241a00; }
    .grupo-pos.rank-2 { background:linear-gradient(135deg, #f1f5f9, #94a3b8); color:#1a1a1a; }
    .grupo-pos.rank-3 { background:linear-gradient(135deg, #f0c9a0, #b0692f); color:#241505; }

    tr.row-qualifica td { background:color-mix(in srgb, var(--comp-cor, var(--theme-primary)) 7%, transparent) !important; }
    tr.linha-corte td { border-bottom:2px dashed color-mix(in srgb, var(--comp-cor, var(--theme-primary)) 55%, transparent) !important; padding-bottom:12px !important; }

    .bracket-row-me { background:color-mix(in srgb, var(--comp-cor, var(--theme-primary)) 14%, transparent) !important; }
    .bracket-row-me td { color:var(--comp-cor, var(--theme-primary)) !important; font-weight:800 !important; }
    .bracket-flag { width:24px !important; height:17px !important; object-fit:contain !important; border-radius:3px !important; margin-right:9px !important; vertical-align:middle !important; box-shadow:0 2px 6px rgba(0,0,0,0.3) !important; flex-shrink:0; background:rgba(255,255,255,0.06) !important; }

    .comp-table-premium { padding:16px !important; }

    /* ---- Chaveamento / mata-mata ---- */
    .bracket-tree { display:flex !important; gap:20px !important; overflow-x:auto !important; padding:2px 2px 8px !important; align-items:flex-start !important; scrollbar-color:var(--comp-cor, var(--theme-primary)) rgba(255,255,255,0.08); }
    .bracket-round { min-width:0 !important; flex:1 1 100% !important; position:static !important; }
    .bracket-round::after { display:none !important; }
    .bracket-round-label { text-align:left !important; font-size:0.7rem !important; font-weight:900 !important; text-transform:uppercase !important; color:var(--comp-cor, var(--theme-primary)) !important; letter-spacing:1.5px !important; margin:0 0 12px !important; }
    .bracket-round-slots { display:grid; grid-template-columns:repeat(auto-fit, minmax(290px, 1fr)); gap:14px; }

    .bracket-slot { background:linear-gradient(160deg, rgba(255,255,255,0.05), rgba(0,0,0,0.55)) !important; border:1px solid rgba(255,255,255,0.09) !important; border-left:3px solid var(--comp-cor, #00ff88) !important; border-radius:14px !important; padding:5px !important; display:block !important; gap:0 !important; position:relative !important; box-shadow:0 12px 26px rgba(0,0,0,0.25) !important; transition:0.2s !important; }
    .bracket-slot:hover { transform:translateY(-2px); border-color:var(--comp-cor, #00ff88) !important; }
    .bracket-slot.meu-jogo { box-shadow:0 0 0 1px var(--comp-cor, #00ff88), 0 16px 30px rgba(0,0,0,0.35) !important; }
    .bracket-slot.pendente .bracket-slot-goals { opacity:0.35; }

    .bracket-slot-team { display:grid; grid-template-columns:30px minmax(0,1fr) auto 16px; align-items:center; gap:9px; padding:8px 9px; border-radius:9px; cursor:pointer; font-weight:700; font-size:0.86rem; }
    .bracket-slot-team:hover { background:rgba(255,255,255,0.05); }
    /* 🛡️ FIX: o escudo era um retângulo 26x18 com object-fit:cover (herdado do
       estilo das bandeirinhas de país) — isso CORTAVA o topo/base dos escudos
       dos clubes, que são quadrados/circulares. Agora é quadrado com contain,
       mostrando o escudo inteiro sem cortar nada. */
    .bracket-slot-crest { width:28px !important; height:28px !important; object-fit:contain; border-radius:6px; background:rgba(255,255,255,0.06); flex-shrink:0; }
    .bracket-slot-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#e4e4e7; min-width:0; }
    .bracket-slot-goals { font-variant-numeric:tabular-nums; font-weight:900; font-size:1.05rem; color:#fff; min-width:16px; text-align:center; }
    .bracket-slot-check { color:var(--success); font-weight:900; font-size:0.8rem; }
    .bracket-slot-team.winner { background:linear-gradient(90deg, rgba(16,185,129,0.16), rgba(16,185,129,0.02)); }
    .bracket-slot-team.winner .bracket-slot-name { color:var(--success); }
    .bracket-slot-team.eliminated { opacity:0.4; filter:grayscale(0.5); }
    .bracket-slot-team.tbd { opacity:0.4; font-style:italic; cursor:default; }
    .tbd-crest { display:flex !important; align-items:center; justify-content:center; color:#777; font-size:0.65rem; font-style:normal; }

    .bracket-slot-mid { display:flex; align-items:center; justify-content:center; gap:8px; padding:1px 9px 3px; }
    .bracket-slot-vs { font-size:0.6rem; font-weight:900; letter-spacing:1.5px; color:rgba(255,255,255,0.3); }

    /* 🛡️ FIX: a árvore horizontal de mata-mata (renderArvoreHorizontalMataMata)
       calcula um "top" em pixels para posicionar cada confronto e alinhá-lo
       com o par correspondente na rodada seguinte — mas essa CSS nunca tinha
       sido escrita! Sem "position:relative" no contentor e "position:absolute"
       no card, o "top" inline não tem NENHUM efeito (é ignorado em elementos
       com position:static), e os cards ficavam em fluxo normal, empilhando e
       cortando-se uns aos outros — exatamente o bug relatado ("só dá para ver
       1 time"). */
    .bracket-tree-scroll { overflow-x:auto; overflow-y:visible; padding:10px 4px 28px; }
    .bracket-tree-round { display:flex; flex-direction:column; flex-shrink:0; }
    .bracket-tree-round-title { text-align:center; font-weight:900; text-transform:uppercase; font-size:0.72rem; letter-spacing:1.2px; color:var(--comp-cor, var(--theme-primary)); margin-bottom:12px; }
    .bracket-tree-round-body { position:relative; }
    .bracket-tree-match { position:absolute; left:0; overflow:visible; }
    .bracket-tree-connector { flex-shrink:0; align-self:center; }
    .bracket-tree-bloco-sep { text-align:center; color:var(--theme-primary,#00ff88); font-size:0.8rem; font-weight:600; letter-spacing:0.3px; padding:6px 0 12px; opacity:0.85; }

    /* ==========================================
       🎬 OVERLAY DE INTRODUÇÃO DE COMPETIÇÃO
       🛡️ FIX: esta classe nunca teve CSS nenhum — o overlay devia aparecer
       em tela cheia como uma cinemática, mas sem esta regra ele só existia
       "solto" no HTML, sem posição nem tamanho.
       ========================================== */
    .intro-comp-overlay { position:fixed; inset:0; z-index:99999; background:#000; display:flex; align-items:center; justify-content:center; overflow:hidden; }
    .intro-comp-video { width:100%; height:100%; object-fit:cover; }
    .intro-comp-fallback { position:relative; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
    .intro-comp-rays { position:absolute; inset:-20%; background:conic-gradient(from 0deg, transparent, var(--intro-cor, #facc15) 8%, transparent 16%); opacity:0.25; animation:girarRays 12s linear infinite; }
    @keyframes girarRays { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
    .intro-comp-logo { width:140px; height:140px; object-fit:contain; margin-bottom:24px; position:relative; z-index:1; filter:drop-shadow(0 0 30px rgba(255,255,255,0.3)); animation:pulsarLogo 2.2s ease-in-out infinite; }
    @keyframes pulsarLogo { 0%,100% { transform:scale(1); } 50% { transform:scale(1.06); } }
    .intro-comp-title { position:relative; z-index:1; font-size:2.6rem; font-weight:900; text-transform:uppercase; letter-spacing:2px; color:#fff; text-shadow:0 0 24px var(--intro-cor, #facc15); margin:0; }
    .intro-comp-sub { position:relative; z-index:1; color:#ccc; font-size:1rem; margin-top:10px; letter-spacing:3px; text-transform:uppercase; }
    .intro-comp-skip { position:fixed; bottom:24px; right:24px; z-index:2; padding:10px 20px; border-radius:24px; border:1px solid rgba(255,255,255,0.25); background:rgba(0,0,0,0.5); color:#fff; font-weight:700; cursor:pointer; backdrop-filter:blur(6px); }
    .intro-comp-skip:hover { background:rgba(255,255,255,0.15); }

    /* ==========================================
       🎮 MINI-JOGO DE PÊNALTI INTERATIVO
       ========================================== */
    .penalti-overlay { position:fixed; inset:0; z-index:99998; background:rgba(0,0,0,0.88); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
    .penalti-modal { text-align:center; padding:20px; max-width:480px; width:92%; }
    .penalti-titulo { font-size:1.8rem; font-weight:900; color:var(--theme-primary); margin:0 0 6px; text-transform:uppercase; letter-spacing:1px; }
    .penalti-sub { color:#ccc; margin:0 0 24px; }
    .penalti-baliza { position:relative; background:linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01)); border:4px solid #fff; border-bottom:none; border-radius:6px 6px 0 0; display:grid; grid-template-columns:repeat(3, 1fr); height:180px; box-shadow:0 0 60px rgba(255,255,255,0.08) inset; }
    .penalti-zona { display:flex; align-items:center; justify-content:center; font-size:2.4rem; cursor:pointer; border-right:2px dashed rgba(255,255,255,0.15); transition:0.15s; user-select:none; }
    .penalti-zona:last-child { border-right:none; }
    .penalti-zona:hover { background:rgba(0,255,136,0.15); transform:scale(1.05); }
    .penalti-zona.escolhida { background:rgba(0,255,136,0.3); animation:pulsarZonaEscolhida 0.5s ease-in-out infinite alternate; }
    @keyframes pulsarZonaEscolhida { from { background:rgba(0,255,136,0.25); } to { background:rgba(0,255,136,0.45); } }
    .penalti-resultado { margin-top:22px; font-size:1.1rem; font-weight:800; color:#fff; min-height:1.4em; }

    /* ==========================================
       🎯 DISPUTA DE PÊNALTIS (mata-mata de clube empatado)
       ========================================== */
    .shootout-overlay { position:fixed; inset:0; z-index:99997; background:rgba(0,0,0,0.92); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
    .shootout-modal { text-align:center; padding:24px; max-width:520px; width:92%; }
    .shootout-titulo { font-size:1.6rem; font-weight:900; color:var(--gold); margin:0 0 20px; text-transform:uppercase; letter-spacing:1px; }
    .shootout-placar { display:flex; align-items:center; justify-content:center; gap:18px; margin-bottom:16px; }
    .shootout-time { display:flex; flex-direction:column; align-items:center; gap:6px; min-width:110px; }
    .shootout-time img { width:44px; height:44px; object-fit:contain; }
    .shootout-time span { font-size:0.85rem; font-weight:700; color:#ccc; }
    .shootout-time strong { font-size:2.2rem; font-weight:900; color:#fff; }
    .shootout-vs { font-size:1.4rem; color:#666; font-weight:900; }
    .shootout-bolas { display:flex; gap:6px; justify-content:center; min-height:24px; margin-bottom:4px; }
    .shootout-bola { font-size:1.1rem; }
    .shootout-bola.falhou { filter:grayscale(1); opacity:0.6; }
    .shootout-status { margin-top:18px; font-size:1.05rem; font-weight:700; color:var(--theme-primary); min-height:1.4em; }
    .penalty-badge { display:inline-block !important; margin:0 !important; font-size:0.62rem !important; padding:2px 7px !important; border-radius:999px !important; background:rgba(250,204,21,0.18) !important; color:#facc15 !important; font-weight:800 !important; text-transform:uppercase !important; }

    @media (max-width: 640px) {
        .comp-int-layout { grid-template-columns:1fr !important; }
        .bracket-round-slots { grid-template-columns:1fr; }
        .grupo-grid { grid-template-columns:1fr !important; }
    }

    /* ---- Chaveamento com abas (Fase de Grupos / Oitavas / Quartas / Semis / Final) ---- */
    .bracket-tabs-wrap { display:flex; flex-direction:column; gap:16px; }
    .bracket-tabs { display:flex; gap:8px; flex-wrap:wrap; padding:6px; border-radius:14px; background:rgba(0,0,0,0.32); border:1px solid rgba(255,255,255,0.1); }
    .bracket-tab-btn { flex:1 1 auto; min-width:110px; padding:12px 14px; border-radius:10px; border:1px solid transparent; background:transparent; color:#a1a1aa; font-family:'Montserrat'; font-weight:800; font-size:0.76rem; text-transform:uppercase; letter-spacing:0.5px; cursor:pointer; transition:0.2s ease; white-space:nowrap; }
    .bracket-tab-btn:hover { color:#fff; background:rgba(255,255,255,0.07); }
    .bracket-tab-btn.ativo { background:var(--comp-cor, var(--theme-primary)); color:#000; box-shadow:0 8px 20px rgba(0,0,0,0.32); }
    .bracket-tab-panel { display:none; }
    .bracket-tab-panel.ativo { display:block; animation: fadeIn 0.25s ease; }
    .bracket-grid-confrontos { display:grid; grid-template-columns:repeat(2, 1fr); grid-auto-rows:min-content; align-content:start; gap:14px; max-height:calc(100vh - 360px); min-height:220px; overflow-y:auto; padding-right:4px; }
    @media (max-width: 900px) {
        .bracket-grid-confrontos { grid-template-columns:1fr; max-height:none; overflow-y:visible; }
        .bracket-tabs { overflow-x:auto; flex-wrap:nowrap; }
    }
`;
document.head.appendChild(styleOverrides);

// ==========================================
// 🔍 FUNÇÕES DE APOIO E UTILIDADES
// ==========================================
function normalizarTexto(texto) { return texto ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : ""; }

function obterPaisCompeticaoId(compId) {
    const partes = String(compId || "").split("_");
    if (partes[0] === "copa" || partes[0] === "supercopa" || partes[0] === "carabao") return partes[1] || partes[0];
    // 🛡️ FIX: campeonatos estaduais (estadual_sp, estadual_rj, ...) são todos
    // brasileiros — sem isto, o jogo tentava (erradamente) tratá-los como um
    // "país" chamado "estadual", quebrando o calendário e o agrupamento por país.
    if (partes[0] === "estadual") return "br";
    return partes[0];
}

function obterUrlImagem(entidade, tipo) {
    if (!entidade) return "";
    if (tipo === 'trofeu') {
        if(entidade.includes("Bola de Ouro") || entidade.includes("Melhor do Mundo")) return "https://i.ibb.co/4Z0zvRz7/d9404dec-5649-4fd5-95e9-2e9be21bb805.png";
        if(entidade.includes("Golden Boy")) return "https://i.ibb.co/b5Sd7xcQ/9643960f-eb44-407e-bbaf-bf60218a4c6b.png";
        if(entidade.includes("Chuteira de Ouro")) return "https://i.ibb.co/ch87vZpv/41f6515d-fe2a-4628-9d9d-15fa1a8fe84f.png";
        if(entidade.includes("Assist") || entidade.includes("Maestro") || entidade.includes("Rei das Assistencias")) return "https://cdn-icons-png.flaticon.com/512/1004/1004314.png";
        if(entidade.includes("Luva de Ouro")) return "https://i.ibb.co/Kj8b22RW/3c80b476-f71c-4436-90f5-a0e16a48e56d.png";
        if(entidade.includes("UEFA Best Player")) return "https://tmssl.akamaized.net//images/titel/medium/152.png?lm=1396275124";
        if(entidade.includes("FIFA The Best")) return "https://tmssl.akamaized.net//images/titel/medium/195.png?lm=1575286754";

        if(entidade.includes("Champions League") || entidade.includes("uefa_cl")) return "https://i.ibb.co/4nKhHSYv/5491af57-2610-4491-8266-979218ed4fb0.png";
        if(entidade.includes("Europa League") || entidade.includes("uefa_el")) return "https://i.ibb.co/bRsmDFBX/bdf3a3e3-0934-46d3-b907-7677c066f624.png";
        if(entidade.includes("Conference League") || entidade.includes("uefa_col")) return "https://i.ibb.co/B2CLnqDj/a86536a9-4c52-40f5-a1af-3615694c2d46.png";

        if(entidade.includes("Copa do Mundo") || entidade.includes("sel_copa_mundo")) return "https://i.ibb.co/8ngb5Csz/031efcc4-f6b7-422f-8e52-9d252579b9b2.png";
        if(entidade.includes("Eurocopa") || entidade.includes("sel_euro") || entidade.includes("euro")) return "https://tmssl.akamaized.net//images/erfolge/medium/102.png?lm=1520606997";
        if(entidade.includes("Copa América") || entidade.includes("sel_copa_america")) return "https://tmssl.akamaized.net//images/erfolge/medium/106.png?lm=1461847499";
        if(entidade.includes("Nations League") || entidade.includes("sel_nations_a")) return "https://tmssl.akamaized.net//images/erfolge/medium/601.png?lm=1653914395";
        if(entidade.includes("Gold Cup") || entidade.includes("concacaf_gold_cup"))  return "https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/2025_CONCACAF_Gold_Cup_logo.svg/512px-2025_CONCACAF_Gold_Cup_logo.svg.png";
        if(entidade.includes("Copa Africana") || entidade.includes("afcon")) return "https://upload.wikimedia.org/wikipedia/en/thumb/3/31/Africa_Cup_of_Nations_logo.svg/512px-Africa_Cup_of_Nations_logo.svg.png";
        if(entidade.includes("Copa da Ásia") || entidade.includes("asian_cup")) return "https://upload.wikimedia.org/wikipedia/en/thumb/0/08/AFC_Asian_Cup_logo.svg/512px-AFC_Asian_Cup_logo.svg.png";
        if(entidade.includes("Oceania Cup") || entidade.includes("ofc_nations_cup") || entidade.includes("Copa das Nações da Oceania") || entidade.includes("oceania_cup")) return "https://tmssl.akamaized.net//images/erfolge/medium/108.png?lm=1461847499";

        if(entidade.includes("Mundial Sub17") || entidade.includes("mundial_sub17")) return "https://i.ibb.co/8ngb5Csz/031efcc4-f6b7-422f-8e52-9d252579b9b2.png";
        if(entidade.includes("Mundial Sub21") || entidade.includes("mundial_sub21")) return "https://tmssl.akamaized.net//images/erfolge/medium/158.png?lm=1657627706";


        if(entidade.includes("Libertadores") || entidade.includes("conmebol_lib")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/328-3287452_copa-libertadores-primer-trofeo-hd-png-download.png/250px-328-3287452_copa-libertadores-primer-trofeo-hd-png-download.png";
        if(entidade.includes("Sulamericana") || entidade.includes("conmebol_sul")) return "https://tmssl.akamaized.net//images/erfolge/medium/154.png?lm=1520606999";

        if(entidade.includes("afc_cla ") || entidade.includes("AFC Champions")) return "https://r2.thesportsdb.com/images/media/league/trophy/5dzvma1747117869.png/medium";

        if(entidade.includes("concacaf_clc") || entidade.includes("Concacaf Champions Cup")) return "https://tmssl.akamaized.net//images/erfolge/medium/306.png?lm=1654760845";

        if(entidade.includes("intercontinental_cup") || entidade.includes("Intercontinental FIFA")) return "https://tmssl.akamaized.net//images/erfolge/medium/1100.png?lm=1734608335";
        if(entidade.includes("uefa_supercup") || entidade.includes("Supercopa da UEFA")) return "https://tmssl.akamaized.net//images/erfolge/medium/354.png?lm=1780326884";
        if(entidade.includes("conmebol_recopa") || entidade.includes("Recopa Sudamericana")) return "https://tmssl.akamaized.net//images/erfolge/medium/338.png?lm=1461847499";
    
    
    
       
        //AMERICA SUL
        if(entidade.includes("Brasileirão Série A") || entidade.includes("br_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/262.png?lm=1466586549";
        if(entidade.includes("Brasileirão Série B") || entidade.includes("br_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/462.png?lm=1466588515";
        if(entidade.includes("Brasileirão Série C") || entidade.includes("br_3")) return "https://i.ibb.co/1J8Mxb0y/ec693812-f11f-4a50-9424-4a319cfb05c6.png";
        if(entidade.includes("Brasileirão Série D") || entidade.includes("br_4")) return "https://i.ibb.co/LXC52Z2K/445d2bf5-5565-4bfa-b870-d8f08a0d7005.png";
        if(entidade.includes("Copa do Brasil") || entidade.includes("copa_br")) return "https://tmssl.akamaized.net//images/erfolge/medium/263.png?lm=1461847499";
        if(entidade.includes("Supercopa do Brasil") || entidade.includes("supercopa_br")) return "https://tmssl.akamaized.net//images/erfolge/medium/648.png?lm=1654593971";
        if (entidade.includes("Campeonato Paulista") || entidade.includes("estadual_sp")) return "https://tmssl.akamaized.net//images/erfolge/medium/1107.png?lm=1739982163";
        if (entidade.includes("Campeonato Carioca") || entidade.includes("estadual_rj")) return "https://tmssl.akamaized.net//images/erfolge/medium/1108.png?lm=1739982183";
        if (entidade.includes("Campeonato Mineiro") || entidade.includes("estadual_mg")) return "https://tmssl.akamaized.net/images/erfolge/medium/1112.png";
        if (entidade.includes("Campeonato Gaúcho") || entidade.includes("estadual_rs")) return "https://tmssl.akamaized.net/images/erfolge/medium/1110.png";
        if (entidade.includes("Campeonato Paranaense") || entidade.includes("estadual_pr")) return "https://i.ibb.co/m5tCHN5v/0fcd6b58-a07f-44c9-9ac1-ec52b308a46d.png";
        if (entidade.includes("Campeonato Catarinense") || entidade.includes("estadual_sc")) return "https://i.ibb.co/wZzFgB4r/image.png";
        if (entidade.includes("Campeonato Goiano") || entidade.includes("estadual_go")) return "https://i.ibb.co/LXhYc3DP/bd935139-1fe4-4b76-9020-c3b7e1489b41.png";
        if (entidade.includes("Campeonato Pernambucano") || entidade.includes("estadual_pe")) return "https://i.ibb.co/m5tCHN5v/0fcd6b58-a07f-44c9-9ac1-ec52b308a46d.png";
        if (entidade.includes("Campeonato Baiano") || entidade.includes("estadual_ba")) return "https://tmssl.akamaized.net//images/erfolge/medium/1113.png?lm=1739982048";
        if (entidade.includes("Campeonato Cearense") || entidade.includes("estadual_ce")) return "https://i.ibb.co/JFwg8KcQ/image.png";

        if (entidade.includes("Liga Profesional Argentina") || entidade.includes("arg_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/297.png?lm=1704400701";
        if (entidade.includes("Copa Argentina") || entidade.includes("copa_arg")) return "https://tmssl.akamaized.net//images/erfolge/medium/843.png?lm=1647532051";
        if (entidade.includes("Supercopa Argentina") || entidade.includes("supercopa_arg")) return "https://tmssl.akamaized.net//images/erfolge/medium/970.png?lm=1686235805";

        if (entidade == ("Primera División Uruguaya") || entidade.includes("uy_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/251.png?lm=1767143424";


        
        //EUROPA
        if(entidade == ("Premier League") || entidade.includes("eng_1")) return "https://i.ibb.co/cSZyLnqP/bff12c7f-4c7a-4313-a4d8-7d67d1e68cb0.png";
        if(entidade.includes("Championship") || entidade.includes("eng_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/869.png?lm=1646225519";
        if(entidade.includes("Carabao Cup") || entidade.includes("carabao_eng")) return "https://tmssl.akamaized.net//images/erfolge/medium/47.png?lm=1520606999";
        if(entidade.includes("FA Cup") || entidade.includes("copa_eng")) return "https://tmssl.akamaized.net//images/erfolge/medium/29.png?lm=1520606999";
        if(entidade.includes("Community Shield") || entidade.includes("supercopa_eng")) return "https://tmssl.akamaized.net//images/erfolge/medium/316.png?lm=1520606999";

        if(entidade.includes("Bundesliga") || entidade.includes("ger_1")) return "https://tmssl.akamaized.net//images/erfolge/header/10.png?lm=1520606996";
        if(entidade.includes("Bundesliga 2") || entidade.includes("ger_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/378.png?lm=1461847499";
        if(entidade.includes("DFB-Pokal") || entidade.includes("copa_ger")) return "https://tmssl.akamaized.net//images/erfolge/medium/27.png?lm=1520606999";
        if(entidade.includes("DFL-Supercup") || entidade.includes("supercopa_ge")) return "https://tmssl.akamaized.net//images/erfolge/medium/312.png?lm=1520606999";

        if(entidade == ("La Liga") || entidade.includes("esp_1")) return "https://i.ibb.co/v6QhJQFn/bfa85829-8d60-4816-a4c8-453fba80dd94.png";
        if (entidade == ("La Liga 2") || entidade.includes("esp_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/878.png?lm=1647419746";
        if(entidade.includes("Copa del Rey") || entidade.includes("copa_esp")) return "https://tmssl.akamaized.net//images/erfolge/medium/94.png?lm=1520606999";
        if(entidade.includes("Supercopa da Espanha") || entidade.includes("supercopa_esp")) return "https://tmssl.akamaized.net//images/erfolge/medium/93.png?lm=1520606999";

        if(entidade.includes("Serie A") || entidade.includes("ita_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/13.png?lm=1520606997";
        if (entidade.includes("Serie B") || entidade.includes("ita_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/436.png?lm=1651745299";
        if(entidade.includes("Coppa Italia") || entidade.includes("copa_ita")) return "https://tmssl.akamaized.net//images/erfolge/medium/96.png?lm=1520606999";
        if(entidade.includes("Supercoppa Italiana") || entidade.includes("supercopa_ita")) return "https://tmssl.akamaized.net//images/erfolge/medium/97.png?lm=1520606999";

        if(entidade.includes("Liga Portugal") || entidade.includes("pt_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/15.png?lm=1520606999";
        if(entidade.includes("Liga Portugal 2") || entidade.includes("pt_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/458.png?lm=1511173307";
        if(entidade.includes("Taca de Portugal") || entidade.includes("copa_pt")) return "https://tmssl.akamaized.net//images/erfolge/medium/100.png?lm=1520606996";
        if(entidade.includes("Supertaca de Portugal") || entidade.includes("supercopa_pt")) return "https://tmssl.akamaized.net//images/erfolge/medium/337.png?lm=1520606999";

        if(entidade.includes("Ligue 1") || entidade.includes("fra_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/14.png?lm=1729163534";  
        if (entidade == ("Ligue 2") || entidade.includes("fra_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/981.png?lm=1734352209";
        if(entidade.includes("Coupe de France") || entidade.includes("copa_fra")) return "https://tmssl.akamaized.net//images/erfolge/medium/35.png?lm=1520606999";
        if(entidade.includes("Trophee des Champions") || entidade.includes("supercopa_fra")) return "https://tmssl.akamaized.net//images/erfolge/medium/321.png?lm=1704485193";

        if(entidade.includes("Eredivise") || entidade.includes("nl_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/16.png?lm=1520606999";
        if(entidade.includes("KNVB Cup") || entidade.includes("copa_nl")) return "https://tmssl.akamaized.net//images/erfolge/medium/151.png?lm=1520606999";
        if(entidade.includes("Johan Cruyff Shield") || entidade.includes("supercopa_nl")) return "https://tmssl.akamaized.net//images/erfolge/medium/288.png?lm=1511173147";

        if(entidade.includes("Süper Lig") || entidade.includes("tr_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/20.png?lm=1780043166";
         if (entidade.includes("1.Lig") || entidade.includes("tr_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/947.png?lm=1780043224";
        if(entidade.includes("Turkish Cup") || entidade.includes("copa_tr")) return "https://tmssl.akamaized.net//images/erfolge/medium/148.png?lm=1780049586";
        if(entidade.includes("Turkish Super Cup") || entidade.includes("Süpercopa_tr")) return "https://tmssl.akamaized.net//images/erfolge/medium/149.png?lm=1780055873";

        if(entidade.includes("Eliteserien") || entidade.includes("nor_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/295.png?lm=1461847499";
        if (entidade.includes("Taça NM") || entidade.includes("copa_nor")) return "https://tmssl.akamaized.net//images/erfolge/medium/294.png?lm=1461847499";
        if (entidade.includes("Mesterfinalen") || entidade.includes("supercopa_nor")) return "";

        if (entidade.includes("Jupiler Pro League") || entidade.includes("be_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/18.png?lm=1461847499";
        if (entidade.includes("Croky Cup") || entidade.includes("copa_be")) return "https://tmssl.akamaized.net//images/erfolge/medium/150.png?lm=1520606999";
        if (entidade.includes("Pro League Super Cup") || entidade.includes("supercopa_be")) return "https://tmssl.akamaized.net//images/erfolge/medium/488.png?lm=1511178751";

        if (entidade == ("Scottish Premiership") || entidade.includes("sco_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/19.png?lm=1461847499";
        if (entidade.includes("Scottish Challenge Cup") || entidade.includes("copa_sco")) return "https://tmssl.akamaized.net//images/erfolge/medium/87.png?lm=1461847499";
        if (entidade.includes("Scottish Super Cup") || entidade.includes("supercopa_sco")) return "https://tmssl.akamaized.net//images/erfolge/medium/88.png?lm=1461847499";

         //ASIA
        if(entidade.includes("Saudi Pro") || entidade.includes("ara_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/271.png?lm=1748099013";
        if(entidade.includes("Kings Cup") || entidade.includes("copa_ara")) return "https://tmssl.akamaized.net//images/erfolge/medium/456.png?lm=1626256782";
        if(entidade.includes("Saudi Super Cup") || entidade.includes("Supercopa_ara")) return "https://tmssl.akamaized.net//images/erfolge/medium/457.png?lm=1616407405";

         if(entidade.includes("Nigeria Professional Football League") || entidade.includes("nga_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/516.png?lm=1780133279";
         if (entidade ==("Ligue 1 Côte d'Ivoire") || entidade.includes("civ_1")) return "https://i.ibb.co/B592MmYZ/image.png";
  
        
         //AMERICA NORTE
        if(entidade.includes("MLS") || entidade.includes("usa_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/241.png?lm=1520606999";
        if(entidade.includes("Open Cup") || entidade.includes("copa_usa")) return "https://tmssl.akamaized.net//images/erfolge/medium/244.png?lm=1466586047";
        if(entidade.includes("Leagues Cup") || entidade.includes("Supercopa_usa")) return "https://tmssl.akamaized.net//images/erfolge/medium/604.png?lm=1606063811";

        if(entidade == ("Liga MX Apertura") || entidade.includes("mx_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/153.png?lm=1461847499";
        if(entidade == ("Copa Mexico") || entidade.includes("copa_mx")) return "";

    }
    let entidadex = entidade;
    if (typeof entidade === 'string') {
        if (tipo === 'jogador') { let enc = jogadoresIA.find(j => j.nome === entidade || j.id === entidade); if (enc) entidadex = enc; } 
        else if (tipo === 'clube') { let enc = clubes.find(c => c.id === entidade || c.nome === entidade); if (enc) entidadex = enc; } 
        else if (tipo === 'competicao') { let enc = competicoes.find(c => c.id === entidade); if (enc) entidadex = enc; }
    }
    const urlDatabase = entidadex.foto || entidadex.logo;
    if (urlDatabase && urlDatabase.trim() !== "") return urlDatabase;

    let nome = entidadex.nome || entidadex; let limpo = encodeURIComponent(nome);
    if(tipo === 'jogador') return `https://ui-avatars.com/api/?name=${limpo}&background=random&color=fff&size=150&font-size=0.4`;
    if(tipo === 'clube') return `https://ui-avatars.com/api/?name=${limpo}&background=18181b&color=00ff88&size=150&rounded=true&font-size=0.4`;
    if(tipo === 'competicao') return `https://ui-avatars.com/api/?name=${limpo}&background=facc15&color=000&size=150&rounded=true&font-size=0.4`;
    return "";
}

function calcularValorNumerico(geral, idade) {
    let base = Math.pow(Math.max(1, geral - 40), 2.55) * 1350;
    if (idade <= 19) base *= 3.0; else if (idade <= 22) base *= 2.05; else if (idade <= 26) base *= 1.28;
    else if (idade >= 34) base *= 0.22; else if (idade >= 31) base *= 0.45; else if (idade >= 29) base *= 0.72;
    if (geral >= 92) base *= 1.9; else if (geral >= 88) base *= 1.55; else if (geral >= 84) base *= 1.22;
    return Math.floor(base);
}
function obterEstatisticasCarreira(j) {
    const hist = j?.historicoCarreira || [];
    const atual = j === jogador ? (j.estatisticasAtuais || {}) : (j.statsTemporada || {});
    return hist.reduce((acc, h) => {
        acc.jogos += h.jogos || 0; acc.gols += h.gols || 0; acc.assistencias += h.assistencias || 0;
        return acc;
    }, { jogos: atual.jogos || 0, gols: atual.gols || 0, assistencias: atual.assistencias || 0 });
}
function calcularValorMercadoJogador(j) {
    let valor = calcularValorNumerico(j.geral || 60, j.idade || 24);
    const st = j === jogador ? (j.estatisticasAtuais || {}) : (j.statsTemporada || {});
    const jogos = st.jogos || 0;
    const participacoes = (st.gols || 0) + (st.assistencias || 0);
    let fator = 1;
    if(jogos < 5) fator *= 0.72; else if(jogos < 12) fator *= 0.88;
    if(jogos >= 8) {
        const media = participacoes / jogos;
        if(media >= 0.9) fator *= 1.28; else if(media >= 0.55) fator *= 1.12; else if(media < 0.18 && (j.posicao === "Atacante" || j.posicao === "Meio-Campista")) fator *= 0.82;
    }
    if(j === jogador) {
        if(j.lesaoRodadas > 0) fator *= 0.84;
        if(j.titularidade < 42) fator *= 0.88; else if(j.titularidade > 72) fator *= 1.08;
        if((j.felicidade || 55) < 35) fator *= 0.9;
    }
    return Math.max(50000, Math.floor(valor * fator));
}

// Salário semanal "de mercado" para o jogador, com base no seu valor e na
// força/reputação do clube (real ou hipotético). Clubes de maior reputação
// pagam salários bem acima do valor de mercado "puro"; clubes pequenos
// pagam abaixo. Serve de referência para ofertas iniciais em negociações
// e como salário-base fora de qualquer negociação ativa.
function calcularSalarioSemanalJogador(clubeRef = null, jogadorRef = null) {
    const alvo = jogadorRef || jogador;
    if (!alvo) return 20000;
    const clube = clubeRef || clubes.find(c => c.id === alvo.clubeId);
    const valorMercado = alvo.valorMercadoNum || calcularValorMercadoJogador(alvo);
    let base = Math.max(8000, valorMercado * 0.019);
    const reputacao = clube?.reputacao || 65;
    // ~0.75x para clubes modestos (rep. baixa) até ~1.75x para gigantes (rep. alta)
    const fatorClube = 0.55 + (reputacao / 100) * 1.2;
    base *= fatorClube;
    // 🆕 Clubes árabes (Saudi Pro League) pagam bem acima do que a reputação
    // esportiva sugeriria — igual à realidade (Al-Hilal, Al-Nassr etc. pagando
    // salários de topo mundial mesmo sendo uma liga competitivamente mediana).
    // O "prêmio" cresce com o nível do jogador: craques (85+ de geral) são o
    // alvo dessas propostas turbinadas, não qualquer reserva.
    if (clube?.ligaId?.startsWith("ara")) {
        const nivel = alvo.geral || 65;
        base *= 1.5 + Math.max(0, nivel - 65) * 0.045;
    }
    if ((alvo.idade || 24) >= 32) base *= 0.92; // veteranos custam um pouco menos em folha
    if ((alvo.idade || 24) <= 21 && (alvo.geral || 60) >= 75) base *= 1.1; // jovens-promessa custam mais
    return Math.max(8000, Math.floor(base));
}

// =====================================================================
// NEGOCIAÇÃO DE CONTRATO — renovação ou ingresso em novo clube.
// Simula uma "reunião" de negociação com propostas e contrapropostas,
// avaliadas de forma inteligente com base no orçamento/reputação do
// clube e no poder de negociação (leverage) do jogador.
// =====================================================================

// Oferta inicial "realista" de um clube: clubes grandes pagam bem acima
// do valor de mercado puro, oferecem mais anos e maiores luvas em
// transferências; clubes pequenos são mais conservadores.
function calcularOfertaInicialClube(clube, tipo) {
    const salarioRef = calcularSalarioSemanalJogador(clube);
    const fatorTipo = tipo === "renovacao" ? 1.0 : 0.9; // clube novo começa mais conservador
    const salario = Math.max(8000, Math.floor(salarioRef * fatorTipo * (0.9 + Math.random() * 0.18)));
    let anos = (clube.reputacao || 65) >= 82 ? ((jogador.idade || 24) < 29 ? 4 : 2) : ((jogador.idade || 24) < 26 ? 3 : 2);
    if (tipo !== "renovacao" && Math.random() < 0.3) anos = Math.max(2, anos - 1);
    const bonusGol = Math.max(300, Math.floor(salario * (0.025 + Math.random() * 0.03)));
    const bonusVitoria = Math.max(200, Math.floor(salario * (0.012 + Math.random() * 0.018)));
    const luvas = tipo === "renovacao" ? 0 : Math.floor(salario * (3 + Math.random() * 7));
    const direitosImagem = (clube.reputacao || 65) >= 80 ? 8 + Math.floor(Math.random() * 10) : 4 + Math.floor(Math.random() * 8);
    return { salario, anos, bonusGol, bonusVitoria, luvas, direitosImagem };
}

// Avalia a contraproposta do jogador do ponto de vista do clube: pesa o
// custo total pedido contra a capacidade orçamental do clube e o poder
// de negociação (leverage) do jogador naquele momento da carreira.
function avaliarContraPropostaClube(neg, pedido) {
    const clube = clubes.find(c => c.id === neg.clubeId);
    const oferta = neg.ofertaClube;
    const custoAnualPedido = pedido.salario * 52 + pedido.luvas + pedido.bonusGol * 8 + pedido.bonusVitoria * 12;
    const capacidadeOrcamental = Math.max((clube?.orcamento || 0) * 0.28, calcularSalarioSemanalJogador(clube) * 52 * 1.5);

    let leverage = 0.5;
    leverage += ((jogador.geral || 65) - (clube?.reputacao || 65)) / 110; // jogador melhor que o nível do clube = mais poder
    leverage += (jogador.contrato <= 1 ? 0.14 : -0.04); // perto de ficar livre = mais poder de barganha
    leverage += ((jogador.titularidade || 55) - 55) / 300;
    leverage += (propostasPendentes.filter(p => p.tipo !== "renovacao").length > 1 ? 0.1 : 0); // concorrência por ele
    leverage += (jogador.lifestyle?.multipliers?.negotiationMultiplier || 0);
    leverage = Math.max(0.12, Math.min(0.92, leverage));

    const razaoPedido = custoAnualPedido / capacidadeOrcamental;

    if (razaoPedido <= 0.82 + leverage * 0.28) {
        return { decisao: "aceitar", oferta: pedido };
    }
    if (razaoPedido <= 1.3 + leverage * 0.4 && neg.rodada < neg.maxRodadas) {
        const cede = 0.3 + leverage * 0.32;
        const nova = {
            salario: Math.floor(oferta.salario + (pedido.salario - oferta.salario) * cede),
            anos: Math.random() < 0.5 ? pedido.anos : oferta.anos,
            bonusGol: Math.max(0, Math.floor(oferta.bonusGol + (pedido.bonusGol - oferta.bonusGol) * cede)),
            bonusVitoria: oferta.bonusVitoria,
            luvas: Math.max(0, Math.floor(oferta.luvas + (pedido.luvas - oferta.luvas) * cede)),
            direitosImagem: Math.max(0, Math.min(50, Math.round(oferta.direitosImagem + (pedido.direitosImagem - oferta.direitosImagem) * cede)))
        };
        return { decisao: "contraproposta", oferta: nova };
    }
    if (neg.rodada >= neg.maxRodadas) return { decisao: "final", oferta: oferta };
    return { decisao: "recusar", oferta: oferta };
}

window.abrirNegociacaoRenovacao = function() {
    const clubeAtual = clubes.find(c => c.id === jogador.clubeId);
    if (!clubeAtual) { mostrarToast("Aviso", "Sem clube ativo para negociar.", "warning"); return; }
    
    // Check if club has rejected player previously
    if(jogador.clubesRejeitados && jogador.clubesRejeitados.includes(clubeAtual.id)) {
        mostrarToast("Negociação Bloqueada", `O ${clubeAtual.nome} fechou as portas após rejeição anterior. Tenta novamente na próxima temporada.`, "danger");
        return;
    }
    
    let idx = propostasPendentes.findIndex(p => p.id === clubeAtual.id && p.tipo === "renovacao");
    if (idx === -1) {
        propostasPendentes.push({ id: clubeAtual.id, nome: clubeAtual.nome, reputacao: clubeAtual.reputacao, valor: 0, tipo: "renovacao", janela: "Reunião solicitada" });
        idx = propostasPendentes.length - 1;
    }
    iniciarNegociacao(idx);
};

window.iniciarNegociacao = function(index) {
    const proposta = propostasPendentes[index];
    if (!proposta) return;
    const clube = clubes.find(c => c.id === proposta.id);
    if (!clube) return;
    const ofertaInicial = calcularOfertaInicialClube(clube, proposta.tipo);
    negociacaoAtual = {
        propostaIndex: index,
        clubeId: clube.id,
        nome: clube.nome,
        tipo: proposta.tipo,
        valorTransfer: proposta.valor || 0,
        janela: proposta.janela,
        rodada: 1,
        maxRodadas: 4,
        ofertaClube: ofertaInicial,
        rascunho: {
            salario: Math.floor(ofertaInicial.salario * 1.12),
            anos: ofertaInicial.anos,
            bonusGol: Math.floor(ofertaInicial.bonusGol * 1.15),
            bonusVitoria: ofertaInicial.bonusVitoria,
            luvas: ofertaInicial.luvas,
            direitosImagem: Math.min(50, ofertaInicial.direitosImagem + 5)
        },
        historico: [{ autor: "clube", texto: `${clube.nome} apresenta proposta inicial: ${formatarMoeda(ofertaInicial.salario)}/semana por ${ofertaInicial.anos} ano(s)${ofertaInicial.luvas ? `, com luvas de ${formatarMoeda(ofertaInicial.luvas)}` : ""}.` }],
        finalizada: false
    };
    document.getElementById("modalNegociacao")?.classList.remove("oculto");
    renderNegociacaoModal();
};

function renderNegociacaoModal() {
    const modal = document.getElementById("modalNegociacao");
    const body = document.getElementById("negociacaoBody");
    if (!modal || !body || !negociacaoAtual) return;
    const clube = clubes.find(c => c.id === negociacaoAtual.clubeId);
    const tituloEl = document.getElementById("negTituloClube");
    if (tituloEl) tituloEl.innerHTML = `💼 Negociação — ${clube?.nome || negociacaoAtual.nome}`;
    const o = negociacaoAtual.ofertaClube;
    const tipoLabel = negociacaoAtual.tipo === "renovacao" ? "Renovação de contrato" : (negociacaoAtual.tipo === "emprestimo" ? "Empréstimo" : "Transferência");

    const historicoHtml = negociacaoAtual.historico.map(h => `
        <div style="display:flex; ${h.autor === "jogador" ? "justify-content:flex-end;" : ""} margin-bottom:8px;">
            <div style="max-width:82%; padding:10px 14px; border-radius:10px; font-size:0.85rem; ${h.autor === "jogador" ? "background:rgba(0,255,136,0.15); border:1px solid var(--theme-primary);" : "background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);"}">
                <strong style="display:block; margin-bottom:3px; color:${h.autor === "jogador" ? "var(--theme-primary)" : "#aaa"};">${h.autor === "jogador" ? "Você / Agente" : (clube?.nome || "Clube")}</strong>
                ${h.texto}
            </div>
        </div>`).join("");

    body.innerHTML = `
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.1);">
            <img src="${obterUrlImagem(clube,'clube')}" style="width:52px; height:52px; object-fit:contain; background:#fff; border-radius:8px; padding:4px;">
            <div><span class="meta-pill">${tipoLabel}</span><h3 style="margin:6px 0 0;">${clube?.nome || ""}</h3></div>
            <div style="margin-left:auto; text-align:right;"><span style="color:#888; font-size:0.75rem; text-transform:uppercase; font-weight:800;">Rodada</span><br><strong>${negociacaoAtual.rodada}/${negociacaoAtual.maxRodadas}</strong></div>
        </div>

        <div style="max-height:170px; overflow-y:auto; margin-bottom:18px; padding-right:4px;">${historicoHtml}</div>

        <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:16px; margin-bottom:16px;">
            <h4 style="margin:0 0 10px; color:var(--theme-primary);">📄 Oferta atual do clube</h4>
            <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:10px; font-size:0.85rem; color:#ccc;">
                <div>Salário semanal <strong style="display:block; color:#fff;">${formatarMoeda(o.salario)}</strong></div>
                <div>Contrato <strong style="display:block; color:#fff;">${o.anos} ano(s)</strong></div>
                <div>Bônus por gol <strong style="display:block; color:#fff;">${formatarMoeda(o.bonusGol)}</strong></div>
                <div>Bônus por vitória <strong style="display:block; color:#fff;">${formatarMoeda(o.bonusVitoria)}</strong></div>
                ${o.luvas ? `<div>Luvas (assinatura) <strong style="display:block; color:var(--gold);">${formatarMoeda(o.luvas)}</strong></div>` : ""}
                <div>Direitos de imagem <strong style="display:block; color:#fff;">${o.direitosImagem}%</strong></div>
            </div>
            <p style="margin:10px 0 0; color:#888; font-size:0.78rem;">Estimativa anual (salário): <strong style="color:var(--success);">${formatarMoeda(o.salario * 52)}</strong></p>
        </div>

        ${negociacaoAtual.finalizada ? `
            <div style="text-align:center; padding:14px; border-radius:10px; background:rgba(255,255,255,0.05); margin-bottom:16px;">
                <p style="margin:0; color:#ccc;">Esta é a proposta final do clube nesta negociação. Aceita ou encerra sem acordo.</p>
            </div>` : `
        <div style="background:rgba(0,0,0,0.22); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px; margin-bottom:16px;">
            <h4 style="margin:0 0 10px;">✍️ A tua contraproposta</h4>
            <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:12px;">
                <div><label style="font-size:0.75rem; color:#888;">Salário semanal (€)</label>
                    <input type="number" id="negInputSalario" value="${negociacaoAtual.rascunho.salario}" step="1000" style="width:100%; padding:8px; border-radius:6px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); color:#fff;"></div>
                <div><label style="font-size:0.75rem; color:#888;">Anos de contrato</label>
                    <select id="negInputAnos" style="width:100%; padding:8px; border-radius:6px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); color:#fff;">
                        ${[1,2,3,4,5].map(n => `<option value="${n}" ${n===negociacaoAtual.rascunho.anos?"selected":""}>${n} ano${n>1?"s":""}</option>`).join("")}
                    </select></div>
                <div><label style="font-size:0.75rem; color:#888;">Bônus por gol (€)</label>
                    <input type="number" id="negInputBonusGol" value="${negociacaoAtual.rascunho.bonusGol}" step="200" style="width:100%; padding:8px; border-radius:6px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); color:#fff;"></div>
                <div><label style="font-size:0.75rem; color:#888;">Direitos de imagem (%)</label>
                    <input type="number" id="negInputImagem" value="${negociacaoAtual.rascunho.direitosImagem}" min="0" max="50" style="width:100%; padding:8px; border-radius:6px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); color:#fff;"></div>
            </div>
            <button class="btn btn-primary btn-block" style="margin-top:14px;" onclick="enviarContrapropostaNegociacao()">📨 Enviar contraproposta</button>
        </div>`}

        <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn btn-success" style="flex:1;" onclick="aceitarOfertaNegociacao()">✅ Aceitar oferta atual</button>
            <button class="btn btn-danger" style="flex:1;" onclick="cancelarNegociacao()">🚪 Encerrar sem acordo</button>
        </div>`;
}

window.enviarContrapropostaNegociacao = function() {
    if (!negociacaoAtual || negociacaoAtual.finalizada) return;
    const pedido = {
        salario: Math.max(5000, parseInt(document.getElementById("negInputSalario")?.value) || negociacaoAtual.ofertaClube.salario),
        anos: parseInt(document.getElementById("negInputAnos")?.value) || negociacaoAtual.ofertaClube.anos,
        bonusGol: Math.max(0, parseInt(document.getElementById("negInputBonusGol")?.value) || 0),
        bonusVitoria: negociacaoAtual.ofertaClube.bonusVitoria,
        luvas: negociacaoAtual.ofertaClube.luvas,
        direitosImagem: Math.min(50, Math.max(0, parseInt(document.getElementById("negInputImagem")?.value) || 0))
    };
    negociacaoAtual.historico.push({ autor: "jogador", texto: `Pede ${formatarMoeda(pedido.salario)}/semana, ${pedido.anos} ano(s), ${formatarMoeda(pedido.bonusGol)} por gol e ${pedido.direitosImagem}% de imagem.` });

    const resultado = avaliarContraPropostaClube(negociacaoAtual, pedido);
    negociacaoAtual.rodada++;

    if (resultado.decisao === "aceitar") {
        negociacaoAtual.ofertaClube = resultado.oferta;
        negociacaoAtual.historico.push({ autor: "clube", texto: `Combinado! O ${negociacaoAtual.nome} aceita os teus termos.` });
        negociacaoAtual.finalizada = true;
    } else if (resultado.decisao === "contraproposta") {
        negociacaoAtual.ofertaClube = resultado.oferta;
        negociacaoAtual.rascunho = { ...negociacaoAtual.rascunho, salario: Math.floor((pedido.salario + resultado.oferta.salario) / 2) };
        negociacaoAtual.historico.push({ autor: "clube", texto: `O ${negociacaoAtual.nome} ajusta a proposta: ${formatarMoeda(resultado.oferta.salario)}/semana, ${resultado.oferta.anos} ano(s).` });
    } else if (resultado.decisao === "final") {
        negociacaoAtual.ofertaClube = resultado.oferta;
        negociacaoAtual.historico.push({ autor: "clube", texto: `O ${negociacaoAtual.nome} diz que esta é a proposta final. É pegar ou largar.` });
        negociacaoAtual.finalizada = true;
    } else {
        negociacaoAtual.historico.push({ autor: "clube", texto: `O ${negociacaoAtual.nome} recusa esses termos e encerra a negociação. As portas estão fechadas.` });
        // Add club to rejected list
        if(!jogador.clubesRejeitados) jogador.clubesRejeitados = [];
        if(!jogador.clubesRejeitados.includes(negociacaoAtual.clubeId)) {
            jogador.clubesRejeitados.push(negociacaoAtual.clubeId);
        }
        // Remove from pending proposals
        const idx = propostasPendentes.findIndex(p => p.id === negociacaoAtual.clubeId);
        if(idx !== -1) propostasPendentes.splice(idx, 1);
        negociacaoAtual.finalizada = true;
        registrarNoticia("Negociação encerrada", `${jogador.nome} e ${negociacaoAtual.nome} não chegaram a acordo. O clube fechou as portas.`, "Mercado");
    }
    renderNegociacaoModal();
};

window.aceitarOfertaNegociacao = function() {
    if (!negociacaoAtual) return;
    const clube = clubes.find(c => c.id === negociacaoAtual.clubeId);
    const oferta = negociacaoAtual.ofertaClube;
    const tipo = negociacaoAtual.tipo;

    jogador.salarioSemanal = oferta.salario;
    jogador.bonusGol = oferta.bonusGol;
    jogador.bonusVitoria = oferta.bonusVitoria;
    jogador.direitosImagem = oferta.direitosImagem;
    jogador.contrato = oferta.anos;
    if (jogador.lifestyle) jogador.lifestyle.salary = Math.floor(oferta.salario * (jogador.lifestyle.multipliers?.salaryMultiplier || 1));

    if (tipo === "renovacao") {
        jogador.felicidade = Math.min(100, (jogador.felicidade || 60) + 10);
        registrarNoticia("Contrato renovado", `${jogador.nome} acertou renovação com ${clube.nome}: ${formatarMoeda(oferta.salario)}/semana por ${oferta.anos} ano(s), com bônus de ${formatarMoeda(oferta.bonusGol)} por gol.`, "Mercado");
        mostrarToast("Renovação", `Novo contrato assinado com o ${clube.nome}!`, "success");
    } else {
        const cAntigo = clubes.find(c => c.id === jogador.clubeId);
        if (clube) clube.orcamento = (clube.orcamento || 0) - (negociacaoAtual.valorTransfer || 0);
        if (cAntigo && tipo !== "emprestimo") cAntigo.orcamento = (cAntigo.orcamento || 0) + (negociacaoAtual.valorTransfer || 0);
        registrarMovimentacao({ jogadorNome: jogador.nome, jogadorId: "player", tipo: tipo, valor: negociacaoAtual.valorTransfer || 0, origemId: jogador.clubeId, destinoId: clube.id, janela: negociacaoAtual.janela });
        // Reset years at club and captain status on transfer
        jogador.anoNoClubeAtual = 0;
        jogador.eCapitao = false;
        if (tipo === "emprestimo") { jogador.clubeOrigemEmprestimo = jogador.clubeId; jogador.emprestadoAte = anoAtual; jogador.clubeId = clube.id; }
        else { jogador.clubeId = clube.id; delete jogador.clubeOrigemEmprestimo; delete jogador.emprestadoAte; }
        jogador.jogosNoClubeAtual = 0; jogador.tecnicoConhecido = null; jogador.statusEscalacaoAnterior = null;
        jogador.titularidade = Math.min(jogador.titularidade || 48, 52); // chega ao novo clube tendo de reconquistar a titularidade
        reconstruirAgendaAposTrocaClube();
        registrarNoticia(tipo === "emprestimo" ? "Empréstimo fechado" : "Transferência confirmada", `${jogador.nome} acertou com ${clube.nome}: ${formatarMoeda(oferta.salario)}/semana por ${oferta.anos} ano(s).`, "Mercado");
        mostrarToast(tipo === "emprestimo" ? "Empréstimo" : "Transferência", `Acordo fechado com o ${clube.nome}!`, "success");
        setTimeout(() => abrirEntrevista("transferencia", { clube: clube.nome }), 500);
    }

    propostasPendentes = [];
    negociacaoAtual = null;
    document.getElementById("modalNegociacao")?.classList.add("oculto");
    window.salvarJogo(); atualizarHub(); mudarTela("view-hub");
};

window.cancelarNegociacao = function() {
    if (negociacaoAtual) {
        const clube = clubes.find(c => c.id === negociacaoAtual.clubeId);
        mostrarToast("Negociação encerrada", `Encerraste as conversas com o ${clube?.nome || negociacaoAtual.nome} sem acordo.`, "warning");
    }
    negociacaoAtual = null;
    document.getElementById("modalNegociacao")?.classList.add("oculto");
};
document.getElementById("btnFecharNegociacao")?.addEventListener("click", () => { window.cancelarNegociacao(); });

function registrarEstatisticaCompeticao(j, compId, jogos = 0, gols = 0, assistencias = 0) {
    if(!j || !compId) return;
    if(!j.statsCompeticoes) j.statsCompeticoes = {};
    if(!j.statsCompeticoes[compId]) j.statsCompeticoes[compId] = { jogos: 0, gols: 0, assistencias: 0 };
    j.statsCompeticoes[compId].jogos += jogos;
    j.statsCompeticoes[compId].gols += gols;
    j.statsCompeticoes[compId].assistencias += assistencias;
}
function montarRankingCompeticao(compId) {
    const todos = [jogador, ...jogadoresIA.filter(j => !j.aposentado)];
    const base = todos.map(j => ({ j, st: j.statsCompeticoes?.[compId] || { jogos:0, gols:0, assistencias:0 } }));
    const artilheiros = [...base].filter(x=>x.st.gols>0).sort((a,b)=>b.st.gols-a.st.gols).slice(0,5);
    const assistentes = [...base].filter(x=>x.st.assistencias>0).sort((a,b)=>b.st.assistencias-a.st.assistencias).slice(0,5);
    const bloco = (titulo, lista, campo) => `<h4>${titulo}</h4>${lista.length ? lista.map((x,i)=>`
        <div class="ranking-mini-row"><span style="display:flex; align-items:center; gap:8px;"><strong>${i+1}</strong><img src="${obterUrlImagem(x.j,'jogador')}">${x.j.nome}</span><strong style="color:var(--gold);">${x.st[campo]}</strong></div>`).join("") : `<p style="color:#aaa; font-size:0.82rem;">Ainda sem dados.</p>`}`;
    return `<aside class="ranking-mini">${bloco("Artilharia", artilheiros, "gols")}${bloco("Assistências", assistentes, "assistencias")}</aside>`;
}
function formatarMoeda(valor) { return valor >= 1000000 ? `€${(valor / 1000000).toFixed(1)}M` : `€${(valor / 1000).toFixed(0)}K`; }

function preencherDropdowns() {
    const sCopa = document.getElementById("selectFiltroCopa");
    if(sCopa) {
        const compsMataMata = competicoes.filter(c => ["continental", "supercopa_continental", "torneio_intercontinental"].includes(c.tipo));
        sCopa.innerHTML = compsMataMata.map(c => `<option value="${c.id}">${c.nome}</option>`).join("");
    }
}

function setText(id, value) { const el = document.getElementById(id); if (el) el.innerHTML = value; }
function mudarTela(id) {
    document.querySelectorAll(".tela").forEach(t => t.classList.add("oculto"));
    let tela = document.getElementById(id);
    if (tela) tela.classList.remove("oculto");
    // 🎵 Música fixa na tela de criação de jogador; qualquer outra tela usa a playlist normal.
    if (id === "telaCriacao") window.tocarMusicaTelaCriacao?.();
    else window.retomarPlaylistNormal?.();
}
// 🛡️ FIX: expõe no window — firebase-integration.js (script clássico) chama
// mudarTela(...) diretamente e sem isto o lobby online travava em silêncio.
window.mudarTela = mudarTela;

// ==========================================
// 🔊 EFEITOS SONOROS
// ==========================================
// Sistema leve de som: cada efeito é um ficheiro .mp3 opcional na pasta
// assets/sfx/ (o jogador coloca os próprios ficheiros, mesmo esquema já
// usado para os vídeos de abertura em assets/intros/). Se o ficheiro não
// existir, falha em silêncio — nunca quebra o jogo por falta de um som.
const SONS_JOGO = {
    gol: "assets/sfx/gol.mp3",
    apito_inicio: "assets/sfx/apito_inicio.mp3",
    apito_fim: "assets/sfx/apito_fim.mp3",
    vitoria: "assets/sfx/vitoria.mp3",
    derrota: "assets/sfx/derrota.mp3",
    sucesso: "assets/sfx/sucesso.mp3",
    erro: "assets/sfx/erro.mp3",
    notificacao: "assets/sfx/notificacao.mp3",
    clique: "assets/sfx/clique.mp3",
    convocacao: "assets/sfx/convocacao.mp3",
    trofeu: "assets/sfx/trofeu.mp3",
    cartao: "assets/sfx/cartao.mp3"
};
// Cache de instâncias <audio> por som, para não recriar o elemento a cada chamada.
const _cacheAudioSons = {};
// Preferência do jogador (guardada no localStorage, independente do save da carreira).
function somAtivado() { return localStorage.getItem("rumo_estrelato_pro_sons") !== "off"; }
window.alternarSons = function() {
    const ativo = somAtivado();
    localStorage.setItem("rumo_estrelato_pro_sons", ativo ? "off" : "on");
    mostrarToast("Sons", ativo ? "Efeitos sonoros desativados." : "Efeitos sonoros ativados.", "info");
};
// Toca um efeito sonoro pelo nome (ver SONS_JOGO). Nunca lança erro — se o
// ficheiro não existir ou o navegador bloquear o autoplay, simplesmente
// não toca nada, sem afetar o resto do jogo.
window.tocarSom = function(nome, volume = 0.55) {
    try {
        if (!somAtivado() || !SONS_JOGO[nome]) return;
        let audio = _cacheAudioSons[nome];
        if (!audio) { audio = new Audio(SONS_JOGO[nome]); audio.volume = volume; _cacheAudioSons[nome] = audio; }
        audio.currentTime = 0;
        audio.volume = volume;
        audio.play().catch(() => {}); // silencioso se o navegador bloquear ou o ficheiro não existir
    } catch (e) { /* nunca deixar um som quebrar o jogo */ }
};

// 🖱️ Som de clique GLOBAL: em vez de adicionar tocarSom('clique') botão por
// botão (o jogo tem centenas, muitos criados dinamicamente por HTML/JS), um
// único listener delegado no document pega qualquer clique em <button>, em
// qualquer elemento com classe .btn (padrão usado em todo o jogo) ou que
// termine em "-btn", e toca o som — inclusive em botões criados depois,
// sem precisar mexer em cada tela.
document.addEventListener("click", (e) => {
    const el = e.target.closest('button, .btn, [class*="-btn"], [role="button"]');
    if (!el || el.disabled || el.classList.contains("oculto")) return;
    window.tocarSom('clique', 0.3);
}, true);

// ==========================================
// 🎵 MÚSICA DE FUNDO
// ==========================================
// Mesmo esquema dos efeitos sonoros (SONS_JOGO): ficheiros .mp3 opcionais,
// desta vez em assets/music/ — o jogador coloca as próprias faixas com
// exatamente estes nomes. Se um ficheiro não existir, o navegador dispara
// "error" nesse <audio> e o motor simplesmente pula para a próxima faixa da
// lista, sem travar nem mostrar erro nenhum.
// Cada faixa tem um "nome" de exibição — pode editar à vontade, é só o que
// aparece na bolinha de configurações.
const MUSICAS_JOGO = [
    { arquivo: "assets/music/tema1.mp3", nome: "Tema 1" },
    { arquivo: "assets/music/tema2.mp3", nome: "Tema 2" },
    { arquivo: "assets/music/tema3.mp3", nome: "Tema 3" },
    { arquivo: "assets/music/tema4.mp3", nome: "Tema 4" },
     { arquivo: "assets/music/tema5.mp3", nome: "Tema 5" },
      { arquivo: "assets/music/tema6.mp3", nome: "Tema 6" },
];
// 🆕 Faixa fixa e exclusiva da tela de criação de nome/jogador (telaCriacao):
// toca sempre essa mesma música enquanto essa tela estiver aberta, e ao sair
// dela a playlist normal (MUSICAS_JOGO) volta a tocar de onde parou.
const MUSICA_TELA_CRIACAO = { arquivo: "assets/music/tema6.mp3", nome: "Tema 6" };

let _audioMusica = null;
let _ordemMusicas = [];
let _indiceMusicaAtual = 0;
let _faixaAtual = null;       // { arquivo, nome } da faixa tocando agora
let _emMusicaFixa = false;    // true enquanto a MUSICA_TELA_CRIACAO estiver ativa

// Preferência do jogador para a música (independente da preferência de sons/SFX).
function musicaAtivada() { return localStorage.getItem("rumo_estrelato_pro_musica") !== "off"; }
function volumeMusica() { const v = parseFloat(localStorage.getItem("rumo_estrelato_pro_musica_vol")); return isNaN(v) ? 0.25 : v; }
window.definirVolumeMusica = function(v) {
    const vol = Math.max(0, Math.min(1, Number(v)));
    localStorage.setItem("rumo_estrelato_pro_musica_vol", String(vol));
    if (_audioMusica) _audioMusica.volume = vol;
};

// Nome da faixa tocando agora (ou null se não houver nenhuma), para a UI mostrar.
window.obterNomeMusicaAtual = function() { return _faixaAtual?.nome || null; };

// Dispara um evento customizado sempre que a faixa muda, pra bolinha de
// configurações (ou qualquer outro painel) atualizar o texto sem precisar
// ficar checando em loop.
function _avisarTrocaDeMusica() {
    document.dispatchEvent(new CustomEvent("musicaTrocou", { detail: { ...( _faixaAtual || {}) } }));
}

function _embaralharOrdemMusicas() {
    _ordemMusicas = MUSICAS_JOGO.map((_, i) => i).sort(() => Math.random() - 0.5);
    _indiceMusicaAtual = 0;
}

let _avisouFalhaFixa = false; // evita repetir o toast de erro toda vez que a faixa fixa falha

function _garantirAudioMusica() {
    if (_audioMusica) return;
    _audioMusica = new Audio();
    _audioMusica.volume = volumeMusica();
    // Se a faixa atual não existir/falhar, tenta a próxima em vez de parar a música de vez
    // — EXCETO na tela de criação, onde a faixa é fixa de propósito: se ela falhar, avisa
    // uma vez (em vez de trocar silenciosamente pra playlist geral, o que ia parecer que o
    // recurso "música fixa" nem estava funcionando).
    _audioMusica.addEventListener("error", () => {
        console.warn("[música] falha ao carregar:", _audioMusica.src);
        if (!musicaAtivada()) return;
        if (_emMusicaFixa) {
            if (!_avisouFalhaFixa) {
                _avisouFalhaFixa = true;
                mostrarToast("Música", `Não encontrei o arquivo "${MUSICA_TELA_CRIACAO.arquivo}". Confira o nome e o local dele na pasta assets/music/.`, "danger");
            }
            return; // não cai pra playlist geral — a fixa continua fixa, só fica em silêncio até o arquivo existir
        }
        _tocarProximaMusica();
    });
    _audioMusica.addEventListener("ended", () => {
        if (!musicaAtivada()) return;
        if (_emMusicaFixa) _tocarFaixa(MUSICA_TELA_CRIACAO); // a faixa fixa repete em loop, não entra na playlist
        else _tocarProximaMusica();
    });
}

function _tocarFaixa(faixaObj) {
    _garantirAudioMusica();
    _faixaAtual = faixaObj;
    _audioMusica.src = faixaObj.arquivo;
    _audioMusica.volume = volumeMusica();
    _audioMusica.play().then(() => {
        console.log("[música] tocando:", faixaObj.arquivo);
    }).catch((err) => {
        console.warn("[música] play() bloqueado/rejeitado para", faixaObj.arquivo, "-", err?.name || err);
    });
    _avisarTrocaDeMusica();
}

function _tocarProximaMusica() {
    if (!musicaAtivada() || MUSICAS_JOGO.length === 0) return;
    _emMusicaFixa = false;
    if (!_ordemMusicas.length) _embaralharOrdemMusicas();
    if (_indiceMusicaAtual >= _ordemMusicas.length) _embaralharOrdemMusicas(); // recomeça a lista embaralhada de novo
    const faixaObj = MUSICAS_JOGO[_ordemMusicas[_indiceMusicaAtual]];
    _indiceMusicaAtual++;
    _tocarFaixa(faixaObj);
}

// 🆕 Troca para a música fixa da tela de criação (chamado pelo mudarTela()).
window.tocarMusicaTelaCriacao = function() {
    if (!musicaAtivada()) return;
    _emMusicaFixa = true;
    _tocarFaixa(MUSICA_TELA_CRIACAO);
};

// 🆕 Sai da música fixa e retoma a playlist normal (chamado pelo mudarTela()
// ao trocar para qualquer outra tela que não seja a de criação).
window.retomarPlaylistNormal = function() {
    if (!_emMusicaFixa) return; // já estava na playlist normal, nada a fazer
    _emMusicaFixa = false;
    _tocarProximaMusica();
};

// Chamado uma única vez (após o primeiro clique do jogador, para respeitar a
// política de autoplay dos navegadores) para começar a tocar a playlist.
window.iniciarMusicaFundo = function() {
    if (!musicaAtivada()) return;
    if (_audioMusica && !_audioMusica.paused) return; // já está tocando, não reinicia
    if (_audioMusica) {
        _audioMusica.play().then(() => console.log("[música] retomada após interação:", _audioMusica.src))
            .catch((err) => console.warn("[música] ainda bloqueada:", err?.name || err));
        _avisarTrocaDeMusica();
    }
    else if (_emMusicaFixa) _tocarFaixa(MUSICA_TELA_CRIACAO);
    else _tocarProximaMusica();
};

window.alternarMusica = function() {
    const ativa = musicaAtivada();
    localStorage.setItem("rumo_estrelato_pro_musica", ativa ? "off" : "on");
    if (ativa) { _audioMusica?.pause(); }
    else { window.iniciarMusicaFundo(); }
    mostrarToast("Música", ativa ? "Música de fundo desativada." : "Música de fundo ativada.", "info");
};

// Pula manualmente para a próxima faixa da playlist (a setinha ⏭️ no menu
// de configurações). Se a música estiver desligada, liga automaticamente —
// faz sentido, já que o jogador está pedindo explicitamente pra trocar de música.
// Na tela de criação (música fixa) a setinha não pula, já que ali a faixa é fixa de propósito.
window.proximaMusica = function() {
    if (_emMusicaFixa) return;
    if (!musicaAtivada()) localStorage.setItem("rumo_estrelato_pro_musica", "on");
    _tocarProximaMusica();
};

// A maioria dos navegadores só deixa tocar áudio com som depois de uma
// interação real do jogador — por isso ficamos à escuta do primeiro
// clique/toque na página inteira para então começar a playlist.
(function aguardarPrimeiraInteracaoParaMusica() {
    const iniciar = () => { window.iniciarMusicaFundo(); document.removeEventListener("click", iniciar); document.removeEventListener("touchstart", iniciar); };
    document.addEventListener("click", iniciar, { once: true });
    document.addEventListener("touchstart", iniciar, { once: true });
})();

function mostrarToast(titulo, mensagem, tipo = 'info') {
    const container = document.getElementById('toastContainer'); if(!container) return;
    const toast = document.createElement('div'); toast.className = `toast ${tipo === 'gold' ? 'gold-anim' : ''}`;
    toast.innerHTML = `<h4>${titulo}</h4><p>${mensagem}</p>`; container.appendChild(toast);
    // 🔊 som leve conforme o tipo de toast (sucesso/erro/aviso/info)
    window.tocarSom(tipo === 'success' || tipo === 'gold' ? 'sucesso' : (tipo === 'danger' ? 'erro' : 'notificacao'), 0.35);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 4000);
}
// 🛡️ FIX: expõe no window — firebase-integration.js chama mostrarToast(...)
// diretamente (ex: erros de sala cheia/inexistente); sem isto, essas
// mensagens de erro do modo online nunca apareciam.
window.mostrarToast = mostrarToast;

// ==========================================
// 🎮 MINI-JOGO DE PÊNALTI INTERATIVO
// ==========================================
// Chamado pelo motor de partida (match.js) quando ÉS TU quem bate ou quem
// defende um pênalti. Mostra uma baliza com 3 zonas (esquerda/centro/
// direita); escolhes uma, e o resultado depende de coincidir ou não com a
// zona escolhida pelo "adversário" (goleiro ou cobrador controlado pelo
// motor) — exatamente como um pênalti real: um duelo de leitura de lado.
window.abrirMiniJogoPenalti = function(tipo, resolverCallback) {
    let overlay = document.getElementById("miniJogoPenaltiOverlay");
    if (!overlay) { overlay = document.createElement("div"); overlay.id = "miniJogoPenaltiOverlay"; document.body.appendChild(overlay); }
    overlay.className = "penalti-overlay";
    const titulo = tipo === "cobrar" ? "🎯 A TUA VEZ DE COBRAR!" : "🧤 DEFENDE O PÊNALTI!";
    const sub = tipo === "cobrar" ? "Escolhe o lado para chutar" : "Escolhe para que lado vais mergulhar";
    overlay.innerHTML = `
        <div class="penalti-modal">
            <h2 class="penalti-titulo">${titulo}</h2>
            <p class="penalti-sub">${sub}</p>
            <div class="penalti-baliza">
                <div class="penalti-zona" data-zona="esquerda">⬅️</div>
                <div class="penalti-zona" data-zona="centro">⬆️</div>
                <div class="penalti-zona" data-zona="direita">➡️</div>
            </div>
            <p class="penalti-resultado" id="penaltiResultadoTexto"></p>
        </div>`;
    overlay.classList.remove("oculto");
    window.tocarSom('notificacao', 0.4);

    overlay.querySelectorAll(".penalti-zona").forEach(btn => {
        btn.onclick = () => {
            if (overlay.dataset.resolvido) return; // 🛡️ evita cliques duplos escolhendo duas zonas
            overlay.dataset.resolvido = "1";
            overlay.querySelectorAll(".penalti-zona").forEach(b => { b.style.pointerEvents = "none"; b.style.opacity = "0.5"; });
            btn.classList.add("escolhida"); btn.style.opacity = "1";
            const resultadoEl = document.getElementById("penaltiResultadoTexto");
            resultadoEl.textContent = tipo === "cobrar" ? "A chutar..." : "A mergulhar...";
            window.tocarSom('clique');
            setTimeout(() => {
                overlay.remove();
                resolverCallback(btn.dataset.zona);
            }, 900);
        };
    });
};

const FORMATOS_NOTICIA_FIXOS = {
    "Entrevista": "post", "Mídia": "post", "Torcida": "post", "Rumor": "post", "Bastidores": "post", "Treino": "post",
    "Prémios": "jornal", "Números": "jornal", "Seleções": "jornal", "Clássico": "jornal", "Mercado": "jornal", "Finanças": "jornal", "Tática": "jornal"
};
const HANDLES_POST = ["@ImprensaGlobal", "@FutMundialNews", "@RedacaoEsportiva", "@OlhoNoJogo", "@VozDoVestiario"];
function registrarNoticia(manchete, corpo, categoria = "Geral", refImagem = null, tipoImagem = "jogador", destaque = false) {
    const formato = destaque ? "manchete" : (FORMATOS_NOTICIA_FIXOS[categoria] || (Math.random() < 0.5 ? "post" : "jornal"));
    const item = {
        manchete, corpo, data: `${categoria} • ${anoAtual} • Rodada ${rodadaAtual}`,
        formato, refImagem, tipoImagem, categoria,
        handle: HANDLES_POST[Math.floor(Math.random() * HANDLES_POST.length)],
        curtidas: formato === "post" ? Math.floor(Math.random() * 4200) + 120 : null
    };
    feedNoticias.unshift(item);
    eventosRecentes.unshift(item);
    eventosRecentes = eventosRecentes.slice(0, 60);
}

function registrarMovimentacao({ jogadorNome, jogadorId, tipo, valor, origemId, destinoId, janela }) {
    const origem = clubes.find(c => c.id === origemId);
    const destino = clubes.find(c => c.id === destinoId);
    const mov = {
        ano: anoAtual,
        rodada: rodadaAtual,
        jogadorNome,
        jogadorId,
        tipo,
        valor: valor || 0,
        origemId,
        destinoId,
        origem: origem?.nome || "Livre",
        destino: destino?.nome || "Livre",
        janela: janela || "Mercado"
    };
    transferenciasHistorico.unshift(mov);
    transferenciasHistorico = transferenciasHistorico.slice(0, 120);
    registrarNoticia(
        `${jogadorNome} ${tipo === "emprestimo" ? "foi emprestado" : "foi transferido"} para ${mov.destino}`,
        `${mov.origem} -> ${mov.destino} | ${tipo === "emprestimo" ? "empréstimo" : formatarMoeda(valor || 0)} | ${mov.janela}`,
        "Mercado", { nome: jogadorNome }, "jogador"
    );
}

function normalizarElencosEPosicoes() {
    const mapa = {
        j_rossi:"Goleiro", j_emerson:"Lateral", j_lucasm:"Ponta", j_calleri:"Atacante", j_luciano:"Meia Ofensivo", j_rafael:"Goleiro", j_pablomaia:"Volante",
        j_matheuzinho:"Lateral", j_hugo:"Lateral", j_bidon:"Meio-Campista", j_martinez:"Volante", j_garro:"Meia Ofensivo", j_coronado:"Meia Ofensivo", j_lingard:"Meia Ofensivo", j_talles:"Ponta",
        j_giuliano:"Meia Ofensivo", j_schmidt:"Volante", j_pituca:"Volante", j_ney:"Ponta", j_guilherme:"Ponta",
        j_arana:"Lateral", j_zaracho:"Meio-Campista", j_everson:"Goleiro", j_scarpa:"Meia Ofensivo",
        j_arias:"Ponta", j_tsilva:"Zagueiro", j_ganso:"Meia Ofensivo", j_fabio:"Goleiro", j_martineli:"Volante",
        j_soteldo:"Ponta", j_cristaldo:"Meia Ofensivo", j_villasanti:"Volante", j_marchesin:"Goleiro", j_dcosta:"Atacante",
        j_apatrick:"Meia Ofensivo", j_valencia:"Atacante", j_borre:"Atacante", j_rochet:"Goleiro", j_tmaia:"Volante", j_wanderson:"Ponta",
        j_mpereira:"Meia Ofensivo", j_william:"Lateral", j_cassio:"Goleiro", j_lromero:"Volante", j_lhenrique:"Ponta", j_savarino:"Ponta", j_john:"Goleiro",
        j_fernandinho:"Volante", j_theleno:"Zagueiro", j_zapelli:"Meia Ofensivo", j_canobbio:"Ponta", j_leolinck:"Goleiro",
        j_gvardiol:"Lateral", j_lewis:"Lateral", j_rodri:"Volante", j_reijnders:"Meio-Campista", j_silva:"Meia Ofensivo", j_savinho:"Ponta", j_doku:"Ponta", j_cherki:"Meia Ofensivo", j_foden:"Meia Ofensivo",
        j_saka:"Ponta", j_odegaard:"Meia Ofensivo", j_rice:"Volante", j_saliba:"Zagueiro", j_gabriel:"Zagueiro", j_raya:"Goleiro", j_gyokeres:"Atacante",
        j_vandijk:"Zagueiro", j_alisson:"Goleiro", j_trent:"Lateral", j_macallister:"Meio-Campista", j_diaz:"Ponta",
        j_enzo:"Meio-Campista", j_caicedo:"Volante", j_james:"Lateral", j_jackson:"Atacante", j_nkunku:"Meia Ofensivo",
        j_dalot:"Lateral", j_shaw:"Lateral", j_mazraoui:"Lateral", j_ugarte:"Volante", j_casemiro:"Volante", j_bruno:"Meia Ofensivo", j_mbeumo:"Ponta", j_amad:"Ponta", j_matheus_cunha:"Meia Ofensivo", j_zirkzee:"Atacante", j_sesko:"Atacante"
    };
    jogadoresIA.forEach(j => { if(mapa[j.id]) j.posicao = mapa[j.id]; });
    const porClube = {};
    jogadoresIA.forEach(j => {
        if(!porClube[j.clubeId]) porClube[j.clubeId] = [];
        porClube[j.clubeId].push(j);
        j.nacionalidade = normalizarNacionalidade(j.nacionalidade);
        if(!j.statsSelecao) j.statsSelecao = { jogos:0, gols:0, assistencias:0, convocacoes:0 };
    });
    const template = ["Goleiro","Zagueiro","Zagueiro","Lateral","Lateral","Volante","Meio-Campista","Meia Ofensivo","Ponta","Ponta","Atacante","Atacante"];
    Object.values(porClube).forEach(lista => {
        lista.sort((a,b) => (b.geral || 0) - (a.geral || 0));
        lista.forEach((j, idx) => {
            if(!j.posicao || j.posicao === "Base") j.posicao = template[idx % template.length];
            // ⚙️ ATRIBUTOS INDIVIDUAIS: todo jogador (não só o teu) passa a ter
            // finalização, velocidade, passe, defesa ("carrinho"), cabeceamento,
            // drible, resistência e força próprios — gerados a partir da posição
            // e do OVR, com uma pitada de variação individual. Isto é o que o
            // motor de partida (match.js) usa para decidir quem marca, quem
            // assiste e quem defende, em vez de só olhar pro OVR genérico.
            // 🆕 Preenche só o que ESTIVER FALTANDO em cada jogador, um campo de
            // cada vez — nunca sobrescreve um atributo que já exista. Isso é o
            // que permite fixar atributos específicos direto em jogadores.js
            // (ex: Harry Kane sempre com 96 de finalização em todo save): antes,
            // definir só 1 campo fazia o motor pular o jogador inteiro e deixar
            // os outros 8 atributos undefined pro resto do jogo.
            const gerados = gerarAtributosParaJogador(j.posicao, j.geral || 60);
            Object.keys(gerados).forEach(attr => { if (typeof j[attr] === "undefined") j[attr] = gerados[attr]; });
        });
    });
}

function obterClubeJogador(p) {
    return clubes.find(c => c.id === p?.clubeId);
}

function bonusLigaTop5(p) {
    return TOP5_LIGAS_EUROPA.includes(obterClubeJogador(p)?.ligaId) ? 1 : 0;
}

function pontuarJogadorSelecao(p, competicao = null) {
    const st = p === jogador ? (p.estatisticasAtuais || {}) : (p.statsTemporada || {});
    let score = (p.geral || 60) * 1.65 + (st.jogos || 0) * 0.45;
    const criador = ["Ponta", "Meia Ofensivo", "Meio-Campista"].includes(p.posicao);
    const finalizador = ["Atacante", "Ponta", "Meia Ofensivo"].includes(p.posicao);
    score += (st.gols || 0) * (finalizador ? 5.2 : 2.0);
    score += (st.assistencias || 0) * (criador ? 4.8 : 2.0);
    if(bonusLigaTop5(p)) score += 12;
    if(obterClubeJogador(p)?.reputacao >= 85) score += 7;
    if(p.idade <= 23) score += 2;
    if(competicao?.sub23 && p.idade > 23) score -= 45;
    if(p.lesaoRodadas > 0) score -= 999;
    return score;
}

function agruparConvocados(lista) {
    return {
        goleiros: lista.filter(p => POSICOES_CONVOCACAO.goleiros.includes(p.posicao)),
        laterais: lista.filter(p => POSICOES_CONVOCACAO.laterais.includes(p.posicao)),
        defensores: lista.filter(p => POSICOES_CONVOCACAO.defensores.includes(p.posicao)),
        meio: lista.filter(p => POSICOES_CONVOCACAO.meio.includes(p.posicao)),
        ataque: lista.filter(p => POSICOES_CONVOCACAO.ataque.includes(p.posicao))
    };
}

function gerarConvocacaoSelecao(selecao, competicao = null) {
    const todos = [jogador, ...jogadoresIA.filter(j => !j.aposentado)];
    const elegiveis = todos
        .filter(p => normalizarNacionalidade(p.nacionalidade) === normalizarNacionalidade(selecao.pais))
        .map(p => ({ p, score:pontuarJogadorSelecao(p, competicao) }))
        .filter(x => x.score > 0);
    const porPos = {
        goleiros: elegiveis.filter(x => POSICOES_CONVOCACAO.goleiros.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,3),
        laterais: elegiveis.filter(x => POSICOES_CONVOCACAO.laterais.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,4),
        defensores: elegiveis.filter(x => POSICOES_CONVOCACAO.defensores.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,5),
        meio: elegiveis.filter(x => POSICOES_CONVOCACAO.meio.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,7),
        ataque: elegiveis.filter(x => POSICOES_CONVOCACAO.ataque.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,6)
    };
    let convocados = Object.values(porPos).flat().map(x => x.p);
    const ids = new Set(convocados.map(p => p.id));
    elegiveis.sort((a,b)=>b.score-a.score).forEach(x => {
        if(convocados.length < 23 && !ids.has(x.p.id)) { convocados.push(x.p); ids.add(x.p.id); }
    });
    const meuScore = pontuarJogadorSelecao(jogador, competicao);
    const corte = Math.max(112, elegiveis[22]?.score || 112);
    convocados = convocados.slice(0, 23);
    return { selecao, competicao, convocados, grupos:agruparConvocados(convocados), meuScore, corte, convocado:convocados.some(p => p.id === "player") };
}

function reconstruirConvocacaoDeEstado(ultima, selecao, competicao) {
    if(!ultima?.ids) return null;
    const resolver = (id) => id === "player" ? jogador : jogadoresIA.find(j => j.id === id);
    const convocados = ultima.ids.map(resolver).filter(Boolean);
    return { selecao, competicao: COMPETICOES_SELECOES.find(c => c.nome === ultima.competicao) || competicao, convocados, grupos: agruparConvocados(convocados), convocado: ultima.convocado };
}

// ==========================================
// 🧒 CONVOCAÇÃO PARA SELEÇÕES DE BASE (Sub-17 / Sub-21)
// ==========================================
// Praticamente idêntica a gerarConvocacaoSelecao(), mas o "elenco do país"
// considerado é filtrado por idade PRIMEIRO (idadeMax do torneio). Como a
// pontuação (pontuarJogadorSelecao) é sempre relativa aos outros jogadores
// elegíveis, um jovem de 17 anos só compete com outros jovens de até 17 anos
// — não precisa ser "nível seleção principal" para ser convocado aqui.
function gerarConvocacaoSelecaoBase(selecao, competicaoBase) {
    const idadeMax = competicaoBase.idadeMax;
    const todos = [jogador, ...jogadoresIA.filter(j => !j.aposentado)];
    const elegiveis = todos
        .filter(p => (p.idade || 99) <= idadeMax)
        .filter(p => normalizarNacionalidade(p.nacionalidade) === normalizarNacionalidade(selecao.pais))
        .map(p => ({ p, score: pontuarJogadorSelecao(p, null) })) // sem penalização "sub23", a idade já foi filtrada acima
        .filter(x => x.score > 0);
    const porPos = {
        goleiros: elegiveis.filter(x => POSICOES_CONVOCACAO.goleiros.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,3),
        laterais: elegiveis.filter(x => POSICOES_CONVOCACAO.laterais.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,4),
        defensores: elegiveis.filter(x => POSICOES_CONVOCACAO.defensores.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,5),
        meio: elegiveis.filter(x => POSICOES_CONVOCACAO.meio.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,7),
        ataque: elegiveis.filter(x => POSICOES_CONVOCACAO.ataque.includes(x.p.posicao)).sort((a,b)=>b.score-a.score).slice(0,6)
    };
    let convocados = Object.values(porPos).flat().map(x => x.p);
    const ids = new Set(convocados.map(p => p.id));
    elegiveis.sort((a,b)=>b.score-a.score).forEach(x => {
        if(convocados.length < 23 && !ids.has(x.p.id)) { convocados.push(x.p); ids.add(x.p.id); }
    });
    convocados = convocados.slice(0, 23);
    return { selecao, competicao: competicaoBase, convocados, grupos: agruparConvocados(convocados), convocado: convocados.some(p => p.id === "player") };
}

// Processa a janela de convocação de BASE (Sub-17/Sub-21) para o jogador
// local — irmã de processarJanelaSelecoes(), mas totalmente independente da
// seleção principal (um jogador pode estar fora da seleção principal e ainda
// assim ser convocado para o Sub-17/Sub-21, ou vice-versa).
function processarJanelaSelecoesBase() {
    if(!jogador || jogador.idade > 21) return; // acima do limite do escalão mais velho (Sub-21): nada a fazer aqui
    const chave = `base-${anoAtual}-${rodadaAtual}`;
    const competicaoBase = obterCompeticaoSelecaoBase();
    if(!competicaoBase) return;
    if(jogador.idade > competicaoBase.idadeMax) return; // ex: tem 19 anos mas é janela do Sub-17
    if(selecoesEstado.ultimaChaveBase === chave) return;
    selecoesEstado.ultimaChaveBase = chave;

    const selecao = obterSelecaoPorNacionalidade(jogador.nacionalidade);
    const convocacao = gerarConvocacaoSelecaoBase(selecao, competicaoBase);

    if(!selecoesEstado.convocacoesBase) selecoesEstado.convocacoesBase = [];
    selecoesEstado.convocacoesBase.unshift({
        ano:anoAtual, rodada:rodadaAtual, selecao:selecao.nome, selecaoId:selecao.id, competicao:competicaoBase.nome,
        convocado:convocacao.convocado, ids:convocacao.convocados.map(p=>p.id)
    });
    selecoesEstado.convocacoesBase = selecoesEstado.convocacoesBase.slice(0, 8);

    if(convocacao.convocado) {
        if(!jogador.statsSelecaoBase) jogador.statsSelecaoBase = { jogos:0, gols:0, assistencias:0, convocacoes:0 };
        jogador.statsSelecaoBase.convocacoes++;
        registrarNoticia(`Convocado para o ${competicaoBase.nome}!`, `${jogador.nome} foi chamado para representar ${selecao.nome} no ${competicaoBase.nome} ${anoAtual}.`, "Seleções");
        mostrarToast("Seleção de Base", `Convocado para o ${competicaoBase.nome}! 🧒⚽`, "success");
        inicializarTorneioInternacional({ ...competicaoBase, sub23: false, isBase: true });
        agendarJogosInternacionais();
    }
    renderizarSelecoes();
}

function atualizarStatsSelecao(p, jogos, gols, assistencias) {
    if(!p.statsSelecao) p.statsSelecao = { jogos:0, gols:0, assistencias:0, convocacoes:0 };
    p.statsSelecao.jogos += jogos;
    p.statsSelecao.gols += gols;
    p.statsSelecao.assistencias += assistencias;
    p.statsSelecao.selecao = normalizarNacionalidade(p.nacionalidade);
}

// ==========================================
// 🌍 ESTATÍSTICAS DE SELEÇÃO PARA QUALQUER PAÍS (não só o do jogador)
// ==========================================
// simularTorneiosInternacionais() simula centenas de jogos entre seleções
// (ex: Alemanha 2x1 França) mas SÓ ao nível do placar agregado do país —
// nunca atribuía o jogo/gol/assistência a jogadores específicos. Por isso,
// qualquer jogador que não fosse convocado junto do jogador humano (ex: um
// "Bruno" que joga por outra seleção) ficava sempre com estatísticas em 0,
// mesmo sendo campeão. Esta cache+função corrige isso na raiz.
const _cachePlantelSelecaoIA = {};
function obterPlantelSelecaoParaStatsIA(selecaoId) {
    const chaveCache = `${selecaoId}_${anoAtual}`;
    if (_cachePlantelSelecaoIA[chaveCache]) return _cachePlantelSelecaoIA[chaveCache];
    const sel = SELECOES.find(s => s.id === selecaoId);
    if (!sel) return [];
    const pool = obterJogadoresNacionalidade(sel.pais).filter(p => !p.aposentado).sort((a,b) => (b.geral||0) - (a.geral||0)).slice(0, 18);
    // 🆕 Define titulares (11) e capitão desta seleção junto com o plantel, para
    // que nem todo o grupo de 18 receba minutos/estatísticas por igual.
    if (pool.length > 0) { const { titularesIds, capitaoId } = definirTitularesECapitao(pool); pool.titularesIds = titularesIds; pool.capitaoId = capitaoId; }
    _cachePlantelSelecaoIA[chaveCache] = pool;
    return pool;
}

// Reduz um plantel de seleção (18 ou o convocados de uma convocação) aos 11
// titulares + um banco rotativo pequeno (até 4), em vez do grupo inteiro —
// mesmo princípio do montarEscalacaoJogo() usado nos clubes.
function montarEscalacaoSelecao(pool, titularesIds) {
    if (!titularesIds || !titularesIds.length) return pool;
    const idsTit = new Set(titularesIds);
    const titulares = pool.filter(p => idsTit.has(p.id));
    const bancoTotal = pool.filter(p => !idsTit.has(p.id));
    const nEntram = Math.min(4, bancoTotal.length);
    const poolCopia = [...bancoTotal]; const entram = [];
    while (entram.length < nEntram && poolCopia.length > 0) {
        const idx = Math.floor(Math.random() * poolCopia.length);
        entram.push(poolCopia.splice(idx, 1)[0]);
    }
    return [...titulares, ...entram];
}

// Atribui o resultado de UM jogo entre duas seleções (gA gols para o país A,
// gB para o país B) a jogadores específicos de cada plantel — mesma lógica
// de pesos por posição usada em simularPartidasSelecao, só que aplicada a
// qualquer confronto simulado pelo motor de torneios internacionais.
function atribuirStatsPartidaSelecaoIA(paisAId, paisBId, gA, gB) {
    const pesosGol = { "Atacante":0.95, "Ponta":0.72, "Meia Ofensivo":0.58, "Meio-Campista":0.30, "Volante":0.10, "Lateral":0.06, "Zagueiro":0.03, "Goleiro":0.002 };
    const pesosAst = { "Atacante":0.36, "Ponta":0.70, "Meia Ofensivo":0.86, "Meio-Campista":0.70, "Volante":0.42, "Lateral":0.48, "Zagueiro":0.10, "Goleiro":0.02 };
    const sortear = (pool, campo) => {
        const pesos = campo === "gols" ? pesosGol : pesosAst;
        const total = pool.reduce((acc,p) => acc + Math.pow((p.geral||60)/100, 4.6) * (pesos[p.posicao]||0.22), 0);
        if (total <= 0) return null;
        let alvo = Math.random() * total;
        for (const p of pool) {
            alvo -= Math.pow((p.geral||60)/100, 4.6) * (pesos[p.posicao]||0.22);
            if (alvo <= 0) return p;
        }
        return pool[0];
    };
    const processarLado = (paisId, gols) => {
        const plantel = obterPlantelSelecaoParaStatsIA(paisId);
        if (!plantel.length) return;
        const pool = montarEscalacaoSelecao(plantel, plantel.titularesIds);
        pool.forEach(p => atualizarStatsSelecao(p, 1, 0, 0));
        for (let g = 0; g < gols; g++) {
            const autor = sortear(pool, "gols");
            const assist = Math.random() < 0.78 ? sortear(pool, "assistencias") : null;
            if (autor) atualizarStatsSelecao(autor, 0, 1, 0);
            if (assist && assist.id !== autor?.id) atualizarStatsSelecao(assist, 0, 0, 1);
        }
    };
    processarLado(paisAId, gA);
    processarLado(paisBId, gB);
}

function simularPartidasSelecao(convocacao) {
    const jogos = Math.max(1, convocacao.competicao?.jogos || 1);
    const pesosGol = { "Atacante":0.95, "Ponta":0.72, "Meia Ofensivo":0.58, "Meio-Campista":0.30, "Volante":0.10, "Lateral":0.06, "Zagueiro":0.03, "Goleiro":0.002 };
    const pesosAst = { "Atacante":0.36, "Ponta":0.70, "Meia Ofensivo":0.86, "Meio-Campista":0.70, "Volante":0.42, "Lateral":0.48, "Zagueiro":0.10, "Goleiro":0.02 };
    const poolTotal = convocacao.convocados;
    if(poolTotal.length === 0) return;
    const { titularesIds } = definirTitularesECapitao(poolTotal);
    const sortear = (pool, campo) => {
        const pesos = campo === "gols" ? pesosGol : pesosAst;
        const total = pool.reduce((acc,p) => acc + Math.pow((p.geral || 60) / 100, 4.6) * (pesos[p.posicao] || 0.22), 0);
        let alvo = Math.random() * total;
        for(const p of pool) {
            alvo -= Math.pow((p.geral || 60) / 100, 4.6) * (pesos[p.posicao] || 0.22);
            if(alvo <= 0) return p;
        }
        return pool[0];
    };
    // Convocação conta pra todo o grupo (foi convocado, independente de jogar).
    poolTotal.forEach(p => {
        if(!p.statsSelecao) p.statsSelecao = { jogos:0, gols:0, assistencias:0, convocacoes:0 };
        p.statsSelecao.convocacoes++;
    });
    // 🆕 "Jogos" (minutos reais) só para quem entra em campo naquela partida
    // específica: os titulares + um banco rotativo pequeno — não o grupo
    // convocado inteiro, que antes recebia jogo por igual mesmo sem jogar.
    for(let j=0; j<jogos; j++) {
        const pool = montarEscalacaoSelecao(poolTotal, titularesIds);
        pool.forEach(p => atualizarStatsSelecao(p, 1, 0, 0));
        const golsTime = Math.max(0, Math.floor(Math.random()*3) + (pool.some(p=>p.geral>=88) ? 1 : 0));
        for(let g=0; g<golsTime; g++) {
            const autor = sortear(pool, "gols");
            const assist = Math.random() < 0.78 ? sortear(pool, "assistencias") : null;
            if(autor) atualizarStatsSelecao(autor, 0, 1, 0);
            if(assist && assist.id !== autor?.id) atualizarStatsSelecao(assist, 0, 0, 1);
        }
    }
}

function cardConvocadoAnimado(p, delay, ehTitular = false, ehCapitao = false) {
    const clube = obterClubeJogador(p);
    const logoClube = clube ? obterUrlImagem(clube, 'clube') : "";
    return `<div class="convocado-card convocado-anim ${p.id === "player" ? "eu" : ""} ${ehTitular ? "titular" : "reserva"}" style="animation-delay:${delay}s;">
        <img class="convocado-foto" src="${obterUrlImagem(p,'jogador')}" alt="${p.nome}">
        <div style="flex:1; min-width:0;">
            <strong>${p.nome}${p.id === "player" ? " ⭐" : ""}${ehCapitao ? ' <span class="badge-capitao" title="Capitão">C</span>' : ''}</strong><br>
            <small style="color:#aaa; font-weight:700;">${p.posicao}${ehTitular ? " • Titular" : ""}</small>
        </div>
        ${logoClube ? `<img class="convocado-clube" src="${logoClube}" alt="${clube?.nome || ''}" title="${clube?.nome || ''}">` : ""}
        <span class="meta-pill">OVR ${p.geral}</span>
    </div>`;
}

let convocacaoAnimationTimeouts = [];
let convocacaoAnimationIntervals = [];

// Preferência do jogador: pular automaticamente a animação de convocação
// nas ocasiões em que ele NÃO for convocado (evita perder tempo com listas irrelevantes).
let pularConvocacaoAutomatico = localStorage.getItem("rumo_pref_pular_convocacao") === "true";

window.alternarPularConvocacaoAutomatico = function() {
    pularConvocacaoAutomatico = !pularConvocacaoAutomatico;
    localStorage.setItem("rumo_pref_pular_convocacao", pularConvocacaoAutomatico ? "true" : "false");
    mostrarToast(
        "Preferência Guardada",
        pularConvocacaoAutomatico
            ? "A partir de agora, quando não fores convocado, a animação será pulada automaticamente."
            : "A animação de convocação voltará a ser exibida normalmente.",
        "info"
    );
    renderizarSelecoes();
};

function mostrarAnimacaoConvocacao(convocacao, forcarExibicao = false) {
    if (convocacao.convocado) window.tocarSom('convocacao'); // 🔊 som ao ser convocado
    // Se o jogador ativou "pular quando não for convocado" e esta não é uma consulta manual,
    // mostra apenas um toast rápido em vez de abrir o modal com a animação completa.
    if (!forcarExibicao && !convocacao.convocado && pularConvocacaoAutomatico) {
        mostrarToast(
            `Convocação ${convocacao.selecao.nome}`,
            `${jogador.nome} ficou de fora da lista para ${convocacao.competicao?.nome || "Data FIFA"} desta vez.`,
            "warning"
        );
        return;
    }

    const antigo = document.getElementById("modalConvocacaoSelecao");
    if(antigo) antigo.remove();
    
    // Clear any existing animation timers
    convocacaoAnimationTimeouts.forEach(t => clearTimeout(t));
    convocacaoAnimationIntervals.forEach(i => clearInterval(i));
    convocacaoAnimationTimeouts = [];
    convocacaoAnimationIntervals = [];
    
    const labels = { goleiros:"Goleiros", laterais:"Laterais", defensores:"Defensores", meio:"Meio-campistas", ataque:"Ataque" };
    let delay = 0;
    const euConvocado = convocacao.convocado;
    // 🆕 Mesmo cálculo de titulares/capitão usado na aba Seleções, aplicado
    // aqui pra já aparecer na animação de revelação da lista.
    const todosConvocadosModal = Object.values(convocacao.grupos).flat();
    const { titularesIds: titularesModalIds, capitaoId: capitaoModalId } = todosConvocadosModal.length ? definirTitularesECapitao(todosConvocadosModal) : { titularesIds: [], capitaoId: null };
    const setTitularesModal = new Set(titularesModalIds);
    const banner = euConvocado
        ? `<div class="convocacao-convocado-banner">⭐ ${jogador.nome} FOI CONVOCADO pela Seleção ${convocacao.selecao.nome}!</div>`
        : `<div class="convocacao-nao-convocado">❌ ${jogador.nome} não atingiu o nível exigido e ficou DE FORA da convocação.</div>`;
    const bloco = (key) => `
        <div class="convocacao-grupo">
            <h4>${labels[key]}</h4>
            <div class="convocacao-modal-grid">
                ${(convocacao.grupos[key] || []).map(p => { delay += 0.05; return cardConvocadoAnimado(p, delay, setTitularesModal.has(p.id), p.id === capitaoModalId); }).join("")}
            </div>
        </div>`;
    const modal = document.createElement("div");
    modal.id = "modalConvocacaoSelecao";
    modal.className = "modal";
    modal.innerHTML = `
        <div class="modal-convocacao-card slide-in">
            <div class="modal-convocacao-head">
                <div style="display:flex; align-items:center; gap:14px;">
                    <img src="${convocacao.selecao.logo}" alt="${convocacao.selecao.nome}" onerror="this.style.display='none'">
                    <div><span style="color:var(--theme-primary); font-weight:900; text-transform:uppercase;">Convocação oficial</span><h2 style="margin:4px 0 0;">${convocacao.selecao.nome}</h2><p style="margin:4px 0 0; color:#aaa;">${convocacao.competicao?.nome || "Data FIFA"} • ${anoAtual}</p></div>
                </div>
                <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; justify-content:flex-end;">
                    <label style="display:flex; align-items:center; gap:5px; font-size:0.72rem; color:#aaa; cursor:pointer; user-select:none;">
                        <input type="checkbox" onchange="window.alternarPularConvocacaoAutomatico()" ${pularConvocacaoAutomatico ? "checked" : ""} style="width:14px; height:14px; cursor:pointer;">
                        Sempre pular quando não for convocado
                    </label>
                    <button class="btn-skip-anim" onclick="window.pularAnimacaoConvocacao()" style="padding:8px 16px; border-radius:8px; border:1px solid var(--warning); background:rgba(250,204,21,0.15); color:var(--warning); font-weight:700; cursor:pointer; font-size:0.85rem; text-transform:uppercase;">⏭️ Pular Animação</button>
                    <button class="close-btn" onclick="document.getElementById('modalConvocacaoSelecao')?.remove()">×</button>
                </div>
            </div>
            ${banner}
            ${["goleiros","laterais","defensores","meio","ataque"].map(bloco).join("")}
            <div style="text-align:center; margin-top:20px;"><button class="btn btn-primary" onclick="document.getElementById('modalConvocacaoSelecao')?.remove()">Fechar Lista ➔</button></div>
        </div>`;
    document.body.appendChild(modal);
}

window.pularAnimacaoConvocacao = function() {
    // Clear all animation timers
    convocacaoAnimationTimeouts.forEach(t => clearTimeout(t));
    convocacaoAnimationIntervals.forEach(i => clearInterval(i));
    convocacaoAnimationTimeouts = [];
    convocacaoAnimationIntervals = [];
    
    // Immediately show all animated elements
    const modal = document.getElementById("modalConvocacaoSelecao");
    if(modal) {
        const animElements = modal.querySelectorAll('.convocado-anim');
        animElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0) scale(1)';
        });
    }
};

function processarJanelaSelecoes(forcar = false) {
    if(!jogador) return;
    const chave = `${anoAtual}-${rodadaAtual}`;
    const compAtualAgenda = agendaTemporada[rodadaAtual - 1];
    const slotAtual = obterSlotCalendarioAtual();
    const janela = forcar || rodadaAtual === 1 || compAtualAgenda?.isSelecao || ehJanelaSelecaoCalendario(slotAtual);
    const selecao = obterSelecaoPorNacionalidade(jogador.nacionalidade);
    const competicao = obterCompeticaoSelecao(selecao);

    if(forcar) {
        const ultima = selecoesEstado.convocacoes?.find(c => c.selecaoId === selecao.id);
        const convocacao = ultima ? reconstruirConvocacaoDeEstado(ultima, selecao, competicao) : gerarConvocacaoSelecao(selecao, competicao);
        if(convocacao) mostrarAnimacaoConvocacao(convocacao, true);
        return;
    }

    if(!janela || selecoesEstado.ultimaChave === chave) return;
    selecoesEstado.ultimaChave = chave;

    const convocacao = gerarConvocacaoSelecao(selecao, competicao);
    selecoesEstado.convocacoes.unshift({
        ano:anoAtual, rodada:rodadaAtual, selecao:selecao.nome, selecaoId:selecao.id, competicao:competicao.nome, convocado:convocacao.convocado,
        ids:convocacao.convocados.map(p=>p.id),
        grupos:Object.fromEntries(Object.entries(convocacao.grupos).map(([k,lista]) => [k, lista.map(p=>p.id)]))
    });
    selecoesEstado.convocacoes = selecoesEstado.convocacoes.slice(0, 12);
    const listaNomes = convocacao.convocados.slice(0, 8).map(p => p.nome).join(", ");
    registrarNoticia(`Convocação da Seleção ${selecao.nome}`, `Esta é a lista oficial para ${competicao.nome}: ${listaNomes}${convocacao.convocados.length > 8 ? "..." : ""}.`, "Seleções");

    if((jogador.lesaoRodadas || 0) > 0 && normalizarNacionalidade(jogador.nacionalidade) === normalizarNacionalidade(selecao.pais)) {
        jogador.naSelecao = false;
        registrarNoticia("Cortado por lesão", `${jogador.nome} ficou fora da convocação da Seleção ${selecao.nome} por problema físico.`, "Seleções");
        mostrarAnimacaoConvocacao(convocacao);
    } else if(convocacao.convocado) {
        jogador.naSelecao = true;
        jogador.selecaoId = selecao.id;
        if(!jogador.statsSelecao) jogador.statsSelecao = { jogos:0, gols:0, assistencias:0, convocacoes:0 };
        registrarNoticia("Chamado para a seleção", `${jogador.nome} entrou na lista da Seleção ${selecao.nome} para ${competicao.nome}.`, "Seleções");
        if(Math.random() < 0.55) abrirEntrevista("selecao", { selecao:selecao.nome, competicao:competicao.nome });
    } else {
        jogador.naSelecao = false;
        registrarNoticia("Fora da lista", `${jogador.nome} não atingiu o corte da Seleção ${selecao.nome}: desempenho e concorrência pesaram na decisão.`, "Seleções");
    }
    mostrarAnimacaoConvocacao(convocacao);
    if (convocacao.convocado) {
        // 🛡️ FIX: os companheiros de seleção (jogadores da IA convocados junto
        // contigo) nunca acumulavam jogos/gols/assistências pela seleção —
        // a função que faz isso (simularPartidasSelecao) existia no código mas
        // nunca era chamada por ninguém. As TUAS estatísticas continuam a vir
        // do jogo ao vivo (mais precisas: minutos reais, etc.), por isso aqui
        // simulo só para os teus companheiros de seleção.
        simularPartidasSelecao({ ...convocacao, convocados: convocacao.convocados.filter(p => p.id !== "player") });
    }
    if(convocacao.convocado && FORMATOS_INT[competicao.id]?.formato !== "amistoso") inicializarTorneioInternacional(competicao);
    if(convocacao.convocado) agendarJogosInternacionais();
    renderizarSelecoes();
}
window.processarJanelaSelecoes = processarJanelaSelecoes;
window.renderizarCompeticoesInternacionais = renderizarCompeticoesInternacionais;

function renderizarSelecoes() {
    const el = document.getElementById("view-selecoes");
    if(!el || !jogador) return;
    // 🌐 RIVALIDADE ONLINE: card exclusivo do modo online — compara, lado a
    // lado, as tuas estatísticas com as do teu amigo (usa o perfil dele já
    // sincronizado em jogadoresIA). Não existe no modo offline porque não há
    // ninguém para comparar.
    const cardRivalidade = (() => {
        if (window.connectionMode !== 'online' || !window.onlinePartnerId) return "";
        const amigo = jogadoresIA.find(j => j.id === window.onlinePartnerId);
        if (!amigo) return "";
        const linha = (label, meu, dele) => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px dashed rgba(255,255,255,0.08);">
                <strong style="color:${meu >= dele ? 'var(--success)' : '#fff'};">${meu}</strong>
                <span style="color:#aaa; font-size:0.85rem;">${label}</span>
                <strong style="color:${dele >= meu ? 'var(--success)' : '#fff'};">${dele}</strong>
            </div>`;
        return `<div class="selecao-card" style="margin-bottom:18px; grid-column:1/-1; border:1px solid var(--theme-primary);">
            <h3 style="margin-top:0; text-align:center;">🌐 Rivalidade — Tu vs ${amigo.nome}</h3>
            ${linha("Overall (OVR)", jogador.geral, amigo.geral || 0)}
            ${linha("Gols na época", jogador.estatisticasAtuais.gols, amigo.statsTemporada?.gols || 0)}
            ${linha("Assistências na época", jogador.estatisticasAtuais.assistencias, amigo.statsTemporada?.assistencias || 0)}
            ${linha("Troféus pela seleção", jogador.titulosSelecao?.length || 0, amigo.titulosSelecao?.length || 0)}
        </div>`;
    })();
    const selecao = obterSelecaoPorNacionalidade(jogador.nacionalidade);
    const proxima = obterCompeticaoSelecao(selecao);
    const ultima = selecoesEstado.convocacoes?.find(c => c.selecaoId === selecao.id);
    const todos = [jogador, ...jogadoresIA.filter(j => !j.aposentado)];
    const resolver = (id) => id === "player" ? jogador : jogadoresIA.find(j => j.id === id);
    const grupos = ultima?.grupos ? Object.fromEntries(Object.entries(ultima.grupos).map(([k, ids]) => [k, ids.map(resolver).filter(Boolean)])) : gerarConvocacaoSelecao(selecao, proxima).grupos;
    // 🆕 Titulares + capitão desta convocação — assim dá pra ver não só quem
    // foi chamado, mas quem realmente começa jogando e quem usa a braçadeira.
    const todosConvocados = Object.values(grupos).flat();
    const { titularesIds: titularesConvocacaoIds, capitaoId: capitaoConvocacaoId } = todosConvocados.length ? definirTitularesECapitao(todosConvocados) : { titularesIds: [], capitaoId: null };
    const setTitularesConvocacao = new Set(titularesConvocacaoIds);
    const labels = { goleiros:"Goleiros", laterais:"Laterais", defensores:"Defensores", meio:"Meio-campistas", ataque:"Ataque" };
    const iconesPos = { goleiros:"🧤", laterais:"↔️", defensores:"🛡️", meio:"⚙️", ataque:"⚔️" };
    const bloco = (key) => `
        <div class="convocacao-grupo">
            <h4>${iconesPos[key] || ""} ${labels[key]} <span class="convocacao-grupo-count">${(grupos[key] || []).length}</span></h4>
            ${(grupos[key] || []).map(p => {
                const clube = obterClubeJogador(p);
                const ehCapitao = p.id === capitaoConvocacaoId;
                const ehTitular = setTitularesConvocacao.has(p.id);
                return `<div class="convocado-row ${p.id === "player" ? "eu" : ""} ${ehTitular ? "titular" : "reserva"}" onclick="abrirPerfilJogador('${p.id}')">
                    <img src="${obterUrlImagem(p,'jogador')}" alt="${p.nome}">
                    <div>
                        <strong>${p.nome}${ehCapitao ? ' <span class="badge-capitao" title="Capitão">C</span>' : ''}</strong>
                        <small>${clube?.nome || "Livre"} • ${p.posicao} • ${p.statsSelecao?.jogos || 0}J ${p.statsSelecao?.gols || 0}G ${p.statsSelecao?.assistencias || 0}A</small>
                    </div>
                    ${clube ? `<img class="convocado-escudo" src="${obterUrlImagem(clube,'clube')}">` : `<span></span>`}
                    <span class="convocado-status-tag ${ehTitular ? "titular" : "reserva"}">${ehTitular ? "Titular" : "Banco"}</span>
                    <span class="meta-pill">OVR ${p.geral}</span>
                </div>`;
            }).join("") || `<p style="color:#aaa;">Sem nomes suficientes.</p>`}
        </div>`;
    const rankingSelecao = todos
        .filter(p => normalizarNacionalidade(p.nacionalidade) === normalizarNacionalidade(selecao.pais))
        .sort((a,b) => (b.statsSelecao?.gols || 0) - (a.statsSelecao?.gols || 0) || (b.geral || 0) - (a.geral || 0))
        .slice(0, 8);
    el.innerHTML = `
        ${cardRivalidade}
        <div class="selecao-shell">
            <section>
                <div class="selecao-hero">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <img src="${selecao.logo}" alt="${selecao.nome}" onerror="this.style.display='none'">
                        <div><span style="color:var(--theme-primary); font-weight:900; text-transform:uppercase;">Carreira internacional</span><h2 style="margin:4px 0;">Seleção ${selecao.nome}</h2><p style="margin:0; color:#aaa;">Próxima janela: ${proxima.nome}${proxima.div ? ` • Divisão ${proxima.div}` : ""}</p></div>
                    </div>
                    <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap; justify-content:flex-end;">
                        <label style="display:flex; align-items:center; gap:6px; font-size:0.78rem; color:#aaa; cursor:pointer; user-select:none; max-width:170px; line-height:1.2;">
                            <input type="checkbox" id="chkPularConvocacao" onchange="window.alternarPularConvocacaoAutomatico()" ${pularConvocacaoAutomatico ? "checked" : ""} style="width:16px; height:16px; cursor:pointer; flex-shrink:0;">
                            Pular animação quando eu não for convocado
                        </label>
                        <button class="btn btn-primary" onclick="processarJanelaSelecoes(true)">Ver convocação</button>
                    </div>
                </div>
                <div class="selecao-card" style="margin-top:16px;">
                    <h3 style="margin-top:0;">Lista ${ultima ? `${ultima.competicao} ${ultima.ano}` : "prévia"}</h3>
                    <div class="convocacao-resumo">
                        <span>👥 ${todosConvocados.length} convocados</span>
                        <span>🧢 Capitão: ${resolver(capitaoConvocacaoId)?.nome || "—"}</span>
                        <span>🏟️ ${new Set(todosConvocados.map(p => obterClubeJogador(p)?.id).filter(Boolean)).size} clubes representados</span>
                        <span>⭐ ${jogador?.naSelecao ? "Você está na lista" : "Você está fora da lista"}</span>
                    </div>
                    ${["goleiros","laterais","defensores","meio","ataque"].map(bloco).join("")}
                </div>
            </section>
            <aside class="selecao-card">
                <h3 style="margin-top:0;">Teus números pela seleção</h3>
                <div class="selecao-stats-grid">
                    <div class="selecao-stat"><strong>${jogador.statsSelecao?.jogos || 0}</strong><span>Jogos</span></div>
                    <div class="selecao-stat"><strong>${jogador.statsSelecao?.gols || 0}</strong><span>Gols</span></div>
                    <div class="selecao-stat"><strong>${jogador.statsSelecao?.assistencias || 0}</strong><span>Assistências</span></div>
                </div>
                <p style="color:#aaa; line-height:1.6;">Status: <strong style="color:${jogador.naSelecao ? 'var(--success)' : '#f87171'};">${jogador.naSelecao ? "Convocado recentemente" : "Fora da última lista"}</strong></p>
                <h4 style="color:var(--theme-primary);">Competições no ciclo</h4>
                ${COMPETICOES_SELECOES.filter(c => c.conf === "GLOBAL" || c.conf === selecao.conf).map(c => `<div style="padding:10px 0; border-bottom:1px dashed rgba(255,255,255,0.09);"><strong>${c.nome}</strong><br><small style="color:#aaa;">${c.div ? `Divisão ${c.div}` : c.ciclo}</small></div>`).join("")}
                <h4 style="color:var(--theme-primary); margin-top:18px;">Destaques da seleção</h4>
                ${rankingSelecao.map(p => {
                    const clube = obterClubeJogador(p);
                    return `<div class="convocado-row" onclick="abrirPerfilJogador('${p.id}')">
                        <img src="${obterUrlImagem(p,'jogador')}">
                        <div><strong>${p.nome}</strong><br><small>${clube?.nome || "Livre"} • ${p.statsSelecao?.jogos || 0}J • ${p.statsSelecao?.gols || 0}G • ${p.statsSelecao?.assistencias || 0}A</small></div>
                        ${clube ? `<img src="${obterUrlImagem(clube,'clube')}" style="width:24px;height:24px;object-fit:contain;background:#fff;border-radius:4px;padding:2px;">` : ""}
                        <span class="meta-pill">OVR ${p.geral}</span>
                    </div>`;
                }).join("")}
            </aside>
        </div>
        ${(() => {
            const key = chaveTorneio(proxima.id, anoAtual);
            const tor = selecoesEstado.torneios?.[key];
            if(!tor) return `<div class="selecao-card" style="margin-top:18px; grid-column:1/-1;"><p style="color:#aaa; text-align:center; padding:20px;">Nenhum torneio internacional ativo nesta temporada. Convoca-te e disputa a próxima janela FIFA.</p></div>`;
            let html = `<div class="selecao-card" style="margin-top:18px; grid-column:1/-1;"><h3 style="margin-top:0;">🏆 ${tor.nome} ${tor.ano}</h3><div class="bracket-container">`;
            if(tor.historicoFases?.length) tor.historicoFases.slice(-2).forEach(f => { html += renderBlocoFaseInternacional(f); });
            html += renderBlocoFaseInternacional(tor);
            if(tor.fase === "Campeão Definido") {
                const camp = SELECOES.find(s => s.id === tor.campeaoId);
                html += `<p style="text-align:center; color:var(--gold); font-weight:900; font-size:1.2rem;">👑 Campeão: ${camp?.nome || tor.campeaoId}</p>`;
            }
            return html + `</div></div>`;
        })()}
        ${(() => {
            // 🧒 Bloco da seleção de BASE — só aparece se o jogador ainda está
            // dentro do limite de idade (≤21) de algum escalão de base.
            if (jogador.idade > 21) return "";
            const competicaoBase = obterCompeticaoSelecaoBase();
            const ultimaBase = selecoesEstado.convocacoesBase?.find(c => c.selecaoId === selecao.id);
            const statsBase = jogador.statsSelecaoBase || { jogos:0, gols:0, assistencias:0, convocacoes:0 };
            let html = `<div class="selecao-card" style="margin-top:18px; grid-column:1/-1; border:1px dashed var(--theme-primary);">
                <h3 style="margin-top:0;">🧒 Seleção de Base ${jogador.idade <= 17 ? "(Sub-17 e Sub-21)" : "(Sub-21)"}</h3>
                <p style="color:#aaa;">Mesmo fora do nível da seleção principal, jogadores até 21 anos podem disputar os torneios de base do seu país.</p>
                <div class="selecao-stats-grid">
                    <div class="selecao-stat"><strong>${statsBase.jogos}</strong><span>Jogos</span></div>
                    <div class="selecao-stat"><strong>${statsBase.gols}</strong><span>Gols</span></div>
                    <div class="selecao-stat"><strong>${statsBase.assistencias}</strong><span>Assistências</span></div>
                    <div class="selecao-stat"><strong>${statsBase.convocacoes}</strong><span>Convocações</span></div>
                </div>`;
            if (competicaoBase && jogador.idade <= competicaoBase.idadeMax) {
                const keyBase = chaveTorneio(competicaoBase.id, anoAtual);
                const torBase = selecoesEstado.torneios?.[keyBase];
                html += `<p style="color:var(--theme-primary); font-weight:700;">📅 Janela ativa: ${competicaoBase.nome} ${anoAtual}${ultimaBase ? ` — ${ultimaBase.convocado ? "Convocado! 🎉" : "Não convocado desta vez."}` : ""}</p>`;
                if (torBase) {
                    html += `<div class="bracket-container">${renderBlocoFaseInternacional(torBase)}</div>`;
                    if (torBase.fase === "Campeão Definido") {
                        const camp = SELECOES.find(s => s.id === torBase.campeaoId);
                        html += `<p style="text-align:center; color:var(--gold); font-weight:900;">👑 Campeão: ${camp?.nome || torBase.campeaoId}</p>`;
                    }
                }
            } else {
                html += `<p style="color:#aaa;">Nenhuma janela de base ativa nesta temporada para a tua idade.</p>`;
            }
            return html + `</div>`;
        })()}`;
}

function gerarJovensGenericos(qtd = 34) {
    const nomes = ["Mateus", "João", "Lucas", "Enzo", "Rafael", "Gabriel", "Pedro", "Diego", "Nico", "Luan", "André", "Thiago", "Samuel", "Bruno", "Tomás", "Hugo"];
    const sobrenomes = ["Silva", "Costa", "Ferreira", "Almeida", "Pereira", "Santos", "Oliveira", "Lima", "Gomes", "Martins", "Rocha", "Cardoso", "Ribeiro", "Mendes", "Castro", "Araujo"];
    const posicoes = ["Goleiro","Zagueiro","Lateral","Volante","Meio-Campista","Meia Ofensivo","Ponta","Atacante"];
    const nacionalidades = SELECOES.map(s => s.pais);
    const clubesBase = clubes.filter(c => c.ligaId && c.reputacao >= 58).sort(() => Math.random() - 0.5);
    let criados = 0;
    while(criados < qtd && clubesBase.length) {
        const clube = clubesBase[criados % clubesBase.length];
        const idade = 16 + Math.floor(Math.random() * 5);
        const potencialLiga = clube.reputacao >= 85 ? 70 : clube.reputacao >= 78 ? 66 : 61;
        const geral = Math.max(50, Math.min(76, potencialLiga + Math.floor(Math.random() * 11) - 5));
        const nome = `${nomes[Math.floor(Math.random()*nomes.length)]} ${sobrenomes[Math.floor(Math.random()*sobrenomes.length)]}`;
        const posicaoJovem = posicoes[Math.floor(Math.random()*posicoes.length)];
        jogadoresIA.push({
            id:`j_newgen_${anoAtual}_${criados}_${Date.now().toString(36)}`,
            nome,
            idade,
            geral,
            clubeId:clube.id,
            nacionalidade:nacionalidades[Math.floor(Math.random()*nacionalidades.length)],
            posicao:posicaoJovem,
            foto:"",
            contrato:Math.floor(Math.random()*3)+2,
            felicidade:60 + Math.floor(Math.random()*25),
            inteligencia:45 + Math.floor(Math.random()*28),
            potencial: gerarPotencialJogador(geral),
            // ⚙️ Atributos individuais desde a estreia — mesmo critério (posição + OVR) usado para todo o resto do elenco.
            ...gerarAtributosParaJogador(posicaoJovem, geral),
            statsTemporada:{ jogos:0, gols:0, assistencias:0, notas:[] },
            statsSelecao:{ jogos:0, gols:0, assistencias:0, convocacoes:0 },
            historicoCarreira:[]
        });
        criados++;
    }
    if(criados) registrarNoticia("Nova geração chega aos clubes", `${criados} jovens jogadores foram integrados às bases e elencos profissionais para renovar o mercado.`, "Base");
}

const TEMAS_COMPETICOES = {
    hub: { cor: "#00ff88", img: "" },
    eng_1: { cor: "#00d8ff", img: "https://i.ibb.co/5h5QGVXb/Texture-Theme-EPL.png" },
    carabao_eng: { cor: "#0b8600", img: "https://i.ibb.co/6J0nTwZy/fab2128c-e881-42c9-8881-579531cfb3f6.png" },
    copa_eng: { cor: "#ca2b16", img: "https://i.ibb.co/XrChpJRJ/896acbef-567b-4032-8b47-95da84007ff8.png" },
    eng_2: { cor: "#ffffff", img: "https://i.ibb.co/FbYZqHZK/240a1554-0b80-40a4-b171-8abbbb8717f0.png" },
    supercopa_eng: { cor: "#ca2b16", img: "https://i.ibb.co/xSP6ykD6/image.png" },
    esp: { cor: "#ff4d4d", img: "https://i.ibb.co/8nhCpHTN/Texture-Theme-La-Liga.png" },
    ita: { cor: "#4ade80", img: "https://i.ibb.co/Cpmcn1Mp/d3565473-9dd0-4955-928b-64e68b18b129.png" },
    ger: { cor: "#ef4444", img: "https://i.ibb.co/8Wn88Pg/Texture-Theme-Bundesliga.png" },
    fra: { cor: "#60a5fa", img: "https://i.ibb.co/Q7nv3KTN/Texture-Theme-Ligue-One.png" },
    pt: { cor: "#22c55e", img: "https://i.ibb.co/Zz0q8HSy/6ddcbece-af8f-4889-b9aa-d720c01a6771.png" },
    br_1: { cor: "#facc15", img: "https://i.ibb.co/pjvQT62J/0c3b5a89-2f6d-48fb-b787-86c1e2e3f0ba.png" },
    br_2: { cor: "#facc15", img: "https://i.ibb.co/DHxF4wF8/402a4527-80cb-47d1-8837-d224b722ceaa.png" },
    br_3: { cor: "#facc15", img: "https://i.ibb.co/NdD2BHBm/b7017d32-e1cc-489c-be49-c3c52d7285be.png" },
    br_4: { cor: "#facc15", img: "https://i.ibb.co/xtBMDR8k/5a320c73-d40c-462e-87ec-1d2efdfef13e.png" },
    copa_br: { cor: "#facc15", img: "https://i.ibb.co/DXDc6GD/65ee9eff-8305-4340-af28-8d5e0435cbca.png" },
    supercopa_br: { cor: "#facc15", img: "https://i.ibb.co/07cm20F/c0b21d32-8b09-443b-a972-2c427b4da9c4.png" },
    arg: { cor: "#7dd3fc", img: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000&auto=format&fit=crop" },
    usa: { cor: "#60a5fa", img: "https://i.ibb.co/p631bhjv/Texture-Theme-MLS.png" },
    ara: { cor: "#045712", img: "https://i.ibb.co/XkywSZ5T/8b754c3d-8759-47ac-9bc7-1921110aac8e.png" },
    mx: { cor: "#22c55e", img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop" },
    uefa_cl: { cor: "#93c5fd", img: "https://i.ibb.co/MxG3hvhK/Texture-Theme-UCL.png" },
    uefa_el: { cor: "#fb923c", img: "https://i.ibb.co/Wvr2Z0QH/Texture-Theme-Euro-League.png" },
    uefa_col: { cor: "#22c55e", img: "https://i.ibb.co/Rx14dxQ/Texture-Theme-UECL.png" },
    conmebol_lib: { cor: "#f59e0b", img: "https://i.ibb.co/8LCFn0Df/6a6deb85-920a-4b42-8beb-2bf148aef7e7.png" },
    conmebol_sul: { cor: "#22c55e", img: "https://i.ibb.co/Fk6C2qTQ/Texture-Theme-Sudamericana.png" },
    copa_mundo: { cor: "#facc15", img: "https://wallpapercave.com/wp/wp16426287.webp" },
    euro: { cor: "#3b82f6", img: "https://static.vecteezy.com/system/resources/thumbnails/041/933/077/small_2x/background-of-euro-2024-in-germany-with-the-tournament-logo-free-vector.jpg" },
    copa_america: { cor: "#22c55e", img: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000&auto=format&fit=crop" },
    amistoso: { cor: "#a7f3d0", img: "https://i.ibb.co/MxX9NRZM/b2268041-c169-4da2-80e1-1eb51ccc2802.png" }
};

function obterTemaCompeticao(compId) {
    const id = String(compId || "hub");
    const prefix = obterPaisCompeticaoId(id);
    return TEMAS_COMPETICOES[id] || TEMAS_COMPETICOES[prefix] || (id.includes("uefa") ? TEMAS_COMPETICOES.uefa_cl : null) || (id.includes("conmebol") ? TEMAS_COMPETICOES.conmebol_lib : null) || TEMAS_COMPETICOES.hub;
}

// Aplica o tema GLOBAL (fundo da página + cor principal). Deve refletir sempre
// a competição que o jogador realmente está a disputar (hub, próximo jogo, etc.)
window.aplicarTemaCompeticao = function(compId) {
    const id = String(compId || "hub");
    const tema = obterTemaCompeticao(id);

    document.documentElement.style.setProperty("--theme-primary", tema.cor);
    document.body.dataset.competicaoTema = id;

    if (tema.img) {
        document.body.style.backgroundImage = `url('${tema.img}')`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
    } else {
        document.body.style.backgroundImage = "";
    }
};

// Aplica apenas uma cor de destaque LOCAL (--comp-cor) num container específico,
// sem alterar o fundo global da página. Usado ao explorar tabelas/competições
// que não são as do próprio jogador (não deve "vazar" para o resto do jogo).
window.aplicarCorLocalCompeticao = function(compId, containerEl) {
    const tema = obterTemaCompeticao(compId);
    if (containerEl && containerEl.style) containerEl.style.setProperty("--comp-cor", tema.cor);
    return tema.cor;
};

// Descobre a competição que o jogador está de facto a disputar nesta semana
// (o compromisso agendado) para poder repor corretamente o tema do fundo.
function obterCompeticaoAtualDoJogador() {
    if (!jogador) return "hub";
    const comp = agendaTemporada && agendaTemporada[rodadaAtual - 1];
    if (comp && !comp.isFolga) return comp.compConfigId || comp.compId || "hub";
    if (jogador.clubeId) {
        const meuClube = clubes.find(c => c.id === jogador.clubeId);
        if (meuClube && meuClube.ligaId) return meuClube.ligaId;
    }
    return "hub";
}

// Repõe o fundo/tema global de acordo com a competição atual do jogador.
// Chamar sempre que se navega para fora das secções de exploração de
// tabelas/competições/chaveamentos de outras equipas.
window.restaurarTemaJogadorAtual = function() {
    aplicarTemaCompeticao(obterCompeticaoAtualDoJogador());
};
window.mudarAbaModal = function(abaId) {
    document.querySelectorAll('.aba-conteudo').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn-modal').forEach(b => { b.style.background = 'none'; b.style.color = '#aaa'; });
    let targetAba = document.getElementById('aba-' + abaId); let targetBtn = document.getElementById('btn-aba-' + abaId);
    if(targetAba) targetAba.style.display = 'block';
    if(targetBtn) { targetBtn.style.background = 'rgba(0, 255, 136, 0.1)'; targetBtn.style.color = '#00ff88'; }
}

window.toggleConquistaDetalhes = function(el) {
    el.classList.toggle("aberto");
};

function montarCardConquista(nome, detalhes) {
    const safeNome = nome || "Conquista";
    const detalheHTML = detalhes.map(d => `<div>${d.ano || "-"} - ${d.clube || "Clube"}</div>`).join("");

    // Check if this is an international trophy (contains "Seleção" in any detail)
    const isInternational = detalhes.some(d => d.clube && d.clube.includes("Seleção"));

    return `
        <div class="card-conquista conquista-stack ${isInternational ? 'international-trophy' : ''}" onclick="toggleConquistaDetalhes(this)">
            <img src="${obterUrlImagem(safeNome, 'trofeu')}" style="width:60px; height:60px; filter: drop-shadow(0 0 10px rgba(255,215,0,0.6));">
            ${detalhes.length > 1 ? `<span class="conquista-count">x${detalhes.length}</span>` : ""}
            ${isInternational ? `<span class="international-badge">🌍</span>` : ""}
            <div>
                <strong style="color:${isInternational ? 'var(--world-cup-gold)' : 'var(--gold)'}; font-size:1.35rem;">${safeNome}</strong><br>
                <span style="font-size:0.95rem; color:#aaa;">${detalhes.length > 1 ? "Clique para ver anos e clubes" : `Ano ${detalhes[0]?.ano || "-"} - ${detalhes[0]?.clube || "Clube"}`}</span>
                <div class="conquista-detalhes">${detalheHTML}</div>
            </div>
        </div>`;
}

function agruparTrofeusJogador(j) {
    const grupos = {};
    (j.historicoCarreira || []).forEach(h => {
        if(!h.trofeus || h.trofeus === "-") return;
        h.trofeus.split(", ").forEach(tr => {
            const nome = tr.trim();
            if(!nome) return;
            if(!grupos[nome]) grupos[nome] = [];
            grupos[nome].push({ ano: h.ano, clube: h.clube });
        });
    });
    (j.titulosSelecao || []).forEach(t => {
        const nome = t.trofeu || "Título Internacional";
        if(!grupos[nome]) grupos[nome] = [];
        grupos[nome].push({ ano: t.ano, clube: `Seleção ${t.selecao}` });
    });
    return Object.entries(grupos).map(([nome, detalhes]) => montarCardConquista(nome, detalhes)).join("");
}

function agruparTrofeusClube(c) {
    const grupos = {};
    (c.historicoTitulos || []).forEach(t => {
        const partes = String(t).split(" - ");
        const ano = partes.length > 1 ? partes.shift() : "-";
        const nome = partes.join(" - ") || String(t);
        if(!grupos[nome]) grupos[nome] = [];
        grupos[nome].push({ ano, clube: c.nome });
    });
    return Object.entries(grupos).map(([nome, detalhes]) => montarCardConquista(nome, detalhes)).join("");
}

const HISTORICO_REAL_JOGADORES = {
    j_cr7: [
    { ano: "2002/03", clube: "Sporting", jogos: 31, gols: 5, assistencias: 6, trofeus: "" },
    { ano: "2003/04", clube: "Manchester United", jogos: 40, gols: 6, assistencias: 8, trofeus: "FA Cup" },
    { ano: "2004/05", clube: "Manchester United", jogos: 50, gols: 9, assistencias: 9, trofeus: "" },
    { ano: "2005/06", clube: "Manchester United", jogos: 47, gols: 12, assistencias: 8, trofeus: "Carabao Cup" },
    { ano: "2006/07", clube: "Manchester United", jogos: 53, gols: 23, assistencias: 20, trofeus: "Premier League" },
    { ano: "2007/08", clube: "Manchester United", jogos: 49, gols: 42, assistencias: 8, trofeus: "Champions League, Premier League, Community Shield, Bola de Ouro, Chuteira de Ouro" },
    { ano: "2008/09", clube: "Manchester United", jogos: 53, gols: 26, assistencias: 12, trofeus: "Premier League, Copa Intercontinental da FIFA" },
    { ano: "2009/10", clube: "Real Madrid", jogos: 35, gols: 33, assistencias: 10, trofeus: "" },
    { ano: "2010/11", clube: "Real Madrid", jogos: 54, gols: 53, assistencias: 14, trofeus: "Copa del Rey, Chuteira de Ouro" },
    { ano: "2011/12", clube: "Real Madrid", jogos: 55, gols: 60, assistencias: 15, trofeus: "La Liga" },
    { ano: "2012/13", clube: "Real Madrid", jogos: 55, gols: 55, assistencias: 14, trofeus: "Bola de Ouro, Supercopa da Espanha" },
    { ano: "2013/14", clube: "Real Madrid", jogos: 47, gols: 51, assistencias: 15, trofeus: "Champions League, Copa del Rey, Bola de Ouro, Chuteira de Ouro" },
    { ano: "2014/15", clube: "Real Madrid", jogos: 54, gols: 61, assistencias: 22, trofeus: "Copa Intercontinental da FIFA, Chuteira de Ouro" },
    { ano: "2015/16", clube: "Real Madrid", jogos: 48, gols: 51, assistencias: 15, trofeus: "Champions League, Bola de Ouro" },
    { ano: "2016/17", clube: "Real Madrid", jogos: 46, gols: 42, assistencias: 12, trofeus: "Champions League, La Liga, Bola de Ouro, Supercopa da Espanha" },
    { ano: "2017/18", clube: "Real Madrid", jogos: 44, gols: 44, assistencias: 8, trofeus: "Champions League" },
    { ano: "2018/19", clube: "Juventus", jogos: 43, gols: 28, assistencias: 10, trofeus: "Serie A" },
    { ano: "2019/20", clube: "Juventus", jogos: 46, gols: 37, assistencias: 7, trofeus: "Serie A" },
    { ano: "2020/21", clube: "Juventus", jogos: 44, gols: 36, assistencias: 4, trofeus: "Coppa Italia" },
    { ano: "2021/22", clube: "Manchester United", jogos: 38, gols: 24, assistencias: 3, trofeus: "" },
    { ano: "2022/23", clube: "Al Nassr", jogos: 19, gols: 14, assistencias: 2, trofeus: "" },
    { ano: "2023/24", clube: "Al Nassr", jogos: 50, gols: 50, assistencias: 13, trofeus: "Artilheiro Saudi Pro" },
    { ano: "2024/25", clube: "Al Nassr", jogos: 41, gols: 35, assistencias: 4, trofeus: "" }
],
    j_messi: [
    { ano: "2004/05", clube: "Barcelona", jogos: 9, gols: 1, assistencias: 0, trofeus: "La Liga" },
    { ano: "2005/06", clube: "Barcelona", jogos: 25, gols: 8, assistencias: 3, trofeus: "Champions League, La Liga" },
    { ano: "2006/07", clube: "Barcelona", jogos: 36, gols: 17, assistencias: 3, trofeus: "Supercopa da Espanha" },
    { ano: "2007/08", clube: "Barcelona", jogos: 40, gols: 16, assistencias: 13, trofeus: "" },
    { ano: "2008/09", clube: "Barcelona", jogos: 51, gols: 38, assistencias: 18, trofeus: "Champions League, La Liga, Copa del Rey" },
    { ano: "2009/10", clube: "Barcelona", jogos: 53, gols: 47, assistencias: 11, trofeus: "La Liga, Bola de Ouro, Supercopa da Espanha, Chuteira de Ouro" },
    { ano: "2010/11", clube: "Barcelona", jogos: 55, gols: 53, assistencias: 24, trofeus: "Champions League, La Liga, Bola de Ouro, Supercopa da Espanha" },
    { ano: "2011/12", clube: "Barcelona", jogos: 60, gols: 73, assistencias: 30, trofeus: "Copa del Rey, Bola de Ouro, Chuteira de Ouro, Supercopa da Espanha" },
    { ano: "2012/13", clube: "Barcelona", jogos: 50, gols: 60, assistencias: 15, trofeus: "La Liga, Bola de Ouro, Chuteira de Ouro" },
    { ano: "2013/14", clube: "Barcelona", jogos: 46, gols: 41, assistencias: 14, trofeus: "Supercopa da Espanha" },
    { ano: "2014/15", clube: "Barcelona", jogos: 57, gols: 58, assistencias: 27, trofeus: "Champions League, La Liga, Copa del Rey, Bola de Ouro" },
    { ano: "2015/16", clube: "Barcelona", jogos: 49, gols: 41, assistencias: 23, trofeus: "La Liga, Copa del Rey" },
    { ano: "2016/17", clube: "Barcelona", jogos: 52, gols: 54, assistencias: 16, trofeus: "Copa del Rey, Supercopa da Espanha, Chuteira de Ouro" },
    { ano: "2017/18", clube: "Barcelona", jogos: 54, gols: 45, assistencias: 18, trofeus: "La Liga, Copa del Rey, Chuteira de Ouro" },
    { ano: "2018/19", clube: "Barcelona", jogos: 50, gols: 51, assistencias: 19, trofeus: "La Liga, Bola de Ouro, Chuteira de Ouro, Supercopa da Espanha" },
    { ano: "2019/20", clube: "Barcelona", jogos: 44, gols: 31, assistencias: 26, trofeus: "" },
    { ano: "2020/21", clube: "Barcelona", jogos: 47, gols: 38, assistencias: 14, trofeus: "Copa del Rey, Bola de Ouro" },
    { ano: "2021/22", clube: "PSG", jogos: 34, gols: 11, assistencias: 15, trofeus: "Ligue 1" },
    { ano: "2022/23", clube: "PSG", jogos: 41, gols: 21, assistencias: 20, trofeus: "Ligue 1, Copa do Mundo, The Best FIFA, Bola de Ouro" },
    { ano: "2023/24", clube: "Inter Miami", jogos: 29, gols: 25, assistencias: 16, trofeus: "Leagues Cup" },
    { ano: "2024/25", clube: "Inter Miami", jogos: 39, gols: 28, assistencias: 18, trofeus: "Supporters' Shield" }
],

j_ney: [
    { ano: "2009", clube: "Santos", jogos: 48, gols: 14, assistencias: 8, trofeus: "" },
    { ano: "2010", clube: "Santos", jogos: 60, gols: 42, assistencias: 16, trofeus: "Copa do Brasil, Campeonato Paulista" },
    { ano: "2011", clube: "Santos", jogos: 47, gols: 24, assistencias: 11, trofeus: "Libertadores, Puskas" },
    { ano: "2012", clube: "Santos", jogos: 47, gols: 43, assistencias: 18, trofeus: "Recopa Sudamericana, Campeonato Paulista" },
    { ano: "2013", clube: "Barcelona", jogos: 49, gols: 24, assistencias: 12, trofeus: "" },
    { ano: "2013/14", clube: "Barcelona", jogos: 41, gols: 15, assistencias: 15, trofeus: "" },
    { ano: "2014/15", clube: "Barcelona", jogos: 51, gols: 39, assistencias: 10, trofeus: "Champions League, La Liga, Copa del Rey" },
    { ano: "2015/16", clube: "Barcelona", jogos: 49, gols: 31, assistencias: 25, trofeus: "La Liga, Copa del Rey, Copa Intercontinental da FIFA" },
    { ano: "2016/17", clube: "Barcelona", jogos: 45, gols: 20, assistencias: 27, trofeus: "Copa del Rey" },
    { ano: "2017/18", clube: "PSG", jogos: 30, gols: 28, assistencias: 16, trofeus: "Ligue 1, Coupe de France" },
    { ano: "2018/19", clube: "PSG", jogos: 28, gols: 23, assistencias: 13, trofeus: "Ligue 1" },
    { ano: "2019/20", clube: "PSG", jogos: 27, gols: 19, assistencias: 12, trofeus: "Ligue 1, Coupe de France," },
    { ano: "2020/21", clube: "PSG", jogos: 31, gols: 17, assistencias: 11, trofeus: "Coupe de France" },
    { ano: "2021/22", clube: "PSG", jogos: 28, gols: 13, assistencias: 8, trofeus: "Ligue 1" },
    { ano: "2022/23", clube: "PSG", jogos: 29, gols: 18, assistencias: 17, trofeus: "Ligue 1" },
    { ano: "2023/24", clube: "Al Hilal", jogos: 5, gols: 1, assistencias: 3, trofeus: "Saudi Pro" },
    { ano: "2024/25", clube: "Santos", jogos: 24, gols: 9, assistencias: 11, trofeus: "" }
],
    j_benzema: [
        { ano: "2021/22", clube: "Real Madrid", jogos: 46, gols: 44, assistencias: 15, trofeus: "Champions League, La Liga, Supercopa da Espanha, Bola de Ouro" },
        { ano: "2017/18", clube: "Real Madrid", jogos: 47, gols: 12, assistencias: 11, trofeus: "Champions League" },
        { ano: "2015/16", clube: "Real Madrid", jogos: 36, gols: 28, assistencias: 8, trofeus: "Champions League" }
    ],
    j_suarez: [
        { ano: "2013/14", clube: "Liverpool", jogos: 37, gols: 31, assistencias: 17, trofeus: "Chuteira de Ouro, Jogador do Ano PFA" },
        { ano: "2014/15", clube: "Barcelona", jogos: 43, gols: 25, assistencias: 20, trofeus: "Champions League, La Liga, Copa do Rei" },
        { ano: "2015/16", clube: "Barcelona", jogos: 53, gols: 59, assistencias: 24, trofeus: "La Liga, Copa do Rei, Chuteira de Ouro" }
    ]
};

function obterHistoricoRealJogador(j) {
    if(!j) return [];
    return HISTORICO_REAL_JOGADORES[j.id] || HISTORICO_REAL_JOGADORES[normalizarTexto(j.nome)] || [];
}

function renderizarHistoricoRealJogador(j) {
    const hist = obterHistoricoRealJogador(j);
    if(hist.length === 0) return "";
    return `
        <div style="display:grid; gap:12px;">
            ${hist.map(h => `
                <div style="background:rgba(0,0,0,0.38); border:1px solid rgba(255,255,255,0.1); border-left:4px solid var(--gold); border-radius:10px; padding:16px;">
                    <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; flex-wrap:wrap;">
                        <div>
                            <strong style="color:var(--gold); font-size:1.25rem;">${h.ano} - ${h.clube}</strong>
                            <p style="margin:6px 0 0; color:#cbd5e1;">${h.trofeus}</p>
                        </div>
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <span class="meta-pill">${h.jogos} jogos</span>
                            <span class="meta-pill">${h.gols} gols</span>
                            <span class="meta-pill">${h.assistencias} ast</span>
                        </div>
                    </div>
                </div>`).join("")}
        </div>`;
}

function aplicarHistoricoRealJogador(j) {
    const histReal = obterHistoricoRealJogador(j);
    if(!j || histReal.length === 0) return;
    if(j.historicoRealAplicado) return;
    if(!j.historicoCarreira) j.historicoCarreira = [];

    const chavesExistentes = new Set(j.historicoCarreira.map(h => `${h.ano}|${h.clube}`));
    const entradas = histReal
        .filter(h => !chavesExistentes.has(`${h.ano}|${h.clube}`))
        .map(h => ({
            ano: h.ano,
            clube: h.clube,
            jogos: h.jogos,
            gols: h.gols,
            assistencias: h.assistencias,
            trofeus: h.trofeus,
            real: true
        }));
    j.historicoCarreira.push(...entradas);
    j.historicoCarreira.sort((a,b) => String(b.ano).localeCompare(String(a.ano)));
    j.historicoRealAplicado = true;
}

function aplicarHistoricosReaisIniciais() {
    jogadoresIA.forEach(aplicarHistoricoRealJogador);
}

function inicializarEstadoCarreiraJogador() {
    if(!jogador) return;
    if(typeof jogador.moral === "undefined") jogador.moral = 55;
    if(typeof jogador.felicidade === "undefined") jogador.felicidade = 60;
    if(typeof jogador.inteligencia === "undefined") jogador.inteligencia = Math.max(45, Math.min(95, (jogador.geral || 60) + 4));
    // ⚙️ ATRIBUTOS INDIVIDUAIS: mesma migração aplicada aos jogadores de IA
    // (ver normalizarElencosEPosicoes) — se por algum motivo ainda faltar
    // algum destes 8 atributos (save antigo, criação de personagem), gera-os
    // a partir da posição/OVR do próprio jogador.
    if(typeof jogador.finalizacao === "undefined" || typeof jogador.velocidade === "undefined" || typeof jogador.passe === "undefined" ||
       typeof jogador.defesa === "undefined" || typeof jogador.cabeceamento === "undefined" || typeof jogador.drible === "undefined" ||
       typeof jogador.resistencia === "undefined" || typeof jogador.forca === "undefined") {
        const gerados = gerarAtributosParaJogador(jogador.posicao, jogador.geral || 60);
        if(typeof jogador.finalizacao === "undefined") jogador.finalizacao = gerados.finalizacao;
        if(typeof jogador.velocidade === "undefined") jogador.velocidade = gerados.velocidade;
        if(typeof jogador.passe === "undefined") jogador.passe = gerados.passe;
        if(typeof jogador.defesa === "undefined") jogador.defesa = gerados.defesa;
        if(typeof jogador.cabeceamento === "undefined") jogador.cabeceamento = gerados.cabeceamento;
        if(typeof jogador.drible === "undefined") jogador.drible = gerados.drible;
        if(typeof jogador.resistencia === "undefined") jogador.resistencia = gerados.resistencia;
        if(typeof jogador.forca === "undefined") jogador.forca = gerados.forca;
        if(typeof jogador.reflexos === "undefined") jogador.reflexos = gerados.reflexos;
        if(typeof jogador.reposicao === "undefined") jogador.reposicao = gerados.reposicao;
        if(typeof jogador.jogoAereo === "undefined") jogador.jogoAereo = gerados.jogoAereo;
    }
    // 🧤 Migração incremental para quem já tinha os 8 atributos base mas ainda
    // não tinha os 3 exclusivos de guarda-redes.
    if(typeof jogador.reflexos === "undefined") {
        const gerados = gerarAtributosParaJogador(jogador.posicao, jogador.geral || 60);
        jogador.reflexos = gerados.reflexos;
        jogador.reposicao = gerados.reposicao;
        jogador.jogoAereo = gerados.jogoAereo;
    }
    if(typeof jogador.titularidade === "undefined") jogador.titularidade = 48;
    if(typeof jogador.lesaoRodadas === "undefined") jogador.lesaoRodadas = 0;
    if(typeof jogador.entrevistasRespondidas === "undefined") jogador.entrevistasRespondidas = 0;
    if(!Array.isArray(jogador.formaResultados)) jogador.formaResultados = [];
    if(typeof jogador.jogosNoClubeAtual === "undefined") jogador.jogosNoClubeAtual = 0;
    if(typeof jogador.tecnicoConhecido === "undefined") jogador.tecnicoConhecido = null;
    if(typeof jogador.statusEscalacaoAnterior === "undefined") jogador.statusEscalacaoAnterior = null;
    if(typeof jogador.clubesRejeitados === "undefined") jogador.clubesRejeitados = [];
    if(!jogador.estatisticasAtuais.penaltisMarcados) jogador.estatisticasAtuais.penaltisMarcados = 0;
    
    // Relationship systems
    if(typeof jogador.relacaoTecnico === "undefined") jogador.relacaoTecnico = 50; // 0-100
    if(typeof jogador.relacaoTorcida === "undefined") jogador.relacaoTorcida = 50; // 0-100
    if(typeof jogador.funcaoNoElenco === "undefined") jogador.funcaoNoElenco = "promessa"; // promessa, rodizio, importante, banco, lenda, capitao
    if(typeof jogador.naListaTransferencias === "undefined") jogador.naListaTransferencias = false;
    if(typeof jogador.naListaEmprestimo === "undefined") jogador.naListaEmprestimo = false;
    if(typeof jogador.pressaoTorcida === "undefined") jogador.pressaoTorcida = 0; // 0-100, fan pressure on coach
    if(!jogador.estatisticasAtuais.penaltisDefendidos) jogador.estatisticasAtuais.penaltisDefendidos = 0;
    if(typeof jogador.eCapitao === "undefined") jogador.eCapitao = false;
    if(!jogador.statsSelecao) jogador.statsSelecao = { jogos:0, gols:0, assistencias:0, convocacoes:0 };
    if(!jogador.melhorAtuacao) jogador.melhorAtuacao = { gols:0, assistencias:0, nota:0, adversario:"", rodada:0 };
    if(!jogador.listaDesejos) jogador.listaDesejos = [];
    if(!jogador.objetivosCarreira) jogador.objetivosCarreira = [];
    if(!jogador.clubeAlvoId) jogador.clubeAlvoId = null;
    if(typeof jogador.salarioSemanal === "undefined") jogador.salarioSemanal = null;
    if(typeof jogador.bonusGol === "undefined") jogador.bonusGol = 0;
    if(typeof jogador.bonusVitoria === "undefined") jogador.bonusVitoria = 0;
    if(typeof jogador.direitosImagem === "undefined") jogador.direitosImagem = 5;
    // Migração defensiva para saves antigos: garante que novos campos do
    // sistema de lifestyle/treino/negociação sempre existem.
    if(jogador.lifestyle) {
        const t = jogador.lifestyle.upgrades?.training;
        if(t) { 
            if(typeof t.pace === "undefined") t.pace = 0; 
            if(typeof t.strength === "undefined") t.strength = 0; 
            if(typeof t.vision === "undefined") t.vision = 0;
            if(typeof t.ballControl === "undefined") t.ballControl = 0;
            if(typeof t.agility === "undefined") t.agility = 0;
            if(typeof t.composure === "undefined") t.composure = 0;
            if(typeof t.positioning === "undefined") t.positioning = 0;
            if(typeof t.leadership === "undefined") t.leadership = 0;
            if(typeof t.workRate === "undefined") t.workRate = 0;
            if(typeof t.interceptions === "undefined") t.interceptions = 0;
            if(typeof t.longShots === "undefined") t.longShots = 0;
            if(typeof t.acceleration === "undefined") t.acceleration = 0;
            // 🧤 FIX: os 3 treinos novos de guarda-redes (reflexos/reposição/jogo
            // aéreo) precisam existir aqui como contador — sem isto,
            // upgradeTrainingSkill() faria "undefined++" (vira NaN) na primeira
            // vez que o jogador tentasse treiná-los.
            if(typeof t.reflexes === "undefined") t.reflexes = 0;
            if(typeof t.distribution === "undefined") t.distribution = 0;
            if(typeof t.aerialCommand === "undefined") t.aerialCommand = 0;
        }
        const l = jogador.lifestyle.upgrades?.lifestyle;
        if(l) { if(typeof l.personalChef === "undefined") l.personalChef = false; if(typeof l.mediaTraining === "undefined") l.mediaTraining = false; if(typeof l.eliteAgent === "undefined") l.eliteAgent = false; }
        if(jogador.lifestyle.multipliers && typeof jogador.lifestyle.multipliers.negotiationMultiplier === "undefined") jogador.lifestyle.multipliers.negotiationMultiplier = 0;
    }
}

function gerarObjetivosParaClube(clubeId) {
    const c = clubes.find(x => x.id === clubeId);
    if (!c) return [];
    const rep = c.reputacao || 70;
    const metaGols = Math.max(6, Math.floor(rep / 10));
    const metaOvr = Math.min(99, Math.max(jogador.geral, rep - 2));
    const metaJogos = rep >= 82 ? 18 : 12;
    return [
        { id: "gols", desc: `Marcar ${metaGols} gols na temporada`, meta: metaGols, atual: jogador.estatisticasAtuais?.gols || 0, concluido: false },
        { id: "ovr", desc: `Atingir OVR ${metaOvr}`, meta: metaOvr, atual: jogador.geral, concluido: false },
        { id: "jogos", desc: `Disputar ${metaJogos} jogos oficiais`, meta: metaJogos, atual: jogador.estatisticasAtuais?.jogos || 0, concluido: false },
        { id: "titular", desc: "Ser titular (≥68 titularidade)", meta: 68, atual: jogador.titularidade || 0, concluido: false }
    ];
}

function atualizarProgressoObjetivos() {
    if (!jogador?.objetivosCarreira?.length) return;
    jogador.objetivosCarreira.forEach(o => {
        if (o.id === "gols") o.atual = jogador.estatisticasAtuais?.gols || 0;
        if (o.id === "jogos") o.atual = jogador.estatisticasAtuais?.jogos || 0;
        if (o.id === "ovr") o.atual = jogador.geral;
        if (o.id === "titular") o.atual = jogador.titularidade || 0;
        o.concluido = o.atual >= o.meta;
    });
}

function objetivosTransferenciaCumpridos() {
    atualizarProgressoObjetivos();
    return jogador.objetivosCarreira?.length > 0 && jogador.objetivosCarreira.every(o => o.concluido);
}

window.adicionarClubeDesejos = function(clubeId) {
    inicializarEstadoCarreiraJogador();
    if (jogador.listaDesejos.length >= 5) { mostrarToast("Lista de desejos", "Máximo de 5 clubes na lista.", "warning"); return; }
    if (jogador.listaDesejos.includes(clubeId) || clubeId === jogador.clubeId) return;
    jogador.listaDesejos.push(clubeId);
    mostrarToast("Lista de desejos", `${clubes.find(c=>c.id===clubeId)?.nome} adicionado!`, "success");
    renderizarMercado();
};

window.removerClubeDesejos = function(clubeId) {
    jogador.listaDesejos = (jogador.listaDesejos || []).filter(id => id !== clubeId);
    if (jogador.clubeAlvoId === clubeId) { jogador.clubeAlvoId = null; jogador.objetivosCarreira = []; }
    renderizarMercado();
};

window.definirClubeAlvo = function(clubeId) {
    inicializarEstadoCarreiraJogador();
    jogador.clubeAlvoId = clubeId;
    jogador.objetivosCarreira = gerarObjetivosParaClube(clubeId);
    const nome = clubes.find(c => c.id === clubeId)?.nome;
    registrarNoticia("Objetivo de carreira", `${jogador.nome} definiu o ${nome} como clube dos sonhos. Cumpre os objetivos para pedir transferência.`, "Mercado");
    mostrarToast("Clube alvo", `Objetivos definidos para ir ao ${nome}!`, "info");
    renderizarMercado();
};

window.pedirTransferenciaClube = function(clubeId, tipo) {
    inicializarEstadoCarreiraJogador();
    if (jogador.clubeAlvoId !== clubeId) { mostrarToast("Objetivos", "Define este clube como alvo e cumpre os objetivos primeiro.", "warning"); return; }
    if (!objetivosTransferenciaCumpridos()) { mostrarToast("Objetivos pendentes", "Ainda faltam metas para liberar o pedido.", "warning"); renderizarMercado(); return; }
    const c = clubes.find(x => x.id === clubeId);
    if (!c) return;
    const valor = calcularValorMercadoJogador(jogador);
    const encaixe = Math.abs(c.reputacao - jogador.geral) <= 8;
    if (!encaixe && c.reputacao > jogador.geral + 10) {
        mostrarToast("Recusado", `${c.nome} acha que ainda precisas evoluir mais (OVR ${jogador.geral} vs clube ${c.reputacao}).`, "warning");
        return;
    }
    propostasPendentes.push({
        id: c.id, nome: c.nome, reputacao: c.reputacao,
        valor: tipo === "emprestimo" ? Math.floor(valor * 0.08) : valor,
        tipo, janela: "Pedido do jogador"
    });
    registrarNoticia(tipo === "emprestimo" ? "Pedido de empréstimo" : "Pedido de transferência", `${jogador.nome} solicitou ${tipo === "emprestimo" ? "empréstimo" : "transferência"} para o ${c.nome} após cumprir os objetivos.`, "Mercado");
    mostrarToast("Pedido enviado", `${c.nome} analisará tua proposta na aba de propostas!`, "success");
    renderizarMercado();
};

function registrarMelhorAtuacao(gols, assistencias, adversario) {
    if(!jogador) return false;
    inicializarEstadoCarreiraJogador();
    const nota = 5.5 + (gols * 1.4) + (assistencias * 0.9) + ((jogador.geral || 60) - 60) * 0.04;
    const atual = jogador.melhorAtuacao?.nota || 0;
    if(nota > atual) {
        jogador.melhorAtuacao = { gols, assistencias, nota: Math.round(nota * 10) / 10, adversario: adversario || "Rival", rodada: rodadaAtual };
        return atual > 0; // só é "recorde" se já existia uma marca anterior para bater
    }
    return false;
}

function statusTitularidade() {
    inicializarEstadoCarreiraJogador();
    if(jogador.lesaoRodadas > 0) return `Lesionado (${jogador.lesaoRodadas} sem.)`;
    if(jogador.titularidade >= 68) return "Titular";
    if(jogador.titularidade >= 42) return "Disputando vaga";
    return "Banco";
}

function ajustarTitularidade(delta) {
    inicializarEstadoCarreiraJogador();
    jogador.titularidade = Math.max(0, Math.min(100, jogador.titularidade + delta));
}

// ==========================================
// 🧠 CONTEXTO DE JOGO (clássicos, fase, jogos grandes) E ESCALAÇÃO INTELIGENTE
// ==========================================

// Encontra o principal rival de um clube (maior reputação na mesma liga).
function obterRivalClube(clubeId) {
    const c = clubes.find(x => x.id === clubeId);
    if (!c || !c.ligaId) return null;
    return clubes.filter(x => x.ligaId === c.ligaId && x.id !== c.id).sort((a, b) => b.reputacao - a.reputacao)[0] || null;
}

// Regista o resultado da partida na sequência recente do jogador (para detetar boa/má fase).
function registrarFormaResultado(resultado) {
    inicializarEstadoCarreiraJogador();
    jogador.formaResultados.push(resultado);
    if (jogador.formaResultados.length > 5) jogador.formaResultados.shift();
}

function avaliarFormaAtual() {
    const seq = jogador.formaResultados || [];
    const ultimos3 = seq.slice(-3);
    const vitorias = ultimos3.filter(r => r === "V").length;
    const derrotas = ultimos3.filter(r => r === "D").length;
    if (ultimos3.length >= 3 && vitorias >= 2 && derrotas === 0) return "boa";
    if (ultimos3.length >= 3 && derrotas >= 2) return "ma";
    return "neutra";
}

// Analisa o confronto e devolve o contexto usado para escolher e ponderar as entrevistas.
function avaliarContextoJogo(comp, advObj, isSel) {
    const clube = isSel ? null : clubes.find(c => c.id === jogador.clubeId);
    const rival = isSel ? null : obterRivalClube(jogador.clubeId);
    const isClassico = !isSel && rival && advObj && rival.id === advObj.id;
    const repAdversario = advObj?.reputacao || 70;
    const isFinalOuMataMata = !!(comp.isFinal || comp.isMataMata);
    const compGrandeSelecao = isSel && ["copa_mundo", "euro", "copa_america", "olimpiadas"].some(id => (comp.compConfigId || "").includes(id));
    const jogoGrande = isFinalOuMataMata || isClassico || repAdversario >= 84 || compGrandeSelecao;

    const forma = avaliarFormaAtual();
    const novoTecnico = !isSel && clube && jogador.tecnicoConhecido && clube.tecnico && clube.tecnico !== jogador.tecnicoConhecido;
    const transferenciaRecente = !isSel && (jogador.jogosNoClubeAtual || 0) <= 2;

    return {
        clube, rival, isClassico, jogoGrande, isFinalOuMataMata, forma, novoTecnico, transferenciaRecente,
        nomeAdversario: advObj?.nome || "o adversário", nomeClube: clube?.nome || "", nomeTecnico: clube?.tecnico || "o treinador"
    };
}

// Decide, antes do jogo, se o jogador começa titular, entra do banco (e em que minuto) ou fica fora dos planos.
// Reflete a "inteligência" da comissão técnica: um jogador precisa de titularidade para começar,
// e mesmo estando no banco pode nem entrar se a titularidade for muito baixa.
function decidirEscalacaoJogador() {
    inicializarEstadoCarreiraJogador();
    const t = jogador.titularidade;
    if (t >= 68) return { statusAtual: "titular", minutoEntrada: null, entra: true };
    if (t >= 35) {
        // Disputando vaga: entra do banco na maioria dos jogos, com o minuto de entrada a variar conforme a titularidade.
        const baseMin = Math.round(82 - (t - 35) * 0.55); // quanto maior a titularidade, mais cedo entra
        const minutoEntrada = Math.max(55, Math.min(85, baseMin + Math.floor(Math.random() * 10) - 5));
        return { statusAtual: "banco", minutoEntrada, entra: true };
    }
    // Titularidade muito baixa: o treinador pode simplesmente não contar com o jogador nesta partida.
    const entra = Math.random() < 0.32;
    return { statusAtual: entra ? "banco" : "fora", minutoEntrada: entra ? Math.max(70, 90 - Math.floor(Math.random() * 15)) : null, entra };
}

// Mostra (só quando algo muda) uma conversa rápida com o técnico sobre a escalação, depois chama onFechar().
function conversarComTecnico(escalacao, contexto, onFechar) {
    const statusAnterior = jogador.statusEscalacaoAnterior;
    jogador.statusEscalacaoAnterior = escalacao.statusAtual;
    if (statusAnterior === escalacao.statusAtual || document.getElementById("modalConversaTecnico")) {
        onFechar();
        return;
    }
    if (statusAnterior === null) { onFechar(); return; } // primeiro jogo: não interrompe com aviso

    const nomeTecnico = contexto.nomeTecnico || "O treinador";
    let tag = "", frase = "";
    if (escalacao.statusAtual === "titular") {
        tag = "titular";
        const opcoes = [
            `"Você ganhou a posição no treino. Vai começar hoje entre os titulares."`,
            `"Chegou a sua vez. Confio em você desde o apito inicial."`,
            `"Você mostrou nível suficiente. Hoje começa jogando."`
        ];
        frase = opcoes[Math.floor(Math.random() * opcoes.length)];
    } else if (escalacao.statusAtual === "banco") {
        tag = "banco";
        const opcoes = statusAnterior === "titular" ? [
            `"Vou fazer uma rotação hoje. Você começa no banco, mas pode entrar."`,
            `"Preciso gerir o desgaste do grupo. Hoje começas de fora, mas fica atento."`,
            `"Não é castigo, é gestão de plantel. Começas no banco."`
        ] : [
            `"Continue a treinar assim. Hoje começas no banco, mas com chances reais de entrar."`,
            `"Estás mais perto. Começas no banco, mas de olho em te dar minutos."`
        ];
        frase = opcoes[Math.floor(Math.random() * opcoes.length)];
    } else {
        tag = "fora";
        frase = `"Sinceramente, não estás nos meus planos para este jogo. Continua a trabalhar."`;
    }

    const modal = document.createElement("div");
    modal.id = "modalConversaTecnico";
    modal.className = "modal";
    modal.innerHTML = `
        <div class="coach-talk-card">
            <div class="coach-talk-avatar">🧑‍💼</div>
            <span class="coach-talk-tag ${tag}">Conversa com ${nomeTecnico}</span>
            <p class="coach-talk-quote">${frase}</p>
            <button class="coach-talk-btn" id="btnFecharConversaTecnico">Entendido ➔</button>
        </div>`;
    document.body.appendChild(modal);
    document.getElementById("btnFecharConversaTecnico").onclick = () => {
        modal.remove();
        onFechar();
    };
}

// 🛡️ FIX: exposta no window porque é chamada a partir de botões com
// onclick="abrirEntrevista(...)" no HTML (que resolvem no escopo global, não
// no escopo deste módulo) — sem isto, o botão de "Conversa Coletiva" (e
// qualquer outro onclick que a chame diretamente) não fazia absolutamente
// nada ao clicar, sem nenhum erro visível para o jogador.
function abrirEntrevista(tipo, contexto = {}, aoFechar = null) {
    inicializarEstadoCarreiraJogador();
    if(document.getElementById("modalEntrevista")) { if(aoFechar) aoFechar(); return; }
    const nomeTecnicoAtual = contexto.tecnico || clubes.find(c => c.id === jogador.clubeId)?.tecnico || "O treinador";
    const perguntas = {
        pre: [{
            titulo: "Entrevista pré-jogo",
            pergunta: `Hoje é dia de jogo. Como vais encarar ${contexto.adversario || "o adversário"}?`,
            opcoes: [
                { texto: "Respeitamos o rival, mas vamos jogar para vencer.", moral: 4, titularidade: 2, noticia: "Discurso equilibrado antes do jogo" },
                { texto: "Quero decidir. Estes são os jogos que eu gosto.", moral: 7, titularidade: 4, noticia: "Craque chama responsabilidade" },
                { texto: "Prefiro responder dentro de campo.", moral: 2, titularidade: 1, noticia: "Resposta curta mantém foco total" }
            ]
        }, {
            titulo: "Coletiva pré-jogo",
            pergunta: `A imprensa pergunta se vais começar entre os titulares contra ${contexto.adversario || "o rival"}. Qual é a tua resposta?`,
            opcoes: [
                { texto: "Estou pronto para qualquer função que o treinador pedir.", moral: 4, titularidade: 3, noticia: "Resposta profissional antes da partida" },
                { texto: "Treinei para ser titular. Quero mostrar isso no relvado.", moral: 6, titularidade: 5, noticia: "Ambição por titularidade aumenta expectativa" },
                { texto: "O grupo está fechado e isso importa mais que nomes.", moral: 5, titularidade: 2, noticia: "Discurso coletivo fortalece vestiário" }
            ]
        }, {
            titulo: "Conferência tática",
            pergunta: `Falam muito da força de ${contexto.adversario || "do adversário"}. O plano é atacar ou controlar?`,
            opcoes: [
                { texto: "Temos de ser inteligentes: pressionar quando der e sofrer juntos quando precisar.", moral: 5, titularidade: 3, noticia: "Leitura tática recebe elogios" },
                { texto: "A melhor defesa é manter a bola e fazer o rival correr.", moral: 4, titularidade: 4, noticia: "Confiança no plano de posse ganha destaque" },
                { texto: "Jogo grande pede coragem. Vamos para cima.", moral: 7, titularidade: 3, noticia: "Tom agressivo agita a antevisão" }
            ]
        }],
        pre_grande: [{
            titulo: "Antevisão do jogo grande",
            pergunta: `Tudo aponta para um duelo decisivo contra ${contexto.adversario || "o adversário"}. Sentes a pressão?`,
            opcoes: [
                { texto: "Jogos assim são o motivo pelo qual joguei futebol a vida toda.", moral: 8, titularidade: 4, noticia: "Craque assume protagonismo antes do jogo grande" },
                { texto: "É só mais uma partida de três pontos, não vou dramatizar.", moral: 3, titularidade: 2, noticia: "Discurso frio tenta baixar a temperatura" },
                { texto: "Sinto a responsabilidade, mas confio no trabalho da semana.", moral: 5, titularidade: 3, noticia: "Equilíbrio marca antevisão de jogo grande" }
            ]
        }, {
            titulo: "Coletiva de decisão",
            pergunta: `Este confronto contra ${contexto.adversario || "o rival"} pode definir a temporada. Qual é a mensagem para a torcida?`,
            opcoes: [
                { texto: "Vamos entrar para vencer, sem medo do tamanho do jogo.", moral: 7, titularidade: 4, noticia: "Mensagem de confiança antes da decisão" },
                { texto: "Precisamos de foco total, um erro pode custar caro.", moral: 4, titularidade: 3, noticia: "Cautela antes do jogo decisivo" },
                { texto: "A torcida pode confiar, estamos preparados para este momento.", moral: 6, titularidade: 3, noticia: "Jogador tranquiliza os adeptos" }
            ]
        }],
        pre_classico: [{
            titulo: "Antevisão do clássico",
            pergunta: `É semana de clássico contra ${contexto.adversario || "o rival histórico"}. Como se prepara a cabeça para este jogo?`,
            opcoes: [
                { texto: "Clássico é diferente de tudo. Vamos honrar a camisa.", moral: 7, titularidade: 4, noticia: "Discurso emociona a torcida antes do clássico" },
                { texto: "É mais um jogo, três pontos importantes como qualquer outro.", moral: 3, titularidade: 2, noticia: "Postura fria antes do clássico gera debate" },
                { texto: "Sabemos o que este jogo significa para a torcida. Vamos com tudo.", moral: 6, titularidade: 3, noticia: "Jogador reconhece peso histórico do clássico" }
            ]
        }],
        pre_boafase: [{
            titulo: "Coletiva em alta",
            pergunta: `Depois de uma sequência de bons resultados, a expectativa aumentou. Como lidas com isso?`,
            opcoes: [
                { texto: "Estamos confiantes, mas com os pés no chão.", moral: 5, titularidade: 3, noticia: "Confiança equilibrada marca boa fase" },
                { texto: "Quero continuar decidindo. É a minha melhor fase.", moral: 8, titularidade: 5, noticia: "Jogador em alta assume responsabilidade" },
                { texto: "O mérito é do grupo. Estamos entrosados.", moral: 5, titularidade: 2, noticia: "Discurso coletivo valoriza o elenco" }
            ]
        }],
        pre_mafase: [{
            titulo: "Coletiva sob pressão",
            pergunta: `A sequência recente de resultados ruins aumentou a pressão sobre a equipa. Qual é a resposta?`,
            opcoes: [
                { texto: "Sabemos que não estamos bem, mas vamos reagir juntos.", moral: 4, titularidade: 2, noticia: "Discurso de união em momento de crise" },
                { texto: "A culpa é de todos, incluindo minha. Vou dar a volta nisso.", moral: 3, titularidade: 4, noticia: "Autocrítica forte em meio à má fase" },
                { texto: "A pressão externa não deveria existir tanto assim.", moral: 1, titularidade: 1, noticia: "Fala sobre pressão irrita torcida em má fase" }
            ]
        }],
        novotecnico: [{
            titulo: "Chegada do novo treinador",
            pergunta: `Com a chegada de ${contexto.tecnico || "um novo treinador"}, como está a adaptação?`,
            opcoes: [
                { texto: "Estou totalmente à disposição para provar meu valor de novo.", moral: 5, titularidade: 3, noticia: "Jogador se coloca à disposição do novo técnico" },
                { texto: "Cada treinador tem suas ideias, vou me adaptar rápido.", moral: 4, titularidade: 2, noticia: "Discurso profissional marca chegada de treinador" },
                { texto: "Espero manter o espaço que conquistei no time.", moral: 3, titularidade: 1, noticia: "Jogador demonstra receio com nova comissão técnica" }
            ]
        }],
        transferencia: [{
            titulo: "Apresentação no novo clube",
            pergunta: `Bem-vindo ao ${contexto.clube || "novo clube"}! Quais são as suas expectativas para esta nova etapa?`,
            opcoes: [
                { texto: "Vim para ganhar espaço e ajudar a equipa desde já.", moral: 7, titularidade: 3, noticia: "Nova contratação promete impacto imediato" },
                { texto: "Sei que preciso de tempo para me adaptar, mas vou trabalhar duro.", moral: 5, titularidade: 1, noticia: "Reforço pede paciência na adaptação" },
                { texto: "Quero conquistar títulos importantes com esta camisa.", moral: 6, titularidade: 2, noticia: "Ambição alta marca chegada de reforço" }
            ]
        }],
        pos: [{
            titulo: "Entrevista pós-jogo",
            pergunta: `Fim de jogo: ${contexto.placar || "resultado definido"}. O que dizes aos adeptos?`,
            opcoes: [
                { texto: "A equipa vem primeiro. O importante é continuar a evoluir.", moral: 4, titularidade: 3, noticia: "Postura coletiva agrada balneário" },
                { texto: "Fico feliz pelo meu desempenho, trabalhei muito por isto.", moral: 6, titularidade: 4, noticia: "Confiança cresce após atuação" },
                { texto: "Não foi suficiente. Tenho de entregar mais.", moral: 3, titularidade: 5, noticia: "Autocrítica forte chama atenção" }
            ]
        }, {
            titulo: "Zona mista",
            pergunta: `Depois do ${contexto.placar || "resultado"}, perguntam sobre a tua influência no jogo.`,
            opcoes: [
                { texto: "Cada minuto conta. Quero transformar oportunidade em impacto.", moral: 5, titularidade: 4, noticia: "Fala sobre impacto chama atenção da comissão" },
                { texto: "Ainda posso ser mais decisivo. Vou cobrar isso de mim.", moral: 4, titularidade: 5, noticia: "Exigência pessoal marca pós-jogo" },
                { texto: "A torcida empurrou muito. Isso muda uma partida.", moral: 6, titularidade: 2, noticia: "Jogador valoriza ambiente no estádio" }
            ]
        }, {
            titulo: "Coletiva pós-jogo",
            pergunta: `O treinador elogiou a entrega da equipa no ${contexto.placar || "jogo"}. Como respondes?`,
            opcoes: [
                { texto: "O elogio é do grupo todo. Ninguém ganha sozinho.", moral: 5, titularidade: 3, noticia: "Humildade agrada o elenco" },
                { texto: "É bom ouvir isso, mas amanhã começa outra luta.", moral: 4, titularidade: 4, noticia: "Mentalidade competitiva vira manchete" },
                { texto: "Quando tenho confiança, consigo decidir mais jogos.", moral: 7, titularidade: 3, noticia: "Confiança pública aumenta expectativa" }
            ]
        }],
        pos_vitoria_grande: [{
            titulo: "Coletiva da vitória histórica",
            pergunta: `Vitória por ${contexto.placar || "um grande placar"} num jogo enorme! O que significa este resultado?`,
            opcoes: [
                { texto: "É um resultado para entrar na história do clube.", moral: 8, titularidade: 4, noticia: "Vitória em jogo grande vira manchete histórica" },
                { texto: "Ganhamos um jogo, agora é pensar no próximo.", moral: 4, titularidade: 3, noticia: "Discurso comedido após vitória importante" },
                { texto: "Mostramos que podemos brigar com qualquer adversário.", moral: 6, titularidade: 3, noticia: "Confiança cresce após triunfo em jogo grande" }
            ]
        }],
        pos_derrota_vexame: [{
            titulo: "Coletiva do vexame",
            pergunta: `Derrota dolorosa por ${contexto.placar || "um placar constrangedor"}. Como explicar o que aconteceu?`,
            opcoes: [
                { texto: "Não existe desculpa. Foi um dos piores dias da nossa carreira.", moral: -6, titularidade: 2, noticia: "Autocrítica dura após vexame" },
                { texto: "Precisamos analisar com calma e corrigir os erros.", moral: -3, titularidade: 1, noticia: "Discurso ponderado tenta conter crise após goleada" },
                { texto: "A responsabilidade é de todos, sem exceção.", moral: -4, titularidade: 3, noticia: "Jogador assume parte da culpa pelo vexame" }
            ]
        }],
        pos_classico: [{
            titulo: "Coletiva do clássico",
            pergunta: `Fim do clássico contra ${contexto.adversario || "o rival"}: ${contexto.placar || "resultado definido"}. O que representa este resultado?`,
            opcoes: [
                { texto: "Vencer um clássico não tem preço para a torcida.", moral: 7, titularidade: 4, noticia: "Vitória em clássico eleva moral do elenco" },
                { texto: "Clássico é sempre especial, ganhando ou perdendo aprendemos algo.", moral: 3, titularidade: 2, noticia: "Discurso maduro após o clássico" },
                { texto: "Vamos digerir este resultado e focar no próximo desafio.", moral: 2, titularidade: 2, noticia: "Foco no futuro após o clássico" }
            ]
        }],
        pos_recorde: [{
            titulo: "Coletiva da marca pessoal",
            pergunta: `Nova melhor atuação da carreira! O que representa esse recorde pessoal?`,
            opcoes: [
                { texto: "Estou trabalhando cada dia para chegar mais longe.", moral: 8, titularidade: 4, noticia: "Novo recorde pessoal repercute na imprensa" },
                { texto: "Números são consequência do trabalho coletivo.", moral: 5, titularidade: 3, noticia: "Humildade marca resposta após nova marca pessoal" },
                { texto: "Quero continuar quebrando as minhas próprias marcas.", moral: 7, titularidade: 4, noticia: "Ambição de superação chama atenção da mídia" }
            ]
        }],
        lesao: [{
            titulo: "Coletiva médica",
            pergunta: "A imprensa pergunta sobre a tua recuperação. Qual é o tom?",
            opcoes: [
                { texto: "Vou respeitar os médicos e voltar mais forte.", moral: 4, titularidade: 0, noticia: "Mensagem madura após lesão" },
                { texto: "Quero voltar o quanto antes, não sei ficar parado.", moral: 6, titularidade: -1, noticia: "Ansiedade por retorno movimenta coletiva" },
                { texto: "É frustrante, mas faz parte da carreira.", moral: 2, titularidade: 0, noticia: "Frustração controlada no departamento médico" }
            ]
        }],
        selecao: [{
            titulo: "Coletiva da seleção",
            pergunta: `Foste chamado pela Seleção ${contexto.selecao || ""} para ${contexto.competicao || "a Data FIFA"}. O que significa esta convocação?`,
            opcoes: [
                { texto: "É uma honra enorme, mas sei que preciso provar todos os dias.", moral: 6, titularidade: 2, noticia: "Resposta madura na seleção" },
                { texto: "Quero ser protagonista também com esta camisa.", moral: 8, titularidade: 3, noticia: "Ambição internacional vira manchete" },
                { texto: "A convocação é do grupo. Vou ajudar onde o treinador precisar.", moral: 5, titularidade: 2, noticia: "Discurso coletivo agrada comissão da seleção" }
            ]
        }, {
            titulo: "Perguntas internacionais",
            pergunta: `A imprensa pergunta se a pressão da Seleção ${contexto.selecao || ""} é maior que a do clube.`,
            opcoes: [
                { texto: "A pressão é privilégio. Eu queria estar neste palco.", moral: 7, titularidade: 2, noticia: "Frase forte marca coletiva internacional" },
                { texto: "O segredo é manter a mesma rotina e não mudar quem eu sou.", moral: 5, titularidade: 3, noticia: "Equilíbrio chama atenção na seleção" },
                { texto: "Vou deixar a resposta para o campo.", moral: 4, titularidade: 1, noticia: "Foco total antes dos jogos internacionais" }
            ]
        }],
        final: [{
            titulo: "Coletiva de Grande Final",
            pergunta: `A final de ${contexto.competicao || "título"} está chegando. Como encaras este momento decisivo?`,
            opcoes: [
                { texto: "Finais são para serem ganhas. Vamos dar tudo.", moral: 10, titularidade: 5, noticia: "Determinação total antes da final" },
                { texto: "É o jogo da vida. Não posso errar.", moral: 5, titularidade: 3, noticia: "Pressão evidente na coletiva de final" },
                { texto: "Vou aproveitar cada segundo em campo.", moral: 8, titularidade: 4, noticia: "Foco no momento presente antes da decisão" }
            ]
        }, {
            titulo: "Expectativa da Final",
            pergunta: `Milhões de adeptos vão assistir. Qual é a mensagem para quem acredita em ti?`,
            opcoes: [
                { texto: "Vamos trazer o título para casa. Prometo.", moral: 12, titularidade: 6, noticia: "Promessa de título agita a torcida antes da final" },
                { texto: "O apoio de vocês é nossa força extra.", moral: 9, titularidade: 4, noticia: "Jogador valoriza apoio da torcida antes da decisão" },
                { texto: "Vamos fazer história juntos.", moral: 10, titularidade: 5, noticia: "Discurso de união marca antevisão de final" }
            ]
        }],
        final_vitoria: [{
            titulo: "Coletiva Pós-Título",
            pergunta: `CAMPEÃO! Como descreves este momento histórico?`,
            opcoes: [
                { texto: "É um sonho realizado. Dedico este título a todos.", moral: 15, titularidade: 8, noticia: "Emoção marca coletiva pós-título" },
                { texto: "Trabalhamos muito por isto. Merecemos.", moral: 12, titularidade: 6, noticia: "Jogador celebra conquista com orgulho" },
                { texto: "Isto é só o começo. Queremos mais.", moral: 10, titularidade: 7, noticia: "Ambição cresce após conquistar título" }
            ]
        }],
        final_derrota: [{
            titulo: "Coletiva Pós-Frustração",
            pergunta: `A final não saiu como planejado. O que dizes aos adeptos?`,
            opcoes: [
                { texto: "Peço desculpas. Vamos voltar mais fortes.", moral: 3, titularidade: 2, noticia: "Humildade marca derrota na final" },
                { texto: "Dói muito, mas vamos reagir.", moral: 5, titularidade: 3, noticia: "Resiliência após derrota na decisão" },
                { texto: "Não foi o nosso dia, mas a cabeça erguida.", moral: 4, titularidade: 2, noticia: "Dignidade na derrota chama atenção" }
            ]
        }],
        // 🗣️ Conversa coletiva com o grupo/técnico — acessível a qualquer
        // momento pelo botão "Falar com o Técnico" (não depende de haver jogo).
        coletiva_time: [{
            titulo: "Reunião coletiva com o elenco",
            pergunta: `${nomeTecnicoAtual} reúne o grupo antes do treino: "Preciso que este grupo puxe uns pelos outros. Alguém quer dizer alguma coisa?"`,
            opcoes: [
                { texto: "Levanto a voz e cobro mais entrega do grupo.", moral: 6, titularidade: 3, noticia: "Discurso de liderança agita o vestiário" },
                { texto: "Prefiro liderar pelo exemplo, sem grandes discursos.", moral: 3, titularidade: 1, noticia: "Atitude discreta é elogiada nos bastidores" },
                { texto: "Fico de fora. Não é a minha praia falar em público.", moral: -1, titularidade: -1, noticia: "Ausência em momento de união do grupo chama atenção" }
            ]
        }, {
            titulo: "Balanço com o técnico",
            pergunta: `${nomeTecnicoAtual} chama-te à parte: "Como sentes que está a correr a tua temporada até agora?"`,
            opcoes: [
                { texto: "Sinto que posso dar muito mais. Quero mais responsabilidade.", moral: 5, titularidade: 4, noticia: "Jogador pede mais protagonismo em conversa reservada" },
                { texto: "Estou satisfeito com a minha evolução, mas focado no grupo.", moral: 4, titularidade: 2, noticia: "Equilíbrio marca conversa com o técnico" },
                { texto: "Sinceramente, esperava estar a jogar mais.", moral: 2, titularidade: 3, noticia: "Jogador expressa insatisfação em conversa privada" }
            ]
        }]
    };
    const lista = perguntas[tipo] || perguntas.pre;
    const cfg = lista[Math.floor(Math.random() * lista.length)];
    const grandeBadge = contexto.jogoGrande ? `<span class="interview-tag-grande">Jogo Grande</span>` : "";
    const modal = document.createElement("div");
    modal.id = "modalEntrevista";
    modal.className = "modal";
    modal.innerHTML = `
        <div class="interview-card slide-in">
            <div style="display:flex; justify-content:space-between; gap:14px; align-items:flex-start;">
                <div>
                    <span style="color:var(--theme-primary); font-weight:900; text-transform:uppercase;">${cfg.titulo}</span>${grandeBadge}
                    <h2 style="margin:8px 0 10px;">${cfg.pergunta}</h2>
                    <p style="margin:0 0 14px; color:#aaa;">A resposta mexe com moral, imprensa e luta pela titularidade.</p>
                </div>
                <button class="close-btn" onclick="window.fecharEntrevista()">×</button>
            </div>
            ${cfg.opcoes.map((op, i) => `<button class="interview-option" onclick="responderEntrevista('${tipo}', ${i})">${op.texto}</button>`).join("")}
        </div>`;
    modal.dataset.tipo = tipo;
    modal._opcoes = cfg.opcoes;
    modal._aoFechar = aoFechar;
    modal._fechado = false;
    document.body.appendChild(modal);
}

// Fecha a entrevista sem responder (botão ×) e ainda assim avança o fluxo (ex.: início da partida).
window.fecharEntrevista = function() {
    const modal = document.getElementById("modalEntrevista");
    if(!modal) return;
    const cb = modal._aoFechar; modal._fechado = true;
    modal.remove();
    if(cb) cb();
};

// 🛡️ FIX: expõe abrirEntrevista no window (ver nota acima da função) —
// necessário para botões com onclick="abrirEntrevista(...)" no HTML.
window.abrirEntrevista = abrirEntrevista;

window.responderEntrevista = function(tipo, idx) {
    const modal = document.getElementById("modalEntrevista");
    const op = modal?._opcoes?.[idx];
    const cb = modal?._aoFechar;
    if(!op) { if(!modal?._fechado) cb?.(); modal?.remove(); return; }
    jogador.moral = Math.max(0, Math.min(100, (jogador.moral || 55) + op.moral));
    ajustarTitularidade(op.titularidade);
    jogador.entrevistasRespondidas = (jogador.entrevistasRespondidas || 0) + 1;
    
    // Interview effects on gameplay
    if(!jogador.buffEntrevista) jogador.buffEntrevista = {};
    
    // Apply temporary buffs based on interview type and response
    if(tipo === 'pre' || tipo === 'pre_grande' || tipo === 'pre_classico') {
        // Pre-match interviews boost morale and confidence
        jogador.buffEntrevista.moral = Math.min(100, (jogador.buffEntrevista.moral || 0) + 5);
        jogador.buffEntrevista.confidence = Math.min(100, (jogador.buffEntrevista.confidence || 0) + 3);
    } else if(tipo === 'pos' || tipo === 'pos_vitoria' || tipo === 'pos_derrota') {
        // Post-match interviews affect media perception and fan support
        jogador.buffEntrevista.mediaReputation = Math.min(100, (jogador.buffEntrevista.mediaReputation || 50) + op.moral);
        if(op.moral > 5) {
            // Good responses increase fan base slightly
            if(jogador.lifestyle?.fanBase) {
                jogador.lifestyle.fanBase = Math.min(1000000, jogador.lifestyle.fanBase + Math.floor(Math.random() * 500) + 100);
            }
        }
    } else if(tipo === 'selecao') {
        // National team interviews boost international reputation
        jogador.buffEntrevista.internationalReputation = Math.min(100, (jogador.buffEntrevista.internationalReputation || 0) + 4);
    }
    
    // Buff duration: affects next match
    jogador.buffEntrevista.expiresAfter = (jogador.buffEntrevista.expiresAfter || 0) + 1;
    
    registrarNoticia(op.noticia, `${jogador.nome}: "${op.texto}"`, "Entrevista", { nome: jogador.nome, foto: jogador.foto }, "jogador");
    mostrarToast("Coletiva", op.moral > 5 ? "Resposta positiva repercutiu bem na imprensa!" : "Resposta registrada pela mídia.", op.moral > 5 ? "success" : "info");
    modal._fechado = true;
    modal.remove();
    window.salvarJogo();
    atualizarHub();
    if(cb) cb();
};

function dispararAnimacaoCampeao(nomeTime, nomeCompeticao, logoTimeUrl) {
    const modal = document.createElement("div");
    modal.className = "modal-campeao";
    modal.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,30,0.98)); z-index:10000; display:flex; flex-direction:column; align-items:center; justify-content:center; animation:fadeIn 0.5s ease-out;";
    
    // Enhanced confetti
    for (let i = 0; i < 200; i++) {
        let confete = document.createElement("div");
        confete.className = "confete";
        confete.style.cssText = `
            position: absolute;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${["#ffd700", "#ffffff", "#00ff88", "#ff4444", "#00a2e0", "#ff69b4"][Math.floor(Math.random() * 6)]};
            left: ${Math.random() * 100}vw;
            top: -20px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            animation: cairConfete ${Math.random() * 3 + 2}s linear infinite;
            opacity: ${Math.random() * 0.5 + 0.5};
        `;
        modal.appendChild(confete);
    }
    
}

// ==========================================
// 🔎 PESQUISA E PERFIS
// ==========================================
document.getElementById("inputPesquisa")?.addEventListener("input", (e) => {
    let q = normalizarTexto(e.target.value);
    let resBox = document.getElementById("resultadoPesquisa");
    let modalP = document.getElementById("modalPesquisa");
    if(q.length < 3) { if(resBox) resBox.innerHTML = "<p style='text-align:center; color:#aaa; font-size:1.2rem; margin-top:40px;'>Digite pelo menos 3 letras para pesquisar...</p>"; return; }
    
    let resJ = jogadoresIA.filter(j => normalizarTexto(j.nome).includes(q));
    let resC = clubes.filter(c => normalizarTexto(c.nome).includes(q));
    let resS = SELECOES.filter(s => normalizarTexto(s.nome).includes(q) || normalizarTexto(s.pais).includes(q));
    let html = "";
    resS.forEach(s => {
        const titulos = selecoesEstado.campeoes?.[s.id]?.length || 0;
        html += `<div style="background:rgba(0,0,0,0.5); padding:15px; border-radius:8px; border:1px solid var(--border); margin-bottom:10px; cursor:pointer; display:flex; align-items:center;" onclick="abrirPerfilSelecao('${s.id}')"><img src="${s.logo}" style="width:60px; height:42px; margin-right:20px; object-fit:cover; border-radius:6px;"><div><h4 style="margin:0; font-size:1.3rem; color:var(--warning);">Seleção ${s.nome}</h4><p style="margin:0; font-size:0.95rem; color:#aaa;">${s.conf} • Força ${Math.round(calcularForcaSelecao(s.id))} • ${titulos} título(s)</p></div></div>`;
    });
    resC.forEach(c => html += `<div style="background:rgba(0,0,0,0.5); padding:15px; border-radius:8px; border:1px solid var(--border); margin-bottom:10px; cursor:pointer; display:flex; align-items:center;" onclick="abrirPerfilClube('${c.id}')"><img src="${obterUrlImagem(c, 'clube')}" style="border-radius:8px; width:60px; height:60px; margin-right:20px; object-fit: contain;"><div><h4 style="margin:0; font-size:1.3rem; color:var(--success);">${c.nome}</h4><p style="margin:0; font-size:0.95rem; color:#aaa;">OVR: ${c.reputacao} | Orçamento: ${formatarMoeda(c.orcamento||0)}</p></div></div>`);
    resJ.forEach(j => html += `<div style="background:rgba(0,0,0,0.5); padding:15px; border-radius:8px; border:1px solid var(--border); margin-bottom:10px; cursor:pointer; display:flex; align-items:center;" onclick="abrirPerfilJogador('${j.id}')"><img src="${obterUrlImagem(j, 'jogador')}" style="width:60px; height:60px; margin-right:20px; border-radius:50%; filter: ${j.aposentado ? 'grayscale(100%)' : 'none'}; object-fit: cover;"><div><h4 style="margin:0; font-size:1.3rem; color:var(--theme-primary);">${j.nome} ${j.aposentado ? '<span class="aposentado-tag">APOSENTADO</span>' : ''}</h4><p style="margin:5px 0 0; font-size:0.95rem; color:#ccc;">OVR: <strong style="color:#fff;">${j.geral}</strong> | ${j.posicao || 'Base'}</p></div></div>`);
    
    if(resBox) resBox.innerHTML = html || "<p style='text-align:center; font-size:1.2rem; color:#aaa;'>Nenhum resultado.</p>"; 
    if(modalP) modalP.classList.remove("oculto");
});
document.getElementById("btnFecharPesquisa")?.addEventListener("click", () => { let m = document.getElementById("modalPesquisa"); if(m) m.classList.add("oculto"); });
document.getElementById("btnFecharPerfil")?.addEventListener("click", () => { let m = document.getElementById("modalPerfilJogador"); if(m) m.classList.add("oculto"); });

window.abrirPerfilJogador = function(id) {
    let j = id === "player" ? jogador : jogadoresIA.find(x => x.id === id); if(!j) return;
    let cAtual = clubes.find(c => c.id === j.clubeId); 
    
    // Puxa a bandeira do banco de dados das seleções
    let selecaoInfo = obterSelecaoPorNacionalidade(j.nacionalidade);
    let bandeiraHTML = selecaoInfo.logo ? `<img src="${selecaoInfo.logo}" style="width: 26px; height: 18px; border-radius: 3px; object-fit: cover; box-shadow: 0 0 5px rgba(0,0,0,0.6);">` : `🌍`;

    let conteudoHTML = `
        <div style="display: flex; gap: 30px; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #333;">
            <img src="${obterUrlImagem(j, 'jogador')}" class="foto-perfil-gigante" style="${j.aposentado ? 'filter: grayscale(100%);' : ''}">
            <div style="flex-grow:1;">
                <h1 style="margin: 0; font-size: 3rem; text-transform: uppercase; color:var(--theme-primary); line-height: 1.1;">${j.nome} ${j.aposentado ? '<span class="aposentado-tag" style="font-size:1rem;">APOSENTADO</span>' : ''}</h1>
                
                <div style="display: flex; align-items: center; gap: 10px; margin: 8px 0; font-size: 1.1rem; color: #ccc; font-weight: bold; text-transform: uppercase;">
                    ${bandeiraHTML} <span>${j.nacionalidade}</span>
                </div>

                <p class="status-texto-grande" style="color: #fff; font-size: 1.8rem; margin:10px 0;">OVR: <strong style="color:var(--success); font-size:2.2rem;">${j.geral}</strong> | <span class='pos-badge pos-${(j.posicao||'').replace(" ","-")}'>${j.posicao || 'Base'}</span></p>
                <div style="display:flex; gap:30px; margin-top:20px;">
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Idade</span> <strong>${j.idade} Anos</strong></p>
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Clube</span> <strong style="color:var(--success); cursor:pointer; display:flex; align-items:center; gap:8px;" onclick="abrirPerfilClube('${j.clubeId}')"><img src="${cAtual ? obterUrlImagem(cAtual, 'clube') : ''}" style="width:28px; height:28px; object-fit:contain; background:#fff; border-radius:6px; padding:2px;" onerror="this.style.display='none'">${cAtual ? cAtual.nome : (j.aposentado ? 'Lenda' : 'Livre')}</strong></p>
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Contrato</span> <strong>${j.contrato || 0} anos</strong></p>
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Mercado</span> <strong>${j.aposentado ? 'Lenda' : formatarMoeda(calcularValorMercadoJogador(j))}</strong></p>
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Felicidade</span> <strong>${Math.round(j.felicidade || 60)}/100</strong></p>
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Inteligência</span> <strong>${Math.round(j.inteligencia || 60)}/100</strong></p>
                    ${j.id === "player" || id === "player" ? `<p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Elenco</span> <strong style="color:var(--theme-primary);">${statusTitularidade()}</strong></p>` : ""}
                </div>
            </div>
            <button class="close-btn" style="position:absolute; top:20px; right:30px; font-size:2rem; background:none; border:none; color:#fff; cursor:pointer;" onclick="document.getElementById('modalPerfilJogador').classList.add('oculto')">✖</button>
        </div>
    `;
    
    // (O resto da função continua exatamente igual a partir daqui, começando por let st = id === "player"...)

    // ⚙️ ATRIBUTOS INDIVIDUAIS: barras com os 8 atributos do jogador. Cada
    // barra mostra o valor real e é colorida conforme o nível (vermelho fraco
    // → verde/dourado elite), para ficar fácil bater o olho e ver o perfil.
    const corBarraAtributo = (v) => v >= 85 ? "#facc15" : v >= 75 ? "#22c55e" : v >= 60 ? "#3b82f6" : v >= 45 ? "#f97316" : "#ef4444";
    const ATRIBUTOS_LABEL = j.posicao === "Goleiro"
        ? { reflexos: "🧤 Reflexos", jogoAereo: "🙌 Jogo Aéreo", reposicao: "🚀 Reposição", velocidade: "💨 Velocidade", passe: "🎯 Passe (curto)", resistencia: "🔋 Resistência", forca: "💪 Força" }
        : { finalizacao: "⚽ Finalização", velocidade: "💨 Velocidade", passe: "🎯 Passe", defesa: "🛡️ Carrinho", cabeceamento: "🦸 Cabeceamento", drible: "🌀 Drible", resistencia: "🔋 Resistência", forca: "💪 Força" };
    const htmlAtributos = `
        <div style="margin-top:18px; background:rgba(0,0,0,0.32); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:18px;">
            <h3 style="margin:0 0 14px; color:var(--theme-primary);">⚙️ Atributos</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px 20px;">
                ${Object.entries(ATRIBUTOS_LABEL).map(([campo, label]) => {
                    const v = Math.round(j[campo] ?? j.geral ?? 60);
                    const cor = corBarraAtributo(v);
                    return `<div>
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;"><span style="color:#ccc; font-weight:700;">${label}</span><span style="color:${cor}; font-weight:900;">${v}</span></div>
                        <div style="height:8px; background:rgba(255,255,255,0.08); border-radius:4px; overflow:hidden;"><div style="height:100%; width:${v}%; background:${cor}; border-radius:4px;"></div></div>
                    </div>`;
                }).join("")}
            </div>
        </div>`;

    let st = id === "player" ? j.estatisticasAtuais : (j.statsTemporada || {jogos:0, gols:0, assistencias:0});
    let carreiraTotal = obterEstatisticasCarreira(j);
    let compStatsHTML = j.statsCompeticoes ? Object.entries(j.statsCompeticoes).map(([cid, stc]) => {
        const comp = competicoes.find(c=>c.id===cid);
        return `<div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.08);"><strong style="color:var(--theme-primary);">${comp?.nome || cid}</strong><br><span style="color:#ccc;">${stc.jogos}J • ${stc.gols}G • ${stc.assistencias}A</span></div>`;
    }).join("") : "";
    let htmlStats = `
        <div style="display:flex; justify-content:space-around; text-align:center; background:rgba(0,0,0,0.4); padding:30px; border-radius:12px; border:1px solid #333; margin-top:20px;">
            <div><div style="font-size:3rem; color:#fff; font-weight:900; margin-bottom:10px;">${st.jogos || 0}</div><div style="font-size:1.1rem; color:#aaa; text-transform:uppercase; font-weight:bold;">Jogos na Época</div></div>
            <div><div style="font-size:3rem; color:var(--success); font-weight:900; margin-bottom:10px;">${st.gols || 0}</div><div style="font-size:1.1rem; color:#aaa; text-transform:uppercase; font-weight:bold;">Golos</div></div>
            <div><div style="font-size:3rem; color:var(--theme-primary); font-weight:900; margin-bottom:10px;">${st.assistencias || 0}</div><div style="font-size:1.1rem; color:#aaa; text-transform:uppercase; font-weight:bold;">Assistências</div></div>
        </div>
        ${["Zagueiro","Lateral","Goleiro"].includes(j.posicao) ? `
        <div style="display:flex; justify-content:space-around; text-align:center; background:rgba(0,0,0,0.32); padding:22px; border-radius:12px; border:1px solid rgba(168,85,247,0.3); margin-top:14px;">
            ${j.posicao === "Goleiro" ? `
            <div><div style="font-size:2.2rem; color:#a855f7; font-weight:900;">${st.defesas || 0}</div><div style="font-size:0.95rem; color:#aaa; text-transform:uppercase; font-weight:bold;">Defesas</div></div>
            ` : `
            <div><div style="font-size:2.2rem; color:#a855f7; font-weight:900;">${st.desarmes || 0}</div><div style="font-size:0.95rem; color:#aaa; text-transform:uppercase; font-weight:bold;">Desarmes</div></div>
            <div><div style="font-size:2.2rem; color:#a855f7; font-weight:900;">${st.interceptacoes || 0}</div><div style="font-size:0.95rem; color:#aaa; text-transform:uppercase; font-weight:bold;">Interceptações</div></div>
            `}
            <div><div style="font-size:2.2rem; color:var(--gold); font-weight:900;">${st.jogosSemSofrerGol || 0}</div><div style="font-size:0.95rem; color:#aaa; text-transform:uppercase; font-weight:bold;">Jogos sem Sofrer Gol</div></div>
        </div>` : ""}
        <div style="margin-top:18px; background:rgba(0,0,0,0.32); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:18px;">
            <h3 style="margin:0 0 12px; color:var(--gold);">Estatísticas de Carreira</h3>
            <div style="display:flex; gap:12px; flex-wrap:wrap;">
                <span class="meta-pill">${carreiraTotal.jogos} jogos</span><span class="meta-pill">${carreiraTotal.gols} gols</span><span class="meta-pill">${carreiraTotal.assistencias} assistências</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; margin-top:14px;">${compStatsHTML || "<p style='color:#aaa;'>Sem estatísticas por competição ainda.</p>"}</div>
        </div>`;

    let histHTML = (j.historicoCarreira && j.historicoCarreira.length > 0) ? j.historicoCarreira.map(h => `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding:15px 20px; background:rgba(255,255,255,0.02); margin-bottom:5px; border-radius:8px;">
            <span style="color:#aaa; width:90px; font-size:1.2rem; font-weight:bold;">${h.ano}${h.real ? '<br><small style="color:var(--gold); font-size:0.65rem;"></small>' : ''}</span> 
            <span style="flex-grow:1; display:flex; align-items:center; gap:12px; font-size:1.2rem; font-weight:bold;"><img src="${obterUrlImagem(h.clube, 'clube')}" style="width:35px; height:35px; object-fit:contain; border-radius:8px;"> ${h.clube}</span> 
            <span style="font-weight:900; color:var(--success); min-width:150px; text-align:right; font-size:1.2rem;">⚽ ${h.gols} | 👟 ${h.assistencias||0} <span style="color:#aaa; font-size:1rem; font-weight:normal;">(${h.jogos || 0}J)</span></span>
        </div>`).join("") : "<div style='text-align:center; padding:30px; color:#aaa; font-size:1.2rem;'>Nenhum registo histórico.</div>";
    
    let premeadosHTML = agruparTrofeusJogador(j);

    const stSel = j.statsSelecao || { jogos:0, gols:0, assistencias:0, convocacoes:0 };
    const htmlSelecao = `
        <div class="selecao-perfil-hero">
            <img src="${selecaoInfo.logo}" alt="${selecaoInfo.nome}" onerror="this.style.display='none'">
            <div>
                <span style="color:var(--theme-primary); font-weight:900; text-transform:uppercase; font-size:0.8rem;">Carreira internacional</span>
                <h3 style="margin:4px 0 0; font-size:1.6rem;">Seleção ${selecaoInfo.nome || j.nacionalidade}</h3>
                <p style="margin:4px 0 0; color:#aaa;">Números exclusivos pela seleção nacional</p>
            </div>
        </div>
        <div class="selecao-stats-panel">
            <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px;">
                <div class="selecao-stat-card"><strong>${stSel.jogos}</strong><span>Jogos</span></div>
                <div class="selecao-stat-card"><strong style="color:var(--success);">${stSel.gols}</strong><span>Gols</span></div>
                <div class="selecao-stat-card"><strong style="color:var(--theme-primary);">${stSel.assistencias}</strong><span>Assistências</span></div>
                <div class="selecao-stat-card"><strong style="color:var(--gold);">${stSel.convocacoes || 0}</strong><span>Convocações</span></div>
            </div>
            <p style="margin:16px 0 0; color:#cbd5e1; line-height:1.6;">Clube atual: <img src="${cAtual ? obterUrlImagem(cAtual,'clube') : ''}" style="width:22px;height:22px;vertical-align:middle;border-radius:4px;background:#fff;padding:1px;" onerror="this.style.display='none'"> <strong>${cAtual?.nome || 'Livre'}</strong> — estatísticas de seleção são independentes do clube.</p>
            ${(j.titulosSelecao?.length) ? `<div style="margin-top:18px;"><h4 style="color:var(--gold); margin:0 0 10px;">Títulos pela Seleção</h4>${j.titulosSelecao.map(t => `<div class="card-conquista"><img src="${obterUrlImagem(t.trofeu,'trofeu')}" class="trofeu-icon" style="width:44px;height:44px;"><div><strong style="color:var(--gold);">${t.trofeu}</strong><br><span style="color:#aaa;">${t.selecao} • ${t.ano}</span></div></div>`).join("")}</div>` : ""}
        </div>`;

    conteudoHTML += `
        <div style="display:flex; gap:15px; margin-top:10px; border-bottom:2px solid #333; padding-bottom:15px; flex-wrap:wrap;">
            <button id="btn-aba-stats" class="tab-btn-modal" onclick="mudarAbaModal('stats')" style="background:rgba(0, 255, 136, 0.1); color:var(--theme-primary); border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">Estatísticas Atuais</button>
            <button id="btn-aba-atributos" class="tab-btn-modal" onclick="mudarAbaModal('atributos')" style="background:none; color:#aaa; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">⚙️ Atributos</button>
            <button id="btn-aba-selecao" class="tab-btn-modal" onclick="mudarAbaModal('selecao')" style="background:none; color:#aaa; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">🌍 Seleção</button>
            <button id="btn-aba-hist" class="tab-btn-modal" onclick="mudarAbaModal('hist')" style="background:none; color:#aaa; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">Histórico de Épocas</button>
            <button id="btn-aba-premios" class="tab-btn-modal" onclick="mudarAbaModal('premios')" style="background:none; color:#aaa; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">🏆 Sala de Troféus</button>
        </div>
        <div id="aba-stats" class="aba-conteudo" style="margin-top:20px; overflow-y:auto; padding:0 10px;">${htmlStats}</div>
        <div id="aba-atributos" class="aba-conteudo" style="display:none; margin-top:20px; overflow-y:auto; padding:0 10px;">${htmlAtributos}</div>
        <div id="aba-selecao" class="aba-conteudo" style="display:none; margin-top:20px; overflow-y:auto; padding:0 10px;">${htmlSelecao}</div>
        <div id="aba-hist" class="aba-conteudo" style="display:none; margin-top:20px; overflow-y:auto; padding:0 10px;">${histHTML}</div>
        <div id="aba-premios" class="aba-conteudo" style="display:none; margin-top:20px; overflow-y:auto; padding:0 10px;">${premeadosHTML || `<p style="color:#aaa; font-size:1.2rem; text-align:center; padding:30px;">O museu particular está vazio.</p>`}</div>
    `;
    
    let modal = document.getElementById("modalPerfilJogador"); 
    if(modal) { let innerDiv = modal.querySelector(".modal-content") || modal.firstElementChild; innerDiv.innerHTML = conteudoHTML; modal.classList.remove("oculto"); mudarAbaModal('stats'); }
}

window.abrirPerfilClube = function(clubeId) {
    let c = clubes.find(x => x.id === clubeId); if(!c) return;
    let conteudoHTML = `
        <div style="display: flex; gap: 30px; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #333;">
            <img src="${obterUrlImagem(c, 'clube')}" class="foto-perfil-gigante" style="border-radius:16px; object-fit: contain !important;">
            <div style="flex-grow:1;">
                <h1 style="margin: 0; font-size: 3rem; text-transform: uppercase; color:var(--success);">${c.nome}</h1>
                <p class="status-texto-grande" style="color: #fff; font-size: 1.6rem; margin:15px 0;">OVR Plantel: <strong style="color:var(--success); font-size:2rem;">${c.reputacao}</strong></p>
                <div style="display:flex; gap:28px; margin-top:20px; flex-wrap:wrap;">
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Orçamento</span> <strong style="color:var(--gold);">${formatarMoeda(c.orcamento || 0)}</strong></p>
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Técnico</span> <strong>${c.tecnico || "Interino"}</strong></p>
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Tática</span> <strong style="color:var(--theme-primary);">${c.tatica || "Equilibrado"}</strong></p>
                    <p class="status-texto-grande" style="margin:0;"><span style="color:#aaa; font-size:1.1rem; display:block;">Scout</span> <strong>${c.inteligenciaMercado || 60}/100</strong></p>
                </div>
            </div>
            <button class="close-btn" style="position:absolute; top:20px; right:30px; font-size:2rem; background:none; border:none; color:#fff; cursor:pointer;" onclick="document.getElementById('modalPerfilJogador').classList.add('oculto')">✖</button>
        </div>
    `;
    
    let elenco = getElencoClube(c.id); 

    let htmlElenco = elenco.sort((a,b)=>b.geral - a.geral).map(j => `
        <div style="background:rgba(0,0,0,0.4); padding:15px; border-radius:12px; border:2px solid ${j.isMe ? 'var(--theme-primary)' : '#222'}; margin-bottom:12px; cursor:pointer; display:flex; align-items:center; transition:0.2s;" onclick="abrirPerfilJogador('${j.id}')">
            <img src="${obterUrlImagem(j, 'jogador')}" style="width:60px; height:60px; border-radius:50%; margin-right:20px; object-fit:cover; border:3px solid ${j.isMe ? 'var(--theme-primary)' : 'transparent'};">
            <div style="flex-grow:1;">
                <div style="font-weight:900; font-size:1.3rem; color:${j.isMe ? 'var(--theme-primary)' : '#fff'};">${j.nome} ${j.isMe ? '<span style="font-size:0.8rem; background:var(--theme-primary); color:#000; padding:2px 6px; border-radius:4px;">TU</span>' : ''}</div>
                <div style="font-size:1rem; color:#ccc; margin-top:4px;">OVR: <strong style="color:var(--success); font-size:1.2rem;">${j.geral}</strong> | <span class='pos-badge pos-${(j.posicao||'').replace(" ","-")}'>${j.posicao || 'Base'}</span></div>
            </div>
            <div style="text-align:right; padding:10px; background:rgba(255,255,255,0.05); border-radius:8px;">
                <span style="font-size:0.9rem; color:#aaa; text-transform:uppercase;">Contrato</span><br><strong style="color:var(--warning); font-size:1.2rem;">${j.contrato||0} anos</strong>
            </div>
        </div>`).join("");

    let titulosHTML = agruparTrofeusClube(c) || "<div style='text-align:center; padding:30px; font-size:1.2rem; color:#aaa;'>O museu do clube está vazio.</div>";

    conteudoHTML += `
        <div style="display:flex; gap:15px; margin-top:10px; border-bottom:2px solid #333; padding-bottom:15px;">
            <button id="btn-aba-elenco" class="tab-btn-modal" onclick="mudarAbaModal('elenco')" style="background:rgba(0, 255, 136, 0.1); color:var(--theme-primary); border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">👥 Elenco Principal</button>
            <button id="btn-aba-trofeus" class="tab-btn-modal" onclick="mudarAbaModal('trofeus')" style="background:none; color:#aaa; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">🏆 Palmarés Histórico</button>
        </div>
        <div id="aba-elenco" class="aba-conteudo" style="margin-top:20px; overflow-y:auto; padding:0 10px;">${htmlElenco || "<p style='color:#aaa;'>Sem jogadores ativos.</p>"}</div>
        <div id="aba-trofeus" class="aba-conteudo" style="display:none; margin-top:20px; overflow-y:auto; padding:0 10px;">${titulosHTML}</div>
    `;
    let modal = document.getElementById("modalPerfilJogador"); 
    if(modal) { let innerDiv = modal.querySelector(".modal-content") || modal.firstElementChild; innerDiv.innerHTML = conteudoHTML; modal.classList.remove("oculto"); mudarAbaModal('elenco'); }
}

// ==========================================
// 💼 SISTEMA DE TRANSFERÊNCIAS E OVR
// ==========================================
function inicializarOrcamentosEContratos() {
    const tecnicos = ["Ofensivo", "Equilibrado", "Defensivo", "Pressão Alta", "Posse de Bola", "Contra-ataque"];
    clubes.forEach(c => {
        if(!c.orcamento) c.orcamento = Math.pow(c.reputacao || 60, 3) * 150;
        if(!c.tecnico) c.tecnico = `Treinador ${c.nome.split(" ")[0]}`;
        if(!c.tatica) c.tatica = tecnicos[Math.floor(Math.random() * tecnicos.length)];
        if(typeof c.inteligenciaMercado === "undefined") c.inteligenciaMercado = Math.max(45, Math.min(95, (c.reputacao || 60) + Math.floor(Math.random()*16) - 6));
    });
    jogadoresIA.forEach(j => {
        if(typeof j.contrato === 'undefined') j.contrato = Math.floor(Math.random() * 4) + 1;
        if(typeof j.felicidade === 'undefined') j.felicidade = Math.floor(Math.random()*35)+50;
        if(typeof j.inteligencia === 'undefined') j.inteligencia = Math.max(40, Math.min(95, (j.geral || 60) + Math.floor(Math.random()*18) - 8));
        j.valorMercadoNum = calcularValorMercadoJogador(j);
        j.pontosPremio = 0;
    });
    if(typeof jogador.contrato === 'undefined') jogador.contrato = 3;
    jogador.pontosPremio = 0;
}

function atualizarOVRClubes() {
    clubes.forEach(c => {
        if(!c.baseOvr) c.baseOvr = c.reputacao;
        let plantel = getElencoClube(c.id);
        if (plantel.length >= 7) {
            let top11 = plantel.sort((a,b) => b.geral - a.geral).slice(0, 11);
            c.reputacao = Math.floor(top11.reduce((acc, j) => acc + j.geral, 0) / top11.length);
        } else { c.reputacao = c.baseOvr; }
    });
}

// Conta quantos jogadores de uma posição um clube já tem — usado para saber
// se ele realmente "precisa" de mais um daquela posição ou já está com o
// elenco empilhado ali (o que antes não era considerado: um clube podia
// comprar 5 atacantes e zero zagueiro sem problema nenhum).
// 🆕 Cache de contagem por posição/tamanho de elenco, construído uma vez por
// janela de mercado (não a cada candidato) — sem isto, a checagem de
// necessidade posicional escanearia o jogadoresIA inteiro para cada clube
// candidato de cada jogador avaliado, o que fica pesado com muitos clubes.
let _cachePosClube = null;
let _cacheTamanhoClube = null;

function inicializarCachesElencoMercado() {
    _cachePosClube = new Map();
    _cacheTamanhoClube = new Map();
    jogadoresIA.forEach(j => {
        if (j.aposentado) return;
        const chavePos = `${j.clubeId}|${j.posicao}`;
        _cachePosClube.set(chavePos, (_cachePosClube.get(chavePos) || 0) + 1);
        _cacheTamanhoClube.set(j.clubeId, (_cacheTamanhoClube.get(j.clubeId) || 0) + 1);
    });
}

// Mantém o cache em dia sempre que um jogador muda de clube durante a janela
// (empréstimo ou transferência), sem precisar reconstruir tudo de novo.
function moverJogadorCacheMercado(origemId, destinoId, posicao) {
    if (!_cachePosClube) return;
    if (origemId) {
        const chaveOrig = `${origemId}|${posicao}`;
        _cachePosClube.set(chaveOrig, Math.max(0, (_cachePosClube.get(chaveOrig) || 0) - 1));
        _cacheTamanhoClube.set(origemId, Math.max(0, (_cacheTamanhoClube.get(origemId) || 0) - 1));
    }
    if (destinoId) {
        const chaveDest = `${destinoId}|${posicao}`;
        _cachePosClube.set(chaveDest, (_cachePosClube.get(chaveDest) || 0) + 1);
        _cacheTamanhoClube.set(destinoId, (_cacheTamanhoClube.get(destinoId) || 0) + 1);
    }
}

function contarPosicaoNoElenco(clube, posicao) {
    if (_cachePosClube) return _cachePosClube.get(`${clube.id}|${posicao}`) || 0;
    return jogadoresIA.filter(j => j.clubeId === clube.id && !j.aposentado && j.posicao === posicao).length;
}
function tamanhoElencoClube(clubeId) {
    if (_cacheTamanhoClube) return _cacheTamanhoClube.get(clubeId) || 0;
    return jogadoresIA.filter(j => j.clubeId === clubeId && !j.aposentado).length;
}
const PROFUNDIDADE_IDEAL_POSICAO = { "Goleiro": 3, "Zagueiro": 5, "Lateral": 4, "Volante": 4, "Meio-Campista": 4, "Meia Ofensivo": 3, "Ponta": 4, "Atacante": 4 };
const TAMANHO_ELENCO_CONFORTAVEL = 30;

function escolherClubeComprador(j, clubeAtual, modoJanela) {
    const valor = calcularValorMercadoJogador(j);
    const promessa = j.idade <= 22 && j.geral >= 68;
    const elite = j.geral >= 82;
    const paisAtual = clubeAtual?.ligaId?.split('_')[0];
    return clubes
        .filter(c => {
            if(c.id === j.clubeId || c.orcamento < valor * 0.82) return false;
            const alvoMin = c.reputacao >= 82 ? 76 : c.reputacao >= 74 ? 68 : 58;
            const alvoMax = c.reputacao >= 82 ? 99 : c.reputacao + 12;
            if(j.geral < alvoMin || j.geral > alvoMax) return false;
            if(c.reputacao >= 82 && !elite && !promessa && Math.random() < 0.55) return false;
            if(clubeAtual) {
                const paisDestino = c.ligaId?.split('_')[0];
                const europa = ["eng", "esp", "ita", "ger", "fra", "pt", "nl", "tr", "be"].includes(paisAtual);
                const destinoForaEuropa = !["eng", "esp", "ita", "ger", "fra", "pt", "nl", "tr", "be"].includes(paisDestino);
                if(j.geral >= 80 && europa && destinoForaEuropa && j.idade < 32) return false;
            }
            // 🆕 NECESSIDADE POSICIONAL: um clube só compra um reforço numa posição
            // onde já está bem "empilhado" (bem acima do ideal) se o jogador for
            // uma melhora clara sobre o pior titular que já tem ali — senão passa.
            const ideal = PROFUNDIDADE_IDEAL_POSICAO[j.posicao] || 4;
            const jaTem = contarPosicaoNoElenco(c, j.posicao);
            if (jaTem >= ideal + 2) {
                const piorNaPosicao = jogadoresIA.filter(x => x.clubeId === c.id && !x.aposentado && x.posicao === j.posicao).sort((a,b) => a.geral - b.geral)[0];
                if (piorNaPosicao && j.geral <= (piorNaPosicao.geral || 60) + 3) return false;
            }
            // 🆕 TAMANHO DO ELENCO: clubes já "cheios" (30+ jogadores sêniores) só
            // reforçam se for mesmo necessidade posicional real, não qualquer nome.
            const tamanhoElenco = tamanhoElencoClube(c.id);
            if (tamanhoElenco >= TAMANHO_ELENCO_CONFORTAVEL && jaTem >= ideal) return false;
            return true;
        })
        .sort((a,b) => {
            const encaixeA = Math.abs((a.reputacao + (promessa ? 7 : 0)) - j.geral);
            const encaixeB = Math.abs((b.reputacao + (promessa ? 7 : 0)) - j.geral);
            // 🆕 Entre clubes com encaixe parecido, prioriza quem tem mais buraco
            // real naquela posição (necessidade), não só orçamento/inteligência.
            const necessidadeA = Math.max(0, (PROFUNDIDADE_IDEAL_POSICAO[j.posicao] || 4) - contarPosicaoNoElenco(a, j.posicao));
            const necessidadeB = Math.max(0, (PROFUNDIDADE_IDEAL_POSICAO[j.posicao] || 4) - contarPosicaoNoElenco(b, j.posicao));
            return encaixeA - encaixeB || necessidadeB - necessidadeA || (b.inteligenciaMercado || 60) - (a.inteligenciaMercado || 60) || b.orcamento - a.orcamento;
        });
}

function escolherClubeEmprestimo(j) {
    return clubes
        .filter(c => c.id !== j.clubeId && c.reputacao >= j.geral - 12 && c.reputacao <= j.geral + 6)
        .sort((a,b) => Math.abs(a.reputacao - j.geral) - Math.abs(b.reputacao - j.geral));
}

function processarMercadoTransferencias(modoJanela = "principal") {
    propostasPendentes = [];
    inicializarCachesElencoMercado();
    const janela = modoJanela === "meio" ? "Janela de Meio de Ano" : "Janela Principal";
    const focoEmprestimo = modoJanela === "meio";
    if(modoJanela === "principal") jogador.contrato--;

    clubes.forEach(c => {
        const base = Math.pow(c.baseOvr || c.reputacao || 60, 3) * (focoEmprestimo ? 42 : 115);
        c.orcamento = Math.max(c.orcamento || 0, Math.floor(base * (0.75 + Math.random() * 0.65)));
    });

    let valorMeu = calcularValorMercadoJogador(jogador);
    let clubeMeu = clubes.find(c => c.id === jogador.clubeId);
    if(!focoEmprestimo && clubeMeu && jogador.contrato <= 1 && Math.random() < (0.44 + ((jogador.felicidade || 60) / 250) + ((clubeMeu.inteligenciaMercado || 60) / 400))) {
        const anosRenovacao = Math.floor(Math.random() * 3) + 2;
        propostasPendentes.push({ id: clubeMeu.id, nome: clubeMeu.nome, reputacao: clubeMeu.reputacao, valor: 0, tipo: "renovacao", janela, anos: anosRenovacao });
        registrarNoticia("Renovação em pauta", `${clubeMeu.nome} quer renovar com ${jogador.nome} por mais ${anosRenovacao} anos.`, "Mercado");
    }
    let chanceSairPlayer = focoEmprestimo ? (jogador.idade <= 21 ? 0.22 : 0.08) : (jogador.contrato <= 0 ? 1.0 : (jogador.contrato === 1 ? 0.46 : (jogador.contrato >= 2 ? 0.045 : 0.12)));
    if(clubeMeu?.reputacao >= 85 && jogador.geral >= 84 && jogador.contrato >= 2 && (jogador.felicidade || 60) >= 45) chanceSairPlayer *= 0.06;
    if(clubeMeu?.reputacao >= 88 && jogador.geral >= 86 && jogador.contrato >= 3) chanceSairPlayer *= 0.04;
    if((jogador.felicidade || 60) < 35) chanceSairPlayer += 0.18;
    if(Math.random() < chanceSairPlayer && jogador.geral > 62) {
        let interessados = focoEmprestimo ? escolherClubeEmprestimo(jogador) : escolherClubeComprador(jogador, clubes.find(c=>c.id===jogador.clubeId), modoJanela);
        interessados.slice(0, 5).forEach(c => {
            if(propostasPendentes.length >= 3 || propostasPendentes.find(x=>x.id===c.id && x.tipo !== "renovacao")) return;
            const tipo = focoEmprestimo && jogador.idade <= 23 && Math.random() < 0.72 ? "emprestimo" : "transferencia";
            propostasPendentes.push({ id: c.id, nome: c.nome, reputacao: c.reputacao, valor: tipo === "emprestimo" ? Math.floor(valorMeu * 0.08) : valorMeu, tipo, janela });
        });
    }

    let candidatos = jogadoresIA.filter(j => !j.aposentado && j.clubeId !== "aposentado").sort(() => Math.random() - 0.5);
    let limiteNegocios = focoEmprestimo ? 18 : 34;
    let feitos = 0;

    candidatos.forEach(j => {
        if(feitos >= limiteNegocios) return;
        let clubeAtual = clubes.find(c => c.id === j.clubeId);
        if(modoJanela === "principal") j.contrato = Math.max(0, (j.contrato || 0) - 1);
        const protegidoElite = clubeAtual && clubeAtual.reputacao >= 85 && j.geral >= 84 && j.contrato >= 2 && (j.felicidade || 55) >= 42;
        const craqueTop = clubeAtual && clubeAtual.reputacao >= 88 && j.geral >= 86 && j.contrato >= 2;
        if(protegidoElite && Math.random() < 0.94) return;
        if(craqueTop && Math.random() < 0.97) return;
        let chanceRenovar = clubeAtual ? 0.35 + ((clubeAtual.inteligenciaMercado || 60) / 220) + ((j.felicidade || 55) / 260) + ((clubeAtual.reputacao >= 84 && j.geral >= 82) ? 0.35 : 0) + (craqueTop ? 0.22 : 0) : 0;
        if (j.contrato <= 1 && clubeAtual && j.geral >= (clubeAtual.reputacao - 8) && Math.random() < chanceRenovar) {
            j.contrato = craqueTop ? Math.floor(Math.random() * 2) + 4 : Math.floor(Math.random() * 3) + 2;
            registrarNoticia("Renovação de contrato", `${j.nome} renovou com o ${clubeAtual.nome} por mais ${j.contrato} anos.`, "Mercado");
            return;
        }

        const valorNum = calcularValorMercadoJogador(j);
        // 🆕 Jogador insatisfeito por falta de espaço: se não é titular do seu
        // clube, tem nível pra jogar mais (geral 62+) e já tem idade pra cobrar
        // isso (20+), fica bem mais propenso a sair — tanto pra empréstimo
        // (jovens buscando minutos) quanto pra transferência definitiva.
        const clubeInfo = clubeAtual ? obterTitularesClube(clubeAtual.id) : null;
        const naoETitular = clubeInfo && j.idade >= 20 && j.geral >= 62 && !(clubeInfo.titularesIds || []).includes(j.id);
        const querEmprestimo = focoEmprestimo && j.idade <= 23 && (j.geral < 78 || naoETitular) && Math.random() < (naoETitular ? 0.74 : 0.55);
        let chanceTransferir = j.clubeId === "livre" ? 0.9 : (focoEmprestimo ? 0.035 : (j.contrato <= 1 ? 0.18 : (j.contrato >= 2 ? 0.025 : 0.06))) + ((j.felicidade || 55) < 35 ? 0.12 : 0);
        if(naoETitular) chanceTransferir += (j.idade <= 25 ? 0.16 : 0.10);
        if(clubeAtual?.reputacao >= 84 && j.geral >= 84) chanceTransferir *= j.contrato >= 3 ? 0.08 : (j.contrato >= 2 ? 0.14 : 0.45);
        if(clubeAtual?.reputacao >= 88 && j.geral >= 86) chanceTransferir *= 0.05;

        if(querEmprestimo && clubeAtual) {
            let destino = escolherClubeEmprestimo(j)[0];
            if(destino) {
                j.clubeOrigemEmprestimo = clubeAtual.id; j.emprestadoAte = anoAtual; j.clubeId = destino.id;
                moverJogadorCacheMercado(clubeAtual.id, destino.id, j.posicao);
                registrarMovimentacao({ jogadorNome: j.nome, jogadorId: j.id, tipo: "emprestimo", valor: Math.floor(valorNum * 0.06), origemId: clubeAtual.id, destinoId: destino.id, janela });
                feitos++;
            }
            return;
        }

        if(Math.random() < chanceTransferir) {
            let destino = escolherClubeComprador(j, clubeAtual, modoJanela)[0];
            if(destino) {
                let preco = j.clubeId === "livre" ? 0 : Math.floor(valorNum * (0.82 + Math.random() * 0.36));
                destino.orcamento -= preco; if(clubeAtual) clubeAtual.orcamento += preco;
                registrarMovimentacao({ jogadorNome: j.nome, jogadorId: j.id, tipo: "transferencia", valor: preco, origemId: j.clubeId, destinoId: destino.id, janela });
                moverJogadorCacheMercado(j.clubeId === "livre" ? null : j.clubeId, destino.id, j.posicao);
                j.clubeId = destino.id; j.contrato = Math.floor(Math.random() * 4) + 2; delete j.clubeOrigemEmprestimo; delete j.emprestadoAte;
                feitos++;
            } else if(j.contrato <= 0) { moverJogadorCacheMercado(j.clubeId, null, j.posicao); j.clubeId = "livre"; j.contrato = 0; }
        }
    });

    if(feitos > 0 || propostasPendentes.length > 0) mostrarToast("Mercado", `${janela}: ${feitos} movimentos globais e ${propostasPendentes.length} proposta(s) para ti.`, "warning");
    atualizarOVRClubes();
    renderizarTransferencias();
}

function reconstruirAgendaAposTrocaClube() {
    rodadaAtual = 1;
    agendaTemporada = [];
    gerarAgenda();
    preencherDropdowns();
    atualizarConteudoAbaAtiva();
}

function renderizarMercado() {
    inicializarEstadoCarreiraJogador();
    atualizarProgressoObjetivos();
    let elDest = document.getElementById("view-mercado");
    if (!elDest) return;
    const clubeAtual = clubes.find(c => c.id === jogador.clubeId);
    const valorMeu = formatarMoeda(calcularValorMercadoJogador(jogador));
    const topClubes = [...clubes].filter(c => c.reputacao >= 78 && c.id !== jogador.clubeId).sort((a, b) => b.reputacao - a.reputacao).slice(0, 24);
    const alvo = jogador.clubeAlvoId ? clubes.find(c => c.id === jogador.clubeAlvoId) : null;
    const objsHtml = (jogador.objetivosCarreira || []).map(o => {
        const pct = Math.min(100, Math.round((o.atual / o.meta) * 100));
        return `<div class="objetivo-row ${o.concluido ? "done" : ""}"><div><strong>${o.concluido ? "✓ " : ""}${o.desc}</strong><div class="objetivo-bar"><div class="objetivo-bar-fill" style="width:${pct}%"></div></div></div><span>${Math.min(o.atual, o.meta)}/${o.meta}</span></div>`;
    }).join("");
    const desejosHtml = (jogador.listaDesejos || []).map(id => {
        const c = clubes.find(x => x.id === id);
        if (!c) return "";
        const isAlvo = jogador.clubeAlvoId === id;
        return `<div class="desejo-clube">
            <img src="${obterUrlImagem(c,'clube')}" onclick="abrirPerfilClube('${id}')">
            <div style="flex:1;"><strong>${c.nome}</strong><br><small>OVR ${c.reputacao}</small></div>
            ${isAlvo ? `<span class="meta-pill">Alvo</span>` : `<button class="btn btn-primary" style="padding:6px 10px;font-size:0.75rem;" onclick="definirClubeAlvo('${id}')">Definir alvo</button>`}
            <button class="btn btn-danger" style="padding:6px 10px;font-size:0.75rem;" onclick="removerClubeDesejos('${id}')">✖</button>
        </div>`;
    }).join("") || `<p style="color:#888;font-size:0.9rem;">Adiciona até 5 clubes dos sonhos.</p>`;
    const propostasHtml = propostasPendentes.length ? propostasPendentes.map((c, i) => `
        <div style="background:rgba(0,255,136,0.05);padding:16px;border-radius:10px;border:1px solid var(--theme-primary);display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:12px;"><img src="${obterUrlImagem(c,'clube')}" style="width:56px;height:56px;border-radius:8px;object-fit:contain;background:#fff;padding:4px;">
            <div><h4 style="margin:0;cursor:pointer;" onclick="abrirPerfilClube('${c.id}')">${c.nome}</h4><p style="margin:4px 0 0;color:#aaa;font-size:0.9rem;">${c.tipo === "renovacao" ? "Renovação" : (c.tipo === "emprestimo" ? "Empréstimo" : "Transferência")} • ${c.janela}</p></div></div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="btn btn-primary" style="padding:8px 14px;font-size:0.85rem;" onclick="iniciarNegociacao(${i})">🤝 Negociar</button>
                <button class="btn btn-success" onclick="assinarContrato(${i})">Aceitar rápido ➔</button>
            </div>
        </div>`).join("") : `<div style="padding:20px;text-align:center;color:#888;border-radius:10px;background:rgba(0,0,0,0.3);">Nenhuma proposta oficial.</div>`;

    elDest.innerHTML = `
        <div class="dashboard-card" style="padding:24px;border-top:4px solid var(--success);">
            <h2 style="margin-top:0;">💼 Mercado & Carreira</h2>
            <p style="color:#aaa;">Clube: <strong style="color:var(--success);">${clubeAtual?.nome || "Livre"}</strong> • Contrato: ${jogador.contrato} anos • Valor: <strong style="color:var(--gold);">${valorMeu}</strong> • Salário: <strong style="color:#93c5fd;">${formatarMoeda(jogador.salarioSemanal || calcularSalarioSemanalJogador())}/sem</strong></p>
            <button class="btn btn-primary" style="margin-top:8px;" onclick="abrirNegociacaoRenovacao()">🤝 Reunião de renovação com ${clubeAtual?.nome || "o clube"}</button>
            <h3 style="color:var(--theme-primary);margin-top:24px;">📬 Propostas</h3>
            ${propostasHtml}
            <div class="mercado-grid">
                <div class="mercado-panel">
                    <h3>⭐ Lista de desejos</h3>
                    ${desejosHtml}
                    <details style="margin-top:14px;"><summary style="cursor:pointer;color:var(--theme-primary);font-weight:800;">+ Adicionar clube</summary>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-top:12px;max-height:200px;overflow-y:auto;">
                        ${topClubes.filter(c => !(jogador.listaDesejos||[]).includes(c.id)).slice(0, 16).map(c => `
                            <button type="button" class="btn-pais-filtro" style="min-height:56px;padding:8px;" onclick="adicionarClubeDesejos('${c.id}')">
                                <img src="${obterUrlImagem(c,'clube')}" style="width:28px;height:28px;object-fit:contain;background:#fff;border-radius:6px;padding:2px;">
                                <span class="pais-label" style="font-size:0.75rem;">${c.nome.slice(0, 14)}</span>
                            </button>`).join("")}
                    </div></details>
                </div>
                <div class="mercado-panel">
                    <h3>🎯 Objetivos de transferência</h3>
                    ${alvo ? `<p style="color:#ccc;margin:0 0 12px;">Clube alvo: <img src="${obterUrlImagem(alvo,'clube')}" style="width:22px;height:22px;vertical-align:middle;background:#fff;border-radius:4px;padding:1px;"> <strong>${alvo.nome}</strong></p>${objsHtml}
                    <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">
                        <button class="btn btn-primary" ${objetivosTransferenciaCumpridos() ? "" : "disabled style='opacity:0.5'"} onclick="pedirTransferenciaClube('${alvo.id}','transferencia')">Pedir transferência</button>
                        <button class="btn btn-warning" ${objetivosTransferenciaCumpridos() ? "" : "disabled style='opacity:0.5'"} onclick="pedirTransferenciaClube('${alvo.id}','emprestimo')" style="color:#000;">Pedir empréstimo</button>
                    </div>` : `<p style="color:#888;">Escolhe um clube da lista de desejos como <strong>alvo</strong> para gerar objetivos (gols, jogos, OVR, titularidade).</p>`}
                </div>
            </div>
        </div>`;
    let box = document.getElementById("containerPropostasMercado");
    if (box) box.innerHTML = "";
}

window.assinarContrato = function(index) {
    let nC = propostasPendentes[index]; 
    if(!nC) return;
    let clubeAlvo = clubes.find(c => c.id === nC.id);
    let ofertaRapida = clubeAlvo ? calcularOfertaInicialClube(clubeAlvo, nC.tipo) : null;
    if(nC.tipo === "renovacao") {
        jogador.contrato = nC.anos || Math.floor(Math.random() * 3) + 2;
        jogador.felicidade = Math.min(100, (jogador.felicidade || 60) + 8);
        if(ofertaRapida) { jogador.salarioSemanal = ofertaRapida.salario; jogador.bonusGol = ofertaRapida.bonusGol; jogador.bonusVitoria = ofertaRapida.bonusVitoria; jogador.direitosImagem = ofertaRapida.direitosImagem; if(jogador.lifestyle) jogador.lifestyle.salary = Math.floor(ofertaRapida.salario * (jogador.lifestyle.multipliers?.salaryMultiplier || 1)); }
        registrarNoticia("Contrato renovado", `${jogador.nome} renovou com ${nC.nome} até ${anoAtual + jogador.contrato}${ofertaRapida ? `, por ${formatarMoeda(ofertaRapida.salario)}/semana` : ""}.`, "Mercado");
        propostasPendentes = [];
        mostrarToast("Renovação", `Renovaste com o ${nC.nome} por ${jogador.contrato} anos!`, "success");
        window.salvarJogo(); atualizarHub(); mudarTela("view-hub");
        return;
    }
    let cAntigo = clubes.find(c => c.id === jogador.clubeId); let cNovo = clubes.find(c => c.id === nC.id);
    if(cNovo) cNovo.orcamento -= nC.valor; if(cAntigo && nC.tipo !== "emprestimo") cAntigo.orcamento += nC.valor;
    registrarMovimentacao({ jogadorNome: jogador.nome, jogadorId: "player", tipo: nC.tipo || "transferencia", valor: nC.valor, origemId: jogador.clubeId, destinoId: nC.id, janela: nC.janela });
    if(nC.tipo === "emprestimo") { jogador.clubeOrigemEmprestimo = jogador.clubeId; jogador.emprestadoAte = anoAtual; jogador.clubeId = nC.id; }
    else { jogador.clubeId = nC.id; jogador.contrato = Math.floor(Math.random() * 3) + 2; delete jogador.clubeOrigemEmprestimo; delete jogador.emprestadoAte; }
    if(ofertaRapida) { jogador.salarioSemanal = ofertaRapida.salario; jogador.bonusGol = ofertaRapida.bonusGol; jogador.bonusVitoria = ofertaRapida.bonusVitoria; jogador.direitosImagem = ofertaRapida.direitosImagem; if(jogador.lifestyle) jogador.lifestyle.salary = Math.floor(ofertaRapida.salario * (jogador.lifestyle.multipliers?.salaryMultiplier || 1)); }
    jogador.jogosNoClubeAtual = 0; jogador.tecnicoConhecido = null; jogador.statusEscalacaoAnterior = null;
    jogador.titularidade = Math.min(jogador.titularidade || 48, 52);
    reconstruirAgendaAposTrocaClube();
    propostasPendentes = [];
    mostrarToast(nC.tipo === "emprestimo" ? "Empréstimo" : "Transferência", `${nC.tipo === "emprestimo" ? "Foste emprestado ao" : "Assinaste com o"} ${nC.nome}!`, "success");
    window.salvarJogo(); atualizarHub(); mudarTela("view-hub");
    setTimeout(() => abrirEntrevista("transferencia", { clube: nC.nome }), 500);
};

function renderizarTransferencias() {
    const el = document.getElementById("view-transferencias");
    if(!el) return;
    const cards = transferenciasHistorico.length ? transferenciasHistorico.map(m => {
        const jogadorMov = m.jogadorId === "player" ? jogador : jogadoresIA.find(j => j.id === m.jogadorId);
        const origem = clubes.find(c => c.id === m.origemId) || { nome: m.origem, logo: "" };
        const destino = clubes.find(c => c.id === m.destinoId) || { nome: m.destino, logo: "" };
        return `
        <div class="transfer-card">
            <div class="transfer-person">
                <img src="${obterUrlImagem(jogadorMov || m.jogadorNome, 'jogador')}" alt="${m.jogadorNome}">
                <div><strong style="color:#fff; font-size:1.05rem;">${m.jogadorNome}</strong><br><span style="color:#aaa; font-weight:700;">${m.ano} • Rodada ${m.rodada}</span></div>
            </div>
            <div class="transfer-club"><img src="${obterUrlImagem(origem, 'clube')}" alt="${m.origem}"><div><span style="color:#aaa; font-size:0.75rem; font-weight:900; text-transform:uppercase;">De</span><br><strong>${m.origem}</strong></div></div>
            <div class="transfer-club"><img src="${obterUrlImagem(destino, 'clube')}" alt="${m.destino}"><div><span style="color:#aaa; font-size:0.75rem; font-weight:900; text-transform:uppercase;">Para</span><br><strong style="color:var(--theme-primary);">${m.destino}</strong></div></div>
            <div style="text-align:right;"><span class="meta-pill">${m.tipo === "emprestimo" ? "Empréstimo" : "Transferência"}</span><br><strong style="display:block; margin-top:8px; color:var(--gold);">${m.tipo === "emprestimo" ? "Taxa " + formatarMoeda(m.valor) : formatarMoeda(m.valor)}</strong><span style="color:#aaa; font-size:0.82rem;">${m.janela}</span></div>
        </div>`;
    }).join("") : `<div style="text-align:center; color:#aaa; padding:30px;">Nenhum movimento registrado ainda.</div>`;
    el.innerHTML = `
        <div class="dashboard-card" style="padding:25px; border-top:4px solid var(--warning);">
            <h2 style="margin-top:0;">📋 Mercado Mundial</h2>
            <p style="color:#aaa; margin-top:0;">Transferências, empréstimos, clubes de origem/destino e valores.</p>
            ${cards}
        </div>`;
}
// 📜 HALL DA FAMA — antes a view existia no HTML mas nenhuma função a
// preenchia (a tabela #corpoHistorico ficava sempre vazia). Os dados em si
// já eram gravados certinho em jogador.historicoCarreira (ano a ano) e em
// jogador.titulosSelecao (troféus pela seleção) — só faltava mesmo desenhar.
function renderizarHistorico() {
    const el = document.getElementById("view-historico");
    if(!el) return;
    const hist = jogador.historicoCarreira || [];
    const carreira = obterEstatisticasCarreira(jogador);

    // Conta cada troféu distinto ganho ao longo da carreira: de clube +
    // prêmios individuais (guardados como texto em historicoCarreira.trofeus)
    // e troféus pela seleção (guardados à parte em titulosSelecao).
    const contagemTrofeus = {};
    hist.forEach(h => {
        if (!h.trofeus || h.trofeus === "-") return;
        h.trofeus.split(",").map(t => t.trim()).filter(Boolean).forEach(nome => {
            contagemTrofeus[nome] = (contagemTrofeus[nome] || 0) + 1;
        });
    });
    (jogador.titulosSelecao || []).forEach(t => {
        contagemTrofeus[t.trofeu] = (contagemTrofeus[t.trofeu] || 0) + 1;
    });
    const trofeusOrdenados = Object.entries(contagemTrofeus).sort((a,b) => b[1] - a[1]);
    const totalTrofeus = Object.values(contagemTrofeus).reduce((a,b) => a+b, 0);

    const linhasTabela = hist.map(h => `
        <tr>
            <td>${h.ano}</td>
            <td>${h.clube}</td>
            <td>${h.jogos}</td>
            <td>${h.gols}</td>
            <td>${h.trofeus && h.trofeus !== "-" ? h.trofeus.split(",").map(t => `<span class="hof-trofeu-tag">🏆 ${t.trim()}</span>`).join(" ") : `<span style="color:#666;">—</span>`}</td>
        </tr>`).join("");

    el.innerHTML = `
        <div class="dashboard-card hof-header">
            <div class="hof-avatar"><img src="${jogador.foto || ''}" onerror="this.style.display='none'"><span>🐐</span></div>
            <div>
                <span style="text-transform:uppercase; font-weight:900; color:var(--gold); letter-spacing:1px; font-size:0.8rem;">📜 Hall da Fama</span>
                <h2 style="margin:6px 0;">${jogador.nome}</h2>
                <p style="margin:0; color:#aaa;">${hist.length} temporada${hist.length === 1 ? "" : "s"} de carreira registada${hist.length === 1 ? "" : "s"}${jogador.aposentado ? " • Carreira encerrada" : ""}</p>
            </div>
        </div>
        <div class="hof-stats-grid">
            <div class="hof-stat-card"><strong>${carreira.jogos}</strong><span>Jogos</span></div>
            <div class="hof-stat-card"><strong>${carreira.gols}</strong><span>Gols</span></div>
            <div class="hof-stat-card"><strong>${carreira.assistencias}</strong><span>Assistências</span></div>
            <div class="hof-stat-card destaque"><strong>${totalTrofeus}</strong><span>Troféus</span></div>
        </div>
        <div class="dashboard-card" style="padding:25px; margin-top:18px;">
            <h3 style="margin:0 0 16px;">🏆 Vitrine de Troféus</h3>
            ${trofeusOrdenados.length ? `<div class="hof-trofeu-grid">
                ${trofeusOrdenados.map(([nome, qtd]) => `
                    <div class="hof-trofeu-item" title="${nome}">
                        <img src="${obterUrlImagem(nome, 'trofeu')}" onerror="this.outerHTML='<span class=&quot;hof-trofeu-fallback&quot;>🏆</span>'">
                        <span>${nome}</span>
                        ${qtd > 1 ? `<em>×${qtd}</em>` : ""}
                    </div>`).join("")}
            </div>` : `<p style="color:#aaa;">Ainda sem troféus. A glória está por vir! 🌱</p>`}
        </div>
        <div class="dashboard-card" style="padding:25px; margin-top:18px;">
            <h3 style="margin:0 0 15px 0;">📅 O Teu Legado, Ano a Ano</h3>
            <table class="data-table">
                <thead><tr><th>Ano</th><th>Clube</th><th>Partidas</th><th>Golos</th><th>Troféus</th></tr></thead>
                <tbody id="corpoHistorico">${linhasTabela || `<tr><td colspan="5" style="text-align:center; color:#aaa; padding:20px;">Ainda sem temporadas completas registadas. Avança de época para começar a escrever a tua história.</td></tr>`}</tbody>
            </table>
        </div>`;
}

function renderizarNoticias() {
    const el = document.getElementById("view-noticias");
    if(!el) return;
    const noticias = [...eventosRecentes, ...feedNoticias].slice(0, 50);
    const categoriaEstilo = {
        "Mercado": { icone: "💰", cor: "#22c55e" }, "Seleções": { icone: "🌍", cor: "#3b82f6" }, "Prémios": { icone: "🏆", cor: "#eab308" },
        "Treino": { icone: "🏋️", cor: "#f97316" }, "Lesão": { icone: "🩹", cor: "#ef4444" }, "Entrevista": { icone: "🎤", cor: "#a855f7" },
        "Mídia": { icone: "📺", cor: "#ec4899" }, "Rumor": { icone: "🔍", cor: "#94a3b8" }, "Olheiros": { icone: "🔭", cor: "#06b6d4" },
        "Bastidores": { icone: "🗣️", cor: "#f59e0b" }, "Tática": { icone: "📋", cor: "#0ea5e9" }, "Torcida": { icone: "📣", cor: "#facc15" },
        "Base": { icone: "🌱", cor: "#4ade80" }, "Manager": { icone: "👔", cor: "#818cf8" }, "Partida": { icone: "⚽", cor: "#16a34a" },
        "Finanças": { icone: "🏦", cor: "#10b981" }, "Mundo": { icone: "🌐", cor: "#38bdf8" }, "Números": { icone: "📊", cor: "#c084fc" },
        "Marketing": { icone: "📢", cor: "#f472b6" }, "Arbitragem": { icone: "🟨", cor: "#eab308" }, "Calendário": { icone: "🗓️", cor: "#60a5fa" },
        "Clássico": { icone: "🔥", cor: "#f87171" }
    };
    const categoriasPresentes = [...new Set(noticias.map(n => (n.data || "").split(" • ")[0]).filter(Boolean))];
    const filtroAtivo = window._filtroNoticiaAtivo || null;
    const noticiasFiltradas = filtroAtivo ? noticias.filter(n => (n.categoria || (n.data || "").split(" • ")[0]) === filtroAtivo) : noticias;
    el.innerHTML = `
        <div class="dashboard-card" style="padding:25px; border-top:4px solid #3b82f6;">
            <h2 style="margin-top:0;">📰 Central de Notícias</h2>
            ${categoriasPresentes.length ? `<div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:18px;">
                <span class="noticia-filtro-chip ${!filtroAtivo ? "ativo" : ""}" style="--chip-cor:#94a3b8;" onclick="window.filtrarNoticias(null)">🗞️ Todas</span>
                ${categoriasPresentes.map(cat => {
                    const est = categoriaEstilo[cat] || { icone: "📰", cor: "#94a3b8" };
                    return `<span class="noticia-filtro-chip ${filtroAtivo === cat ? "ativo" : ""}" style="--chip-cor:${est.cor};" onclick="window.filtrarNoticias('${cat}')">${est.icone} ${cat}</span>`;
                }).join("")}
            </div>` : ""}
            <div style="display:grid; gap:16px;">
                ${noticiasFiltradas.length ? noticiasFiltradas.map(n => {
                    const cat = n.categoria || (n.data || "").split(" • ")[0];
                    const est = categoriaEstilo[cat] || { icone: "📰", cor: "#3b82f6" };
                    const img = n.refImagem ? obterUrlImagem(n.refImagem, n.tipoImagem || 'jogador') : "";
                    if (n.formato === "manchete") {
                        return `
                        <div class="noticia-manchete-card">
                            <span class="noticia-manchete-tag">🔴 ÚLTIMA HORA</span>
                            <div class="noticia-manchete-body">
                                ${img ? `<img class="noticia-manchete-img" src="${img}" onerror="this.remove()">` : ""}
                                <div>
                                    <h2 class="noticia-manchete-headline">${n.manchete}</h2>
                                    <p class="noticia-manchete-texto">${n.corpo}</p>
                                    <span class="noticia-manchete-cat" style="color:${est.cor};">${est.icone} ${cat} • ${n.data}</span>
                                </div>
                            </div>
                        </div>`;
                    }
                    if (n.formato === "post") {
                        return `
                        <div class="noticia-post-card">
                            <div class="noticia-post-header">
                                ${img ? `<img class="noticia-post-avatar" src="${img}" onerror="this.outerHTML='<div class=&quot;noticia-post-avatar-fallback&quot;>${est.icone}</div>'">` : `<div class="noticia-post-avatar-fallback">${est.icone}</div>`}                                <div>
                                    <strong>${n.handle || "@ImprensaGlobal"}${n.verificado === false ? "" : " ✔️"}</strong>
                                    <span class="noticia-post-cat" style="color:${est.cor};">${est.icone} ${cat}</span>
                                </div>
                            </div>
                            <p class="noticia-post-manchete">${n.manchete}</p>
                            <p class="noticia-post-corpo">${n.corpo}</p>
                            <div class="noticia-post-footer">
                                <span>❤️ ${(n.curtidas || 0).toLocaleString('pt-BR')}</span>
                                <span>💬 ${Math.max(1, Math.round((n.curtidas || 100) / 38))}</span>
                                <span>🔁 ${Math.max(0, Math.round((n.curtidas || 100) / 90))}</span>
                            </div>
                        </div>`;
                    }
                    return `
                    <div class="noticia-jornal-card">
                        <div class="noticia-jornal-masthead"><span>${est.icone} ${cat.toUpperCase()}</span><span>${n.data}</span></div>
                        <div class="noticia-jornal-body">
                            ${img ? `<img class="noticia-jornal-img" src="${img}" onerror="this.remove()">` : ""}
                            <div>
                                <h3 class="noticia-jornal-headline">${n.manchete}</h3>
                                <p class="noticia-jornal-texto">${n.corpo}</p>
                            </div>
                        </div>
                    </div>`;
                }).join("") : `<p style="color:#aaa;">Sem notícias nesta categoria por enquanto.</p>`}
            </div>
        </div>`;
}

// Filtra o feed de notícias por categoria (clique num chip). Passar null
// remove o filtro e volta a mostrar tudo.
window.filtrarNoticias = function(categoria) {
    window._filtroNoticiaAtivo = categoria;
    renderizarNoticias();
};

function processarEventosAleatorios() {
    if(!jogador || Math.random() > 0.22) return;
    inicializarEstadoCarreiraJogador();
    if(jogador.lesaoRodadas > 0) {
        jogador.lesaoRodadas = Math.max(0, jogador.lesaoRodadas - 1);
        if(jogador.lesaoRodadas === 0) registrarNoticia("Liberado pelo departamento médico", `${jogador.nome} voltou a treinar sem limitações e já disputa lugar nos convocados.`, "Lesão");
        return;
    }
    const clube = clubes.find(c => c.id === jogador.clubeId);
    const eventos = [
        () => {
            jogador.energia = Math.max(35, jogador.energia - 8);
            registrarNoticia("Desgaste físico preocupa comissão técnica", `${jogador.nome} sentiu a sequência de jogos no ${clube?.nome || "clube"} e terá carga controlada nos treinos.`, "Treino");
        },
        () => {
            jogador.energia = Math.min(100, jogador.energia + 12);
            registrarNoticia("Treino regenerativo anima o balneário", `${jogador.nome} respondeu bem ao trabalho físico e chega mais inteiro para a próxima rodada.`, "Treino");
        },
        () => {
            jogador.pontosPremio = (jogador.pontosPremio || 0) + 8;
            jogador.pontosPremioTemporada = (jogador.pontosPremioTemporada || 0) + 8;
            registrarNoticia("Coletiva repercute forte", `"Quero decidir jogos grandes", disse ${jogador.nome} em entrevista. A frase ganhou força nas redes e aumentou o barulho pelo prêmio individual.`, "Entrevista");
        },
        () => {
            const alvo = jogadoresIA.filter(j => !j.aposentado).sort((a,b)=>b.geral-a.geral)[Math.floor(Math.random()*8)];
            if(alvo) registrarNoticia("Debate esquenta entre craques", `A imprensa comparou ${jogador.nome} com ${alvo.nome}. O assunto dominou programas esportivos durante a semana.`, "Mídia");
        },
        () => {
            const rival = clubes.filter(c => c.id !== jogador.clubeId).sort((a,b)=>b.reputacao-a.reputacao)[Math.floor(Math.random()*8)];
            if(rival) registrarNoticia("Rumor de bastidores movimenta o mercado", `Dirigentes do ${rival.nome} observaram ${jogador.nome}, mas nenhuma proposta oficial chegou.`, "Rumor");
        },
        () => {
            const jovem = jogadoresIA.filter(j => !j.aposentado && j.idade <= 21).sort((a,b)=>b.geral-a.geral)[0];
            if(jovem) registrarNoticia("Olheiros miram jovem promessa", `${jovem.nome} virou assunto em relatórios de clubes grandes depois de boas atuações recentes.`, "Olheiros");
        },
        () => {
            // Apply injury risk reduction from physiotherapist
            let injuryChance = 0.55;
            if(jogador.lifestyle && jogador.lifestyle.multipliers.injuryRiskReduction) {
                injuryChance = Math.max(0.15, injuryChance - jogador.lifestyle.multipliers.injuryRiskReduction);
            }
            if(Math.random() < injuryChance) {
                jogador.lesaoRodadas = Math.floor(Math.random() * 3) + 1;
                ajustarTitularidade(-8);
                registrarNoticia("Lesão no treino preocupa", `${jogador.nome} sofreu um problema físico e deve ficar fora por ${jogador.lesaoRodadas} semana(s).`, "Lesão");
                abrirEntrevista("lesao");
            }
        },
        () => {
            ajustarTitularidade(5);
            registrarNoticia("Treinador elogia aplicação tática", `${jogador.nome} ganhou pontos na luta por uma vaga nos 11 titulares após uma semana forte de treinos.`, "Treino");
        },
        () => {
            ajustarTitularidade(-5);
            registrarNoticia("Concorrência aumenta no elenco", `A disputa pela posição de ${jogador.nome} ficou mais intensa, e a comissão técnica ainda não definiu os titulares.`, "Bastidores");
        },
        () => {
            if(clube) {
                clube.tatica = ["Pressão Alta", "Posse de Bola", "Bloco Baixo", "Contra-ataque", "Equilibrado"][Math.floor(Math.random() * 5)];
                ajustarTitularidade((jogador.inteligencia || 60) > 70 ? 4 : -2);
                registrarNoticia("Treinador testa novo esquema", `${clube.nome} trabalhou em ${clube.tatica}, e ${jogador.nome} precisa adaptar movimentos para ganhar espaço.`, "Tática");
            }
        },
        () => {
            jogador.felicidade = Math.min(100, (jogador.felicidade || 60) + 6);
            registrarNoticia("Torcida canta o nome do jogador", `A relação entre ${jogador.nome} e os adeptos cresceu depois de uma semana de apoio nas arquibancadas e nas redes.`, "Torcida");
        },
        () => {
            jogador.felicidade = Math.max(0, (jogador.felicidade || 60) - 6);
            registrarNoticia("Rumor de insatisfação nos bastidores", `Fontes próximas ao elenco dizem que ${jogador.nome} quer mais minutos e observa as próximas decisões do treinador.`, "Bastidores");
        },
        () => {
            if (clube) {
                const cofres = (clube.orcamento || 0) >= 40000000;
                registrarNoticia(cofres ? "Diretoria libera investimento pesado" : "Clube trabalha para equilibrar as contas",
                    cofres ? `${clube.nome} confirmou orçamento robusto para reforçar o elenco na próxima janela.` : `${clube.nome} negocia patrocínios extras antes de pensar em grandes reforços.`,
                    "Finanças");
            }
        },
        () => {
            const doisClubes = [...clubes].filter(c => c.id !== jogador.clubeId).sort(() => Math.random() - 0.5).slice(0, 2);
            if (doisClubes.length === 2) {
                const destaqueRival = jogadoresIA.filter(j => j.clubeId === doisClubes[0].id && !j.aposentado).sort((a, b) => b.geral - a.geral)[0];
                if (destaqueRival) registrarNoticia("Mercado mundial em ebulição", `Rumores apontam interesse do ${doisClubes[1].nome} em ${destaqueRival.nome}, destaque do ${doisClubes[0].nome}.`, "Mundo");
            }
        },
        () => {
            if (clube) {
                const pressao = Math.random() < 0.5;
                registrarNoticia(pressao ? "Técnico sob pressão" : "Diretoria confirma apoio ao treinador",
                    pressao ? `Resultados irregulares do ${clube.nome} colocam o comando técnico sob desconfiança da torcida.` : `${clube.nome} descarta mudança no comando técnico e garante confiança total no trabalho atual.`,
                    "Bastidores");
            }
        },
        () => {
            const jogos = jogador.estatisticasAtuais?.jogos || 0;
            if (jogos > 0 && jogos % 10 === 0) registrarNoticia("Marca redonda", `${jogador.nome} chegou a ${jogos} jogos na temporada pelo ${clube?.nome || "clube"}.`, "Números");
            else registrarNoticia("Estatísticas em destaque", `Especialistas analisam a evolução de números de ${jogador.nome} nas últimas rodadas.`, "Números");
        },
        () => {
            const marcas = ["Rytmo", "Volt Sport", "Fúria Esportiva", "NorthStar", "Prisma"];
            registrarNoticia("Marca aposta no jogador", `${jogador.nome} fechou ação promocional com a ${marcas[Math.floor(Math.random() * marcas.length)]}, ampliando presença fora de campo.`, "Marketing");
        },
        () => {
            const jovemBase = jogadoresIA.filter(j => !j.aposentado && j.idade <= 19).sort((a, b) => (b.potencial || 0) - (a.potencial || 0))[Math.floor(Math.random() * 5)];
            if (jovemBase) registrarNoticia("Base badalada", `${jovemBase.nome}, de apenas ${jovemBase.idade} anos, vem sendo apontado como futuro destaque das categorias de base.`, "Base");
        },
        () => {
            const polemica = Math.random() < 0.5;
            registrarNoticia(polemica ? "Arbitragem em debate" : "Comitê disciplinar analisa lances da rodada",
                polemica ? "Decisões da arbitragem na última rodada geraram polêmica entre torcedores e comentaristas." : "Departamento de arbitragem revisa lances polêmicos antes da próxima rodada.",
                "Arbitragem");
        },
        () => {
            registrarNoticia("Calendário apertado preocupa comissões técnicas", "A sequência de jogos em curto espaço de tempo levanta debate sobre a gestão de desgaste físico dos atletas.", "Calendário");
        },
        () => {
            const rankPremio = [...jogadoresIA].filter(j => !j.aposentado).sort((a, b) => b.geral - a.geral).slice(0, 10);
            const nomeado = rankPremio[Math.floor(Math.random() * rankPremio.length)];
            if (nomeado) registrarNoticia("Corrida por prêmio individual esquenta", `${nomeado.nome} entra na lista de favoritos ao prêmio de melhor do ano segundo a imprensa especializada.`, "Prémios");
        },
        () => {
            registrarNoticia("Observado pela seleção", `A comissão técnica da seleção nacional monitora de perto o desempenho de ${jogador.nome} de olho nas próximas convocações.`, "Seleções");
        },
        () => {
            if (clube) {
                const rival = clubes.filter(c => c.ligaId === clube.ligaId && c.id !== clube.id).sort((a, b) => b.reputacao - a.reputacao)[0];
                if (rival) registrarNoticia("Clássico se aproxima", `Torcidas já sentem o clima do duelo entre ${clube.nome} e ${rival.nome} nas próximas rodadas.`, "Clássico");
            }
        },
        () => {
            const jogosSemana = Math.floor(Math.random() * 3) + 1;
            registrarNoticia("Pauta tática da semana", `${clube?.nome || "O clube"} ajustou detalhes de posicionamento nos treinos visando os próximos ${jogosSemana} compromisso(s).`, "Tática");
        },
        () => {
            registrarNoticia("Bastidores do vestiário", `Companheiros de elenco elogiaram a postura profissional de ${jogador.nome} durante a semana de treinos.`, "Bastidores");
        },
        () => {
            const scoutClube = clubes.filter(c => c.reputacao >= 80 && c.id !== jogador.clubeId).sort(() => Math.random() - 0.5)[0];
            if (scoutClube) registrarNoticia("Olheiros de fora observam o campeonato", `Relatórios de scouts do ${scoutClube.nome} circularam apontando nomes a acompanhar na liga.`, "Olheiros");
        },
        () => {
            registrarNoticia("Redes sociais em alta", `Um vídeo de treino de ${jogador.nome} viralizou nas redes e repercutiu entre torcedores de várias equipas.`, "Mídia");
        },
    ];
    eventos[Math.floor(Math.random() * eventos.length)]();
    renderizarNoticias();
}

function verificarJanelaMeioAno() {
    const marco = Math.max(7, Math.floor((agendaTemporada.length || 20) * 0.48));
    if(!janelaMeioAnoProcessada && rodadaAtual >= marco) {
        janelaMeioAnoProcessada = true;
        processarMercadoTransferencias("meio");
        registrarNoticia("Janela de meio de ano aberta", "Clubes priorizam empréstimos, ajustes curtos de elenco e oportunidades pontuais de transferência.", "Mercado");
        window.salvarJogo();
    }
}

// ==========================================
// 🌍 MOTOR DE ESTATÍSTICAS E COPAS GLOBAIS
// ==========================================
// Compara um atributo real do jogador com o que seria "esperado" pela sua
// posição/OVR (mesmo conceito usado no motor de partida) — usado para que
// estatísticas defensivas (desarmes, interceptações, defesas) variem de
// verdade conforme o atributo "defesa" de cada jogador, não só o OVR genérico.
function fatorAtributoIndividual(j, campo) {
    const perfil = PERFIS_ATRIBUTOS_POSICAO[j.posicao] || PERFIS_ATRIBUTOS_POSICAO["Meio-Campista"];
    const esperado = (j.geral || 60) * (perfil[campo] || 1);
    const real = j[campo] ?? esperado;
    return esperado > 0 ? Math.max(0.4, Math.min(1.9, real / esperado)) : 1;
}

// Recalcula o OVR (geral) de QUALQUER jogador a partir dos seus atributos
// individuais — mas agora PONDERADO pela posição: cada atributo pesa
// conforme a sua relevância real pra posição do jogador (os mesmos
// multiplicadores de PERFIS_ATRIBUTOS_POSICAO usados para gerar os
// atributos). Antes era uma média simples dos 8 atributos, o que castigava
// injustamente um atacante com carrinho fraco (correto pra posição dele) e
// achatava o OVR dele mesmo com finalização/velocidade excelentes.
function calcularGeralDeAtributos(j) {
    const perfil = PERFIS_ATRIBUTOS_POSICAO[j.posicao] || PERFIS_ATRIBUTOS_POSICAO["Meio-Campista"];
    const campos = j.posicao === "Goleiro"
        ? ["reflexos", "reposicao", "jogoAereo", "velocidade", "resistencia", "forca"]
        : ["finalizacao", "velocidade", "passe", "defesa", "cabeceamento", "drible", "resistencia", "forca"];
    let somaValor = 0, somaPeso = 0;
    campos.forEach(campo => {
        let peso = perfil[campo] || 1;
        if (j.posicao === "Goleiro" && campo === "reflexos") peso *= 2; // reflexos é o atributo decisivo de um goleiro
        somaValor += (j[campo] ?? 60) * peso;
        somaPeso += peso;
    });
    return Math.max(40, Math.min(99, Math.floor(somaValor / somaPeso)));
}

// 📈📉 Evolui (ou regride) um jogador: em vez de só mexer no número do OVR
// (o que deixava o OVR "solto", sem refletir em nenhum atributo real), isto
// sobe/desce TODOS os atributos individuais dele de forma proporcional ao
// delta — com uma variação própria por atributo, pra não parecer um bloco
// monolítico subindo/descendo igual — e só DEPOIS recalcula o OVR a partir
// deles. Assim um jogador que sobe de OVR fica de verdade mais rápido/melhor
// finalizador/etc, e um que cai perde atributos de verdade (não só o rótulo).
// 🆕 TETO DE POTENCIAL: sem isto, todo jovem crescia na mesma taxa até 99,
// então com o tempo o mundo inteiro ficava cheio de craques (nada de jogador
// que "não vingou"). Agora cada jovem tem um teto pessoal, sorteado de forma
// enviesada — a maioria mal evolui mais do que já tem, e só uma fração bem
// pequena tem margem pra virar um jogador de elite. Reflete a realidade: a
// maioria das promessas de base nunca vira craque.
function gerarPotencialJogador(geralAtual) {
    const r = Math.random();
    let bonus;
    if (r < 0.60) bonus = Math.floor(Math.random() * 6);            // 60%: quase não evolui (+0 a +5)
    else if (r < 0.88) bonus = 6 + Math.floor(Math.random() * 9);   // 28%: evolução moderada (+6 a +14)
    else if (r < 0.98) bonus = 15 + Math.floor(Math.random() * 11); // 10%: boa evolução (+15 a +25)
    else bonus = 26 + Math.floor(Math.random() * 15);               // 2%: craque em formação (+26 a +40)
    return Math.min(99, (geralAtual || 60) + bonus);
}
// Para jogadores que já existiam sem "potencial" definido (ex: elenco real
// inicial do jogo, sem esse campo em jogadores.js): joga em cima de idade —
// quem já é veterano não tem mais teto a explorar; quem é jovem ganha um teto
// gerado agora mesmo (guardado, pra não sortear de novo toda temporada).
function obterOuGerarPotencial(j) {
    if (typeof j.potencial === "number") return j.potencial;
    if ((j.idade || 24) >= 27) { j.potencial = j.geral || 60; return j.potencial; }
    j.potencial = gerarPotencialJogador(j.geral || 60);
    return j.potencial;
}

function evoluirAtributosEGeral(j, delta) {
    if (!delta) { j.geral = Math.max(40, Math.min(99, j.geral)); return; }
    const campos = j.posicao === "Goleiro"
        ? ["reflexos", "reposicao", "jogoAereo", "velocidade", "resistencia", "forca"]
        : ["finalizacao", "velocidade", "passe", "defesa", "cabeceamento", "drible", "resistencia", "forca"];
    campos.forEach(campo => {
        if (typeof j[campo] !== "number") return;
        const variacao = delta + (Math.random() - 0.5) * Math.abs(delta) * 0.7;
        j[campo] = Math.max(28, Math.min(99, Math.round(j[campo] + variacao)));
    });
    j.geral = calcularGeralDeAtributos(j);
}

// 🔧 RECONCILIAÇÃO OVR ↔ ATRIBUTOS
// Corrige jogadores cujo OVR e atributos ficaram dessincronizados — por
// exemplo, saves antigos onde uma queda de OVR por idade aconteceu ANTES de
// evoluirAtributosEGeral() existir, deixando o número do OVR baixo mas os
// atributos individuais ainda "ótimos" (sem terem caído junto). A partir de
// agora o OVR é sempre um resumo dos atributos — então, se um jogador teve
// uma queda de OVR, os atributos TÊM de acompanhar essa queda (e vice-versa
// se o OVR ficou pra trás de atributos que já subiram).
function sincronizarAtributosComOver(j) {
    if (typeof j.finalizacao !== "number" && typeof j.reflexos !== "number") return;
    const geralEsperado = calcularGeralDeAtributos(j);
    const diff = (j.geral || 60) - geralEsperado;
    if (Math.abs(diff) < 2) return; // já está coerente, não mexe
    evoluirAtributosEGeral(j, diff);
}
function sincronizarTodosOversComAtributos() {
    sincronizarAtributosComOver(jogador);
    jogadoresIA.forEach(j => { if (!j.aposentado) sincronizarAtributosComOver(j); });
}

function atribuirEstatisticaNPC(clubeId, golsFeitos, compId = null, golsSofridos = 0) {
    let elenco = montarEscalacaoJogo(clubeId);
    if(elenco.length === 0) return;
    elenco.forEach(j => { if(!j.statsTemporada) j.statsTemporada = { jogos: 0, gols: 0, assistencias: 0 }; j.statsTemporada.jogos++; registrarEstatisticaCompeticao(j, compId, 1, 0, 0); });

    // 🛡️ FIX (estatísticas defensivas REAIS): antes, "desarmes/interceptações/
    // defesas" dos zagueiros/laterais/goleiros eram só uma FÓRMULA inventada a
    // partir do OVR (nunca vinham de jogos de verdade). Agora, a cada partida
    // simulada, jogadores defensivos acumulam essas estatísticas de verdade —
    // mais quando o clube não sofre gol, mais para o goleiro quando sofre menos.
    const defensivos = elenco.filter(j => ["Zagueiro","Lateral","Goleiro"].includes(j.posicao));
    if (defensivos.length > 0) {
        const jogoLimpo = golsSofridos === 0;
        defensivos.forEach(j => {
            if (!j.statsTemporada.desarmes) j.statsTemporada.desarmes = 0;
            if (!j.statsTemporada.interceptacoes) j.statsTemporada.interceptacoes = 0;
            if (!j.statsTemporada.defesas) j.statsTemporada.defesas = 0;
            if (!j.statsTemporada.jogosSemSofrerGol) j.statsTemporada.jogosSemSofrerGol = 0;
            const fatorOvr = Math.max(0, ((j.geral || 60) - 58)) / 100;
            if (j.posicao === "Goleiro") {
                // 🧤 Goleiros usam o atributo "reflexos" (próprio deles), não "defesa".
                const fatorReflexos = fatorAtributoIndividual(j, "reflexos");
                j.statsTemporada.defesas += Math.round((1.5 + fatorOvr * 3.2) * fatorReflexos + Math.random() * 2 - golsSofridos * 0.3);
            } else {
                const fatorDefesa = fatorAtributoIndividual(j, "defesa");
                j.statsTemporada.desarmes += Math.round((0.6 + fatorOvr * 2.0) * fatorDefesa + Math.random() * 1.4);
                j.statsTemporada.interceptacoes += Math.round((0.5 + fatorOvr * 1.6) * fatorDefesa + Math.random() * 1.2);
            }
            if (jogoLimpo) j.statsTemporada.jogosSemSofrerGol++;
        });
    }

    const getPeso = (j) => {
        let peso = Math.pow((j.geral || 60) / 100, 4.8);
        if((j.geral || 60) >= 82 && ["Atacante", "Ponta", "Meia Ofensivo", "Meio-Campista"].includes(j.posicao)) peso *= 1.55;
        if((j.geral || 60) >= 86 && ["Atacante", "Ponta", "Meia Ofensivo"].includes(j.posicao)) peso *= 1.45;
        if((j.geral || 60) >= 90 && ["Atacante", "Ponta"].includes(j.posicao)) peso *= 1.35;
        return peso;
    };
    const sortear = (pool) => {
        let somaTotal = pool.reduce((acc, p) => acc + p.peso, 0);
        let sorteio = Math.random() * somaTotal; let acumulado = 0;
        for (let item of pool) { acumulado += item.peso; if (sorteio <= acumulado) return item.jogador; }
        return pool[0]?.jogador;
    };

    const pesoGolPorPosicao = { "Atacante":0.82, "Ponta":0.62, "Meia Ofensivo":0.46, "Meio-Campista":0.22, "Volante":0.08, "Lateral":0.05, "Zagueiro":0.025, "Goleiro":0.002 };
    const pesoAssistPorPosicao = { "Atacante":0.30, "Ponta":0.58, "Meia Ofensivo":0.74, "Meio-Campista":0.62, "Volante":0.34, "Lateral":0.42, "Zagueiro":0.10, "Goleiro":0.02 };
    // 🛡️ TETO REALISTA POR POSIÇÃO: mesmo com peso baixo, ao longo de uma
    // temporada inteira (dezenas de jogos, em centenas de clubes simulados no
    // mundo todo) a sorte eventualmente favorece alguém demais — sem isto, de
    // vez em quando um zagueiro ou goleiro acabava com 30-50 gols na temporada,
    // o que não faz sentido nenhum. Isto é uma trava dura: ninguém nessas
    // posições pode passar do teto, não importa o quão "sortudo" o sorteio for.
    const TETO_GOLS_TEMPORADA_POSICAO = { "Goleiro": 2, "Zagueiro": 6, "Lateral": 10, "Volante": 10, "Meio-Campista": 16, "Meia Ofensivo": 26, "Ponta": 30, "Atacante": 38 };
    let poolFinalGolos = elenco.map(j => ({ jogador:j, peso:getPeso(j) * (pesoGolPorPosicao[j.posicao] || 0.25) }));
    let poolFinalAssist = elenco.map(j => ({ jogador:j, peso:getPeso(j) * (pesoAssistPorPosicao[j.posicao] || 0.25) }));

    for(let i = 0; i < golsFeitos; i++) {
        // Sorteia excluindo quem já bateu o teto de gols da posição naquela temporada.
        let poolDisponivel = poolFinalGolos.filter(p => (p.jogador.statsTemporada.gols || 0) < (TETO_GOLS_TEMPORADA_POSICAO[p.jogador.posicao] ?? 45));
        let artilheiro = sortear(poolDisponivel.length > 0 ? poolDisponivel : poolFinalGolos);
        if (artilheiro) {
            artilheiro.statsTemporada.gols++;
            registrarEstatisticaCompeticao(artilheiro, compId, 0, 1, 0);
            let cAssist = poolFinalAssist.filter(p => p.jogador.id !== artilheiro.id);
            if (cAssist.length > 0 && Math.random() < 0.78) {
                let assist = sortear(cAssist);
                if (assist) { assist.statsTemporada.assistencias++; registrarEstatisticaCompeticao(assist, compId, 0, 0, 1); }
            }
        }
    }
}

function inicializarTabelas() {
    for (let key in tabelasLigas) delete tabelasLigas[key];
    competicoes.forEach(comp => { 
        if(comp.tipo === "liga") {
            tabelasLigas[comp.id] = [];
            clubes.filter(c => c.ligaId === comp.id).forEach(c => { tabelasLigas[comp.id].push({ id: c.id, nome: c.nome, pontos: 0, jogos: 0, vitorias: 0, empates: 0, derrotas: 0, gols: 0, golsSofridos: 0 }); });
        }
    });
}

// ==========================================
// 🇪🇺 FORMATO SUÍÇO (Champions / Europa / Conference League)
// ==========================================
// Substitui a antiga fase de grupos (4 times x 6 jogos) pelo formato real
// atual da UEFA: 36 times numa tabela única, 8 jogos por time (2 contra cada
// um dos 4 potes, sendo 1 em casa e 1 fora), classificação em 3 faixas
// (1º-8º direto às oitavas, 9º-24º disputam playoff de ida e volta pelas
// outras 8 vagas, 25º-36º eliminados).
const CLUBES_LIGA_SUICA = new Set(["uefa_cl", "uefa_el", "uefa_col"]);

function sortearPotesLigaSuica(times) {
    const ordenado = [...times].sort((a, b) => (b.reputacao || 60) - (a.reputacao || 60));
    const potes = [[], [], [], []];
    ordenado.forEach((t, i) => potes[Math.min(3, Math.floor(i / 9))].push(t));
    return potes;
}

// Gera as 144 partidas (36 times x 8 jogos / 2) garantindo que cada time
// enfrente exatamente 2 times de cada pote (1 em casa, 1 fora).
function gerarPartidasLigaSuica(times) {
    const potes = sortearPotesLigaSuica(times);
    const partidas = [];

    // Dentro do mesmo pote (9 times): ciclo de 9 -> cada time joga com os 2
    // "vizinhos" do ciclo, um em casa e outro fora.
    potes.forEach(pote => {
        const p = [...pote].sort(() => Math.random() - 0.5);
        const n = p.length;
        for (let i = 0; i < n; i++) partidas.push({ home: p[i], away: p[(i + 1) % n] });
    });

    // Entre potes diferentes: dois "casamentos" (offset 0 e offset 1), que
    // nunca coincidem -> cada time fica com exatamente 2 rivais do outro
    // pote (1 em casa, 1 fora), e vice-versa.
    for (let i = 0; i < potes.length; i++) {
        for (let j = i + 1; j < potes.length; j++) {
            const A = [...potes[i]].sort(() => Math.random() - 0.5);
            const B = [...potes[j]].sort(() => Math.random() - 0.5);
            const n = Math.min(A.length, B.length);
            for (let k = 0; k < n; k++) {
                partidas.push({ home: A[k], away: B[k] });
                partidas.push({ home: B[k], away: A[(k + 1) % n] });
            }
        }
    }
    return partidas;
}

// Distribui as partidas em 8 rodadas sem repetir nenhum time na mesma
// rodada. Usa busca com retrocesso (backtracking) + heurística MRV (sempre
// tenta primeiro a partida com menos rodadas "livres" restantes) — isso
// encontra um encaixe válido na esmagadora maioria dos casos, bem mais
// confiável que sorteio aleatório puro. Tem uma rede de segurança final para
// nunca travar o jogo, mesmo no caso raríssimo de não conseguir de jeito nenhum.
function distribuirRodadasLigaSuicaTentativa(partidas) {
    const NUM_RODADAS = 8;
    const porTime = new Map();
    partidas.forEach((jogo, idx) => {
        if (!porTime.has(jogo.home.id)) porTime.set(jogo.home.id, []);
        if (!porTime.has(jogo.away.id)) porTime.set(jogo.away.id, []);
        porTime.get(jogo.home.id).push(idx);
        porTime.get(jogo.away.id).push(idx);
    });
    const rodadaDe = new Array(partidas.length).fill(-1);

    function possivel(idx, r) {
        const { home, away } = partidas[idx];
        for (const e of porTime.get(home.id)) if (rodadaDe[e] === r) return false;
        for (const e of porTime.get(away.id)) if (rodadaDe[e] === r) return false;
        return true;
    }
    function domainSize(idx) {
        let c = 0;
        for (let r = 0; r < NUM_RODADAS; r++) if (possivel(idx, r)) c++;
        return c;
    }
    function escolherProximo(restantes) {
        let melhor = -1, melhorTam = Infinity;
        for (const idx of restantes) {
            const d = domainSize(idx);
            if (d < melhorTam) { melhorTam = d; melhor = idx; if (d <= 1) break; }
        }
        return melhor;
    }

    let ops = 0;
    const LIMITE_OPS = 2000000;
    function backtrack(restantes) {
        ops++;
        if (ops > LIMITE_OPS) return false;
        if (restantes.length === 0) return true;
        const idx = escolherProximo(restantes);
        const novoRestantes = restantes.filter(i => i !== idx);
        for (let r = 0; r < NUM_RODADAS; r++) {
            if (possivel(idx, r)) {
                rodadaDe[idx] = r;
                if (backtrack(novoRestantes)) return true;
                rodadaDe[idx] = -1;
            }
        }
        return false;
    }

    const ok = backtrack(partidas.map((_, i) => i));
    if (ok) return partidas.map((j, i) => ({ ...j, rodada: rodadaDe[i] + 1 }));
    return null;
}



function gerarFaseLigaSuica(compId, times) {
    // Tenta o sorteio + encaixe algumas vezes do zero (raríssimo precisar de
    // mais de 1 tentativa) antes de aceitar a distribuição aproximada.
    let partidas = null;
    for (let tentativa = 0; tentativa < 5 && !partidas; tentativa++) {
        partidas = distribuirRodadasLigaSuicaTentativa(gerarPartidasLigaSuica(times));
    }
    if (!partidas) {
        console.warn(`Liga Suiça (${compId}): usando distribuicao aproximada apos varias tentativas.`);
        partidas = gerarPartidasLigaSuica(times).map((jogo, idx) => ({ ...jogo, rodada: (idx % 8) + 1 }));
    }
    const tabela = times.map(t => ({ id: t.id, pts: 0, j: 0, gf: 0, gs: 0 }));
    if (!copasEstado[compId]) copasEstado[compId] = { historicoFases: [] };
    copasEstado[compId].tipo = "liga_unica";
    copasEstado[compId].fase = "Fase de Liga";
    copasEstado[compId].tabela = tabela;
    copasEstado[compId].fixtures = partidas;
    copasEstado[compId].rodadaAtual = 1;
}

// Fecha a fase de liga: 1º-8º avançam direto às oitavas; 9º-24º entram no
// playoff (ida e volta, semeado 9ºx24º, 10ºx23º...); 25º-36º são eliminados.
function processarFimLigaSuica(compId) {
    const estado = copasEstado[compId];
    if (!estado || estado.tipo !== "liga_unica") return;
    arquivarFase(compId);

    const tabOrd = [...estado.tabela].sort((a, b) => b.pts - a.pts || (b.gf - b.gs) - (a.gf - a.gs) || b.gf - a.gf);
    const top8 = tabOrd.slice(0, 8).map(t => clubes.find(c => c.id === t.id)).filter(Boolean);
    const poolPlayoff = tabOrd.slice(8, 24).map(t => clubes.find(c => c.id === t.id)).filter(Boolean);

    const confrontosPlayoff = [];
    for (let i = 0; i < 8; i++) {
        const melhor = poolPlayoff[i];      // 9º..16º (melhor colocado do par)
        const pior = poolPlayoff[15 - i];   // 24º..17º (pior colocado do par)
        if (melhor && pior) confrontosPlayoff.push({ timeA: pior, timeB: melhor, golsAIda: null, golsBIda: null, golsAVolta: null, golsBVolta: null, vencedorId: null });
    }

    copasEstado[compId] = {
        historicoFases: estado.historicoFases,
        tipo: "mata-mata",
        fase: "Playoff",
        confrontos: confrontosPlayoff,
        classificadosDiretos: top8
    };
    agendarConfrontoContinentalDoJogador(compId);
}


function gerarChaveamentoMataMata(compId, times, faseNome) {
    if(!copasEstado[compId]) copasEstado[compId] = { historicoFases: [] };
    let confrontos = []; times.sort(() => Math.random() - 0.5); 
    for(let i=0; i < times.length; i+=2) { if(times[i+1]) confrontos.push({ timeA: times[i], timeB: times[i+1], golsAIda: null, golsBIda: null, golsAVolta: null, golsBVolta: null, vencedorId: null }); }
    copasEstado[compId].tipo = "mata-mata"; copasEstado[compId].fase = faseNome; copasEstado[compId].confrontos = confrontos;
}

function gerarFaseDeGrupos(compId, times) {
    if(!copasEstado[compId]) copasEstado[compId] = { historicoFases: [] };
    let grupos = []; let nGrupos = Math.floor(times.length / 4); times.sort(() => Math.random() - 0.5);
    for(let i=0; i<nGrupos; i++) { grupos.push({ nome: `Grupo ${String.fromCharCode(65+i)}`, equipas: times.slice(i*4, i*4+4).map(t => ({id: t.id, pts: 0, j:0, gf:0, gs:0})) }); }
    copasEstado[compId].tipo = "grupos"; copasEstado[compId].fase = "Fase de Grupos"; copasEstado[compId].grupos = grupos; copasEstado[compId].rodadaAtual = 1;
}

function clubePorIdOuRepresentante(id, nome, reputacao = 76) {
    const repId = id || `rep_${normalizarTexto(nome).replace(/\s+/g, "_")}`;
    return clubes.find(c => c.id === repId) || clubes.find(c => c.id === id) || { id: repId, nome, reputacao, ligaId: "int_rep", generico: true };
}

// 🆕 CLUBES GENÉRICOS: enquanto o save não tiver clubes reais suficientes
// classificados para uma competição continental, preenchemos as vagas que
// faltam com clubes "genéricos" (nome/reputação neutros). Isso evita
// chaveamentos incompletos ou capengos (ex: só 5-6 times reais formando um
// mata-mata minúsculo com jogos 0-0 esquisitos). Assim que existirem clubes
// reais suficientes classificados, eles automaticamente tomam essas vagas —
// isso aqui é só um "preenchimento" (nunca substitui um clube real por um genérico).
function criarClubeGenerico(compId, indice) {
    const repBase = 58 + Math.floor(Math.random() * 14); // 58-71: nível modesto, mas variado
    return {
        id: `generico_${compId}_${indice}`,
        nome: `Clube Genérico ${indice}`,
        logo: "",
        reputacao: repBase,
        ligaId: `int_generico_${compId}`,
        pais: "Genérico",
        generico: true
    };
}

// Completa uma lista de clubes até "alvo" times, usando clubes genéricos para
// as vagas que faltarem (nunca remove clubes reais já presentes). Se a lista
// já tiver mais que o alvo, apenas corta o excedente (mantendo os primeiros,
// que já vêm ordenados por classificação/reputação de quem chamou).
function completarComTimesGenericos(times, alvo, compId) {
    let lista = [...times];
    if (lista.length > alvo) return lista.slice(0, alvo);
    let n = 1;
    while (lista.length < alvo) {
        const generico = criarClubeGenerico(compId, n);
        if (!clubes.find(c => c.id === generico.id)) clubes.push(generico);
        lista.push(generico);
        n++;
    }
    return lista;
}

function registrarFinalEspecial(compId, times, fase = "Final", opcoes = {}) {
    if(!times || times.filter(Boolean).length < 2) return;
    gerarChaveamentoMataMata(compId, times.filter(Boolean), fase);
    Object.assign(copasEstado[compId], opcoes);
}

function inicializarSupercopasContinentaisEIntercontinental() {
    const champUcl = campeoesAnoAnterior.copas.uefa_cl;
    const champUel = campeoesAnoAnterior.copas.uefa_el;
    const champLib = campeoesAnoAnterior.copas.conmebol_lib;
    const champSul = campeoesAnoAnterior.copas.conmebol_sul;
    const champAfc = campeoesAnoAnterior.copas.afc_cla;
    const champConcacaf = campeoesAnoAnterior.copas.concacaf_clc;
    const champAfrica = campeoesAnoAnterior.ligas.nga_1;
    const champOceania = "ofc_champion";

    if(champUcl && champUel && !copasEstado.uefa_supercup) {
        registrarFinalEspecial("uefa_supercup", [clubes.find(c => c.id === champUcl), clubes.find(c => c.id === champUel)], "Final", {
            jogoUnico: true,
            neutro: true,
            descricaoCalendario: "Campeao da Champions League x campeao da Europa League"
        });
    }

    if(champLib && champSul && !copasEstado.conmebol_recopa) {
        registrarFinalEspecial("conmebol_recopa", [clubes.find(c => c.id === champLib), clubes.find(c => c.id === champSul)], "Final", {
            pernasFinal: 2,
            descricaoCalendario: "Campeao da Libertadores x campeao da Sul-Americana"
        });
    }

    if(champUcl && champLib && !copasEstado.intercontinental_cup) {
        const desafiante = [
            clubes.find(c => c.id === champLib),
            clubes.find(c => c.id === champAfc),
            clubes.find(c => c.id === champConcacaf),
            clubePorIdOuRepresentante(champAfrica || champOceania, "Vencedor Africa/Oceania", 74)
        ].filter(Boolean);
        const faseInicial = desafiante.length >= 4 ? "Playoff Intercontinental" : "Final";
        registrarFinalEspecial("intercontinental_cup", desafiante.length >= 2 ? desafiante : [clubes.find(c => c.id === champLib), clubes.find(c => c.id === champUcl)], faseInicial, {
            jogoUnico: true,
            neutro: true,
            cabecaFinalId: champUcl,
            descricaoCalendario: "Playoff dos campeoes continentais; campeao da Champions entra na final"
        });
    }
}

function inicializarCopasNacionaisEContinentais() {
    competicoes.filter(c => c.tipo === "copa").forEach(copa => {
        let paisCopa = obterPaisCompeticaoId(copa.id);
        let timesPais = clubes.filter(c => c.ligaId.startsWith(paisCopa));
        if(timesPais.length >= 8) gerarChaveamentoMataMata(copa.id, timesPais.slice(0, 32), timesPais.length >= 16 ? "Oitavos de Final" : "Quartos de Final");
    });

    competicoes.filter(c => c.tipo === "supercopa").forEach(sc => {
        let pais = obterPaisCompeticaoId(sc.id); 
        let idCampLiga = campeoesAnoAnterior.ligas[`${pais}_1`];
        let primaryCupId = competicoes.find(c => c.tipo.includes("copa") && c.tipo !== "supercopa" && obterPaisCompeticaoId(c.id) === pais)?.id;
        let idCampCopa = primaryCupId ? campeoesAnoAnterior.copas[primaryCupId] : null;

        if (idCampLiga && idCampCopa) {
            let t1 = clubes.find(c => c.id === idCampLiga); let t2 = clubes.find(c => c.id === idCampCopa);
            if (t1 && t1.id === idCampCopa) { let concorrentes = clubes.filter(c => c.ligaId.startsWith(pais) && c.id !== t1.id).sort((a,b) => b.reputacao - a.reputacao); t2 = concorrentes[0]; }
            if (t1 && t2) gerarChaveamentoMataMata(sc.id, [t1, t2], "Final");
        }
    });

    inicializarSupercopasContinentaisEIntercontinental();

    // ==========================================
    // 🏆 CAMPEONATOS ESTADUAIS (Brasil)
    // ==========================================
    // Os dados já existiam em competicoes.js (tipo:"estadual", campo estado)
    // e em times.js (cada clube brasileiro tem o seu estado), mas nunca
    // tinham sido ligados à lógica do jogo. Reaproveita o MESMO motor de
    // mata-mata das copas nacionais — cada estadual é só um "mata-mata"
    // cujo grupo de participantes são os clubes daquele estado específico.
    // NOTA: por simplicidade, corre ao longo da temporada como a Copa do
    // Brasil, em vez de ficar restrito a janeiro-abril como no futebol real.
    competicoes.filter(c => c.tipo === "estadual").forEach(estadual => {
        let timesEstado = clubes.filter(c => c.estado === estadual.estado);
        if (timesEstado.length < 4) return; // não há clubes suficientes deste estado carregados
        // Usa o maior "power of two" possível (16, 8 ou 4) para um chaveamento limpo.
        let tamanho = timesEstado.length >= 16 ? 16 : timesEstado.length >= 8 ? 8 : 4;
        timesEstado = [...timesEstado].sort((a, b) => b.reputacao - a.reputacao).slice(0, tamanho);
        const faseInicial = tamanho === 16 ? "Oitavas de Final" : tamanho === 8 ? "Quartas de Final" : "Semifinal";
        gerarChaveamentoMataMata(estadual.id, timesEstado, faseInicial);
    });

    for (const [compId, vagasId] of Object.entries(window.vagasContinentais)) {
        if (vagasId && vagasId.length > 0) {
            let timesContinental = vagasId.map(id => clubes.find(c=>c.id===id)).filter(Boolean);

            // 🆕 FORMATO SUÍÇO (Champions/Europa/Conference): precisa de 36 times
            // numa tabela única. Enquanto o save não tiver 36 clubes reais
            // classificados, completamos com clubes genéricos (ver
            // completarComTimesGenericos) só para o campeonato rodar corretamente
            // — assim que houver clubes reais suficientes, eles tomam as vagas.
            if (CLUBES_LIGA_SUICA.has(compId)) {
                timesContinental = completarComTimesGenericos(timesContinental, 36, compId);
                gerarFaseLigaSuica(compId, timesContinental);
                continue;
            }

            if (timesContinental.length < 8 && timesContinental.length > 0) {
                let prefix = compId.includes("afc") ? "ara" : (compId.includes("concacaf") ? "usa" : "br");
                let extra = clubes.filter(c => c.ligaId.startsWith(prefix) && !vagasId.includes(c.id));
                while(timesContinental.length < 8 && extra.length > 0) { timesContinental.push(extra.pop()); }
            }
            // 🆕 Em vez de truncar clubes reais para o múltiplo de 4 mais próximo
            // (o que descartava clubes já classificados), completa com clubes
            // genéricos até o próximo tamanho "redondo" de chaveamento (8/16/32).
            const alvoChaveamento = timesContinental.length > 16 ? 32 : timesContinental.length > 8 ? 16 : 8;
            timesContinental = completarComTimesGenericos(timesContinental, alvoChaveamento, compId);

            if(timesContinental.length >= 8) gerarFaseDeGrupos(compId, timesContinental); 
            else if (timesContinental.length >= 4) gerarChaveamentoMataMata(compId, timesContinental, "Semifinal");
            else if (timesContinental.length >= 2) gerarChaveamentoMataMata(compId, timesContinental, "Final");
        }
    }
}

function arquivarFase(compId) {
    let estado = copasEstado[compId]; if(!estado.historicoFases) estado.historicoFases = [];
    if(estado.tipo === "grupos") estado.historicoFases.push({ tipo: "grupos", fase: estado.fase, grupos: JSON.parse(JSON.stringify(estado.grupos)) });
    else if(estado.tipo === "liga_unica") estado.historicoFases.push({ tipo: "liga_unica", fase: estado.fase, tabela: JSON.parse(JSON.stringify(estado.tabela)) });
    else if(estado.tipo === "mata-mata") estado.historicoFases.push({ tipo: "mata-mata", fase: estado.fase, confrontos: JSON.parse(JSON.stringify(estado.confrontos)) });
}

// Agenda o confronto do jogador assim que uma competição continental sai da
// fase de grupos para o mata-mata. Sem isto, o primeiro confronto do jogador
// no mata-mata nunca aparece no calendário — nunca é jogado, o vencedor nunca
// é resolvido, e a competição trava nessa fase pelo resto da temporada.
function agendarConfrontoContinentalDoJogador(compId) {
    const estado = copasEstado[compId];
    if (!estado || !estado.confrontos) return;
    const confMeu = estado.confrontos.find(c => c.timeA.id === jogador.clubeId || c.timeB.id === jogador.clubeId);
    if (!confMeu) return;
    const adv = confMeu.timeA.id === jogador.clubeId ? confMeu.timeB : confMeu.timeA;
    const nomeTorneio = competicoes.find(c => c.id === compId)?.nome || "Copa";
    const novaFase = estado.fase;
    const pernas = numeroPernasConfronto(compId, estado, novaFase);
    const cfgCal = obterConfigCalendarioCompeticao(compId);
    adicionarEventoCalendario({ tipo: `${nomeTorneio} (${novaFase} - Ida)`, compId: compId, adversarioId: adv.id, isMataMata: true, perna: 1, fase: novaFase, isFinal: novaFase === "Final" }, obterSlotCompeticaoCalendario(compId, novaFase, 1), cfgCal.janela, cfgCal.modelo);
    if (pernas === 2) adicionarEventoCalendario({ tipo: `${nomeTorneio} (${novaFase} - Volta)`, compId: compId, adversarioId: adv.id, isMataMata: true, perna: 2, fase: novaFase }, obterSlotCompeticaoCalendario(compId, novaFase, 2), cfgCal.janela, cfgCal.modelo);
}

function avancarFaseMataMata(compId) {
    let estado = copasEstado[compId]; let vencedores = estado.confrontos.map(c => c.vencedorId).filter(Boolean);
    if(vencedores.length === 0) return;
    arquivarFase(compId);
    if(compId === "intercontinental_cup" && estado.cabecaFinalId && estado.fase !== "Final" && vencedores.length === 2) {
        const desafiantes = vencedores.map((id, idx) => clubePorIdOuRepresentante(id, `Desafiante ${idx + 1}`, 78));
        gerarChaveamentoMataMata(compId, desafiantes, "Final do Desafiante");
        copasEstado[compId].jogoUnico = true;
        copasEstado[compId].neutro = true;
        copasEstado[compId].cabecaFinalId = estado.cabecaFinalId;
        copasEstado[compId].descricaoCalendario = estado.descricaoCalendario;
        return;
    }
    if(compId === "intercontinental_cup" && estado.cabecaFinalId && estado.fase !== "Final" && vencedores.length === 1) {
        const desafiante = clubePorIdOuRepresentante(vencedores[0], "Desafiante Intercontinental", 78);
        const europeu = clubePorIdOuRepresentante(estado.cabecaFinalId, "Campeao da Champions League", 88);
        gerarChaveamentoMataMata(compId, [desafiante, europeu], "Final");
        copasEstado[compId].jogoUnico = true;
        copasEstado[compId].neutro = true;
        copasEstado[compId].descricaoCalendario = estado.descricaoCalendario;
        return;
    }
    // 🆕 FORMATO SUÍÇO: o Playoff (9º-24º da fase de liga) termina com 8
    // vencedores que precisam se juntar aos 8 classificados diretos (1º-8º)
    // para formar as Oitavas de Final com 16 times — sem isto, a lógica
    // genérica abaixo (que decide a fase só pela quantidade de vencedores)
    // interpretaria erroneamente 8 vencedores como "Quartos de Final",
    // pulando a fase de Oitavas e embaralhando quem realmente avançou.
    if (estado.fase === "Playoff" && estado.classificadosDiretos) {
        const classificadosPlayoff = vencedores.map(id => clubes.find(c => c.id === id) || clubePorIdOuRepresentante(id, "Classificado Playoff", 74));
        const times16 = [...estado.classificadosDiretos, ...classificadosPlayoff];
        delete estado.classificadosDiretos;
        gerarChaveamentoMataMata(compId, times16, "Oitavos de Final");

        let confMeu16 = copasEstado[compId].confrontos.find(c => c.timeA.id === jogador.clubeId || c.timeB.id === jogador.clubeId);
        if (confMeu16) {
            let adv16 = confMeu16.timeA.id === jogador.clubeId ? confMeu16.timeB : confMeu16.timeA;
            let nomeTorneio16 = competicoes.find(c => c.id === compId)?.nome || "Copa";
            let pernas16 = numeroPernasConfronto(compId, copasEstado[compId], "Oitavos de Final");
            const cfgCal16 = obterConfigCalendarioCompeticao(compId);
            adicionarEventoCalendario({ tipo: `${nomeTorneio16} (Oitavos de Final - Ida)`, compId: compId, adversarioId: adv16.id, isMataMata: true, perna: 1, fase: "Oitavos de Final" }, obterSlotCompeticaoCalendario(compId, "Oitavos de Final", 1), cfgCal16.janela, cfgCal16.modelo);
            if (pernas16 === 2) adicionarEventoCalendario({ tipo: `${nomeTorneio16} (Oitavos de Final - Volta)`, compId: compId, adversarioId: adv16.id, isMataMata: true, perna: 2, fase: "Oitavos de Final" }, obterSlotCompeticaoCalendario(compId, "Oitavos de Final", 2), cfgCal16.janela, cfgCal16.modelo);
        }
        return;
    }
    let times = vencedores.map(id => clubePorIdOuRepresentante(id, "Representante Continental", 76));
    let novaFase = "Próxima Fase";
    if(times.length >= 16) novaFase = "Oitavos de Final"; else if(times.length >= 8) novaFase = "Quartos de Final";
    else if(times.length >= 4) novaFase = "Semifinal"; else if(times.length === 2) novaFase = "Final";
    else if(times.length === 1) { estado.fase = "Campeão Definido"; estado.campeaoId = times[0]?.id; estado.confrontos = []; return; }
    
    gerarChaveamentoMataMata(compId, times, novaFase);

    let confMeu = copasEstado[compId].confrontos.find(c => c.timeA.id === jogador.clubeId || c.timeB.id === jogador.clubeId);
    if (confMeu) {
        let adv = confMeu.timeA.id === jogador.clubeId ? confMeu.timeB : confMeu.timeA;
        let nomeTorneio = competicoes.find(c => c.id === compId)?.nome || "Copa";
        let pernas = numeroPernasConfronto(compId, copasEstado[compId], novaFase);
        const cfgCal = obterConfigCalendarioCompeticao(compId);
        adicionarEventoCalendario({ tipo: `${nomeTorneio} (${novaFase} - Ida)`, compId: compId, adversarioId: adv.id, isMataMata: true, perna: 1, fase: novaFase, isFinal: novaFase === "Final" }, obterSlotCompeticaoCalendario(compId, novaFase, 1), cfgCal.janela, cfgCal.modelo);
        if (pernas === 2) adicionarEventoCalendario({ tipo: `${nomeTorneio} (${novaFase} - Volta)`, compId: compId, adversarioId: adv.id, isMataMata: true, perna: 2, fase: novaFase }, obterSlotCompeticaoCalendario(compId, novaFase, 2), cfgCal.janela, cfgCal.modelo);
    }
}

// ==========================================
// 📅 ENGENHARIA DE CALENDÁRIO E SIMULAÇÃO MUNDIAL
// ==========================================
function gerarAgenda() {
    let meuClube = clubes.find(c => c.id === jogador.clubeId); if (!meuClube) return;
    let pais = meuClube.ligaId.split("_")[0];
    const perfilPais = obterPerfilCalendarioPais(pais);
    let adversariosLiga = clubes.filter(c => c.ligaId === meuClube.ligaId && c.id !== meuClube.id);
    
    if (adversariosLiga.length % 2 !== 0 && adversariosLiga.length > 0) {
        adversariosLiga.push({ id: "folga_temp", nome: "Folga" });
    }

    agendaTemporada = [];
    inicializarTodosTorneiosTemporada();

    competicoes.filter(c => c.tipo === "supercopa" && obterPaisCompeticaoId(c.id) === pais).forEach(sc => {
        let scState = copasEstado[sc.id];
        if (scState && scState.confrontos && scState.confrontos.length > 0) {
            let conf = scState.confrontos[0];
            if (conf.timeA.id === meuClube.id || conf.timeB.id === meuClube.id) {
                let adv = conf.timeA.id === meuClube.id ? conf.timeB : conf.timeA;
                const cfgCal = obterConfigCalendarioCompeticao(sc.id);
                adicionarEventoCalendario({ tipo: `${sc.nome} (Final)`, compId: sc.id, adversarioId: adv.id, isMataMata: true, perna: 1, isFinal: true, fase: "Final" }, obterSlotCompeticaoCalendario(sc.id, "Final", 1), cfgCal.janela, cfgCal.modelo);
            }
        }
    });

    let nomeLiga = competicoes.find(c=>c.id===meuClube.ligaId)?.nome || "Liga Nacional";
    const jogosLiga = adversariosLiga.filter(a => a.id !== "folga_temp").length * 2;
    const slotsLiga = distribuirSlots(jogosLiga || 1, perfilPais.ligaInicio, perfilPais.ligaFim);
    let jogoLigaIdx = 0;
    
    // Inject bye weeks (folga) at strategic points in the season
    const byeWeekSlots = [Math.floor(jogosLiga * 0.25), Math.floor(jogosLiga * 0.5), Math.floor(jogosLiga * 0.75)];
    
    for(let r = 0; r < adversariosLiga.length * 2; r++) {
        let adv = adversariosLiga[r % adversariosLiga.length];
        
        // Check if this round should be a bye week
        if (byeWeekSlots.includes(jogoLigaIdx)) {
            adicionarEventoCalendario({ tipo: "Folga (Recuperação)", compId: "folga", adversarioId: null, isMataMata: false, fase: "Folga", isFolga: true }, slotsLiga[jogoLigaIdx] || perfilPais.ligaFim, "Folga", "europeu");
        } else if(adv.id !== "folga_temp") {
            // 🌐 MUNDO COMPARTILHADO: se o adversário desta rodada de liga é
            // exatamente o clube do amigo online, marca como confronto direto —
            // o jogo vai sincronizar essa partida em tempo real para os dois.
            const isConfrontoDireto = !!(window.connectionMode === 'online' && window.onlinePartnerClubeId && adv.id === window.onlinePartnerClubeId);
            adicionarEventoCalendario({ tipo: `${nomeLiga} (J${jogoLigaIdx + 1})`, compId: meuClube.ligaId, adversarioId: adv.id, isMataMata: false, fase: "Liga", isConfrontoDireto }, slotsLiga[jogoLigaIdx] || perfilPais.ligaFim, nomeLiga, perfilPais.modelo);
        }
        jogoLigaIdx++;
    }
    
    // 🏆 CAMPEONATOS ESTADUAIS (Brasil): usa o mesmo mecanismo genérico das
    // copas nacionais — o .find() abaixo já garante que só entra no calendário
    // a competição estadual em que o clube do jogador realmente está inscrito.
    competicoes.filter(c => (c.tipo.includes("copa") || c.tipo === "estadual") && obterPaisCompeticaoId(c.id) === pais && c.tipo !== "supercopa").forEach((copa, idx) => {
        let state = copasEstado[copa.id];
        if(state && state.confrontos) {
            let conf = state.confrontos.find(c => c.timeA.id === meuClube.id || c.timeB.id === meuClube.id);
            if(conf) {
                let adv = conf.timeA.id === meuClube.id ? conf.timeB : conf.timeA;
                const cfgCal = obterConfigCalendarioCompeticao(copa.id);
                adicionarEventoCalendario({ tipo: `${copa.nome} (${state.fase} - Ida)`, compId: copa.id, adversarioId: adv.id, isMataMata: true, perna: 1, fase: state.fase }, obterSlotCopaCalendario(copa.id, state.fase, 1), cfgCal.janela, cfgCal.modelo);
                if (state.fase !== "Final") adicionarEventoCalendario({ tipo: `${copa.nome} (${state.fase} - Volta)`, compId: copa.id, adversarioId: adv.id, isMataMata: true, perna: 2, fase: state.fase }, obterSlotCopaCalendario(copa.id, state.fase, 2), cfgCal.janela, cfgCal.modelo);
            }
        }
    });

    for (const [torneioId, estado] of Object.entries(copasEstado)) {
        const compTorneio = competicoes.find(c=>c.id===torneioId);
        if (compTorneio?.isContinental || ["continental", "supercopa_continental", "torneio_intercontinental"].includes(compTorneio?.tipo)) {
            if (estado.tipo === "liga_unica" && estado.fixtures) {
                let meusJogos = estado.fixtures.filter(f => f.home.id === meuClube.id || f.away.id === meuClube.id).sort((a,b) => a.rodada - b.rodada);
                let nome = competicoes.find(c => c.id === torneioId)?.nome || "Fase de Liga";
                meusJogos.forEach(f => {
                    const souMandante = f.home.id === meuClube.id;
                    const advId = souMandante ? f.away.id : f.home.id;
                    const cfgCal = obterConfigCalendarioCompeticao(torneioId);
                    adicionarEventoCalendario({ tipo: `${nome} (Fase de Liga J${f.rodada})`, compId: torneioId, fase: "Fase de Liga", adversarioId: advId, isMataMata: false, emCasa: souMandante, rodadaLigaSuica: f.rodada }, obterSlotContinentalCalendario(torneioId, "Fase de Liga", 1, f.rodada), cfgCal.janela, cfgCal.modelo);
                });
            } else if(estado.tipo === "grupos") {
                estado.grupos.forEach(grp => {
                    if(grp.equipas.find(e => e.id === meuClube.id)) {
                        let advs = grp.equipas.filter(e => e.id !== meuClube.id);
                        let nome = competicoes.find(c => c.id === torneioId)?.nome || "Continental";
                        for(let r=0; r<6; r++) {
                            const cfgCal = obterConfigCalendarioCompeticao(torneioId);
                            adicionarEventoCalendario({ tipo: `${nome} (Grupo J${r+1})`, compId: torneioId, fase: "Grupos", adversarioId: advs[r%advs.length].id, isMataMata: false }, obterSlotContinentalCalendario(torneioId, "Grupos", 1, r + 1), cfgCal.janela, cfgCal.modelo);
                        }
                    }
                });
            } else if(estado.tipo === "mata-mata" && estado.confrontos) {
                let conf = estado.confrontos.find(c => c.timeA.id === meuClube.id || c.timeB.id === meuClube.id);
                if(conf && !conf.vencedorId) { 
                    let adv = conf.timeA.id === meuClube.id ? conf.timeB : conf.timeA;
                    let nome = competicoes.find(c => c.id === torneioId)?.nome || "Continental";
                    const cfgCal = obterConfigCalendarioCompeticao(torneioId);
                    adicionarEventoCalendario({ tipo: `${nome} (${estado.fase} - Ida)`, compId: torneioId, adversarioId: adv.id, isMataMata: true, perna: 1, fase: estado.fase }, obterSlotContinentalCalendario(torneioId, estado.fase, 1), cfgCal.janela, cfgCal.modelo);
                    if (numeroPernasConfronto(torneioId, estado, estado.fase) === 2) adicionarEventoCalendario({ tipo: `${nome} (${estado.fase} - Volta)`, compId: torneioId, adversarioId: adv.id, isMataMata: true, perna: 2, fase: estado.fase }, obterSlotContinentalCalendario(torneioId, estado.fase, 2), cfgCal.janela, cfgCal.modelo);
                }
            }
        }
    }
    agendarJogosInternacionais();
    normalizarAgendaCalendario();
}

function simularRodadaMundial() {
    let compAtual = agendaTemporada[rodadaAtual - 1];
    verificarJanelaMeioAno();
    processarEventosAleatorios();
    if (jogador?.lifestyle && typeof window.awardWeeklyTrainingPoints === 'function') window.awardWeeklyTrainingPoints();
    // 🛡️ NOTA: processarJanelaSelecoes()/processarJanelaSelecoesBase() NÃO são
    // chamadas aqui de propósito — no modo online, esta função só corre no
    // "anfitrião do mundo" (ver simularRodadaMundialOnline), mas a convocação
    // para a seleção é algo PESSOAL de cada jogador. Por isso são chamadas
    // separadamente, sempre, por window.simularRodadaMundialOnline() abaixo.
    simularTorneiosInternacionais();
    
    for (const [ligaId, tabela] of Object.entries(tabelasLigas)) {
        let maxJogos = (tabela.length - 1) * 2;
        let timesParaSimular = tabela.filter(t =>
            t.jogos < maxJogos &&
            (ligaId !== competicoes.find(c=>c.id===compAtual?.compId)?.id || t.id !== jogador.clubeId) &&
            !(managerEstado?.ativo && t.id === managerEstado.clubeId)
        );
        timesParaSimular.sort(() => Math.random() - 0.5);
        for (let i = 0; i < timesParaSimular.length - 1; i += 2) {
            let tC = timesParaSimular[i]; let tV = timesParaSimular[i+1];
            let cC = clubes.find(c => c.id === tC.id); let cV = clubes.find(c => c.id === tV.id);
            let diff = ((cC?.reputacao || 60) - (cV?.reputacao || 60)) / 20;
            let gC = Math.random() + diff + 0.1 > 0.5 ? Math.floor(Math.random()*4) : 0; 
            let gV = Math.random() - diff > 0.6 ? Math.floor(Math.random()*3) : 0;
            
            tC.jogos++; tV.jogos++; tC.gols+=gC; tC.golsSofridos+=gV; tV.gols+=gV; tV.golsSofridos+=gC;
            if(gC>gV){ tC.pontos+=3; tC.vitorias=(tC.vitorias||0)+1; tV.derrotas=(tV.derrotas||0)+1; } 
            else if(gV>gC){ tV.pontos+=3; tV.vitorias=(tV.vitorias||0)+1; tC.derrotas=(tC.derrotas||0)+1; } 
            else { tC.pontos+=1; tV.pontos+=1; tC.empates=(tC.empates||0)+1; tV.empates=(tV.empates||0)+1; }
            atribuirEstatisticaNPC(tC.id, gC, ligaId, gV); atribuirEstatisticaNPC(tV.id, gV, ligaId, gC);
        }
    }

    for (const [compId, estado] of Object.entries(copasEstado)) {
        if (estado.tipo === "grupos" && estado.rodadaAtual <= 6) {
            // FIX: Only simulate if player has an active fixture in this cup
            const hasPlayerFixture = agendaTemporada.some(a =>
                a.compId === compId &&
                (a.adversarioId === jogador?.clubeId || a.mandanteId === jogador?.clubeId)
            );

            // CRITICAL FIX: Only simulate if player has fixture or with strict conditions
            // Use the same logic as international tournaments to prevent round skipping
            const isContinentalCup = compId.includes("libertadores") || 
                                    compId.includes("champions") ||
                                    compId.includes("uefa_el") ||
                                    compId.includes("conmebol_sul");

            const shouldAdvance = hasPlayerFixture || 
                                 (isContinentalCup ? rodadaAtual % 4 === 0 : Math.random() < 0.25);

            if (shouldAdvance) {
                estado.grupos.forEach(grp => {
                    let tSim = grp.equipas.filter(e => e.id !== jogador.clubeId); tSim.sort(() => Math.random() - 0.5);
                    for(let i=0; i<tSim.length-1; i+=2) {
                        let tA = tSim[i]; let tB = tSim[i+1];
                        let cA = clubes.find(c=>c.id===tA.id); let cB = clubes.find(c=>c.id===tB.id);
                        let df = ((cA?.reputacao||60) - (cB?.reputacao||60))/20;
                        let gA = Math.random()+df+0.1>0.6?Math.floor(Math.random()*3)+1:0; let gB = Math.random()-df>0.6?Math.floor(Math.random()*3)+1:0;
                        tA.j++; tB.j++; tA.gf+=gA; tA.gs+=gB; tB.gf+=gB; tB.gs+=gA;
                        if(gA>gB) tA.pts+=3; else if(gB>gA) tB.pts+=3; else { tA.pts+=1; tB.pts+=1; }
                        atribuirEstatisticaNPC(tA.id, gA, compId, gB); atribuirEstatisticaNPC(tB.id, gB, compId, gA);
                    }
                });
                estado.rodadaAtual++;
                if(estado.rodadaAtual > 6) {
                    let classificados = [];
                    estado.grupos.forEach(grp => {
                        grp.equipas.sort((a,b) => b.pts - a.pts || (b.gf-b.gs) - (a.gf-a.gs));
                        classificados.push(clubes.find(c=>c.id===grp.equipas[0].id), clubes.find(c=>c.id===grp.equipas[1].id));
                    });
                    arquivarFase(compId); gerarChaveamentoMataMata(compId, classificados.filter(Boolean), classificados.length === 16 ? "Oitavos de Final" : "Quartos de Final");
                    agendarConfrontoContinentalDoJogador(compId);
                }
            }
        } else if (estado.tipo === "liga_unica" && estado.fixtures && estado.rodadaAtual <= 8) {
            // Mesmo princípio da correção acima: só considera que "tenho jogo
            // pendente" nesta rodada se o MEU jogo desta rodada específica ainda
            // não foi resolvido — nunca trava esperando uma rodada que já passou.
            const jogosRodada = estado.fixtures.filter(f => f.rodada === estado.rodadaAtual);
            const meuJogoPendente = jogosRodada.some(f => (f.home.id === jogador.clubeId || f.away.id === jogador.clubeId) && f.golsHome === undefined);
            const simularHoje = (!compAtual) || (compAtual.compId === compId) || (!meuJogoPendente && rodadaAtual % 3 === 0);

            if (simularHoje) {
                jogosRodada.forEach(f => {
                    if (f.home.id === jogador.clubeId || f.away.id === jogador.clubeId) return; // meu jogo é resolvido quando eu jogo, na tela de partida
                    if (f.golsHome !== undefined) return;
                    const cA = clubes.find(c=>c.id===f.home.id); const cB = clubes.find(c=>c.id===f.away.id);
                    let df = ((cA?.reputacao||60) - (cB?.reputacao||60))/20;
                    let gA = Math.random()+df+0.1>0.5?Math.floor(Math.random()*3):0;
                    let gB = Math.random()-df>0.5?Math.floor(Math.random()*3):0;
                    f.golsHome = gA; f.golsAway = gB;
                    const tH = estado.tabela.find(t=>t.id===f.home.id); const tA = estado.tabela.find(t=>t.id===f.away.id);
                    if (tH) { tH.j++; tH.gf+=gA; tH.gs+=gB; if(gA>gB) tH.pts+=3; else if(gA===gB) tH.pts+=1; }
                    if (tA) { tA.j++; tA.gf+=gB; tA.gs+=gA; if(gB>gA) tA.pts+=3; else if(gA===gB) tA.pts+=1; }
                    atribuirEstatisticaNPC(f.home.id, gA, compId, gB); atribuirEstatisticaNPC(f.away.id, gB, compId, gA);
                });
                if (jogosRodada.every(f => f.golsHome !== undefined)) {
                    estado.rodadaAtual++;
                    if (estado.rodadaAtual > 8) processarFimLigaSuica(compId);
                }
            }
        } else if (estado.tipo === "mata-mata" && estado.confrontos) {
            // sem checar se já tinha vencedorId. Resultado: assim que eu jogava a
            // minha ida/volta e o meu confronto ficava resolvido, o meu confronto
            // continuava "presente" no array — então temJogoMeu ficava true PARA
            // SEMPRE naquela fase, e os OUTROS confrontos (só entre times da IA)
            // nunca mais eram simulados (porque só simulavam quando compAtual
            // fosse essa competição, ou quando eu não tivesse jogo nela). A fase
            // ficava travada, sem nunca ter todos os vencedorId definidos, então
            // avancarFaseMataMata() nunca era chamado — e a próxima fase (ex:
            // Quartas) só era "resolvida" à força, com placares aleatórios, no
            // forcarFimDeCopas() lá no fim da temporada. Isso é exatamente o bug
            // relatado: oitavas acontecem normalmente, mas quartas em diante ficam
            // travadas e os adversários que aparecem depois não batem com quem
            // realmente avançou.
            let temJogoMeu = estado.confrontos.some(c => (c.timeA.id === jogador.clubeId || c.timeB.id === jogador.clubeId) && !c.vencedorId);
            let simularHoje = (!compAtual) || (compAtual.compId === compId) || (!temJogoMeu && rodadaAtual % 3 === 0);

            if (simularHoje) {
                estado.confrontos.forEach(conf => {
                    if(conf.timeA.id !== jogador.clubeId && conf.timeB.id !== jogador.clubeId && !conf.vencedorId) {
                        let cC = clubes.find(c=>c.id===conf.timeA.id); let cV = clubes.find(c=>c.id===conf.timeB.id);
                        let df = ((cC?.reputacao||60) - (cV?.reputacao||60))/20;
                        let gC = Math.random()+df>0.5?Math.floor(Math.random()*3):0; let gV = Math.random()-df>0.5?Math.floor(Math.random()*2):0;
                        
                        if(conf.golsAIda === null) { 
                            conf.golsAIda = gC; conf.golsBIda = gV; 
                            const fA = clubes.find(c=>c.id===conf.timeA.id)?.reputacao || 70;
                            const fB = clubes.find(c=>c.id===conf.timeB.id)?.reputacao || 70;
                            const res = resolverVencedorMataMata(conf.timeA.id, conf.timeB.id, gC, gV, fA, fB);
                            if (estado.jogoUnico || ((estado.fase === "Final" || estado.fase.includes("Supercopa")) && estado.pernasFinal !== 2)) { conf.vencedorId = res.vencedorId; conf.penaltis = res.penaltis; }
                        } else if (conf.golsAVolta === null) { 
                            conf.golsAVolta = gC; conf.golsBVolta = gV; 
                            let agA = conf.golsAIda + conf.golsAVolta; let agB = conf.golsBIda + conf.golsBVolta;
                            const fA = clubes.find(c=>c.id===conf.timeA.id)?.reputacao || 70;
                            const fB = clubes.find(c=>c.id===conf.timeB.id)?.reputacao || 70;
                            const res = resolverVencedorMataMata(conf.timeA.id, conf.timeB.id, agA, agB, fA, fB);
                            conf.vencedorId = res.vencedorId; conf.penaltis = res.penaltis;
                        }
                        atribuirEstatisticaNPC(conf.timeA.id, gC, compId, gV); atribuirEstatisticaNPC(conf.timeB.id, gV, compId, gC);
                    }
                });
                if(estado.confrontos.every(c => c.vencedorId) && estado.confrontos.length >= 1) avancarFaseMataMata(compId);
            }
        }
    }
}

// ==========================================
// 🌐 MUNDO REALMENTE COMPARTILHADO — SIMULAÇÃO ÚNICA
// ==========================================
// No modo online, a rodada mundial (tabelas de todas as ligas + copas) só
// pode ser calculada por UM dos dois jogadores (o "anfitrião do mundo",
// decidido automaticamente) e depois partilhada — senão cada um vê ligas
// diferentes (ex: "no meu Bayern lidera, no teu é o Borussia"). Esta função
// substitui as chamadas diretas a simularRodadaMundial() nos pontos em que
// a rodada avança.
window.simularRodadaMundialOnline = async function() {
    // 🧑 PESSOAL: a convocação para a seleção (principal e de base) é sempre
    // processada no MEU cliente, mesmo quando não sou o "anfitrião do mundo"
    // (que só calcula as tabelas/copas partilhadas). Sem isto, quem não fosse
    // anfitrião nunca seria convocado para a seleção enquanto jogasse online.
    processarJanelaSelecoes();
    processarJanelaSelecoesBase();

    if (window.connectionMode !== 'online' || !window.firebaseIntegration) {
        simularRodadaMundial();
        return;
    }

    const souHost = window.firebaseIntegration.souHostDoMundo();
    if (souHost) {
        simularRodadaMundial();
        window.firebaseIntegration.transmitirEstadoMundial(rodadaAtual, anoAtual, {
            tabelasLigas: JSON.parse(JSON.stringify(tabelasLigas)),
            copasEstado: JSON.parse(JSON.stringify(copasEstado))
        });
    } else {
        const estado = await window.firebaseIntegration.obterEstadoMundial(rodadaAtual, anoAtual);
        if (estado && estado.tabelasLigas) {
            for (let key in tabelasLigas) delete tabelasLigas[key];
            Object.assign(tabelasLigas, estado.tabelasLigas);
            for (let key in copasEstado) delete copasEstado[key];
            Object.assign(copasEstado, estado.copasEstado || {});
        } else {
            // Falha de rede/timeout: melhor simular localmente do que travar o jogador para sempre.
            simularRodadaMundial();
        }
    }
};

// ==========================================
// 🚨 VIRADA DE TEMPORADA E FIM DE COPAS
// ==========================================
function forcarFimDeCopas() {
    let loopSafety = 100;
    while(loopSafety > 0) {
        let pendente = false;
        for (const [compId, estado] of Object.entries(copasEstado)) {
            if (estado.tipo === "liga_unica" && estado.fixtures) {
                pendente = true;
                // Preenche à força qualquer jogo restante (incluindo o meu, se eu não
                // tiver conseguido jogar todas as 8 rodadas) só para a fase de liga
                // conseguir fechar e o playoff/oitavas serem gerados corretamente.
                estado.fixtures.forEach(f => {
                    if (f.golsHome === undefined) {
                        const gA = Math.floor(Math.random()*3); const gB = Math.floor(Math.random()*2);
                        f.golsHome = gA; f.golsAway = gB;
                        const tH = estado.tabela.find(t=>t.id===f.home.id); const tA = estado.tabela.find(t=>t.id===f.away.id);
                        if (tH) { tH.j++; tH.gf+=gA; tH.gs+=gB; if(gA>gB) tH.pts+=3; else if(gA===gB) tH.pts+=1; }
                        if (tA) { tA.j++; tA.gf+=gB; tA.gs+=gA; if(gB>gA) tA.pts+=3; else if(gA===gB) tA.pts+=1; }
                    }
                });
                processarFimLigaSuica(compId);
                continue;
            }
            if (estado.tipo === "grupos" && estado.grupos && estado.fase !== "Campeão Definido") {
                pendente = true;
                let classificados = [];
                estado.grupos.forEach(grp => {
                    grp.equipas.sort((a,b) => b.pts - a.pts || (b.gf-b.gs) - (a.gf-a.gs));
                    classificados.push(clubes.find(c=>c.id===grp.equipas[0]?.id), clubes.find(c=>c.id===grp.equipas[1]?.id));
                });
                arquivarFase(compId);
                gerarChaveamentoMataMata(compId, classificados.filter(Boolean), classificados.length >= 16 ? "Oitavos de Final" : "Quartos de Final");
                agendarConfrontoContinentalDoJogador(compId);
                continue;
            }
            if (estado.fase !== "Campeão Definido" && estado.confrontos && estado.confrontos.length > 0) {
                pendente = true;
                estado.confrontos.forEach(conf => {
                    if(!conf.vencedorId) {
                        let gC = Math.floor(Math.random()*3); let gV = Math.floor(Math.random()*2);
                        const fA = clubes.find(c=>c.id===conf.timeA.id)?.reputacao || 70;
                        const fB = clubes.find(c=>c.id===conf.timeB.id)?.reputacao || 70;
                        if(conf.golsAIda === null) { conf.golsAIda = gC; conf.golsBIda = gV;
                        if (estado.jogoUnico || (estado.fase === "Final" && estado.pernasFinal !== 2)) { const res = resolverVencedorMataMata(conf.timeA.id, conf.timeB.id, gC, gV, fA, fB); conf.vencedorId = res.vencedorId; conf.penaltis = res.penaltis; }
                        } else if (conf.golsAVolta === null) { conf.golsAVolta = gC; conf.golsBVolta = gV;
                            let agA = conf.golsAIda + conf.golsAVolta; let agB = conf.golsBIda + conf.golsBVolta;
                            const res = resolverVencedorMataMata(conf.timeA.id, conf.timeB.id, agA, agB, fA, fB);
                            conf.vencedorId = res.vencedorId; conf.penaltis = res.penaltis;
                        }
                    }
                });
                if(estado.confrontos.every(c => c.vencedorId)) avancarFaseMataMata(compId);
            }
        }
        if(!pendente) break;
        loopSafety--;
    }
}


window.avancarTemporada = function() {
    try {
        forcarFimDeCopas();

        if(!jogador.estatisticasAtuais.assistencias) jogador.estatisticasAtuais.assistencias = 0;
    if(!jogador.estatisticasAtuais.defesas) jogador.estatisticasAtuais.defesas = 0;
        jogador.historicoCarreira.unshift({ ano: anoAtual, clube: clubes.find(c=>c.id===jogador.clubeId)?.nome || "Livre", jogos: jogador.estatisticasAtuais.jogos, gols: jogador.estatisticasAtuais.gols, assistencias: jogador.estatisticasAtuais.assistencias, trofeus: "-" });
        if(jogador.clubeOrigemEmprestimo && jogador.emprestadoAte <= anoAtual) {
            let origem = clubes.find(c => c.id === jogador.clubeOrigemEmprestimo);
            registrarNoticia("Fim de empréstimo", `${jogador.nome} regressou ao ${origem?.nome || "clube de origem"} após o fim da temporada.`, "Mercado");
            jogador.clubeId = jogador.clubeOrigemEmprestimo; delete jogador.clubeOrigemEmprestimo; delete jogador.emprestadoAte;
            jogador.jogosNoClubeAtual = 0; jogador.tecnicoConhecido = null; jogador.statusEscalacaoAnterior = null;
        }
        jogador.idade = (jogador.idade || 17) + 1;
        {
            // 📈📉 Delta anual de OVR por idade — igual ao critério de antes,
            // só que agora aplicado através de evoluirAtributosEGeral() para
            // também mexer nos atributos individuais, não só no número do OVR.
            let deltaJogador = 0;
            if(jogador.idade <= 22) deltaJogador += Math.floor(Math.random() * 2) + 1;
            else if(jogador.idade <= 27 && Math.random() > 0.55) deltaJogador += 1;
            if(jogador.idade >= 32 && jogador.idade <= 35 && Math.random() > 0.55) deltaJogador -= 1;
            else if(jogador.idade >= 36) deltaJogador -= Math.floor(Math.random() * 2) + 1;
            evoluirAtributosEGeral(jogador, deltaJogador);
        }

        // Clear rejected clubs at start of new season (fresh start)
        if(jogador.clubesRejeitados) jogador.clubesRejeitados = [];
        
        // Increment years at current club
        jogador.anoNoClubeAtual = (jogador.anoNoClubeAtual || 0) + 1;

        jogadoresIA.forEach(j => {
            if(j.aposentado) return;
            if(!j.historicoCarreira) j.historicoCarreira = [];
            j.historicoCarreira.unshift({ ano: anoAtual, clube: clubes.find(c=>c.id===j.clubeId)?.nome || "Livre", jogos: j.statsTemporada?.jogos || 0, gols: j.statsTemporada?.gols || 0, assistencias: j.statsTemporada?.assistencias || 0, trofeus: "-" });
            if(j.clubeOrigemEmprestimo && j.emprestadoAte <= anoAtual) {
                j.clubeId = j.clubeOrigemEmprestimo; delete j.clubeOrigemEmprestimo; delete j.emprestadoAte;
            }
            j.idade = (j.idade || 20) + 1;
            {
                let deltaJ = 0;
                if (j.idade <= 22) deltaJ += Math.floor(Math.random() * 3) + 1; else if (j.idade <= 25 && Math.random() > 0.6) deltaJ += 1;
                if (j.idade >= 31 && j.idade <= 34) deltaJ -= Math.floor(Math.random() * 2); else if (j.idade >= 35) deltaJ -= Math.floor(Math.random() * 3) + 1;
                // 🆕 Desacelera perto do teto de potencial — sem isto, um jovem
                // "mediano" continuava subindo até virar craque só por causa da
                // idade, sem nenhum limite pessoal de talento.
                if (deltaJ > 0) {
                    const potencial = obterOuGerarPotencial(j);
                    const margem = potencial - (j.geral || 60);
                    deltaJ = margem <= 0 ? 0 : Math.min(deltaJ, Math.max(1, Math.ceil(margem * 0.5)));
                }
                evoluirAtributosEGeral(j, deltaJ);
            }
            j.valorMercadoNum = calcularValorMercadoJogador(j);
            if (Math.random() < (j.idade >= 39 ? 1.0 : (j.idade >= 36 ? 0.45 : 0))) { j.aposentado = true; j.clubeId = "aposentado"; j.valorMercadoNum = 0; j.contrato = 0; }
        });

        premiosIndividuaisPendentes.forEach(premio => {
            let vencedor = premio.playerId === "player" ? jogador : jogadoresIA.find(j => j.id === premio.playerId);
            if(!vencedor || !vencedor.historicoCarreira?.[0]) return;
            let hist = vencedor.historicoCarreira[0];
            hist.trofeus = hist.trofeus === "-" ? premio.nome : hist.trofeus + ", " + premio.nome;
            vencedor.pontosPremio = (vencedor.pontosPremio || 0) + (premio.pontos || 15);
        });
        premiosIndividuaisPendentes = [];

        // Os campeões e os pontos de título desta temporada já foram apurados mais
        // cedo (ver apurarCampeoesTemporada, chamada antes da Gala) para que a Bola
        // de Ouro reflita as taças ganhas NESTA mesma época. Aqui só escrevemos o
        // nome do troféu no histórico de carreira, que só passou a existir agora.
        titulosClubesPendentes.forEach(t => {
            let vencedor = t.playerId === "player" ? jogador : jogadoresIA.find(j => j.id === t.playerId);
            if(!vencedor || !vencedor.historicoCarreira?.[0]) return;
            let hist = vencedor.historicoCarreira[0];
            hist.trofeus = hist.trofeus === "-" ? t.nomeTrofeu : hist.trofeus + ", " + t.nomeTrofeu;
        });
        titulosClubesPendentes = [];

        let descidas = [];
        let subidas = [];

        for (const [ligaId, tabela] of Object.entries(tabelasLigas)) {
            let tabOrd = [...tabela].sort((a,b) => b.pontos - a.pontos || ((b.gols||0) - (b.golsSofridos||0)) - ((a.gols||0) - (a.golsSofridos||0)) || (b.gols||0) - (a.gols||0));

            // ==========================================
            // 🔄 NOVA LÓGICA DINÂMICA DE ASCENSÃO E QUEDA
            // ==========================================
            let matchDiv = ligaId.match(/_(\d+)$/); // Captura o número da divisão no fim do ID (ex: 1, 2, 3, 4)

            if (matchDiv) {
                let divAtual = parseInt(matchDiv[1]);

                // 📉 REGRA DE REBAIXAMENTO (Cair)
                let proximaDivId = ligaId.replace(`_${divAtual}`, `_${divAtual + 1}`);
                if (tabelasLigas[proximaDivId] && tabOrd.length > 4) {
                    descidas.push({ from: ligaId, to: proximaDivId, teams: tabOrd.slice(-3).map(t => t.id) });
                }

                // 📈 REGRA DE ACESSO (Subir)
                let divAnteriorId = ligaId.replace(`_${divAtual}`, `_${divAtual - 1}`);
                if (divAtual > 1 && tabelasLigas[divAnteriorId] && tabOrd.length > 3) {
                    subidas.push({ from: ligaId, to: divAnteriorId, teams: tabOrd.slice(0, 3).map(t => t.id) });
                }
            }
        }

        // Executa as transferências de liga de forma definitiva
        descidas.forEach(d => d.teams.forEach(tId => { let c = clubes.find(x=>x.id===tId); if(c) c.ligaId = d.to; }));
        subidas.forEach(s => s.teams.forEach(tId => { let c = clubes.find(x=>x.id===tId); if(c) c.ligaId = s.to; }));

        // Check if all players are ready before advancing season (online mode)
        if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode()) {
            window.firebaseIntegration.canAdvanceToNextSeason().then(canAdvance => {
                if (!canAdvance) {
                    mostrarToast("Aguardando Amigo", "Seu amigo ainda não terminou a temporada atual.", "warning");
                    document.getElementById("btnJogarHub").disabled = false;
                    return;
                }
                // Proceed with season advancement
                advanceSeasonInternal();
            });
            return; // Exit early, will be called by the promise
        }

        advanceSeasonInternal();
    } catch (e) {
        console.error("Erro ao avançar temporada:", e);
        mostrarToast("Erro Crítico", "Ocorreu um erro ao virar a temporada.", "danger");
    }
};

function advanceSeasonInternal() {
    anoAtual++;
    rodadaAtual = 1;
    agendaTemporada = [];
    copasEstado = {};
    selecoesEstado.torneios = {};
    selecoesEstado.premiosLigaAno = {};
    janelaMeioAnoProcessada = false;
    
    jogador.energia = 100;
    jogador.melhorAtuacao = { gols: 0, assistencias: 0, nota: 0, adversario: "", rodada: 0 };
    resetarStatsNovaTemporada();
    gerarJovensGenericos(34);

    inicializarTabelas();
    processarMercadoTransferencias("principal");
    inicializarCopasNacionaisEContinentais();
    gerarAgenda();

    window.salvarJogo();
    atualizarHub();

    document.getElementById("btnJogarHub").disabled = false;
    mostrarToast("Ano Novo", `Bem-vindo à Temporada ${anoAtual}!`, "success");
}

// Apura os campeões de ligas, copas nacionais, torneios continentais, supercopas
// e do torneio intercontinental — e já credita os pontos de título (ver PONTOS_TITULO)
// a quem os conquistou NESTA temporada. É chamada a partir de processarFimTemporada(),
// ou seja, antes da Gala — assim quem foi campeão da Champions em maio concorre à
// Bola de Ouro de junho com esse troféu já valendo, e não só no ano seguinte.
function apurarCampeoesTemporada() {
    window.vagasContinentais = { uefa_cl: [], uefa_el: [], uefa_col: [], conmebol_lib: [], conmebol_sul: [], concacaf_clc: [], afc_cla: [] };
    campeoesAnoAnterior = { ligas: {}, copas: {} };
    titulosClubesPendentes = [];

    for (const [ligaId, tabela] of Object.entries(tabelasLigas)) {
        let tabOrd = [...tabela].sort((a,b) => b.pontos - a.pontos || ((b.gols||0) - (b.golsSofridos||0)) - ((a.gols||0) - (a.golsSofridos||0)) || (b.gols||0) - (a.gols||0));

        if(tabOrd[0]) {
            let campeaoClube = clubes.find(c => c.id === tabOrd[0].id);
            let comp = competicoes.find(c => c.id === ligaId);
            if(campeaoClube) {
                campeoesAnoAnterior.ligas[ligaId] = campeaoClube.id;
                if(!campeaoClube.historicoTitulos) campeaoClube.historicoTitulos = [];
                campeaoClube.historicoTitulos.unshift(`${anoAtual} - ${comp?.nome || ligaId}`);

                // 📰 Antes, ganhar uma liga não gerava NENHUMA notícia. Agora: se
                // for o TEU clube, é manchete; ligas de topo de outros países
                // rendem uma nota para dar variedade ao feed.
                if (campeaoClube.id === jogador.clubeId) {
                    registrarNoticia(`${campeaoClube.nome} é CAMPEÃO!`, `${campeaoClube.nome} conquistou a ${comp?.nome || ligaId} de ${anoAtual}, com ${jogador.nome} no elenco campeão!`, "Partida", { nome: comp?.nome || ligaId }, "trofeu", true);
                } else if (comp?.div === 1) {
                    registrarNoticia(`${campeaoClube.nome} conquista a ${comp?.nome}`, `${campeaoClube.nome} garantiu o título da ${comp?.nome} na temporada de ${anoAtual}.`, "Partida", { nome: comp?.nome || ligaId }, "trofeu");
                }

                const pontosTitulo = (comp?.div === 1) ? PONTOS_TITULO.ligaPrincipal : PONTOS_TITULO.ligaSecundaria;
                let elencoCamp = getElencoClube(campeaoClube.id);
                elencoCamp.forEach(j => {
                    const alvo = creditarPontosPremio(j, pontosTitulo);
                    titulosClubesPendentes.push({ playerId: alvo === jogador ? "player" : alvo.id, nomeTrofeu: comp?.nome || ligaId });
                });
            }
        }

        if(ligaId.endsWith("_1") || !ligaId.includes("_")) {
            let rV = CONFIG_VAGAS_CONTINENTAIS[ligaId] || (ligaId.includes("br")||ligaId.includes("arg") ? CONFIG_VAGAS_CONTINENTAIS["default_conmebol"] : (ligaId.includes("ara") ? CONFIG_VAGAS_CONTINENTAIS["default_asia"] : (ligaId.includes("usa") ? CONFIG_VAGAS_CONTINENTAIS["default_concacaf"] : CONFIG_VAGAS_CONTINENTAIS["default_uefa"])));
            if (rV.cl !== undefined) { window.vagasContinentais.uefa_cl.push(...tabOrd.slice(0, rV.cl).map(t=>t.id)); window.vagasContinentais.uefa_el.push(...tabOrd.slice(rV.cl, rV.cl + rV.el).map(t=>t.id)); window.vagasContinentais.uefa_col.push(...tabOrd.slice(rV.cl + rV.el, rV.cl + rV.el + rV.col).map(t=>t.id)); }
            else if (rV.lib !== undefined) { window.vagasContinentais.conmebol_lib.push(...tabOrd.slice(0, rV.lib).map(t=>t.id)); window.vagasContinentais.conmebol_sul.push(...tabOrd.slice(rV.lib, rV.lib + rV.sul).map(t=>t.id)); }
            else if (rV.cla !== undefined) { window.vagasContinentais.afc_cla.push(...tabOrd.slice(0, rV.cla).map(t=>t.id)); }
            else if (rV.clc !== undefined) { window.vagasContinentais.concacaf_clc.push(...tabOrd.slice(0, rV.clc).map(t=>t.id)); }
        }
    }

    for (const [compId, estado] of Object.entries(copasEstado)) {
        let comp = competicoes.find(c => c.id === compId); if(!comp) continue;
        let campeaoCopaId = estado.campeaoId || estado.confrontos?.[0]?.vencedorId;
        if(campeaoCopaId) {
            let campeaoClube = clubes.find(c=>c.id===campeaoCopaId);
            campeoesAnoAnterior.copas[compId] = campeaoCopaId;
            if(campeaoClube) {
                if(!campeaoClube.historicoTitulos) campeaoClube.historicoTitulos = [];
                campeaoClube.historicoTitulos.unshift(`${anoAtual} - ${comp.nome}`);

                if (campeaoClube.id === jogador.clubeId) {
                    registrarNoticia(`${campeaoClube.nome} LEVANTA A TAÇA!`, `${campeaoClube.nome} venceu a ${comp.nome} de ${anoAtual}, com ${jogador.nome} no elenco campeão!`, "Partida", { nome: comp.nome }, "trofeu", true);
                } else {
                    registrarNoticia(`${campeaoClube.nome} conquista a ${comp.nome}`, `${campeaoClube.nome} venceu a final e é o novo campeão da ${comp.nome} de ${anoAtual}.`, "Partida", { nome: comp.nome }, "trofeu");
                }

                let elencoCamp = getElencoClube(campeaoClube.id);
                const pontosTitulo = pontosTituloClube(comp);
                elencoCamp.forEach(j => {
                    const alvo = creditarPontosPremio(j, pontosTitulo);
                    titulosClubesPendentes.push({ playerId: alvo === jogador ? "player" : alvo.id, nomeTrofeu: comp.nome });
                });
            }
        }
    }

    // 🆕 O campeão da Champions League E o campeão da Europa League garantem
    // vaga direta na Champions League da temporada seguinte, mesmo que não
    // tenham terminado a liga doméstica numa posição classificável — reflete
    // a regra real da UEFA (título garante entrada independente da posição).
    [campeoesAnoAnterior.copas.uefa_cl, campeoesAnoAnterior.copas.uefa_el].forEach(campeaoId => {
        if (campeaoId && !window.vagasContinentais.uefa_cl.includes(campeaoId)) {
            window.vagasContinentais.uefa_cl.push(campeaoId);
        }
    });
}

function processarFimTemporada() {
    forcarFimDeCopas();
    apurarCampeoesTemporada();

    try {
        // ==========================================
        // 🏅 CALCULO REALISTA DA BOLA DE OURO
        // Compara cada jogador só com outros da mesma posição, pesa gols/assistências
        // pela importância da competição e soma os pontos de título da temporada.
        // ==========================================
        let todos = [jogador, ...jogadoresIA.filter(x=>!x.aposentado)].map(p => {
            const g = p.estatisticasAtuais ? p.estatisticasAtuais.gols : (p.statsTemporada?.gols || 0);
            const a = p.estatisticasAtuais ? p.estatisticasAtuais.assistencias : (p.statsTemporada?.assistencias || 0);
            const { golsP, assistP, jogosTotais } = statsPonderadosTemporada(p, g, a);
            const liga = obterClubeJogador(p)?.ligaId;
            const grupo = grupoPosicaoPremio(p.posicao);
            const media = Math.max(4.0, Math.min(9.8, (p.geral || 60) / 14 + (jogosTotais > 0 ? ((golsP * (grupo === "defensor" || grupo === "goleiro" ? 0.4 : 1.0)) + assistP * 0.7) / jogosTotais : 0)));
            const perfilDef = (grupo === "defensor" || grupo === "goleiro") ? estimarPerfilDefensivo(p, liga, jogosTotais) : null;
            return { p, g, a, golsP, assistP, jogosTotais, ovr: p.geral, idade: p.idade, pos: p.posicao, grupo, media, perfilDef, ligaId: liga };
        });

        // Métrica bruta específica de cada bloco de posição (ver pedido: atacantes
        // são julgados por gols/assistências, defensores por solidez defensiva, etc.)
        todos.forEach(x => {
            if(x.grupo === "atacante") {
                x.metricaBruta = x.golsP * 1.7 + x.assistP * 0.9 + (x.golsP + x.assistP) * 0.5 + x.media * 1.3;
            } else if(x.grupo === "meia") {
                x.metricaBruta = x.assistP * 1.7 + x.golsP * 0.9 + x.media * 1.5;
            } else if(x.grupo === "defensor") {
                x.metricaBruta = (x.perfilDef.jogosSemSofrerGol * 1.4) + (x.perfilDef.desarmes * 0.5) + (x.perfilDef.interceptacoes * 0.5) + x.media * 1.6 + x.golsP * 1.1;
            } else {
                x.metricaBruta = (x.perfilDef.jogosSemSofrerGol * 1.7) + (x.perfilDef.defesas * 0.35) + (x.perfilDef.penaltisDefendidos * 3) + x.media * 1.5;
            }
        });

        // Normaliza a métrica bruta (0-100) dentro do próprio grupo de posição,
        // para que atacantes não dominem sempre o prêmio.
        const maxPorGrupo = {};
        todos.forEach(x => { maxPorGrupo[x.grupo] = Math.max(maxPorGrupo[x.grupo] || 0, x.metricaBruta); });
        todos.forEach(x => {
            let posicional = normalizarNoGrupo(x.metricaBruta, maxPorGrupo[x.grupo]);
            // Prêmios individuais imitam o viés real do futebol: praticamente sempre
            // vão para as 5 grandes ligas europeias. Fora delas dá pra aparecer no
            // Top 30 numa temporada excepcional, mas é raro vencer de fato — por
            // isso é um desconto forte na força do desempenho, não um teto rígido.
            const forcaLiga = TOP5_LIGAS_EUROPA.includes(x.ligaId) ? 1.0 : (obterClubeJogador(x.p)?.reputacao >= 85 ? 0.55 : 0.3);
            posicional *= forcaLiga;
            // Goleiros já venceram a Bola de Ouro na vida real (Yashin, 1963) mas é
            // raríssimo — reduzimos bastante a força sem zerar a chance.
            if(x.grupo === "goleiro") posicional *= 0.62;
            const prestigioLiga = TOP5_LIGAS_EUROPA.includes(x.ligaId) ? 8 : (obterClubeJogador(x.p)?.reputacao >= 85 ? 4 : 0);
            const prestigioSelecao = Math.min(10, ((x.p.statsSelecao?.gols || 0) + (x.p.statsSelecao?.assistencias || 0)) * 0.4);
            x.scoreFinal = posicional + (x.p.pontosPremioTemporada || 0) + prestigioLiga + prestigioSelecao;
            x.ligaId = x.ligaId;
            // Pontuação específica para prêmios internacionais (pesa mais o desempenho pela seleção nacional)
            x.scoreInternacional = x.scoreFinal + (x.p.statsSelecao?.gols || 0) * 3 + (x.p.statsSelecao?.assistencias || 0) * 2 + (x.p.titulosSelecao?.length || 0) * 20;
        });
        let rankingBolaOuro = [...todos].sort((a,b) => b.scoreFinal - a.scoreFinal);

        let bonusUser = 0; if (jogador.estatisticasAtuais.gols + jogador.estatisticasAtuais.assistencias > 20) bonusUser += 2;
        if (jogador.idade < 24) bonusUser += 2; if (jogador.idade > 31) bonusUser -= 2;
        evoluirAtributosEGeral(jogador, bonusUser);
        jogador.valorMercadoNum = calcularValorMercadoJogador(jogador);
        
        registrarNoticia("Fim de temporada", "A grande janela de transferências vai abrir junto com a nova época.", "Mercado");

        // Manager Mode season review — piggybacks on the exact same season
        // rollover as everyone else, since the manager's club lives in the same
        // tabelasLigas used by the rest of the world.
        if(managerEstado?.ativo && managerEstado.clubeId) {
            const clubeMgr = clubes.find(c => c.id === managerEstado.clubeId);
            const tabelaMgr = clubeMgr ? tabelasLigas[clubeMgr.ligaId] : null;
            if(clubeMgr && tabelaMgr) {
                const tabOrd = [...tabelaMgr].sort((a,b) => b.pontos - a.pontos || ((b.gols||0)-(b.golsSofridos||0)) - ((a.gols||0)-(a.golsSofridos||0)));
                const posicaoFinal = tabOrd.findIndex(t => t.id === clubeMgr.id) + 1;
                const totalTimes = tabOrd.length;
                let ajusteConfianca = 0;
                if(posicaoFinal === 1) ajusteConfianca = 15;
                else if(posicaoFinal <= Math.ceil(totalTimes * 0.25)) ajusteConfianca = 8;
                else if(posicaoFinal <= Math.ceil(totalTimes * 0.6)) ajusteConfianca = 0;
                else if(posicaoFinal <= totalTimes - 3) ajusteConfianca = -8;
                else ajusteConfianca = -18;

                managerEstado.confianca = Math.max(0, Math.min(100, managerEstado.confianca + ajusteConfianca));
                registrarNoticia(
                    posicaoFinal === 1 ? "Campeões!" : "Temporada encerrada",
                    `${clubeMgr.nome} terminou a época em ${posicaoFinal}º/${totalTimes} lugar sob o comando de ${managerEstado.treinador?.nome || "seu treinador"}.`,
                    "Manager"
                );

                if(managerEstado.confianca <= 0) {
                    registrarNoticia("Demitido", `${managerEstado.treinador?.nome || "O treinador"} foi demitido pela diretoria do ${clubeMgr.nome} após a fraca campanha.`, "Manager");
                    managerEstado = estadoManagerPadrao();
                } else {
                    // Refresh transfer budget and bring through a new youth intake for the new season.
                    managerEstado.orcamentoTransferencias += Math.floor((clubeMgr.reputacao || 70) * (clubeMgr.reputacao >= 84 ? 900000 : 350000));
                    managerEstado.base = gerarBaseManager(clubeMgr);
                }
            }
        }

        premiarLigasTemporada();
        simularGalaEpica(rankingBolaOuro);
        
    } catch (e) { console.error(e); mostrarToast("Erro", "Falha na Gala.", "danger"); }
}

// ==========================================
// 🌐 FIM DE TEMPORADA COMPARTILHADO (GALA IGUAL PARA OS DOIS)
// ==========================================
// No modo online, só o anfitrião do mundo calcula a Gala de verdade (Bola de
// Ouro, campeões, envelhecimento da IA) — já considerando as estatísticas
// reais do amigo, que estão sincronizadas dentro de jogadoresIA. O resultado
// inteiro é transmitido para o amigo aplicar, para que os dois vejam
// exatamente os mesmos campeões e prémios.
window.processarFimTemporadaOnline = async function() {
    // 🤝 PESSOAL: a promessa feita ao técnico usa só as minhas próprias
    // estatísticas — por isso é avaliada sempre, em qualquer modo, e mesmo
    // para quem não é o "anfitrião do mundo" no online.
    avaliarPromessasTecnico();

    if (window.connectionMode !== 'online' || !window.firebaseIntegration) {
        processarFimTemporada();
        return;
    }

    const souHost = window.firebaseIntegration.souHostDoMundo();
    if (souHost) {
        processarFimTemporada();

        // Se o amigo ganhou algo nesta Gala, avisa-o (ele não corre este código).
        const meuParceiro = jogadoresIA.find(j => j.id === window.onlinePartnerId);
        if (meuParceiro?.historicoCarreira?.[0]?.trofeus && meuParceiro.historicoCarreira[0].trofeus !== "-") {
            window.firebaseIntegration.pushAchievementForPlayerToFirebase(window.onlinePartnerId, meuParceiro.historicoCarreira[0].trofeus, "Fim de Temporada");
        }

        window.firebaseIntegration.transmitirFimDeTemporada(anoAtual, {
            tabelasLigas: JSON.parse(JSON.stringify(tabelasLigas)),
            copasEstado: JSON.parse(JSON.stringify(copasEstado)),
            campeoesAnoAnterior: JSON.parse(JSON.stringify(campeoesAnoAnterior)),
            jogadoresIA: JSON.parse(JSON.stringify(jogadoresIA.filter(j => !j.isFirebasePlayer && !j.isOnlinePlayer))),
            parceiroResultado: meuParceiro ? JSON.parse(JSON.stringify({ historicoCarreira: meuParceiro.historicoCarreira, pontosPremio: meuParceiro.pontosPremio, titulosSelecao: meuParceiro.titulosSelecao })) : null
        });
    } else {
        const estado = await window.firebaseIntegration.obterFimDeTemporada(anoAtual);
        if (estado) {
            for (let key in tabelasLigas) delete tabelasLigas[key];
            Object.assign(tabelasLigas, estado.tabelasLigas || {});
            for (let key in copasEstado) delete copasEstado[key];
            Object.assign(copasEstado, estado.copasEstado || {});
            campeoesAnoAnterior = estado.campeoesAnoAnterior || campeoesAnoAnterior;
            if (estado.jogadoresIA) { jogadoresIA.length = 0; estado.jogadoresIA.forEach(n => jogadoresIA.push(n)); }

            // Aplica o MEU próprio troféu/prémio (o anfitrião já apurou isto no cálculo dele).
            if (estado.parceiroResultado) {
                if (estado.parceiroResultado.historicoCarreira?.[0] && jogador.historicoCarreira?.[0]) {
                    jogador.historicoCarreira[0].trofeus = estado.parceiroResultado.historicoCarreira[0].trofeus;
                }
                if (typeof estado.parceiroResultado.pontosPremio === 'number') jogador.pontosPremio = estado.parceiroResultado.pontosPremio;
                if (estado.parceiroResultado.titulosSelecao) jogador.titulosSelecao = estado.parceiroResultado.titulosSelecao;
            }

            // Aplica o meu próprio bónus de OVR/valor de mercado de fim de temporada
            // (o anfitrião só ajustou o dele próprio).
            let bonusUser = 0;
            if (jogador.estatisticasAtuais.gols + jogador.estatisticasAtuais.assistencias > 20) bonusUser += 2;
            if (jogador.idade < 24) bonusUser += 2; if (jogador.idade > 31) bonusUser -= 2;
            evoluirAtributosEGeral(jogador, bonusUser);
            jogador.valorMercadoNum = calcularValorMercadoJogador(jogador);

            registrarNoticia("Fim de temporada", "A grande janela de transferências vai abrir junto com a nova época.", "Mercado");
        } else {
            // Rede de segurança em caso de falha de rede/timeout.
            processarFimTemporada();
        }
    }
};

// Monta o "Melhor 11 do Mundo" da temporada: escolhe o melhor jogador disponível para
// cada posição de uma formação 4-3-3, sem repetir jogador em mais de uma vaga.
function montarMelhor11(ranking) {
    // Em vez de posicionar cada jogador com coordenadas absolutas (que cortavam o
    // cartão do goleiro e dos pontas em telas menores), o time é montado em LINHAS
    // (Goleiro / Defesa / Meio / Ataque) — um layout que se adapta a qualquer altura
    // de tela sem cortar nada.
    const formacao = [
        { pos: "Goleiro", label: "GOL", linha: "goleiro" },
        { pos: "Lateral", label: "LE", linha: "defesa" },
        { pos: "Zagueiro", label: "ZAG", linha: "defesa" },
        { pos: "Zagueiro", label: "ZAG", linha: "defesa" },
        { pos: "Lateral", label: "LD", linha: "defesa" },
        { pos: "Volante", label: "VOL", linha: "meio" },
        { pos: "Meio-Campista", label: "MC", linha: "meio" },
        { pos: "Meia Ofensivo", label: "MEI", linha: "meio" },
        { pos: "Ponta", label: "PE", linha: "ataque" },
        { pos: "Atacante", label: "ATA", linha: "ataque" },
        { pos: "Ponta", label: "PD", linha: "ataque" }
    ];
    const chave = (p) => p === jogador ? "player" : (p.id || p.nome);
    const usados = new Set();
    const porPosicao = {};
    ranking.forEach(x => { if(!porPosicao[x.pos]) porPosicao[x.pos] = []; porPosicao[x.pos].push(x); });
    Object.keys(porPosicao).forEach(pos => porPosicao[pos].sort((a,b) => b.scoreFinal - a.scoreFinal));
    return formacao.map(slot => {
        const cands = (porPosicao[slot.pos] || []).filter(x => !usados.has(chave(x.p)));
        const escolhido = cands[0] || null;
        if(escolhido) usados.add(chave(escolhido.p));
        return { ...slot, escolhido };
    });
}

function simularGalaEpica(ranking) {
    const top30 = ranking.slice(0, 30);
    let top1 = top30[0]; let top2 = top30[1]; let top3 = top30[2];
    if (!top1 || !top2 || !top3) { mostrarToast("Gala", "Ainda nao ha jogadores suficientes para a premiacao.", "warning"); return; }

    const porGols = [...ranking].sort((a,b) => b.g - a.g || b.scoreFinal - a.scoreFinal);
    const porAssistencias = [...ranking].sort((a,b) => b.a - a.a || b.scoreFinal - a.scoreFinal);
    const sub21 = ranking.filter(x => x.idade <= 21).sort((a,b) => b.scoreFinal - a.scoreFinal);
    const goleiros = ranking.filter(x => x.pos === "Goleiro").sort((a,b) => b.ovr - a.ovr || b.scoreFinal - a.scoreFinal);
    const rankingInternacional = [...ranking].sort((a,b) => b.scoreInternacional - a.scoreInternacional);
    const rankingEuropa = ranking.filter(x => ehLigaEuropeia(x.ligaId)).sort((a,b) => b.scoreFinal - a.scoreFinal);
    const candidatosUefa = rankingEuropa.length >= 3 ? rankingEuropa : ranking;

    // Ícone de cada prêmio: para os troféus ligados a uma competição real (UEFA / FIFA),
    // usamos a logo verdadeira da competição em vez de um emoji genérico.
    const iconEmoji = (e) => e;
    const iconLogoComp = (nomeComp) => `<img src="${obterUrlImagem(nomeComp, 'trofeu')}" alt="${nomeComp}" style="height:1.1em;width:1.1em;object-fit:contain;vertical-align:-0.2em;">`;

    // A Bola de Ouro tem tratamento próprio (Top 30 revelado aos poucos) e por isso
    // fica fora da lista genérica de prêmios abaixo.
    const premios = [
        { nome: "Chuteira de Ouro", icon: iconEmoji("⚽"), candidatos: porGols.slice(0, 3), vencedor: porGols[0], metrica: x => `${x.g} gols na temporada`, pontos: 35, grande: false },
        { nome: "Rei das Assistencias", icon: iconEmoji("🎯"), candidatos: porAssistencias.slice(0, 3), vencedor: porAssistencias[0], metrica: x => `${x.a} assistencias`, pontos: 30, grande: false },
        { nome: "Golden Boy", icon: iconEmoji("⭐"), candidatos: sub21.slice(0, 3), vencedor: sub21[0], metrica: x => `${x.idade} anos • OVR ${x.ovr}`, pontos: 25, grande: false },
        { nome: "Luva de Ouro", icon: iconEmoji("🧤"), candidatos: goleiros.slice(0, 3), vencedor: goleiros[0], metrica: x => `Goleiro • OVR ${x.ovr}`, pontos: 30, grande: false },
        { nome: "UEFA Best Player", icon: iconLogoComp("Champions League"), candidatos: candidatosUefa.slice(0, 3), vencedor: candidatosUefa[0], metrica: x => `${obterClubeJogador(x.p)?.nome || "Clube europeu"} • ${x.g}G ${x.a}A`, pontos: 55, grande: true },
        { nome: "FIFA The Best", icon: iconLogoComp("Copa do Mundo"), candidatos: rankingInternacional.slice(0, 3), vencedor: rankingInternacional[0], metrica: x => `${x.g} gols de clube • ${x.p.statsSelecao?.gols || 0} pela seleção`, pontos: 65, grande: true }
    ].filter(p => p.vencedor && p.candidatos.length > 0);

    const premioBolaOuro = { nome: "Bola de Ouro", icon: iconEmoji("🏆"), candidatos: [top1, top2, top3], vencedor: top1, metrica: x => `${x.g} gols • ${x.a} ast • OVR ${x.ovr}`, pontos: 80, grande: true };
    const todosPremiosResumo = [...premios, premioBolaOuro];

    premiosIndividuaisPendentes = todosPremiosResumo.map(p => ({ nome: p.nome, playerId: p.vencedor.p.id || (p.vencedor.p === jogador ? "player" : ""), pontos: p.pontos }));

    todosPremiosResumo.forEach(p => {
        registrarNoticia(`${p.nome}: ${p.vencedor.p.nome} é o vencedor!`, `${p.vencedor.p.nome} conquistou o prêmio ${p.nome} da temporada (${p.metrica(p.vencedor)}).`, "Prémios", { nome: p.vencedor.p.nome, foto: p.vencedor.p.foto }, "jogador", !!p.grande);
    });

    const melhor11 = montarMelhor11(ranking);
    melhor11.filter(v => v.escolhido).forEach(v => {
        premiosIndividuaisPendentes.push({ nome: "Melhor 11 do Mundo", playerId: v.escolhido.p.id || (v.escolhido.p === jogador ? "player" : ""), pontos: 15 });
    });
    registrarNoticia("Melhor 11 do Mundo revelado", `A seleção com os destaques da temporada por posição foi anunciada: ${melhor11.filter(v=>v.escolhido).map(v=>v.escolhido.p.nome).join(", ")}.`, "Prémios");

    const renderTrofeu = (nome) => `<img src="${obterUrlImagem(nome, 'trofeu')}" alt="${nome}" onerror="this.outerHTML='🏆'">`;
    const atualizarTrofeu = (nome) => { const el = document.getElementById("trofeuGalaAtual"); if(el) el.innerHTML = renderTrofeu(nome); };
    const finalizarGala = () => {
        mB.classList.add("oculto");

        // Set ready for season end if in online room mode
        if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode() && window.firebaseIntegration.getRoomId()) {
            window.firebaseIntegration.setReadyForSeasonEnd(true);
            mostrarToast("Sala Online", "Aguardando amigo para avançar temporada...", "info");
            return;
        }

        window.avancarTemporada();
        if(propostasPendentes.length > 0) {
            mostrarToast("MERCADO ABERTO", "Propostas recebidas!", "warning");
            document.querySelector("[data-view='view-mercado']")?.click();
        }
    };

    // Nenhum "favorito" é indicado antes da revelação — todos os nomeados aparecem
    // em pé de igualdade, exatamente como numa cerimônia real.
    const renderCandidatos = (premio, revelar = false) => `
        <div class="gala-premio-palco">
            <h3>${premio.icon} ${premio.nome}</h3>
            <p style="margin:0; color:#a1a1aa; font-weight:700;">${revelar ? 'Vencedor revelado. O teatro veio abaixo.' : 'Os tres nomeados aparecem no telao...'}</p>
            <div class="gala-candidatos-grid">
                ${premio.candidatos.map(c => `
                    <div class="gala-candidato ${revelar && c.p.id === premio.vencedor.p.id ? 'vencedor' : ''}">
                        <img src="${obterUrlImagem(c.p, 'jogador')}" alt="${c.p.nome}">
                        <strong>${revelar && c.p.id === premio.vencedor.p.id ? '👑 ' : ''}${c.p.nome}</strong>
                        <span>${premio.metrica(c)}</span>
                    </div>`).join("")}
            </div>
        </div>`;

    const renderCandidatosGrandes = (premio, revelar = false) => {
        // A ordem de exibição embaralha os nomeados (não é 3º/2º/1º) até a revelação,
        // para que ninguém consiga adivinhar o vencedor pela posição no ecrã.
        const ordemExibicao = premio._ordemExibicao || (premio._ordemExibicao = [...premio.candidatos].sort(() => Math.random() - 0.5));
        return `
        <div class="gala-premio-palco">
            <h3>${premio.icon} ${premio.nome}</h3>
            <p style="margin:0; color:#a1a1aa; font-weight:700;">${revelar ? 'Vencedor revelado. O teatro veio abaixo.' : 'Os tres nomeados aparecem no telao...'}</p>
            <div class="finalistas-grid">
                ${ordemExibicao.map((item) => {
                    const venceu = revelar && item.p.id === premio.vencedor.p.id;
                    return `<div class="finalista-card revelado ${venceu ? 'vencedor' : ''}">
                        <img src="${obterUrlImagem(item.p, 'jogador')}" alt="${item.p.nome}">
                        <span style="color:${venceu ? '#facc15' : '#a1a1aa'}; font-weight:900; text-transform:uppercase; font-size:0.78rem;">${venceu ? '👑 Vencedor' : 'Nomeado'}</span>
                        <h4>${item.p.nome}</h4>
                        <div class="finalista-stats"><span>OVR ${item.ovr}</span><span>${item.g} Gols</span><span>${item.a} Ast</span></div>
                    </div>`;
                }).join("")}
            </div>
        </div>`;
    };

    const renderMelhor11 = () => `
        <div class="gala-premio-palco">
            <h3>🧩 Melhor 11 do Mundo</h3>
            <p style="margin:0 0 4px; color:#a1a1aa; font-weight:700;">Um jogador por posição, eleito pelo desempenho da temporada.</p>
            <div class="melhor11-campo">
                ${["goleiro","defesa","meio","ataque"].map(linha => `
                    <div class="melhor11-linha melhor11-linha-${linha}">
                        ${melhor11.filter(v => v.linha === linha).map((v, i) => `
                            <div class="melhor11-vaga" style="animation-delay:${(i*0.09).toFixed(2)}s;">
                                ${v.escolhido ? `<img src="${obterUrlImagem(v.escolhido.p, 'jogador')}" alt="${v.escolhido.p.nome}">` : `<div class="melhor11-avatar-vazio">?</div>`}
                                <strong>${v.escolhido ? v.escolhido.p.nome : "—"}</strong>
                                <span>${v.label}</span>
                            </div>`).join("")}
                    </div>`).join("")}
            </div>
        </div>`;

    // Placar da Bola de Ouro: mostra sempre as 30 posições, mas só preenche os
    // nomes das que já foram reveladas (de trás para frente, do 30º ao 1º lugar).
    const renderTop30Board = (reveladosDoFim) => `
        <div class="gala-premio-palco">
            <h3>🏆 Bola de Ouro — Top 30</h3>
            <p style="margin:0 0 4px; color:#a1a1aa; font-weight:700;">A lista vai sendo revelada de trás para a frente. Quem chegará ao topo?</p>
            <div class="top30-board">
                ${top30.map((x, i) => {
                    const rank = i + 1;
                    const posDoFim = top30.length - rank + 1;
                    const revelado = posDoFim <= reveladosDoFim;
                    return `<div class="top30-slot ${revelado ? 'revelado' : ''} ${rank <= 3 ? 'top3' : ''}">
                        <span class="top30-rank">${rank}º</span>
                        ${revelado ? `<img src="${obterUrlImagem(x.p, 'jogador')}" alt="${x.p.nome}">` : `<div class="top30-avatar-oculto">?</div>`}
                        <div class="top30-info">
                            <strong>${revelado ? x.p.nome : '???'}</strong>
                            <span>${revelado ? `${x.g}G ${x.a}A • OVR ${x.ovr}` : ''}</span>
                        </div>
                    </div>`;
                }).join("")}
            </div>
        </div>`;

    let mB = document.getElementById("modalBolaOuro");
    if(!mB) return;

    const progressoHTML = `<div class="gala-progresso" id="galaProgresso">
        ${premios.map(p => `<span data-nome="${p.nome}">${p.icon} ${p.nome}</span>`).join("")}
        <span data-nome="Bola de Ouro">🏆 Bola de Ouro</span>
        <span data-nome="Melhor 11 do Mundo">🧩 Melhor 11</span>
    </div>`;

    mB.innerHTML = `
        <div class="modal-content gala-container-premium">
            <div class="gala-stage">
                <button id="btnPularGala" class="gala-skip-btn">Avancar</button>
                <div class="gala-kicker">Noite de gala mundial</div>
                <h2 class="gala-luxo">Premios da Temporada ${anoAtual}</h2>
                ${progressoHTML}
                <div class="bola-de-ouro-trofeu" id="trofeuGalaAtual">${renderTrofeu(premios[0]?.nome || 'Bola de Ouro')}</div>
                <p class="gala-subtitle" id="statusGalaText">Os principais nomes do ano estao chegando ao palco.</p>
                <div id="vencedorReveladoCtx" style="min-height:220px;"></div>
            </div>
        </div>`;
    mB.classList.remove("oculto");
    document.getElementById("btnPularGala").onclick = finalizarGala;

    const ctx = () => document.getElementById("vencedorReveladoCtx");
    const status = () => document.getElementById("statusGalaText");
    const marcarProgresso = (nomeAtivo) => {
        document.querySelectorAll("#galaProgresso span").forEach(el => {
            const nome = el.dataset.nome;
            el.classList.toggle("ativo", nome === nomeAtivo);
            if(nome === nomeAtivo) el.classList.remove("feito");
        });
    };
    const marcarConcluido = (nome) => { document.querySelector(`#galaProgresso span[data-nome="${CSS.escape(nome)}"]`)?.classList.add("feito"); document.querySelector(`#galaProgresso span[data-nome="${CSS.escape(nome)}"]`)?.classList.remove("ativo"); };

    function mostrarResumoFinal() {
        marcarConcluido("Melhor 11 do Mundo");
        if(ctx()) ctx().innerHTML = `
            <h1 class="gala-winner-name">👑 ${top1.p.nome}</h1>
            <p style="margin:0; color:#d4d4d8; font-weight:800;">Bola de Ouro confirmada: ${top1.g} gols, ${top1.a} assistencias e OVR ${top1.ovr}</p>
            <div class="gala-awards-grid">
                ${todosPremiosResumo.map(p => `<div class="gala-award ${p.grande ? 'premio-especial' : ''}"><img src="${obterUrlImagem(p.nome, 'trofeu')}" alt="${p.nome}"><small>${p.icon} ${p.nome}</small><strong>${p.vencedor.p.nome}</strong><span>${p.metrica(p.vencedor)}</span></div>`).join("")}
            </div>
            ${renderMelhor11()}
            <div class="gala-final-actions"><button id="btnFecharGalaNovo" style="padding:15px 40px; background:linear-gradient(90deg, #facc15, #f59e0b); color:#000; border:none; border-radius:12px; font-weight:900; font-size:1.05rem; cursor:pointer; text-transform:uppercase; box-shadow:0 12px 26px rgba(250,204,21,0.22);">Avancar Temporada ➔</button></div>`;
        document.getElementById("btnFecharGalaNovo").onclick = finalizarGala;
    }

    function revelarMelhor11() {
        marcarProgresso("Melhor 11 do Mundo");
        atualizarTrofeu("Melhor 11 do Mundo");
        if(status()) status().innerHTML = "E agora, o Melhor 11 do Mundo da temporada!";
        if(ctx()) ctx().innerHTML = renderMelhor11();
        setTimeout(mostrarResumoFinal, 2600);
    }

    // A Bola de Ouro é revelada em ondas de 4, de trás para a frente (30º ➝ 4º),
    // e só então o pódio (3º, 2º e o vencedor) é anunciado passo a passo — sem
    // jamais indicar quem é o favorito antes da hora.
    function revelarBolaDeOuro() {
        marcarProgresso("Bola de Ouro");
        atualizarTrofeu("Bola de Ouro");
        const totalFundo = Math.max(0, top30.length - 3);
        let reveladosDoFim = 0;
        if(status()) status().innerHTML = "A lista da Bola de Ouro comeca a ser revelada, de tras para frente...";
        if(ctx()) ctx().innerHTML = renderTop30Board(0);

        function passoLote() {
            reveladosDoFim = Math.min(totalFundo, reveladosDoFim + 4);
            if(ctx()) ctx().innerHTML = renderTop30Board(reveladosDoFim);
            if(reveladosDoFim < totalFundo) setTimeout(passoLote, 700);
            else setTimeout(revelarTerceiro, 1300);
        }
        function revelarTerceiro() {
            if(status()) status().innerHTML = "E o terceiro colocado da Bola de Ouro e...";
            setTimeout(() => {
                if(ctx()) ctx().innerHTML = renderTop30Board(totalFundo + 1);
                setTimeout(revelarSegundo, 1900);
            }, 1300);
        }
        function revelarSegundo() {
            if(status()) status().innerHTML = "Em segundo lugar...";
            setTimeout(() => {
                if(ctx()) ctx().innerHTML = renderTop30Board(totalFundo + 2);
                setTimeout(revelarVencedor, 2100);
            }, 1300);
        }
        function revelarVencedor() {
            if(status()) status().innerHTML = "E a Bola de Ouro vai para...";
            setTimeout(() => {
                if(ctx()) ctx().innerHTML = renderTop30Board(totalFundo + 3);
                marcarConcluido("Bola de Ouro");
                setTimeout(revelarMelhor11, 2600);
            }, 1800);
        }
        setTimeout(passoLote, 900);
    }

    function revelarPremio(idx) {
        const premio = premios[idx];
        if(!premio) { revelarBolaDeOuro(); return; }

        marcarProgresso(premio.nome);
        atualizarTrofeu(premio.nome);
        if(status()) status().innerHTML = `Agora: ${premio.nome}. Quem leva?`;
        if(ctx()) ctx().innerHTML = premio.grande ? renderCandidatosGrandes(premio, false) : renderCandidatos(premio, false);
        setTimeout(() => {
            if(status()) status().innerHTML = `${premio.nome}: vencedor revelado!`;
            if(ctx()) ctx().innerHTML = premio.grande ? renderCandidatosGrandes(premio, true) : renderCandidatos(premio, true);
            marcarConcluido(premio.nome);
            setTimeout(() => revelarPremio(idx + 1), premio.grande ? 2400 : 1700);
        }, premio.grande ? 2300 : 1600);
    }

    setTimeout(() => revelarPremio(0), 700);
}

// ==========================================
// 🧠 MODO MANAGER
// ==========================================
function estadoManagerPadrao() {
    return { ativo: false, treinador: null, clubeId: null, confianca: 65, tatica: { formacao: "4-3-3", estilo: "pressao", mentalidade: "equilibrado", pressao: "média", largura: "normal" }, orcamentoTransferencias: 0, folhaSalarial: 0, base: [] };
}

function clubeManagerAtual() {
    return clubes.find(c => c.id === managerEstado.clubeId);
}

function calcularFolhaClube(clubeId) {
    const clube = clubes.find(c => c.id === clubeId);
    const reputacao = clube?.reputacao || 65;
    const fatorClube = 0.55 + (reputacao / 100) * 1.2;
    const fatorArabe = clube?.ligaId?.startsWith("ara") ? 1.6 : 1;
    return jogadoresIA.filter(p => p.clubeId === clubeId && !p.aposentado).reduce((acc, p) => acc + Math.max(12000, (p.valorMercadoNum || calcularValorMercadoJogador(p)) * 0.018) * fatorClube * fatorArabe, 0);
}

function gerarBaseManager(clube) {
    const nomes = ["Rafael", "Leo", "Iago", "Davi", "Noah", "Caio", "Hugo", "Breno", "Luis", "Tomas"];
    const posicoes = ["Goleiro","Zagueiro","Lateral","Volante","Meio-Campista","Meia Ofensivo","Ponta","Atacante"];
    return Array.from({ length: 6 }, (_, i) => {
        const potencial = Math.min(94, Math.max(70, (clube?.reputacao || 70) + Math.floor(Math.random() * 18) - 4));
        return {
            id: `base_${anoAtual}_${clube?.id || "livre"}_${i}_${Date.now().toString(36)}`,
            nome: `${nomes[Math.floor(Math.random()*nomes.length)]} ${["Silva","Costa","Rocha","Nunes","Mendes"][Math.floor(Math.random()*5)]}`,
            idade: 16 + Math.floor(Math.random() * 3),
            geral: Math.max(48, potencial - 20 - Math.floor(Math.random() * 10)),
            potencial,
            posicao: posicoes[Math.floor(Math.random()*posicoes.length)],
            nacionalidade: jogador?.nacionalidade || "Brasil",
            foto: ""
        };
    });
}

function iniciarManagerNoClube(clubeId) {
    const clube = clubes.find(c => c.id === clubeId);
    if(!clube) return;
    managerEstado = {
        ...estadoManagerPadrao(),
        ativo: true,
        treinador: managerEstado.treinador || { nome: jogador?.nome ? `Mister ${jogador.nome}` : "Novo Treinador", reputacao: Math.max(45, Math.min(88, Math.round((jogador?.geral || 65) * 0.9))), ataque: 62, defesa: 62, tatica: 62 },
        clubeId: clube.id,
        confianca: clube.reputacao >= 84 ? 58 : 72,
        tatica: managerEstado.tatica || { formacao: "4-3-3", estilo: "pressao", mentalidade: "equilibrado", pressao: "média", largura: "normal" },
        orcamentoTransferencias: Math.floor((clube.reputacao || 70) * (clube.reputacao >= 84 ? 1800000 : 650000)),
        folhaSalarial: calcularFolhaClube(clube.id),
        base: gerarBaseManager(clube)
    };
    registrarNoticia("Novo treinador anunciado", `${managerEstado.treinador.nome} assumiu o comando do ${clube.nome}.`, "Manager");
    window.salvarJogo();
    renderizarManager();
}

function bonusTaticoManager() {
    const t = managerEstado.tatica || {};
    let bonus = 0;
    if(t.formacao === "4-3-3" && t.estilo === "pressao") bonus += 3;
    if(t.formacao === "4-2-3-1" && t.estilo === "posse") bonus += 3;
    if(t.formacao === "5-3-2" && t.estilo === "retranca") bonus += 4;
    if(t.formacao === "5-3-2" && t.estilo === "contra") bonus += 3;
    if(t.formacao === "3-5-2" && t.estilo === "contra") bonus += 2;
    if(t.mentalidade === "ofensiva") bonus += 1;
    if(t.mentalidade === "conservadora") bonus += 1;
    if(t.pressao === "alta" && t.estilo === "pressao") bonus += 1.5;
    if(t.pressao === "baixa" && t.estilo === "retranca") bonus += 1;
    if(t.largura === "larga" && ["4-3-3", "4-2-3-1", "4-4-2"].includes(t.formacao)) bonus += 0.5;
    if(t.largura === "estreita" && ["5-3-2", "3-5-2"].includes(t.formacao)) bonus += 0.5;
    return bonus;
}

function objetivoDiretoria(clube) {
    if(!clube) return "Assumir um clube";
    if(clube.reputacao >= 86) return "Brigar por todos os titulos";
    if(clube.reputacao >= 78) return "Classificar para competicao continental";
    if(clube.reputacao >= 68) return "Meio de tabela seguro";
    return "Evitar rebaixamento e revelar jovens";
}

window.managerAssumirClube = iniciarManagerNoClube;

window.managerDefinirTatica = function(campo, valor) {
    if(!managerEstado.tatica) managerEstado.tatica = { formacao: "4-3-3", estilo: "pressao", mentalidade: "equilibrado", pressao: "média", largura: "normal" };
    managerEstado.tatica[campo] = valor;
    managerEstado.confianca = Math.min(100, managerEstado.confianca + 1);
    window.salvarJogo();
    renderizarManager();
};

window.managerEnviarProposta = function(playerId) {
    const alvo = jogadoresIA.find(p => p.id === playerId && !p.aposentado);
    const clube = clubeManagerAtual();
    if(!alvo || !clube) return;
    const valor = Math.floor((alvo.valorMercadoNum || calcularValorMercadoJogador(alvo)) * (1.05 + Math.random() * 0.3));
    if(valor > managerEstado.orcamentoTransferencias) {
        mostrarToast("Manager", "Orcamento insuficiente para esta proposta.", "warning");
        return;
    }
    const aceitou = valor >= (alvo.valorMercadoNum || calcularValorMercadoJogador(alvo)) * (alvo.geral >= clube.reputacao + 8 ? 1.22 : 1.02);
    if(!aceitou) {
        managerEstado.confianca = Math.max(0, managerEstado.confianca - 1);
        mostrarToast("Proposta recusada", `${alvo.nome} ficou caro demais para o momento.`, "warning");
    } else {
        const origem = alvo.clubeId;
        alvo.clubeId = clube.id;
        alvo.contrato = Math.max(alvo.contrato || 0, 3);
        managerEstado.orcamentoTransferencias -= valor;
        managerEstado.folhaSalarial = calcularFolhaClube(clube.id);
        managerEstado.confianca = Math.min(100, managerEstado.confianca + (alvo.geral >= clube.reputacao ? 4 : 2));
        registrarMovimentacao({ jogadorNome: alvo.nome, jogadorId: alvo.id, tipo: "transferencia", valor, origemId: origem, destinoId: clube.id, janela: "Modo Manager" });
        mostrarToast("Reforco contratado", `${alvo.nome} assinou com o ${clube.nome}.`, "success");
    }
    window.salvarJogo();
    renderizarManager();
};

window.managerPromoverJovem = function(baseId) {
    const clube = clubeManagerAtual();
    const jovem = managerEstado.base?.find(j => j.id === baseId);
    if(!clube || !jovem) return;
    jogadoresIA.push({
        ...jovem,
        clubeId: clube.id,
        contrato: 3,
        felicidade: 75,
        inteligencia: 55,
        statsTemporada: { jogos:0, gols:0, assistencias:0, notas:[] },
        historicoCarreira: []
    });
    managerEstado.base = managerEstado.base.filter(j => j.id !== baseId);
    managerEstado.confianca = Math.min(100, managerEstado.confianca + 2);
    registrarNoticia("Promocao da base", `${jovem.nome} subiu ao profissional do ${clube.nome}.`, "Base");
    window.salvarJogo();
    renderizarManager();
};

window.managerSimularPartida = async function() {
    const clube = clubeManagerAtual();
    if(!clube) return;

    // 🌐 MUNDO COMPARTILHADO: sistema de "pronto" — só avança quando o amigo também estiver pronto para esta rodada.
    if (window.connectionMode === 'online' && window.firebaseIntegration && window.firebaseIntegration.aguardarProntoRodada) {
        const pronto = await window.firebaseIntegration.aguardarProntoRodada(rodadaAtual, () => {
            mostrarToast("Mundo Compartilhado", "O teu amigo ficou pronto! A continuar a rodada...", "success");
            window.managerSimularPartida();
        });
        if (!pronto) {
            mostrarToast("Mundo Compartilhado", "Ficaste pronto! A aguardar o teu amigo terminar a rodada dele...", "info");
            return;
        }
    }

    // The global football calendar is shared by every mode. If the player-mode
    // season has already run out of scheduled weeks, point the manager at the
    // Gala instead of quietly desyncing from the rest of the world.
    const comp = agendaTemporada[rodadaAtual - 1];
    if(!comp) {
        mostrarToast("Diretoria", "A época terminou para todos os clubes. Fecha a Gala de fim de temporada antes de continuar.", "info");
        return;
    }

    // Guard against managing the same club the player-character already plays
    // for — that fixture is already resolved live via o Modo Jogador, simulating
    // it again here would double-count it in the table.
    if(jogador && clube.id === jogador.clubeId) {
        mostrarToast("Manager", "Este clube já é o teu clube como jogador — disputa esta partida pelo Modo Jogador.", "warning");
        return;
    }

    if(Object.keys(tabelasLigas).length === 0) inicializarTabelas();
    const tabela = tabelasLigas[clube.ligaId];
    if(!tabela) { mostrarToast("Erro", "Tabela da liga do teu clube não foi encontrada.", "danger"); return; }

    const mt = tabela.find(t => t.id === clube.id);
    if(!mt) { mostrarToast("Erro", "O teu clube não consta na tabela desta liga.", "danger"); return; }

    const maxJogos = (tabela.length - 1) * 2;

    // Manager's club already finished its fixtures for this league season — just
    // keep the rest of the world moving (cups, internationals, other leagues)
    // until the global season rolls over to the Gala.
    if(mt.jogos >= maxJogos) {
        mostrarToast("Diretoria", "O teu clube já disputou todos os jogos da liga esta época. A avançar o resto do mundo...", "info");
        await window.simularRodadaMundialOnline();
        rodadaAtual++;
        window.salvarJogo();
        if(typeof atualizarHub === 'function') atualizarHub();
        renderizarManager();
        return;
    }

    const rivaisElegiveis = tabela.filter(t => t.id !== clube.id && t.jogos < maxJogos);
    const advEntry = rivaisElegiveis[Math.floor(Math.random() * rivaisElegiveis.length)];
    if(!advEntry) {
        mostrarToast("Diretoria", "Nenhum adversário disponível esta semana. A avançar a semana...", "info");
        await window.simularRodadaMundialOnline();
        rodadaAtual++;
        window.salvarJogo();
        if(typeof atualizarHub === 'function') atualizarHub();
        renderizarManager();
        return;
    }
    const rival = clubes.find(c => c.id === advEntry.id);

    // Same statistical model the rest of the league uses for every other
    // club-vs-club fixture, plus the manager's own tactical bonus and board
    // confidence — keeps results consistent with the rest of the world instead
    // of a separate, disconnected formula.
    const forcaA = (clube.reputacao || 70) + bonusTaticoManager() + (managerEstado.confianca - 50) / 10;
    const forcaB = rival?.reputacao || 70;
    const diff = (forcaA - forcaB) / 20;
    const gA = Math.random() + diff + 0.1 > 0.5 ? Math.floor(Math.random() * 4) : 0;
    const gB = Math.random() - diff > 0.6 ? Math.floor(Math.random() * 3) : 0;

    mt.jogos++; advEntry.jogos++;
    mt.gols = (mt.gols || 0) + gA; mt.golsSofridos = (mt.golsSofridos || 0) + gB;
    advEntry.gols = (advEntry.gols || 0) + gB; advEntry.golsSofridos = (advEntry.golsSofridos || 0) + gA;
    if(gA > gB) {
        mt.pontos += 3; mt.vitorias = (mt.vitorias || 0) + 1; advEntry.derrotas = (advEntry.derrotas || 0) + 1;
        managerEstado.confianca = Math.min(100, managerEstado.confianca + 5);
    } else if(gB > gA) {
        advEntry.pontos += 3; advEntry.vitorias = (advEntry.vitorias || 0) + 1; mt.derrotas = (mt.derrotas || 0) + 1;
        managerEstado.confianca = Math.max(0, managerEstado.confianca - 7);
    } else {
        mt.pontos += 1; advEntry.pontos += 1; mt.empates = (mt.empates || 0) + 1; advEntry.empates = (advEntry.empates || 0) + 1;
        managerEstado.confianca = Math.max(0, Math.min(100, managerEstado.confianca + 1));
    }
    if(typeof atribuirEstatisticaNPC === 'function') {
        atribuirEstatisticaNPC(mt.id, gA, clube.ligaId, gB);
        atribuirEstatisticaNPC(advEntry.id, gB, clube.ligaId, gA);
    }

    if(managerEstado.confianca <= 0) {
        registrarNoticia("Demitido", `${managerEstado.treinador?.nome || "O treinador"} perdeu o cargo no ${clube.nome}.`, "Manager");
        managerEstado = estadoManagerPadrao();
        mostrarToast("Diretoria", "Confiança zerada. Procura um novo clube.", "danger");
    } else {
        registrarNoticia("Jogo do manager", `${clube.nome} ${gA} x ${gB} ${rival?.nome || "Rival"} sob o comando de ${managerEstado.treinador?.nome}.`, "Manager");
        mostrarToast("Resultado Manager", `${clube.nome} ${gA} x ${gB} ${rival?.nome || "Rival"}`, gA >= gB ? "success" : "warning");
    }

    // Keep the rest of the footballing world moving in the same tick, so cups,
    // internationals and every other league stay in sync with the manager's club
    // instead of freezing while only the manager's own score changes.
    await window.simularRodadaMundialOnline();
    rodadaAtual++;
    window.salvarJogo();
    if(typeof atualizarHub === 'function') atualizarHub();
    renderizarManager();
};

// ==========================================
// MODO MANAGER — ESCALAÇÃO EM CAMPO (formações, banco, drag & clique)
// ==========================================
const FORMACOES_SLOTS = {
    "4-3-3": [
        { id: "GK", label: "GOL", pos: "Goleiro", top: 90, left: 50 },
        { id: "LB", label: "LE", pos: "Lateral", top: 72, left: 14 },
        { id: "CB1", label: "ZAG", pos: "Zagueiro", top: 78, left: 36 },
        { id: "CB2", label: "ZAG", pos: "Zagueiro", top: 78, left: 64 },
        { id: "RB", label: "LD", pos: "Lateral", top: 72, left: 86 },
        { id: "CM1", label: "VOL", pos: "Volante", top: 54, left: 50 },
        { id: "CM2", label: "MC", pos: "Meio-Campista", top: 46, left: 27 },
        { id: "CM3", label: "MC", pos: "Meio-Campista", top: 46, left: 73 },
        { id: "LW", label: "PE", pos: "Ponta", top: 20, left: 16 },
        { id: "ST", label: "ATA", pos: "Atacante", top: 13, left: 50 },
        { id: "RW", label: "PD", pos: "Ponta", top: 20, left: 84 }
    ],
    "4-4-2": [
        { id: "GK", label: "GOL", pos: "Goleiro", top: 90, left: 50 },
        { id: "LB", label: "LE", pos: "Lateral", top: 72, left: 12 },
        { id: "CB1", label: "ZAG", pos: "Zagueiro", top: 78, left: 37 },
        { id: "CB2", label: "ZAG", pos: "Zagueiro", top: 78, left: 63 },
        { id: "RB", label: "LD", pos: "Lateral", top: 72, left: 88 },
        { id: "LM", label: "ME", pos: "Ponta", top: 48, left: 14 },
        { id: "CM1", label: "MC", pos: "Meio-Campista", top: 52, left: 38 },
        { id: "CM2", label: "MC", pos: "Meio-Campista", top: 52, left: 62 },
        { id: "RM", label: "MD", pos: "Ponta", top: 48, left: 86 },
        { id: "ST1", label: "ATA", pos: "Atacante", top: 17, left: 38 },
        { id: "ST2", label: "ATA", pos: "Atacante", top: 17, left: 62 }
    ],
    "3-5-2": [
        { id: "GK", label: "GOL", pos: "Goleiro", top: 90, left: 50 },
        { id: "CB1", label: "ZAG", pos: "Zagueiro", top: 76, left: 28 },
        { id: "CB2", label: "ZAG", pos: "Zagueiro", top: 80, left: 50 },
        { id: "CB3", label: "ZAG", pos: "Zagueiro", top: 76, left: 72 },
        { id: "LM", label: "ME", pos: "Lateral", top: 48, left: 8 },
        { id: "CM1", label: "VOL", pos: "Volante", top: 54, left: 32 },
        { id: "CM2", label: "MC", pos: "Meio-Campista", top: 58, left: 50 },
        { id: "CM3", label: "VOL", pos: "Volante", top: 54, left: 68 },
        { id: "RM", label: "MD", pos: "Lateral", top: 48, left: 92 },
        { id: "ST1", label: "ATA", pos: "Atacante", top: 17, left: 38 },
        { id: "ST2", label: "ATA", pos: "Atacante", top: 17, left: 62 }
    ],
    "5-3-2": [
        { id: "GK", label: "GOL", pos: "Goleiro", top: 90, left: 50 },
        { id: "LB", label: "LE", pos: "Lateral", top: 70, left: 10 },
        { id: "CB1", label: "ZAG", pos: "Zagueiro", top: 78, left: 30 },
        { id: "CB2", label: "ZAG", pos: "Zagueiro", top: 80, left: 50 },
        { id: "CB3", label: "ZAG", pos: "Zagueiro", top: 78, left: 70 },
        { id: "RB", label: "LD", pos: "Lateral", top: 70, left: 90 },
        { id: "CM1", label: "MC", pos: "Meio-Campista", top: 50, left: 30 },
        { id: "CM2", label: "VOL", pos: "Volante", top: 54, left: 50 },
        { id: "CM3", label: "MC", pos: "Meio-Campista", top: 50, left: 70 },
        { id: "ST1", label: "ATA", pos: "Atacante", top: 17, left: 38 },
        { id: "ST2", label: "ATA", pos: "Atacante", top: 17, left: 62 }
    ],
    "4-2-3-1": [
        { id: "GK", label: "GOL", pos: "Goleiro", top: 90, left: 50 },
        { id: "LB", label: "LE", pos: "Lateral", top: 72, left: 14 },
        { id: "CB1", label: "ZAG", pos: "Zagueiro", top: 78, left: 36 },
        { id: "CB2", label: "ZAG", pos: "Zagueiro", top: 78, left: 64 },
        { id: "RB", label: "LD", pos: "Lateral", top: 72, left: 86 },
        { id: "CDM1", label: "VOL", pos: "Volante", top: 60, left: 37 },
        { id: "CDM2", label: "VOL", pos: "Volante", top: 60, left: 63 },
        { id: "CAM_L", label: "MEA", pos: "Meia Ofensivo", top: 34, left: 20 },
        { id: "CAM_C", label: "MEA", pos: "Meia Ofensivo", top: 30, left: 50 },
        { id: "CAM_R", label: "MEA", pos: "Meia Ofensivo", top: 34, left: 80 },
        { id: "ST", label: "ATA", pos: "Atacante", top: 13, left: 50 }
    ]
};

function jogadorManagerPorId(id) {
    if (!id) return null;
    if (id === "player") return jogador;
    return jogadoresIA.find(p => p.id === id);
}

// Garante que existe uma escalação válida para a formação atual — monta do
// zero (melhor jogador disponível por posição) na primeira vez ou quando a
// formação muda, e preserva os ajustes manuais do treinador nas demais vezes,
// só recompondo vagas de jogadores que saíram do clube.
function garantirEscalacaoManager(clube) {
    const slots = FORMACOES_SLOTS[managerEstado.tatica.formacao] || FORMACOES_SLOTS["4-3-3"];
    const elenco = jogadoresIA.filter(p => p.clubeId === clube.id && !p.aposentado);
    if (jogador?.clubeId === clube.id) elenco.push(jogador);
    if (!managerEstado.escalacao) managerEstado.escalacao = { titulares: {}, banco: [], formacaoUsada: null };
    const esc = managerEstado.escalacao;
    const idsElenco = new Set(elenco.map(p => p.id));

    if (esc.formacaoUsada !== managerEstado.tatica.formacao || Object.keys(esc.titulares).length === 0) {
        const usados = new Set();
        esc.titulares = {};
        slots.forEach(slot => {
            let candidato = elenco.filter(p => p.posicao === slot.pos && !usados.has(p.id)).sort((a, b) => b.geral - a.geral)[0]
                || elenco.filter(p => !usados.has(p.id)).sort((a, b) => b.geral - a.geral)[0];
            if (candidato) { esc.titulares[slot.id] = candidato.id; usados.add(candidato.id); }
        });
        esc.banco = elenco.filter(p => !usados.has(p.id)).sort((a, b) => b.geral - a.geral).slice(0, 7).map(p => p.id);
        esc.formacaoUsada = managerEstado.tatica.formacao;
    } else {
        Object.keys(esc.titulares).forEach(slotId => { if (!idsElenco.has(esc.titulares[slotId])) delete esc.titulares[slotId]; });
        esc.banco = esc.banco.filter(id => idsElenco.has(id));
        const usados = new Set([...Object.values(esc.titulares), ...esc.banco]);
        slots.forEach(slot => {
            if (!esc.titulares[slot.id]) {
                let candidato = elenco.filter(p => p.posicao === slot.pos && !usados.has(p.id)).sort((a, b) => b.geral - a.geral)[0]
                    || elenco.filter(p => !usados.has(p.id)).sort((a, b) => b.geral - a.geral)[0];
                if (candidato) { esc.titulares[slot.id] = candidato.id; usados.add(candidato.id); }
            }
        });
        elenco.forEach(p => { if (!usados.has(p.id) && esc.banco.length < 7) { esc.banco.push(p.id); usados.add(p.id); } });
    }
    return esc;
}

// Seleção ativa para o modo clique (funciona em qualquer dispositivo, ao
// contrário do drag & drop que só é confiável em desktop).
window.managerSelecaoAtiva = null;

function trocarTitulares(esc, slotA, slotB) {
    const tmp = esc.titulares[slotA];
    esc.titulares[slotA] = esc.titulares[slotB];
    esc.titulares[slotB] = tmp;
}

function trocarBancoPorSlot(esc, slotId, playerId) {
    const atual = esc.titulares[slotId];
    esc.titulares[slotId] = playerId;
    esc.banco = esc.banco.filter(id => id !== playerId);
    if (atual) esc.banco.push(atual);
}

window.managerClicarSlot = function(slotId) {
    const esc = managerEstado.escalacao;
    const sel = window.managerSelecaoAtiva;
    if (!sel) { window.managerSelecaoAtiva = { tipo: "slot", id: slotId }; renderizarManagerTactics(); return; }
    if (sel.tipo === "slot") {
        if (sel.id !== slotId) trocarTitulares(esc, sel.id, slotId);
    } else {
        trocarBancoPorSlot(esc, slotId, sel.id);
    }
    window.managerSelecaoAtiva = null;
    window.salvarJogo();
    renderizarManagerTactics();
};

window.managerClicarBanco = function(playerId) {
    const esc = managerEstado.escalacao;
    const sel = window.managerSelecaoAtiva;
    if (!sel) { window.managerSelecaoAtiva = { tipo: "banco", id: playerId }; renderizarManagerTactics(); return; }
    if (sel.tipo === "banco") {
        window.managerSelecaoAtiva = sel.id === playerId ? null : { tipo: "banco", id: playerId };
    } else {
        trocarBancoPorSlot(esc, sel.id, playerId);
        window.managerSelecaoAtiva = null;
    }
    window.salvarJogo();
    renderizarManagerTactics();
};

// Drag & drop nativo (bônus para desktop) — usa exatamente a mesma lógica de troca do modo clique.
window.managerDragStart = function(ev, tipo, id) {
    ev.dataTransfer.setData("text/plain", JSON.stringify({ tipo, id }));
    ev.dataTransfer.effectAllowed = "move";
};
window.managerDrop = function(ev, tipoAlvo, idAlvo) {
    ev.preventDefault();
    let origem; try { origem = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (e) { return; }
    if (!origem) return;
    const esc = managerEstado.escalacao;
    if (origem.tipo === "slot" && tipoAlvo === "slot" && origem.id !== idAlvo) trocarTitulares(esc, origem.id, idAlvo);
    else if (origem.tipo === "slot" && tipoAlvo === "banco") trocarBancoPorSlot(esc, origem.id, idAlvo);
    else if (origem.tipo === "banco" && tipoAlvo === "slot") trocarBancoPorSlot(esc, idAlvo, origem.id);
    window.managerSelecaoAtiva = null;
    window.salvarJogo();
    renderizarManagerTactics();
};

function renderizarManagerTactics() {
    const clube = clubeManagerAtual();
    if (!clube) return;
    obterTitularesClube(clube.id);
    const slots = FORMACOES_SLOTS[managerEstado.tatica.formacao] || FORMACOES_SLOTS["4-3-3"];
    const esc = garantirEscalacaoManager(clube);
    const sel = window.managerSelecaoAtiva;

    const pitchEl = document.getElementById("tactical-pitch");
    if (pitchEl) {
        pitchEl.innerHTML = `
            <div class="pitch-field">
                ${slots.map(slot => {
                    const p = jogadorManagerPorId(esc.titulares[slot.id]);
                    const selecionado = sel?.tipo === "slot" && sel.id === slot.id;
                    if (!p) return `<div class="pitch-slot pitch-slot-vazio ${selecionado ? "selecionado" : ""}" style="top:${slot.top}%; left:${slot.left}%;" onclick="managerClicarSlot('${slot.id}')" ondragover="event.preventDefault()" ondrop="managerDrop(event,'slot','${slot.id}')"><span class="pitch-slot-badge">${slot.label}</span><span class="pitch-slot-vazio-icon">+</span></div>`;
                    return `<div class="pitch-slot ${selecionado ? "selecionado" : ""}" draggable="true" style="top:${slot.top}%; left:${slot.left}%;" onclick="managerClicarSlot('${slot.id}')" ondragstart="managerDragStart(event,'slot','${slot.id}')" ondragover="event.preventDefault()" ondrop="managerDrop(event,'slot','${slot.id}')">
                        <span class="pitch-slot-badge">${slot.label}</span>
                        <img src="${obterUrlImagem(p, 'jogador')}" onerror="this.style.visibility='hidden'">
                        <strong>${p.nome.split(" ").slice(-1)[0]}</strong>
                        <small>OVR ${p.geral}</small>
                    </div>`;
                }).join("")}
            </div>
            <div class="pitch-bench">
                <h4>Banco de Reservas <small>${sel ? "Clique numa vaga ou reserva para completar a troca" : "Clique num jogador e depois no lugar pra onde ele vai"}</small></h4>
                <div class="pitch-bench-list" ondragover="event.preventDefault()">
                    ${esc.banco.map(id => {
                        const p = jogadorManagerPorId(id);
                        if (!p) return "";
                        const selecionado = sel?.tipo === "banco" && sel.id === id;
                        return `<div class="pitch-bench-item ${selecionado ? "selecionado" : ""}" draggable="true" onclick="managerClicarBanco('${id}')" ondragstart="managerDragStart(event,'banco','${id}')" ondrop="managerDrop(event,'banco','${id}')">
                            <img src="${obterUrlImagem(p, 'jogador')}" onerror="this.style.visibility='hidden'">
                            <span><strong>${p.nome}</strong><small>${p.posicao} • OVR ${p.geral}</small></span>
                        </div>`;
                    }).join("") || `<p style="color:#888; padding:8px;">Banco vazio.</p>`}
                </div>
            </div>`;
    }

    const squadListEl = document.getElementById("squad-list");
    if (squadListEl) {
        const titularesIds = new Set(Object.values(esc.titulares));
        const elenco = jogadoresIA.filter(p => p.clubeId === clube.id && !p.aposentado).sort((a, b) => b.geral - a.geral);
        if (jogador?.clubeId === clube.id) elenco.unshift(jogador);
        const capitaoId = (jogador?.clubeId === clube.id && jogador.eCapitao) ? "player" : (clube.capitaoId || null);
        squadListEl.innerHTML = elenco.map(p => {
            const ehCapitao = p.id === capitaoId;
            return `<div class="squad-player-item ${titularesIds.has(p.id) ? "titular" : ""}">
            <img class="squad-player-avatar-img" src="${obterUrlImagem(p, 'jogador')}" onerror="this.style.visibility='hidden'">
            <div class="squad-player-info"><span class="squad-player-name">${p.nome}${ehCapitao ? ' <span class="badge-capitao" title="Capitão">C</span>' : ''}</span><span class="squad-player-pos">${p.posicao}${titularesIds.has(p.id) ? " • Titular" : ""}</span></div>
            <span class="squad-player-ovr">${p.geral}</span>
        </div>`;
        }).join("");
    }

    const formSel = document.getElementById("formation-select");
    if (formSel) formSel.value = managerEstado.tatica.formacao;
    const mentSel = document.getElementById("mentality-select");
    if (mentSel) mentSel.value = { conservadora: "Defensiva", equilibrado: "Equilibrada", ofensiva: "Atacante" }[managerEstado.tatica.mentalidade] || "Equilibrada";
    const styleSel = document.getElementById("playstyle-select");
    if (styleSel) styleSel.value = { posse: "Posse", contra: "Contra", pressao: "Pressão" }[managerEstado.tatica.estilo] || "Pressão";
    const pressSel = document.getElementById("pressure-select");
    if (pressSel) pressSel.value = managerEstado.tatica.pressao || "média";
    const widthSel = document.getElementById("width-select");
    if (widthSel) widthSel.value = managerEstado.tatica.largura || "normal";
}

function renderizarManagerFullSquad() {
    const clube = clubeManagerAtual();
    const el = document.getElementById("full-squad-table");
    if (!clube || !el) return;
    const elenco = jogadoresIA.filter(p => p.clubeId === clube.id && !p.aposentado).sort((a, b) => b.geral - a.geral);
    if (jogador?.clubeId === clube.id) elenco.unshift(jogador);
    // 🆕 Braçadeira (C) e "Titular": usa a escalação REAL do treinador (a mesma
    // do campo tático, com os ajustes manuais dele) como fonte da verdade para
    // este clube — e não o cálculo automático genérico (esse é só para simular
    // estatísticas dos milhares de clubes que ninguém gerencia diretamente).
    // Se o próprio jogador já conquistou a braçadeira (conversa com o técnico),
    // isso tem prioridade sobre qualquer outro cálculo.
    const esc = garantirEscalacaoManager(clube);
    const idsTitulares = new Set(Object.values(esc.titulares));
    obterTitularesClube(clube.id); // garante fallback (capitaoId) computado, caso o jogador não seja capitão
    const capitaoId = (jogador?.clubeId === clube.id && jogador.eCapitao) ? "player" : (clube.capitaoId || null);
    el.innerHTML = `<div class="manager-full-squad-list">${elenco.map(p => {
        const ehCapitao = p.id === capitaoId;
        const ehTitular = idsTitulares.has(p.id) || ehCapitao;
        return `
        <div class="manager-row ${ehTitular ? 'manager-row-titular' : ''}" onclick="abrirPerfilJogador('${p.id}')">
            <img src="${obterUrlImagem(p, 'jogador')}" onerror="this.style.visibility='hidden'">
            <span><strong>${p.nome}${ehCapitao ? ' <span class="badge-capitao" title="Capitão">C</span>' : ''}</strong><small>${p.posicao} • ${p.idade || "-"} anos${ehTitular ? ' • Titular' : ''}</small></span>
            <em>OVR ${p.geral}</em>
            <em>${formatarMoeda(p.valorMercadoNum || calcularValorMercadoJogador(p))}</em>
        </div>`;
    }).join("") || `<p style="color:#aaa;">Elenco vazio.</p>`}</div>`;
}

function renderizarManagerTransfers(termoBusca = "") {
    const clube = clubeManagerAtual();
    const el = document.getElementById("transfer-results");
    if (!clube || !el) return;
    let lista;
    if (termoBusca.trim()) {
        const termo = termoBusca.trim().toLowerCase();
        lista = jogadoresIA.filter(p => p.clubeId !== clube.id && !p.aposentado && p.nome.toLowerCase().includes(termo)).slice(0, 20);
    } else {
        lista = jogadoresIA.filter(p => p.clubeId !== clube.id && !p.aposentado && p.geral <= (clube.reputacao || 70) + 12)
            .sort((a, b) => b.geral - a.geral).slice(0, 12);
    }
    el.innerHTML = lista.map(p => `<div class="manager-row"><img src="${obterUrlImagem(p, 'jogador')}" onerror="this.style.visibility='hidden'"><span><strong>${p.nome}</strong><small>${p.posicao} • OVR ${p.geral} • ${clubes.find(c => c.id === p.clubeId)?.nome || "Sem clube"}</small></span><button class="btn btn-primary" onclick="managerEnviarProposta('${p.id}')">${formatarMoeda(p.valorMercadoNum || calcularValorMercadoJogador(p))}</button></div>`).join("")
        || `<p style="color:#aaa;">Nenhum jogador encontrado.</p>`;
}

function renderizarManagerFinance() {
    const clube = clubeManagerAtual();
    if (!clube) return;
    const el = document.getElementById("view-manager-finance");
    if (!el) return;
    managerEstado.folhaSalarial = calcularFolhaClube(clube.id);
    const tabelaLiga = tabelasLigas[clube.ligaId];
    let posicaoHtml = `<p style="color:#aaa;">Tabela ainda não disponível.</p>`;
    let temporadaCompleta = false;
    if (tabelaLiga) {
        const maxJogos = (tabelaLiga.length - 1) * 2;
        const tabOrd = [...tabelaLiga].sort((a, b) => b.pontos - a.pontos || ((b.gols || 0) - (b.golsSofridos || 0)) - ((a.gols || 0) - (a.golsSofridos || 0)));
        const idx = tabOrd.findIndex(t => t.id === clube.id);
        const mt = tabOrd[idx];
        if (mt) {
            temporadaCompleta = mt.jogos >= maxJogos;
            posicaoHtml = `<div class="manager-kpis">
                <div><span>Posição</span><strong>${idx + 1}º / ${tabOrd.length}</strong></div>
                <div><span>Pontos</span><strong>${mt.pontos || 0}</strong></div>
                <div><span>Jogos</span><strong>${mt.jogos || 0}/${maxJogos}</strong></div>
                <div><span>Saldo</span><strong>${(mt.gols || 0) - (mt.golsSofridos || 0)}</strong></div>
            </div>
            <div class="manager-mini-note">${temporadaCompleta ? "Temporada da liga concluída — avance a época." : `V ${mt.vitorias || 0} • E ${mt.empates || 0} • D ${mt.derrotas || 0}`}</div>`;
        }
    }
    el.innerHTML = `
        <h3>Gestão Financeira</h3>
        <div class="finance-overview">
            <div class="finance-card"><h4>Orçamento de Transferências</h4><strong id="finance-transfer-budget">${formatarMoeda(managerEstado.orcamentoTransferencias)}</strong></div>
            <div class="finance-card"><h4>Folha Salarial Anual</h4><strong id="finance-wage-budget">${formatarMoeda(managerEstado.folhaSalarial)}</strong></div>
            <div class="finance-card"><h4>Confiança da Diretoria</h4><strong>${managerEstado.confianca}%</strong></div>
        </div>
        <section class="manager-panel" style="margin-top:16px;">
            <h3>Posição na Liga</h3>
            ${posicaoHtml}
            <button class="btn btn-primary" style="margin-top:12px;" onclick="managerSimularPartida()">${temporadaCompleta ? "Avançar Época" : "Simular Próximo Jogo"}</button>
        </section>
        <section class="manager-panel" style="margin-top:16px;">
            <h3>Categoria de Base</h3>
            ${(managerEstado.base || []).map(p => `<div class="manager-row"><img src="${obterUrlImagem(p, 'jogador')}" onerror="this.style.visibility='hidden'"><span><strong>${p.nome}</strong><small>${p.posicao} • OVR ${p.geral} • POT ${p.potencial}</small></span><button class="btn btn-success" onclick="managerPromoverJovem('${p.id}')">Promover</button></div>`).join("") || `<p style="color:#aaa;">Sem jovens na base.</p>`}
        </section>`;
}

function wireManagerControls() {
    const clube = clubeManagerAtual();
    if (!clube) return;

    document.querySelectorAll("#view-manager .manager-tab").forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll("#view-manager .manager-tab").forEach(b => b.classList.remove("active"));
            document.querySelectorAll("#view-manager .manager-view").forEach(v => v.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(btn.dataset.view)?.classList.add("active");
        };
    });

    const formSel = document.getElementById("formation-select");
    if (formSel) formSel.onchange = function() { managerDefinirTatica("formacao", this.value); };
    const mentSel = document.getElementById("mentality-select");
    if (mentSel) mentSel.onchange = function() { managerDefinirTatica("mentalidade", { Defensiva: "conservadora", Equilibrada: "equilibrado", Atacante: "ofensiva" }[this.value] || "equilibrado"); };
    const styleSel = document.getElementById("playstyle-select");
    if (styleSel) styleSel.onchange = function() { managerDefinirTatica("estilo", { Posse: "posse", Contra: "contra", "Pressão": "pressao" }[this.value] || "pressao"); };
    const pressSel = document.getElementById("pressure-select");
    if (pressSel) pressSel.onchange = function() { managerDefinirTatica("pressao", this.value); };
    const widthSel = document.getElementById("width-select");
    if (widthSel) widthSel.onchange = function() { managerDefinirTatica("largura", this.value); };

    const searchBtn = document.getElementById("transfer-search-btn");
    const searchInput = document.getElementById("transfer-search-input");
    if (searchBtn && searchInput) {
        searchBtn.onclick = () => renderizarManagerTransfers(searchInput.value);
        searchInput.onkeydown = (e) => { if (e.key === "Enter") renderizarManagerTransfers(searchInput.value); };
    }
}

function renderizarManager() {
    const el = document.getElementById("view-manager");
    if(!el) return;
    const treinador = managerEstado.treinador || { nome: jogador?.nome ? `Mister ${jogador.nome}` : "Novo Treinador", reputacao: Math.max(45, Math.min(88, Math.round((jogador?.geral || 65) * 0.9))), ataque: 62, defesa: 62, tatica: 62 };
    managerEstado.treinador = treinador;

    const dashboardEl = el.querySelector(".manager-dashboard");

    if(!managerEstado.ativo || !managerEstado.clubeId) {
        if (dashboardEl) dashboardEl.style.display = "none";
        let pick = document.getElementById("manager-pick-club-screen");
        if (!pick) { pick = document.createElement("div"); pick.id = "manager-pick-club-screen"; el.insertBefore(pick, el.firstChild); }
        pick.style.display = "block";
        const disponiveis = clubes
            .filter(c => c.reputacao <= treinador.reputacao + 14 && c.id !== jogador?.clubeId)
            .sort((a,b) => b.reputacao - a.reputacao)
            .slice(0, 12);
        pick.innerHTML = `
            <div class="manager-shell">
                <div class="manager-hero">
                    <div><span class="comp-int-kicker">Carreira de treinador</span><h2>Modo Manager</h2><p>Assuma um clube, controle orçamento, tática, mercado, base e confiança da diretoria.</p></div>
                    <div class="manager-license"><strong>REP ${treinador.reputacao}</strong><span>${treinador.nome}</span></div>
                </div>
                <div class="manager-club-grid">
                    ${disponiveis.map(c => `<button class="manager-club-card" onclick="managerAssumirClube('${c.id}')">
                        <img src="${obterUrlImagem(c, 'clube')}" alt="${c.nome}" onerror="this.style.visibility='hidden'">
                        <strong>${c.nome}</strong><span>Reputacao ${c.reputacao} • ${competicoes.find(l=>l.id===c.ligaId)?.nome || "Liga"}</span>
                    </button>`).join("")}
                </div>
            </div>`;
        return;
    }

    const pick = document.getElementById("manager-pick-club-screen");
    if (pick) pick.style.display = "none";
    if (dashboardEl) dashboardEl.style.display = "";

    const clube = clubeManagerAtual();
    if(!managerEstado.base?.length) managerEstado.base = gerarBaseManager(clube);
    managerEstado.folhaSalarial = calcularFolhaClube(clube.id);

    const nomeEl = document.getElementById("manager-club-name");
    if (nomeEl) nomeEl.textContent = `${clube.nome} — ${objetivoDiretoria(clube)}`;
    const budgetEl = document.getElementById("manager-budget");
    if (budgetEl) budgetEl.textContent = formatarMoeda(managerEstado.orcamentoTransferencias);
    const confEl = document.getElementById("manager-confidence");
    if (confEl) confEl.textContent = `${managerEstado.confianca}%`;
    const squadSizeEl = document.getElementById("manager-squad-size");
    if (squadSizeEl) squadSizeEl.textContent = jogadoresIA.filter(p => p.clubeId === clube.id && !p.aposentado).length;

    wireManagerControls();
    renderizarManagerTactics();
    renderizarManagerFullSquad();
    renderizarManagerTransfers();
    renderizarManagerFinance();
}

// ==========================================
// 🔄 ATUALIZADORES DE UI E MENUS
// ==========================================
function renderizarCalendarioTemporada() {
    const el = document.getElementById("uiCalendarioTemporada");
    const resumo = document.getElementById("uiCalendarioResumo");
    if(!el) return;
    normalizarAgendaCalendario();
    const proximos = agendaTemporada.slice(Math.max(0, rodadaAtual - 1), Math.max(0, rodadaAtual - 1) + 8);
    if(resumo) resumo.textContent = `${Math.min(rodadaAtual, agendaTemporada.length || 1)}/${agendaTemporada.length || 0} datas`;
    if(!proximos.length) {
        el.innerHTML = `<div class="calendar-empty">Temporada sem jogos pendentes.</div>`;
        return;
    }
    el.innerHTML = proximos.map((ev, idx) => {
        const compInfo = competicoes.find(c => c.id === ev.compId) || COMPETICOES_SELECOES.find(c => c.id === ev.compConfigId);
        const adv = ev.isSelecao ? SELECOES.find(s => s.id === ev.adversarioId) : clubes.find(c => c.id === ev.adversarioId);
        const logo = ev.isSelecao ? (compInfo?.logo || adv?.logo || "") : obterUrlImagem(compInfo || ev.compId, "competicao");
        const data = ev.dataCalendario || formatarDataCalendario(ev);
        return `
            <div class="calendar-row ${idx === 0 ? "atual" : ""}" onclick="aplicarTemaCompeticao('${ev.compConfigId || ev.compId || "hub"}')">
                <div class="calendar-date"><strong>${data.split(" • ")[0]}</strong><span>${data.split(" • ")[1] || ev.janelaCalendario || "Jogo"}</span></div>
                <div class="calendar-logo">${logo ? `<img src="${logo}" alt="">` : "🏆"}</div>
                <div class="calendar-main"><strong>${ev.tipo}</strong><span>${ev.isSelecao ? "Selecao" : "Clube"} vs ${adv?.nome || "Adversario a definir"}</span></div>
                <div class="calendar-tag">${ev.isFinal ? "Final" : (ev.isMataMata ? "Mata-mata" : "Liga")}</div>
            </div>`;
    }).join("");
}

function atualizarHub() {
    if (jogador) { inicializarEstadoCarreiraJogador(); atualizarProgressoObjetivos(); }
    else return;
    // 🛡️ FIX: atualizarHub() é sempre chamado no fim de qualquer avanço de
    // rodada/partida — é um ponto seguro para "destrancar" o botão de jogar,
    // liberando window.partidaEmAndamento (ver guarda anti-clique-duplo em
    // btnJogarHub/btnDescansar mais abaixo).
    window.partidaEmAndamento = false;
    normalizarAgendaCalendario();
    let meuClube = clubes.find(c => c.id === jogador.clubeId);
    jogador.valorMercadoNum = calcularValorMercadoJogador(jogador); 
    jogador.valorMercado = formatarMoeda(jogador.valorMercadoNum);
    
    let imgJ = document.getElementById('sidePlayerImg'); if(imgJ) imgJ.src = obterUrlImagem(jogador, 'jogador');
    let imgC = document.getElementById('sideClubeLogo'); if(imgC) imgC.src = meuClube ? obterUrlImagem(meuClube, 'clube') : '';

    setText("sideNome", jogador.nome); setText("sideGeral", jogador.geral); setText("sideClube", meuClube ? meuClube.nome : "Livre"); setText("uiIdade", jogador.idade);
    setText("uiValorMercado", jogador.valorMercado); setText("uiValorMercadoSide", jogador.valorMercado); setText("uiEnergiaTexto", `${Math.floor(jogador.energia)}%`);
    setText("uiStatusSelecao", statusTitularidade());
    // Show saves for goalkeepers, goals for other positions
    const labelEl = document.getElementById("labelGolsTemp");
    const golsEl = document.getElementById("estGolsTemp");
    const defesasEl = document.getElementById("estDefesasTemp");
    if(jogador.posicao === "Goleiro") {
        if(labelEl) labelEl.textContent = "Defesas Feitas";
        if(golsEl) golsEl.style.display = "none";
        if(defesasEl) {
            defesasEl.style.display = "block";
            defesasEl.textContent = jogador.estatisticasAtuais.defesas || 0;
        }
    } else {
        if(labelEl) labelEl.textContent = "Golos Marcados";
        if(golsEl) {
            golsEl.style.display = "block";
            golsEl.textContent = jogador.estatisticasAtuais.gols;
        }
        if(defesasEl) defesasEl.style.display = "none";
    }
    setText("estJogosTemp", jogador.estatisticasAtuais.jogos);
    setText("estNivelGeral", jogador.geral); setText("uiAnoAtual", anoAtual);
    const melhor = jogador.melhorAtuacao;
    const uiMelhor = document.getElementById("uiMelhorAtuacao");
    if(uiMelhor) {
        uiMelhor.innerHTML = melhor?.nota > 0
            ? `Nota <strong style="color:var(--gold);">${melhor.nota}</strong> — ${melhor.gols}G / ${melhor.assistencias}A vs ${melhor.adversario} (Rod. ${melhor.rodada})`
            : "Ainda sem destaque registrado.";
    }

    let enBar = document.getElementById("uiEnergiaBarra"); if(enBar) { enBar.style.width = `${jogador.energia}%`; enBar.style.background = jogador.energia > 50 ? "var(--success)" : "var(--danger)"; }

    let comp = agendaTemporada[rodadaAtual - 1]; let uiProx = document.getElementById("uiProximoComp");
    
    // FAILSAFE SUPREMO: Se a agenda estourou, o jogo força o fim da temporada sem perguntar pelos NPCs.
    let agendaEsgotada = (!comp);
    let failsafeAtivado = (rodadaAtual > agendaTemporada.length + 5);

    if (uiProx) {
        if (!agendaEsgotada) {
            // Check if this is a bye week (folga)
            if (comp.isFolga) {
                uiProx.innerHTML = `
                    <div class="next-match-meta"><span>🏆 ${comp.tipo}</span><strong>${formatarDataCalendario(comp)}</strong></div>
                    <div style="font-size:1.4rem; font-weight:700; color:var(--success);">🛌 Semana de Recuperação</div>
                    <div style="font-size:0.9rem; color:var(--text-muted);">Aproveita para recuperar energia e treinar</div>
                `;
                setText("btnJogarHub", "Passar Semana (Descanso) ➔"); aplicarTemaCompeticao("hub"); document.getElementById("btnJogarHub").disabled = false;
            } else {
                const minhaSelecao = comp.isSelecao ? SELECOES.find(s => s.id === (comp.mandanteId || jogador.selecaoId)) : null;
                let adv = comp.isSelecao ? SELECOES.find(s => s.id === comp.adversarioId) : clubes.find(c => c.id === comp.adversarioId);
                const meuNomeCard = comp.isSelecao ? (minhaSelecao?.nome || "Selecao") : (meuClube ? meuClube.nome : "Teu clube");
                const meuLogoCard = comp.isSelecao ? (minhaSelecao?.logo || "") : (meuClube ? obterUrlImagem(meuClube, 'clube') : "");
                const advLogoCard = comp.isSelecao ? (adv?.logo || "") : (adv ? obterUrlImagem(adv, 'clube') : "");
                const compLogoCard = comp.isSelecao ? (COMPETICOES_SELECOES.find(c => c.id === comp.compConfigId)?.logo || advLogoCard) : obterUrlImagem(comp.compId, 'competicao');
                const dataCompromisso = comp.dataCalendario || formatarDataCalendario(comp);
                uiProx.innerHTML = `
                    <div class="next-match-meta"><span><img src="${compLogoCard}" class="comp-logo" onerror="this.style.display='none'"> 🏆 ${comp.tipo}</span><strong>${dataCompromisso}</strong></div>
                    <div style="font-size:1.4rem; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center;"><div style="width:35px;height:35px;display:flex;align-items:center;justify-content:center;margin-right:10px;"><img src="${meuLogoCard}" style="max-width:100%;max-height:100%;object-fit:contain;"></div><span style="color:var(--theme-primary); font-weight:800; font-size:1.6rem;">${meuNomeCard}</span></div> 
                        <span style="color:var(--text-muted); font-size:1rem; margin:0 15px;">VS</span> 
                        <div style="display:flex; align-items:center;"><span style="font-weight:600; font-size:1.6rem; margin-right:10px;">${adv?.nome || 'Rival'}</span><div style="width:35px;height:35px;display:flex;align-items:center;justify-content:center;"><img src="${advLogoCard}" style="max-width:100%;max-height:100%;object-fit:contain;"></div></div>
                    </div>`;
                const textoAcao = jogador.lesaoRodadas > 0 ? "Fora por Lesão ➔" : (jogador.titularidade >= 68 ? "Entrar em Relvado ➔" : "Entrar do Banco ➔");
                setText("btnJogarHub", textoAcao); aplicarTemaCompeticao(comp.compConfigId || comp.compId); document.getElementById("btnJogarHub").disabled = false;
            }
        } else if (!failsafeAtivado) { 
            uiProx.innerHTML = `<div style="font-size:1.2rem; font-weight:700; color:var(--warning);">⏳ Sem jogos marcados. Finais e decisões globais a decorrer...</div>`;
            setText("btnJogarHub", "Avançar Semana Global ➔"); aplicarTemaCompeticao("hub"); document.getElementById("btnJogarHub").disabled = false;
        } else {
            uiProx.innerHTML = `<div style="font-size:1.2rem; font-weight:700; color:var(--success);">🏁 A Época terminou! O mundo aguarda a Gala.</div>`;
            setText("btnJogarHub", "Ir para a Gala Ouro ➔"); aplicarTemaCompeticao("hub"); document.getElementById("btnJogarHub").disabled = false;
        }
    }
    renderizarCalendarioTemporada();
    atualizarConteudoAbaAtiva(); renderizarMercado(); renderizarTransferencias(); renderizarNoticias();
}

function inicializarInterfaceTabelasClean() {
    let elDest = document.getElementById("view-classificacao");
    if(!elDest) return;
    if(!document.getElementById("paises-grid")) {
        elDest.innerHTML = `
            <div class="classificacao-shell">
                <div id="paises-grid" class="paises-grid"></div>
                <div id="divisoes-container" class="divisoes-container" style="display:none;"></div>
                <div id="areaTabelaEspecifica"></div>
            </div>`;
    }

    const gridPaises = document.getElementById("paises-grid");
    const divisoesCtx = document.getElementById("divisoes-container");
    const localTabela = document.getElementById("areaTabelaEspecifica");
    const paisInfo = {
        br: { nome: "Brasil", regiao: "CONMEBOL" },
        arg: { nome: "Argentina", regiao: "CONMEBOL" },
        eng: { nome: "Inglaterra", regiao: "UEFA" },
        esp: { nome: "Espanha", regiao: "UEFA" },
        ita: { nome: "Italia", regiao: "UEFA" },
        ger: { nome: "Alemanha", regiao: "UEFA" },
        fra: { nome: "Franca", regiao: "UEFA" },
        pt: { nome: "Portugal", regiao: "UEFA" },
        nl: { nome: "Holanda", regiao: "UEFA" },
        tr: { nome: "Turquia", regiao: "UEFA" },
        usa: { nome: "Estados Unidos", regiao: "CONCACAF" },
        ara: { nome: "Arabia", regiao: "AFC" },
        be: { nome: "Belgica", regiao: "UEFA" },
        uy: { nome: "Uruguai", regiao: "CONMEBOL" },
        mx: { nome: "Mexico", regiao: "CONCACAF" },
        sco: { nome: "Escócia", regiao: "UEFA" },
        nga: { nome: "Nigeria", regiao: "CONCACAF" },
        civ: { nome: "Costa Marfim", regiao: "CONCACAF" },
        
    };

    let paisesMapeados = {};
    const compsUnicas = Array.from(new Map(competicoes.filter(c => c.tipo === "liga" || c.tipo === "copa" || c.tipo === "supercopa" || c.tipo === "estadual").map(c => [c.id, c])).values());
    compsUnicas.forEach(comp => {
        let prefix = obterPaisCompeticaoId(comp.id);
        let info = paisInfo[prefix] || { nome: "Outros", regiao: "Mundo" };
        if (!paisesMapeados[info.nome]) {
            let primeiraDivisao = competicoes.find(c => c.id === `${prefix}_1`) || competicoes.find(c => c.tipo === "liga" && obterPaisCompeticaoId(c.id) === prefix);
            paisesMapeados[info.nome] = { info: { ...info, prefix, logo: primeiraDivisao?.logo || "" }, competicoes: [] };
        }
        paisesMapeados[info.nome].competicoes.push(comp);
    });

    const ordenarCompeticoesPais = (lista) => lista.sort((a,b) => {
        const peso = { liga: 0, copa: 1, supercopa: 2 };
        return (peso[a.tipo] ?? 9) - (peso[b.tipo] ?? 9) || (a.div || 99) - (b.div || 99) || a.nome.localeCompare(b.nome);
    });

    gridPaises.innerHTML = "";
    Object.keys(paisesMapeados).sort().forEach((pais, index) => {
        const grupo = paisesMapeados[pais];
        ordenarCompeticoesPais(grupo.competicoes);
        const totalCopas = grupo.competicoes.filter(c => c.tipo !== "liga").length;
        const totalLigas = grupo.competicoes.filter(c => c.tipo === "liga").length;
        const logoHTML = grupo.info.logo ? `<span class="pais-logo"><img src="${grupo.info.logo}" alt="${pais}"></span>` : `<span class="pais-logo">${grupo.info.prefix.toUpperCase().slice(0,2)}</span>`;
        const btnPais = document.createElement("button");
        btnPais.className = `btn-pais-filtro ${index === 0 ? 'ativo' : ''}`; 
        // 🛡️ Pedido do utilizador: mostrar só a logo da liga principal + nome
        // do país (sem o resumo "UEFA • 2 ligas • 2 copas").
        btnPais.innerHTML = `${logoHTML}<span class="pais-label">${pais}</span>`;
        btnPais.dataset.pais = pais;
        btnPais.dataset.prefix = grupo.info.prefix;
        btnPais.onclick = () => {
            gridPaises.querySelectorAll(".btn-pais-filtro").forEach(b => b.classList.remove("ativo"));
            btnPais.classList.add("ativo");
            aplicarCorLocalCompeticao(grupo.competicoes[0]?.id || grupo.info.prefix, localTabela);
            renderizarSubdivisoesPais(grupo.competicoes, divisoesCtx, localTabela, grupo.info);
        };
        gridPaises.appendChild(btnPais);
    });
    let primeirosPaises = Object.keys(paisesMapeados).sort();
    if(primeirosPaises.length > 0) {
        let primeiro = paisesMapeados[primeirosPaises[0]];
        renderizarSubdivisoesPais(primeiro.competicoes, divisoesCtx, localTabela, primeiro.info);
    }
}

function renderizarSubdivisoesPais(competicoesDoPais, divisoesCtx, localTabela, infoPais = null) {
    divisoesCtx.style.display = "flex"; divisoesCtx.innerHTML = ""; localTabela.innerHTML = "";
    competicoesDoPais.forEach((comp, idx) => {
        const btnDiv = document.createElement("button");
        btnDiv.className = `btn-divisao btn-divisao-logo ${idx === 0 ? 'ativo' : ''}`;
        // 🛡️ Pedido do utilizador: mostrar só a LOGO da competição (não o nome
        // em texto "Bundesliga / 1a divisao"). O nome fica disponível via
        // tooltip (title) para quem passar o mouse por cima.
        const rotuloTipo = comp.tipo === "liga" ? `${comp.div || 1}ª Divisão` : (comp.tipo === "supercopa" ? "Supercopa" : (comp.tipo === "estadual" ? "Estadual" : "Copa"));
        btnDiv.title = `${comp.nome} — ${rotuloTipo}`;
        btnDiv.innerHTML = `<img src="${obterUrlImagem(comp, 'competicao')}" alt="${comp.nome}" style="width:100%; height:100%; object-fit:contain;">`;
        btnDiv.dataset.compId = comp.id;
        btnDiv.onclick = () => {
            divisoesCtx.querySelectorAll(".btn-divisao").forEach(b => b.classList.remove("ativo"));
            btnDiv.classList.add("ativo");
            if(comp.tipo === "liga") exibirTabelaLigaCodigo(comp.id, localTabela);
            else exibirCompeticaoEliminatoriaCodigo(comp.id, localTabela);
        };
        divisoesCtx.appendChild(btnDiv);
    });
    if (competicoesDoPais.length > 0) {
        if(competicoesDoPais[0].tipo === "liga") exibirTabelaLigaCodigo(competicoesDoPais[0].id, localTabela);
        else exibirCompeticaoEliminatoriaCodigo(competicoesDoPais[0].id, localTabela);
    }
}

// Exibe um mata-mata (copa) na área de tabelas. Também assume o tema/fundo
// global da competição sendo visualizada, para que o jogador sinta que está
// "dentro" da competição enquanto navega/explora outras ligas e copas.
function exibirCompeticaoEliminatoriaCodigo(compId, containerTarget) {
    aplicarCorLocalCompeticao(compId, containerTarget);
    if (typeof aplicarTemaCompeticao === 'function') aplicarTemaCompeticao(compId);
    let compInfo = competicoes.find(c => c.id === compId);
    let estado = copasEstado[compId];
    let tipoLabel = compInfo?.tipo === "supercopa" ? "Supercopa nacional" : (compInfo?.tipo === "supercopa_continental" ? "Supercopa continental" : (compInfo?.tipo === "torneio_intercontinental" ? "Intercontinental" : "Copa nacional"));
    let html = `<div class="liga-header-card"><div class="liga-title-wrap"><div class="liga-logo-frame"><img src="${obterUrlImagem(compInfo || compId, 'competicao')}" alt="${compInfo?.nome || 'Competicao'}"></div><div><span>${tipoLabel}</span><h2>${compInfo?.nome || 'Competicao'}</h2></div></div><div class="meta-pill">Mata-mata</div></div>`;
    if(!estado) {
        containerTarget.innerHTML = `<div class="comp-detail-grid"><div>${html}<div style="width:100%; text-align:center; padding:34px; color:#aaa; font-size:1.05rem; background:rgba(0,0,0,0.28); border:1px solid rgba(255,255,255,0.1); border-radius:14px;">Sorteio ainda nao realizado.</div></div>${montarRankingCompeticao(compId)}</div>`;
        return;
    }
    if (estado.tipo === "liga_unica") {
        html += renderTabelaLigaSuica(estado);
        containerTarget.innerHTML = `<div class="comp-detail-grid"><div>${html}</div>${montarRankingCompeticao(compId)}</div>`;
        return;
    }
    let todasFases = [...(estado.historicoFases || []), estado];
    html += renderChaveamentoComAbas(todasFases);
    containerTarget.innerHTML = `<div class="comp-detail-grid"><div>${html}</div>${montarRankingCompeticao(compId)}</div>`;
}

// 🆕 Tabela única da Fase de Liga (formato suíço). Mostra as 3 faixas de
// classificação (direto às oitavas / playoff / eliminado) com uma legenda.
function renderTabelaLigaSuica(estado) {
    const tabOrd = [...estado.tabela].sort((a,b) => b.pts - a.pts || (b.gf-b.gs) - (a.gf-a.gs) || b.gf - a.gf);
    let html = `<div class="meta-pill" style="margin-bottom:10px;">Fase de Liga • Rodada ${Math.min(estado.rodadaAtual||1,8)}/8</div>`;
    html += `<table class="tabela-classificacao grupo-table" style="width:100%; border-collapse:collapse; text-align:left;">
        <thead><tr><th>Pos</th><th>Clube</th><th>Pts</th><th>J</th><th>GM</th><th>GS</th><th>SG</th></tr></thead><tbody>`;
    tabOrd.forEach((item, index) => {
        let clb = clubes.find(c => c.id === item.id);
        let ehMeuClube = jogador && clb?.id === jogador.clubeId;
        let zonaCor = index < 8 ? "#22c55e" : index < 24 ? "#facc15" : "#ef4444";
        let bgL = ehMeuClube ? "rgba(0,255,136,0.15)" : (index % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent");
        html += `<tr style="background:${bgL}; border-left:4px solid ${zonaCor}; cursor:pointer;" onclick="abrirPerfilClube('${item.id}')">
            <td style="font-weight:bold;">${index+1}º</td>
            <td style="display:flex; align-items:center; font-weight:bold; color:${ehMeuClube ? 'var(--theme-primary)' : '#fff'};">
                <div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;margin-right:12px;"><img src="${obterUrlImagem(clb,'clube')}" style="max-width:100%;max-height:100%;object-fit:contain;"></div>
                ${clb ? clb.nome : 'Clube'}${ehMeuClube ? ' <span class="tag-meu-clube">TU</span>' : ''}
            </td>
            <td style="color:#ffd700; font-weight:bold;">${item.pts}</td>
            <td>${item.j}</td><td>${item.gf}</td><td>${item.gs}</td><td>${(item.gf||0)-(item.gs||0)}</td>
        </tr>`;
    });
    html += `</tbody></table><div class="tabela-legenda" style="margin-top:10px;">
        <span class="tabela-legenda-item"><i style="background:#22c55e;"></i>1º-8º: Oitavas direto</span>
        <span class="tabela-legenda-item"><i style="background:#facc15;"></i>9º-24º: Playoff</span>
        <span class="tabela-legenda-item"><i style="background:#ef4444;"></i>25º-36º: Eliminado</span>
    </div>`;
    return html;
}
// Exibe a tabela de classificação de uma liga. Também assume o tema/fundo
// global da liga sendo visualizada (ver comentário acima).
function exibirTabelaLigaCodigo(ligaId, containerTarget) {
    aplicarCorLocalCompeticao(ligaId, containerTarget);
    if (typeof aplicarTemaCompeticao === 'function') aplicarTemaCompeticao(ligaId);
    let dadosTabela = tabelasLigas[ligaId]; let compInfo = competicoes.find(c => c.id === ligaId);
    if (!dadosTabela || !compInfo) { containerTarget.innerHTML = "<p style='color:#aaa;'>Nenhum dado para esta liga.</p>"; return; }

    let tabOrd = [...dadosTabela].sort((a,b) => b.pontos - a.pontos || ((b.gols||0) - (b.golsSofridos||0)) - ((a.gols||0) - (a.golsSofridos||0)) || (b.gols||0) - (a.gols||0));
    let zonas = obterZonasQualificacaoLiga(ligaId, tabOrd.length);

    let legendaHTML = zonas.length ? `<div class="tabela-legenda">${zonas.map(z => `<span class="tabela-legenda-item"><i style="background:${z.cor};"></i>${z.label} (${z.fim - z.inicio})</span>`).join("")}</div>` : "";

    let html = `
        <div class="liga-header-card"><div class="liga-title-wrap"><div class="liga-logo-frame"><img src="${obterUrlImagem(compInfo, 'competicao')}" alt="${compInfo.nome}"></div><div><span>Classificacao atual</span><h2>${compInfo.nome}</h2></div></div><div class="meta-pill">${dadosTabela.length} clubes</div></div>
        ${legendaHTML}
        <table class="tabela-classificacao grupo-table" style="width:100%; border-collapse:collapse; text-align:left;">
            <thead><tr><th>Pos</th><th>Clube</th><th>Pts</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GM</th><th>GS</th><th>SG</th></tr></thead>
            <tbody>
    `;

    tabOrd.forEach((item, index) => {
        let clb = clubes.find(c => c.id === item.id);
        let ehMeuClube = jogador && clb?.id === jogador.clubeId;
        let zona = obterZonaDaPosicao(zonas, index);
        let bgL = ehMeuClube ? "rgba(0, 255, 136, 0.15)" : (zona ? `color-mix(in srgb, ${zona.cor} 10%, transparent)` : (index % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"));
        let borda = zona ? `border-left:4px solid ${zona.cor};` : "border-left:4px solid transparent;";
        html += `
            <tr style="background:${bgL}; ${borda} cursor:pointer;" onclick="abrirPerfilClube('${item.id}')" title="${zona ? zona.label : ''}">
                <td style="font-weight:bold;">${index + 1}º</td>
                <td style="display:flex; align-items:center; font-weight:bold; color:${ehMeuClube ? 'var(--theme-primary)' : '#fff'};">
                    <div style="width:30px; height:30px; display:flex; align-items:center; justify-content:center; margin-right:15px;">
                        <img src="${obterUrlImagem(clb, 'clube')}" style="max-width:100%; max-height:100%; object-fit:contain;">
                    </div>
                    ${clb ? clb.nome : 'Clube'}${ehMeuClube ? ' <span class="tag-meu-clube">TU</span>' : ''}
                </td>
                <td style="color:#ffd700; font-weight:bold;">${item.pontos}</td>
                <td>${item.jogos}</td><td>${item.vitorias||0}</td><td>${item.empates||0}</td><td>${item.derrotas||0}</td>
                <td>${item.gols}</td><td>${item.golsSofridos}</td><td>${(item.gols||0) - (item.golsSofridos||0)}</td>
            </tr>`;
    });
    html += `</tbody></table>`; containerTarget.innerHTML = `<div class="comp-detail-grid"><div>${html}</div>${montarRankingCompeticao(ligaId)}</div>`;
}

function renderizarChaveamentosVisuais(copaSelecionada) {
    aplicarTemaCompeticao(copaSelecionada);
    const estado = copasEstado[copaSelecionada];
    if (!estado) return `<div style="width:100%; text-align:center; padding:40px; color:#aaa; font-size:1.2rem;">Sorteio ainda não realizado.</div>`; 

    let comp = competicoes.find(c=>c.id===copaSelecionada);
    let html = `<div style="display:flex; align-items:center; margin-bottom:25px; border-bottom:1px solid #333; padding-bottom:15px;"><img src="${obterUrlImagem(copaSelecionada, 'competicao')}" style="width:50px; height:50px; margin-right:20px; border-radius:8px; object-fit:contain;"><h2 style="color:var(--theme-primary); margin:0; font-size: 2rem;">${comp?.nome}</h2></div>`;

    if (estado.tipo === "liga_unica") {
        html += renderTabelaLigaSuica(estado);
        return `<div class="comp-detail-grid"><div>${html}</div>${montarRankingCompeticao(copaSelecionada)}</div>`;
    }
    html += renderChaveamentoComAbas([...(estado.historicoFases || []), estado]);
    return `<div class="comp-detail-grid"><div>${html}</div>${montarRankingCompeticao(copaSelecionada)}</div>`;
}

// Monta o HTML de um único confronto de mata-mata (cartão com os 2 clubes,
// placar, e estado). Reaproveitado tanto pela árvore horizontal quanto por
// qualquer outro contexto que precise mostrar um confronto isolado.
function montarConfrontoCardHtml(conf) {
    const isMeuJogo = conf.timeA.id === jogador.clubeId || conf.timeB.id === jogador.clubeId;
    const pen = conf.penaltis ? `<span class="penalty-badge">Pênaltis</span>` : "";
    const duasPartidas = conf.golsAIda !== null || conf.golsAVolta !== null;
    let placarA, placarB, subInfo = "";
    if (duasPartidas) {
        const aggA = (conf.golsAIda||0)+(conf.golsAVolta||0), aggB = (conf.golsBIda||0)+(conf.golsBVolta||0);
        if (conf.vencedorId) { placarA = aggA; placarB = aggB; subInfo = "Agregado"; }
        else { placarA = conf.golsAIda ?? "–"; placarB = conf.golsBIda ?? "–"; subInfo = "Jogo de ida"; }
    } else {
        const jogado = conf.golsA !== null && conf.golsA !== undefined;
        placarA = jogado ? conf.golsA : "–";
        placarB = jogado ? conf.golsB : "–";
    }
    const jogadoFinal = !!conf.vencedorId || (!duasPartidas && conf.golsA !== null && conf.golsA !== undefined);
    const team = (t, gols, win) => {
        if (!t) return conf.bye
            ? `<div class="bracket-slot-team tbd"><span class="bracket-slot-crest tbd-crest">–</span><span class="bracket-slot-name">Bye (folga)</span><span class="bracket-slot-goals">–</span></div>`
            : `<div class="bracket-slot-team tbd"><span class="bracket-slot-crest tbd-crest">?</span><span class="bracket-slot-name">A definir</span><span class="bracket-slot-goals">–</span></div>`;
        const elim = conf.vencedorId && conf.vencedorId !== t.id;
        return `<div class="bracket-slot-team ${win ? "winner" : ""} ${elim ? "eliminated" : ""}" onclick="abrirPerfilClube('${t.id}')">
            <img class="bracket-slot-crest" src="${obterUrlImagem(t,'clube')}" onerror="this.style.visibility='hidden'">
            <span class="bracket-slot-name">${t.nome}</span>
            <span class="bracket-slot-goals">${gols}</span>
            ${win ? '<span class="bracket-slot-check">✓</span>' : ""}
        </div>`;
    };
    return `<div class="bracket-slot ${isMeuJogo ? "meu-jogo" : ""} ${jogadoFinal ? "concluido" : "pendente"}">
        ${team(conf.timeA, placarA, conf.vencedorId === conf.timeA.id)}
        <div class="bracket-slot-mid"><span class="bracket-slot-vs">${subInfo || (jogadoFinal ? "FT" : "VS")}</span>${pen}</div>
        ${team(conf.timeB, placarB, conf.vencedorId === conf.timeB.id)}
    </div>`;
}

// Renderiza o conteúdo de UMA fase de grupos, sem o wrapper de título/bloco
// antigo — o título passa a viver na aba correspondente. Fases de mata-mata
// já não passam por aqui: são combinadas numa árvore única (ver
// renderArvoreHorizontalMataMata), em vez de uma aba por rodada.
function renderConteudoFaseUnica(faseObj) {
    let html = ``;
    if(faseObj.tipo === "grupos") {
        const avancam = faseObj.avancam || 2;
        let gridGrupos = `<div class="grupo-grid">`;
        faseObj.grupos.forEach(grp => {
            let tOrd = [...grp.equipas].sort((a,b) => b.pts - a.pts || (b.gf-b.gs) - (a.gf-a.gs));
            gridGrupos += `<div class="bracket-group-card">
                <div class="grupo-card-head"><h4>${grp.nome}</h4><span class="grupo-card-meta">${avancam} classificam</span></div>
                <table class="grupo-table"><thead><tr><th class="col-pos">#</th><th class="col-team">Clube</th><th>P</th><th>J</th><th>SG</th></tr></thead><tbody>
                ${tOrd.map((e,i) => {
                    let c = clubes.find(x=>x.id===e.id);
                    const rankClass = i===0?"rank-1":i===1?"rank-2":i===2?"rank-3":"";
                    const qualifica = i < avancam;
                    return `<tr class="${c?.id===jogador.clubeId?'bracket-row-me':''} ${qualifica?'row-qualifica':''} ${i===avancam-1?'linha-corte':''}" onclick="abrirPerfilClube('${c?.id}')">
                        <td class="col-pos"><span class="grupo-pos ${rankClass}">${i+1}</span></td>
                        <td class="col-team"><img src="${obterUrlImagem(c,'clube')}" class="bracket-flag">${c?.nome||''}</td>
                        <td><strong>${e.pts}</strong></td><td>${e.j}</td><td>${e.gf-e.gs > 0 ? "+" : ""}${e.gf-e.gs}</td>
                    </tr>`;
                }).join("")}</tbody></table></div>`;
        });
        gridGrupos += `</div>`;
        html += gridGrupos;
    }
    return html;
}

// ==========================================
// ÁRVORE DE CHAVEAMENTO HORIZONTAL (mata-mata)
// ==========================================
// Combina TODAS as rodadas de mata-mata (Oitavas, Quartas, Semis, Final...) num
// único painel, lado a lado horizontalmente, com linhas conectoras precisas
// ligando cada par de confrontos ao confronto da rodada seguinte — em vez da
// navegação antiga por abas (uma rodada por vez).
// Agrupa as fases de mata-mata em "blocos" visuais. Um bloco é uma sequência
// de fases onde cada uma tem exatamente METADE dos confrontos da anterior
// (Oitavas -> Quartas -> Semis -> Final, o "chaveamento" normal). Sempre que
// isso quebra — por exemplo o Playoff da Fase de Liga (8 confrontos) que gera
// as Oitavas (também 8 confrontos, porque 8 vencedores se juntam a mais 8
// classificados diretos) — a fase seguinte começa um bloco novo. Sem isto, a
// árvore tentava centralizar/conectar confrontos que não têm relação de
// "pai/filho" real entre si, e alguns times apareciam meio soltos/desalinhados.
function agruparFasesMataMataEmBlocos(fasesMataMata) {
    const blocos = [];
    let blocoAtual = [];
    fasesMataMata.forEach((fase, i) => {
        if (i === 0) { blocoAtual = [fase]; return; }
        const anterior = fasesMataMata[i - 1];
        const meiaMetade = fase.confrontos.length * 2 === anterior.confrontos.length;
        if (meiaMetade) { blocoAtual.push(fase); }
        else { blocos.push(blocoAtual); blocoAtual = [fase]; }
    });
    if (blocoAtual.length) blocos.push(blocoAtual);
    return blocos;
}

function renderArvoreHorizontalMataMata(fasesMataMata) {
    if (!fasesMataMata || !fasesMataMata.length) return `<div style="width:100%; text-align:center; padding:40px; color:#aaa;">Sorteio ainda não realizado.</div>`;

    const blocos = agruparFasesMataMataEmBlocos(fasesMataMata);
    return blocos.map((bloco, i) => {
        const arvore = renderBlocoArvoreMataMata(bloco);
        if (i === 0) return arvore;
        // Separador visual entre blocos que não se conectam diretamente (ex: Playoff -> Oitavas),
        // deixando claro que times classificados diretamente entram aqui.
        return `<div class="bracket-tree-bloco-sep"><span>➔ classificados diretos entram na chave ➔</span></div>${arvore}`;
    }).join("");
}

function renderBlocoArvoreMataMata(fasesMataMata) {
    const MATCH_H = 120;  // altura de cada cartão de confronto (2 linhas de time + "vs" + padding)
    const GAP0 = 30;      // espaço vertical entre confrontos na 1ª rodada
    const UNIT = MATCH_H + GAP0;
    const COL_W = 232;    // largura de cada cartão/coluna
    const COL_GAP = 54;   // largura do corredor de linhas conectoras entre rodadas

    const nRounds = fasesMataMata.length;
    const nMatchesRound0 = fasesMataMata[0].confrontos.length;
    const totalHeight = Math.max(MATCH_H, nMatchesRound0 * UNIT - GAP0);

    // Pré-calcula o "top" (posição vertical) de cada confronto em cada rodada,
    // de forma que cada par da rodada r fique perfeitamente centrado sobre o
    // confronto correspondente da rodada r+1.
    const tops = fasesMataMata.map((fase, r) => {
        const mult = Math.pow(2, r);
        return fase.confrontos.map((_, i) => i * UNIT * mult + (UNIT * (mult - 1)) / 2);
    });

    const colunas = fasesMataMata.map((fase, r) => {
        const cardsHtml = fase.confrontos.map((conf, i) => {
            return `<div class="bracket-tree-match" style="top:${tops[r][i]}px; height:${MATCH_H}px; width:${COL_W}px;">${montarConfrontoCardHtml(conf)}</div>`;
        }).join("");
        return `<div class="bracket-tree-round" style="width:${COL_W}px;">
            <div class="bracket-tree-round-title">${fase.fase || `Rodada ${r+1}`}</div>
            <div class="bracket-tree-round-body" style="height:${totalHeight}px; width:${COL_W}px;">${cardsHtml}</div>
        </div>`;
    });

    // Linhas SVG conectando cada par de confrontos da rodada r ao confronto
    // correspondente da rodada r+1 (posições calculadas com a mesma fórmula
    // usada acima, então os pontos batem exatamente).
    const conectores = [];
    for (let r = 0; r < nRounds - 1; r++) {
        const topsR = tops[r];
        const paths = [];
        for (let i = 0; i < topsR.length; i += 2) {
            if (topsR[i+1] === undefined) continue;
            const yA = topsR[i] + MATCH_H/2;
            const yB = topsR[i+1] + MATCH_H/2;
            const yMid = (yA + yB) / 2;
            const half = COL_GAP/2;
            paths.push(`<path d="M0,${yA} H${half} M0,${yB} H${half} M${half},${yA} V${yB} M${half},${yMid} H${COL_GAP}" stroke="var(--theme-primary,#00ff88)" stroke-width="2" fill="none" opacity="0.5"/>`);
        }
        conectores.push(`<svg class="bracket-tree-connector" width="${COL_GAP}" height="${totalHeight}" viewBox="0 0 ${COL_GAP} ${totalHeight}" preserveAspectRatio="none">${paths.join("")}</svg>`);
    }

    let corpo = "";
    for (let r = 0; r < nRounds; r++) {
        corpo += colunas[r];
        if (r < nRounds - 1) corpo += conectores[r];
    }

    return `<div class="bracket-tree-scroll"><div class="bracket-tree">${corpo}</div></div>`;
}

// Monta a navegação por abas/seções do mata-mata (Fase de Grupos, Oitavas,
// Quartas, Semis, Final...). Cada aba mostra apenas os seus confrontos, em
// grid, sem exigir scroll vertical da página inteira para ver as chaves.
function renderChaveamentoComAbas(fases) {
    const listaFases = (fases || []).filter(f => f && (f.tipo === "grupos" || f.tipo === "mata-mata"));
    if (!listaFases.length) return `<div style="width:100%; text-align:center; padding:40px; color:#aaa; font-size:1.05rem;">Sorteio ainda não realizado.</div>`;

    const fasesGrupos = listaFases.filter(f => f.tipo === "grupos");
    const fasesMataMata = listaFases.filter(f => f.tipo === "mata-mata");

    // Cada fase de grupos continua com a sua própria aba. Todas as fases de
    // mata-mata (Oitavas, Quartas, Semis, Final...) são combinadas numa única
    // aba, mostradas como uma árvore horizontal conectada — em vez de forçar
    // o utilizador a trocar de aba para ver cada rodada isoladamente.
    const abas = fasesGrupos.map(f => ({ titulo: f.fase || "Fase de Grupos", conteudo: renderConteudoFaseUnica(f) }));
    if (fasesMataMata.length) {
        abas.push({
            titulo: fasesMataMata.length > 1 ? "Mata-Mata" : (fasesMataMata[0].fase || "Mata-Mata"),
            conteudo: renderArvoreHorizontalMataMata(fasesMataMata)
        });
    }

    const idxAtiva = abas.length - 1; // por padrão mostra a fase mais recente/atual
    const tabsHtml = abas.map((a, i) => `<button class="bracket-tab-btn ${i === idxAtiva ? 'ativo' : ''}" data-fase-tab="${i}" onclick="mudarAbaBracket(this, ${i})">${a.titulo}</button>`).join("");
    const panelsHtml = abas.map((a, i) => `<div class="bracket-tab-panel ${i === idxAtiva ? 'ativo' : ''}" data-fase-panel="${i}">${a.conteudo}</div>`).join("");

    return `<div class="bracket-tabs-wrap">
        <div class="bracket-tabs">${tabsHtml}</div>
        <div class="bracket-tab-panels">${panelsHtml}</div>
    </div>`;
}

// Alterna a aba ativa dentro do container mais próximo (permite múltiplas
// instâncias de chaveamento com abas na mesma página, se necessário).
window.mudarAbaBracket = function(btn, idx) {
    const wrap = btn.closest(".bracket-tabs-wrap");
    if (!wrap) return;
    wrap.querySelectorAll(".bracket-tab-btn").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    wrap.querySelectorAll(".bracket-tab-panel").forEach(p => p.classList.remove("ativo"));
    const painel = wrap.querySelector(`.bracket-tab-panel[data-fase-panel="${idx}"]`);
    if (painel) painel.classList.add("ativo");
};

function atualizarConteudoAbaAtiva() {
    let btnAtivo = document.querySelector(".menu-item.ativo"); if (!btnAtivo) return;
    let abaAtivaId = btnAtivo.dataset.view;

    if (abaAtivaId === "view-classificacao") { if (typeof inicializarInterfaceTabelasClean === 'function') inicializarInterfaceTabelasClean(); } 
    else if (abaAtivaId === "view-chaveamentos") {
        if (typeof renderizarChaveamentosVisuais === 'function') {
            let cs = document.getElementById("selectFiltroCopa")?.value;
            let container = document.getElementById("containerChaveamento");
            if (container) container.innerHTML = renderizarChaveamentosVisuais(cs);
        }
    }
    else if (abaAtivaId === "view-mercado") { if (typeof renderizarMercado === 'function') renderizarMercado(); }
    else if (abaAtivaId === "view-transferencias") { if (typeof renderizarTransferencias === 'function') renderizarTransferencias(); }
    else if (abaAtivaId === "view-selecoes") { if (typeof renderizarSelecoes === 'function') renderizarSelecoes(); }
    else if (abaAtivaId === "view-comp-int") { if (typeof renderizarCompeticoesInternacionais === 'function') renderizarCompeticoesInternacionais(); }
    else if (abaAtivaId === "view-manager") { if (typeof renderizarManager === 'function') renderizarManager(); }
    else if (abaAtivaId === "view-lifestyle") { if (typeof renderLifestyleSystem === 'function') renderLifestyleSystem(); }
    else if (abaAtivaId === "view-noticias") { if (typeof renderizarNoticias === 'function') renderizarNoticias(); }
    else if (abaAtivaId === "view-historico") { if (typeof renderizarHistorico === 'function') renderizarHistorico(); }
}

// Views onde o jogador está livremente a "passear" por competições/tabelas
// que podem não ser as suas. Nestas, a navegação lateral (menu) não repõe
// automaticamente o fundo do jogador — mas o fundo MUDA dinamicamente
// conforme a liga/copa que estiver a ser visualizada (ver exibirTabelaLigaCodigo
// e exibirCompeticaoEliminatoriaCodigo), e é restaurado ao sair para outra secção.
const VIEWS_EXPLORACAO_LIVRE = ["view-classificacao", "view-chaveamentos", "view-comp-int", "view-selecoes"];

// ==========================================
// 📱 MENU LATERAL RETRÁTIL (mobile/tablet)
// ==========================================
// Em telas largas a sidebar fica sempre visível (como sempre foi). Abaixo do
// breakpoint definido no CSS, ela vira uma gaveta escondida fora da tela —
// estas funções abrem/fecham essa gaveta e escurecem o fundo (overlay).
window.toggleSidebarMobile = function() {
    document.querySelector(".dashboard-layout")?.classList.toggle("sidebar-aberta-mobile");
};
window.fecharSidebarMobile = function() {
    document.querySelector(".dashboard-layout")?.classList.remove("sidebar-aberta-mobile");
};

document.addEventListener("click", function(event) {
    const btn = event.target.closest(".menu-item");
    if (btn) {
        document.querySelectorAll(".menu-item").forEach(item => item.classList.remove("ativo")); btn.classList.add("ativo");
        document.querySelectorAll(".view-section").forEach(aba => { aba.classList.add("oculto"); aba.style.display = "none"; });
        const elDest = document.getElementById(btn.dataset.view);
        if (elDest) {
            elDest.classList.remove("oculto"); elDest.style.display = "block";
            // Ao entrar em qualquer secção que não seja de exploração livre de
            // outras competições, repõe sempre o fundo da competição atual do jogador.
            if (!VIEWS_EXPLORACAO_LIVRE.includes(btn.dataset.view) && typeof restaurarTemaJogadorAtual === 'function') {
                restaurarTemaJogadorAtual();
            }
            atualizarConteudoAbaAtiva();
        }
        // 🆕 No mobile, a sidebar é uma gaveta — escolher uma seção deve fechá-la
        // automaticamente (senão o conteúdo fica escondido atrás do menu aberto).
        fecharSidebarMobile();
    }
});
document.addEventListener("change", function(event) {
    if (event.target.tagName.toLowerCase() === "select") { if (typeof atualizarConteudoAbaAtiva === 'function') atualizarConteudoAbaAtiva(); }
});

// Atalho "Minha Tabela": salta a navegação manual do menu lateral e leva o
// jogador diretamente para a tabela de classificação da SUA liga atual.
window.abrirMinhaTabela = function() {
    if (!jogador) { if (typeof mostrarToast === 'function') mostrarToast("Aviso", "Nenhuma carreira ativa encontrada.", "warning"); return; }
    const meuClube = clubes.find(c => c.id === jogador.clubeId);
    if (!meuClube || !meuClube.ligaId) {
        if (typeof mostrarToast === 'function') mostrarToast("Sem liga", "O teu clube ainda não está associado a uma liga.", "warning");
        return;
    }
    const ligaId = meuClube.ligaId;

    // Navega diretamente para a secção de Tabelas, sem passar pela navegação
    // manual do menu lateral (país -> divisão -> liga).
    document.querySelectorAll(".menu-item").forEach(item => item.classList.remove("ativo"));
    document.querySelector('.menu-item[data-view="view-classificacao"]')?.classList.add("ativo");
    document.querySelectorAll(".view-section").forEach(aba => { aba.classList.add("oculto"); aba.style.display = "none"; });
    const elDest = document.getElementById("view-classificacao");
    if (!elDest) return;
    elDest.classList.remove("oculto"); elDest.style.display = "block";

    if (typeof inicializarInterfaceTabelasClean === 'function') inicializarInterfaceTabelasClean();

    const gridPaises = document.getElementById("paises-grid");
    const divisoesCtx = document.getElementById("divisoes-container");
    const localTabela = document.getElementById("areaTabelaEspecifica");
    if (!gridPaises || !divisoesCtx || !localTabela) return;

    const prefix = obterPaisCompeticaoId(ligaId);
    const compsDoPais = competicoes.filter(c => (c.tipo === "liga" || c.tipo === "copa" || c.tipo === "supercopa" || c.tipo === "estadual") && obterPaisCompeticaoId(c.id) === prefix)
        .sort((a,b) => { const peso = { liga: 0, estadual: 1, copa: 2, supercopa: 3 }; return (peso[a.tipo] ?? 9) - (peso[b.tipo] ?? 9) || (a.div || 99) - (b.div || 99) || a.nome.localeCompare(b.nome); });

    gridPaises.querySelectorAll(".btn-pais-filtro").forEach(b => b.classList.toggle("ativo", b.dataset.prefix === prefix));

    const infoPaisBtn = gridPaises.querySelector(`.btn-pais-filtro[data-prefix="${prefix}"]`);
    const infoPais = { nome: infoPaisBtn?.querySelector(".pais-label")?.textContent || prefix, prefix };
    renderizarSubdivisoesPais(compsDoPais, divisoesCtx, localTabela, infoPais);

    // Garante que a divisão/liga ativa é exatamente a do jogador (mesmo que
    // não seja a primeira divisão do país) e mostra a tabela correspondente.
    const btnDivAlvo = divisoesCtx.querySelector(`.btn-divisao[data-comp-id="${ligaId}"]`);
    if (btnDivAlvo) {
        divisoesCtx.querySelectorAll(".btn-divisao").forEach(b => b.classList.remove("ativo"));
        btnDivAlvo.classList.add("ativo");
    }
    exibirTabelaLigaCodigo(ligaId, localTabela);

    elDest.scrollIntoView({ behavior: "smooth", block: "start" });
};
document.getElementById("btnMinhaTabela")?.addEventListener("click", () => {
    if (typeof abrirMinhaTabela === 'function') abrirMinhaTabela();
});

// ==========================================
// ⚙️ INÍCIO, PARTIDAS E BOTÕES MESTRES
// ==========================================

// Botão "JOGAR" do menu principal - apenas navega para a seleção de modo
document.getElementById("btnJogar")?.addEventListener("click", () => {
    mudarTela("telaModo");
});

// Botão "Entrar em Relvado" do hub do jogo - simulação de partida
// 🛡️ FIX: liga a trava anti-clique-duplo/duplicação de partida, com uma REDE
// DE SEGURANÇA — se por qualquer motivo (bug não previsto, aba em segundo
// plano, etc.) ela nunca for liberada normalmente por atualizarHub(), este
// timer solta-a sozinha depois de 6 minutos, para nunca deixar o jogador
// travado no botão "Entrar em Relvado" para sempre.
window.ativarPartidaEmAndamento = function() {
    window.partidaEmAndamento = true;
    clearTimeout(window._watchdogPartidaEmAndamento);
    window._watchdogPartidaEmAndamento = setTimeout(() => {
        if (window.partidaEmAndamento) {
            console.warn("Rede de segurança: a libertar 'partidaEmAndamento' presa há demasiado tempo.");
            window.partidaEmAndamento = false;
        }
    }, 6 * 60 * 1000);
};

document.getElementById("btnJogarHub")?.addEventListener("click", async () => {
    // 🛡️ FIX: impede que a partida/rodada seja iniciada DUAS VEZES ao mesmo
    // tempo (ex: clique duplo por impaciência, ou o retry automático do
    // sistema de "pronto" disparando junto com um clique manual). Sem isto,
    // no modo online isso podia criar duas simulações em paralelo — cada uma
    // a transmitir os seus próprios eventos para o Firebase — resultando numa
    // partida "bugada" que parecia nunca acabar e com estatísticas duplicadas.
    if (window.partidaEmAndamento) {
        console.warn("Ignorado: já existe uma partida/rodada em processamento.");
        return;
    }
    window.ativarPartidaEmAndamento();
    try {
        // In-game hub - proceed with match simulation
        inicializarEstadoCarreiraJogador();

        // 🌐 MUNDO COMPARTILHADO: sistema de "pronto" — ambos começam a rodada
        // exatamente ao mesmo tempo. Só avança quando o amigo também estiver pronto.
        if (window.connectionMode === 'online') {
            const pronto = await window.aguardarSincronizacaoRodada('btnJogarHub');
            if (!pronto) { window.partidaEmAndamento = false; return; }
        }

        let comp = agendaTemporada[rodadaAtual - 1];
        let textoBtn = document.getElementById("btnJogarHub").innerText.toLowerCase();

        // Check if in online room mode and handle ready state
        if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode() && window.firebaseIntegration.getRoomId()) {
            if (textoBtn.includes("gala")) {
                await window.processarFimTemporadaOnline();
                return;
            }

            if (!textoBtn.includes("avançar semana") && comp) {
                // Set ready for match and wait for room sync
                window.firebaseIntegration.setReadyForMatch(true);
                mostrarToast("Sala Online", "Aguardando amigo para simular partida...", "info");
                document.getElementById("btnJogarHub").disabled = true;
                document.getElementById("btnJogarHub").innerText = "Aguardando...";
                return;
            }
        }

        if (textoBtn.includes("avançar semana")) {
            await window.simularRodadaMundialOnline(); rodadaAtual++; window.salvarJogo(); atualizarHub();
            mostrarToast("Simulação", "Semana global avançada com sucesso.", "info");
            return;
        } else if (textoBtn.includes("gala")) {
            await window.processarFimTemporadaOnline();
            return;
        } else if (textoBtn.includes("descanso") && comp.isFolga) {
            // Handle bye week - give bonus energy recovery
            jogador.energia = Math.min(100, jogador.energia + 30);
            if(jogador.lesaoRodadas > 0) jogador.lesaoRodadas = Math.max(0, jogador.lesaoRodadas - 1);
            jogador.moral = Math.min(100, jogador.moral + 5);
            await window.simularRodadaMundialOnline(); rodadaAtual++; window.salvarJogo(); atualizarHub();
            mostrarToast("Recuperação", "Recuperaste energia e moral durante a semana de folga!", "success");
            return;
        }
        if(!comp) return;

        // VALIDATION: Check player state before match
        if (typeof jogador === 'undefined' || !jogador) {
            mostrarToast("Erro", "Dados do jogador não encontrados. Recarrega o jogo.", "danger");
            return;
        }

        if(jogador.lesaoRodadas > 0) {
            mostrarToast("Departamento Médico", `Estás lesionado por ${jogador.lesaoRodadas} semana(s). A equipa jogou sem ti.`, "warning");
            await window.simularRodadaMundialOnline(); rodadaAtual++; window.salvarJogo(); atualizarHub();
            return;
        }

        // VALIDATION: Check energy/fitness
        if (typeof jogador.energia === 'undefined' || jogador.energia === null || jogador.energia < 0) {
            jogador.energia = 100;
            console.warn("Energy was invalid, reset to 100");
        }

        const isSel = !!comp.isSelecao;
        const mandanteId = isSel ? (comp.mandanteId || jogador.selecaoId) : jogador.clubeId;
        const visitanteId = comp.adversarioId;
        
        // VALIDATION: Check opponent exists
        if (!visitanteId) {
            mostrarToast("Erro", "Adversário não encontrado. Contacta o suporte.", "danger");
            return;
        }

        const advPre = isSel ? SELECOES.find(s => s.id === visitanteId) : clubes.find(c => c.id === visitanteId);
        if (!advPre) {
            mostrarToast("Erro", "Dados do adversário não encontrados.", "danger");
            return;
        }

        // VALIDATION: Check Manager Mode starting XI
        if (window.managerState && window.managerState.ativo) {
            // Ensure valid starting XI is set
            if (!window.managerState.táticas || !window.managerState.táticas.formação) {
                mostrarToast("Erro", "Formação não definida. Configura as tuas táticas.", "warning");
                return;
            }
        }

        // Contexto do confronto (clássico, jogo grande, forma, novo técnico...) usado nas entrevistas e na escalação.
        const contextoJogo = avaliarContextoJogo(comp, advPre, isSel);
        // Escalação: seleção sempre chama o jogador como titular; no clube, a comissão técnica decide.
        const escalacao = isSel ? { statusAtual: "titular", minutoEntrada: null, entra: true } : decidirEscalacaoJogador();
        if(!isSel && contextoJogo.clube) jogador.tecnicoConhecido = contextoJogo.clube.tecnico;

        // ==========================================
        // VÍDEO/CINEMÁTICA DE ABERTURA — 1º jogo do ano de cada competição
        // continental ou internacional. Se existir um ficheiro de vídeo local
        // em assets/intros/{compId}.mp4 ele é tocado; caso contrário (ou se
        // falhar/não existir), cai automaticamente para uma cinemática animada
        // gerada no próprio jogo (logo real da competição + cores oficiais).
        // ==========================================
        const COMPETICOES_COM_INTRO = new Set([
            "uefa_cl", "uefa_el", "uefa_col", "conmebol_lib", "conmebol_sul", "concacaf_clc", "afc_cla",
            "copa_mundo", "euro", "copa_america", "olimpiadas", "gold_cup", "copa_africa", "copa_asia",
            "mundial_sub17", "mundial_sub21"
        ]);

        function precisaIntroCompeticao(compAtual) {
            const compId = compAtual?.compId || compAtual?.compConfigId;
            if (!compId || !COMPETICOES_COM_INTRO.has(compId)) return null;
            const chave = `${compId}_${anoAtual}`;
            if (introsExibidas[chave]) return null;
            return { compId, chave };
        }

        function exibirIntroCompeticao(compId, chave, onFinish) {
            introsExibidas[chave] = true;
            window.salvarJogo();
            // 🛡️ FIX: competições de SELEÇÃO (Copa do Mundo, Euro, Sub-17...) não
            // vivem no array "competicoes" (esse é só de clubes) — sem este
            // fallback, a intro delas aparecia sem nome nem logo nenhum.
            const compInfo = competicoes.find(c => c.id === compId)
                || COMPETICOES_SELECOES.find(c => c.id === compId)
                || COMPETICOES_SELECOES_BASE.find(c => c.id === compId);
            const cor = CORES_COMP?.[compId] || "#facc15";

            let overlay = document.getElementById("introCompeticaoOverlay");
            if (!overlay) { overlay = document.createElement("div"); overlay.id = "introCompeticaoOverlay"; document.body.appendChild(overlay); }
            overlay.className = "intro-comp-overlay";
            overlay.innerHTML = `
                <video id="introCompeticaoVideo" class="intro-comp-video oculto" playsinline></video>
                <div class="intro-comp-fallback" id="introCompeticaoFallback">
                    <div class="intro-comp-rays" style="--intro-cor:${cor};"></div>
                    ${compInfo?.logo ? `<img src="${compInfo.logo}" class="intro-comp-logo" onerror="this.style.display='none'">` : ""}
                    <h1 class="intro-comp-title" style="--intro-cor:${cor};">${compInfo?.nome || ""}</h1>
                    <p class="intro-comp-sub">Temporada ${anoAtual}</p>
                </div>
                <button class="intro-comp-skip" onclick="window.pularIntroCompeticao()">Pular ⏭</button>`;
            overlay.classList.remove("oculto");

            // 🛡️ FIX: guarda todos os timers pendentes da intro para poder
            // cancelá-los assim que ela terminar (por vídeo, por "Pular" ou por
            // fallback) — antes, um timer "esquecido" podia disparar segundos
            // depois, já com a partida seguinte em curso, mexendo no overlay ou
            // relançando o callback de início de partida por engano. Isso é o
            // suspeito mais provável para "as próximas partidas ficam bugadas
            // depois da intro".
            const timersIntro = [];
            let terminou = false;
            const finalizar = () => {
                if (terminou) return;
                terminou = true;
                timersIntro.forEach(t => clearTimeout(t));
                const v = document.getElementById("introCompeticaoVideo");
                if (v) { v.onended = null; v.onerror = null; v.onloadeddata = null; v.pause(); v.src = ""; }
                overlay.remove(); // 🛡️ remove do DOM por completo, não só esconde — zero estado residual
                onFinish();
            };
            window.pularIntroCompeticao = finalizar;

            const videoEl = document.getElementById("introCompeticaoVideo");
            const fallbackEl = document.getElementById("introCompeticaoFallback");
            const usarFallback = () => {
                if (terminou) return; // 🛡️ nunca reagir depois de já ter terminado
                fallbackEl.classList.remove("oculto"); videoEl.classList.add("oculto");
                timersIntro.push(setTimeout(finalizar, 4200));
            };
            videoEl.src = `assets/intros/${compId}.mp4`;
            videoEl.onerror = usarFallback;
            videoEl.onended = finalizar;
            videoEl.onloadeddata = () => {
                if (terminou) return;
                videoEl.classList.remove("oculto"); fallbackEl.classList.add("oculto");
                // 🔊 FIX: o vídeo estava sempre mudo (atributo "muted" fixo no
                // HTML) — por isso "o som não sai". Agora tenta tocar COM som;
                // se o navegador bloquear autoplay com áudio (política comum
                // de browsers sem interação prévia do utilizador), tenta de
                // novo mudo em vez de simplesmente desistir do vídeo inteiro.
                videoEl.muted = false;
                videoEl.play().catch(() => {
                    videoEl.muted = true;
                    videoEl.play().catch(usarFallback);
                });
            };
            // Se não existir ficheiro local nenhum, o navegador não dispara onloadeddata
            // nem sempre onerror rapidamente — este timeout garante que a cinemática
            // animada aparece de qualquer forma, sem travar o jogador numa tela preta.
            timersIntro.push(setTimeout(() => { if (!terminou && videoEl.readyState === 0) usarFallback(); }, 900));
        }

        // Função que efetivamente arranca a partida (só é chamada depois de fechadas
        // a conversa com o técnico e a eventual entrevista pré-jogo, evitando que
        // tudo apareça sobreposto e a simulação já ande enquanto o modal está aberto).
        function iniciarSimulacaoAoVivo() {
            const introInfo = precisaIntroCompeticao(comp);
            if (introInfo) { exibirIntroCompeticao(introInfo.compId, introInfo.chave, iniciarSimulacaoAoVivoReal); return; }
            iniciarSimulacaoAoVivoReal();
        }
        function iniciarSimulacaoAoVivoReal() {
            let mP = document.getElementById("modalPartida"); if(mP) mP.classList.remove("oculto");
            const minutoEntradaJogador = escalacao.statusAtual === "titular" ? null : (escalacao.entra ? escalacao.minutoEntrada : 999);

            // 🌐 CONFRONTO DIRETO ONLINE: quando o adversário desta partida é
            // exatamente o clube do amigo online, os dois assistem ao MESMO
            // jogo em tempo real. Um dos dois (determinado de forma
            // determinística, sem negociação) corre o motor de verdade e
            // transmite cada evento; o outro só reproduz o que chega.
            // Cobre dois casos: (a) os clubes são rivais e se enfrentam esta rodada,
            // ou (b) vocês estão no MESMO clube — nesse caso, toda partida do
            // clube é vivida pelos dois ao mesmo tempo (um joga, o outro assiste).
            const mesmoClubeQueAmigo = !isSel && window.connectionMode === 'online' && window.onlinePartnerClubeId && jogador.clubeId === window.onlinePartnerClubeId;
            const enfrentandoAmigo = !isSel && window.connectionMode === 'online' && window.onlinePartnerClubeId && visitanteId === window.onlinePartnerClubeId;
            const ehConfrontoDiretoOnline = (mesmoClubeQueAmigo || enfrentandoAmigo) && !!window.onlinePartnerId;
            const souHostConfronto = ehConfrontoDiretoOnline && window.lobbyPlayerId < window.onlinePartnerId;
            const matchKeyConfronto = ehConfrontoDiretoOnline ? `${[window.lobbyPlayerId, window.onlinePartnerId].sort().join('_')}_r${rodadaAtual}_${anoAtual}` : null;

            let engine;
            if (ehConfrontoDiretoOnline && !souHostConfronto) {
                // Sou o "convidado" deste confronto — não simulo nada, só assisto
                // em tempo real ao que o meu amigo está a jogar.
                const meuClubeObj = clubes.find(c => c.id === mandanteId);
                const advClubeObj = clubes.find(c => c.id === visitanteId);
                engine = {
                    isSelecao: false,
                    clubeMandanteId: mandanteId,
                    clubeVisitanteId: visitanteId,
                    nomeMandante: meuClubeObj?.nome || "Mandante",
                    nomeVisitante: advClubeObj?.nome || "Visitante",
                    simularPartidaAoVivo(onTick, onComplete) {
                        window.firebaseIntegration.assistirTransmissaoPartida(matchKeyConfronto, {
                            // Se somos rivais, o anfitrião trata-se como "mandante" no motor
                            // dele, então o MEU placar é o dele invertido. Se somos do MESMO
                            // clube, é exatamente o mesmo jogo — nada a inverter.
                            onTick: (min, gcHost, gvHost, log) => {
                                if (mesmoClubeQueAmigo) onTick(min, gcHost, gvHost, log);
                                else onTick(min, gvHost, gcHost, log);
                            },
                            onFinal: (dados) => {
                                const minhasGc = mesmoClubeQueAmigo ? dados.gc : dados.gv;
                                const minhasGv = mesmoClubeQueAmigo ? dados.gv : dados.gc;
                                const minutosJogadosMeus = escalacao.statusAtual === "titular" ? 90 : (escalacao.entra ? Math.max(0, 90 - escalacao.minutoEntrada) : 0);
                                onComplete(minhasGc, minhasGv, [], minutosJogadosMeus > 0, minutosJogadosMeus);
                            }
                        });
                    }
                };
            } else {
                engine = new MatchEngine(jogador, mandanteId, visitanteId, minutoEntradaJogador);
                if (ehConfrontoDiretoOnline && souHostConfronto) {
                    window.firebaseIntegration.limparTransmissaoPartida?.(matchKeyConfronto);
                }
            }

            if(isSel) {
                engine.isSelecao = true;
                const selM = SELECOES.find(s => s.id === mandanteId);
                const selV = SELECOES.find(s => s.id === visitanteId);
                if(selM) { engine.nomeMandante = selM.nome; engine.forcaMandante = calcularForcaSelecao(selM.id); }
                if(selV) { engine.nomeVisitante = selV.nome; engine.forcaVisitante = calcularForcaSelecao(selV.id); }
            }
            let casaObj = isSel ? SELECOES.find(s => s.id === mandanteId) : (clubes.find(c => c.id === engine.clubeMandanteId) || engine.nomeMandante);
            let visitaObj = isSel ? SELECOES.find(s => s.id === visitanteId) : (clubes.find(c => c.id === engine.clubeVisitanteId) || engine.nomeVisitante);

            let imgC = document.getElementById("imgTimeCasa"); if(imgC) imgC.src = isSel ? (casaObj?.logo || "") : obterUrlImagem(casaObj, 'clube');
            let imgV = document.getElementById("imgTimeVisita"); if(imgV) imgV.src = isSel ? (visitaObj?.logo || "") : obterUrlImagem(visitaObj, 'clube');
            setText("placarTimeCasa", engine.nomeMandante); setText("placarTimeVisita", engine.nomeVisitante);
            setText("placarMarcadorCasa", "0"); setText("placarMarcadorVisita", "0"); setText("uiMinutoJogo", "0'");
            const avisoEscalacao = ehConfrontoDiretoOnline
                ? "🌐 Confronto direto! Tu e o teu amigo estão a assistir a este jogo ao mesmo tempo."
                : (escalacao.statusAtual === "titular" ? "⚽ O árbitro apita para o início do jogo!"
                : (escalacao.statusAtual === "banco" ? "🪑 Começas no banco. Aguarda a tua oportunidade..." : "🪑 Não estás nos relacionados de hoje para entrar em campo."));
            setText("uiConsolePartida", `<div style='color:#00ff88; text-align:center;'>${avisoEscalacao}</div>`);

            let _ultimoMin = 0, _ultimoGc = 0, _ultimoGv = 0;
            engine.simularPartidaAoVivo((min, gc, gv, log) => {
                _ultimoMin = min; _ultimoGc = gc; _ultimoGv = gv;

                // 🌐 Sinais especiais de "pênalti em curso" vindos do amigo que está a
                // jogar (não são eventos reais de jogo — nunca aparecem no log nem
                // fazem soar apitos/golos). Mostram/escondem um aviso para quem está
                // só a assistir, para não parecer que o jogo travou sem motivo.
                if (log === "__PENALTY_WAIT__") {
                    let banner = document.getElementById("avisoPenaltiAmigo");
                    if (!banner) {
                        banner = document.createElement("div");
                        banner.id = "avisoPenaltiAmigo";
                        banner.style.cssText = "background:rgba(250,204,21,0.15); border:1px solid #facc15; color:#facc15; font-weight:800; text-align:center; padding:10px; border-radius:8px; margin-bottom:8px;";
                        banner.textContent = "⏳ O seu amigo está a bater/defender um pênalti... aguarde a cobrança!";
                        document.getElementById("uiConsolePartida")?.prepend(banner);
                    }
                    return;
                }
                if (log === "__PENALTY_RESUME__") {
                    document.getElementById("avisoPenaltiAmigo")?.remove();
                    return;
                }

                if (ehConfrontoDiretoOnline && souHostConfronto) {
                    window.firebaseIntegration.transmitirTick(matchKeyConfronto, { min, gc, gv, log: log || "" });
                }
                if (min <= 1) window.tocarSom('apito_inicio'); // 🔊 apito inicial, só uma vez no começo
                setText("uiMinutoJogo", `${min}'`); setText("placarMarcadorCasa", gc); setText("placarMarcadorVisita", gv);
                if(log) {
                    let c = document.getElementById("uiConsolePartida");
                    if(c){
                        const meuGol = log.includes("É SEU") || log.includes(jogador.nome);
                        const substituicao = log.includes("SUBSTITUIÇÃO");
                        const golTime = !meuGol && !substituicao && (log.includes("GOLO") || log.includes("GOL"));
                        if (meuGol || golTime) window.tocarSom('gol', meuGol ? 0.7 : 0.5); // 🔊 som de gol (mais forte se for teu)
                        c.innerHTML += `<div class="${meuGol ? "gol-meu" : (substituicao ? "gol-substituicao" : (golTime ? "gol-time" : ""))}">${meuGol ? "⭐ " : ""}${log}</div>`;
                        c.scrollTop = c.scrollHeight;
                    }
                }
            }, (gc, gv, marcadores, entrouEmCampo, minutosJogados) => {
                try {
                    window.tocarSom('apito_fim'); // 🔊 apito final
                    if (ehConfrontoDiretoOnline && souHostConfronto) {
                        window.firebaseIntegration.finalizarTransmissaoPartida(matchKeyConfronto, { gc, gv });
                    }
                    const fatorParticipacao = Math.max(0, Math.min(1, (minutosJogados ?? 90) / 90));
                    jogador.energia = Math.max(0, jogador.energia - Math.max(3, Math.round(25 * fatorParticipacao)));
                    const meuTimeId = isSel ? jogador.selecaoId : jogador.clubeId;
                    const souMandante = engine.clubeMandanteId === meuTimeId;
                    let pGolo = ({ "Atacante":0.65, "Ponta":0.48, "Meia Ofensivo":0.34, "Meio-Campista":0.22, "Volante":0.10, "Lateral":0.08, "Zagueiro":0.05, "Goleiro":0.01 })[jogador.posicao] ?? 0.25;
                    let pAssist = ({ "Atacante":0.25, "Ponta":0.42, "Meia Ofensivo":0.58, "Meio-Campista":0.50, "Volante":0.26, "Lateral":0.32, "Zagueiro":0.08, "Goleiro":0.02 })[jogador.posicao] ?? 0.25;
                    // ⚙️ Atributos individuais (finalização/passe) escalam estas chances
                    // continuamente, em vez de um bônus fixo só para quem tem OVR≥84.
                    pGolo = Math.min(0.9, pGolo * fatorAtributoIndividual(jogador, "finalizacao"));
                    pAssist = Math.min(0.9, pAssist * fatorAtributoIndividual(jogador, "passe"));

                    let golosAAtribuir = entrouEmCampo ? Math.max(0, Math.floor((souMandante ? gc : gv) * fatorParticipacao)) : 0;
                    let golsJogadorPartida = 0; let assistsJogadorPartida = 0;

                    // Track stats separately for club vs international
                    if(!isSel) {
                        if(entrouEmCampo) jogador.estatisticasAtuais.jogos++;
                        if(!jogador.estatisticasAtuais.assistencias) jogador.estatisticasAtuais.assistencias = 0;
    if(!jogador.estatisticasAtuais.defesas) jogador.estatisticasAtuais.defesas = 0;
                        // 🛡️ FIX: estatísticas defensivas REAIS para quando TU és
                        // defensor/goleiro (antes só existiam para NPCs via fórmula
                        // inventada — agora também acumulas de verdade).
                        if (entrouEmCampo && ["Zagueiro","Lateral","Goleiro"].includes(jogador.posicao)) {
                            const golsSofridosNoJogo = souMandante ? gv : gc;
                            if(!jogador.estatisticasAtuais.desarmes) jogador.estatisticasAtuais.desarmes = 0;
                            if(!jogador.estatisticasAtuais.interceptacoes) jogador.estatisticasAtuais.interceptacoes = 0;
                            if(!jogador.estatisticasAtuais.jogosSemSofrerGol) jogador.estatisticasAtuais.jogosSemSofrerGol = 0;
                            const fatorOvr = Math.max(0, (jogador.geral - 58)) / 100;
                            if (jogador.posicao === "Goleiro") {
                                const fatorReflexos = fatorAtributoIndividual(jogador, "reflexos");
                                jogador.estatisticasAtuais.defesas += Math.max(0, Math.round(((1.5 + fatorOvr * 3.2) * fatorReflexos + Math.random() * 2 - golsSofridosNoJogo * 0.3) * fatorParticipacao));
                            } else {
                                const fatorDefesa = fatorAtributoIndividual(jogador, "defesa");
                                jogador.estatisticasAtuais.desarmes += Math.round(((0.6 + fatorOvr * 2.0) * fatorDefesa + Math.random() * 1.4) * fatorParticipacao);
                                jogador.estatisticasAtuais.interceptacoes += Math.round(((0.5 + fatorOvr * 1.6) * fatorDefesa + Math.random() * 1.2) * fatorParticipacao);
                            }
                            if (golsSofridosNoJogo === 0) jogador.estatisticasAtuais.jogosSemSofrerGol++;
                        }
                        if(golosAAtribuir > 0) { for(let i=0; i<golosAAtribuir; i++) { if(Math.random() < pGolo) { jogador.estatisticasAtuais.gols++; golsJogadorPartida++; } else if(Math.random() < pAssist) { jogador.estatisticasAtuais.assistencias++; assistsJogadorPartida++; } } }
                        if(entrouEmCampo) registrarEstatisticaCompeticao(jogador, comp.compId, 1, golsJogadorPartida, assistsJogadorPartida);
                    } else {
                        // 🛡️ FIX: NÃO incrementa jogador.statsSelecao aqui — isso já é
                        // feito uma única vez em resolverLogicaPosPartida() via
                        // atualizarStatsSelecao(). Incrementar nos dois lugares
                        // duplicava jogos/gols/assistências da seleção a cada partida.
                        if(golosAAtribuir > 0) {
                            for(let i=0; i<golosAAtribuir; i++) {
                                if(Math.random() < pGolo) { golsJogadorPartida++; }
                                else if(Math.random() < pAssist) { assistsJogadorPartida++; }
                            }
                        }
                    }

                    const recordePessoal = registrarMelhorAtuacao(golsJogadorPartida, assistsJogadorPartida, advPre?.nome || comp.adversarioId);
                    if(golsJogadorPartida > 0) registrarNoticia(isSel ? "Destaque na seleção" : "Protagonista da partida", `${jogador.nome} marcou ${golsJogadorPartida} gol(s)${isSel ? " pela seleção" : " e saiu em destaque no relato ao vivo"}.`, isSel ? "Seleção" : "Partida", { nome: jogador.nome, foto: jogador.foto }, "jogador");
                    else if(assistsJogadorPartida > 0) registrarNoticia("Grande atuação", `${jogador.nome} deu ${assistsJogadorPartida} assistência(s)${isSel ? " pela seleção" : " e foi um dos destaques do jogo"}.`, isSel ? "Seleção" : "Partida", { nome: jogador.nome, foto: jogador.foto }, "jogador");
                    if(recordePessoal) registrarNoticia("Melhor atuação da carreira", `${jogador.nome} bateu a própria marca pessoal em campo.`, "Números", { nome: jogador.nome, foto: jogador.foto }, "jogador");
                    
                    // Allow training after playing a match
                    if(entrouEmCampo) {
                        jogador.jogouPartidaDesdeUltimoTreino = true;
                        jogador.treinosHoje = 0; // Reset training counter for new match
                        
                        // Decrease interview buff duration after match
                        if(jogador.buffEntrevista && jogador.buffEntrevista.expiresAfter > 0) {
                            jogador.buffEntrevista.expiresAfter--;
                            if(jogador.buffEntrevista.expiresAfter <= 0) {
                                delete jogador.buffEntrevista;
                            }
                        }
                    }

                    let msgBtn = document.getElementById("btnFecharModalPartida");
                    if(msgBtn) {
                        msgBtn.classList.remove("oculto");
                        msgBtn.onclick = async () => {
                            try {
                                msgBtn.classList.add("oculto"); if(mP) mP.classList.add("oculto");
                                await resolverLogicaPosPartida(comp, gc, gv, golsJogadorPartida, assistsJogadorPartida);

                                const meusGols = souMandante ? gc : gv; const golsSofridos = souMandante ? gv : gc;
                                if(!isSel) registrarFormaResultado(meusGols > golsSofridos ? "V" : (meusGols === golsSofridos ? "E" : "D"));

                                let participouBem = golosAAtribuir > 0 || (meusGols > golsSofridos);
                                if(!isSel) {
                                    if(!entrouEmCampo) ajustarTitularidade(-4); // ficar fora do jogo custa espaço no plantel
                                    else ajustarTitularidade(participouBem ? (escalacao.statusAtual === "banco" ? 7 : 4) : -3);
                                }
                                jogador.moral = Math.max(0, Math.min(100, jogador.moral + (entrouEmCampo ? (participouBem ? 4 : -3) : -1)));

                                // Entrevista pós-jogo: escolhe o tipo mais adequado ao contexto do resultado.
                                let tipoPos = "pos", chancePos = 0.25;
                                if(recordePessoal) { tipoPos = "pos_recorde"; chancePos = 0.6; }
                                else if(!isSel && contextoJogo.isClassico) { tipoPos = "pos_classico"; chancePos = 0.55; }
                                else if(golsSofridos - meusGols >= 3) { tipoPos = "pos_derrota_vexame"; chancePos = 0.65; }
                                else if(meusGols - golsSofridos >= 3 && contextoJogo.jogoGrande) { tipoPos = "pos_vitoria_grande"; chancePos = 0.6; }
                                else if(contextoJogo.jogoGrande) { chancePos = 0.4; }

                                const finalizarRodada = async () => {
                                    await window.simularRodadaMundialOnline(); rodadaAtual++; window.salvarJogo(); atualizarHub();
                                    if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode() && window.firebaseIntegration.getRoomId()) {
                                        window.firebaseIntegration.setReadyForMatch(false);
                                    }
                                };
                                if(Math.random() < chancePos) abrirEntrevista(tipoPos, { placar: `${gc}-${gv}`, adversario: contextoJogo.nomeAdversario, jogoGrande: contextoJogo.jogoGrande }, finalizarRodada);
                                else finalizarRodada();
                            } catch (error) {
                                console.error("Error processing match result:", error);
                                mostrarToast("Erro", "Erro ao processar resultado da partida.", "danger");
                            }
                        };
                    }
                } catch (error) {
                    console.error("Erro no callback pós-jogo:", error);
                }
            }, (tipo, resolverCallback) => {
                // 🎮 GAMEPLAY: pênalti interativo — chamado pelo motor quando és TU
                // quem bate ou quem defende. Mostra o mini-jogo de escolher o lado
                // e só continua a partida depois de resolveres.
                // 🌐 Se for um confronto direto online, avisa o teu amigo que estás
                // a bater/defender um pênalti, para ele não ver o jogo "congelado"
                // sem explicação enquanto tu decides o lado.
                if (ehConfrontoDiretoOnline && souHostConfronto) {
                    window.firebaseIntegration.transmitirTick(matchKeyConfronto, { min: _ultimoMin, gc: _ultimoGc, gv: _ultimoGv, log: "__PENALTY_WAIT__" });
                }
                abrirMiniJogoPenalti(tipo, (zonaEscolhida) => {
                    if (ehConfrontoDiretoOnline && souHostConfronto) {
                        window.firebaseIntegration.transmitirTick(matchKeyConfronto, { min: _ultimoMin, gc: _ultimoGc, gv: _ultimoGv, log: "__PENALTY_RESUME__" });
                    }
                    resolverCallback(zonaEscolhida);
                });
            });
        }

        // Fluxo sequencial: 1) conversa com o técnico sobre a escalação (só se mudou) →
        // 2) entrevista pré-jogo (contextual, mais provável em jogos grandes) → 3) começa a partida.
        function dispararEntrevistaPreEIniciar() {
            let tipoEsc = "pre", chance = 0.22;
            if(!isSel && contextoJogo.isClassico) { tipoEsc = "pre_classico"; chance = 0.55; }
            else if(contextoJogo.jogoGrande) { tipoEsc = "pre_grande"; chance = 0.5; }
            else if(!isSel && contextoJogo.novoTecnico) { tipoEsc = "novotecnico"; chance = 0.45; }
            else if(!isSel && contextoJogo.forma === "boa") { tipoEsc = "pre_boafase"; chance = 0.3; }
            else if(!isSel && contextoJogo.forma === "ma") { tipoEsc = "pre_mafase"; chance = 0.32; }

            if(Math.random() < chance) abrirEntrevista(tipoEsc, { adversario: contextoJogo.nomeAdversario, jogoGrande: contextoJogo.jogoGrande, tecnico: contextoJogo.nomeTecnico }, iniciarSimulacaoAoVivo);
            else iniciarSimulacaoAoVivo();
        }

        if(!isSel) conversarComTecnico(escalacao, contextoJogo, dispararEntrevistaPreEIniciar);
        else dispararEntrevistaPreEIniciar();
    } catch (outerError) {
        console.error("Erro geral no botão jogar:", outerError);
        window.partidaEmAndamento = false; // 🛡️ FIX: nunca deixa o jogador travado por causa de um erro
    }
});

document.getElementById("btnDescansar")?.addEventListener("click", async () => {
    // 🛡️ FIX: mesma guarda anti-clique-duplo/retry-duplicado do botão principal.
    if (window.partidaEmAndamento) {
        console.warn("Ignorado: já existe uma partida/rodada em processamento.");
        return;
    }
    window.ativarPartidaEmAndamento();
    try {
    inicializarEstadoCarreiraJogador();

    // 🌐 MUNDO COMPARTILHADO: mesmo sistema de "pronto" do botão principal.
    if (window.connectionMode === 'online') {
        const pronto = await window.aguardarSincronizacaoRodada('btnDescansar');
        if (!pronto) { window.partidaEmAndamento = false; return; }
    }

    let comp = agendaTemporada[rodadaAtual - 1]; 
    let textoBtn = document.getElementById("btnJogarHub").innerText.toLowerCase();
    
    if (textoBtn.includes("avançar semana")) { await window.simularRodadaMundialOnline(); rodadaAtual++; window.salvarJogo(); atualizarHub(); return; }
    if (textoBtn.includes("gala")) { await window.processarFimTemporadaOnline(); return; }
    if (!comp) return;

    let energyRecovery = 40;
    // Apply energy recovery multiplier from lifestyle upgrades
    if(jogador.lifestyle && jogador.lifestyle.multipliers.energyRecoveryMultiplier) {
        energyRecovery = Math.floor(energyRecovery * jogador.lifestyle.multipliers.energyRecoveryMultiplier);
    }
    jogador.energia = Math.min(100, jogador.energia + energyRecovery); 
    if(jogador.lesaoRodadas > 0) jogador.lesaoRodadas = Math.max(0, jogador.lesaoRodadas - 1);
    else ajustarTitularidade(-2);
    let cCasa = clubes.find(c => c.id === jogador.clubeId); let cVisita = clubes.find(c => c.id === comp.adversarioId);
    let diff = ((cCasa?.reputacao || 60) - (cVisita?.reputacao || 60)) / 20; 
    let pCasa = Math.random() + diff + 0.15; let pVisita = Math.random() - diff;
    let gc = pCasa > 0.5 ? (pCasa > 1.2 ? 3 : (pCasa > 0.8 ? 2 : 1)) : 0; let gv = pVisita > 0.6 ? (pVisita > 1.2 ? 3 : (pVisita > 0.9 ? 2 : 1)) : 0;
    
    await resolverLogicaPosPartida(comp, gc, gv);
    await window.simularRodadaMundialOnline(); 
    rodadaAtual++; 
    window.salvarJogo(); 
    atualizarHub();
    mostrarToast("Descanso", "A tua equipa jogou sem ti. Foste poupado esta rodada!", "info");
    } catch (erroDescanso) {
        console.error("Erro no botão Descansar:", erroDescanso);
        window.partidaEmAndamento = false; // 🛡️ FIX: nunca deixa o jogador travado por causa de um erro
    }
});

// Botão "Sair / Apagar Save" - apaga o progresso guardado e volta ao menu principal
document.getElementById("btnReset")?.addEventListener("click", () => {
    const confirmado = confirm("Tens a certeza que queres apagar o teu save? Esta ação é irreversível e vais perder todo o progresso da carreira.");
    if (!confirmado) return;

    try {
        localStorage.removeItem("rumo_estrelato_pro_vivo");

        // Se estiver numa sala online, sai da sala antes de recarregar
        if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode() && window.firebaseIntegration.getRoomId()) {
            window.firebaseIntegration.leaveRoom?.();
        }

        mostrarToast("Save Apagado", "O teu progresso foi apagado. A reiniciar...", "success");
        setTimeout(() => location.reload(), 800);
    } catch (error) {
        console.error("Erro ao apagar save:", error);
        mostrarToast("Erro", "Não foi possível apagar o save.", "danger");
    }
});

document.getElementById("btnTreinar")?.addEventListener("click", () => {
    inicializarEstadoCarreiraJogador();
    if(jogador.lesaoRodadas > 0) {
        mostrarToast("Treino bloqueado", "Estás lesionado. Usa descanso para recuperar.", "warning");
        return;
    }
    
    // Training requires playing a match first
    if(!jogador.jogouPartidaDesdeUltimoTreino) {
        mostrarToast("Treino bloqueado", "Precisas de jogar uma partida antes de treinar novamente.", "warning");
        return;
    }
    
    let ganho = 18 + Math.floor(Math.random() * 18);
    jogador.xpAtual = (jogador.xpAtual || 0) + ganho;
    jogador.energia = Math.max(10, jogador.energia - 18);
    jogador.felicidade = Math.min(100, (jogador.felicidade || 60) + 2);
    if(Math.random() < 0.35) jogador.inteligencia = Math.min(99, (jogador.inteligencia || 60) + 1);
    ajustarTitularidade(4);
    jogador.jogouPartidaDesdeUltimoTreino = false; // Reset flag after training
    
    if(jogador.xpAtual >= (jogador.xpNecessario || 100)) {
        jogador.xpAtual -= (jogador.xpNecessario || 100);
        jogador.xpNecessario = Math.floor((jogador.xpNecessario || 100) * 1.18);
        evoluirAtributosEGeral(jogador, 1);
        registrarNoticia("Evolução nos treinos", `${jogador.nome} subiu para OVR ${jogador.geral} após uma sequência forte de trabalho.`, "Treino");
        mostrarToast("Evolução", `OVR subiu para ${jogador.geral}!`, "success");
    } else {
        mostrarToast("Treino", `Ganhaste ${ganho} XP e pontos na briga por titularidade.`, "info");
    }
    
    atualizarUI();
    window.salvarJogo();
    atualizarHub();
});

// ==========================================
// 🎯 DISPUTA DE PÊNALTIS INTERATIVA (mata-mata de clube)
// ==========================================
// Substitui resolverVencedorMataMata quando o confronto empatou E o TEU
// clube está envolvido — em vez de resolver tudo instantaneamente, mostra a
// disputa cobrança por cobrança, com o mini-jogo interativo nas cobranças
// que te dizem respeito (bates se fores atacante/meia, defendes se fores
// guarda-redes). Se não estiveres envolvido ou não precisar de pênaltis,
// comporta-se exatamente como a função síncrona original.
async function resolverVencedorMataMataComPenaltisInterativos(idA, idB, golsA, golsB, forcaA, forcaB, meuTimeId) {
    if (golsA !== golsB || (meuTimeId !== idA && meuTimeId !== idB)) {
        return resolverVencedorMataMata(idA, idB, golsA, golsB, forcaA, forcaB);
    }
    return await disputaPenaltisInterativa(idA, idB, forcaA, forcaB, meuTimeId);
}

function _shootoutDecisaoAntecipada(scoreA, scoreB, tomadasA, tomadasB) {
    const restantesA = Math.max(0, 5 - tomadasA), restantesB = Math.max(0, 5 - tomadasB);
    return (scoreA > scoreB + restantesB) || (scoreB > scoreA + restantesA);
}

async function disputaPenaltisInterativa(idA, idB, forcaA, forcaB, meuTimeId) {
    const clubA = clubes.find(c => c.id === idA), clubB = clubes.find(c => c.id === idB);
    const nomeA = clubA?.nome || idA, nomeB = clubB?.nome || idB;

    let overlay = document.getElementById("shootoutOverlay");
    if (!overlay) { overlay = document.createElement("div"); overlay.id = "shootoutOverlay"; document.body.appendChild(overlay); }
    overlay.className = "shootout-overlay";
    overlay.innerHTML = `
        <div class="shootout-modal">
            <h2 class="shootout-titulo">🎯 DISPUTA DE PÊNALTIS</h2>
            <div class="shootout-placar">
                <div class="shootout-time"><img src="${obterUrlImagem(clubA,'clube')}"><span>${nomeA}</span><strong id="shootoutScoreA">0</strong></div>
                <div class="shootout-vs">×</div>
                <div class="shootout-time"><strong id="shootoutScoreB">0</strong><span>${nomeB}</span><img src="${obterUrlImagem(clubB,'clube')}"></div>
            </div>
            <div class="shootout-bolas" id="shootoutBolasA"></div>
            <div class="shootout-bolas" id="shootoutBolasB"></div>
            <p class="shootout-status" id="shootoutStatus">A preparar a disputa de pênaltis...</p>
        </div>`;
    overlay.classList.remove("oculto");
    window.tocarSom('notificacao', 0.4);

    let scoreA = 0, scoreB = 0;
    const setStatus = (t) => { const el = document.getElementById("shootoutStatus"); if (el) el.textContent = t; };
    const setPlacar = () => { setText("shootoutScoreA", scoreA); setText("shootoutScoreB", scoreB); };
    const addBola = (lado, converteu) => {
        const el = document.getElementById(lado === "A" ? "shootoutBolasA" : "shootoutBolasB");
        if (el) el.innerHTML += `<span class="shootout-bola ${converteu ? 'gol' : 'falhou'}">${converteu ? '⚽' : '❌'}</span>`;
    };

    const souGoleiro = jogador.posicao === "Goleiro";
    // 🎯 Mesma exigência da cobrança durante o jogo normal: só assumes a
    // responsabilidade do pênalti se fores titular, tiveres a confiança do
    // técnico, e já tiveres treinado o suficiente essa cobrança específica.
    const ehTitular = jogador.statusEscalacaoAnterior === "titular";
    const nivelPenaltis = jogador.lifestyle?.upgrades?.training?.penalties ?? 0;
    const reunoRequisitosPenalti = ehTitular && (jogador.relacaoTecnico ?? 0) >= MORAL_TECNICO_MINIMA_PENALTI && nivelPenaltis >= NIVEL_PENALTIS_MINIMO;
    const souCobradorTipico = ["Atacante","Ponta","Meia Ofensivo","Meio-Campista"].includes(jogador.posicao) && reunoRequisitosPenalti;

    // ladoSou = true quando é a cobrança do MEU clube.
    const cobrar = async (ladoSou, numeroCobranca) => {
        const meuLado = meuTimeId === idA ? "A" : "B";
        const estaCobrandoOMeuTime = (ladoSou && meuLado === "A") || (!ladoSou && meuLado === "B");
        const souEuQueBato = estaCobrandoOMeuTime && souCobradorTipico && numeroCobranca === 1;
        const souEuQueDefendo = !estaCobrandoOMeuTime && souGoleiro;
        let converteu;
        if (souEuQueBato || souEuQueDefendo) {
            setStatus(souEuQueBato ? "🎯 É a tua vez de cobrar!" : "🧤 Defende esta cobrança!");
            const zonaEscolhida = await new Promise(resolve => window.abrirMiniJogoPenalti(souEuQueBato ? "cobrar" : "defender", resolve));
            const zonas = ["esquerda", "centro", "direita"];
            const zonaAdversario = zonas[Math.floor(Math.random() * zonas.length)];
            const acertou = zonaEscolhida === zonaAdversario;
            if (souEuQueBato) {
                const finalizacaoAtributo = jogador.finalizacao ?? jogador.geral ?? 65;
                const chanceConverter = (acertou ? 0.30 : 0.90) + Math.max(0, (finalizacaoAtributo - 65)) * 0.004;
                converteu = Math.random() < Math.min(0.97, chanceConverter);
            } else {
                const defesaAtributo = jogador.reflexos ?? jogador.defesa ?? jogador.geral ?? 65;
                const chanceDefesa = (acertou ? 0.58 : 0.10) + Math.max(0, (defesaAtributo - 65)) * 0.006;
                converteu = !(Math.random() < Math.min(0.9, chanceDefesa));
            }
        } else {
            const forcaLado = (ladoSou ? forcaA : forcaB);
            setStatus(`${ladoSou ? nomeA : nomeB} vai cobrar...`);
            await new Promise(r => setTimeout(r, 750));
            converteu = Math.random() < Math.max(0.55, Math.min(0.92, 0.68 + (forcaLado - 70) * 0.004));
        }
        window.tocarSom(converteu ? 'gol' : 'erro', 0.4);
        return converteu;
    };

    let tomadasA = 0, tomadasB = 0, rodada = 1;
    while (true) {
        const numeroCobranca = rodada <= 5 ? rodada : 99; // 99 = morte súbita (sem "cobrador designado" fixo)
        const convA = await cobrar(true, numeroCobranca); tomadasA++;
        if (convA) scoreA++; addBola("A", convA); setPlacar();
        await new Promise(r => setTimeout(r, 350));

        const convB = await cobrar(false, numeroCobranca); tomadasB++;
        if (convB) scoreB++; addBola("B", convB); setPlacar();
        await new Promise(r => setTimeout(r, 350));

        if (rodada <= 5) {
            // Dentro das 5 cobranças normais: para se já está matematicamente
            // decidido, ou se chegaram ao fim das 5 com placares diferentes.
            if (_shootoutDecisaoAntecipada(scoreA, scoreB, tomadasA, tomadasB) || (rodada === 5 && scoreA !== scoreB)) break;
        } else {
            // Morte súbita: decide assim que uma rodada completa termina com placares diferentes.
            if (scoreA !== scoreB) break;
        }
        rodada++;
    }

    const vencedorId = scoreA > scoreB ? idA : idB;
    setStatus(`🏆 ${vencedorId === idA ? nomeA : nomeB} venceu a disputa de pênaltis!`);
    window.tocarSom(vencedorId === meuTimeId ? 'vitoria' : 'derrota');
    await new Promise(r => setTimeout(r, 2200));
    overlay.remove();
    return { vencedorId, penaltis: true, placarPen: `${scoreA}-${scoreB}` };
}

async function resolverLogicaPosPartida(comp, gc, gv, golsJogador = 0, assistsJogador = 0) {
    if (comp.isSelecao) {
        const key = comp.compId;
        const estado = selecoesEstado.torneios?.[key];
        const minhaSel = jogador.selecaoId;
        if(minhaSel) {
            registrarPlantelTorneio(key, minhaSel, ["player"]);
            atualizarStatsSelecao(jogador, 1, golsJogador, assistsJogador);
            registrarEstatisticaCompeticao(jogador, comp.compConfigId || key, 1, golsJogador, assistsJogador);
        }
        if(estado?.tipo === "grupos" && estado.grupos) {
            estado.grupos.forEach(grp => {
                const m = grp.equipas.find(e => e.id === minhaSel);
                const a = grp.equipas.find(e => e.id === comp.adversarioId);
                if(m && a) { m.j++; a.j++; m.gf += gc; m.gs += gv; a.gf += gv; a.gs += gc; if(gc>gv) m.pts += 3; else if(gv>gc) a.pts += 3; else { m.pts++; a.pts++; } }
            });
        } else if(estado?.tipo === "liga" && estado.tabela) {
            const m = estado.tabela.find(e => e.id === minhaSel);
            const a = estado.tabela.find(e => e.id === comp.adversarioId);
            if(m && a) { m.j++; a.j++; m.gf += gc; m.gs += gv; a.gf += gv; a.gs += gc; if(gc>gv) m.pts += 3; else if(gv>gc) a.pts += 3; else { m.pts++; a.pts++; } }
        } else if(estado?.tipo === "mata-mata" && estado.confrontos) {
            const conf = estado.confrontos.find(c => c.timeA.id === minhaSel || c.timeB.id === minhaSel);
            if(conf) {
                const isA = conf.timeA.id === minhaSel;
                conf.golsA = isA ? gc : gv;
                conf.golsB = isA ? gv : gc;
                const fA = calcularForcaSelecao(conf.timeA.id), fB = calcularForcaSelecao(conf.timeB.id);
                const res = resolverVencedorMataMata(conf.timeA.id, conf.timeB.id, conf.golsA, conf.golsB, fA, fB);
                conf.vencedorId = res.vencedorId; conf.penaltis = res.penaltis;
                if(estado.fase === "Final" && conf.vencedorId) {
                    estado.fase = "Campeão Definido"; estado.campeaoId = conf.vencedorId;
                    concederTituloInternacional(conf.vencedorId, estado.nome, key);
                    if(conf.vencedorId === minhaSel) {
                        const sel = SELECOES.find(s => s.id === minhaSel);
                        dispararAnimacaoCampeao(`Seleção ${sel?.nome}`, estado.nome, sel?.logo || "");
                    }
                } else if(estado.confrontos.every(c => c.vencedorId)) avancarMataMataInternacional(key);
            }
        }
        return;
    }
    if (comp.isMataMata === false && comp.fase !== "Grupos") {
        let t = tabelasLigas[comp.compId];
        if (t) {
            let mt = t.find(x => x.id === jogador.clubeId); let advt = t.find(x => x.id === comp.adversarioId);
            if(mt) { mt.jogos++; mt.gols = (mt.gols||0)+gc; mt.golsSofridos = (mt.golsSofridos||0)+gv; if(gc > gv){ mt.pontos+=3; mt.vitorias=(mt.vitorias||0)+1;} else if(gc===gv){ mt.pontos+=1; mt.empates=(mt.empates||0)+1; } else {mt.derrotas=(mt.derrotas||0)+1;} }
            if(advt) { advt.jogos++; advt.gols = (advt.gols||0)+gv; advt.golsSofridos = (advt.golsSofridos||0)+gc; if(gv > gc){ advt.pontos+=3; advt.vitorias=(advt.vitorias||0)+1;} else if(gc===gv){ advt.pontos+=1; advt.empates=(advt.empates||0)+1; } else {advt.derrotas=(advt.derrotas||0)+1;} }
        }
    } else if(comp.fase === "Grupos") {
        let estado = copasEstado[comp.compId];
        if(estado && estado.tipo === "grupos") {
            estado.grupos.forEach(grp => {
                let mGrp = grp.equipas.find(e => e.id === jogador.clubeId); let aGrp = grp.equipas.find(e => e.id === comp.adversarioId);
                if(mGrp && aGrp) { mGrp.j++; aGrp.j++; mGrp.gf+=gc; mGrp.gs+=gv; aGrp.gf+=gv; aGrp.gs+=gc; if(gc>gv) mGrp.pts+=3; else if(gv>gc) aGrp.pts+=3; else { mGrp.pts+=1; aGrp.pts+=1; } }
            });
        }
    } else if(comp.fase === "Fase de Liga") {
        // 🆕 FORMATO SUÍÇO: registra o meu jogo na tabela única e marca a partida
        // correspondente em estado.fixtures como resolvida, para que a simulação
        // semanal saiba que pode fechar a rodada e seguir em frente.
        let estado = copasEstado[comp.compId];
        if(estado && estado.tipo === "liga_unica") {
            const meuGol = comp.emCasa !== false ? gc : gv;
            const advGol = comp.emCasa !== false ? gv : gc;
            const fixture = (estado.fixtures || []).find(f => f.rodada === comp.rodadaLigaSuica && (f.home.id === jogador.clubeId || f.away.id === jogador.clubeId));
            if (fixture) {
                fixture.golsHome = fixture.home.id === jogador.clubeId ? meuGol : advGol;
                fixture.golsAway = fixture.away.id === jogador.clubeId ? meuGol : advGol;
            }
            const m = estado.tabela.find(e => e.id === jogador.clubeId);
            const a = estado.tabela.find(e => e.id === comp.adversarioId);
            if(m && a) { m.j++; a.j++; m.gf+=gc; m.gs+=gv; a.gf+=gv; a.gs+=gc; if(gc>gv) m.pts+=3; else if(gv>gc) a.pts+=3; else { m.pts+=1; a.pts+=1; } }
        }
    } else {
        let estado = copasEstado[comp.compId];
        if(estado && estado.tipo === "mata-mata" && estado.confrontos) {
            let conf = estado.confrontos.find(c => c.timeA.id === jogador.clubeId || c.timeB.id === jogador.clubeId);
            if(conf) {
                let isTimeA = conf.timeA.id === jogador.clubeId;
                if(comp.perna === 1) {
                    if(isTimeA) { conf.golsAIda = gc; conf.golsBIda = gv; } else { conf.golsBIda = gc; conf.golsAIda = gv; }
                    if(comp.isFinal || estado.jogoUnico || (estado.fase.includes("Final") && estado.pernasFinal !== 2)) {
                        const fA = clubes.find(c=>c.id===conf.timeA.id)?.reputacao || 70;
                        const fB = clubes.find(c=>c.id===conf.timeB.id)?.reputacao || 70;
                        const res = await resolverVencedorMataMataComPenaltisInterativos(conf.timeA.id, conf.timeB.id, isTimeA ? gc : gv, isTimeA ? gv : gc, fA, fB, jogador.clubeId);
                        conf.vencedorId = res.vencedorId; conf.penaltis = res.penaltis;
                        if (conf.vencedorId === jogador.clubeId) {
                            let nomeCop = competicoes.find(c=>c.id === comp.compId)?.nome || "Copa";
                            let meuC = clubes.find(c=>c.id===jogador.clubeId);
                            dispararAnimacaoCampeao(meuC.nome, nomeCop, obterUrlImagem(meuC, 'clube'));
                        }
                    }
                } 
                else {
                    if(isTimeA) { conf.golsAVolta = gc; conf.golsBVolta = gv; } else { conf.golsBVolta = gc; conf.golsAVolta = gv; }
                    let aggA = (conf.golsAIda||0) + (conf.golsAVolta||0); let aggB = (conf.golsBIda||0) + (conf.golsBVolta||0);
                    const fA = clubes.find(c=>c.id===conf.timeA.id)?.reputacao || 70;
                    const fB = clubes.find(c=>c.id===conf.timeB.id)?.reputacao || 70;
                    const res = await resolverVencedorMataMataComPenaltisInterativos(conf.timeA.id, conf.timeB.id, aggA, aggB, fA, fB, jogador.clubeId);
                    conf.vencedorId = res.vencedorId; conf.penaltis = res.penaltis;
                    if (conf.vencedorId === jogador.clubeId && (estado.fase.includes("Final") || comp.isFinal)) {
                        let nomeCop = competicoes.find(c=>c.id === comp.compId)?.nome || "Copa";
                        let meuC = clubes.find(c=>c.id===jogador.clubeId);
                        dispararAnimacaoCampeao(meuC.nome, nomeCop, obterUrlImagem(meuC, 'clube'));
                    }
                }
            }
        }
    }
}

// ==========================================
// MODE SELECTION EVENT HANDLERS
// ==========================================

document.getElementById("btnModoOffline")?.addEventListener("click", () => {
    // Check for existing save
    if (carregarJogo()) {
        mudarTela("view-hub");
    } else {
        mudarTela("telaCriacao");
    }
});

document.getElementById("btnModoOnline")?.addEventListener("click", () => {
    // Initialize online mode
    if (window.firebaseIntegration && window.firebaseIntegration.initializeOnlineMode()) {
        // Check for existing save
        if (carregarJogo()) {
            mudarTela("view-hub");
            mudarTela("view-amigos");
        } else {
            mudarTela("telaCriacao");
        }
    }
});

// ==========================================
// FRIENDS LOBBY EVENT HANDLERS
// ==========================================

document.getElementById("btnCopyCode")?.addEventListener("click", () => {
    const code = document.getElementById("myFriendCode").textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert("Código copiado para a área de transferência!");
    });
});

document.getElementById("btnConnectFriend")?.addEventListener("click", () => {
    const friendCode = document.getElementById("inputFriendCode").value.toUpperCase().trim();
    if (friendCode.length === 6) {
        if (window.firebaseIntegration) {
            window.firebaseIntegration.connectWithFriend(friendCode);
        }
    } else {
        alert("Código inválido. Deve ter 6 caracteres.");
    }
});

document.getElementById("btnToggleReady")?.addEventListener("click", () => {
    if (window.firebaseIntegration) {
        window.firebaseIntegration.toggleReadyStatus();
    }
});

document.getElementById("btnCancelarReconexao")?.addEventListener("click", () => {
    if (window.firebaseIntegration) {
        window.firebaseIntegration.cancelReconnection();
    }
});

// New Game Flow Architecture
window.gameMode = null; // 'player' or 'manager'
window.connectionMode = null; // 'offline' or 'online'
window.currentRoomId = null;
window.isHost = false;
window.lobbyPlayerId = null;

document.getElementById("btnModoJogador")?.addEventListener("click", () => {
    window.gameMode = 'player';
    mudarTela("telaConexao");
});

document.getElementById("btnModoManager")?.addEventListener("click", () => {
    window.gameMode = 'manager';
    mudarTela("telaConexao");
});

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

document.getElementById("btnIniciarCarreira")?.addEventListener("click", () => {
    jogador = JSON.parse(JSON.stringify(jogadorModelo));
    window.jogador = jogador; // 🛡️ FIX: mantém window.jogador (usado pelo firebase-integration.js) na mesma referência
    jogador.nome = document.getElementById("inputNome")?.value || "Craque";
    jogador.nacionalidade = document.getElementById("selectNacionalidade")?.value || "Brasil"; 
    jogador.posicao = document.getElementById("selectPosicao")?.value || "Atacante";
    inicializarEstadoCarreiraJogador();
    normalizarElencosEPosicoes();
    
    let nac = jogador.nacionalidade.toLowerCase(); let ligaPrefix = "pt"; 
    if(nac.includes("brasil")) ligaPrefix = "br"; else if(nac.includes("argentina")) ligaPrefix = "arg";
    else if(nac.includes("ingla")) ligaPrefix = "eng"; else if(nac.includes("espan")) ligaPrefix = "esp";
    else if(nac.includes("ital")) ligaPrefix = "ita"; else if(nac.includes("aleman")) ligaPrefix = "ger";
    else if(nac.includes("fran")) ligaPrefix = "fra"; else if(nac.includes("holan")) ligaPrefix = "nl";
    else if(nac.includes("turq")) ligaPrefix = "tr";  else if(nac.includes("arab")) ligaPrefix = "ara";
    else if(nac.includes("uru")) ligaPrefix = "uy";  else if(nac.includes("bel")) ligaPrefix = "be";
    else if(nac.includes("estados")) ligaPrefix = "usa";  else if(nac.includes("mex")) ligaPrefix = "mx";
    else if(nac.includes("nig")) ligaPrefix = "nga"; else if(nac.includes("costa")) ligaPrefix = "civ";


    let timesDisponiveis = clubes.filter(c => c.ligaId.startsWith(ligaPrefix)).sort((a,b) => a.reputacao - b.reputacao);
    let propostasIniciais = timesDisponiveis.length > 0 ? [
        timesDisponiveis[Math.max(0, Math.floor(timesDisponiveis.length * 0.15))],
        timesDisponiveis[Math.max(0, Math.floor(timesDisponiveis.length * 0.35))],
        timesDisponiveis[Math.max(0, Math.floor(timesDisponiveis.length * 0.58))]
    ].filter(Boolean) : [clubes[0]];
    jogador.propostasPrimeiroClube = propostasIniciais.map(c => c.id);
    jogador.clubeId = propostasIniciais[0]?.id || clubes[0].id; 
    jogador.contrato = 3;
    jogador.estatisticasAtuais = { jogos: 0, gols: 0, assistencias: 0 };
    jogador.statsSelecao = { jogos: 0, gols: 0, assistencias: 0, convocacoes: 0 };
    jogador.listaDesejos = [];
    jogador.objetivosCarreira = [];
    jogador.clubeAlvoId = null;
    jogador.melhorAtuacao = { gols: 0, assistencias: 0, nota: 0, adversario: "", rodada: 0 };
    
    // Initialize Lifestyle System
    jogador.lifestyle = {
        trainingPoints: 10,
        weeklyXP: 0,
        salary: 20000,
        fanBase: 1000,
        upgrades: {
            training: {
                freeKicks: 0,
                penalties: 0,
                stamina: 0,
                heading: 0,
                dribbling: 0,
                passing: 0,
                shooting: 0,
                defending: 0,
                pace: 0,
                strength: 0,
                vision: 0,
                // 🧤 Exclusivos de guarda-redes.
                reflexes: 0,
                distribution: 0,
                aerialCommand: 0
            },
            lifestyle: {
                personalTrainer: false,
                nutritionist: false,
                sportsPsychologist: false,
                luxuryApartment: false,
                sportsCar: false,
                privateJet: false,
                brandEndorsements: 0,
                charityFoundation: false,
                personalChef: false,
                mediaTraining: false,
                eliteAgent: false
            }
        },
        multipliers: {
            xpMultiplier: 1.0,
            fanBaseMultiplier: 1.0,
            energyRecoveryMultiplier: 1.0,
            salaryMultiplier: 1.0,
            negotiationMultiplier: 0
        }
    };
    
    selecoesEstado = { convocacoes: [], ultimaChave: "", campeoes: {}, ranking: {}, nationsDiv: {}, torneios: {}, planteisTorneio: {}, premiosLigaAno: {}, vagasTorneio: {} };
    preencherLigasVazias(); inicializarTabelas(); inicializarOrcamentosEContratos(); inicializarCopasNacionaisEContinentais(); gerarAgenda(); preencherDropdowns(); atualizarOVRClubes(); 

    // 🌐 MUNDO COMPARTILHADO: se esta carreira nasceu do lobby online, liga a
    // sincronização com o Firebase — perfil, pesquisa, elenco do clube e feed
    // de notícias passam a incluir o amigo a partir daqui.
    if (window.connectionMode === 'online' && window.firebaseIntegration && window.firebaseIntegration.activateSharedWorld) {
        window.firebaseIntegration.activateSharedWorld(window.lobbyPlayerId, window.onlinePartnerId || null);
    }

    mudarTela("telaIntroducao");
    let intro = document.getElementById("textoIntroducao");
    if(intro) intro.innerHTML = `
        <p>Três clubes demonstraram interesse em lançar tua carreira. Escolhe onde queres assinar o primeiro contrato.</p>
        <div style="display:grid; gap:10px; margin-top:15px;">
            ${propostasIniciais.map(c => `<button class="btn btn-primary btn-block" onclick="assinarPrimeiroClube('${c.id}')" style="display:flex; align-items:center; justify-content:center; gap:10px;"><img src="${obterUrlImagem(c,'clube')}" style="width:28px;height:28px;object-fit:contain;background:#fff;border-radius:6px;padding:2px;">${c.nome} • OVR ${c.reputacao}</button>`).join("")}
        </div>`;
});

// Lifestyle System Functions
window.upgradeTrainingSkill = function(skill, cost) {
    if (!jogador.lifestyle) return;
    
    if (jogador.lifestyle.trainingPoints >= cost) {
        jogador.lifestyle.trainingPoints -= cost;
        jogador.lifestyle.upgrades.training[skill]++;
        
        applyTrainingSkillBoost(skill);
        
        window.salvarJogo();
        renderLifestyleSystem();
        mostrarToast("Treino", `${skill.toUpperCase()} melhorado com sucesso!`, "success");
    } else {
        mostrarToast("Erro", "Pontos de treino insuficientes", "danger");
    }
};

window.purchaseLifestyleUpgrade = function(upgrade, cost) {
    if (!jogador.lifestyle) return;
    
    if (jogador.lifestyle.salary >= cost) {
        if (jogador.lifestyle.upgrades.lifestyle[upgrade]) {
            mostrarToast("Erro", "Este upgrade já foi adquirido", "warning");
            return;
        }
        
        jogador.lifestyle.salary -= cost;
        jogador.lifestyle.upgrades.lifestyle[upgrade] = true;
        
        applyLifestyleMultiplier(upgrade);
        
        window.salvarJogo();
        renderLifestyleSystem();
        mostrarToast("Lifestyle", `${upgrade.toUpperCase()} adquirido com sucesso!`, "success");
    } else {
        mostrarToast("Erro", "Salário insuficiente", "danger");
    }
};

function applyTrainingSkillBoost(skill) {
    const boostAmount = 1;
    
    switch(skill) {
        case 'freeKicks':
            jogador.finalizacao = (jogador.finalizacao || 60) + boostAmount;
            break;
        case 'penalties':
            jogador.finalizacao = (jogador.finalizacao || 60) + boostAmount;
            break;
        case 'stamina':
            jogador.resistencia = (jogador.resistencia || 60) + boostAmount;
            break;
        case 'heading':
            jogador.cabeceamento = (jogador.cabeceamento || 60) + boostAmount;
            break;
        case 'dribbling':
            jogador.drible = (jogador.drible || 60) + boostAmount;
            break;
        case 'passing':
            jogador.passe = (jogador.passe || 60) + boostAmount;
            break;
        case 'shooting':
            jogador.finalizacao = (jogador.finalizacao || 60) + boostAmount;
            break;
        case 'defending':
            jogador.defesa = (jogador.defesa || 60) + boostAmount;
            break;
        case 'pace':
            jogador.velocidade = (jogador.velocidade || 60) + boostAmount;
            break;
        case 'strength':
            jogador.forca = (jogador.forca || 60) + boostAmount;
            break;
        case 'vision':
            jogador.inteligencia = (jogador.inteligencia || 60) + boostAmount;
            break;
        case 'crossing':
            jogador.passe = (jogador.passe || 60) + boostAmount;
            break;
        case 'ballControl':
            jogador.drible = (jogador.drible || 60) + boostAmount;
            break;
        case 'agility':
            jogador.velocidade = (jogador.velocidade || 60) + boostAmount;
            break;
        case 'composure':
            jogador.inteligencia = (jogador.inteligencia || 60) + boostAmount;
            break;
        case 'positioning':
            jogador.inteligencia = (jogador.inteligencia || 60) + boostAmount;
            break;
        case 'leadership':
            jogador.inteligencia = (jogador.inteligencia || 60) + boostAmount;
            break;
        case 'workRate':
            jogador.resistencia = (jogador.resistencia || 60) + boostAmount;
            break;
        case 'interceptions':
            jogador.defesa = (jogador.defesa || 60) + boostAmount;
            break;
        case 'longShots':
            jogador.finalizacao = (jogador.finalizacao || 60) + boostAmount;
            break;
        case 'acceleration':
            jogador.velocidade = (jogador.velocidade || 60) + boostAmount;
            break;
        // 🧤 Treinos exclusivos de guarda-redes.
        case 'reflexes':
            jogador.reflexos = (jogador.reflexos || 60) + boostAmount;
            break;
        case 'distribution':
            jogador.reposicao = (jogador.reposicao || 60) + boostAmount;
            break;
        case 'aerialCommand':
            jogador.jogoAereo = (jogador.jogoAereo || 60) + boostAmount;
            break;
    }

    // 🛡️ FIX: sem isto, um atributo treinado repetidamente (ex: finalizacao)
    // podia passar de 99 sem limite, e como recalcularGeral() é só a média
    // dos atributos, isso inflava o Overall (OVR) de forma repentina e sem
    // aviso — o jogador "do nada" aparecia com 99 geral numa nova temporada.
    ["finalizacao","passe","drible","defesa","resistencia","cabeceamento","velocidade","forca","inteligencia","reflexos","reposicao","jogoAereo"].forEach(attr => {
        if (jogador[attr] != null) jogador[attr] = Math.min(99, jogador[attr]);
    });

    recalcularGeral();
}

function applyLifestyleMultiplier(upgrade) {
    switch(upgrade) {
        case 'personalTrainer':
            jogador.lifestyle.multipliers.xpMultiplier += 0.1;
            jogador.lifestyle.multipliers.energyRecoveryMultiplier += 0.15;
            break;
        case 'nutritionist':
            jogador.lifestyle.multipliers.energyRecoveryMultiplier += 0.1;
            jogador.lifestyle.multipliers.xpMultiplier += 0.05;
            break;
        case 'sportsPsychologist':
            jogador.lifestyle.multipliers.xpMultiplier += 0.15;
            break;
        case 'luxuryApartment':
            jogador.lifestyle.multipliers.fanBaseMultiplier += 0.1;
            break;
        case 'sportsCar':
            jogador.lifestyle.multipliers.fanBaseMultiplier += 0.15;
            break;
        case 'privateJet':
            jogador.lifestyle.multipliers.energyRecoveryMultiplier += 0.2;
            jogador.lifestyle.multipliers.salaryMultiplier += 0.1;
            break;
        case 'brandEndorsements':
            jogador.lifestyle.multipliers.salaryMultiplier += 0.2;
            jogador.lifestyle.multipliers.fanBaseMultiplier += 0.1;
            break;
        case 'charityFoundation':
            jogador.lifestyle.multipliers.fanBaseMultiplier += 0.25;
            break;
        case 'personalChef':
            jogador.lifestyle.multipliers.energyRecoveryMultiplier += 0.12;
            jogador.lifestyle.multipliers.xpMultiplier += 0.05;
            break;
        case 'mediaTraining':
            jogador.lifestyle.multipliers.salaryMultiplier += 0.12;
            jogador.lifestyle.multipliers.fanBaseMultiplier += 0.18;
            break;
        case 'eliteAgent':
            jogador.lifestyle.multipliers.negotiationMultiplier = (jogador.lifestyle.multipliers.negotiationMultiplier || 0) + 0.12;
            jogador.lifestyle.multipliers.salaryMultiplier += 0.05;
            break;
        case 'homeGym':
            jogador.lifestyle.multipliers.xpMultiplier += 0.08;
            jogador.lifestyle.multipliers.energyRecoveryMultiplier += 0.08;
            break;
        case 'performanceAnalyst':
            jogador.lifestyle.multipliers.xpMultiplier += 0.1;
            jogador.lifestyle.multipliers.performanceBonus = (jogador.lifestyle.multipliers.performanceBonus || 0) + 0.05;
            break;
        case 'physiotherapist':
            jogador.lifestyle.multipliers.injuryRiskReduction = (jogador.lifestyle.multipliers.injuryRiskReduction || 0) + 0.2;
            break;
        case 'socialMediaTeam':
            jogador.lifestyle.multipliers.fanBaseMultiplier += 0.2;
            jogador.lifestyle.multipliers.salaryMultiplier += 0.05;
            break;
        case 'investmentPortfolio':
            jogador.lifestyle.multipliers.passiveIncome = true;
            break;
    }
}

window.renderLifestyleSystem = function() {
    if (!jogador.lifestyle) return;
    
    const container = document.getElementById("lifestyle-container");
    if (!container) return;
    
    container.innerHTML = `
        <div class="lifestyle-hero">
            <h2>🏆 Lifestyle & Upgrades</h2>
            <p>Invest no teu desenvolvimento e estilo de vida para maximizar o teu potencial</p>
        </div>
        
        <div class="lifestyle-stats-grid">
            <div class="lifestyle-stat-card">
                <strong>${jogador.lifestyle.trainingPoints}</strong>
                <span>Pontos de Treino</span>
            </div>
            <div class="lifestyle-stat-card">
                <strong>${jogador.lifestyle.weeklyXP}</strong>
                <span>XP Semanal</span>
            </div>
            <div class="lifestyle-stat-card">
                <strong>€${(jogador.lifestyle.salary / 1000).toFixed(0)}K</strong>
                <span>Salário Semanal</span>
            </div>
            <div class="lifestyle-stat-card">
                <strong>${jogador.lifestyle.fanBase.toLocaleString()}</strong>
                <span>Fãs</span>
            </div>
        </div>
        
        <div class="lifestyle-section">
            <h3>🎯 Árvore de Treino</h3>
            <div class="training-tree-grid">
                ${renderTrainingNodes()}
            </div>
        </div>
        
        <div class="lifestyle-section">
            <h3>💎 Upgrades de Lifestyle</h3>
            <div class="lifestyle-upgrades-grid">
                ${renderLifestyleUpgrades()}
            </div>
        </div>
        
        <div class="lifestyle-section">
            <h3>📊 Multiplicadores Ativos</h3>
            <div class="lifestyle-stats-grid">
                <div class="lifestyle-stat-card">
                    <strong>x${jogador.lifestyle.multipliers.xpMultiplier.toFixed(2)}</strong>
                    <span>XP Multiplier</span>
                </div>
                <div class="lifestyle-stat-card">
                    <strong>x${jogador.lifestyle.multipliers.fanBaseMultiplier.toFixed(2)}</strong>
                    <span>Fan Base Multiplier</span>
                </div>
                <div class="lifestyle-stat-card">
                    <strong>x${jogador.lifestyle.multipliers.energyRecoveryMultiplier.toFixed(2)}</strong>
                    <span>Energy Recovery</span>
                </div>
                <div class="lifestyle-stat-card">
                    <strong>x${jogador.lifestyle.multipliers.salaryMultiplier.toFixed(2)}</strong>
                    <span>Salary Multiplier</span>
                </div>
            </div>
        </div>
    `;
};

function renderTrainingNodes() {
    const ehGoleiro = jogador.posicao === "Goleiro";
    const skills = [
        { id: 'freeKicks', name: 'Faltas', icon: '⚽', cost: 3, apenasLinha: true },
        { id: 'penalties', name: 'Penáltis', icon: '🎯', cost: 3, apenasLinha: true },
        { id: 'stamina', name: 'Resistência', icon: '⚡', cost: 4 },
        { id: 'heading', name: 'Cabeceamento', icon: '🏆', cost: 3, apenasLinha: true },
        { id: 'dribbling', name: 'Drible', icon: '🎨', cost: 4, apenasLinha: true },
        { id: 'passing', name: 'Passe', icon: '📡', cost: 3, apenasLinha: true },
        { id: 'shooting', name: 'Finalização', icon: '🔥', cost: 4, apenasLinha: true },
        { id: 'defending', name: 'Defesa', icon: '🛡️', cost: 3, apenasLinha: true },
        { id: 'pace', name: 'Velocidade', icon: '💨', cost: 4 },
        { id: 'strength', name: 'Força Física', icon: '💪', cost: 3 },
        { id: 'vision', name: 'Visão de Jogo', icon: '🧠', cost: 4, apenasLinha: true },
        { id: 'crossing', name: 'Cruzamento', icon: '🎯', cost: 3, apenasLinha: true },
        { id: 'ballControl', name: 'Controle de Bola', icon: '✨', cost: 4, apenasLinha: true },
        { id: 'agility', name: 'Agilidade', icon: '🌀', cost: 4 },
        { id: 'composure', name: 'Frieza', icon: '❄️', cost: 4 },
        { id: 'positioning', name: 'Posicionamento', icon: '📍', cost: 3 },
        { id: 'leadership', name: 'Liderança', icon: '👑', cost: 3 },
        { id: 'workRate', name: 'Intensidade', icon: '🔋', cost: 3 },
        { id: 'interceptions', name: 'Interceptações', icon: '🚧', cost: 3, apenasLinha: true },
        { id: 'longShots', name: 'Chutes de Longe', icon: '🚀', cost: 4, apenasLinha: true },
        { id: 'acceleration', name: 'Aceleração', icon: '🏃', cost: 4 },
        // 🧤 Exclusivos de guarda-redes — só aparecem pra quem joga no gol.
        { id: 'reflexes', name: 'Reflexos', icon: '🧤', cost: 4, apenasGoleiro: true },
        { id: 'distribution', name: 'Reposição', icon: '🚀', cost: 3, apenasGoleiro: true },
        { id: 'aerialCommand', name: 'Jogo Aéreo (Área)', icon: '🙌', cost: 3, apenasGoleiro: true }
    ].filter(s => ehGoleiro ? !s.apenasLinha : !s.apenasGoleiro);
    
    return skills.map(skill => {
        const level = jogador.lifestyle?.upgrades?.training?.[skill.id] || 0;
        const canAfford = jogador.lifestyle?.trainingPoints >= skill.cost;
        
        return `
            <div class="training-node ${!canAfford ? 'locked' : ''}" onclick="upgradeTrainingSkill('${skill.id}', ${skill.cost})">
                <div class="training-node-header">
                    <span class="training-node-icon">${skill.icon}</span>
                    <div class="training-node-info">
                        <h4>${skill.name}</h4>
                        <p>Nível ${level}/10</p>
                    </div>
                </div>
                <div class="training-node-level">
                    <div class="training-node-level-bar">
                        <div class="training-node-level-fill" style="width: ${(level / 10) * 100}%"></div>
                    </div>
                    <span>${level}/10</span>
                </div>
                <div class="training-node-cost">
                    <span>Custo</span>
                    <strong>${skill.cost} PT</strong>
                </div>
            </div>
        `;
    }).join('');
}

function renderLifestyleUpgrades() {
    const upgrades = [
        { id: 'personalTrainer', name: 'Treinador Pessoal', icon: '🏋️', cost: 50000, benefits: ['+10% XP', '+15% Recuperação de Energia'] },
        { id: 'nutritionist', name: 'Nutricionista', icon: '🥗', cost: 30000, benefits: ['+10% Recuperação de Energia', '+5% XP'] },
        { id: 'sportsPsychologist', name: 'Psicólogo Desportivo', icon: '🧠', cost: 40000, benefits: ['+15% XP'] },
        { id: 'luxuryApartment', name: 'Apartamento de Luxo', icon: '🏠', cost: 200000, benefits: ['+10% Base de Fãs'] },
        { id: 'sportsCar', name: 'Carro Desportivo', icon: '🏎️', cost: 150000, benefits: ['+15% Base de Fãs'] },
        { id: 'privateJet', name: 'Jato Privado', icon: '✈️', cost: 500000, benefits: ['+20% Recuperação de Energia', '+10% Salário'] },
        { id: 'brandEndorsements', name: 'Endossos de Marca', icon: '📢', cost: 100000, benefits: ['+20% Salário', '+10% Base de Fãs'] },
        { id: 'charityFoundation', name: 'Fundação de Caridade', icon: '❤️', cost: 300000, benefits: ['+25% Base de Fãs'] },
        { id: 'personalChef', name: 'Chef Pessoal', icon: '👨‍🍳', cost: 80000, benefits: ['+12% Recuperação de Energia', '+5% XP'] },
        { id: 'mediaTraining', name: 'Treinamento de Mídia', icon: '🎙️', cost: 120000, benefits: ['+12% Salário', '+18% Base de Fãs'] },
        { id: 'eliteAgent', name: 'Agente Elite', icon: '🤝', cost: 250000, benefits: ['+5% Salário', 'Mais poder de negociação em renovações e transferências'] },
        { id: 'homeGym', name: 'Academia Particular', icon: '🏠', cost: 90000, benefits: ['+8% XP', '+8% Recuperação de Energia'] },
        { id: 'performanceAnalyst', name: 'Analista de Desempenho', icon: '📊', cost: 130000, benefits: ['+10% XP', '+5% Nota Média'] },
        { id: 'physiotherapist', name: 'Fisioterapeuta Particular', icon: '🩺', cost: 110000, benefits: ['-20% Risco de Lesões'] },
        { id: 'socialMediaTeam', name: 'Equipe de Redes Sociais', icon: '📱', cost: 140000, benefits: ['+20% Base de Fãs', '+5% Salário'] },
        { id: 'investmentPortfolio', name: 'Carteira de Investimentos', icon: '💼', cost: 300000, benefits: ['Renda passiva mensal'] }
    ];
    
    return upgrades.map(upgrade => {
        const purchased = jogador.lifestyle.upgrades.lifestyle[upgrade.id];
        const canAfford = jogador.lifestyle.salary >= upgrade.cost;
        
        return `
            <div class="lifestyle-upgrade-card ${purchased ? 'purchased' : ''}">
                <div class="lifestyle-upgrade-header">
                    <span class="lifestyle-upgrade-icon">${upgrade.icon}</span>
                    <div class="lifestyle-upgrade-info">
                        <h4>${upgrade.name}</h4>
                        <p>${purchased ? 'Adquirido' : 'Disponível'}</p>
                    </div>
                </div>
                <ul class="lifestyle-upgrade-benefits">
                    ${upgrade.benefits.map(b => `<li>${b}</li>`).join('')}
                </ul>
                <div class="lifestyle-upgrade-cost">
                    <span>Custo</span>
                    <strong>€${(upgrade.cost / 1000).toFixed(0)}K</strong>
                </div>
                ${!purchased ? `<button class="btn-upgrade" ${!canAfford ? 'disabled' : ''} onclick="purchaseLifestyleUpgrade('${upgrade.id}', ${upgrade.cost})">
                    Comprar
                </button>` : '<button class="btn-upgrade" disabled>Adquirido</button>'}
            </div>
        `;
    }).join('');
}

window.awardWeeklyTrainingPoints = function() {
    if (!jogador.lifestyle) return;
    
    const basePoints = 5;
    const multiplier = jogador.lifestyle.multipliers.xpMultiplier;
    const awardedPoints = Math.floor(basePoints * multiplier);
    
    jogador.lifestyle.trainingPoints += awardedPoints;
    jogador.lifestyle.weeklyXP += awardedPoints * 10;
    
    const fanBaseGrowth = Math.floor(50 * jogador.lifestyle.multipliers.fanBaseMultiplier);
    jogador.lifestyle.fanBase += fanBaseGrowth;
    
    const baseSalary = jogador.salarioSemanal || calcularSalarioSemanalJogador();
    jogador.lifestyle.salary = Math.floor(baseSalary * jogador.lifestyle.multipliers.salaryMultiplier);
};

window.applyEnergyRecovery = function(baseRecovery) {
    if (!jogador.lifestyle) return baseRecovery;
    
    return Math.floor(baseRecovery * jogador.lifestyle.multipliers.energyRecoveryMultiplier);
};

function recalcularGeral() {
    // Reaproveita a mesma fórmula ponderada por posição usada para todos os
    // jogadores (ver calcularGeralDeAtributos) — assim o jogador real e os
    // de IA nunca ficam com critérios de OVR diferentes entre si.
    jogador.geral = calcularGeralDeAtributos(jogador);
}

window.assinarPrimeiroClube = function(clubeId) {
    jogador.clubeId = clubeId;
    jogador.contrato = 3;
    reconstruirAgendaAposTrocaClube();
    delete jogador.propostasPrimeiroClube;
    let cD = clubes.find(c => c.id === jogador.clubeId);
    jogador.salarioSemanal = calcularSalarioSemanalJogador(cD);
    if (jogador.lifestyle) jogador.lifestyle.salary = jogador.salarioSemanal;
    let intro = document.getElementById("textoIntroducao");
    if(intro) intro.innerHTML = `Assinaste com o <strong>${cD ? cD.nome : 'clube'}</strong>. Mostra o teu valor em campo. Tens um contrato de 3 anos.`;
};

document.getElementById("btnEntrarNoJogo")?.addEventListener("click", () => { window.salvarJogo(); atualizarHub(); mudarTela("view-hub"); let homeV = document.getElementById("view-home"); if(homeV) { homeV.classList.remove("oculto"); homeV.style.display="block"; } });

// ==========================================
// GAME INITIALIZATION WITH SESSION PERSISTENCE
// ==========================================

async function initializeGame() {
    // Check for existing Firebase session first
    if (window.firebaseIntegration && window.firebaseIntegration.hasExistingSession()) {
        console.log("Existing session found, attempting auto-reconnect...");
        const reconnected = await window.firebaseIntegration.autoReconnectToSession();
        if (reconnected) {
            return; // Successfully reconnected, don't show other screens
        }
        // If reconnection failed, fall through to normal initialization
    }

    // Normal initialization flow
    if(!carregarJogo()){ 
        mudarTela("telaModoSelecao"); 
    } else {
        mudarTela("view-hub");
    }
}

// Penalty Minigame System
window.triggerPenaltyMinigameUI = function(jogadorReal, timePenalty, callback) {
    const modal = document.getElementById("modalPenalti");
    const content = document.getElementById("penaltiContent");
    if(!modal || !content) {
        callback('miss');
        return;
    }

    const isGoalkeeper = jogadorReal.posicao === "Goleiro";
    const penaltySkill = jogadorReal.lifestyle?.upgrades?.training?.penalties || 0;
    
    // Calculate success chance based on skill
    const baseChance = isGoalkeeper ? 0.25 : 0.70;
    const skillBonus = penaltySkill * 0.03;
    const successChance = Math.min(0.95, baseChance + skillBonus);

    // Generate goalkeeper dive direction
    const gkDive = Math.random() < 0.33 ? 'left' : (Math.random() < 0.5 ? 'right' : 'center');

    if(isGoalkeeper) {
        // Goalkeeper defending penalty
        content.innerHTML = `
            <div style="text-align:center;">
                <p style="font-size:1.1rem; margin-bottom:20px;">🧤 Tens de defender este penálti! Escolhe para onde saltar:</p>
                <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; max-width:300px; margin:0 auto;">
                    <button class="btn btn-primary" onclick="resolvePenaltyGK('left', '${gkDive}', ${successChance})">⬅️ Esquerda</button>
                    <button class="btn btn-primary" onclick="resolvePenaltyGK('center', '${gkDive}', ${successChance})">⬆️ Centro</button>
                    <button class="btn btn-primary" onclick="resolvePenaltyGK('right', '${gkDive}', ${successChance})">➡️ Direita</button>
                </div>
                <p style="margin-top:20px; font-size:0.9rem; color:#888;">Chance de defesa: ${Math.round(successChance * 100)}%</p>
            </div>
        `;
    } else {
        // Outfield player taking penalty
        content.innerHTML = `
            <div style="text-align:center;">
                <p style="font-size:1.1rem; margin-bottom:20px;">⚽ Escolhe para onde bater o penálti:</p>
                <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; max-width:300px; margin:0 auto;">
                    <button class="btn btn-primary" onclick="resolvePenaltyKick('left', '${gkDive}', ${successChance})">⬅️ Esquerda</button>
                    <button class="btn btn-primary" onclick="resolvePenaltyKick('center', '${gkDive}', ${successChance})">⬆️ Centro</button>
                    <button class="btn btn-primary" onclick="resolvePenaltyKick('right', '${gkDive}', ${successChance})">➡️ Direita</button>
                </div>
                <p style="margin-top:20px; font-size:0.9rem; color:#888;">Chance de marcar: ${Math.round(successChance * 100)}%</p>
            </div>
        `;
    }

    modal.classList.remove("oculto");

    // Store callback globally for resolution
    window.currentPenaltyCallback = callback;
};

window.resolvePenaltyKick = function(direction, gkDive, successChance) {
    const content = document.getElementById("penaltiContent");
    let result = 'miss';
    
    // Check if goalkeeper guessed correctly
    if(gkDive !== direction) {
        // GK didn't dive to the right direction - goal!
        if(Math.random() < successChance) {
            result = 'goal';
            content.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:3rem; margin-bottom:10px;">⚽</div>
                    <h3 style="color:var(--success);">GOLO!</h3>
                    <p>Bateste para ${direction === 'left' ? 'a esquerda' : (direction === 'right' ? 'a direita' : 'o centro')} e o guarda-redes foi para ${gkDive === 'left' ? 'a esquerda' : (gkDive === 'right' ? 'a direita' : 'o centro')}!</p>
                    <button class="btn btn-primary" style="margin-top:20px;" onclick="closePenaltyModal()">Continuar</button>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:3rem; margin-bottom:10px;">❌</div>
                    <h3 style="color:var(--danger);">ERRADO!</h3>
                    <p>Bateste para fora da baliza!</p>
                    <button class="btn btn-primary" style="margin-top:20px;" onclick="closePenaltyModal()">Continuar</button>
                </div>
            `;
        }
    } else {
        // GK guessed correctly - save
        content.innerHTML = `
            <div style="text-align:center;">
                <div style="font-size:3rem; margin-bottom:10px;">🧤</div>
                <h3 style="color:var(--danger);">DEFENDIDO!</h3>
                <p>O guarda-redes saltou para o lado certo!</p>
                <button class="btn btn-primary" style="margin-top:20px;" onclick="closePenaltyModal()">Continuar</button>
            </div>
        `;
        result = 'saved';
    }

    window.currentPenaltyResult = result;
};

window.resolvePenaltyGK = function(direction, gkDive, successChance) {
    const content = document.getElementById("penaltiContent");
    let result = 'miss';
    
    // Generate where the kicker shot
    const kickDirection = Math.random() < 0.33 ? 'left' : (Math.random() < 0.5 ? 'right' : 'center');
    
    if(direction === kickDirection) {
        // Goalkeeper dove to the right direction
        if(Math.random() < successChance) {
            result = 'saved';
            content.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:3rem; margin-bottom:10px;">🧤</div>
                    <h3 style="color:var(--success);">DEFESA!</h3>
                    <p>Saltaste para ${direction === 'left' ? 'a esquerda' : (direction === 'right' ? 'a direita' : 'o centro')} e o cobrador foi para o mesmo lado!</p>
                    <button class="btn btn-primary" style="margin-top:20px;" onclick="closePenaltyModal()">Continuar</button>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:3rem; margin-bottom:10px;">⚽</div>
                    <h3 style="color:var(--danger);">GOLO!</h3>
                    <p>Saltaste para o lado certo mas não chegaste à bola!</p>
                    <button class="btn btn-primary" style="margin-top:20px;" onclick="closePenaltyModal()">Continuar</button>
                </div>
            `;
        }
    } else {
        // Wrong dive - goal
        content.innerHTML = `
            <div style="text-align:center;">
                <div style="font-size:3rem; margin-bottom:10px;">⚽</div>
                <h3 style="color:var(--danger);">GOLO!</h3>
                <p>O cobrador bateu para ${kickDirection === 'left' ? 'a esquerda' : (kickDirection === 'right' ? 'a direita' : 'o centro')} e tu foste para ${direction === 'left' ? 'a esquerda' : (direction === 'right' ? 'a direita' : 'o centro')}!</p>
                <button class="btn btn-primary" style="margin-top:20px;" onclick="closePenaltyModal()">Continuar</button>
            </div>
        `;
    }

    window.currentPenaltyResult = result;
};

window.closePenaltyModal = function() {
    const modal = document.getElementById("modalPenalti");
    if(modal) modal.classList.add("oculto");
    
    if(window.currentPenaltyCallback) {
        window.currentPenaltyCallback(window.currentPenaltyResult || 'miss');
        window.currentPenaltyCallback = null;
        window.currentPenaltyResult = null;
    }
};

// ==========================================
// 🗣️ SOLICITAR MUDANÇA DE POSIÇÃO
// ==========================================
// Espectro de posições, da defesa ao ataque — usado para medir a "distância"
// entre a posição atual e a pedida (pedidos próximos, ex: Ponta -> Atacante,
// são mais fáceis de aceitar que pedidos radicais, ex: Zagueiro -> Atacante).
const ESPECTRO_POSICOES = ["Zagueiro", "Lateral", "Volante", "Meio-Campista", "Meia Ofensivo", "Ponta", "Atacante"];
const RELACAO_MINIMA_PEDIR_POSICAO = 60; // precisa de uma relação BOA com o técnico para sequer pedir

// Monta o bloco HTML do pedido de mudança de posição, dentro do modal
// "Falar com o Técnico". Jogadores de Goleiro não podem pedir mudança (e
// ninguém pode pedir para virar Goleiro) — é uma mudança de posição, não de
// função no jogo.
function htmlSolicitarPosicao(relacaoTecnico) {
    if (jogador.posicao === "Goleiro") return "";
    const jaPediuEsteAno = jogador.ultimoPedidoPosicaoAno === anoAtual;
    const opcoes = ESPECTRO_POSICOES.filter(p => p !== jogador.posicao);
    const relacaoOk = relacaoTecnico >= RELACAO_MINIMA_PEDIR_POSICAO;
    return `
        <div style="margin:15px 0; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:var(--gold);">🔄 Solicitar Mudança de Posição</h4>
            <p style="margin:0 0 10px; font-size:0.85rem; color:#aaa;">Posição atual: <strong>${jogador.posicao}</strong>. A decisão final é sempre do técnico — não podes mudar de posição por conta própria.</p>
            ${!relacaoOk ? `<p style="color:#ff8c00; font-size:0.85rem;">⚠️ Precisas de uma relação BOA (${RELACAO_MINIMA_PEDIR_POSICAO}+) com o técnico para ele sequer considerar isto.</p>` : ""}
            ${jaPediuEsteAno ? `<p style="color:#aaa; font-size:0.85rem;">Já fizeste um pedido de posição esta temporada. Tenta de novo na próxima.</p>` : `
            <select id="selectNovaPosicao" ${!relacaoOk ? "disabled" : ""} style="width:100%; padding:8px; border-radius:6px; background:#111; color:#fff; border:1px solid #333; margin-bottom:8px;">
                ${opcoes.map(p => `<option value="${p}">${p}</option>`).join("")}
            </select>
            <button ${!relacaoOk ? "disabled" : ""} onclick="solicitarMudancaPosicao(document.getElementById('selectNovaPosicao').value)" style="width:100%; padding:10px; background:${relacaoOk ? 'var(--theme-primary)' : '#333'}; color:#000; border:none; border-radius:8px; font-weight:bold; cursor:${relacaoOk ? 'pointer' : 'not-allowed'};">Pedir mudança de posição</button>
            `}
        </div>`;
}

// Processa o pedido de mudança de posição. A chance de sucesso depende da
// relação com o técnico E de quão "radical" é o pedido (posições distantes
// no espectro são mais arriscadas). Só pode ser pedido uma vez por temporada.
window.solicitarMudancaPosicao = function(novaPosicao) {
    const relacaoTecnico = jogador.relacaoTecnico || 50;
    if (relacaoTecnico < RELACAO_MINIMA_PEDIR_POSICAO) {
        mostrarToast("Técnico", "Ele nem quer ouvir falar nisso agora. Melhora a tua relação primeiro.", "warning");
        return;
    }
    if (jogador.ultimoPedidoPosicaoAno === anoAtual) return;
    jogador.ultimoPedidoPosicaoAno = anoAtual;

    const idxAtual = ESPECTRO_POSICOES.indexOf(jogador.posicao);
    const idxNova = ESPECTRO_POSICOES.indexOf(novaPosicao);
    const distancia = (idxAtual === -1 || idxNova === -1) ? 3 : Math.abs(idxAtual - idxNova);

    // Base de 55% (com relação mínima exigida) subindo com relação extra,
    // e caindo com a distância entre as posições.
    const chanceSucesso = Math.max(0.05, Math.min(0.9, 0.35 + (relacaoTecnico - RELACAO_MINIMA_PEDIR_POSICAO) * 0.008 - distancia * 0.13));

    const clube = clubes.find(c => c.id === jogador.clubeId);
    const nomeTecnico = clube?.tecnico || "O treinador";

    if (Math.random() < chanceSucesso) {
        jogador.posicao = novaPosicao;
        jogador.relacaoTecnico = Math.min(100, relacaoTecnico + 5);
        registrarNoticia("Mudança de posição aceite!", `${nomeTecnico} aceitou reposicionar ${jogador.nome} para ${novaPosicao}.`, "Clube");
        mostrarModalConversaTecnico(nomeTecnico, "Pedido aceite", `"Pensei bem nisso... vamos tentar-te como ${novaPosicao}. Não me desiludas."`);
    } else {
        jogador.relacaoTecnico = Math.max(0, relacaoTecnico - 5);
        mostrarModalConversaTecnico(nomeTecnico, "Pedido recusado", `"Entendo a tua vontade, mas por agora preciso de ti como ${jogador.posicao}. Continua a mostrar serviço."`);
    }
    window.salvarJogo();
    document.getElementById("btnFalarTecnico")?.click();
};

// ==========================================
// 🤝 PROMESSAS AO TÉCNICO
// ==========================================
// O jogador pode comprometer-se com uma meta para o resto da temporada. É
// avaliada automaticamente no fim da época (ver avaliarPromessasTecnico) e
// afeta a relação para melhor (se cumprida) ou para pior (se quebrada).
const METAS_PROMESSA = [
    { tipo: "gols", meta: 10, label: "Vou marcar 10 gols até ao fim da temporada" },
    { tipo: "gols", meta: 20, label: "Vou marcar 20 gols até ao fim da temporada" },
    { tipo: "assistencias", meta: 10, label: "Vou dar 10 assistências até ao fim da temporada" },
    { tipo: "condicionamento", meta: 80, label: "Vou melhorar o meu condicionamento físico (jogar 80%+ dos jogos)" }
];

function htmlFazerPromessa() {
    if (jogador.promessaTecnico) {
        const p = jogador.promessaTecnico;
        const atual = p.tipo === "gols" ? jogador.estatisticasAtuais.gols
            : p.tipo === "assistencias" ? jogador.estatisticasAtuais.assistencias
            : Math.round(((jogador.estatisticasAtuais.jogos || 0) / Math.max(1, jogador.jogosDisputaveisTemporada || 38)) * 100);
        return `
        <div style="margin:15px 0; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:var(--gold);">🤝 Promessa em Andamento</h4>
            <p style="margin:0; color:#ccc;">"${METAS_PROMESSA.find(m => m.tipo === p.tipo && m.meta === p.meta)?.label || p.tipo}"</p>
            <p style="margin:8px 0 0; font-size:0.85rem; color:#aaa;">Progresso atual: <strong style="color:var(--theme-primary);">${atual}${p.tipo === "condicionamento" ? "%" : ""} / ${p.meta}${p.tipo === "condicionamento" ? "%" : ""}</strong> — avaliada no fim da temporada ${p.ano}.</p>
        </div>`;
    }
    return `
        <div style="margin:15px 0; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:var(--gold);">🤝 Fazer uma Promessa</h4>
            <p style="margin:0 0 10px; font-size:0.85rem; color:#aaa;">Compromete-te publicamente com o técnico. Se cumprires, a relação melhora MUITO. Se falhares, ele não vai esquecer.</p>
            <select id="selectPromessa" style="width:100%; padding:8px; border-radius:6px; background:#111; color:#fff; border:1px solid #333; margin-bottom:8px;">
                ${METAS_PROMESSA.map((m, i) => `<option value="${i}">${m.label}</option>`).join("")}
            </select>
            <button onclick="fazerPromessaTecnico(parseInt(document.getElementById('selectPromessa').value))" style="width:100%; padding:10px; background:var(--theme-primary); color:#000; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Fazer promessa</button>
        </div>`;
}

window.fazerPromessaTecnico = function(indice) {
    if (jogador.promessaTecnico) return; // só uma promessa ativa de cada vez
    const escolha = METAS_PROMESSA[indice];
    if (!escolha) return;
    jogador.promessaTecnico = { tipo: escolha.tipo, meta: escolha.meta, ano: anoAtual };
    jogador.relacaoTecnico = Math.min(100, (jogador.relacaoTecnico || 50) + 3); // o técnico gosta da ambição, já de início
    const clube = clubes.find(c => c.id === jogador.clubeId);
    mostrarModalConversaTecnico(clube?.tecnico || "O treinador", "Promessa feita", `"Gosto de ouvir isso. Vou lembrar-me desta conversa no fim da temporada."`);
    window.salvarJogo();
    document.getElementById("btnFalarTecnico")?.click();
};

// Avalia, no fim da temporada, se a promessa feita ao técnico foi cumprida.
// É uma verificação PESSOAL (usa só as estatísticas do próprio jogador), por
// isso corre sempre — mesmo no modo online e mesmo para quem não é o
// "anfitrião do mundo" (ver window.processarFimTemporadaOnline).
function avaliarPromessasTecnico() {
    if (!jogador?.promessaTecnico || jogador.promessaTecnico.ano !== anoAtual) return;
    const p = jogador.promessaTecnico;
    let atingiu = false;
    if (p.tipo === "gols") atingiu = jogador.estatisticasAtuais.gols >= p.meta;
    else if (p.tipo === "assistencias") atingiu = jogador.estatisticasAtuais.assistencias >= p.meta;
    else if (p.tipo === "condicionamento") {
        const pct = ((jogador.estatisticasAtuais.jogos || 0) / Math.max(1, jogador.jogosDisputaveisTemporada || 38)) * 100;
        atingiu = pct >= p.meta;
    }
    const clube = clubes.find(c => c.id === jogador.clubeId);
    const nomeTecnico = clube?.tecnico || "O treinador";
    if (atingiu) {
        jogador.relacaoTecnico = Math.min(100, (jogador.relacaoTecnico || 50) + 20);
        registrarNoticia("Promessa cumprida!", `${jogador.nome} cumpriu a promessa feita a ${nomeTecnico} no início da temporada.`, "Clube");
        mostrarToast("Promessa cumprida", `Cumpriste a tua promessa! A relação com ${nomeTecnico} disparou. 🤝`, "success");
    } else {
        jogador.relacaoTecnico = Math.max(0, (jogador.relacaoTecnico || 50) - 15);
        registrarNoticia("Promessa quebrada", `${jogador.nome} não cumpriu a promessa feita a ${nomeTecnico}. A confiança foi abalada.`, "Clube");
        mostrarToast("Promessa quebrada", `Não cumpriste a promessa. ${nomeTecnico} está desapontado.`, "danger");
    }
    jogador.promessaTecnico = null;
}

// Talk to coach system for captaincy and squad role
document.getElementById("btnFalarTecnico")?.addEventListener("click", () => {
    const clube = clubes.find(c => c.id === jogador.clubeId);
    if(!clube) {
        mostrarToast("Sem clube", "Precisas de estar num clube para falar com o técnico.", "warning");
        return;
    }
    
    const anosNoClube = jogador.anoNoClubeAtual || 0;
    const titularidade = jogador.titularidade || 48;
    const geral = jogador.geral || 60;
    const relacaoTecnico = jogador.relacaoTecnico || 50;
    const funcaoAtual = jogador.funcaoNoElenco || "promessa";
    
    // Determine squad role based on performance and relationship
    let funcaoSugerida = "banco";
    if(jogador.eCapitao) funcaoSugerida = "capitao";
    else if(anosNoClube >= 5 && geral >= 85 && titularidade >= 80) funcaoSugerida = "lenda";
    else if(titularidade >= 70 && geral >= 75) funcaoSugerida = "importante";
    else if(titularidade >= 50 && geral >= 65) funcaoSugerida = "rodizio";
    else if(geral >= 60 && anosNoClube < 2) funcaoSugerida = "promessa";
    
    // Relationship status
    let statusRelacao = "";
    let corRelacao = "";
    if(relacaoTecnico >= 80) { statusRelacao = "Excelente"; corRelacao = "var(--success)"; }
    else if(relacaoTecnico >= 60) { statusRelacao = "Boa"; corRelacao = "#00a2e0"; }
    else if(relacaoTecnico >= 40) { statusRelacao = "Neutra"; corRelacao = "#aaa"; }
    else if(relacaoTecnico >= 20) { statusRelacao = "Ruim"; corRelacao = "#ff8c00"; }
    else { statusRelacao = "Crítica"; corRelacao = "#ff4444"; }
    
    // Captain requirements
    const podeSerCapitao = anosNoClube >= 3 && geral >= 75 && titularidade >= 60 && relacaoTecnico >= 60;
    
    const htmlFuncoes = `
        <div style="margin:15px 0; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:var(--gold);">Função no Elenco</h4>
            <p style="margin:0 0 10px; font-size:0.8rem; color:#aaa;">🔒 = precisas de mais relação com o técnico para ele considerar este pedido.</p>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-bottom:10px;">
                ${['promessa', 'rodizio', 'importante', 'banco', 'lenda', 'capitao'].map(f => {
                    const bloqueado = relacaoTecnico < (RELACAO_MINIMA_FUNCAO[f] ?? 0);
                    return `
                    <div style="padding:8px; border-radius:6px; text-align:center; cursor:pointer; opacity:${bloqueado ? 0.55 : 1}; border:2px solid ${funcaoAtual === f ? 'var(--theme-primary)' : '#333'}; background:${funcaoAtual === f ? 'rgba(0,255,136,0.1)' : 'rgba(0,0,0,0.2)'};" onclick="mudarFuncaoElenco('${f}')">
                        <div style="font-size:1.5rem;">${bloqueado ? '🔒' : (f === 'promessa' ? '⭐' : f === 'rodizio' ? '🔄' : f === 'importante' ? '💪' : f === 'banco' ? '🪑' : f === 'lenda' ? '👑' : '🎯')}</div>
                        <div style="font-size:0.75rem; margin-top:4px; text-transform:uppercase;">${f}</div>
                    </div>
                `;}).join('')}
            </div>
            <p style="margin:5px 0 0; font-size:0.85rem; color:#aaa;">Função sugerida pelo técnico: <strong style="color:var(--success);">${funcaoSugerida}</strong></p>
        </div>
        
        <div style="margin:15px 0; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:var(--gold);">Relação com o Técnico</h4>
            <div style="display:flex; align-items:center; gap:15px;">
                <div style="flex:1; height:20px; background:#333; border-radius:10px; overflow:hidden;">
                    <div style="width:${relacaoTecnico}%; height:100%; background:linear-gradient(90deg, #ff4444, #ff8c00, #00a2e0, var(--success)); transition:width 0.5s;"></div>
                </div>
                <strong style="color:${corRelacao}; font-size:1.1rem;">${statusRelacao} (${relacaoTecnico}/100)</strong>
            </div>
            <p style="margin:10px 0 0; font-size:0.85rem; color:#aaa;">${relacaoTecnico < 40 ? '⚠️ Relação ruim pode levar ao banco e lista de transferências' : '✓ Boa relação aumenta chances de titularidade'}</p>
        </div>
        
        <div style="margin:15px 0; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:var(--gold);">Listas do Clube</h4>
            <div style="display:flex; gap:15px;">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" ${jogador.naListaTransferencias ? 'checked' : ''} onchange="toggleListaTransferencias(this.checked)">
                    <span>Lista de Transferências</span>
                </label>
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" ${jogador.naListaEmprestimo ? 'checked' : ''} onchange="toggleListaEmprestimo(this.checked)">
                    <span>Lista de Empréstimo</span>
                </label>
            </div>
        </div>

        ${htmlSolicitarPosicao(relacaoTecnico)}
        ${htmlFazerPromessa()}

        <div style="margin:15px 0; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px; text-align:center;">
            <h4 style="margin:0 0 10px; color:var(--gold);">🗣️ Conversa Coletiva</h4>
            <p style="margin:0 0 10px; font-size:0.85rem; color:#aaa;">Fala com o grupo e o técnico sobre o momento da equipa.</p>
            <button onclick="document.getElementById('modalConversaTecnico')?.remove(); abrirEntrevista('coletiva_time', {}, null)" style="width:100%; padding:10px; background:var(--theme-primary); color:#000; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Iniciar conversa coletiva</button>
        </div>
        
        ${podeSerCapitao && !jogador.eCapitao ? `
        <div style="margin:15px 0; padding:15px; background:rgba(255,215,0,0.1); border:1px solid rgba(255,215,0,0.3); border-radius:8px;">
            <h4 style="margin:0 0 10px; color:var(--gold);">🎯 Capitania Disponível</h4>
            <p style="margin:0; font-size:0.9rem; color:#ccc;">Reuniste os requisitos para ser capitão. O técnico está disposto a oferecer a braçadeira.</p>
            <button onclick="aceitarCapitania()" style="margin-top:10px; padding:10px 20px; background:var(--gold); color:#000; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Aceitar Capitania</button>
        </div>
        ` : ''}
    `;
    
    mostrarModalConversaTecnicoExpandido(clube.tecnico || "O treinador", "Conversa com o Técnico", htmlFuncoes);
});

function mostrarModalConversaTecnico(nomeTecnico, titulo, mensagem, mostrarAceitar = false) {
    mostrarModalConversaTecnicoExpandido(nomeTecnico, titulo, `<p class="coach-talk-quote">${mensagem}</p>`, mostrarAceitar);
}

function mostrarModalConversaTecnicoExpandido(nomeTecnico, titulo, conteudoHTML, mostrarAceitar = false) {
    // Remove existing modal if present
    const existingModal = document.getElementById("modalConversaTecnico");
    if(existingModal) existingModal.remove();
    
    const modal = document.createElement("div");
    modal.id = "modalConversaTecnico";
    modal.className = "modal";
    modal.innerHTML = `
        <div class="coach-talk-card" style="max-width:600px; max-height:80vh; overflow-y:auto;">
            <div class="coach-talk-avatar">🧑‍💼</div>
            <span class="coach-talk-tag">Conversa com ${nomeTecnico}</span>
            <h3 style="margin: 10px 0; color: var(--gold);">${titulo}</h3>
            ${conteudoHTML}
            <div style="display: flex; gap: 10px; margin-top:20px;">
                ${mostrarAceitar ? 
                    `<button class="coach-talk-btn" id="btnAceitarCapitania" style="flex: 1; background: var(--success);">Aceitar</button>` : 
                    ''}
                <button class="coach-talk-btn" id="btnFecharConversaTecnico" style="${mostrarAceitar ? 'flex: 1;' : ''}">Fechar</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    
    const fecharBtn = document.getElementById("btnFecharConversaTecnico");
    if(fecharBtn) {
        fecharBtn.onclick = () => {
            modal.remove();
        };
    }
    
    if(mostrarAceitar) {
        const aceitarBtn = document.getElementById("btnAceitarCapitania");
        if(aceitarBtn) {
            aceitarBtn.onclick = () => {
                jogador.eCapitao = true;
                jogador.funcaoNoElenco = "capitao";
                registrarNoticia("Nova capitania", `${jogador.nome} foi nomeado capitão do ${clubes.find(c => c.id === jogador.clubeId)?.nome || "seu clube"}!`, "Clube");
                mostrarToast("Capitão", "Foste nomeado capitão da equipa! Podes treinar 2 vezes por partida.", "success");
                modal.remove();
                atualizarUI();
                window.salvarJogo();
            };
        }
    }
}

// Exigência mínima de relação com o técnico para CADA função no elenco — o
// jogador só pode PEDIR, o técnico é quem decide se aceita. Funções "para
// baixo" (banco, promessa) não têm exigência: ninguém recusa um jogador que
// aceita um papel menor.
const RELACAO_MINIMA_FUNCAO = { promessa: 0, banco: 0, rodizio: 25, importante: 55, lenda: 75, capitao: 60 };

window.mudarFuncaoElenco = function(novaFuncao) {
    const relacaoTecnico = jogador.relacaoTecnico || 50;
    const minimoExigido = RELACAO_MINIMA_FUNCAO[novaFuncao] ?? 0;
    const clube = clubes.find(c => c.id === jogador.clubeId);
    const nomeTecnico = clube?.tecnico || "O treinador";

    // 🛡️ FIX: a função no elenco já não é escolhida livremente — é um PEDIDO
    // que depende da relação com o técnico (exatamente como o pedido de
    // mudança de posição). "Capitão" também exige os requisitos normais de
    // capitania (anos no clube, OVR, titularidade), iguais aos do bloco
    // "Capitania Disponível".
    if (relacaoTecnico < minimoExigido) {
        mostrarModalConversaTecnico(nomeTecnico, "Pedido recusado", `"Ainda não confio o suficiente em ti para te dar esse papel no plantel. Continua a mostrar serviço."`);
        return;
    }
    if (novaFuncao === "capitao") {
        const anosNoClube = jogador.anoNoClubeAtual || 0;
        const podeSerCapitao = anosNoClube >= 3 && (jogador.geral || 60) >= 75 && (jogador.titularidade || 48) >= 60 && relacaoTecnico >= 60;
        if (!podeSerCapitao) {
            mostrarModalConversaTecnico(nomeTecnico, "Pedido recusado", `"A braçadeira é uma responsabilidade grande. Ainda não estás pronto para isso."`);
            return;
        }
    }

    jogador.funcaoNoElenco = novaFuncao;
    
    // Relationship impact based on role change
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
    // Refresh modal
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

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

aplicarHistoricosReaisIniciais();

// ⚙️ Bolinha flutuante de configurações — reúne efeitos sonoros, música de
// fundo, volume e "próxima faixa" num único botão, pra não poluir a tela com
// vários botões soltos. Clique na bolinha pra abrir/fechar o painel.
(function criarBolinhaConfig() {
    const bolinha = document.createElement("button");
    bolinha.id = "btnConfigBolinha";
    bolinha.title = "Configurações";
    bolinha.textContent = "⚙️";
    bolinha.style.cssText = "position:fixed; bottom:14px; right:14px; z-index:9999; width:48px; height:48px; border-radius:50%; border:1px solid rgba(255,255,255,0.15); background:rgba(0,0,0,0.7); color:#fff; font-size:1.3rem; cursor:pointer; backdrop-filter:blur(6px); box-shadow:0 2px 10px rgba(0,0,0,0.4); transition:transform .2s ease;";
    bolinha.onmouseenter = () => bolinha.style.transform = "scale(1.08)";
    bolinha.onmouseleave = () => bolinha.style.transform = "scale(1)";

    const painel = document.createElement("div");
    painel.id = "painelConfigBolinha";
    painel.style.cssText = "position:fixed; bottom:70px; right:14px; z-index:9999; display:none; flex-direction:column; gap:10px; background:rgba(15,15,15,0.92); border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:14px; width:210px; backdrop-filter:blur(8px); box-shadow:0 4px 18px rgba(0,0,0,0.5);";

    // --- Linha: efeitos sonoros ---
    const linhaSons = document.createElement("div");
    linhaSons.style.cssText = "display:flex; align-items:center; justify-content:space-between; color:#fff; font-size:0.85rem;";
    const btnSons = document.createElement("button");
    btnSons.style.cssText = "width:36px; height:36px; border-radius:50%; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06); color:#fff; font-size:1.05rem; cursor:pointer;";
    const atualizarIconeSons = () => { btnSons.textContent = somAtivado() ? "🔊" : "🔇"; };
    atualizarIconeSons();
    btnSons.onclick = () => { window.alternarSons(); atualizarIconeSons(); };
    linhaSons.innerHTML = `<span>Efeitos sonoros</span>`;
    linhaSons.appendChild(btnSons);

    // --- Linha: música (liga/desliga + pular faixa) ---
    const linhaMusica = document.createElement("div");
    linhaMusica.style.cssText = "display:flex; align-items:center; justify-content:space-between; color:#fff; font-size:0.85rem;";
    const grupoBotoesMusica = document.createElement("div");
    grupoBotoesMusica.style.cssText = "display:flex; gap:6px;";
    const btnMusica = document.createElement("button");
    btnMusica.style.cssText = "width:36px; height:36px; border-radius:50%; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06); color:#fff; font-size:1.05rem; cursor:pointer;";
    const atualizarIconeMusica = () => { btnMusica.textContent = musicaAtivada() ? "🎵" : "🔕"; };
    atualizarIconeMusica();
    btnMusica.title = "Ligar/desligar música";
    btnMusica.onclick = () => { window.alternarMusica(); atualizarIconeMusica(); atualizarNomeFaixa(); };
    // Setinha para pular para a próxima faixa da playlist.
    const btnProxima = document.createElement("button");
    btnProxima.textContent = "⏭️";
    btnProxima.title = "Próxima música";
    btnProxima.style.cssText = "width:36px; height:36px; border-radius:50%; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06); color:#fff; font-size:1rem; cursor:pointer;";
    btnProxima.onclick = () => { window.proximaMusica(); atualizarIconeMusica(); };
    grupoBotoesMusica.appendChild(btnMusica);
    grupoBotoesMusica.appendChild(btnProxima);
    linhaMusica.innerHTML = `<span>Música de fundo</span>`;
    linhaMusica.appendChild(grupoBotoesMusica);

    // --- Linha: nome da faixa tocando agora ---
    const linhaFaixaAtual = document.createElement("div");
    linhaFaixaAtual.id = "linhaFaixaAtualBolinha";
    linhaFaixaAtual.style.cssText = "color:#00ff88; font-size:0.78rem; font-style:italic; text-align:center; min-height:1em;";
    const atualizarNomeFaixa = () => {
        const nome = window.obterNomeMusicaAtual?.();
        linhaFaixaAtual.textContent = musicaAtivada() && nome ? `🎶 Tocando: ${nome}` : "";
    };
    atualizarNomeFaixa();
    // Atualiza sozinha sempre que a faixa trocar (troca automática, pular, ou entrar/sair da tela de criação).
    document.addEventListener("musicaTrocou", atualizarNomeFaixa);

    // --- Linha: volume da música ---
    const linhaVolume = document.createElement("div");
    linhaVolume.style.cssText = "display:flex; flex-direction:column; gap:4px; color:#fff; font-size:0.8rem;";
    const painelVolume = document.createElement("input");
    painelVolume.type = "range"; painelVolume.min = "0"; painelVolume.max = "1"; painelVolume.step = "0.05";
    painelVolume.value = String(volumeMusica());
    painelVolume.style.cssText = "width:100%; accent-color:#00ff88; cursor:pointer;";
    painelVolume.oninput = () => window.definirVolumeMusica(painelVolume.value);
    linhaVolume.innerHTML = `<span>Volume da música</span>`;
    linhaVolume.appendChild(painelVolume);

    painel.appendChild(linhaSons);
    painel.appendChild(linhaMusica);
    painel.appendChild(linhaFaixaAtual);
    painel.appendChild(linhaVolume);

    let aberto = false;
    bolinha.onclick = () => {
        aberto = !aberto;
        painel.style.display = aberto ? "flex" : "none";
    };
    // Fecha o painel se o jogador clicar fora dele.
    document.addEventListener("click", (e) => {
        if (aberto && !painel.contains(e.target) && e.target !== bolinha) {
            aberto = false;
            painel.style.display = "none";
        }
    });

    document.body.appendChild(painel);
    document.body.appendChild(bolinha);
})();

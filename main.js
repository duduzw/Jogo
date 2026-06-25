﻿import { jogadorModelo, competicoes, clubes, jogadoresIA, tabelasLigas, feedNoticias, preencherLigasVazias } from './data/database.js';
import { MatchEngine } from './engine/match.js';
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

    // Initialize manager state
    window.managerState.clubeId = clubeId;
    window.managerState.clubeNome = clube.nome;
    window.managerState.orçamentoTransferências = clube.orçamento || 50000000;
    window.managerState.orçamentoSalários = clube.orçamentoSalários || 20000000;
    window.managerState.confiançaDiretoria = 100;

    // Extract squad from club
    window.managerState.elenco = window.jogadoresIA.filter(j => j.clubeId === clubeId);

    console.log("Modo Manager inicializado para:", clube.nome);
    console.log("Elenco:", window.managerState.elenco.length, "jogadores");
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
let agendaTemporada = [];
let propostasPendentes = [];
let premiosIndividuaisPendentes = [];
let transferenciasHistorico = [];
let eventosRecentes = [];
let janelaMeioAnoProcessada = false;
let copasEstado = {};
let selecoesEstado = { convocacoes: [], ultimaChave: "", campeoes: {}, ranking: {}, nationsDiv: {}, torneios: {}, planteisTorneio: {}, premiosLigaAno: {}, vagasTorneio: {} };
window.vagasContinentais = { uefa_cl: [], uefa_el: [], uefa_col: [], conmebol_lib: [], conmebol_sul: [], concacaf_clc: [], afc_cla: [] };
let campeoesAnoAnterior = { ligas: {}, copas: {} };
let uiFiltroCompInt = "todos";
let uiSelectCompInt = null;
let managerEstado = { ativo: false, treinador: null, clubeId: null, confianca: 65, tatica: { formacao: "4-3-3", estilo: "pressao", mentalidade: "equilibrado" }, orcamentoTransferencias: 0, folhaSalarial: 0, base: [] };

// ==========================================
// 🔍 CLUB ROSTER FETCHING (WITH FRIENDS)
// ==========================================

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
    localStorage.setItem("rumo_estrelato_pro_vivo", JSON.stringify({ 
        jogador, ano: anoAtual, rodada: rodadaAtual, agenda: agendaTemporada, 
        tabelas: tabelasLigas, copas: copasEstado, vagasContinentais: window.vagasContinentais, 
        campeoesAnoAnterior: campeoesAnoAnterior, premiosIndividuaisPendentes: premiosIndividuaisPendentes,
        transferenciasHistorico: transferenciasHistorico, eventosRecentes: eventosRecentes, janelaMeioAnoProcessada: janelaMeioAnoProcessada,
        selecoesEstado: selecoesEstado,
        managerEstado: managerEstado,
        clubesSave: clubes, npcsSave: jogadoresIA 
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
        inicializarEstadoCarreiraJogador();
        if(dados.vagasContinentais) window.vagasContinentais = dados.vagasContinentais;
        if(dados.campeoesAnoAnterior) campeoesAnoAnterior = dados.campeoesAnoAnterior;
        if(dados.premiosIndividuaisPendentes) premiosIndividuaisPendentes = dados.premiosIndividuaisPendentes;
        if(dados.transferenciasHistorico) transferenciasHistorico = dados.transferenciasHistorico;
        if(dados.eventosRecentes) eventosRecentes = dados.eventosRecentes;
        if(dados.managerEstado) managerEstado = { ativo: false, treinador: null, clubeId: null, confianca: 65, tatica: { formacao: "4-3-3", estilo: "pressao", mentalidade: "equilibrado" }, orcamentoTransferencias: 0, folhaSalarial: 0, base: [], ...dados.managerEstado };
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
        if(dados.npcsSave) { jogadoresIA.length = 0; dados.npcsSave.forEach(n => jogadoresIA.push(n)); }
        normalizarElencosEPosicoes();
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
        return true;
    } return false;
}

const CONFIG_VAGAS_CONTINENTAIS = {
    "eng_1": { cl: 4, el: 2, col: 1 }, "esp_1": { cl: 4, el: 2, col: 1 }, "ita_1": { cl: 4, el: 2, col: 1 },
    "ger_1": { cl: 4, el: 2, col: 1 }, "fra_1": { cl: 3, el: 2, col: 1 }, "pt_1":  { cl: 2, el: 2, col: 1 },
    "nl_1":  { cl: 2, el: 1, col: 2 }, "tr_1":  { cl: 2, el: 2, col: 1 }, "sco_1":  { cl: 1, el: 1, col: 1 }, "br_1":  { lib: 6, sul: 6 },
    "arg_1": { lib: 5, sul: 6 },"uy_1":  { lib: 4, sul: 4 }, "ara_1": { cla: 4 }, "usa_1": { clc: 4 }, "mx_1": { clc: 4 },"nga_1": { clc: 4 },
    "cvi_1": { clc: 2 },
    "default_uefa": { cl: 1, el: 1, col: 1 }, "default_conmebol": { lib: 2, sul: 2 },
    "default_asia": { cla: 4 }, "default_concacaf": { clc: 4 },
};

const TOP5_LIGAS_EUROPA = ["eng_1", "esp_1", "ita_1", "ger_1", "fra_1"];
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
    { id:"sel_costmf", pais:"Costa do Marfim", nome:"Costa do Marfim", conf:"CAF", logo:"https://upload.wikimedia.org/wikipedia/pt/a/a1/F%C3%A9d%C3%A9ration_Ivorienne_de_Football.png?_=20151125183758", cor:"#ef4444" }
];
const COMPETICOES_SELECOES = [
    { id:"amistoso", nome:"Amistosos Internacionais", conf:"GLOBAL", ciclo:"Data FIFA", jogos:1 },
    { id:"eliminatorias_uefa", nome:"Eliminatórias UEFA (Copa)", conf:"UEFA", ciclo:"regular", jogos:10 },
    { id:"eliminatorias_conmebol", nome:"Eliminatórias CONMEBOL", conf:"CONMEBOL", ciclo:"regular", jogos:18 },
    { id:"eliminatorias_concacaf", nome:"Eliminatórias CONCACAF", conf:"CONCACAF", ciclo:"regular", jogos:6 },
    { id:"eliminatorias_caf", nome:"Eliminatórias CAF", conf:"CAF", ciclo:"regular", jogos:6 },
    { id:"eliminatorias_afc", nome:"Eliminatórias AFC", conf:"AFC", ciclo:"regular", jogos:6 },
    { id:"eliminatorias_wc", nome:"Eliminatórias da Copa do Mundo", conf:"GLOBAL", ciclo:"regular", jogos:2 },
    { id:"copa_mundo", nome:"Copa do Mundo", conf:"GLOBAL", ciclo:"mundial", jogos:7 },
    { id:"olimpiadas", nome:"Olimpíadas (Sub-23)", conf:"GLOBAL", ciclo:"olimpico", jogos:6, sub23:true },
    { id:"euro", nome:"Eurocopa", conf:"UEFA", ciclo:"continental", jogos:7 },
    { id:"copa_america", nome:"Copa América", conf:"CONMEBOL", ciclo:"continental", jogos:6 },
    { id:"gold_cup", nome:"Gold Cup", conf:"CONCACAF", ciclo:"continental", jogos:5 },
    { id:"copa_africa", nome:"Copa Africana de Nações", conf:"CAF", ciclo:"continental", jogos:5 },
    { id:"copa_asia", nome:"Copa da Ásia", conf:"AFC", ciclo:"continental", jogos:5 },
    { id:"euro_qualy", nome:"Eliminatórias da Eurocopa", conf:"UEFA", ciclo:"regular", jogos:8 },
    { id:"nations_a", nome:"Nations League — Divisão A", conf:"UEFA", ciclo:"nations", jogos:6, div:"A" },
    { id:"nations_b", nome:"Nations League — Divisão B", conf:"UEFA", ciclo:"nations", jogos:6, div:"B" },
    { id:"nations_c", nome:"Nations League — Divisão C", conf:"UEFA", ciclo:"nations", jogos:6, div:"C" },
    { id:"nations_d", nome:"Nations League — Divisão D", conf:"UEFA", ciclo:"nations", jogos:4, div:"D" }
];

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
    uefa_cl: { modelo: "europeu", grupos: [7, 10, 13, 16, 19, 22], mata: { "Oitavos de Final": [30, 31], "Quartas de Final": [34, 35], "Semifinal": [38, 39], "Final": [43] }, janela: "Champions League" },
    uefa_el: { modelo: "europeu", grupos: [7, 10, 13, 16, 19, 22], mata: { "Oitavos de Final": [29, 30], "Quartas de Final": [34, 35], "Semifinal": [38, 39], "Final": [42] }, janela: "Europa League" },
    uefa_col: { modelo: "europeu", grupos: [7, 10, 13, 16, 19, 22], mata: { "Oitavos de Final": [29, 30], "Quartas de Final": [33, 34], "Semifinal": [37, 38], "Final": [41] }, janela: "Conference League" },
    conmebol_lib: { modelo: "ano", grupos: [12, 16, 20, 24, 28, 32], mata: { "Oitavos de Final": [35, 36], "Quartas de Final": [38, 39], "Semifinal": [41, 42], "Final": [43] }, janela: "Libertadores" },
    conmebol_sul: { modelo: "ano", grupos: [12, 16, 20, 24, 28, 32], mata: { "Oitavos de Final": [34, 35], "Quartas de Final": [37, 38], "Semifinal": [40, 41], "Final": [42] }, janela: "Sul-Americana" },
    concacaf_clc: { modelo: "ano", grupos: [8, 11, 14, 17, 20, 23], mata: { "Semifinal": [28, 29], "Final": [33] }, janela: "Concacaf Champions Cup" },
    afc_cla: { modelo: "europeu", grupos: [8, 11, 14, 17, 20, 23], mata: { "Oitavos de Final": [29, 30], "Quartas de Final": [33, 34], "Semifinal": [37, 38], "Final": [41] }, janela: "AFC Champions" },
    uefa_supercup: { modelo: "europeu", slots: [2], mata: { "Final": [2] }, janela: "Supercopa da UEFA" },
    conmebol_recopa: { modelo: "ano", slots: [5, 6], mata: { "Final": [5, 6] }, janela: "Recopa Sul-Americana" },
    intercontinental_cup: { modelo: "ano", slots: [44, 45, 46], mata: { "Playoff Intercontinental": [44], "Final do Desafiante": [45], "Final": [46] }, janela: "Copa Intercontinental da FIFA" }
};

const CALENDARIO_SELECOES_REALISTA = {
    amistoso: { modelo: "europeu", slots: [7, 13, 22, 31, 44], janela: "Data FIFA" },
    eliminatorias_uefa: { modelo: "europeu", slots: [7, 13, 22, 31, 44], janela: "Eliminatorias UEFA" },
    eliminatorias_conmebol: { modelo: "ano", slots: [11, 19, 31, 39, 45], janela: "Eliminatorias CONMEBOL" },
    eliminatorias_concacaf: { modelo: "ano", slots: [11, 19, 31, 39, 45], janela: "Eliminatorias CONCACAF" },
    eliminatorias_caf: { modelo: "europeu", slots: [7, 13, 22, 31, 44], janela: "Eliminatorias CAF" },
    eliminatorias_afc: { modelo: "europeu", slots: [7, 13, 22, 31, 44], janela: "Eliminatorias AFC" },
    euro_qualy: { modelo: "europeu", slots: [7, 13, 22, 31, 44], janela: "Eliminatorias da Euro" },
    nations_a: { modelo: "europeu", slots: [7, 13, 22, 31, 44], janela: "Nations League" },
    nations_b: { modelo: "europeu", slots: [7, 13, 22, 31, 44], janela: "Nations League" },
    nations_c: { modelo: "europeu", slots: [7, 13, 22, 31, 44], janela: "Nations League" },
    nations_d: { modelo: "europeu", slots: [7, 13, 22, 31, 44], janela: "Nations League" },
    copa_mundo: { modelo: "europeu", slots: [45, 46, 47, 48, 49, 50, 51], janela: "Copa do Mundo" },
    euro: { modelo: "europeu", slots: [45, 46, 47, 48, 49, 50, 51], janela: "Eurocopa" },
    copa_america: { modelo: "ano", slots: [23, 24, 25, 26, 27, 28], janela: "Copa America" },
    gold_cup: { modelo: "ano", slots: [23, 24, 25, 26, 27], janela: "Gold Cup" },
    copa_africa: { modelo: "europeu", slots: [22, 23, 24, 25, 26], janela: "Copa Africana" },
    copa_asia: { modelo: "europeu", slots: [22, 23, 24, 25, 26], janela: "Copa da Asia" },
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
    if (comp?.tipo === "continental" || CALENDARIO_COMPETICOES_REALISTAS[compId]?.grupos) {
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
    if(n.includes("aust")) return "Austria";
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
    if(n.includes("austr")) return "Australia";
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
    if(selecao.conf === "UEFA" && ano % 2 === 1 && ehJanelaSelecaoCalendario(slotAtual)) {
        const div = (obterDivisaoNations(selecao) || "C").toLowerCase();
        return COMPETICOES_SELECOES.find(c => c.id === `nations_${div}`) || COMPETICOES_SELECOES.find(c => c.id === "nations_c");
    }
    if(selecao.conf === "UEFA" && ano % 4 === 3 && ehJanelaSelecaoCalendario(slotAtual)) return COMPETICOES_SELECOES.find(c => c.id === "euro_qualy");
    if(ano % 4 === 1 && ehJanelaSelecaoCalendario(slotAtual)) {
        const mapElim = { UEFA:"eliminatorias_uefa", CONMEBOL:"eliminatorias_conmebol", CONCACAF:"eliminatorias_concacaf", CAF:"eliminatorias_caf", AFC:"eliminatorias_afc" };
        return COMPETICOES_SELECOES.find(c => c.id === (mapElim[selecao.conf] || "eliminatorias_uefa"));
    }
    if(ehJanelaSelecaoCalendario(slotAtual)) return COMPETICOES_SELECOES.find(c => c.id === "amistoso");
    return COMPETICOES_SELECOES.find(c => c.id === "amistoso");
}

function obterJogadoresNacionalidade(pais) {
    const alvo = normalizarNacionalidade(pais);
    return [jogador, ...jogadoresIA.filter(j => !j.aposentado && normalizarNacionalidade(j.nacionalidade) === alvo)];
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
    const plantel = selecoesEstado.planteisTorneio[torneioKey]?.[selecaoId] || [];
    plantel.forEach(pid => {
        const p = pid === "player" ? jogador : jogadoresIA.find(j => j.id === pid);
        if(!p) return;
        if(!p.titulosSelecao) p.titulosSelecao = [];
        p.titulosSelecao.unshift({ ano: anoAtual, selecao: SELECOES.find(s=>s.id===selecaoId)?.nome || "", trofeu: nomeComp });
        if(p.historicoCarreira?.[0]) {
            p.historicoCarreira[0].trofeus = p.historicoCarreira[0].trofeus === "-" ? nomeComp : p.historicoCarreira[0].trofeus + ", " + nomeComp;
        }
        p.pontosPremio = (p.pontosPremio || 0) + 45;
        
        // Push achievement to Firebase if this is the human player and online mode is active
        if (pid === "player" && window.firebaseIntegration && window.firebaseIntegration.isOnlineMode()) {
            window.firebaseIntegration.pushAchievementToFirebase(nomeComp, nomeComp);
        }
    });
    const sel = SELECOES.find(s => s.id === selecaoId);
    registrarNoticia(`${sel?.nome || "Seleção"} campeã!`, `A Seleção ${sel?.nome} conquistou a ${nomeComp} ${anoAtual}!`, "Seleções");
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
    return idsCompeticoesAtivas(ano).map(id => COMPETICOES_SELECOES.find(c => c.id === id)).filter(Boolean);
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
            if (estado.rodadaAtual > maxRod) processarFimGruposInternacional(key, estado, fmt);
        } else if (estado.tipo === "liga" && estado.tabela) {
            
            // 👇 ESCUDO ANTI-CRASH: Se a liga estiver vazia (ex: Nations D), encerra ela silenciosamente
            if (estado.tabela.length === 0) {
                estado.fase = "Campeão Definido"; 
                estado.campeaoId = "Nenhum";
                continue; 
            }

            const tab = [...estado.tabela].sort(() => Math.random() - 0.5);
            for (let i = 0; i < tab.length - 1; i += 2) {
                if (!tab[i] || !tab[i+1]) continue; // Escudo extra de segurança na rodada
                if (tab[i].id === jogador?.selecaoId || tab[i + 1].id === jogador?.selecaoId) continue;
                const fA = calcularForcaSelecao(tab[i].id), fB = calcularForcaSelecao(tab[i + 1].id);
                const { gA, gB } = simularPlacarSelecao(fA, fB);
                tab[i].j++; tab[i + 1].j++;
                tab[i].gf += gA; tab[i].gs += gB; tab[i + 1].gf += gB; tab[i + 1].gs += gA;
                if (gA > gB) tab[i].pts += 3; else if (gB > gA) tab[i + 1].pts += 3; else { tab[i].pts++; tab[i + 1].pts++; }
            }
            estado.rodadaAtual = (estado.rodadaAtual || 1) + 1;
            
            if (estado.rodadaAtual > (estado.maxRodadas || 4)) {
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
            const idxFase = indiceFaseCalendario(estado.fase);
            adicionarEventoCalendario({
                tipo: `${comp.nome} (${estado.fase})`, compId: key, compConfigId: comp.id,
                adversarioId: adv.id, isSelecao: true, isMataMata: true, fase: estado.fase, mandanteId: selecao.id, isFinal: estado.fase === "Final"
            }, cfgCal.slots?.[Math.min(idxFase + 3, cfgCal.slots.length - 1)] || obterProximoSlotSelecao(comp.id), cfgCal.janela, cfgCal.modelo);
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
            if (art.p.historicoCarreira?.[0]) art.p.historicoCarreira[0].trofeus = art.p.historicoCarreira[0].trofeus === "-" ? nomePremio : art.p.historicoCarreira[0].trofeus + ", " + nomePremio;
            registrarNoticia(nomePremio, `${art.p.nome} foi o artilheiro da ${liga.nome} com ${art.g} gols.`, "Prémios");
            if ((art.p.id || "player") === "player") {
                jogador.geral = Math.min(99, jogador.geral + 2);
                jogador.moral = Math.min(100, jogador.moral + 12);
                jogador.pontosPremio = (jogador.pontosPremio || 0) + 18;
                jogador.valorMercadoNum = calcularValorMercadoJogador(jogador);
                mostrarToast("Chuteira de Ouro", `Artilheiro da ${liga.nome}! +2 OVR e visibilidade no mercado.`, "success");
            }
        }
        if (ast?.a > 0) {
            const nomePremio = `Garçom da Liga — ${liga.nome}`;
            ast.p.pontosPremio = (ast.p.pontosPremio || 0) + 14;
            if (ast.p.historicoCarreira?.[0]) ast.p.historicoCarreira[0].trofeus = ast.p.historicoCarreira[0].trofeus === "-" ? nomePremio : ast.p.historicoCarreira[0].trofeus + ", " + nomePremio;
            registrarNoticia(nomePremio, `${ast.p.nome} liderou as assistências da ${liga.nome} com ${ast.a}.`, "Prémios");
            if ((ast.p.id || "player") === "player") {
                jogador.geral = Math.min(99, jogador.geral + 1);
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
        if(p === jogador) p.estatisticasAtuais = { jogos: 0, gols: 0, assistencias: 0 };
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
    const elenco = obterJogadoresNacionalidade(sel.pais).sort((a,b) => b.geral - a.geral).slice(0, 15);
    const htmlTitulos = titulos.length ? titulos.map(t => `
        <div class="card-conquista"><img src="${obterUrlImagem(t.nome, 'trofeu')}" class="trofeu-icon" style="width:50px;height:50px;"><div><strong style="color:var(--gold);">${t.nome}</strong><br><span style="color:#aaa;">${t.ano}</span></div></div>`).join("")
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
        <h3 style="color:var(--theme-primary); margin-top:24px;">Elenco destacado</h3>${htmlElenco}`;
    modal.classList.remove("oculto");
};

function renderArvoreMataMata(confrontos, corComp = "#00ff88", faseLabel = "") {
    if (!confrontos?.length) return "";
    const label = faseLabel || (confrontos.length === 1 ? "Final" : confrontos.length === 2 ? "Semifinal" : confrontos.length === 4 ? "Quartas" : "Oitavas");
    const slots = confrontos.map(conf => {
        const pen = conf.penaltis ? `<span class="penalty-badge">${conf.placarPen || "Pênaltis"}</span>` : "";
        const sc = conf.golsA !== null && conf.golsA !== undefined ? `${conf.golsA} - ${conf.golsB}` : "A definir";
        const team = (t, win) => {
            if (!t) return "";
            const elim = conf.vencedorId && conf.vencedorId !== t.id;
            return `<div class="bracket-slot-team ${win ? "winner" : ""} ${elim ? "eliminated" : ""}" onclick="abrirPerfilSelecao('${t.id}')"><img src="${t.logo || ""}"><span>${t.nome}</span></div>`;
        };
        return `<div class="bracket-slot ${conf.timeA?.id === jogador?.selecaoId || conf.timeB?.id === jogador?.selecaoId ? "meu-jogo" : ""}" style="--comp-cor:${corComp}">
            ${team(conf.timeA, conf.vencedorId === conf.timeA?.id)}
            <div class="bracket-slot-score">${sc}${pen}</div>
            ${team(conf.timeB, conf.vencedorId === conf.timeB?.id)}
        </div>`;
    }).join("");
    return `<div class="bracket-tree"><div class="bracket-round"><div class="bracket-round-label">${label}</div>${slots}</div></div>`;
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

function renderTorneioInternacionalCompleto(tor, key) {
    const cor = tor.cor || CORES_COMP[tor.compConfigId] || CORES_COMP.default;
    const meta = metaCompeticao(tor.compConfigId, tor.ano);
    const elim = isEliminatoria(tor.compConfigId);
    const prog = tor.tipo === "grupos" && tor.maxRodadas ? Math.min(100, Math.round(((tor.rodadaAtual || 1) - 1) / tor.maxRodadas * 100)) : (["Vagas Definidas", "Classificação Definida", "Campeão Definido"].includes(tor.fase) ? 100 : 50);
    let html = `<div class="comp-int-card comp-int-premium" style="--comp-cor:${cor}">
        <div class="comp-int-header">
            <div class="comp-int-title-block">
                <span class="comp-int-icon">${meta.icon}</span>
                <div><h3>${tor.nome}</h3>
                <p>${meta.subtitulo || `Temporada ${tor.ano}`}${elim ? " • Sem troféu — apenas vagas" : ""}</p></div>
            </div>
            <span class="meta-pill comp-fase-pill">${rotuloFaseTorneo(tor)}</span>
        </div>
        <div class="comp-progress-wrap"><div class="comp-progress-bar" style="width:${prog}%"></div></div>`;
    if (tor.historicoFases?.length) tor.historicoFases.forEach(f => { html += renderBlocoFaseInternacional(f, cor); });
    if (tor.tipo === "grupos" && tor.grupos) html += renderBlocoFaseInternacional(tor, cor);
    else if (tor.tipo === "liga" && tor.tabela) {
        const ord = [...tor.tabela].sort((a, b) => b.pts - a.pts || (b.gf - b.gs) - (a.gf - a.gs));
        const colClass = elim ? "Classificados" : "#";
        html += `<div class="fase-bloco bracket-phase"><h4 class="bracket-title">${elim ? "Tabela — vagas em jogo" : "Classificação"}</h4><table class="grupo-table comp-table-premium"><tr><th>${colClass}</th><th>Seleção</th><th>Pts</th><th>J</th><th>SG</th></tr>
            ${ord.map((e, i) => {
                const s = SELECOES.find(x => x.id === e.id);
                const qual = elim && i < (FORMATOS_INT[tor.compConfigId]?.vagas || 4);
                return `<tr class="${qual ? "row-qualified" : ""}" onclick="abrirPerfilSelecao('${e.id}')"><td>${qual ? "✓" : i + 1}</td><td><img src="${s?.logo || ""}" class="bracket-flag">${s?.nome || e.nome}</td><td><strong>${e.pts}</strong></td><td>${e.j}</td><td>${e.gf - e.gs}</td></tr>`;
            }).join("")}
        </table></div>`;
    } else if (tor.tipo === "mata-mata" && tor.confrontos) {
        html += `<div class="fase-bloco bracket-phase"><h4 class="bracket-title">${tor.fase}</h4>${renderArvoreMataMata(tor.confrontos, cor, tor.fase)}</div>`;
    }
    if (tor.fase === "Campeão Definido" && !elim) {
        const camp = SELECOES.find(s => s.id === tor.campeaoId);
        html += `<div class="comp-campeao-banner">👑 Campeão: ${camp?.nome || tor.campeaoId}</div>`;
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
        { id: "eliminatorias", label: "🛤️ Eliminatórias" },
        { id: "continental", label: "🏆 Continentais" },
        { id: "mundial", label: "🌍 Mundial / Olimpíadas" },
        { id: "nations", label: "⚔️ Nations League" }
    ];

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
            <div class="comp-cat-tabs">${cats.map(c => `<button type="button" class="comp-cat-tab ${filtroCat === c.id ? "ativo" : ""}" data-cat="${c.id}">${c.label}</button>`).join("")}</div>
            <div class="comp-int-layout">
                <aside class="comp-int-sidebar">
                    <h4>Torneios ${anoAtual}</h4>
                    ${torneios.length ? torneios.map(t => {
                        const elim = isEliminatoria(t.comp.id);
                        const done = ["Vagas Definidas", "Classificação Definida"].includes(t.tor.fase) || (t.tor.fase === "Campeão Definido" && !elim);
                        const camp = !elim && t.tor.campeaoId ? SELECOES.find(s => s.id === t.tor.campeaoId)?.nome : null;
                        return `<button type="button" class="comp-sidebar-item ${t.comp.id === compAtual?.comp.id ? "ativo" : ""}" data-comp="${t.comp.id}" style="--comp-cor:${t.tor.cor || CORES_COMP.default}">
                            <span>${t.meta.icon}</span>
                            <div><strong>${t.comp.nome.replace("Eliminatórias ", "").replace(" — Divisão ", " Div. ")}</strong>
                            <small>${t.meta.subtitulo || rotuloFaseTorneo(t.tor)}</small>
                            ${camp ? `<em>👑 ${camp}</em>` : (elim && done ? `<em>🎫 Vagas definidas</em>` : "")}
                            </div>
                        </button>`;
                    }).join("") : `<p class="comp-empty-sidebar">Nenhuma competição neste filtro.</p>`}
                </aside>
                <main class="comp-int-main">
                    ${compAtual ? renderTorneioInternacionalCompleto(compAtual.tor, compAtual.key) : `<div class="comp-empty-main"><span>🌍</span><p>Nenhum torneio internacional ativo nesta temporada.</p><small>Eliminatórias da Copa rodam em anos como ${anoAtual % 4 === 1 ? anoAtual : anoAtual + (1 - (anoAtual % 4))}. Euro/Eliminatórias Euro em ${anoAtual % 4 === 3 ? anoAtual : anoAtual + (3 - (anoAtual % 4))}.</small></div>`}
                </main>
            </div>
        </div>`;

    el.querySelectorAll(".comp-cat-tab").forEach(btn => btn.onclick = () => {
        uiFiltroCompInt = btn.dataset.cat;
        renderizarCompeticoesInternacionais();
    });
    el.querySelectorAll(".comp-sidebar-item").forEach(btn => btn.onclick = () => {
        uiSelectCompInt = btn.dataset.comp;
        aplicarTemaCompeticao(uiSelectCompInt);
        renderizarCompeticoesInternacionais();
    });
}

function renderizarPesquisaSelecoes() {
    const el = document.getElementById("view-pesquisa-sel");
    if (!el) return;
    atualizarRankingFIFA();
    const q = normalizarTexto(document.getElementById("inputPesquisaSel")?.value || "");
    let lista = [...SELECOES];
    if (q.length >= 2) lista = lista.filter(s => normalizarTexto(s.nome).includes(q) || normalizarTexto(s.pais).includes(q));
    const rankMap = Object.fromEntries((selecoesEstado.ranking || []).map(r => [r.id, r.pos]));
    el.innerHTML = `
        <div class="comp-int-shell">
            <div class="classificacao-hero" style="margin-bottom:20px;">
                <div><h2>🔎 Pesquisar Seleções</h2><p>Elenco, ranking FIFA e galeria de troféus de cada país.</p></div>
            </div>
            <input type="text" id="inputPesquisaSel" class="modern-select" placeholder="Buscar país..." value="${document.getElementById("inputPesquisaSel")?.value || ""}" style="margin-bottom:20px; width:100%;">
            <div class="paises-grid">
                ${lista.map(s => {
                    const titulos = selecoesEstado.campeoes?.[s.id]?.length || 0;
                    const pos = rankMap[s.id] || "—";
                    return `<button class="btn-pais-filtro" onclick="abrirPerfilSelecao('${s.id}')">
                        <span class="pais-logo"><img src="${s.logo}" alt=""></span>
                        <span><span class="pais-label">${s.nome}</span><span class="pais-sub">FIFA #${pos} • ${titulos} título(s) • ${s.conf}</span></span>
                    </button>`;
                }).join("")}
            </div>
        </div>`;
    document.getElementById("inputPesquisaSel")?.addEventListener("input", () => renderizarPesquisaSelecoes());
}

function renderBlocoFaseInternacional(faseObj, corComp) {
    if(faseObj.tipo === "grupos" && faseObj.grupos) {
        let grid = `<div class="grupo-grid">`;
        faseObj.grupos.forEach(grp => {
            const ord = [...grp.equipas].sort((a,b) => b.pts - a.pts || (b.gf-b.gs) - (a.gf-a.gs));
            grid += `<div class="bracket-group-card"><h4>${grp.nome}</h4><table class="grupo-table"><tr><th>Seleção</th><th>Pts</th><th>J</th><th>SG</th></tr>
                ${ord.map(e => {
                    const s = SELECOES.find(x=>x.id===e.id);
                    return `<tr class="${e.id===jogador?.selecaoId?'bracket-row-me':''}" onclick="abrirPerfilSelecao('${e.id}')"><td><img src="${s?.logo||''}" class="bracket-flag">${s?.nome||e.nome}</td><td><strong>${e.pts}</strong></td><td>${e.j}</td><td>${e.gf-e.gs}</td></tr>`;
                }).join("")}</table></div>`;
        });
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
    .card-conquista { display: flex; align-items: center; background: rgba(255,215,0,0.05); padding: 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid rgba(255,215,0,0.3); transition: 0.3s; }
    .card-conquista:hover { background: rgba(255,215,0,0.1); transform: translateX(5px); }
    
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
    .gala-awards-grid { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:12px; margin:24px 0; }
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
    .fase-bloco { border-radius:14px !important; background:linear-gradient(145deg, rgba(24,24,27,0.92), rgba(0,0,0,0.58)) !important; border:1px solid rgba(255,255,255,0.12) !important; }
    .match-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:14px; }
    .selecao-shell { display:grid; grid-template-columns:minmax(0,1.4fr) minmax(280px,0.8fr); gap:18px; align-items:start; }
    .selecao-hero { border:1px solid rgba(255,255,255,0.12); border-radius:16px; padding:22px; background:radial-gradient(circle at 18% 0%, rgba(0,255,136,0.16), transparent 36%), linear-gradient(145deg, rgba(24,24,27,0.96), rgba(0,0,0,0.76)); display:flex; justify-content:space-between; gap:16px; align-items:center; }
    .selecao-hero img { width:82px; height:58px; border-radius:10px; object-fit:cover !important; box-shadow:0 12px 26px rgba(0,0,0,0.35); }
    .selecao-card { border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.32); border-radius:14px; padding:16px; }
    .convocacao-grupo { margin-top:14px; }
    .convocacao-grupo h4 { margin:0 0 10px; color:var(--theme-primary); text-transform:uppercase; font-size:0.82rem; }
    .convocado-row { display:grid; grid-template-columns:42px 1fr auto; gap:10px; align-items:center; padding:9px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); margin-bottom:8px; }
    .convocado-row.eu { border-color:#facc15; background:rgba(250,204,21,0.12); box-shadow:0 0 20px rgba(250,204,21,0.12); }
    .convocado-row img { width:42px; height:42px; border-radius:50%; object-fit:cover !important; }
    .convocado-row small { color:#aaa; font-weight:800; }
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
    .bracket-slot-team { display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:8px; cursor:pointer; font-weight:700; font-size:0.88rem; transition:0.25s; }
    .bracket-slot-team img { width:24px; height:16px; object-fit:cover; border-radius:3px; }
    .bracket-slot-team.winner { color:var(--success); background:rgba(16,185,129,0.15); box-shadow:0 0 12px rgba(16,185,129,0.25); }
    .bracket-slot-team.eliminated { opacity:0.38; filter:grayscale(0.6); }
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
`;
document.head.appendChild(styleOverrides);

// ==========================================
// 🔍 FUNÇÕES DE APOIO E UTILIDADES
// ==========================================
function normalizarTexto(texto) { return texto ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : ""; }

function obterPaisCompeticaoId(compId) {
    const partes = String(compId || "").split("_");
    if (partes[0] === "copa" || partes[0] === "supercopa" || partes[0] === "carabao") return partes[1] || partes[0];
    return partes[0];
}

function obterUrlImagem(entidade, tipo) {
    if (!entidade) return "";
    if (tipo === 'trofeu') {
        if(entidade.includes("Bola de Ouro") || entidade.includes("Melhor do Mundo")) return "https://i.ibb.co/4Z0zvRz7/d9404dec-5649-4fd5-95e9-2e9be21bb805.png";
        if(entidade.includes("Golden Boy")) return "https://i.ibb.co/b5Sd7xcQ/9643960f-eb44-407e-bbaf-bf60218a4c6b.png";
        if(entidade.includes("Chuteira de Ouro")) return "https://i.ibb.co/ch87vZpv/41f6515d-fe2a-4628-9d9d-15fa1a8fe84f.png";
        if(entidade.includes("Assist") || entidade.includes("Maestro") || entidade.includes("Rei das Assistencias")) return "https://cdn-icons-png.flaticon.com/512/1004/1004314.png";
        if(entidade.includes("Melhor Goleiro")) return "https://i.ibb.co/Kj8b22RW/3c80b476-f71c-4436-90f5-a0e16a48e56d.png";

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
        if(entidade.includes("Oceania Cup") || entidade.includes("ofc_nations_cup")) return "https://upload.wikimedia.org/wikipedia/en/thumb/9/95/OFC_Nations_Cup_logo.svg/512px-OFC_Nations_Cup_logo.svg.png";

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
        
        //EUROPA
        if(entidade.includes("Premier") || entidade.includes("eng_1")) return "https://i.ibb.co/cSZyLnqP/bff12c7f-4c7a-4313-a4d8-7d67d1e68cb0.png";
        if(entidade.includes("Championship") || entidade.includes("eng_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/869.png?lm=1646225519";
        if(entidade.includes("Carabao Cup") || entidade.includes("carabao_eng")) return "https://tmssl.akamaized.net//images/erfolge/medium/47.png?lm=1520606999";
        if(entidade.includes("FA Cup") || entidade.includes("copa_eng")) return "https://tmssl.akamaized.net//images/erfolge/medium/29.png?lm=1520606999";
        if(entidade.includes("Community Shield") || entidade.includes("supercopa_eng")) return "https://tmssl.akamaized.net//images/erfolge/medium/316.png?lm=1520606999";

        if(entidade.includes("Bundesliga") || entidade.includes("ger_1")) return "https://tmssl.akamaized.net//images/erfolge/header/10.png?lm=1520606996";
        if(entidade.includes("Bundesliga 2") || entidade.includes("ger_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/378.png?lm=1461847499";
        if(entidade.includes("DFB-Pokal") || entidade.includes("copa_ger")) return "https://tmssl.akamaized.net//images/erfolge/medium/27.png?lm=1520606999";
        if(entidade.includes("DFL-Supercup") || entidade.includes("supercopa_ge")) return "https://tmssl.akamaized.net//images/erfolge/medium/312.png?lm=1520606999";

        if(entidade.includes("La Liga") || entidade.includes("esp_1")) return "https://i.ibb.co/v6QhJQFn/bfa85829-8d60-4816-a4c8-453fba80dd94.png";
        if(entidade.includes("Copa del Rey") || entidade.includes("copa_esp")) return "https://tmssl.akamaized.net//images/erfolge/medium/94.png?lm=1520606999";
        if(entidade.includes("Supercopa da Espanha") || entidade.includes("supercopa_esp")) return "https://tmssl.akamaized.net//images/erfolge/medium/93.png?lm=1520606999";

        if(entidade.includes("Serie A") || entidade.includes("ita_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/13.png?lm=1520606997";
        if(entidade.includes("Coppa Italia") || entidade.includes("copa_ita")) return "https://tmssl.akamaized.net//images/erfolge/medium/96.png?lm=1520606999";
        if(entidade.includes("Supercoppa Italiana") || entidade.includes("supercopa_ita")) return "https://tmssl.akamaized.net//images/erfolge/medium/97.png?lm=1520606999";

        if(entidade.includes("Liga Portugal") || entidade.includes("por_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/15.png?lm=1520606999";
        if(entidade.includes("Liga Portugal 2") || entidade.includes("por_2")) return "https://tmssl.akamaized.net//images/erfolge/medium/458.png?lm=1511173307";
        if(entidade.includes("Taca de Portugal") || entidade.includes("copa_pt")) return "https://tmssl.akamaized.net//images/erfolge/medium/100.png?lm=1520606996";
        if(entidade.includes("Supertaca de Portugal") || entidade.includes("supercopa_pt")) return "https://tmssl.akamaized.net//images/erfolge/medium/337.png?lm=1520606999";

        if(entidade.includes("Ligue 1") || entidade.includes("fra_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/14.png?lm=1729163534";
        if(entidade.includes("Coupe de France") || entidade.includes("copa_fra")) return "https://tmssl.akamaized.net//images/erfolge/medium/35.png?lm=1520606999";
        if(entidade.includes("Trophee des Champions") || entidade.includes("supercopa_fra")) return "https://tmssl.akamaized.net//images/erfolge/medium/321.png?lm=1704485193";

        if(entidade.includes("Eredivise") || entidade.includes("nl_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/16.png?lm=1520606999";
        if(entidade.includes("KNVB Cup") || entidade.includes("copa_nl")) return "https://tmssl.akamaized.net//images/erfolge/medium/151.png?lm=1520606999";
        if(entidade.includes("Johan Cruyff Shield") || entidade.includes("supercopa_nl")) return "https://tmssl.akamaized.net//images/erfolge/medium/288.png?lm=1511173147";

        if(entidade.includes("Süper Lig") || entidade.includes("tr_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/20.png?lm=1780043166";
        if(entidade.includes("Turkish Cup") || entidade.includes("copa_tr")) return "https://tmssl.akamaized.net//images/erfolge/medium/148.png?lm=1780049586";
        if(entidade.includes("Turkish Super Cup") || entidade.includes("Süpercopa_tr")) return "https://tmssl.akamaized.net//images/erfolge/medium/149.png?lm=1780055873";

         //ASIA
        if(entidade.includes("Saudi Pro") || entidade.includes("ara_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/271.png?lm=1748099013";
        if(entidade.includes("Kings Cup") || entidade.includes("copa_ara")) return "https://tmssl.akamaized.net//images/erfolge/medium/456.png?lm=1626256782";
        if(entidade.includes("Saudi Super Cup") || entidade.includes("Supercopa_ara")) return "https://tmssl.akamaized.net//images/erfolge/medium/457.png?lm=1616407405";

         if(entidade.includes("Nigeria Professional Football League") || entidade.includes("nga_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/516.png?lm=1780133279";
  
        
         //AMERICA NORTE
        if(entidade.includes("MLS") || entidade.includes("usa_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/241.png?lm=1520606999";
        if(entidade.includes("Open Cup") || entidade.includes("copa_usa")) return "https://tmssl.akamaized.net//images/erfolge/medium/244.png?lm=1466586047";
        if(entidade.includes("Leagues Cup") || entidade.includes("Supercopa_usa")) return "https://tmssl.akamaized.net//images/erfolge/medium/604.png?lm=1606063811";

        if(entidade.includes("Liga MX Apertura") || entidade.includes("mx_1")) return "https://tmssl.akamaized.net//images/erfolge/medium/153.png?lm=1461847499";
        if(entidade.includes("Copa Mexico") || entidade.includes("copa_mx")) return "https://tmssl.akamaized.net//images/erfolge/medium/392.png?lm=1654154831";
        if(entidade.includes("Campeón de Campeones") || entidade.includes("Supercopa_mx")) return "https://tmssl.akamaized.net//images/erfolge/medium/577.png?lm=1653896973";
   
       

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
function mudarTela(id) { document.querySelectorAll(".tela").forEach(t => t.classList.add("oculto")); let tela = document.getElementById(id); if (tela) tela.classList.remove("oculto"); }
function mostrarToast(titulo, mensagem, tipo = 'info') {
    const container = document.getElementById('toastContainer'); if(!container) return;
    const toast = document.createElement('div'); toast.className = `toast ${tipo === 'gold' ? 'gold-anim' : ''}`;
    toast.innerHTML = `<h4>${titulo}</h4><p>${mensagem}</p>`; container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 4000);
}

function registrarNoticia(manchete, corpo, categoria = "Geral") {
    const item = { manchete, corpo, data: `${categoria} • ${anoAtual} • Rodada ${rodadaAtual}` };
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
        "Mercado"
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
        lista.forEach((j, idx) => { if(!j.posicao || j.posicao === "Base") j.posicao = template[idx % template.length]; });
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

function atualizarStatsSelecao(p, jogos, gols, assistencias) {
    if(!p.statsSelecao) p.statsSelecao = { jogos:0, gols:0, assistencias:0, convocacoes:0 };
    p.statsSelecao.jogos += jogos;
    p.statsSelecao.gols += gols;
    p.statsSelecao.assistencias += assistencias;
    p.statsSelecao.selecao = normalizarNacionalidade(p.nacionalidade);
}

function simularPartidasSelecao(convocacao) {
    const jogos = Math.max(1, convocacao.competicao?.jogos || 1);
    const pesosGol = { "Atacante":0.95, "Ponta":0.72, "Meia Ofensivo":0.58, "Meio-Campista":0.36, "Volante":0.18, "Lateral":0.14, "Zagueiro":0.08, "Goleiro":0.01 };
    const pesosAst = { "Atacante":0.36, "Ponta":0.70, "Meia Ofensivo":0.86, "Meio-Campista":0.70, "Volante":0.42, "Lateral":0.48, "Zagueiro":0.10, "Goleiro":0.02 };
    const pool = convocacao.convocados;
    if(pool.length === 0) return;
    const sortear = (campo) => {
        const pesos = campo === "gols" ? pesosGol : pesosAst;
        const total = pool.reduce((acc,p) => acc + Math.pow((p.geral || 60) / 100, 4.6) * (pesos[p.posicao] || 0.22), 0);
        let alvo = Math.random() * total;
        for(const p of pool) {
            alvo -= Math.pow((p.geral || 60) / 100, 4.6) * (pesos[p.posicao] || 0.22);
            if(alvo <= 0) return p;
        }
        return pool[0];
    };
    pool.forEach(p => {
        if(!p.statsSelecao) p.statsSelecao = { jogos:0, gols:0, assistencias:0, convocacoes:0 };
        p.statsSelecao.convocacoes++;
        atualizarStatsSelecao(p, jogos, 0, 0);
    });
    for(let j=0; j<jogos; j++) {
        const golsTime = Math.max(0, Math.floor(Math.random()*3) + (pool.some(p=>p.geral>=88) ? 1 : 0));
        for(let g=0; g<golsTime; g++) {
            const autor = sortear("gols");
            const assist = Math.random() < 0.78 ? sortear("assistencias") : null;
            if(autor) atualizarStatsSelecao(autor, 0, 1, 0);
            if(assist && assist.id !== autor?.id) atualizarStatsSelecao(assist, 0, 0, 1);
        }
    }
}

function cardConvocadoAnimado(p, delay) {
    const clube = obterClubeJogador(p);
    const logoClube = clube ? obterUrlImagem(clube, 'clube') : "";
    return `<div class="convocado-card convocado-anim ${p.id === "player" ? "eu" : ""}" style="animation-delay:${delay}s;">
        <img class="convocado-foto" src="${obterUrlImagem(p,'jogador')}" alt="${p.nome}">
        <div style="flex:1; min-width:0;">
            <strong>${p.nome}${p.id === "player" ? " ⭐" : ""}</strong><br>
            <small style="color:#aaa; font-weight:700;">${p.posicao}</small>
        </div>
        ${logoClube ? `<img class="convocado-clube" src="${logoClube}" alt="${clube?.nome || ''}" title="${clube?.nome || ''}">` : ""}
        <span class="meta-pill">OVR ${p.geral}</span>
    </div>`;
}

function mostrarAnimacaoConvocacao(convocacao) {
    const antigo = document.getElementById("modalConvocacaoSelecao");
    if(antigo) antigo.remove();
    const labels = { goleiros:"Goleiros", laterais:"Laterais", defensores:"Defensores", meio:"Meio-campistas", ataque:"Ataque" };
    let delay = 0;
    const euConvocado = convocacao.convocado;
    const banner = euConvocado
        ? `<div class="convocacao-convocado-banner">⭐ ${jogador.nome} FOI CONVOCADO pela Seleção ${convocacao.selecao.nome}!</div>`
        : `<div class="convocacao-nao-convocado">❌ ${jogador.nome} não atingiu o nível exigido e ficou DE FORA da convocação.</div>`;
    const bloco = (key) => `
        <div class="convocacao-grupo">
            <h4>${labels[key]}</h4>
            <div class="convocacao-modal-grid">
                ${(convocacao.grupos[key] || []).map(p => { delay += 0.05; return cardConvocadoAnimado(p, delay); }).join("")}
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
                <button class="close-btn" onclick="document.getElementById('modalConvocacaoSelecao')?.remove()">×</button>
            </div>
            ${banner}
            ${["goleiros","laterais","defensores","meio","ataque"].map(bloco).join("")}
            <div style="text-align:center; margin-top:20px;"><button class="btn btn-primary" onclick="document.getElementById('modalConvocacaoSelecao')?.remove()">Fechar Lista ➔</button></div>
        </div>`;
    document.body.appendChild(modal);
}

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
        if(convocacao) mostrarAnimacaoConvocacao(convocacao);
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
    if(convocacao.convocado && FORMATOS_INT[competicao.id]?.formato !== "amistoso") inicializarTorneioInternacional(competicao);
    if(convocacao.convocado) agendarJogosInternacionais();
    renderizarSelecoes();
}
window.processarJanelaSelecoes = processarJanelaSelecoes;
window.renderizarCompeticoesInternacionais = renderizarCompeticoesInternacionais;
window.renderizarPesquisaSelecoes = renderizarPesquisaSelecoes;

function renderizarSelecoes() {
    const el = document.getElementById("view-selecoes");
    if(!el || !jogador) return;
    const selecao = obterSelecaoPorNacionalidade(jogador.nacionalidade);
    const proxima = obterCompeticaoSelecao(selecao);
    const ultima = selecoesEstado.convocacoes?.find(c => c.selecaoId === selecao.id);
    const todos = [jogador, ...jogadoresIA.filter(j => !j.aposentado)];
    const resolver = (id) => id === "player" ? jogador : jogadoresIA.find(j => j.id === id);
    const grupos = ultima?.grupos ? Object.fromEntries(Object.entries(ultima.grupos).map(([k, ids]) => [k, ids.map(resolver).filter(Boolean)])) : gerarConvocacaoSelecao(selecao, proxima).grupos;
    const labels = { goleiros:"Goleiros", laterais:"Laterais", defensores:"Defensores", meio:"Meio-campistas", ataque:"Ataque" };
    const bloco = (key) => `
        <div class="convocacao-grupo">
            <h4>${labels[key]}</h4>
            ${(grupos[key] || []).map(p => {
                const clube = obterClubeJogador(p);
                return `<div class="convocado-row ${p.id === "player" ? "eu" : ""}" onclick="abrirPerfilJogador('${p.id}')">
                    <img src="${obterUrlImagem(p,'jogador')}" alt="${p.nome}">
                    <div><strong>${p.nome}</strong><br><small>${clube?.nome || "Livre"} • ${p.posicao} • ${p.statsSelecao?.jogos || 0}J ${p.statsSelecao?.gols || 0}G ${p.statsSelecao?.assistencias || 0}A</small></div>
                    ${clube ? `<img src="${obterUrlImagem(clube,'clube')}" style="width:24px;height:24px;object-fit:contain;background:#fff;border-radius:4px;padding:2px;">` : ""}
                    <span class="meta-pill">OVR ${p.geral}</span>
                </div>`;
            }).join("") || `<p style="color:#aaa;">Sem nomes suficientes.</p>`}
        </div>`;
    const rankingSelecao = todos
        .filter(p => normalizarNacionalidade(p.nacionalidade) === normalizarNacionalidade(selecao.pais))
        .sort((a,b) => (b.statsSelecao?.gols || 0) - (a.statsSelecao?.gols || 0) || (b.geral || 0) - (a.geral || 0))
        .slice(0, 8);
    el.innerHTML = `
        <div class="selecao-shell">
            <section>
                <div class="selecao-hero">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <img src="${selecao.logo}" alt="${selecao.nome}" onerror="this.style.display='none'">
                        <div><span style="color:var(--theme-primary); font-weight:900; text-transform:uppercase;">Carreira internacional</span><h2 style="margin:4px 0;">Seleção ${selecao.nome}</h2><p style="margin:0; color:#aaa;">Próxima janela: ${proxima.nome}${proxima.div ? ` • Divisão ${proxima.div}` : ""}</p></div>
                    </div>
                    <button class="btn btn-primary" onclick="processarJanelaSelecoes(true)">Ver convocação</button>
                </div>
                <div class="selecao-card" style="margin-top:16px;">
                    <h3 style="margin-top:0;">Lista ${ultima ? `${ultima.competicao} ${ultima.ano}` : "prévia"}</h3>
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
        jogadoresIA.push({
            id:`j_newgen_${anoAtual}_${criados}_${Date.now().toString(36)}`,
            nome,
            idade,
            geral,
            clubeId:clube.id,
            nacionalidade:nacionalidades[Math.floor(Math.random()*nacionalidades.length)],
            posicao:posicoes[Math.floor(Math.random()*posicoes.length)],
            foto:"",
            contrato:Math.floor(Math.random()*3)+2,
            felicidade:60 + Math.floor(Math.random()*25),
            inteligencia:45 + Math.floor(Math.random()*28),
            statsTemporada:{ jogos:0, gols:0, assistencias:0, notas:[] },
            statsSelecao:{ jogos:0, gols:0, assistencias:0, convocacoes:0 },
            historicoCarreira:[]
        });
        criados++;
    }
    if(criados) registrarNoticia("Nova geração chega aos clubes", `${criados} jovens jogadores foram integrados às bases e elencos profissionais para renovar o mercado.`, "Base");
}

window.aplicarTemaCompeticao = function(compId) {
    const id = String(compId || "hub");
    const prefix = obterPaisCompeticaoId(id);
    const temas = {
        hub: { cor: "#00ff88", img: "" },
        eng: { cor: "#00d8ff", img: "https://i.ibb.co/5h5QGVXb/Texture-Theme-EPL.png" },
        esp: { cor: "#ff4d4d", img: "https://i.ibb.co/8nhCpHTN/Texture-Theme-La-Liga.png" },
        ita: { cor: "#4ade80", img: "https://i.ibb.co/Cpmcn1Mp/d3565473-9dd0-4955-928b-64e68b18b129.png" },
        ger: { cor: "#ef4444", img: "https://i.ibb.co/8Wn88Pg/Texture-Theme-Bundesliga.png" },
        fra: { cor: "#60a5fa", img: "https://i.ibb.co/Q7nv3KTN/Texture-Theme-Ligue-One.png" },
        pt: { cor: "#22c55e", img: "https://i.ibb.co/Zz0q8HSy/6ddcbece-af8f-4889-b9aa-d720c01a6771.png" },
        br: { cor: "#facc15", img: "https://images.unsplash.com/photo-1518605368461-1ee7116838a1?q=80&w=2000&auto=format&fit=crop" },
        arg: { cor: "#7dd3fc", img: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000&auto=format&fit=crop" },
        usa: { cor: "#60a5fa", img: "https://i.ibb.co/p631bhjv/Texture-Theme-MLS.png" },
        ara: { cor: "#045712", img: "https://i.ibb.co/XkywSZ5T/8b754c3d-8759-47ac-9bc7-1921110aac8e.png" },
        mx: { cor: "#22c55e", img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop" },
        uefa_cl: { cor: "#93c5fd", img: "https://i.ibb.co/MxG3hvhK/Texture-Theme-UCL.png" },
        uefa_el: { cor: "#fb923c", img: "https://i.ibb.co/Wvr2Z0QH/Texture-Theme-Euro-League.png" },
        uefa_col: { cor: "#22c55e", img: "https://i.ibb.co/Rx14dxQ/Texture-Theme-UECL.png" },
        conmebol_lib: { cor: "#f59e0b", img: "https://i.ibb.co/8LCFn0Df/6a6deb85-920a-4b42-8beb-2bf148aef7e7.png" },
        conmebol_sul: { cor: "#22c55e", img: "https://i.ibb.co/Fk6C2qTQ/Texture-Theme-Sudamericana.png" },
        copa_mundo: { cor: "#facc15", img: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=2000&auto=format&fit=crop" },
        euro: { cor: "#3b82f6", img: "https://images.unsplash.com/photo-1527871252447-4ce32da643c2?q=80&w=2000&auto=format&fit=crop" },
        copa_america: { cor: "#22c55e", img: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000&auto=format&fit=crop" },
        amistoso: { cor: "#a7f3d0", img: "https://i.ibb.co/MxX9NRZM/b2268041-c169-4da2-80e1-1eb51ccc2802.png" }
    };
    const tema = temas[id] || temas[prefix] || (id.includes("uefa") ? temas.uefa_cl : null) || (id.includes("conmebol") ? temas.conmebol_lib : null) || temas.hub;
    
    document.documentElement.style.setProperty("--theme-primary", tema.cor);
    document.body.dataset.competicaoTema = id;
    
    if (tema.img) {
        // A linha abaixo foi modificada para carregar apenas a imagem
        document.body.style.backgroundImage = `url('${tema.img}')`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
    } else {
        document.body.style.backgroundImage = "";
    }
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
    if(typeof jogador.titularidade === "undefined") jogador.titularidade = 48;
    if(typeof jogador.lesaoRodadas === "undefined") jogador.lesaoRodadas = 0;
    if(typeof jogador.entrevistasRespondidas === "undefined") jogador.entrevistasRespondidas = 0;
    if(!jogador.statsSelecao) jogador.statsSelecao = { jogos:0, gols:0, assistencias:0, convocacoes:0 };
    if(!jogador.melhorAtuacao) jogador.melhorAtuacao = { gols:0, assistencias:0, nota:0, adversario:"", rodada:0 };
    if(!jogador.listaDesejos) jogador.listaDesejos = [];
    if(!jogador.objetivosCarreira) jogador.objetivosCarreira = [];
    if(!jogador.clubeAlvoId) jogador.clubeAlvoId = null;
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
    if(!jogador) return;
    inicializarEstadoCarreiraJogador();
    const nota = 5.5 + (gols * 1.4) + (assistencias * 0.9) + ((jogador.geral || 60) - 60) * 0.04;
    const atual = jogador.melhorAtuacao?.nota || 0;
    if(nota > atual) {
        jogador.melhorAtuacao = { gols, assistencias, nota: Math.round(nota * 10) / 10, adversario: adversario || "Rival", rodada: rodadaAtual };
    }
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

function abrirEntrevista(tipo, contexto = {}) {
    inicializarEstadoCarreiraJogador();
    if(document.getElementById("modalEntrevista")) return;
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
        }]
    };
    const lista = perguntas[tipo] || perguntas.pre;
    const cfg = lista[Math.floor(Math.random() * lista.length)];
    const modal = document.createElement("div");
    modal.id = "modalEntrevista";
    modal.className = "modal";
    modal.innerHTML = `
        <div class="interview-card slide-in">
            <div style="display:flex; justify-content:space-between; gap:14px; align-items:flex-start;">
                <div>
                    <span style="color:var(--theme-primary); font-weight:900; text-transform:uppercase;">${cfg.titulo}</span>
                    <h2 style="margin:8px 0 10px;">${cfg.pergunta}</h2>
                    <p style="margin:0 0 14px; color:#aaa;">A resposta mexe com moral, imprensa e luta pela titularidade.</p>
                </div>
                <button class="close-btn" onclick="document.getElementById('modalEntrevista')?.remove()">×</button>
            </div>
            ${cfg.opcoes.map((op, i) => `<button class="interview-option" onclick="responderEntrevista('${tipo}', ${i})">${op.texto}</button>`).join("")}
        </div>`;
    modal.dataset.tipo = tipo;
    modal._opcoes = cfg.opcoes;
    document.body.appendChild(modal);
}

window.responderEntrevista = function(tipo, idx) {
    const modal = document.getElementById("modalEntrevista");
    const op = modal?._opcoes?.[idx];
    if(!op) { modal?.remove(); return; }
    jogador.moral = Math.max(0, Math.min(100, (jogador.moral || 55) + op.moral));
    ajustarTitularidade(op.titularidade);
    jogador.entrevistasRespondidas = (jogador.entrevistasRespondidas || 0) + 1;
    registrarNoticia(op.noticia, `${jogador.nome}: "${op.texto}"`, "Entrevista");
    modal.remove();
    window.salvarJogo();
    atualizarHub();
};

function dispararAnimacaoCampeao(nomeTime, nomeCompeticao, logoTimeUrl) {
    const modal = document.createElement("div");
    modal.className = "modal-campeao";
    for (let i = 0; i < 150; i++) {
        let confete = document.createElement("div"); confete.className = "confete";
        confete.style.left = Math.random() * 100 + "vw"; confete.style.animationDuration = (Math.random() * 3 + 2) + "s";
        confete.style.backgroundColor = ["#ffd700", "#ffffff", "#00ff88", "#ff4444", "#00a2e0"][Math.floor(Math.random() * 5)];
        modal.appendChild(confete);
    }
    modal.innerHTML += `
        <div class="taca-animada">🏆</div><div class="titulo-campeao">¡CAMPEÃO!</div>
        <div style="display:flex; align-items:center; gap:20px; justify-content:center; margin:20px 0;">
            <img src="${logoTimeUrl}" style="width:100px; height:100px; border-radius:12px; filter: drop-shadow(0 0 15px rgba(255,255,255,0.4)); object-fit: contain;">
            <h1 style="font-size: 3.5rem; margin:0; letter-spacing:2px; text-shadow: 0 4px 10px rgba(0,0,0,0.8);">${nomeTime}</h1>
        </div>
        <p style="font-size: 1.5rem; color: #ccc; font-weight:bold; text-transform:uppercase;">Conquistou a glória na <strong>${nomeCompeticao}</strong></p>
        <button id="fecharModalCampeao" style="margin-top:50px; padding:15px 40px; background:linear-gradient(90deg, #ffd700, #ff8c00); color:#000; border:none; border-radius:30px; font-weight:900; cursor:pointer; font-size:1.3rem; box-shadow: 0 5px 25px rgba(255,215,0,0.5); text-transform:uppercase;">Continuar ➔</button>
    `;
    document.body.appendChild(modal);
    document.getElementById("fecharModalCampeao").onclick = () => { modal.style.opacity = '0'; setTimeout(() => modal.remove(), 500); };
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
            <button id="btn-aba-selecao" class="tab-btn-modal" onclick="mudarAbaModal('selecao')" style="background:none; color:#aaa; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">🌍 Seleção</button>
            <button id="btn-aba-hist" class="tab-btn-modal" onclick="mudarAbaModal('hist')" style="background:none; color:#aaa; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">Histórico de Épocas</button>
            <button id="btn-aba-premios" class="tab-btn-modal" onclick="mudarAbaModal('premios')" style="background:none; color:#aaa; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">🏆 Sala de Troféus</button>
        </div>
        <div id="aba-stats" class="aba-conteudo" style="margin-top:20px; overflow-y:auto; padding:0 10px;">${htmlStats}</div>
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
            return true;
        })
        .sort((a,b) => {
            const encaixeA = Math.abs((a.reputacao + (promessa ? 7 : 0)) - j.geral);
            const encaixeB = Math.abs((b.reputacao + (promessa ? 7 : 0)) - j.geral);
            return encaixeA - encaixeB || (b.inteligenciaMercado || 60) - (a.inteligenciaMercado || 60) || b.orcamento - a.orcamento;
        });
}

function escolherClubeEmprestimo(j) {
    return clubes
        .filter(c => c.id !== j.clubeId && c.reputacao >= j.geral - 12 && c.reputacao <= j.geral + 6)
        .sort((a,b) => Math.abs(a.reputacao - j.geral) - Math.abs(b.reputacao - j.geral));
}

function processarMercadoTransferencias(modoJanela = "principal") {
    propostasPendentes = [];
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
        const querEmprestimo = focoEmprestimo && j.idade <= 23 && j.geral < 78 && Math.random() < 0.55;
        let chanceTransferir = j.clubeId === "livre" ? 0.9 : (focoEmprestimo ? 0.035 : (j.contrato <= 1 ? 0.18 : (j.contrato >= 2 ? 0.025 : 0.06))) + ((j.felicidade || 55) < 35 ? 0.12 : 0);
        if(clubeAtual?.reputacao >= 84 && j.geral >= 84) chanceTransferir *= j.contrato >= 3 ? 0.08 : (j.contrato >= 2 ? 0.14 : 0.45);
        if(clubeAtual?.reputacao >= 88 && j.geral >= 86) chanceTransferir *= 0.05;

        if(querEmprestimo && clubeAtual) {
            let destino = escolherClubeEmprestimo(j)[0];
            if(destino) {
                j.clubeOrigemEmprestimo = clubeAtual.id; j.emprestadoAte = anoAtual; j.clubeId = destino.id;
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
                j.clubeId = destino.id; j.contrato = Math.floor(Math.random() * 4) + 2; delete j.clubeOrigemEmprestimo; delete j.emprestadoAte;
                feitos++;
            } else if(j.contrato <= 0) { j.clubeId = "livre"; j.contrato = 0; }
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
            <button class="btn btn-success" onclick="assinarContrato(${i})">Aceitar ➔</button>
        </div>`).join("") : `<div style="padding:20px;text-align:center;color:#888;border-radius:10px;background:rgba(0,0,0,0.3);">Nenhuma proposta oficial.</div>`;

    elDest.innerHTML = `
        <div class="dashboard-card" style="padding:24px;border-top:4px solid var(--success);">
            <h2 style="margin-top:0;">💼 Mercado & Carreira</h2>
            <p style="color:#aaa;">Clube: <strong style="color:var(--success);">${clubeAtual?.nome || "Livre"}</strong> • Contrato: ${jogador.contrato} anos • Valor: <strong style="color:var(--gold);">${valorMeu}</strong></p>
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
    if(nC.tipo === "renovacao") {
        jogador.contrato = nC.anos || Math.floor(Math.random() * 3) + 2;
        jogador.felicidade = Math.min(100, (jogador.felicidade || 60) + 8);
        registrarNoticia("Contrato renovado", `${jogador.nome} renovou com ${nC.nome} até ${anoAtual + jogador.contrato}.`, "Mercado");
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
    reconstruirAgendaAposTrocaClube();
    propostasPendentes = [];
    mostrarToast(nC.tipo === "emprestimo" ? "Empréstimo" : "Transferência", `${nC.tipo === "emprestimo" ? "Foste emprestado ao" : "Assinaste com o"} ${nC.nome}!`, "success");
    window.salvarJogo(); atualizarHub(); mudarTela("view-hub");
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
function renderizarNoticias() {
    const el = document.getElementById("view-noticias");
    if(!el) return;
    const noticias = [...eventosRecentes, ...feedNoticias].slice(0, 50);
    el.innerHTML = `
        <div class="dashboard-card" style="padding:25px; border-top:4px solid #3b82f6;">
            <h2 style="margin-top:0;">📰 Central de Notícias</h2>
            <div style="display:grid; gap:12px;">
                ${noticias.length ? noticias.map(n => `
                    <div style="background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:16px;">
                        <span style="color:#93c5fd; font-size:0.8rem; font-weight:900; text-transform:uppercase;">${n.data || "Notícia"}</span>
                        <h3 style="margin:6px 0; color:#fff;">${n.manchete}</h3>
                        <p style="margin:0; color:#cbd5e1;">${n.corpo}</p>
                    </div>`).join("") : `<p style="color:#aaa;">Sem notícias por enquanto.</p>`}
            </div>
        </div>`;
}

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
            if(Math.random() < 0.55) {
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
        }
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
function atribuirEstatisticaNPC(clubeId, golsFeitos, compId = null) {
    let elenco = jogadoresIA.filter(j => j.clubeId === clubeId && !j.aposentado);
    if(elenco.length === 0) return;
    elenco.forEach(j => { if(!j.statsTemporada) j.statsTemporada = { jogos: 0, gols: 0, assistencias: 0 }; j.statsTemporada.jogos++; registrarEstatisticaCompeticao(j, compId, 1, 0, 0); });

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

    const pesoGolPorPosicao = { "Atacante":0.82, "Ponta":0.62, "Meia Ofensivo":0.46, "Meio-Campista":0.28, "Volante":0.14, "Lateral":0.12, "Zagueiro":0.08, "Goleiro":0.01 };
    const pesoAssistPorPosicao = { "Atacante":0.30, "Ponta":0.58, "Meia Ofensivo":0.74, "Meio-Campista":0.62, "Volante":0.34, "Lateral":0.42, "Zagueiro":0.10, "Goleiro":0.02 };
    let poolFinalGolos = elenco.map(j => ({ jogador:j, peso:getPeso(j) * (pesoGolPorPosicao[j.posicao] || 0.25) }));
    let poolFinalAssist = elenco.map(j => ({ jogador:j, peso:getPeso(j) * (pesoAssistPorPosicao[j.posicao] || 0.25) }));

    for(let i = 0; i < golsFeitos; i++) {
        let artilheiro = sortear(poolFinalGolos);
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

    for (const [compId, vagasId] of Object.entries(window.vagasContinentais)) {
        if (vagasId && vagasId.length > 0) {
            let timesContinental = vagasId.map(id => clubes.find(c=>c.id===id)).filter(Boolean);
            if (timesContinental.length < 8 && timesContinental.length > 0) {
                let prefix = compId.includes("afc") ? "ara" : (compId.includes("concacaf") ? "usa" : "br");
                let extra = clubes.filter(c => c.ligaId.startsWith(prefix) && !vagasId.includes(c.id));
                while(timesContinental.length < 8 && extra.length > 0) { timesContinental.push(extra.pop()); }
            }
            timesContinental = timesContinental.slice(0, Math.floor(timesContinental.length/4)*4); 
            if(timesContinental.length >= 8) gerarFaseDeGrupos(compId, timesContinental); 
            else if (timesContinental.length >= 4) gerarChaveamentoMataMata(compId, timesContinental, "Semifinal");
            else if (timesContinental.length >= 2) gerarChaveamentoMataMata(compId, timesContinental, "Final");
        }
    }
}

function arquivarFase(compId) {
    let estado = copasEstado[compId]; if(!estado.historicoFases) estado.historicoFases = [];
    if(estado.tipo === "grupos") estado.historicoFases.push({ tipo: "grupos", fase: estado.fase, grupos: JSON.parse(JSON.stringify(estado.grupos)) });
    else if(estado.tipo === "mata-mata") estado.historicoFases.push({ tipo: "mata-mata", fase: estado.fase, confrontos: JSON.parse(JSON.stringify(estado.confrontos)) });
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
    for(let r = 0; r < adversariosLiga.length * 2; r++) {
        let adv = adversariosLiga[r % adversariosLiga.length];
        if(adv.id !== "folga_temp") {
            adicionarEventoCalendario({ tipo: `${nomeLiga} (J${jogoLigaIdx + 1})`, compId: meuClube.ligaId, adversarioId: adv.id, isMataMata: false, fase: "Liga" }, slotsLiga[jogoLigaIdx] || perfilPais.ligaFim, nomeLiga, perfilPais.modelo);
            jogoLigaIdx++;
        }
    }
    
    competicoes.filter(c => c.tipo.includes("copa") && obterPaisCompeticaoId(c.id) === pais && c.tipo !== "supercopa").forEach((copa, idx) => {
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
            if(estado.tipo === "grupos") {
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
    processarJanelaSelecoes();
    simularTorneiosInternacionais();
    
    for (const [ligaId, tabela] of Object.entries(tabelasLigas)) {
        let maxJogos = (tabela.length - 1) * 2;
        let timesParaSimular = tabela.filter(t => t.jogos < maxJogos && (ligaId !== competicoes.find(c=>c.id===compAtual?.compId)?.id || t.id !== jogador.clubeId));
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
            atribuirEstatisticaNPC(tC.id, gC, ligaId); atribuirEstatisticaNPC(tV.id, gV, ligaId);
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
                        atribuirEstatisticaNPC(tA.id, gA, compId); atribuirEstatisticaNPC(tB.id, gB, compId);
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
                }
            }
        } else if (estado.tipo === "mata-mata" && estado.confrontos) {
            let temJogoMeu = estado.confrontos.some(c => c.timeA.id === jogador.clubeId || c.timeB.id === jogador.clubeId);
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
                        atribuirEstatisticaNPC(conf.timeA.id, gC, compId); atribuirEstatisticaNPC(conf.timeB.id, gV, compId);
                    }
                });
                if(estado.confrontos.every(c => c.vencedorId) && estado.confrontos.length >= 1) avancarFaseMataMata(compId);
            }
        }
    }
}

// ==========================================
// 🚨 VIRADA DE TEMPORADA E FIM DE COPAS
// ==========================================
function forcarFimDeCopas() {
    let loopSafety = 100;
    while(loopSafety > 0) {
        let pendente = false;
        for (const [compId, estado] of Object.entries(copasEstado)) {
            if (estado.tipo === "grupos" && estado.grupos && estado.fase !== "Campeão Definido") {
                pendente = true;
                let classificados = [];
                estado.grupos.forEach(grp => {
                    grp.equipas.sort((a,b) => b.pts - a.pts || (b.gf-b.gs) - (a.gf-a.gs));
                    classificados.push(clubes.find(c=>c.id===grp.equipas[0]?.id), clubes.find(c=>c.id===grp.equipas[1]?.id));
                });
                arquivarFase(compId);
                gerarChaveamentoMataMata(compId, classificados.filter(Boolean), classificados.length >= 16 ? "Oitavos de Final" : "Quartos de Final");
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
        jogador.historicoCarreira.unshift({ ano: anoAtual, clube: clubes.find(c=>c.id===jogador.clubeId)?.nome || "Livre", jogos: jogador.estatisticasAtuais.jogos, gols: jogador.estatisticasAtuais.gols, assistencias: jogador.estatisticasAtuais.assistencias, trofeus: "-" });
        if(jogador.clubeOrigemEmprestimo && jogador.emprestadoAte <= anoAtual) {
            let origem = clubes.find(c => c.id === jogador.clubeOrigemEmprestimo);
            registrarNoticia("Fim de empréstimo", `${jogador.nome} regressou ao ${origem?.nome || "clube de origem"} após o fim da temporada.`, "Mercado");
            jogador.clubeId = jogador.clubeOrigemEmprestimo; delete jogador.clubeOrigemEmprestimo; delete jogador.emprestadoAte;
        }
        jogador.idade = (jogador.idade || 17) + 1;
        if(jogador.idade <= 22) jogador.geral += Math.floor(Math.random() * 2) + 1;
        else if(jogador.idade <= 27 && Math.random() > 0.55) jogador.geral += 1;
        else if(jogador.idade >= 32 && jogador.idade <= 35 && Math.random() > 0.55) jogador.geral -= 1;
        else if(jogador.idade >= 36) jogador.geral -= Math.floor(Math.random() * 2) + 1;
        jogador.geral = Math.max(40, Math.min(99, jogador.geral));

        jogadoresIA.forEach(j => {
            if(j.aposentado) return;
            if(!j.historicoCarreira) j.historicoCarreira = [];
            j.historicoCarreira.unshift({ ano: anoAtual, clube: clubes.find(c=>c.id===j.clubeId)?.nome || "Livre", jogos: j.statsTemporada?.jogos || 0, gols: j.statsTemporada?.gols || 0, assistencias: j.statsTemporada?.assistencias || 0, trofeus: "-" });
            if(j.clubeOrigemEmprestimo && j.emprestadoAte <= anoAtual) {
                j.clubeId = j.clubeOrigemEmprestimo; delete j.clubeOrigemEmprestimo; delete j.emprestadoAte;
            }
            j.idade = (j.idade || 20) + 1;
            if (j.idade <= 22) j.geral += Math.floor(Math.random() * 3) + 1; else if (j.idade <= 25 && Math.random() > 0.6) j.geral += 1;
            else if (j.idade >= 31 && j.idade <= 34) j.geral -= Math.floor(Math.random() * 2); else if (j.idade >= 35) j.geral -= Math.floor(Math.random() * 3) + 1;
            j.geral = Math.max(40, Math.min(99, j.geral));
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

        window.vagasContinentais = { uefa_cl: [], uefa_el: [], uefa_col: [], conmebol_lib: [], conmebol_sul: [], concacaf_clc: [], afc_cla: [] };
        campeoesAnoAnterior = { ligas: {}, copas: {} };

        let descidas = []; 
let subidas = [];

for (const [ligaId, tabela] of Object.entries(tabelasLigas)) {
    let tabOrd = [...tabela].sort((a,b) => b.pontos - a.pontos || ((b.gols||0) - (b.golsSofridos||0)) - ((a.gols||0) - (a.golsSofridos||0)) || (b.gols||0) - (a.gols||0));
    
    if(tabOrd[0]) {
        let campeaoClube = clubes.find(c => c.id === tabOrd[0].id); 
        let comp = competicoes.find(c => c.id === ligaId);
        campeoesAnoAnterior.ligas[ligaId] = campeaoClube.id;
        
        if(campeaoClube) {
            if(!campeaoClube.historicoTitulos) campeaoClube.historicoTitulos = []; 
            campeaoClube.historicoTitulos.unshift(`${anoAtual} - ${comp.nome}`);
            
            let elencoCamp = getElencoClube(campeaoClube.id);
            
            elencoCamp.forEach(j => { 
                if(j.historicoCarreira?.[0]) j.historicoCarreira[0].trofeus = j.historicoCarreira[0].trofeus === "-" ? comp.nome : j.historicoCarreira[0].trofeus + ", " + comp.nome; 
                j.pontosPremio += 50; 
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

    // ==========================================
    // 🔄 NOVA LÓGICA DINÂMICA DE ASCENSÃO E QUEDA
    // ==========================================
    let matchDiv = ligaId.match(/_(\d+)$/); // Captura o número da divisão no fim do ID (ex: 1, 2, 3, 4)
    
    if (matchDiv) {
        let divAtual = parseInt(matchDiv[1]);
        
        // 📉 REGRA DE REBAIXAMENTO (Cair)
        // Se existir uma divisão abaixo (ex: se estou na br_2 e existe a br_3), os 3 últimos caem
        let proximaDivId = ligaId.replace(`_${divAtual}`, `_${divAtual + 1}`);
        if (tabelasLigas[proximaDivId] && tabOrd.length > 4) {
            descidas.push({ 
                from: ligaId, 
                to: proximaDivId, 
                teams: tabOrd.slice(-3).map(t => t.id) 
            });
        }

        // 📈 REGRA DE ACESSO (Subir)
        // Se eu não estiver na primeira divisão e a divisão de cima existir, os 3 primeiros sobem
        let divAnteriorId = ligaId.replace(`_${divAtual}`, `_${divAtual - 1}`);
        if (divAtual > 1 && tabelasLigas[divAnteriorId] && tabOrd.length > 3) {
            subidas.push({ 
                from: ligaId, 
                to: divAnteriorId, 
                teams: tabOrd.slice(0, 3).map(t => t.id) 
            });
        }
    }
}

// Executa as transferências de liga de forma definitiva
descidas.forEach(d => d.teams.forEach(tId => { let c = clubes.find(x=>x.id===tId); if(c) c.ligaId = d.to; }));
subidas.forEach(s => s.teams.forEach(tId => { let c = clubes.find(x=>x.id===tId); if(c) c.ligaId = s.to; }));

        for (const [compId, estado] of Object.entries(copasEstado)) {
            let comp = competicoes.find(c => c.id === compId); if(!comp) continue;
            let campeaoCopaId = estado.campeaoId || estado.confrontos?.[0]?.vencedorId; 
            if(campeaoCopaId) {
                let campeaoClube = clubes.find(c=>c.id===campeaoCopaId);
                campeoesAnoAnterior.copas[compId] = campeaoCopaId;
                if(campeaoClube) {
                    if(!campeaoClube.historicoTitulos) campeaoClube.historicoTitulos = []; campeaoClube.historicoTitulos.unshift(`${anoAtual} - ${comp.nome}`);
                    let elencoCamp = getElencoClube(campeaoClube.id);
                    const bonusTitulo = ["continental", "supercopa_continental", "torneio_intercontinental"].includes(comp.tipo) ? 100 : 30;
                    elencoCamp.forEach(j => { if(j.historicoCarreira?.[0]) j.historicoCarreira[0].trofeus = j.historicoCarreira[0].trofeus === "-" ? comp.nome : j.historicoCarreira[0].trofeus + ", " + comp.nome; j.pontosPremio += bonusTitulo; });
                }
            }
        }

        // Check if all players are ready before advancing season (online mode)
        if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode()) {
            window.firebaseIntegration.canAdvanceToNextSeason().then(canAdvance => {
                if (!canAdvance) {
                    mostrarToast("Aguardando Amigo", "Seu amigo ainda não terminou a temporada atual.", "warning");
                    document.getElementById("btnJogar").disabled = false;
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

    document.getElementById("btnJogar").disabled = false;
    mostrarToast("Ano Novo", `Bem-vindo à Temporada ${anoAtual}!`, "success");
}

function processarFimTemporada() {
    forcarFimDeCopas();

    try {
        let todos = [jogador, ...jogadoresIA.filter(x=>!x.aposentado)].map(p => ({ p: p, g: p.estatisticasAtuais ? p.estatisticasAtuais.gols : (p.statsTemporada?.gols || 0), a: p.estatisticasAtuais ? p.estatisticasAtuais.assistencias : (p.statsTemporada?.assistencias || 0), ovr: p.geral, idade: p.idade, pos: p.posicao }));
        todos.forEach(x => { 
            x.scoreFinal = (x.g * 2.5) + (x.a * 1.5) + (x.ovr * 1.2) + (x.p.pontosPremio || 0);
            const liga = obterClubeJogador(x.p)?.ligaId;
            if(TOP5_LIGAS_EUROPA.includes(liga)) { x.scoreFinal *= 1.55; x.scoreFinal += 18; }
            else if(obterClubeJogador(x.p)?.reputacao >= 85) x.scoreFinal *= 1.12;
            if((x.p.statsSelecao?.gols || 0) + (x.p.statsSelecao?.assistencias || 0) > 8) x.scoreFinal += 6;
            const trofeus = (x.p.historicoCarreira?.[0]?.trofeus || "") + (x.p.titulosSelecao || []).map(t => t.trofeu).join(" ");
            if(/Champions League|UEFA Champions|Libertadores|AFC Champions/i.test(trofeus)) x.scoreFinal += 42;
            else if(/Europa League|Conference League|Copa Libertadores|Sul-Americana/i.test(trofeus)) x.scoreFinal += 22;
            else if(/Premier League|La Liga|Bundesliga|Serie A|Ligue 1|Liga /i.test(trofeus) && !/Champions/i.test(trofeus)) x.scoreFinal += 10;
        });
        let rankingBolaOuro = [...todos].sort((a,b) => b.scoreFinal - a.scoreFinal);

        let bonusUser = 0; if (jogador.estatisticasAtuais.gols + jogador.estatisticasAtuais.assistencias > 20) bonusUser += 2;
        if (jogador.idade < 24) bonusUser += 2; if (jogador.idade > 31) bonusUser -= 2;
        jogador.geral = Math.max(40, Math.min(99, jogador.geral + bonusUser)); 
        jogador.valorMercadoNum = calcularValorMercadoJogador(jogador);
        
        registrarNoticia("Fim de temporada", "A grande janela de transferências vai abrir junto com a nova época.", "Mercado");
        premiarLigasTemporada();
        simularGalaEpica(rankingBolaOuro);
        
    } catch (e) { console.error(e); mostrarToast("Erro", "Falha na Gala.", "danger"); }
}


function simularGalaEpica(ranking) {
    let top1 = ranking[0]; let top2 = ranking[1]; let top3 = ranking[2];
    if (!top1 || !top2 || !top3) { mostrarToast("Gala", "Ainda nao ha jogadores suficientes para a premiacao.", "warning"); return; }

    const porGols = [...ranking].sort((a,b) => b.g - a.g || b.scoreFinal - a.scoreFinal);
    const porAssistencias = [...ranking].sort((a,b) => b.a - a.a || b.scoreFinal - a.scoreFinal);
    const sub21 = ranking.filter(x => x.idade <= 21).sort((a,b) => b.scoreFinal - a.scoreFinal);
    const goleiros = ranking.filter(x => x.pos === "Goleiro").sort((a,b) => b.ovr - a.ovr || b.scoreFinal - a.scoreFinal);

    const premios = [
        { nome: "Chuteira de Ouro", icon: "⚽", candidatos: porGols.slice(0, 3), vencedor: porGols[0], metrica: x => `${x.g} gols na temporada`, pontos: 35 },
        { nome: "Rei das Assistencias", icon: "🎯", candidatos: porAssistencias.slice(0, 3), vencedor: porAssistencias[0], metrica: x => `${x.a} assistencias`, pontos: 30 },
        { nome: "Golden Boy", icon: "⭐", candidatos: sub21.slice(0, 3), vencedor: sub21[0], metrica: x => `${x.idade} anos • OVR ${x.ovr}`, pontos: 25 },
        { nome: "Luva de Ouro", icon: "🧤", candidatos: goleiros.slice(0, 3), vencedor: goleiros[0], metrica: x => `Goleiro • OVR ${x.ovr}`, pontos: 30 },
        { nome: "Bola de Ouro", icon: "🏆", candidatos: [top1, top2, top3], vencedor: top1, metrica: x => `${x.g} gols • ${x.a} ast • OVR ${x.ovr}`, pontos: 80 }
    ].filter(p => p.vencedor && p.candidatos.length > 0);

    premiosIndividuaisPendentes = premios.map(p => ({ nome: p.nome, playerId: p.vencedor.p.id || (p.vencedor.p === jogador ? "player" : ""), pontos: p.pontos }));

    const cardFinalista = (item, rank, id) => `
        <div class="finalista-card" id="${id}" data-rank="#${rank}">
            <img src="${obterUrlImagem(item.p, 'jogador')}" alt="${item.p.nome}">
            <span style="color:${rank === 1 ? '#facc15' : '#a1a1aa'}; font-weight:900; text-transform:uppercase; font-size:0.78rem;">${rank === 1 ? 'Favorito da Noite' : rank + 'o lugar'}</span>
            <h4>${item.p.nome}</h4>
            <div class="finalista-stats"><span>OVR ${item.ovr}</span><span>${item.g} Gols</span><span>${item.a} Ast</span></div>
        </div>`;

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

    const renderCandidatos = (premio, revelar = false) => `
        <div class="gala-premio-palco">
            <h3>${premio.icon} ${premio.nome}</h3>
            <p style="margin:0; color:#a1a1aa; font-weight:700;">${revelar ? 'Vencedor revelado. O teatro veio abaixo.' : 'Os tres favoritos aparecem no telao...'}</p>
            <div class="gala-candidatos-grid">
                ${premio.candidatos.map(c => `
                    <div class="gala-candidato ${revelar && c.p.id === premio.vencedor.p.id ? 'vencedor' : ''}">
                        <img src="${obterUrlImagem(c.p, 'jogador')}" alt="${c.p.nome}">
                        <strong>${revelar && c.p.id === premio.vencedor.p.id ? '👑 ' : ''}${c.p.nome}</strong>
                        <span>${premio.metrica(c)}</span>
                    </div>`).join("")}
            </div>
        </div>`;

    let mB = document.getElementById("modalBolaOuro");
    if(!mB) return;

    mB.innerHTML = `
        <div class="modal-content gala-container-premium">
            <div class="gala-stage">
                <button id="btnPularGala" class="gala-skip-btn">Avancar</button>
                <div class="gala-kicker">Noite de gala mundial</div>
                <h2 class="gala-luxo">Premios da Temporada ${anoAtual}</h2>
                <div class="bola-de-ouro-trofeu" id="trofeuGalaAtual">${renderTrofeu(premios[0]?.nome || 'Bola de Ouro')}</div>
                <p class="gala-subtitle" id="statusGalaText">Os principais nomes do ano estao chegando ao palco.</p>
                <div class="finalistas-grid" id="finalistasBolaOuro" style="display:none;">
                    ${cardFinalista(top3, 3, 'fCard0')}
                    ${cardFinalista(top2, 2, 'fCard1')}
                    ${cardFinalista(top1, 1, 'fCard2')}
                </div>
                <div id="vencedorReveladoCtx" style="min-height:220px;"></div>
            </div>
        </div>`;
    mB.classList.remove("oculto");
    document.getElementById("btnPularGala").onclick = finalizarGala;

    const ctx = () => document.getElementById("vencedorReveladoCtx");
    const status = () => document.getElementById("statusGalaText");

    function mostrarFinalistasBolaOuro() {
        const grid = document.getElementById("finalistasBolaOuro");
        if(grid) grid.style.display = "grid";
        setTimeout(() => { document.getElementById("fCard0")?.classList.add("revelado"); }, 300);
        setTimeout(() => { document.getElementById("fCard1")?.classList.add("revelado"); }, 800);
        setTimeout(() => { document.getElementById("fCard2")?.classList.add("revelado"); }, 1300);
    }

    function revelarPremio(idx) {
        const premio = premios[idx];
        if(!premio) {
            atualizarTrofeu("Bola de Ouro");
            document.getElementById("fCard2")?.classList.add("vencedor");
            if(ctx()) ctx().innerHTML = `
                <h1 class="gala-winner-name">👑 ${top1.p.nome}</h1>
                <p style="margin:0; color:#d4d4d8; font-weight:800;">Bola de Ouro confirmada: ${top1.g} gols, ${top1.a} assistencias e OVR ${top1.ovr}</p>
                <div class="gala-awards-grid">
                    ${premios.map(p => `<div class="gala-award"><img src="${obterUrlImagem(p.nome, 'trofeu')}" alt="${p.nome}"><small>${p.icon} ${p.nome}</small><strong>${p.vencedor.p.nome}</strong><span>${p.metrica(p.vencedor)}</span></div>`).join("")}
                </div>
                <div class="gala-final-actions"><button id="btnFecharGalaNovo" style="padding:15px 40px; background:linear-gradient(90deg, #facc15, #f59e0b); color:#000; border:none; border-radius:12px; font-weight:900; font-size:1.05rem; cursor:pointer; text-transform:uppercase; box-shadow:0 12px 26px rgba(250,204,21,0.22);">Avancar Temporada ➔</button></div>`;
            document.getElementById("btnFecharGalaNovo").onclick = finalizarGala;
            return;
        }

        atualizarTrofeu(premio.nome);
        if(premio.nome === "Bola de Ouro") mostrarFinalistasBolaOuro();
        if(status()) status().innerHTML = `Agora: ${premio.nome}. Quem leva?`;
        if(ctx()) ctx().innerHTML = renderCandidatos(premio, false);
        setTimeout(() => {
            if(status()) status().innerHTML = `${premio.nome}: vencedor revelado!`;
            if(ctx()) ctx().innerHTML = renderCandidatos(premio, true);
            setTimeout(() => revelarPremio(idx + 1), premio.nome === "Bola de Ouro" ? 2400 : 1700);
        }, premio.nome === "Bola de Ouro" ? 2300 : 1600);
    }

    setTimeout(() => revelarPremio(0), 700);
}

// ==========================================
// 🧠 MODO MANAGER
// ==========================================
function estadoManagerPadrao() {
    return { ativo: false, treinador: null, clubeId: null, confianca: 65, tatica: { formacao: "4-3-3", estilo: "pressao", mentalidade: "equilibrado" }, orcamentoTransferencias: 0, folhaSalarial: 0, base: [] };
}

function clubeManagerAtual() {
    return clubes.find(c => c.id === managerEstado.clubeId);
}

function calcularFolhaClube(clubeId) {
    return jogadoresIA.filter(p => p.clubeId === clubeId && !p.aposentado).reduce((acc, p) => acc + Math.max(12000, (p.valorMercadoNum || calcularValorMercadoJogador(p)) * 0.018), 0);
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
        tatica: managerEstado.tatica || { formacao: "4-3-3", estilo: "pressao", mentalidade: "equilibrado" },
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
    if(t.mentalidade === "ofensiva") bonus += 1;
    if(t.mentalidade === "conservadora") bonus += 1;
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
    if(!managerEstado.tatica) managerEstado.tatica = { formacao: "4-3-3", estilo: "pressao", mentalidade: "equilibrado" };
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

window.managerSimularPartida = function() {
    const clube = clubeManagerAtual();
    if(!clube) return;
    const rivais = clubes.filter(c => c.ligaId === clube.ligaId && c.id !== clube.id);
    const rival = rivais[Math.floor(Math.random() * rivais.length)] || clubes.find(c => c.id !== clube.id);
    const forcaA = (clube.reputacao || 70) + bonusTaticoManager() + (managerEstado.confianca - 50) / 10;
    const forcaB = rival?.reputacao || 70;
    const gA = Math.max(0, Math.floor(Math.random() * 3 + (forcaA - forcaB) / 28));
    const gB = Math.max(0, Math.floor(Math.random() * 3 + (forcaB - forcaA) / 28));
    if(gA > gB) managerEstado.confianca = Math.min(100, managerEstado.confianca + 5);
    else if(gA < gB) managerEstado.confianca = Math.max(0, managerEstado.confianca - 7);
    else managerEstado.confianca = Math.max(0, Math.min(100, managerEstado.confianca + 1));
    if(managerEstado.confianca <= 0) {
        registrarNoticia("Demitido", `${managerEstado.treinador?.nome || "O treinador"} perdeu o cargo no ${clube.nome}.`, "Manager");
        managerEstado = estadoManagerPadrao();
        mostrarToast("Diretoria", "Confiança zerada. Procurar novo clube.", "danger");
    } else {
        registrarNoticia("Jogo do manager", `${clube.nome} ${gA} x ${gB} ${rival?.nome || "Rival"} sob o comando de ${managerEstado.treinador?.nome}.`, "Manager");
        mostrarToast("Resultado Manager", `${clube.nome} ${gA} x ${gB} ${rival?.nome || "Rival"}`, gA >= gB ? "success" : "warning");
    }
    window.salvarJogo();
    renderizarManager();
};

function renderizarManager() {
    const el = document.getElementById("view-manager");
    if(!el) return;
    const treinador = managerEstado.treinador || { nome: jogador?.nome ? `Mister ${jogador.nome}` : "Novo Treinador", reputacao: Math.max(45, Math.min(88, Math.round((jogador?.geral || 65) * 0.9))), ataque: 62, defesa: 62, tatica: 62 };
    managerEstado.treinador = treinador;
    if(!managerEstado.ativo || !managerEstado.clubeId) {
        const disponiveis = clubes
            .filter(c => c.reputacao <= treinador.reputacao + 14)
            .sort((a,b) => b.reputacao - a.reputacao)
            .slice(0, 12);
        el.innerHTML = `
            <div class="manager-shell">
                <div class="manager-hero">
                    <div><span class="comp-int-kicker">Carreira de treinador</span><h2>Modo Manager</h2><p>Assuma um clube, controle orçamento, tática, mercado, base e confiança da diretoria.</p></div>
                    <div class="manager-license"><strong>REP ${treinador.reputacao}</strong><span>${treinador.nome}</span></div>
                </div>
                <div class="manager-club-grid">
                    ${disponiveis.map(c => `<button class="manager-club-card" onclick="managerAssumirClube('${c.id}')">
                        <img src="${obterUrlImagem(c, 'clube')}" alt="${c.nome}">
                        <strong>${c.nome}</strong><span>Reputacao ${c.reputacao} • ${competicoes.find(l=>l.id===c.ligaId)?.nome || "Liga"}</span>
                    </button>`).join("")}
                </div>
            </div>`;
        return;
    }

    const clube = clubeManagerAtual();
    const elenco = jogadoresIA.filter(p => p.clubeId === clube?.id && !p.aposentado).sort((a,b) => b.geral - a.geral);
    const mercado = jogadoresIA.filter(p => p.clubeId !== clube?.id && !p.aposentado && p.geral <= (clube?.reputacao || 70) + 12)
        .sort((a,b) => b.geral - a.geral)
        .slice(0, 8);
    managerEstado.folhaSalarial = calcularFolhaClube(clube.id);
    if(!managerEstado.base?.length) managerEstado.base = gerarBaseManager(clube);
    el.innerHTML = `
        <div class="manager-shell">
            <div class="manager-hero">
                <div class="manager-club-title">
                    <img src="${obterUrlImagem(clube, 'clube')}" alt="${clube.nome}">
                    <div><span class="comp-int-kicker">Modo Manager</span><h2>${clube.nome}</h2><p>${objetivoDiretoria(clube)}</p></div>
                </div>
                <div class="manager-actions"><button class="btn btn-primary" onclick="managerSimularPartida()">Simular Jogo</button></div>
            </div>
            <div class="manager-kpis">
                <div><span>Confiança</span><strong>${managerEstado.confianca}%</strong></div>
                <div><span>Orçamento</span><strong>${formatarMoeda(managerEstado.orcamentoTransferencias)}</strong></div>
                <div><span>Folha anual</span><strong>${formatarMoeda(managerEstado.folhaSalarial)}</strong></div>
                <div><span>Reputação</span><strong>${treinador.reputacao}</strong></div>
            </div>
            <div class="manager-grid">
                <section class="manager-panel">
                    <h3>Tática</h3>
                    <div class="manager-controls">
                        <label>Formação<select onchange="managerDefinirTatica('formacao', this.value)"><option ${managerEstado.tatica.formacao==="4-3-3"?"selected":""}>4-3-3</option><option ${managerEstado.tatica.formacao==="4-2-3-1"?"selected":""}>4-2-3-1</option><option ${managerEstado.tatica.formacao==="4-4-2"?"selected":""}>4-4-2</option><option ${managerEstado.tatica.formacao==="5-3-2"?"selected":""}>5-3-2</option></select></label>
                        <label>Estilo<select onchange="managerDefinirTatica('estilo', this.value)"><option value="pressao" ${managerEstado.tatica.estilo==="pressao"?"selected":""}>Pressão</option><option value="posse" ${managerEstado.tatica.estilo==="posse"?"selected":""}>Posse</option><option value="retranca" ${managerEstado.tatica.estilo==="retranca"?"selected":""}>Retranca</option></select></label>
                        <label>Mentalidade<select onchange="managerDefinirTatica('mentalidade', this.value)"><option value="equilibrado" ${managerEstado.tatica.mentalidade==="equilibrado"?"selected":""}>Equilibrado</option><option value="ofensiva" ${managerEstado.tatica.mentalidade==="ofensiva"?"selected":""}>Ofensiva</option><option value="conservadora" ${managerEstado.tatica.mentalidade==="conservadora"?"selected":""}>Conservadora</option></select></label>
                    </div>
                    <div class="manager-mini-note">Bônus tático atual: +${bonusTaticoManager().toFixed(1)} força</div>
                </section>
                <section class="manager-panel">
                    <h3>Elenco</h3>
                    ${elenco.slice(0, 8).map(p => `<div class="manager-row" onclick="abrirPerfilJogador('${p.id}')"><img src="${obterUrlImagem(p,'jogador')}"><span><strong>${p.nome}</strong><small>${p.posicao} • OVR ${p.geral}</small></span><em>${formatarMoeda(p.valorMercadoNum || calcularValorMercadoJogador(p))}</em></div>`).join("") || `<p style="color:#aaa;">Elenco vazio.</p>`}
                </section>
                <section class="manager-panel">
                    <h3>Mercado</h3>
                    ${mercado.map(p => `<div class="manager-row"><img src="${obterUrlImagem(p,'jogador')}"><span><strong>${p.nome}</strong><small>${p.posicao} • OVR ${p.geral}</small></span><button class="btn btn-primary" onclick="managerEnviarProposta('${p.id}')">${formatarMoeda(p.valorMercadoNum || calcularValorMercadoJogador(p))}</button></div>`).join("")}
                </section>
                <section class="manager-panel">
                    <h3>Categoria de Base</h3>
                    ${managerEstado.base.map(p => `<div class="manager-row"><img src="${obterUrlImagem(p,'jogador')}"><span><strong>${p.nome}</strong><small>${p.posicao} • OVR ${p.geral} • POT ${p.potencial}</small></span><button class="btn btn-success" onclick="managerPromoverJovem('${p.id}')">Promover</button></div>`).join("")}
                </section>
            </div>
        </div>`;
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
    normalizarAgendaCalendario();
    let meuClube = clubes.find(c => c.id === jogador.clubeId);
    jogador.valorMercadoNum = calcularValorMercadoJogador(jogador); 
    jogador.valorMercado = formatarMoeda(jogador.valorMercadoNum);
    
    let imgJ = document.getElementById('sidePlayerImg'); if(imgJ) imgJ.src = obterUrlImagem(jogador, 'jogador');
    let imgC = document.getElementById('sideClubeLogo'); if(imgC) imgC.src = meuClube ? obterUrlImagem(meuClube, 'clube') : '';

    setText("sideNome", jogador.nome); setText("sideGeral", jogador.geral); setText("sideClube", meuClube ? meuClube.nome : "Livre"); setText("uiIdade", jogador.idade);
    setText("uiValorMercado", jogador.valorMercado); setText("uiValorMercadoSide", jogador.valorMercado); setText("uiEnergiaTexto", `${Math.floor(jogador.energia)}%`);
    setText("uiStatusSelecao", statusTitularidade());
    setText("estGolsTemp", jogador.estatisticasAtuais.gols); setText("estJogosTemp", jogador.estatisticasAtuais.jogos);
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
            setText("btnJogar", textoAcao); aplicarTemaCompeticao(comp.compConfigId || comp.compId); document.getElementById("btnJogar").disabled = false;
        } else if (!failsafeAtivado) { 
            uiProx.innerHTML = `<div style="font-size:1.2rem; font-weight:700; color:var(--warning);">⏳ Sem jogos marcados. Finais e decisões globais a decorrer...</div>`;
            setText("btnJogar", "Avançar Semana Global ➔"); aplicarTemaCompeticao("hub"); document.getElementById("btnJogar").disabled = false;
        } else {
            uiProx.innerHTML = `<div style="font-size:1.2rem; font-weight:700; color:var(--success);">🏁 A Época terminou! O mundo aguarda a Gala.</div>`;
            setText("btnJogar", "Ir para a Gala Ouro ➔"); aplicarTemaCompeticao("hub"); document.getElementById("btnJogar").disabled = false;
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
    const compsUnicas = Array.from(new Map(competicoes.filter(c => c.tipo === "liga" || c.tipo === "copa" || c.tipo === "supercopa").map(c => [c.id, c])).values());
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
        btnPais.innerHTML = `${logoHTML}<span><span class="pais-label">${pais}</span><span class="pais-sub">${grupo.info.regiao} • ${totalLigas} liga${totalLigas !== 1 ? 's' : ''}${totalCopas ? ` • ${totalCopas} copa${totalCopas !== 1 ? 's' : ''}` : ''}</span></span>`;
        btnPais.dataset.pais = pais;
        btnPais.onclick = () => {
            gridPaises.querySelectorAll(".btn-pais-filtro").forEach(b => b.classList.remove("ativo"));
            btnPais.classList.add("ativo");
            aplicarTemaCompeticao(grupo.competicoes[0]?.id || grupo.info.prefix);
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
        const rotuloTipo = comp.tipo === "liga" ? `${comp.div || 1}a divisao` : (comp.tipo === "supercopa" ? "Supercopa" : "Copa");
        btnDiv.className = `btn-divisao ${idx === 0 ? 'ativo' : ''}`;
        btnDiv.innerHTML = `${comp.nome}<small>${rotuloTipo}</small>`;
        btnDiv.onclick = () => {
            divisoesCtx.querySelectorAll(".btn-divisao").forEach(b => b.classList.remove("ativo"));
            btnDiv.classList.add("ativo");
            aplicarTemaCompeticao(comp.id);
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

function exibirCompeticaoEliminatoriaCodigo(compId, containerTarget) {
    aplicarTemaCompeticao(compId);
    let compInfo = competicoes.find(c => c.id === compId);
    let estado = copasEstado[compId];
    let tipoLabel = compInfo?.tipo === "supercopa" ? "Supercopa nacional" : (compInfo?.tipo === "supercopa_continental" ? "Supercopa continental" : (compInfo?.tipo === "torneio_intercontinental" ? "Intercontinental" : "Copa nacional"));
    let html = `<div class="liga-header-card"><div class="liga-title-wrap"><div class="liga-logo-frame"><img src="${obterUrlImagem(compInfo || compId, 'competicao')}" alt="${compInfo?.nome || 'Competicao'}"></div><div><span>${tipoLabel}</span><h2>${compInfo?.nome || 'Competicao'}</h2></div></div><div class="meta-pill">Mata-mata</div></div>`;
    if(!estado) {
        containerTarget.innerHTML = `<div class="comp-detail-grid"><div>${html}<div style="width:100%; text-align:center; padding:34px; color:#aaa; font-size:1.05rem; background:rgba(0,0,0,0.28); border:1px solid rgba(255,255,255,0.1); border-radius:14px;">Sorteio ainda nao realizado.</div></div>${montarRankingCompeticao(compId)}</div>`;
        return;
    }
    html += `<div class="bracket-container">`;
    if(estado.historicoFases && estado.historicoFases.length > 0) estado.historicoFases.slice(-2).forEach(hf => { html += renderBlocoFase(hf); });
    html += renderBlocoFase(estado);
    html += `</div>`;
    containerTarget.innerHTML = `<div class="comp-detail-grid"><div>${html}</div>${montarRankingCompeticao(compId)}</div>`;
}
function exibirTabelaLigaCodigo(ligaId, containerTarget) {
    aplicarTemaCompeticao(ligaId);
    let dadosTabela = tabelasLigas[ligaId]; let compInfo = competicoes.find(c => c.id === ligaId);
    if (!dadosTabela || !compInfo) { containerTarget.innerHTML = "<p style='color:#aaa;'>Nenhum dado para esta liga.</p>"; return; }

    let html = `
        <div class="liga-header-card"><div class="liga-title-wrap"><div class="liga-logo-frame"><img src="${obterUrlImagem(compInfo, 'competicao')}" alt="${compInfo.nome}"></div><div><span>Classificacao atual</span><h2>${compInfo.nome}</h2></div></div><div class="meta-pill">${dadosTabela.length} clubes</div></div>
        <table class="tabela-classificacao grupo-table" style="width:100%; border-collapse:collapse; text-align:left;">
            <thead><tr><th>Pos</th><th>Clube</th><th>Pts</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GM</th><th>GS</th><th>SG</th></tr></thead>
            <tbody>
    `;

    let tabOrd = [...dadosTabela].sort((a,b) => b.pontos - a.pontos || ((b.gols||0) - (b.golsSofridos||0)) - ((a.gols||0) - (a.golsSofridos||0)) || (b.gols||0) - (a.gols||0));
    tabOrd.forEach((item, index) => {
        let clb = clubes.find(c => c.id === item.id);
        let bgL = jogador && clb?.id === jogador.clubeId ? "rgba(0, 255, 136, 0.15)" : (index % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent");
        html += `
            <tr style="background:${bgL}; cursor:pointer;" onclick="abrirPerfilClube('${item.id}')">
                <td style="font-weight:bold;">${index + 1}º</td>
                <td style="display:flex; align-items:center; font-weight:bold; color:${jogador && clb?.id === jogador.clubeId ? 'var(--theme-primary)' : '#fff'};">
                    <div style="width:30px; height:30px; display:flex; align-items:center; justify-content:center; margin-right:15px;">
                        <img src="${obterUrlImagem(clb, 'clube')}" style="max-width:100%; max-height:100%; object-fit:contain;">
                    </div>
                    ${clb ? clb.nome : 'Clube'}
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
    
    html += `<div class="bracket-container">`;
    if(estado.historicoFases && estado.historicoFases.length > 0) {
        let ultimasFases = estado.historicoFases.slice(-2);
        ultimasFases.forEach(hf => { html += renderBlocoFase(hf); });
    }
    html += renderBlocoFase(estado);
    html += `</div>`;
    return `<div class="comp-detail-grid"><div>${html}</div>${montarRankingCompeticao(copaSelecionada)}</div>`;
}

function renderBlocoFase(faseObj) {
    let html = ``;
    if(faseObj.tipo === "grupos") {
        let gridGrupos = `<div class="grupo-grid">`;
        faseObj.grupos.forEach(grp => {
            let tOrd = [...grp.equipas].sort((a,b) => b.pts - a.pts || (b.gf-b.gs) - (a.gf-a.gs));
            gridGrupos += `<div style="background:rgba(0,0,0,0.7); border:1px solid #444; border-radius:12px; padding:15px; width:100%;">
                <h3 style="color:var(--theme-primary); margin:0 0 15px 0; font-size:1.1rem; text-transform:uppercase;">${grp.nome}</h3>
                <table class="grupo-table" style="width:100%; border-collapse:collapse; font-size:0.9rem;">
                    <tr><th>Clube</th><th>Pts</th><th>J</th><th>SG</th></tr>
                    ${tOrd.map((e,i) => {
                        let c = clubes.find(x=>x.id===e.id);
                        return `<tr style="${c?.id===jogador.clubeId?'font-weight:bold; background:rgba(0,255,136,0.15); color:var(--theme-primary);':''} cursor:pointer;" onclick="abrirPerfilClube('${c?.id}')">
                            <td style="display:flex;align-items:center;">
                                <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center; margin-right:10px;">
                                    <img src="${obterUrlImagem(c,'clube')}" style="max-width:100%; max-height:100%; object-fit:contain;">
                                </div>
                                ${c?.nome}
                            </td>
                            <td><strong>${e.pts}</strong></td><td>${e.j}</td><td>${e.gf-e.gs}</td></tr>`;
                    }).join("")}
                </table></div>`;
        });
        html += `<div class="fase-bloco"><h4 class="bracket-title">${faseObj.fase}</h4>` + gridGrupos + `</div>`;
    } else if (faseObj.tipo === "mata-mata" && faseObj.confrontos) {
        const cards = faseObj.confrontos.map(conf => {
            const isMeuJogo = conf.timeA.id === jogador.clubeId || conf.timeB.id === jogador.clubeId;
            const pen = conf.penaltis ? `<span class="penalty-badge">Pênaltis</span>` : "";
            const duasPartidas = conf.golsAIda !== null || conf.golsAVolta !== null;
            if(duasPartidas) {
                const ida = conf.golsAIda !== null ? `${conf.golsAIda}-${conf.golsBIda}` : "—";
                const volta = conf.golsAVolta !== null ? `${conf.golsAVolta}-${conf.golsBVolta}` : "—";
                const aggA = (conf.golsAIda||0)+(conf.golsAVolta||0), aggB = (conf.golsBIda||0)+(conf.golsBVolta||0);
                const sc = conf.vencedorId ? `Agregado ${aggA}-${aggB}` : `Ida ${ida} • Volta ${volta}`;
                return `<div class="knockout-card ${isMeuJogo?'meu-jogo':''}">
                    <div class="knockout-team ${conf.vencedorId===conf.timeA.id?'winner':''}" onclick="abrirPerfilClube('${conf.timeA.id}')"><img src="${obterUrlImagem(conf.timeA,'clube')}">${conf.timeA.nome}</div>
                    <div class="knockout-score">${sc}${pen}</div>
                    <div class="knockout-team ${conf.vencedorId===conf.timeB.id?'winner':''}" onclick="abrirPerfilClube('${conf.timeB.id}')"><img src="${obterUrlImagem(conf.timeB,'clube')}">${conf.timeB.nome}</div>
                </div>`;
            }
            const sc = conf.golsA !== null && conf.golsA !== undefined ? `${conf.golsA} - ${conf.golsB}` : (conf.golsAIda !== null ? `${conf.golsAIda} - ${conf.golsBIda}` : "A definir");
            return `<div class="knockout-card ${isMeuJogo?'meu-jogo':''}">
                <div class="knockout-team ${conf.vencedorId===conf.timeA.id?'winner':''}" onclick="abrirPerfilClube('${conf.timeA.id}')"><img src="${obterUrlImagem(conf.timeA,'clube')}">${conf.timeA.nome}</div>
                <div class="knockout-score">${sc}${pen}</div>
                <div class="knockout-team ${conf.vencedorId===conf.timeB.id?'winner':''}" onclick="abrirPerfilClube('${conf.timeB.id}')"><img src="${obterUrlImagem(conf.timeB,'clube')}">${conf.timeB.nome}</div>
            </div>`;
        }).join("");
        html += `<div class="fase-bloco bracket-phase"><h4 class="bracket-title">${faseObj.fase}</h4><div class="knockout-grid">${cards}</div></div>`;
    }
    return html;
}

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
    else if (abaAtivaId === "view-pesquisa-sel") { if (typeof renderizarPesquisaSelecoes === 'function') renderizarPesquisaSelecoes(); }
    else if (abaAtivaId === "view-manager") { if (typeof renderizarManager === 'function') renderizarManager(); }
    else if (abaAtivaId === "view-lifestyle") { if (typeof renderLifestyleSystem === 'function') renderLifestyleSystem(); }
    else if (abaAtivaId === "view-noticias") { if (typeof renderizarNoticias === 'function') renderizarNoticias(); }
}

document.addEventListener("click", function(event) {
    const btn = event.target.closest(".menu-item");
    if (btn) {
        document.querySelectorAll(".menu-item").forEach(item => item.classList.remove("ativo")); btn.classList.add("ativo");
        document.querySelectorAll(".view-section").forEach(aba => { aba.classList.add("oculto"); aba.style.display = "none"; });
        const elDest = document.getElementById(btn.dataset.view);
        if (elDest) { elDest.classList.remove("oculto"); elDest.style.display = "block"; atualizarConteudoAbaAtiva(); }
    }
});
document.addEventListener("change", function(event) {
    if (event.target.tagName.toLowerCase() === "select") { if (typeof atualizarConteudoAbaAtiva === 'function') atualizarConteudoAbaAtiva(); }
});

// ==========================================
// ⚙️ INÍCIO, PARTIDAS E BOTÕES MESTRES
// ==========================================
document.getElementById("btnJogar")?.addEventListener("click", () => {
    // Check if we're on the main menu (telaModoSelecao) or in-game hub
    const telaModoSelecao = document.getElementById("telaModoSelecao");
    if (!telaModoSelecao.classList.contains("oculto")) {
        // Main menu - redirect to mode selection
        mudarTela("telaModo");
        return;
    }
    
    // In-game hub - proceed with match simulation
    inicializarEstadoCarreiraJogador();
    let comp = agendaTemporada[rodadaAtual - 1];
    let textoBtn = document.getElementById("btnJogar").innerText.toLowerCase();

    // Check if in online room mode and handle ready state
    if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode() && window.firebaseIntegration.getRoomId()) {
        if (textoBtn.includes("gala")) {
            processarFimTemporada();
            return;
        }

        if (!textoBtn.includes("avançar semana") && comp) {
            // Set ready for match and wait for room sync
            window.firebaseIntegration.setReadyForMatch(true);
            mostrarToast("Sala Online", "Aguardando amigo para simular partida...", "info");
            document.getElementById("btnJogar").disabled = true;
            document.getElementById("btnJogar").innerText = "Aguardando...";
            return;
        }
    }

    if (textoBtn.includes("avançar semana")) {
        simularRodadaMundial(); rodadaAtual++; window.salvarJogo(); atualizarHub();
        mostrarToast("Simulação", "Semana global avançada com sucesso.", "info");
        return;
    } else if (textoBtn.includes("gala")) {
        processarFimTemporada();
        return;
    }
    if(!comp) return;

    if(jogador.lesaoRodadas > 0) {
        mostrarToast("Departamento Médico", `Estás lesionado por ${jogador.lesaoRodadas} semana(s). A equipa jogou sem ti.`, "warning");
        simularRodadaMundial(); rodadaAtual++; window.salvarJogo(); atualizarHub();
        return;
    }

    const isSel = !!comp.isSelecao;
    const mandanteId = isSel ? (comp.mandanteId || jogador.selecaoId) : jogador.clubeId;
    const visitanteId = comp.adversarioId;
    const advPre = isSel ? SELECOES.find(s => s.id === visitanteId) : clubes.find(c => c.id === visitanteId);
    if(Math.random() < 0.28) abrirEntrevista("pre", { adversario: advPre?.nome || "o adversário" });

    let mP = document.getElementById("modalPartida"); if(mP) mP.classList.remove("oculto");
    let engine = new MatchEngine(jogador, mandanteId, visitanteId);
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
    setText("uiConsolePartida", "<div style='color:#00ff88; text-align:center;'>⚽ O árbitro apita para o início do jogo!</div>");

    engine.simularPartidaAoVivo((min, gc, gv, log) => {
        setText("uiMinutoJogo", `${min}'`); setText("placarMarcadorCasa", gc); setText("placarMarcadorVisita", gv);
        if(log) {
            let c = document.getElementById("uiConsolePartida");
            if(c){
                const meuGol = log.includes("É SEU") || log.includes(jogador.nome);
                const golTime = !meuGol && (log.includes("GOLO") || log.includes("GOL"));
                c.innerHTML += `<div class="${meuGol ? "gol-meu" : (golTime ? "gol-time" : "")}">${meuGol ? "⭐ " : ""}${log}</div>`;
                c.scrollTop = c.scrollHeight;
            }
        }
    }, (gc, gv) => {
        const vindoDoBanco = jogador.titularidade < 68;
        jogador.energia = Math.max(0, jogador.energia - (vindoDoBanco ? 15 : 25));
        const meuTimeId = isSel ? jogador.selecaoId : jogador.clubeId;
        const souMandante = engine.clubeMandanteId === meuTimeId;
        let pGolo = ({ "Atacante":0.65, "Ponta":0.48, "Meia Ofensivo":0.34, "Meio-Campista":0.22, "Volante":0.10, "Lateral":0.08, "Zagueiro":0.05, "Goleiro":0.01 })[jogador.posicao] ?? 0.25;
        let pAssist = ({ "Atacante":0.25, "Ponta":0.42, "Meia Ofensivo":0.58, "Meio-Campista":0.50, "Volante":0.26, "Lateral":0.32, "Zagueiro":0.08, "Goleiro":0.02 })[jogador.posicao] ?? 0.25;
        if(jogador.geral >= 84 && ["Atacante","Ponta","Meia Ofensivo"].includes(jogador.posicao)) pGolo += 0.10;
        if(jogador.geral >= 84 && ["Ponta","Meia Ofensivo","Meio-Campista"].includes(jogador.posicao)) pAssist += 0.10;

        let golosAAtribuir = souMandante ? gc : gv;
        if(vindoDoBanco) golosAAtribuir = Math.max(0, Math.floor(golosAAtribuir * 0.55));
        let golsJogadorPartida = 0; let assistsJogadorPartida = 0;

        // Track stats separately for club vs international
        if(!isSel) {
            jogador.estatisticasAtuais.jogos++;
            if(!jogador.estatisticasAtuais.assistencias) jogador.estatisticasAtuais.assistencias = 0;
            if(golosAAtribuir > 0) { for(let i=0; i<golosAAtribuir; i++) { if(Math.random() < pGolo) { jogador.estatisticasAtuais.gols++; golsJogadorPartida++; } else if(Math.random() < pAssist) { jogador.estatisticasAtuais.assistencias++; assistsJogadorPartida++; } } }
            registrarEstatisticaCompeticao(jogador, comp.compId, 1, golsJogadorPartida, assistsJogadorPartida);
        } else {
            // International stats tracking
            if(!jogador.statsSelecao) jogador.statsSelecao = { jogos: 0, gols: 0, assistencias: 0 };
            jogador.statsSelecao.jogos++;
            if(golosAAtribuir > 0) {
                for(let i=0; i<golosAAtribuir; i++) {
                    if(Math.random() < pGolo) { jogador.statsSelecao.gols++; golsJogadorPartida++; }
                    else if(Math.random() < pAssist) { jogador.statsSelecao.assistencias++; assistsJogadorPartida++; }
                }
            }
        }

        registrarMelhorAtuacao(golsJogadorPartida, assistsJogadorPartida, advPre?.nome || comp.adversarioId);
        if(golsJogadorPartida > 0) registrarNoticia(isSel ? "Destaque na seleção" : "Protagonista da partida", `${jogador.nome} marcou ${golsJogadorPartida} gol(s)${isSel ? " pela seleção" : " e saiu em destaque no relato ao vivo"}.`, isSel ? "Seleção" : "Partida");
        else if(assistsJogadorPartida > 0) registrarNoticia("Grande atuação", `${jogador.nome} deu ${assistsJogadorPartida} assistência(s)${isSel ? " pela seleção" : " e foi um dos destaques do jogo"}.`, isSel ? "Seleção" : "Partida");

        let msgBtn = document.getElementById("btnFecharModalPartida");
        if(msgBtn) {
            msgBtn.classList.remove("oculto");
            msgBtn.onclick = () => {
                msgBtn.classList.add("oculto"); if(mP) mP.classList.add("oculto");
                resolverLogicaPosPartida(comp, gc, gv, golsJogadorPartida, assistsJogadorPartida);
                let participouBem = golosAAtribuir > 0 || ((souMandante ? gc : gv) > (souMandante ? gv : gc));
                if(!isSel) ajustarTitularidade(participouBem ? (vindoDoBanco ? 7 : 4) : -3);
                jogador.moral = Math.max(0, Math.min(100, jogador.moral + (participouBem ? 4 : -3)));
                if(Math.random() < 0.38) abrirEntrevista("pos", { placar: `${gc}-${gv}` });
                simularRodadaMundial(); rodadaAtual++; window.salvarJogo(); atualizarHub();

                // Reset ready state after match
                if (window.firebaseIntegration && window.firebaseIntegration.isOnlineMode() && window.firebaseIntegration.getRoomId()) {
                    window.firebaseIntegration.setReadyForMatch(false);
                }
            };
        }
    });
});

document.getElementById("btnDescansar")?.addEventListener("click", () => {
    inicializarEstadoCarreiraJogador();
    let comp = agendaTemporada[rodadaAtual - 1]; 
    let textoBtn = document.getElementById("btnJogar").innerText.toLowerCase();
    
    if (textoBtn.includes("avançar semana")) { simularRodadaMundial(); rodadaAtual++; window.salvarJogo(); atualizarHub(); return; }
    if (textoBtn.includes("gala")) { processarFimTemporada(); return; }
    if (!comp) return;

    jogador.energia = Math.min(100, jogador.energia + 40); 
    if(jogador.lesaoRodadas > 0) jogador.lesaoRodadas = Math.max(0, jogador.lesaoRodadas - 1);
    else ajustarTitularidade(-2);
    let cCasa = clubes.find(c => c.id === jogador.clubeId); let cVisita = clubes.find(c => c.id === comp.adversarioId);
    let diff = ((cCasa?.reputacao || 60) - (cVisita?.reputacao || 60)) / 20; 
    let pCasa = Math.random() + diff + 0.15; let pVisita = Math.random() - diff;
    let gc = pCasa > 0.5 ? (pCasa > 1.2 ? 3 : (pCasa > 0.8 ? 2 : 1)) : 0; let gv = pVisita > 0.6 ? (pVisita > 1.2 ? 3 : (pVisita > 0.9 ? 2 : 1)) : 0;
    
    resolverLogicaPosPartida(comp, gc, gv);
    simularRodadaMundial(); 
    rodadaAtual++; 
    window.salvarJogo(); 
    atualizarHub();
    mostrarToast("Descanso", "A tua equipa jogou sem ti. Foste poupado esta rodada!", "info");
});

document.getElementById("btnTreinar")?.addEventListener("click", () => {
    inicializarEstadoCarreiraJogador();
    if(jogador.lesaoRodadas > 0) {
        mostrarToast("Treino bloqueado", "Estás lesionado. Usa descanso para recuperar.", "warning");
        return;
    }
    let ganho = 18 + Math.floor(Math.random() * 18);
    jogador.xpAtual = (jogador.xpAtual || 0) + ganho;
    jogador.energia = Math.max(10, jogador.energia - 18);
    jogador.felicidade = Math.min(100, (jogador.felicidade || 60) + 2);
    if(Math.random() < 0.35) jogador.inteligencia = Math.min(99, (jogador.inteligencia || 60) + 1);
    ajustarTitularidade(4);
    if(jogador.xpAtual >= (jogador.xpNecessario || 100)) {
        jogador.xpAtual -= (jogador.xpNecessario || 100);
        jogador.xpNecessario = Math.floor((jogador.xpNecessario || 100) * 1.18);
        jogador.geral = Math.min(99, jogador.geral + 1);
        registrarNoticia("Evolução nos treinos", `${jogador.nome} subiu para OVR ${jogador.geral} após uma sequência forte de trabalho.`, "Treino");
        mostrarToast("Evolução", `OVR subiu para ${jogador.geral}!`, "success");
    } else {
        mostrarToast("Treino", `Ganhaste ${ganho} XP e pontos na briga por titularidade.`, "info");
    }
    window.salvarJogo();
    atualizarHub();
});

function resolverLogicaPosPartida(comp, gc, gv, golsJogador = 0, assistsJogador = 0) {
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
                        const res = resolverVencedorMataMata(conf.timeA.id, conf.timeB.id, isTimeA ? gc : gv, isTimeA ? gv : gc, fA, fB);
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
                    const res = resolverVencedorMataMata(conf.timeA.id, conf.timeB.id, aggA, aggB, fA, fB);
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

document.getElementById("btnLeaveLobby")?.addEventListener("click", () => {
    if (window.firebaseIntegration) {
        if (confirm("Tem certeza que deseja sair do lobby? Isso desconectará você do Universo Compartilhado.")) {
            window.firebaseIntegration.leaveLobby();
            mudarTela("view-hub");
        }
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
        salary: 50000,
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
                defending: 0
            },
            lifestyle: {
                personalTrainer: false,
                nutritionist: false,
                sportsPsychologist: false,
                luxuryApartment: false,
                sportsCar: false,
                privateJet: false,
                brandEndorsements: 0,
                charityFoundation: false
            }
        },
        multipliers: {
            xpMultiplier: 1.0,
            fanBaseMultiplier: 1.0,
            energyRecoveryMultiplier: 1.0,
            salaryMultiplier: 1.0
        }
    };
    
    selecoesEstado = { convocacoes: [], ultimaChave: "", campeoes: {}, ranking: {}, nationsDiv: {}, torneios: {}, planteisTorneio: {}, premiosLigaAno: {}, vagasTorneio: {} };
    preencherLigasVazias(); inicializarTabelas(); inicializarOrcamentosEContratos(); inicializarCopasNacionaisEContinentais(); gerarAgenda(); preencherDropdowns(); atualizarOVRClubes(); 
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
    }
    
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
    const skills = [
        { id: 'freeKicks', name: 'Faltas', icon: '⚽', cost: 3 },
        { id: 'penalties', name: 'Penáltis', icon: '🎯', cost: 3 },
        { id: 'stamina', name: 'Resistência', icon: '⚡', cost: 4 },
        { id: 'heading', name: 'Cabeceamento', icon: '🏆', cost: 3 },
        { id: 'dribbling', name: 'Drible', icon: '🎨', cost: 4 },
        { id: 'passing', name: 'Passe', icon: '📡', cost: 3 },
        { id: 'shooting', name: 'Finalização', icon: '🔥', cost: 4 },
        { id: 'defending', name: 'Defesa', icon: '🛡️', cost: 3 }
    ];
    
    return skills.map(skill => {
        const level = jogador.lifestyle.upgrades.training[skill.id];
        const canAfford = jogador.lifestyle.trainingPoints >= skill.cost;
        
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
        { id: 'charityFoundation', name: 'Fundação de Caridade', icon: '❤️', cost: 300000, benefits: ['+25% Base de Fãs'] }
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
    
    const baseSalary = 50000;
    jogador.lifestyle.salary = Math.floor(baseSalary * jogador.lifestyle.multipliers.salaryMultiplier);
};

window.applyEnergyRecovery = function(baseRecovery) {
    if (!jogador.lifestyle) return baseRecovery;
    
    return Math.floor(baseRecovery * jogador.lifestyle.multipliers.energyRecoveryMultiplier);
};

function recalcularGeral() {
    const stats = [
        jogador.finalizacao || 60,
        jogador.passe || 60,
        jogador.drible || 60,
        jogador.defesa || 60,
        jogador.resistencia || 60,
        jogador.cabeceamento || 60,
        jogador.velocidade || 60,
        jogador.forca || 60
    ];
    
    jogador.geral = Math.floor(stats.reduce((a, b) => a + b, 0) / stats.length);
}

window.assinarPrimeiroClube = function(clubeId) {
    jogador.clubeId = clubeId;
    jogador.contrato = 3;
    reconstruirAgendaAposTrocaClube();
    delete jogador.propostasPrimeiroClube;
    let cD = clubes.find(c => c.id === jogador.clubeId);
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

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

aplicarHistoricosReaisIniciais();

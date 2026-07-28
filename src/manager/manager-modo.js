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

        // Add right-click context menu
        item.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.abrirMenuContextoJogador(e, player.id);
        });

        // Add click to open profile
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            abrirPerfilJogador(player.id);
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
                token.style.cursor = "pointer";

                // Allow repositioning on pitch
                token.addEventListener("dragstart", (e) => {
                    e.dataTransfer.setData("text/plain", player.id);
                    e.dataTransfer.effectAllowed = "move";
                });

                // Add right-click context menu
                token.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.abrirMenuContextoJogador(e, player.id);
                });

                // Add click to open profile
                token.addEventListener("click", (e) => {
                    e.stopPropagation();
                    abrirPerfilJogador(player.id);
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

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

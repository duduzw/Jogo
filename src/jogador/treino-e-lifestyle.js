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

document.getElementById("btnEntrarNoJogo")?.addEventListener("click", () => {
    // Direciona cada carreira para sua porta de entrada: Hub compartilhado no
    // jogador e a seleção/central do clube no Manager.
    configurarNavegacaoPorModo();
    window.salvarJogo();
    if (window.gameMode === "manager") {
        mudarTela("view-hub");
        document.querySelector('.menu-item[data-view="view-manager"]')?.click();
        return;
    }
    atualizarHub(); mudarTela("view-hub");
    let homeV = document.getElementById("view-home");
    if(homeV) { homeV.classList.remove("oculto"); homeV.style.display="block"; }
});

// ==========================================
// GAME INITIALIZATION WITH SESSION PERSISTENCE
// ==========================================

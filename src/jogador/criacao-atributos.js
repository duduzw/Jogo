const PERFIS_GERACAO_INICIAL = {
    "Goleiro":       { principais: ["reflexos", "reposicao", "jogoAereo"], secundarios: ["forca", "velocidade"], fracos: ["drible", "passe"] },
    "Zagueiro":      { principais: ["defesa", "forca", "cabeceamento"], secundarios: ["passe", "resistencia"], fracos: ["finalizacao", "drible"] },
    "Lateral":       { principais: ["velocidade", "resistencia", "defesa"], secundarios: ["passe", "drible"], fracos: ["finalizacao", "cabeceamento"] },
    "Volante":       { principais: ["defesa", "passe", "resistencia"], secundarios: ["forca", "drible"], fracos: ["finalizacao", "velocidade"] },
    "Meio-Campista": { principais: ["passe", "drible", "resistencia"], secundarios: ["finalizacao", "velocidade"], fracos: ["defesa", "forca"] },
    "Meia Ofensivo": { principais: ["passe", "drible", "finalizacao"], secundarios: ["velocidade", "resistencia"], fracos: ["defesa", "forca"] },
    "Ponta":         { principais: ["velocidade", "drible", "finalizacao"], secundarios: ["passe", "resistencia"], fracos: ["defesa", "forca"] },
    "Atacante":      { principais: ["finalizacao", "velocidade", "cabeceamento"], secundarios: ["drible", "forca"], fracos: ["defesa", "passe"] }
};
const CAMPOS_ATRIBUTOS_GOLEIRO = ["reflexos", "reposicao", "jogoAereo", "velocidade", "resistencia", "forca", "passe", "drible"];
const CAMPOS_ATRIBUTOS_LINHA = ["finalizacao", "velocidade", "passe", "defesa", "cabeceamento", "drible", "resistencia", "forca", "inteligencia"];
const NOMES_ATRIBUTOS = { finalizacao: "Finalização", velocidade: "Velocidade", passe: "Passe", defesa: "Defesa", cabeceamento: "Cabeceamento", drible: "Drible", resistencia: "Resistência", forca: "Força", inteligencia: "Inteligência", reflexos: "Reflexos", reposicao: "Reposição", jogoAereo: "Jogo aéreo" };

// 🎯 Classifica um valor de atributo (escala 1-99, igual ao resto do jogo)
// em fraco/médio/forte, só pra colorir o preview — não afeta nenhum cálculo.
function classeForcaAtributo(valor) {
    if (valor >= 66) return "forte";
    if (valor >= 50) return "medio";
    return "fraco";
}

function gerarAtributosIniciaisPorPosicao(posicao) {
    const perfil = PERFIS_GERACAO_INICIAL[posicao] || PERFIS_GERACAO_INICIAL["Meio-Campista"];
    const campos = posicao === "Goleiro" ? CAMPOS_ATRIBUTOS_GOLEIRO : CAMPOS_ATRIBUTOS_LINHA;
    const atributos = {};
    campos.forEach(campo => {
        let faixa;
        if (perfil.principais.includes(campo)) faixa = [66, 80];
        else if (perfil.fracos.includes(campo)) faixa = [26, 40];
        else if (perfil.secundarios.includes(campo)) faixa = [50, 64];
        else faixa = [44, 56];
        atributos[campo] = Math.round(faixa[0] + Math.random() * (faixa[1] - faixa[0]));
    });
    return atributos;
}

// 🖼️ Desenha o grid de atributos já gerados (somente leitura) — guarda o
// resultado em window._atributosIniciaisGerados pra "Assinar Primeiro
// Contrato" aplicar exatamente o que está na tela, e pro botão de "Gerar
// Novamente" poder sortear de novo sem perder a posição escolhida.
function renderAtributosIniciaisGerados(posicao) {
    const perfil = PERFIS_GERACAO_INICIAL[posicao] || PERFIS_GERACAO_INICIAL["Meio-Campista"];
    const atributos = gerarAtributosIniciaisPorPosicao(posicao);
    window._atributosIniciaisGerados = atributos;
    const grid = document.getElementById("gridAtributosIniciaisGerados");
    if (!grid) return;
    grid.innerHTML = Object.entries(atributos).map(([campo, valor]) => {
        const ehPrincipal = perfil.principais.includes(campo);
        return `<label class="linha-atributo-inicial" style="font-size:.78rem;">${ehPrincipal ? "⭐ " : ""}${NOMES_ATRIBUTOS[campo] || campo}<span class="atributo-final ${classeForcaAtributo(valor)}" style="margin-left:auto; font-weight:800;">${valor}</span></label>`;
    }).join("");
}

document.getElementById("btnGerarNovamenteAtributos")?.addEventListener("click", () => {
    const posicaoEscolhida = document.getElementById("selectPosicao")?.value || "Atacante";
    renderAtributosIniciaisGerados(posicaoEscolhida);
});

document.getElementById("btnIniciarCarreira")?.addEventListener("click", () => {
    // Passo 1: só nome, nacionalidade e posição. Os atributos já nascem
    // sorteados automaticamente pra posição escolhida na tela seguinte.
    const nomeInformado = document.getElementById("inputNome")?.value?.trim();
    if (!nomeInformado) {
        mostrarToast("Criação de jogador", "Digite o teu nome antes de continuar.", "warning");
        return;
    }
    const posicaoEscolhida = document.getElementById("selectPosicao")?.value || "Atacante";
    const resumo = document.getElementById("resumoNomeAtributos");
    if (resumo) resumo.textContent = `${nomeInformado} (${posicaoEscolhida})`;
    renderAtributosIniciaisGerados(posicaoEscolhida);
    mudarTela("telaAtributosIniciais");
});

document.getElementById("btnVoltarCriacao")?.addEventListener("click", () => mudarTela("telaCriacao"));

document.getElementById("btnConfirmarAtributosIniciais")?.addEventListener("click", () => {
    const atributosGerados = window._atributosIniciaisGerados;
    if (!atributosGerados) {
        mostrarToast("Atributos iniciais", "Gera os atributos antes de continuar.", "warning");
        return;
    }
    jogador = JSON.parse(JSON.stringify(jogadorModelo));
    window.jogador = jogador; // 🛡️ FIX: mantém window.jogador (usado pelo firebase-integration.js) na mesma referência
    jogador.nome = document.getElementById("inputNome")?.value || "Craque";
    jogador.nacionalidade = document.getElementById("selectNacionalidade")?.value || "Brasil"; 
    jogador.posicao = document.getElementById("selectPosicao")?.value || "Atacante";
    inicializarEstadoCarreiraJogador();
    // 🎯 Aplica os atributos gerados automaticamente pra posição (substituindo
    // por completo o "molde" genérico do jogadorModelo) — o mesmo conjunto
    // exato que foi mostrado na tela de preview, pra não haver divergência
    // entre o que o jogador viu e o que realmente entrou em jogo.
    Object.entries(atributosGerados).forEach(([atributo, valor]) => {
        jogador[atributo] = valor;
    });
    jogador.geral = calcularGeralDeAtributos(jogador);
    // 🆕 NÍVEL / XP: cada nível ganho concede 1 ponto de treino pra investir
    // num atributo real (ver janela de treino). Substitui o sistema antigo
    // de "treino genérico" que só subia tudo igual sem escolha nenhuma.
    jogador.nivel = 1;
    jogador.xp = 0;
    jogador.xpProximoNivel = 100;
    jogador.pontosTreino = 0;
    normalizarElencosEPosicoes();
    garantirTreinadoresIniciais();
    
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
            ${propostasIniciais.map(c => `<button class="btn btn-primary btn-block" onclick="assinarPrimeiroClube('${c.id}')" style="display:flex; align-items:center; justify-content:center; gap:10px;"><img loading="lazy" decoding="async" src="${obterUrlImagem(c,'clube')}" style="width:28px;height:28px;object-fit:contain;background:#fff;border-radius:6px;padding:2px;">${c.nome} • OVR ${c.reputacao}</button>`).join("")}
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

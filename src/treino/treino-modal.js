const TREINOS_DISPONIVEIS_LINHA = [
    { atributo: "finalizacao", nome: "Finalização", icone: "🎯" },
    { atributo: "velocidade", nome: "Velocidade", icone: "⚡" },
    { atributo: "passe", nome: "Passe", icone: "📐" },
    { atributo: "defesa", nome: "Defesa", icone: "🛡️" },
    { atributo: "cabeceamento", nome: "Cabeceamento", icone: "🗣️" },
    { atributo: "drible", nome: "Drible", icone: "🌀" },
    { atributo: "resistencia", nome: "Resistência", icone: "🫁" },
    { atributo: "forca", nome: "Força", icone: "💪" },
    { atributo: "inteligencia", nome: "Inteligência", icone: "🧠" }
];
const TREINOS_DISPONIVEIS_GOLEIRO = [
    { atributo: "reflexos", nome: "Reflexos", icone: "🧤" },
    { atributo: "reposicao", nome: "Reposição", icone: "🎯" },
    { atributo: "jogoAereo", nome: "Jogo Aéreo", icone: "🗣️" },
    { atributo: "velocidade", nome: "Velocidade", icone: "⚡" },
    { atributo: "resistencia", nome: "Resistência", icone: "🫁" },
    { atributo: "forca", nome: "Força", icone: "💪" }
];

function renderModalTreino() {
    inicializarEstadoCarreiraJogador();
    let modal = document.getElementById("modalTreino");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modalTreino";
        modal.className = "modal oculto";
        document.body.appendChild(modal);
    }
    const opcoes = jogador.posicao === "Goleiro" ? TREINOS_DISPONIVEIS_GOLEIRO : TREINOS_DISPONIVEIS_LINHA;
    modal.innerHTML = `
        <div class="modal-content" style="width:560px; max-width:94vw; position:relative;">
            <button class="close-btn" style="position:absolute; top:16px; right:20px; font-size:1.6rem; background:none; border:none; color:#fff; cursor:pointer;" onclick="document.getElementById('modalTreino').classList.add('oculto')">✖</button>
            <div style="padding:20px 25px;">
                <h2 style="margin:0 0 4px;">🏋️ Treino</h2>
                <p style="color:#ddd; margin-bottom:16px;">Nível <strong>${jogador.nivel}</strong> (${jogador.xp}/${jogador.xpProximoNivel} XP) — <strong>${jogador.pontosTreino}</strong> ponto(s) de treino disponível(is). Escolhe o que melhorar:</p>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${opcoes.map(op => `
                        <div class="manager-row">
                            <span style="font-size:1.5rem;">${op.icone}</span>
                            <span><strong>${op.nome}</strong><small>Atual: ${jogador[op.atributo] ?? "–"}</small></span>
                            <button class="btn btn-success" ${jogador.pontosTreino > 0 ? "" : "disabled"} onclick="window.executarTreino('${op.atributo}', '${op.nome}')">Treinar (1 ponto)</button>
                        </div>
                    `).join("")}
                </div>
                <p style="color:#aaa; font-size:0.82rem; margin-top:14px;">Pontos de treino são ganhos ao subir de nível — e o nível sobe com XP ganho em partidas (quanto melhor a atuação, mais XP).</p>
            </div>
        </div>`;
    modal.classList.remove("oculto");
}

window.executarTreino = function(atributo, nomeAtributo) {
    inicializarEstadoCarreiraJogador();
    if (jogador.pontosTreino <= 0) {
        mostrarToast("Treino", "Sem pontos de treino disponíveis.", "warning");
        return;
    }
    jogador.pontosTreino--;
    const ganho = 1 + Math.floor(Math.random() * 3); // +1 a +3
    jogador[atributo] = Math.min(99, (jogador[atributo] || 60) + ganho);
    jogador.geral = calcularGeralDeAtributos(jogador);
    jogador.energia = Math.max(10, (jogador.energia ?? 100) - 8);
    mostrarToast("Treino concluído", `${nomeAtributo} +${ganho} (agora ${jogador[atributo]}). OVR: ${jogador.geral}.`, "success");
    registrarNoticia("Treino específico", `${jogador.nome} focou o treino em ${nomeAtributo.toLowerCase()} e evoluiu.`, "Treino");
    atualizarUI();
    window.salvarJogo();
    atualizarHub();
    renderModalTreino();
};

document.getElementById("btnTreinar")?.addEventListener("click", () => {
    inicializarEstadoCarreiraJogador();
    if(jogador.lesaoRodadas > 0) {
        mostrarToast("Treino bloqueado", "Estás lesionado. Usa descanso para recuperar.", "warning");
        return;
    }
    if (jogador.pontosTreino <= 0) {
        mostrarToast("Sem pontos de treino", `Ganha XP em partidas pra subir de nível (${jogador.xp}/${jogador.xpProximoNivel} XP até o nível ${jogador.nivel + 1}) e ganhar pontos de treino.`, "info");
    }
    renderModalTreino();
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

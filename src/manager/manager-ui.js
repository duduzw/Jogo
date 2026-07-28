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
// 🎯 Feedback visual do alvo durante o arraste — sem isto, dava pra soltar
// um jogador "às cegas" sem saber qual vaga ia receber a troca.
window.managerDragEnter = function(ev) { ev.currentTarget.classList.add("drag-over"); };
window.managerDragLeave = function(ev) { ev.currentTarget.classList.remove("drag-over"); };
window.managerDrop = function(ev, tipoAlvo, idAlvo) {
    ev.preventDefault();
    ev.currentTarget.classList.remove("drag-over");
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

// Refaz a escalação titular a partir do zero pelos melhores OVRs por posição
// — mesma lógica do preenchimento automático inicial, mas disponível a
// qualquer momento como um botão "Melhor XI", sem precisar trocar de formação.
window.managerEscalarMelhorXI = function() {
    const clube = clubeManagerAtual();
    if (!clube) return;
    const slots = FORMACOES_SLOTS[managerEstado.tatica.formacao] || FORMACOES_SLOTS["4-3-3"];
    const elenco = jogadoresIA.filter(p => p.clubeId === clube.id && !p.aposentado);
    if (jogador?.clubeId === clube.id) elenco.push(jogador);
    const esc = managerEstado.escalacao || { titulares: {}, banco: [], formacaoUsada: null };
    const usados = new Set();
    esc.titulares = {};
    slots.forEach(slot => {
        const candidato = elenco.filter(p => p.posicao === slot.pos && !usados.has(p.id)).sort((a, b) => b.geral - a.geral)[0]
            || elenco.filter(p => !usados.has(p.id)).sort((a, b) => b.geral - a.geral)[0];
        if (candidato) { esc.titulares[slot.id] = candidato.id; usados.add(candidato.id); }
    });
    esc.banco = elenco.filter(p => !usados.has(p.id)).sort((a, b) => b.geral - a.geral).slice(0, 7).map(p => p.id);
    esc.formacaoUsada = managerEstado.tatica.formacao;
    managerEstado.escalacao = esc;
    window.managerSelecaoAtiva = null;
    window.salvarJogo();
    renderizarManagerTactics();
    mostrarToast?.("Central Tática", "Escalação reorganizada pelos melhores OVRs por posição.", "success");
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
                    if (!p) return `<div class="pitch-slot pitch-slot-vazio ${selecionado ? "selecionado" : ""}" style="top:${slot.top}%; left:${slot.left}%;" onclick="managerClicarSlot('${slot.id}')" ondragover="event.preventDefault()" ondragenter="managerDragEnter(event)" ondragleave="managerDragLeave(event)" ondrop="managerDrop(event,'slot','${slot.id}')"><span class="pitch-slot-badge">${slot.label}</span><span class="pitch-slot-vazio-icon">+</span></div>`;
                    // ⚠ Fora de posição: o jogador não joga na posição natural do slot —
                    // o mesmo desencaixe que agora pesa contra o bónus tático da equipa.
                    const foraDePosicao = p.posicao !== slot.pos;
                    const ovrEfetivo = foraDePosicao ? calcularOvrNaPosicao(p, slot.pos) : p.geral;
                    return `<div class="pitch-slot ${selecionado ? "selecionado" : ""} ${foraDePosicao ? "fora-posicao" : ""}" draggable="true" style="top:${slot.top}%; left:${slot.left}%;" onclick="managerClicarSlot('${slot.id}')" ondragstart="managerDragStart(event,'slot','${slot.id}')" ondragover="event.preventDefault()" ondragenter="managerDragEnter(event)" ondragleave="managerDragLeave(event)" ondrop="managerDrop(event,'slot','${slot.id}')" title="${foraDePosicao ? `Fora da posição natural (${p.posicao}) — OVR cai de ${p.geral} para ${ovrEfetivo} aqui` : ""}">
                        <span class="pitch-slot-badge">${slot.label}</span>
                        ${foraDePosicao ? '<span class="pitch-slot-warning">⚠</span>' : ""}
                        <img loading="lazy" decoding="async" src="${obterUrlImagem(p, 'jogador')}" onerror="this.style.visibility='hidden'">
                        <strong>${p.nome.split(" ").slice(-1)[0]}</strong>
                        <small class="${foraDePosicao ? "ovr-penalizado" : ""}">OVR ${foraDePosicao ? `<s>${p.geral}</s> ${ovrEfetivo}` : p.geral}</small>
                    </div>`;
                }).join("")}
            </div>
            <div class="pitch-bench">
                <h4>Banco de Reservas <small>${sel ? "Clique numa vaga ou reserva para completar a troca" : "Clique num jogador e depois no lugar pra onde ele vai"}</small>
                    <button type="button" class="btn-melhor-xi" onclick="managerEscalarMelhorXI()">⚡ Melhor XI</button>
                </h4>
                <div class="pitch-bench-list" ondragover="event.preventDefault()" ondragenter="managerDragEnter(event)" ondragleave="managerDragLeave(event)">
                    ${esc.banco.map(id => {
                        const p = jogadorManagerPorId(id);
                        if (!p) return "";
                        const selecionado = sel?.tipo === "banco" && sel.id === id;
                        return `<div class="pitch-bench-item ${selecionado ? "selecionado" : ""}" draggable="true" onclick="managerClicarBanco('${id}')" ondragstart="managerDragStart(event,'banco','${id}')" ondragenter="managerDragEnter(event)" ondragleave="managerDragLeave(event)" ondrop="managerDrop(event,'banco','${id}')">
                            <img loading="lazy" decoding="async" src="${obterUrlImagem(p, 'jogador')}" onerror="this.style.visibility='hidden'">
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
            return `<div class="squad-player-item ${titularesIds.has(p.id) ? "titular" : ""}" oncontextmenu="abrirMenuContextoJogador(event, '${p.id}')">
            <img loading="lazy" decoding="async" class="squad-player-avatar-img" src="${obterUrlImagem(p, 'jogador')}" onerror="this.style.visibility='hidden'" onclick="abrirPerfilJogador('${p.id}')" style="cursor:pointer">
            <div class="squad-player-info"><span class="squad-player-name" onclick="abrirPerfilJogador('${p.id}')" style="cursor:pointer">${p.nome}${ehCapitao ? ' <span class="badge-capitao" title="Capitão">C</span>' : ''}</span><span class="squad-player-pos">${p.posicao}${titularesIds.has(p.id) ? " • Titular" : ""}</span></div>
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
    const esc = garantirEscalacaoManager(clube);
    const idsTitulares = new Set(Object.values(esc.titulares));
    obterTitularesClube(clube.id);
    const capitaoId = (jogador?.clubeId === clube.id && jogador.eCapitao) ? "player" : (clube.capitaoId || null);
    el.innerHTML = `<div class="manager-full-squad-list">${elenco.map(p => {
        const ehCapitao = p.id === capitaoId;
        const ehTitular = idsTitulares.has(p.id) || ehCapitao;
        const ehJogadorReal = p.id === "player" || (jogador && p.id === jogador.id);
        return `
        <div class="manager-row ${ehTitular ? 'manager-row-titular' : ''}" oncontextmenu="abrirMenuContextoJogador(event, '${p.id}')">
            <img loading="lazy" decoding="async" src="${obterUrlImagem(p, 'jogador')}" onerror="this.style.visibility='hidden'" onclick="abrirPerfilJogador('${p.id}')" style="cursor:pointer">
            <span onclick="abrirPerfilJogador('${p.id}')" style="cursor:pointer">
                <strong>${p.nome}${ehCapitao ? ' <span class="badge-capitao" title="Capitão">C</span>' : ''}</strong>
                <small>${p.posicao} • ${p.idade || "-"} anos${ehTitular ? ' • <span style="color:#10b981; font-weight:700;">Titular</span>' : ''}</small>
            </span>
            <span class="squad-player-ovr">OVR ${p.geral}</span>
            <em style="color:#cbd5e1; font-weight:700; margin-left:8px;">${formatarMoeda(p.valorMercadoNum || calcularValorMercadoJogador(p))}</em>
            ${ehJogadorReal ? "" : `<button class="btn btn-danger btn-sm" type="button" onclick="event.stopPropagation(); managerVenderJogador('${p.id}')" title="Vender jogador">Vender</button>`}
        </div>`;
    }).join("") || `<p style="color:#94a3b8; text-align:center; padding:20px;">Elenco vazio.</p>`}</div>`;
}

// 🔍 Estado dos filtros do mercado do manager (posição, idade, nacionalidade,
// valor). Persiste entre re-renderizações da aba, mas é só um filtro de
// exibição — não altera elenco, valores nem nenhuma regra do jogo.
window.filtroMercadoManager = window.filtroMercadoManager || { posicao: "", idadeMax: "", nacionalidade: "", valorMax: "" };

function montarFiltrosMercadoManager(el) {
    if (document.getElementById("transferFiltrosManager")) return;
    const nacionalidades = [...new Set(jogadoresIA.map(p => p.nacionalidade).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const barra = document.createElement("div");
    barra.id = "transferFiltrosManager";
    barra.className = "transfer-filtros";
    barra.innerHTML = `
        <select id="filtroMercadoPosicao" title="Posição">
            <option value="">Posição (todas)</option>
            ${["Goleiro", "Zagueiro", "Lateral", "Volante", "Meio-Campista", "Meia Ofensivo", "Ponta", "Atacante"].map(p => `<option value="${p}">${p}</option>`).join("")}
        </select>
        <select id="filtroMercadoIdade" title="Idade">
            <option value="">Idade (todas)</option>
            <option value="21">Até 21 anos</option>
            <option value="23">Até 23 anos</option>
            <option value="27">Até 27 anos</option>
            <option value="30">Até 30 anos</option>
            <option value="99">Acima de 30 anos</option>
        </select>
        <select id="filtroMercadoNacionalidade" title="Nacionalidade">
            <option value="">Nacionalidade (todas)</option>
            ${nacionalidades.map(n => `<option value="${n}">${n}</option>`).join("")}
        </select>
        <select id="filtroMercadoValor" title="Valor de mercado">
            <option value="">Valor (todos)</option>
            <option value="5000000">Até €5M</option>
            <option value="20000000">Até €20M</option>
            <option value="50000000">Até €50M</option>
            <option value="999000000">Acima de €50M</option>
        </select>
        <button id="btnLimparFiltroMercado" class="btn" type="button">Limpar filtros</button>`;
    el.parentElement.insertBefore(barra, el);
    const aplicar = () => {
        const f = window.filtroMercadoManager;
        f.posicao = document.getElementById("filtroMercadoPosicao").value;
        f.idadeMax = document.getElementById("filtroMercadoIdade").value;
        f.nacionalidade = document.getElementById("filtroMercadoNacionalidade").value;
        f.valorMax = document.getElementById("filtroMercadoValor").value;
        renderizarManagerTransfers(document.getElementById("transfer-search-input")?.value || "");
    };
    barra.querySelectorAll("select").forEach(s => s.addEventListener("change", aplicar));
    document.getElementById("btnLimparFiltroMercado").addEventListener("click", () => {
        window.filtroMercadoManager = { posicao: "", idadeMax: "", nacionalidade: "", valorMax: "" };
        barra.querySelectorAll("select").forEach(s => s.value = "");
        renderizarManagerTransfers(document.getElementById("transfer-search-input")?.value || "");
    });
}

function renderizarManagerTransfers(termoBusca = "") {
    const clube = clubeManagerAtual();
    const el = document.getElementById("transfer-results");
    if (!clube || !el) return;
    montarFiltrosMercadoManager(el);
    const f = window.filtroMercadoManager;
    // Mantém os selects sincronizados com o estado ao re-renderizar (ex.:
    // depois de trocar de aba e voltar para o mercado).
    const elPos = document.getElementById("filtroMercadoPosicao"); if (elPos) elPos.value = f.posicao;
    const elIda = document.getElementById("filtroMercadoIdade"); if (elIda) elIda.value = f.idadeMax;
    const elNac = document.getElementById("filtroMercadoNacionalidade"); if (elNac) elNac.value = f.nacionalidade;
    const elVal = document.getElementById("filtroMercadoValor"); if (elVal) elVal.value = f.valorMax;

    const passaFiltros = (p) => {
        if (f.posicao && p.posicao !== f.posicao) return false;
        if (f.idadeMax) {
            const max = Number(f.idadeMax);
            const idade = p.idade || 24;
            if (max === 99 ? !(idade > 30) : !(idade <= max)) return false;
        }
        if (f.nacionalidade && p.nacionalidade !== f.nacionalidade) return false;
        if (f.valorMax) {
            const max = Number(f.valorMax);
            const valor = p.valorMercadoNum || calcularValorMercadoJogador(p);
            if (max === 999000000 ? !(valor > 50000000) : !(valor <= max)) return false;
        }
        return true;
    };
    const temFiltroAtivo = !!(f.posicao || f.idadeMax || f.nacionalidade || f.valorMax);

    let lista;
    if (termoBusca.trim()) {
        const termo = termoBusca.trim().toLowerCase();
        lista = jogadoresIA.filter(p => p.clubeId !== clube.id && !p.aposentado && p.nome.toLowerCase().includes(termo) && passaFiltros(p)).slice(0, 30);
    } else {
        lista = jogadoresIA.filter(p => p.clubeId !== clube.id && !p.aposentado && passaFiltros(p) && (temFiltroAtivo || p.geral <= (clube.reputacao || 70) + 12))
            .sort((a, b) => b.geral - a.geral).slice(0, 30);
    }
    el.innerHTML = lista.map(p => `
        <div class="manager-row">
            <img loading="lazy" decoding="async" src="${obterUrlImagem(p, 'jogador')}" onerror="this.style.visibility='hidden'">
            <span>
                <strong>${p.nome}</strong>
                <small>${p.posicao} • ${p.idade || "?"} anos • ${p.nacionalidade || "—"} • ${clubes.find(c => c.id === p.clubeId)?.nome || "Sem clube"}</small>
            </span>
            <span class="squad-player-ovr" style="margin-right:8px;">OVR ${p.geral}</span>
            <button class="btn btn-primary btn-sm" onclick="managerAbrirNegociacaoContratacao('${p.id}')">💰 ${formatarMoeda(p.valorMercadoNum || calcularValorMercadoJogador(p))}</button>
        </div>`).join("")
        || `<p style="color:#94a3b8; text-align:center; padding:20px;">Nenhum jogador encontrado com estes filtros.</p>`;
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
            <div class="finance-card">
                <h4>Confiança da Diretoria</h4><strong>${managerEstado.confianca}%</strong>
                <div class="manager-confidence-track"><div class="manager-confidence-fill" style="width:${Math.max(0, Math.min(100, managerEstado.confianca))}%; background:${managerEstado.confianca >= 60 ? "#10b981" : managerEstado.confianca >= 30 ? "#f59e0b" : "#ef4444"};"></div></div>
            </div>
        </div>
        <div class="manager-grid-2col" style="margin-top:16px;">
            <div>
                <section class="manager-panel">
                    <h3>Posição na Liga</h3>
                    ${posicaoHtml}
                    <button class="btn btn-primary" style="margin-top:12px;" onclick="managerSimularPartida()">${temporadaCompleta ? "Avançar Época" : "Simular Próximo Jogo"}</button>
                </section>
            </div>
            <div>
                <section class="manager-panel">
                    <h3>Categoria de Base <small style="color:#aaa; font-weight:400; text-transform:none;">(${managerEstado.promocoesBaseTemporada || 0}/${LIMITE_PROMOCOES_BASE_POR_TEMPORADA} promoções usadas nesta temporada)</small></h3>
                    ${(managerEstado.base || []).map(p => `<div class="manager-row"><img loading="lazy" decoding="async" src="${obterUrlImagem(p, 'jogador')}" onerror="this.style.visibility='hidden'"><span><strong>${p.nome}</strong><small>${p.posicao} • OVR ${p.geral} • POT ${p.potencial}</small></span><button class="btn btn-success" ${(managerEstado.promocoesBaseTemporada || 0) >= LIMITE_PROMOCOES_BASE_POR_TEMPORADA ? "disabled title=\"Limite de promoções da temporada atingido\"" : ""} onclick="managerPromoverJovem('${p.id}')">Promover</button></div>`).join("") || `<p style="color:#aaa;">Sem jovens na base.</p>`}
                </section>
                <section class="manager-panel" style="margin-top:16px;">
                    <h3>Comissão Técnica</h3>
                    ${managerEstado.auxiliarTecnico ? `
                        <div class="manager-row"><span style="font-size:1.6rem;">${managerEstado.auxiliarTecnico.icone}</span><span><strong>${managerEstado.auxiliarTecnico.nome}</strong><small>${managerEstado.auxiliarTecnico.tipo} • ${managerEstado.auxiliarTecnico.nacionalidade} • ${formatarMoeda(managerEstado.auxiliarTecnico.custoAnual)}/ano</small></span><button class="btn btn-danger" onclick="managerDemitirAuxiliar()">Demitir</button></div>
                        <p style="color:#aaa; font-size:0.85rem; margin-top:8px;">${managerEstado.auxiliarTecnico.desc}</p>
                    ` : `
                        <p style="color:#aaa; margin-bottom:10px;">Nenhum auxiliar técnico contratado — contrate um da comissão disponível abaixo.</p>
                        ${(managerEstado.auxiliaresDisponiveis || []).map(a => `<div class="manager-row"><span style="font-size:1.6rem;">${a.icone}</span><span><strong>${a.nome}</strong><small>${a.tipo} • ${a.nacionalidade} • ${formatarMoeda(a.custoAnual)}/ano</small></span><button class="btn btn-success" onclick="managerContratarAuxiliar('${a.id}')">Contratar</button></div>`).join("") || `<p style="color:#aaa;">Nenhum candidato disponível no momento.</p>`}
                    `}
                </section>
            </div>
        </div>`;
}

// 📄 Aba "Contratos": inbox de propostas recebidas de outros clubes pelos
// teus jogadores (aceitar/recusar/contrapropor) + lista do elenco com anos
// de contrato restantes e um painel de renovação por jogador.
function renderizarManagerContratos() {
    const clube = clubeManagerAtual();
    const el = document.getElementById("manager-contracts-panel");
    if (!clube || !el) return;

    const propostas = (managerEstado.propostasRecebidas || []).filter(o => o.status === "pendente");
    const elenco = jogadoresIA.filter(p => p.clubeId === clube.id && !p.aposentado && p.id !== "player" && !(jogador && p.id === jogador.id))
        .sort((a, b) => (a.contrato ?? 99) - (b.contrato ?? 99));

    const propostasHtml = propostas.length ? propostas.map(o => `
        <div class="manager-row" style="flex-wrap:wrap;">
            <span style="flex:1 1 100%;"><strong>${o.jogadorNome}</strong><small>Proposta do ${o.clubeCompradorNome} • ${formatarMoeda(o.valor)}</small></span>
            <button class="btn btn-success btn-sm" onclick="managerResponderProposta('${o.id}','aceitar')">Aceitar</button>
            <button class="btn btn-sm" onclick="managerResponderProposta('${o.id}','contraproposta')">Contrapropor (+20%)</button>
            <button class="btn btn-danger btn-sm" onclick="managerResponderProposta('${o.id}','rejeitar')">Recusar</button>
        </div>`).join("") : `<p style="color:#aaa;">Nenhuma proposta pendente no momento.</p>`;

    const contratosHtml = elenco.map(p => {
        const anos = p.contrato ?? 0;
        const salario = salarioAtualJogador(p);
        const alerta = anos <= 1;
        const anosSugeridos = Math.max(2, Math.min(5, 6 - Math.floor((p.idade || 24) / 8)));
        const salarioSugerido = Math.floor(salario * 1.12);
        return `
        <div class="manager-row" style="flex-wrap:wrap;">
            <img loading="lazy" decoding="async" src="${obterUrlImagem(p, 'jogador')}" onerror="this.style.visibility='hidden'">
            <span><strong>${p.nome}</strong><small>${p.posicao} • OVR ${p.geral} • ${formatarMoeda(salario)}/sem</small></span>
            <em style="${alerta ? 'color:var(--danger);' : ''}">${anos} ano(s)</em>
            <button class="btn btn-sm" type="button" onclick="managerAbrirNegociacaoContrato('${p.id}')">Renovar</button>
            <div id="negociacao-contrato-${p.id}" class="negociacao-contrato-painel">
                <div class="negociacao-contrato-campos">
                    <label>Anos <input type="number" id="renovar-anos-${p.id}" data-campo="anos" min="1" max="6" value="${anosSugeridos}"></label>
                    <label>Salário/sem <input type="number" id="renovar-salario-${p.id}" data-campo="salario" step="1000" value="${salarioSugerido}"></label>
                </div>
                <button class="btn btn-primary btn-sm" type="button" onclick="managerPropoRenovacao('${p.id}')">Propor renovação</button>
            </div>
        </div>`;
    }).join("") || `<p style="color:#aaa;">Elenco vazio.</p>`;

    el.innerHTML = `
        <section class="manager-panel">
            <h3>📨 Propostas Recebidas</h3>
            ${propostasHtml}
        </section>
        <section class="manager-panel" style="margin-top:16px;">
            <h3>📄 Contratos do Elenco</h3>
            <p class="manager-mini-note">Contrato em vermelho = 1 ano ou menos restante — o jogador pode sair de graça no fim da época.</p>
            ${contratosHtml}
        </section>`;
}

// Abre uma área interna da Central do Manager. A função é usada tanto pelas
// abas superiores quanto pelos atalhos próprios da barra lateral.
window.abrirAbaManager = function(id = "view-manager-tactics") {
    const alvo = document.getElementById(id);
    if (!alvo) return;
    window.managerAbaAtiva = id;
    document.querySelectorAll("#view-manager .manager-tab").forEach(b => b.classList.toggle("active", b.dataset.view === id));
    document.querySelectorAll("#view-manager .manager-view").forEach(v => v.classList.toggle("active", v.id === id));
};

// Reaproveita o layout do Hub da Época, mas troca completamente os números e
// ações pessoais por informações do clube que o treinador comanda.
function renderizarHubManager() {
    if (window.gameMode !== "manager") return;
    const hub = document.getElementById("view-home");
    if (!hub) return;
    const clube = clubeManagerAtual();
    if (!managerEstado.ativo || !clube) {
        hub.innerHTML = `<div class="manager-shell">
            <div class="manager-hero">
                <div><span class="comp-int-kicker">Carreira de treinador</span><h2>🧠 O teu Hub de Manager está pronto</h2><p>Escolhe um clube para desbloquear central tática, banco de reservas, mercado de transferências, contratos e simulação visual das partidas.</p></div>
                <button class="btn btn-warning enhanced-btn" style="padding:16px 26px; font-size:1rem;" onclick="document.querySelector('.menu-item[data-view=\'view-manager\']')?.click()">🏟️ Escolher clube ➔</button>
            </div>
            <div class="manager-hub-grid">
                <section class="manager-panel"><h3>⚽ Central Tática</h3><p style="color:#94a3b8; margin:0;">Monte a escalação em campo, ajuste formação, mentalidade e instruções antes de cada rodada.</p></section>
                <section class="manager-panel"><h3>💼 Mercado & Contratos</h3><p style="color:#94a3b8; margin:0;">Negocie contratações, propostas recebidas e renovações de contrato do elenco.</p></section>
            </div>
        </div>`;
        return;
    }
    const tabela = tabelasLigas[clube.ligaId] || [];
    const meu = tabela.find(t => t.id === clube.id);
    const rival = tabela.filter(t => t.id !== clube.id).sort((a, b) => (a.jogos || 0) - (b.jogos || 0))[0];
    const clubeRival = clubes.find(c => c.id === rival?.id);
    const posicao = meu ? [...tabela].sort((a,b) => (b.pontos || 0) - (a.pontos || 0)).findIndex(t => t.id === clube.id) + 1 : "—";
    const confCor = managerEstado.confianca >= 60 ? "#10b981" : managerEstado.confianca >= 30 ? "#f59e0b" : "#ef4444";
    hub.innerHTML = `<div class="manager-shell">
        <div class="manager-hero">
            <div style="display:flex; align-items:center; gap:16px;">
                <img loading="lazy" decoding="async" src="${obterUrlImagem(clube, "clube")}" onerror="this.style.visibility='hidden'" style="width:58px; height:58px; object-fit:contain; background:rgba(255,255,255,.06); border-radius:14px; padding:8px; border:1px solid rgba(212,175,55,.3);">
                <div><span class="comp-int-kicker">Central do treinador</span><h2>${clube.nome}</h2><p>🎯 ${objetivoDiretoria(clube)}. A preparação começa no campo tático.</p></div>
            </div>
            <div class="manager-license"><strong style="color:${confCor};">${managerEstado.confianca}%</strong><span>confiança da diretoria</span></div>
        </div>
        ${(managerEstado.propostasRecebidas || []).length ? `<section class="manager-panel" style="border:1px solid rgba(250,204,21,.4); margin-bottom:20px;"><h3>📨 Propostas Recebidas</h3>
            ${managerEstado.propostasRecebidas.map((p, i) => `<div class="manager-row" style="flex-wrap:wrap;">
                <span style="width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg, rgba(212,175,55,.35), rgba(16,185,129,.25)); display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0;">${p.tipo === "clube" ? "⚽" : "🌍"}</span>
                <span><strong>${p.tipo === "clube" ? p.nome : `Seleção ${p.nome}`}</strong><small>${p.tipo === "clube" ? `Reputação ${p.reputacao}` : "Convite internacional"}</small></span>
                <span style="display:flex; gap:6px;"><button class="btn btn-success btn-sm" onclick="managerAceitarProposta(${i})">Aceitar</button><button class="btn btn-danger btn-sm" onclick="managerRecusarProposta(${i})">Recusar</button></span>
            </div>`).join("")}
        </section>` : ""}
        <div class="manager-hub-grid">
            <section class="manager-next-match"><span class="comp-int-kicker">Próximo compromisso</span><div class="manager-next-clubs"><span><img loading="lazy" decoding="async" src="${obterUrlImagem(clube, "clube")}" onerror="this.style.visibility='hidden'">${clube.nome}</span><b>VS</b><span>${clubeRival?.nome || "Adversário a definir"}</span></div><p style="color:#8b98a3;margin:0; font-size:.88rem;">Defina os titulares, o banco e o estilo antes de avançar a rodada.</p><div class="manager-quick-actions"><button class="btn btn-success" onclick="managerSimularPartida(true)">▶ Simular com visual</button><button class="btn" onclick="managerSimularPartida(false)">⏩ Simulação rápida</button></div></section>
            <section class="manager-panel"><h3>📊 Resumo do clube</h3><div class="manager-summary-list"><div><span>🏆 Posição na liga</span><strong>${posicao}${meu ? `º / ${tabela.length}` : ""}</strong></div><div><span>⭐ Pontos</span><strong>${meu?.pontos || 0}</strong></div><div><span>💰 Orçamento</span><strong>${formatarMoeda(managerEstado.orcamentoTransferencias)}</strong></div><div><span>⚙️ Formação</span><strong>${managerEstado.tatica.formacao}</strong></div></div></section>
        </div>
        <section class="manager-panel" style="margin-top:20px"><h3>🗓️ Preparação da semana</h3><div class="manager-quick-actions"><button class="btn btn-primary" onclick="window.abrirAbaManager('view-manager-tactics'); document.querySelector('.menu-item[data-view=\'view-manager\']')?.click();">📋 Organizar escalação</button><button class="btn btn-primary" onclick="window.abrirAbaManager('view-manager-transfers'); document.querySelector('.menu-item[data-view=\'view-manager\']')?.click();">🔍 Abrir mercado</button><button class="btn btn-primary" onclick="window.abrirAbaManager('view-manager-contracts'); document.querySelector('.menu-item[data-view=\'view-manager\']')?.click();">📄 Ver contratos</button></div></section>
        <div class="manager-hub-grid" style="margin-top:20px">
            <section class="manager-panel">
                <h3>📈 Retrospecto da temporada</h3>
                <div class="manager-retrospecto-grid">
                    <div class="retrospecto-item vitoria"><strong>${meu?.vitorias || 0}</strong><span>Vitórias</span></div>
                    <div class="retrospecto-item empate"><strong>${meu?.empates || 0}</strong><span>Empates</span></div>
                    <div class="retrospecto-item derrota"><strong>${meu?.derrotas || 0}</strong><span>Derrotas</span></div>
                    <div class="retrospecto-item"><strong>${meu?.gols ?? 0}-${meu?.golsSofridos ?? 0}</strong><span>Saldo de gols</span></div>
                </div>
            </section>
            <section class="manager-panel">
                <h3>🌟 Destaques do elenco</h3>
                ${(() => {
                    const meuElenco = jogadoresIA.filter(p => p.clubeId === clube.id && !p.aposentado);
                    const melhorOVR = [...meuElenco].sort((a, b) => b.geral - a.geral)[0];
                    const jovemPromessa = meuElenco.filter(p => (p.idade || 30) <= 21).sort((a, b) => b.geral - a.geral)[0];
                    const linha = (rotulo, p) => p ? `<div class="manager-row" style="margin-bottom:8px;">
                        <img loading="lazy" decoding="async" src="${obterUrlImagem(p, 'jogador')}" onerror="this.style.visibility='hidden'">
                        <span><strong>${p.nome}</strong><small>${rotulo} • ${p.posicao} • ${p.idade || "?"} anos</small></span>
                        <span class="squad-player-ovr">OVR ${p.geral}</span>
                    </div>` : "";
                    return linha("⭐ Melhor do elenco", melhorOVR) + linha("💎 Joia da base", jovemPromessa) || `<p style="color:#94a3b8; margin:0;">Elenco vazio.</p>`;
                })()}
            </section>
        </div>
    </div>`;
}

function wireManagerControls() {
    const clube = clubeManagerAtual();
    if (!clube) return;

    document.querySelectorAll("#view-manager .manager-tab").forEach(btn => {
        btn.onclick = () => {
            window.abrirAbaManager(btn.dataset.view);
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
    configurarNavegacaoPorModo();
    const treinador = managerEstado.treinador || { nome: jogador?.nome ? `Mister ${jogador.nome}` : "Novo Treinador", reputacao: Math.max(45, Math.min(88, Math.round((jogador?.geral || 65) * 0.9))), ataque: 62, defesa: 62, tatica: 62 };
    managerEstado.treinador = treinador;

    const dashboardEl = el.querySelector(".manager-dashboard");

    if (managerEstado.ativo && managerEstado.selecaoId) {
        if (dashboardEl) dashboardEl.style.display = "none";
        const pick = document.getElementById("manager-pick-club-screen");
        if (pick) pick.style.display = "none";
        renderizarManagerSelecao(el, treinador);
        return;
    }

    if(!managerEstado.ativo || !managerEstado.clubeId) {
        if (dashboardEl) dashboardEl.style.display = "none";
        const painelSelecao = document.getElementById("manager-selecao-screen");
        if (painelSelecao) painelSelecao.style.display = "none";
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
                    ${disponiveis.map(c => {
                        const estrelas = Math.max(1, Math.min(5, Math.round((c.reputacao || 60) / 20)));
                        return `<button class="manager-club-card" onclick="managerAssumirClube('${c.id}')">
                        <img loading="lazy" decoding="async" src="${obterUrlImagem(c, 'clube')}" alt="${c.nome}" onerror="this.style.visibility='hidden'">
                        <strong>${c.nome}</strong>
                        <span>🏆 ${competicoes.find(l=>l.id===c.ligaId)?.nome || "Liga"}</span>
                        <div style="margin-top:8px; color:var(--world-cup-gold); font-size:.78rem; letter-spacing:2px;" title="Reputação ${c.reputacao}">${"★".repeat(estrelas)}${"☆".repeat(5 - estrelas)}</div>
                    </button>`;
                    }).join("")}
                </div>
            </div>`;
        return;
    }

    const pick = document.getElementById("manager-pick-club-screen");
    if (pick) pick.style.display = "none";
    const painelSelecaoAtivo = document.getElementById("manager-selecao-screen");
    if (painelSelecaoAtivo) painelSelecaoAtivo.style.display = "none";
    if (dashboardEl) dashboardEl.style.display = "";

    const clube = clubeManagerAtual();
    if(!managerEstado.base?.length) managerEstado.base = gerarBaseManager(clube);
    managerEstado.folhaSalarial = calcularFolhaClube(clube.id);

    const nomeEl = document.getElementById("manager-club-name");
    if (nomeEl) nomeEl.textContent = `${clube.nome} — ${objetivoDiretoria(clube)}`;
    const logoEl = document.getElementById("manager-header-logo");
    if (logoEl) { logoEl.src = obterUrlImagem(clube, "clube"); logoEl.alt = clube.nome; logoEl.style.display = ""; }
    const budgetEl = document.getElementById("manager-budget");
    if (budgetEl) budgetEl.textContent = formatarMoeda(managerEstado.orcamentoTransferencias);
    const confEl = document.getElementById("manager-confidence");
    if (confEl) confEl.textContent = `${managerEstado.confianca}%`;
    // 📊 Barra de confiança: verde tranquilo / amarelo atenção / vermelho perigo.
    const confFillEl = document.getElementById("manager-confidence-fill");
    if (confFillEl) {
        confFillEl.style.width = `${Math.max(0, Math.min(100, managerEstado.confianca))}%`;
        confFillEl.style.background = managerEstado.confianca >= 60 ? "#10b981" : managerEstado.confianca >= 30 ? "#f59e0b" : "#ef4444";
    }
    const squadSizeEl = document.getElementById("manager-squad-size");
    if (squadSizeEl) squadSizeEl.textContent = jogadoresIA.filter(p => p.clubeId === clube.id && !p.aposentado).length;
    const objetivoEl = document.getElementById("manager-objetivo");
    if (objetivoEl) objetivoEl.textContent = objetivoDiretoria(clube);
    // 🔔 Badge de propostas pendentes na aba "Contratos & Propostas" — feedback
    // visual imediato de que há algo esperando decisão, sem precisar entrar na aba.
    const badgeContratos = document.getElementById("manager-tab-badge-contracts");
    if (badgeContratos) {
        const pendentes = (managerEstado.propostasRecebidas || []).length;
        badgeContratos.textContent = pendentes;
        badgeContratos.classList.toggle("oculto", pendentes === 0);
    }

    // Converte o cartão lateral em identidade de treinador enquanto este modo
    // estiver ativo, substituindo nível/idade/energia do atleta por KPIs do clube.
    const sideNome = document.getElementById("sideNome");
    const sideClube = document.getElementById("sideClube");
    const sideLogo = document.getElementById("sideClubeLogo");
    const sideAvatar = document.getElementById("sidePlayerImg");
    const sideRows = document.querySelectorAll(".sidebar-stats .stat-row");
    if (sideNome) sideNome.textContent = managerEstado.treinador?.nome || "Treinador";
    if (sideClube) sideClube.textContent = clube.nome;
    if (sideLogo) sideLogo.src = obterUrlImagem(clube, "clube");
    if (sideAvatar) sideAvatar.src = obterUrlImagem(clube, "clube");
    const dadosLaterais = [["Orçamento", formatarMoeda(managerEstado.orcamentoTransferencias)], ["Diretoria", `${managerEstado.confianca}%`], ["Elenco", jogadoresIA.filter(p => p.clubeId === clube.id && !p.aposentado).length], ["Objetivo", objetivoDiretoria(clube)]];
    sideRows.forEach((row, i) => { if (dadosLaterais[i]) { row.querySelector("span").textContent = dadosLaterais[i][0]; row.querySelector("strong").textContent = dadosLaterais[i][1]; } });
    document.querySelector(".sidebar-stats .xp-container")?.classList.add("oculto");

    wireManagerControls();
    renderizarManagerTactics();
    renderizarManagerFullSquad();
    renderizarManagerTransfers();
    renderizarManagerContratos();
    renderizarManagerFinance();
    window.abrirAbaManager(window.managerAbaAtiva || "view-manager-tactics");
    renderizarHubManager();
}

// ==========================================
// 🔄 ATUALIZADORES DE UI E MENUS
// ==========================================

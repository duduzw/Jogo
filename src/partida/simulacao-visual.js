// ==========================================
// 🎥 SIMULAÇÃO VISUAL DE PARTIDA
// ==========================================
// A visualização é uma camada de apresentação: ela recebe os mesmos minutos
// e eventos que o motor já calcula, sem alterar placar, atributos ou resultados.
window.visualPartidaAtiva = true;
window.estadoVisualPartida = null;

// Mantém o botão do Hub e o botão do modal sincronizados com a escolha do usuário.
function atualizarControlesVisualPartida() {
    const ativo = window.visualPartidaAtiva;
    const hub = document.getElementById("btnModoVisualHub");
    const modal = document.getElementById("btnAlternarVisualPartida");
    if (hub) { hub.textContent = ativo ? "🎥 Visual: ligado" : "⚡ Visual: desligado"; hub.classList.toggle("btn-primary", ativo); }
    if (modal) { modal.setAttribute("aria-pressed", String(ativo)); modal.textContent = ativo ? "◉ Visual ligado" : "○ Visual desligado"; }
}

// Posicionamentos genéricos — só entram como último recurso, quando não há
// elenco algum disponível para montar uma escalação real (ex.: clube vazio).
const POSICOES_VISUAIS_CASA = [[7,50],[23,16],[25,37],[25,63],[23,84],[46,24],[49,50],[46,76],[71,18],[78,50],[71,82]];
const POSICOES_VISUAIS_VISITA = POSICOES_VISUAIS_CASA.map(([x, y]) => [100 - x, 100 - y]);

// 🧩 Monta a escalação visual REAL de um clube: se for o clube do próprio
// Manager, usa a formação e os titulares exatos definidos na Central Tática
// (o que você monta lá é o que joga aqui). Para qualquer outro clube, usa os
// titulares reais dele — o mesmo elenco de onde o motor sorteia os autores
// dos golos — encaixados por posição numa formação-padrão. Cada jogador
// aparece na vaga certa da sua posição, não num índice genérico fixo.
function montarFormacaoVisual(clubeId, ladoCasa) {
    const formacaoPadrao = "4-3-3";
    let slots = FORMACOES_SLOTS[formacaoPadrao];
    let mapa = null;
    if (managerEstado?.ativo && managerEstado.clubeId === clubeId && managerEstado.escalacao?.titulares) {
        const formacaoManager = FORMACOES_SLOTS[managerEstado.tatica?.formacao] ? managerEstado.tatica.formacao : formacaoPadrao;
        const tentativa = FORMACOES_SLOTS[formacaoManager].map(slot => ({ slot, jogador: jogadorManagerPorId(managerEstado.escalacao.titulares[slot.id]) }));
        if (tentativa.filter(x => x.jogador).length >= 7) { slots = FORMACOES_SLOTS[formacaoManager]; mapa = tentativa; }
    }
    if (!mapa) {
        const elenco = (typeof montarEscalacaoJogo === "function" ? montarEscalacaoJogo(clubeId) : jogadoresIA.filter(j => j.clubeId === clubeId)).slice();
        if (jogador?.clubeId === clubeId && !elenco.some(j => j.id === "player")) elenco.push(jogador);
        const usados = new Set();
        mapa = slots.map(slot => {
            let candidato = elenco.filter(j => j.posicao === slot.pos && !usados.has(j.id)).sort((a, b) => (b.geral || 60) - (a.geral || 60))[0];
            if (!candidato) {
                if (slot.pos === "Goleiro") {
                    // 🧤 FIX: o slot de goleiro é sempre o primeiro avaliado (fica no
                    // topo de toda formação em FORMACOES_SLOTS), então se o pool não
                    // tinha ninguém com posicao==="Goleiro" (elenco pequeno, dados
                    // incompletos do clube, etc.), o fallback genérico de "maior OVR
                    // que sobrou" caía aqui primeiro — e podia escalar até o TEU
                    // atacante como goleiro, só por ele ter o maior geral disponível.
                    // Agora a emergência tenta qualquer variante de goleiro cadastrada
                    // e, na falta total, usa o PIOR OVR de linha que sobrar (um reserva
                    // improvisando no gol) — nunca o jogador real, nunca o craque do time.
                    candidato = elenco.filter(j => !usados.has(j.id) && (j.posicao || "").includes("Goleiro")).sort((a, b) => (b.geral || 60) - (a.geral || 60))[0]
                        || elenco.filter(j => !usados.has(j.id) && j.id !== "player").sort((a, b) => (a.geral || 60) - (b.geral || 60))[0];
                } else {
                    candidato = elenco.filter(j => !usados.has(j.id)).sort((a, b) => (b.geral || 60) - (a.geral || 60))[0];
                }
            }
            if (candidato) usados.add(candidato.id);
            return { slot, jogador: candidato || null };
        });
    }
    // A Central Tática usa um campo vertical (top:0-100 = baliza própria até a
    // adversária). A transmissão usa um campo horizontal com os dois times de
    // frente um pro outro — aqui giramos as coordenadas 90° e espelhamos o
    // lado visitante, exatamente como o layout genérico antigo já fazia.
    return mapa.map(({ slot, jogador: j }, i) => {
        const x = ladoCasa ? 100 - slot.top : slot.top;
        const y = ladoCasa ? slot.left : 100 - slot.left;
        return { x, y, pos: slot.pos, label: slot.label, jogador: j || { nome: `${slot.label} ${i + 1}`, posicao: slot.pos, id: null, geral: 60 } };
    });
}

// ==========================================
// 📋 CENTRAL DA PARTIDA — feed de eventos, estatísticas (posse/xG/xA/remates)
// e tabela de elenco (POS/NOME/OVR/STATUS/COND/NOTA) com titulares + banco.
// Substitui o antigo console de texto simples (#uiConsolePartida), mas NÃO
// mexe no campo animado (matchVisualContainer) — os dois convivem, exatamente
// como pedido: a transmissão tática segue igual, só o "relato" embaixo dela
// ficou muito mais completo. Roda tanto no Modo Jogador quanto no Manager,
// porque os dois já passam pela mesma janela (#modalPartida).
// ==========================================
const CP_SIGLA_POSICAO = {
    "Goleiro": "GOL", "Goleiro Libero": "GOL", "Zagueiro": "ZAG", "Libero": "LIB",
    "Lateral": "LAT", "Lateral Direito": "LAT", "Lateral Esquerdo": "LAT", "Lateral Ala": "ALA",
    "Volante": "VOL", "Meia Defensivo": "MD", "Box-to-Box": "VOL", "Meio-Campista": "MC",
    "Meia Ofensivo": "MEI", "Ponta": "PON", "Extremo": "PON", "Segundo Atacante": "SA", "Atacante": "ATA"
};
function cpSiglaPosicao(pos) { return CP_SIGLA_POSICAO[pos] || (pos ? pos.slice(0, 3).toUpperCase() : "—"); }

// Mesmo formato usado pelo MatchEngine (match.js) — reproduzido aqui só pro
// replay sintético do Manager (que não roda o motor completo) conseguir
// alimentar a Central da Partida com o mesmo shape de estatísticas.
function cpNovoQuadroStats() {
    return { remates: 0, alvo: 0, area: 0, fora: 0, escanteios: 0, faltas: 0, amarelos: 0, vermelhos: 0, xg: 0, xa: 0, posse: 50 };
}

// Sem clube (seleções, ou fallback genérico): monta um XI plausível a partir
// de um elenco solto — 1 goleiro + os 10 de campo com maior geral — só para
// a Central da Partida ter nomes reais. Nunca é usado pelo campo animado.
function cpMontarXIGenerico(elenco) {
    const pool = (elenco || []).filter(j => j && j.id);
    const goleiros = pool.filter(j => (j.posicao || "").includes("Goleiro")).sort((a, b) => (b.geral || 0) - (a.geral || 0));
    const linha = pool.filter(j => !(j.posicao || "").includes("Goleiro")).sort((a, b) => (b.geral || 0) - (a.geral || 0));
    const titulares = [...goleiros.slice(0, 1), ...linha.slice(0, 10)];
    const idsTit = new Set(titulares.map(j => j.id));
    const banco = pool.filter(j => !idsTit.has(j.id)).sort((a, b) => (b.geral || 0) - (a.geral || 0)).slice(0, 7);
    return { titulares, banco };
}

// Junta titulares (com a posição tática já sorteada pra Central Tática, via
// os slots que também alimentam o campo animado) + banco real do clube
// (montarEscalacaoJogo) num único { titulares, banco } por lado.
function cpMontarElenco(clubeId, slots, elencoFallback) {
    if (clubeId) {
        const titulares = (slots || []).map(s => s.jogador).filter(j => j && j.id);
        const idsTit = new Set(titulares.map(j => j.id));
        const completo = (typeof montarEscalacaoJogo === "function") ? montarEscalacaoJogo(clubeId) : [];
        const banco = completo.filter(j => !idsTit.has(j.id));
        return { titulares, banco };
    }
    return cpMontarXIGenerico(elencoFallback);
}

function cpResolverJogador(id, nomeFallback) {
    if (id === "player" && typeof jogador !== "undefined" && jogador) return jogador;
    if (id && typeof jogadoresIA !== "undefined") {
        const achado = jogadoresIA.find(j => j.id === id);
        if (achado) return achado;
    }
    return nomeFallback ? { nome: nomeFallback } : null;
}

function cpLinhaJogador(j, lado) {
    const id = j.id || `cp_anon_${Math.random().toString(36).slice(2, 9)}`;
    const nome = j.nome || "—";
    const pos = cpSiglaPosicao(j.posicao);
    const ovr = j.geral ?? j.overall ?? "—";
    const foto = (typeof obterUrlImagem === "function") ? obterUrlImagem(j, "jogador") : "";
    return `<div class="cp-row" data-cp-jid="${id}" data-cp-lado="${lado}">
        <span class="cp-col-pos">${pos}</span>
        <span class="cp-col-nome"><img loading="lazy" decoding="async" src="${foto}" class="cp-avatar-mini" alt="" onerror="this.style.visibility='hidden'"><span class="cp-nome-txt">${nome}</span></span>
        <span class="cp-col-ovr">${ovr}</span>
        <span class="cp-col-status" data-cp-status></span>
        <span class="cp-col-cond"><span class="cp-cond-track"><span class="cp-cond-fill" data-cp-cond style="width:100%"></span></span><span class="cp-cond-txt" data-cp-cond-txt>100%</span></span>
        <span class="cp-col-nota" data-cp-nota>—</span>
    </div>`;
}

function cpBlocoElenco(nomeTime, logoUrl, titulares, banco, lado) {
    return `<div class="cp-squad" data-cp-lado="${lado}">
        <div class="cp-squad-head"><img loading="lazy" decoding="async" src="${logoUrl || ''}" class="cp-squad-logo" alt="" onerror="this.style.visibility='hidden'"><span>${nomeTime}</span></div>
        <div class="cp-squad-cols"><span>POS</span><span>NOME</span><span>OVR</span><span></span><span>COND</span><span>NOTA</span></div>
        <div class="cp-squad-rows">${titulares.map(j => cpLinhaJogador(j, lado)).join("")}</div>
        ${banco.length ? `<div class="cp-squad-banco-label">BANCO</div><div class="cp-squad-rows cp-squad-banco">${banco.map(j => cpLinhaJogador(j, lado)).join("")}</div>` : ""}
    </div>`;
}

function cpLinhaStat(chave, label, valCasa, valVisita, sufixo = "") {
    return `<div class="cp-stat-row" data-cp-stat="${chave}">
        <span class="cp-stat-val" data-cp-val="casa">${valCasa}${sufixo}</span>
        <span class="cp-stat-label">${label}</span>
        <span class="cp-stat-val" data-cp-val="visita">${valVisita}${sufixo}</span>
        <div class="cp-stat-track"><span class="cp-stat-fill-casa" data-cp-fill="casa" style="width:50%"></span><span class="cp-stat-fill-visita" data-cp-fill="visita" style="width:50%"></span></div>
    </div>`;
}

// Monta o esqueleto inteiro (feed vazio + estatísticas zeradas + as duas
// tabelas de elenco). Chamado uma vez, no início da transmissão.
function iniciarCentralPartida(nomeCasa, nomeVisita, clubeCasaId, clubeVisitaId, slotsCasa, slotsVisita) {
    const raiz = document.getElementById("uiConsolePartida");
    if (!raiz) return;
    const clubeCasa = clubeCasaId ? clubes.find(c => c.id === clubeCasaId) : null;
    const clubeVisita = clubeVisitaId ? clubes.find(c => c.id === clubeVisitaId) : null;
    const logoCasa = clubeCasa && typeof obterUrlImagem === "function" ? obterUrlImagem(clubeCasa, "clube") : "";
    const logoVisita = clubeVisita && typeof obterUrlImagem === "function" ? obterUrlImagem(clubeVisita, "clube") : "";
    // Sem clube (seleção): tenta usar o elenco do motor ao vivo (jogadores
    // reais da seleção) como fallback pra tabela ter nomes reais também.
    const elencoCasa = cpMontarElenco(clubeCasaId, slotsCasa, window.engineAoVivo?.elencoMandante);
    const elencoVisita = cpMontarElenco(clubeVisitaId, slotsVisita, window.engineAoVivo?.elencoVisitante);
    raiz.innerHTML = `
    <div class="cp-events" id="cpEventos">
        <div class="cp-section-head">Eventos da Partida</div>
        <div class="cp-events-list" id="cpEventosList">
            <div class="cp-event cp-event-kickoff"><span class="cp-event-min">0'</span><div class="cp-event-main"><span class="cp-event-body">O árbitro prepara o apito inicial...</span></div></div>
        </div>
    </div>
    <div class="cp-stats" id="cpStats">
        <div class="cp-section-head">Estatísticas</div>
        ${cpLinhaStat("posse", "Posse de bola", 50, 50, "%")}
        ${cpLinhaStat("xg", "Gols esperados (xG)", "0.00", "0.00")}
        ${cpLinhaStat("xa", "Assistências esperadas (xA)", "0.00", "0.00")}
        ${cpLinhaStat("remates", "Finalizações", 0, 0)}
        ${cpLinhaStat("alvo", "Finalizações no alvo", 0, 0)}
        ${cpLinhaStat("area", "Finalizações na área", 0, 0)}
        ${cpLinhaStat("fora", "Finalizações de fora", 0, 0)}
        ${cpLinhaStat("escanteios", "Escanteios", 0, 0)}
        ${cpLinhaStat("faltas", "Faltas", 0, 0)}
    </div>
    <div class="cp-squads">
        ${cpBlocoElenco(nomeCasa, logoCasa, elencoCasa.titulares, elencoCasa.banco, "casa")}
        ${cpBlocoElenco(nomeVisita, logoVisita, elencoVisita.titulares, elencoVisita.banco, "visita")}
    </div>`;
}

const CP_TIPOS_EVENTO = {
    gol: { badge: "GOL", classe: "gol" },
    penalti: { badge: "PÊNALTI", classe: "penalti" },
    penalti_defendido: { badge: "PÊNALTI DEFENDIDO", classe: "defesa" },
    defesa: { badge: "DEFESA", classe: "defesa" },
    trave: { badge: "NA TRAVE", classe: "trave" },
    amarelo: { badge: "CARTÃO AMARELO", classe: "amarelo" },
    vermelho: { badge: "CARTÃO VERMELHO", classe: "vermelho" },
    escanteio: { badge: "ESCANTEIO", classe: "escanteio" },
    falta: { badge: "FALTA", classe: "falta" },
    impedimento: { badge: "IMPEDIMENTO", classe: "impedimento" },
    atendimento: { badge: "ATENDIMENTO MÉDICO", classe: "atendimento" },
    substituicao: { badge: "SUBSTITUIÇÃO", classe: "substituicao" }
};

// Card de evento a partir do objeto estruturado que vem do MatchEngine
// (5º argumento do onTick). É o caminho "rico": ícone por tipo, avatar do
// jogador quando existe, destaque visual pra gols/cartões.
function cpMontarCardEvento(evento, minutoFallback) {
    const info = CP_TIPOS_EVENTO[evento.tipo] || { badge: "LANCE", classe: "lance" };
    const textoLimpo = String(evento.texto || "").replace(/<[^>]*>/g, "").replace(/^\s*\d+'\s*/, "").trim();
    const minuto = evento.minuto ?? minutoFallback ?? 0;
    const jog = evento.jogadorId ? cpResolverJogador(evento.jogadorId, evento.jogadorNome) : null;
    const avatar = jog && typeof obterUrlImagem === "function" ? obterUrlImagem(jog, "jogador") : "";
    const ehMeuGol = evento.tipo === "gol" && evento.jogadorId === "player";
    return `<div class="cp-event cp-event-${info.classe}${ehMeuGol ? " cp-event-meugol" : ""}">
        <span class="cp-event-min">${minuto}'</span>
        <div class="cp-event-main">
            <span class="cp-event-badge cp-badge-${info.classe}">${ehMeuGol ? "⭐ " : ""}${info.badge}</span>
            <span class="cp-event-body">${textoLimpo}</span>
        </div>
        ${jog ? `<img loading="lazy" decoding="async" class="cp-event-avatar" src="${avatar}" alt="" onerror="this.style.visibility='hidden'">` : ""}
    </div>`;
}

// Card "modo simples" quando não há snapshot estruturado disponível (ex.:
// espectador de confronto direto online, que só recebe o texto do log via
// Firebase) — mantém a Central da Partida funcional mesmo sem os dados ricos.
function cpMontarCardFallback(log, minuto, nomeJogadorReal) {
    const textoLimpo = String(log || "").replace(/<[^>]*>/g, "").replace(/^\s*\d+'\s*/, "").trim();
    if (!textoLimpo) return "";
    const meuGol = /É SEU/i.test(textoLimpo) || (nomeJogadorReal && textoLimpo.includes(nomeJogadorReal) && /GOLO|GOL /i.test(textoLimpo));
    const substituicao = /SUBSTITUIÇÃO/i.test(textoLimpo);
    const golTime = !meuGol && !substituicao && /GOLO|GOL /i.test(textoLimpo);
    const classe = meuGol ? "meugol" : (substituicao ? "substituicao" : (golTime ? "gol" : "lance"));
    const badge = meuGol ? "⭐ GOL" : (substituicao ? "SUBSTITUIÇÃO" : (golTime ? "GOL" : "LANCE"));
    return `<div class="cp-event cp-event-${classe}">
        <span class="cp-event-min">${minuto}'</span>
        <div class="cp-event-main"><span class="cp-event-badge cp-badge-${classe}">${badge}</span><span class="cp-event-body">${textoLimpo}</span></div>
    </div>`;
}

function cpAtualizarStats(est) {
    const linhas = [
        ["posse", est.casa.posse, est.visita.posse, "%"],
        ["xg", (est.casa.xg || 0).toFixed(2), (est.visita.xg || 0).toFixed(2), ""],
        ["xa", (est.casa.xa || 0).toFixed(2), (est.visita.xa || 0).toFixed(2), ""],
        ["remates", est.casa.remates, est.visita.remates, ""],
        ["alvo", est.casa.alvo, est.visita.alvo, ""],
        ["area", est.casa.area, est.visita.area, ""],
        ["fora", est.casa.fora, est.visita.fora, ""],
        ["escanteios", est.casa.escanteios, est.visita.escanteios, ""],
        ["faltas", est.casa.faltas, est.visita.faltas, ""]
    ];
    linhas.forEach(([chave, valCasa, valVisita, sufixo]) => {
        const linha = document.querySelector(`#cpStats .cp-stat-row[data-cp-stat="${chave}"]`);
        if (!linha) return;
        const elC = linha.querySelector('[data-cp-val="casa"]'); if (elC) elC.textContent = `${valCasa}${sufixo}`;
        const elV = linha.querySelector('[data-cp-val="visita"]'); if (elV) elV.textContent = `${valVisita}${sufixo}`;
        const numC = parseFloat(valCasa) || 0, numV = parseFloat(valVisita) || 0;
        const totalNum = numC + numV;
        const pctCasa = totalNum > 0 ? Math.max(4, Math.min(96, (numC / totalNum) * 100)) : 50;
        const fillC = linha.querySelector('[data-cp-fill="casa"]'); if (fillC) fillC.style.width = pctCasa + "%";
        const fillV = linha.querySelector('[data-cp-fill="visita"]'); if (fillV) fillV.style.width = (100 - pctCasa) + "%";
    });
}

function cpAtualizarNotas(notas) {
    (notas || []).forEach(n => {
        const linha = document.querySelector(`.cp-row[data-cp-jid="${n.id}"]`);
        if (!linha) return;
        const notaEl = linha.querySelector("[data-cp-nota]");
        if (notaEl) {
            notaEl.textContent = n.nota.toFixed(1);
            notaEl.classList.remove("cp-nota-boa", "cp-nota-media", "cp-nota-ruim");
            notaEl.classList.add(n.nota >= 7 ? "cp-nota-boa" : (n.nota >= 6 ? "cp-nota-media" : "cp-nota-ruim"));
        }
        const condFill = linha.querySelector("[data-cp-cond]"); if (condFill) condFill.style.width = n.condicao + "%";
        const condTxt = linha.querySelector("[data-cp-cond-txt]"); if (condTxt) condTxt.textContent = n.condicao + "%";
        const condTrack = linha.querySelector(".cp-cond-track");
        if (condTrack) { condTrack.classList.remove("cp-cond-boa", "cp-cond-media", "cp-cond-baixa"); condTrack.classList.add(n.condicao >= 80 ? "cp-cond-boa" : (n.condicao >= 65 ? "cp-cond-media" : "cp-cond-baixa")); }
        const statusEl = linha.querySelector("[data-cp-status]");
        if (statusEl) statusEl.innerHTML = n.cartao === "vermelho" ? "🟥" : (n.cartao === "amarelo" ? "🟨" : "");
    });
}

// 🔄 Ponto único chamado a cada tick pelos três lugares que rodam partidas
// (Modo Jogador, Manager com motor real, Manager com replay). Atualiza o
// feed, as estatísticas e o elenco — tudo dentro de #uiConsolePartida.
window.atualizarCentralPartida = function(minuto, log, snapshot) {
    const lista = document.getElementById("cpEventosList");
    if (lista) {
        let cardHtml = "";
        if (snapshot?.evento) cardHtml = cpMontarCardEvento(snapshot.evento, minuto);
        else if (log && !snapshot) cardHtml = cpMontarCardFallback(log, minuto, typeof jogador !== "undefined" ? jogador?.nome : null);
        if (cardHtml) {
            lista.insertAdjacentHTML("afterbegin", cardHtml);
            while (lista.children.length > 60) lista.removeChild(lista.lastChild);
        }
    }
    if (snapshot?.estatisticas) cpAtualizarStats(snapshot.estatisticas);
    if (snapshot?.notas) cpAtualizarNotas(snapshot.notas);
};

window.prepararVisualizacaoPartida = function(nomeCasa = "Casa", nomeVisita = "Visita", clubeCasaId = null, clubeVisitaId = null) {
    const container = document.getElementById("matchVisualContainer");
    const toggle = document.getElementById("btnAlternarVisualPartida");
    if (!container || !toggle) return;
    // Guarda os clubes da partida em andamento para que o botão liga/desliga
    // visual (que só tem os nomes do placar à mão) consiga remontar a
    // escalação real ao reativar a transmissão no meio do jogo.
    if (clubeCasaId) window.partidaVisualClubes = { casa: clubeCasaId, visita: clubeVisitaId };
    clubeCasaId = clubeCasaId || window.partidaVisualClubes?.casa || null;
    clubeVisitaId = clubeVisitaId || window.partidaVisualClubes?.visita || null;
    atualizarControlesVisualPartida();
    container.classList.toggle("ativo", window.visualPartidaAtiva);

    // 🧩 Escalação real por posição (ver montarFormacaoVisual). Sem um clube
    // válido, cai de volta no layout genérico 4-3-3 de sempre.
    const slotsCasa = clubeCasaId ? montarFormacaoVisual(clubeCasaId, true) : POSICOES_VISUAIS_CASA.map(([x, y], i) => ({ x, y, pos: null, label: "", jogador: { nome: `${nomeCasa} ${i + 1}`, id: null } }));
    const slotsVisita = clubeVisitaId ? montarFormacaoVisual(clubeVisitaId, false) : POSICOES_VISUAIS_VISITA.map(([x, y], i) => ({ x, y, pos: null, label: "", jogador: { nome: `${nomeVisita} ${i + 1}`, id: null } }));

    // 📋 Central da Partida roda SEMPRE, ligado ou não o campo animado — é a
    // nova "simulação por texto" (substitui o antigo console simples). O
    // campo com a bola em movimento continua exatamente como estava.
    iniciarCentralPartida(nomeCasa, nomeVisita, clubeCasaId, clubeVisitaId, slotsCasa, slotsVisita);

    if (!window.visualPartidaAtiva) { container.innerHTML = ""; return; }

    // Guarda a posse e o placar anterior para descobrir qual lado marcou a
    // partir do callback real do MatchEngine, em vez de sortear um atacante.
    // 📊 estatisticas/ticksPosse alimentam a barra de posse e os contadores de
    // remates/escanteios, tudo derivado dos mesmos eventos que já chegam pelo
    // onTick — nenhum número extra é sorteado à parte do relato real.
    window.estadoVisualPartida = {
        posse: "casa", placarCasa: 0, placarVisita: 0, ultimoJogador: 7,
        nomes: { casa: nomeCasa, visita: nomeVisita },
        slotsCasa, slotsVisita,
        ticksPosseCasa: 0, ticksPosseTotal: 0,
        estatisticas: {
            casa: { remates: 0, alvo: 0, escanteios: 0 },
            visita: { remates: 0, alvo: 0, escanteios: 0 }
        },
        intervaloMostrado: false,
        // 🔄 TROCA DE LADOS: 1 = casa ataca para a direita (x=100) como hoje;
        // -1 = casa ataca para a esquerda (x=0), depois do intervalo. Tudo que
        // decide "pra que lado alguém ataca" (chute, cruzamento, escanteio,
        // avanço tático) lê esta flag em vez de assumir sempre o mesmo lado —
        // assim a troca de lados no intervalo (ver bloco do minuto 45 abaixo)
        // só precisa inverter ela + espelhar as posições atuais uma vez.
        direcaoCasa: 1,
        // 🌀 últimas posições da bola (rastro) e 📈 janela curta de posse (pressão)
        historicoBola: [{ x: 50, y: 50 }, { x: 50, y: 50 }, { x: 50, y: 50 }],
        janelaPosse: [],
        // 🎬 MOTOR DE ANIMAÇÃO — a bola nunca salta direto pro alvo: cada tick
        // gera uma SEQUÊNCIA de lances (recuperação → passe → passe → chute)
        // que entra numa fila e é consumida quadro a quadro pelo loop de
        // animação (ver iniciarLoopAnimacaoPartida), com todos os 22 jogadores
        // interpolando suavemente até o alvo tático de cada momento — nunca
        // parados, nunca teleportados.
        bola: { x: 50, y: 50, z: 0 },
        filaBola: [],
        faseAtual: null,
        posAtual: { casa: slotsCasa.map(s => ({ x: s.x, y: s.y })), visita: slotsVisita.map(s => ({ x: s.x, y: s.y })) },
        posAlvo: { casa: slotsCasa.map(s => ({ x: s.x, y: s.y })), visita: slotsVisita.map(s => ({ x: s.x, y: s.y })) },
        faseIdle: { casa: slotsCasa.map(() => Math.random() * Math.PI * 2), visita: slotsVisita.map(() => Math.random() * Math.PI * 2) },
        velocidade: 1, pausado: false, tempoAnterior: 0
    };
    container.innerHTML = `
    <div class="match-live-pitch" id="matchLivePitch">
        <span class="match-area match-area-esquerda"></span><span class="match-area match-area-direita"></span>
        <span class="match-small-area match-small-area-esquerda"></span><span class="match-small-area match-small-area-direita"></span>
        <span class="match-penalty-spot match-penalty-spot-esquerda"></span><span class="match-penalty-spot match-penalty-spot-direita"></span>
        <span class="match-goal-net match-goal-net-esquerda"></span><span class="match-goal-net match-goal-net-direita"></span>
        <span class="match-corner-arc tl"></span><span class="match-corner-arc bl"></span><span class="match-corner-arc tr"></span><span class="match-corner-arc br"></span>
        ${slotsCasa.map((p, i) => `<span class="match-live-token casa ${p.pos === "Goleiro" ? "goleiro" : ""}" data-team="casa" data-index="${i}" style="left:${p.x}%;top:${p.y}%" title="${p.jogador.nome}">${p.jogador.nome.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}</span>`).join("")}
        ${slotsVisita.map((p, i) => `<span class="match-live-token visita ${p.pos === "Goleiro" ? "goleiro" : ""}" data-team="visita" data-index="${i}" style="left:${p.x}%;top:${p.y}%" title="${p.jogador.nome}">${p.jogador.nome.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}</span>`).join("")}
        <span class="match-live-ball-trail" id="matchBallTrail3" data-n="3" style="left:50%;top:50%"></span>
        <span class="match-live-ball-trail" id="matchBallTrail2" data-n="2" style="left:50%;top:50%"></span>
        <span class="match-live-ball-trail" id="matchBallTrail1" data-n="1" style="left:50%;top:50%"></span>
        <span class="match-live-pass" id="matchLivePass"></span>
        <span class="match-live-ball-shadow" id="matchLiveBallShadow" style="left:50%;top:50%"></span>
        <span class="match-live-ball" id="matchLiveBall" style="left:50%;top:50%"></span>
        <div class="match-action-badge" id="matchActionBadge"></div>
        <div class="match-clash-effect" id="matchClashEffect"></div>
        <div class="match-replay-badge" id="matchReplayBadge">🔁 Replay</div>
        <div class="match-halftime-banner" id="matchHalftimeBanner"><strong>Intervalo</strong><span id="matchHalftimeScore">0 - 0</span></div>
        <div class="match-goal-scorer-card" id="matchGoalScorerCard"></div>
        <div class="match-goool-banner" id="matchGoolBanner"><strong>GOOOOL!</strong><span id="matchGoolPlacar">0 - 0</span></div>
        <div class="match-stoppage-banner" id="matchStoppageBanner"><strong id="matchStoppageIcon">🟦</strong><span id="matchStoppageTexto">Falta</span></div>
        <div class="match-sub-ticker" id="matchSubTicker"></div>
    </div><p class="match-live-caption" id="matchLiveCaption">A partida vai começar.</p>
    <div class="match-stats-bar" id="matchStatsBar">
        <div class="match-possession-row">
            <span class="lado-casa" id="matchPosseCasa">50%</span>
            <span class="match-possession-track"><span class="match-possession-fill-casa" id="matchPosseFillCasa" style="width:50%"></span><span class="match-possession-fill-visita" id="matchPosseFillVisita" style="width:50%"></span></span>
            <span class="lado-visita" id="matchPosseVisita">50%</span>
        </div>
        <div class="match-momentum-row">
            <span>Pressão</span>
            <span class="match-momentum-track"><span class="match-momentum-fill-casa" id="matchMomentumCasa" style="width:50%"></span><span class="match-momentum-fill-visita" id="matchMomentumVisita" style="width:50%"></span></span>
        </div>
        <div class="match-stats-grid">
            <span class="stat-casa" id="matchRematesCasa">0</span><span class="stat-label">Remates</span><span class="stat-visita" id="matchRematesVisita">0</span>
            <span class="stat-casa" id="matchAlvoCasa">0</span><span class="stat-label">No alvo</span><span class="stat-visita" id="matchAlvoVisita">0</span>
            <span class="stat-casa" id="matchEscanteiosCasa">0</span><span class="stat-label">Escanteios</span><span class="stat-visita" id="matchEscanteiosVisita">0</span>
        </div>
    </div>`;
    wireControlesVelocidadeVisualPartida();
    iniciarLoopAnimacaoPartida();
};

// 💬 Exibe selos de ação flutuante (Passe, Cruzamento, Dividida, Chute, Desarme) no campo
function mostrarBadgeAcao(rotulo, tipo = "") {
    const badge = document.getElementById("matchActionBadge");
    if (!badge || !rotulo) return;
    badge.textContent = rotulo;
    badge.className = `match-action-badge ${tipo} ativo`;
    clearTimeout(window._matchActionBadgeTimer);
    window._matchActionBadgeTimer = setTimeout(() => {
        if (badge) badge.classList.remove("ativo");
    }, 1400);
}

// 💥 Dispara onda de choque visual em divididas/desarmes
function dispararEfeitoChoque(x, y) {
    const clash = document.getElementById("matchClashEffect");
    if (!clash) return;
    clash.style.left = `${x}%`;
    clash.style.top = `${y}%`;
    clash.classList.remove("ativo");
    void clash.offsetWidth;
    clash.classList.add("ativo");
}

// 🎛️ Liga os botões de play/pause e 1x/2x/4x/8x ao motor em andamento
function wireControlesVelocidadeVisualPartida() {
    const barra = document.getElementById("matchSpeedControls");
    if (!barra || barra.dataset.wired) return;
    barra.dataset.wired = "1";
    barra.addEventListener("click", (e) => {
        const btnPlay = e.target.closest("#matchBtnPlayPause");
        if (btnPlay) {
            const tocando = btnPlay.dataset.playing === "1";
            if (tocando) {
                window.engineAoVivo?.pausar?.(); btnPlay.textContent = "▶"; btnPlay.dataset.playing = "0";
                if (window.estadoVisualPartida) window.estadoVisualPartida.pausado = true;
            } else {
                window.engineAoVivo?.retomar?.(); btnPlay.textContent = "⏸"; btnPlay.dataset.playing = "1";
                if (window.estadoVisualPartida) window.estadoVisualPartida.pausado = false;
            }
            return;
        }
        const btnVel = e.target.closest("[data-speed]");
        if (btnVel) {
            barra.querySelectorAll("[data-speed]").forEach(b => b.classList.toggle("ativo", b === btnVel));
            const v = Number(btnVel.dataset.speed) || 1;
            window.engineAoVivo?.definirVelocidade?.(v);
            if (window.estadoVisualPartida) window.estadoVisualPartida.velocidade = v;
        }
    });
}

// 🧭 Gera a SEQUÊNCIA de lances visuais: a bola sempre parte da posição REAL
// atual do jogador (posAtual) e vai diretamente até o companheiro de equipe,
// garantindo que passe a passe, condução e escanteio fiquem perfeitos.
function gerarSequenciaJogada(tipoEvento, eCasa, indiceFinalizador, slotsPos, slots, slotsDefPos = null, dirCasa = 1) {
    const passos = [];
    // 🔄 ataqueDir: +1 = time atacante empurra a jogada pra x=100, -1 = pra x=0.
    // Antes disto era sempre "eCasa ? 100 : 0" fixo — agora respeita a troca
    // de lados do intervalo (dirCasa vem do estado, ver prepararVisualizacaoPartida).
    const ataqueDir = eCasa ? dirCasa : -dirCasa;
    const golX = ataqueDir === 1 ? 96 : 4;   // posição X do gol adversário
    const golY = 50;

    const posJogador = (idx, atacante = true) => {
        const estado = window.estadoVisualPartida;
        if (!estado || idx < 0) return { x: 50, y: 50 };
        const timeKey = atacante ? (eCasa ? "casa" : "visita") : (eCasa ? "visita" : "casa");
        const p = estado.posAtual?.[timeKey]?.[idx];
        return p ? { x: p.x, y: p.y } : { x: 50, y: 50 };
    };

    const pickDef = () => 1 + Math.floor(Math.random() * 4);
    const pickMid = () => 5 + Math.floor(Math.random() * 3);
    const pickAtk = () => 8 + Math.floor(Math.random() * 3);
    const pickWing = () => Math.random() < 0.5 ? 1 : 4;
    const pickOppDef = () => 1 + Math.floor(Math.random() * 4);
    const pickOppMid = () => 5 + Math.floor(Math.random() * 3);

    const DUR_CONDUCAO   = 460;
    const DUR_PASSE      = 440;
    const DUR_CRUZAMENTO = 600;
    const DUR_CHUTE      = 320;
    const DUR_DIVIDIDA   = 420;
    const DUR_REBOTE     = 400;

    const distanciaPontos = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    // Condução: a bola desliza junta ao pé do jogador
    const conducao = (idx, rotulo = "⚡ CONDUÇÃO", duracao = DUR_CONDUCAO) => {
        const p = posJogador(idx, true);
        return { x: p.x, y: p.y, indice: idx, duracaoMs: duracao, tipo: "conducao", rotulo };
    };

    // Passe: a bola vai do passador direto até a posição real do companheiro.
    // 🏃 FÍSICA DO PASSE: a duração não é mais fixa — escala com a distância
    // real entre quem passa e quem recebe, senão um passe curto de 2 metros
    // "flutuava" devagar e um lançamento de 40 metros parecia teleporte.
    // ~55% do tempo é reação/preparo (sempre existe, mesmo num passe curto),
    // o resto cresce com a distância percorrida pela bola.
    const passe = (fromIdx, toIdx, rotulo = "🎯 PASSE", duracaoBase = DUR_PASSE) => {
        const pFrom = posJogador(fromIdx, true);
        const pTarget = posJogador(toIdx, true);
        const dist = distanciaPontos(pFrom, pTarget);
        const duracaoMs = Math.round(duracaoBase * 0.55 + duracaoBase * 0.95 * Math.min(1.7, dist / 30));
        return { x: pTarget.x, y: pTarget.y, indice: toIdx, duracaoMs, tipo: "passe", rotulo };
    };

    // Cruzamento: curva em parábola suave para a grande área
    const cruzamento = (idx, targetX, targetY) => {
        const pFrom = posJogador(idx, true);
        const dist = distanciaPontos(pFrom, { x: targetX, y: targetY });
        const duracaoMs = Math.round(DUR_CRUZAMENTO * 0.7 + DUR_CRUZAMENTO * 0.6 * Math.min(1.4, dist / 40));
        return { x: targetX, y: targetY, indice: idx, duracaoMs,
                 tipo: "cruzamento", rotulo: "✈️ CRUZAMENTO", arco: true };
    };

    // Chute ao gol
    const chute = (idx, rotulo = "💥 CHUTAÇO!") => {
        const jitterGol = (Math.random() - 0.5) * 10;
        return { x: golX, y: golY + jitterGol, indice: idx, duracaoMs: DUR_CHUTE,
                 tipo: "chute", rotulo, remate: true };
    };

    const cabeceio = (idx) => {
        const jitterGol = (Math.random() - 0.5) * 8;
        return { x: golX, y: golY + jitterGol, indice: idx, duracaoMs: DUR_CHUTE,
                 tipo: "cabeceio", rotulo: "🗣️ CABECEIO!", remate: true };
    };

    const dividida = (idxAtacante, idxDefensor, rotulo = "⚔️ DIVIDIDA!") => {
        const pA = posJogador(idxAtacante, true);
        const pD = posJogador(idxDefensor, false);
        return { x: (pA.x + pD.x) / 2, y: (pA.y + pD.y) / 2, indice: idxAtacante,
                 defensorIndice: idxDefensor, duracaoMs: DUR_DIVIDIDA, tipo: "dividida",
                 rotulo, choque: true };
    };

    const desarme = (idxAtacante, idxDefensor) => {
        const pA = posJogador(idxAtacante, true);
        const pD = posJogador(idxDefensor, false);
        return { x: (pA.x + pD.x) / 2, y: (pA.y + pD.y) / 2, indice: idxAtacante,
                 defensorIndice: idxDefensor, duracaoMs: DUR_DIVIDIDA, tipo: "desarme",
                 rotulo: "🛡️ DESARME!", choque: true, mudarPosse: true };
    };

    if (tipoEvento === "golo") {
        const modoGol = Math.floor(Math.random() * 3);
        const d = pickDef(), m = pickMid(), a = (indiceFinalizador >= 0 ? indiceFinalizador : pickAtk());

        if (modoGol === 0) {
            // Construção 1: Passe Zagueiro -> Meia -> Condução -> Passe Filtrado -> Gol
            passos.push(passe(d, m, "🎯 SAÍDA DE BOLA"));
            passos.push(conducao(m, "⚡ ARRANCADA"));
            passos.push(passe(m, a, "📐 PASSE FILTRADO"));
            passos.push(conducao(a, "🏃 DOMÍNIO"));
            const chuteP = chute(a, "💥 CHUTAÇO!");
            chuteP.evento = "golo";
            passos.push(chuteP);

        } else if (modoGol === 1) {
            // Construção 2: Jogada de Ponta -> Cruzamento -> Cabeceio -> Gol
            const w = pickWing();
            passos.push(passe(m, w, "📐 LANÇAMENTO NA PONTA"));
            passos.push(conducao(w, "⚡ ARRANCADA NA FLANCA"));
            passos.push(cruzamento(w, ataqueDir === 1 ? 86 : 14, 50));
            const cab = cabeceio(a);
            cab.evento = "golo";
            passos.push(cab);

        } else {
            // Construção 3: Troca de passes curta -> Chute de longe -> Gol
            const m1 = pickMid(), m2 = pickMid() !== m1 ? pickMid() : pickAtk();
            passos.push(passe(d, m1, "🎯 PASSE CURTO"));
            passos.push(conducao(m1, "⚡ CONDUÇÃO"));
            passos.push(passe(m1, m2, "📐 TABELA"));
            passos.push(conducao(m2, "🏃 AJEITOU"));
            const chuteP = chute(m2, "🚀 FOGUETE!");
            chuteP.evento = "golo";
            passos.push(chuteP);
        }

    } else if (tipoEvento === "defesa" || tipoEvento === "trave") {
        const m = pickMid(), a = (indiceFinalizador >= 0 ? indiceFinalizador : pickAtk()), od = pickOppDef();
        passos.push(passe(m, a, "🎯 PASSE NA ÁREA"));
        passos.push(conducao(a, "⚡ DOMÍNIO E CHUTE"));
        const chuteP = chute(a, "💥 CHUTE FORTE");
        chuteP.evento = tipoEvento;
        passos.push(chuteP);
        passos.push({ x: 50 - ataqueDir * 14, y: 50 + (Math.random() * 20 - 10),
                       indice: -1, duracaoMs: DUR_REBOTE, tipo: "rebote", rotulo: "🧤 DEFESA / REBOTE", evento: "rebote" });

    } else if (tipoEvento === "escanteio") {
        // 🚩 ESCANTEIO REAL: Coloca o cobrador exatamente na bandeira de escanteio
        const estado = window.estadoVisualPartida;
        const w = pickWing(), a = (indiceFinalizador >= 0 ? indiceFinalizador : pickAtk());
        const timeKey = eCasa ? "casa" : "visita";
        const cantoX = ataqueDir === 1 ? 96 : 4;
        const cantoY = Math.random() < 0.5 ? 10 : 90;

        if (estado && estado.posAtual?.[timeKey]?.[w]) {
            estado.posAtual[timeKey][w] = { x: cantoX, y: cantoY };
            estado.posAlvo[timeKey][w] = { x: cantoX, y: cantoY };
            estado.bola = { x: cantoX, y: cantoY, z: 0 };
        }

        // Cobrança em curva da bandeira de escanteio para a grande área
        passos.push({ x: cantoX, y: cantoY, indice: w, duracaoMs: 350, tipo: "conducao", rotulo: "🚩 ESCANTEIO" });
        passos.push(cruzamento(w, ataqueDir === 1 ? 86 : 14, 50));
        passos.push(cabeceio(a));

    } else if (tipoEvento === "falta" || tipoEvento === "impedimento" || tipoEvento === "cartao") {
        const d = pickDef(), m = pickMid(), od = pickOppMid();
        passos.push(passe(d, m, "🎯 PASSE"));
        passos.push(conducao(m, "⚡ CONDUÇÃO"));
        const div = dividida(m, od, "⚔️ FALTOSA DIVIDIDA!");
        div.evento = tipoEvento;
        passos.push(div);

    } else if (tipoEvento === "penalti") {
        const m = pickMid(), a = (indiceFinalizador >= 0 ? indiceFinalizador : pickAtk()), od = pickOppDef();
        passos.push(passe(m, a, "🎯 PASSE NA ÁREA"));
        passos.push(dividida(a, od, "⚽ FALTA NA ÁREA!"));
        passos.push({ x: eCasa ? 88 : 12, y: 50, indice: a, duracaoMs: 500, tipo: "chute", rotulo: "⚽ CHUTE PÊNALTI", evento: "penalti", remate: true });

    } else {
        // 🤝 JOGO NORMAL (Ambiente): Troca de passes realista, fluida e encadeada
        const variante = Math.floor(Math.random() * 3);
        const d = pickDef(), m = pickMid(), a = pickAtk(), w = pickWing(), om = pickOppMid();

        if (variante === 0) {
            // Passe Zagueiro -> Meia -> Condução -> Passe Atacante
            passos.push(passe(d, m, "🎯 PASSE"));
            passos.push(conducao(m, "⚡ CONDUÇÃO"));
            passos.push(passe(m, a, "🎯 PASSE CURTO"));

        } else if (variante === 1) {
            // Passe -> Ponta Conduz -> Passe de lado
            passos.push(passe(d, w, "📐 PASSE NA PONTA"));
            passos.push(conducao(w, "⚡ ARRANCADA"));
            passos.push(passe(w, a, "🎯 PASSE DE LADO"));

        } else {
            // Meia conduz -> Dividida -> Passe de apoio
            passos.push(passe(d, m, "🎯 PASSE"));
            passos.push(conducao(m, "⚡ CONDUÇÃO"));
            passos.push(dividida(m, om, "⚔️ DIVIDIDA"));
        }
    }
    return passos;
}

// ⏱️ Easing framerate-independente — constante de tempo mais ALTA = movimento
// mais suave e gradual. O cap em 0.12 impede que k fique alto demais e cause
// saltos em frames com dt grande.
function aproximar(atual, alvo, dt, velocidadeMs) {
    const k = 1 - Math.exp(-dt / Math.max(velocidadeMs, 120));
    return atual + (alvo - atual) * Math.min(k, 0.12);
}

// ==========================================
// 🥅 MINIGAME INTERATIVO DE PÊNALTI (MODO JOGADOR)
// ==========================================
window.abrirMinigamePenalti = function(dados = {}, callback) {
    const modal = document.getElementById("modalPenaltiMinigame");
    if (!modal) {
        if (typeof callback === "function") callback({ gol: Math.random() < 0.75 });
        return;
    }

    const ehGoleiro = dados.ehGoleiro ?? (window.jogador && window.jogador.posicao === "Goleiro");
    const forcaRival = dados.forcaRival ?? 70;
    const cobradorNome = dados.cobradorNome || (ehGoleiro ? "Atacante Adversário" : (window.jogador?.nome || "Você"));
    const goleiroNome = dados.goleiroNome || (ehGoleiro ? (window.jogador?.nome || "Você") : "Goleiro Adversário");
    
    document.getElementById("penaltiTitulo").textContent = ehGoleiro ? "🧤 DEFESA DE PÊNALTI!" : "⚽ PÊNALTI DECISIVO!";
    document.getElementById("penaltiSubtitulo").textContent = ehGoleiro 
        ? `${cobradorNome} vai para a cobrança! Escolha o canto para saltar e defender!` 
        : `${cobradorNome} contra ${goleiroNome}. Escolha o canto e acerte o tempo de força!`;

    const kickerCtrls = document.getElementById("penaltiKickerControls");
    const keeperCtrls = document.getElementById("penaltiKeeperControls");
    const overlay = document.getElementById("penaltiResultOverlay");
    const reticle = document.getElementById("penaltiTargetReticle");
    const ball = document.getElementById("penaltiBall");
    const keeper = document.getElementById("penaltiGoalkeeper");
    const indicator = document.getElementById("penaltiPowerIndicator");

    overlay.classList.remove("ativo");
    ball.style.bottom = "24px";
    ball.style.left = "50%";
    keeper.style.left = "50%";
    keeper.style.transform = "translateX(-50%)";

    modal.classList.remove("oculto");

    let cantoSelecionado = "center";
    let defesaSelecionada = "center";
    let powerDirection = 1;
    let powerVal = 0;
    let powerInterval = null;

    if (ehGoleiro) {
        kickerCtrls.classList.add("oculto");
        keeperCtrls.classList.remove("oculto");
        reticle.style.display = "none";

        keeperCtrls.querySelectorAll(".btn-canto-gk").forEach(btn => {
            btn.onclick = () => {
                keeperCtrls.querySelectorAll(".btn-canto-gk").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                defesaSelecionada = btn.dataset.defesa;
            };
        });

        document.getElementById("btnDefenderPenalti").onclick = () => {
            finalizarPenalti(ehGoleiro, cantoSelecionado, defesaSelecionada, powerVal, callback);
        };
    } else {
        kickerCtrls.classList.remove("oculto");
        keeperCtrls.classList.add("oculto");
        reticle.style.display = "block";

        kickerCtrls.querySelectorAll(".btn-canto").forEach(btn => {
            btn.onclick = () => {
                kickerCtrls.querySelectorAll(".btn-canto").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                cantoSelecionado = btn.dataset.canto;
                posicionarMira(cantoSelecionado);
            };
        });

        posicionarMira(cantoSelecionado);

        // Barra de força animada
        clearInterval(powerInterval);
        powerVal = 0;
        powerInterval = setInterval(() => {
            powerVal += powerDirection * 3;
            if (powerVal >= 100) { powerVal = 100; powerDirection = -1; }
            if (powerVal <= 0) { powerVal = 0; powerDirection = 1; }
            if (indicator) indicator.style.left = `${powerVal}%`;
        }, 20);

        document.getElementById("btnChutarPenalti").onclick = () => {
            clearInterval(powerInterval);
            finalizarPenalti(ehGoleiro, cantoSelecionado, defesaSelecionada, powerVal, callback);
        };
    }

    function posicionarMira(canto) {
        const coords = {
            "top-left": { left: "20%", top: "25%" },
            "low-left": { left: "22%", top: "50%" },
            "center": { left: "50%", top: "40%" },
            "low-right": { left: "78%", top: "50%" },
            "top-right": { left: "80%", top: "25%" }
        };
        const pos = coords[canto] || coords["center"];
        reticle.style.left = pos.left;
        reticle.style.top = pos.top;
    }

    function finalizarPenalti(souGoleiro, cantoChute, cantoSalto, forca, cb) {
        let ehGol = false;
        let desc = "";

        if (souGoleiro) {
            // 🧤 Você é o goleiro: Reflexos/Reação (reflexos), Posicionamento
            // (reposição), Elasticidade (velocidade) e Defesa de Pênaltis
            // (defesa) definem tanto a chance de "ler" o canto quanto a
            // chance de ainda assim alcançar a bola quando adivinha errado.
            const notaGoleiro = notaPenaltiDefesa(window.jogador);
            const cantosPossiveis = ["top-left", "low-left", "center", "low-right", "top-right"];
            cantoChute = cantosPossiveis[Math.floor(Math.random() * cantosPossiveis.length)];

            const chanceAcertarCanto = Math.max(0.18, Math.min(0.62, 0.30 + (notaGoleiro - 65) * 0.006));
            const acertouLado = cantoSalto === cantoChute;
            let chanceDefender;
            if (acertouLado) {
                chanceDefender = Math.max(0.45, Math.min(0.93, 0.75 + (notaGoleiro - 65) * 0.005 - Math.max(0, forcaRival - 70) * 0.004));
            } else {
                chanceDefender = Math.max(0.03, Math.min(0.30, 0.08 + (notaGoleiro - 65) * 0.004));
            }
            const defendeu = Math.random() < chanceDefender;
            ehGol = !defendeu;
            desc = defendeu
                ? (acertouLado ? "Defesaça espetacular! Você leu o canto e salvou o time!" : "Reflexo incrível! Alcançou uma bola que não era pro seu lado!")
                : "Gol do adversário! Chute preciso no canto.";
            void chanceAcertarCanto; // usada só para calibrar o quão previsível é o cobrador rival (mantida pra leitura do código)
            moverComponentesAnimacao(cantoChute, cantoSalto);
        } else {
            // 🎯 Você é o cobrador: Pênaltis/Finalização (finalizacao),
            // Compostura (inteligência) e Moral formam a nota da cobrança —
            // o goleiro rival "lê" o canto com chance ligada à força do time
            // adversário (forcaRival), e mesmo acertando o lado uma cobrança
            // de alto nível ainda tem chance real de vencer o goleiro.
            const notaCobranca = notaPenaltiCobranca({ ...window.jogador, isMe: true });
            const idealForca = forca >= 35 && forca <= 65;
            const muitoForte = forca > 85;

            const cantosSaltoAi = ["top-left", "low-left", "center", "low-right", "top-right"];
            const chanceRivalAcertarCanto = Math.max(0.20, Math.min(0.55, 0.30 + Math.max(0, forcaRival - 70) * 0.006));
            const acertouCanto = Math.random() < chanceRivalAcertarCanto;
            cantoSalto = acertouCanto ? cantoChute : cantosSaltoAi[Math.floor(Math.random() * cantosSaltoAi.length)];

            if (muitoForte && Math.random() < 0.6) {
                ehGol = false;
                desc = "Isolou! Chute forte demais subiu por cima do travessão!";
            } else if (cantoSalto === cantoChute && Math.random() < Math.max(0.10, 0.65 - (notaCobranca - 65) * 0.006)) {
                ehGol = false;
                desc = "Defendeu o goleiro! Ele adivinhou o canto!";
            } else {
                ehGol = true;
                desc = idealForca ? "GOLAÇO! Cobrança no ângulo sem chance!" : "GOL! Bola no fundo das redes!";
            }

            moverComponentesAnimacao(cantoChute, cantoSalto);
        }

        setTimeout(() => {
            const titleEl = document.getElementById("penaltiResultTitle");
            const descEl = document.getElementById("penaltiResultDesc");
            if (titleEl) titleEl.textContent = ehGol ? "⚽ GOOOOL!" : "🛑 DEFESA / FORA!";
            if (descEl) descEl.textContent = desc;
            overlay.classList.add("ativo");

            setTimeout(() => {
                modal.classList.add("oculto");
                overlay.classList.remove("ativo");
                if (typeof cb === "function") cb({ gol: ehGol, descricao: desc });
            }, 2200);
        }, 600);
    }

    function moverComponentesAnimacao(chute, salto) {
        const coordsGoal = {
            "top-left": { ballX: "22%", ballY: "25%", gkX: "25%" },
            "low-left": { ballX: "24%", ballY: "48%", gkX: "28%" },
            "center": { ballX: "50%", ballY: "40%", gkX: "50%" },
            "low-right": { ballX: "76%", ballY: "48%", gkX: "72%" },
            "top-right": { ballX: "78%", ballY: "25%", gkX: "75%" }
        };
        const targetBall = coordsGoal[chute] || coordsGoal["center"];
        const targetGk = coordsGoal[salto] || coordsGoal["center"];

        ball.style.left = targetBall.ballX;
        ball.style.bottom = targetBall.ballY;
        keeper.style.left = targetGk.gkX;
    }
};

// 🎬 LOOP DE ANIMAÇÃO — reescrito para fluidez. Cada passe da fila é consumido
// um de cada vez com easing suave (ease-in-out cúbico). Os jogadores se movem
// com constantes de tempo ALTAS (~800ms) para nunca parecerem teletransportar.
// A oscilação idle é mínima (±0.6%) para dar vida sem causar vibração visual.
function iniciarLoopAnimacaoPartida() {
    if (window._matchRafHandle) cancelAnimationFrame(window._matchRafHandle);
    const frame = (ts) => {
        window._matchRafHandle = requestAnimationFrame(frame);
        const estado = window.estadoVisualPartida;
        if (!estado || !window.visualPartidaAtiva) return;
        if (!estado.tempoAnterior) estado.tempoAnterior = ts;
        let dt = ts - estado.tempoAnterior;
        estado.tempoAnterior = ts;
        dt = Math.min(dt, 50); // teto baixo evita saltos ao trocar de aba
        if (estado.pausado) dt = 0;
        const vel = estado.pausado ? 0 : (estado.velocidade || 1);

        // 🥅 Avança a fila de lances UM DE CADA VEZ
        if (vel > 0 && !estado.faseAtual && estado.filaBola.length) {
            const proximo = estado.filaBola.shift();
            estado.faseAtual = {
                ...proximo,
                inicio: { x: estado.bola.x, y: estado.bola.y },
                decorrido: 0,
                duracaoMs: Math.max(240, proximo.duracaoMs / vel)
            };
            if (proximo.rotulo && !proximo.silencioso) {
                mostrarBadgeAcao(proximo.rotulo, proximo.tipo);
            }
        }
        if (vel > 0 && estado.faseAtual) {
            const fase = estado.faseAtual;
            fase.decorrido += dt;
            const t = Math.min(1, fase.decorrido / fase.duracaoMs);
            const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            if (fase.tipo === "conducao" || fase.tipo === "drible") {
                // ⚽ A bola fica colada exatamente ao pé do jogador que está conduzindo!
                const timeKey = estado.posse;
                const pToken = estado.posAtual[timeKey]?.[fase.indice];
                if (pToken) {
                    const dirX = (estado.posse === "casa" ? 1.6 : -1.6);
                    estado.bola.x = Math.max(3, Math.min(97, pToken.x + dirX));
                    estado.bola.y = Math.max(6, Math.min(94, pToken.y));
                }
            } else {
                estado.bola.x = fase.inicio.x + (fase.x - fase.inicio.x) * eased;
                estado.bola.y = fase.inicio.y + (fase.y - fase.inicio.y) * eased;
            }

            if (fase.arco) {
                // Parábola suave para cruzamentos (teto de 14px para não voar para fora do campo)
                estado.bola.z = Math.sin(t * Math.PI) * 14;
            } else if (fase.tipo === "passe") {
                // 🎯 Passe raso também ganha uma leve "levantada" física — bem
                // sutil pra passe curto, um pouco mais alta pra lançamento longo
                // (a duração já escala com a distância, então reaproveitamos ela
                // como referência em vez de recalcular a distância aqui).
                estado.bola.z = Math.sin(t * Math.PI) * Math.min(6, fase.duracaoMs / 90);
            } else {
                estado.bola.z = 0;
            }

            if (t >= 1) {
                if (fase.tipo !== "conducao" && fase.tipo !== "drible") {
                    estado.bola.x = fase.x;
                    estado.bola.y = fase.y;
                }
                estado.bola.z = 0;
                if (fase.choque) {
                    dispararEfeitoChoque(fase.x, fase.y);
                }
                if (fase.mudarPosse) {
                    estado.posse = estado.posse === "casa" ? "visita" : "casa";
                }
                if (typeof fase.aoChegar === "function" && !fase.silencioso) fase.aoChegar();
                estado.faseAtual = null;
            }
        }

        // 🧠 Movimentação suave dos 22 jogadores
        const donoTime = estado.faseAtual?.indice >= 0 ? (estado.posse === "casa" ? "casa" : "visita") : null;
        ["casa", "visita"].forEach(time => {
            const slots = time === "casa" ? estado.slotsCasa : estado.slotsVisita;
            const posAtual = estado.posAtual[time], posAlvo = estado.posAlvo[time], faseIdle = estado.faseIdle[time];
            const temPosse = estado.posse === time;

            slots.forEach((slot, i) => {
                let alvoX = posAlvo[i].x, alvoY = posAlvo[i].y;
                const fase = estado.faseAtual;
                const ehPortador = donoTime === time && fase?.indice === i;
                const ehDefensorDividida = fase && !temPosse && fase.defensorIndice === i && (fase.tipo === "dividida" || fase.tipo === "desarme");

                if (ehPortador) {
                    // O portador avança pela lateral/centro no ataque
                    const avancoConducao = (time === "casa" ? 1 : -1) * (estado.direcaoCasa || 1) * 5;
                    alvoX = Math.max(6, Math.min(94, posAlvo[i].x + avancoConducao));
                    alvoY = posAlvo[i].y;
                } else if (ehDefensorDividida) {
                    alvoX = fase.x;
                    alvoY = fase.y;
                } else if (slot.pos === "Goleiro") {
                    if (fase?.remate || fase?.tipo === "chute" || fase?.tipo === "cabeceio") {
                        const golAmeacado = (time === "casa" && !eDonoCasaAtacando(estado)) || (time === "visita" && eDonoCasaAtacando(estado));
                        if (golAmeacado) alvoY = alvoY * 0.4 + estado.bola.y * 0.6;
                    }
                } else {
                    const dirAtaqueTime = (time === "casa" ? 1 : -1) * (estado.direcaoCasa || 1);
                    if (temPosse) {
                        const avanco = dirAtaqueTime * 3.5;
                        if (slot.pos === "Atacante" || slot.pos === "Ponta") {
                            alvoX += avanco * 1.3;
                        } else if (slot.pos === "Meio-Campista" || slot.pos === "Meia Ofensivo") {
                            alvoX += avanco * 0.8;
                        }
                    } else {
                        const recuo = dirAtaqueTime * -3.5;
                        if (slot.pos === "Zagueiro" || slot.pos === "Volante") {
                            alvoX += recuo * 1.0;
                            alvoY = (alvoY * 0.8) + (estado.bola.y * 0.2);
                        }
                    }
                }

                const tTime = performance.now() / 1000;
                const idleX = Math.sin(tTime * 0.35 + faseIdle[i]) * 0.6;
                const idleY = Math.cos(tTime * 0.3 + faseIdle[i] * 1.2) * 0.6;
                const velocidadeAprox = (ehPortador || ehDefensorDividida) ? 260 : 750;
                const limiteXFinal = slot.pos === "Goleiro" ? [3, 97] : [6, 94];
                posAtual[i].x = aproximar(posAtual[i].x, Math.max(limiteXFinal[0], Math.min(limiteXFinal[1], alvoX + idleX)), dt, velocidadeAprox / Math.max(1, vel));
                posAtual[i].y = aproximar(posAtual[i].y, Math.max(6, Math.min(94, alvoY + idleY)), dt, velocidadeAprox / Math.max(1, vel));
            });
        });

        renderizarQuadroPartida();
    };
    window._matchRafHandle = requestAnimationFrame(frame);
}
function eDonoCasaAtacando(estado) { return estado.posse === "casa"; }

function renderizarQuadroPartida() {
    const estado = window.estadoVisualPartida;
    const pitch = document.getElementById("matchLivePitch");
    const ball = document.getElementById("matchLiveBall");
    const ballShadow = document.getElementById("matchLiveBallShadow");
    if (!estado || !pitch || !ball) return;

    const fase = estado.faseAtual;
    const z = estado.bola.z || 0;

    ball.style.left = `${estado.bola.x}%`;
    ball.style.top = `${estado.bola.y}%`;
    ball.style.transform = `translate(-50%, -50%) translateY(${-z}px) scale(${1 + z / 35})`;

    if (ballShadow) {
        ballShadow.style.left = `${estado.bola.x}%`;
        ballShadow.style.top = `${estado.bola.y}%`;
        ballShadow.style.transform = `translate(-50%, -50%) scale(${1 + z / 25})`;
        ballShadow.style.opacity = `${Math.max(0.12, 0.55 - z / 50)}`;
    }

    ["casa", "visita"].forEach(time => {
        const posAtual = estado.posAtual[time];
        const temPosse = estado.posse === time;
        pitch.querySelectorAll(`.match-live-token[data-team="${time}"]`).forEach(token => {
            const i = Number(token.dataset.index);
            const p = posAtual[i];
            if (!p) return;
            token.style.left = `${p.x}%`; token.style.top = `${p.y}%`;

            const ehPortador = fase && fase.indice === i && temPosse;
            const ehDefensorDividida = fase && fase.defensorIndice === i && !temPosse && (fase.tipo === "dividida" || fase.tipo === "desarme");
            const ehGoleiroMergulho = token.classList.contains("goleiro") && fase && (fase.tipo === "chute" || fase.tipo === "cabeceio" || fase.remate);

            token.classList.toggle("em-acao", ehPortador || ehDefensorDividida);
            token.classList.toggle("com-bola", ehPortador);
            token.classList.toggle("conduzindo", ehPortador && (fase?.tipo === "conducao" || fase?.tipo === "drible"));
            token.classList.toggle("dividida", ehPortador || ehDefensorDividida);
            token.classList.toggle("mergulho", ehGoleiroMergulho);
        });
    });

    estado.historicoBola.unshift({ x: estado.bola.x, y: estado.bola.y });
    estado.historicoBola = estado.historicoBola.slice(0, 9);
    [1, 2, 3].forEach(n => {
        const dot = document.getElementById(`matchBallTrail${n}`);
        const pos = estado.historicoBola[n * 2] || estado.historicoBola[estado.historicoBola.length - 1];
        if (dot && pos) { dot.style.left = `${pos.x}%`; dot.style.top = `${pos.y}%`; }
    });
    const linhaPasse = document.getElementById("matchLivePass");
    if (linhaPasse && fase && (fase.tipo === "passe" || fase.tipo === "cruzamento")) {
        const dx = estado.bola.x - fase.inicio.x, dy = estado.bola.y - fase.inicio.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 2) {
            linhaPasse.style.width = `${dist}%`;
            linhaPasse.style.left = `${fase.inicio.x}%`; linhaPasse.style.top = `${fase.inicio.y}%`;
            linhaPasse.style.transform = `rotate(${Math.atan2(dy, dx) * 180 / Math.PI}deg)`;
            linhaPasse.style.opacity = "1";
        } else {
            linhaPasse.style.opacity = "0";
        }
    } else if (linhaPasse) { linhaPasse.style.opacity = "0"; }
}

window.atualizarVisualizacaoPartida = function(minuto, evento = "", golsCasa = 0, golsVisita = 0) {
    if (!window.visualPartidaAtiva) return;
    const pitch = document.getElementById("matchLivePitch");
    const caption = document.getElementById("matchLiveCaption");
    const estado = window.estadoVisualPartida;
    if (!pitch || !estado) return;
    const texto = evento.replace(/<[^>]*>/g, "").trim();
    const golCasa = golsCasa > estado.placarCasa;
    const golVisita = golsVisita > estado.placarVisita;
    if (golCasa) estado.posse = "casa";
    else if (golVisita) estado.posse = "visita";
    else if (/RECUPERA|ROUBA|DEFESA|CORTA|PERDE A BOLA/i.test(texto)) estado.posse = estado.posse === "casa" ? "visita" : "casa";
    else if (texto.toUpperCase().includes(estado.nomes.visita.toUpperCase())) estado.posse = "visita";
    else if (texto.toUpperCase().includes(estado.nomes.casa.toUpperCase())) estado.posse = "casa";

    const mostrarBannerParada = (icone, mensagem, duracaoMs = 1500) => {
        const banner = document.getElementById("matchStoppageBanner");
        if (!banner) return;
        const iconEl = document.getElementById("matchStoppageIcon");
        const textoEl = document.getElementById("matchStoppageTexto");
        if (iconEl) iconEl.textContent = icone;
        if (textoEl) textoEl.textContent = mensagem;
        banner.classList.remove("ativo"); void banner.offsetWidth; banner.classList.add("ativo");
        clearTimeout(window._matchStoppageTimer);
        window._matchStoppageTimer = setTimeout(() => banner.classList.remove("ativo"), duracaoMs);
    };
    if (/SUBSTITUI/i.test(texto)) {
        const ticker = document.getElementById("matchSubTicker");
        if (ticker) {
            ticker.textContent = `🔄 ${texto.replace(/^.*SUBSTITUIÇÃO NO [^:]*:\s*/i, "").trim() || "Substituição"}`;
            ticker.classList.remove("ativo"); void ticker.offsetWidth; ticker.classList.add("ativo");
            clearTimeout(window._matchSubTimer);
            window._matchSubTimer = setTimeout(() => ticker.classList.remove("ativo"), 2400);
        }
    } else if (/IMPEDIMENTO/i.test(texto)) {
        mostrarBannerParada("🚩", "Impedimento assinalado", 1500);
    } else if (/ATENDIMENTO M[ÉE]DICO/i.test(texto)) {
        mostrarBannerParada("🩹", "Pausa para atendimento médico", 1800);
    } else if (/PÊNALTI|PENALTI/i.test(texto)) {
        mostrarBannerParada("⚽", "Pênalti marcado!", 2000);
        if (window.gameMode === "jogador" && window.jogador) {
            const ehGoleiro = window.jogador.posicao === "Goleiro";
            const temAtributoPenalti = (window.jogador.atributos?.penaltis || window.jogador.geral || 60) >= 65;
            if (ehGoleiro || temAtributoPenalti) {
                window.engineAoVivo?.pausar?.();
                window.abrirMinigamePenalti({ ehGoleiro }, () => {
                    window.engineAoVivo?.retomar?.();
                });
            }
        }
    } else if (/\bFALTA\b/i.test(texto) && !/CART[ÃA]O/i.test(texto)) {
        mostrarBannerParada("🟦", "Falta marcada", 1300);
    } else if (/ESCANTEIO/i.test(texto)) {
        mostrarBannerParada("🚩", "Escanteio", 1200);
    }

    let textoVisual = texto;
    if (!textoVisual) {
        const fase = Math.floor(minuto / 6) % 4;
        if (fase === 0) estado.posse = estado.posse === "casa" ? "visita" : "casa";
        textoVisual = ["saída de bola organizada", "troca passes pelo meio", "avança pelas laterais", "procura espaço no último terço"][fase];
    }

    const eCasa = estado.posse === "casa";
    const eFinalizacao = golCasa || golVisita || /GOLO|GOL|CHUTE|FINALIZA|DEFESA/i.test(textoVisual);
    const eAtaque = eFinalizacao || /ATAQUE|CRUZA|PASSE|AVANÇA|PROCURA/i.test(textoVisual);

    estado.ticksPosseTotal++;
    if (eCasa) estado.ticksPosseCasa++;
    const eEscanteio = /ESCANTEIO|CANTO/i.test(textoVisual);
    const eNoAlvo = golCasa || golVisita || /DEFESA|DEFESAÇA/i.test(textoVisual);
    const eRemate = eNoAlvo || /TRAVE|CHUTE|FINALIZA|REMATE/i.test(textoVisual);
    const statsLado = estado.estatisticas[estado.posse];
    if (statsLado) {
        if (eEscanteio) statsLado.escanteios++;
        if (eRemate) statsLado.remates++;
        if (eNoAlvo) statsLado.alvo++;
    }
    estado.janelaPosse.push(estado.posse);
    if (estado.janelaPosse.length > 6) estado.janelaPosse.shift();
    const pctMomentumCasa = Math.round((estado.janelaPosse.filter(p => p === "casa").length / estado.janelaPosse.length) * 100);
    const momCasa = document.getElementById("matchMomentumCasa"); const momVisita = document.getElementById("matchMomentumVisita");
    if (momCasa) momCasa.style.width = `${pctMomentumCasa}%`; if (momVisita) momVisita.style.width = `${100 - pctMomentumCasa}%`;
    const posseTotal = Math.max(1, estado.ticksPosseTotal);
    const pctCasa = Math.round((estado.ticksPosseCasa / posseTotal) * 100);
    const pctVisita = 100 - pctCasa;
    setText("matchPosseCasa", `${pctCasa}%`); setText("matchPosseVisita", `${pctVisita}%`);
    const fillCasa = document.getElementById("matchPosseFillCasa"); const fillVisita = document.getElementById("matchPosseFillVisita");
    if (fillCasa) fillCasa.style.width = `${pctCasa}%`; if (fillVisita) fillVisita.style.width = `${pctVisita}%`;
    setText("matchRematesCasa", estado.estatisticas.casa.remates); setText("matchRematesVisita", estado.estatisticas.visita.remates);
    setText("matchAlvoCasa", estado.estatisticas.casa.alvo); setText("matchAlvoVisita", estado.estatisticas.visita.alvo);
    setText("matchEscanteiosCasa", estado.estatisticas.casa.escanteios); setText("matchEscanteiosVisita", estado.estatisticas.visita.escanteios);

    if (minuto >= 45 && !estado.intervaloMostrado) {
        estado.intervaloMostrado = true;
        const banner = document.getElementById("matchHalftimeBanner");
        if (banner) {
            setText("matchHalftimeScore", `${golsCasa} - ${golsVisita}`);
            banner.classList.add("ativo");
            setTimeout(() => banner.classList.remove("ativo"), 1600);
        }
        // 🔄 TROCA DE LADOS: no intervalo, os times de verdade trocam de campo.
        // Espelha o X (100-x) de todo mundo em campo — jogadores e bola — de
        // uma vez só, e inverte a flag direcaoCasa para que toda jogada daqui
        // pra frente (chutes, cruzamentos, escanteios, avanços táticos) já
        // nasça mirando o lado certo. O Y não muda (só inverte esquerda↔direita,
        // não em cima↔embaixo).
        estado.direcaoCasa = (estado.direcaoCasa || 1) * -1;
        ["casa", "visita"].forEach(time => {
            estado.posAtual[time].forEach(p => { p.x = 100 - p.x; });
            estado.posAlvo[time].forEach(p => { p.x = 100 - p.x; });
        });
        estado.bola.x = 100 - estado.bola.x;
        estado.historicoBola = estado.historicoBola.map(p => ({ x: 100 - p.x, y: p.y }));
        mostrarBadgeAcao("🔄 TROCA DE LADO", "ambiente");
    }
    const progresso = eFinalizacao ? 39 : eAtaque ? 23 : 8;
    const faixaY = [50, 34, 66][Math.floor(minuto / 7) % 3];

    const slotsAtaque = eCasa ? estado.slotsCasa : estado.slotsVisita;
    const textoUpper = textoVisual.toUpperCase();
    let indiceNomeado = -1;
    for (let i = 0; i < slotsAtaque.length; i++) {
        const nomeJog = slotsAtaque[i]?.jogador?.nome;
        if (!nomeJog || nomeJog.startsWith("#")) continue;
        const sobrenome = nomeJog.split(" ").slice(-1)[0];
        if (sobrenome.length > 2 && textoUpper.includes(sobrenome.toUpperCase())) { indiceNomeado = i; break; }
    }
    const dono = indiceNomeado >= 0 ? indiceNomeado : (eFinalizacao ? 8 + Math.floor(Math.random() * 3) : (estado.ultimoJogador + 1) % 11);
    estado.ultimoJogador = dono;

    const dispararCelebracaoGol = () => {
        const scoreboard = document.querySelector("#modalPartida .match-scoreboard-compact");
        const numeroGol = document.getElementById(golCasa ? "placarMarcadorCasa" : "placarMarcadorVisita");
        if (scoreboard) { scoreboard.classList.remove("gol-flash"); void scoreboard.offsetWidth; scoreboard.classList.add("gol-flash"); }
        if (numeroGol) { numeroGol.classList.remove("gol-pulse"); void numeroGol.offsetWidth; numeroGol.classList.add("gol-pulse"); }
        pitch.classList.remove("gol-shake"); void pitch.offsetWidth; pitch.classList.add("gol-shake");
        const goolBanner = document.getElementById("matchGoolBanner");
        if (goolBanner) {
            setText("matchGoolPlacar", `${golsCasa} - ${golsVisita}`);
            goolBanner.classList.remove("ativo"); void goolBanner.offsetWidth; goolBanner.classList.add("ativo");
            setTimeout(() => goolBanner.classList.remove("ativo"), 2000);
        }
        const overlay = document.getElementById("matchGoalScorerCard");
        if (overlay) {
            const jogadorGol = indiceNomeado >= 0 ? slotsAtaque[indiceNomeado].jogador : null;
            const fotoUrl = jogadorGol?.id ? obterUrlImagem(jogadorGol, "jogador") : "";
            overlay.innerHTML = `
                ${fotoUrl ? `<img loading="lazy" decoding="async" src="${fotoUrl}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'match-goal-scorer-silhueta',textContent:'⚽'}))">` : `<div class="match-goal-scorer-silhueta">⚽</div>`}
                <strong>${jogadorGol?.nome || estado.nomes[estado.posse]}</strong>
                <span>GOLO! ${golsCasa}-${golsVisita}</span>`;
            overlay.classList.remove("ativo"); void overlay.offsetWidth; overlay.classList.add("ativo");
            setTimeout(() => overlay.classList.remove("ativo"), 2600);
        }
        setTimeout(() => reproduzirReplayJogada(sequencia, eCasa), 2050);
    };
    const dispararMarcadorChute = (passo, noAlvo) => {
        const marcador = document.createElement("span");
        marcador.className = `match-shot-marker ${noAlvo ? "no-alvo" : "fora"}`;
        marcador.style.left = `${passo.x}%`; marcador.style.top = `${passo.y}%`;
        pitch.appendChild(marcador);
        setTimeout(() => marcador.remove(), 1800);
    };
    const dispararCartao = () => {
        const vermelho = /VERMELHO/i.test(textoVisual);
        const cartaoEl = document.createElement("span");
        cartaoEl.className = `match-card-icon ${vermelho ? "vermelho" : "amarelo"}`;
        cartaoEl.style.left = `${estado.bola.x}%`; cartaoEl.style.top = `${estado.bola.y}%`;
        pitch.appendChild(cartaoEl);
        setTimeout(() => cartaoEl.remove(), 1800);
        window.tocarSom?.("cartao", 0.5);
    };

    let tipoEvento = "ambiente";
    if (golCasa || golVisita) tipoEvento = "golo";
    else if (/TRAVE/i.test(textoVisual)) tipoEvento = "trave";
    else if (eNoAlvo) tipoEvento = "defesa";
    else if (/CART[ÃA]O/i.test(textoVisual)) tipoEvento = "cartao";
    else if (eEscanteio) tipoEvento = "escanteio";
    else if (/P[ÊE]NALTI/i.test(textoVisual)) tipoEvento = "penalti";
    else if (/IMPEDIMENTO/i.test(textoVisual)) tipoEvento = "impedimento";
    else if (/\bFALTA\b/i.test(textoVisual) && !/CART[ÃA]O/i.test(textoVisual)) tipoEvento = "falta";

    const sequencia = gerarSequenciaJogada(tipoEvento, eCasa, dono, estado.posAlvo[eCasa ? "casa" : "visita"], slotsAtaque, estado.posAlvo[eCasa ? "visita" : "casa"], estado.direcaoCasa || 1);
    sequencia.forEach(passo => {
        if (passo.evento === "golo") passo.aoChegar = () => { dispararMarcadorChute(passo, true); dispararCelebracaoGol(); };
        else if (passo.evento === "defesa" || passo.evento === "trave") passo.aoChegar = () => dispararMarcadorChute(passo, false);
        else if (passo.evento === "cartao") passo.aoChegar = () => dispararCartao();
    });
    // 🛑 ANTI-TELEPORTE: só empilha novos waypoints se a fila está quase vazia.
    // Se o motor mandou ticks mais rápido do que a animação consumiu, descarta
    // os antigos para que a bola nunca precise "correr" por dezenas de pontos
    // empilhados — isso era a causa principal do efeito de teleportação.
    if (estado.filaBola.length > 3) {
        // Mantém só o último passo da fila antiga (para continuidade) e junta os novos
        const ultimo = estado.filaBola[estado.filaBola.length - 1];
        estado.filaBola = [ultimo, ...sequencia];
    } else {
        estado.filaBola.push(...sequencia);
    }

    // ⏸️ Pausa o RELÓGIO do motor (não a animação) enquanto a sequência ainda
    // está se desenrolando na tela — é isto que garante que o próximo tick só
    // chega DEPOIS que o lance atual (passe a passe) terminou de aparecer, em
    // vez de empilhar vários lances de uma vez e "atropelar" a transmissão.
    // Golo ganha um tempo extra: comemoração (2s) + replay em câmara lenta
    // (a mesma sequência a ~2.1x mais devagar). definirVelocidade/pausar/
    // retomar só mudam o RITMO — o resultado e o RNG do motor nunca mudam.
    if (tipoEvento !== "ambiente" && typeof window.engineAoVivo?.pausar === "function") {
        const duracaoSequenciaMs = sequencia.reduce((acc, p) => acc + p.duracaoMs, 0);
        const extraGolo = tipoEvento === "golo" ? (2050 + duracaoSequenciaMs * 2.1) : 0;
        window.engineAoVivo.pausar();
        clearTimeout(window._matchRetomarTimer);
        window._matchRetomarTimer = setTimeout(() => window.engineAoVivo?.retomar?.(), duracaoSequenciaMs + 250 + extraGolo);
    }

    // Cada linha se desloca em proporção diferente conforme o lance: zaga
    // mantém a forma, meio oferece apoio e ataque ataca a profundidade —
    // usando a posição REAL de cada titular. Isto vira o ALVO tático de cada
    // jogador; o loop de animação é quem efetivamente os move até lá.
    ["casa", "visita"].forEach(time => {
        const timeCasa = time === "casa";
        const slots = timeCasa ? estado.slotsCasa : estado.slotsVisita;
        slots.forEach((slot, indice) => {
            const baseX = slot?.x ?? 50, baseY = slot?.y ?? 50;
            const meuTimeTemBola = timeCasa === eCasa;
            const fatorLinha = indice === 0 ? .08 : indice < 5 ? .20 : indice < 8 ? .34 : .48;
            const direcao = (eCasa ? 1 : -1) * (estado.direcaoCasa || 1);
            const deslocamento = (meuTimeTemBola ? progresso * fatorLinha : -progresso * (fatorLinha * .42));
            // 🥅 Só o goleiro pode chegar perto da linha do gol — os outros 10
            // jogadores ficam travados antes da pequena área (6% de cada lado),
            // pra ninguém aparecer "dentro do gol" mesmo empurrando no ataque.
            const limiteX = slot.pos === "Goleiro" ? [4, 96] : [9, 91];
            const x = Math.max(limiteX[0], Math.min(limiteX[1], baseX + direcao * deslocamento));
            const y = Math.max(10, Math.min(90, baseY + (faixaY - 50) * (indice < 5 ? .18 : .38)));
            estado.posAlvo[time][indice] = { x, y };
        });
    });

    estado.placarCasa = golsCasa; estado.placarVisita = golsVisita;
    if (caption) caption.textContent = `${minuto}' — ${estado.nomes[estado.posse]} ${textoVisual}.`;
};

// 🔁 Replay em câmara lenta: reconstrói o MESMO caminho que a bola acabou de
// percorrer (silenciosamente — não recontabiliza estatísticas nem dispara
// banners de novo) a ~40% da velocidade, com o selo "Replay" visível.
function reproduzirReplayJogada(sequenciaOriginal, eCasa) {
    const estado = window.estadoVisualPartida;
    const badge = document.getElementById("matchReplayBadge");
    if (!estado || !sequenciaOriginal.length) return;
    const dirCasaReplay = estado.direcaoCasa || 1;
    const ataqueDirReplay = eCasa ? dirCasaReplay : -dirCasaReplay;
    const origX = ataqueDirReplay === 1 ? 10 : 90;
    const origY = 50;
    if (badge) { badge.classList.add("ativo"); }
    estado.bola = { x: origX, y: origY };
    const replaySeq = sequenciaOriginal.map(p => ({ ...p, duracaoMs: p.duracaoMs * 2.1, silencioso: true, aoChegar: null }));
    replaySeq[replaySeq.length - 1].silencioso = false;
    replaySeq[replaySeq.length - 1].aoChegar = () => { if (badge) badge.classList.remove("ativo"); };
    estado.filaBola.push(...replaySeq);
}

// O botão deixa o usuário escolher entre relato compacto e transmissão visual
// sem reiniciar a partida que já está em andamento.
document.getElementById("btnAlternarVisualPartida")?.addEventListener("click", () => {
    window.visualPartidaAtiva = !window.visualPartidaAtiva;
    const nomeCasa = document.getElementById("placarTimeCasa")?.textContent || "Casa";
    const nomeVisita = document.getElementById("placarTimeVisita")?.textContent || "Visita";
    window.prepararVisualizacaoPartida(nomeCasa, nomeVisita);
});

// Permite escolher a forma de acompanhar a partida ANTES de entrar no relvado.
document.getElementById("btnModoVisualHub")?.addEventListener("click", () => {
    window.visualPartidaAtiva = !window.visualPartidaAtiva;
    atualizarControlesVisualPartida();
    mostrarToast("Simulação", window.visualPartidaAtiva ? "Transmissão visual ativada para o próximo jogo." : "Próximo jogo será simulação rápida, apenas com relato.", "info");
});

// ==========================================
// 🔊 EFEITOS SONOROS
// ==========================================
// Sistema leve de som: cada efeito é um ficheiro .mp3 opcional na pasta
// assets/sfx/ (o jogador coloca os próprios ficheiros, mesmo esquema já
// usado para os vídeos de abertura em assets/intros/). Se o ficheiro não

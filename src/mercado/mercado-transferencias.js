function calcularOrcamentoBaseClube(reputacao) {
    const rep = Math.max(41, reputacao || 60);
    return Math.round(2.45 * Math.pow(rep - 40, 4.61)) + 25000;
}

function inicializarOrcamentosEContratos() {
    const tecnicos = ["Ofensivo", "Equilibrado", "Defensivo", "Pressão Alta", "Posse de Bola", "Contra-ataque"];
    clubes.forEach(c => {
        if(!c.orcamento) c.orcamento = calcularOrcamentoBaseClube(c.reputacao);
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
    // 🛡️ FIX: no Modo Manager não existe nenhum "jogador" jogável — sem essa
    // proteção, iniciar uma carreira de treinador quebrava aqui mesmo.
    if (jogador) {
        if(typeof jogador.contrato === 'undefined') jogador.contrato = 3;
        jogador.pontosPremio = 0;
    }
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
        const base = calcularOrcamentoBaseClube(c.baseOvr || c.reputacao) * (focoEmprestimo ? 0.35 : 1);
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
            <img loading="lazy" decoding="async" src="${obterUrlImagem(c,'clube')}" onclick="abrirPerfilClube('${id}')">
            <div style="flex:1;"><strong>${c.nome}</strong><br><small>OVR ${c.reputacao}</small></div>
            ${isAlvo ? `<span class="meta-pill">Alvo</span>` : `<button class="btn btn-primary" style="padding:6px 10px;font-size:0.75rem;" onclick="definirClubeAlvo('${id}')">Definir alvo</button>`}
            <button class="btn btn-danger" style="padding:6px 10px;font-size:0.75rem;" onclick="removerClubeDesejos('${id}')">✖</button>
        </div>`;
    }).join("") || `<p style="color:#888;font-size:0.9rem;">Adiciona até 5 clubes dos sonhos.</p>`;
    const propostasHtml = propostasPendentes.length ? propostasPendentes.map((c, i) => `
        <div style="background:rgba(0,255,136,0.05);padding:16px;border-radius:10px;border:1px solid var(--theme-primary);display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:12px;"><img loading="lazy" decoding="async" src="${obterUrlImagem(c,'clube')}" style="width:56px;height:56px;border-radius:8px;object-fit:contain;background:#fff;padding:4px;">
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
                                <img loading="lazy" decoding="async" src="${obterUrlImagem(c,'clube')}" style="width:28px;height:28px;object-fit:contain;background:#fff;border-radius:6px;padding:2px;">
                                <span class="pais-label" style="font-size:0.75rem;">${c.nome.slice(0, 14)}</span>
                            </button>`).join("")}
                    </div></details>
                </div>
                <div class="mercado-panel">
                    <h3>🎯 Objetivos de transferência</h3>
                    ${alvo ? `<p style="color:#ccc;margin:0 0 12px;">Clube alvo: <img loading="lazy" decoding="async" src="${obterUrlImagem(alvo,'clube')}" style="width:22px;height:22px;vertical-align:middle;background:#fff;border-radius:4px;padding:1px;"> <strong>${alvo.nome}</strong></p>${objsHtml}
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
                <img loading="lazy" decoding="async" src="${obterUrlImagem(jogadorMov || m.jogadorNome, 'jogador')}" alt="${m.jogadorNome}">
                <div><strong style="color:#fff; font-size:1.05rem;">${m.jogadorNome}</strong><br><span style="color:#aaa; font-weight:700;">${m.ano} • Rodada ${m.rodada}</span></div>
            </div>
            <div class="transfer-club"><img loading="lazy" decoding="async" src="${obterUrlImagem(origem, 'clube')}" alt="${m.origem}"><div><span style="color:#aaa; font-size:0.75rem; font-weight:900; text-transform:uppercase;">De</span><br><strong>${m.origem}</strong></div></div>
            <div class="transfer-club"><img loading="lazy" decoding="async" src="${obterUrlImagem(destino, 'clube')}" alt="${m.destino}"><div><span style="color:#aaa; font-size:0.75rem; font-weight:900; text-transform:uppercase;">Para</span><br><strong style="color:var(--theme-primary);">${m.destino}</strong></div></div>
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
// 🎽➡️👔 Modal de despedida — aparece UMA vez, no primeiro atualizarHub()
// depois que window.carreiraRecemEncerrada foi ligado em avancarTemporada().
// Reaproveita os mesmos dados (historicoCarreira, troféus) que o Hall da Fama usa.
// Resumo cobre AS DUAS carreiras — clube ("normal") e seleção — já que uma
// aposentadoria de vez encerra as duas.
function mostrarModalAposentadoria() {
    if (document.getElementById("modalAposentadoria")) return;
    const hist = jogador.historicoCarreira || [];
    const carreira = obterEstatisticasCarreira(jogador);
    const sel = jogador.statsSelecao || { jogos: 0, gols: 0, assistencias: 0 };
    const contagemTrofeus = {};
    hist.forEach(h => {
        if (!h.trofeus || h.trofeus === "-") return;
        h.trofeus.split(",").map(t => t.trim()).filter(Boolean).forEach(nome => {
            contagemTrofeus[nome] = (contagemTrofeus[nome] || 0) + 1;
        });
    });
    (jogador.titulosSelecao || []).forEach(t => { contagemTrofeus[t.trofeu] = (contagemTrofeus[t.trofeu] || 0) + 1; });
    const totalTrofeus = Object.values(contagemTrofeus).reduce((a, b) => a + b, 0);
    const jogouPelaSelecao = sel.jogos > 0 || (jogador.titulosSelecao || []).length > 0;

    const modal = document.createElement("div");
    modal.id = "modalAposentadoria";
    modal.className = "modal";
    modal.style.cssText = "z-index:1000; background:rgba(0,0,0,0.85); backdrop-filter:blur(6px);";
    modal.innerHTML = `
        <div class="coach-talk-card" style="width:min(640px, 92vw); text-align:center; border-top-color:var(--gold);">
            <div class="hof-avatar" style="width:96px; height:96px; margin:0 auto 14px;">
                <img loading="lazy" decoding="async" src="${obterUrlImagem(jogador, 'jogador')}" onerror="this.style.display='none'"><span>🐐</span>
            </div>
            <span class="coach-talk-tag" style="color:var(--gold);">📜 Fim de uma carreira</span>
            <h2 style="margin:10px 0 4px;">${jogador.nome}</h2>
            <p class="coach-talk-quote" style="font-style:normal; color:#d4d4d8;">Depois de ${hist.length} temporada${hist.length === 1 ? "" : "s"} em campo, chegou a hora de pendurar as chuteiras.</p>
            <p style="text-transform:uppercase; font-size:0.72rem; font-weight:800; letter-spacing:1px; color:#888; margin:16px 0 6px; text-align:left;">⚽ Carreira de clube</p>
            <div class="hof-stats-grid" style="margin:0 0 16px;">
                <div class="hof-stat-card"><strong>${carreira.jogos}</strong><span>Jogos</span></div>
                <div class="hof-stat-card"><strong>${carreira.gols}</strong><span>Golos</span></div>
                <div class="hof-stat-card"><strong>${carreira.assistencias}</strong><span>Assistências</span></div>
                <div class="hof-stat-card destaque"><strong>${totalTrofeus}</strong><span>Troféus</span></div>
            </div>
            ${jogouPelaSelecao ? `
            <p style="text-transform:uppercase; font-size:0.72rem; font-weight:800; letter-spacing:1px; color:#888; margin:16px 0 6px; text-align:left;">🌍 Carreira pela seleção</p>
            <div class="hof-stats-grid" style="margin:0 0 18px;">
                <div class="hof-stat-card"><strong>${sel.jogos}</strong><span>Jogos</span></div>
                <div class="hof-stat-card"><strong>${sel.gols}</strong><span>Golos</span></div>
                <div class="hof-stat-card"><strong>${sel.assistencias}</strong><span>Assistências</span></div>
                <div class="hof-stat-card destaque"><strong>${(jogador.titulosSelecao || []).length}</strong><span>Títulos</span></div>
            </div>` : ""}
            <button class="coach-talk-btn" id="btnVerHallDaFama">Ver Hall da Fama ➔</button>
        </div>`;
    document.body.appendChild(modal);
    document.getElementById("btnVerHallDaFama").onclick = () => {
        modal.remove();
        document.querySelector('[data-view="view-historico"]')?.click();
    };
}

// A aposentadoria internacional é independente da carreira de clube. Depois
// dela, o jogador continua jogando normalmente pelo seu time.
window.abrirConfirmacaoAposentadoriaSelecao = function() {
    if (!jogador || jogador.aposentado || jogador.aposentadoSelecao || document.getElementById("modalConfirmarAposentadoriaSelecao")) return;
    const tevePassagem = jogador.naSelecao || (jogador.statsSelecao?.jogos || 0) > 0 || (jogador.statsSelecao?.convocacoes || 0) > 0;
    if (!tevePassagem) {
        mostrarToast("Seleção", "Só podes encerrar a carreira internacional depois de seres convocado.", "warning");
        return;
    }
    const nomeSelecao = (typeof SELECOES !== "undefined" ? SELECOES.find(s => s.id === jogador.selecaoId)?.pais : null) || jogador.statsSelecao?.selecao || jogador.nacionalidade || "seleção";
    const modal = document.createElement("div");
    modal.id = "modalConfirmarAposentadoriaSelecao";
    modal.className = "modal";
    modal.style.cssText = "z-index:1100; background:rgba(0,0,0,0.85); backdrop-filter:blur(6px);";
    modal.innerHTML = `
        <div class="coach-talk-card" style="width:min(520px, 92vw); text-align:center; border-top-color:#3b82f6;">
            <span class="coach-talk-tag" style="color:#60a5fa;">🌍 Carreira internacional</span>
            <h2 style="margin:10px 0;">Aposentar da ${nomeSelecao}?</h2>
            <p class="coach-talk-quote" style="font-style:normal; color:#d4d4d8;">Não serás mais convocado, mas a tua carreira de clube continuará normalmente.</p>
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button class="coach-talk-btn" id="btnCancelarAposentadoriaSelecao" style="flex:1; background:#303036; color:#fff;">Continuar disponível</button>
                <button class="coach-talk-btn" id="btnConfirmarAposentadoriaSelecao" style="flex:1; background:#3b82f6; color:#fff;">Aposentar da seleção</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    document.getElementById("btnCancelarAposentadoriaSelecao").onclick = () => modal.remove();
    document.getElementById("btnConfirmarAposentadoriaSelecao").onclick = () => {
        jogador.aposentadoSelecao = true;
        jogador.naSelecao = false;
        jogador.anoAposentadoriaSelecao = anoAtual;
        jogador.selecaoIdAntesAposentadoria = jogador.selecaoId;
        jogador.selecaoId = "none";
        jogador.statsSelecao = { ...(jogador.statsSelecao || {}), selecao: nomeSelecao };
        registrarNoticia("Adeus à seleção", `${jogador.nome} decidiu encerrar a carreira internacional pela ${nomeSelecao}, mas segue em atividade pelo clube.`, "Carreira");
        window.despedidaSelecaoRecente = true;
        modal.remove();
        window.salvarJogo();
        atualizarHub();
    };
};

// A carreira do personagem não termina por sorteio: este é o único caminho
// para encerrar a atividade. A confirmação evita que um clique acidental
// torne o save irrecuperável.
window.abrirConfirmacaoAposentadoria = function() {
    if (!jogador || jogador.aposentado || document.getElementById("modalConfirmarAposentadoria")) return;
    const modal = document.createElement("div");
    modal.id = "modalConfirmarAposentadoria";
    modal.className = "modal";
    modal.style.cssText = "z-index:1100; background:rgba(0,0,0,0.85); backdrop-filter:blur(6px);";
    modal.innerHTML = `
        <div class="coach-talk-card" style="width:min(520px, 92vw); text-align:center; border-top-color:var(--gold);">
            <span class="coach-talk-tag" style="color:var(--gold);">🏁 Decisão de carreira</span>
            <h2 style="margin:10px 0;">Encerrar a carreira?</h2>
            <p class="coach-talk-quote" style="font-style:normal; color:#d4d4d8;">${jogador.nome} deixará o clube e a seleção definitivamente. Esta decisão não pode ser desfeita neste save.</p>
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button class="coach-talk-btn" id="btnCancelarAposentadoria" style="flex:1; background:#303036; color:#fff;">Continuar jogando</button>
                <button class="coach-talk-btn" id="btnConfirmarAposentadoria" style="flex:1; background:var(--gold); color:#111;">Aposentar-me</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    document.getElementById("btnCancelarAposentadoria").onclick = () => modal.remove();
    document.getElementById("btnConfirmarAposentadoria").onclick = () => {
        jogador.aposentado = true;
        jogador.aposentadoSelecao = true;
        jogador.naSelecao = false;
        jogador.clubeIdAntesAposentadoria = jogador.clubeId;
        jogador.anoAposentadoria = anoAtual;
        jogador.anoAposentadoriaSelecao = anoAtual;
        jogador.clubeId = "aposentado";
        jogador.contrato = 0;
        registrarNoticia("Fim de uma carreira", `${jogador.nome} decidiu encerrar a carreira após ${jogador.historicoCarreira?.length || 0} temporadas.`, "Carreira");
        window.carreiraRecemEncerrada = true;
        modal.remove();
        window.salvarJogo();
        atualizarHub();
    };
};

// 🌍👋 Modal de despedida SÓ da seleção — o jogador continua ativo pelo
// clube, então este resumo mostra apenas a carreira internacional, sem
// mexer no Hall da Fama geral (que é sobre a carreira inteira).
function mostrarModalAposentadoriaSelecao() {
    if (document.getElementById("modalAposentadoriaSelecao")) return;
    const sel = jogador.statsSelecao || { jogos: 0, gols: 0, assistencias: 0 };
    const nomeSel = (typeof SELECOES !== "undefined" ? SELECOES.find(s => s.pais === sel.selecao || s.nome === sel.selecao)?.pais : null) || sel.selecao || jogador.nacionalidade || "seleção";
    const modal = document.createElement("div");
    modal.id = "modalAposentadoriaSelecao";
    modal.className = "modal";
    modal.style.cssText = "z-index:1000; background:rgba(0,0,0,0.85); backdrop-filter:blur(6px);";
    modal.innerHTML = `
        <div class="coach-talk-card" style="width:min(560px, 92vw); text-align:center; border-top-color:var(--theme-primary);">
            <div class="hof-avatar" style="width:88px; height:88px; margin:0 auto 14px; border-color:var(--theme-primary); background:rgba(0,255,136,0.1);">
                <img loading="lazy" decoding="async" src="${obterUrlImagem(jogador, 'jogador')}" onerror="this.style.display='none'"><span>🌍</span>
            </div>
            <span class="coach-talk-tag">🌍 Adeus à Seleção</span>
            <h2 style="margin:10px 0 4px;">${jogador.nome}</h2>
            <p class="coach-talk-quote" style="font-style:normal; color:#d4d4d8;">Encerrou a carreira internacional pela ${nomeSel} — mas segue em campo pelo clube.</p>
            <div class="hof-stats-grid" style="margin:18px 0;">
                <div class="hof-stat-card"><strong>${sel.jogos || 0}</strong><span>Jogos</span></div>
                <div class="hof-stat-card"><strong>${sel.gols || 0}</strong><span>Golos</span></div>
                <div class="hof-stat-card"><strong>${sel.assistencias || 0}</strong><span>Assistências</span></div>
                <div class="hof-stat-card destaque"><strong>${(jogador.titulosSelecao || []).length}</strong><span>Títulos</span></div>
            </div>
            <button class="coach-talk-btn" id="btnFecharAposentadoriaSelecao">Continuar carreira ➔</button>
        </div>`;
    document.body.appendChild(modal);
    document.getElementById("btnFecharAposentadoriaSelecao").onclick = () => modal.remove();
}

// 📈 ATRIBUTOS — visão geral de todos os atributos do teu jogador, com a
// mesma escala de cores (fraco/médio/forte) já usada na tela de criação.

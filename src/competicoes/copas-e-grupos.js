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
        if(comp.tipo === "liga" || comp.tipo === "liga_grupos" || comp.tipo === "liga_conferencias") {
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

// ==========================================
// 🏆 SÉRIE D (Brasil) — FORMATO ESPECIAL
// ==========================================
// - 96 clubes, 16 grupos de 6, turno e returno (ver processarFimGruposClube/
//   estado.avancam/maxRodadas). Os 4 melhores de cada grupo avançam ao
//   mata-mata → 16 x 4 = 64 classificados.
// - Mata-mata 100% ida e volta, em 6 fases: 1/32 de Final (64) → 1/16 de
//   Final (32) → Oitavas de Final (16) → Quartas de Final (8) → Semifinal
//   (4) → Final (2, também ida e volta — ver pernasFinal=2 no início da
//   temporada, mais abaixo).
// - Os 4 semifinalistas (vencedores das quartas de final) já garantem acesso
//   automático à Série C, só por chegarem lá.
// - Os 4 eliminados nas quartas de final disputam o Playoff de Acesso
//   (br_4_acesso): 2 semifinais em ida e volta, e os 2 VENCEDORES já ficam
//   com as 2 vagas restantes — não há uma "final" extra do playoff, os dois
//   vencedores das semifinais sobem direto (os 2 perdedores continuam na
//   Série D). Total promovido à Série C: 4 + 2 = 6.
// - faseSerieDPorQtd() é o único lugar que decide o nome da fase a partir da
//   quantidade de times classificados — usado tanto pra abrir o mata-mata
//   quanto pra avançar de uma fase pra outra, pra nunca reaproveitar o nome
//   errado de fase (bug antigo: com só 4 nomes de fase pra 64 classificados,
//   "Quartas de Final" chegava a ser usado em 3 rodadas diferentes seguidas,
//   disparando a promoção/repescagem de forma duplicada).
function faseSerieDPorQtd(qtd) {
    if (qtd >= 64) return "1/32 de Final";
    if (qtd >= 32) return "1/16 de Final";
    if (qtd >= 16) return "Oitavas de Final";
    if (qtd >= 8) return "Quartas de Final";
    if (qtd >= 4) return "Semifinal";
    return "Final";
}

function iniciarMataMataSerieD(compId, times) {
    if (!copasEstado[compId]) copasEstado[compId] = { historicoFases: [] };
    if (!Array.isArray(copasEstado[compId].promovidosSerieC)) copasEstado[compId].promovidosSerieC = [];
    const fase = faseSerieDPorQtd(times.length);
    gerarChaveamentoMataMata(compId, times, fase);
    if (fase === "Semifinal" || fase === "Final") {
        // Dataset pequeno (menos clubes reais do que o padrão de 96): a fase
        // de grupos já entrega os classificados direto pra semifinal (ou
        // final), sem fase de quartas — então não há como gerar o playoff de
        // acesso entre eliminados de quartas. Nesse caso os classificados que
        // já chegam nessa fase garantem o acesso direto.
        copasEstado[compId].promovidosSerieC = [...new Set([...copasEstado[compId].promovidosSerieC, ...times.map(t => t.id)])];
    }
    agendarConfrontoContinentalDoJogador(compId);
}

function avancarMataMataSerieD(compId) {
    let estado = copasEstado[compId];
    if (!estado || !estado.confrontos) return;
    let vencedores = estado.confrontos.map(c => c.vencedorId).filter(Boolean);
    if (vencedores.length === 0) return;
    let perdedores = estado.confrontos.map(c => c.vencedorId ? (c.timeA.id === c.vencedorId ? c.timeB.id : c.timeA.id) : null).filter(Boolean);
    const faseConcluida = estado.fase;
    arquivarFase(compId);
    if (!Array.isArray(estado.promovidosSerieC)) estado.promovidosSerieC = [];

    if (faseConcluida === "Final") {
        // A final só decide o campeão — os semifinalistas já estavam promovidos.
        estado.campeaoId = vencedores[0];
        estado.fase = "Campeão Definido";
        estado.confrontos = [];
        return;
    }

    // 1/32 → 1/16 → Oitavas → Quartas → Semifinal: todas ida e volta.
    let times = vencedores.map(id => clubes.find(c => c.id === id) || clubePorIdOuRepresentante(id, "Classificado Série D", 68));
    let novaFase = faseSerieDPorQtd(times.length);
    gerarChaveamentoMataMata(compId, times, novaFase);
    agendarConfrontoContinentalDoJogador(compId);

    if (faseConcluida === "Quartas de Final") {
        // Os 4 vencedores das quartas (agora semifinalistas) já garantem
        // acesso automático à Série C.
        estado.promovidosSerieC = [...new Set([...estado.promovidosSerieC, ...vencedores])];

        // Os 4 eliminados nas quartas disputam o Playoff de Acesso.
        let candidatosRepescagem = perdedores.map(id => clubes.find(c => c.id === id) || clubePorIdOuRepresentante(id, "Eliminado nas Quartas Série D", 64));
        if (candidatosRepescagem.length >= 2) {
            gerarChaveamentoMataMata("br_4_acesso", candidatosRepescagem, "Repescagem");
            copasEstado["br_4_acesso"].serieDRef = compId;
            agendarConfrontoContinentalDoJogador("br_4_acesso");
        } else if (candidatosRepescagem.length === 1) {
            // Só sobrou 1 eliminado (dataset pequeno): garante a vaga direto.
            estado.promovidosSerieC = [...new Set([...estado.promovidosSerieC, candidatosRepescagem[0].id])];
        }
    }
}

// 🏆 PLAYOFF DE ACESSO (br_4_acesso): 4 clubes eliminados nas quartas da
// Série D, 2 semifinais em ida e volta — e os 2 VENCEDORES já ficam com as
// 2 vagas restantes de acesso à Série C (os 2 perdedores continuam na Série
// D). Não existe uma "final" do playoff — isso reduziria os 2 vencedores a
// só 1 promovido, quando o formato oficial promove os DOIS.
function avancarPlayoffAcessoSerieD() {
    let estado = copasEstado["br_4_acesso"];
    if (!estado || !estado.confrontos || estado.confrontos.length === 0) return;
    let vencedores = estado.confrontos.map(c => c.vencedorId).filter(Boolean);
    if (vencedores.length === 0) return;
    arquivarFase("br_4_acesso");
    estado.fase = "Vagas Definidas";
    estado.classificados = vencedores;
    estado.confrontos = [];
    let refCompId = estado.serieDRef || "br_4";
    let ref = copasEstado[refCompId];
    if (ref) {
        if (!Array.isArray(ref.promovidosSerieC)) ref.promovidosSerieC = [];
        ref.promovidosSerieC = [...new Set([...ref.promovidosSerieC, ...vencedores])];
    }
}

// Ponto único de decisão: mata-matas normais usam o motor genérico
// (avancarFaseMataMata), mas a Série D e sua repescagem de acesso precisam da
// lógica especial acima (semifinalistas promovidos direto + repescagem).
function avancarFaseMataMataDispatch(compId) {
    // Mantemos br_4 original para a simulação avançar corretamente
    if (compId === "br_4") {
        avancarMataMataSerieD(compId);
    } else if (compId === "br_4_acesso") {
        avancarPlayoffAcessoSerieD();
    } else {
        avancarFaseMataMata(compId);
    }
}

// Fecha a fase de grupos de uma competição de clubes (Série D e similares),
// respeitando quantos times avançam de cada grupo (estado.avancam) — e
// direciona a Série D para o mata-mata especial em vez do genérico.
function processarFimGruposClube(compId, estado) {
    const avancamPorGrupo = estado.avancam || 4;
    let classificados = [];

    estado.grupos.forEach(grp => {
        let listaTimes = grp.equipas || grp.times || [];

        listaTimes.sort((a, b) =>
            (b.pts - a.pts) ||
            ((b.gf - b.gs) - (a.gf - a.gs)) ||
            (b.gf - a.gf)
        );

        for (let i = 0; i < avancamPorGrupo; i++) {
            if (listaTimes[i]) {
                let idOuClube = listaTimes[i].id !== undefined ? listaTimes[i].id : listaTimes[i];
                let clubeObj = clubes.find(c => c.id === idOuClube) || listaTimes[i];

                if (clubeObj) classificados.push(clubeObj);
            }
        }
    });

    classificados = classificados.filter((c, index, self) => c && self.findIndex(t => t.id === c.id) === index);

    arquivarFase(compId);

    // Remove os grupos do estado atual para a interface parar de tentar
    // renderizar a tabela de grupo (ver exibirTabelaLigaCodigo, que agora
    // sabe cair pro chaveamento assim que estado.grupos some).
    delete estado.grupos;

    const compTorneio = competicoes.find(c => c.id === compId);
    if (compTorneio?.tipo === "liga_grupos") {
        // 🛡️ A Série D usa a lógica especial (iniciarMataMataSerieD, acima) —
        // ela já cuida de: setar estado.tipo = "mata-mata" (com HÍFEN — é o
        // valor que toda a simulação de fundo, o dispatch de avanço de fase e
        // a tela de chaveamento esperam; um "mata_mata" com underscore aqui
        // fazia o mata-mata simplesmente nunca avançar nem aparecer) e usar
        // faseSerieDPorQtd() pra escolher a fase certa em cascata (1/32 → 1/16
        // → Oitavas → Quartas → Semifinal → Final) a partir da quantidade real
        // de classificados, em vez de uma fase fixa que não cobria os 64.
        iniciarMataMataSerieD(compId, classificados);
    } else {
        gerarChaveamentoMataMata(compId, classificados, classificados.length >= 16 ? "Oitavos de Final" : "Quartos de Final");
        agendarConfrontoContinentalDoJogador(compId);
    }
}

// Verifica se o PRÓPRIO jogador já disputou todos os seus jogos da fase de
// grupos (contagem "j" do seu próprio time dentro de estado.grupos, que só
// é incrementada quando a partida dele é realmente jogada via calendário).
// Se o jogador nem está nesse grupo/competição, não há nada a esperar.
function grupoDoJogadorCompleto(estado, minJogos) {
    if (!estado.grupos) return true;
    const meuGrupo = estado.grupos.find(g => g.equipas.some(e => e.id === jogador?.clubeId));
    if (!meuGrupo) return true;
    const meuTime = meuGrupo.equipas.find(e => e.id === jogador.clubeId);
    return !meuTime || meuTime.j >= minJogos;
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
// Igual ao criarClubeGenerico acima, mas para a Série D (liga_grupos): o
// clube genérico entra de fato na divisão (ligaId = comp.id, ex: "br_4"),
// não numa "liga genérica" à parte — assim ele participa normalmente do
// grupo, da tabela, do mata-mata e, se for o caso, é promovido como
// qualquer outro clube da Série D.
function criarClubeGenericoSerieD(compId, indice) {
    const repBase = 42 + Math.floor(Math.random() * 18); // 42-59: nível modesto, condizente com a 4ª divisão
    return {
        id: `generico_${compId}_${indice}`,
        nome: `Clube Genérico D-${indice}`,
        logo: "",
        reputacao: repBase,
        ligaId: compId,
        pais: "Brasil",
        generico: true
    };
}

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

    // 🏆 SÉRIE D (Brasil) - formato de grupos
    // 🆕 CLUBES GENÉRICOS: enquanto o database.js não tiver os 96 clubes reais
    // necessários para fechar os 16 grupos de 6 da Série D, completamos as
    // vagas que faltarem com clubes genéricos (mesmo princípio já usado nas
    // copas continentais — nunca removem/substituem um clube real; assim que
    // existirem clubes reais suficientes, eles tomam essas vagas automatica-
    // mente e os genéricos que sobrarem são descartados).
    competicoes.filter(c => c.tipo === "liga_grupos").forEach(comp => {
        const ALVO_SERIE_D = 96; // 16 grupos de 6 times
        let timesReais = clubes.filter(c => c.ligaId === comp.id && !c.generico);
        let genericosExistentes = clubes.filter(c => c.ligaId === comp.id && c.generico);

        if (timesReais.length >= ALVO_SERIE_D) {
            // Clubes reais já bastam: descarta quaisquer genéricos remanescentes
            // de temporadas anteriores em que ainda faltavam clubes.
            genericosExistentes.forEach(g => { const idx = clubes.indexOf(g); if (idx !== -1) clubes.splice(idx, 1); });
            genericosExistentes = [];
        } else {
            const faltamNoTotal = ALVO_SERIE_D - timesReais.length;
            if (genericosExistentes.length > faltamNoTotal) {
                // Sobraram genéricos de vagas que clubes reais novos já ocuparam.
                genericosExistentes.slice(faltamNoTotal).forEach(g => { const idx = clubes.indexOf(g); if (idx !== -1) clubes.splice(idx, 1); });
                genericosExistentes = genericosExistentes.slice(0, faltamNoTotal);
            } else if (genericosExistentes.length < faltamNoTotal) {
                let n = genericosExistentes.length + 1;
                while (genericosExistentes.length < faltamNoTotal) {
                    const generico = criarClubeGenericoSerieD(comp.id, n);
                    clubes.push(generico);
                    genericosExistentes.push(generico);
                    n++;
                }
            }
        }

        let timesPais = [...timesReais, ...genericosExistentes];
        if(timesPais.length >= 6) {
            if(!copasEstado[comp.id]) copasEstado[comp.id] = {};
            copasEstado[comp.id].tipo = "grupos";
            copasEstado[comp.id].fase = "Fase de Grupos";
            copasEstado[comp.id].rodadaAtual = 1;
            copasEstado[comp.id].maxRodadas = 10;
            // 🏆 Formato oficial: 16 grupos x 4 classificados = 64 times no
            // mata-mata (1/32 → 1/16 → Oitavas → Quartas → Semifinal → Final).
            // Ver faseSerieDPorQtd()/iniciarMataMataSerieD()/avancarMataMataSerieD()
            // mais abaixo, que cobrem as 6 fases.
            copasEstado[comp.id].avancam = 4;
            // A final é em dois jogos (ida e volta) — precisa deste flag porque
            // "Final" cai por padrão em perna única (ver numeroPernasConfronto).
            copasEstado[comp.id].pernasFinal = 2;
            copasEstado[comp.id].promovidosSerieC = [];
            
            // Criar grupos (16 grupos de 6 times)
            const numGrupos = Math.min(16, Math.floor(timesPais.length / 6));
            const shuffled = [...timesPais].sort(() => Math.random() - 0.5);
            const grupos = [];
            for(let g = 0; g < numGrupos; g++) {
                const timesGrupo = shuffled.slice(g * 6, (g + 1) * 6);
                if(timesGrupo.length >= 2) {
                    grupos.push({
                        nome: `Grupo ${String.fromCharCode(65 + g)}`,
                        equipas: timesGrupo.map(t => ({ id: t.id, nome: t.nome, pts: 0, j: 0, gf: 0, gs: 0 }))
                    });
                }
            }
            copasEstado[comp.id].grupos = grupos;
        }
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
    const REGULAMENTOS_ESTADUAIS = {
    // Regulamento Especial: Campeonato Paulista
    "est_sp": (estadual, times) => {
        console.log("Iniciando Paulistão com Fase de Liga + Mata-Mata...");
        
        // 1. Organiza os 8 jogos da Fase de Liga (garantindo os clássicos)
        const calendarioLiga = gerarJogosFaseLigaPaulista(times);
        
        // 2. Define estrutura da competição para o banco do jogo
        return {
            id: estadual.id,
            faseAtual: "fase_de_liga",
            rodadaAtual: 1,
            totalRodadas: 8,
            tabelaUnica: times.map(t => ({ clubeId: t.id, pontos: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 })),
            classificadosMataMata: 8,
            rebaixadosDiretos: 2,
            regrasMataMata: {
                quartas: { jogos: 1, mando: "melhor_campanha" },
                semifinal: { jogos: 1, mando: "melhor_campanha" },
                final: { jogos: 2, desempate: "saldo_penaltis" }
            },
            jogos: calendarioLiga
        };
    },

    // Regulamento Especial: Campeonato Carioca (Exemplo com Taça Guanabara se quiser no futuro)
    "est_rj": (estadual, times) => {
        // Implementação do formato do Rio
    },

    // REGULAMENTO PADRÃO / FALLBACK (Sua lógica antiga de 4, 8 ou 16 times)
    "padrao": (estadual, times) => {
        let tamanho = times.length >= 16 ? 16 : times.length >= 8 ? 8 : 4;
        const timesFiltrados = [...times].sort((a, b) => b.reputacao - a.reputacao).slice(0, tamanho);
        const faseInicial = tamanho === 16 ? "Oitavas de Final" : tamanho === 8 ? "Quartas de Final" : "Semifinal";
        
        return gerarChaveamentoMataMata(estadual.id, timesFiltrados, faseInicial);
    }
};
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

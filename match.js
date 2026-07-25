import { jogadoresIA, clubes } from '../data/database.js';

// ⏱️ Ritmo da transmissão ao vivo: cada tick avança ~3 minutos de jogo. Um
// intervalo maior dá tempo de ver o lance (bola, jogadores e legenda) antes
// do próximo, em vez de tudo passar rápido demais pra acompanhar.
const INTERVALO_TICK_MS = 1200;

export const PESO_GOL_POS = { "Atacante": 1.0, "Ponta": 0.78, "Meia Ofensivo": 0.62, "Meio-Campista": 0.38, "Volante": 0.16, "Lateral": 0.12, "Zagueiro": 0.07, "Goleiro": 0.01 };
export const PESO_AST_POS = { "Atacante": 0.32, "Ponta": 0.62, "Meia Ofensivo": 0.82, "Meio-Campista": 0.68, "Volante": 0.38, "Lateral": 0.44, "Zagueiro": 0.09, "Goleiro": 0.02 };
// 🎯 Chance de um remate sair de DENTRO da área por posição — usada só para
// classificar "finalizações na área" x "de fora" na Central da Partida.
// Não influencia gol/resultado, é puramente estatística de exibição.
const PESO_AREA_POS = { "Atacante": 0.82, "Ponta": 0.66, "Segundo Atacante": 0.78, "Extremo": 0.62, "Meia Ofensivo": 0.52, "Meio-Campista": 0.40, "Volante": 0.30, "Meia Defensivo": 0.28, "Box-to-Box": 0.35, "Lateral": 0.34, "Lateral Direito": 0.34, "Lateral Esquerdo": 0.34, "Lateral Ala": 0.38, "Zagueiro": 0.28, "Libero": 0.30, "Goleiro": 0.20 };

// 🧮 Sorteio ponderado genérico (mesmo princípio dos sorteios internos da
// MatchEngine) — exportado para o "reproduzirSimulacaoManager" (replay sem
// motor completo, em main.js) conseguir escolher um autor/assistente
// plausível por posição sem duplicar a lógica de pesos aqui.
export function sortearPonderado(lista, tabelaPesos, pesoPadrao = 0.2) {
    if (!lista || lista.length === 0) return null;
    const pool = lista.map(j => ({ j, peso: Math.pow((j.geral || 60) / 100, 4.2) * (tabelaPesos[j.posicao] ?? pesoPadrao) }));
    const total = pool.reduce((acc, x) => acc + x.peso, 0);
    if (total <= 0) return lista[Math.floor(Math.random() * lista.length)];
    let alvo = Math.random() * total;
    for (const item of pool) {
        alvo -= item.peso;
        if (alvo <= 0) return item.j;
    }
    return pool[pool.length - 1].j;
}
// 🎙️ Narrações de gol do jogador real — vivia declarada DENTRO de um dos
// branches de gol (bloco `if`) mas também era usada por outro branch
// separado (gol de visitante feito pelo jogador); como eram escopos de
// bloco distintos, a segunda leitura dava ReferenceError e derrubava a
// simulação na primeira vez que isso acontecesse. Agora é uma única lista
// no escopo do módulo, lida por qualquer um dos dois branches.
const NARRACOES_GOL_JOGADOR = [
    "Remate imparável ao ângulo!", "Golaço!", "Finalização de craque!", "Uma bomba no canto!",
    "Sem hipótese para o guarda-redes!", "Que categoria!", "O estádio explode em festa!",
    "Frieza absoluta na conclusão!", "Uma obra de arte!", "Colocou onde a coruja dorme!"
];

// 🛡️ TETO DE GOLS POR TEMPORADA (por posição) — mesmos valores usados pela
// simulação de fundo do mundo em main.js (atribuirEstatisticaNPC). Sem isto,
// um zagueiro ou goleiro NPC que "estivesse em campo" em muitas partidas
// transmitidas (Modo Manager com visual, ou jogos do próprio jogador) podia
// acumular dezenas de gols na temporada, já que aqui o sorteio nunca checava
// quantos gols aquele jogador já tinha feito — só o peso por posição, que é
// baixo mas não impede acúmulo ao longo de muitos jogos. Só vale para NPCs
// (id !== "player"); o jogador real nunca é limitado por isto.
const TETO_GOLS_TEMPORADA_POSICAO = { "Goleiro": 2, "Zagueiro": 6, "Lateral": 10, "Volante": 10, "Meio-Campista": 16, "Meia Ofensivo": 26, "Ponta": 30, "Atacante": 38 };
// 🟨 Quem mais comete falta: zagueiro/volante/lateral na frente, atacante bem atrás.
const PESO_FALTA_POS = { "Zagueiro": 1.15, "Volante": 1.10, "Lateral": 1.0, "Meio-Campista": 0.85, "Meia Ofensivo": 0.7, "Ponta": 0.6, "Atacante": 0.55, "Goleiro": 0.15 };

// ⚙️ ATRIBUTOS INDIVIDUAIS
// Cada jogador (real ou IA) passa a ter 8 atributos próprios em vez de só um
// OVR genérico: finalizacao, velocidade, passe, defesa ("carrinho"),
// cabeceamento, drible, resistencia, forca. Este perfil por posição diz o
// quanto cada atributo tende a se afastar do OVR médio conforme a posição
// (ex: um zagueiro tem carrinho/cabeceamento bem acima do seu OVR, e
// finalização bem abaixo — o oposto de um atacante).
export const PERFIS_ATRIBUTOS_POSICAO = {
    "Atacante":      { finalizacao: 1.16, velocidade: 1.05, passe: 0.82, defesa: 0.42, cabeceamento: 1.05, drible: 1.05, resistencia: 0.95, forca: 1.00, reflexos: 0.10, reposicao: 0.30, jogoAereo: 1.05 },
    "Ponta":         { finalizacao: 1.02, velocidade: 1.22, passe: 0.92, defesa: 0.42, cabeceamento: 0.68, drible: 1.18, resistencia: 1.00, forca: 0.85, reflexos: 0.10, reposicao: 0.30, jogoAereo: 0.68 },
    "Segundo Atacante": { finalizacao: 1.10, velocidade: 1.08, passe: 1.03, defesa: 0.45, cabeceamento: 0.80, drible: 1.16, resistencia: 0.98, forca: 0.90, reflexos: 0.10, reposicao: 0.30, jogoAereo: 0.80 },
    "Extremo":       { finalizacao: 0.95, velocidade: 1.20, passe: 1.08, defesa: 0.48, cabeceamento: 0.65, drible: 1.18, resistencia: 1.04, forca: 0.82, reflexos: 0.10, reposicao: 0.30, jogoAereo: 0.65 },
    "Meia Ofensivo": { finalizacao: 1.00, velocidade: 1.00, passe: 1.18, defesa: 0.48, cabeceamento: 0.68, drible: 1.15, resistencia: 0.95, forca: 0.82, reflexos: 0.10, reposicao: 0.35, jogoAereo: 0.68 },
    "Meio-Campista": { finalizacao: 0.78, velocidade: 0.92, passe: 1.18, defesa: 0.92, cabeceamento: 0.75, drible: 1.00, resistencia: 1.12, forca: 0.95, reflexos: 0.12, reposicao: 0.40, jogoAereo: 0.75 },
    "Volante":       { finalizacao: 0.55, velocidade: 0.85, passe: 1.00, defesa: 1.22, cabeceamento: 0.90, drible: 0.78, resistencia: 1.12, forca: 1.08, reflexos: 0.12, reposicao: 0.40, jogoAereo: 0.90 },
    "Meia Defensivo": { finalizacao: 0.52, velocidade: 0.84, passe: 1.06, defesa: 1.25, cabeceamento: 0.88, drible: 0.76, resistencia: 1.14, forca: 1.10, reflexos: 0.12, reposicao: 0.40, jogoAereo: 0.88 },
    "Box-to-Box":    { finalizacao: 0.88, velocidade: 1.02, passe: 1.08, defesa: 1.02, cabeceamento: 0.82, drible: 1.02, resistencia: 1.20, forca: 1.02, reflexos: 0.12, reposicao: 0.40, jogoAereo: 0.82 },
    "Lateral":       { finalizacao: 0.50, velocidade: 1.15, passe: 0.96, defesa: 1.08, cabeceamento: 0.72, drible: 0.90, resistencia: 1.10, forca: 0.90, reflexos: 0.10, reposicao: 0.35, jogoAereo: 0.72 },
    "Lateral Direito": { finalizacao: 0.50, velocidade: 1.15, passe: 0.98, defesa: 1.08, cabeceamento: 0.72, drible: 0.92, resistencia: 1.10, forca: 0.90, reflexos: 0.10, reposicao: 0.35, jogoAereo: 0.72 },
    "Lateral Esquerdo": { finalizacao: 0.50, velocidade: 1.15, passe: 0.98, defesa: 1.08, cabeceamento: 0.72, drible: 0.92, resistencia: 1.10, forca: 0.90, reflexos: 0.10, reposicao: 0.35, jogoAereo: 0.72 },
    "Lateral Ala":   { finalizacao: 0.65, velocidade: 1.18, passe: 1.04, defesa: 0.92, cabeceamento: 0.70, drible: 1.02, resistencia: 1.14, forca: 0.88, reflexos: 0.10, reposicao: 0.35, jogoAereo: 0.70 },
    "Zagueiro":      { finalizacao: 0.40, velocidade: 0.80, passe: 0.78, defesa: 1.28, cabeceamento: 1.22, drible: 0.60, resistencia: 1.00, forca: 1.20, reflexos: 0.12, reposicao: 0.35, jogoAereo: 1.22 },
    "Libero":        { finalizacao: 0.48, velocidade: 0.88, passe: 1.00, defesa: 1.20, cabeceamento: 1.10, drible: 0.78, resistencia: 1.04, forca: 1.12, reflexos: 0.12, reposicao: 0.48, jogoAereo: 1.10 },
    // 🧤 Goleiro tem o seu PRÓPRIO conjunto de atributos-chave — reflexos
    // (defesas de perto/reação), reposição (lançamentos/saída jogando) e jogo
    // aéreo (domínio da área em cruzamentos/escanteios) — em vez de depender
    // de "defesa" genérica como se fosse mais um zagueiro.
    "Goleiro":       { finalizacao: 0.15, velocidade: 0.60, passe: 0.68, defesa: 1.05, cabeceamento: 0.50, drible: 0.45, resistencia: 0.85, forca: 1.00, reflexos: 1.35, reposicao: 0.90, jogoAereo: 1.05 },
    "Goleiro Libero": { finalizacao: 0.18, velocidade: 0.72, passe: 0.95, defesa: 1.00, cabeceamento: 0.50, drible: 0.68, resistencia: 0.90, forca: 0.96, reflexos: 1.28, reposicao: 1.18, jogoAereo: 1.00 }
};

// Gera os 8 atributos individuais de um jogador a partir da posição e do OVR
// geral, com uma pitada de aleatoriedade (±5) para que dois jogadores com o
// mesmo OVR e a mesma posição nunca sejam clones idênticos um do outro.
export function gerarAtributosParaJogador(posicao, geral) {
    const perfil = PERFIS_ATRIBUTOS_POSICAO[posicao] || PERFIS_ATRIBUTOS_POSICAO["Meio-Campista"];
    const base = geral || 60;
    const clamp = (v) => Math.max(28, Math.min(99, Math.round(v)));
    const ruido = () => (Math.random() - 0.5) * 10;
    return {
        finalizacao:  clamp(base * perfil.finalizacao  + ruido()),
        velocidade:   clamp(base * perfil.velocidade   + ruido()),
        passe:        clamp(base * perfil.passe        + ruido()),
        defesa:       clamp(base * perfil.defesa       + ruido()),
        cabeceamento: clamp(base * perfil.cabeceamento + ruido()),
        drible:       clamp(base * perfil.drible       + ruido()),
        resistencia:  clamp(base * perfil.resistencia  + ruido()),
        forca:        clamp(base * perfil.forca        + ruido()),
        // 🧤 Atributos exclusivos de guarda-redes.
        reflexos:     clamp(base * perfil.reflexos     + ruido()),
        reposicao:    clamp(base * perfil.reposicao    + ruido()),
        jogoAereo:    clamp(base * perfil.jogoAereo    + ruido())
    };
}

// Compara um atributo real com o que seria "esperado" para a posição/OVR do
// jogador, devolvendo um fator em torno de 1.0 (1.0 = exatamente na média
// esperada). Usado para dar variação individual ao peso de golo/assistência
// sem descalibrar o balanceamento geral por posição que já existia.
function fatorDesvioAtributo(j, campo) {
    const perfil = PERFIS_ATRIBUTOS_POSICAO[j.posicao] || PERFIS_ATRIBUTOS_POSICAO["Meio-Campista"];
    const esperado = (j.geral || 60) * (perfil[campo] || 1);
    const real = j[campo] ?? esperado;
    if (esperado <= 0) return 1;
    return real / esperado;
}

// 🎯 Requisitos para PODERES bater um pênalti pelo teu time: precisas da
// confiança do técnico, teres treinado o suficiente essa cobrança específica,
// e seres titular (quem começa no banco não assume a responsabilidade,
// mesmo que já tenha entrado em campo).
export const MORAL_TECNICO_MINIMA_PENALTI = 60; // jogador.relacaoTecnico é 0-100
export const NIVEL_PENALTIS_MINIMO = 6; // jogador.lifestyle.upgrades.training.penalties é 0-10

export class MatchEngine {
    constructor(jogadorReal, clubeMandanteId, clubeVisitanteId, minutoEntradaJogador = null) {
        this.jogadorReal = jogadorReal;
        this.clubeMandanteId = clubeMandanteId;
        this.clubeVisitanteId = clubeVisitanteId;
        this.idMandante = clubeMandanteId;
        this.idVisitante = clubeVisitanteId;
        this.isSelecao = false;

        // Sistema de escalação: se minutoEntradaJogador for um número, o jogador
        // começa no banco e só passa a poder participar (ser sorteado como autor
        // de gol/assistência) a partir desse minuto. null/undefined = titular (joga desde o início).
        this.minutoEntradaJogador = minutoEntradaJogador;
        this.jogadorJaEntrou = (minutoEntradaJogador === null || minutoEntradaJogador === undefined);
        this._entradaAnunciada = false;

        let cMandante = clubes.find(c => c.id === clubeMandanteId);
        let cVisitante = clubes.find(c => c.id === clubeVisitanteId);
        
        this.nomeMandante = cMandante ? cMandante.nome : "Mandante";
        this.nomeVisitante = cVisitante ? cVisitante.nome : "Visitante";
        this.forcaMandante = cMandante ? cMandante.reputacao : 70;
        this.forcaVisitante = cVisitante ? cVisitante.reputacao : 70;

        if(clubeMandanteId.startsWith("sel_")) {
            const nacM = this.nomeMandante;
            const nacV = this.nomeVisitante;
            const filtrarSel = (nac) => jogadoresIA.filter(j => {
                const jn = (j.nacionalidade || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
                const alvo = (nac || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
                return (jn.includes(alvo.slice(0,4)) || alvo.includes(jn.slice(0,4))) && j.geral > 68;
            });
            this.elencoMandante = filtrarSel(nacM);
            this.elencoVisitante = filtrarSel(nacV);
            const jn = (jogadorReal.nacionalidade || "").toLowerCase();
            if (jn && (jn.includes(nacM.toLowerCase().slice(0,4)) || nacM.toLowerCase().includes(jn.slice(0,4))) && jogadorReal.naSelecao) this.elencoMandante.push(jogadorReal);
            else if (jn && (jn.includes(nacV.toLowerCase().slice(0,4)) || nacV.toLowerCase().includes(jn.slice(0,4))) && jogadorReal.naSelecao) this.elencoVisitante.push(jogadorReal);
        } else {
            this.elencoMandante = jogadoresIA.filter(j => j.clubeId === clubeMandanteId);
            this.elencoVisitante = jogadoresIA.filter(j => j.clubeId === clubeVisitanteId);
            if (jogadorReal.clubeId === clubeMandanteId) this.elencoMandante.push(jogadorReal);
            else if (jogadorReal.clubeId === clubeVisitanteId) this.elencoVisitante.push(jogadorReal);
        }

        if(this.elencoMandante.length === 0) this.elencoMandante.push(jogadorReal);
        if(this.elencoVisitante.length === 0) this.elencoVisitante.push({ id: "npc_riv", nome: "Rival Técnico", geral: 70, statsTemporada: { gols:0 } });

        // 📊 CENTRAL DA PARTIDA — estatísticas ao vivo por equipa (remates, xG,
        // posse, escanteios, faltas, cartões) e nota/condição por jogador. Tudo
        // aqui é DERIVADO dos mesmos eventos que já decidem gol/cartão acima —
        // nada disto altera placar, elenco ou o resultado da simulação; é só a
        // camada de dados que alimenta a nova tela (main.js consome via
        // obterSnapshot()/o 5º argumento do onTick).
        this.estatisticas = { casa: this._novoQuadroStats(), visita: this._novoQuadroStats() };
        this.notas = new Map(); // id -> { nome, lado, nota, condicao, cartao, gols, assist }
        this._ultimoEvento = null;
    }

    _novoQuadroStats() {
        return { remates: 0, alvo: 0, area: 0, fora: 0, escanteios: 0, faltas: 0, amarelos: 0, vermelhos: 0, xg: 0, xa: 0, posse: 50 };
    }

    // Garante (e devolve) a entrada de nota/condição de um jogador na Central
    // da Partida. Começa em 6.0 (nota "normal" de quem ainda não fez nada de
    // especial) e 100% de condição — decai naturalmente com o tempo de jogo
    // em _atualizarCondicoes(), lá embaixo.
    _garantirNota(j, lado) {
        if (!j || !j.id) return null;
        if (!this.notas.has(j.id)) {
            this.notas.set(j.id, { nome: j.nome, lado, nota: 6.0, condicao: 100, cartao: null, gols: 0, assist: 0, _resistencia: j.resistencia ?? 70 });
        }
        return this.notas.get(j.id);
    }

    _ajustarNota(j, lado, delta) {
        const entrada = this._garantirNota(j, lado);
        if (!entrada) return;
        entrada.nota = Math.max(3.5, Math.min(10, +(entrada.nota + delta).toFixed(1)));
    }

    // 🎯 xG aproximado do lance: parte de uma base por "qualidade" do remate
    // (gol > grande defesa > trave > pra fora) e escala com a finalização do
    // atirador. É só um número de exibição — nunca decide se a bola entra.
    _xgRemate(atirador, qualidadeBase) {
        const fFinal = atirador ? (atirador.finalizacao ?? atirador.geral ?? 60) / 70 : 1;
        const valor = qualidadeBase * Math.max(0.6, Math.min(1.5, fFinal)) + (Math.random() * 0.08 - 0.04);
        return Math.max(0.02, Math.min(0.92, +valor.toFixed(2)));
    }

    // 📍 Classifica o remate como "de dentro" ou "de fora" da área, por
    // probabilidade de posição — não há coordenadas reais no motor de texto,
    // então isto é só para preencher "Finalizações na área / de fora" com um
    // número plausível, coerente com quem costuma chutar de onde.
    _remateNaArea(atirador) {
        const chance = PESO_AREA_POS[atirador?.posicao] ?? 0.45;
        return Math.random() < chance;
    }

    // 🔢 Registra um remate nas estatísticas do lado que atacou e devolve o xG
    // gerado (para quem quiser somar em algo extra). "resultado" ∈
    // gol | alvo | fora | trave — todos contam como remate; gol/alvo/trave
    // contam pra "no alvo" (a bola ia entrar ou bateu na baliza).
    _registrarRemate(lado, resultado, atirador, qualidadeBase) {
        const stats = this.estatisticas[lado];
        stats.remates++;
        if (resultado === "gol" || resultado === "alvo") stats.alvo++;
        if (this._remateNaArea(atirador)) stats.area++; else stats.fora++;
        stats.xg = +(stats.xg + this._xgRemate(atirador, qualidadeBase)).toFixed(2);
    }

    // 🌀 Posse de bola: passeio aleatório suave ancorado na força relativa das
    // equipas (a mesma proporção que já decide quem cria mais chances),
    // limitado a uma faixa realista (25%-75%) pra nunca "travar" em 0/100.
    _atualizarPosse(fMandanteEfetiva, fVisitanteEfetiva) {
        const alvo = (fMandanteEfetiva / (fMandanteEfetiva + fVisitanteEfetiva)) * 100;
        const atual = this.estatisticas.casa.posse;
        const proximo = Math.max(25, Math.min(75, atual + (alvo - atual) * 0.12 + (Math.random() * 6 - 3)));
        this.estatisticas.casa.posse = Math.round(proximo);
        this.estatisticas.visita.posse = 100 - this.estatisticas.casa.posse;
    }

    // 🔋 Condição física: decai aos poucos conforme os minutos passam,
    // suavizada pela resistência de cada jogador — só cosmético (não altera
    // desempenho), mas dá vida à tabela de elenco da Central da Partida.
    _atualizarCondicoes(minuto) {
        const fatorMinuto = minuto / 90;
        for (const entrada of this.notas.values()) {
            // Ao minuto 90: ~4% de desgaste pra quem tem resistência altíssima
            // (≈99), ~30% pra quem tem resistência muito baixa (≈28).
            const desgasteMax = 40 - entrada._resistencia * 0.36;
            const desgaste = fatorMinuto * desgasteMax;
            entrada.condicao = Math.max(45, Math.min(100, Math.round(100 - desgaste - Math.random() * 3)));
        }
    }

    // 📦 Retorna uma cópia leve do estado atual (estatísticas + notas + o
    // último evento estruturado) — é isto que chega como 5º argumento do
    // onTick, pra Central da Partida renderizar sem tocar em nada interno.
    obterSnapshot() {
        return {
            estatisticas: { casa: { ...this.estatisticas.casa }, visita: { ...this.estatisticas.visita } },
            notas: Array.from(this.notas.entries()).map(([id, dados]) => ({ id, ...dados })),
            evento: this._ultimoEvento
        };
    }

    pesoGolador(j) {
        let peso = Math.pow((j.geral || 60) / 100, 4.6) * (PESO_GOL_POS[j.posicao] || 0.2);
        if((j.geral || 60) >= 84 && ["Atacante", "Ponta", "Meia Ofensivo"].includes(j.posicao)) peso *= 1.5;
        if((j.geral || 60) >= 88 && ["Atacante", "Ponta"].includes(j.posicao)) peso *= 1.35;
        // 🎯 Atributos individuais: um jogador com finalização/velocidade/cabeceamento
        // acima do esperado para a sua posição e OVR marca mais do que um colega
        // "genérico" com o mesmo OVR — e vice-versa. Fica em torno de 1.0 para
        // quem tem o perfil "médio" da posição, então não desbalanceia o jogo
        // de base, só cria variação individual real entre jogadores.
        const fatorIndividual = fatorDesvioAtributo(j, "finalizacao") * 0.6 + fatorDesvioAtributo(j, "velocidade") * 0.25 + fatorDesvioAtributo(j, "cabeceamento") * 0.15;
        peso *= Math.max(0.55, Math.min(1.6, fatorIndividual));
        return peso;
    }

    pesoAssistente(j) {
        let peso = Math.pow((j.geral || 60) / 100, 4.2) * (PESO_AST_POS[j.posicao] || 0.2);
        if((j.geral || 60) >= 84 && ["Ponta", "Meia Ofensivo", "Meio-Campista"].includes(j.posicao)) peso *= 1.45;
        // 🎯 Passe e drible pesam na conta de quem cria as jogadas de gol.
        const fatorIndividual = fatorDesvioAtributo(j, "passe") * 0.7 + fatorDesvioAtributo(j, "drible") * 0.3;
        peso *= Math.max(0.55, Math.min(1.6, fatorIndividual));
        return peso;
    }

    // Um jogador só pode ser sorteado como autor/assistente se já estiver em campo.
    // Isto vale apenas para o jogador real (id === "player"); NPCs sempre podem.
    podeParticipar(j) {
        if (j.id !== "player") return true;
        return this.jogadorJaEntrou;
    }

    // 🎯 Verifica se o jogador real REÚNE OS REQUISITOS para bater um pênalti:
    // confiança do técnico, nível de treino de pênaltis, e ser titular (não
    // basta ter entrado como suplente — a responsabilidade da cobrança é de
    // quem começou o jogo).
    podeBaterPenalti(j) {
        const ehTitular = this.minutoEntradaJogador === null || this.minutoEntradaJogador === undefined;
        const moral = j.relacaoTecnico ?? 0;
        const nivelPenaltis = j.lifestyle?.upgrades?.training?.penalties ?? 0;
        return ehTitular && moral >= MORAL_TECNICO_MINIMA_PENALTI && nivelPenaltis >= NIVEL_PENALTIS_MINIMO;
    }

    // 🟨 Sorteia quem comete a falta — mesmo esquema de peso por posição do
    // sorteio de gol/assistência, só que favorecendo quem defende.
    pesoFalta(j) {
        return PESO_FALTA_POS[j.posicao] || 0.7;
    }

    sortearFaltoso(elenco) {
        const disponiveis = elenco.filter(j => this.podeParticipar(j));
        const base = disponiveis.length > 0 ? disponiveis : elenco;
        if (base.length === 0) return null;
        const pool = base.map(j => ({ j, peso: this.pesoFalta(j) }));
        const total = pool.reduce((acc, x) => acc + x.peso, 0);
        let alvo = Math.random() * total;
        for (const item of pool) {
            alvo -= item.peso;
            if (alvo <= 0) return item.j;
        }
        return pool[0]?.j || base[0];
    }

    sortearAutor(elenco) {
        const disponiveis = elenco.filter(j => this.podeParticipar(j));
        let base = disponiveis.length > 0 ? disponiveis : elenco;
        // 🛡️ Aplica o teto de gols/temporada aos NPCs (nunca ao jogador real):
        // tira do sorteio quem já bateu o teto da própria posição. Se por
        // acaso todo mundo disponível já estiver no teto (elenco muito curto),
        // cai de volta pro "base" original em vez de travar o sorteio.
        const dentroDoTeto = base.filter(j => j.id === "player" || !j.statsTemporada || (j.statsTemporada.gols || 0) < (TETO_GOLS_TEMPORADA_POSICAO[j.posicao] ?? 45));
        if (dentroDoTeto.length > 0) base = dentroDoTeto;
        const pool = base.map(j => ({ j, peso: this.pesoGolador(j) }));
        const total = pool.reduce((acc, x) => acc + x.peso, 0);
        let alvo = Math.random() * total;
        for (const item of pool) {
            alvo -= item.peso;
            if (alvo <= 0) return item.j;
        }
        return pool[0]?.j || base[0];
    }

    sortearAssist(elenco, excluirId) {
        const disponiveis = elenco.filter(j => j.id !== excluirId && this.podeParticipar(j));
        const pool = disponiveis.map(j => ({ j, peso: this.pesoAssistente(j) }));
        if(pool.length === 0) return null;
        const total = pool.reduce((acc, x) => acc + x.peso, 0);
        let alvo = Math.random() * total;
        for (const item of pool) {
            alvo -= item.peso;
            if (alvo <= 0) return item.j;
        }
        return pool[0]?.j;
    }

    simularPartidaAoVivo(onTick, onComplete, onPenalti = null) {
        let placarCasa = 0; let placarVisita = 0; let minuto = 0; let marcadores = [];
        let emPausaPenalti = false;

        let modJogador = 1.0;
        if (this.jogadorReal.energia < 40) modJogador = 0.6;
        else if (this.jogadorReal.energia < 70) modJogador = 0.8;

        let fMandanteEfetiva = this.forcaMandante;
        let fVisitanteEfetiva = this.forcaVisitante;

        const timeJogador = this.isSelecao ? this.jogadorReal.selecaoId : this.jogadorReal.clubeId;
        if (timeJogador === this.clubeMandanteId) fMandanteEfetiva += (this.jogadorReal.geral - 70) * modJogador;
        if (timeJogador === this.clubeVisitanteId) fVisitanteEfetiva += (this.jogadorReal.geral - 70) * modJogador;

        let total = fMandanteEfetiva + fVisitanteEfetiva;
        let chanceC = (fMandanteEfetiva / total) * 0.045 + 0.005; 
        let chanceV = (fVisitanteEfetiva / total) * 0.045;

        // 🧤 Modo goleiro: se o jogador real for guarda-redes, cada remate perigoso
        // sofrido pela sua equipa tem hipótese de virar defesa dele em vez de golo sofrido.
        const souGoleiro = this.jogadorReal.posicao === "Goleiro";
        const resolverDefesaGoleiro = (equipaSofre) => {
            const golKeeperNaEquipa = souGoleiro && this.podeParticipar(this.jogadorReal) &&
                ((equipaSofre === "casa" && timeJogador === this.clubeMandanteId) || (equipaSofre === "visita" && timeJogador === this.clubeVisitanteId));
            if (!golKeeperNaEquipa) return false;
            // 🧤 Usa o atributo "defesa" do próprio goleiro (não só o OVR geral) —
            // um goleiro-tipo tem defesa bem acima do seu OVR médio, então isto
            // já reflete naturalmente a especialização de posição.
            const defesaAtributo = this.jogadorReal.reflexos ?? this.jogadorReal.defesa ?? this.jogadorReal.geral ?? 65;
            const chanceDefesa = 0.30 + Math.max(0, (defesaAtributo - 65)) * 0.012;
            if (Math.random() < chanceDefesa) {
                if (!this.jogadorReal.estatisticasAtuais.defesas) this.jogadorReal.estatisticasAtuais.defesas = 0;
                this.jogadorReal.estatisticasAtuais.defesas++;
                return true;
            }
            return false;
        };

        const rodarTick = () => {
            // 🛡️ FIX: guarda "dura" contra o relógio a avançar durante uma
            // decisão de pênalti pendente. Mesmo que, por qualquer motivo
            // (ex: um clique duplo, uma corrida entre eventos), este tick
            // ainda chegue a disparar enquanto aguardamos a escolha do lado,
            // ele não faz NADA — sem isto, era possível o cronómetro voltar a
            // correr "por baixo" do mini-jogo e o jogo ultrapassar os 90'
            // enquanto o jogador ainda estava a decidir o pênalti.
            if (emPausaPenalti) return;
            minuto = Math.min(90, minuto + 3); let log = null; let rng = Math.random();
            this._ultimoEvento = null; // 📊 só fica preenchido se ESTE tick gerar um evento de verdade

            if (!this.jogadorJaEntrou && !this._entradaAnunciada && this.minutoEntradaJogador !== null && minuto >= this.minutoEntradaJogador) {
                this.jogadorJaEntrou = true;
                this._entradaAnunciada = true;
                const timeJogadorEntra = this.isSelecao ? this.jogadorReal.selecaoId : this.jogadorReal.clubeId;
                const nomeTimeEntra = timeJogadorEntra === this.clubeMandanteId ? this.nomeMandante : this.nomeVisitante;
                const ladoEntra = timeJogadorEntra === this.clubeMandanteId ? "casa" : "visita";
                this._garantirNota(this.jogadorReal, ladoEntra).condicao = 100;
                const logEntrada = `<span style="color:#facc15; font-weight:800;">🔄 ${minuto}' SUBSTITUIÇÃO NO ${nomeTimeEntra.toUpperCase()}: ${this.jogadorReal.nome} entra em campo!</span>`;
                this._ultimoEvento = { tipo: "substituicao", minuto, lado: ladoEntra, jogadorId: this.jogadorReal.id, jogadorNome: this.jogadorReal.nome, texto: logEntrada };
                onTick(minuto, placarCasa, placarVisita, logEntrada, this.obterSnapshot());
            }

            // ⚽ Pênalti: pequena chance a cada lance perigoso. Se o jogador real puder
            // cobrar (é ele quem tem bola, jogador de linha) ou defender (é o goleiro do
            // lado que sofre), a simulação PAUSA e pede a decisão via onPenalti(...).
            if (rng > 0.965 && rng <= 0.975) {
                const bateCasa = Math.random() < (fMandanteEfetiva / total);
                const timeBateNome = bateCasa ? this.nomeMandante : this.nomeVisitante;
                const equipaSofre = bateCasa ? "visita" : "casa";
                const golsBate = timeJogador === (bateCasa ? this.clubeMandanteId : this.clubeVisitanteId);
                const souGoleiroDefende = souGoleiro && this.podeParticipar(this.jogadorReal) &&
                    timeJogador === (bateCasa ? this.clubeVisitanteId : this.clubeMandanteId);
                const souCobradorPotencial = !souGoleiro && golsBate && this.podeParticipar(this.jogadorReal) && ["Atacante","Ponta","Meia Ofensivo","Meio-Campista"].includes(this.jogadorReal.posicao) && this.podeBaterPenalti(this.jogadorReal);

                const ladoBate = bateCasa ? "casa" : "visita";
                const logPenaltiAwarded = `<span style="color:#facc15; font-weight:800;">🚩 ${minuto}' PÊNALTI PARA O ${timeBateNome.toUpperCase()}!</span>`;
                this._ultimoEvento = { tipo: "penalti", minuto, lado: ladoBate, texto: logPenaltiAwarded };
                onTick(minuto, placarCasa, placarVisita, logPenaltiAwarded, this.obterSnapshot());

                // cobradorObj: referência real do batedor (quando conhecida) — usada
                // só pra nota/estatística na Central da Partida; a narração em si
                // sempre usou apenas o nome, então isso não muda nenhum texto.
                const concluirPenalti = (defendeu, cobradorNome, cobradorObj = null) => {
                    // 🛡️ Retoma o relógio SÓ agora, depois de já termos o
                    // resultado do lance — nunca antes.
                    emPausaPenalti = false;
                    // 📊 Todo pênalti conta como remate de alta qualidade (xG padrão
                    // ~0.76) pro lado que bateu, tenha convertido ou não.
                    this._registrarRemate(ladoBate, "alvo", cobradorObj, 0.76);
                    if (defendeu) {
                        const ladoGoleiro = ladoBate === "casa" ? "visita" : "casa";
                        if (souGoleiroDefende) this._ajustarNota(this.jogadorReal, ladoGoleiro, 0.9);
                        if (cobradorObj) this._ajustarNota(cobradorObj, ladoBate, -0.3);
                        const logDefesaPenalti = `<span style="color:#a855f7; font-weight:800;">🧤 DEFESA! O guarda-redes ${souGoleiroDefende ? "É VOCÊ! " : ""}impede o pênalti de ${cobradorNome}!</span>`;
                        this._ultimoEvento = { tipo: "penalti_defendido", minuto, lado: ladoGoleiro, jogadorId: souGoleiroDefende ? this.jogadorReal.id : null, jogadorNome: souGoleiroDefende ? this.jogadorReal.nome : null, texto: logDefesaPenalti };
                        onTick(minuto, placarCasa, placarVisita, logDefesaPenalti, this.obterSnapshot());
                    } else {
                        if (bateCasa) placarCasa++; else placarVisita++;
                        if (cobradorObj) this._ajustarNota(cobradorObj, ladoBate, 1.0);
                        const logGolPenalti = `<span style="color: #10b981; font-weight: 800;">⚽ GOLO DE PÊNALTI! ${cobradorNome}${souCobradorPotencial ? " (É VOCÊ!)" : ""} não desperdiça!</span>`;
                        this._ultimoEvento = { tipo: "gol", minuto, lado: ladoBate, jogadorId: cobradorObj?.id || null, jogadorNome: cobradorNome, texto: logGolPenalti };
                        onTick(minuto, placarCasa, placarVisita, logGolPenalti, this.obterSnapshot());
                        if (golsBate && !this.isSelecao && this.jogadorReal.estatisticasAtuais) {
                            if (souCobradorPotencial) this.jogadorReal.estatisticasAtuais.gols++;
                        }
                        marcadores.push(souCobradorPotencial ? "player" : "npc_pen");
                    }
                    onTick(minuto, placarCasa, placarVisita, null, this.obterSnapshot());
                    if (minuto >= 90) { finalizar(); } else {
                        // 🛡️ Nunca deixa dois cronómetros ativos: garante que
                        // qualquer intervalo anterior está mesmo parado antes
                        // de agendar o próximo.
                        clearInterval(this.cronometro);
                        this.cronometro = setInterval(rodarTick, INTERVALO_TICK_MS);
                    }
                };

                if ((souGoleiroDefende || souCobradorPotencial) && typeof onPenalti === "function") {
                    emPausaPenalti = true;
                    clearInterval(this.cronometro);
                    onPenalti(souGoleiroDefende ? "defender" : "cobrar", (direcaoEscolhida) => {
                        // 🎮 GAMEPLAY: a direção que escolheste agora importa de verdade —
                        // é um duelo de zona contra zona, como um pênalti real. O
                        // "adversário" (goleiro ou cobrador controlado pelo motor)
                        // escolhe a sua própria zona de forma independente e oculta.
                        const ZONAS = ["esquerda", "centro", "direita"];
                        const zonaAdversario = ZONAS[Math.floor(Math.random() * ZONAS.length)];
                        const acertouLado = direcaoEscolhida === zonaAdversario;
                        let chanceSucesso;
                        if (souGoleiroDefende) {
                            // Sou o guarda-redes: acertar o MESMO lado do cobrador é o que me dá chance de defender.
                            // Usa o atributo "defesa" (não só OVR) — reflete melhor um goleiro especialista.
                            const defesaAtributo = this.jogadorReal.reflexos ?? this.jogadorReal.defesa ?? this.jogadorReal.geral ?? 65;
                            chanceSucesso = (acertouLado ? 0.58 : 0.08) + Math.max(0, (defesaAtributo - 65)) * 0.008;
                        } else {
                            // Sou o cobrador: quero o OPOSTO — se o guarda-redes for para o mesmo lado que eu, é pior para mim.
                            // Usa o atributo "finalização" (não só OVR).
                            const finalizacaoAtributo = this.jogadorReal.finalizacao ?? this.jogadorReal.geral ?? 65;
                            chanceSucesso = (acertouLado ? 0.30 : 0.90) + Math.max(0, (finalizacaoAtributo - 65)) * 0.005;
                        }
                        if (souGoleiroDefende) {
                            const defendeu = Math.random() < chanceSucesso;
                            if (defendeu && !this.jogadorReal.estatisticasAtuais.defesas) this.jogadorReal.estatisticasAtuais.defesas = 0;
                            if (defendeu) this.jogadorReal.estatisticasAtuais.defesas++;
                            // 🛡️ FIX: aqui estamos sempre no ramo "sou o goleiro que defende",
                            // então o cobrador é SEMPRE um NPC adversário — o texto antigo
                            // mostrava "você" como nome do cobrador por engano.
                            const cobradorNpc = bateCasa ? this.sortearAutor(this.elencoMandante) : this.sortearAutor(this.elencoVisitante);
                            concluirPenalti(defendeu, cobradorNpc.nome, cobradorNpc);
                        } else {
                            const converteu = Math.random() < chanceSucesso;
                            concluirPenalti(!converteu, "você", this.jogadorReal);
                        }
                    });
                    return;
                } else {
                    // Sem envolvimento direto do jogador: resolve automaticamente.
                    const cobrador = bateCasa ? this.sortearAutor(this.elencoMandante) : this.sortearAutor(this.elencoVisitante);
                    const finalizacaoCobrador = cobrador.finalizacao ?? cobrador.geral ?? 65;
                    const chanceErro = Math.max(0.06, 0.32 - Math.max(0, (finalizacaoCobrador - 65)) * 0.006);
                    const defendeu = resolverDefesaGoleiro(equipaSofre) || Math.random() < chanceErro;
                    concluirPenalti(defendeu, cobrador.nome, cobrador);
                    return;
                }
            }

            if (rng < chanceC) {
                placarCasa++;
                let autor = this.sortearAutor(this.elencoMandante);
                let assist = null;
                if(autor.id === "player") {
                    if(!this.isSelecao) this.jogadorReal.estatisticasAtuais.gols++;
                    const frase = NARRACOES_GOL_JOGADOR[Math.floor(Math.random() * NARRACOES_GOL_JOGADOR.length)];
                    log = `<span style="color: #10b981; font-weight: 800;">⚽ ${minuto}' GOLO DO ${this.nomeMandante.toUpperCase()}! É SEU! ${frase}</span>`;
                } else {
                    if (autor.statsTemporada) autor.statsTemporada.gols++;
                    assist = Math.random() < 0.72 ? this.sortearAssist(this.elencoMandante, autor.id) : null;
                    if(assist?.statsTemporada && assist.id !== autor.id) assist.statsTemporada.assistencias++;
                    log = `<span style="color: #3b82f6;">⚽ ${minuto}' GOLO DO ${this.nomeMandante.toUpperCase()}! ${autor.nome}${assist ? ` (assist. ${assist.nome})` : ""} balança as redes.</span>`;
                }
                marcadores.push(autor.id);
                // 📊 Central da Partida: remate certeiro (gol), nota do autor/assistente.
                this._registrarRemate("casa", "gol", autor, 0.42);
                this._ajustarNota(autor, "casa", 1.0);
                if (assist) this._ajustarNota(assist, "casa", 0.5);
                if (assist) this.estatisticas.casa.xa = +(this.estatisticas.casa.xa + 0.35).toFixed(2);
                this._ultimoEvento = { tipo: "gol", minuto, lado: "casa", jogadorId: autor.id, jogadorNome: autor.nome, assistNome: assist?.nome || null, texto: log };
            } 
            else if (rng < chanceC + chanceV) {
                // 🧤 Antes de sofrer o golo, dá hipótese ao goleiro real de defender.
                if (resolverDefesaGoleiro("casa")) {
                    log = `<span style="color: #a855f7; font-weight: 800;">🧤 ${minuto}' DEFESAÇA SUA! Tirou um golo praticamente feito!</span>`;
                    this._registrarRemate("visita", "alvo", null, 0.30);
                    this._ajustarNota(this.jogadorReal, "casa", 0.6);
                    this._ultimoEvento = { tipo: "defesa", minuto, lado: "casa", jogadorId: this.jogadorReal.id, jogadorNome: this.jogadorReal.nome, texto: log };
                } else {
                    placarVisita++;
                    let autor = this.sortearAutor(this.elencoVisitante);
                    let assist = null;
                    if(autor.id === "player") {
                        if(!this.isSelecao) this.jogadorReal.estatisticasAtuais.gols++;
                        const frase = NARRACOES_GOL_JOGADOR[Math.floor(Math.random() * NARRACOES_GOL_JOGADOR.length)];
                        log = `<span style="color: #10b981; font-weight: 800;">⚽ ${minuto}' GOLO DO ${this.nomeVisitante.toUpperCase()}! É SEU! ${frase}</span>`;
                    } else {
                        if (autor.statsTemporada) autor.statsTemporada.gols++;
                        assist = Math.random() < 0.72 ? this.sortearAssist(this.elencoVisitante, autor.id) : null;
                        if(assist?.statsTemporada && assist.id !== autor.id) assist.statsTemporada.assistencias++;
                        log = `<span style="color: #ef4444;">⚽ ${minuto}' GOLO DO ${this.nomeVisitante.toUpperCase()}! ${autor.nome}${assist ? ` (assist. ${assist.nome})` : ""} marca!</span>`;
                    }
                    marcadores.push(autor.id);
                    this._registrarRemate("visita", "gol", autor, 0.42);
                    this._ajustarNota(autor, "visita", 1.0);
                    if (assist) this._ajustarNota(assist, "visita", 0.5);
                    if (assist) this.estatisticas.visita.xa = +(this.estatisticas.visita.xa + 0.35).toFixed(2);
                    this._ultimoEvento = { tipo: "gol", minuto, lado: "visita", jogadorId: autor.id, jogadorNome: autor.nome, assistNome: assist?.nome || null, texto: log };
                }
            } 
            else if (rng > 0.94) {
                const ladoTrave = Math.random() > 0.5 ? "casa" : "visita";
                let timeAtaque = ladoTrave === "casa" ? this.nomeMandante : this.nomeVisitante;
                log = `<span style="color: #cbd5e1;">😲 ${minuto}' NA TRAVE! O ataque do ${timeAtaque} quase marca!</span>`;
                this._registrarRemate(ladoTrave, "trave", null, 0.25);
                this._ultimoEvento = { tipo: "trave", minuto, lado: ladoTrave, texto: log };
            } 
            else if (rng > 0.91) {
                const ladoDefende = timeJogador === this.clubeMandanteId ? "casa" : "visita";
                const ladoAtacaSalvo = ladoDefende === "casa" ? "visita" : "casa";
                const defesaMinha = resolverDefesaGoleiro(ladoDefende);
                log = defesaMinha
                    ? `<span style="color: #a855f7; font-weight: 800;">🧤 ${minuto}' GRANDE DEFESA SUA! Estica-se todo e evita o golo!</span>`
                    : `<span style="color: #a855f7;">🧤 ${minuto}' ENORME DEFESA! O guarda-redes estica-se todo!</span>`;
                this._registrarRemate(ladoAtacaSalvo, "alvo", null, 0.30);
                if (defesaMinha) this._ajustarNota(this.jogadorReal, ladoDefende, 0.5);
                this._ultimoEvento = { tipo: "defesa", minuto, lado: ladoDefende, jogadorId: defesaMinha ? this.jogadorReal.id : null, jogadorNome: defesaMinha ? this.jogadorReal.nome : null, texto: log };
            }
            // 🟨🟥 Cartões: faixa própria do rng, fora dos golos/defesas/trave acima,
            // então não rouba chance de nenhum outro evento. Amarelo é mais comum;
            // um segundo amarelo (ou vermelho direto, mais raro) tira o jogador de
            // campo pro resto da partida — sai do elenco sorteável e o time perde
            // um pouco de força efetiva, exatamente como jogar com um a menos.
            else if (rng > 0.865 && rng <= 0.91) {
                const ehVermelhoDireto = rng <= 0.87;
                const timeCartao = Math.random() < (fMandanteEfetiva / total) ? "casa" : "visita";
                const elencoCartao = timeCartao === "casa" ? this.elencoMandante : this.elencoVisitante;
                const nomeTime = timeCartao === "casa" ? this.nomeMandante : this.nomeVisitante;
                const jogadorCartao = this.sortearFaltoso(elencoCartao);
                if (jogadorCartao) {
                    if (!this._amarelosPartida) this._amarelosPartida = new Map();
                    const amarelosAntes = this._amarelosPartida.get(jogadorCartao.id) || 0;
                    const viraVermelho = ehVermelhoDireto || amarelosAntes >= 1;
                    if (jogadorCartao.id === "player") {
                        if (!this.jogadorReal.estatisticasAtuais.cartoesAmarelos) this.jogadorReal.estatisticasAtuais.cartoesAmarelos = 0;
                        if (!this.jogadorReal.estatisticasAtuais.cartoesVermelhos) this.jogadorReal.estatisticasAtuais.cartoesVermelhos = 0;
                        if (viraVermelho) this.jogadorReal.estatisticasAtuais.cartoesVermelhos++; else this.jogadorReal.estatisticasAtuais.cartoesAmarelos++;
                    } else if (jogadorCartao.statsTemporada) {
                        if (viraVermelho) jogadorCartao.statsTemporada.cartoesVermelhos = (jogadorCartao.statsTemporada.cartoesVermelhos || 0) + 1;
                        else jogadorCartao.statsTemporada.cartoesAmarelos = (jogadorCartao.statsTemporada.cartoesAmarelos || 0) + 1;
                    }
                    if (viraVermelho) {
                        this._amarelosPartida.set(jogadorCartao.id, 2);
                        const idx = elencoCartao.indexOf(jogadorCartao);
                        if (idx >= 0) elencoCartao.splice(idx, 1);
                        if (timeCartao === "casa") { fMandanteEfetiva *= 0.9; chanceC *= 0.82; total = fMandanteEfetiva + fVisitanteEfetiva; }
                        else { fVisitanteEfetiva *= 0.9; chanceV *= 0.82; total = fMandanteEfetiva + fVisitanteEfetiva; }
                        const motivo = ehVermelhoDireto ? "após entrada duríssima" : "por acumular dois amarelos";
                        log = `<span style="color: #ef4444; font-weight: 800;">🟥 ${minuto}' CARTÃO VERMELHO! ${jogadorCartao.nome} (${nomeTime}) é expulso ${motivo} — equipa fica com dez!</span>`;
                        this.estatisticas[timeCartao].vermelhos++;
                        const notaVermelho = this._garantirNota(jogadorCartao, timeCartao);
                        if (notaVermelho) notaVermelho.cartao = "vermelho";
                        this._ajustarNota(jogadorCartao, timeCartao, -1.3);
                    } else {
                        this._amarelosPartida.set(jogadorCartao.id, amarelosAntes + 1);
                        log = `<span style="color: #facc15; font-weight: 700;">🟨 ${minuto}' Cartão amarelo para ${jogadorCartao.nome} (${nomeTime}).</span>`;
                        this.estatisticas[timeCartao].amarelos++;
                        const notaAmarelo = this._garantirNota(jogadorCartao, timeCartao);
                        if (notaAmarelo) notaAmarelo.cartao = "amarelo";
                        this._ajustarNota(jogadorCartao, timeCartao, -0.4);
                    }
                    this._ultimoEvento = { tipo: viraVermelho ? "vermelho" : "amarelo", minuto, lado: timeCartao, jogadorId: jogadorCartao.id, jogadorNome: jogadorCartao.nome, texto: log };
                }
            }
            // 🎥 Eventos cosméticos para a camada visual (VisualMatchEngine):
            // escanteio, falta, impedimento e pausa para atendimento médico.
            // Ocupam só uma fatia do rng que antes ficava sem nenhum relato
            // (abaixo da faixa de cartões) e NÃO tocam em placar, cartões,
            // elenco ou posse "oficial" — servem apenas de comentário extra
            // para a transmissão tática, sem alterar o resultado da partida.
            else if (rng > 0.60 && rng <= 0.865) {
                const timeAtaqueCosmetico = Math.random() < (fMandanteEfetiva / total) ? "casa" : "visita";
                const timeDefesaCosmetico = timeAtaqueCosmetico === "casa" ? "visita" : "casa";
                const nomeAtaqueCosmetico = timeAtaqueCosmetico === "casa" ? this.nomeMandante : this.nomeVisitante;
                const nomeDefesaCosmetico = timeAtaqueCosmetico === "casa" ? this.nomeVisitante : this.nomeMandante;
                if (rng <= 0.70) {
                    log = `<span style="color:#93c5fd;">🚩 ${minuto}' ESCANTEIO para o ${nomeAtaqueCosmetico.toUpperCase()}.</span>`;
                    this.estatisticas[timeAtaqueCosmetico].escanteios++;
                    this._ultimoEvento = { tipo: "escanteio", minuto, lado: timeAtaqueCosmetico, texto: log };
                } else if (rng <= 0.80) {
                    log = `<span style="color:#cbd5e1;">🟦 ${minuto}' FALTA sofrida pelo ${nomeAtaqueCosmetico} perto da área do ${nomeDefesaCosmetico}.</span>`;
                    // A falta é sofrida pelo atacante, ou seja, cometida por quem defende.
                    this.estatisticas[timeDefesaCosmetico].faltas++;
                    this._ultimoEvento = { tipo: "falta", minuto, lado: timeDefesaCosmetico, texto: log };
                } else if (rng <= 0.845) {
                    log = `<span style="color:#f97316;">🚩 ${minuto}' IMPEDIMENTO assinalado no ataque do ${nomeAtaqueCosmetico}.</span>`;
                    this._ultimoEvento = { tipo: "impedimento", minuto, lado: timeAtaqueCosmetico, texto: log };
                } else {
                    log = `<span style="color:#fca5a5;">🩹 ${minuto}' Pausa para atendimento médico.</span>`;
                    this._ultimoEvento = { tipo: "atendimento", minuto, lado: null, texto: log };
                }
            }

            this._atualizarPosse(fMandanteEfetiva, fVisitanteEfetiva);
            this._atualizarCondicoes(minuto);
            onTick(minuto, placarCasa, placarVisita, log, this.obterSnapshot());
            if (minuto >= 90) finalizar();
        };

        const finalizar = () => {
            clearInterval(this.cronometro);
            const minutosJogados = this.jogadorJaEntrou ? Math.max(0, 90 - Math.max(0, this.minutoEntradaJogador || 0)) : 0;
            onComplete(placarCasa, placarVisita, marcadores, this.jogadorJaEntrou, minutosJogados);
        };

        // Guarda a referência do tick para os controles de ritmo abaixo
        // (definirVelocidade/pausar/retomar) poderem reagendar o mesmo
        // setInterval com outro intervalo, sem duplicar nem alterar a
        // lógica de sorteio/gols/cartões acima.
        this._rodarTick = rodarTick;
        this._velocidadeAtual = 1;
        this.cronometro = setInterval(rodarTick, INTERVALO_TICK_MS);
    }

    // ⏯️/⏩ Controles de ritmo usados pela VisualMatchEngine (play/pause,
    // 1x/2x/4x/8x). Mexem SÓ no intervalo do setInterval — o mesmo tick
    // (rodarTick) continua rodando, com o mesmo RNG e as mesmas regras de
    // sempre, então o resultado final da partida nunca muda, só a
    // velocidade com que os eventos chegam até a transmissão visual.
    definirVelocidade(multiplicador = 1) {
        if (!this._rodarTick) return;
        this._velocidadeAtual = Math.max(0.25, multiplicador || 1);
        if (!this.cronometro) return; // está pausado; a velocidade só entra em vigor ao retomar
        clearInterval(this.cronometro);
        const intervalo = Math.max(60, INTERVALO_TICK_MS / this._velocidadeAtual);
        this.cronometro = setInterval(this._rodarTick, intervalo);
    }

    pausar() {
        if (this.cronometro) { clearInterval(this.cronometro); this.cronometro = null; }
    }

    retomar() {
        if (this.cronometro || !this._rodarTick) return;
        const intervalo = Math.max(60, INTERVALO_TICK_MS / (this._velocidadeAtual || 1));
        this.cronometro = setInterval(this._rodarTick, intervalo);
    }
}

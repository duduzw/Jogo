import { jogadoresIA, clubes } from '../data/database.js';

const PESO_GOL_POS = { "Atacante": 1.0, "Ponta": 0.78, "Meia Ofensivo": 0.62, "Meio-Campista": 0.38, "Volante": 0.16, "Lateral": 0.12, "Zagueiro": 0.07, "Goleiro": 0.01 };
const PESO_AST_POS = { "Atacante": 0.32, "Ponta": 0.62, "Meia Ofensivo": 0.82, "Meio-Campista": 0.68, "Volante": 0.38, "Lateral": 0.44, "Zagueiro": 0.09, "Goleiro": 0.02 };

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
    "Meia Ofensivo": { finalizacao: 1.00, velocidade: 1.00, passe: 1.18, defesa: 0.48, cabeceamento: 0.68, drible: 1.15, resistencia: 0.95, forca: 0.82, reflexos: 0.10, reposicao: 0.35, jogoAereo: 0.68 },
    "Meio-Campista": { finalizacao: 0.78, velocidade: 0.92, passe: 1.18, defesa: 0.92, cabeceamento: 0.75, drible: 1.00, resistencia: 1.12, forca: 0.95, reflexos: 0.12, reposicao: 0.40, jogoAereo: 0.75 },
    "Volante":       { finalizacao: 0.55, velocidade: 0.85, passe: 1.00, defesa: 1.22, cabeceamento: 0.90, drible: 0.78, resistencia: 1.12, forca: 1.08, reflexos: 0.12, reposicao: 0.40, jogoAereo: 0.90 },
    "Lateral":       { finalizacao: 0.50, velocidade: 1.15, passe: 0.96, defesa: 1.08, cabeceamento: 0.72, drible: 0.90, resistencia: 1.10, forca: 0.90, reflexos: 0.10, reposicao: 0.35, jogoAereo: 0.72 },
    "Zagueiro":      { finalizacao: 0.40, velocidade: 0.80, passe: 0.78, defesa: 1.28, cabeceamento: 1.22, drible: 0.60, resistencia: 1.00, forca: 1.20, reflexos: 0.12, reposicao: 0.35, jogoAereo: 1.22 },
    // 🧤 Goleiro tem o seu PRÓPRIO conjunto de atributos-chave — reflexos
    // (defesas de perto/reação), reposição (lançamentos/saída jogando) e jogo
    // aéreo (domínio da área em cruzamentos/escanteios) — em vez de depender
    // de "defesa" genérica como se fosse mais um zagueiro.
    "Goleiro":       { finalizacao: 0.15, velocidade: 0.60, passe: 0.68, defesa: 1.05, cabeceamento: 0.50, drible: 0.45, resistencia: 0.85, forca: 1.00, reflexos: 1.35, reposicao: 0.90, jogoAereo: 1.05 }
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

    sortearAutor(elenco) {
        const disponiveis = elenco.filter(j => this.podeParticipar(j));
        const base = disponiveis.length > 0 ? disponiveis : elenco;
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

            if (!this.jogadorJaEntrou && !this._entradaAnunciada && this.minutoEntradaJogador !== null && minuto >= this.minutoEntradaJogador) {
                this.jogadorJaEntrou = true;
                this._entradaAnunciada = true;
                const timeJogadorEntra = this.isSelecao ? this.jogadorReal.selecaoId : this.jogadorReal.clubeId;
                const nomeTimeEntra = timeJogadorEntra === this.clubeMandanteId ? this.nomeMandante : this.nomeVisitante;
                onTick(minuto, placarCasa, placarVisita, `<span style="color:#facc15; font-weight:800;">🔄 ${minuto}' SUBSTITUIÇÃO NO ${nomeTimeEntra.toUpperCase()}: ${this.jogadorReal.nome} entra em campo!</span>`);
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

                onTick(minuto, placarCasa, placarVisita, `<span style="color:#facc15; font-weight:800;">🚩 ${minuto}' PÊNALTI PARA O ${timeBateNome.toUpperCase()}!</span>`);

                const concluirPenalti = (defendeu, cobradorNome) => {
                    // 🛡️ Retoma o relógio SÓ agora, depois de já termos o
                    // resultado do lance — nunca antes.
                    emPausaPenalti = false;
                    if (defendeu) {
                        onTick(minuto, placarCasa, placarVisita, `<span style="color:#a855f7; font-weight:800;">🧤 DEFESA! O guarda-redes ${souGoleiroDefende ? "É VOCÊ! " : ""}impede o pênalti de ${cobradorNome}!</span>`);
                    } else {
                        if (bateCasa) placarCasa++; else placarVisita++;
                        onTick(minuto, placarCasa, placarVisita, `<span style="color: #10b981; font-weight: 800;">⚽ GOLO DE PÊNALTI! ${cobradorNome}${souCobradorPotencial ? " (É VOCÊ!)" : ""} não desperdiça!</span>`);
                        if (golsBate && !this.isSelecao && this.jogadorReal.estatisticasAtuais) {
                            if (souCobradorPotencial) this.jogadorReal.estatisticasAtuais.gols++;
                        }
                        marcadores.push(souCobradorPotencial ? "player" : "npc_pen");
                    }
                    onTick(minuto, placarCasa, placarVisita, null);
                    if (minuto >= 90) { finalizar(); } else {
                        // 🛡️ Nunca deixa dois cronómetros ativos: garante que
                        // qualquer intervalo anterior está mesmo parado antes
                        // de agendar o próximo.
                        clearInterval(this.cronometro);
                        this.cronometro = setInterval(rodarTick, 110);
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
                            concluirPenalti(defendeu, souGoleiroDefende ? "você" : (bateCasa ? this.sortearAutor(this.elencoMandante).nome : this.sortearAutor(this.elencoVisitante).nome));
                        } else {
                            const converteu = Math.random() < chanceSucesso;
                            concluirPenalti(!converteu, "você");
                        }
                    });
                    return;
                } else {
                    // Sem envolvimento direto do jogador: resolve automaticamente.
                    const cobrador = bateCasa ? this.sortearAutor(this.elencoMandante) : this.sortearAutor(this.elencoVisitante);
                    const finalizacaoCobrador = cobrador.finalizacao ?? cobrador.geral ?? 65;
                    const chanceErro = Math.max(0.06, 0.32 - Math.max(0, (finalizacaoCobrador - 65)) * 0.006);
                    const defendeu = resolverDefesaGoleiro(equipaSofre) || Math.random() < chanceErro;
                    concluirPenalti(defendeu, cobrador.nome);
                    return;
                }
            }

            if (rng < chanceC) {
                placarCasa++;
                let autor = this.sortearAutor(this.elencoMandante);
                if(autor.id === "player") {
                    if(!this.isSelecao) this.jogadorReal.estatisticasAtuais.gols++;
                   const narracoes = [
                    "Remate imparável ao ângulo!",
                    "Golaço!",
                    "Finalização de craque!",
                    "Uma bomba no canto!",
                    "Sem hipótese para o guarda-redes!",
                    "Que categoria!",
                    "O estádio explode em festa!",
                    "Frieza absoluta na conclusão!",
                    "Uma obra de arte!",
                    "Colocou onde a coruja dorme!"
                ];

                const frase = narracoes[Math.floor(Math.random() * narracoes.length)];

                log = `<span style="color: #10b981; font-weight: 800;">⚽ ${minuto}' GOLO DO ${this.nomeMandante.toUpperCase()}! É SEU! ${frase}</span>`;
                } else {
                    if (autor.statsTemporada) autor.statsTemporada.gols++;
                    const assist = Math.random() < 0.72 ? this.sortearAssist(this.elencoMandante, autor.id) : null;
                    if(assist?.statsTemporada && assist.id !== autor.id) assist.statsTemporada.assistencias++;
                    log = `<span style="color: #3b82f6;">⚽ ${minuto}' GOLO DO ${this.nomeMandante.toUpperCase()}! ${autor.nome}${assist ? ` (assist. ${assist.nome})` : ""} balança as redes.</span>`;
                }
                marcadores.push(autor.id);
            } 
            else if (rng < chanceC + chanceV) {
                // 🧤 Antes de sofrer o golo, dá hipótese ao goleiro real de defender.
                if (resolverDefesaGoleiro("casa")) {
                    log = `<span style="color: #a855f7; font-weight: 800;">🧤 ${minuto}' DEFESAÇA SUA! Tirou um golo praticamente feito!</span>`;
                } else {
                    placarVisita++;
                    let autor = this.sortearAutor(this.elencoVisitante);
                    if(autor.id === "player") {
                        if(!this.isSelecao) this.jogadorReal.estatisticasAtuais.gols++;
                       const frase = narracoes[Math.floor(Math.random() * narracoes.length)];

                    log = `<span style="color: #10b981; font-weight: 800;">⚽ ${minuto}' GOLO DO ${this.nomeVisitante.toUpperCase()}! É SEU! ${frase}</span>`;
                    
                    } else {
                        if (autor.statsTemporada) autor.statsTemporada.gols++;
                        const assist = Math.random() < 0.72 ? this.sortearAssist(this.elencoVisitante, autor.id) : null;
                        if(assist?.statsTemporada && assist.id !== autor.id) assist.statsTemporada.assistencias++;
                        log = `<span style="color: #ef4444;">⚽ ${minuto}' GOLO DO ${this.nomeVisitante.toUpperCase()}! ${autor.nome}${assist ? ` (assist. ${assist.nome})` : ""} marca!</span>`;
                    }
                    marcadores.push(autor.id);
                }
            } 
            else if (rng > 0.94) {
                let timeAtaque = Math.random() > 0.5 ? this.nomeMandante : this.nomeVisitante;
                log = `<span style="color: #cbd5e1;">😲 ${minuto}' NA TRAVE! O ataque do ${timeAtaque} quase marca!</span>`;
            } 
            else if (rng > 0.91) {
                const defesaMinha = resolverDefesaGoleiro(timeJogador === this.clubeMandanteId ? "casa" : "visita");
                log = defesaMinha
                    ? `<span style="color: #a855f7; font-weight: 800;">🧤 ${minuto}' GRANDE DEFESA SUA! Estica-se todo e evita o golo!</span>`
                    : `<span style="color: #a855f7;">🧤 ${minuto}' ENORME DEFESA! O guarda-redes estica-se todo!</span>`;
            }

            onTick(minuto, placarCasa, placarVisita, log);
            if (minuto >= 90) finalizar();
        };

        const finalizar = () => {
            clearInterval(this.cronometro);
            const minutosJogados = this.jogadorJaEntrou ? Math.max(0, 90 - Math.max(0, this.minutoEntradaJogador || 0)) : 0;
            onComplete(placarCasa, placarVisita, marcadores, this.jogadorJaEntrou, minutosJogados);
        };

        this.cronometro = setInterval(rodarTick, 110);
    }
}

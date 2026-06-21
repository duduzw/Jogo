import { jogadoresIA, clubes } from '../data/database.js';

const PESO_GOL_POS = { "Atacante": 1.0, "Ponta": 0.78, "Meia Ofensivo": 0.62, "Meio-Campista": 0.38, "Volante": 0.16, "Lateral": 0.12, "Zagueiro": 0.07, "Goleiro": 0.01 };
const PESO_AST_POS = { "Atacante": 0.32, "Ponta": 0.62, "Meia Ofensivo": 0.82, "Meio-Campista": 0.68, "Volante": 0.38, "Lateral": 0.44, "Zagueiro": 0.09, "Goleiro": 0.02 };

export class MatchEngine {
    constructor(jogadorReal, clubeMandanteId, clubeVisitanteId) {
        this.jogadorReal = jogadorReal;
        this.clubeMandanteId = clubeMandanteId;
        this.clubeVisitanteId = clubeVisitanteId;
        this.idMandante = clubeMandanteId;
        this.idVisitante = clubeVisitanteId;
        this.isSelecao = false;

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
        return peso;
    }

    pesoAssistente(j) {
        let peso = Math.pow((j.geral || 60) / 100, 4.2) * (PESO_AST_POS[j.posicao] || 0.2);
        if((j.geral || 60) >= 84 && ["Ponta", "Meia Ofensivo", "Meio-Campista"].includes(j.posicao)) peso *= 1.45;
        return peso;
    }

    sortearAutor(elenco) {
        const pool = elenco.map(j => ({ j, peso: this.pesoGolador(j) }));
        const total = pool.reduce((acc, x) => acc + x.peso, 0);
        let alvo = Math.random() * total;
        for (const item of pool) {
            alvo -= item.peso;
            if (alvo <= 0) return item.j;
        }
        return pool[0]?.j || elenco[0];
    }

    sortearAssist(elenco, excluirId) {
        const pool = elenco.filter(j => j.id !== excluirId).map(j => ({ j, peso: this.pesoAssistente(j) }));
        if(pool.length === 0) return null;
        const total = pool.reduce((acc, x) => acc + x.peso, 0);
        let alvo = Math.random() * total;
        for (const item of pool) {
            alvo -= item.peso;
            if (alvo <= 0) return item.j;
        }
        return pool[0]?.j;
    }

    simularPartidaAoVivo(onTick, onComplete) {
        let placarCasa = 0; let placarVisita = 0; let minuto = 0; let marcadores = [];

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

        const cronometro = setInterval(() => {
            minuto += 3; let log = null; let rng = Math.random();

            if (rng < chanceC) {
                placarCasa++;
                let autor = this.sortearAutor(this.elencoMandante);
                if(autor.id === "player") {
                    if(!this.isSelecao) this.jogadorReal.estatisticasAtuais.gols++;
                    log = `<span style="color: #10b981; font-weight: 800;">⚽ ${minuto}' GOLO DO ${this.nomeMandante.toUpperCase()}! É SEU! Remate imparável ao ângulo!</span>`;
                } else {
                    if (autor.statsTemporada) autor.statsTemporada.gols++;
                    const assist = Math.random() < 0.72 ? this.sortearAssist(this.elencoMandante, autor.id) : null;
                    if(assist?.statsTemporada && assist.id !== autor.id) assist.statsTemporada.assistencias++;
                    log = `<span style="color: #3b82f6;">⚽ ${minuto}' GOLO DO ${this.nomeMandante.toUpperCase()}! ${autor.nome}${assist ? ` (assist. ${assist.nome})` : ""} balança as redes.</span>`;
                }
                marcadores.push(autor.id);
            } 
            else if (rng < chanceC + chanceV) {
                placarVisita++;
                let autor = this.sortearAutor(this.elencoVisitante);
                if(autor.id === "player") {
                    if(!this.isSelecao) this.jogadorReal.estatisticasAtuais.gols++;
                    log = `<span style="color: #10b981; font-weight: 800;">⚽ ${minuto}' GOLO DO ${this.nomeVisitante.toUpperCase()}! É SEU! Finalização de craque!</span>`;
                } else {
                    if (autor.statsTemporada) autor.statsTemporada.gols++;
                    const assist = Math.random() < 0.72 ? this.sortearAssist(this.elencoVisitante, autor.id) : null;
                    if(assist?.statsTemporada && assist.id !== autor.id) assist.statsTemporada.assistencias++;
                    log = `<span style="color: #ef4444;">⚽ ${minuto}' GOLO DO ${this.nomeVisitante.toUpperCase()}! ${autor.nome}${assist ? ` (assist. ${assist.nome})` : ""} marca!</span>`;
                }
                marcadores.push(autor.id);
            } 
            else if (rng > 0.94) {
                let timeAtaque = Math.random() > 0.5 ? this.nomeMandante : this.nomeVisitante;
                log = `<span style="color: #cbd5e1;">😲 ${minuto}' NA TRAVE! O ataque do ${timeAtaque} quase marca!</span>`;
            } 
            else if (rng > 0.91) {
                log = `<span style="color: #a855f7;">🧤 ${minuto}' ENORME DEFESA! O guarda-redes estica-se todo!</span>`;
            }

            onTick(minuto, placarCasa, placarVisita, log);

            if (minuto >= 90) {
                clearInterval(cronometro);
                onComplete(placarCasa, placarVisita, marcadores);
            }
        }, 110);
    }
}

function processarEventosAleatorios() {
    if(!jogador || Math.random() > 0.22) return;
    inicializarEstadoCarreiraJogador();
    if(jogador.lesaoRodadas > 0) {
        jogador.lesaoRodadas = Math.max(0, jogador.lesaoRodadas - 1);
        if(jogador.lesaoRodadas === 0) registrarNoticia("Liberado pelo departamento médico", `${jogador.nome} voltou a treinar sem limitações e já disputa lugar nos convocados.`, "Lesão");
        return;
    }
    const clube = clubes.find(c => c.id === jogador.clubeId);
    const eventos = [
        () => {
            jogador.energia = Math.max(35, jogador.energia - 8);
            registrarNoticia("Desgaste físico preocupa comissão técnica", `${jogador.nome} sentiu a sequência de jogos no ${clube?.nome || "clube"} e terá carga controlada nos treinos.`, "Treino");
        },
        () => {
            jogador.energia = Math.min(100, jogador.energia + 12);
            registrarNoticia("Treino regenerativo anima o balneário", `${jogador.nome} respondeu bem ao trabalho físico e chega mais inteiro para a próxima rodada.`, "Treino");
        },
        () => {
            jogador.pontosPremio = (jogador.pontosPremio || 0) + 8;
            jogador.pontosPremioTemporada = (jogador.pontosPremioTemporada || 0) + 8;
            registrarNoticia("Coletiva repercute forte", `"Quero decidir jogos grandes", disse ${jogador.nome} em entrevista. A frase ganhou força nas redes e aumentou o barulho pelo prêmio individual.`, "Entrevista");
        },
        () => {
            const alvo = jogadoresIA.filter(j => !j.aposentado).sort((a,b)=>b.geral-a.geral)[Math.floor(Math.random()*8)];
            if(alvo) registrarNoticia("Debate esquenta entre craques", `A imprensa comparou ${jogador.nome} com ${alvo.nome}. O assunto dominou programas esportivos durante a semana.`, "Mídia");
        },
        () => {
            const rival = clubes.filter(c => c.id !== jogador.clubeId).sort((a,b)=>b.reputacao-a.reputacao)[Math.floor(Math.random()*8)];
            if(rival) registrarNoticia("Rumor de bastidores movimenta o mercado", `Dirigentes do ${rival.nome} observaram ${jogador.nome}, mas nenhuma proposta oficial chegou.`, "Rumor");
        },
        () => {
            const jovem = jogadoresIA.filter(j => !j.aposentado && j.idade <= 21).sort((a,b)=>b.geral-a.geral)[0];
            if(jovem) registrarNoticia("Olheiros miram jovem promessa", `${jovem.nome} virou assunto em relatórios de clubes grandes depois de boas atuações recentes.`, "Olheiros");
        },
        () => {
            // Apply injury risk reduction from physiotherapist
            let injuryChance = 0.55;
            if(jogador.lifestyle && jogador.lifestyle.multipliers.injuryRiskReduction) {
                injuryChance = Math.max(0.15, injuryChance - jogador.lifestyle.multipliers.injuryRiskReduction);
            }
            if(Math.random() < injuryChance) {
                jogador.lesaoRodadas = Math.floor(Math.random() * 3) + 1;
                ajustarTitularidade(-8);
                registrarNoticia("Lesão no treino preocupa", `${jogador.nome} sofreu um problema físico e deve ficar fora por ${jogador.lesaoRodadas} semana(s).`, "Lesão");
                abrirEntrevista("lesao");
            }
        },
        () => {
            ajustarTitularidade(5);
            registrarNoticia("Treinador elogia aplicação tática", `${jogador.nome} ganhou pontos na luta por uma vaga nos 11 titulares após uma semana forte de treinos.`, "Treino");
        },
        () => {
            ajustarTitularidade(-5);
            registrarNoticia("Concorrência aumenta no elenco", `A disputa pela posição de ${jogador.nome} ficou mais intensa, e a comissão técnica ainda não definiu os titulares.`, "Bastidores");
        },
        () => {
            if(clube) {
                clube.tatica = ["Pressão Alta", "Posse de Bola", "Bloco Baixo", "Contra-ataque", "Equilibrado"][Math.floor(Math.random() * 5)];
                ajustarTitularidade((jogador.inteligencia || 60) > 70 ? 4 : -2);
                registrarNoticia("Treinador testa novo esquema", `${clube.nome} trabalhou em ${clube.tatica}, e ${jogador.nome} precisa adaptar movimentos para ganhar espaço.`, "Tática");
            }
        },
        () => {
            jogador.felicidade = Math.min(100, (jogador.felicidade || 60) + 6);
            registrarNoticia("Torcida canta o nome do jogador", `A relação entre ${jogador.nome} e os adeptos cresceu depois de uma semana de apoio nas arquibancadas e nas redes.`, "Torcida");
        },
        () => {
            jogador.felicidade = Math.max(0, (jogador.felicidade || 60) - 6);
            registrarNoticia("Rumor de insatisfação nos bastidores", `Fontes próximas ao elenco dizem que ${jogador.nome} quer mais minutos e observa as próximas decisões do treinador.`, "Bastidores");
        },
        () => {
            if (clube) {
                const cofres = (clube.orcamento || 0) >= 40000000;
                registrarNoticia(cofres ? "Diretoria libera investimento pesado" : "Clube trabalha para equilibrar as contas",
                    cofres ? `${clube.nome} confirmou orçamento robusto para reforçar o elenco na próxima janela.` : `${clube.nome} negocia patrocínios extras antes de pensar em grandes reforços.`,
                    "Finanças");
            }
        },
        () => {
            const doisClubes = [...clubes].filter(c => c.id !== jogador.clubeId).sort(() => Math.random() - 0.5).slice(0, 2);
            if (doisClubes.length === 2) {
                const destaqueRival = jogadoresIA.filter(j => j.clubeId === doisClubes[0].id && !j.aposentado).sort((a, b) => b.geral - a.geral)[0];
                if (destaqueRival) registrarNoticia("Mercado mundial em ebulição", `Rumores apontam interesse do ${doisClubes[1].nome} em ${destaqueRival.nome}, destaque do ${doisClubes[0].nome}.`, "Mundo");
            }
        },
        () => {
            if (clube) {
                const pressao = Math.random() < 0.5;
                registrarNoticia(pressao ? "Técnico sob pressão" : "Diretoria confirma apoio ao treinador",
                    pressao ? `Resultados irregulares do ${clube.nome} colocam o comando técnico sob desconfiança da torcida.` : `${clube.nome} descarta mudança no comando técnico e garante confiança total no trabalho atual.`,
                    "Bastidores");
            }
        },
        () => {
            const jogos = jogador.estatisticasAtuais?.jogos || 0;
            if (jogos > 0 && jogos % 10 === 0) registrarNoticia("Marca redonda", `${jogador.nome} chegou a ${jogos} jogos na temporada pelo ${clube?.nome || "clube"}.`, "Números");
            else registrarNoticia("Estatísticas em destaque", `Especialistas analisam a evolução de números de ${jogador.nome} nas últimas rodadas.`, "Números");
        },
        () => {
            const marcas = ["Rytmo", "Volt Sport", "Fúria Esportiva", "NorthStar", "Prisma"];
            registrarNoticia("Marca aposta no jogador", `${jogador.nome} fechou ação promocional com a ${marcas[Math.floor(Math.random() * marcas.length)]}, ampliando presença fora de campo.`, "Marketing");
        },
        () => {
            const jovemBase = jogadoresIA.filter(j => !j.aposentado && j.idade <= 19).sort((a, b) => (b.potencial || 0) - (a.potencial || 0))[Math.floor(Math.random() * 5)];
            if (jovemBase) registrarNoticia("Base badalada", `${jovemBase.nome}, de apenas ${jovemBase.idade} anos, vem sendo apontado como futuro destaque das categorias de base.`, "Base");
        },
        () => {
            const polemica = Math.random() < 0.5;
            registrarNoticia(polemica ? "Arbitragem em debate" : "Comitê disciplinar analisa lances da rodada",
                polemica ? "Decisões da arbitragem na última rodada geraram polêmica entre torcedores e comentaristas." : "Departamento de arbitragem revisa lances polêmicos antes da próxima rodada.",
                "Arbitragem");
        },
        () => {
            registrarNoticia("Calendário apertado preocupa comissões técnicas", "A sequência de jogos em curto espaço de tempo levanta debate sobre a gestão de desgaste físico dos atletas.", "Calendário");
        },
        () => {
            const rankPremio = [...jogadoresIA].filter(j => !j.aposentado).sort((a, b) => b.geral - a.geral).slice(0, 10);
            const nomeado = rankPremio[Math.floor(Math.random() * rankPremio.length)];
            if (nomeado) registrarNoticia("Corrida por prêmio individual esquenta", `${nomeado.nome} entra na lista de favoritos ao prêmio de melhor do ano segundo a imprensa especializada.`, "Prémios");
        },
        () => {
            registrarNoticia("Observado pela seleção", `A comissão técnica da seleção nacional monitora de perto o desempenho de ${jogador.nome} de olho nas próximas convocações.`, "Seleções");
        },
        () => {
            if (clube) {
                const rival = clubes.filter(c => c.ligaId === clube.ligaId && c.id !== clube.id).sort((a, b) => b.reputacao - a.reputacao)[0];
                if (rival) registrarNoticia("Clássico se aproxima", `Torcidas já sentem o clima do duelo entre ${clube.nome} e ${rival.nome} nas próximas rodadas.`, "Clássico");
            }
        },
        () => {
            const jogosSemana = Math.floor(Math.random() * 3) + 1;
            registrarNoticia("Pauta tática da semana", `${clube?.nome || "O clube"} ajustou detalhes de posicionamento nos treinos visando os próximos ${jogosSemana} compromisso(s).`, "Tática");
        },
        () => {
            registrarNoticia("Bastidores do vestiário", `Companheiros de elenco elogiaram a postura profissional de ${jogador.nome} durante a semana de treinos.`, "Bastidores");
        },
        () => {
            const scoutClube = clubes.filter(c => c.reputacao >= 80 && c.id !== jogador.clubeId).sort(() => Math.random() - 0.5)[0];
            if (scoutClube) registrarNoticia("Olheiros de fora observam o campeonato", `Relatórios de scouts do ${scoutClube.nome} circularam apontando nomes a acompanhar na liga.`, "Olheiros");
        },
        () => {
            registrarNoticia("Redes sociais em alta", `Um vídeo de treino de ${jogador.nome} viralizou nas redes e repercutiu entre torcedores de várias equipas.`, "Mídia");
        },
    ];
    eventos[Math.floor(Math.random() * eventos.length)]();
    renderizarNoticias();
}

function verificarJanelaMeioAno() {
    const marco = Math.max(7, Math.floor((agendaTemporada.length || 20) * 0.48));
    if(!janelaMeioAnoProcessada && rodadaAtual >= marco) {
        janelaMeioAnoProcessada = true;
        processarMercadoTransferencias("meio");
        registrarNoticia("Janela de meio de ano aberta", "Clubes priorizam empréstimos, ajustes curtos de elenco e oportunidades pontuais de transferência.", "Mercado");
        window.salvarJogo();
    }
}

// ==========================================
// 🌍 MOTOR DE ESTATÍSTICAS E COPAS GLOBAIS
// ==========================================
// Compara um atributo real do jogador com o que seria "esperado" pela sua
// posição/OVR (mesmo conceito usado no motor de partida) — usado para que
// estatísticas defensivas (desarmes, interceptações, defesas) variem de
// verdade conforme o atributo "defesa" de cada jogador, não só o OVR genérico.
function fatorAtributoIndividual(j, campo) {
    const perfil = PERFIS_ATRIBUTOS_POSICAO[j.posicao] || PERFIS_ATRIBUTOS_POSICAO["Meio-Campista"];
    const esperado = (j.geral || 60) * (perfil[campo] || 1);
    const real = j[campo] ?? esperado;
    return esperado > 0 ? Math.max(0.4, Math.min(1.9, real / esperado)) : 1;
}

// Recalcula o OVR (geral) de QUALQUER jogador a partir dos seus atributos
// individuais — mas agora PONDERADO pela posição: cada atributo pesa
// conforme a sua relevância real pra posição do jogador (os mesmos
// multiplicadores de PERFIS_ATRIBUTOS_POSICAO usados para gerar os
// atributos). Antes era uma média simples dos 8 atributos, o que castigava
// injustamente um atacante com carrinho fraco (correto pra posição dele) e
// achatava o OVR dele mesmo com finalização/velocidade excelentes.
function calcularGeralDeAtributos(j) {
    const perfil = PERFIS_ATRIBUTOS_POSICAO[j.posicao] || PERFIS_ATRIBUTOS_POSICAO["Meio-Campista"];
    const campos = j.posicao === "Goleiro"
        ? ["reflexos", "reposicao", "jogoAereo", "velocidade", "resistencia", "forca"]
        : ["finalizacao", "velocidade", "passe", "defesa", "cabeceamento", "drible", "resistencia", "forca"];
    let somaValor = 0, somaPeso = 0;
    campos.forEach(campo => {
        let peso = perfil[campo] || 1;
        if (j.posicao === "Goleiro" && campo === "reflexos") peso *= 2; // reflexos é o atributo decisivo de um goleiro
        somaValor += (j[campo] ?? 60) * peso;
        somaPeso += peso;
    });
    return Math.max(40, Math.min(99, Math.floor(somaValor / somaPeso)));
}

// 📈📉 Evolui (ou regride) um jogador: em vez de só mexer no número do OVR
// (o que deixava o OVR "solto", sem refletir em nenhum atributo real), isto
// sobe/desce TODOS os atributos individuais dele de forma proporcional ao
// delta — com uma variação própria por atributo, pra não parecer um bloco
// monolítico subindo/descendo igual — e só DEPOIS recalcula o OVR a partir
// deles. Assim um jogador que sobe de OVR fica de verdade mais rápido/melhor
// finalizador/etc, e um que cai perde atributos de verdade (não só o rótulo).
// 🆕 TETO DE POTENCIAL: sem isto, todo jovem crescia na mesma taxa até 99,
// então com o tempo o mundo inteiro ficava cheio de craques (nada de jogador
// que "não vingou"). Agora cada jovem tem um teto pessoal, sorteado de forma
// enviesada — a maioria mal evolui mais do que já tem, e só uma fração bem
// pequena tem margem pra virar um jogador de elite. Reflete a realidade: a
// maioria das promessas de base nunca vira craque.
function gerarPotencialJogador(geralAtual) {
    const r = Math.random();
    let bonus;
    if (r < 0.60) bonus = Math.floor(Math.random() * 6);            // 60%: quase não evolui (+0 a +5)
    else if (r < 0.88) bonus = 6 + Math.floor(Math.random() * 9);   // 28%: evolução moderada (+6 a +14)
    else if (r < 0.98) bonus = 15 + Math.floor(Math.random() * 11); // 10%: boa evolução (+15 a +25)
    else bonus = 26 + Math.floor(Math.random() * 15);               // 2%: craque em formação (+26 a +40)
    return Math.min(99, (geralAtual || 60) + bonus);
}
// Para jogadores que já existiam sem "potencial" definido (ex: elenco real
// inicial do jogo, sem esse campo em jogadores.js): joga em cima de idade —
// quem já é veterano não tem mais teto a explorar; quem é jovem ganha um teto
// gerado agora mesmo (guardado, pra não sortear de novo toda temporada).
function obterOuGerarPotencial(j) {
    if (typeof j.potencial === "number") return j.potencial;
    if ((j.idade || 24) >= 27) { j.potencial = j.geral || 60; return j.potencial; }
    j.potencial = gerarPotencialJogador(j.geral || 60);
    return j.potencial;
}

function evoluirAtributosEGeral(j, delta) {
    if (!delta) { j.geral = Math.max(40, Math.min(99, j.geral)); return; }
    const campos = j.posicao === "Goleiro"
        ? ["reflexos", "reposicao", "jogoAereo", "velocidade", "resistencia", "forca"]
        : ["finalizacao", "velocidade", "passe", "defesa", "cabeceamento", "drible", "resistencia", "forca"];
    campos.forEach(campo => {
        if (typeof j[campo] !== "number") return;
        const variacao = delta + (Math.random() - 0.5) * Math.abs(delta) * 0.7;
        j[campo] = Math.max(28, Math.min(99, Math.round(j[campo] + variacao)));
    });
    j.geral = calcularGeralDeAtributos(j);
}

// 🔧 RECONCILIAÇÃO OVR ↔ ATRIBUTOS
// Corrige jogadores cujo OVR e atributos ficaram dessincronizados — por
// exemplo, saves antigos onde uma queda de OVR por idade aconteceu ANTES de
// evoluirAtributosEGeral() existir, deixando o número do OVR baixo mas os
// atributos individuais ainda "ótimos" (sem terem caído junto). A partir de
// agora o OVR é sempre um resumo dos atributos — então, se um jogador teve
// uma queda de OVR, os atributos TÊM de acompanhar essa queda (e vice-versa
// se o OVR ficou pra trás de atributos que já subiram).
function sincronizarAtributosComOver(j) {
    if (!j) return;
    if (typeof j.finalizacao !== "number" && typeof j.reflexos !== "number") return;
    const geralEsperado = calcularGeralDeAtributos(j);
    const diff = (j.geral || 60) - geralEsperado;
    if (Math.abs(diff) < 2) return; // já está coerente, não mexe
    evoluirAtributosEGeral(j, diff);
}
function sincronizarTodosOversComAtributos() {
    sincronizarAtributosComOver(jogador);
    jogadoresIA.forEach(j => { if (!j.aposentado) sincronizarAtributosComOver(j); });
}

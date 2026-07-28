const ESTILOS_TREINADOR = ["pressao", "posse", "retranca", "contra", "equilibrado"];
const NOMES_TREINADOR = ["Marcelo","Fernando","Ricardo","Paulo","André","Bruno","Vitor","Nuno","Jorge","Luís","Hernán","Diego","Mauricio","Roberto","Carlos","Sergio","Thiago","Renato","Ivan","Klaus","Hans","Marco","Luca","Antoine","Didier","José","Pedro"];
const SOBRENOMES_TREINADOR = ["Almeida","Santos","Ferreira","Ribeiro","Cardoso","Teixeira","Moreira","Barros","Correia","Pinto","Guardiola","Bielsa","Sampaoli","Ancelotti","Conte","Klopp","Nagelsmann","Deschamps","Martins","Azevedo","Rocha","Duarte"];

function gerarNomeTreinador() {
    return `${NOMES_TREINADOR[Math.floor(Math.random() * NOMES_TREINADOR.length)]} ${SOBRENOMES_TREINADOR[Math.floor(Math.random() * SOBRENOMES_TREINADOR.length)]}`;
}

// 🌍 Nacionalidades usadas para preencher treinadores 100% aleatórios (sem
// entrada na base curada). Reaproveita a lista de seleções quando disponível.
function sortearNacionalidadeTreinador() {
    if (typeof SELECOES !== "undefined" && Array.isArray(SELECOES) && SELECOES.length) {
        return SELECOES[Math.floor(Math.random() * SELECOES.length)].pais;
    }
    return "Brasil";
}

// 🎯 Puxa um técnico ainda não usado da base curada (data/tecnicos.js) — nomes,
// nacionalidades e estilos de técnicos reais/conhecidos. Retorna null quando a
// base já foi toda usada (aí quem chamar cai no gerador de nomes aleatório).
function sortearTecnicoCurado() {
    const usados = new Set((treinadoresIA || []).map(t => t.nome));
    const disponiveis = TECNICOS_REAIS.filter(t => !usados.has(t.nome));
    if (!disponiveis.length) return null;
    return disponiveis[Math.floor(Math.random() * disponiveis.length)];
}

// Cria um treinador novo (sem clube/seleção ainda — quem chama atribui).
// Prioriza puxar da base curada de técnicos reais (data/tecnicos.js); só cai
// no gerador de nome aleatório quando a base já foi toda distribuída.
function criarTreinador(reputacaoBase = 65) {
    const curado = sortearTecnicoCurado();
    if (curado) {
        return {
            id: `tec_${Date.now().toString(36)}_${Math.floor(Math.random() * 99999)}`,
            nome: curado.nome,
            wikiNome: curado.wikiNome || curado.nome,
            nacionalidade: curado.nacionalidade,
            estiloJogo: curado.estiloJogo,
            foto: curado.foto || "", fotoIndisponivel: false,
            reputacao: Math.max(35, Math.min(96, Math.round(((curado.reputacaoBase ?? reputacaoBase) + reputacaoBase) / 2 + (Math.random() * 10 - 5)))),
            clubeId: null, selecaoId: null,
            temporadasNoCargo: 0, demissoes: 0, titulos: 0, historicoTecnico: [],
            exJogadorId: null, aposentado: false, curado: true
        };
    }
    return {
        id: `tec_${Date.now().toString(36)}_${Math.floor(Math.random() * 99999)}`,
        nome: gerarNomeTreinador(),
        wikiNome: null,
        nacionalidade: sortearNacionalidadeTreinador(),
        estiloJogo: ESTILOS_TREINADOR[Math.floor(Math.random() * ESTILOS_TREINADOR.length)],
        foto: "", fotoIndisponivel: false,
        reputacao: Math.max(35, Math.min(96, Math.round(reputacaoBase + (Math.random() * 20 - 10)))),
        clubeId: null, selecaoId: null,
        temporadasNoCargo: 0, demissoes: 0, titulos: 0, historicoTecnico: [],
        exJogadorId: null, aposentado: false, curado: false
    };
}

// Usado para vagas sem técnico explicitamente definido em data/tecnicos.js.
// Assim um clube não recebe por acidente um técnico real que estava reservado
// para outro clube da database.
function criarTreinadorGenerico(reputacaoBase = 65) {
    return {
        id: `tec_${Date.now().toString(36)}_${Math.floor(Math.random() * 99999)}`,
        nome: gerarNomeTreinador(), wikiNome: null,
        nacionalidade: sortearNacionalidadeTreinador(),
        estiloJogo: ESTILOS_TREINADOR[Math.floor(Math.random() * ESTILOS_TREINADOR.length)],
        foto: "", fotoIndisponivel: false,
        reputacao: Math.max(35, Math.min(96, Math.round(reputacaoBase + (Math.random() * 20 - 10)))),
        clubeId: null, selecaoId: null,
        temporadasNoCargo: 0, demissoes: 0, titulos: 0, historicoTecnico: [],
        exJogadorId: null, aposentado: false, curado: false
    };
}

// 🌱 Uma fatia BEM pequena de jogadores recém-aposentados vira treinador —
// herda um pouco da reputação de jogador (OVR de pico) mas começa sempre
// modesto como técnico, precisando construir reputação própria do zero.
function criarTreinadorDeExJogador(jogadorAposentado) {
    const t = criarTreinador(Math.max(40, Math.min(70, (jogadorAposentado.geral || 65) - 12)));
    t.nome = jogadorAposentado.nome;
    t.exJogadorId = jogadorAposentado.id;
    t.curado = false; t.wikiNome = null;
    // Herda a foto e nacionalidade que o jogador já tinha no elenco (mais
    // fiel do que sortear ou tentar buscar na Wikipedia pelo nome).
    if (jogadorAposentado.foto) { t.foto = jogadorAposentado.foto; t.fotoIndisponivel = false; }
    if (jogadorAposentado.nacionalidade) t.nacionalidade = jogadorAposentado.nacionalidade;
    return t;
}

function garantirHistoricoTecnico(treinador, clube = null, selecao = null) {
    if (!treinador) return;
    if (!Array.isArray(treinador.historicoTecnico)) treinador.historicoTecnico = [];
    const alvo = clube || selecao;
    const chave = clube ? clube.id : (selecao ? selecao.id : null);
    if (!alvo || treinador.historicoTecnico.some(h => h.id === chave && !h.fim)) return;
    treinador.historicoTecnico.push({ id: chave, nome: clube?.nome || selecao?.pais || selecao?.nome, inicio: anoAtual, fim: null, motivo: "Em atividade" });
}

function encerrarHistoricoTecnico(treinador, clube, motivo) {
    if (!treinador || !clube) return;
    garantirHistoricoTecnico(treinador, clube);
    const passagem = [...treinador.historicoTecnico].reverse().find(h => h.id === clube.id && !h.fim);
    if (passagem) { passagem.fim = anoAtual; passagem.motivo = motivo; }
}

// 🔤 Compara nomes de clube/seleção de forma tolerante (sem acento, minúsculo,
// substring) — usado só pra tentar casar TECNICOS_REAIS.clubeNome/selecaoNome
// com o `nome`/`pais` reais do teu save. Nunca lança erro; na dúvida, não bate.
function _normalizarNomeParaComparacao(s) {
    return (s || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function _nomesParecidos(a, b) {
    const na = _normalizarNomeParaComparacao(a), nb = _normalizarNomeParaComparacao(b);
    if (!na || !nb) return false;
    return na === nb || na.includes(nb) || nb.includes(na);
}

// Garante que TODOS os clubes e TODAS as seleções têm um treinador atribuído
// — chamado uma vez no arranque (jogo novo ou save antigo sem o mercado).
// Antes de sortear um técnico curado qualquer, tenta achar na base um técnico
// cujo clubeNome/selecaoNome bate com ESTE clube/seleção específico — assim
// Guardiola nasce no City, Ancelotti na Seleção Brasileira, etc.
function garantirTreinadoresIniciais() {
    if (!Array.isArray(treinadoresIA)) treinadoresIA = [];
    clubes.forEach(clube => {
        const existente = treinadoresIA.find(t => t.clubeId === clube.id);
        if (existente) { garantirHistoricoTecnico(existente, clube); sincronizarNomeTecnico(clube); return; }
        const t = criarTreinadorParaVaga({ tipo: "clube", nome: clube.nome, reputacaoBase: clube.reputacao || 65 });
        t.clubeId = clube.id;
        garantirHistoricoTecnico(t, clube);
        treinadoresIA.push(t);
        sincronizarNomeTecnico(clube);
    });
    if (typeof SELECOES !== "undefined") {
        SELECOES.forEach(sel => {
            const existente = treinadoresIA.find(t => t.selecaoId === sel.id);
            if (existente) { garantirHistoricoTecnico(existente, null, sel); return; }
            const t = criarTreinadorParaVaga({ tipo: "selecao", nome: sel.pais || sel.nome, reputacaoBase: 70 });
            t.selecaoId = sel.id;
            garantirHistoricoTecnico(t, null, sel);
            treinadoresIA.push(t);
        });
    }
}

// Tenta achar, na base curada, um técnico real associado a este clube/seleção
// específico (por id ou nome) e ainda não usado; se achar, cria o treinador já
// com esses dados. Se não achar, usa um técnico genérico.
function criarTreinadorParaVaga({ tipo, nome, reputacaoBase }) {
    const usados = new Set((treinadoresIA || []).map(t => t.nome));
    const campo = tipo === "clube" ? "clubeNome" : "selecaoNome";
    const entidade = tipo === "clube" ? clubes.find(c => c.nome === nome) : (typeof SELECOES !== "undefined" ? SELECOES.find(s => (s.pais || s.nome) === nome) : null);
    const campoId = tipo === "clube" ? "clubeId" : "selecaoId";
    const curado = TECNICOS_REAIS.find(t => !usados.has(t.nome) && (t[campoId] === entidade?.id || (t[campo] && _nomesParecidos(t[campo], nome))));
    if (!curado) return criarTreinadorGenerico(reputacaoBase);
    return {
        id: `tec_${Date.now().toString(36)}_${Math.floor(Math.random() * 99999)}`,
        nome: curado.nome,
        wikiNome: curado.wikiNome || curado.nome,
        nacionalidade: curado.nacionalidade,
        estiloJogo: curado.estiloJogo,
        foto: curado.foto || "", fotoIndisponivel: false,
        reputacao: Math.max(35, Math.min(96, Math.round(((curado.reputacaoBase ?? reputacaoBase) + reputacaoBase) / 2 + (Math.random() * 6 - 3)))),
        clubeId: null, selecaoId: null,
        temporadasNoCargo: 0, demissoes: 0, titulos: 0, historicoTecnico: [],
        exJogadorId: null, aposentado: false, curado: true
    };
}

// Mantém clube.tecnico (a string simples usada em todo o Modo Jogador) em
// sincronia com o treinador de verdade deste clube.
function sincronizarNomeTecnico(clube) {
    const t = treinadoresIA.find(x => x.clubeId === clube.id);
    if (t) clube.tecnico = t.nome;
}

// Demite o treinador de um clube: ele fica livre no mercado (mais fácil de
// recontratar outro lugar mais tarde) e o clube fica vago até ser preenchido
// por contratarNovoTecnico.
function demitirTecnico(treinador, clube, motivo = "maus resultados") {
    encerrarHistoricoTecnico(treinador, clube, motivo);
    treinador.clubeId = null;
    treinador.demissoes = (treinador.demissoes || 0) + 1;
    treinador.reputacao = Math.max(30, treinador.reputacao - 4);
    registrarNoticia("Treinador demitido", `${treinador.nome} foi demitido do ${clube.nome} por ${motivo}.`, "Manager");
}

// Contrata o melhor treinador LIVRE disponível para um clube vago — dando
// preferência a alguém com reputação compatível com o tamanho do clube (um
// gigante não contrata qualquer um, um pequeno não paga por um badalado).
function contratarNovoTecnico(clube) {
    const livres = treinadoresIA.filter(t => !t.clubeId && !t.selecaoId && !t.aposentado);
    let escolhido = null;
    if (livres.length) {
        livres.sort((a, b) => Math.abs((a.reputacao || 60) - (clube.reputacao || 60)) - Math.abs((b.reputacao || 60) - (clube.reputacao || 60)));
        escolhido = livres[0];
    } else {
        escolhido = criarTreinador(clube.reputacao || 65);
        treinadoresIA.push(escolhido);
    }
    escolhido.clubeId = clube.id;
    escolhido.temporadasNoCargo = 0;
    garantirHistoricoTecnico(escolhido, clube);
    sincronizarNomeTecnico(clube);
    registrarNoticia("Novo treinador anunciado", `${escolhido.nome} (estilo ${escolhido.estiloJogo}) é o novo técnico do ${clube.nome}.`, "Manager");
    return escolhido;
}

// 🔄 CARROSSEL DE TREINADORES — corre uma vez por temporada (ver
// advanceSeasonInternal), com a tabela final de cada liga ainda disponível.
// Decide demissões com base na posição final vs. o objetivo esperado para a
// reputação do clube (objetivoDiretoria), contrata substitutos para as vagas
// abertas, e dá a rara chance de um ex-jogador estrear como treinador.
function processarCarrosselTreinadores(tabelasFinais) {
    garantirTreinadoresIniciais();
    const vagas = [];
    clubes.forEach(clube => {
        // O clube do próprio jogador (quando ele está no Modo Manager) segue
        // uma lógica separada — ver avaliarContinuidadeManagerJogador.
        if (managerEstado?.ativo && managerEstado.clubeId === clube.id) return;
        const treinador = treinadoresIA.find(t => t.clubeId === clube.id) || contratarNovoTecnico(clube);
        treinador.temporadasNoCargo = (treinador.temporadasNoCargo || 0) + 1;

        const tabela = tabelasFinais[clube.ligaId];
        let percentil = 0.5;
        if (tabela && tabela.length) {
            const ord = [...tabela].sort((a, b) => b.pontos - a.pontos || ((b.gols || 0) - (b.golsSofridos || 0)) - ((a.gols || 0) - (a.golsSofridos || 0)));
            const posicao = ord.findIndex(x => x.id === clube.id) + 1;
            if (posicao > 0) percentil = posicao / ord.length;
        }
        let expectativaMax;
        if (clube.reputacao >= 86) expectativaMax = 0.25;
        else if (clube.reputacao >= 78) expectativaMax = 0.40;
        else if (clube.reputacao >= 68) expectativaMax = 0.65;
        else expectativaMax = 0.88;

        let chanceDemissao = 0.035; // saída "natural" mesmo com época ok
        if (percentil > expectativaMax) chanceDemissao += 0.28 + (percentil - expectativaMax) * 0.45;
        if ((treinador.reputacao || 60) < (clube.reputacao || 60) - 15) chanceDemissao += 0.08;
        if (treinador.temporadasNoCargo >= 4) chanceDemissao += 0.05;
        chanceDemissao = Math.min(0.85, chanceDemissao);

        if (Math.random() < chanceDemissao) {
            demitirTecnico(treinador, clube, percentil > expectativaMax ? "resultados abaixo do esperado" : "decisão da diretoria");
            vagas.push(clube);
        } else if (percentil <= expectativaMax * 0.55) {
            treinador.reputacao = Math.min(99, (treinador.reputacao || 60) + 1);
        }
    });
    vagas.forEach(clube => contratarNovoTecnico(clube));

    // 🌱 Chance bem pequena (≈1.2%) de um jogador recém-aposentado virar
    // treinador — entra livre no mercado, pronto pra ser contratado depois.
    jogadoresIA.filter(j => j.aposentado && !j.viroutecnico).forEach(j => {
        if (Math.random() < 0.012) {
            j.viroutecnico = true;
            const t = criarTreinadorDeExJogador(j);
            treinadoresIA.push(t);
            registrarNoticia("Estreia nos banquinhos", `${j.nome} pendura as chuteiras e inicia a carreira de treinador.`, "Manager");
        }
    });
}

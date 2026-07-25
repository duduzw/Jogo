// ==========================================
// 👔 BASE DE DADOS DE TÉCNICOS REAIS
// ==========================================
// Pool de técnicos "reais" usado por garantirTreinadoresIniciais() /
// criarTreinador() em main.js, ANTES de cair no gerador de nomes aleatórios
// (NOMES_TREINADOR / SOBRENOMES_TREINADOR). Cada entrada:
//   nome          -> nome de exibição
//   wikiNome      -> título exato da página na Wikipedia (para buscar a foto
//                    em tempo de execução; se omitido, usa `nome`)
//   nacionalidade -> deve bater com algum `pais` de SELECOES quando possível
//   estiloJogo    -> um dos 5 estilos já usados pelo bonusTaticoManager:
//                    "pressao" | "posse" | "retranca" | "contra" | "equilibrado"
//   reputacaoBase -> ponto de partida (35-96) antes da variação aleatória
//                    aplicada em criarTreinador()
//   clubeId       -> (opcional, recomendado) id exato do clube em `times.js`.
//                    É a forma mais segura de definir o clube inicial.
//   clubeNome     -> alternativa opcional para procurar pelo nome do clube.
//                    Técnicos sem clubeId/clubeNome ficam fora da distribuição
//                    inicial; clubes sem técnico definido recebem um genérico.
//   selecaoNome   -> mesma ideia, mas pra seleção nacional (compara com
//                    `sel.pais` / `sel.nome` de SELECOES).
//
// ⚠️ Cargos de técnico mudam toda hora no mundo real — os clubeNome/
// selecaoNome abaixo refletem o que era verdade por volta do início de 2026
// e podem já estar desatualizados quando você ler isto. É só editar o campo
// (ou apagar) pra ajustar; não precisa mexer em mais nada.
//
// A foto NÃO vem hardcoded aqui (URLs de terceiros quebram/mudam com o
// tempo). Em vez disso, main.js busca a foto na Wikipedia em runtime
// (função carregarFotoTecnico) e guarda o resultado em treinador.foto,
// caindo no avatar gerado (ui-avatars) enquanto isso ou se não achar nada.
// Se quiser fixar uma foto manualmente, é só preencher o campo `foto` aqui
// com qualquer URL de imagem — o sistema respeita esse valor e não
// sobrescreve.

export const TECNICOS_REAIS = [
    { nome: "Pep Guardiola", foto: "https://cdn-img.staticzz.com/img/treinadores/658/658_pri__20260423093503_pep_guardiola.png", nacionalidade: "Espanha", estiloJogo: "posse", reputacaoBase: 95, clubeId: "c_city" },
    { nome: "Michael Carrick", foto: "https://cdn-img.staticzz.com/img/treinadores/651/31651_pri__20260304232130_michael_carrick.jpg", nacionalidade: "Inglaterra", estiloJogo: "posse", reputacaoBase: 84, clubeId: "c_mun" },
    { nome: "Carlo Ancelotti", foto: "https://cdn-img.staticzz.com/img/treinadores/101/101_carlo_ancelotti_1781828975.png", nacionalidade: "Itália", estiloJogo: "equilibrado", reputacaoBase: 93, selecaoNome: "sel_bra" },
    { nome: "Massimiliano Allegri", foto: "https://cdn-img.staticzz.com/img/treinadores/728/1728_pri__20260427100843_massimiliano_allegri.jpg", nacionalidade: "Itália", estiloJogo: "retranca", reputacaoBase: 83, clubeId: "c_nap" },
    { nome: "José Mourinho", foto: "https://img.a.transfermarkt.technology/portrait/header/781-1717168225.jpg?lm=1o", nacionalidade: "Portugal", estiloJogo: "retranca", reputacaoBase: 90, clubeId: "c_rm" },
    { nome: "Diego Simeone", nacionalidade: "Argentina", estiloJogo: "retranca", reputacaoBase: 89, clubeId: "c_atm" },
    { nome: "Antonio Conte", nacionalidade: "Itália", estiloJogo: "pressao", reputacaoBase: 88, clubeId: "" },
    { nome: "Thomas Tuchel", nacionalidade: "Alemanha", estiloJogo: "pressao", reputacaoBase: 87, selecaoNome: "sel_ing" },
    { nome: "Xabi Alonso", nacionalidade: "Espanha", estiloJogo: "posse", reputacaoBase: 87, clubeId: "" },
    { nome: "Mikel Arteta", nacionalidade: "Espanha", estiloJogo: "posse", reputacaoBase: 85, clubeId: "c_ars" },
    { nome: "Julian Nagelsmann", nacionalidade: "Alemanha", estiloJogo: "posse", reputacaoBase: 85, selecaoId: "s_de" },
    { nome: "Hansi Flick", nacionalidade: "Alemanha", estiloJogo: "pressao", reputacaoBase: 86, clubeId: "c_bar" },
    { nome: "Roberto De Zerbi", nacionalidade: "Itália", estiloJogo: "posse", reputacaoBase: 82, clubeId: "c_ms" },
    { nome: "Unai Emery", nacionalidade: "Espanha", estiloJogo: "equilibrado", reputacaoBase: 85, clubeId: "c_av" },
    { nome: "Erik ten Hag", nacionalidade: "Holanda", estiloJogo: "posse", reputacaoBase: 80 },
    { nome: "Simone Inzaghi", nacionalidade: "Itália", estiloJogo: "equilibrado", reputacaoBase: 84 },
    { nome: "Luis Enrique", wikiNome: "Luis Enrique", nacionalidade: "Espanha", estiloJogo: "posse", reputacaoBase: 88, clubeId: "c_psg" },
    { nome: "Didier Deschamps", nacionalidade: "França", estiloJogo: "equilibrado", reputacaoBase: 87, selecaoId: "s_fr" },
    { nome: "Zinedine Zidane", nacionalidade: "França", estiloJogo: "equilibrado", reputacaoBase: 88 },
    { nome: "Rafael Benítez", nacionalidade: "Espanha", estiloJogo: "equilibrado", reputacaoBase: 78 },
    { nome: "Marcelo Gallardo", nacionalidade: "Argentina", estiloJogo: "pressao", reputacaoBase: 82 },
    { nome: "Fernando Diniz", nacionalidade: "Brasil", estiloJogo: "posse", reputacaoBase: 76 },
    { nome: "Abel Ferreira", nacionalidade: "Portugal", estiloJogo: "pressao", reputacaoBase: 82, clubeId: "c_pal" },
    { nome: "Tite", wikiNome: "Tite (football manager)", nacionalidade: "Brasil", estiloJogo: "equilibrado", reputacaoBase: 84 },
    { nome: "Dorival Júnior", nacionalidade: "Brasil", estiloJogo: "equilibrado", reputacaoBase: 78 },
    { nome: "Vítor Pereira", nacionalidade: "Portugal", estiloJogo: "contra", reputacaoBase: 76 },
    { nome: "Sérgio Conceição", nacionalidade: "Portugal", estiloJogo: "contra", reputacaoBase: 80 },
    { nome: "Rúben Amorim", nacionalidade: "Portugal", estiloJogo: "pressao", reputacaoBase: 81, clubeId: "c_milan" },
    { nome: "Roberto Martínez", nacionalidade: "Espanha", estiloJogo: "posse", reputacaoBase: 83, selecaoNome: "Portugal" },
    { nome: "Luciano Spalletti", nacionalidade: "Itália", estiloJogo: "posse", reputacaoBase: 84, selecaoNome: "Itália" },
    { nome: "Gian Piero Gasperini", nacionalidade: "Itália", estiloJogo: "pressao", reputacaoBase: 81, clubeId: "c_rom" },
    { nome: "Marco Silva", nacionalidade: "Portugal", estiloJogo: "equilibrado", reputacaoBase: 77, clubeId: "c_ful" },
    { nome: "Eddie Howe", nacionalidade: "Inglaterra", estiloJogo: "pressao", reputacaoBase: 80, clubeId: "c_new" },
    { nome: "Graham Potter", nacionalidade: "Inglaterra", estiloJogo: "posse", reputacaoBase: 76, clubeId: "c_whu" },
    { nome: "Steven Gerrard", nacionalidade: "Inglaterra", estiloJogo: "equilibrado", reputacaoBase: 72 },
    { nome: "Frank Lampard", nacionalidade: "Inglaterra", estiloJogo: "equilibrado", reputacaoBase: 71 },
    { nome: "Oscar Tabárez", nacionalidade: "Uruguai", estiloJogo: "equilibrado", reputacaoBase: 74 },
    { nome: "Marcelo Bielsa", nacionalidade: "Argentina", estiloJogo: "pressao", reputacaoBase: 85, selecaoNome: "Uruguai" },
    { nome: "Jorge Sampaoli", nacionalidade: "Argentina", estiloJogo: "pressao", reputacaoBase: 78 },
    { nome: "Gerardo Martino", nacionalidade: "Argentina", estiloJogo: "posse", reputacaoBase: 77 },
    { nome: "Ricardo Gareca", nacionalidade: "Argentina", estiloJogo: "retranca", reputacaoBase: 75 },
    { nome: "Fernando Santos", nacionalidade: "Portugal", estiloJogo: "retranca", reputacaoBase: 78 },
    { nome: "Vincenzo Italiano", nacionalidade: "Itália", estiloJogo: "posse", reputacaoBase: 78, clubeId: "c_bol" },
    { nome: "Igor Tudor", nacionalidade: "Croácia", estiloJogo: "pressao", reputacaoBase: 76, clubeId: "c_juv" },
    { nome: "Xavi Hernández", wikiNome: "Xavi", nacionalidade: "Espanha", estiloJogo: "posse", reputacaoBase: 82 },
    { nome: "Christophe Galtier", nacionalidade: "França", estiloJogo: "equilibrado", reputacaoBase: 75 },
    { nome: "Paulo Fonseca", nacionalidade: "Portugal", estiloJogo: "posse", reputacaoBase: 77 },
    { nome: "Ange Postecoglou", nacionalidade: "Austrália", estiloJogo: "pressao", reputacaoBase: 80 },
    { nome: "Oliver Glasner", nacionalidade: "Áustria", estiloJogo: "contra", reputacaoBase: 79, clubeNome: "Crystal Palace" },
    { nome: "Kieran McKenna", nacionalidade: "Irlanda do Norte", estiloJogo: "posse", reputacaoBase: 74 },
    { nome: "Fabián Bustos", nacionalidade: "Argentina", estiloJogo: "equilibrado", reputacaoBase: 70 },
    { nome: "Fernando Diniz", nacionalidade: "Brasil", estiloJogo: "pressao", reputacaoBase: 81, clubeId: "c_cor"},

];

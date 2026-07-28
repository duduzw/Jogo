// ==========================================
// 🚀 BOOTSTRAP DO JOGO
// ==========================================
// O antigo main.js (17 mil linhas) foi dividido em módulos temáticos dentro de
// src/ (ver src/modules.js). Este ficheiro só faz duas coisas:
//   1. carrega os dados/engines (módulos ES) e publica-os no escopo global;
//   2. carrega os módulos do jogo pela ordem correta.
import { jogadorModelo, competicoes, clubes, jogadoresIA, tabelasLigas, feedNoticias, preencherLigasVazias } from './data/database.js';
import { MatchEngine, MORAL_TECNICO_MINIMA_PENALTI, NIVEL_PENALTIS_MINIMO, PERFIS_ATRIBUTOS_POSICAO, gerarAtributosParaJogador, PESO_GOL_POS, PESO_AST_POS, sortearPonderado } from './engine/match.js';
import { FORMATOS_INT, resolverVencedorMataMata, simularPlacarSelecao, criarTimeTorneio, chaveTorneio, idsCompeticoesAtivas, CORES_COMP, isEliminatoria, metaCompeticao, categoriaComp, anoTorneioDestino } from './engine/selecoes.js';
import { TECNICOS_REAIS } from './data/tecnicos.js';
import { MODULOS_JOGO } from './src/modules.js';

// Os módulos do jogo são scripts clássicos e partilham o escopo global, por isso
// tudo o que vinha dos módulos ES tem de ficar acessível em window.
Object.assign(window, {
    jogadorModelo, competicoes, clubes, jogadoresIA, tabelasLigas, feedNoticias, preencherLigasVazias,
    MatchEngine, MORAL_TECNICO_MINIMA_PENALTI, NIVEL_PENALTIS_MINIMO, PERFIS_ATRIBUTOS_POSICAO,
    gerarAtributosParaJogador, PESO_GOL_POS, PESO_AST_POS, sortearPonderado,
    FORMATOS_INT, resolverVencedorMataMata, simularPlacarSelecao, criarTimeTorneio, chaveTorneio,
    idsCompeticoesAtivas, CORES_COMP, isEliminatoria, metaCompeticao, categoriaComp, anoTorneioDestino,
    TECNICOS_REAIS
});

// async = false garante download em paralelo mas execução pela ordem da lista.
for (const src of MODULOS_JOGO) {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onerror = () => console.error(`[bootstrap] falha a carregar ${src}`);
    document.head.appendChild(script);
}

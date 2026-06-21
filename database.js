import { competicoes } from './competicoes.js';
import { clubes } from './times.js';
import { jogadoresIA } from './jogadores.js';

// ==========================================
// JOGADOR MODELO
// ==========================================
export const jogadorModelo = {
    id: "player",
    nome: "Memarkez",
    idade: 17,
    nacionalidade: "Brasil",
    posicao: "Atacante",
    geral: 68,
    valorMercado: "€2.5M",
    energia: 100,
    xpAtual: 0,
    xpNecessario: 100,
    clubeId: "",
    selecaoId: "none",
    naSelecao: false,
    foto: "",
    estatisticasAtuais: {
        jogos: 0,
        gols: 0,
        assistencias: 0,
        notas: []
    },
    statsSelecao: { jogos: 0, gols: 0, assistencias: 0, convocacoes: 0 },
    melhorAtuacao: { gols: 0, assistencias: 0, nota: 0, adversario: "", rodada: 0 },
    historicoCarreira: []
};

// ==========================================
// ESTADO GLOBAL DO JOGO (Tabelas e Notícias)
// ==========================================
export let tabelasLigas = {};

export let feedNoticias = [
    {
        manchete: "📢 Mundo do Futebol Atualizado",
        corpo: "Novas ligas, clubes e jogadores foram adicionados.",
        data: "Global"
    }
];

// ==========================================
// FUNÇÕES GLOBAIS
// ==========================================
// ==========================================
// AUTO PREENCHER LIGAS
// ==========================================
export function preencherLigasVazias() {
    // Garantir que temos acesso às competições e clubes importados
    if (!competicoes || !clubes) {
        console.error("Erro: Competições ou Clubes não foram carregados corretamente.");
        return;
    }


    competicoes
        .filter(c => c.tipo === "liga")
        .forEach(comp => {
            // Filtra os clubes que pertencem a esta liga
            let equipasNaLiga = clubes.filter(c => c.ligaId === comp.id);
            let faltam = 12 - equipasNaLiga.length;

            if (faltam > 0) {
                for (let i = 0; i < faltam; i++) {
                    let reputacaoBase = comp.div === 1 ? 70 : 62;
                    
                    // Cria um clube genérico para preencher a liga
                    let novoClube = {
                        id: `clube_generico_${comp.id}_${i}`,
                        nome: `${comp.nome.split(' ')[0]} FC Genérico ${i + 1}`,
                        reputacao: reputacaoBase,
                        ligaId: comp.id,
                        estatisticasAtuais: { jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsMarcados: 0, golsSofridos: 0, pontos: 0 },
                        historicoGeral: []
                    };
                    
                    // Adiciona o clube temporariamente na lista global de clubes
                    clubes.push(novoClube);
                }
            }
        });
        
    console.log("Ligas preenchidas com sucesso! Total de clubes ativos:", clubes.length);
}

    

// ==========================================
// EXPORTAÇÃO DOS MÓDULOS EXTERNOS
// ==========================================
export { competicoes, clubes, jogadoresIA };

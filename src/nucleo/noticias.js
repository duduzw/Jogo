const FORMATOS_NOTICIA_FIXOS = {
    "Entrevista": "post", "Mídia": "post", "Torcida": "post", "Rumor": "post", "Bastidores": "post", "Treino": "post",
    "Prémios": "jornal", "Números": "jornal", "Seleções": "jornal", "Clássico": "jornal", "Mercado": "jornal", "Finanças": "jornal", "Tática": "jornal"
};
const HANDLES_POST = ["@ImprensaGlobal", "@FutMundialNews", "@RedacaoEsportiva", "@OlhoNoJogo", "@VozDoVestiario"];
function registrarNoticia(manchete, corpo, categoria = "Geral", refImagem = null, tipoImagem = "jogador", destaque = false) {
    const formato = destaque ? "manchete" : (FORMATOS_NOTICIA_FIXOS[categoria] || (Math.random() < 0.5 ? "post" : "jornal"));
    const item = {
        manchete, corpo, data: `${categoria} • ${anoAtual} • Rodada ${rodadaAtual}`,
        formato, refImagem, tipoImagem, categoria,
        handle: HANDLES_POST[Math.floor(Math.random() * HANDLES_POST.length)],
        curtidas: formato === "post" ? Math.floor(Math.random() * 4200) + 120 : null
    };
    feedNoticias.unshift(item);
    eventosRecentes.unshift(item);
    eventosRecentes = eventosRecentes.slice(0, 60);
}

function registrarMovimentacao({ jogadorNome, jogadorId, tipo, valor, origemId, destinoId, janela }) {
    const origem = clubes.find(c => c.id === origemId);
    const destino = clubes.find(c => c.id === destinoId);
    const mov = {
        ano: anoAtual,
        rodada: rodadaAtual,
        jogadorNome,
        jogadorId,
        tipo,
        valor: valor || 0,
        origemId,
        destinoId,
        origem: origem?.nome || "Livre",
        destino: destino?.nome || "Livre",
        janela: janela || "Mercado"
    };
    transferenciasHistorico.unshift(mov);
    transferenciasHistorico = transferenciasHistorico.slice(0, 120);
    registrarNoticia(
        `${jogadorNome} ${tipo === "emprestimo" ? "foi emprestado" : tipo === "venda" ? "foi vendido" : "foi transferido"} para ${mov.destino}`,
        `${mov.origem} -> ${mov.destino} | ${tipo === "emprestimo" ? "empréstimo" : formatarMoeda(valor || 0)} | ${mov.janela}`,
        "Mercado", { nome: jogadorNome }, "jogador"
    );
}

// existir, falha em silêncio — nunca quebra o jogo por falta de um som.
const SONS_JOGO = {
    gol: "assets/sfx/gol.mp3",
    apito_inicio: "assets/sfx/apito_inicio.mp3",
    apito_fim: "assets/sfx/apito_fim.mp3",
    vitoria: "assets/sfx/vitoria.mp3",
    derrota: "assets/sfx/derrota.mp3",
    sucesso: "assets/sfx/sucesso.mp3",
    erro: "assets/sfx/erro.mp3",
    notificacao: "assets/sfx/notificacao.mp3",
    clique: "assets/sfx/clique.mp3",
    convocacao: "assets/sfx/convocacao.mp3",
    trofeu: "assets/sfx/trofeu.mp3",
    cartao: "assets/sfx/cartao.mp3"
};
// Cache de instâncias <audio> por som, para não recriar o elemento a cada chamada.
const _cacheAudioSons = {};
// Preferência do jogador (guardada no localStorage, independente do save da carreira).
function somAtivado() { return localStorage.getItem("rumo_estrelato_pro_sons") !== "off"; }
window.alternarSons = function() {
    const ativo = somAtivado();
    localStorage.setItem("rumo_estrelato_pro_sons", ativo ? "off" : "on");
    mostrarToast("Sons", ativo ? "Efeitos sonoros desativados." : "Efeitos sonoros ativados.", "info");
};
// Toca um efeito sonoro pelo nome (ver SONS_JOGO). Nunca lança erro — se o
// ficheiro não existir ou o navegador bloquear o autoplay, simplesmente
// não toca nada, sem afetar o resto do jogo.
window.tocarSom = function(nome, volume = 0.55) {
    try {
        if (!somAtivado() || !SONS_JOGO[nome]) return;
        let audio = _cacheAudioSons[nome];
        if (!audio) { audio = new Audio(SONS_JOGO[nome]); audio.volume = volume; _cacheAudioSons[nome] = audio; }
        audio.currentTime = 0;
        audio.volume = volume;
        audio.play().catch(() => {}); // silencioso se o navegador bloquear ou o ficheiro não existir
    } catch (e) { /* nunca deixar um som quebrar o jogo */ }
};

// 🖱️ Som de clique GLOBAL: em vez de adicionar tocarSom('clique') botão por
// botão (o jogo tem centenas, muitos criados dinamicamente por HTML/JS), um
// único listener delegado no document pega qualquer clique em <button>, em
// qualquer elemento com classe .btn (padrão usado em todo o jogo) ou que
// termine em "-btn", e toca o som — inclusive em botões criados depois,
// sem precisar mexer em cada tela.
document.addEventListener("click", (e) => {
    const el = e.target.closest('button, .btn, [class*="-btn"], [role="button"]');
    if (!el || el.disabled || el.classList.contains("oculto")) return;
    window.tocarSom('clique', 0.3);
}, true);

// ==========================================
// 🎵 MÚSICA DE FUNDO
// ==========================================
// Mesmo esquema dos efeitos sonoros (SONS_JOGO): ficheiros .mp3 opcionais,
// desta vez em assets/music/ — o jogador coloca as próprias faixas com
// exatamente estes nomes. Se um ficheiro não existir, o navegador dispara
// "error" nesse <audio> e o motor simplesmente pula para a próxima faixa da
// lista, sem travar nem mostrar erro nenhum.
// Cada faixa tem um "nome" de exibição — pode editar à vontade, é só o que
// aparece na bolinha de configurações.
const MUSICAS_JOGO = [
    { arquivo: "assets/music/tema1.mp3", nome: "Yeat & Joji – Back Home" },
    { arquivo: "assets/music/tema2.mp3", nome: "J Hus - Who Told You ft. Drake" },
    { arquivo: "assets/music/tema3.mp3", nome: "Central Cee x Dave - Sprinter" },
    { arquivo: "assets/music/tema4.mp3", nome: "Risky B - 2 Man" },
     { arquivo: "assets/music/tema5.mp3", nome: "NDOTZ - Embrace It " },
      { arquivo: "assets/music/tema6.mp3", nome: "J Balvin, SAIKO - Gaga" },
      { arquivo: "assets/music/tema7.mp3", nome: "YO LO SOÑÉ - SAIKO & Omar Montes" },
      { arquivo: "assets/music/tema8.mp3", nome: "arcoíris - Young Miko" },
      { arquivo: "assets/music/tema9.mp3", nome: "Imagine Dragons - On Top Of The World" },
      { arquivo: "assets/music/tema10.mp3", nome: "Smallpools - Dreaming" },
      { arquivo: "assets/music/tema11.mp3", nome: "DNA (FIFA World Cup 2026)" },
      { arquivo: "assets/music/tema12.mp3", nome: "ntre last de 20 - Bizarrap, Natanael Cano " },
      { arquivo: "assets/music/tema13.mp3", nome: "Joy Crookes - Feet Don't Fail Me Now" },
      { arquivo: "assets/music/tema14.mp3", nome: "Wande Coal, DJ Tunez - Iskaba" },
      { arquivo: "assets/music/tema15.mp3", nome: "Midas The Jagaban - Party With A Jagaban" },
      { arquivo: "assets/music/tema16.mp3", nome: "StaySolidRocky - Party Girl" },
      { arquivo: "assets/music/tema17.mp3", nome: "Central Cee - Obsessed With You" },
      { arquivo: "assets/music/tema18.mp3", nome: "The Weeknd, Madonna, Playboi Carti - Popular " },
      { arquivo: "assets/music/tema19.mp3", nome: "" },
      { arquivo: "assets/music/tema20.mp3", nome: "" },
];


// 🆕 Faixa fixa e exclusiva da tela de criação de nome/jogador (telaCriacao):
// toca sempre essa mesma música enquanto essa tela estiver aberta, e ao sair
// dela a playlist normal (MUSICAS_JOGO) volta a tocar de onde parou.
const MUSICA_TELA_CRIACAO = { arquivo: "assets/music/tema_criacao.mp3", nome: "tema_criacao" };

let _audioMusica = null;
let _ordemMusicas = [];
let _indiceMusicaAtual = 0;
let _faixaAtual = null;       // { arquivo, nome } da faixa tocando agora
let _emMusicaFixa = false;    // true enquanto a MUSICA_TELA_CRIACAO estiver ativa

// Preferência do jogador para a música (independente da preferência de sons/SFX).
function musicaAtivada() { return localStorage.getItem("rumo_estrelato_pro_musica") !== "off"; }
function volumeMusica() { const v = parseFloat(localStorage.getItem("rumo_estrelato_pro_musica_vol")); return isNaN(v) ? 0.25 : v; }
window.definirVolumeMusica = function(v) {
    const vol = Math.max(0, Math.min(1, Number(v)));
    localStorage.setItem("rumo_estrelato_pro_musica_vol", String(vol));
    if (_audioMusica) _audioMusica.volume = vol;
};

// Nome da faixa tocando agora (ou null se não houver nenhuma), para a UI mostrar.
window.obterNomeMusicaAtual = function() { return _faixaAtual?.nome || null; };

// Dispara um evento customizado sempre que a faixa muda, pra bolinha de
// configurações (ou qualquer outro painel) atualizar o texto sem precisar
// ficar checando em loop.
function _avisarTrocaDeMusica() {
    document.dispatchEvent(new CustomEvent("musicaTrocou", { detail: { ...( _faixaAtual || {}) } }));
}

function _embaralharOrdemMusicas() {
    _ordemMusicas = MUSICAS_JOGO.map((_, i) => i).sort(() => Math.random() - 0.5);
    _indiceMusicaAtual = 0;
}

let _avisouFalhaFixa = false; // evita repetir o toast de erro toda vez que a faixa fixa falha

function _garantirAudioMusica() {
    if (_audioMusica) return;
    _audioMusica = new Audio();
    _audioMusica.volume = volumeMusica();
    // Se a faixa atual não existir/falhar, tenta a próxima em vez de parar a música de vez
    // — EXCETO na tela de criação, onde a faixa é fixa de propósito: se ela falhar, avisa
    // uma vez (em vez de trocar silenciosamente pra playlist geral, o que ia parecer que o
    // recurso "música fixa" nem estava funcionando).
    _audioMusica.addEventListener("error", () => {
        console.warn("[música] falha ao carregar:", _audioMusica.src);
        if (!musicaAtivada()) return;
        if (_emMusicaFixa) {
            if (!_avisouFalhaFixa) {
                _avisouFalhaFixa = true;
                mostrarToast("Música", `Não encontrei o arquivo "${MUSICA_TELA_CRIACAO.arquivo}". Confira o nome e o local dele na pasta assets/music/.`, "danger");
            }
            return; // não cai pra playlist geral — a fixa continua fixa, só fica em silêncio até o arquivo existir
        }
        _tocarProximaMusica();
    });
    _audioMusica.addEventListener("ended", () => {
        if (!musicaAtivada()) return;
        if (_emMusicaFixa) _tocarFaixa(MUSICA_TELA_CRIACAO); // a faixa fixa repete em loop, não entra na playlist
        else _tocarProximaMusica();
    });
}

function _tocarFaixa(faixaObj) {
    _garantirAudioMusica();
    _faixaAtual = faixaObj;
    _audioMusica.src = faixaObj.arquivo;
    _audioMusica.volume = volumeMusica();
    _audioMusica.play().then(() => {
        console.log("[música] tocando:", faixaObj.arquivo);
    }).catch((err) => {
        console.warn("[música] play() bloqueado/rejeitado para", faixaObj.arquivo, "-", err?.name || err);
    });
    _avisarTrocaDeMusica();
}

function _tocarProximaMusica() {
    if (!musicaAtivada() || MUSICAS_JOGO.length === 0) return;
    _emMusicaFixa = false;
    if (!_ordemMusicas.length) _embaralharOrdemMusicas();
    if (_indiceMusicaAtual >= _ordemMusicas.length) _embaralharOrdemMusicas(); // recomeça a lista embaralhada de novo
    const faixaObj = MUSICAS_JOGO[_ordemMusicas[_indiceMusicaAtual]];
    _indiceMusicaAtual++;
    _tocarFaixa(faixaObj);
}

// 🆕 Troca para a música fixa da tela de criação (chamado pelo mudarTela()).
window.tocarMusicaTelaCriacao = function() {
    if (!musicaAtivada()) return;
    _emMusicaFixa = true;
    _tocarFaixa(MUSICA_TELA_CRIACAO);
};

// 🆕 Sai da música fixa e retoma a playlist normal (chamado pelo mudarTela()
// ao trocar para qualquer outra tela que não seja a de criação).
window.retomarPlaylistNormal = function() {
    if (!_emMusicaFixa) return; // já estava na playlist normal, nada a fazer
    _emMusicaFixa = false;
    _tocarProximaMusica();
};

// Chamado uma única vez (após o primeiro clique do jogador, para respeitar a
// política de autoplay dos navegadores) para começar a tocar a playlist.
window.iniciarMusicaFundo = function() {
    if (!musicaAtivada()) return;
    if (_audioMusica && !_audioMusica.paused) return; // já está tocando, não reinicia
    if (_audioMusica) {
        _audioMusica.play().then(() => console.log("[música] retomada após interação:", _audioMusica.src))
            .catch((err) => console.warn("[música] ainda bloqueada:", err?.name || err));
        _avisarTrocaDeMusica();
    }
    else if (_emMusicaFixa) _tocarFaixa(MUSICA_TELA_CRIACAO);
    else _tocarProximaMusica();
};

window.alternarMusica = function() {
    const ativa = musicaAtivada();
    localStorage.setItem("rumo_estrelato_pro_musica", ativa ? "off" : "on");
    if (ativa) { _audioMusica?.pause(); }
    else { window.iniciarMusicaFundo(); }
    mostrarToast("Música", ativa ? "Música de fundo desativada." : "Música de fundo ativada.", "info");
};

// Pula manualmente para a próxima faixa da playlist (a setinha ⏭️ no menu
// de configurações). Se a música estiver desligada, liga automaticamente —
// faz sentido, já que o jogador está pedindo explicitamente pra trocar de música.
// Na tela de criação (música fixa) a setinha não pula, já que ali a faixa é fixa de propósito.
window.proximaMusica = function() {
    if (_emMusicaFixa) return;
    if (!musicaAtivada()) localStorage.setItem("rumo_estrelato_pro_musica", "on");
    _tocarProximaMusica();
};

// A maioria dos navegadores só deixa tocar áudio com som depois de uma
// interação real do jogador — por isso ficamos à escuta do primeiro
// clique/toque na página inteira para então começar a playlist.
(function aguardarPrimeiraInteracaoParaMusica() {
    const iniciar = () => { window.iniciarMusicaFundo(); document.removeEventListener("click", iniciar); document.removeEventListener("touchstart", iniciar); };
    document.addEventListener("click", iniciar, { once: true });
    document.addEventListener("touchstart", iniciar, { once: true });
})();

function mostrarToast(titulo, mensagem, tipo = 'info') {
    const container = document.getElementById('toastContainer'); if(!container) return;
    const toast = document.createElement('div'); toast.className = `toast ${tipo === 'gold' ? 'gold-anim' : ''}`;
    toast.innerHTML = `<h4>${titulo}</h4><p>${mensagem}</p>`; container.appendChild(toast);
    // 🔊 som leve conforme o tipo de toast (sucesso/erro/aviso/info)
    window.tocarSom(tipo === 'success' || tipo === 'gold' ? 'sucesso' : (tipo === 'danger' ? 'erro' : 'notificacao'), 0.35);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 4000);
}
// 🛡️ FIX: expõe no window — firebase-integration.js chama mostrarToast(...)
// diretamente (ex: erros de sala cheia/inexistente); sem isto, essas
// mensagens de erro do modo online nunca apareciam.
window.mostrarToast = mostrarToast;

// ==========================================
// 🎮 MINI-JOGO DE PÊNALTI INTERATIVO
// ==========================================
// Chamado pelo motor de partida (match.js) quando ÉS TU quem bate ou quem
// defende um pênalti. Mostra uma baliza com 3 zonas (esquerda/centro/
// direita); escolhes uma, e o resultado depende de coincidir ou não com a
// zona escolhida pelo "adversário" (goleiro ou cobrador controlado pelo
// motor) — exatamente como um pênalti real: um duelo de leitura de lado.
window.abrirMiniJogoPenalti = function(tipo, resolverCallback) {
    let overlay = document.getElementById("miniJogoPenaltiOverlay");
    if (!overlay) { overlay = document.createElement("div"); overlay.id = "miniJogoPenaltiOverlay"; document.body.appendChild(overlay); }
    overlay.className = "penalti-overlay";
    const titulo = tipo === "cobrar" ? "🎯 A TUA VEZ DE COBRAR!" : "🧤 DEFENDE O PÊNALTI!";
    const sub = tipo === "cobrar" ? "Escolhe o lado para chutar" : "Escolhe para que lado vais mergulhar";
    overlay.innerHTML = `
        <div class="penalti-modal">
            <h2 class="penalti-titulo">${titulo}</h2>
            <p class="penalti-sub">${sub}</p>
            <div class="penalti-baliza">
                <div class="penalti-zona" data-zona="esquerda">⬅️</div>
                <div class="penalti-zona" data-zona="centro">⬆️</div>
                <div class="penalti-zona" data-zona="direita">➡️</div>
            </div>
            <p class="penalti-resultado" id="penaltiResultadoTexto"></p>
        </div>`;
    overlay.classList.remove("oculto");
    window.tocarSom('notificacao', 0.4);

    overlay.querySelectorAll(".penalti-zona").forEach(btn => {
        btn.onclick = () => {
            if (overlay.dataset.resolvido) return; // 🛡️ evita cliques duplos escolhendo duas zonas
            overlay.dataset.resolvido = "1";
            overlay.querySelectorAll(".penalti-zona").forEach(b => { b.style.pointerEvents = "none"; b.style.opacity = "0.5"; });
            btn.classList.add("escolhida"); btn.style.opacity = "1";
            const resultadoEl = document.getElementById("penaltiResultadoTexto");
            resultadoEl.textContent = tipo === "cobrar" ? "A chutar..." : "A mergulhar...";
            window.tocarSom('clique');
            setTimeout(() => {
                overlay.remove();
                resolverCallback(btn.dataset.zona);
            }, 900);
        };
    });
};

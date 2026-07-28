// ==========================================
// 🛠️ INJEÇÃO DINÂMICA DE CSS
// ==========================================
const styleOverrides = document.createElement('style');
styleOverrides.innerHTML = `
    .oculto { display: none !important; }
    .view-section { display: none; }
    .view-section.ativo { display: block; }
    
    /* 🎨 REDESIGN — Perfil da Seleção (abrirPerfilSelecao) */
    .selecao-perfil-header { display:flex; gap:22px; align-items:center; padding-bottom:20px; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.12); }
    .selecao-perfil-escudo { width:92px; height:92px; object-fit:contain; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); padding:8px; box-shadow:0 8px 20px rgba(0,0,0,0.35); }
    .selecao-perfil-titulo { flex:1; }
    .selecao-perfil-titulo h1 { margin:0; color:var(--theme-primary); font-size:1.7rem; }
    .selecao-perfil-titulo p { margin:10px 0 0; display:flex; gap:8px; flex-wrap:wrap; }
    .selecao-perfil-titulo p span { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:4px 12px; font-size:0.8rem; color:#ccc; font-weight:700; }
    .selecao-elenco-lista { max-height:420px; overflow-y:auto; padding-right:6px; }
    .selecao-convocado-row { display:flex; align-items:center; gap:14px; padding:9px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.035); margin-bottom:7px; cursor:pointer; transition:background 0.15s ease, transform 0.15s ease, border-color 0.15s ease; }
    .selecao-convocado-row:hover { background:rgba(255,255,255,0.07); transform:translateX(3px); border-color:rgba(255,255,255,0.2); }
    .selecao-convocado-row img { width:44px; height:44px; border-radius:50%; object-fit:cover !important; border:1px solid rgba(255,255,255,0.12); flex-shrink:0; }
    .selecao-convocado-row strong { display:block; font-size:0.92rem; }
    .selecao-convocado-row small { color:#999; font-weight:700; font-size:0.76rem; }

    .foto-perfil-gigante { width: 180px; height: 180px; border-radius: 50%; object-fit: cover !important; border: 4px solid var(--theme-primary); box-shadow: 0 0 15px rgba(0, 255, 136, 0.4); margin-right: 25px; }
    .status-texto-grande { font-size: 1.2rem; margin: 8px 0; color: #ccc; }
    .trofeu-icon { width: 35px; height: 35px; vertical-align: middle; margin-right: 12px; filter: drop-shadow(0 0 5px rgba(255,215,0,0.6)); }
    .card-conquista { display: flex; align-items: center; gap:14px; background: rgba(255,215,0,0.05); padding: 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid rgba(255,215,0,0.3); transition: 0.3s; }
    .card-conquista:hover { background: rgba(255,215,0,0.1); transform: translateX(5px); }
    /* 🛡️ FIX: troféus da seleção tinham pouco destaque — versão maior usada
       no palmarés de seleções (abrirPerfilSelecao) e no perfil do jogador. */
    .selecao-titulos-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:14px; }
    .card-conquista-grande { padding:18px; border-radius:14px; background:linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,215,0,0.03)); border:1px solid rgba(255,215,0,0.4); box-shadow:0 10px 24px rgba(0,0,0,0.3); }
    .card-conquista-grande:hover { transform:translateY(-3px) scale(1.02); box-shadow:0 14px 30px rgba(255,215,0,0.15); }
    
    .bracket-container { display: flex; flex-direction: column; gap: 40px; padding: 20px 0; }
    .fase-bloco { background: rgba(0,0,0,0.5); border-radius: 16px; padding: 25px; border: 1px solid #333; }
    .match-card { background: linear-gradient(145deg, #18181b, #09090b); border: 1px solid #333; border-radius: 12px; padding: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.4); transition: 0.3s; }
    .match-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,255,136,0.15); border-color: #555; }
    .match-card.meu-jogo { border-color: var(--theme-primary); box-shadow: 0 0 15px rgba(0,255,136,0.2); background: linear-gradient(145deg, rgba(0,255,136,0.1), #09090b); }
    
    body { background-size: cover; background-position: center; background-attachment: fixed; transition: background-image 0.5s ease-in-out; }
    #modalPerfilJogador > div, #modalPesquisa > div { width: 95vw !important; max-width: 1400px !important; height: 90vh !important; display: flex; flex-direction: column; }
    .aba-conteudo { flex-grow: 1; max-height: none !important; overflow-y: auto; padding-bottom: 20px; }
    
    /* FIX DE ACHATAMENTO DE IMAGENS */
    img { object-fit: contain !important; }
    .comp-logo { width: 40px; height: 40px; border-radius: 8px; margin-right: 10px; background: #fff; padding: 2px;}
    .pos-badge { font-size: 0.85rem; padding: 3px 8px; border-radius: 4px; border: 1px solid #555; background: rgba(0,0,0,0.5); font-weight: bold; }
    
        /* DESIGN PREMIUM: CLASSIFICACOES E GALA */
    .classificacao-shell { display:flex; flex-direction:column; gap:18px; }
    .classificacao-hero { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:22px; border:1px solid rgba(255,255,255,0.12); border-radius:16px; background:linear-gradient(135deg, rgba(0,255,136,0.12), rgba(59,130,246,0.09) 45%, rgba(0,0,0,0.55)); box-shadow:0 18px 45px rgba(0,0,0,0.35); }
    .classificacao-hero h2 { margin:0; font-size:2rem; font-weight:900; letter-spacing:0; }
    .classificacao-hero p { margin:6px 0 0; color:var(--text-muted); font-weight:600; }
    .classificacao-meta { display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end; }
    .meta-pill { padding:8px 12px; border-radius:999px; border:1px solid rgba(255,255,255,0.12); background:rgba(0,0,0,0.35); color:#dbeafe; font-weight:800; font-size:0.82rem; text-transform:uppercase; }
    .paises-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:12px; }
    .regioes-filtro { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
    .regiao-filtro-chip { font-size:0.8rem; font-weight:800; padding:8px 16px; border-radius:20px; background:rgba(255,255,255,0.06); color:#ccc; border:1px solid rgba(255,255,255,0.14); cursor:pointer; user-select:none; transition:transform 0.12s, filter 0.12s, background 0.12s, color 0.12s; text-transform:uppercase; letter-spacing:0.02em; }
    .regiao-filtro-chip:hover { transform:translateY(-1px); background:rgba(255,255,255,0.12); }
    .regiao-filtro-chip.ativo { background:var(--theme-primary); color:#000; border-color:var(--theme-primary); }
    .btn-pais-filtro { min-height:74px; border:1px solid rgba(255,255,255,0.11); border-radius:12px; background:linear-gradient(145deg, rgba(24,24,27,0.9), rgba(9,9,11,0.9)); color:#fff; cursor:pointer; font-family:'Montserrat'; text-align:left; padding:14px 16px; display:flex; align-items:center; gap:12px; transition:0.22s ease; box-shadow:0 10px 24px rgba(0,0,0,0.22); }
    .btn-pais-filtro:hover { transform:translateY(-2px); border-color:rgba(0,255,136,0.45); background:linear-gradient(145deg, rgba(24,24,27,1), rgba(0,255,136,0.08)); }
    .btn-pais-filtro.ativo { border-color:var(--theme-primary); box-shadow:0 0 0 1px rgba(0,255,136,0.24), 0 18px 36px rgba(0,255,136,0.1); background:linear-gradient(145deg, rgba(0,255,136,0.18), rgba(24,24,27,0.95)); }
    .pais-flag { width:38px; height:38px; flex:0 0 38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.55rem; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); }
    .pais-logo { width:38px; height:38px; flex:0 0 38px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.92); border:1px solid rgba(255,255,255,0.18); padding:5px; color:#111; font-weight:900; font-size:0.82rem; overflow:hidden; }
    .pais-logo img { width:100%; height:100%; object-fit:contain !important; }
    .pais-label { display:block; font-size:1rem; font-weight:900; }
    .pais-sub { display:block; margin-top:3px; color:var(--text-muted); font-size:0.75rem; font-weight:700; text-transform:uppercase; }
    .divisoes-container { display:flex; gap:10px; flex-wrap:wrap; padding:12px; border-radius:14px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.28); }
    .divisoes-linha-principal { display:flex; gap:10px; flex-wrap:wrap; width:100%; }
    .btn-estaduais-toggle { background:rgba(250,204,21,0.08); border-color:rgba(250,204,21,0.3); }
    .btn-estaduais-toggle.ativo { background:var(--gold); border-color:var(--gold); }
    .painel-estaduais { width:100%; margin-top:12px; padding-top:12px; border-top:1px dashed rgba(255,255,255,0.14); }
    .painel-estaduais-header { font-size:0.8rem; font-weight:800; color:#d4d4d8; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:8px; }
    .painel-estaduais-header span { background:var(--gold); color:#000; border-radius:20px; padding:1px 9px; font-size:0.72rem; }
    .painel-estaduais-grid { display:flex; gap:10px; flex-wrap:wrap; }
    .btn-divisao { border:1px solid rgba(255,255,255,0.12); color:#d4d4d8; background:rgba(255,255,255,0.04); padding:11px 15px; border-radius:10px; font-family:'Montserrat'; font-weight:900; cursor:pointer; transition:0.2s ease; }
    .btn-divisao small { display:block; margin-top:3px; color:#a1a1aa; font-size:0.68rem; text-transform:uppercase; }
    .btn-divisao.ativo small { color:rgba(0,0,0,0.65); }
    .btn-divisao:hover { color:#fff; border-color:rgba(255,255,255,0.28); transform:translateY(-1px); }
    .btn-divisao.ativo { color:#000; background:var(--theme-primary); border-color:var(--theme-primary); box-shadow:0 10px 22px rgba(0,255,136,0.18); }
    /* 🛡️ Variante "só logo" das abas de competição (Bundesliga, Bundesliga 2, DFB-Pokal...) */
    .btn-divisao-logo { width:56px; height:56px; padding:8px; display:flex; align-items:center; justify-content:center; }
    .btn-divisao-logo.ativo { background:rgba(0,255,136,0.14); }
    .liga-header-card { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:15px; background:linear-gradient(135deg, rgba(0,0,0,0.65), rgba(24,24,27,0.92)); padding:18px; border-radius:14px; border:1px solid rgba(255,255,255,0.12); }
    .liga-title-wrap { display:flex; align-items:center; gap:14px; min-width:0; }
    .liga-title-wrap h2 { margin:0; color:#fff; font-size:1.55rem; }
    .liga-title-wrap span { color:var(--theme-primary); font-weight:900; font-size:0.8rem; text-transform:uppercase; }
    .liga-logo-frame { width:56px; height:56px; flex:0 0 56px; border-radius:12px; display:flex; align-items:center; justify-content:center; background:#fff; padding:6px; box-shadow:0 10px 24px rgba(0,0,0,0.35); }
    .liga-logo-frame img { max-width:100%; max-height:100%; object-fit:contain; }
    .next-match-meta { display:flex; align-items:center; justify-content:space-between; gap:12px; color:var(--text-muted); margin-bottom:14px; font-weight:800; font-size:0.82rem; text-transform:uppercase; }
    .next-match-meta span { display:flex; align-items:center; min-width:0; }
    .next-match-meta strong { color:var(--theme-primary); padding:7px 10px; border-radius:999px; border:1px solid rgba(255,255,255,0.12); background:rgba(0,0,0,0.28); white-space:nowrap; }
    .season-calendar-card { margin-top:15px; padding:18px; border-left:4px solid var(--theme-primary); background:linear-gradient(135deg, rgba(24,24,27,0.88), rgba(0,0,0,0.46)); }
    .season-calendar-head { display:flex; align-items:center; justify-content:space-between; gap:14px; margin-bottom:12px; }
    .season-calendar-head h3 { margin:4px 0 0; font-size:1.1rem; }
    .season-timeline { display:flex; flex-direction:column; gap:8px; }
    .calendar-row { display:grid; grid-template-columns:150px 44px minmax(0,1fr) auto; gap:12px; align-items:center; padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.035); cursor:pointer; transition:0.2s ease; }
    .calendar-row:hover { transform:translateX(3px); border-color:var(--theme-primary); background:rgba(255,255,255,0.07); }
    .calendar-row.atual { border-color:rgba(250,204,21,0.46); background:linear-gradient(90deg, rgba(250,204,21,0.13), rgba(255,255,255,0.035)); }
    .calendar-date strong, .calendar-main strong { display:block; color:#fff; font-size:0.88rem; line-height:1.2; }
    .calendar-date span, .calendar-main span { display:block; color:#a1a1aa; font-size:0.73rem; font-weight:800; margin-top:3px; text-transform:uppercase; }
    .calendar-logo { width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.92); color:#111; padding:5px; font-size:1.35rem; }
    .calendar-logo img { width:100%; height:100%; object-fit:contain !important; }
    .calendar-tag { justify-self:end; font-size:0.7rem; color:var(--theme-primary); font-weight:900; text-transform:uppercase; padding:6px 9px; border-radius:999px; background:rgba(0,0,0,0.32); border:1px solid rgba(255,255,255,0.1); }
    .calendar-empty { color:#a1a1aa; text-align:center; padding:18px; border:1px dashed rgba(255,255,255,0.14); border-radius:12px; }

    .gala-container-premium { width:min(1060px, 94vw) !important; max-height:92vh; overflow-y:auto; margin:auto; border:1px solid rgba(251,191,36,0.35); background:radial-gradient(circle at 50% 0%, rgba(251,191,36,0.18), transparent 34%), linear-gradient(145deg, #111113 0%, #050505 100%); box-shadow:0 30px 90px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.08); }
    .gala-stage { position:relative; padding:30px; text-align:center; overflow:hidden; }
    .gala-stage:before { content:''; position:absolute; inset:0; background:linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.06) 45%, transparent 70%); transform:translateX(-100%); animation:galaSpotlight 5s ease-in-out infinite; pointer-events:none; }
    .gala-kicker { color:#facc15; font-weight:900; text-transform:uppercase; letter-spacing:2px; font-size:0.8rem; }
    .gala-luxo { margin:8px 0 4px; font-size:3rem; font-weight:900; color:#fff; text-transform:uppercase; text-shadow:0 0 26px rgba(251,191,36,0.45); }
    .gala-subtitle { margin:0 auto 22px; max-width:720px; color:#a1a1aa; font-weight:600; }
    .bola-de-ouro-trofeu { width:150px; height:150px; margin:8px auto 18px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:4.1rem; background:radial-gradient(circle at 35% 30%, #fff7ad, #facc15 36%, #b45309 72%); box-shadow:0 0 45px rgba(251,191,36,0.45), inset -12px -18px 30px rgba(0,0,0,0.25); animation:trofeuFloat 2.8s ease-in-out infinite; overflow:hidden; padding:16px; }
    .bola-de-ouro-trofeu img { width:100%; height:100%; object-fit:contain !important; filter:drop-shadow(0 8px 18px rgba(0,0,0,0.35)); }
    .gala-skip-btn { position:absolute; top:14px; right:14px; z-index:5; padding:10px 14px; border-radius:10px; border:1px solid rgba(250,204,21,0.35); background:rgba(0,0,0,0.55); color:#facc15; font-family:'Montserrat'; font-weight:900; cursor:pointer; text-transform:uppercase; }
    .gala-final-actions { position:sticky; bottom:0; padding:14px 0 2px; background:linear-gradient(180deg, transparent, rgba(5,5,5,0.96) 35%); }
    .finalistas-grid { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:16px; align-items:end; margin:26px 0 18px; }
    .finalista-card { background:linear-gradient(180deg, rgba(255,255,255,0.07), rgba(0,0,0,0.42)); border:1px solid rgba(255,255,255,0.11); padding:18px; border-radius:16px; min-height:230px; width:auto; transition:all 0.75s ease; opacity:0; transform:translateY(30px); display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; overflow:hidden; }
    .finalista-card:before { content:attr(data-rank); position:absolute; top:12px; left:12px; color:rgba(255,255,255,0.22); font-size:2.4rem; font-weight:900; }
    .finalista-card.revelado { opacity:1; transform:translateY(0); border-color:rgba(255,255,255,0.22); }
    .finalista-card.vencedor { border-color:#facc15; background:linear-gradient(180deg, rgba(250,204,21,0.24), rgba(0,0,0,0.5)); transform:scale(1.08) translateY(-12px); z-index:10; animation:pulsarVencedor 1.8s ease-in-out infinite alternate; }
    .finalista-card img { width:92px; height:92px; border-radius:50%; margin-bottom:12px; object-fit:cover !important; border:3px solid rgba(255,255,255,0.18); }
    .finalista-card.vencedor img { border-color:#facc15; box-shadow:0 0 26px rgba(250,204,21,0.45); }
    .finalista-card h4 { margin:6px 0; font-size:1.08rem; }
    .finalista-stats { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-top:10px; }
    .finalista-stats span { padding:6px 8px; border-radius:999px; background:rgba(255,255,255,0.08); color:#e5e7eb; font-size:0.76rem; font-weight:800; }
    .gala-awards-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin:24px 0; }
    .gala-award { background:rgba(255,255,255,0.055); padding:15px; border-radius:14px; border:1px solid rgba(255,255,255,0.12); text-align:left; opacity:0; animation:popIn 0.45s ease-out forwards; transition:transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
    .gala-award:hover { transform:translateY(-5px); box-shadow:0 14px 30px rgba(0,0,0,0.4); border-color:rgba(250,204,21,0.35); }
    .gala-award:nth-child(1) { animation-delay:0.05s; } .gala-award:nth-child(2) { animation-delay:0.15s; } .gala-award:nth-child(3) { animation-delay:0.25s; } .gala-award:nth-child(4) { animation-delay:0.35s; } .gala-award:nth-child(5) { animation-delay:0.45s; } .gala-award:nth-child(6) { animation-delay:0.55s; }
    .gala-award img { width:46px; height:46px; object-fit:contain !important; float:right; margin-left:10px; filter:drop-shadow(0 5px 12px rgba(0,0,0,0.45)); }
    .gala-award small { display:block; color:#a1a1aa; font-weight:900; text-transform:uppercase; margin-bottom:8px; }
    .gala-award strong { display:block; color:#fff; line-height:1.25; }
    .gala-award span { display:block; margin-top:8px; color:#facc15; font-weight:900; }
    .gala-premio-palco { margin-top:24px; padding:18px; border:1px solid rgba(250,204,21,0.2); border-radius:16px; background:rgba(0,0,0,0.34); animation:popIn 0.35s ease-out; }
    .gala-premio-palco h3 { margin:0 0 6px; color:#facc15; font-size:1.45rem; text-transform:uppercase; }
    .gala-candidatos-grid { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:12px; margin-top:16px; }
    .gala-candidato { border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:14px; background:rgba(255,255,255,0.055); transition:0.35s ease; }
    .gala-candidato.vencedor { border-color:#facc15; background:rgba(250,204,21,0.14); transform:translateY(-5px); animation:pulsarVencedor 1.8s ease-in-out infinite alternate; }
    .gala-candidato img { width:70px; height:70px; border-radius:50%; object-fit:cover !important; border:2px solid rgba(255,255,255,0.18); }
    .gala-candidato strong { display:block; margin-top:8px; color:#fff; }
    .gala-candidato span { display:block; margin-top:5px; color:#a1a1aa; font-weight:800; font-size:0.82rem; }

    /* PLACAR TOP 30 — BOLA DE OURO (antes sem nenhum CSS: renderizava como divs soltas) */
    .top30-board { display:flex; flex-direction:column; gap:6px; max-height:380px; overflow-y:auto; padding:8px 12px 8px 4px; margin-top:14px; scrollbar-width:thin; scrollbar-color:rgba(250,204,21,0.4) transparent; }
    .top30-board::-webkit-scrollbar { width:6px; }
    .top30-board::-webkit-scrollbar-thumb { background:rgba(250,204,21,0.35); border-radius:999px; }
    .top30-slot { display:flex; align-items:center; gap:12px; padding:9px 16px; border-radius:10px; background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.06); opacity:0.5; transition:opacity 0.5s ease, background 0.5s ease, border-color 0.5s ease, transform 0.4s ease; }
    .top30-slot.revelado { opacity:1; background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.14); animation:top30Pop 0.5s ease-out; }
    .top30-slot.top3.revelado { background:linear-gradient(90deg, rgba(250,204,21,0.16), rgba(255,255,255,0.04)); border-color:rgba(250,204,21,0.5); box-shadow:0 6px 22px rgba(250,204,21,0.18); }
    .top30-rank { width:36px; flex-shrink:0; font-weight:900; font-size:1.02rem; color:#71717a; text-align:center; }
    .top30-slot.top3 .top30-rank { color:#facc15; font-size:1.25rem; text-shadow:0 0 10px rgba(250,204,21,0.5); }
    .top30-slot img { width:44px; height:44px; border-radius:50%; object-fit:cover !important; border:2px solid rgba(255,255,255,0.2); flex-shrink:0; }
    .top30-slot.top3.revelado img { border-color:#facc15; animation:glowTaca 1.6s ease-in-out infinite alternate; }
    .top30-avatar-oculto { width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.06); border:2px dashed rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; color:#52525b; font-weight:900; flex-shrink:0; }
    .top30-info { display:flex; flex-direction:column; align-items:flex-start; text-align:left; overflow:hidden; min-width:0; }
    .top30-info strong { color:#fff; font-size:0.92rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
    .top30-slot:not(.revelado) .top30-info strong { color:#52525b; letter-spacing:2px; }
    .top30-info span { color:#a1a1aa; font-size:0.74rem; font-weight:700; }
    @keyframes top30Pop { 0% { transform:scale(0.94); } 55% { transform:scale(1.015); } 100% { transform:scale(1); } }

    .conquista-stack { position:relative; cursor:pointer; }
    .conquista-count { position:absolute; top:8px; left:58px; min-width:34px; padding:4px 7px; border-radius:999px; background:var(--gold); color:#000; font-weight:900; text-align:center; box-shadow:0 6px 14px rgba(0,0,0,0.35); }
    .conquista-detalhes { display:none; margin-top:10px; color:#cbd5e1; font-size:0.92rem; line-height:1.6; }
    .conquista-stack.aberto .conquista-detalhes { display:block; }
    .transfer-card { display:grid; grid-template-columns:1.2fr 1fr 1fr 0.9fr; gap:14px; align-items:center; padding:16px; border-radius:14px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.32); margin-bottom:12px; }
    .transfer-person, .transfer-club { display:flex; align-items:center; gap:12px; min-width:0; }
    .transfer-person img { width:58px; height:58px; border-radius:50%; object-fit:cover !important; border:2px solid rgba(255,255,255,0.16); }
    .transfer-club img { width:46px; height:46px; border-radius:10px; object-fit:contain !important; background:#fff; padding:4px; }
    .transfer-arrow { color:var(--theme-primary); font-weight:900; text-align:center; }
    .interview-card { width:min(720px, 92vw); background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(0,255,136,0.28); border-radius:16px; padding:26px; box-shadow:0 24px 70px rgba(0,0,0,0.75); }
    .interview-option { width:100%; margin-top:10px; text-align:left; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.06); color:#fff; border-radius:10px; padding:14px; font-family:'Montserrat'; font-weight:800; cursor:pointer; }
    .interview-option:hover { border-color:var(--theme-primary); background:rgba(0,255,136,0.1); }
    .gala-winner-name { background:linear-gradient(90deg, #fff7ad, #facc15, #fde68a, #facc15, #fff7ad); background-size:300% auto; -webkit-background-clip:text; background-clip:text; color:transparent; font-size:3rem; margin:14px 0 4px; text-transform:uppercase; animation:brilhoTexto 3.2s linear infinite; filter:drop-shadow(0 0 20px rgba(250,204,21,0.55)); }
    @keyframes galaSpotlight { 0%, 35% { transform:translateX(-100%); } 60%, 100% { transform:translateX(100%); } }
    @keyframes trofeuFloat { 0%,100% { transform:translateY(0) scale(1); } 50% { transform:translateY(-8px) scale(1.03); } }
    @keyframes popIn { 0% { transform: scale(0.5) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
    @keyframes erguerTaca { from { transform: scale(0.9) translateY(10px); } to { transform: scale(1.1) translateY(-10px); } }
    @keyframes glowTaca { from { filter: drop-shadow(0 0 15px rgba(255,215,0,0.4)); } to { filter: drop-shadow(0 0 40px rgba(255,215,0,0.9)); } }
    @keyframes brilhoTexto { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    @keyframes pulsarVencedor { from { box-shadow: 0 0 20px rgba(212,175,55,0.3); } to { box-shadow: 0 0 50px rgba(212,175,55,0.8); } }
    @keyframes cairConfete { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(360deg); opacity: 0; } }
    @media (max-width: 760px) { .classificacao-hero { align-items:flex-start; flex-direction:column; } .finalistas-grid, .gala-awards-grid, .gala-candidatos-grid { grid-template-columns:1fr; } .gala-luxo, .gala-winner-name { font-size:2rem; } }

    /* POLIMENTO: PARTIDA, COLETIVAS, RANKINGS */
    #modalEntrevista { background:linear-gradient(rgba(0,0,0,0.72), rgba(0,0,0,0.86)), url('https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1800&auto=format&fit=crop'); background-size:cover; background-position:center; }
    .interview-card { position:relative; overflow:hidden; border-top:4px solid var(--theme-primary); background:linear-gradient(145deg, rgba(24,24,27,0.97), rgba(9,9,11,0.97)); }
    .interview-card:before { content:''; position:absolute; left:0; right:0; top:0; height:76px; background:linear-gradient(90deg, rgba(0,255,136,0.18), transparent); pointer-events:none; }
    .match-scoreboard-compact { background:radial-gradient(circle at 50% 0%, rgba(0,255,136,0.10), transparent 45%), linear-gradient(180deg, rgba(24,24,27,0.96), rgba(9,9,11,1)); }
    .match-logo { border-radius:8px !important; background:rgba(255,255,255,0.95); padding:3px; object-fit:contain !important; }
    .match-log { background:linear-gradient(180deg, #050505, #0b0b0f) !important; color:#d1d5db !important; font-family:'Montserrat', monospace !important; }
    .match-log div { border-bottom:1px dashed rgba(255,255,255,0.09) !important; }
    .match-log .gol-meu { color:#facc15 !important; background:rgba(250,204,21,0.08); border:1px solid rgba(250,204,21,0.25); border-radius:8px; padding:10px; box-shadow:0 0 18px rgba(250,204,21,0.12); }
    .match-log .gol-time { color:#00ff88 !important; font-weight:900; }
    .comp-detail-grid { display:grid; grid-template-columns:minmax(0,1fr) 280px; gap:16px; align-items:start; }
    .ranking-mini { background:rgba(0,0,0,0.36); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:14px; position:sticky; top:0; }
    .ranking-mini h4 { margin:0 0 10px; color:var(--theme-primary); text-transform:uppercase; font-size:0.82rem; }
    .ranking-mini-row { display:flex; align-items:center; gap:8px; justify-content:space-between; padding:8px 0; border-bottom:1px dashed rgba(255,255,255,0.08); font-size:0.82rem; }
    .ranking-mini-row img { width:26px; height:26px; border-radius:50%; object-fit:cover !important; }
    .ranking-mini-row-eu { background:rgba(250,204,21,0.10); border:1px solid rgba(250,204,21,0.35); border-radius:8px; padding:8px !important; margin-top:2px; }
    .ranking-mini-row-eu strong { color:var(--gold) !important; }

    /* CONVERSA COM O TÉCNICO (avisos de escalação) */
    #modalConversaTecnico { z-index:1000; background:rgba(0,0,0,0.82); backdrop-filter:blur(6px); }
    .coach-talk-card { width:min(560px, 90vw); background:linear-gradient(145deg, rgba(24,24,27,0.98), rgba(9,9,11,0.98)); border:1px solid rgba(255,255,255,0.14); border-top:4px solid var(--theme-primary); border-radius:16px; padding:24px; box-shadow:0 24px 70px rgba(0,0,0,0.75); position:relative; animation:popIn 0.3s ease-out; }
    .coach-talk-tag { color:var(--theme-primary); font-weight:900; text-transform:uppercase; letter-spacing:1.5px; font-size:0.78rem; }
    .coach-talk-tag.banco { color:#f97316; }
    .coach-talk-tag.fora { color:#ef4444; }
    .coach-talk-avatar { width:54px; height:54px; border-radius:50%; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; font-size:1.6rem; margin-bottom:10px; }
    .coach-talk-quote { margin:10px 0 18px; color:#e5e7eb; font-size:1.08rem; line-height:1.5; font-style:italic; }
    .coach-talk-btn { width:100%; padding:13px; border:none; border-radius:10px; background:var(--theme-primary); color:#000; font-family:'Montserrat'; font-weight:900; cursor:pointer; text-transform:uppercase; letter-spacing:0.5px; }
    .coach-talk-btn:hover { filter:brightness(1.08); }
    .match-log .gol-substituicao { color:#facc15 !important; font-weight:800; background:rgba(250,204,21,0.06); border:1px dashed rgba(250,204,21,0.3); border-radius:8px; padding:8px; }
    .interview-card .interview-tag-grande { display:inline-block; margin-left:8px; padding:3px 9px; border-radius:999px; background:rgba(239,68,68,0.18); color:#f87171; font-size:0.68rem; font-weight:900; text-transform:uppercase; vertical-align:middle; }

    /* HALL DA FAMA */
    .hof-header { display:flex; align-items:center; gap:18px; padding:22px 25px; background:linear-gradient(120deg, rgba(250,204,21,0.10), rgba(255,255,255,0.02)); border:1px solid rgba(250,204,21,0.25); }
    .hof-avatar { width:64px; height:64px; border-radius:50%; background:rgba(250,204,21,0.12); border:2px solid rgba(250,204,21,0.4); display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0; font-size:1.8rem; }
    .hof-avatar img { width:100%; height:100%; object-fit:cover; }
    .hof-stats-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:12px; margin-top:16px; }
    .hof-stat-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:16px; text-align:center; }
    .hof-stat-card strong { display:block; font-size:1.8rem; font-weight:900; color:#fff; }
    .hof-stat-card span { font-size:0.75rem; color:#94a3b8; text-transform:uppercase; font-weight:700; letter-spacing:0.5px; }
    .hof-stat-card.destaque { background:rgba(250,204,21,0.10); border-color:rgba(250,204,21,0.35); }
    .hof-stat-card.destaque strong { color:var(--gold); }
    .hof-trofeu-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(110px, 1fr)); gap:14px; }
    .hof-trofeu-item { display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px 8px; position:relative; transition:transform 0.15s, border-color 0.15s; }
    .hof-trofeu-item:hover { transform:translateY(-3px); border-color:rgba(250,204,21,0.4); }
    .hof-trofeu-item img { width:44px; height:44px; object-fit:contain; }
    .hof-trofeu-fallback { font-size:2rem; }
    .hof-trofeu-item span { font-size:0.74rem; color:#d4d4d8; font-weight:700; line-height:1.25; }
    .hof-trofeu-item em { position:absolute; top:6px; right:8px; font-style:normal; font-size:0.7rem; font-weight:900; color:var(--gold); background:rgba(0,0,0,0.5); border-radius:8px; padding:1px 6px; }
    .hof-trofeu-tag { display:inline-block; background:rgba(250,204,21,0.12); color:#facc15; border:1px solid rgba(250,204,21,0.3); border-radius:999px; padding:2px 8px; font-size:0.72rem; font-weight:700; margin:2px 3px 2px 0; white-space:nowrap; }

    /* GALERIA DE TÉCNICOS */
    .tecnicos-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(170px, 1fr)); gap:16px; margin-top:6px; }
    .tecnico-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.09); border-radius:14px; padding:16px 12px; text-align:center; transition:transform 0.15s, border-color 0.15s; color:inherit; font:inherit; cursor:pointer; width:100%; }
    .tecnico-card:hover { transform:translateY(-3px); border-color:rgba(0,255,136,0.35); }
    .tecnico-card .tecnico-foto { width:78px; height:78px; border-radius:50%; object-fit:cover; border:3px solid var(--theme-primary); margin:0 auto 10px; display:block; background:rgba(255,255,255,0.06); }
    .tecnico-card .tecnico-nome { font-weight:800; font-size:0.92rem; color:#fff; margin:0 0 4px; line-height:1.2; }
    .tecnico-card .tecnico-vinculo { font-size:0.76rem; color:var(--theme-primary); font-weight:700; margin:0 0 6px; min-height:1em; }
    .tecnico-card .tecnico-meta { font-size:0.7rem; color:#9ca3af; display:flex; flex-direction:column; gap:2px; }
    .tecnico-card .tecnico-estilo-chip { display:inline-block; margin-top:8px; padding:3px 9px; border-radius:999px; font-size:0.66rem; font-weight:800; text-transform:uppercase; background:rgba(0,255,136,0.12); color:var(--theme-primary); border:1px solid rgba(0,255,136,0.3); }
    .tecnico-card .tecnico-rep { margin-top:6px; font-size:0.72rem; color:var(--gold); font-weight:800; }

    /* NOTÍCIAS: chips de filtro (clicáveis) */
    .noticia-filtro-chip { font-size:0.72rem; font-weight:800; padding:5px 10px; border-radius:20px; background:color-mix(in srgb, var(--chip-cor) 13%, transparent); color:var(--chip-cor); border:1px solid color-mix(in srgb, var(--chip-cor) 35%, transparent); cursor:pointer; user-select:none; transition:transform 0.12s, filter 0.12s; }
    .noticia-filtro-chip:hover { transform:translateY(-1px); filter:brightness(1.15); }
    .noticia-filtro-chip.ativo { background:var(--chip-cor); color:#000; border-color:var(--chip-cor); }

    /* NOTÍCIAS: cartão "última hora" — reservado a grandes momentos (título, Bola de Ouro, seleção campeã) */
    .noticia-manchete-card { position:relative; background:linear-gradient(135deg, rgba(239,68,68,0.14), rgba(250,204,21,0.08)); border:1px solid rgba(239,68,68,0.4); border-radius:16px; padding:20px; overflow:hidden; }
    .noticia-manchete-card::before { content:''; position:absolute; inset:0; background:repeating-linear-gradient(-45deg, rgba(255,255,255,0.02) 0 12px, transparent 12px 24px); pointer-events:none; }
    .noticia-manchete-tag { display:inline-block; background:#ef4444; color:#fff; font-weight:900; font-size:0.68rem; letter-spacing:1px; padding:4px 10px; border-radius:999px; margin-bottom:12px; animation:pulseManchete 1.8s infinite; }
    @keyframes pulseManchete { 0%,100% { opacity:1; } 50% { opacity:0.55; } }
    .noticia-manchete-body { display:flex; gap:18px; align-items:center; }
    .noticia-manchete-img { width:90px; height:90px; object-fit:contain; background:rgba(255,255,255,0.06); border-radius:12px; padding:8px; flex-shrink:0; }
    .noticia-manchete-headline { margin:0 0 8px; font-size:1.4rem; font-weight:900; color:#fff; line-height:1.2; }
    .noticia-manchete-texto { margin:0 0 8px; color:#e4e4e7; line-height:1.5; }
    .noticia-manchete-cat { font-size:0.75rem; font-weight:800; text-transform:uppercase; }

    /* NOTÍCIAS: cartão estilo "post" de rede social */
    .noticia-post-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:16px 18px; }
    .noticia-post-header { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
    .noticia-post-avatar, .noticia-post-avatar-fallback { width:38px; height:38px; border-radius:50%; object-fit:cover; background:rgba(255,255,255,0.08); flex-shrink:0; }
    .noticia-post-avatar-fallback { display:flex; align-items:center; justify-content:center; font-size:1.1rem; }
    .noticia-post-header strong { display:block; color:#fff; font-size:0.92rem; }
    .noticia-post-cat { font-size:0.72rem; font-weight:800; text-transform:uppercase; }
    .noticia-post-manchete { margin:0 0 4px; color:#f4f4f5; font-weight:800; font-size:1.02rem; }
    .noticia-post-corpo { margin:0 0 12px; color:#cbd5e1; line-height:1.5; }
    .noticia-post-footer { display:flex; gap:18px; color:#94a3b8; font-size:0.82rem; font-weight:700; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px; }

    /* NOTÍCIAS: cartão estilo "manchete de jornal" */
    .noticia-jornal-card { background:#f4f1e8; color:#1a1a1a; border-radius:6px; padding:16px 20px; box-shadow:0 8px 22px rgba(0,0,0,0.35); }
    .noticia-jornal-masthead { display:flex; justify-content:space-between; font-family:'Georgia', serif; font-weight:900; letter-spacing:1px; font-size:0.72rem; border-bottom:2px solid #1a1a1a; padding-bottom:6px; margin-bottom:10px; color:#1a1a1a; text-transform:uppercase; }
    .noticia-jornal-body { display:flex; gap:14px; align-items:flex-start; }
    .noticia-jornal-img { width:88px; height:88px; object-fit:cover; border:1px solid #1a1a1a; filter:grayscale(0.4) contrast(1.05); flex-shrink:0; }
    .noticia-jornal-headline { font-family:'Georgia', serif; font-weight:900; font-size:1.28rem; margin:0 0 6px; line-height:1.15; color:#111; }
    .noticia-jornal-texto { font-family:'Georgia', serif; margin:0; color:#333; line-height:1.45; font-size:0.92rem; column-count:1; }

    /* GALA — barra de progresso das categorias */
    .gala-progresso { display:flex; justify-content:center; gap:6px; margin:14px 0 4px; flex-wrap:wrap; }
    .gala-progresso span { padding:5px 10px; border-radius:999px; font-size:0.68rem; font-weight:900; text-transform:uppercase; background:rgba(255,255,255,0.06); color:#71717a; border:1px solid rgba(255,255,255,0.08); }
    .gala-progresso span.ativo { background:rgba(250,204,21,0.18); color:#facc15; border-color:rgba(250,204,21,0.4); }
    .gala-progresso span.feito { color:#a1a1aa; }

    /* GALA — Melhor 11 do Mundo (campo tático) */
    .melhor11-campo { position:relative; width:min(720px, 92vw); min-height:400px; margin:20px auto; border-radius:16px; background:linear-gradient(180deg, #1c6e3a, #14532d); border:3px solid rgba(255,255,255,0.55); overflow:hidden; box-shadow:inset 0 0 60px rgba(0,0,0,0.4); display:flex; flex-direction:column-reverse; justify-content:space-evenly; padding:22px 14px; gap:8px; }
    .melhor11-campo::before { content:''; position:absolute; inset:0; background-image:repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 10%, transparent 10% 20%); pointer-events:none; }
    .melhor11-campo::after { content:''; position:absolute; left:50%; top:50%; width:26%; aspect-ratio:1/1; border:2px solid rgba(255,255,255,0.5); border-radius:50%; transform:translate(-50%,-50%); pointer-events:none; }
    .melhor11-linha { position:relative; z-index:1; display:flex; justify-content:space-evenly; align-items:flex-start; width:100%; flex-wrap:wrap; gap:10px 6px; }
    .melhor11-vaga { display:flex; flex-direction:column; align-items:center; gap:4px; width:88px; opacity:0; animation:popIn 0.4s ease-out forwards; }
    .melhor11-vaga img { width:46px; height:46px; border-radius:50%; object-fit:cover; border:2px solid #facc15; background:#222; box-shadow:0 4px 12px rgba(0,0,0,0.5); }
    .melhor11-vaga .melhor11-avatar-vazio { width:46px; height:46px; border-radius:50%; background:rgba(255,255,255,0.15); border:2px dashed rgba(255,255,255,0.4); display:flex; align-items:center; justify-content:center; font-size:0.8rem; color:#fff; }
    .melhor11-vaga strong { font-size:0.68rem; color:#fff; text-align:center; text-shadow:0 1px 3px rgba(0,0,0,0.8); line-height:1.1; background:rgba(0,0,0,0.45); padding:2px 5px; border-radius:5px; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .melhor11-vaga span { font-size:0.6rem; color:#facc15; font-weight:900; text-shadow:0 1px 3px rgba(0,0,0,0.8); }
    .gala-award.premio-especial { border-color:rgba(250,204,21,0.4); background:linear-gradient(135deg, rgba(250,204,21,0.1), rgba(255,255,255,0.04)); }
    .fase-bloco { border-radius:14px !important; background:linear-gradient(145deg, rgba(24,24,27,0.92), rgba(0,0,0,0.58)) !important; border:1px solid rgba(255,255,255,0.12) !important; }
    .match-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:14px; }
    .selecao-shell { display:grid; grid-template-columns:minmax(0,1.4fr) minmax(280px,0.8fr); gap:18px; align-items:start; }
    .selecao-hero { position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.12); border-radius:18px; padding:24px; background:radial-gradient(circle at 18% 0%, rgba(0,255,136,0.18), transparent 40%), linear-gradient(145deg, rgba(24,24,27,0.97), rgba(0,0,0,0.8)); display:flex; justify-content:space-between; gap:16px; align-items:center; box-shadow:0 20px 50px rgba(0,0,0,0.4); }
    .selecao-hero::before { content:""; position:absolute; inset:0; background:linear-gradient(120deg, transparent 60%, rgba(255,255,255,0.035) 100%); pointer-events:none; }
    .selecao-hero img { width:86px; height:60px; border-radius:10px; object-fit:cover !important; box-shadow:0 12px 30px rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); }
    .selecao-card { border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.32); border-radius:14px; padding:16px; }
    .convocacao-resumo { display:flex; flex-wrap:wrap; gap:8px; margin:14px 0 4px; }
    .convocacao-resumo span { font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.03em; color:#a1a1aa; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:999px; padding:5px 12px; }
    .convocacao-grupo { margin-top:16px; }
    .convocacao-grupo h4 { display:flex; align-items:center; gap:8px; margin:0 0 10px; color:var(--theme-primary); text-transform:uppercase; font-size:0.82rem; letter-spacing:0.04em; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.08); }
    .convocacao-grupo-count { margin-left:auto; font-size:0.68rem; color:#888; background:rgba(255,255,255,0.06); border-radius:999px; padding:2px 9px; letter-spacing:0; }
    .convocado-row { display:grid; grid-template-columns:44px 1fr 26px auto auto; gap:10px; align-items:center; padding:9px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.035); margin-bottom:7px; cursor:pointer; transition:background 0.15s ease, transform 0.15s ease, border-color 0.15s ease; }
    .convocado-row:hover { background:rgba(255,255,255,0.07); transform:translateX(2px); border-color:rgba(255,255,255,0.2); }
    .convocado-row.eu { border-color:#facc15; background:rgba(250,204,21,0.12); box-shadow:0 0 20px rgba(250,204,21,0.12); }
    .convocado-row.titular { border-left:3px solid var(--theme-primary); }
    .convocado-row.reserva { opacity:0.82; }
    .convocado-row img { width:44px; height:44px; border-radius:50%; object-fit:cover !important; border:1px solid rgba(255,255,255,0.12); }
    .convocado-row div strong { display:block; font-size:0.9rem; }
    .convocado-row small { color:#999; font-weight:700; font-size:0.74rem; }
    .convocado-escudo { width:24px; height:24px; object-fit:contain !important; background:#fff; border-radius:5px; padding:2px; }
    .convocado-status-tag { font-size:0.62rem; font-weight:800; text-transform:uppercase; letter-spacing:0.03em; padding:4px 8px; border-radius:999px; white-space:nowrap; }
    .convocado-status-tag.titular { color:var(--theme-primary); background:rgba(0,255,136,0.12); border:1px solid rgba(0,255,136,0.3); }
    .convocado-status-tag.reserva { color:#999; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); }
    @media (max-width: 640px) {
        .convocado-row { grid-template-columns:38px 1fr auto; }
        .convocado-escudo, .convocado-status-tag { display:none; }
    }
    .selecao-stats-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; }
    .selecao-stat { padding:14px; border-radius:12px; background:rgba(255,255,255,0.055); text-align:center; border:1px solid rgba(255,255,255,0.08); }
    .selecao-stat strong { display:block; font-size:2rem; color:#fff; }
    .modal-convocacao-card { width:min(1100px,94vw); max-height:92vh; overflow:auto; border:1px solid rgba(0,255,136,0.34); border-radius:18px; padding:26px; background:radial-gradient(circle at 50% 0%, rgba(0,255,136,0.2), transparent 32%), linear-gradient(145deg, #141417, #050505); box-shadow:0 28px 90px rgba(0,0,0,0.8); }
    .modal-convocacao-head { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:18px; }
    .modal-convocacao-head img { width:84px; height:58px; object-fit:cover !important; border-radius:10px; }
    .convocacao-modal-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; }
    .convocado-anim { opacity:0; transform:translateY(18px) scale(0.96); animation:convocadoEntrada 0.5s ease forwards; }
    @keyframes convocadoEntrada { to { opacity:1; transform:translateY(0) scale(1); } }
    .bracket-phase { background:linear-gradient(145deg, rgba(15,15,18,0.95), rgba(0,0,0,0.85)); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:20px; margin-bottom:20px; }
    .bracket-title { color:var(--theme-primary); text-transform:uppercase; font-size:0.9rem; letter-spacing:1px; margin:0 0 16px; }
    .knockout-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:14px; }
    .knockout-card { background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:14px; display:flex; flex-direction:column; gap:8px; transition:0.25s; }
    .knockout-card.meu-jogo { border-color:var(--theme-primary); box-shadow:0 0 20px rgba(0,255,136,0.15); }
    .knockout-team { display:flex; align-items:center; gap:10px; padding:8px; border-radius:8px; cursor:pointer; font-weight:700; }
    .knockout-team.winner { color:var(--success); background:rgba(16,185,129,0.12); }
    .knockout-team img { width:28px; height:20px; object-fit:cover; border-radius:4px; }
    .knockout-score { text-align:center; font-size:1.4rem; font-weight:900; color:#fff; padding:6px 0; }
    .penalty-badge { display:inline-block; margin-left:8px; font-size:0.7rem; padding:3px 8px; border-radius:999px; background:rgba(250,204,21,0.2); color:#facc15; font-weight:800; text-transform:uppercase; }
    .bracket-group-card { background:rgba(0,0,0,0.5); border:1px solid #444; border-radius:12px; padding:14px; }
    .bracket-group-card h4 { color:var(--theme-primary); margin:0 0 10px; }
    .bracket-row-me { background:rgba(0,255,136,0.12) !important; color:var(--theme-primary); font-weight:800; }
    .bracket-flag { width:22px; height:15px; margin-right:8px; border-radius:3px; vertical-align:middle; }
    .bracket-tree { display:flex; gap:28px; overflow-x:auto; padding:16px 8px 24px; align-items:stretch; }
    .bracket-round { display:flex; flex-direction:column; justify-content:space-around; gap:18px; min-width:200px; position:relative; }
    .bracket-round:not(:last-child)::after { content:''; position:absolute; right:-14px; top:10%; bottom:10%; width:2px; background:linear-gradient(180deg, transparent, var(--comp-cor, #00ff88), transparent); opacity:0.45; }
    .bracket-round-label { text-align:center; font-size:0.72rem; font-weight:900; text-transform:uppercase; color:var(--comp-cor, var(--theme-primary)); letter-spacing:1px; margin-bottom:4px; }
    .bracket-slot { background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:10px; display:flex; flex-direction:column; gap:6px; position:relative; transition:0.25s; }
    .bracket-slot.meu-jogo { border-color:var(--theme-primary); box-shadow:0 0 18px rgba(0,255,136,0.2); }
    .bracket-slot-score { text-align:center; font-weight:900; font-size:1.1rem; color:#fff; padding:4px 0; border-top:1px dashed rgba(255,255,255,0.1); border-bottom:1px dashed rgba(255,255,255,0.1); }
    .comp-int-shell { padding:4px 0; }
    .comp-int-card { background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:20px; margin-bottom:16px; border-left:4px solid var(--comp-cor, var(--theme-primary)); }
    .comp-int-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px; }
    .comp-int-header h3 { margin:0; font-size:1.4rem; }
    .comp-int-header small { color:#aaa; font-weight:700; }
    .comp-int-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-top:12px; }
    .comp-int-mini { background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.1); border-left:3px solid var(--comp-cor); border-radius:10px; padding:14px; cursor:pointer; transition:0.2s; display:flex; flex-direction:column; gap:4px; }
    .comp-int-mini:hover { transform:translateY(-2px); border-color:var(--comp-cor); }
    .comp-int-mini strong { color:#fff; font-size:0.95rem; }
    .comp-int-mini span { color:#aaa; font-size:0.8rem; }
    .comp-int-mini small { color:var(--gold); font-weight:800; }
    .comp-campeao-banner { text-align:center; padding:20px; margin-top:16px; border-radius:12px; background:linear-gradient(135deg, rgba(250,204,21,0.2), rgba(0,0,0,0.5)); color:var(--gold); font-weight:900; font-size:1.3rem; }
    .comp-int-page { padding:4px 0 24px; }
    .comp-int-hero { position:relative; border-radius:20px; padding:28px 32px; margin-bottom:22px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); background:linear-gradient(135deg, rgba(0,255,136,0.08), rgba(59,130,246,0.06) 50%, rgba(0,0,0,0.6)); display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap; }
    .comp-int-hero-glow { position:absolute; inset:0; background:radial-gradient(circle at 80% 0%, rgba(250,204,21,0.12), transparent 45%); pointer-events:none; }
    .comp-int-hero-content { position:relative; z-index:1; }
    .comp-int-kicker { color:var(--theme-primary); font-weight:900; text-transform:uppercase; font-size:0.75rem; letter-spacing:2px; }
    .comp-int-hero h2 { margin:6px 0 8px; font-size:2rem; font-weight:900; }
    .comp-int-hero p { margin:0; color:#a1a1aa; max-width:520px; }
    .comp-int-hero-stats { display:flex; gap:12px; position:relative; z-index:1; }
    .comp-stat-box { background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:14px 20px; text-align:center; min-width:100px; }
    .comp-stat-box strong { display:block; font-size:1.8rem; color:#fff; line-height:1; }
    .comp-stat-box span { font-size:0.72rem; color:#aaa; text-transform:uppercase; font-weight:800; margin-top:6px; display:block; }
    .comp-cat-tabs { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; }
    .comp-cat-tab { border:1px solid rgba(255,255,255,0.12); background:rgba(0,0,0,0.35); color:#ccc; padding:10px 16px; border-radius:999px; cursor:pointer; font-family:'Montserrat'; font-weight:800; font-size:0.82rem; transition:0.2s; }
    .comp-cat-tab:hover { border-color:var(--theme-primary); color:#fff; }
    .comp-cat-tab.ativo { background:var(--theme-primary); color:#000; border-color:var(--theme-primary); }
    .comp-int-layout { display:grid; grid-template-columns:minmax(240px, 300px) 1fr; gap:20px; align-items:start; }
    .comp-int-sidebar { background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:16px; max-height:70vh; overflow-y:auto; }
    .comp-int-sidebar h4 { margin:0 0 14px; color:var(--theme-primary); font-size:0.85rem; text-transform:uppercase; letter-spacing:1px; }
    .comp-sidebar-item { width:100%; display:flex; gap:12px; align-items:flex-start; text-align:left; padding:12px; margin-bottom:8px; border:1px solid rgba(255,255,255,0.08); border-left:3px solid var(--comp-cor); border-radius:12px; background:rgba(255,255,255,0.03); cursor:pointer; transition:0.2s; font-family:'Montserrat'; color:#fff; }
    .comp-sidebar-item:hover { background:rgba(255,255,255,0.07); transform:translateX(3px); }
    .comp-sidebar-item.ativo { background:rgba(0,255,136,0.1); border-color:var(--theme-primary); box-shadow:0 0 20px rgba(0,255,136,0.12); }
    .comp-sidebar-item strong { display:block; font-size:0.88rem; line-height:1.25; }
    .comp-sidebar-item small { display:block; color:#888; font-size:0.72rem; margin-top:4px; }
    .comp-sidebar-item em { display:block; font-style:normal; color:var(--gold); font-size:0.72rem; font-weight:800; margin-top:4px; }
    .comp-int-main { min-width:0; }
    .comp-int-premium { border-left-width:4px; }
    .comp-int-title-block { display:flex; gap:14px; align-items:center; }
    .comp-int-icon { font-size:2rem; line-height:1; }
    img.comp-int-icon { width:2.4rem; height:2.4rem; object-fit:contain; background:rgba(255,255,255,0.06); border-radius:8px; padding:4px; flex-shrink:0; }
    .comp-int-title-block h3 { margin:0; font-size:1.35rem; }
    .comp-int-title-block p { margin:4px 0 0; color:#888; font-size:0.85rem; }
    .comp-fase-pill { background:rgba(0,0,0,0.4) !important; border-color:var(--comp-cor, var(--theme-primary)) !important; color:var(--comp-cor, var(--theme-primary)) !important; }
    .comp-progress-wrap { height:4px; background:rgba(255,255,255,0.08); border-radius:999px; margin:12px 0 18px; overflow:hidden; }
    .comp-progress-bar { height:100%; background:linear-gradient(90deg, var(--comp-cor, var(--theme-primary)), rgba(255,255,255,0.5)); border-radius:999px; transition:width 0.4s ease; }
    .comp-vagas-banner { display:flex; gap:16px; align-items:center; margin-top:16px; padding:18px; border-radius:14px; background:linear-gradient(135deg, rgba(96,165,250,0.12), rgba(0,0,0,0.5)); border:1px solid rgba(96,165,250,0.25); }
    .comp-vagas-icon { font-size:2rem; }
    .comp-vagas-flags { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
    .comp-vagas-flags img { width:36px; height:24px; object-fit:cover; border-radius:4px; cursor:pointer; border:2px solid transparent; transition:0.2s; }
    .comp-vagas-flags img:hover { border-color:var(--theme-primary); transform:scale(1.1); }
    .comp-table-premium tr.row-qualified { background:rgba(0,255,136,0.1) !important; color:var(--theme-primary); font-weight:700; }
    .comp-empty-main, .comp-empty-sidebar { text-align:center; color:#888; padding:30px 16px; }
    .comp-empty-main span { font-size:3rem; display:block; margin-bottom:12px; }
    .mercado-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:20px; }
    .mercado-panel { background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:20px; }
    .mercado-panel h3 { margin:0 0 14px; color:var(--theme-primary); font-size:1rem; text-transform:uppercase; }
    .desejo-clube { display:flex; align-items:center; gap:12px; padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); margin-bottom:8px; background:rgba(255,255,255,0.03); }
    .desejo-clube img { width:40px; height:40px; object-fit:contain; background:#fff; border-radius:8px; padding:4px; }
    .objetivo-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px dashed rgba(255,255,255,0.08); }
    .objetivo-row.done { color:var(--success); }
    .objetivo-bar { height:6px; background:rgba(255,255,255,0.1); border-radius:999px; margin-top:6px; overflow:hidden; }
    .objetivo-bar-fill { height:100%; background:var(--theme-primary); border-radius:999px; }
    @media (max-width: 900px) { .comp-int-layout { grid-template-columns:1fr; } .mercado-grid { grid-template-columns:1fr; } }
    .grupo-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:14px; }
  .match-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px; }
    @media (max-width: 900px) { .comp-detail-grid, .selecao-shell { grid-template-columns:1fr; } .ranking-mini { position:static; } }

    /* REFINO 2026: MATA-MATAS, SELECOES E COMPETICOES INT */
    .bracket-phase { position:relative; overflow:hidden; border-radius:18px !important; padding:22px !important; background:radial-gradient(circle at 18% 0%, rgba(255,255,255,0.08), transparent 30%), linear-gradient(145deg, rgba(17,17,20,0.96), rgba(0,0,0,0.86)) !important; box-shadow:0 22px 48px rgba(0,0,0,0.32); }
    .bracket-phase::before { content:''; position:absolute; inset:0 0 auto; height:3px; background:linear-gradient(90deg, var(--theme-primary), transparent); opacity:0.9; }
    .bracket-title { display:flex; align-items:center; gap:8px; color:var(--theme-primary) !important; font-size:0.86rem !important; }
    .bracket-title::before { content:'●'; font-size:0.62rem; }
    .knockout-grid { grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)) !important; gap:16px !important; }
    .knockout-card { position:relative; display:grid !important; grid-template-rows:auto auto auto; gap:8px !important; padding:12px !important; border-radius:16px !important; background:linear-gradient(180deg, rgba(255,255,255,0.065), rgba(0,0,0,0.45)) !important; box-shadow:0 18px 34px rgba(0,0,0,0.28); overflow:hidden; }
    .knockout-card::after { content:''; position:absolute; inset:auto 14px 0; height:1px; background:linear-gradient(90deg, transparent, var(--theme-primary), transparent); opacity:0.35; }
    .knockout-card:hover { transform:translateY(-3px); border-color:rgba(255,255,255,0.28); }
    .knockout-card.meu-jogo { border-color:var(--theme-primary) !important; box-shadow:0 0 0 1px rgba(255,255,255,0.08), 0 22px 42px rgba(0,0,0,0.4) !important; }
    .knockout-team { display:grid !important; grid-template-columns:38px minmax(0,1fr); align-items:center; min-height:54px; padding:10px !important; border-radius:12px !important; background:rgba(255,255,255,0.04); font-weight:800 !important; }
    .knockout-team:hover { background:rgba(255,255,255,0.08); }
    .knockout-team.winner { color:var(--success) !important; background:linear-gradient(90deg, rgba(16,185,129,0.18), rgba(255,255,255,0.04)) !important; }
    .knockout-team img { width:38px !important; height:38px !important; border-radius:9px !important; object-fit:contain !important; background:#fff; padding:4px; }
    .knockout-score { font-size:1rem !important; padding:9px 10px !important; border-radius:999px; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); text-transform:uppercase; }
    .bracket-group-card { background:linear-gradient(145deg, rgba(255,255,255,0.055), rgba(0,0,0,0.44)) !important; border:1px solid rgba(255,255,255,0.12) !important; border-radius:14px !important; box-shadow:0 16px 32px rgba(0,0,0,0.2); }
    .bracket-tree { scrollbar-color:var(--theme-primary) rgba(255,255,255,0.08); }
    .bracket-slot { background:linear-gradient(180deg, rgba(255,255,255,0.07), rgba(0,0,0,0.48)) !important; border-radius:14px !important; box-shadow:0 16px 30px rgba(0,0,0,0.28); }
    .comp-int-hero { background:radial-gradient(circle at 80% 0%, rgba(250,204,21,0.13), transparent 36%), radial-gradient(circle at 12% 15%, rgba(0,255,136,0.14), transparent 42%), linear-gradient(145deg, rgba(20,20,24,0.96), rgba(0,0,0,0.72)) !important; border-color:rgba(255,255,255,0.12) !important; box-shadow:0 24px 60px rgba(0,0,0,0.38); }
    .comp-sidebar-item { background:linear-gradient(90deg, rgba(255,255,255,0.045), rgba(0,0,0,0.18)) !important; }
    .comp-sidebar-item.ativo { background:linear-gradient(90deg, color-mix(in srgb, var(--theme-primary) 18%, transparent), rgba(0,0,0,0.2)) !important; }
    .selecao-hero { border-radius:18px !important; background:radial-gradient(circle at 18% 0%, rgba(255,255,255,0.1), transparent 30%), linear-gradient(145deg, rgba(24,24,27,0.96), rgba(0,0,0,0.76)) !important; box-shadow:0 22px 50px rgba(0,0,0,0.32); }
    .manager-shell { display:flex; flex-direction:column; gap:18px; }
    .manager-hero { display:flex; align-items:center; justify-content:space-between; gap:18px; padding:24px; border-radius:18px; border:1px solid rgba(255,255,255,0.12); background:radial-gradient(circle at 85% 0%, rgba(250,204,21,0.14), transparent 34%), linear-gradient(145deg, rgba(24,24,27,0.96), rgba(0,0,0,0.7)); box-shadow:0 22px 55px rgba(0,0,0,0.34); }
    .manager-hero h2 { margin:4px 0; font-size:2rem; }
    .manager-hero p { margin:0; color:#a1a1aa; max-width:620px; }
    .manager-license { min-width:160px; padding:16px; border-radius:14px; background:rgba(0,0,0,0.42); border:1px solid rgba(255,255,255,0.1); text-align:center; }
    .manager-license strong { display:block; color:var(--theme-primary); font-size:1.45rem; }
    .manager-license span { color:#aaa; font-size:0.82rem; font-weight:800; }
    .manager-club-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; }
    .manager-club-card { min-height:160px; border:1px solid rgba(255,255,255,0.1); border-radius:16px; background:linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.36)); color:#fff; font-family:'Montserrat'; cursor:pointer; padding:18px; text-align:left; transition:0.2s; }
    .manager-club-card:hover { transform:translateY(-3px); border-color:var(--theme-primary); }
    .manager-club-card img { width:58px; height:58px; background:#fff; border-radius:12px; padding:6px; margin-bottom:12px; }
    .manager-club-card strong { display:block; font-size:1rem; }
    .manager-club-card span { display:block; color:#aaa; font-size:0.78rem; font-weight:800; margin-top:6px; }
    .manager-club-title { display:flex; align-items:center; gap:16px; }
    .manager-club-title img { width:72px; height:72px; border-radius:14px; background:#fff; padding:8px; }
    .manager-kpis { display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; }
    .manager-kpis div { padding:16px; border-radius:14px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.34); }
    .manager-kpis span { display:block; color:#aaa; font-size:0.72rem; text-transform:uppercase; font-weight:900; }
    .manager-kpis strong { display:block; color:#fff; font-size:1.35rem; margin-top:6px; }
    .manager-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:start; }
    .manager-panel { padding:18px; border-radius:16px; border:1px solid rgba(255,255,255,0.1); background:linear-gradient(145deg, rgba(24,24,27,0.9), rgba(0,0,0,0.48)); }
    .manager-panel h3 { margin:0 0 14px; color:var(--theme-primary); text-transform:uppercase; font-size:0.9rem; }
    .manager-controls { display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; }
    .manager-controls label { color:#aaa; font-size:0.72rem; font-weight:900; text-transform:uppercase; }
    .manager-controls select { width:100%; margin-top:6px; padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.12); background:#09090b; color:#fff; font-family:'Montserrat'; }
    .manager-mini-note { margin-top:12px; color:#facc15; font-weight:900; font-size:0.82rem; }
    .manager-row { display:grid; grid-template-columns:42px minmax(0,1fr) auto; gap:10px; align-items:center; padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.035); margin-bottom:8px; }
    .manager-row img { width:42px; height:42px; border-radius:10px; object-fit:cover !important; background:#111; }
    .manager-row strong { display:block; color:#fff; line-height:1.2; }
    .manager-row small { color:#aaa; font-weight:800; }
    .manager-row em { font-style:normal; color:#facc15; font-weight:900; font-size:0.82rem; }
    .manager-row .btn { padding:8px 10px; font-size:0.72rem; }
    @media (max-width: 900px) { .manager-grid, .manager-kpis, .manager-controls { grid-template-columns:1fr; } .manager-hero { align-items:flex-start; flex-direction:column; } }

    /* ✨ Camada extra de polimento sobre o hero/KPIs/painéis/linhas do
       Manager — reforça profundidade, hierarquia e feedback de interação
       sem mexer na estrutura HTML já existente. */
    .manager-hero { position:relative; overflow:hidden; }
    .manager-hero::before { content:""; position:absolute; top:-40%; left:-10%; width:60%; height:180%; background:linear-gradient(115deg, transparent 40%, rgba(255,255,255,.05) 50%, transparent 60%); pointer-events:none; }
    .manager-license { position:relative; transition:transform .2s ease, border-color .2s ease; }
    .manager-license:hover { transform:translateY(-2px); border-color:rgba(250,204,21,.35); }
    .manager-kpis div { position:relative; overflow:hidden; transition:transform .2s ease, box-shadow .2s ease; }
    .manager-kpis div::before { content:""; position:absolute; left:0; top:0; bottom:0; width:3px; background:linear-gradient(180deg, var(--theme-primary), transparent); }
    .manager-kpis div:hover { transform:translateY(-3px); box-shadow:0 12px 26px rgba(0,0,0,.35); }
    .manager-panel { position:relative; transition:box-shadow .2s ease; }
    .manager-panel::before { content:""; position:absolute; top:0; left:16px; right:16px; height:1px; background:linear-gradient(90deg, transparent, rgba(0,255,136,.4), transparent); }
    .manager-panel h3 { display:flex; align-items:center; gap:8px; letter-spacing:.06em; }
    .manager-row { transition:transform .15s ease, border-color .15s ease, background .15s ease; }
    .manager-row:hover { transform:translateX(3px); border-color:rgba(255,255,255,.18); background:rgba(255,255,255,.06); }
    .manager-row img { transition:box-shadow .2s ease; }
    .manager-row-titular img { box-shadow:0 0 0 2px rgba(16,185,129,.55); }
    .manager-club-card { position:relative; }
    .manager-club-card::after { content:""; position:absolute; inset:0; border-radius:16px; box-shadow:inset 0 0 0 1px transparent; transition:box-shadow .2s ease; pointer-events:none; }
    .manager-club-card:hover::after { box-shadow:inset 0 0 0 1px rgba(0,255,136,.35); }
    .manager-full-squad-list { display:flex; flex-direction:column; gap:8px; animation:fadeInView .3s ease-out; }
    .manager-retrospecto-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; }
    .retrospecto-item { text-align:center; padding:14px 8px; border-radius:12px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); }
    .retrospecto-item strong { display:block; font-size:1.4rem; font-weight:900; color:#eee; }
    .retrospecto-item span { display:block; font-size:.7rem; color:#888; text-transform:uppercase; font-weight:800; margin-top:4px; }
    .retrospecto-item.vitoria strong { color:#00ff88; }
    .retrospecto-item.empate strong { color:#facc15; }
    .retrospecto-item.derrota strong { color:#f87171; }
    @media (max-width:640px) { .manager-retrospecto-grid { grid-template-columns:repeat(2, 1fr); } }
    .manager-shell { position:relative; min-height:calc(100vh - 220px); background:radial-gradient(circle at 15% 0%, rgba(0,255,136,.035), transparent 40%), radial-gradient(circle at 85% 30%, rgba(250,204,21,.03), transparent 45%); }

    /* ==========================================
       🏆 REDESIGN 2026: COMPETIÇÕES INT — GRUPOS & MATA-MATA
       Camada final e definitiva — sobrepõe qualquer regra antiga
       ========================================== */

    /* ---- Bloco de fase (cabeçalho de cada etapa) ---- */
    .bracket-phase { position:relative !important; overflow:visible !important; background:linear-gradient(150deg, rgba(255,255,255,0.045), rgba(0,0,0,0.55)) !important; border:1px solid rgba(255,255,255,0.08) !important; border-radius:18px !important; padding:22px !important; margin-bottom:22px !important; box-shadow:0 18px 40px rgba(0,0,0,0.3) !important; }
    .bracket-phase::before { content:'' !important; position:absolute !important; inset:0 0 auto 0 !important; height:3px !important; border-radius:18px 18px 0 0 !important; background:linear-gradient(90deg, var(--comp-cor, var(--theme-primary)), transparent) !important; opacity:0.9 !important; }
    .bracket-title { display:flex !important; align-items:center !important; gap:9px !important; margin:0 0 18px !important; padding:0 !important; color:var(--comp-cor, var(--theme-primary)) !important; font-size:0.82rem !important; font-weight:900 !important; text-transform:uppercase !important; letter-spacing:1.5px !important; }
    .bracket-title::after { content:'' !important; flex:1 !important; height:1px !important; background:linear-gradient(90deg, rgba(255,255,255,0.18), transparent) !important; }
    .bracket-title::before { content:'●' !important; font-size:0.55rem !important; color:var(--comp-cor, var(--theme-primary)) !important; }

    /* ---- Stepper de etapas do torneio ---- */
    .comp-stepper { display:flex; align-items:center; gap:0; overflow-x:auto; margin:2px 0 6px; padding-bottom:4px; }
    .comp-step { display:flex; align-items:center; gap:8px; flex-shrink:0; }
    .comp-step-dot { display:flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; font-size:0.68rem; font-weight:900; background:rgba(255,255,255,0.08); color:#9a9aa2; flex-shrink:0; }
    .comp-step-label { font-size:0.72rem; font-weight:800; color:#9a9aa2; text-transform:uppercase; letter-spacing:0.4px; white-space:nowrap; }
    .comp-step.feito .comp-step-dot { background:rgba(16,185,129,0.18); color:var(--success); }
    .comp-step.feito .comp-step-label { color:#c9c9cf; }
    .comp-step.atual .comp-step-dot { background:var(--comp-cor, var(--theme-primary)); color:#000; box-shadow:0 0 0 4px color-mix(in srgb, var(--comp-cor, var(--theme-primary)) 22%, transparent); }
    .comp-step.atual .comp-step-label { color:#fff; }
    .comp-step-line { width:26px; height:2px; background:rgba(255,255,255,0.14); margin:0 6px; flex-shrink:0; }

    /* ---- Fase de grupos ---- */
    .grupo-grid { display:grid !important; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)) !important; gap:16px !important; margin-top:0 !important; }
    .bracket-group-card { background:linear-gradient(160deg, rgba(255,255,255,0.05), rgba(0,0,0,0.5)) !important; border:1px solid rgba(255,255,255,0.09) !important; border-left:3px solid var(--comp-cor, var(--theme-primary)) !important; border-radius:14px !important; padding:16px !important; backdrop-filter:none !important; box-shadow:0 12px 26px rgba(0,0,0,0.25) !important; transition:0.25s !important; }
    .bracket-group-card:hover { transform:translateY(-2px) !important; border-color:var(--comp-cor, var(--theme-primary)) !important; box-shadow:0 16px 32px rgba(0,0,0,0.32) !important; }
    .grupo-card-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:12px; }
    .bracket-group-card h4 { margin:0 !important; padding:0 !important; color:#fff !important; font-size:0.95rem !important; font-weight:900 !important; text-transform:uppercase !important; letter-spacing:1px !important; }
    .bracket-group-card h4::before { content:none !important; }
    .grupo-card-meta { font-size:0.65rem; color:var(--comp-cor, var(--theme-primary)); font-weight:800; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap; }

    .grupo-table { width:100% !important; border-collapse:collapse !important; border-spacing:0 !important; }
    .grupo-table thead th { text-align:left !important; padding:0 8px 8px !important; color:#7c7c85 !important; font-size:0.6rem !important; text-transform:uppercase !important; letter-spacing:1px !important; font-weight:900 !important; border-bottom:1px solid rgba(255,255,255,0.08) !important; background:none !important; }
    .grupo-table th.col-pos, .grupo-table td.col-pos { text-align:center !important; width:30px; }
    .grupo-table th:not(.col-team):not(.col-pos), .grupo-table td:not(.col-team):not(.col-pos) { text-align:center !important; }
    .grupo-table tbody tr { cursor:pointer; transition:0.15s; }
    .grupo-table tbody tr:hover td { background:rgba(255,255,255,0.045) !important; }
    .grupo-table td { padding:9px 8px !important; font-size:0.85rem !important; font-weight:600 !important; color:#e4e4e7 !important; background:none !important; border-radius:0 !important; border-bottom:1px solid rgba(255,255,255,0.05) !important; }
    .grupo-table tbody tr:last-child td { border-bottom:none !important; }
    .grupo-table tr td:first-child, .grupo-table tr td:last-child { border-radius:0 !important; padding-left:8px !important; padding-right:8px !important; }
    .grupo-table td.col-team { display:flex; align-items:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .grupo-table td strong { color:#fff !important; font-weight:900 !important; }

    .grupo-pos { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; background:rgba(255,255,255,0.08); font-weight:900; font-size:0.72rem; color:#aaa; }
    .grupo-pos.rank-1 { background:linear-gradient(135deg, #fde68a, #d97706); color:#241a00; }
    .grupo-pos.rank-2 { background:linear-gradient(135deg, #f1f5f9, #94a3b8); color:#1a1a1a; }
    .grupo-pos.rank-3 { background:linear-gradient(135deg, #f0c9a0, #b0692f); color:#241505; }

    tr.row-qualifica td { background:color-mix(in srgb, var(--comp-cor, var(--theme-primary)) 7%, transparent) !important; }
    tr.linha-corte td { border-bottom:2px dashed color-mix(in srgb, var(--comp-cor, var(--theme-primary)) 55%, transparent) !important; padding-bottom:12px !important; }

    .bracket-row-me { background:color-mix(in srgb, var(--comp-cor, var(--theme-primary)) 14%, transparent) !important; }
    .bracket-row-me td { color:var(--comp-cor, var(--theme-primary)) !important; font-weight:800 !important; }
    .bracket-flag { width:24px !important; height:17px !important; object-fit:contain !important; border-radius:3px !important; margin-right:9px !important; vertical-align:middle !important; box-shadow:0 2px 6px rgba(0,0,0,0.3) !important; flex-shrink:0; background:rgba(255,255,255,0.06) !important; }

    .comp-table-premium { padding:16px !important; }

    /* ---- Chaveamento / mata-mata ---- */
    .bracket-tree { display:flex !important; gap:20px !important; overflow-x:auto !important; padding:2px 2px 8px !important; align-items:flex-start !important; scrollbar-color:var(--comp-cor, var(--theme-primary)) rgba(255,255,255,0.08); }
    .bracket-round { min-width:0 !important; flex:1 1 100% !important; position:static !important; }
    .bracket-round::after { display:none !important; }
    .bracket-round-label { text-align:left !important; font-size:0.7rem !important; font-weight:900 !important; text-transform:uppercase !important; color:var(--comp-cor, var(--theme-primary)) !important; letter-spacing:1.5px !important; margin:0 0 12px !important; }
    .bracket-round-slots { display:grid; grid-template-columns:repeat(auto-fit, minmax(290px, 1fr)); gap:14px; }

    .bracket-slot { background:linear-gradient(160deg, rgba(255,255,255,0.05), rgba(0,0,0,0.55)) !important; border:1px solid rgba(255,255,255,0.09) !important; border-left:3px solid var(--comp-cor, #00ff88) !important; border-radius:14px !important; padding:5px !important; display:block !important; gap:0 !important; position:relative !important; box-shadow:0 12px 26px rgba(0,0,0,0.25) !important; transition:0.2s !important; }
    .bracket-slot:hover { transform:translateY(-2px); border-color:var(--comp-cor, #00ff88) !important; }
    .bracket-slot.meu-jogo { box-shadow:0 0 0 1px var(--comp-cor, #00ff88), 0 16px 30px rgba(0,0,0,0.35) !important; }
    .bracket-slot.pendente .bracket-slot-goals { opacity:0.35; }

    .bracket-slot-team { display:grid; grid-template-columns:30px minmax(0,1fr) auto 16px; align-items:center; gap:9px; padding:8px 9px; border-radius:9px; cursor:pointer; font-weight:700; font-size:0.86rem; }
    .bracket-slot-team:hover { background:rgba(255,255,255,0.05); }
    /* 🛡️ FIX: o escudo era um retângulo 26x18 com object-fit:cover (herdado do
       estilo das bandeirinhas de país) — isso CORTAVA o topo/base dos escudos
       dos clubes, que são quadrados/circulares. Agora é quadrado com contain,
       mostrando o escudo inteiro sem cortar nada. */
    .bracket-slot-crest { width:28px !important; height:28px !important; object-fit:contain; border-radius:6px; background:rgba(255,255,255,0.06); flex-shrink:0; }
    .bracket-slot-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#e4e4e7; min-width:0; }
    .bracket-slot-goals { font-variant-numeric:tabular-nums; font-weight:900; font-size:1.05rem; color:#fff; min-width:16px; text-align:center; }
    .bracket-slot-check { color:var(--success); font-weight:900; font-size:0.8rem; }
    .bracket-slot-team.winner { background:linear-gradient(90deg, rgba(16,185,129,0.16), rgba(16,185,129,0.02)); }
    .bracket-slot-team.winner .bracket-slot-name { color:var(--success); }
    .bracket-slot-team.eliminated { opacity:0.4; filter:grayscale(0.5); }
    .bracket-slot-team.tbd { opacity:0.4; font-style:italic; cursor:default; }
    .tbd-crest { display:flex !important; align-items:center; justify-content:center; color:#777; font-size:0.65rem; font-style:normal; }

    .bracket-slot-mid { display:flex; align-items:center; justify-content:center; gap:8px; padding:1px 9px 3px; }
    .bracket-slot-vs { font-size:0.6rem; font-weight:900; letter-spacing:1.5px; color:rgba(255,255,255,0.3); }

    /* 🛡️ FIX: a árvore horizontal de mata-mata (renderArvoreHorizontalMataMata)
       calcula um "top" em pixels para posicionar cada confronto e alinhá-lo
       com o par correspondente na rodada seguinte — mas essa CSS nunca tinha
       sido escrita! Sem "position:relative" no contentor e "position:absolute"
       no card, o "top" inline não tem NENHUM efeito (é ignorado em elementos
       com position:static), e os cards ficavam em fluxo normal, empilhando e
       cortando-se uns aos outros — exatamente o bug relatado ("só dá para ver
       1 time"). */
    .bracket-tree-scroll { overflow-x:auto; overflow-y:visible; padding:10px 4px 28px; }
    .bracket-tree-round { display:flex; flex-direction:column; flex-shrink:0; }
    .bracket-tree-round-title { text-align:center; font-weight:900; text-transform:uppercase; font-size:0.72rem; letter-spacing:1.2px; color:var(--comp-cor, var(--theme-primary)); margin-bottom:12px; }
    .bracket-tree-round-body { position:relative; }
    .bracket-tree-match { position:absolute; left:0; overflow:visible; }
    .bracket-tree-connector { flex-shrink:0; align-self:center; }
    .bracket-tree-bloco-sep { text-align:center; color:var(--theme-primary,#00ff88); font-size:0.8rem; font-weight:600; letter-spacing:0.3px; padding:6px 0 12px; opacity:0.85; }

    /* ==========================================
       🎬 OVERLAY DE INTRODUÇÃO DE COMPETIÇÃO
       🛡️ FIX: esta classe nunca teve CSS nenhum — o overlay devia aparecer
       em tela cheia como uma cinemática, mas sem esta regra ele só existia
       "solto" no HTML, sem posição nem tamanho.
       ========================================== */
    .intro-comp-overlay { position:fixed; inset:0; z-index:99999; background:#000; display:flex; align-items:center; justify-content:center; overflow:hidden; }
    .intro-comp-video { width:100%; height:100%; object-fit:cover; }
    .intro-comp-fallback { position:relative; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
    .intro-comp-rays { position:absolute; inset:-20%; background:conic-gradient(from 0deg, transparent, var(--intro-cor, #facc15) 8%, transparent 16%); opacity:0.25; animation:girarRays 12s linear infinite; }
    @keyframes girarRays { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
    .intro-comp-logo { width:140px; height:140px; object-fit:contain; margin-bottom:24px; position:relative; z-index:1; filter:drop-shadow(0 0 30px rgba(255,255,255,0.3)); animation:pulsarLogo 2.2s ease-in-out infinite; }
    @keyframes pulsarLogo { 0%,100% { transform:scale(1); } 50% { transform:scale(1.06); } }
    .intro-comp-title { position:relative; z-index:1; font-size:2.6rem; font-weight:900; text-transform:uppercase; letter-spacing:2px; color:#fff; text-shadow:0 0 24px var(--intro-cor, #facc15); margin:0; }
    .intro-comp-sub { position:relative; z-index:1; color:#ccc; font-size:1rem; margin-top:10px; letter-spacing:3px; text-transform:uppercase; }
    .intro-comp-skip { position:fixed; bottom:24px; right:24px; z-index:2; padding:10px 20px; border-radius:24px; border:1px solid rgba(255,255,255,0.25); background:rgba(0,0,0,0.5); color:#fff; font-weight:700; cursor:pointer; backdrop-filter:blur(6px); }
    .intro-comp-skip:hover { background:rgba(255,255,255,0.15); }

    /* ==========================================
       🎮 MINI-JOGO DE PÊNALTI INTERATIVO
       ========================================== */
    .penalti-overlay { position:fixed; inset:0; z-index:99998; background:rgba(0,0,0,0.88); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
    .penalti-modal { text-align:center; padding:20px; max-width:480px; width:92%; }
    .penalti-titulo { font-size:1.8rem; font-weight:900; color:var(--theme-primary); margin:0 0 6px; text-transform:uppercase; letter-spacing:1px; }
    .penalti-sub { color:#ccc; margin:0 0 24px; }
    .penalti-baliza { position:relative; background:linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01)); border:4px solid #fff; border-bottom:none; border-radius:6px 6px 0 0; display:grid; grid-template-columns:repeat(3, 1fr); height:180px; box-shadow:0 0 60px rgba(255,255,255,0.08) inset; }
    .penalti-zona { display:flex; align-items:center; justify-content:center; font-size:2.4rem; cursor:pointer; border-right:2px dashed rgba(255,255,255,0.15); transition:0.15s; user-select:none; }
    .penalti-zona:last-child { border-right:none; }
    .penalti-zona:hover { background:rgba(0,255,136,0.15); transform:scale(1.05); }
    .penalti-zona.escolhida { background:rgba(0,255,136,0.3); animation:pulsarZonaEscolhida 0.5s ease-in-out infinite alternate; }
    @keyframes pulsarZonaEscolhida { from { background:rgba(0,255,136,0.25); } to { background:rgba(0,255,136,0.45); } }
    .penalti-resultado { margin-top:22px; font-size:1.1rem; font-weight:800; color:#fff; min-height:1.4em; }

    /* ==========================================
       🎯 DISPUTA DE PÊNALTIS (mata-mata de clube empatado)
       ========================================== */
    .shootout-overlay { position:fixed; inset:0; z-index:99997; background:rgba(0,0,0,0.92); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
    .shootout-modal { text-align:center; padding:24px; max-width:520px; width:92%; }
    .shootout-titulo { font-size:1.6rem; font-weight:900; color:var(--gold); margin:0 0 20px; text-transform:uppercase; letter-spacing:1px; }
    .shootout-placar { display:flex; align-items:center; justify-content:center; gap:18px; margin-bottom:16px; }
    .shootout-time { display:flex; flex-direction:column; align-items:center; gap:6px; min-width:110px; }
    .shootout-time img { width:44px; height:44px; object-fit:contain; }
    .shootout-time span { font-size:0.85rem; font-weight:700; color:#ccc; }
    .shootout-time strong { font-size:2.2rem; font-weight:900; color:#fff; }
    .shootout-vs { font-size:1.4rem; color:#666; font-weight:900; }
    .shootout-bolas { display:flex; gap:6px; justify-content:center; min-height:24px; margin-bottom:4px; }
    .shootout-bola { font-size:1.1rem; }
    .shootout-bola.falhou { filter:grayscale(1); opacity:0.6; }
    .shootout-status { margin-top:18px; font-size:1.05rem; font-weight:700; color:var(--theme-primary); min-height:1.4em; }
    .penalty-badge { display:inline-block !important; margin:0 !important; font-size:0.62rem !important; padding:2px 7px !important; border-radius:999px !important; background:rgba(250,204,21,0.18) !important; color:#facc15 !important; font-weight:800 !important; text-transform:uppercase !important; }

    @media (max-width: 640px) {
        .comp-int-layout { grid-template-columns:1fr !important; }
        .bracket-round-slots { grid-template-columns:1fr; }
        .grupo-grid { grid-template-columns:1fr !important; }
    }

    /* ---- Chaveamento com abas (Fase de Grupos / Oitavas / Quartas / Semis / Final) ---- */
    .bracket-tabs-wrap { display:flex; flex-direction:column; gap:16px; }
    .bracket-tabs { display:flex; gap:8px; flex-wrap:wrap; padding:6px; border-radius:14px; background:rgba(0,0,0,0.32); border:1px solid rgba(255,255,255,0.1); }
    .bracket-tab-btn { flex:1 1 auto; min-width:110px; padding:12px 14px; border-radius:10px; border:1px solid transparent; background:transparent; color:#a1a1aa; font-family:'Montserrat'; font-weight:800; font-size:0.76rem; text-transform:uppercase; letter-spacing:0.5px; cursor:pointer; transition:0.2s ease; white-space:nowrap; }
    .bracket-tab-btn:hover { color:#fff; background:rgba(255,255,255,0.07); }
    .bracket-tab-btn.ativo { background:var(--comp-cor, var(--theme-primary)); color:#000; box-shadow:0 8px 20px rgba(0,0,0,0.32); }
    .bracket-tab-panel { display:none; }
    .bracket-tab-panel.ativo { display:block; animation: fadeIn 0.25s ease; }
    .bracket-grid-confrontos { display:grid; grid-template-columns:repeat(2, 1fr); grid-auto-rows:min-content; align-content:start; gap:14px; max-height:calc(100vh - 360px); min-height:220px; overflow-y:auto; padding-right:4px; }
    @media (max-width: 900px) {
        .bracket-grid-confrontos { grid-template-columns:1fr; max-height:none; overflow-y:visible; }
        .bracket-tabs { overflow-x:auto; flex-wrap:nowrap; }
    }
`;
document.head.appendChild(styleOverrides);

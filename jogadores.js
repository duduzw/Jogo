// ==========================================
// JOGADORES IA
// ==========================================

export const jogadoresIA = [

    // ================== BRASILEIRÃO SÉRIE A ==================
    // FLAMENGO
    { id: "j_pedro", nome: "Pedro", idade: 29, geral: 83, clubeId: "c_fla", nacionalidade: "Brasil", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gerson", nome: "Gerson", idade: 29, geral: 81, clubeId: "c_fla", nacionalidade: "Brasil", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_delacruz", nome: "De La Cruz", idade: 29, geral: 82, clubeId: "c_fla", nacionalidade: "Uruguai", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_leopereira", nome: "Léo Pereira", idade: 31, geral: 79, clubeId: "c_fla", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_rossi", nome: "Agustín Rossi", idade: 31, geral: 79, clubeId: "c_fla", nacionalidade: "Argentina", posicao:"Goleiro",foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_emerson", nome: "Emerson Royal", idade: 29, geral: 79, clubeId: "c_fla", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/23/88/532388_emerson_royal_20250118170305.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    // PALMEIRAS
    { id: "j_flaco", nome: "Flaco Lopes", idade: 25, geral: 78, clubeId: "c_pal", nacionalidade: "Argentina", posicao:"Atacante", foto: "https://www.ogol.com.br/img/jogadores/new/35/66/843566_flaco_lopez_20251116005923.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gustavogomez", nome: "Gustavo Gómez", idade: 31, geral: 81, clubeId: "c_pal", nacionalidade: "Paraguai",posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_andreas", nome: "Andreas Pereira", idade: 30, geral: 80, clubeId: "c_pal", nacionalidade: "Brasil",posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/08/88/370888_andreas_pereira_20240816193756.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vt_roque", nome: "Vitor Roque", idade: 21, geral: 80, clubeId: "c_pal", nacionalidade: "Brasil", posicao:"Atacante", foto: "https://www.ogol.com.br/img/jogadores/new/64/02/836402_vitor_roque_20250615225512.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_murilo", nome: "Murilo", idade: 27, geral: 79, clubeId: "c_pal", nacionalidade: "Brasil", posicao:"Zagueiro",foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_cr_miguel", nome: " Carlos Miguel", idade: 27, geral: 79, clubeId: "c_pal", nacionalidade: "Brasil", posicao:"Goleiro",foto: "https://cdn-img.staticzz.com/img/jogadores/new/23/77/612377_carlos_miguel_20240820233151.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // SÃO PAULO
    { id: "j_lucasm", nome: "Lucas Moura", idade: 32, geral: 81, clubeId: "c_sao", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_calleri", nome: "Calleri", idade: 30, geral: 80, clubeId: "c_sao", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_luciano", nome: "Luciano", idade: 31, geral: 78, clubeId: "c_sao", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_rafael", nome: "Rafael", idade: 35, geral: 79, clubeId: "c_sao", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_arboleda", nome: "Arboleda", idade: 32, geral: 78, clubeId: "c_sao", nacionalidade: "Equador", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pablomaia", nome: "Pablo Maia", idade: 22, geral: 77, clubeId: "c_sao", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // CORINTHIANS
    { id: "j_hugosouza", nome: "Hugo Souza", idade: 26, geral: 77, clubeId: "c_cor", nacionalidade: "Brasil", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/planteis/new/72/46/14167246_hugo_souza_20250505162035.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_matheus_donelli", nome: "Matheus Donelli", idade: 23, geral: 72, clubeId: "c_cor", nacionalidade: "Brasil", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_felix_torres", nome: "Felix Torres", idade: 29, geral: 77, clubeId: "c_cor", nacionalidade: "Equador", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gustavo_henrique", nome: "Gustavo Henrique", idade: 33, geral: 75, clubeId: "c_cor", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_caca", nome: "Caca", idade: 27, geral: 74, clubeId: "c_cor", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_matheuzinho", nome: "Matheuzinho", idade: 25, geral: 76, clubeId: "c_cor", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_hugo", nome: "Hugo", idade: 28, geral: 75, clubeId: "c_cor", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bidon", nome: "Ryan", idade: 22, geral: 75, clubeId: "c_cor", nacionalidade: "Brasil", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/planteis/new/43/79/14254379_breno_bidon_20250507190426.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_josemartinez", nome: "Jose Martinez", idade: 31, geral: 77, clubeId: "c_cor", nacionalidade: "Venezuela", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_garro", nome: "Rodrigo Garro", idade: 27, geral: 80, clubeId: "c_cor", nacionalidade: "Argentina", posicao:"Meio-Campista", foto: "https://www.ogol.com.br/img/jogadores/new/74/08/657408_rodrigo_garro_20240206093732.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_coronado", nome: "Igor Coronado", idade: 33, geral: 78, clubeId: "c_cor", nacionalidade: "Brasil", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lingard", nome: "Jesse Lingard", idade: 33, geral: 78, clubeId: "c_cor", nacionalidade: "Inglaterra", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/65/49/156549_jesse_lingard_20260309154707.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_memphis", nome: "Memphis Depay", idade: 32, geral: 82, clubeId: "c_cor", nacionalidade: "Holanda", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/98/19/179819_memphis_depay_20250311161851.jpg", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_yuri", nome: "Yuri Alberto", idade: 24, geral: 79, clubeId: "c_cor", nacionalidade: "Brasil", posicao:"Atacante", foto: "https://www.ogol.com.br/img/jogadores/new/06/61/1130661_yuri_alberto_20240513114123.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_romero", nome: "Angel Romero", idade: 33, geral: 76, clubeId: "c_cor", nacionalidade: "Paraguai", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_talles", nome: "Talles Magno", idade: 23, geral: 77, clubeId: "c_cor", nacionalidade: "Brasil", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // SANTOS
    { id: "j_giuliano", nome: "Giuliano", idade: 34, geral: 76, clubeId: "c_san", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_schmidt", nome: "João Schmidt", idade: 31, geral: 75, clubeId: "c_san", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pituca", nome: "Diego Pituca", idade: 32, geral: 75, clubeId: "c_san", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ney", nome: "Neymar", idade: 33, geral: 84, clubeId: "c_san", nacionalidade: "Brasil", foto: "https://cdn-img.staticzz.com/img/planteis/new/72/99/14307299_neymar_20250516101210.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_guilherme", nome: "Guilherme", idade: 29, geral: 76, clubeId: "c_san", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // ATLÉTICO MINEIRO
    { id: "j_hulk", nome: "Hulk", idade: 38, geral: 81, clubeId: "c_cam", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_paulinho", nome: "Paulinho", idade: 24, geral: 80, clubeId: "c_cam", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_arana", nome: "Guilherme Arana", idade: 27, geral: 80, clubeId: "c_cam", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_zaracho", nome: "Zaracho", idade: 26, geral: 79, clubeId: "c_cam", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_everson", nome: "Everson", idade: 34, geral: 78, clubeId: "c_cam", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_scarpa", nome: "Gustavo Scarpa", idade: 30, geral: 79, clubeId: "c_cam", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // FLUMINENSE
    { id: "j_cano", nome: "Germán Cano", idade: 36, geral: 80, clubeId: "c_flu", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_arias", nome: "Jhon Arias", idade: 26, geral: 81, clubeId: "c_flu", nacionalidade: "Colômbia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_tsilva", nome: "Thiago Silva", idade: 39, geral: 82, clubeId: "c_flu", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ganso", nome: "PH Ganso", idade: 34, geral: 79, clubeId: "c_flu", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_fabio", nome: "Fábio", idade: 43, geral: 78, clubeId: "c_flu", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_martineli", nome: "Martinelli", idade: 22, geral: 77, clubeId: "c_flu", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // GRÊMIO
    { id: "j_soteldo", nome: "Soteldo", idade: 27, geral: 78, clubeId: "c_gre", nacionalidade: "Venezuela", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_cristaldo", nome: "Cristaldo", idade: 28, geral: 78, clubeId: "c_gre", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kannemann", nome: "Kannemann", idade: 33, geral: 77, clubeId: "c_gre", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_villasanti", nome: "Villasanti", idade: 27, geral: 79, clubeId: "c_gre", nacionalidade: "Paraguai", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_dcosta", nome: "Diego Costa", idade: 35, geral: 78, clubeId: "c_gre", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_marchesin", nome: "Marchesín", idade: 36, geral: 77, clubeId: "c_gre", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // INTERNACIONAL
    { id: "j_apatrick", nome: "Alan Patrick", idade: 33, geral: 80, clubeId: "c_int", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_valencia", nome: "Enner Valencia", idade: 34, geral: 79, clubeId: "c_int", nacionalidade: "Equador", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_borre", nome: "Rafael Borré", idade: 28, geral: 79, clubeId: "c_int", nacionalidade: "Colômbia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_rochet", nome: "Sergio Rochet", idade: 31, geral: 80, clubeId: "c_int", nacionalidade: "Uruguai", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_tmaia", nome: "Thiago Maia", idade: 27, geral: 77, clubeId: "c_int", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_wanderson", nome: "Wanderson", idade: 29, geral: 78, clubeId: "c_int", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // CRUZEIRO
    { id: "j_mpereira", nome: "Matheus Pereira", idade: 28, geral: 81, clubeId: "c_cru", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_dinenno", nome: "Dinenno", idade: 29, geral: 78, clubeId: "c_cru", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_william", nome: "William", idade: 29, geral: 79, clubeId: "c_cru", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_cassio", nome: "Cássio", idade: 37, geral: 78, clubeId: "c_cru", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_jmarcelo", nome: "João Marcelo", idade: 24, geral: 76, clubeId: "c_cru", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lromero", nome: "Lucas Romero", idade: 30, geral: 77, clubeId: "c_cru", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

   // BOTAFOGO
    { id: "j_neto", nome: "Neto", idade: 36, geral: 79, clubeId: "c_bot", nacionalidade: "Brasil", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_raul", nome: "Raul", idade: 24, geral: 74, clubeId: "c_bot", nacionalidade: "Brasil", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vitinho", nome: "Vitinho", idade: 26, geral: 78, clubeId: "c_bot", nacionalidade: "Brasil", posicao:"Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_alex_telles", nome: "Alex Telles", idade: 33, geral: 78, clubeId: "c_bot", nacionalidade: "Brasil", posicao:"Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mateo_ponte", nome: "Mateo Ponte", idade: 22, geral: 77, clubeId: "c_bot", nacionalidade: "Uruguai", posicao:"Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gabriel_justino", nome: "Gabriel Justino", idade: 21, geral: 73, clubeId: "c_bot", nacionalidade: "Brasil", posicao:"Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_barboza", nome: "Alexander Barboza", idade: 30, geral: 81, clubeId: "c_bot", nacionalidade: "Argentina", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bastos", nome: "Bastos", idade: 34, geral: 79, clubeId: "c_bot", nacionalidade: "Angola", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ferraresi", nome: "Nahuel Ferraresi", idade: 27, geral: 78, clubeId: "c_bot", nacionalidade: "Venezuela", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_danilo", nome: "Danilo", idade: 24, geral: 79, clubeId: "c_bot", nacionalidade: "Brasil", posicao:"Meia Ofensivo", foto: "https://cdn-img.staticzz.com/img/planteis/new/37/97/14953797_danilo_20260225045538.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_montoro", nome: "Álvaro Montoro", idade: 20, geral: 78, clubeId: "c_bot", nacionalidade: "Argentina", posicao:"Meia Ofensivo", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_medina", nome: "Cristian Medina", idade: 23, geral: 76, clubeId: "c_bot", nacionalidade: "Argentina", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_newton", nome: "Newton", idade: 25, geral: 76, clubeId: "c_bot", nacionalidade: "Brasil", posicao:"Volante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_jordan_barrera", nome: "Jordan Barrera", idade: 20, geral: 76, clubeId: "c_bot", nacionalidade: "Colômbia", posicao:"Meia Ofensivo", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_edenilson", nome: "Edenílson", idade: 36, geral: 77, clubeId: "c_bot", nacionalidade: "Brasil", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_allan", nome: "Allan", idade: 28, geral: 78, clubeId: "c_bot", nacionalidade: "Brasil", posicao:"Volante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_santiago_rodriguez", nome: "Santiago Rodríguez", idade: 25, geral: 79, clubeId: "c_bot", nacionalidade: "Uruguai", posicao:"Meia Ofensivo", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_matheus_martins", nome: "Matheus Martins", idade: 22, geral: 79, clubeId: "c_bot", nacionalidade: "Brasil", posicao:"Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lucas_villalba", nome: "Lucas Villalba", idade: 24, geral: 75, clubeId: "c_bot", nacionalidade: "Argentina", posicao:"Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_junior_santos", nome: "Júnior Santos", idade: 31, geral: 79, clubeId: "c_bot", nacionalidade: "Brasil", posicao:"Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kadir_barria", nome: "Kadir Barría", idade: 20, geral: 73, clubeId: "c_bot", nacionalidade: "Chile", posicao:"Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_arthur_cabral", nome: "Arthur Cabral", idade: 27, geral: 80, clubeId: "c_bot", nacionalidade: "Brasil", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
      
    // ATHLETICO PR
    { id: "j_fernandinho", nome: "Fernandinho", idade: 39, geral: 80, clubeId: "c_cap", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_theleno", nome: "Thiago Heleno", idade: 35, geral: 77, clubeId: "c_cap", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_zapelli", nome: "Zapelli", idade: 22, geral: 76, clubeId: "c_cap", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_canobbio", nome: "Canobbio", idade: 25, geral: 78, clubeId: "c_cap", nacionalidade: "Uruguai", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mastriani", nome: "Mastriani", idade: 31, geral: 78, clubeId: "c_cap", nacionalidade: "Uruguai", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_leolinck", nome: "Léo Linck", idade: 23, geral: 75, clubeId: "c_cap", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    
    // PORTUGUESA-SP
    { id: "j_gustavohenrique_lusa", nome: "Gustavo Henrique", idade: 25, geral: 67, clubeId: "c_portuguesa_SP", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/21/76/712176_gustavo_henrique_20250113205824.jpg", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_cristiano_lusa", nome: "Cristiano", idade: 26, geral: 67, clubeId: "c_portuguesa_SP", nacionalidade: "Brasil", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_eduardobiazus", nome: "Eduardo Biazus", idade: 23, geral: 66, clubeId: "c_portuguesa_SP", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_taua_lusa", nome: "Tauã", idade: 24, geral: 65, clubeId: "c_portuguesa_SP", nacionalidade: "Brasil", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_brunobertinato", nome: "Bruno Bertinato", idade: 35, geral: 66, clubeId: "c_portuguesa_SP", nacionalidade: "Brasil", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_barba_lusa", nome: "Barba", idade: 29, geral: 65, clubeId: "c_portuguesa_SP", nacionalidade: "Brasil", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gustavotalles", nome: "Gustavo Talles", idade: 26, geral: 65, clubeId: "c_portuguesa_SP", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_guilhermeportuga", nome: "Guilherme Portuga", idade: 25, geral: 64, clubeId: "c_portuguesa_SP", nacionalidade: "Brasil", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/planteis/new/90/29/14149029_guilherme_portuga_20250307153352.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_maceio", nome: "Maceió", idade: 24, geral: 66, clubeId: "c_portuguesa_SP", nacionalidade: "Brasil", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/43/775643_20230915160031_everton.jpg", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lohan", nome: "Lohan", idade: 28, geral: 67, clubeId: "c_portuguesa_SP", nacionalidade: "Brasil", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_cauari", nome: "Cauari", idade: 23, geral: 65, clubeId: "c_portuguesa_SP", nacionalidade: "Brasil", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/13/885113_20231202012509_cauari_1701480309.jpg", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_igortorres", nome: "Igor Torres", idade: 25, geral: 65, clubeId: "c_portuguesa_SP", nacionalidade: "Brasil", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_rildo", nome: "Rildo", idade: 25, geral: 67, clubeId: "c_portuguesa_SP", nacionalidade: "Brasil", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_renanpeixoto", nome: "Renan Peixoto", idade: 25, geral: 66, clubeId: "c_portuguesa_SP", nacionalidade: "Brasil", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    
    // LIGA URUGUAI
    // ================== PEÑAROL 2025 ==================

    { id: "j_campana", nome: "Guillermo De Amores", idade: 31, geral: 75, clubeId: "c_pen", nacionalidade: "Uruguai", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_coelho", nome: "Leo Coelho", idade: 32, geral: 74, clubeId: "c_pen", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_menosse", nome: "Maximiliano Menosse", idade: 33, geral: 74, clubeId: "c_pen", nacionalidade: "Uruguai", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_milans", nome: "Pedro Milans", idade: 23, geral: 73, clubeId: "c_pen", nacionalidade: "Uruguai", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_olivera", nome: "Brian Olivera", idade: 31, geral: 73, clubeId: "c_pen", nacionalidade: "Uruguai", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_sosa", nome: "Diego Sosa", idade: 27, geral: 73, clubeId: "c_pen", nacionalidade: "Uruguai", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_sequeira", nome: "Leonardo Sequeira", idade: 30, geral: 74, clubeId: "c_pen", nacionalidade: "Argentina", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_silvera", nome: "Maximiliano Silvera", idade: 28, geral: 75, clubeId: "c_pen", nacionalidade: "Uruguai", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_fernandez", nome: "Javier Cabrera", idade: 33, geral: 74, clubeId: "c_pen", nacionalidade: "Uruguai", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // ================== NACIONAL 2025 ==================

    { id: "j_mejia", nome: "Luis Mejia", idade: 34, geral: 76, clubeId: "c_nac", nacionalidade: "Panama", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_coates", nome: "Sebastian Coates", idade: 35, geral: 78, clubeId: "c_nac", nacionalidade: "Uruguai", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_polenta", nome: "Diego Polenta", idade: 33, geral: 75, clubeId: "c_nac", nacionalidade: "Uruguai", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_baez", nome: "Gabriel Baez", idade: 30, geral: 74, clubeId: "c_nac", nacionalidade: "Argentina", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_recoba", nome: "Jeremia Recoba", idade: 22, geral: 75, clubeId: "c_nac", nacionalidade: "Uruguai", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_oliva", nome: "Christian Oliva", idade: 29, geral: 76, clubeId: "c_nac", nacionalidade: "Uruguai", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pereyra", nome: "Mauricio Pereyra", idade: 35, geral: 75, clubeId: "c_nac", nacionalidade: "Uruguai", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vargas", nome: "Eduardo Vargas", idade: 36, geral: 77, clubeId: "c_nac", nacionalidade: "Chile", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_herazo", nome: "Diego Herazo", idade: 29, geral: 75, clubeId: "c_nac", nacionalidade: "Colombia", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lopez", nome: "Nicolas Lopez", idade: 32, geral: 77, clubeId: "c_nac", nacionalidade: "Uruguai", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // ================== PREMIER LEAGUE ==================
    // MANCHESTER CITY
    // ================== MANCHESTER CITY 2025/26 ==================

    { id: "j_donnaruma", nome: "Gigi Donnarumma", idade: 27, geral: 89, clubeId: "c_city", nacionalidade: "Italia", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/07/22/450722_gigi_donnarumma_20251203085322.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_trafford", nome: "James Trafford", idade: 23, geral: 81, clubeId: "c_city", nacionalidade: "Inglaterra", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/26/28/642628_james_trafford_20250819105157.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ruben_dias", nome: "Ruben Dias", idade: 28, geral: 87, clubeId: "c_city", nacionalidade: "Portugal", posicao:"Zagueiro", foto: "https://www.ogol.com.br/img/jogadores/new/52/70/155270_ruben_dias_20251114002107.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gvardiol", nome: "Josko Gvardiol", idade: 24, geral: 86, clubeId: "c_city", nacionalidade: "Croacia", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/01/12/540112_josko_gvardiol_20251207005429.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_akanji", nome: "Manuel Akanji", idade: 31, geral: 84, clubeId: "c_city", nacionalidade: "Suica", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/44/14/394414_manuel_akanji_20260208231025.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ake", nome: "Nathan Ake", idade: 31, geral: 84, clubeId: "c_city", nacionalidade: "Holanda", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lewis", nome: "Rico Lewis", idade: 21, geral: 82, clubeId: "c_city", nacionalidade: "Inglaterra", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/52/91/825291_rico_lewis_20250819105040.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_stones", nome: "John Stones", idade: 32, geral: 84, clubeId: "c_city", nacionalidade: "Inglaterra", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_rodri", nome: "Rodri", idade: 29, geral: 91, clubeId: "c_city", nacionalidade: "Espanha", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/13/48/331348_rodri__20251110125120.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_reijnders", nome: "Tijjani Reijnders", idade: 27, geral: 86, clubeId: "c_milan", nacionalidade: "Holanda", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/75/01/587501_tijjani_reijnders_20251203085137.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_silva", nome: "Bernardo Silva", idade: 31, geral: 87, clubeId: "c_city", nacionalidade: "Portugal", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/49/53/74953_bernardo_silva_20251114002903.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kovacic", nome: "Mateo Kovacic", idade: 32, geral: 83, clubeId: "c_city", nacionalidade: "Croacia", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_savinho", nome: "Savinho", idade: 21, geral: 84, clubeId: "c_city", nacionalidade: "Brasil", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_doku", nome: "Jeremy Doku", idade: 23, geral: 85, clubeId: "c_city", nacionalidade: "Belgica", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_haaland", nome: "Erling Haaland", idade: 25, geral: 92, clubeId: "c_city", nacionalidade: "Noruega", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/27/41/512741_erling_haaland_20251110124706.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_marmoush", nome: "Omar Marmoush", idade: 27, geral: 84, clubeId: "c_city", nacionalidade: "Egito", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/32/58/543258_omar_marmoush_20251103165530.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_cherki", nome: "Rayan Cherki", idade: 22, geral: 83, clubeId: "c_city", nacionalidade: "França", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/33/31/663331_rayan_cherki_20251105232403.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_foden", nome: "Phil Foden", idade: 25, geral: 87, clubeId: "c_city", nacionalidade: "Inglaterra", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/02/09/480209_phil_foden_20251110125327.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
        
    // ARSENAL
    { id: "j_raya", nome: "David Raya", idade: 29, geral: 86, clubeId: "c_ars", nacionalidade: "Espanha", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/76/92/397692_david_raya_20260511135256.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kepa", nome: "Kepa Arrizabalaga", idade: 31, geral: 81, clubeId: "c_ars", nacionalidade: "Espanha", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_timber", nome: "Jurrien Timber", idade: 24, geral: 85, clubeId: "c_ars", nacionalidade: "Holanda", posicao:"Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/07/62/670762_jurrien_timber_20251206122418.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_hincapie", nome: "Piero Hincapié", idade: 23, geral: 84, clubeId: "c_ars", nacionalidade: "Equador", posicao:"Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/00/20/610020_piero_hincapie_20260607171120.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_calafiori", nome: "Riccardo Calafiori", idade: 23, geral: 84, clubeId: "c_ars", nacionalidade: "Italia", posicao:"Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/33/89/663389_riccardo_calafiori_20260407160204.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lewis_skelly", nome: "Myles Lewis-Skelly", idade: 19, geral: 82, clubeId: "c_ars", nacionalidade: "Inglaterra", posicao:"Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ben_white", nome: "Ben White", idade: 28, geral: 84, clubeId: "c_ars", nacionalidade: "Inglaterra", posicao:"Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_saliba", nome: "William Saliba", idade: 24, geral: 88, clubeId: "c_ars", nacionalidade: "França", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/34/55/653455_william_saliba_20251030125249.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gabriel", nome: "Gabriel Magalhães", idade: 27, geral: 87, clubeId: "c_ars", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/98/52/499852_gabriel_magalhaes_20250928235227.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mosquera", nome: "Cristhian Mosquera", idade: 21, geral: 82, clubeId: "c_ars", nacionalidade: "Espanha", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_rice", nome: "Declan Rice", idade: 26, geral: 89, clubeId: "c_ars", nacionalidade: "Inglaterra", posicao:"Volante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/55/95/475595_declan_rice_20251101235709.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_zubimendi", nome: "Martin Zubimendi", idade: 26, geral: 86, clubeId: "c_ars", nacionalidade: "Espanha", posicao:"Volante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/37/43/563743_martin_zubimendi_20251030125329.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_norgaard", nome: "Christian Norgaard", idade: 31, geral: 81, clubeId: "c_ars", nacionalidade: "Dinamarca", posicao:"Volante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_odegaard", nome: "Martin Ødegaard", idade: 26, geral: 88, clubeId: "c_ars", nacionalidade: "Noruega", posicao:"Meia Ofensivo", foto: "https://cdn-img.staticzz.com/img/jogadores/new/42/06/404206_martin_odegaard_20250928235350.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_merino", nome: "Mikel Merino", idade: 29, geral: 84, clubeId: "c_ars", nacionalidade: "Espanha", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_dowman", nome: "Max Dowman", idade: 16, geral: 74, clubeId: "c_ars", nacionalidade: "Inglaterra", posicao:"Meia Ofensivo", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_saka", nome: "Bukayo Saka", idade: 24, geral: 89, clubeId: "c_ars", nacionalidade: "Inglaterra", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/11/46/641146_bukayo_saka_20251108232710.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_eze", nome: "Eberechi Eze", idade: 27, geral: 85, clubeId: "c_ars", nacionalidade: "Inglaterra", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/68/92/546892_eberechi_eze_20251027105428.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_trossard", nome: "Leandro Trossard", idade: 31, geral: 83, clubeId: "c_ars", nacionalidade: "Belgica", posicao:"Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_martinelli", nome: "Gabriel Martinelli", idade: 24, geral: 86, clubeId: "c_ars", nacionalidade: "Brasil", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/96/81/619681_gabriel_martinelli_20251030125918.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_madueke", nome: "Noni Madueke", idade: 23, geral: 83, clubeId: "c_ars", nacionalidade: "Inglaterra", posicao:"Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_havertz", nome: "Kai Havertz", idade: 27, geral: 84, clubeId: "c_ars", nacionalidade: "Alemanha", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gyokeres", nome: "Viktor Gyokeres", idade: 27, geral: 88, clubeId: "c_ars", nacionalidade: "Suecia", posicao:"Atacante", foto: "https://www.ogol.com.br/img/jogadores/new/39/56/473956_viktor_gyokeres_20250914091654.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gabriel_jesus", nome: "Gabriel Jesus", idade: 29, geral: 82, clubeId: "c_ars", nacionalidade: "Brasil", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_nwaneri", nome: "Ethan Nwaneri", idade: 18, geral: 81, clubeId: "c_ars", nacionalidade: "Inglaterra", posicao:"Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

   // LIVERPOOL
    { id: "j_alisson", nome: "Alisson Becker", idade: 33, geral: 89, clubeId: "c_liv", nacionalidade: "Brasil", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/56/14/95614_alisson_becker_20250815201322.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mamardashvili", nome: "Giorgi Mamardashvili", idade: 25, geral: 85, clubeId: "c_liv", nacionalidade: "Georgia", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/30/00/533000_giorgi_mamardashvili_20250805115131.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_woodman", nome: "Freddie Woodman", idade: 29, geral: 76, clubeId: "c_liv", nacionalidade: "Inglaterra", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_frimpong", nome: "Jeremie Frimpong", idade: 25, geral: 85, clubeId: "c_liv", nacionalidade: "Holanda", posicao:"Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/64/47/536447_jeremie_frimpong_20250805120221.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kerkez", nome: "Milos Kerkez", idade: 22, geral: 84, clubeId: "c_liv", nacionalidade: "Hungria", posicao:"Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/56/07/815607_milos_kerkez_20251026001314.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bradley", nome: "Conor Bradley", idade: 23, geral: 81, clubeId: "c_liv", nacionalidade: "Irlanda do Norte", posicao:"Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vandijk", nome: "Virgil van Dijk", idade: 34, geral: 90, clubeId: "c_liv", nacionalidade: "Holanda", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/45/93/194593_virgil_van_dijk_20251022235737.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_konate", nome: "Ibrahima Konate", idade: 27, geral: 87, clubeId: "c_liv", nacionalidade: "França", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/18/34/511834_ibrahima_konate_20250805115744.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_Joegomez", nome: "Joe Gomez", idade: 29, geral: 82, clubeId: "c_liv", nacionalidade: "Inglaterra", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/29/86/302986_joe_gomez_20250805120518.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gravenberch", nome: "Ryan Gravenberch", idade: 24, geral: 87, clubeId: "c_liv", nacionalidade: "Holanda", posicao:"Volante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/66/31/596631_ryan_gravenberch_20251102003135.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_macallister", nome: "Alexis Mac Allister", idade: 27, geral: 88, clubeId: "c_liv", nacionalidade: "Argentina", posicao:"Volante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/21/44/542144_alexis_mac_allister_20251126201956.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_endo", nome: "Wataru Endo", idade: 33, geral: 81, clubeId: "c_liv", nacionalidade: "Japao", posicao:"Volante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_szoboszlai", nome: "Dominik Szoboszlai", idade: 26, geral: 87, clubeId: "c_liv", nacionalidade: "Hungria", posicao:"Meia Ofensivo", foto: "https://cdn-img.staticzz.com/img/jogadores/new/05/43/540543_dominik_szoboszlai_20251022235907.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_wirtz", nome: "Florian Wirtz", idade: 23, geral: 90, clubeId: "c_liv", nacionalidade: "Alemanha", posicao:"Meia Ofensivo", foto: "https://cdn-img.staticzz.com/img/jogadores/new/25/25/782525_florian_wirtz_20260114143456.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_curtis", nome: "Curtis Jones", idade: 24, geral: 83, clubeId: "c_liv", nacionalidade: "Inglaterra", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/36/89/543689_curtis_jones_20251204164235.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_salah", nome: "Mohamed Salah", idade: 34, geral: 89, clubeId: "c_liv", nacionalidade: "Egito", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/75/88/207588_mohamed_salah_20260114143557.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gakpo", nome: "Cody Gakpo", idade: 27, geral: 86, clubeId: "c_liv", nacionalidade: "Holanda", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/85/87/528587_cody_gakpo_20251022235835.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_chiesa", nome: "Federico Chiesa", idade: 28, geral: 83, clubeId: "c_liv", nacionalidade: "Italia", posicao:"Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ngumoha", nome: "Rio Ngumoha", idade: 17, geral: 75, clubeId: "c_liv", nacionalidade: "Inglaterra", posicao:"Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ekitike", nome: "Hugo Ekitike", idade: 24, geral: 86, clubeId: "c_liv", nacionalidade: "França", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/00/07/820007_hugo_ekitike_20250920114821.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_isak", nome: "Alexander Isak", idade: 26, geral: 89, clubeId: "c_liv", nacionalidade: "Suecia", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    
    // CHELSEA
    { id: "j_sanchez", nome: "Robert Sánchez", idade: 28, geral: 82, clubeId: "c_chel", nacionalidade: "Espanha", posicao: "Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_jorgensen", nome: "Filip Jorgensen", idade: 23, geral: 78, clubeId: "c_chel", nacionalidade: "Dinamarca", posicao: "Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_james", nome: "Reece James", idade: 25, geral: 84, clubeId: "c_chel", nacionalidade: "Inglaterra", posicao: "Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_cucurella", nome: "Marc Cucurella", idade: 27, geral: 83, clubeId: "c_chel", nacionalidade: "Espanha", posicao: "Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gusto", nome: "Malo Gusto", idade: 22, geral: 81, clubeId: "c_chel", nacionalidade: "França", posicao: "Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_hato", nome: "Jorrel Hato", idade: 19, geral: 81, clubeId: "c_chel", nacionalidade: "Holanda", posicao: "Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_chalobah", nome: "Trevoh Chalobah", idade: 26, geral: 81, clubeId: "c_chel", nacionalidade: "Inglaterra", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_wesleyfofana", nome: "Wesley Fofana", idade: 25, geral: 83, clubeId: "c_chel", nacionalidade: "França", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_tosin", nome: "Tosin Adarabioyo", idade: 28, geral: 80, clubeId: "c_chel", nacionalidade: "Inglaterra", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_colwill", nome: "Levi Colwill", idade: 23, geral: 83, clubeId: "c_chel", nacionalidade: "Inglaterra", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_badiashile", nome: "Benoit Badiashile", idade: 25, geral: 79, clubeId: "c_chel", nacionalidade: "França", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_acheampong", nome: "Josh Acheampong", idade: 19, geral: 75, clubeId: "c_chel", nacionalidade: "Inglaterra", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_caicedo", nome: "Moisés Caicedo", idade: 24, geral: 85, clubeId: "c_chel", nacionalidade: "Equador", posicao: "Volante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lavia", nome: "Roméo Lavia", idade: 22, geral: 80, clubeId: "c_chel", nacionalidade: "Bélgica", posicao: "Volante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_essugo", nome: "Dário Essugo", idade: 20, geral: 77, clubeId: "c_chel", nacionalidade: "Portugal", posicao: "Volante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_enzo", nome: "Enzo Fernández", idade: 24, geral: 86, clubeId: "c_chel", nacionalidade: "Argentina", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_andrey", nome: "Andrey Santos", idade: 22, geral: 82, clubeId: "c_chel", nacionalidade: "Brasil", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_palmer", nome: "Cole Palmer", idade: 24, geral: 87, clubeId: "c_chel", nacionalidade: "Inglaterra", posicao: "Meia Ofensivo", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_buonanotte", nome: "Facundo Buonanotte", idade: 21, geral: 78, clubeId: "c_chel", nacionalidade: "Argentina", posicao: "Meia Ofensivo", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_nkunku", nome: "Christopher Nkunku", idade: 27, geral: 84, clubeId: "c_chel", nacionalidade: "França", posicao: "Meia Ofensivo", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pedro_neto", nome: "Pedro Neto", idade: 26, geral: 84, clubeId: "c_chel", nacionalidade: "Portugal", posicao: "Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/64/69/296469_pedro_neto_20251108234534.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_garnacho", nome: "Alejandro Garnacho", idade: 21, geral: 84, clubeId: "c_chel", nacionalidade: "Argentina", posicao: "Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_estevao", nome: "Estêvão", idade: 19, geral: 83, clubeId: "c_chel", nacionalidade: "Brasil", posicao: "Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gittens", nome: "Jamie Bynoe-Gittens", idade: 21, geral: 82, clubeId: "c_chel", nacionalidade: "Inglaterra", posicao: "Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_tyrique", nome: "Tyrique George", idade: 19, geral: 75, clubeId: "c_chel", nacionalidade: "Inglaterra", posicao: "Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_joao_pedro", nome: "João Pedro", idade: 24, geral: 85, clubeId: "c_chel", nacionalidade: "Brasil", posicao: "Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_delap", nome: "Liam Delap", idade: 23, geral: 81, clubeId: "c_chel", nacionalidade: "Inglaterra", posicao: "Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_jackson", nome: "Nicolas Jackson", idade: 24, geral: 81, clubeId: "c_chel", nacionalidade: "Senegal", posicao: "Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_guiu", nome: "Marc Guiu", idade: 20, geral: 76, clubeId: "c_chel", nacionalidade: "Espanha", posicao: "Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
// ================== MANCHESTER UNITED 2025/26 ==================

    { id: "j_lammens", nome: "Senne Lammens", idade: 23, geral: 83, clubeId: "c_mun", nacionalidade: "Belgica", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/28/91/662891_senne_lammens_20251025171828.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bayindir", nome: "Altay Bayindir", idade: 28, geral: 78, clubeId: "c_mun", nacionalidade: "Turquia", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/planteis/new/09/35/11530935_altay_bayindir_20240814235400.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_heaton", nome: "Tom Heaton", idade: 40, geral: 73, clubeId: "c_mun", nacionalidade: "Inglaterra", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/96/87/29687_tom_heaton_20250805193347.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lisandromartinez", nome: "Lisandro Martinez", idade: 28, geral: 85, clubeId: "c_mun", nacionalidade: "Argentina", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/planteis/new/17/20/11531720_lisandro_martinez_20240815220407.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_de_ligt", nome: "Matthijs de Ligt", idade: 27, geral: 85, clubeId: "c_mun", nacionalidade: "Holanda", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/95/74/459574_matthijs_de_ligt_20251025172721.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_yoro", nome: "Leny Yoro", idade: 20, geral: 83, clubeId: "c_mun", nacionalidade: "França", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/62/08/896208_leny_yoro_20251025172645.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_maguire", nome: "Harry Maguire", idade: 33, geral: 81, clubeId: "c_mun", nacionalidade: "Inglaterra", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/83/04/188304_harry_maguire_20260320101452.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_dalot", nome: "Diogo Dalot", idade: 27, geral: 83, clubeId: "c_mun", nacionalidade: "Portugal", posicao:"Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/44/16/284416_diogo_dalot_20251025172609.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_shaw", nome: "Luke Shaw", idade: 31, geral: 81, clubeId: "c_mun", nacionalidade: "Inglaterra", posicao:"Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/84/97/218497_luke_shaw_20251025172842.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mazraoui", nome: "Noussair Mazraoui", idade: 28, geral: 82, clubeId: "c_mun", nacionalidade: "Marrocos", posicao:"Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/18/78/481878_noussair_mazraoui_20260114155035.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ugarte", nome: "Manuel Ugarte", idade: 25, geral: 84, clubeId: "c_mun", nacionalidade: "Uruguai", posicao:"Volante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/40/14/544014_manuel_ugarte_20260427223146.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mainoo", nome: "Kobbie Mainoo", idade: 19, geral: 79, clubeId: "c_mun", nacionalidade: "Inglaterra", posicao:"Volante", foto: "https://www.ogol.com.br/img/jogadores/new/82/17/828217_kobbie_mainoo_20260320101420.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bruno", nome: "Bruno Fernandes", idade: 29, geral: 89, clubeId: "c_mun", nacionalidade: "Portugal", posicao:"Meia Ofensivo", foto: "https://cdn-img.staticzz.com/img/planteis/new/83/95/11528395_bruno_fernandes_20240814235721.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mount", nome: "Mason Mount", idade: 27, geral: 81, clubeId: "c_united", nacionalidade: "Inglaterra", posicao:"Meia Ofensivo", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_casemiro", nome: "Casemiro", idade: 34, geral: 82, clubeId: "c_mun", nacionalidade: "Brasil", posicao:"Volante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/56/21/95621_casemiro_20250920212010.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mbeumo", nome: "Bryan Mbeumo", idade: 26, geral: 84, clubeId: "c_mun", nacionalidade: "Camarões", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/77/35/627735_bryan_mbeumo_20251025173113.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_amad", nome: "Amad Diallo", idade: 24, geral: 83, clubeId: "c_mun", nacionalidade: "Costa do Marfim", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/84/64/728464_amad_diallo_20251025173038.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_matheus_cunha", nome: "Matheus Cunha", idade: 23, geral: 83, clubeId: "c_mun", nacionalidade: "Brasil", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/96/37/549637_matheus_cunha_20251025173306.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_zirkzee", nome: "Joshua Zirkzee", idade: 25, geral: 82, clubeId: "c_mun", nacionalidade: "Holanda", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/planteis/new/55/01/11565501_joshua_zirkzee_20240816194559.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_sesko", nome: "Benjamin Sesko", idade: 22, geral: 83, clubeId: "c_mun", nacionalidade: "Eslovênia", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/15/97/721597_benjamin_sesko_20251025173215.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    // TOTTENHAM
    
    { id: "j_maddison", nome: "James Maddison", idade: 27, geral: 84, clubeId: "c_tot", nacionalidade: "Inglaterra", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_romero_tot", nome: "Cuti Romero", idade: 26, geral: 85, clubeId: "c_tot", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_porro", nome: "Pedro Porro", idade: 24, geral: 82, clubeId: "c_tot", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vicario", nome: "Guglielmo Vicario", idade: 27, geral: 83, clubeId: "c_tot", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kulusevski", nome: "D. Kulusevski", idade: 24, geral: 82, clubeId: "c_tot", nacionalidade: "Suécia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_simons", nome: "Xavi Simons", idade: 21, geral: 84, clubeId: "c_tot", nacionalidade: "Holanda", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_robertson", nome: "Andy Robertson", idade: 32, geral: 83, clubeId: "c_tot", nacionalidade: "Escocia", posicao:"Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/84/34/298434_andy_robertson_20251126202228.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    
     // NEWCASTLE
    { id: "j_isak", nome: "Alexander Isak", idade: 24, geral: 85, clubeId: "c_new", nacionalidade: "Suécia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bruno_g", nome: "Bruno Guimarães", idade: 26, geral: 85, clubeId: "c_new", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gordon", nome: "Anthony Gordon", idade: 23, geral: 82, clubeId: "c_new", nacionalidade: "Inglaterra", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pope", nome: "Nick Pope", idade: 32, geral: 83, clubeId: "c_new", nacionalidade: "Inglaterra", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_botman", nome: "Sven Botman", idade: 24, geral: 83, clubeId: "c_new", nacionalidade: "Holanda", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_joelinton", nome: "Joelinton", idade: 28, geral: 82, clubeId: "c_new", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // ASTON VILLA
    { id: "j_watkins", nome: "Ollie Watkins", idade: 28, geral: 85, clubeId: "c_ast", nacionalidade: "Inglaterra", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_emimartinez", nome: "Dibu Martínez", idade: 31, geral: 87, clubeId: "c_ast", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mcginn", nome: "John McGinn", idade: 29, geral: 82, clubeId: "c_ast", nacionalidade: "Escócia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bailey", nome: "Leon Bailey", idade: 26, geral: 81, clubeId: "c_ast", nacionalidade: "Jamaica", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pautorres", nome: "Pau Torres", idade: 27, geral: 83, clubeId: "c_ast", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_tielemans", nome: "Youri Tielemans", idade: 27, geral: 81, clubeId: "c_ast", nacionalidade: "Bélgica", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // WEST HAM
    { id: "j_bowen", nome: "Jarrod Bowen", idade: 27, geral: 83, clubeId: "c_whu", nacionalidade: "Inglaterra", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_paqueta", nome: "Lucas Paquetá", idade: 26, geral: 83, clubeId: "c_whu", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kudus", nome: "Mohammed Kudus", idade: 23, geral: 82, clubeId: "c_whu", nacionalidade: "Gana", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_alvarez", nome: "Edson Álvarez", idade: 26, geral: 81, clubeId: "c_whu", nacionalidade: "México", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_areola", nome: "Alphonse Areola", idade: 31, geral: 81, clubeId: "c_whu", nacionalidade: "França", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_emerson", nome: "Emerson", idade: 29, geral: 79, clubeId: "c_whu", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // BRIGHTON
    { id: "j_mitoma", nome: "Kaoru Mitoma", idade: 27, geral: 82, clubeId: "c_bri", nacionalidade: "Japão", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_jpedro", nome: "João Pedro", idade: 22, geral: 79, clubeId: "c_bri", nacionalidade: "Brasil", foto: "https://www.ogol.com.br/img/jogadores/new/32/56/663256_joao_pedro_20250922180953.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_dunk", nome: "Lewis Dunk", idade: 32, geral: 81, clubeId: "c_bri", nacionalidade: "Inglaterra", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_welbeck", nome: "Danny Welbeck", idade: 33, geral: 77, clubeId: "c_bri", nacionalidade: "Inglaterra", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_baleba", nome: "Carlos Baleba", idade: 20, geral: 76, clubeId: "c_bri", nacionalidade: "Camarões", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_verbruggen", nome: "B. Verbruggen", idade: 21, geral: 78, clubeId: "c_bri", nacionalidade: "Holanda", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // EVERTON
    { id: "j_pickford", nome: "Jordan Pickford", idade: 30, geral: 83, clubeId: "c_eve", nacionalidade: "Inglaterra", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_tarkowski", nome: "J. Tarkowski", idade: 31, geral: 80, clubeId: "c_eve", nacionalidade: "Inglaterra", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_branthwaite", nome: "J. Branthwaite", idade: 22, geral: 80, clubeId: "c_eve", nacionalidade: "Inglaterra", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mcneil", nome: "Dwight McNeil", idade: 24, geral: 78, clubeId: "c_eve", nacionalidade: "Inglaterra", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_calvert", nome: "Calvert-Lewin", idade: 27, geral: 78, clubeId: "c_eve", nacionalidade: "Inglaterra", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_doucoure", nome: "A. Doucouré", idade: 31, geral: 79, clubeId: "c_eve", nacionalidade: "Mali", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // CRYSTAL PALACE
    { id: "j_mateta", nome: "Jean-Philippe Mateta", idade: 27, geral: 79, clubeId: "c_cry", nacionalidade: "França", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_guehi", nome: "Marc Guéhi", idade: 24, geral: 81, clubeId: "c_cry", nacionalidade: "Inglaterra", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_wharton", nome: "Adam Wharton", idade: 20, geral: 77, clubeId: "c_cry", nacionalidade: "Inglaterra", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_munoz", nome: "Daniel Muñoz", idade: 28, geral: 78, clubeId: "c_cry", nacionalidade: "Colômbia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_henderson", nome: "Dean Henderson", idade: 27, geral: 78, clubeId: "c_cry", nacionalidade: "Inglaterra", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    
    // BRENTFORD
    { id: "j_kelleher", nome: "Caoimhin Kelleher", idade: 27, geral: 81, clubeId: "c_bre", nacionalidade: "Irlanda", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_valdimarsson", nome: "Hákon Valdimarsson", idade: 24, geral: 76, clubeId: "c_bre", nacionalidade: "Islândia", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kayode", nome: "Michael Kayode", idade: 21, geral: 79, clubeId: "c_bre", nacionalidade: "Itália", posicao:"Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/78/67/837867_michael_kayode_20260126183753.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_rico_henry", nome: "Rico Henry", idade: 29, geral: 79, clubeId: "c_bre", nacionalidade: "Inglaterra", posicao:"Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_hickey", nome: "Aaron Hickey", idade: 24, geral: 79, clubeId: "c_bre", nacionalidade: "Escócia", posicao:"Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_collins", nome: "Nathan Collins", idade: 24, geral: 82, clubeId: "c_bre", nacionalidade: "Irlanda", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vandenberg", nome: "Sepp van den Berg", idade: 24, geral: 80, clubeId: "c_bre", nacionalidade: "Holanda", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ajer", nome: "Kristoffer Ajer", idade: 27, geral: 79, clubeId: "c_bre", nacionalidade: "Noruega", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pinnock", nome: "Ethan Pinnock", idade: 32, geral: 78, clubeId: "c_bre", nacionalidade: "Jamaica", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_yarmoliuk", nome: "Yehor Yarmoliuk", idade: 21, geral: 78, clubeId: "c_bre", nacionalidade: "Ucrânia", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_jensen", nome: "Mathias Jensen", idade: 30, geral: 80, clubeId: "c_bre", nacionalidade: "Dinamarca", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_henderson", nome: "Jordan Henderson", idade: 36, geral: 78, clubeId: "c_bre", nacionalidade: "Inglaterra", posicao:"Volante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_janelt", nome: "Vitaly Janelt", idade: 27, geral: 79, clubeId: "c_bre", nacionalidade: "Alemanha", posicao:"Volante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_damsgaard", nome: "Mikkel Damsgaard", idade: 25, geral: 81, clubeId: "c_bre", nacionalidade: "Dinamarca", posicao:"Meia Ofensivo", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_schade", nome: "Kevin Schade", idade: 24, geral: 80, clubeId: "c_bre", nacionalidade: "Alemanha", posicao:"Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ouattara", nome: "Dango Ouattara", idade: 24, geral: 81, clubeId: "c_bre", nacionalidade: "Burkina Faso", posicao:"Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lewis_potter", nome: "Keane Lewis-Potter", idade: 24, geral: 79, clubeId: "c_bre", nacionalidade: "Inglaterra", posicao:"Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_fabio_carvalho", nome: "Fábio Carvalho", idade: 23, geral: 78, clubeId: "c_bre", nacionalidade: "Portugal", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/36/26/643626_fabio_carvalho_20250818121934.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_igor_thiago", nome: "Igor Thiago", idade: 24, geral: 82, clubeId: "c_bre", nacionalidade: "Brasil", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/62/16/656216_igor_thiago_20251026001039.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
        
    
    // ==========================================
    // ESPANHA - JOGADORES (Completando elencos)
    // Real Madrid
    { id: "j_courtois", nome: "Thibaut Courtois", idade: 32, geral: 89, clubeId: "c_rm", nacionalidade: "Bélgica", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/56/28/95628_thibaut_courtois_20260217194143.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lunin", nome: "Andriy Lunin", idade: 27, geral: 82, clubeId: "c_rm", nacionalidade: "Ucrânia", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_rudiger", nome: "Antonio Rüdiger", idade: 32, geral: 87, clubeId: "c_rm", nacionalidade: "Alemanha", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_huijsen", nome: "Dean Huijsen", idade: 21, geral: 84, clubeId: "c_rm", nacionalidade: "Espanha", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_asencio", nome: "Raúl Asencio", idade: 22, geral: 80, clubeId: "c_rm", nacionalidade: "Espanha", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_militao", nome: "Éder Militão", idade: 28, geral: 85, clubeId: "c_rm", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_carreras", nome: "Álvaro Carreras", idade: 22, geral: 82, clubeId: "c_rm", nacionalidade: "Espanha", posicao:"Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_trent", nome: "Trent Alexander-Arnold", idade: 27, geral: 86, clubeId: "c_rm", nacionalidade: "Inglaterra", posicao:"Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_fran", nome: "Fran García", idade: 26, geral: 80, clubeId: "c_rm", nacionalidade: "Espanha", posicao:"Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_carvajal", nome: "Dani Carvajal", idade: 34, geral: 83, clubeId: "c_rm", nacionalidade: "Espanha", posicao:"Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_tchouameni", nome: "Aurélien Tchouaméni", idade: 26, geral: 86, clubeId: "c_rm", nacionalidade: "França", posicao:"Volante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_camavinga", nome: "Eduardo Camavinga", idade: 23, geral: 85, clubeId: "c_rm", nacionalidade: "França", posicao:"Volante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_valverde", nome: "Fede Valverde", idade: 27, geral: 89, clubeId: "c_rm", nacionalidade: "Uruguai", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bellingham", nome: "Jude Bellingham", idade: 22, geral: 88, clubeId: "c_rm", nacionalidade: "Inglaterra", posicao:"Meia Ofensivo", foto: "https://cdn-img.staticzz.com/img/jogadores/new/75/32/737532_jude_bellingham_20250618231333.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_arda", nome: "Arda Güler", idade: 21, geral: 85, clubeId: "c_rm", nacionalidade: "Turquia", posicao:"Meia Ofensivo", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_brahim", nome: "Brahim Díaz", idade: 27, geral: 84, clubeId: "c_rm", nacionalidade: "Marrocos", posicao:"Meia Ofensivo", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vini", nome: "Vini Junior", idade: 25, geral: 91, clubeId: "c_rm", nacionalidade: "Brasil", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/77/37/547737_vinicius_junior_20250923225603.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_rodrygo", nome: "Rodrygo", idade: 25, geral: 87, clubeId: "c_rm", nacionalidade: "Brasil", posicao:"Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mastantuono", nome: "Franco Mastantuono", idade: 19, geral: 84, clubeId: "c_rm", nacionalidade: "Argentina", posicao:"Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mbappe", nome: "Kylian Mbappé", idade: 27, geral: 92, clubeId: "c_rm", nacionalidade: "França", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/45/08/394508_kylian_mbappe_20260217195145.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_endrick", nome: "Endrick", idade: 19, geral: 82, clubeId: "c_rm", nacionalidade: "Brasil", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/93/33/829333_endrick_20260313120646.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gonzalo", nome: "Gonzalo García", idade: 21, geral: 79, clubeId: "c_rm", nacionalidade: "Espanha", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    //Barcelona
    { id: "j_joangarcia", nome: "Joan Garcia", idade: 25, geral: 86, clubeId: "c_bar", nacionalidade: "Espanha", posicao: "Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/14/37/641437_joan_garcia_20251206235801.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_araujo", nome: "Ronald Araújo", idade: 27, geral: 86, clubeId: "c_bar", nacionalidade: "Uruguai", posicao: "Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/17/42/591742_ronald_araujo_20251019000808.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kounde", nome: "Jules Koundé", idade: 27, geral: 85, clubeId: "c_bar", nacionalidade: "França", posicao: "Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_cubarsi", nome: "Pau Cubarsí", idade: 19, geral: 82, clubeId: "c_bar", nacionalidade: "Espanha", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_balde", nome: "Alejandro Balde", idade: 22, geral: 83, clubeId: "c_bar", nacionalidade: "Espanha", posicao: "Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_cancelo", nome: "João Cancelo", idade: 32, geral: 85, clubeId: "c_bar", nacionalidade: "Portugal", posicao: "Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/49/41/74941_joao_cancelo_20260518171903.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_christensen", nome: "A. Christensen", idade: 30, geral: 82, clubeId: "c_bar", nacionalidade: "Dinamarca", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_eric", nome: "Eric Garcia", idade: 25, geral: 81, clubeId: "c_bar", nacionalidade: "Espanha", posicao: "Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/43/88/564388_eric_garcia_20260528150356.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pedri", nome: "Pedri", idade: 23, geral: 87, clubeId: "c_bar", nacionalidade: "Espanha", posicao: "Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/96/13/739613_pedri_gonzalez_20251019000639.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_dejong", nome: "Frenkie de Jong", idade: 29, geral: 86, clubeId: "c_bar", nacionalidade: "Holanda", posicao: "Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/04/65/460465_frenkie_de_jong_20250817021001.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gavi", nome: "Gavi", idade: 21, geral: 84, clubeId: "c_bar", nacionalidade: "Espanha", posicao: "Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/48/18/844818_pablo_gavi_20260528151500.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_olmo", nome: "Dani Olmo", idade: 28, geral: 84, clubeId: "c_bar", nacionalidade: "Espanha", posicao: "Meia Ofensivo", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_fermin", nome: "Fermín López", idade: 23, geral: 80, clubeId: "c_bar", nacionalidade: "Espanha", posicao: "Meia Ofensivo", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lewandowski", nome: "R. Lewandowski", idade: 37, geral: 84, clubeId: "c_bar", nacionalidade: "Polônia", posicao: "Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/10/23/71023_robert_lewandowski_20250929145802.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_yamal", nome: "Lamine Yamal", idade: 18, geral: 87, clubeId: "c_bar", nacionalidade: "Espanha", posicao: "Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/32/43/1013243_lamine_yamal_20251105231717.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_raphinha", nome: "Raphinha", idade: 29, geral: 86, clubeId: "c_bar", nacionalidade: "Brasil", posicao: "Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/10/13/491013_raphinha_20251203082154.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ferran", nome: "Ferran Torres", idade: 26, geral: 82, clubeId: "c_bar", nacionalidade: "Espanha", posicao: "Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },


    // Atl. Madrid
    { id: "j_oblak", nome: "Jan Oblak", idade: 33, geral: 87, clubeId: "c_atm", nacionalidade: "Eslovênia", posicao: "Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/24/60/112460_jan_oblak_20250304234151.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_musso", nome: "Juan Musso", idade: 32, geral: 82, clubeId: "c_atm", nacionalidade: "Argentina", posicao: "Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/58/15/285815_juan_musso_20260414194027.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pubill", nome: "Marc Pubill", idade: 22, geral: 80, clubeId: "c_atm", nacionalidade: "Espanha", posicao: "Lateral-Direito", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_molina", nome: "Nahuel Molina", idade: 28, geral: 83, clubeId: "c_atm", nacionalidade: "Argentina", posicao: "Lateral-Direito", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ruggeri", nome: "Matteo Ruggeri", idade: 23, geral: 82, clubeId: "c_atm", nacionalidade: "Itália", posicao: "Lateral-Esquerdo", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_hancko", nome: "David Hancko", idade: 28, geral: 85, clubeId: "c_atm", nacionalidade: "Eslováquia", posicao: "Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/59/51/485951_david_hancko_20250218170827.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lenlget", nome: "Clément Lenglet", idade: 31, geral: 81, clubeId: "c_atm", nacionalidade: "França", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lenormand", nome: "Robin Le Normand", idade: 29, geral: 85, clubeId: "c_atm", nacionalidade: "Espanha", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_josegimenez", nome: "José Giménez", idade: 30, geral: 84, clubeId: "c_atm", nacionalidade: "Uruguai", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_koke", nome: "Koke", idade: 34, geral: 83, clubeId: "c_atm", nacionalidade: "Espanha", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_llorente", nome: "Marcos Llorente", idade: 31, geral: 85, clubeId: "c_atm", nacionalidade: "Espanha", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_barrios", nome: "Pablo Barrios", idade: 22, geral: 83, clubeId: "c_atm", nacionalidade: "Espanha", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_baena", nome: "Álex Baena", idade: 24, geral: 85, clubeId: "c_atm", nacionalidade: "Espanha", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_cardoso", nome: "Johnny Cardoso", idade: 24, geral: 83, clubeId: "c_atm", nacionalidade: "Estados Unidos", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_almada", nome: "Thiago Almada", idade: 25, geral: 84, clubeId: "c_atm", nacionalidade: "Argentina", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_giuliano", nome: "Giuliano Simeone", idade: 23, geral: 82, clubeId: "c_atm", nacionalidade: "Argentina", posicao: "Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_griezmann", nome: "Antoine Griezmann", idade: 35, geral: 84, clubeId: "c_atm", nacionalidade: "França", posicao: "Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/50/90/115090_antoine_griezmann_20250929150558.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lookman", nome: "Ademola Lookman", idade: 28, geral: 84, clubeId: "c_atm", nacionalidade: "Nigéria", posicao: "Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/79/35/487935_ademola_lookman_20260108172312.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_alvarez", nome: "Julián Álvarez", idade: 26, geral: 86, clubeId: "c_atm", nacionalidade: "Argentina", posicao: "Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/57/80/675780_julian_alvarez_20260414194753.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_sorloth", nome: "Alexander Sørloth", idade: 30, geral: 83, clubeId: "c_atm", nacionalidade: "Noruega", posicao: "Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/09/03/360903_alexander_sorloth_20251027223422.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
        
    // Sevilla
    { id: "j_navas", nome: "Jesús Navas", idade: 38, geral: 79, clubeId: "c_sev", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ramos", nome: "Sergio Ramos", idade: 38, geral: 81, clubeId: "c_sev", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ocampos", nome: "Lucas Ocampos", idade: 30, geral: 81, clubeId: "c_sev", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_rakitic", nome: "Ivan Rakitic", idade: 36, geral: 80, clubeId: "c_sev", nacionalidade: "Croácia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ennesyri", nome: "Y. En-Nesyri", idade: 27, geral: 81, clubeId: "c_sev", nacionalidade: "Marrocos", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_suso", nome: "Suso", idade: 30, geral: 79, clubeId: "c_sev", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // Betis, R. Sociedad, Athletic, Valencia, Villarreal, Celta, Osasuna, Girona (Agrupados para espaço)
    { id: "j_fekir", nome: "Nabil Fekir", idade: 31, geral: 83, clubeId: "c_bet", nacionalidade: "França", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_isco", nome: "Isco", idade: 32, geral: 82, clubeId: "c_bet", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pezzella", nome: "G. Pezzella", idade: 33, geral: 80, clubeId: "c_bet", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_carvalho_bet", nome: "W. Carvalho", idade: 32, geral: 79, clubeId: "c_bet", nacionalidade: "Portugal", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_iglesias", nome: "Borja Iglesias", idade: 31, geral: 79, clubeId: "c_bet", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bellerin", nome: "H. Bellerín", idade: 29, geral: 78, clubeId: "c_bet", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_kubo", nome: "Takefusa Kubo", idade: 23, geral: 82, clubeId: "c_rso", nacionalidade: "Japão", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_oyarzabal", nome: "M. Oyarzabal", idade: 27, geral: 83, clubeId: "c_rso", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_merino", nome: "Mikel Merino", idade: 28, geral: 83, clubeId: "c_rso", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_zubimendi", nome: "M. Zubimendi", idade: 25, geral: 82, clubeId: "c_rso", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_remiro", nome: "Álex Remiro", idade: 29, geral: 82, clubeId: "c_rso", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lenormand", nome: "R. Le Normand", idade: 27, geral: 81, clubeId: "c_rso", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_iwilliams", nome: "Iñaki Williams", idade: 30, geral: 81, clubeId: "c_ath", nacionalidade: "Gana", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_nwilliams", nome: "Nico Williams", idade: 22, geral: 81, clubeId: "c_ath", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_simon", nome: "Unai Simón", idade: 27, geral: 83, clubeId: "c_ath", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_sancet", nome: "Oihan Sancet", idade: 24, geral: 80, clubeId: "c_ath", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_muniain", nome: "Iker Muniain", idade: 31, geral: 79, clubeId: "c_ath", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vivian", nome: "Dani Vivian", idade: 25, geral: 79, clubeId: "c_ath", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_gaya", nome: "José Gayà", idade: 29, geral: 81, clubeId: "c_val", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mamardashvili", nome: "Mamardashvili", idade: 23, geral: 82, clubeId: "c_val", nacionalidade: "Geórgia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pepelu", nome: "Pepelu", idade: 25, geral: 79, clubeId: "c_val", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_duro", nome: "Hugo Duro", idade: 24, geral: 78, clubeId: "c_val", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_almeida", nome: "André Almeida", idade: 24, geral: 78, clubeId: "c_val", nacionalidade: "Portugal", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_diakhaby", nome: "M. Diakhaby", idade: 27, geral: 77, clubeId: "c_val", nacionalidade: "Guiné", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_gmoreno", nome: "Gerard Moreno", idade: 32, geral: 83, clubeId: "c_vil", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_parejo", nome: "Dani Parejo", idade: 35, geral: 82, clubeId: "c_vil", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_baena", nome: "Álex Baena", idade: 23, geral: 80, clubeId: "c_vil", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_sorloth", nome: "A. Sørloth", idade: 28, geral: 80, clubeId: "c_vil", nacionalidade: "Noruega", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_foyth", nome: "Juan Foyth", idade: 26, geral: 79, clubeId: "c_vil", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pino", nome: "Yéremy Pino", idade: 21, geral: 79, clubeId: "c_vil", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_aspas", nome: "Iago Aspas", idade: 36, geral: 81, clubeId: "c_cel", nacionalidade: "Espanha", posicao:"Atacante",foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bamba", nome: "J. Bamba", idade: 28, geral: 79, clubeId: "c_cel", nacionalidade: "Costa do Marfim", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_larsen", nome: "S. Larsen", idade: 24, geral: 78, clubeId: "c_cel", nacionalidade: "Noruega", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mingueza", nome: "O. Mingueza", idade: 25, geral: 76, clubeId: "c_cel", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_beltran_cel", nome: "Fran Beltrán", idade: 25, geral: 77, clubeId: "c_cel", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_villar", nome: "Iván Villar", idade: 27, geral: 75, clubeId: "c_cel", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_dgarcia", nome: "David García", idade: 30, geral: 80, clubeId: "c_osa", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_budimir", nome: "A. Budimir", idade: 33, geral: 79, clubeId: "c_osa", nacionalidade: "Croácia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_oroz", nome: "Aimar Oroz", idade: 22, geral: 78, clubeId: "c_osa", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_herrera", nome: "Sergio Herrera", idade: 31, geral: 78, clubeId: "c_osa", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_moncayola", nome: "J. Moncayola", idade: 26, geral: 77, clubeId: "c_osa", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pena", nome: "Rubén Peña", idade: 33, geral: 76, clubeId: "c_osa", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_agarcia", nome: "Aleix García", idade: 27, geral: 82, clubeId: "c_gir", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_tsygankov", nome: "V. Tsygankov", idade: 26, geral: 81, clubeId: "c_gir", nacionalidade: "Ucrânia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_dovbyk", nome: "A. Dovbyk", idade: 27, geral: 81, clubeId: "c_gir", nacionalidade: "Ucrânia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_savinho", nome: "Sávio", idade: 20, geral: 80, clubeId: "c_gir", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_blind", nome: "Daley Blind", idade: 34, geral: 79, clubeId: "c_gir", nacionalidade: "Holanda", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gazzaniga", nome: "P. Gazzaniga", idade: 32, geral: 78, clubeId: "c_gir", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // ==========================================
    // ITÁLIA - JOGADORES (Completando elencos)
    // Completando Milan e Inter
    // ================== AC MILAN 2025/26 ==================

    { id: "j_maignan", nome: "Mike Maignan", idade: 30, geral: 88, clubeId: "c_milan", nacionalidade: "França", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/88/10/168810_mike_maignan_20251228124300.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_sportiello", nome: "Marco Sportiello", idade: 34, geral: 77, clubeId: "c_milan", nacionalidade: "Italia", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_tomori", nome: "Fikayo Tomori", idade: 28, geral: 84, clubeId: "c_milan", nacionalidade: "Inglaterra", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/60/64/386064_fikayo_tomori_20260320101548.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pavlovic", nome: "Strahinja Pavlovic", idade: 25, geral: 82, clubeId: "c_milan", nacionalidade: "Servia", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/19/34/681934_strahinja_pavlovic_20251228124838.jpg", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gabbia", nome: "Matteo Gabbia", idade: 26, geral: 80, clubeId: "c_milan", nacionalidade: "Italia", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_odogu", nome: "David Odogu", idade: 19, geral: 68, clubeId: "c_milan", nacionalidade: "Alemanha", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/86/04/1028604_david_odogu_20251228124810.jpg", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_youssouffofana", nome: "Youssouf Fofana", idade: 27, geral: 84, clubeId: "c_milan", nacionalidade: "França", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/47/59/654759_youssouf_fofana_20251228125514.jpg", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_loftus", nome: "Ruben Loftus-Cheek", idade: 30, geral: 81, clubeId: "c_milan", nacionalidade: "Inglaterra", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_musah", nome: "Yunus Musah", idade: 23, geral: 80, clubeId: "c_milan", nacionalidade: "Estados Unidos", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/29/87/642987_yunus_musah_20250825005900.jpg", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_modric", nome: "Luka Modrić", idade: 40, geral: 83, clubeId: "c_milan", nacionalidade: "Croácia", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/68/72/26872_luka_modric_20251228125156.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pulisic", nome: "Christian Pulisic", idade: 27, geral: 84, clubeId: "c_milan", nacionalidade: "Estados Unidos", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_leao", nome: "Rafael Leao", idade: 26, geral: 85, clubeId: "c_milan", nacionalidade: "Portugal", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/06/34/80634_rafael_leao_20260103003827.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_chukwueze", nome: "Samuel Chukwueze", idade: 27, geral: 81, clubeId: "c_milan", nacionalidade: "Nigeria", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_okafor", nome: "Noah Okafor", idade: 25, geral: 80, clubeId: "c_milan", nacionalidade: "Suica", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/34/89/593489_noah_okafor_20251202101223.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_santiagogimenez", nome: "Santiago Gimenez", idade: 25, geral: 83, clubeId: "c_milan", nacionalidade: "Mexico", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/40/94/584094_santiago_gimenez_20251228125957.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
        
    { id: "j_barella", nome: "Nicolò Barella", idade: 27, geral: 86, clubeId: "c_inter", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bastoni", nome: "A. Bastoni", idade: 25, geral: 85, clubeId: "c_inter", nacionalidade: "Itália", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/18/64/511864_alessandro_bastoni_20250904233014.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_calhanoglu", nome: "H. Çalhanoğlu", idade: 30, geral: 84, clubeId: "c_inter", nacionalidade: "Turquia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_sommer", nome: "Yann Sommer", idade: 35, geral: 84, clubeId: "c_inter", nacionalidade: "Suíça", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_thuram", nome: "Marcus Thuram", idade: 27, geral: 83, clubeId: "c_inter", nacionalidade: "França", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // Juventus
    { id: "j_vlahovic", nome: "D. Vlahović", idade: 24, geral: 84, clubeId: "c_juv", nacionalidade: "Sérvia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_chiesa", nome: "F. Chiesa", idade: 26, geral: 83, clubeId: "c_juv", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_rabiot", nome: "A. Rabiot", idade: 29, geral: 83, clubeId: "c_juv", nacionalidade: "França", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_szczesny", nome: "W. Szczęsny", idade: 34, geral: 84, clubeId: "c_juv", nacionalidade: "Polônia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bremer", nome: "Bremer", idade: 27, geral: 84, clubeId: "c_juv", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/84/28/478428_bremer_20260104223359.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_danilo", nome: "Danilo", idade: 33, geral: 81, clubeId: "c_juv", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_francisco_conceicao", nome: "Francisco Conceicao", idade: 23, geral: 84, clubeId: "c_juv", nacionalidade: "Portugal", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/81/54/318154_francisco_conceicao_20260104223323.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // Napoli, Roma, Lazio, Atalanta, Fiorentina, Torino, Bologna, Sassuolo, Genoa
    { id: "j_kdb", nome: "Kevin De Bruyne", idade: 33, geral: 89, clubeId: "c_nap", nacionalidade: "Bélgica",posicao:"Meio-Campista", foto: "https://www.ogol.com.br/img/jogadores/new/79/08/97908_kevin_de_bruyne_20260407122445.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_dilorenzo", nome: "Di Lorenzo", idade: 31, geral: 84, clubeId: "c_nap", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lobotka", nome: "S. Lobotka", idade: 29, geral: 83, clubeId: "c_nap", nacionalidade: "Eslováquia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_anguissa", nome: "Zambo Anguissa", idade: 28, geral: 82, clubeId: "c_nap", nacionalidade: "Camarões", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_meret", nome: "Alex Meret", idade: 27, geral: 80, clubeId: "c_nap", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_dybala", nome: "Paulo Dybala", idade: 30, geral: 85, clubeId: "c_rom", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lukaku", nome: "R. Lukaku", idade: 31, geral: 83, clubeId: "c_rom", nacionalidade: "Bélgica", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pellegrini", nome: "L. Pellegrini", idade: 28, geral: 82, clubeId: "c_rom", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mancini", nome: "G. Mancini", idade: 28, geral: 81, clubeId: "c_rom", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_cristante", nome: "B. Cristante", idade: 29, geral: 80, clubeId: "c_rom", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_spinazzola", nome: "L. Spinazzola", idade: 31, geral: 79, clubeId: "c_rom", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_immobile", nome: "C. Immobile", idade: 34, geral: 83, clubeId: "c_laz", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_alberto", nome: "Luis Alberto", idade: 31, geral: 83, clubeId: "c_laz", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_zaccagni", nome: "M. Zaccagni", idade: 29, geral: 81, clubeId: "c_laz", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_anderson", nome: "Felipe Anderson", idade: 31, geral: 80, clubeId: "c_laz", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_romagnoli", nome: "A. Romagnoli", idade: 29, geral: 81, clubeId: "c_laz", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_provedel", nome: "Ivan Provedel", idade: 30, geral: 82, clubeId: "c_laz", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_koopmeiners", nome: "T. Koopmeiners", idade: 26, geral: 83, clubeId: "c_ata", nacionalidade: "Holanda", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lookman", nome: "A. Lookman", idade: 26, geral: 81, clubeId: "c_ata", nacionalidade: "Nigéria", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_scalvini", nome: "G. Scalvini", idade: 20, geral: 80, clubeId: "c_ata", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ederson_ata", nome: "Éderson", idade: 25, geral: 80, clubeId: "c_ata", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_scamacca", nome: "G. Scamacca", idade: 25, geral: 80, clubeId: "c_ata", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_deroon", nome: "Marten de Roon", idade: 33, geral: 79, clubeId: "c_ata", nacionalidade: "Holanda", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_gonzalez", nome: "N. González", idade: 26, geral: 81, clubeId: "c_fio", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_arthur", nome: "Arthur Melo", idade: 27, geral: 80, clubeId: "c_fio", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bonaventura", nome: "G. Bonaventura", idade: 34, geral: 80, clubeId: "c_fio", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_milenkovic", nome: "N. Milenković", idade: 26, geral: 79, clubeId: "c_fio", nacionalidade: "Sérvia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_biraghi", nome: "C. Biraghi", idade: 31, geral: 78, clubeId: "c_fio", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_beltran_fio", nome: "L. Beltrán", idade: 23, geral: 77, clubeId: "c_fio", nacionalidade: "Argentina", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_zapata", nome: "D. Zapata", idade: 33, geral: 80, clubeId: "c_tor", nacionalidade: "Colômbia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_sanabria", nome: "T. Sanabria", idade: 28, geral: 78, clubeId: "c_tor", nacionalidade: "Paraguai", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vlasic", nome: "N. Vlašić", idade: 26, geral: 79, clubeId: "c_tor", nacionalidade: "Croácia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bellanova", nome: "R. Bellanova", idade: 24, geral: 77, clubeId: "c_tor", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_buongiorno", nome: "A. Buongiorno", idade: 25, geral: 79, clubeId: "c_tor", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_milinkovic", nome: "Milinković-Savić", idade: 27, geral: 78, clubeId: "c_tor", nacionalidade: "Sérvia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

   
    { id: "j_orsolini", nome: "R. Orsolini", idade: 27, geral: 80, clubeId: "c_bol", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ferguson", nome: "L. Ferguson", idade: 24, geral: 79, clubeId: "c_bol", nacionalidade: "Escócia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_freuler", nome: "R. Freuler", idade: 32, geral: 78, clubeId: "c_bol", nacionalidade: "Suíça", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_calafiori", nome: "R. Calafiori", idade: 22, geral: 78, clubeId: "c_bol", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_skorupski", nome: "L. Skorupski", idade: 33, geral: 78, clubeId: "c_bol", nacionalidade: "Polônia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_berardi", nome: "D. Berardi", idade: 29, geral: 82, clubeId: "c_sas", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pinamonti", nome: "A. Pinamonti", idade: 25, geral: 77, clubeId: "c_sas", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lauriente", nome: "A. Laurienté", idade: 25, geral: 78, clubeId: "c_sas", nacionalidade: "França", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_henrique", nome: "M. Henrique", idade: 26, geral: 76, clubeId: "c_sas", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_erlic", nome: "M. Erlić", idade: 26, geral: 76, clubeId: "c_sas", nacionalidade: "Croácia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_consigli", nome: "A. Consigli", idade: 37, geral: 77, clubeId: "c_sas", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_gudmundsson", nome: "A. Guðmundsson", idade: 26, geral: 80, clubeId: "c_gen", nacionalidade: "Islândia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_retegui", nome: "M. Retegui", idade: 25, geral: 78, clubeId: "c_gen", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_malinovskyi", nome: "R. Malinovskyi", idade: 31, geral: 78, clubeId: "c_gen", nacionalidade: "Ucrânia", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_frendrup", nome: "M. Frendrup", idade: 23, geral: 76, clubeId: "c_gen", nacionalidade: "Dinamarca", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bani", nome: "M. Bani", idade: 30, geral: 75, clubeId: "c_gen", nacionalidade: "Itália", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_martinez_gen", nome: "J. Martínez", idade: 26, geral: 77, clubeId: "c_gen", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // ==========================================
    // ALEMANHA - JOGADORES (Completando elencos)
    // BAYERN MUNIQUE 2025/26

    { id: "j_neuer", nome: "Manuel Neuer", idade: 39, geral: 87, clubeId: "c_bayern", nacionalidade: "Alemanha", posicao:"Goleiro", foto: "https://www.ogol.com.br/img/jogadores/new/91/93/29193_manuel_neuer_20260407221159.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_urbig", nome: "Jonas Urbig", idade: 21, geral: 77, clubeId: "c_bayern", nacionalidade: "Alemanha", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kimmich", nome: "J. Kimmich", idade: 30, geral: 88, clubeId: "c_bayern", nacionalidade: "Alemanha", posicao:"Meio-Campista", foto: "https://www.ogol.com.br/img/jogadores/new/09/09/330909_joshua_kimmich_20250825102832.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_tah", nome: "Jonathan Tah", idade: 29, geral: 85, clubeId: "c_bayern", nacionalidade: "Alemanha", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/planteis/new/79/63/14787963_jonathan_tah_20260523002856.jpg", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_upamecano", nome: "D. Upamecano", idade: 26, geral: 84, clubeId: "c_bayern", nacionalidade: "França", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/planteis/new/00/59/11530059_dayot_upamecano_20241031110435.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kim", nome: "Kim Min-jae", idade: 28, geral: 84, clubeId: "c_bayern", nacionalidade: "Coreia do Sul", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_stanisic", nome: "Josip Stanišić", idade: 25, geral: 81, clubeId: "c_bayern", nacionalidade: "Croácia", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pavlovic", nome: "Aleksandar Pavlović", idade: 21, geral: 82, clubeId: "c_bayern", nacionalidade: "Alemanha", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_goretzka", nome: "Leon Goretzka", idade: 30, geral: 84, clubeId: "c_bayern", nacionalidade: "Alemanha", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_musiala", nome: "Jamal Musiala", idade: 22, geral: 87, clubeId: "c_bayern", nacionalidade: "Alemanha", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/planteis/new/29/11/11532911_jamal_musiala_20260531110020.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_olise", nome: "Michael Olise", idade: 23, geral: 88, clubeId: "c_bayern", nacionalidade: "França", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/planteis/new/93/83/11549383_michael_olise_20260513063955.jpg", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gnabry", nome: "Serge Gnabry", idade: 30, geral: 83, clubeId: "c_bayern", nacionalidade: "Alemanha", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kane", nome: "Harry Kane", idade: 32, geral: 91, clubeId: "c_bayern", nacionalidade: "Inglaterra", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/planteis/new/80/94/11528094_harry_kane_20251117053657.jpg", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_diaz", nome: "Luis Díaz", idade: 28, geral: 86, clubeId: "c_bayern", nacionalidade: "Colômbia", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/planteis/new/17/21/11531721_luis_diaz_20260201021148.jpg", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
        
    // Dortmund, Leverkusen, Leipzig, etc.
    { id: "j_brandt", nome: "Julian Brandt", idade: 28, geral: 84, clubeId: "c_bvd", nacionalidade: "Alemanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_reus", nome: "Marco Reus", idade: 35, geral: 82, clubeId: "c_bvd", nacionalidade: "Alemanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kobel", nome: "Gregor Kobel", idade: 26, geral: 86, clubeId: "c_bvd", nacionalidade: "Suíça", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_schlotterbeck", nome: "Schlotterbeck", idade: 24, geral: 83, clubeId: "c_bvd", nacionalidade: "Alemanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_malen", nome: "D. Malen", idade: 25, geral: 82, clubeId: "c_bvd", nacionalidade: "Holanda", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_can", nome: "Emre Can", idade: 30, geral: 81, clubeId: "c_bvd", nacionalidade: "Alemanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // RB LEIPZIG
    { id: "j_gulacsi", nome: "Péter Gulácsi", idade: 35, geral: 82, clubeId: "c_rbl", nacionalidade: "Hungria", posicao: "Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vandevoordt", nome: "Maarten Vandevoordt", idade: 24, geral: 80, clubeId: "c_rbl", nacionalidade: "Bélgica", posicao: "Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_raum", nome: "David Raum", idade: 28, geral: 84, clubeId: "c_rbl", nacionalidade: "Alemanha", posicao: "Lateral-Esquerdo", foto: "https://cdn-img.staticzz.com/img/jogadores/new/95/56/539556_david_raum_20260604170332.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_baku", nome: "Ridle Baku", idade: 27, geral: 82, clubeId: "c_rbl", nacionalidade: "Alemanha", posicao: "Lateral-Direito", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_orban", nome: "Willi Orbán", idade: 33, geral: 84, clubeId: "c_rbl", nacionalidade: "Hungria", posicao: "Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/65/26/206526_willi_orban_20260604165429.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lukeba", nome: "Castello Lukeba", idade: 23, geral: 84, clubeId: "c_rbl", nacionalidade: "França", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bitshiabu", nome: "El Chadaille Bitshiabu", idade: 20, geral: 77, clubeId: "c_rbl", nacionalidade: "França", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_seiwald", nome: "Nicolas Seiwald", idade: 24, geral: 81, clubeId: "c_rbl", nacionalidade: "Áustria", posicao: "Meio-Campista", foto: "https://cdn-img.staticzz.com/img/planteis/new/23/69/11532369_nicolas_seiwald_20250208084647.jpg", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_schlager", nome: "Xaver Schlager", idade: 28, geral: 83, clubeId: "c_rbl", nacionalidade: "Áustria", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_baumgartner", nome: "Christoph Baumgartner", idade: 26, geral: 84, clubeId: "c_rbl", nacionalidade: "Áustria", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ouedraogo", nome: "Assan Ouédraogo", idade: 19, geral: 78, clubeId: "c_rbl", nacionalidade: "Alemanha", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_banzuzi", nome: "Ezechiel Banzuzi", idade: 20, geral: 79, clubeId: "c_rbl", nacionalidade: "Holanda", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_nusa", nome: "Antonio Nusa", idade: 21, geral: 82, clubeId: "c_rbl", nacionalidade: "Noruega", posicao: "Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bakayoko", nome: "Johan Bakayoko", idade: 22, geral: 82, clubeId: "c_rbl", nacionalidade: "Bélgica", posicao: "Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gruda", nome: "Brajan Gruda", idade: 21, geral: 80, clubeId: "c_rbl", nacionalidade: "Alemanha", posicao: "Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_yandiomande", nome: "Yan Diomande", idade: 19, geral: 80, clubeId: "c_rbl", nacionalidade: "Costa do Marfim", posicao: "Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/92/51/2529251_yan_diomande_20260609004807.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_romulo", nome: "Rômulo Cardoso", idade: 23, geral: 81, clubeId: "c_rbl", nacionalidade: "Brasil", posicao: "Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_harder", nome: "Conrad Harder", idade: 20, geral: 79, clubeId: "c_rbl", nacionalidade: "Dinamarca", posicao: "Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_grimaldo", nome: "A. Grimaldo", idade: 28, geral: 86, clubeId: "c_lev", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_boniface", nome: "V. Boniface", idade: 23, geral: 82, clubeId: "c_lev", nacionalidade: "Nigéria", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
   
    { id: "j_guirassy", nome: "S. Guirassy", idade: 28, geral: 83, clubeId: "c_stu", nacionalidade: "Guiné", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_undav", nome: "Deniz Undav", idade: 27, geral: 80, clubeId: "c_stu", nacionalidade: "Alemanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_anton", nome: "W. Anton", idade: 27, geral: 80, clubeId: "c_stu", nacionalidade: "Alemanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_fuhrich", nome: "Chris Führich", idade: 26, geral: 79, clubeId: "c_stu", nacionalidade: "Alemanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_nubel", nome: "A. Nübel", idade: 27, geral: 80, clubeId: "c_stu", nacionalidade: "Alemanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_millot", nome: "Enzo Millot", idade: 21, geral: 78, clubeId: "c_stu", nacionalidade: "França", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // ==========================================
    // FRANÇA - JOGADORES (Completando elencos)
    // ================== PSG 2025/26 ==================

    { id: "j_chevalier", nome: "Lucas Chevalier", idade: 24, geral: 84, clubeId: "c_psg", nacionalidade: "França", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/68/99/696899_lucas_chevalier_20250922203252.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_safanov", nome: "Matvey Safonov", idade: 27, geral: 83, clubeId: "c_psg", nacionalidade: "Russia", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/50/83/535083_matvey_safonov_20260129001349.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_marquinhos", nome: "Marquinhos", idade: 31, geral: 86, clubeId: "c_psg", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/77/57/187757_marquinhos_20250326082619.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pacho", nome: "Willian Pacho", idade: 24, geral: 84, clubeId: "c_psg", nacionalidade: "Equador", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/73/07/627307_willian_pacho_20250616000531.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_hakimi", nome: "A. Hakimi", idade: 27, geral: 88, clubeId: "c_psg", nacionalidade: "Marrocos", posicao:"Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/86/25/478625_achraf_hakimi_20260217234110.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_nuno_mendes", nome: "Nuno Mendes", idade: 23, geral: 85, clubeId: "c_psg", nacionalidade: "Portugal", posicao:"Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/41/64/384164_nuno_mendes_20260323214133.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_hernandez", nome: "Lucas Hernandez", idade: 30, geral: 83, clubeId: "c_psg", nacionalidade: "França", posicao:"Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/12/86/331286_lucas_hernandez_20260515125648.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_beraldo", nome: "Beraldo", idade: 22, geral: 81, clubeId: "c_psg", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/83/21/728321_lucas_beraldo_20250929002406.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vitinha", nome: "Vitinha", idade: 25, geral: 88, clubeId: "c_psg", nacionalidade: "Portugal", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/12/84/421284_vitinha_20260129001200.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_neves", nome: "João Neves", idade: 21, geral: 85, clubeId: "c_psg", nacionalidade: "Portugal", posicao:"Volante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/76/29/587629_joao_neves_20251114002401.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_zaire", nome: "W. Zaïre-Emery", idade: 19, geral: 83, clubeId: "c_psg", nacionalidade: "França", posicao:"Volante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/68/03/896803_warren_zaire_emery_20241012233949.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ruiz", nome: "Fabian Ruiz", idade: 29, geral: 84, clubeId: "c_psg", nacionalidade: "Espanha", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/98/38/439838_fabian_ruiz_20250616000357.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mayulu", nome: "Senny Mayulu", idade: 19, geral: 74, clubeId: "c_psg", nacionalidade: "França", posicao:"Meia Ofensivo", foto: "https://cdn-img.staticzz.com/img/jogadores/new/34/11/1023411_senny_mayulu_20251021160959.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lee", nome: "Lee Kang-in", idade: 24, geral: 82, clubeId: "c_psg", nacionalidade: "Coreia do Sul", posicao:"Meia Ofensivo", foto: "https://cdn-img.staticzz.com/img/jogadores/new/95/04/619504_lee_kang_in_20260208232402.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_dembele", nome: "O. Dembele", idade: 29, geral: 90, clubeId: "c_psg", nacionalidade: "França", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/83/24/488324_ousmane_dembele_20260208232541.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kvaratskhelia", nome: "K. Kvaratskhelia", idade: 25, geral: 89, clubeId: "c_psg", nacionalidade: "Georgia", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/30/24/533024_khvicha_kvaratskhelia_20250616000301.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_barcola", nome: "Bradley Barcola", idade: 23, geral: 85, clubeId: "c_psg", nacionalidade: "França", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/83/06/748306_bradley_barcola_20260302131531.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ramos_psg", nome: "Gonçalo Ramos", idade: 24, geral: 83, clubeId: "c_psg", nacionalidade: "Portugal", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/83/76/428376_goncalo_ramos_20251103191410.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_duoue", nome: "Desire Doue", idade: 20, geral: 82, clubeId: "c_psg", nacionalidade: "França", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/51/91/915191_desire_doue_20260217234034.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    // Marseille, Lyon, Monaco, Lille, etc.
    { id: "j_aubameyang", nome: "Aubameyang", idade: 35, geral: 82, clubeId: "c_mar", nacionalidade: "Gabão", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_clauss", nome: "J. Clauss", idade: 31, geral: 80, clubeId: "c_mar", nacionalidade: "França", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_veretout", nome: "J. Veretout", idade: 31, geral: 79, clubeId: "c_mar", nacionalidade: "França", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mbemba", nome: "C. Mbemba", idade: 29, geral: 81, clubeId: "c_mar", nacionalidade: "RD Congo", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_harit", nome: "Amine Harit", idade: 27, geral: 78, clubeId: "c_mar", nacionalidade: "Marrocos", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_lopez", nome: "Pau López", idade: 29, geral: 79, clubeId: "c_mar", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_niakhaté", nome: "Moussa Niakhaté", idade: 28, geral: 77, clubeId: "c_lyo", nacionalidade: "Senegal", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_morton", nome: "Tyler Morton", idade: 21, geral: 73, clubeId: "c_lyo", nacionalidade: "Inglaterra", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_maitland", nome: "Maitland-Niles", idade: 26, geral: 76, clubeId: "c_lyo", nacionalidade: "Inglaterra", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_greif", nome: "Dominik Greif", idade: 27, geral: 74, clubeId: "c_lyo", nacionalidade: "Eslováquia", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_abner", nome: "Abner Vinícius", idade: 24, geral: 75, clubeId: "c_lyo", nacionalidade: "Brasil", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_tessmann", nome: "Tanner Tessmann", idade: 22, geral: 74, clubeId: "c_lyo", nacionalidade: "Estados Unidos", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_moreira", nome: "Afonso Moreira", idade: 19, geral: 70, clubeId: "c_lyo", nacionalidade: "Portugal", posicao: "Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/45/90/664590_afonso_moreira_20250901221433.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_sulc", nome: "Pavel Sulc", idade: 23, geral: 73, clubeId: "c_lyo", nacionalidade: "República Tcheca", posicao: "Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/31/63/663163_pavel_sulc_20251030000057.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_tagliafico", nome: "Nicolás Tagliafico", idade: 31, geral: 80, clubeId: "c_lyo", nacionalidade: "Argentina", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_merah", nome: "Khalis Merah", idade: 19, geral: 65, clubeId: "c_lyo", nacionalidade: "França", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_karabec", nome: "Adam Karabec", idade: 20, geral: 72, clubeId: "c_lyo", nacionalidade: "República Tcheca", posicao: "Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kluivert", nome: "Ruben Kluivert", idade: 23, geral: 70, clubeId: "c_lyo", nacionalidade: "Holanda", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_satriano", nome: "Martin Satriano", idade: 23, geral: 73, clubeId: "c_lyo", nacionalidade: "Uruguai", posicao: "Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_malickfofana", nome: "Malick Fofana", idade: 19, geral: 72, clubeId: "c_lyo", nacionalidade: "Bélgica", posicao: "Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_de_carvalho", nome: "Mathys de Carvalho", idade: 19, geral: 64, clubeId: "c_lyo", nacionalidade: "França", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_nartey", nome: "Noah Nartey", idade: 18, geral: 65, clubeId: "c_lyo", nacionalidade: "Dinamarca", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_yaremchuk", nome: "Roman Yaremchuk", idade: 28, geral: 75, clubeId: "c_lyo", nacionalidade: "Ucrânia", posicao: "Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mangala", nome: "Orel Mangala", idade: 26, geral: 76, clubeId: "c_lyo", nacionalidade: "Bélgica", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mikautadze", nome: "Georges Mikautadze", idade: 23, geral: 77, clubeId: "c_lyo", nacionalidade: "Geórgia", posicao: "Atacante", foto: "https://cdn-img.staticzz.com/img/planteis/new/44/85/11574485_georges_mikautadze_20250729110552.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kumbedi", nome: "Saël Kumbedi", idade: 19, geral: 73, clubeId: "c_lyo", nacionalidade: "França", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_hamdani", nome: "Adil Hamdani", idade: 18, geral: 62, clubeId: "c_lyo", nacionalidade: "França", posicao: "Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_goncalves", nome: "Tiago Gonçalves", idade: 18, geral: 61, clubeId: "c_lyo", nacionalidade: "Portugal", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gomes", nome: "Alejandro Gomes", idade: 18, geral: 62, clubeId: "c_lyo", nacionalidade: "Inglaterra", posicao: "Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_nuamah", nome: "Ernest Nuamah", idade: 20, geral: 75, clubeId: "c_lyo", nacionalidade: "Gana", posicao: "Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    
    { id: "j_yfofana", nome: "Y. Fofana", idade: 25, geral: 80, clubeId: "c_mon", nacionalidade: "França", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vanderson", nome: "Vanderson", idade: 23, geral: 78, clubeId: "c_mon", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_zakaria", nome: "D. Zakaria", idade: 27, geral: 79, clubeId: "c_mon", nacionalidade: "Suíça", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kohn", nome: "P. Köhn", idade: 26, geral: 77, clubeId: "c_mon", nacionalidade: "Suíça", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
        { id: "j_fati", nome: "Ansu Fati", idade: 23, geral: 79, clubeId: "c_mon", nacionalidade: "Espanha", posicao: "Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    // ==========================================
    // PORTUGAL - JOGADORES (Completando elencos)
    // Porto, Benfica, Sporting
    // ================== FC PORTO 2025/26 ==================

    { id: "j_costa", nome: "Diogo Costa", idade: 26, geral: 86, clubeId: "c_porto", nacionalidade: "Portugal", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/44/06/284406_diogo_costa_20251027223057.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_claudio_ramos", nome: "Claudio Ramos", idade: 34, geral: 77, clubeId: "c_porto", nacionalidade: "Portugal", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/79/26/97926_claudio_ramos_20250812115818.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_Bednarek", nome: "Jan Bednarek", idade: 30, geral: 81, clubeId: "c_porto", nacionalidade: "Polonia", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/55/51/355551_jan_bednarek_20250812120210.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_Kiwior", nome: "Jakub Kiwior", idade: 26, geral: 78, clubeId: "c_porto", nacionalidade: "Polonia", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/48/53/504853_jakub_kiwior_20260203092333.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_martim_fernandes", nome: "Martim Fernandes", idade: 20, geral: 74, clubeId: "c_porto", nacionalidade: "Portugal", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/39/49/743949_martim_fernandes_20250812120211.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_moura", nome: "Francisco Moura", idade: 26, geral: 80, clubeId: "c_porto", nacionalidade: "Portugal", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/44/63/524463_francisco_moura_20250812120212.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_alberto", nome: "Alberto Costa", idade: 22, geral: 79, clubeId: "c_porto", nacionalidade: "Portugal", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/49/26/544926_alberto_costa_20250923212103.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_varela", nome: "Alan Varela", idade: 24, geral: 84, clubeId: "c_porto", nacionalidade: "Argentina", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/46/26/824626_alan_varela_20250812120208.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mora", nome: "Rodrigo Mora", idade: 19, geral: 77, clubeId: "c_porto", nacionalidade: "Portugal", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/56/02/545602_rodrigo_mora_20250812120213.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_gabri_veiga", nome: "Gabri Veiga", idade: 24, geral: 83, clubeId: "c_porto", nacionalidade: "Espanha", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/51/25/755125_gabri_veiga_20250812115358.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vasco_sousa", nome: "Vasco Sousa", idade: 22, geral: 73, clubeId: "c_porto", nacionalidade: "Portugal", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/planteis/new/50/83/11515083_vasco_sousa_20240731175251.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_Frohold", nome: "Victor Frohold", idade: 20, geral: 83, clubeId: "c_porto", nacionalidade: "Dinamarca", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/38/57/1013857_victor_froholdt_20250812120212.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pepe_porto", nome: "Pepê", idade: 29, geral: 84, clubeId: "c_porto", nacionalidade: "Brasil", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/42/58/474258_pepe_20250812115402.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_samu", nome: "Samu Omorodion", idade: 21, geral: 82, clubeId: "c_porto", nacionalidade: "Espanha", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/22/94/1182294_samu_20251027222835.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_deniz_gül", nome: "Deniz Gül", idade: 21, geral: 78, clubeId: "c_porto", nacionalidade: "Turquia", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/82/74/1018274_deniz_gul_20251027222917.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pietuszewski", nome: "Oskar Pietuszewski", idade: 19, geral: 76, clubeId: "c_porto", nacionalidade: "Polonia", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/74/71/1257471_oskar_pietuszewski_20260203092334.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_william_gomes", nome: "William Gomes", idade: 20, geral: 78, clubeId: "c_porto", nacionalidade: "Brasil", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/02/21/890221_william_gomes_20250812120211.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    { id: "j_dimaria", nome: "Á. Di María", idade: 36, geral: 83, clubeId: "c_benfica", nacionalidade: "Argentina",posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/planteis/new/51/19/8725119_angel_di_maria_20240618215831.jpg", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_rafa", nome: "Rafa Silva", idade: 31, geral: 82, clubeId: "c_benfica", nacionalidade: "Portugal",posicao:"Meio-Campista" ,foto: "https://cdn-img.staticzz.com/img/jogadores/new/10/61/261061_rafa_silva_20260419234623.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_otamendi", nome: "N. Otamendi", idade: 36, geral: 81, clubeId: "c_benfica", nacionalidade: "Argentina",posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/planteis/new/73/83/11527383_nicolas_otamendi_20251211020434.jpg", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_trubin", nome: "A. Trubin", idade: 22, geral: 80, clubeId: "c_benfica", nacionalidade: "Ucrânia",posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/40/58/594058_anatoliy_trubin_20251025232527.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_asantonio", nome: "António Silva", idade: 20, geral: 79, clubeId: "c_benfica", nacionalidade: "Portugal",posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/04/96/490496_antonio_silva_20251125172257.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // SPORTING CP
    { id: "j_rui_silva", nome: "Rui Silva", idade: 32, geral: 82, clubeId: "c_scp", nacionalidade: "Portugal", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/53/22/275322_rui_silva_20250811142716.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_goncalo_inacio", nome: "Gonçalo Inácio", idade: 24, geral: 83, clubeId: "c_scp", nacionalidade: "Portugal", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/41/59/384159_goncalo_inacio_20250811142757.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_maxi_araujo", nome: "Maxi Araújo", idade: 25, geral: 81, clubeId: "c_scp", nacionalidade: "Uruguai", posicao:"Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/19/95/631995_maxi_araujo_20250811143407.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ivan_fresneda", nome: "Iván Fresneda", idade: 21, geral: 80, clubeId: "c_scp", nacionalidade: "Espanha", posicao:"Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/15/70/911570_ivan_fresneda_20250811142757.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_eduardo_quaresma", nome: "Eduardo Quaresma", idade: 24, geral: 80, clubeId: "c_scp", nacionalidade: "Portugal", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/05/17/160517_eduardo_quaresma_20250811143321.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_diomande", nome: "Ousmane Diomande", idade: 22, geral: 83, clubeId: "c_scp", nacionalidade: "Costa do Marfim", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/33/39/953339_ousmane_diomande_20250811143010.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vagiannidis", nome: "Georgios Vagiannidis", idade: 24, geral: 79, clubeId: "c_scp", nacionalidade: "Grécia", posicao:"Lateral", foto: "https://cdn-img.staticzz.com/img/jogadores/new/86/51/768651_georgios_vagiannidis_20250811142717.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_debast", nome: "Zeno Debast", idade: 22, geral: 81, clubeId: "c_scp", nacionalidade: "Bélgica", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/16/25/741625_zeno_debast_20250811143739.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mangas", nome: "Ricardo Mangas", idade: 27, geral: 78, clubeId: "c_scp", nacionalidade: "Portugal", posicao:"Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_matheus_reis", nome: "Matheus Reis", idade: 31, geral: 79, clubeId: "c_scp", nacionalidade: "Brasil", posicao:"Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_hjulmand", nome: "Morten Hjulmand", idade: 26, geral: 84, clubeId: "c_scp", nacionalidade: "Dinamarca", posicao:"Volante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/91/57/529157_morten_hjulmand_20250811143838.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_morita", nome: "Hidemasa Morita", idade: 31, geral: 82, clubeId: "c_scp", nacionalidade: "Japão", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/45/15/624515_hidemasa_morita_20250811143658.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_joao_simoes", nome: "João Simões", idade: 19, geral: 70, clubeId: "c_scp", nacionalidade: "Portugal", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/31/11/643111_joao_simoes_20250811143658.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_kochorashvili", nome: "Giorgi Kochorashvili", idade: 26, geral: 80, clubeId: "c_scp", nacionalidade: "Geórgia", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_braganca", nome: "Daniel Bragança", idade: 26, geral: 80, clubeId: "c_scp", nacionalidade: "Portugal", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_trincao", nome: "Francisco Trincão", idade: 26, geral: 84, clubeId: "c_scp", nacionalidade: "Portugal", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/02/56/500256_francisco_trincao_20250811145102.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_geny", nome: "Geny Catamo", idade: 24, geral: 82, clubeId: "c_scp", nacionalidade: "Moçambique", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/93/63/639363_geny_catamo_20250811144315.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_pote", nome: "Pedro Gonçalves", idade: 27, geral: 84, clubeId: "c_scp", nacionalidade: "Portugal", posicao:"Meia Ofensivo", foto: "https://cdn-img.staticzz.com/img/jogadores/new/83/88/338388_pedro_goncalves_20250811143659.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_quenda", nome: "Geovany Quenda", idade: 19, geral: 78, clubeId: "c_scp", nacionalidade: "Portugal", posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/31/09/643109_geovany_quenda_20250811144316.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_luis_guilherme", nome: "Luís Guilherme", idade: 20, geral: 77, clubeId: "c_scp", nacionalidade: "Brasil", posicao:"Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_luis_suarez", nome: "Luis Suárez", idade: 28, geral: 83, clubeId: "c_scp", nacionalidade: "Colômbia", posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/41/73/504173_luis_suarez_20250808234610.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ioannidis", nome: "Fotis Ioannidis", idade: 25, geral: 82, clubeId: "c_scp", nacionalidade: "Grécia", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    
    // Braga
    { id: "j_horta", nome: "Ricardo Horta", idade: 29, geral: 80, clubeId: "c_bra", nacionalidade: "Portugal", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_banza", nome: "Simon Banza", idade: 27, geral: 78, clubeId: "c_bra", nacionalidade: "RD Congo", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bruma", nome: "Bruma", idade: 29, geral: 77, clubeId: "c_bra", nacionalidade: "Portugal", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_moutinho", nome: "João Moutinho", idade: 37, geral: 78, clubeId: "c_bra", nacionalidade: "Portugal", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_matheus", nome: "Matheus", idade: 32, geral: 77, clubeId: "c_bra", nacionalidade: "Brasil", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_niakate", nome: "S. Niakaté", idade: 24, geral: 76, clubeId: "c_bra", nacionalidade: "França", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // RIO AVE 2025/26

    { id: "j_miszta", nome: "Cezary Miszta", idade: 24, geral: 74, clubeId: "c_rio", nacionalidade: "Polônia", posicao:"Goleiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/60/33/586033_cezary_miszta_20250920111928.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_jhonatan", nome: "Jhonatan", idade: 34, geral: 72, clubeId: "c_rio", nacionalidade: "Brasil", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_panzo", nome: "Jonathan Panzo", idade: 24, geral: 73, clubeId: "c_rio", nacionalidade: "Inglaterra", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_venancio", nome: "Aderllan Santos", idade: 36, geral: 72, clubeId: "c_rio", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_nelsonabbey", nome: "Nelson Abbey", idade: 22, geral: 73, clubeId: "c_rio", nacionalidade: "Gana", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_tiknaz", nome: "Demir Tiknaz", idade: 21, geral: 75, clubeId: "c_rio", nacionalidade: "Turquia", posicao:"Meio-Campista", foto: "https://cdn-img.staticzz.com/img/jogadores/new/69/77/896977_demir_tiknaz_20260208222911.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_aguilera", nome: "Brandon Aguilera", idade: 22, geral: 74, clubeId: "c_rio", nacionalidade: "Costa Rica", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vrousai", nome: "Marios Vrousai", idade: 27, geral: 73, clubeId: "c_rio", nacionalidade: "Grécia", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_bondoso", nome: "Joca", idade: 29, geral: 73, clubeId: "c_rio", nacionalidade: "Portugal", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_clayton", nome: "Clayton", idade: 26, geral: 76, clubeId: "c_rio", nacionalidade: "Brasil", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_andreluiz", nome: "André Luiz", idade: 28, geral: 74, clubeId: "c_rio", nacionalidade: "Brasil", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_hassan", nome: "Ahmed Hassan", idade: 32, geral: 74, clubeId: "c_rio", nacionalidade: "Egito", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    
    // TURQUIA

     // GALATASARAY
     { id: "j_sane", nome: "Leroy Sané", idade: 28, geral: 83, clubeId: "c_gala", nacionalidade: "Alemanha",posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/08/43/370843_leroy_sane_20250919162008.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
     { id: "j_osimhen", nome: "V. Osimhen", idade: 25, geral: 87, clubeId: "c_gala", nacionalidade: "Nigéria",posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/50/37/485037_victor_osimhen_20250919163515.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

     // BELGICA
     // CLUB BRUGGE
    { id: "j_mignolet", nome: "Simon Mignolet", idade: 37, geral: 79, clubeId: "c_bru", nacionalidade: "Belgica", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mechele", nome: "Brandon Mechele", idade: 32, geral: 77, clubeId: "c_bru", nacionalidade: "Belgica", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vetlesen", nome: "Hugo Vetlesen", idade: 25, geral: 76, clubeId: "c_bru", nacionalidade: "Noruega", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_tzolis", nome: "Christos Tzolis", idade: 24, geral: 80, clubeId: "c_bru", nacionalidade: "Grecia", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // ANDERLECHT
    { id: "j_coosemans", nome: "Colin Coosemans", idade: 33, geral: 75, clubeId: "c_and", nacionalidade: "Belgica", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_vertonghen", nome: "Jan Vertonghen", idade: 39, geral: 77, clubeId: "c_and", nacionalidade: "Belgica", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_stroeykens", nome: "Mario Stroeykens", idade: 21, geral: 75, clubeId: "c_and", nacionalidade: "Belgica", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_dolberg", nome: "Kasper Dolberg", idade: 28, geral: 79, clubeId: "c_and", nacionalidade: "Dinamarca", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // GENK
    { id: "j_penders", nome: "Mike Penders", idade: 20, geral: 74, clubeId: "c_genk", nacionalidade: "Belgica", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_sadick", nome: "Mujaid Sadick", idade: 25, geral: 75, clubeId: "c_genk", nacionalidade: "Espanha", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_elkhannouss", nome: "Bilal El Khannouss", idade: 21, geral: 81, clubeId: "c_genk", nacionalidade: "Marrocos", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ayo", nome: "Tolu Arokodare", idade: 25, geral: 78, clubeId: "c_genk", nacionalidade: "Nigeria", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // GENT
    { id: "j_roef", nome: "Davy Roef", idade: 31, geral: 74, clubeId: "c_gent", nacionalidade: "Belgica", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_torunarigha", nome: "Jordan Torunarigha", idade: 28, geral: 76, clubeId: "c_gent", nacionalidade: "Nigeria", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_hong", nome: "Hong Hyun-seok", idade: 27, geral: 77, clubeId: "c_gent", nacionalidade: "Coreia do Sul", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_orban", nome: "Gift Orban", idade: 24, geral: 78, clubeId: "c_gent", nacionalidade: "Nigeria", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // UNION SG
    { id: "j_moris", nome: "Anthony Moris", idade: 35, geral: 76, clubeId: "c_union", nacionalidade: "Luxemburgo", posicao:"Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_macallister", nome: "Kevin Mac Allister", idade: 28, geral: 77, clubeId: "c_union", nacionalidade: "Argentina", posicao:"Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_puertas", nome: "Cameron Puertas", idade: 27, geral: 79, clubeId: "c_union", nacionalidade: "Espanha", posicao:"Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_amoura", nome: "Mohamed Amoura", idade: 25, geral: 80, clubeId: "c_union", nacionalidade: "Argelia", posicao:"Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // ESCOCIA

    // CELTIC
    { id: "j_schmeichel", nome: "Kasper Schmeichel", idade: 38, geral: 79, clubeId: "c_celtic", nacionalidade: "Dinamarca", posicao:"Goleiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_cartervickers", nome: "Cameron Carter-Vickers", idade: 27, geral: 78, clubeId: "c_celtic", nacionalidade: "Estados Unidos", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_trusty", nome: "Auston Trusty", idade: 26, geral: 75, clubeId: "c_celtic", nacionalidade: "Estados Unidos", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_mcgregor", nome: "Callum McGregor", idade: 32, geral: 80, clubeId: "c_celtic", nacionalidade: "Escócia", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_hatate", nome: "Reo Hatate", idade: 27, geral: 78, clubeId: "c_celtic", nacionalidade: "Japão", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_maeda", nome: "Daizen Maeda", idade: 27, geral: 78, clubeId: "c_celtic", nacionalidade: "Japão", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_kuhn", nome: "Nicolas Kühn", idade: 25, geral: 77, clubeId: "c_celtic", nacionalidade: "Alemanha", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_idah", nome: "Adam Idah", idade: 24, geral: 76, clubeId: "c_celtic", nacionalidade: "Irlanda", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    
    // RANGER
    { id: "j_butland", nome: "Jack Butland", idade: 32, geral: 78, clubeId: "c_rangers", nacionalidade: "Inglaterra", posicao:"Goleiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_souttar", nome: "John Souttar", idade: 28, geral: 75, clubeId: "c_rangers", nacionalidade: "Escócia", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_propper", nome: "Robin Pröpper", idade: 31, geral: 75, clubeId: "c_rangers", nacionalidade: "Holanda", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_raskin", nome: "Nicolas Raskin", idade: 24, geral: 77, clubeId: "c_rangers", nacionalidade: "Bélgica", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_dio", nome: "Mohamed Diomande", idade: 23, geral: 76, clubeId: "c_rangers", nacionalidade: "Costa do Marfim", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_cerny", nome: "Vaclav Cerny", idade: 27, geral: 77, clubeId: "c_rangers", nacionalidade: "República Tcheca", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_dessers", nome: "Cyriel Dessers", idade: 30, geral: 77, clubeId: "c_rangers", nacionalidade: "Nigéria", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_bajrami", nome: "Nedim Bajrami", idade: 26, geral: 76, clubeId: "c_rangers", nacionalidade: "Albânia", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    
    // HEARTS
    { id: "j_gordon", nome: "Craig Gordon", idade: 42, geral: 74, clubeId: "c_hearts", nacionalidade: "Escócia", posicao:"Goleiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_rowles", nome: "Kye Rowles", idade: 27, geral: 73, clubeId: "c_hearts", nacionalidade: "Austrália", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_kent", nome: "Frankie Kent", idade: 29, geral: 72, clubeId: "c_hearts", nacionalidade: "Inglaterra", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_devlin_hearts", nome: "Cameron Devlin", idade: 27, geral: 73, clubeId: "c_hearts", nacionalidade: "Austrália", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_beni", nome: "Beni Baningime", idade: 26, geral: 73, clubeId: "c_hearts", nacionalidade: "RD Congo", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_spittal", nome: "Blair Spittal", idade: 29, geral: 74, clubeId: "c_hearts", nacionalidade: "Escócia", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_shankland", nome: "Lawrence Shankland", idade: 30, geral: 76, clubeId: "c_hearts", nacionalidade: "Escócia", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_vargas", nome: "Kenneth Vargas", idade: 23, geral: 73, clubeId: "c_hearts", nacionalidade: "Costa Rica", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },

    // HIBERNIAN
    { id: "j_smith_hibs", nome: "Jordan Smith", idade: 30, geral: 72, clubeId: "c_hibs", nacionalidade: "Inglaterra", posicao:"Goleiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_miller", nome: "Lewis Miller", idade: 24, geral: 72, clubeId: "c_hibs", nacionalidade: "Austrália", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_levitt", nome: "Dylan Levitt", idade: 24, geral: 74, clubeId: "c_hibs", nacionalidade: "País de Gales", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_newell", nome: "Joe Newell", idade: 32, geral: 73, clubeId: "c_hibs", nacionalidade: "Inglaterra", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_triantis", nome: "Nectarios Triantis", idade: 22, geral: 72, clubeId: "c_hibs", nacionalidade: "Austrália", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_boyle", nome: "Martin Boyle", idade: 32, geral: 75, clubeId: "c_hibs", nacionalidade: "Austrália", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_kukharevych", nome: "Mykola Kukharevych", idade: 24, geral: 73, clubeId: "c_hibs", nacionalidade: "Ucrânia", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_hoilett", nome: "Junior Hoilett", idade: 35, geral: 72, clubeId: "c_hibs", nacionalidade: "Canadá", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },

    // ABERDEEN
    { id: "j_roos", nome: "Kelle Roos", idade: 33, geral: 73, clubeId: "c_aberdeen", nacionalidade: "Holanda", posicao:"Goleiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_devlin_ab", nome: "Nicky Devlin", idade: 31, geral: 73, clubeId: "c_aberdeen", nacionalidade: "Escócia", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_rubezic", nome: "Slobodan Rubezic", idade: 25, geral: 73, clubeId: "c_aberdeen", nacionalidade: "Montenegro", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_shinnie", nome: "Graeme Shinnie", idade: 34, geral: 74, clubeId: "c_aberdeen", nacionalidade: "Escócia", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_clarkson", nome: "Leighton Clarkson", idade: 24, geral: 74, clubeId: "c_aberdeen", nacionalidade: "Inglaterra", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_polvara", nome: "Dante Polvara", idade: 25, geral: 72, clubeId: "c_aberdeen", nacionalidade: "Estados Unidos", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_sokler", nome: "Ester Sokler", idade: 26, geral: 73, clubeId: "c_aberdeen", nacionalidade: "Eslovênia", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_miovski", nome: "Bojan Miovski", idade: 26, geral: 76, clubeId: "c_aberdeen", nacionalidade: "Macedônia do Norte", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
        
    // ARABIA SAUDITA

    // AL Nassr
    { id: "j_bento", nome: "Bento", idade: 26, geral: 82, clubeId: "c_aln", nacionalidade: "Brasil", posicao: "Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_alaqidi", nome: "Nawaf Al-Aqidi", idade: 25, geral: 75, clubeId: "c_aln", nacionalidade: "Arábia Saudita", posicao: "Goleiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_boushal", nome: "Nawaf Boushal", idade: 26, geral: 76, clubeId: "c_aln", nacionalidade: "Arábia Saudita", posicao: "Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ghanam", nome: "Sultan Al-Ghanam", idade: 31, geral: 78, clubeId: "c_aln", nacionalidade: "Arábia Saudita", posicao: "Lateral", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_inigomartinez", nome: "Iñigo Martínez", idade: 34, geral: 81, clubeId: "c_aln", nacionalidade: "Espanha", posicao: "Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/77/26/157726_inigo_martinez_20250810134406.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_laporte", nome: "Aymeric Laporte", idade: 31, geral: 84, clubeId: "c_aln", nacionalidade: "Espanha", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_simakan", nome: "Mohamed Simakan", idade: 25, geral: 82, clubeId: "c_aln", nacionalidade: "França", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_alamri", nome: "Abdulelah Al-Amri", idade: 28, geral: 77, clubeId: "c_aln", nacionalidade: "Arábia Saudita", posicao: "Zagueiro", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_brozovic", nome: "Marcelo Brozovic", idade: 33, geral: 83, clubeId: "c_aln", nacionalidade: "Croácia", posicao: "Volante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_khaibari", nome: "Abdul Al-Khaibari", idade: 29, geral: 76, clubeId: "c_aln", nacionalidade: "Arábia Saudita", posicao: "Volante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_alhassan", nome: "Ali Al-Hassan", idade: 28, geral: 75, clubeId: "c_aln", nacionalidade: "Arábia Saudita", posicao: "Meio-Campista", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_felix", nome: "João Felix", idade: 26, geral: 84, clubeId: "c_aln", nacionalidade: "Portugal", posicao: "Meia Ofensivo", foto: "https://www.ogol.com.br/img/jogadores/new/44/12/284412_joao_felix_20251228003213.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_mane", nome: "Sadio Mané", idade: 34, geral: 83, clubeId: "c_aln", nacionalidade: "Senegal", posicao: "Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_coman", nome: "Kingsley Coman", idade: 29, geral: 84, clubeId: "c_aln", nacionalidade: "França", posicao: "Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_angelo", nome: "Angelo Gabriel", idade: 23, geral: 76, clubeId: "c_aln", nacionalidade: "Brasil", posicao: "Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ayman", nome: "Ayman Yahya", idade: 24, geral: 76, clubeId: "c_aln", nacionalidade: "Arábia Saudita", posicao: "Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_ghareeb", nome: "Abdul Ghareeb", idade: 28, geral: 74, clubeId: "c_aln", nacionalidade: "Arábia Saudita", posicao: "Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_wesley", nome: "Wesley", idade: 20, geral: 77, clubeId: "c_aln", nacionalidade: "Brasil", posicao: "Ponta", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_cr7", nome: "Cristiano Ronaldo", idade: 41, geral: 85, clubeId: "c_aln", nacionalidade: "Portugal", posicao: "Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/15/79/1579_cristiano_ronaldo_20251228003106.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_saad", nome: "Saad Al-Nasser", idade: 22, geral: 72, clubeId: "c_aln", nacionalidade: "Arábia Saudita", posicao: "Atacante", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
        
    // Al HILAL
    { id: "j_theo", nome: "Theo Hernandez", idade: 28, geral: 85, clubeId: "c_hil", nacionalidade: "França", posicao:"Zagueiro", foto: "https://cdn-img.staticzz.com/img/jogadores/new/13/96/331396_theo_hernandez_20251228003840.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_r_neves", nome: "Ruben Neves ", idade: 28, geral: 83, clubeId: "c_hil", nacionalidade: "Portugal",posicao:"Meio-Campista", foto: "https://www.ogol.com.br/img/jogadores/new/62/34/216234_ruben_neves_20251228004119.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_darwinnúñez", nome: "Darwin Núñez", idade: 26, geral: 81, clubeId: "c_hil", nacionalidade: "Uruguai",posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/61/57/606157_darwin_nunez_20251228004407.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_benzema", nome: "Karim Benzema", idade: 37, geral: 82, clubeId: "c_hil", nacionalidade: "França",posicao:"Atacante", foto: "https://www.ogol.com.br/img/jogadores/new/29/13/12913_karim_benzema_20260221230208.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    // ESTADOS UNIDOS

    // INTER MIAMI 
    { id: "j_messi", nome: "Lionel Messi", idade: 38, geral: 86, clubeId: "c_mia", nacionalidade: "Argentina",posicao:"Meia Ofensivo", foto: "https://www.ogol.com.br/img/jogadores/new/05/92/10592_lionel_messi_20260224232338.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_suarez", nome: "Luis Suárez", idade: 39, geral: 82, clubeId: "c_mia", nacionalidade: "Uruguai",posicao:"Atacante", foto: "https://cdn-img.staticzz.com/img/jogadores/new/28/80/32880_luis_suarez_20260224232712.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_busquets", nome: "Sergio Busquets", idade: 37, geral: 81, clubeId: "c_mia", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_alba", nome: "Jordi Alba", idade: 37, geral: 81, clubeId: "c_mia", nacionalidade: "Espanha", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_campana", nome: "L. Campana", idade: 25, geral: 76, clubeId: "c_mia", nacionalidade: "Equador", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    { id: "j_callender", nome: "Drake Callender", idade: 28, geral: 75, clubeId: "c_mia", nacionalidade: "EUA", foto: "", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },

    //LOS ANGELES FC
    { id: "j_son", nome: "Heung-min Son", idade: 32, geral: 85, clubeId: "c_lafc", nacionalidade: "Coreia do Sul",posicao:"Ponta", foto: "https://cdn-img.staticzz.com/img/jogadores/new/39/97/153997_son_heung_min_20260224230428.png", statsTemporada: { jogos: 0, gols: 0, assistencias: 0, notas: [] }, historicoCarreira: [] },
    // MEXICO

    // CLUB AMÉRICA
    { id: "j_malagon", nome: "Luis Malagón", idade: 28, geral: 79, clubeId: "c_america", nacionalidade: "México", posicao:"Goleiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_caceres", nome: "Sebastián Cáceres", idade: 25, geral: 78, clubeId: "c_america", nacionalidade: "Uruguai", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_reyes", nome: "Israel Reyes", idade: 25, geral: 77, clubeId: "c_america", nacionalidade: "México", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_fidalgo", nome: "Álvaro Fidalgo", idade: 28, geral: 80, clubeId: "c_america", nacionalidade: "Espanha", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_zendejas", nome: "Alejandro Zendejas", idade: 27, geral: 78, clubeId: "c_america", nacionalidade: "México", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_henry", nome: "Henry Martín", idade: 32, geral: 79, clubeId: "c_america", nacionalidade: "México", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_davila", nome: "Víctor Dávila", idade: 27, geral: 77, clubeId: "c_america", nacionalidade: "Chile", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_aguirre", nome: "Rodrigo Aguirre", idade: 30, geral: 76, clubeId: "c_america", nacionalidade: "Uruguai", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },

    // MONTERREY
    { id: "j_andrada", nome: "Esteban Andrada", idade: 34, geral: 78, clubeId: "c_monterrey", nacionalidade: "Argentina", posicao:"Goleiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_medina", nome: "Stefan Medina", idade: 33, geral: 77, clubeId: "c_monterrey", nacionalidade: "Colômbia", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_guzman", nome: "Víctor Guzmán", idade: 23, geral: 77, clubeId: "c_monterrey", nacionalidade: "México", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_canal", nome: "Sergio Canales", idade: 34, geral: 80, clubeId: "c_monterrey", nacionalidade: "Espanha", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_ocampos", nome: "Lucas Ocampos", idade: 31, geral: 79, clubeId: "c_monterrey", nacionalidade: "Argentina", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_berterame", nome: "Germán Berterame", idade: 26, geral: 79, clubeId: "c_monterrey", nacionalidade: "México", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_corona", nome: "Jesús Corona", idade: 32, geral: 77, clubeId: "c_monterrey", nacionalidade: "México", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_deossa", nome: "Nelson Deossa", idade: 25, geral: 76, clubeId: "c_monterrey", nacionalidade: "Colômbia", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },

    // TIGRES
    { id: "j_guzman_tig", nome: "Nahuel Guzmán", idade: 39, geral: 77, clubeId: "c_tigres", nacionalidade: "Argentina", posicao:"Goleiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_angulo", nome: "Jesús Angulo", idade: 27, geral: 77, clubeId: "c_tigres", nacionalidade: "México", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_reyes_tig", nome: "Diego Reyes", idade: 32, geral: 76, clubeId: "c_tigres", nacionalidade: "México", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_gorriaran", nome: "Fernando Gorriarán", idade: 31, geral: 79, clubeId: "c_tigres", nacionalidade: "Uruguai", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_cordova", nome: "Sebastián Córdova", idade: 28, geral: 77, clubeId: "c_tigres", nacionalidade: "México", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_ibanez", nome: "Nicolás Ibáñez", idade: 30, geral: 78, clubeId: "c_tigres", nacionalidade: "Argentina", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_lainez", nome: "Diego Lainez", idade: 25, geral: 76, clubeId: "c_tigres", nacionalidade: "México", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_brunetta", nome: "Juan Brunetta", idade: 28, geral: 79, clubeId: "c_tigres", nacionalidade: "Argentina", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },

    // CHIVAS
    { id: "j_rangel", nome: "Raúl Rangel", idade: 25, geral: 76, clubeId: "c_chivas", nacionalidade: "México", posicao:"Goleiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_chiquete", nome: "Jesús Orozco", idade: 23, geral: 77, clubeId: "c_chivas", nacionalidade: "México", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_moctezuma", nome: "Gilberto Sepúlveda", idade: 26, geral: 76, clubeId: "c_chivas", nacionalidade: "México", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_gutierrez", nome: "Erick Gutiérrez", idade: 30, geral: 77, clubeId: "c_chivas", nacionalidade: "México", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_cowell", nome: "Cade Cowell", idade: 21, geral: 76, clubeId: "c_chivas", nacionalidade: "Estados Unidos", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_alvarado", nome: "Roberto Alvarado", idade: 27, geral: 78, clubeId: "c_chivas", nacionalidade: "México", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_marin", nome: "Ricardo Marín", idade: 27, geral: 75, clubeId: "c_chivas", nacionalidade: "México", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_beltran", nome: "Fernando Beltrán", idade: 27, geral: 77, clubeId: "c_chivas", nacionalidade: "México", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },

    // CRUZ AZUL
    { id: "j_mier", nome: "Kevin Mier", idade: 25, geral: 79, clubeId: "c_cruzazul", nacionalidade: "Colômbia", posicao:"Goleiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_ditta", nome: "Willer Ditta", idade: 28, geral: 78, clubeId: "c_cruzazul", nacionalidade: "Colômbia", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_piovi", nome: "Gonzalo Piovi", idade: 30, geral: 77, clubeId: "c_cruzazul", nacionalidade: "Argentina", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_faravelli", nome: "Lorenzo Faravelli", idade: 32, geral: 77, clubeId: "c_cruzazul", nacionalidade: "Argentina", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_rotondi", nome: "Carlos Rotondi", idade: 28, geral: 77, clubeId: "c_cruzazul", nacionalidade: "Argentina", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_bogusz", nome: "Mateusz Bogusz", idade: 24, geral: 78, clubeId: "c_cruzazul", nacionalidade: "Polônia", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_sepulveda", nome: "Ángel Sepúlveda", idade: 34, geral: 76, clubeId: "c_cruzazul", nacionalidade: "México", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_giako", nome: "Giorgos Giakoumakis", idade: 30, geral: 78, clubeId: "c_cruzazul", nacionalidade: "Grécia", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },

    // PACHUCA
    { id: "j_moreno", nome: "Carlos Moreno", idade: 27, geral: 76, clubeId: "c_pachuca", nacionalidade: "México", posicao:"Goleiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_bauermann", nome: "Eduardo Bauermann", idade: 29, geral: 76, clubeId: "c_pachuca", nacionalidade: "Brasil", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_barreto", nome: "Sergio Barreto", idade: 26, geral: 76, clubeId: "c_pachuca", nacionalidade: "Argentina", posicao:"Zagueiro", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_montiel", nome: "Bryan González", idade: 22, geral: 76, clubeId: "c_pachuca", nacionalidade: "México", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_pedraza", nome: "Pedro Pedraza", idade: 24, geral: 75, clubeId: "c_pachuca", nacionalidade: "México", posicao:"Meio-Campista", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_idrissi", nome: "Oussama Idrissi", idade: 29, geral: 79, clubeId: "c_pachuca", nacionalidade: "Marrocos", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_rondon", nome: "Salomón Rondón", idade: 35, geral: 78, clubeId: "c_pachuca", nacionalidade: "Venezuela", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] },
    { id: "j_kennedy", nome: "Kennedy", idade: 29, geral: 76, clubeId: "c_pachuca", nacionalidade: "Brasil", posicao:"Atacante", foto: "", statsTemporada:{ jogos:0,gols:0,assistencias:0,notas:[] }, historicoCarreira:[] }
];


// ==========================================
// TABELAS / NOTÍCIAS
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
// AUTO PREENCHER LIGAS
// ==========================================

export function preencherLigasVazias() {

    competicoes
        .filter(c => c.tipo === "liga")
        .forEach(comp => {

            let equipasNaLiga = clubes.filter(c => c.ligaId === comp.id);

            let faltam = 12 - equipasNaLiga.length;

            for (let i = 0; i < faltam; i++) {

                let reputacaoBase = comp.div === 1 ? 70 : 62;

                clubes.push({
                    id: `c_gen_${comp.id}_${i}`,
                    nome: `${comp.nome} FC ${i + 1}`,
                    ligaId: comp.id,
                    reputacao: reputacaoBase + Math.floor(Math.random() * 10),
                    cor: "#" + Math.floor(Math.random() * 16777215).toString(16),
                    logo: ""
                });
            }
        });
}
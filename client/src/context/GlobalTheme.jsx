export default function GlobalTheme() {
  return (
    <style>{`
      /* ── Google Fonts ─────────────────────────────────────────── */
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght=0,700;0,900;1,700&family=DM+Sans:opsz,wght=9..40,300;9..40,400;9..40,500;9..40,600&family=Lora:ital,wght=0,400;0,600;1,400;1,600&display=swap');

      /* ── LIGHT THEME (default) ────────────────────────────────── */
      :root,
      [data-theme="light"] {
        /* Core palette */
        --ink:         #0a0a0a;
        --ink-soft:    #1a1a1a;
        --cream:       #faf7f2;
        --paper:       #f5f0e8;
        --paper-soft:  #ede8df;
        --white:       #ffffff;
        --red:         #c8281e;
        --red-dk:      #9e1e16;
        --red-soft:    rgba(200, 40, 30, 0.1);
        --muted:       #6b6560;
        --muted-light: #9a9590;
        --border:      #d8d0c4;
        --border-soft: #e8e2d8;

        /* Surfaces */
        --bg-page:     #faf7f2;
        --bg-card:     #ffffff;
        --bg-card-alt: #f5f0e8;
        --bg-nav:      #0a0a0a;
        --bg-input:    #ffffff;
        --bg-sidebar:  #f5f0e8;
        --bg-hover:    rgba(10, 10, 10, 0.04);
        --bg-modal:    #faf7f2;
        --bg-overlay:  rgba(10, 10, 10, 0.72);
        --bg-code:     #f5f0e8;
        --bg-pre:      #0a0a0a;

        /* Text */
        --text-primary:   #0a0a0a;
        --text-secondary: #6b6560;
        --text-tertiary:  #9a9590;
        --text-inverse:   #ffffff;
        --text-link:      #c8281e;
        --text-code:      #c8281e;

        /* Shadows */
        --shadow-sm:  0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
        --shadow-md:  0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.05);
        --shadow-lg:  0 12px 32px rgba(0,0,0,.10), 0 4px 8px rgba(0,0,0,.06);
        --shadow-xl:  0 24px 48px rgba(0,0,0,.12), 0 8px 16px rgba(0,0,0,.06);
        --shadow-card:0 2px 8px rgba(0,0,0,.06);

        /* Ticker / accent bar */
        --ticker-bg:   #c8281e;
        --ticker-text: rgba(255,255,255,.9);
        --ticker-label-bg: #0a0a0a;

        /* Nav specific */
        --nav-logo-color:    #ffffff;
        --nav-link-color:    rgba(255,255,255,.5);
        --nav-link-active:   #ffffff;
        --nav-border:        rgba(255,255,255,.08);

        /* Toggle button */
        --toggle-track-bg:   #d8d0c4;
        --toggle-track-dark: #3d4752;
        --toggle-thumb:      #ffffff;

        /* Misc */
        --radius-sm:  2px;
        --radius-md:  4px;
        --radius-lg:  8px;
        --radius-xl:  12px;
        --radius-pill:999px;
      }

      /* ── DARK THEME ───────────────────────────────────────────── */
      [data-theme="dark"] {
        /* Core palette */
        --ink:         #f0ece4;
        --ink-soft:    #d8d0c4;
        --cream:       #161410; 
        --paper:       #1e1c18;
        --paper-soft:  #252320;
        --white:       #ffffff;
        --red:         #e84040;
        --red-dk:      #c8281e;
        --red-soft:    rgba(232, 64, 64, 0.15);
        --muted:       #8a8480;
        --muted-light: #6a6460;
        --border:      #2e2c28;
        --border-soft: #262420;

        /* Surfaces */
        --bg-page:     #121110;
        --bg-card:     #1e1c18;
        --bg-card-alt: #252320;
        --bg-nav:      #0d0c0a;
        --bg-input:    #1e1c18;
        --bg-sidebar:  #1a1816;
        --bg-hover:    rgba(255, 255, 255, 0.04);
        --bg-modal:    #1e1c18;
        --bg-overlay:  rgba(0, 0, 0, 0.82);
        --bg-code:     #252320;
        --bg-pre:      #0d0c0a;

        /* Text */
        --text-primary:   #f0ece4;
        --text-secondary: #8a8480;
        --text-tertiary:  #5a5650;
        --text-inverse:   #121110;
        --text-link:      #e84040;
        --text-code:      #f08080;

        /* Shadows */
        --shadow-sm:  0 1px 3px rgba(0,0,0,.3),  0 1px 2px rgba(0,0,0,.2);
        --shadow-md:  0 4px 12px rgba(0,0,0,.4),  0 2px 4px rgba(0,0,0,.3);
        --shadow-lg:  0 12px 32px rgba(0,0,0,.5), 0 4px 8px rgba(0,0,0,.3);
        --shadow-xl:  0 24px 48px rgba(0,0,0,.6), 0 8px 16px rgba(0,0,0,.4);
        --shadow-card:0 2px 8px rgba(0,0,0,.4);

        /* Ticker */
        --ticker-bg:   #c8281e;
        --ticker-text: rgba(255,255,255,.9);
        --ticker-label-bg: #0d0c0a;

        /* Nav */
        --nav-logo-color:  #f0ece4;
        --nav-link-color:  rgba(240,236,228,.4);
        --nav-link-active: #f0ece4;
        --nav-border:      rgba(255,255,255,.06);

        /* Toggle */
        --toggle-track-bg:   #2e2c28;
        --toggle-track-dark: #e84040;
        --toggle-thumb:      #f0ece4;
      }

      /* ── GLOBAL TRANSITION ────────────────────────────────────── */
      *,
      *::before,
      *::after {
        transition:
          background-color 0.22s ease,
          background        0.22s ease,
          border-color      0.22s ease,
          color             0.22s ease,
          box-shadow        0.22s ease,
          opacity           0.15s ease;
      }

      .progress-bar,
      .ticker-track,
      .toggle-thumb,
      .spinner,
      .av-spinner,
      .upload-progress-bar,
      [style*="animation"],
      [style*="transform"] {
        transition: none !important;
      }

      /* ── BASE RESET ───────────────────────────────────────────── */
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      html {
        scroll-behavior: smooth;
        -webkit-text-size-adjust: 100%;
        background-color: var(--bg-page) !important;
      }

      body {
        background:             var(--bg-page) !important;
        color:                  var(--text-primary) !important;
        font-family:            'DM Sans', system-ui, sans-serif;
        line-height:            1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      a { text-decoration: none; color: inherit; }
      button { font-family: inherit; }
      img, video { max-width: 100%; display: block; }

      /* Scrollbar */
      ::-webkit-scrollbar       { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }
      ::-webkit-scrollbar-thumb:hover { background: var(--muted); }

      ::selection { background: var(--red); color: var(--white); }
      :focus-visible { outline: 2px solid var(--red); outline-offset: 2px; }

      /* ── CATEGORY CHIPS / TAGS CLEAN RECONSTRUCTION ── */
      .tag-pill,
      .tag-chip,
      [class*="category-button"],
      [class*="categories"] button,
      [class*="topics"] button,
      [class*="topics"] a,
      [class*="categories"] a {
        background-color: transparent !important;
        background: transparent !important;
        border: 1px solid var(--border) !important;
        color: var(--text-secondary) !important;
        padding: 6px 14px;
        cursor: pointer;
      }

      .tag-pill:hover,
      .tag-chip:hover,
      [class*="category-button"]:hover,
      [class*="categories"] button:hover,
      [class*="topics"] button:hover,
      [class*="topics"] a:hover,
      [class*="categories"] a:hover {
        background: rgba(255, 255, 255, 0.08) !important;
        border-color: var(--text-primary) !important;
        color: var(--text-primary) !important;
      }

      .tag-pill.on,
      .tag-pill.active,
      .tag-chip.on,
      .tag-chip.active,
      [class*="category-button"].on,
      [class*="category-button"].active,
      [class*="categories"] .on,
      [class*="topics"] .on {
        background: transparent !important;
        background-color: transparent !important;
        border-color: var(--text-primary) !important;
        color: var(--text-primary) !important;
        font-weight: 500;
      }

      [data-theme="light"] .tag-pill:hover,
      [data-theme="light"] .tag-chip:hover {
        background: rgba(0, 0, 0, 0.05) !important;
      }

      /* ── LAYOUT & WRAPPER CONTAINERS ──────────────────────────── */
      .content-wrap,
      .article-wrap,
      main,
      .main-layout,
      [class*="content-container"],
      [class*="blog-body-container"] {
        background-color: var(--bg-page) !important;
        background: var(--bg-page) !important;
      }

      .post-hero,
      .post-hero-inner,
      [class*="hero-dark-overlay"] {
        background: var(--bg-nav) !important;
      }
      
      .post-hero h1,
      .post-hero .post-title,
      .post-hero [class*="title"],
      .post-title-main {
        color: #ffffff !important;
        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }

      .post-hero .post-date,
      .post-hero .post-author,
      .post-hero .byline-name,
      .post-hero .byline-sub {
        color: rgba(255, 255, 255, 0.7) !important;
      }

      /* ── ARTICLE BODY & SIDEBAR TEXT VISIBILITY ────────────────── */
      .article-body,
      .richtext,
      .article-content,
      .article-wrap main,
      [class*="sidebar"],
      .trending-item,
      [class*="trending-item"],
      [class*="sidebar-block"] {
        color: var(--text-primary) !important;
      }
      
      .article-body p,
      .article-body h2,
      .article-body h3 {
        color: var(--text-primary) !important;
        opacity: 0.95;
      }

      /* ── BRUTAL FORCE OVERRIDE: TARGETING THE MOST READ SIDEBAR REGION ONLY ── */
      [data-theme="dark"] [class*="MostRead"],
      [data-theme="dark"] [class*="most-read"],
      [data-theme="dark"] [class*="sidebar"] {
        color: var(--text-primary) !important;
      }

      [data-theme="dark"] [class*="MostRead"] div,
      [data-theme="dark"] [class*="most-read"] div,
      [data-theme="dark"] [class*="MostRead"] h3,
      [data-theme="dark"] [class*="most-read"] h3,
      [data-theme="dark"] [class*="MostRead"] a,
      [data-theme="dark"] [class*="most-read"] a,
      [data-theme="dark"] [class*="sidebar"] h3,
      [data-theme="dark"] [class*="sidebar"] a,
      [data-theme="dark"] [class*="sidebar"] div {
        color: #f0ece4 !important;
      }

      [data-theme="dark"] [class*="MostRead"] p,
      [data-theme="dark"] [class*="most-read"] p,
      [data-theme="dark"] [class*="MostRead"] span,
      [data-theme="dark"] [class*="most-read"] span,
      [data-theme="dark"] [class*="sidebar"] p,
      [data-theme="dark"] [class*="sidebar"] span {
        color: #8a8480 !important;
      }

      /* ── RIGHT PANEL WRITTEN BY FOLLOW BUTTON ─────────────────── */
      /* ── RIGHT PANEL WRITTEN BY FOLLOW BUTTON FIX ─────────────────── */
      button[class*="follow"],
      .sidebar-block button.f-solid,
      button.btn-follow,
      .ac-follow, 
      .sb-follow, 
      .f-solid {
        background-color: var(--ink) !important;
        color: var(--bg-page) !important;
        border: 1px solid var(--ink) !important;
      }

      /* Dark mode mein button ko stand out karne ke liye clear solid light background */
      [data-theme="dark"] button[class*="follow"],
      [data-theme="dark"] button.btn-follow,
      [data-theme="dark"] .ac-follow,
      [data-theme="dark"] .sb-follow,
      [data-theme="dark"] .f-solid {
         background-color: #f0ece4 !important; /* Pure light creamy white */
         color: #121110 !important;            /* Dark text contrast ke liye */
         border-color: #f0ece4 !important;
      }

      /* Hover ya Active (Following state) par outline border style */
      [data-theme="dark"] button[class*="follow"]:hover,
      [data-theme="dark"] button[class*="follow"].on,
      [data-theme="dark"] button.btn-follow.on,
      [data-theme="dark"] .ac-follow:hover {
        background-color: transparent !important;
        color: #f0ece4 !important;
        border-color: #f0ece4 !important;
      }


      /* ── SIDEBAR "MOST READ THIS WEEK" FIX ────────────────────── */
      [data-theme="dark"] .hero-side-title {
        color: var(--muted) !important;
        border-bottom-color: var(--border) !important;
      }

      [data-theme="dark"] .hero-side-num {
        color: var(--text-primary) !important;
        opacity: 0.4;
      }

      [data-theme="dark"] .hero-side-ptitle {
        color: var(--text-primary) !important;
      }

      [data-theme="dark"] .hero-side-meta {
        color: var(--text-secondary) !important;
      }

      [data-theme="dark"] .hero-side-post {
        border-bottom-color: var(--border-soft) !important;
      }
      
      [data-theme="dark"] .hero-side-post:hover .hero-side-ptitle {
        color: var(--red) !important;
      }
      /* ── HERO & BANNER SECTIONS OVERRIDES ──────────────────────── */
      .hero, 
      [class*="hero-section"], 
      [class*="welcome-banner"] {
        background-color: var(--bg-page) !important;
        background: var(--bg-page) !important;
        border-color: var(--border) !important;
      }
      .hero-title, .hero h1, [class*="hero-title"] { color: var(--text-primary) !important; }
      .hero-excerpt, .hero p, [class*="hero-subtitle"] { color: var(--text-secondary) !important; }

      /* ── NAV & GLOBAL OVERRIDES ────────────────────────────────── */
      .nav,
      .topbar {
        background: var(--bg-nav) !important;
        border-bottom-color: var(--nav-border) !important;
      }
      .nav-logo,
      .topbar-logo { color: var(--nav-logo-color) !important; }
      .nav-link     { color: var(--nav-link-color) !important; }
      .nav-link:hover,
      .nav-link.on  { color: var(--nav-link-active) !important; }

      .post-card,
      .post-row,
      .sb-block,
      .sidebar-block,
      .trending-item,
      .related-item {
        background: var(--bg-card) !important;
        border-color: var(--border) !important;
      }

      .field input, .mi, .nl-input, .cf-textarea, .comment-textarea, .mta, .url-input, .modal-input, .tag-input {
        background: var(--bg-input)    !important;
        color:      var(--text-primary) !important;
        border-color: var(--border)    !important;
      }

      .modal, .modal-back > div { background: var(--bg-modal) !important; }
      .modal-head          { background: var(--bg-nav)   !important; }
      .author-card, .hero-side, .right-panel, .post-sidebar { border-color: var(--border)  !important; }

      .ticker           { background: var(--ticker-bg)       !important; }
      .ticker-label     { background: var(--ticker-label-bg) !important; color: #fff !important; }
      .ticker-item      { color: var(--ticker-text)          !important; }
      .footer           { background: var(--bg-nav) !important; }

      .title-input, .subtitle-input { color: var(--text-primary) !important; background: transparent !important; }
      .title-input::placeholder, .subtitle-input::placeholder { color: var(--border) !important; }

      .toc-item, .toc-item:hover { color: var(--muted) !important; }
      .toc-item.toc-on, .toc-item.toc-active { color: var(--red) !important; }

      .nb-ghost, .nav-ghost, .btn-ghost {
        border-color: rgba(255,255,255,.2)  !important;
        color:        rgba(255,255,255,.65) !important;
      }

      .react-btn {
        background:   transparent     !important;
        border-color: var(--border)   !important;
        color:        var(--muted)    !important;
      }

      .author-card, .author-card-inner { background: var(--bg-card-alt) !important; }
      .author-card-name  { color: var(--text-primary)     !important; }
      .author-card-handle, .author-card-bio { color: var(--muted) !important; }

      .btn-publish, .nb-solid, .nav-fill, .nr, .pb-solid, .publish-btn, .url-apply-btn, .cf-submit, .m-save, .nl-btn, .comment-submit {
        background:   var(--red) !important;
        border-color: var(--red) !important;
        color:        #fff       !important;
      }

      .tab, .tab-btn, .p-tab, .cut { color: var(--muted) !important; background: transparent !important; border: none !important; }
      .tab.on, .tab-btn.active, .p-tab.on, .cut.on { color: var(--text-primary) !important; }

      .profile-name, .pr-title, .post-title { color: var(--text-primary) !important; }
      .sidebar-title, .sb-label { color: var(--muted) !important; border-color: var(--border) !important; }
      .tr-title, .related-title { color: var(--text-primary) !important; }

      .comment-item  { border-color: var(--border) !important; }
      .c-author      { color: var(--text-primary)  !important; }
      .c-text        { color: var(--text-primary)   !important; }

      .empty h3, .empty-state h3 { color: var(--text-primary) !important; }
      .empty p, .empty-state p  { color: var(--text-secondary) !important; }

      .ac-follow, .sb-follow, .f-solid {
        background:   var(--ink)     !important;
        color:        var(--bg-page) !important;
        border-color: var(--ink)     !important;
      }

      .post-excerpt  { color: var(--text-secondary) !important; }
      .post-thumb, .pr-thumb      { background: var(--bg-card-alt) !important; border-color: var(--border) !important; }

      /* ── GLASSMORPHISM CARDS (dark mode only) ─────────────────── */
      [data-theme="dark"] .sb-block,
      [data-theme="dark"] .sidebar-block {
        background: rgba(30, 28, 24, 0.8) !important;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      /* ── THEME TOGGLE BUTTON ──────────────────────────────────── */
      .theme-toggle-btn {
        position:        relative;
        width:           44px;
        height:          24px;
        border-radius:   999px;
        border:          none;
        cursor:          pointer;
        padding:         0;
        flex-shrink:     0;
        background:      var(--toggle-track-bg);
        transition:      background 0.3s ease !important;
        overflow:        hidden;
      }
      .theme-toggle-btn.dark-mode { background: var(--red) !important; }
      .theme-toggle-thumb {
        position:      absolute;
        top:           3px;
        left:          3px;
        width:         18px;
        height:        18px;
        border-radius: 50%;
        background:    #fff;
        display:       flex;
        align-items:   center;
        justify-content: center;
        transition:    transform 0.28s cubic-bezier(.34,1.56,.64,1) !important;
        box-shadow:    0 1px 4px rgba(0,0,0,.3);
      }
      .theme-toggle-btn.dark-mode .theme-toggle-thumb { transform: translateX(20px); }

      /* ── SCROLLBAR THEME ──────────────────────────────────────── */
      [data-theme="dark"] ::-webkit-scrollbar-thumb { background: var(--border); }
    `}</style>
  );
}
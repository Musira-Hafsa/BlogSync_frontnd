import { useState, useRef, useEffect, useCallback } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { uploadImage, cloudinaryUrl } from "../api/uploadImage";
import ThemeToggle from "../components/ThemeToggle";

const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL 
    ? `${import.meta.env.VITE_API_BASE_URL}/api` 
    : "http://localhost:5000/api",
  withCredentials: true 
});
API.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("bs_token") || sessionStorage.getItem("bs_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// ── Styles ────────────────────────────────────────────────────────
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Lora:ital,wght@0,400;0,600;1,400;1,600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{--ink:#0a0a0a;--cream:#faf7f2;--paper:#f5f0e8;--red:#c8281e;--muted:#6b6560;--border:#d8d0c4;--white:#fff;--topbar-h:56px;--toolbar-h:52px;}
    html,body{height:100%;background:var(--cream);}
    a{text-decoration:none;color:inherit;}

    /* topbar */
    .topbar{position:fixed;top:0;left:0;right:0;z-index:200;height:var(--topbar-h);background:var(--ink);display:flex;align-items:center;justify-content:space-between;padding:0 2rem;border-bottom:1px solid rgba(255,255,255,.08);}
    .topbar-left{display:flex;align-items:center;gap:1.5rem;}
    .topbar-logo{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:900;color:#fff;letter-spacing:-.02em;}
    .topbar-logo span{color:var(--red);}
    .topbar-divider{width:1px;height:20px;background:rgba(255,255,255,.15);}
    .topbar-label{font-size:.65rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.4);font-weight:500;}
    .topbar-right{display:flex;align-items:center;gap:.75rem;}
    .status-pill{display:flex;align-items:center;gap:.4rem;font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.4);font-weight:500;}
    .status-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.2);transition:background .3s;}
    .status-dot.saved{background:#22c55e;}.status-dot.saving{background:#f59e0b;animation:blink 1s ease infinite;}.status-dot.unsaved{background:rgba(255,255,255,.25);}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
    .topbar-btn{font-family:'DM Sans',sans-serif;font-size:.68rem;font-weight:500;letter-spacing:.13em;text-transform:uppercase;padding:.4rem .9rem;cursor:pointer;border-radius:0;transition:all .2s;}
    .btn-ghost{background:none;border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.6);}.btn-ghost:hover{border-color:rgba(255,255,255,.5);color:#fff;}
    .btn-publish{background:var(--red);border:1px solid var(--red);color:#fff;}.btn-publish:hover:not(:disabled){background:#9e1e16;}.btn-publish:disabled{opacity:.5;cursor:not-allowed;}

    /* toolbar */
    .toolbar{position:fixed;top:var(--topbar-h);left:0;right:0;z-index:190;height:var(--toolbar-h);background:var(--white);border-bottom:1.5px solid var(--border);display:flex;align-items:center;padding:0 2rem;gap:.25rem;overflow-x:auto;}
    .toolbar::-webkit-scrollbar{display:none;}
    .tb-group{display:flex;align-items:center;gap:.15rem;padding-right:.75rem;margin-right:.5rem;border-right:1px solid var(--border);}
    .tb-group:last-child{border-right:none;}
    .tb-btn{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:var(--muted);border-radius:2px;transition:background .15s,color .15s;font-family:'Playfair Display',serif;font-size:.8rem;font-weight:700;}
    .tb-btn:hover{background:var(--paper);color:var(--ink);}
    .tb-word-count{margin-left:auto;font-size:.68rem;color:var(--muted);white-space:nowrap;letter-spacing:.05em;}

    /* layout */
    .editor-wrap{margin-top:calc(var(--topbar-h) + var(--toolbar-h));min-height:calc(100vh - var(--topbar-h) - var(--toolbar-h));display:grid;grid-template-columns:1fr 300px;max-width:1280px;margin-left:auto;margin-right:auto;padding:0 2rem;}
    .writing-area{padding:3.5rem 3rem 3.5rem 0;border-right:1px solid var(--border);}

    /* ── FIX 1: cover zone with file + URL tabs ── */
    .cover-upload-tabs{display:flex;border-bottom:1px solid var(--border);margin-bottom:1rem;}
    .cut{background:none;border:none;cursor:pointer;padding:.4rem 0;margin-right:1.5rem;font-family:'DM Sans',sans-serif;font-size:.68rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);position:relative;transition:color .2s;}
    .cut::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:1.5px;background:var(--ink);transform:scaleX(0);transition:transform .22s;}
    .cut.on{color:var(--ink);}.cut.on::after{transform:scaleX(1);}

    .cover-zone{width:100%;height:200px;border:1.5px dashed var(--border);background:var(--paper);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.75rem;cursor:pointer;margin-bottom:2.5rem;transition:border-color .2s,background .2s;position:relative;overflow:hidden;}
    .cover-zone:hover{border-color:var(--ink);background:var(--cream);}
    .cover-zone.has-img{border-style:solid;}
    .cover-zone img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
    .cover-overlay{position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;opacity:0;transition:opacity .2s;}
    .cover-zone.has-img:hover .cover-overlay{opacity:1;}
    .cover-hint{font-size:.72rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;font-weight:500;text-align:center;}
    .cover-uploading{position:absolute;inset:0;background:rgba(10,10,10,.75);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.75rem;color:#fff;}
    .upload-progress{width:160px;height:3px;background:rgba(255,255,255,.2);border-radius:999px;overflow:hidden;}
    .upload-progress-bar{height:100%;background:var(--red);border-radius:999px;animation:indeterminate 1.2s ease infinite;}
    @keyframes indeterminate{0%{width:0;margin-left:0}50%{width:60%;margin-left:20%}100%{width:0;margin-left:100%}}

    /* URL input tab */
    .url-input-wrap{display:flex;gap:.5rem;margin-bottom:2.5rem;}
    .url-input{flex:1;border:1px solid var(--border);background:var(--white);font-family:'DM Sans',sans-serif;font-size:.875rem;color:var(--ink);padding:.65rem 1rem;outline:none;transition:border-color .2s;border-radius:0;}
    .url-input:focus{border-color:var(--ink);}
    .url-input::placeholder{color:var(--border);}
    .url-apply-btn{background:var(--ink);color:#fff;border:none;font-family:'DM Sans',sans-serif;font-size:.68rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;padding:.65rem 1.1rem;cursor:pointer;transition:background .2s;border-radius:0;}
    .url-apply-btn:hover{background:var(--red);}
    .url-preview{width:100%;height:180px;object-fit:cover;border:1px solid var(--border);margin-bottom:2.5rem;display:block;}
    .url-error{font-size:.72rem;color:#b91c1c;margin-top:.3rem;}

    /* article inputs */
    .title-input{width:100%;font-family:'Playfair Display',serif;font-size:clamp(2rem,4vw,3.2rem);font-weight:900;color:var(--ink);letter-spacing:-.03em;line-height:1.08;border:none;outline:none;background:transparent;resize:none;overflow:hidden;margin-bottom:1rem;}
    .title-input::placeholder{color:var(--border);}
    .subtitle-input{width:100%;font-family:'Lora',serif;font-size:1.15rem;color:var(--muted);font-weight:400;font-style:italic;line-height:1.6;border:none;outline:none;background:transparent;resize:none;overflow:hidden;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1.5px solid var(--border);}
    .subtitle-input::placeholder{color:var(--border);}
    .richtext{min-height:420px;font-family:'Lora',serif;font-size:1.1rem;color:var(--ink);line-height:1.85;outline:none;caret-color:var(--red);}
    .richtext:empty::before{content:attr(data-placeholder);color:var(--border);pointer-events:none;font-style:italic;}
    .richtext h1{font-family:'Playfair Display',serif;font-size:2rem;font-weight:900;margin:1.5rem 0 .75rem;letter-spacing:-.02em;}
    .richtext h2{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;margin:1.2rem 0 .6rem;}
    .richtext h3{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;margin:1rem 0 .5rem;}
    .richtext p{margin-bottom:1.2rem;}
    .richtext blockquote{border-left:3px solid var(--red);padding:.5rem 0 .5rem 1.5rem;margin:1.5rem 0;font-style:italic;color:var(--muted);font-size:1.15rem;}
    .richtext ul,.richtext ol{padding-left:1.5rem;margin-bottom:1.2rem;}
    .richtext li{margin-bottom:.4rem;}
    .richtext a{color:var(--red);text-decoration:underline;}
    .richtext strong{font-weight:700;}.richtext em{font-style:italic;}
    .richtext code{font-family:'Courier New',monospace;font-size:.9em;background:var(--paper);padding:.1em .4em;border:1px solid var(--border);}
    .richtext pre{background:var(--ink);color:#e2e8f0;padding:1.25rem 1.5rem;overflow-x:auto;margin:1.5rem 0;font-size:.88rem;line-height:1.7;font-family:'Courier New',monospace;}
    .richtext hr{border:none;border-top:1.5px solid var(--border);margin:2rem 0;}

    /* right panel */
    .right-panel{padding:3.5rem 0 3.5rem 2.5rem;display:flex;flex-direction:column;gap:2rem;position:sticky;top:calc(var(--topbar-h) + var(--toolbar-h));height:calc(100vh - var(--topbar-h) - var(--toolbar-h));overflow-y:auto;}
    .right-panel::-webkit-scrollbar{width:4px;}.right-panel::-webkit-scrollbar-thumb{background:var(--border);}
    .panel-section{display:flex;flex-direction:column;gap:.75rem;}
    .panel-label{font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);font-weight:500;padding-bottom:.6rem;border-bottom:1px solid var(--border);}
    .readtime-display{display:flex;align-items:center;gap:.6rem;font-size:.82rem;color:var(--ink);font-weight:500;}
    .tags-wrap{display:flex;flex-wrap:wrap;gap:.4rem;padding:.5rem;border:1px solid var(--border);background:var(--white);min-height:42px;cursor:text;}
    .tag-chip{display:flex;align-items:center;gap:.3rem;background:var(--ink);color:#fff;font-size:.62rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;padding:.25rem .6rem;}
    .tag-chip-remove{background:none;border:none;color:rgba(255,255,255,.6);cursor:pointer;font-size:.8rem;line-height:1;padding:0;transition:color .15s;}.tag-chip-remove:hover{color:#fff;}
    .tag-input{border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:.8rem;background:transparent;flex:1;min-width:80px;color:var(--ink);}
    .tag-input::placeholder{color:var(--border);}
    .tag-hint{font-size:.68rem;color:var(--muted);line-height:1.4;}
    .setting-row{display:flex;justify-content:space-between;align-items:center;}
    .setting-label{font-size:.8rem;color:var(--ink);font-weight:500;}
    .setting-sub{font-size:.7rem;color:var(--muted);margin-top:.1rem;}
    .toggle{position:relative;width:38px;height:21px;flex-shrink:0;}
    .toggle input{opacity:0;width:0;height:0;position:absolute;}
    .toggle-track{position:absolute;inset:0;border-radius:999px;background:var(--border);cursor:pointer;transition:background .2s;}
    .toggle input:checked + .toggle-track{background:var(--ink);}
    .toggle-thumb{position:absolute;top:3px;left:3px;width:15px;height:15px;border-radius:50%;background:#fff;transition:transform .2s;pointer-events:none;}
    .toggle input:checked ~ .toggle-thumb{transform:translateX(17px);}
    .publish-btn{width:100%;padding:.9rem;background:var(--red);color:#fff;border:none;font-family:'DM Sans',sans-serif;font-size:.72rem;font-weight:500;letter-spacing:.18em;text-transform:uppercase;cursor:pointer;transition:background .2s;display:flex;align-items:center;justify-content:center;gap:.5rem;}
    .publish-btn:hover:not(:disabled){background:#9e1e16;}.publish-btn:disabled{opacity:.5;cursor:not-allowed;}
    .save-draft-btn{width:100%;padding:.75rem;background:var(--white);color:var(--ink);border:1px solid var(--border);font-family:'DM Sans',sans-serif;font-size:.72rem;font-weight:500;letter-spacing:.18em;text-transform:uppercase;cursor:pointer;transition:all .2s;}
    .save-draft-btn:hover{background:var(--paper);border-color:var(--ink);}

    /* success overlay */
    .success-overlay{position:fixed;inset:0;z-index:999;background:var(--ink);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.5rem;animation:fi .4s ease forwards;}
    @keyframes fi{from{opacity:0}to{opacity:1}}
    .success-overlay h2{font-family:'Playfair Display',serif;font-size:clamp(2.5rem,5vw,4rem);font-weight:900;color:#fff;letter-spacing:-.03em;text-align:center;}
    .success-overlay h2 em{font-style:italic;color:var(--red);}
    .success-overlay p{font-size:.9rem;color:rgba(255,255,255,.5);text-align:center;}
    .success-actions{display:flex;gap:1rem;margin-top:1rem;}
    .s-btn{font-family:'DM Sans',sans-serif;font-size:.72rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;padding:.8rem 1.8rem;cursor:pointer;border-radius:0;transition:all .2s;}
    .s-btn-white{background:#fff;color:var(--ink);border:1px solid #fff;}.s-btn-white:hover{background:var(--paper);}
    .s-btn-ghost{background:none;color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.2);}.s-btn-ghost:hover{border-color:#fff;color:#fff;}
    .toast{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#b91c1c;color:#fff;padding:.75rem 1.5rem;font-size:.8rem;font-weight:500;z-index:500;animation:slideUp .3s ease forwards;max-width:400px;text-align:center;}
    @keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

    /* Draft saved success banner */
    .draft-saved-banner{
      position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);
      background:var(--bg-nav, #0a0a0a);color:#fff;
      padding:.8rem 1.5rem;font-size:.8rem;font-weight:500;
      z-index:501;animation:slideUp .3s ease forwards;
      display:flex;align-items:center;gap:.75rem;
      border:1px solid rgba(34,197,94,.3);
      box-shadow:0 8px 24px rgba(0,0,0,.25);
      max-width:480px;white-space:nowrap;
    }
    .draft-saved-banner svg{flex-shrink:0;}
    .draft-saved-banner strong{color:#4ade80;margin-right:.2rem;}
    .draft-saved-banner a{
      margin-left:.75rem;font-size:.72rem;letter-spacing:.08em;
      color:rgba(255,255,255,.5);text-decoration:underline;cursor:pointer;
    }
    .draft-saved-banner a:hover{color:#fff;}
    .spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}
    @keyframes spin{to{transform:rotate(360deg)}}
    .loading-overlay{position:fixed;inset:0;background:var(--cream);display:flex;align-items:center;justify-content:center;z-index:999;flex-direction:column;gap:1rem;}
    .loading-overlay p{font-size:.8rem;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    .page-enter{animation:fadeUp .4s ease forwards;}
    @media(max-width:900px){.editor-wrap{grid-template-columns:1fr;}.right-panel{position:static;height:auto;border-top:1px solid var(--border);padding:2rem 0;}.writing-area{border-right:none;padding:2rem 0;}}
  `}</style>
);

// ── Helpers ───────────────────────────────────────────────────────
function countWords(html) {
  const t = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return t ? t.split(" ").length : 0;
}
function extractImageUrls(html) {
  const urls = Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi), m => m[1]);
  return [...new Set(urls)];
}
function readTime(w) { return Math.max(1, Math.round(w / 200)); }
function execCmd(cmd, val) { document.execCommand(cmd, false, val || null); }

const TOOLBAR = [
  [{ l:"B",cmd:"bold"},{l:"I",cmd:"italic"},{l:"U",cmd:"underline"},{l:"S",cmd:"strikeThrough"}],
  [{ l:"H1",cmd:"formatBlock",val:"h1"},{l:"H2",cmd:"formatBlock",val:"h2"},{l:"H3",cmd:"formatBlock",val:"h3"},{l:"¶",cmd:"formatBlock",val:"p"}],
  [{ l:"❝",cmd:"formatBlock",val:"blockquote"},{l:"—",cmd:"insertHorizontalRule"},{l:"{}",cmd:"formatBlock",val:"pre"}],
  [{ l:"≡",cmd:"insertUnorderedList"},{l:"1.",cmd:"insertOrderedList"}],
  [{ l:"←",cmd:"outdent"},{l:"→",cmd:"indent"}],
];

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-track" /><span className="toggle-thumb" />
    </label>
  );
}

function TagInput({ tags, onChange, label = "Tags", placeholder = "Add tag…", maxCount = 5 }) {
  const [input, setInput] = useState("");
  const ref = useRef();
  const add = (raw) => {
    const t = raw.trim().replace(/^#/, "").replace(/\s+/g, "-");
    if (!t || tags.includes(t) || tags.length >= maxCount) return;
    onChange([...tags, t]);
  };
  return (
    <>
      <div className="tags-wrap" onClick={() => ref.current?.focus()}>
        {tags.map(t => (
          <span key={t} className="tag-chip">{t}
            <button className="tag-chip-remove" onClick={() => onChange(tags.filter(x => x !== t))}>×</button>
          </span>
        ))}
        <input ref={ref} className="tag-input" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (["Enter", ",", " "].includes(e.key)) { e.preventDefault(); add(input); setInput(""); }
            if (e.key === "Backspace" && !input && tags.length) onChange(tags.slice(0, -1));
          }}
          onBlur={() => { if (input) { add(input); setInput(""); } }}
          placeholder={tags.length < maxCount ? placeholder : ""}
          disabled={tags.length >= maxCount}
        />
      </div>
      <p className="tag-hint">Press Enter or comma to add · Max {maxCount} {label.toLowerCase()}.</p>
    </>
  );
}

// ── FIX 1: Cover upload with File + URL tabs ──────────────────────
function CoverUploader({ coverUrl, setCoverUrl, uploading, setUploading }) {
  const [tab, setTab]           = useState("file"); // "file" | "url"
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [coverLocal, setCoverLocal] = useState("");
  const fileRef = useRef();

  // file upload
const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUrlError("");
    const local = URL.createObjectURL(file);
    setCoverLocal(local);
    setUploading(true);
    try {
      const url = await uploadImage(file, "cover");
      setCoverUrl(url);
      setCoverLocal("");
      URL.revokeObjectURL(local);
    } catch (err) {
      // 🟩 FIX: Don't set the database URL to a local blob. Alert the user instead!
      console.error(err);
      alert("Image upload failed. Please try again or use a direct URL.");
      setCoverLocal(""); 
      URL.revokeObjectURL(local);
    } finally { setUploading(false); }
  };
  const displayCover = coverLocal || coverUrl;

const handleUrlSubmit = () => {
  if (!urlInput.trim()) {
    setUrlError("Please enter a valid image URL");
    return;
  }
  
  if (!urlInput.startsWith("http://") && !urlInput.startsWith("https://")) {
    setUrlError("URL must start with http:// or https://");
    return;
  }

  setUrlError("");
  setCoverUrl(urlInput.trim()); // Successfully updates the image state!
};
const displayCover = coverLocal || coverUrl;
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      {/* Tabs */}
      <div className="cover-upload-tabs">
        <button className={`cut ${tab === "file" ? "on" : ""}`} onClick={() => setTab("file")}>Upload File</button>
        <button className={`cut ${tab === "url"  ? "on" : ""}`} onClick={() => setTab("url")}>Image URL</button>
      </div>

      {tab === "file" ? (
        <>
          <div
            className={`cover-zone ${displayCover ? "has-img" : ""}`}
            onClick={() => !uploading && fileRef.current?.click()}
          >
            {displayCover && <img src={displayCover} alt="cover" />}
            {uploading && (
              <div className="cover-uploading">
                <div className="upload-progress"><div className="upload-progress-bar" /></div>
                <span style={{ fontSize: ".7rem", letterSpacing: ".1em", textTransform: "uppercase" }}>Uploading to Cloudinary…</span>
              </div>
            )}
            {!displayCover && !uploading && (
              <>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <span className="cover-hint">Click to upload cover image</span>
                <span style={{ fontSize: ".65rem", color: "var(--border)" }}>JPG, PNG, WebP · Max 8MB · Stored on Cloudinary</span>
              </>
            )}
            {displayCover && !uploading && (
              <div className="cover-overlay">
                <span style={{ color: "#fff", fontSize: ".72rem", letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 500 }}>Change Cover</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        </>
      ) : (
        <>
          <div className="url-input-wrap">
  <input
    className="url-input"
    type="url"
    placeholder="https://example.com/image.jpg"
    value={urlInput}
    onChange={e => { setUrlInput(e.target.value); setUrlError(""); }}
    
    // 🔮 FIXED: applyUrl() ki jagah handleUrlSubmit() kar diya
    onKeyDown={e => e.key === "Enter" && handleUrlSubmit()} 
  />
  
  {/* 🔮 FIXED: applyUrl ki jagah handleUrlSubmit kar diya */}
  <button className="url-apply-btn" onClick={handleUrlSubmit}>Apply</button>
</div>
          {urlError && <p className="url-error">{urlError}</p>}
          {coverUrl && !urlError && (
            <img
              className="url-preview"
              src={coverUrl}
              alt="preview"
              onError={() => { setUrlError("Could not load image from this URL."); setCoverUrl(""); }}
            />
          )}
          {!coverUrl && (
            <div className="cover-zone" style={{ cursor: "default" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              <span className="cover-hint">Enter a URL above and click Apply</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main Editor ───────────────────────────────────────────────────
export default function Editor() {
  const navigate             = useNavigate();
  const [searchParams]       = useSearchParams();

  // FIX 2 & 3: read ?id= to detect edit mode — always PUT if id exists
  const editId               = searchParams.get("id"); // null = new post
  const isEditMode           = Boolean(editId);

  const [title,      setTitle]      = useState("");
  const [subtitle,   setSubtitle]   = useState("");
  const [tags,       setTags]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [published,  setPublished]  = useState(true);
  const [coverUrl,   setCoverUrl]   = useState("");
  const [uploading,  setUploading]  = useState(false);
  const [wordCount,  setWordCount]  = useState(0);
  const [saveStatus, setSaveStatus] = useState("unsaved");
  const [loading,    setLoading]    = useState(false);       // publish spinner
  const [fetching,   setFetching]   = useState(isEditMode);  // loading existing post
  const [success,    setSuccess]    = useState(false);
  const [toast,      setToast]      = useState("");
  // FIX 3: single source of truth for the post id — never create duplicates
  const [postId,     setPostId]     = useState(editId || null);

  const editorRef = useRef();
  const titleRef  = useRef();
  const autoTimer = useRef();

  const autoResize = (el) => { if (!el) return; el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; };
  const showToast  = (msg) => { setToast(msg); setTimeout(() => setToast(""), 4000); };

  // ── FIX 2: load existing post when ?id= is present ──────────────
  // Store fetched content here because editorRef.current is null
  // while the loading overlay is shown. We inject it after fetching
  // completes and the contentEditable div actually mounts.
  const pendingContent = useRef("");

  useEffect(() => {
    if (!editId) return;
    (async () => {
      
      try {
        const { data } = await API.get(`/blogs/${editId}`);
        setTitle(data.title || "");
        setSubtitle(data.subtitle || "");
        setTags(data.tags || []);
        setPublished(data.published ?? true);
        setCoverUrl(data.banner || "");
        setPostId(data._id);
        // Store content — can't inject yet because editorRef.current is null
        // while <loading-overlay> is rendered instead of the editor
        pendingContent.current = data.content || "";
        setWordCount(countWords(data.content || ""));
      } catch {
        showToast("Could not load post for editing.");
      } finally {
        setFetching(false); // triggers the useEffect below
      }
    })();
  }, [editId]);

  // Inject stored content into contentEditable once the editor DOM mounts
  // (i.e. right after fetching becomes false and the real editor renders)
  useEffect(() => {
    if (fetching) return;            // still loading — editor not mounted yet
    if (!pendingContent.current) return; // nothing to inject
    // Small timeout ensures the contentEditable div has rendered
    const t = setTimeout(() => {
      if (editorRef.current && pendingContent.current) {
        editorRef.current.innerHTML = pendingContent.current;
        pendingContent.current = ""; // clear so it doesn't re-inject on re-renders
      }
    }, 0);
    return () => clearTimeout(t);
  }, [fetching]);

  const handleEditorInput = () => {
    const html = editorRef.current?.innerHTML || "";
    setWordCount(countWords(html));
    setSaveStatus("unsaved");
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(saveDraft, 8000);
  };

  const getPayload = (pub) => {
    const content = editorRef.current?.innerHTML || "";
    return {
      title:      title.trim(),
      subtitle:   subtitle.trim(),
      content,
      tags,
      categories,
      images:     extractImageUrls(content),
      readTime:   readTime(wordCount),
      banner:     coverUrl,
      published:  pub,
    };
  };

  // ── FIX 3: always PUT if postId exists, POST only for brand-new posts ──
  // ── DRAFT FIX: saved:true state for UI feedback + success toast ─────────
  const [draftSaved, setDraftSaved] = useState(false); // shows draft success banner

  const saveDraft = useCallback(async () => {
    const contentText = editorRef.current?.innerText?.trim() || "";
    const titleText = title.trim();
    if (!titleText && !contentText && !subtitle.trim() && !coverUrl && !tags.length && !categories.length) return;

    setSaveStatus("saving");
    setDraftSaved(false);
    try {
      if (postId) {
        await API.put(`/blogs/${postId}`, getPayload(false));
      } else {
        const { data } = await API.post("/blogs", getPayload(false));
        setPostId(data._id);
      }
      setSaveStatus("saved");
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 4000);
    } catch (err) {
      setSaveStatus("unsaved");
      setToast(err.response?.data?.message || "Draft save failed. Are you logged in?");
      setTimeout(() => setToast(""), 4000);
    }
  }, [title, subtitle, tags, categories, coverUrl, postId]);

  const handlePublish = async () => {
    if (!title.trim()) { showToast("Add a title before publishing."); return; }
    if (!editorRef.current?.innerText?.trim()) { showToast("Your story is empty!"); return; }
    if (uploading) { showToast("Cover image is still uploading — please wait."); return; }
    setLoading(true);
    try {
      if (postId) {
        await API.put(`/blogs/${postId}`, getPayload(true));
      } else {
        const { data } = await API.post("/blogs", getPayload(true));
        setPostId(data._id);
      }
      setSuccess(true);
    } catch (err) {
      showToast(err.response?.data?.message || "Publish failed. Are you logged in?");
    } finally { setLoading(false); }
  };

  const handleSaveDraft = async () => {
    const contentText = editorRef.current?.innerText?.trim() || "";
    if (!title.trim() && !contentText && !subtitle.trim() && !coverUrl && !tags.length && !categories.length) {
      showToast("Write something before saving as draft!");
      return;
    }
    if (uploading) { showToast("Cover image is still uploading — please wait."); return; }
    await saveDraft();
  };

  const resetEditor = () => {
    setSuccess(false); setTitle(""); setSubtitle(""); setTags([]);
    setCoverUrl(""); setPostId(null); setWordCount(0); setSaveStatus("unsaved");
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  useEffect(() => () => clearTimeout(autoTimer.current), []);

  useEffect(() => {
    if (saveStatus !== "unsaved") return;
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(saveDraft, 8000);
    return () => clearTimeout(autoTimer.current);
  }, [title, subtitle, tags, categories, coverUrl, saveStatus, saveDraft]);

  const rt = readTime(wordCount);

  // ── Loading overlay while fetching existing post ─────────────────
  if (fetching) return (
    <>
      <Styles />
      <div className="loading-overlay">
        <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3, borderColor: "rgba(10,10,10,.15)", borderTopColor: "var(--ink)" }} />
        <p>Loading post…</p>
      </div>
    </>
  );

  return (
    <>
      <Styles />

      {/* SUCCESS OVERLAY */}
      {success && (
        <div className="success-overlay">
          <div style={{ fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--red)", marginBottom: ".5rem" }}>
            {isEditMode ? "Updated ✦" : "Published ✦"}
          </div>
          <h2>{isEditMode ? <>Changes <em>saved.</em></> : <>Your story is <em>live.</em></>}</h2>
          <p>{isEditMode ? "Your post has been updated successfully." : "It's out there now. Go share it with the world."}</p>
          <div className="success-actions">
            <button className="s-btn s-btn-white" onClick={() => navigate(postId ? `/blog/${postId}` : "/")}>
              {isEditMode ? "View Post" : "View Feed"}
            </button>
            {!isEditMode && (
              <button className="s-btn s-btn-ghost" onClick={resetEditor}>Write Another</button>
            )}
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}

      {/* Draft saved success banner */}
      {draftSaved && (
        <div className="draft-saved-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span><strong>Draft saved!</strong> Visible only to you in your Drafts tab.</span>
          <a onClick={() => navigate("/profile/" + (JSON.parse(localStorage.getItem("bs_user") || "{}").handle || ""))}>
            View Drafts →
          </a>
        </div>
      )}

      {/* TOP BAR */}
      <div className="topbar">
        <div className="topbar-left">
          <Link to="/" className="topbar-logo">Blog<span>Sync</span></Link>
          <div className="topbar-divider" />
          <span className="topbar-label">{isEditMode ? "Edit Story" : "New Story"}</span>
        </div>
        <div className="topbar-right">
          <ThemeToggle />
          <div className="status-pill">
            <span className={`status-dot ${saveStatus}`} />
            {saveStatus === "saved" ? "Draft saved" : saveStatus === "saving" ? "Saving…" : "Unsaved"}
          </div>
          <button className="topbar-btn btn-ghost" onClick={handleSaveDraft} disabled={saveStatus === "saving"}>
            {saveStatus === "saving" ? "Saving…" : "Save Draft"}
          </button>
          <button className="topbar-btn btn-publish" onClick={handlePublish} disabled={loading || uploading}>
            {loading
              ? <><div className="spinner" style={{ width: 12, height: 12, display: "inline-block" }} /> {isEditMode ? "Updating…" : "Publishing…"}</>
              : isEditMode ? "Update Post →" : "Publish →"}
          </button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        {TOOLBAR.map((group, gi) => (
          <div key={gi} className="tb-group">
            {group.map(item => (
              <button key={item.l} className="tb-btn"
                style={item.l === "B" ? { fontWeight: 700 } : item.l === "I" ? { fontStyle: "italic" } : {}}
                onMouseDown={e => { e.preventDefault(); editorRef.current?.focus(); execCmd(item.cmd, item.val); }}
                title={item.cmd}>
                {item.l}
              </button>
            ))}
          </div>
        ))}
        <div className="tb-group">
          <button className="tb-btn" title="Link"
            onMouseDown={e => { e.preventDefault(); const u = prompt("URL:"); if (u) execCmd("createLink", u); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </button>
        </div>
        <div className="tb-group">
          {[{ l: "⟵", c: "justifyLeft" }, { l: "≡", c: "justifyCenter" }, { l: "⟶", c: "justifyRight" }].map(a => (
            <button key={a.l} className="tb-btn" onMouseDown={e => { e.preventDefault(); execCmd(a.c); }}>{a.l}</button>
          ))}
        </div>
        <span className="tb-word-count">{wordCount} words · {rt} min read</span>
      </div>

      {/* EDITOR BODY */}
      <div className="editor-wrap page-enter">
        <div className="writing-area">

          {/* FIX 1: Cover with file + URL tabs */}
          <CoverUploader
            coverUrl={coverUrl}
            setCoverUrl={(url) => { setCoverUrl(url); setSaveStatus("unsaved"); }}
            uploading={uploading}
            setUploading={setUploading}
          />

          {/* Title */}
          <textarea ref={titleRef} className="title-input" placeholder="Your headline here…"
            value={title} rows={1}
            onChange={e => { setTitle(e.target.value); autoResize(e.target); setSaveStatus("unsaved"); }}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); document.querySelector(".subtitle-input")?.focus(); } }}
          />

          {/* Subtitle */}
          <textarea className="subtitle-input" placeholder="Add a subtitle or short description…"
            value={subtitle} rows={2}
            onChange={e => { setSubtitle(e.target.value); autoResize(e.target); setSaveStatus("unsaved"); }}
          />

          {/* Rich text body */}
          <div
            ref={editorRef}
            className="richtext"
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Tell your story…"
            onInput={handleEditorInput}
            onPaste={e => {
              e.preventDefault();
              const t = e.clipboardData.getData("text/plain");
              document.execCommand("insertText", false, t);
            }}
          />
        </div>

        {/* Right panel */}
        <div className="right-panel">
          <div className="panel-section">
            <div className="panel-label">Story Stats</div>
            <div className="readtime-display">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {rt} min read · {wordCount} words
            </div>
            {wordCount > 0 && (
              <div style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: ".2rem" }}>
                {wordCount < 300 ? "Keep going — great stories need space."
                  : wordCount < 800  ? "Good length for a quick read."
                  : wordCount < 1500 ? "Solid long-form territory."
                  : "Epic deep-dive. Readers will love it."}
              </div>
            )}
          </div>

          {/* Cover status */}
          {(coverUrl || uploading) && (
            <div className="panel-section">
              <div className="panel-label">Cover Image</div>
              <div style={{ fontSize: ".78rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: ".5rem" }}>
                {uploading ? (
                  <><div className="spinner" style={{ width: 12, height: 12, borderColor: "rgba(0,0,0,.15)", borderTopColor: "var(--muted)" }} /> Uploading…</>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ color: "#15803d", fontWeight: 500 }}>Cover set</span>
                    <button onClick={() => setCoverUrl("")}
                      style={{ marginLeft: "auto", background: "none", border: "none", fontSize: ".68rem", color: "var(--muted)", cursor: "pointer", textDecoration: "underline" }}>
                      Remove
                    </button>
                  </>
                )}
              </div>
              {coverUrl && !uploading && (
                <img
                  src={coverUrl.includes("cloudinary.com") ? cloudinaryUrl(coverUrl, "w_260,h_80,c_fill,f_auto,q_auto") : coverUrl}
                  alt="cover preview"
                  style={{ width: "100%", height: 80, objectFit: "cover", border: "1px solid var(--border)" }}
                />
              )}
            </div>
          )}

          <div className="panel-section">
            <div className="panel-label">Tags</div>
            <TagInput tags={tags} onChange={(next) => { setTags(next); setSaveStatus("unsaved"); }} />
          </div>

          <div className="panel-section">
            <div className="panel-label">Categories</div>
            <TagInput tags={categories} onChange={(next) => { setCategories(next); setSaveStatus("unsaved"); }}
              placeholder="Add category…" label="Categories" maxCount={3}
            />
          </div>

          <div className="panel-section">
            <div className="panel-label">Settings</div>
            <div className="setting-row">
              <div>
                <div className="setting-label">Publish immediately</div>
                <div className="setting-sub">Make visible to all readers</div>
              </div>
              <Toggle checked={published} onChange={setPublished} />
            </div>
          </div>

          <div className="panel-section">
            <div className="panel-label">Actions</div>
            <button className="publish-btn" onClick={handlePublish} disabled={loading || uploading}>
              {loading
                ? <><div className="spinner" /> {isEditMode ? "Updating…" : "Publishing…"}</>
                : uploading ? "Waiting for upload…"
                : isEditMode ? "Update Post →"
                : published  ? "Publish Story →" : "Save as Draft →"}
            </button>
            <button className="save-draft-btn" onClick={handleSaveDraft} disabled={saveStatus === "saving" || uploading}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:".5rem" }}>
              {saveStatus === "saving"
                ? <><div className="spinner" style={{ borderColor:"rgba(10,10,10,.15)", borderTopColor:"var(--ink)", width:12, height:12 }}/> Saving…</>
                : "Save as Draft"
              }
            </button>
          </div>

          <div className="panel-section">
            <div className="panel-label">Writing Tips</div>
            {[
              "Start with the most interesting sentence.",
              "Use short paragraphs — readers scan.",
              "One idea per paragraph.",
              "Read it out loud before publishing.",
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: ".6rem", fontSize: ".78rem", color: "var(--muted)", lineHeight: 1.5 }}>
                <span style={{ color: "var(--red)", flexShrink: 0, fontWeight: 700 }}>0{i + 1}</span>{tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

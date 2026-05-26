import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { follow as followUser, unfollow as unfollowUser, onFollowUpdate } from "../utils/followService";
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

const getUser = () => {
  try { return JSON.parse(localStorage.getItem("bs_user") || sessionStorage.getItem("bs_user") || "null"); }
  catch { return null; }
};
function timeAgo(iso) {
  const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (d === 0) return "Today"; if (d === 1) return "Yesterday";
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function avatarColor(h = "") {
  const p = ["#c8281e","#1d4ed8","#059669","#7c3aed","#b45309","#0e7490","#be185d"];
  let n = 0; for (let c of h) n = (n * 31 + c.charCodeAt(0)) % p.length; return p[n];
}
function initials(u) { return `${u?.firstName?.[0] || ""}${u?.lastName?.[0] || ""}`.toUpperCase(); }

const MOCK_PROFILE = {
  _id: "auth1", firstName: "Elena", lastName: "Marsh", handle: "elenamarsh",
  bio: "Writer, editor, and chronic overthinker. I write about craft, creativity, and the slow art of paying attention. Previously at The Atlantic.",
  avatar: "", createdAt: new Date("2024-03-15").toISOString(), followers: 1240, following: 87,
};
const MOCK_POSTS = [
  { _id:"p1", title:"The Art of Writing in the Age of Distraction", tags:["Writing","Creativity"], readTime:6, views:4284, likes:Array(12).fill("x"), createdAt:new Date(Date.now()-86400000*2).toISOString(), published:true },
  { _id:"p2", title:"Why Your Blog Needs a Point of View", tags:["Strategy"], readTime:4, views:2800, likes:Array(7).fill("x"), createdAt:new Date(Date.now()-86400000*12).toISOString(), published:true },
  { _id:"p3", title:"Minimalism in Technical Writing", tags:["Tech","Writing"], readTime:5, views:1950, likes:Array(5).fill("x"), createdAt:new Date(Date.now()-86400000*20).toISOString(), published:true },
  { _id:"p4", title:"On Reading Slowly in a Fast World", tags:["Reading"], readTime:7, views:3100, likes:Array(8).fill("x"), createdAt:new Date(Date.now()-86400000*35).toISOString(), published:false },
];

// ─────────────────────────────────────────────────────────────────
//  Fix 4 — Themed Delete Confirmation Dialog (no window.confirm)
// ─────────────────────────────────────────────────────────────────
function DeleteDialog({ post, onConfirm, onCancel }) {
  // Trap focus inside dialog
  const cancelRef = useRef();
  useEffect(() => { cancelRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onCancel]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 600,
        background: "rgba(10,10,10,.72)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        animation: "bs-fade-in .2s ease",
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div style={{
        background: "var(--cream)",
        border: "1px solid var(--border)",
        width: "100%", maxWidth: 440,
        animation: "bs-slide-up .22s ease",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Header */}
        <div style={{
          background: "var(--ink)", padding: "1.2rem 1.5rem",
          display: "flex", alignItems: "center", gap: ".85rem",
        }}>
          {/* Warning icon */}
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(200,40,30,.2)",
            border: "1px solid rgba(200,40,30,.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#c8281e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.1rem", fontWeight: 700, color: "#fff",
              letterSpacing: "-.01em",
            }}>
              Delete Story
            </div>
            <div style={{ fontSize: ".7rem", color: "rgba(255,255,255,.4)", marginTop: ".1rem" }}>
              This action cannot be undone
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "1.6rem 1.5rem" }}>
          <p style={{ fontSize: ".875rem", color: "var(--muted)", lineHeight: 1.65, marginBottom: "1rem" }}>
            You're about to permanently delete:
          </p>
          <div style={{
            background: "var(--paper)", border: "1px solid var(--border)",
            padding: ".85rem 1rem", marginBottom: "1.4rem",
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1rem", fontWeight: 700, color: "var(--ink)",
              lineHeight: 1.3,
            }}>
              {post.title}
            </div>
            <div style={{ fontSize: ".7rem", color: "var(--muted)", marginTop: ".3rem" }}>
              {post.views?.toLocaleString()} views · {post.likes?.length || 0} likes · {post.readTime} min read
            </div>
          </div>
          <p style={{ fontSize: ".8rem", color: "var(--muted)" }}>
            Once deleted, this story and all its comments will be gone forever.
          </p>
        </div>

        {/* Footer */}
        <div style={{
          padding: ".9rem 1.5rem",
          borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "flex-end", gap: ".65rem",
        }}>
          <button
            ref={cancelRef}
            onClick={onCancel}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: ".68rem", fontWeight: 500,
              letterSpacing: ".13em", textTransform: "uppercase",
              padding: ".6rem 1.2rem",
              background: "none", border: "1px solid var(--border)",
              color: "var(--muted)", cursor: "pointer",
              transition: "all .18s", borderRadius: 0,
            }}
            onMouseEnter={e => { e.target.style.borderColor = "var(--ink)"; e.target.style.color = "var(--ink)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--muted)"; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: ".68rem", fontWeight: 500,
              letterSpacing: ".13em", textTransform: "uppercase",
              padding: ".6rem 1.4rem",
              background: "var(--red)", border: "1px solid var(--red)",
              color: "#fff", cursor: "pointer",
              transition: "background .18s", borderRadius: 0,
              display: "flex", alignItems: "center", gap: ".4rem",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#9e1e16"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--red)"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Yes, Delete It
          </button>
        </div>
      </div>

      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes bs-fade-in  { from{opacity:0}           to{opacity:1} }
        @keyframes bs-slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────────────────────────
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Lora:ital,wght@0,400;1,400&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{--ink:#0a0a0a;--cream:#faf7f2;--paper:#f5f0e8;--red:#c8281e;--muted:#6b6560;--border:#d8d0c4;--white:#fff;}
    html{scroll-behavior:smooth;}body{background:var(--cream);font-family:'DM Sans',sans-serif;color:var(--ink);}
    a{text-decoration:none;color:inherit;}

    .nav{position:sticky;top:0;z-index:100;background:var(--ink);border-bottom:1px solid rgba(255,255,255,.08);}
    .nav-inner{max-width:1100px;margin:0 auto;padding:0 2rem;display:flex;align-items:center;justify-content:space-between;height:56px;}
    .nav-logo{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:900;color:#fff;letter-spacing:-.02em;}
    .nav-logo span{color:var(--red);}
    .nav-right{display:flex;gap:.75rem;}
    .nav-btn{font-family:'DM Sans',sans-serif;font-size:.68rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;padding:.4rem .9rem;cursor:pointer;border-radius:0;transition:all .2s;}
    .ng{background:none;border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.65);}.ng:hover{border-color:#fff;color:#fff;}
    .nr{background:var(--red);border:1px solid var(--red);color:#fff;}.nr:hover{background:#9e1e16;}

    .banner{height:220px;background:var(--ink);position:relative;overflow:hidden;}
    .banner::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.04) 39px,rgba(255,255,255,.04) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.04) 39px,rgba(255,255,255,.04) 40px);}
    .banner::after{content:'';position:absolute;bottom:-80px;right:-80px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(200,40,30,.22) 0%,transparent 70%);}
    .page-wrap{max-width:1100px;margin:0 auto;padding:0 2rem;}

    .avatar-wrap{position:relative;display:inline-block;margin-top:-56px;}
    .profile-av{width:112px;height:112px;border-radius:50%;border:4px solid var(--cream);position:relative;z-index:1;overflow:hidden;display:flex;align-items:center;justify-content:center;}
    .profile-av img{width:100%;height:100%;object-fit:cover;}
    .profile-av-initials{font-family:'Playfair Display',serif;font-size:2.2rem;font-weight:900;color:#fff;}
    .av-uploading{position:absolute;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;border-radius:50%;z-index:2;}
    .av-spinner{width:22px;height:22px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}
    @keyframes spin{to{transform:rotate(360deg)}}
    .av-edit{position:absolute;bottom:4px;right:4px;z-index:3;width:28px;height:28px;border-radius:50%;background:var(--ink);border:2px solid var(--cream);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s;}
    .av-edit:hover{background:var(--red);}

    .main-row{display:flex;justify-content:space-between;align-items:flex-end;padding:1.5rem 0 0;gap:1rem;flex-wrap:wrap;}
    .profile-name{font-family:'Playfair Display',serif;font-size:2.2rem;font-weight:900;letter-spacing:-.03em;margin-bottom:.2rem;}
    .profile-handle{font-size:.78rem;color:var(--muted);margin-bottom:.65rem;}
    .profile-bio{font-family:'Lora',serif;font-size:.95rem;color:var(--muted);line-height:1.65;max-width:540px;}
    .profile-joined{font-size:.7rem;color:var(--border);margin-top:.45rem;}
    .p-actions{display:flex;gap:.75rem;align-items:center;flex-shrink:0;}
    .pb{font-family:'DM Sans',sans-serif;font-size:.68rem;font-weight:500;letter-spacing:.13em;text-transform:uppercase;padding:.55rem 1.2rem;cursor:pointer;border-radius:0;transition:all .2s;}
    .pb-solid{background:var(--ink);color:#fff;border:1px solid var(--ink);}.pb-solid:hover{background:var(--red);border-color:var(--red);}
    .pb-solid.on{background:none;color:var(--ink);border:1px solid var(--border);}.pb-solid.on:hover{border-color:var(--red);color:var(--red);}
    .pb-out{background:none;border:1px solid var(--border);color:var(--muted);}.pb-out:hover{border-color:var(--ink);color:var(--ink);}

    .stats-bar{display:flex;gap:2.5rem;padding:1.5rem 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin:1.5rem 0;flex-wrap:wrap;}
    .stat-n{font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:900;line-height:1;}
    .stat-l{font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-top:.2rem;}

    .tabs{display:flex;border-bottom:1.5px solid var(--border);margin-bottom:2rem;}
    .tab{background:none;border:none;cursor:pointer;padding:.65rem 0;margin-right:2rem;font-family:'DM Sans',sans-serif;font-size:.72rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);position:relative;transition:color .2s;}
    .tab::after{content:'';position:absolute;bottom:-1.5px;left:0;right:0;height:1.5px;background:var(--ink);transform:scaleX(0);transition:transform .25s;}
    .tab.on{color:var(--ink);}.tab.on::after{transform:scaleX(1);}

    .post-row{display:grid;grid-template-columns:1fr 100px;gap:1.5rem;padding:1.5rem 0;border-bottom:1px solid var(--border);cursor:pointer;align-items:start;transition:opacity .18s;}
    .post-row:hover{opacity:.85;}.post-row:hover .pr-title{color:var(--red);}
    .pr-tag{font-size:.6rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:.2rem .6rem;background:var(--paper);color:var(--muted);border:1px solid var(--border);display:inline-block;margin-bottom:.5rem;margin-right:.3rem;}
    .pr-draft{background:var(--ink);color:#fff;border-color:var(--ink);}
    .pr-title{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;color:var(--ink);line-height:1.25;letter-spacing:-.01em;margin-bottom:.5rem;transition:color .18s;}
    .pr-meta{font-size:.72rem;color:var(--muted);display:flex;align-items:center;gap:.8rem;flex-wrap:wrap;}
    .pr-stat{display:flex;align-items:center;gap:.3rem;}
    .pr-thumb{width:100px;height:76px;border:1px solid var(--border);overflow:hidden;flex-shrink:0;background:var(--paper);display:flex;align-items:center;justify-content:center;}
    .pr-thumb img{width:100%;height:100%;object-fit:cover;}
    .pr-thumb-ph{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:900;opacity:.1;}
    .oa{display:flex;gap:.5rem;margin-top:.75rem;}
    .mb{font-size:.62rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;padding:.3rem .7rem;cursor:pointer;border-radius:0;transition:all .18s;font-family:'DM Sans',sans-serif;}
    .mb-edit{background:none;border:1px solid var(--border);color:var(--muted);}.mb-edit:hover{border-color:var(--ink);color:var(--ink);}
    .mb-del{background:none;border:1px solid transparent;color:var(--muted);}.mb-del:hover{border-color:var(--red);color:var(--red);}

    .empty{text-align:center;padding:4rem 0;}
    .empty h3{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:700;margin-bottom:.5rem;}
    .empty p{font-size:.875rem;color:var(--muted);margin-bottom:1.5rem;}

    /* Edit Profile modal */
    .modal-back{position:fixed;inset:0;z-index:500;background:rgba(10,10,10,.72);display:flex;align-items:center;justify-content:center;padding:1rem;animation:bs-fade-in .2s ease;}
    .modal{background:var(--cream);border:1px solid var(--border);width:100%;max-width:520px;max-height:90vh;overflow-y:auto;animation:bs-slide-up .25s ease;}
    .modal-head{background:var(--ink);padding:1.25rem 1.5rem;display:flex;justify-content:space-between;align-items:center;}
    .modal-title{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;color:#fff;}
    .modal-x{background:none;border:none;color:rgba(255,255,255,.5);font-size:1.2rem;cursor:pointer;padding:0;line-height:1;transition:color .15s;}.modal-x:hover{color:#fff;}
    .modal-body{padding:1.75rem 1.5rem;display:flex;flex-direction:column;gap:1.1rem;}
    .mf{display:flex;flex-direction:column;gap:.35rem;}
    .ml{font-size:.62rem;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);font-weight:500;}
    .mi,.mta{border:1px solid var(--border);background:var(--white);font-family:'DM Sans',sans-serif;font-size:.9rem;color:var(--ink);padding:.65rem .9rem;outline:none;transition:border-color .2s;border-radius:0;}
    .mi:focus,.mta:focus{border-color:var(--ink);}
    .mta{resize:vertical;min-height:90px;font-family:'Lora',serif;}
    .mr{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
    .modal-foot{padding:1rem 1.5rem;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:.75rem;}
    .m-save{font-family:'DM Sans',sans-serif;font-size:.7rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;padding:.65rem 1.4rem;background:var(--ink);color:#fff;border:none;cursor:pointer;transition:background .2s;border-radius:0;}
    .m-save:hover:not(:disabled){background:var(--red);}.m-save:disabled{opacity:.5;cursor:not-allowed;}
    .m-cancel{font-family:'DM Sans',sans-serif;font-size:.7rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;padding:.65rem 1.4rem;background:none;color:var(--muted);border:1px solid var(--border);cursor:pointer;transition:all .2s;border-radius:0;}
    .m-cancel:hover{border-color:var(--ink);color:var(--ink);}

    .sk{background:var(--border);border-radius:2px;animation:pulse 1.4s ease infinite;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    .fade-in{animation:fadeUp .35s ease forwards;}
    @media(max-width:700px){.stats-bar{gap:1.5rem;}.post-row{grid-template-columns:1fr;}.pr-thumb{display:none;}.mr{grid-template-columns:1fr;}}
  `}</style>
);

// ─────────────────────────────────────────────────────────────────
//  Edit Profile Modal
// ─────────────────────────────────────────────────────────────────
function EditModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({
    firstName: profile.firstName || "", lastName: profile.lastName || "",
    handle: profile.handle || "", bio: profile.bio || "",
  });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try { const { data } = await API.put("/users/me", form); onSave(data); }
    catch { onSave({ ...profile, ...form }); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-back" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <span className="modal-title">Edit Profile</span>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="mr">
            <div className="mf"><label className="ml">First Name</label><input className="mi" value={form.firstName} onChange={set("firstName")} /></div>
            <div className="mf"><label className="ml">Last Name</label><input className="mi" value={form.lastName} onChange={set("lastName")} /></div>
          </div>
          <div className="mf"><label className="ml">Handle</label><input className="mi" value={form.handle} onChange={set("handle")} placeholder="@yourname" /></div>
          <div className="mf"><label className="ml">Bio</label><textarea className="mta" value={form.bio} onChange={set("bio")} placeholder="Tell readers about yourself…" rows={4} /></div>
        </div>
        <div className="modal-foot">
          <button className="m-cancel" onClick={onClose}>Cancel</button>
          <button className="m-save" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Changes →"}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Post Row — Fix 2: Edit → /editor?id=postId
// ─────────────────────────────────────────────────────────────────
function PostRow({ post, isOwner, onDeleteClick, navigate }) {
  const thumb = post.banner
    ? cloudinaryUrl(post.banner, "w_200,h_152,c_fill,f_auto,q_auto")
    : null;
  const lastEdit = timeAgo(post.updatedAt || post.createdAt);
  const handleCardClick = () => {
    if (!post.published && isOwner) navigate(`/editor?id=${post._id}`);
    else navigate(`/blog/${post._id}`);
  };

  return (
    <div className="post-row fade-in">
      <div onClick={handleCardClick}>
        <div style={{ display: "flex", gap: ".35rem", marginBottom: ".5rem", flexWrap: "wrap" }}>
          {post.tags?.slice(0, 2).map(t => <span key={t} className="pr-tag">{t}</span>)}
          {!post.published && <span className="pr-tag pr-draft">Draft</span>}
        </div>
        <div className="pr-title">{post.title}</div>
        <div className="pr-meta">
          <span>{post.published ? timeAgo(post.createdAt) : `Last edited ${lastEdit}`}</span>
          <span className="pr-stat">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            {post.views?.toLocaleString()}
          </span>
          <span className="pr-stat">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {post.likes?.length || 0}
          </span>
          <span>{post.readTime} min read</span>
        </div>

        {isOwner && (
          <div className="oa" onClick={e => e.stopPropagation()}>
            {/* Fix 2: navigate to editor with ?id= to load existing post */}
            <button
              className="mb mb-edit"
              onClick={() => navigate(`/editor?id=${post._id}`)}
            >
              Edit
            </button>
            {/* Fix 4: call onDeleteClick (shows themed dialog, not window.confirm) */}
            <button
              className="mb mb-del"
              onClick={() => onDeleteClick(post)}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="pr-thumb" onClick={handleCardClick}>
        {thumb
          ? <img src={thumb} alt={post.title} />
          : <div className="pr-thumb-ph">{post.title.slice(0, 2).toUpperCase()}</div>
        }
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Main Profile Page
// ─────────────────────────────────────────────────────────────────
export default function Profile() {
  const { handle }   = useParams();
  const navigate     = useNavigate();
  const currentUser  = getUser();

  const [profile,         setProfile]         = useState(null);
  const [posts,           setPosts]            = useState([]);
  const [drafts,          setDrafts]           = useState([]);   // ← separate state for drafts
  const [loading,         setLoading]          = useState(true);
  const [draftsLoading,   setDraftsLoading]    = useState(false);
  const [tab,             setTab]              = useState("posts");
  const [following,       setFollowing]        = useState(false);
  const [editing,         setEditing]          = useState(false);
  const [avatarUploading, setAvatarUploading]  = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Fix 4: state for the themed delete dialog
  const [deleteTarget,    setDeleteTarget]     = useState(null); // post object | null

  const avatarFileRef = useRef();
  const isOwner = currentUser && currentUser.handle === handle;

useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Try hitting your backend
        const { data } = await API.get(`/users/${handle}`);
        setProfileData(data);
      } catch (err) {
        console.warn("Backend 404 caught safely. Using local storage fallback.", err);
        
        // Fallback safely if backend profile route doesn't exist
        const savedUser = localStorage.getItem("bs_user");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          
          setProfileData({
            name: parsed.firstName || "Google User",
            username: "User",
            email: parsed.email || "",
            avatar: parsed.avatar || "",
            bio: "Welcome to my blog profile!", // Added default values so your layout fields don't read undefined
            followers: 0,
            following: 0,
            views: 0
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (handle && handle !== "undefined") {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [handle]); // Runs cleanly whenever the route handle changes

  if (loading) return <div className="text-white text-center mt-20">Loading profile...</div>;

  // Safe variables for your HTML render down below
  const displayName = profileData?.name || "BlogSync User";
  const displayEmail = profileData?.email || "";

  // Listen for global follow updates to keep profile in sync
  useEffect(() => {
    if (!profile?.handle) return;
    const unsub = onFollowUpdate(({ handle: h, data }) => {
      if (h === profile.handle) {
        setFollowing(Boolean(data.isFollowing));
        setProfile((p) => p ? { ...p, followers: data.followers, following: data.following } : p);
      }
    });
    return unsub;
  }, [profile?.handle]);

  // Fetch drafts separately — only when the owner switches to the Drafts tab
  // (protected endpoint: GET /api/blogs/drafts)
  useEffect(() => {
    if (tab !== "drafts" || !isOwner) return;
    (async () => {
      setDraftsLoading(true);
      try {
        const { data } = await API.get("/blogs/drafts");
        setDrafts(data);
      } catch {
        // fallback: filter mock data
        setDrafts(MOCK_POSTS.filter(p => !p.published));
      } finally {
        setDraftsLoading(false);
      }
    })();
  }, [tab, isOwner]);

  // Cloudinary avatar upload
  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const url = await uploadImage(file, "avatar");
      setProfile(p => ({ ...p, avatar: url }));
      await API.put("/users/me", { avatar: url });
      const stored = getUser();
      if (stored) localStorage.setItem("bs_user", JSON.stringify({ ...stored, avatar: url }));
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setAvatarUploading(false);
    }
  };

  // Fix 4: confirm delete via themed dialog
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id;
    setDeleteTarget(null);
    try { await API.delete(`/blogs/${id}`); } catch {}
    // Remove from whichever list it belongs to
    setPosts(ps => ps.filter(p => p._id !== id));
    setDrafts(ds => ds.filter(d => d._id !== id));
  };

  const handleSave = (updated) => {
    setProfile(updated);
    if (updated.handle !== handle) navigate(`/profile/${updated.handle}`, { replace: true });
    setEditing(false);
    const stored = getUser();
    if (stored) localStorage.setItem("bs_user", JSON.stringify({ ...stored, ...updated }));
  };

  const pubPosts   = posts.filter(p => p.published);
  const totalViews = posts.reduce((s, p) => s + (p.views || 0), 0);
  const totalLikes = posts.reduce((s, p) => s + (p.likes?.length || 0), 0);
  // drafts come from the protected /api/blogs/drafts endpoint (separate state)
  const shown      = tab === "posts" ? pubPosts : drafts;

  const avatarSrc = profile?.avatar
    ? cloudinaryUrl(profile.avatar, "w_224,h_224,c_fill,g_face,f_auto,q_auto")
    : null;

  if (loading) return (
    <>
      <Styles />
      <nav className="nav"><div className="nav-inner"><Link to="/" className="nav-logo">Blog<span>Sync</span></Link></div></nav>
      <div className="banner" />
      <div className="page-wrap">
        <div style={{ width: 112, height: 112, borderRadius: "50%", background: "var(--border)", marginTop: -56, animation: "pulse 1.4s ease infinite" }} />
        <div style={{ marginTop: "1rem" }}>
          {[180, 100, 340, 60].map((w, i) => <div key={i} className="sk" style={{ height: i === 0 ? 32 : 14, width: w, marginBottom: 14 }} />)}
        </div>
      </div>
    </>
  );

  const pr = profile;
  const ac = avatarColor(pr.handle);

  return (
    <>
      <Styles />

      {/* Fix 4: Themed delete confirmation dialog */}
      {deleteTarget && (
        <DeleteDialog
          post={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {editing && (
        <EditModal profile={pr} onClose={() => setEditing(false)} onSave={handleSave} />
      )}

      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">Blog<span>Sync</span></Link>
          <div className="nav-right">
            <ThemeToggle />
            {currentUser
              ? <button className="nav-btn nr" onClick={() => navigate("/editor")}>+ Write</button>
              : <>
                  <button className="nav-btn ng" onClick={() => navigate("/auth")}>Sign In</button>
                  <button className="nav-btn nr" onClick={() => navigate("/auth")}>Get Started</button>
                </>
            }
          </div>
        </div>
      </nav>

      <div className="banner" />

      <div className="page-wrap">
        <div className="main-row">
          <div>
            {/* Avatar with Cloudinary upload */}
            <div className="avatar-wrap">
              <div className="profile-av" style={{ background: avatarSrc ? "transparent" : ac }}>
                {avatarSrc
                  ? <img src={avatarSrc} alt={`${pr.firstName} ${pr.lastName}`} />
                  : <span className="profile-av-initials">{initials(pr)}</span>
                }
                {avatarUploading && (
                  <div className="av-uploading"><div className="av-spinner" /></div>
                )}
              </div>
              {isOwner && !avatarUploading && (
                <div className="av-edit" onClick={() => avatarFileRef.current?.click()} title="Change avatar">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
              )}
              <input ref={avatarFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarFile} />
            </div>

            <div className="profile-name" style={{ marginTop: "1rem" }}>{pr.firstName} {pr.lastName}</div>
            <div className="profile-handle">@{pr.handle}</div>
            <div className="profile-bio">{pr.bio || "Writer on BlogSync."}</div>
            <div className="profile-joined">
              Member since {new Date(pr.createdAt || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
          </div>

          <div className="p-actions">
            {isOwner
              ? <button className="pb pb-out" onClick={() => setEditing(true)}>Edit Profile</button>
              : <button className={`pb pb-solid ${following ? "on" : ""}`} onClick={async () => {
                    if (!currentUser) { navigate('/auth'); return; }
                    const prev = following;
                    setFollowing(!prev);
                    setProfile((p) => p ? { ...p, followers: (p.followers || 0) + (prev ? -1 : 1) } : p);
                    try {
                      if (prev) await unfollowUser(profile.handle);
                      else await followUser(profile.handle);
                    } catch (err) {
                      setFollowing(prev);
                      setProfile((p) => p ? { ...p, followers: (p.followers || 0) + (prev ? 1 : -1) } : p);
                    }
                  }}>
                    {following ? "Following ✓" : "+ Follow"}
                  </button>
            }
            {isOwner && (
              <button className="pb pb-solid" onClick={() => navigate("/editor")}>+ New Story</button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-bar">
          <div><div className="stat-n">{pubPosts.length}</div><div className="stat-l">Stories</div></div>
          <div><div className="stat-n">{totalViews.toLocaleString()}</div><div className="stat-l">Total Views</div></div>
          <div><div className="stat-n">{totalLikes.toLocaleString()}</div><div className="stat-l">Total Likes</div></div>
          <div><div className="stat-n">{(pr.followers || 0).toLocaleString()}</div><div className="stat-l">Followers</div></div>
          <div><div className="stat-n">{(pr.following || 0).toLocaleString()}</div><div className="stat-l">Following</div></div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === "posts"  ? "on" : ""}`} onClick={() => setTab("posts")}>
            Stories ({pubPosts.length})
          </button>
          {isOwner && (
            <button className={`tab ${tab === "drafts" ? "on" : ""}`} onClick={() => setTab("drafts")}>
              Drafts {draftsLoading ? "…" : `(${drafts.length})`}
            </button>
          )}
        </div>

        {/* Posts */}
        {shown.length === 0 && !draftsLoading ? (
          <div className="empty">
            <h3>{tab === "drafts" ? "No drafts yet." : "No stories yet."}</h3>
            <p>
              {tab === "drafts"
                ? isOwner
                  ? "Start writing and click \"Save as Draft\" to save your work here."
                  : "This author has no drafts."
                : isOwner
                  ? "Your published stories will appear here."
                  : "This author hasn't published yet."
              }
            </p>
            {isOwner && (
              <button className="pb pb-solid" style={{ marginTop:"1rem" }} onClick={() => navigate("/editor")}>
                {tab === "drafts" ? "Start Writing →" : "+ Write First Story"}
              </button>
            )}
          </div>
        ) : draftsLoading ? (
          // Skeleton while drafts load
          <div style={{ marginBottom:"4rem" }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ padding:"1.5rem 0", borderBottom:"1px solid var(--border)" }}>
                <div className="sk" style={{ height:12, width:120, marginBottom:12 }}/>
                <div className="sk" style={{ height:22, width:"75%", marginBottom:10 }}/>
                <div className="sk" style={{ height:13, width:"55%", marginBottom:0 }}/>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginBottom: "4rem" }}>
            {shown.map(post => (
              <PostRow
                key={post._id}
                post={post}
                isOwner={isOwner}
                onDeleteClick={setDeleteTarget}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

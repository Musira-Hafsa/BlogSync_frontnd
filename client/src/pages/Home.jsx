import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import { follow as followUser, unfollow as unfollowUser } from "../utils/followService";
import { cloudinaryUrl } from "../api/uploadImage";
import ThemeToggle from "../components/ThemeToggle";
import { jwtDecode } from "jwt-decode";

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

// ── Mock data ─────────────────────────────────────────────────────
const MOCK = [
  { _id:"1", title:"The Art of Writing in the Age of Distraction", content:"Every writer faces the same enemy: the infinite scroll. Here's how to reclaim your attention and craft prose that actually means something in a world drowning in content.", tags:["Writing","Creativity"], author:{ firstName:"Elena", lastName:"Marsh", handle:"elenamarsh" }, readTime:6, views:4200, likes:Array(12).fill("x"), createdAt:new Date(Date.now()-86400000*2).toISOString(), featured:true },
  { _id:"2", title:"Why Your Blog Needs a Point of View", content:"Generic takes get generic traffic. The blogs that build real audiences are the ones that dare to have an actual opinion — even a wrong one.", tags:["Strategy","Audience"], author:{ firstName:"James", lastName:"Ortega", handle:"jortega" }, readTime:4, views:2800, likes:Array(7).fill("x"), createdAt:new Date(Date.now()-86400000*5).toISOString() },
  { _id:"3", title:"Minimalism in Technical Writing", content:"Documentation doesn't have to be a wall of text. Less words, more clarity — the principles of minimalist writing applied to technical documentation.", tags:["Tech","Writing"], author:{ firstName:"Priya", lastName:"Nair", handle:"priyanair" }, readTime:5, views:1950, likes:Array(5).fill("x"), createdAt:new Date(Date.now()-86400000*7).toISOString() },
  { _id:"4", title:"The MERN Stack in 2025: Still Worth It?", content:"React, Node, Express, MongoDB — the classic quartet. But with so many new frameworks emerging, is the MERN stack still the right choice for modern web apps?", tags:["Tech","MERN"], author:{ firstName:"Sam", lastName:"Chen", handle:"samchen" }, readTime:8, views:5600, likes:Array(15).fill("x"), createdAt:new Date(Date.now()-86400000).toISOString() },
  { _id:"5", title:"Designing for Readers, Not Just Users", content:"UX and reading experience are rarely discussed together. But for a blog, typography, line length, and breathing room matter more than any feature.", tags:["Design","UX"], author:{ firstName:"Ava", lastName:"Lindqvist", handle:"avalind" }, readTime:5, views:3100, likes:Array(8).fill("x"), createdAt:new Date(Date.now()-86400000*3).toISOString() },
  { _id:"6", title:"How to Build an Audience from Zero", content:"Nobody reads your first post. That's fine. Here's the uncomfortable truth about building a readership and why most people quit right before it starts working.", tags:["Growth","Strategy"], author:{ firstName:"Marco", lastName:"Silva", handle:"marcosilva" }, readTime:7, views:6800, likes:Array(18).fill("x"), createdAt:new Date(Date.now()-86400000*4).toISOString() },
];
const ALL_TAGS = ["All","Writing","Tech","Design","Strategy","Creativity","MERN","UX","Growth","Audience"];



function timeAgo(iso) {
  const d = Math.floor((Date.now()-new Date(iso))/86400000);
  if(d===0)return"Today"; if(d===1)return"Yesterday"; if(d<30)return`${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric"});
}
function avatarColor(h=""){const p=["#c8281e","#1d4ed8","#059669","#7c3aed","#b45309","#0e7490"];let n=0;for(let c of h)n=(n*31+c.charCodeAt(0))%p.length;return p[n];}
function initials(a){return`${a?.firstName?.[0]||""}${a?.lastName?.[0]||""}`.toUpperCase();}

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{--ink:#0a0a0a;--cream:#faf7f2;--paper:#f5f0e8;--red:#c8281e;--muted:#6b6560;--border:#d8d0c4;--white:#fff;}
    html{scroll-behavior:smooth;}body{background:var(--cream);font-family:'DM Sans',sans-serif;color:var(--ink);}
    a{text-decoration:none;color:inherit;}

    .nav{position:sticky;top:0;z-index:100;background:var(--ink);border-bottom:1px solid rgba(255,255,255,.08);}
    .nav-inner{max-width:1280px;margin:0 auto;padding:0 2rem;display:flex;align-items:center;justify-content:space-between;height:60px;}
    .nav-logo{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:900;color:#fff;letter-spacing:-.02em;}
    .nav-logo span{color:var(--red);}
    .nav-links{display:flex;align-items:center;gap:2rem;}
    .nav-link{font-size:.72rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.5);transition:color .2s;cursor:pointer;background:none;border:none;padding:0;font:inherit;}
    .nav-link:hover,.nav-link.on{color:#fff;}
    .nav-right{display:flex;align-items:center;gap:.75rem;}
    .nav-btn{font-family:'DM Sans',sans-serif;font-size:.7rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;padding:.45rem 1rem;cursor:pointer;border-radius:0;transition:all .2s;}
    .nb-ghost{background:none;border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.7);}.nb-ghost:hover{border-color:#fff;color:#fff;}
    .nb-solid{background:var(--red);border:1px solid var(--red);color:#fff;}.nb-solid:hover{background:#9e1e16;}
    .nav-user{display:flex;align-items:center;gap:.6rem;cursor:pointer;}
    .nav-av{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:600;color:#fff;}
    .nav-uname{font-size:.78rem;color:rgba(255,255,255,.8);font-weight:500;}
    .nav-write{display:flex;align-items:center;gap:.4rem;font-family:'DM Sans',sans-serif;font-size:.7rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;background:var(--red);border:none;color:#fff;padding:.45rem 1rem;cursor:pointer;transition:background .2s;}
    .nav-write:hover{background:#9e1e16;}
    .nav-out{font-size:.7rem;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;letter-spacing:.08em;text-transform:uppercase;transition:color .2s;}
    .nav-out:hover{color:var(--red);}

    .ticker{background:var(--red);overflow:hidden;height:32px;display:flex;align-items:center;}
    .ticker-label{background:var(--ink);color:#fff;font-size:.62rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;padding:0 1rem;height:100%;display:flex;align-items:center;white-space:nowrap;flex-shrink:0;}
    .ticker-track{display:flex;gap:3rem;animation:ticker 32s linear infinite;padding-left:2rem;}
    .ticker-item{font-size:.68rem;font-weight:500;color:rgba(255,255,255,.9);white-space:nowrap;letter-spacing:.04em;}
    @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}

    .hero{background:var(--cream);border-bottom:1px solid var(--border);}
    .hero-inner{max-width:1280px;margin:0 auto;padding:3rem 2rem;display:grid;grid-template-columns:1fr 380px;gap:3rem;align-items:start;}
    .hero-eyebrow{font-size:.64rem;letter-spacing:.2em;text-transform:uppercase;color:var(--red);font-weight:500;margin-bottom:.9rem;display:flex;align-items:center;gap:.6rem;}
    .hero-eyebrow::before{content:'';width:24px;height:1.5px;background:var(--red);}
    .hero-title{font-family:'Playfair Display',serif;font-size:clamp(2.8rem,5vw,5rem);line-height:1.02;font-weight:900;letter-spacing:-.03em;color:var(--ink);margin-bottom:1.4rem;}
    .hero-title em{font-style:italic;}
    .hero-excerpt{font-size:1.05rem;color:var(--muted);font-weight:300;line-height:1.7;max-width:600px;margin-bottom:2rem;}
    .hero-meta{display:flex;align-items:center;gap:1.5rem;font-size:.75rem;color:var(--muted);}
    .hero-meta-div{width:1px;height:14px;background:var(--border);}
    .hero-tag{display:inline-flex;align-items:center;background:var(--ink);color:#fff;font-size:.62rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;padding:.25rem .7rem;}
    .hero-btn{display:inline-flex;align-items:center;gap:.5rem;background:var(--ink);color:#fff;border:none;font-family:'DM Sans',sans-serif;font-size:.72rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;padding:.8rem 1.6rem;cursor:pointer;transition:background .2s;margin-bottom:2rem;}
    .hero-btn:hover{background:var(--red);}
    .hero-cover{width:100%;height:220px;object-fit:cover;border:1px solid var(--border);}
    .hero-cover-placeholder{width:100%;height:220px;background:var(--paper);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:3rem;font-weight:900;opacity:.1;}
    .hero-side{border-left:1px solid var(--border);padding-left:3rem;}
    .hero-side-title{font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);font-weight:500;margin-bottom:1.2rem;padding-bottom:.6rem;border-bottom:1px solid var(--border);}
    .hero-side-post{display:flex;gap:1rem;align-items:flex-start;padding:1rem 0;border-bottom:1px solid var(--border);cursor:pointer;transition:opacity .2s;}
    .hero-side-post:last-child{border-bottom:none;}
    .hero-side-post:hover{opacity:.7;}
    .hero-side-num{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:900;color:var(--border);line-height:1;flex-shrink:0;width:28px;}
    .hero-side-ptitle{font-family:'Playfair Display',serif;font-size:.95rem;font-weight:700;color:var(--ink);line-height:1.3;margin-bottom:.3rem;}
    .hero-side-meta{font-size:.7rem;color:var(--muted);}

    .content-wrap{max-width:1280px;margin:0 auto;padding:3rem 2rem;display:grid;grid-template-columns:1fr 300px;gap:3rem;align-items:start;}
    .tag-filter{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1.5px solid var(--border);}
    .tag-pill{font-size:.65rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;padding:.35rem .85rem;cursor:pointer;border:1px solid var(--border);background:var(--white);color:var(--muted);transition:all .18s;border-radius:0;}
    .tag-pill:hover{border-color:var(--ink);color:var(--ink);}
    .tag-pill.on{background:var(--ink);color:#fff;border-color:var(--ink);}
    .feed-label{font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);font-weight:500;margin-bottom:1.5rem;}

    .post-card{display:grid;grid-template-columns:1fr 120px;gap:1.5rem;align-items:start;padding:1.5rem 0;border-bottom:1px solid var(--border);cursor:pointer;transition:opacity .18s;}
    .post-card:hover{opacity:.8;}.post-card:hover .post-title{color:var(--red);}
    .post-card-top{display:flex;align-items:center;gap:.6rem;margin-bottom:.75rem;}
    .post-av{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.58rem;font-weight:600;color:#fff;flex-shrink:0;}
    .post-author{font-size:.75rem;font-weight:500;}.post-date{font-size:.72rem;color:var(--muted);}
    .post-title{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;line-height:1.25;color:var(--ink);letter-spacing:-.01em;margin-bottom:.6rem;transition:color .18s;}
    .post-excerpt{font-size:.855rem;color:var(--muted);font-weight:300;line-height:1.6;margin-bottom:.9rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
    .post-bottom{display:flex;align-items:center;gap:1rem;flex-wrap:wrap;}
    .post-tag{font-size:.6rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:.2rem .6rem;background:var(--paper);color:var(--muted);border:1px solid var(--border);}
    .post-stat{display:flex;align-items:center;gap:.3rem;font-size:.72rem;color:var(--muted);}
    .post-thumb{width:120px;height:90px;flex-shrink:0;overflow:hidden;border:1px solid var(--border);background:var(--paper);display:flex;align-items:center;justify-content:center;}
    .post-thumb img{width:100%;height:100%;object-fit:cover;}
    .post-thumb-ph{font-family:'Playfair Display',serif;font-size:2rem;font-weight:900;opacity:.1;}

    .sidebar{position:sticky;top:72px;display:flex;flex-direction:column;gap:2rem;}
    .sb-block{border:1px solid var(--border);padding:1.5rem;background:var(--white);}
    .sb-title{font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);font-weight:500;margin-bottom:1rem;padding-bottom:.75rem;border-bottom:1px solid var(--border);}
    .trending-item{display:flex;gap:.75rem;align-items:flex-start;padding:.75rem 0;border-bottom:1px solid var(--border);cursor:pointer;}
    .trending-item:last-child{border-bottom:none;padding-bottom:0;}
    .tr-num{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:900;color:var(--border);line-height:1;flex-shrink:0;width:22px;}
    .tr-title{font-family:'Playfair Display',serif;font-size:.88rem;font-weight:700;color:var(--ink);line-height:1.3;margin-bottom:.2rem;}
    .tr-meta{font-size:.68rem;color:var(--muted);}
    .tag-cloud{display:flex;flex-wrap:wrap;gap:.4rem;}
    .cloud-tag{font-size:.62rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;padding:.3rem .7rem;border:1px solid var(--border);background:var(--cream);color:var(--muted);cursor:pointer;transition:all .18s;}
    .cloud-tag:hover,.cloud-tag.on{background:var(--ink);color:#fff;border-color:var(--ink);}
    .nl-text{font-size:.82rem;color:var(--muted);line-height:1.6;margin-bottom:1rem;}
    .nl-input{width:100%;border:1px solid var(--border);background:var(--cream);font-family:'DM Sans',sans-serif;font-size:.82rem;padding:.6rem .85rem;outline:none;border-radius:0;margin-bottom:.5rem;transition:border-color .2s;}
    .nl-input:focus{border-color:var(--ink);}
    .nl-btn{width:100%;background:var(--ink);color:#fff;border:none;font-family:'DM Sans',sans-serif;font-size:.68rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;padding:.65rem;cursor:pointer;transition:background .2s;border-radius:0;}
    .nl-btn:hover{background:var(--red);}

    .sk{background:var(--border);border-radius:2px;animation:pulse 1.4s ease infinite;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    .empty{text-align:center;padding:4rem 0;}
    .empty h3{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:700;margin-bottom:.5rem;}
    .empty p{font-size:.875rem;color:var(--muted);}

    .footer{background:var(--ink);margin-top:4rem;padding:2.5rem 2rem;}
    .footer-inner{max-width:1280px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;}
    .footer-logo{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:900;color:#fff;letter-spacing:-.02em;}
    .footer-logo span{color:var(--red);}
    .footer-links{display:flex;gap:1.5rem;}
    .footer-link{font-size:.68rem;color:rgba(255,255,255,.4);letter-spacing:.1em;text-transform:uppercase;transition:color .2s;cursor:pointer;}
    .footer-link:hover{color:#fff;}
    .footer-copy{font-size:.72rem;color:rgba(255,255,255,.3);}

    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    .page-enter{animation:fadeUp .45s ease forwards;}
    .card-enter{animation:fadeUp .35s ease forwards;}

    @media(max-width:900px){.hero-inner{grid-template-columns:1fr;}.hero-side{display:none;}.content-wrap{grid-template-columns:1fr;}.sidebar{display:none;}}
    @media(max-width:600px){.post-card{grid-template-columns:1fr;}.post-thumb{display:none;}.nav-links{display:none;}}
  `}</style>
);

function Navbar({ user, onLogout, onTopics, onFeed, active }) {
  const navigate = useNavigate();
  const goTopics = () => {
    if (onTopics) return onTopics();
    navigate("/#topics");
  };
  const goFeed = () => {
    if (onFeed) return onFeed();
    navigate("/#feed");
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">Blog<span>Sync</span></Link>
        <div className="nav-links">
          <button type="button" className={`nav-link ${active==="topics"?"on":""}`} onClick={goTopics}>Topics</button>
          <button type="button" className={`nav-link ${active==="feed"?"on":""}`} onClick={goFeed}>Feed</button>
          <button type="button" className={`nav-link ${active==="writers"?"on":""}`} onClick={() => navigate("/writers")}>Writers</button>
        </div>
        <div className="nav-right">
          <ThemeToggle />
          {user ? (
            <>
              <button className="nav-write" onClick={() => navigate("/editor")}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Write
              </button>
             //REPLACE WITH THIS SAFE VERSION:
<Link to={`/profile/${user.handle}`} className="nav-user"><div className="nav-av" style={{ background: avatarColor(user.handle) }}>{initials(user)}</div>
<span className="nav-uname">{user.firstName}</span></Link> 
              <button className="nav-out" onClick={onLogout}>Out</button>
            </>
          ) : (
            <>
              <button className="nav-btn nb-ghost" onClick={() => navigate("/auth")}>Sign In</button>
              <button className="nav-btn nb-solid" onClick={() => navigate("/auth")}>Get Started</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function Ticker({ posts }) {
  const items = posts.slice(0, 6).map(p => `${p.title} — ${p.author?.firstName} ${p.author?.lastName}`);
  const doubled = [...items, ...items];
  return (
    <div className="ticker">
      <div className="ticker-label">🔥 Trending</div>
      <div className="ticker-track">
        {doubled.map((t, i) => <span key={i} className="ticker-item">✦ {t}</span>)}
      </div>
    </div>
  );
}

function Hero({ posts, navigate }) {
  const featured = posts.find(p => p.featured) || posts[0];
  const side     = posts.filter(p => p._id !== featured?._id).slice(0, 4);
  if (!featured) return null;
  const coverSrc = featured.banner
    ? cloudinaryUrl(featured.banner, "w_900,h_420,c_fill,f_auto,q_auto")
    : null;
  return (
    <section className="hero">
      <div className="hero-inner">
        <div>
          <div className="hero-eyebrow">Editor's Pick</div>
          <h1 className="hero-title">
            {featured.title.split(" ").map((w,i)=>i===1?<em key={i}>{w} </em>:w+" ")}
          </h1>
          <p className="hero-excerpt">{featured.content?.slice(0,160)}…</p>
          <button className="hero-btn" onClick={() => navigate(`/blog/${featured._id}`)}>Read Story →</button>
          <div className="hero-meta">
            <span className="hero-tag">{featured.tags?.[0]||"Feature"}</span>
            <div className="hero-meta-div"/>
            <span style={{ display:"flex",alignItems:"center",gap:".4rem" }}>
              <div className="post-av" style={{ background:avatarColor(featured.author?.handle),width:22,height:22,fontSize:".52rem" }}>{initials(featured.author)}</div>
              {featured.author?.firstName} {featured.author?.lastName}
            </span>
            <div className="hero-meta-div"/>
            <span>{featured.readTime} min read</span>
            <div className="hero-meta-div"/>
            <span>{featured.likes?.length||0} likes</span>
          </div>
        </div>
        <div className="hero-side">
          <div className="hero-side-title">Most Read This Week</div>
          {side.map((p,i) => (
            <div key={p._id} className="hero-side-post" onClick={() => navigate(`/blog/${p._id}`)}>
              <span className="hero-side-num">0{i+1}</span>
              <div>
                <div className="hero-side-ptitle">{p.title}</div>
                <div className="hero-side-meta">{p.author?.firstName} {p.author?.lastName} · {p.readTime}m</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PostCard({ post, navigate, delay=0 }) {
  const ac = avatarColor(post.author?.handle);
  // Use Cloudinary transformation for thumbnail if available
  const thumb = post.banner
    ? cloudinaryUrl(post.banner, "w_240,h_180,c_fill,f_auto,q_auto")
    : null;
  return (
    <div className="post-card card-enter" style={{ animationDelay:`${delay}ms` }}
      onClick={() => navigate(`/blog/${post._id}`)}>
      <div>
        <div className="post-card-top">
          <div className="post-av" style={{ background:ac }}>{initials(post.author)}</div>
          <span className="post-author">{post.author?.firstName} {post.author?.lastName}</span>
          <span className="post-date">· {timeAgo(post.createdAt)}</span>
        </div>
        <h2 className="post-title">{post.title}</h2>
        <p className="post-excerpt">{post.content?.replace(/<[^>]*>/g," ")}</p>
        <div className="post-bottom">
          {post.tags?.slice(0,2).map(t=><span key={t} className="post-tag">{t}</span>)}
          <span className="post-stat">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {post.views?.toLocaleString()}
          </span>
          <span className="post-stat">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {post.likes?.length||0}
          </span>
          <span className="post-stat" style={{ marginLeft:"auto" }}>{post.readTime} min read</span>
        </div>
      </div>
      <div className="post-thumb">
        {thumb
          ? <img src={thumb} alt={post.title} />
          : <div className="post-thumb-ph">{post.title.slice(0,2).toUpperCase()}</div>
        }
      </div>
    </div>
  );
}

function Sidebar({ posts, activeTag, onTagClick }) {
  const [email,  setEmail]  = useState("");
  const [subbed, setSubbed] = useState(false);
  const trending = [...posts].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,5);
  return (
    <aside className="sidebar">
      <div className="sb-block">
        <div className="sb-title">Trending Now</div>
        {trending.map((p,i)=>(
          <div key={p._id} className="trending-item">
            <span className="tr-num">0{i+1}</span>
            <div><div className="tr-title">{p.title}</div><div className="tr-meta">{p.views?.toLocaleString()} views · {p.readTime}m</div></div>
          </div>
        ))}
      </div>
      <div className="sb-block">
        <div className="sb-title">Browse Topics</div>
        <div className="tag-cloud">
          {ALL_TAGS.filter(t=>t!=="All").map(t=>(
            <span key={t} className={`cloud-tag ${activeTag===t?"on":""}`} onClick={()=>onTagClick(t===activeTag?"All":t)}>{t}</span>
          ))}
        </div>
      </div>
      <div className="sb-block">
        <div className="sb-title">Newsletter</div>
        {subbed ? (
          <p style={{ fontSize:".82rem",color:"#15803d",fontWeight:500 }}>✓ You're subscribed!</p>
        ) : (
          <>
            <p className="nl-text">Get the best stories delivered to your inbox every week.</p>
            <input className="nl-input" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
            <button className="nl-btn" onClick={()=>email&&setSubbed(true)}>Subscribe →</button>
          </>
        )}
      </div>
    </aside>
  );
}

function SkeletonFeed() {
  return (
    <div>
      {[1,2,3,4].map(i=>(
        <div key={i} style={{ padding:"1.5rem 0",borderBottom:"1px solid var(--border)" }}>
          <div className="sk" style={{ height:12,width:160,marginBottom:14 }}/>
          <div className="sk" style={{ height:22,width:"80%",marginBottom:10 }}/>
          <div className="sk" style={{ height:14,width:"95%",marginBottom:6 }}/>
          <div className="sk" style={{ height:14,width:"70%",marginBottom:16 }}/>
          <div style={{ display:"flex",gap:8 }}>
            <div className="sk" style={{ height:20,width:60 }}/>
            <div className="sk" style={{ height:20,width:60 }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Writers() {
  const navigate = useNavigate();
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("bs_user") || sessionStorage.getItem("bs_user") || "null");
    } catch {
      return null;
    }
  })();
  const [authors, setAuthors] = useState([]);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    (async () => {
      setLoadingAuthors(true);
      try {
        const { data } = await API.get("/users");
        // Only include users that look like real profiles: must have an id, handle, and a first or last name
        const real = Array.isArray(data)
          ? data.filter(u => u && u._id && typeof u.handle === "string" && u.handle.trim() && ((u.firstName && u.firstName.trim()) || (u.lastName && u.lastName.trim())))
          : [];
        setAuthors(real);
      } catch {
        setAuthors([]);
      }
      setLoadingAuthors(false);
    })();
  }, []);

  const handleLogout = () => {
    ["bs_token", "bs_user"].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    navigate("/auth");
  };

  const handleFollowAction = async (author, currentlyFollowing) => {
    if (!storedUser) {
      navigate("/auth");
      return;
    }
    setActionLoading(author.handle);
    try {
      const data = currentlyFollowing
        ? await unfollowUser(author.handle)
        : await followUser(author.handle);
      setAuthors((prev) => prev.map((item) =>
        item.handle === author.handle
          ? { ...item, followers: data.followers, following: data.following, isFollowing: data.isFollowing }
          : item
      ));
    } catch {
      // ignore for now
    }
    setActionLoading(null);
  };

  return (
    <>
      <Styles />
      <div className="page-enter">
        <Navbar user={storedUser} onLogout={handleLogout} active="writers" />
        <div className="content-wrap">
          <main>
            <div style={{ marginBottom: "2rem" }}>
              <div className="hero-eyebrow">Discover People</div>
              <h1 className="hero-title" style={{ marginBottom: "1rem", fontSize: "clamp(2rem,4vw,3rem)" }}>
                Follow writers and grow your reading list.
              </h1>
              <p className="hero-excerpt">
                Browse author profiles, see follower counts, and connect with writers shaping the community.
              </p>
            </div>
            {loadingAuthors ? (
              <SkeletonFeed />
            ) : authors.length === 0 ? (
              <div className="empty"><h3>No writers found.</h3><p>Check back later for new authors.</p></div>
            ) : (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                {authors.map((author) => (
                  <div key={author._id} className="post-card" style={{ gridTemplateColumns: "1fr", cursor: "default" }}>
                    <div>
                      <div className="post-card-top" style={{ alignItems: "center" }}>
                        <div className="post-av" style={{ background: avatarColor(author.handle) }}>{initials(author)}</div>
                        <div>
                          <div className="post-title" style={{ fontSize: "1.1rem", marginBottom: ".2rem" }}>{author.firstName} {author.lastName}</div>
                          <div className="post-date">@{author.handle}</div>
                        </div>
                      </div>
                      <p className="post-excerpt" style={{ display: "block", marginBottom: "1rem", WebkitLineClamp: 3 }}>
                        {author.bio || "No bio available yet."}
                      </p>
                      <div className="post-bottom" style={{ justifyContent: "space-between", gap: "1rem" }}>
                        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                          <span className="post-stat">{(author.followers || 0).toLocaleString()} followers</span>
                          <span className="post-stat">{(author.following || 0).toLocaleString()} following</span>
                        </div>
                        {author.handle !== storedUser?.handle ? (
                          <button
                            className="nav-write"
                            style={{ background: author.isFollowing ? "#fff" : "var(--ink)", color: author.isFollowing ? "var(--ink)" : "#fff", border: author.isFollowing ? "1px solid var(--ink)" : "none" }}
                            onClick={() => handleFollowAction(author, author.isFollowing)}
                            disabled={actionLoading === author.handle}
                          >
                            {actionLoading === author.handle ? "Please wait..." : author.isFollowing ? "Following ✓" : "Follow"}
                          </button>
                        ) : (
                          <span style={{ fontSize: ".78rem", color: "var(--muted)", fontWeight: 500 }}>This is you</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
          <aside className="sidebar">
            <div className="sb-block">
              <div className="sb-title">Why Follow</div>
              <p className="nl-text">Following writers helps personalize your feed and keep track of authors whose stories you love.</p>
            </div>
            <div className="sb-block">
              <div className="sb-title">Top Topics</div>
              <div className="tag-cloud">
                {ALL_TAGS.filter((tag) => tag !== "All").slice(0, 6).map((tag) => (
                  <span key={tag} className="cloud-tag">{tag}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const storedUser = (()=>{try{return JSON.parse(localStorage.getItem("bs_user")||sessionStorage.getItem("bs_user")||"null");}catch{return null;}})();
  const [user,      setUser]      = useState(storedUser);
  const [posts,     setPosts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTag, setActiveTag] = useState("All");
  const topicsRef = useRef(null);
  const feedRef = useRef(null);

  const handleScrollToTopics = () => {
    setActiveTag("All");
    topicsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollToFeed = () => {
    setActiveTag("All");
    feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  //   const [user, setUser] = useState(() => {
  //   const savedUser = localStorage.getItem("bs_user") || sessionStorage.getItem("bs_user");
  //   return savedUser ? JSON.parse(savedUser) : null;
  // });

  // ==========================================
  // FETCH BLOGS LOGIC (YOURS UPDATED WITH STATE CHECK)
  // ==========================================
 useEffect(() => {
  (async () => {
    setLoading(true);
    
    const token = localStorage.getItem("bs_token") || sessionStorage.getItem("bs_token");
    
   if (token && !user) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const tokenData = JSON.parse(window.atob(base64));

    // Get the core identifier out of your verified token payload printout
    const userId = tokenData._id || tokenData.id;

    const mappedSocialUser = {
      // 🚀 FIX: Use the unique database ID as the handle since text handles aren't in your token
      handle: userId, 
      
      // Give a clean placeholder for the name so your navbar initials logic doesn't crash
      firstName: "User",
      
      _id: userId
    };
    
    setUser(mappedSocialUser);
    localStorage.setItem("bs_user", JSON.stringify(mappedSocialUser));
  } catch (err) {
    console.error("Error parsing JWT token details:", err);
  }
}

    try {
      const { data } = await API.get("/blogs");
      setPosts(data.length ? data : MOCK);
    } catch { 
      setPosts(MOCK); 
    }
    setLoading(false);
  })();
}, [user]);

 const handleLogout = () => {
    ["bs_token", "bs_user"].forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    // Clear cookies if you used the cross-subdomain fallback setting
    document.cookie = "token=; path=/; max-age=0;"; 
    setUser(null); 
    navigate("/auth");
  };

  const topicMatches = (post, topic) => {
    if (topic === "All") return true;
    const title = (post.title || "").toLowerCase();
    return title.includes(topic.toLowerCase());
  };

  const filtered = activeTag === "All"
    ? posts
    : posts.filter((post) => topicMatches(post, activeTag));

  return (
    <>
      <Styles/>
      <div className="page-enter">
        <Navbar user={user} onLogout={handleLogout} onTopics={handleScrollToTopics} onFeed={handleScrollToFeed} active="feed" />
        {posts.length>0 && <Ticker posts={posts}/>}
        {/* {!loading && posts.length>0 && <Hero posts={posts} navigate={navigate}/>} */}
        {!user && (
  <section className="hero">
    <div className="hero-inner">
      <div>
        <div className="hero-eyebrow">Start Writing</div>

        <h1 className="hero-title">
          Publish your <em>passions</em>, your way
        </h1>

        <p className="hero-excerpt">
          Create a unique and beautiful blog easily.
        </p>

        <button
          className="hero-btn"
          onClick={() => navigate("/auth")}
        >
          Create your blog →
        </button>
      </div>
    </div>
  </section>
)}

{user && !loading && posts.length>0 && (
  <Hero posts={posts} navigate={navigate}/>
)}
        <div className="content-wrap">
          <main>
            <div className="tag-filter" id="topics" ref={topicsRef}>
              {ALL_TAGS.map(t=>(
                <button key={t} className={`tag-pill ${activeTag===t?"on":""}`} onClick={()=>setActiveTag(t)}>{t}</button>
              ))}
            </div>
            <div className="feed-label" id="feed" ref={feedRef}>
              {activeTag==="All"?"Latest Stories":`Stories in "${activeTag}"`}
              {!loading && ` — ${filtered.length} posts`}
            </div>
            {loading ? <SkeletonFeed/> : filtered.length===0 ? (
              <div className="empty"><h3>No stories yet.</h3><p>Be the first to write about "{activeTag}".</p></div>
            ) : (
              <div>
                {filtered.map((post,i)=><PostCard key={post._id} post={post} navigate={navigate} delay={i*60}/>)}
              </div>
            )}
          </main>
          <Sidebar posts={posts} activeTag={activeTag} onTagClick={setActiveTag}/>
        </div>
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-logo">Blog<span>Sync</span></div>
            <div className="footer-links">
              <span className="footer-link">About</span>
              <span className="footer-link">Privacy</span>
              <span className="footer-link">Terms</span>
              <span className="footer-link">Contact</span>
            </div>
            <div className="footer-copy">© 2025 BlogSync. All rights reserved.</div>
          </div>
        </footer>
      </div>
    </>
  );
}

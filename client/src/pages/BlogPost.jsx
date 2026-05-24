import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { cloudinaryUrl } from "../api/uploadImage";
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

const getUser = () => { try { return JSON.parse(localStorage.getItem("bs_user")||sessionStorage.getItem("bs_user")||"null"); } catch { return null; } };
import { follow as followUser, unfollow as unfollowUser, onFollowUpdate } from "../utils/followService";
function timeAgo(iso){const d=Math.floor((Date.now()-new Date(iso))/86400000);if(d===0)return"Today";if(d===1)return"Yesterday";if(d<30)return`${d} days ago`;return new Date(iso).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});}
function avatarColor(h=""){const p=["#c8281e","#1d4ed8","#059669","#7c3aed","#b45309","#0e7490","#be185d"];let n=0;for(let c of h)n=(n*31+c.charCodeAt(0))%p.length;return p[n];}
function initials(o){return`${o?.firstName?.[0]??""}${o?.lastName?.[0]??""}`.toUpperCase();}

const MOCK_POST = {
  _id:"mock1", title:"The Art of Writing in the Age of Distraction",
  content:`<p>Every writer faces the same enemy: the infinite scroll. The pinging notification. The browser tab opened "just for a second." The enemy is not laziness — it's the architecture of distraction that modern technology has perfected into an art form of its own.</p><h2>The Attention Economy</h2><p>We live in a world engineered to fragment our focus. Every app, every platform, every device is optimised not for your productivity, but for your <em>engagement</em> — which is a polite word for addiction.</p><blockquote>Writing is thinking. To write well is to think clearly. That's why it's so hard. — David McCullough</blockquote><p>The irony is profound: we have more tools to write than ever before, and yet the conditions for writing have never been more hostile.</p><h2>Reclaiming the Space</h2><p>The writers who thrive in this environment aren't those with superhuman willpower. They're the ones who've <strong>redesigned their environment</strong>. They close the tabs. They write in the morning, before the world wakes up.</p><h2>The Practice</h2><p>Start small. Commit to 200 words. Not good words — just words. The quality is irrelevant at first; the habit is everything.</p><hr/><p>The words will come. They always do, for those patient enough to wait them out.</p>`,
  tags:["Writing","Creativity","Focus"],
  author:{ _id:"a1", firstName:"Elena", lastName:"Marsh", handle:"elenamarsh", bio:"Writer, editor, and chronic overthinker. I write about craft, creativity, and the slow art of paying attention. Previously at The Atlantic." },
  readTime:6, views:4284, likes:Array.from({length:12},(_,i)=>String(i)),
  createdAt:new Date(Date.now()-86400000*2).toISOString(),
};
const MOCK_COMMENTS = [
  { _id:"c1", content:"This hit different. I've been struggling with exactly this for the past year.", author:{ firstName:"James", lastName:"Ortega", handle:"jortega" }, createdAt:new Date(Date.now()-3600000*5).toISOString(), likes:4 },
  { _id:"c2", content:"The Pavlov analogy is brilliant. Starting tomorrow — same desk, same coffee, same time.", author:{ firstName:"Priya", lastName:"Nair", handle:"priyanair" }, createdAt:new Date(Date.now()-3600000*14).toISOString(), likes:7 },
  { _id:"c3", content:"'Distraction is a modern luxury we've mistaken for a human condition.' Saving this line forever.", author:{ firstName:"Marco", lastName:"Silva", handle:"marcosilva" }, createdAt:new Date(Date.now()-86400000).toISOString(), likes:19 },
];
const RELATED = [
  { _id:"r1", title:"Why Your Blog Needs a Point of View", author:{ firstName:"James", lastName:"O." }, readTime:4 },
  { _id:"r2", title:"Designing for Readers, Not Just Users", author:{ firstName:"Ava", lastName:"L." }, readTime:5 },
  { _id:"r3", title:"How to Build an Audience from Zero", author:{ firstName:"Marco", lastName:"S." }, readTime:7 },
];

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Lora:ital,wght@0,400;0,600;1,400;1,600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{--ink:#0a0a0a;--cream:#faf7f2;--paper:#f5f0e8;--red:#c8281e;--muted:#6b6560;--border:#d8d0c4;--white:#fff;}
    html{scroll-behavior:smooth;}body{background:var(--cream);font-family:'DM Sans',sans-serif;color:var(--ink);}
    a{text-decoration:none;color:inherit;}
    .progress-bar{position:fixed;top:0;left:0;z-index:999;height:3px;background:var(--red);transition:width .08s linear;pointer-events:none;}
    .nav{position:sticky;top:0;z-index:100;background:var(--ink);border-bottom:1px solid rgba(255,255,255,.08);}
    .nav-inner{max-width:1200px;margin:0 auto;padding:0 2rem;display:flex;align-items:center;justify-content:space-between;height:56px;}
    .nav-logo{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:900;color:#fff;letter-spacing:-.02em;}
    .nav-logo span{color:var(--red);}
    .nav-actions{display:flex;gap:.65rem;align-items:center;}
    .nav-btn{font-family:'DM Sans',sans-serif;font-size:.68rem;font-weight:500;letter-spacing:.13em;text-transform:uppercase;padding:.4rem .9rem;cursor:pointer;border-radius:0;transition:all .2s;}
    .nb-ghost{background:none;border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.65);}.nb-ghost:hover{border-color:#fff;color:#fff;}
    .nb-fill{background:var(--red);border:1px solid var(--red);color:#fff;}.nb-fill:hover{background:#9e1e16;}
    .nav-back{display:flex;align-items:center;gap:.5rem;font-size:.72rem;color:rgba(255,255,255,.5);letter-spacing:.08em;text-transform:uppercase;background:none;border:none;cursor:pointer;transition:color .2s;padding:0;}
    .nav-back:hover{color:#fff;}

    .post-hero{width:100%;background:var(--ink);min-height:400px;display:flex;align-items:flex-end;position:relative;overflow:hidden;}
    .hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.4;}
    .hero-grad{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,10,.97) 0%,rgba(10,10,10,.45) 50%,rgba(10,10,10,.1) 100%);}
    .hero-texture{position:absolute;inset:0;z-index:1;background:repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,.025) 59px,rgba(255,255,255,.025) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,.025) 59px,rgba(255,255,255,.025) 60px);}
    .hero-content{position:relative;z-index:2;width:100%;max-width:800px;margin:0 auto;padding:3.5rem 2rem;}
    .hero-tags{display:flex;gap:.45rem;flex-wrap:wrap;margin-bottom:1.2rem;}
    .hero-tag{font-size:.58rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:.22rem .65rem;background:var(--red);color:#fff;}
    .hero-title{font-family:'Playfair Display',serif;font-size:clamp(2.2rem,5.5vw,4rem);line-height:1.05;font-weight:900;color:#fff;letter-spacing:-.03em;margin-bottom:1.6rem;}
    .hero-byline{display:flex;align-items:center;gap:1.2rem;flex-wrap:wrap;}
    .byline-av{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;color:#fff;flex-shrink:0;}
    .byline-name{font-size:.875rem;font-weight:500;color:rgba(255,255,255,.92);}
    .byline-sub{font-size:.7rem;color:rgba(255,255,255,.42);margin-top:.1rem;}
    .byline-sep{width:1px;height:28px;background:rgba(255,255,255,.14);}
    .byline-stat{display:flex;align-items:center;gap:.35rem;font-size:.74rem;color:rgba(255,255,255,.45);}

    .body-layout{max-width:1200px;margin:0 auto;padding:0 2rem;display:grid;grid-template-columns:1fr 288px;gap:4.5rem;align-items:start;}
    .article-wrap{padding:3.5rem 0;}
    .article-body{font-family:'Lora',serif;font-size:1.125rem;line-height:1.9;color:var(--ink);}
    .article-body h1{font-family:'Playfair Display',serif;font-size:2.1rem;font-weight:900;letter-spacing:-.025em;margin:2.2rem 0 .9rem;}
    .article-body h2{font-family:'Playfair Display',serif;font-size:1.65rem;font-weight:700;letter-spacing:-.02em;margin:2rem 0 .8rem;}
    .article-body h3{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;margin:1.6rem 0 .6rem;}
    .article-body p{margin-bottom:1.5rem;}
    .article-body ul,.article-body ol{padding-left:1.6rem;margin-bottom:1.5rem;}
    .article-body li{margin-bottom:.5rem;}
    .article-body a{color:var(--red);text-decoration:underline;}
    .article-body strong{font-weight:700;}.article-body em{font-style:italic;}
    .article-body blockquote{border-left:3px solid var(--red);padding:.8rem 0 .8rem 1.6rem;margin:2.2rem 0;font-style:italic;font-size:1.2rem;color:var(--muted);line-height:1.65;}
    .article-body hr{border:none;border-top:1.5px solid var(--border);margin:2.8rem 0;}
    .article-body code{font-family:'Courier New',monospace;font-size:.88em;background:var(--paper);border:1px solid var(--border);padding:.1em .4em;}
    .article-body pre{background:var(--ink);color:#e2e8f0;padding:1.5rem;overflow-x:auto;margin:2rem 0;font-family:'Courier New',monospace;font-size:.875rem;line-height:1.75;}
    .article-body img{width:100%;height:auto;margin:2rem 0;border:1px solid var(--border);}

    .reaction-bar{display:flex;align-items:center;gap:.85rem;padding:1.4rem 0;border-top:1.5px solid var(--border);border-bottom:1.5px solid var(--border);margin:2.8rem 0;}
    .react-btn{display:flex;align-items:center;gap:.45rem;background:none;border:1px solid var(--border);font-family:'DM Sans',sans-serif;font-size:.75rem;font-weight:500;color:var(--muted);padding:.5rem 1rem;cursor:pointer;transition:all .18s;border-radius:0;}
    .react-btn:hover{border-color:var(--ink);color:var(--ink);}
    .react-btn.liked{background:var(--ink);color:#fff;border-color:var(--ink);}
    .react-share{margin-left:auto;display:flex;align-items:center;gap:.4rem;background:none;border:none;font-family:'DM Sans',sans-serif;font-size:.7rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);cursor:pointer;transition:color .18s;padding:0;}
    .react-share:hover{color:var(--ink);}
    .copied-badge{font-size:.65rem;color:var(--red);margin-left:.3rem;}

    .author-card{background:var(--paper);border:1px solid var(--border);padding:2rem;margin-bottom:3rem;}
    .author-card-inner{display:flex;gap:1.25rem;align-items:flex-start;margin-bottom:1.1rem;}
    .author-big-av{width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:900;color:#fff;flex-shrink:0;}
    .author-card-name{font-family:'Playfair Display',serif;font-size:1.35rem;font-weight:700;margin-bottom:.12rem;}
    .author-card-handle{font-size:.72rem;color:var(--muted);margin-bottom:.55rem;}
    .author-card-bio{font-size:.875rem;color:var(--muted);line-height:1.68;}
    .author-card-btns{display:flex;gap:.7rem;margin-top:1.2rem;}
    .ac-btn{font-family:'DM Sans',sans-serif;font-size:.68rem;font-weight:500;letter-spacing:.13em;text-transform:uppercase;padding:.5rem 1.2rem;cursor:pointer;border-radius:0;transition:all .2s;}
    .ac-follow{background:var(--ink);color:#fff;border:1px solid var(--ink);}.ac-follow:hover{background:var(--red);border-color:var(--red);}
    .ac-follow.on{background:none;color:var(--ink);border:1px solid var(--border);}.ac-follow.on:hover{border-color:var(--red);color:var(--red);}
    .ac-profile{background:none;color:var(--muted);border:1px solid var(--border);}.ac-profile:hover{border-color:var(--ink);color:var(--ink);}

    .comments-wrap{margin-top:.5rem;}
    .comments-heading{font-family:'Playfair Display',serif;font-size:1.7rem;font-weight:700;letter-spacing:-.02em;margin-bottom:1.6rem;}
    .comment-form{margin-bottom:2.5rem;}
    .cf-inner{display:flex;gap:.85rem;align-items:flex-start;margin-bottom:.75rem;}
    .cf-av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;color:#fff;flex-shrink:0;margin-top:.15rem;}
    .cf-textarea{flex:1;border:1px solid var(--border);background:var(--white);font-family:'Lora',serif;font-size:.95rem;color:var(--ink);padding:.8rem 1rem;outline:none;resize:vertical;min-height:88px;transition:border-color .2s;border-radius:0;}
    .cf-textarea:focus{border-color:var(--ink);}
    .cf-textarea::placeholder{color:var(--border);font-style:italic;}
    .cf-submit{align-self:flex-end;margin-left:calc(36px + .85rem);font-family:'DM Sans',sans-serif;font-size:.68rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;padding:.6rem 1.4rem;background:var(--ink);color:#fff;border:none;cursor:pointer;transition:background .2s;border-radius:0;}
    .cf-submit:hover:not(:disabled){background:var(--red);}.cf-submit:disabled{opacity:.5;cursor:not-allowed;}
    .login-prompt{font-size:.84rem;color:var(--muted);padding:.85rem 1.1rem;background:var(--paper);border:1px solid var(--border);margin-bottom:2rem;}
    .login-prompt a{color:var(--red);text-decoration:underline;cursor:pointer;}

    .comment-list{display:flex;flex-direction:column;}
    .comment-item{display:flex;gap:1rem;padding:1.35rem 0;border-bottom:1px solid var(--border);animation:fadeUp .3s ease forwards;}
    .comment-item:last-child{border-bottom:none;}
    .c-av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.63rem;font-weight:700;color:#fff;flex-shrink:0;}
    .c-meta{display:flex;align-items:center;gap:.45rem;margin-bottom:.4rem;flex-wrap:wrap;}
    .c-author{font-size:.8rem;font-weight:600;}.c-handle{font-size:.7rem;color:var(--muted);}.c-date{font-size:.7rem;color:var(--muted);margin-left:auto;}
    .c-text{font-family:'Lora',serif;font-size:.9rem;line-height:1.7;margin-bottom:.6rem;}
    .c-like{display:flex;align-items:center;gap:.3rem;background:none;border:none;font-size:.7rem;color:var(--muted);cursor:pointer;transition:color .15s;padding:0;}
    .c-like:hover{color:var(--red);}
    .c-actions{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;margin-top:.6rem;}
    .comment-action-btn{font-family:'DM Sans',sans-serif;font-size:.68rem;font-weight:500;letter-spacing:.13em;text-transform:uppercase;background:none;border:1px solid var(--border);color:var(--muted);cursor:pointer;padding:.45rem .75rem;transition:all .18s;border-radius:0;}
    .comment-action-btn:hover{border-color:var(--ink);color:var(--ink);}
    .c-edit-textarea{width:100%;min-height:88px;border:1px solid var(--border);padding:.85rem 1rem;font-family:'Lora',serif;font-size:.9rem;color:var(--ink);background:var(--white);resize:vertical;outline:none;transition:border-color .2s;border-radius:0;}
    .c-edit-textarea:focus{border-color:var(--ink);}

    .post-sidebar{padding:3.5rem 0;position:sticky;top:72px;max-height:calc(100vh - 72px);overflow-y:auto;}
    .post-sidebar::-webkit-scrollbar{width:3px;}.post-sidebar::-webkit-scrollbar-thumb{background:var(--border);}
    .sb-section{margin-bottom:2.2rem;}
    .sb-label{font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);font-weight:500;padding-bottom:.65rem;border-bottom:1px solid var(--border);margin-bottom:1rem;}
    .toc-item{display:flex;align-items:flex-start;gap:.5rem;padding:.38rem 0;cursor:pointer;font-size:.8rem;color:var(--muted);line-height:1.35;transition:color .15s;}
    .toc-item:hover{color:var(--ink);}.toc-item.toc-on{color:var(--red);font-weight:500;}
    .toc-dot{width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0;margin-top:.48rem;}
    .sb-av-row{display:flex;gap:.8rem;align-items:center;margin-bottom:.85rem;}
    .sb-av{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:#fff;flex-shrink:0;}
    .sb-aname{font-weight:600;font-size:.9rem;margin-bottom:.1rem;}.sb-ahandle{font-size:.7rem;color:var(--muted);}
    .sb-abio{font-size:.78rem;color:var(--muted);line-height:1.6;margin-bottom:.9rem;}
    .sb-follow{width:100%;padding:.52rem;font-family:'DM Sans',sans-serif;font-size:.68rem;font-weight:500;letter-spacing:.13em;text-transform:uppercase;cursor:pointer;transition:all .2s;border-radius:0;background:var(--ink);color:#fff;border:1px solid var(--ink);}
    .sb-follow:hover{background:var(--red);border-color:var(--red);}
    .sb-follow.on{background:none;color:var(--ink);border:1px solid var(--border);}.sb-follow.on:hover{border-color:var(--red);color:var(--red);}
    .related-item{padding:.9rem 0;border-bottom:1px solid var(--border);cursor:pointer;}
    .related-item:last-child{border-bottom:none;}
    .related-title{font-family:'Playfair Display',serif;font-size:.95rem;font-weight:700;color:var(--ink);line-height:1.3;margin-bottom:.3rem;transition:color .15s;}
    .related-item:hover .related-title{color:var(--red);}
    .related-meta{font-size:.7rem;color:var(--muted);}

    .sk{background:var(--border);border-radius:2px;animation:pulse 1.4s ease infinite;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    .page-fade{animation:fadeUp .42s ease forwards;}

    @media(max-width:960px){.body-layout{grid-template-columns:1fr;gap:0;}.post-sidebar{display:none;}}
    @media(max-width:600px){.hero-title{font-size:2rem;}.article-wrap{padding:2rem 0;}.reaction-bar{flex-wrap:wrap;}}
  `}</style>
);

function ProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => { const el=document.documentElement; const top=el.scrollTop||document.body.scrollTop; const h=el.scrollHeight-el.clientHeight; setPct(h>0?Math.min(100,(top/h)*100):0); };
    window.addEventListener("scroll",fn,{passive:true});
    return ()=>window.removeEventListener("scroll",fn);
  },[]);
  return <div className="progress-bar" style={{width:`${pct}%`}}/>;
}

function Navbar() {
  const navigate=useNavigate(); const u=getUser();
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div style={{display:"flex",alignItems:"center",gap:"1.5rem"}}>
          <Link to="/" className="nav-logo">Blog<span>Sync</span></Link>
          <button className="nav-back" onClick={()=>navigate(-1)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back
          </button>
        </div>
        <div className="nav-actions">
          <ThemeToggle />
          {u ? <button className="nav-btn nb-fill" onClick={()=>navigate("/editor")}>+ Write</button>
             : <><button className="nav-btn nb-ghost" onClick={()=>navigate("/auth")}>Sign In</button>
                 <button className="nav-btn nb-fill"  onClick={()=>navigate("/auth")}>Get Started</button></>}
        </div>
      </div>
    </nav>
  );
}

function CommentItem({ comment, currentUser, onDelete }) {
  const [likes, setLikes] = useState(comment.likes ?? 0);
  const [liked, setLiked] = useState(false);
  const currentUserId = currentUser?.id || currentUser?._id;
  const isOwner = currentUserId && comment.author && String(comment.author._id) === String(currentUserId);

  return (
    <div className="comment-item">
      <div className="c-av" style={{ background: avatarColor(comment.author?.handle) }}>{initials(comment.author)}</div>
      <div style={{ flex: 1 }}>
        <div className="c-meta">
          <span className="c-author">{comment.author?.firstName} {comment.author?.lastName}</span>
          <span className="c-handle">@{comment.author?.handle}</span>
          <span className="c-date">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="c-text">{comment.content}</p>
        <div className="c-actions">
          <button className="c-like" onClick={() => { setLiked((l) => !l); setLikes((n) => liked ? n - 1 : n + 1); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill={liked ? "var(--red)" : "none"} stroke={liked ? "var(--red)" : "currentColor"} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {likes}
          </button>
          {isOwner && (
            <button type="button" className="comment-action-btn" onClick={() => onDelete(comment._id)}>Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}

function TOC({html, active, onSelect}) {
  const headings=[...(html??"").matchAll(/<h[23][^>]*>(.*?)<\/h[23]>/gi)].map(m=>m[1].replace(/<[^>]*>/g,""));
  if(headings.length<2) return null;
  return (
    <div className="sb-section">
      <div className="sb-label">In This Article</div>
      {headings.map((h,i)=>(
        <div key={i} className={`toc-item ${active===i?"toc-on":""}`} onClick={()=>onSelect(i)}>
          <span className="toc-dot"/>{h}
        </div>
      ))}
    </div>
  );
}

export default function BlogPost() {
  const {id}=useParams(); const navigate=useNavigate(); const user=getUser();
  const [post,      setPost]      = useState(null);
  const [comments,  setComments]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [liked,     setLiked]     = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [commentTxt,setCommentTxt]= useState("");
  const [submitting,setSubmitting]= useState(false);
  const [copied,    setCopied]    = useState(false);
  const [tocActive, setTocActive] = useState(0);

  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      setLoading(true);
      try{ const{data:p}=await API.get(`/blogs/${id}`); if(cancelled)return; setPost(p); setLikeCount(p.likes?.length??0); if(user) setLiked(p.likes?.includes(user.id)); }
      catch{ if(!cancelled){setPost(MOCK_POST);setLikeCount(MOCK_POST.likes.length);} }
      try{ const{data:c}=await API.get(`/comments/${id}`); if(!cancelled)setComments(c); }
      catch{ if(!cancelled)setComments(MOCK_COMMENTS); }
      if(!cancelled)setLoading(false);
    })();
    return()=>{cancelled=true;};
  },[id]);

  // After post loads, fetch author's follow status and listen for global updates
  useEffect(() => {
    if (!post?.author?.handle) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await API.get(`/users/${post.author.handle}`);
        if (!mounted) return;
        setFollowing(Boolean(data.isFollowing));
        setPost((prev) => prev ? { ...prev, author: { ...prev.author, followers: data.followers, following: data.following } } : prev);
      } catch (err) {
        // ignore
      }
    })();

    const unsub = onFollowUpdate(({ handle, data }) => {
      if (handle === post.author.handle) {
        setFollowing(Boolean(data.isFollowing));
        setPost((prev) => prev ? { ...prev, author: { ...prev.author, followers: data.followers, following: data.following } } : prev);
      }
    });
    return () => { mounted = false; unsub(); };
  }, [post?.author?.handle]);

  const handleLike=useCallback(async()=>{
    if(!user){navigate("/auth");return;}
    const next=!liked; setLiked(next); setLikeCount(n=>next?n+1:n-1);
    try{await API.patch(`/blogs/${id}/like`);const token = localStorage.getItem("token"); 

    await axios.patch(
      `http://localhost:5000/api/blogs/${blogId}/like`, 
      {}, // Empty body because we only need the ID from the URL
      {
        headers: {
          Authorization: `Bearer ${token}` // 🔥 CRITICAL: Sends the token to the backend
        }
      }
    );}

    catch{setLiked(!next);setLikeCount(n=>next?n-1:n+1);}
  },[liked,user,id,navigate]);

  const handleShare=()=>{ navigator.clipboard?.writeText(window.location.href).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2200);}); };

  const handleDeleteComment = async (commentId) => {
    const previous = comments;
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    try {
      await API.delete(`/comments/${commentId}`);
    } catch (err) {
      setComments(previous);
    }
  };

  const handleComment=async()=>{
    if(!commentTxt.trim())return; setSubmitting(true);
    const opt={_id:`opt-${Date.now()}`,content:commentTxt,author:user??{firstName:"You",lastName:"",handle:"you"},createdAt:new Date().toISOString(),likes:0};
    setComments(cs=>[opt,...cs]); setCommentTxt("");
    try{ const{data}=await API.post(`/comments/${id}`,{content:commentTxt}); setComments(cs=>cs.map(c=>c._id===opt._id?data:c)); }
    catch{}
    setSubmitting(false);
  };

  if(loading) return(
    <><Styles/><ProgressBar/><Navbar/>
      <div style={{background:"var(--ink)",minHeight:360,display:"flex",alignItems:"flex-end"}}>
        <div style={{maxWidth:800,margin:"0 auto",width:"100%",padding:"3rem 2rem"}}>
          {[{h:12,w:120,mb:20},{h:52,w:"85%",mb:14},{h:52,w:"60%",mb:28},{h:14,w:240,mb:0}].map((s,i)=>(
            <div key={i} className="sk" style={{height:s.h,width:s.w,marginBottom:s.mb}}/>
          ))}
        </div>
      </div>
      <div style={{maxWidth:800,margin:"3rem auto",padding:"0 2rem"}}>
        {[100,95,88,100,72,90,60].map((w,i)=><div key={i} className="sk" style={{height:18,width:`${w}%`,marginBottom:16}}/>)}
      </div>
    </>
  );

  const p=post; const ac=avatarColor(p.author?.handle);
  // Use Cloudinary-optimised URL for the hero banner
  const bannerSrc = p.banner ? cloudinaryUrl(p.banner,"w_1400,h_560,c_fill,f_auto,q_auto") : null;

  return(
    <><Styles/><ProgressBar/><Navbar/>

      {/* HERO */}
      <div className="post-hero" style={{minHeight:bannerSrc?500:380}}>
        {bannerSrc && <img className="hero-img" src={bannerSrc} alt={p.title}/>}
        <div className="hero-grad"/><div className="hero-texture"/>
        <div className="hero-content page-fade">
          <div className="hero-tags">{p.tags?.map(t=><span key={t} className="hero-tag">{t}</span>)}</div>
          <h1 className="hero-title">{p.title}</h1>
          <div className="hero-byline">
            <div className="byline-av" style={{background:ac}}>{initials(p.author)}</div>
            <div>
              <div className="byline-name">{p.author?.firstName} {p.author?.lastName}</div>
              <div className="byline-sub">@{p.author?.handle} &nbsp;·&nbsp; {timeAgo(p.createdAt)}</div>
            </div>
            <div className="byline-sep"/>
            <span className="byline-stat"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{p.readTime} min read</span>
            <span className="byline-stat"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>{(p.views??0).toLocaleString()} views</span>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="body-layout">
        <main>
          <div className="article-wrap page-fade">
            <div className="article-body" dangerouslySetInnerHTML={{__html:p.content}}/>

            {/* Reaction bar */}
            <div className="reaction-bar">
              <button className={`react-btn ${liked?"liked":""}`} onClick={handleLike}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill={liked?"currentColor":"none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {likeCount} {likeCount===1?"Like":"Likes"}
              </button>
              <button className="react-btn" onClick={()=>document.querySelector(".cf-textarea")?.focus()}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {comments.length} {comments.length===1?"Comment":"Comments"}
              </button>
              <button className="react-share" onClick={handleShare}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Share {copied&&<span className="copied-badge">Link copied!</span>}
              </button>
            </div>

            {/* Author bio */}
            <div className="author-card">
              <div className="author-card-inner">
                <div className="author-big-av" style={{background:ac}}>{initials(p.author)}</div>
                <div>
                  <div className="author-card-name">{p.author?.firstName} {p.author?.lastName}</div>
                  <div className="author-card-handle">@{p.author?.handle}</div>
                  <div className="author-card-bio">{p.author?.bio||"Writer on BlogSync."}</div>
                </div>
              </div>
              <div className="author-card-btns">
                <button className={`ac-btn ac-follow ${following?"on":""}`} onClick={async () => {
                  if (!user) { navigate("/auth"); return; }
                  const prev = following;
                  setFollowing(!prev);
                  // optimistic update of follower count
                  setPost((p) => p ? { ...p, author: { ...p.author, followers: (p.author.followers || 0) + (prev ? -1 : 1) } } : p);
                  try {
                    if (prev) await unfollowUser(post.author.handle);
                    else await followUser(post.author.handle);
                  } catch (err) {
                    // revert on error
                    setFollowing(prev);
                    setPost((p) => p ? { ...p, author: { ...p.author, followers: (p.author.followers || 0) + (prev ? 1 : -1) } } : p);
                  }
                }}>{following?"Following ✓":"+ Follow"}</button>
                <Link to={`/profile/${p.author?.handle}`}><button className="ac-btn ac-profile">View Profile →</button></Link>
              </div>
            </div>

            {/* Comments */}
            <div className="comments-wrap">
              <div className="comments-heading">{comments.length} Response{comments.length!==1?"s":""}</div>
              {user ? (
                <div className="comment-form">
                  <div className="cf-inner">
                    <div className="cf-av" style={{background:avatarColor(user.handle)}}>{initials(user)}</div>
                    <textarea className="cf-textarea" placeholder="Share your thoughts…" value={commentTxt} onChange={e=>setCommentTxt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey))handleComment();}}/>
                  </div>
                  <button className="cf-submit" onClick={handleComment} disabled={!commentTxt.trim()||submitting}>{submitting?"Posting…":"Post Response →"}</button>
                </div>
              ) : (
                <div className="login-prompt"><a onClick={()=>navigate("/auth")}>Sign in</a> to leave a response.</div>
              )}
              <div className="comment-list">{comments.map(c=><CommentItem key={c._id} comment={c} currentUser={user} onDelete={handleDeleteComment}/> )}</div>
            </div>
          </div>
        </main>

        {/* SIDEBAR */}
        <aside className="post-sidebar">
          <TOC html={p.content} active={tocActive} onSelect={setTocActive}/>
          <div className="sb-section">
            <div className="sb-label">Written By</div>
            <div className="sb-av-row">
              <div className="sb-av" style={{background:ac}}>{initials(p.author)}</div>
              <div><div className="sb-aname">{p.author?.firstName} {p.author?.lastName}</div><div className="sb-ahandle">@{p.author?.handle}</div></div>
            </div>
            <p className="sb-abio">{(p.author?.bio??"Writer on BlogSync.").slice(0,120)}…</p>
            <button className={`sb-follow ${following?"on":""}`} onClick={async () => {
              if (!user) { navigate('/auth'); return; }
              const prev = following;
              setFollowing(!prev);
              setPost((p) => p ? { ...p, author: { ...p.author, followers: (p.author.followers || 0) + (prev ? -1 : 1) } } : p);
              try {
                if (prev) await unfollowUser(post.author.handle);
                else await followUser(post.author.handle);
              } catch (err) {
                setFollowing(prev);
                setPost((p) => p ? { ...p, author: { ...p.author, followers: (p.author.followers || 0) + (prev ? 1 : -1) } } : p);
              }
            }}>{following?"Following ✓":"+ Follow Author"}</button>
          </div>
          <div className="sb-section">
            <div className="sb-label">More Like This</div>
            {RELATED.map(r=>(
              <div key={r._id} className="related-item" onClick={()=>navigate(`/blog/${r._id}`)}>
                <div className="related-title">{r.title}</div>
                <div className="related-meta">{r.author.firstName} {r.author.lastName} · {r.readTime} min read</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}

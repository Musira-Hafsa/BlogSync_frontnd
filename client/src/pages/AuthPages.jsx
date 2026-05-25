 // ─────────────────────────────────────────────────────────────────
 //  BlogSync — AuthPages.jsx
 //  Bold magazine-style Login & Signup
 //  Fully wired to Express + MongoDB backend
 // ─────────────────────────────────────────────────────────────────
 import { useState } from "react";
 import axios from "axios";
 import { useNavigate } from "react-router-dom";
 import ThemeToggle from "../components/ThemeToggle";
 
 const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL 
    ? `${import.meta.env.VITE_API_BASE_URL}/api` 
    : "http://localhost:5000/api",
  withCredentials: true 
});

 const Styles = () => (
   <style>{`
     @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
     *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
     :root{--ink:#0a0a0a;--paper:#f5f0e8;--cream:#faf7f2;--red:#c8281e;--red-dk:#9e1e16;--muted:#6b6560;--border:#d8d0c4;--white:#ffffff;}
     html,body{height:100%;background:var(--cream);}
     .auth-wrap{min-height:100vh;display:flex;font-family:'DM Sans',sans-serif;background:var(--cream);}
     .auth-left{width:46%;background:var(--ink);position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:3rem;overflow:hidden;}
     .auth-left::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(255,255,255,.04) 79px,rgba(255,255,255,.04) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(255,255,255,.04) 79px,rgba(255,255,255,.04) 80px);pointer-events:none;}
     .auth-left::after{content:'';position:absolute;bottom:-120px;right:-120px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(200,40,30,.18) 0%,transparent 70%);pointer-events:none;}
     .left-logo{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:900;color:#fff;letter-spacing:-.02em;z-index:1;cursor:pointer;transition:opacity .2s;}
     .left-logo:hover{opacity:.8;}
     .left-logo span{color:var(--red);}
     .left-hero{z-index:1;}
     .left-issue{font-size:.68rem;letter-spacing:.18em;color:var(--red);text-transform:uppercase;font-weight:500;margin-bottom:1.4rem;}
     .left-headline{font-family:'Playfair Display',serif;font-size:clamp(2.8rem,4vw,4.4rem);line-height:1.04;color:#fff;font-weight:900;letter-spacing:-.02em;margin-bottom:1.5rem;}
     .left-headline em{font-style:italic;color:var(--paper);}
     .left-sub{font-size:.875rem;color:rgba(255,255,255,.45);font-weight:300;line-height:1.65;max-width:320px;}
     .left-footer{z-index:1;display:flex;align-items:center;gap:1.5rem;}
     .lstat-num{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700;color:#fff;}
     .lstat-label{font-size:.64rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.33);}
     .ldiv{width:1px;height:38px;background:rgba(255,255,255,.14);}
     .auth-right{flex:1;display:flex;flex-direction:column;justify-content:center;padding:3rem 4rem;background:var(--cream);position:relative;overflow-y:auto;}
     .auth-right::before{content:'BLOGSYNC / 2025';position:absolute;top:2rem;right:3rem;font-size:.62rem;letter-spacing:.15em;text-transform:uppercase;color:var(--border);font-weight:500;}
     .form-eyebrow{font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;color:var(--red);font-weight:500;margin-bottom:.5rem;}
     .form-title{font-family:'Playfair Display',serif;font-size:clamp(2rem,3vw,2.9rem);font-weight:900;color:var(--ink);letter-spacing:-.02em;line-height:1.08;margin-bottom:.4rem;}
     .form-subtitle{font-size:.855rem;color:var(--muted);font-weight:300;margin-bottom:2rem;}
     .tab-row{display:flex;border-bottom:1.5px solid var(--border);margin-bottom:2rem;}
     .tab-btn{background:none;border:none;cursor:pointer;padding:.55rem 0;margin-right:2rem;font-family:'DM Sans',sans-serif;font-size:.72rem;font-weight:500;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);position:relative;transition:color .2s;}
     .tab-btn::after{content:'';position:absolute;bottom:-1.5px;left:0;right:0;height:1.5px;background:var(--ink);transform:scaleX(0);transition:transform .25s ease;}
     .tab-btn.active{color:var(--ink);}.tab-btn.active::after{transform:scaleX(1);}
     .alert{padding:.75rem 1rem;font-size:.8rem;font-weight:500;margin-bottom:1.2rem;display:flex;align-items:center;gap:.5rem;border-left:3px solid;animation:fadeUp .25s ease forwards;}
     .alert-error{background:#fdf2f2;color:#b91c1c;border-color:#b91c1c;}
     .field-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;}
     .field{margin-bottom:.9rem;}
     .field label{display:block;font-size:.63rem;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);font-weight:500;margin-bottom:.35rem;}
     .field-inner{position:relative;}
     .field input{width:100%;background:var(--white);border:1px solid var(--border);color:var(--ink);font-family:'DM Sans',sans-serif;font-size:.9rem;padding:.72rem 1rem;outline:none;transition:border-color .2s,box-shadow .2s;border-radius:0;}
     .field input:focus{border-color:var(--ink);box-shadow:0 0 0 3px rgba(10,10,10,.06);}
     .field input.err{border-color:#b91c1c;}
     .field input::placeholder{color:#c5bdb6;}
     .field-hint{font-size:.68rem;color:var(--muted);margin-top:.3rem;}
     .field-error{font-size:.68rem;color:#b91c1c;margin-top:.3rem;}
     .pw-toggle{position:absolute;right:.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted);padding:0;line-height:1;transition:color .15s;}
     .pw-toggle:hover{color:var(--ink);}
     .row-between{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.6rem;}
     .checkbox-label{display:flex;align-items:center;gap:.45rem;font-size:.78rem;color:var(--muted);cursor:pointer;}
     .checkbox-label input[type=checkbox]{accent-color:var(--ink);width:13px;height:13px;}
     .forgot{font-size:.75rem;color:var(--muted);border-bottom:1px solid transparent;cursor:pointer;transition:all .2s;}
     .forgot:hover{color:var(--ink);border-color:var(--ink);}
     .pw-strength{margin-top:.4rem;}
     .pw-bars{display:flex;gap:3px;margin-bottom:.2rem;}
     .pw-bar{height:3px;flex:1;background:var(--border);transition:background .3s;}
     .pw-bar.weak{background:#ef4444;}.pw-bar.fair{background:#f97316;}.pw-bar.good{background:#eab308;}.pw-bar.strong{background:#22c55e;}
     .pw-label{font-size:.63rem;color:var(--muted);}
     .btn-primary{width:100%;background:var(--ink);color:#fff;border:none;font-family:'DM Sans',sans-serif;font-size:.74rem;font-weight:500;letter-spacing:.18em;text-transform:uppercase;padding:.95rem;cursor:pointer;transition:background .2s,transform .1s;border-radius:0;margin-bottom:1.4rem;display:flex;align-items:center;justify-content:center;gap:.6rem;}
     .btn-primary:hover:not(:disabled){background:var(--red);}
     .btn-primary:active:not(:disabled){transform:scale(.99);}
     .btn-primary:disabled{opacity:.65;cursor:not-allowed;}
     .spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}
     @keyframes spin{to{transform:rotate(360deg)}}
     .or-divider{display:flex;align-items:center;gap:.8rem;margin-bottom:1.3rem;}
     .or-divider span{font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:var(--border);white-space:nowrap;}
     .or-divider::before,.or-divider::after{content:'';flex:1;height:1px;background:var(--border);}
     .social-row{display:flex;gap:.7rem;margin-bottom:1.8rem;}
     .btn-social{flex:1;display:flex;align-items:center;justify-content:center;gap:.45rem;background:var(--white);border:1px solid var(--border);font-family:'DM Sans',sans-serif;font-size:.75rem;font-weight:500;color:var(--ink);padding:.65rem .4rem;cursor:pointer;transition:all .2s;border-radius:0;}
     .btn-social:hover{background:var(--paper);border-color:var(--ink);}
     .terms-note{font-size:.7rem;color:var(--muted);line-height:1.6;text-align:center;}
     .terms-note a{color:var(--ink);text-decoration:underline;cursor:pointer;}
     .success-box{display:flex;flex-direction:column;align-items:center;text-align:center;padding:2.5rem 0;animation:fadeUp .4s ease forwards;}
     .success-icon{width:58px;height:58px;background:var(--ink);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem;}
     .success-box h3{font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:700;color:var(--ink);margin-bottom:.5rem;}
     .success-box p{font-size:.875rem;color:var(--muted);}
     @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
     .form-fade{animation:fadeUp .28s ease forwards;}
     @media(max-width:820px){.auth-left{display:none;}.auth-right{padding:2.5rem 1.75rem;}.field-row{grid-template-columns:1fr;}.auth-right::before{display:none;}}
 
     /* Dark mode overrides for auth page */
     [data-theme="dark"] .auth-right{background:var(--bg-page) !important;}
     [data-theme="dark"] .auth-right::before{color:var(--border) !important;}
     [data-theme="dark"] .form-title{color:var(--text-primary) !important;}
     [data-theme="dark"] .tab-row{border-color:var(--border) !important;}
     [data-theme="dark"] .or-divider::before,[data-theme="dark"] .or-divider::after{background:var(--border) !important;}
     [data-theme="dark"] .btn-social{background:var(--bg-card) !important;border-color:var(--border) !important;color:var(--text-primary) !important;}
     [data-theme="dark"] .btn-social:hover{background:var(--bg-card-alt) !important;border-color:var(--text-primary) !important;}
     [data-theme="dark"] .success-box h3{color:var(--text-primary) !important;}
     [data-theme="dark"] .success-icon{background:var(--ink) !important;}
   `}</style>
 );
 
 const GoogleIcon = () => (
   <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
     <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
     <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
     <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
     <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
   </svg>
 );
 const GithubIcon = () => (
   <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
     <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
   </svg>
 );
 const EyeIcon = ({ off }) => off ? (
   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
     <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
     <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
     <line x1="1" y1="1" x2="23" y2="23"/>
   </svg>
 ) : (
   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
     <circle cx="12" cy="12" r="3"/>
   </svg>
 );
 const CheckIcon = () => (
   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
     <polyline points="20 6 9 17 4 12"/>
   </svg>
 );
 
 function getStrength(pw) {
   if (!pw) return { score: 0, label: "", level: "" };
   let s = 0;
   if (pw.length >= 8) s++;
   if (/[A-Z]/.test(pw)) s++;
   if (/[0-9]/.test(pw)) s++;
   if (/[^A-Za-z0-9]/.test(pw)) s++;
   return { score: s, label: ["","Weak","Fair","Good","Strong"][s], level: ["","weak","fair","good","strong"][s] };
 }
 
 function PasswordInput({ value, onChange, placeholder, error, showStrength }) {
   const [show, setShow] = useState(false);
   const str = showStrength ? getStrength(value) : null;
   return (
     <>
       <div className="field-inner">
         <input type={show ? "text" : "password"} placeholder={placeholder || "••••••••"}
           value={value} onChange={onChange} className={error ? "err" : ""}
           style={{ paddingRight: "2.5rem" }} required />
         <button type="button" className="pw-toggle" onClick={() => setShow(s => !s)}>
           <EyeIcon off={show} />
         </button>
       </div>
       {showStrength && value && (
         <div className="pw-strength">
           <div className="pw-bars">
             {[1,2,3,4].map(i => <div key={i} className={`pw-bar ${i <= str.score ? str.level : ""}`} />)}
           </div>
           <span className="pw-label">{str.label}</span>
         </div>
       )}
       {error && <p className="field-error">{error}</p>}
     </>
   );
 }
 
 function LoginForm({ onSuccess }) {
   const [email, setEmail]       = useState("");
   const [password, setPassword] = useState("");
   const [remember, setRemember] = useState(false);
   const [loading, setLoading]   = useState(false);
   const [error, setError]       = useState("");
 
   const handleSubmit = async (e) => {
     e.preventDefault(); setError(""); setLoading(true);
     try {
       const { data } = await API.post("/auth/login", { email, password });
       (remember ? localStorage : sessionStorage).setItem("bs_token", data.token);
       (remember ? localStorage : sessionStorage).setItem("bs_user", JSON.stringify(data.user));
       onSuccess(data.user);
     } catch (err) {
       setError(err.response?.data?.message || (err.code === "ERR_NETWORK" ? "Cannot reach server on port 5000." : "Login failed."));
     } finally { setLoading(false); }
   };
 
const googleLogin = () => {
  // 🟩 Dynamically uses your live server url if VITE_API_BASE_URL is not set
  const baseURL = import.meta.env.VITE_API_BASE_URL || "https://blog-sync-backend-two.vercel.app";
  window.location.href = `${baseURL}/api/auth/google`;
};

const githubLogin = () => {
  // 🟩 Works perfectly both on localhost and on your live Vercel site
  const baseURL = import.meta.env.VITE_API_BASE_URL || "https://blog-sync-backend-two.vercel.app";
  window.location.href = `${baseURL}/api/auth/github`;
};
   return (
     <form onSubmit={handleSubmit} className="form-fade">
       {error && <div className="alert alert-error"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
       <div className="field"><label>Email Address</label><input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
       <div className="field"><label>Password</label><PasswordInput value={password} onChange={e => setPassword(e.target.value)} /></div>
       <div className="row-between">
         <label className="checkbox-label"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Remember me</label>
         <span className="forgot">Forgot password?</span>
       </div>
       <button className="btn-primary" type="submit" disabled={loading}>
         {loading ? <><div className="spinner" /> Signing in…</> : "Sign In →"}
       </button>
       <div className="or-divider"><span>or continue with</span></div>
       <div className="social-row">
         <button type="button" className="btn-social" onClick={googleLogin}>
           <GoogleIcon /> <span>Google</span>
         </button>
         <button type="button" className="btn-social" onClick={githubLogin}>
           <GithubIcon /> <span>GitHub</span>
         </button>
       </div>
     </form>
   );
 }
 
 function SignupForm({ onSuccess }) {
   const [form, setForm] = useState({ firstName: "", lastName: "", email: "", handle: "", password: "", confirm: "" });
   const [errors, setErrors]   = useState({});
   const [loading, setLoading] = useState(false);
   const [error, setError]     = useState("");
   const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
 
   const validate = () => {
     const errs = {};
     if (!form.firstName.trim())         errs.firstName = "Required";
     if (!form.lastName.trim())          errs.lastName  = "Required";
     if (!form.email.includes("@"))      errs.email     = "Enter a valid email";
     if (!form.handle.trim())            errs.handle    = "Required";
     if (form.password.length < 8)       errs.password  = "Min. 8 characters";
     if (form.password !== form.confirm) errs.confirm   = "Passwords don't match";
     return errs;
   };
 
   const handleSubmit = async (e) => {
     e.preventDefault(); setError("");
     const errs = validate();
     if (Object.keys(errs).length) { setErrors(errs); return; }
     setErrors({}); setLoading(true);
     try {
       const { firstName, lastName, email, handle, password } = form;
       const { data } = await API.post("/auth/register", { firstName, lastName, email, handle: handle.replace(/^@/, ""), password });
       localStorage.setItem("bs_token", data.token);
       localStorage.setItem("bs_user", JSON.stringify(data.user));
       onSuccess(data.user);
     } catch (err) {
       setError(err.response?.data?.message || (err.code === "ERR_NETWORK" ? "Cannot reach server on port 5000." : "Registration failed."));
     } finally { setLoading(false); }
   };
 
  const googleLogin = () => {
  // Swaps dynamically based on environment
  const backendURL = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://blog-sync-backend-two.vercel.app";

  window.location.href = `${backendURL}/api/auth/google`;
};

const githubLogin = () => {
  // Swaps dynamically based on environment
  const backendURL = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://blog-sync-backend-two.vercel.app";

  window.location.href = `${backendURL}/api/auth/github`;
};

   return (
     <form onSubmit={handleSubmit} className="form-fade">
       {error && <div className="alert alert-error"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
       <div className="field-row">
         <div className="field" style={{ marginBottom:0 }}><label>First Name</label><input placeholder="Jane" value={form.firstName} onChange={set("firstName")} className={errors.firstName?"err":""} />{errors.firstName&&<p className="field-error">{errors.firstName}</p>}</div>
         <div className="field" style={{ marginBottom:0 }}><label>Last Name</label><input placeholder="Doe" value={form.lastName} onChange={set("lastName")} className={errors.lastName?"err":""} />{errors.lastName&&<p className="field-error">{errors.lastName}</p>}</div>
       </div>
       <div className="field"><label>Email Address</label><input type="email" placeholder="jane@example.com" value={form.email} onChange={set("email")} className={errors.email?"err":""} />{errors.email&&<p className="field-error">{errors.email}</p>}</div>
       <div className="field"><label>Username / Handle</label><input placeholder="@janedoe" value={form.handle} onChange={set("handle")} className={errors.handle?"err":""} />{errors.handle?<p className="field-error">{errors.handle}</p>:<p className="field-hint">Your public author handle</p>}</div>
       <div className="field"><label>Password</label><PasswordInput value={form.password} onChange={set("password")} placeholder="Min. 8 characters" error={errors.password} showStrength /></div>
       <div className="field"><label>Confirm Password</label><PasswordInput value={form.confirm} onChange={set("confirm")} placeholder="Repeat password" error={errors.confirm} /></div>
       <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop:".4rem" }}>
         {loading ? <><div className="spinner" /> Creating account…</> : "Create Account →"}
       </button>
       <div className="or-divider"><span>or sign up with</span></div>
       <div className="social-row">
         <button type="button" className="btn-social" onClick={googleLogin}><GoogleIcon /> Google</button>
         <button type="button" className="btn-social" onClick={githubLogin}><GithubIcon /> GitHub</button>
       </div>
       <p className="terms-note">By creating an account you agree to our <a>Terms of Service</a> and <a>Privacy Policy</a>.</p>
     </form>
   );
 }
 
 function SuccessState({ user, mode }) {
   return (
     <div className="success-box">
       <div className="success-icon"><CheckIcon /></div>
       <h3>{mode === "login" ? "Welcome back." : "You're in."}</h3>
       <p style={{ marginTop:".3rem" }}>{mode === "login" ? `Good to see you, ${user?.firstName||""}. Redirecting…` : `Account created! Welcome, ${user?.firstName||""}. Taking you to your feed…`}</p>
     </div>
   );
 }
 
 export default function AuthPages() {
   const navigate = useNavigate();
   const [tab,  setTab]  = useState("login");
   const [done, setDone] = useState(false);
   const [user, setUser] = useState(null);
 
   const handleSuccess = (u) => { setUser(u); setDone(true); setTimeout(() => navigate("/"), 1800); };
   const switchTab = (t) => { setDone(false); setUser(null); setTab(t); };
 

   return (
     <>
       <Styles />
       <div className="auth-wrap">
         <div className="auth-left">
           <div className="left-logo" onClick={() => navigate("/")} title="Back to homepage">Blog<span>Sync</span></div>
           <div className="left-hero">
             <p className="left-issue">Vol. 01 — The Writer's Edition</p>
             <h1 className="left-headline">Words that<br /><em>move</em><br />the world.</h1>
             <p className="left-sub">Publish your ideas. Build your audience. Join thousands of writers who chose craft over noise.</p>
           </div>
           <div className="left-footer">
             <div><div className="lstat-num">48K+</div><div className="lstat-label">Writers</div></div>
             <div className="ldiv" />
             <div><div className="lstat-num">2.1M</div><div className="lstat-label">Readers</div></div>
             <div className="ldiv" />
             <div><div className="lstat-num">340K</div><div className="lstat-label">Posts</div></div>
           </div>
         </div>
         <div className="auth-right">
           {/* Theme toggle — top right corner */}
           <div style={{ position:"absolute", top:"1.5rem", left:"1.5rem", zIndex:10 }}>
             <ThemeToggle />
           </div>
           {done ? <SuccessState user={user} mode={tab} /> : (
             <>
               <p className="form-eyebrow">{tab === "login" ? "Welcome back" : "Get started"}</p>
               <h2 className="form-title">{tab === "login" ? "Sign In" : "Create Account"}</h2>
               <p className="form-subtitle">{tab === "login" ? "Enter your credentials to access your dashboard." : "Join the community. It's free, forever."}</p>
               <div className="tab-row">
                 <button className={`tab-btn ${tab==="login"?"active":""}`} onClick={() => switchTab("login")}>Sign In</button>
                 <button className={`tab-btn ${tab==="signup"?"active":""}`} onClick={() => switchTab("signup")}>Sign Up</button>
               </div>
               {tab === "login" ? <LoginForm onSuccess={handleSuccess} /> : <SignupForm onSuccess={handleSuccess} />}
             </>
           )}
         </div>
       </div>
     </>
   );
 }
 
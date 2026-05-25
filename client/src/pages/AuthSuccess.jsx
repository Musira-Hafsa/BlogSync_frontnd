import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");

    if (token) {
      // 1. Save to localStorage for context state tracking
      localStorage.setItem("bs_token", token);
      
      // 2. 🚀 FIX: Save it as a Cookie so your Axios 'withCredentials: true' can see it!
      document.cookie = `token=${token}; path=/; max-age=604800; SameSite=None; Secure`;

      // 3. Optional: If you have a custom context login trigger, call it here
      // Example: login(token);

      // 4. Force push the router past the home page guard
      navigate("/"); 
    } else {
      navigate("/auth");
    }
  }, [params, navigate]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white">
      <h2 className="text-xl font-medium animate-pulse">Completing secure sign in...</h2>
    </div>
  );
}
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");

    if (token) {
      localStorage.setItem("bs_token", token);
      navigate("/");
    } else {
      navigate("/auth");
    }
  }, []);

  return <h2>Signing in...</h2>;
}
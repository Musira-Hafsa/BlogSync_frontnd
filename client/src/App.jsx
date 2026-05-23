import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import GlobalTheme       from "./context/GlobalTheme";
import AuthPages from "./pages/AuthPages";
import Home, { Writers } from "./pages/Home";
import BlogPost  from "./pages/BlogPost";
import Editor    from "./pages/Editor";
import Profile   from "./pages/Profile";
import AuthSuccess from "./pages/AuthSuccess";

function PrivateRoute({ children }) {
  const token =
    localStorage.getItem("bs_token") ||
    sessionStorage.getItem("bs_token");
  return token ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      {/* Injects all CSS variables + global transitions for both themes */}
      <GlobalTheme />

      <BrowserRouter>
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/auth"            element={<AuthPages />} />
          <Route path="/blog/:id"        element={<BlogPost />} />
          <Route path="/profile/:handle" element={<Profile />} />
          <Route path="/writers" element={<Writers />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/editor" element={
            <PrivateRoute><Editor /></PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}


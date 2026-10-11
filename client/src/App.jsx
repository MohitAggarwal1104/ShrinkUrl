// import { useEffect, useState } from "react";
// import { Link2, LogOut, ShieldCheck, Sparkles } from "lucide-react";
// import AuthForm from "./components/AuthForm.jsx";
// import Dashboard from "./components/Dashboard.jsx";
// import { api } from "./api.js";

// export default function App() {
//   const [token, setToken] = useState(() => localStorage.getItem("linklite_token") || "");
//   const [user, setUser] = useState(null);
//   const [checking, setChecking] = useState(Boolean(token));
//   const [authMode, setAuthMode] = useState("login");

//   useEffect(() => {
//     if (!token) { setChecking(false); return; }
//     api("/auth/me", { token })
//       .then(data => setUser(data.user))
//       .catch(() => { localStorage.removeItem("linklite_token"); setToken(""); })
//       .finally(() => setChecking(false));
//   }, [token]);

//   function onAuth(data) {
//     localStorage.setItem("linklite_token", data.token);
//     setToken(data.token);
//     setUser(data.user);
//   }

//   function logout() {
//     localStorage.removeItem("linklite_token");
//     setToken("");
//     setUser(null);
//   }

//   return (
//     <div className="app-shell">
//       <header className="topbar">
//         <a className="brand" href="#"><span className="brand-icon"><Link2 size={21} /></span> linklite<span className="brand-dot">.</span></a>
//         <div className="topbar-right">
//           <span className="secure-note"><ShieldCheck size={15} /> Simple. Secure. Trackable.</span>
//           {user && <button className="button button-ghost logout" onClick={logout}><LogOut size={16} /> Log out</button>}
//         </div>
//       </header>

//       <main className="main-content">
//         <section className="hero">
//           <div className="eyebrow"><Sparkles size={14} /> YOUR LINKS, SIMPLIFIED</div>
//           <h1>Long links.<br /><span>Short story.</span></h1>
//           <p className="hero-copy">Turn messy URLs into clean, memorable links. Track every click and share your links anywhere.</p>
//           <div className="feature-row">
//             <span><span className="feature-dot purple" /> Custom aliases</span>
//             <span><span className="feature-dot blue" /> Click analytics</span>
//             <span><span className="feature-dot green" /> QR codes</span>
//           </div>
//         </section>

//         {checking ? <div className="panel loading">Checking your session…</div> : user ? (
//           <Dashboard token={token} user={user} />
//         ) : (
//           <AuthForm mode={authMode} setMode={setAuthMode} onAuth={onAuth} />
//         )}
//         <footer>Made for links that go places <span>·</span> LinkLite</footer>
//       </main>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import {
  Link2,
  LogOut,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Heart
} from "lucide-react";

import AuthForm from "./components/AuthForm.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { api } from "./api.js";

export default function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("linklite_token") || ""
  );
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(token));
  const [authMode, setAuthMode] = useState("login");

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }

    api("/auth/me", { token })
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("linklite_token");
        setToken("");
      })
      .finally(() => setChecking(false));
  }, [token]);

  function onAuth(data) {
    localStorage.setItem("linklite_token", data.token);
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("linklite_token");
    setToken("");
    setUser(null);
    setAuthMode("login");
  }

  function backToTop(event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="LinkLite home">
          <span className="brand-icon">
            <Link2 size={21} />
          </span>
          linklite<span className="brand-dot">.</span>
        </a>

        <div className="topbar-right">
          <span className="secure-note">
            <ShieldCheck size={15} />
            Simple. Secure. Trackable.
          </span>

          {user && (
            <button
              className="button button-ghost logout"
              onClick={logout}
            >
              <LogOut size={16} />
              Log out
            </button>
          )}
        </div>
      </header>

      <main
        className={`main-content ${
          user ? "has-dashboard" : "has-auth"
        }`}
      >
        {checking ? (
          <div className="panel loading">
            Checking your session…
          </div>
        ) : user ? (
          <Dashboard token={token} user={user} />
        ) : (
          <AuthForm
            mode={authMode}
            setMode={setAuthMode}
            onAuth={onAuth}
          />
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-glow footer-glow-one" />
        <div className="footer-glow footer-glow-two" />

        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <span className="footer-brand-icon">
                <Link2 size={25} />
              </span>

              <span>
                linklite<span className="footer-brand-dot">.</span>
              </span>
            </div>

            <h2>
              Make every link
              <br />
              <span>go further.</span>
            </h2>

            <p className="footer-description">
              Short, memorable links. Useful click insights. Easy
              sharing. Everything you need to make your URLs work
              smarter.
            </p>

            <div className="footer-pills">
              <span>
                <Sparkles size={14} />
                Shorten smarter
              </span>

              <span>
                <ShieldCheck size={14} />
                Built for simplicity
              </span>
            </div>
          </div>

          <div className="footer-side">
            <div className="footer-orbit" aria-hidden="true">
              <div className="orbit-ring orbit-ring-one" />
              <div className="orbit-ring orbit-ring-two" />

              <div className="orbit-center">
                <Link2 size={31} />
              </div>

              <span className="orbit-dot orbit-dot-one" />
              <span className="orbit-dot orbit-dot-two" />
              <span className="orbit-dot orbit-dot-three" />
            </div>

            <a
              className="footer-back-top"
              href="#top"
              onClick={backToTop}
            >
              Back to top
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} LinkLite. All rights reserved.
          </span>

          <span className="footer-made">
            Made with <Heart size={13} fill="currentColor" />
            for links that go places.
          </span>
        </div>
      </footer>
    </div>
  );
}

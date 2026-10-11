import { useState } from "react";
import { ArrowRight, Link2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { api } from "../api.js";

export default function AuthForm({ mode, setMode, onAuth }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) { setForm(current => ({ ...current, [key]: value })); }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api(`/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(form)
      });
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel auth-panel">
      <div className="panel-heading">
        <div className="panel-symbol"><Link2 size={20} /></div>
        <div><h2>{isRegister ? "Create your account" : "Welcome back"}</h2><p>{isRegister ? "Start shortening links in seconds." : "Log in to manage your links."}</p></div>
      </div>
      <div className="auth-tabs">
        <button className={!isRegister ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Log in</button>
        <button className={isRegister ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>Create account</button>
      </div>
      <form onSubmit={submit} className="form-stack">
        {isRegister && <label className="field-label">Full name<div className="input-wrap"><UserRound size={17} /><input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Your name" autoComplete="name" required minLength={2} /></div></label>}
        <label className="field-label">Email address<div className="input-wrap"><Mail size={17} /><input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@example.com" autoComplete="email" required /></div></label>
        <label className="field-label">Password<div className="input-wrap"><LockKeyhole size={17} /><input type="password" value={form.password} onChange={e => update("password", e.target.value)} placeholder={isRegister ? "At least 8 characters" : "Enter your password"} autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 8 : 1} required /></div></label>
        {error && <p className="form-error">{error}</p>}
        <button className="button button-primary submit-button" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Log in"} <ArrowRight size={17} /></button>
      </form>
      <p className="auth-footnote">Your links stay organized in one place.</p>
    </section>
  );
}

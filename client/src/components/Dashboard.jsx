// import { useCallback, useEffect, useState } from "react";
// import {
//   ArrowUpRight,
//   BarChart3,
//   Link2,
//   Plus,
//   RefreshCw
// } from "lucide-react";

// import { api } from "../api.js";
// import LinkCard from "./LinkCard.jsx";

// const PAGE_SIZE = 5;

// function Pagination({ pagination, onPageChange }) {
//   if (!pagination || pagination.totalPages <= 1) return null;

//   const { page, totalPages, total, limit } = pagination;

//   return (
//     <div className="pagination">
//       <span className="pagination-info">
//         Showing {(page - 1) * limit + 1}–
//         {Math.min(page * limit, total)} of {total}
//       </span>

//       <div className="pagination-controls">
//         <button
//           className="page-button"
//           disabled={page <= 1}
//           onClick={() => onPageChange(page - 1)}
//         >
//           Previous
//         </button>

//         <span className="page-indicator">
//           {page} / {totalPages}
//         </span>

//         <button
//           className="page-button"
//           disabled={page >= totalPages}
//           onClick={() => onPageChange(page + 1)}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }

// function SmashAnimation({ originalUrl, alias, resultCode }) {
//   const resultReady = Boolean(resultCode);

//   return (
//     <div
//       className={`smash-scene ${resultReady ? "smash-complete" : ""}`}
//       role="status"
//       aria-live="polite"
//     >
//       <div className="scene-label">
//         {resultReady ? "LINK CREATED SUCCESSFULLY" : "LINKLITE SMASH LAB"}
//       </div>

//       <div className="smash-stage">
//         <div className="url-plank">
//           <Link2 size={17} />
//           <span>{originalUrl}</span>
//         </div>

//         <div className="broken-piece broken-left">
//           <span>{originalUrl.slice(0, Math.ceil(originalUrl.length / 2))}</span>
//         </div>

//         <div className="broken-piece broken-right">
//           <span>{originalUrl.slice(Math.ceil(originalUrl.length / 2))}</span>
//         </div>

//         <div className="real-hammer" aria-hidden="true">
//           <div className="hammer-handle" />
//           <div className="hammer-head">
//             <div className="hammer-face" />
//           </div>
//         </div>

//         <div className="impact-burst" aria-hidden="true">
//           {Array.from({ length: 6 }, (_, index) => (
//             <i key={index} />
//           ))}
//         </div>

//         <div className="debris debris-one" />
//         <div className="debris debris-two" />
//         <div className="debris debris-three" />
//         <div className="debris debris-four" />

//         {resultReady && (
//           <div className="forged-result">
//             <div className="result-check">✓</div>

//             <span className="result-label">
//               YOUR NEW SHORT LINK
//             </span>

//             <strong>
//               {`${window.location.protocol}//${window.location.host.replace(
//                 ":5173",
//                 ":5000"
//               )}/${resultCode}`}
//             </strong>

//             <span className="result-caption">
//               Long link destroyed. Short link forged.
//             </span>
//           </div>
//         )}
//       </div>

//       <p className="scene-caption">
//         {resultReady
//           ? "Ready to copy, share, and track."
//           : "Stand back… impact imminent!"}
//       </p>
//     </div>
//   );
// }

// export default function Dashboard({ token, user }) {
//   const [links, setLinks] = useState([]);
//   const [globalLinks, setGlobalLinks] = useState([]);

//   const [myPagination, setMyPagination] = useState(null);
//   const [globalPagination, setGlobalPagination] = useState(null);

//   const [myPage, setMyPage] = useState(1);
//   const [globalPage, setGlobalPage] = useState(1);

//   const [originalUrl, setOriginalUrl] = useState("");
//   const [alias, setAlias] = useState("");

//   const [aliasState, setAliasState] = useState({
//     status: "idle",
//     message: "Leave blank for a random short link."
//   });

//   const [busy, setBusy] = useState(false);
//   const [isSmashing, setIsSmashing] = useState(false);
//   const [shortenedCode, setShortenedCode] = useState("");
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");

//   const loadLinks = useCallback(async () => {
//     const [mine, global] = await Promise.all([
//       api(`/urls/my?page=${myPage}&limit=${PAGE_SIZE}`, { token }),
//       api(`/urls/public?page=${globalPage}&limit=${PAGE_SIZE}`)
//     ]);

//     setLinks(mine.links);
//     setMyPagination(mine.pagination);

//     setGlobalLinks(global.links);
//     setGlobalPagination(global.pagination);
//   }, [token, myPage, globalPage]);

//   useEffect(() => {
//     loadLinks().catch((err) => setError(err.message));
//   }, [loadLinks]);

//   useEffect(() => {
//     const normalized = alias.trim().toLowerCase();

//     if (!normalized) {
//       setAliasState({
//         status: "idle",
//         message: "Leave blank for a random short link."
//       });
//       return;
//     }

//     if (!/^[a-zA-Z0-9_-]{3,30}$/.test(normalized)) {
//       setAliasState({
//         status: "invalid",
//         message: "Use 3–30 letters, numbers, hyphens, or underscores."
//       });
//       return;
//     }

//     let cancelled = false;

//     setAliasState({
//       status: "checking",
//       message: "Checking availability…"
//     });

//     const timer = setTimeout(() => {
//       api(
//         `/urls/check-alias?alias=${encodeURIComponent(normalized)}`,
//         { token }
//       )
//         .then((data) => {
//           if (!cancelled) {
//             setAliasState({
//               status: data.available ? "available" : "taken",
//               message: data.message
//             });
//           }
//         })
//         .catch((err) => {
//           if (!cancelled) {
//             setAliasState({
//               status: "invalid",
//               message: err.message
//             });
//           }
//         });
//     }, 350);

//     return () => {
//       cancelled = true;
//       clearTimeout(timer);
//     };
//   }, [alias, token]);

//   async function createLink(event) {
//     event.preventDefault();
//     setError("");
//     setNotice("");
//     setShortenedCode("");

//     if (alias.trim() && aliasState.status !== "available") {
//       setError(
//         "Please choose an available custom alias, or leave the alias blank."
//       );
//       return;
//     }

//     setBusy(true);
//     setIsSmashing(true);

//     try {
//       const animationDelay = new Promise((resolve) =>
//         setTimeout(resolve, 2200)
//       );

//       const [data] = await Promise.all([
//         api("/urls", {
//           token,
//           method: "POST",
//           body: JSON.stringify({
//             originalUrl: originalUrl.trim(),
//             alias: alias.trim()
//           })
//         }),
//         animationDelay
//       ]);

//       setShortenedCode(data.link.code);

//       // Keep the final result visible briefly.
//       await new Promise((resolve) => setTimeout(resolve, 1600));

//       setOriginalUrl("");
//       setAlias("");
//       setMyPage(1);
//       setGlobalPage(1);
//       setNotice("Your URL has been smashed into a short link!");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setBusy(false);
//       setIsSmashing(false);
//     }
//   }

//   async function deleteLink(id) {
//     setError("");

//     try {
//       await api(`/urls/${id}`, {
//         token,
//         method: "DELETE"
//       });

//       await loadLinks();
//     } catch (err) {
//       setError(err.message);
//     }
//   }

//   const totalClicks = links.reduce(
//     (sum, link) => sum + (link.clicks || 0),
//     0
//   );

//   return (
//     <section className="dashboard">
//       <div className="welcome-row">
//         <div>
//           <p className="welcome-kicker">YOUR WORKSPACE</p>
//           <h2>
//             Hey, {user.name.split(" ")[0]}{" "}
//             <span className="wave">✦</span>
//           </h2>
//           <p className="muted">
//             Ready to make your next link shorter?
//           </p>
//         </div>

//         <button
//           className="icon-button"
//           title="Refresh links"
//           onClick={() =>
//             loadLinks().catch((err) => setError(err.message))
//           }
//         >
//           <RefreshCw size={17} />
//         </button>
//       </div>

//       <div className="stats-grid">
//         <div className="stat-card">
//           <span className="stat-icon violet">
//             <Link2 size={18} />
//           </span>
//           <span className="stat-label">YOUR LINKS</span>
//           <strong>{myPagination?.total ?? 0}</strong>
//           <small>Total links you created</small>
//         </div>

//         <div className="stat-card">
//           <span className="stat-icon sky">
//             <BarChart3 size={18} />
//           </span>
//           <span className="stat-label">CLICKS THIS PAGE</span>
//           <strong>{totalClicks.toLocaleString()}</strong>
//           <small>Clicks on displayed links</small>
//         </div>
//       </div>

//       <section className="panel create-panel">
//         <div className="section-title">
//           <div>
//             <span className="section-icon">
//               <Plus size={17} />
//             </span>
//             <h3>Create a short link</h3>
//           </div>
//           <span className="tiny-badge">FREE</span>
//         </div>

//         <form onSubmit={createLink} className="form-stack">
//           <label className="field-label">
//             Destination URL

//             <div className="input-wrap url-input">
//               <Link2 size={17} />
//               <input
//                 type="url"
//                 value={originalUrl}
//                 onChange={(event) => setOriginalUrl(event.target.value)}
//                 placeholder="https://example.com/a/really/long/url"
//                 required
//               />
//             </div>
//           </label>

//           <label className="field-label">
//             Custom alias <span className="optional">(optional)</span>

//             <div className="alias-combo">
//               <span className="alias-prefix">linklite/</span>
//               <input
//                 value={alias}
//                 onChange={(event) => setAlias(event.target.value)}
//                 placeholder="my-awesome-link"
//                 maxLength={30}
//                 autoCapitalize="none"
//               />
//             </div>

//             <span className={`alias-feedback ${aliasState.status}`}>
//               {aliasState.status === "available"
//                 ? "✓ "
//                 : ["taken", "invalid"].includes(aliasState.status)
//                   ? "! "
//                   : ""}
//               {aliasState.message}
//             </span>
//           </label>

//           {error && <p className="form-error">{error}</p>}
//           {notice && <p className="form-success">{notice}</p>}

//           <button
//             className="button button-primary create-button"
//             disabled={
//               busy ||
//               (Boolean(alias.trim()) &&
//                 aliasState.status !== "available")
//             }
//           >
//             {busy ? "Smashing your URL…" : "Shorten URL"}
//             <ArrowUpRight size={17} />
//           </button>
//         </form>

//         {isSmashing && (
//           <SmashAnimation
//             originalUrl={originalUrl}
//             alias={alias}
//             resultCode={shortenedCode}
//           />
//         )}
//       </section>

//       <div className="links-heading">
//         <div>
//           <h3>Your links</h3>
//           <p className="muted">
//             Manage and share your shortened URLs.
//           </p>
//         </div>
//         <span className="count-pill">
//           {myPagination?.total ?? 0}
//         </span>
//       </div>

//       <div className="link-list">
//         {links.map((link) => (
//           <LinkCard
//             key={link._id}
//             link={link}
//             onDelete={deleteLink}
//           />
//         ))}

//         {!links.length && (
//           <div className="empty-state">
//             <div className="empty-icon">
//               <Link2 size={23} />
//             </div>
//             <strong>No links on this page</strong>
//             <p>Create your first short link above.</p>
//           </div>
//         )}
//       </div>

//       <Pagination
//         pagination={myPagination}
//         onPageChange={setMyPage}
//       />

//       <div className="links-heading global-heading">
//         <div>
//           <h3>Global links</h3>
//           <p className="muted">
//             Recently shortened links shared by everyone.
//           </p>
//         </div>
//         <span className="count-pill">
//           {globalPagination?.total ?? 0}
//         </span>
//       </div>

//       <div className="link-list">
//         {globalLinks.map((link) => (
//           <LinkCard
//             key={link._id}
//             link={link}
//             onDelete={null}
//           />
//         ))}

//         {!globalLinks.length && (
//           <div className="empty-state">
//             <div className="empty-icon">
//               <Link2 size={23} />
//             </div>
//             <strong>No global links on this page</strong>
//             <p>Be the first to shorten a URL.</p>
//           </div>
//         )}
//       </div>

//       <Pagination
//         pagination={globalPagination}
//         onPageChange={setGlobalPage}
//       />
//     </section>
//   );
// }


import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  Copy,
  Link2,
  Plus,
  RefreshCw,
  X
} from "lucide-react";

import { api } from "../api.js";
import LinkCard from "./LinkCard.jsx";

const PAGE_SIZE = 5;

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = pagination;

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {(page - 1) * limit + 1}–
        {Math.min(page * limit, total)} of {total}
      </span>

      <div className="pagination-controls">
        <button
          className="page-button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>

        <span className="page-indicator">
          {page} / {totalPages}
        </span>

        <button
          className="page-button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function SmashAnimation({ originalUrl, resultCode, onClose }) {
  const [copied, setCopied] = useState(false);
  const resultReady = Boolean(resultCode);

  const serverUrl = (
    import.meta.env.VITE_SERVER_URL || "http://localhost:5000"
  ).replace(/\/+$/, "");

  const shortUrl = resultReady
    ? `${serverUrl}/${resultCode}`
    : "";

  async function copyShortUrl() {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback for browsers where Clipboard API is unavailable.
      const input = document.createElement("textarea");
      input.value = shortUrl;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(input);

      setCopied(successful);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div
      className="smash-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && resultReady) {
          onClose();
        }
      }}
    >
      <div
        className={`smash-scene ${resultReady ? "smash-complete" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Your shortened link"
      >
        <button
          type="button"
          className="smash-close"
          onClick={onClose}
          aria-label="Close popup"
          title="Close"
        >
          <X size={20} />
        </button>

        <div className="scene-label">
          {resultReady
            ? "LINK CREATED SUCCESSFULLY"
            : "LINKLITE SMASH LAB"}
        </div>

        <div className="smash-stage">
          <div className="url-plank">
            <Link2 size={17} />
            <span title={originalUrl}>{originalUrl}</span>
          </div>

          <div className="broken-piece broken-left">
            <span>
              {originalUrl.slice(0, Math.ceil(originalUrl.length / 2))}
            </span>
          </div>

          <div className="broken-piece broken-right">
            <span>
              {originalUrl.slice(Math.ceil(originalUrl.length / 2))}
            </span>
          </div>

          <div className="real-hammer" aria-hidden="true">
            <div className="hammer-handle" />
            <div className="hammer-head">
              <div className="hammer-face" />
            </div>
          </div>

          <div className="impact-burst" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <i key={index} />
            ))}
          </div>

          <div className="debris debris-one" />
          <div className="debris debris-two" />
          <div className="debris debris-three" />
          <div className="debris debris-four" />

          {resultReady && (
            <div className="forged-result">
              <div className="result-check">
                <Check size={24} />
              </div>

              <span className="result-label">
                YOUR NEW SHORT LINK
              </span>

              <a
                className="forged-url"
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
              >
                {shortUrl}
              </a>

              <span className="result-caption">
                Long link destroyed. Short link forged.
              </span>

              <div className="forged-actions">
                <button
                  type="button"
                  className="copy-forged-url"
                  onClick={copyShortUrl}
                >
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  {copied ? "Copied!" : "Copy short link"}
                </button>

                <button
                  type="button"
                  className="popup-done-button"
                  onClick={onClose}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="scene-caption">
          {resultReady
            ? "Ready to copy, share, and track."
            : "Stand back… impact imminent!"}
        </p>

        {!resultReady && (
          <div className="smash-loading">
            <span />
            Forging your short link...
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard({ token, user }) {
  const [links, setLinks] = useState([]);
  const [globalLinks, setGlobalLinks] = useState([]);

  const [myPagination, setMyPagination] = useState(null);
  const [globalPagination, setGlobalPagination] = useState(null);

  const [myPage, setMyPage] = useState(1);
  const [globalPage, setGlobalPage] = useState(1);

  const [originalUrl, setOriginalUrl] = useState("");
  const [alias, setAlias] = useState("");

  const [aliasState, setAliasState] = useState({
    status: "idle",
    message: "Leave blank for a random short link."
  });

  const [busy, setBusy] = useState(false);
  const [isSmashing, setIsSmashing] = useState(false);
  const [shortenedCode, setShortenedCode] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadLinks = useCallback(async () => {
    const [mine, global] = await Promise.all([
      api(`/urls/my?page=${myPage}&limit=${PAGE_SIZE}`, { token }),
      api(`/urls/public?page=${globalPage}&limit=${PAGE_SIZE}`)
    ]);

    setLinks(mine.links);
    setMyPagination(mine.pagination);

    setGlobalLinks(global.links);
    setGlobalPagination(global.pagination);
  }, [token, myPage, globalPage]);

  useEffect(() => {
    loadLinks().catch((err) => setError(err.message));
  }, [loadLinks]);

  useEffect(() => {
    const normalized = alias.trim().toLowerCase();

    if (!normalized) {
      setAliasState({
        status: "idle",
        message: "Leave blank for a random short link."
      });
      return;
    }

    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(normalized)) {
      setAliasState({
        status: "invalid",
        message: "Use 3–30 letters, numbers, hyphens, or underscores."
      });
      return;
    }

    let cancelled = false;

    setAliasState({
      status: "checking",
      message: "Checking availability..."
    });

    const timer = setTimeout(() => {
      api(
        `/urls/check-alias?alias=${encodeURIComponent(normalized)}`,
        { token }
      )
        .then((data) => {
          if (!cancelled) {
            setAliasState({
              status: data.available ? "available" : "taken",
              message: data.message
            });
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setAliasState({
              status: "invalid",
              message: err.message
            });
          }
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [alias, token]);

  async function createLink(event) {
    event.preventDefault();

    setError("");
    setNotice("");
    setShortenedCode("");

    if (!originalUrl.trim()) {
      setError("Please enter a destination URL.");
      return;
    }

    if (alias.trim() && aliasState.status !== "available") {
      setError(
        "Please choose an available custom alias, or leave the alias blank."
      );
      return;
    }

    setBusy(true);
    setIsSmashing(true);

    try {
      // Start the animation while the server creates the link.
      const [data] = await Promise.all([
        api("/urls", {
          token,
          method: "POST",
          body: JSON.stringify({
            originalUrl: originalUrl.trim(),
            alias: alias.trim()
          })
        }),
        new Promise((resolve) => setTimeout(resolve, 2200))
      ]);

      const code = data?.link?.code;

      if (!code) {
        throw new Error("The server did not return a short-link code.");
      }

      // This state update displays the short URL in the popup.
      setShortenedCode(code);

      setOriginalUrl("");
      setAlias("");
      setMyPage(1);
      setGlobalPage(1);
      setNotice("Your URL has been smashed into a short link!");

      // Refresh the lists in the background without reloading the page.
      loadLinks().catch((err) => setError(err.message));
    } catch (err) {
      setError(err.message || "Could not create the short link.");
      setIsSmashing(false);
    } finally {
      setBusy(false);
    }
  }

  async function deleteLink(id) {
    setError("");

    try {
      await api(`/urls/${id}`, {
        token,
        method: "DELETE"
      });

      await loadLinks();
    } catch (err) {
      setError(err.message);
    }
  }

  const totalClicks = links.reduce(
    (sum, link) => sum + (link.clicks || 0),
    0
  );

  return (
    <section className="dashboard">
      <div className="welcome-row">
        <div>
          <p className="welcome-kicker">YOUR WORKSPACE</p>
          <h2>
            Hey, {user.name.split(" ")[0]}{" "}
            <span className="wave">✦</span>
          </h2>
          <p className="muted">
            Ready to make your next link shorter?
          </p>
        </div>

        <button
          className="icon-button"
          title="Refresh links"
          onClick={() =>
            loadLinks().catch((err) => setError(err.message))
          }
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon violet">
            <Link2 size={18} />
          </span>
          <span className="stat-label">YOUR LINKS</span>
          <strong>{myPagination?.total ?? 0}</strong>
          <small>Total links you created</small>
        </div>

        <div className="stat-card">
          <span className="stat-icon sky">
            <BarChart3 size={18} />
          </span>
          <span className="stat-label">CLICKS THIS PAGE</span>
          <strong>{totalClicks.toLocaleString()}</strong>
          <small>Clicks on displayed links</small>
        </div>
      </div>

      <section className="panel create-panel">
        <div className="section-title">
          <div>
            <span className="section-icon">
              <Plus size={17} />
            </span>
            <h3>Create a short link</h3>
          </div>
          <span className="tiny-badge">FREE</span>
        </div>

        <form onSubmit={createLink} className="form-stack">
          <label className="field-label">
            Destination URL

            <div className="input-wrap url-input">
              <Link2 size={17} />
              <input
                type="url"
                value={originalUrl}
                onChange={(event) => setOriginalUrl(event.target.value)}
                placeholder="https://example.com/a/really/long/url"
                required
              />
            </div>
          </label>

          <label className="field-label">
            Custom alias <span className="optional">(optional)</span>

            <div className="alias-combo">
              <span className="alias-prefix">linklite/</span>
              <input
                value={alias}
                onChange={(event) => setAlias(event.target.value)}
                placeholder="my-awesome-link"
                maxLength={30}
                autoCapitalize="none"
              />
            </div>

            <span className={`alias-feedback ${aliasState.status}`}>
              {aliasState.status === "available"
                ? "✓ "
                : ["taken", "invalid"].includes(aliasState.status)
                  ? "! "
                  : ""}
              {aliasState.message}
            </span>
          </label>

          {notice && <p className="form-success">{notice}</p>}

          <button
            type="submit"
            className="button button-primary create-button"
            disabled={
              busy ||
              (Boolean(alias.trim()) &&
                aliasState.status !== "available")
            }
          >
            {busy ? "Smashing your URL..." : "Shorten URL"}
            <ArrowUpRight size={17} />
          </button>
        </form>
      </section>

      <div className="links-heading">
        <div>
          <h3>Your links</h3>
          <p className="muted">Manage and share your shortened URLs.</p>
        </div>
        <span className="count-pill">
          {myPagination?.total ?? 0}
        </span>
      </div>

      <div className="link-list">
        {links.map((link) => (
          <LinkCard
            key={link._id}
            link={link}
            onDelete={deleteLink}
          />
        ))}

        {!links.length && (
          <div className="empty-state">
            <div className="empty-icon">
              <Link2 size={23} />
            </div>
            <strong>No links on this page</strong>
            <p>Create your first short link above.</p>
          </div>
        )}
      </div>

      <Pagination
        pagination={myPagination}
        onPageChange={setMyPage}
      />

      <div className="links-heading global-heading">
        <div>
          <h3>Global links</h3>
          <p className="muted">
            Recently shortened links shared by everyone.
          </p>
        </div>
        <span className="count-pill">
          {globalPagination?.total ?? 0}
        </span>
      </div>

      <div className="link-list">
        {globalLinks.map((link) => (
          <LinkCard
            key={link._id}
            link={link}
            onDelete={null}
          />
        ))}

        {!globalLinks.length && (
          <div className="empty-state">
            <div className="empty-icon">
              <Link2 size={23} />
            </div>
            <strong>No global links on this page</strong>
            <p>Be the first to shorten a URL.</p>
          </div>
        )}
      </div>

      <Pagination
        pagination={globalPagination}
        onPageChange={setGlobalPage}
      />

      {isSmashing && (
        <SmashAnimation
          originalUrl={originalUrl || "Your URL"}
          resultCode={shortenedCode}
          onClose={() => {
            setIsSmashing(false);
            setShortenedCode("");
          }}
        />
      )}
    </section>
  );
}

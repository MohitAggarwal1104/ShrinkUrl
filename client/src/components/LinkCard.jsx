// import { useState } from "react";
// import {
//   BarChart3,
//   Check,
//   Copy,
//   ExternalLink,
//   QrCode,
//   Trash2,
// } from "lucide-react";
// import { QRCodeCanvas } from "qrcode.react";

// const API_URL = (
//   import.meta.env.VITE_SERVER_URL || "http://localhost:5000"
// ).replace(/\/+$/, "");

// function shortUrl(code) {
//   const normalizedCode = String(code ?? "").trim();

//   if (!normalizedCode) {
//     return "";
//   }

//   return `${API_URL}/${encodeURIComponent(normalizedCode)}`;
// }

// export default function LinkCard({ link, onDelete }) {
//   const [copied, setCopied] = useState(false);
//   const [showQr, setShowQr] = useState(false);

//   const url = shortUrl(link.code);

//   async function copyLink() {
//     try {
//       await navigator.clipboard.writeText(url);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1500);
//     } catch {
//       window.prompt("Copy your short link:", url);
//     }
//   }

//   return (
//     <article className="link-card">
//       <div className="link-main">
//         <div className="link-mark">
//           <ExternalLink size={17} />
//         </div>

//         <div className="link-details">
//           <a
//             className="short-link"
//             href={url}
//             target="_blank"
//             rel="noreferrer"
//           >
//             {url}
//           </a>

//           <p className="original-link" title={link.originalUrl}>
//             {link.originalUrl}
//           </p>

//           <div className="link-meta">
//             <span>
//               <BarChart3 size={13} /> {link.clicks || 0} clicks
//             </span>
//             <span>
//               {new Date(link.createdAt).toLocaleDateString()}
//             </span>
//           </div>
//         </div>
//       </div>

//       <div className="link-actions">
//         <button
//           type="button"
//           className="action-button copy-action"
//           onClick={copyLink}
//           title="Copy short link"
//         >
//           {copied ? <Check size={16} /> : <Copy size={16} />}
//           <span>{copied ? "Copied" : "Copy"}</span>
//         </button>

//         <button
//           type="button"
//           className={`action-button ${showQr ? "selected" : ""}`}
//           onClick={() => setShowQr((value) => !value)}
//           title="Show QR code"
//         >
//           <QrCode size={16} />
//           <span>QR code</span>
//         </button>

//         <button
//           type="button"
//           className="action-button delete-action"
//           onClick={() => onDelete?.(link._id)}
//           title="Delete link"
//         >
//           <Trash2 size={16} />
//         </button>
//       </div>

//       {showQr && (
//         <div className="qr-panel">
//           <QRCodeCanvas
//             value={url}
//             size={132}
//             level="M"
//             includeMargin
//           />

//           <div>
//             <strong>Scan to open</strong>
//             <p>
//               Point your camera at this QR code to visit your short link.
//             </p>
//             <a href={url} target="_blank" rel="noreferrer">
//               {url}
//             </a>
//           </div>
//         </div>
//       )}
//     </article>
//   );
// }
import { useState } from "react";
import {
  BarChart3,
  Check,
  Copy,
  ExternalLink,
  QrCode,
  Trash2,
  Share2,
  Download,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const API_URL = (
  import.meta.env.VITE_SERVER_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function shortUrl(code) {
  const normalizedCode = String(code ?? "").trim();

  if (!normalizedCode) {
    return "";
  }

  return `${API_URL}/${encodeURIComponent(normalizedCode)}`;
}

export default function LinkCard({ link, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [sharing, setSharing] = useState(false);

  const url = shortUrl(link.code);
  const qrId = `linklite-qr-${link._id}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copy your short link:", url);
    }
  }

  function shareUrlOnWhatsApp() {
    const message = `Check out my LinkLite short link: ${url}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function getQrCanvas() {
    const panel = document.getElementById(qrId);
    return panel?.querySelector("canvas") || null;
  }

  async function getQrFile() {
    const canvas = getQrCanvas();

    if (!canvas) {
      throw new Error("Please open the QR code first.");
    }

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Could not generate the QR image."));
        }
      }, "image/png");
    });

    return new File([blob], `linklite-qr-${link.code || "link"}.png`, {
      type: "image/png",
    });
  }

  async function shareQrImage() {
    if (sharing) return;

    setSharing(true);

    try {
      const file = await getQrFile();

      if (
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "My LinkLite QR Code",
          text: `Scan this QR code to visit ${url}`,
          files: [file],
        });

        return;
      }

      const shareFallback = window.confirm(
        "Your browser does not support sharing QR images directly. Share the short URL on WhatsApp instead?"
      );

      if (shareFallback) {
        shareUrlOnWhatsApp();
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error("QR image sharing failed:", error);

      const shareFallback = window.confirm(
        "Could not share the QR image. Would you like to share the short URL on WhatsApp instead?"
      );

      if (shareFallback) {
        shareUrlOnWhatsApp();
      }
    } finally {
      setSharing(false);
    }
  }

  async function downloadQrImage() {
    try {
      const file = await getQrFile();
      const objectUrl = URL.createObjectURL(file);
      const anchor = document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = file.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("QR download failed:", error);
      alert(error.message || "Unable to download the QR image.");
    }
  }

  return (
    <article className="link-card">
      <div className="link-main">
        <div className="link-mark">
          <ExternalLink size={17} />
        </div>

        <div className="link-details">
          <a
            className="short-link"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            {url}
          </a>

          <p className="original-link" title={link.originalUrl}>
            {link.originalUrl}
          </p>

          <div className="link-meta">
            <span>
              <BarChart3 size={13} /> {link.clicks || 0} clicks
            </span>

            <span>
              {link.createdAt
                ? new Date(link.createdAt).toLocaleDateString()
                : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="link-actions">
        <button
          type="button"
          className="action-button copy-action"
          onClick={copyLink}
          title="Copy short link"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>

        <button
          type="button"
          className={`action-button ${showQr ? "selected" : ""}`}
          onClick={() => setShowQr((value) => !value)}
          title="Show QR code"
        >
          <QrCode size={16} />
          <span>QR code</span>
        </button>

        <button
          type="button"
          className="action-button"
          onClick={shareUrlOnWhatsApp}
          title="Share short link on WhatsApp"
        >
          <Share2 size={16} />
          <span>WhatsApp</span>
        </button>

        <button
          type="button"
          className="action-button delete-action"
          onClick={() => onDelete?.(link._id)}
          title="Delete link"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {showQr && (
        <div className="qr-panel" id={qrId}>
          <QRCodeCanvas
            value={url}
            size={256}
            level="M"
            includeMargin
          />

          <div className="qr-details">
            <strong>Scan to open</strong>

            <p>
              Scan this QR code with your phone camera to visit your short
              link.
            </p>

            <a href={url} target="_blank" rel="noreferrer">
              {url}
            </a>

            <div className="link-actions qr-actions">
              <button
                type="button"
                className="action-button"
                onClick={shareQrImage}
                disabled={sharing}
              >
                <Share2 size={16} />
                <span>{sharing ? "Preparing..." : "Share QR Image"}</span>
              </button>

              <button
                type="button"
                className="action-button"
                onClick={downloadQrImage}
              >
                <Download size={16} />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
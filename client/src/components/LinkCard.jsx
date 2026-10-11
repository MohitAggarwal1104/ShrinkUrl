import { useState } from "react";
import {
  BarChart3,
  Check,
  Copy,
  ExternalLink,
  QrCode,
  Trash2,
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

  const url = shortUrl(link.code);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copy your short link:", url);
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
              {new Date(link.createdAt).toLocaleDateString()}
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
          className="action-button delete-action"
          onClick={() => onDelete?.(link._id)}
          title="Delete link"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {showQr && (
        <div className="qr-panel">
          <QRCodeCanvas
            value={url}
            size={132}
            level="M"
            includeMargin
          />

          <div>
            <strong>Scan to open</strong>
            <p>
              Point your camera at this QR code to visit your short link.
            </p>
            <a href={url} target="_blank" rel="noreferrer">
              {url}
            </a>
          </div>
        </div>
      )}
    </article>
  );
}
import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Check,
  Copy,
  Download,
  ExternalLink,
  Link2,
  QrCode,
  Share2,
  Trash2,
  MousePointerClick,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const API_URL = (
  import.meta.env.VITE_SERVER_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function shortUrl(code) {
  const normalizedCode = String(code ?? "").trim();

  if (!normalizedCode) return "";

  return `${API_URL}/${encodeURIComponent(normalizedCode)}`;
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(
    Number.isFinite(Number(value)) ? Number(value) : 0
  );
}

export default function LinkCard({ link, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [sharing, setSharing] = useState(false);

  const url = shortUrl(link.code);
  const qrId = `linklite-qr-${link._id || link.code}`;

  const originalUrl = link.originalUrl || link.longUrl || "";
  const clicks = Number(link.clicks) || 0;
  const createdAt = link.createdAt || link.created_at;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Could not copy the link:", error);
      window.prompt("Copy your short URL:", url);
    }
  }

  function shareOnWhatsApp() {
    const message = `Check out my shortened link: ${url}`;

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
      throw new Error("Open the QR code panel first.");
    }

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error("Could not generate the QR image."));
        },
        "image/png"
      );
    });

    return new File(
      [blob],
      `linklite-qr-${link.code || "link"}.png`,
      { type: "image/png" }
    );
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
          title: "LinkLite QR Code",
          text: `Scan this QR code to open ${url}`,
          files: [file],
        });
      } else {
        shareOnWhatsApp();
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("QR image sharing failed:", error);
        shareOnWhatsApp();
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

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error("QR download failed:", error);
      window.alert("Could not download the QR code. Please try again.");
    }
  }

  function handleDelete() {
    if (typeof onDelete === "function") {
      onDelete(link._id);
    }
  }

  return (
    <article className="ll-link-card">
      <div className="ll-link-header">
        <div className="ll-link-identity">
          <div className="ll-link-icon">
            <Link2 size={22} />
          </div>

          <div className="ll-link-heading">
            <a
              className="ll-short-url"
              href={url}
              target="_blank"
              rel="noreferrer"
              title={url}
            >
              {url}
              <ExternalLink size={14} />
            </a>

            <a
              className="ll-original-url"
              href={originalUrl || undefined}
              target="_blank"
              rel="noreferrer"
              title={originalUrl}
            >
              {originalUrl || "Original URL unavailable"}
            </a>

            <div className="ll-link-meta">
              <span>
                <CalendarDays size={14} />
                {formatDate(createdAt)}
              </span>

              <span className="ll-meta-separator">•</span>

              <span>
                <BarChart3 size={14} />
                Link details
              </span>
            </div>
          </div>
        </div>

        <div className="ll-link-actions">
          <button
            type="button"
            className={`ll-button ${copied ? "ll-button-success" : ""}`}
            onClick={copyLink}
            title="Copy short URL"
          >
            {copied ? <Check size={17} /> : <Copy size={17} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            type="button"
            className={`ll-button ll-button-purple ${
              showQr ? "ll-button-selected" : ""
            }`}
            onClick={() => setShowQr((previous) => !previous)}
            aria-expanded={showQr}
          >
            <QrCode size={17} />
            <span>{showQr ? "Hide QR" : "QR Code"}</span>
          </button>

          <button
            type="button"
            className="ll-button"
            onClick={shareOnWhatsApp}
            title="Share short URL on WhatsApp"
          >
            <Share2 size={17} />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            className="ll-icon-button ll-delete-button"
            onClick={handleDelete}
            title="Delete link"
            aria-label="Delete link"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="ll-link-stats">
        <div className="ll-click-stat">
          <div className="ll-stat-icon">
            <MousePointerClick size={20} />
          </div>

          <div className="ll-stat-content">
            <span className="ll-stat-label">Total clicks</span>
            <strong className="ll-stat-value">
              {formatNumber(clicks)}
            </strong>
          </div>
        </div>

        <div className="ll-stat-divider" />

        <div className="ll-stat-description">
          <span className="ll-stat-label">Your short link</span>
          <span className="ll-stat-description-text">
            Track visits and share your link anywhere.
          </span>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="ll-open-link"
        >
          Open link
          <ExternalLink size={15} />
        </a>
      </div>

      {showQr && (
        <section className="ll-qr-section" id={qrId}>
          <div className="ll-qr-preview">
            <QRCodeCanvas
              value={url}
              size={240}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#111827"
            />
            <span className="ll-qr-caption">Scan to open your link</span>
          </div>

          <div className="ll-qr-details">
            <span className="ll-qr-eyebrow">LINKLITE · QR CODE</span>
            <h3>Share your link instantly</h3>

            <p>
              Anyone can scan this QR code with their phone camera to visit
              your destination.
            </p>

            <div className="ll-qr-url">
              <span>SHORT URL</span>
              <a href={url} target="_blank" rel="noreferrer">
                {url}
              </a>
            </div>

            <div className="ll-qr-actions">
              <button
                type="button"
                className="ll-button ll-button-purple"
                onClick={shareQrImage}
                disabled={sharing}
              >
                <Share2 size={17} />
                {sharing ? "Opening share..." : "Share QR Image"}
              </button>

              <button
                type="button"
                className="ll-button"
                onClick={downloadQrImage}
              >
                <Download size={17} />
                Download PNG
              </button>
            </div>

            <p className="ll-qr-hint">
              Tip: Download the QR image to add it to posters, documents, or
              presentations.
            </p>
          </div>
        </section>
      )}
    </article>
  );
}
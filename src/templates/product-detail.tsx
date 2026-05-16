import type { FC } from "hono/jsx";

interface LivestockDetailRow {
  id: string;
  name: string | null;
  type: string;
  weight_kg: number | null;
  status: string;
  selling_price: number | null;
  image_url: string | null;
  notes: string | null;
  slug: string | null;
}

const TYPE_EMOJI: Record<string, string> = {
  Morino: "🐑",
  Texel: "🐏",
  Jawa: "🐐",
  Lainnya: "🦙",
};

const TYPE_COLOR: Record<string, string> = {
  Morino: "#6366f1",
  Texel: "#f59e0b",
  Jawa: "#84cc16",
  Lainnya: "#94a3b8",
};

const STATUS_LABEL: Record<string, string> = {
  available: "Tersedia",
  sold: "Terjual",
  booking: "Booking",
  dead: "Mati",
};

const STATUS_COLOR: Record<string, string> = {
  available: "#16a34a",
  sold: "#dc2626",
  booking: "#d97706",
  dead: "#6b7280",
};

function formatRupiah(n: number) {
  return "Rp " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function pad(n: number) {
  return String(n).padStart(3, "0");
}

const css = `
*, *::before, *::after { box-sizing: border-box; }
html { background: #cbd5e1; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0 auto; max-width: 430px; background: #f1f5f9; color: #1e293b; padding-bottom: 90px; }

.header { position: sticky; top: 0; z-index: 10; background: #15803d; color: white; padding: 12px 16px; display: flex; align-items: center;  box-shadow: 0 2px 8px #0002; gap: 8px; }
.header-brand { display: flex; align-items: center; gap: 8px; }
.header-logo { width: 40px; height: 40px; object-fit: contain; flex-shrink: 0; }
.header-text { display: flex; flex-direction: column; }
.header-name { font-weight: 700; font-size: 1.05rem; line-height: 1.2; }
.header-sub { font-size: 0.68rem; font-weight: 500; opacity: 0.8; letter-spacing: .02em; }
.back-btn { background: rgba(255,255,255,0.15); color: white; border: none; padding: 7px 12px; border-radius: 8px; font-weight: 600; font-size: 0.82rem; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; -webkit-tap-highlight-color: transparent; }
.back-btn:active { background: rgba(255,255,255,0.25); }

.hero { position: relative; background: white; }
.hero-img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; display: block; }
.hero-emoji { font-size: 6rem; text-align: center; padding: 48px 16px 32px; line-height: 1; background: white; }
.type-bar { height: 5px; }

.card-num-badge { position: absolute; top: 12px; left: 12px; font-size: 0.65rem; font-weight: 700; color: white; font-family: monospace; background: rgba(0,0,0,0.55); padding: 3px 8px; border-radius: 999px; }
.weight-badge { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.8); border-radius: 100%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; }
.weight-badge-label { font-family: monospace; font-weight: 700; color: white; font-size: 0.72rem; text-align: center; line-height: 1.2; }

.detail { background: white; margin: 10px 0 0; padding: 18px 16px 16px; }
.detail-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.badge { font-size: 0.7rem; font-weight: 700; color: white; padding: 3px 10px; border-radius: 999px; }
.card-num-text { font-size: 0.7rem; font-weight: 700; color: #94a3b8; font-family: monospace; }
.detail-type { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
.detail-name { font-size: 1.4rem; font-weight: 800; color: #1e293b; margin-bottom: 14px; line-height: 1.25; }
.detail-row { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-top: 1px solid #f1f5f9; }
.detail-row-icon { font-size: 1rem; flex-shrink: 0; width: 24px; text-align: center; }
.detail-row-label { font-size: 0.7rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; min-width: 64px; }
.detail-row-value { font-size: 0.9rem; font-weight: 600; color: #1e293b; }
.detail-price { font-size: 1.15rem; font-weight: 800; color: #15803d; }
.notes-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; margin-top: 14px; font-size: 0.85rem; color: #475569; line-height: 1.55; white-space: pre-wrap; }

.bottom-bar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; background: white; border-top: 1px solid #e2e8f0; padding: 12px 16px; padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px)); display: flex; gap: 10px; z-index: 20; }
.btn-share { flex: 1; border: 2px solid #16a34a; background: white; color: #16a34a; border-radius: 10px; padding: 12px; font-weight: 700; font-size: 0.85rem; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: background .15s; }
.btn-share:active { background: #f0fdf4; }
.btn-order { flex: 2; background: #16a34a; color: white; border: none; border-radius: 10px; padding: 12px; font-weight: 700; font-size: 0.85rem; text-decoration: none; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background .15s; -webkit-tap-highlight-color: transparent; }
.btn-order:active { background: #15803d; }
.btn-order.disabled { background: #e2e8f0; color: #94a3b8; pointer-events: none; }
`;

const shareScript = `
document.getElementById('share-btn').addEventListener('click', async function() {
  var url = window.location.href;
  var title = document.title;
  if (navigator.share) {
    try { await navigator.share({ title: title, url: url }); } catch(e) {}
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(function() {
      var btn = document.getElementById('share-btn');
      var orig = btn.textContent;
      btn.textContent = 'Link Disalin!';
      setTimeout(function() { btn.textContent = orig; }, 2000);
    });
  }
});
`;

export const ProductDetail: FC<{
  livestock: LivestockDetailRow;
  index: number;
}> = ({ livestock: l, index }) => {
  const emoji = TYPE_EMOJI[l.type] ?? "🐄";
  const typeColor = TYPE_COLOR[l.type] ?? "#94a3b8";
  const statusLabel = STATUS_LABEL[l.status] ?? l.status;
  const statusColor = STATUS_COLOR[l.status] ?? "#6b7280";
  const cardNum = pad(index >= 0 ? index + 1 : 1);
  const displayName = l.name ?? l.type;
  const pageTitle = `${displayName} #${cardNum} — Peternak Tampan`;
  const ogImage = l.image_url ? `/api/livestock/${l.id}/photo` : "/logo.png";
  const canOrder = l.status === "available" || l.status === "booking";
  const pageUrl = `https://peternaktampan.com/ternak/${l.slug ?? l.id}`;
  const waText = encodeURIComponent(
    `Halo, saya tertarik dengan ${displayName} #${cardNum}\n\n${pageUrl}`
  );

  return (
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={`${displayName} — ${l.type}, ${
            l.weight_kg ? `${l.weight_kg}kg, ` : ""
          }${statusLabel}. Tersedia di Peternak Tampan, Pasuruan Jawa Timur.`}
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={pageTitle} />
        <meta
          property="og:description"
          content={`${displayName} — ${l.type}${
            l.weight_kg ? `, ${l.weight_kg}kg` : ""
          }. ${l.selling_price ? formatRupiah(l.selling_price) : ""}`}
        />
        <meta property="og:type" content="product" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:site_name" content="Peternak Tampan" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={`/ternak/${l.id}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:image" content={ogImage} />
        <link rel="icon" type="image/png" href="/logo.png" />
        {l.selling_price ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: displayName,
                description: `Kambing ${l.type} dari Peternak Tampan, Pasuruan`,
                image: ogImage,
                offers: {
                  "@type": "Offer",
                  price: l.selling_price,
                  priceCurrency: "IDR",
                  availability:
                    l.status === "available"
                      ? "https://schema.org/InStock"
                      : "https://schema.org/OutOfStock",
                },
              }),
            }}
          />
        ) : null}
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>
        <header class="header">
          <a class="back-btn" href="/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ width: "16px", height: "16px" }}
            >
              <path
                fill-rule="evenodd"
                d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z"
                clip-rule="evenodd"
              />
            </svg>
          </a>
          <div class="header-brand">
            <img class="header-logo" src="/logo.png" alt="Peternak Tampan" />
            <div class="header-text">
              <span class="header-name">Peternak Tampan</span>
              <span class="header-sub">
                Kambing Qurban & Aqiqah · Pasuruan, Jawa Timur
              </span>
            </div>
          </div>
        </header>

        <div class="hero">
          {l.image_url ? (
            <img
              class="hero-img"
              src={`/api/livestock/${l.id}/photo`}
              alt={displayName}
            />
          ) : (
            <div class="hero-emoji">{emoji}</div>
          )}
          <span class="card-num-badge">#{cardNum}</span>
          {l.weight_kg ? (
            <div class="weight-badge">
              <span class="weight-badge-label">{l.weight_kg}kg</span>
            </div>
          ) : null}
          <div class="type-bar" style={{ background: typeColor }} />
        </div>

        <div class="detail">
          <div class="detail-meta">
            <span class="badge" style={{ background: statusColor }}>
              {statusLabel}
            </span>
            <span class="card-num-text">#{cardNum}</span>
          </div>
          <div class="detail-type" style={{ color: typeColor }}>
            {TYPE_EMOJI[l.type] ?? "🐄"} {l.type}
          </div>
          <div class="detail-name">{displayName}</div>

          {l.weight_kg ? (
            <div class="detail-row">
              <span class="detail-row-icon">⚖️</span>
              <span class="detail-row-label">Berat</span>
              <span class="detail-row-value">{l.weight_kg} kg</span>
            </div>
          ) : null}

          {l.selling_price ? (
            <div class="detail-row">
              <span class="detail-row-icon">🏷️</span>
              <span class="detail-row-label">Harga</span>
              <span class="detail-price">{formatRupiah(l.selling_price)}</span>
            </div>
          ) : null}

          {l.notes ? (
            <div>
              <div
                class="detail-row"
                style={{ borderTop: "1px solid #f1f5f9", paddingBottom: "8px" }}
              >
                <span class="detail-row-icon">📝</span>
                <span class="detail-row-label">Catatan</span>
              </div>
              <div class="notes-box">{l.notes}</div>
            </div>
          ) : null}
        </div>

        <div class="bottom-bar">
          <button class="btn-share" id="share-btn" type="button">
            Bagikan
          </button>
          {canOrder ? (
            <a
              class="btn-order"
              href={`https://wa.me/6281931520239?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 Pesan Sekarang
            </a>
          ) : (
            <span class="btn-order disabled">Tidak Tersedia</span>
          )}
        </div>

        <script dangerouslySetInnerHTML={{ __html: shareScript }} />
      </body>
    </html>
  );
};

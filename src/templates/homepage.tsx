import type { FC } from "hono/jsx";

interface LivestockRow {
  id: string;
  name: string | null;
  type: string;
  weight_kg: number | null;
  status: string;
  selling_price: number | null;
  purchase_price: number;
  image_url: string | null;
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
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; background: #f1f5f9; color: #1e293b; }

.header { position: sticky; top: 0; z-index: 10; background: #15803d; color: white; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px #0002; }
.header-brand { display: flex; align-items: center; gap: 8px; }
.header-brand svg { width: 24px; height: 24px; stroke: white; fill: none; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
.header-text { display: flex; flex-direction: column; }
.header-name { font-weight: 700; font-size: 1.05rem; line-height: 1.2; }
.header-sub { font-size: 0.68rem; font-weight: 500; opacity: 0.8; letter-spacing: .02em; }
.login-btn { background: white; color: #15803d; border: none; padding: 7px 16px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; text-decoration: none; display: inline-block; }

.stats { background: white; border-bottom: 1px solid #e2e8f0; display: flex; }
.stat { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 10px 4px 12px; gap: 4px; cursor: pointer; border: none; background: transparent; -webkit-tap-highlight-color: transparent; user-select: none; transition: background .15s, transform .1s; position: relative; }
.stat + .stat { border-left: 1px solid #f1f5f9; }
.stat:hover { background: #f8fafc; }
.stat:active { background: #f1f5f9; transform: scale(0.93); }
.stat.active { box-shadow: inset 0 -3px 0 0 currentColor; }
.stat-dot { width: 8px; height: 8px; border-radius: 50%; transition: transform .15s; }
.stat.active .stat-dot { transform: scale(1.4); }
.stat-num { font-size: 1.35rem; font-weight: 800; color: #1e293b; line-height: 1; }
.stat-label { font-size: 0.62rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; }

.filter-section { background: white; border-bottom: 1px solid #e2e8f0; padding: 10px 16px 12px; }
.filter-label { display: flex; align-items: center; gap: 5px; font-size: 0.68rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 8px; }
.filter-label svg { width: 13px; height: 13px; stroke: #94a3b8; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
.filter-wrap { display: flex; gap: 7px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
.filter-wrap::-webkit-scrollbar { display: none; }
.filter-btn { flex-shrink: 0; border: none; background: #f1f5f9; color: #475569; padding: 8px 16px; border-radius: 999px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: transform .1s ease, box-shadow .15s ease, background .15s ease, color .15s ease; min-height: 38px; -webkit-tap-highlight-color: transparent; user-select: none; }
.filter-btn:hover { background: #e2e8f0; color: #1e293b; }
.filter-btn:active { transform: scale(0.93); }
.filter-btn.active { background: #16a34a; color: white; box-shadow: 0 3px 10px #16a34a50; transform: scale(1); }
.filter-btn.active:active { transform: scale(0.93); }

.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 8px 16px 32px; }
@media (min-width: 480px) { .grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 700px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 14px; padding: 12px 20px 40px; } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(5, 1fr); max-width: 1200px; margin: 0 auto; padding: 16px 24px 48px; } }

.card { background: white; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px #0001; transition: transform .15s, box-shadow .15s; position: relative; }
.card:active { transform: scale(0.97); }
@media (hover: hover) { .card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px #0002; } }
.card-num { position: absolute; top: 8px; right: 9px; font-size: 0.62rem; font-weight: 700; color: #cbd5e1; font-family: monospace; z-index: 1; }
.card-img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; display: block; }
.card-emoji { font-size: 3rem; text-align: center; padding: 18px 8px 8px; line-height: 1; }
.card-bar { height: 4px; margin: 0 12px 10px; border-radius: 2px; }
.card-body { padding: 0 12px 12px; }
.card-type { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 2px; }
.card-name { font-size: 0.88rem; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 7px; }
.card-meta { display: flex; align-items: center; gap: 5px; margin-bottom: 6px; flex-wrap: wrap; }
.badge { font-size: 0.62rem; font-weight: 700; color: white; padding: 2px 7px; border-radius: 999px; }
.weight { font-size: 0.7rem; color: #94a3b8; font-weight: 500; }
.card-price { font-size: 0.72rem; font-weight: 700; color: #15803d; }
.card-order { display: block; width: 100%; margin-top: 8px; padding: 7px 0; border-radius: 8px; border: none; font-size: 0.75rem; font-weight: 700; cursor: pointer; text-decoration: none; text-align: center; background: #16a34a; color: white; transition: background .15s; }
.card-order:hover { background: #15803d; }
.card-order.disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; pointer-events: none; }

.empty { text-align: center; padding: 64px 24px; color: #94a3b8; grid-column: 1 / -1; }
.card.hidden { display: none; }
`;

const filterScript = `
var typeBtns = document.querySelectorAll('.filter-btn');
var statBtns = document.querySelectorAll('.stat');
var cards = document.querySelectorAll('.card');
var activeType = 'Semua';
var activeStatus = 'all';

function applyFilters() {
  cards.forEach(function(card) {
    var typeMatch = activeType === 'Semua' || card.dataset.type === activeType;
    var statusMatch = activeStatus === 'all' || card.dataset.status === activeStatus;
    card.classList.toggle('hidden', !typeMatch || !statusMatch);
  });
}

typeBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    typeBtns.forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    activeType = btn.dataset.filter;
    applyFilters();
  });
});

statBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    statBtns.forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    activeStatus = btn.dataset.status;
    applyFilters();
  });
});
`;

const Card: FC<{ livestock: LivestockRow; index: number }> = ({
  livestock: l,
  index,
}) => {
  const emoji = TYPE_EMOJI[l.type] ?? "🐄";
  const typeColor = TYPE_COLOR[l.type] ?? "#94a3b8";
  const statusLabel = STATUS_LABEL[l.status] ?? l.status;
  const statusColor = STATUS_COLOR[l.status] ?? "#6b7280";
  return (
    <div class="card" data-type={l.type} data-status={l.status}>
      <div class="card-num">#{pad(index + 1)}</div>
      {l.image_url
        ? <img class="card-img" src={l.image_url} alt={l.name ?? l.type} loading="lazy" />
        : <div class="card-emoji">{emoji}</div>
      }
      <div class="card-bar" style={{ background: typeColor }} />
      <div class="card-body">
        <div class="card-type" style={{ color: typeColor }}>
          {l.type}
        </div>
        <div class="card-name">{l.name ?? "—"}</div>
        <div class="card-meta">
          <span class="badge" style={{ background: statusColor }}>
            {statusLabel}
          </span>
          {l.weight_kg ? <span class="weight">{l.weight_kg}kg</span> : null}
        </div>
        {l.selling_price ? (
          <div class="card-price">{formatRupiah(l.selling_price)}</div>
        ) : null}
        {l.status === 'available' || l.status === 'booking' ? (
          <a
            class="card-order"
            href={`https://wa.me/6281931520239?text=Halo%2C+saya+tertarik+dengan+${encodeURIComponent(l.name ?? l.type)}+%23${pad(index + 1)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Pesan Sekarang
          </a>
        ) : (
          <span class="card-order disabled">Tidak Tersedia</span>
        )}
      </div>
    </div>
  );
};

export const Homepage: FC<{ livestock: LivestockRow[] }> = ({ livestock }) => {
  const types = Array.from(new Set(livestock.map((l) => l.type)));
  const stats = {
    total: livestock.length,
    available: livestock.filter((l) => l.status === "available").length,
    booking: livestock.filter((l) => l.status === "booking").length,
    sold: livestock.filter((l) => l.status === "sold").length,
  };

  return (
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Peternak Tampan — Jual Kambing Qurban & Aqiqah Pasuruan, Jawa Timur</title>
        <meta name="description" content="Jual kambing qurban dan aqiqah berkualitas di Pasuruan, Jawa Timur. Tersedia kambing Morino, Texel, dan Jawa. Harga terjangkau, sehat, dan siap kirim. Pesan via WhatsApp." />
        <meta name="keywords" content="kambing qurban Pasuruan, kambing aqiqah Pasuruan, jual kambing Pasuruan, kambing kurban Jawa Timur, ternak kambing Pasuruan, kambing Morino, kambing Texel, kambing Jawa, hewan qurban Pasuruan" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Peternak Tampan" />
        <meta property="og:title" content="Peternak Tampan — Jual Kambing Qurban & Aqiqah Pasuruan" />
        <meta property="og:description" content="Jual kambing qurban dan aqiqah berkualitas di Pasuruan, Jawa Timur. Tersedia kambing Morino, Texel, dan Jawa. Harga terjangkau, sehat, dan siap kirim." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:site_name" content="Peternak Tampan" />
        <meta property="og:image" content="/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Peternak Tampan — Kambing Qurban & Aqiqah Pasuruan" />
        <meta name="twitter:description" content="Jual kambing qurban dan aqiqah berkualitas di Pasuruan, Jawa Timur. Harga terjangkau, sehat, siap kirim." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Peternak Tampan",
          "description": "Jual kambing qurban dan aqiqah berkualitas di Pasuruan, Jawa Timur",
          "telephone": "+6281931520239",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Pasuruan",
            "addressRegion": "Jawa Timur",
            "addressCountry": "ID"
          },
          "areaServed": [
            { "@type": "City", "name": "Pasuruan" },
            { "@type": "State", "name": "Jawa Timur" }
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+6281931520239",
            "contactType": "sales",
            "availableLanguage": "Indonesian"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Katalog Kambing",
            "itemListElement": [
              { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Kambing Qurban" } },
              { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Kambing Aqiqah" } }
            ]
          }
        }) }} />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>
        <header class="header">
          <div class="header-brand">
            <svg viewBox="0 0 24 24">
              <path d="M6 10c0-3.3 2.7-6 6-6s6 2.7 6 6" />
              <path d="M3 16c0-2.2 1.8-4 4-4h10c2.2 0 4 1.8 4 4v2H3v-2z" />
              <path d="M8 10v2M16 10v2" />
            </svg>
            <div class="header-text">
              <span class="header-name">Peternak Tampan</span>
              <span class="header-sub">Kambing Qurban & Aqiqah · Pasuruan, Jawa Timur</span>
            </div>
          </div>
        </header>

        <div class="stats">
          <button
            class="stat active"
            data-status="all"
            style={{ color: "#94a3b8" }}
          >
            <div class="stat-dot" style={{ background: "#94a3b8" }} />
            <div class="stat-num" style={{ color: "#1e293b" }}>
              {stats.total}
            </div>
            <div class="stat-label">Total</div>
          </button>
          <button
            class="stat"
            data-status="available"
            style={{ color: "#16a34a" }}
          >
            <div class="stat-dot" style={{ background: "#16a34a" }} />
            <div class="stat-num" style={{ color: "#16a34a" }}>
              {stats.available}
            </div>
            <div class="stat-label">Tersedia</div>
          </button>
          {/* <button class="stat" data-status="booking" style={{ color: '#d97706' }}>
            <div class="stat-dot" style={{ background: '#d97706' }} />
            <div class="stat-num" style={{ color: '#d97706' }}>{stats.booking}</div>
            <div class="stat-label">Booking</div>
          </button> */}
          <button class="stat" data-status="sold" style={{ color: "#dc2626" }}>
            <div class="stat-dot" style={{ background: "#dc2626" }} />
            <div class="stat-num" style={{ color: "#dc2626" }}>
              {stats.sold}
            </div>
            <div class="stat-label">Terjual</div>
          </button>
        </div>

        <div class="filter-section">
          <div class="filter-label">
            <svg viewBox="0 0 24 24">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            Filter Jenis
          </div>
          <div class="filter-wrap">
            <button class="filter-btn active" data-filter="Semua">
              Semua ({livestock.length})
            </button>
            {types.map((t) => (
              <button class="filter-btn" data-filter={t}>
                {TYPE_EMOJI[t] ?? "🐄"} {t} (
                {livestock.filter((l) => l.type === t).length})
              </button>
            ))}
          </div>
        </div>

        <div class="grid">
          {livestock.length === 0 ? (
            <div class="empty">
              <div style={{ fontSize: "3.5rem", marginBottom: "12px" }}>🐑</div>
              <p>Belum ada ternak terdaftar.</p>
            </div>
          ) : (
            livestock.map((l, i) => <Card livestock={l} index={i} />)
          )}
        </div>

        <script dangerouslySetInnerHTML={{ __html: filterScript }} />
      </body>
    </html>
  );
};

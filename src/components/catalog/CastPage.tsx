import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { SiteHeader } from "../common/Header";
import SiteFooter from "../common/Footer";

interface ListItem {
  id: string;
  title: string;
  year?: number;
  poster: string | null;
  logo?: string | null;
  casts?: Array<{ id?: string; name?: string }>;
}

const CastPage: React.FC = () => {
  const { castId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<ListItem[]>([]);
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page") || 1)
  );
  const [limit] = useState<number>(24);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [castName, setCastName] = useState<string>("");
  const [castImage, setCastImage] = useState<string | null>(null);
  const navigate = useNavigate();

  const API_BASE = `${
    (import.meta as any).env?.VITE_API_BASE || "http://localhost:4000"
  }/v1`;

  useEffect(() => {
    if (!castId) return;
    (async () => {
      try {
        setLoading(true);
        const resp = await fetch(
          `${API_BASE}/movies?page=${page}&limit=${limit}&castId=${encodeURIComponent(
            castId
          )}`
        );
        if (!resp.ok) return;
        const data = await resp.json();
        const mapped: ListItem[] = (data.items || []).map((m: any) => ({
          id: m.id,
          title: m.title,
          year: m.year,
          poster: m.poster || null,
          logo: m.logo || null,
          casts: m.casts || [],
        }));
        setItems(mapped);
        setTotal(data.total || 0);

        // Derive cast name from first item's casts list
        const nameFromItems = mapped
          .flatMap((it) => it.casts || [])
          .find((c: any) => c?.id === castId)?.name;
        if (nameFromItems) setCastName(nameFromItems);

        // If your API later exposes avatar, set castImage here; fallback stays null
        setCastImage(null);
      } catch (_) {
      } finally {
        setLoading(false);
      }
    })();
  }, [castId, page]);

  const hasMore = page * limit < total;

  const PlaceholderAvatar = () => (
    <div
      className="cast-avatar placeholder-avatar"
      style={{
        borderRadius: "50%",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <svg
        width="96"
        height="96"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.6 }}
      >
        <path
          d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 3.134-7 7h2c0-2.761 2.239-5 5-5s5 2.239 5 5h2c0-3.866-3.134-7-7-7z"
          fill="#e5eaf1"
        />
      </svg>
    </div>
  );

  return (
    <>
      <SiteHeader />
      {/* Scoped styles for cast cards: hover overlay on desktop, always visible on mobile */}
      <style>
        {`
        .cast-card .related-poster { transform: none !important; transition: none !important; }
        .cast-card .cast-overlay { opacity: 1; transition: opacity 200ms ease; }
        @media (hover: hover) and (pointer: fine) {
          .cast-card .cast-overlay { opacity: 0; }
          .cast-card:hover .cast-overlay { opacity: 1; }
        }
        /* Mobile: force 3 columns per row */
        @media (max-width: 640px) {
          .cast-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 12px !important;
          }
        }
        /* Avatar (image or placeholder) */
        .cast-avatar {
          width: 220px;
          height: 220px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid rgba(255,255,255,0.12);
        }
        /* Cast name/title */
        .cast-name {
          color: #fff;
          margin-bottom: 8px;
          font-size: 28px;
          font-weight: 700;
        }
        /* Overlay movie title */
        .cast-title {
          color: #fff;
          font-weight: 700;
          font-size: 20px;
          text-align: center;
          padding: 12px 10px;
          width: 100%;
        }
        /* Mobile tweaks */
        @media (max-width: 640px) {
          .cast-avatar { width: 140px; height: 140px; }
          .cast-name { font-size: 18px; }
          .cast-title { font-size: 14px; padding: 8px 6px; }
          .placeholder-avatar svg { width: 56px; height: 56px; }
        }
        `}
      </style>
      <div
        style={{
          maxWidth: 1800,
          margin: "0 auto",
          paddingTop: 50,
          paddingBottom: 50,
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        {/* Header */}
        <div
          style={{
            margin: "12px 0 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <h1 className="cast-name">
            {castName || "Cast"}
            {total ? (
              <span style={{ color: "#9aa4b2", fontSize: 16 }}>
                {" "}
                ({total} movies)
              </span>
            ) : null}
          </h1>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {castImage ? (
              <img
                src={castImage}
                alt={castName || "Cast"}
                className="cast-avatar"
              />
            ) : (
              <PlaceholderAvatar />
            )}
          </div>
        </div>

        {/* Movies grid */}
        {loading ? (
          <div style={{ color: "#9aa4b2" }}>Loading…</div>
        ) : (
          <div
            className="cast-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 24,
            }}
          >
            {items.map((it) => (
              <div
                key={it.id}
                className="related-card cast-card"
                style={{ position: "relative" }}
                onClick={() => navigate(`/movie/${it.id}`)}
              >
                <img
                  src={it.poster || ""}
                  alt={it.title}
                  className="related-poster"
                  style={{
                    width: "100%",
                    display: "block",
                    transform: "none",
                    transition: "none",
                  }}
                  loading="lazy"
                />
                {/* Hover-only (desktop) / default (mobile) black overlay with centered bold title */}
                <div
                  className="cast-overlay"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                  }}
                >
                  <div className="cast-title">{it.title}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 24,
            alignItems: "center",
          }}
        >
          <button
            disabled={page <= 1}
            onClick={() => {
              const next = Math.max(1, page - 1);
              setPage(next);
              setSearchParams({ page: String(next) });
            }}
          >
            Prev
          </button>
          <div style={{ color: "#9aa4b2" }}>Page {page}</div>
          <button
            disabled={!hasMore}
            onClick={() => {
              const next = page + 1;
              setPage(next);
              setSearchParams({ page: String(next) });
            }}
          >
            Next
          </button>
        </div>
      </div>
      <SiteFooter />
    </>
  );
};

export default CastPage;

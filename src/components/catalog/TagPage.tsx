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
}

const TagPage: React.FC = () => {
  const { tagId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<ListItem[]>([]);
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page") || 1)
  );
  const [limit] = useState<number>(24);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [tagName, setTagName] = useState<string>("");
  const navigate = useNavigate();

  const API_BASE = `${
    (import.meta as any).env?.VITE_API_BASE || "http://localhost:4000"
  }/v1`;

  useEffect(() => {
    if (!tagId) return;
    (async () => {
      try {
        setLoading(true);
        const resp = await fetch(
          `${API_BASE}/movies?page=${page}&limit=${limit}&tagId=${encodeURIComponent(
            tagId
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
        }));
        setItems(mapped);
        setTotal(data.total || 0);
        // derive tag name if server returns it inside items.tags
        const first = (data.items || [])[0];
        const nameFromItem = Array.isArray(first?.tags)
          ? first.tags.find((t: any) => t?.id === tagId)?.name ||
            first.tags[0]?.name
          : undefined;
        if (nameFromItem) setTagName(nameFromItem);
      } catch (_) {
      } finally {
        setLoading(false);
      }
    })();
  }, [tagId, page]);

  const hasMore = page * limit < total;

  return (
    <>
      <SiteHeader />
      {/* Scoped styles copied from CastPage for consistent UI */}
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
          .cast-grid { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 12px !important; }
        }
        .cast-title { color:#fff; font-weight:700; font-size:20px; text-align:center; padding:12px 10px; width:100%; }
        @media (max-width: 640px) { .cast-title { font-size:14px; padding:8px 6px; } }
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
        <div style={{ margin: "12px 0 24px", textAlign: "center" }}>
          <h1 style={{ color: "#fff", marginBottom: 8 }}>
            {tagName || "Tag"}
            {total ? (
              <span style={{ color: "#9aa4b2", fontSize: 16 }}>
                {" "}
                ({total} movies)
              </span>
            ) : null}
          </h1>
        </div>

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
                style={{
                  position: "relative",
                  aspectRatio: "2 / 3",
                  width: "100%",
                  overflow: "hidden",
                }}
                onClick={() => navigate(`/movie/${it.id}`)}
              >
                <img
                  src={it.poster || ""}
                  alt={it.title}
                  className="related-poster"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover",
                    transform: "none",
                    transition: "none",
                  }}
                  loading="lazy"
                />
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

        {/* Styled pagination like CastPage */}
        <div
          style={{ marginTop: 28, display: "flex", justifyContent: "center" }}
        >
          {(() => {
            const totalPages = Math.max(1, Math.ceil(total / limit));
            const items: Array<number | string> = [];
            const push = (v: number | string) => items.push(v);
            if (totalPages === 1) {
              items.push(1);
            } else if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) push(i);
            } else {
              push(1);
              push(2);
              push(3);
              push("…");
              push(totalPages);
            }

            const boxStyle = (active: boolean): React.CSSProperties => ({
              minWidth: 44,
              height: 44,
              padding: "0 14px",
              borderRadius: 10,
              marginRight: 10,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: active ? "#fff" : "#e6e8ee",
              background: active ? "#e50914" : "#232531",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: active ? "default" : "pointer",
            });

            const go = (p: number) => {
              if (p < 1 || p > totalPages || p === page) return;
              setPage(p);
              setSearchParams({ page: String(p) });
            };

            return (
              <div style={{ display: "flex", alignItems: "center" }}>
                {items.map((it, idx) =>
                  it === "…" ? (
                    <div
                      key={`dots-${idx}`}
                      style={{ ...boxStyle(false), cursor: "default" }}
                    >
                      …
                    </div>
                  ) : (
                    <div
                      key={`p-${it}`}
                      style={boxStyle(it === page)}
                      onClick={() => typeof it === "number" && go(it)}
                    >
                      {it}
                    </div>
                  )
                )}
                {totalPages > 1 && page < totalPages && (
                  <div
                    style={boxStyle(false)}
                    onClick={() => go(page + 1)}
                    aria-disabled={!(page < totalPages)}
                  >
                    {">"}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
      <SiteFooter />
    </>
  );
};

export default TagPage;

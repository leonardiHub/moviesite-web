import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function SponsorMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [isDesktop, setIsDesktop] = useState(false);

  // 检测屏幕大小
  useEffect(() => {
    const checkIsDesktop = () => {
      const isDesktopSize = window.innerWidth >= 769;
      setIsDesktop(isDesktopSize);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  // 锁滚动
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = open ? "hidden" : prev || "";
    return () => {
      document.documentElement.style.overflow = prev || "";
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Quick buttons CSS */}
      <style>{`
        /* 两列布局 */
        .menu-quick{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
          padding:0;
          margin-top:16px;
        }

        /* 卡片：#f5f5f5 + 立体阴影 */
        .quick{
          --ico-size: 64px;
          --ico-x: 0px;
          --ico-y: 0px;

          position:relative;
          display:flex;
          align-items:center;
          min-height:60px;
          padding:0;
          border-radius:12px;
          background:#f5f5f5;
          color:#111;
          text-decoration:none;
          border:none;
          box-shadow:
            0 12px 28px rgba(0,0,0,.14),
            inset 0 1px 0 rgba(255,255,255,.9),
            inset 0 -1px 0 rgba(0,0,0,.06);
          transition:transform .15s ease, box-shadow .15s ease;
          overflow:hidden;
        }

        .quick:hover{
          transform:translateY(-1px);
          box-shadow:
            0 16px 36px rgba(0,0,0,.2),
            inset 0 1px 0 rgba(255,255,255,.95),
            inset 0 -1px 0 rgba(0,0,0,.07);
        }

        /* 文案 */
        .quick__label{
          font-size:16px;
          font-weight:700;
          letter-spacing:.2px;
          margin-left: calc(var(--ico-size) + 12px);
        }

        /* 用 ::after 放图，位置=“内部左下角”，带投影 */
        .quick--promo::after,
        .quick--line::after{
          content:"";
          position:absolute;
          left:var(--ico-x);
          bottom:var(--ico-y);
          width:var(--ico-size);
          height:var(--ico-size);
          background-repeat:no-repeat;
          background-position:center;
          background-size:contain;
          filter:drop-shadow(0 6px 12px rgba(0,0,0,.9));
          pointer-events:none;
          transform:translateZ(0);
        }

        /* 各自的图片来源 */
        .quick--promo::after{
          background-image:url("https://ezmovie.me/build/web/ez-movie/img/theme-switcher-ic-promotion.png");
        }
        .quick--line::after{
          background-image:url("https://ezmovie.me/build/web/ez-movie/img/theme-switcher-ic-line.png");
          left:-2px;
          bottom:-2px;
          width:70px;
          height:70px;
        }
      `}</style>
      {/* Overlay */}
      {open && (
        <div
          className="ezm-menuOverlay"
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            backdropFilter: "blur(4px)",
            zIndex: 9998,
            pointerEvents: "auto",
          }}
        />
      )}

      {/* Full Menu */}
      <aside
        className="ezm-fullMenu"
        data-open={open}
        aria-hidden={!open}
        style={{
          position: "fixed",
          ...(isDesktop
            ? {
                width: "30vw",
                maxWidth: "400px",
                minWidth: "320px",
                height: "100vh",
                left: 0,
                top: 0,
                transform: open ? "translateX(0)" : "translateX(-100%)",
              }
            : {
                inset: 0,
                transform: open ? "translateY(0)" : "translateY(-8px)",
              }),
          display: "flex",
          flexDirection: "column",
          background: "#0f1115",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "all .28s ease",
          zIndex: 9999,
          boxShadow: "2px 0 20px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Top Bar - 只保留logo和按钮 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: "12px",
            padding: "12px 14px",
            background: "#0f1115",
            borderBottom: "1px solid rgba(255,255,255,.06)",
            flexShrink: 0,
          }}
        >
          <img
            style={{ height: "28px", width: "auto", justifySelf: "start" }}
            src="/images/logos/ez-movie-logo-clean.svg"
            alt="EZ Movie"
          />
          <div style={{ justifySelf: "end", display: "flex", gap: "10px" }}>
            <a
              style={{
                width: "42px",
                height: "42px",
                display: "grid",
                placeItems: "center",
                background: "transparent",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                cursor: "pointer",
                textDecoration: "none",
              }}
              href="#"
              aria-label="LINE"
            >
              <img
                style={{ width: "24px", height: "24px", display: "block" }}
                src="https://ezmovie.me/media/cache/strip/202310/block/88b1c84ceef85a444e84dc0af24b0e82.png"
                alt=""
              />
            </a>
            <button
              style={{
                width: "42px",
                height: "42px",
                display: "grid",
                placeItems: "center",
                background: "transparent",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "20px",
              }}
              onClick={onClose}
              aria-label="ปิดเมนู"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Menu Body */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            height: "100%",
          }}
        >
          <div
            style={{
              padding: isDesktop ? "16px" : "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              minHeight: "100%",
              color: "#fff",
            }}
          >
            {/* 标题 */}
            <div
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: isDesktop ? "16px" : "20px",
                letterSpacing: ".2px",
                textAlign: "center",
                marginBottom: "12px",
              }}
            >
              เว็บไซต์ผู้สนับสนุน
            </div>

            {/* 三张 sponsor banner */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "0 12px",
              }}
            >
              <img
                style={{
                  width: isDesktop ? "88%" : "85%",
                  height: "auto",
                  borderRadius: "10px",
                  display: "block",
                  boxShadow: "0 8px 20px rgba(0,0,0,.35)",
                  margin: "0 auto",
                }}
                src="https://ezmovie.me/build/web/ez-movie/img/banner-register-ez-casino.png?v=1"
                alt="EZ Casino"
              />
              <img
                style={{
                  width: isDesktop ? "88%" : "85%",
                  height: "auto",
                  borderRadius: "10px",
                  display: "block",
                  boxShadow: "0 8px 20px rgba(0,0,0,.35)",
                  margin: "0 auto",
                }}
                src="https://ezmovie.me/build/web/ez-movie/img/banner-register-ez-slot.png?v=1"
                alt="EZ Slot"
              />
              <img
                style={{
                  width: isDesktop ? "88%" : "85%",
                  height: "auto",
                  borderRadius: "10px",
                  display: "block",
                  boxShadow: "0 8px 20px rgba(0,0,0,.35)",
                  margin: "0 auto",
                }}
                src="https://ezmovie.me/build/web/ez-movie/img/banner-register-ez-lotto.png?v=1"
                alt="EZ Lotto"
              />
            </div>

            <div className="menu-quick">
              {/* โปรโมชั่น */}
              <a
                className="quick quick--promo"
                href="https://ezcasino.ai/promotions"
                target="_blank"
                rel="noopener nofollow"
              >
                <span className="quick__label">โปรโมชัน</span>
              </a>

              {/* LINE */}
              <a className="quick quick--line" href="#line">
                <span className="quick__label">LINE</span>
              </a>
            </div>

            {/* 底部图片卡 */}
            <img
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "12px",
                display: "block",
                boxShadow: "0 10px 24px rgba(0,0,0,.35)",
              }}
              src="https://ezmovie.me/build/web/ez-movie/img/theme-switcher-banner-bookmark.png"
              alt="EZ Movie Bookmark"
            />
          </div>
        </div>
      </aside>
    </>,
    document.body
  );
}

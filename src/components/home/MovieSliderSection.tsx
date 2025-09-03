import React, { useEffect, useMemo, useRef, useState } from "react";

// Minimal Movie type used by this component
type Movie = {
  id: string;
  title: string;
  posterUrl: string;
  year?: number;
  description?: string;
  ageRating?: string;
};

// Presentational subcomponents kept minimal and local
const SmallCard = React.memo(({ movie }: { movie: Movie }) => (
  <article
    className="ezm-smallMovieCard"
    style={{ position: "relative", width: 110 }}
  >
    <img
      src={movie.posterUrl}
      alt={movie.title}
      loading="lazy"
      decoding="async"
      style={{ width: "100%", height: "auto", display: "block" }}
    />
    <div
      className="movie-title"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        fontSize: 12,
        color: "#fff",
        background: "linear-gradient(transparent, rgba(0,0,0,.9))",
        padding: "4px 6px",
      }}
    >
      {movie.title}
    </div>
  </article>
));

const MainMovieCard = ({ movie }: { movie: Movie }) => (
  <div
    className="x-card-movie x-card-movie--embed"
    style={{ display: "flex", gap: 16 }}
  >
    <img
      src={movie.posterUrl}
      alt={movie.title}
      style={{ width: 220, height: "auto", display: "block", borderRadius: 8 }}
    />
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h4 style={{ margin: 0, color: "#fff" }}>{movie.title}</h4>
      <div style={{ marginTop: 6, color: "#bbb", fontSize: 14 }}>
        {movie.year ? `Year: ${movie.year}` : null}
        {movie.ageRating ? `  ·  ${movie.ageRating}` : null}
      </div>
      {movie.description ? (
        <p
          style={{
            marginTop: 8,
            color: "#aaa",
            maxWidth: 520,
            lineHeight: 1.4,
          }}
        >
          {movie.description}
        </p>
      ) : null}
    </div>
  </div>
);

// Professional Movie Slider Section - 固定左侧大卡片 + 右侧循环小卡片
const MovieSliderSection = ({
  onOpenMovie,
  movies = [],
  title = "หนังใหม่มาแรง 2025",
}: {
  onOpenMovie?: (movie: {
    title: string;
    poster: string;
    backdrop?: string;
    trailerUrl?: string;
  }) => void;
  movies?: Movie[];
  title?: string;
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentMainMovie, setCurrentMainMovie] = useState(0);
  const [apiMovies, setApiMovies] = useState<Movie[]>([]);

  // Fetch from backend (no hardcoded data)
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(
          "http://localhost:4000/v1/movies?page=1&limit=24&sort=popular",
          { headers: { Accept: "application/json" } }
        );
        if (!res.ok) return;
        const data = await res.json();
        const items = Array.isArray(data?.items) ? data.items : [];
        const mapped: Movie[] = items.map((item: any) => ({
          id: item.id,
          title: item.title,
          posterUrl: item.poster || "",
          year: item.year,
          description: item.synopsis,
          ageRating: item.ageRating,
        }));
        if (!aborted && mapped.length) setApiMovies(mapped);
      } catch (_) {
        // silent fail, keep fallback
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  // GPU优化无缝循环 - 关键参数
  const CLONES = 10; // 克隆数量略增，防止在第3-4张时出现回跳变形
  const indexRef = useRef(0); // 当前步进索引（包含克隆区）
  const stepRef = useRef(0); // 每步位移像素 = 卡宽 + gap
  const timerRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);

  // 规范化输入数据，并生成右侧小卡数组：原始 + 克隆前 N 张
  const sourceMovies =
    apiMovies && apiMovies.length > 0 ? apiMovies : movies || [];
  const normalizedMovies = useMemo(
    () =>
      sourceMovies.map((m: any) => ({
        ...m,
        posterUrl: m?.posterUrl ?? m?.poster ?? m?.poster_url ?? m?.image ?? "",
      })),
    [sourceMovies]
  );
  const smallCards = useMemo(
    () => normalizedMovies.concat(normalizedMovies.slice(0, CLONES)),
    [normalizedMovies]
  );

  // 预加载下一张图片，避免切换时白一下
  useEffect(() => {
    const baseLen = normalizedMovies.length || 1;
    const next = normalizedMovies[(currentMainMovie + 1) % baseLen];
    if (next?.posterUrl) {
      const img = new Image();
      img.src = next.posterUrl;
    }
  }, [currentMainMovie, normalizedMovies]);

  // 步长计算更稳 + 监听尺寸变化
  useEffect(() => {
    const track = sliderRef.current;
    if (!track) return;

    const computeStep = () => {
      // 每次移动一张完整卡片的距离，让上一张完全消失
      const cardW = 110; // 小卡片固定宽度（见移动端样式）
      const gap = 10; // 轨道间距（见移动端样式）
      stepRef.current = cardW + gap; // 每步120px，移动一张完整卡片+间距
      // 按新步长纠正当前位置
      track.style.transform = `translate3d(-${
        indexRef.current * stepRef.current
      }px,0,0)`;
    };

    computeStep();

    const ro = new ResizeObserver(() => {
      // 尺寸变化时稍微晚一点更新，避开布局合并期
      requestAnimationFrame(computeStep);
    });
    ro.observe(track);

    // 标签不可见时自动暂停（后台标签 Timer 不准会抖）
    const onVis = () => {
      isPausedRef.current = document.visibilityState !== "visible";
    };
    document.addEventListener("visibilitychange", onVis);

    // === 下面继续你原有的 transitionend / tick 逻辑 ===
    const DURATION = 520; // 和 CSS 保持一致

    const snapBack = () => {
      track.classList.add("ezm-noTransition");
      indexRef.current = indexRef.current % normalizedMovies.length;
      track.style.transform = `translate3d(-${
        indexRef.current * stepRef.current
      }px,0,0)`;
      track.getBoundingClientRect();
      track.classList.remove("ezm-noTransition");
    };

    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== track || e.propertyName !== "transform") return;
      if (indexRef.current >= normalizedMovies.length) snapBack();
    };
    track.addEventListener("transitionend", onTransitionEnd);

    const tick = () => {
      if (isPausedRef.current) {
        timerRef.current = window.setTimeout(tick, 400);
        return;
      }

      // 下一张的图先解码，切换时不"白一下"
      const nextIdx = (indexRef.current + 1) % normalizedMovies.length;
      const preload = normalizedMovies[nextIdx];
      if (preload?.posterUrl) {
        const im = new Image();
        im.src = preload.posterUrl;
        // @ts-ignore
        im.decode?.().catch(() => {});
      }

      indexRef.current += 1;
      // 避免累计误差：每16步强制对齐一次（卡宽+gap=120，16步=1920px整）
      if (indexRef.current % 16 === 0) {
        track.classList.add("ezm-noTransition");
        track.style.transform = `translate3d(-${
          indexRef.current * stepRef.current
        }px,0,0)`;
        track.getBoundingClientRect();
        track.classList.remove("ezm-noTransition");
      }

      // 写 transform（只合成层动作）
      const offset = indexRef.current * stepRef.current;
      track.style.transform = `translate3d(-${offset}px,0,0)`;

      // 大卡片稍后切，避开 transform 开始的那几帧峰值
      window.setTimeout(() => {
        const newMainIndex = indexRef.current % normalizedMovies.length;
        setCurrentMainMovie(newMainIndex);
      }, 120);

      // 兜底回跳（有些环境不触发 transitionend）
      if (indexRef.current === normalizedMovies.length) {
        window.setTimeout(snapBack, DURATION + 40);
      }

      timerRef.current = window.setTimeout(tick, 2600); // 稍快一点，减少在边界停顿
    };

    timerRef.current = window.setTimeout(tick, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      track.removeEventListener("transitionend", onTransitionEnd);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [normalizedMovies]);

  // 悬停暂停不触发 React 重渲染
  const handleMouseEnter = () => {
    isPausedRef.current = true;
  };
  const handleMouseLeave = () => {
    isPausedRef.current = false;
  };

  return (
    <section className="movieSliderSection" style={{ padding: "24px 0" }}>
      <div
        className="sliderContainer"
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        <h3
          className="sectionTitle"
          style={{ color: "#fff", margin: "0 0 12px" }}
        >
          {title}
        </h3>
        <div
          className="sliderWrapper"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(280px, 1fr) 1fr",
            gap: 16,
            alignItems: "stretch",
          }}
        >
          {/* 固定的左侧大卡片 */}
          <div className="fixedMainCard">
            {normalizedMovies[currentMainMovie] ? (
              <MainMovieCard movie={normalizedMovies[currentMainMovie]} />
            ) : null}
          </div>

          {/* 右侧滚动的小卡片 - GPU加速无缝循环 */}
          <div
            className="rightScrollArea ezm-rightScrollArea"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ overflow: "hidden" }}
          >
            <div
              className="ezm-sliderTrack"
              ref={sliderRef}
              style={{ display: "flex", gap: 10 }}
            >
              {smallCards.map((m, i) => (
                <SmallCard key={`${m.id}-${i}`} movie={m} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MovieSliderSection;

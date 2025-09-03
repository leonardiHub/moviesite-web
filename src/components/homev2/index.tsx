/* @ts-nocheck */
/* eslint-disable react/react-in-jsx-scope */
import React, { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import SponsorMenu from "./menu";
// removed react-slick & slick css (no longer used)

type Movie = {
  id: string;
  title: string;
  posterUrl: string;
  backdropUrl?: string;
  logoUrl?: string;
  year?: number | string;
  duration?: string;
  quality?: string;
  badgeText?: string;
  tags?: string[];
  description?: string;
  ageRating?: "13+" | "15+" | "16+" | "18+"; // 新增年龄分级
};

// Asset urls
const hdIconUrl = new URL("../../images/hd-icon.png", import.meta.url).href;

// Format runtime minutes to English: examples -> "2hours", "1hour 30 minutes", "45 minutes"
const formatRuntime = (totalMinutes?: number): string | undefined => {
  if (typeof totalMinutes !== "number" || totalMinutes <= 0) return undefined;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes === 0) {
    return `${hours}${hours === 1 ? "hour" : "hours"}`; // no space per request
  }
  const h = hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"}` : "";
  const m = `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  return h ? `${h} ${m}` : m;
};

// Featured movie data
const defaultFeatured: Movie = {
  id: "featured-1",
  title: "Lilo & Stitch (2025) ลีโล & สติทซ์",
  posterUrl: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
  backdropUrl:
    "https://image.tmdb.org/t/p/w1920/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
  year: 2025,
  duration: "1 ชม. 36 นาที",
  quality: "HD",
  badgeText: "ZOOM",
  tags: [
    "หนังดิสนีย์",
    "หนังดราม่า",
    "หนังครอบครัว",
    "หนังผจญภัย",
    "หนังสยองขวัญ",
    "หนังใหม่ชนโรง",
    "พากย์ไทย",
    "ซับไทย",
    "หนังใหม่",
    "2025",
  ],
  description:
    "ดูหนัง Disney แบบ ezmovie ขอต้อนรับสู่ Lilo & Stitch (2025) ลีโล & สติทซ์ เล่าถึงการผจญภัยซึ่งความสัมพันธ์ของเด็กหญิงและสัตว์ทดลองที่น่ารักต้องเผชิญความท้าทายแสนลุ้นระทึก",
};

// Trending movies data
const defaultTrending: Movie[] = [
  {
    id: "t1",
    title: "F1",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
    badgeText: "ZOOM",
  },
  {
    id: "t2",
    title: "เซเว่น",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
    badgeText: "ZOOM",
  },
  {
    id: "t3",
    title: "MEGAN 2.0 เมแกน 2.0",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
    badgeText: "ZOOM",
  },
  {
    id: "t4",
    title: "FANTASTIC",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
  },
];

// Professional Movie Slider data with enhanced information
const movieSliderData: Movie[] = [
  {
    id: "ms1",
    title: "M3GAN 2.0 (2025) เมแกน 2.0",
    posterUrl:
      "https://bbk100.xyz/media/cache/strip/202505/movie/d315a23be69b8992f08589a53c203a81.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1920/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg",
    year: 2025,
    duration: "1 ชม. 54 นาที",
    quality: "HD",
    badgeText: "NEW",
    tags: [
      "หนังฝรั่ง",
      "หนังระทึกขวัญ",
      "หนังวิทยาศาสตร์",
      "พากย์ไทย",
      "ซับไทย",
      "หนังมาใหม่",
      "หนังสยองขวัญ",
      "2025",
    ],
    description:
      "สองปีหลังจากที่เมแกน ซึ่งเป็นปัญญาประดิษฐ์สุดอัศจรรย์ กลายเป็นตัวอันตราย และออกอาละวาดไล่ฆ่าคน เจมม่า ผู้สร้างเมแกนขึ้นมา กลายเป็นนักเขียนที่มีชื่อเสียง และเป็นผู้สนับสนุนให้รัฐบาลกํากับดูแลเอไอ",
  },
  {
    id: "ms2",
    title: "The Fantastic Four First Steps (2025) เดอะ แฟนแทสติก 4",
    posterUrl:
      "https://bbk100.xyz/media/cache/strip/202506/movie/ef3eec29097426f0a5a1141b173bd13e.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1920/uMXVeVL2v57lMv6pqBmegDHHPqz.jpg",
    year: 2025,
    duration: "1 ชม. 55 นาที",
    quality: "HD",
    badgeText: "ZOOM",
    ageRating: "18+",
    tags: [
      "หนังฝรั่ง",
      "หนังแอคชั่นบู๊",
      "หนังผจญภัย",
      "หนังวิทยาศาสตร์",
      "พากย์ไทย",
      "ซับไทย",
      "หนังมาใหม่",
      "ซุปเปอร์ฮีโร่ Superhero",
      "2025",
    ],
    description:
      "ได้รับการสร้างโดยได้แรงบันดาลใจมาจากโลกแบบ Retro-Futuristic อันฉูดฉาด ในช่วงยุค 1960 โดยภาพยนตร์เรื่องนี้จะเล่าเรื่องราวของครอบครัวแรกของมาร์เวล",
  },
  {
    id: "ms3",
    title: "Superman (2025) ซูเปอร์แมน",
    posterUrl:
      "https://bbk100.xyz/media/cache/strip/202506/movie/0f4d9c47c757d112182e9302d1064e54.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1920/59AJ2w9iRIQGdJEjZgWuvRZgbhC.jpg",
    year: 2025,
    duration: "2 ชม. 20 นาที",
    quality: "HD",
    badgeText: "HOT",
    ageRating: "18+",
    tags: [
      "หนังฝรั่ง",
      "หนังแอคชั่นบู๊",
      "หนังผจญภัย",
      "หนังดราม่า",
      "พากย์ไทย",
      "ซับไทย",
      "ซุปเปอร์ฮีโร่ Superhero",
      "2025",
    ],
    description:
      "Superman ของ เจมส์ กันน์ พาย้อนกลับไปสู่จุดที่เหล่าซูเปอร์ฮีโร่สร้างความหวัง และยังมีความเป็นมนุษย์",
  },
  {
    id: "ms4",
    title: "A Working Man (2025) นรกหยุดนรก",
    posterUrl:
      "https://bbk100.xyz/media/cache/strip/202507/movie/143e5a6f582e9ce236378b1e9a383045.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1920/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
    year: 2025,
    duration: "1 ชม. 48 นาที",
    quality: "HD",
    badgeText: "NEW",
    tags: [
      "หนังฝรั่ง",
      "หนังแอคชั่นบู๊",
      "หนังระทึกขวัญ",
      "หนังอาชญากรรม",
      "พากย์ไทย",
      "ซับไทย",
      "หนังมาใหม่",
      "2025",
    ],
    description:
      "เมื่อคนงานก่อสร้างต้องกลายเป็นนักฆ่าเพื่อปกป้องครอบครัวของเขาจากแก๊งอันตราย",
  },
  {
    id: "ms5",
    title: "Flight Risk (2025) นรกยึดไฟลต์",
    posterUrl:
      "https://bbk100.xyz/media/cache/strip/202507/movie/b79d451ba6e36bbedd55a4d378af4b33.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1920/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg",
    year: 2025,
    duration: "1 ชม. 45 นาที",
    quality: "HD",
    badgeText: "ZOOM",
    tags: [
      "หนังฝรั่ง",
      "หนังแอคชั่นบู๊",
      "หนังระทึกขวัญ",
      "หนังอาชญากรรม",
      "พากย์ไทย",
      "ซับไทย",
      "หนังมาใหม่",
      "2025",
    ],
    description:
      "นักบินที่ต้องเผชิญกับการจี้เครื่องบินในอากาศ ความอยู่รอดของผู้โดยสารทุกคนขึ้นอยู่กับเขา",
  },
  {
    id: "ms6",
    title: "Karate Kid Legends (2025) คาราเต้ คิด ผนึกพลังตำนานนักสู้",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1920/uMXVeVL2v57lMv6pqBmegDHHPqz.jpg",
    year: 2025,
    duration: "2 ชม. 10 นาที",
    quality: "HD",
    badgeText: "NEW",
    tags: [
      "หนังฝรั่ง",
      "หนังแอคชั่นบู๊",
      "หนังดราม่า",
      "หนังครอบครัว",
      "พากย์ไทย",
      "ซับไทย",
      "หนังมาใหม่",
      "2025",
    ],
    description:
      "การกลับมาของตำนานศิลปะการต่อสู้ที่จะผนึกพลังของนักสู้รุ่นเก่าและรุ่นใหม่เข้าด้วยกัน",
  },
  {
    id: "ms7",
    title: "Jurassic World Rebirth (2025) จูราสสิค เวิลด์ ภาคใหม่",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/i6CycUKHqHT0pAqKJUoHAu7LpUQ.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1920/9SSEUrSqhljBMzRe4aBTh17rUaC.jpg",
    year: 2025,
    duration: "2 ชม. 30 นาที",
    quality: "HD",
    badgeText: "HOT",
    ageRating: "13+",
    tags: [
      "หนังฝรั่ง",
      "หนังแอคชั่นบู๊",
      "หนังผจญภัย",
      "หนังวิทยาศาสตร์",
      "พากย์ไทย",
      "ซับไทย",
      "หนังมาใหม่",
      "2025",
    ],
    description: "การกลับมาของไดโนเสาร์ในภาคใหม่ที่น่าตื่นเต้นกว่าเดิม",
  },
  {
    id: "ms8",
    title: "Lilo & Stitch (2025) ลิโล่ แอนด์ สติทช์",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/gbuAbjvysD5WT2mnMrOXQHMJKhK.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1920/on9Hl96K9jp5DE5QT7AIkaTNPE.jpg",
    year: 2025,
    duration: "1 ชม. 50 นาที",
    quality: "HD",
    badgeText: "NEW",
    tags: [
      "หนังฝรั่ง",
      "หนังครอบครัว",
      "หนังผจญภัย",
      "หนังแอนิเมชัน",
      "พากย์ไทย",
      "ซับไทย",
      "หนังมาใหม่",
      "2025",
    ],
    description: "การผจญภัยของเด็กหญิงฮาวายกับเอเลี่ยนตัวน้อยสุดซน",
  },
];

// Top 10 排行榜数据（按你提供的格式）- 测试版本用不同图片
const top10Items: Array<{ id: string; title: string; poster: string }> = [
  {
    id: "1",
    title: "Wednesday (2022) เวนส์เดย์",
    poster: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
  },
  {
    id: "2",
    title: "เดอะ ลาสต์ ออฟ อัส พากย์ไทย",
    poster: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
  },
  {
    id: "3",
    title: "Trigger Point ทริกเกอร์พอยท์",
    poster: "https://image.tmdb.org/t/p/w500/qYloZjAV4EwDBTZqOB2BkjX8MMN.jpg",
  },
  {
    id: "4",
    title: "ปฏิบัติการรัก",
    poster: "https://image.tmdb.org/t/p/w500/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg",
  },
  {
    id: "5",
    title: "สควิดเกม เลมอนลาดา",
    poster: "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
  },
  {
    id: "6",
    title: "House of the Dragon มังกรพิทักษ์บัลลังก์",
    poster: "https://image.tmdb.org/t/p/w500/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg",
  },
  {
    id: "7",
    title: "The Penguin เพนกวิน",
    poster: "https://image.tmdb.org/t/p/w500/6TfOKeTO6nT1TkVEGWZOWoFJw0H.jpg",
  },
  {
    id: "8",
    title: "Emily in Paris เอมิลี่ในปารีส",
    poster: "https://image.tmdb.org/t/p/w500/8oa6dZf21zWKqTVmqYqaJHvSQz1.jpg",
  },
  {
    id: "9",
    title: "Nobody Wants This ไม่มีใครต้องการสิ่งนี้",
    poster: "https://image.tmdb.org/t/p/w500/vMSDMvjNtZISWL6sKGMz0WmK1GJ.jpg",
  },
  {
    id: "10",
    title: "Monsters มอนสเตอร์",
    poster: "https://image.tmdb.org/t/p/w500/6AGOZa4kW5FsZhkxZgdyQIE2N8u.jpg",
  },
];

// Catalog 24 slides (6 per view * 4 pages) — all using the provided URL
const catalogImageUrl =
  "https://bbk100.xyz/media/cache/strip/202508/movie/3c7e3a49f9695871f724643d936afc3f.jpg";
const catalog24: Array<{ id: string; title: string; poster: string }> =
  Array.from({ length: 24 }).map((_, i) => ({
    id: `cat-${i + 1}`,
    title: `Catalog ${i + 1}`,
    poster: catalogImageUrl,
  }));

// Class names
const styles = {
  pageRoot: "ezm-pageRoot",
  container: "ezm-container",
  header: "ezm-header",
  headerInner: "ezm-headerInner",
  brandGroup: "ezm-brandGroup",
  burger: "ezm-burger",
  hamburger: "ezm-hamburger",
  line: "ezm-line",
  lineTopBottom: "ezm-line-top-bottom",
  logo: "ezm-logo",
  nav: "ezm-nav",
  navItem: "ezm-navItem",
  headerActions: "ezm-headerActions",
  partner: "ezm-partner",
  lineIcon: "ezm-lineIcon",
  lineImg: "ezm-lineImg",
  animatedBtn: "ezm-animatedBtn",
  separator: "ezm-separator",
  searchBtn: "ezm-searchBtn",
  hero: "ezm-hero",
  heroSlide: "ezm-heroSlide",
  heroBackdrop: "ezm-heroBackdrop",
  heroOverlay: "ezm-heroOverlay",
  heroInner: "ezm-heroInner",
  heroContent: "ezm-heroContent",
  heroTitleGraphic: "ezm-heroTitleGraphic",
  heroTitleLogo: "ezm-heroTitleLogo",
  heroDescription: "ezm-heroDescription",
  heroActions: "ezm-heroActions",
  ctaButton: "ezm-ctaButton",
  ctaPrimary: "ezm-ctaPrimary",
  ctaGhost: "ezm-ctaGhost",
  btnIcon: "ezm-btnIcon",
  sloganSection: "ezm-sloganSection",
  sloganInner: "ezm-sloganInner",
  sloganText: "ezm-sloganText",
  sectionTitle: "ezm-sectionTitle",
  movieSliderSection: "ezm-movieSliderSection",
  sliderContainer: "ezm-sliderContainer",
  sliderWrapper: "ezm-sliderWrapper",
  sliderTrack: "ezm-sliderTrack",
  movieCard: "ezm-movieCard",
  cardInnerWrapper: "ezm-cardInnerWrapper",
  cardBackground: "ezm-cardBackground",
  cardOverlay: "ezm-cardOverlay",
  cardContent: "ezm-cardContent",
  cardImageBlock: "ezm-cardImageBlock",
  cardPoster: "ezm-cardPoster",
  cardTextBlock: "ezm-cardTextBlock",
  cardTitle: "ezm-cardTitle",
  cardInfo: "ezm-cardInfo",
  cardDescription: "ezm-cardDescription",
  cardCategories: "ezm-cardCategories",
  cardCategory: "ezm-cardCategory",
  cardPlayFavorite: "ezm-cardPlayFavorite",
  cardPlayBtn: "ezm-cardPlayBtn",
  cardPlayText: "ezm-cardPlayText",
  cardPlayIcon: "ezm-cardPlayIcon",
  movieCardFirst: "ezm-movieCardFirst",
  movieCardSimple: "ezm-movieCardSimple",
  fixedMainCard: "ezm-fixedMainCard",
  rightScrollArea: "ezm-rightScrollArea",
  mainMovieCard: "ezm-mainMovieCard",
  smallMovieCard: "ezm-smallMovieCard",
  transitioning: "ezm-transitioning",
  mainCardContent: "ezm-mainCardContent",
  mainCardBackground: "ezm-mainCardBackground",
  mainCardOverlay: "ezm-mainCardOverlay",
  mainCardInfo: "ezm-mainCardInfo",
  mainCardPoster: "ezm-mainCardPoster",
  mainCardDetails: "ezm-mainCardDetails",
  // Top 10 Section - 使用直接CSS类名，无需映射
} as const;

const css = `
/* Custom Scrollbar Design */
/* Webkit browsers (Chrome, Safari, newer Edge) */
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin: 2px;
}
::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg,
    rgba(35, 35, 47, 0.8) 0%,
    rgba(50, 50, 65, 0.9) 50%,
    rgba(35, 35, 47, 0.8) 100%);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
  transition: all 0.3s ease;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.3);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg,
    rgba(45, 45, 60, 0.9) 0%,
    rgba(65, 65, 85, 1) 50%,
    rgba(45, 45, 60, 0.9) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.4);
}

::-webkit-scrollbar-thumb:active {
  background: linear-gradient(45deg,
    rgba(229, 9, 20, 0.6) 0%,
    rgba(255, 26, 37, 0.7) 50%,
    rgba(229, 9, 20, 0.6) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 2px 6px rgba(229, 9, 20, 0.3);
}

::-webkit-scrollbar-corner {
  background: transparent;
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(35, 35, 47, 0.8) rgba(0, 0, 0, 0.1);
}

:root {
  --bg: #0b0d12;
  --panel: #12141b;
  --text: #e6e8ee;
  --muted: #9aa3b2;
  --primary: #e50914;
  --outline: rgba(255,255,255,.12);
  --container-max: 100vw;     /* 完全全宽布局 */
  --container-pad: 60px;      /* 恢复内边距用于内容区域 */
  --header-h: 64px;
  --hero-h: 620px;

  /* GPU优化滑块样式 */
  --gap: 15px;
  --card-w: 200px;  /* 稍微大一点的小卡片宽度 */
}

/* GPU加速滑块轨道 */
.ezm-sliderTrack {
  display: flex;
  align-items: center;  /* 垂直居中对齐 */
  gap: var(--gap);
  will-change: transform;
  transform: translate3d(0,0,0);
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  /* 移动端右侧列使用自身 margin-top 覆盖，这里去掉默认 120px，避免把小卡片推到看不到 */
}

/* 无缝跳转时临时关闭过渡 */
.ezm-noTransition {
  transition: none !important;
}

/* 固定尺寸小卡片 - 无边框版本（仅桌面版） */
@media (min-width: 769px) {
  .ezm-smallMovieCard {
    flex: 0 0 200px !important;    /* 宽度从180px增加到200px */
    width: 200px !important;
    height: 300px !important;      /* 高度也相应增加到300px保持比例 */
    border-radius: 8px !important;
    overflow: hidden !important;
    transition: transform 0.3s ease !important;
    background: #12141b !important;
    border: none !important;       /* 删除边框 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    cursor: pointer !important;
    position: relative !important; /* ensure overlay/title positioning */
  }
}

/* 桌面版hover效果和图片样式 */
@media (min-width: 769px) {
  .ezm-smallMovieCard:hover {
    transform: scale(1.05) !important;
    /* 删除hover边框效果，因为已无边框 */
  }

  .ezm-smallMovieCard img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    transition: transform 0.3s ease !important;
  }

  /* Desktop: dark overlay and title on hover */
  .ezm-smallMovieCard::after{
    content: "" !important;
    position: absolute !important;
    inset: 0 !important;
    background: rgba(0,0,0,0) !important;
    transition: background .2s ease !important;
    pointer-events: none !important;
  }

  .ezm-smallMovieCard:hover::after{
    background: rgba(0,0,0,0.28) !important;
  }

  .ezm-smallMovieCard .movie-title{
    position: absolute !important;
    left: 0 !important; right: 0 !important; bottom: 0 !important;
    padding: 6px 8px !important;
    background: linear-gradient(transparent, rgba(0,0,0,0.9)) !important;
    color: #fff !important;
    font-size: 12px !important;
    line-height: 1.2 !important;
    white-space: nowrap !important;
    text-overflow: ellipsis !important;
    overflow: hidden !important;
    font-weight: 600 !important;
    opacity: 0 !important;
    transition: opacity .2s ease !important;
    z-index: 1 !important;
  }

  .ezm-smallMovieCard:hover .movie-title{ opacity: 1 !important; }
}

/* === 替换：右侧滚动区域的"渐隐边缘"——用覆盖层替代 mask，减掉合成开销 === */
.ezm-rightScrollArea{
  overflow: hidden;
  position: relative; /* for ::before/::after */
  /* mask-image: linear-gradient(...)  删掉这行 */
}

/* 轻量渐隐（不会参与像素裁剪，合成更稳） */
.ezm-rightScrollArea::before,
.ezm-rightScrollArea::after{
  content:'';
  position:absolute; top:0; bottom:0; width:48px;
  pointer-events:none;
  z-index: 3;
}
.ezm-rightScrollArea::before{
  left:0;
  background:linear-gradient(90deg, #0a0c11, rgba(10,12,17,0));
}
.ezm-rightScrollArea::after{
  right:0;
  background:linear-gradient(270deg, #0a0c11, rgba(10,12,17,0));
}

/* === 调整 slider 轨道：独立绘制层 + 更干脆的缓动（不湿滑） === */
.ezm-sliderTrack{
  contain: paint;                /* 独立绘制层，减小无关重绘 */
  will-change: transform;
  transform: translate3d(0,0,0);
  transition: transform 520ms cubic-bezier(.4,0,.2,1); /* 更稳的 ease-out */
}

/* 小卡片阴影稍减，移动时更省帧（仅桌面版） */
@media (min-width: 769px) {
  .ezm-smallMovieCard{
    box-shadow: 0 2px 6px rgba(0,0,0,.25) !important;
  }
  .ezm-smallMovieCard:hover{
    transform: translateZ(0) scale(1.05) !important;
  }
}

/* Top10 与 Hero 的图层提示，避免参与无关布局/绘制 */
.x-top10-track{ contain: paint; }
.ezm-heroSlide{ will-change: opacity; contain: paint; }

/* ===== TOP 5 —— 数字贴右边海报；缝隙只在数字左侧 ===== */
.x-top5{
  --pad-x: 4vw;
  --gap: clamp(16px, 2.5vw, 48px);
  --pairW: calc((100vw - (var(--pad-x) * 2) - (var(--gap) * 4)) / 5);
  --cardW: calc(var(--pairW) * 0.78);                  /* 海报宽度 */
  --numLeftGap: clamp(8px, calc(var(--pairW) * .03), 16px);  /* 进一步减少左边空隙，让布局更紧凑 */
  --numOverlap: clamp(8px, calc(var(--pairW) * .05), 24px); /* 调大=更压住；调小=更贴边 */
  --numThinX: 1.04;   /* 数字横向变细（越小越细） */
  --numTallY: 1.16;  /* 数字纵向拉长（越大越高） */
  background:#0a0c11;
  padding: 0 0 56px;   /* 完全移除上间距，紧贴上一个区块 */
}

.x-top5 .-category-inner-container{
  padding: 0 var(--pad-x);
  margin-bottom: 16px; /* 默认下方间距 */
}

.x-top5-grid{
  display:grid;
  grid-template-columns: repeat(5, var(--pairW));
  gap: var(--gap);
  padding: 0 var(--pad-x);
  align-items:end;
  overflow:visible;
  margin-top: -20px;  /* 让整个网格往上移动 */
}

/* 用 grid 排两列：左(数字) + 右(海报)；两者之间绝对无缝 */
.x-top5-pair{
  display:grid !important;
  grid-template-columns: minmax(0,1fr) var(--cardW);
  align-items:end;
  column-gap:0 !important;
  padding-left:0 !important;                /* 🔑 不再给整组加左内边距 */
  margin-top: -4px;                         /* 让每个格子往上移动，减少间距 */
}

/* 🔑 把"左侧缝隙"放在数字自己身上；右侧微缝消除 */
.x-top5-pair .-number{
  margin-left: var(--numLeftGap) !important;/* 只在左侧留缝 */
  margin-right: calc(var(--numOverlap) * -1) !important; /* 原本是 -2px，现在用变量控制 */
  justify-self:end;                         /* 右贴海报 */
  text-align:right;
  line-height:.82;
  font-family:"FC Iconic Text","Helvetica Neue",Helvetica,Arial,sans-serif;
  font-weight: 700;                                  /* 从 800 降到 700，减厚感 */
  transform: scale(var(--numThinX), var(--numTallY));
  transform-origin: right bottom;                    /* 以右下为锚点，保持"贴右边海报" */
  will-change: transform;
  letter-spacing: -.03em;                            /* 微调字距，细了后更好看 */
  -webkit-text-fill-color:transparent; color:transparent;
  background-image:linear-gradient(180deg,#ff2738 0%,#e60a14 38%,#b10f1c 72%,rgba(0,0,0,0) 100%);
  -webkit-background-clip:text; background-clip:text;
  text-shadow:0 36px 58px rgba(0,0,0,.45),0 16px 24px rgba(0,0,0,.30);
  font-size: calc(var(--cardW) * 0.92);
}

.x-top5-pair .x-item-movie{
  position:relative; z-index:2;             /* 海报在上层，覆盖数字即可 */
  width: var(--cardW);
  cursor: pointer;                          /* 专业点击指针 */
}

.x-top5-pair .img-fluid.-cover-img{
  width:100%;
  aspect-ratio:298/441;
  height:auto; object-fit:cover;
  border-radius:0; box-shadow:0 10px 26px rgba(0,0,0,.45);
  display:block;
  cursor: pointer; /* 确保图片也有点击指针 */
}

/* 双滚动条（水平）的兜底 */
html, body, .ezm-pageRoot { max-width:100%; overflow-x:hidden; }

/* ===== Top10 双页轮播（每次滑动5个） ===== */
.x-top10-viewport{
  overflow:hidden;
  width:100%;
  padding-bottom: 80px; /* 与 หนังใหม่มาแรง 2025 底部留白一致 */
  margin-top: -12px; /* 减少与标题的间距 */
}
/* Top10 标题容器与 Catalog 一致底部留白 */
  .x-top10-title { padding:0; margin-bottom: 16px; }
/* 减少 Top10 容器的顶部间距 */
.x-top5 .container { padding-top: 0; }

/* Embla essentials */
.embla { position: relative; }
.embla__container { display: flex; }
.embla__slide { flex: 0 0 100%; min-width: 0; }

/* Navigation arrows */

.x-top10-nav{ position:absolute; inset:0; pointer-events:none; }
/* 与 Catalog 相同的"仅图标"箭头样式 */
.x-top10-btn{ pointer-events:auto; width:84px; height:84px; border:0; background:transparent; display:grid; place-items:center; cursor:pointer; transition:transform .18s ease; position:absolute; top:42%; transform:translateY(-50%); }
.x-top10-btn.-left{ left:10px; }
.x-top10-btn.-right{ right:10px; }
.x-top10-btn::before, .x-top10-btn::after{ content:none; }
.x-top10-btn:hover{ transform:translateY(calc(-50% - 1px)); }
.x-top10-btn:active{ transform:translateY(-50%) scale(.96); }
.x-top10-btn svg{ width:42px; height:42px; color:rgba(255,255,255,.98); transition: transform .18s ease, filter .18s ease, color .18s ease; filter: drop-shadow(0 24px 48px rgba(0,0,0,.90)) drop-shadow(0 12px 20px rgba(0,0,0,.70)); }
.x-top10-btn:hover svg{ color:rgba(255,255,255,.98); filter: drop-shadow(0 28px 56px rgba(0,0,0,.92)) drop-shadow(0 14px 24px rgba(0,0,0,.72)); transform:scale(1.25); }
.x-top10-btn:focus-visible { outline: none; }

/* 进一步减少栅格内重绘范围，降低卡顿峰值 */
.x-top5-grid{ contain: layout paint; }
.x-top10-slide{ backface-visibility: hidden; }

/* 系统"减少动效"时停动画 */
@media (prefers-reduced-motion: reduce){
  .x-top10-track{ animation: none; }
}

/* 无缝循环时消除过度滚动条闪烁 */
.x-top10-viewport{
  overflow: hidden;
}

/* 默认隐藏手机版 Top10 横向滚动容器（仅在手机媒体查询内开启） */
.x-top10-mobileScroll{ display: none; margin-top: -12px; }

/* 默认隐藏手机版 Catalog 横向滚动容器（仅在手机媒体查询内开启） */
.x-catalog-mobileScroll{ display: none; margin-top: -8px; }

/* 标题与按钮的横向布局 */
.title-with-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 8px; /* 增加底部间距，让按钮往上移动 */
}

/* See All 按钮样式 - 参考原设计 */
.-see-all-wrapper {
  display: flex;
  align-items: center;
  margin-top: -2px; /* 微调按钮向上偏移 */
  margin-right: 8px; /* 增加右边间距 */
  margin-bottom: 4px; /* 增加下方间距 */
}

.-see-all-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  padding: 4px 16px; /* 增加右边和下方padding */
  line-height: 1.1;  /* 控制按钮高度 */
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(229, 9, 20, 0.7); /* 明显的主题色边框 */
  transition: background .18s ease, border-color .18s ease, transform .18s ease, color .18s ease;
  white-space: nowrap;
  backdrop-filter: blur(10px);
}
.-see-all-link:hover {
  color: #e50914;
  background: rgba(229, 9, 20, 0.12);
  border-color: rgba(229, 9, 20, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(229, 9, 20, 0.25);
}

/* Fade In Right Shortly 动画 */
@keyframes fadeInRightShortly {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fadeInRightShortly {
  animation: fadeInRightShortly 0.6s ease-out forwards;
  animation-delay: 0.3s;
  opacity: 0;
}

/* 全站：移除所有海报/照片的圆角 */
.x-item-movie img,
.x-catalog-card img,
.x-top10-mobileItem img,
.ezm-smallMovieCard img,
.x-card-movie .-block-image img,
img.img-fluid.-image,
.${styles.movieCardSimple} .${styles.cardPoster},
.${styles.cardPoster}{
  border-radius: 0 !important;
}

/* ===== 更自然的外部阴影参数（可调） ===== */
.x-top5{
  --shadowW: 86%;                         /* 阴影宽度（相对卡片） */
  --shadowH: clamp(20px, 3vw, 36px);      /* 阴影高度 */
  --shadowBlur: 12px;                     /* 模糊半径 */
  --shadowAlpha: .30;                     /* 阴影强度 */
}

/* 1) 去掉图片自身那种"厚重"的大阴影，保留一点体积感即可 */
.x-top5-pair .img-fluid.-cover-img{
  box-shadow: 0 2px 8px rgba(0,0,0,.22);   /* 轻薄、过渡自然 */
}

/* 2) 新增"地面接触阴影"：椭圆径向渐变 + 轻微 blur，最自然 */
.x-top5-pair .x-item-movie{
  position: relative;
  z-index: 2;
  isolation: isolate;                      /* 确保伪元素只在当前卡片内混合 */
}

.x-top5-pair .x-item-movie::after{
  content:'';
  position:absolute;
  left:50%;
  bottom:-4px;
  width: var(--shadowW);
  height: var(--shadowH);
  transform: translateX(-50%) scale(1.05);
  background: radial-gradient(closest-side,
            rgba(0,0,0,calc(var(--shadowAlpha) + .10)) 0,
            rgba(0,0,0,var(--shadowAlpha)) 40%,
            rgba(0,0,0,calc(var(--shadowAlpha) - .12)) 65%,
            rgba(0,0,0,0) 72%);
  filter: blur(var(--shadowBlur));
  opacity: .95;
  pointer-events: none;
  z-index: 1;                              /* 在卡片下方 */
  transition: transform .35s ease, filter .35s ease, opacity .35s ease;
}

/* 3) hover 时轻微扩散，效果更顺滑 */
.x-top5-pair:hover .x-item-movie::after{
  transform: translateX(-50%) scale(1.10);
  filter: blur(calc(var(--shadowBlur) + 3px));
  opacity: .9;
}

/* 4) 数字的阴影也调顺一点（减少"层层叠"的感觉） */
.x-top5-pair .-number{
  text-shadow:
    0 30px 70px rgba(0,0,0,.32),
    0 12px 26px rgba(0,0,0,.22),
    0 2px  4px  rgba(0,0,0,.18);
}
/* ===== Mobile tidy layout (<= 640px) — cleaner, premium look ===== */
@media (max-width: 640px) {
  /* Header */
  :root{
    --icon: 32px;         /* 两个图标的热区（正方形） */
    --gap: 6px;           /* 分隔线两侧的间隔（改这里） */
    --sep-h: 18px;        /* 分隔线高度 */
    --search-nudge: 12px;  /* 搜索图标光学位置微调：正值向右，负值向左 */
  }

  .${styles.headerInner} { height: 50px; padding: 0; gap: 0; position: relative; justify-content: space-between; width: 100%; }
  .${styles.header} { padding-top: env(safe-area-inset-top); background: rgba(0,0,0,.45); backdrop-filter: saturate(140%) blur(6px); }

  /* 关键：让 brandGroup 横跨整个 header（有 left 也要有 right） */
  .${styles.brandGroup} {
    position: absolute !important;
    left: 0; right: 0;                 /* 让它铺满整行 */
    top: 0; bottom: 0;
    margin: 0; padding: 0;
    display: block;
  }

  /* 汉堡固定在最左侧垂直居中 */
  .${styles.hamburger} {
    position: absolute;
    left: 8px; top: 50%;
    transform: translateY(-50%);
    margin: 0; padding: 8px;
    z-index: 11;
  }
  .${styles.hamburger} svg { width: 20px; height: 20px; }

  /* LOGO 以整个 header 为参考系居中（因为 brandGroup 现在是全宽） */
  .ezm-navbar-brand {
    position: absolute !important;
    left: 50%; top: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    z-index: 10;
  }
  .ezm-logoImg { height: 22px; width: auto; display: block; }

  /* 右侧区域改为 5 列网格：ICON | gap | LINE | gap | ICON */
  .${styles.headerActions}{
    position: absolute; right: 0; top: 50%;
    transform: translateY(-50%);
    display: grid !important;
    grid-template-columns: var(--icon) var(--gap) 1px var(--gap) var(--icon);
    align-items: center;
    justify-items: center;
    padding-right: 6px;
    gap: 0 !important;             /* 防止之前的 gap 继续作用 */
    z-index: 12;                   /* 比 brandGroup 高，防止被遮到 */
  }

  /* 清掉一切 margin 干扰 */
  .${styles.headerActions} > * { margin: 0 !important; }

  /* 两个图标都占各自的列，尺寸一致、内容绝对居中 */
  .${styles.lineIcon}, .${styles.searchBtn}{
    width: var(--icon); height: var(--icon);
    display: grid; place-items: center;
    padding: 0 !important; border: 0; background: transparent;
  }
  .${styles.lineIcon}{ background:#00c300 !important; border-radius:8px; }

  /* 分隔线占第 3 列，不带任何左右 margin */
  .${styles.separator}{
    grid-column: 3;
    width: 1px; height: var(--sep-h);
    margin: 0 !important;
    background: linear-gradient(180deg, rgba(255,255,255,.32), rgba(255,255,255,.12));
  }

  /* 内部图标尺寸（搜索图标更大） */
  .${styles.lineImg}  { width: 20px; height: 20px; display: block; }
  .${styles.btnIcon}  { width: 18px; height: 18px; display: block; }
  .${styles.searchBtn} .${styles.btnIcon} { width: 22px; height: 22px; }

  /* 微调搜索图标的"光学位置"：只移动搜索图标的 SVG，本体点击热区不变 */
  .${styles.headerActions} .${styles.searchBtn} .${styles.btnIcon} {
    transform: translateX(var(--search-nudge));
    transition: transform .25s ease;
  }

  /* 保留 hover 放大效果——叠加位移与缩放 */
  .${styles.searchBtn}:hover .${styles.btnIcon} {
    transform: translateX(var(--search-nudge)) scale(1.1);
  }

  /* Hide sponsor logos on mobile */
  .ezm-sponsorBar { display: none !important; }

  /* Hero: reduce noise */
  :root { --hero-h: 44vh; }  /* 再调低整体高度 */
  .${styles.hero} { height: 340px !important; }  /* 继续缩短高度，进一步上移 */
  .${styles.heroContent} {
    padding: 240px 0 0 !important;  /* 底部留白清零，紧贴下一节 */
    max-width: 100% !important;  /* 允许内容区域使用全宽 */
    text-align: center;  /* 所有内容居中 */
    display: flex;
    flex-direction: column;
    align-items: center;  /* logo和按钮都居中 */
  }
  .${styles.heroTitleLogo} {
    margin: 12px auto 6px !important;  /* 向下移动(上边距12px)并更贴近按钮(下边距6px) */
    width: clamp(180px, 35vw, 480px) !important;  /* 从 220px-640px 缩小到 180px-480px */
    height: clamp(70px, 10vw, 160px) !important;  /* 从 90px-220px 缩小到 70px-160px */
    background-position: center center !important; /* 背景图标志水平垂直居中 */
  }
  .${styles.heroDescription} { display: none; }
  .${styles.heroActions} {
    gap: 10px;
    flex-direction: row !important;  /* 横向排列 */
    justify-content: center;  /* 按钮组居中 */
    width: 100%;
    max-width: 320px;  /* 限制按钮组最大宽度 */
    margin-top: 4px;
  }
  /* 红色按钮较短 */
  .${styles.ctaButton}.${styles.ctaPrimary} {
    flex: 0 0 auto;  /* 不拉伸，保持内容宽度 */
    padding: 0 16px !important;  /* 从 20px 减小到 16px */
  }
  /* 灰色按钮较长 */
  .${styles.ctaButton}.${styles.ctaGhost} {
    flex: 1;  /* 拉伸占满剩余空间 */
    max-width: 160px;  /* 从 180px 减小到 160px */
  }
  .${styles.ctaButton} {
    height: 38px !important;  /* 从 44px 减小到 38px */
    font-size: 13px !important;  /* 从 14px 减小到 13px */
    padding: 0 14px;
  }

  /* Slogan text smaller */
  .${styles.sloganText} {
    font-size: 12px !important;  /* 改为 12px */
    padding: 0 16px;  /* 添加左右内边距 */
    width: 100% !important;
    max-width: 100% !important;
    white-space: nowrap;           /* 强制单行显示 */
    overflow: hidden;              /* 避免溢出 */
    text-overflow: ellipsis;       /* 超出时省略（保障极小屏幕）*/
    text-align: center;            /* 居中显示 */
    margin: 8px auto 0;            /* 标语文字往上移动 */
    transform: translateY(-20px);   /* 使用transform移动位置，不影响布局流 */
  }
  /* Slogan 适当位置避开红色线遮挡 */
  .${styles.sloganSection} { padding: 2px 0 24px !important; margin-top: -10px !important; }

  /* 让"หนังใหม่มาแรง 2025"与标语保持适当距离 */
  .${styles.movieSliderSection} { padding: 0 0 32px !important; }
  .${styles.sliderContainer} { padding: 32px var(--container-pad) 0 !important; }
  /* Keep title visually aligned with main card on mobile: remove extra left padding */
  @media (max-width: 768px){
    .${styles.sectionTitle}{ padding-left: 0 !important; }
  }

  /* Section titles */
  .${styles.sectionTitle},
  h2.-title { font-size: 20px; margin: 12px 0; }
  .x-top10-title { padding: 0; margin-bottom: 10px; }
  .${styles.sectionTitle} { padding-left: 8px; }
  h2.-title { padding-left: 0; } /* 由container统一控制padding */
  /* 统一所有标题容器的水平内边距为 var(--pad-x)，以便与大卡片基线一致 */
  /* 已在各自的样式中设置，此处移除重复 */

  /* Top10: 手机端使用横向滚动版本，隐藏桌面 Embla */
  .x-top10-viewport { padding-bottom: 24px; }
  .x-top10-nav { display: none; }
  .x-top5 { padding: 0 0 24px; }
  /* 完全消除标题与图片区域之间的垂直间距 */
  .x-top5 .-category-inner-container{
    margin-bottom: 0;
    padding-left: var(--pad-x);
    padding-right: var(--pad-x);
  }
  /* 手机端：10个连续横向滚动，保持电脑版数字+图片排版 */
  .x-top10-mobileScroll{ display:block; }
  .x-top10-mobileScroll {
    display: block;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    padding: 0 0 12px;
    margin: -20px 0 0;
  }
  .x-top10-mobileScroll::-webkit-scrollbar { height: 6px; }
  .x-top10-mobileScroll::-webkit-scrollbar-track { background: rgba(255,255,255,.08); border-radius: 4px; }
  .x-top10-mobileScroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.35); border-radius: 4px; }
  .x-top10-mobileTrack {
    display: inline-flex;
    align-items: flex-end;
    gap: 8px;
    width: max-content;
    padding: 0;
  }
  /* 移动端：沿用桌面版的数字+图片布局（x-top5-pair），仅缩小卡片宽度 */
  .x-top10-m-pair{
    --cardW: clamp(70px, 17vw, 100px);         /* 缩小为原来的一半左右 */
    --numLeftGap: clamp(4px, 1.2vw, 8px);      /* 左侧留白减半 */
    --numOverlap: clamp(4px, 1.2vw, 8px);      /* 叠压度减半 */
    --numThinX: 1.04;                          /* 与桌面一致的形变 */
    --numTallY: 1.16;
  }
.x-top10-mobileItem {
    position: relative;
    flex: 0 0 auto;
    width: 140px;
    aspect-ratio: 2 / 3;
  border-radius: 0;
    overflow: hidden;
    background: #0f131a;
    box-shadow: 0 6px 18px rgba(0,0,0,.35);
    cursor: pointer;
  }
  .x-top10-mobileItem img { width: 100%; height: 100%; object-fit: cover; display:block; }
  .x-top10-mobileItem .-number {
    position: absolute; left: 8px; bottom: 6px;
    font-size: 28px; font-weight: 800;
    letter-spacing: -0.02em;
    color: rgba(255,255,255,.95);
    text-shadow: 0 8px 20px rgba(0,0,0,.65);
  }
  /* 移动端隐藏原 Embla 轮播，显示横向滚动版本 */
  .embla.x-top10-viewport{ display:none; }

  /* Catalog: 移动端横向滚动版本，隐藏桌面 Embla */
  .x-catalog-mobileScroll{ display:block; }
  .x-catalog-mobileScroll {
    display: block;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    padding: 0 0 12px;
    margin: -8px 0 0;
  }
  .x-catalog-mobileScroll::-webkit-scrollbar { height: 6px; }
  .x-catalog-mobileScroll::-webkit-scrollbar-track { background: rgba(255,255,255,.08); border-radius: 4px; }
  .x-catalog-mobileScroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.35); border-radius: 4px; }
  .x-catalog-mobileTrack {
    display: inline-flex;
    align-items: flex-end;
    gap: 12px;
    width: max-content;
    padding: 0 12px;
  }
  .x-catalog-mobileCard {
    position: relative;
    flex: 0 0 auto;
    width: 28vw;
    max-width: 110px;
    aspect-ratio: 2 / 3;
    border-radius: 0;
    overflow: hidden;
    background: #0f131a;
    box-shadow: 0 6px 18px rgba(0,0,0,.35);
    cursor: pointer;
  }
  .x-catalog-mobileCard img { width: 100%; height: 100%; object-fit: cover; display:block; border-radius: 0; }
  .x-catalog-mobileCard .-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.95) 100%);
    padding: 8px;
    opacity: 0;
    transition: opacity 0.25s ease;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .x-catalog-mobileCard:hover .-overlay { opacity: 1; }
  .x-catalog-mobileCard .-overlay { opacity: 1; } /* 移动端固定显示 */
  .x-catalog-mobileCard .-title {
    font-size: 12px;
    font-weight: 600;
    margin: 0;
    color: #fff;
    line-height: 1.2;
    text-shadow: 0 2px 4px rgba(0,0,0,.8);
    text-align: center;
  }
  /* 移动端隐藏原 Embla 轮播 */
  .embla-cat{ display:none; }

  /* Catalog carousel: 2-up cards with compact paddings */
  .x-catalog { padding: 8px 0 24px; }
  .x-catalog .-category-inner-container {
    margin-bottom: 6px;
    padding: 0 var(--pad-x); /* 移动端也保持左右padding */
  }
  .x-category-movie-title{ padding: 0; }

  /* 移动端调整按钮wrapper间距 */
  .-see-all-wrapper {
    margin-right: 6px;
    margin-bottom: 3px;
  }

  /* 移动端按钮样式调整 */
  .-see-all-link {
    font-size: 12px;
    padding: 5px 14px; /* 移动端也增加padding */
    border-color: rgba(229, 9, 20, 0.55);
  }
  .embla-cat { padding: 0 16px; }
  .embla-cat__container { margin: 0 -6px; }
  .embla-cat__slide { flex: 0 0 50%; padding: 0 6px; }
  .x-catalog-btn { display: none; }
  .x-catalog-card .-title { font-size: 14px; }

  /* 移动端固定显示电影标题 */
  .x-catalog-card .-overlay {
    opacity: 1;
    transform: translateY(0);
  }
}

  /* Poster animation more compact */
  .poster-animation-section { height: 22vh; min-height: 140px; }

  /* 移动端紧凑的内容间距 */
  .poster-content-overlay { padding: 8px 0; }
  .poster-title { margin-bottom: 6px; }
  .poster-subtitle { margin-bottom: 10px; }
  .poster-btn-wrapper { margin-top: 8px; }

/* 平板等中等屏幕也固定显示标题 */
@media (min-width: 769px) and (max-width: 1024px) {
  .x-catalog-card .-overlay {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 桌面版显示Embla轮播，隐藏移动端滚动 */
@media (min-width: 769px) {
  .embla-cat{ display: block !important; }
  .x-catalog-mobileScroll { display: none !important; }
}

/* 大屏幕桌面版恢复hover效果 */
@media (min-width: 1025px) {
  .x-catalog-card .-overlay {
    opacity: 0;
    transform: translateY(8px);
  }
  .x-catalog-card:hover .-overlay {
    opacity: 1;
    transform: translateY(0);
  }
}

  /* Optional: simplify lower info sections on small devices */
  .features-section, .new-content-section { display: none; }

  /* Footer spacing */
  .site-footer, .custom-site-footer { padding: 32px 0 18px; }
}

/* ===== 电影详情区块阴影优化 + 字体缩小 ===== */

/* 主卡片自然阴影系统 */
.${styles.mainMovieCard} {
  box-shadow: 0 3px 12px rgba(0,0,0,.25);   /* 轻薄体积阴影 */
}

.${styles.mainMovieCard}:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,.35);   /* hover时稍微加深 */
}

/* 主卡片海报的自然阴影 */
.${styles.mainCardPoster} {
  box-shadow: 0 4px 16px rgba(0,0,0,.30);   /* 轻薄、自然 */
}

.${styles.mainMovieCard}:hover .${styles.mainCardPoster} {
  box-shadow:
    0 8px 24px rgba(0,0,0,.40),
    0 0 0 1px rgba(229, 9, 20, 0.3);       /* 保留红色边框效果 */
}

/* 旧的重复定义已清理 */

/* 右侧小卡片也添加自然阴影 */
.${styles.smallMovieCard} {
  box-shadow: 0 2px 8px rgba(0,0,0,.22);   /* 轻薄阴影 */
}

.${styles.smallMovieCard}:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,.30);  /* hover时稍微加深 */
}

/* ===== 统一标题大小 + 进一步缩小大卡片字体 ===== */

/* 让"หนังใหม่มาแรง 2025"和"Top 10 ประจำสัปดาห์"一样大 */
.${styles.sectionTitle} {
  font-size: 24px;      /* 放大标题字号 */
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;  /* 进一步缩小下边距 */
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

/* 手机版本标题调小并靠左 - 已移到文件末尾统一处理 */

/* Top10标题也统一样式 */
h2.-title {
  font-size: 24px;      /* 放大到与上面一致 */
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

/* ===== Catalog 24 — Embla, 6 per view, step 6 ===== */
.x-catalog {
  --pad-x: 4vw; /* 与 Top10 一致的外边距 */
  padding: 8px 0 48px; /* 增加下方padding：32px -> 48px */
  background: #0a0c11;
  position: relative;
}
.x-catalog .-category-inner-container{
  padding: 0 var(--pad-x);
  margin-bottom: 20px; /* 与Top 10一致的下方间距 */
}
  /* 调整 Top10 标题容器内边距 */
  .x-top5 .-category-inner-container{
    padding-left: var(--pad-x);
    padding-right: var(--pad-x);
    margin-bottom: 20px; /* 增加下方间距 */
  }
.embla-cat { position: relative; overflow: hidden; padding: 0 var(--pad-x); }
.embla-cat__container {
  display: flex;
  will-change: transform;
  backface-visibility: hidden;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  margin: 0 -10px; /* 抵消单个 slide 的左右内边距，确保首张对齐且尺寸一致 */
}
.embla-cat__slide {
  flex: 0 0 calc(100% / 6);
  padding: 0 10px;
  box-sizing: border-box;
  transform: translateZ(0); /* 硬件加速，防止意外缩放 */
}
/* 移除对第一张的特殊处理，保持所有卡片尺寸一致 */
/* .embla-cat__slide:first-child { padding-left: 0; } */
.x-catalog-card{
  position: relative;
  transform: translateZ(0); /* 防止意外的 3D 变换 */
  overflow: hidden;               /* 让蒙版与圆角完全贴合，避免底部露出 */
  border-radius: 0;               /* 去除圆角 */
  cursor: pointer;                /* 专业点击指针 */
}
.x-catalog-card img{
  width: 100%;
  display: block;
  border-radius: 0;
  box-shadow: none;
  transform: translateZ(0); /* 确保图片不会有缩放效果 */
  transition: none; /* 移除任何可能的过渡效果 */
  cursor: pointer;  /* 确保图片也有点击指针 */
}
/* 通用：海报标题悬浮显隐（Catalog 与 Top10 共用） */
.x-catalog-card .-overlay,
.x-item-movie .-overlay{
  position:absolute; left:0; right:0; bottom:0;
  /* 让蒙版更长一些，并支持不同尺寸卡片 */
  padding:18px 12px 18px;           /* 底部留白更大，标题位置更高 */
  min-height: 30%;                  /* 覆盖稍多一些 */
  display:flex; align-items:center; justify-content:center;  /* 垂直居中到蒙版内部，更靠上 */
  text-align:center;
  background: linear-gradient(
    180deg,
    rgba(0,0,0,0) 0%,
    rgba(0,0,0,.45) 35%,
    rgba(0,0,0,.78) 75%,
    rgba(0,0,0,.92) 100%
  );
  transform: translateY(100%);
  opacity: 0;
  transition: transform .25s ease, opacity .25s ease;
  pointer-events: none;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.x-catalog-card .-overlay{          /* 仅 Catalog：优化蒙版高度与位置 */
  min-height: 28%;                  /* 不要太高 */
  padding: 12px 12px 18px;          /* 让标题更靠下 */
  align-items: flex-end;            /* 内容贴近底部 */
  bottom: -2px;                     /* 轻微下移，盖住圆角导致的露底 */
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.45) 40%, rgba(0,0,0,.92) 100%);
}
.x-catalog-card:hover .-overlay,
.x-item-movie:hover .-overlay{ transform: translateY(0); opacity:1; }
.x-catalog-card .-title,
.x-item-movie .-title{
  margin:0; color:#fff; font-weight:500; font-size:13px; line-height:1.35; /* 更细更大一点 */
  text-shadow:0 2px 6px rgba(0,0,0,.6);
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
  text-align:center;
}
.x-catalog-card .-title{            /* 仅 Catalog：放大标题并更细 */
  font-size: 16px;
  font-weight: 500;
}
.x-catalog-nav{ position:absolute; inset:0; pointer-events:none; }

/* Catalog arrows — with reduced padding and border color */
.x-catalog-btn{
  pointer-events:auto;
  width:84px;
  height:60px; /* 减少高度，等效减少上下padding */
  border: 2px solid rgba(229, 9, 20, 0.6); /* 添加红色边框 */
  border-radius: 8px; /* 添加圆角 */
  background: rgba(0, 0, 0, 0.3); /* 半透明背景 */
  display:grid;
  place-items:center;
  cursor:pointer;
  transition:transform .18s ease, border-color .18s ease, background .18s ease;
  position:absolute;
  top:50%;
  transform:translateY(-50%);
  z-index: 1;
}
.x-catalog-btn.-left{ left:10px; margin-left:0; }
.x-catalog-btn.-right{ right:10px; margin-right:0; }
/* Shadow-only halo shaped like the arrow (chevron) */
.x-catalog-btn::before{
  content:""; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
  width:56px; height:56px; pointer-events:none; z-index:-1;
  /* Create a chevron-shaped shadow using conic-gradient mask */
  background: radial-gradient(closest-side, rgba(0,0,0,.55), rgba(0,0,0,.0) 70%);
  -webkit-mask: conic-gradient(from 45deg at 50% 50%, transparent 0 25%, #000 25% 35%, transparent 35% 65%, #000 65% 75%, transparent 75% 100%);
  mask: conic-gradient(from 45deg at 50% 50%, transparent 0 25%, #000 25% 35%, transparent 35% 65%, #000 65% 75%, transparent 75% 100%);
  filter: blur(6px);
}
.x-catalog-btn:hover{
  transform:translateY(calc(-50% - 1px));
  border-color: rgba(229, 9, 20, 0.9); /* hover时边框更亮 */
  background: rgba(229, 9, 20, 0.15); /* hover时背景稍微变红 */
}
.x-catalog-btn:active{
  transform:translateY(-50%) scale(.96);
  border-color: rgba(229, 9, 20, 1); /* 点击时边框完全不透明 */
  background: rgba(229, 9, 20, 0.25); /* 点击时背景更红 */
}
.x-catalog-btn svg{
  width:42px; height:42px; color:rgba(255,255,255,.98);
  transition: transform .18s ease, filter .18s ease, color .18s ease;
  filter: drop-shadow(0 24px 48px rgba(0,0,0,.90)) drop-shadow(0 12px 20px rgba(0,0,0,.70));
}
/* Hover: keep neutral white, slightly intensify shadow only */
.x-catalog-btn:hover svg{ color:rgba(255,255,255,.98); filter: drop-shadow(0 28px 56px rgba(0,0,0,.92)) drop-shadow(0 14px 24px rgba(0,0,0,.72)); transform:scale(1.25); }
.x-catalog-btn:focus-visible { outline: none; }

/* 分类标签缩小 */
.${styles.cardCategory} {
  font-size: 9px;      /* 极大缩小标签字体 */
  padding: 2px 4px;    /* 极大缩小内边距 */
  border-radius: 3px;  /* 更小的圆角 */
}

/* 海报尺寸也适当缩小 */
.${styles.mainCardPoster} {
  flex: 0 0 200px;     /* 进一步缩小到 200px */
}

/* 内容区域适当调整间距 */
.${styles.mainCardContent} {
  padding: 24px;       /* 进一步缩小到 24px */
  gap: 20px;           /* 进一步缩小到 20px */
}

.${styles.mainCardDetails} {
  padding: 8px 0;      /* 进一步缩小到 8px */
}

/* ===== Big Card: compact typography + fixed CTA (single source of truth) ===== */
.ezm-mainMovieCard.is-compact .ezm-mainCardContent{
  padding: 20px;
  gap: 16px;
}
.ezm-mainMovieCard.is-compact .ezm-mainCardPoster{
  flex: 0 0 160px;          /* 标准宽度 */
  height: 240px;            /* 标准高度，2:3比例 */
}

/* 右侧信息区改成网格：标题 | 元信息 | 可伸展内容 | 底部按钮 */
.ezm-mainMovieCard.is-compact .ezm-mainCardDetails{
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  row-gap: 12px;            /* 增加间距，更优雅 */
  min-height: 100%;
  padding: 12px 0;          /* 增加内边距 */
}

/* 标题 - 高级感字体 */
.ezm-mainMovieCard.is-compact .ezm-mainCardDetails h2{
  font-size: 20px;          /* 稍大一些，更有存在感 */
  line-height: 1.3;         /* 更舒适的行高 */
  margin: 0;
  font-weight: 600;         /* 不要太重，保持优雅 */
  letter-spacing: -0.01em;  /* 轻微负字距，更精致 */
  color: #ffffff;
}

/* 年份/时长/HD 标识 - 精致小字 */
.ezm-mainMovieCard.is-compact .ezm-mainCardInfo{
  font-size: 13px;          /* 稍大一些，更易读 */
  gap: 10px;                /* 增加间距 */
  margin: 0;
  color: rgba(255, 255, 255, 0.85);  /* 稍微透明，层次感 */
  font-weight: 500;
  letter-spacing: 0.01em;   /* 轻微正字距，更清晰 */
}

/* 简介 - 优雅的描述文字 */
.ezm-mainMovieCard.is-compact .ezm-mainCardDetails p{
  font-size: 14px;          /* 更易读的大小 */
  line-height: 1.5;         /* 更舒适的行高 */
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;    /* 3行截断，更多信息 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  letter-spacing: 0.005em;  /* 轻微字距调整 */
}

/* 标签 - 精致小徽章 */
.ezm-mainMovieCard.is-compact .ezm-cardCategories{
  gap: 6px;                 /* 增加间距 */
  margin: 0;
  flex-wrap: wrap;
}
.ezm-mainMovieCard.is-compact .ezm-cardCategory{
  font-size: 11px;          /* 稍大一些，更清晰 */
  padding: 4px 8px;         /* 更舒适的内边距 */
  border-radius: 6px;       /* 更优雅的圆角 */
  font-weight: 500;
  letter-spacing: 0.02em;   /* 清晰的字距 */
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* CTA 按钮 - 高级设计 */
.ezm-mainMovieCard.is-compact .ezm-cardPlayFavorite{
  grid-row: 4;
  align-self: end;
  margin: 0;
}
.ezm-mainMovieCard.is-compact .ezm-cardPlayBtn{
  height: 42px;             /* 更高的按钮，更易点击 */
  padding: 0 20px;          /* 更宽的内边距 */
  font-size: 15px;          /* 更清晰的字体 */
  gap: 8px;                 /* 图标间距 */
  font-weight: 600;
  letter-spacing: 0.01em;
  border-radius: 6px;       /* 与标签一致的圆角 */
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.ezm-mainMovieCard.is-compact .ezm-cardPlayIcon{
  width: 14px;              /* 稍大的图标 */
  height: 14px;
}

/* 适配：中/小屏再缩一点 */
@media (max-width: 1200px){
  .ezm-mainMovieCard.is-compact .ezm-mainCardPoster{ flex:0 0 170px; }
  .ezm-mainMovieCard.is-compact .ezm-mainCardDetails h2{ font-size: 16px; }
}
/* 移动端样式已移到文件末尾统一处理 */

.${styles.pageRoot} {
  background: #0a0c11;
  color: var(--text);
  width: 100vw;
  overflow-x: hidden; /* 隐藏水平滚动条 */
  min-height: 100vh;
  font-family: 'Kanit', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-weight: 400;
}

.${styles.container} {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
}
/* Header - 精确复刻原版 */
.${styles.header} {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(180deg,
    rgba(10, 12, 18, 0.95) 0%,
    rgba(10, 12, 18, 0.7) 60%,
    rgba(10, 12, 18, 0.3) 85%,
    transparent 100%);

  transition: all 0.3s ease;
}
.${styles.headerInner} {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-h);
  padding: 0 calc(var(--container-pad) - 10px); /* 整体再向左一点 */
  max-width: var(--container-max);
  margin: 0 auto;
  width: 100%;
}

.${styles.brandGroup} {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 200px;
}

/* 新的汉堡菜单动画按钮 */
.${styles.hamburger} {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background: transparent;
  border: none;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
}

.${styles.hamburger}:hover {
  transform: translateY(-3px) scale(1.15);
  filter: drop-shadow(0 8px 16px rgba(229, 9, 20, 0.4));
  animation: luxuryBounce 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes luxuryBounce {
  0% { transform: translateY(0) scale(1); }
  40% { transform: translateY(-4px) scale(1.2); }
  70% { transform: translateY(-2px) scale(1.12); }
  100% { transform: translateY(-3px) scale(1.15); }
}

.${styles.hamburger} input {
  display: none;
}

.${styles.hamburger} svg {
  height: 2.5em;
  width: 2.5em;
  transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.${styles.line} {
  fill: none;
  stroke: #e50914;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 4;
  transition:
    stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1),
    stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1),
    stroke 300ms ease;
}

.${styles.lineTopBottom} {
  stroke-dasharray: 12 63;
}

.${styles.hamburger}:hover .${styles.line} {
  stroke: #ff1a25;
  filter: drop-shadow(0 0 4px rgba(229, 9, 20, 0.6));
}

.${styles.hamburger} input:checked + svg {
  transform: rotate(-45deg);
}

.${styles.hamburger} input:checked + svg .${styles.lineTopBottom} {
  stroke-dasharray: 20 300;
  stroke-dashoffset: -32.42;
}

/* 添加额外的动画效果 */
.${styles.hamburger}:active {
  transform: translateY(0) scale(0.95);
  transition: all 0.1s ease;
}

.${styles.hamburger}:active svg {
  transform: scale(0.9);
}

/* 线条的额外微动画 */
.${styles.line} {
  animation: ezm-lineFloat 3s ease-in-out infinite;
}

@keyframes ezm-lineFloat {
  0%, 100% {
    stroke-width: 2.5;
  }
  50% {
    stroke-width: 2.8;
  }
}

.${styles.logo} {
  font-weight: 900;
  font-size: 22px;
  letter-spacing: 0.8px;
  color: white;
  text-transform: none;
}

.${styles.logo} span {
  color: #e50914;
}

.${styles.nav} {
  display: flex;
  gap: 18px;               /* 间距更小 */
  margin-left: 16px;       /* 靠左一点 */
  flex: 1;
  justify-content: flex-start;
}

.${styles.navItem} {
  position: relative;
  color: #ffffff;
  text-decoration: none;
  font-size: 13px;          /* 再小一点 */
  font-weight: 500;
  padding: 6px 2px;         /* 垂直更紧凑 */
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  white-space: nowrap;
  font-family: 'Kanit', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.${styles.navItem}:hover {
  color: #ffffff;
  transform: translateY(-1px) scale(1.04); /* 弱化交互 */
  text-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
  animation: luxuryPulse 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes luxuryPulse {
  0% { transform: translateY(0) scale(1); }
  30% { transform: translateY(-3px) scale(1.12); }
  60% { transform: translateY(-1px) scale(1.06); }
  100% { transform: translateY(-2px) scale(1.08); }
}

.${styles.navItem}::after {
  content: '';
  position: absolute;
  left: 50%;
  right: 50%;
  bottom: -2px;
  height: 2px;              /* 更细 */
  background: linear-gradient(90deg, #e50914, #ff1a25, #e50914);
  border-radius: 2px;  /* 相应调整圆角 */
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 0 12px rgba(229, 9, 20, 0.8);
}

.${styles.navItem}.is-active::after,
.${styles.navItem}:hover::after {
  left: 20%;               /* 更短 */
  right: 20%;
  box-shadow: 0 0 12px rgba(229, 9, 20, 0.8);
}

.${styles.headerActions} {
  display: flex;
  align-items: center;
  gap: 8px;
}

.${styles.lineIcon} {
  width: 28px;
  height: 28px;
  background: #00c300;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  color: white;
}

.${styles.partner} {
  font-size: 12px;  /* 从14px缩小到12px */
  font-weight: 700;
  color: #e6e8ee;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 999px;
  margin-left: 2px;
  letter-spacing: 0.3px;
  background: #1e2533;
  border: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.${styles.headerActions} a:nth-child(2) {
  background: linear-gradient(135deg, #2f3542, #1e2533);
}

.${styles.headerActions} a:nth-child(3) {
  background: linear-gradient(135deg, #ff4757, #ff3838);
}

.${styles.headerActions} a:nth-child(4) {
  background: linear-gradient(135deg, #ffa502, #ff6348);
}

.${styles.searchBtn} {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  color: #ffffff;
  background: transparent;
  cursor: pointer;
  margin-left: 0;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
}

.${styles.searchBtn}:hover {
  color: #ffffff;
  transform: scale(1.1);
}

.${styles.searchBtn}:active {
  transform: translateY(0) scale(0.95);
  transition: all 0.1s ease;
}

.${styles.btnIcon} {
  width: 18px;
  height: 18px;
  transition: all 0.3s ease;
}

.${styles.searchBtn}:hover .${styles.btnIcon} {
  transform: scale(1.1);
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
}

/* LOGO 图片尺寸（和 ezmovie 观感接近） */
.ezm-navbar-brand {
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
}

.ezm-navbar-brand:hover {
  transform: translateY(-2px) scale(1.12);
  filter: drop-shadow(0 6px 20px rgba(229, 9, 20, 0.3));
  animation: luxuryFloat 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes luxuryFloat {
  0% { transform: translateY(0) scale(1); }
  35% { transform: translateY(-3px) scale(1.15); }
  65% { transform: translateY(-1px) scale(1.1); }
  100% { transform: translateY(-2px) scale(1.12); }
}

.ezm-logoImg {
  height: 32px;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}
@media (min-width: 1200px) {
  .ezm-logoImg {
    height: 36px;
  }
}

/* 赞助 LOGO 条（桌面显示） */
.ezm-show-lg {
  display: none;
}

@media (min-width: 992px) {
  .ezm-show-lg {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

/* 赞助 LOGO 按钮外观 */
.ezm-sponsorBar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ezm-sponsorLogo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  background: transparent;
  border: none;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.ezm-sponsorLogo:hover {
  transform: scale(1.05);
}

.ezm-sponsorLogo img {
  height: 24px;  /* 从28px再调小到24px */
  width: auto;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,.4));
}

/* 调整 Header 右侧整体间距更像原站 */
.${styles.headerActions} {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 分隔线样式 */
.${styles.separator} {
  width: 1px;
  height: 24px;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  margin: 0 6px;
}

/* LINE图标样式 */
.${styles.lineImg} {
  height: 32px;
  width: 32px;
  object-fit: contain;
}

.${styles.lineIcon}:hover {
  transform: scale(1.05);
}

/* 移除动画按钮的背景效果 */
.${styles.animatedBtn} {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-origin: center;
  background: transparent !important;
}

.${styles.animatedBtn}:active {
  transform: translateY(0) scale(0.98);
  transition: all 0.1s ease;
}

/* Hero Section - 全宽banner */
.${styles.hero} {
  position: relative;
  min-height: var(--hero-h);
  overflow: hidden;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  z-index: 50;
  isolation: isolate;
}

.${styles.heroSlide} {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.8s ease-in-out;
}

.${styles.heroSlide}.active {
  opacity: 1;
}

.${styles.heroBackdrop} {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center 22%;
  filter: brightness(0.60) saturate(1.08);
  transform: scale(1.06);
}

.${styles.heroOverlay} {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(10, 12, 18, 0.04) 0%, rgba(10, 12, 18, 0.86) 78%, #0a0c12 100%),
    linear-gradient(90deg, rgba(0, 0, 0, 0.70) 0%, rgba(0, 0, 0, 0) 46%),
    radial-gradient(120% 60% at 90% 0%, rgba(229, 9, 20, 0.12) 0%, rgba(229, 9, 20, 0) 60%);
  z-index: 1;
}

.${styles.heroInner} {
  position: relative;
  z-index: 3;
  height: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-pad);
}

.${styles.heroContent} {
  position: relative;
  padding: 260px 0 100px;
  max-width: 50%;
  margin-left: 0;
}

/* Force-remove any textual heading remnants in hero */
.${styles.heroContent} h1,
.${styles.heroContent} h2,
.${styles.heroContent} .${styles.heroTitleGraphic} {
  display: none !important;
}
.${styles.heroContent} img.${styles.heroTitleGraphic},
.${styles.heroContent} img[alt] {
  font-size: 0 !important;
  color: transparent !important;
}

.${styles.heroTitleGraphic} {
  font-size: clamp(3rem, 6vw, 5rem);  /* 从4.5rem-7rem缩小到3rem-5rem */
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  color: #ffffff;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.8);
  font-family: 'Kanit', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* Use logo image only: hide any textual title element that might still render */
.ezm-hero .${styles.heroTitleGraphic} { display: none !important; }
.ezm-hero img.${styles.heroTitleGraphic} { display: none !important; }

/* Visual block for logo background image */
.${styles.heroTitleLogo} {
  width: clamp(220px, 40vw, 640px);
  height: clamp(90px, 12vw, 220px);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: left center;
  margin-bottom: 1.2rem;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.55));
  position: relative;
  z-index: 4; /* above overlay */
}

.${styles.heroDescription} {
  color: #ffffff;
  line-height: 1.6;
  font-size: 1.1rem;  /* 从1.5rem缩小到1.1rem */
  margin-bottom: 2rem;
  max-width: 75%;
  font-weight: 400;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  font-family: 'Kanit', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.${styles.heroActions} {
  display: flex;
  gap: 14px;
}

.${styles.ctaButton} {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 24px;
  border-radius: 4px;
  border: none;
  font-weight: 700;
  font-size: 16px;  /* 从20px缩小到16px */
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-family: 'Kanit', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  text-transform: none;
}

.${styles.ctaPrimary} {
  background: #e50914;
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(229, 9, 20, 0.4);
}

.${styles.ctaPrimary}:hover {
  background: #b8070f;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(229, 9, 20, 0.6);
}

.${styles.ctaGhost} {
  background: rgba(109, 109, 110, 0.7);
  color: #ffffff;
  border: none;
  backdrop-filter: blur(8px);
}

.${styles.ctaGhost}:hover {
  background: rgba(109, 109, 110, 0.4);
  transform: scale(1.05);
}

/* Slogan */
.${styles.sloganSection} {
  padding: 26px 0 22px;
  text-align: center;
  background: #0a0c11;
}

.${styles.sloganInner} {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-pad);
}

.${styles.sloganText} {
  font-size: 1.55rem;  /* 从2rem调小到1.75rem */
  font-weight: 500;
  color: #fff;
  letter-spacing: 0.2px;
  line-height: 1.3;
}

/* Professional Movie Slider Section - Better than ezmovie */
.${styles.movieSliderSection} {
  padding: 0 0 80px;
  background: #0a0c11;
  position: relative;
  overflow: hidden;
}

.${styles.movieSliderSection}::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, rgba(229, 9, 20, 0.6), transparent);
  animation: pulseGlow 3s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

.${styles.sliderContainer} {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 40px var(--container-pad) 0;
}

.${styles.sliderWrapper} {
  position: relative;
  margin-top: 24px;
  display: flex;
  gap: 32px;
  align-items: stretch;
}

/* 固定的左侧主卡片区域 - 更宽更高 */
.${styles.fixedMainCard} {
  flex: 0 0 780px;  /* 保持780px宽度 */
  height: 420px;    /* 从360px增加到420px，更高 */
  position: relative;
}

/* 右侧滚动区域 - 底部对齐大卡片 */
.${styles.rightScrollArea} {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end; /* 底部对齐大卡片 */
}

/* 旧的sliderTrack样式已被GPU优化版本取代，避免冲突
.${styles.sliderTrack} {
  display: flex;
  gap: 20px;
  overflow-x: hidden;
  padding: 8px 4px 20px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  mask-image: linear-gradient(90deg,
    transparent 0%,
    #000 4%,
    #000 96%,
    transparent 100%);
  will-change: scroll-position;
}

.${styles.sliderTrack}::-webkit-scrollbar {
  display: none;
}
*/

.${styles.movieCard} {
  flex: 0 0 580px;
  scroll-snap-align: start;
  position: relative;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  background: #12141b;
  border: 2px solid rgba(255, 255, 255, 0.08);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-origin: center;
  cursor: pointer;
}

/* 第一张卡片更大 */
.${styles.movieCardFirst} {
  flex: 0 0 720px !important;
  height: 450px !important;
}

/* 右侧简化卡片 */
.${styles.movieCardSimple} {
  flex: 0 0 320px !important;
  height: 480px !important;
}

.${styles.movieCardSimple} .${styles.cardContent} {
  padding: 0 !important;
  gap: 0 !important;
}

.${styles.movieCardSimple} .${styles.cardTextBlock} {
  display: none !important;
}

.${styles.movieCardSimple} .${styles.cardImageBlock} {
  flex: 1 !important;
  height: 100% !important;
}

.${styles.movieCardSimple} .${styles.cardPoster} {
  height: 100% !important;
  border-radius: 16px !important;
  border: none !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.${styles.movieCardSimple}:hover .${styles.cardPoster} {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8);
}

.${styles.movieCardSimple}:hover {
  transform: translateY(-8px) scale(1.01);
  border-color: rgba(229, 9, 20, 0.3);
}

/* 固定主卡片样式 */
.${styles.mainMovieCard} {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  background: #12141b;
  border: none;
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4);
}

.${styles.mainMovieCard}:hover {
  transform: translateY(-12px) scale(1.015);
  box-shadow:
    0 35px 70px rgba(0, 0, 0, 0.7);
}

.${styles.mainCardBackground} {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: brightness(0.6) saturate(1.2);
  transition: all 0.8s ease;
  transform: scale(1.05);
}

.${styles.mainMovieCard}:hover .${styles.mainCardBackground} {
  filter: brightness(0.75) saturate(1.4);
  transform: scale(1.08);
}

.${styles.mainCardOverlay} {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.6) 40%,
    rgba(0, 0, 0, 0.3) 70%,
    transparent 100%
  );
}

.${styles.mainCardContent} {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  padding: 32px;
  gap: 28px;
  align-items: stretch;
}

.${styles.mainCardPoster} {
  flex: 0 0 240px;
  height: 100%;
  border-radius: 16px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  filter: brightness(0.98) saturate(1.0);
}

.${styles.mainMovieCard}:hover .${styles.mainCardPoster} {
  transform: translateY(-6px) scale(1.025);
  border-color: rgba(229, 9, 20, 0.5);
  box-shadow:
    0 25px 55px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(229, 9, 20, 0.3);
  filter: brightness(1.05) saturate(1.1);
}

.${styles.mainCardDetails} {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px 0;      /* 缩小内边距 */
}

.${styles.mainCardDetails} h2 {
  font-size: 18px;     /* 进一步大幅缩小 */
  font-weight: 600;    /* 进一步减轻字重 */
  color: #ffffff;
  margin: 0 0 10px;    /* 进一步缩小边距 */
  line-height: 1.1;    /* 紧凑行高 */
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.${styles.mainMovieCard}:hover .${styles.mainCardDetails} h2 {
  color: #ffffff;
  text-shadow:
    0 4px 20px rgba(229, 9, 20, 0.5),
    0 2px 8px rgba(0, 0, 0, 0.9);
  transform: translateY(-3px);
}
.${styles.mainCardInfo} {
  display: flex;
  align-items: center;
  gap: 8px;            /* 进一步缩小间距 */
  margin-bottom: 12px; /* 进一步缩小边距 */
  font-size: 11px;     /* 进一步大幅缩小 */
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.${styles.mainCardDetails} p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;     /* 进一步大幅缩小 */
  line-height: 1.3;    /* 更紧凑行高 */
  margin-bottom: 14px; /* 进一步缩小边距 */
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}
.${styles.mainCardDetails} .${styles.cardCategories} {
  margin-bottom: 32px;
}
.${styles.mainCardDetails} .${styles.cardPlayBtn} {
  padding: 8px 16px;   /* 进一步大幅缩小内边距 */
  font-size: 13px;     /* 进一步大幅缩小 */
  font-weight: 600;    /* 减轻字重 */
  gap: 4px;            /* 进一步缩小间距 */
}

/* 内容切换动画 - 更丝滑的效果 */
.${styles.transitioning} {
  opacity: 0.8;
  transform: scale(0.99);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.${styles.transitioning} .${styles.mainCardBackground} {
  filter: brightness(0.4) saturate(0.8);
  transform: scale(1.02);
}

.${styles.transitioning} .${styles.mainCardDetails} h2 {
  opacity: 0.6;
  transform: translateY(4px);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.${styles.transitioning} .${styles.mainCardDetails} p {
  opacity: 0.4;
  transform: translateY(6px);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.05s;
}

.${styles.transitioning} .${styles.cardCategories} {
  opacity: 0.3;
  transform: translateY(8px);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s;
}

.${styles.transitioning} .${styles.cardPlayBtn} {
  opacity: 0.5;
  transform: translateY(10px) scale(0.95);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.15s;
}

/* 旧的右侧小卡片样式 - 已被ezm-smallMovieCard替代
.${styles.smallMovieCard} {
  flex: 0 0 280px;
  height: 420px;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #12141b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.7s cubic-bezier(0.23, 1, 0.32, 1);
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.${styles.smallMovieCard}:hover {
  transform: translateY(-12px) scale(1.03);
  border-color: rgba(229, 9, 20, 0.4);
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(229, 9, 20, 0.2);
}

.${styles.smallMovieCard} img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  filter: brightness(0.95) saturate(1.0);
}

.${styles.smallMovieCard}:hover img {
  transform: scale(1.08);
  filter: brightness(1.15) saturate(1.25);
}
*/

.${styles.movieCard}:hover {
  transform: translateY(-12px) scale(1.02);
  border-color: rgba(229, 9, 20, 0.4);
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(229, 9, 20, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: cardLuxuryFloat 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes cardLuxuryFloat {
  0% { transform: translateY(0) scale(1); }
  30% { transform: translateY(-15px) scale(1.03); }
  60% { transform: translateY(-8px) scale(1.015); }
  100% { transform: translateY(-12px) scale(1.02); }
}

.${styles.cardInnerWrapper} {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.${styles.cardBackground} {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: brightness(0.7) saturate(1.1);
  transition: all 0.6s ease;
  transform: scale(1.05);
}

.${styles.movieCard}:hover .${styles.cardBackground} {
  filter: brightness(0.85) saturate(1.3);
  transform: scale(1.08);
}

.${styles.cardOverlay} {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.7) 35%,
    rgba(0, 0, 0, 0.4) 65%,
    rgba(0, 0, 0, 0.1) 90%,
    transparent 100%
  );
  transition: all 0.6s ease;
}

.${styles.movieCard}:hover .${styles.cardOverlay} {
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.6) 35%,
    rgba(0, 0, 0, 0.3) 65%,
    rgba(0, 0, 0, 0.05) 90%,
    transparent 100%
  );
}

.${styles.cardContent} {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  align-items: stretch;
  padding: 18px;
  gap: 18px;
}

.${styles.cardImageBlock} {
  flex: 0 0 200px;
  position: relative;
}

.${styles.cardPoster} {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.${styles.movieCard}:hover .${styles.cardPoster} {
  transform: translateY(-4px) scale(1.05);
  border-color: rgba(229, 9, 20, 0.4);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(229, 9, 20, 0.3);
}

.${styles.cardPoster}::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(229, 9, 20, 0.1) 100%);
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.6s ease;
}

.${styles.movieCard}:hover .${styles.cardPoster}::after {
  opacity: 1;
}

.${styles.cardTextBlock} {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px 0;
  min-width: 0;
}

.${styles.cardTitle} {
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px;
  line-height: 1.2;
  font-family: 'Kanit', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  transition: all 0.3s ease;
}

.${styles.movieCard}:hover .${styles.cardTitle} {
  color: #ffffff;
  text-shadow: 0 4px 16px rgba(229, 9, 20, 0.4);
  transform: translateY(-2px);
}

.${styles.cardInfo} {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 16px;
  color: var(--muted);
  font-weight: 500;
}

.${styles.cardInfo} .ezm-gap {
  color: var(--muted);
}

.${styles.cardInfo} .ezm-age-img,
.${styles.cardInfo} .ezm-hd-img {
  height: 20px;
  width: auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.${styles.cardDescription} {
  color: rgba(255, 255, 255, 0.85);
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  font-family: 'Kanit', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.${styles.movieCard}:hover .${styles.cardDescription} {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
}

.${styles.cardCategories} {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.${styles.cardCategory} {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 4px 8px;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  backdrop-filter: blur(4px);
}

.${styles.cardCategory}:hover {
  background: rgba(229, 9, 20, 0.15);
  border-color: rgba(229, 9, 20, 0.3);
  color: #ffffff;
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 4px 12px rgba(229, 9, 20, 0.2);
}

.${styles.cardPlayFavorite} {
  margin-top: auto;
}

.${styles.cardPlayBtn} {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #e50914 0%, #ff1a25 100%);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow:
    0 3px 12px rgba(229, 9, 20, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  font-family: 'Kanit', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.${styles.cardPlayBtn}::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.${styles.cardPlayBtn}:hover {
  background: linear-gradient(135deg, #ff1a25 0%, #e50914 100%);
  transform: translateY(-2px) scale(1.05);
  box-shadow:
    0 8px 24px rgba(229, 9, 20, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.${styles.cardPlayBtn}:hover::before {
  left: 100%;
}

.${styles.cardPlayBtn}:active {
  transform: translateY(0) scale(0.98);
  box-shadow:
    0 2px 8px rgba(229, 9, 20, 0.4),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.${styles.cardPlayIcon} {
  width: 14px;
  height: 14px;
  transition: transform 0.3s ease;
}

.${styles.cardPlayBtn}:hover .${styles.cardPlayIcon} {
  transform: scale(1.1);
}

.${styles.cardPlayText} {
  transition: all 0.3s ease;
}

/* Add quality badge */
.${styles.cardPoster} {
  position: relative;
}

.${styles.movieCard} .quality-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #ffd166 0%, #ff9800 100%);
  color: #000;
  font-size: 12px;
  font-weight: 900;
  padding: 4px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 3;
}

.${styles.movieCard} .new-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #e50914 0%, #ff1a25 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  padding: 4px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(229, 9, 20, 0.4);
  z-index: 3;
  animation: newBadgePulse 2s ease-in-out infinite;
}

@keyframes newBadgePulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(229, 9, 20, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 4px 16px rgba(229, 9, 20, 0.6);
    transform: scale(1.05);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .${styles.fixedMainCard} {
    flex: 0 0 680px;  /* 中屏稍微缩小 */
    height: 380px;    /* 中屏高度相应增加 */
  }

  .${styles.mainCardContent} {
    padding: 20px;      /* 进一步缩小 */
    gap: 16px;          /* 进一步缩小 */
  }

  .${styles.mainCardPoster} {
    flex: 0 0 200px;
  }

  .${styles.mainCardDetails} h2 {
    font-size: 16px;    /* 缩小 */
  }

  /* 旧的smallMovieCard样式已被ezm-smallMovieCard替代
  .${styles.smallMovieCard} {
    flex: 0 0 240px;
    height: 360px;
  }
  */
}

@media (max-width: 1024px) {
  .${styles.sliderWrapper} {
    flex-direction: column;
    gap: 24px;
  }

  .${styles.fixedMainCard} {
    flex: none;
    width: 100%;
    height: 340px;  /* 小屏高度相应增加 */
  }

  .${styles.mainCardContent} {
    padding: 20px;
    gap: 16px;
  }

  .${styles.mainCardPoster} {
    flex: 0 0 160px;
  }

  .${styles.mainCardDetails} h2 {
    font-size: 14px;    /* 缩小 */
  }

  .${styles.mainCardDetails} p {
    font-size: 11px;    /* 缩小 */
  }

  .${styles.rightScrollArea} {
    height: 280px;
  }

  /* 旧的smallMovieCard样式已被ezm-smallMovieCard替代
  .${styles.smallMovieCard} {
    flex: 0 0 200px;
    height: 300px;
  }
  */
}
/* 旧的移动端样式已删除，统一移到文件末尾 */

/* Responsive */
@media (max-width: 1024px) {
  .${styles.nav} {
    display: none;
  }
  .${styles.hero} {
    height: 480px;
  }
  .${styles.heroTitleGraphic} {
    font-size: 32px;  /* 从45px缩小到32px */
  }
}

@media (max-width: 640px) {
  .${styles.headerInner} {
    height: 48px;
  }
  .${styles.hero} {
    height: 420px;
  }
  .${styles.heroContent} {
    padding: 130px 0 60px;
  }
  .${styles.heroTitleGraphic} {
    font-size: 28px;  /* 从36px缩小到28px */
  }
  .${styles.heroActions} {
    flex-direction: column;
    gap: 12px;
  }
}

/* ===== Exact card inside the slider (embed) ===== */
.x-card-movie{
  padding:0;margin:0;height:100%;
  cursor: pointer; /* 专业点击指针 */
}
.x-card-movie .-item-inner-wrapper{
  position:relative;border-radius:0;overflow:hidden;height:100%;
  background-size:cover;background-position:center;
}
.x-card-movie .-item-inner-wrapper::after{
  content:"";position:absolute;inset:0;
  background: linear-gradient(180deg, rgba(12, 12, 16, .6), rgba(12, 12, 16, .4) 50%, rgba(12, 12, 16, .8));
  pointer-events:none;
  z-index:1; /* 确保在内容下方 */
}
.x-card-movie .-row-wrapper{
  position:relative;display:grid;grid-template-columns:260px minmax(0,1fr);  /* 小海报稍微缩小适应矮高度 */
  gap:28px;align-items:stretch;padding:20px 24px;height:100%;  /* 上下padding减少适应矮高度 */
  overflow:hidden; /* 防止溢出 */
  z-index:2; /* 确保在蒙版上方 */
}

/* 左侧海报 + 角标 - 适配新尺寸，延伸到按钮高度 */
.x-card-movie .-block-image{
  position:relative;
  width:100%; /* 使用Grid分配的宽度 */
  max-width:260px; /* 调整最大宽度到260px适应新的更宽布局 */
  height:100%; /* 占满Grid高度，延伸到按钮位置 */
  margin:0;
  overflow:hidden; /* 防止子元素溢出 */
  display:flex;
  align-items:center; /* 图片在容器内垂直居中 */
}
/* 第一个定义移除，合并到后面的完整定义中 */
.x-card-movie .-badge{position:absolute;top:10px;left:10px;z-index:3}
.x-card-movie .-badge.-hot{
  background:#ff2840;color:#fff;font-weight:800;font-size:12px;line-height:20px;
  padding:0 10px;border-radius:6px;box-shadow:0 6px 14px rgba(0,0,0,.35)
}
/* 没有 ZOOM PNG 时的文字版外观 */
.x-card-movie .-badge.-zoom{
  background:#0c0e14;border:2px solid #9fe3ff;color:#cfeeff;
  font-weight:900;letter-spacing:.5px;font-size:13px;line-height:22px;
  padding:0 10px;border-radius:6px;box-shadow:0 6px 14px rgba(0,0,0,.35)
}

/* 右侧文案区 - 简化Grid布局，直接按元素顺序 */
.x-card-movie .-block-content{
  min-width:0;color:#fff;
  display:grid;
  grid-template-rows: auto auto auto 1fr auto; /* 标题 | 信息 | 描述 | 标签 | 按钮 */
  gap:8px;
  height:100%;
  overflow:hidden; /* 防止内容溢出 */
  max-width:100%; /* 严格限制宽度 */
}
.x-card-movie .-title{
  margin:0;font-size:18px;font-weight:700;color:#fff;line-height:1.35;
  text-shadow:0 1px 3px rgba(0,0,0,.8),0 2px 6px rgba(0,0,0,.4);
  /* 标题最多2行，自然排序第1行 */
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}
.x-card-movie .-info{
  /* 日期信息，自然排序第2行 - 字体稍大一点 */
  display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0;color:#fff;font-weight:500;font-size:14px;
  text-shadow:0 1px 2px rgba(0,0,0,.6);
}
.x-card-movie .-gap{opacity:.95}
.x-card-movie img.-age-img{width:20px;height:20px;display:inline-block}
.x-card-movie img.-hd-img{width:26px;height:19px;display:inline-block}
.x-card-movie .-description{
  /* 描述区域，自然排序第3行 - 上下添加padding */
  margin:0;
  padding:8px 0;
}
.x-card-movie .-description p{
  margin:0;font-size:13px;line-height:1.5;max-width:72ch;color:#fff;
  text-shadow:0 1px 2px rgba(0,0,0,.7);
  /* 描述文字最多3行，超过显示省略号 */
  display:-webkit-box;
  -webkit-line-clamp:3;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

.x-card-movie .-category{
  /* 标签区域，自然排序第4行，使用1fr空间 - 密集排列 */
  display:flex;flex-wrap:wrap;gap:4px;margin:0;
  align-self:start; /* 标签区域靠上对齐 */
  /* 标签最多显示2行，超过自动隐藏 */
  max-height:calc(28px * 2 + 4px); /* 2行标签高度 + 1个gap间距 */
  overflow:hidden;
}
.x-card-movie .btn.-btn-category{
  display:inline-flex;align-items:center;justify-content:center;height:28px;padding:0 12px;border-radius:6px;
  background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.20);
  color:#fff;font-weight:600;font-size:11px;text-decoration:none;
  text-shadow:0 1px 2px rgba(0,0,0,.6);
}
.x-card-movie .btn.-btn-category:hover{
  background:rgba(229,9,20,.18);border-color:rgba(229,9,20,.34);color:#fff
}

/* 按钮自然排序第5行（最后一行） */
.x-card-movie .-play-favorite{
  display:flex;gap:8px;
  align-self:end; /* 按钮固定在底部 */
  margin:0;
}
.x-card-movie .btn.-btn-play{
  display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:6px;
  background:linear-gradient(135deg,#e50914,#ff1a25);color:#fff;font-weight:700;font-size:13px;border:none;
  box-shadow:0 6px 18px rgba(229,9,20,.4);text-decoration:none;cursor:pointer;
  text-shadow:0 1px 2px rgba(0,0,0,.8);
}
.x-card-movie .btn.-btn-play .-ic{
  width:0;height:0;border-left:8px solid #fff;border-top:5px solid transparent;border-bottom:5px solid transparent
}

/* 让容器正好充满你原来的 fixedMainCard */
.${styles.fixedMainCard}{ padding:0 }

/* 背景使用小封面放大取景 */
.x-card-movie .-item-inner-wrapper{
  background-size: 120% auto;     /* 放大一点，更像"放大"效果 */
  background-position: 35% 50%;   /* 取中偏左的区域，按需调百分比 */
}

/* 小封面完整定义 - 调整为合适尺寸，延伸到按钮高度 */
.x-card-movie img.img-fluid.-image{
  width:100%; /* 适应父容器宽度 */
  max-width:280px; /* 调整最大宽度到280px */
  height:100%; /* 充满父容器高度 */
  min-height:400px; /* 最小高度确保延伸到按钮 */
  object-fit:cover;border-radius:12px;display:block;
  box-shadow:0 12px 32px rgba(0,0,0,.35);
  /* 强制清除所有可能的暗化效果 */
  filter: none !important;
  opacity: 1 !important;
  brightness: 1 !important;
  contrast: 1 !important;
  -webkit-filter: none !important;
}

/* 这个定义已被移动到前面，避免重复 */

/* "10" 的两位数排版：1 叠在 0 的左上 */
.x-top5{
  --ten0Right: 25%;   /* 0 往右移动的距离 - 增加更多 */
  --ten1Left:  -35%;  /* 1 的水平位移，更靠左 */
  --ten1Top:  0%;     /* 1 的垂直位移，与0对齐 */
}

.x-top5-pair .-number.is-10{
  position:relative;
  letter-spacing: 0;       /* 关闭字距，避免影响叠放 */
}

.x-top5-pair .-number.is-10 .-d0{ /* 前层的"0" - 往右移动 */
  position:relative;
  left: var(--ten0Right);  /* 0 往右移动 */
  z-index: 2;  /* 0 在前面 */
  display:inline-block;
  -webkit-text-fill-color:transparent; color:transparent;
  background-image:linear-gradient(180deg,#ff2738 0%,#e60a14 38%,#b10f1c 72%,#b10f1c 100%);
  -webkit-background-clip:text; background-clip:text;
  text-shadow:
    0 30px 70px rgba(0,0,0,.32),
    0 12px 26px rgba(0,0,0,.22),
    0 2px  4px rgba(0,0,0,.18);
  pointer-events:none;
}

.x-top5-pair .-number.is-10 .-d1{ /* 底层的"1" - 和0一样大小但有独立阴影 */
  position:absolute;
  left: var(--ten1Left);
  top:  var(--ten1Top);
  font-size: 1em;  /* 和0一样大小 */
  z-index: 1;  /* 1 在后面 */
  display:inline-block;
  -webkit-text-fill-color:transparent; color:transparent;
  /* 修复底部半透明问题：渐变结尾用实色而不是透明 */
  background-image:linear-gradient(180deg,#ff2738 0%,#e60a14 38%,#b10f1c 72%,#b10f1c 100%);
  -webkit-background-clip:text; background-clip:text;
  /* 为1单独添加更强的阴影效果 */
  text-shadow:
    0 35px 80px rgba(0,0,0,.4),
    0 15px 30px rgba(0,0,0,.3),
    0 3px  6px rgba(0,0,0,.25);
  pointer-events:none;
}

/* 可选：小屏再紧一点 */
@media (max-width: 1024px){
  .x-top5{ --ten0Right: 20%; --ten1Left:-30%; --ten1Top:0%; }
}

/* ===== Promo banners ===== */
.promo-section{ position:relative; padding: 0; border-top:3px solid rgba(229, 9, 20, 0.5); border-bottom:3px solid rgba(229, 9, 20, 0.5); width: 100vw; margin-left: calc(-50vw + 50%); }
.promo-bg{ position:relative; min-height: 520px; background-position:center; background-size:cover; background-repeat:no-repeat; background-color:#0a0c11; display:flex; align-items:center; width: 100%; padding: 40px 0; }
.promo-inner{ max-width:1200px; margin:0 auto; padding:0 60px; display:flex; gap:40px; align-items:center; width:100%; }
.promo-inner.is-left{ justify-content:flex-start; }
.promo-inner.is-right{ justify-content:flex-end; }
.promo-text{ max-width: 580px; }
.promo-text.is-right{ text-align:right; }
.promo-text h3{ font-size: 36px; font-weight:800; color:#ff3434; margin:0 0 12px; text-shadow:0 10px 30px rgba(0,0,0,.6); }
.promo-text p{ font-size:18px; color:#fff; margin:0; line-height:1.7; text-shadow:0 8px 24px rgba(0,0,0,.65); }
@media (max-width: 1200px){ .promo-bg{ min-height: 480px; } .promo-text{ max-width: 500px; } }
@media (max-width: 992px){ .promo-bg{ min-height: 440px; } .promo-text{ max-width: 420px; } }
@media (max-width: 768px){
  .promo-bg{ min-height: 320px; padding: 20px 0; } /* 减少垂直padding */
  .promo-inner{ padding: 0 20px; } /* 减少水平padding */
  .promo-text{ max-width: 90%; }
  .promo-text.is-right{ text-align: right; } /* 第二个section保持右对齐 */
  .promo-text h3{ font-size: 24px; margin: 0 0 8px; } /* 缩小标题字体 */
  .promo-text p{ font-size: 14px; line-height: 1.5; word-break: break-word; hyphens: auto; overflow-wrap: break-word; } /* 缩小段落字体并优化断词 */
}

/* 超小屏幕进一步优化 */
@media (max-width: 480px){
  .promo-bg{ min-height: 280px; padding: 16px 0; }
  .promo-inner{ padding: 0 16px; }
  .promo-text h3{ font-size: 20px; margin: 0 0 6px; }
  .promo-text p{ font-size: 13px; line-height: 1.4; word-break: break-word; hyphens: auto; overflow-wrap: break-word; }
  .promo-text.is-right{ text-align: right; } /* 确保超小屏幕也保持右对齐 */
}

/* 移动端断行控制 */
.mobile-break {
  display: none;
}

@media (max-width: 768px) {
  .mobile-break {
    display: inline;
  }
}

/* ===== Features Section ===== */
.features-section {
  position: relative;
  padding: 120px 0 140px;
  background: #0a0c11;
  background-image: url('https://ezmovie.me/media/cache/strip/202411/block/bf4833b4294d260e01626387da434e31.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  border-top: 3px solid rgba(229, 9, 20, 0.5);
  border-bottom: 3px solid rgba(229, 9, 20, 0.5);
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  overflow: hidden;
  min-height: 800px;
}

.features-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(10, 12, 17, 0.3) 0%,
    rgba(10, 12, 17, 0.2) 50%,
    rgba(10, 12, 17, 0.3) 100%
  );
  z-index: 1;
}
.features-container {
  position: relative;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 60px;
  height: 100%;
  display: flex;
  align-items: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 80px;
  align-items: center;
  width: 100%;
}
.feature-card {
  position: relative;
  background: transparent;
  padding: 0;
  border: none;
  transition: all 0.3s ease;
  text-align: center;
}
.feature-card:hover {
  transform: translateY(-8px);
}

.feature-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.feature-icon {
  width: 320px;
  height: 210px;
  border-radius: 12px;
  overflow: hidden;
  border: none;
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.05);
}

.feature-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feature-text {
  flex: 1;
  max-width: 600px;
}

.feature-title {
  font-size: 28px;
  font-weight: 700;
  color: #e50914;
  margin: 0 0 15px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  text-align: center;
}

.feature-description {
  font-size: 16px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
  text-align: center;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .features-section {
    padding: 100px 0 120px;
    min-height: 800px;
  }

  .features-grid {
    gap: 65px;
  }

  .feature-content {
    gap: 15px;
  }

  .feature-icon {
    width: 280px;
    height: 185px;
  }

  .feature-title {
    font-size: 24px;
    margin-bottom: 12px;
  }

  .feature-description {
    font-size: 15px;
    line-height: 1.4;
  }

  .feature-text {
    max-width: 520px;
  }
}

@media (max-width: 768px) {
  .features-section {
    padding: 80px 0 100px;
    min-height: 700px;
  }

  .features-container {
    padding: 0 30px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 70px;
  }

  .feature-content {
    gap: 12px;
  }

  .feature-icon {
    width: 250px;
    height: 165px;
  }

  .feature-title {
    font-size: 22px;
    margin-bottom: 10px;
  }

  .feature-description {
    font-size: 14px;
    line-height: 1.4;
    text-align: center;
  }

  .feature-text {
    max-width: 400px;
  }
}

/* ===== New Content Section ===== */
.new-content-section {
  position: relative;
  padding: 80px 0;
  background-image: url('https://ezmovie.me/media/cache/strip/202105/block/95576f4ef5d75c4182ebfb506cd49157.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  border-top: 3px solid rgba(229, 9, 20, 0.5);
  /* border-bottom: 3px solid rgba(229, 9, 20, 0.5); */ /* 移除底边，避免与PosterAnimationSection的顶边重复 */
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  overflow: hidden;
}

.new-content-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(10, 12, 17, 0.85) 0%, rgba(10, 12, 17, 0.7) 50%, rgba(10, 12, 17, 0.85) 100%);
  z-index: 1;
}

.new-content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 60px;
  position: relative;
  z-index: 2;
}

.new-content-inner {
  text-align: center;
}
.new-content-title {
  font-size: 42px;
  font-weight: 700;
  color: #e50914;
  margin-bottom: 50px;
  text-shadow: 0 3px 10px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
}

.content-list {
  text-align: left;
}

.content-item h3 {
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 30px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
}

.content-item ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.content-item li {
  margin-bottom: 35px;
  padding: 0;
}

.content-item li strong {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #e50914;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.content-item li p {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  text-align: justify;
}

/* Responsive Design for New Content Section */
@media (max-width: 1024px) {
  .new-content-section {
    padding: 60px 0;
  }

  .new-content-container {
    padding: 0 40px;
  }

  .new-content-title {
    font-size: 36px;
    margin-bottom: 40px;
  }

  .content-item h3 {
    font-size: 24px;
    margin-bottom: 25px;
  }

  .content-item li strong {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .content-item li p {
    font-size: 15px;
    line-height: 1.5;
  }
}

@media (max-width: 768px) {
  .new-content-section {
    padding: 50px 0;
  }

  .new-content-container {
    padding: 0 30px;
  }

  .new-content-title {
    font-size: 28px;
    margin-bottom: 30px;
  }

  .content-item h3 {
    font-size: 22px;
    margin-bottom: 20px;
  }

  .content-item li {
    margin-bottom: 25px;
  }

  .content-item li strong {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .content-item li p {
    font-size: 14px;
    line-height: 1.5;
    text-align: left;
  }
}

/* ===== Poster Animation Section ===== */
.poster-animation-section {
  position: relative;
  height: 45vh;  /* 从31vh增加到45vh */
  min-height: 280px;  /* 从180px增加到280px */
  overflow: hidden;
  background: linear-gradient(135deg, #0a0c11 0%, #1a1d26 50%, #0a0c11 100%);
  border-top: 3px solid #e50914;  /* 与footer红边颜色一致 */
}

.poster-slide-background {
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0.4;
}

.poster-columns-container {
  display: flex;
  height: 100%;
  width: 100%;
  transform: rotate(-14deg) skewY(2deg);
  transform-origin: center;
}

.poster-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 300%; /* 增加高度以容纳更多照片 */
  position: relative;
  gap: 8px; /* 添加照片间距 */
  padding: 0 4px; /* 列之间的间距 */
}

.poster-column.is-animation {
  animation: slideUp 20s linear infinite;
}

/* 第1、3排同步，第2、4排同步 - 放慢速度以显示更多照片 */
.poster-column.column-1 {
  animation: slideUp 40s linear infinite;
  animation-delay: 0s;
}

.poster-column.column-2 {
  animation: slideDown 40s linear infinite;
  animation-delay: 0s;
}

.poster-column.column-3 {
  animation: slideUp 40s linear infinite;
  animation-delay: 0s;
}

.poster-column.column-4 {
  animation: slideDown 40s linear infinite;
  animation-delay: 0s;
}

.poster-image {
  flex: none;
  aspect-ratio: 3/4; /* 设置3/4比例 */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.poster-image:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(229, 9, 20, 0.4);
}

.poster-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 8px;
}

/* 滚动动画关键帧 - 扩大滚动范围以显示更多照片 */
@keyframes slideUp {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-70%);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes slideDown {
  0% {
    transform: translateY(-70%);
  }
  50% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-70%);
  }
}

/* 前景内容覆盖层 */
.poster-content-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: radial-gradient(ellipse at center, rgba(10, 12, 17, 0.2) 0%, rgba(10, 12, 17, 0.45) 100%);  /* 进一步调亮蒙版，从0.3和0.6调到0.2和0.45 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-content-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 60px;
  text-align: center;
}

.poster-content-inner {
  position: relative;
}

.poster-title {
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 15px;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
}

.poster-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 25px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
  line-height: 1.4;
}

.poster-btn-wrapper {
  margin-top: 15px;
}

.poster-request-btn {
  background: linear-gradient(45deg, #e50914, #ff1a25);
  color: #ffffff;
  border: none;
  padding: 14px 30px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  box-shadow: 0 6px 20px rgba(229, 9, 20, 0.3);
}

.poster-request-btn:hover {
  background: linear-gradient(45deg, #ff1a25, #e50914);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(229, 9, 20, 0.5);
}

.poster-request-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(229, 9, 20, 0.4);
}

/* 淡入动画 */
.fadeInUpShortly {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUpShortly 0.8s ease-out forwards;
}

.fadeInUpShortly:nth-child(2) {
  animation-delay: 0.2s;
}

.fadeInUpShortly:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes fadeInUpShortly {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .poster-animation-section {
    height: 40vh;  /* 从27vh增加到40vh */
    min-height: 240px;  /* 从160px增加到240px */
  }

  .poster-content-container {
    padding: 0 40px;
  }

  .poster-title {
    font-size: 28px;
    margin-bottom: 12px;
  }

  .poster-subtitle {
    font-size: 14px;
    margin-bottom: 18px;
  }

  .poster-request-btn {
    padding: 12px 25px;
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .poster-animation-section {
    height: 25vh;  /* 缩小手机版高度 */
    min-height: 160px;  /* 减少最小高度 */
  }

  .poster-content-overlay {
    padding: 8px 0;  /* 减少上下padding */
  }

  .poster-content-container {
    padding: 0 30px;
  }

  .poster-title {
    font-size: 22px;
    margin-bottom: 6px;  /* 进一步减少底部margin */
  }

  .poster-subtitle {
    font-size: 12px;
    margin-bottom: 10px;  /* 减少底部margin */
  }

  .poster-btn-wrapper {
    margin-top: 8px;  /* 减少按钮上方间距 */
  }

  .poster-request-btn {
    padding: 10px 20px;
    font-size: 11px;
  }
}

@media (max-width: 640px) {
  .poster-title {
    font-size: 18px;
  }

  .poster-subtitle {
    font-size: 10px;
  }

  .poster-request-btn {
    padding: 8px 16px;
    font-size: 10px;
  }
}

/* 超小屏幕进一步缩小高度 */
@media (max-width: 480px) {
  .poster-animation-section {
    height: 20vh;
    min-height: 120px;
  }

  .poster-content-overlay {
    padding: 5px 0;  /* 超小屏幕更紧凑的上下padding */
  }

  .poster-content-container {
    padding: 0 20px;
  }

  .poster-title {
    font-size: 16px;
    margin-bottom: 4px;  /* 进一步减少底部margin */
  }

  .poster-subtitle {
    font-size: 11px;
    margin-bottom: 8px;  /* 减少底部margin */
  }

  .poster-btn-wrapper {
    margin-top: 6px;  /* 减少按钮上方间距 */
  }

  .poster-request-btn {
    padding: 6px 14px;
    font-size: 9px;
  }
}

/* ===== FOOTER STYLES ===== */
        .site-footer {
          background: #23232f;
          padding: 60px 0 30px;
          margin-top: 0;
          border-top: 3px solid #e50914;
        }

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Top Section - Logo and Sponsors */
.footer-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60px;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

.footer-brand {
  text-align: center;
}

.footer-logo {
  height: 48px;
  width: auto;
}

.footer-sponsors {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.sponsor-logo {
  height: 36px;
  width: auto;
  opacity: 0.8;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.sponsor-logo:hover {
  opacity: 1;
  transform: translateY(-2px);
}

/* Navigation Links */
.footer-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 16px;
  margin-bottom: 40px;
  padding: 0 20px;
}

.footer-nav-link {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  padding: 8px 16px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.footer-nav-link:hover {
  background: rgba(229, 9, 20, 0.2);
  color: #ffffff;
  border-color: rgba(229, 9, 20, 0.3);
  transform: translateY(-1px);
}

/* Bottom Section */
.footer-bottom {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.footer-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #e50914;
}

.divider {
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
}

.footer-copyright {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  line-height: 1.5;
}

/* Responsive Design for Footer */
@media (max-width: 768px) {
  .site-footer {
    padding: 40px 0 20px;
    margin-top: 0;
  }

  .footer-top {
    flex-direction: column;
    gap: 30px;
    margin-bottom: 35px;
  }

  .footer-sponsors {
    justify-content: center;
    gap: 15px;
  }

  .sponsor-logo {
    height: 32px;
  }

  .footer-nav {
    gap: 6px 12px;
    padding: 0 10px;
  }

  .footer-nav-link {
    padding: 6px 12px;
    font-size: 13px;
  }

  .footer-links {
    flex-direction: column;
    gap: 10px;
  }

  .divider {
    display: none;
  }

  .footer-copyright {
    font-size: 12px;
    padding: 0 10px;
  }
}
@media (max-width: 480px) {
  .footer-top {
    gap: 20px;
  }

  .footer-logo {
    height: 40px;
  }

  .sponsor-logo {
    height: 28px;
  }

  .footer-nav {
    gap: 5px 8px;
  }

  .footer-nav-link {
    padding: 5px 10px;
    font-size: 12px;
  }
}
/* --------------------  MOBILE ONLY (≤768px)  -------------------- */
/* 标题贴最左，间距更紧 */
@media (max-width: 768px) {
  .ezm-sectionTitle,
  h2.-title{
    font-size: 18px;
    margin: 0;
    padding-left: 0; /* 由container统一控制padding */
    text-align: left;
  }

  /* 将容器左右内边距设为0，由标题与内容自己添加相同的左内边距，确保对齐 */
  .ezm-sliderContainer{ padding: 20px 0 0 !important; }
  /* 标题与内容统一左内边距，确保与主卡片完全贴齐 */
  .ezm-sectionTitle{ padding-left: 0 !important; margin-left: 0 !important; } /* 由container统一控制 */
  .ezm-sliderWrapper{ padding-left: 12px !important; }

  /* 整体排成两列：左 68vw 放主卡，右侧放小卡片轮播 */
  .ezm-sliderWrapper{
    display: grid !important;
    grid-template-columns: 80vw 110px; /* 右侧列宽=一张卡片宽度，完美显示一张 */
    align-items: end;           /* 两列整体底对齐 */
    gap: 8px;                   /* 间距再收紧，靠近大卡片 */
    margin: 0;           /* 清掉外边距，避免被挤 */
  }

  /* 左侧主卡：占 80% 屏宽，去掉圆角 */
  .ezm-fixedMainCard{
    width: 80vw !important;
    height: 240px !important;     /* 调小高度 */
    margin: 0 0 -4px 0 !important; /* 轻微压住下缘，避免像素缝 */
    border-radius: 0 !important;
    z-index: 10 !important;
    position: relative !important;
  }

  /* 右侧区域：小卡片垂直轮播 */
  .ezm-rightScrollArea{
    width: 110px !important;    /* 只显示一张完整卡片宽度，不含gap */
    height: 240px !important;      /* 与大卡片高度同步 */
    overflow: hidden !important;   /* 裁剪超出部分 */
    z-index: 5 !important;
    position: relative !important;
    margin: 0 !important;
    padding: 0 !important; /* 去掉内边距，避免与步长不一致 */
    align-self: end !important;    /* 底对齐到大卡片的底部 */
    transform: none !important;    /* 使用网格固定列放置，无需位移 */
  }

  /* —— 主卡内部：左图右文，图为 3:4 —— */
  /* 两列：左(海报) : 右(标题+按钮) */
  .x-card-movie .-row-wrapper{
    display: grid !important;
    grid-template-columns: 140px 1fr;  /* 左格固定为与右侧小卡片相同的宽度 */
    gap: 8px;                      /* 增加内部间距 */
    padding: 12px;                 /* 增加内边距，整体更宽松 */
    height: 100%;
  }

  /* 右侧内容区：让按钮固定在底部，与右侧小卡片底部对齐 */
  .x-card-movie .-block-content{
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    height: 100% !important;
    padding: 6px 8px 0 12px !important;  /* 左侧比右侧多一点，顶部也增加 */
  }

  /* 左侧海报 3:4，铺满容器高度 */
  .x-card-movie .-block-image{
    width: 140px !important;               /* 与当前左格宽度一致 */
    max-width: 140px !important;
    height: 100% !important;
    overflow: hidden;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;    /* 图片居中 */
  }
  .x-card-movie img.img-fluid.-image{
    width: 100% !important;          /* 填满左列宽度 */
    height: 100% !important;         /* 与左列高度保持一致 */
    object-fit: contain !important;  /* 完整显示，不裁切、不放大 */
    object-position: center center !important;
    box-shadow: 0 8px 20px rgba(0,0,0,.35);
    border-radius: 0 !important;
    transform: none !important;
    margin: 0 !important;
  }

  /* 右侧只保留标题+红色按钮，其它信息在手机端隐藏 */
  .x-card-movie .-info,
  .x-card-movie .-description,
  .x-card-movie .-category{
    display: none !important;
  }

  .x-card-movie .-title{
    font-size: 13px;
    line-height: 1.3;
    margin: 4px 0 6px 0;        /* 稍微下移一点，底部也多留一点 */
    padding: 0 !important;      /* 标题左右 padding 设为最小 */
  }

  .x-card-movie .-play-favorite{
    justify-content: flex-start;
    gap: 6px;
    margin-top: auto;               /* 推到底部，与右侧小卡片底部对齐 */
    align-self: flex-start;         /* 按钮靠左 */
    padding-bottom: 6px;            /* 再往下靠一点，与小卡片底对齐 */
  }

  .x-card-movie .btn.-btn-play{ margin-left: 0 !important; align-self: flex-start !important; }
  .x-card-movie .btn.-btn-play{
    height: 36px;                  /* 高一点点 */
    padding: 0 14px;               /* 左右 padding 微增 */
    font-size: 12.5px;
    border-radius: 9px;
  }

  /* 主卡自身的内容区间距更紧凑（不影响桌面） */
  .ezm-mainCardContent{ padding: 14px !important; gap: 10px !important; }
  .ezm-mainCardPoster { flex: 0 0 140px !important; }
  .ezm-mainCardDetails h2{ font-size: 12px !important; margin: 0 0 6px !important; }
  .ezm-mainCardDetails p{  font-size: 10px !important; margin: 0 0 8px !important; }

  /* 让整段区块更贴上一个版块 */
  .ezm-movieSliderSection{ padding: 16px 0 32px !important; }

  /* 小卡片轮播样式调整 - 垂直滚动 */
  .ezm-rightScrollArea .ezm-sliderTrack{
    display: flex !important;
    flex-direction: row !important; /* 移动端保持横向轨道，避免被 translateX 推出视口 */
    gap: 10px !important; /* 与 step 一致，避免 80% 滑动残留 */
    padding: 0 !important;
    /* 保持轮播动画，与桌面版一致 */
    animation: inherit !important; /* 继承父级动画 */
    margin-top: 0 !important;      /* 修正被全局 120px 顶下去的问题 */
    align-items: flex-end !important; /* 小卡片与大卡片底部对齐 */
  }

  .ezm-rightScrollArea .ezm-smallMovieCard{
    width: 110px !important;        /* 小卡片固定宽度 */
    height: auto !important;        /* 由纵横比控制高度 */
    aspect-ratio: 3 / 4 !important; /* 采用3:4比例 */
    flex-shrink: 0 !important;
    z-index: 1 !important;
    position: relative !important;
    border-radius: 0 !important;    /* 移动端去圆角 */
    overflow: hidden !important;
    background: rgba(255,255,255,0.08) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255,255,255,0.12) !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
    /* Hover dark overlay */
  }

  .ezm-rightScrollArea .ezm-smallMovieCard::after{
    content: "" !important;
    position: absolute !important;
    inset: 0 !important;
    background: rgba(0,0,0,0) !important;
    transition: background .2s ease !important;
    pointer-events: none !important;
  }

  .ezm-rightScrollArea .ezm-smallMovieCard:hover::after{
    background: rgba(0,0,0,0.28) !important; /* slight dark overlay */
  }

  /* 移动端：删除大卡片所有圆角，并缩小内部主海报（不改比例） */
  .x-card-movie,
  .x-card-movie .-item-inner-wrapper,
  .x-card-movie img.img-fluid.-image { border-radius: 0 !important; }

  .x-card-movie .-block-image img.img-fluid.-image{
    transform: none !important;            /* 取消任何缩放，避免zoom错觉 */
    transform-origin: center center;
  }

  /* 小卡片内部布局 */
  .ezm-rightScrollArea .ezm-smallMovieCard img{
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;      /* 填满容器 */
    object-position: center center !important;
    background: transparent !important;
    display: block !important;         /* 清除行内空隙 */
    aspect-ratio: 3 / 4 !important;    /* 保障图片也遵循3:4，防止内部拉伸 */
  }

  .ezm-rightScrollArea .ezm-smallMovieCard .movie-title{
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    padding: 4px 6px !important;
    background: linear-gradient(transparent, rgba(0,0,0,0.9)) !important;
    color: #fff !important;
    font-size: 9px !important;
    line-height: 1.2 !important;
    text-overflow: ellipsis !important;
    overflow: hidden !important;
    white-space: nowrap !important;
    font-weight: 500 !important;
    opacity: 0 !important;
    transition: opacity .2s ease !important;
  }

  .ezm-rightScrollArea .ezm-smallMovieCard:hover .movie-title{
    opacity: 1 !important;
  }
  /* 移动端去除滚动区域两侧的渐隐遮罩，避免遮挡造成"未贴边"的错觉 */
  .ezm-rightScrollArea::before,
  .ezm-rightScrollArea::after{
    display: none !important;
  }
}

`;

// Icons
const IconPlay = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

// 稳定渲染的小卡组件（防抖渲染）
const SmallCard = React.memo(({ movie }: { movie: Movie }) => (
  <article className="ezm-smallMovieCard">
    <img
      src={movie.posterUrl}
      alt={movie.title}
      loading="lazy" /* 视口外延迟解码 */
      decoding="async"
    />
    <div className="movie-title">{movie.title}</div>
  </article>
));

const IconPlus = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const IconSearch = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5 1.5-1.5-5-5zM4 9.5C4 6.46 6.46 4 9.5 4S15 6.46 15 9.5 12.54 15 9.5 15 4 12.54 4 9.5z" />
  </svg>
);
// Main Component
const EZMovieHome: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<{
    title: string;
    poster: string;
    backdrop?: string;
    trailerUrl?: string;
    year?: string | number;
    runtime?: string;
    imdb?: string | number;
    ageRating?: string;
    language?: string;
    actors?: string[];
    categories?: Array<{ label: string; href?: string }>;
    tags?: string[];
    description?: string;
    descriptionHtml?: string;
  } | null>(null);

  const openMovieModal = (movie: {
    title: string;
    poster: string;
    backdrop?: string;
    trailerUrl?: string;
    year?: string | number;
    runtime?: string;
    imdb?: string | number;
    ageRating?: string;
    language?: string;
    actors?: string[];
    categories?: Array<{ label: string; href?: string }>;
    tags?: string[];
    description?: string;
    descriptionHtml?: string;
  }) => {
    setSelectedMovie({
      title: movie.title,
      poster: movie.poster,
      backdrop: movie.backdrop || movie.poster,
      trailerUrl: movie.trailerUrl,
      year: movie.year,
      runtime: movie.runtime,
      imdb: movie.imdb,
      ageRating: movie.ageRating,
      language: movie.language,
      actors: movie.actors,
      categories: movie.categories,
      tags: movie.tags,
      description: movie.description,
      descriptionHtml:
        movie.descriptionHtml ||
        (movie.description ? `<p>${movie.description}</p>` : undefined),
    });
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeMovieModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
    document.body.style.overflow = "";
  };

  // 允许外部页面通过事件触发首页模态，保持"完全一致"的弹窗体验
  useEffect(() => {
    const handler = (e: any) => {
      const d = e?.detail;
      if (!d) return;
      setSelectedMovie({
        title: d.title,
        poster: d.poster,
        backdrop: d.backdrop,
        trailerUrl: d.trailerUrl,
        descriptionHtml: d.descriptionHtml || "<p></p>",
        year: d.year,
        runtime: d.runtime,
        imdb: d.imdb,
        ageRating: d.ageRating,
        language: d.language,
        actors: d.actors,
        categories: d.categories,
        tags: d.tags,
      });
      setIsModalOpen(true);
      document.body.style.overflow = "hidden";
    };
    window.addEventListener("ezm-open-modal", handler as any);
    return () => window.removeEventListener("ezm-open-modal", handler as any);
  }, []);

  // Dynamic hero slides
  const API_BASE = `${
    (import.meta as any).env?.VITE_API_BASE || "http://localhost:4000"
  }/v1`;
  const mapBannerItemToMovie = (item: any): Movie => ({
    id: item.id,
    title: item.title,
    posterUrl: item.poster || "",
    backdropUrl: item.backdrop || item.poster || "",
    logoUrl: item.logo || undefined,
    description: item.synopsis || "",
    year: item.year,
    ageRating: item.ageRating,
  });

  // Hero slides (fetch BANNER)
  const [heroSlides, setHeroSlides] = useState<Movie[]>([]);
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const resp = await fetch(
          `${API_BASE}/movies?page=1&limit=24&tagName=BANNER`
        );
        if (!resp.ok) return;
        const data = await resp.json();
        const slides = Array.isArray(data.items)
          ? data.items.map(mapBannerItemToMovie)
          : [];
        setHeroSlides(slides);
      } catch (_) {}
    };
    fetchBanner();
  }, []);

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        heroSlides.length > 0 ? (prev + 1) % heroSlides.length : 0
      );
    }, 5000); // 5秒切换

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  return (
    <div className={styles.pageRoot}>
      <style>{css}</style>
      <SiteHeader onMenuClick={() => setIsMenuOpen(true)} />
      <SponsorMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <>
        <section>
          <HeroSection currentSlide={currentSlide} slides={heroSlides} />
        </section>
        <section>
          <SloganSection />
        </section>
        <section>
          <MovieSliderSection onOpenMovie={openMovieModal} />
        </section>
        <section>
          <Top10WeeklyCarousel onOpenMovie={openMovieModal} />
        </section>
        <section>
          <Catalog20Section onOpenMovie={openMovieModal} />
        </section>
        <section>
          <CatalogAnimeSection onOpenMovie={openMovieModal} />
        </section>
        <section>
          <CatalogSeriesSection onOpenMovie={openMovieModal} />
        </section>
        <section>
          <CatalogThaiSection onOpenMovie={openMovieModal} />
        </section>
      </>
      {/* Promo 1 */}
      <section className="promo-section">
        <div
          className="promo-bg"
          style={{
            backgroundImage:
              "url(https://ezmovie.me/media/cache/strip/202412/block/de111bfd75e5018e5b7000115ef5b4a6.jpg)",
          }}
        >
          <div className="promo-inner is-left">
            <div className="promo-text">
              <h3>Update everyday.</h3>
              <p>
                เราอัปเดตหนังใหม่ทุกวัน ทั้งหนังไทย หนังฝรั่ง ซีรีย์ดัง
                <br className="mobile-break" />
                การ์ตูนสำหรับเด็ก หรือไปจนถึงหนังผู้ใหญ่
                <br className="mobile-break" />
                เพื่อความเพลิดเพลินอย่างไร้ขีดจำกัด 24 ชม.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Promo 2 */}
      <section className="promo-section">
        <div
          className="promo-bg"
          style={{
            backgroundImage:
              "url(https://ezmovie.me/media/cache/strip/202411/block/4f1d67478f635563df1e0b192faed9db.png)",
          }}
        >
          <div className="promo-inner is-right">
            <div className="promo-text is-right">
              <h3>Watch everywhere.</h3>
              <p>
                สะดวกสบาย ไม่ว่าจะที่ไหนก็รับชมได้
                <br className="mobile-break" />
                ทั้ง Smart Phone, Tablet, Laptop และอีกมาก
                <br className="mobile-break" />
                ภาพชัดทั้งเรื่อง เสียงใสเต็มระบบ Full HD
              </p>
            </div>
          </div>
        </div>
      </section>
      <FeaturesSection />
      <NewContentSection />
      <PosterAnimationSection />
      <MovieModal
        open={isModalOpen}
        movie={selectedMovie}
        onClose={closeMovieModal}
      />
      <SiteFooter />
    </div>
  );
};

const SiteHeader = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const navItems = [
    "หน้าหลัก",
    "หนังใหม่",
    "ซีรีส์",
    "อนิเมะ",
    "ประเภทหนัง",
    "คลิปวิดีโอ",
    "นักแสดง",
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerInner}>
          {/* 左侧：汉堡 + LOGO（图片） */}
          <div className={styles.brandGroup}>
            <button
              className={styles.hamburger}
              onClick={onMenuClick}
              aria-label="打开菜单"
            >
              <svg viewBox="0 0 32 32">
                <path
                  d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
                  className={`${styles.line} ${styles.lineTopBottom}`}
                ></path>
                <path d="M7 16 27 16" className={styles.line}></path>
              </svg>
            </button>
            <a href="/" className="ezm-navbar-brand" aria-label="EZ Movie">
              <img
                className="ezm-logoImg"
                src="/images/logos/ez-movie-logo-clean.svg"
                alt="EZ Movie"
              />
            </a>
          </div>

          {/* 中间：主导航 */}
          <nav className={styles.nav}>
            {navItems.map((item, i) => (
              <a
                key={item}
                className={`${styles.navItem} ${i === 0 ? "is-active" : ""}`}
                href="#"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* 右侧：LINE + 赞助 LOGO + 搜索 */}
          <div className={styles.headerActions}>
            {/* LINE（移动端替换为站点图片地址） */}
            <a
              href="#"
              className={`${styles.lineIcon} ${styles.animatedBtn}`}
              title="LINE"
            >
              <img
                src="https://ezmovie.me/media/cache/strip/202310/block/88b1c84ceef85a444e84dc0af24b0e82.png"
                alt="LINE"
                className={styles.lineImg}
              />
            </a>

            {/* 分隔线 */}
            <div className={styles.separator}></div>

            {/* 赞助 LOGO（桌面显示） */}
            <div className="ezm-sponsorBar ezm-show-lg">
              <a className={`ezm-sponsorLogo ${styles.animatedBtn}`} href="#">
                <img
                  src="https://ezmovie.me/build/web/ez-movie/img/sponsor-logo-casino.png?v=2?v=1"
                  alt="Casino"
                />
              </a>
              <a className={`ezm-sponsorLogo ${styles.animatedBtn}`} href="#">
                <img
                  src="https://ezmovie.me/build/web/ez-movie/img/sponsor-logo-slot.png?v=1"
                  alt="Slot"
                />
              </a>
              <a className={`ezm-sponsorLogo ${styles.animatedBtn}`} href="#">
                <img
                  src="https://ezmovie.me/build/web/ez-movie/img/sponsor-logo-lotto.png?v=1"
                  alt="Lotto"
                />
              </a>
            </div>

            {/* 搜索按钮 */}
            <button
              className={`${styles.searchBtn} ${styles.animatedBtn}`}
              aria-label="search"
            >
              <IconSearch className={styles.btnIcon} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const HeroSection = ({
  currentSlide,
  slides,
}: {
  currentSlide: number;
  slides: Movie[];
}) => {
  return (
    <section className={styles.hero}>
      {(slides || []).map((slide, index) => (
        <div
          key={slide.id}
          className={`${styles.heroSlide} ${
            index === currentSlide ? "active" : ""
          }`}
        >
          <div
            className={styles.heroBackdrop}
            style={{
              backgroundImage: `url(${slide.backdropUrl || slide.posterUrl})`,
            }}
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroInner}>
            <div
              className={styles.heroContent}
              style={{ overflow: "visible", paddingBottom: 24 }}
            >
              <div
                className={styles.heroTitleLogo}
                aria-label={slide.title}
                role="img"
                style={{
                  backgroundImage: `url(${
                    slide.logoUrl ||
                    "https://ezmovie.me/media/cache/strip/202304/block/dc02782fcfc5ee44bc9682d82e489b0f.png"
                  })`,
                }}
              />
              <p
                className={styles.heroDescription}
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical" as any,
                  overflow: "hidden",
                }}
              >
                {slide.description}
              </p>
              <div className={styles.heroActions}>
                <button className={`${styles.ctaButton} ${styles.ctaPrimary}`}>
                  <IconPlay className={styles.btnIcon} /> Watch Now
                </button>
                {/* <button className={`${styles.ctaButton} ${styles.ctaGhost}`}>
                  <IconPlus className={styles.btnIcon} /> รายการของฉัน
                </button> */}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

const SloganSection = () => {
  return (
    <section className={styles.sloganSection}>
      <div className={styles.sloganInner}>
        <h2 className={styles.sloganText}>
          EZ Movie ดูหนังออนไลน์ฟรี หนังใหม่ 2025 ไม่มีโฆษณา ชัดที่สุด ไวที่สุด
        </h2>
      </div>
    </section>
  );
};
// Professional Movie Slider Section - 固定左侧大卡片 + 右侧循环小卡片
const MovieSliderSection = ({
  onOpenMovie,
}: {
  onOpenMovie?: (movie: {
    title: string;
    poster: string;
    backdrop?: string;
    trailerUrl?: string;
    year?: string | number;
    runtime?: string;
    imdb?: string | number;
    ageRating?: string;
    language?: string;
    actors?: string[];
    categories?: Array<{ label: string; href?: string }>;
    tags?: string[];
    description?: string;
    descriptionHtml?: string;
  }) => void;
}) => {
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const [currentMainMovie, setCurrentMainMovie] = useState(0);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load movies from API and map to local Movie type
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          "http://localhost:4000/v1/movies?page=1&limit=24&sort=popular"
        );
        const json = await res.json();
        const items = Array.isArray(json?.items) ? json.items : [];
        const mapped: Movie[] = items.map((m: any) => ({
          id: m.id,
          title: m.title,
          posterUrl: m.poster,
          backdropUrl: m.backdrop ?? undefined,
          trailerUrl: m.trailerUrl ?? undefined,
          year: m.year,
          duration: formatRuntime(m.runtime),
          quality: undefined,
          badgeText: undefined,
          tags: m.tags ?? m.genres ?? [],
          description: m.synopsis,
          ageRating: m.ageRating,
        }));
        if (isMounted) {
          setMovies(mapped);
          setCurrentMainMovie(0);
        }
      } catch (e) {
        // noop
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // GPU优化无缝循环 - 关键参数
  const CLONES = 10; // 克隆数量略增，防止在第3-4张时出现回跳变形
  const indexRef = React.useRef(0); // 当前步进索引（包含克隆区）
  const stepRef = React.useRef(0); // 每步位移像素 = 卡宽 + gap
  const timerRef = React.useRef<number | null>(null);
  const isPausedRef = React.useRef(false);

  // 右侧小卡数组：原始 + 克隆前 N 张（来自 API）
  const smallCards = React.useMemo(() => {
    if (!movies.length) return [] as Movie[];
    return movies.concat(movies.slice(0, CLONES));
  }, [movies]);

  // 预加载下一张图片，避免切换时白一下
  useEffect(() => {
    if (!movies.length) return;
    const next = movies[(currentMainMovie + 1) % movies.length];
    if (next?.posterUrl) {
      const img = new Image();
      img.src = next.posterUrl;
    }
    if (next?.backdropUrl) {
      const img = new Image();
      img.src = next.backdropUrl;
    }
  }, [currentMainMovie, movies]);

  // 步长计算更稳 + 监听尺寸变化
  useEffect(() => {
    const track = sliderRef.current;
    if (!track) return;
    if (!movies.length) return;

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
      indexRef.current = indexRef.current % movies.length;
      track.style.transform = `translate3d(-${
        indexRef.current * stepRef.current
      }px,0,0)`;
      track.getBoundingClientRect();
      track.classList.remove("ezm-noTransition");
    };

    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== track || e.propertyName !== "transform") return;
      if (indexRef.current >= movies.length) snapBack();
    };
    track.addEventListener("transitionend", onTransitionEnd);

    const tick = () => {
      if (isPausedRef.current) {
        timerRef.current = window.setTimeout(tick, 400);
        return;
      }

      // 下一张的图先解码，切换时不"白一下"
      const nextIdx = (indexRef.current + 1) % movies.length;
      const preload = movies[nextIdx];
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
        const newMainIndex = indexRef.current % movies.length;
        setCurrentMainMovie(newMainIndex);
      }, 120);

      // 兜底回跳（有些环境不触发 transitionend）
      if (indexRef.current === movies.length) {
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
  }, [movies]);

  // 悬停暂停不触发 React 重渲染
  const handleMouseEnter = () => {
    isPausedRef.current = true;
  };
  const handleMouseLeave = () => {
    isPausedRef.current = false;
  };

  return (
    <section className={styles.movieSliderSection}>
      <div className={styles.sliderContainer}>
        <h3 className={styles.sectionTitle}>Trending New Movies 2025</h3>
        <div className={styles.sliderWrapper}>
          {/* 固定的左侧大卡片 */}
          <div className={styles.fixedMainCard}>
            <MainMovieCard
              movie={
                movies[currentMainMovie] ?? {
                  id: "placeholder",
                  title: "",
                  posterUrl: "",
                }
              }
              isTransitioning={false}
              onOpenMovie={onOpenMovie}
            />
          </div>

          {/* 右侧滚动的小卡片 - GPU加速无缝循环 */}
          <div
            className={`${styles.rightScrollArea} ezm-rightScrollArea`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="ezm-sliderTrack" ref={sliderRef}>
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

// 大卡片组件 - 带切换动画
const MainMovieCard = ({
  movie,
  isTransitioning,
  onOpenMovie,
}: {
  movie: Movie;
  isTransitioning: boolean;
  onOpenMovie?: (movie: {
    title: string;
    poster: string;
    backdrop?: string;
    trailerUrl?: string;
    year?: string | number;
    runtime?: string;
    imdb?: string | number;
    ageRating?: string;
    language?: string;
    actors?: string[];
    categories?: Array<{ label: string; href?: string }>;
    tags?: string[];
    description?: string;
    descriptionHtml?: string;
  }) => void;
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayMovie, setDisplayMovie] = useState<any>(movie);

  // 监听电影切换，添加动画效果
  useEffect(() => {
    if (movie.id !== displayMovie.id) {
      setIsAnimating(true);

      // 短暂延迟后切换内容
      setTimeout(() => {
        setDisplayMovie(movie);
        setTimeout(() => {
          setIsAnimating(false);
        }, 100);
      }, 150);
    }
  }, [movie, displayMovie]);

  return (
    <div
      className="x-card-movie x-card-movie--embed"
      onClick={() =>
        onOpenMovie?.({
          title: displayMovie.title,
          poster: displayMovie.posterUrl,
          backdrop: displayMovie.posterUrl,
          trailerUrl: displayMovie.trailerUrl,
          year: displayMovie.year,
          runtime: displayMovie.duration,
          ageRating: displayMovie.ageRating,
          tags: displayMovie.tags,
          description: displayMovie.description,
        })
      }
    >
      <div
        className="-item-inner-wrapper"
        style={{
          backgroundImage: `url(${displayMovie.posterUrl})`,
          height: "100%",
        }}
      >
        <div className="-row-wrapper">
          {/* 左侧海报 */}
          <div className="-block-image">
            {/* 左上角 ZOOM/HOT 角标：有 PNG 用图片；没有就用文字样式 */}
            {displayMovie.badgeText === "ZOOM" ? (
              <img
                className="-badge -zoom"
                src="/build/web/ez-movie/img/badge-zoom.png"
                alt="ZOOM"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : null}
            {displayMovie.badgeText === "HOT" ? (
              <div className="-badge -hot">HOT</div>
            ) : null}

            <img
              alt={displayMovie.title}
              className="img-fluid -image"
              width={298}
              height={441}
              src={displayMovie.posterUrl}
              decoding="async"
            />
          </div>

          {/* 右侧内容 */}
          <div className="-block-content">
            <h2 className="-title">{displayMovie.title}</h2>
            <div className="-info">
              {displayMovie.year && (
                <span className="-gap">{displayMovie.year}</span>
              )}

              {displayMovie.ageRating && (
                <img
                  alt={displayMovie.ageRating}
                  className="-gap -age-img"
                  width={23}
                  height={16}
                  src={
                    new URL(
                      `../../images/rate-${displayMovie.ageRating}.png`,
                      import.meta.url
                    ).href
                  }
                  decoding="async"
                />
              )}

              {displayMovie.duration && (
                <span
                  className="-gap"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {displayMovie.duration}
                  <img
                    src={hdIconUrl}
                    alt="HD"
                    width={22}
                    height={16}
                    style={{ display: "inline-block" }}
                  />
                </span>
              )}
            </div>

            {displayMovie.description && (
              <div className="-description">
                <p>{displayMovie.description}</p>
              </div>
            )}
            {displayMovie.tags && displayMovie.tags.length > 0 && (
              <div className="-category">
                {displayMovie.tags.slice(0, 10).map((t) => (
                  <a key={t} href="#" className="btn -btn-category">
                    {t}
                  </a>
                ))}
              </div>
            )}
            <div className="-play-favorite">
              <a href="#" className="btn -btn-play">
                <i className="-ic" aria-hidden="true" />
                <span className="-text">Watch</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const Top10WeeklyCarousel: React.FC<{
  onOpenMovie?: (m: {
    title: string;
    poster: string;
    backdrop?: string;
    trailerUrl?: string;
  }) => void;
}> = ({ onOpenMovie }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false, duration: 24 },
    [Autoplay({ delay: 3500, stopOnInteraction: false })]
  );

  const pages = React.useMemo(
    () => [top10Items.slice(0, 5), top10Items.slice(5, 10)],
    []
  );

  const scrollPrev = React.useCallback(() => {
    if (!emblaApi) return;
    // 每次滚动整页（5个）
    emblaApi.scrollTo(emblaApi.selectedScrollSnap() - 1);
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollTo(emblaApi.selectedScrollSnap() + 1);
  }, [emblaApi]);

  return (
    <section className="x-top5">
      <div className="container">
        <div className="x-category-movie-title">
          <div className="-category-inner-container">
            <h2 className="-title">Top 10 ประจำสัปดาห์</h2>
          </div>
        </div>
      </div>

      {/* Mobile: horizontal scroll with desktop-style number overlay */}
      <div className="x-top10-mobileScroll">
        <div className="x-top10-mobileTrack">
          {top10Items.map((m, idx) => (
            <div
              className="x-item-wrapper-movie x-top5-pair x-top10-m-pair"
              key={m.id}
            >
              {idx + 1 === 10 ? (
                <div className="-number is-10" aria-hidden="true">
                  <span className="-d0">0</span>
                  <span className="-d1">1</span>
                </div>
              ) : (
                <div className="-number" aria-hidden="true">
                  {idx + 1}
                </div>
              )}
              <div
                className="x-item-movie"
                onClick={() =>
                  onOpenMovie?.({ title: m.title, poster: m.poster })
                }
              >
                <img
                  className="img-fluid -cover-img"
                  src={m.poster}
                  alt={m.title}
                  loading="lazy"
                  decoding="async"
                />
                <div className="-overlay" aria-hidden="true">
                  <h2 className="-title">{m.title}</h2>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="embla x-top10-viewport" ref={emblaRef}>
        <div className="embla__container">
          {[...pages, pages[0]].map((page, pageIdx) => {
            const base = (pageIdx % pages.length) * 5;
            return (
              <div
                className="embla__slide x-top10-slide"
                key={`page-${pageIdx}`}
              >
                <div className="x-top5-grid">
                  {page.map((m, i) => {
                    const rank = base + i + 1;
                    return (
                      <div
                        className="x-item-wrapper-movie x-top5-pair"
                        key={m.id}
                      >
                        {rank === 10 ? (
                          <div className="-number is-10" aria-hidden="true">
                            <span className="-d0">0</span>
                            <span className="-d1">1</span>
                          </div>
                        ) : (
                          <div className="-number" aria-hidden="true">
                            {rank}
                          </div>
                        )}
                        <div
                          className="x-item-movie"
                          onClick={() =>
                            onOpenMovie?.({
                              title: m.title,
                              poster: m.poster,
                              trailerUrl:
                                "https://www.youtube.com/embed/oKiYuIsPxYk?autoplay=1",
                            })
                          }
                        >
                          <img
                            className="img-fluid -cover-img"
                            src={m.poster}
                            alt={m.title}
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="-overlay" aria-hidden="true">
                            <h2 className="-title">{m.title}</h2>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="x-top10-nav" aria-hidden="false">
          <button
            type="button"
            className="x-top10-btn -left"
            aria-label="Previous"
            onClick={scrollPrev}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.5 5L8.5 12L15.5 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="x-top10-btn -right"
            aria-label="Next"
            onClick={scrollNext}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.5 5L15.5 12L8.5 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

// Catalog carousel — 6 per view, 4 pages (24 items)
const Catalog20Section: React.FC<{
  onOpenMovie?: (m: {
    title: string;
    poster: string;
    backdrop?: string;
    trailerUrl?: string;
  }) => void;
}> = ({ onOpenMovie }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      dragFree: false,
      align: "start",
      slidesToScroll: 6,
      containScroll: "trimSnaps",
    },
    []
  );

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollTo(emblaApi.selectedScrollSnap() - 1);
    }
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollTo(emblaApi.selectedScrollSnap() + 1);
    }
  }, [emblaApi]);

  // Preload
  React.useEffect(() => {
    catalog24.forEach((m) => {
      const im = new Image();
      im.src = m.poster;
    });
  }, []);

  // Toggle left padding: at start use container padding; once scrolled, go full-width
  const [isScrolled, setIsScrolled] = React.useState(false);
  React.useEffect(() => {
    if (!emblaApi) return;
    const update = () => setIsScrolled(emblaApi.canScrollPrev());
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    update();
  }, [emblaApi]);

  return (
    <section className="x-catalog">
      <div className="container">
        <div className="x-category-movie-title">
          <div className="-category-inner-container">
            <div className="title-with-button">
              <h2 className="-title">หนังมาใหม่</h2>
              <div className="-see-all-wrapper">
                <a
                  href="/หนังฝรั่ง"
                  className="-see-all-link animated fadeInRightShortly"
                  data-animatable="fadeInRightShortly"
                  data-delay="300"
                >
                  ดูทั้งหมด
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: horizontal scroll with larger cards */}
      <div className="x-catalog-mobileScroll">
        <div className="x-catalog-mobileTrack">
          {catalog24.slice(0, 12).map((m) => (
            <div
              className="x-catalog-mobileCard"
              key={`mobile-${m.id}`}
              onClick={() =>
                onOpenMovie?.({
                  title: m.title,
                  poster: m.poster,
                  trailerUrl:
                    "https://www.youtube.com/embed/oKiYuIsPxYk?autoplay=1",
                })
              }
            >
              <img
                className="img-fluid -cover-img"
                src={m.poster}
                alt={m.title}
                loading="lazy"
                decoding="async"
              />
              <div className="-overlay" aria-hidden="true">
                <h2 className="-title">{m.title}</h2>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`embla-cat ${isScrolled ? "is-scrolled" : ""}`}
        ref={emblaRef}
      >
        <div className="embla-cat__container">
          {catalog24.map((m) => (
            <div className="embla-cat__slide" key={m.id}>
              <div
                className="x-catalog-card"
                onClick={() =>
                  onOpenMovie?.({
                    title: m.title,
                    poster: m.poster,
                    trailerUrl:
                      "https://www.youtube.com/embed/oKiYuIsPxYk?autoplay=1",
                  })
                }
              >
                <img
                  className="img-fluid -cover-img"
                  src={m.poster}
                  alt={m.title}
                  loading="lazy"
                  decoding="async"
                />
                <div className="-overlay" aria-hidden="true">
                  <h2 className="-title">{m.title}</h2>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="x-catalog-nav" aria-hidden="false">
          {isScrolled && (
            <button
              type="button"
              className="x-catalog-btn -left"
              aria-label="Previous"
              onClick={scrollPrev}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.5 5L8.5 12L15.5 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          <button
            type="button"
            className="x-catalog-btn -right"
            aria-label="Next"
            onClick={scrollNext}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.5 5L15.5 12L8.5 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

// Reuse catalog for Anime
const CatalogAnimeSection: React.FC<{
  onOpenMovie?: (m: {
    title: string;
    poster: string;
    backdrop?: string;
    trailerUrl?: string;
  }) => void;
}> = ({ onOpenMovie }) => (
  <section className="x-catalog">
    <div className="container">
      <div className="x-category-movie-title">
        <div className="-category-inner-container">
          <div className="title-with-button">
            <h2 className="-title">อนิเมะ (การ์ตูน) Anime</h2>
            <div className="-see-all-wrapper">
              <a
                href="/อนิเมะ"
                className="-see-all-link animated fadeInRightShortly"
                data-animatable="fadeInRightShortly"
                data-delay="300"
              >
                ดูทั้งหมด
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Mobile: horizontal scroll with larger cards */}
    <div className="x-catalog-mobileScroll">
      <div className="x-catalog-mobileTrack">
        {catalog24.slice(0, 12).map((m) => (
          <div
            className="x-catalog-mobileCard"
            key={`anime-mobile-${m.id}`}
            onClick={() =>
              onOpenMovie?.({
                title: m.title,
                poster: m.poster,
                trailerUrl:
                  "https://www.youtube.com/embed/oKiYuIsPxYk?autoplay=1",
              })
            }
          >
            <img
              className="img-fluid -cover-img"
              src={m.poster}
              alt={m.title}
              loading="lazy"
              decoding="async"
            />
            <div className="-overlay" aria-hidden="true">
              <h2 className="-title">{m.title}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Reuse same carousel */}
    {CatalogCarouselBody(onOpenMovie)}
  </section>
);

// Reuse catalog for Series
const CatalogSeriesSection: React.FC<{
  onOpenMovie?: (m: {
    title: string;
    poster: string;
    backdrop?: string;
    trailerUrl?: string;
  }) => void;
}> = ({ onOpenMovie }) => (
  <section className="x-catalog">
    <div className="container">
      <div className="x-category-movie-title">
        <div className="-category-inner-container">
          <div className="title-with-button">
            <h2 className="-title">ซีรี่ย์</h2>
            <div className="-see-all-wrapper">
              <a
                href="/ซีรี่ย์"
                className="-see-all-link animated fadeInRightShortly"
                data-animatable="fadeInRightShortly"
                data-delay="300"
              >
                ดูทั้งหมด
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Mobile: horizontal scroll with larger cards */}
    <div className="x-catalog-mobileScroll">
      <div className="x-catalog-mobileTrack">
        {catalog24.slice(0, 12).map((m) => (
          <div
            className="x-catalog-mobileCard"
            key={`series-mobile-${m.id}`}
            onClick={() =>
              onOpenMovie?.({
                title: m.title,
                poster: m.poster,
                trailerUrl:
                  "https://www.youtube.com/embed/oKiYuIsPxYk?autoplay=1",
              })
            }
          >
            <img
              className="img-fluid -cover-img"
              src={m.poster}
              alt={m.title}
              loading="lazy"
              decoding="async"
            />
            <div className="-overlay" aria-hidden="true">
              <h2 className="-title">{m.title}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>

    {CatalogCarouselBody(onOpenMovie)}
  </section>
);
// Reuse catalog for Thai Movies
const CatalogThaiSection: React.FC<{
  onOpenMovie?: (m: {
    title: string;
    poster: string;
    backdrop?: string;
    trailerUrl?: string;
  }) => void;
}> = ({ onOpenMovie }) => (
  <section className="x-catalog">
    <div className="container">
      <div className="x-category-movie-title">
        <div className="-category-inner-container">
          <div className="title-with-button">
            <h2 className="-title">หนังไทย</h2>
            <div className="-see-all-wrapper">
              <a
                href="/หนังไทย"
                className="-see-all-link animated fadeInRightShortly"
                data-animatable="fadeInRightShortly"
                data-delay="300"
              >
                ดูทั้งหมด
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Mobile: horizontal scroll with larger cards */}
    <div className="x-catalog-mobileScroll">
      <div className="x-catalog-mobileTrack">
        {catalog24.slice(0, 12).map((m) => (
          <div
            className="x-catalog-mobileCard"
            key={`thai-mobile-${m.id}`}
            onClick={() =>
              onOpenMovie?.({
                title: m.title,
                poster: m.poster,
                trailerUrl:
                  "https://www.youtube.com/embed/oKiYuIsPxYk?autoplay=1",
              })
            }
          >
            <img
              className="img-fluid -cover-img"
              src={m.poster}
              alt={m.title}
              loading="lazy"
              decoding="async"
            />
            <div className="-overlay" aria-hidden="true">
              <h2 className="-title">{m.title}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>

    {CatalogCarouselBody(onOpenMovie)}
  </section>
);

// Helper to render the carousel body with same logic/data
function CatalogCarouselBody(
  onOpenMovie?: (m: {
    title: string;
    poster: string;
    backdrop?: string;
    trailerUrl?: string;
  }) => void
) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      dragFree: false,
      align: "start",
      slidesToScroll: 6,
      containScroll: "trimSnaps",
    },
    []
  );
  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollTo(emblaApi.selectedScrollSnap() - 1);
  }, [emblaApi]);
  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollTo(emblaApi.selectedScrollSnap() + 1);
  }, [emblaApi]);
  const [isScrolled, setIsScrolled] = React.useState(false);
  React.useEffect(() => {
    catalog24.forEach((m) => {
      const im = new Image();
      im.src = m.poster;
    });
  }, []);
  React.useEffect(() => {
    if (!emblaApi) return;
    const update = () => setIsScrolled(emblaApi.canScrollPrev());
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    update();
  }, [emblaApi]);
  return (
    <div
      className={`embla-cat ${isScrolled ? "is-scrolled" : ""}`}
      ref={emblaRef}
    >
      <div className="embla-cat__container">
        {catalog24.map((m) => (
          <div className="embla-cat__slide" key={`dup-${m.id}`}>
            <div
              className="x-catalog-card"
              onClick={() =>
                onOpenMovie?.({
                  title: m.title,
                  poster: m.poster,
                  trailerUrl:
                    "https://www.youtube.com/embed/oKiYuIsPxYk?autoplay=1",
                })
              }
            >
              <img
                className="img-fluid -cover-img"
                src={m.poster}
                alt={m.title}
                loading="lazy"
                decoding="async"
              />
              <div className="-overlay" aria-hidden="true">
                <h2 className="-title">{m.title}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="x-catalog-nav" aria-hidden="false">
        {isScrolled && (
          <button
            type="button"
            className="x-catalog-btn -left"
            aria-label="Previous"
            onClick={scrollPrev}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.5 5L8.5 12L15.5 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <button
          type="button"
          className="x-catalog-btn -right"
          aria-label="Next"
          onClick={scrollNext}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.5 5L15.5 12L8.5 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Features Section Component
const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      title: "ดูฟรีไม่ต้องสมัครสมาชิก",
      description:
        "ดูได้ทั้งครอบครัว ทุกช่วงอายุ ทุกเพศ ทุกวัย ใช้ช่วงเวลาพักผ่อนของคุณให้คุ้มค่า ติดตามหนังใหม่กับเอิน ez-movie.com พร้อมให้รองรับความบันเทิงแบบไม่มีขีดจำกัด ไม่ว่าระบบ สมาร์ตโฟน PlayStation Apple Tv และอีกมากมายอุปกรณ์ให้คุณเข้าร่วมเราได้อย่างคุมความบันเทิงแบบคอนโซลที่ Ezmovie เก่าที่แบ่งพาราอีจันมาให้คุมไม่ว่าชมใหม่ หนังไฮ หนังมา หนังยุค 90's",
      image:
        "https://ezmovie.me/media/cache/strip/202411/block/4d2f12bfec3154739bf610ef10b77c7f.png",
    },
    {
      id: 2,
      title: "ครบทุกรส เดิมอารมณ์",
      description:
        "เราให้นั่งทุกประเภท กึ่งหนังใหม่ หนังเก่า หนังมา ซีรีอีซ่าฟรี ซอมบี้ยืวันครอบครัว วันใหม่เดียวด้วย ด้วยระบบดูแต่ชองเลือกไปเล่นได้ทุใครใส่ใจให้การาสา ท่านพร้อมระบบสตรีมรูปยังดีแรง คุณภาพระดับ 4K และระบบออนไลน์ให้ไปสดเจเพาะเฟย์ 5 วัน ให้ความบันเทิงของคุณไปไม่สุดมีลิ้อ ค่ารัด ใคดีท่าต้นหูดองรอดออกไปให้เสน",
      image:
        "https://ezmovie.me/media/cache/strip/202411/block/adec3f3a64f2e99d99224167246a96a2.png",
    },
    {
      id: 3,
      title: "หนังดีมีคุณภาพ",
      description:
        "หนังดีมีล้อง เดียวน ภาพชุดเสียงระดับ Full HD ถึงขนาดใหญ่ Soundtrack กระคิ่นเดียวน ครอบคุณเรื่มรา พร้อมรันเลียนหว์วีสมใส ชัดชาง ดีดามากสุนใจดุหาติดมเกม่างลุดีรา เรามีครับองเมื่มันพพันอันเอไอท์ระบบ 4K และไ้วหนีดพร์จ์นอูในรอแผ่น ความบรับในออ ม้าสนันในสำกรับที่วิจาร่วงหลอกระบบเสตรัม ถิ่มาคำหีจาก Ezmovie",
      image:
        "https://ezmovie.me/media/cache/strip/202411/block/50545bea1c5c7a2f7ad852552a72b433.png",
    },
    {
      id: 4,
      title: "พร้อมดูแลคุณ 24 ชม.",
      description:
        "ดูหนังออนไลน์ฟรี 24 ชม. พร้อมระบบแจ้งปัญหาการใช้งาน และสานตอบโต้งใหม่หาง ได้ พร้อมแล้วที่ เพื่อให้คุณไปพอดีอกการดูมีดองสลำไปประญิบรังมลูงศดันใน MDB หรือ Rotten tomatoes เป็นไอบัณดูตอุพชันภาพราระบบนำเข้าบมไอเอโฮ์แล้ม ใหอื่นมิอัน46 และลีจำเหปพ์ายจังหรัดาิดิมารี วัดตกหนังรอศดำจัดเคร่ราที่ คยยีนันระวอผู้ที Ezmovie ทีได้ว",
      image:
        "https://ezmovie.me/media/cache/strip/202411/block/a05a2d59f8d22714debac4753c632ced.png",
    },
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card">
              <div className="feature-content">
                <div className="feature-icon">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="feature-text">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// New Content Section Component
const NewContentSection = () => {
  return (
    <section className="new-content-section">
      <div className="new-content-container">
        <div className="new-content-inner">
          <h2 className="new-content-title">
            รับชมความสนุก อันไร้ขีดแดนได้แล้ว ที่นี่
          </h2>
          <div className="content-list">
            <div className="content-item">
              <h3>คำถามที่พบบ่อย</h3>
              <ul>
                <li>
                  <strong>Ezmovie คืออะไร</strong>
                  <p>
                    Ezmovie
                    คือเว็บไซต์ดูหนังออนไลน์ฟรีที่ให้สาความบันเทิงแก่ในสายแหลายรูปแบบไม่ว่าจะเป็นหนังหนังใหม่
                    หนังก่า หนังออนไลน์ 4K ภาพชัด ไม่มีกระตุก
                    อีกทั้งยังผลิตแขกพอร์ม
                    อีกทั้งเว็บไซต์ของเราได้ปรับปรุงเสาใหม่เราได้ใส่ของตำแหน่งของพาราอีจันมาให้วิตำการจันเดือคหนังใหม่
                    และการมอยตั้งแล้วเรื่องตามใคร
                    คุมการจันเดือคชี่งใชม้น์และอารมม่าคคยอกทุกวุน
                    อีกทั้งเราอุตราพร้อมกับพิเศษเดียวีกมาศนางม่า
                    ด้วยการจันเดื่อชใหม่ ทุกสมัดวตาที และการมอยตัดวะจเรฅากตัน 3
                    วันได้รียมแน่นอน
                  </p>
                </li>
                <li>
                  <strong>Ezmovie เหมาะกับใครบ้าง</strong>
                  <p>
                    ต้องมการสยาใจิเดชดูหนังที่ดีเลิบบหมดสวย 24
                    ชั่วโมงนั้นแหมะสมส่าหรืบทุกวุน
                    ที่พร้อมรับความบันเทิงทั้งสุดวงการา
                  </p>
                </li>
                <li>
                  <strong>Ezmovie สามารถรับชมอย่างไรได้บ้าง</strong>
                  <p>
                    เว็บไซต์ Ezmovie สามารถรับชมได้ฟรี 24 ชั่วโมงผ่านแขคพอร์ม
                    ไม่ว่าจะบน iOS, Android Windows Mac Os
                    และระบบปฏิบัติการอื่นๆ ที่รองรับการใช้งาน Browser แน่ะกๆทำ
                    TV ของคุณก็สามารถรับชมรีดาที่ดีดีเดียอู่สงนับคุมราคิดจายง่าย
                  </p>
                </li>
                <li>
                  <strong>ต้องสมัครสมาชิกหรือไม่</strong>
                  <p>
                    เว็บไซต์ Ezmovie ไม่จำเป็นต้องเป็นสมาชิกก่อนใช้บริการ
                    แต่หากท่านส่าบสิบกรรสมาชิกกับ Ezmovie
                    ก็สามารถร่วะบรับไปรับถาบินเปีย หรือ
                    ลิสพันกเชาเจพาะาที่นั่แก่นั น้น อง
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Poster Animation Section Component
const PosterAnimationSection = () => {
  // 16张海报数据，重新分布到4列，每列包含更多照片以实现真正的滚动
  const posterColumns = [
    // Column 1 - 6张照片
    [
      "https://bbk100.xyz/media/cache/strip/202507/movie/bcbee463a758504dd9ad9f49b699ace7.jpg",
      "https://bbk100.xyz/media/cache/strip/202506/movie/4ffb5482deaadb3f7f964d9c4a82b10f.jpg",
      "https://bbk100.xyz/media/cache/strip/202412/movie/8137bfad82480c69952cb1dadec913d2.jpg",
      "https://bbk100.xyz/media/cache/strip/202412/movie/1449373087ffa020f732b522501d5e62.jpg",
      "https://bbk100.xyz/media/cache/strip/202507/movie/6dead11a73cc3431713974f55444ac62.jpg",
      "https://bbk100.xyz/media/cache/strip/202412/movie/330ab84d7078fe7faf79acd7ad847cfc.jpg",
    ],
    // Column 2 - 4张照片
    [
      "https://bbk100.xyz/media/cache/strip/202507/movie/ba747f34919b2b185a10e044d28ed6fd.jpg",
      "https://bbk100.xyz/media/cache/strip/202502/movie/25618192e4477fdeb600f094466537d3.jpg",
      "https://bbk100.xyz/media/cache/strip/202507/movie/7a90dbfa7f41e44f1b4aa058854f32d1.jpg",
      "https://bbk100.xyz/media/cache/strip/202411/movie/6e38f8344b98d26015b7e0472c8accea.jpg",
    ],
    // Column 3 - 4张照片
    [
      "https://bbk100.xyz/media/cache/strip/202410/movie/2dd3fc494baf879a57195a1b77766fe2.jpg",
      "https://bbk100.xyz/media/cache/strip/202502/movie/ac4774ec28d59bfd9992a60c676d8bb2.jpg",
      "https://bbk100.xyz/media/cache/strip/202404/movie/17efdc55f78e7a957afd17adf2dda617.jpg",
      "https://bbk100.xyz/media/cache/strip/202408/movie/b61c10ab55e199b3928aa5808813cec5.jpg",
    ],
    // Column 4 - 2张照片
    [
      "https://bbk100.xyz/media/cache/strip/202408/movie/a1e57016ff3da9257339c37cfaab87f7.jpg",
      "https://bbk100.xyz/media/cache/strip/202502/movie/4aadaed5be92d1dbfb9df37ccc91692f.jpg",
    ],
  ];

  return (
    <section className="poster-animation-section">
      {/* 背景动画海报 */}
      <div className="poster-slide-background">
        <div className="poster-columns-container">
          {posterColumns.map((column, columnIndex) => (
            <div
              key={columnIndex}
              className={`poster-column column-${columnIndex + 1} is-animation`}
            >
              {/* 重复渲染两次图片以实现无缝循环 */}
              {[...column, ...column].map((poster, posterIndex) => (
                <div key={posterIndex} className="poster-image">
                  <img
                    src={poster}
                    alt="EZ Movie ดูหนังฟรี ไม่มีโฆษณา"
                    width="300"
                    height="440"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 前景内容 */}
      <div className="poster-content-overlay">
        <div className="poster-content-container">
          <div className="poster-content-inner">
            <h2 className="poster-title animated fadeInUpShortly">
              ขอหนังง่ายๆ ได้ดูใน 3 วัน
            </h2>
            <p className="poster-subtitle animated fadeInUpShortly">
              เรื่องไหนก็ดูได้ฟรี พร้อมการแจ้งเตือนผ่านมือถือ
            </p>
            <div className="poster-btn-wrapper animated fadeInUpShortly">
              <button className="poster-request-btn">ขอหนังฟรี</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer Component
const SiteFooter = () => {
  const footerCategories = [
    "ดูหนัง",
    "ดูหนังออนไลน์",
    "ดูหนังฟรี",
    "ดูหนัง2025",
    "ดูซีรี่",
    "ซีรี่",
    "ดูอนิเมะ",
    "อนิเมะ",
    "พากย์ไทย",
    "ซับไทย",
    "เต็มเรื่อง",
    "Netflix",
  ];

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Top Section - Logo and Sponsors */}
        <div className="footer-top">
          <div className="footer-brand">
            <img
              src="/images/logos/ez-movie-logo-clean.svg"
              alt="EZ Movie"
              className="footer-logo"
            />
          </div>

          <div className="footer-sponsors">
            <img
              src="https://ezmovie.me/build/web/ez-movie/img/sponsor-logo-casino.png?v=2?v=1"
              alt="EZ Casino"
              className="sponsor-logo"
            />
            <img
              src="https://ezmovie.me/build/web/ez-movie/img/sponsor-logo-slot.png?v=1"
              alt="EZ Slot"
              className="sponsor-logo"
            />
            <img
              src="https://ezmovie.me/build/web/ez-movie/img/sponsor-logo-lotto.png?v=1"
              alt="EZ Lotto"
              className="sponsor-logo"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="footer-nav">
          {footerCategories.map((category, index) => (
            <a key={index} href="#" className="footer-nav-link">
              {category}
            </a>
          ))}
        </div>

        {/* Bottom Section - Legal and Copyright */}
        <div className="footer-bottom">
          <div className="footer-links">
            <a href="#" className="footer-link">
              ประกาศหนังที่สนหา
            </a>
            <span className="divider">|</span>
            <a href="#" className="footer-link">
              Term and Condition
            </a>
            <span className="divider">|</span>
            <a href="#" className="footer-link">
              ขอหนังฟรี
            </a>
          </div>

          <div className="footer-copyright">
            EZ Movie ดูหนังฟรี ไม่มีโฆษณา, Copyright 2023 All Right Reserved
          </div>
        </div>
      </div>
    </footer>
  );
};
// Lightweight movie modal:
const MovieModal: React.FC<{
  open: boolean;
  movie: {
    title: string;
    poster: string;
    backdrop?: string;
    trailerUrl?: string;
    year?: string | number;
    runtime?: string;
    imdb?: string | number;
    ageRating?: string;
    language?: string;
    actors?: string[];
    categories?: Array<{ label: string; href?: string }>;
    tags?: string[];
    descriptionHtml?: string;
    bannerImages?: Array<{ src: string; href?: string; alt?: string }>;
  } | null;
  onClose: () => void;
}> = ({ open, movie, onClose }) => {
  if (!open || !movie) return null;
  return (
    <div className="x-modal x-movie-modal" role="dialog" aria-modal="true">
      <div className="x-modal-backdrop" onClick={onClose} />
      <div className="x-modal-dialog">
        <button aria-label="Close" className="x-modal-close" onClick={onClose}>
          ×
        </button>
        <div className="x-modal-body">
          {/* Video trailer section */}
          <div
            className="-teaser-container"
            style={{
              backgroundImage: `url(${movie.backdrop || movie.poster})`,
            }}
          >
            <div className="-embed">
              {movie.trailerUrl
                ? (() => {
                    const raw = movie.trailerUrl || "";
                    // Transform YouTube watch URLs to embed URLs
                    const ytMatch = raw.match(
                      /(?:youtu\.be\/|watch\?v=|embed\/)([^#&?]{11})/
                    );
                    const embed = ytMatch
                      ? `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1`
                      : raw;
                    return (
                      <iframe
                        className="-iframe"
                        src={embed}
                        title={movie.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    );
                  })()
                : null}
            </div>
          </div>

          {/* Todo: To do: API implementation to backoffice control banner */}
          {/* Movie info container */}
          <div className="-movie-info-container">
            <div className="-container">
              {/* Banner ads section */}
              <div className="x-banner-website-container">
                <div className="-banner-grid">
                  <a
                    className="-banner-item"
                    href="https://ezlotto.xyz/aff/ez993605?action=register"
                    target="_blank"
                    rel="noopener nofollow"
                  >
                    <img
                      className="-banner-item-img img-fluid"
                      src="https://ezmovie.me/media/cache/strip/202409/block/ab8e9907ad761e4d933a3629ed872a83.png"
                      alt="banner - ezlotto.me"
                    />
                  </a>
                  <a
                    className="-banner-item"
                    href="https://1ufabet.run/aff/1ufa9950?action=register"
                    target="_blank"
                    rel="noopener nofollow"
                  >
                    <img
                      className="-banner-item-img img-fluid"
                      src="https://ezmovie.me/media/cache/strip/202409/block/98c705f33ca9b3b3c86820cac62ed0ce.png"
                      alt="banner - 1ufa"
                    />
                  </a>
                  <a
                    className="-banner-item"
                    href="https://ezslot.ai/aff/ez993605?action=register"
                    target="_blank"
                    rel="noopener nofollow"
                  >
                    <img
                      className="-banner-item-img img-fluid"
                      src="https://ezmovie.me/media/cache/strip/202409/block/b9ee2b0b2cba0a22aa8d4b3fd94c0415.png"
                      alt="banner - ezslot.vip"
                    />
                  </a>
                </div>
              </div>

              {/* Movie info section */}
              <div className="x-movie-show-info">
                <div className="-title-and-button">
                  <div className="-title-section">
                    <h1 className="-head-title">{movie.title}</h1>
                  </div>
                  <div className="-button-section">
                    <div className="-btn-play-favorite">
                      <a
                        href={`/movie/${encodeURIComponent(
                          movie.title.toLowerCase().replace(/\s+/g, "-")
                        )}`}
                        className="btn btn-primary -btn-icon"
                      >
                        <svg
                          className="-ic -play"
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path d="M8 5v14l11-7z" fill="currentColor" />
                        </svg>
                        Watch
                      </a>
                    </div>
                  </div>
                </div>

                <div className="-info-wrapper">
                  <div className="-image-cover">
                    <img
                      alt={movie.title}
                      className="img-fluid"
                      src={movie.poster}
                    />
                  </div>

                  <div className="-content-section">
                    <div className="-left-column">
                      {/* Basic info badges */}
                      <div className="mb-2 -box">
                        {movie.year && (
                          <span className="-gap">{movie.year}</span>
                        )}
                        {movie.ageRating && (
                          <img
                            alt={movie.ageRating}
                            className="-age-img"
                            src={
                              new URL(
                                `../../images/rate-${movie.ageRating}.png`,
                                import.meta.url
                              ).href
                            }
                          />
                        )}
                        {movie.runtime && (
                          <span className="-gap">{movie.runtime}</span>
                        )}
                        <img
                          alt="HD"
                          className="-hd-img"
                          src={
                            new URL(`../../images/hd-icon.png`, import.meta.url)
                              .href
                          }
                        />
                        {movie.imdb && (
                          <span className="badge -badge rounded-0">
                            IMDB: {movie.imdb}
                          </span>
                        )}
                      </div>

                      {/* Language */}
                      {movie.language && (
                        <div className="mb-2">
                          <span className="mr-5">Audio: {movie.language}</span>
                        </div>
                      )}

                      {/* Actors */}
                      {movie.actors && movie.actors.length > 0 && (
                        <div className="-tags -box -actors">
                          <span className="-title">Cast:</span>
                          {movie.actors.map((actor) => (
                            <a key={actor} href="#" className="badge -badge">
                              {actor}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Categories */}
                      {movie.categories && movie.categories.length > 0 && (
                        <div className="mb-2">
                          Categories:
                          {movie.categories.map((cat, idx) => (
                            <span key={`${cat.label}-${idx}`}>
                              <a href={cat.href || "#"} className="-category">
                                {cat.label}
                              </a>
                              {idx < movie.categories!.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Tags */}
                      {movie.tags && movie.tags.length > 0 && (
                        <div className="-tags -box mb-2">
                          <span className="-title">Tags:</span>
                          {movie.tags.map((tag) => (
                            <a key={tag} href="#" className="badge -badge">
                              {tag}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="-right-column -show-more js-show-more">
                      <div className="-short-detail">
                        <div className="-title">Synopsis</div>
                        <div
                          className="-detail"
                          dangerouslySetInnerHTML={{
                            __html: movie.descriptionHtml || "—",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="-btn-show-more js-btn-show-more"
                  onClick={(e) => {
                    const container =
                      e.currentTarget.closest(".x-movie-show-info");
                    const detail = container?.querySelector(
                      ".-detail"
                    ) as HTMLElement;
                    const button = e.currentTarget;
                    if (detail && button) {
                      const isExpanded = detail.style.maxHeight === "none";
                      detail.style.maxHeight = isExpanded ? "120px" : "none";
                      button.innerHTML = isExpanded
                        ? 'Details <i class="fas fa-angle-down"></i>'
                        : 'Show less <i class="fas fa-angle-up"></i>';
                    }
                  }}
                >
                  Details <i className="fas fa-angle-down"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        /* Modal base styles */
        .x-modal { position: fixed; inset: 0; z-index: 9999; }
        .x-modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); }
        .x-modal-dialog {
          position: relative;
          max-width: min(1200px, 95vw);
          margin: 2vh auto;
          background: #1a1d29;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 100px rgba(0,0,0,0.8);
        }
        .x-modal-close {
          position: absolute;
          top: 12px;
          right: 16px;
          background: rgba(0,0,0,0.7);
          border: 0;
          color: #fff;
          font-size: 24px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .x-modal-close:hover { background: rgba(0,0,0,0.9); }
        .x-modal-body { max-height: 90vh; overflow-y: auto; }

        /* Video section */
        .-teaser-container {
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .-embed { position: relative; padding-top: 38%; }  /* 从42%再调小到38% */
        .-iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }

        /* Movie info container */
        .-movie-info-container {
          background: linear-gradient(135deg, #1a1d29 0%, #23262f 100%);
          padding: 0;
        }
        .-container { padding: 24px 32px; }

        /* Banner section */
        .x-banner-website-container {
          margin-bottom: 36px;
          padding-bottom: 32px;
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }
        .-banner-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(16px, 3vw, 24px);
          flex-wrap: wrap;
        }
        .-banner-item {
          display: block;
          transition: transform 0.3s ease;
          flex: 1 1 auto;
          min-width: 200px;
          max-width: 280px;
        }
        .-banner-item:hover { transform: scale(1.05); }
        .-banner-item-img {
          height: auto;
          width: 100%;
          max-width: 280px;
          min-width: 200px;
          object-fit: contain;
          border-radius: 12px;
          background: transparent;
          padding: 0;
          border: none;
        }

        /* Title and button section */
        .x-movie-show-info { color: #e8ecf4; }
        .-title-and-button {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 24px;
          margin-bottom: 32px;
        }
        .-head-title {
          font-size: 32px;
          font-weight: 700;
          margin: 0;
          color: #ffffff;
          line-height: 1.2;
        }
        .btn.btn-primary.-btn-icon {
          background: linear-gradient(135deg, #ff2d55 0%, #ff3b30 50%, #ff2d55 100%);
          color: #fff;
          border: 0;
          padding: 14px 26px;
          border-radius: 999px; /* 胶囊形状 */
          font-size: 16px;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all .25s ease;
          box-shadow: 0 10px 24px rgba(255, 59, 48, .35), inset 0 0 0 1px rgba(255,255,255,.08);
          position: relative;
          overflow: hidden;
        }
        .btn.btn-primary.-btn-icon::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(120% 120% at 0% 0%, rgba(255,255,255,.20), rgba(255,255,255,0) 60%);
          mix-blend-mode: screen;
          pointer-events: none;
        }
        .btn.btn-primary.-btn-icon:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 14px 32px rgba(255, 59, 48, .45), inset 0 0 0 1px rgba(255,255,255,.12);
          filter: saturate(1.05);
        }
        .btn.btn-primary.-btn-icon:active { transform: translateY(0) scale(.99); }
        /* 统一SVG播放图标的尺寸与对齐 */
        .-ic.-play { display:inline-block; vertical-align: middle; }

        /* Info wrapper */
        .-info-wrapper {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 32px;
          align-items: start;
        }
        .-image-cover img {
          width: 250px;
          height: auto;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }

        /* Content section */
        .-content-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        /* Left column - badges and info */
        .-left-column .mb-2 { margin-bottom: 16px; }
        .-box { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .-gap {
          background: rgba(255,255,255,0.1);
          color: #d1d9e6;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 500;
        }
        .-age-img, .-hd-img {
          height: 24px;
          width: auto;
          object-fit: contain;
        }
        .badge.-badge {
          background: rgba(229, 9, 20, 0.2);
          color: #ff6b7a;
          border: 1px solid rgba(229, 9, 20, 0.3);
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 500;
          margin-left: 8px;
        }
        .badge.-badge.rounded-0 { border-radius: 8px; }

        /* Language section */
        .mr-5 { margin-right: 20px; color: #b8c5d6; }

        /* Tags sections */
        .-tags { margin: 12px 0; line-height: 1.4; }
        .-tags.-actors .-title,
        .-tags .-title {
          margin-right: 8px;
          color: #8a95a8;
          font-weight: 600;
        }
        .-tags .badge.-badge {
          margin: 0 4px 4px 0;
          background: rgba(255,255,255,0.08);
          color: #d1d9e6;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 4px 8px;
          font-size: 12px;
          line-height: 1.3;
        }
        .-tags .badge.-badge:hover {
          background: rgba(255,255,255,0.15);
          transform: translateY(-1px);
        }

        /* Categories */
        .-category {
          color: #6db4ff;
          text-decoration: none;
          margin-right: 4px;
          font-size: 14px;
          transition: color 0.3s ease;
        }
        .-category:hover { color: #8dc8ff; }

        /* Right column - description */
        .-right-column .-short-detail .-title {
          font-weight: 700;
          font-size: 18px;
          margin-bottom: 12px;
          color: #ffffff;
        }
        .-detail {
          color: #b8c5d6;
          font-size: 15px;
          line-height: 1.7;
          max-height: 120px;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        /* Show more button */
        .-btn-show-more {
          margin-top: 24px;
          background: rgba(255,255,255,0.08);
          color: #d1d9e6;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 12px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .-btn-show-more:hover {
          background: rgba(255,255,255,0.15);
          transform: translateY(-1px);
        }

        /* Responsive design */
        @media (max-width: 1024px) {
          .-banner-item {
            min-width: 180px;
            max-width: 240px;
          }
        }

        @media (max-width: 768px) {
          .-container { padding: 16px 20px; }
          .-title-and-button {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 16px;
          }
          .-head-title { font-size: 24px; }
          .-info-wrapper {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .-content-section {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .-image-cover { text-align: center; }
          .-image-cover img { width: 200px; }
          .-banner-item {
            min-width: 150px;
            max-width: 200px;
          }
          .-banner-item-img {
            border-radius: 10px;
          }
        }

        @media (max-width: 480px) {
          .-banner-grid {
            flex-direction: column;
            gap: 12px;
          }
          .-banner-item {
            min-width: 160px;
            max-width: 220px;
          }
        }
      `}</style>
    </div>
  );
};

export default EZMovieHome;

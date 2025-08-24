import React, { useState, useEffect, useCallback } from 'react';
import SponsorMenu from '../home/menu';

// Hero轮播数据 - 从首页复制
const heroSlides = [
  {
    id: 'hero-1',
    title: 'ปุกเกิด ตีหมื่น',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1920/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
    logoUrl: 'https://ezmovie.me/media/cache/strip/202304/block/dc02782fcfc5ee44bc9682d82e489b0f.png',
    description: 'อดีตยอดนักสู้ชาวไทย หมาก ปรีชา ต้องอาศัยทักษะการต่อสู้เหนือคน ความจงรักภักดี และจิตใจเหล็กเพื่อการต่อสู้เพื่อเอาชีวิตรอดจากฝูงซอมบี้นับร้อย',
  },
  {
    id: 'hero-2', 
    title: 'Transformers One',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1920/uMXVeVL2v57lMv6pqBmegDHHPqz.jpg',
    logoUrl: 'https://ezmovie.me/media/cache/strip/202304/block/dc02782fcfc5ee44bc9682d82e489b0f.png',
    description: 'การผจญภัยครั้งใหม่ของ Optimus Prime และ Megatron ที่เจาะลึกถึงต้นกำเนิดและมิตรภาพที่กลายเป็นศัตรูกันในดาวไซเบอร์ตรอน',
  },
  {
    id: 'hero-3',
    title: 'The Wild Robot',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1920/59AJ2w9iRIQGdJEjZgWuvRZgbhC.jpg',
    logoUrl: 'https://ezmovie.me/media/cache/strip/202304/block/dc02782fcfc5ee44bc9682d82e489b0f.png',
    description: 'หุ่นยนต์ที่ติดอยู่บนเกาะร้างได้เรียนรู้ที่จะปรับตัวกับสภาพแวดล้อมที่รุนแรงและค่อยๆ สร้างความสัมพันธ์กับสัตว์ต่างๆ บนเกาะ',
  },
  {
    id: 'hero-4',
    title: 'Feature Banner',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
    backdropUrl: 'https://ezmovie.me/media/cache/strip/202304/block/d1de324d5ff8f92bb4042df52b645523.jpg',
    description: 'อัปเดตแบนเนอร์ใหม่ตามที่ขอ เพิ่มภาพพื้นหลังสำหรับสไลด์พิเศษ',
  }
];

// 外国电影数据 - 42部电影填满6x7网格
const foreignMovies = [
  // 第一行
  { id: 'foreign-1', title: 'Avengers: Endgame', posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', year: '2019', genre: 'Action', rating: '8.4' },
  { id: 'foreign-2', title: 'Spider-Man: No Way Home', posterUrl: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', year: '2021', genre: 'Action', rating: '8.2' },
  { id: 'foreign-3', title: 'Top Gun: Maverick', posterUrl: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg', year: '2022', genre: 'Action', rating: '8.3' },
  { id: 'foreign-4', title: 'The Batman', posterUrl: 'https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg', year: '2022', genre: 'Action', rating: '7.8' },
  { id: 'foreign-5', title: 'Dune', posterUrl: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', year: '2021', genre: 'Sci-Fi', rating: '8.0' },
  { id: 'foreign-6', title: 'John Wick: Chapter 4', posterUrl: 'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg', year: '2023', genre: 'Action', rating: '7.7' },
  
  // 第二行
  { id: 'foreign-7', title: 'Fast X', posterUrl: 'https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg', year: '2023', genre: 'Action', rating: '5.8' },
  { id: 'foreign-8', title: 'Oppenheimer', posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', year: '2023', genre: 'Drama', rating: '8.3' },
  { id: 'foreign-9', title: 'Guardians of the Galaxy Vol. 3', posterUrl: 'https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg', year: '2023', genre: 'Action', rating: '7.9' },
  { id: 'foreign-10', title: 'Indiana Jones 5', posterUrl: 'https://image.tmdb.org/t/p/w500/Af4bXE63pVsb2FtbW8uYIyPBadD.jpg', year: '2023', genre: 'Adventure', rating: '6.5' },
  { id: 'foreign-11', title: 'Mission: Impossible 7', posterUrl: 'https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg', year: '2023', genre: 'Action', rating: '7.7' },
  { id: 'foreign-12', title: 'The Flash', posterUrl: 'https://image.tmdb.org/t/p/w500/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg', year: '2023', genre: 'Action', rating: '6.7' },
  
  // 第三行
  { id: 'foreign-13', title: 'Transformers: Rise of the Beasts', posterUrl: 'https://image.tmdb.org/t/p/w500/gPbM0MK8CP8A174rmUwGsADNYKD.jpg', year: '2023', genre: 'Action', rating: '6.0' },
  { id: 'foreign-14', title: 'Scream VI', posterUrl: 'https://image.tmdb.org/t/p/w500/wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg', year: '2023', genre: 'Horror', rating: '6.5' },
  { id: 'foreign-15', title: 'Ant-Man and the Wasp: Quantumania', posterUrl: 'https://image.tmdb.org/t/p/w500/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg', year: '2023', genre: 'Action', rating: '6.1' },
  { id: 'foreign-16', title: 'Creed III', posterUrl: 'https://image.tmdb.org/t/p/w500/cvsXj3I9Q2iyyIo95AecSd1tad7.jpg', year: '2023', genre: 'Drama', rating: '6.8' },
  { id: 'foreign-17', title: 'Avatar: The Way of Water', posterUrl: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', year: '2022', genre: 'Action', rating: '7.6' },
  { id: 'foreign-18', title: 'Black Panther: Wakanda Forever', posterUrl: 'https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg', year: '2022', genre: 'Action', rating: '6.7' },
  
  // 第四行
  { id: 'foreign-19', title: 'Thor: Love and Thunder', posterUrl: 'https://image.tmdb.org/t/p/w500/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg', year: '2022', genre: 'Action', rating: '6.2' },
  { id: 'foreign-20', title: 'Doctor Strange 2', posterUrl: 'https://image.tmdb.org/t/p/w500/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg', year: '2022', genre: 'Action', rating: '6.9' },
  { id: 'foreign-21', title: 'Minions: The Rise of Gru', posterUrl: 'https://image.tmdb.org/t/p/w500/wKiOkZTN9lUUUNZLmtnwubZYONg.jpg', year: '2022', genre: 'Animation', rating: '6.5' },
  { id: 'foreign-22', title: 'Jurassic World Dominion', posterUrl: 'https://image.tmdb.org/t/p/w500/kAVRgw7GgK1CfYEJq8ME6EvRIgU.jpg', year: '2022', genre: 'Action', rating: '5.6' },
  { id: 'foreign-23', title: 'Lightyear', posterUrl: 'https://image.tmdb.org/t/p/w500/ox4goZd956BxqJH6iLwhWPL9ct4.jpg', year: '2022', genre: 'Animation', rating: '5.9' },
  { id: 'foreign-24', title: 'Sonic the Hedgehog 2', posterUrl: 'https://image.tmdb.org/t/p/w500/6DrHO1jr3qVrViUO6s6kFiAGM7.jpg', year: '2022', genre: 'Action', rating: '6.5' },
  
  // 第五行
  { id: 'foreign-25', title: 'The Northman', posterUrl: 'https://image.tmdb.org/t/p/w500/zhLKlUaF1SEpO58ppHIAyENkwgw.jpg', year: '2022', genre: 'Action', rating: '7.0' },
  { id: 'foreign-26', title: 'Fantastic Beasts 3', posterUrl: 'https://image.tmdb.org/t/p/w500/jrgifaYeUtTnaH7NF5Drkgjg2MB.jpg', year: '2022', genre: 'Fantasy', rating: '6.2' },
  { id: 'foreign-27', title: 'The Bad Guys', posterUrl: 'https://image.tmdb.org/t/p/w500/7qop80YfuO0BwJa1uXk1DXUUEwv.jpg', year: '2022', genre: 'Animation', rating: '6.8' },
  { id: 'foreign-28', title: 'Morbius', posterUrl: 'https://image.tmdb.org/t/p/w500/6JjfSchsU6daXk2AKX8EEBjO3Fm.jpg', year: '2022', genre: 'Action', rating: '5.2' },
  { id: 'foreign-29', title: 'The Lost City', posterUrl: 'https://image.tmdb.org/t/p/w500/neMZH82Stu91d3iqvLdNQfqPPyl.jpg', year: '2022', genre: 'Comedy', rating: '6.1' },
  { id: 'foreign-30', title: 'Uncharted', posterUrl: 'https://image.tmdb.org/t/p/w500/rJHC1RUORuUhtfNb4Npclx0xnOf.jpg', year: '2022', genre: 'Action', rating: '6.3' },
  
  // 第六行
  { id: 'foreign-31', title: 'The Matrix Resurrections', posterUrl: 'https://image.tmdb.org/t/p/w500/8c4a8kE7PizaGQQnditMmI1xbRp.jpg', year: '2021', genre: 'Action', rating: '5.7' },
  { id: 'foreign-32', title: 'No Time to Die', posterUrl: 'https://image.tmdb.org/t/p/w500/iUgygt3fscRoKWCV1d0C7FbM9TP.jpg', year: '2021', genre: 'Action', rating: '7.3' },
  { id: 'foreign-33', title: 'Eternals', posterUrl: 'https://image.tmdb.org/t/p/w500/lFByFSLV5WDJEv3KabbdAF959F2.jpg', year: '2021', genre: 'Action', rating: '6.3' },
  { id: 'foreign-34', title: 'Venom: Let There Be Carnage', posterUrl: 'https://image.tmdb.org/t/p/w500/rjkmN1dniUHVYAtwuV3Tji7FsDO.jpg', year: '2021', genre: 'Action', rating: '5.9' },
  { id: 'foreign-35', title: 'Fast & Furious 9', posterUrl: 'https://image.tmdb.org/t/p/w500/bOFaAXmWWXC3Rbv4u4uM9ZSzRXP.jpg', year: '2021', genre: 'Action', rating: '5.2' },
  { id: 'foreign-36', title: 'Black Widow', posterUrl: 'https://image.tmdb.org/t/p/w500/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg', year: '2021', genre: 'Action', rating: '6.7' },
  
  // 第七行
  { id: 'foreign-37', title: 'Cruella', posterUrl: 'https://image.tmdb.org/t/p/w500/rTh4K5uw9HypmpGslcKd4QfHl93.jpg', year: '2021', genre: 'Crime', rating: '7.3' },
  { id: 'foreign-38', title: 'A Quiet Place Part II', posterUrl: 'https://image.tmdb.org/t/p/w500/4q2hz2m8hubgvijz8Ez0T2Os2Yv.jpg', year: '2020', genre: 'Horror', rating: '7.2' },
  { id: 'foreign-39', title: 'Godzilla vs. Kong', posterUrl: 'https://image.tmdb.org/t/p/w500/pgqgaUx1cJb5oZQQ5v0tNARCeBp.jpg', year: '2021', genre: 'Action', rating: '6.3' },
  { id: 'foreign-40', title: 'Zack Snyder\'s Justice League', posterUrl: 'https://image.tmdb.org/t/p/w500/tnAuB8q5vv7Ax9UAEje5Xi4BXik.jpg', year: '2021', genre: 'Action', rating: '8.0' },
  { id: 'foreign-41', title: 'Wonder Woman 1984', posterUrl: 'https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg', year: '2020', genre: 'Action', rating: '5.4' },
  { id: 'foreign-42', title: 'Tenet', posterUrl: 'https://image.tmdb.org/t/p/w500/k68nPLbIST6NP96JmTxmZijEvCA.jpg', year: '2020', genre: 'Action', rating: '7.3' }
];

const ForeignMovies: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const usp = new URLSearchParams(window.location.search);
      const p = parseInt(usp.get('page') || '1', 10);
      return Number.isFinite(p) && p > 0 ? p : 1;
    } catch {
      return 1;
    }
  });

  const pageSize = 24;
  const totalPages = 133; // 预留目标总页数

  // 为演示填充足量数据（不会影响真实对接接口时的替换）
  const demoAllItems = React.useMemo(() => {
    const totalItems = pageSize * totalPages;
    return Array.from({ length: totalItems }, (_, i) => {
      const base = foreignMovies[i % foreignMovies.length];
      return { ...base, id: `foreign-${i + 1}` };
    });
  }, []);

  const pageStart = (currentPage - 1) * pageSize;
  const pageItems = demoAllItems.slice(pageStart, pageStart + pageSize);

  const updateUrlPage = useCallback((p: number) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', String(p));
      window.history.pushState({}, '', url.toString());
    } catch {}
  }, []);

  const goToPage = useCallback((p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setCurrentPage(next);
    updateUrlPage(next);
    try {
      document.querySelector('.foreign-movies-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {}
  }, [totalPages, updateUrlPage]);

  // 生成分页范围（含省略号）
  const paginationRange = React.useMemo(() => {
    const range: Array<number | '...'> = [];
    const maxAround = 1; // 当前页左右显示数量
    const first = 1;
    const last = totalPages;

    const add = (v: number | '...') => { if (range[range.length - 1] !== v) range.push(v); };

    add(first);
    for (let p = currentPage - maxAround; p <= currentPage + maxAround; p += 1) {
      if (p > first && p < last) add(p);
    }
    add(last);

    // 插入省略号
    const compact: Array<number | '...'> = [];
    for (let i = 0; i < range.length; i += 1) {
      const prev = range[i - 1];
      const cur = range[i];
      if (typeof prev === 'number' && typeof cur === 'number' && cur - prev > 1) {
        compact.push('...');
      }
      compact.push(cur);
    }
    // 确保头部显示 1 2 3 ... 样式
    return compact;
  }, [currentPage, totalPages]);



  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // 5秒切换

    return () => clearInterval(interval);
  }, []);



  // 样式类名常量 - 从首页复制
  const styles = {
    pageRoot: 'ezm-pageRoot',
    container: 'ezm-container',
    header: 'ezm-header',
    headerInner: 'ezm-headerInner',
    brandGroup: 'ezm-brandGroup',
    hamburger: 'ezm-hamburger',
    line: 'ezm-line',
    lineTopBottom: 'ezm-line-top-bottom',
    nav: 'ezm-nav',
    navItem: 'ezm-navItem',
    headerActions: 'ezm-headerActions',
    lineIcon: 'ezm-lineIcon',
    lineImg: 'ezm-lineImg',
    animatedBtn: 'ezm-animatedBtn',
    separator: 'ezm-separator',
    searchBtn: 'ezm-searchBtn',
    btnIcon: 'ezm-btnIcon',
    hero: 'ezm-hero',
    heroSlide: 'ezm-heroSlide',
    heroBackdrop: 'ezm-heroBackdrop',
    heroOverlay: 'ezm-heroOverlay',
    heroInner: 'ezm-heroInner',
    heroContent: 'ezm-heroContent',
    heroTitleLogo: 'ezm-heroTitleLogo',
    heroDescription: 'ezm-heroDescription',
    heroActions: 'ezm-heroActions',
    ctaButton: 'ezm-ctaButton',
    ctaPrimary: 'ezm-ctaPrimary',
    ctaGhost: 'ezm-ctaGhost'
  };

  // 创建修改版的页面，只保留banner和外国电影catalog
  return (
    <div className={styles.pageRoot}>
      <style>{`
        /* ===== 从首页复制的CSS样式 ===== */
        :root {
          --container-max: 100vw;
          --container-pad: 60px;
          --hero-h: 620px;
          --header-h: 64px;
        }

        /* Page Root */
        .${styles.pageRoot} {
          background: #0a0c12;
          color: #ffffff;
          font-family: 'Noto Sans Thai', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
        }

        /* Container */
        .${styles.container} {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0;
        }

        /* Header Styles */
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
          padding: 0 calc(var(--container-pad) - 10px);
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
          stroke-width: 3;
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

        /* LOGO 图片尺寸 */
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

        .${styles.hamburger} input {
          display: none;
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

        .brand-logo {
          font-weight: 900;
          font-size: 22px;
          letter-spacing: 0.8px;
          color: white;
          text-transform: none;
        }

        .brand-logo span {
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

        /* Header Actions */
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

        .partner-link {
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

        .${styles.lineImg} {
          height: 32px;
          width: 32px;
          object-fit: contain;
        }

        .${styles.lineIcon}:hover {
          transform: scale(1.05);
        }

        /* 分隔线样式 */
        .${styles.separator} {
          width: 1px;
          height: 24px;
          background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          margin: 0 6px;
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
          height: 24px;
          width: auto;
          display: block;
          object-fit: contain;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,.4));
        }

        /* 搜索按钮 */
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

        /* Hero Section */
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

        .${styles.heroTitleLogo} {
          width: 400px;
          height: 120px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: left center;
          margin-bottom: 1.5rem;
        }

        .${styles.heroDescription} {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 2rem;
          line-height: 1.6;
          max-width: 500px;
        }

        .${styles.heroActions} {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .${styles.ctaButton} {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .${styles.ctaPrimary} {
          background: #e50914;
          color: white;
        }

        .${styles.ctaPrimary}:hover {
          background: #c40813;
          transform: translateY(-2px);
        }

        .${styles.ctaGhost} {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .${styles.ctaGhost}:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .${styles.btnIcon} {
          width: 16px;
          height: 16px;
        }

        /* Foreign Movies Section */
        .foreign-movies-section {
          padding: 40px 0 60px;
          background: #0a0c12;
          position: relative;
          z-index: 10;
        }
        
        .foreign-movies-container {
          max-width: var(--container-max);
          margin: 0 auto;
          padding: 0 var(--container-pad);
        }
        
        .foreign-movies-title {
          font-size: clamp(1.5rem, 2.5vw, 2rem);
          font-weight: 800;
          margin: 0 0 30px 0;
          color: #fff;
          text-align: left;
          opacity: 0;
          animation: fadeInUp 0.7s ease forwards;
          animation-delay: 0.2s;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .foreign-movies-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .foreign-movie-card {
          position: relative;
          background: transparent;
          border-radius: 0;
          overflow: hidden;
          transition: transform 0.25s ease;
          cursor: pointer;
        }
        
        .foreign-movie-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.4);
        }
        
        .foreign-movie-poster {
          width: 100%;
          aspect-ratio: 2/3;
          object-fit: cover;
          border-radius: 0;
          display: block;
          transition: transform 0.25s ease;
        }
        
        .foreign-movie-card:hover .foreign-movie-poster {
          transform: scale(1.05);
        }
        
        .foreign-movie-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.95) 100%);
          padding: 8px 4px;
          opacity: 0;
          transition: opacity 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .foreign-movie-card:hover .foreign-movie-overlay {
          opacity: 1;
        }
        
        .foreign-movie-title {
          font-size: 1rem;
          font-weight: 500;
          margin: 0;
          color: #fff;
          line-height: 1.2;
          text-shadow: 0 2px 6px rgba(0,0,0,.6);
          text-align: center;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
        
        /* Premium pagination */
        .fm-pagination { 
          display: flex;
          align-items: center;
          gap: 8px; 
          justify-content: center; 
          margin: 40px 0 0; 
        }

        .fm-page-btn { 
          min-width: 40px; 
          height: 40px;
          padding: 0 12px; 
          border-radius: 8px; 
          border: 1px solid rgba(255,255,255,.15); 
          background: rgba(255,255,255,.08); 
          color: #fff; 
          font-weight: 600; 
          font-size: 14px; 
          cursor: pointer; 
          transition: all 0.3s ease;
        }

        .fm-page-btn:hover { 
          background: rgba(255,255,255,.15); 
          transform: translateY(-2px);
        }

        .fm-page-btn[disabled] { 
          opacity: 0.5; 
          cursor: not-allowed; 
          transform: none; 
        }
        
        .fm-page-btn.is-active { 
          background: #e50914; 
          border-color: #e50914; 
          color: #fff; 
        }
        
        .fm-page-btn.is-ellipsis { 
          background: transparent; 
          border-color: transparent; 
          cursor: default; 
        }
        
        .fm-page-btn.is-prev, 
        .fm-page-btn.is-next { 
          width: 40px; 
          padding: 0; 
          font-size: 16px; 
        }

        /* Mobile Header Styles */
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
          
          /* Hero区域手机版优化 */
          .${styles.heroDescription} {
            display: none;
          }
          
          .${styles.heroTitleLogo} {
            width: 240px;
            height: 72px;
            margin: 0 auto 0.5rem;
            background-position: center center;
          }
          
          .${styles.heroActions} {
            gap: 0.5rem;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 320px;
            margin-top: 0.25rem;
          }
          
          .${styles.ctaButton} {
            justify-content: center;
            padding: 12px 16px;
            font-size: 14px;
          }
          
          .${styles.ctaPrimary} {
            width: 30%;
            min-width: 100px;
          }
          
          .${styles.ctaGhost} {
            width: 65%;
            min-width: 160px;
          }
          
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
          .${styles.lineImg} { width: 20px; height: 20px; }
          .${styles.searchBtn} .${styles.btnIcon} { width: 22px; height: 22px; }

          /* 光学调整：搜索图标向右偏移 */
          .${styles.searchBtn} .${styles.btnIcon} {
            transform: translateX(var(--search-nudge));
            transition: transform .25s ease;
          }

          /* 保留 hover 放大效果——叠加位移与缩放 */
          .${styles.searchBtn}:hover .${styles.btnIcon} {
            transform: translateX(var(--search-nudge)) scale(1.1);
          }

          /* Hide sponsor logos on mobile */
          .ezm-sponsorBar { display: none !important; }
          
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
          .${styles.lineImg} { width: 20px; height: 20px; }
          .${styles.searchBtn} .${styles.btnIcon} { width: 22px; height: 22px; }

          /* 光学调整：搜索图标向右偏移 */
          .${styles.searchBtn} .${styles.btnIcon} {
            transform: translateX(var(--search-nudge));
            transition: transform .25s ease;
          }

          /* 保留 hover 放大效果——叠加位移与缩放 */
          .${styles.searchBtn}:hover .${styles.btnIcon} {
            transform: translateX(var(--search-nudge)) scale(1.1);
          }

          /* Hide sponsor logos on mobile */
          .ezm-sponsorBar { display: none !important; }
          
          /* Hide nav on mobile */
          .${styles.nav} { display: none !important; }
          
                    /* Hero adjustments */
          .${styles.hero} { height: 420px; }
          .${styles.heroContent} { 
            padding: 60px 0 20px !important;
            max-width: 100% !important;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            height: 100%;
          }
          
          .${styles.heroTitleLogo} {
            width: 280px;
            height: 84px;
            margin: 0 auto 1rem;
          }
        }

        /* 响应式设计 */
                 @media (max-width: 1200px) {
           .foreign-movies-grid {
             grid-template-columns: repeat(5, 1fr);
            gap: 16px;
           }
         }
         
         @media (max-width: 1024px) {
           .foreign-movies-grid {
             grid-template-columns: repeat(4, 1fr);
            gap: 14px;
          }
          
          .foreign-movies-container {
            padding: 0 40px;
          }
          
          /* 隐藏导航项以节省空间 */
          .${styles.nav} {
            display: none;
           }
         }
         
         @media (max-width: 768px) {
           .foreign-movies-container {
            padding: 0 20px;
           }
           
           .foreign-movies-grid {
             grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
          
          .foreign-movies-title {
            font-size: 1.5rem;
           }
         }
         
         @media (max-width: 480px) {
           .foreign-movies-container {
            padding: 0 16px;
           }
           
           .foreign-movies-grid {
            grid-template-columns: repeat(3, 1fr);
             gap: 8px;
           }
          
          .foreign-movies-title {
            font-size: 1.25rem;
          }
          
          /* 手机版直接显示overlay和标题，不需要hover */
          .foreign-movie-overlay {
            opacity: 1;
            height: 40px;
            padding: 4px 2px;
          }
          
          /* 手机版电影标题字体大小和粗细 */
          .foreign-movie-title {
            font-size: 0.75rem;
            font-weight: 500;
            line-height: 1.1;
          }
          
          /* 禁用手机版hover效果 */
          .foreign-movie-card:hover {
            transform: none;
            box-shadow: none;
          }
          
          .foreign-movie-card:hover .foreign-movie-poster {
            transform: none;
          }
        }

        /* ===== Poster Animation Section ===== */
        .poster-animation-section {
          position: relative;
          height: 45vh;
          min-height: 280px;
          overflow: hidden;
          background: linear-gradient(135deg, #0a0c11 0%, #1a1d26 50%, #0a0c11 100%);
          border-top: 3px solid #e50914;
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
          transform-origin: center center;
        }

        .poster-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 300%;
          position: relative;
          gap: 8px;
          padding: 0 4px;
        }

        .poster-column.is-animation {
          animation: slideUp 20s linear infinite;
        }

        /* 第1、3排往上，第2、4排往下 - 交替动画方向 */
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

        /* 滚动动画关键帧 - 与首页完全一致 */
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

        .poster-image {
          flex: none;
          aspect-ratio: 3/4;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        .poster-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 8px;
        }

        .poster-content-overlay {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
          padding: 20px 0;
        }

        .poster-content-container {
          text-align: center;
          max-width: 800px;
          padding: 0 60px;
        }

        .poster-content-inner {
          color: white;
        }

        .poster-title {
          font-size: 42px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #ffffff;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
        }

        .poster-subtitle {
          font-size: 16px;
          margin-bottom: 24px;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }

        .poster-btn-wrapper {
          margin-top: 16px;
        }

        .poster-request-btn {
          background: linear-gradient(135deg, #e50914 0%, #ff1423 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(229, 9, 20, 0.4);
        }

        .poster-request-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(229, 9, 20, 0.6);
          background: linear-gradient(135deg, #ff1423 0%, #e50914 100%);
        }

        .animated {
          opacity: 0;
          transform: translateY(30px);
        }

        .fadeInUpShortly {
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
          height: 60px;
          width: auto;
        }

        .footer-sponsors {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .sponsor-logo {
          height: 40px;
          width: auto;
          transition: transform 0.3s ease, filter 0.3s ease;
          filter: brightness(0.9);
        }

        .sponsor-logo:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
        }

        /* Navigation Links */
        .footer-nav {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 30px 25px;
          margin-bottom: 40px;
        }

        .footer-nav-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .footer-nav-link:hover {
          color: #e50914;
        }

        /* Bottom Section */
        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 30px;
          text-align: center;
        }

        .footer-links {
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .footer-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 13px;
          transition: color 0.3s ease;
        }

        .footer-link:hover {
          color: #e50914;
        }

        .divider {
          color: rgba(255, 255, 255, 0.3);
          font-size: 13px;
        }

        .footer-copyright {
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
          line-height: 1.5;
        }

        /* Responsive Design for Poster Animation */
        @media (max-width: 1024px) {
          .poster-animation-section {
            height: 40vh;
            min-height: 240px;
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
            height: 25vh;
            min-height: 160px;
          }
          
          .poster-content-overlay {
            padding: 8px 0;
          }
          
          .poster-content-container {
            padding: 0 30px;
          }
          
          .poster-title {
            font-size: 22px;
            margin-bottom: 6px;
          }
          
          .poster-subtitle {
            font-size: 12px;
            margin-bottom: 10px;
          }
          
          .poster-request-btn {
            padding: 10px 20px;
            font-size: 11px;
          }

          /* Footer responsive */
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

          .footer-nav {
            gap: 20px 15px;
          }

          .footer-nav-link {
            font-size: 13px;
          }
          
          .footer-bottom {
            padding-top: 25px;
        }

          .footer-links .divider {
            display: none;
          }

          .footer-copyright {
            font-size: 12px;
            padding: 0 10px;
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

        @media (max-width: 480px) {
          .poster-animation-section {
            height: 20vh;
            min-height: 120px;
          }
          
          .poster-content-overlay {
            padding: 5px 0;
          }
          
          .poster-content-container {
            padding: 0 20px;
          }
          
          .poster-title {
            font-size: 16px;
            margin-bottom: 4px;
          }
          
          .poster-subtitle {
            font-size: 11px;
            margin-bottom: 8px;
          }
          
          .poster-btn-wrapper {
            margin-top: 6px;
          }
          
          .poster-request-btn {
            padding: 6px 14px;
            font-size: 9px;
          }

          .footer-top {
            gap: 20px;
          }
          
          .footer-logo {
            height: 40px;
          }
          
          .sponsor-logo {
            height: 28px;
          }
        }

        /* 移动端紧凑的Poster animation */
        @media (max-width: 768px) {
          .poster-animation-section { 
            height: 22vh; 
            min-height: 140px; 
          }
          
          .poster-content-overlay { 
            padding: 8px 0; 
          }
          
          .poster-title { 
            margin-bottom: 6px; 
          }
          
          .poster-subtitle { 
            margin-bottom: 10px; 
          }
          
          .poster-btn-wrapper { 
            margin-top: 8px; 
          }
        }
      `}</style>
      
      {/* Header */}
      <SiteHeader onMenuClick={() => setIsMenuOpen(true)} />
      <SponsorMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      {/* Hero Banner */}
      <HeroSection currentSlide={currentSlide} />
      
      {/* Foreign Movies Catalog */}
        
        {/* 外国电影catalog section */}
        <section className="foreign-movies-section">
          <div className="foreign-movies-container">
            <h2 className="foreign-movies-title">หนังฝรั่งยอดนิยม</h2>
            <div className="foreign-movies-grid">
              {pageItems.length === 0 ? (
                <div style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  padding: '40px',
                  background: 'rgba(255,0,0,0.2)',
                  color: '#fff',
                  borderRadius: '8px'
                }}>
                  <h3>⚠️ ไม่พบข้อมูลหนัง</h3>
                  <p>กำลังโหลดข้อมูล หรือเกิดข้อผิดพลาด</p>
                </div>
              ) : pageItems.map((movie) => (
                <div
                  key={movie.id}
                  className="foreign-movie-card"
                  onClick={() => {
                    // 简单跳转到电影页面
                    window.location.href = `/movie/${encodeURIComponent(movie.title.toLowerCase().replace(/\s+/g, '-'))}`;
                  }}
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="foreign-movie-poster"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      console.error('Image load error:', movie.title, movie.posterUrl);
                    }}
                  />
                  <div className="foreign-movie-overlay">
                    <h3 className="foreign-movie-title">{movie.title}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <nav className="fm-pagination" aria-label="Pagination">
              <button
                className="fm-page-btn is-prev"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous"
              >
                {'<'}
              </button>
              {paginationRange.map((item, idx) => (
                typeof item === 'number' ? (
                  <button
                    key={`p-${item}-${idx}`}
                    className={`fm-page-btn ${currentPage === item ? 'is-active' : ''}`}
                    onClick={() => goToPage(item)}
                    aria-current={currentPage === item ? 'page' : undefined}
                  >
                    {item}
                  </button>
                ) : (
                  <span key={`e-${idx}`} className="fm-page-btn is-ellipsis" aria-hidden>
                    ...
                  </span>
                )
              ))}
              <button
                className="fm-page-btn is-next"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Next"
              >
                {'>'}
              </button>
            </nav>
          </div>
        </section>

        {/* Poster Animation Section - 从首页复制 */}
        <PosterAnimationSection />

        {/* Site Footer - 从首页复制 */}
        <SiteFooter />

    </div>
  );
};

// SVG Icons
const IconPlay = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const IconPlus = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const IconSearch = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const IconMenu = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);

// Site Header Component
const SiteHeader = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const navItems = [
    'หน้าหลัก',
    'หนังใหม่',
    'หนังฝรั่ง',
    'ซีรีส์',
    'อนิเมะ',
    'ประเภทหนัง',
    'คลิปวิดีโอ',
    'นักแสดง',
  ];

  const styles = {
    header: 'ezm-header',
    container: 'ezm-container',
    headerInner: 'ezm-headerInner',
    brandGroup: 'ezm-brandGroup',
    hamburger: 'ezm-hamburger',
    line: 'ezm-line',
    lineTopBottom: 'ezm-line-top-bottom',
    nav: 'ezm-nav',
    navItem: 'ezm-navItem',
    headerActions: 'ezm-headerActions',
    lineIcon: 'ezm-lineIcon',
    lineImg: 'ezm-lineImg',
    animatedBtn: 'ezm-animatedBtn',
    separator: 'ezm-separator',
    searchBtn: 'ezm-searchBtn',
    btnIcon: 'ezm-btnIcon'
  };

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
              <img className="ezm-logoImg" src="/images/logos/ez-movie-logo-clean.svg" alt="EZ Movie" />
            </a>
                    </div>

          {/* 中间：主导航 */}
          <nav className={styles.nav}>
            {navItems.map((item, i) => (
              <a 
                key={item} 
                className={`${styles.navItem} ${item === 'หนังฝรั่ง' ? 'is-active' : ''}`} 
                href={item === 'หน้าหลัก' ? '/' : '#'}
                onClick={item !== 'หน้าหลัก' ? (e) => e.preventDefault() : undefined}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* 右侧：LINE + 赞助 LOGO + 搜索 */}
          <div className={styles.headerActions}>
            {/* LINE（移动端替换为站点图片地址） */}
            <a href="#" className={`${styles.lineIcon} ${styles.animatedBtn}`} title="LINE">
              <img src="https://ezmovie.me/media/cache/strip/202310/block/88b1c84ceef85a444e84dc0af24b0e82.png" alt="LINE" className={styles.lineImg} />
            </a>

            {/* 分隔线 */}
            <div className={styles.separator}></div>
            
            {/* 赞助 LOGO（桌面显示） */}
            <div className="ezm-sponsorBar ezm-show-lg">
              <a className={`ezm-sponsorLogo ${styles.animatedBtn}`} href="#"><img src="https://ezmovie.me/build/web/ez-movie/img/sponsor-logo-casino.png?v=2?v=1" alt="Casino" /></a>
              <a className={`ezm-sponsorLogo ${styles.animatedBtn}`} href="#"><img src="https://ezmovie.me/build/web/ez-movie/img/sponsor-logo-slot.png?v=1" alt="Slot" /></a>
              <a className={`ezm-sponsorLogo ${styles.animatedBtn}`} href="#"><img src="https://ezmovie.me/build/web/ez-movie/img/sponsor-logo-lotto.png?v=1" alt="Lotto" /></a>
          </div>

            {/* 搜索按钮 */}
            <button className={`${styles.searchBtn} ${styles.animatedBtn}`} aria-label="search">
              <IconSearch className={styles.btnIcon} />
            </button>
                </div>
              </div>
            </div>
    </header>
  );
};

// Hero Section Component  
const HeroSection = ({ currentSlide }: { currentSlide: number }) => {
  const styles = {
    hero: 'ezm-hero',
    heroSlide: 'ezm-heroSlide', 
    heroBackdrop: 'ezm-heroBackdrop',
    heroOverlay: 'ezm-heroOverlay',
    heroInner: 'ezm-heroInner',
    heroContent: 'ezm-heroContent',
    heroTitleLogo: 'ezm-heroTitleLogo',
    heroDescription: 'ezm-heroDescription',
    heroActions: 'ezm-heroActions',
    ctaButton: 'ezm-ctaButton',
    ctaPrimary: 'ezm-ctaPrimary', 
    ctaGhost: 'ezm-ctaGhost',
    btnIcon: 'ezm-btnIcon'
  };

  return (
    <section className={styles.hero}>
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`${styles.heroSlide} ${index === currentSlide ? 'active' : ''}`}
        >
          <div
            className={styles.heroBackdrop}
            style={{ backgroundImage: `url(${slide.backdropUrl})` }}
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <div
                className={styles.heroTitleLogo}
                aria-label={slide.title}
                role="img"
                style={{ 
                  backgroundImage: `url(${slide.logoUrl || 'https://ezmovie.me/media/cache/strip/202304/block/dc02782fcfc5ee44bc9682d82e489b0f.png'})`
                }}
              />
              <p className={styles.heroDescription}>{slide.description}</p>
              <div className={styles.heroActions}>
                <button className={`${styles.ctaButton} ${styles.ctaPrimary}`}>
                  <IconPlay className={styles.btnIcon} /> ดูหนัง
                </button>
                <button className={`${styles.ctaButton} ${styles.ctaGhost}`}>
                  <IconPlus className={styles.btnIcon} /> รายการของฉัน
                </button>
              </div>
            </div>
            </div>
              </div>
      ))}
    </section>
  );
};

// Poster Animation Section Component - 从首页复制
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
      "https://bbk100.xyz/media/cache/strip/202412/movie/330ab84d7078fe7faf79acd7ad847cfc.jpg"
    ],
    // Column 2 - 4张照片
    [
      "https://bbk100.xyz/media/cache/strip/202507/movie/ba747f34919b2b185a10e044d28ed6fd.jpg",
      "https://bbk100.xyz/media/cache/strip/202502/movie/25618192e4477fdeb600f094466537d3.jpg",
      "https://bbk100.xyz/media/cache/strip/202507/movie/7a90dbfa7f41e44f1b4aa058854f32d1.jpg",
      "https://bbk100.xyz/media/cache/strip/202411/movie/6e38f8344b98d26015b7e0472c8accea.jpg"
    ],
    // Column 3 - 4张照片
    [
      "https://bbk100.xyz/media/cache/strip/202410/movie/2dd3fc494baf879a57195a1b77766fe2.jpg",
      "https://bbk100.xyz/media/cache/strip/202502/movie/ac4774ec28d59bfd9992a60c676d8bb2.jpg",
      "https://bbk100.xyz/media/cache/strip/202404/movie/17efdc55f78e7a957afd17adf2dda617.jpg",
      "https://bbk100.xyz/media/cache/strip/202408/movie/b61c10ab55e199b3928aa5808813cec5.jpg"
    ],
    // Column 4 - 2张照片
    [
      "https://bbk100.xyz/media/cache/strip/202408/movie/a1e57016ff3da9257339c37cfaab87f7.jpg",
      "https://bbk100.xyz/media/cache/strip/202502/movie/4aadaed5be92d1dbfb9df37ccc91692f.jpg"
    ]
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
              <button className="poster-request-btn">
                ขอหนังฟรี
              </button>
                </div>
              </div>
            </div>
          </div>
        </section>
  );
};

// Site Footer Component - 从首页复制
const SiteFooter = () => {
  const footerCategories = [
    'ดูหนัง',
    'ดูหนังออนไลน์',
    'ดูหนังฟรี',
    'ดูหนัง2025',
    'ดูซีรี่',
    'ซีรี่',
    'ดูอนิเมะ',
    'อนิเมะ',
    'พากย์ไทย',
    'ซับไทย',
    'เต็มเรื่อง',
    'Netflix'
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
            <a href="#" className="footer-link">ประกาศหนังที่สนหา</a>
                <span className="divider">|</span>
            <a href="#" className="footer-link">Term and Condition</a>
                <span className="divider">|</span>
            <a href="#" className="footer-link">ขอหนังฟรี</a>
              </div>
          
              <div className="footer-copyright">
            EZ Movie ดูหนังฟรี ไม่มีโฆษณา, Copyright 2023 All Right Reserved
              </div>
            </div>
          </div>
        </footer>
  );
};

export default ForeignMovies;

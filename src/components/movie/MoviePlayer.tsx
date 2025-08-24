import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SponsorMenu from '../home/menu';
import PlayerShell from '../../player/PlayerShell';
import { useMoviePlay } from '../../hooks/useMovies';
import { Track } from '../../lib/track';
import Loading from '../common/Loading';
import { ErrorFallback } from '../common/ErrorBoundary';

// Icon components
const IconSearch: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="M21 21L16.65 16.65"></path>
  </svg>
);

// Mock movie data - replace with API call
const mockMovieData = {
  id: '1',
  title: 'Avengers: Endgame',
  originalTitle: 'Avengers: Endgame',
  year: '2019',
  duration: '181 นาที',
  genre: ['Action', 'Adventure', 'Drama'],
  rating: '8.4',
  description: 'หลังจากเหตุการณ์ทำลายล้างใน Avengers: Infinity War นักรบที่เหลืออยู่พยายามหาทางย้อนเวลาเพื่อกลับมาพิทักษ์จักรวาลและเพื่อนของพวกเขา',
  poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
  backdrop: 'https://image.tmdb.org/t/p/w1920/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
  trailerUrl: 'https://www.youtube.com/embed/TcMBFSGVi1c',
  cast: [
    { name: 'Robert Downey Jr.', character: 'Tony Stark / Iron Man' },
    { name: 'Chris Evans', character: 'Steve Rogers / Captain America' },
    { name: 'Mark Ruffalo', character: 'Bruce Banner / Hulk' },
    { name: 'Chris Hemsworth', character: 'Thor' }
  ],
  director: 'Anthony Russo, Joe Russo',
  studio: 'Marvel Studios'
};

const relatedMovies = [
  {
    id: '2',
    title: 'Avengers: Infinity War',
    poster: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    year: '2018',
    rating: '8.4'
  },
  {
    id: '3',
    title: 'Captain America: Civil War',
    poster: 'https://image.tmdb.org/t/p/w500/rAGiXaUfPzY7CDEyNKUofk3Kw2e.jpg',
    year: '2016',
    rating: '7.8'
  },
  {
    id: '4',
    title: 'Thor: Ragnarok',
    poster: 'https://image.tmdb.org/t/p/w500/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg',
    year: '2017',
    rating: '7.9'
  },
  {
    id: '5',
    title: 'Spider-Man: No Way Home',
    poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    year: '2021',
    rating: '8.2'
  },
  {
    id: '6',
    title: 'Doctor Strange',
    poster: 'https://image.tmdb.org/t/p/w500/uGBVj3bEbCoZbDjjl9wTxcygko1.jpg',
    year: '2016',
    rating: '7.5'
  },
  {
    id: '7',
    title: 'Black Panther',
    poster: 'https://image.tmdb.org/t/p/w500/uxzzxijgPIY7slzFvMotPv8wjKA.jpg',
    year: '2018',
    rating: '7.3'
  }
];

const MoviePlayer: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movie] = useState(mockMovieData);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // 移除复杂的播放器切换逻辑 - 直接使用新PlayerShell
  const lastPosRef = useRef(0);
  const hbRef = useRef<any>(null);

  // 获取播放数据 - 直接获取，无需等待用户点击
  const { data: playData, isLoading: isPlayLoading, error: playError } = useMoviePlay(
    movieId || 'm1' // 使用URL参数或默认ID
  );


  // 播放器心跳埋点 - 简化后的逻辑
  useEffect(() => {
    if (!playData || !movieId) return;
    
    // 页面加载时发送play_start事件
    Track.playStart(movieId);
    
    const hb = Math.max(10, playData.analytics?.heartbeat || 30);
    hbRef.current = setInterval(() => {
      Track.playHeartbeat(movieId, lastPosRef.current);
    }, hb * 1000);
    
    return () => {
      if (hbRef.current) clearInterval(hbRef.current);
      Track.playHeartbeat(movieId, lastPosRef.current);
      Track.playEnd(movieId, 'page_leave');
    };
  }, [playData?.analytics?.heartbeat, movieId]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Set page title
    if (movie) {
      document.title = `${movie.title} - EZ Movie`;
    }
  }, [movie]);

  if (!movie) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0a0c12'
      }}>
        <div style={{ color: '#fff', fontSize: '18px' }}>
          ไม่พบหนังที่ท่านต้องการ
        </div>
      </div>
    );
  }

  return (
    <div className="movie-page">
      <style>{`
        .movie-page {
          background: #0a0c12;
          color: #ffffff;
          font-family: 'Noto Sans Thai', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          min-height: 100vh;
        }

        /* Header Styles - 复制自首页 */
        :root { 
          --bg: #0b0d12; 
          --panel: #12141b; 
          --text: #e6e8ee; 
          --muted: #9aa3b2; 
          --primary: #e50914; 
          --outline: rgba(255,255,255,.12);
          --container-max: 100vw;
          --container-pad: 60px;
          --header-h: 64px;
        }

        .ezm-header {
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

        .ezm-container {
          max-width: var(--container-max);
          margin: 0 auto;
          width: 100%;
        }

        .ezm-headerInner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: var(--header-h);
          padding: 0 calc(var(--container-pad) - 10px);
          max-width: var(--container-max);
          margin: 0 auto;
          width: 100%;
        }

        .ezm-brandGroup {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 200px;
        }

        .ezm-hamburger {
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

        .ezm-hamburger:hover {
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

        .ezm-hamburger svg {
          height: 2.5em;
          width: 2.5em;
          transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .ezm-line {
          fill: none;
          stroke: #e50914;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 4;
          transition: 
            stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1),
            stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1),
            stroke 300ms ease;
          animation: ezm-lineFloat 3s ease-in-out infinite;
        }

        .ezm-line-top-bottom {
          stroke-dasharray: 12 63;
        }

        .ezm-hamburger:hover .ezm-line {
          stroke: #ff1a25;
          filter: drop-shadow(0 0 4px rgba(229, 9, 20, 0.6));
        }

        @keyframes ezm-lineFloat {
          0%, 100% { 
            stroke-width: 2.5;
          }
          50% { 
            stroke-width: 2.8;
          }
        }

        .ezm-navbar-brand { 
          display: inline-flex; 
          align-items: center;
          transition: all 0.3s ease;
          text-decoration: none;
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

        .ezm-nav {
          display: flex;
          gap: 18px;
          margin-left: 16px;
          flex: 1;
          justify-content: flex-start;
        }

        .ezm-navItem {
          position: relative;
          color: #ffffff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          padding: 6px 2px;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          white-space: nowrap;
          font-family: 'Kanit', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        .ezm-navItem:hover {
          color: #ffffff;
          transform: translateY(-1px) scale(1.04);
          text-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
          animation: luxuryPulse 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes luxuryPulse {
          0% { transform: translateY(0) scale(1); }
          30% { transform: translateY(-3px) scale(1.12); }
          60% { transform: translateY(-1px) scale(1.06); }
          100% { transform: translateY(-2px) scale(1.08); }
        }

        .ezm-navItem::after {
          content: '';
          position: absolute;
          left: 50%;
          right: 50%;
          bottom: -2px;
          height: 2px;
          background: linear-gradient(90deg, #e50914, #ff1a25, #e50914);
          border-radius: 2px;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: 0 0 12px rgba(229, 9, 20, 0.8);
        }

        .ezm-navItem.is-active::after,
        .ezm-navItem:hover::after {
          left: 20%;
          right: 20%;
          box-shadow: 0 0 12px rgba(229, 9, 20, 0.8);
        }

        .ezm-headerActions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ezm-lineIcon {
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

        .ezm-lineIcon:hover {
          transform: scale(1.05);
        }

        .ezm-lineImg {
          height: 32px;
          width: 32px;
          object-fit: contain;
        }

        .ezm-separator {
          width: 1px;
          height: 24px;
          background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          margin: 0 6px;
        }

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

        .ezm-searchBtn {
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

        .ezm-searchBtn:hover {
          color: #ffffff;
          transform: scale(1.1);
        }

        .ezm-btnIcon {
          width: 18px;
          height: 18px;
          transition: all 0.3s ease;
        }

        .ezm-searchBtn:hover .ezm-btnIcon {
          transform: scale(1.1);
          filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
        }

        .ezm-animatedBtn {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform-origin: center;
          background: transparent !important;
        }

        .movie-content {
          padding-top: 84px;
          max-width: 1200px;
          margin: 0 auto;
          padding-left: 20px;
          padding-right: 20px;
        }

        /* Footer Styles - 完全复制自首页 */
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
          margin: 0 5px;
          color: rgba(255, 255, 255, 0.3);
        }

        .footer-copyright {
          color: rgba(255, 255, 255, 0.6);
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

          .ezm-headerInner {
            padding: 0 20px;
          }

          .ezm-nav {
            display: none;
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



        .movie-player-section {
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .movie-player {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
        }

        .movie-player iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        /* 播放器相关样式 */
        .trailer-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .play-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .trailer-container:hover .play-overlay {
          opacity: 1;
        }

        .play-button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 32px;
          background: linear-gradient(135deg, #e50914 0%, #ff1a25 100%);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(229, 9, 20, 0.4);
          min-width: 200px;
        }

        .play-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(229, 9, 20, 0.6);
          background: linear-gradient(135deg, #ff1a25 0%, #e50914 100%);
        }

        .play-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .play-icon {
          font-size: 24px;
          line-height: 1;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .player-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .player-loading,
        .player-error {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        /* 返回预告片按钮 */
        .back-to-trailer-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 20;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }

        .back-to-trailer-btn:hover {
          background: rgba(0, 0, 0, 0.9);
          border-color: rgba(229, 9, 20, 0.5);
          color: #e50914;
        }

        .movie-info-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 40px;
          margin-bottom: 60px;
        }

        .movie-poster {
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .movie-details h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .movie-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        .movie-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #e50914;
          color: #fff;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
        }

        .movie-genres {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .movie-genre {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .movie-description {
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .movie-cast {
          margin-bottom: 32px;
        }

        .movie-cast strong {
          color: #fff;
          font-weight: 600;
          display: block;
          margin-bottom: 8px;
        }

        .cast-names {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          line-height: 1.6;
        }

        .related-movies {
          margin-top: 60px;
          padding-bottom: 80px;
          background: #0a0c12;
          position: relative;
          z-index: 10;
        }

        .related-movies h3 {
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

        .related-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        .related-card {
          position: relative;
          background: transparent;
          border-radius: 0;
          overflow: hidden;
          transition: transform 0.25s ease;
          cursor: pointer;
        }

        .related-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.4);
        }

        .related-poster {
          width: 100%;
          aspect-ratio: 2/3;
          object-fit: cover;
          border-radius: 0;
          display: block;
          transition: transform 0.25s ease;
        }

        .related-card:hover .related-poster {
          transform: scale(1.05);
        }

        .related-overlay {
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

        .related-card:hover .related-overlay {
          opacity: 1;
        }

        .related-title {
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

        .related-meta {
          display: none;
        }

        .sponsor-section {
          padding: 20px 0;
          margin: 40px 0;
          text-align: center;
          position: relative;
          padding-bottom: 60px;
        }

        .sponsor-section::after {
          content: '';
          position: absolute;
          bottom: 0;
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



        .sponsor-grid {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .sponsor-logo {
          height: 120px;
          width: auto;
          max-width: 300px;
          transition: transform 0.3s ease;
        }

        .sponsor-logo:hover {
          transform: scale(1.1);
        }

        /* Movie Info Section - 新增样式 */
        .movie-info-section {
          padding: 32px 0;
          margin: 40px 0 60px 0;
        }

        .movie-info-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 24px;
          color: #ffffff;
          text-align: center;
        }

        /* Mobile tidy layout (<= 640px) — cleaner, premium look */
        @media (max-width: 640px) {
          /* Header */
          :root{
            --icon: 32px;         /* 两个图标的热区（正方形） */
            --gap: 6px;           /* 分隔线两侧的间隔（改这里） */
            --sep-h: 18px;        /* 分隔线高度 */
            --search-nudge: 12px;  /* 搜索图标光学位置微调：正值向右，负值向左 */
          }
          
          .ezm-headerInner { height: 50px; padding: 0; gap: 0; position: relative; justify-content: space-between; width: 100%; }
          .ezm-header { padding-top: env(safe-area-inset-top); background: rgba(0,0,0,.45); backdrop-filter: saturate(140%) blur(6px); }
          
          /* 关键：让 brandGroup 横跨整个 header（有 left 也要有 right） */
          .ezm-brandGroup {
            position: absolute !important;
            left: 0; right: 0;                 /* 让它铺满整行 */
            top: 0; bottom: 0;
            margin: 0; padding: 0;
            display: block;
          }

          /* 汉堡固定在最左侧垂直居中 */
          .ezm-hamburger {
            position: absolute;
            left: 8px; top: 50%;
            transform: translateY(-50%);
            margin: 0; padding: 8px;
            z-index: 11;
          }
          .ezm-hamburger svg { width: 20px; height: 20px; }

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
          .ezm-headerActions{
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
          .ezm-headerActions > * { margin: 0 !important; }

          /* 两个图标都占各自的列，尺寸一致、内容绝对居中 */
          .ezm-lineIcon, .ezm-searchBtn{
            width: var(--icon); height: var(--icon);
            display: grid; place-items: center;
            padding: 0 !important; border: 0; background: transparent;
          }
          .ezm-lineIcon{ background:#00c300 !important; border-radius:8px; }

          /* 分隔线占第 3 列，不带任何左右 margin */
          .ezm-separator{
            grid-column: 3;
            width: 1px; height: var(--sep-h);
            margin: 0 !important;
            background: linear-gradient(180deg, rgba(255,255,255,.32), rgba(255,255,255,.12));
          }

          /* 内部图标尺寸（搜索图标更大） */
          .ezm-lineImg  { width: 20px; height: 20px; display: block; }
          .ezm-btnIcon  { width: 18px; height: 18px; display: block; }
          .ezm-searchBtn .ezm-btnIcon { width: 22px; height: 22px; }

          /* 微调搜索图标的"光学位置"：只移动搜索图标的 SVG，本体点击热区不变 */
          .ezm-headerActions .ezm-searchBtn .ezm-btnIcon {
            transform: translateX(var(--search-nudge));
            transition: transform .25s ease;
          }

          /* 保留 hover 放大效果——叠加位移与缩放 */
          .ezm-searchBtn:hover .ezm-btnIcon {
            transform: translateX(var(--search-nudge)) scale(1.1);
          }

          /* Hide sponsor logos on mobile */
          .ezm-sponsorBar { display: none !important; }
          
          /* Hide navigation on mobile */
          .ezm-nav { display: none !important; }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .movie-header-inner {
            padding: 0 20px;
          }

          .movie-content {
            padding-left: 16px;
            padding-right: 16px;
          }

          /* 移动端播放按钮样式 */
          .play-overlay {
            opacity: 1; /* 移动端始终显示 */
            background: rgba(0, 0, 0, 0.4);
          }

          .play-button {
            padding: 12px 24px;
            font-size: 16px;
            min-width: 160px;
            gap: 8px;
          }

          .play-icon {
            font-size: 20px;
          }

          .movie-info-section {
            padding: 16px 12px;
            margin: 12px 0 40px 0;
          }

          .movie-info-title {
            font-size: 1.25rem;
            margin-bottom: 20px;
          }

          .movie-info-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            text-align: center;
          }

          .movie-poster {
            width: 180px;
            margin: 0 auto;
            display: block;
          }

          .movie-details {
            text-align: center;
          }

          .movie-details h1 {
            font-size: 1.5rem;
            margin-bottom: 12px;
            line-height: 1.3;
          }

          .movie-meta {
            justify-content: center;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 16px;
            font-size: 13px;
          }

          .movie-genres {
            justify-content: center;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 20px;
          }

          .movie-genre {
            font-size: 11px;
            padding: 4px 10px;
          }

          .movie-description {
            text-align: center;
            font-size: 14px;
            margin-bottom: 20px;
          }

          .movie-cast {
            margin-bottom: 20px;
            text-align: center;
          }

          .movie-cast strong {
            font-size: 14px;
          }

          .cast-names {
            font-size: 13px;
            text-align: center;
          }

          .movie-details > div:last-child {
            text-align: center;
            font-size: 14px;
            line-height: 1.6;
            margin-top: 16px;
          }

          .movie-details > div:last-child strong {
            font-size: 14px;
            color: #ffffff;
          }

          .related-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          /* 手机版直接显示overlay和标题，不需要hover */
          .related-overlay {
            opacity: 1;
            height: 40px;
            padding: 4px 2px;
          }

          /* 手机版电影标题字体大小和粗细 */
          .related-title {
            font-size: 0.75rem;
            font-weight: 500;
            line-height: 1.1;
          }

          /* 禁用手机版hover效果 */
          .related-card:hover {
            transform: none;
            box-shadow: none;
          }

          .related-card:hover .related-poster {
            transform: none;
          }

          .sponsor-section {
            padding: 8px 0;
            padding-bottom: 40px;
          }

          .sponsor-grid {
            gap: 12px;
            padding: 0 16px;
            flex-wrap: nowrap;
            justify-content: flex-start;
            overflow-x: auto;                 /* 超出可横向滚动 */
            -webkit-overflow-scrolling: touch; /* 惯性滚动 */
            scroll-snap-type: x mandatory;     /* 吸附对齐 */
            scrollbar-width: none;             /* 隐藏滚动条(Firefox) */
          }
          .sponsor-grid::-webkit-scrollbar{ display:none; } /* 隐藏滚动条(WebKit) */

          /* 两个并排：每个占(屏宽-左右边距-间距)/2 */
          .sponsor-logo {
            width: calc((100vw - 32px - 12px) / 2);
            height: auto;
            flex: 0 0 calc((100vw - 32px - 12px) / 2);
            object-fit: contain;
            scroll-snap-align: start;          /* 滚动时对齐项起始 */
          }
        }
      `}</style>

      {/* Header - 使用网站统一Header */}
      <SiteHeader onMenuClick={() => setIsMenuOpen(true)} />

      <SponsorMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <main className="movie-content">
        {/* Movie Player Section - 极简新播放器（全宽、无顶栏干扰） */}
        <section className="movie-hero --edge">
          <style>{`
            /* 播放器区域完美居中对齐 */
            .movie-page .--edge {
              position: relative;
              left: 50%;
              right: 50%;
              margin-left: -50vw;
              margin-right: -50vw;
              width: 100vw;
              max-width: 100vw;
            }
            /* 确保播放器内容正确居中 */
            .movie-page .--edge .ezp-root {
              margin: 0 auto;
              position: relative;
            }
            /* 恢复其他部分的正常容器样式 */
            .movie-page .movie-content > *:not(.--edge) {
              max-width: 1200px !important;
              margin-left: auto !important;
              margin-right: auto !important;
              padding-left: 20px !important;
              padding-right: 20px !important;
            }
            /* 彻底屏蔽任何遗留的顶角标签/返回按钮 */
            .movie-page [class*="trailer"],
            .movie-page [class*="sample"],
            .movie-page [class*="badge"],
            .movie-page [class*="chip"],
            .movie-page [class*="back"],
            .movie-page button[aria-label="Back"],
            .movie-page .ezp-topbar { 
              display: none !important;
            }
          `}</style>
          
          {isPlayLoading && (
            <div style={{height: '56.25vw', maxHeight: 520, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Loading size="large" message="กำลังเตรียมเล่น..." />
            </div>
          )}
          {playError && (
            <div style={{height: '56.25vw', maxHeight: 520, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <ErrorFallback 
                message="ไม่สามารถเล่นได้ กรุณาลองใหม่อีกครั้ง"
                onRetry={() => window.location.reload()}
              />
            </div>
          )}
          {playData && (
            <PlayerShell
              data={playData}
              onProgress={(sec) => { lastPosRef.current = sec; }}
              fullBleed={true}                  // ✅ 铺满 100vw
              accent="#21d0c6"                  // ✅ 青绿主色  
              showTopBar={false}                // ✅ 顶栏隐藏（无"← ตัวอย่าง"等）
              showBack={false}                  // ✅ 无返回按钮
              showMenu={false}                  // ✅ 无菜单按钮
            />
          )}
        </section>

        {/* Sponsor Section */}
        <section className="sponsor-section">
          <div className="sponsor-grid">
            <img 
              src="https://ezmovie.me/build/web/ez-movie/img/banner-register-ez-casino.png?v=1" 
              alt="EZ Casino Banner" 
              className="sponsor-logo"
            />
            <img 
              src="https://ezmovie.me/build/web/ez-movie/img/banner-register-ez-slot.png?v=1" 
              alt="EZ Slot Banner" 
              className="sponsor-logo"
            />
            <img 
              src="https://ezmovie.me/build/web/ez-movie/img/banner-register-ez-lotto.png?v=1" 
              alt="EZ Lotto Banner" 
              className="sponsor-logo"
            />
          </div>
        </section>

        {/* Movie Info Section - 移动自原标签页 */}
        <section className="movie-info-section">
          <h3 className="movie-info-title">ข้อมูลหนัง</h3>
          <div className="movie-info-grid">
            <div>
              <img src={movie.poster} alt={movie.title} className="movie-poster" />
            </div>
            
            <div className="movie-details">
              <h1>{movie.title}</h1>
              <div className="movie-meta">
                <span>{movie.year}</span>
                <span>•</span>
                <span>{movie.duration}</span>
                <span>•</span>
                <div className="movie-rating">
                  ⭐ {movie.rating}
                </div>
              </div>

              <div className="movie-genres">
                {movie.genre.map((genre, index) => (
                  <span key={index} className="movie-genre">
                    {genre}
                  </span>
                ))}
              </div>

              <p className="movie-description">{movie.description}</p>

              <div className="movie-cast">
                <strong>นักแสดง :</strong>
                <div className="cast-names">
                  {movie.cast.map((actor, index) => actor.name).join(', ')}
                </div>
              </div>

              <div>
                <strong>ผู้กำกับ:</strong> {movie.director}<br />
                <strong>สตูดิโอ:</strong> {movie.studio}
              </div>
            </div>
          </div>
        </section>

        {/* Related Movies */}
        <section className="related-movies">
          <h3>หนังที่เกี่ยวข้อง</h3>
          <div className="related-grid">
            {relatedMovies.map((relatedMovie) => (
              <div 
                key={relatedMovie.id} 
                className="related-card"
                onClick={() => navigate(`/movie/${relatedMovie.id}`)}
              >
                <img 
                  src={relatedMovie.poster} 
                  alt={relatedMovie.title} 
                  className="related-poster"
                  loading="lazy"
                />
                <div className="related-overlay">
                  <div className="related-title">{relatedMovie.title}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer - 使用网站统一Footer */}
      <SiteFooter />
    </div>
  );
};

// SiteHeader Component - 复制自首页
const SiteHeader = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const navItems = [
    'หน้าหลัก',
    'หนังใหม่',
    'ซีรีส์',
    'อนิเมะ',
    'ประเภทหนัง',
    'คลิปวิดีโอ',
    'นักแสดง',
  ];

  return (
    <header className="ezm-header">
      <div className="ezm-container">
        <div className="ezm-headerInner">
          {/* 左侧：汉堡 + LOGO（图片） */}
          <div className="ezm-brandGroup">
            <button 
              className="ezm-hamburger"
              onClick={onMenuClick}
              aria-label="打开菜单"
            >
              <svg viewBox="0 0 32 32">
                <path
                  d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
                  className="ezm-line ezm-line-top-bottom"
                ></path>
                <path d="M7 16 27 16" className="ezm-line"></path>
              </svg>
            </button>
            <a href="/" className="ezm-navbar-brand" aria-label="EZ Movie">
              <img className="ezm-logoImg" src="/images/logos/ez-movie-logo-clean.svg" alt="EZ Movie" />
            </a>
          </div>

          {/* 中间：主导航 */}
          <nav className="ezm-nav">
            {navItems.map((item, i) => (
              <a key={item} className={`ezm-navItem ${i===0 ? 'is-active' : ''}`} href="#">{item}</a>
            ))}
          </nav>

          {/* 右侧：LINE + 赞助 LOGO + 搜索 */}
          <div className="ezm-headerActions">
            {/* LINE（移动端替换为站点图片地址） */}
            <a href="#" className="ezm-lineIcon ezm-animatedBtn" title="LINE">
              <img src="https://ezmovie.me/media/cache/strip/202310/block/88b1c84ceef85a444e84dc0af24b0e82.png" alt="LINE" className="ezm-lineImg" />
            </a>

            {/* 分隔线 */}
            <div className="ezm-separator"></div>
            
            {/* 赞助 LOGO（桌面显示） */}
            <div className="ezm-sponsorBar ezm-show-lg">
              <a className="ezm-sponsorLogo ezm-animatedBtn" href="#"><img src="https://ezmovie.me/build/web/ez-movie/img/sponsor-logo-casino.png?v=2?v=1" alt="Casino" /></a>
              <a className="ezm-sponsorLogo ezm-animatedBtn" href="#"><img src="https://ezmovie.me/build/web/ez-movie/img/sponsor-logo-slot.png?v=1" alt="Slot" /></a>
              <a className="ezm-sponsorLogo ezm-animatedBtn" href="#"><img src="https://ezmovie.me/build/web/ez-movie/img/sponsor-logo-lotto.png?v=1" alt="Lotto" /></a>
            </div>

            {/* 搜索按钮 */}
            <button className="ezm-searchBtn ezm-animatedBtn" aria-label="search">
              <IconSearch className="ezm-btnIcon" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// SiteFooter Component - 复制自首页
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

export default MoviePlayer;

import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { configureHttp } from "../packages/sdk/src";
import "./global.css";
import "./utils/scrollAnimations";

// 配置SDK的API base URL - 使用Vite代理相对路径
configureHttp({
  baseURL: "/v1", // 关键：走Vite代理，消除CORS问题
  withCredentials: false, // 关键：不带凭证，避免触发CORS严格校验
  timeout: 10000,
});

// Components
import EZMovieHome from "./components/homev2/index";

import ForeignMovies from "./components/catalog/ForeignMovies";
import MoviePlayer from "./components/movie/MoviePlayer";
import WatchPage from "./components/watch/WatchPage";
import PlayTestPage from "./components/test/PlayTestPage";
import SimpleTest from "./components/test/SimpleTest";
import PlayerDebug from "./components/test/PlayerDebug";
import SimpleWatchPage from "./components/test/SimpleWatchPage";
import RouteTracker from "./components/common/RouteTracker";

// New API-integrated components
import MovieCatalog from "./components/catalog/MovieCatalog";
import MovieDetail from "./components/movie/MovieDetail";
import APIIntegrationDemo from "./components/demo/APIIntegrationDemo";
import CastPage from "./components/catalog/CastPage.tsx";

// 创建QueryClient实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分钟
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <BrowserRouter>
      <RouteTracker />
      <Routes>
        {/* Restore original hardcoded homepage as default */}
        <Route path="/" element={<EZMovieHome />} />
        {/* Keep API-powered home available for testing */}

        <Route path="/simple-test" element={<SimpleTest />} />
        <Route path="/debug-player" element={<PlayerDebug />} />
        <Route path="/simple-watch/:id" element={<SimpleWatchPage />} />

        <Route path="/หนังฝรั่ง" element={<ForeignMovies />} />
        <Route path="/movie/:movieId" element={<MoviePlayer />} />
        <Route path="/watch/:id" element={<WatchPage />} />
        <Route path="/test-play" element={<PlayTestPage />} />

        {/* New API-integrated routes */}
        <Route path="/catalog" element={<MovieCatalog />} />
        <Route path="/catalog/:genre" element={<MovieCatalog />} />
        <Route path="/movie-detail/:movieId" element={<MovieDetail />} />
        <Route path="/cast/:castId" element={<CastPage />} />
        <Route path="/demo" element={<APIIntegrationDemo />} />
      </Routes>
    </BrowserRouter>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);

import React, { useEffect } from "react";
import {
  useHomeData,
  useBrandConfig,
  useSponsorPlacements,
} from "../../hooks/useMovies";
import Loading, { HeroSkeleton, MovieCardSkeleton } from "../common/Loading";
import { ErrorFallback, NetworkError } from "../common/ErrorBoundary";
import { Track } from "../../lib/track";
import StartPlayButton from "../common/StartPlayButton";

// 简化的首页组件示例 - 展示如何使用真实API替换Mock数据
const HomeWithAPI: React.FC = () => {
  // 使用API hooks获取数据
  const {
    data: homeData,
    isLoading: homeLoading,
    error: homeError,
    refetch: refetchHome,
  } = useHomeData();

  const { data: brandConfig, isLoading: brandLoading } = useBrandConfig();

  const { data: sponsors, isLoading: sponsorsLoading } =
    useSponsorPlacements("home");

  // 错误处理
  if (homeError) {
    return <NetworkError onRetry={() => refetchHome()} />;
  }

  // 主要数据加载中
  if (homeLoading) {
    return (
      <div className="min-h-screen bg-[#0a0c12]">
        <HeroSkeleton />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 渲染真实数据
  return (
    <div className="min-h-screen bg-[#0a0c12] text-white">
      {/* 动态品牌配置 */}
      {brandConfig && (
        <style>
          {`:root {
            --primary-color: ${brandConfig.palette.primary};
            --bg-color: ${brandConfig.palette.bg};
            --text-color: ${brandConfig.palette.text};
          }`}
        </style>
      )}

      {/* Header - 使用品牌配置 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-90 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {brandConfig?.logo?.light && (
              <img
                src={brandConfig.logo.light}
                alt={brandConfig.name}
                className="h-8"
              />
            )}
            <span className="text-xl font-bold">
              {brandConfig?.name || "EZ Movie"}
            </span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="hover:text-red-500">
              หน้าหลัก
            </a>
            <a href="/หนังฝรั่ง" className="hover:text-red-500">
              หนังฝรั่ง
            </a>
            <a href="#" className="hover:text-red-500">
              ซีรีส์
            </a>
            <a href="#" className="hover:text-red-500">
              อนิเมะ
            </a>
            <a
              href="/admin/countries"
              className="hover:text-red-500 bg-blue-600 px-3 py-1 rounded-lg"
            >
              🌍 Countries
            </a>
          </nav>
        </div>
      </header>

      {/* Mobile Navigation - Countries Link */}
      <div className="md:hidden pt-16 pb-4 bg-black bg-opacity-90">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <a
              href="/admin/countries"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              🌍 Countries Management
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section - 使用API数据 */}
      <section className="pt-16 relative min-h-[600px]">
        {homeData?.sections?.find((s: any) => s.kind === "hero")
          ?.items?.[0] && (
          <div className="relative h-[600px] overflow-hidden">
            <img
              src={
                homeData.sections.find((s: any) => s.kind === "hero")?.items[0]
                  .backdrop
              }
              alt={
                homeData.sections.find((s: any) => s.kind === "hero")?.items[0]
                  .title
              }
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent">
              <div className="container mx-auto px-4 h-full flex items-center">
                <div className="max-w-lg">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {
                      homeData.sections.find((s: any) => s.kind === "hero")
                        ?.items[0].title
                    }
                  </h1>
                  <p className="text-lg mb-6 opacity-90">
                    {
                      homeData.sections.find((s: any) => s.kind === "hero")
                        ?.items[0].synopsis
                    }
                  </p>
                  <div className="flex space-x-4">
                    <StartPlayButton
                      movieId={
                        homeData.sections.find((s: any) => s.kind === "hero")
                          ?.items[0].id || "m1"
                      }
                    />
                    <button className="bg-gray-600 bg-opacity-50 hover:bg-opacity-70 px-8 py-3 rounded-lg font-semibold">
                      + รายการของฉัน
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 赞助商横幅 - 使用API数据 */}
      {sponsors && sponsors.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-6">
              {sponsors.map((sponsor: any) => (
                <a
                  key={sponsor.id}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:scale-105 transition-transform"
                  onClick={() => {
                    Track.sponsorClick(sponsor.placement, sponsor.id);
                  }}
                >
                  <img
                    src={sponsor.image}
                    alt={sponsor.title}
                    className="h-16 object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 内容版块 - 使用API数据 */}
      <main className="container mx-auto px-4 py-8 space-y-12">
        {homeData?.sections?.map((section: any) => {
          if (section.kind === "hero") return null; // Hero已在上方处理

          return (
            <section key={section.id}>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                {section.title}
                {section.kind === "top10" && section.country && (
                  <span className="text-lg ml-2 opacity-75">
                    ({section.country})
                  </span>
                )}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {section.items?.map((item: any, index: number) => (
                  <div
                    key={item.id}
                    className="relative group cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => {
                      // 追踪电影详情查看
                      Track.movieDetailView(item.id, `/movie/${item.id}`);
                      // 跳转到详情页
                      window.location.href = `/movie/${item.id}`;
                    }}
                  >
                    {/* 排名显示（Top 10） */}
                    {section.kind === "top10" && item.rank && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                        #{item.rank}
                      </div>
                    )}

                    <img
                      src={item.poster || item.backdrop}
                      alt={item.title}
                      className="w-full aspect-[2/3] object-cover rounded-lg"
                    />

                    <div className="mt-2">
                      <h3 className="font-semibold text-sm line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                        {item.year && <span>{item.year}</span>}
                        {item.rating && <span>⭐ {item.rating}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-gray-400 mb-4">
              © 2024 {brandConfig?.name || "EZ Movie"}. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a
                href="/admin/countries"
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
              >
                🌍 Countries Management
              </a>
              <a
                href="/admin"
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                Admin Panel
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeWithAPI;

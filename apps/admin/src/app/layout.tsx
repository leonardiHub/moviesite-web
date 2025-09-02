import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "MovieSite Admin - 专业电影网站管理后台",
  description:
    "企业级电影网站后台管理系统，提供内容管理、数据分析、用户管理等功能",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body
        className={`${montserrat.variable} font-montserrat min-h-screen bg-slate-50 antialiased text-slate-900`}
      >
        {children}
      </body>
    </html>
  );
}

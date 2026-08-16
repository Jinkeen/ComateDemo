import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Comate.AI",
  description: "本地虚拟数据驱动的 AI 招聘工作流原型",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '旅行スケジューラー',
  description: '家族旅行のスケジュールを簡単に管理',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}

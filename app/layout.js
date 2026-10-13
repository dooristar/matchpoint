import './globals.css';
export const metadata = { title: '코트메이트 (개발 데모)', description: '테니스 매칭 · NTRP 랭크' };
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };
export default function RootLayout({ children }) {
  return (<html lang="ko"><body>{children}</body></html>);
}

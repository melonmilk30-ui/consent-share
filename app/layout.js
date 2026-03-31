import "./globals.css";

export const metadata = {
  title: "생글생글 - 에듀테크 개인정보 동의서",
  description: "전국 선생님들이 등록한 에듀테크 개인정보 동의서를 검색하고 hwpx로 바로 다운로드하세요.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

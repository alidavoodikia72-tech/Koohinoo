import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "Koohinoo | سامانه مدیریت باشگاه کوهنوردی",
  description:
    "کوهینو، سامانه مدیریت باشگاه‌های کوهنوردی برای ثبت صعود، مدیریت اعضا، لیدرها، فروشگاه تجهیزات و مجله آموزشی.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} bg-slate-950 font-sans text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}

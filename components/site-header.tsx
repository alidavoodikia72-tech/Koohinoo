"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "صفحه اصلی", href: "/" },
  { label: "باشگاه‌ها", href: "/clubs" },
  { label: "فروشگاه", href: "/store" },
  { label: "مجله", href: "/magazine" },
  { label: "صعودها", href: "/trips" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500 text-sm font-bold text-slate-950">
              K
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Koohinoo</div>
              <div className="text-xs text-slate-400">
                سامانه مدیریت باشگاه کوهنوردی
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm transition ${
                    active
                      ? "bg-cyan-500/15 text-cyan-300"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 md:block">
              ورود
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white transition hover:bg-white/5 md:hidden"
            >
              {isMenuOpen ? "بستن" : "منو"}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-white/10 py-3 md:hidden">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`rounded-md px-2 py-2 text-sm transition ${
                      active
                        ? "bg-cyan-500/15 text-cyan-300"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <button className="mt-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400">
                ورود
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

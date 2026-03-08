"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { moduleCards, navItems } from "~/lib/site";

export function AppShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const moduleCount = moduleCards.length;

  function isActive(href: string) {
    if (href === "/") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(103,211,255,0.14),transparent_25%),radial-gradient(circle_at_top_right,rgba(255,213,138,0.12),transparent_20%),linear-gradient(180deg,#0c1729_0%,#08111d_58%,#07101a_100%)] text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1480px] grid-cols-1 lg:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-slate-950/35 px-5 py-6 backdrop-blur lg:border-b-0 lg:border-r">
          <Link
            href="/"
            className="block text-lg font-semibold tracking-[0.14em] text-white"
          >
            Neuro Explorer
          </Link>
          <p className="mt-2 max-w-[14rem] text-sm leading-6 text-slate-400">
            Typed App Router interface for neuroscience simulations, anatomy, and
            Cloudflare-backed AI study tools.
          </p>
          <div className="mt-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-100">
            {moduleCount} modules
          </div>

          <nav className="mt-8 flex flex-wrap gap-2 lg:flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  isActive(item.href)
                    ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/30 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-3xl border border-cyan-300/15 bg-cyan-300/8 p-4 text-sm text-slate-300">
            <p className="font-medium text-cyan-100">How it is built</p>
            <p className="mt-2 leading-6 text-slate-300/85">
              The UI and API now live in one Next.js app. Deterministic labs run
              through shared TypeScript engines, and the AI routes talk to
              Cloudflare from the server side.
            </p>
          </div>
        </aside>

        <main className="px-5 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

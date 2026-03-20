'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { moduleCards, navItems } from '~/lib/site';

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
	const pathname = usePathname();
	const moduleCount = moduleCards.length;

	function isActive(href: string) {
		if (href === '/') {
			return pathname === href;
		}

		return pathname === href || pathname.startsWith(`${href}/`);
	}

	return (
		<div className="relative z-10 min-h-screen text-[var(--surface-ink)]">
			<div className="mx-auto grid min-h-screen max-w-[1520px] grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)] xl:grid-cols-[248px_minmax(0,1fr)]">
				<aside className="border-b border-[var(--surface-border)] bg-[var(--surface-shell)] px-4 py-5 backdrop-blur-xl sm:px-5 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-b-0 lg:py-6">
					<Link href="/" className="block text-base font-semibold tracking-[0.14em] text-white sm:text-lg">
						Neuro Explorer
					</Link>
					<p className="mt-2 max-w-58 text-sm leading-6 text-slate-300/88">
						Neuroscience teaching and exploration platform for the University of Amsterdam and its clinical partners. No use of LLMs.
					</p>
					<div className="mt-4 inline-flex min-h-10 items-center rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-100">
						{moduleCount} modules
					</div>

					<nav className="mt-6 grid gap-2">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								aria-current={isActive(item.href) ? 'page' : undefined}
								className={`inline-flex min-h-12 items-center rounded-[18px] border px-4 py-3 text-sm font-medium transition ${
									isActive(item.href)
										? 'border-cyan-300/28 bg-cyan-300/12 text-cyan-100'
										: 'border-white/8 bg-white/4 text-slate-300 hover:border-cyan-300/24 hover:bg-white/8 hover:text-white'
								}`}
							>
								{item.label}
							</Link>
						))}
					</nav>

					<div className="mt-4 grid gap-2">
						<a
							href="https://legal.bluesix.dev"
							target="_blank"
							rel="noreferrer"
							className="inline-flex min-h-12 items-center rounded-[18px] border border-white/8 bg-white/4 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-cyan-300/24 hover:bg-white/8 hover:text-white"
						>
							Legal
						</a>
					</div>

					<div className="mt-6 rounded-[22px] border border-cyan-300/14 bg-cyan-300/8 p-4 text-sm text-slate-300">
						<p className="font-medium text-cyan-100">How it is built</p>
						<p className="mt-2 leading-6 text-slate-300/85">
							The UI and API are implemented in Next.js. Deterministic labs run through shared TypeScript engines, and the AI routes
							talk to Cloudflare from the server side.
						</p>
					</div>
				</aside>

				<main className="app-stage">
					<div className="relative mx-auto max-w-[1180px]">{children}</div>
				</main>
			</div>
		</div>
	);
}

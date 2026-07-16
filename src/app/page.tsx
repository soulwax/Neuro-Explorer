import Link from 'next/link';
import { moduleCards } from '~/lib/site';

export default function HomePage() {
	return (
		<div className="app-page-stack">
			<section className="app-surface app-surface--hero">
				<p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">Next.js Platform</p>
				<h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-[3.35rem]">Neuro Explorer</h1>
				<p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
					Deterministic simulations, server-backed labs, and Cloudflare AI-powered experiences now share the same App Router shell and
					internal <code>/api/*</code> contract.
				</p>
				<div className="mt-5 flex flex-wrap gap-3">
					<Link href="/visual-field" className="glass-btn glass-btn--primary">
						Open Visual Field Localizer
					</Link>
					<Link href="/brain-atlas" className="glass-btn glass-btn--secondary">
						Open Brain Atlas
					</Link>
					<Link href="/ask" className="glass-btn glass-btn--secondary">
						Open Ask
					</Link>
				</div>
			</section>

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{moduleCards.map((module) => {
					const cardBody = (
						<>
							<div className="flex items-center justify-between gap-3">
								<h2 className="text-xl font-semibold text-white">{module.title}</h2>
								<span className="glass-badge border-cyan-300/22 bg-cyan-300/15 text-cyan-100">
									{module.badge}
								</span>
							</div>
							<p className="mt-3 text-sm leading-6 text-slate-300">{module.description}</p>
						</>
					);

					return module.href ? (
						<Link
							key={module.slug}
							href={module.href}
							className="app-surface transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/8"
						>
							{cardBody}
						</Link>
					) : (
						<div key={module.slug} className="app-surface bg-[var(--surface-panel-subtle)]">
							{cardBody}
						</div>
					);
				})}
			</section>

			<section className="app-surface">
				<h2 className="text-xl font-semibold text-white">Architecture stance</h2>
				<p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
					This is intentionally not a Prisma/Auth/tRPC reset. The important move was consolidating the product around App Router pages and
					internal API route handlers while keeping the simulation engines in TypeScript.
				</p>
				<p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
					`Vision` and `Ask` still rely on Cloudflare AI, but they now follow the same internal API contract as the rest of the site and
					ship with the same Next.js deployment unit.
				</p>
			</section>
		</div>
	);
}

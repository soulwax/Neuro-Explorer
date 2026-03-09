import Link from 'next/link';
import { moduleCards } from '~/lib/site';

export default function HomePage() {
	const moduleCount = moduleCards.length;

	return (
		<div className="space-y-6">
			<section className="rounded-[32px] border border-white/10 bg-white/6 p-6 shadow-[0_18px_50px_rgba(3,10,20,0.24)] backdrop-blur sm:p-8">
				<p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">Next.js Platform</p>
				<h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">Neuro Explorer</h1>
				<p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
					Deterministic simulations, server-backed labs, and Cloudflare AI-powered experiences now share the same App Router shell and
					internal <code>/api/*</code> contract.
				</p>
				<div className="mt-6 flex flex-wrap gap-3">
					<Link
						href="/visual-field"
						className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_28px_rgba(103,211,255,0.24)] transition hover:-translate-y-0.5"
					>
						Open Visual Field Localizer
					</Link>
					<Link
						href="/brain-atlas"
						className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
					>
						Open Brain Atlas
					</Link>
					<Link
						href="/ask"
						className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
					>
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
								<span className="rounded-full bg-cyan-300/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-100">
									{module.badge}
								</span>
							</div>
							<p className="mt-4 text-sm leading-7 text-slate-300">{module.description}</p>
						</>
					);

					return module.href ? (
						<Link
							key={module.slug}
							href={module.href}
							className="rounded-[28px] border border-white/10 bg-white/6 p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/8"
						>
							{cardBody}
						</Link>
					) : (
						<div key={module.slug} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
							{cardBody}
						</div>
					);
				})}
			</section>

			<section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
				<h2 className="text-xl font-semibold text-white">Architecture stance</h2>
				<p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
					This is intentionally not a Prisma/Auth/tRPC reset. The important move was consolidating the product around App Router pages and
					internal API route handlers while keeping the simulation engines in TypeScript.
				</p>
				<p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
					`Vision` and `Ask` still rely on Cloudflare AI, but they now follow the same internal API contract as the rest of the site and
					ship with the same Next.js deployment unit.
				</p>
			</section>
		</div>
	);
}

import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

function ModuleCard({ title, description, to, icon: Icon, accent, area }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)] transition hover:-translate-y-1 hover:border-[#07612d]/30 hover:shadow-[0_18px_36px_rgba(29,29,27,0.1)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <span className={`flex size-13 items-center justify-center rounded-2xl ${accent}`}>
          <Icon size={28} />
        </span>
        <span className="rounded-full bg-[#F4F4F4] px-3 py-1 text-xs font-bold text-[#1d1d1b]/65">{area}</span>
      </div>

      <h3 className="mt-5 text-xl font-bold text-[#07612d]">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-[#1d1d1b]/70">{description}</p>

      <Link className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#07612d] px-4 text-sm font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.18)] transition group-hover:bg-[#064f26]" to={to}>
        Entrar al módulo <ArrowRight size={17} />
      </Link>
    </article>
  )
}

export default ModuleCard

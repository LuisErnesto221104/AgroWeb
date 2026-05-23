function StatCard({ title, value, detail, icon: Icon, tone = 'primary' }) {
  const tones = {
    primary: 'bg-[#07612d]/10 text-[#07612d]',
    success: 'bg-[#4CAF50]/12 text-[#2f8f36]',
    warning: 'bg-[#FFA000]/12 text-[#a06400]',
    danger: 'bg-[#D32F2F]/10 text-[#D32F2F]',
    info: 'bg-[#1f7a8c]/10 text-[#1f7a8c]',
  }

  return (
    <article className="min-w-0 rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#98a287]">{title}</p>
          <strong className="mt-2 block break-words text-2xl font-bold text-[#1d1d1b] md:text-3xl">{value}</strong>
        </div>
        <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon size={25} />
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#1d1d1b]/70">{detail}</p>
    </article>
  )
}

export default StatCard

function ReportCard({ title, subtitle, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
      <div className="min-w-0">
        <h2 className="break-words text-lg font-bold text-[#07612d] md:text-xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-[#98a287]">{subtitle}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export default ReportCard

import { Download } from 'lucide-react'

function ExportReportButton({ onExport }) {
  return (
    <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#07612d]/25 bg-white px-5 text-sm font-bold text-[#07612d] sm:w-auto" onClick={onExport} type="button">
      <Download size={18} /> Exportar PDF
    </button>
  )
}

export default ExportReportButton

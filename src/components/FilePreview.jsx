import { ExternalLink, FileText } from 'lucide-react';

function obtenerTipoArchivo(archivo) {
  const urlDatos = archivo?.dataUrl ?? '';
  const name = archivo?.name ?? '';
  if (urlDatos.startsWith('data:image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(name)) return 'image';
  if (urlDatos.startsWith('data:application/pdf') || /\.pdf$/i.test(name)) return 'pdf';
  return 'file';
}

function VistaPreviaArchivo({ file: archivo, title: titulo = 'Previsualización del archivo' }) {
  if (!archivo?.dataUrl) return null;

  const tipoArchivo = obtenerTipoArchivo(archivo);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[#98a287]/18 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#98a287]/18 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#07612d]">{titulo}</p>
          <p className="mt-1 break-words text-xs font-semibold text-[#98a287]">{archivo.name}</p>
        </div>
        <a className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#07612d] px-4 text-sm font-bold text-white" href={archivo.dataUrl} rel="noreferrer" target="_blank">
          <ExternalLink size={16} /> Abrir
        </a>
      </div>

      {tipoArchivo === 'image' ?
      <div className="flex max-h-[520px] items-center justify-center bg-[#F4F4F4] p-3">
          <img alt={archivo.name} className="max-h-[480px] w-full rounded-xl object-contain" src={archivo.dataUrl} />
        </div> :
      null}

      {tipoArchivo === 'pdf' ? <iframe className="h-96 w-full bg-white" src={archivo.dataUrl} title={titulo} /> : null}

      {tipoArchivo === 'file' ?
      <div className="flex min-h-40 flex-col items-center justify-center gap-3 bg-[#F4F4F4] p-6 text-center text-sm font-semibold text-[#1d1d1b]/70">
          <FileText className="text-[#07612d]" size={34} />
          Este tipo de archivo no tiene previsualización disponible.
        </div> :
      null}
    </div>);

}

export default VistaPreviaArchivo;

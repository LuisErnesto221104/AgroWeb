import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, CalendarDays, Download, Edit3, FileText, Landmark, Map, MapPin, Skull, UserRound, Weight } from 'lucide-react'
import AnimalStatusBadge from './AnimalStatusBadge'

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-[#F4F4F4] p-4">
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#98a287]">
        <Icon size={16} /> {label}
      </span>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#1d1d1b]">{value || 'Sin información'}</p>
    </div>
  )
}

function getPreviousOwner(owner) {
  if (typeof owner === 'string') {
    return {
      nombre: owner,
      documentoIdentificacion: '',
      rfc: '',
      rancho: '',
      ciudad: '',
      estado: '',
      documentoPdf: null,
    }
  }

  return owner ?? {}
}

function AnimalDetail({ animals, onRequestDelete }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const animal = animals.find((item) => item.id === Number(id))
  const previousOwner = getPreviousOwner(animal?.duenosAnteriores)

  if (!animal) {
    return (
      <section className="rounded-2xl border border-[#98a287]/18 bg-white p-6 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <h1 className="text-2xl font-bold text-[#07612d]">Animal no encontrado</h1>
        <p className="mt-2 text-sm text-[#1d1d1b]/70">El registro solicitado no existe en el inventario actual.</p>
        <button className="mt-5 rounded-2xl bg-[#07612d] px-5 py-3 text-sm font-bold text-white" onClick={() => navigate('/animales')} type="button">
          Volver a Gestión Ganadera
        </button>
      </section>
    )
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#07612d]/25 bg-white px-4 text-sm font-bold text-[#07612d] sm:w-auto" onClick={() => navigate('/animales')} type="button">
          <ArrowLeft size={18} /> Volver
        </button>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
          <Link className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#1f7a8c] px-4 text-sm font-bold text-white sm:w-auto" to={`/animales/${animal.id}/editar`}>
            <Edit3 size={18} /> Editar
          </Link>
          <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#D32F2F] px-4 text-sm font-bold text-white sm:w-auto" onClick={() => onRequestDelete(animal)} type="button">
            <Skull size={18} /> Dar de baja
          </button>
        </div>
      </div>

      <article className="overflow-hidden rounded-2xl border border-[#98a287]/18 bg-white shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex min-h-56 items-center justify-center bg-[#07612d]/8 md:min-h-80">
            {animal.fotografia ? (
              <img alt={`Fotografía de ${animal.identificador}`} className="h-full min-h-56 w-full object-cover md:min-h-80" src={animal.fotografia} />
            ) : (
              <span className="text-7xl font-bold text-[#07612d]/25">{animal.especie.slice(0, 1)}</span>
            )}
          </div>

          <div className="p-4 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#4CAF50]">{animal.identificador}</p>
                <h1 className="mt-1 break-words text-2xl font-bold text-[#07612d] md:text-3xl">{animal.nombre}</h1>
                <p className="mt-2 text-sm text-[#1d1d1b]/70">
                  {animal.especie} de raza {animal.raza}
                </p>
              </div>
              <AnimalStatusBadge estado={animal.estado} />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <DetailItem icon={Weight} label="Peso" value={`${animal.peso} kg`} />
              <DetailItem icon={MapPin} label="Ubicación" value={animal.ubicacion} />
              <DetailItem icon={CalendarDays} label="Fecha de ingreso" value={animal.fechaIngreso} />
            </div>

            <div className="mt-5 rounded-2xl bg-[#F4F4F4] p-4">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#98a287]">
                <UserRound size={16} /> Dueño anterior
              </span>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailItem icon={UserRound} label="Nombre" value={previousOwner.nombre} />
                <DetailItem icon={FileText} label="Documento" value={previousOwner.documentoIdentificacion} />
                <DetailItem icon={BadgeCheck} label="RFC" value={previousOwner.rfc} />
                <DetailItem icon={Landmark} label="Rancho" value={previousOwner.rancho} />
                <DetailItem icon={MapPin} label="Ciudad" value={previousOwner.ciudad} />
                <DetailItem icon={Map} label="Estado" value={previousOwner.estado} />
              </div>
              <div className="mt-3 rounded-2xl bg-white p-4">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#98a287]">
                  <FileText size={16} /> Documento PDF
                </span>
                {previousOwner.documentoPdf?.dataUrl ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-[#98a287]/18 bg-[#F4F4F4]">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#98a287]/18 bg-white px-4 py-3">
                      <p className="min-w-0 break-words text-sm font-bold text-[#1d1d1b]">{previousOwner.documentoPdf.name}</p>
                      <a
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#07612d] px-4 text-sm font-bold text-white"
                        href={previousOwner.documentoPdf.dataUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <Download size={17} /> Abrir PDF
                      </a>
                    </div>
                    <iframe className="h-96 w-full bg-white" src={previousOwner.documentoPdf.dataUrl} title={`Documento del dueño anterior de ${animal.identificador}`} />
                  </div>
                ) : (
                  <p className="mt-2 text-sm font-semibold text-[#1d1d1b]/70">Sin PDF cargado.</p>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#F4F4F4] p-4">
              <span className="text-xs font-bold uppercase text-[#98a287]">Observaciones</span>
              <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/78">{animal.observaciones || 'Sin observaciones registradas.'}</p>
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}

export default AnimalDetail

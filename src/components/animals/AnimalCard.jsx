import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Scale } from 'lucide-react'
import AnimalStatusBadge from './AnimalStatusBadge'

function AnimalCard({ animal }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#98a287]/18 bg-white shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
      <div className="flex min-h-40 items-center justify-center bg-[#07612d]/8">
        {animal.fotografia ? (
          <img alt={`Fotografía de ${animal.identificador}`} className="h-40 w-full object-cover" src={animal.fotografia} />
        ) : (
          <span className="text-5xl font-bold text-[#07612d]/25">{animal.especie.slice(0, 1)}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#07612d]">{animal.identificador}</p>
            <h3 className="mt-1 text-xl font-bold text-[#1d1d1b]">{animal.nombre}</h3>
          </div>
          <AnimalStatusBadge estado={animal.estado} />
        </div>
        <p className="mt-3 text-sm leading-6 text-[#1d1d1b]/70">
          {animal.especie} {animal.raza} con ingreso el {animal.fechaIngreso}.
        </p>
        <div className="mt-4 grid gap-2 text-sm font-semibold text-[#1d1d1b]/70">
          <span className="inline-flex items-center gap-2">
            <Scale size={17} className="text-[#98a287]" /> {animal.peso} kg
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin size={17} className="text-[#98a287]" /> {animal.ubicacion}
          </span>
        </div>
        <Link className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#07612d] px-4 text-sm font-bold text-white" to={`/animales/${animal.id}`}>
          Ver detalle <ArrowRight size={17} />
        </Link>
      </div>
    </article>
  )
}

export default AnimalCard

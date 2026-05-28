import { estilosEstadoAlimentacion } from './feedingUtils';

function InsigniaEstadoAlimentacion({ estado }) {
  return <span className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-bold ${estilosEstadoAlimentacion[estado] ?? estilosEstadoAlimentacion.Pendiente}`}>{estado}</span>;
}

export default InsigniaEstadoAlimentacion;

import TarjetaAlimentacion from './FeedingCard';
import TablaAlimentacion from './FeedingTable';

function HistorialAlimentacion({ records: registros, viewMode: modoVista, onStatusChange: alCambiarEstado }) {
  if (!registros.length) {
    return (
      <section className="rounded-2xl border border-[#98a287]/18 bg-white p-8 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <h2 className="text-2xl font-bold text-[#07612d]">No hay registros de alimentación</h2>
        <p className="mt-2 text-sm text-[#1d1d1b]/70">Registra una alimentación o ajusta los filtros actuales.</p>
      </section>);

  }

  if (modoVista === 'table') {
    return <TablaAlimentacion records={registros} onStatusChange={alCambiarEstado} />;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {registros.map((registro) =>
      <TarjetaAlimentacion key={registro.id} onStatusChange={alCambiarEstado} record={registro} />
      )}
    </div>);

}

export default HistorialAlimentacion;

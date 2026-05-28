function TarjetaPanel({ children: hijos, className = '' }) {
  return (
    <section className={`rounded-2xl border border-[#98a287]/18 bg-white shadow-[0_14px_34px_rgba(29,29,27,0.07)] ${className}`}>
      {hijos}
    </section>);

}

export default TarjetaPanel;

export const animalCatalog = {
  Bovino: {
    image: new URL('../img/Animales/Bovino/vaca.webp', import.meta.url).href,
    razas: ['Angus', 'Brahman', 'Charolais', 'Hereford', 'Holstein', 'Jersey', 'Limousin', 'Pardo Suizo', 'Santa Gertrudis', 'Simmental', 'Criollo'],
    nutricion: 'Forraje de calidad, agua limpia, sales minerales y suplemento proteico según etapa productiva.',
    recomendaciones: 'Separar por edad y propósito, revisar condición corporal y programar vacunas reproductivas y respiratorias.',
  },
  Ovino: {
    image: new URL('../img/Animales/Ovino/borrego1.jpg', import.meta.url).href,
    razas: ['Dorper', 'Katahdin', 'Pelibuey', 'Blackbelly', 'Suffolk', 'Hampshire', 'Rambouillet', 'Criollo'],
    nutricion: 'Pastoreo controlado, heno, minerales para ovinos y energía extra en gestación o engorda.',
    recomendaciones: 'Controlar parásitos internos, evitar humedad excesiva y revisar pezuñas periódicamente.',
  },
  Caprino: {
    image: new URL('../img/Animales/Cabrino/cabra.jpg', import.meta.url).href,
    razas: ['Boer', 'Nubia', 'Saanen', 'Alpina', 'Toggenburg', 'LaMancha', 'Criolla'],
    nutricion: 'Ramoneo, heno, concentrado moderado y minerales específicos para caprinos.',
    recomendaciones: 'Cuidar ventilación, controlar parásitos y separar animales por producción de carne o leche.',
  },
  Porcino: {
    image: new URL('../img/Animales/Porcino/Cerdo1.jpg', import.meta.url).href,
    razas: ['Yorkshire', 'Landrace', 'Duroc', 'Hampshire', 'Pietrain', 'Berkshire', 'Criollo'],
    nutricion: 'Alimento balanceado por etapa, agua constante y control estricto de conversión alimenticia.',
    recomendaciones: 'Mantener higiene alta, controlar temperatura y registrar peso por lote.',
  },
  Equino: {
    image: new URL('../img/Animales/Equino/descarga.webp', import.meta.url).href,
    razas: ['Cuarto de Milla', 'Azteca', 'Pura Sangre', 'Appaloosa', 'Árabe', 'Percherón', 'Criollo'],
    nutricion: 'Forraje continuo, grano controlado, electrolitos si trabaja y agua limpia siempre.',
    recomendaciones: 'Revisar cascos, dentadura, condición corporal y calendario de desparasitación.',
  },
}

export const speciesOptions = [
  { label: 'Bovino', code: '01' },
  { label: 'Ovino', code: '02' },
  { label: 'Caprino', code: '03' },
  { label: 'Porcino', code: '04' },
  { label: 'Equino', code: '05' },
]

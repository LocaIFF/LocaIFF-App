const layers = [
  {
    id: "ground",
    name: { "pt-BR": "Térreo", en: "Ground", es: "P. Baja" },
    imagePath: "/maps/terreo.png",
  },
  {
    id: "first",
    name: { "pt-BR": "1º Andar", en: "1st Floor", es: "1er Piso" },
    imagePath: "/maps/andar1.png",
  },
  {
    id: "second",
    name: { "pt-BR": "2º Andar", en: "2nd Floor", es: "2do Piso" },
    imagePath: "/maps/andar2.png",
  },
  {
    id: "third",
    name: { "pt-BR": "3º Andar", en: "3rd Floor", es: "3er Piso" },
    imagePath: "/maps/andar3.png",
  },
  {
    id: "fourth",
    name: { "pt-BR": "4º Andar", en: "4th Floor", es: "4to Piso" },
    imagePath: "/maps/andar4.png",
  },
  {
    id: "fifth",
    name: { "pt-BR": "5º Andar", en: "5th Floor", es: "5to Piso" },
    imagePath: "/maps/andar5.png",
  },
  {
    id: "sixth",
    name: { "pt-BR": "6º Andar", en: "6th Floor", es: "6to Piso" },
    imagePath: "/maps/andar6.png",
  },
  {
    id: "seventh",
    name: { "pt-BR": "7º Andar", en: "7th Floor", es: "7mo Piso" },
    imagePath: "/maps/andar7.png",
  },
];

export default layers;

export function localizeLayerName(layer, language) {
  if (!layer?.name) return "";
  if (typeof layer.name === "string") return layer.name;
  return layer.name[language] ?? layer.name["pt-BR"] ?? "";
}
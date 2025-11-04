const hotspots = [
  {
    id: "sala-101",
    layerId: "ground",
    xPercent: 22,
    yPercent: 68,
    label: "101",
    title: "Sala 101",
    block: "Bloco A",
    floorLabel: "Térreo",
    description: "Sala de atendimento geral com capacidade para 12 pessoas." /* EDITAR: atualizar descrição real */
  },
  {
    id: "sala-102",
    layerId: "ground",
    xPercent: 48,
    yPercent: 55,
    label: "102",
    title: "Laboratório de TI",
    block: "Bloco A",
    floorLabel: "Térreo",
    description: "Laboratório equipado para treinamentos técnicos." /* EDITAR */
  },
  {
    id: "sala-201",
    layerId: "first",
    xPercent: 30,
    yPercent: 40,
    label: "201",
    title: "Sala 201",
    block: "Bloco B",
    floorLabel: "1º Andar",
    description: "Sala de reuniões com videoconferência." /* EDITAR */
  },
  {
    id: "sala-202",
    layerId: "first",
    xPercent: 65,
    yPercent: 50,
    label: "202",
    title: "Sala 202",
    block: "Bloco B",
    floorLabel: "1º Andar",
    description: "Escritório administrativo compartilhado." /* EDITAR */
  },
  {
    id: "sala-301",
    layerId: "second",
    xPercent: 40,
    yPercent: 35,
    label: "301",
    title: "Sala 301",
    block: "Bloco C",
    floorLabel: "2º Andar",
    description: "Auditório principal para eventos." /* EDITAR */
  },
  {
    id: "sala-302",
    layerId: "second",
    xPercent: 75,
    yPercent: 60,
    label: "302",
    title: "Sala 302",
    block: "Bloco C",
    floorLabel: "2º Andar",
    description: "Espaço coworking com 24 posições." /* EDITAR */
  }
  // TODO: adicionar/remover hotspots editando apenas percentuais (xPercent, yPercent)
];

export default hotspots;

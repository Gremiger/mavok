export interface ChangelogEntry {
  version: string;
  date: string; // YYYY-MM-DD
  title: string;
  summary: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "v8",
    date: "2026-07-06",
    title: "Acciones rápidas y Exhaustion",
    summary: [
      "Botón flotante de Acciones rápidas en Ficha y Combate, configurable con hasta 5 accesos directos",
      "Deshacer al eliminar notas de mundo/NPCs, misiones, entradas de diario y notas rápidas",
      "Entrada rápida de HP con signo (+5 / -8)",
      "Condiciones: descripción desplegable al tocar, buscador agrupado por categoría",
      "Búsqueda en Notas: alternar entre la sección actual y todas",
      "Historial de niveles rediseñado como línea de tiempo, mostrando HP y rasgos ganados por nivel",
      "Exhaustion: nivel de 0 a 6 con penalización real en tiradas y reducción de Velocidad",
      "Cambiar la maestría de un arma ya no se bloquea tras el primer uso, solo avisa si excede la regla",
      "Corrección: gastar un dado de golpe con modificador de Constitución negativo",
      "Corrección: la app instalada podía mostrar la página equivocada al abrir sin conexión",
    ],
  },
  {
    version: "v7",
    date: "2026-07-03",
    title: "Historial de versiones",
    summary: [
      "Nueva sección en Configuración para ver cómo fue evolucionando la app a través del tiempo",
    ],
  },
  {
    version: "v6",
    date: "2026-07-02",
    title: "Mecánicas de Bárbaro",
    summary: [
      "Tiradas con ventaja: Reckless Attack y Danger Sense (salvación de DES)",
      "Primal Knowledge: competencia extra al llegar a nivel 3, tirar con FUE mientras estás enfurecido",
      "Cambiar la maestría de un arma cada descanso largo",
      "Explorador de Dotes: ver requisitos antes de llegar a nivel 4",
    ],
  },
  {
    version: "v5",
    date: "2026-07-02",
    title: "Gestión avanzada",
    summary: [
      "Ataques personalizados: crear, editar y eliminar",
      "Editar entradas del diario",
      "Tags y vínculo con NPCs en las misiones",
      "Búsqueda por campos estructurados",
      "Indicador de estado offline",
      "Foto de perfil del personaje",
      "Historial de subidas de nivel",
      "Corrección de un crash al subir a nivel 20",
    ],
  },
  {
    version: "v4",
    date: "2026-07-01",
    title: "Pulido de ficha",
    summary: [
      "Insignia de Proficiency Bonus",
      "Sección de Dotes en la ficha",
      "Deshacer al eliminar objetos o notas",
      "Animación visual al usar recursos",
      "Exportar / imprimir la ficha en PDF",
    ],
  },
  {
    version: "v3",
    date: "2026-07-01",
    title: "Inventario y notas",
    summary: [
      "Búsqueda, orden y filtro por categoría en Inventario",
      "Mantener presionado \"Usar\" para corregir usos de Stone's Endurance / Healer's Kit",
      "Búsqueda en todas las notas",
    ],
  },
  {
    version: "v2",
    date: "2026-07-01",
    title: "Correcciones XPHB",
    summary: [
      "Corrección de datos según las reglas XPHB 2024 (Large Form, Rage, Giant Ancestry: Stone Giant, Stone's Endurance)",
      "Panel de detalles de Rage cuando está activo",
      "Agrupar habilidades por atributo, mostrar percepción pasiva y otras pasivas",
      "Ficha de Acciones, Bonus Actions y Reacciones completa",
      "Corrección de zoom táctil y navegación en iOS",
      "Migraciones de datos versionadas con backup automático",
    ],
  },
  {
    version: "v1",
    date: "2026-06-24",
    title: "Lanzamiento inicial",
    summary: [
      "Ficha completa: atributos, salvaciones, habilidades, competencias, rasgos",
      "Combate: HP, Rage (con casillas de fuego animadas), ataques, tirador de dados",
      "Inventario: monedas, objetos, capacidad de carga",
      "Notas: notas rápidas, mundo, NPCs, misiones, diario",
      "Sistema guiado de subida de nivel (subclase, ASI/dotes)",
      "Identidad visual \"Piedra Viva\": navegación flotante, textura de piedra, cordón trenzado",
      "Soporte offline instalable (PWA)",
    ],
  },
];

export interface PortfolioProject {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  software: string[];
  accent: 'yellow' | 'purple' | 'blue';
  thumbnail: string;
  thumbnailHiRes: string;
  summary: string;
  highlights: string[];
  rookiesUrl: string;
}

export interface PipelineStage {
  index: string;
  title: string;
  description: string;
  accent: 'yellow' | 'purple' | 'blue';
}

export const ARTIST_INFO = {
  name: 'Adrián Alejo Molina',
  shortName: 'ADRIÁN ALEJO',
  handle: 'SENTINELPRIME',
  role: '3D Rigger & Animator',
  location: 'España',
  email: 'adriaalejo02@gmail.com',
  rookiesUrl: 'https://www.therookies.co/u/SentinelPrime',
  linkedinUrl: 'https://www.linkedin.com/in/adri%C3%A1n-alejo-molina-813a5a255/',
  tagline: 'Rigs limpios y animación 3D para que cada personaje cobre vida en tiempo real.',
} as const;

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'finn-rig',
    index: '01',
    title: 'Finn The Human',
    subtitle: 'Character & Facial Rig en Blender',
    category: '3D RIGGING',
    year: '2026',
    software: ['Blender', 'Rigging', 'Weight Painting', 'Facial Rig'],
    accent: 'yellow',
    thumbnail:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/450724/800xAUTO/FINN_RIGG_THUMBNAIL-SentinelPrime-crop.png',
    thumbnailHiRes:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/450724/1400xAUTO/FINN_RIGG_THUMBNAIL-SentinelPrime-crop.png',
    summary:
      'Rig estilizado completo en Blender con foco en ergonomía para el animador y deformaciones limpias en cuerpo, dedos y rostro.',
    highlights: [
      'Bone Layers organizadas por función y jerarquía limpia',
      'Weight painting completo en cuerpo, dedos y lengua',
      'Pivote independiente de talón (Heel Pivot) y control maestro de manos',
    ],
    rookiesUrl: 'https://www.therookies.co/projects/105652',
  },
  {
    id: 'creature-facial',
    index: '02',
    title: 'Bringing a Creature to Life',
    subtitle: 'Esculpido, Retopología y Rig Facial',
    category: 'FACIAL RIG',
    year: '2026',
    software: ['Blender', 'RetopoFlow', 'Blend Shapes'],
    accent: 'purple',
    thumbnail:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/592836/800xAUTO/BAT_RIGG_THUMBNAIL-SentinelPrime-crop.png',
    thumbnailHiRes:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/592836/1400xAUTO/BAT_RIGG_THUMBNAIL-SentinelPrime-crop.png',
    summary:
      'Criatura estilizada esculpida desde cero, retopologizada manualmente (3,732 triángulos) y equipada con rig facial expresivo.',
    highlights: [
      'Retopología game-ready de 1,874 vértices / 3,732 triángulos',
      'Controladores oculares precisos y Blend Shapes para acting expresivo',
      'Deformación limpia optimizada para poses cartoon y real-time',
    ],
    rookiesUrl: 'https://www.therookies.co/projects/105817',
  },
  {
    id: 'guardian-terrarios',
    index: '03',
    title: 'El Guardián de los Terrarios',
    subtitle: 'Rigging y Ciclos Jugables en Unity',
    category: 'GAMEPLAY ANIM',
    year: '2026',
    software: ['Blender', 'Unity 3D', 'Skinning'],
    accent: 'blue',
    thumbnail:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-14/261667/800xAUTO/EGT_THUMBNAIL-SentinelPrime-crop.png',
    thumbnailHiRes:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-14/261667/1400xAUTO/EGT_THUMBNAIL-SentinelPrime-crop.png',
    summary:
      'Rigging, skinning y librería completa de animaciones jugables para protagonista, enemigo gorila y entorno en Unity 3D.',
    highlights: [
      'Protagonista: Idle, Walk, Run, Stunned, Crouch, Slide y Jump',
      'Enemigo gorila: Walk, Run, Pec Slam, Smash y Rock Throw',
      'Integración directa de ciclos e interacciones en Unity',
    ],
    rookiesUrl: 'https://www.therookies.co/projects/105128',
  },
  {
    id: 'samus-reel',
    index: '04',
    title: 'Samus Aran — Demo Reel',
    subtitle: 'Animación Sci-Fi y Body Mechanics',
    category: 'ANIMATION REEL',
    year: '2026',
    software: ['Blender', '3D Animation'],
    accent: 'yellow',
    thumbnail:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-13/982482/800xAUTO/SAMUS_THUMNAIL-SentinelPrime-crop.png',
    thumbnailHiRes:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-13/982482/1400xAUTO/SAMUS_THUMNAIL-SentinelPrime-crop.png',
    summary:
      'Demo reel centrada en peso, inercia y lectura de silueta con secuencias de acción sci-fi en Blender.',
    highlights: [
      'Secuencias: Aerial, Idle, Run y Backflip acrobático',
      'Pulido de arcos y curvas F-Curve para máxima contundencia',
      'Modelo/rig base de Curiomatic animado en Blender',
    ],
    rookiesUrl: 'https://www.therookies.co/projects/93830',
  },
  {
    id: 'meet-mat-tron',
    index: '05',
    title: 'Meet Mat 5 — Tron Legacy',
    subtitle: 'Lookdev y Materiales Neón Sci-Fi',
    category: 'LOOKDEV',
    year: '2026',
    software: ['Substance 3D Painter', 'Blender'],
    accent: 'blue',
    thumbnail:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-13/593273/800xAUTO/MEETMAT_THUMB-SentinelPrime-crop.png',
    thumbnailHiRes:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-13/593273/1400xAUTO/MEETMAT_THUMB-SentinelPrime-crop.png',
    summary:
      'Estudio PBR y emisión neón inspirado en Tron: Legacy, texturizado en Substance 3D Painter e iluminado en Blender.',
    highlights: [
      'Mapas emisivos y control preciso de roughness PBR',
      'Iluminación de alto contraste y compositing final en Blender',
    ],
    rookiesUrl: 'https://www.therookies.co/projects/93611',
  },
  {
    id: 'unity6-mobile',
    index: '06',
    title: 'Mobile Gameplay — Unity 6',
    subtitle: 'Pipeline Modular de Animación Real-Time',
    category: 'UNITY 6',
    year: '2026',
    software: ['Unity 6', 'Blender'],
    accent: 'purple',
    thumbnail:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-13/116174/800xAUTO/MOBILE_GAMEPLAY_THUMB-SentinelPrime-crop.png',
    thumbnailHiRes:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-13/116174/1400xAUTO/MOBILE_GAMEPLAY_THUMB-SentinelPrime-crop.png',
    summary:
      'Tráiler jugable en Unity 6 demostrando rigging ligero por pivotes modulares y exportación directa desde Blender.',
    highlights: [
      'Rigging ultraligero optimizado para rendimiento móvil',
      'Timeline modular por puntos de pivote entre Blender y Unity 6',
    ],
    rookiesUrl: 'https://www.therookies.co/projects/93825',
  },
];

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    index: '01',
    title: 'Topología para Deformar',
    description:
      'Edge-loops limpios en articulaciones y rostro para mantener el volumen en cualquier pose.',
    accent: 'blue',
  },
  {
    index: '02',
    title: 'Armature & Weight Painting',
    description:
      'Jerarquías modulares, pivotes independientes y skinning preciso en dedos, hombros y cara.',
    accent: 'purple',
  },
  {
    index: '03',
    title: 'Controles Animator-First',
    description:
      'Sistemas IK/FK y Blend Shapes intuitivos para centrarse en la actuación, nunca en pelear con el rig.',
    accent: 'yellow',
  },
  {
    index: '04',
    title: 'Integración Real-Time',
    description:
      'Esqueletos optimizados y ciclos de locomoción y combate listos para Unity 6.',
    accent: 'blue',
  },
];

export const CORE_TOOLS = [
  'Blender',
  'Unity 6',
  'Substance 3D Painter',
  'RetopoFlow',
  'Procreate',
  'Photoshop',
] as const;

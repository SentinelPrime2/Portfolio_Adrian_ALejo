export type ProjectContentBlock =
  | { type: 'heading'; text: string; level?: 2 | 3 }
  | { type: 'paragraph'; text: string; bold?: boolean }
  | { type: 'image'; src: string; hiResSrc?: string; alt?: string; variant?: 'banner' | 'default' }
  | { type: 'gif'; src: string; alt?: string }
  | {
      type: 'gallery';
      columns?: 2 | 3 | 4;
      items: { src: string; hiResSrc?: string; alt?: string }[];
    }
  | { type: 'embed'; src: string; title: string }
  | { type: 'video'; src: string };

export interface PortfolioProject {
  id: string;
  index: string;
  title: string;
  fullTitle: string;
  subtitle: string;
  subtitleEn: string;
  category: string;
  year: string;
  publishedDate: string;
  software: string[];
  tags: string[];
  accent: 'yellow' | 'purple' | 'blue';
  thumbnail: string;
  thumbnailHiRes: string;
  summary: string;
  summaryEn: string;
  fullDescription: string;
  highlights: string[];
  highlightsEn: string[];
  blocks: ProjectContentBlock[];
}

export interface PipelineStage {
  index: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  accent: 'yellow' | 'purple' | 'blue';
}

export const ARTIST_INFO = {
  name: 'Adrián Alejo Molina',
  shortName: 'ADRIÁN ALEJO',
  handle: 'SENTINEL PRIME',
  role: '3D Rigger & Animator',
  location: 'España',
  locationEn: 'Spain',
  email: 'adriaalejo02@gmail.com',
  rookiesUrl: 'https://www.therookies.co/u/SentinelPrime',
  linkedinUrl: 'https://www.linkedin.com/in/adri%C3%A1n-alejo-molina-813a5a255/',
  tagline: 'Rigs limpios y animación 3D para que cada personaje cobre vida en tiempo real.',
  taglineEn: 'Clean rigs and 3D animation crafted to bring every character to life in real time.',
} as const;

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'finn-rig',
    index: '01',
    title: 'Finn The Human',
    fullTitle: '3D Rigging - Finn The Human',
    subtitle: 'Character & Facial Rig en Blender',
    subtitleEn: 'Character & Facial Rig in Blender',
    category: '3D RIGGING',
    year: '2026',
    publishedDate: '4 Sep 2026',
    software: ['Blender', 'Rigging', 'Weight Painting', 'Facial Rig'],
    tags: ['3D Rigging', '3D Facial Rigging', '3D Blender', '3D Animation Reel'],
    accent: 'yellow',
    thumbnail:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/450724/800xAUTO/FINN_RIGG_THUMBNAIL-SentinelPrime-crop.png',
    thumbnailHiRes:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/450724/1400xAUTO/FINN_RIGG_THUMBNAIL-SentinelPrime-crop.png',
    summary:
      'Rig estilizado completo en Blender con foco en ergonomía para el animador y deformaciones limpias en cuerpo, dedos y rostro.',
    summaryEn:
      'Complete stylized rig in Blender focused on animator ergonomics and clean deformation across body, fingers, and face.',
    fullDescription:
      'A selection of my character rigging work, focused on building robust, production-ready rigs for games. Exploring humanoid and creature setups, deformation, weight painting, controllers, constraints and animation-friendly workflows, with an emphasis on flexibility, reliability and clean deformation.',
    highlights: [
      'Bone Layers organizadas por función y jerarquía limpia',
      'Weight painting completo en cuerpo, dedos y lengua',
      'Pivote independiente de talón (Heel Pivot) y control maestro de manos',
    ],
    highlightsEn: [
      'Function-organized Bone Layers and clean hierarchy',
      'Full weight painting across body, fingers, and tongue',
      'Independent Heel Pivot and master hand open/close control',
    ],
    blocks: [
      {
        type: 'image',
        variant: 'banner',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/327194/INTRO-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/327194/3840xAUTO/INTRO-SentinelPrime.png',
        alt: 'Intro — Finn The Human Character Rigging',
      },
      { type: 'heading', text: 'Character Rigging — Blender' },
      {
        type: 'paragraph',
        text: 'Humanoid character rig developed for animation, featuring a full deformation system and custom controls built for a clean animator workflow.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/388002/HERO_MONTAGE-SentinelPrime.gif',
        alt: 'Hero Montage — Finn The Human Rig',
      },
      {
        type: 'image',
        variant: 'banner',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/293024/RIG%20ARCH-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/293024/3840xAUTO/RIG%20ARCH-SentinelPrime.png',
        alt: 'Rig Architecture Overview',
      },
      { type: 'heading', text: 'Bone layers' },
      {
        type: 'paragraph',
        text: 'Featuring organized deformation bones, animation controls and custom controller shapes designed for an intuitive animation workflow.',
      },
      {
        type: 'gallery',
        columns: 2,
        items: [
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/360395/1400xAUTO/DEF_TEXT-SentinelPrime.png',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/360395/3840xAUTO/DEF_TEXT-SentinelPrime.png',
            alt: 'DEF Bone Layer',
          },
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/247225/1400xAUTO/MCH_TEXT-SentinelPrime.png',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/247225/3840xAUTO/MCH_TEXT-SentinelPrime.png',
            alt: 'MCH Bone Layer',
          },
        ],
      },
      {
        type: 'gallery',
        columns: 2,
        items: [
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/061459/1400xAUTO/TWEAK_TEXT-SentinelPrime.png',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/061459/3840xAUTO/TWEAK_TEXT-SentinelPrime.png',
            alt: 'TWEAK Bone Layer',
          },
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/272364/1400xAUTO/CTRL_TEXT-SentinelPrime.png',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/272364/3840xAUTO/CTRL_TEXT-SentinelPrime.png',
            alt: 'CTRL Bone Layer',
          },
        ],
      },
      {
        type: 'image',
        variant: 'banner',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/721506/WEIGHT-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/721506/3840xAUTO/WEIGHT-SentinelPrime.png',
        alt: 'Weight Painting Section Banner',
      },
      { type: 'heading', text: 'Body Weights' },
      {
        type: 'paragraph',
        text: 'Full-body weight distribution across the spine, shoulders, hips, and legs, keeping deformation smooth and volume-preserving through a full range of motion.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/689316/WEIGHT_PAINT-SentinelPrime.gif',
        alt: 'Body Weight Painting Demonstration',
      },
      { type: 'heading', text: 'Hand Weights' },
      {
        type: 'paragraph',
        text: 'Individually weighted fingers for clean, isolated bending with no cross-influence between joints.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/824938/WEIGHT_PAINT_2-SentinelPrime.gif',
        alt: 'Hand Weight Painting Demonstration',
      },
      { type: 'heading', text: 'Tongue Weights' },
      {
        type: 'paragraph',
        text: "Isolated weight painting along the tongue's length for clean, independent deformation during curl and stretch movements.",
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/304425/WEIGHT_PAINT_3-SentinelPrime.gif',
        alt: 'Tongue Weight Painting Demonstration',
      },
      {
        type: 'image',
        variant: 'banner',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/093935/CONTROLLERS-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/093935/3840xAUTO/CONTROLLERS-SentinelPrime.png',
        alt: 'Controllers Banner',
      },
      { type: 'heading', text: 'Main Controls' },
      {
        type: 'paragraph',
        text: 'A complete set of custom controllers covering the full body — root, spine, limbs, and extremities — built for fast, predictable animation.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/816846/CTRL_SHOW-SentinelPrime.gif',
        alt: 'Main Controllers Showcase',
      },
      { type: 'heading', text: 'Heel Control' },
      {
        type: 'paragraph',
        text: 'Dedicated heel pivot control allowing independent heel lift and roll, separate from the main foot IK — essential for natural walk and run cycles.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/403375/FEET_RISER-SentinelPrime.gif',
        alt: 'Heel Pivot Control Showcase',
      },
      { type: 'heading', text: 'Hand Open / Close' },
      {
        type: 'paragraph',
        text: 'Single master control to open and close the full hand, blending all fingers simultaneously for fast, animator-friendly posing.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/861117/FINGERS_OPENER-SentinelPrime.gif',
        alt: 'Hand Open / Close Control',
      },
      { type: 'heading', text: 'Finger Spread' },
      {
        type: 'paragraph',
        text: 'Custom control for individual finger spread, allowing quick adjustment of hand silhouette without keying each finger separately.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/384588/HAND_OPENER-SentinelPrime.gif',
        alt: 'Finger Spread Control',
      },
      {
        type: 'image',
        variant: 'banner',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/689154/IK_FK-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/689154/3840xAUTO/IK_FK-SentinelPrime.png',
        alt: 'IK / FK Systems Banner',
      },
      { type: 'heading', text: 'IK / FK Switching' },
      {
        type: 'paragraph',
        text: 'Seamless IK/FK blending on arms and legs, allowing animators to switch systems mid-shot without breaking the pose.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/427492/IK_FK-SentinelPrime.gif',
        alt: 'IK / FK Switching Demonstration',
      },
      { type: 'heading', text: 'Custom controls' },
      {
        type: 'paragraph',
        text: 'Custom property drivers exposed directly on the controllers, giving animators a single click-and-drag switch between IK and FK per limb.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/713280/IK_SHOW-SentinelPrime.gif',
        alt: 'Custom Drivers Control Properties',
      },
      {
        type: 'image',
        variant: 'banner',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/163508/TWEAK-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/163508/3840xAUTO/TWEAK-SentinelPrime.png',
        alt: 'Tweak Controls Banner',
      },
      { type: 'heading', text: 'Arm Tweak' },
      {
        type: 'paragraph',
        text: 'Secondary tweak bones along the arm allow fine, localized corrections to deformation — smoothing out volume loss on extreme bends and rotations.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/766288/TWEAK_SHOW-SentinelPrime.gif',
        alt: 'Arm Tweak Deformation',
      },
      { type: 'heading', text: 'Torso Tweak' },
      {
        type: 'paragraph',
        text: 'Additional tweak controls across the torso for fine-tuning spine and chest deformation, keeping volume consistent through bends and twists.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/256127/TWEAK_CHEST-SentinelPrime.gif',
        alt: 'Torso Tweak Controls',
      },
      { type: 'heading', text: 'Arm & Leg Stretch' },
      {
        type: 'paragraph',
        text: 'Stretch-enabled IK on arms and legs, letting limbs extend beyond their natural length for cartoon-style poses and exaggerated animation.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/888284/STRETCH_ARMS_LEGS-SentinelPrime.gif',
        alt: 'Stretch IK Demonstration',
      },
      {
        type: 'image',
        variant: 'banner',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/961685/FACIAL-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/961685/3840xAUTO/FACIAL-SentinelPrime.png',
        alt: 'Facial Rig Banner',
      },
      { type: 'heading', text: 'Facial Controls' },
      {
        type: 'paragraph',
        text: 'Custom control rig for eyes and mouth, allowing precise, layered facial posing beyond simple shape key blending.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/037660/FACIAL_SHOW-SentinelPrime.gif',
        alt: 'Facial Controls Showcase',
      },
      { type: 'heading', text: 'Tongue' },
      {
        type: 'paragraph',
        text: 'Independent tongue rig with multiple control points along its length, enabling curl, stretch, and lateral movement for detailed lip-sync and expressions.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/265924/TONGUE_SHOW-SentinelPrime.gif',
        alt: 'Tongue Control System',
      },
      {
        type: 'image',
        variant: 'banner',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/696607/NAMING-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/696607/3840xAUTO/NAMING-SentinelPrime.png',
        alt: 'Naming Conventions Banner',
      },
      { type: 'heading', text: 'Standard naming conventions' },
      {
        type: 'paragraph',
        text: 'A clean, consistent naming convention (CTRL / DEF / MCH / ORG) keeps the rig scalable and easy to navigate for any animator.',
      },
      {
        type: 'gallery',
        columns: 2,
        items: [
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/019539/1400xAUTO/Captura%20de%20pantalla%202026-09-03%20223213-SentinelPrime.png',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/019539/3840xAUTO/Captura%20de%20pantalla%202026-09-03%20223213-SentinelPrime.png',
            alt: 'Outliner Hierarchy View 1',
          },
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/699847/1400xAUTO/Captura%20de%20pantalla%202026-09-03%20223202-SentinelPrime.png',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/699847/3840xAUTO/Captura%20de%20pantalla%202026-09-03%20223202-SentinelPrime.png',
            alt: 'Outliner Hierarchy View 2',
          },
        ],
      },
      {
        type: 'gallery',
        columns: 2,
        items: [
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/279406/1400xAUTO/Captura%20de%20pantalla%202026-09-03%20222911-SentinelPrime.png',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/279406/3840xAUTO/Captura%20de%20pantalla%202026-09-03%20222911-SentinelPrime.png',
            alt: 'Outliner Hierarchy View 3',
          },
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/143181/1400xAUTO/Captura%20de%20pantalla%202026-09-03%20223120-SentinelPrime.png',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-03/143181/3840xAUTO/Captura%20de%20pantalla%202026-09-03%20223120-SentinelPrime.png',
            alt: 'Outliner Hierarchy View 4',
          },
        ],
      },
      { type: 'heading', text: 'THANK YOU!' },
      {
        type: 'image',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/645028/FINN_RIGG_THUMBNAIL-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-04/645028/3840xAUTO/FINN_RIGG_THUMBNAIL-SentinelPrime.png',
        alt: 'Finn The Human — Final Render',
      },
    ],
  },
  {
    id: 'creature-facial',
    index: '02',
    title: 'Bringing a Creature to Life',
    fullTitle: 'Bringing a Creature to Life: Model & Facial Rig',
    subtitle: 'Esculpido, Retopología y Rig Facial',
    subtitleEn: 'Sculpting, Retopology & Facial Rig',
    category: 'FACIAL RIG',
    year: '2026',
    publishedDate: '10 Sep 2026',
    software: ['Blender', 'RetopoFlow', 'Blend Shapes'],
    tags: ['3D Blender', '3D Character Sculpts', '3D Retopology', '3D Animation', '3D Rigging'],
    accent: 'purple',
    thumbnail:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/592836/800xAUTO/BAT_RIGG_THUMBNAIL-SentinelPrime-crop.png',
    thumbnailHiRes:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/592836/1400xAUTO/BAT_RIGG_THUMBNAIL-SentinelPrime-crop.png',
    summary:
      'Criatura estilizada esculpida desde cero, retopologizada manualmente (3,732 triángulos) y equipada con rig facial expresivo.',
    summaryEn:
      'Stylized creature sculpted from scratch, hand-retopologized (3,732 triangles), and equipped with an expressive facial rig.',
    fullDescription:
      'Role: Modeling, Retopology, Rigging & Facial Animation Setup\nTools: Blender, RetopoFlow\n\nAn original creature character taken from concept to a fully rigged, expression-ready asset — covering sculpting, clean retopology, and a custom facial rig built for a wide range of expressions.',
    highlights: [
      'Retopología game-ready de 1,874 vértices / 3,732 triángulos',
      'Controladores oculares precisos y Blend Shapes para acting expresivo',
      'Deformación limpia optimizada para poses cartoon y real-time',
    ],
    highlightsEn: [
      'Game-ready retopology at 1,874 vertices / 3,732 triangles',
      'Precise eye controllers & custom Blend Shapes for expressive acting',
      'Clean deformation optimized for cartoon poses and real-time use',
    ],
    blocks: [
      {
        type: 'image',
        variant: 'banner',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/911171/BANNER_1-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/911171/3840xAUTO/BANNER_1-SentinelPrime.png',
        alt: 'Creature Intro Banner',
      },
      { type: 'heading', text: 'Character Model & Facial Rig — Blender' },
      {
        type: 'paragraph',
        text: 'A small creature with a lot going on in its face. This project focuses on building a facial system flexible enough to carry real personality — from subtle expression shifts to more exaggerated, cartoon-style poses.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/868886/GREETS-SentinelPrime.gif',
        alt: 'Creature Greeting Animation',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/722582/TALK-SentinelPrime.gif',
        alt: 'Creature Dialogue Animation',
      },
      {
        type: 'image',
        variant: 'banner',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/799730/BANNER_2-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/799730/3840xAUTO/BANNER_2-SentinelPrime.png',
        alt: 'Modeling & Sculpting Banner',
      },
      {
        type: 'paragraph',
        text: "Fully modeled and sculpted in Blender, from initial blockout to final detail pass — shaping the character's silhouette and surface detail entirely within Blender's sculpting toolset.",
      },
      {
        type: 'gallery',
        columns: 2,
        items: [
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/064438/1400xAUTO/FRONT_MODEL-SentinelPrime.png',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/064438/3840xAUTO/FRONT_MODEL-SentinelPrime.png',
            alt: 'Front Sculpt View',
          },
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/064438/1400xAUTO/SIDE_MODEL-SentinelPrime.png',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/064438/3840xAUTO/SIDE_MODEL-SentinelPrime.png',
            alt: 'Side Sculpt View',
          },
        ],
      },
      {
        type: 'image',
        variant: 'banner',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/451171/BANNER_3-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/451171/3840xAUTO/BANNER_3-SentinelPrime.png',
        alt: 'Retopology Banner',
      },
      {
        type: 'paragraph',
        text: 'Hand-retopologized mesh with edge flow optimized around key deformation areas — eyes, mouth, and ears — keeping the topology lightweight while supporting clean facial deformation.\nPoly count: Vertices --> 1.874 / Triangles --> 3.732',
      },
      {
        type: 'gallery',
        columns: 3,
        items: [
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/498618/1400xAUTO/FRONT_RETOPO-SentinelPrime.png',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/498618/3840xAUTO/FRONT_RETOPO-SentinelPrime.png',
            alt: 'Front Retopology Wireframe',
          },
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/498618/1400xAUTO/SIDE_RETOPO-SentinelPrime.png',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/498618/3840xAUTO/SIDE_RETOPO-SentinelPrime.png',
            alt: 'Side Retopology Wireframe',
          },
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/170670/1400xAUTO/BACK_RETOPO-SentinelPrime.png',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/170670/3840xAUTO/BACK_RETOPO-SentinelPrime.png',
            alt: 'Back Retopology Wireframe',
          },
        ],
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/588677/RETOPO-SentinelPrime.gif',
        alt: 'Retopology Turntable',
      },
      {
        type: 'image',
        variant: 'banner',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/268635/BANNER_4-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/268635/3840xAUTO/BANNER_4-SentinelPrime.png',
        alt: 'Facial Rig Banner',
      },
      {
        type: 'paragraph',
        text: 'A custom facial control system combined with blend shapes, giving animators precise, layered control over expressions — from subtle shifts in emotion to extreme, cartoon-style poses.',
      },
      { type: 'heading', text: 'Eye Controllers' },
      {
        type: 'paragraph',
        text: 'Dedicated controllers for eye movement, allowing precise aim and independent posing for each eye.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/538829/EYES-SentinelPrime.gif',
        alt: 'Eye Controllers Demonstration',
      },
      { type: 'heading', text: 'Eyes Closed' },
      {
        type: 'paragraph',
        text: 'Blend shape for natural eye closing, used for blinking and eye-related expressions.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/297009/BLINK-SentinelPrime.gif',
        alt: 'Blink Blend Shape',
      },
      { type: 'heading', text: 'Happiness' },
      {
        type: 'paragraph',
        text: 'Dedicated blend shape lifting the mouth and cheeks into a happy expression',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/845922/JOY-SentinelPrime.gif',
        alt: 'Happiness Blend Shape',
      },
      { type: 'heading', text: 'Wink' },
      {
        type: 'paragraph',
        text: 'Asymmetric blend shape for a one-eyed wink, isolated from the full blink shape.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/667563/LEFT%20EYE-SentinelPrime.gif',
        alt: 'Wink Blend Shape',
      },
      { type: 'heading', text: 'Mouth Open' },
      {
        type: 'paragraph',
        text: 'Blend shape controlling mouth opening, used as a base for talking and a range of facial expressions.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/803310/MOUTH-SentinelPrime.gif',
        alt: 'Mouth Open Blend Shape',
      },
      { type: 'heading', text: 'Sadness' },
      {
        type: 'paragraph',
        text: 'Dedicated blend shape shaping brows and mouth into a sad expression.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/242228/SADNESS-SentinelPrime.gif',
        alt: 'Sadness Blend Shape',
      },
      { type: 'heading', text: 'Combined Expressions' },
      {
        type: 'paragraph',
        text: 'Multiple blend shapes — such as closed eyes and an open mouth — blending together seamlessly, allowing complex, layered expressions instead of isolated poses.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/787999/BLEND_1-SentinelPrime.gif',
        alt: 'Combined Expressions Demo 1',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/873745/BLEND_2-SentinelPrime.gif',
        alt: 'Combined Expressions Demo 2',
      },
      {
        type: 'image',
        variant: 'banner',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/558626/BANNER_5-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/558626/3840xAUTO/BANNER_5-SentinelPrime.png',
        alt: 'Drivers Banner',
      },
      { type: 'heading', text: 'Key Shapes & Drivers' },
      {
        type: 'paragraph',
        text: 'Blend shapes linked directly to facial controllers through custom drivers, letting animators trigger expressions by simply moving a control — no manual shape key sliders required.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/200448/DRIVERS-SentinelPrime.gif',
        alt: 'Custom Drivers Setup',
      },
      { type: 'heading', text: 'THANK YOU!' },
      {
        type: 'image',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/434635/BAT_RIGG_THUMBNAIL-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-10/434635/3840xAUTO/BAT_RIGG_THUMBNAIL-SentinelPrime.png',
        alt: 'Creature Final Artwork',
      },
    ],
  },
  {
    id: 'guardian-terrarios',
    index: '03',
    title: 'El Guardián de los Terrarios',
    fullTitle: '3D Rigging & Animation - El Guardián de los Terrarios',
    subtitle: 'Rigging y Ciclos Jugables en Unity',
    subtitleEn: 'Rigging & Playable Cycles in Unity',
    category: 'GAMEPLAY ANIM',
    year: '2026',
    publishedDate: '14 Aug 2026',
    software: ['Blender', 'Unity 3D', 'Skinning'],
    tags: ['3D Animation', '3D Blender', 'Unity', 'Unity 3D'],
    accent: 'blue',
    thumbnail:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-14/261667/800xAUTO/EGT_THUMBNAIL-SentinelPrime-crop.png',
    thumbnailHiRes:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-14/261667/1400xAUTO/EGT_THUMBNAIL-SentinelPrime-crop.png',
    summary:
      'Rigging, skinning y librería completa de animaciones jugables para protagonista, enemigo gorila y entorno en Unity 3D.',
    summaryEn:
      'Rigging, skinning, and full playable animation library for the protagonist, gorilla enemy, and environment in Unity 3D.',
    fullDescription:
      'Character rigging, skinning and animation for a 3D narrative platformer, with a focus on deformation quality and gameplay integration.',
    highlights: [
      'Protagonista: Idle, Walk, Run, Stunned, Crouch, Slide y Jump',
      'Enemigo gorila: Walk, Run, Pec Slam, Smash y Rock Throw',
      'Integración directa de ciclos e interacciones en Unity',
    ],
    highlightsEn: [
      'Protagonist: Idle, Walk, Run, Stunned, Crouch, Slide, and Jump',
      'Gorilla enemy: Walk, Run, Pec Slam, Smash, and Rock Throw',
      'Direct gameplay cycle & Animator Controller integration in Unity',
    ],
    blocks: [
      { type: 'heading', text: '1. ABOUT THE GAME' },
      {
        type: 'paragraph',
        text: "El Guardian de los Terrarios is a 3D narrative platformer that follows a young boy as he explores a mysterious dreamlike world filled with fantastical environments, puzzles and platforming challenges.\nThe game was developed as a multidisciplinary project in Unity, with a strong focus on character-driven storytelling and platforming-like gameplay. I was responsible for the character rigging and animation, bringing the game's characters to life both in gameplay and narrative moments.",
      },
      { type: 'heading', text: '2. MY RESPONSABILITIES' },
      {
        type: 'paragraph',
        text: '· Character rigging\n· Character animation\n· Skinning / weight painting\n· Integration into Unity\n· Environment animations\n· Iteration based on playtesting',
      },
      { type: 'heading', text: '3. CHARACTER RIGGING' },
      {
        type: 'paragraph',
        text: 'The characters were rigged with a focus on flexibility and clean deformation, allowing me to create expressive poses and animations while preserving their stylized proportions.',
      },
      {
        type: 'image',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-14/790539/CAEL_RIGG_GREEN-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-14/790539/3840xAUTO/CAEL_RIGG_GREEN-SentinelPrime.png',
        alt: 'Cael Protagonist Rig',
      },
      {
        type: 'image',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-14/334194/Golira_RIGG-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-14/334194/3840xAUTO/Golira_RIGG-SentinelPrime.png',
        alt: 'Gorilla Enemy Rig',
      },
      { type: 'heading', text: '4. ANIMATION' },
      {
        type: 'paragraph',
        text: "Some of the animations from the player's set featuring: Idle, Walk, Run, Stunned, Crouch, Crouch Walk, Slide and Jump.",
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-14/876531/Cael_GIF-SentinelPrime.gif',
        alt: 'Player Animation Set 1',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-14/245369/run_gif-SentinelPrime.gif',
        alt: 'Player Run Cycle',
      },
      {
        type: 'paragraph',
        text: 'Here you can watch some of the states of the gorilla, one of the enemies in the game. In this case we have: Walk, Run, Pec Slam, Smash and Rock Throw.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-14/908985/Golira_GIF-SentinelPrime.gif',
        alt: 'Gorilla Enemy Animation States',
      },
      {
        type: 'paragraph',
        text: 'As a part of trying to make our game and atmosphere as alive and full of life as possible, I also rigged and animated some elements like cocodriles and a log full of deadly carnivorous plants.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-14/636733/Croco_GIF-SentinelPrime.gif',
        alt: 'Crocodile Environment Animation',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-14/924298/Plantas_GIF-SentinelPrime.gif',
        alt: 'Carnivorous Plants Log Animation',
      },
      { type: 'heading', text: '6. IN-GAME IMPLEMENTATION' },
      {
        type: 'paragraph',
        text: "During the final stages of production, I integrated the character animations created in Blender into Unity's gameplay systems. This involved exporting the animations, setting up the Animator Controller, and ensuring that each animation was correctly triggered by the player's movement and actions.",
      },
      {
        type: 'video',
        src: 'https://rookies-production.s3-accelerate.amazonaws.com/SentinelPrime/2026-08-14/194836/GAME_IMPLEMENTATION_RESIZED-SentinelPrime.mp4',
      },
      { type: 'heading', text: '7. FINAL RESULT' },
      {
        type: 'paragraph',
        text: 'In this trailer you will see all of the animations implemented as well as the final demo of our game.\n¡Hope you like it!',
      },
      {
        type: 'embed',
        src: 'https://www.youtube.com/embed/5tQf2SGiz8o',
        title: 'El Guardián de los Terrarios — Final Trailer',
      },
    ],
  },
  {
    id: 'samus-reel',
    index: '04',
    title: 'Samus Aran — Demo Reel',
    fullTitle: '3D Animation - Demo Reel',
    subtitle: 'Animación Sci-Fi y Body Mechanics',
    subtitleEn: 'Sci-Fi Animation & Body Mechanics',
    category: 'ANIMATION REEL',
    year: '2026',
    publishedDate: '18 Jan 2026',
    software: ['Blender', '3D Animation'],
    tags: ['Blender', '3D Animation', 'Demo Reel'],
    accent: 'yellow',
    thumbnail:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-13/982482/800xAUTO/SAMUS_THUMNAIL-SentinelPrime-crop.png',
    thumbnailHiRes:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-13/982482/1400xAUTO/SAMUS_THUMNAIL-SentinelPrime-crop.png',
    summary:
      'Demo reel centrada en peso, inercia y lectura de silueta con secuencias de acción sci-fi en Blender.',
    summaryEn:
      'Demo reel focused on weight, momentum, and silhouette clarity across sci-fi action sequences in Blender.',
    fullDescription: 'Samus Aran 3D animations set made using Blender.',
    highlights: [
      'Secuencias: Aerial, Idle, Run y Backflip acrobático',
      'Pulido de arcos y curvas F-Curve para máxima contundencia',
      'Modelo/rig base de Curiomatic animado en Blender',
    ],
    highlightsEn: [
      'Sequences: Aerial, Idle, Run, and acrobatic Backflip',
      'Polished motion arcs and F-Curves for punchy impact',
      'Animated in Blender on top of Curiomatic base model and rig',
    ],
    blocks: [
      { type: 'paragraph', text: 'About this piece', bold: true },
      {
        type: 'paragraph',
        text: 'These animations have been posible by using the model, texture and rigging uploaded by Curiomatic on his Youtube channel.',
      },
      {
        type: 'embed',
        src: 'https://www.youtube.com/embed/BhQWpWTCaMw',
        title: 'Samus Aran — 3D Animation Demo Reel',
      },
      { type: 'heading', text: 'AERIAL' },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/674819/AERIAL-SentinelPrime.gif',
        alt: 'Samus Aerial Animation',
      },
      { type: 'heading', text: 'IDLE' },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/411321/IDLE-SentinelPrime.gif',
        alt: 'Samus Idle Animation',
      },
      { type: 'heading', text: 'RUN' },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/339286/RUN-SentinelPrime.gif',
        alt: 'Samus Run Cycle',
      },
      { type: 'heading', text: 'BACKFLIP' },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/364613/BACKFLIP-SentinelPrime.gif',
        alt: 'Samus Backflip Animation',
      },
      { type: 'heading', text: 'THANK YOU' },
      {
        type: 'image',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/368631/SAMUS_THUMNAIL-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/368631/3840xAUTO/SAMUS_THUMNAIL-SentinelPrime.png',
        alt: 'Samus Aran Final Render',
      },
    ],
  },
  {
    id: 'meet-mat-tron',
    index: '05',
    title: 'Meet Mat 5 — Tron Legacy',
    fullTitle: 'Meet Mat 5 - Tron Legacy',
    subtitle: 'Lookdev y Materiales Neón Sci-Fi',
    subtitleEn: 'Lookdev & Sci-Fi Neon Materials',
    category: 'LOOKDEV',
    year: '2026',
    publishedDate: '14 Jan 2026',
    software: ['Adobe Substance 3D Painter', 'Blender'],
    tags: ['3D Texturing', 'Lookdev', 'Substance Painter', 'NoAI'],
    accent: 'blue',
    thumbnail:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-13/593273/800xAUTO/MEETMAT_THUMB-SentinelPrime-crop.png',
    thumbnailHiRes:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-13/593273/1400xAUTO/MEETMAT_THUMB-SentinelPrime-crop.png',
    summary:
      'Estudio PBR y emisión neón inspirado en Tron: Legacy, texturizado en Substance 3D Painter e iluminado en Blender.',
    summaryEn:
      'PBR and neon-emission lookdev study inspired by Tron: Legacy, textured in Substance 3D Painter and lit in Blender.',
    fullDescription: 'Tron Legacy themed Meet Mat Made in Adobe Substance Painter',
    highlights: [
      'Mapas emisivos y control preciso de roughness PBR',
      'Iluminación de alto contraste y compositing final en Blender',
    ],
    highlightsEn: [
      'Emissive maps and fine-tuned PBR roughness response',
      'High-contrast lighting and final compositing in Blender',
    ],
    blocks: [
      { type: 'paragraph', text: 'About the entry', bold: true },
      {
        type: 'paragraph',
        text: 'Here is my version of last year Meet Mat 5 inspired by the Tron Legacy movie since I am a big fan! This project also served me to get to know the software and try different tools to create beautiful results.',
      },
      {
        type: 'image',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-01-14/004299/Alejo_Molina_Adri%C3%A1n_SHOWVIEW-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-01-14/004299/3840xAUTO/Alejo_Molina_Adri%C3%A1n_SHOWVIEW-SentinelPrime.png',
        alt: 'Meet Mat 5 — Showview Turntable Render',
      },
      {
        type: 'gallery',
        columns: 4,
        items: [
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/656512/1400xAUTO/Alejo_Molina_Adri%C3%A1n_-SentinelPrime.jpg',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/656512/3840xAUTO/Alejo_Molina_Adri%C3%A1n_-SentinelPrime.jpg',
            alt: 'Meet Mat 5 Beauty Render 1',
          },
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/819606/1400xAUTO/Alejo_Molina_Adri%C3%A1n_Render_1-SentinelPrime.jpg',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/819606/3840xAUTO/Alejo_Molina_Adri%C3%A1n_Render_1-SentinelPrime.jpg',
            alt: 'Meet Mat 5 Beauty Render 2',
          },
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/263005/1400xAUTO/Alejo_Molina_Adri%C3%A1n_Render_5-SentinelPrime.jpg',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/263005/3840xAUTO/Alejo_Molina_Adri%C3%A1n_Render_5-SentinelPrime.jpg',
            alt: 'Meet Mat 5 Beauty Render 3',
          },
          {
            src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/266135/1400xAUTO/Alejo_Molina_Adri%C3%A1n_Render_6-SentinelPrime.jpg',
            hiResSrc:
              'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/266135/3840xAUTO/Alejo_Molina_Adri%C3%A1n_Render_6-SentinelPrime.jpg',
            alt: 'Meet Mat 5 Beauty Render 4',
          },
        ],
      },
      { type: 'paragraph', text: 'Video renders and Blender Export', bold: true },
      {
        type: 'paragraph',
        text: 'Some video renders I tried while exporting it to Blender! I learned so much about render compositing, lights and camera usage.',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/292331/RENDER_1-SentinelPrime.gif',
        alt: 'Blender Lighting Render 1',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/108500/RENDER_2-SentinelPrime.gif',
        alt: 'Blender Lighting Render 2',
      },
      { type: 'heading', text: 'THANK YOU' },
      {
        type: 'image',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/306967/MEETMAT_THUMB-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/306967/3840xAUTO/MEETMAT_THUMB-SentinelPrime.png',
        alt: 'Meet Mat 5 Final Thumbnail',
      },
    ],
  },
  {
    id: 'unity6-mobile',
    index: '06',
    title: 'Mobile Gameplay — Unity 6',
    fullTitle: 'Mobile Gameplay - Unity 6',
    subtitle: 'Pipeline Modular de Animación Real-Time',
    subtitleEn: 'Modular Real-Time Animation Pipeline',
    category: 'UNITY 6',
    year: '2026',
    publishedDate: '18 Jan 2026',
    software: ['Unity 6', 'Blender', 'Unity 3D'],
    tags: ['Unity', '3D', '3D Animation'],
    accent: 'purple',
    thumbnail:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-13/116174/800xAUTO/MOBILE_GAMEPLAY_THUMB-SentinelPrime-crop.png',
    thumbnailHiRes:
      'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-08-13/116174/1400xAUTO/MOBILE_GAMEPLAY_THUMB-SentinelPrime-crop.png',
    summary:
      'Tráiler jugable en Unity 6 demostrando rigging ligero por pivotes modulares y exportación directa desde Blender.',
    summaryEn:
      'Playable Unity 6 trailer showcasing lightweight modular pivot-point rigging and direct Blender export.',
    fullDescription:
      'Short trailer showcasing a bit of a mobile gameplay. In this project I got to rig simple characters and objects between Blender and Unity 6 in order to create a timeline with multiple events and modular animations.',
    highlights: [
      'Rigging ultraligero optimizado para rendimiento móvil',
      'Timeline modular por puntos de pivote entre Blender y Unity 6',
    ],
    highlightsEn: [
      'Ultra-lightweight rigging optimized for mobile performance',
      'Modular pivot-point timeline workflow between Blender and Unity 6',
    ],
    blocks: [
      { type: 'paragraph', text: 'About the environment', bold: true },
      {
        type: 'paragraph',
        text: 'For this project, I built the full environment in Unity using assets from the webpage Kenney.',
      },
      {
        type: 'embed',
        src: 'https://www.youtube.com/embed/x-jeUtrojLI',
        title: 'Mobile Gameplay — Unity 6 Trailer',
      },
      { type: 'paragraph', text: 'Characters and prop animation', bold: true },
      {
        type: 'paragraph',
        text: 'Pivot Point system for multiple and modular animation between the different characters',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-01-18/246864/Grabaci%C3%B3n%202026-01-18%20222930-SentinelPrime.gif',
        alt: 'Pivot Point System Demonstration',
      },
      { type: 'paragraph', text: 'Animations showcase', bold: true },
      {
        type: 'paragraph',
        text: 'A quick showcase of every animation used in the video as well as some objects of the environment',
      },
      {
        type: 'gif',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-01-18/840016/Grabacin2026-01-18223215-ezgif-SentinelPrime.com-optimize%20%281%29.gif',
        alt: 'Modular Character and Prop Animations Showcase',
      },
      { type: 'heading', text: 'THANK YOU' },
      {
        type: 'image',
        src: 'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/591549/MOBILE_GAMEPLAY_THUMB-SentinelPrime.png',
        hiResSrc:
          'https://d3stdg5so273ei.cloudfront.net/SentinelPrime/2026-09-11/591549/3840xAUTO/MOBILE_GAMEPLAY_THUMB-SentinelPrime.png',
        alt: 'Mobile Gameplay Final Visual',
      },
    ],
  },
];

export function findProjectById(id: string | null | undefined): PortfolioProject | null {
  if (!id) return null;
  return PORTFOLIO_PROJECTS.find((p) => p.id === id) ?? null;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    index: '01',
    title: 'Topología para Deformar',
    titleEn: 'Deformation-Ready Topology',
    description:
      'Edge-loops limpios en articulaciones y rostro para mantener el volumen en cualquier pose.',
    descriptionEn:
      'Clean edge-loops across joints and face to preserve volume through every pose.',
    accent: 'blue',
  },
  {
    index: '02',
    title: 'Armature & Weight Painting',
    titleEn: 'Armature & Weight Painting',
    description:
      'Jerarquías modulares, pivotes independientes y skinning preciso en dedos, hombros y cara.',
    descriptionEn:
      'Modular hierarchies, independent pivots, and precise skinning across fingers, shoulders, and face.',
    accent: 'purple',
  },
  {
    index: '03',
    title: 'Controles Animator-First',
    titleEn: 'Animator-First Controls',
    description:
      'Sistemas IK/FK y Blend Shapes intuitivos para centrarse en la actuación, nunca en pelear con el rig.',
    descriptionEn:
      'Intuitive IK/FK systems and Blend Shapes built to focus on acting, never fighting the rig.',
    accent: 'yellow',
  },
  {
    index: '04',
    title: 'Integración Real-Time',
    titleEn: 'Real-Time Integration',
    description:
      'Esqueletos optimizados y ciclos de locomoción y combate listos para Unity 6.',
    descriptionEn:
      'Optimized skeletons and locomotion & combat cycles ready for Unity 6.',
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

import { Component, Suspense, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { rigState, setRigShowWidgets, type WeightPaintZone } from './rigState';

const FINN_MODEL_URL = `${import.meta.env.BASE_URL}models/A2_PERSONAJE_AVANZADO_ADRIAN_ALEJO_MOLINA_WEB_PORTFOLIO.glb`;
const FINN_WIDGETS_URL = `${import.meta.env.BASE_URL}models/finn-widgets.json`;

const ENCOM_CYAN = new THREE.Color('#00f3ff');
const CYAN_CORE = new THREE.Color('#e6fcff');
const CYAN_MID = new THREE.Color('#00a3cc');
const ULTRAVIOLET = new THREE.Color('#bd00ff');
const VIOLET_CORE = new THREE.Color('#f5e6ff');
const XRAY_TINT = new THREE.Color('#00a3cc');

useGLTF.preload(FINN_MODEL_URL);

const normalizeBoneKey = (name: string) => name.replace(/\./g, '');

interface ExportedWidget {
  name: string;
  targetBone: string;
  group: 'root' | 'ik' | 'face' | 'fingers' | 'body';
  segments: number[];
}

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          aria-hidden="true"
          className="rf-grid-bg pointer-events-none fixed inset-0 z-0 opacity-35"
        />
      );
    }
    return this.props.children;
  }
}

interface StoredMaterial {
  material: THREE.MeshStandardMaterial;
  origTransparent: boolean;
  origOpacity: number;
  origEmissive: THREE.Color;
  origEmissiveIntensity: number;
  origDepthWrite: boolean;
}

/** Exact Blender Weight Paint rainbow colormap (0.0 blue -> 0.25 cyan -> 0.5 green -> 0.75 yellow -> 1.0 red) */
function sampleWeightHeatmap(w: number, out: THREE.Color): void {
  const t = Math.max(0, Math.min(1, w));
  if (t < 0.25) {
    const f = t / 0.25;
    out.setRGB(0.03 * (1 - f), 0.08 + 0.72 * f, 0.42 + 0.58 * f);
  } else if (t < 0.5) {
    const f = (t - 0.25) / 0.25;
    out.setRGB(0.0, 0.8 + 0.16 * f, 1.0 - 0.68 * f);
  } else if (t < 0.75) {
    const f = (t - 0.5) / 0.25;
    out.setRGB(f, 0.96 - 0.06 * f, 0.32 * (1 - f));
  } else {
    const f = (t - 0.75) / 0.25;
    out.setRGB(1.0, 0.9 * (1 - f) + 0.08 * f, 0.08 * f);
  }
}

function matchesWeightZone(boneName: string, zone: WeightPaintZone): boolean {
  const k = normalizeBoneKey(boneName);
  switch (zone) {
    case 'head':
      return k === 'DEF_HEAD' || k === 'DEF_NECK' || k.startsWith('DEF_EAR');
    case 'torso':
      return k.startsWith('DEF_TORSO') || k === 'DEF_HIPS' || k.startsWith('DEF_SHOULDER');
    case 'armL':
      return (
        k.startsWith('DEF_UPPER_ARM_') && k.endsWith('L')
      ) || (
        k.startsWith('DEF_FOREARM_') && k.endsWith('L')
      ) || k === 'DEF_SHOULDERL';
    case 'hands':
      return k.startsWith('DEF_HAND') || k.startsWith('DEF_PALM') || k.startsWith('DEF_FINGER');
    case 'legs':
      return (
        k.startsWith('DEF_UPPER_LEG') ||
        k.startsWith('DEF_LOWER_LEG') ||
        k.startsWith('DEF_FOOT') ||
        k.startsWith('DEF_TOES')
      );
    case 'face':
      return k.startsWith('DEF_LIP') || k.startsWith('DEF_TONGUE') || k.startsWith('DEF_EYE');
    default:
      return false;
  }
}

/**
 * Finn The Human — Full Behind-the-Scenes Interactive Rig Lab:
 * 1. Real 38 Blender CTRL Custom Shape Widgets (extracted from FINN_ANTIGRAVITY.blend)
 * 2. Live Draggable 3D IK Target (analytical 2-bone arm IK + Eye/Head Aim sightlines)
 * 3. Real Blender Weight Painting Heatmap computed from Finn's actual vertex skinWeights
 * 4. Interactive Rig Mechanisms (CTRL_FINGERS_ROT, CTRL_FOOT_ROLL, CTRL_TONGUE_STRETCH)
 * 5. Smooth 4-animation state machine (IDLE crossed arms, SALUDO, CORRER, T-POSE) + smooth X-Ray dissolve
 */
function FinnCharacterRig({ reducedMotion }: { reducedMotion: boolean }) {
  const { scene } = useGLTF(FINN_MODEL_URL);
  const rootRef = useRef<THREE.Group>(null);
  const plinthRef = useRef<THREE.Group>(null);
  const ikGizmoRef = useRef<THREE.Group>(null);
  const scanRingRef = useRef<THREE.Group>(null);
  const solidRingRef = useRef<THREE.Group>(null);
  const { viewport, size } = useThree();

  const rigData = useMemo(() => {
    const bones = new Map<string, THREE.Bone>();
    const restQuats = new Map<string, THREE.Quaternion>();
    const restPositions = new Map<string, THREE.Vector3>();
    const restScales = new Map<string, THREE.Vector3>();
    const restWorldInv = new Map<string, THREE.Matrix4>();
    const storedMaterials: StoredMaterial[] = [];
    const seenMats = new Set<THREE.Material>();
    const skinnedMeshes: THREE.SkinnedMesh[] = [];

    scene.traverse((obj) => {
      if ((obj as THREE.Bone).isBone) {
        const bone = obj as THREE.Bone;
        bones.set(normalizeBoneKey(bone.name), bone);
      }

      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.frustumCulled = false;
        if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) {
          skinnedMeshes.push(mesh as THREE.SkinnedMesh);
        }
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          if (m && !seenMats.has(m)) {
            seenMats.add(m);
            const std = m as THREE.MeshStandardMaterial;
            if (!std.userData.__origRigState) {
              if ('roughness' in std) {
                std.roughness = Math.min(0.85, std.roughness ?? 0.65);
              }
              std.userData.__origRigState = {
                transparent: Boolean(std.transparent),
                opacity: std.opacity ?? 1,
                emissive: std.emissive ? std.emissive.clone() : new THREE.Color('#000000'),
                emissiveIntensity: std.emissiveIntensity ?? 0,
                depthWrite: std.depthWrite ?? true,
              };
            }
            const base = std.userData.__origRigState as {
              transparent: boolean;
              opacity: number;
              emissive: THREE.Color;
              emissiveIntensity: number;
              depthWrite: boolean;
            };
            storedMaterials.push({
              material: std,
              origTransparent: base.transparent,
              origOpacity: base.opacity,
              origEmissive: base.emissive.clone(),
              origEmissiveIntensity: base.emissiveIntensity,
              origDepthWrite: base.depthWrite,
            });
          }
        });
      }
    });

    // Stitch bones orphaned by Blender "Export Deformation Bones Only" back into anatomical parents
    scene.updateMatrixWorld(true);
    const reattach = (childNames: string[], parentName: string) => {
      const parentBone = bones.get(normalizeBoneKey(parentName));
      if (!parentBone) return;
      childNames.forEach((childName) => {
        const childBone = bones.get(normalizeBoneKey(childName));
        if (childBone && childBone.parent !== parentBone) {
          parentBone.attach(childBone);
        }
      });
    };

    reattach(
      ['DEF_PALM_01.L', 'DEF_PALM_02.L', 'DEF_PALM_03.L', 'DEF_FINGER_A_1.L'],
      'DEF_HAND.L',
    );
    reattach(
      ['DEF_PALM_01.R', 'DEF_PALM_02.R', 'DEF_PALM_03.R', 'DEF_FINGER_A_1.R'],
      'DEF_HAND.R',
    );
    reattach(
      ['DEF_LIP_CORNER.L', 'DEF_LIP_CORNER.R', 'DEF_LIP_LOWER_01', 'DEF_LIP_UPPER_01'],
      'DEF_HEAD',
    );
    reattach(['MCH_TORSO_03_ROT'], 'DEF_TORSO_03');
    bones.forEach((bone, key) => {
      if (key.startsWith('DEF_TONGUE_')) {
        const headBone = bones.get('DEF_HEAD');
        if (headBone && bone.parent !== headBone) {
          headBone.attach(bone);
        }
      }
    });

    // Record exact local rest transforms + inverse world matrices BEFORE any animation starts
    scene.updateMatrixWorld(true);
    bones.forEach((bone, key) => {
      restQuats.set(key, bone.quaternion.clone());
      restPositions.set(key, bone.position.clone());
      restScales.set(key, bone.scale.clone());
      restWorldInv.set(key, bone.matrixWorld.clone().invert());
    });

    // 1. Dedicated Neon Wireframe Overlay SkinnedMeshes (for smooth X-Ray dissolve)
    const xrayWireMat = new THREE.MeshBasicMaterial({
      color: CYAN_MID,
      wireframe: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
    });

    const wireOverlayGroup = new THREE.Group();
    const wireMeshes: THREE.SkinnedMesh[] = [];

    // 2. Real Blender Weight Painting Heatmap Overlay SkinnedMeshes (uses actual vertex skinWeights!)
    const weightMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    const weightOverlayGroup = new THREE.Group();
    const weightMeshes: { mesh: THREE.SkinnedMesh; orig: THREE.SkinnedMesh; geo: THREE.BufferGeometry }[] = [];

    skinnedMeshes.forEach((orig) => {
      // Wireframe clone
      const wireClone = new THREE.SkinnedMesh(orig.geometry, xrayWireMat);
      wireClone.position.copy(orig.position);
      wireClone.quaternion.copy(orig.quaternion);
      wireClone.scale.copy(orig.scale);
      wireClone.bind(orig.skeleton, orig.bindMatrix);
      wireClone.frustumCulled = false;
      wireClone.renderOrder = 15;
      wireClone.visible = false;
      wireOverlayGroup.add(wireClone);
      wireMeshes.push(wireClone);

      // Weight Paint heatmap clone (separate BufferGeometry so we can write per-vertex colors safely)
      const wGeo = orig.geometry.clone();
      const vCount = wGeo.getAttribute('position').count;
      const colors = new Float32Array(vCount * 3);
      wGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const wClone = new THREE.SkinnedMesh(wGeo, weightMat);
      wClone.position.copy(orig.position);
      wClone.quaternion.copy(orig.quaternion);
      wClone.scale.copy(orig.scale);
      wClone.bind(orig.skeleton, orig.bindMatrix);
      wClone.frustumCulled = false;
      wClone.renderOrder = 12;
      wClone.visible = false;
      weightOverlayGroup.add(wClone);
      weightMeshes.push({ mesh: wClone, orig, geo: wGeo });
    });

    // 3. Blender-style SkeletonHelper mounted at Scene root for 1:1 world alignment
    const skeletonHelper = new THREE.SkeletonHelper(scene);
    const skelMat = skeletonHelper.material as THREE.LineBasicMaterial;
    skelMat.depthTest = false;
    skelMat.depthWrite = false;
    skelMat.transparent = true;
    skelMat.opacity = 0;
    skelMat.toneMapped = false;
    skeletonHelper.renderOrder = 25;
    skeletonHelper.visible = false;

    const colorAttr = skeletonHelper.geometry.getAttribute('color') as
      | THREE.BufferAttribute
      | undefined;
    if (colorAttr) {
      for (let i = 0; i < colorAttr.count; i++) {
        const c = i % 2 === 0 ? ULTRAVIOLET : VIOLET_CORE;
        colorAttr.setXYZ(i, c.r, c.g, c.b);
      }
      colorAttr.needsUpdate = true;
    }

    // 4. Shared materials for Real Blender CTRL Widgets (Encom Cyan + Ultraviolet signature)
    const widgetMats = {
      root: new THREE.LineBasicMaterial({ color: ULTRAVIOLET, transparent: true, opacity: 0, depthTest: false, toneMapped: false }),
      body: new THREE.LineBasicMaterial({ color: ENCOM_CYAN, transparent: true, opacity: 0, depthTest: false, toneMapped: false }),
      ik: new THREE.LineBasicMaterial({ color: ENCOM_CYAN, transparent: true, opacity: 0, depthTest: false, toneMapped: false }),
      face: new THREE.LineBasicMaterial({ color: ULTRAVIOLET, transparent: true, opacity: 0, depthTest: false, toneMapped: false }),
      fingers: new THREE.LineBasicMaterial({ color: ULTRAVIOLET, transparent: true, opacity: 0, depthTest: false, toneMapped: false }),
    };

    // 5. Interactive IK Gizmo & Constraint Sightlines (mounted in Finn local space)
    const ikLineGeo = new THREE.BufferGeometry();
    ikLineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(4 * 3), 3));
    const ikLineMat = new THREE.LineBasicMaterial({
      color: ULTRAVIOLET,
      transparent: true,
      opacity: 0,
      depthTest: false,
      toneMapped: false,
    });
    const ikLine = new THREE.LineSegments(ikLineGeo, ikLineMat);
    ikLine.renderOrder = 28;
    ikLine.visible = false;

    const ikTargetBoxGeo = new THREE.OctahedronGeometry(0.085, 0);
    const ikTargetBoxMat = new THREE.MeshBasicMaterial({
      color: ENCOM_CYAN,
      wireframe: true,
      transparent: true,
      opacity: 0,
      depthTest: false,
      toneMapped: false,
    });
    const ikTargetCoreGeo = new THREE.BoxGeometry(0.045, 0.045, 0.045);
    const ikTargetCoreMat = new THREE.MeshBasicMaterial({
      color: CYAN_CORE,
      transparent: true,
      opacity: 0,
      depthTest: false,
      toneMapped: false,
    });

    // 6. Sharp hexagonal turntable plinth: Outer Ultraviolet (#BD00FF) + Inner Encom Cyan (#00F3FF)
    const hexOuterGeo = new THREE.TorusGeometry(0.62, 0.014, 4, 6);
    const hexInnerGeo = new THREE.TorusGeometry(0.45, 0.009, 4, 6);
    const hexOuterMat = new THREE.MeshBasicMaterial({
      color: ULTRAVIOLET,
      toneMapped: false,
      transparent: true,
      opacity: 0.92,
    });
    const hexInnerMat = new THREE.MeshBasicMaterial({
      color: ENCOM_CYAN,
      toneMapped: false,
      transparent: true,
      opacity: 0.9,
    });

    // 7. Tron 3D Wireframe-to-Solid "Rezzing" Boot Clipping Planes & Scan Ring
    const bootSolidClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), -100);
    const bootWireUpperClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), -100);
    const bootWireLowerClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 100);

    const scanRingCoreGeo = new THREE.TorusGeometry(0.66, 0.014, 8, 48);
    const scanRingHaloGeo = new THREE.TorusGeometry(0.71, 0.008, 6, 48);
    const scanRingCoreMat = new THREE.MeshBasicMaterial({
      color: CYAN_CORE,
      toneMapped: false,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const scanRingHaloMat = new THREE.MeshBasicMaterial({
      color: ULTRAVIOLET,
      toneMapped: false,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const solidRingGeo = new THREE.TorusGeometry(0.68, 0.009, 6, 48);
    const solidRingMat = new THREE.MeshBasicMaterial({
      color: ULTRAVIOLET,
      toneMapped: false,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    return {
      bones,
      restQuats,
      restPositions,
      restScales,
      restWorldInv,
      storedMaterials,
      xrayWireMat,
      wireOverlayGroup,
      wireMeshes,
      weightMat,
      weightOverlayGroup,
      weightMeshes,
      skeletonHelper,
      skelMat,
      widgetMats,
      ikLine,
      ikLineGeo,
      ikLineMat,
      ikTargetBoxGeo,
      ikTargetBoxMat,
      ikTargetCoreGeo,
      ikTargetCoreMat,
      hexOuterGeo,
      hexInnerGeo,
      hexOuterMat,
      hexInnerMat,
      bootSolidClip,
      bootWireUpperClip,
      bootWireLowerClip,
      scanRingCoreGeo,
      scanRingHaloGeo,
      scanRingCoreMat,
      scanRingHaloMat,
      solidRingGeo,
      solidRingMat,
    };
  }, [scene]);

  // Dynamically load Adrián's 38 REAL Blender CTRL widgets from finn-widgets.json and mount them to their real bones!
  const widgetLinesRef = useRef<THREE.LineSegments[]>([]);
  useEffect(() => {
    let cancelled = false;
    const mounted: { line: THREE.LineSegments; parent: THREE.Object3D; geo: THREE.BufferGeometry }[] = [];

    fetch(FINN_WIDGETS_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { widgets?: ExportedWidget[] } | null) => {
        if (cancelled || !data?.widgets || !rootRef.current) return;

        const tmpV = new THREE.Vector3();
        data.widgets.forEach((w) => {
          const isRoot = w.targetBone === 'ROOT';
          const boneKey = normalizeBoneKey(w.targetBone);
          const bone = isRoot ? null : rigData.bones.get(boneKey) ?? null;
          const invMat = isRoot ? null : rigData.restWorldInv.get(boneKey) ?? null;
          const parentObj: THREE.Object3D = bone ?? rootRef.current!;

          const posArr = new Float32Array(w.segments.length);
          for (let i = 0; i < w.segments.length; i += 3) {
            tmpV.set(w.segments[i], w.segments[i + 1], w.segments[i + 2]);
            if (invMat) {
              tmpV.applyMatrix4(invMat);
            }
            posArr[i] = tmpV.x;
            posArr[i + 1] = tmpV.y;
            posArr[i + 2] = tmpV.z;
          }

          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
          const mat = rigData.widgetMats[w.group] ?? rigData.widgetMats.body;
          const line = new THREE.LineSegments(geo, mat);
          line.name = `WGT_${w.name}`;
          line.renderOrder = 22;
          line.visible = false;
          line.frustumCulled = false;

          parentObj.add(line);
          mounted.push({ line, parent: parentObj, geo });
          widgetLinesRef.current.push(line);
        });
      })
      .catch(() => {
        // Ignore widget load failure gracefully
      });

    return () => {
      cancelled = true;
      mounted.forEach(({ line, parent, geo }) => {
        parent.remove(line);
        geo.dispose();
      });
      widgetLinesRef.current = [];
    };
  }, [rigData]);

  // Cleanup GPU resources on unmount
  useEffect(() => {
    return () => {
      rigData.storedMaterials.forEach((s) => {
        s.material.clippingPlanes = null;
        s.material.transparent = s.origTransparent;
        s.material.opacity = s.origOpacity;
        s.material.emissive.copy(s.origEmissive);
        s.material.emissiveIntensity = s.origEmissiveIntensity;
        s.material.depthWrite = s.origDepthWrite;
        s.material.needsUpdate = true;
      });
      rigData.xrayWireMat.clippingPlanes = null;
      rigData.xrayWireMat.dispose();
      rigData.weightMat.dispose();
      rigData.weightMeshes.forEach((wm) => wm.geo.dispose());
      rigData.skeletonHelper.geometry.dispose();
      rigData.skelMat.dispose();
      Object.values(rigData.widgetMats).forEach((m) => m.dispose());
      rigData.ikLineGeo.dispose();
      rigData.ikLineMat.dispose();
      rigData.ikTargetBoxGeo.dispose();
      rigData.ikTargetBoxMat.dispose();
      rigData.ikTargetCoreGeo.dispose();
      rigData.ikTargetCoreMat.dispose();
      rigData.hexOuterGeo.dispose();
      rigData.hexInnerGeo.dispose();
      rigData.hexOuterMat.dispose();
      rigData.hexInnerMat.dispose();
      rigData.scanRingCoreGeo.dispose();
      rigData.scanRingHaloGeo.dispose();
      rigData.scanRingCoreMat.dispose();
      rigData.scanRingHaloMat.dispose();
      rigData.solidRingGeo.dispose();
      rigData.solidRingMat.dispose();
    };
  }, [rigData]);

  // Continuous phase accumulators + smooth crossfade & dissolve states
  const anim = useMemo(
    () => ({
      targetPos: new THREE.Vector3(2.0, -1.32, 0.15),
      deltaEuler: new THREE.Euler(),
      deltaQuat: new THREE.Quaternion(),
      targetQuat: new THREE.Quaternion(),
      tmpColor: new THREE.Color(),
      vShoulder: new THREE.Vector3(),
      vTarget: new THREE.Vector3(),
      vElbow: new THREE.Vector3(),
      vDir1: new THREE.Vector3(),
      vDir2: new THREE.Vector3(),
      vCurDir: new THREE.Vector3(),
      vPole: new THREE.Vector3(),
      vPerp: new THREE.Vector3(),
      vEyeL: new THREE.Vector3(),
      vEyeR: new THREE.Vector3(),
      qWorld: new THREE.Quaternion(),
      qParent: new THREE.Quaternion(),
      qDelta: new THREE.Quaternion(),
      qNewLocal: new THREE.Quaternion(),
      smoothPtrX: 0,
      smoothPtrY: 0,
      slowPtrX: 0,
      slowPtrY: 0,
      wIdle: 1,
      wWave: 0,
      wRun: 0,
      wPose: 1,
      wIkHand: 0,
      wIkEye: 0,
      wMech: 0,
      breathPhase: 0,
      swayPhase: 0,
      wavePhase: 0,
      runPhase: 0,
      moodClock: 0,
      blinkClock: 0,
      smoothMood: 0.35,
      xrayMix: 0,
      bonesMix: 0,
      ctrlMix: 0,
      weightMix: 0,
      ikGizmoMix: 0,
      lastWeightZone: 'none' as WeightPaintZone,
      bootClock: 0,
      bootApplied: false,
      bootFinished: false,
      bootCtrlRevealed: false,
    }),
    [],
  );

  // Recompute real vertex Weight Paint colors whenever weightZone changes
  const updateWeightHeatmapColors = (zone: WeightPaintZone) => {
    if (zone === 'none') return;
    rigData.weightMeshes.forEach(({ orig, geo }) => {
      const skelBones = orig.skeleton.bones;
      const matchingBoneIndices = new Set<number>();
      skelBones.forEach((b, idx) => {
        if (matchesWeightZone(b.name, zone)) {
          matchingBoneIndices.add(idx);
        }
      });

      const skinIdx = orig.geometry.getAttribute('skinIndex');
      const skinWgt = orig.geometry.getAttribute('skinWeight');
      const colAttr = geo.getAttribute('color') as THREE.BufferAttribute;
      if (!skinIdx || !skinWgt || !colAttr) return;

      for (let i = 0; i < colAttr.count; i++) {
        let sum = 0;
        for (let j = 0; j < 4; j++) {
          const bIdx = skinIdx.getComponent(i, j);
          if (matchingBoneIndices.has(bIdx)) {
            sum += skinWgt.getComponent(i, j);
          }
        }
        sampleWeightHeatmap(sum, anim.tmpColor);
        colAttr.setXYZ(i, anim.tmpColor.r, anim.tmpColor.g, anim.tmpColor.b);
      }
      colAttr.needsUpdate = true;
    });
  };

  const poseBone = (rawName: string, rx: number, ry: number, rz: number, alpha: number) => {
    const key = normalizeBoneKey(rawName);
    const bone = rigData.bones.get(key);
    const rest = rigData.restQuats.get(key);
    if (!bone || !rest) return;
    anim.deltaEuler.set(rx, ry, rz, 'XYZ');
    anim.deltaQuat.setFromEuler(anim.deltaEuler);
    anim.targetQuat.copy(rest).multiply(anim.deltaQuat);
    bone.quaternion.slerp(anim.targetQuat, alpha);
  };

  // Aims a bone's local +Y cleanly toward a desired direction inside rootRef local space (for live 2-bone IK!)
  const aimBoneInRoot = (rawName: string, desiredRootDir: THREE.Vector3, alpha: number) => {
    const key = normalizeBoneKey(rawName);
    const bone = rigData.bones.get(key);
    if (!bone || !bone.parent || !rootRef.current) return;
    rootRef.current.updateMatrixWorld(true);
    bone.getWorldQuaternion(anim.qWorld);
    bone.parent.getWorldQuaternion(anim.qParent);

    // Convert desired direction from rootRef local space to world space
    rootRef.current.getWorldQuaternion(anim.targetQuat);
    const desiredWorldDir = anim.vPerp.copy(desiredRootDir).applyQuaternion(anim.targetQuat).normalize();
    anim.vCurDir.set(0, 1, 0).applyQuaternion(anim.qWorld).normalize();
    anim.qDelta.setFromUnitVectors(anim.vCurDir, desiredWorldDir);

    anim.qNewLocal.copy(anim.qParent).invert().multiply(anim.qDelta).multiply(anim.qWorld);
    bone.quaternion.slerp(anim.qNewLocal, alpha);
  };

  const offsetBonePos = (rawName: string, dx: number, dy: number, dz: number, alpha: number) => {
    const key = normalizeBoneKey(rawName);
    const bone = rigData.bones.get(key);
    const rest = rigData.restPositions.get(key);
    if (!bone || !rest) return;
    bone.position.x = THREE.MathUtils.lerp(bone.position.x, rest.x + dx, alpha);
    bone.position.y = THREE.MathUtils.lerp(bone.position.y, rest.y + dy, alpha);
    bone.position.z = THREE.MathUtils.lerp(bone.position.z, rest.z + dz, alpha);
  };

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const isNarrow = size.width < 1024;
    const isShortDesktop = !isNarrow && size.height < 740;
    const motionScale = reducedMotion ? 0.35 : 1;

    if (rigState.scrollVelocity !== 0) {
      rigState.scrollVelocity *= Math.pow(0.92, dt * 60);
      if (Math.abs(rigState.scrollVelocity) < 0.001) {
        rigState.scrollVelocity = 0;
      }
    }

    // 1. Advance continuous phase accumulators driven dramatically by Energy/Speed slider
    const sec = rigState.activeSection;
    const isContactFarewell = sec === 3;
    const rawEnergy = rigState.actingEnergy;
    const speedMul = (0.12 + Math.pow(rawEnergy, 1.4) * 3.1) * motionScale;
    const waveSpeed = isContactFarewell ? Math.max(speedMul, 1.05 * motionScale) : speedMul;
    const actAmp = (0.55 + rawEnergy * 0.55) * motionScale;
    const runAmp = (0.78 + rawEnergy * 0.28) * motionScale;

    anim.breathPhase += 1.85 * speedMul * dt;
    anim.swayPhase += 0.92 * speedMul * dt;
    anim.wavePhase += 4.2 * waveSpeed * dt;
    anim.runPhase += 6.4 * speedMul * dt;
    anim.moodClock += dt;
    anim.blinkClock += dt;

    // 2. Smooth crossfade weights across Animation / IK Lab / Mechanisms Lab
    const blendRate = 1 - Math.exp(-5.5 * dt);
    const ikHandActive = !isContactFarewell && rigState.labTab === 'ik' && rigState.ikMode === 'hand';
    const ikEyeActive = !isContactFarewell && rigState.labTab === 'ik' && rigState.ikMode === 'eye';
    const mechActive = !isContactFarewell && rigState.labTab === 'mech';

    const preset = rigState.preset;
    const overrideStanding = ikHandActive || ikEyeActive || mechActive;
    const targetPose = isContactFarewell
      ? 1
      : !overrideStanding && preset === 'tpose'
        ? 0
        : overrideStanding
          ? 1
          : rigState.poseBlend;

    anim.wPose = THREE.MathUtils.lerp(anim.wPose, targetPose, blendRate);
    anim.wIkHand = THREE.MathUtils.lerp(anim.wIkHand, ikHandActive ? 1 : 0, blendRate);
    anim.wIkEye = THREE.MathUtils.lerp(anim.wIkEye, ikEyeActive ? 1 : 0, blendRate);
    anim.wMech = THREE.MathUtils.lerp(anim.wMech, mechActive ? 1 : 0, blendRate);

    const effectivePreset = isContactFarewell ? 'wave' : overrideStanding ? 'idle' : preset;
    anim.wIdle = THREE.MathUtils.lerp(anim.wIdle, effectivePreset === 'idle' ? 1 : 0, blendRate);
    anim.wWave = THREE.MathUtils.lerp(anim.wWave, effectivePreset === 'wave' ? 1 : 0, blendRate);
    anim.wRun = THREE.MathUtils.lerp(anim.wRun, effectivePreset === 'run' ? 1 : 0, blendRate);

    const wI = anim.wIdle * anim.wPose * (1 - Math.max(anim.wIkHand, anim.wMech));
    const wW = anim.wWave * anim.wPose;
    const wR = anim.wRun * anim.wPose;
    const p = anim.wPose;

    // 3. Section-aware framing (mobile < 1024px keeps Finn clear of UI; desktop >= 1024px unchanged)
    let targetRotY = -0.32;
    if (sec === 0) {
      anim.targetPos.set(
        isNarrow ? 0 : Math.min(viewport.width * 0.27, 2.05),
        isNarrow ? -1.46 : -1.32,
        isNarrow ? -0.25 : 0.15,
      );
      targetRotY = isNarrow ? -0.18 : -0.34;
    } else if (sec === 1) {
      anim.targetPos.set(
        isNarrow ? 0 : -Math.min(viewport.width * 0.3, 2.45),
        -1.35,
        isNarrow ? -3.8 : -1.85,
      );
      targetRotY = 0.35 + rigState.showcaseProgress * 1.4;
    } else if (sec === 2) {
      const mechAngle =
        mechActive && Math.abs(rigState.footRoll) > 0.08
          ? 0.55
          : mechActive && rigState.mouthTongue > 0.1
            ? -0.22
            : 0.04;
      if (isNarrow) {
        if (rigState.pipelineLabFocused) {
          // Frame Finn inside the dedicated top preview window above mobile Rig Lab controls
          anim.targetPos.set(0, 0.28, -0.45);
        } else {
          // Tuck Finn gently back while reading pipeline steps 01..04
          anim.targetPos.set(0, -1.35, -3.2);
        }
      } else {
        anim.targetPos.set(0, -1.32, 0.22);
      }
      targetRotY = mechAngle;
    } else {
      anim.targetPos.set(
        isNarrow ? 0 : -Math.min(viewport.width * 0.325, 2.22),
        isNarrow ? 0.36 : -1.36,
        isNarrow ? -0.45 : -0.3,
      );
      targetRotY = isNarrow ? 0.16 : 0.38;
    }

    if (rootRef.current) {
      rootRef.current.position.lerp(anim.targetPos, 1 - Math.exp(-4.4 * dt));
      const baseScale = isNarrow
        ? sec === 0
          ? 0.86
          : sec === 2 && rigState.pipelineLabFocused
            ? 0.78
            : sec === 3
              ? 0.72
              : 0.76
        : (sec === 2 ? 1.54 : sec === 3 ? 1.32 : 1.46) * (isShortDesktop ? 0.88 : 1);
      const nextScale = THREE.MathUtils.lerp(rootRef.current.scale.x, baseScale, 1 - Math.exp(-4.5 * dt));
      rootRef.current.scale.setScalar(nextScale);
      const effectiveRotY = THREE.MathUtils.lerp(targetRotY, 0.8, wR);
      const ptrYawInfluence = ikHandActive || ikEyeActive ? 0 : rigState.pointerX * 0.1 * motionScale * (1 - wR * 0.85);
      rootRef.current.rotation.y = THREE.MathUtils.lerp(
        rootRef.current.rotation.y,
        effectiveRotY + ptrYawInfluence,
        1 - Math.exp(-3.6 * dt),
      );
    }

    if (plinthRef.current && !reducedMotion) {
      plinthRef.current.rotation.z += (0.2 + wR * 1.4) * speedMul * dt;
    }

    // 4. Layered pointer tracking (overridden cleanly by dragged Eye Aim target in IK Eye mode!)
    const fastLerp = 1 - Math.exp(-8.0 * dt);
    const slowLerp = 1 - Math.exp(-3.8 * dt);
    const aimSrcX = ikEyeActive ? rigState.ikTargetX * 1.35 : rigState.pointerX;
    const aimSrcY = ikEyeActive ? rigState.ikTargetY * 1.25 : rigState.pointerY;

    anim.smoothPtrX = THREE.MathUtils.lerp(anim.smoothPtrX, aimSrcX * motionScale, fastLerp);
    anim.smoothPtrY = THREE.MathUtils.lerp(anim.smoothPtrY, aimSrcY * motionScale, fastLerp);
    anim.slowPtrX = THREE.MathUtils.lerp(anim.slowPtrX, aimSrcX * motionScale, slowLerp);
    anim.slowPtrY = THREE.MathUtils.lerp(anim.slowPtrY, aimSrcY * motionScale, slowLerp);

    const px = anim.smoothPtrX;
    const py = anim.smoothPtrY;
    const boneAlpha = 1 - Math.exp(-11.0 * dt);

    const breath = Math.sin(anim.breathPhase) * 0.034 * actAmp;
    const sway = Math.sin(anim.swayPhase) * 0.028 * actAmp;
    const runSin = Math.sin(anim.runPhase);
    const runCos = Math.cos(anim.runPhase);
    const runDoubleSin = Math.sin(anim.runPhase * 2);
    const runHipY = (Math.abs(runSin) * 0.082 - 0.05) * runAmp;

    // 5. HIPS & SPINE
    const hips = rigData.bones.get('DEF_HIPS');
    const hipsRest = rigData.restPositions.get('DEF_HIPS');
    const footRollVal = anim.wMech * rigState.footRoll;
    if (hips && hipsRest) {
      // Subtle lift when standing on tip-toes (+footRoll), dip when rocking back on heel (-footRoll)
      const footRollHipY = Math.max(0, footRollVal) * 0.045 - Math.max(0, -footRollVal) * 0.02;
      const targetHipY =
        hipsRest.y +
        (1 - wR) * Math.sin(anim.breathPhase) * 0.015 * actAmp * p +
        wR * runHipY +
        footRollHipY;
      const targetHipX = hipsRest.x + (1 - wR) * sway * 0.12 * p * (1 - anim.wIkHand);
      hips.position.y = THREE.MathUtils.lerp(hips.position.y, targetHipY, boneAlpha);
      hips.position.x = THREE.MathUtils.lerp(hips.position.x, targetHipX, boneAlpha);
    }

    poseBone(
      'DEF_HIPS',
      (1 - wR) * breath * 0.35 * p + wR * 0.14,
      (1 - wR) * sway * 0.45 * p * (1 - anim.wIkHand) + wR * (runSin * 0.16),
      (1 - wR) * sway * 0.22 * p * (1 - anim.wIkHand) + wR * (runCos * 0.05),
      boneAlpha,
    );

    const lookTorsoScale = (1 - wR * 0.75) * p;
    poseBone(
      'DEF_TORSO_01',
      (1 - wR) * breath * 0.65 * p + wR * (0.15 + runDoubleSin * 0.035),
      anim.slowPtrX * 0.1 * lookTorsoScale + wR * (-runSin * 0.14),
      -(1 - wR) * sway * 0.22 * p * (1 - anim.wIkHand),
      boneAlpha,
    );
    poseBone(
      'DEF_TORSO_02',
      -(1 - wR) * breath * 0.42 * p - anim.slowPtrY * 0.06 * lookTorsoScale + wR * 0.1,
      anim.slowPtrX * 0.12 * lookTorsoScale + wR * (-runSin * 0.12),
      0,
      boneAlpha,
    );
    poseBone(
      'DEF_TORSO_03',
      -(1 - wR) * breath * 0.48 * p - anim.slowPtrY * 0.07 * lookTorsoScale + wR * 0.06,
      anim.slowPtrX * 0.14 * lookTorsoScale + wR * (-runSin * 0.1),
      0,
      boneAlpha,
    );

    // 6. NECK, HEAD, EYES & HAT EARS
    const headLook = p * (1 - wR * 0.45);
    const eyeBoost = ikEyeActive ? 1.45 : 1;
    poseBone(
      'DEF_NECK',
      -py * 0.16 * headLook * eyeBoost - wR * 0.16,
      px * 0.22 * headLook * eyeBoost,
      -px * 0.05 * headLook,
      boneAlpha,
    );
    poseBone(
      'DEF_HEAD',
      -py * 0.32 * headLook * eyeBoost + (1 - wR) * breath * 0.42 * p - wR * 0.18,
      px * 0.45 * headLook * eyeBoost,
      -px * 0.1 * headLook + (1 - wR) * sway * 0.25 * p + wW * 0.07,
      boneAlpha,
    );

    poseBone('DEF_EYE.L', -py * 0.18 * p * eyeBoost, px * 0.24 * p * eyeBoost, 0, boneAlpha);
    poseBone('DEF_EYE.R', -py * 0.18 * p * eyeBoost, px * 0.24 * p * eyeBoost, 0, boneAlpha);

    const earLagX = (px - anim.slowPtrX) * 0.85;
    const earBounce =
      (1 - wR) * Math.sin(anim.breathPhase - 0.6) * 0.09 * actAmp * p +
      wR * (-0.34 + Math.sin(anim.runPhase * 2 - 0.6) * 0.22 * runAmp);
    poseBone('DEF_EAR.L', earBounce, 0, -earLagX * 0.5 - 0.06 * p, boneAlpha);
    poseBone('DEF_EAR.R', earBounce, 0, -earLagX * 0.5 + 0.06 * p, boneAlpha);

    // 7. ARMS — IDLE (Stacked Crossed), SALUDO (Wave), CORRER (Forward Sprint), MECHANISMS (Open Presentation), OR LIVE 2-BONE IK!
    const idleBreathArm = Math.sin(anim.breathPhase - 0.2) * 0.018 * actAmp;
    const lRunSwing = runSin * 0.72 * runAmp;
    const wMech = anim.wMech;
    const wRelaxL = wW + anim.wIkHand;

    // LEFT ARM (in Mechanisms mode, holds hand cleanly out & forward so user inspects CTRL_FINGERS_ROT!)
    poseBone(
      'DEF_UPPER_ARM_1.L',
      wI * (-0.657 + idleBreathArm) +
        wRelaxL * (-1.22 + idleBreathArm) +
        wMech * -0.92 +
        wR * -1.16,
      wI * 0.349,
      wI * -0.954 + wRelaxL * -0.05 + wMech * -0.45 + wR * (lRunSwing - 0.12),
      boneAlpha,
    );
    poseBone(
      'DEF_UPPER_ARM_2.L',
      wI * -0.022 + wRelaxL * -0.04,
      0,
      wI * -0.042 + wMech * -0.1 + wR * -0.06,
      boneAlpha,
    );
    poseBone(
      'DEF_UPPER_ARM_3.L',
      wI * 0.001 + wRelaxL * -0.02,
      0,
      wI * -0.344 + wMech * -0.1 + wR * -0.08,
      boneAlpha,
    );
    poseBone(
      'DEF_FOREARM_1.L',
      wI * -0.411 + wRelaxL * -0.04,
      wI * 0.158 + wMech * -0.3,
      wI * -0.725 + wRelaxL * -0.12 + wMech * -0.35 + wR * (-0.44 - Math.max(0, -runSin) * 0.2),
      boneAlpha,
    );
    poseBone(
      'DEF_FOREARM_2.L',
      wI * -0.27,
      wI * 0.035 + wMech * -0.3,
      wI * -0.255 + wRelaxL * -0.06 + wMech * -0.2 + wR * -0.34,
      boneAlpha,
    );
    poseBone(
      'DEF_FOREARM_3.L',
      wI * -0.18,
      wI * 0.012 + wMech * -0.2,
      wI * -0.135 + wR * -0.18,
      boneAlpha,
    );
    poseBone('DEF_HAND.L', wI * -0.365, wI * 0.023 + wMech * -0.2, wI * -0.125, boneAlpha);

    // RIGHT ARM: when IK Hand mode is active, run real-time analytical 2-bone IK solver!
    if (anim.wIkHand > 0.5) {
      // Smoothly reset roll before aiming each segment for zero accumulated twist
      const shBone = rigData.bones.get('DEF_UPPER_ARM_1R');
      if (shBone && rootRef.current) {
        rootRef.current.updateMatrixWorld(true);
        shBone.getWorldPosition(anim.vShoulder);
        rootRef.current.worldToLocal(anim.vShoulder);

        // Target position in Finn local space driven directly by user dragging the IK gizmo!
        const tx = -0.38 + rigState.ikTargetX * 0.44;
        const ty = 1.32 + rigState.ikTargetY * 0.46;
        const tz = 0.22 + (1 - Math.abs(rigState.ikTargetX)) * 0.14;
        anim.vTarget.set(tx, ty, tz);

        // Analytical 2-bone IK (Law of Cosines) with natural back-outward elbow pole vector
        const L1 = 0.34;
        const L2 = 0.34;
        anim.vDir1.subVectors(anim.vTarget, anim.vShoulder);
        const dist = THREE.MathUtils.clamp(anim.vDir1.length(), 0.14, L1 + L2 - 0.008);
        anim.vDir1.normalize();

        // Pole vector pointing outward-right & slightly back-down (natural human elbow bend!)
        anim.vPole.set(-0.55, -0.35, -0.75).normalize();
        const dotP = anim.vPole.dot(anim.vDir1);
        anim.vPerp.copy(anim.vPole).addScaledVector(anim.vDir1, -dotP);
        if (anim.vPerp.lengthSq() < 0.0001) anim.vPerp.set(0, -1, 0);
        anim.vPerp.normalize();

        const cosA = THREE.MathUtils.clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1);
        const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));

        anim.vElbow
          .copy(anim.vShoulder)
          .addScaledVector(anim.vDir1, L1 * cosA)
          .addScaledVector(anim.vPerp, L1 * sinA);

        const upperDir = anim.vDir1.subVectors(anim.vElbow, anim.vShoulder).normalize();
        const foreDir = anim.vDir2.subVectors(anim.vTarget, anim.vElbow).normalize();
        const midDir = anim.vPole.copy(upperDir).lerp(foreDir, 0.45).normalize();

        const ikAlpha = 1 - Math.exp(-15 * dt);
        aimBoneInRoot('DEF_UPPER_ARM_1.R', upperDir, ikAlpha);
        aimBoneInRoot('DEF_UPPER_ARM_2.R', upperDir, ikAlpha);
        aimBoneInRoot('DEF_UPPER_ARM_3.R', midDir, ikAlpha);
        aimBoneInRoot('DEF_FOREARM_1.R', foreDir, ikAlpha);
        aimBoneInRoot('DEF_FOREARM_2.R', foreDir, ikAlpha);
        aimBoneInRoot('DEF_FOREARM_3.R', foreDir, ikAlpha);
        aimBoneInRoot('DEF_HAND.R', foreDir, ikAlpha);

        // Update glowing IK constraint line (shoulder -> elbow -> target) & 3D gizmo cube
        if (ikGizmoRef.current) {
          ikGizmoRef.current.position.copy(anim.vTarget);
          ikGizmoRef.current.rotation.y += 1.6 * dt;
          ikGizmoRef.current.rotation.x += 1.1 * dt;
        }
        const posAttr = rigData.ikLineGeo.getAttribute('position') as THREE.BufferAttribute;
        posAttr.setXYZ(0, anim.vShoulder.x, anim.vShoulder.y, anim.vShoulder.z);
        posAttr.setXYZ(1, anim.vElbow.x, anim.vElbow.y, anim.vElbow.z);
        posAttr.setXYZ(2, anim.vElbow.x, anim.vElbow.y, anim.vElbow.z);
        posAttr.setXYZ(3, anim.vTarget.x, anim.vTarget.y, anim.vTarget.z);
        posAttr.needsUpdate = true;
      }
    } else {
      const waveOsc = Math.sin(anim.wavePhase) * actAmp;
      const waveLag = Math.sin(anim.wavePhase - 0.45) * actAmp;
      const rRunSwing = runSin * 0.72 * runAmp;

      poseBone(
        'DEF_UPPER_ARM_1.R',
        wI * (-1.096 - idleBreathArm) +
          wW * (0.06 + waveOsc * 0.06) +
          wMech * -0.92 +
          wR * -1.16,
        wI * -0.353,
        wI * 0.568 + wW * 0.22 + wMech * 0.45 + wR * (rRunSwing + 0.12),
        boneAlpha,
      );
      poseBone(
        'DEF_UPPER_ARM_2.R',
        wI * -0.025 + wW * (0.24 + waveOsc * 0.05),
        0,
        wI * 0.039 + wW * 0.04 + wMech * 0.1 + wR * 0.06,
        boneAlpha,
      );
      poseBone(
        'DEF_UPPER_ARM_3.R',
        wI * -0.032 + wW * (0.3 + waveOsc * 0.05),
        wI * -0.007,
        wI * 0.454 + wW * 0.02 + wMech * 0.1 + wR * 0.08,
        boneAlpha,
      );
      poseBone(
        'DEF_FOREARM_1.R',
        wI * -0.734 + wW * (0.36 + waveOsc * 0.09),
        wI * -0.227 + wW * 0.18 + wMech * 0.3,
        wI * 0.577 + wMech * 0.35 + wR * (0.44 + Math.max(0, runSin) * 0.2),
        boneAlpha,
      );
      poseBone(
        'DEF_FOREARM_2.R',
        wI * -0.323 + wW * (0.32 + waveOsc * 0.09),
        wI * -0.008 + wW * 0.34 + wMech * 0.3,
        wI * 0.049 + wMech * 0.2 + wR * 0.34,
        boneAlpha,
      );
      poseBone(
        'DEF_FOREARM_3.R',
        wI * -0.231 + wW * (0.22 + waveLag * 0.08),
        wI * -0.002 + wW * 0.34 + wMech * 0.2,
        wI * 0.02 + wR * 0.18,
        boneAlpha,
      );
      poseBone(
        'DEF_HAND.R',
        wI * -0.467 + wW * (0.04 + waveLag * 0.15),
        wI * 0.012 + wW * 0.26 + wMech * 0.2,
        wI * -0.05,
        boneAlpha,
      );
    }

    // Eye Aim mode: update glowing cyan aim target & twin eye sightlines!
    if (ikEyeActive && rootRef.current) {
      const eyeL = rigData.bones.get('DEF_EYEL');
      const eyeR = rigData.bones.get('DEF_EYER');
      if (eyeL && eyeR) {
        rootRef.current.updateMatrixWorld(true);
        eyeL.getWorldPosition(anim.vEyeL);
        eyeR.getWorldPosition(anim.vEyeR);
        rootRef.current.worldToLocal(anim.vEyeL);
        rootRef.current.worldToLocal(anim.vEyeR);

        anim.vTarget.set(rigState.ikTargetX * 0.72, 1.56 + rigState.ikTargetY * 0.45, 0.78);
        if (ikGizmoRef.current) {
          ikGizmoRef.current.position.copy(anim.vTarget);
          ikGizmoRef.current.rotation.z += 1.4 * dt;
        }
        const posAttr = rigData.ikLineGeo.getAttribute('position') as THREE.BufferAttribute;
        posAttr.setXYZ(0, anim.vEyeL.x, anim.vEyeL.y, anim.vEyeL.z);
        posAttr.setXYZ(1, anim.vTarget.x, anim.vTarget.y, anim.vTarget.z);
        posAttr.setXYZ(2, anim.vEyeR.x, anim.vEyeR.y, anim.vEyeR.z);
        posAttr.setXYZ(3, anim.vTarget.x, anim.vTarget.y, anim.vTarget.z);
        posAttr.needsUpdate = true;
      }
    }

    // --- FINGERS: Driven by CTRL_FINGERS_ROT in Mechanisms Lab, or animation state ---
    const lFingerCurl = wMech > 0.05
      ? THREE.MathUtils.lerp(wI * 0.82 + wR * 0.92, rigState.handGrip, wMech)
      : wI * 0.82 + wR * 0.92 + wRelaxL * 0.3;
    const rFingerCurl = wMech > 0.05
      ? THREE.MathUtils.lerp(wI * 0.85 + wR * 0.92, rigState.handGrip, wMech)
      : wI * 0.85 + wR * 0.92 + anim.wIkHand * 0.25;

    const fingerNames = ['B', 'C', 'D'] as const;
    for (const f of fingerNames) {
      poseBone(`DEF_FINGER_${f}_1.L`, -0.82 * lFingerCurl, 0, 0, boneAlpha);
      poseBone(`DEF_FINGER_${f}_2.L`, -0.96 * lFingerCurl, 0, 0, boneAlpha);
      poseBone(`DEF_FINGER_${f}_3.L`, -0.72 * lFingerCurl, 0, 0, boneAlpha);

      poseBone(`DEF_FINGER_${f}_1.R`, -0.82 * rFingerCurl, 0, 0, boneAlpha);
      poseBone(`DEF_FINGER_${f}_2.R`, -0.96 * rFingerCurl, 0, 0, boneAlpha);
      poseBone(`DEF_FINGER_${f}_3.R`, -0.72 * rFingerCurl, 0, 0, boneAlpha);
    }
    poseBone('DEF_FINGER_A_1.L', 0.22 * lFingerCurl, 0, -0.38 * lFingerCurl, boneAlpha);
    poseBone('DEF_FINGER_A_2.L', -0.48 * lFingerCurl, 0, 0, boneAlpha);
    poseBone('DEF_FINGER_A_1.R', 0.22 * rFingerCurl, 0, 0.38 * rFingerCurl, boneAlpha);
    poseBone('DEF_FINGER_A_2.R', -0.48 * rFingerCurl, 0, 0, boneAlpha);

    // 8. LEGS — Verified FORWARD Run Cycle + CTRL_FOOT_ROLL Mechanism (Heel Pivot <-> Tip-Toe)!
    const lThigh = (-runSin * 0.72 - 0.12) * runAmp;
    const rThigh = (runSin * 0.72 - 0.12) * runAmp;
    const lKnee = (0.16 + Math.max(0, runCos) * 1.18 + Math.max(0, -runSin) * 0.25) * runAmp;
    const rKnee = (0.16 + Math.max(0, -runCos) * 1.18 + Math.max(0, runSin) * 0.25) * runAmp;
    const lFoot = (Math.max(0, -runSin) * 0.42 - Math.max(0, runSin) * 0.2) * runAmp;
    const rFoot = (Math.max(0, runSin) * 0.42 - Math.max(0, -runSin) * 0.2) * runAmp;

    // Foot Roll Mechanism (-1 = Heel Pivot lifting toes UP, +1 = Tip-Toe lifting heel with knee flex!)
    const heelPivot = Math.max(0, -footRollVal); // toes lift up
    const toeRoll = Math.max(0, footRollVal); // heel lifts up, toes stay planted
    const mechThigh = -toeRoll * 0.32 - heelPivot * 0.08;
    const mechKnee = toeRoll * 0.56 + heelPivot * 0.06;
    const mechFoot = toeRoll * 0.48 - heelPivot * 0.58;
    const mechToes = -toeRoll * 0.52;

    poseBone('DEF_UPPER_LEG.L', wR * lThigh + mechThigh, 0, (1 - wR) * 0.03 * p, boneAlpha);
    poseBone('DEF_UPPER_LEG.R', wR * rThigh + mechThigh * 0.5, 0, -(1 - wR) * 0.03 * p, boneAlpha);
    poseBone('DEF_LOWER_LEG.L', wR * lKnee + mechKnee, 0, 0, boneAlpha);
    poseBone('DEF_LOWER_LEG.R', wR * rKnee + mechKnee * 0.5, 0, 0, boneAlpha);
    poseBone('DEF_FOOT.L', wR * lFoot + mechFoot, 0, 0, boneAlpha);
    poseBone('DEF_FOOT.R', wR * rFoot + mechFoot * 0.5, 0, 0, boneAlpha);
    poseBone('DEF_TOES.L', mechToes, 0, 0, boneAlpha);
    poseBone('DEF_TOES.R', mechToes * 0.5, 0, 0, boneAlpha);

    // 9. DYNAMIC FACIAL EXPRESSIONS + CTRL_TONGUE_STRETCH MECHANISM + NATURAL EYE BLINKS
    const periodicSmile = Math.sin(anim.moodClock * 0.65);
    let targetMood = 0;

    if (isContactFarewell) {
      targetMood = 1.0;
    } else if (mechActive && rigState.mouthTongue > 0.05) {
      targetMood = 0.5 + rigState.mouthTongue * 0.65;
    } else if (!overrideStanding && preset === 'tpose') {
      targetMood = 0;
    } else if (!overrideStanding && preset === 'wave') {
      targetMood = 1.0;
    } else if (!overrideStanding && preset === 'run') {
      targetMood = 0.65;
    } else if (sec === 0) {
      targetMood = periodicSmile > 0.1 ? 0.62 : -0.38;
    } else if (sec === 1) {
      targetMood = periodicSmile > 0.45 ? 0.38 : -0.42;
    } else if (sec === 2) {
      targetMood = periodicSmile > 0.15 ? 0.52 : -0.42;
    } else {
      targetMood = 0.85;
    }

    anim.smoothMood = THREE.MathUtils.lerp(anim.smoothMood, targetMood, 1 - Math.exp(-2.8 * dt));
    const m = anim.smoothMood;
    const smile = Math.max(0, m);
    const serious = Math.max(0, -m);
    const faceAlpha = 1 - Math.exp(-7.5 * dt);
    const tongueAmt = anim.wMech * rigState.mouthTongue;

    const cornerY = smile * 0.02 - serious * 0.008;
    const cornerX = smile * 0.009 - serious * 0.003;
    offsetBonePos('DEF_LIP_CORNER.L', cornerX, cornerY, 0, faceAlpha);
    offsetBonePos('DEF_LIP_CORNER.R', -cornerX, cornerY, 0, faceAlpha);

    offsetBonePos('DEF_LIP_UPPER_03.L', cornerX * 0.6, cornerY * 0.7 + tongueAmt * 0.008, 0, faceAlpha);
    offsetBonePos('DEF_LIP_UPPER_03.R', -cornerX * 0.6, cornerY * 0.7 + tongueAmt * 0.008, 0, faceAlpha);
    offsetBonePos('DEF_LIP_LOWER_03.L', cornerX * 0.6, cornerY * 0.55 - tongueAmt * 0.012, 0, faceAlpha);
    offsetBonePos('DEF_LIP_LOWER_03.R', -cornerX * 0.6, cornerY * 0.55 - tongueAmt * 0.012, 0, faceAlpha);

    offsetBonePos('DEF_LIP_UPPER_02.L', 0, smile * 0.005 + tongueAmt * 0.01, 0, faceAlpha);
    offsetBonePos('DEF_LIP_UPPER_02.R', 0, smile * 0.005 + tongueAmt * 0.01, 0, faceAlpha);
    offsetBonePos('DEF_LIP_UPPER_01', 0, smile * 0.006 + tongueAmt * 0.014, 0, faceAlpha);

    const openMouth = Math.max(0, smile - 0.4) * 0.022 + tongueAmt * 0.032;
    offsetBonePos('DEF_LIP_LOWER_01', 0, -openMouth, 0, faceAlpha);
    offsetBonePos('DEF_LIP_LOWER_02.L', 0, -openMouth * 0.68, 0, faceAlpha);
    offsetBonePos('DEF_LIP_LOWER_02.R', 0, -openMouth * 0.68, 0, faceAlpha);

    // Real 18-bone tongue chain extension & playful curl when CTRL_TONGUE_STRETCH slider > 0!
    for (let idx = 1; idx <= 6; idx++) {
      const zExt = tongueAmt * idx * 0.014;
      const yDrop = -tongueAmt * idx * 0.004;
      const waveX = tongueAmt * Math.sin(anim.breathPhase * 2.2 - idx * 0.4) * 0.004 * idx;
      offsetBonePos(`DEF_TONGUE_${idx}`, waveX, yDrop, zExt, faceAlpha);
      offsetBonePos(`DEF_TONGUE_${idx}.L`, waveX, yDrop, zExt, faceAlpha);
      offsetBonePos(`DEF_TONGUE_${idx}.R`, waveX, yDrop, zExt, faceAlpha);
    }

    const blinkCycle = anim.blinkClock % 4.2;
    const isBlinking = !reducedMotion && blinkCycle > 4.04 && blinkCycle < 4.18;
    const eyeSquint = isBlinking ? 0.12 : 1.0 - serious * 0.22;
    ['DEF_EYE.L', 'DEF_EYE.R'].forEach((raw) => {
      const key = normalizeBoneKey(raw);
      const eyeBone = rigData.bones.get(key);
      const eyeRestScale = rigData.restScales.get(key);
      if (eyeBone && eyeRestScale) {
        eyeBone.scale.y = THREE.MathUtils.lerp(
          eyeBone.scale.y,
          eyeRestScale.y * eyeSquint,
          1 - Math.exp(-26 * dt),
        );
      }
    });

    // 10. TRON 3D WIREFRAME-TO-SOLID "REZZING" BOOT INTRO + X-RAY / RIG LAYERS
    let bootWireOpacity = 0;
    let bootBonesBoost = 0;
    let bootEmissiveBoost = 0;

    if (!anim.bootFinished) {
      if (!anim.bootApplied) {
        rigData.storedMaterials.forEach((s) => {
          s.material.clippingPlanes = [rigData.bootSolidClip];
          s.material.needsUpdate = true;
        });
        rigData.xrayWireMat.clippingPlanes = [rigData.bootWireUpperClip, rigData.bootWireLowerClip];
        rigData.xrayWireMat.color.copy(ENCOM_CYAN);
        rigData.xrayWireMat.needsUpdate = true;
        anim.bootApplied = true;
      }

      const rootY = rootRef.current ? rootRef.current.position.y : -1.32;
      const scaleY = rootRef.current ? Math.max(rootRef.current.scale.y, 0.5) : 1.46;

      if (!rigState.bootReady) {
        const hiddenY = rootY - 0.6;
        rigData.bootSolidClip.constant = hiddenY;
        rigData.bootWireUpperClip.constant = hiddenY;
        rigData.bootWireLowerClip.constant = -hiddenY;
        rigData.hexOuterMat.opacity = 0;
        rigData.hexInnerMat.opacity = 0;
        if (plinthRef.current) plinthRef.current.scale.setScalar(0.35);
        if (scanRingRef.current) scanRingRef.current.visible = false;
        if (solidRingRef.current) solidRingRef.current.visible = false;
      } else {
        // In reduced-motion mode, keep the signature laser scanner rezzing effect ~40% quicker and without bone strobe
        anim.bootClock += dt * (reducedMotion ? 1.45 : 1);
        const t = anim.bootClock;

        // Phase 0 (0.0s - 0.42s): Smooth plinth ignition (WCAG 2.3.1 safe)
        const plinthT = THREE.MathUtils.clamp(t / 0.38, 0, 1);
        const plinthEase = 1 - Math.pow(1 - plinthT, 3);
        const plinthGlow = t < 0.2 ? 0.55 + (t / 0.2) * 0.45 : 1;
        if (plinthRef.current) {
          plinthRef.current.scale.setScalar(0.35 + 0.65 * plinthEase);
        }
        rigData.hexOuterMat.opacity = 0.92 * plinthGlow;
        rigData.hexInnerMat.opacity = 0.9 * plinthGlow;

        // Steady upward scanner curve: 1 single 3.0s scan from feet (-0.06) to hat tips (+1.96),
        // with solid materialization ("flesh") trailing ~0.54s right behind the wireframe!
        const scannerEase = (u: number) => u * 0.65 + (0.5 - 0.5 * Math.cos(u * Math.PI)) * 0.35;

        const wireU = THREE.MathUtils.clamp((t - 0.18) / 3.0, 0, 1);
        const wireLocalY = -0.06 + scannerEase(wireU) * 2.02;

        const solidU = THREE.MathUtils.clamp((t - 0.72) / 3.0, 0, 1);
        const solidLocalY = -0.08 + scannerEase(solidU) * 2.04;
        const effectiveWireTopY = Math.max(wireLocalY, solidLocalY);

        const solidWorldY = rootY + solidLocalY * scaleY;
        const wireTopWorldY = rootY + effectiveWireTopY * scaleY;

        rigData.bootSolidClip.constant = solidWorldY;
        rigData.bootWireUpperClip.constant = wireTopWorldY;
        rigData.bootWireLowerClip.constant = -solidWorldY;

        const wireSwell = t < 0.18 ? 0 : t < 0.38 ? 0.65 + ((t - 0.18) / 0.2) * 0.35 : 1;
        const wireEndFade = 1 - THREE.MathUtils.clamp((solidU - 0.94) / 0.06, 0, 1);
        bootWireOpacity = wireU > 0 ? 0.82 * wireSwell * wireEndFade : 0;

        // Subtle DEF skeleton glimpse floating inside the trailing wireframe band
        if (!reducedMotion && t > 0.35 && t < 3.45) {
          const skelPhase = (t - 0.35) / 3.1;
          bootBonesBoost = Math.sin(skelPhase * Math.PI) * 0.38;
        }

        if (t >= 0.72 && t < 3.82) {
          bootEmissiveBoost = Math.sin(THREE.MathUtils.clamp((t - 0.72) / 3.1, 0, 1) * Math.PI) * 0.24;
        }

        // Primary 3D Laser Scanner Ring rising once with wireframe front (0.16s - 3.24s)
        if (scanRingRef.current) {
          const ringActive = t >= 0.16 && t <= 3.24;
          scanRingRef.current.visible = ringActive;
          if (ringActive) {
            const normH = THREE.MathUtils.clamp(wireLocalY / 1.94, 0, 1);
            const ringScale = 0.56 + 0.2 * Math.sin(normH * Math.PI);
            const fadeIn = THREE.MathUtils.clamp((t - 0.16) / 0.14, 0, 1);
            const fadeOut = 1 - THREE.MathUtils.clamp((t - 3.04) / 0.2, 0, 1);
            const ringAlpha = fadeIn * fadeOut;

            scanRingRef.current.position.set(0, THREE.MathUtils.clamp(wireLocalY, 0, 1.96), 0);
            scanRingRef.current.scale.setScalar(ringScale);
            rigData.scanRingCoreMat.color.copy(ENCOM_CYAN);
            rigData.scanRingCoreMat.opacity = 0.95 * ringAlpha;
            rigData.scanRingHaloMat.opacity = 0.65 * ringAlpha;
          }
        }

        // Secondary Materialization Ring trailing ~0.54s behind at the solid/wireframe frontier (0.70s - 3.78s)
        if (solidRingRef.current) {
          const solidRingActive = t >= 0.7 && t <= 3.78;
          solidRingRef.current.visible = solidRingActive;
          if (solidRingActive) {
            const normH = THREE.MathUtils.clamp(solidLocalY / 1.94, 0, 1);
            const ringScale = 0.54 + 0.2 * Math.sin(normH * Math.PI);
            const fadeIn = THREE.MathUtils.clamp((t - 0.7) / 0.14, 0, 1);
            const fadeOut = 1 - THREE.MathUtils.clamp((t - 3.58) / 0.2, 0, 1);
            const ringAlpha = fadeIn * fadeOut;

            solidRingRef.current.position.set(0, THREE.MathUtils.clamp(solidLocalY, 0, 1.96), 0);
            solidRingRef.current.scale.setScalar(ringScale);
            rigData.solidRingMat.opacity = 0.85 * ringAlpha;
          }
        }

        if (t >= 3.9) {
          anim.bootFinished = true;
          rigData.storedMaterials.forEach((s) => {
            s.material.clippingPlanes = null;
            s.material.needsUpdate = true;
          });
          rigData.xrayWireMat.clippingPlanes = null;
          rigData.xrayWireMat.color.copy(CYAN_MID);
          rigData.xrayWireMat.needsUpdate = true;
          rigData.hexOuterMat.opacity = 0.92;
          rigData.hexInnerMat.opacity = 0.9;
          if (plinthRef.current) plinthRef.current.scale.setScalar(1);
          if (scanRingRef.current) scanRingRef.current.visible = false;
          if (solidRingRef.current) solidRingRef.current.visible = false;
        }
      }
    }

    // Auto-reveal Finn's 38 real Blender CTRL widgets ~1.0s after Finn finishes solidifying
    if (anim.bootFinished && !anim.bootCtrlRevealed) {
      anim.bootClock += dt;
      if (anim.bootClock >= 4.9) {
        anim.bootCtrlRevealed = true;
        setRigShowWidgets(true);
      }
    }

    // Smooth holographic transitions: X-Ray, Real Blender CTRL Widgets, DEF Bones, Weight Paint Heatmap, IK Gizmo!
    const targetXray = rigState.xrayMode ? 1 : 0;
    const targetBones = rigState.xrayMode || rigState.showBones ? 1 : 0;
    const targetCtrl = rigState.showWidgets || rigState.labTab === 'ik' || rigState.labTab === 'mech' ? 1 : 0;
    const activeWeightZone: WeightPaintZone = rigState.labTab === 'weights' ? rigState.weightZone : 'none';
    const targetWeight = activeWeightZone !== 'none' ? 1 : 0;
    const targetIkGizmo = ikHandActive || ikEyeActive ? 1 : 0;

    if (activeWeightZone !== 'none' && activeWeightZone !== anim.lastWeightZone) {
      anim.lastWeightZone = activeWeightZone;
      updateWeightHeatmapColors(activeWeightZone);
    }

    const fadeRate = 1 - Math.exp(-3.6 * dt);
    anim.xrayMix = THREE.MathUtils.lerp(anim.xrayMix, targetXray, fadeRate);
    anim.bonesMix = THREE.MathUtils.lerp(anim.bonesMix, targetBones, fadeRate);
    anim.ctrlMix = THREE.MathUtils.lerp(anim.ctrlMix, targetCtrl, fadeRate);
    anim.weightMix = THREE.MathUtils.lerp(anim.weightMix, targetWeight, fadeRate);
    anim.ikGizmoMix = THREE.MathUtils.lerp(anim.ikGizmoMix, targetIkGizmo, 1 - Math.exp(-6 * dt));

    if (Math.abs(anim.xrayMix - targetXray) < 0.002) anim.xrayMix = targetXray;
    if (Math.abs(anim.bonesMix - targetBones) < 0.002) anim.bonesMix = targetBones;
    if (Math.abs(anim.ctrlMix - targetCtrl) < 0.002) anim.ctrlMix = targetCtrl;
    if (Math.abs(anim.weightMix - targetWeight) < 0.002) anim.weightMix = targetWeight;
    if (Math.abs(anim.ikGizmoMix - targetIkGizmo) < 0.002) anim.ikGizmoMix = targetIkGizmo;

    // Shaded mesh X-Ray fade (+ boot energy edge)
    const xMix = anim.xrayMix;
    rigData.storedMaterials.forEach((s) => {
      const wantTransparent = xMix > 0.005 || s.origTransparent;
      if (s.material.transparent !== wantTransparent) {
        s.material.transparent = wantTransparent;
        s.material.needsUpdate = true;
      }
      s.material.opacity = THREE.MathUtils.lerp(s.origOpacity, 0.16, xMix);
      s.material.depthWrite = xMix < 0.08 ? s.origDepthWrite : false;
      const emissiveMix = Math.min(1, xMix * 0.65 + bootEmissiveBoost * 0.85);
      s.material.emissive
        .copy(s.origEmissive)
        .lerp(anim.bootFinished ? XRAY_TINT : ENCOM_CYAN, emissiveMix);
      s.material.emissiveIntensity = THREE.MathUtils.lerp(
        s.origEmissiveIntensity,
        0.45,
        Math.max(xMix, bootEmissiveBoost),
      );
    });

    // Wireframe overlay fade (+ Tron boot rezzing wireframe)
    const effectiveWireOpacity = Math.max(xMix * 0.52, bootWireOpacity);
    const showWire = effectiveWireOpacity > 0.004;
    rigData.xrayWireMat.opacity = effectiveWireOpacity;
    rigData.wireMeshes.forEach((wm) => {
      wm.visible = showWire;
    });

    // Real Blender Weight Paint Heatmap fade
    const showWeight = anim.weightMix > 0.004;
    rigData.weightMat.opacity = anim.weightMix * 0.94;
    rigData.weightMeshes.forEach((wm) => {
      wm.mesh.visible = showWeight;
    });

    // 93-bone SkeletonHelper fade (+ subtle boot rig glimpse)
    const effectiveBonesOpacity = Math.max(anim.bonesMix * 0.95, bootBonesBoost);
    rigData.skeletonHelper.visible = effectiveBonesOpacity > 0.004;
    rigData.skelMat.opacity = effectiveBonesOpacity;

    // 38 Real Blender Custom Shape Widgets fade
    const showCtrl = anim.ctrlMix > 0.004;
    const ctrlOp = anim.ctrlMix * 0.78;
    rigData.widgetMats.root.opacity = ctrlOp * 0.7;
    rigData.widgetMats.body.opacity = ctrlOp * 0.72;
    rigData.widgetMats.ik.opacity = ctrlOp * 0.92;
    rigData.widgetMats.face.opacity = ctrlOp * 0.75;
    rigData.widgetMats.fingers.opacity = ctrlOp * 0.68;
    widgetLinesRef.current.forEach((line) => {
      line.visible = showCtrl;
    });

    // Live IK Gizmo & Sightlines fade
    const showIk = anim.ikGizmoMix > 0.004;
    rigData.ikLine.visible = showIk;
    rigData.ikLineMat.opacity = anim.ikGizmoMix * 0.92;
    rigData.ikTargetBoxMat.opacity = anim.ikGizmoMix * 0.95;
    rigData.ikTargetCoreMat.opacity = anim.ikGizmoMix * 0.95;
    if (ikGizmoRef.current) {
      ikGizmoRef.current.visible = showIk;
    }
  });

  return (
    <>
      <group ref={rootRef}>
        <primitive object={scene} />
        <primitive object={rigData.wireOverlayGroup} />
        <primitive object={rigData.weightOverlayGroup} />
        <primitive object={rigData.ikLine} />

        {/* Glowing Interactive 3D IK / Eye Aim Target Gizmo */}
        <group ref={ikGizmoRef} visible={false}>
          <mesh geometry={rigData.ikTargetBoxGeo} material={rigData.ikTargetBoxMat} renderOrder={30} />
          <mesh geometry={rigData.ikTargetCoreGeo} material={rigData.ikTargetCoreMat} renderOrder={31} />
        </group>

        {/* Minimal sharp hexagonal turntable base under Finn's feet */}
        <group ref={plinthRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <mesh geometry={rigData.hexOuterGeo} material={rigData.hexOuterMat} />
          <mesh geometry={rigData.hexInnerGeo} material={rigData.hexInnerMat} />
        </group>

        {/* Tron 3D Laser Scan Ring (primary wireframe sweep) */}
        <group ref={scanRingRef} rotation={[Math.PI / 2, 0, 0]} visible={false}>
          <mesh
            geometry={rigData.scanRingCoreGeo}
            material={rigData.scanRingCoreMat}
            renderOrder={24}
          />
          <mesh
            geometry={rigData.scanRingHaloGeo}
            material={rigData.scanRingHaloMat}
            renderOrder={24}
          />
        </group>

        {/* Secondary Materialization Ring trailing behind at the wireframe-to-solid frontier */}
        <group ref={solidRingRef} rotation={[Math.PI / 2, 0, 0]} visible={false}>
          <mesh
            geometry={rigData.solidRingGeo}
            material={rigData.solidRingMat}
            renderOrder={24}
          />
        </group>
      </group>

      {/* Mounted at Scene root so SkeletonHelper aligns 1:1 with bone matrixWorld */}
      <primitive object={rigData.skeletonHelper} />
    </>
  );
}

/**
 * Calm, atmospheric simplex-noise neon vertex particles.
 */
function ReactiveParticles({
  reducedMotion,
  lowPerf,
}: {
  reducedMotion: boolean;
  lowPerf: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 650;
  const noise3D = useMemo(() => createNoise3D(), []);

  const { geometry, material, basePositions, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const phaseArr = new Float32Array(count);

    const palette = [ENCOM_CYAN, ENCOM_CYAN, ULTRAVIOLET];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 18;
      const y = (Math.random() - 0.5) * 12;
      const z = (Math.random() - 0.5) * 10 - 2.6;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      base[i3] = x;
      base[i3 + 1] = y;
      base[i3 + 2] = z;

      phaseArr[i] = Math.random() * 100;

      const c = palette[i % palette.length];
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.036,
      vertexColors: true,
      transparent: true,
      opacity: 0.44,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      toneMapped: false,
    });

    return { geometry: geo, material: mat, basePositions: base, phases: phaseArr };
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useEffect(() => {
    material.opacity = reducedMotion || lowPerf ? 0.24 : 0.44;
  }, [material, reducedMotion, lowPerf]);

  useFrame((state, delta) => {
    if (!pointsRef.current || reducedMotion || lowPerf) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime * 0.25;
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    const ptrX = rigState.pointerX * 4.2;
    const ptrY = rigState.pointerY * 2.6;
    const isRunning = rigState.preset === 'run' && rigState.labTab === 'anim';
    const speedMul = 0.12 + Math.pow(rigState.actingEnergy, 1.4) * 3.1;
    const scrollWarp = THREE.MathUtils.clamp(rigState.scrollVelocity * 0.012, -0.35, 0.35);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const bx = basePositions[i3];
      const by = basePositions[i3 + 1];

      // Drift backward (-Z) when running forward so particles rush past Finn!
      if (isRunning) {
        basePositions[i3 + 2] -= 1.6 * speedMul * dt;
        if (basePositions[i3 + 2] < -7.4) basePositions[i3 + 2] = 2.8;
      } else {
        basePositions[i3 + 2] += (0.18 + Math.abs(scrollWarp) * 3.5) * dt;
        if (basePositions[i3 + 2] > 2.8) basePositions[i3 + 2] = -7.4;
      }

      const bz = basePositions[i3 + 2];
      const p = phases[i];

      const nx = noise3D(bx * 0.15, by * 0.15, t + p * 0.01) * 0.38;
      const ny = noise3D(by * 0.15, bz * 0.15, t + 12.4) * 0.38;

      let x = bx + nx;
      let y = by + ny;

      const dx = x - ptrX;
      const dy = y - ptrY;
      const distSq = dx * dx + dy * dy;
      if (distSq < 5.0 && distSq > 0.001) {
        const force = (1 - distSq / 5.0) * 0.45;
        const invDist = 1 / Math.sqrt(distSq);
        x += dx * invDist * force;
        y += dy * invDist * force;
      }

      arr[i3] = x;
      arr[i3 + 1] = y;
      arr[i3 + 2] = bz;
    }

    posAttr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

/**
 * Orthogonal retrofuturistic floor grid — scrolls BACKWARD (-Z) under Finn's feet when running forward (+Z)!
 */
function RetroFloorGrid({ reducedMotion }: { reducedMotion: boolean }) {
  const gridRef = useRef<THREE.GridHelper>(null);
  const gridZ = useRef(0);

  useFrame((_, delta) => {
    if (!gridRef.current || reducedMotion) return;
    const dt = Math.min(delta, 0.05);
    const isRunning = rigState.preset === 'run' && rigState.labTab === 'anim';
    const speedMul = 0.12 + Math.pow(rigState.actingEnergy, 1.4) * 3.1;
    const speed = isRunning
      ? -2.8 * speedMul
      : 0.42 + Math.abs(rigState.scrollVelocity) * 0.12;
    gridZ.current = (((gridZ.current + speed * dt) % 1.5) + 1.5) % 1.5;
    gridRef.current.position.z = gridZ.current;
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[36, 36, '#00a3cc', '#071a2b']}
      position={[0, -2.55, 0]}
    />
  );
}

function LowFpsGuard({
  enabled,
  onDegrade,
}: {
  enabled: boolean;
  onDegrade: () => void;
}) {
  const accumRef = useRef({ frames: 0, time: 0, triggered: false });

  useFrame((_, delta) => {
    const state = accumRef.current;
    if (!enabled || state.triggered || !rigState.bootReady) return;
    state.frames += 1;
    state.time += Math.min(delta, 0.25);
    if (state.frames >= 60) {
      const avgDt = state.time / state.frames;
      if (avgDt > 0.05) {
        state.triggered = true;
        onDegrade();
      } else {
        state.frames = 0;
        state.time = 0;
      }
    }
  });

  return null;
}

export function RigScene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDesktopPost, setIsDesktopPost] = useState(true);
  const [lowPerf, setLowPerf] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const glDomRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopQuery = window.matchMedia('(min-width: 768px)');
    const update = () => {
      setReducedMotion(motionQuery.matches);
      setIsDesktopPost(desktopQuery.matches);
    };
    update();
    motionQuery.addEventListener('change', update);
    desktopQuery.addEventListener('change', update);
    return () => {
      motionQuery.removeEventListener('change', update);
      desktopQuery.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const dom = glDomRef.current;
    if (!dom) return;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };

    dom.addEventListener('webglcontextlost', handleContextLost);
    dom.addEventListener('webglcontextrestored', handleContextRestored);
    return () => {
      dom.removeEventListener('webglcontextlost', handleContextLost);
      dom.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [contextLost]);

  if (contextLost) {
    return (
      <div
        aria-hidden="true"
        className="rf-grid-bg pointer-events-none fixed inset-0 z-0 opacity-35"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <CanvasErrorBoundary>
        <Canvas
          dpr={lowPerf ? 1 : isDesktopPost ? [1, 1.75] : [1, 1.5]}
          camera={{ position: [0, 0.25, 5.4], fov: 42 }}
          onCreated={({ gl }) => {
            gl.localClippingEnabled = true;
            glDomRef.current = gl.domElement;

            try {
              const ctx = gl.getContext();
              const dbg = ctx.getExtension('WEBGL_debug_renderer_info');
              if (dbg) {
                const renderer = String(ctx.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '');
                if (/swiftshader|llvmpipe|software|microsoft basic render|lavapipe/i.test(renderer)) {
                  setLowPerf(true);
                }
              }
            } catch {
              // Ignore extension lookup failures
            }
          }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
        >
          <fog attach="fog" args={['#020408', 6.5, 16.5]} />

          <ambientLight intensity={0.85} color="#d8eeff" />
          <directionalLight position={[2.5, 4.5, 5]} intensity={1.75} color="#f5fbff" />
          <pointLight position={[-4, 2.2, -2]} intensity={4.2} color="#bd00ff" />
          <pointLight position={[4, 1.5, -1.8]} intensity={4.0} color="#00f3ff" />
          <pointLight position={[0.5, -1.5, 3]} intensity={1.3} color="#00a3cc" />

          <LowFpsGuard enabled={!lowPerf} onDegrade={() => setLowPerf(true)} />

          <Suspense fallback={null}>
            <FinnCharacterRig reducedMotion={reducedMotion} />
          </Suspense>

          <ReactiveParticles reducedMotion={reducedMotion} lowPerf={lowPerf} />
          <RetroFloorGrid reducedMotion={reducedMotion} />

          {isDesktopPost && !reducedMotion && !lowPerf && (
            <EffectComposer multisampling={0}>
              <Bloom
                mipmapBlur
                luminanceThreshold={0.92}
                intensity={0.62}
                radius={0.48}
              />
              <Vignette eskil={false} offset={0.22} darkness={0.68} />
            </EffectComposer>
          )}
        </Canvas>
      </CanvasErrorBoundary>

      <div className="rf-scanlines pointer-events-none fixed inset-0 opacity-40" />
    </div>
  );
}

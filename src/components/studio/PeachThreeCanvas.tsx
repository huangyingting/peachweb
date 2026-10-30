"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type {
  PeachKeyframe,
  PeachSceneObject,
  PeachSceneState,
  Vector3Tuple,
} from "@/lib/document-types";

interface PeachThreeCanvasProps {
  sceneState: PeachSceneState;
  scrollProgress?: number; // 0.0 to 1.0
  selectedObjectId?: string | null;
  onSelectObject?: (id: string | null) => void;
  interactiveOrbit?: boolean;
  className?: string;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpVec3(a: Vector3Tuple, b: Vector3Tuple, t: number): Vector3Tuple {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  };
}

function interpolateKeyframes(
  keyframes: PeachKeyframe[],
  progress: number,
): {
  cameraPosition?: Vector3Tuple;
  cameraTarget?: Vector3Tuple;
  objectTransforms: Record<
    string,
    { position: Vector3Tuple; rotation: Vector3Tuple; scale: Vector3Tuple }
  >;
} {
  if (!keyframes || keyframes.length === 0) {
    return { objectTransforms: {} };
  }

  const sorted = [...keyframes].sort((a, b) => a.scrollProgress - b.scrollProgress);
  const clamped = Math.max(0, Math.min(1, progress));

  if (clamped <= sorted[0].scrollProgress || sorted.length === 1) {
    return {
      cameraPosition: sorted[0].cameraPosition,
      cameraTarget: sorted[0].cameraTarget,
      objectTransforms: sorted[0].objectTransforms ?? {},
    };
  }

  const last = sorted[sorted.length - 1];
  if (clamped >= last.scrollProgress) {
    return {
      cameraPosition: last.cameraPosition,
      cameraTarget: last.cameraTarget,
      objectTransforms: last.objectTransforms ?? {},
    };
  }

  let prev = sorted[0];
  let next = sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i += 1) {
    if (clamped >= sorted[i].scrollProgress && clamped <= sorted[i + 1].scrollProgress) {
      prev = sorted[i];
      next = sorted[i + 1];
      break;
    }
  }

  const span = Math.max(0.0001, next.scrollProgress - prev.scrollProgress);
  const localT = (clamped - prev.scrollProgress) / span;

  const objectTransforms: Record<
    string,
    { position: Vector3Tuple; rotation: Vector3Tuple; scale: Vector3Tuple }
  > = {};

  const objectIds = new Set([
    ...Object.keys(prev.objectTransforms ?? {}),
    ...Object.keys(next.objectTransforms ?? {}),
  ]);

  for (const id of objectIds) {
    const a = prev.objectTransforms?.[id];
    const b = next.objectTransforms?.[id];
    if (a && b) {
      objectTransforms[id] = {
        position: lerpVec3(a.position, b.position, localT),
        rotation: lerpVec3(a.rotation, b.rotation, localT),
        scale: lerpVec3(a.scale, b.scale, localT),
      };
    } else if (a) {
      objectTransforms[id] = a;
    } else if (b) {
      objectTransforms[id] = b;
    }
  }

  return {
    cameraPosition: lerpVec3(prev.cameraPosition, next.cameraPosition, localT),
    cameraTarget: lerpVec3(prev.cameraTarget, next.cameraTarget, localT),
    objectTransforms,
  };
}

function createGeometryForObject(obj: PeachSceneObject): THREE.BufferGeometry {
  switch (obj.type) {
    case "box":
      return new THREE.BoxGeometry(1.4, 1.4, 1.4, 2, 2, 2);
    case "sphere":
      return new THREE.SphereGeometry(1, 24, 24);
    case "cylinder":
      return new THREE.CylinderGeometry(0.85, 0.85, 1.8, 24);
    case "torus":
      return new THREE.TorusKnotGeometry(0.85, 0.28, 64, 16);
    case "cone":
      return new THREE.ConeGeometry(1, 1.9, 24);
    case "plane":
      return new THREE.PlaneGeometry(3, 3, 4, 4);
    case "icosahedron":
      return new THREE.IcosahedronGeometry(1.1, 1);
    case "ring":
      return new THREE.TorusGeometry(1.3, 0.08, 16, 48);
    default:
      return new THREE.SphereGeometry(1, 20, 20);
  }
}

export function PeachThreeCanvas({
  sceneState,
  scrollProgress = 0,
  selectedObjectId = null,
  onSelectObject,
  interactiveOrbit = true,
  className = "",
}: PeachThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(sceneState);
  const progressRef = useRef(scrollProgress);
  const selectedRef = useRef(selectedObjectId);
  const onSelectRef = useRef(onSelectObject);

  useEffect(() => {
    stateRef.current = sceneState;
  }, [sceneState]);

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    selectedRef.current = selectedObjectId;
  }, [selectedObjectId]);

  useEffect(() => {
    onSelectRef.current = onSelectObject;
  }, [onSelectObject]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animFrameId = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    const width = Math.max(300, container.clientWidth || 960);
    const height = Math.max(240, container.clientHeight || 600);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      stateRef.current.camera.fov || 45,
      width / height,
      0.1,
      100,
    );

    const meshMap = new Map<string, THREE.Mesh>();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);
    const lightMap = new Map<string, THREE.Light>();

    const gridHelper = new THREE.GridHelper(16, 16, 0xff6b4a, 0x26293e);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    let orbitYaw = 0;
    let orbitPitch = 0;
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "default",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(1);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      container.innerHTML = "";
      container.appendChild(renderer.domElement);
    } catch {
      renderer = null;
    }

    // Fallback 2D canvas if WebGL context is unavailable in restricted headless containers
    let fallbackCanvas: HTMLCanvasElement | null = null;
    if (!renderer) {
      fallbackCanvas = document.createElement("canvas");
      fallbackCanvas.width = width;
      fallbackCanvas.height = height;
      fallbackCanvas.style.width = "100%";
      fallbackCanvas.style.height = "100%";
      container.innerHTML = "";
      container.appendChild(fallbackCanvas);
    }

    function syncSceneGraph(clockTime: number) {
      const current = stateRef.current;
      const interp = interpolateKeyframes(current.keyframes, progressRef.current);

      scene.background = new THREE.Color(current.environment.backgroundColor || "#090a10");
      if (current.environment.fogDensity > 0) {
        scene.fog = new THREE.FogExp2(
          current.environment.fogColor || current.environment.backgroundColor || "#090a10",
          current.environment.fogDensity,
        );
      } else {
        scene.fog = null;
      }

      gridHelper.visible = Boolean(current.environment.gridVisible);

      // Sync Camera
      if (camera.fov !== current.camera.fov) {
        camera.fov = current.camera.fov || 45;
        camera.updateProjectionMatrix();
      }
      const camPos = interp.cameraPosition ?? current.camera.position;
      const camTarget = interp.cameraTarget ?? current.camera.target;
      camera.position.set(
        camPos.x + Math.sin(orbitYaw) * 1.8,
        camPos.y + orbitPitch * 1.4,
        camPos.z + (Math.cos(orbitYaw) - 1) * 1.8,
      );
      camera.lookAt(camTarget.x, camTarget.y, camTarget.z);

      // Sync Lights in-place (avoiding shader program recompilation)
      ambientLight.intensity = current.environment.ambientIntensity ?? 0.85;

      const activeLightIds = new Set(current.lights.map((l) => l.id));
      for (const [id, lightObj] of lightMap.entries()) {
        if (!activeLightIds.has(id)) {
          scene.remove(lightObj);
          lightMap.delete(id);
        }
      }

      for (const l of current.lights) {
        let lightObj = lightMap.get(l.id);
        if (!lightObj || lightObj.userData.lightType !== l.type) {
          if (lightObj) {
            scene.remove(lightObj);
          }
          if (l.type === "directional") {
            lightObj = new THREE.DirectionalLight(l.color, l.intensity);
          } else if (l.type === "point") {
            lightObj = new THREE.PointLight(l.color, l.intensity, 30);
          } else {
            lightObj = new THREE.SpotLight(l.color, l.intensity);
          }
          lightObj.userData = { lightType: l.type };
          scene.add(lightObj);
          lightMap.set(l.id, lightObj);
        }
        lightObj.visible = l.visible;
        lightObj.color.set(l.color);
        lightObj.intensity = l.intensity;
        lightObj.position.set(l.position.x, l.position.y, l.position.z);
      }

      // Sync Objects
      const activeIds = new Set(current.objects.map((o) => o.id));
      for (const [id, mesh] of meshMap.entries()) {
        if (!activeIds.has(id)) {
          scene.remove(mesh);
          mesh.geometry.dispose();
          meshMap.delete(id);
        }
      }

      for (const obj of current.objects) {
        let mesh = meshMap.get(obj.id);
        if (!mesh || mesh.userData.primitiveType !== obj.type) {
          if (mesh) {
            scene.remove(mesh);
            mesh.geometry.dispose();
          }
          const geom = createGeometryForObject(obj);
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(obj.material.color || "#ff6b4a"),
            emissive: new THREE.Color(obj.material.emissive || "#000000"),
            emissiveIntensity: obj.material.emissiveIntensity ?? 0.2,
            metalness: obj.material.metalness ?? 0.6,
            roughness: obj.material.roughness ?? 0.25,
            transparent: (obj.material.opacity ?? 1) < 1,
            opacity: obj.material.opacity ?? 1,
            wireframe: Boolean(obj.material.wireframe),
            side: THREE.DoubleSide,
          });
          mesh = new THREE.Mesh(geom, mat);
          mesh.userData = { id: obj.id, primitiveType: obj.type };
          scene.add(mesh);
          meshMap.set(obj.id, mesh);
        }

        mesh.visible = obj.visible;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.color.set(obj.material.color || "#ff6b4a");
        mat.emissive.set(obj.material.emissive || "#000000");
        const isSelected = selectedRef.current === obj.id;
        mat.emissiveIntensity =
          (obj.material.emissiveIntensity ?? 0.2) + (isSelected ? 0.35 : 0);
        mat.metalness = obj.material.metalness ?? 0.6;
        mat.roughness = obj.material.roughness ?? 0.25;
        mat.opacity = obj.material.opacity ?? 1;
        mat.transparent = mat.opacity < 1;
        mat.wireframe = Boolean(obj.material.wireframe);

        const kfTransform = interp.objectTransforms[obj.id];
        const basePos = kfTransform?.position ?? obj.position;
        const baseRot = kfTransform?.rotation ?? obj.rotation;
        const baseScale = kfTransform?.scale ?? obj.scale;

        const floatY = obj.floatAnimation?.enabled
          ? Math.sin(clockTime * (obj.floatAnimation.speed || 1)) *
            (obj.floatAnimation.amplitude || 0.18)
          : 0;
        const floatRot = obj.floatAnimation?.enabled
          ? clockTime * (obj.floatAnimation.rotationSpeed || 0.35)
          : 0;

        mesh.position.set(basePos.x, basePos.y + floatY, basePos.z);
        mesh.rotation.set(baseRot.x + floatRot * 0.4, baseRot.y + floatRot, baseRot.z);
        mesh.scale.set(baseScale.x, baseScale.y, baseScale.z);
      }
    }

    const startTime = performance.now();
    let lastFrameTime = 0;

    function renderLoop(now: number) {
      if (now - lastFrameTime >= 45) {
        lastFrameTime = now;
        const elapsed = (now - startTime) / 1000;
        if (renderer) {
          renderer.toneMappingExposure = stateRef.current.camera.exposure || 1.1;
          syncSceneGraph(elapsed);
          renderer.render(scene, camera);
        } else if (fallbackCanvas) {
          const ctx = fallbackCanvas.getContext("2d");
          if (ctx) {
            const st = stateRef.current;
            const grad = ctx.createLinearGradient(0, 0, fallbackCanvas.width, fallbackCanvas.height);
            grad.addColorStop(0, st.environment.backgroundColor || "#090a10");
            grad.addColorStop(1, st.environment.secondaryGradientColor || "#1e1b4b");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);

            st.objects.forEach((obj, idx) => {
              if (!obj.visible) return;
              const cx = fallbackCanvas!.width * (0.5 + obj.position.x * 0.12);
              const cy =
                fallbackCanvas!.height * (0.5 - obj.position.y * 0.12) +
                Math.sin(elapsed + idx) * 14;
              const radius = Math.max(28, 68 * obj.scale.x);
              const radGrad = ctx.createRadialGradient(cx - 12, cy - 12, 6, cx, cy, radius);
              radGrad.addColorStop(0, obj.material.color || "#ff6b4a");
              radGrad.addColorStop(1, "rgba(0,0,0,0.2)");
              ctx.fillStyle = radGrad;
              ctx.beginPath();
              ctx.arc(cx, cy, radius, 0, Math.PI * 2);
              ctx.fill();
            });
          }
        }
      }
      animFrameId = requestAnimationFrame(renderLoop);
    }

    animFrameId = requestAnimationFrame(renderLoop);

    function handleResize() {
      if (!container) return;
      const w = Math.max(300, container.clientWidth);
      const h = Math.max(240, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer?.setSize(w, h);
    }

    function handlePointerDown(e: PointerEvent) {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };

      if (onSelectRef.current && renderer) {
        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1,
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([...meshMap.values()], false);
        if (intersects.length > 0) {
          const hitId = intersects[0].object.userData.id as string;
          onSelectRef.current(hitId);
        }
      }
    }

    function handlePointerMove(e: PointerEvent) {
      if (!isDragging || !interactiveOrbit) return;
      const dx = (e.clientX - prevMouse.x) * 0.005;
      const dy = (e.clientY - prevMouse.y) * 0.005;
      orbitYaw += dx;
      orbitPitch = Math.max(-0.8, Math.min(0.8, orbitPitch + dy));
      prevMouse = { x: e.clientX, y: e.clientY };
    }

    function handlePointerUp() {
      isDragging = false;
    }

    window.addEventListener("resize", handleResize);
    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      renderer?.forceContextLoss();
      renderer?.dispose();
    };
  }, [interactiveOrbit]);

  const bloomGlow = sceneState.postProcessing.bloomEnabled
    ? `drop-shadow(0 0 ${Math.round(sceneState.postProcessing.bloomIntensity * 18)}px rgba(255,107,74,0.28))`
    : undefined;

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      <div
        ref={containerRef}
        data-testid="peach-three-canvas"
        style={{ filter: bloomGlow }}
        className="w-full h-full"
      />
      {sceneState.postProcessing.vignetteEnabled && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.65)_100%)]" />
      )}
    </div>
  );
}

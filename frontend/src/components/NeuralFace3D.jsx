import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

/* ── Circular soft-dot texture (points render as circles) ─── */
function makeCircleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx  = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0,   "rgba(255,255,255,1)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.8)");
  grad.addColorStop(1,   "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

/* ─────────────────────────────────────────────────────────────
   NEURAL COSMOS — zoomed background sphere
   Camera at z=2.6, fov=80 → sphere bleeds off all edges
───────────────────────────────────────────────────────────── */
const NODE_COUNT = 380;
const SPHERE_R   = 1.7;
const THRESHOLD  = 0.6;
const MAX_LINES  = 620;

function fibonacciSphere(n, R) {
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const phi = Math.PI * (Math.sqrt(5) - 1);

  const cTop = new THREE.Color("#00e5ff");
  const cMid = new THREE.Color("#818cf8");
  const cBot = new THREE.Color("#a855f7");

  for (let i = 0; i < n; i++) {
    const y  = 1 - (i / (n - 1)) * 2;
    const r  = Math.sqrt(1 - y * y);
    const t  = phi * i;
    const Ri = R * (0.91 + Math.random() * 0.18);

    pos[i * 3]     = Ri * r * Math.cos(t);
    pos[i * 3 + 1] = Ri * y;
    pos[i * 3 + 2] = Ri * r * Math.sin(t);

    const v = (y + 1) / 2;
    const c = v > 0.5
      ? cMid.clone().lerp(cTop, (v - 0.5) * 2)
      : cBot.clone().lerp(cMid, v * 2);

    col[i * 3]     = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  return { pos, col };
}

function buildConnections(pos) {
  const pairs = [];
  let count   = 0;
  const t2    = THRESHOLD * THRESHOLD;

  for (let i = 0; i < NODE_COUNT && count < MAX_LINES; i++) {
    for (let j = i + 1; j < NODE_COUNT && count < MAX_LINES; j++) {
      const dx = pos[i * 3]     - pos[j * 3];
      const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
      const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < t2) {
        pairs.push(
          pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
          pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]
        );
        count++;
      }
    }
  }
  return new Float32Array(pairs);
}

/* ── Ambient floating particles surrounding the sphere ──── */
function FloatingParticles() {
  const ref = useRef();
  const N   = 60;

  const { pos, col } = useMemo(() => {
    const p  = new Float32Array(N * 3);
    const c  = new Float32Array(N * 3);
    const cs = [
      new THREE.Color("#818cf8"),
      new THREE.Color("#00e5ff"),
      new THREE.Color("#a855f7"),
    ];
    for (let i = 0; i < N; i++) {
      const r     = 2.2 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi2  = Math.acos(2 * Math.random() - 1);
      p[i * 3]     = r * Math.sin(phi2) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.sin(phi2) * Math.sin(theta);
      p[i * 3 + 2] = r * Math.cos(phi2);
      const cl = cs[Math.floor(Math.random() * cs.length)];
      c[i * 3] = cl.r; c[i * 3 + 1] = cl.g; c[i * 3 + 2] = cl.b;
    }
    return { pos: p, col: c };
  }, []);

  const tex = useMemo(() => makeCircleTexture(), []);

  useFrame(state => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.04;
    ref.current.rotation.x = Math.sin(t * 0.018) * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
        <bufferAttribute attach="attributes-color"    args={[col, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
        alphaMap={tex}
        alphaTest={0.01}
      />
    </points>
  );
}

/* ── Main neural sphere ───────────────────────────────────── */
function NeuralSphere({ mouseRef }) {
  const groupRef = useRef();

  const { pos, col } = useMemo(() => fibonacciSphere(NODE_COUNT, SPHERE_R), []);
  const linePairs    = useMemo(() => buildConnections(pos), [pos]);
  const tex          = useMemo(() => makeCircleTexture(), []);

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(linePairs, 3));
    return g;
  }, [linePairs]);

  const lineMat = useMemo(
    () => new THREE.LineBasicMaterial({
      color: "#4338ca",
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    }), []
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const m = mouseRef?.current;
    if (!m) return;

    // Apply accumulated velocity to rotation
    groupRef.current.rotation.y += m.vx;
    groupRef.current.rotation.x += m.vy;

    // Clamp X so sphere doesn't flip over
    groupRef.current.rotation.x = Math.max(-0.65, Math.min(0.65, groupRef.current.rotation.x));

    // Wave / momentum decay — velocity fades like a ripple
    const damp = Math.pow(0.88, delta * 60);
    m.vx *= damp;
    m.vy *= damp;
  });

  return (
    <group ref={groupRef} scale={[2.2, 1.1, 2.2]}>
      {/* Connection lines */}
      <lineSegments geometry={lineGeo} material={lineMat} />

      {/* Nodes — circular soft dots */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pos, 3]} />
          <bufferAttribute attach="attributes-color"    args={[col, 3]} />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={0.055}
          sizeAttenuation
          transparent
          opacity={0.92}
          depthWrite={false}
          alphaMap={tex}
          alphaTest={0.01}
        />
      </points>
    </group>
  );
}

/* ── Exported component ──────────────────────────────────── */
export default function NeuralFace3D() {
  const mouseRef    = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const prevMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = e => {
      const nx =  (e.clientX / window.innerWidth)  * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);

      // Compute delta → add as velocity impulse (wave feel)
      const dx = nx - prevMouseRef.current.x;
      const dy = ny - prevMouseRef.current.y;

      // Accumulate impulse, clamped to prevent wild spinning
      mouseRef.current.vx = Math.max(-0.08, Math.min(0.08, mouseRef.current.vx + dx * 2.0));
      mouseRef.current.vy = Math.max(-0.06, Math.min(0.06, mouseRef.current.vy + dy * 2.0));
      mouseRef.current.x  = nx;
      mouseRef.current.y  = ny;

      prevMouseRef.current.x = nx;
      prevMouseRef.current.y = ny;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 2.6], fov: 80 }}
      gl={{ antialias: true, alpha: false }}
      style={{ width: "100%", height: "100%", display: "block" }}
      onCreated={({ gl }) => gl.setClearColor(new THREE.Color("#05070f"), 1)}
    >
      <ambientLight intensity={0.06} />
      <NeuralSphere mouseRef={mouseRef} />
      <FloatingParticles />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.04}
          luminanceSmoothing={0.9}
          intensity={3.5}
          radius={1.0}
        />
        <Vignette offset={0.25} darkness={0.65} eskil={false} />
      </EffectComposer>
    </Canvas>
  );
}

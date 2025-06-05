"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const defaultFragmentShader = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0, 2, 4));
    gl_FragColor = vec4(color, 1.0);
}
`;

export default function ShaderPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const [fragShader, setFragShader] = useState(defaultFragmentShader);
  const [error, setError] = useState<string | null>(null);

  const uniforms = useRef({
    u_time: { value: 0.0 },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  });

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    rendererRef.current = renderer;
    mountRef.current?.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();

    const geometry = new THREE.PlaneGeometry(2, 2);

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms.current,
      vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
      fragmentShader: fragShader
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    materialRef.current = material;
    meshRef.current = mesh;

    const start = Date.now();
    const animate = () => {
      requestAnimationFrame(animate);
      uniforms.current.u_time.value = (Date.now() - start) * 0.001;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // 🔁 Try to hot-reload the shader if it's valid
  useEffect(() => {
    if (!rendererRef.current || !meshRef.current) return;

    try {
      // Attempt to compile the new shader with a throwaway material
      const testMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms.current,
        vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
        fragmentShader: fragShader,
      });

      // Force compile on the renderer (throws if bad)
      const dummyScene = new THREE.Scene();
      const dummyMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), testMaterial);
      const dummyCam = new THREE.Camera();
      dummyScene.add(dummyMesh);
      rendererRef.current.compile(dummyScene, dummyCam);

      // If no error, apply new material
      meshRef.current.material.dispose(); // clean up
      meshRef.current.material = testMaterial;
      materialRef.current = testMaterial;

      setError(null);
    } catch (err: any) {
      setError(err.message ?? "Shader compile error");
    }
  }, [fragShader]);

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <div ref={mountRef} style={{ position: "absolute", width: "100%", height: "100%" }} />
      <textarea
        value={fragShader}
        onChange={(e) => setFragShader(e.target.value)}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          width: "400px",
          height: "300px",
          background: "#111",
          color: "#0f0",
          fontFamily: "monospace",
          fontSize: "12px",
          opacity: 0.85,
          zIndex: 1
        }}
      />
      {error && (
        <pre
          style={{
            position: "absolute",
            top: 320,
            left: 10,
            width: "400px",
            background: "#300",
            color: "#f88",
            fontFamily: "monospace",
            fontSize: "12px",
            padding: "10px",
            zIndex: 1,
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {error}
        </pre>
      )}
    </div>
  );
}

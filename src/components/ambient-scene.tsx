"use client";

import { useEffect, useRef } from "react";

export function AmbientScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: import("three").WebGLRenderer | undefined;
    let frame = 0;
    let observer: ResizeObserver | undefined;
    let cleanup = () => {};

    void import("three").then((THREE) => {
      if (!canvas.isConnected) return;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 0, 10);
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const pointsCount = 180;
      const positions = new Float32Array(pointsCount * 3);
      for (let i = 0; i < pointsCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({ color: "#b9d2ff", size: 0.035, transparent: true, opacity: 0.65 });
      const stars = new THREE.Points(geometry, material);
      scene.add(stars);

      const shape = new THREE.IcosahedronGeometry(2.35, 1);
      const wire = new THREE.MeshBasicMaterial({ color: "#8cafff", wireframe: true, transparent: true, opacity: 0.15 });
      const orb = new THREE.Mesh(shape, wire);
      orb.position.set(2.55, -0.12, -1.7);
      scene.add(orb);
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.85, 3), new THREE.MeshBasicMaterial({ color: "#15264d", transparent: true, opacity: 0.62 }));
      core.position.copy(orb.position);
      scene.add(core);

      const resize = () => {
        const parent = canvas.parentElement;
        if (!parent || !renderer) return;
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      observer = new ResizeObserver(resize);
      if (canvas.parentElement) observer.observe(canvas.parentElement);
      resize();

      const render = () => {
        if (!reducedMotion) {
          orb.rotation.y += 0.0015;
          orb.rotation.x += 0.0007;
          stars.rotation.y -= 0.00016;
        }
        renderer?.render(scene, camera);
        if (!reducedMotion) frame = requestAnimationFrame(render);
      };
      render();
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer?.disconnect();
        shape.dispose(); wire.dispose(); geometry.dispose(); material.dispose();
        renderer?.dispose();
      };
    }).catch(() => undefined);

    return () => cleanup();
  }, []);

  return <canvas ref={canvasRef} className="ambient-canvas" aria-hidden="true" />;
}

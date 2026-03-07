"use client";

import { Line, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SpatialArtifact, SpatialObject } from "./artifact-store";

function ShapeGeometry({ shape }: { shape: SpatialObject["shape"] }) {
  switch (shape) {
    case "sphere":
      return <sphereGeometry args={[0.5, 32, 32]} />;
    case "box":
      return <boxGeometry args={[0.8, 0.8, 0.8]} />;
    case "torus":
      return <torusGeometry args={[0.4, 0.15, 16, 32]} />;
    case "cone":
      return <coneGeometry args={[0.5, 1, 32]} />;
    case "cylinder":
      return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
    case "dodecahedron":
      return <dodecahedronGeometry args={[0.5]} />;
    case "octahedron":
      return <octahedronGeometry args={[0.5]} />;
    case "icosahedron":
      return <icosahedronGeometry args={[0.5]} />;
  }
}

function SpatialObjectMesh({ obj }: { obj: SpatialObject }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_state, delta) => {
    if (obj.rotate && meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group position={obj.position}>
      <mesh ref={meshRef} scale={obj.scale ?? 1}>
        <ShapeGeometry shape={obj.shape} />
        <meshStandardMaterial
          color={obj.color}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      <Text
        position={[0, (obj.scale ?? 1) * 0.7 + 0.3, 0]}
        fontSize={0.25}
        color="#64748b"
        anchorX="center"
        anchorY="bottom"
      >
        {obj.label}
      </Text>
    </group>
  );
}

function ConnectionLine({
  from,
  to,
  color = "#94a3b8",
}: {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
}) {
  return <Line points={[from, to]} color={color} lineWidth={2} />;
}

function SpatialScene({ artifact }: { artifact: SpatialArtifact }) {
  const objectMap = useMemo(() => {
    const map = new Map<string, SpatialObject>();
    for (const obj of artifact.objects) {
      map.set(obj.id, obj);
    }
    return map;
  }, [artifact.objects]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} />

      {artifact.objects.map((obj) => (
        <SpatialObjectMesh key={obj.id} obj={obj} />
      ))}

      {artifact.connections?.map((conn) => {
        const fromObj = objectMap.get(conn.from);
        const toObj = objectMap.get(conn.to);
        if (!fromObj || !toObj) return null;
        return (
          <ConnectionLine
            key={`${conn.from}-${conn.to}`}
            from={fromObj.position}
            to={toObj.position}
            color={conn.color}
          />
        );
      })}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        autoRotate={artifact.autoRotate}
        autoRotateSpeed={1.5}
      />
    </>
  );
}

export function SpatialCard({ artifact }: { artifact: SpatialArtifact }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{artifact.title}</CardTitle>
        <CardDescription>{artifact.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="h-[400px] rounded-lg border bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950"
          data-testid={`spatial-${artifact.id}`}
        >
          <Canvas camera={{ position: [4, 3, 4], fov: 50 }}>
            <SpatialScene artifact={artifact} />
          </Canvas>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Drag to rotate, scroll to zoom</span>
          <span>{artifact.createdAt}</span>
        </div>
      </CardContent>
    </Card>
  );
}

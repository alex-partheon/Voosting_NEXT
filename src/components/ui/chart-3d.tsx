'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface ChartProps {
  data: ChartData[];
}

function Bar({ position, scale, color, label, value }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, scale[1] / 2, 0]} scale={scale} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.3} />
      </mesh>
      <Text
        position={[0, scale[1] + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="bottom"
      >
        {`₩${value.toLocaleString()}`}
      </Text>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="top"
        rotation={[-Math.PI / 4, 0, 0]}
      >
        {label}
      </Text>
    </group>
  );
}

function Chart({ data }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = 0.8;
  const barSpacing = 1.5;
  
  return (
    <group>
      {data.map((item, index) => {
        const height = (item.value / maxValue) * 4;
        const xPos = (index - data.length / 2) * barSpacing;
        
        return (
          <Bar
            key={index}
            position={[xPos, 0, 0]}
            scale={[barWidth, height, barWidth]}
            color={item.color}
            label={item.label}
            value={item.value}
          />
        );
      })}
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="oklch(20% 0.05 250deg)" opacity={0.5} transparent />
      </mesh>
    </group>
  );
}

export default function Chart3D({ data }: ChartProps) {
  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      shadows
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      <Chart data={data} />
      <OrbitControls 
        enablePan={false} 
        enableZoom={false} 
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}
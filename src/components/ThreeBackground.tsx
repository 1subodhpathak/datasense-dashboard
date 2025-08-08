import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

const ParticleField: React.FC = () => {
  const mesh = useRef<THREE.Points>(null);
  const particleCount = 2000;

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      colors[i * 3] = 0;
      colors[i * 3 + 1] = Math.random() * 0.5 + 0.5;
      colors[i * 3 + 2] = 1;
    }

    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.1;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.05;

      const positions = mesh.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i * 0.1) * 0.001;
      }
      mesh.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} vertexColors sizeAttenuation />
    </points>
  );
};

const GeometricGrid: React.FC = () => {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={group}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[0, 0, -i * 2]}>
          <ringGeometry args={[2 + i * 0.1, 2.1 + i * 0.1, 32]} />
          <meshBasicMaterial color="#00ffff" opacity={0.1 - i * 0.005} transparent />
        </mesh>
      ))}
    </group>
  );
};

const FloatingCubes: React.FC = () => {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.05;
      group.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.x = state.clock.elapsedTime * (0.5 + i * 0.1);
          child.rotation.z = state.clock.elapsedTime * (0.3 + i * 0.05);
          child.position.y = Math.sin(state.clock.elapsedTime + i) * 0.5;
        }
      });
    }
  });

  return (
    <group ref={group}>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 12) * Math.PI * 2) * 8,
            Math.sin(i * 0.5) * 3,
            Math.sin((i / 12) * Math.PI * 2) * 8
          ]}
          scale={0.3 + Math.sin(i) * 0.2}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color="#00ffff"
            opacity={0.3}
            transparent
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
};

const MatrixRain: React.FC = () => {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (group.current) {
      group.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.position.y -= 0.05;
          if (child.position.y < -10) {
            child.position.y = 10;
            child.position.x = (Math.random() - 0.5) * 20;
          }
        }
      });
    }
  });

  return (
    <group ref={group}>
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            Math.random() * 20 - 10,
            -5 - Math.random() * 5
          ]}
        >
          <planeGeometry args={[0.1, 2]} />
          <meshBasicMaterial
            color="#00ff41"
            opacity={0.6}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
};

const HolographicTorus: React.FC = () => {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, -8]}>
      {/* Example torus to use:
      <torusGeometry args={[3, 0.8, 16, 100]} />
      <meshBasicMaterial color="#ff00ff" opacity={0.4} transparent wireframe />
      */}
    </mesh>
  );
};

const ThreeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} color="#00ffff" intensity={0.5} />
        <pointLight position={[-10, -10, -10]} color="#ff00ff" intensity={0.3} />
        <ParticleField />
        {/* <GeometricGrid /> */}
        <FloatingCubes />
        {/* <MatrixRain /> */}
        <HolographicTorus />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
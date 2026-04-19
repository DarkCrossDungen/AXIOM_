/// <reference types="@react-three/fiber" />
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Interface for AI generated keyframes
export interface Keyframe {
  time: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

interface ModelProps {
  url: string;
  keyframes?: Keyframe[];
  isPlaying?: boolean;
  currentTime?: number; // In seconds
}

function Model({ url, keyframes, isPlaying, currentTime = 0 }: ModelProps) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);
  
  // Custom animation logic based on keyframes
  useFrame((state, delta) => {
    if (!modelRef.current || !keyframes || keyframes.length === 0) return;
    
    // Determine the active time (either playing natively or scrubbed via timeline)
    let t = currentTime;
    if (isPlaying) {
       // If we want native playback, we'd accumulate time here.
       // For now, we assume the parent timeline controls `currentTime` via scrub or its own setInterval/requestAnimationFrame
    }

    // Find the two keyframes we are between
    let kf1 = keyframes[0];
    let kf2 = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
        if (t >= keyframes[i].time && t <= keyframes[i+1].time) {
            kf1 = keyframes[i];
            kf2 = keyframes[i+1];
            break;
        }
    }

    // If time is past the last keyframe, hold last frame
    if (t >= kf2.time) {
        kf1 = kf2;
    }

    // Interpolation factor (0 to 1)
    let alpha = 0;
    if (kf2.time > kf1.time) {
        alpha = (t - kf1.time) / (kf2.time - kf1.time);
    }

    // Interpolate Position
    if (kf1.position && kf2.position) {
        modelRef.current.position.lerpVectors(
            new THREE.Vector3(...kf1.position),
            new THREE.Vector3(...kf2.position),
            alpha
        );
    }

    // Interpolate Rotation (Euler to Quaternion)
    if (kf1.rotation && kf2.rotation) {
        const q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(...kf1.rotation.map(r => THREE.MathUtils.degToRad(r))));
        const q2 = new THREE.Quaternion().setFromEuler(new THREE.Euler(...kf2.rotation.map(r => THREE.MathUtils.degToRad(r))));
        modelRef.current.quaternion.slerpQuaternions(q1, q2, alpha);
    }

    // Interpolate Scale
    if (kf1.scale && kf2.scale) {
        const s1 = new THREE.Vector3(...kf1.scale);
        const s2 = new THREE.Vector3(...kf2.scale);
        modelRef.current.scale.lerpVectors(s1, s2, alpha);
    }
  });

  return <primitive ref={modelRef} object={scene} />;
}

export function ThreeViewer({ url, keyframes, isPlaying, currentTime }: ModelProps) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#111' }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <Environment preset="city" />
        
        {url ? (
           <Model url={url} keyframes={keyframes} isPlaying={isPlaying} currentTime={currentTime} />
        ) : (
           <mesh>
             <boxGeometry args={[1, 1, 1]} />
             <meshStandardMaterial color="hotpink" />
           </mesh>
        )}
        
        <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.5} far={10} color="#000000" />
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}

// Preload to prevent hitching when loading model
// useGLTF.preload(url);

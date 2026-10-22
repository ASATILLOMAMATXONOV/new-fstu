import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei/core/ContactShadows.js';
import { useGLTF } from '@react-three/drei/core/Gltf.js';
import { useAnimations } from '@react-three/drei/core/useAnimations.js';
import * as THREE from 'three';

export const ROBOT_MODEL_URL = `${process.env.PUBLIC_URL || ''}/models/fstu-ai-friendly.glb`;

const stateToClip = {
  idle: 'idle', walking: 'walking', waving: 'greeting', greeting: 'greeting',
  thinking: 'thinking', preparing: 'thinking', listening: 'listening',
  talking: 'speaking', speaking: 'speaking', guiding: 'pointing', explaining: 'explaining'
};

function Model({ state, reducedMotion, direction }) {
  const root = useRef();
  const { scene, animations } = useGLTF(ROBOT_MODEL_URL);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
      node.material = node.material.clone();
      node.material.envMapIntensity = 1.35;
      if (/BlueLED|LED/i.test(node.material.name)) node.userData.isLED = true;
    });
    return clone;
  }, [scene]);
  const { actions } = useAnimations(animations, root);
  const currentAction = useRef(null);

  useEffect(() => {
    const name = reducedMotion ? 'idle' : stateToClip[state] || 'idle';
    const next = actions[name];
    if (!next) return undefined;
    currentAction.current?.fadeOut(.32);
    next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(.32).play();
    next.paused = reducedMotion;
    currentAction.current = next;
    return () => next.fadeOut(.25);
  }, [actions, reducedMotion, state]);

  useFrame(({ clock, pointer }, delta) => {
    if (!root.current) return;
    const targetY = reducedMotion ? 0 : (direction < 0 ? -.06 : .06) + pointer.x * .08;
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, targetY, 3.5, delta);
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, reducedMotion ? 0 : pointer.y * -.025, 3.5, delta);
    const pulse = reducedMotion ? .7 : .75 + Math.sin(clock.elapsedTime * 2) * .12;
    model.traverse((node) => {
      if (node.userData.isLED && node.material) node.material.emissiveIntensity = pulse;
    });
  });

  useEffect(() => () => {
    model.traverse((node) => { if (node.isMesh) node.material?.dispose?.(); });
  }, [model]);

  return <group ref={root} position={[0, 0, 0]} scale={.92}>
    <primitive object={model} />
  </group>;
}

class CanvasBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function RobotAvatar({ state, fallback, reducedMotion = false, direction = 1 }) {
  return <CanvasBoundary fallback={fallback}>
    <Canvas
      camera={{ position: [0, .2, 8.3], fov: 32, near: .1, far: 30 }}
      dpr={[1, 1.6]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
      shadows
      fallback={fallback}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={.8} />
      <hemisphereLight args={['#ffffff', '#8e96ad', 1.4]} />
      <directionalLight castShadow position={[-3, 5, 5]} intensity={2.8} color="#ffffff" shadow-mapSize={[512, 512]} />
      <directionalLight position={[4, 1, 3]} intensity={.8} color="#d9f5ff" />
      <Model state={state} reducedMotion={reducedMotion} direction={direction} />
      <ContactShadows position={[0, -1.68, 0]} opacity={.18} scale={4.2} blur={2.8} far={3} resolution={256} frames={1} />
    </Canvas>
  </CanvasBoundary>;
}

useGLTF.preload(ROBOT_MODEL_URL);

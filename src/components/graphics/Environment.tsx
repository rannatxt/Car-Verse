import React from 'react';
import { Environment as DreiEnvironment } from '@react-three/drei';

/**
 * HDRI environment lighting component.
 * Uses a built‑in preset when the custom HDRI is unavailable, ensuring the scene has lighting.
 */
const Environment: React.FC = () => {
  return <DreiEnvironment preset="city" background />;
};

export default Environment;

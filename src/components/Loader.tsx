import React from 'react';
import { Html, useProgress } from '@react-three/drei';

const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ color: 'white' }}>{progress.toFixed(2)}% loaded</div>
    </Html>
  );
};

export default Loader;


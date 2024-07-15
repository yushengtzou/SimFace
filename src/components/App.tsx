import React, { useState, useCallback } from 'react';
import Navbar from './Navbar';
import ThreeCanvas from './ThreeCanvas';
import Panel from './Panel';

const App: React.FC = () => {
    const [deformDistance, setDeformDistance] = useState(10); // Initial slider value
  
    // Memoize the slider change handler to prevent unnecessary re-renders
    const handleSliderChange = useCallback((value: number) => {
      // Update state when the slider changes
      setDeformDistance(value);
    }, []);
  
    return (
        <div className="h-full flex flex-col">
            <Navbar />
            <ThreeCanvas deformDistance={deformDistance} /> {/* Pass updated state */}
            <Panel value={deformDistance} onChange={handleSliderChange} /> {/* Pass updated state and handler */}
        </div>
    );
};

export default App;


import React from 'react';
import Navbar from './Navbar';
import ThreeCanvas from './ThreeCanvas';
import Panel from './Panel';

const App: React.FC = () => (
  <div className="h-full flex flex-col">
    <Navbar />
    <ThreeCanvas />
    <Panel />
  </div>
);

export default App;



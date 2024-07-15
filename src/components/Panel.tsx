import React from 'react';

interface PanelProps {
    value: number;
    onChange: (value: number) => void;
}

const Panel: React.FC<PanelProps> = ({ value, onChange }) => (
  <div id="panel" className="fixed right-10 top-1/2 transform -translate-y-1/2 w-64 bg-white p-5 shadow-md rounded-md border border-gray-300 hidden flex flex-col justify-between">
    <div className="text-center">
      <p className="text-xl leading-7">Curves Tool</p>
    </div>
    <hr className="border-t border-gray-300 w-full my-4" />
    <div className="py-2">
      <p className="font-medium">Range</p>
      <input 
          type="range" 
          id="distance-slider" 
          className="slider w-full mt-2" 
          min="0" 
          max="100" 
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))} // Invoke handler
      />
    </div>
  </div>
);

export default Panel;


import React from 'react';

interface FacelandMarkProps {
  // Face Landmarks
  enableFaceLandmarks: boolean;
  handleFaceLandmarks: () => void; 
}

const FacelandMarkCard: React.FC<FacelandMarkProps> = ({
  enableFaceLandmarks,
  handleFaceLandmarks
}) => {
  const buttonClass = "bg-white rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 border transition-colors duration-300";

  return (
    <div className="mt-2">
      <div className="flex justify-evenly pt-6 mb-2">
        <button 
          onClick={handleFaceLandmarks}
          className={`${buttonClass} ${enableFaceLandmarks ? 'bg-gray-200' : ''}`}
        >
          Edit
        </button>
        <button 
          className={buttonClass}
        >
          Clear
        </button>
      </div>
      <p className="text-sm text-gray-600">
      </p>
    </div>
  );
};

export default FacelandMarkCard;


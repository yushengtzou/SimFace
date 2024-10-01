import React from 'react';

interface AssessmentProps {
  // Euclidean Distance
  enableEuclidean: boolean;
  handleEuclideanDistance: () => void; 
}

const AssessmentCard: React.FC<AssessmentProps> = ({
  // Euclidean Distance
  enableEuclidean,
  handleEuclideanDistance
}) => {
  const buttonClass = "bg-white rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 border transition-colors duration-300";


  return (
    <div className="mt-2">
      <div className="flex flex-col pt-3 mb-2">
        <button 
          onClick={handleEuclideanDistance}
          className={`${buttonClass} ${enableEuclidean ? 'bg-gray-200' : ''}`}
        >
          Euclidean Distance
        </button>
        <button 
//          onClick={onGeodesicDistance}
          className={buttonClass}
        >
          Geodesic Distance
        </button>
        <button 
//          onClick={onArea}
          className={buttonClass}
        >
         Area 
        </button>
        <button 
//          onClick={onVolume}
          className={buttonClass}
        >
         Volume 
        </button>
      </div>
    </div>
  );
};

export default AssessmentCard;


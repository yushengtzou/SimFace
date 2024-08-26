import React from 'react';

interface AssessmentProps {
  onRotateFront: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  targetRotation: number;
}

const AssessmentCard: React.FC<AssessmentProps> = ({
  onRotateFront,
  onRotateLeft,
  onRotateRight,
  targetRotation
}) => {
  const buttonClass = "bg-white rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 border transition-colors duration-300";

  return (
    <div className="mt-2">
      <div className="flex flex-col pt-6 mb-2">
        <button 
          onClick={onRotateLeft}
          className={buttonClass}
        >
          Euclidean Distance
        </button>
        <button 
          onClick={onRotateFront}
          className={buttonClass}
        >
          Geodesic Distance
        </button>
        <button 
          onClick={onRotateFront}
          className={buttonClass}
        >
         Area 
        </button>
        <button 
          onClick={onRotateFront}
          className={buttonClass}
        >
         Volume 
        </button>
      </div>
    </div>
  );
};

export default AssessmentCard;


import React from 'react';

interface FacelandMarkProps {
  onRotateFront: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  targetRotation: number;
}

const FacelandMarkCard: React.FC<FacelandMarkProps> = ({
  onRotateFront,
  onRotateLeft,
  onRotateRight,
  targetRotation
}) => {
  const buttonClass = "bg-white rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 border transition-colors duration-300";

  return (
    <div className="mt-2">
      <div className="flex justify-evenly pt-6 mb-2">
        <button 
          onClick={onRotateLeft}
          className={buttonClass}
        >
          Edit
        </button>
        <button 
          onClick={onRotateFront}
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


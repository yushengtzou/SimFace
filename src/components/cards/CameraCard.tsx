import React from 'react';

interface CameraCardProps {
  onRotateFront: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  targetRotation: number;
}

const CameraCard: React.FC<CameraCardProps> = ({
  onRotateFront,
  onRotateLeft,
  onRotateRight,
  targetRotation
}) => {
  const buttonClass = "bg-white rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 border transition-colors duration-300";

  return (
    <div className="mt-2">
      <div className="flex justify-around pt-6 mb-2">
        <button 
          onClick={onRotateLeft}
          className={buttonClass}
        >
          Left
        </button>
        <button 
          onClick={onRotateFront}
          className={buttonClass}
        >
          Front
        </button>
        <button 
          onClick={onRotateRight}
          className={buttonClass}
        >
          Right
        </button>
      </div>
      <p className="text-sm text-gray-600">
      </p>
    </div>
  );
};

export default CameraCard;


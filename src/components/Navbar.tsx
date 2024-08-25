import React, { useState } from 'react';
import Info from './dialogs';
import { Example } from './Drawers';


const Navbar: React.FC = () => {
  const [showInfo, setShowInfo] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            {/* Left side items */}
            <div className="flex flex-1 items-center sm:items-stretch sm:justify-start">
              <a href="#" className="rounded-md px-3 py-2 text-base font-normal text-gray-900 hover:bg-gray-200">Setting</a>
            </div>
            {/* Center logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-shrink-0 items-center">
              <a href="#" className="font-sans rounded-md px-3 py-2 text-xl font-medium text-gray-900">SimFace</a>
            </div>

            {/* Right side items */}
            <div className="ml-auto hidden sm:flex sm:space-x-4">
              <button 
                onClick={() => setOpen(prev => !prev)}
                className="rounded-md px-3 py-2 text-base font-normal text-gray-900 hover:bg-gray-200"
              >
                Analysis
              </button>

              <button 
                onClick={() => setShowInfo(prevState => !prevState)}
                className="rounded-md px-3 py-2 text-base font-normal text-gray-900 hover:bg-gray-200"
              >
                Info
              </button>

              <a href="#" id="uploadLink" className="rounded-md px-3 py-2 text-base font-normal text-gray-900 hover:bg-gray-200">Upload</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Render the Info component only when showInfo is true */}
      {showInfo && <Info />}

      {/* Render the Example component for the Analysis drawer */}
      <Example open={open} setOpen={setOpen} />
    </>
  );
};

export default Navbar;


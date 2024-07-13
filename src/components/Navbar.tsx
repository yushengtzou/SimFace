import React from 'react';

const Navbar: React.FC = () => (
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
          <a href="#" className="rounded-md px-3 py-2 text-base font-normal text-gray-900 hover:bg-gray-200">Analysis</a>
          <a href="#" className="rounded-md px-3 py-2 text-base font-normal text-gray-900 hover:bg-gray-200">Help</a>
          <a href="#" id="uploadLink" className="rounded-md px-3 py-2 text-base font-normal text-gray-900 hover:bg-gray-200">Upload</a>
          <input
            type="file"
            id="fileInput"
            name="fileInput"
            accept=".obj, image/png, image/jpeg"
            // @ts-ignore
            webkitdirectory="true"
            // @ts-ignore
            mozdirectory="true"
          />
        </div>
      </div>
    </div>
  </nav>
);

export default Navbar;



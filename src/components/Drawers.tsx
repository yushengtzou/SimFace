import React from 'react';
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import  CameraCard  from './cards/CameraCard'
import  FacelandMarkCard from './cards/FacelandMark'
import  AssessmentCard from './cards/Assessment'
import  SculptorCard from './cards/Sculptor'


interface DrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;

  // 1. Face Landmarks
  enableFaceLandmarks: boolean;
  handleFaceLandmarks: () => void; 

  // 2. Euclidean Distance
  enableEuclidean: boolean;
  handleEuclideanDistance: () => void; 

  // 3. Face Sculptor 
  enableTzouBrush: boolean;
  handleTzouBrush: () => void; 
  radius: number;
  handleRadiusChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

  // 4. Rotation
  onRotateFront: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  targetRotation: number;
}

export function Drawer({ 
  open, 
  setOpen, 

  // 1. Face Landmarks
  enableFaceLandmarks,
  handleFaceLandmarks, 

  // 2. Euclidean Distance
  enableEuclidean,
  handleEuclideanDistance,

  // 3. Face Sculptor
  enableTzouBrush,
  handleTzouBrush,
  radius,
  handleRadiusChange,

  // 4. Rotation
  onRotateFront, 
  onRotateLeft, 
  onRotateRight,
  targetRotation
}: DrawerProps) {
  const handleClose = () => {
    // Do nothing, preventing the drawer from closing on outside clicks
  }

  const cards = [
    "FACE LANDMARKS & CENTERING",
    "ASSESSMENT",
    "FACE SCULPTOR",
    "CAMERA"
  ];

  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0">
            <div className="pointer-events-none fixed top-16 bottom-0 right-0 flex max-w-full">
              <Transition.Child
                as={React.Fragment}
                enter="transform transition ease-in-out duration-200 sm:duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-200 sm:duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-sm overflow-y-auto">
                  <div className="flex h-full flex-col bg-white border py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-semibold leading-6 text-gray-900">
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-offset-2"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      <div className="grid grid-cols-1 gap-4">
                        {cards.map((card, index) => (
                          <div key={index}  className="bg-white p-4 border shadow rounded-lg">
                            <h3 className="text-base text-center font-medium text-gray-900">{card}</h3>
                            {card === "CAMERA" ? (
                              <CameraCard
                                onRotateFront={onRotateFront}
                                onRotateLeft={onRotateLeft}
                                onRotateRight={onRotateRight}
                                targetRotation={targetRotation}
                              />
                           )  : card === "FACE LANDMARKS & CENTERING" ? (
                              <FacelandMarkCard
                                // Face Landmarks
                                enableFaceLandmarks = {enableFaceLandmarks}
                                handleFaceLandmarks = {handleFaceLandmarks}  
                              />
                           )  : card === "ASSESSMENT" ? (
                              <AssessmentCard
                                // Euclidean Distance
                                enableEuclidean = {enableEuclidean}
                                handleEuclideanDistance = {handleEuclideanDistance}
                              />
                           )  : card === "FACE SCULPTOR" ? (
                              <SculptorCard
                                // Effect Distance
                                enableTzouBrush = {enableTzouBrush}
                                handleTzouBrush = {handleTzouBrush}
                                rangeValue={radius}
                                handleRadiusChange = {handleRadiusChange}
                              />
                           )  : (
                              <p className="mt-1 text-sm pt-6 text-gray-600">
                                Click to access {card.toLowerCase()} tools and options.
                              </p>
                           )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}


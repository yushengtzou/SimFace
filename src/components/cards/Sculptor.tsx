import React, { useState, useCallback } from 'react';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';

interface SculptorProps {
  handleTzouBrush: () => void;
  radius: number;
  handleRadiusChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const tools = [
  { id: 1, name: 'Tzou Brush' },
  { id: 2, name: 'PDO Thread Lifting' },
];

const SculptorCard: React.FC<SculptorProps> = ({
  handleTzouBrush,
  radius,
  handleRadiusChange
}) => {
  const [selectedTool, setSelectedTool] = useState(tools[0]);
  
  const handleToolChange = useCallback((tool) => {
    setSelectedTool(tool);
    if (tool.name === 'Tzou Brush') {
      handleTzouBrush();
    }
    // 可以在这里添加其他工具的处理逻辑
  }, [handleTzouBrush]);

  const buttonClass = "bg-white rounded-md px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 border transition-colors duration-300";
  
  return (
    <div className="mt-2">
      <div className="flex flex-col pt-3 mb-2">
        <Listbox value={selectedTool} onChange={handleToolChange}>
          <div className="relative mt-1">
            <Listbox.Button className={buttonClass + " w-full text-left"}>
              <span className="block truncate">{selectedTool.name}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {tools.map((tool) => (
                <Listbox.Option
                  key={tool.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-gray-100 text-gray-700' : 'text-gray-700'
                    }`
                  }
                  value={tool}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {tool.name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
        <div className={"bg-white rounded-md px-3 py-2 text-sm font-medium text-gray-700 border transition-colors duration-300 mt-4"}>
          <div className="price-range p-4">
            <span className="text-sm">Radius</span>
            <input
              className="w-full accent-indigo-600"
              type="range"
              name="Radius"
              value={radius}
              min="0"
              max="10"
              step="0.1"
              onChange={handleRadiusChange}
            />
            <div className="-mt-2 flex w-full justify-between">
              <span className="text-sm text-gray-600">0</span>
              <span className="text-sm text-gray-600">10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SculptorCard;


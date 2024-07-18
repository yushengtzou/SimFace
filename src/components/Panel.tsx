import React from 'react';

interface PanelProps {
    value: number;
    onChange: (value: number) => void;
    onRotateFront: () => void;
    onRotateLeft: () => void;
    onRotateRight: () => void;
}

const Panel: React.FC<PanelProps> = ({ 
    value, 
    onChange, 
    onRotateFront, 
    onRotateLeft, 
    onRotateRight
}) => {
    const buttonStyle = {
        backgroundColor:'white',
        borderRadius: '7px',
        padding: '10px 10px',
        margin: '0 5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
    };

    return (
        <div id="panel" className="fixed right-10 top-1/2 transform -translate-y-1/2 w-64 bg-white p-5 shadow-md rounded-md border border-gray-300 flex flex-col justify-between">
            <div className="text-center">
                <p className="text-xl leading-7">Tool</p>
            </div>
            <hr className="border-t border-gray-300 w-full my-4" />
            
            <div className="flex justify-between mb-4">
                <button 
                    onClick={onRotateLeft}
                    style={buttonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(229 231 235)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                    Left
                </button>
                <button 
                    onClick={onRotateFront}
                    style={buttonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(229 231 235)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                    Front
                </button>
                <button 
                    onClick={onRotateRight}
                    style={buttonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(229 231 235)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                    Right
                </button>
            </div>

            <div className="py-2">
                <p className="font-medium">Range</p>
                <input 
                    type="range" 
                    id="distance-slider" 
                    className="slider w-full mt-2" 
                    min="0" 
                    max="100" 
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                />
            </div>
        </div>
    );
};

export default Panel;

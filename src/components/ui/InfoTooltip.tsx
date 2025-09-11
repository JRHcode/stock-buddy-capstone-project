import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ 
  content, 
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getTooltipPosition = () => {
    const positions = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    };
    return positions[position];
  };

  const getArrowPosition = () => {
    const arrows = {
      top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900 border-opacity-50',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900 border-opacity-50',
      left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900 border-opacity-50',
      right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900 border-opacity-50'
    };
    return arrows[position];
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Info Icon */}
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="inline-flex items-center justify-center w-4 h-4 ml-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 rounded-full"
        aria-label="More information"
      >
        <Info size={16} />
      </button>

      {/* Tooltip */}
      {isVisible && (
        <div className="absolute z-50" style={{ right: position === 'top' || position === 'bottom' ? '-50%' : 'auto' }}>
          <div className={`relative ${getTooltipPosition()}`}>
            <div className="bg-gray-900 bg-opacity-75 text-white text-sm rounded-lg px-3 py-2 max-w-md w-max whitespace-normal shadow-lg backdrop-blur-sm border border-blue-300">
              {content}
            </div>
            {/* Arrow */}
            <div className={`absolute w-0 h-0 border-4 ${getArrowPosition()}`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;

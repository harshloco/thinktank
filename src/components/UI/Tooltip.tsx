// src/components/UI/Tooltip.tsx
import React, { useState } from 'react';

interface TooltipProps {
  trigger: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  trigger, 
  content, 
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block group">
      <div 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {trigger}
      </div>
      
      {isVisible && (
        <div 
          className={`
            absolute z-10 
            ${positionClasses[position]}
            bg-gray-800 text-white text-xs 
            px-3 py-2 rounded 
            shadow-lg
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
};
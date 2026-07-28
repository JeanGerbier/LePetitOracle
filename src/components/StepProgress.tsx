import React from 'react';

interface StepProgressProps {
  percent?: number;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  percent = 0,
}) => {
  return (
    <div className="w-full bg-stone-200/70 h-10 rounded-full p-1 overflow-hidden shadow-inner flex items-center">
      <div
        className="bg-[#6B9E8B] text-white font-bold text-xs sm:text-sm h-full px-5 rounded-full flex items-center justify-center shadow-md transition-all duration-500 min-w-[145px]"
        style={{ width: `${percent}%` }}
      >
        <span className="font-extrabold tracking-wider whitespace-nowrap">
          {percent}% complété
        </span>
      </div>
    </div>
  );
};

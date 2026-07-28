import React from 'react';

interface StepProgressProps {
  currentStep?: number;
  totalSteps?: number;
  label?: string;
  percent?: number;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep = 2,
  totalSteps = 3,
  label = "L'Arrivée",
  percent = 65,
}) => {
  return (
    <div className="w-full bg-stone-200/70 h-10 rounded-full p-1 overflow-hidden shadow-inner flex items-center">
      <div
        className="bg-[#6B9E8B] text-white font-medium text-xs sm:text-sm h-full px-5 sm:px-6 rounded-full flex items-center justify-between shadow-md transition-all duration-500"
        style={{ width: `${percent}%` }}
      >
        <span className="font-semibold tracking-wide">
          Étape {currentStep}/{totalSteps} : {label}
        </span>
        <span className="hidden sm:inline-block text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
          {percent}% complété
        </span>
      </div>
    </div>
  );
};

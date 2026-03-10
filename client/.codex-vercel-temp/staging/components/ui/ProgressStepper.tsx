import React from "react";

interface ProgressStepperProps {
    steps: string[];
    currentStep: number; // 1-indexed
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
    steps,
    currentStep,
}) => {
    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber <= currentStep;
                    const isLast = index === steps.length - 1;

                    return (
                        <React.Fragment key={index}>
                            <div className="flex flex-col items-center relative z-10">
                                <div
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isActive
                                            ? "bg-primary border-primary text-white"
                                            : "bg-white border-gray-200 text-gray-400"
                                        }
                  `}
                                >
                                    {stepNumber < currentStep ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    ) : (
                                        <span>{stepNumber}</span>
                                    )}
                                </div>
                                <span
                                    className={`
                    absolute top-12 text-xs font-medium whitespace-nowrap
                    ${isActive ? "text-navy-deep dark:text-pearl" : "text-gray-400"}
                  `}
                                >
                                    {step}
                                </span>
                            </div>
                            {!isLast && (
                                <div
                                    className={`
                    flex-1 h-0.5 mx-2 -mt-10 transition-all duration-300
                    ${stepNumber < currentStep ? "bg-primary" : "bg-gray-200"}
                  `}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="h-10" /> {/* Spacer for labels */}
        </div>
    );
};

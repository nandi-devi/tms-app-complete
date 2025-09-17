import React from 'react';

interface FormStepProps {
    currentStep: number;
    totalSteps: number;
    steps: { title: string; description?: string }[];
    onStepClick?: (step: number) => void;
}

export const FormStep: React.FC<FormStepProps> = ({ 
    currentStep, 
    totalSteps, 
    steps, 
    onStepClick 
}) => {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isCurrent = currentStep === stepNumber;
                    const isClickable = onStepClick && (isCompleted || isCurrent);
                    
                    return (
                        <div key={stepNumber} className="flex items-center">
                            <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                                    isCompleted
                                        ? 'bg-green-500 text-white'
                                        : isCurrent
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-300 text-gray-600'
                                } ${isClickable ? 'cursor-pointer hover:opacity-80' : ''}`}
                                onClick={isClickable ? () => onStepClick!(stepNumber) : undefined}
                            >
                                {isCompleted ? '✓' : stepNumber}
                            </div>
                            <div className="ml-2">
                                <div className={`text-sm font-medium ${
                                    isCurrent ? 'text-blue-600' : 'text-gray-500'
                                }`}>
                                    {step.title}
                                </div>
                                {step.description && (
                                    <div className="text-xs text-gray-400">
                                        {step.description}
                                    </div>
                                )}
                            </div>
                            {stepNumber < totalSteps && (
                                <div className="w-8 h-0.5 bg-gray-300 ml-4" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

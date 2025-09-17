import React from 'react';
import { Button } from './Button';

interface FormNavigationProps {
    currentStep: number;
    totalSteps: number;
    onPrevious: () => void;
    onNext: () => void;
    onCancel: () => void;
    onSubmit: () => void;
    isSubmitting?: boolean;
    canProceed?: boolean;
    showPrevious?: boolean;
    showNext?: boolean;
    showSubmit?: boolean;
    previousText?: string;
    nextText?: string;
    submitText?: string;
    cancelText?: string;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
    currentStep,
    totalSteps,
    onPrevious,
    onNext,
    onCancel,
    onSubmit,
    isSubmitting = false,
    canProceed = true,
    showPrevious = true,
    showNext = true,
    showSubmit = true,
    previousText = '← Previous',
    nextText = 'Next →',
    submitText = 'Save',
    cancelText = 'Cancel'
}) => {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    return (
        <div className="flex justify-between pt-6 mt-6 border-t">
            <div>
                {!isFirstStep && showPrevious && (
                    <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={onPrevious}
                        disabled={isSubmitting}
                    >
                        {previousText}
                    </Button>
                )}
            </div>
            <div className="flex space-x-2">
                <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={onCancel} 
                    disabled={isSubmitting}
                >
                    {cancelText}
                </Button>
                
                {!isLastStep && showNext && (
                    <Button 
                        type="button" 
                        onClick={onNext}
                        disabled={!canProceed || isSubmitting}
                    >
                        {nextText}
                    </Button>
                )}
                
                {isLastStep && showSubmit && (
                    <Button 
                        type="submit" 
                        onClick={onSubmit}
                        disabled={!canProceed || isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : submitText}
                    </Button>
                )}
            </div>
        </div>
    );
};

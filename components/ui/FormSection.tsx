import React from 'react';

interface FormSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'gray' | 'blue' | 'green';
}

export const FormSection: React.FC<FormSectionProps> = ({
    title,
    description,
    children,
    className = '',
    variant = 'default'
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'gray':
                return 'bg-gray-50 border-gray-200';
            case 'blue':
                return 'bg-blue-50 border-blue-200';
            case 'green':
                return 'bg-green-50 border-green-200';
            default:
                return 'bg-white border-gray-200';
        }
    };

    return (
        <div className={`rounded-lg border p-4 ${getVariantClasses()} ${className}`}>
            <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-700">{title}</h4>
                {description && (
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
            </div>
            {children}
        </div>
    );
};

import React from 'react';
import { Button } from './Button';

interface PdfViewWrapperProps {
  title: string;
  onBack: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const PdfViewWrapper: React.FC<PdfViewWrapperProps> = ({ title, onBack, actions, children }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="secondary">
            &larr; Back
          </Button>
          <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      </div>
      <div className="bg-gray-200 p-4 sm:p-8 rounded-lg">
        <div className="flex justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};

import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className, titleClassName }) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {title && <h3 className={`text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-3 ${titleClassName}`}>{title}</h3>}
      {children}
    </div>
  );
};

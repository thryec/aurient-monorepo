import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = true
}) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200 shadow-sm';
  const paddingClass = padding ? 'p-6' : '';
  const classes = `${baseClasses} ${paddingClass} ${className}`;
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
};
import React from 'react';
import { cn } from '../../utils/helpers';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          id={inputId}
          className={cn(
            'block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error
              ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500'
              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="text-gray-400">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-danger-600">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;

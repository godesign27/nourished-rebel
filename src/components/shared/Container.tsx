import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  size?: 'default' | 'narrow' | 'wide';
  className?: string;
}

export function Container({ children, size = 'default', className = '' }: ContainerProps) {
  const sizeStyles = {
    default: 'max-w-[1200px]',
    narrow: 'max-w-[800px]',
    wide: 'max-w-[1400px]',
  };

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${sizeStyles[size]} ${className}`}>
      {children}
    </div>
  );
}

import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  background?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export function Section({ children, spacing = 'lg', background = 'primary', className = '' }: SectionProps) {
  const spacingStyles = {
    sm: 'py-6 md:py-8',
    md: 'py-8 md:py-12',
    lg: 'py-10 md:py-16',
  };

  const backgroundStyles = {
    primary: 'bg-background-primary',
    secondary: 'bg-background-secondary',
    white: 'bg-background-white',
  };

  return (
    <section className={`${spacingStyles[spacing]} ${backgroundStyles[background]} ${className}`}>
      {children}
    </section>
  );
}

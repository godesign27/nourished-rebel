import { ReactNode } from 'react';

interface HeadingProps {
  children: ReactNode;
  className?: string;
}

export function H1({ children, className = '' }: HeadingProps) {
  return (
    <h1 className={`text-heading-1 md:text-display font-bold text-text-heading ${className}`}>
      {children}
    </h1>
  );
}

export function H2({ children, className = '' }: HeadingProps) {
  return (
    <h2 className={`text-heading-2 md:text-heading-1 font-bold ${className}`} style={{ color: '#423A34' }}>
      {children}
    </h2>
  );
}

export function H3({ children, className = '' }: HeadingProps) {
  return (
    <h3 className={`text-heading-3 font-semibold ${className}`} style={{ color: '#282421' }}>
      {children}
    </h3>
  );
}

export function BodyText({ children, className = '' }: HeadingProps) {
  return (
    <p className={`text-body md:text-body-large text-text-primary leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

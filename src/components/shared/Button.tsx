import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  children: ReactNode;
  href?: string;
}

export function Button({ variant = 'primary', children, href, className = '', ...props }: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-all duration-medium focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-brand-primary text-text-inverse hover:bg-brand-primary-dark shadow-sm hover:shadow-md',
    secondary: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-text-inverse',
    text: 'text-brand-primary hover:text-brand-primary-dark underline-offset-4 hover:underline px-0',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={combinedClassName}>
        {children}
      </a>
    );
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = true, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-background-primary rounded-card-lg p-6 shadow-card ${
        hover ? 'transition-all duration-medium hover:shadow-card-hover hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface ResourceCardProps {
  title: string;
  summary: string;
  category: string;
  imageUrl?: string | null;
  publishDate?: string;
  onClick?: () => void;
}

export function ResourceCard({ title, summary, category, imageUrl, publishDate, onClick }: ResourceCardProps) {
  return (
    <Card hover={!!onClick} className={`${onClick ? 'cursor-pointer' : ''} !bg-background-white`}>
      {imageUrl && (
        <div className="mb-4 -mx-6 -mt-6 rounded-t-card-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-block px-3 py-1 bg-accent-muted/20 text-accent-muted text-body-small font-medium rounded-full">
            {category}
          </span>
          {publishDate && (
            <span className="text-text-primary text-body-small">
              {new Date(publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
        <h3 className="text-heading-4 font-semibold text-text-heading leading-tight">
          {title}
        </h3>
        <p className="text-body text-text-primary leading-relaxed">
          {summary}
        </p>
      </div>
    </Card>
  );
}

interface ProgramCardProps {
  name: string;
  summary: string;
  duration: string;
  ctaLabel: string;
  imageUrl?: string | null;
  onClick?: () => void;
}

export function ProgramCard({ name, summary, duration, ctaLabel, imageUrl, onClick }: ProgramCardProps) {
  return (
    <Card hover={!!onClick} className={`${onClick ? 'cursor-pointer' : ''} !bg-background-white`}>
      {imageUrl && (
        <div className="mb-4 -mx-6 -mt-6 rounded-t-card-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      <div className="space-y-4">
        <div>
          <span className="inline-block px-3 py-1 bg-brand-primary/20 text-brand-primary text-body-small font-medium rounded-full mb-3">
            {duration}
          </span>
          <h3 className="text-heading-3 font-semibold text-text-heading leading-tight mb-3">
            {name}
          </h3>
          <p className="text-body text-text-primary leading-relaxed">
            {summary}
          </p>
        </div>
        <button
          onClick={onClick}
          className="text-brand-primary font-medium hover:text-brand-primary-dark transition-colors duration-fast inline-flex items-center gap-1"
        >
          {ctaLabel}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </Card>
  );
}

interface PillarCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function PillarCard({ icon, title, description }: PillarCardProps) {
  return (
    <Card hover={false} className="text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-accent-secondary/20 text-accent-secondary">
          {icon}
        </div>
        <h3 className="text-heading-3 font-semibold text-text-heading">
          {title}
        </h3>
        <p className="text-body text-text-primary leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  );
}

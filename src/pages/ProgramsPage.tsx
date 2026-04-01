import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/shared/Container';
import { Section } from '../components/shared/Section';
import { H1, H2, BodyText } from '../components/shared/Heading';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import type { Program, ProgramVariant } from '../types';

export function ProgramsPage() {
  useDocumentMeta({
    title: 'Programs & Services',
    description: 'Personalized nutrition coaching and group wellness programs designed to help you heal your relationship with food, honor your body, and discover what truly nourishes you.',
    canonicalPath: '/programs',
  });
  const [programs, setPrograms] = useState<Program[]>([]);
  const [variantsByProgram, setVariantsByProgram] = useState<Record<string, ProgramVariant[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const [programsRes, variantsRes] = await Promise.all([
        supabase
          .from('programs')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('program_variants')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
      ]);

      if (programsRes.error) throw programsRes.error;
      setPrograms(programsRes.data || []);

      if (!variantsRes.error && variantsRes.data) {
        const grouped: Record<string, ProgramVariant[]> = {};
        for (const v of variantsRes.data) {
          if (!grouped[v.program_id]) grouped[v.program_id] = [];
          grouped[v.program_id].push(v);
        }
        setVariantsByProgram(grouped);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['all', ...new Set(programs.map((p) => p.category))];
  const filteredPrograms =
    selectedCategory === 'all'
      ? programs
      : programs.filter((p) => p.category === selectedCategory);

  return (
    <div className="pt-20">
      <Section spacing="lg" background="primary">
        <Container size="narrow" className="text-center">
          <H1 className="mb-6">Programs & Services</H1>
          <BodyText className="text-lg">
            Personalized coaching and group programs designed to help you heal your
            relationship with food, honor your body, and discover what truly nourishes you.
          </BodyText>
        </Container>
      </Section>

      <Section spacing="lg" background="white">
        <Container>
          {categories.length > 2 && (
            <div className="flex justify-center gap-3 mb-12 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Programs' : category}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">Loading programs...</p>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">
                No programs available at the moment. Please check back soon.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredPrograms.map((program) => (
                <ProgramListItem key={program.id} program={program} variants={variantsByProgram[program.id] || []} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}

function formatPriceRange(variants: ProgramVariant[]): string | null {
  if (variants.length === 0) return null;
  const prices = variants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === 0 && max === 0) return 'Free';
  if (min === 0) return `Free – $${max}`;
  if (min === max) return `$${min}`;
  return `$${min} – $${max}`;
}

interface ProgramListItemProps {
  program: Program;
  variants: ProgramVariant[];
}

function ProgramListItem({ program, variants }: ProgramListItemProps) {
  return (
    <Link
      to={`/programs/${program.slug}`}
      className="block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-brand-200 group"
    >
      <div className="grid md:grid-cols-[300px_1fr] gap-0">
        {program.image_url && (
          <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
            <img
              src={program.image_url}
              alt={program.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-3">
              <span className="inline-block px-3 py-1 bg-brand-100 text-brand-700 text-sm font-medium rounded-full">
                {program.category}
              </span>
              <div className="flex items-center text-brand-600 group-hover:text-brand-700 transition-colors">
                <span className="text-sm font-medium mr-2">View Details</span>
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>

            <H2 className="mb-3 group-hover:text-brand-600 transition-colors">
              {program.name}
            </H2>

            <p className="text-text-primary mb-4 leading-relaxed line-clamp-3">
              {program.summary}
            </p>

            {program.ideal_participant && (
              <div className="bg-accent-50 border-l-4 border-accent-500 p-3 rounded-r mb-4">
                <p className="text-sm text-text-primary">
                  <span className="font-semibold">Ideal for:</span> {program.ideal_participant}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm text-text-secondary pt-4 border-t border-gray-100">
            <div>
              <span className="font-medium text-text-heading">Duration:</span> {program.duration}
            </div>
            {(() => {
              const range = formatPriceRange(variants);
              return range ? (
                <div>
                  <span className="font-medium text-text-heading">{range}</span>
                </div>
              ) : program.price ? (
                <div>
                  <span className="font-medium text-text-heading">Starting at:</span> ${program.price}
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    </Link>
  );
}

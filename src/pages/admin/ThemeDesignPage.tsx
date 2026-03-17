import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { H1 } from '../../components/shared/Heading';
import { Button } from '../../components/shared/Button';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';

interface ColorRamp {
  [key: string]: string;
}

interface ThemeColors {
  [colorName: string]: ColorRamp;
}

interface FontFamily {
  family: string;
  weights: string[];
}

interface ThemeFonts {
  heading: FontFamily;
  body: FontFamily;
}

const colorDescriptions: { [key: string]: { name: string; description: string; base: string } } = {
  brand: { name: 'Warm Brown', description: 'Primary brand color for CTAs, headings, and buttons', base: '500' },
  cream: { name: 'Cream', description: 'Main page background and primary surfaces', base: '200' },
  stone: { name: 'Stone', description: 'Alternating sections, cards, and dividers', base: '300' },
  olive: { name: 'Olive', description: 'Tags, badges, and small accent elements', base: '500' },
  terracotta: { name: 'Terracotta', description: 'Icon tints, secondary CTAs, decorative elements', base: '500' },
  clay: { name: 'Clay', description: 'Important badges, emphasis blocks, illustration accents', base: '500' },
  charcoal: { name: 'Charcoal', description: 'Body copy, paragraphs, all main text content', base: '900' },
  success: { name: 'Success', description: 'Positive feedback and confirmations', base: '500' },
  warning: { name: 'Warning', description: 'Warnings and important notices', base: '500' },
  error: { name: 'Error', description: 'Errors and destructive actions', base: '500' },
  info: { name: 'Info', description: 'Informational messages and notifications', base: '500' },
};

export function ThemeDesignPage() {
  const navigate = useNavigate();
  const { refreshTheme } = useTheme();
  const [colors, setColors] = useState<ThemeColors>({});
  const [fonts, setFonts] = useState<ThemeFonts | null>(null);
  const [originalColors, setOriginalColors] = useState<ThemeColors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadThemeSettings();
  }, []);

  const loadThemeSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('theme_settings')
        .select('key, value')
        .in('key', ['colors', 'fonts']);

      if (error) throw error;

      const colorsData = data?.find(d => d.key === 'colors')?.value as ThemeColors;
      const fontsData = data?.find(d => d.key === 'fonts')?.value as ThemeFonts;

      if (colorsData) {
        setColors(colorsData);
        setOriginalColors(JSON.parse(JSON.stringify(colorsData)));
      }
      if (fontsData) {
        setFonts(fontsData);
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorChange = (colorName: string, variant: string, newValue: string) => {
    setColors(prev => ({
      ...prev,
      [colorName]: {
        ...prev[colorName],
        [variant]: newValue,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('theme_settings')
        .update({ value: colors })
        .eq('key', 'colors');

      if (error) throw error;

      setOriginalColors(JSON.parse(JSON.stringify(colors)));
      setHasChanges(false);

      await refreshTheme();

      alert('Theme saved successfully!');
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('Failed to save theme. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes?')) {
      setColors(JSON.parse(JSON.stringify(originalColors)));
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-8 flex items-center justify-center">
        <p className="text-text-secondary">Loading theme settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/settings')}
            className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-text-primary" />
          </button>
          <div>
            <H1 className="mb-2">Theme & Design</H1>
            <p className="text-text-secondary">Customize brand colors and typography</p>
          </div>
        </div>

        <div className="flex gap-3">
          {hasChanges && (
            <Button
              variant="secondary"
              onClick={handleReset}
              disabled={isSaving}
            >
              <RotateCcw size={18} />
              Reset Changes
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-white rounded-lg p-6 shadow-card">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Typography</h2>
          <p className="text-text-secondary text-sm mb-6">Font families used throughout the site</p>

          {fonts && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Heading Font</h3>
                <p className="text-sm text-text-secondary font-mono">{fonts.heading.family}</p>
                <p className="text-xs text-text-secondary mt-1">Weights: {fonts.heading.weights.join(', ')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Body Font</h3>
                <p className="text-sm text-text-secondary font-mono">{fonts.body.family}</p>
                <p className="text-xs text-text-secondary mt-1">Weights: {fonts.body.weights.join(', ')}</p>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-lg p-6 shadow-card">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Brand Colors</h2>
          <p className="text-text-secondary text-sm mb-6">Customize your brand color palette. Each color has variants from 50 (lightest) to 950 (darkest).</p>

          <div className="space-y-8">
            {Object.entries(colors).map(([colorName, variants]) => {
              const info = colorDescriptions[colorName];
              if (!info) return null;

              return (
                <div key={colorName} className="border-t border-background-secondary pt-6 first:border-t-0 first:pt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-text-primary mb-1">{info.name}</h3>
                    <p className="text-sm text-text-secondary mb-3">{info.description}</p>
                    <p className="text-xs text-text-secondary">
                      Base variant: <span className="font-mono font-medium">{info.base}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Object.entries(variants).map(([variant, hexValue]) => {
                      const isBase = variant === info.base;

                      return (
                        <div
                          key={variant}
                          className={`border rounded-lg overflow-hidden ${isBase ? 'ring-2 ring-brand-primary' : 'border-background-secondary'}`}
                        >
                          <div
                            className="h-20 w-full"
                            style={{ backgroundColor: hexValue }}
                          />
                          <div className="p-3 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-text-primary">
                                {variant}
                              </span>
                              {isBase && (
                                <span className="text-xs font-semibold text-brand-primary">
                                  BASE
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={hexValue}
                              onChange={(e) => handleColorChange(colorName, variant, e.target.value)}
                              className="w-full text-xs font-mono px-2 py-1 border border-background-secondary rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

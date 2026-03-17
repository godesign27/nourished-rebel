import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

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

interface ThemeContextType {
  colors: ThemeColors | null;
  fonts: ThemeFonts | null;
  isLoading: boolean;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<ThemeColors | null>(null);
  const [fonts, setFonts] = useState<ThemeFonts | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTheme = async () => {
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
        applyColorsToDOM(colorsData);
      }
      if (fontsData) {
        setFonts(fontsData);
        applyFontsToDOM(fontsData);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyColorsToDOM = (colorData: ThemeColors) => {
    const root = document.documentElement;

    Object.entries(colorData).forEach(([colorName, variants]) => {
      Object.entries(variants).forEach(([variant, hexValue]) => {
        root.style.setProperty(`--color-${colorName}-${variant}`, hexValue);
      });
    });
  };

  const applyFontsToDOM = (fontData: ThemeFonts) => {
    const root = document.documentElement;

    if (fontData.heading?.family) {
      root.style.setProperty('--font-heading', fontData.heading.family);
    }
    if (fontData.body?.family) {
      root.style.setProperty('--font-body', fontData.body.family);
    }
  };

  const refreshTheme = async () => {
    setIsLoading(true);
    await loadTheme();
  };

  useEffect(() => {
    loadTheme();

    const subscription = supabase
      .channel('theme_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'theme_settings',
        },
        () => {
          loadTheme();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ colors, fonts, isLoading, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

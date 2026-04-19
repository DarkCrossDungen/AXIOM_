import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof darkColors;
}

const darkColors = {
  bgPrimary: '#050507',
  bgSecondary: '#0a0a0d',
  bgTertiary: '#13131a',
  bgCanvas: '#08080a',
  border: '#1a1a24',
  borderHover: '#2a2a35',
  textPrimary: '#f0f0f5',
  textSecondary: '#a0a0b0',
  textMuted: '#666',
  accent: '#7928CA',
  accentCyan: '#00d2ff',
  accentGreen: '#27c93f',
  accentYellow: '#ffbd2e',
  accentRed: '#ff5f56',
  inputBg: '#0d0d12',
  inputBorder: '#222',
  cardBg: '#0a0a0d',
  slideBg: '#ffffff',
};

const lightColors = {
  bgPrimary: '#f5f5f7',
  bgSecondary: '#ffffff',
  bgTertiary: '#e8e8ed',
  bgCanvas: '#eaeaef',
  border: '#d1d1d6',
  borderHover: '#b0b0b8',
  textPrimary: '#1d1d1f',
  textSecondary: '#555',
  textMuted: '#888',
  accent: '#7928CA',
  accentCyan: '#0099cc',
  accentGreen: '#1a9f35',
  accentYellow: '#cc9500',
  accentRed: '#d93025',
  inputBg: '#ffffff',
  inputBorder: '#ccc',
  cardBg: '#ffffff',
  slideBg: '#ffffff',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  colors: darkColors,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('axiom_theme') as Theme) || 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('axiom_theme', next);
      return next;
    });
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

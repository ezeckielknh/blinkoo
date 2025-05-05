import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'darkTheme' | 'lightTheme';  // Update to match config keys
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<'darkTheme' | 'lightTheme'>('darkTheme'); // Update initial state

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'darkTheme' ? 'lightTheme' : 'darkTheme'));
  };

  useEffect(() => {
    console.log(`Current theme: ${theme}`);  // Log current theme
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`${theme === 'darkTheme' ? 'bg-darkTheme-background text-darkTheme-textLight' : 'bg-lightTheme-background text-lightTheme-textLight'}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
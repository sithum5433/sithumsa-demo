import { createContext, useContext, useState } from 'react';
import { translate } from '../utils/i18n.js';

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('sithumsa_lang');
      return saved === 'si' || saved === 'ta' ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = (next) => {
    const clean = next === 'si' || next === 'ta' ? next : 'en';
    setLangState(clean);
    try {
      localStorage.setItem('sithumsa_lang', clean);
    } catch {
      // Ignore storage quota errors
    }
  };

  const t = (key) => translate(lang, key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

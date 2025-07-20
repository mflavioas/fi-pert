import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  // Carrega as traduções de um backend (neste caso, a pasta /public/locales)
  .use(HttpApi)
  // Detecta o idioma do usuário
  .use(LanguageDetector)
  // Passa a instância do i18n para o react-i18next
  .use(initReactI18next)
  // Inicializa o i18next
  .init({
    // Idioma padrão caso a detecção falhe
    fallbackLng: 'pt-BR',
    debug: true, // Desative em produção
    interpolation: {
      escapeValue: false, // O React já protege contra XSS
    },
    // Opções para o backend (HttpApi)
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
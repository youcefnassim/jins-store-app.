import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

import fr from '../../messages/fr.json';
import ar from '../../messages/ar.json';
import en from '../../messages/en.json';

const messagesMap: Record<string, any> = {
  fr,
  ar,
  en,
};

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  return {
    locale,
    messages: messagesMap[locale] || fr,
  };
});

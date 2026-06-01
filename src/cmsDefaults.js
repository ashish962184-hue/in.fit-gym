import { INITIAL_PLANS, INITIAL_CLASSES, TRAINERS, GALLERY_ITEMS } from './data';

export const DEFAULT_PAGE_CONTENT = {
  heroTagline: '2 FLOORS A/C GYM • STRENGTH • CARDIO • FUNCTIONAL TRAINING',
  heroHeadingLine1: 'TRAIN HARD.',
  heroHeadingHighlight: '',
  heroHeadingLine2: 'TRANSFORM FASTER.',
  heroHeadingHighlight2: '',
  heroDescription: 'Professional equipment, certified trainers, and real fitness transformations.',
  heroBgUrl: '/hero-bg.png',
  heroCtaText: 'JOIN MEMBERSHIP',
  heroCtaLink: '#packages',
  heroMemberCount: 700,
  heroTrainerCount: 10,
  heroYearsExperience: 5,
  heroSatisfaction: 95,
  
  aboutTitle: '2 FLOORS A/C GYM & STRENGTH FLOOR',
  aboutDescription: 'Equipped with elite Real Leader USA plate-loaded strength machines and premium AC facilities. Train under certified expert coaches in Hyderabad\'s ultimate transformation center.',
  aboutMission: 'To provide absolute biomechanical lifting precision, elite conditioning layouts, and highly practical coaching structures that allow athletes of all levels to unlock unstoppable raw power safety.',
  aboutVision: 'To be the ultimate benchmark fitness and personal training brand in Hyderabad, fostering a hardcore community of serious athletes built on integrity and physical execution.',
  aboutImages: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCjr0WZYB2WIx9gR6BF1xHDKvgpcNQEWOGA5jp72grreuNi_5sDoOob994albOIdTtjPnWqrRdDt87SHr8XOt01A-l74VuSnUn7__DjlzXo1OOCbhAIyIUbvU9rpXX9VvC7oZnVA3R-QPBARDPtJQzHLurbp88UzrxZGbLn4XNntV-ujRhCFUZIXwSziGPgFly7En4dWUmhyZ8s-853MFzGBtfuIPYX0QlRoN_-L-oxsDyN3qbmEg_6nrl1zjZ8uxzp0Ecc3m3LdQM'
  ],
  
  contactPhone1: '99666 83776',
  contactPhone2: '83091 34004',
  contactWhatsapp: '9966683776',
  contactEmail: 'support@infitgym.in',
  contactAddress: 'NTPC X Road, Annojiguda, Pocharam Municipality',
  contactMapUrl: 'https://www.google.com/maps/dir/?api=1&destination=in.fit+GYM+Annojiguda+Hyderabad',
  contactHours: 'Mon - Sat: 5:00 AM - 10:00 PM, Sun: 6:00 AM - 12:00 PM',
  contactEmergency: '83091 34004',
  
  socialInstagram: 'https://www.instagram.com/infit_gym/',
  socialFacebook: 'https://www.facebook.com/infitgym/',
  socialYoutube: 'https://www.youtube.com/@infitgym',
  socialLinkedin: 'https://www.linkedin.com/company/infit-gym',
  
  seoMetaTitle: 'in.fit GYM | Hyderabad’s Elite 2-Floors AC Strength & Cardio Transformation Center',
  seoMetaDescription: 'Train with premier Real Leader USA plate-loaded machines, Olympic platforms, cardio decks, and certified personal trainers. Memberships start from ₹1299/mo.',
  seoKeywords: 'gym, hyderabad, strength training, personal trainer, plate loaded, fitness, crossfit, annojiguda',
  seoOgImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjr0WZYB2WIx9gR6BF1xHDKvgpcNQEWOGA5jp72grreuNi_5sDoOob994albOIdTtjPnWqrRdDt87SHr8XOt01A-l74VuSnUn7__DjlzXo1OOCbhAIyIUbvU9rpXX9VvC7oZnVA3R-QPBARDPtJQzHLurbp88UzrxZGbLn4XNntV-ujRhCFUZIXwSziGPgFly7En4dWUmhyZ8s-853MFzGBtfuIPYX0QlRoN_-L-oxsDyN3qbmEg_6nrl1zjZ8uxzp0Ecc3m3LdQM',
  seoGoogleAnalyticsId: 'G-XXXXXXXXXX'
};

// Pure client password structure logic check (Min 6 chars, containing a letter and numerical digit)
export function validatePasswordSecurity(password) {
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long.' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return { isValid: false, error: 'Password must contain at least one letter and one number.' };
  }
  return { isValid: true };
}

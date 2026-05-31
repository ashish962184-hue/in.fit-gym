import { INITIAL_PLANS, INITIAL_CLASSES, TRAINERS, GALLERY_ITEMS } from './data';

export const DEFAULT_PAGE_CONTENT = {
  heroTagline: '2 FLOORS A/C GYM | STRENGTH & CARDIO CENTER',
  heroHeadingLine1: 'WELCOME TO ',
  heroHeadingHighlight: 'IN.FIT GYM',
  heroHeadingLine2: 'BUILT FOR ',
  heroHeadingHighlight2: 'MASTER PHYSICAL TRANSFORMATIONS',
  heroDescription: 'Hyderabad’s premier strength sanctuary at NTPC X Road. Engineered with professional Real Leader USA plate-loaded biomechanic cages, centralized temperature-regulated AC floors, and certified expert coaches committed to your power.',
  heroBgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjr0WZYB2WIx9gR6BF1xHDKvgpcNQEWOGA5jp72grreuNi_5sDoOob994albOIdTtjPnWqrRdDt87SHr8XOt01A-l74VuSnUn7__DjlzXo1OOCbhAIyIUbvU9rpXX9VvC7oZnVA3R-QPBARDPtJQzHLurbp88UzrxZGbLn4XNntV-ujRhCFUZIXwSziGPgFly7En4dWUmhyZ8s-853MFzGBtfuIPYX0QlRoN_-L-oxsDyN3qbmEg_6nrl1zjZ8uxzp0Ecc3m3LdQM',
  heroCtaText: 'JOIN MEMBERSHIP',
  heroCtaLink: '#packages',
  heroMemberCount: 700,
  heroTrainerCount: 10,
  heroYearsExperience: 5,
  heroSatisfaction: 95,
  
  aboutTitle: 'WELCOME TO IN.FIT GYM',
  aboutDescription: 'At IN.FIT GYM, we deliver real, hardcore physical transformation programs. Spanning two fully air-conditioned levels, our facility is engineered with precision plate-loaded cages, customized compound lifting decks, and dedicated coaches ready to guide you to peak performance.',
  aboutMission: 'To provide absolute biomechanical lifting precision, elite conditioning layouts, and highly practical coaching structures that allow athletes of all levels to unlock unstoppable raw power safety.',
  aboutVision: 'To be the ultimate benchmark fitness and personal training brand in Hyderabad, fostering a hardcore community of serious athletes built on integrity and physical execution.',
  aboutImages: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCjr0WZYB2WIx9gR6BF1xHDKvgpcNQEWOGA5jp72grreuNi_5sDoOob994albOIdTtjPnWqrRdDt87SHr8XOt01A-l74VuSnUn7__DjlzXo1OOCbhAIyIUbvU9rpXX9VvC7oZnVA3R-QPBARDPtJQzHLurbp88UzrxZGbLn4XNntV-ujRhCFUZIXwSziGPgFly7En4dWUmhyZ8s-853MFzGBtfuIPYX0QlRoN_-L-oxsDyN3qbmEg_6nrl1zjZ8uxzp0Ecc3m3LdQM'
  ],
  
  contactPhone1: '99666 83776',
  contactPhone2: '83091 34004',
  contactWhatsapp: '9966683776',
  contactEmail: 'support@infitgym.in',
  contactAddress: 'NTPC X Road, Annojiguda, Hyderabad',
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

// Get/Set CMS Layout copy settings (safely stored locally for quick visual rendering)
export function getStoredPageContent() {
  const saved = localStorage.getItem('infit_cms_text');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Merge with default page content to ensure newly added keys are present
      return { ...DEFAULT_PAGE_CONTENT, ...parsed };
    } catch {
      return DEFAULT_PAGE_CONTENT;
    }
  }
  return DEFAULT_PAGE_CONTENT;
}

export function saveStoredPageContent(content) {
  localStorage.setItem('infit_cms_text', JSON.stringify(content));
}

export function getStoredPlans() {
  const saved = localStorage.getItem('infit_cms_plans');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_PLANS;
    }
  }
  return INITIAL_PLANS;
}

export function saveStoredPlans(plans) {
  localStorage.setItem('infit_cms_plans', JSON.stringify(plans));
}

export function getStoredClasses() {
  const saved = localStorage.getItem('infit_cms_classes');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_CLASSES;
    }
  }
  return INITIAL_CLASSES;
}

export function saveStoredClasses(classes) {
  localStorage.setItem('infit_cms_classes', JSON.stringify(classes));
}

export function getStoredTrainers() {
  const saved = localStorage.getItem('infit_cms_trainers');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return TRAINERS;
    }
  }
  return TRAINERS;
}

export function saveStoredTrainers(trainers) {
  localStorage.setItem('infit_cms_trainers', JSON.stringify(trainers));
}

export function getStoredGallery() {
  const saved = localStorage.getItem('infit_cms_gallery');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return GALLERY_ITEMS;
    }
  }
  return GALLERY_ITEMS;
}

export function saveStoredGallery(items) {
  localStorage.setItem('infit_cms_gallery', JSON.stringify(items));
}

export function getStoredAdminPasskey() {
  const saved = localStorage.getItem('infit_admin_passkey');
  return saved || 'admin123';
}

export function saveStoredAdminPasskey(passkey) {
  localStorage.setItem('infit_admin_passkey', passkey);
}

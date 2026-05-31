import { INITIAL_PLANS, INITIAL_CLASSES, TRAINERS, GALLERY_ITEMS } from './data';

export const DEFAULT_PAGE_CONTENT = {
  heroTagline: 'LIMITED ACCESS SPECIALLY PRICED ENROLLMENT ACTIVE',
  heroHeadingLine1: 'BUILT FOR ',
  heroHeadingHighlight: 'UNSTOPPABLE STRENGTH',
  heroHeadingLine2: 'ENGINEERED FOR ',
  heroHeadingHighlight2: 'REAL CHROMIUM RESULTS',
  heroDescription: 'Join Hyderabad’s elite training sanctuary at NTPC X Road. Powered by premier Real Leader USA biomechanic cages, high-oxygen temperature-regulated AC floors, and certified pro coaches committed to your athletic mastery.',
  facilityTitlePrefix: 'architectural ',
  facilityTitleHighlight: 'powerhouse',
  facilityTitleSuffix: '',
  facilityDescription: 'BUILT TO CONQUER ATHLETIC GOALS',
  testimonialQuote: 'Joining in.fit was a total game-changer for my fitness. The heavy plate-loaded biomechanic equipment, amazing ventilation, and helpful coach support pushed my absolute lifts by a milestone while keeping my joint health perfect.',
  testimonialAuthor: 'AMIT K., VERIFIED ATHLETE',
  testimonialCategory: 'ANNUAL ELITE MEMBERSHIP'
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
      return JSON.parse(saved);
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

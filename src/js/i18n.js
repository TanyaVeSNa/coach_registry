/**
 * ICF Registry — Internationalization Module
 *
 * Manages UI translations for EN, RU, EL.
 * Coach content (names, bios, tags) is NOT translated — displayed as-is.
 *
 * Usage:
 *   import { t, setLanguage, getCurrentLanguage } from './i18n.js';
 *   const label = t('filterSpecialization');
 *   setLanguage('ru');
 */

const STORAGE_KEY = 'icf-lang';
const SUPPORTED_LANGS = ['en', 'ru', 'el'];
const DEFAULT_LANG = 'en';

/** @type {Record<string, Record<string, string>>} */
const dictionary = {
  // Page
  pageTitle: {
    en: 'Find a Coach',
    ru: 'Найти коуча',
    el: 'Βρείτε Coach',
  },
  pageTitleHighlight: {
    en: 'ICF Cyprus',
    ru: 'ICF Cyprus',
    el: 'ICF Cyprus',
  },
  regPageTitle: {
    en: 'Coach Registration',
    ru: 'Регистрация коуча',
    el: 'Εγγραφή Coach',
  },
  regPageTitleHighlight: {
    en: 'ICF Cyprus',
    ru: 'ICF Cyprus',
    el: 'ICF Cyprus',
  },

  // Filter labels
  filterSpecialization: {
    en: 'Specialization',
    ru: 'Специализация',
    el: 'Ειδίκευση',
  },
  filterLanguage: {
    en: 'Language',
    ru: 'Язык',
    el: 'Γλώσσα',
  },
  filterFormat: {
    en: 'Format',
    ru: 'Формат',
    el: 'Μορφή',
  },
  filterLevel: {
    en: 'ICF Level',
    ru: 'Уровень ICF',
    el: 'Επίπεδο ICF',
  },
  filterPrice: {
    en: 'Session Price',
    ru: 'Цена сессии',
    el: 'Τιμή Συνεδρίας',
  },

  // Filter options — Format
  formatOnline: {
    en: 'Online',
    ru: 'Онлайн',
    el: 'Online',
  },
  formatOffline: {
    en: 'Offline (Cyprus)',
    ru: 'Офлайн (Кипр)',
    el: 'Δια ζώσης (Κύπρος)',
  },
  formatBoth: {
    en: 'Online + Offline',
    ru: 'Онлайн + Офлайн',
    el: 'Online + Δια ζώσης',
  },

  // Filter options — Specialization
  specLeadership: {
    en: 'Leadership',
    ru: 'Лидерство',
    el: 'Ηγεσία',
  },
  specBusiness: {
    en: 'Business',
    ru: 'Бизнес',
    el: 'Επιχείρηση',
  },
  specLife: {
    en: 'Life',
    ru: 'Жизненные цели',
    el: 'Ζωή',
  },
  specCareer: {
    en: 'Career',
    ru: 'Карьера',
    el: 'Καριέρα',
  },
  specRelationships: {
    en: 'Relationships',
    ru: 'Отношения',
    el: 'Σχέσεις',
  },
  specExecutive: {
    en: 'Executive',
    ru: 'Executive',
    el: 'Executive',
  },
  specHealth: {
    en: 'Health',
    ru: 'Здоровье',
    el: 'Υγεία',
  },
  specTeam: {
    en: 'Team',
    ru: 'Команда',
    el: 'Ομάδα',
  },

  // Contact
  contactWhatsApp: {
    en: 'WhatsApp',
    ru: 'WhatsApp',
    el: 'WhatsApp',
  },
  contactTelegram: {
    en: 'Telegram',
    ru: 'Telegram',
    el: 'Telegram',
  },
  contactEmail: {
    en: 'Email',
    ru: 'Email',
    el: 'Email',
  },
  contactLabel: {
    en: 'Contact:',
    ru: 'Связаться:',
    el: 'Επικοινωνία:',
  },
  contactMessage: {
    en: 'Hello, {name}! I found you in the ICF Cyprus coach registry and would like to learn about coaching sessions. I look forward to discussing details.',
    ru: 'Здравствуйте, {name}! Нашёл(а) вас в реестре коучей ICF Cyprus и хотел(а) бы узнать о возможности коучинговых сессий. Буду рад(а) обсудить детали.',
    el: 'Γεια σας, {name}! Σας βρήκα στο μητρώο coaches ICF Cyprus και θα ήθελα να μάθω για τις δυνατότητες coaching. Ανυπομονώ να συζητήσουμε.',
  },
  contactSubject: {
    en: 'Coaching inquiry from ICF Cyprus registry',
    ru: 'Запрос о коучинге из реестра ICF Cyprus',
    el: 'Ερώτημα coaching από το μητρώο ICF Cyprus',
  },
  socialsLabel: {
    en: 'Profiles:',
    ru: 'Профили:',
    el: 'Προφίλ:',
  },
  readMore: {
    en: 'Read more',
    ru: 'Подробнее',
    el: 'Περισσότερα',
  },
  closeModal: {
    en: 'Close',
    ru: 'Закрыть',
    el: 'Κλείσιμο',
  },

  // Meta
  metaPerSession: {
    en: '/ session',
    ru: '/ сессия',
    el: '/ συνεδρία',
  },
  metaPriceOnRequest: {
    en: 'On request',
    ru: 'По запросу',
    el: 'Κατόπιν αιτήματος',
  },

  // States
  loading: {
    en: 'Loading coaches...',
    ru: 'Загружаем коучей...',
    el: 'Φόρτωση coaches...',
  },
  emptyState: {
    en: 'No coaches found matching your filters.',
    ru: 'Коучи по выбранным фильтрам не найдены.',
    el: 'Δεν βρέθηκαν coaches με τα επιλεγμένα φίλτρα.',
  },
  errorState: {
    en: 'Failed to load coach data. Please try again later.',
    ru: 'Не удалось загрузить данные. Попробуйте позже.',
    el: 'Αποτυχία φόρτωσης. Δοκιμάστε αργότερα.',
  },

  // AI button (Phase 2)
  aiButtonTitle: {
    en: 'Find a coach with AI',
    ru: 'Подобрать коуча с помощью AI',
    el: 'Βρείτε coach με AI',
  },
  aiButtonSubtitle: {
    en: '— 3-5 questions and we will find the right match',
    ru: '— 3–5 вопросов, и мы найдём подходящего',
    el: '— 3-5 ερωτήσεις και θα βρούμε τον κατάλληλο',
  },

  // Language names (for language filter chips)
  langRussian: {
    en: 'Russian',
    ru: 'Русский',
    el: 'Ρωσικά',
  },
  langEnglish: {
    en: 'English',
    ru: 'Английский',
    el: 'Αγγλικά',
  },
  langGreek: {
    en: 'Greek',
    ru: 'Греческий',
    el: 'Ελληνικά',
  },
  langGerman: {
    en: 'German',
    ru: 'Немецкий',
    el: 'Γερμανικά',
  },

  // Filter actions
  filterClearAll: {
    en: 'Clear all',
    ru: 'Сбросить все',
    el: 'Καθαρισμός',
  },

  // Results count (placeholders: {shown}, {total})
  resultsCount: {
    en: 'Showing {shown} of {total} coaches',
    ru: 'Показано {shown} из {total} коучей',
    el: 'Εμφάνιση {shown} από {total} coaches',
  },

  // Price range labels
  priceUnder50: {
    en: '< 3000\u20bd',
    ru: '< 3000\u20bd',
    el: '< 3000\u20bd',
  },
  price50to100: {
    en: '3000\u201310000\u20bd',
    ru: '3000\u201310000\u20bd',
    el: '3000\u201310000\u20bd',
  },
  price100to150: {
    en: '10000\u201320000\u20bd',
    ru: '10000\u201320000\u20bd',
    el: '10000\u201320000\u20bd',
  },
  priceOver150: {
    en: '20000\u20bd+',
    ru: '20000\u20bd+',
    el: '20000\u20bd+',
  },

  // =========================================================
  // Registration Form
  // =========================================================

  // Section titles
  regSectionPersonal: {
    en: 'Personal Info',
    ru: '\u041B\u0438\u0447\u043D\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F',
    el: '\u03A0\u03C1\u03BF\u03C3\u03C9\u03C0\u03B9\u03BA\u03AC \u03C3\u03C4\u03BF\u03B9\u03C7\u03B5\u03AF\u03B1',
  },
  regSectionProfessional: {
    en: 'Professional Info',
    ru: '\u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F',
    el: '\u0395\u03C0\u03B1\u03B3\u03B3\u03B5\u03BB\u03BC\u03B1\u03C4\u03B9\u03BA\u03AC \u03C3\u03C4\u03BF\u03B9\u03C7\u03B5\u03AF\u03B1',
  },
  regSectionPricing: {
    en: 'Pricing',
    ru: '\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C',
    el: '\u03A4\u03B9\u03BC\u03BF\u03BB\u03CC\u03B3\u03B7\u03C3\u03B7',
  },
  regSectionAbout: {
    en: 'About You',
    ru: '\u041E \u0432\u0430\u0441',
    el: '\u03A3\u03C7\u03B5\u03C4\u03B9\u03BA\u03AC \u03BC\u03B5 \u03B5\u03C3\u03AC\u03C2',
  },
  regSectionContact: {
    en: 'Contact Details',
    ru: '\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435',
    el: '\u03A3\u03C4\u03BF\u03B9\u03C7\u03B5\u03AF\u03B1 \u03B5\u03C0\u03B9\u03BA\u03BF\u03B9\u03BD\u03C9\u03BD\u03AF\u03B1\u03C2',
  },
  regSectionSocial: {
    en: 'Social Media',
    ru: '\u0421\u043E\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u0435\u0442\u0438',
    el: '\u039A\u03BF\u03B9\u03BD\u03C9\u03BD\u03B9\u03BA\u03AC \u03B4\u03AF\u03BA\u03C4\u03C5\u03B1',
  },
  regSectionIcf: {
    en: 'ICF Verification',
    ru: '\u0412\u0435\u0440\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F ICF',
    el: '\u0395\u03C0\u03B1\u03BB\u03AE\u03B8\u03B5\u03C5\u03C3\u03B7 ICF',
  },

  // Field labels
  regLabelName: {
    en: 'Name',
    ru: '\u0418\u043C\u044F',
    el: '\u038C\u03BD\u03BF\u03BC\u03B1',
  },
  regLabelPhoto: {
    en: 'Photo',
    ru: '\u0424\u043E\u0442\u043E',
    el: '\u03A6\u03C9\u03C4\u03BF\u03B3\u03C1\u03B1\u03C6\u03AF\u03B1',
  },
  regLabelSpecializations: {
    en: 'Specializations',
    ru: '\u0421\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438',
    el: '\u0395\u03B9\u03B4\u03B9\u03BA\u03B5\u03CD\u03C3\u03B5\u03B9\u03C2',
  },
  regLabelIcfLevel: {
    en: 'ICF Level',
    ru: '\u0423\u0440\u043E\u0432\u0435\u043D\u044C ICF',
    el: '\u0395\u03C0\u03AF\u03C0\u03B5\u03B4\u03BF ICF',
  },
  regLabelLanguages: {
    en: 'Languages',
    ru: '\u042F\u0437\u044B\u043A\u0438',
    el: '\u0393\u03BB\u03CE\u03C3\u03C3\u03B5\u03C2',
  },
  regLabelFormat: {
    en: 'Format',
    ru: '\u0424\u043E\u0440\u043C\u0430\u0442',
    el: '\u039C\u03BF\u03C1\u03C6\u03AE',
  },
  regLabelPriceMin: {
    en: 'Price Min (\u20bd)',
    ru: '\u0426\u0435\u043D\u0430 \u043E\u0442 (\u20bd)',
    el: '\u0395\u03BB\u03AC\u03C7\u03B9\u03C3\u03C4\u03B7 \u03C4\u03B9\u03BC\u03AE (\u20bd)',
  },
  regLabelPriceMax: {
    en: 'Price Max (\u20bd)',
    ru: '\u0426\u0435\u043D\u0430 \u0434\u043E (\u20bd)',
    el: '\u039C\u03AD\u03B3\u03B9\u03C3\u03C4\u03B7 \u03C4\u03B9\u03BC\u03AE (\u20bd)',
  },
  regLabelPriceByRequest: {
    en: 'By request',
    ru: '\u041F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443',
    el: '\u039A\u03B1\u03C4\u03CC\u03C0\u03B9\u03BD \u03B1\u03B9\u03C4\u03AE\u03BC\u03B1\u03C4\u03BF\u03C2',
  },
  regLabelBio: {
    en: 'Bio',
    ru: '\u041E \u0441\u0435\u0431\u0435',
    el: '\u0392\u03B9\u03BF\u03B3\u03C1\u03B1\u03C6\u03B9\u03BA\u03CC',
  },
  regLabelBio1Lang: {
    en: 'Bio language',
    ru: '\u042F\u0437\u044B\u043A \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F',
    el: '\u0393\u03BB\u03CE\u03C3\u03C3\u03B1 \u03B2\u03B9\u03BF\u03B3\u03C1\u03B1\u03C6\u03B9\u03BA\u03BF\u03CD',
  },
  regLabelBio2Lang: {
    en: 'Additional language (optional)',
    ru: 'Дополнительный язык (необязательно)',
    el: 'Επιπλέον γλώσσα (προαιρετικά)',
  },
  regLabelBio2: {
    en: 'About yourself (additional language)',
    ru: 'О себе (дополнительный язык)',
    el: 'Σχετικά με εσάς (επιπλέον γλώσσα)',
  },
  regBioLangEN: {
    en: 'English',
    ru: 'English',
    el: 'English',
  },
  regBioLangRU: {
    en: 'Russian',
    ru: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439',
    el: '\u03A1\u03C9\u03C3\u03B9\u03BA\u03AC',
  },
  regBioLangEL: {
    en: 'Greek',
    ru: '\u0413\u0440\u0435\u0447\u0435\u0441\u043A\u0438\u0439',
    el: '\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC',
  },
  regPlaceholderBio1: {
    en: 'Write about yourself in the selected language...',
    ru: '\u0420\u0430\u0441\u0441\u043A\u0430\u0436\u0438\u0442\u0435 \u043E \u0441\u0435\u0431\u0435 \u043D\u0430 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C \u044F\u0437\u044B\u043A\u0435...',
    el: '\u0393\u03C1\u03AC\u03C8\u03C4\u03B5 \u03B3\u03B9\u03B1 \u03B5\u03C3\u03AC\u03C2 \u03C3\u03C4\u03B7\u03BD \u03B5\u03C0\u03B9\u03BB\u03B5\u03B3\u03BC\u03AD\u03BD\u03B7 \u03B3\u03BB\u03CE\u03C3\u03C3\u03B1...',
  },
  regLabelEmail: {
    en: 'Email',
    ru: 'Email',
    el: 'Email',
  },
  regLabelWhatsApp: {
    en: 'WhatsApp',
    ru: 'WhatsApp',
    el: 'WhatsApp',
  },
  regLabelTelegram: {
    en: 'Telegram',
    ru: 'Telegram',
    el: 'Telegram',
  },
  regLabelInstagram: {
    en: 'Instagram',
    ru: 'Instagram',
    el: 'Instagram',
  },
  regLabelLinkedIn: {
    en: 'LinkedIn',
    ru: 'LinkedIn',
    el: 'LinkedIn',
  },
  regLabelFacebook: {
    en: 'Facebook',
    ru: 'Facebook',
    el: 'Facebook',
  },
  regLabelIcfMembership: {
    en: 'ICF Membership',
    ru: '\u0427\u043B\u0435\u043D\u0441\u0442\u0432\u043E ICF',
    el: '\u039C\u03AD\u03BB\u03BF\u03C2 ICF',
  },

  // Placeholders
  regPlaceholderName: {
    en: 'Your full name',
    ru: '\u0412\u0430\u0448\u0435 \u043F\u043E\u043B\u043D\u043E\u0435 \u0438\u043C\u044F',
    el: '\u03A4\u03BF \u03C0\u03BB\u03AE\u03C1\u03B5\u03C2 \u03CC\u03BD\u03BF\u03BC\u03AC \u03C3\u03B1\u03C2',
  },
  regPlaceholderPhoto: {
    en: 'JPEG, PNG or WebP, max 5 MB',
    ru: 'JPEG, PNG или WebP, макс. 5 МБ',
    el: 'JPEG, PNG ή WebP, μέγ. 5 MB',
  },
  regPlaceholderBio: {
    en: 'Tell potential clients about yourself, your experience, and approach...',
    ru: '\u0420\u0430\u0441\u0441\u043A\u0430\u0436\u0438\u0442\u0435 \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u043C \u043A\u043B\u0438\u0435\u043D\u0442\u0430\u043C \u043E \u0441\u0435\u0431\u0435, \u0441\u0432\u043E\u0451\u043C \u043E\u043F\u044B\u0442\u0435 \u0438 \u043F\u043E\u0434\u0445\u043E\u0434\u0435...',
    el: '\u03A0\u03B5\u03AF\u03C4\u03B5 \u03C3\u03C4\u03BF\u03C5\u03C2 \u03C0\u03B9\u03B8\u03B1\u03BD\u03BF\u03CD\u03C2 \u03C0\u03B5\u03BB\u03AC\u03C4\u03B5\u03C2 \u03B3\u03B9\u03B1 \u03B5\u03C3\u03AC\u03C2, \u03C4\u03B7\u03BD \u03B5\u03BC\u03C0\u03B5\u03B9\u03C1\u03AF\u03B1 \u03BA\u03B1\u03B9 \u03C4\u03B7\u03BD \u03C0\u03C1\u03BF\u03C3\u03AD\u03B3\u03B3\u03B9\u03C3\u03AE \u03C3\u03B1\u03C2...',
  },
  regPlaceholderEmail: {
    en: 'your@email.com',
    ru: 'your@email.com',
    el: 'your@email.com',
  },
  regPlaceholderWhatsApp: {
    en: '+357...',
    ru: '+357...',
    el: '+357...',
  },
  regPlaceholderTelegram: {
    en: '@username',
    ru: '@username',
    el: '@username',
  },
  regPlaceholderInstagram: {
    en: '@handle or URL',
    ru: '@handle \u0438\u043B\u0438 URL',
    el: '@handle \u03AE URL',
  },
  regPlaceholderLinkedIn: {
    en: 'Profile URL',
    ru: '\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u043F\u0440\u043E\u0444\u0438\u043B\u044C',
    el: 'URL \u03C0\u03C1\u03BF\u03C6\u03AF\u03BB',
  },
  regPlaceholderFacebook: {
    en: 'Profile URL',
    ru: '\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u043F\u0440\u043E\u0444\u0438\u043B\u044C',
    el: 'URL \u03C0\u03C1\u03BF\u03C6\u03AF\u03BB',
  },
  regPlaceholderIcfMembership: {
    en: 'Membership number or email',
    ru: '\u041D\u043E\u043C\u0435\u0440 \u0447\u043B\u0435\u043D\u0441\u0442\u0432\u0430 \u0438\u043B\u0438 email',
    el: '\u0391\u03C1\u03B9\u03B8\u03BC\u03CC\u03C2 \u03BC\u03AD\u03BB\u03BF\u03C5\u03C2 \u03AE email',
  },

  // Photo helper text
  regPhotoHelp: {
    en: 'JPEG, PNG or WebP, max 5 MB',
    ru: 'JPEG, PNG \u0438\u043B\u0438 WebP, \u043C\u0430\u043A\u0441. 5 \u041C\u0411',
    el: 'JPEG, PNG \u03AE WebP, \u03BC\u03AD\u03B3. 5 MB',
  },
  regPhotoSelect: {
    en: 'Choose photo',
    ru: '\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u0444\u043E\u0442\u043E',
    el: '\u0395\u03C0\u03B9\u03BB\u03AD\u03BE\u03C4\u03B5 \u03C6\u03C9\u03C4\u03BF\u03B3\u03C1\u03B1\u03C6\u03AF\u03B1',
  },
  regPhotoChange: {
    en: 'Change photo',
    ru: '\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0444\u043E\u0442\u043E',
    el: '\u0391\u03BB\u03BB\u03B1\u03B3\u03AE \u03C6\u03C9\u03C4\u03BF\u03B3\u03C1\u03B1\u03C6\u03AF\u03B1\u03C2',
  },
  regErrorPhotoSize: {
    en: 'Photo must be under 5 MB',
    ru: '\u0424\u043E\u0442\u043E \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043C\u0435\u043D\u0435\u0435 5 \u041C\u0411',
    el: '\u0397 \u03C6\u03C9\u03C4\u03BF\u03B3\u03C1\u03B1\u03C6\u03AF\u03B1 \u03C0\u03C1\u03AD\u03C0\u03B5\u03B9 \u03BD\u03B1 \u03B5\u03AF\u03BD\u03B1\u03B9 \u03BA\u03AC\u03C4\u03C9 \u03B1\u03C0\u03CC 5 MB',
  },
  regErrorPhotoType: {
    en: 'Please upload JPEG, PNG or WebP',
    ru: '\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 JPEG, PNG \u0438\u043B\u0438 WebP',
    el: '\u03A0\u03B1\u03C1\u03B1\u03BA\u03B1\u03BB\u03CE \u03B1\u03BD\u03B5\u03B2\u03AC\u03C3\u03C4\u03B5 JPEG, PNG \u03AE WebP',
  },

  // Validation errors
  regErrorRequired: {
    en: 'This field is required',
    ru: '\u042D\u0442\u043E \u043F\u043E\u043B\u0435 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E',
    el: '\u0391\u03C5\u03C4\u03CC \u03C4\u03BF \u03C0\u03B5\u03B4\u03AF\u03BF \u03B5\u03AF\u03BD\u03B1\u03B9 \u03C5\u03C0\u03BF\u03C7\u03C1\u03B5\u03C9\u03C4\u03B9\u03BA\u03CC',
  },
  regErrorEmail: {
    en: 'Please enter a valid email address',
    ru: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 email',
    el: '\u0395\u03B9\u03C3\u03AC\u03B3\u03B5\u03C4\u03B5 \u03BC\u03B9\u03B1 \u03AD\u03B3\u03BA\u03C5\u03C1\u03B7 \u03B4\u03B9\u03B5\u03CD\u03B8\u03C5\u03BD\u03C3\u03B7 email',
  },
  regErrorUrl: {
    en: 'Please enter a valid URL (https://...)',
    ru: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 URL (https://...)',
    el: '\u0395\u03B9\u03C3\u03AC\u03B3\u03B5\u03C4\u03B5 \u03AD\u03B3\u03BA\u03C5\u03C1\u03BF URL (https://...)',
  },
  regErrorSelectOne: {
    en: 'Please select at least one option',
    ru: '\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0445\u043E\u0442\u044F \u0431\u044B \u043E\u0434\u0438\u043D \u0432\u0430\u0440\u0438\u0430\u043D\u0442',
    el: '\u0395\u03C0\u03B9\u03BB\u03AD\u03BE\u03C4\u03B5 \u03C4\u03BF\u03C5\u03BB\u03AC\u03C7\u03B9\u03C3\u03C4\u03BF\u03BD \u03BC\u03AF\u03B1 \u03B5\u03C0\u03B9\u03BB\u03BF\u03B3\u03AE',
  },
  regErrorBioTooLong: {
    en: 'Bio must be 300 words or fewer',
    ru: '\u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C 300 \u0441\u043B\u043E\u0432',
    el: '\u039C\u03AD\u03B3\u03B9\u03C3\u03C4\u03BF 300 \u03BB\u03AD\u03BE\u03B5\u03B9\u03C2',
  },

  // Word counter (placeholder: {count}, {max})
  regWordCount: {
    en: '{count} of {max} words',
    ru: '{count} \u0438\u0437 {max} \u0441\u043B\u043E\u0432',
    el: '{count} \u03B1\u03C0\u03CC {max} \u03BB\u03AD\u03BE\u03B5\u03B9\u03C2',
  },

  // Specialization options
  regSpecCareer: {
    en: 'Career',
    ru: '\u041A\u0430\u0440\u044C\u0435\u0440\u0430',
    el: '\u039A\u03B1\u03C1\u03B9\u03AD\u03C1\u03B1',
  },
  regSpecLeadership: {
    en: 'Leadership',
    ru: '\u041B\u0438\u0434\u0435\u0440\u0441\u0442\u0432\u043E',
    el: '\u0397\u03B3\u03B5\u03C3\u03AF\u03B1',
  },
  regSpecLife: {
    en: 'Life Goals',
    ru: '\u0416\u0438\u0437\u043D\u0435\u043D\u043D\u044B\u0435 \u0446\u0435\u043B\u0438',
    el: '\u0396\u03C9\u03AE',
  },
  regSpecBusiness: {
    en: 'Business',
    ru: '\u0411\u0438\u0437\u043D\u0435\u0441',
    el: '\u0395\u03C0\u03B9\u03C7\u03B5\u03AF\u03C1\u03B7\u03C3\u03B7',
  },
  regSpecRelationships: {
    en: 'Relationships',
    ru: '\u041E\u0442\u043D\u043E\u0448\u0435\u043D\u0438\u044F',
    el: '\u03A3\u03C7\u03AD\u03C3\u03B5\u03B9\u03C2',
  },
  regSpecHealth: {
    en: 'Health',
    ru: '\u0417\u0434\u043E\u0440\u043E\u0432\u044C\u0435',
    el: '\u03A5\u03B3\u03B5\u03AF\u03B1',
  },
  regSpecTeam: {
    en: 'Team',
    ru: '\u041A\u043E\u043C\u0430\u043D\u0434\u0430',
    el: '\u039F\u03BC\u03AC\u03B4\u03B1',
  },
  regSpecExecutive: {
    en: 'Executive',
    ru: 'Executive',
    el: 'Executive',
  },

  // Language options
  regLangEnglish: {
    en: 'English',
    ru: 'English',
    el: '\u0391\u03B3\u03B3\u03BB\u03B9\u03BA\u03AC',
  },
  regLangRussian: {
    en: 'Russian',
    ru: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439',
    el: '\u03A1\u03C9\u03C3\u03B9\u03BA\u03AC',
  },
  regLangGreek: {
    en: 'Greek',
    ru: '\u0413\u0440\u0435\u0447\u0435\u0441\u043A\u0438\u0439',
    el: '\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC',
  },
  regLangGerman: {
    en: 'German',
    ru: '\u041D\u0435\u043C\u0435\u0446\u043A\u0438\u0439',
    el: '\u0393\u03B5\u03C1\u03BC\u03B1\u03BD\u03B9\u03BA\u03AC',
  },
  regLangFrench: {
    en: 'French',
    ru: '\u0424\u0440\u0430\u043D\u0446\u0443\u0437\u0441\u043A\u0438\u0439',
    el: '\u0393\u03B1\u03BB\u03BB\u03B9\u03BA\u03AC',
  },
  regLangArabic: {
    en: 'Arabic',
    ru: '\u0410\u0440\u0430\u0431\u0441\u043A\u0438\u0439',
    el: '\u0391\u03C1\u03B1\u03B2\u03B9\u03BA\u03AC',
  },
  regLangHebrew: {
    en: 'Hebrew',
    ru: '\u0418\u0432\u0440\u0438\u0442',
    el: '\u0395\u03B2\u03C1\u03B1\u03CA\u03BA\u03AC',
  },
  regLangUkrainian: {
    en: 'Ukrainian',
    ru: '\u0423\u043A\u0440\u0430\u0438\u043D\u0441\u043A\u0438\u0439',
    el: '\u039F\u03C5\u03BA\u03C1\u03B1\u03BD\u03B9\u03BA\u03AC',
  },
  regLangOther: {
    en: 'Other',
    ru: '\u0414\u0440\u0443\u0433\u043E\u0439',
    el: '\u0386\u03BB\u03BB\u03BF',
  },

  // Format options
  regFormatOnline: {
    en: 'Online',
    ru: '\u041E\u043D\u043B\u0430\u0439\u043D',
    el: 'Online',
  },
  regFormatOffline: {
    en: 'Offline',
    ru: '\u041E\u0444\u043B\u0430\u0439\u043D',
    el: '\u0394\u03B9\u03B1 \u03B6\u03CE\u03C3\u03B7\u03C2',
  },
  regFormatBoth: {
    en: 'Both',
    ru: '\u041E\u0431\u0430',
    el: '\u039A\u03B1\u03B9 \u03C4\u03B1 \u03B4\u03CD\u03BF',
  },

  // ICF Level options
  regLevelACC: {
    en: 'ACC (Associate Certified Coach)',
    ru: 'ACC (Associate Certified Coach)',
    el: 'ACC (Associate Certified Coach)',
  },
  regLevelPCC: {
    en: 'PCC (Professional Certified Coach)',
    ru: 'PCC (Professional Certified Coach)',
    el: 'PCC (Professional Certified Coach)',
  },
  regLevelMCC: {
    en: 'MCC (Master Certified Coach)',
    ru: 'MCC (Master Certified Coach)',
    el: 'MCC (Master Certified Coach)',
  },
  regLevelMember: {
    en: 'ICF Member (no credential yet)',
    ru: 'ICF Member (\u0431\u0435\u0437 \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438)',
    el: 'ICF Member (\u03C7\u03C9\u03C1\u03AF\u03C2 \u03C0\u03B9\u03C3\u03C4\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7)',
  },

  // Submit button
  regSubmit: {
    en: 'Submit for Review',
    ru: '\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u043D\u0430 \u0440\u0430\u0441\u0441\u043C\u043E\u0442\u0440\u0435\u043D\u0438\u0435',
    el: '\u03A5\u03C0\u03BF\u03B2\u03BF\u03BB\u03AE \u03B3\u03B9\u03B1 \u03AD\u03BB\u03B5\u03B3\u03C7\u03BF',
  },
  regSubmitting: {
    en: 'Submitting...',
    ru: '\u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430...',
    el: '\u03A5\u03C0\u03BF\u03B2\u03BF\u03BB\u03AE...',
  },

  // Success / error messages
  regSuccess: {
    en: 'Your profile has been submitted! The ICF Cyprus administrator will review it and you\u2019ll receive a confirmation by email.',
    ru: '\u0412\u0430\u0448 \u043F\u0440\u043E\u0444\u0438\u043B\u044C \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D! \u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 ICF Cyprus \u0440\u0430\u0441\u0441\u043C\u043E\u0442\u0440\u0438\u0442 \u0437\u0430\u044F\u0432\u043A\u0443, \u0438 \u0432\u044B \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043F\u043E email.',
    el: '\u03A4\u03BF \u03C0\u03C1\u03BF\u03C6\u03AF\u03BB \u03C3\u03B1\u03C2 \u03C5\u03C0\u03BF\u03B2\u03BB\u03AE\u03B8\u03B7\u03BA\u03B5! \u039F \u03B4\u03B9\u03B1\u03C7\u03B5\u03B9\u03C1\u03B9\u03C3\u03C4\u03AE\u03C2 \u03C4\u03BF\u03C5 ICF Cyprus \u03B8\u03B1 \u03C4\u03BF \u03B5\u03BE\u03B5\u03C4\u03AC\u03C3\u03B5\u03B9 \u03BA\u03B1\u03B9 \u03B8\u03B1 \u03BB\u03AC\u03B2\u03B5\u03C4\u03B5 \u03B5\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03AF\u03C9\u03C3\u03B7 \u03BC\u03AD\u03C3\u03C9 email.',
  },
  regErrorGeneral: {
    en: 'Something went wrong. Please try again.',
    ru: '\u041F\u0440\u043E\u0438\u0437\u043E\u0448\u043B\u0430 \u043E\u0448\u0438\u0431\u043A\u0430. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.',
    el: '\u039A\u03AC\u03C4\u03B9 \u03C0\u03AE\u03B3\u03B5 \u03C3\u03C4\u03C1\u03B1\u03B2\u03AC. \u0394\u03BF\u03BA\u03B9\u03BC\u03AC\u03C3\u03C4\u03B5 \u03BE\u03B1\u03BD\u03AC.',
  },
  regRetry: {
    en: 'Try again',
    ru: '\u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0441\u043D\u043E\u0432\u0430',
    el: '\u0394\u03BF\u03BA\u03B9\u03BC\u03AC\u03C3\u03C4\u03B5 \u03BE\u03B1\u03BD\u03AC',
  },

  // Navigation
  joinRegistry: {
    en: 'Join the Registry',
    ru: '\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0441\u0435\u0431\u044F \u0432 \u0440\u0435\u0435\u0441\u0442\u0440',
    el: '\u0395\u03B3\u03B3\u03C1\u03B1\u03C6\u03AE \u03C3\u03C4\u03BF \u03BC\u03B7\u03C4\u03C1\u03CE\u03BF',
  },
  backToCatalog: {
    en: '\u2190 ICF Cyprus Coach Registry',
    ru: '\u2190 \u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u043A\u043E\u0443\u0447\u0435\u0439 ICF Cyprus',
    el: '\u2190 \u039C\u03B7\u03C4\u03C1\u03CE\u03BF Coaches ICF Cyprus',
  },

  // Card preview
  regPreviewTitle: {
    en: 'Your card preview',
    ru: '\u041F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438',
    el: '\u03A0\u03C1\u03BF\u03B5\u03C0\u03B9\u03C3\u03BA\u03CC\u03C0\u03B7\u03C3\u03B7 \u03BA\u03AC\u03C1\u03C4\u03B1\u03C2',
  },

  // =========================================================
  // Edit Profile
  // =========================================================
  editPageTitle: {
    en: 'Edit Profile',
    ru: '\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u044F',
    el: '\u0395\u03C0\u03B5\u03BE\u03B5\u03C1\u03B3\u03B1\u03C3\u03AF\u03B1 \u03C0\u03C1\u03BF\u03C6\u03AF\u03BB',
  },
  editPageTitleHighlight: {
    en: 'ICF Cyprus',
    ru: 'ICF Cyprus',
    el: 'ICF Cyprus',
  },
  editEmailLabel: {
    en: 'Your email',
    ru: '\u0412\u0430\u0448 email',
    el: '\u03A4\u03BF email \u03C3\u03B1\u03C2',
  },
  editEmailPlaceholder: {
    en: 'your@email.com',
    ru: 'your@email.com',
    el: 'your@email.com',
  },
  editEmailHelp: {
    en: 'Enter the email you used during registration',
    ru: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 email, \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u0439 \u043F\u0440\u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438',
    el: '\u0395\u03B9\u03C3\u03AC\u03B3\u03B5\u03C4\u03B5 \u03C4\u03BF email \u03C0\u03BF\u03C5 \u03C7\u03C1\u03B7\u03C3\u03B9\u03BC\u03BF\u03C0\u03BF\u03B9\u03AE\u03C3\u03B1\u03C4\u03B5 \u03BA\u03B1\u03C4\u03AC \u03C4\u03B7\u03BD \u03B5\u03B3\u03B3\u03C1\u03B1\u03C6\u03AE',
  },
  editSendLink: {
    en: 'Send edit link',
    ru: '\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443',
    el: '\u0391\u03C0\u03BF\u03C3\u03C4\u03BF\u03BB\u03AE \u03C3\u03C5\u03BD\u03B4\u03AD\u03C3\u03BC\u03BF\u03C5',
  },
  editSending: {
    en: 'Sending...',
    ru: '\u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430...',
    el: '\u0391\u03C0\u03BF\u03C3\u03C4\u03BF\u03BB\u03AE...',
  },
  editLinkSent: {
    en: 'Check your email',
    ru: '\u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u043F\u043E\u0447\u0442\u0443',
    el: '\u0395\u03BB\u03AD\u03B3\u03BE\u03C4\u03B5 \u03C4\u03BF email \u03C3\u03B1\u03C2',
  },
  editLinkSentText: {
    en: 'We sent a link to edit your profile. The link is valid for 24 hours.',
    ru: '\u041C\u044B \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u043B\u0438 \u0441\u0441\u044B\u043B\u043A\u0443 \u0434\u043B\u044F \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u043F\u0440\u043E\u0444\u0438\u043B\u044F. \u0421\u0441\u044B\u043B\u043A\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u0430 24 \u0447\u0430\u0441\u0430.',
    el: '\u03A3\u03B1\u03C2 \u03C3\u03C4\u03B5\u03AF\u03BB\u03B1\u03BC\u03B5 \u03C3\u03CD\u03BD\u03B4\u03B5\u03C3\u03BC\u03BF \u03B3\u03B9\u03B1 \u03B5\u03C0\u03B5\u03BE\u03B5\u03C1\u03B3\u03B1\u03C3\u03AF\u03B1 \u03C4\u03BF\u03C5 \u03C0\u03C1\u03BF\u03C6\u03AF\u03BB \u03C3\u03B1\u03C2. \u039F \u03C3\u03CD\u03BD\u03B4\u03B5\u03C3\u03BC\u03BF\u03C2 \u03B9\u03C3\u03C7\u03CD\u03B5\u03B9 \u03B3\u03B9\u03B1 24 \u03CE\u03C1\u03B5\u03C2.',
  },
  editLoadingProfile: {
    en: 'Loading profile...',
    ru: '\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u0440\u043E\u0444\u0438\u043B\u044F...',
    el: '\u03A6\u03CC\u03C1\u03C4\u03C9\u03C3\u03B7 \u03C0\u03C1\u03BF\u03C6\u03AF\u03BB...',
  },
  editTokenInvalid: {
    en: 'This link is invalid or has expired. Please request a new one.',
    ru: '\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0435\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u0430 \u0438\u043B\u0438 \u0438\u0441\u0442\u0435\u043A\u043B\u0430. \u0417\u0430\u043F\u0440\u043E\u0441\u0438\u0442\u0435 \u043D\u043E\u0432\u0443\u044E.',
    el: '\u0391\u03C5\u03C4\u03CC\u03C2 \u03BF \u03C3\u03CD\u03BD\u03B4\u03B5\u03C3\u03BC\u03BF\u03C2 \u03B4\u03B5\u03BD \u03B5\u03AF\u03BD\u03B1\u03B9 \u03AD\u03B3\u03BA\u03C5\u03C1\u03BF\u03C2 \u03AE \u03AD\u03C7\u03B5\u03B9 \u03BB\u03AE\u03BE\u03B5\u03B9. \u0396\u03B7\u03C4\u03AE\u03C3\u03C4\u03B5 \u03BD\u03AD\u03BF.',
  },
  editSave: {
    en: 'Save Changes',
    ru: '\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F',
    el: '\u0391\u03C0\u03BF\u03B8\u03AE\u03BA\u03B5\u03C5\u03C3\u03B7 \u03B1\u03BB\u03BB\u03B1\u03B3\u03CE\u03BD',
  },
  editSaving: {
    en: 'Saving...',
    ru: '\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435...',
    el: '\u0391\u03C0\u03BF\u03B8\u03AE\u03BA\u03B5\u03C5\u03C3\u03B7...',
  },
  editSuccess: {
    en: 'Profile updated!',
    ru: '\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u043E\u0431\u043D\u043E\u0432\u043B\u0451\u043D!',
    el: '\u03A4\u03BF \u03C0\u03C1\u03BF\u03C6\u03AF\u03BB \u03B5\u03BD\u03B7\u03BC\u03B5\u03C1\u03CE\u03B8\u03B7\u03BA\u03B5!',
  },
  editSuccessText: {
    en: 'Your changes are now live in the catalog.',
    ru: '\u0412\u0430\u0448\u0438 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0443\u0436\u0435 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u044E\u0442\u0441\u044F \u0432 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0435.',
    el: '\u039F\u03B9 \u03B1\u03BB\u03BB\u03B1\u03B3\u03AD\u03C2 \u03C3\u03B1\u03C2 \u03B5\u03BC\u03C6\u03B1\u03BD\u03AF\u03B6\u03BF\u03BD\u03C4\u03B1\u03B9 \u03C4\u03CE\u03C1\u03B1 \u03C3\u03C4\u03BF\u03BD \u03BA\u03B1\u03C4\u03AC\u03BB\u03BF\u03B3\u03BF.',
  },
  editCurrentPhoto: {
    en: 'Current photo',
    ru: '\u0422\u0435\u043A\u0443\u0449\u0435\u0435 \u0444\u043E\u0442\u043E',
    el: '\u03A4\u03C1\u03AD\u03C7\u03BF\u03C5\u03C3\u03B1 \u03C6\u03C9\u03C4\u03BF\u03B3\u03C1\u03B1\u03C6\u03AF\u03B1',
  },
  editRequestNew: {
    en: 'Request new link',
    ru: '\u0417\u0430\u043F\u0440\u043E\u0441\u0438\u0442\u044C \u043D\u043E\u0432\u0443\u044E \u0441\u0441\u044B\u043B\u043A\u0443',
    el: '\u0396\u03B7\u03C4\u03AE\u03C3\u03C4\u03B5 \u03BD\u03AD\u03BF \u03C3\u03CD\u03BD\u03B4\u03B5\u03C3\u03BC\u03BF',
  },
  editBackToCatalog: {
    en: 'Back to catalog',
    ru: '\u041D\u0430\u0437\u0430\u0434 \u043A \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0443',
    el: '\u03A0\u03AF\u03C3\u03C9 \u03C3\u03C4\u03BF\u03BD \u03BA\u03B1\u03C4\u03AC\u03BB\u03BF\u03B3\u03BF',
  },
};

/** @type {string} */
let currentLang = DEFAULT_LANG;

/**
 * Detect browser locale and map to supported language.
 * @returns {string} 'en' | 'ru' | 'el'
 */
function detectBrowserLanguage() {
  const nav = navigator.language || navigator.userLanguage || '';
  const code = nav.split('-')[0].toLowerCase();

  if (SUPPORTED_LANGS.includes(code)) {
    return code;
  }
  return DEFAULT_LANG;
}

/**
 * Initialize language from localStorage or browser locale.
 * @returns {string} The resolved language code
 */
export function initLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored && SUPPORTED_LANGS.includes(stored)) {
    currentLang = stored;
  } else {
    currentLang = detectBrowserLanguage();
    localStorage.setItem(STORAGE_KEY, currentLang);
  }

  return currentLang;
}

/**
 * Get translation for a key in the current language.
 * Falls back to English, then returns the key itself.
 * @param {string} key — dictionary key
 * @returns {string}
 */
export function t(key) {
  const entry = dictionary[key];
  if (!entry) {
    return key;
  }
  return entry[currentLang] || entry[DEFAULT_LANG] || key;
}

/**
 * Get current language code.
 * @returns {string} 'en' | 'ru' | 'el'
 */
export function getCurrentLanguage() {
  return currentLang;
}

/**
 * Switch language, persist to localStorage, and update
 * all DOM elements with [data-i18n] attribute.
 * @param {string} lang — 'en' | 'ru' | 'el'
 */
export function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) {
    return;
  }

  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  updateDOM();
}

/**
 * Update all elements with [data-i18n] attribute to
 * reflect the current language.
 */
function updateDOM() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }
  });

  // Update data-i18n-placeholder for inputs
  const inputs = document.querySelectorAll('[data-i18n-placeholder]');
  inputs.forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      el.placeholder = t(key);
    }
  });

  // Update html lang attribute on the widget container
  const container = document.querySelector('.icf-registry');
  if (container) {
    container.setAttribute('lang', currentLang);
  }
}

/**
 * Override brand-specific i18n keys with values from
 * the remote config (Settings sheet).
 *
 * Replaces "ICF Cyprus" with the configured brand name
 * in all relevant dictionary entries.
 *
 * @param {string} brandName — e.g. "ICF Cyprus" or "Coaching School X"
 * @param {Object} [opts]
 * @param {string} [opts.registryName] — e.g. "ICF Cyprus Coach Registry"
 * @param {string} [opts.location] — e.g. "Cyprus"
 */
export function setBrandOverrides(brandName, opts = {}) {
  const registryName = opts.registryName
    || `${brandName} Coach Registry`;
  const location = opts.location || '';

  // Keys that should be set to brandName in all langs
  const brandKeys = [
    'pageTitleHighlight',
    'regPageTitleHighlight',
    'editPageTitleHighlight',
  ];
  brandKeys.forEach((key) => {
    if (dictionary[key]) {
      SUPPORTED_LANGS.forEach((lang) => {
        dictionary[key][lang] = brandName;
      });
    }
  });

  // Replace "ICF Cyprus" in text strings
  const replaceInAll = (key) => {
    if (!dictionary[key]) return;
    SUPPORTED_LANGS.forEach((lang) => {
      if (dictionary[key][lang]) {
        dictionary[key][lang] = dictionary[key][lang]
          .replace(/ICF Cyprus/g, brandName);
      }
    });
  };

  replaceInAll('contactMessage');
  replaceInAll('contactSubject');
  replaceInAll('regSuccess');
  replaceInAll('backToCatalog');

  // Location override (e.g. "Offline (Cyprus)")
  if (location && dictionary.formatOffline) {
    SUPPORTED_LANGS.forEach((lang) => {
      if (dictionary.formatOffline[lang]) {
        dictionary.formatOffline[lang] =
          dictionary.formatOffline[lang]
            .replace(/Cyprus/g, location);
      }
    });
  }
}

export { SUPPORTED_LANGS, dictionary };

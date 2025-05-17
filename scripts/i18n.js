// i18n.js - Internationalization handling

// Available languages
const AVAILABLE_LANGUAGES = {
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'it': 'Italiano',
  'pt': 'Português',
  'ja': '日本語',
  'ru': 'Русский'
  // Add more languages as needed
};
// Short labels for language selector icons
const LANGUAGE_ICONS = {
  'en': 'en',
  'es': 'es',
  'fr': 'fr',
  'de': 'de',
  'it': 'it',
  'pt': 'pt',
  'ja': '日本',
  'ru': 'ру'
};

// Default language
const DEFAULT_LANGUAGE = 'en';

// Global variables
let currentLanguage = DEFAULT_LANGUAGE;
let translations = {};

// Initialize i18n
async function initI18n() {
  // Try to get language from URL parameter, e.g., ?lang=es
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  
  // Try to get language from localStorage (if previously selected)
  const storedLang = localStorage.getItem('preferredLanguage');
  
  // Try to get language from browser settings
  const browserLang = navigator.language.split('-')[0];
  
  // Determine which language to use (URL param takes precedence, then stored, then browser)
  let targetLang = langParam || storedLang || browserLang || DEFAULT_LANGUAGE;
  
  // If the target language is not available, fall back to default
  if (!AVAILABLE_LANGUAGES.hasOwnProperty(targetLang)) {
    targetLang = DEFAULT_LANGUAGE;
  }
  
  // Load translations
  await loadTranslations(targetLang);
  
  // Update language selector
  updateLanguageSelector(targetLang);
  
  // Apply translations
  translatePage();
}

// Load translations from JSON file
async function loadTranslations(lang) {
  try {
    const response = await fetch(`./i18n/${lang}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${lang}`);
    }
    translations = await response.json();
    currentLanguage = lang;
    
    // Store the preferred language
    localStorage.setItem('preferredLanguage', lang);
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Update URL if it doesn't already have the lang parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('lang') !== lang) {
      urlParams.set('lang', lang);
      const newUrl = window.location.pathname + '?' + urlParams.toString();
      window.history.replaceState({}, '', newUrl);
    }
    
    // Special styling for CJK languages
    if (['ja', 'zh', 'ko'].includes(currentLanguage)) {
      document.body.classList.add('cjk-language');
    } else {
      document.body.classList.remove('cjk-language');
    }
    
    return true;
  } catch (error) {
    console.error('Error loading translations:', error);
    // Fall back to default language if there's an error
    if (lang !== DEFAULT_LANGUAGE) {
      await loadTranslations(DEFAULT_LANGUAGE);
    }
    return false;
  }
}

// Get a translation by key (supports nested keys like "table.headers.command")
function getTranslation(key, defaultValue = null) {
  const keyPath = key.split('.');
  let result = translations;
  
  for (const part of keyPath) {
    if (result && result.hasOwnProperty(part)) {
      result = result[part];
    } else {
      return defaultValue !== null ? defaultValue : key;
    }
  }
  
  return result;
}

// Translate the entire page
function translatePage() {
  // First translate non-span elements with data-i18n
  document.querySelectorAll('h1[data-i18n], th[data-i18n], td[data-i18n]:not(.dropdown-summary td)').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = getTranslation(key, element.textContent);
  });
  
  // Handle complete description translations
  document.querySelectorAll('span[data-i18n]').forEach(element => {
    // Skip elements that have nested i18n elements (we'll handle these separately)
    if (element.querySelector('[data-i18n]')) return;
    
    const key = element.getAttribute('data-i18n');
    const translation = getTranslation(key, element.textContent);
    
    // For all normal span elements, translate text content
    element.textContent = translation;
  });
  
  // Handle nested translations (words inside descriptions)
  document.querySelectorAll('[data-i18n] [data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = getTranslation(key, element.textContent);
  });
  
  // Handle command examples that need parameter translation
  document.querySelectorAll('[data-i18n-cmd]').forEach(element => {
    if (element.tagName === 'CODE') {
      const key = element.getAttribute('data-i18n-cmd');
      const translation = getTranslation(key, null);
      
      if (translation) {
        // Replace only the parameters in the command example, keep the command structure
        element.textContent = translation;
      }
    }
  });

  // Special handling for elements with HTML content or specific needs
  
  // Translate title
  document.title = getTranslation('meta.title', 'Bot Commands');
  
  // Translate command rows - preserve the dropdown toggle
  document.querySelectorAll('.dropdown-summary').forEach(row => {
    const commandCell = row.querySelector('td:first-child');
    const descriptionCell = row.querySelector('td:nth-child(2)');
    
    if (!commandCell || !descriptionCell) return;
    
    // Get the i18n keys
    const commandKey = commandCell.getAttribute('data-i18n-key');
    const descriptionKey = descriptionCell.getAttribute('data-i18n-key');
    
    if (commandKey && descriptionKey) {
      // Get the dropdown toggle element if it exists
      const dropdownToggle = descriptionCell.querySelector('.dropdown-toggle');
      
      // IMPORTANT: We DO NOT translate the actual command, only descriptions
      // commandCell.textContent = getTranslation(commandKey, commandCell.textContent);
      
      // Set the translated description
      descriptionCell.textContent = getTranslation(descriptionKey, descriptionCell.textContent);
      
      // Re-append the dropdown toggle
      if (dropdownToggle) {
        descriptionCell.appendChild(dropdownToggle);
      }
    }
  });
  
  // Translate "Mod" badge
  document.querySelectorAll('.mod-badge').forEach(badge => {
    badge.textContent = getTranslation('ui.mod', 'Mod');
  });
  
  // Translate mod-command::before with CSS
  const existingStyle = document.getElementById('mod-command-style');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const modCommandStyle = document.createElement('style');
  modCommandStyle.id = 'mod-command-style';
  modCommandStyle.textContent = `.mod-command::before { content: "${getTranslation('ui.mod', 'Mod')}"; }`;
  document.head.appendChild(modCommandStyle);
  
  // Translate "Last updated" text
  const lastUpdatedEl = document.getElementById('last-updated');
  if (lastUpdatedEl) {
    const dateStr = lastUpdatedEl.textContent.replace(/^.*?: /, '');
    lastUpdatedEl.textContent = `${getTranslation('page.lastUpdated', 'Last updated')}: ${dateStr}`;
  }
}

// Create language selector
function createLanguageSelector() {
  // Check if language selector already exists
  if (document.querySelector('.language-selector')) {
    return;
  }
  
  const selector = document.createElement('div');
  selector.className = 'language-selector';
  
  const currentBtn = document.createElement('button');
  currentBtn.className = 'current-lang';
  currentBtn.type = 'button';
  currentBtn.textContent = LANGUAGE_ICONS[currentLanguage] || currentLanguage;
  selector.appendChild(currentBtn);

  const grid = document.createElement('div');
  grid.className = 'language-grid';

  for (const code of Object.keys(AVAILABLE_LANGUAGES)) {
    const btn = document.createElement('button');
    btn.className = 'grid-item';
    btn.type = 'button';
    btn.dataset.lang = code;
    btn.textContent = LANGUAGE_ICONS[code] || code;
    btn.addEventListener('click', async () => {
      selector.classList.remove('open');
      await loadTranslations(code);
      translatePage();
      updateLanguageSelector(code);
    });
    grid.appendChild(btn);
  }

  selector.appendChild(grid);

  currentBtn.addEventListener('click', () => {
    selector.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!selector.contains(e.target)) {
      selector.classList.remove('open');
    }
  });

  // Add language selector to the page header or body
  const header = document.querySelector('header') || document.body;
  header.appendChild(selector);
}

// Update language selector to reflect current language
function updateLanguageSelector(lang) {
  const selector = document.querySelector('.language-selector');
  if (selector) {
    const currentBtn = selector.querySelector('.current-lang');
    if (currentBtn) {
      currentBtn.textContent = LANGUAGE_ICONS[lang] || lang;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  createLanguageSelector();
  initI18n();
});
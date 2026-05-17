/**
 * Language Configuration for Mother-Tongue
 *
 * This file defines all supported languages and their translation providers.
 * To add a new language, simply add an entry to the SUPPORTED_LANGUAGES object.
 *
 * NOTE: All languages use Google Translate for translation (no additional IBM services needed).
 * Only IBM Watsonx.ai is required for intent refinement and code generation.
 */

const SUPPORTED_LANGUAGES = {
  // PRIMARY LANGUAGE - Uses Google Translate for best quality
  twi: {
    code: 'twi',
    name: 'Twi',
    nativeName: 'Twi',
    flag: '🇬🇭',
    provider: 'google',
    googleCode: 'tw',
    voiceCode: 'ak-GH',
    isPrimary: true,
    description: 'Primary flow using Google Translate for best Twi quality',
    placeholder: 'Me pɛ sɛ...',
    examples: [
      'Me pɛ sɛ system no kyerɛ me grade a mehia',
      'Calculator RemainingCourses dwumadie'
    ],
    inputLabel: '💬 Describe what you want to build in Twi',
    explanationLabel: '🇬🇭 Explanation in Twi'
  },

  // ADDITIONAL LANGUAGES (All use Google Translate)
  // Add any Google Translate supported language here
  
  french: {
    code: 'french',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    provider: 'google',
    googleCode: 'fr',
    voiceCode: 'fr-FR',
    isPrimary: false,
    description: 'Multi-language support using Google Translate',
    placeholder: 'Je veux créer une fonction...',
    examples: [
      'Je veux créer une fonction pour calculer la moyenne',
      'Créer une fonction pour calculer les cours restants'
    ],
    inputLabel: '💬 Décrivez ce que vous voulez créer en français',
    explanationLabel: '🇫🇷 Explication en français'
  },

  spanish: {
    code: 'spanish',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    provider: 'google',
    googleCode: 'es',
    voiceCode: 'es-ES',
    isPrimary: false,
    description: 'Multi-language support using Google Translate',
    placeholder: 'Quiero crear una función...',
    examples: [
      'Quiero crear una función para calcular el promedio',
      'Crear una función para calcular los cursos restantes'
    ],
    inputLabel: '💬 Describe lo que quieres construir en español',
    explanationLabel: '🇪🇸 Explicación en español'
  },

  arabic: {
    code: 'arabic',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    provider: 'google',
    googleCode: 'ar',
    voiceCode: 'ar-SA',
    isPrimary: false,
    description: 'Multi-language support using Google Translate',
    placeholder: 'أريد إنشاء دالة...',
    examples: [
      'أريد إنشاء دالة لحساب المعدل التراكمي',
      'إنشاء دالة لحساب الدورات المتبقية'
    ],
    inputLabel: '💬 صف ما تريد بناءه بالعربية',
    explanationLabel: '🇸🇦 الشرح بالعربية'
  },

  german: {
    code: 'german',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    provider: 'google',
    googleCode: 'de',
    voiceCode: 'de-DE',
    isPrimary: false,
    description: 'Multi-language support using Google Translate',
    placeholder: 'Ich möchte eine Funktion erstellen...',
    examples: [
      'Ich möchte eine Funktion zur Berechnung des Durchschnitts erstellen',
      'Eine Funktion zur Berechnung der verbleibenden Kurse erstellen'
    ],
    inputLabel: '💬 Beschreiben Sie auf Deutsch, was Sie erstellen möchten',
    explanationLabel: '🇩🇪 Erklärung auf Deutsch'
  },

  portuguese: {
    code: 'portuguese',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    provider: 'google',
    googleCode: 'pt',
    voiceCode: 'pt-PT',
    isPrimary: false,
    description: 'Multi-language support using Google Translate',
    placeholder: 'Quero criar uma função...',
    examples: [
      'Quero criar uma função para calcular a média',
      'Criar uma função para calcular os cursos restantes'
    ],
    inputLabel: '💬 Descreva o que você quer construir em português',
    explanationLabel: '🇵🇹 Explicação em português'
  },

  italian: {
    code: 'italian',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    provider: 'google',
    googleCode: 'it',
    voiceCode: 'it-IT',
    isPrimary: false,
    description: 'Multi-language support using Google Translate',
    placeholder: 'Voglio creare una funzione...',
    examples: [
      'Voglio creare una funzione per calcolare la media',
      'Creare una funzione per calcolare i corsi rimanenti'
    ],
    inputLabel: '💬 Descrivi cosa vuoi costruire in italiano',
    explanationLabel: '🇮🇹 Spiegazione in italiano'
  },

  japanese: {
    code: 'japanese',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    provider: 'google',
    googleCode: 'ja',
    voiceCode: 'ja-JP',
    isPrimary: false,
    description: 'Multi-language support using Google Translate',
    placeholder: '関数を作成したい...',
    examples: [
      '平均を計算する関数を作成したい',
      '残りのコースを計算する関数を作成する'
    ],
    inputLabel: '💬 日本語で作成したいものを説明してください',
    explanationLabel: '🇯🇵 日本語での説明'
  },

  korean: {
    code: 'korean',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    provider: 'google',
    googleCode: 'ko',
    voiceCode: 'ko-KR',
    isPrimary: false,
    description: 'Multi-language support using Google Translate',
    placeholder: '함수를 만들고 싶습니다...',
    examples: [
      '평균을 계산하는 함수를 만들고 싶습니다',
      '남은 과목을 계산하는 함수 만들기'
    ],
    inputLabel: '💬 한국어로 만들고 싶은 것을 설명하세요',
    explanationLabel: '🇰🇷 한국어 설명'
  },

  chinese: {
    code: 'chinese',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    provider: 'google',
    googleCode: 'zh-CN',
    voiceCode: 'zh-CN',
    isPrimary: false,
    description: 'Multi-language support using Google Translate',
    placeholder: '我想创建一个函数...',
    examples: [
      '我想创建一个计算平均值的函数',
      '创建一个计算剩余课程的函数'
    ],
    inputLabel: '💬 用中文描述你想构建的内容',
    explanationLabel: '🇨🇳 中文解释'
  },

  hindi: {
    code: 'hindi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    provider: 'google',
    googleCode: 'hi',
    voiceCode: 'hi-IN',
    isPrimary: false,
    description: 'Multi-language support using Google Translate',
    placeholder: 'मैं एक फ़ंक्शन बनाना चाहता हूं...',
    examples: [
      'मैं औसत की गणना के लिए एक फ़ंक्शन बनाना चाहता हूं',
      'शेष पाठ्यक्रमों की गणना के लिए एक फ़ंक्शन बनाएं'
    ],
    inputLabel: '💬 हिंदी में बताएं कि आप क्या बनाना चाहते हैं',
    explanationLabel: '🇮🇳 हिंदी में व्याख्या'
  }
};

/**
 * Get language configuration by code
 * @param {string} code - Language code (e.g., 'twi', 'french')
 * @returns {object|null} Language configuration or null if not found
 */
function getLanguageConfig(code) {
  return SUPPORTED_LANGUAGES[code] || null;
}

/**
 * Get all supported languages
 * @returns {object} All language configurations
 */
function getAllLanguages() {
  return SUPPORTED_LANGUAGES;
}

/**
 * Get languages by provider
 * @param {string} provider - 'google' (all languages now use Google Translate)
 * @returns {array} Array of language configurations
 */
function getLanguagesByProvider(provider) {
  return Object.values(SUPPORTED_LANGUAGES).filter(lang => lang.provider === provider);
}

/**
 * Get primary language
 * @returns {object} Primary language configuration
 */
function getPrimaryLanguage() {
  return Object.values(SUPPORTED_LANGUAGES).find(lang => lang.isPrimary);
}

module.exports = {
  SUPPORTED_LANGUAGES,
  getLanguageConfig,
  getAllLanguages,
  getLanguagesByProvider,
  getPrimaryLanguage
};

// Made with Bob

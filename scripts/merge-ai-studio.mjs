// Merges messages/aiStudio.en.json into all locale files with translations.
import { readFileSync, writeFileSync } from 'node:fs';
const base = JSON.parse(readFileSync('messages/aiStudio.en.json', 'utf8')).aiStudio;

// Per-locale overrides: keys that need actual translation. Untranslated keys
// fall back to English (still better than nothing for now).
const TR = {
  es: {
    metaTitle: 'AI Studio — CreatorAI Hub', kicker: 'CreatorAI Hub / Espacio nativo · acceso gratuito de lanzamiento',
    heroTitle1: 'Haz el siguiente', heroTitle2: 'movimiento tú mismo.',
    heroText: 'AI Studio es un espacio de trabajo aparte para utilidades prácticas de creadores: briefs, prompts, calendarios y tareas de medios locales. Sin rankings de herramientas. Sin subidas ocultas.',
    exploreWorkspace: 'Explorar el espacio de trabajo', browseDirectory: 'Explorar el directorio',
    privacyFirst: 'Privacidad por diseño', practicalUtilities: 'Utilidades prácticas de un solo propósito',
    sectionEyebrow: 'Espacio de estudio / fase 01', sectionTitle: 'Hecho para hacer, no para decidir.',
    sectionText: 'El directorio te ayuda a evaluar herramientas externas. AI Studio te ayudará a producir resultados listos para usar directamente en tu navegador.',
    foundationActive: 'Fundación del producto activa', writeSection: 'Escribir', mediaSection: 'Utilidades de medios',
    principle1Title: 'Separar por propósito.', principle1Text: 'El directorio es para descubrir y comparar productos externos. El estudio es para crear resultados útiles.',
    principle2Title: 'Local donde importa.', principle2Text: 'Las utilidades basadas en archivos están diseñadas para procesarse en el navegador. Tus medios no son una cola de subida.',
    principle3Title: 'Alcance honesto.', principle3Text: 'Cada utilidad dirá exactamente qué hace. Sin investigación en vivo, acceso a modelos ni procesamiento en segundo plano implícitos.',
    externalCta: '¿Primero necesitas elegir una herramienta externa de IA?', externalText: 'Eso pertenece al directorio — con fuentes, estado de precios y comparaciones separados de este espacio.',
    exploreDirectory: 'Explorar el directorio',
    utilityPromptBuilder: 'Prompt Builder', utilityThumbnailBrief: 'Brief de miniatura', utilityThumbnailText: 'Texto de miniatura',
    utilityContentCalendar: 'Calendario de contenido', utilityImageTools: 'Herramientas de imagen', utilitySubtitleTools: 'Herramientas de subtítulos',
    utilityAudioTrimmer: 'Recortador de audio', utilityVideoInspector: 'Inspector de vídeo',
  },
  fa: {
    metaTitle: 'استودیو هوش مصنوعی — CreatorAI Hub', kicker: 'CreatorAI Hub / فضای کاری بومی · دسترسی رایگان در راه‌اندازی',
    heroTitle1: 'قدم بعدی را', heroTitle2: 'خودت بردار.',
    heroText: 'استودیو هوش مصنوعی یک فضای کاری جداگانه برای ابزارهای کاربردی تولیدکنندگان است — بریف، پرامپت، تقویم و کارهای رسانه‌ای محلی. بدون رتبه‌بندی ابزار. بدون آپلود پنهان.',
    exploreWorkspace: 'کاوش در فضای کاری', browseDirectory: 'مرور دایرکتوری',
    privacyFirst: 'حریم خصوصی در طراحی', practicalUtilities: 'ابزارهای کاربردی تک‌منظوره',
    sectionEyebrow: 'فضای استودیو / فاز ۰۱', sectionTitle: 'ساخته‌شده برای انجام، نه تصمیم‌گیری.',
    sectionText: 'دایرکتوری به تو کمک می‌کند ابزارهای بیرونی را ارزیابی کنی. استودیو هوش مصنوعی به تو کمک می‌کند خروجی آماده استفاده را مستقیم در مرورگرت بسازی.',
    foundationActive: 'بنیان محصول فعال', writeSection: 'نوشتن', mediaSection: 'ابزارهای رسانه‌ای',
    principle1Title: 'جدا بر اساس هدف.', principle1Text: 'دایرکتوری برای کشف و مقایسه محصولات بیرونی است. استودیو برای ساخت خروجی‌های مفید است.',
    principle2Title: 'محلی جایی که مهم است.', principle2Text: 'ابزارهای فایل‌محور برای پردازش در مرورگر طراحی شده‌اند. رسانه‌های تو صف آپلود استودیو نیستند.',
    principle3Title: 'دامنه صادقانه.', principle3Text: 'هر ابزار دقیقاً می‌گوید چه می‌کند. بدون ادعای ضمنی تحقیق زنده، دسترسی به مدل یا پردازش پس‌زمینه.',
    externalCta: 'اول باید یک ابزار بیرونی انتخاب کنی؟', externalText: 'آن کار به دایرکتوری تعلق دارد — با منابع، وضعیت قیمت و مقایسه‌ها جدا از این فضا.',
    exploreDirectory: 'کاوش در دایرکتوری',
  },
  fr: { metaTitle: 'AI Studio — CreatorAI Hub', exploreWorkspace: 'Explorer l’espace de travail', browseDirectory: 'Parcourir le répertoire', writeSection: 'Écrire', mediaSection: 'Utilitaires média' },
  de: { metaTitle: 'AI Studio — CreatorAI Hub', exploreWorkspace: 'Workspace erkunden', browseDirectory: 'Verzeichnis durchsuchen', writeSection: 'Schreiben', mediaSection: 'Medien-Tools' },
  zh: { metaTitle: 'AI Studio — CreatorAI Hub', exploreWorkspace: '探索工作区', browseDirectory: '浏览目录', writeSection: '写作', mediaSection: '媒体工具' },
  ar: { metaTitle: 'AI Studio — CreatorAI Hub', exploreWorkspace: 'استكشف مساحة العمل', browseDirectory: 'تصفح الدليل', writeSection: 'كتابة', mediaSection: 'أدوات الوسائط' },
  pt: { metaTitle: 'AI Studio — CreatorAI Hub', exploreWorkspace: 'Explorar o espaço de trabalho', browseDirectory: 'Explorar o diretório', writeSection: 'Escrever', mediaSection: 'Utilidades de mídia' },
};

for (const loc of ['en', 'es', 'pt', 'fr', 'de', 'zh', 'ar', 'fa']) {
  const file = `messages/${loc}.json`;
  const j = JSON.parse(readFileSync(file, 'utf8'));
  const merged = { ...base };
  if (TR[loc]) Object.assign(merged, TR[loc]);
  j.aiStudio = merged;
  writeFileSync(file, JSON.stringify(j, null, 2) + '\n');
}
console.log('aiStudio merged into all locales');

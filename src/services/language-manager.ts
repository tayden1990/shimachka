import { TelegramInlineKeyboard } from '../types/index';

export interface BotTexts {
  // Welcome and onboarding
  welcome: string;
  welcomeBack: string;
  registrationComplete: string;
  
  // Main menu and navigation
  mainMenu: string;
  startStudy: string;
  addVocabulary: string;
  myProgress: string;
  myWords: string;
  settings: string;
  support: string;
  help: string;
  
  // Study session
  studySessionStart: string;
  studySessionComplete: string;
  noCardsToReview: string;
  allCaughtUp: string;
  noVocabularyYet: string;
  readyToStartLearning: string;
  studySessionStarted: string;
  howLeitnerWorks: string;
  proTip: string;
  correctAnswer: string;
  incorrectAnswer: string;
  showAnswer: string;
  showMeaning: string;
  iKnow: string;
  iDontKnow: string;
  nextCard: string;
  endSession: string;
  continueStudy: string;
  
  // Help
  helpMessage: string;
  
  // Word management
  addWordManually: string;
  enterWord: string;
  enterTranslation: string;
  enterDefinition: string;
  wordAdded: string;
  topicExtraction: string;
  enterTopic: string;
  
  // Settings
  settingsMenu: string;
  selectLanguage: string;
  sourceLanguage: string;
  targetLanguage: string;
  interfaceLanguage: string;
  languageUpdated: string;
  reminderSettings: string;
  
  // Support
  supportMenu: string;
  createTicket: string;
  viewMessages: string;
  contactInfo: string;
  faq: string;
  ticketSubject: string;
  ticketMessage: string;
  ticketPriority: string;
  ticketCreated: string;
  
  // Progress and stats
  progressTitle: string;
  totalCards: string;
  cardsToReview: string;
  masteredCards: string;
  streakDays: string;
  
  // Common buttons
  yes: string;
  no: string;
  cancel: string;
  back: string;
  confirm: string;
  skip: string;
  normal: string;
  urgent: string;
  
  // Error messages
  error: string;
  tryAgain: string;
  invalidInput: string;
  networkError: string;
  
  // Time and dates
  today: string;
  yesterday: string;
  daysAgo: string;
  hoursAgo: string;
  minutesAgo: string;
  
  // Learning tips
  dailyTip: string;
  leitnerTip: string;
}

export const SUPPORTED_LANGUAGES = {
  en: 'English',
  fa: 'فارسی',
  ar: 'العربية',
  es: 'Español',
  ru: 'Русский',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  tr: 'Türkçe',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
  hi: 'हिन्दी',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  pl: 'Polski',
  nl: 'Nederlands',
  sv: 'Svenska'
};

const TEXTS: Record<string, BotTexts> = {
  en: {
    // Welcome and onboarding
    welcome: "🎯 Welcome to Leitner Learning Bot!",
    welcomeBack: "🎯 Welcome back!",
    registrationComplete: "✅ Registration complete! You're ready to start learning.",
    
    // Main menu and navigation
    mainMenu: "📚 Main Menu",
    startStudy: "📚 Start Study",
    addVocabulary: "➕ Add Vocabulary",
    myProgress: "📊 My Progress",
    myWords: "🗂️ My Words",
    settings: "⚙️ Settings",
    support: "🆘 Support",
    help: "❓ Help",
    
    // Study session
    studySessionStart: "🎯 Starting study session...",
    studySessionComplete: "🎉 Study session complete!",
    noCardsToReview: "📚 No cards to review right now. Come back later!",
    allCaughtUp: "🎉 **All caught up!**\n\nYou've reviewed all due cards. Great work!",
    noVocabularyYet: "📚 **Ready to start learning?**\n\nYou haven't added any vocabulary yet!\n\n• Use /topic to generate vocabulary from any subject\n• Use /add to manually add words\n\nThe Leitner system will help you master new words efficiently! 🚀",
    readyToStartLearning: "Ready to start learning?",
    studySessionStarted: "🚀 **Study Session Started!**",
    howLeitnerWorks: "🎯 **How the Leitner System Works:**\n• Correct answers → Move to next box (review less often)\n• Incorrect answers → Back to Box 1 (review more often)\n• Master words by reaching Box 5!",
    proTip: "💡 **Pro tip:** You can type your answers or use the buttons. Let's begin!",
    correctAnswer: "✅ Correct!",
    incorrectAnswer: "❌ Incorrect!",
    showAnswer: "👁️ Show Answer",
    showMeaning: "💡 Show Meaning", 
    iKnow: "✅ I Know",
    iDontKnow: "❌ I Don't Know",
    nextCard: "➡️ Next Card",
    endSession: "🏁 End Session",
    continueStudy: "📚 Continue Study",
    
    // Help
    helpMessage: `📚 **Leitner Learning Bot Commands:**

🎯 **Learning Commands:**
/study - Start reviewing your flashcards
/topic - Generate vocabulary from a topic  
/add - Add a word manually

📊 **Progress & Stats:**
/stats - View your learning statistics
/mywords - See your vocabulary
/mytopics - View your topics

⚙️ **Settings:**
/settings - Configure languages and reminders

🆘 **Support & Help:**
/help - Show this help message
/support - Contact support team
/contact - Get contact information

💡 **Tips:**
• Study regularly for best results
• Words move through 5 boxes based on your performance
• Mastered words are reviewed less frequently

Choose an action below:`,
    
    // Word management
    addWordManually: "✏️ Add Word Manually",
    enterWord: "Please enter the word:",
    enterTranslation: "Please enter the translation:",
    enterDefinition: "Please enter the definition:",
    wordAdded: "✅ Word added successfully!",
    topicExtraction: "📝 Extract from Topic",
    enterTopic: "📝 What topic do you want to add vocabulary for?",
    
    // Settings
    settingsMenu: "⚙️ Settings Menu",
    selectLanguage: "🌍 Select Language",
    sourceLanguage: "📖 Source Language",
    targetLanguage: "🎯 Target Language", 
    interfaceLanguage: "🌐 Interface Language",
    languageUpdated: "✅ Language updated successfully!",
    reminderSettings: "⏰ Reminder Settings",
    
    // Support
    supportMenu: "🆘 Support Menu",
    createTicket: "🎫 Create Support Ticket",
    viewMessages: "📬 View Messages",
    contactInfo: "📞 Contact Information",
    faq: "❓ FAQ",
    ticketSubject: "Please enter the subject:",
    ticketMessage: "Please describe your issue:",
    ticketPriority: "Select priority level:",
    ticketCreated: "✅ Support ticket created successfully!",
    
    // Progress and stats
    progressTitle: "📊 Your Learning Progress",
    totalCards: "Total Cards",
    cardsToReview: "Cards to Review",
    masteredCards: "Mastered Cards",
    streakDays: "Study Streak",
    
    // Common buttons
    yes: "✅ Yes",
    no: "❌ No",
    cancel: "❌ Cancel",
    back: "🔙 Back",
    confirm: "✅ Confirm",
    skip: "⏭️ Skip",
    normal: "📋 Normal",
    urgent: "🚨 Urgent",
    
    // Error messages
    error: "❌ Error",
    tryAgain: "Please try again.",
    invalidInput: "Invalid input. Please try again.",
    networkError: "Network error. Please try again later.",
    
    // Time and dates
    today: "today",
    yesterday: "yesterday",
    daysAgo: "days ago",
    hoursAgo: "hours ago",
    minutesAgo: "minutes ago",
    
    // Learning tips
    dailyTip: "💡 Daily Tip",
    leitnerTip: "🎯 Leitner System Tip"
  },
  
  fa: {
    // Welcome and onboarding
    welcome: "🎯 به ربات یادگیری لایتنر خوش آمدید!",
    welcomeBack: "🎯 دوباره خوش آمدید!",
    registrationComplete: "✅ ثبت نام کامل شد! آماده شروع یادگیری هستید.",
    
    // Main menu and navigation
    mainMenu: "📚 منوی اصلی",
    startStudy: "📚 شروع مطالعه",
    addVocabulary: "➕ افزودن واژگان",
    myProgress: "📊 پیشرفت من",
    myWords: "🗂️ کلمات من",
    settings: "⚙️ تنظیمات",
    support: "🆘 پشتیبانی",
    help: "❓ راهنما",
    
    // Study session
    studySessionStart: "🎯 شروع جلسه مطالعه...",
    studySessionComplete: "🎉 جلسه مطالعه کامل شد!",
    noCardsToReview: "📚 در حال حاضر کارتی برای مرور وجود ندارد. بعداً برگردید!",
    allCaughtUp: "🎉 **همه چیز انجام شد!**\n\nشما همه کارت‌های قابل مرور را بررسی کرده‌اید. کار عالی!",
    noVocabularyYet: "📚 **آماده شروع یادگیری؟**\n\nشما هنوز هیچ واژگانی اضافه نکرده‌اید!\n\n• از /topic برای تولید واژگان از هر موضوعی استفاده کنید\n• از /add برای افزودن دستی کلمات استفاده کنید\n\nسیستم لایتنر به شما کمک می‌کند کلمات جدید را به طور مؤثر تسلط پیدا کنید! 🚀",
    readyToStartLearning: "آماده شروع یادگیری؟",
    studySessionStarted: "🚀 **جلسه مطالعه شروع شد!**",
    howLeitnerWorks: "🎯 **نحوه کار سیستم لایتنر:**\n• پاسخ‌های صحیح → انتقال به جعبه بعدی (مرور کمتر)\n• پاسخ‌های نادرست → برگشت به جعبه ۱ (مرور بیشتر)\n• تسلط کلمات با رسیدن به جعبه ۵!",
    proTip: "💡 **نکته حرفه‌ای:** می‌توانید پاسخ‌هایتان را تایپ کنید یا از دکمه‌ها استفاده کنید. بیایید شروع کنیم!",
    correctAnswer: "✅ درست!",
    incorrectAnswer: "❌ نادرست!",
    showAnswer: "👁️ نمایش جواب",
    showMeaning: "💡 نمایش معنی",
    iKnow: "✅ می‌دانم",
    iDontKnow: "❌ نمی‌دانم",
    nextCard: "➡️ کارت بعدی",
    endSession: "🏁 پایان جلسه",
    continueStudy: "📚 ادامه مطالعه",
    
    // Help
    helpMessage: `📚 **دستورات ربات یادگیری لایتنر:**

🎯 **دستورات یادگیری:**
/study - شروع مرور فلش کارت‌ها
/topic - تولید واژگان از یک موضوع
/add - افزودن دستی کلمه

📊 **پیشرفت و آمار:**
/stats - مشاهده آمار یادگیری
/mywords - مشاهده واژگان
/mytopics - مشاهده موضوعات

⚙️ **تنظیمات:**
/settings - تنظیم زبان‌ها و یادآوری‌ها

🆘 **پشتیبانی و کمک:**
/help - نمایش این پیام راهنما
/support - تماس با تیم پشتیبانی
/contact - دریافت اطلاعات تماس

💡 **نکات:**
• مطالعه منظم برای بهترین نتایج
• کلمات بر اساس عملکرد شما در ۵ جعبه حرکت می‌کنند
• کلمات تسلط یافته کمتر مرور می‌شوند

یک عمل را در زیر انتخاب کنید:`,
    
    // Word management
    addWordManually: "✏️ افزودن دستی کلمه",
    enterWord: "لطفاً کلمه را وارد کنید:",
    enterTranslation: "لطفاً ترجمه را وارد کنید:",
    enterDefinition: "لطفاً تعریف را وارد کنید:",
    wordAdded: "✅ کلمه با موفقیت اضافه شد!",
    topicExtraction: "📝 استخراج از موضوع",
    enterTopic: "📝 چه موضوعی می‌خواهید برای آن واژگان اضافه کنید؟",
    
    // Settings
    settingsMenu: "⚙️ منوی تنظیمات",
    selectLanguage: "🌍 انتخاب زبان",
    sourceLanguage: "📖 زبان مبدا",
    targetLanguage: "🎯 زبان مقصد",
    interfaceLanguage: "🌐 زبان رابط کاربری",
    languageUpdated: "✅ زبان با موفقیت به‌روزرسانی شد!",
    reminderSettings: "⏰ تنظیمات یادآوری",
    
    // Support
    supportMenu: "🆘 منوی پشتیبانی",
    createTicket: "🎫 ایجاد تیکت پشتیبانی",
    viewMessages: "📬 مشاهده پیام‌ها",
    contactInfo: "📞 اطلاعات تماس",
    faq: "❓ سوالات متداول",
    ticketSubject: "لطفاً موضوع را وارد کنید:",
    ticketMessage: "لطفاً مشکل خود را توضیح دهید:",
    ticketPriority: "سطح اولویت را انتخاب کنید:",
    ticketCreated: "✅ تیکت پشتیبانی با موفقیت ایجاد شد!",
    
    // Progress and stats
    progressTitle: "📊 پیشرفت یادگیری شما",
    totalCards: "کل کارت‌ها",
    cardsToReview: "کارت‌های قابل مرور",
    masteredCards: "کارت‌های تسلط‌یافته",
    streakDays: "روزهای مطالعه مداوم",
    
    // Common buttons
    yes: "✅ بله",
    no: "❌ خیر",
    cancel: "❌ لغو",
    back: "🔙 بازگشت",
    confirm: "✅ تأیید",
    skip: "⏭️ رد کردن",
    normal: "📋 عادی",
    urgent: "🚨 فوری",
    
    // Error messages
    error: "❌ خطا",
    tryAgain: "لطفاً دوباره تلاش کنید.",
    invalidInput: "ورودی نامعتبر. لطفاً دوباره تلاش کنید.",
    networkError: "خطای شبکه. لطفاً بعداً تلاش کنید.",
    
    // Time and dates
    today: "امروز",
    yesterday: "دیروز",
    daysAgo: "روز پیش",
    hoursAgo: "ساعت پیش",
    minutesAgo: "دقیقه پیش",
    
    // Learning tips
    dailyTip: "💡 نکته روزانه",
    leitnerTip: "🎯 نکته سیستم لایتنر"
  },
  
  ar: {
    // Welcome and onboarding
    welcome: "🎯 مرحباً بك في بوت تعلم لايتنر!",
    welcomeBack: "🎯 أهلاً وسهلاً!",
    registrationComplete: "✅ اكتمل التسجيل! أنت مستعد لبدء التعلم.",
    
    // Main menu and navigation
    mainMenu: "📚 القائمة الرئيسية",
    startStudy: "📚 بدء الدراسة",
    addVocabulary: "➕ إضافة مفردات",
    myProgress: "📊 تقدمي",
    myWords: "🗂️ كلماتي",
    settings: "⚙️ الإعدادات",
    support: "🆘 الدعم",
    help: "❓ المساعدة",
    
    // Study session
    studySessionStart: "🎯 بدء جلسة الدراسة...",
    studySessionComplete: "🎉 اكتملت جلسة الدراسة!",
    noCardsToReview: "📚 لا توجد بطاقات للمراجعة الآن. ارجع لاحقاً!",
    allCaughtUp: "🎉 **كل شيء منجز!**\n\nلقد راجعت جميع البطاقات المستحقة. عمل رائع!",
    noVocabularyYet: "📚 **مستعد لبدء التعلم؟**\n\nلم تضف أي مفردات بعد!\n\n• استخدم /topic لتوليد مفردات من أي موضوع\n• استخدم /add لإضافة كلمات يدوياً\n\nسيساعدك نظام لايتنر على إتقان كلمات جديدة بكفاءة! 🚀",
    readyToStartLearning: "مستعد لبدء التعلم؟",
    studySessionStarted: "🚀 **بدأت جلسة الدراسة!**",
    howLeitnerWorks: "🎯 **كيف يعمل نظام لايتنر:**\n• الإجابات الصحيحة → الانتقال للصندوق التالي (مراجعة أقل)\n• الإجابات الخطأ → العودة للصندوق ١ (مراجعة أكثر)\n• إتقان الكلمات بالوصول للصندوق ٥!",
    proTip: "💡 **نصيحة احترافية:** يمكنك كتابة إجاباتك أو استخدام الأزرار. لنبدأ!",
    correctAnswer: "✅ صحيح!",
    incorrectAnswer: "❌ خطأ!",
    showAnswer: "👁️ إظهار الإجابة",
    showMeaning: "💡 إظهار المعنى",
    iKnow: "✅ أعرف",
    iDontKnow: "❌ لا أعرف",
    nextCard: "➡️ البطاقة التالية",
    endSession: "🏁 إنهاء الجلسة",
    continueStudy: "📚 متابعة الدراسة",
    
    // Help
    helpMessage: `📚 **أوامر بوت التعلم لايتنر:**

🎯 **أوامر التعلم:**
/study - بدء مراجعة البطاقات التعليمية
/topic - توليد مفردات من موضوع
/add - إضافة كلمة يدوياً

📊 **التقدم والإحصائيات:**
/stats - عرض إحصائيات التعلم
/mywords - رؤية مفرداتك
/mytopics - رؤية مواضيعك

⚙️ **الإعدادات:**
/settings - تكوين اللغات والتذكيرات

🆘 **الدعم والمساعدة:**
/help - إظهار رسالة المساعدة هذه
/support - التواصل مع فريق الدعم
/contact - الحصول على معلومات الاتصال

💡 **نصائح:**
• ادرس بانتظام للحصول على أفضل النتائج
• تنتقل الكلمات عبر 5 صناديق حسب أداءك
• يتم مراجعة الكلمات المتقنة بشكل أقل

اختر إجراءً أدناه:`,
    
    // Word management
    addWordManually: "✏️ إضافة كلمة يدوياً",
    enterWord: "أدخل الكلمة من فضلك:",
    enterTranslation: "أدخل الترجمة من فضلك:",
    enterDefinition: "أدخل التعريف من فضلك:",
    wordAdded: "✅ تم إضافة الكلمة بنجاح!",
    topicExtraction: "📝 استخراج من موضوع",
    enterTopic: "📝 ما الموضوع الذي تريد إضافة مفردات له؟",
    
    // Settings
    settingsMenu: "⚙️ قائمة الإعدادات",
    selectLanguage: "🌍 اختيار اللغة",
    sourceLanguage: "📖 لغة المصدر",
    targetLanguage: "🎯 اللغة المستهدفة",
    interfaceLanguage: "🌐 لغة الواجهة",
    languageUpdated: "✅ تم تحديث اللغة بنجاح!",
    reminderSettings: "⏰ إعدادات التذكير",
    
    // Support
    supportMenu: "🆘 قائمة الدعم",
    createTicket: "🎫 إنشاء تذكرة دعم",
    viewMessages: "📬 عرض الرسائل",
    contactInfo: "📞 معلومات الاتصال",
    faq: "❓ الأسئلة الشائعة",
    ticketSubject: "أدخل الموضوع من فضلك:",
    ticketMessage: "اوصف مشكلتك من فضلك:",
    ticketPriority: "اختر مستوى الأولوية:",
    ticketCreated: "✅ تم إنشاء تذكرة الدعم بنجاح!",
    
    // Progress and stats
    progressTitle: "📊 تقدم التعلم الخاص بك",
    totalCards: "إجمالي البطاقات",
    cardsToReview: "البطاقات للمراجعة",
    masteredCards: "البطاقات المتقنة",
    streakDays: "أيام الدراسة المتتالية",
    
    // Common buttons
    yes: "✅ نعم",
    no: "❌ لا",
    cancel: "❌ إلغاء",
    back: "🔙 رجوع",
    confirm: "✅ تأكيد",
    skip: "⏭️ تخطي",
    normal: "📋 عادي",
    urgent: "🚨 عاجل",
    
    // Error messages
    error: "❌ خطأ",
    tryAgain: "حاول مرة أخرى من فضلك.",
    invalidInput: "إدخال غير صحيح. حاول مرة أخرى من فضلك.",
    networkError: "خطأ في الشبكة. حاول لاحقاً من فضلك.",
    
    // Time and dates
    today: "اليوم",
    yesterday: "أمس",
    daysAgo: "أيام مضت",
    hoursAgo: "ساعات مضت",
    minutesAgo: "دقائق مضت",
    
    // Learning tips
    dailyTip: "💡 نصيحة يومية",
    leitnerTip: "🎯 نصيحة نظام لايتنر"
  },
  
  es: {
    // Welcome and onboarding
    welcome: "🎯 ¡Bienvenido al Bot de Aprendizaje Leitner!",
    welcomeBack: "🎯 ¡Bienvenido de nuevo!",
    registrationComplete: "✅ ¡Registro completo! Estás listo para empezar a aprender.",
    
    // Main menu and navigation
    mainMenu: "📚 Menú Principal",
    startStudy: "📚 Comenzar Estudio",
    addVocabulary: "➕ Añadir Vocabulario",
    myProgress: "📊 Mi Progreso",
    myWords: "🗂️ Mis Palabras",
    settings: "⚙️ Configuración",
    support: "🆘 Soporte",
    help: "❓ Ayuda",
    
    // Study session
    studySessionStart: "🎯 Iniciando sesión de estudio...",
    studySessionComplete: "🎉 ¡Sesión de estudio completada!",
    noCardsToReview: "📚 No hay tarjetas para revisar ahora. ¡Vuelve más tarde!",
    allCaughtUp: "🎉 **¡Todo al día!**\n\nHas revisado todas las tarjetas pendientes. ¡Excelente trabajo!",
    noVocabularyYet: "📚 **¿Listo para empezar a aprender?**\n\n¡Aún no has añadido vocabulario!\n\n• Usa /topic para generar vocabulario de cualquier tema\n• Usa /add para añadir palabras manualmente\n\n¡El sistema Leitner te ayudará a dominar nuevas palabras de manera eficiente! 🚀",
    readyToStartLearning: "¿Listo para empezar a aprender?",
    studySessionStarted: "🚀 **¡Sesión de Estudio Iniciada!**",
    howLeitnerWorks: "🎯 **Cómo funciona el Sistema Leitner:**\n• Respuestas correctas → Pasar a la siguiente caja (revisar menos)\n• Respuestas incorrectas → Volver a la Caja 1 (revisar más)\n• ¡Domina palabras llegando a la Caja 5!",
    proTip: "💡 **Consejo profesional:** Puedes escribir tus respuestas o usar los botones. ¡Comencemos!",
    correctAnswer: "✅ ¡Correcto!",
    incorrectAnswer: "❌ ¡Incorrecto!",
    showAnswer: "👁️ Mostrar Respuesta",
    showMeaning: "💡 Mostrar Significado",
    iKnow: "✅ Lo Sé",
    iDontKnow: "❌ No Lo Sé",
    nextCard: "➡️ Siguiente Tarjeta",
    endSession: "🏁 Terminar Sesión",
    continueStudy: "📚 Continuar Estudio",
    
    // Help
    helpMessage: `📚 **Comandos del Bot de Aprendizaje Leitner:**

🎯 **Comandos de Aprendizaje:**
/study - Comenzar a revisar tus tarjetas de estudio
/topic - Generar vocabulario de un tema
/add - Añadir una palabra manualmente

📊 **Progreso y Estadísticas:**
/stats - Ver tus estadísticas de aprendizaje
/mywords - Ver tu vocabulario
/mytopics - Ver tus temas

⚙️ **Configuración:**
/settings - Configurar idiomas y recordatorios

🆘 **Soporte y Ayuda:**
/help - Mostrar este mensaje de ayuda
/support - Contactar equipo de soporte
/contact - Obtener información de contacto

💡 **Consejos:**
• Estudia regularmente para mejores resultados
• Las palabras se mueven a través de 5 cajas según tu rendimiento
• Las palabras dominadas se revisan con menor frecuencia

Elige una acción abajo:`,
    
    // Word management
    addWordManually: "✏️ Añadir Palabra Manualmente",
    enterWord: "Por favor, introduce la palabra:",
    enterTranslation: "Por favor, introduce la traducción:",
    enterDefinition: "Por favor, introduce la definición:",
    wordAdded: "✅ ¡Palabra añadida exitosamente!",
    topicExtraction: "📝 Extraer de Tema",
    enterTopic: "📝 ¿De qué tema quieres añadir vocabulario?",
    
    // Settings
    settingsMenu: "⚙️ Menú de Configuración",
    selectLanguage: "🌍 Seleccionar Idioma",
    sourceLanguage: "📖 Idioma de Origen",
    targetLanguage: "🎯 Idioma Objetivo",
    interfaceLanguage: "🌐 Idioma de la Interfaz",
    languageUpdated: "✅ ¡Idioma actualizado exitosamente!",
    reminderSettings: "⏰ Configuración de Recordatorios",
    
    // Support
    supportMenu: "🆘 Menú de Soporte",
    createTicket: "🎫 Crear Ticket de Soporte",
    viewMessages: "📬 Ver Mensajes",
    contactInfo: "📞 Información de Contacto",
    faq: "❓ Preguntas Frecuentes",
    ticketSubject: "Por favor, introduce el asunto:",
    ticketMessage: "Por favor, describe tu problema:",
    ticketPriority: "Selecciona el nivel de prioridad:",
    ticketCreated: "✅ ¡Ticket de soporte creado exitosamente!",
    
    // Progress and stats
    progressTitle: "📊 Tu Progreso de Aprendizaje",
    totalCards: "Total de Tarjetas",
    cardsToReview: "Tarjetas para Revisar",
    masteredCards: "Tarjetas Dominadas",
    streakDays: "Racha de Estudio",
    
    // Common buttons
    yes: "✅ Sí",
    no: "❌ No",
    cancel: "❌ Cancelar",
    back: "🔙 Atrás",
    confirm: "✅ Confirmar",
    skip: "⏭️ Saltar",
    normal: "📋 Normal",
    urgent: "🚨 Urgente",
    
    // Error messages
    error: "❌ Error",
    tryAgain: "Por favor, inténtalo de nuevo.",
    invalidInput: "Entrada inválida. Por favor, inténtalo de nuevo.",
    networkError: "Error de red. Por favor, inténtalo más tarde.",
    
    // Time and dates
    today: "hoy",
    yesterday: "ayer",
    daysAgo: "días atrás",
    hoursAgo: "horas atrás",
    minutesAgo: "minutos atrás",
    
    // Learning tips
    dailyTip: "💡 Consejo Diario",
    leitnerTip: "🎯 Consejo del Sistema Leitner"
  },

  ru: {
    // Welcome and onboarding
    welcome: "🎯 Добро пожаловать в Leitner Learning Bot!",
    welcomeBack: "🎯 С возвращением!",
    registrationComplete: "✅ Регистрация завершена! Вы готовы начать обучение.",
    
    // Main menu and navigation
    mainMenu: "📚 Главное меню",
    startStudy: "📚 Начать изучение",
    addVocabulary: "➕ Добавить словарь",
    myProgress: "📊 Мой прогресс",
    myWords: "🗂️ Мои слова",
    settings: "⚙️ Настройки",
    support: "🆘 Поддержка",
    help: "❓ Помощь",
    
    // Study session
    studySessionStart: "🎯 Начинаем сессию изучения...",
    studySessionComplete: "🎉 Сессия изучения завершена!",
    noCardsToReview: "📚 Сейчас нет карточек для повторения. Возвращайтесь позже!",
    allCaughtUp: "🎉 **Всё выучено!**\n\nВы просмотрели все карточки к изучению. Отличная работа!",
    noVocabularyYet: "📚 **Готовы начать обучение?**\n\nВы ещё не добавили словарь!\n\n• Используйте /topic для генерации словаря по теме\n• Используйте /add для ручного добавления слов\n\nСистема Лейтнера поможет вам эффективно освоить новые слова! 🚀",
    readyToStartLearning: "Готовы начать обучение?",
    studySessionStarted: "🚀 **Сессия изучения началась!**",
    howLeitnerWorks: "🎯 **Как работает система Лейтнера:**\n• Правильные ответы → Переход в следующий ящик (реже повторения)\n• Неправильные ответы → Возврат в Ящик 1 (чаще повторения)\n• Освойте слова, достигнув Ящика 5!",
    proTip: "💡 **Профессиональный совет:** Вы можете печатать ответы или использовать кнопки. Давайте начнём!",
    correctAnswer: "✅ Правильно!",
    incorrectAnswer: "❌ Неправильно!",
    showAnswer: "👁️ Показать ответ",
    showMeaning: "💡 Показать значение",
    iKnow: "✅ Знаю",
    iDontKnow: "❌ Не знаю",
    nextCard: "➡️ Следующая карточка",
    endSession: "🏁 Завершить сессию",
    continueStudy: "📚 Продолжить изучение",
    
    // Help
    helpMessage: `📚 **Команды Leitner Learning Bot:**

🎯 **Команды обучения:**
/study - Начать повторение флешкарт
/topic - Генерировать словарь по теме
/add - Добавить слово вручную

📊 **Прогресс и статистика:**
/stats - Посмотреть статистику обучения
/mywords - Посмотреть словарь
/mytopics - Посмотреть темы

⚙️ **Настройки:**
/settings - Настроить языки и напоминания

🆘 **Поддержка и помощь:**
/help - Показать это сообщение помощи
/support - Связаться с командой поддержки
/contact - Получить контактную информацию

💡 **Советы:**
• Изучайте регулярно для лучших результатов
• Слова перемещаются по 5 ящикам в зависимости от вашей успеваемости
• Освоенные слова повторяются реже

Выберите действие ниже:`,
    
    // Word management
    addWordManually: "✏️ Добавить слово вручную",
    enterWord: "Пожалуйста, введите слово:",
    enterTranslation: "Пожалуйста, введите перевод:",
    enterDefinition: "Пожалуйста, введите определение:",
    wordAdded: "✅ Слово успешно добавлено!",
    topicExtraction: "📝 Извлечь из темы",
    enterTopic: "📝 По какой теме вы хотите добавить словарь?",
    
    // Settings
    settingsMenu: "⚙️ Меню настроек",
    selectLanguage: "🌍 Выбрать язык",
    sourceLanguage: "📖 Исходный язык",
    targetLanguage: "🎯 Целевой язык", 
    interfaceLanguage: "🌐 Язык интерфейса",
    languageUpdated: "✅ Язык обновлён!",
    reminderSettings: "⏰ Настройки напоминаний",
    
    // Support
    supportMenu: "🆘 Меню поддержки",
    createTicket: "🎫 Создать тикет",
    viewMessages: "💬 Посмотреть сообщения",
    contactInfo: "📧 Контактная информация",
    faq: "❓ Часто задаваемые вопросы",
    ticketSubject: "Тема тикета:",
    ticketMessage: "Сообщение тикета:",
    ticketPriority: "Приоритет тикета:",
    ticketCreated: "✅ Тикет создан!",
    
    // Progress and stats
    progressTitle: "📊 Ваш прогресс",
    totalCards: "Всего карточек",
    cardsToReview: "Карточек к изучению",
    masteredCards: "Освоенных карточек",
    streakDays: "Дней подряд",
    
    // Common buttons
    yes: "Да",
    no: "Нет",
    cancel: "Отмена",
    back: "Назад",
    confirm: "Подтвердить",
    skip: "Пропустить",
    normal: "📋 Обычный",
    urgent: "🚨 Срочный",
    
    // Error messages
    error: "❌ Ошибка",
    tryAgain: "Пожалуйста, попробуйте ещё раз.",
    invalidInput: "Неверный ввод. Пожалуйста, попробуйте ещё раз.",
    networkError: "Ошибка сети. Пожалуйста, попробуйте позже.",
    
    // Time and dates
    today: "сегодня",
    yesterday: "вчера",
    daysAgo: "дней назад",
    hoursAgo: "часов назад",
    minutesAgo: "минут назад",
    
    // Learning tips
    dailyTip: "💡 Совет дня",
    leitnerTip: "🎯 Совет системы Лейтнера"
  }
};

export class LanguageManager {
  private static instance: LanguageManager;
  private defaultLanguage = 'en';

  private constructor() {}

  static getInstance(): LanguageManager {
    if (!LanguageManager.instance) {
      LanguageManager.instance = new LanguageManager();
    }
    return LanguageManager.instance;
  }

  getText(key: keyof BotTexts, userLanguage?: string): string {
    const language = userLanguage || this.defaultLanguage;
    const texts = TEXTS[language] || TEXTS[this.defaultLanguage];
    return texts[key] || TEXTS[this.defaultLanguage][key] || key;
  }

  getTexts(userLanguage?: string): BotTexts {
    const language = userLanguage || this.defaultLanguage;
    return TEXTS[language] || TEXTS[this.defaultLanguage];
  }

  isLanguageSupported(language: string): boolean {
    return language in SUPPORTED_LANGUAGES;
  }

  getSupportedLanguages(): Record<string, string> {
    return SUPPORTED_LANGUAGES;
  }

  // Helper method to create language selection keyboard
  createLanguageKeyboard(userLanguage?: string): TelegramInlineKeyboard {
    const texts = this.getTexts(userLanguage);
    const languages = Object.entries(SUPPORTED_LANGUAGES);
    const buttons: { text: string; callback_data: string; }[][] = [];

    // Create rows of 2 buttons each
    for (let i = 0; i < languages.length; i += 2) {
      const row = languages.slice(i, i + 2).map(([code, name]) => ({
        text: name,
        callback_data: `set_interface_lang:${code}`
      }));
      buttons.push(row);
    }

    // Add back button
    buttons.push([{ 
      text: texts.back, 
      callback_data: 'settings_menu' 
    }]);

    return { inline_keyboard: buttons };
  }

  // Helper method to create yes/no keyboard
  createYesNoKeyboard(yesCallback: string, noCallback: string, userLanguage?: string): TelegramInlineKeyboard {
    const texts = this.getTexts(userLanguage);
    return {
      inline_keyboard: [
        [
          { text: texts.yes, callback_data: yesCallback },
          { text: texts.no, callback_data: noCallback }
        ]
      ]
    };
  }

  // Helper method to create priority keyboard
  createPriorityKeyboard(userLanguage?: string): TelegramInlineKeyboard {
    const texts = this.getTexts(userLanguage);
    return {
      inline_keyboard: [
        [
          { text: texts.normal, callback_data: 'priority_medium' },
          { text: texts.urgent, callback_data: 'priority_urgent' }
        ],
        [
          { text: texts.back, callback_data: 'support_menu' }
        ]
      ]
    };
  }

  // Format relative time
  formatRelativeTime(date: Date, userLanguage?: string): string {
    const texts = this.getTexts(userLanguage);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      return `${diffDays} ${texts.daysAgo}`;
    } else if (diffDays === 1) {
      return texts.yesterday;
    } else if (diffHours > 0) {
      return `${diffHours} ${texts.hoursAgo}`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} ${texts.minutesAgo}`;
    } else {
      return texts.today;
    }
  }
}

export const languageManager = LanguageManager.getInstance();

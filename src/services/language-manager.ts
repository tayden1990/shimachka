import { TelegramInlineKeyboard, LANGUAGES } from '../types/index';

export interface BotTexts {
  // Welcome and onboarding
  welcome: string;
  welcomeBack: string;
  registrationComplete: string;
  readyToContinue: string;
  quickStart: string;
  useTopicToGenerate: string;
  useAddToManual: string;
  useStudyToReview: string;
  useSettingsToConfig: string;
  supportMultipleLanguages: string;
  chooseOptionBelow: string;
  
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
  cancelled: string;
  pleaseComplete: string;
  completeRegistrationFirst: string;
  useStartToBegin: string;
  pleaseSelectValid: string;
  noVocabularyStats: string;
  getStarted: string;
  startLearningToday: string;
  pleaseUseButtons: string;
  readyToStudy: string;
  useStudyToContinue: string;
  allCaughtUpAddMore: string;
  
  // Daily reminder messages
  dailyReminder: string;
  cardsReadyForReview: string;
  useStudyToStart: string;
  
  // Review session messages
  pleaseUseButtonsToRespond: string;
  typeStudyToStartNew: string;
  pleaseSelectValidNumber: string;
  cancelledUseTopic: string;
  supportTicketCancelled: string;
  useSupportToStartNew: string;
  operationCancelled: string;
  allCaughtUpCheckLater: string;
  
  // Registration flow messages
  welcomeToBot: string;
  beforeWeStart: string;
  selectPreferredLanguage: string;
  chooseLanguageBelow: string;
  whatsYourFullName: string;
  pleaseTypeNameBelow: string;
  niceToMeet: string;
  whatsYourEmail: string;
  emailWillHelp: string;
  sendReminders: string;
  keepProgressSafe: string;
  personalizedInsights: string;
  pleaseTypeEmailBelow: string;
  pleaseConfirmInfo: string;
  nameLabel: string;
  emailLabel: string;
  isInfoCorrect: string;
  confirmButton: string;
  editButton: string;
  
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

// Interface languages with native names for display
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
    readyToContinue: "Ready to continue your vocabulary learning journey with the Leitner spaced repetition system?",
    quickStart: "🚀 **Quick Start:**",
    useTopicToGenerate: "• Use /topic to generate vocabulary from any topic",
    useAddToManual: "• Use /add to manually add words",
    useStudyToReview: "• Use /study to review your flashcards",
    useSettingsToConfig: "• Use /settings to configure languages and reminders",
    supportMultipleLanguages: "🌍 I support multiple languages and can extract vocabulary from any topic you're interested in!",
    chooseOptionBelow: "Choose an option below to get started:",
    
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
    cancelled: "❌ Cancelled. Use /topic to try again.",
    pleaseComplete: "👤 Please complete your registration first before using other features.",
    completeRegistrationFirst: "👤 Please complete your registration first before using other features.",
    useStartToBegin: "Use /start to begin registration.",
    pleaseSelectValid: "Please select a valid number between 1 and 100.",
    noVocabularyStats: "📊 **Your Learning Statistics**\n\n📚 No vocabulary added yet!",
    getStarted: "🚀 **Get Started:**",
    startLearningToday: "Start your learning journey today! 💪",
    pleaseUseButtons: "Please use the buttons to respond during review sessions, or type /study to start a new session.",
    readyToStudy: "📚 Ready to study?",
    useStudyToContinue: "Use /study to continue learning!",
    allCaughtUpAddMore: "🎉 All caught up! Add more vocabulary with /topic",
    
    // Daily reminder messages
    dailyReminder: "🔔 Daily Reminder",
    cardsReadyForReview: "You have {count} card(s) ready for review!",
    useStudyToStart: "Use /study to start.",
    
    // Review session messages
    pleaseUseButtonsToRespond: "Please use the buttons to respond during review sessions, or type /study to start a new session.",
    typeStudyToStartNew: "type /study to start a new session.",
    pleaseSelectValidNumber: "Please select a valid number between 1 and 100.",
    cancelledUseTopic: "❌ Cancelled. Use /topic to try again.",
    supportTicketCancelled: "❌ Support ticket cancelled. Use /support to start a new one.",
    useSupportToStartNew: "Use /support to start a new one.",
    operationCancelled: "Operation cancelled.",
    allCaughtUpCheckLater: "🎉 All caught up! Check back later for more reviews.",
    
    // Registration flow messages
    welcomeToBot: "🎯 **Welcome to the Leitner Learning Bot!**",
    beforeWeStart: "Before we start your vocabulary learning journey, let's set up your preferences.",
    selectPreferredLanguage: "🌍 **Select your preferred interface language:**",
    chooseLanguageBelow: "Choose your language from the options below:",
    whatsYourFullName: "👤 **What's your full name?**",
    pleaseTypeNameBelow: "Please type your name below:",
    niceToMeet: "Nice to meet you",
    whatsYourEmail: "📧 **What's your email address?**",
    emailWillHelp: "This will help us:",
    sendReminders: "• Send you learning reminders (optional)",
    keepProgressSafe: "• Keep your progress safe",
    personalizedInsights: "• Provide personalized insights",
    pleaseTypeEmailBelow: "Please type your email below:",
    pleaseConfirmInfo: "📋 **Please confirm your information:**",
    nameLabel: "👤 **Name:**",
    emailLabel: "📧 **Email:**",
    isInfoCorrect: "Is this information correct?",
    confirmButton: "✅ Confirm",
    editButton: "✏️ Edit",
    
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
    readyToContinue: "آماده ادامه سفر یادگیری واژگان با سیستم تکرار فاصله‌دار لایتنر؟",
    quickStart: "🚀 **شروع سریع:**",
    useTopicToGenerate: "• از /topic برای تولید واژگان از هر موضوعی استفاده کنید",
    useAddToManual: "• از /add برای افزودن دستی کلمات استفاده کنید",
    useStudyToReview: "• از /study برای مرور فلش کارت‌هایتان استفاده کنید",
    useSettingsToConfig: "• از /settings برای تنظیم زبان‌ها و یادآوری‌ها استفاده کنید",
    supportMultipleLanguages: "🌍 من از زبان‌های متعدد پشتیبانی می‌کنم و می‌توانم از هر موضوعی که علاقه‌مند هستید واژگان استخراج کنم!",
    chooseOptionBelow: "برای شروع، گزینه‌ای را در زیر انتخاب کنید:",
    
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
    cancelled: "❌ لغو شد. از /topic برای تلاش مجدد استفاده کنید.",
    pleaseComplete: "👤 لطفاً ابتدا ثبت نام خود را تکمیل کنید قبل از استفاده از سایر ویژگی‌ها.",
    completeRegistrationFirst: "👤 لطفاً ابتدا ثبت نام خود را تکمیل کنید قبل از استفاده از سایر ویژگی‌ها.",
    useStartToBegin: "از /start برای شروع ثبت نام استفاده کنید.",
    pleaseSelectValid: "لطفاً عددی معتبر بین ۱ تا ۱۰۰ انتخاب کنید.",
    noVocabularyStats: "📊 **آمار یادگیری شما**\n\n📚 هنوز هیچ واژگانی اضافه نشده!",
    getStarted: "🚀 **شروع کنید:**",
    startLearningToday: "امروز سفر یادگیری خود را شروع کنید! 💪",
    pleaseUseButtons: "لطفاً در طول جلسات مرور از دکمه‌ها استفاده کنید، یا برای شروع جلسه جدید /study تایپ کنید.",
    readyToStudy: "📚 آماده مطالعه؟",
    useStudyToContinue: "از /study برای ادامه یادگیری استفاده کنید!",
    allCaughtUpAddMore: "🎉 همه چیز انجام شد! با /topic واژگان بیشتری اضافه کنید",
    
    // Daily reminder messages
    dailyReminder: "🔔 یادآوری روزانه",
    cardsReadyForReview: "شما {count} کارت آماده برای مرور دارید!",
    useStudyToStart: "از /study برای شروع استفاده کنید.",
    
    // Review session messages
    pleaseUseButtonsToRespond: "لطفاً در طول جلسات مرور از دکمه‌ها استفاده کنید، یا برای شروع جلسه جدید /study تایپ کنید.",
    typeStudyToStartNew: "برای شروع جلسه جدید /study تایپ کنید.",
    pleaseSelectValidNumber: "لطفاً عددی معتبر بین ۱ تا ۱۰۰ انتخاب کنید.",
    cancelledUseTopic: "❌ لغو شد. از /topic برای تلاش مجدد استفاده کنید.",
    supportTicketCancelled: "❌ تیکت پشتیبانی لغو شد. از /support برای شروع تیکت جدید استفاده کنید.",
    useSupportToStartNew: "از /support برای شروع تیکت جدید استفاده کنید.",
    operationCancelled: "عملیات لغو شد.",
    allCaughtUpCheckLater: "🎉 همه چیز انجام شد! بعداً برای مرورهای بیشتر بررسی کنید.",
    
    // Registration flow messages
    welcomeToBot: "🎯 **به ربات یادگیری لایتنر خوش آمدید!**",
    beforeWeStart: "قبل از شروع سفر یادگیری واژگان، بیایید تنظیمات شما را انجام دهیم.",
    selectPreferredLanguage: "🌍 **زبان مورد نظر خود را انتخاب کنید:**",
    chooseLanguageBelow: "زبان خود را از گزینه‌های زیر انتخاب کنید:",
    whatsYourFullName: "👤 **نام کامل شما چیست؟**",
    pleaseTypeNameBelow: "لطفاً نام خود را در زیر تایپ کنید:",
    niceToMeet: "از آشنایی با شما خوشحالم",
    whatsYourEmail: "📧 **آدرس ایمیل شما چیست؟**",
    emailWillHelp: "این به ما کمک می‌کند:",
    sendReminders: "• یادآورهای یادگیری بفرستیم (اختیاری)",
    keepProgressSafe: "• پیشرفت شما را ایمن نگه داریم",
    personalizedInsights: "• بینش‌های شخصی‌سازی شده ارائه دهیم",
    pleaseTypeEmailBelow: "لطفاً ایمیل خود را در زیر تایپ کنید:",
    pleaseConfirmInfo: "📋 **لطفاً اطلاعات خود را تأیید کنید:**",
    nameLabel: "👤 **نام:**",
    emailLabel: "📧 **ایمیل:**",
    isInfoCorrect: "آیا این اطلاعات درست است؟",
    confirmButton: "✅ تأیید",
    editButton: "✏️ ویرایش",
    
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
    readyToContinue: "مستعد لمتابعة رحلة تعلم المفردات مع نظام التكرار المتباعد لايتنر؟",
    quickStart: "🚀 **بداية سريعة:**",
    useTopicToGenerate: "• استخدم /topic لتوليد مفردات من أي موضوع",
    useAddToManual: "• استخدم /add لإضافة كلمات يدوياً",
    useStudyToReview: "• استخدم /study لمراجعة بطاقاتك التعليمية",
    useSettingsToConfig: "• استخدم /settings لتكوين اللغات والتذكيرات",
    supportMultipleLanguages: "🌍 أدعم لغات متعددة ويمكنني استخراج مفردات من أي موضوع تهتم به!",
    chooseOptionBelow: "اختر خياراً أدناه للبدء:",
    
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
    cancelled: "❌ تم الإلغاء. استخدم /topic للمحاولة مرة أخرى.",
    pleaseComplete: "👤 يرجى إكمال التسجيل أولاً قبل استخدام الميزات الأخرى.",
    completeRegistrationFirst: "👤 يرجى إكمال التسجيل أولاً قبل استخدام الميزات الأخرى.",
    useStartToBegin: "استخدم /start لبدء التسجيل.",
    pleaseSelectValid: "يرجى اختيار رقم صالح بين ١ و ١٠٠.",
    noVocabularyStats: "📊 **إحصائيات التعلم الخاصة بك**\n\n📚 لم تتم إضافة مفردات بعد!",
    getStarted: "🚀 **ابدأ:**",
    startLearningToday: "ابدأ رحلة التعلم اليوم! 💪",
    pleaseUseButtons: "يرجى استخدام الأزرار للرد أثناء جلسات المراجعة، أو اكتب /study لبدء جلسة جديدة.",
    readyToStudy: "📚 مستعد للدراسة؟",
    useStudyToContinue: "استخدم /study لمتابعة التعلم!",
    allCaughtUpAddMore: "🎉 كل شيء منجز! أضف المزيد من المفردات باستخدام /topic",
    
    // Daily reminder messages
    dailyReminder: "🔔 تذكير يومي",
    cardsReadyForReview: "لديك {count} بطاقة جاهزة للمراجعة!",
    useStudyToStart: "استخدم /study للبدء.",
    
    // Review session messages
    pleaseUseButtonsToRespond: "يرجى استخدام الأزرار للرد أثناء جلسات المراجعة، أو اكتب /study لبدء جلسة جديدة.",
    typeStudyToStartNew: "اكتب /study لبدء جلسة جديدة.",
    pleaseSelectValidNumber: "يرجى اختيار رقم صالح بين ١ و ١٠٠.",
    cancelledUseTopic: "❌ تم الإلغاء. استخدم /topic للمحاولة مرة أخرى.",
    supportTicketCancelled: "❌ تم إلغاء تذكرة الدعم. استخدم /support لبدء تذكرة جديدة.",
    useSupportToStartNew: "استخدم /support لبدء تذكرة جديدة.",
    operationCancelled: "تم إلغاء العملية.",
    allCaughtUpCheckLater: "🎉 كل شيء منجز! راجع لاحقاً للمزيد من المراجعات.",
    
    // Registration flow messages
    welcomeToBot: "🎯 **مرحباً بك في بوت التعلم لايتنر!**",
    beforeWeStart: "قبل أن نبدأ رحلة تعلم المفردات، دعنا نقوم بإعداد تفضيلاتك.",
    selectPreferredLanguage: "🌍 **اختر لغة الواجهة المفضلة لديك:**",
    chooseLanguageBelow: "اختر لغتك من الخيارات أدناه:",
    whatsYourFullName: "👤 **ما هو اسمك الكامل؟**",
    pleaseTypeNameBelow: "يرجى كتابة اسمك أدناه:",
    niceToMeet: "سعيد بلقائك",
    whatsYourEmail: "📧 **ما هو عنوان بريدك الإلكتروني؟**",
    emailWillHelp: "سيساعدنا هذا في:",
    sendReminders: "• إرسال تذكيرات التعلم (اختياري)",
    keepProgressSafe: "• الحفاظ على تقدمك آمناً",
    personalizedInsights: "• تقديم رؤى شخصية",
    pleaseTypeEmailBelow: "يرجى كتابة بريدك الإلكتروني أدناه:",
    pleaseConfirmInfo: "📋 **يرجى تأكيد معلوماتك:**",
    nameLabel: "👤 **الاسم:**",
    emailLabel: "📧 **البريد الإلكتروني:**",
    isInfoCorrect: "هل هذه المعلومات صحيحة؟",
    confirmButton: "✅ تأكيد",
    editButton: "✏️ تعديل",
    
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
    readyToContinue: "¿Listo para continuar tu viaje de aprendizaje de vocabulario con el sistema de repetición espaciada Leitner?",
    quickStart: "🚀 **Inicio Rápido:**",
    useTopicToGenerate: "• Usa /topic para generar vocabulario de cualquier tema",
    useAddToManual: "• Usa /add para añadir palabras manualmente",
    useStudyToReview: "• Usa /study para revisar tus tarjetas de estudio",
    useSettingsToConfig: "• Usa /settings para configurar idiomas y recordatorios",
    supportMultipleLanguages: "🌍 ¡Apoyo múltiples idiomas y puedo extraer vocabulario de cualquier tema que te interese!",
    chooseOptionBelow: "Elige una opción abajo para comenzar:",
    
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
    cancelled: "❌ Cancelado. Usa /topic para intentar de nuevo.",
    pleaseComplete: "👤 Por favor, completa tu registro primero antes de usar otras características.",
    completeRegistrationFirst: "👤 Por favor, completa tu registro primero antes de usar otras características.",
    useStartToBegin: "Usa /start para comenzar el registro.",
    pleaseSelectValid: "Por favor, selecciona un número válido entre 1 y 100.",
    noVocabularyStats: "📊 **Tus Estadísticas de Aprendizaje**\n\n📚 ¡Aún no se ha añadido vocabulario!",
    getStarted: "🚀 **Comenzar:**",
    startLearningToday: "¡Comienza tu viaje de aprendizaje hoy! 💪",
    pleaseUseButtons: "Por favor, usa los botones para responder durante las sesiones de revisión, o escribe /study para comenzar una nueva sesión.",
    readyToStudy: "📚 ¿Listo para estudiar?",
    useStudyToContinue: "¡Usa /study para continuar aprendiendo!",
    allCaughtUpAddMore: "🎉 ¡Todo al día! Añade más vocabulario con /topic",
    
    // Daily reminder messages
    dailyReminder: "🔔 Recordatorio Diario",
    cardsReadyForReview: "¡Tienes {count} tarjeta(s) lista(s) para revisar!",
    useStudyToStart: "Usa /study para comenzar.",
    
    // Review session messages
    pleaseUseButtonsToRespond: "Por favor, usa los botones para responder durante las sesiones de revisión, o escribe /study para comenzar una nueva sesión.",
    typeStudyToStartNew: "escribe /study para comenzar una nueva sesión.",
    pleaseSelectValidNumber: "Por favor, selecciona un número válido entre 1 y 100.",
    cancelledUseTopic: "❌ Cancelado. Usa /topic para intentar de nuevo.",
    supportTicketCancelled: "❌ Ticket de soporte cancelado. Usa /support para comenzar uno nuevo.",
    useSupportToStartNew: "Usa /support para comenzar uno nuevo.",
    operationCancelled: "Operación cancelada.",
    allCaughtUpCheckLater: "🎉 ¡Todo al día! Vuelve más tarde para más revisiones.",
    
    // Registration flow messages
    welcomeToBot: "🎯 **¡Bienvenido al Bot de Aprendizaje Leitner!**",
    beforeWeStart: "Antes de comenzar tu viaje de aprendizaje de vocabulario, vamos a configurar tus preferencias.",
    selectPreferredLanguage: "🌍 **Selecciona tu idioma de interfaz preferido:**",
    chooseLanguageBelow: "Elige tu idioma de las opciones de abajo:",
    whatsYourFullName: "👤 **¿Cuál es tu nombre completo?**",
    pleaseTypeNameBelow: "Por favor, escribe tu nombre abajo:",
    niceToMeet: "Mucho gusto conocerte",
    whatsYourEmail: "📧 **¿Cuál es tu dirección de correo electrónico?**",
    emailWillHelp: "Esto nos ayudará a:",
    sendReminders: "• Enviarte recordatorios de aprendizaje (opcional)",
    keepProgressSafe: "• Mantener tu progreso seguro",
    personalizedInsights: "• Proporcionar información personalizada",
    pleaseTypeEmailBelow: "Por favor, escribe tu correo electrónico abajo:",
    pleaseConfirmInfo: "📋 **Por favor, confirma tu información:**",
    nameLabel: "👤 **Nombre:**",
    emailLabel: "📧 **Correo electrónico:**",
    isInfoCorrect: "¿Es correcta esta información?",
    confirmButton: "✅ Confirmar",
    editButton: "✏️ Editar",
    
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
    readyToContinue: "Готовы продолжить ваше путешествие изучения словаря с системой интервального повторения Лейтнера?",
    quickStart: "🚀 **Быстрый старт:**",
    useTopicToGenerate: "• Используйте /topic для генерации словаря по любой теме",
    useAddToManual: "• Используйте /add для ручного добавления слов",
    useStudyToReview: "• Используйте /study для повторения ваших флешкарт",
    useSettingsToConfig: "• Используйте /settings для настройки языков и напоминаний",
    supportMultipleLanguages: "🌍 Я поддерживаю множество языков и могу извлекать словарь из любой интересующей вас темы!",
    chooseOptionBelow: "Выберите опцию ниже для начала:",
    
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
    cancelled: "❌ Отменено. Используйте /topic для повторной попытки.",
    pleaseComplete: "👤 Пожалуйста, сначала завершите регистрацию перед использованием других функций.",
    completeRegistrationFirst: "👤 Пожалуйста, сначала завершите регистрацию перед использованием других функций.",
    useStartToBegin: "Используйте /start для начала регистрации.",
    pleaseSelectValid: "Пожалуйста, выберите действительное число от 1 до 100.",
    noVocabularyStats: "📊 **Ваша статистика обучения**\n\n📚 Словарь ещё не добавлен!",
    getStarted: "🚀 **Начать:**",
    startLearningToday: "Начните своё путешествие обучения сегодня! 💪",
    pleaseUseButtons: "Пожалуйста, используйте кнопки для ответов во время сессий повторения, или введите /study для начала новой сессии.",
    readyToStudy: "📚 Готовы к изучению?",
    useStudyToContinue: "Используйте /study для продолжения обучения!",
    allCaughtUpAddMore: "🎉 Всё изучено! Добавьте больше словаря с помощью /topic",
    
    // Daily reminder messages
    dailyReminder: "🔔 Ежедневное напоминание",
    cardsReadyForReview: "У вас {count} карточка(и) готова(ы) для повторения!",
    useStudyToStart: "Используйте /study для начала.",
    
    // Review session messages
    pleaseUseButtonsToRespond: "Пожалуйста, используйте кнопки для ответов во время сессий повторения, или введите /study для начала новой сессии.",
    typeStudyToStartNew: "введите /study для начала новой сессии.",
    pleaseSelectValidNumber: "Пожалуйста, выберите действительное число от 1 до 100.",
    cancelledUseTopic: "❌ Отменено. Используйте /topic для повторной попытки.",
    supportTicketCancelled: "❌ Запрос в поддержку отменён. Используйте /support для создания нового.",
    useSupportToStartNew: "Используйте /support для создания нового.",
    operationCancelled: "Операция отменена.",
    allCaughtUpCheckLater: "🎉 Всё изучено! Проверьте позже для новых повторений.",
    
    // Registration flow messages
    welcomeToBot: "🎯 **Добро пожаловать в Leitner Learning Bot!**",
    beforeWeStart: "Прежде чем начать ваше путешествие изучения словаря, давайте настроим ваши предпочтения.",
    selectPreferredLanguage: "🌍 **Выберите предпочитаемый язык интерфейса:**",
    chooseLanguageBelow: "Выберите ваш язык из вариантов ниже:",
    whatsYourFullName: "👤 **Как вас зовут?**",
    pleaseTypeNameBelow: "Пожалуйста, введите ваше имя ниже:",
    niceToMeet: "Приятно познакомиться",
    whatsYourEmail: "📧 **Какой ваш адрес электронной почты?**",
    emailWillHelp: "Это поможет нам:",
    sendReminders: "• Отправлять напоминания об обучении (по желанию)",
    keepProgressSafe: "• Сохранять ваш прогресс в безопасности",
    personalizedInsights: "• Предоставлять персонализированную аналитику",
    pleaseTypeEmailBelow: "Пожалуйста, введите ваш email ниже:",
    pleaseConfirmInfo: "📋 **Пожалуйста, подтвердите вашу информацию:**",
    nameLabel: "👤 **Имя:**",
    emailLabel: "📧 **Email:**",
    isInfoCorrect: "Правильна ли эта информация?",
    confirmButton: "✅ Подтвердить",
    editButton: "✏️ Редактировать",
    
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

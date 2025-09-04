import { UserManager } from '../services/user-manager';
import { WordExtractor } from '../services/word-extractor';
import { ScheduleManager } from '../services/schedule-manager';
import { languageManager } from '../services/language-manager';
import { 
  TelegramUpdate, 
  TelegramMessage, 
  TelegramCallbackQuery,
  TelegramInlineKeyboard,
  User,
  Card,
  LanguageCode
} from '../types';
import { ConversationStateManager } from '../services/conversation-state-manager';
import { AdminService } from '../services/admin-service';
import { AddTopicStep, ConversationState, ReviewConversationState, RegistrationConversationState } from '../types/conversation-state';

// 1. Add more languages including Persian (Farsi)
export const LANGUAGES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  ru: 'Russian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  tr: 'Turkish',
  ar: 'Arabic',
  fa: 'Persian (Farsi)',
  hi: 'Hindi',
  pt: 'Portuguese',
  pl: 'Polish',
  nl: 'Dutch',
  sv: 'Swedish',
  uk: 'Ukrainian',
  el: 'Greek',
  he: 'Hebrew'
  // Add more as needed
};

// Helper to build condensed inline keyboard (N per row)
function buildCondensedKeyboard<T extends { text: string; callback_data: string }>(buttons: T[], perRow = 3) {
  const rows: T[][] = [];
  for (let i = 0; i < buttons.length; i += perRow) {
    rows.push(buttons.slice(i, i + perRow));
  }
  return rows;
}

export class LeitnerBot {
  // Send daily reminders to all users (stub implementation)
  public async sendDailyReminders(): Promise<void> {
    // Example: iterate over all users and send reminders for due cards
    const users = await this.userManager.getAllUsers();
    for (const user of users) {
      const cardsToReview = await this.userManager.getCardsDueForReview(user.id);
      if (cardsToReview.length > 0) {
        const userLang = await this.getUserInterfaceLanguage(user.id);
        const texts = languageManager.getTexts(userLang);
        const message = `${texts.dailyReminder}\n${texts.cardsReadyForReview.replace('{count}', cardsToReview.length.toString())} ${texts.useStudyToStart}`;
        await this.sendMessage(user.id, message);
      }
    }
  }
  // --- Notification System ---
  async sendPendingNotifications(): Promise<void> {
    try {
      // This method would be called by a scheduled job to send pending notifications
      // For now, we rely on the notification system in AdminService
      console.log('Checking for pending notifications...');
    } catch (error) {
      console.error('Error sending pending notifications:', error);
    }
  }

  // --- Telegram sendMessage wrapper ---
  private async sendMessage(chatId: number, text: string, keyboard?: TelegramInlineKeyboard | any): Promise<void> {
    const url = `${this.baseUrl}/sendMessage`;
    const payload: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    };

    // Handle different keyboard types
    if (keyboard) {
      if (keyboard.inline_keyboard) {
        // Inline keyboard
        payload.reply_markup = keyboard;
      } else if (keyboard.reply_markup) {
        // Already wrapped in reply_markup
        payload.reply_markup = keyboard.reply_markup;
      } else if (keyboard.keyboard) {
        // Regular keyboard
        payload.reply_markup = keyboard;
      } else {
        // Fallback: assume it's an inline keyboard or complete payload
        payload.reply_markup = keyboard;
      }
    }

    try {
      console.log('Sending message with payload:', JSON.stringify(payload, null, 2));
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Telegram API error:', response.status, errorText);
        console.error('Failed payload:', JSON.stringify(payload, null, 2));
      } else {
        console.log('Message sent successfully');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }
  private baseUrl: string;
  private conversationStateManager: ConversationStateManager;
  private adminService: AdminService;

  constructor(
    private token: string,
    private userManager: UserManager,
    private wordExtractor: WordExtractor,
    private scheduleManager: ScheduleManager,
    kv: any // Accept any type for KVNamespace to avoid TS2345 errors
  ) {
    this.baseUrl = `https://api.telegram.org/bot${token}`;
    this.conversationStateManager = new ConversationStateManager(kv);
    this.adminService = new AdminService(kv);
  }

  async handleWebhook(request: Request): Promise<Response> {
    try {
      const update: TelegramUpdate = await request.json();
      console.log('Received update:', JSON.stringify(update));
      if (update.message) {
        await this.handleMessage(update.message);
      } else if (update.callback_query) {
        await this.handleCallbackQuery(update.callback_query);
      }
      return new Response('OK', { status: 200 });
    } catch (error) {
      console.error('Webhook error:', error);
      // Log request body for debugging
      try {
        const body = await request.text();
        console.error('Request body:', body);
      } catch (e) {}
      return new Response('Error', { status: 500 });
    }
  }

  // Helper method to get user's interface language
  private async getUserInterfaceLanguage(userId: number): Promise<string> {
    const user = await this.userManager.getUser(userId);
    return user?.interfaceLanguage || 'en';
  }

  private async handleMessage(message: TelegramMessage): Promise<void> {
    if (!message.from || !message.text) return;

    const userId = message.from.id;
    const chatId = message.chat.id;
    const text = message.text.trim();

    // Get or create user
    let user = await this.userManager.getUser(userId);
    if (!user) {
      user = await this.userManager.createUser({
        id: userId,
        username: message.from.username,
        firstName: message.from.first_name,
        language: message.from.language_code || 'en',
        interfaceLanguage: message.from.language_code || 'en',
        isRegistrationComplete: false
      });
      await this.startRegistrationFlow(chatId, userId);
      return;
    }

    // Check if registration is complete
    if (!user.isRegistrationComplete) {
      await this.handleRegistrationFlow(chatId, userId, text);
      return;
    }

    // Update last active time
    await this.userManager.updateUser(userId, { lastActiveAt: new Date().toISOString() });

    // Handle commands
    if (text.startsWith('/')) {
      const [cmd, ...args] = text.split(' ');
    await this.handleCommand(cmd, chatId, userId, args);
    } else {
      // Handle text input based on current context
      await this.handleTextInput(chatId, userId, text);
    }
  }

  // --- Stubs for missing methods ---
  private async handleTopicCommand(chatId: number, userId: number, args: string[]): Promise<void> {
    await this.sendMessage(chatId, 'Topic command not implemented yet.');
  }

  private async sendUserStatistics(chatId: number, userId: number): Promise<void> {
    const cards = await this.userManager.getUserCards(userId);
    const totalCards = cards.length;
    const userLang = await this.getUserInterfaceLanguage(userId);
    const texts = languageManager.getTexts(userLang);
    
    if (totalCards === 0) {
      await this.sendMessage(chatId, 
        `${texts.noVocabularyStats}\n\n${texts.getStarted}\n${texts.useTopicToGenerate}\n${texts.useAddToManual}\n\n${texts.startLearningToday}`
      );
      return;
    }

    // Calculate comprehensive statistics
    const boxCounts = [1,2,3,4,5].map(box => cards.filter(c => c.box === box).length);
    const totalReviews = cards.reduce((sum, card) => sum + card.reviewCount, 0);
    const totalCorrect = cards.reduce((sum, card) => sum + card.correctCount, 0);
    const overallAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;
    
    // Cards due today and upcoming
    const now = new Date();
    const cardsDue = cards.filter(card => new Date(card.nextReviewAt) <= now).length;
    const cardsTomorrow = cards.filter(card => {
      const reviewDate = new Date(card.nextReviewAt);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return reviewDate > now && reviewDate <= tomorrow;
    }).length;

    // Mastery statistics
    const masteredWords = boxCounts[4]; // Box 5
    const learningWords = boxCounts[0]; // Box 1
    const masteryPercentage = Math.round((masteredWords / totalCards) * 100);
    
    // Streak calculation (simplified)
    const recentCards = cards.filter(c => c.reviewCount > 0);
    const averageAccuracy = recentCards.length > 0 ? 
      Math.round(recentCards.reduce((sum, card) => sum + (card.correctCount / card.reviewCount), 0) / recentCards.length * 100) : 0;

    // Create visual progress bars for boxes
    const maxCount = Math.max(...boxCounts, 1);
    const progressBars = boxCounts.map((count, i) => {
      const filled = Math.round((count / maxCount) * 8);
      const empty = 8 - filled;
      const boxEmoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'][i];
      const percentage = Math.round((count / totalCards) * 100);
      return `${boxEmoji} ${'▓'.repeat(filled)}${'░'.repeat(empty)} ${count} (${percentage}%)`;
    });

    // Study streak (days with reviews)
    const studyDays = new Set(cards.filter(c => c.reviewCount > 0).map(c => c.updatedAt.split('T')[0])).size;

    const message = `📊 **Your Learning Statistics**

📚 **Vocabulary Overview:**
• Total Words: ${totalCards}
• Mastered: ${masteredWords} (${masteryPercentage}%)
• Learning: ${learningWords} words
• Study Days: ${studyDays} days

🎯 **Performance:**
• Overall Accuracy: ${overallAccuracy}% (${totalCorrect}/${totalReviews})
• Average Success Rate: ${averageAccuracy}%
• Total Reviews: ${totalReviews}

⏰ **Review Schedule:**
• Due Today: ${cardsDue} cards
• Due Tomorrow: ${cardsTomorrow} cards

📦 **Leitner Box Distribution:**
${progressBars.join('\n')}

🏆 **Achievements:**
${masteredWords >= 10 ? '🌟 Vocabulary Master (10+ mastered words)' : ''}
${overallAccuracy >= 80 ? '🎯 Sharp Shooter (80%+ accuracy)' : ''}
${studyDays >= 7 ? '🔥 Dedicated Learner (7+ study days)' : ''}
${totalReviews >= 50 ? '💪 Review Champion (50+ reviews)' : ''}

${cardsDue > 0 ? `${texts.readyToStudy} ${texts.useStudyToContinue}` : texts.allCaughtUpAddMore}`;

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: '📈 Detailed Progress', callback_data: 'detailed_stats' },
          { text: '🎯 Study Goals', callback_data: 'study_goals' }
        ],
        [
          { text: '📚 Study Now', callback_data: 'start_study' },
          { text: '➕ Add Words', callback_data: 'add_vocabulary' }
        ]
      ]
    };

    await this.sendMessage(chatId, message, keyboard);
  }

  private async answerCallbackQuery(callbackQueryId: string): Promise<void> {
    const url = `${this.baseUrl}/answerCallbackQuery`;
    const payload = {
      callback_query_id: callbackQueryId
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Telegram answerCallbackQuery error:', response.status, errorText);
      }
    } catch (error) {
      console.error('Failed to answer callback query:', error);
    }
  }


  // Send main menu with persistent keyboard

  // Show user's words (first 10 for now)

  // Show user's topics (first 10 for now)

  // Send main menu with persistent keyboard
  private async sendMainMenu(chatId: number): Promise<void> {
    const message = `📋 **Main Menu**

Choose what you'd like to do:

🎯 **Quick Actions:**`;

    // Inline keyboard for quick actions
    const inlineKeyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: '📚 Study', callback_data: 'start_study' },
          { text: '➕ Add Topic', callback_data: 'add_topic' },
          { text: '📊 Stats', callback_data: 'view_stats' }
        ],
        [
          { text: '🗂️ My Words', callback_data: 'show_words' },
          { text: '⚙️ Settings', callback_data: 'open_settings' }
        ],
        [
          { text: '❓ Help', callback_data: 'show_help' }
        ]
      ]
    };

    // Also set up persistent keyboard
    const persistentKeyboard = {
      reply_markup: {
        keyboard: [
          [
            { text: '/study' },
            { text: '/topic' },
            { text: '/add' }
          ],
          [
            { text: '/mywords' },
            { text: '/stats' },
            { text: '/help' }
          ]
        ],
        resize_keyboard: true,
        is_persistent: true
      }
    };

    // Send message with inline keyboard
    await this.sendMessage(chatId, message, inlineKeyboard);
    
    // Send a follow-up message to set persistent keyboard
    await this.sendMessage(chatId, '💡 You can also use the keyboard below or type commands directly.', persistentKeyboard);
  }

  // Show user's words (first 10 for now)
  private async sendUserWords(chatId: number, userId: number): Promise<void> {
    const cards = await this.userManager.getUserCards(userId);
    if (!cards.length) {
      await this.sendMessage(chatId, 'You have no words yet. Use /add or /topic to get started!');
      return;
    }
    const lines = cards.slice(0, 10).map(card => `• ${card.word} — ${card.translation}`);
    await this.sendMessage(chatId, `🗂️ Your Words:\n${lines.join('\n')}${cards.length > 10 ? '\n...and more' : ''}`);
  }

  // Show user's topics (first 10 for now)
  private async sendUserTopics(chatId: number, userId: number): Promise<void> {
    const topics = await this.userManager.getUserTopics(userId);
    if (!topics.length) {
      await this.sendMessage(chatId, 'You have no topics yet. Use /topic to add one!');
      return;
    }
    const lines = topics.slice(0, 10).map(topic => `• ${topic.name} (${topic.sourceLanguage}→${topic.targetLanguage})`);
    await this.sendMessage(chatId, `📚 Your Topics:\n${lines.join('\n')}${topics.length > 10 ? '\n...and more' : ''}`);
  }

  // Command handler method (moved switch/case block here)
  private async handleCommand(command: string, chatId: number, userId: number, args: string[]): Promise<void> {
    // Check if registration is complete (except for /start command)
    if (command !== '/start') {
      const user = await this.userManager.getUser(userId);
      if (!user || !user.isRegistrationComplete) {
        const userLang = await this.getUserInterfaceLanguage(userId);
        const texts = languageManager.getTexts(userLang);
        await this.sendMessage(chatId, `${texts.completeRegistrationFirst}\n\n${texts.useStartToBegin}`);
        return;
      }
    }

    switch (command) {
      case '/start':
        const user = await this.userManager.getUser(userId);
        if (user && user.isRegistrationComplete) {
          await this.sendWelcomeMessage(chatId);
        } else {
          await this.startRegistrationFlow(chatId, userId);
        }
        break;
      case '/help':
        await this.sendHelpMessage(chatId, userId);
        break;
      case '/menu':
        await this.sendMainMenu(chatId);
        break;
      case '/mywords':
        await this.sendUserWords(chatId, userId);
        break;
      case '/mytopics':
        await this.sendUserTopics(chatId, userId);
        break;
      case '/study':
        await this.startStudySession(chatId, userId);
        break;
      case '/add':
        if (args.length >= 2) {
          const word = args[0];
          const translation = args.slice(1).join(' ');
          await this.addManualCard(chatId, userId, word, translation);
        } else {
          // Start multi-step add flow
          const state: ConversationState = {
            addTopic: {
              step: 'ask_topic'
            }
          };
          await this.conversationStateManager.setState(userId, state);
          await this.sendMessage(chatId, '📝 What topic or word do you want to add vocabulary for?');
        }
        break;
      case '/topic':
        if (args.length === 0) {
          // Start multi-step topic flow
          const state: ConversationState = {
            addTopic: {
              step: 'ask_topic'
            }
          };
          await this.conversationStateManager.setState(userId, state);
          await this.sendMessage(chatId, '📝 What topic do you want to add vocabulary for?');
        } else {
          await this.handleTopicCommand(chatId, userId, args);
        }
        break;
      case '/stats':
        await this.sendUserStatistics(chatId, userId);
        break;
      case '/settings':
        await this.sendSettingsMenu(chatId, userId);
        break;
      case '/languages':
        await this.sendLanguageList(chatId);
        break;
      case '/support':
        await this.sendSupportMenu(chatId, userId);
        break;
      case '/contact':
        await this.startSupportTicket(chatId, userId);
        break;
      case '/messages':
        await this.showUserMessages(chatId, userId);
        break;
      default:
        await this.sendMessage(chatId, 'Unknown command. Type /help for available commands.');
    }
  }

  private async handleTextInput(chatId: number, userId: number, text: string): Promise<void> {
    // Check for ongoing registration flow FIRST
    const state = await this.conversationStateManager.getState(userId);
    if (state && state.registration) {
      await this.handleRegistrationFlow(chatId, userId, text);
      return;
    }
    
    // Check for ongoing support ticket flow
    if (state && state.supportTicket) {
      await this.handleSupportTicketFlow(chatId, userId, text);
      return;
    }
    
    // Check for ongoing add topic/word flow
    if (state && state.addTopic) {
      await this.handleAddTopicStep(chatId, userId, text, state);
      return;
    }
    
    // Check if user is in a review session with conversation state
    if (state && state.review) {
      await this.handleReviewResponse(chatId, userId, text);
      return;
    }
    
    // Then check if user is in an active review session (fallback)
    const activeSession = await this.userManager.getActiveReviewSession(userId);
    if (activeSession) {
      const userLang = await this.getUserInterfaceLanguage(userId);
      const texts = languageManager.getTexts(userLang);
      await this.sendMessage(chatId, texts.pleaseUseButtonsToRespond);
      return;
    }
    
    // Default fallback
    await this.sendMessage(chatId,
      'I\'m ready to help you learn! Use /study to start reviewing cards, /topic to add new vocabulary, or /help for all commands.'
    );
  }

  private async handleCallbackQuery(callbackQuery: TelegramCallbackQuery): Promise<void> {
    const chatId = callbackQuery.message?.chat.id;
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    if (!chatId || !data) return;

    await this.answerCallbackQuery(callbackQuery.id);

    const [action, ...params] = data.split(':');

    switch (action) {
      case 'select_language':
        await this.handleRegistrationLanguageSelection(chatId, userId, params[0]);
        break;
      case 'review_correct':
        // Clear review state before processing button answer
        await this.conversationStateManager.clearState(userId);
        await this.handleReviewAnswer(chatId, userId, params[0], true);
        break;
      case 'review_incorrect':
        // Clear review state before processing button answer
        await this.conversationStateManager.clearState(userId);
        await this.handleReviewAnswer(chatId, userId, params[0], false);
        break;
      case 'set_language':
        await this.handleLanguageSelection(chatId, userId, params[0], params[1]);
        break;
      // ==== UPDATED MULTI-STEP FLOW WITH BACK BUTTONS AND CONDENSED KEYBOARDS ====
      case 'set_source_lang': {
        const state = await this.conversationStateManager.getState(userId);
        if (state && state.addTopic) {
          state.addTopic.sourceLanguage = params[0];
          state.addTopic.step = 'ask_target_language';
          await this.conversationStateManager.setState(userId, state);

          const langButtons = Object.entries(LANGUAGES).map(([code, name]) => ({
            text: name, callback_data: `set_target_lang:${code}`
          }));
          // Add Back button
          langButtons.push({ text: '⬅️ Back', callback_data: 'back:ask_topic' });
          await this.sendMessage(chatId, '🌐 What is the language for the meaning/translation?', {
            inline_keyboard: buildCondensedKeyboard(langButtons)
          });
        }
        break;
      }
      case 'set_target_lang': {
        const state = await this.conversationStateManager.getState(userId);
        if (state && state.addTopic) {
          state.addTopic.targetLanguage = params[0];
          state.addTopic.step = 'ask_description_language';
          await this.conversationStateManager.setState(userId, state);

          const langButtons = Object.entries(LANGUAGES).map(([code, name]) => ({
            text: name, callback_data: `set_desc_lang:${code}`
          }));
          langButtons.push({ text: '⬅️ Back', callback_data: 'back:ask_source_language' });
          await this.sendMessage(chatId, '📝 What is the language for the description/definition? (should match the word language)', {
            inline_keyboard: buildCondensedKeyboard(langButtons)
          });
        }
        break;
      }
      case 'set_desc_lang': {
        const state = await this.conversationStateManager.getState(userId);
        if (state && state.addTopic) {
          state.addTopic.descriptionLanguage = params[0];
          state.addTopic.step = 'ask_word_level';
          await this.conversationStateManager.setState(userId, state);

          const levelButtons = [
            { text: 'Beginner', callback_data: 'set_level:beginner' },
            { text: 'Intermediate', callback_data: 'set_level:intermediate' },
            { text: 'Advanced', callback_data: 'set_level:advanced' },
            { text: '⬅️ Back', callback_data: 'back:ask_target_language' }
          ];
          await this.sendMessage(chatId, '📈 What is the level of the words?', {
            inline_keyboard: buildCondensedKeyboard(levelButtons, 2)
          });
        }
        break;
      }
      case 'set_level': {
        const state = await this.conversationStateManager.getState(userId);
        if (state && state.addTopic) {
          state.addTopic.wordLevel = params[0];
          state.addTopic.step = 'ask_word_count';
          await this.conversationStateManager.setState(userId, state);

          const countButtons = [
            { text: '5', callback_data: 'set_count:5' },
            { text: '10', callback_data: 'set_count:10' },
            { text: '20', callback_data: 'set_count:20' },
            { text: '⬅️ Back', callback_data: 'back:ask_description_language' }
          ];
          await this.sendMessage(chatId, '🔢 How many words do you want to add?', {
            inline_keyboard: buildCondensedKeyboard(countButtons, 3)
          });
        }
        break;
      }
      case 'set_count': {
        const state = await this.conversationStateManager.getState(userId);
        if (state && state.addTopic) {
          const count = parseInt(params[0], 10);
          if (isNaN(count) || count < 1 || count > 100) {
            const userLang = await this.getUserInterfaceLanguage(userId);
            const texts = languageManager.getTexts(userLang);
            await this.sendMessage(chatId, texts.pleaseSelectValidNumber);
            break;
          }
          state.addTopic.wordCount = count;
          state.addTopic.step = 'confirm';
          await this.conversationStateManager.setState(userId, state);

          const addTopic = state.addTopic;
          const confirmButtons = [
            { text: '✅ Yes, add words', callback_data: 'confirm_add_topic:yes' },
            { text: '❌ Cancel', callback_data: 'confirm_add_topic:cancel' },
            { text: '⬅️ Back', callback_data: 'back:ask_word_level' }
          ];
          await this.sendMessage(
            chatId,
            `✅ Confirm:\n• Topic: ${addTopic.topic}\n• Word language: ${addTopic.sourceLanguage}\n• Meaning language: ${addTopic.targetLanguage}\n• Description language: ${addTopic.descriptionLanguage}\n• Level: ${addTopic.wordLevel}\n• Count: ${addTopic.wordCount}\n\nProceed?`,
            { inline_keyboard: buildCondensedKeyboard(confirmButtons, 2) }
          );
        }
        break;
      }
      case 'back': {
        const state = await this.conversationStateManager.getState(userId);
        if (state && state.addTopic) {
          state.addTopic.step = params[0] as any;
          await this.conversationStateManager.setState(userId, state);
          // Re-run the step prompt
          switch (params[0]) {
            case 'ask_topic':
              await this.sendMessage(chatId, '📝 What topic do you want to add vocabulary for?');
              break;
            case 'ask_source_language': {
              const langButtons = Object.entries(LANGUAGES).map(([code, name]) => ({
                text: name, callback_data: `set_source_lang:${code}`
              }));
              langButtons.push({ text: '⬅️ Back', callback_data: 'back:ask_topic' });
              await this.sendMessage(chatId, '🌍 What is the language of the words?', {
                inline_keyboard: buildCondensedKeyboard(langButtons)
              });
              break;
            }
            case 'ask_target_language': {
              const langButtons = Object.entries(LANGUAGES).map(([code, name]) => ({
                text: name, callback_data: `set_target_lang:${code}`
              }));
              langButtons.push({ text: '⬅️ Back', callback_data: 'back:ask_source_language' });
              await this.sendMessage(chatId, '🌐 What is the language for the meaning/translation?', {
                inline_keyboard: buildCondensedKeyboard(langButtons)
              });
              break;
            }
            case 'ask_description_language': {
              const langButtons = Object.entries(LANGUAGES).map(([code, name]) => ({
                text: name, callback_data: `set_desc_lang:${code}`
              }));
              langButtons.push({ text: '⬅️ Back', callback_data: 'back:ask_target_language' });
              await this.sendMessage(chatId, '📝 What is the language for the description/definition? (should match the word language)', {
                inline_keyboard: buildCondensedKeyboard(langButtons)
              });
              break;
            }
            case 'ask_word_level': {
              const levelButtons = [
                { text: 'Beginner', callback_data: 'set_level:beginner' },
                { text: 'Intermediate', callback_data: 'set_level:intermediate' },
                { text: 'Advanced', callback_data: 'set_level:advanced' },
                { text: '⬅️ Back', callback_data: 'back:ask_description_language' }
              ];
              await this.sendMessage(chatId, '📈 What is the level of the words?', {
                inline_keyboard: buildCondensedKeyboard(levelButtons, 2)
              });
              break;
            }
            case 'ask_word_count': {
              const countButtons = [
                { text: '5', callback_data: 'set_count:5' },
                { text: '10', callback_data: 'set_count:10' },
                { text: '20', callback_data: 'set_count:20' },
                { text: '⬅️ Back', callback_data: 'back:ask_word_level' }
              ];
              await this.sendMessage(chatId, '🔢 How many words do you want to add?', {
                inline_keyboard: buildCondensedKeyboard(countButtons, 3)
              });
              break;
            }
          }
        }
        break;
      }
      // ==== END UPDATED MULTI-STEP FLOW ====
      case 'show_definition':
        await this.showCardDefinition(chatId, params[0]);
        break;
      case 'show_meaning':
        await this.showCardMeaning(chatId, userId, params[0]);
        break;
      case 'detailed_stats':
        await this.showDetailedStats(chatId, userId);
        break;
      case 'study_goals':
        await this.showStudyGoals(chatId, userId);
        break;
      case 'start_study':
        await this.startStudySession(chatId, userId);
        break;
      case 'add_vocabulary':
        // Start multi-step topic flow
        const state: ConversationState = {
          addTopic: {
            step: 'ask_topic'
          }
        };
        await this.conversationStateManager.setState(userId, state);
        await this.sendMessage(chatId, '📝 What topic do you want to add vocabulary for?');
        break;
      case 'next_card':
        await this.continueStudySession(chatId, userId);
        break;
      case 'end_session':
        await this.endStudySession(chatId, userId);
        break;
      case 'show_progress':
        await this.showUserProgress(chatId, userId);
        break;
      case 'show_tip':
        await this.showLeitnerTip(chatId, parseInt(params[0]) || 1);
        break;
      // New navigation handlers
      case 'add_topic':
        // Start multi-step topic flow
        const addTopicState: ConversationState = {
          addTopic: {
            step: 'ask_topic'
          }
        };
        await this.conversationStateManager.setState(userId, addTopicState);
        await this.sendMessage(chatId, '📝 What topic do you want to add vocabulary for?');
        break;
      case 'view_stats':
        await this.handleCommand('/stats', chatId, userId, []);
        break;
      case 'show_words':
        await this.sendUserWords(chatId, userId);
        break;
      case 'open_settings':
        await this.handleCommand('/settings', chatId, userId, []);
        break;
      case 'show_help':
        await this.sendHelpMessage(chatId, userId);
        break;
      case 'confirm_add_topic':
        if (params[0] === 'yes') {
          await this.executeTopicWordExtraction(chatId, userId);
        } else {
          await this.conversationStateManager.clearState(userId);
          const userLang = await this.getUserInterfaceLanguage(userId);
          const texts = languageManager.getTexts(userLang);
          await this.sendMessage(chatId, texts.cancelledUseTopic);
        }
        break;
      case 'confirm_registration':
        if (params[0] === 'yes') {
          await this.completeRegistration(chatId, userId);
        } else {
          // Edit registration - restart the flow
          await this.startRegistrationFlow(chatId, userId);
        }
        break;
      // Support ticket handlers
      case 'create_ticket':
        await this.handleSupportTicketFlow(chatId, userId, 'start');
        break;
      case 'view_messages':
        await this.showDirectMessages(chatId, userId);
        break;
      case 'my_tickets':
        await this.showUserTickets(chatId, userId);
        break;
      case 'show_notifications':
        await this.showUserNotifications(chatId, userId);
        break;
      case 'mark_notifications_read':
        await this.markAllNotificationsRead(chatId, userId);
        break;
      case 'show_faq':
        await this.sendFAQ(chatId);
        break;
      case 'submit_ticket':
        await this.submitSupportTicket(chatId, userId);
        break;
      case 'edit_ticket':
        await this.handleSupportTicketFlow(chatId, userId, 'edit');
        break;
      case 'cancel_ticket':
        await this.conversationStateManager.clearState(userId);
        const userLang = await this.getUserInterfaceLanguage(userId);
        const texts = languageManager.getTexts(userLang);
        await this.sendMessage(chatId, texts.supportTicketCancelled);
        break;
      case 'priority_normal':
        await this.setTicketPriority(chatId, userId, 'medium');
        break;
      case 'priority_urgent':
        await this.setTicketPriority(chatId, userId, 'urgent');
        break;
      case 'support_menu':
        await this.handleCommand('/support', chatId, userId, []);
        break;
      case 'show_support_menu':
        await this.sendSupportMenu(chatId, userId);
        break;
      case 'set_interface_lang':
        if (params[0]) {
          // Handle interface language selection
          await this.setInterfaceLanguage(chatId, userId, params[0]);
        } else {
          // Show interface language selection menu
          await this.showInterfaceLanguageMenu(chatId, userId);
        }
        break;
      case 'settings_menu':
        await this.sendSettingsMenu(chatId, userId);
        break;
      case 'main_menu':
        await this.sendWelcomeMessage(chatId);
        break;
      case 'reminder_settings':
        await this.showReminderSettings(chatId, userId);
        break;
    }
  }

  private async sendWelcomeMessage(chatId: number): Promise<void> {
    // Get user info for personalization
    const userId = chatId; // In private chats, chatId equals userId
    const user = await this.userManager.getUser(userId);
    const userName = user?.fullName || user?.firstName || 'there';
    const userLang = await this.getUserInterfaceLanguage(userId);
    const texts = languageManager.getTexts(userLang);
    
    const message = `${texts.welcomeBack}, ${userName}!

${texts.readyToContinue}

${texts.quickStart}
${texts.useTopicToGenerate}
${texts.useAddToManual}
${texts.useStudyToReview}
${texts.useSettingsToConfig}

${texts.supportMultipleLanguages}

${texts.chooseOptionBelow}`;

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: texts.startStudy, callback_data: 'start_study' },
          { text: `➕ ${texts.addVocabulary}`, callback_data: 'add_topic' }
        ],
        [
          { text: texts.myProgress, callback_data: 'view_stats' },
          { text: texts.settings, callback_data: 'settings_menu' }
        ],
        [
          { text: texts.help, callback_data: 'show_help' }
        ]
      ]
    };

    await this.sendMessage(chatId, message, keyboard);
  }

  private async sendHelpMessage(chatId: number, userId?: number): Promise<void> {
    const userLang = await this.getUserInterfaceLanguage(userId || 0);
    const texts = languageManager.getTexts(userLang);
    
    const message = texts.helpMessage;

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: texts.startStudy, callback_data: 'start_study' },
          { text: texts.addVocabulary, callback_data: 'add_vocabulary' }
        ],
        [
          { text: texts.myProgress, callback_data: 'view_stats' },
          { text: texts.myWords, callback_data: 'show_words' }
        ],
        [
          { text: texts.settings, callback_data: 'open_settings' },
          { text: texts.support, callback_data: 'support_menu' }
        ]
      ]
    };

    await this.sendMessage(chatId, message, keyboard);
  }

  private async startStudySession(chatId: number, userId: number): Promise<void> {
    const cardsToReview = await this.userManager.getCardsDueForReview(userId, 1);
    const userLang = await this.getUserInterfaceLanguage(userId);
    const texts = languageManager.getTexts(userLang);
    
    if (cardsToReview.length === 0) {
      // Show user's current progress when no cards are due
      const cards = await this.userManager.getUserCards(userId);
      if (cards.length === 0) {
        await this.sendMessage(chatId, texts.noVocabularyYet);
      } else {
        const nextCard = cards.reduce((earliest, card) => 
          new Date(card.nextReviewAt) < new Date(earliest.nextReviewAt) ? card : earliest
        );
        const nextReview = new Date(nextCard.nextReviewAt);
        const hoursUntil = Math.round((nextReview.getTime() - Date.now()) / (1000 * 60 * 60));
        
        const message = `${texts.allCaughtUp}

📊 **${texts.myWords}:** ${cards.length} words
⏰ **${texts.nextCard}:** ${hoursUntil < 24 ? `${hoursUntil} hours` : `${Math.round(hoursUntil/24)} days`}

💡 Use /topic to add more vocabulary or /progress to see your stats!`;
        
        await this.sendMessage(chatId, message);
      }
      return;
    }

    // Create new review session with motivational message
    await this.userManager.createReviewSession(userId);
    
    const cards = await this.userManager.getUserCards(userId);
    const sessionMessage = `${texts.studySessionStarted}

📊 **Today's Review:** ${cardsToReview.length} cards
📚 **Total Vocabulary:** ${cards.length} words

${texts.howLeitnerWorks}

${texts.proTip}`;

    await this.sendMessage(chatId, sessionMessage);
    
    // Start with the first card
    await this.presentCard(chatId, userId, cardsToReview[0]);
  }

  private async presentCard(chatId: number, userId: number, card: Card): Promise<void> {
    const userLang = await this.getUserInterfaceLanguage(userId);
    const texts = languageManager.getTexts(userLang);
    
    // Store the current card in conversation state for text input handling
    const reviewState: ReviewConversationState = {
      currentCardId: card.id,
      currentCard: {
        id: card.id,
        word: card.word,
        translation: card.translation,
        definition: card.definition,
        sourceLanguage: card.sourceLanguage,
        targetLanguage: card.targetLanguage,
        box: card.box
      }
    };
    
    await this.conversationStateManager.setState(userId, { review: reviewState });

    // Get session progress for motivation
    const cards = await this.userManager.getUserCards(userId);
    const cardsDue = cards.filter(c => new Date(c.nextReviewAt) <= new Date()).length;
    const currentIndex = cardsDue - cards.filter(c => new Date(c.nextReviewAt) <= new Date() && c.id !== card.id).length;

    // Localized buttons
    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: texts.iKnow, callback_data: `review_correct:${card.id}` },
          { text: texts.iDontKnow, callback_data: `review_incorrect:${card.id}` },
          { text: texts.showMeaning, callback_data: `show_meaning:${card.id}` }
        ]
      ]
    };

    // Enhanced visual card design
    const boxEmojis = ['', '🟪', '🟦', '🟩', '🟨', '🟥'];
    const difficultyLabels = ['', '🔥 New', '📚 Learning', '💪 Good', '🌟 Almost Mastered', '👑 Mastered'];
    
    // Calculate personal stats for this card
    const successRate = card.reviewCount > 0 ? Math.round((card.correctCount / card.reviewCount) * 100) : 0;
    const attempts = card.reviewCount;
    
    // Next review timing
    const nextReview = new Date(card.nextReviewAt);
    const now = new Date();
    const diffHours = Math.round((nextReview.getTime() - now.getTime()) / (1000 * 60 * 60));
    const reviewInterval = diffHours <= 24 ? `${Math.max(diffHours, 1)}h` : `${Math.round(diffHours/24)}d`;

    const message = `🎴 **Flashcard ${currentIndex}/${cardsDue}** ${boxEmojis[card.box]}

━━━━━━━━━━━━━━━━━━━━━━━

🔤 **${card.word}**

🌍 ${card.sourceLanguage.toUpperCase()} ➜ ${card.targetLanguage.toUpperCase()}
� ${difficultyLabels[card.box]} • Box ${card.box}/5
${attempts > 0 ? `🎯 Success: ${successRate}% (${card.correctCount}/${attempts})` : '🆕 First time seeing this word'}
⏱️ Next review in: ${reviewInterval}

━━━━━━━━━━━━━━━━━━━━━━━

❓ **Do you know the translation?**

� *Think about it, then choose below...*`;

    await this.sendMessage(chatId, message, keyboard);
  }

  private async handleReviewAnswer(chatId: number, userId: number, cardId: string, isCorrect: boolean): Promise<void> {
    // Process the review
    const updatedCard = await this.scheduleManager.processCardReview(userId, cardId, isCorrect);
    
    if (!updatedCard) {
      await this.sendMessage(chatId, 'Error processing review. Please try again.');
      return;
    }

    // Calculate session progress
    const cards = await this.userManager.getUserCards(userId);
    const cardsDue = cards.filter(c => new Date(c.nextReviewAt) <= new Date()).length;
    
    // Enhanced visual feedback
    const resultEmoji = isCorrect ? '🎉' : '🔄';
    const boxEmojis = ['', '🟪', '🟦', '🟩', '🟨', '🟥'];
    const progressEmoji = isCorrect ? '📈' : '�';
    
    // Calculate next review time
    const nextReview = new Date(updatedCard.nextReviewAt);
    const now = new Date();
    const diffHours = Math.round((nextReview.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    let nextReviewText;
    let reviewMotivation;
    
    if (diffHours <= 24) {
      nextReviewText = `${Math.max(diffHours, 1)} hours`;
      reviewMotivation = "Soon!";
    } else if (diffHours <= 48) {
      nextReviewText = "tomorrow";
      reviewMotivation = "Perfect timing!";
    } else {
      const days = Math.round(diffHours / 24);
      nextReviewText = `${days} days`;
      reviewMotivation = "Well spaced!";
    }

    // Success rate with visual indicator
    const successRate = Math.round((updatedCard.correctCount / updatedCard.reviewCount) * 100);
    const successBars = Math.round(successRate / 10);
    const successVisual = '▓'.repeat(successBars) + '░'.repeat(10 - successBars);

    // Motivational messages based on performance
    const motivationalMessage = isCorrect 
      ? [
          "🌟 Fantastic! You're making great progress!",
          "� Excellent work! Knowledge is building!",
          "⭐ Outstanding! Your memory is sharp!",
          "🎯 Perfect! You're mastering this!",
          "🏆 Brilliant! Keep up the momentum!"
        ][Math.floor(Math.random() * 5)]
      : [
          "💪 No worries! Practice makes perfect!",
          "🔄 Learning in progress! You'll get it!",
          "📚 That's okay! Every mistake teaches us!",
          "🎯 Keep going! Mastery takes time!",
          "🌱 Growing stronger with each review!"
        ][Math.floor(Math.random() * 5)];

    const boxProgression = isCorrect 
      ? `${progressEmoji} **Moved to Box ${updatedCard.box}!** ${boxEmojis[updatedCard.box]}`
      : `${progressEmoji} **Back to Box 1 for more practice** 🟪`;

    const message = `${resultEmoji} **${isCorrect ? 'CORRECT!' : 'KEEP LEARNING!'}**

━━━━━━━━━━━━━━━━━━━━━━━

🔤 **${updatedCard.word}**
💡 **${updatedCard.translation}**
📝 *${updatedCard.definition}*

━━━━━━━━━━━━━━━━━━━━━━━

${boxProgression}

⏰ **Next Review:** ${nextReviewText} (${reviewMotivation})
🎯 **Your Progress:** ${successVisual} ${successRate}%
📊 **Attempts:** ${updatedCard.correctCount}/${updatedCard.reviewCount}

💭 **${motivationalMessage}**

${cardsDue > 1 ? `📚 ${cardsDue - 1} more cards to review` : '🎉 Session almost complete!'}`;

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: '▶️ Next Card', callback_data: 'next_card' },
          { text: '📊 Progress', callback_data: 'show_progress' }
        ],
        [
          { text: '🏁 End Session', callback_data: 'end_session' },
          { text: '💡 Study Tip', callback_data: `show_tip:${updatedCard.box}` }
        ]
      ]
    };

    await this.sendMessage(chatId, message, keyboard);

    // Update session stats
    const activeSession = await this.userManager.getActiveReviewSession(userId);
    if (activeSession) {
      await this.userManager.updateReviewSession(userId, activeSession.id, {
        cardsReviewed: activeSession.cardsReviewed + 1,
        correctAnswers: activeSession.correctAnswers + (isCorrect ? 1 : 0)
      });
    }
  }

  private async continueStudySession(chatId: number, userId: number): Promise<void> {
    const cardsToReview = await this.userManager.getCardsDueForReview(userId, 1);
    
    if (cardsToReview.length === 0) {
      await this.endStudySession(chatId, userId);
      return;
    }

    await this.presentCard(chatId, userId, cardsToReview[0]);
  }

  private async endStudySession(chatId: number, userId: number): Promise<void> {
    // Clear review conversation state
    await this.conversationStateManager.clearState(userId);
    
    const activeSession = await this.userManager.getActiveReviewSession(userId);
    if (activeSession) {
      await this.userManager.updateReviewSession(userId, activeSession.id, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });

      const accuracy = activeSession.cardsReviewed > 0 
        ? Math.round((activeSession.correctAnswers / activeSession.cardsReviewed) * 100)
        : 0;

      // Leitner box stats
      const cards = await this.userManager.getUserCards(userId);
      const boxCounts = [1,2,3,4,5].map(box => cards.filter(c => c.box === box).length);
      const total = boxCounts.reduce((a,b) => a+b, 0) || 1;
      const bar = boxCounts.map((count, i) => {
        const filled = Math.round((count/total)*10);
        const boxEmoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'][i];
        return `${boxEmoji} ${'█'.repeat(filled)}${'░'.repeat(10-filled)} (${count})`;
      }).join('\n');

      const message = `🎯 <b>Study Session Complete!</b>\n\n📊 <b>Session Stats:</b>\n• Cards reviewed: ${activeSession.cardsReviewed}\n• Correct answers: ${activeSession.correctAnswers}\n• Accuracy: ${accuracy}%\n\n<b>Your Leitner Progress:</b>\n${bar}\n\n🎉 Great job! Come back tomorrow for more practice.`;

      await this.sendMessage(chatId, message, { parse_mode: 'HTML' });
    }
  }


  // ...existing methods...
  // (Class continues below; removed premature closing brace)
  // Additional helper methods...
  private async sendDailyReminder(user: any, cardsToReview: any[]): Promise<void> {
    const message = `🔔 **Daily Learning Reminder**

You have ${cardsToReview.length} card${cardsToReview.length > 1 ? 's' : ''} ready for review!

📚 Consistent practice is key to mastering vocabulary.
Use /study to start your review session.

Good luck! 🌟`;
    await this.sendMessage(user.id, message);
  }

  private async addManualCard(chatId: number, userId: number, word: string, translation: string): Promise<void> {
    const user = await this.userManager.getUser(userId);
    if (!user) return;

    try {
      // Use AI to generate definition
      const definition = await this.wordExtractor.generateDefinition(word, user.language);
      
      await this.userManager.createCard({
        userId: userId,
        word: word,
        translation: translation,
        definition: definition,
        sourceLanguage: 'en', // Could be improved to auto-detect
        targetLanguage: user.language,
        box: 1,
        nextReviewAt: new Date().toISOString(),
        reviewCount: 0,
        correctCount: 0
      });

      await this.sendMessage(chatId, `✅ Added "${word}" → "${translation}" to your deck!`);
    } catch (error) {
      await this.sendMessage(chatId, 'Error adding card. Please try again.');
    }
  }
// (Class should be closed at the very end of the file)

  private async sendSettingsMenu(chatId: number, userId: number): Promise<void> {
    const userLang = await this.getUserInterfaceLanguage(userId);
    const texts = languageManager.getTexts(userLang);
    const user = await this.userManager.getUser(userId);

    const message = `${texts.settingsMenu}

📖 ${texts.sourceLanguage}: ${user?.language || 'en'}
🎯 ${texts.targetLanguage}: ${user?.language || 'en'}
🌐 ${texts.interfaceLanguage}: ${languageManager.getSupportedLanguages()[userLang] || 'English'}

${texts.selectLanguage}`;

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: `📖 ${texts.sourceLanguage}`, callback_data: 'set_source_lang' },
          { text: `🎯 ${texts.targetLanguage}`, callback_data: 'set_target_lang' }
        ],
        [
          { text: `🌐 ${texts.interfaceLanguage}`, callback_data: 'set_interface_lang' }
        ],
        [
          { text: `⏰ ${texts.reminderSettings}`, callback_data: 'reminder_settings' }
        ],
        [
          { text: texts.back, callback_data: 'main_menu' }
        ]
      ]
    };

    await this.sendMessage(chatId, message, keyboard);
  }

  private async sendLanguageList(chatId: number): Promise<void> {
    const languageList = Object.entries(LANGUAGES)
      .map(([code, name]) => `${code}: ${name}`)
      .join('\n');
    const message = `🌍 **Supported Languages**

${languageList}

Use language codes when setting your preferences.`;
    await this.sendMessage(chatId, message);
  }

  private async showCardDefinition(chatId: number, cardId: string): Promise<void> {
    // This would need to be implemented to show card definition
    await this.sendMessage(chatId, 'Definition shown above! 👆');
  }

  private async handleLanguageSelection(chatId: number, userId: number, type: string, language: string): Promise<void> {
    // Implementation for language selection from inline keyboard
    await this.sendMessage(chatId, `Language ${type} set to ${language}`);
  }

  private async handleReviewResponse(chatId: number, userId: number, text: string): Promise<void> {
    // Get the current review state from conversation
    const state = await this.conversationStateManager.getState(userId);
    if (!state || !state.review) {
      await this.sendMessage(chatId, 'No active review session found. Use /study to start a new session.');
      return;
    }

    const currentCard = state.review.currentCard;
    
    // Enhanced answer checking with multiple validation methods
    const userAnswer = text.toLowerCase().trim();
    const correctAnswer = currentCard.translation.toLowerCase().trim();
    
    // Method 1: Exact match
    let isCorrect = userAnswer === correctAnswer;
    
    // Method 2: Check if user answer matches the main part (before parentheses)
    if (!isCorrect) {
      const mainAnswer = correctAnswer.split('(')[0].trim();
      isCorrect = userAnswer === mainAnswer;
    }
    
    // Method 3: Check if user answer is contained in correct answer (for multi-script)
    if (!isCorrect) {
      isCorrect = correctAnswer.includes(userAnswer) && userAnswer.length > 2;
    }
    
    // Method 4: Remove common separators and check
    if (!isCorrect) {
      const cleanCorrect = correctAnswer.replace(/[()،,\-\s]/g, '');
      const cleanUser = userAnswer.replace(/[()،,\-\s]/g, '');
      isCorrect = cleanUser === cleanCorrect;
    }

    // Clear the review state before processing the answer
    await this.conversationStateManager.clearState(userId);

    // Process the answer and move the card
    await this.handleReviewAnswer(chatId, userId, currentCard.id, isCorrect);
  }

  // Registration flow handlers
  private async startRegistrationFlow(chatId: number, userId: number): Promise<void> {
    const registrationState: ConversationState = {
      registration: {
        step: 'ask_language'
      }
    };
    await this.conversationStateManager.setState(userId, registrationState);
    
    // Use English as default for the initial language selection message
    const texts = languageManager.getTexts('en');
    
    const languageKeyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: '🇺🇸 English', callback_data: 'select_language:en' },
          { text: '🇮🇷 فارسی', callback_data: 'select_language:fa' }
        ],
        [
          { text: '🇸🇦 العربية', callback_data: 'select_language:ar' },
          { text: '🇪🇸 Español', callback_data: 'select_language:es' }
        ],
        [
          { text: '🇷🇺 Русский', callback_data: 'select_language:ru' }
        ]
      ]
    };

    const message = `${texts.welcomeToBot}

${texts.beforeWeStart}

${texts.selectPreferredLanguage}

${texts.chooseLanguageBelow}`;

    await this.sendMessage(chatId, message, languageKeyboard);
  }

  private async handleRegistrationFlow(chatId: number, userId: number, text: string): Promise<void> {
    const state = await this.conversationStateManager.getState(userId);
    if (!state || !state.registration) {
      // Restart registration if state is missing
      await this.startRegistrationFlow(chatId, userId);
      return;
    }

    const registration = state.registration;
    const userLang = registration.interfaceLanguage || 'en';
    const texts = languageManager.getTexts(userLang);
    
    switch (registration.step) {
      case 'ask_language': {
        // This is handled by callback queries, so ignore text input
        await this.sendMessage(chatId, texts.chooseLanguageBelow);
        break;
      }
      case 'ask_name': {
        if (text.trim().length < 2) {
          await this.sendMessage(chatId, '❌ Please enter a valid name (at least 2 characters).');
          return;
        }
        registration.fullName = text.trim();
        registration.step = 'ask_email';
        await this.conversationStateManager.setState(userId, state);
        
        await this.sendMessage(chatId, `${texts.niceToMeet}, ${registration.fullName}! 👋

${texts.whatsYourEmail}

${texts.emailWillHelp}
${texts.sendReminders}
${texts.keepProgressSafe}
${texts.personalizedInsights}

${texts.pleaseTypeEmailBelow}`);
        break;
      }
      case 'ask_email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text.trim())) {
          await this.sendMessage(chatId, '❌ Please enter a valid email address (e.g., john@example.com).');
          return;
        }
        registration.email = text.trim();
        registration.step = 'confirm';
        await this.conversationStateManager.setState(userId, state);
        
        const keyboard: TelegramInlineKeyboard = {
          inline_keyboard: [
            [
              { text: texts.confirmButton, callback_data: 'confirm_registration:yes' },
              { text: texts.editButton, callback_data: 'confirm_registration:edit' }
            ]
          ]
        };

        await this.sendMessage(chatId, 
          `${texts.pleaseConfirmInfo}

${texts.nameLabel} ${registration.fullName}
${texts.emailLabel} ${registration.email}

${texts.isInfoCorrect}`, keyboard);
        break;
      }
      case 'confirm': {
        // This case is handled by callback query
        break;
      }
    }
  }

  private async handleRegistrationLanguageSelection(chatId: number, userId: number, languageCode: string): Promise<void> {
    const state = await this.conversationStateManager.getState(userId);
    if (!state || !state.registration || state.registration.step !== 'ask_language') {
      await this.startRegistrationFlow(chatId, userId);
      return;
    }

    // Save selected language and update user
    state.registration.interfaceLanguage = languageCode;
    await this.userManager.updateUser(userId, { interfaceLanguage: languageCode });
    
    // Move to next step
    state.registration.step = 'ask_name';
    await this.conversationStateManager.setState(userId, state);

    // Get texts in the selected language
    const texts = languageManager.getTexts(languageCode);

    const message = `${texts.whatsYourFullName}

${texts.pleaseTypeNameBelow}`;

    await this.sendMessage(chatId, message);
  }

  private async completeRegistration(chatId: number, userId: number): Promise<void> {
    const state = await this.conversationStateManager.getState(userId);
    if (!state || !state.registration) return;

    const registration = state.registration;
    
    // Update user with registration info
    await this.userManager.updateUser(userId, {
      fullName: registration.fullName,
      email: registration.email,
      interfaceLanguage: registration.interfaceLanguage || 'en',
      isRegistrationComplete: true
    });

    // Clear registration state
    await this.conversationStateManager.clearState(userId);

    // Send welcome message with getting started options
    await this.sendWelcomeMessage(chatId);
  }

  private async handleSupportTicketFlow(chatId: number, userId: number, text: string): Promise<void> {
    const state = await this.conversationStateManager.getState(userId);
    if (!state || !state.supportTicket) {
      // Restart support ticket if state is missing
      await this.startSupportTicket(chatId, userId);
      return;
    }

    const ticket = state.supportTicket;
    switch (ticket.step) {
      case 'ask_subject': {
        if (text.trim().length < 5) {
          await this.sendMessage(chatId, '❌ Please provide a more detailed subject (at least 5 characters).');
          return;
        }
        ticket.subject = text.trim();
        ticket.step = 'ask_message';
        await this.conversationStateManager.setState(userId, state);
        
        await this.sendMessage(chatId, `📝 **Subject:** ${ticket.subject}

Now please describe your issue or question in detail. The more information you provide, the better we can help you.

Type your message below:`);
        break;
      }
      case 'ask_message': {
        if (text.trim().length < 10) {
          await this.sendMessage(chatId, '❌ Please provide a more detailed message (at least 10 characters).');
          return;
        }
        ticket.message = text.trim();
        ticket.step = 'confirm';
        await this.conversationStateManager.setState(userId, state);
        
        const keyboard: TelegramInlineKeyboard = {
          inline_keyboard: [
            [
              { text: '📤 Submit Ticket', callback_data: 'submit_ticket:normal' },
              { text: '🚨 Urgent', callback_data: 'submit_ticket:urgent' }
            ],
            [
              { text: '✏️ Edit', callback_data: 'edit_ticket' },
              { text: '❌ Cancel', callback_data: 'cancel_ticket' }
            ]
          ]
        };

        await this.sendMessage(chatId, 
          `🎫 **Review Your Support Ticket**

**Subject:** ${ticket.subject}

**Message:** ${ticket.message}

**Priority:** Choose normal or urgent (urgent for critical issues only)

Please review and submit your ticket:`, keyboard);
        break;
      }
      case 'confirm': {
        // This case is handled by callback query
        break;
      }
    }
  }

  private async submitSupportTicket(chatId: number, userId: number, priority: 'normal' | 'urgent' = 'normal'): Promise<void> {
    const state = await this.conversationStateManager.getState(userId);
    if (!state || !state.supportTicket) return;

    const ticket = state.supportTicket;
    
    try {
      const ticketId = await this.adminService.createSupportTicket({
        userId: ticket.userId,
        userEmail: ticket.userEmail,
        userName: ticket.userName,
        subject: ticket.subject!,
        message: ticket.message!,
        status: 'open',
        priority: priority === 'urgent' ? 'urgent' : 'medium'
      });

      // Clear ticket state
      await this.conversationStateManager.clearState(userId);

      const priorityEmoji = priority === 'urgent' ? '🚨' : '📋';
      const responseTimeText = priority === 'urgent' ? 'within 4 hours' : 'within 24 hours';

      const keyboard: TelegramInlineKeyboard = {
        inline_keyboard: [
          [
            { text: '💬 View Messages', callback_data: 'view_messages' },
            { text: '🎫 New Ticket', callback_data: 'create_ticket' }
          ]
        ]
      };

      await this.sendMessage(chatId, 
        `✅ **Support Ticket Submitted Successfully!**

${priorityEmoji} **Ticket ID:** ${ticketId.split('_')[1]?.slice(-6) || 'Generated'}
📋 **Status:** Open
⏱️ **Expected Response:** ${responseTimeText}

Our support team will review your request and respond as soon as possible. You'll receive a message when there's an update.

Thank you for contacting us! 🎯`, keyboard);

    } catch (error) {
      console.error('Error creating support ticket:', error);
      await this.sendMessage(chatId, '❌ **Error Creating Ticket**\n\nSorry, there was an error submitting your support ticket. Please try again later or contact us directly.');
    }
  }

  // Multi-step add topic/word flow handler
  private async handleAddTopicStep(chatId: number, userId: number, text: string, state: ConversationState): Promise<void> {
    const addTopic = state.addTopic!;
    switch (addTopic.step) {
      case 'ask_topic': {
        addTopic.topic = text;
        addTopic.step = 'ask_source_language';
        await this.conversationStateManager.setState(userId, state);
        // Show language options as buttons
        const langButtons = Object.entries(LANGUAGES).map(([code, name]) => [{ text: name, callback_data: `set_source_lang:${code}` }]);
        const keyboard: TelegramInlineKeyboard = { inline_keyboard: langButtons };
        await this.sendMessage(chatId, '🌍 What is the language of the words?', keyboard);
        break;
      }
      case 'ask_source_language': {
        addTopic.sourceLanguage = text;
        addTopic.step = 'ask_target_language';
        await this.conversationStateManager.setState(userId, state);
        const langButtons = Object.entries(LANGUAGES).map(([code, name]) => [{ text: name, callback_data: `set_target_lang:${code}` }]);
        const keyboard: TelegramInlineKeyboard = { inline_keyboard: langButtons };
        await this.sendMessage(chatId, '🌐 What is the language for the meaning/translation?', keyboard);
        break;
      }
      case 'ask_target_language': {
        addTopic.targetLanguage = text;
        addTopic.step = 'ask_description_language';
        await this.conversationStateManager.setState(userId, state);
        const langButtons = Object.entries(LANGUAGES).map(([code, name]) => [{ text: name, callback_data: `set_desc_lang:${code}` }]);
        const keyboard: TelegramInlineKeyboard = { inline_keyboard: langButtons };
        await this.sendMessage(chatId, '📝 What is the language for the description/definition? (should match the word language)', keyboard);
        break;
      }
      case 'ask_description_language': {
        addTopic.descriptionLanguage = text;
        addTopic.step = 'ask_word_level';
        await this.conversationStateManager.setState(userId, state);
        const levelButtons = [
          [{ text: 'Beginner', callback_data: 'set_level:beginner' }],
          [{ text: 'Intermediate', callback_data: 'set_level:intermediate' }],
          [{ text: 'Advanced', callback_data: 'set_level:advanced' }]
        ];
        const keyboard: TelegramInlineKeyboard = { inline_keyboard: levelButtons };
        await this.sendMessage(chatId, '📈 What is the level of the words?', keyboard);
        break;
      }
      case 'ask_word_level': {
        addTopic.wordLevel = text;
        addTopic.step = 'ask_word_count';
        await this.conversationStateManager.setState(userId, state);
        const countButtons = [
          [{ text: '5', callback_data: 'set_count:5' }, { text: '10', callback_data: 'set_count:10' }, { text: '20', callback_data: 'set_count:20' }]
        ];
        const keyboard: TelegramInlineKeyboard = { inline_keyboard: countButtons };
        await this.sendMessage(chatId, '🔢 How many words do you want to add?', keyboard);
        break;
      }
      case 'ask_word_count': {
        const count = parseInt(text, 10);
        if (isNaN(count) || count < 1 || count > 100) {
          await this.sendMessage(chatId, 'Please enter a valid number between 1 and 100.');
          return;
        }
        addTopic.wordCount = count;
        addTopic.step = 'confirm';
        await this.conversationStateManager.setState(userId, state);
        // Show summary and confirm with inline buttons
        const confirmButtons = [
          [
            { text: '✅ Yes, add words', callback_data: 'confirm_add_topic:yes' },
            { text: '❌ Cancel', callback_data: 'confirm_add_topic:cancel' }
          ]
        ];
        await this.sendMessage(
          chatId,
          `✅ Confirm:\n• Topic: ${addTopic.topic}\n• Word language: ${addTopic.sourceLanguage}\n• Meaning language: ${addTopic.targetLanguage}\n• Description language: ${addTopic.descriptionLanguage}\n• Level: ${addTopic.wordLevel}\n• Count: ${addTopic.wordCount}`,
          { inline_keyboard: confirmButtons }
        );
        break;
      }
      // Handle inline keyboard callbacks for language, level, and count
      // This logic should be added to handleCallbackQuery
      case 'confirm': {
        if (text.toLowerCase() === 'yes') {
          // Proceed to extract and add words
          await this.sendMessage(chatId, `🔄 Extracting vocabulary for "${addTopic.topic}"...`);
          try {
            const words = await this.wordExtractor.extractWords({
              topic: addTopic.topic!,
              sourceLanguage: addTopic.sourceLanguage!,
              targetLanguage: addTopic.targetLanguage!,
              count: addTopic.wordCount,
              wordLevel: addTopic.wordLevel,
              descriptionLanguage: addTopic.descriptionLanguage
            });
            if (words.length === 0) {
              await this.sendMessage(chatId, 'Sorry, I couldn\'t extract vocabulary for this topic. Please try a different topic.');
              await this.conversationStateManager.clearState(userId);
              return;
            }
            let createdCount = 0;
            for (const word of words) {
              await this.userManager.createCard({
                userId: userId,
                word: word.word,
                translation: word.translation,
                definition: word.definition,
                sourceLanguage: addTopic.sourceLanguage!,
                targetLanguage: addTopic.targetLanguage!,
                box: 1,
                nextReviewAt: new Date().toISOString(),
                reviewCount: 0,
                correctCount: 0,
                topic: addTopic.topic
              });
              createdCount++;
            }
            await this.sendMessage(chatId,
              `✅ Successfully added ${createdCount} vocabulary words for "${addTopic.topic}"!\n\nUse /study to start reviewing them.`
            );
          } catch (error) {
            console.error('Error extracting vocabulary:', error);
            await this.sendMessage(chatId, `Sorry, there was an error extracting vocabulary: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again later.`);
          }
          await this.conversationStateManager.clearState(userId);
        } else if (text.toLowerCase() === 'cancel') {
          const userLang = await this.getUserInterfaceLanguage(userId);
          const texts = languageManager.getTexts(userLang);
          await this.sendMessage(chatId, texts.operationCancelled);
          await this.conversationStateManager.clearState(userId);
        }
        break;
      }
    }
  }

  private async showUserProgress(chatId: number, userId: number): Promise<void> {
    const cards = await this.userManager.getUserCards(userId);
    const totalCards = cards.length;
    const userLang = await this.getUserInterfaceLanguage(userId);
    const texts = languageManager.getTexts(userLang);
    
    if (totalCards === 0) {
      await this.sendMessage(chatId, 
        `${texts.noVocabularyStats}\n\n${texts.getStarted}\n${texts.useTopicToGenerate}\n${texts.useAddToManual}\n\n${texts.startLearningToday}`
      );
      return;
    }

    // Calculate box distribution
    const boxCounts = [1,2,3,4,5].map(box => cards.filter(c => c.box === box).length);
    const boxPercentages = boxCounts.map(count => Math.round((count / totalCards) * 100));
    
    // Calculate overall statistics
    const totalReviews = cards.reduce((sum, card) => sum + card.reviewCount, 0);
    const totalCorrect = cards.reduce((sum, card) => sum + card.correctCount, 0);
    const overallAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;
    
    // Create visual progress bars
    const progressBars = boxCounts.map((count, i) => {
      const filled = Math.round((count / Math.max(...boxCounts)) * 10);
      const boxEmoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'][i];
      const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
      return `${boxEmoji} ${bar} ${count} cards (${boxPercentages[i]}%)`;
    });

    // Calculate cards due today
    const now = new Date();
    const cardsDue = cards.filter(card => new Date(card.nextReviewAt) <= now).length;
    
    const message = `📊 **Your Learning Progress**

📚 **Total Vocabulary:** ${totalCards} words
🎯 **Overall Accuracy:** ${overallAccuracy}% (${totalCorrect}/${totalReviews})
⏰ **Cards Due Today:** ${cardsDue}

**Leitner Box Distribution:**
${progressBars.join('\n')}

📈 **Box Meanings:**
• Box 1: Daily review (new/difficult)
• Box 2: Every 2 days (getting better)
• Box 3: Every 4 days (good progress)
• Box 4: Every 8 days (almost mastered)
• Box 5: Every 16 days (mastered!)

${cardsDue > 0 ? `🔥 ${texts.readyToStudy} ${texts.useStudyToContinue}` : texts.allCaughtUpCheckLater}`;

    await this.sendMessage(chatId, message);
  }

  private async showLeitnerTip(chatId: number, box: number): Promise<void> {
    const tips = {
      1: `💡 **Box 1 Tips:**
• These are new or difficult words
• Review daily for best retention
• Don't worry about mistakes - they're part of learning!
• Try to create mental associations or mnemonics`,
      
      2: `💡 **Box 2 Tips:**
• You're making progress! 
• Review every 2 days
• Try using these words in sentences
• Practice writing them down`,
      
      3: `💡 **Box 3 Tips:**
• Great job! You're getting comfortable with these words
• Review every 4 days
• Try teaching these words to someone else
• Look for these words in real content`,
      
      4: `💡 **Box 4 Tips:**
• Excellent progress! These words are nearly mastered
• Review every 8 days
• Use them in conversations or writing
• Create stories using multiple Box 4 words`,
      
      5: `💡 **Box 5 Tips:**
• 🎉 Congratulations! You've mastered these words!
• Review every 16 days to maintain mastery
• These words are now part of your active vocabulary
• Keep using them to prevent forgetting`
    };

    const tip = tips[box as keyof typeof tips] || tips[1];
    await this.sendMessage(chatId, tip);
  }

  private async showCardMeaning(chatId: number, userId: number, cardId: string): Promise<void> {
    // Get the card from conversation state or fetch it
    const state = await this.conversationStateManager.getState(userId);
    let card = state?.review?.currentCard;
    
    if (!card || card.id !== cardId) {
      // Fallback: fetch from user cards
      const userCards = await this.userManager.getUserCards(userId);
      const foundCard = userCards.find(c => c.id === cardId);
      if (!foundCard) {
        await this.sendMessage(chatId, 'Card not found. Please try again.');
        return;
      }
      card = foundCard;
    }

    const message = `💡 **Word Meaning Revealed**

🔤 **Word:** ${card.word}
🎯 **Translation:** ${card.translation}
📝 **Definition:** ${card.definition}

━━━━━━━━━━━━━━━━━━━━━━━

🤔 **Now that you know the meaning:**`;

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: '✅ I Know It Now', callback_data: `review_correct:${card.id}` },
          { text: '❌ Still Learning', callback_data: `review_incorrect:${card.id}` }
        ]
      ]
    };

    await this.sendMessage(chatId, message, keyboard);
  }

  private async showDetailedStats(chatId: number, userId: number): Promise<void> {
    const cards = await this.userManager.getUserCards(userId);
    if (cards.length === 0) {
      await this.sendMessage(chatId, '📊 No detailed stats available yet. Add some vocabulary first!');
      return;
    }

    // Advanced statistics
    const boxCounts = [1,2,3,4,5].map(box => cards.filter(c => c.box === box).length);
    const totalReviews = cards.reduce((sum, card) => sum + card.reviewCount, 0);
    const totalCorrect = cards.reduce((sum, card) => sum + card.correctCount, 0);
    
    // Performance by box
    const boxStats = [1,2,3,4,5].map(box => {
      const boxCards = cards.filter(c => c.box === box);
      const boxReviews = boxCards.reduce((sum, card) => sum + card.reviewCount, 0);
      const boxCorrect = boxCards.reduce((sum, card) => sum + card.correctCount, 0);
      const accuracy = boxReviews > 0 ? Math.round((boxCorrect / boxReviews) * 100) : 0;
      return { box, count: boxCards.length, accuracy, reviews: boxReviews };
    });

    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentCards = cards.filter(c => new Date(c.updatedAt) >= weekAgo);
    const recentReviews = recentCards.reduce((sum, card) => sum + card.reviewCount, 0);

    // Study streaks and patterns
    const studyDates = [...new Set(cards.filter(c => c.reviewCount > 0).map(c => c.updatedAt.split('T')[0]))];
    const studyStreak = studyDates.length;

    const message = `📈 **Detailed Learning Analytics**

📚 **Overall Performance:**
• Total Vocabulary: ${cards.length} words
• Total Reviews: ${totalReviews}
• Success Rate: ${totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0}%
• Study Days: ${studyStreak} days

📊 **Performance by Box:**
${boxStats.map(stat => 
  `Box ${stat.box}: ${stat.count} words • ${stat.accuracy}% accuracy • ${stat.reviews} reviews`
).join('\n')}

📅 **Recent Activity (7 days):**
• Cards Reviewed: ${recentCards.length}
• Reviews Completed: ${recentReviews}
• New Words Added: ${cards.filter(c => new Date(c.createdAt) >= weekAgo).length}

🎯 **Learning Insights:**
${boxCounts[4] > 0 ? `🌟 ${boxCounts[4]} words mastered!` : ''}
${boxCounts[0] > 10 ? `⚠️ ${boxCounts[0]} words need attention in Box 1` : ''}
${totalReviews > 0 && (totalCorrect / totalReviews) < 0.6 ? '💪 Focus on accuracy - review slowly!' : ''}
${studyStreak >= 5 ? '🔥 Great consistency! Keep it up!' : ''}

📈 **Progress Trend:** ${boxCounts[3] + boxCounts[4] > boxCounts[0] ? 'Improving 📈' : 'Building Foundation 🏗️'}`;

    await this.sendMessage(chatId, message);
  }

  private async showStudyGoals(chatId: number, userId: number): Promise<void> {
    const cards = await this.userManager.getUserCards(userId);
    const totalCards = cards.length;
    const masteredWords = cards.filter(c => c.box === 5).length;
    const cardsDue = cards.filter(c => new Date(c.nextReviewAt) <= new Date()).length;

    // Calculate goals based on current progress
    const dailyGoal = Math.max(5, Math.min(20, Math.ceil(totalCards * 0.1)));
    const weeklyGoal = Math.max(10, Math.min(50, Math.ceil(totalCards * 0.3)));
    const masteryGoal = Math.max(5, Math.min(totalCards, Math.ceil(totalCards * 0.2)));

    const message = `🎯 **Your Learning Goals**

📊 **Current Status:**
• Total Vocabulary: ${totalCards} words
• Mastered Words: ${masteredWords} (${totalCards > 0 ? Math.round((masteredWords / totalCards) * 100) : 0}%)
• Cards Due Today: ${cardsDue}

🎯 **Recommended Goals:**

📅 **Daily Goal:**
• Review ${dailyGoal} cards per day
• ${cardsDue >= dailyGoal ? '✅ Ready to achieve today!' : `Need ${dailyGoal - cardsDue} more cards (add vocabulary)`}

📅 **Weekly Goal:**
• Review ${weeklyGoal} cards this week
• Add 5-10 new words per week

🏆 **Mastery Goal:**
• Master ${masteryGoal} words (reach Box 5)
• Progress: ${masteredWords}/${masteryGoal} (${Math.round((masteredWords / masteryGoal) * 100)}%)

💡 **Tips for Success:**
• Study consistently every day
• Focus on quality over quantity
• Review difficult words more often
• Use spaced repetition effectively

🎯 **Next Steps:**
${cardsDue > 0 ? `📚 Start with ${cardsDue} cards due today` : '➕ Add new vocabulary to continue learning'}
${masteredWords < 5 ? '🎯 Focus on mastering your first 5 words' : ''}
${totalCards < 20 ? '📝 Build vocabulary with /topic command' : ''}`;

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: '📚 Study Now', callback_data: 'start_study' },
          { text: '➕ Add Words', callback_data: 'add_vocabulary' }
        ],
        [
          { text: '📊 View Progress', callback_data: 'show_progress' }
        ]
      ]
    };

    await this.sendMessage(chatId, message, keyboard);
  }

  private async executeTopicWordExtraction(chatId: number, userId: number): Promise<void> {
    const state = await this.conversationStateManager.getState(userId);
    if (!state || !state.addTopic) {
      await this.sendMessage(chatId, '❌ Session expired. Please start again with /topic.');
      return;
    }

    const addTopic = state.addTopic;
    await this.sendMessage(chatId, `🔄 Extracting vocabulary for "${addTopic.topic}"...`);
    
    try {
      const words = await this.wordExtractor.extractWords({
        topic: addTopic.topic!,
        sourceLanguage: addTopic.sourceLanguage!,
        targetLanguage: addTopic.targetLanguage!,
        count: addTopic.wordCount,
        wordLevel: addTopic.wordLevel,
        descriptionLanguage: addTopic.descriptionLanguage
      });

      if (words.length === 0) {
        await this.sendMessage(chatId, 'Sorry, I couldn\'t extract vocabulary for this topic. Please try a different topic.');
        await this.conversationStateManager.clearState(userId);
        return;
      }

      let createdCount = 0;
      for (const word of words) {
        await this.userManager.createCard({
          userId: userId,
          word: word.word,
          translation: word.translation,
          definition: word.definition,
          sourceLanguage: addTopic.sourceLanguage!,
          targetLanguage: addTopic.targetLanguage!,
          box: 1,
          nextReviewAt: new Date().toISOString(),
          reviewCount: 0,
          correctCount: 0,
          topic: addTopic.topic
        });
        createdCount++;
      }

      const keyboard: TelegramInlineKeyboard = {
        inline_keyboard: [
          [
            { text: '📚 Study Now', callback_data: 'start_study' },
            { text: '📊 View Stats', callback_data: 'view_stats' }
          ],
          [
            { text: '➕ Add More', callback_data: 'add_topic' }
          ]
        ]
      };

      await this.sendMessage(chatId,
        `✅ **Successfully added ${createdCount} vocabulary words for "${addTopic.topic}"!**\n\nReady to start learning?`,
        keyboard
      );
    } catch (error) {
      console.error('Error extracting vocabulary:', error);
      await this.sendMessage(chatId, `Sorry, there was an error extracting vocabulary: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again later.`);
    }
    
    await this.conversationStateManager.clearState(userId);
  }

  // Support and messaging methods
  private async sendSupportMenu(chatId: number, userId: number): Promise<void> {
    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: '🎫 Create Support Ticket', callback_data: 'create_ticket' },
          { text: '� My Tickets', callback_data: 'my_tickets' }
        ],
        [
          { text: '💬 View Messages', callback_data: 'view_messages' },
          { text: '❓ FAQ', callback_data: 'show_faq' }
        ],
        [
          { text: '📞 Contact Info', callback_data: 'show_contact' }
        ]
      ]
    };

    const message = `🛠️ **Support Center**

How can we help you today?

• **Create Support Ticket** - Report issues or ask questions
• **My Tickets** - View your support tickets and admin responses
• **View Messages** - Check direct messages from admin
• **FAQ** - Common questions and answers
• **Contact Info** - Alternative ways to reach us

Choose an option below:`;

    await this.sendMessage(chatId, message, keyboard);
  }

  private async startSupportTicket(chatId: number, userId: number): Promise<void> {
    const user = await this.userManager.getUser(userId);
    
    const state: ConversationState = {
      supportTicket: {
        step: 'ask_subject',
        userId,
        userEmail: user?.email,
        userName: user?.fullName || user?.firstName
      }
    };
    
    await this.conversationStateManager.setState(userId, state);
    
    await this.sendMessage(chatId, 
      `🎫 **Create Support Ticket**

What's the subject of your inquiry? Please provide a brief description of your issue or question.

Type your subject below:`);
  }

  private async showUserMessages(chatId: number, userId: number): Promise<void> {
    const messages = await this.adminService.getUserMessages(userId);
    
    if (messages.length === 0) {
      await this.sendMessage(chatId, '📭 **No Messages**\n\nYou don\'t have any messages from our support team yet.');
      return;
    }

    const unreadCount = messages.filter(m => !m.isRead).length;
    let messageText = `💬 **Your Messages** ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}\n\n`;
    
    for (const message of messages.slice(0, 5)) { // Show latest 5 messages
      const readStatus = message.isRead ? '✅' : '🆕';
      const date = new Date(message.sentAt).toLocaleDateString();
      messageText += `${readStatus} **${date}**\n${message.message}\n\n`;
      
      if (!message.isRead) {
        await this.adminService.markMessageAsRead(message.id);
      }
    }

    if (messages.length > 5) {
      messageText += `_...and ${messages.length - 5} more messages_`;
    }

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: '🎫 Create Ticket', callback_data: 'create_ticket' },
          { text: '🔄 Refresh', callback_data: 'view_messages' }
        ]
      ]
    };

    await this.sendMessage(chatId, messageText, keyboard);
  }

  private async showFAQ(chatId: number): Promise<void> {
    const faqText = `❓ **Frequently Asked Questions**

**Q: How does the Leitner system work?**
A: The Leitner system uses spaced repetition. Words move through 5 boxes based on your performance. Correct answers move words to higher boxes with longer intervals.

**Q: How do I add vocabulary?**
A: Use /topic to generate vocabulary from any subject, or /add to manually add words.

**Q: Why can't I see some buttons?**
A: Make sure your Telegram app is updated. If problems persist, contact support.

**Q: How can I change languages?**
A: Use /settings to configure your source and target languages.

**Q: How do I reset my progress?**
A: Contact support through /support for account management.

**Q: Can I export my vocabulary?**
A: This feature is coming soon. Contact support for manual exports.

Need more help? Use /support to contact our team!`;

    await this.sendMessage(chatId, faqText);
  }

  private async sendContactInfo(chatId: number): Promise<void> {
    const contactText = `📞 **Contact Information**

**Primary Support:**
• Use /support in this bot
• Create a support ticket for detailed help

**Response Times:**
• Support tickets: Within 24 hours
• Urgent issues: Within 4 hours

**What to include in your support request:**
• Clear description of the issue
• Steps you've tried
• Screenshots if applicable
• Your user ID: ${chatId}

**Bot Version:** 2.0.0
**Last Updated:** September 2025

We're here to help! 🎯`;

    await this.sendMessage(chatId, contactText);
  }

  private async showDirectMessages(chatId: number, userId: number): Promise<void> {
    try {
      const messages = await this.adminService.getUserMessages(userId);
      
      if (messages.length === 0) {
        await this.sendMessage(chatId, '📬 No messages for you.');
        return;
      }

      const messageText = messages.map((msg, index) => 
        `📩 **Message ${index + 1}** (${new Date(msg.sentAt).toLocaleDateString()})
${msg.message}
${msg.isRead ? '✅ Read' : '🔵 New'}`
      ).join('\n\n');

      await this.sendMessage(chatId, `📬 **Your Messages**\n\n${messageText}`);
      
      // Mark messages as read
      for (const msg of messages.filter(m => !m.isRead)) {
        await this.adminService.markMessageAsRead(msg.id);
      }
    } catch (error) {
      console.error('Error showing direct messages:', error);
      await this.sendMessage(chatId, '❌ Failed to load messages. Please try again.');
    }
  }

  private async showUserTickets(chatId: number, userId: number): Promise<void> {
    try {
      const tickets = await this.adminService.getUserTickets(userId);
      
      if (tickets.length === 0) {
        const keyboard: TelegramInlineKeyboard = {
          inline_keyboard: [
            [
              { text: '🎫 Create New Ticket', callback_data: 'create_ticket' },
              { text: '🔙 Back to Support', callback_data: 'show_support_menu' }
            ]
          ]
        };
        
        await this.sendMessage(chatId, '📋 **My Support Tickets**\n\nYou have no support tickets yet.\n\nCreate a new ticket if you need help!', keyboard);
        return;
      }

      let ticketList = '📋 **My Support Tickets**\n\n';
      
      tickets.forEach((ticket, index) => {
        const statusEmoji = this.getTicketStatusEmoji(ticket.status);
        const priorityEmoji = this.getTicketPriorityEmoji(ticket.priority);
        const createdDate = new Date(ticket.createdAt).toLocaleDateString();
        
        ticketList += `${statusEmoji} **Ticket #${index + 1}** ${priorityEmoji}\n`;
        ticketList += `📅 ${createdDate}\n`;
        ticketList += `📝 ${ticket.subject}\n`;
        ticketList += `💬 ${ticket.message.substring(0, 100)}${ticket.message.length > 100 ? '...' : ''}\n`;
        
        if (ticket.adminResponse) {
          ticketList += `👨‍💼 **Admin Response:**\n${ticket.adminResponse.substring(0, 150)}${ticket.adminResponse.length > 150 ? '...' : ''}\n`;
        }
        
        if (ticket.resolvedAt) {
          ticketList += `✅ Resolved: ${new Date(ticket.resolvedAt).toLocaleDateString()}\n`;
        }
        
        ticketList += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
      });

      const keyboard: TelegramInlineKeyboard = {
        inline_keyboard: [
          [
            { text: '🎫 Create New Ticket', callback_data: 'create_ticket' },
            { text: '🔄 Refresh', callback_data: 'my_tickets' }
          ],
          [
            { text: '🔙 Back to Support', callback_data: 'show_support_menu' }
          ]
        ]
      };

      await this.sendMessage(chatId, ticketList, keyboard);
      
    } catch (error) {
      console.error('Error showing user tickets:', error);
      await this.sendMessage(chatId, '❌ Failed to load your tickets. Please try again.');
    }
  }

  private async showUserNotifications(chatId: number, userId: number): Promise<void> {
    try {
      const notifications = await this.adminService.getUserNotifications(userId);
      
      if (notifications.length === 0) {
        const keyboard: TelegramInlineKeyboard = {
          inline_keyboard: [
            [
              { text: '🔙 Back to Support', callback_data: 'show_support_menu' }
            ]
          ]
        };
        
        await this.sendMessage(chatId, '🔔 **Notifications**\n\nYou have no notifications.\n\nWe\'ll notify you when admins respond to your tickets!', keyboard);
        return;
      }

      let notificationText = '🔔 **Your Notifications**\n\n';
      
      notifications.slice(0, 10).forEach((notification, index) => {
        const statusEmoji = notification.isRead ? '✅' : '🔵';
        const createdDate = new Date(notification.createdAt).toLocaleDateString();
        
        notificationText += `${statusEmoji} **${notification.title}**\n`;
        notificationText += `📅 ${createdDate}\n`;
        notificationText += `💬 ${notification.message.substring(0, 200)}${notification.message.length > 200 ? '...' : ''}\n\n`;
        notificationText += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
      });

      if (notifications.length > 10) {
        notificationText += `\n...and ${notifications.length - 10} more notifications.`;
      }

      const keyboard: TelegramInlineKeyboard = {
        inline_keyboard: [
          [
            { text: '✅ Mark All Read', callback_data: 'mark_notifications_read' },
            { text: '🔄 Refresh', callback_data: 'show_notifications' }
          ],
          [
            { text: '🔙 Back to Support', callback_data: 'show_support_menu' }
          ]
        ]
      };

      await this.sendMessage(chatId, notificationText, keyboard);
      
      // Mark notifications as read automatically
      for (const notification of notifications.filter(n => !n.isRead)) {
        await this.adminService.markNotificationAsRead(notification.id);
      }
      
    } catch (error) {
      console.error('Error showing user notifications:', error);
      await this.sendMessage(chatId, '❌ Failed to load notifications. Please try again.');
    }
  }

  private async markAllNotificationsRead(chatId: number, userId: number): Promise<void> {
    try {
      const notifications = await this.adminService.getUserNotifications(userId);
      
      for (const notification of notifications) {
        if (!notification.isRead) {
          await this.adminService.markNotificationAsRead(notification.id);
        }
      }
      
      await this.sendMessage(chatId, '✅ All notifications marked as read!');
      await this.showUserNotifications(chatId, userId);
      
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      await this.sendMessage(chatId, '❌ Failed to mark notifications as read.');
    }
  }

  private getTicketStatusEmoji(status: string): string {
    switch (status) {
      case 'open': return '🔴';
      case 'in_progress': return '🟡';
      case 'resolved': return '✅';
      case 'closed': return '⚫';
      default: return '🔵';
    }
  }

  private getTicketPriorityEmoji(priority: string): string {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '🔥';
      case 'medium': return '📝';
      case 'low': return '📋';
      default: return '📝';
    }
  }

  private async sendFAQ(chatId: number): Promise<void> {
    const faqText = `❓ **Frequently Asked Questions**

**Q: How does the Leitner system work?**
A: Words move between 5 boxes based on your performance. Correct answers promote words to higher boxes with longer intervals.

**Q: How often should I study?**
A: Daily practice is recommended. The system schedules reviews automatically based on spaced repetition.

**Q: Can I add my own words?**
A: Yes! Use /topic to extract words from any topic, or contact support for bulk additions.

**Q: What languages are supported?**
A: We support 19+ languages including English, Spanish, French, German, Chinese, Japanese, and more.

**Q: How do I reset my progress?**
A: Contact support for account management. We can reset specific words or your entire progress.

**Q: Can I export my vocabulary?**
A: This feature is coming soon. Contact support for manual exports.

Need more help? Use /support to contact our team!`;

    await this.sendMessage(chatId, faqText);
  }

  private async setTicketPriority(chatId: number, userId: number, priority: 'low' | 'medium' | 'high' | 'urgent'): Promise<void> {
    const state = await this.conversationStateManager.getState(userId);
    if (!state?.supportTicket) {
      await this.sendMessage(chatId, '❌ No active ticket found. Please start a new support request.');
      return;
    }

    // Update the conversation state with priority
    const updatedState: ConversationState = {
      ...state,
      supportTicket: {
        ...state.supportTicket,
        priority
      }
    };
    
    await this.conversationStateManager.setState(userId, updatedState);

    const priorityEmoji = priority === 'urgent' ? '🚨' : '📋';
    await this.sendMessage(chatId, `${priorityEmoji} Priority set to: **${priority.toUpperCase()}**

Now I'll submit your ticket to our support team.`);

    // Auto-submit the ticket
    await this.submitSupportTicket(chatId, userId);
  }

  // Notification system for admin actions
  async checkForNotifications(userId: number): Promise<void> {
    try {
      // Check for unread direct messages
      const messages = await this.adminService.getUserMessages(userId, true);
      if (messages.length > 0) {
        const chatId = userId; // In private chats, userId = chatId
        await this.sendMessage(chatId, `📬 You have ${messages.length} new message${messages.length > 1 ? 's' : ''} from support! Use /support to view them.`);
      }

      // Check for new bulk word assignments
      const allAssignments = await this.adminService.getBulkAssignments(1, 100);
      const userAssignments = allAssignments.assignments.filter(a => 
        a.targetUserIds.includes(userId) && !a.notificationSent
      );
      
      if (userAssignments.length > 0) {
        const chatId = userId;
        for (const assignment of userAssignments) {
          await this.sendMessage(chatId, `📚 New vocabulary assigned to you! 
**Title:** ${assignment.title || 'New Vocabulary Assignment'}
**Words:** ${assignment.words.length} new words
**Description:** ${assignment.description || 'New vocabulary to study'}

Start studying with /study!`);
          
          // Log the notification
          await this.adminService.logActivity({
            userId,
            action: 'notification_sent',
            details: `Bulk assignment notification: ${assignment.id}`
          });
        }
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }

  // Language management methods
  private async showInterfaceLanguageMenu(chatId: number, userId: number): Promise<void> {
    const userLang = await this.getUserInterfaceLanguage(userId);
    const texts = languageManager.getTexts(userLang);
    
    const message = `${texts.selectLanguage} ${texts.interfaceLanguage}:`;
    const keyboard = languageManager.createLanguageKeyboard(userLang);
    
    await this.sendMessage(chatId, message, keyboard);
  }

  private async setInterfaceLanguage(chatId: number, userId: number, languageCode: string): Promise<void> {
    const currentLang = await this.getUserInterfaceLanguage(userId);
    
    if (!languageManager.isLanguageSupported(languageCode)) {
      const texts = languageManager.getTexts(currentLang);
      await this.sendMessage(chatId, `${texts.error}: ${texts.invalidInput}`);
      return;
    }

    // Update user's interface language
    await this.userManager.updateUser(userId, { interfaceLanguage: languageCode });
    
    // Get texts in the new language
    const texts = languageManager.getTexts(languageCode);
    await this.sendMessage(chatId, texts.languageUpdated);
    
    // Show settings menu in new language
    await this.sendSettingsMenu(chatId, userId);
  }

  private async showReminderSettings(chatId: number, userId: number): Promise<void> {
    const userLang = await this.getUserInterfaceLanguage(userId);
    const texts = languageManager.getTexts(userLang);
    const user = await this.userManager.getUser(userId);
    
    const currentReminders = user?.reminderTimes || [];
    const reminderText = currentReminders.length > 0 
      ? currentReminders.join(', ') 
      : 'None set';

    const message = `${texts.reminderSettings}

Current reminders: ${reminderText}

Coming soon: Set custom reminder times for your daily study sessions.`;

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: texts.back, callback_data: 'settings_menu' }
        ]
      ]
    };

    await this.sendMessage(chatId, message, keyboard);
  }
}
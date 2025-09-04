import { UserManager } from '../services/user-manager';
import { WordExtractor } from '../services/word-extractor';
import { ScheduleManager } from '../services/schedule-manager';
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
        const message = `🔔 Daily Reminder\nYou have ${cardsToReview.length} card(s) ready for review! Use /study to start.`;
        await this.sendMessage(user.id, message);
      }
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

  constructor(
    private token: string,
    private userManager: UserManager,
    private wordExtractor: WordExtractor,
    private scheduleManager: ScheduleManager,
    kv: any // Accept any type for KVNamespace to avoid TS2345 errors
  ) {
    this.baseUrl = `https://api.telegram.org/bot${token}`;
    this.conversationStateManager = new ConversationStateManager(kv);
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
    
    if (totalCards === 0) {
      await this.sendMessage(chatId, 
        '📊 **Your Learning Statistics**\n\n📚 No vocabulary added yet!\n\n🚀 **Get Started:**\n• Use /topic to generate vocabulary\n• Use /add to manually add words\n\nStart your learning journey today! 💪'
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

${cardsDue > 0 ? '📚 Ready to study? Use /study to continue learning!' : '🎉 All caught up! Add more vocabulary with /topic'}`;

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
        await this.sendMessage(chatId, '👤 Please complete your registration first before using other features.\n\nUse /start to begin registration.');
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
        await this.sendHelpMessage(chatId);
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
      await this.sendMessage(chatId, 'Please use the buttons to respond during review sessions, or type /study to start a new session.');
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
            await this.sendMessage(chatId, 'Please select a valid number between 1 and 100.');
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
        await this.sendHelpMessage(chatId);
        break;
      case 'confirm_add_topic':
        if (params[0] === 'yes') {
          await this.executeTopicWordExtraction(chatId, userId);
        } else {
          await this.conversationStateManager.clearState(userId);
          await this.sendMessage(chatId, '❌ Cancelled. Use /topic to try again.');
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
    }
  }

  private async sendWelcomeMessage(chatId: number): Promise<void> {
    // Get user info for personalization
    const userId = chatId; // In private chats, chatId equals userId
    const user = await this.userManager.getUser(userId);
    const userName = user?.fullName || user?.firstName || 'there';
    
    const message = `🎯 **Welcome back, ${userName}!**

Ready to continue your vocabulary learning journey with the Leitner spaced repetition system?

🚀 **Quick Start:**
• Use /topic to generate vocabulary from any topic
• Use /add to manually add words  
• Use /study to review your flashcards
• Use /settings to configure languages and reminders

🌍 I support multiple languages and can extract vocabulary from any topic you're interested in!

Choose an option below to get started:`;

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: '📚 Study Now', callback_data: 'start_study' },
          { text: '➕ Add Topic', callback_data: 'add_topic' }
        ],
        [
          { text: '📊 View Stats', callback_data: 'view_stats' },
          { text: '⚙️ Settings', callback_data: 'open_settings' }
        ],
        [
          { text: '❓ Help', callback_data: 'show_help' }
        ]
      ]
    };

    await this.sendMessage(chatId, message, keyboard);
  }

  private async sendHelpMessage(chatId: number): Promise<void> {
    const message = `📚 **Leitner Learning Bot Commands:**

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

🆘 **Help:**
/help - Show this help message

💡 **Tips:**
• Study regularly for best results
• Words move through 5 boxes based on your performance
• Mastered words are reviewed less frequently

Choose an action below:`;

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: '📚 Start Study', callback_data: 'start_study' },
          { text: '➕ Add Vocabulary', callback_data: 'add_vocabulary' }
        ],
        [
          { text: '📊 My Progress', callback_data: 'view_stats' },
          { text: '🗂️ My Words', callback_data: 'show_words' }
        ],
        [
          { text: '⚙️ Settings', callback_data: 'open_settings' }
        ]
      ]
    };

    await this.sendMessage(chatId, message, keyboard);
  }

  private async startStudySession(chatId: number, userId: number): Promise<void> {
    const cardsToReview = await this.userManager.getCardsDueForReview(userId, 1);
    
    if (cardsToReview.length === 0) {
      // Show user's current progress when no cards are due
      const cards = await this.userManager.getUserCards(userId);
      if (cards.length === 0) {
        await this.sendMessage(chatId, 
          '📚 **Ready to start learning?**\n\nYou haven\'t added any vocabulary yet!\n\n• Use /topic to generate vocabulary from any subject\n• Use /add to manually add words\n\nThe Leitner system will help you master new words efficiently! 🚀'
        );
      } else {
        const nextCard = cards.reduce((earliest, card) => 
          new Date(card.nextReviewAt) < new Date(earliest.nextReviewAt) ? card : earliest
        );
        const nextReview = new Date(nextCard.nextReviewAt);
        const hoursUntil = Math.round((nextReview.getTime() - Date.now()) / (1000 * 60 * 60));
        
        await this.sendMessage(chatId, 
          `🎉 **All caught up!**\n\nYou've reviewed all due cards. Great work!\n\n📊 **Your vocabulary:** ${cards.length} words\n⏰ **Next review:** ${hoursUntil < 24 ? `${hoursUntil} hours` : `${Math.round(hoursUntil/24)} days`}\n\n💡 Use /topic to add more vocabulary or /progress to see your stats!`
        );
      }
      return;
    }

    // Create new review session with motivational message
    await this.userManager.createReviewSession(userId);
    
    const cards = await this.userManager.getUserCards(userId);
    const sessionMessage = `🚀 **Study Session Started!**

📊 **Today's Review:** ${cardsToReview.length} cards
📚 **Total Vocabulary:** ${cards.length} words

🎯 **How the Leitner System Works:**
• Correct answers → Move to next box (review less often)
• Incorrect answers → Back to Box 1 (review more often)
• Master words by reaching Box 5!

💡 **Pro tip:** You can type your answers or use the buttons. Let's begin!`;

    await this.sendMessage(chatId, sessionMessage);
    
    // Start with the first card
    await this.presentCard(chatId, userId, cardsToReview[0]);
  }

  private async presentCard(chatId: number, userId: number, card: Card): Promise<void> {
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

    // Exactly 3 buttons as requested: I know, I don't know, Show meaning
    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: '✅ I Know', callback_data: `review_correct:${card.id}` },
          { text: '❌ I Don\'t Know', callback_data: `review_incorrect:${card.id}` },
          { text: '💡 Show Meaning', callback_data: `show_meaning:${card.id}` }
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
    const message = `⚙️ **Settings**

Configure your learning preferences:

• Languages: Set your source and target languages
• Reminders: Set daily reminder times
• Study preferences: Adjust review settings

Use /languages to see supported languages.`;
    await this.sendMessage(chatId, message);
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
        step: 'ask_name'
      }
    };
    await this.conversationStateManager.setState(userId, registrationState);
    
    const message = `🎯 **Welcome to the Leitner Learning Bot!**

Before we start your vocabulary learning journey, I need to get to know you better.

👤 **What's your full name?**

Please type your name below:`;

    await this.sendMessage(chatId, message);
  }

  private async handleRegistrationFlow(chatId: number, userId: number, text: string): Promise<void> {
    const state = await this.conversationStateManager.getState(userId);
    if (!state || !state.registration) {
      // Restart registration if state is missing
      await this.startRegistrationFlow(chatId, userId);
      return;
    }

    const registration = state.registration;
    switch (registration.step) {
      case 'ask_name': {
        if (text.trim().length < 2) {
          await this.sendMessage(chatId, '❌ Please enter a valid name (at least 2 characters).');
          return;
        }
        registration.fullName = text.trim();
        registration.step = 'ask_email';
        await this.conversationStateManager.setState(userId, state);
        
        await this.sendMessage(chatId, `Nice to meet you, ${registration.fullName}! 👋

📧 **What's your email address?**

This will help us:
• Send you learning reminders (optional)
• Keep your progress safe
• Provide personalized insights

Please type your email below:`);
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
              { text: '✅ Confirm', callback_data: 'confirm_registration:yes' },
              { text: '✏️ Edit', callback_data: 'confirm_registration:edit' }
            ]
          ]
        };

        await this.sendMessage(chatId, 
          `📋 **Please confirm your information:**

👤 **Name:** ${registration.fullName}
📧 **Email:** ${registration.email}

Is this information correct?`, keyboard);
        break;
      }
      case 'confirm': {
        // This case is handled by callback query
        break;
      }
    }
  }

  private async completeRegistration(chatId: number, userId: number): Promise<void> {
    const state = await this.conversationStateManager.getState(userId);
    if (!state || !state.registration) return;

    const registration = state.registration;
    
    // Update user with registration info
    await this.userManager.updateUser(userId, {
      fullName: registration.fullName,
      email: registration.email,
      isRegistrationComplete: true
    });

    // Clear registration state
    await this.conversationStateManager.clearState(userId);

    // Send welcome message with getting started options
    await this.sendWelcomeMessage(chatId);
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
          await this.sendMessage(chatId, 'Operation cancelled.');
          await this.conversationStateManager.clearState(userId);
        }
        break;
      }
    }
  }

  private async showUserProgress(chatId: number, userId: number): Promise<void> {
    const cards = await this.userManager.getUserCards(userId);
    const totalCards = cards.length;
    
    if (totalCards === 0) {
      await this.sendMessage(chatId, '📊 You haven\'t added any vocabulary yet! Use /topic or /add to get started.');
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

${cardsDue > 0 ? '🔥 Ready to study? Use /study to continue!' : '🎉 All caught up! Check back later for more reviews.'}`;

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
}
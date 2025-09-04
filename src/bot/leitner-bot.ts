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
import { AddTopicStep, ConversationState } from '../types/conversation-state';

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
  private async sendMessage(chatId: number, text: string, extra?: any): Promise<void> {
    const url = `${this.baseUrl}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text: text,
      ...extra
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
        console.error('Telegram API error:', response.status, errorText);
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
        language: message.from.language_code || 'en'
      });
      await this.sendWelcomeMessage(chatId);
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
    await this.sendMessage(chatId, 'Statistics not implemented yet.');
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
    const keyboard = {
      keyboard: [
        [
          { text: '/study' },
          { text: '/topic' },
          { text: '/add' }
        ],
        [
          { text: '/mywords' },
          { text: '/mytopics' },
          { text: '/stats' }
        ],
        [
          { text: '/settings' },
          { text: '/help' }
        ]
      ],
      resize_keyboard: true,
      is_persistent: true
    };
    await this.sendMessage(chatId, '📋 Main Menu: Choose an option below or type a command.', { reply_markup: keyboard });
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
    switch (command) {
      case '/start':
        await this.sendWelcomeMessage(chatId);
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
    // Check for ongoing add topic/word flow FIRST
    const state = await this.conversationStateManager.getState(userId);
    if (state && state.addTopic) {
      await this.handleAddTopicStep(chatId, userId, text, state);
      return;
    }
    // Then check if user is in an active review session
    const activeSession = await this.userManager.getActiveReviewSession(userId);
    if (activeSession) {
      await this.handleReviewResponse(chatId, userId, text);
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
        await this.handleReviewAnswer(chatId, userId, params[0], true);
        break;
      case 'review_incorrect':
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
      case 'next_card':
        await this.continueStudySession(chatId, userId);
        break;
      case 'end_session':
        await this.endStudySession(chatId, userId);
        break;
    }
  }

  private async sendWelcomeMessage(chatId: number): Promise<void> {
    const message = `🎯 Welcome to the Leitner Learning Bot!

I'll help you learn new vocabulary using the proven Leitner spaced repetition system.

🚀 Getting Started:
• Use /topic <subject> to generate vocabulary from any topic
• Use /add <word> <translation> to manually add words
• Use /study to review your flashcards
    // Multi-step add topic/word flow handler
• Use /settings to configure languages and reminders

🌍 I support multiple languages and can extract vocabulary from any topic you're interested in!

Type /help for a complete list of commands.`;

    await this.sendMessage(chatId, message);
  }

  private async sendHelpMessage(chatId: number): Promise<void> {
    const message = `📚 Leitner Learning Bot Commands:

🎯 **Learning Commands:**
/study - Start reviewing your flashcards
/topic <subject> - Generate vocabulary from a topic
/add <word> <translation> - Add a word manually

📊 **Progress & Stats:**
/stats - View your learning statistics
/languages - See supported languages

⚙️ **Settings:**
/settings - Configure languages and reminders

🆘 **Help:**
/help - Show this help message

💡 **Tips:**
• Study regularly for best results
• I'll remind you when cards are due
• Words move through 5 boxes based on your performance
• Mastered words are reviewed less frequently`;

    await this.sendMessage(chatId, message);
  }

  private async startStudySession(chatId: number, userId: number): Promise<void> {
    const cardsToReview = await this.userManager.getCardsDueForReview(userId, 1);
    
    if (cardsToReview.length === 0) {
      await this.sendMessage(chatId, 
        '🎉 No cards due for review right now!\n\nUse /topic to add new vocabulary or check back later.'
      );
      return;
    }

    // Create new review session
    await this.userManager.createReviewSession(userId);
    
    // Start with the first card
    await this.presentCard(chatId, userId, cardsToReview[0]);
  }

  private async presentCard(chatId: number, userId: number, card: Card): Promise<void> {
    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: '✅ I know this', callback_data: `review_correct:${card.id}` },
          { text: '❌ I don\'t know', callback_data: `review_incorrect:${card.id}` }
        ],
        [
          { text: '💡 Show Definition', callback_data: `show_definition:${card.id}` }
        ]
      ]
    };

    const message = `📖 **Review Card**

**Word:** ${card.word}
**Language:** ${card.sourceLanguage} → ${card.targetLanguage}
**Box:** ${card.box}/5

What is the translation of "${card.word}"?`;

    await this.sendMessage(chatId, message, keyboard);
  }

  private async handleReviewAnswer(chatId: number, userId: number, cardId: string, isCorrect: boolean): Promise<void> {
    // Process the review
    const updatedCard = await this.scheduleManager.processCardReview(userId, cardId, isCorrect);
    
    if (!updatedCard) {
      await this.sendMessage(chatId, 'Error processing review. Please try again.');
      return;
    }

    // Show the correct answer
    const resultEmoji = isCorrect ? '✅' : '❌';
    const message = `${resultEmoji} **${isCorrect ? 'Correct!' : 'Incorrect'}**

**Word:** ${updatedCard.word}
**Translation:** ${updatedCard.translation}
**Definition:** ${updatedCard.definition}

${isCorrect ? `Moved to box ${updatedCard.box}` : 'Moved back to box 1'}
Next review: ${new Date(updatedCard.nextReviewAt).toLocaleDateString()}`;

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: '▶️ Next Card', callback_data: 'next_card' },
          { text: '🏁 End Session', callback_data: 'end_session' }
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
    // Handle text responses during review sessions
    await this.sendMessage(chatId, 'Please use the buttons to respond during review sessions.');
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
        await this.sendMessage(chatId, '🌍 What is the language of the words?', { inline_keyboard: langButtons });
        break;
      }
      case 'ask_source_language': {
        addTopic.sourceLanguage = text;
        addTopic.step = 'ask_target_language';
        await this.conversationStateManager.setState(userId, state);
        const langButtons = Object.entries(LANGUAGES).map(([code, name]) => [{ text: name, callback_data: `set_target_lang:${code}` }]);
        await this.sendMessage(chatId, '🌐 What is the language for the meaning/translation?', { inline_keyboard: langButtons });
        break;
      }
      case 'ask_target_language': {
        addTopic.targetLanguage = text;
        addTopic.step = 'ask_description_language';
        await this.conversationStateManager.setState(userId, state);
        const langButtons = Object.entries(LANGUAGES).map(([code, name]) => [{ text: name, callback_data: `set_desc_lang:${code}` }]);
        await this.sendMessage(chatId, '📝 What is the language for the description/definition? (should match the word language)', { inline_keyboard: langButtons });
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
        await this.sendMessage(chatId, '📈 What is the level of the words?', { inline_keyboard: levelButtons });
        break;
      }
      case 'ask_word_level': {
        addTopic.wordLevel = text;
        addTopic.step = 'ask_word_count';
        await this.conversationStateManager.setState(userId, state);
        const countButtons = [
          [{ text: '5', callback_data: 'set_count:5' }, { text: '10', callback_data: 'set_count:10' }, { text: '20', callback_data: 'set_count:20' }]
        ];
        await this.sendMessage(chatId, '🔢 How many words do you want to add?', { inline_keyboard: countButtons });
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
            await this.sendMessage(chatId, 'Sorry, there was an error extracting vocabulary. Please try again later.');
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
}
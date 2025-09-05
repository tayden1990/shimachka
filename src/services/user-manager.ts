import { User, Card, Topic, ReviewSession } from '../types';

export class UserManager {
  constructor(private kv: KVNamespace) {}

  async getUser(userId: number): Promise<User | null> {
    const userKey = `user:${userId}`;
    const userData = await this.kv.get(userKey);
    return userData ? JSON.parse(userData) : null;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user: User = {
      id: userData.id!,
      username: userData.username,
      firstName: userData.firstName,
      language: userData.language || 'en',
      interfaceLanguage: userData.interfaceLanguage || 'en',
      timezone: userData.timezone || 'UTC',
      reminderTimes: userData.reminderTimes || ['08:00', '14:00', '20:00'],
      isActive: true,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };

    const userKey = `user:${user.id}`;
    await this.kv.put(userKey, JSON.stringify(user));
    return user;
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<User | null> {
    const user = await this.getUser(userId);
    if (!user) return null;

    const updatedUser = { ...user, ...updates, lastActiveAt: new Date().toISOString() };
    const userKey = `user:${userId}`;
    await this.kv.put(userKey, JSON.stringify(updatedUser));
    return updatedUser;
  }

  async getAllActiveUsers(): Promise<User[]> {
    const list = await this.kv.list({ prefix: 'user:' });
    const users: User[] = [];

    for (const key of list.keys) {
      const userData = await this.kv.get(key.name);
      if (userData) {
        const user = JSON.parse(userData) as User;
        if (user.isActive) {
          users.push(user);
        }
      }
    }

    return users;
  }

  async getUserCards(userId: number, box?: number): Promise<Card[]> {
    // First try the new format (used by admin bulk processing)
    const newFormatKey = `user_cards:${userId}`;
    const newFormatData = await this.kv.get(newFormatKey);
    
    if (newFormatData) {
      try {
        const cardsArray = JSON.parse(newFormatData) as Card[];
        let cards = cardsArray;
        
        if (box) {
          cards = cardsArray.filter(card => card.box === box);
        }
        
        return cards.sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime());
      } catch (error) {
        console.error('Error parsing new format cards:', error);
      }
    }
    
    // Fallback to old format (individual card keys)
    const prefix = `card:${userId}:`;
    const list = await this.kv.list({ prefix });
    const cards: Card[] = [];

    for (const key of list.keys) {
      const cardData = await this.kv.get(key.name);
      if (cardData) {
        const card = JSON.parse(cardData) as Card;
        if (!box || card.box === box) {
          cards.push(card);
        }
      }
    }

    return cards.sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime());
  }

  async getCardsDueForReview(userId: number, limit: number = 10): Promise<Card[]> {
    const cards = await this.getUserCards(userId);
    const now = new Date();
    
    return cards
      .filter(card => new Date(card.nextReviewAt) <= now)
      .slice(0, limit);
  }

  async createCard(cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    const cardId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const card: Card = {
      ...cardData,
      id: cardId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const cardKey = `card:${card.userId}:${cardId}`;
    await this.kv.put(cardKey, JSON.stringify(card));
    return card;
  }

  async updateCard(userId: number, cardId: string, updates: Partial<Card>): Promise<Card | null> {
    const cardKey = `card:${userId}:${cardId}`;
    const cardData = await this.kv.get(cardKey);
    
    if (!cardData) return null;

    const card = JSON.parse(cardData) as Card;
    const updatedCard = { ...card, ...updates, updatedAt: new Date().toISOString() };
    
    await this.kv.put(cardKey, JSON.stringify(updatedCard));
    return updatedCard;
  }

  async deleteCard(userId: number, cardId: string): Promise<boolean> {
    const cardKey = `card:${userId}:${cardId}`;
    await this.kv.delete(cardKey);
    return true;
  }

  async createTopic(topicData: Omit<Topic, 'id' | 'createdAt'>): Promise<Topic> {
    const topicId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const topic: Topic = {
      ...topicData,
      id: topicId,
      createdAt: new Date().toISOString()
    };

    const topicKey = `topic:${topic.userId}:${topicId}`;
    await this.kv.put(topicKey, JSON.stringify(topic));
    return topic;
  }

  async getUserTopics(userId: number): Promise<Topic[]> {
    const prefix = `topic:${userId}:`;
    const list = await this.kv.list({ prefix });
    const topics: Topic[] = [];

    for (const key of list.keys) {
      const topicData = await this.kv.get(key.name);
      if (topicData) {
        topics.push(JSON.parse(topicData) as Topic);
      }
    }

    return topics.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createReviewSession(userId: number): Promise<ReviewSession> {
    const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session: ReviewSession = {
      id: sessionId,
      userId,
      startedAt: new Date().toISOString(),
      cardsReviewed: 0,
      correctAnswers: 0,
      status: 'active'
    };

    const sessionKey = `session:${userId}:${sessionId}`;
    await this.kv.put(sessionKey, JSON.stringify(session));
    return session;
  }

  async updateReviewSession(userId: number, sessionId: string, updates: Partial<ReviewSession>): Promise<ReviewSession | null> {
    const sessionKey = `session:${userId}:${sessionId}`;
    const sessionData = await this.kv.get(sessionKey);
    
    if (!sessionData) return null;

    const session = JSON.parse(sessionData) as ReviewSession;
    const updatedSession = { ...session, ...updates };
    
    await this.kv.put(sessionKey, JSON.stringify(updatedSession));
    return updatedSession;
  }

  async getActiveReviewSession(userId: number): Promise<ReviewSession | null> {
    const prefix = `session:${userId}:`;
    const list = await this.kv.list({ prefix });

    for (const key of list.keys) {
      const sessionData = await this.kv.get(key.name);
      if (sessionData) {
        const session = JSON.parse(sessionData) as ReviewSession;
        if (session.status === 'active') {
          return session;
        }
      }
    }

    return null;
  }

  async getAllUsers(): Promise<User[]> {
    const list = await this.kv.list({ prefix: 'user:' });
    const users: User[] = [];

    for (const key of list.keys) {
      const userData = await this.kv.get(key.name);
      if (userData) {
        const user = JSON.parse(userData) as User;
        users.push(user);
      }
    }

    return users;
  }
}

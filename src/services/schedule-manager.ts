import { Card, User, LEITNER_INTERVALS } from '../types';

export class ScheduleManager {
  constructor(private kv: KVNamespace) {}

  calculateNextReviewDate(box: number, isCorrect: boolean): Date {
    let newBox = box;
    
    if (isCorrect) {
      newBox = Math.min(box + 1, 5); // Move to next box (max 5)
    } else {
      newBox = 1; // Reset to first box on incorrect answer
    }

    const daysToAdd = LEITNER_INTERVALS[newBox as keyof typeof LEITNER_INTERVALS];
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + daysToAdd);
    
    return nextReview;
  }

  async processCardReview(userId: number, cardId: string, isCorrect: boolean): Promise<Card | null> {
    const cardKey = `card:${userId}:${cardId}`;
    const cardData = await this.kv.get(cardKey);
    
    if (!cardData) return null;

    const card = JSON.parse(cardData) as Card;
    const nextReviewAt = this.calculateNextReviewDate(card.box, isCorrect);
    
    const updatedCard: Card = {
      ...card,
      box: isCorrect ? Math.min(card.box + 1, 5) : 1,
      nextReviewAt: nextReviewAt.toISOString(),
      reviewCount: card.reviewCount + 1,
      correctCount: card.correctCount + (isCorrect ? 1 : 0),
      updatedAt: new Date().toISOString()
    };

    await this.kv.put(cardKey, JSON.stringify(updatedCard));
    return updatedCard;
  }

  async getUsersDueForReminder(): Promise<User[]> {
    const users: User[] = [];
    const list = await this.kv.list({ prefix: 'user:' });

    for (const key of list.keys) {
      const userData = await this.kv.get(key.name);
      if (userData) {
        const user = JSON.parse(userData) as User;
        if (user.isActive && await this.shouldSendReminder(user)) {
          users.push(user);
        }
      }
    }

    return users;
  }

  private async shouldSendReminder(user: User): Promise<boolean> {
    // Check if user has cards due for review
    const cardsPrefix = `card:${user.id}:`;
    const cardsList = await this.kv.list({ prefix: cardsPrefix });
    const now = new Date();

    for (const cardKey of cardsList.keys) {
      const cardData = await this.kv.get(cardKey.name);
      if (!cardData) continue;
      try {
        const card = JSON.parse(cardData) as Card;
        if (new Date(card.nextReviewAt) <= now) return true;
      } catch (e) {
        console.error('Malformed card JSON (reminder check)', cardKey.name);
      }
    }

    return false;
  }

  async getReminderSchedule(user: User): Promise<string[]> {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    // Check if current time matches any of the user's reminder times (within 5 minutes)
    const matchingTimes = user.reminderTimes.filter(time => {
      const [hour, minute] = time.split(':').map(Number);
      const reminderMinutes = hour * 60 + minute;
      const currentMinutes = currentHour * 60 + currentMinute;
      
      // Allow 5-minute window for reminders
      return Math.abs(reminderMinutes - currentMinutes) <= 5;
    });

    return matchingTimes;
  }

  async getStudyStatistics(userId: number, days: number = 7): Promise<{
    totalCards: number;
    cardsReviewed: number;
    correctAnswers: number;
    streakDays: number;
    averageAccuracy: number;
    boxDistribution: Record<number, number>;
  }> {
    const cardsPrefix = `card:${userId}:`;
    const cardsList = await this.kv.list({ prefix: cardsPrefix });
    
    let totalCards = 0;
    let cardsReviewed = 0;
    let correctAnswers = 0;
    const boxDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const cardKey of cardsList.keys) {
      const cardData = await this.kv.get(cardKey.name);
      if (!cardData) continue;
      try {
        const card = JSON.parse(cardData) as Card;
        totalCards++;
        cardsReviewed += card.reviewCount;
        correctAnswers += card.correctCount;
        boxDistribution[card.box]++;
      } catch (e) {
        console.error('Skipping malformed card (stats)', cardKey.name);
      }
    }

    const averageAccuracy = cardsReviewed > 0 ? (correctAnswers / cardsReviewed) * 100 : 0;
    
    // Calculate streak (simplified - would need more detailed tracking in production)
    const streakDays = await this.calculateStreak(userId);

    return {
      totalCards,
      cardsReviewed,
      correctAnswers,
      streakDays,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      boxDistribution
    };
  }

  private async calculateStreak(userId: number): Promise<number> {
    // This is a simplified streak calculation
    // In production, you'd want to track daily activity more precisely
    const sessionsPrefix = `session:${userId}:`;
    const sessionsList = await this.kv.list({ prefix: sessionsPrefix });
    
    const today = new Date();
    let streak = 0;
    let checkDate = new Date(today);

    // Check the last 30 days for activity
    for (let i = 0; i < 30; i++) {
      const dayStart = new Date(checkDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);

      let hasActivity = false;

      for (const sessionKey of sessionsList.keys) {
        const sessionData = await this.kv.get(sessionKey.name);
        if (!sessionData) continue;
        try {
          const session = JSON.parse(sessionData);
          const sessionDate = new Date(session.startedAt);
          if (sessionDate >= dayStart && sessionDate <= dayEnd && session.cardsReviewed > 0) {
            hasActivity = true;
            break;
          }
        } catch (e) {
          console.error('Skipping malformed session', sessionKey.name);
        }
      }

      if (hasActivity) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  async optimizeReviewSchedule(userId: number): Promise<void> {
    // Get user's review performance and adjust scheduling if needed
    const stats = await this.getStudyStatistics(userId);
    
    // If accuracy is very high (>90%), we could suggest increasing intervals
    // If accuracy is low (<60%), we could suggest more frequent reviews
    // This is where you could implement adaptive scheduling algorithms
    
    // For now, this is a placeholder for future optimization logic
  }
}

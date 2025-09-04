import { KVNamespace } from '@cloudflare/workers-types';
import { ConversationState } from '../types/conversation-state';

export class ConversationStateManager {
  constructor(private kv: any) {}

  private getKey(userId: number): string {
    return `convstate:${userId}`;
  }

  async getState(userId: number): Promise<ConversationState | null> {
    const data = await this.kv.get(this.getKey(userId));
    return data ? JSON.parse(data) : null;
  }

  async setState(userId: number, state: ConversationState): Promise<void> {
    await this.kv.put(this.getKey(userId), JSON.stringify(state));
  }

  async clearState(userId: number): Promise<void> {
    await this.kv.delete(this.getKey(userId));
  }
}

// Conversation state for multi-step flows (per user)
// This will be stored in KV with a key like `convstate:<userId>`

export type AddTopicStep =
  | 'ask_topic'
  | 'ask_source_language'
  | 'ask_target_language'
  | 'ask_description_language'
  | 'ask_word_level'
  | 'ask_word_count'
  | 'confirm';

export interface AddTopicConversationState {
  step: AddTopicStep;
  topic?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  descriptionLanguage?: string;
  wordLevel?: string;
  wordCount?: number;
}

export interface ReviewConversationState {
  currentCardId: string;
  currentCard: {
    id: string;
    word: string;
    translation: string;
    definition: string;
    sourceLanguage: string;
    targetLanguage: string;
    box: number;
  };
}

export type ConversationState = {
  addTopic?: AddTopicConversationState;
  review?: ReviewConversationState;
  // Add more flows here as needed
};

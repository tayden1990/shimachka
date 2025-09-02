import { GoogleGenerativeAI } from '@google/generative-ai';
import { WordExtractionRequest, ExtractedWord, LanguageCode, LANGUAGES } from '../types';

export class WordExtractor {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async extractWords(request: WordExtractionRequest): Promise<ExtractedWord[]> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const sourceLanguageName = LANGUAGES[request.sourceLanguage as LanguageCode] || request.sourceLanguage;
    const targetLanguageName = LANGUAGES[request.targetLanguage as LanguageCode] || request.targetLanguage;
    const wordCount = request.count || 15;

    const prompt = `
You are a language learning expert. Generate ${wordCount} vocabulary words related to the topic "${request.topic}" in ${sourceLanguageName}.

For each word, provide:
1. The word in ${sourceLanguageName}
2. The translation in ${targetLanguageName}
3. A clear definition in ${targetLanguageName}
4. A simple example sentence using the word in ${sourceLanguageName}

Focus on:
- Common, useful vocabulary that beginners to intermediate learners would benefit from
- Words that are directly related to the topic
- Accurate translations and definitions
- Simple, clear example sentences

Format your response as a JSON array where each object has these exact properties:
- "word": the word in ${sourceLanguageName}
- "translation": the translation in ${targetLanguageName}
- "definition": the definition in ${targetLanguageName}
- "context": the example sentence in ${sourceLanguageName}

Example format:
[
  {
    "word": "example_word",
    "translation": "translated_word",
    "definition": "clear definition of the word",
    "context": "Example sentence using the word in context."
  }
]

Return only the JSON array, no additional text.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response to extract JSON
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const wordsData = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(wordsData)) {
        throw new Error('Response is not an array');
      }

      return wordsData.map((item: any): ExtractedWord => ({
        word: item.word || '',
        translation: item.translation || '',
        definition: item.definition || '',
        context: item.context || ''
      })).filter(word => word.word && word.translation && word.definition);

    } catch (error) {
      console.error('Error extracting words:', error);
      throw new Error('Failed to extract words from the topic');
    }
  }

  async translateWord(word: string, sourceLanguage: string, targetLanguage: string): Promise<ExtractedWord> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const sourceLanguageName = LANGUAGES[sourceLanguage as LanguageCode] || sourceLanguage;
    const targetLanguageName = LANGUAGES[targetLanguage as LanguageCode] || targetLanguage;

    const prompt = `
Translate the word "${word}" from ${sourceLanguageName} to ${targetLanguageName}.

Provide:
1. The original word: "${word}"
2. The translation in ${targetLanguageName}
3. A clear definition in ${targetLanguageName}
4. A simple example sentence using the original word in ${sourceLanguageName}

Format your response as JSON with these exact properties:
{
  "word": "${word}",
  "translation": "translated_word",
  "definition": "clear definition in ${targetLanguageName}",
  "context": "Example sentence in ${sourceLanguageName}"
}

Return only the JSON object, no additional text.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const wordData = JSON.parse(jsonMatch[0]);
      
      return {
        word: wordData.word || word,
        translation: wordData.translation || '',
        definition: wordData.definition || '',
        context: wordData.context || ''
      };

    } catch (error) {
      console.error('Error translating word:', error);
      throw new Error('Failed to translate the word');
    }
  }

  async generateDefinition(word: string, language: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const languageName = LANGUAGES[language as LanguageCode] || language;

    const prompt = `
Provide a clear, simple definition for the word "${word}" in ${languageName}.
The definition should be suitable for language learners and easy to understand.
Return only the definition text, no additional formatting or explanations.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();

    } catch (error) {
      console.error('Error generating definition:', error);
      throw new Error('Failed to generate definition');
    }
  }

  async detectLanguage(text: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
Detect the language of this text: "${text}"

Return only the ISO 639-1 language code (e.g., "en", "es", "fr", "de", etc.).
If uncertain, return your best guess.
Return only the language code, no additional text.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const detectedLanguage = response.text().trim().toLowerCase();
      
      // Validate the detected language code
      if (detectedLanguage in LANGUAGES) {
        return detectedLanguage;
      }
      
      // Return English as default if detection fails
      return 'en';

    } catch (error) {
      console.error('Error detecting language:', error);
      return 'en'; // Default to English
    }
  }
}

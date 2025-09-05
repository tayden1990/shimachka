import { GoogleGenerativeAI } from '@google/generative-ai';
import { WordExtractionRequest, ExtractedWord, LanguageCode, LANGUAGES } from '../types';

export class WordExtractor {
  private genAI: GoogleGenerativeAI;
  private apiKey: string;
  private isAvailable: boolean = true;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async extractWords(request: WordExtractionRequest): Promise<ExtractedWord[]> {
    // Check if Gemini is available in this region
    if (!this.isAvailable) {
      return this.fallbackWordExtraction(request);
    }

    // Use the stable Gemini 1.5 Flash model
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const sourceLanguageName = LANGUAGES[request.sourceLanguage as LanguageCode] || request.sourceLanguage;
    const targetLanguageName = LANGUAGES[request.targetLanguage as LanguageCode] || request.targetLanguage;
    const wordCount = request.count || 15;

    // Build prompt dynamically based on user input (level, description language)
    let levelInstruction = '';
    if ((request as any).wordLevel) {
      levelInstruction = `\n- Focus on words suitable for ${((request as any).wordLevel).toLowerCase()} learners.`;
    }
    let descriptionLangInstruction = '';
    if ((request as any).descriptionLanguage && (request as any).descriptionLanguage !== request.sourceLanguage) {
      const descLang = LANGUAGES[(request as any).descriptionLanguage as LanguageCode] || (request as any).descriptionLanguage;
      descriptionLangInstruction = `\n- The definition for each word should be in ${descLang}.`;
    } else {
      descriptionLangInstruction = `\n- The definition for each word should be in ${sourceLanguageName}.`;
    }

    const prompt = `
You are an expert language tutor. Your task is to generate a list of ${wordCount} important vocabulary words for the topic "${request.topic}" in ${sourceLanguageName}.

For each word, provide:
1. The word in ${sourceLanguageName}
2. The translation in ${targetLanguageName}
3. A clear, simple definition in ${descriptionLangInstruction.includes('should be in') ? descriptionLangInstruction.split('be in ')[1].replace('.', '') : sourceLanguageName}
4. A simple example sentence in ${sourceLanguageName}

Guidelines:
- Choose words that are common, useful, and relevant to the topic.${levelInstruction}${descriptionLangInstruction}
- Ensure translations and definitions are accurate and easy to understand.
- Example sentences should be short and demonstrate the word in context.

Output:
Return a JSON array. Each object must have these properties:
- "word": the word in ${sourceLanguageName}
- "translation": the translation in ${targetLanguageName}
- "definition": the definition in ${descriptionLangInstruction.includes('should be in') ? descriptionLangInstruction.split('be in ')[1].replace('.', '') : sourceLanguageName}
- "context": the example sentence in ${sourceLanguageName}

Example:
[
  {
    "word": "example_word",
    "translation": "translated_word",
    "definition": "A clear definition of the word in ${descriptionLangInstruction.includes('should be in') ? descriptionLangInstruction.split('be in ')[1].replace('.', '') : sourceLanguageName}.",
    "context": "Example sentence using the word."
  }
]

Return only the JSON array, with no extra text or explanation.
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
      // Check if it's a geographic restriction error
      if (error instanceof Error && 
          (error.message.includes('location is not supported') || 
           error.message.includes('User location') ||
           error.message.includes('not available in your region'))) {
        this.isAvailable = false;
        console.log('Gemini API not available in this region, using fallback method');
        return this.fallbackWordExtraction(request);
      }
      
      // Create logger instance for error reporting
      console.error('Error extracting words:', error);
      throw new Error('Failed to extract words from the topic');
    }
  }  async translateWord(word: string, sourceLanguage: string, targetLanguage: string): Promise<ExtractedWord> {
  const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
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
  const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
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
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

  // Fallback method when Gemini API is not available
  private fallbackWordExtraction(request: WordExtractionRequest): ExtractedWord[] {
    const wordCount = request.count || 15;
    const sourceLanguageName = LANGUAGES[request.sourceLanguage as LanguageCode] || request.sourceLanguage;
    const targetLanguageName = LANGUAGES[request.targetLanguage as LanguageCode] || request.targetLanguage;
    
    // Predefined vocabulary banks for common topics
    const vocabularyBanks: { [key: string]: { [lang: string]: ExtractedWord[] } } = {
      'food': {
        'en': [
          { word: 'bread', translation: 'pan', definition: 'A staple food made from flour and water', context: 'I eat bread for breakfast.' },
          { word: 'water', translation: 'agua', definition: 'A clear liquid essential for life', context: 'Please give me water.' },
          { word: 'apple', translation: 'manzana', definition: 'A red or green fruit', context: 'An apple a day keeps the doctor away.' },
          { word: 'chicken', translation: 'pollo', definition: 'A type of bird commonly eaten', context: 'We had chicken for dinner.' },
          { word: 'rice', translation: 'arroz', definition: 'A grain used as a staple food', context: 'Rice is popular in Asia.' }
        ],
        'es': [
          { word: 'pan', translation: 'bread', definition: 'Alimento básico hecho de harina y agua', context: 'Como pan en el desayuno.' },
          { word: 'agua', translation: 'water', definition: 'Líquido transparente esencial para la vida', context: 'Por favor, dame agua.' },
          { word: 'manzana', translation: 'apple', definition: 'Una fruta roja o verde', context: 'Una manzana al día mantiene alejado al médico.' }
        ]
      },
      'travel': {
        'en': [
          { word: 'hotel', translation: 'hotel', definition: 'A place where travelers stay', context: 'We booked a hotel for our vacation.' },
          { word: 'airport', translation: 'aeropuerto', definition: 'A place where planes take off and land', context: 'The airport is very busy today.' },
          { word: 'ticket', translation: 'boleto', definition: 'A document for transportation', context: 'I need to buy a train ticket.' },
          { word: 'passport', translation: 'pasaporte', definition: 'An official document for international travel', context: 'Don\'t forget your passport.' }
        ]
      },
      'family': {
        'en': [
          { word: 'mother', translation: 'madre', definition: 'A female parent', context: 'My mother is very kind.' },
          { word: 'father', translation: 'padre', definition: 'A male parent', context: 'My father works in an office.' },
          { word: 'sister', translation: 'hermana', definition: 'A female sibling', context: 'I have one sister.' },
          { word: 'brother', translation: 'hermano', definition: 'A male sibling', context: 'My brother is older than me.' }
        ]
      }
    };

    // Find matching vocabulary bank
    const topic = request.topic.toLowerCase();
    let matchedWords: ExtractedWord[] = [];

    // Look for topic matches
    for (const [bankTopic, languages] of Object.entries(vocabularyBanks)) {
      if (topic.includes(bankTopic) || bankTopic.includes(topic)) {
        const langWords = languages[request.sourceLanguage] || languages['en'];
        if (langWords) {
          matchedWords = langWords.slice(0, wordCount);
          break;
        }
      }
    }

    // If no specific match, use general vocabulary
    if (matchedWords.length === 0) {
      const generalWords = vocabularyBanks['food'][request.sourceLanguage] || vocabularyBanks['food']['en'];
      matchedWords = generalWords.slice(0, Math.min(5, wordCount));
    }

    // Pad with basic words if needed
    while (matchedWords.length < wordCount && matchedWords.length < 10) {
      const basicWords = [
        { word: 'hello', translation: 'hola', definition: 'A greeting', context: 'Hello, how are you?' },
        { word: 'goodbye', translation: 'adiós', definition: 'A farewell', context: 'Goodbye, see you tomorrow.' },
        { word: 'please', translation: 'por favor', definition: 'A polite request word', context: 'Please help me.' },
        { word: 'thank you', translation: 'gracias', definition: 'An expression of gratitude', context: 'Thank you for your help.' },
        { word: 'yes', translation: 'sí', definition: 'An affirmative response', context: 'Yes, I agree.' },
        { word: 'no', translation: 'no', definition: 'A negative response', context: 'No, I don\'t want that.' }
      ];
      
      for (const word of basicWords) {
        if (!matchedWords.find(w => w.word === word.word) && matchedWords.length < wordCount) {
          matchedWords.push(word);
        }
      }
      break;
    }

    console.log(`Fallback word extraction: Generated ${matchedWords.length} words for topic "${request.topic}"`);
    return matchedWords.slice(0, wordCount);
  }
}

import { GoogleGenerativeAI } from '@google/generative-ai';
import { WordExtractionRequest, ExtractedWord, LanguageCode, LANGUAGES } from '../types';

export class WordExtractor {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async extractWords(request: WordExtractionRequest): Promise<ExtractedWord[]> {
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

      let wordsData: any;
      try {
        wordsData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Primary JSON parse failed (extractWords). Raw slice length:', jsonMatch[0].length);
        throw new Error('Invalid JSON from AI response');
      }
      
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

      let wordData: any;
      try {
        wordData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Primary JSON parse failed (translateWord). Raw slice length:', jsonMatch[0].length);
        throw new Error('Invalid JSON from AI response');
      }
      
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

  // Method needed by admin API for single word processing
  async extractWordData(word: string, sourceLanguage: string, targetLanguage: string): Promise<{
    translation: string;
    definition: string;
  }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const sourceLanguageName = LANGUAGES[sourceLanguage as LanguageCode] || sourceLanguage;
      const targetLanguageName = LANGUAGES[targetLanguage as LanguageCode] || targetLanguage;
      
      const prompt = `Please provide for the word "${word}" in ${sourceLanguageName}:
1. Translation to ${targetLanguageName}
2. Brief definition in ${targetLanguageName}

Respond in this exact JSON format:
{
  "translation": "word translation",
  "definition": "brief definition"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const parsed = JSON.parse(text);
        
        // Validate the AI response quality
        if (parsed.translation && parsed.definition && 
            parsed.translation !== `${word}_translated` && 
            parsed.definition !== `Definition of ${word}` &&
            parsed.translation.trim().length > 0 && 
            parsed.definition.trim().length > 0) {
          
          return {
            translation: parsed.translation.trim(),
            definition: parsed.definition.trim()
          };
        } else {
          console.warn(`AI returned poor quality response for word: ${word}`, parsed);
          return {
            translation: word + '_translated',
            definition: 'Definition of ' + word
          };
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.error('Raw AI response:', text);
        
        // Try to extract translation and definition from non-JSON response
        const extractedData = this.extractFromRawText(text, word);
        if (extractedData) {
          return extractedData;
        }
        
        return {
          translation: word + '_translated',
          definition: 'Definition of ' + word
        };
      }
    } catch (error) {
      console.error('Word extraction error:', error);
      return {
        translation: word + '_translated',
        definition: 'Definition of ' + word
      };
    }
  }

  private extractFromRawText(text: string, word: string): { translation: string; definition: string } | null {
    try {
      // Try to extract translation and definition from raw text response
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      let translation = '';
      let definition = '';
      
      for (const line of lines) {
        // Look for translation patterns
        if (line.toLowerCase().includes('translation') && line.includes(':')) {
          translation = line.split(':')[1].trim().replace(/['"]/g, '');
        }
        // Look for definition patterns
        if (line.toLowerCase().includes('definition') && line.includes(':')) {
          definition = line.split(':')[1].trim().replace(/['"]/g, '');
        }
      }
      
      if (translation && definition && 
          translation !== `${word}_translated` && 
          definition !== `Definition of ${word}`) {
        return { translation, definition };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to extract from raw text:', error);
      return null;
    }
  }
}

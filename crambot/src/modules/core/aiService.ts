import { Note, AICard } from '../../stores/noteStore';
import axios from 'axios';

interface AIProcessingOptions {
  type: AICard['type'];
  maxLength?: number;
  style?: string;
}

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export class AIService {
  private static instance: AIService;
  private host: string; 
  private model = 'mistral'; // Using Mistral as default model

  private constructor() {
    this.host = 'http://localhost:11434'; // Default Ollama host
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Check if model is available
      await axios.get(`${this.host}/api/tags`);
    } catch (error) {
      console.error('Failed to initialize Ollama:', error);
      throw new Error('Failed to initialize AI service. Please ensure Ollama is running and the model is installed.');
    }
  }

  private async generateWithOllama(prompt: string, retryCount = 0): Promise<string> {
    try {
      console.log('Sending request to Ollama');
      const response = await axios.post(`${this.host}/api/generate`, {
        model: this.model,
        prompt,
        stream: false,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 second timeout
      });
      
      console.log('Received response from Ollama');
      
      if (!response.data || !response.data.response) {
        console.error('Invalid response from Ollama:', response.data);
        throw new Error('Invalid response from Ollama');
      }
      
      return response.data.response;
    } catch (error) {
      console.error('Error in Ollama request:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Request details:', error.config);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        } else if (error.request) {
          console.error('No response received');
        }
        
        // Retry logic for network errors or timeouts
        if ((error.code === 'ECONNABORTED' || !error.response) && retryCount < 2) {
          console.log(`Retrying request (attempt ${retryCount + 1})...`);
          return this.generateWithOllama(prompt, retryCount + 1);
        }
      }
      
      throw new Error(`Failed to generate content with Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateSummary(note: Note): Promise<string> {
    const prompt = `Please provide a concise summary of the following text. Focus on the key points and main ideas:

${note.content}

Generate a clear and informative summary that captures the essential information.`;

    return this.generateWithOllama(prompt);
  }

  private async generateFlashcards(note: Note): Promise<string> {
    const prompt = `Create a set of flashcards from the following text. Format them as Q: (question) followed by A: (answer) pairs, with each pair on new lines:

${note.content}

Generate clear, concise questions that test understanding of key concepts, and provide accurate, informative answers.`;

    return this.generateWithOllama(prompt);
  }

  private async generateRevision(note: Note): Promise<string> {
    const prompt = `Create revision materials from the following text. Include key points, important concepts, and any formulas or definitions that should be remembered:

${note.content}

Format the output as a structured list of points that would be useful for revision.`;

    return this.generateWithOllama(prompt);
  }

  async processNote(note: Note, options: AIProcessingOptions): Promise<Omit<AICard, 'id'>> {
    let content: string;
    let confidence = 0.85; // Default confidence score

    try {
      console.log(`Processing note with ID ${note.id} for ${options.type}`);
      console.log('Note content:', note.content.substring(0, 50) + '...');
      
      switch (options.type) {
        case 'summary':
          console.log('Generating summary...');
          content = await this.generateSummary(note);
          break;
        case 'flashcard':
          console.log('Generating flashcards...');
          content = await this.generateFlashcards(note);
          break;
        case 'revision':
          console.log('Generating revision materials...');
          content = await this.generateRevision(note);
          break;
        default:
          throw new Error(`Unsupported processing type: ${options.type}`);
      }

      console.log(`Generated content (${content.length} chars)`);
      
      // Adjust confidence based on output length and complexity
      confidence = this.calculateConfidence(content, note.content);

      const result = {
        noteId: note.id,
        type: options.type,
        content,
        metadata: {
          confidence,
          generatedAt: new Date(),
        },
      };
      
      console.log('Returning AI card result');
      return result;
    } catch (error) {
      console.error(`Error processing note for ${options.type}:`, error);
      throw new Error(`Failed to process note for ${options.type}`);
    }
  }

  private calculateConfidence(output: string, input: string): number {
    // Simple confidence calculation based on output/input ratio and content length
    const ratio = output.length / input.length;
    let confidence = 0.85; // Base confidence

    // Adjust confidence based on output/input ratio
    if (ratio < 0.1 || ratio > 2) {
      confidence -= 0.2; // Reduce confidence if output is too short or too long
    }

    // Adjust confidence based on content markers
    if (output.includes('I apologize') || output.includes('I\'m not sure')) {
      confidence -= 0.3;
    }

    // Ensure confidence stays within 0-1 range
    return Math.max(0, Math.min(1, confidence));
  }
}

export const aiService = AIService.getInstance(); 
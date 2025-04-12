import { Note, AICard } from '../../stores/noteStore';
import { Ollama } from 'ollama';

interface AIProcessingOptions {
  type: AICard['type'];
  maxLength?: number;
  style?: string;
}

export class AIService {
  private static instance: AIService;
  private ollama: Ollama;
  private model = 'mistral'; // Using Mistral as default model

  private constructor() {
    this.ollama = new Ollama({
      host: 'http://localhost:11434', // Default Ollama host
    });
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
      await this.ollama.list();
    } catch (error) {
      console.error('Failed to initialize Ollama:', error);
      throw new Error('Failed to initialize AI service. Please ensure Ollama is running and the model is installed.');
    }
  }

  private async generateSummary(note: Note): Promise<string> {
    const prompt = `Please provide a concise summary of the following text. Focus on the key points and main ideas:

${note.content}

Generate a clear and informative summary that captures the essential information.`;

    const response = await this.ollama.generate({
      model: this.model,
      prompt,
      stream: false,
    });

    return response.response;
  }

  private async generateFlashcards(note: Note): Promise<string> {
    const prompt = `Create a set of flashcards from the following text. Format them as Q: (question) followed by A: (answer) pairs, with each pair on new lines:

${note.content}

Generate clear, concise questions that test understanding of key concepts, and provide accurate, informative answers.`;

    const response = await this.ollama.generate({
      model: this.model,
      prompt,
      stream: false,
    });

    return response.response;
  }

  private async generateRevision(note: Note): Promise<string> {
    const prompt = `Create revision materials from the following text. Include key points, important concepts, and any formulas or definitions that should be remembered:

${note.content}

Format the output as a structured list of points that would be useful for revision.`;

    const response = await this.ollama.generate({
      model: this.model,
      prompt,
      stream: false,
    });

    return response.response;
  }

  async processNote(note: Note, options: AIProcessingOptions): Promise<Omit<AICard, 'id'>> {
    let content: string;
    let confidence = 0.85; // Default confidence score

    try {
      switch (options.type) {
        case 'summary':
          content = await this.generateSummary(note);
          break;
        case 'flashcard':
          content = await this.generateFlashcards(note);
          break;
        case 'revision':
          content = await this.generateRevision(note);
          break;
        default:
          throw new Error(`Unsupported processing type: ${options.type}`);
      }

      // Adjust confidence based on output length and complexity
      confidence = this.calculateConfidence(content, note.content);

      return {
        noteId: note.id,
        type: options.type,
        content,
        metadata: {
          confidence,
          generatedAt: new Date(),
        },
      };
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
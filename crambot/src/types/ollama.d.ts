declare module 'ollama' {
  export interface OllamaOptions {
    host?: string;
  }

  export interface GenerateOptions {
    model: string;
    prompt: string;
    stream?: boolean;
    options?: {
      temperature?: number;
      top_p?: number;
      top_k?: number;
      num_predict?: number;
      stop?: string[];
    };
  }

  export interface GenerateResponse {
    model: string;
    response: string;
    done: boolean;
  }

  export class Ollama {
    constructor(options?: OllamaOptions);
    generate(options: GenerateOptions): Promise<GenerateResponse>;
    list(): Promise<{ models: string[] }>;
  }
} 
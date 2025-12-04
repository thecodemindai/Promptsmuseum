export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  category: PromptCategory;
  type: PromptType;
  author: string;
  imageUrl: string;
}

export enum PromptType {
  WEBAPP = 'Webapp',
  SYSTEM = 'System',
  IMAGE = 'Image',
  VIDEO = 'Video',
}

export enum PromptCategory {
  ALL = 'All',
  CODING = 'Coding',
  WRITING = 'Writing',
  MARKETING = 'Marketing',
  PRODUCTIVITY = 'Productivity',
  CREATIVE = 'Creative',
  REALISTIC = 'Realistic',
  ABSTRACT = 'Abstract',
  CINEMATIC = 'Cinematic',
}

export interface GenerationResult {
  text: string;
  error?: string;
  timestamp: number;
}
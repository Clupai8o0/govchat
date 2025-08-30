export interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
  audit: AuditData;
}

export interface AuditData {
  question: string;
  trust_score: number;
  retrieved: RetrievedSource[];
  timestamp: number;
}

export interface RetrievedSource {
  source: string;
  similarity: number | null;
  recency_flag: boolean;
  preview: string | null;
}

export interface ChatSettings {
  useOpenAI: boolean;
  topK: number;
  chunkSize: number;
  chunkOverlap: number;
  modelName: string;
  embedModel: string;
}

export interface ApiResponse {
  answer: string;
  audit: AuditData;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'indexed' | 'error';
}

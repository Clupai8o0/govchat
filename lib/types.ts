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
  // Enhanced data for dataset display
  id?: string;
  agency?: string;
  api_url?: string;
}

// Types for the new API response structure
export interface QueryResponse {
  query: string;
  answer: string;
  sources: DatasetSource[];
  trust: TrustData;
  hits: DatasetHit[];
  count: number;
}

export interface DatasetSource {
  title: string;
  agency: string;
  api_url: string;
  similarity: number;
}

export interface TrustData {
  score: number;
  factors: TrustFactor[];
  checks: any[];
  audit_id: string;
}

export interface TrustFactor {
  name: string;
  value: number;
}

export interface DatasetHit {
  id: string;
  title: string;
  description: string;
  agency: string;
  api_url: string;
  similarity_score: number;
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

// Simplified message structure for query-only functionality
export interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
}

// Dataset information from the API
export interface Dataset {
  id: string;
  title: string;
  description: string;
  agency: string;
  api_url: string;
  similarity_score?: number;
}

// Source information for display
export interface DatasetSource {
  title: string;
  agency: string;
  api_url: string;
  similarity: number;
}

// API response structure matching your FastAPI endpoint
export interface QueryResponse {
  query: string;
  answer: string;
  sources: DatasetSource[];
  hits: Dataset[];
  count: number;
}

// Simplified chat settings (most settings handled by backend)
export interface ChatSettings {
  apiUrl: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'indexed' | 'error';
}

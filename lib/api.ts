import { QueryResponse, ChatSettings, UploadedFile } from './types';

// API configuration - matches your FastAPI server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';

class ChatAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Send a question to the dataset query API
   */
  async askQuestion(question: string, settings: ChatSettings): Promise<QueryResponse> {
    try {
      // Use URLSearchParams to properly encode the query
      const params = new URLSearchParams({
        q: question.trim()
      });

      const response = await fetch(`${this.baseUrl}/query?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data: QueryResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error asking question:', error);
      
      // Fallback mock response for development
      return this.getMockResponse(question);
    }
  }

  /**
   * Health check endpoint
   */
  async ping(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/ping`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Ping failed: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error('Error pinging server:', error);
      return 'Server unavailable';
    }
  }

  /**
   * Upload files for indexing
   */
  async uploadFiles(files: File[]): Promise<UploadedFile[]> {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      const response = await fetch(`${this.baseUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.files;
    } catch (error) {
      console.error('Error uploading files:', error);
      
      // Return mock uploaded files for development
      return files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'indexed' as const,
      }));
    }
  }

  /**
   * Rebuild the search index
   */
  async rebuildIndex(settings: ChatSettings): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rebuild-index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        throw new Error(`Rebuild failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error rebuilding index:', error);
      
      // Mock success response for development
      return { success: true, message: 'Index rebuilt successfully (mock)' };
    }
  }

  /**
   * Get index status and statistics
   */
  async getIndexStatus(): Promise<{
    isBuilt: boolean;
    documentCount: number;
    lastUpdated: string | null;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/index-status`);
      
      if (!response.ok) {
        throw new Error(`Status request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting index status:', error);
      
      // Mock status for development
      return {
        isBuilt: true,
        documentCount: 42,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  /**
   * Mock response for development/fallback
   */
  private getMockResponse(question: string): QueryResponse {
    const mockSources = [
      {
        title: "Labour force - underemployment and underutilisation",
        agency: "ABS",
        api_url: "nan",
        similarity: 0.277
      },
      {
        title: "Labour Force Educational Attendance",
        agency: "ABS", 
        api_url: "nan",
        similarity: 0.24
      }
    ];

    const mockHits = [
      {
        id: "LF_UNDER",
        title: "Labour force - underemployment and underutilisation",
        description: "Statistics on underutilised persons by Region, Age and Sex. Catalogue number: 6202.0, tables 22 to 25.",
        agency: "ABS",
        api_url: "nan",
        similarity_score: 0.277
      },
      {
        id: "LF_EDU",
        title: "Labour Force Educational Attendance", 
        description: "Headline estimates of employment, unemployment, underemployment, participation and hours worked from the monthly Labour Force Survey. By education status.",
        agency: "ABS",
        api_url: "nan",
        similarity_score: 0.24
      }
    ];

    return {
      query: question,
      answer: `I found ${mockHits.length} datasets related to "${question}". These datasets provide information about labour force statistics and educational attendance which may help with your research.`,
      sources: mockSources,
      hits: mockHits,
      count: mockHits.length
    };
  }
}

// Export singleton instance
export const chatAPI = new ChatAPI();

// Export the class for testing
export { ChatAPI };

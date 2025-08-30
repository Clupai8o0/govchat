import { ApiResponse, ChatSettings, UploadedFile } from './types';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ChatAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Send a question to the chat API and get a response with audit data
   */
  async askQuestion(question: string, settings: ChatSettings): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          settings,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error asking question:', error);
      
      // Fallback mock response for development
      return this.getMockResponse(question);
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
  private getMockResponse(question: string): ApiResponse {
    const mockSources = [
      {
        source: 'c6bce6f80cfd.txt',
        similarity: 0.85,
        recency_flag: true,
        preview: 'The available student data includes statistics from various years, specifically from 2004 to 2023. Each year has its own set of selected higher education statistics that provide insights into student demographics, enrollment figures, and other relevant metrics.',
      },
      {
        source: 'c6bce6f80cfd.txt',
        similarity: 0.78,
        recency_flag: true,
        preview: 'For more detailed information about specific statistics or trends in student data, additional data from the individual years would be necessary.',
      },
    ];

    return {
      answer: `Based on the available data, I can tell you about the student information in our system. The available student data includes statistics from various years, specifically from 2004 to 2023 [1]. Each year has its own set of selected higher education statistics that provide insights into student demographics, enrollment figures, and other relevant metrics [1]. The data is disseminated through publications, datasets, and reports, and is utilized by government departments, higher education institutions, researchers, and the community at large [2].

For more detailed information about specific statistics or trends in student data, additional data from the individual years would be necessary [2].`,
      audit: {
        question,
        trust_score: 68,
        retrieved: mockSources,
        timestamp: Date.now(),
      },
    };
  }
}

// Export singleton instance
export const chatAPI = new ChatAPI();

// Export the class for testing
export { ChatAPI };

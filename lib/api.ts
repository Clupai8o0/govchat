import { ApiResponse, ChatSettings, UploadedFile, QueryResponse, SimilarResponse } from './types';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

class ChatAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Send a question to the query API and get a response with dataset information
   */
  async askQuestion(question: string, settings: ChatSettings): Promise<ApiResponse> {
    try {
      // Encode the question for URL parameter
      const encodedQuestion = encodeURIComponent(question);
      const response = await fetch(`${this.baseUrl}/query?q=${encodedQuestion}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("sent")

      if (!response.ok) {
        console.log("failed")
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data: QueryResponse = await response.json();
      
      // Log the API response for debugging
      console.log('API Response:', data);
      
      // Transform the new API response to match the existing UI structure
      return this.transformQueryResponse(data);
    } catch (error) {
      console.error('Error asking question:', error);
      // Fallback mock response for development
      return this.getMockResponse(question);
    }
  }

  /**
   * Transform the new API response format to the legacy format expected by the UI
   */
  private transformQueryResponse(queryResponse: QueryResponse): ApiResponse {
    // Convert hits to retrieved format with enhanced data
    const retrieved = queryResponse.hits.map(hit => ({
      source: hit.title,
      similarity: hit.similarity_score,
      recency_flag: true, // Default to true for now
      preview: hit.description,
      // Add additional data for enhanced display
      id: hit.id,
      agency: hit.agency,
      api_url: hit.api_url,
    }));

    // Convert trust score from 0-1 to 0-100 scale
    const trustScore = Math.round(queryResponse.trust.score * 100);

    return {
      answer: queryResponse.answer,
      audit: {
        question: queryResponse.query,
        trust_score: trustScore,
        retrieved: retrieved,
        timestamp: Date.now(),
        trust_factors: queryResponse.trust.factors,
        audit_id: queryResponse.trust.audit_id,
      },
    };
  }

  /**
   * Get similar datasets for a given dataset ID
   */
  async getSimilarDatasets(datasetId: string): Promise<SimilarResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/similar/${datasetId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Similar datasets request failed: ${response.statusText}`);
      }

      const data: SimilarResponse = await response.json();
      console.log('Similar datasets response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching similar datasets:', error);
      return null;
    }
  }

  /**
   * Check if the API server is running
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/ping`);
      return response.ok && (await response.text()) === 'pong';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Mock response for development/fallback
   */
  private getMockResponse(question: string): ApiResponse {
    const mockSources = [
      {
        source: 'Labour force - underemployment and underutilisation',
        similarity: 0.85,
        recency_flag: true,
        preview: 'ABS dataset: Statistics on underutilised persons by Region, Age and Sex.',
      },
      {
        source: 'Labour Force Educational Attendance',
        similarity: 0.78,
        recency_flag: true,
        preview: 'ABS dataset: Employment statistics by education status from the monthly Labour Force Survey.',
      },
    ];

    return {
      answer: `I found several relevant datasets related to "${question}". These include labor force statistics that track underemployment and underutilisation, as well as educational attendance data that shows employment patterns by education level. These datasets can help you explore the relationship between education and employment outcomes.`,
      audit: {
        question,
        trust_score: 77,
        retrieved: mockSources,
        timestamp: Date.now(),
        trust_factors: [
          { name: 'grounding', value: 1.0 },
          { name: 'provenance', value: 1.0 },
          { name: 'retrieval', value: 0.277 },
          { name: 'verification', value: 1.0 },
          { name: 'recency', value: 1.0 }
        ],
        audit_id: 'mock-audit',
      },
    };
  }
}

// Export singleton instance
export const chatAPI = new ChatAPI();

// Export the class for testing
export { ChatAPI };

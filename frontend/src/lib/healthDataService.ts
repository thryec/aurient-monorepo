// Health Data Service - Modular interface for health data analysis
// This abstraction allows easy swapping between saved data and live data sources

export interface UserMetadata {
  name: string;
  age: number;
  goals: string;
  activity_level: string;
  focus_areas: string[];
}

export interface DataSummary {
  datasets: string[];
  total_records: number;
}

export interface Recommendation {
  title: string;
  description: string;
  reasoning: string;
  actionable_steps: string[];
}

export interface AdviceSection {
  title: string;
  icon: string;
  recommendations: Recommendation[];
}

export interface StructuredAdvice {
  title: string;
  user_profile: {
    name: string;
    age: number;
    focus_areas: string[];
  };
  sections: {
    behavioral: AdviceSection;
    exercise: AdviceSection;
    nutrition: AdviceSection;
    supplementation: AdviceSection;
  };
  error?: string;
}

export interface DailyProgram {
  name: string;
  description: string;
  duration?: string;
  intensity?: string;
  technique?: string;
  meals?: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  why_recommended: string;
  specific_instructions?: string[];
  key_nutrients?: string[];
}

export interface DailyProgramSection {
  title: string;
  icon: string;
  program: DailyProgram;
}

export interface Source {
  name: string;
  url: string;
}

export interface DailyCard {
  title: string;
  items: string[];
  description: string;
  sources: Source[] | string[]; // Support both formats for backward compatibility
}

export interface StructuredDailyAdvice {
  title: string;
  date: string;
  cycle_phase: string;
  cards: DailyCard[];
  error?: string;
}

// Keep the old interface for backward compatibility
export interface StructuredDailyAdviceLegacy {
  title: string;
  date: string;
  cycle_phase: string;
  programs: {
    movement: DailyProgramSection;
    mindfulness: DailyProgramSection;
    nutrition: DailyProgramSection;
  };
  error?: string;
}

export interface HealthAnalysisResponse {
  success: boolean;
  data?: {
    advice?: string; // Legacy support
    structured_advice?: StructuredAdvice | StructuredDailyAdvice;
    userMetadata: UserMetadata;
    dataSummary: DataSummary;
  };
  error?: string;
}

export class HealthDataService {
  private baseUrl: string;

  constructor(baseUrl = '/api/health-analysis') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate comprehensive health overview recommendations
   * Currently uses saved data, but can be extended to use live data sources
   */
  async generateOverviewRecommendations(): Promise<HealthAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/overview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate overview recommendations');
      }

      return data;
    } catch (error) {
      console.error('Error generating overview recommendations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate daily health recommendations
   * Currently uses saved data, but can be extended to use live data sources
   */
  async generateDailyRecommendations(): Promise<HealthAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/daily`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate daily recommendations');
      }

      return data;
    } catch (error) {
      console.error('Error generating daily recommendations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Future method: Generate recommendations from live Oura data
   * This can be implemented when live data integration is needed
   */
  async generateLiveDataRecommendations(userId: string, dataType: 'overview' | 'daily'): Promise<HealthAnalysisResponse> {
    // TODO: Implement live data integration
    // This could connect to Oura API, IPFS stored data, or other sources
    throw new Error('Live data integration not yet implemented');
  }

  /**
   * Future method: Update user metadata
   */
  async updateUserMetadata(userId: string, metadata: Partial<UserMetadata>): Promise<boolean> {
    // TODO: Implement user metadata updates
    throw new Error('User metadata updates not yet implemented');
  }

  /**
   * Future method: Get user's health data summary
   */
  async getHealthDataSummary(userId: string): Promise<DataSummary | null> {
    // TODO: Implement health data summary retrieval
    throw new Error('Health data summary retrieval not yet implemented');
  }
}

// Export singleton instance
export const healthDataService = new HealthDataService();
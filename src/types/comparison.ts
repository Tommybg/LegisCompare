export interface Difference {
    type: 'addition' | 'deletion' | 'modification';
    content: string;
    location: string;
    significance: string;
  }
  
  export interface ComparisonResult {
    differences: Difference[];
    summary: string;
    impactAnalysis: string;
  }
  
  export interface ComparisonError {
    error: string;
    details?: string;
  }
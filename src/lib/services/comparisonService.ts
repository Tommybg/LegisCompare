import { ComparisonResult, ComparisonError } from '@/types/comparison';

export async function compareDocuments(doc1: string, doc2: string): Promise<ComparisonResult> {
  try {
      const response = await fetch('/api/compare', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ doc1, doc2 }),
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.error || 'Failed to compare documents');
      }

      if (!data.differences || !Array.isArray(data.differences)) {
          throw new Error('Invalid response format from API');
      }

      return data as ComparisonResult;
  } catch (error) {
      console.error('Comparison service error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to compare documents');
  }
}
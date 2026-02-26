const API_BASE_URL = '';

export interface MatchCandidate {
  materialId: string;
  name: string;
  unitName: string;
  categoryName: string;
}

export interface ExtractedItem {
  extractedName: string;
  extractedQuantity: number;
  matchCandidates: MatchCandidate[];
}

export interface AnalyzeDocumentResponse {
  constructionId: string;
  fileName: string;
  extractedItems: ExtractedItem[];
}

export async function analyzeDocument(
  constructionId: string,
  file: File
): Promise<AnalyzeDocumentResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('constructionId', constructionId);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/document-analysis/analyze`,
    {
      method: 'POST',
      headers: {
        'accept': 'application/json',
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to analyze document: ${response.statusText}`);
  }

  const data = await response.json() as AnalyzeDocumentResponse;
  return data;
}

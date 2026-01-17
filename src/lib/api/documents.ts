const API_BASE_URL = '';

export interface SuggestedMaterial {
  material_id: string;
  name: string;
  unit: string;
  similarity_score: number;
}

export interface ExtractedMaterial {
  name: string;
  unit: string;
  quantity: number;
  material_id: string | null;
  material_exists: boolean;
  material_unit: string | null;
  unit_matches: boolean;
  can_use_quantity: boolean;
  suggested_materials: SuggestedMaterial[];
}

export interface AnalyzeDocumentResponse {
  construction_id: string;
  file_name: string;
  extracted_data: {
    materials: ExtractedMaterial[];
  };
}

export async function analyzeDocument(
  constructionId: string,
  file: File
): Promise<AnalyzeDocumentResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/constructions/${constructionId}/analyze-document`,
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

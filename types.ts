
export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ComparisonResult {
  similarityScore: number;
  analysis: string;
  sources: GroundingSource[];
  specs?: {
    model1: Record<string, string>;
    model2: Record<string, string>;
  };
}

export interface VehicleData {
  name: string;
  specs: Record<string, string>;
}

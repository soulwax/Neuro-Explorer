export interface InstructionCase {
  id: string;
  title: string;
  oneLiner: string;
  chiefComplaint: string;
  history: string;
  examFindings: string[];
  prompt: string;
  hints: string[];
  localizationCues: string[];
  differentialTraps: string[];
  teachingPoints: string[];
  followUpModules: string[];
}

export interface BrainAtlasLocalizationCase extends InstructionCase {
  expectedRegionId: string;
  startingRegionId: string;
}

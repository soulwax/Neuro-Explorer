export interface InstructionCase {
  id: string;
  title: string;
  oneLiner: string;
  chiefComplaint: string;
  history: string;
  syndromeFrame: string;
  examFindings: string[];
  prompt: string;
  hints: string[];
  localizationCues: string[];
  differentialTraps: string[];
  nextDataRequests: string[];
  teachingPoints: string[];
  followUpModules: string[];
}

export interface BrainAtlasLocalizationCase extends InstructionCase {
  expectedRegionId: string;
  startingRegionId: string;
}

export interface VisualFieldLocalizationCase extends InstructionCase {
  expectedPresetId: string;
  startingPresetId: string;
}

export interface RetinaClinicalCase extends InstructionCase {
  expectedPresetId: string;
  startingPresetId: string;
}

export interface VisionLocalizationCase extends InstructionCase {
  expectedPresetId: string;
  startingPresetId: string;
}

export interface ECGClinicalCase extends InstructionCase {
  expectedConsultFrameId: string;
  startingConsultFrameId: string;
}

export interface EEGClinicalCase extends InstructionCase {
  expectedPresetId: string;
  startingPresetId: string;
}

export interface ActionPotentialClinicalCase extends InstructionCase {
  expectedPresetId: string;
  startingPresetId: string;
}

export interface MotorPathwayClinicalCase extends InstructionCase {
  expectedLesionId: string;
  startingLesionId: string;
}

export interface SleepClinicalCase extends InstructionCase {
  expectedPresetId: string;
  startingPresetId: string;
}

export interface CranialNerveClinicalCase extends InstructionCase {
  expectedNerveNumber: number;
  syndromeId: string | null;
}

export interface StrokeClinicalCase extends InstructionCase {
  expectedTerritoryId: string;
  startingTerritoryId: string;
}

export interface DermatomeClinicalCase extends InstructionCase {
  expectedLesionId: string;
  startingLesionId: string;
}

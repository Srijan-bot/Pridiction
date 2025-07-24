import type React from 'react';

export enum AppStep {
  COURSE_SELECTION,
  QUOTA_SELECTION,
  GENDER_SELECTION,
  MARKS_INPUT,
  PREDICTION_RESULT,
}

export type Quota = 'general' | 'obc' | 'sc' | 'st' | 'ews' | 'pwd' | 'ward';

export interface SubjectMarks {
  [subject: string]: number;
}

export interface CampusPrediction {
  campusName: string;
  previousCutoff: string;
  possibleRound: string;
  admissionChance: 'High' | 'Medium' | 'Low';
  status: '✅' | '⚠️' | '❌';
}

export interface DetailedAnalysis {
  predictedAdmissionProbability: number;
  recommendedCampus: string;
  alternativeOptions: string[];
  improvementAreas: string[];
}

export interface PredictionResult {
  courseSelected: string;
  totalScore: number;
  campusPredictions: CampusPrediction[];
  detailedAnalysis: DetailedAnalysis;
  recommendations: string[];
}
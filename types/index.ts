export interface PracticeMetric {
  count: number;
  description: string;
}

export interface ImprovementArea {
  point: string;
  drill: string;
}

export interface ServePhaseFeedback {
  score: number; // A score out of 10
  positive: string; // What the user is doing well in this phase
  improvement: string; // The primary thing to work on
  drill: string; // A specific drill to address the improvement area
}

export interface PracticeAnalysis {
  totalServes: number;
  overallImpression: string;
  // New detailed biomechanical breakdown
  stanceAndSetup: ServePhaseFeedback;
  tossAndWindup: ServePhaseFeedback;
  trophyPose: ServePhaseFeedback;
  contactAndPronation: ServePhaseFeedback;
  followThrough: ServePhaseFeedback;
}

export interface UserProfile {
  name: string;
  age: number | ''; // Allow empty string for form handling
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | '';
  playingHand: 'Right' | 'Left' | '';
  preferredCourtSurface: 'Hard' | 'Clay' | 'Grass' | '';
  racquetType: string;
  serveGoals: string[];
}

export interface Session {
  id: string;
  timestamp: number;
  type: 'practice' | 'image';
  data: PracticeAnalysis | string;
}

export interface UserAccount {
  password: string;
}
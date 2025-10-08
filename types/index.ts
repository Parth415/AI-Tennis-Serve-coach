
export interface PracticeMetric {
  count: number;
  description: string;
}

export interface ImprovementArea {
  point: string;
  drill: string;
}

export interface PracticeAnalysis {
  totalServes: number;
  metrics: {
    goodToss: PracticeMetric;
    goodPronation: PracticeMetric;
    goodFollowThrough: PracticeMetric;
  };
  overallImpression: string;
  strengths: string[];
  areasForImprovement: ImprovementArea[];
}

export interface UserProfile {
  name: string;
  age: number | ''; // Allow empty string for form handling
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | '';
  playingHand: 'Right' | 'Left' | '';
}

export interface Session {
  id: string;
  timestamp: number;
  type: 'practice' | 'image';
  data: PracticeAnalysis | string;
}

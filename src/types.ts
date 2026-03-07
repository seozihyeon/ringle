export type Domain = '필수영어' | '직무별' | '글로벌' | '산업별';
export type Purpose = '일상 대화' | '업무/발표' | '인터뷰 준비' | '심층 토론';
export type Baseline = 'Beginner Low' | 'Beginner High' | 'Intermediate Low' | 'Intermediate High';
export type PainPoint = '단어 회상' | '문법 걱정' | '대화 깊이 부족' | '표현 반복';
export type LearningStyle = 'Natural' | 'Precision' | 'Variety' | 'Systematic';

export interface UserProfile {
  domain: Domain;
  subCategory: string | string[];
  purpose: Purpose;
  baseline: Baseline;
  painPoint: PainPoint;
  style: LearningStyle;
  commitment: {
    dailyMinutes: number;
    weeklyFrequency: number | '매일';
  };
}

export interface Unit {
  id: number;
  title: string;
  completed: boolean;
  active: boolean;
  progress: number;
  track: 'PM' | 'Data' | 'General';
  items: {
    title: string;
    type: string;
    time: string;
    done: boolean;
    icon: string; // Icon name for lucide
  }[];
}

export interface Curriculum {
  tracks: {
    name: string;
    units: Unit[];
  }[];
}

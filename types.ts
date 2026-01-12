
export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export interface CountdownEvent {
  id: string;
  title: string;
  targetDate: Date;
  isActive: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

import { DocumentData, DocumentSnapshot, Timestamp } from "firebase/firestore";
import { daysBetween } from './util';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export interface ICUserDocument {
  name: string;
  phone: string;
  profilePhotoUrl: string | null;
}

export class ICUser {
  id: string;
  name: string;
  phone: string;
  profilePhotoUrl: string | null;

  constructor(doc: DocumentSnapshot<DocumentData>) {
    const { name, phone, profilePhotoUrl } = doc.data()! as ICUserDocument;

    this.id = doc.id;
    this.name = name;
    this.phone = phone;
    this.profilePhotoUrl = profilePhotoUrl;
  }
};

export interface ChallengeDocument {
  ownerId: string;
  name: string;
  startDate: Timestamp;
  dayCount: number;
}

export class Challenge {
  id: string;
  ownerId: string;
  name: string;
  startDate: Date;
  dayCount: number;

  constructor(doc: DocumentSnapshot<DocumentData>) {
    const { ownerId, name, startDate, dayCount } = doc.data()! as ChallengeDocument;

    this.id = doc.id;
    this.ownerId = ownerId;
    this.name = name;
    this.startDate = startDate.toDate();
    this.dayCount = dayCount;
  }

  isCompleted(): boolean {
    return this.startDate.getTime() + this.dayCount * 24 * 60 * 60 * 1000 < Date.now();
  }

  currentDay() {
    if (daysBetween(this.startDate) > this.dayCount) {
      return this.dayCount;
    }
    return daysBetween(this.startDate) + 1;
  }
};

export interface ParticipantDocument {
  name: string;
  challengeId: string;
  daysCompleted: number[];
}

export class Participant {
  id: string;
  name: string;
  challengeId: string;
  daysCompleted: number[];

  constructor(doc: DocumentSnapshot<DocumentData>) {
    const { name, challengeId, daysCompleted } = doc.data()! as ParticipantDocument;

    this.id = doc.id;
    this.name = name;
    this.challengeId = challengeId;
    this.daysCompleted = daysCompleted;
  }
};

export interface SerializedLeaderboardData {
  participantId: string;
  participantName: string;
  currentDay: number;
  lineChart: number[];
  currentStreakLength: number;
  currentStreakIncludesToday: boolean;
  bestStreakLength: number;
  totalCompletions: number;
}

export class LeaderboardData {
  private participant: Participant;
  private currentDay: number;

  public lineChart: number[];

  public currentStreakLength: number = 0;
  public currentStreakIncludesToday: boolean = false;
  public bestStreakLength: number;
  public totalCompletions: number;

  static compare(a: LeaderboardData, b: LeaderboardData) {
    return Number(b.currentStreakIncludesToday) - Number(a.currentStreakIncludesToday) ||
      b.currentStreakLength - a.currentStreakLength ||
      b.bestStreakLength - a.bestStreakLength ||
      b.totalCompletions - a.totalCompletions;
  }

  public serialize(): SerializedLeaderboardData {
    return {
      participantId: this.participant.id,
      participantName: this.participant.name,
      currentDay: this.currentDay,
      currentStreakIncludesToday: this.currentStreakIncludesToday,
      currentStreakLength: this.currentStreakLength,
      bestStreakLength: this.bestStreakLength,
      totalCompletions: this.totalCompletions,
      lineChart: this.lineChart,
    };
  }

  constructor(participant: Participant, currentDay: number) {
    this.participant = participant;
    this.currentDay = currentDay;
    this.totalCompletions = participant.daysCompleted.length;

    let graph = [];
    let curr = 0;
    let best = curr;

    let i = 0;
    for (let j = 0; j < this.participant.daysCompleted.length; j++) {
      while (i < this.participant.daysCompleted[j]) {
        best = Math.max(curr, best);
        curr = 0;
        graph.push(curr);
        i++;
      }
      curr++;
      graph.push(curr);
      i++;
    }
    while (i < this.currentDay) {
      graph.push(0);
      i++;
    }
    best = Math.max(curr, best);

    this.lineChart = graph;
    this.bestStreakLength = best;

    if (participant.daysCompleted.at(-1)! === currentDay) {
      this.currentStreakLength = this.lineChart.at(-1)!;
      this.currentStreakIncludesToday = true;
    }

    if (participant.daysCompleted.at(-1)! === currentDay - 1) {
      this.currentStreakLength = this.lineChart.at(-1)!;
    }
  }
};

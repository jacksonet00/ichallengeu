import { ApplicationVerifier } from 'firebase/auth';
import { DocumentData, DocumentSnapshot, Timestamp } from "firebase/firestore";
import { daysBetween } from './util';

declare global {
  interface Window {
    recaptchaVerifier: ApplicationVerifier;
  }
}

export interface ICUserDocument {
  name: string;
  phone: string;
  profilePhotoUrl: string;
  challenges: string[];
}

export class ICUser {
  id: string;
  name: string;
  phone: string;
  profilePhotoUrl: string;
  challenges: string[];

  constructor(doc: DocumentSnapshot<DocumentData>) {
    const { name, phone, profilePhotoUrl, challenges } = doc.data()! as ICUserDocument;

    this.id = doc.id;
    this.name = name;
    this.phone = phone;
    this.profilePhotoUrl = profilePhotoUrl;
    this.challenges = challenges;
  }
};

export interface InviteDocument {
  challengeId: string;
  senderId: string;
  senderName: string;
  expires: boolean;
  expiresAt: Timestamp | null;
}

export class Invite {
  id: string;
  senderId: string;
  senderName: string;
  challengeId: string;
  expires: boolean;
  expiresAt: Date | null;

  constructor(doc: DocumentSnapshot<DocumentData>) {
    const { senderId, senderName, challengeId, expires, expiresAt } = doc.data()! as InviteDocument;

    this.id = doc.id;
    this.senderId = senderId;
    this.senderName = senderName;
    this.challengeId = challengeId;
    this.expires = expires;
    this.expiresAt = expiresAt?.toDate() ?? null;
  }
};

export interface ChallengeDocument {
  ownerId: string;
  name: string;
  startDate: Timestamp;
  dayCount: number;
  users: string[];
}

export class Challenge {
  id: string;
  ownerId: string;
  name: string;
  startDate: Date;
  dayCount: number;
  users: string[];

  constructor(doc: DocumentSnapshot<DocumentData>) {
    const { ownerId, name, startDate, dayCount, users } = doc.data()! as ChallengeDocument;

    this.id = doc.id;
    this.ownerId = ownerId;
    this.name = name;
    this.startDate = startDate.toDate();
    this.dayCount = dayCount;
    this.users = users;
  }

  isCompleted(): boolean {
    return this.startDate.getTime() + this.dayCount * 24 * 60 * 60 * 1000 < Date.now();
  }

  currentDay() {
    const _daysBetween = daysBetween(this.startDate);

    if (_daysBetween >= this.dayCount) {
      return this.dayCount;
    }
    if (_daysBetween >= 1) {
      return _daysBetween + 1;
    }
    return new Date() > this.startDate ? 1 : 0;
  }
};

export interface ParticipantDocument {
  name: string;
  userId: string;
  challengeId: string;
  daysCompleted: number[];
  profilePhotoUrl: string;
}

export class Participant {
  id: string;
  name: string;
  userId: string;
  challengeId: string;
  daysCompleted: number[];
  profilePhotoUrl: string;

  constructor(doc: DocumentSnapshot<DocumentData>) {
    const { name, userId, challengeId, daysCompleted, profilePhotoUrl } = doc.data()! as ParticipantDocument;

    this.id = doc.id;
    this.name = name;
    this.userId = userId;
    this.challengeId = challengeId;
    this.daysCompleted = daysCompleted;
    this.profilePhotoUrl = profilePhotoUrl;
  }
};

export class LeaderboardData {
  public participant: Participant;
  public challenge: Challenge;

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

  constructor(participant: Participant, challenge: Challenge) {
    this.participant = participant;
    this.challenge = challenge;
    this.totalCompletions = participant.daysCompleted.length;

    const currentDay = challenge.currentDay() - 1;

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
    while (i < currentDay) {
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

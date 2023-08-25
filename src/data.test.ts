import { describe, expect, test } from '@jest/globals';

import { Challenge, ChallengeDocument, LeaderboardData, Participant, ParticipantDocument } from './data';
import { DocumentSnapshot } from 'firebase/firestore';
import { dateToTimestamp } from './util';

describe('test Challenge.isCompleted', () => {
  const doc: Partial<DocumentSnapshot<ChallengeDocument>> = {
    id: '1',
    data: () => ({
      ownerId: '1',
      name: 'test',
      startDate: dateToTimestamp(new Date('2023-07-01 00:00:00'))!,
      dayCount: 5,
      users: [],
    }),
  };
  const challenge = new Challenge(doc as any);

  test('date prior to start date', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-06-31 23:59:59'));
    expect(challenge.isCompleted()).toBe(false);
  });
  test('first day of challenge', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-07-01 00:00:00'));
    expect(challenge.isCompleted()).toBe(false);
  });
  test('date during challenge', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-07-03 03:14:39'));
    expect(challenge.isCompleted()).toBe(false);
  });
  test('last day of challenge', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-07-05 23:59:59'));
    expect(challenge.isCompleted()).toBe(false);
  });
  test('date after challenge', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-07-06 00:00:01'));
    expect(challenge.isCompleted()).toBe(true);
  });
});

describe('test Challenge.currentDay', () => {
  const doc: Partial<DocumentSnapshot<ChallengeDocument>> = {
    id: '1',
    data: () => ({
      ownerId: '1',
      name: 'test',
      startDate: dateToTimestamp(new Date('2023-07-01 00:00:00'))!,
      dayCount: 5,
      users: [],
    }),
  };
  const challenge = new Challenge(doc as any);

  test('date prior to start date', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-06-18 23:59:59'));
    expect(challenge.currentDay()).toBe(0);
  });
  test('just before start date', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-06-31 23:59:59'));
    expect(challenge.currentDay()).toBe(0);
  });
  test('first day of challenge', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-07-01 00:00:01'));
    expect(challenge.currentDay()).toBe(1);
  });
  test('date during challenge', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-07-03 03:14:39'));
    expect(challenge.currentDay()).toBe(3);
  });
  test('last day of challenge', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-07-05 23:59:59'));
    expect(challenge.currentDay()).toBe(5);
  });
  test('date after challenge', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-07-06 00:00:01'));
    expect(challenge.currentDay()).toBe(5);
  });
});

describe('test LeaderboardData.lineChart', () => {
  test('participant on a 3 day streak', () => {
    const challengeDoc: Partial<DocumentSnapshot<ChallengeDocument>> = {
      id: '1',
      data: () => ({
        ownerId: '1',
        name: 'test',
        startDate: dateToTimestamp(new Date('2023-07-01 00:00:00'))!,
        dayCount: 5,
        users: [],
      }),
    };
    const challenge = new Challenge(challengeDoc as any);

    const participantDoc: Partial<DocumentSnapshot<ParticipantDocument>> = {
      id: '1',
      data: () => ({
        name: 'test',
        userId: '1',
        challengeId: '1',
        daysCompleted: [1, 2, 3],
        profilePhotoUrl: '',
      }),
    };
    const participant = new Participant(participantDoc as any);

    const leaderboardData = new LeaderboardData(participant, challenge);

    jest.useFakeTimers().setSystemTime(new Date('2023-07-04 03:14:39'));

    expect(leaderboardData.lineChart).toEqual([0, 1, 2, 3]);
  });
});
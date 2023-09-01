import { describe, expect, test } from '@jest/globals';

import { Challenge, ChallengeDocument, LeaderboardData, Participant, ParticipantDocument } from '../src/data';
import { DocumentSnapshot } from 'firebase/firestore';
import { dateToTimestamp } from '../src/util';

describe('test Challenge functionality', () => {
  describe('isCompleted method', () => {
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

  describe('currentDay method', () => {
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
});

describe('test LeaderboardData functionality', () => {
  describe('lineChart property', () => {
    test('single participant on a 3 day streak', () => {
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
          daysCompleted: [2, 3, 4],
          profilePhotoUrl: '',
        }),
      };
      const participant = new Participant(participantDoc as any);

      const leaderboardData = new LeaderboardData(participant, challenge);

      jest.useFakeTimers().setSystemTime(new Date('2023-07-04 03:14:39'));

      expect(leaderboardData.challenge.currentDay()).toBe(4);

      expect(leaderboardData.lineChart).toEqual([0, 0, 1, 2, 3]);
    });

    test('3 participants on day 8 of a 30 day challenge', () => {
      jest.useFakeTimers().setSystemTime(new Date('2023-07-08 03:14:39'));

      const challengeDoc: Partial<DocumentSnapshot<ChallengeDocument>> = {
        id: '1',
        data: () => ({
          ownerId: '1',
          name: 'test',
          startDate: dateToTimestamp(new Date('2023-07-01 00:00:00'))!,
          dayCount: 30,
          users: [],
        }),
      };

      const challenge = new Challenge(challengeDoc as any);

      const participantDoc1: Partial<DocumentSnapshot<ParticipantDocument>> = {
        id: '1',
        data: () => ({
          name: 'test',
          userId: '1',
          challengeId: '1',
          daysCompleted: [1, 3, 5, 7],
          profilePhotoUrl: '',
        }),
      };

      const participantDoc2: Partial<DocumentSnapshot<ParticipantDocument>> = {
        id: '2',
        data: () => ({
          name: 'test',
          userId: '2',
          challengeId: '1',
          daysCompleted: [0, 1, 2],
          profilePhotoUrl: '',
        }),
      };

      const participantDoc3: Partial<DocumentSnapshot<ParticipantDocument>> = {
        id: '3',
        data: () => ({
          name: 'test',
          userId: '3',
          challengeId: '1',
          daysCompleted: [2, 5, 6, 7],
          profilePhotoUrl: '',
        }),
      };

      const participant1 = new Participant(participantDoc1 as any);
      const participant2 = new Participant(participantDoc2 as any);
      const participant3 = new Participant(participantDoc3 as any);

      challenge.users = [participant1.userId, participant2.userId, participant3.userId];

      const leaderboardData1 = new LeaderboardData(participant1, challenge);
      const leaderboardData2 = new LeaderboardData(participant2, challenge);
      const leaderboardData3 = new LeaderboardData(participant3, challenge);


      expect(leaderboardData2.challenge.currentDay()).toBe(8);

      expect(leaderboardData1.lineChart).toEqual([0, 1, 0, 1, 0, 1, 0, 1]);
      expect(leaderboardData2.lineChart).toEqual([1, 2, 3, 0, 0, 0, 0, 0]);
      expect(leaderboardData3.lineChart).toEqual([0, 0, 1, 0, 0, 1, 2, 3]);
    });
  });
});
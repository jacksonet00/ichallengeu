import { Challenge } from '@/data';
import { getAnalyticsSafely } from '@/firebase';
import { logEvent } from 'firebase/analytics';

interface CompletionTrackerProps {
  challenge: Challenge;
  completed: boolean;
  toggleCompletion: () => void;
}

export default function CompletionTracker({
  challenge,
  completed,
  toggleCompletion,
}: CompletionTrackerProps) {

  function handleClick(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    toggleCompletion();
    const analytics = getAnalyticsSafely();
    if (analytics) {
      if (!completed) {
        logEvent(analytics, 'click', {
          type: 'log completion',
          challengeId: challenge.id,
          challengeDay: challenge.currentDay(),
          challengeName: challenge.name,
        });
      }
      else {
        logEvent(analytics, 'click', {
          type: 'undo completion',
          challengeId: challenge.id,
          challengeDay: challenge.currentDay(),
          challengeName: challenge.name,
        });
      }
    }
  }

  return (
    <div
      className="bg-sky-50 rounded-md w-60 h-24 flex items-center justify-center"
    >
      {!completed && (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-sm font-semibold mb-4">{"Still haven't logged today..."}</h1>
          <button
            className="bg-sky-100 hover:bg-sky-200 px-3 py-2 rounded-md font-semibold text-sm w-48"
            onClick={handleClick}
          >
            Mark Completed ✅
          </button>
        </div>
      )}
      {completed && (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-sm font-semibold mb-4">{"Nice work! See ya tomorrow..."}</h1>
          <button
            className="bg-sky-100 hover:bg-sky-200 px-3 py-2 rounded-md font-semibold text-sm w-48"
            onClick={handleClick}
          >
            Undo ↩️
          </button>
        </div>
      )}
    </div>
  );
}
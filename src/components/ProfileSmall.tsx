import { logEvent } from "firebase/analytics";
import Image from 'next/image';
import { useState } from "react";
import { LeaderboardData } from "../data";
import { getAnalyticsSafely } from "../firebase";
import CompletionGraph from "./CompletionGraph";

export type ProfileProps = {
    leaderboardData: LeaderboardData;
    crown: boolean;
};

export default function ProfileSmall({
    leaderboardData,
    crown,
}: ProfileProps) {
    const [isShowingGraph, setIsShowingGraph] = useState(false);

    const {
        participant,
        currentStreakIncludesToday,
        bestStreakLength,
        currentStreakLength,
        totalCompletions,
        lineChart
    } = leaderboardData;

    function toggleGraph() {
        const analytics = getAnalyticsSafely();
        if (analytics && !isShowingGraph) {
            logEvent(analytics, 'select_content', {
                content_type: 'graph',
                item_id: participant.id,
            });
        }

        setIsShowingGraph(!isShowingGraph);
    }

    function renderStreakIcon() {
        if (currentStreakIncludesToday) {
            return (
                <div className="flex flex-row">
                    <h1 className={`font-bold ${currentStreakLength === bestStreakLength ? 'mr-2' : ''}`}>{`🔥 x ${currentStreakLength}`}</h1>
                    {currentStreakLength === bestStreakLength && <h1 className="font-bold">🏆</h1>}
                </div>
            );

        }
        return (
            <div className="flex flex-row">
                <Image src="/frozen-fire.svg" height={20} width={20} alt={"streak freeze"} />
                <h1 className={`font-bold ${currentStreakLength === bestStreakLength ? 'mr-2' : ''}`}>{`x ${currentStreakLength}`}</h1>
                {currentStreakLength === bestStreakLength && <h1 className="font-bold">🏆</h1>}
            </div>
        );

    }

    return (
        <div className="bg-sky-50 rounded-md flex flex-row justify-start items-center p-2">
            <div className="flex flex-col w-80">
                <div className="flex flex-row items-center justify-center">
                    <picture className="mr-2">
                        <source srcSet={participant.profilePhotoUrl} type="image/webp" />
                        <img className="rounded-full h-8 w-8" src={participant.profilePhotoUrl} alt={`profile photo for ${participant.name}`} />
                    </picture>
                    <div className="flex flex-col">
                        <div className="flex flex-row">
                            <h1 className="font-bold mr-2">{participant.name}</h1>
                            <h1 className="font-bold relative bottom-0.5">{`${crown ? '👑' : ''}`}</h1>
                        </div>
                        <div className="flex flex-row">
                            {currentStreakLength > 0 ? <h1 className="font-bold mr-2">{renderStreakIcon()}</h1> : <></>}
                            {currentStreakLength !== bestStreakLength && <h1 className="font-bold mr-2">🏅x {bestStreakLength}</h1>}
                            <h1 className="font-bold mr-2">✅ x {totalCompletions}</h1>
                        </div>
                    </div>
                    <button className="ml-auto mr-2" onClick={toggleGraph}>
                        <Image src={`/chevron-${isShowingGraph ? 'down' : 'left'}.svg`} width={20} height={20} alt={`${isShowingGraph ? 'down' : 'left'} arrow`} />
                    </button>
                </div>
                {isShowingGraph && (
                    <div className="mt-2 mb-2 pl-0.5 pr-0.5">
                        <CompletionGraph data={lineChart} />
                    </div>
                )}
            </div>
        </div>
    );
}

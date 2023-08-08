import { LeaderboardData } from "../data";
import ProfileSmall from "./ProfileSmall";
import ProgressBars from "./ProgressBars";

type LeaderboardEntryProps = {
    leaderboardData: LeaderboardData;
    crown: boolean;
};

export default function LeaderboardEntry({ leaderboardData, crown }: LeaderboardEntryProps) {
    return (
        <div className="pb-4 flex flex-col w-80 mb-4">
            <div>
                <div className="mb-2">
                    <ProfileSmall
                        serializedLeaderboardData={leaderboardData.serialize()}
                        crown={crown}
                    />
                </div>
                <ProgressBars
                    serializedLeaderboardData={leaderboardData.serialize()}
                />
            </div>
        </div>
    );
}
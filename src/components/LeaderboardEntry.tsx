import { LeaderboardData } from "../data";
import LeaderboardProfile from "./LeaderboardProfile";
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
                    <LeaderboardProfile
                        leaderboardData={leaderboardData}
                        crown={crown}
                    />
                </div>
                <ProgressBars
                    leaderboardData={leaderboardData}
                />
            </div>
        </div>
    );
}
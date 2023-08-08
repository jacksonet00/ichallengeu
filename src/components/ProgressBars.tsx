import { ChakraProvider, Progress } from "@chakra-ui/react";
import { LeaderboardData } from "../data";

type ProgressBarsProps = {
    leaderboardData: LeaderboardData;
};

export default function ProgressBars({
    leaderboardData
}: ProgressBarsProps) {
    const {
        currentStreakLength,
        currentStreakIncludesToday,
        bestStreakLength,
        totalCompletions,
        currentDay,
    } = leaderboardData;

    return (
        <ChakraProvider>
            <Progress
                colorScheme="yellow"
                value={(currentStreakLength / currentDay) *
                    (currentStreakIncludesToday ? 1 : 0) * 100}
            />
            <Progress
                colorScheme="blue"
                value={(bestStreakLength / currentDay) * 100}
            />
            <Progress
                colorScheme="gray"
                value={(totalCompletions / currentDay) * 100}
            />
        </ChakraProvider>
    );
}
'use client';

import { ChakraProvider, Progress } from "@chakra-ui/react";
import { SerializedLeaderboardData } from "../data";

type ProgressBarsProps = {
    serializedLeaderboardData: SerializedLeaderboardData;
};

export default function ProgressBars({
    serializedLeaderboardData
}: ProgressBarsProps) {
    const {
        currentStreakLength,
        currentStreakIncludesToday,
        bestStreakLength,
        totalCompletions,
        currentDay,
    } = serializedLeaderboardData;

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
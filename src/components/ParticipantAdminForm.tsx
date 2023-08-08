'use client';

import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

interface ParticipantAdminFormProps {
    participantId: string;
    participantName: string;
    daysCompleted: number[];
    currentDay: number;
}

export default function ParticipantAdminForm({
    participantId,
    participantName,
    daysCompleted,
    currentDay
}: ParticipantAdminFormProps) {
    async function toggleCompletion() {
        if (daysCompleted.at(-1) !== currentDay) {
            await setDoc(doc(db, 'participants', participantId), {
                daysCompleted: [
                    ...daysCompleted,
                    currentDay,
                ]
            }, { merge: true });
        }
        else {
            await setDoc(doc(db, 'participants', participantId), {
                daysCompleted: daysCompleted.slice(0, -1),
            }, { merge: true });
        }
    }

    return (
        <div className={`mb-2 p-2 rounded-sm justify-center items-center align-middle${daysCompleted.at(-1) === currentDay ? ' bg-green-500' : ' bg-red-500'}`}>
            <button className={`text-center w-auto`} onClick={toggleCompletion}>{`${daysCompleted.at(-1) === currentDay ? 'Remove' : 'Add'} ✅ for ${participantName}`}</button>
        </div>
    );
}
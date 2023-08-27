interface IconDescriptionRowProps {
    icon: string;
    description: string;
}

function IconDescriptionRow({
    icon,
    description,
}: IconDescriptionRowProps) {
    return (
        <div className="flex flex-row w-52 items-center">
            <div className="bg-sky-200 w-7 h-7 rounded-sm flex items-center justify-center mr-2">
                <h1 className="font-bold">{icon}</h1>
            </div>
            <h1 className="font-bold text-xs">{description}</h1>
        </div>
    );
}

export default function IconDescription() {
    return (
        <div className="bg-sky-50 w-60 h-40 rounded-md flex flex-col items-center pt-2 pb-2 justify-evenly">
            <IconDescriptionRow icon="🔥" description="Your streak!" />
            <IconDescriptionRow icon="🏆" description="You're on your best streak!" />
            <IconDescriptionRow icon="🏅" description="Your all time best streak." />
            <IconDescriptionRow icon="✅" description="Your total completions." />
        </div>
    );
}
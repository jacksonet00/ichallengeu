interface IconExplainerRowProps {
    icon: string;
    description: string;
}

function IconExplainerRow({
    icon,
    description,
}: IconExplainerRowProps) {
    return (
        <div className="flex flex-row w-52 items-center">
            <div className="bg-sky-200 w-7 h-7 rounded-sm flex items-center justify-center mr-2">
                <h1 className="font-bold">{icon}</h1>
            </div>
            <h1 className="font-bold text-xs">{description}</h1>
        </div>
    );
}

interface IconExplainerProps {

}

export default function IconExplainer({ }: IconExplainerProps) {
    return (
        <div className="bg-sky-50 w-60 h-40 rounded-md flex flex-col items-center pt-2 pb-2 justify-evenly">
            <IconExplainerRow icon="🔥" description="Your streak!" />
            <IconExplainerRow icon="🏆" description="You're on your best streak!" />
            <IconExplainerRow icon="🏅" description="Your all time best streak." />
            <IconExplainerRow icon="✅" description="Your total completions." />
        </div>
    );
}
export type IconProps = {
    emoji: string;
    value: number;
};

export default function Icon({ emoji, value }: IconProps) {
    return (
        <div className="cursor-default">
            <div className="bg-cyan-50 h-12 w-12 rounded-md flex flex-col items-center justify-center p-4">
                <h1 className="text-3xl">{emoji}</h1>
            </div>
            <div className="bg-red-500 w-5 h-5 rounded-full flex items-center justify-center relative bottom-14 right-1">
                <h1 className="text-xs text-white font-bold">{value}</h1>
            </div>
        </div>
    );
}
import Link from "next/link";

export default function Header() {
    return (
        <div className="flex justify-center items-center flex-col pb-10">
            <div className="pb-2 pt-5 flex items-center">
                <Link href="/">
                    <h1 className="text-5xl pb-2">🏆</h1>
                </Link>
                <Link href="/new">
                    <button className="absolute top-8 right-10 bg-sky-600 rounded-md pt-1.5 pb-1.5 pl-2.5 pr-2.5 md:pt-2 md:pb-2 md:pl-3 md:pr-3 text-white font-bold text-xs md:text-sm">new +</button>
                </Link>
            </div>
            <div>
                <Link href="/">
                    <h1 className="text-4xl font-bold">iChallenge U</h1>
                </Link>
            </div>
        </div>
    );
}
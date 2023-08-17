import Link from "next/link";

export default function Header() {
    return (
        <div className="flex justify-center items-center flex-col pb-10">
            <div className="pb-2 pt-5 flex items-center">
                <Link href="/">
                    <h1 className="text-5xl pb-2">🏆</h1>
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
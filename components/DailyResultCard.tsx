"use client";

import Link from "next/link";
import Button from "./Button";

export interface DailyResultCardProps {
  countdown: string;
  onShare: () => void;
}

export default function DailyResultCard({ countdown, onShare }: DailyResultCardProps) {
  return (
    <div className="w-full flex flex-col items-center text-center gap-8">
      <div className="flex flex-col items-center gap-4 w-full">
        <p className="label text-[#9A9A9A]">NEXT PUZZLE IN</p>
        <p className="display-type text-white tabular-nums">{countdown}</p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <Button variant="primary" size="lg" className="w-full" onClick={onShare}>
          SHARE RESULT
        </Button>
        <Link href="/practice" className="w-full">
          <Button variant="ghost" size="lg" className="w-full">
            PRACTICE MODE
          </Button>
        </Link>
      </div>
    </div>
  );
}

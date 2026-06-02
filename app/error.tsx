"use client";

import { useEffect } from "react";
import Button from "@/components/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-3 text-center max-w-md">
        <p className="label text-[#9A9A9A]">SOMETHING WENT WRONG</p>
        <p className="body-type text-[#9A9A9A]">
          The app hit an error. Try again, or restart the dev server if this keeps happening.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button variant="primary" size="lg" className="w-full" onClick={reset}>
          TRY AGAIN
        </Button>
        <Button variant="ghost" size="lg" className="w-full" onClick={() => (window.location.href = "/daily")}>
          BACK TO DAILY
        </Button>
      </div>
    </main>
  );
}

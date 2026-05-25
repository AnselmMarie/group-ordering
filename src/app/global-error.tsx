"use client";

import { useEffect } from "react";

import { Body } from "@/ui/components/layout/body";
import { Page } from "@/ui/components/layout/page";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <Page>
          <Body centered>
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="max-w-md text-gray-600">
              The app ran into an unexpected error. Please refresh the page to
              try again.
            </p>
            <button
              type="button"
              onClick={reset}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Try again
            </button>
          </Body>
        </Page>
      </body>
    </html>
  );
}

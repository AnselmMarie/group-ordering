"use client";

import { useEffect } from "react";

import { Body } from "@/ui/components/layout/body";
import { Page } from "@/ui/components/layout/page";
import { Button } from "@/ui/shadcn/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Page>
      <Body centered>
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground max-w-md">
          We hit an unexpected error. Please try again, and if it keeps
          happening refresh the page.
        </p>
        <Button onClick={reset}>Try again</Button>
      </Body>
    </Page>
  );
}

import Link from "next/link";

import { buttonVariants } from "@/ui/shadcn/button";
import { Page } from "@/ui/components/layout/page";
import { Body } from "@/ui/components/layout/body";

export default function NotFound() {
  return (
    <Page>
      <Body centered>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground max-w-md">
          We couldn&apos;t find the page you were looking for.
        </p>
        <Link href="/" className={buttonVariants()}>
          Go back home
        </Link>
      </Body>
    </Page>
  );
}

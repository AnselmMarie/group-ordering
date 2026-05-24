import { Body, Container, Head, Html, Preview } from "@react-email/components";
import type { ReactNode } from "react";

import {
  COLOR_SURFACE_NEUTRAL_100,
  COLOR_SURFACE_WHITE,
  COLOR_TEXT_REGULAR,
  FONT_FAMILY,
  FONT_SIZE_BODY,
} from "../email-tokens";
import EmailFooter from "./email-footer";
import EmailHeader from "./email-header";

interface EmailLayoutProps {
  logoUrl: string;
  preview: string;
  children: ReactNode;
}

const EmailLayout = ({ logoUrl, preview, children }: EmailLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <EmailHeader logoUrl={logoUrl} />
          {children}
          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  body: {
    backgroundColor: COLOR_SURFACE_NEUTRAL_100,
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZE_BODY,
    color: COLOR_TEXT_REGULAR,
    margin: "0",
    padding: "0",
  },
  container: {
    backgroundColor: COLOR_SURFACE_WHITE,
    maxWidth: "600px",
    margin: "0 auto",
    borderRadius: "8px",
  },
};

export default EmailLayout;

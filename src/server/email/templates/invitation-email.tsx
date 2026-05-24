import { Button, Column, Row, Section, Text } from "@react-email/components";

import EmailLayout from "../components/email-layout";
import {
  COLOR_BORDER_SECONDARY,
  COLOR_DANGER,
  COLOR_SURFACE_PRIMARY,
  COLOR_SURFACE_WHITE,
  COLOR_TEXT_REGULAR,
  COLOR_TEXT_SECONDARY,
  FONT_FAMILY,
  FONT_SIZE_BODY,
  FONT_SIZE_HEADING,
} from "../email-tokens";

interface InvitationEmailProps {
  inviterName: string;
  subject: string;
  description: string;
  acceptLink: string;
  rejectLink: string;
  logoUrl: string;
}

const InvitationEmail = ({
  inviterName,
  subject,
  description,
  acceptLink,
  rejectLink,
  logoUrl,
}: InvitationEmailProps) => {
  return (
    <EmailLayout logoUrl={logoUrl} preview={subject}>
      <Section style={styles.content}>
        <Text style={styles.heading}>{subject}</Text>
        <Text style={styles.body}>
          <strong>{inviterName}</strong> {description}
        </Text>

        <Row style={styles.buttonRow}>
          <Column align="center" style={styles.buttonColumn}>
            <Button
              href={acceptLink}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.acceptButton}
            >
              Accept
            </Button>
          </Column>
          <Column align="center" style={styles.buttonColumn}>
            <Button
              href={rejectLink}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.rejectButton}
            >
              Reject
            </Button>
          </Column>
        </Row>
      </Section>
    </EmailLayout>
  );
};

const styles = {
  content: {
    padding: "32px",
  },
  heading: {
    fontSize: FONT_SIZE_HEADING,
    fontFamily: FONT_FAMILY,
    fontWeight: "700" as const,
    color: COLOR_TEXT_REGULAR,
    margin: "0 0 12px",
  },
  body: {
    fontSize: FONT_SIZE_BODY,
    fontFamily: FONT_FAMILY,
    color: COLOR_TEXT_SECONDARY,
    lineHeight: "1.6",
    margin: "0 0 24px",
  },
  buttonRow: {
    margin: "0 auto",
  },
  buttonColumn: {
    width: "50%",
    padding: "0 8px",
  },
  acceptButton: {
    backgroundColor: COLOR_SURFACE_PRIMARY,
    color: COLOR_SURFACE_WHITE,
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZE_BODY,
    fontWeight: "700" as const,
    padding: "12px 20px",
    borderRadius: "4px",
    textDecoration: "none",
    display: "inline-block",
  },
  rejectButton: {
    backgroundColor: COLOR_SURFACE_WHITE,
    color: COLOR_DANGER,
    border: `1px solid ${COLOR_BORDER_SECONDARY}`,
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZE_BODY,
    fontWeight: "700" as const,
    padding: "12px 20px",
    borderRadius: "4px",
    textDecoration: "none",
    display: "inline-block",
  },
};

export default InvitationEmail;

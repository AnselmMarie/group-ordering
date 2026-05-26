import { Section, Text } from "@react-email/components";

import {
  COLOR_SURFACE_NEUTRAL_100,
  COLOR_TEXT_SECONDARY,
  FONT_FAMILY,
  FONT_SIZE_LEGAL,
} from "../email-tokens";

const EmailFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Section style={styles.container}>
      <Text style={styles.text}>
        &copy; {currentYear} Seafood Shack. All rights reserved.
      </Text>
    </Section>
  );
};

const styles = {
  container: {
    padding: "32px",
    backgroundColor: COLOR_SURFACE_NEUTRAL_100,
  },
  text: {
    color: COLOR_TEXT_SECONDARY,
    fontSize: FONT_SIZE_LEGAL,
    fontFamily: FONT_FAMILY,
    textAlign: "center" as const,
    margin: "0",
  },
};

export default EmailFooter;

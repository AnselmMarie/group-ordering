import { Img, Section } from "@react-email/components";

import { COLOR_SURFACE_PRIMARY } from "../email-tokens";

interface EmailHeaderProps {
  logoUrl: string;
}

const EmailHeader = ({ logoUrl }: EmailHeaderProps) => {
  return (
    <Section style={styles.container}>
      <Img
        src={logoUrl}
        width="161"
        height="25"
        alt="Group Ordering"
        style={styles.logo}
      />
    </Section>
  );
};

const styles = {
  container: {
    textAlign: "center" as const,
    padding: "32px 0 32px",
    backgroundColor: COLOR_SURFACE_PRIMARY,
  },
  logo: {
    margin: "0 auto",
  },
};

export default EmailHeader;

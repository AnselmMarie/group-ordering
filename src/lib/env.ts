const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
};

const optionalEnv = (name: string): string | undefined => {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
};

export const getDatabaseUrl = (): string => {
  return requireEnv("DATABASE_URL");
};

export const getResendApiKey = (): string => {
  return requireEnv("RESEND_API_KEY");
};

export const getEmailNotificationsAddress = (): string | undefined => {
  return optionalEnv("EMAIL_ADDRESS_NOTIFICATIONS");
};

export const getAppUrl = (): string | undefined => {
  return optionalEnv("APP_URL");
};

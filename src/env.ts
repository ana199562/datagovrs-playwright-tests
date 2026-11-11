export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://data.gov.rs',
  isCI: Boolean(process.env.CI),
};

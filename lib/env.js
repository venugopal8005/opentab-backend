export const env = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
};

for (const [key, value] of Object.entries(env)) {
  if (!value) {
    throw new Error(`Missing required env variable: ${key}`);
  }
}

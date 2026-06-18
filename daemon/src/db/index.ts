import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';

// biome-ignore lint/style/noNonNullAssertion: We know that the env variable exists in our .env file.
export const db = drizzle(process.env.DB_FILE_NAME!);

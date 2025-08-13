import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import * as schema from "@/db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg", // or "mysql",
      schema: {
        ...schema,
      }
    }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_OAUTH2_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET!,
    },
  },
});
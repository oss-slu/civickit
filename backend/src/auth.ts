import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "./db";
import { accounts, sessions, users, verifications } from "./db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        // Mapped explicitly rather than passing the whole schema module:
        // better-auth looks its models up by the singular names on the left,
        // and our exports are plural.
        schema: {
            user: users,
            session: sessions,
            account: accounts,
            verification: verifications,
        },
    }),
    emailAndPassword: {
        enabled: true
    },
    trustedOrigins: ["http://localhost:3001"],
});

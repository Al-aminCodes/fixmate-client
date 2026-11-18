import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

const mongoUri = (
  globalThis as typeof globalThis & {
    process: { env: Record<string, string | undefined> };
  }
).process.env.MONGODB_URL;
if (!mongoUri) {
  throw new Error("MONGODB_URI environment variable is not defined");
}
const client = new MongoClient(mongoUri);
const db = client.db("fix-mate");
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
      },
      phone: {
        type: "string",
        required: false,
      },
      area: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
    },
  },
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID as string, // [!code highlight]
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, // [!code highlight]
  //   },
  // },
  database: mongodbAdapter(db, {
    client,
  }),
});

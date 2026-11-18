import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";

import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(process.env.MONGODB_URI!);

export const auth = betterAuth({
  database: mongodbAdapter(mongoClient.db()),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
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

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const allowedRoles = ["customer", "technician"];

          const role = allowedRoles.includes(user.role as string)
            ? user.role
            : "customer";

          return {
            data: {
              ...user,
              role,
            },
          };
        },
      },
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

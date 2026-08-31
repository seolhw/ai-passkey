import { i18n } from "@better-auth/i18n";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { db } from "#/db/index";
import * as schema from "#/db/schema";
import { env } from "#/env";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "#/integrations/resend";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      void sendVerificationEmail({
        to: user.email,
        subject: "验证你的邮箱",
        url,
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail({
        to: user.email,
        subject: "重置密码",
        url,
      });
    },
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID || "",
      clientSecret: env.GITHUB_CLIENT_SECRET || "",
      disabled: !env.GITHUB_CLIENT_ID,
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  plugins: [
    i18n({
      translations: {
        zh: {
          USER_NOT_FOUND: "用户不存在",
          INVALID_EMAIL_OR_PASSWORD: "邮箱或密码无效",
          INVALID_PASSWORD: "密码无效",
          USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "用户已存在，请使用其他邮箱",
        },
      },
    }),
    tanstackStartCookies(),
  ],
});

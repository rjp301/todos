import { google } from "@/lib/auth";
import { OAuth2RequestError } from "arctic";

import type { APIContext } from "astro";
import { db, eq, User } from "astro:db";
import { v4 as uuid } from "uuid";
import setUserSession from "@/lib/auth/set-user-session";
import getGoogleUser from "@/lib/auth/get-google-user";

export async function GET(context: APIContext): Promise<Response> {
  const code = context.url.searchParams.get("code");
  const state = context.url.searchParams.get("state");
  const storedState = context.cookies.get("google_oauth_state")?.value ?? null;
  const storedVerifier =
    context.cookies.get("google_oauth_code_verifier")?.value ?? null;

  if (
    !code ||
    !state ||
    !storedState ||
    !storedVerifier ||
    state !== storedState
  ) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, storedVerifier);

    const googleUser = await getGoogleUser(tokens.accessToken);

    const existingUser = await db
      .select()
      .from(User)
      .where(eq(User.email, googleUser.email))
      .then((rows) => rows[0]);

    if (existingUser) {
      await db
        .update(User)
        .set({ googleId: googleUser.id })
        .where(eq(User.id, existingUser.id));
      await setUserSession(context, existingUser.id);
      return context.redirect("/");
    }

    // add user to database
    const user = await db
      .insert(User)
      .values({
        id: uuid(),
        email: googleUser.email,
        googleId: googleUser.id,
        name: googleUser.name,
        avatarUrl: googleUser.picture,
      })
      .returning()
      .then((rows) => rows[0]);

    await setUserSession(context, user.id);
    return context.redirect("/");
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
}

import { Todo, User, db } from "astro:db";
import { v4 as uuid } from "uuid";

// https://astro.build/db/seed
export default async function seed() {
  const { id: userId } = await db
    .insert(User)
    .values({
      id: uuid(),
      githubId: 71047303,
      username: "rjp301",
      name: "Riley Paul",
      avatarUrl: "https://avatars.githubusercontent.com/u/71047303?v=4",
    })
    .returning()
    .then((rows) => rows[0]);

  console.log(`User created with ID: ${userId}`);

  await db.insert(Todo).values([
    { text: "Learn Astro", userId },
    { text: "Build a website", userId },
    { text: "Profit", userId },
  ]);
}

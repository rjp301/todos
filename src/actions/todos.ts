import { defineAction } from "astro:actions";
import {
  filterTodoBySharedTag,
  getUsersOfTodo,
  isAuthorized,
  queryTodos,
} from "./_helpers";
import { and, db, eq, or, Todo } from "astro:db";

import { v4 as uuid } from "uuid";
import { z } from "zod";
import invalidateUsers from "./helpers/invalidate-users";

const todoUpdateSchema = z.custom<Partial<typeof Todo.$inferInsert>>();

export const getTodos = defineAction({
  input: z.object({
    tag: z.string().optional(),
  }),
  handler: async ({ tag }, c) => {
    const userId = isAuthorized(c).id;
    return await queryTodos(tag, userId);
  },
});

export const createTodo = defineAction({
  input: z.object({
    data: todoUpdateSchema,
  }),
  handler: async ({ data }, c) => {
    const userId = isAuthorized(c).id;
    const todo = await db
      .insert(Todo)
      .values({ id: uuid(), text: "", ...data, userId })
      .returning()
      .then((rows) => rows[0]);

    invalidateUsers(await getUsersOfTodo(todo.id));
    return todo;
  },
});

export const updateTodo = defineAction({
  input: z.object({
    id: z.string(),
    data: z.custom<Partial<typeof Todo.$inferInsert>>(),
  }),
  handler: async ({ id, data }, c) => {
    const userId = isAuthorized(c).id;

    const sharedTagFilter = await filterTodoBySharedTag(userId);
    const todo = await db
      .update(Todo)
      .set({ ...data, userId })
      .where(and(eq(Todo.id, id), or(eq(Todo.userId, userId), sharedTagFilter)))
      .returning()
      .then((rows) => rows[0]);

    invalidateUsers(await getUsersOfTodo(todo.id));
    return todo;
  },
});

export const deleteTodo = defineAction({
  input: z.object({
    id: z.string(),
  }),
  handler: async ({ id }, c) => {
    const userId = isAuthorized(c).id;
    const sharedTagFilter = await filterTodoBySharedTag(userId);
    const todo = await db
      .update(Todo)
      .set({ isDeleted: true })
      .where(and(eq(Todo.id, id), or(eq(Todo.userId, userId), sharedTagFilter)))
      .returning()
      .then((rows) => rows[0]);

    invalidateUsers(await getUsersOfTodo(todo.id));
    return todo.id;
  },
});

export const undoDeleteTodo = defineAction({
  input: z.object({
    id: z.string(),
  }),
  handler: async ({ id }, c) => {
    const userId = isAuthorized(c).id;
    const sharedTagFilter = await filterTodoBySharedTag(userId);
    const todo = await db
      .update(Todo)
      .set({ isDeleted: false })
      .where(and(eq(Todo.id, id), or(eq(Todo.userId, userId), sharedTagFilter)))
      .returning()
      .then((rows) => rows[0]);

    invalidateUsers(await getUsersOfTodo(todo.id));
    return todo.id;
  },
});

export const deleteCompletedTodos = defineAction({
  handler: async (_, c) => {
    const userId = isAuthorized(c).id;
    const todos = await db
      .update(Todo)
      .set({ isDeleted: true })
      .where(and(eq(Todo.isCompleted, true), eq(Todo.userId, userId)))
      .returning();
    return todos;
  },
});

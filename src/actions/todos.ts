import { ActionError, defineAction } from "astro:actions";
import {
  filterTodoBySharedTag,
  getUsersOfTodo,
  isAuthorized,
} from "./_helpers";
import { and, db, desc, eq, isNull, ListShare, or, Todo, User } from "astro:db";

import { v4 as uuid } from "uuid";
import { z } from "zod";
import invalidateUsers from "./helpers/invalidate-users";
import type { TodoSelect } from "@/lib/types";

const todoUpdateSchema = z.custom<Partial<typeof Todo.$inferInsert>>();

export const getTodos = defineAction({
  input: z.object({
    type: z.enum(["inbox", "all", "list"]),
    listId: z.string().optional(),
  }),
  handler: async ({ type, listId }, c) => {
    const userId = isAuthorized(c).id;
    const todos: TodoSelect[] = await db
      .select()
      .from(Todo)
      .leftJoin(ListShare, eq(ListShare.listId, Todo.listId))
      .where(
        and(
          eq(Todo.isDeleted, false),
          or(eq(Todo.userId, userId), eq(ListShare.sharedUserId, userId)),
          type === "list" ? eq(Todo.listId, listId ?? "") : undefined,
          type === "inbox" ? isNull(Todo.listId) : undefined,
        ),
      )
      .orderBy(desc(Todo.createdAt))
      .innerJoin(User, eq(User.id, Todo.userId))
      .then((rows) => {
        const ids = new Set<string>();
        return rows
          .filter((row) => {
            if (ids.has(row.Todo.id)) return false;
            ids.add(row.Todo.id);
            return true;
          })
          .map((row) => ({
            ...row.Todo,
            user: row.User,
            isShared: row.Todo.userId !== userId,
          }));
      });
    return todos;
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

    const existingTodo = await db
      .select()
      .from(Todo)
      .leftJoin(ListShare, eq(ListShare.listId, Todo.listId))
      .where(
        and(
          eq(Todo.id, id),
          or(eq(Todo.userId, userId), eq(ListShare.sharedUserId, userId)),
        ),
      );

    if (existingTodo.length === 0) {
      throw new ActionError({
        message: "Todo not found",
        code: "NOT_FOUND",
      });
    }

    const todo = await db
      .update(Todo)
      .set({ ...data, userId })
      .where(eq(Todo.id, id))
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

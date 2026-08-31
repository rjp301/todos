import type { ApolloCache } from "@apollo/client";
import {
  ListFullFragmentDoc,
  TodoFragmentDoc,
  type TodoFragment,
  type ListFullFragment,
} from "../gql.gen";

export const readListFromCache = (
  cache: ApolloCache,
  listId: string | number,
) => {
  const listCacheId = cache.identify({
    __typename: "ListObjectType",
    id: listId,
  });
  return cache.readFragment<ListFullFragment>({
    id: listCacheId,
    fragmentName: "ListFull",
    fragment: ListFullFragmentDoc,
    optimistic: true,
  });
};

export const readTodoFromCache = (
  cache: ApolloCache,
  todoId: string | number,
) => {
  const todoCacheId = cache.identify({
    __typename: "TodoObjectType",
    id: todoId,
  });
  return cache.readFragment<TodoFragment>({
    id: todoCacheId,
    fragmentName: "Todo",
    fragment: TodoFragmentDoc,
    optimistic: true,
  });
};

export function removeNullish<T extends Record<string, unknown>>(
  input: T,
): Partial<{
  [K in keyof T]: Exclude<T[K], null | undefined>;
}> {
  return Object.fromEntries(
    Object.entries(input).filter(
      ([_, value]) => value !== undefined && value !== null,
    ),
  ) as Partial<{
    [K in keyof T]: Exclude<T[K], null | undefined>;
  }>;
}

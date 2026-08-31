import type { ApolloCache } from "@apollo/client";
import {
  ListFullFragmentDoc,
  TodoFragmentDoc,
  type TodoFragment,
  type ListFullFragment,
} from "../gql.gen";

export const readListFromCache = (cache: ApolloCache, listId: string) => {
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

export const readTodoFromCache = (cache: ApolloCache, todoId: string) => {
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

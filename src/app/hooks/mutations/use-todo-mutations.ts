import {
  CreateTodoDocument,
  DeleteCompletedTodosDocument,
  DeleteTodoDocument,
  GetMeDocument,
  UncheckCompletedTodosDocument,
  UpdateTodoDocument,
  type ListFullFragment,
} from "@/app/gql.gen";
import { readListFromCache, readTodoFromCache } from "@/app/graphql/utils";
import {
  useApolloClient,
  useMutation,
  useSuspenseQuery,
} from "@apollo/client/react";

export default function useTodoMutations() {
  const client = useApolloClient();

  const {
    data: { me },
  } = useSuspenseQuery(GetMeDocument);

  const createTodoMutation = useMutation(CreateTodoDocument, {
    optimisticResponse: ({ input: { text, listId } }, { IGNORE }) => {
      const existingList = readListFromCache(client.cache, listId as string);
      if (!existingList) return IGNORE;

      return {
        __typename: "Mutation",
        createTodo: {
          ...existingList,
          todoCount: existingList.todoCount + 1,
          todos: [
            {
              __typename: "TodoObjectType",
              id: `temp-id-${Math.random()}`,
              text,
              isCompleted: false,
              isAuthor: true,
              author: me,
              list: existingList,
            },
            ...existingList.todos,
          ],
        },
      };
    },
  });

  const updateTodoMutation = useMutation(UpdateTodoDocument);

  const deleteTodoMutation = useMutation(DeleteTodoDocument, {
    optimisticResponse: {
      deleteTodo: true,
    },
    update: (cache, { data }, { variables: { todoId } = {} }) => {
      if (!data?.deleteTodo) return;
      const todo = readTodoFromCache(cache, todoId as string);
      const listCacheId = cache.identify({
        __typename: "ListObjectType",
        id: todo?.list.id,
      });
      cache.modify<ListFullFragment>({
        id: listCacheId,
        fields: {
          todoCount: (count) => count - 1,
          todos: (existingTodoRefs = [], { readField }) => {
            return existingTodoRefs.filter(
              (ref) => readField("id", ref) !== todoId,
            );
          },
        },
      });
    },
  });

  const deleteCompletedTodosMutation = useMutation(
    DeleteCompletedTodosDocument,
    {
      optimisticResponse: ({ listId }, { IGNORE }) => {
        const existingList = readListFromCache(client.cache, listId as string);
        if (!existingList) return IGNORE;

        return {
          __typename: "Mutation",
          deleteCompletedTodos: {
            ...existingList,
            todos: existingList.todos.filter((todo) => !todo.isCompleted),
          },
        };
      },
    },
  );

  const uncheckCompletedTodosMutation = useMutation(
    UncheckCompletedTodosDocument,
    {
      optimisticResponse: ({ listId }, { IGNORE }) => {
        const existingList = readListFromCache(client.cache, listId as string);
        if (!existingList) return IGNORE;

        return {
          __typename: "Mutation",
          uncheckCompletedTodos: {
            ...existingList,
            todoCount: existingList.todos.length,
            todos: existingList.todos.map((todo) => ({
              ...todo,
              isCompleted: false,
            })),
          },
        };
      },
    },
  );

  return {
    createTodoMutation,
    updateTodoMutation,
    deleteTodoMutation,
    deleteCompletedTodosMutation,
    uncheckCompletedTodosMutation,
  };
}

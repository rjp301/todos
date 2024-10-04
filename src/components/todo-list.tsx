import type React from "react";

import TodoItem from "./todo";
import { Skeleton } from "./ui/skeleton";
import useTodosQuery from "@/hooks/use-current-todos";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import QueryGuard from "./base/query-guard";

const ListHeader: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <h2 className="px-3 text-sm font-bold text-muted-foreground">{children}</h2>
  );
};

const TodoList: React.FC = () => {
  const todosQuery = useTodosQuery();
  const todos = todosQuery.data ?? [];

  if (todosQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {new Array(3).fill(null).map((_, i) => (
          <Skeleton key={i} className="h-[58px] w-full" />
        ))}
      </div>
    );
  }

  if (todosQuery.isSuccess && todos.length === 0) {
    return (
      <div className="flex min-h-20 flex-1 items-center justify-center text-sm">
        <p className="text-muted-foreground">No todos!</p>
      </div>
    );
  }

  if (todosQuery.isError) {
    return (
      <div className="flex min-h-20 flex-1 items-center justify-center text-sm">
        <p className="text-muted-foreground">An error occurred</p>
      </div>
    );
  }

  const inCompleteTodos = todos.filter((todo) => !todo.isCompleted);
  const completedTodos = todos.filter((todo) => todo.isCompleted);

  return (
    <QueryGuard query={todosQuery}>
      {(todos) => (
        <div className="flex flex-col gap-5">
          {inCompleteTodos.length > 0 && (
            <SortableContext
              items={inCompleteTodos}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-2">
                <ListHeader>Next</ListHeader>
                {inCompleteTodos.map((todo, index) => (
                  <TodoItem key={todo.id} todo={todo} index={index} />
                ))}
              </div>
            </SortableContext>
          )}
          {completedTodos.length > 0 && (
            <div className="grid gap-2">
              <ListHeader>Completed</ListHeader>
              {completedTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>
          )}
        </div>
      )}
    </QueryGuard>
  );
};

export default TodoList;

import type React from "react";

import TodoItem from "./todo";
import { Skeleton } from "./ui/skeleton";
import useTodosQuery from "@/hooks/use-current-todos";
import Draggable from "./draggable";
import { createPortal } from "react-dom";
import { DragOverlay } from "@dnd-kit/core";
import { useAtomValue } from "jotai";
import { draggingTodoAtom } from "@/lib/store";

const ListHeader: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <h2 className="px-3 text-sm font-bold text-muted-foreground">{children}</h2>
  );
};

const TodoList: React.FC = () => {
  const todosQuery = useTodosQuery();
  const todos = todosQuery.data ?? [];

  const draggingTodo = useAtomValue(draggingTodoAtom);

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
    <div className="flex flex-col gap-5">
      {inCompleteTodos.length > 0 && (
        <div className="grid gap-2">
          <ListHeader>Next</ListHeader>
          {inCompleteTodos.map((todo) => (
            <Draggable id={todo.id} key={todo.id}>
              <TodoItem todo={todo} />
            </Draggable>
          ))}
          {
            <DragOverlay>
              {draggingTodo && (
                <TodoItem todo={draggingTodo} key={draggingTodo.id} />
              )}
            </DragOverlay>
          }
        </div>
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
  );
};

export default TodoList;

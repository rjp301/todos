import React from "react";
import { cn } from "@/lib/utils";
import DeleteButton from "./ui/delete-button";
import { Link2 } from "lucide-react";
import useMutations from "@/hooks/use-mutations";
import type { TodoSelect } from "@/lib/types";
import TodoEditor from "./todo-editor";
import { useEventListener, useOnClickOutside } from "usehooks-ts";

import { useDraggable } from "@dnd-kit/core";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "./ui/checkbox";
import { DRAGGING_TYPES } from "@/lib/constants";

interface Props {
  todo: TodoSelect;
}

const TodoItem: React.FC<Props> = (props) => {
  const { todo } = props;
  const { deleteTodo, updateTodo } = useMutations();

  const [editorOpen, setEditorOpen] = React.useState(false);

  const { attributes, listeners, setNodeRef, node, transform } = useDraggable({
    id: todo.id,
    data: { type: DRAGGING_TYPES.Todo, data: todo },
  });

  useOnClickOutside(node, () => {
    if (editorOpen) {
      setEditorOpen(false);
    }
  });

  useEventListener("keydown", (e) => {
    if (e.key === "Escape" && editorOpen) {
      setEditorOpen(false);
    }
  });

  React.useEffect(() => {
    setEditorOpen(false);
  }, [todo]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ease-out hover:bg-muted/20",
        todo.isCompleted && "opacity-50",
        deleteTodo.isPending && "opacity-50",
      )}
      {...attributes}
      {...listeners}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
    >
      {editorOpen ? (
        <TodoEditor todo={todo} onSubmit={() => setEditorOpen(false)} />
      ) : (
        <>
          <Checkbox
            className="shrink-0 rounded-full"
            disabled={updateTodo.isPending}
            checked={todo.isCompleted}
            onCheckedChange={() =>
              updateTodo.mutate({
                id: todo.id,
                data: { isCompleted: !todo.isCompleted },
              })
            }
          />
          <button
            onClick={() => setEditorOpen(true)}
            className={cn(
              "flex-1 text-left",
              todo.isCompleted && "text-muted-foreground line-through",
            )}
          >
            {todo.text}
          </button>
          {todo.isShared && (
            <Tooltip>
              <TooltipTrigger>
                <Link2 className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="right">
                Created by {todo.user.name}
              </TooltipContent>
            </Tooltip>
          )}
          <DeleteButton
            handleDelete={() => deleteTodo.mutate({ id: todo.id })}
          />
        </>
      )}
    </div>
  );
};

export default TodoItem;

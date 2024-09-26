import React from "react";
import { cn } from "@/lib/utils";
import DeleteButton from "./ui/delete-button";
import { Check, Link2, Loader2, Save } from "lucide-react";
import useMutations from "@/hooks/use-mutations";
import type { TodoSelect } from "@/lib/types";
import TodoText from "./todo-text";
import {
  useEventListener,
  useMediaQuery,
  useOnClickOutside,
} from "usehooks-ts";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "./ui/checkbox";
import { MOBILE_MEDIA_QUERY } from "@/lib/constants";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { useDraggable } from "@dnd-kit/core";

const TodoEditor: React.FC<{
  todo: TodoSelect;
  onSubmit?: () => void;
}> = (props) => {
  const { todo, onSubmit } = props;

  const [todoText, setTodoText] = React.useState(todo.text);
  const { updateTodo } = useMutations();
  const formId = `edit-todo-${todo.id}`;

  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  return (
    <form
      className="flex w-full items-center gap-2"
      id={formId}
      onSubmit={async (e) => {
        e.preventDefault();
        await updateTodo.mutateAsync({
          id: todo.id,
          data: { text: todoText },
        });
        onSubmit?.();
      }}
    >
      <Input
        className="h-7"
        autoFocus
        placeholder="What needs to be done?"
        value={todoText}
        onChange={(e) => setTodoText(e.target.value)}
      />
      <input type="hidden" />
      <Button
        size={isMobile ? "icon" : "default"}
        className="h-7 shrink-0"
        type="submit"
        form={formId}
      >
        <Save className="size-4" />
        {!isMobile && <span className="ml-2">Save</span>}
      </Button>
    </form>
  );
};

const TodoItem: React.FC<{ todo: TodoSelect }> = (props) => {
  const { todo } = props;
  const { deleteTodo, updateTodo } = useMutations();

  const { setNodeRef, node, attributes, listeners, transform } = useDraggable({
    id: todo.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const [editorOpen, setEditorOpen] = React.useState(false);

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
        "flex h-10 items-center gap-2 rounded-md px-3 text-sm transition-colors ease-out hover:bg-muted/20",
        todo.isCompleted && "opacity-50",
        deleteTodo.isPending && "opacity-50",
      )}
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
          >
            {updateTodo.isPending ? (
              <Loader2 size="1rem" className="animate-spin" />
            ) : (
              <Check size="1rem" />
            )}
          </Checkbox>
          <button
            onClick={() => setEditorOpen(true)}
            className={cn(
              "flex-1 text-left",
              todo.isCompleted && "text-muted-foreground line-through",
            )}
          >
            <TodoText text={todo.text} />
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

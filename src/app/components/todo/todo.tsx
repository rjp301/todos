import React, { useEffect } from "react";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import UserBubble from "@/app/components/ui/user/user-bubble";
import {
  Badge,
  Button,
  Checkbox,
  Flex,
  Text,
  TextArea,
} from "@radix-ui/themes";
import { cn } from "@/app/lib/utils";
import { focusInputAtEnd, resizeTextArea } from "@/app/lib/utils";
import TextWithLinks from "../ui/text-with-links";
import TodoMenu from "./todo-menu";
import {
  Link,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { useAtom } from "jotai";
import { editingTodoIdAtom } from "./todos.store";
import { SaveIcon } from "lucide-react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { type TodoFragment } from "@/app/gql.gen";
import { useUser } from "@/app/providers/user-provider";

import useTodoMutations from "@/app/hooks/mutations/use-todo-mutations";

const TodoForm: React.FC<{
  initialValue: string;
  handleSubmit: (value: string) => void;
}> = ({ initialValue, handleSubmit }) => {
  const [value, setValue] = React.useState(initialValue);
  const ref = React.useRef<HTMLTextAreaElement>(null);

  useEventListener("resize", () => {
    resizeTextArea(ref.current);
  });

  React.useEffect(() => {
    resizeTextArea(ref.current);
    ref.current?.focus();
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(value);
      }}
      className="flex w-full items-start gap-2"
    >
      <TextArea
        ref={ref}
        size="2"
        value={value}
        autoFocus
        rows={1}
        className="min-h-min flex-1"
        onChange={(e) => {
          setValue(e.target.value);
          resizeTextArea(e.target);
        }}
        onFocus={(e) => {
          focusInputAtEnd(e.target);
          resizeTextArea(e.target);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(value);
          }
        }}
      />
      <Button
        variant="soft"
        type="submit"
        size="2"
        onClick={() => handleSubmit(value)}
      >
        <SaveIcon className="size-4" />
        Save
      </Button>
    </form>
  );
};

const TodoCheckbox: React.FC<{ todo: TodoFragment }> = ({ todo }) => {
  const {
    updateTodoMutation: [updateTodo],
  } = useTodoMutations();
  return (
    <Checkbox
      size="3"
      variant="soft"
      checked={todo.isCompleted}
      onCheckedChange={(value) => {
        const isCompleted = Boolean(value);
        updateTodo({
          variables: { todoId: todo.id, input: { isCompleted } },
          optimisticResponse: { updateTodo: { ...todo, isCompleted } },
          update: (cache) => {
            const listCacheId = cache.identify({
              __typename: "ListObjectType",
              id: todo.list.id,
            });
            cache.modify({
              id: listCacheId,
              fields: {
                todoCount: (existingCount) =>
                  isCompleted ? existingCount - 1 : existingCount + 1,
              },
            });
          },
        });
      }}
    />
  );
};

const TodoListBadge: React.FC<{ todo: TodoFragment }> = ({ todo }) => {
  const { listId } = useParams({ strict: false });

  if (todo.list.id === listId) return null;
  return (
    <Badge asChild>
      <Link to="/todos/$listId" params={{ listId: todo.list.id }}>
        {todo.list.name}
      </Link>
    </Badge>
  );
};

const TodoAuthorBubble: React.FC<{ todo: TodoFragment }> = ({ todo }) => {
  const user = useUser();

  if (user.id === todo.author.id) return null;
  return <UserBubble user={todo.author} avatarProps={{ size: "1" }} />;
};

const Todo: React.FC<{ todo: TodoFragment }> = ({ todo }) => {
  const {
    updateTodoMutation: [updateTodo],
  } = useTodoMutations();

  const navigate = useNavigate();

  const [editingTodoId, setEditingTodoId] = useAtom(editingTodoIdAtom);
  const isEditing = editingTodoId === todo.id;

  const ref = React.useRef<HTMLDivElement>(null);

  const { highlightedTodoId } = useSearch({ strict: false });
  const isHighlighted = highlightedTodoId === todo.id;

  useOnClickOutside(ref, () => {
    if (isEditing) setEditingTodoId(null);
    if (isHighlighted) navigate({ search: undefined });
  });

  useHotkey(
    "Escape",
    () => {
      if (isEditing) setEditingTodoId(null);
      if (isHighlighted) navigate({ search: undefined });
    },
    { conflictBehavior: "allow" },
  );

  useEffect(() => {
    if (isHighlighted)
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [isHighlighted]);

  return (
    <div
      ref={ref}
      className={cn(
        (isHighlighted || isEditing) && "bg-accent-3",
        "xs:hover:bg-accent-3",
        "rounded-3 -mx-3 flex min-h-11 items-center gap-2 px-3 py-1 transition-colors ease-in",
      )}
    >
      {isEditing ? (
        <TodoForm
          initialValue={todo.text}
          handleSubmit={(text) => {
            updateTodo({
              variables: { todoId: todo.id, input: { text } },
              optimisticResponse: { updateTodo: { ...todo, text } },
            });
            setEditingTodoId(null);
          }}
        />
      ) : (
        <>
          <TodoCheckbox todo={todo} />
          <Flex
            flexGrow="1"
            align="center"
            onClick={() => setEditingTodoId(todo.id)}
            className="min-w-0 wrap-break-word whitespace-normal"
          >
            <Text
              size="2"
              className={cn(
                todo.isCompleted && "line-through opacity-50",
                "leading-relaxed",
              )}
            >
              <TextWithLinks text={todo.text} />
            </Text>
          </Flex>
          <TodoListBadge todo={todo} />
          <TodoAuthorBubble todo={todo} />
          <TodoMenu todoId={todo.id} />
        </>
      )}
    </div>
  );
};

export default Todo;

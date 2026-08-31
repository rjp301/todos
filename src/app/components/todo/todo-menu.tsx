import { IconButton } from "@radix-ui/themes";
import React from "react";
import {
  CornerDownRightIcon,
  DeleteIcon,
  Edit2Icon,
  EllipsisIcon,
} from "lucide-react";
import { useParams } from "@tanstack/react-router";
import { useAtom } from "jotai";
import type { MenuItem } from "../ui/menu/menu.types";
import { editingTodoIdAtom } from "./todos.store";
import ResponsiveMenu from "../ui/menu/responsive-menu";
import { GetListsForChipsDocument, type ListFullFragment } from "@/app/gql.gen";
import { useSuspenseQuery } from "@apollo/client/react";
import useTodoMutations from "@/app/hooks/mutations/use-todo-mutations";

const TodoMenu: React.FC<{ todoId: string }> = ({ todoId }) => {
  const { listId } = useParams({ strict: false });

  const {
    deleteTodoMutation: [deleteTodo],
    updateTodoMutation: [updateTodo],
  } = useTodoMutations();

  const {
    data: { lists = [] },
  } = useSuspenseQuery(GetListsForChipsDocument);

  const [_, setEditingTodoId] = useAtom(editingTodoIdAtom);

  const handleMove = (targetListId: string) => {
    updateTodo({
      variables: { todoId, input: { listId: targetListId } },
      update: (cache, { data }, { variables }) => {
        if (!data?.updateTodo) return;

        const oldListCacheId = cache.identify({
          __typename: "ListObjectType",
          id: listId,
        });
        cache.modify<ListFullFragment>({
          id: oldListCacheId,
          fields: {
            todoCount: (count) => count - 1,
            todos: (existingTodoRefs, { readField }) => {
              return existingTodoRefs.filter(
                (ref) => readField("id", ref) !== todoId,
              );
            },
          },
        });
        const newListCacheId = cache.identify({
          __typename: "ListObjectType",
          id: variables?.input.listId,
        });
        cache.modify<ListFullFragment>({
          id: newListCacheId,
          fields: {
            todoCount: (count) => count + 1,
          },
        });
        cache.evict({
          id: newListCacheId,
          fieldName: "todos",
        });
      },
    });
  };

  const handleDelete = () => {
    deleteTodo({ variables: { todoId } });
  };

  const handleEdit = () => {
    setEditingTodoId(todoId);
  };

  const moveMenuItems: MenuItem[] = lists.map((list): MenuItem => ({
    type: "item",
    key: `move-${list.id}`,
    text: list.name,
    onClick: () => handleMove(list.id),
    hide: list.id === listId,
    disabled: list.isPending,
  }));

  const menuItems: MenuItem[] = [
    {
      type: "item",
      key: "edit",
      text: "Edit",
      icon: <Edit2Icon className="size-4 opacity-70" />,
      onClick: handleEdit,
    },
    {
      type: "parent",
      key: "move",
      text: "Move",
      icon: <CornerDownRightIcon className="size-4 opacity-70" />,
      children: moveMenuItems,
    },
    {
      type: "separator",
    },
    {
      type: "item",
      key: "delete",
      text: "Delete",
      icon: <DeleteIcon className="size-4 opacity-70" />,
      color: "red",
      onClick: handleDelete,
    },
  ];

  return (
    <ResponsiveMenu
      menuItems={menuItems}
      dropdownProps={{ className: "min-w-48", align: "end" }}
    >
      <IconButton size="2" variant="ghost" className="m-0">
        <EllipsisIcon className="size-4" />
      </IconButton>
    </ResponsiveMenu>
  );
};

export default TodoMenu;

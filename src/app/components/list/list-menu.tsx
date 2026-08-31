import React from "react";
import { zListName } from "@/lib/types";
import {
  Edit2Icon,
  ExternalLinkIcon,
  Link2Icon,
  ListXIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  SquareMinusIcon,
  TrashIcon,
} from "lucide-react";
import ResponsiveMenu from "../ui/menu/responsive-menu";
import { useAtom } from "jotai";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { alertSystemAtom } from "../alert-system/alert-system.store";
import type { MenuItem } from "../ui/menu/menu.types";
import { IconButton } from "@radix-ui/themes";
import { getListUrl } from "@/lib/constants";
import {
  DeleteListDocument,
  UpdateListDocument,
  type ShallowListFragment,
} from "@/app/gql.gen";
import { useParams, useRouter } from "@tanstack/react-router";
import useManageListUsers from "@/app/hooks/actions/use-manage-list-users";
import useNumCompletedTodos from "@/app/hooks/actions/use-num-completed-todos";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { readListFromCache } from "@/app/graphql/utils";
import useTodoMutations from "@/app/hooks/mutations/use-todo-mutations";

type Props = {
  list: ShallowListFragment;
};

const ListMenu: React.FC<Props> = ({ list }) => {
  const {
    deleteCompletedTodosMutation: [deleteCompletedTodos],
    uncheckCompletedTodosMutation: [uncheckCompletedTodos],
  } = useTodoMutations();

  const { listId: currentList } = useParams({ strict: false });
  const router = useRouter();
  const { cache } = useApolloClient();

  const [updateList] = useMutation(UpdateListDocument);

  const [deleteList] = useMutation(DeleteListDocument, {
    onCompleted: () => {
      router.invalidate();
      toast.success("List deleted successfully");
      if (currentList === list.id) router.navigate({ to: "/" });
    },
    update: (cache) => {
      const listCacheId = cache.identify(list);
      cache.evict({ id: listCacheId });
      cache.gc();
    },
  });

  const [, dispatchAlert] = useAtom(alertSystemAtom);
  const [, copyToClipboard] = useCopyToClipboard();

  const isOnlyUser = list.users.length === 1;
  const numCompleted = useNumCompletedTodos(list.id);

  const { handleLeaveList } = useManageListUsers(list.id);

  const handleRenameList = () => {
    dispatchAlert({
      type: "open",
      data: {
        type: "input",
        title: "Rename List",
        message: "Update the name of your list",
        value: list.name,
        placeholder: "Enter new list name",
        schema: zListName,
        handleSubmit: (name: string) => {
          updateList({
            variables: { listId: list.id, input: { name } },
            optimisticResponse: (_variables, { IGNORE }) => {
              const existingList = readListFromCache(cache, list.id);
              if (!existingList) return IGNORE;
              return {
                __typename: "Mutation",
                updateList: { ...existingList, name },
              };
            },
          });
          dispatchAlert({ type: "close" });
          toast.success("List renamed successfully");
        },
      },
    });
  };

  const handleDeleteList = () => {
    dispatchAlert({
      type: "open",
      data: {
        type: "delete",
        title: "Delete List",
        message: `Are you sure you want to delete this list? This action cannot be undone.`,
        handleDelete: () => {
          deleteList({ variables: { listId: list.id } });
          dispatchAlert({ type: "close" });
        },
      },
    });
  };

  const handleCopyLink = () => {
    const link = getListUrl(list.id);
    copyToClipboard(link);
    toast.success("Link copied to clipboard", { description: link });
  };

  const handleOpenInNewTab = () => {
    const link = getListUrl(list.id);
    window.open(link, "_blank");
  };

  const menuItems: MenuItem[] = [
    {
      type: "item",
      key: "rename",
      text: "Rename",
      icon: <Edit2Icon className="size-4 opacity-70" />,
      onClick: handleRenameList,
    },
    {
      type: "separator",
    },
    {
      type: "item",
      key: "copy-link",
      text: "Copy Link",
      icon: <Link2Icon className="size-4 opacity-70" />,
      onClick: handleCopyLink,
    },
    {
      type: "item",
      key: "open-in-new-tab",
      text: "Open in New Tab",
      icon: <ExternalLinkIcon className="size-4 opacity-70" />,
      onClick: handleOpenInNewTab,
    },
    {
      type: "separator",
    },
    {
      type: "item",
      key: "uncheck-all",
      text: "Uncheck all",
      icon: <SquareMinusIcon className="size-4 opacity-70" />,
      onClick: () =>
        uncheckCompletedTodos({
          variables: { listId: list.id },
          onCompleted: () => {
            toast.success(`Unchecked ${numCompleted} completed todos`);
          },
        }),
      disabled: numCompleted <= 0,
    },
    {
      type: "item",
      key: "delete-completed",
      text: "Delete completed",
      icon: <ListXIcon className="size-4 opacity-70" />,
      onClick: () =>
        deleteCompletedTodos({
          variables: { listId: list.id },
          onCompleted: () => {
            toast.success(`Deleted ${numCompleted} completed todos`);
          },
        }),
      disabled: numCompleted <= 0,
    },
    {
      type: "separator",
    },
    {
      type: "item",
      key: "leave-list",
      text: "Leave",
      icon: <LogOutIcon className="size-4 opacity-70" />,
      color: "amber",
      onClick: handleLeaveList,
      hide: isOnlyUser,
    },
    {
      type: "item",
      key: "delete-list",
      text: "Delete",
      icon: <TrashIcon className="size-4 opacity-70" />,
      color: "red",
      onClick: handleDeleteList,
    },
  ];

  return (
    <ResponsiveMenu
      menuItems={menuItems}
      dropdownProps={{ align: "start", side: "bottom" }}
    >
      <IconButton variant="ghost">
        <MoreHorizontalIcon className="size-4" />
      </IconButton>
    </ResponsiveMenu>
  );
};

export default ListMenu;

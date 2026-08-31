import {
  CreateListDocument,
  DeleteListDocument,
  GetListsForChipsDocument,
  UpdateListDocument,
} from "@/app/gql.gen";
import { readListFromCache } from "@/app/graphql/utils";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { useParams, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

export default function useListMutations() {
  const client = useApolloClient();
  const router = useRouter();
  const currentList = useParams({ strict: false, select: (s) => s.listId });

  const createListMutation = useMutation(CreateListDocument, {
    refetchQueries: [GetListsForChipsDocument],
    onCompleted: ({ createList }) => {
      if (!createList) return;
      router.invalidate();
      router.navigate({
        to: "/todos/$listId",
        params: { listId: createList.id },
      });
    },
  });

  const updateListMutation = useMutation(UpdateListDocument, {
    optimisticResponse: ({ listId, input }, { IGNORE }) => {
      const list = readListFromCache(client.cache, listId);
      if (!list) return IGNORE;
      return { updateList: { ...list, ...input } };
    },
  });

  const deleteListMutation = useMutation(DeleteListDocument, {
    onCompleted: (_data, { variables: { listId } = {} } = {}) => {
      router.invalidate();
      toast.success("List deleted successfully");
      if (currentList === listId) router.navigate({ to: "/" });
    },
    update: (cache, _data, { variables: { listId } = {} }) => {
      const listCacheId = cache.identify({
        __typename: "ListObjectType",
        id: listId,
      });
      cache.evict({ id: listCacheId });
      cache.gc();
    },
  });

  return {
    createListMutation,
    updateListMutation,
    deleteListMutation,
  };
}

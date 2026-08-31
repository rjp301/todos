import { alertSystemAtom } from "@/app/components/alert-system/alert-system.store";
import { zListName } from "@/lib/types";
import { useAtom } from "jotai";
import useListMutations from "../mutations/use-list-mutations";

export default function useCreateList() {
  const [, dispatchAlert] = useAtom(alertSystemAtom);

  const {
    createListMutation: [createList],
  } = useListMutations();

  const handleCreateList = () => {
    dispatchAlert({
      type: "open",
      data: {
        type: "input",
        title: "Create New List",
        message: "Enter a name for your new list",
        value: "",
        placeholder: "List name",
        schema: zListName,
        handleSubmit: async (name: string) => {
          createList({ variables: { input: { name } } });
          dispatchAlert({ type: "close" });
        },
      },
    });
  };

  return handleCreateList;
}

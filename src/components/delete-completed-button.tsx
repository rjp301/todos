import React from "react";
import { Button } from "./ui/button";
import useMutations from "../hooks/use-mutations";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { todosQueryOptions } from "../lib/queries";
import useSelectedTag from "../hooks/use-selected-tag";

type Props = {};

const DeleteCompletedButton: React.FC<Props> = (props) => {
  const {} = props;

  const { tag } = useSelectedTag();
  const todosQuery = useQuery(todosQueryOptions(tag));
  const { deleteCompleted } = useMutations();

  const isHidden =
    !todosQuery.data ||
    todosQuery.data.filter((i) => i.isCompleted).length === 0;

  if (isHidden) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background">
      <div className="container2 flex h-28 items-center">
        <Button
          className="w-full shadow-lg"
          variant="secondary"
          size="sm"
          onClick={() => deleteCompleted.mutate({})}
          disabled={deleteCompleted.isPending}
        >
          <span>
            <X className="mr-2 size-4" />
          </span>
          <span>Delete completed</span>
        </Button>
      </div>
    </div>
  );
};

export default DeleteCompletedButton;

import useNumCompletedTodos from "@/app/hooks/actions/use-num-completed-todos";
import useTodoMutations from "@/app/hooks/mutations/use-todo-mutations";
import { Button } from "@radix-ui/themes";
import { SquareMinusIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

type Props = { listId: string };

const UncheckAllTodosButton: React.FC<Props> = ({ listId }) => {
  const numCompleted = useNumCompletedTodos(listId);
  const {
    uncheckCompletedTodosMutation: [uncheckCompletedTodos],
  } = useTodoMutations();

  return (
    <Button
      size="1"
      variant="ghost"
      color="gray"
      onClick={() =>
        uncheckCompletedTodos({
          variables: { listId },
          onCompleted: () => {
            toast.success(`Unchecked ${numCompleted} completed todos`);
          },
        })
      }
      disabled={numCompleted === 0}
    >
      <SquareMinusIcon className="size-3" />
      Uncheck
    </Button>
  );
};

export default UncheckAllTodosButton;

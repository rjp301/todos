import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import DeleteButton from "./ui/delete-button";
import { cn } from "../lib/utils";

export type SampleTodo = {
  id: string;
  text: string;
  isCompleted: boolean;
};

export const TodoItemSample: React.FC<{ todo: SampleTodo }> = ({ todo }) => (
  <Card
    className={cn(
      "flex items-center gap-2 rounded-md p-2 text-sm",
      todo.isCompleted && "bg-card/50",
    )}
  >
    <Button
      variant={todo.isCompleted ? "secondary" : "ghost"}
      className="rounded-full"
      size="icon"
    >
      <Check size="1rem" />
    </Button>
    <span
      className={cn(
        "flex-1",
        todo.isCompleted && "text-muted-foreground line-through",
      )}
    >
      {todo.text}
    </span>
    <DeleteButton handleDelete={() => {}} />
  </Card>
);

import React from "react";
import Adder from "@/components/adder";
import HashtagList from "@/components/hashtag-list";
import TodoList from "@/components/todo-list";

const Root: React.FC = () => {
  return (
    <div className="flex w-full flex-col gap-4">
      <Adder />
      <HashtagList />
      <TodoList />
    </div>
  );
};

export default Root;
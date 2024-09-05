import { Link, useSearch } from "@tanstack/react-router";
import React from "react";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

type Props = {
  hashtag: string;
};

const Hashtag: React.FC<Props> = (props) => {
  const { hashtag } = props;

  const { tag } = useSearch({ from: "/_app/" });
  const isActive = tag === hashtag;

  return (
    <Link
      to="/"
      search={(prev) => ({
        ...prev,
        tag: prev.tag === hashtag ? undefined : hashtag,
      })}
      title={hashtag === "~" ? "No tag" : `Tag: ${hashtag}`}
    >
      <Badge
        variant="secondary"
        className={cn(isActive && "outline outline-2 outline-primary")}
      >
        {hashtag}
      </Badge>
    </Link>
  );
};

export default Hashtag;

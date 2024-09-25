import React from "react";
import { Card } from "./ui/card";
import { hashtagQueryOptions } from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import useSelectedTag from "@/hooks/use-selected-tag";

const HashtagCard: React.FC = () => {
  const hashtagQuery = useQuery(hashtagQueryOptions);
  const { tag } = useSelectedTag();
  const hashtags = hashtagQuery.data ?? [];

  return (
    <Card className="grid w-full min-w-[200px] gap-3 py-4">
      <span className="px-4 text-xs font-bold uppercase text-secondary-foreground/50">
        Hashtags
      </span>
      <div className="grid text-sm">
        {hashtags.map((hashtag, idx) => {
          const isActive = tag === hashtag.tag;
          return (
            <Link
              key={hashtag.tag}
              to={`/?tag=${hashtag.tag}`}
              className={cn(
                "border-l-4 border-transparent px-4 h-9 flex items-center",
                "hover:border-border hover:bg-muted/20",
                isActive && "border-primary bg-muted/40 hover:border-primary font-semibold",
              )}
            >
              {hashtag.tag}
            </Link>
          );
        })}
      </div>
    </Card>
  );
};

export default HashtagCard;

import React from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { useLongPress } from "react-use";
import { Badge } from "./ui/badge";
import type { UserSelect } from "@/lib/types";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link2 } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { DRAG_TYPES } from "@/lib/constants";

type ListProps = React.PropsWithChildren<{
  link: string;
  linkLongPress?: string;
  isShared?: boolean;
  isAdmin?: boolean;
  listAdmin?: UserSelect | null;
  listId: string | null | undefined;
}>;

const ListPill: React.FC<ListProps> = (props) => {
  const { children, link, linkLongPress, isShared, listAdmin, listId } = props;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isActive = pathname === link;

  const longPress = useLongPress(
    () => {
      if (linkLongPress) {
        navigate(linkLongPress);
      }
    },
    { isPreventDefault: true },
  );

  const { setNodeRef, isOver } = useDroppable({
    id: link,
    data: { type: DRAG_TYPES.List, listId },
    disabled: listId === undefined,
  });

  return (
    <NavLink ref={setNodeRef} to={link} {...longPress}>
      <Badge
        variant={isActive ? "default" : "secondary"}
        className={cn("h-6", isOver && "outline")}
      >
        {children}
        {isShared && (
          <Tooltip>
            <TooltipTrigger>
              <Link2 className="ml-2 size-4" />
            </TooltipTrigger>
            {listAdmin && (
              <TooltipContent>Shared by {listAdmin.name}</TooltipContent>
            )}
          </Tooltip>
        )}
      </Badge>
    </NavLink>
  );
};

export default ListPill;

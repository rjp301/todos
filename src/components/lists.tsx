import { useQuery } from "@tanstack/react-query";
import React from "react";
import { listsQueryOptions } from "../lib/queries";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLongPress } from "react-use";

const List: React.FC<
  React.PropsWithChildren<{ link: string; noEdit?: boolean }>
> = ({ children, link, noEdit }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = pathname === link;

  const longPress = useLongPress(
    () => {
      if (noEdit) return;
      navigate(`${link}/edit`);
    },
    { isPreventDefault: true },
  );

  return (
    <NavLink to={link} {...longPress}>
      <Badge variant={isActive ? "default" : "secondary"} className="h-6">
        {children}
      </Badge>
    </NavLink>
  );
};

const Lists: React.FC = () => {
  const listsQuery = useQuery(listsQueryOptions);
  const lists = listsQuery.data ?? [];

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3">
      <List link="/" noEdit>
        Inbox
      </List>
      <List link="/all" noEdit>
        All
      </List>
      <Separator orientation="vertical" />
      {lists.map((list) => (
        <List key={list.id} link={`/list/${list.id}`}>
          {list.name}
        </List>
      ))}
      <List link="/list/add" noEdit>
        <i className="fa-solid fa-plus" />
      </List>
    </div>
  );
};

export default Lists;

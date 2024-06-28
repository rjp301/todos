import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { api } from "../lib/client";
import { CircleCheckBig } from "lucide-react";
import UserAvatar from "../components/user-avatar";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ location }) => {
    const me = await api.auth.me.$get();
    if (!me.ok) {
      throw redirect({
        to: "/welcome",
        search: { redirect: location.href },
      });
    }
  },
  component: () => (
    <>
      <header className="sticky top-0 z-50 h-16 border-b bg-background">
        <div className="container2 flex h-full items-center justify-between">
          <Link to="/">
            <div className="flex items-center gap-2">
              <CircleCheckBig size="1.5rem" className="text-primary" />
              <div className="text-2xl font-bold">Todos</div>
            </div>
          </Link>
          <UserAvatar />
        </div>
      </header>
      <slot />
      <Outlet />
    </>
  ),
});

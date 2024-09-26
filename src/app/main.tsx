import React from "react";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "sonner";
import ErrorPage from "@/components/error-page";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Root from "./root";
import { TooltipProvider } from "@/components/ui/tooltip";
import SharedTags from "./shared-tags";
import Header from "@/components/header";
import useQueryStream from "@/hooks/use-query-stream";
import EditList from "./edit-list";
import AddList from "./add-list";
import { DndContext } from "@dnd-kit/core";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
  mutationCache: new MutationCache({
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  }),
});

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Header />
        <main className="container2">
          <div className="pb-28 pt-6">
            <Outlet />
          </div>
        </main>
      </>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Root />,
      },
      {
        path: "all",
        element: <Root />,
      },
      {
        path: "list/:listId",
        element: <Root />,
      },
      {
        path: "list/:listId/edit",
        element: <EditList />,
      },
      {
        path: "list/add",
        element: <AddList />,
      },
      {
        path: "shared",
        element: <SharedTags />,
      },
    ],
  },
]);

const App: React.FC = () => {
  useQueryStream(queryClient);
  return (
    <DndContext>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RouterProvider router={router} />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </DndContext>
  );
};

export default App;

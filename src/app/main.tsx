import React from "react";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "sonner";
import ErrorPage from "@/app/error-page";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Root from "./root";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import useQueryStream from "@/hooks/use-query-stream";
import ListEdit from "./list-edit-page";
import ListCreate from "./list-create-page";
import DragAndDropWrapper from "@/components/drag-and-drop-wrapper";

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
      <DragAndDropWrapper>
        <Header />
        <main className="container2">
          <div className="pb-28 pt-6">
            <Outlet />
          </div>
        </main>
      </DragAndDropWrapper>
    ),
    errorElement: <ErrorPage showGoHome />,
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
        element: <ListEdit />,
      },
      {
        path: "list/new",
        element: <ListCreate />,
      },
    ],
  },
]);

const App: React.FC = () => {
  useQueryStream(queryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

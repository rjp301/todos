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
import HashtagCard from "@/components/hashtag-card";

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
          <div className="flex gap-4 pb-28 pt-6">
            <div className="sticky top-0">
              <HashtagCard />
            </div>
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
        path: "shared",
        element: <SharedTags />,
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

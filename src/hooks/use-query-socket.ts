import { type QueryClient } from "@tanstack/react-query";
import React from "react";

export default function useQuerySocket(queryClient: QueryClient) {
  React.useEffect(() => {
    const socketUrl = import.meta.env.SITE.replace("http", "ws")
      .replace("https", "wss")
      .concat("/socket");
    console.log(socketUrl);

    const websocket = new WebSocket(socketUrl);
    websocket.onopen = () => {
      console.log("connected");
    };

    websocket.onmessage = (event) => {
      console.log("message", event.data);
      const data = JSON.parse(event.data);
      const queryKey = [...data].filter(Boolean);
      queryClient.invalidateQueries({ queryKey });
    };

    return () => {
      websocket.close();
    };
  }, []);
}

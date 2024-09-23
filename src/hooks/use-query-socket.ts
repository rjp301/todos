import React from "react";

export default function useQuerySocket() {
  React.useEffect(() => {
    const websocket = new WebSocket("wss://echo.websocket.org/");
    websocket.onopen = () => {
      console.log("connected");
    };

    return () => {
      websocket.close();
    };
  }, []);
}

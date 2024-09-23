import { WebSocket } from "ws"

export const wss = new WebSocket.Server({ noServer: true })
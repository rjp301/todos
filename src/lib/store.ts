import { atom } from "jotai";
import type { TodoSelect } from "./types";

export const draggingTodoAtom = atom<TodoSelect | null>(null);

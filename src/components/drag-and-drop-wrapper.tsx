import {
  useSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensors,
  DndContext,
  DragOverlay,
  type DragStartEvent,
  closestCenter,
  pointerWithin,
  type CollisionDetection,
  type DragEndEvent,
} from "@dnd-kit/core";
import React from "react";
import { useAtom } from "jotai";
import { draggingTodoAtom } from "@/lib/store";
import { DRAG_TYPES } from "@/lib/constants";
import useMutations from "@/hooks/use-mutations";

const customCollisionDetectionAlgorithm: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return closestCenter(args);
};

const DragAndDropWrapper: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const keyboardSensor = useSensor(KeyboardSensor);

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const [draggingTodo, setDraggingTodo] = useAtom(draggingTodoAtom);

  const { updateTodo } = useMutations();

  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current;
    if (!activeData) return;

    if (activeData.type === DRAG_TYPES.Todo) {
      setDraggingTodo(activeData.data);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const overData = event.over?.data.current;
    const activeData = event.active.data.current;

    if (!activeData || !overData) return;

    if (
      activeData.type === DRAG_TYPES.Todo &&
      overData.type === DRAG_TYPES.List
    ) {
      console.log("activeData", activeData);
      console.log("overData", overData);

      updateTodo.mutate({
        id: activeData.data.id,
        data: { listId: overData.listId },
      });

      setDraggingTodo(null);
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sensors={sensors}
      collisionDetection={customCollisionDetectionAlgorithm}
    >
      {children}

      <DragOverlay dropAnimation={null}>
        {draggingTodo ? (
          <div className="w-32 truncate rounded border bg-card px-3 py-1 text-xs">
            {draggingTodo.text}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DragAndDropWrapper;

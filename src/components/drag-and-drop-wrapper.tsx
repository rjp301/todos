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
} from "@dnd-kit/core";
import React from "react";
import { useAtom } from "jotai";
import { draggingTodoAtom } from "@/lib/store";
import { DRAG_TYPES } from "@/lib/constants";

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

  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current;
    if (!activeData) return;

    if (activeData.type === DRAG_TYPES.Todo) {
      setDraggingTodo(activeData.data);
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
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

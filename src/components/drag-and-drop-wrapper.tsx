import {
  useSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensors,
  DndContext,
} from "@dnd-kit/core";
import React from "react";

const DragAndDropWrapper: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const keyboardSensor = useSensor(KeyboardSensor);

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  return <DndContext sensors={sensors}>{children}</DndContext>;
};

export default DragAndDropWrapper;

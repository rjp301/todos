import { useDraggable } from "@dnd-kit/core";
import React from "react";

type Props = React.PropsWithChildren<{
  id: string;
}>;

const Draggable = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, id } = props;

  const { setNodeRef, attributes, listeners, transform } = useDraggable({
    id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      {children}
    </div>
  );
});

export default Draggable;

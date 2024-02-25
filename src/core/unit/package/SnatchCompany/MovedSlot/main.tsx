import { useEffect, useRef } from "react";
import { generateMain } from "../../../../../lib/mirage-x/unit/main";
import { unitConfig } from "./detail";

const MovedSlot = generateMain(unitConfig);

export const o = (props: {
  position: [number, number, number];
  move: [number, number, number];
  moveTime: number;
  children: React.ReactNode;
}) => {
  const moveFuncRef = useRef(() => {});

  useEffect(() => {
    moveFuncRef.current();
  }, [props.moveTime, `${props.move}`, `${props.position}`]);

  return (
    <MovedSlot {...props} dynamicImpulseTriggerRefs={{ move: moveFuncRef }}>
      {props.children}
    </MovedSlot>
  );
};

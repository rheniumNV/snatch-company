import { useEffect, useState } from "react";
import {
  Canvas,
  HorizontalLayout,
  LayoutElement,
  VerticalLayout,
} from "../../../unit/package/PrimitiveUix/main";
import { StyledImage } from "../../../unit/package/StyledUix/main";
import { Material } from "../style";
import { HealthUi } from "../../../unit/package/SnatchCompany/main";
import { Slot } from "../../../unit/package/Primitive/main";
import { Box } from "../../../unit/package/ProceduralMesh/main";
import { Vector } from "../../game/util";

export const HealthView = (props: {
  health: number;
  maxHealth: number;
  position: [number, number, number];
  scale?: [number, number, number];
  color?: [number, number, number, number];
  smoothView?: boolean;
  smoothViewColor?: [number, number, number, number];
  smoothViewTime?: number;
}) => {
  const [prevHealth, setPrevHealth] = useState(props.health);

  useEffect(() => {
    if (props.smoothView && prevHealth !== props.health) {
      const interval = setInterval(() => {
        setPrevHealth((prev) => {
          if (prev === props.health) {
            clearInterval(interval);
            return prev;
          }
          return prev + (props.health - prev) / 10;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [props.health, props.smoothView, props.smoothViewTime]);

  // return (
  //   <Slot position={props.position} scale={props.scale}>
  //     <HealthUi health={props.health} maxHealth={props.maxHealth} />
  //   </Slot>
  // );

  return (
    <>
      <Slot position={props.position} scale={props.scale}>
        <HealthUi health={props.health} maxHealth={props.maxHealth} />
      </Slot>
      {/* <Canvas position={props.position} size={[1000, 60]} scale={props.scale}>
        <StyledImage styledMaterial={Material.background} />
        <VerticalLayout
          paddingTop={10}
          paddingBottom={10}
          paddingLeft={10}
          paddingRight={10}
        >
          <LayoutElement>
            <StyledImage defaultColor={[0.3, 0.3, 0.3, 1]} />
            <HorizontalLayout
              horizontalAlign="Left"
              forceExpandChildWidth={false}
            >
              <LayoutElement minWidth={(props.health / props.maxHealth) * 980}>
                <StyledImage defaultColor={props.color ?? [0, 1, 0, 1]} />
              </LayoutElement>
              {props.smoothView && (
                <LayoutElement
                  minWidth={
                    ((prevHealth - props.health) / props.maxHealth) * 980
                  }
                >
                  <StyledImage
                    defaultColor={props.smoothViewColor ?? [0, 1, 0, 0.3]}
                  />
                </LayoutElement>
              )}
            </HorizontalLayout>
          </LayoutElement>
        </VerticalLayout>
      </Canvas> */}
    </>
  );
};

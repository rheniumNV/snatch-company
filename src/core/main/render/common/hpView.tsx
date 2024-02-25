import {
  Canvas,
  LayoutElement,
  VerticalLayout,
} from "../../../unit/package/PrimitiveUix/main";
import { StyledImage } from "../../../unit/package/StyledUix/main";
import { Material } from "../style";

export const HealthView = (props: {
  health: number;
  maxHealth: number;
  position: [number, number, number];
  scale?: [number, number, number];
  color?: [number, number, number, number];
}) => {
  return (
    <Canvas position={props.position} size={[1000, 60]} scale={props.scale}>
      <StyledImage styledMaterial={Material.background} />
      <VerticalLayout
        paddingTop={10}
        paddingBottom={10}
        paddingLeft={10}
        paddingRight={10}
      >
        <LayoutElement>
          <StyledImage defaultColor={[0.3, 0.3, 0.3, 1]} />

          <VerticalLayout horizontalAlign="Left" forceExpandChildWidth={false}>
            <LayoutElement minWidth={(props.health / props.maxHealth) * 980}>
              <StyledImage defaultColor={props.color ?? [0, 1, 0, 1]} />
            </LayoutElement>
          </VerticalLayout>
        </LayoutElement>
      </VerticalLayout>
    </Canvas>
  );
};

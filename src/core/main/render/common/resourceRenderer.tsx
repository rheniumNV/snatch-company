import { useCallback } from "react";
import { Resource, Rock, Tree } from "../../../unit/package/SnatchCompany/main";
import { HealthView } from "./hpView";
import { FunctionEnv } from "../../../../lib/mirage-x/common/interactionEvent";
import { Slot } from "../../../unit/package/Primitive/main";
import { Vector } from "../../game/util";
import { BattleSection } from "../../game/type";

export const ResourceRenderer = (props: {
  object: BattleSection["objects"][number];
  shipPosition: [number, number, number];
  attack2Object: (
    playerId: string,
    objectId: string,
    hitPoint: Vector.Vector3
  ) => void;
  children?: React.ReactElement | React.ReactElement[];
}) => {
  const onHit = useCallback(
    (env: FunctionEnv, hitPoint: [number, number, number]) => {
      props.attack2Object(env.userId, props.object.id, hitPoint);
    },
    [props.attack2Object, props.object.id]
  );
  if (Vector.distance(props.object.position, props.shipPosition) > 100) {
    return <></>;
  }
  return (
    <Resource
      position={props.object.position}
      rotation={props.object.rotation}
      onHit={onHit}
    >
      {props.object.type === "mineral" ? (
        <Slot scale={[4, 4, 4]}>
          <Rock
            rock1Active={props.object.health / props.object.maxHealth > 0.7}
            rock3Active={props.object.health / props.object.maxHealth > 0.3}
          />
        </Slot>
      ) : (
        <Slot scale={[2, 2, 2]}>
          <Tree
            branch1Active={props.object.health / props.object.maxHealth > 0.7}
            branch2Active={props.object.health / props.object.maxHealth > 0.3}
          />
        </Slot>
      )}
      {props.object.health < props.object.maxHealth && (
        <HealthView
          position={props.object.type === "mineral" ? [0, 4, 0] : [0, 7, 0]}
          scale={[3, 3, 3]}
          health={props.object.health}
          maxHealth={props.object.maxHealth}
        />
      )}
    </Resource>
  );
};

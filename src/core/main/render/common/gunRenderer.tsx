import { useEffect, useRef } from "react";
import { Gun } from "../../../unit/package/SnatchCompany/main";
import { SnatchCompany } from "../../game";
import { GameStateInGame, Section } from "../../game/type";

export const GunRenderer = (props: {
  player: GameStateInGame<Section>["players"][number];
  setCallback: (callbacks: SnatchCompany["callbacks"]) => void;
  clearCallback: (callback: Function) => void;
}) => {
  const equipRef = useRef(() => {});
  const levelupRef = useRef(() => {});

  useEffect(() => {
    const levelUpCallback: Exclude<
      SnatchCompany["callbacks"]["levelup"],
      undefined
    >[number] = (arg) => {
      levelupRef.current();
    };
    props.setCallback({
      levelup: [levelUpCallback],
    });

    const startGameCallback: Exclude<
      SnatchCompany["callbacks"]["onStartGame"],
      undefined
    >[number] = () => {
      equipRef.current();
    };
    props.setCallback({
      onStartGame: [startGameCallback],
    });

    return () => {
      props.clearCallback(levelUpCallback);
      props.clearCallback(startGameCallback);
    };
  }, [props.player.id, props.setCallback, props.clearCallback]);

  return (
    <Gun
      userId={props.player.id}
      attackSpeed={props.player.finalStatus.attackSpeed}
      maxEnergy={props.player.finalStatus.maxEnergy}
      chargeEnergy={props.player.finalStatus.chargeEnergy}
      dynamicImpulseTriggerRefs={{ equip: equipRef, levelup: levelupRef }}
    />
  );
};

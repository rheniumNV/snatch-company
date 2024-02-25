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
    const timeout = setTimeout(() => {
      equipRef.current();
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const callback: Exclude<
      SnatchCompany["callbacks"]["levelup"],
      undefined
    >[number] = (arg) => {
      console.log("levelup", arg);
      levelupRef.current();
    };
    props.setCallback({
      levelup: [callback],
    });
    return () => {
      props.clearCallback(callback);
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

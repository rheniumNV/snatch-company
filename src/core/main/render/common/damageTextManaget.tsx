import { useEffect, useRef, useState } from "react";
import { SnatchCompany } from "../../game";
import { DamageEffect } from "../../../unit/package/SnatchCompany/main";
import { Slot } from "../../../unit/package/Primitive/main";

type DamageTextOption = Parameters<
  Exclude<SnatchCompany["callbacks"]["onAttack2Object"], undefined>[number]
>[0];

type DamageText = {
  option: DamageTextOption;
  duration: number;
};

export const DamageTextManager = (props: {
  setCallback: SnatchCompany["setCallback"];
  clearCallback: SnatchCompany["clearCallback"];
}) => {
  const [damageTexts, setDamageTexts] = useState<DamageText[]>([]);
  const prevTimeRef = useRef(performance.now());

  useEffect(() => {
    const callback: Exclude<
      SnatchCompany["callbacks"]["onAttack2Object"],
      undefined
    >[number] = (option) => {
      setDamageTexts((prev) => [...prev, { option, duration: 10 }]);
    };
    props.setCallback({
      onAttack2Object: [callback],
    });
    return () => {
      props.clearCallback(callback);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const deltaTime = (performance.now() - prevTimeRef.current) / 1000;
      prevTimeRef.current = performance.now();
      setDamageTexts((prev) =>
        prev
          .map((text) => ({
            ...text,
            duration: text.duration - deltaTime,
          }))
          .filter((text) => text.duration > 0)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Slot>
      {damageTexts.map((text, index) => (
        <DamageEffect
          key={index}
          damage={Math.floor(text.option.damage + text.option.extraDamage)}
          extraDamage={text.option.extraDamage}
          criticalCount={text.option.criticalCount}
          position={text.option.hitPoint}
        />
      ))}
    </Slot>
  );
};

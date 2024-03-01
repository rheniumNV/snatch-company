import {
  UnitDynamicImpulseTrigger,
  UnitProp,
  generateUnitConfig,
  getMainProps,
  getMirrorProps,
  getWebProps,
} from "../../../../../lib/mirage-x/unit/common";

const detail = {
  code: "SnatchCompany/LocalScore",
  propsConfig: {
    killCountTotal: UnitProp.String("0"),
    killCount2Minerals: UnitProp.String("0"),
    killCount2Plants: UnitProp.String("0"),
    killCount2Events: UnitProp.String("0"),
    damageTotal: UnitProp.String("0"),
    damage2Minerals: UnitProp.String("0"),
    damage2Plants: UnitProp.String("0"),
    damage2Events: UnitProp.String("0"),
    attackCountTotal: UnitProp.String("0"),
    criticalCountTotal: UnitProp.String("0"),
  },
  dynamicImpulseTriggers: {},
  children: "multi" as const,
};

export type MainProps = getMainProps<typeof detail>;
export type MirrorProps = getMirrorProps<typeof detail>;
export type WebProps = getWebProps<typeof detail>;
export const unitConfig = generateUnitConfig(detail);

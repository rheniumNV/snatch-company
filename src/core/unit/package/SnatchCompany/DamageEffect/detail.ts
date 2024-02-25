import {
  UnitProp,
  generateUnitConfig,
  getMainProps,
  getMirrorProps,
  getWebProps,
} from "../../../../../lib/mirage-x/unit/common";

const detail = {
  code: "SnatchCompany/DamageEffect",
  propsConfig: {
    attackedUserId: UnitProp.String(""),
    damage: UnitProp.Float(0),
    criticalCount: UnitProp.Int(0),
    position: UnitProp.Float3([0, 0, 0]),
  },
  dynamicImpulseTriggers: {},
  children: "multi" as const,
};

export type MainProps = getMainProps<typeof detail>;
export type MirrorProps = getMirrorProps<typeof detail>;
export type WebProps = getWebProps<typeof detail>;
export const unitConfig = generateUnitConfig(detail);

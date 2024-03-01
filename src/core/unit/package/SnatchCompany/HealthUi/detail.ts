import {
  UnitDynamicImpulseTrigger,
  UnitProp,
  generateUnitConfig,
  getMainProps,
  getMirrorProps,
  getWebProps,
} from "../../../../../lib/mirage-x/unit/common";

const detail = {
  code: "SnatchCompany/HealthUi",
  propsConfig: {
    health: UnitProp.Float(1),
    maxHealth: UnitProp.Float(1),
    color: UnitProp.Color([0, 1, 0, 1]),
    smoothColor: UnitProp.Color([0, 1, 0, 0.5]),
  },
  dynamicImpulseTriggers: {},
  children: "multi" as const,
};

export type MainProps = getMainProps<typeof detail>;
export type MirrorProps = getMirrorProps<typeof detail>;
export type WebProps = getWebProps<typeof detail>;
export const unitConfig = generateUnitConfig(detail);

import {
  UnitDynamicImpulseTrigger,
  UnitProp,
  generateUnitConfig,
  getMainProps,
  getMirrorProps,
  getWebProps,
} from "../../../../../lib/mirage-x/unit/common";

const detail = {
  code: "SnatchCompany/Triangle",
  propsConfig: {
    point1: UnitProp.Float3([0, 0, 0]),
    point2: UnitProp.Float3([0, 0, 0]),
    point3: UnitProp.Float3([0, 0, 0]),
    point1Color: UnitProp.Color([1, 1, 1, 1]),
    point2Color: UnitProp.Color([1, 1, 1, 1]),
    point3Color: UnitProp.Color([1, 1, 1, 1]),
  },
  dynamicImpulseTriggers: {},
  children: "multi" as const,
};

export type MainProps = getMainProps<typeof detail>;
export type MirrorProps = getMirrorProps<typeof detail>;
export type WebProps = getWebProps<typeof detail>;
export const unitConfig = generateUnitConfig(detail);

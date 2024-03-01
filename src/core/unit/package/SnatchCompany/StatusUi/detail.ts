import {
  UnitDynamicImpulseTrigger,
  UnitProp,
  generateUnitConfig,
  getMainProps,
  getMirrorProps,
  getWebProps,
} from "../../../../../lib/mirage-x/unit/common";

const detail = {
  code: "SnatchCompany/StatusUi",
  propsConfig: {
    attackBase: UnitProp.String("0"),
    attackAdd: UnitProp.String("0"),
    attackRate: UnitProp.String("0"),
    attackTotal: UnitProp.String("0"),
    criticalTotal: UnitProp.String("0"),
    criticalDamageTotal: UnitProp.String("0"),
    attackSpeedBase: UnitProp.String("0"),
    attackSpeedAdd: UnitProp.String("0"),
    attackSpeedRate: UnitProp.String("0"),
    attackSpeedTotal: UnitProp.String("0"),
    chargeEnergyBase: UnitProp.String("0"),
    chargeEnergyAdd: UnitProp.String("0"),
    chargeEnergyRate: UnitProp.String("0"),
    chargeEnergyTotal: UnitProp.String("0"),
    maxEnergyBase: UnitProp.String("0"),
    maxEnergyAdd: UnitProp.String("0"),
    maxEnergyRate: UnitProp.String("0"),
    maxEnergyTotal: UnitProp.String("0"),
  },
  dynamicImpulseTriggers: {},
  children: "multi" as const,
};

export type MainProps = getMainProps<typeof detail>;
export type MirrorProps = getMirrorProps<typeof detail>;
export type WebProps = getWebProps<typeof detail>;
export const unitConfig = generateUnitConfig(detail);

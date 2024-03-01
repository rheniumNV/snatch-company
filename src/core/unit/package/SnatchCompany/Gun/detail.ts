import {
  UnitDynamicImpulseTrigger,
  UnitProp,
  generateUnitConfig,
  getMainProps,
  getMirrorProps,
  getWebProps,
} from "../../../../../lib/mirage-x/unit/common";

const detail = {
  code: "SnatchCompany/Gun",
  propsConfig: {
    userId: UnitProp.String(""),
    attackSpeed: UnitProp.Float(3),
    maxEnergy: UnitProp.Float(100),
    chargeEnergy: UnitProp.Float(30),
    weaponTypeIndex: UnitProp.Int(0),
    active: UnitProp.Boolean(true),
  },
  dynamicImpulseTriggers: {
    equip: UnitDynamicImpulseTrigger.Void("Func.Equip"),
    levelup: UnitDynamicImpulseTrigger.Void("Func.Levelup"),
  },
  children: "multi" as const,
};

export type MainProps = getMainProps<typeof detail>;
export type MirrorProps = getMirrorProps<typeof detail>;
export type WebProps = getWebProps<typeof detail>;
export const unitConfig = generateUnitConfig(detail);

import {
  UnitDynamicImpulseTrigger,
  UnitProp,
  generateUnitConfig,
  getMainProps,
  getMirrorProps,
  getWebProps,
} from "../../../../../lib/mirage-x/unit/common";

const detail = {
  code: "SnatchCompany/SkillUi",
  propsConfig: {
    nameJa: UnitProp.String(""),
    nameEn: UnitProp.String(""),
    descriptionJa: UnitProp.String(""),
    descriptionEn: UnitProp.String(""),
    count: UnitProp.String("0"),
    icon: UnitProp.Uri(""),
    frame: UnitProp.String("Style/Color.Rarity.Rare"),
    orderOffset: UnitProp.Long(0),
  },
  dynamicImpulseTriggers: {},
  children: "multi" as const,
};

export type MainProps = getMainProps<typeof detail>;
export type MirrorProps = getMirrorProps<typeof detail>;
export type WebProps = getWebProps<typeof detail>;
export const unitConfig = generateUnitConfig(detail);

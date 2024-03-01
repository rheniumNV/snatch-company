import {
  UnitDynamicImpulseTrigger,
  UnitProp,
  generateUnitConfig,
  getMainProps,
  getMirrorProps,
  getWebProps,
} from "../../../../../lib/mirage-x/unit/common";

const detail = {
  code: "SnatchCompany/SkillSelectUi",
  propsConfig: {
    skill1NameJa: UnitProp.String(""),
    skill1NameEn: UnitProp.String(""),
    skill2NameJa: UnitProp.String(""),
    skill2NameEn: UnitProp.String(""),
    skill3NameJa: UnitProp.String(""),
    skill3NameEn: UnitProp.String(""),
    skill1DescriptionJa: UnitProp.String(""),
    skill1DescriptionEn: UnitProp.String(""),
    skill2DescriptionJa: UnitProp.String(""),
    skill2DescriptionEn: UnitProp.String(""),
    skill3DescriptionJa: UnitProp.String(""),
    skill3DescriptionEn: UnitProp.String(""),
    skill1Icon: UnitProp.Uri(""),
    skill2Icon: UnitProp.Uri(""),
    skill3Icon: UnitProp.Uri(""),
    skill1Frame: UnitProp.String("Style/Color.Rarity.Rare"),
    skill2Frame: UnitProp.String("Style/Color.Rarity.Rare"),
    skill3Frame: UnitProp.String("Style/Color.Rarity.Rare"),
    selectSkill1: UnitProp.Function(() => {}),
    selectSkill2: UnitProp.Function(() => {}),
    selectSkill3: UnitProp.Function(() => {}),
  },
  dynamicImpulseTriggers: {},
  children: "multi" as const,
};

export type MainProps = getMainProps<typeof detail>;
export type MirrorProps = getMirrorProps<typeof detail>;
export type WebProps = getWebProps<typeof detail>;
export const unitConfig = generateUnitConfig(detail);

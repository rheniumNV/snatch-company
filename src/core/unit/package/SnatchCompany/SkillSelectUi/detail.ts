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
    skill1Name: UnitProp.String(""),
    skill2Name: UnitProp.String(""),
    skill3Name: UnitProp.String(""),
    skill1Description: UnitProp.String(""),
    skill2Description: UnitProp.String(""),
    skill3Description: UnitProp.String(""),
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

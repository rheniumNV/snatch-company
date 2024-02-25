import { FunctionEnv } from "../../../../../lib/mirage-x/common/interactionEvent";
import {
  UnitDynamicImpulseTrigger,
  UnitProp,
  generateUnitConfig,
  getMainProps,
  getMirrorProps,
  getWebProps,
} from "../../../../../lib/mirage-x/unit/common";

const detail = {
  code: "SnatchCompany/MovedSlot",
  propsConfig: {
    position: UnitProp.Float3([0, 0, 0]),
    move: UnitProp.Float3([0, 0, 0]),
    moveTime: UnitProp.Float(1),
  },
  dynamicImpulseTriggers: {
    move: UnitDynamicImpulseTrigger.Void("Func.Move"),
  },
  children: "multi" as const,
};

export type MainProps = getMainProps<typeof detail>;
export type MirrorProps = getMirrorProps<typeof detail>;
export type WebProps = getWebProps<typeof detail>;
export const unitConfig = generateUnitConfig(detail);

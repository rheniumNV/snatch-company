import { FunctionEnv } from "../../../../../lib/mirage-x/common/interactionEvent";
import {
  UnitProp,
  generateUnitConfig,
  getMainProps,
  getMirrorProps,
  getWebProps,
} from "../../../../../lib/mirage-x/unit/common";

const detail = {
  code: "SnatchCompany/Resource",
  propsConfig: {
    position: UnitProp.Float3(),
    rotation: UnitProp.FloatQ(),
    onHit: UnitProp.Function(
      (env: FunctionEnv, hitPoint: [number, number, number]) => {}
    ),
  },
  children: "multi" as const,
};

export type MainProps = getMainProps<typeof detail>;
export type MirrorProps = getMirrorProps<typeof detail>;
export type WebProps = getWebProps<typeof detail>;
export const unitConfig = generateUnitConfig(detail);

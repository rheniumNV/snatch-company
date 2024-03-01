import {
  UnitDynamicImpulseTrigger,
  UnitProp,
  generateUnitConfig,
  getMainProps,
  getMirrorProps,
  getWebProps,
} from "../../../../../lib/mirage-x/unit/common";

const detail = {
  code: "SnatchCompany/LobbyRoom",
  propsConfig: {
    startGame: UnitProp.Function(() => {}),
  },
  dynamicImpulseTriggers: {
    startOpening: UnitDynamicImpulseTrigger.Void("Func.StartOpening"),
    back2Lobby: UnitDynamicImpulseTrigger.Void("Func.Back2Lobby"),
  },
  children: "multi" as const,
};

export type MainProps = getMainProps<typeof detail>;
export type MirrorProps = getMirrorProps<typeof detail>;
export type WebProps = getWebProps<typeof detail>;
export const unitConfig = generateUnitConfig(detail);

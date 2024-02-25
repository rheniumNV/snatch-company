import { web as Bird } from "./Bird/web";
import { web as Bomb } from "./Bomb/web";
import { web as DamageEffect } from "./DamageEffect/web";
import { web as Gun } from "./Gun/web";
import { web as LocalView } from "./LocalView/web";
import { web as Meteorite } from "./Meteorite/web";
import { web as MovedSlot } from "./MovedSlot/web";
import { web as Resource } from "./Resource/web";
import { web as Rock } from "./Rock/web";
import { web as Shark } from "./Shark/web";
import { web as Ship } from "./Ship/web";
import { web as ShipDisplay } from "./ShipDisplay/web";
import { web as TreasureChest } from "./TreasureChest/web";
import { web as Tree } from "./Tree/web";

export const Units = {
  ...Bird,
  ...Bomb,
  ...DamageEffect,
  ...Gun,
  ...LocalView,
  ...Meteorite,
  ...MovedSlot,
  ...Resource,
  ...Rock,
  ...Shark,
  ...Ship,
  ...ShipDisplay,
  ...TreasureChest,
  ...Tree,
};

import { Skill } from "../type";
import { generatePassiveStatusUpEffect } from "./util";

export const commonSkills: Skill[] = [
  {
    code: "common_attack",
    name: {
      en: "AttackUp",
      ja: "攻撃力アップ",
    },
    rarity: "normal",
    effect: [generatePassiveStatusUpEffect("attack", "rate", 0.1)],
    demerit: false,
    icon: "sword_normal",
  },
  {
    code: "common_critical",
    name: {
      en: "CritChanceUp",
      ja: "クリティカル率アップ",
    },
    rarity: "normal",
    effect: [generatePassiveStatusUpEffect("critical", "add", 0.1)],
    demerit: false,
    icon: "sword_speed",
  },
  {
    code: "common_attackSpeed",
    name: { en: "AttackSpeedUp", ja: "攻撃速度アップ" },
    rarity: "normal",
    effect: [generatePassiveStatusUpEffect("attackSpeed", "rate", 0.15)],
    demerit: false,
    icon: "sword_crit",
  },
  {
    code: "common_chargeEnergy",
    name: {
      en: "EnergyRechargeUp",
      ja: "エネルギー回復アップ",
    },
    rarity: "normal",
    effect: [generatePassiveStatusUpEffect("chargeEnergy", "rate", 0.15)],
    demerit: false,
    icon: "recharge",
  },
];

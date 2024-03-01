import { Status, StatusEffect } from "../type";

const statusNameMap = {
  attack: {
    ja: "攻撃力",
    en: "Attack",
  },
  critical: {
    ja: "クリティカル",
    en: "Critical",
  },
  criticalDamage: {
    ja: "クリティカルダメージ",
    en: "CriticalDamage",
  },
  attackSpeed: {
    ja: "攻撃速度",
    en: "AttackSpeed",
  },
  maxEnergy: {
    ja: "最大エネルギー",
    en: "MaxEnergy",
  },
  chargeEnergy: {
    ja: "エネルギー回復",
    en: "ChargeEnergy",
  },
  moveSpeed: {
    ja: "移動速度",
    en: "MoveSpeed",
  },
  antiPlant: {
    ja: "有機物特攻",
    en: "BiologicalSpecialAttack",
  },
  antiMineral: {
    ja: "無機物特攻",
    en: "InorganicSpecialAttack",
  },
  extraDamage: {
    ja: "追加ダメージ",
    en: "ExtraDamage",
  },
};

export const generatePassiveStatusUpEffect = (
  target: keyof Status,
  type: "rate" | "add",
  value: number
): StatusEffect<{}> => ({
  type: "custom",
  description:
    type === "add" &&
    !["critical", "criticalDamage", "antiPlant", "antiMineral"].includes(target)
      ? {
          ja: `基礎${statusNameMap[target].ja} ${Math.abs(value)} ${
            value > 0 ? "up" : "down"
          }`,
          en: `Base${statusNameMap[target].en} ${Math.abs(value)} ${
            value > 0 ? "up" : "down"
          }`,
        }
      : {
          ja: `${statusNameMap[target].ja} ${Math.abs(value) * 100}% ${
            value > 0 ? "up" : "down"
          }`,
          en: `${statusNameMap[target].en} ${Math.abs(value) * 100}% ${
            value > 0 ? "up" : "down"
          }`,
        },
  passive: (prev) => ({
    state: {},
    statusBuffs: [],
    statusUpper: {
      ...prev.statusUpper,
      [target]: {
        ...prev.statusUpper[target],
        add: prev.statusUpper[target].add + (type === "add" ? value : 0),
        rate: prev.statusUpper[target].rate + (type === "rate" ? value : 0),
      },
    },
  }),
  state: {},
  order: 0,
});

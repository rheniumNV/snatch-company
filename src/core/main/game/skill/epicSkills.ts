import { Skill } from "../type";
import { generatePassiveStatusUpEffect } from "./util";

export const epicSkills: Skill[] = [
  {
    code: "epic_One-Hit Kill Stance",
    name: {
      ja: "一撃必殺の構え",
      en: "One-Hit Kill Stance",
    },
    rarity: "epic",
    effect: [
      generatePassiveStatusUpEffect("attack", "add", 30),
      generatePassiveStatusUpEffect("attack", "rate", 1),
      generatePassiveStatusUpEffect("critical", "add", 1),
      generatePassiveStatusUpEffect("criticalDamage", "add", 0.5),
      generatePassiveStatusUpEffect("chargeEnergy", "add", -5),
      generatePassiveStatusUpEffect("maxEnergy", "add", -50),
      {
        type: "custom",
        description: {
          ja: "エネルギー回復と最大エネルギーが上昇しなくなる",
          en: "Energy recovery and maximum energy no longer increase",
        },
        passive: (prev, gameState, deltaTime) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            chargeEnergy: {
              add: -5,
              rate: Math.min(0, prev.statusUpper.chargeEnergy.rate),
            },
            maxEnergy: {
              add: -50,
              rate: Math.min(0, prev.statusUpper.maxEnergy.rate),
            },
          },
        }),
        state: {},
        order: 100,
      },
    ],
    demerit: true,
    icon: "weapon_conversion",
  },
  {
    code: "epic_Meditation",
    name: {
      ja: "瞑想",
      en: "Meditation",
    },
    rarity: "epic",
    effect: [
      generatePassiveStatusUpEffect("attack", "rate", 0.5),
      generatePassiveStatusUpEffect("chargeEnergy", "add", -2),
      {
        type: "custom",
        description: {
          ja: "5秒間攻撃しなかった場合、10秒間 基礎攻撃力 30 up",
          en: "If you don't attack for 5 seconds, attack power is up by 20 for 10 seconds",
        },
        onHit: (prev, attacker, object) => ({
          state: { time: 0 },
          statusBuffs: [],
          statusUpper: prev.statusUpper,
        }),
        passive: (prev, gameState, deltaTime) => {
          if ("time" in prev.state && typeof prev.state.time === "number") {
            return {
              state: {
                time: prev.state.time > 5 ? 0 : prev.state.time + deltaTime,
              },
              statusBuffs:
                prev.state.time > 5
                  ? [
                      {
                        statusEffects: [
                          generatePassiveStatusUpEffect("attack", "add", 30),
                        ],
                        duration: 10,
                        source: prev.source,
                      },
                    ]
                  : [],
              statusUpper: prev.statusUpper,
            };
          }
          return {
            state: {
              time: 0,
            },
            statusBuffs: [],
            statusUpper: prev.statusUpper,
          };
        },
        state: { time: 0 },
        order: 0,
      },
    ],
    demerit: true,
    icon: "unique",
  },
  {
    code: "epic_Machine Gun Retrofit",
    name: {
      ja: "マシンガン換装",
      en: "Machine Gun Retrofit",
    },
    rarity: "epic",
    effect: [
      generatePassiveStatusUpEffect("attack", "add", -15),
      generatePassiveStatusUpEffect("attackSpeed", "add", 1),
      generatePassiveStatusUpEffect("attackSpeed", "rate", 0.5),
      generatePassiveStatusUpEffect("chargeEnergy", "add", 5),
      generatePassiveStatusUpEffect("chargeEnergy", "rate", 0.5),
      {
        type: "custom",
        description: {
          ja: "攻撃力上昇効果を半分の攻撃速度上昇効果に変換する",
          en: "Convert half of the attack power increase effect to attack speed increase effect",
        },
        passive: (prev, gameState, deltaTime) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attack: {
              ...prev.statusUpper.attack,
              rate: 0,
            },
            attackSpeed: {
              ...prev.statusUpper.attackSpeed,
              rate:
                prev.statusUpper.attackSpeed.rate +
                prev.statusUpper.attack.rate / 2,
            },
          },
        }),
        state: {},
        order: 50,
      },
    ],
    demerit: true,
    icon: "weapon_conversion",
  },
  {
    code: "epic_Laser Cannon Retrofit",
    name: {
      ja: "レーザーキャノン換装",
      en: "Laser Cannon Retrofit",
    },
    rarity: "epic",
    effect: [
      generatePassiveStatusUpEffect("attack", "add", 15),
      generatePassiveStatusUpEffect("attack", "rate", 1),
      generatePassiveStatusUpEffect("chargeEnergy", "add", -4),
      {
        type: "custom",
        description: {
          ja: "攻撃速度上昇効果を半分の攻撃力上昇効果に変換する",
          en: "Convert half of the attack speed increase effect to attack power increase effect",
        },
        passive: (prev, gameState, deltaTime) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attackSpeed: {
              ...prev.statusUpper.attackSpeed,
              rate: 0,
            },
            attack: {
              ...prev.statusUpper.attack,
              rate:
                prev.statusUpper.attack.rate +
                prev.statusUpper.attackSpeed.rate / 2,
            },
          },
        }),
        state: {},
        order: 50,
      },
    ],
    demerit: true,
    icon: "weapon_conversion",
  },
  {
    code: "epic_Abnormal Stacking",
    name: {
      ja: "異常な積み上げ",
      en: "Abnormal Stacking",
    },
    rarity: "epic",
    effect: [
      generatePassiveStatusUpEffect("critical", "add", -0.5),
      generatePassiveStatusUpEffect("criticalDamage", "add", 0.5),
      {
        type: "custom",
        description: {
          ja: "攻撃速度上昇効果を半分のクリティカル率上昇効果に変換する",
          en: "Convert half of the attack speed increase effect to critical rate increase effect",
        },
        passive: (prev, gameState, deltaTime) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attackSpeed: {
              ...prev.statusUpper.attackSpeed,
              rate: 0,
            },
            critical: {
              ...prev.statusUpper.critical,
              add:
                prev.statusUpper.critical.add +
                prev.statusUpper.attackSpeed.rate / 2,
            },
          },
        }),
        state: {},
        order: 50,
      },
    ],
    demerit: true,
    icon: "weapon_conversion",
  },
  {
    code: "epic_Hero",
    name: {
      ja: "英雄",
      en: "Hero",
    },
    rarity: "epic",
    effect: [
      {
        type: "custom",
        description: {
          ja: "イベント中、攻撃力 50% up / クリティカル率 50% up / 攻撃速度 50% up",
          en: "During events, attack power is up by 50%, critical rate is up by 50%, and attack speed is up by 50%",
        },
        passive: (prev, gameState, deltaTime) => ({
          state: {},
          statusUpper:
            gameState.mode === "inGame" &&
            gameState.section.mode === "battle" &&
            gameState.section.events.some((e) => e.state === "processing")
              ? {
                  ...prev.statusUpper,
                  attack: {
                    ...prev.statusUpper.attack,
                    rate: prev.statusUpper.attack.rate + 0.5,
                  },
                  attackSpeed: {
                    ...prev.statusUpper.attackSpeed,
                    rate: prev.statusUpper.attackSpeed.rate + 0.5,
                  },
                  critical: {
                    ...prev.statusUpper.critical,
                    add: prev.statusUpper.critical.add + 0.5,
                  },
                }
              : prev.statusUpper,
          statusBuffs: [],
        }),
        state: {},
        order: 0,
      },
      {
        type: "custom",
        description: {
          ja: "イベント中以外、攻撃力 50% down",
          en: "Outside of events, attack power is down by 50%",
        },
        passive: (prev, gameState, deltaTime) => ({
          state: {},
          statusUpper: !(
            gameState.mode === "inGame" &&
            gameState.section.mode === "battle" &&
            gameState.section.events.some((e) => e.state === "processing")
          )
            ? {
                ...prev.statusUpper,
                attack: {
                  ...prev.statusUpper.attack,
                  rate: prev.statusUpper.attack.rate - 0.5,
                },
              }
            : prev.statusUpper,
          statusBuffs: [],
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: true,
    icon: "special",
  },
  {
    code: "epic_Fearsome When Angry",
    name: {
      ja: "怒ると怖い",
      en: "Fearsome When Angry",
    },
    rarity: "epic",
    effect: [
      {
        type: "custom",
        description: {
          ja: "船のシールドが10%以下になったとき、5秒間 クリティカル率 100% up / クリティカルダメージ 50% up (10秒に一回発動)",
          en: "When the ship's shield reaches 0, critical rate is up by 100% and critical damage is up by 100% for 20 seconds (activated once every 60 seconds)",
        },
        passive: (prev, gameState, deltaTime) => {
          if (
            "waitTime" in prev.state &&
            typeof prev.state.waitTime === "number" &&
            gameState.mode === "inGame"
          ) {
            return {
              state: {
                waitTime:
                  prev.state.waitTime === 0 && gameState.ship.shield <= 0.1
                    ? 10
                    : Math.max(0, prev.state.waitTime - deltaTime),
              },
              statusBuffs:
                prev.state.waitTime === 0 && gameState.ship.shield <= 0.1
                  ? [
                      {
                        statusEffects: [
                          generatePassiveStatusUpEffect("critical", "add", 1),
                          generatePassiveStatusUpEffect(
                            "criticalDamage",
                            "add",
                            0.5
                          ),
                        ],
                        duration: 5,
                        source: prev.source,
                      },
                    ]
                  : [],
              statusUpper: prev.statusUpper,
            };
          }
          return {
            state: { waitTime: 0 },
            statusUpper: prev.statusUpper,
            statusBuffs: [],
          };
        },
        state: { waitTime: 0 },
        order: 0,
      },
    ],
    demerit: false,
    icon: "unique",
  },
  {
    code: "epic_Contrarian",
    name: {
      ja: "逆張り",
      en: "Contrarian",
    },
    rarity: "epic",
    effect: [
      {
        type: "custom",
        description: {
          ja: "船のシールドが50%以下のとき、無機物特攻 60% up 有機物特攻 30% down",
          en: "When the ship's shield is below 50%, inorganic special attack is up by 60% and biological special attack is down by 30%",
        },
        passive: (prev, gameState, deltaTime) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            antiMineral: {
              ...prev.statusUpper.antiMineral,
              add:
                gameState.mode === "inGame" &&
                gameState.ship.shield / gameState.ship.maxShield <= 0.5
                  ? prev.statusUpper.antiMineral.add + 0.6
                  : prev.statusUpper.antiMineral.add,
            },
            antiPlant: {
              ...prev.statusUpper.antiPlant,
              add:
                gameState.mode === "inGame" &&
                gameState.ship.shield / gameState.ship.maxShield <= 0.5
                  ? prev.statusUpper.antiPlant.add - 0.3
                  : prev.statusUpper.antiPlant.add,
            },
          },
        }),
        state: {},
        order: 0,
      },
      {
        type: "custom",
        description: {
          ja: "船のシールドが50%より高いとき、有機物特攻 60% up 無機物特攻 30% down",
          en: "When the ship's shield is above 50%, biological special attack is up by 60% and inorganic special attack is down by 30%",
        },
        passive: (prev, gameState, deltaTime) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            antiMineral: {
              ...prev.statusUpper.antiMineral,
              add:
                gameState.mode === "inGame" &&
                gameState.ship.shield / gameState.ship.maxShield > 0.5
                  ? prev.statusUpper.antiMineral.add - 0.3
                  : prev.statusUpper.antiMineral.add,
            },
            antiPlant: {
              ...prev.statusUpper.antiPlant,
              add:
                gameState.mode === "inGame" &&
                gameState.ship.shield / gameState.ship.maxShield > 0.5
                  ? prev.statusUpper.antiPlant.add + 0.6
                  : prev.statusUpper.antiPlant.add,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: true,
    icon: "sword_anti",
  },
  {
    code: "epic_EnergySaver",
    name: {
      ja: "エネルギーセイバー",
      en: "Energy Saver",
    },
    rarity: "epic",
    effect: [
      generatePassiveStatusUpEffect("attackSpeed", "add", 1),
      generatePassiveStatusUpEffect("maxEnergy", "add", 30),
      generatePassiveStatusUpEffect("maxEnergy", "rate", 4),
      generatePassiveStatusUpEffect("chargeEnergy", "add", -5),
      generatePassiveStatusUpEffect("chargeEnergy", "rate", -0.25),
      {
        type: "custom",
        description: {
          ja: "30秒ごとに、5秒間 基礎エネルギー回復 10 up / エネルギー回復 1000% up",
          en: "Every 30 seconds, energy recovery is up by 10 for 5 seconds and energy recovery is up by 1000%",
        },
        passive: (prev, gameState, deltaTime) => {
          if ("time" in prev.state && typeof prev.state.time === "number") {
            return {
              state: {
                time: prev.state.time < 30 ? prev.state.time + deltaTime : 0,
              },
              statusBuffs: [],
              statusUpper: {
                ...prev.statusUpper,
                chargeEnergy: {
                  add:
                    prev.statusUpper.chargeEnergy.add +
                    (prev.state.time < 5 ? 10 : 0),
                  rate:
                    prev.statusUpper.chargeEnergy.rate +
                    (prev.state.time < 5 ? 10 : 0),
                },
              },
            };
          }
          return {
            state: { time: 0 },
            statusBuffs: [],
            statusUpper: prev.statusUpper,
          };
        },
        state: { time: 0 },
        order: 0,
      },
    ],
    demerit: true,
    icon: "special",
  },
  {
    code: "epic_Masterpiece",
    name: {
      ja: "傑作",
      en: "Masterpiece",
    },
    rarity: "epic",
    effect: [
      generatePassiveStatusUpEffect("attackSpeed", "add", -0.5),
      generatePassiveStatusUpEffect("attackSpeed", "rate", 0.5),
      generatePassiveStatusUpEffect("chargeEnergy", "add", 5),
      generatePassiveStatusUpEffect("chargeEnergy", "rate", 0.5),
      generatePassiveStatusUpEffect("maxEnergy", "add", -30),
      {
        type: "custom",
        description: {
          ja: "エネルギー回復上昇量と攻撃速度上昇量が共通化され、平均値分上昇する",
          en: "The increase in energy recovery and attack speed is unified and increased by the average value",
        },
        passive: (prev, gameState, deltaTime) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attackSpeed: {
              ...prev.statusUpper.attackSpeed,
              rate:
                (prev.statusUpper.attackSpeed.rate +
                  prev.statusUpper.chargeEnergy.rate) /
                2,
            },
            chargeEnergy: {
              ...prev.statusUpper.chargeEnergy,
              rate:
                (prev.statusUpper.attackSpeed.rate +
                  prev.statusUpper.chargeEnergy.rate) /
                2,
            },
          },
        }),
        state: {},
        order: 50,
      },
    ],
    demerit: true,
    icon: "weapon_conversion",
  },
];

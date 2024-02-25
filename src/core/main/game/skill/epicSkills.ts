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
      generatePassiveStatusUpEffect("attack", "add", 50),
      generatePassiveStatusUpEffect("maxEnergy", "rate", 0.8),
      generatePassiveStatusUpEffect("chargeEnergy", "rate", -0.7),
    ],
    demerit: true,
  },
  {
    code: "epic_Meditation",
    name: {
      ja: "瞑想",
      en: "Meditation",
    },
    rarity: "epic",
    effect: [
      {
        type: "custom",
        description: {
          ja: "10秒間攻撃しなかった場合、20秒間 基礎攻撃力 20 up",
          en: "If you don't attack for 10 seconds, base attack power will be up by 20 for 20 seconds",
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
                time: prev.state.time > 10 ? 0 : prev.state.time + deltaTime,
              },
              statusBuffs:
                prev.state.time > 10
                  ? [
                      {
                        statusEffects: [
                          generatePassiveStatusUpEffect("attack", "add", 20),
                        ],
                        duration: 20,
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
    demerit: false,
  },
  {
    code: "epic_Machine Gun Retrofit",
    name: {
      ja: "マシンガン換装",
      en: "Machine Gun Retrofit",
    },
    rarity: "epic",
    effect: [
      generatePassiveStatusUpEffect("attack", "add", -7),
      generatePassiveStatusUpEffect("critical", "add", -0.2),
      generatePassiveStatusUpEffect("attackSpeed", "rate", 2),
    ],
    demerit: true,
  },
  {
    code: "epic_Laser Cannon Retrofit",
    name: {
      ja: "レーザーキャノン換装",
      en: "Laser Cannon Retrofit",
    },
    rarity: "epic",
    effect: [
      generatePassiveStatusUpEffect("attack", "add", 20),
      generatePassiveStatusUpEffect("attackSpeed", "rate", -1),
      generatePassiveStatusUpEffect("criticalDamage", "add", 0.5),
    ],
    demerit: true,
  },
  {
    code: "epic_Abnormal Stacking",
    name: {
      ja: "異常な積み上げ",
      en: "Abnormal Stacking",
    },
    rarity: "epic",
    effect: [
      generatePassiveStatusUpEffect("critical", "add", -1),
      generatePassiveStatusUpEffect("criticalDamage", "add", 1),
    ],
    demerit: true,
  },
  {
    code: "epic_Professional Lumberjack",
    name: {
      ja: "プロの伐採者",
      en: "Professional Lumberjack",
    },
    rarity: "epic",
    effect: [
      generatePassiveStatusUpEffect("antiPlant", "add", 2),
      generatePassiveStatusUpEffect("antiMineral", "add", -0.7),
    ],
    demerit: true,
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
          ja: "イベント中、攻撃力 30% up / 攻撃速度 45% up / クリティカル率 30% up / クリティカルダメージ 30% up",
          en: "During the event, attack power is up by 30%, attack speed is up by 45%, critical rate is up by 30%, and critical damage is up by 30%",
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
                    rate: prev.statusUpper.attack.rate + 0.3,
                  },
                  attackSpeed: {
                    ...prev.statusUpper.attackSpeed,
                    rate: prev.statusUpper.attackSpeed.rate + 0.45,
                  },
                  critical: {
                    ...prev.statusUpper.critical,
                    add: prev.statusUpper.critical.add + 0.3,
                  },
                  criticalDamage: {
                    ...prev.statusUpper.criticalDamage,
                    add: prev.statusUpper.criticalDamage.add + 0.3,
                  },
                }
              : prev.statusUpper,
          statusBuffs: [],
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
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
          ja: "船のシールドが0になったとき、20秒間 クリティカル率 100% up / クリティカルダメージ 100% up (60秒に一回発動)",
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
                  prev.state.waitTime === 0 && gameState.ship.shield <= 0
                    ? 60
                    : Math.max(0, prev.state.waitTime - deltaTime),
              },
              statusBuffs:
                prev.state.waitTime === 0 && gameState.ship.shield <= 0
                  ? [
                      {
                        statusEffects: [
                          generatePassiveStatusUpEffect("critical", "add", 1),
                          generatePassiveStatusUpEffect(
                            "criticalDamage",
                            "add",
                            1
                          ),
                        ],
                        duration: 20,
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
          ja: "船のシールドが20%以下のとき、無機物特攻 60% up",
          en: "When the ship's shield is below 20%, inorganic special attack is up by 60%",
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
                gameState.ship.shield / gameState.ship.maxShield <= 0.2
                  ? prev.statusUpper.antiMineral.add + 0.6
                  : prev.statusUpper.antiMineral.add,
            },
          },
        }),
        state: {},
        order: 0,
      },
      {
        type: "custom",
        description: {
          ja: "船のシールドが20%より高いとき、有機物特攻 100% up",
          en: "When the ship's shield is above 20%, biological special attack is up by 100%",
        },
        passive: (prev, gameState, deltaTime) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            antiPlant: {
              ...prev.statusUpper.antiPlant,
              add:
                gameState.mode === "inGame" &&
                gameState.ship.shield / gameState.ship.maxShield > 0.2
                  ? prev.statusUpper.antiPlant.add + 1
                  : prev.statusUpper.antiPlant.add,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
  },
];

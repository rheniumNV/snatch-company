import { Skill } from "../type";
import { generatePassiveStatusUpEffect } from "./util";

export const rareSkills: Skill[] = [
  {
    code: "rare_MaxEnergyUp",
    name: {
      en: "MaxEnergyUp",
      ja: "最大エネルギーアップ",
    },
    rarity: "rare",
    effect: [generatePassiveStatusUpEffect("maxEnergy", "rate", 0.5)],
    demerit: false,
  },
  {
    code: "rare_AntiPlant",
    name: {
      ja: "有機物特攻",
      en: "Biological special attack",
    },
    rarity: "rare",
    effect: [generatePassiveStatusUpEffect("antiPlant", "rate", 0.5)],
    demerit: false,
  },
  {
    code: "rare_AntiMineral",
    name: {
      ja: "無機物特攻",
      en: "Inorganic special attack",
    },
    rarity: "rare",
    effect: [generatePassiveStatusUpEffect("antiMineral", "rate", 0.5)],
    demerit: false,
  },
  {
    code: "rare_Cunning",
    name: {
      ja: "狡猾",
      en: "Cunning",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("critical", "add", 0.5),
      {
        type: "custom",
        description: {
          ja: "クリティカル率アップの上限が100%になる",
          en: "Critical chance upper limit becomes 100%",
        },
        passive: (prev) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            critical: {
              ...prev.statusUpper.critical,
              add: Math.min(1, prev.statusUpper.critical.add),
            },
          },
        }),
        state: {},
        order: 100,
      },
    ],
    demerit: true,
  },
  {
    code: "rare_ComboAttack",
    name: {
      ja: "連撃",
      en: "Combo Attack",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "前回と同じターゲットを攻撃するたび、攻撃力 10% up（最大50%）",
          en: "If you attack the same target as the previous time, the attack power increases by 10% (up to 50% maximum).",
        },
        passive: (prev) => {
          const count =
            "count" in prev.state && typeof prev.state["count"] === "number"
              ? prev.state["count"]
              : 0;
          return {
            state: prev.state,
            statusBuffs: [],
            statusUpper: {
              ...prev.statusUpper,
              attack: {
                ...prev.statusUpper.attack,
                rate: prev.statusUpper.attack.rate + Math.min(5, count) * 0.1,
              },
            },
          };
        },
        onHit: (prev, attacker, target) => {
          if (
            "lastTargetId" in prev.state &&
            prev.state["lastTargetId"] === target.id
          ) {
            const count =
              "count" in prev.state && typeof prev.state["count"] === "number"
                ? prev.state["count"] + 1
                : 1;
            return {
              state: {
                lastTargetId: target.id,
                count,
              },
              statusBuffs: [],
              statusUpper: prev.statusUpper,
            };
          }
          return { ...prev, state: { lastTargetId: target.id, count: 0 } };
        },
        state: {
          lastTargetId: null,
          count: 0,
        },
        order: 0,
      },
    ],
    demerit: false,
  },
  {
    code: "rare_Composure",
    name: {
      ja: "心の余裕",
      en: "Composure",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "シールドが75%以上のとき、攻撃力 5 up",
          en: "When the shield is 75% or more, the attack power increases by 5.",
        },
        passive: (prev, gameState) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attack: {
              ...prev.statusUpper.attack,
              add:
                gameState.mode === "inGame" &&
                gameState.ship.shield / gameState.ship.maxShield > 0.75
                  ? prev.statusUpper.attack.add + 5
                  : prev.statusUpper.attack.add,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
  },
  {
    code: "rare_BattleReady",
    name: {
      ja: "戦いの準備",
      en: "Battle Ready",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "10秒ごとに次の攻撃まで攻撃力 200% up",
          en: "Attack power increases by 200% until the next attack every 10 seconds",
        },
        passive: (prev, gameState, deltaTime) => {
          if (
            "time" in prev.state &&
            typeof prev.state.time === "number" &&
            "active" in prev.state
          ) {
            return {
              state: {
                time:
                  prev.state.active || prev.state.time > 10
                    ? 0
                    : prev.state.time + deltaTime,
                active: prev.state.active || prev.state.time > 10,
              },
              statusBuffs: [],
              statusUpper: {
                ...prev.statusUpper,
                attack: {
                  ...prev.statusUpper.attack,
                  rate:
                    prev.statusUpper.attack.rate + (prev.state.active ? 2 : 0),
                },
              },
            };
          }
          return {
            state: {
              time: 0,
              active: false,
            },
            statusBuffs: [],
            statusUpper: prev.statusUpper,
          };
        },
        onHit: (prev) => {
          if (
            "time" in prev.state &&
            typeof prev.state.time === "number" &&
            "active" in prev.state
          ) {
            return {
              state: {
                time: prev.state.time,
                active: false,
              },
              statusBuffs: [],
              statusUpper: prev.statusUpper,
            };
          } else {
            return {
              state: {
                time: 0,
                active: false,
              },
              statusBuffs: [],
              statusUpper: prev.statusUpper,
            };
          }
        },
        state: {
          time: 0,
          active: false,
        },
        order: 0,
      },
    ],
    demerit: false,
  },
  {
    code: "rare_Quick Strike",
    name: {
      ja: "差し込み",
      en: "Quick Strike",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "攻撃5回ごとに、次の攻撃力 10 up",
          en: "Every 5 attacks, the next attack power increases by 10.",
        },
        passive: (prev, gameState) => ({
          state: prev.state,
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attack: {
              ...prev.statusUpper.attack,
              add:
                "count" in prev.state &&
                typeof prev.state.count === "number" &&
                prev.state.count >= 5
                  ? prev.statusUpper.attack.add + 10
                  : prev.statusUpper.attack.add,
            },
          },
        }),
        onAddDamage: (prev) => {
          if ("count" in prev.state && typeof prev.state.count === "number") {
            return {
              state: {
                count: prev.state.count >= 5 ? 1 : prev.state.count + 1,
              },
              statusBuffs: [],
              statusUpper: prev.statusUpper,
            };
          }
          return { ...prev, state: { count: 1 } };
        },
        state: {
          count: 0,
        },
        order: 0,
      },
    ],
    demerit: false,
  },
  {
    code: "rare_AttakUp-Ex",
    name: {
      ja: "攻撃力アップ改",
      en: "AttackUp-Ex",
    },
    rarity: "rare",
    effect: [generatePassiveStatusUpEffect("attack", "rate", 0.2)],
    demerit: false,
  },
  {
    code: "rare_CriticalUp-Ex",
    name: {
      ja: "クリティカル率アップ改",
      en: "CritChanceUp-Ex",
    },
    rarity: "rare",
    effect: [generatePassiveStatusUpEffect("critical", "add", 0.2)],
    demerit: false,
  },
  {
    code: "rare_AttackSpeedUp-Ex",
    name: {
      ja: "攻撃速度アップ改",
      en: "AttackSpeedUp-Ex",
    },
    rarity: "rare",
    effect: [generatePassiveStatusUpEffect("attackSpeed", "rate", 0.3)],
    demerit: false,
  },
  {
    code: "rare_ChargeEnergyUp-Ex",
    name: {
      ja: "エネルギー回復アップ改",
      en: "EnergyRechargeUp-Ex",
    },
    rarity: "rare",
    effect: [generatePassiveStatusUpEffect("chargeEnergy", "rate", 0.3)],
    demerit: false,
  },
  {
    code: "rare_Confident",
    name: {
      ja: "自信過剰",
      en: "Overconfidence",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "クリティカルダメージ 50% up",
          en: "Critical damage 50% up",
        },
        passive: (prev) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            criticalDamage: {
              ...prev.statusUpper.criticalDamage,
              add: prev.statusUpper.criticalDamage.add + 0.5,
            },
          },
        }),
        state: {},
        order: 0,
      },
      {
        type: "custom",
        description: {
          ja: "クリティカルでないとき、攻撃力 50% down",
          en: "When not critical, attack power 50% down",
        },
        onCalcCritical: (prev, gameState, attacker, object, criticalCount) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attack: {
              ...prev.statusUpper.attack,
              rate:
                criticalCount > 0
                  ? prev.statusUpper.attack.rate
                  : prev.statusUpper.attack.rate - 0.5,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: true,
  },
  {
    code: "rare_Brutal",
    name: {
      ja: "粗暴",
      en: "Brutal",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "攻撃力 100% up",
          en: "Attack power 100% up",
        },
        passive: (prev) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attack: {
              ...prev.statusUpper.attack,
              rate: prev.statusUpper.attack.rate + 1,
            },
          },
        }),
        state: {},
        order: 0,
      },
      {
        type: "custom",
        description: {
          ja: "クリティカル率が0になる",
          en: "Critical chance becomes 0",
        },
        passive: (prev) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            critical: {
              rate: 0,
              add: 0,
            },
          },
        }),
        state: {},
        order: 100,
      },
    ],
    demerit: true,
  },
  {
    code: "rare_Lumberjack",
    name: {
      ja: "伐採者",
      en: "Lumberjack",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("antiPlant", "rate", 1),
      generatePassiveStatusUpEffect("antiMineral", "rate", -0.5),
    ],
    demerit: true,
  },
  {
    code: "rare_Pinch",
    name: {
      ja: "一つまみ",
      en: "Pinch",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "攻撃対象の体力が100%のとき、攻撃力 200% up",
          en: "When the target's health is 100%, the attack power increases by 200%",
        },
        onHit: (prev, attacker, object) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attack: {
              ...prev.statusUpper.attack,
              rate:
                prev.statusUpper.attack.rate +
                (object.health === object.maxHealth ? 2 : 0),
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
  },
  {
    code: "rare_Scramble",
    name: {
      ja: "スクランブル",
      en: "Scramble",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "イベント発生中、基礎攻撃力 7 up",
          en: "During the event, basic attack power increases by 7",
        },
        passive: (prev, gameState) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attack: {
              ...prev.statusUpper.attack,
              add:
                gameState.mode === "inGame" &&
                gameState.section.mode === "battle" &&
                gameState.section.events.filter((e) => e.state === "processing")
                  .length > 0
                  ? prev.statusUpper.attack.add + 7
                  : prev.statusUpper.attack.add,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
  },
  {
    code: "rare_Coup de Grâce",
    name: {
      ja: "トドメ",
      en: "Coup de Grâce",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "攻撃対象の体力が30%以下のとき、攻撃力 50% up",
          en: "When the target's health is 30% or less, the attack power increases by 50%",
        },
        onHit: (prev, attacker, object) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attack: {
              ...prev.statusUpper.attack,
              rate:
                prev.statusUpper.attack.rate +
                (object.health / object.maxHealth <= 0.3 ? 3 : 0),
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
  },
  {
    code: "rare_Rough",
    name: {
      ja: "乱暴",
      en: "Rough",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "クリティカルでないとき、攻撃力 50% up",
          en: "When not critical, attack power 50% up",
        },
        onCalcCritical: (prev, gameState, attacker, object, criticalCount) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attack: {
              ...prev.statusUpper.attack,
              rate:
                criticalCount > 0
                  ? prev.statusUpper.attack.rate
                  : prev.statusUpper.attack.rate + 0.5,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
  },
  {
    code: "rare_Moon",
    name: {
      ja: "月",
      en: "Moon",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("critical", "add", 0.15),
      {
        type: "custom",
        description: {
          ja: "スキル「太陽」があるとき、クリティカルダメージ 30% up",
          en: "When the skill 'Sun' is present, critical damage 30% up",
        },
        passive: (prev, gameState) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            criticalDamage: {
              ...prev.statusUpper.criticalDamage,
              add: prev.player.skills.some((s) => s.code === "rare_Sun")
                ? prev.statusUpper.criticalDamage.add + 0.3
                : prev.statusUpper.criticalDamage.add,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
  },
  {
    code: "rare_Sun",
    name: {
      ja: "太陽",
      en: "Sun",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("attack", "rate", 0.15),
      {
        type: "custom",
        description: {
          ja: "スキル「月」があるとき、基礎攻撃力 10 up",
          en: "When the skill 'Moon' is present, basic attack power increases by 10",
        },
        passive: (prev, gameState) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attack: {
              ...prev.statusUpper.attack,
              add: prev.player.skills.some((s) => s.code === "rare_Moon")
                ? prev.statusUpper.attack.add + 10
                : prev.statusUpper.attack.add,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
  },
  {
    code: "rare_Mundane",
    name: {
      ja: "平凡",
      en: "Mundane",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("attack", "rate", 0.1),
      generatePassiveStatusUpEffect("critical", "add", 0.1),
      generatePassiveStatusUpEffect("attackSpeed", "rate", 0.1),
      generatePassiveStatusUpEffect("chargeEnergy", "rate", 0.1),
    ],
    demerit: false,
  },
  {
    code: "rare_Small Flask",
    name: {
      ja: "小さな水筒",
      en: "Small Flask",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("maxEnergy", "rate", 0.2),
      generatePassiveStatusUpEffect("chargeEnergy", "rate", 0.6),
    ],
    demerit: false,
  },
  {
    code: "rare_Deep Breath",
    name: {
      ja: "深呼吸",
      en: "Deep Breath",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("attack", "add", 20),
      {
        type: "custom",
        description: {
          ja: "攻撃するたび、基礎攻撃力 1 up(最大20)30秒ごとにリセットされる",
          en: "Every time you attack, the basic attack power increases by 1 (up to 20) and resets every 30 seconds",
        },
        passive: (prev, gameState, deltaTime) => {
          if (
            "time" in prev.state &&
            typeof prev.state.time === "number" &&
            "count" in prev.state &&
            typeof prev.state.count === "number"
          ) {
            return {
              state: {
                time: prev.state.time > 30 ? 0 : prev.state.time + deltaTime,
                count: prev.state.time > 30 ? 0 : prev.state.count,
              },
              statusBuffs: [],
              statusUpper: {
                ...prev.statusUpper,
                attack: {
                  ...prev.statusUpper.attack,
                  add:
                    prev.statusUpper.attack.add +
                    Math.min(20, prev.state.count),
                },
              },
            };
          }
          return {
            state: {
              time: 0,
              count: 0,
            },
            statusBuffs: [],
            statusUpper: prev.statusUpper,
          };
        },
        onHit: (prev) => {
          if (
            "time" in prev.state &&
            typeof prev.state.time === "number" &&
            "count" in prev.state &&
            typeof prev.state.count === "number"
          ) {
            return {
              state: {
                time: prev.state.time,
                count: prev.state.count < 20 ? prev.state.count + 1 : 20,
              },
              statusBuffs: [],
              statusUpper: prev.statusUpper,
            };
          }
          return {
            state: {
              time: 0,
              count: 1,
            },
            statusBuffs: [],
            statusUpper: prev.statusUpper,
          };
        },
        state: { count: 0, time: 0 },
        order: 0,
      },
    ],
    demerit: false,
  },
  {
    code: "rare_Lucky Hit",
    name: {
      ja: "ラッキーヒット",
      en: "Lucky Hit",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "攻撃時、5%の確率で基礎攻撃力 200 up",
          en: "When attacking, there is a 5% chance that the basic attack power will increase by 200",
        },
        onHit: (prev) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attack: {
              ...prev.statusUpper.attack,
              add:
                Math.random() < 0.05
                  ? prev.statusUpper.attack.add + 200
                  : prev.statusUpper.attack.add,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
  },
  {
    code: "rare_Unstable",
    name: {
      ja: "不安定",
      en: "Unstable",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "攻撃時、ランダムで基礎攻撃力 12 upするか、5 downする",
          en: "When attacking, the basic attack power increases by 12 or decreases by 5 at random",
        },
        onHit: (prev) => {
          return {
            state: {},
            statusBuffs: [],
            statusUpper: {
              ...prev.statusUpper,
              attack: {
                ...prev.statusUpper.attack,
                add:
                  Math.random() < 0.5
                    ? prev.statusUpper.attack.add + 12
                    : prev.statusUpper.attack.add - 5,
              },
            },
          };
        },
        state: {},
        order: 0,
      },
    ],
    demerit: true,
  },
  {
    code: "rare_Lost Chapter",
    name: {
      ja: "ロストチャプター",
      en: "Lost Chapter",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("attack", "rate", 0.1),
      {
        type: "custom",
        description: {
          ja: "レベルアップ後、10秒間 エネルギー回復 50% up",
          en: "After leveling up, energy recovery increases by 50% for 10 seconds",
        },
        onLevelup: (prev) => ({
          state: {
            time: 0,
          },
          statusBuffs: [
            {
              statusEffects: [
                generatePassiveStatusUpEffect("chargeEnergy", "rate", 0.5),
              ],
              duration: 10,
              source: prev.source,
            },
          ],
          statusUpper: prev.statusUpper,
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
  },
  {
    code: "rare_Advance ",
    name: {
      ja: "前借り",
      en: "Advance",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "レベルが低いほど基礎攻撃力が上がる",
          en: "The lower the level, the higher the basic attack power",
        },
        passive: (prev, gameState) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attack: {
              ...prev.statusUpper.attack,
              add:
                gameState.mode === "inGame"
                  ? prev.statusUpper.attack.add +
                    Math.max(0, 100 - gameState.playerSkillLevel * 3)
                  : prev.statusUpper.attack.add,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
  },
  {
    code: "rare_Late Bloomer",
    name: {
      ja: "大器晩成",
      en: "Late Bloomer",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "レベルが高いほどクリティカル率が上がる",
          en: "The higher the level, the higher the critical rate",
        },
        passive: (prev, gameState) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            critical: {
              ...prev.statusUpper.critical,
              add:
                gameState.mode === "inGame"
                  ? prev.statusUpper.critical.add +
                    (gameState.playerSkillLevel * 2) / 100
                  : prev.statusUpper.critical.add,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
  },
  {
    code: "rare_Gem Scope",
    name: {
      ja: "宝石のスコープ",
      en: "Gem Scope",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "船の体力が95%以上のとき、クリティカルダメージ 30% up",
          en: "When the ship's health is 95% or more, critical damage increases by 30%",
        },
        passive: (prev, gameState) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            criticalDamage: {
              ...prev.statusUpper.criticalDamage,
              add:
                gameState.mode === "inGame" &&
                gameState.ship.health / gameState.ship.maxHealth >= 0.95
                  ? prev.statusUpper.criticalDamage.add + 0.3
                  : prev.statusUpper.criticalDamage.add,
            },
          },
        }),
        state: {},
        order: 0,
      },
      {
        type: "custom",
        description: {
          ja: "船の体力が95%未満のとき、クリティカルダメージ 5% up",
          en: "When the ship's health is less than 95%, critical damage increases by 5%",
        },
        passive: (prev, gameState) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            criticalDamage: {
              ...prev.statusUpper.criticalDamage,
              add:
                gameState.mode === "inGame" &&
                gameState.ship.health / gameState.ship.maxHealth < 0.95
                  ? prev.statusUpper.criticalDamage.add + 0.05
                  : prev.statusUpper.criticalDamage.add,
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

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
    effect: [
      generatePassiveStatusUpEffect("maxEnergy", "rate", 0.5),
      generatePassiveStatusUpEffect("chargeEnergy", "rate", 0.2),
    ],
    demerit: false,
    icon: "recharge",
  },
  {
    code: "rare_AntiPlant",
    name: {
      ja: "有機物特攻",
      en: "Biological special attack",
    },
    rarity: "rare",
    effect: [generatePassiveStatusUpEffect("antiPlant", "rate", 0.4)],
    demerit: false,
    icon: "sword_anti",
  },
  {
    code: "rare_AntiMineral",
    name: {
      ja: "無機物特攻",
      en: "Inorganic special attack",
    },
    rarity: "rare",
    effect: [generatePassiveStatusUpEffect("antiMineral", "rate", 0.4)],
    demerit: false,
    icon: "sword_anti",
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
          ja: "クリティカル率アップの上限が100%になり、それ以上の上昇効果は半分の攻撃力に変換される",
          en: "The upper limit of the critical rate increase becomes 100%, and the increase effect beyond that is converted to attack power",
        },
        passive: (prev) => {
          return {
            state: {},
            statusBuffs: [],
            statusUpper: {
              ...prev.statusUpper,
              critical: {
                ...prev.statusUpper.critical,
                add: Math.min(1, prev.statusUpper.critical.add),
              },
              attack: {
                ...prev.statusUpper.attack,
                rate:
                  prev.statusUpper.attack.rate +
                  Math.max(0, prev.statusUpper.critical.add - 1) * 0.5,
              },
            },
          };
        },
        state: {},
        order: 100,
      },
    ],
    demerit: true,
    icon: "sword_crit",
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
          ja: "前回と同じターゲットを攻撃すると追加ダメージ 15",
          en: "Attacking the same target as the previous time deals an additional 15 damage",
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
              statusUpper: {
                ...prev.statusUpper,
                extraDamage: {
                  ...prev.statusUpper.extraDamage,
                  add: prev.statusUpper.extraDamage.add + 15,
                },
              },
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
    icon: "sword_enchantment",
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
          ja: "シールドが75%以上のとき、攻撃力 40% up",
          en: "When the shield is 75% or more, the attack power increases by 35%",
        },
        passive: (prev, gameState) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attack: {
              ...prev.statusUpper.attack,
              rate:
                gameState.mode === "inGame" &&
                gameState.ship.shield / gameState.ship.maxShield > 0.75
                  ? prev.statusUpper.attack.rate + 0.4
                  : prev.statusUpper.attack.rate,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
    icon: "sword_normal",
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
          ja: "5秒ごとに次の攻撃まで攻撃力 100% up",
          en: "Attack power increases by 100% until the next attack every 5 seconds",
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
                  prev.state.active || prev.state.time > 5
                    ? 0
                    : prev.state.time + deltaTime,
                active: prev.state.active || prev.state.time > 5,
              },
              statusBuffs: [],
              statusUpper: {
                ...prev.statusUpper,
                attack: {
                  ...prev.statusUpper.attack,
                  rate:
                    prev.statusUpper.attack.rate + (prev.state.active ? 1 : 0),
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
    icon: "sword_enchantment",
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
          ja: "攻撃5回ごとに、次の攻撃に追加ダメージ 70",
          en: "Every 5 attacks, the next attack deals an additional 50 damage",
        },
        passive: (prev, gameState) => ({
          state: prev.state,
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            extraDamage: {
              ...prev.statusUpper.extraDamage,
              add:
                "count" in prev.state &&
                typeof prev.state.count === "number" &&
                prev.state.count >= 5
                  ? prev.statusUpper.extraDamage.add + 70
                  : prev.statusUpper.extraDamage.add,
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
    icon: "sword_enchantment",
  },
  {
    code: "rare_AttakUp-Ex",
    name: {
      ja: "攻撃力アップ改",
      en: "AttackUp-Ex",
    },
    rarity: "rare",
    effect: [generatePassiveStatusUpEffect("attack", "rate", 0.25)],
    demerit: false,
    icon: "sword_normal",
  },
  {
    code: "rare_CriticalUp-Ex",
    name: {
      ja: "クリティカル率アップ改",
      en: "CritChanceUp-Ex",
    },
    rarity: "rare",
    effect: [generatePassiveStatusUpEffect("critical", "add", 0.25)],
    demerit: false,
    icon: "sword_crit",
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
    icon: "sword_speed",
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
    icon: "recharge",
  },
  {
    code: "rare_Confident",
    name: {
      ja: "自信過剰",
      en: "Overconfidence",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("criticalDamage", "rate", 0.3),
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
    icon: "sword_crit",
  },
  {
    code: "rare_Brutal",
    name: {
      ja: "粗暴",
      en: "Brutal",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("attack", "rate", 0.5),
      generatePassiveStatusUpEffect("critical", "add", -0.5),
    ],
    demerit: true,
    icon: "sword_normal",
  },
  {
    code: "rare_Lumberjack",
    name: {
      ja: "伐採者",
      en: "Lumberjack",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("antiPlant", "rate", 0.6),
      generatePassiveStatusUpEffect("antiMineral", "rate", -0.3),
    ],
    demerit: true,
    icon: "sword_anti",
  },
  {
    code: "rare_Miner",
    name: {
      ja: "採掘者",
      en: "Miner",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("antiMineral", "rate", 0.6),
      generatePassiveStatusUpEffect("antiPlant", "rate", -0.3),
    ],
    demerit: true,
    icon: "sword_anti",
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
          ja: "攻撃対象の体力が100%のとき、攻撃力 80% up",
          en: "When the target's health is 100%, the attack power increases by 80%",
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
                (object.health === object.maxHealth ? 0.8 : 0),
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
    icon: "sword_normal",
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
          ja: "イベント発生中、攻撃力 50% up",
          en: "During an event, the attack power increases by 50%",
        },
        passive: (prev, gameState) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attack: {
              ...prev.statusUpper.attack,
              rate:
                gameState.mode === "inGame" &&
                gameState.section.mode === "battle" &&
                gameState.section.events.filter((e) => e.state === "processing")
                  .length > 0
                  ? prev.statusUpper.attack.rate + 0.5
                  : prev.statusUpper.attack.rate,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
    icon: "sword_normal",
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
          ja: "攻撃対象の体力が50%以下のとき、攻撃力 50% up",
          en: "When the target's health is 50% or less, the attack power increases by 50%",
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
                (object.health / object.maxHealth <= 0.5 ? 0.5 : 0),
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
    icon: "sword_normal",
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
    icon: "sword_normal",
  },
  {
    code: "rare_Moon",
    name: {
      ja: "月",
      en: "Moon",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("attackSpeed", "rate", 0.2),
      {
        type: "custom",
        description: {
          ja: "スキル「太陽」があるとき、さらに攻撃速度 20% up",
          en: "When the skill 'Sun' is present, attack speed increases by 20%",
        },
        passive: (prev, gameState) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attackSpeed: {
              ...prev.statusUpper.attackSpeed,
              rate: prev.player.skills.some((s) => s.code === "rare_Sun")
                ? prev.statusUpper.attackSpeed.rate + 0.2
                : prev.statusUpper.attackSpeed.rate,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
    icon: "sword_speed",
  },
  {
    code: "rare_Sun",
    name: {
      ja: "太陽",
      en: "Sun",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("chargeEnergy", "rate", 0.2),
      {
        type: "custom",
        description: {
          ja: "スキル「月」があるとき、さらにエネルギー回復 20% up",
          en: "When the skill 'Moon' is present, energy recovery increases by 20%",
        },
        passive: (prev, gameState) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            chargeEnergy: {
              ...prev.statusUpper.chargeEnergy,
              rate: prev.player.skills.some((s) => s.code === "rare_Moon")
                ? prev.statusUpper.chargeEnergy.rate + 0.2
                : prev.statusUpper.chargeEnergy.rate,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
    icon: "recharge",
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
      generatePassiveStatusUpEffect("attackSpeed", "rate", 0.15),
      generatePassiveStatusUpEffect("chargeEnergy", "rate", 0.15),
    ],
    demerit: false,
    icon: "sword_normal",
  },
  {
    code: "rare_Small Flask",
    name: {
      ja: "小さな水筒",
      en: "Small Flask",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("maxEnergy", "rate", 0.3),
      generatePassiveStatusUpEffect("chargeEnergy", "rate", 0.3),
    ],
    demerit: false,
    icon: "recharge",
  },
  {
    code: "rare_Deep Breath",
    name: {
      ja: "深呼吸",
      en: "Deep Breath",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("attack", "rate", 0.5),
      {
        type: "custom",
        description: {
          ja: "攻撃するたび、攻撃力 5% down(最大100%)30秒ごとにリセットされる",
          en: "Every time you attack, the attack power increases by 10% (up to 200%) and resets every 30 seconds",
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
                  rate:
                    prev.statusUpper.attack.rate +
                    0.05 * Math.min(10, prev.state.count),
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
                count: prev.state.count < 10 ? prev.state.count + 1 : 20,
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
    icon: "sword_normal",
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
          ja: "攻撃時、10%の確率で追加ダメージ 100",
          en: "When attacking, there is a 10% chance of additional damage 100",
        },
        onHit: (prev) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            extraDamage: {
              ...prev.statusUpper.extraDamage,
              add:
                Math.random() < 0.1
                  ? prev.statusUpper.extraDamage.add + 100
                  : prev.statusUpper.extraDamage.add,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
    icon: "sword_enchantment",
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
          ja: "攻撃時、ランダムで攻撃力が -20% から +50% 変化する",
          en: "When attacking, the attack power changes randomly from -20% to +50%",
        },
        onHit: (prev) => {
          return {
            state: {},
            statusBuffs: [],
            statusUpper: {
              ...prev.statusUpper,
              attack: {
                ...prev.statusUpper.attack,
                rate: prev.statusUpper.attack.rate + Math.random(),
              },
            },
          };
        },
        state: {},
        order: 0,
      },
    ],
    demerit: true,
    icon: "sword_normal",
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
          ja: "レベルアップ後、10秒間 エネルギー回復 200% up",
          en: "After leveling up, energy recovery increases by 200% for 10 seconds",
        },
        onLevelup: (prev) => ({
          state: {
            time: 0,
          },
          statusBuffs: [
            {
              statusEffects: [
                generatePassiveStatusUpEffect("chargeEnergy", "rate", 2),
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
    icon: "recharge",
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
          ja: "レベルによって攻撃力が変化する。(Lv1～10: 100% up, Lv11～20: 50% up, Lv21～30: 20% up, Lv31～: 30% down)",
          en: "The attack power changes depending on the level. (Lv1-10: 100% up, Lv11-20: 50% up, Lv21-30: 20% up, Lv31-: 30% down)",
        },
        passive: (prev, gameState) => ({
          state: {},
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            attack: {
              ...prev.statusUpper.attack,
              rate:
                gameState.mode === "inGame"
                  ? prev.statusUpper.attack.rate + gameState.playerSkillLevel >
                    15
                    ? gameState.playerSkillLevel > 30
                      ? prev.statusUpper.attack.rate - 0.3
                      : gameState.playerSkillLevel > 20
                      ? prev.statusUpper.attack.rate + 0.2
                      : gameState.playerSkillLevel > 10
                      ? prev.statusUpper.attack.rate + 0.5
                      : prev.statusUpper.attack.rate + 1
                    : 1
                  : prev.statusUpper.attack.rate,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: true,
    icon: "unique",
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
          ja: "レベルが高いほどクリティカル率が上がる。(最大Lv40: 100% up)",
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
                    (gameState.playerSkillLevel * 2.5) / 100
                  : prev.statusUpper.critical.add,
            },
          },
        }),
        state: {},
        order: 0,
      },
    ],
    demerit: false,
    icon: "unique",
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
          ja: "船の体力が50%以上のとき、クリティカルダメージ 35% up",
          en: "When the ship's health is 50% or more, critical damage increases by 35%",
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
                gameState.ship.health / gameState.ship.maxHealth >= 0.5
                  ? prev.statusUpper.criticalDamage.add + 0.35
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
          ja: "船の体力が50%未満のとき、クリティカルダメージ 5% up",
          en: "When the ship's health is less than 50%, critical damage increases by 5%",
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
                gameState.ship.health / gameState.ship.maxHealth < 0.5
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
    icon: "sword_crit",
  },
  {
    code: "rare_CarryOver",
    name: {
      ja: "持ち越し",
      en: "CarryOver",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "超過ダメージを与えたとき、次の攻撃にその75%の追加ダメージ",
          en: "When you deal excess damage, the next attack deals half that additional damage",
        },
        onHit: (prev, attacker, object) => ({
          state: {
            extraDamage: 0,
          },
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            extraDamage: {
              ...prev.statusUpper.extraDamage,
              add:
                "extraDamage" in prev.state &&
                typeof prev.state.extraDamage === "number"
                  ? prev.state.extraDamage
                  : 0,
            },
          },
        }),
        onAddDamage: (prev, result) => ({
          state: {
            extraDamage:
              Math.max(0, result.overDamage - result.extraDamage) * 0.75,
          },
          statusBuffs: [],
          statusUpper: prev.statusUpper,
        }),
        state: { extraDamage: 0 },
        order: 0,
      },
    ],
    demerit: false,
    icon: "sword_enchantment",
  },
  {
    code: "rare_criticalDrive",
    name: {
      ja: "クリティカルドライブ",
      en: "Critical Drive",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("critical", "add", 0.4),
      generatePassiveStatusUpEffect("chargeEnergy", "rate", -0.15),
      generatePassiveStatusUpEffect("maxEnergy", "rate", -0.15),
    ],
    demerit: true,
    icon: "sword_crit",
  },
  {
    code: "rare_Overdrive",
    name: {
      ja: "オーバードライブ",
      en: "Overdrive",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("attack", "rate", 0.4),
      generatePassiveStatusUpEffect("chargeEnergy", "rate", -0.15),
      generatePassiveStatusUpEffect("maxEnergy", "rate", -0.15),
    ],
    demerit: true,
    icon: "sword_normal",
  },
  {
    code: "rare_Overclock",
    name: {
      ja: "オーバークロック",
      en: "Overclock",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("attackSpeed", "rate", 0.45),
      generatePassiveStatusUpEffect("chargeEnergy", "rate", 0.45),
      generatePassiveStatusUpEffect("attack", "rate", -0.1),
      generatePassiveStatusUpEffect("critical", "rate", -0.1),
    ],
    demerit: true,
    icon: "sword_speed",
  },
  {
    code: "rare_BurstDrive",
    name: {
      ja: "バーストドライブ",
      en: "Burst Drive",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("attackSpeed", "rate", 0.6),
      generatePassiveStatusUpEffect("attack", "rate", -0.1),
    ],
    demerit: true,
    icon: "sword_speed",
  },
  {
    code: "rate_Pointed",
    name: {
      ja: "尖った",
      en: "Pointed",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("attack", "rate", 0.3),
      generatePassiveStatusUpEffect("critical", "add", 0.3),
      generatePassiveStatusUpEffect("attackSpeed", "rate", -0.3),
      generatePassiveStatusUpEffect("maxEnergy", "rate", -0.3),
    ],
    demerit: true,
    icon: "sword_crit",
  },
  {
    code: "rare_CriticalCollector",
    name: {
      ja: "クリティカルコレクター",
      en: "Critical Collector",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("critical", "add", 0.1),
      {
        type: "custom",
        description: {
          ja: "クリティカルでとどめをさすたび、クリティカル率が 2% up (最大40%)",
          en: "Every time you make a critical hit, the critical rate increases by 2% (maximum 40%)",
        },
        passive: (prev) => ({
          state: prev.state,
          statusBuffs: [],
          statusUpper: {
            ...prev.statusUpper,
            critical: {
              ...prev.statusUpper.critical,
              add:
                "count" in prev.state && typeof prev.state.count === "number"
                  ? prev.statusUpper.critical.add +
                    Math.min(0.4, prev.state.count * 0.02)
                  : 0,
            },
          },
        }),
        onAddDamage: (prev, result) => ({
          state: {
            count:
              "count" in prev.state && typeof prev.state.count === "number"
                ? prev.state.count + result.criticalCount
                : 0,
          },
          statusBuffs: [],
          statusUpper: prev.statusUpper,
        }),
        state: { count: 0 },
        order: 0,
      },
    ],
    demerit: false,
    icon: "sword_crit",
  },
  {
    code: "rare_DamageCharge",
    name: {
      ja: "ダメージチャージ",
      en: "Damage Charge",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("attackSpeed", "rate", 0.15),
      {
        type: "custom",
        description: {
          ja: "攻撃対象の体力が50%以上のとき、スタックを1つ獲得。攻撃対象の体力が50%未満のとき、スタックを全て消費してスタック数×25の追加ダメージを与える",
          en: "When the target's health is 50% or more, gain a stack. When the target's health is less than 50%, consume all stacks and deal additional damage equal to the number of stacks x 10",
        },
        onHit: (prev, attacker, object) => {
          if ("stack" in prev.state && typeof prev.state.stack === "number") {
            return {
              state: {
                stack:
                  object.health / object.maxHealth >= 0.5
                    ? prev.state.stack + 1
                    : 0,
              },
              statusBuffs: [],
              statusUpper: {
                ...prev.statusUpper,
                extraDamage: {
                  ...prev.statusUpper.extraDamage,
                  add:
                    object.health / object.maxHealth < 0.5
                      ? prev.statusUpper.extraDamage.add + prev.state.stack * 10
                      : prev.statusUpper.extraDamage.add,
                },
              },
            };
          }
          return {
            state: { stack: 0 },
            statusBuffs: [],
            statusUpper: prev.statusUpper,
          };
        },
        state: { stack: 0 },
        order: 0,
      },
    ],
    demerit: false,
    icon: "sword_enchantment",
  },
  {
    code: "rare_CriticalCycle",
    name: {
      ja: "クリティカルサイクル",
      en: "Critical Cycle",
    },

    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("critical", "add", 0.1),
      {
        type: "custom",
        description: {
          ja: "3回に1度、クリティカル率が 60% up",
          en: "Once every 3 times, the critical rate increases by 60%",
        },
        onHit: (prev) => {
          if ("count" in prev.state && typeof prev.state.count === "number") {
            return {
              state: {
                count: prev.state.count >= 3 ? 0 : prev.state.count + 1,
              },
              statusBuffs: [],
              statusUpper: {
                ...prev.statusUpper,
                critical: {
                  ...prev.statusUpper.critical,
                  add:
                    prev.state.count >= 3
                      ? prev.statusUpper.critical.add + 1
                      : prev.statusUpper.critical.add,
                },
              },
            };
          }
          return {
            state: { count: 1 },
            statusBuffs: [],
            statusUpper: prev.statusUpper,
          };
        },
        state: { count: 0 },
        order: 0,
      },
    ],
    demerit: false,
    icon: "sword_crit",
  },
  {
    code: "rare_Hardened",
    name: {
      ja: "鍛え上げ",
      en: "Hardened",
    },
    rarity: "rare",
    effect: [
      generatePassiveStatusUpEffect("attack", "add", 3),
      generatePassiveStatusUpEffect("attackSpeed", "add", 0.3),
      generatePassiveStatusUpEffect("chargeEnergy", "add", 0.3),
    ],
    demerit: false,
    icon: "sword_normal",
  },
  {
    code: "rare_SwitchShot",
    name: {
      ja: "スイッチショット",
      en: "Switch Shot",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "前回と違うターゲットを攻撃するとき 攻撃力 40 % up",
          en: "When attacking a different target from the previous one, the attack power increases by 40%",
        },
        onHit: (prev, attacker, target) => {
          if (
            "lastTargetId" in prev.state &&
            prev.state["lastTargetId"] !== target.id
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
              statusUpper: {
                ...prev.statusUpper,
                attack: {
                  ...prev.statusUpper.attack,
                  rate: prev.statusUpper.attack.rate + 0.4,
                },
              },
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
    icon: "sword_normal",
  },
  {
    code: "rare_SwitchBurst",
    name: {
      ja: "スイッチバースト",
      en: "Switch Burst",
    },
    rarity: "rare",
    effect: [
      {
        type: "custom",
        description: {
          ja: "前回と違うターゲットを攻撃するとき クリティカル率 40 % up",
          en: "When attacking a different target from the previous one, the critical rate increases by 40%",
        },
        onHit: (prev, attacker, target) => {
          if (
            "lastTargetId" in prev.state &&
            prev.state["lastTargetId"] !== target.id
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
              statusUpper: {
                ...prev.statusUpper,
                critical: {
                  ...prev.statusUpper.critical,
                  add: prev.statusUpper.critical.add + 0.4,
                },
              },
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
    icon: "sword_crit",
  },
];

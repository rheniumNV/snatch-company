import { createNoise2D } from "simplex-noise";
import { Vector, getDpsSample, getRandom } from "./util";
import { v4 as uuidv4 } from "uuid";
import {
  Announcement,
  Callbacks,
  EffectSource,
  GameState,
  SnatchCompanyObject,
  Player,
  Skill,
  Status,
  StatusBuff,
  StatusEffect,
  StatusUpper,
} from "./type";
import { commonSkills } from "./skill/commonSkill";
import { rareSkills } from "./skill/rareSkills";
import { epicSkills } from "./skill/epicSkills";
import { BirdStrike } from "./event/birdStrike";
import { SnatchCompanyEvent } from "./event/snatchCompanyEvent";
import { MeteoriteFall } from "./event/meteoriteFall";
import { SharkAttack } from "./event/sharkAttack";
import { BombTrap } from "./event/bombTrap";
import { TreasureChest } from "./event/treasureChest";

const newStatusUpper = (): StatusUpper => ({
  attack: { rate: 0, add: 0 },
  critical: { rate: 0, add: 0 },
  criticalDamage: { rate: 0, add: 0 },
  attackSpeed: { rate: 0, add: 0 },
  maxEnergy: { rate: 0, add: 0 },
  chargeEnergy: { rate: 0, add: 0 },
  moveSpeed: { rate: 0, add: 0 },
  antiPlant: { rate: 0, add: 0 },
  antiMineral: { rate: 0, add: 0 },
});

const newStatus = (): Status => ({
  attack: 30,
  critical: 0,
  criticalDamage: 0,
  attackSpeed: 2,
  maxEnergy: 60,
  chargeEnergy: 10,
  moveSpeed: 1,
  antiPlant: 1,
  antiMineral: 1,
});

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const clampStatusUpper = (statusUpper: StatusUpper): StatusUpper => ({
  attack: {
    rate: clamp(statusUpper.attack.rate, -0.8, 10),
    add: clamp(statusUpper.attack.add, -90, 1000),
  },
  critical: {
    rate: clamp(statusUpper.critical.rate, -0.8, 10),
    add: clamp(statusUpper.critical.add, -0.5, 10),
  },
  criticalDamage: {
    rate: clamp(statusUpper.criticalDamage.rate, -0.8, 10),
    add: clamp(statusUpper.criticalDamage.add, -0.5, 10),
  },
  attackSpeed: {
    rate: clamp(statusUpper.attackSpeed.rate, -0.8, 10),
    add: clamp(statusUpper.attackSpeed.add, -2, 30),
  },
  maxEnergy: {
    rate: clamp(statusUpper.maxEnergy.rate, -0.8, 10),
    add: clamp(statusUpper.maxEnergy.add, -1000, 1000),
  },
  chargeEnergy: {
    rate: clamp(statusUpper.chargeEnergy.rate, -0.8, 10),
    add: clamp(statusUpper.chargeEnergy.add, -1000, 1000),
  },
  moveSpeed: {
    rate: clamp(statusUpper.moveSpeed.rate, -0.8, 10),
    add: clamp(statusUpper.moveSpeed.add, -1000, 1000),
  },
  antiPlant: {
    rate: clamp(statusUpper.antiPlant.rate, -0.8, 10),
    add: clamp(statusUpper.antiPlant.add, -0.9, 10),
  },
  antiMineral: {
    rate: clamp(statusUpper.antiMineral.rate, -0.8, 10),
    add: clamp(statusUpper.antiMineral.add, -0.9, 10),
  },
});

const clampStatus = (status: Status): Status => ({
  attack: clamp(status.attack, 1, 1000),
  critical: clamp(status.critical, 0, 10),
  criticalDamage: clamp(status.criticalDamage, 0, 10),
  attackSpeed: clamp(status.attackSpeed, 0.05, 40),
  maxEnergy: clamp(status.maxEnergy, 10, 1000),
  chargeEnergy: clamp(status.chargeEnergy, 0.1, 1000),
  moveSpeed: clamp(status.moveSpeed, 0.05, 10),
  antiPlant: clamp(status.antiPlant, 0.05, 10),
  antiMineral: clamp(status.antiMineral, 0.1, 10),
});

const finalizeStatus = (
  status: Status,
  statusUppers: StatusUpper[]
): Status => {
  const clampedStatusUppers = statusUppers.map((statusUpper) =>
    clampStatusUpper(statusUpper)
  );
  return clampStatus({
    attack:
      (status.attack +
        clampedStatusUppers.reduce((acc, cur) => acc + cur.attack.add, 0)) *
      (1 + clampedStatusUppers.reduce((acc, cur) => acc + cur.attack.rate, 0)),
    critical:
      (status.critical +
        clampedStatusUppers.reduce((acc, cur) => acc + cur.critical.add, 0)) *
      (1 +
        clampedStatusUppers.reduce((acc, cur) => acc + cur.critical.rate, 0)),
    criticalDamage:
      (status.criticalDamage +
        clampedStatusUppers.reduce(
          (acc, cur) => acc + cur.criticalDamage.add,
          0
        )) *
      (1 +
        clampedStatusUppers.reduce(
          (acc, cur) => acc + cur.criticalDamage.rate,
          0
        )),
    attackSpeed:
      (status.attackSpeed +
        clampedStatusUppers.reduce(
          (acc, cur) => acc + cur.attackSpeed.add,
          0
        )) *
      (1 +
        clampedStatusUppers.reduce(
          (acc, cur) => acc + cur.attackSpeed.rate,
          0
        )),
    maxEnergy:
      (status.maxEnergy +
        clampedStatusUppers.reduce((acc, cur) => acc + cur.maxEnergy.add, 0)) *
      (1 +
        clampedStatusUppers.reduce((acc, cur) => acc + cur.maxEnergy.rate, 0)),
    chargeEnergy:
      (status.chargeEnergy +
        clampedStatusUppers.reduce(
          (acc, cur) => acc + cur.chargeEnergy.add,
          0
        )) *
      (1 +
        clampedStatusUppers.reduce(
          (acc, cur) => acc + cur.chargeEnergy.rate,
          0
        )),
    moveSpeed:
      (status.moveSpeed +
        clampedStatusUppers.reduce((acc, cur) => acc + cur.moveSpeed.add, 0)) *
      (1 +
        clampedStatusUppers.reduce((acc, cur) => acc + cur.moveSpeed.rate, 0)),
    antiPlant:
      (status.antiPlant +
        clampedStatusUppers.reduce((acc, cur) => acc + cur.antiPlant.add, 0)) *
      (1 +
        clampedStatusUppers.reduce((acc, cur) => acc + cur.antiPlant.rate, 0)),
    antiMineral:
      (status.antiMineral +
        clampedStatusUppers.reduce(
          (acc, cur) => acc + cur.antiMineral.add,
          0
        )) *
      (1 +
        clampedStatusUppers.reduce(
          (acc, cur) => acc + cur.antiMineral.rate,
          0
        )),
  });
};

const battleEvents: ((triggerTime: number) => SnatchCompanyEvent)[] = [
  (triggerTime: number) => new BirdStrike(triggerTime),
  (triggerTime: number) => new MeteoriteFall(triggerTime),
  (triggerTime: number) => new SharkAttack(triggerTime),
  (triggerTime: number) => new BombTrap(triggerTime),
];

const subEvents: ((triggerTime: number) => SnatchCompanyEvent)[] = [
  (triggerTime: number) => new TreasureChest(triggerTime),
];

export const newPlayer = (id: string): Player => ({
  id: id,
  name: id,
  skills: [],
  baseStatus: newStatus(),
  passiveStatusUpper: newStatusUpper(),
  finalStatus: newStatus(),
  statusBuffs: [],
});

const noise2D = createNoise2D();
const solvePoint = (x: number, z: number) => (noise2D(x / 5, z / 5) + 1) / 2;

export class SnatchCompany {
  gameState: GameState;
  private callbacks: Callbacks = {};

  constructor() {
    this.gameState = {
      mode: "lobby",
      players: [],
    };
    // this.addPlayer("U-rhenium");
    // this.startGame();
  }

  setCallback(callbacks: Callbacks) {
    this.callbacks = {
      onAttack2Object: [
        ...(this.callbacks.onAttack2Object ?? []),
        ...(callbacks.onAttack2Object ?? []),
      ],
      levelup: [
        ...(this.callbacks.levelup ?? []),
        ...(callbacks.levelup ?? []),
      ],
      onAnnouncement: [
        ...(this.callbacks.onAnnouncement ?? []),
        ...(callbacks.onAnnouncement ?? []),
      ],
    };
  }

  clearCallback(ref: Function) {
    this.callbacks = {
      onAttack2Object: this.callbacks.onAttack2Object?.filter(
        (callback) => callback !== ref
      ),
      levelup: this.callbacks.levelup?.filter((callback) => callback !== ref),
      onAnnouncement: this.callbacks.onAnnouncement?.filter(
        (callback) => callback !== ref
      ),
    };
  }

  addPlayer(playerId: string) {
    const player = newPlayer(playerId);
    if (!this.gameState.players.map(({ id }) => id).includes(player.id)) {
      if (this.gameState.mode === "inGame") {
        player.skills = Array.from(
          { length: this.gameState.playerSkillLevel - 1 },
          () => ({
            ...commonSkills[Math.floor(Math.random() * commonSkills.length)],
            id: uuidv4(),
          })
        );
      }
      this.gameState.players.push(player);
      return true;
    }
    return false;
  }

  removePlayer(player: Player) {
    this.gameState.players = this.gameState.players.filter(
      (p) => p.id !== player.id
    );
    if (this.gameState.players.length === 0) {
      this.gameState.mode = "lobby";
    }
  }

  private static getRandomBattleEvents(): SnatchCompanyEvent[] {
    const event1 = getRandom(battleEvents);
    const event2 = getRandom(battleEvents.filter((event) => event !== event1));
    const event3 = getRandom(
      battleEvents.filter((event) => event !== event1 && event !== event2)
    );
    return [event1?.(30), event2?.(90), event3?.(150)].filter(
      (e) => e
    ) as SnatchCompanyEvent[];
  }

  private static getRandomSubEvents(): SnatchCompanyEvent[] {
    const event1 = getRandom(subEvents);
    const event2 = getRandom(subEvents.filter((event) => event !== event1));
    const event3 = getRandom(
      subEvents.filter((event) => event !== event1 && event !== event2)
    );
    return [event1?.(60), event2?.(120), event3?.(180)].filter(
      (e) => e
    ) as SnatchCompanyEvent[];
  }

  startGame() {
    if (this.gameState.mode === "lobby") {
      if (this.gameState.players.length > 0) {
        const angle = Math.PI / 2; //(Math.random() * Math.PI) / 2 + Math.PI / 4;
        const targetPoint: Vector.Vector3 = [
          Math.cos(angle) * 210 * 3,
          0,
          Math.sin(angle) * 210 * 3,
        ];

        this.gameState = {
          mode: "inGame",
          section: {
            mode: "battle",
            level: 1,
            targetPoint,
            objects: Array.from({ length: 300 }, () => {
              const type = Math.random() > 0.5 ? "plant" : "mineral";
              const position: Vector.Vector3 = Vector.add(
                Vector.mul(
                  Vector.normalize(Vector.sub(targetPoint, [0, 0, 0])),
                  Vector.distance(targetPoint, [0, 0, 0]) * Math.random()
                ),
                [Math.random() * 100 - 50, 0, Math.random() * 100 - 50]
              );
              position[1] = solvePoint(position[0], position[2]) - 8;
              return {
                id: uuidv4(),
                type,
                position,
                rotation: [0, 0, 0, 0],
                health: 200,
                maxHealth: 200,
                reward:
                  type === "plant"
                    ? [
                        { type: "exp", value: 0.03, damageReturn: true },
                        { type: "shield", value: 20, damageReturn: true },
                      ]
                    : [{ type: "exp", value: 0.2, damageReturn: true }],
              };
            }),
            events: SnatchCompany.getRandomBattleEvents(),
            subEvents: SnatchCompany.getRandomSubEvents(),
            time: 0,
          },
          ship: {
            health: 300,
            maxHealth: 300,
            position: [0, 0, 0],
            speed: 3,
            shield: 30,
            maxShield: 200,
          },
          players: this.gameState.players.map((player) => {
            return {
              ...player,
              statusBuffs: [],
              skills: [],
              baseStatus: newStatus(),
              finalStatus: newStatus(),
            };
          }),
          resource: {
            exp: 0,
            nextLevelupExp: SnatchCompany.solveNextLevelupExp(1),
          },
          playerSkillLevel: 1,
        };
        setTimeout(() => {
          this.callbacks.onAnnouncement?.forEach((callback) =>
            callback({
              title: {
                ja: "ミッション開始",
                en: "Mission Start",
              },
              description: {
                ja: "船を守りながら強くなれ\n\n石を破壊すると経験値獲得\n木を破壊するとシールド獲得",
                en: "Get stronger while protecting the ship\n\nDestroying rocks gives exp\nDestroying trees gives shield",
              },
              duration: 7,
            })
          );
        }, 500);
      }
    }
  }

  startNextSection() {
    if (
      this.gameState.mode === "inGame" &&
      this.gameState.section.mode === "checkpoint"
    ) {
      const angle = Math.PI / 2; //(Math.random() * Math.PI) / 2 + Math.PI / 4;
      const shipPosition = this.gameState.ship.position;
      const targetPoint: Vector.Vector3 = Vector.add(shipPosition, [
        Math.cos(angle) * 240 * 3,
        0,
        Math.sin(angle) * 240 * 3,
      ]);
      const level = this.gameState.section.nextSectionLevel;
      this.gameState.section = {
        mode: "battle",
        level,
        targetPoint,
        objects: Array.from({ length: 300 }, () => {
          const type = Math.random() > 0.5 ? "plant" : "mineral";
          const position: Vector.Vector3 = Vector.add(
            Vector.add(
              Vector.mul(
                Vector.normalize(Vector.sub(targetPoint, shipPosition)),
                Vector.distance(targetPoint, shipPosition) * Math.random()
              ),
              [Math.random() * 100 - 50, 0, Math.random() * 100 - 50]
            ),
            shipPosition
          );
          position[1] = solvePoint(position[0], position[2]) - 8;
          return {
            id: uuidv4(),
            type,
            position,
            rotation: [0, 0, 0, 0],
            health: 300 + getDpsSample(level, 30) * 3,
            maxHealth: 300 + getDpsSample(level, 30) * 3,
            reward:
              type === "plant"
                ? [
                    { type: "exp", value: 0.03, damageReturn: true },
                    { type: "shield", value: 20, damageReturn: true },
                  ]
                : [{ type: "exp", value: 0.2, damageReturn: true }],
          };
        }),
        events: SnatchCompany.getRandomBattleEvents(),
        subEvents: SnatchCompany.getRandomSubEvents(),
        time: 0,
      };
    }
  }

  resetGame() {
    this.gameState = {
      mode: "lobby",
      players: this.gameState.players,
    };
  }

  damage2Ship(damage: number) {
    if (this.gameState.mode === "inGame") {
      const shieldDamage = Math.min(
        this.gameState.ship.shield,
        Math.max(0, damage)
      );
      const healthDamage = Math.max(0, damage - shieldDamage);
      this.gameState.ship.shield -= Math.max(
        0,
        Math.min(this.gameState.ship.maxShield, shieldDamage)
      );
      this.gameState.ship.health -= Math.max(
        0,
        Math.min(this.gameState.ship.maxHealth, healthDamage)
      );
    }
  }

  private addShield(value: number) {
    if (this.gameState.mode === "inGame") {
      value =
        value / (1 + Math.max(0, this.gameState.players.length - 1) * 0.7);
      this.gameState.ship.shield = Math.max(
        Math.min(
          this.gameState.ship.maxShield,
          this.gameState.ship.shield + value
        ),
        0
      );
    }
  }

  private addExp(value: number) {
    if (this.gameState.mode === "inGame") {
      value = value / Math.max(this.gameState.players.length * 0.7, 1);
      this.gameState.resource.exp = Math.max(
        0,
        this.gameState.resource.exp + value
      );
      if (
        this.gameState.resource.exp >= this.gameState.resource.nextLevelupExp
      ) {
        this.gameState.players.forEach((player) => {
          const commonSkill =
            commonSkills[Math.floor(Math.random() * commonSkills.length)];
          this.addSkill(player.id, commonSkill);
        });
        const level = this.gameState.playerSkillLevel + 1;
        this.gameState.playerSkillLevel = level;
        this.gameState.resource.exp -= this.gameState.resource.nextLevelupExp;
        this.gameState.resource.nextLevelupExp =
          SnatchCompany.solveNextLevelupExp(level);
        this.callbacks.levelup?.forEach((callback) =>
          callback({ level: level })
        );

        this.gameState.players.forEach((player) => {
          const onLevelupResult = SnatchCompany.StatusCheck(
            this.gameState,
            player,
            { type: "onLevelup", level },
            []
          );
          player.finalStatus = onLevelupResult.finalStatus;
          player.statusBuffs.push(...onLevelupResult.newStatusBuffs);
        });
      }
    }
  }

  private static solveNextLevelupExp(playerSkillLevel: number) {
    return 10 + (playerSkillLevel / 2) ** 2 * 20;
  }

  private static getRandomSkill(
    reality: ("normal" | "rare" | "epic")[],
    allowDemerit: boolean,
    excludeSkillCodes: string[] = []
  ): Skill | undefined {
    const skills = [...commonSkills, ...rareSkills, ...epicSkills].filter(
      (skill) =>
        !excludeSkillCodes.includes(skill.code) &&
        (!skill.demerit || allowDemerit) &&
        reality.includes(skill.rarity)
    );
    return skills[Math.floor(Math.random() * skills.length)];
  }

  private addSkill4Event() {
    if (this.gameState.mode === "inGame") {
      this.gameState.players.forEach((player) => {
        const skill = SnatchCompany.getRandomSkill(
          ["rare", "epic"],
          false,
          player.skills.filter((s) => s.rarity === "epic").map((s) => s.code)
        );
        if (skill) {
          this.addSkill(player.id, skill);
        }
      });
    }
  }

  private addSkill(playerId: string, skill: Skill) {
    if (this.gameState.mode === "inGame") {
      const player = this.gameState.players.find((p) => p.id === playerId);
      if (player) {
        const newSkill = { ...skill, id: uuidv4() };
        player.skills.push(newSkill);
      }
    }
  }

  private static StatusCheck(
    gameState: GameState,
    player: Readonly<Player>,
    option:
      | { type: "passive"; deltaTime: number }
      | { type: "onHit"; object: Readonly<SnatchCompanyObject> }
      | {
          type: "onCalcCritical";
          attacker: Readonly<Player>;
          object: Readonly<SnatchCompanyObject>;
          criticalCount: number;
        }
      | {
          type: "onAddDamage";
          result: {
            attacker: Readonly<Player>;
            object: Readonly<SnatchCompanyObject>;
            damage: number;
            overDamage: number;
            criticalCount: number;
            hitPoint: Vector.Vector3;
            destroyed: boolean;
          };
        }
      | {
          type: "onLevelup";
          level: number;
        },
    extraStatusUppers: StatusUpper[]
  ): {
    statusUpper: StatusUpper;
    newStatusBuffs: StatusBuff[];
    finalStatus: Status;
  } {
    const statusEffects = [
      ...player.skills.flatMap((skill) =>
        skill.effect.map(
          (
            e
          ): {
            effect: StatusEffect<object>;
            source: EffectSource;
          } => ({
            effect: e,
            source: { type: "skill", skill },
          })
        )
      ),
      ...player.statusBuffs.flatMap((buff) =>
        buff.statusEffects.map(
          (
            e
          ): {
            effect: StatusEffect<object>;
            source: EffectSource;
          } => ({
            effect: e,
            source: { type: "buff", buff },
          })
        )
      ),
    ].sort((a, b) => a.effect.order - b.effect.order);

    let statusUpper: StatusUpper = newStatusUpper();
    const newStatusBuffs: StatusBuff[] = [];

    statusEffects.forEach(({ effect, source }) => {
      switch (option.type) {
        case "passive": {
          if (effect.passive === undefined) return;
          const result = effect.passive(
            {
              source: source,
              state: effect.state,
              statusUpper,
              statusBuffs: player.statusBuffs,
              player,
            },
            gameState,
            option.deltaTime
          );
          effect.state = result.state;
          result.statusBuffs.forEach((buff) => {
            newStatusBuffs.push(buff);
          });
          statusUpper = result.statusUpper;
          break;
        }
        case "onHit": {
          if (effect.onHit === undefined) return;
          const result = effect.onHit(
            {
              source: source,
              state: effect.state,
              statusUpper,
              statusBuffs: player.statusBuffs,
            },
            player,
            option.object
          );
          effect.state = result.state;
          result.statusBuffs.forEach((buff) => {
            newStatusBuffs.push(buff);
          });
          statusUpper = result.statusUpper;
          break;
        }
        case "onCalcCritical": {
          if (effect.onCalcCritical === undefined) return;
          const result = effect.onCalcCritical(
            {
              source: source,
              state: effect.state,
              statusUpper,
              statusBuffs: player.statusBuffs,
            },
            gameState,
            option.attacker,
            option.object,
            option.criticalCount
          );
          effect.state = result.state;
          result.statusBuffs.forEach((buff) => {
            newStatusBuffs.push(buff);
          });
          statusUpper = result.statusUpper;
          break;
        }
        case "onAddDamage": {
          if (effect.onAddDamage === undefined) return;
          const result = effect.onAddDamage(
            {
              source: source,
              state: effect.state,
              statusUpper,
              statusBuffs: player.statusBuffs,
            },
            option.result
          );
          effect.state = result.state;
          result.statusBuffs.forEach((buff) => {
            newStatusBuffs.push(buff);
          });
          statusUpper = result.statusUpper;
          break;
        }
        case "onLevelup": {
          if (effect.onLevelup === undefined) return;
          const result = effect.onLevelup(
            {
              source: source,
              state: effect.state,
              statusUpper,
              statusBuffs: player.statusBuffs,
            },
            option.level
          );
          effect.state = result.state;
          result.statusBuffs.forEach((buff) => {
            newStatusBuffs.push(buff);
          });
          statusUpper = result.statusUpper;
          break;
        }
      }
    });

    return {
      statusUpper,
      newStatusBuffs,
      finalStatus: finalizeStatus(player.baseStatus, [
        ...(option.type === "passive"
          ? [statusUpper]
          : [player.passiveStatusUpper, statusUpper]),
        ...extraStatusUppers,
      ]),
    };
  }

  attack2Object(
    playerId: string,
    objectId: string,
    hitPoint: Vector.Vector3
  ): { damage: number; criticalCount: number } | null {
    if (
      this.gameState.mode === "inGame" &&
      this.gameState.section.mode === "battle"
    ) {
      const object = [
        ...this.gameState.section.objects,
        ...this.gameState.section.events.flatMap((event) => event.objects),
        ...this.gameState.section.subEvents.flatMap((event) => event.objects),
      ].find((o) => o.id === objectId);
      const player = this.gameState.players.find((p) => p.id === playerId);

      if (object && player && object.health > 0) {
        const onHitResult = SnatchCompany.StatusCheck(
          this.gameState,
          player,
          {
            type: "onHit",
            object,
          },
          []
        );
        player.finalStatus = onHitResult.finalStatus;
        player.statusBuffs.push(...onHitResult.newStatusBuffs);

        const criticalCount =
          Math.floor(player.finalStatus.critical / 1) +
          (Math.random() < player.finalStatus.critical % 1 ? 1 : 0);

        const onCalcCriticalResult = SnatchCompany.StatusCheck(
          this.gameState,
          player,
          {
            type: "onCalcCritical",
            attacker: player,
            object,
            criticalCount,
          },
          [onHitResult.statusUpper]
        );
        player.finalStatus = onCalcCriticalResult.finalStatus;
        player.statusBuffs.push(...onCalcCriticalResult.newStatusBuffs);

        const damage =
          player.finalStatus.attack *
          (1 + criticalCount * (0.5 + player.finalStatus.criticalDamage)) *
          (object.type === "plant"
            ? player.finalStatus.antiPlant
            : player.finalStatus.antiMineral);

        const resultDamage = Math.min(damage, object.health);
        const overDamage = damage - resultDamage;
        object.health = Math.max(0, object.health - damage);

        object.reward.forEach((reward) => {
          if (reward.damageReturn) {
            switch (reward.type) {
              case "exp":
                this.addExp(((reward.value * resultDamage) / 3) * 2);
                break;
              case "shield":
                this.addShield(
                  ((reward.value * resultDamage) / object.maxHealth / 3) * 2
                );
                break;
            }
          }
        });

        if (object.health === 0) {
          this.gameState.section.objects =
            this.gameState.section.objects.filter((o) => o.id !== objectId);

          object.reward.forEach((reward) => {
            switch (reward.type) {
              case "exp":
                this.addExp(
                  (reward.value * object.maxHealth) /
                    (reward.damageReturn ? 3 : 1)
                );
                break;
              case "shield":
                this.addShield(reward.value / (reward.damageReturn ? 3 : 1));
                break;
            }
          });
        }

        const onAddDamageResult = SnatchCompany.StatusCheck(
          this.gameState,
          player,
          {
            type: "onAddDamage",
            result: {
              attacker: player,
              object,
              damage: resultDamage,
              overDamage,
              criticalCount,
              hitPoint,
              destroyed: object.health === 0,
            },
          },
          []
        );
        player.finalStatus = onAddDamageResult.finalStatus;
        player.statusBuffs.push(...onAddDamageResult.newStatusBuffs);

        const passiveResult = SnatchCompany.StatusCheck(
          this.gameState,
          player,
          { type: "passive", deltaTime: 0 },
          []
        );
        player.passiveStatusUpper = passiveResult.statusUpper;
        player.finalStatus = passiveResult.finalStatus;
        player.statusBuffs.push(...passiveResult.newStatusBuffs);

        this.callbacks.onAttack2Object?.forEach((callback) =>
          callback({
            attacker: player,
            object,
            damage: resultDamage,
            overDamage,
            criticalCount,
            hitPoint,
            destroyed: object.health === 0,
          })
        );
        return { damage: resultDamage, criticalCount };
      }
    }
    return null;
  }

  selectSkillInCheckpoint(playerId: string, index1: number, index2: number) {
    if (
      this.gameState.mode === "inGame" &&
      this.gameState.section.mode === "checkpoint"
    ) {
      const skill =
        this.gameState.section.skillSelection[playerId]?.[index1]?.skills?.[
          index2
        ];
      const player = this.gameState.players.find((p) => p.id === playerId);
      if (skill && player) {
        this.addSkill(playerId, skill);
        this.gameState.section.skillSelection[playerId] = [
          ...this.gameState.section.skillSelection[playerId].slice(0, index1),
          ...this.gameState.section.skillSelection[playerId].slice(index1 + 1),
        ];
        const passiveResult = SnatchCompany.StatusCheck(
          this.gameState,
          player,
          {
            type: "passive",
            deltaTime: 0,
          },
          []
        );
        player.finalStatus = passiveResult.finalStatus;
        player.passiveStatusUpper = passiveResult.statusUpper;
        player.statusBuffs.push(...passiveResult.newStatusBuffs);
      }
    }
  }

  private announcement(announcement: Announcement) {
    this.callbacks.onAnnouncement?.forEach((callback) =>
      callback(announcement)
    );
  }

  updateGame(deltaTime: number) {
    if (
      this.gameState.mode === "inGame" &&
      this.gameState.section.mode === "battle"
    ) {
      this.gameState.section.time += deltaTime;
      const time = this.gameState.section.time;

      // プレイヤーのステータス効果を更新
      this.gameState.players.forEach((player) => {
        const passiveResult = SnatchCompany.StatusCheck(
          this.gameState,
          player,
          { type: "passive", deltaTime },
          []
        );

        player.passiveStatusUpper = passiveResult.statusUpper;

        player.statusBuffs = player.statusBuffs
          .map((effect) => {
            effect.duration -= deltaTime;
            return effect;
          })
          .filter((effect) => effect.duration > 0);

        player.statusBuffs.push(...passiveResult.newStatusBuffs);
        player.finalStatus = finalizeStatus(player.baseStatus, [
          player.passiveStatusUpper,
        ]);
      });

      // イベント処理
      [
        ...this.gameState.section.events.map((event) => ({
          event,
          type: "battle",
        })),
        ...this.gameState.section.subEvents.map((event) => ({
          event,
          type: "sub",
        })),
      ].forEach(({ event, type }) => {
        if (
          this.gameState.mode === "inGame" &&
          this.gameState.section.mode === "battle"
        ) {
          if (time >= event.triggerTime && event.state === "pending") {
            if (type === "battle") {
              this.callbacks.onAnnouncement?.forEach((callback) =>
                callback({
                  title: event.title,
                  description: event.description,
                  duration: 3,
                })
              );
            }
            event.start({ ...this.gameState, section: this.gameState.section });
          }
          if (event.state === "processing") {
            event.update(
              {
                gameState: {
                  ...this.gameState,
                  section: this.gameState.section,
                },
                damage2Ship: this.damage2Ship.bind(this),
                addSkill4Event: this.addSkill4Event.bind(this),
                announcement: this.announcement.bind(this),
              },
              deltaTime
            );
          }
        }
      });

      // 船を目標値に向かって進める
      this.gameState.ship.position = Vector.add(
        this.gameState.ship.position,
        Vector.mul(
          Vector.normalize(
            Vector.sub(
              this.gameState.section.targetPoint,
              this.gameState.ship.position
            )
          ),
          deltaTime * this.gameState.ship.speed
        )
      );

      // 船の体力を減らす
      const shipDamage =
        deltaTime *
        (this.gameState.section.level === 1
          ? 0.7
          : this.gameState.section.level === 2
          ? 1
          : this.gameState.section.level === 3
          ? 1.4
          : 2);
      this.damage2Ship(shipDamage);

      // 船が目標値に到達したら
      if (
        Vector.distance(
          this.gameState.ship.position,
          this.gameState.section.targetPoint
        ) < 1
      ) {
        // 最終セクションだったらリザルト画面に遷移
        if (this.gameState.section.level === 4) {
          this.gameState = {
            mode: "result",
            players: this.gameState.players,
          };
          return;
        }
        // チェックポイントに遷移
        const nextSectionLevel = this.gameState.section.level + 1;
        this.gameState.section = {
          mode: "checkpoint",
          nextSectionLevel,
          skillSelection: this.gameState.players.reduce((acc, player) => {
            const excludeSkillCodes = player.skills
              .filter((skill) => skill.rarity === "epic")
              .map((skill) => skill.code);
            return {
              ...acc,
              [player.id]: Array.from({ length: 2 }, (_, k) => k).map(
                (index) => {
                  const skillSelection: Skill[] = [];
                  for (let i = 0; i < 3; i++) {
                    const skill = SnatchCompany.getRandomSkill(
                      nextSectionLevel === 2 && index === 0 && i < 2
                        ? ["epic"]
                        : ["epic", "rare"],
                      true,
                      excludeSkillCodes
                    );
                    if (skill) {
                      skillSelection.push(skill);
                      excludeSkillCodes.push(skill.code);
                    }
                  }
                  return { skills: skillSelection };
                }
              ),
            };
          }, {}),
        };
        this.gameState.players.forEach((player) => {
          player.statusBuffs = [];
        });
        return;
      }

      // 船の体力が0になったらリザルト画面に遷移
      if (this.gameState.ship.health <= 0) {
        this.gameState = {
          mode: "result",
          players: this.gameState.players,
        };
        return;
      }
    }
  }
}

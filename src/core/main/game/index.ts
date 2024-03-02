import fs from "fs";
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
  PlayerScore,
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
import { PeachRiver } from "./event/peachRiver";
import { BossEvent } from "./event/bossEvent";
import { ShootingStar } from "./event/ShootingStar";
import { MissileRain } from "./event/missileRain";

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
  extraDamage: { rate: 0, add: 0 },
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
  extraDamage: 0,
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
  extraDamage: {
    rate: clamp(statusUpper.extraDamage.rate, 0, 10),
    add: clamp(statusUpper.extraDamage.add, -1000, 1000),
  },
});

const clampStatus = (status: Status): Status => ({
  attack: clamp(status.attack, 1, 10000),
  critical: clamp(status.critical, 0, 10),
  criticalDamage: clamp(status.criticalDamage, 0, 10),
  attackSpeed: clamp(status.attackSpeed, 0.05, 40),
  maxEnergy: clamp(status.maxEnergy, 10, 1000),
  chargeEnergy: clamp(status.chargeEnergy, 0.1, 1000),
  moveSpeed: clamp(status.moveSpeed, 0.05, 10),
  antiPlant: clamp(status.antiPlant, 0.05, 10),
  antiMineral: clamp(status.antiMineral, 0.1, 10),
  extraDamage: clamp(status.extraDamage, -10000, 10000),
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
    extraDamage:
      (status.extraDamage +
        clampedStatusUppers.reduce(
          (acc, cur) => acc + cur.extraDamage.add,
          0
        )) *
      (1 +
        clampedStatusUppers.reduce(
          (acc, cur) => acc + cur.extraDamage.rate,
          0
        )),
  });
};

const battleEvents: ((
  triggerTime: number,
  solvePoint: (x: number, z: number) => number
) => SnatchCompanyEvent)[] = [
  (triggerTime: number, solvePoint: (x: number, z: number) => number) =>
    new BirdStrike(triggerTime, solvePoint),
  (triggerTime: number, solvePoint: (x: number, z: number) => number) =>
    new MeteoriteFall(triggerTime, solvePoint),
  (triggerTime: number, solvePoint: (x: number, z: number) => number) =>
    new SharkAttack(triggerTime, solvePoint),
  (triggerTime: number, solvePoint: (x: number, z: number) => number) =>
    new BombTrap(triggerTime, solvePoint),
  (triggerTime: number, solvePoint: (x: number, z: number) => number) =>
    new MissileRain(triggerTime, solvePoint),
];

const subEvents: ((
  triggerTime: number,
  solvePoint: (x: number, z: number) => number
) => SnatchCompanyEvent)[] = [
  (triggerTime: number, solvePoint: (x: number, z: number) => number) =>
    new TreasureChest(triggerTime, solvePoint),
  (triggerTime: number, solvePoint: (x: number, z: number) => number) =>
    new PeachRiver(triggerTime, solvePoint),
  (triggerTime: number, solvePoint: (x: number, z: number) => number) =>
    new ShootingStar(triggerTime, solvePoint),
];

const newPlayerScore = (): PlayerScore => ({
  totalDamage: {
    mineral: 0,
    plant: 0,
    event: 0,
  },
  lastHit: { mineral: 0, plant: 0, event: 0 },
  hitCount: 0,
  criticalCount: 0,
});

export const newPlayer = (id: string): Player => ({
  id: id,
  name: id,
  skills: [],
  baseStatus: newStatus(),
  passiveStatusUpper: newStatusUpper(),
  finalStatus: newStatus(),
  statusBuffs: [],
  playerScore: newPlayerScore(),
});

const noise2D = createNoise2D();
const solvePoint = (x: number, z: number) => (noise2D(x / 5, z / 5) + 1) / 2;

export class SnatchCompany {
  gameState: GameState;
  private callbacks: Callbacks = {};

  noise2D = createNoise2D();
  solvePoint(x: number, z: number) {
    return (
      (this.noise2D(x / 4, z / 4) + 1) * 3 +
      Math.abs(this.noise2D(x / 40, z / 40) * 10 * x * x * 0.001)
    );
  }

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
      onStartBossEvent: [
        ...(this.callbacks.onStartBossEvent ?? []),
        ...(callbacks.onStartBossEvent ?? []),
      ],
      onStartCheckpoint: [
        ...(this.callbacks.onStartCheckpoint ?? []),
        ...(callbacks.onStartCheckpoint ?? []),
      ],
      onStartEvent: [
        ...(this.callbacks.onStartEvent ?? []),
        ...(callbacks.onStartEvent ?? []),
      ],
      onStartGame: [
        ...(this.callbacks.onStartGame ?? []),
        ...(callbacks.onStartGame ?? []),
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
      onStartBossEvent: this.callbacks.onStartBossEvent?.filter(
        (callback) => callback !== ref
      ),
      onStartCheckpoint: this.callbacks.onStartCheckpoint?.filter(
        (callback) => callback !== ref
      ),
      onStartEvent: this.callbacks.onStartEvent?.filter(
        (callback) => callback !== ref
      ),
      onStartGame: this.callbacks.onStartGame?.filter(
        (callback) => callback !== ref
      ),
    };
  }

  addPlayer(playerId: string) {
    const player = newPlayer(playerId);
    if (!this.gameState.players.map(({ id }) => id).includes(player.id)) {
      this.gameState.players.push(player);
      this.generateSkillSelection(player);
      if (this.gameState.mode === "inGame") {
        Array.from({ length: this.gameState.playerSkillLevel - 1 }, () => {
          this.addSkill(
            player.id,
            commonSkills[Math.floor(Math.random() * commonSkills.length)]
          );
        });
        const passiveResult = SnatchCompany.StatusCheck(
          this.gameState,
          player,
          { type: "passive", deltaTime: 0 },
          []
        );
        player.passiveStatusUpper = passiveResult.statusUpper;
        player.finalStatus = passiveResult.finalStatus;
        player.statusBuffs.push(...passiveResult.newStatusBuffs);
      }
      return true;
    }
    return false;
  }

  removePlayer(userId: string) {
    this.gameState.players = this.gameState.players.filter(
      (p) => p.id !== userId
    );
    if (
      this.gameState.mode === "inGame" &&
      this.gameState.section.mode === "checkpoint"
    ) {
      this.gameState.section.skillSelection[userId] = [];
    }
    if (this.gameState.players.length === 0) {
      this.gameState.mode = "lobby";
    }
  }

  private static getRandomBattleEvents(
    solvePoint: (x: number, z: number) => number
  ): SnatchCompanyEvent[] {
    const event1 = getRandom(battleEvents);
    const event2 = getRandom(battleEvents.filter((event) => event !== event1));
    const event3 = getRandom(
      battleEvents.filter((event) => event !== event1 && event !== event2)
    );
    return [
      event1?.(30, solvePoint),
      event2?.(90, solvePoint),
      event3?.(150, solvePoint),
    ].filter((e) => e) as SnatchCompanyEvent[];
  }

  private static getRandomSubEvents(
    solvePoint: (x: number, z: number) => number
  ): SnatchCompanyEvent[] {
    const event1 = getRandom(subEvents);
    const event2 = getRandom(subEvents.filter((event) => event !== event1));
    const event3 = getRandom(
      subEvents.filter((event) => event !== event1 && event !== event2)
    );
    return [
      event1?.(60, solvePoint),
      event2?.(120, solvePoint),
      event3?.(180, solvePoint),
    ].filter((e) => e) as SnatchCompanyEvent[];
  }

  loadGameState(data: GameState) {
    const originSkills = [...commonSkills, ...rareSkills, ...epicSkills];
    this.gameState = data;
    this.gameState.players.forEach((player) => {
      const skills = player.skills;
      player.skills = [];
      skills.forEach((skill) => {
        const originSkill = originSkills.find((s) => s.code === skill.code);
        if (originSkill) {
          this.addSkill(player.id, originSkill);
        }
      });
    });
  }
  getResourceObjectSource = (
    num: number
  ): {
    mineral: [number, number, number];
    plant: [number, number, number];
  } => {
    if (num < 7) {
      return {
        mineral: Vector.mul([1 - num * 0.05, num * 0.05, 0], 10),
        plant: Vector.mul([1 - num * 0.05, num * 0.05, 0], 10),
      };
    }
    if (num < 14) {
      return {
        mineral: Vector.mul(
          [0.7 - (num - 7) * 0.1, 0.35 + (num - 7) * 0.08, (num - 7) * 0.02],
          10
        ),
        plant: Vector.mul(
          [0.7 - (num - 7) * 0.1, 0.35 + (num - 7) * 0.08, (num - 7) * 0.02],
          10
        ),
      };
    }
    if (num < 21) {
      return {
        mineral: Vector.mul(
          [0, 0.91 - (num - 14) * 0.1, 0.09 + (num - 14) * 0.1],
          10
        ),
        plant: Vector.mul(
          [0, 0.91 - (num - 14) * 0.1, 0.09 + (num - 14) * 0.1],
          10
        ),
      };
    }
    return {
      mineral: [1, 1, 8],
      plant: [1, 1, 8],
    };
  };

  private static generateObject(
    position: [number, number, number],
    type: "mineral" | "plant",
    level: number,
    sectionLevel: number,
    sectionTime: number
  ): SnatchCompanyObject {
    return {
      id: uuidv4(),
      type,
      resourceObjectLevel: level,
      position,
      rotation: [0, 0, 0, 0],
      health: getDpsSample(level, 30) * 3,
      maxHealth: getDpsSample(level, 30) * 3,
      reward:
        type === "plant"
          ? [
              { type: "exp", value: 0.03, damageReturn: true },
              { type: "shield", value: 20, damageReturn: true },
            ]
          : [{ type: "exp", value: 0.2, damageReturn: true }],
    };
  }

  private generateResourceObjects() {
    if (this.gameState.mode === "inGame") {
      const targetNumber = Math.floor(this.gameState.ship.position[2] / 90);
      Array.from({ length: targetNumber + 5 }, (_, num) => {
        if (this.gameState.mode === "inGame") {
          if (num >= this.gameState.section.resourceObjectGeneratedState) {
            this.gameState.section.resourceObjectGeneratedState = num + 1;

            const source = this.getResourceObjectSource(num);

            const data = [
              ...Array.from({ length: source.mineral[0] }, () => ({
                type: "mineral",
                value: 1,
              })),
              ...Array.from({ length: source.mineral[1] }, () => ({
                type: "mineral",
                value: 2,
              })),
              ...Array.from({ length: source.mineral[2] }, () => ({
                type: "mineral",
                value: 3,
              })),
              ...Array.from({ length: source.plant[0] }, () => ({
                type: "plant",
                value: 1,
              })),
              ...Array.from({ length: source.plant[1] }, () => ({
                type: "plant",
                value: 2,
              })),
              ...Array.from({ length: source.plant[2] }, () => ({
                type: "plant",
                value: 3,
              })),
            ] as { type: "mineral" | "plant"; value: number }[];

            data.forEach(({ type, value }) => {
              if (this.gameState.mode === "inGame") {
                const x = Math.random() * 100 - 50;
                const z = num * 90 + Math.random() * 90 - 45;
                this.gameState.section.objects.push(
                  SnatchCompany.generateObject(
                    [x, this.solvePoint(x, z) - 8, z],
                    type,
                    value,
                    this.gameState.section.mode === "battle"
                      ? this.gameState.section.level
                      : this.gameState.section.nextSectionLevel,
                    this.gameState.section.mode === "battle"
                      ? this.gameState.section.time
                      : 0
                  )
                );
              }
            });
          }
        }
      });
    }
  }

  startGame() {
    if (this.gameState.mode === "lobby") {
      if (this.gameState.players.length > 0) {
        fs.writeFileSync(
          "./backup/0.json",
          JSON.stringify(this.gameState),
          "utf8"
        );

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
            objects: [],
            resourceObjectGeneratedState: 0,
            // Array.from({ length: 300 }, () => {
            //   const type = Math.random() > 0.5 ? "plant" : "mineral";
            //   const position: Vector.Vector3 = Vector.add(
            //     Vector.mul(
            //       Vector.normalize(Vector.sub(targetPoint, [0, 0, 0])),
            //       Vector.distance(targetPoint, [0, 0, 0]) * Math.random()
            //     ),
            //     [Math.random() * 100 - 50, 0, Math.random() * 100 - 50]
            //   );
            //   position[1] = solvePoint(position[0], position[2]) - 8;
            //   return {
            //     id: uuidv4(),
            //     type,
            //     position,
            //     rotation: [0, 0, 0, 0],
            //     health: 200,
            //     maxHealth: 200,
            //     reward:
            //       type === "plant"
            //         ? [
            //             { type: "exp", value: 0.03, damageReturn: true },
            //             { type: "shield", value: 20, damageReturn: true },
            //           ]
            //         : [{ type: "exp", value: 0.2, damageReturn: true }],
            //   };
            // }),
            events: [
              ...SnatchCompany.getRandomBattleEvents(
                this.solvePoint.bind(this)
              ),
            ],
            subEvents: [
              ...SnatchCompany.getRandomSubEvents(this.solvePoint.bind(this)),
            ],
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
              playerScore: newPlayerScore(),
            };
          }),
          resource: {
            exp: 0,
            nextLevelupExp: SnatchCompany.solveNextLevelupExp(1),
          },
          playerSkillLevel: 1,
        };
        this.callbacks.onStartGame?.forEach((callback) => callback());
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
      // バックアップ
      const data = JSON.stringify(this.gameState);
      fs.writeFileSync(
        `./backup/${this.gameState.section.nextSectionLevel - 1}.json`,
        data,
        "utf8"
      );

      const angle = Math.PI / 2; //(Math.random() * Math.PI) / 2 + Math.PI / 4;
      const shipPosition = this.gameState.ship.position;
      const targetPoint: Vector.Vector3 = Vector.add(shipPosition, [
        Math.cos(angle) * 210 * 3,
        0,
        Math.sin(angle) * 210 * 3,
      ]);
      const level = this.gameState.section.nextSectionLevel;
      this.gameState.section = {
        mode: "battle",
        level,
        targetPoint,
        objects: this.gameState.section.objects,
        resourceObjectGeneratedState:
          this.gameState.section.resourceObjectGeneratedState,
        // Array.from({ length: 300 }, () => {
        //   const type = Math.random() > 0.5 ? "plant" : "mineral";
        //   const position: Vector.Vector3 = Vector.add(
        //     Vector.add(
        //       Vector.mul(
        //         Vector.normalize(Vector.sub(targetPoint, shipPosition)),
        //         Vector.distance(targetPoint, shipPosition) * Math.random()
        //       ),
        //       [Math.random() * 100 - 50, 0, Math.random() * 100 - 50]
        //     ),
        //     shipPosition
        //   );
        //   position[1] = solvePoint(position[0], position[2]) - 8;
        //   return {
        //     id: uuidv4(),
        //     type,
        //     position,
        //     rotation: [0, 0, 0, 0],
        //     health: 300 + getDpsSample(level, 30) * 3,
        //     maxHealth: 300 + getDpsSample(level, 30) * 3,
        //     reward:
        //       type === "plant"
        //         ? [
        //             { type: "exp", value: 0.03, damageReturn: true },
        //             { type: "shield", value: 20, damageReturn: true },
        //           ]
        //         : [{ type: "exp", value: 0.2, damageReturn: true }],
        //   };
        // }),
        events:
          level < 4
            ? SnatchCompany.getRandomBattleEvents(this.solvePoint.bind(this))
            : [],
        subEvents: SnatchCompany.getRandomSubEvents(this.solvePoint.bind(this)),
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
    if (
      this.gameState.mode === "inGame" &&
      this.gameState.section.mode === "battle"
    ) {
      const overLevel = Math.max(
        0,
        this.gameState.playerSkillLevel - this.gameState.section.level * 10
      );
      value =
        (value / Math.max(this.gameState.players.length * 0.7, 1)) *
        Math.max(0.1, 1 - overLevel * 0.2);
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
    return 20 + (playerSkillLevel / 4) ** 2 * 20;
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
        const newSkill = {
          ...skill,
          effect: skill.effect.map((e) => ({ ...e })),
          id: uuidv4(),
        };
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
            extraDamage: number;
            resultDamage: number;
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
  ): {
    damage: number;
    extraDamage: number;
    overDamage: number;
    resultDamage: number;
    criticalCount: number;
  } | null {
    if (
      this.gameState.mode === "inGame" &&
      this.gameState.section.mode === "battle"
    ) {
      const object = [
        ...this.gameState.section.objects,
        ...this.gameState.section.events.flatMap((event) => event.objects),
        ...this.gameState.section.subEvents.flatMap((event) => event.objects),
        ...(this.gameState.section.bossEvent?.objects ?? []),
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
        const extraDamage = player.finalStatus.extraDamage;

        const resultDamage = Math.min(damage + extraDamage, object.health);
        const overDamage = damage + extraDamage - resultDamage;
        object.health = Math.max(0, object.health - damage - extraDamage);

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
              damage,
              extraDamage,
              resultDamage,
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

        // プレイヤースコアの更新
        player.passiveStatusUpper = passiveResult.statusUpper;
        player.finalStatus = passiveResult.finalStatus;
        player.statusBuffs.push(...passiveResult.newStatusBuffs);

        player.playerScore.hitCount++;
        player.playerScore.criticalCount += criticalCount;
        const isEventObject = !this.gameState.section.objects.find(
          (o) => o.id === objectId
        );
        if (isEventObject) {
          player.playerScore.totalDamage.event += resultDamage;
          player.playerScore.lastHit.event += object.health === 0 ? 1 : 0;
        } else if (object.type === "plant") {
          player.playerScore.totalDamage.plant += resultDamage;
          player.playerScore.lastHit.plant += object.health === 0 ? 1 : 0;
        } else if (object.type === "mineral") {
          player.playerScore.totalDamage.mineral += resultDamage;
          player.playerScore.lastHit.mineral += object.health === 0 ? 1 : 0;
        }
        this.callbacks.onAttack2Object?.forEach((callback) =>
          callback({
            attacker: player,
            object,
            damage,
            extraDamage,
            resultDamage,
            overDamage,
            criticalCount,
            hitPoint,
            destroyed: object.health === 0,
          })
        );
        return { damage, extraDamage, overDamage, resultDamage, criticalCount };
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

      this.generateResourceObjects();

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
              this.callbacks.onStartEvent?.forEach((callback) =>
                callback(event)
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
                addEvent: (event: SnatchCompanyEvent) => {
                  if (
                    this.gameState.mode === "inGame" &&
                    this.gameState.section.mode === "battle"
                  ) {
                    this.gameState.section.events.push(event);
                  }
                },
              },
              deltaTime
            );
          }
        }
      });
      if (this.gameState.section.level === 4) {
        if (
          this.gameState.section.time > 30 &&
          !this.gameState.section.bossEvent
        ) {
          this.gameState.section.bossEvent = new BossEvent(
            30,
            this.solvePoint.bind(this)
          );
          this.gameState.section.bossEvent.start({
            ...this.gameState,
            section: this.gameState.section,
          });
          this.callbacks.onAnnouncement?.forEach((callback) =>
            callback({
              title: {
                ja: "ボス出現",
                en: "Boss Appears",
              },
              description: {
                ja: "ボスが出現しました",
                en: "The boss has appeared",
              },
              duration: 3,
            })
          );
          this.callbacks.onStartBossEvent?.forEach((callback) => callback());
        }
        if (this.gameState.section.bossEvent?.state === "processing") {
          this.gameState.section.bossEvent.update(
            {
              gameState: {
                ...this.gameState,
                section: this.gameState.section,
              },
              damage2Ship: this.damage2Ship.bind(this),
              addSkill4Event: this.addSkill4Event.bind(this),
              announcement: this.announcement.bind(this),
              addEvent: (event: SnatchCompanyEvent) => {
                if (
                  this.gameState.mode === "inGame" &&
                  this.gameState.section.mode === "battle"
                ) {
                  this.gameState.section.events.push(event);
                }
              },
            },
            deltaTime
          );
        }
      }

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
          : 1.5);
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
          this.callbacks.onGameClear?.forEach((callback) => callback());
          this.gameState = {
            mode: "result",
            isClear: true,
            bossClearTime: this.gameState.section.bossEvent?.time ?? 9999,
            players: this.gameState.players,
          };
          return;
        }
        // チェックポイントに遷移
        const nextSectionLevel = this.gameState.section.level + 1;
        this.gameState.section = {
          mode: "checkpoint",
          nextSectionLevel,
          objects: this.gameState.section.objects,
          resourceObjectGeneratedState:
            this.gameState.section.resourceObjectGeneratedState,
          skillSelection: this.gameState.players.reduce((acc, player) => {
            const excludeSkillCodes = player.skills
              .filter((skill) => skill.rarity === "epic")
              .map((skill) => skill.code);
            const hasEpicSkill = player.skills.some(
              (skill) => skill.rarity === "epic"
            );
            return {
              ...acc,
              [player.id]: Array.from(
                { length: nextSectionLevel === 2 ? 2 : 3 },
                (_, k) => k
              ).map((index) => {
                const skillSelection: Skill[] = [];
                for (let i = 0; i < 3; i++) {
                  const skill = SnatchCompany.getRandomSkill(
                    !hasEpicSkill && index === 0 && i === 0
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
              }),
            };
          }, {}),
        };
        this.gameState.players.forEach((player) => {
          player.statusBuffs = [];
        });
        this.callbacks.onStartCheckpoint?.forEach((callback) => callback());
        return;
      }

      // 船の体力が0になったらリザルト画面に遷移
      if (this.gameState.ship.health <= 0) {
        this.callbacks.onGameOver?.forEach((callback) => callback());
        this.gameState = {
          mode: "result",
          isClear: false,
          players: this.gameState.players,
        };
        return;
      }
    }
  }

  generateSkillSelection(player: Player) {
    if (
      this.gameState.mode === "inGame" &&
      this.gameState.section.mode === "checkpoint"
    ) {
      const excludeSkillCodes = player.skills
        .filter((skill) => skill.rarity === "epic")
        .map((skill) => skill.code);
      const hasEpicSkill = player.skills.some(
        (skill) => skill.rarity === "epic"
      );
      this.gameState.section.skillSelection[player.id] = Array.from(
        { length: this.gameState.section.nextSectionLevel === 2 ? 2 : 3 },
        (_, k) => k
      ).map((index) => {
        const skillSelection: Skill[] = [];
        for (let i = 0; i < 3; i++) {
          const skill = SnatchCompany.getRandomSkill(
            !hasEpicSkill && index === 0 && i === 0
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
      });
    }
  }
}

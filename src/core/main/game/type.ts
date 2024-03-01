import { SnatchCompanyEvent } from "./event/snatchCompanyEvent";
import { Vector } from "./util";

export type Status = {
  attack: number;
  critical: number;
  criticalDamage: number;
  attackSpeed: number;
  maxEnergy: number;
  chargeEnergy: number;
  moveSpeed: number;
  antiPlant: number;
  antiMineral: number;
  extraDamage: number;
};

export type Upper = {
  rate: number;
  add: number;
};

export type StatusUpper = {
  attack: Upper;
  critical: Upper;
  criticalDamage: Upper;
  attackSpeed: Upper;
  maxEnergy: Upper;
  chargeEnergy: Upper;
  moveSpeed: Upper;
  antiPlant: Upper;
  antiMineral: Upper;
  extraDamage: Upper;
};

export type EffectSource =
  | { type: "skill"; skill: Skill & { id: string } }
  | { type: "buff"; buff: StatusBuff };

export type StatusEffect<T> = {
  type: "custom";
  passive?: (
    prev: {
      source: EffectSource;
      state: T;
      statusUpper: StatusUpper;
      statusBuffs: StatusBuff[];
      player: Player;
    },
    gameState: GameState,
    deltaTime: number
  ) => { state: T; statusUpper: StatusUpper; statusBuffs: StatusBuff[] };
  onHit?: (
    prev: {
      source: EffectSource;
      state: T;
      statusUpper: StatusUpper;
      statusBuffs: StatusBuff[];
    },
    attacker: Readonly<Player>,
    object: Readonly<SnatchCompanyObject>
  ) => { state: T; statusUpper: StatusUpper; statusBuffs: StatusBuff[] };
  onCalcCritical?: (
    prev: {
      source: EffectSource;
      state: T;
      statusUpper: StatusUpper;
      statusBuffs: StatusBuff[];
    },
    gameState: GameState,
    attacker: Readonly<Player>,
    object: Readonly<SnatchCompanyObject>,
    criticalCount: number
  ) => {
    state: T;
    statusUpper: StatusUpper;
    statusBuffs: StatusBuff[];
  };
  onAddDamage?: (
    prev: {
      source: EffectSource;
      state: T;
      statusUpper: StatusUpper;
      statusBuffs: StatusBuff[];
    },
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
    }
  ) => { state: T; statusUpper: StatusUpper; statusBuffs: StatusBuff[] };
  onLevelup?: (
    prev: {
      source: EffectSource;
      state: T;
      statusUpper: StatusUpper;
      statusBuffs: StatusBuff[];
    },
    level: number
  ) => { state: T; statusUpper: StatusUpper; statusBuffs: StatusBuff[] };
  description: LocaleText;
  state: T;
  order: number;
};

export type StatusBuff = {
  statusEffects: StatusEffect<object>[];
  duration: number;
  source: EffectSource;
};

export type Skill = {
  code: string;
  name: LocaleText;
  rarity: "normal" | "rare" | "epic";
  effect: StatusEffect<object>[];
  demerit: boolean;
  icon: string;
};

export type SnatchCompanyObject = {
  id: string;
  type: "plant" | "mineral";
  position: Vector.Vector3;
  rotation: Vector.Vector4;
  health: number;
  maxHealth: number;
  resourceObjectLevel?: number;
  reward: {
    type: "exp" | "shield";
    value: number;
    damageReturn: boolean;
  }[];
};

export type PlayerScore = {
  totalDamage: { mineral: number; plant: number; event: number };
  lastHit: { mineral: number; plant: number; event: number };
  hitCount: number;
  criticalCount: number;
};

export type Player = {
  id: string;
  name: string;
  skills: (Skill & { id: string })[];
  baseStatus: Status;
  passiveStatusUpper: StatusUpper;
  finalStatus: Status;
  statusBuffs: StatusBuff[];
  playerScore: PlayerScore;
};

export type GameStateLobby = {
  mode: "lobby";
  players: Player[];
};

type Ship = {
  health: number;
  maxHealth: number;
  position: Vector.Vector3;
  speed: number;
  shield: number;
  maxShield: number;
};

export type LocaleText = {
  ja: string;
  en: string;
};

export type Announcement = {
  title: LocaleText;
  description: LocaleText;
  duration: number;
};

export type BattleSection = {
  mode: "battle";
  level: number;
  targetPoint: Vector.Vector3;
  objects: SnatchCompanyObject[];
  resourceObjectGeneratedState: number;
  events: SnatchCompanyEvent[];
  subEvents: SnatchCompanyEvent[];
  bossEvent?: SnatchCompanyEvent;
  time: number;
};

export type CheckpointSection = {
  mode: "checkpoint";
  nextSectionLevel: number;
  objects: SnatchCompanyObject[];
  resourceObjectGeneratedState: number;
  skillSelection: { [playerId: string]: { skills: Skill[] }[] };
};

export type Section = BattleSection | CheckpointSection;

export type GameStateInGame<S extends Section> = {
  mode: "inGame";
  section: S;
  ship: Ship;
  players: Player[];
  resource: {
    exp: number;
    nextLevelupExp: number;
  };
  playerSkillLevel: number;
};

export type GameStateResult = {
  mode: "result";
  isClear: boolean;
  bossClearTime?: number;
  players: Player[];
};

export type GameState =
  | GameStateLobby
  | GameStateInGame<Section>
  | GameStateResult;

export type Callbacks = {
  onAttack2Object?: ((arg: {
    attacker: Readonly<Player>;
    object: Readonly<SnatchCompanyObject>;
    damage: number;
    extraDamage: number;
    overDamage: number;
    resultDamage: number;
    criticalCount: number;
    hitPoint: Vector.Vector3;
    destroyed: boolean;
  }) => void)[];
  levelup?: ((arg: { level: number }) => void)[];
  onAnnouncement?: ((arg: Announcement) => void)[];
  onStartBossEvent?: (() => void)[];
  onStartCheckpoint?: (() => void)[];
  onStartGame?: (() => void)[];
  onStartEvent?: ((arg: SnatchCompanyEvent) => void)[];
  onGameClear?: (() => void)[];
};

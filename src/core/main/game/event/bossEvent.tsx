import { v4 as uuidv4 } from "uuid";
import { ReactElement, JSXElementConstructor, useCallback } from "react";
import {
  GameStateInGame,
  BattleSection,
  Announcement,
  SnatchCompanyObject,
} from "../type";
import { Vector } from "../util";
import { SnatchCompanyEvent } from "./snatchCompanyEvent";
import {
  Bomb,
  Boss,
  MovedSlot,
  Resource,
} from "../../../unit/package/SnatchCompany/main";
import { Box } from "../../../unit/package/ProceduralMesh/main";
import { HealthView } from "../../render/common/hpView";
import { SnatchCompany } from "..";
import { FunctionEnv } from "../../../../lib/mirage-x/common/interactionEvent";
import { Slot } from "../../../unit/package/Primitive/main";
import { BirdStrike } from "./birdStrike";
import { MeteoriteFall } from "./meteoriteFall";

type BombObject = SnatchCompanyObject & {
  targetPoint: Vector.Vector3;
  moveSpeed: number;
  startTime: number;
  objectType: "bomb";
};

type BossObject = SnatchCompanyObject & {
  targetPoint: Vector.Vector3;
  moveSpeed: number;
  objectType: "boss";
};

const BombView = (props: {
  object: BombObject;
  attack2Objet: SnatchCompany["attack2Object"];
}) => {
  const onHit = useCallback(
    (env: FunctionEnv, hitPoint: [number, number, number]) => {
      props.attack2Objet(env.userId, props.object.id, hitPoint);
    },
    [props.attack2Objet, props.object.id]
  );
  const move = Vector.mul(
    Vector.normalize(
      Vector.sub(props.object.targetPoint, props.object.position)
    ),
    props.object.moveSpeed
  );
  const moveTime =
    Vector.distance(props.object.targetPoint, props.object.position) /
    props.object.moveSpeed;

  return (
    <MovedSlot position={props.object.position} move={move} moveTime={moveTime}>
      <Resource onHit={onHit}>
        <Slot scale={[3, 3, 3]}>
          <Bomb />
        </Slot>
      </Resource>
      {props.object.health < props.object.maxHealth && (
        <HealthView
          position={[0, 4, 0]}
          scale={[3, 3, 3]}
          health={props.object.health}
          maxHealth={props.object.maxHealth}
        />
      )}
    </MovedSlot>
  );
};

const BossView = (props: {
  boss: BossObject;
  bossState: BossState;
  attack2Objet: (env: FunctionEnv, hitPoint: [number, number, number]) => void;
}) => {
  const move = Vector.mul(
    Vector.normalize(Vector.sub(props.boss.targetPoint, props.boss.position)),
    props.boss.moveSpeed
  );
  const moveTime =
    Vector.distance(props.boss.targetPoint, props.boss.position) /
    props.boss.moveSpeed;

  return (
    <MovedSlot position={props.boss.position} move={move} moveTime={moveTime}>
      <Resource onHit={props.attack2Objet}>
        <Slot scale={[4.5, 4.5, 4.5]}>
          <Boss />
        </Slot>
      </Resource>
      {props.boss.health < props.boss.maxHealth && (
        <HealthView
          position={[0, 8, 0]}
          scale={[3, 3, 3]}
          health={props.boss.health}
          maxHealth={props.boss.maxHealth}
        />
      )}
    </MovedSlot>
  );
};

type BossState = {
  step: "1" | "2" | "3" | "4" | "5";
  startTime: number;
};

export class BossEvent extends SnatchCompanyEvent {
  code: string = "Boss";
  title = {
    ja: "ボス",
    en: "Boss",
  };
  description = {
    ja: "ボスが出現しました",
    en: "Boss has appeared",
  };

  bossState: BossState = {
    step: "1",
    startTime: 0,
  };
  boss: BossObject | null = null;

  override objects: (BombObject | BossObject)[] = [];

  constructor(
    triggerTime: number,
    solvePoint: (x: number, z: number) => number
  ) {
    super(triggerTime, solvePoint);
    this.drawOnShip = this.drawOnShip.bind(this);
  }

  start(gameState: GameStateInGame<BattleSection>): void {
    super.start(gameState);
    this.boss = {
      id: uuidv4(),
      type: "mineral",
      position: [0, 70, 120],
      rotation: [0, 0, 0, 0],
      health: 50000,
      maxHealth: 50000,
      reward: [],
      targetPoint: [0, 2, 50],
      moveSpeed: 30,
      objectType: "boss",
    };

    this.objects = [this.boss];
  }

  update(
    game: {
      gameState: GameStateInGame<BattleSection>;
      damage2Ship: (damage: number) => void;
      addSkill4Event: () => void;
      announcement: (announcement: Announcement) => void;
      addEvent: (event: SnatchCompanyEvent) => void;
    },
    deltaTime: number
  ): void {
    super.update(game, deltaTime);
    if (this.boss) {
      switch (this.bossState.step) {
        case "1": {
          if (this.time > 30) {
            game.damage2Ship(100);
            this.bossState.step = "2";
            game.addEvent(
              new BirdStrike(game.gameState.section.time, this.solvePoint)
            );
            this.boss.position = [0, 3, 50];
            this.boss.targetPoint = [0, 40, 70];
            this.bossState.startTime = this.time;
            this.boss.health = 0.7 * this.boss.maxHealth;
          }
          if (this.boss.health / this.boss.maxHealth < 0.7) {
            this.bossState.step = "2";
            game.addEvent(
              new BirdStrike(game.gameState.section.time, this.solvePoint)
            );
            this.boss.position = [0, 3, 50];
            this.boss.targetPoint = [0, 40, 70];
            this.bossState.startTime = this.time;
            this.boss.health = 0.7 * this.boss.maxHealth;
          }
          break;
        }
        case "2": {
          if (
            !game.gameState.section.events.some(
              (event) => event.state === "processing"
            )
          ) {
            this.bossState.step = "3";
            this.boss.position = [0, 40, 70];
            this.boss.targetPoint = [0, 3, 50];
            this.bossState.startTime = this.time;
          }
          break;
        }
        case "3": {
          if (this.time - this.bossState.startTime > 30) {
            game.damage2Ship(100);
            this.bossState.step = "4";
            this.boss.position = [0, 3, 50];
            this.boss.targetPoint = [0, 3, 100];
            this.bossState.startTime = this.time;
            game.addEvent(
              new MeteoriteFall(game.gameState.section.time, this.solvePoint)
            );
            this.boss.health = 0.4 * this.boss.maxHealth;
          }
          if (this.boss.health / this.boss.maxHealth < 0.4) {
            this.bossState.step = "4";
            this.boss.position = [0, 3, 50];
            this.boss.targetPoint = [0, 3, 100];
            this.bossState.startTime = this.time;
            game.addEvent(
              new MeteoriteFall(game.gameState.section.time, this.solvePoint)
            );
            this.boss.health = 0.4 * this.boss.maxHealth;
          }
          break;
        }
        case "4": {
          if (
            !game.gameState.section.events.some(
              (event) => event.state === "processing"
            )
          ) {
            this.bossState.step = "5";
            this.boss.position = [0, 3, 100];
            this.boss.targetPoint = [0, 3, 50];
            this.bossState.startTime = this.time;
          }
          break;
        }
        case "5": {
          if (this.time - this.bossState.startTime > 30) {
            game.damage2Ship(1000);
          }
          if (this.boss.health <= 0) {
            game.announcement({
              title: { ja: "ボス撃破", en: "Boss Defeated" },
              description: {
                ja: `おめでとう！ボス討伐時間は${
                  Math.round(this.time * 10) / 10
                }秒でした。`,
                en: `Congratulations! The boss was defeated in ${
                  Math.round(this.time * 10) / 10
                } seconds.`,
              },
              duration: 5,
            });
          }
          break;
        }
      }
    }
  }

  drawOnShip(props: {
    gameState: GameStateInGame<BattleSection>;
    attack2Object: (
      playerId: string,
      objectId: string,
      hitPoint: Vector.Vector3
    ) => {
      damage: number;
      extraDamage: number;
      overDamage: number;
      resultDamage: number;
      criticalCount: number;
    } | null;
  }): ReactElement<any, string | JSXElementConstructor<any>> {
    const attack2Boss = useCallback(
      (env: FunctionEnv, hitPoint: [number, number, number]) => {
        if (
          this.boss &&
          this.time > 3 &&
          ["1", "3", "5"].includes(this.bossState.step)
        ) {
          props.attack2Object(env.userId, this.boss.id, hitPoint);
        }
      },
      [props.attack2Object]
    );

    return this.boss && this.boss.health > 0 ? (
      <>
        <MovedSlot
          position={[0, 0, 0]}
          move={[0, 0, -props.gameState.ship.speed]}
          moveTime={100}
        >
          {this.objects.map((object) =>
            object.objectType === "bomb" ? (
              <BombView
                key={object.id}
                object={object}
                attack2Objet={props.attack2Object}
              />
            ) : (
              <></>
            )
          )}
        </MovedSlot>
        <BossView
          boss={this.boss}
          attack2Objet={attack2Boss}
          bossState={this.bossState}
        />
      </>
    ) : (
      <></>
    );
  }
}

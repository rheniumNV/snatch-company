import { v4 as uuidv4 } from "uuid";
import { SnatchCompanyEvent } from "./snatchCompanyEvent";
import { BattleSection, GameStateInGame, SnatchCompanyObject } from "../type";
import { ReactElement, useCallback } from "react";
import {
  MovedSlot,
  Peach,
  Resource,
} from "../../../unit/package/SnatchCompany/main";
import { Vector, getDpsSample } from "../util";
import { SnatchCompany } from "..";
import { FunctionEnv } from "../../../../lib/mirage-x/common/interactionEvent";
import { HealthView } from "../../render/common/hpView";
import { Slot } from "../../../unit/package/Primitive/main";

type PeachObject = SnatchCompanyObject & {
  targetPoint: Vector.Vector3;
  moveSpeed: number;
  startTime: number;
};

const PeachView = (props: {
  object: PeachObject;
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
        <Slot scale={[2, 2, 2]}>
          <Peach />
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

export class PeachRiver extends SnatchCompanyEvent {
  code = "PeachRiver";
  title = {
    ja: "桃の川",
    en: "Peach River",
  };

  description = {
    ja: "桃がたくさん流れてきます",
    en: "Many peaches are flowing",
  };

  constructor(
    triggerTime: number,
    solvePoint: (x: number, z: number) => number
  ) {
    super(triggerTime, solvePoint);
    this.drawOnShip = this.drawOnShip.bind(this);
  }

  override objects: PeachObject[] = [];
  spawnCount = 0;
  spawnTimer = 0.5;
  riverCenter = 0;

  override start(gameState: GameStateInGame<BattleSection>): void {
    super.start(gameState);
    this.spawnCount = 10;
    this.riverCenter =
      (Math.random() > 0.5 ? -1 : 1) * (Math.random() * 20 + 40);
  }

  override update(
    game: {
      gameState: GameStateInGame<BattleSection>;
      damage2Ship: SnatchCompany["damage2Ship"];
      addSkill4Event: SnatchCompany["addSkill4Event"];
      announcement: SnatchCompany["announcement"];
      addEvent: (event: SnatchCompanyEvent) => void;
    },
    deltaTime: number
  ): void {
    super.update(game, deltaTime);

    this.spawnTimer -= deltaTime;
    if (game.gameState.mode === "inGame") {
      const section = game.gameState.section;
      if (section.mode === "battle") {
        if (this.spawnTimer <= 0 && this.spawnCount > 0) {
          this.spawnCount--;
          this.spawnTimer = 1 + Math.random() * 3;
          const dpsSample = getDpsSample(section.level, this.triggerTime);
          Array.from({
            length: 1,
          }).forEach((_, i) => {
            const z = 100 + this.time * game.gameState.ship.speed;
            const x = this.riverCenter + Math.random() * 30 - 15;
            const targetPoint: Vector.Vector3 = [x, this.solvePoint(x, z), z];
            const position: Vector.Vector3 = [
              targetPoint[0],
              50 + Math.random() * 30,
              targetPoint[2],
            ];
            this.objects.push({
              id: uuidv4(),
              type: "plant",
              position,
              rotation: [0, 0, 0, 0],
              health: 20 + dpsSample * 4,
              maxHealth: 20 + dpsSample * 4,
              reward: [
                {
                  type: "shield",
                  value: 15,
                  damageReturn: true,
                },
                {
                  type: "exp",
                  value: 0.3,
                  damageReturn: true,
                },
              ],
              targetPoint,
              moveSpeed: 30,
              startTime: this.time,
            });
          });
        }
      }
    }

    this.objects.forEach((object) => {
      const distance2Ship =
        object.position[2] - this.time * game.gameState.ship.speed;
      if (distance2Ship < -50) {
        object.health = 0;
      }
    });

    this.objects = this.objects.filter((object) => object.health > 0);
    if (this.objects.length === 0 && this.spawnCount === 0) {
      this.state = "finished";
    }
  }

  drawOnShip(props: {
    gameState: GameStateInGame<BattleSection>;
    attack2Object: SnatchCompany["attack2Object"];
  }): ReactElement {
    return (
      <MovedSlot
        position={[0, 0, 0]}
        move={[0, 0, -props.gameState.ship.speed]}
        moveTime={100}
      >
        {this.objects.map((object) => (
          <PeachView
            key={object.id}
            object={object}
            attack2Objet={props.attack2Object}
          />
        ))}
      </MovedSlot>
    );
  }
}

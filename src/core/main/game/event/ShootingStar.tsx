import { v4 as uuidv4 } from "uuid";
import { SnatchCompanyEvent } from "./snatchCompanyEvent";
import { BattleSection, GameStateInGame, SnatchCompanyObject } from "../type";
import { ReactElement, useCallback } from "react";
import {
  MovedSlot,
  Resource,
  Star,
} from "../../../unit/package/SnatchCompany/main";
import { Vector, getDpsSample } from "../util";
import { SnatchCompany } from "..";
import { FunctionEnv } from "../../../../lib/mirage-x/common/interactionEvent";
import { HealthView } from "../../render/common/hpView";
import { Slot } from "../../../unit/package/Primitive/main";

type StarObject = SnatchCompanyObject & {
  targetPoint: Vector.Vector3;
  moveSpeed: number;
  startTime: number;
};

const StarView = (props: {
  object: StarObject;
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
          <Star />
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

export class ShootingStar extends SnatchCompanyEvent {
  code = "ShootingStar";
  title = {
    ja: "流れ星",
    en: "Shooting Star",
  };

  description = {
    ja: "流れ星が流れてきます。",
    en: "Shooting star is coming.",
  };

  constructor(triggerTime: number) {
    super(triggerTime);
    this.drawOnShip = this.drawOnShip.bind(this);
  }

  override objects: StarObject[] = [];
  spawnCount = 0;
  spawnTimer = 0.5;
  riverCenter = 0;

  override start(gameState: GameStateInGame<BattleSection>): void {
    super.start(gameState);
    this.spawnCount = 15;
    this.riverCenter =
      (Math.random() > 0.5 ? -1 : 1) * (Math.random() * 20 + 60);
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
          this.spawnTimer = 0.7 + Math.random() * 0.5;
          const dpsSample = getDpsSample(section.level, this.triggerTime);
          Array.from({
            length: 2,
          }).forEach((_, i) => {
            const z = 100 + this.time * game.gameState.ship.speed;
            const x = this.riverCenter + Math.random() * 30 - 15;
            const targetPoint: Vector.Vector3 = [
              x + Math.random() * 30 - 15,
              -7.5,
              40 + Math.random() * 30,
            ];
            const position: Vector.Vector3 = [-x, 40 + Math.random() * 20, z];
            this.objects.push({
              id: uuidv4(),
              type: "plant",
              position,
              rotation: [0, 0, 0, 0],
              health: 5 + dpsSample * 0.3,
              maxHealth: 5 + dpsSample * 0.3,
              reward: [
                {
                  type: "shield",
                  value: 10,
                  damageReturn: true,
                },
                {
                  type: "exp",
                  value: 0.25,
                  damageReturn: true,
                },
              ],
              targetPoint,
              moveSpeed: 60,
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
          <StarView
            key={object.id}
            object={object}
            attack2Objet={props.attack2Object}
          />
        ))}
      </MovedSlot>
    );
  }
}

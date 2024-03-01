import { v4 as uuidv4 } from "uuid";
import { SnatchCompanyEvent } from "./snatchCompanyEvent";
import { BattleSection, GameStateInGame, SnatchCompanyObject } from "../type";
import { ReactElement, useCallback } from "react";
import {
  Bomb,
  MovedSlot,
  Resource,
} from "../../../unit/package/SnatchCompany/main";
import { Vector, getDpsSample } from "../util";
import { SnatchCompany } from "..";
import { FunctionEnv } from "../../../../lib/mirage-x/common/interactionEvent";
import { HealthView } from "../../render/common/hpView";
import { Slot } from "../../../unit/package/Primitive/main";
import { Box } from "../../../unit/package/ProceduralMesh/main";

type BombObject = SnatchCompanyObject & {
  targetPoint: Vector.Vector3;
  moveSpeed: number;
  startTime: number;
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

export class BombTrap extends SnatchCompanyEvent {
  code = "BombTrap";
  title = {
    ja: "機雷地帯",
    en: "Minefield",
  };

  description = {
    ja: "船の周りに機雷が設置されています",
    en: "Mines are set around the ship",
  };

  constructor(triggerTime: number) {
    super(triggerTime);
    this.drawOnShip = this.drawOnShip.bind(this);
  }

  override objects: BombObject[] = [];
  spawnCount = 0;
  spawnTimer = 0.5;

  override start(gameState: GameStateInGame<BattleSection>): void {
    super.start(gameState);
    this.spawnCount = 10;
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
          this.spawnTimer = 1.5;
          const dpsSample = getDpsSample(section.level, this.triggerTime);
          Array.from({
            length: 2 + Math.floor((game.gameState.players.length - 1) * 0.8),
          }).forEach((_, i) => {
            const z = (10 - this.spawnCount) * 15 + 50;
            const targetPoint: Vector.Vector3 = [
              Math.random() * 30 - 15,
              Math.random() * 8 - 4,
              z + Math.random() * 10 - 5,
            ];
            const position: Vector.Vector3 = [
              targetPoint[0],
              50 + Math.random() * 30,
              targetPoint[2],
            ];
            this.objects.push({
              id: uuidv4(),
              type: "mineral",
              position,
              rotation: [0, 0, 0, 0],
              health: 20 + dpsSample * 0.5,
              maxHealth: 20 + dpsSample * 0.5,
              reward: [
                {
                  type: "exp",
                  value: 0.25,
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

    this.objects.filter((object) => {
      const distance2Ship =
        object.position[2] - this.time * game.gameState.ship.speed;
      if (distance2Ship < 10) {
        object.health = 0;
        game.damage2Ship(30);
      }
    });

    if (this.objects.length === 0 && this.spawnCount === 0) {
      game.addSkill4Event();
      game.announcement({
        title: {
          ja: "機雷地帯を突破しました",
          en: "Minefield Cleared",
        },
        description: {
          ja: "おめでとう。レアスキルを1つ獲得しました。",
          en: "Congratulations. You have acquired one rare skill.",
        },
        duration: 3,
      });
      this.state = "finished";
    }
    this.objects = this.objects.filter((object) => object.health > 0);
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
          <BombView
            key={object.id}
            object={object}
            attack2Objet={props.attack2Object}
          />
        ))}
      </MovedSlot>
    );
  }
}

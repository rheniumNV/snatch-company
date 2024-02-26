import { v4 as uuidv4 } from "uuid";
import { SnatchCompanyEvent } from "./snatchCompanyEvent";
import { BattleSection, GameStateInGame, SnatchCompanyObject } from "../type";
import { ReactElement, useCallback } from "react";
import {
  TreasureChest as Treasure,
  MovedSlot,
  Resource,
} from "../../../unit/package/SnatchCompany/main";
import { Vector, getDpsSample } from "../util";
import { SnatchCompany } from "..";
import { FunctionEnv } from "../../../../lib/mirage-x/common/interactionEvent";
import { HealthView } from "../../render/common/hpView";
import { Slot } from "../../../unit/package/Primitive/main";
import { Box } from "../../../unit/package/ProceduralMesh/main";

type ChestObject = SnatchCompanyObject & {
  targetPoint: Vector.Vector3;
  moveSpeed: number;
  startTime: number;
};

const ChestView = (props: {
  object: ChestObject;
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
          <Treasure />
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

export class TreasureChest extends SnatchCompanyEvent {
  code = "TreasureChest";
  title = {
    ja: "宝箱",
    en: "Treasure Chest",
  };

  description = {
    ja: "宝箱が流れてきます",
    en: "Treasure chests are floating towards the ship",
  };

  constructor(triggerTime: number) {
    super(triggerTime);
    this.drawOnShip = this.drawOnShip.bind(this);
  }

  override objects: ChestObject[] = [];
  spawnCount = 0;
  spawnTimer = 0.5;

  override start(gameState: GameStateInGame<BattleSection>): void {
    super.start(gameState);
    this.spawnCount = 1;
  }

  override update(
    game: {
      gameState: GameStateInGame<BattleSection>;
      damage2Ship: SnatchCompany["damage2Ship"];
      addSkill4Event: SnatchCompany["addSkill4Event"];
      announcement: SnatchCompany["announcement"];
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
            length: 1,
          }).forEach((_, i) => {
            const z = 150;
            const targetPoint: Vector.Vector3 = [
              Math.random() * 200 - 100,
              -8,
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
              health: 20 + dpsSample * 5,
              maxHealth: 20 + dpsSample * 5,
              reward: [
                {
                  type: "shield",
                  value: 50,
                  damageReturn: false,
                },
                {
                  type: "exp",
                  value: 0.3,
                  damageReturn: false,
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
      if (object.health <= 0) {
        game.addSkill4Event();
        game.announcement({
          title: {
            ja: "宝箱を回収しました",
            en: "Treasure chests are collected",
          },
          description: {
            ja: "おめでとう。レアスキルを1つ獲得しました。",
            en: "Congratulations. You have acquired one rare skill.",
          },
          duration: 3,
        });
        this.state = "finished";
        return;
      }
      const distance2Ship =
        object.position[2] - this.time * game.gameState.ship.speed;
      if (distance2Ship < -50) {
        this.state = "finished";
      }
    });

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
          <ChestView
            key={object.id}
            object={object}
            attack2Objet={props.attack2Object}
          />
        ))}
      </MovedSlot>
    );
  }
}

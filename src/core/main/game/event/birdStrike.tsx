import { v4 as uuidv4 } from "uuid";
import { SnatchCompanyEvent } from "./snatchCompanyEvent";
import { BattleSection, GameStateInGame, SnatchCompanyObject } from "../type";
import { ReactElement, useCallback } from "react";
import {
  Bird,
  MovedSlot,
  Resource,
} from "../../../unit/package/SnatchCompany/main";
import { Vector, getDpsSample } from "../util";
import { SnatchCompany } from "..";
import { FunctionEnv } from "../../../../lib/mirage-x/common/interactionEvent";
import { HealthView } from "../../render/common/hpView";
import { Slot } from "../../../unit/package/Primitive/main";

type BirdObject = SnatchCompanyObject & {
  targetPoint: Vector.Vector3;
  moveSpeed: number;
  startTime: number;
};

const BirdView = (props: {
  object: BirdObject;
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
          <Bird />
        </Slot>
      </Resource>
      {props.object.health < props.object.maxHealth && (
        <HealthView
          position={[0, 3, 0]}
          scale={[3, 3, 3]}
          health={props.object.health}
          maxHealth={props.object.maxHealth}
        />
      )}
    </MovedSlot>
  );
};

export class BirdStrike extends SnatchCompanyEvent {
  code = "BirdStrike";
  title = {
    ja: "バードストライク",
    en: "Bird Strike",
  };

  description = {
    ja: "鳥が船に向かって飛んできています\n船を守ってください",
    en: "Birds are flying towards the ship\nPlease protect the ship",
  };

  constructor(
    triggerTime: number,
    solvePoint: (x: number, z: number) => number
  ) {
    super(triggerTime, solvePoint);
    this.drawOnShip = this.drawOnShip.bind(this);
  }

  override objects: BirdObject[] = [];
  birdSpawnCount = 0;
  birdSpawnTimer = 0.5;

  override start(gameState: GameStateInGame<BattleSection>): void {
    super.start(gameState);
    if (gameState.mode === "inGame") {
      const section = gameState.section;
      if (section.mode === "battle") {
        this.birdSpawnCount = section.level < 3 ? 10 : 15;
      }
    }
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

    this.birdSpawnTimer -= deltaTime;
    if (game.gameState.mode === "inGame") {
      const section = game.gameState.section;
      if (section.mode === "battle") {
        if (this.birdSpawnTimer <= 0 && this.birdSpawnCount > 0) {
          this.birdSpawnCount--;
          this.birdSpawnTimer = section.level < 3 ? 2 : 1.3;
          const dpsSample = getDpsSample(section.level, this.triggerTime);
          Array.from({
            length:
              1 +
              Math.min(
                6,
                Math.floor(1 + (game.gameState.players.length - 1) * 0.8)
              ),
          }).forEach((_, i) => {
            const position: Vector.Vector3 = [
              Math.random() * 100 - 50,
              Math.random() * 15 + 5,
              Math.random() * 10 + 70,
            ];
            this.objects.push({
              id: uuidv4(),
              type: "plant",
              position,
              rotation: [0, 0, 0, 0],
              health: 10,
              maxHealth: 10,
              reward: [
                {
                  type: "exp",
                  value: dpsSample * 0.008,
                  damageReturn: true,
                },
              ],
              targetPoint: [Math.random() * 14 - 7, 2, Math.random() * 10 - 5],
              moveSpeed: Math.random() * 5 + 5,
              startTime: this.time,
            });
          });
        }
      }
    }

    this.objects.forEach((object) => {
      const move = Vector.normalize(
        Vector.sub(object.targetPoint, object.position)
      );
      const maxMove = Vector.distance(object.targetPoint, object.position);
      const currentPosition = Vector.add(
        object.position,
        Vector.mul(
          move,
          Math.min(maxMove, (this.time - object.startTime) * object.moveSpeed)
        )
      );
      const distance = Vector.distance(currentPosition, object.targetPoint);
      if (distance < 0.1) {
        object.health = 0;
        game.damage2Ship(game.gameState.section.level === 1 ? 5 : 10);
      }
    });

    if (this.objects.length === 0 && this.birdSpawnCount === 0) {
      game.addSkill4Event();
      game.announcement({
        title: {
          ja: "バードストライクをやり過ごした",
          en: "Bird Strike has been overcome",
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
      <>
        {this.objects.map((object) => (
          <BirdView
            key={object.id}
            object={object}
            attack2Objet={props.attack2Object}
          />
        ))}
      </>
    );
  }
}

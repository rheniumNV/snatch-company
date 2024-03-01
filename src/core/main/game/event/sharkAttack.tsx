import { v4 as uuidv4 } from "uuid";
import { SnatchCompanyEvent } from "./snatchCompanyEvent";
import { BattleSection, GameStateInGame, SnatchCompanyObject } from "../type";
import { ReactElement, useCallback } from "react";
import {
  MovedSlot,
  Resource,
  Shark,
} from "../../../unit/package/SnatchCompany/main";
import { Vector, getDpsSample } from "../util";
import { SnatchCompany } from "..";
import { FunctionEnv } from "../../../../lib/mirage-x/common/interactionEvent";
import { HealthView } from "../../render/common/hpView";
import { Slot } from "../../../unit/package/Primitive/main";

type SharkObject = SnatchCompanyObject & {
  targetPoint: Vector.Vector3;
  moveSpeed: number;
  startTime: number;
};

const SharkView = (props: {
  object: SharkObject;
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
        <Slot scale={[2, 2, 2]} rotation={[-0.5, 0.5, -0.5, 0.5]}>
          <Shark />
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

export class SharkAttack extends SnatchCompanyEvent {
  code = "SharkAttack";
  title = {
    ja: "サメ襲撃",
    en: "Shark Attack",
  };

  description = {
    ja: "サメから船を守ろう",
    en: "Protect the ship from the sharks",
  };

  constructor(triggerTime: number) {
    super(triggerTime);
    this.drawOnShip = this.drawOnShip.bind(this);
  }

  override objects: SharkObject[] = [];
  sharkSpawnCount = 0;
  sharkSpawnTimer = 0.5;

  override start(gameState: GameStateInGame<BattleSection>): void {
    super.start(gameState);
    if (gameState.mode === "inGame") {
      const section = gameState.section;
      if (section.mode === "battle") {
        this.sharkSpawnCount = Math.floor(5);
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

    this.sharkSpawnTimer -= deltaTime;
    if (game.gameState.mode === "inGame") {
      const section = game.gameState.section;
      if (section.mode === "battle") {
        if (this.sharkSpawnTimer <= 0 && this.sharkSpawnCount > 0) {
          this.sharkSpawnCount--;
          this.sharkSpawnTimer = 3;
          const dpsSample = getDpsSample(section.level, this.triggerTime);
          Array.from({
            length: 2 + Math.floor((game.gameState.players.length - 1) * 0.8),
          }).forEach((_, i) => {
            const position: Vector.Vector3 = [
              Math.random() * 50 - 25,
              60,
              Math.random() * 30 + 70,
            ];
            this.objects.push({
              id: uuidv4(),
              type: "plant",
              position,
              rotation: [0, 0, 0, 0],
              health: 20 + dpsSample * 0.6,
              maxHealth: 20 + dpsSample * 0.6,
              reward: [
                {
                  type: "exp",
                  value: 0.25,
                  damageReturn: true,
                },
              ],
              targetPoint: [Math.random() * 16 - 8, 2, Math.random() * 10 - 5],
              moveSpeed: 30,
              startTime: this.time,
            });
          });
        }
      }
    }

    const sharkOnShip = this.objects.filter((object) => {
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
        object.health = Math.max(
          0,
          object.health - object.maxHealth * 0.05 * deltaTime
        );
      }
      return distance < 0.1;
    });
    game.damage2Ship(Math.max(4, sharkOnShip.length) * deltaTime);

    if (this.objects.length === 0 && this.sharkSpawnCount === 0) {
      game.addSkill4Event();
      game.announcement({
        title: {
          ja: "サメ襲撃撃退成功",
          en: "Shark Attack Repelled",
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
          <SharkView
            key={object.id}
            object={object}
            attack2Objet={props.attack2Object}
          />
        ))}
      </>
    );
  }
}

import { v4 as uuidv4 } from "uuid";
import { SnatchCompanyEvent } from "./snatchCompanyEvent";
import { BattleSection, GameStateInGame, SnatchCompanyObject } from "../type";
import { ReactElement, useCallback } from "react";
import {
  Meteorite,
  MovedSlot,
  Resource,
} from "../../../unit/package/SnatchCompany/main";
import { Vector, getDpsSample } from "../util";
import { SnatchCompany } from "..";
import { FunctionEnv } from "../../../../lib/mirage-x/common/interactionEvent";
import { HealthView } from "../../render/common/hpView";
import { Slot } from "../../../unit/package/Primitive/main";

const MeteoriteView = (props: {
  object: SnatchCompanyObject;
  attack2Objet: SnatchCompany["attack2Object"];
}) => {
  const onHit = useCallback(
    (env: FunctionEnv, hitPoint: [number, number, number]) => {
      props.attack2Objet(env.userId, props.object.id, hitPoint);
    },
    [props.attack2Objet, props.object.id]
  );
  return (
    <MovedSlot
      position={props.object.position}
      move={Vector.mul(Vector.normalize(props.object.position), -5)}
      moveTime={100}
    >
      <Resource onHit={onHit}>
        <Slot scale={[5, 5, 5]}>
          <Meteorite />
        </Slot>
      </Resource>
      {props.object.health < props.object.maxHealth && (
        <HealthView
          position={[0, 25, 0]}
          scale={[20, 20, 20]}
          health={props.object.health}
          maxHealth={props.object.maxHealth}
        />
      )}
    </MovedSlot>
  );
};

export class MeteoriteFall extends SnatchCompanyEvent {
  code = "MeteoriteFall";
  title = {
    ja: "隕石落下",
    en: "Meteorite Fall",
  };

  description = {
    ja: "隕石が船に向かって落下しています",
    en: "Meteorites are falling towards the ship",
  };

  constructor(triggerTime: number) {
    super(triggerTime);
    this.drawOnShip = this.drawOnShip.bind(this);
  }

  override start(gameState: GameStateInGame<BattleSection>): void {
    super.start(gameState);
    const dpsSample = getDpsSample(gameState.section.level, this.triggerTime);
    if (gameState.mode === "inGame") {
      const section = gameState.section;
      if (section.mode === "battle") {
        Array.from({ length: 1 }).forEach((_, i) => {
          const position: Vector.Vector3 = [Math.random() * 80 - 50, 50, 100];
          this.objects.push({
            id: uuidv4(),
            type: "mineral",
            position,
            rotation: [0, 0, 0, 0],
            health:
              100 +
              (1 + (gameState.players.length - 1) * 0.8) * dpsSample * 4.5,
            maxHealth:
              100 +
              (1 + (gameState.players.length - 1) * 0.8) * dpsSample * 4.5,
            reward: [
              {
                type: "exp",
                value: 0.25,
                damageReturn: true,
              },
            ],
          });
        });
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
    this.objects.forEach((object) => {
      const currentPosition = Vector.add(
        object.position,
        Vector.mul(Vector.normalize(object.position), -this.time * 5)
      );
      const distance = Vector.distance(currentPosition, [0, 0, 0]);
      if (distance < 8) {
        object.health = 0;
        game.damage2Ship(Math.min(200, 50 + game.gameState.section.level * 30));
      }
    });

    if (this.objects.length === 0) {
      game.addSkill4Event();
      game.announcement({
        title: {
          ja: "隕石撃をやり過ごした",
          en: "You have survived the meteorite strike",
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
          <MeteoriteView
            key={object.id}
            object={object}
            attack2Objet={props.attack2Object}
          />
        ))}
      </>
    );
  }
}

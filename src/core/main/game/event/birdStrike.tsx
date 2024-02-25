import { v4 as uuidv4 } from "uuid";
import { SnatchCompanyEvent } from "./snatchCompanyEvent";
import { BattleSection, GameStateInGame, Object } from "../type";
import { ReactElement, useCallback } from "react";
import {
  Bird,
  MovedSlot,
  Resource,
} from "../../../unit/package/SnatchCompany/main";
import { Vector } from "../util";
import { Box } from "../../../unit/package/ProceduralMesh/main";
import { SnatchCompany } from "..";
import { FunctionEnv } from "../../../../lib/mirage-x/common/interactionEvent";
import { HealthView } from "../../render/common/hpView";
import { Slot } from "../../../unit/package/Primitive/main";

const BirdView = (props: {
  object: Object;
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
        <Slot scale={[8, 8, 8]}>
          <Bird />
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

export class BirdStrike extends SnatchCompanyEvent {
  code = "BirdStrike";
  title = {
    ja: "バードストライク",
    en: "Bird Strike",
  };

  description = {
    ja: "鳥の群れから船を守ろう",
    en: "Protect the ship from the flock of birds",
  };

  constructor(triggerTime: number) {
    super(triggerTime);
    this.drawOnShip = this.drawOnShip.bind(this);
  }

  override start(gameState: GameStateInGame<BattleSection>): void {
    super.start(gameState);
    if (gameState.mode === "inGame") {
      const section = gameState.section;
      if (section.mode === "battle") {
        Array.from({
          length: Math.floor(
            5 +
              gameState.players.length * 2 * ([2, 3, 5, 8][section.level] ?? 5)
          ),
        }).forEach((_, i) => {
          const position: Vector.Vector3 = [
            Math.random() * 100 - 50,
            Math.random() * 10 + 5,
            Math.random() * 30 + 70,
          ];
          this.objects.push({
            id: uuidv4(),
            type: "plant",
            position,
            rotation: [0, 0, 0, 0],
            health: 30 + section.level ** 2 * 5,
            maxHealth: 30 + section.level ** 2 * 5,
            value: 0,
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
      if (distance < 5) {
        object.health = 0;
        game.damage2Ship(10 + Math.min(70, game.gameState.section.level * 20));
      }
    });

    if (this.objects.length === 0) {
      game.addSkill4Event();
      game.announcement({
        title: {
          ja: "バードストライク撃退成功",
          en: "Bird Strike Repelled",
        },
        description: {
          ja: "おめでとう。レアスキルを1つ獲得しました。",
          en: "Congratulations. You have acquired one rare skill.",
        },
        duration: 3,
      });
      this.state = "finished";
    }
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

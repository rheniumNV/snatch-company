import { BattleSection, GameStateInGame, LocaleText, Object } from "../type";
import { SnatchCompany } from "..";
import { JSXElementConstructor, ReactElement } from "react";
import { Box } from "../../../unit/package/ProceduralMesh/main";
import { MovedSlot, Resource } from "../../../unit/package/SnatchCompany/main";
import { Vector } from "../util";

export abstract class SnatchCompanyEvent {
  abstract code: string;
  abstract title: LocaleText;
  abstract description: LocaleText;
  state: "pending" | "processing" | "finished" = "pending";
  triggerTime: number;
  time = 0;
  objects: Object[] = [];
  constructor(triggerTime: number) {
    this.triggerTime = triggerTime;
  }

  start(gameState: GameStateInGame<BattleSection>): void {
    this.state = "processing";
  }

  update(
    game: {
      gameState: GameStateInGame<BattleSection>;
      damage2Ship: SnatchCompany["damage2Ship"];
      addSkill4Event: SnatchCompany["addSkill4Event"];
      announcement: SnatchCompany["announcement"];
    },
    deltaTime: number
  ): void {
    this.time += deltaTime;
    this.objects = this.objects.filter((object) => object.health > 0);
  }

  drawOnShip(props: {
    gameState: GameStateInGame<BattleSection>;
    attack2Object: SnatchCompany["attack2Object"];
  }): ReactElement {
    return <></>;
  }
}

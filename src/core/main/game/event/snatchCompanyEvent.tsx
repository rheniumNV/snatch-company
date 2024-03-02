import {
  BattleSection,
  GameStateInGame,
  LocaleText,
  SnatchCompanyObject,
} from "../type";
import { SnatchCompany } from "..";
import { ReactElement } from "react";

export abstract class SnatchCompanyEvent {
  abstract code: string;
  abstract title: LocaleText;
  abstract description: LocaleText;
  state: "pending" | "processing" | "finished" = "pending";
  triggerTime: number;
  time = 0;
  objects: SnatchCompanyObject[] = [];
  solvePoint: (x: number, z: number) => number;
  constructor(
    triggerTime: number,
    solvePoint: (x: number, z: number) => number
  ) {
    this.triggerTime = triggerTime;
    this.solvePoint = solvePoint;
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
      addEvent: (event: SnatchCompanyEvent) => void;
    },
    deltaTime: number
  ): void {
    this.time += deltaTime;
  }

  drawOnShip(props: {
    gameState: GameStateInGame<BattleSection>;
    attack2Object: SnatchCompany["attack2Object"];
  }): ReactElement {
    return <></>;
  }
}

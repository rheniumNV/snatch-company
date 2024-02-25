import { useCallback, useEffect, useRef, useState } from "react";
import { SnatchCompany } from "../game";
import { LobbyRenderer } from "./scene/lobby";
import { InGameRenderer } from "./scene/inGame";
import { ResultRenderer } from "./scene/result";
import { StyledSpace } from "./style";
import { DamageTextManager } from "./common/damageTextManaget";
import { Vector } from "../game/util";
import { ShipRenderer } from "./common/shipRenderer";

const GameRenderer = (props: { game: SnatchCompany; effect: () => void }) => {
  const startGame = useCallback(() => {
    props.game.startGame();
    props.effect();
  }, [props.game]);
  const addPlayer = useCallback(
    (playerId: string) => {
      props.game.addPlayer(playerId);
      props.effect();
    },
    [props.game]
  );

  const startNextSection = useCallback(() => {
    props.game.startNextSection();
    props.effect();
  }, [props.game]);

  const resetGame = useCallback(() => {
    props.game.resetGame();
    props.effect();
  }, [props.game]);

  const attack2Object = useCallback(
    (playerId: string, objectId: string, hitPoint: Vector.Vector3) => {
      const result = props.game.attack2Object(playerId, objectId, hitPoint);
      props.effect();
      return result;
    },
    [props.game]
  );

  const selectSkillInCheckpoint = useCallback(
    (playerId: string, index1: number, index2: number) => {
      props.game.selectSkillInCheckpoint(playerId, index1, index2);
      props.effect();
    },
    [props.game]
  );

  const setCallback = useCallback(
    (callbacks: SnatchCompany["callbacks"]) => {
      props.game.setCallback(callbacks);
    },
    [props.game]
  );

  const clearCallback = useCallback(
    (callback: Function) => {
      props.game.clearCallback(callback);
    },
    [props.game]
  );

  switch (props.game.gameState.mode) {
    case "lobby":
      return (
        <LobbyRenderer
          gameState={props.game.gameState}
          startGame={startGame}
          addPlayer={addPlayer}
        />
      );
    case "inGame":
      return (
        <>
          <InGameRenderer
            gameState={props.game.gameState}
            startNextSection={startNextSection}
            attack2Object={attack2Object}
            addPlayer={addPlayer}
            selectSkillInCheckpoint={selectSkillInCheckpoint}
            setCallback={setCallback}
            clearCallback={clearCallback}
          />
          <DamageTextManager
            setCallback={setCallback}
            clearCallback={clearCallback}
          />
        </>
      );
    case "result":
      return (
        <ResultRenderer
          gameState={props.game.gameState}
          resetGame={resetGame}
        />
      );
  }
};

export const Main = () => {
  const [, _setTime] = useState(0);
  const effect = useCallback(() => _setTime(performance.now()), []);

  const gameRef = useRef<SnatchCompany>();
  const prevTimeRef = useRef<number>(performance.now());
  useEffect(() => {
    gameRef.current = new SnatchCompany();
    const interval = setInterval(() => {
      const deltaTime = performance.now() - prevTimeRef.current;
      prevTimeRef.current = performance.now();
      gameRef.current?.updateGame(deltaTime / 1000);
      effect();
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <StyledSpace>
      <ShipRenderer />
      {gameRef.current && (
        <GameRenderer game={gameRef.current} effect={effect} />
      )}
    </StyledSpace>
  );
};

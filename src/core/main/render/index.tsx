import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SnatchCompany } from "../game";
import { LobbyRenderer } from "./scene/lobby";
import { InGameRenderer } from "./scene/inGame";
import { ResultRenderer } from "./scene/result";
import { StyledSpace } from "./style";
import { DamageTextManager } from "./common/damageTextManaget";
import { Vector, getIconUrl } from "../game/util";
import { ShipRenderer } from "./common/shipRenderer";
import { GameState } from "../game/type";
import {
  BgmManager,
  LobbyRoom,
  LocalView,
  LocaleSpace,
  SkillUi,
  StatusUi,
  UserJoinPanel,
  UserJoinPanelElement,
} from "../../unit/package/SnatchCompany/main";
import { Slot } from "../../unit/package/Primitive/main";
import { FunctionEnv } from "../../../lib/mirage-x/common/interactionEvent";
import { GunRenderer } from "./common/gunRenderer";

const round = (value: number, digit: number) => {
  const pow = Math.pow(10, digit);
  return Math.round(value * pow) / pow;
};

const roundString = (value: number, digit: number) => {
  const valueString = value.toString();
  const index = valueString.indexOf(".");
  if (index === -1) {
    return valueString;
  }
  return valueString.slice(0, index + digit + 1);
};

const rarityOrder = { normal: 0, rare: 1, epic: 2 };

const PlayerStatusUi = (props: {
  active: boolean;
  player: SnatchCompany["gameState"]["players"][number];
}) => {
  const attackBase = useMemo(
    () => `${round(props.player.baseStatus.attack, 1)}`,
    [props.player.baseStatus.attack]
  );
  const attackAdd = useMemo(
    () =>
      `${
        props.player.passiveStatusUpper.attack.add >= 0 ? "+" : ""
      }${roundString(props.player.passiveStatusUpper.attack.add, 1)}`,
    [props.player.passiveStatusUpper.attack.add]
  );
  const attackRate = useMemo(
    () =>
      `${
        props.player.passiveStatusUpper.attack.rate >= 0 ? "+" : ""
      }${roundString(props.player.passiveStatusUpper.attack.rate * 100, 2)}%`,
    [props.player.passiveStatusUpper.attack.rate]
  );
  const attackTotal = useMemo(
    () => `${roundString(props.player.finalStatus.attack, 1)}`,
    [props.player.finalStatus.attack]
  );

  const attackSpeedBase = useMemo(
    () => `${roundString(props.player.baseStatus.attackSpeed, 1)}`,
    [props.player.baseStatus.attackSpeed]
  );
  const attackSpeedAdd = useMemo(
    () =>
      `${
        props.player.passiveStatusUpper.attackSpeed.add >= 0 ? "+" : ""
      }${roundString(props.player.passiveStatusUpper.attackSpeed.add, 1)}`,
    [props.player.passiveStatusUpper.attackSpeed.add]
  );
  const attackSpeedRate = useMemo(
    () =>
      `${
        props.player.passiveStatusUpper.attackSpeed.rate >= 0 ? "+" : ""
      }${roundString(
        props.player.passiveStatusUpper.attackSpeed.rate * 100,
        2
      )}%`,
    [props.player.passiveStatusUpper.attackSpeed.rate]
  );
  const attackSpeedTotal = useMemo(
    () => `${roundString(props.player.finalStatus.attackSpeed, 1)}`,
    [props.player.finalStatus.attackSpeed]
  );

  const chargeEnergyBase = useMemo(
    () => `${roundString(props.player.baseStatus.chargeEnergy, 1)}`,
    [props.player.baseStatus.chargeEnergy]
  );
  const chargeEnergyAdd = useMemo(
    () =>
      `${
        props.player.passiveStatusUpper.chargeEnergy.add >= 0 ? "+" : ""
      }${roundString(props.player.passiveStatusUpper.chargeEnergy.add, 1)}`,
    [props.player.passiveStatusUpper.chargeEnergy.add]
  );
  const chargeEnergyRate = useMemo(
    () =>
      `${
        props.player.passiveStatusUpper.chargeEnergy.rate >= 0 ? "+" : ""
      }${roundString(
        props.player.passiveStatusUpper.chargeEnergy.rate * 100,
        2
      )}%`,
    [props.player.passiveStatusUpper.chargeEnergy.rate]
  );
  const chargeEnergyTotal = useMemo(
    () => `${roundString(props.player.finalStatus.chargeEnergy, 1)}`,
    [props.player.finalStatus.chargeEnergy]
  );

  const maxEnergyBase = useMemo(
    () => `${roundString(props.player.baseStatus.maxEnergy, 1)}`,
    [props.player.baseStatus.maxEnergy]
  );
  const maxEnergyAdd = useMemo(
    () =>
      `${
        props.player.passiveStatusUpper.maxEnergy.add >= 0 ? "+" : ""
      }${roundString(props.player.passiveStatusUpper.maxEnergy.add, 1)}`,
    [props.player.passiveStatusUpper.maxEnergy.add]
  );
  const maxEnergyRate = useMemo(
    () =>
      `${
        props.player.passiveStatusUpper.maxEnergy.rate >= 0 ? "+" : ""
      }${roundString(
        props.player.passiveStatusUpper.maxEnergy.rate * 100,
        2
      )}%`,
    [props.player.passiveStatusUpper.maxEnergy.rate]
  );
  const maxEnergyTotal = useMemo(
    () => `${roundString(props.player.finalStatus.maxEnergy, 1)}`,
    [props.player.finalStatus.maxEnergy]
  );

  const criticalTotal = useMemo(
    () => `${roundString(props.player.finalStatus.critical * 100, 2)}%`,
    [props.player.finalStatus.critical]
  );

  const criticalDamageTotal = useMemo(
    () =>
      `${roundString(
        (1.5 + props.player.finalStatus.criticalDamage) * 100,
        2
      )}%`,
    [props.player.finalStatus.criticalDamage]
  );

  const skills = useMemo(
    () =>
      Object.entries(
        props.player.skills.reduce(
          (acc, skill, index) => {
            const key = skill.code;
            if (acc[key] === undefined) {
              acc[key] = { count: 1, skills: [skill] };
            } else {
              acc[key].count++;
              acc[key].skills.push(skill);
            }
            return acc;
          },
          {} as {
            [key: string]: {
              count: number;
              skills: SnatchCompany["gameState"]["players"][number]["skills"][number][];
            };
          }
        )
      )
        .sort(([, value1], [, value2]) => {
          return (
            rarityOrder[value2.skills[0].rarity] -
            rarityOrder[value1.skills[0].rarity]
          );
        })
        .map(([key, value]) => value),
    [props.player.skills.length]
  );

  return (
    <Slot active={props.active}>
      <StatusUi
        attackBase={attackBase}
        attackAdd={attackAdd}
        attackRate={attackRate}
        attackTotal={attackTotal}
        attackSpeedBase={attackSpeedBase}
        attackSpeedAdd={attackSpeedAdd}
        attackSpeedRate={attackSpeedRate}
        attackSpeedTotal={attackSpeedTotal}
        chargeEnergyBase={chargeEnergyBase}
        chargeEnergyAdd={chargeEnergyAdd}
        chargeEnergyRate={chargeEnergyRate}
        chargeEnergyTotal={chargeEnergyTotal}
        maxEnergyBase={maxEnergyBase}
        maxEnergyAdd={maxEnergyAdd}
        maxEnergyRate={maxEnergyRate}
        maxEnergyTotal={maxEnergyTotal}
        criticalTotal={criticalTotal}
        criticalDamageTotal={criticalDamageTotal}
      >
        {skills.map((skill, index) => (
          <SkillUi
            key={skill.skills[0].code}
            nameEn={skill.skills[0].name.en}
            nameJa={skill.skills[0].name.ja}
            descriptionEn={skill.skills[0].effect
              .map((effect) => effect.description.en)
              .join("\n")}
            descriptionJa={skill.skills[0].effect
              .map((effect) => effect.description.ja)
              .join("\n")}
            icon={getIconUrl(skill.skills[0].icon)}
            frame={
              skill.skills[0].rarity === "epic"
                ? "Style/Color.Rarity.Epic"
                : skill.skills[0].rarity === "rare"
                ? "Style/Color.Rarity.Rare"
                : "Style/Color.Rarity.Common"
            }
            count={skill.count.toString()}
            orderOffset={-rarityOrder[skill.skills[0].rarity]}
          />
        ))}
      </StatusUi>
    </Slot>
  );
};

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

  const loadGameState = useCallback(
    (data: GameState) => props.game.loadGameState(data),
    [props.game]
  );

  switch (props.game.gameState.mode) {
    case "lobby":
      return (
        <LobbyRenderer
          gameState={props.game.gameState}
          startGame={startGame}
          addPlayer={addPlayer}
          loadGameState={loadGameState}
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

const UserElement = (props: {
  userId: string;
  remove: SnatchCompany["removePlayer"];
}) => {
  const remove = useCallback(() => {
    props.remove(props.userId);
  }, [props.userId]);
  return <UserJoinPanelElement playerId={props.userId} remove={remove} />;
};

export const Main = () => {
  const [, _setTime] = useState(0);
  const effect = useCallback(() => _setTime(performance.now()), []);
  const [openingProcessing, setOpeningProcessing] = useState(false);

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

  const startOpeningRef = useRef(() => {});
  const back2LobbyRef = useRef(() => {});

  const addUser = useCallback((env: FunctionEnv) => {
    gameRef.current?.addPlayer(env.userId);
    effect();
  }, []);

  const startGame = useCallback(() => {
    startOpeningRef.current();
    setOpeningProcessing(true);
  }, [setOpeningProcessing]);

  const startGameRaw = useCallback(() => {
    gameRef.current?.startGame();
    setOpeningProcessing(false);
  }, []);

  return (
    <StyledSpace>
      <LocaleSpace>
        <ShipRenderer />
        {gameRef.current && (
          <>
            <GameRenderer game={gameRef.current} effect={effect} />
            <BgmManager
              bgmNumber={
                openingProcessing
                  ? -1
                  : gameRef.current?.gameState.mode === "inGame"
                  ? gameRef.current.gameState.section.mode === "battle"
                    ? gameRef.current?.gameState.section.bossEvent !== undefined
                      ? 3
                      : 0
                    : 1
                  : 2
              }
              eventMode={
                gameRef.current?.gameState.mode === "inGame" &&
                gameRef.current?.gameState.section.mode === "battle" &&
                gameRef.current?.gameState.section.events.some(
                  (event) => event.state === "processing"
                )
              }
            />
            <Slot
              active={!openingProcessing}
              position={
                gameRef.current.gameState.mode === "inGame" &&
                gameRef.current.gameState.section.mode === "battle"
                  ? [0, 1.5, -4]
                  : [0, 1.5, 2]
              }
              rotation={
                gameRef.current.gameState.mode === "inGame" &&
                gameRef.current.gameState.section.mode === "battle"
                  ? [0, 1, 0, 0]
                  : [0, 0, 0, 0]
              }
              scale={[2, 2, 2]}
            >
              <UserJoinPanel
                addUser={addUser}
                startGame={startGame}
                activeGameStartButton={
                  gameRef.current.gameState.players.length > 0 &&
                  gameRef.current.gameState.mode === "lobby"
                }
              >
                {gameRef.current?.gameState.players.map((player) => {
                  return (
                    gameRef.current && (
                      <UserElement
                        key={player.id}
                        userId={player.id}
                        remove={gameRef.current.removePlayer.bind(
                          gameRef.current
                        )}
                      />
                    )
                  );
                })}
              </UserJoinPanel>
            </Slot>
            <LobbyRoom
              startGame={startGameRaw}
              dynamicImpulseTriggerRefs={{
                startOpening: startOpeningRef,
                back2Lobby: back2LobbyRef,
              }}
            />
            <Slot position={[0, 2, 3]}>
              {gameRef.current.gameState.players.map(
                (player) =>
                  gameRef.current && (
                    <LocalView userId={player.id}>
                      <GunRenderer
                        key={player.id}
                        player={player}
                        setCallback={gameRef.current.setCallback.bind(
                          gameRef.current
                        )}
                        clearCallback={gameRef.current.clearCallback.bind(
                          gameRef.current
                        )}
                      />
                      <Slot position={[0, 1, 0]}>
                        <PlayerStatusUi
                          active={
                            gameRef.current.gameState.mode === "inGame" ||
                            gameRef.current.gameState.mode === "result"
                          }
                          player={player}
                        />
                      </Slot>
                    </LocalView>
                  )
              )}
            </Slot>
          </>
        )}
      </LocaleSpace>
    </StyledSpace>
  );
};

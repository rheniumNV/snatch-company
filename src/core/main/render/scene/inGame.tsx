import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Slot } from "../../../unit/package/Primitive/main";
import {
  Canvas,
  GridLayout,
  HorizontalLayout,
  LayoutElement,
  VerticalLayout,
} from "../../../unit/package/PrimitiveUix/main";
import { Box } from "../../../unit/package/ProceduralMesh/main";
import {
  StyledButton,
  StyledImage,
  StyledScrollArea,
  StyledText,
} from "../../../unit/package/StyledUix/main";
import { SnatchCompany } from "../../game";
import { ShipRenderer } from "../common/shipRenderer";
import { createNoise2D } from "simplex-noise";
import { ResourceRenderer } from "../common/resourceRenderer";
import { Color, Material } from "../style";
import { Vector } from "../../game/util";
import { GunRenderer } from "../common/gunRenderer";
import { FunctionEnv } from "../../../../lib/mirage-x/common/interactionEvent";
import {
  LocalView,
  MovedSlot,
  ShipDisplay,
} from "../../../unit/package/SnatchCompany/main";
import { CheckpointSection, GameStateInGame, Section } from "../../game/type";
import { AnnouncementManager } from "../common/announcementManager";

const noise2D = createNoise2D();
const solvePoint = (x: number, z: number) => (noise2D(x / 5, z / 5) + 1) / 2;

const terrainSize = 300;
const terrainResolution = 15;
const terrainHalfSize = terrainSize / 2 - 0.5;
const terrainOneSize = terrainSize / terrainResolution;

const Ground = (props: { shipPosition: [number, number, number] }) => {
  const gridShipPosition: [number, number, number] = useMemo(
    () => [
      Math.round(props.shipPosition[0] / terrainOneSize) * terrainOneSize,
      Math.round(props.shipPosition[1] / terrainOneSize) * terrainOneSize,
      Math.round(props.shipPosition[2] / terrainOneSize) * terrainOneSize,
    ],
    [
      Math.round(props.shipPosition[0] / terrainOneSize) * terrainOneSize,
      Math.round(props.shipPosition[1] / terrainOneSize) * terrainOneSize,
      Math.round(props.shipPosition[2] / terrainOneSize) * terrainOneSize,
    ]
  );

  return (
    <Slot>
      {Array.from({ length: terrainResolution * terrainResolution }).map(
        (_, i) => {
          const x = i % terrainResolution;
          const z = Math.floor(i / terrainResolution);
          const height = solvePoint(
            gridShipPosition[0] + x * terrainOneSize - terrainHalfSize,
            gridShipPosition[2] + z * terrainOneSize - terrainHalfSize
          );
          const key = `${
            gridShipPosition[0] + x * terrainOneSize - terrainHalfSize
          },${gridShipPosition[2] + z * terrainOneSize - terrainHalfSize}`;
          return (
            <Slot
              name={key}
              key={key}
              position={[
                gridShipPosition[0] + x * terrainOneSize - terrainHalfSize,
                -8 + height / 2,
                gridShipPosition[2] + z * terrainOneSize - terrainHalfSize,
              ]}
            >
              <Box scale={[terrainOneSize, height, terrainOneSize]} />
            </Slot>
          );
        }
      )}
    </Slot>
  );
};

const GlobalAnchor = (props: {
  position: [number, number, number];
  targetPosition: [number, number, number];
  moveSpeed: number;
  children: React.ReactElement | React.ReactElement[];
}) => {
  const [position, setPosition] = useState(props.position);
  const [move, setMove] = useState<Vector.Vector3>([0, 0, 0]);
  const [moveTime, setMoveTime] = useState(0);
  const timeLimitSentRef = useRef(false);

  useEffect(() => {
    const timeLimit =
      props.moveSpeed > 0
        ? Vector.distance(props.targetPosition, props.position) /
          props.moveSpeed
        : 0;
    const newMove = Vector.mul(
      Vector.normalize(Vector.sub(props.targetPosition, props.position)),
      -props.moveSpeed
    );
    const newPosition = Vector.mul(props.position, -1);

    if (timeLimit < 5) {
      if (timeLimitSentRef.current) return;
      setPosition(newPosition);
      setMove(newMove);
      setMoveTime(timeLimit);
      timeLimitSentRef.current = true;
      return;
    }
    timeLimitSentRef.current = false;
    const moveSub = Vector.distance(newMove, move);

    if (moveSub > 0.001) {
      setPosition(newPosition);
      setMove(newMove);
      setMoveTime(timeLimit);
    }
  }, [props.position, props.targetPosition, props.moveSpeed]);

  return (
    <MovedSlot position={position} move={move} moveTime={moveTime}>
      {props.children}
    </MovedSlot>
  );
};

const SkillSelection = (props: {
  gameState: GameStateInGame<CheckpointSection>;
  selectSkillInCheckpoint: SnatchCompany["selectSkillInCheckpoint"];
}) => {
  return (
    <LayoutElement>
      {props.gameState.players.map((player) => (
        <LocalView key={player.id} userId={player.id}>
          <VerticalLayout>
            <>
              {props.gameState.section.mode === "checkpoint" &&
                props.gameState.section.skillSelection[player.id].map(
                  ({ skills }, index1) => {
                    return (
                      <LayoutElement key={index1}>
                        <HorizontalLayout spacing={10}>
                          {skills.map((skill, index2) => (
                            <LayoutElement key={index2}>
                              <VerticalLayout>
                                <StyledText
                                  content={skill.name.ja}
                                  verticalAutoSize={true}
                                  horizontalAutoSize={true}
                                />
                                <StyledText
                                  content={skill.effect
                                    .map((e) => e.description.ja)
                                    .join("\n")}
                                  verticalAutoSize={true}
                                  horizontalAutoSize={true}
                                />
                                <LayoutElement minHeight={100}>
                                  <StyledButton
                                    onClick={() =>
                                      props.selectSkillInCheckpoint(
                                        player.id,
                                        index1,
                                        index2
                                      )
                                    }
                                    styledColor={Color.button}
                                  >
                                    <StyledText
                                      content="Select"
                                      horizontalAlign="Center"
                                      verticalAlign="Middle"
                                      styledColor={Color.buttonText}
                                    />
                                  </StyledButton>
                                </LayoutElement>
                              </VerticalLayout>
                            </LayoutElement>
                          ))}
                        </HorizontalLayout>
                      </LayoutElement>
                    );
                  }
                )}
            </>
          </VerticalLayout>
        </LocalView>
      ))}
    </LayoutElement>
  );
};

export const InGameRenderer = (props: {
  gameState: GameStateInGame<Section>;
  startNextSection: () => void;
  attack2Object: SnatchCompany["attack2Object"];
  addPlayer: (playerId: string) => void;
  selectSkillInCheckpoint: SnatchCompany["selectSkillInCheckpoint"];
  setCallback: SnatchCompany["setCallback"];
  clearCallback: SnatchCompany["clearCallback"];
  children?: ReactNode;
}) => {
  const addPlayerButtonOnClick = useCallback(
    (env: FunctionEnv) => {
      props.addPlayer(env.userId);
    },
    [props.addPlayer]
  );

  return (
    <Slot>
      <GlobalAnchor
        position={props.gameState.ship.position}
        targetPosition={
          props.gameState.section.mode === "battle"
            ? props.gameState.section.targetPoint
            : props.gameState.ship.position
        }
        moveSpeed={props.gameState.ship.speed}
      >
        <>
          {props.children}
          <Ground shipPosition={props.gameState.ship.position} />
          {props.gameState.mode === "inGame" &&
            props.gameState.section.mode === "battle" &&
            props.gameState.section.objects.map((object) => (
              <ResourceRenderer
                key={object.id}
                object={object}
                shipPosition={props.gameState.ship.position}
                attack2Object={props.attack2Object}
              />
            ))}
          {props.gameState.section.mode === "battle" ? (
            <Box
              position={props.gameState.section.targetPoint}
              scale={[1, 500, 1]}
            />
          ) : (
            <></>
          )}
        </>
      </GlobalAnchor>
      {props.gameState.section.mode === "checkpoint" ? (
        <Canvas position={[0, 1, 0]} size={[3000, 1000]}>
          <StyledImage />
          <VerticalLayout>
            <StyledText content="Checkpoint"></StyledText>

            <StyledButton onClick={props.startNextSection}>
              <StyledText
                content="Go Next"
                verticalAlign="Middle"
                horizontalAlign="Center"
              />
            </StyledButton>
          </VerticalLayout>
        </Canvas>
      ) : (
        <></>
      )}

      {props.gameState.section.mode === "checkpoint" ? (
        <Canvas size={[3000, 1000]} position={[0, 4, 3]}>
          <StyledImage styledMaterial={Material.background} />
          <VerticalLayout
            paddingBottom={50}
            paddingLeft={50}
            paddingRight={50}
            paddingTop={50}
          >
            <LayoutElement flexibleHeight={1}>
              <SkillSelection
                gameState={{
                  ...props.gameState,
                  section: props.gameState.section,
                }}
                selectSkillInCheckpoint={props.selectSkillInCheckpoint}
              />
            </LayoutElement>
            <LayoutElement minHeight={100}></LayoutElement>
          </VerticalLayout>
        </Canvas>
      ) : (
        <></>
      )}
      <Canvas size={[2000, 2000]} position={[0, 4, 0]}>
        <StyledImage styledMaterial={Material.background} />
        <VerticalLayout>
          <LayoutElement flexibleHeight={1}>
            <StyledScrollArea verticalFit="MinSize">
              <VerticalLayout forceExpandChildHeight={false}>
                {props.gameState.players.map((player) => (
                  <VerticalLayout
                    key={player.id}
                    forceExpandChildHeight={false}
                  >
                    <StyledText content={player.name} />
                    <StyledText
                      content={`攻撃力: ${Math.round(
                        player.finalStatus.attack
                      )} (${
                        Math.round(player.baseStatus.attack * 100) / 100
                      } + ${
                        Math.round(player.passiveStatusUpper.attack.add * 100) /
                        100
                      } +${Math.round(
                        player.passiveStatusUpper.attack.rate * 100
                      )}%)
クリティカル: ${Math.round(
                        player.finalStatus.critical * 100
                      )}% クリティカルダメージ${Math.round(
                        150 + player.finalStatus.criticalDamage * 100
                      )}%
攻撃速度: ${Math.round(player.finalStatus.attackSpeed * 100) / 100} (${
                        Math.round(player.baseStatus.attackSpeed * 100) / 100
                      }+${
                        Math.round(
                          player.passiveStatusUpper.attackSpeed.add * 100
                        ) / 100
                      } +${Math.round(
                        player.passiveStatusUpper.attackSpeed.rate * 100
                      )}%)
エネルギー回復: ${Math.round(player.finalStatus.chargeEnergy)} (${
                        Math.round(player.baseStatus.chargeEnergy * 100) / 100
                      } +${Math.round(
                        player.passiveStatusUpper.chargeEnergy.add
                      )} +${Math.round(
                        player.passiveStatusUpper.chargeEnergy.rate * 100
                      )}%)
最大エネルギー: ${Math.round(player.finalStatus.maxEnergy)} (${
                        Math.round(player.baseStatus.maxEnergy * 100) / 100
                      } +${
                        Math.round(
                          player.passiveStatusUpper.maxEnergy.add * 100
                        ) / 100
                      } +${Math.round(
                        player.passiveStatusUpper.maxEnergy.rate * 100
                      )}%)`}
                    />
                    <VerticalLayout paddingLeft={100}>
                      {player.skills.map((skill, index) => (
                        <LayoutElement key={index} minHeight={50}>
                          <HorizontalLayout>
                            <StyledText
                              content={skill.name.ja}
                              verticalAutoSize={true}
                              horizontalAutoSize={true}
                            />
                            <StyledText
                              content={skill.effect
                                .map((e) => e.description.ja)
                                .join("\n")}
                              verticalAutoSize={true}
                              horizontalAutoSize={true}
                            />
                            <StyledText
                              content={skill.effect
                                .map((e) => JSON.stringify(e.state))
                                .join("\n")}
                              verticalAutoSize={true}
                              horizontalAutoSize={true}
                            />
                          </HorizontalLayout>
                        </LayoutElement>
                      ))}
                    </VerticalLayout>
                  </VerticalLayout>
                ))}
              </VerticalLayout>
            </StyledScrollArea>
          </LayoutElement>
          <LayoutElement minHeight={100}>
            <StyledButton onClick={addPlayerButtonOnClick}>
              <StyledText
                content="Join"
                verticalAlign="Middle"
                horizontalAlign="Center"
              />
            </StyledButton>
          </LayoutElement>
        </VerticalLayout>
      </Canvas>
      <Slot position={[0, 2, 0]}>
        {props.gameState.players.map((player) => (
          <GunRenderer
            key={player.id}
            player={player}
            setCallback={props.setCallback}
            clearCallback={props.clearCallback}
          />
        ))}
      </Slot>
      <Slot position={[0, 3.5, 0]}>
        <ShipDisplay
          activeCollider={props.gameState.section.mode === "checkpoint"}
        >
          <VerticalLayout forceExpandChildHeight={false} spacing={10}>
            <LayoutElement minHeight={50}>
              <HorizontalLayout>
                <LayoutElement minWidth={200}>
                  <StyledText
                    content={`Lv${props.gameState.playerSkillLevel}`}
                    verticalAlign="Middle"
                  />
                </LayoutElement>
                <LayoutElement flexibleWidth={1}>
                  <StyledImage defaultColor={[0.3, 0.3, 0.3, 1]} />
                  <HorizontalLayout>
                    <LayoutElement flexibleWidth={props.gameState.resource.exp}>
                      <StyledImage defaultColor={[0.8, 0.8, 0, 1]} />
                    </LayoutElement>

                    <LayoutElement
                      flexibleWidth={
                        props.gameState.resource.nextLevelupExp -
                        props.gameState.resource.exp
                      }
                    />
                  </HorizontalLayout>
                </LayoutElement>
              </HorizontalLayout>
            </LayoutElement>
            <LayoutElement minHeight={100}>
              <HorizontalLayout>
                <LayoutElement minWidth={200}>
                  <StyledText content="Shield" verticalAlign="Middle" />
                </LayoutElement>
                <LayoutElement flexibleWidth={1}>
                  <StyledImage defaultColor={[0.3, 0.3, 0.3, 1]} />

                  <HorizontalLayout horizontalAlign="Left">
                    <LayoutElement flexibleWidth={props.gameState.ship.shield}>
                      <StyledImage defaultColor={[0, 0.8, 0.8, 1]} />
                    </LayoutElement>
                    <LayoutElement
                      flexibleWidth={
                        props.gameState.ship.maxShield -
                        props.gameState.ship.shield
                      }
                    />
                  </HorizontalLayout>
                </LayoutElement>
              </HorizontalLayout>
            </LayoutElement>
            <LayoutElement minHeight={100}>
              <HorizontalLayout>
                <LayoutElement minWidth={200}>
                  <StyledText content="Health" verticalAlign="Middle" />
                </LayoutElement>
                <LayoutElement flexibleWidth={1}>
                  <StyledImage defaultColor={[0.3, 0.3, 0.3, 1]} />
                  <HorizontalLayout horizontalAlign="Left">
                    <LayoutElement flexibleWidth={props.gameState.ship.health}>
                      <StyledImage defaultColor={[0, 0.8, 0, 1]} />
                    </LayoutElement>
                    <LayoutElement
                      flexibleWidth={
                        props.gameState.ship.maxHealth -
                        props.gameState.ship.health
                      }
                    />
                  </HorizontalLayout>
                </LayoutElement>
              </HorizontalLayout>
            </LayoutElement>
          </VerticalLayout>
          <AnnouncementManager
            setCallback={props.setCallback}
            clearCallback={props.clearCallback}
          />
        </ShipDisplay>
      </Slot>
      <Slot>
        {props.gameState.section.mode === "battle" ? (
          [
            ...props.gameState.section.events,
            ...props.gameState.section.subEvents,
          ]
            .filter((event) => event.state === "processing")
            .map(
              (event) =>
                props.gameState.section.mode === "battle" && (
                  <event.drawOnShip
                    key={event.triggerTime}
                    gameState={{
                      ...props.gameState,
                      section: props.gameState.section,
                    }}
                    attack2Object={props.attack2Object}
                  />
                )
            )
        ) : (
          <></>
        )}
      </Slot>
    </Slot>
  );
};

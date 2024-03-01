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
  Checkpoint,
  CheckpointMarker,
  CheckpointUi,
  EffectManager,
  LocalView,
  MovedSlot,
  SeManager,
  ShieldAlert,
  ShipDisplay,
  Triangle,
  UserJoinPanelElement,
} from "../../../unit/package/SnatchCompany/main";
import { CheckpointSection, GameStateInGame, Section } from "../../game/type";
import { AnnouncementManager } from "../common/announcementManager";
import { PlayerSkillSelect } from "../common/playerSkilSelect";
import { getTrianglePoint } from "../../game/skill/util";

const terrainSize = 300;
const terrainResolution = 15;
const terrainHalfSize = terrainSize / 2 - 0.5;
const terrainOneSize = terrainSize / terrainResolution;

const solveGridPoint = (x: number, z: number) => {
  const x1 = Math.round(x / terrainOneSize) * terrainOneSize;
  const z1 = Math.round(z / terrainOneSize) * terrainOneSize;
  const x2 = x1 + terrainOneSize;
  const z2 = z1;
  const x3 = x1;
  const z3 = z1 + terrainOneSize;
  const x4 = x1 + terrainOneSize;
  const z4 = z1 + terrainOneSize;
  const isUpSide = (x - x1) * (z - z1) > (x2 - x1) * (z4 - z1);

  // return getTrianglePoint(isUpSide?[x1,0,z1])
};

const roundTrianglePosition = (position: [number, number, number]) => [
  Math.round(position[0] / 5) * 5,
  position[1],
  Math.round(position[2] / 5) * 5,
];

const Ground = (props: {
  shipPosition: [number, number, number];
  solvePoint: (x: number, y: number) => number;
}) => {
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
          const point1Height = props.solvePoint(
            gridShipPosition[0] + x * terrainOneSize - terrainHalfSize,
            gridShipPosition[2] + z * terrainOneSize - terrainHalfSize
          );
          const point2Height = props.solvePoint(
            gridShipPosition[0] + (x + 1) * terrainOneSize - terrainHalfSize,
            gridShipPosition[2] + z * terrainOneSize - terrainHalfSize
          );
          const point3Height = props.solvePoint(
            gridShipPosition[0] + x * terrainOneSize - terrainHalfSize,
            gridShipPosition[2] + (z + 1) * terrainOneSize - terrainHalfSize
          );
          const point4Height = props.solvePoint(
            gridShipPosition[0] + (x + 1) * terrainOneSize - terrainHalfSize,
            gridShipPosition[2] + (z + 1) * terrainOneSize - terrainHalfSize
          );
          const point1Color: Vector.Vector4 = [
            Math.min(0.9, (point1Height * 0.5) ** 1.5 * 0.02),
            0.7,
            Math.min(0.9, (point1Height * 0.5) ** 1.5 * 0.02),
            0,
          ];
          const point2Color: Vector.Vector4 = [
            Math.min(0.9, (point2Height * 0.5) ** 1.5 * 0.02),
            0.7,
            Math.min(0.9, (point2Height * 0.5) ** 1.5 * 0.02),
            0,
          ];
          const point3Color: Vector.Vector4 = [
            Math.min(0.9, (point3Height * 0.5) ** 1.5 * 0.02),
            0.7,
            Math.min(0.9, (point3Height * 0.5) ** 1.5 * 0.02),
            0,
          ];
          const point4Color: Vector.Vector4 = [
            Math.min(0.9, (point4Height * 0.5) ** 1.5 * 0.02),
            0.7,
            Math.min(0.9, (point4Height * 0.5) ** 1.5 * 0.02),
            0,
          ];
          const key = `${
            gridShipPosition[0] + x * terrainOneSize - terrainHalfSize
          },${gridShipPosition[2] + z * terrainOneSize - terrainHalfSize}`;
          return (
            // <Slot
            //   name={key}
            //   key={key}
            //   position={[
            //     gridShipPosition[0] + x * terrainOneSize - terrainHalfSize,
            //     -8 + height / 2,
            //     gridShipPosition[2] + z * terrainOneSize - terrainHalfSize,
            //   ]}
            // >
            //   <Box scale={[terrainOneSize, height, terrainOneSize]} />
            // </Slot>
            <Slot
              key={key}
              position={[
                gridShipPosition[0] + x * terrainOneSize - terrainHalfSize,
                -9,
                gridShipPosition[2] + z * terrainOneSize - terrainHalfSize,
              ]}
            >
              <Triangle
                point1={[terrainOneSize, point2Height, 0]}
                point1Color={point2Color}
                point2={[0, point1Height, 0]}
                point2Color={point1Color}
                point3={[0, point3Height, terrainOneSize]}
                point3Color={point3Color}
              />
              <Triangle
                point1={[terrainOneSize, point2Height, 0]}
                point1Color={point2Color}
                point2={[0, point3Height, terrainOneSize]}
                point2Color={point3Color}
                point3={[terrainOneSize, point4Height, terrainOneSize]}
                point3Color={point4Color}
              />
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
  sectionLevel: number;
  children: React.ReactElement | React.ReactElement[];
}) => {
  const [position, setPosition] = useState(props.position);
  const [move, setMove] = useState<Vector.Vector3>([0, 0, 0]);
  const [moveTime, setMoveTime] = useState(0);
  const timeLimitSentRef = useRef(false);
  const prevSectionLevelRef = useRef(0);

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

    if (moveSub > 0.001 || props.sectionLevel !== prevSectionLevelRef.current) {
      setPosition(newPosition);
      setMove(newMove);
      setMoveTime(timeLimit);
      prevSectionLevelRef.current = props.sectionLevel;
    }
  }, [
    props.position,
    props.targetPosition,
    props.moveSpeed,
    props.sectionLevel,
  ]);

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
    <>
      {props.gameState.players.map((player) => (
        <PlayerSkillSelect
          key={player.id}
          player={player}
          selection={props.gameState.section.skillSelection[player.id]}
          selectSkill={props.selectSkillInCheckpoint}
        />
      ))}
    </>
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
  solvePoint: (x: number, y: number) => number;
  children?: ReactNode;
}) => {
  const addPlayerButtonOnClick = useCallback(
    (env: FunctionEnv) => {
      props.addPlayer(env.userId);
    },
    [props.addPlayer]
  );

  const setupPlayerCount =
    props.gameState.section.mode === "checkpoint"
      ? Object.entries(props.gameState.section.skillSelection).filter(
          ([, select]) => select.length > 0
        ).length
      : 0;

  const clearedSectionNumber =
    props.gameState.section.mode === "checkpoint"
      ? props.gameState.section.nextSectionLevel
      : props.gameState.section.level;
  const arrivedCheckpointNear =
    props.gameState.section.mode === "battle"
      ? Vector.distance(
          props.gameState.section.targetPoint,
          props.gameState.ship.position
        ) < 90
      : false;

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
        sectionLevel={
          props.gameState.section.mode === "battle"
            ? props.gameState.section.level
            : -1
        }
      >
        <>
          {props.children}
          <Ground
            shipPosition={props.gameState.ship.position}
            solvePoint={props.solvePoint}
          />
          {props.gameState.mode === "inGame" &&
            props.gameState.section.mode === "battle" &&
            props.gameState.section.objects.map((object) => (
              <ResourceRenderer
                key={object.id}
                object={object}
                shipPosition={props.gameState.ship.position}
                attack2Object={props.attack2Object}
              />
            ))}{" "}
          {Array.from({ length: 5 }).map((_, i) => (
            <Slot key={i} position={[0, -8, 210 * 3 * i]}>
              {i < clearedSectionNumber + (arrivedCheckpointNear ? 1 : 0) ? (
                <Checkpoint />
              ) : (
                <CheckpointMarker />
              )}
            </Slot>
          ))}
        </>
      </GlobalAnchor>
      {props.gameState.section.mode === "checkpoint" ? (
        <Slot position={[0, 2.5, 3]} scale={[2, 2, 2]}>
          <CheckpointUi
            playerCount={`${setupPlayerCount}`}
            progress={props.gameState.section.nextSectionLevel}
            goNext={props.startNextSection}
          >
            {Object.entries(props.gameState.section.skillSelection)
              .filter(([, select]) => select.length > 0)
              .map(([playerId, select]) => (
                <UserJoinPanelElement playerId={playerId} />
              ))}
          </CheckpointUi>
        </Slot>
      ) : (
        <></>
      )}
      {props.gameState.section.mode === "checkpoint" ? (
        <SkillSelection
          gameState={{
            ...props.gameState,
            section: props.gameState.section,
          }}
          selectSkillInCheckpoint={props.selectSkillInCheckpoint}
        />
      ) : (
        <></>
      )}
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
        {props.gameState.section.mode === "battle" && [
          ,
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
            ),
          props.gameState.section.bossEvent &&
            props.gameState.section.bossEvent.state === "processing" && (
              <props.gameState.section.bossEvent.drawOnShip
                key={2}
                gameState={{
                  ...props.gameState,
                  section: props.gameState.section,
                }}
                attack2Object={props.attack2Object}
              />
            ),
        ]}
      </Slot>
      <ShieldAlert
        active={
          props.gameState.section.mode === "battle" &&
          props.gameState.ship.shield / props.gameState.ship.maxShield < 0.001
        }
      />
    </Slot>
  );
};

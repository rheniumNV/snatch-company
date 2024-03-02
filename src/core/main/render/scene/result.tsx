import { Slot } from "../../../unit/package/Primitive/main";
import {
  Canvas,
  VerticalLayout,
} from "../../../unit/package/PrimitiveUix/main";
import { GlobalScore } from "../../../unit/package/SnatchCompany/main";
import {
  StyledButton,
  StyledImage,
  StyledText,
} from "../../../unit/package/StyledUix/main";
import { GameStateResult } from "../../game/type";

export const ResultRenderer = (props: {
  gameState: GameStateResult;
  resetGame: () => void;
}) => {
  return (
    <>
      <Slot position={[0, 1, 3]}>
        <GlobalScore
          bossTime={
            props.gameState.bossClearTime
              ? `${Math.floor(props.gameState.bossClearTime * 10) / 10}`
              : "-"
          }
          damageTotal={`${props.gameState.players.reduce(
            (acc, player) =>
              acc +
              player.playerScore.totalDamage.event +
              player.playerScore.totalDamage.mineral +
              player.playerScore.totalDamage.plant,
            0
          )}`}
          damage2Events={`${props.gameState.players.reduce(
            (acc, player) => acc + player.playerScore.totalDamage.event,
            0
          )}`}
          damage2Minerals={`${props.gameState.players.reduce(
            (acc, player) => acc + player.playerScore.totalDamage.mineral,
            0
          )}`}
          damage2Plants={`${props.gameState.players.reduce(
            (acc, player) => acc + player.playerScore.totalDamage.plant,
            0
          )}`}
          killCountTotal={`${props.gameState.players.reduce(
            (acc, player) =>
              acc +
              player.playerScore.lastHit.event +
              player.playerScore.lastHit.mineral +
              player.playerScore.lastHit.plant,
            0
          )}`}
          killCount2Events={`${props.gameState.players.reduce(
            (acc, player) => acc + player.playerScore.lastHit.event,
            0
          )}`}
          killCount2Minerals={`${props.gameState.players.reduce(
            (acc, player) => acc + player.playerScore.lastHit.mineral,
            0
          )}`}
          killCount2Plants={`${props.gameState.players.reduce(
            (acc, player) => acc + player.playerScore.lastHit.plant,
            0
          )}`}
          attackCountTotal={
            props.gameState.players.reduce(
              (acc, player) => acc + player.playerScore.hitCount,
              0
            ) + ""
          }
          criticalCountTotal={
            props.gameState.players.reduce(
              (acc, player) => acc + player.playerScore.criticalCount,
              0
            ) + ""
          }
        />
      </Slot>
      <Canvas position={[4, 1, 3]}>
        <StyledImage defaultColor={[0.5, 0.5, 0.5, 1]} />
        <VerticalLayout>
          <StyledText content="Result" />
          <StyledButton onClick={props.resetGame}>
            <StyledText
              content="Reset"
              verticalAlign="Middle"
              horizontalAlign="Center"
            />
          </StyledButton>
        </VerticalLayout>
      </Canvas>
    </>
  );
};

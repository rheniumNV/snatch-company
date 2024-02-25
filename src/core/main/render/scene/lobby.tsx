import { useCallback } from "react";
import {
  Canvas,
  VerticalLayout,
} from "../../../unit/package/PrimitiveUix/main";
import {
  StyledButton,
  StyledImage,
  StyledText,
} from "../../../unit/package/StyledUix/main";
import { Material } from "../style";
import { GameStateLobby } from "../../game/type";
import { ShipRenderer } from "../common/shipRenderer";

export const LobbyRenderer = (props: {
  gameState: GameStateLobby;
  startGame: () => void;
  addPlayer: (playerId: string) => void;
}) => {
  const joinButtonOnClick = useCallback(
    (env: { userId: string }) => {
      props.addPlayer(env.userId);
    },
    [props.addPlayer]
  );

  return (
    <>
      <Canvas position={[0, 1, 3]}>
        <StyledImage
          defaultColor={[0.5, 0.5, 0.5, 1]}
          styledMaterial={Material.background}
        />
        <VerticalLayout>
          <StyledText content="Lobby" />
          <VerticalLayout>
            {props.gameState.players.map((player) => (
              <StyledText key={player.id} content={player.name} />
            ))}
          </VerticalLayout>
          <StyledButton onClick={joinButtonOnClick}>
            <StyledText
              content="Join"
              verticalAlign="Middle"
              horizontalAlign="Center"
            />
          </StyledButton>
          <StyledButton onClick={props.startGame}>
            <StyledText
              content="Start"
              verticalAlign="Middle"
              horizontalAlign="Center"
            />
          </StyledButton>
        </VerticalLayout>
      </Canvas>
    </>
  );
};

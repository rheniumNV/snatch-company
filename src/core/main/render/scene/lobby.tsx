import fs from "fs";
import { useCallback, useEffect } from "react";
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
  loadGameState: (data: GameStateLobby) => void;
}) => {
  const joinButtonOnClick = useCallback(
    (env: { userId: string }) => {
      props.addPlayer(env.userId);
    },
    [props.addPlayer]
  );

  const loadFromBackup = useCallback(() => {
    const data = fs.readFileSync("./backup/3.json", "utf-8");
    if (data) {
      props.loadGameState(JSON.parse(data));
    }
  }, [props.loadGameState]);

  useEffect(() => {
    // loadFromBackup();
  }, [loadFromBackup]);

  return (
    <>
      <Canvas position={[4, 1, 3]}>
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
          <StyledButton onClick={props.startGame}>
            <StyledText
              content="StartGame"
              verticalAlign="Middle"
              horizontalAlign="Center"
            />
          </StyledButton>
          <StyledButton onClick={loadFromBackup}>
            <StyledText
              content="LoadFromBackup"
              verticalAlign="Middle"
              horizontalAlign="Center"
            />
          </StyledButton>
        </VerticalLayout>
      </Canvas>
    </>
  );
};

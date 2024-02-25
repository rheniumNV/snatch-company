import {
  Canvas,
  VerticalLayout,
} from "../../../unit/package/PrimitiveUix/main";
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
    <Canvas position={[0, 1, 3]}>
      <StyledImage defaultColor={[0.5, 0.5, 0.5, 1]} />
      <VerticalLayout>
        <StyledText content="Result" />
        <VerticalLayout>
          {props.gameState.players.map((player) => (
            <StyledText key={player.id} content={player.name} />
          ))}
        </VerticalLayout>
        <StyledButton onClick={props.resetGame}>
          <StyledText
            content="Reset"
            verticalAlign="Middle"
            horizontalAlign="Center"
          />
        </StyledButton>
      </VerticalLayout>
    </Canvas>
  );
};

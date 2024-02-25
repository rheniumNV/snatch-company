import { Ship } from "../../../unit/package/SnatchCompany/main";
import { GameStateInGame, Section } from "../../game/type";

export const ShipRenderer = (props: {
  children?: React.ReactElement | React.ReactElement[];
}) => {
  return <Ship>{props.children}</Ship>;
};

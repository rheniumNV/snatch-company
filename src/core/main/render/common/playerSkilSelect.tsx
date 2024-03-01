import { useCallback } from "react";
import {
  LocalView,
  SkillSelectUi,
} from "../../../unit/package/SnatchCompany/main";
import { SnatchCompany } from "../../game";
import { CheckpointSection, Player } from "../../game/type";
import { Slot } from "../../../unit/package/Primitive/main";
import { getIconUrl } from "../../game/util";

const SkillSelect = (props: {
  index: number;
  position: [number, number, number];
  playerId: string;
  selection: CheckpointSection["skillSelection"][string][number];
  selectSkill: SnatchCompany["selectSkillInCheckpoint"];
}) => {
  const selectSkill1 = useCallback(() => {
    props.selectSkill(props.playerId, props.index, 0);
  }, [props.playerId, props.index, props.selectSkill]);

  const selectSkill2 = useCallback(() => {
    props.selectSkill(props.playerId, props.index, 1);
  }, [props.playerId, props.index, props.selectSkill]);

  const selectSkill3 = useCallback(() => {
    props.selectSkill(props.playerId, props.index, 2);
  }, [props.playerId, props.index, props.selectSkill]);

  return (
    <Slot position={props.position}>
      <SkillSelectUi
        skill1NameJa={props.selection.skills[0].name.ja}
        skill1DescriptionJa={props.selection.skills[0].effect
          .map((effect) => {
            return effect.description.ja;
          })
          .join("\n")}
        skill1Frame={
          props.selection.skills[0].rarity === "epic"
            ? "Style/Color.Rarity.Epic"
            : "Style/Color.Rarity.Rare"
        }
        skill1Icon={getIconUrl(props.selection.skills[0].icon)}
        selectSkill1={selectSkill1}
        skill2NameJa={props.selection.skills[1].name.ja}
        skill2DescriptionJa={props.selection.skills[1].effect
          .map((effect) => {
            return effect.description.ja;
          })
          .join("\n")}
        skill2Frame={
          props.selection.skills[1].rarity === "epic"
            ? "Style/Color.Rarity.Epic"
            : "Style/Color.Rarity.Rare"
        }
        skill2Icon={getIconUrl(props.selection.skills[1].icon)}
        selectSkill2={selectSkill2}
        skill3NameJa={props.selection.skills[2].name.ja}
        skill3DescriptionJa={props.selection.skills[2].effect
          .map((effect) => {
            return effect.description.ja;
          })
          .join("\n")}
        skill3Frame={
          props.selection.skills[2].rarity === "epic"
            ? "Style/Color.Rarity.Epic"
            : "Style/Color.Rarity.Rare"
        }
        skill3Icon={getIconUrl(props.selection.skills[2].icon)}
        selectSkill3={selectSkill3}
      />
    </Slot>
  );
};

export const PlayerSkillSelect = (props: {
  player: Player;
  selection: CheckpointSection["skillSelection"][string];
  selectSkill: SnatchCompany["selectSkillInCheckpoint"];
}) => {
  return (
    <Slot position={[0, 1.5, 5]} scale={[2, 2, 2]}>
      <LocalView userId={props.player.id}>
        {props.selection.map((skill, index) => (
          <SkillSelect
            key={index}
            index={index}
            position={[
              index * 1.2 - ((props.selection.length - 1) * 1.2) / 2,
              0,
              0,
            ]}
            playerId={props.player.id}
            selection={skill}
            selectSkill={props.selectSkill}
          />
        ))}
      </LocalView>
    </Slot>
  );
};

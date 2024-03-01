import { useEffect, useRef, useState } from "react";
import { SnatchCompany } from "../../game";
import { Announcement } from "../../game/type";
import {
  GridLayout,
  HorizontalLayout,
  LayoutElement,
  VerticalLayout,
} from "../../../unit/package/PrimitiveUix/main";
import { StyledImage, StyledText } from "../../../unit/package/StyledUix/main";

export const AnnouncementManager = (props: {
  setCallback: SnatchCompany["setCallback"];
  clearCallback: SnatchCompany["clearCallback"];
}) => {
  const [announcement, setAnnouncement] = useState<Announcement[]>([]);
  const timeRef = useRef(performance.now());

  useEffect(() => {
    const callback: Exclude<
      SnatchCompany["callbacks"]["onAnnouncement"],
      undefined
    >[number] = (arg) => {
      setAnnouncement((prev) => [...prev, arg]);
    };
    props.setCallback({
      onAnnouncement: [callback],
    });
    return () => {
      props.clearCallback(callback);
    };
  }, [props.setCallback, props.clearCallback]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const deltaTime = (performance.now() - timeRef.current) / 1000;
      timeRef.current = performance.now();
      setAnnouncement((prev) =>
        prev
          .map((announcement) => ({
            ...announcement,
            duration: announcement.duration - deltaTime,
          }))
          .filter((announcement) => announcement.duration > 0)
      );
    }, 1000);
    return () => clearTimeout(timeout);
  }, [announcement]);

  return (
    <LayoutElement minHeight={400}>
      {announcement.length > 0 && (
        <GridLayout
          cellSize={[1200, 400]}
          horizontalAlignment="Center"
          verticalAlignment="Middle"
        >
          <LayoutElement>
            <StyledImage defaultColor={[0.1, 0.1, 0.1, 0.8]} />
            <VerticalLayout
              paddingLeft={100}
              paddingRight={100}
              paddingBottom={50}
              paddingTop={50}
              spacing={10}
            >
              <LayoutElement minHeight={100}>
                <StyledText
                  content={announcement[0].title.ja}
                  verticalAlign="Middle"
                  horizontalAlign="Center"
                  verticalAutoSize={true}
                  horizontalAutoSize={true}
                  defaultColor={[1, 1, 1, 1]}
                />
              </LayoutElement>
              <LayoutElement flexibleHeight={1}>
                <StyledText
                  content={announcement[0].description.ja}
                  verticalAutoSize={true}
                  horizontalAutoSize={true}
                  size={48}
                  defaultColor={[1, 1, 1, 1]}
                />
              </LayoutElement>
            </VerticalLayout>
          </LayoutElement>
        </GridLayout>
      )}
    </LayoutElement>
  );
};

import { Composition } from "remotion";
import { RealmeBF } from "./RealmeBF";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RealmeBF01"
      component={RealmeBF}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

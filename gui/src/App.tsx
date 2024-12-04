import { useWindowDimensions } from "@fi-sci/misc";
import "./App.css";
import mainMdTemplate from "./main.md?raw";
import Markdown from "./Markdown";

import nunjucks from "nunjucks";
import { FunctionComponent, useState } from "react";

nunjucks.configure({ autoescape: false });

const data = {};

const mainMd = nunjucks.renderString(mainMdTemplate, data);

function App() {
  const { width, height } = useWindowDimensions();
  const mainAreaWidth = Math.min(width - 30, 1200);
  const offsetLeft = (width - mainAreaWidth) / 2;
  const [useRastermap, setUseRastermap] = useState(true);
  const [showUnitsTables, setShowUnitsTables] = useState(true);
  const [okayToViewSmallScreen, setOkayToViewSmallScreen] = useState(false);
  const divHandler = useDivHandler({ mainAreaWidth, useRastermap, showUnitsTables, setUseRastermap, setShowUnitsTables });
  if (width < 800 && !okayToViewSmallScreen) {
    return (
      <SmallScreenMessage
        onOkay={() => setOkayToViewSmallScreen(true)}
      />
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        width,
        height: height,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: offsetLeft,
          width: mainAreaWidth
        }}
      >
        <Markdown
          source={mainMd}
          linkTarget="_self"
          divHandler={divHandler}
        />
      </div>
    </div>
  );
}

const SmallScreenMessage: FunctionComponent<{ onOkay: () => void }> = ({ onOkay }) => {
  return (
    <div style={{padding: 20}}>
      <p>
        This page is not optimized for small screens or mobile devices. Please use a larger
        screen or expand your browser window width.
      </p>
      <p>
        <button onClick={onOkay}>
          I understand, continue anyway
        </button>
      </p>
    </div>
  );
}

interface DivHandlerConfig {
  mainAreaWidth: number;
  useRastermap: boolean;
  showUnitsTables: boolean;
  setUseRastermap: (val: boolean) => void;
  setShowUnitsTables: (val: boolean) => void;
}

interface DivHandlerProps {
  className?: string;
  props: Record<string, unknown>;
  children: React.ReactNode;
}

type DivHandlerComponent = (props: DivHandlerProps) => JSX.Element;

const useDivHandler = (config: DivHandlerConfig): DivHandlerComponent => {
  const { mainAreaWidth, useRastermap, showUnitsTables, setUseRastermap, setShowUnitsTables } = config;

  return ({ className, props, children }: DivHandlerProps) => {
    switch (className) {
      case 'test': {
        return <div>TEST</div>
      }

      default:
        return (
          <div className={className} {...props}>
            {children}
          </div>
        );
    }
  };
};

export default App;

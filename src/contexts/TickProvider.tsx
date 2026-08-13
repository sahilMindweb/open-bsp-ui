import { type ReactNode, useState, useEffect } from "react";
import dayjs from "dayjs";
import { TickContext } from "./useTick";

// TickProvider is its own component file so Fast Refresh / react-compiler
// handle it cleanly (a context + component in one .tsx file triggers a
// $RefreshSig$ is not defined error under the react compiler in dev).
function TickProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(dayjs());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return <TickContext.Provider value={tick}>{children}</TickContext.Provider>;
}

export { TickProvider };

import { createContext } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "dayjs/locale/pt";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const TickContext = createContext(dayjs());

export { TickContext };

import { LogChannel } from "../constants/base";

type LogTypes = "INFO" | "ERROR" | "DEBUG";

export const Log = (type: LogTypes, message: string): void => {
  switch (type) {
    case "INFO":
      LogChannel.appendLine(`[INFO] ${message}`);
      break;
    case "ERROR":
      LogChannel.appendLine(`[ERROR] ${message}`);
      break;
    case "DEBUG":
      LogChannel.appendLine(`[DEBUG] ${message}`);
      break;
    default:
      LogChannel.appendLine(`[INFO] ${message}`);
      break;
  }
};

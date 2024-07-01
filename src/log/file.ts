import path from "node:path";
import { lock, unlock } from "lockfile";
import pgk from "../../package.json";

export const lockfile = (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    lock(
      path.join(__dirname, "../../", `${pgk.publisher}.${pgk.name}.lock`),
      {
        wait: 5000,
      },
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
};

export const unlockfile = (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    unlock(
      path.join(__dirname, "../../", `${pgk.publisher}.${pgk.name}.lock`),
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
};

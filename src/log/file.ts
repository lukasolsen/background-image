import lockfile from "lockfile";
import path from "path";
import pgk from "../../package.json";

export function lock() {
  return new Promise<void>((resolve, reject) => {
    lockfile.lock(
      path.join(__dirname, "../../", `${pgk.publisher + "." + pgk.name}.lock`),
      {
        wait: 5000, // 应该能撑200的并发了，，，>_<#@!
      },
      (err: any) => {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
}

export function unlock() {
  return new Promise<void>((resolve, reject) => {
    lockfile.unlock(
      path.join(__dirname, "../../", `${pgk.publisher + "." + pgk.name}.lock`),
      (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
}

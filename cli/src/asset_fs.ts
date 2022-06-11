import fsSync from "fs";

/**
 * FS operations for asset files
 */

export const copyAssetFile = (asset: string, destination: string) => {
  return new Promise((res, rej) => {
    const operation = fsSync.createReadStream(asset).pipe(fsSync.createWriteStream(destination), {end: true});
    operation.on('close', res)
    operation.on('error', (...args) => {
      operation.close()
      rej(...args)
    })
  })
}
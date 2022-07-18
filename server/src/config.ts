export type TankoCliPlatform = "windows" | "linux" | "macos"

export type ConfigType = {
  scanUncertainty: boolean,
  slowTick: boolean,
  tankoCliServeInfo: {[key in TankoCliPlatform]: {
    localPath: string,
    servedFilename: string  // Relative to the server/cli_assets directory
  }}
}

const Config: ConfigType = {
  scanUncertainty: true,
  slowTick: false,
  tankoCliServeInfo: {
    windows: {
      localPath: "tanko-win.exe",
      servedFilename: "tanko.exe"
    },
    linux: {
      localPath: "tanko-linux",
      servedFilename: "tanko"
    },
    macos: {
      localPath: "tanko-macos",
      servedFilename: "tanko"
    }
  }
}

export default Config;
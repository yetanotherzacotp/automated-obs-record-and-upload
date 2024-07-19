import config from './../config.js'

export default class ColorConsole {
  static COLOR_RESET = "\x1b[0m"

  static FG_COLORS = {
    BLACK: "\x1b[30m",
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    BLUE: "\x1b[34m",
    MAGENTA: "\x1b[35m",
    CYAN: "\x1b[36m",
    WHITE: "\x1b[37m",
    GRAY: "\x1b[90m"
  }

  static BG_COLORS = {
    BLACK: "\x1b[40m",
    RED: "\x1b[41m",
    GREEN: "\x1b[42m",
    YELLOW: "\x1b[43m",
    BLUE: "\x1b[44m",
    MAGENTA: "\x1b[45m",
    CYAN: "\x1b[46m",
    WHITE: "\x1b[47m",
    GRAY: "\x1b[100m"
  }

  // Basic Color Logging
  static log (string) { ColorConsole.logGreenFG(string) }
  static warn (string) { ColorConsole.logYellowFG(string) }
  static error (string) { ColorConsole.logRedFG(string) }
  static debug (string) { if (config.debug) { ColorConsole.logMagentaFG(string) } }

  static logWithColor(string, color) {
    console.log(`${color}%s${ColorConsole.COLOR_RESET}`, string)
  }

  static logBlackFG (string) { ColorConsole.logWithColor(string, ColorConsole.FG_COLORS.BLACK) }
  static logRedFG (string) { ColorConsole.logWithColor(string, ColorConsole.FG_COLORS.RED) }
  static logGreenFG (string) { ColorConsole.logWithColor(string, ColorConsole.FG_COLORS.GREEN) }
  static logYellowFG (string) { ColorConsole.logWithColor(string, ColorConsole.FG_COLORS.YELLOW) }
  static logBlueFG (string) { ColorConsole.logWithColor(string, ColorConsole.FG_COLORS.BLUE) }
  static logMagentaFG (string) { ColorConsole.logWithColor(string, ColorConsole.FG_COLORS.MAGENTA) }
  static logCyanFG (string) { ColorConsole.logWithColor(string, ColorConsole.FG_COLORS.CYAN) }
  static logWhiteFG (string) { ColorConsole.logWithColor(string, ColorConsole.FG_COLORS.WHITE) }
  static logGrayFG (string) { ColorConsole.logWithColor(string, ColorConsole.FG_COLORS.GRAY) }

  static logBlackBG (string) { ColorConsole.logWithColor(string, ColorConsole.BG_COLORS.BLACK) }
  static logRedBG (string) { ColorConsole.logWithColor(string, ColorConsole.BG_COLORS.RED) }
  static logGreenBG (string) { ColorConsole.logWithColor(string, ColorConsole.BG_COLORS.GREEN) }
  static logYellowBG (string) { ColorConsole.logWithColor(string, ColorConsole.BG_COLORS.YELLOW) }
  static logBlueBG (string) { ColorConsole.logWithColor(string, ColorConsole.BG_COLORS.BLUE) }
  static logMagentaBG (string) { ColorConsole.logWithColor(string, ColorConsole.BG_COLORS.MAGENTA) }
  static logCyanBG (string) { ColorConsole.logWithColor(string, ColorConsole.BG_COLORS.WHITE) }
  static logWhiteBG (string) { ColorConsole.logWithColor(string, ColorConsole.BG_COLORS.WHITE) }
  static logGrayBG (string) { ColorConsole.logWithColor(string, ColorConsole.BG_COLORS.GRAY) }


  // Logging in place
  static logInPlace (string, color = undefined) {
    process.stdout.write(string)
  }

  static clearLine () {
    process.stdout.clearLine()
  }

  static logInPlaceOverwrite (string, color = undefined) {
    process.stdout.clearLine()
    const logString = `${string}\r`
    color
      ? process.stdout.write(`${color}${logString}${ColorConsole.COLOR_RESET}`)
      : process.stdout.write(logString)
  }

  static logWaiting (string, counter, color = undefined) {
    const logString = `${string}${'.'.repeat(counter)}\r`
    color
      ? process.stdout.write(`${color}${logString}${ColorConsole.COLOR_RESET}`)
      : process.stdout.write(logString)
  }
}

# R Template for TankCOSC
# Written by someone who doesn't know R, so please contribute fixes and
# improvements to TankCOSC on GitHub: https://github.com/tfinlay/tankcosc

hp <- 0
energy <- 0
last_scan_result <- data.frame(
  relative_angle=c(),
  distance=c(),
  name=c()
)

stdio_in <- file("stdin", 'r')

print <- function (message) {
  f <- stderr()

  write(message, f)
  flush(f)
}

readline <- function () {
	res <- readLines(stdio_in, n = 1, encoding = "UTF-8")
	return(res)
}

tcosc_update_base_data_from_command_response <- function () {
  ln <- readline()
  hpAndEnergy <- unlist(strsplit(ln, " ", fixed = TRUE))
  assign("hp", as.numeric(hpAndEnergy[1]), envir = .GlobalEnv)
  assign("energy", as.numeric(hpAndEnergy[2]), envir = .GlobalEnv)
}

tcosc_print_command <- function (command, ...) {
  f <- stdout()
  write(paste(command, ..., sep = " ", collapse = " "), f)
  flush(f)
}

# Bot Commands:

move <- function (energy) {
  tcosc_print_command("MOVE", energy)
  tcosc_update_base_data_from_command_response()
}

scan <- function () {
  tcosc_print_command("SCAN")
  tcosc_update_base_data_from_command_response()

  relative_angles = list()
  distances = list()
  names = list()

  ln <- readline()
  while (ln != 'SCAN END') {
    splitLine = unlist(strsplit(ln, " ", fixed = TRUE))

    name <- paste(splitLine[3:length(splitLine)], sep = " ", collapse = " ")

    relative_angles <- append(relative_angles, list(as.numeric(splitLine[1])))
    distances <- append(distances, list(as.numeric(splitLine[2])))
    names <- append(names, list(name))
    ln <- readline()
  }

  result <- data.frame(
    relative_angle = unlist(relative_angles),
    distance = unlist(distances),
    name = unlist(names)
  )

  assign(
    "last_scan_result",
    result,
    envir = .GlobalEnv
  )
}

poll <- function() {
  tcosc_print_command("POLL")
  tcosc_update_base_data_from_command_response()
}
wait <- poll

shoot <- function(energy) {
  tcosc_print_command("SHOOT", energy)
  tcosc_update_base_data_from_command_response()
}

rotate <- function(degrees) {
  tcosc_print_command("ROTATE", degrees)
  tcosc_update_base_data_from_command_response()
}


heal <- function(energy) {
  tcosc_print_command("HEAL", energy)
  tcosc_update_base_data_from_command_response()
}

print_last_scan_result <- function() {
  f <- stderr()
  write.table(
    last_scan_result,
    sep = "\t",
    file = f,
    row.names = FALSE,
    col.names = TRUE
  )
  flush(f)
}

tcosc_update_base_data_from_command_response()

# YOUR CODE:

main <- function() {
  print(sprintf("Health: %f\tEnergy: %f", hp, energy))
  if (energy > 300) {
    scan()  # Uses 200 energy

    print_last_scan_result()
    if (length(last_scan_result) > 0) {
      # We picked something up during the scan!
      # Rotate to the first thing we detected and shoot at it
      target <- last_scan_result[1,]
      print(sprintf("Targetting enemy player: %s", target["name"]))
      rotate(target["relative_angle"])
      shoot(100)
    }
  }
  else {
    wait()
  }
}

while (TRUE) {
  main()
}

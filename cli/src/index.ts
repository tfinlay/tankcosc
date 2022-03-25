/*
 * Entrypoint for the tankcosc CLI.
 */
import {ArgumentParser} from "argparse"

const main = () => {
  const parser = new ArgumentParser({
    description: "A CLI program for interfacing with TankCOSC"
  })

  parser.add_argument('server_url', {
    help: "The URL of the game server."
  })
  parser.add_argument('secret_key', {
    help: "The secret key for your account. Used to log in to the game server."
  })

  console.dir(parser.parse_args())
}

main()
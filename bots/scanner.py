from requests.api import get
import bot
from bot import move, rotate, wait, shoot, scan

def main():
    hp, energy = bot.HEALTH, bot.ENERGY

    # Begin bot commands
    print(f"Health\t{hp}\tEnergy\t{energy}")
    if energy > 300:
        scan()
        
        print(bot.SCAN_RESULT)
        if len(bot.SCAN_RESULT) == 0:
            return

        target = bot.SCAN_RESULT[0]
        rotate(target[1])
        shoot(100)

from test_util import get_key
bot.start(main, get_key("scanner"))
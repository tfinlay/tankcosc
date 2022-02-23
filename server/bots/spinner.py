from requests.api import get
import bot
from bot import move, rotate, wait, shoot, scan

def main():
    hp, energy = bot.HEALTH, bot.ENERGY

    # Begin bot commands
    print(f"Health\t{hp}\tEnergy\t{energy}")

    if energy > 10000:
        while bot.ENERGY >= 200:
            rotate(5)
            shoot(200)

from test_util import get_key
bot.start(main, get_key("spinner"))
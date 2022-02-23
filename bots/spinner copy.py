from requests.api import get
import bot
from bot import move, rotate, wait, shoot, scan

def main():
    hp, energy = bot.HEALTH, bot.ENERGY

    # Begin bot commands
    print(f"Health\t{hp}\tEnergy\t{energy}")

    if energy > 1000:
        rotate(60)
        while bot.ENERGY > 200:
            
            shoot(200)
            
           
        
            

from test_util import get_key
bot.start(main, '4d73b6d293584030a04b5851050fecac')
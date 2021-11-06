import bot
from bot import move, rotate, wait, shoot

def main():
    hp, energy = bot.HEALTH, bot.ENERGY

    # Begin bot commands
    print(f"Health\t{hp}\tEnergy\t{energy}")
    if energy >= 400:
        move(400)
        rotate(90)
        while energy <= 200 and not bot.exiting:
            wait()
        shoot(200)
    else:
        wait()


from test_util import get_key
bot.start(main, get_key("square shooter"))
import bot
from bot import poll

def main():
    poll()


from test_util import get_key
bot.start(main, get_key("sitter"))
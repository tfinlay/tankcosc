import socketio
import functools

"""
SET UP YOUR BASIC CONFIGURATION
"""
KEY = "e2cd2db11f0e4c21a4eb9298e747d600"

sio = socketio.Client()

class TransactionController:
    def __init__(self):
        self.awaiting_response = True
    
    def log_reply(self):
        self.await_response = False

    def block_until_response(self):
        self.await_response = True
        while self.await_response:
            sio.sleep(0.00001)

    def transactional(self, func):
        @functools.wraps(func)
        def f(*args, **kwargs):
            res = func(*args, **kwargs)
            self.block_until_response()
            return res
        return f

controller = TransactionController()
logged_in = False
exiting = False

@sio.on('requestLogin')
def log_in():
    sio.emit('login', ("player", KEY))

@sio.on('login_success')
def login_success():
    global logged_in
    print("Logged in successfully.")
    logged_in = True

@sio.on('loginError')
def on_login_error(message):
    global exiting
    print(f"Login Error: {message}")
    exiting = True    

@controller.transactional
def move(energy: int):
    sio.emit('move', energy)

@controller.transactional
def shoot(energy: int):
    sio.emit('shoot', energy)

@controller.transactional
def rotate(degrees: int):
    sio.emit('rotate', degrees)

@controller.transactional
def wait():
    pass

HEALTH = 200
ENERGY = 200
SCAN_RESULT = None

@sio.on('response')
def on_response(data):
    global HEALTH, ENERGY
    HEALTH = data["hp"]
    ENERGY = data["energy"]
    controller.log_reply()

# Connect
sio.connect('ws://127.0.0.1:3000/')

# Wait until login succeeds
while not logged_in and not exiting:
    sio.sleep(0.001)

# Begin bot commands
while not exiting:
    print(f"Health\t{HEALTH}\tEnergy\t{ENERGY}")

    if ENERGY >= 400:
        move(400)
        rotate(90)
        while ENERGY <= 200:
            wait()
        shoot(200)
    else:
        wait()

sio.disconnect()
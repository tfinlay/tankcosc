import socketio
import functools

"""
SET UP YOUR BASIC CONFIGURATION
"""
_KEY = None

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
    sio.emit('login', ("player", _KEY))

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

@sio.on('disconnect')
def on_disconnect():
    global exiting
    print(f"Disconnected. Exiting...")
    exiting = True

@controller.transactional
def move(energy: int):
    sio.emit('move', energy)

@controller.transactional
def scan():
    sio.emit('scan')

@controller.transactional
def poll():
    sio.emit('poll')

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
SCAN_RESULT = []

@sio.on('response')
def on_response(data):
    global HEALTH, ENERGY, SCAN_RESULT

    error_maybe = data.get("error")
    if error_maybe is not None:
        print(f"Received error: {error_maybe}")

    HEALTH = data["hp"]
    ENERGY = data["energy"]
    SCAN_RESULT = data.get("scan", [])

    controller.log_reply()

def start(main_fn, key: str = None):
    global _KEY
    _KEY = key

    if key is None:
        raise Exception("A key is required to start.")

    # Connect
    sio.connect('ws://127.0.0.1:3000/')

    # Wait until login succeeds
    while not logged_in and not exiting:
        sio.sleep(0.001)

    try:
        while not exiting:
            main_fn()
    finally:
        sio.disconnect()

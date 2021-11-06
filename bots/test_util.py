import requests
import random

def get_key(name: str) -> str:
    attempts = 0
    key = None

    while attempts < 10 and key is None:
        attempts += 1
        key = requests.post(
            "http://127.0.0.1:3000/register",
            json=dict(
                name=f"{name}{'' if attempts == 0 else random.randint(0, 1024)}"
            )
        ).json().get("key", None)

    return key
#! /bin/python3
import sys
from collections import namedtuple

ScanResult = namedtuple("ScanResult", ["relativeAngle", "distance", "name"])

hp = 0  # type: float
energy = 0  # type: float
last_scan_result = None  # type: list[ScanResult] or None


def _update_base_data_from_command_response():
    global hp, energy
    hp, energy = map(float, input().split(" "))


def _print_command(command, *args):
    sys.stdout.write(f"{command}{' ' if args else ''}{' '.join(map(str, args))}\n")


def move(energy):
    _print_command("MOVE", energy)
    _update_base_data_from_command_response()


def scan():
    global last_scan_result

    _print_command("SCAN")
    _update_base_data_from_command_response()

    last_scan_result = []

    line = input()
    while line != 'SCAN END':
        print(line)
        relativeAngle, distance, playerName = line.split(" ", 2)
        last_scan_result.append(ScanResult(float(relativeAngle), float(distance), playerName))
        line = input()


def poll():
    _print_command("POLL")
    _update_base_data_from_command_response()


wait = poll


def shoot(energy):
    _print_command("SHOOT", energy)
    _update_base_data_from_command_response()


def rotate(degrees):
    _print_command("ROTATE", degrees)
    _update_base_data_from_command_response()


def heal(energy):
    _print_command("HEAL", energy)
    _update_base_data_from_command_response()


def print(message):
    sys.stderr.write(f"{message}\n")


_update_base_data_from_command_response()


import time

def main():
    print(f"Health: {hp}\tEnergy: {energy}")
    if energy > 300:
        scan()  # Uses 200 energy

        print(last_scan_result)
        if len(last_scan_result) > 0:
            # We picked something up during the scan!
            # Rotate to the first thing we detected and shoot at it
            target = last_scan_result[0]
            print(f"Targeting enemy player: {target.name}")
            rotate(target.relativeAngle)
            shoot(100)
    else:
        wait()


while True:
    main()

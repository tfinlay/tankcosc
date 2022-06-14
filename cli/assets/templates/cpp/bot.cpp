#include <stdio.h>
#include <string>
#include <vector>
#include <iostream>
#include <sstream>

class ScanResult {
public:
    double relativeAngle;
    double distance;
    std::string name;
};


double hp;
double energy;
std::vector<ScanResult> lastScanResult = std::vector<ScanResult>();

void _updateBaseDataFromCommandResponse() {
    std::cin >> hp >> energy;
    std::cin.get(); // Clear the new line character
}

void move(double energy) {
    printf("MOVE %lf\n", energy);
    fflush(stdout);
    _updateBaseDataFromCommandResponse();
}

void scan() {
    printf("SCAN\n");
    fflush(stdout);
    _updateBaseDataFromCommandResponse();

    lastScanResult.clear();

    std::string line;
    std::getline(std::cin, line);

    while (line != "SCAN END") {
        std::stringstream lineStream(line);

        double relativeAngle;
        double distance;
        std::string name;

        lineStream >> relativeAngle >> distance;
        lineStream.get();  // Clear the space between the distance and the start of the name.
        std::getline(lineStream, name);

        ScanResult* entry = new ScanResult();
        entry->relativeAngle = relativeAngle;
        entry->distance = distance;
        entry->name = name;

        lastScanResult.push_back(*entry);

        std::getline(std::cin, line);
    }
}

void poll() {
    printf("POLL\n");
    fflush(stdout);
    _updateBaseDataFromCommandResponse();
}

void wait() {
    poll();
}

void shoot(double energy) {
    printf("SHOOT %lf\n", energy);
    fflush(stdout);
    _updateBaseDataFromCommandResponse();
}

void rotate(double degrees) {
    printf("ROTATE %lf\n", degrees);
    fflush(stdout);
    _updateBaseDataFromCommandResponse();
}

void heal(double energy) {
    printf("HEAL %lf\n", energy);
    fflush(stdout);
    _updateBaseDataFromCommandResponse();
}

void printLastScanResult() {
    if (lastScanResult.size() == 0) {
        std::cerr << "[]" << std::endl;
        return;
    }

    std::cerr << "[";

    for (auto scanRes : lastScanResult) {
        std::cerr << " (" << scanRes.relativeAngle << ", " << scanRes.distance << ", " << scanRes.name << ") ";
    }

    std::cerr << "]" << std::endl;
}

/**
 * This is where you can write the code to control your bot!
 *
 * !!!PLEASE PRINT TO STDERR TO LOG TO THE CONSOLE!!!
 * E.g. std::cerr << "My message" << std::endl; or fprintf(stderr, "%d\n", hp);
 * NOT std::cout or printf
 */
void botMain() {
    std::cerr << "Health: " << hp << "\tEnergy: " << energy << std::endl;
    if (energy > 300) {
        scan();  // Uses 200 energy

        printLastScanResult();
        if (lastScanResult.size() > 0) {
            // We picked something up during the scan!
            // Rotate to the first thing we detected and shoot at it
            ScanResult target = lastScanResult[0];
            std::cerr << "Targeting enemy player: " << target.name << std::endl;
            rotate(target.relativeAngle);
            shoot(100);
        }
    }
    else {
        wait();
    }
}

int main() {
    _updateBaseDataFromCommandResponse();

    while (true) {
        botMain();
    }
    return 0;
}
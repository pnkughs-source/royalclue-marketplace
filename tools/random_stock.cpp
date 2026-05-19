// Optional helper: generates random stock numbers between 300 and 4000.
// Compile: g++ tools/random_stock.cpp -o random_stock
#include <iostream>
#include <random>
int main(){
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dist(300, 4000);
    for(int i=0;i<20;i++) std::cout << dist(gen) << "\n";
    return 0;
}

#!/bin/bash
cd packages/unrar-wasm
echo "Cleaning build directory..."
rm -rf build
mkdir -p build
cd build
echo "Running cmake..."
emcmake cmake ..
echo "Running make..."
emmake make
echo "Build complete!"


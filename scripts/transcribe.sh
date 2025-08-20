#!/bin/bash

# This script transcribes an audio file using whisper.cpp

# Get the absolute path to the whisper.cpp directory
WHISPER_CPP_DIR="/home/masih/whisper.cpp"

# Get the input file path from the first argument
INPUT_FILE=$1

# Run whisper.cpp
"$WHISPER_CPP_DIR/main" -m "$WHISPER_CPP_DIR/models/ggml-base.en.bin" -f "$INPUT_FILE" -nt -otxt

#!/bin/bash

# The directory containing your .jpg files
DIRECTORY="/images/news"

# Desired dimensions
WIDTH=215
HEIGHT=215

# Change to the directory
cd "$DIRECTORY"

# Find and resize images
mogrify -resize ${WIDTH}x${HEIGHT}! *.jpg

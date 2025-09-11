#!/bin/bash

# Create symbolic link to FramePlanner source
mkdir -p src/lib
ln -s ../../../FramePlanner2/src/lib/layeredCanvas src/lib/layeredCanvas
ln -s ../../../FramePlanner2/src/lib/book src/lib/book

echo "Setup completed successfully!"

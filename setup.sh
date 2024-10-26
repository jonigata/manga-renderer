#!/bin/bash

# Create symbolic link to FramePlanner source
mkdir -p src/lib
ln -s ../../../FramePlanner/src/lib/layeredCanvas src/lib/layeredCanvas

# Create gitignore
echo "src/lib/layeredCanvas" > .gitignore

echo "Setup completed successfully!"

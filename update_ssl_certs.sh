#!/bin/bash

# Go to folder with environment
cd /var/artmagic_project/artmagic_full_project

# Activate the virtual environment
source venv/bin/activate

# Run Certbot renewal command
certbot renew --post-hook "pm2 restart artmagic_prod"

# Deactivate the virtual environment
deactivate
#!/bin/bash

sudo systemctl daemon-reload
sudo systemctl restart gunicorn
sudo systemctl restart nginx
pm2 restart artmagic_prod

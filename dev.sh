#!/usr/bin/env bash

# build & install
npm run build

scp -r dist root@120.25.255.195:/app/mptruck-wechat

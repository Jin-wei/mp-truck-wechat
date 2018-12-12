#!/usr/bin/env bash

npm run build

scp -r dist root@123.56.30.248:/app/mptruck-wechat-huateng
scp MP_verify_7Ykt0QbrOaHR6FbT.txt root@123.56.30.248:/app/mptruck-wechat-huateng/dist


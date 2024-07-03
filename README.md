# Autoblog Instructions #

## If Starting on a New machine, first clone the repo ##

git clone hocblog-local repository

## cd your repo ##

## Install the dependencies in package.json ##

    npm install

## set up local environment variables ##

    touch.env
        CHATGPT_API_KEY=$your_openai_api_key
        WEBFLOW_API_KEY=$your_webflow_api_key
        WEBFLOW_COLLECTION_ID=$your_webflow_collection_id
        PORT=3000

## DEPLOY to Roku ##

    git add .
    git commit -m "commit it and quit it"
    git push heroku main

## Set Env Vars on Heroku ##

    heroku config:set CHATGPT_API_KEY=your_openai_api_key
    heroku config:set WEBFLOW_API_KEY=your_webflow_api_key
    heroku config:set WEBFLOW_COLLECTION_ID=your_webflow_collection_i##

## start the Application ##

    npm start

## open the Heroku App ##

    heroku open

## check those logs for flaws/errors ##

    heroku logs --tail

## If Reinitializing ##

Navigate to Project Directory
    cd /path/
Ensure directory is clean and no uncommitted changes
    git status
If repository is remote, pull the latest changes
    git pull origin main
install dependencies
    npm install
verify env file
    touch .env
    add variables to env file / doublecheck
deploy to heroku
    git push heroku main
set env vars on heroku
    heroku config:set CHATGPT_API_KEY=your_openai_api_key
    heroku config:set WEBFLOW_API_KEY=your_webflow_api_key
    heroku config:set WEBFLOW_COLLECTION_ID=your_webflow_collection_id

## test locally (optional) ##

    npm start

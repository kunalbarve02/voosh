# Voosh backend developer assignment

Server hosted at - https://voosh-8ufw.onrender.com

To run this node.js server on local

## Clone Repository

To get started with this project, clone the repository using the following command:

```bash
git clone https://github.com/kunalbarve02/voosh.git
```

## Install Dependencies
```bash
npm i
```

## .env file
Create .env file in root of the project and paste the following data.

```text
DATABASE = mongodb+srv://kunalbarve02:assignmentdbpassword@assignments.oetwpct.mongodb.net/?retryWrites=true&w=majority
SECRET = gIPlJWEiwAsaqcvfXi7yBzlTd56mk6
GoogleAppPassword = tcmc wupj raqk rofd
OAuthClientID = 907198086537-cg7nvh0tin4aqqsp3a7r7bj9pj2md6kv.apps.googleusercontent.com
OAuthClientSecret = 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
```

## Start Server
```bash
npm start
```

## Check Logs
Check logs in app.log file

## API Documentation
Checkout the API Documentation - https://documenter.getpostman.com/view/27284879/2s946fdXmc

## API Playground
open the API playground here - https://www.postman.com/avionics-geologist-11393109/workspace/public/collection/27284879-dc4e7a36-312c-430f-bf63-30b79afadaeb?action=share&creator=27284879

Steps to use APIs
1. Register a User
2. Copy the token and id from response click on the name of collection i.e Voosh->variables paste your token and id in token and currentUser variables.
3. Go to https://voosh-8ufw.onrender.com/api/auth/google to use Google Signin (copy id and token and paste them in playground variables as mentioned in step 2)
4. Checkout all APIs!

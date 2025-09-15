Assignment Instructions:
https://www.notion.so/tryalma/Backend-Engineer-Take-Home-Exercise-702695b59f4048de9b16ed977976638b

# Instructions

## Step 1: Additional Required Files
I’ll be sending these via email, even though this is a take-home assignment. It’s important to follow best practices for keeping confidential data secure. These files are either stored in the `/server` or `/alma-takehome` folder.

Files in `/server`
1. `client_secret.json` - used to create the token.json file for Gmail API
2. `token.json` - created using client_secret.json

Files in `/alma-takehome`
1. `.env` - used to store all sensitive secret variables

Add the required variables into the empty fields in the `.env` file:
1. EMAIL_SENDER
2. PROSPECT_EMAIL
3. ATTORNEY_EMAIL
4. ADMIN_EMAIL - required for admin account

## Step 2: Start Docker Container
Run `docker-compose up --build` to start the container

## Useful Commands
Create a new migration
```bash
alembic revision --autogenerate -m "describe change"
```

Apply changes to database
```bash
alembic upgrade head
```

Remove containers and volumes
```bash
docker-compose down -v
```
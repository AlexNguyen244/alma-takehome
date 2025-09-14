Assignment Instructions
https://www.notion.so/tryalma/Backend-Engineer-Take-Home-Exercise-702695b59f4048de9b16ed977976638b

# Instructions

## Front End installation  
Note: `npm install` installs everything in your package.json file that isn't already installed on your computer

1. npx create-react-app client
2. cd frontend
3. npm i react-router-dom@6
4. npm i jwt-decode

### Run the front-end:

1. Open terminal
2. Navigate to `/alma-takehome/client/`
3. Then enter `npm start`

## Back End Installation

1. mkdir server
2. cd server
3. pip install fastapi "uvicorn[standard]"
4. pip install python-dotenv
5. pip install psycopg2-binary
6. pip install authlib "python-jose[cryptography]"
7. pip install itsdangerous
8. pip install SQLAlchemy
9. pip install alembic

### Run the back-end:

1. Open new terminal
2. Navigate to `/alma-takehome/server/`
3. Then enter `uvicorn main:app --reload`

## Update Database using alembic
1. alembic revision --autogenerate -m "describe change"
2. alembic upgrade head

## Create Database Tables

Two tables need to be created in PostgreSQL: one to store all leads data and another to manage user roles. There are two roles available `user` and `admin`. Once the tables are set up, you MUST manually insert a user with admin privileges by adding their email and assigning them the admin role. The admin will play the role as the attorney that will be able to view the leads and check it state as REACHED_OUT.

### Create `leads` table 
```sql
CREATE TABLE IF NOT EXISTS public.leads
(
    id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    "firstName" character varying(45) COLLATE pg_catalog."default" NOT NULL,
    "lastName" character varying(45) COLLATE pg_catalog."default" NOT NULL,
    email character varying(128) COLLATE pg_catalog."default" NOT NULL,
    state character varying(45) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT leads_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leads
    OWNER to postgres;
```

### Create `users` table
```sql
CREATE TABLE IF NOT EXISTS public.users
(
    email character varying(128) COLLATE pg_catalog."default" NOT NULL,
    role character varying(45) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (email)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;
```

## Additional Required Files

I’ll be sending these via email, even though this is a take-home assignment. It’s important to follow best practices for keeping confidential data secure. These files are all stored in the `/server` folder.
1. client_secret.json (used to create the token.json file for gmail API)
2. token.json (created using client_secret.json)
3. .env (used to store all sensitive secret variables)

Add the required variables into the empty fields in the `.env` file:
1. DB_NAME
2. DB_USERNAME
3. DB_PASSWORD
1. EMAIL_SENDER
2. PROSPECT_EMAIL
3. ATTORNEY_EMAIL
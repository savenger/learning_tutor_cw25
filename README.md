# Learning Tutor Project
This project has been done on the coding.Waterkant 2025

We are using n8n, graphiti for the 

# Getting Started
Copy or rename the file .env.sample to .env.

Add you OpenAI API Key in the .env file

```
OPENAI_API_KEY=
```

Start:
```
docker compose up -d --build
```

The "--build" argument is only necessary for the first run or after you've updated the backend.

In the web interface of n8n you can now create a new user and login. After you have done, you can create a new API key and provide the API key in the .env file. After you have done this, you should restart the docker containers by using:

```
docker compose down
docker compose up -d
```

The following services can be accessed via the browser:

|Service|URL|
|-|-|
|n8n|http://localhost:5678|
|backend|http://localhost:8080|
|graph|http://localhost:8000|
|neo4j|http://localhost:7474|

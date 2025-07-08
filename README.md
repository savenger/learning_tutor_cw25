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
docker compose up -d
```

The following services can be accessed via the browser:

|Service|URL|
|-|-|
|n8n|http://localhost:5678|
|backend|http://localhost:8080|
|graph|http://localhost:8000|
|neo4j|http://localhost:7474|

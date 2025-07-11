const neo4j = require('neo4j-driver');

class Neo4jService {
  constructor() {
    this.driver = null;
    this.session = null;
  }

  async connect() {
    // Detect if we're running in Docker by checking for Docker-specific env vars or network
    const isDocker = process.env.NODE_ENV === 'docker' || process.env.DOCKER_CONTAINER || 
                     process.env.NEO4J_URI?.includes('neo4j:') || 
                     process.platform === 'linux' && process.env.HOSTNAME;
    
    // Use Docker network hostname if in Docker, otherwise localhost
    const defaultUri = isDocker ? 'bolt://neo4j:7687' : 'bolt://localhost:7687';
    const uri = process.env.NEO4J_URI || defaultUri;
    const username = process.env.NEO4J_USERNAME || process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'demodemo';

    console.log(`Attempting to connect to Neo4j at ${uri} (Docker: ${isDocker})`);

    try {
      this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
      
      // Test the connection with retry logic
      const session = this.driver.session();
      await this.retryConnection(session);
      session.close();
      
      console.log('Connected to Neo4j successfully');
      return true;
    } catch (error) {
      console.error('Error connecting to Neo4j:', error.message);
      return false;
    }
  }

  async retryConnection(session, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await session.run('RETURN 1');
        return;
      } catch (error) {
        console.log(`Neo4j connection attempt ${i + 1}/${maxRetries} failed: ${error.message}`);
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  async disconnect() {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
      console.log('Disconnected from Neo4j');
    }
  }

  async getSession() {
    if (!this.driver) {
      await this.connect();
    }
    return this.driver.session();
  }

  async getGraphData() {
    const session = await this.getSession();
    
    try {
      // Query to get all nodes and relationships
      const result = await session.run(`
        MATCH (n)
        OPTIONAL MATCH (n)-[r]->(m)
        RETURN n, r, m
      `);

      const nodes = new Map();
      const relationships = [];

      result.records.forEach(record => {
        const node = record.get('n');
        const relationship = record.get('r');
        const targetNode = record.get('m');

        // Add source node
        if (node) {
          const nodeId = node.identity.toString();
          if (!nodes.has(nodeId)) {
            const nodeType = this.getNodeType(node);
            nodes.set(nodeId, {
              id: nodeId,
              labels: node.labels,
              properties: node.properties,
              type: nodeType
            });
          }
        }

        // Add target node and relationship
        if (targetNode && relationship) {
          const targetNodeId = targetNode.identity.toString();
          if (!nodes.has(targetNodeId)) {
            const targetNodeType = this.getNodeType(targetNode);
            nodes.set(targetNodeId, {
              id: targetNodeId,
              labels: targetNode.labels,
              properties: targetNode.properties,
              type: targetNodeType
            });
          }

          relationships.push({
            id: relationship.identity.toString(),
            source: node.identity.toString(),
            target: targetNode.identity.toString(),
            type: relationship.type,
            properties: relationship.properties
          });
        }
      });

      return {
        nodes: Array.from(nodes.values()),
        relationships: relationships
      };
    } catch (error) {
      console.error('Error fetching graph data:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async getKnowledgeGraph() {
    const session = await this.getSession();
    
    try {
      // Query specifically for Graphiti knowledge graph data (Entity, Episodic, Community)
      const result = await session.run(`
        MATCH (n)
        WHERE 'Entity' IN labels(n) OR 'Episodic' IN labels(n) OR 'Community' IN labels(n) OR 
              'User' IN labels(n) OR 'Weakness' IN labels(n) OR 'Topic' IN labels(n)
        OPTIONAL MATCH (n)-[r]->(m)
        RETURN n, r, m
      `);

      const nodes = new Map();
      const relationships = [];

      result.records.forEach(record => {
        const node = record.get('n');
        const relationship = record.get('r');
        const targetNode = record.get('m');

        // Add source node
        if (node) {
          const nodeId = node.identity.toString();
          if (!nodes.has(nodeId)) {
            const nodeType = this.getNodeType(node);
            nodes.set(nodeId, {
              id: nodeId,
              labels: node.labels,
              properties: node.properties,
              type: nodeType
            });
          }
        }

        // Add target node and relationship
        if (targetNode && relationship) {
          const targetNodeId = targetNode.identity.toString();
          if (!nodes.has(targetNodeId)) {
            const targetNodeType = this.getNodeType(targetNode);
            nodes.set(targetNodeId, {
              id: targetNodeId,
              labels: targetNode.labels,
              properties: targetNode.properties,
              type: targetNodeType
            });
          }

          relationships.push({
            id: relationship.identity.toString(),
            source: node.identity.toString(),
            target: targetNode.identity.toString(),
            type: relationship.type,
            properties: relationship.properties
          });
        }
      });

      return {
        nodes: Array.from(nodes.values()),
        relationships: relationships
      };
    } catch (error) {
      console.error('Error fetching knowledge graph data:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  getNodeType(node) {
    // Graphiti schema node types
    if (node.labels.includes('Entity')) return 'entity';
    if (node.labels.includes('Episodic')) return 'episodic';
    if (node.labels.includes('Community')) return 'community';
    
    // Legacy/custom node types
    if (node.labels.includes('User')) return 'user';
    if (node.labels.includes('Weakness')) return 'weakness';
    if (node.labels.includes('Topic')) return 'topic';
    if (node.labels.includes('Memory')) return 'memory';
    if (node.labels.includes('Fact')) return 'fact';
    
    if (node.properties.type) return node.properties.type;
    if (node.labels.length > 0) return node.labels[0].toLowerCase();
    return 'unknown';
  }

  async getPostgreSQLGraph() {
    // Since Neo4j might not have data yet, we'll create a graph from PostgreSQL data
    // This method would be called from the route handler with PostgreSQL data
    const { Deck, Flashcard, FlashCardAnswer } = require('../models');
    
    try {
      const decks = await Deck.findAll({
        include: [{
          model: Flashcard,
          as: 'Flashcards',
          include: [{
            model: FlashCardAnswer,
            as: 'Answers'
          }]
        }]
      });

      const nodes = [];
      const relationships = [];

      decks.forEach(deck => {
        // Add deck node
        nodes.push({
          id: `deck_${deck.id}`,
          type: 'deck',
          properties: {
            name: deck.name,
            description: deck.description,
            createdAt: deck.createdAt
          }
        });

        deck.Flashcards.forEach(flashcard => {
          // Add flashcard node
          nodes.push({
            id: `flashcard_${flashcard.id}`,
            type: 'flashcard',
            properties: {
              question: flashcard.question,
              answer: flashcard.answer,
              score: flashcard.score,
              seen: flashcard.seen
            }
          });

          // Add deck-flashcard relationship
          relationships.push({
            id: `deck_${deck.id}_flashcard_${flashcard.id}`,
            source: `deck_${deck.id}`,
            target: `flashcard_${flashcard.id}`,
            type: 'CONTAINS',
            properties: {}
          });

          flashcard.Answers.forEach(answer => {
            // Add answer node
            nodes.push({
              id: `answer_${answer.id}`,
              type: 'answer',
              properties: {
                userAnswer: answer.userAnswer,
                feedback: answer.feedback,
                time: answer.time,
                createdAt: answer.createdAt
              }
            });

            // Add flashcard-answer relationship
            relationships.push({
              id: `flashcard_${flashcard.id}_answer_${answer.id}`,
              source: `flashcard_${flashcard.id}`,
              target: `answer_${answer.id}`,
              type: 'ANSWERED_BY',
              properties: {}
            });
          });
        });
      });

      return {
        nodes: nodes,
        relationships: relationships
      };
    } catch (error) {
      console.error('Error creating PostgreSQL graph:', error);
      throw error;
    }
  }
}

module.exports = new Neo4jService();
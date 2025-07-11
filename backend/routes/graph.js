const router = require('express').Router();
const neo4jService = require('../services/neo4jService');

// Get graph data from Neo4j
router.get('/', async (req, res) => {
  try {
    const { source = 'auto' } = req.query;
    
    let graphData;
    
    if (source === 'neo4j') {
      // Try to get data from Neo4j
      graphData = await neo4jService.getGraphData();
    } else if (source === 'postgresql') {
      // Get data from PostgreSQL
      graphData = await neo4jService.getPostgreSQLGraph();
    } else {
      // Auto mode: try Neo4j first, fallback to PostgreSQL
      try {
        console.log('Attempting to connect to Neo4j for graph data...');
        graphData = await neo4jService.getKnowledgeGraph();
        
        // If no nodes found in Neo4j, fallback to PostgreSQL
        if (graphData.nodes.length === 0) {
          console.log('No data found in Neo4j, falling back to PostgreSQL');
          graphData = await neo4jService.getPostgreSQLGraph();
          graphData.source = 'postgresql-fallback';
        } else {
          graphData.source = 'neo4j';
        }
      } catch (neo4jError) {
        console.log('Neo4j connection failed, falling back to PostgreSQL:', neo4jError.message);
        graphData = await neo4jService.getPostgreSQLGraph();
        graphData.source = 'postgresql-fallback';
        graphData.neo4jError = neo4jError.message;
      }
    }

    // Transform data to NVL format
    const nvlData = {
      nodes: graphData.nodes.map(node => ({
        id: node.id,
        caption: node.properties.name || node.properties.question || node.properties.userAnswer || node.id,
        type: node.type,
        properties: node.properties,
        labels: node.labels || [node.type],
        color: getNodeColor(node.type)
      })),
      relationships: graphData.relationships.map(rel => ({
        id: rel.id,
        from: rel.source,
        to: rel.target,
        caption: rel.type,
        type: rel.type,
        properties: rel.properties
      }))
    };

    res.json({
      success: true,
      data: nvlData,
      source: graphData.source || source,
      nodeCount: nvlData.nodes.length,
      relationshipCount: nvlData.relationships.length,
      neo4jError: graphData.neo4jError || null
    });

  } catch (error) {
    console.error('Error fetching graph data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch graph data',
      message: error.message
    });
  }
});

// Get knowledge graph specifically
router.get('/knowledge', async (req, res) => {
  try {
    const graphData = await neo4jService.getKnowledgeGraph();

    const nvlData = {
      nodes: graphData.nodes.map(node => ({
        id: node.id,
        caption: node.properties.name || node.properties.content || node.id,
        type: node.type,
        properties: node.properties,
        labels: node.labels || [node.type],
        color: getNodeColor(node.type)
      })),
      relationships: graphData.relationships.map(rel => ({
        id: rel.id,
        from: rel.source,
        to: rel.target,
        caption: rel.type,
        type: rel.type,
        properties: rel.properties
      }))
    };

    res.json({
      success: true,
      data: nvlData,
      source: 'neo4j',
      nodeCount: nvlData.nodes.length,
      relationshipCount: nvlData.relationships.length
    });

  } catch (error) {
    console.error('Error fetching knowledge graph:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch knowledge graph',
      message: error.message
    });
  }
});

// Get PostgreSQL-based graph
router.get('/postgresql', async (req, res) => {
  try {
    const graphData = await neo4jService.getPostgreSQLGraph();

    const nvlData = {
      nodes: graphData.nodes.map(node => ({
        id: node.id,
        caption: node.properties.name || node.properties.question || node.properties.userAnswer || node.id,
        type: node.type,
        properties: node.properties,
        labels: [node.type],
        color: getNodeColor(node.type)
      })),
      relationships: graphData.relationships.map(rel => ({
        id: rel.id,
        from: rel.source,
        to: rel.target,
        caption: rel.type,
        type: rel.type,
        properties: rel.properties
      }))
    };

    res.json({
      success: true,
      data: nvlData,
      source: 'postgresql',
      nodeCount: nvlData.nodes.length,
      relationshipCount: nvlData.relationships.length
    });

  } catch (error) {
    console.error('Error fetching PostgreSQL graph:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch PostgreSQL graph',
      message: error.message
    });
  }
});

function getNodeColor(type) {
  const colors = {
    // PostgreSQL/Legacy node types
    deck: '#3B82F6',      // Blue
    flashcard: '#10B981',  // Green
    answer: '#F59E0B',     // Yellow
    user: '#EC4899',       // Pink
    
    // Graphiti schema node types
    entity: '#8B5CF6',     // Purple
    episodic: '#EF4444',   // Red
    community: '#06B6D4',  // Cyan
    
    // Learning-specific node types
    memory: '#A855F7',     // Purple variant
    fact: '#F87171',       // Red variant
    weakness: '#F97316',   // Orange
    topic: '#22D3EE',      // Cyan variant
    
    unknown: '#6B7280'     // Gray
  };
  return colors[type] || colors.unknown;
}

module.exports = router;
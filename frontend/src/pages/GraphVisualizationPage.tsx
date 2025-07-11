import React, { useState, useEffect } from 'react';
import Container from '../components/Container';
import Button from '../components/Button';
import GraphVisualization from '../components/GraphVisualization';
import GraphControls from '../components/GraphControls';
import NodeDetails from '../components/NodeDetails';
import { getGraphData } from '../api/api';
import { FaProjectDiagram, FaDatabase, FaBrain, FaSpinner } from 'react-icons/fa';

interface Node {
  id: string;
  caption: string;
  type: string;
  properties: any;
  labels: string[];
  color: string;
}

interface Relationship {
  id: string;
  from: string;
  to: string;
  caption: string;
  type: string;
  properties: any;
}

interface GraphData {
  nodes: Node[];
  relationships: Relationship[];
}

const GraphVisualizationPage: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], relationships: [] });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'auto' | 'neo4j' | 'postgresql'>('auto');
  const [graphStats, setGraphStats] = useState({ nodeCount: 0, relationshipCount: 0, source: '' });

  const fetchGraphData = async (source: 'auto' | 'neo4j' | 'postgresql' = 'auto') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getGraphData(source);
      
      if (response.success) {
        setGraphData(response.data);
        setGraphStats({
          nodeCount: response.nodeCount,
          relationshipCount: response.relationshipCount,
          source: response.source
        });
      } else {
        setError(response.error || 'Failed to fetch graph data');
      }
    } catch (err) {
      setError('Network error: Unable to fetch graph data');
      console.error('Graph data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData(dataSource);
  }, [dataSource]);

  const handleNodeSelect = (node: Node) => {
    setSelectedNode(node);
  };

  const handleRefresh = () => {
    fetchGraphData(dataSource);
  };

  const handleSourceChange = (source: 'auto' | 'neo4j' | 'postgresql') => {
    setDataSource(source);
  };

  if (loading) {
    return (
      <Container className="py-20 text-center">
        <div className="flex flex-col items-center justify-center">
          <FaSpinner className="text-6xl text-blue-600 animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Graph Data</h2>
          <p className="text-gray-600">Fetching knowledge graph visualization...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-20 text-center">
        <div className="flex flex-col items-center justify-center">
          <FaDatabase className="text-6xl text-red-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Graph</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="primary">
            Try Again
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 flex items-center">
          <FaProjectDiagram className="mr-4 text-blue-600" />
          Knowledge Graph Visualization
        </h1>
        <p className="text-xl text-gray-700 mb-6">
          Explore the relationships between your learning materials, progress, and knowledge gaps.
        </p>
        
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-sm font-medium text-gray-700">Data Source:</span>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={dataSource === 'auto' ? 'primary' : 'secondary'}
                onClick={() => handleSourceChange('auto')}
              >
                <FaBrain className="mr-2" />
                Auto
              </Button>
              <Button
                size="sm"
                variant={dataSource === 'neo4j' ? 'primary' : 'secondary'}
                onClick={() => handleSourceChange('neo4j')}
              >
                <FaDatabase className="mr-2" />
                Neo4j
              </Button>
              <Button
                size="sm"
                variant={dataSource === 'postgresql' ? 'primary' : 'secondary'}
                onClick={() => handleSourceChange('postgresql')}
              >
                <FaDatabase className="mr-2" />
                PostgreSQL
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Nodes:</span> {graphStats.nodeCount} |{' '}
              <span className="font-medium">Relationships:</span> {graphStats.relationshipCount} |{' '}
              <span className="font-medium">Source:</span> {graphStats.source}
            </div>
            <Button size="sm" variant="secondary" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <GraphVisualization 
              nodes={graphData.nodes} 
              relationships={graphData.relationships}
              onNodeSelect={handleNodeSelect}
            />
          </div>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <GraphControls 
            onRefresh={handleRefresh}
            onSourceChange={handleSourceChange}
            currentSource={dataSource}
          />
          
          {selectedNode && (
            <NodeDetails 
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </div>
      </div>

      {graphData.nodes.length === 0 && (
        <div className="text-center py-12">
          <FaDatabase className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Graph Data Available</h3>
          <p className="text-gray-600 mb-4">
            No nodes or relationships were found in the current data source.
          </p>
          <p className="text-gray-500 text-sm">
            Try creating some flashcard decks or importing documents to populate the graph.
          </p>
        </div>
      )}
    </Container>
  );
};

export default GraphVisualizationPage;
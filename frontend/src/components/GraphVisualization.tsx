import React, { useRef, useEffect, useState } from 'react';
import { InteractiveNvlWrapper } from '@neo4j-nvl/react';

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

interface GraphVisualizationProps {
  nodes: Node[];
  relationships: Relationship[];
  onNodeSelect?: (node: Node) => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ 
  nodes, 
  relationships, 
  onNodeSelect 
}) => {
  const nvlRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Transform data to NVL format
  const nvlNodes = nodes.map(node => ({
    id: node.id,
    caption: node.caption || node.id,
    type: node.type,
    properties: {
      ...node.properties,
      color: node.color
    },
    labels: node.labels || [node.type]
  }));

  const nvlRelationships = relationships.map(rel => ({
    id: rel.id,
    from: rel.from,
    to: rel.to,
    caption: rel.caption || rel.type,
    type: rel.type,
    properties: rel.properties
  }));

  // NVL configuration options
  const nvlOptions = {
    allowDynamicMinZoom: true,
    disableTelemetry: true,
    initialZoom: 1,
    maxZoom: 3,
    minZoom: 0.1
  };

  // Mouse event callbacks
  const mouseEventCallbacks = {
    onPan: true,
    onZoom: true,
    onDrag: true,
    onNodeClick: (node: any) => {
      if (onNodeSelect) {
        const originalNode = nodes.find(n => n.id === node.id);
        if (originalNode) {
          onNodeSelect(originalNode);
        }
      }
    },
    onNodeHover: (node: any) => {
      // Optional: Add hover effects
    },
    onBackgroundClick: () => {
      // Optional: Deselect node when clicking background
      if (onNodeSelect) {
        // onNodeSelect(null);
      }
    }
  };

  // Layout callback
  const onLayoutDone = () => {
    if (!isInitialized) {
      setIsInitialized(true);
      // Optionally fit the graph to view
      if (nvlRef.current && nvlNodes.length > 0) {
        setTimeout(() => {
          nvlRef.current?.fit();
        }, 100);
      }
    }
  };

  // NVL callbacks
  const nvlCallbacks = {
    onLayoutDone
  };

  // Effect to handle data updates
  useEffect(() => {
    if (nvlRef.current && isInitialized) {
      // Fit graph when new data is loaded
      setTimeout(() => {
        nvlRef.current?.fit();
      }, 100);
    }
  }, [nodes, relationships, isInitialized]);

  // Show message when no data is available
  if (nvlNodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No graph data</h3>
          <p className="mt-1 text-sm text-gray-500">
            No nodes or relationships available to visualize.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 lg:h-[600px] border rounded-lg overflow-hidden">
      <InteractiveNvlWrapper
        ref={nvlRef}
        nodes={nvlNodes}
        rels={nvlRelationships}
        nvlOptions={nvlOptions}
        nvlCallbacks={nvlCallbacks}
        mouseEventCallbacks={mouseEventCallbacks}
      />
    </div>
  );
};

export default GraphVisualization;
import React from 'react';
import Button from './Button';
import { FaSync, FaDatabase, FaBrain, FaFilter } from 'react-icons/fa';

interface GraphControlsProps {
  onRefresh: () => void;
  onSourceChange: (source: 'auto' | 'neo4j' | 'postgresql') => void;
  currentSource: 'auto' | 'neo4j' | 'postgresql';
}

const GraphControls: React.FC<GraphControlsProps> = ({
  onRefresh,
  onSourceChange,
  currentSource
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <FaFilter className="mr-2 text-blue-600" />
        Graph Controls
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Source
          </label>
          <div className="space-y-2">
            <Button
              size="sm"
              variant={currentSource === 'auto' ? 'primary' : 'secondary'}
              onClick={() => onSourceChange('auto')}
              className="w-full justify-start"
            >
              <FaBrain className="mr-2" />
              Auto (Smart Selection)
            </Button>
            <Button
              size="sm"
              variant={currentSource === 'neo4j' ? 'primary' : 'secondary'}
              onClick={() => onSourceChange('neo4j')}
              className="w-full justify-start"
            >
              <FaDatabase className="mr-2" />
              Neo4j Knowledge Graph
            </Button>
            <Button
              size="sm"
              variant={currentSource === 'postgresql' ? 'primary' : 'secondary'}
              onClick={() => onSourceChange('postgresql')}
              className="w-full justify-start"
            >
              <FaDatabase className="mr-2" />
              PostgreSQL Database
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <Button
            size="sm"
            variant="secondary"
            onClick={onRefresh}
            className="w-full"
          >
            <FaSync className="mr-2" />
            Refresh Graph
          </Button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="text-xs font-semibold text-gray-600 mb-1">PostgreSQL Data:</div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Deck</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Flashcard</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span>Answer</span>
          </div>
          
          <div className="text-xs font-semibold text-gray-600 mb-1 mt-3">Knowledge Graph:</div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span>Entity</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Episodic</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-cyan-500 rounded-full mr-2"></div>
            <span>Community</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span>Weakness</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
            <span>User</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Interaction Tips</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Click nodes to view details</li>
          <li>• Drag to pan the graph</li>
          <li>• Scroll to zoom in/out</li>
          <li>• Drag nodes to reposition</li>
        </ul>
      </div>
    </div>
  );
};

export default GraphControls;
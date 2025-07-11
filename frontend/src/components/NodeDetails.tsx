import React from 'react';
import Button from './Button';
import { FaTimes, FaTag, FaDatabase, FaQuestion, FaLightbulb, FaBrain, FaExclamationTriangle } from 'react-icons/fa';

interface Node {
  id: string;
  caption: string;
  type: string;
  properties: any;
  labels: string[];
  color: string;
}

interface NodeDetailsProps {
  node: Node;
  onClose: () => void;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({ node, onClose }) => {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'deck':
        return <FaDatabase className="text-blue-600" />;
      case 'flashcard':
        return <FaQuestion className="text-green-600" />;
      case 'answer':
        return <FaLightbulb className="text-yellow-600" />;
      case 'memory':
        return <FaBrain className="text-purple-600" />;
      case 'weakness':
        return <FaExclamationTriangle className="text-red-600" />;
      default:
        return <FaTag className="text-gray-600" />;
    }
  };

  const formatPropertyValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    return String(value);
  };

  const getDisplayName = () => {
    return node.caption || node.properties.name || node.properties.question || node.id;
  };

  const getRelevantProperties = () => {
    const props = { ...node.properties };
    
    // Remove common properties that are already displayed
    delete props.name;
    delete props.question;
    delete props.color;
    
    // Filter out null/undefined values
    const filteredProps = Object.entries(props).filter(([_, value]) => 
      value !== null && value !== undefined && value !== ''
    );
    
    return filteredProps;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          {getNodeIcon(node.type)}
          <span className="ml-2">Node Details</span>
        </h3>
        <Button
          size="sm"
          variant="secondary"
          onClick={onClose}
          className="p-2"
        >
          <FaTimes />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {getDisplayName()}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <div className="flex items-center">
            <span 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: node.color }}
            ></span>
            <span className="text-sm text-gray-900 capitalize">{node.type}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID
          </label>
          <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
            {node.id}
          </p>
        </div>

        {node.labels && node.labels.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Labels
            </label>
            <div className="flex flex-wrap gap-1">
              {node.labels.map((label, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {getRelevantProperties().length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Properties
            </label>
            <div className="space-y-2">
              {getRelevantProperties().map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-sm text-gray-900">
                    {formatPropertyValue(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {node.type === 'flashcard' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Flashcard Info</h4>
            <div className="space-y-2 text-sm">
              {node.properties.question && (
                <div>
                  <strong className="text-blue-700">Question:</strong>
                  <p className="text-blue-900 mt-1">{node.properties.question}</p>
                </div>
              )}
              {node.properties.answer && (
                <div>
                  <strong className="text-blue-700">Answer:</strong>
                  <p className="text-blue-900 mt-1">{node.properties.answer}</p>
                </div>
              )}
              {node.properties.score !== undefined && (
                <div>
                  <strong className="text-blue-700">Score:</strong>
                  <span className="text-blue-900 ml-1">{node.properties.score}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {node.type === 'deck' && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">Deck Info</h4>
            <div className="space-y-2 text-sm">
              {node.properties.description && (
                <div>
                  <strong className="text-green-700">Description:</strong>
                  <p className="text-green-900 mt-1">{node.properties.description}</p>
                </div>
              )}
              {node.properties.createdAt && (
                <div>
                  <strong className="text-green-700">Created:</strong>
                  <span className="text-green-900 ml-1">
                    {new Date(node.properties.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {node.type === 'weakness' && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-2">Learning Gap</h4>
            <div className="space-y-2 text-sm">
              {node.properties.content && (
                <div>
                  <strong className="text-red-700">Details:</strong>
                  <p className="text-red-900 mt-1">{node.properties.content}</p>
                </div>
              )}
              {node.properties.topic && (
                <div>
                  <strong className="text-red-700">Topic:</strong>
                  <span className="text-red-900 ml-1">{node.properties.topic}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeDetails;
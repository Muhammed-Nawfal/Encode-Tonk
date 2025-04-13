import React from 'react';
import { AICard as AICardType } from '../../stores/noteStore';

interface AICardProps {
  card: AICardType;
  onDelete?: () => void;
}

const AICard: React.FC<AICardProps> = ({ card, onDelete }) => {
  const formatDate = (date: Date) => {
    try {
      return new Date(date).toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getTypeIcon = (type: AICardType['type']) => {
    switch (type) {
      case 'summary':
        return '📝';
      case 'flashcard':
        return '🎴';
      case 'revision':
        return '📚';
      default:
        return '❓';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2" role="img" aria-label={card.type}>
            {getTypeIcon(card.type)}
          </span>
          <div>
            <h3 className="text-lg font-semibold capitalize">{card.type}</h3>
            <p className="text-sm text-gray-500">
              Generated {formatDate(card.metadata.generatedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm ${getConfidenceColor(card.metadata.confidence)}`}
          >
            {Math.round(card.metadata.confidence * 100)}% confidence
          </span>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-500"
              aria-label="Delete"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="prose max-w-none">
        {card.type === 'flashcard' ? (
          <div className="space-y-4">
            {card.content.split('\n').map((line, index) => {
              if (line.startsWith('Q:')) {
                return (
                  <div key={index} className="bg-blue-50 p-3 rounded">
                    <strong className="text-blue-700">Question:</strong>
                    <p className="mt-1">{line.slice(2).trim()}</p>
                  </div>
                );
              } else if (line.startsWith('A:')) {
                return (
                  <div key={index} className="bg-green-50 p-3 rounded">
                    <strong className="text-green-700">Answer:</strong>
                    <p className="mt-1">{line.slice(2).trim()}</p>
                  </div>
                );
              }
              return <p key={index}>{line}</p>;
            })}
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{card.content}</div>
        )}
      </div>
    </div>
  );
};

export default AICard; 
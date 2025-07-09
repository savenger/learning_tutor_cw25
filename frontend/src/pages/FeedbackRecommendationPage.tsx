import React, { useState, useEffect } from 'react';
import Container from '../components/Container';
import Button from '../components/Button';
import { getFeedbackRecommendations } from '../api/api';
import { FaLightbulb, FaRedo, FaChartLine } from 'react-icons/fa';

const FeedbackRecommendationPage: React.FC = () => {
  const [feedbackData, setFeedbackData] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await getFeedbackRecommendations();
    
    if (data) {
      setFeedbackData(data.feedback);
    } else if (error) {
      setError(error);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <Container>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center">
            <FaLightbulb className="mr-3 text-yellow-500" />
            Feedback & Recommendations
          </h1>
          <p className="text-gray-600 text-lg">
            Get personalized insights about your learning progress and recommendations for improvement.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <FaChartLine className="mr-2 text-blue-500" />
              Your Learning Insights
            </h2>
            <Button 
              onClick={fetchFeedback}
              disabled={loading}
              variant="secondary"
              className="flex items-center"
            >
              <FaRedo className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {loading && !feedbackData && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Analyzing your learning progress...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 text-lg mb-4">Error: {error}</p>
              <Button onClick={fetchFeedback} variant="primary">
                Try Again
              </Button>
            </div>
          )}

          {feedbackData && !loading && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  AI-Generated Feedback & Recommendations
                </h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {feedbackData}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h4 className="text-lg font-semibold text-green-800 mb-3">
                    💡 Quick Tips
                  </h4>
                  <ul className="text-green-700 space-y-2">
                    <li>• Review flashcards regularly for better retention</li>
                    <li>• Focus on cards you find most challenging</li>
                    <li>• Take breaks between study sessions</li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                  <h4 className="text-lg font-semibold text-orange-800 mb-3">
                    📊 Study Statistics
                  </h4>
                  <ul className="text-orange-700 space-y-2">
                    <li>• Cards studied: Coming soon</li>
                    <li>• Average accuracy: Coming soon</li>
                    <li>• Study streak: Coming soon</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-gray-500 text-sm">
          <p>
            This feedback is generated based on your learning patterns and performance.
            <br />
            Keep practicing to see more personalized recommendations!
          </p>
        </div>
      </div>
    </Container>
  );
};

export default FeedbackRecommendationPage; 
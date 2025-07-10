import React, { useState } from 'react';
import Container from '../components/Container';
import TextHighlighter from '../components/TextHighlighter';
import { sendToWebhook, sendToTestWebhook } from '../api/api';

const TextHighlightingPage: React.FC = () => {
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [testWebhookLoading, setTestWebhookLoading] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState('');
  const [testWebhookStatus, setTestWebhookStatus] = useState('');

  const handleWebhookSend = async (text: string, highlights: any[]) => {
    setWebhookLoading(true);
    setWebhookStatus('');
    
    try {
      const result = await sendToWebhook(text, highlights);
      if (result.success) {
        setWebhookStatus('✅ ' + result.message);
      } else {
        setWebhookStatus('❌ ' + result.error);
      }
    } catch (error) {
      setWebhookStatus('❌ Network error');
    } finally {
      setWebhookLoading(false);
      setTimeout(() => setWebhookStatus(''), 3000);
    }
  };

  const handleTestWebhookSend = async (text: string, highlights: any[]) => {
    setTestWebhookLoading(true);
    setTestWebhookStatus('');
    
    try {
      const result = await sendToTestWebhook(text, highlights);
      if (result.success) {
        setTestWebhookStatus('✅ ' + result.message);
      } else {
        setTestWebhookStatus('❌ ' + result.error);
      }
    } catch (error) {
      setTestWebhookStatus('❌ Network error');
    } finally {
      setTestWebhookLoading(false);
      setTimeout(() => setTestWebhookStatus(''), 3000);
    }
  };

  return (
    <Container>
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Import from Text
      </h1>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <p className="text-gray-700 mb-6 text-center">
          Paste your text below and highlight important sections. We'll help you generate flashcards from the highlighted content.
        </p>
        
        <TextHighlighter
          onSendToWebhook={handleWebhookSend}
          onSendToTestWebhook={handleTestWebhookSend}
          webhookLoading={webhookLoading}
          testWebhookLoading={testWebhookLoading}
          webhookStatus={webhookStatus}
          testWebhookStatus={testWebhookStatus}
        />
      </div>
    </Container>
  );
};

export default TextHighlightingPage;
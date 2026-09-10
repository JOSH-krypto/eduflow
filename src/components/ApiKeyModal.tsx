import React, { useState } from 'react';
import { Key, CheckCircle, AlertCircle, X, ExternalLink, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSaveKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  onSaveKey,
}) => {
  const [apiKey, setApiKey] = useState(currentKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key to test.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Say "OK" in 1 word.',
      });

      if (response.text) {
        setTestResult({ success: true, message: 'Connection successful! Gemini API is active.' });
      } else {
        setTestResult({ success: false, message: 'No response text returned from Gemini API.' });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e?.message || 'Invalid API key or network error. Please verify your key.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSaveKey(apiKey.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chalkboard-darkest/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-lg bg-chalkboard-surface border border-chalkboard-borderStrong rounded-2xl shadow-2xl p-6 text-chalk-white animate-node-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-chalkboard-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent-gold/20 text-accent-gold border border-accent-gold/30">
              <Key className="w-4 h-4" />
            </div>
            <h2 className="font-chalk text-xl font-bold text-chalk-white">
              Gemini API Setup
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-chalk-muted hover:text-chalk-white hover:bg-chalkboard-surfaceHover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 font-sans text-xs">
          <p className="text-chalk-muted leading-relaxed">
            The Exam Prep Planner uses <span className="text-chalk-white font-medium">@google/genai</span> to generate structured, curriculum-aligned study plans and mind maps.
          </p>

          <div className="p-3.5 rounded-xl bg-chalkboard-bg border border-chalkboard-border space-y-2">
            <label className="block text-xs font-semibold text-chalk-white flex items-center justify-between">
              <span>Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-accent-gold hover:underline flex items-center gap-1 font-normal"
              >
                Get a free key <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 rounded-lg bg-chalkboard-surface border border-chalkboard-border text-sm text-chalk-white font-mono placeholder-chalk-muted focus:outline-none focus:border-accent-gold transition-colors"
            />
            <p className="text-[11px] text-chalk-muted">
              Note: You can also define <code className="text-accent-teal bg-chalkboard-surface px-1 py-0.5 rounded">GEMINI_API_KEY</code> or <code className="text-accent-teal bg-chalkboard-surface px-1 py-0.5 rounded">VITE_GEMINI_API_KEY</code> in a <code className="text-chalk-white">.env</code> file.
            </p>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2 ${
                testResult.success
                  ? 'bg-accent-teal/15 border-accent-teal/40 text-accent-teal'
                  : 'bg-accent-red/15 border-accent-red/40 text-accent-red'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={testing || !apiKey.trim()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-chalkboard-bg hover:bg-chalkboard-surfaceHover text-chalk-white border border-chalkboard-border font-medium text-xs disabled:opacity-40 transition-colors"
            >
              <Sparkles className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-accent-gold' : 'text-accent-teal'}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-chalk-muted hover:text-chalk-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-accent-gold hover:bg-accent-gold/90 text-chalkboard-darkest font-bold text-xs shadow-md transition-transform active:scale-95"
              >
                Save Key
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

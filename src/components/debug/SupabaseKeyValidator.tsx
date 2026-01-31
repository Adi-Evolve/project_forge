import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const SupabaseKeyValidator: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const validateSupabaseKeys = async () => {
    setIsLoading(true);
    const results = [];

    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

    // Test 1: Check if environment variables exist
    results.push({
      test: 'Environment Variables',
      status: supabaseUrl && anonKey ? 'success' : 'error',
      message: supabaseUrl && anonKey ? 'Environment variables found' : 'Missing SUPABASE_URL or ANON_KEY',
      details: {
        url: supabaseUrl ? '✅ Present' : '❌ Missing',
        anonKey: anonKey ? '✅ Present' : '❌ Missing'
      }
    });

    if (supabaseUrl && anonKey) {
      // Test 2: Check API connection
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json'
          }
        });

        results.push({
          test: 'API Connection',
          status: response.status === 200 ? 'success' : 'error',
          message: response.status === 200 ? 'API connection successful' : `API returned status ${response.status}`,
          details: {
            status: response.status,
            statusText: response.statusText
          }
        });

        // Test 3: Check Auth endpoint
        const authResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
          }
        });

        results.push({
          test: 'Auth Endpoint',
          status: authResponse.status === 200 ? 'success' : 'error',
          message: authResponse.status === 200 ? 'Auth endpoint accessible' : `Auth endpoint returned status ${authResponse.status}`,
          details: {
            status: authResponse.status,
            statusText: authResponse.statusText
          }
        });

        if (authResponse.status === 200) {
          const authSettings = await authResponse.json();
          results.push({
            test: 'OAuth Providers',
            status: 'info',
            message: 'Available OAuth providers',
            details: {
              providers: authSettings.external || []
            }
          });
        }

      } catch (error: any) {
        results.push({
          test: 'API Connection',
          status: 'error',
          message: `Connection failed: ${error.message}`,
          details: { error: error.message }
        });
      }
    }

    setTestResults(results);
    setIsLoading(false);
  };

  useEffect(() => {
    validateSupabaseKeys();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 to-primary-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Supabase API Key Validator</h1>
          <p className="text-secondary-300">Check if your Supabase configuration is working correctly</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary-800 rounded-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Configuration Tests</h2>
            <button
              onClick={validateSupabaseKeys}
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Retest'}
            </button>
          </div>

          <div className="space-y-4">
            {testResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.status)}
                    <h3 className="font-medium text-gray-900">{result.test}</h3>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{result.message}</p>
                {result.details && (
                  <div className="bg-white bg-opacity-50 rounded p-2 text-sm">
                    <pre className="text-gray-600">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-secondary-800 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Quick Fix Instructions</h2>
          <div className="space-y-4 text-secondary-300">
            <div className="bg-blue-900/20 border border-blue-400/20 rounded-lg p-4">
              <h3 className="font-medium text-blue-300 mb-2">If you see 401 Unauthorized errors:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Supabase Dashboard</a></li>
                <li>Select your project: zatysaexdxqieeqylsgr</li>
                <li>Go to Settings → API</li>
                <li>Copy the new anon/public key</li>
                <li>Update your .env file</li>
                <li>Restart your development server</li>
              </ol>
            </div>
            
            <div className="bg-green-900/20 border border-green-400/20 rounded-lg p-4">
              <h3 className="font-medium text-green-300 mb-2">Environment Variables Format:</h3>
              <pre className="text-xs text-green-200 bg-green-900/30 p-2 rounded">
{`REACT_APP_SUPABASE_URL=https://zatysaexdxqieeqylsgr.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ... (your new key here)`}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SupabaseKeyValidator;
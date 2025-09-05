'use client';

import { useState } from 'react';
import { stockApi } from '@/services/stockApi';
import Button from '@/components/ui/Button';

export default function ApiTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSearch = async () => {
    setLoading(true);
    try {
      const results = await stockApi.searchStocks('AAPL');
      setResult(results);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
    setLoading(false);
  };

  const testQuote = async () => {
    setLoading(true);
    try {
      const quote = await stockApi.getStockQuote('AAPL');
      setResult(quote);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
    setLoading(false);
  };

  const testHistoricalData = async () => {
    setLoading(true);
    try {
      const historical = await stockApi.getHistoricalPrices('AAPL');
      setResult({ 
        dataLength: historical?.length || 0,
        firstFewRecords: historical?.slice(0, 5) || [],
        lastFewRecords: historical?.slice(-5) || []
      });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
    setLoading(false);
  };

  const testStableQuote = async () => {
    setLoading(true);
    try {
      // Test the stable quote endpoint directly
      const url = 'https://financialmodelingprep.com/stable/quote?symbol=AAPL&apikey=dwVGc1ATt2CKGMCYr8MB6Iv4Armr0Que';
      console.log('Testing Stable Quote URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      setResult({ url, status: response.status, data });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
    setLoading(false);
  };

  const testProfile = async () => {
    setLoading(true);
    try {
      const profile = await stockApi.getCompanyProfile('AAPL');
      setResult(profile);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
    setLoading(false);
  };

  const testHistoricalEndpoint = async () => {
    setLoading(true);
    try {
      // Test the historical endpoint directly
      const url = 'https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=AAPL&apikey=dwVGc1ATt2CKGMCYr8MB6Iv4Armr0Que';
      console.log('Testing Historical Endpoint URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      setResult({ 
        url, 
        status: response.status, 
        dataLength: Array.isArray(data) ? data.length : 0,
        firstRecord: Array.isArray(data) && data.length > 0 ? data[0] : null,
        data: Array.isArray(data) ? data.slice(0, 3) : data 
      });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
    setLoading(false);
  };

  // Add this new test function:
  const testAllHistoricalEndpoints = async () => {
    setLoading(true);
    try {
      const symbol = 'AAPL';
      const results: any = {};

      // Test regular historical endpoint
      try {
        const url1 = `https://financialmodelingprep.com/stable/historical-price-eod?symbol=${symbol}&apikey=dwVGc1ATt2CKGMCYr8MB6Iv4Armr0Que`;
        const response1 = await fetch(url1);
        const data1 = await response1.json();
        results.regular = {
          url: url1,
          status: response1.status,
          dataLength: Array.isArray(data1) ? data1.length : 0,
          firstRecord: Array.isArray(data1) && data1.length > 0 ? data1[0] : null,
          error: response1.ok ? null : data1
        };
      } catch (error) {
        results.regular = { error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Test light historical endpoint
      try {
        const url2 = `https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=${symbol}&apikey=dwVGc1ATt2CKGMCYr8MB6Iv4Armr0Que`;
        const response2 = await fetch(url2);
        const data2 = await response2.json();
        results.light = {
          url: url2,
          status: response2.status,
          dataLength: Array.isArray(data2) ? data2.length : 0,
          firstRecord: Array.isArray(data2) && data2.length > 0 ? data2[0] : null,
          error: response2.ok ? null : data2
        };
      } catch (error) {
        results.light = { error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Test stock price change endpoint
      try {
        const url3 = `https://financialmodelingprep.com/stable/stock-price-change?symbol=${symbol}&apikey=dwVGc1ATt2CKGMCYr8MB6Iv4Armr0Que`;
        const response3 = await fetch(url3);
        const data3 = await response3.json();
        results.priceChange = {
          url: url3,
          status: response3.status,
          data: data3,
          error: response3.ok ? null : data3
        };
      } catch (error) {
        results.priceChange = { error: error instanceof Error ? error.message : 'Unknown error' };
      }

      setResult(results);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">API Test</h2>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button onClick={testSearch} isLoading={loading}>
          Test Search
        </Button>
        <Button onClick={testQuote} isLoading={loading}>
          Test Quote
        </Button>
        <Button onClick={testStableQuote} isLoading={loading}>
          Test Stable Quote
        </Button>
        <Button onClick={testProfile} isLoading={loading}>
          Test Profile
        </Button>
        <Button onClick={testHistoricalData} isLoading={loading}>
          Test Historical Data
        </Button>
        <Button onClick={testHistoricalEndpoint} isLoading={loading}>
          Test Historical Endpoint
        </Button>
        <Button onClick={testAllHistoricalEndpoints} isLoading={loading}>
          Test All Historical Endpoints
        </Button>
      </div>

      {result && (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
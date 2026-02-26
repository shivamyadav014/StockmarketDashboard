const axios = require('axios');

/*
SEARCH STOCK CONTROLLER
- Calls Alpha Vantage API (Backend only - API key never exposed)
- Returns real-time stock data: price, high, low, previous close, % change
- Handles API errors gracefully
*/
const searchStock = async (req, res) => {
  try {
    const { symbol } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol required' });
    }

    // Call Finnhub API from backend (API key hidden)
    const response = await axios.get('https://finnhub.io/api/v1/quote', {
      params: {
        symbol: symbol.toUpperCase(),
        token: process.env.STOCK_API_KEY,
      },
    });

    const quote = response.data;

    // Check if quote has valid data
    if (!quote.c) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    // Format response
    const stockData = {
      symbol: symbol.toUpperCase(),
      price: quote.c || 0,
      change: quote.d || 0,
      changePercent: `${quote.dp || 0}%`,
      high: quote.h || 0,
      low: quote.l || 0,
      previousClose: quote.pc || 0,
      timestamp: new Date(quote.t * 1000).toISOString(),
    };

    res.status(200).json({
      success: true,
      data: stockData,
    });
  } catch (error) {
    console.error('Stock API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
};

/*
GET HISTORICAL DATA
- Fetches 30-day historical data from Alpha Vantage
- Returns array of daily prices for charting
*/
const getHistoricalData = async (req, res) => {
  try {
    const { symbol, days = 30 } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Stock symbol required' });
    }

    // Call Alpha Vantage API for time series data
    const response = await axios.get(process.env.STOCK_API_BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol.toUpperCase(),
        outputsize: 'full', // Get more data
        apikey: process.env.STOCK_API_KEY,
      },
    });

    const timeSeries = response.data['Time Series (Daily)'];

    if (!timeSeries) {
      return res.status(404).json({ error: 'No historical data found' });
    }

    // Convert object to array and limit to requested days
    const historicalData = Object.entries(timeSeries)
      .slice(0, parseInt(days))
      .map(([date, data]) => ({
        date,
        close: parseFloat(data['4. close']),
        high: parseFloat(data['2. high']),
        low: parseFloat(data['3. low']),
        volume: parseInt(data['5. volume']),
      }))
      .reverse();

    res.status(200).json({
      success: true,
      symbol: symbol.toUpperCase(),
      data: historicalData,
    });
  } catch (error) {
    console.error('Historical data error:', error.message);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
};

module.exports = { searchStock, getHistoricalData };

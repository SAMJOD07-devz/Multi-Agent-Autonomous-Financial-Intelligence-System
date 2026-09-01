import logging
from typing import Dict, Any
import yfinance as yf
import pandas as pd
import pandas_ta as ta

# Configure module-level logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(module)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_market_snapshot(ticker: str) -> Dict[str, Any]:
    """
    Fetches the last 6 months of market data for a given ticker and calculates 
    key technical indicators (SMA, RSI, MACD, and Volume Anomaly).

    Args:
        ticker (str): The financial ticker symbol (e.g., "RELIANCE.NS").

    Returns:
        dict: A dictionary containing the current price, percentage change, 
              SMA, RSI, MACD, and volume anomaly flag. Returns an error dict if failed.
    """
    logger.info(f"Fetching market snapshot for ticker: {ticker}")
    
    try:
        # Fetch 6 months of daily data to ensure enough periods for a 20-day SMA and MACD
        ticker_obj = yf.Ticker(ticker)
        df = ticker_obj.history(period="6mo")
        
        if df.empty:
            logger.warning(f"No market data found for {ticker}.")
            return {"status": "DATA_UNAVAILABLE", "message": "API returned empty DataFrame."}

        # Ensure index is sorted by date
        df.sort_index(inplace=True)

        # 1. Price & Daily Percentage Change
        df['Pct_Change'] = df['Close'].pct_change() * 100

        # 2. Calculate Indicators using pandas-ta
        # Append=True adds the columns directly to the DataFrame
        df.ta.sma(length=20, append=True)
        df.ta.rsi(length=14, append=True)
        df.ta.macd(fast=12, slow=26, signal=9, append=True)

        # 3. Volume Anomaly (Today's volume > 1.5x the 20-day average)
        df['Volume_SMA_20'] = df['Volume'].rolling(window=20).mean()
        df['Volume_Anomaly'] = df['Volume'] > (1.5 * df['Volume_SMA_20'])

        # Extract the latest row (most recent trading day)
        latest = df.iloc[-1]

        # Identify dynamically generated pandas-ta column names
        macd_col = [col for col in df.columns if col.startswith('MACD_')][0]
        sma_col = [col for col in df.columns if col.startswith('SMA_')][0]
        rsi_col = [col for col in df.columns if col.startswith('RSI_')][0]

        snapshot = {
            "status": "SUCCESS",
            "ticker": ticker,
            "date": str(latest.name.date()),
            "current_price": round(float(latest['Close']), 2),
            "daily_pct_change": round(float(latest['Pct_Change']), 2),
            "sma_20": round(float(latest[sma_col]), 2),
            "rsi_14": round(float(latest[rsi_col]), 2),
            "macd": round(float(latest[macd_col]), 4),
            "volume_anomaly": bool(latest['Volume_Anomaly'])
        }

        logger.info(f"Successfully generated market snapshot for {ticker}")
        return snapshot

    except Exception as e:
        logger.error(f"Error fetching data for {ticker}: {e}")
        return {
            "status": "DATA_UNAVAILABLE",
            "message": f"An error occurred: {str(e)}"
        }

if __name__ == "__main__":
    # Test Block
    test_ticker = "RELIANCE.NS"
    print(f"--- Testing get_market_snapshot for {test_ticker} ---")
    result = get_market_snapshot(test_ticker)
    
    import json
    print(json.dumps(result, indent=4))
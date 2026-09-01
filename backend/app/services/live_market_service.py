# backend/app/services/live_market_service.py
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

def fetch_live_stock_data(ticker_symbol: str) -> Dict[str, Any]:
    """
    Dynamically fetches real-time market price data for Indian equities (NSE/BSE)
    using yfinance API with automatic ticker formatting (.NS suffix).
    """
    clean_ticker = ticker_symbol.strip().upper()
    formatted_ticker = clean_ticker if '.' in clean_ticker else f"{clean_ticker}.NS"

    try:
        import yfinance as yf
        stock = yf.Ticker(formatted_ticker)
        fast_info = getattr(stock, 'fast_info', {})
        
        last_price = fast_info.get('lastPrice') or fast_info.get('last_price')
        prev_close = fast_info.get('previousClose') or fast_info.get('previous_close')
        
        if last_price is not None:
            price_change = (last_price - prev_close) if prev_close else 0.0
            price_change_pct = (price_change / prev_close * 100) if prev_close else 0.0
            
            return {
                "ticker": clean_ticker,
                "formatted_ticker": formatted_ticker,
                "current_price": round(float(last_price), 2),
                "previous_close": round(float(prev_close), 2) if prev_close else None,
                "price_change": round(float(price_change), 2),
                "price_change_pct": round(float(price_change_pct), 2),
                "is_live": True
            }
    except Exception as err:
        logger.warning(f"Live market fetch failed for {formatted_ticker}: {err}")

    # Default fallback baseline if network or exchange is closed
    default_prices = {
        "RELIANCE": 1301.50,
        "TCS": 4120.00,
        "INFY": 1850.00,
        "HDFCBANK": 1680.00,
        "TATAMOTORS": 780.00
    }
    fallback_price = default_prices.get(clean_ticker, 1000.00)
    
    return {
        "ticker": clean_ticker,
        "formatted_ticker": formatted_ticker,
        "current_price": fallback_price,
        "previous_close": fallback_price,
        "price_change": 0.0,
        "price_change_pct": 0.0,
        "is_live": False
    }

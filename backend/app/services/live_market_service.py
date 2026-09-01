# backend/app/services/live_market_service.py
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Common ticker alias mappings for Indian markets
TICKER_ALIASES: Dict[str, str] = {
    "HDFC": "HDFCBANK.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "INFY": "INFY.NS",
    "INFOSYS": "INFY.NS",
    "SBIN": "SBIN.NS",
    "SBI": "SBIN.NS",
    "ICICI": "ICICIBANK.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "ITC": "ITC.NS",
    "BHARTIARTL": "BHARTIARTL.NS",
    "AIRTEL": "BHARTIARTL.NS",
    "WIPRO": "WIPRO.NS",
    "LT": "LT.NS",
    "L&T": "LT.NS",
    "MARUTI": "MARUTI.NS",
    "BAJFINANCE": "BAJFINANCE.NS",
    "BAJAJFINANCE": "BAJFINANCE.NS",
    "TATAMOTORS": "TATAMOTORS.NS",
    "TATASTEEL": "TATASTEEL.NS",
    "KOTAKBANK": "KOTAKBANK.NS",
    "AXISBANK": "AXISBANK.NS",
}

DEFAULT_PRICES: Dict[str, float] = {
    "RELIANCE": 1302.60,
    "TCS": 2356.00,
    "INFY": 1147.60,
    "HDFCBANK": 709.50,
    "HDFC": 709.50,
    "SBIN": 1029.90,
    "ICICIBANK": 1428.00,
    "ITC": 266.30,
    "TATAMOTORS": 780.00,
    "BHARTIARTL": 1940.00,
    "WIPRO": 320.00,
    "LT": 3650.00,
    "MARUTI": 12800.00,
    "BAJFINANCE": 8900.00,
    "KOTAKBANK": 1980.00,
    "AXISBANK": 1180.00,
}


def fetch_live_stock_data(ticker_symbol: str) -> Dict[str, Any]:
    """
    Dynamically fetches real-time market price data for Indian equities (NSE/BSE)
    using yfinance API with automatic ticker formatting and alias resolution.
    """
    clean_ticker = ticker_symbol.strip().upper()
    formatted_ticker = TICKER_ALIASES.get(clean_ticker) or (clean_ticker if '.' in clean_ticker else f"{clean_ticker}.NS")

    try:
        import yfinance as yf
        stock = yf.Ticker(formatted_ticker)
        
        last_price = None
        prev_close = None

        # 1. Try fast_info
        try:
            fast_info = getattr(stock, 'fast_info', None)
            if fast_info:
                last_price = fast_info.get('lastPrice') or fast_info.get('last_price')
                prev_close = fast_info.get('previousClose') or fast_info.get('previous_close')
        except Exception:
            pass

        # 2. Fallback to 1-day history if fast_info is unavailable
        if last_price is None:
            try:
                hist = stock.history(period="2d")
                if not hist.empty and len(hist) >= 1:
                    last_price = float(hist['Close'].iloc[-1])
                    if len(hist) >= 2:
                        prev_close = float(hist['Close'].iloc[-2])
                    else:
                        prev_close = float(hist['Open'].iloc[-1])
            except Exception:
                pass

        if last_price is not None and not (isinstance(last_price, float) and (last_price != last_price)): # not NaN
            last_p = round(float(last_price), 2)
            prev_c = round(float(prev_close), 2) if prev_close else last_p
            price_change = round(last_p - prev_c, 2)
            price_change_pct = round((price_change / prev_c * 100), 2) if prev_c else 0.0

            return {
                "ticker": clean_ticker,
                "formatted_ticker": formatted_ticker,
                "current_price": last_p,
                "previous_close": prev_c,
                "price_change": price_change,
                "price_change_pct": price_change_pct,
                "is_live": True
            }
    except Exception as err:
        logger.warning(f"Live market fetch failed for {formatted_ticker}: {err}")

    # Fallback baseline if symbol is unavailable or exchange is closed
    fallback_price = DEFAULT_PRICES.get(clean_ticker, 1000.00)
    
    return {
        "ticker": clean_ticker,
        "formatted_ticker": formatted_ticker,
        "current_price": fallback_price,
        "previous_close": fallback_price,
        "price_change": 0.0,
        "price_change_pct": 0.0,
        "is_live": False
    }

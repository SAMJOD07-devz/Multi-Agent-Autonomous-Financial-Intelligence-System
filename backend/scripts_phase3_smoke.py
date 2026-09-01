import asyncio
from app.schemas import UserProfile
from app.services.intelligence_pipeline import IntelligencePipeline

async def main():
    profile = UserProfile(risk_tolerance='CONSERVATIVE', investment_horizon='LONG_TERM', volatility_tolerance='LOW')
    result = await IntelligencePipeline().run('DEMO', profile)
    print(result.model_dump_json(indent=2))

if __name__ == '__main__':
    asyncio.run(main())

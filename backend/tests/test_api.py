from fastapi.testclient import TestClient
from app.main import app
client=TestClient(app)
def test_health(): assert client.get('/health').json() == {'status':'healthy'}
def test_analyze():
    response=client.post('/api/intelligence/analyze', json={'symbol':'AAPL','revenue_growth':.08,'earnings':95000,'recent_news':['strong growth']})
    body=response.json(); assert response.status_code==200 and len(body['agents'])==3 and 'request_id' in body

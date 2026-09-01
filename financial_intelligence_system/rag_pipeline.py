import logging
from typing import List, Dict, Any
import chromadb
from chromadb.utils import embedding_functions

# Configure module-level logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(module)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RAGPipeline:
    """
    Handles connections to the local ChromaDB vector database and executes 
    semantic searches over financial documents.
    """
    def __init__(self, db_path: str = "./data/chroma_db/", collection_name: str = "financial_documents"):
        logger.info(f"Initializing RAG Pipeline with ChromaDB at {db_path}")
        try:
            # 1. Connect to persistent ChromaDB client
            self.client = chromadb.PersistentClient(path=db_path)
            
            # 2. Initialize embedding function (Matches Phase 1)
            self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="all-MiniLM-L6-v2"
            )
            
            # 3. Load Collection (get_or_create ensures the script doesn't crash if empty)
            self.collection = self.client.get_or_create_collection(
                name=collection_name,
                embedding_function=self.embedding_function
            )
            logger.info(f"Successfully connected to collection: {collection_name}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Vector DB: {e}")
            self.collection = None

    def query_vector_db(self, query: str, ticker: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Queries the vector database for chunks semantically relevant to the query,
        filtered by the provided ticker.

        Args:
            query (str): The natural language query (e.g., "What are the EV margins?").
            ticker (str): The ticker to filter by (e.g., "TATAMOTORS").
            top_k (int): Number of top results to return.

        Returns:
            List[Dict[str, Any]]: A list of dictionaries containing retrieved text and metadata.
        """
        if self.collection is None:
            logger.error("Database uninitialized. Cannot perform query.")
            return [{"status": "DB_ERROR", "message": "Vector database is not initialized."}]

        logger.info(f"Querying DB for ticker '{ticker}' with query: '{query}'")

        try:
            # Execute semantic search with metadata filtering
            # Note: We use the $contains operator assuming the title string includes the ticker
            results = self.collection.query(
                query_texts=[query],
                n_results=top_k,
                where={"document_title": {"$contains": ticker}}
            )

            # ChromaDB returns nested lists for batches. Since we query 1 text, we access index 0.
            documents = results.get('documents', [[]])[0]
            metadatas = results.get('metadatas', [[]])[0]

            # Handle 0 results gracefully
            if not documents:
                logger.warning(f"No regulatory documents found for ticker {ticker}.")
                return [{
                    "status": "MISSING_FILING", 
                    "message": "No regulatory documents found for this ticker."
                }]

            # Format the output as explicitly requested
            formatted_results = []
            for doc, meta in zip(documents, metadatas):
                formatted_results.append({
                    "text": doc,
                    "metadata": meta
                })

            logger.info(f"Successfully retrieved {len(formatted_results)} chunks.")
            return formatted_results

        except Exception as e:
            logger.error(f"Error querying vector database for {ticker}: {e}")
            return [{"status": "QUERY_ERROR", "message": str(e)}]


# Singleton instance for easy importing by other modules
# e.g., `from rag_pipeline import query_vector_db`
_pipeline = None

def query_vector_db(query: str, ticker: str, top_k: int = 3) -> List[Dict[str, Any]]:
    global _pipeline
    if _pipeline is None:
        _pipeline = RAGPipeline()
    return _pipeline.query_vector_db(query, ticker, top_k)


if __name__ == "__main__":
    # Test Block
    test_query = "What are the EV margins and capital expenditure?"
    test_ticker = "TATAMOTORS"
    
    print(f"--- Testing query_vector_db for {test_ticker} ---")
    
    # NOTE: Since we likely don't have the actual DB populated locally in this exact run, 
    # this will safely return the MISSING_FILING dictionary logic instead of crashing.
    retrieved_data = query_vector_db(test_query, test_ticker)
    
    import json
    print(json.dumps(retrieved_data, indent=4))
import os
import re
import hashlib
import logging
import datetime
from typing import List, Dict, Any, Optional

import fitz  # PyMuPDF
import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from langchain_text_splitters import RecursiveCharacterTextSplitter

# ==========================================
# LOGGING CONFIGURATION
# ==========================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("DataIngestionPipeline")


# ==========================================
# CLASS: FinancialDocumentParser
# ==========================================
class FinancialDocumentParser:
    """
    Parses financial documents (PDF/TXT), applies intelligent chunking respecting
    paragraphs and tables, and enforces a strict metadata schema.
    """
    def __init__(
        self, 
        raw_dir: str, 
        chunk_size: int = 1200, 
        chunk_overlap: int = 200
    ):
        self.raw_dir = raw_dir
        
        # We use RecursiveCharacterTextSplitter to avoid naive character-count chunking.
        # It attempts to split by double-newline (paragraphs/tables) first, 
        # then single newline, then periods, preserving semantic boundaries.
        self.text_splitter = RecursiveCharacterTextSplitter(
            separators=["\n\n", "\n", ". ", " "],
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len
        )

    def extract_metadata_from_filename(self, filename: str) -> Dict[str, str]:
        """
        Infers basic metadata (title, date) from the filename or contents.
        """
        # Default fallback values
        title = os.path.splitext(filename)[0].replace("_", " ").title()
        
        # Try to find a YYYY-MM-DD date in the filename
        date_match = re.search(r'\d{4}-\d{2}-\d{2}', filename)
        doc_date = date_match.group() if date_match else datetime.date.today().strftime("%Y-%m-%d")

        return {
            "document_title": title,
            "date": doc_date
        }

    def process_document(self, filepath: str) -> List[Dict[str, Any]]:
        """
        Reads a single document, extracts text page by page, chunks it, 
        and attaches strict metadata.
        """
        filename = os.path.basename(filepath)
        doc_metadata = self.extract_metadata_from_filename(filename)
        processed_chunks = []

        try:
            # PyMuPDF handles PDFs efficiently and keeps text blocks relatively intact
            with fitz.open(filepath) as doc:
                for page_num in range(len(doc)):
                    page = doc[page_num]
                    # Extract text blocks
                    text = page.get_text("text")
                    
                    if not text.strip():
                        continue
                    
                    # Apply intelligent chunking to the page's text
                    chunks = self.text_splitter.split_text(text)
                    
                    for chunk in chunks:
                        # Enforce rigid metadata schema per chunk
                        chunk_dict = {
                            "text": chunk.strip(),
                            "metadata": {
                                "document_title": doc_metadata["document_title"],
                                "date": doc_metadata["date"],
                                "page_number": page_num + 1,  # 1-indexed
                                "clause_or_section": "General" # Extensibility point for NLP header extraction
                            }
                        }
                        processed_chunks.append(chunk_dict)
                        
        except Exception as e:
            logger.error(f"Failed to process or read document {filename}: {e}")
            return []

        logger.info(f"Successfully processed '{filename}' into {len(processed_chunks)} chunks.")
        return processed_chunks

    def ingest_directory(self) -> List[Dict[str, Any]]:
        """
        Iterates over all documents in the raw directory and parses them.
        """
        if not os.path.exists(self.raw_dir):
            logger.warning(f"Directory {self.raw_dir} does not exist. Creating it.")
            os.makedirs(self.raw_dir)
            return []

        all_chunks = []
        for filename in os.listdir(self.raw_dir):
            if filename.lower().endswith(('.pdf', '.txt')):
                filepath = os.path.join(self.raw_dir, filename)
                logger.info(f"Parsing document: {filename}")
                chunks = self.process_document(filepath)
                all_chunks.extend(chunks)
            else:
                logger.info(f"Skipping unsupported file type: {filename}")

        return all_chunks


# ==========================================
# CLASS: VectorDBManager
# ==========================================
class VectorDBManager:
    """
    Manages connections to ChromaDB, handles embedding instantiation, 
    and securely upserts chunked data.
    """
    def __init__(
        self, 
        db_path: str = "./data/chroma_db", 
        collection_name: str = "financial_documents"
    ):
        self.db_path = db_path
        os.makedirs(self.db_path, exist_ok=True)
        
        # Initialize persistent local ChromaDB
        self.client = chromadb.PersistentClient(path=self.db_path)
        
        # Use sentence-transformers via Chroma's native wrapper (saves API costs)
        self.embedding_function = SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            embedding_function=self.embedding_function,
            metadata={"hnsw:space": "cosine"} # Optimal for sentence-transformers
        )
        logger.info(f"Initialized ChromaDB collection: '{collection_name}' at '{self.db_path}'")

    def _generate_chunk_id(self, text: str, metadata: Dict[str, Any]) -> str:
        """
        Generates a deterministic unique ID based on the chunk content and metadata.
        """
        unique_string = f"{metadata['document_title']}_{metadata['page_number']}_{text}"
        return hashlib.md5(unique_string.encode('utf-8')).hexdigest()

    def upsert_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """
        Prepares lists of IDs, documents, and metadatas, then upserts to ChromaDB.
        """
        if not chunks:
            logger.warning("No chunks provided for ingestion.")
            return 0

        ids = []
        documents = []
        metadatas = []

        for chunk in chunks:
            text = chunk["text"]
            meta = chunk["metadata"]
            
            chunk_id = self._generate_chunk_id(text, meta)
            
            ids.append(chunk_id)
            documents.append(text)
            metadatas.append(meta)

        # Batch upsert to ChromaDB
        try:
            self.collection.upsert(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )
            logger.info(f"Successfully upserted {len(ids)} chunks to the vector database.")
            return len(ids)
        except Exception as e:
            logger.error(f"Failed to upsert chunks to vector database: {e}")
            return 0


# ==========================================
# MAIN EXECUTION FLOW (TEST)
# ==========================================
if __name__ == "__main__":
    # 1. Setup mock directories
    RAW_DIR = "./data/raw_documents"
    DB_DIR = "./data/chroma_db"
    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(DB_DIR, exist_ok=True)

    # 2. Generate a dummy financial PDF for testing using PyMuPDF
    dummy_pdf_path = os.path.join(RAW_DIR, "Tata_Motors_Q3_FY24_Earnings_Transcript.pdf")
    if not os.path.exists(dummy_pdf_path):
        logger.info("Generating a dummy PDF for testing...")
        doc = fitz.open()
        page = doc.new_page()
        dummy_text = (
            "Tata Motors Q3 FY24 Earnings Transcript\n\n"
            "Date: 2024-01-15\n\n"
            "Welcome to the Tata Motors Q3 FY24 Earnings Call.\n\n"
            "Financial Highlights:\n"
            "Revenue grew by 25% year-on-year.\n"
            "EBITDA margins expanded to 14.3%.\n\n"
            "Jaguar Land Rover (JLR) Performance:\n"
            "JLR delivered a strong performance with record free cash flow. "
            "Demand for Defender and Range Rover remains robust."
        )
        page.insert_text(fitz.Point(50, 50), dummy_text, fontsize=12)
        doc.save(dummy_pdf_path)
        doc.close()

    # 3. Initialize components
    logger.info("Starting Phase 1: Foundation & Data Ingestion")
    
    parser = FinancialDocumentParser(raw_dir=RAW_DIR, chunk_size=500, chunk_overlap=50)
    db_manager = VectorDBManager(db_path=DB_DIR)

    # 4. Execute parsing pipeline
    logger.info("--- Step A & B: Parsing and Metadata Enforcement ---")
    extracted_chunks = parser.ingest_directory()

    # 5. Execute vector DB ingestion pipeline
    logger.info("--- Step C: Vector Database Ingestion ---")
    if extracted_chunks:
        total_ingested = db_manager.upsert_chunks(extracted_chunks)
        
        # Verify ingestion
        collection_count = db_manager.collection.count()
        logger.info(f"Verification: There are now {collection_count} total documents in the ChromaDB collection.")
        logger.info("Phase 1 Pipeline execution completed successfully.")
    else:
        logger.warning("Pipeline executed but no chunks were extracted.")
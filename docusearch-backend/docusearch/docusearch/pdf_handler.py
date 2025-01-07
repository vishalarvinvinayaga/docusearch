import weaviate  # type: ignore
import os
import logging
from dotenv import load_dotenv  # type: ignore
import weaviate.classes.config as wvc  # type: ignore
from langchain_openai import OpenAIEmbeddings  # type: ignore
import weaviate #type:ignore
from langchain_weaviate.vectorstores import WeaviateVectorStore  # type: ignore
from PyPDF2 import PdfReader # type: ignore
from langchain.text_splitter import RecursiveCharacterTextSplitter # type: ignore

load_dotenv()

import logging
logging.basicConfig(
    level=logging.INFO,  # Set the level to INFO or DEBUG as needed
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()],  # This will log to the console
)
logger = logging.getLogger(__name__)

WEAVIATE_URL = os.getenv("WEAVIATE_URL")

def extract_text_from_pdf(file):
    """
    Extract text from a PDF file object.
    
    Args:
        file: The file object (InMemoryUploadedFile) received from the request in views.py.
    
    Returns:
        str: The extracted text from the PDF.
    """
    reader = PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""  # Use `or ""` to handle cases where text extraction fails
    logger.info(f"extracted texts {text}")
    
    return text

def chunk_text(text, chunk_size=1000, overlap=200):
    """Split text into smaller chunks based on token size."""
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=overlap)
    chunks = splitter.split_text(text)
    #logger.info(f" chunks {chunks}")
    return chunks

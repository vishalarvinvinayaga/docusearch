import openai #type: ignore
import os
from dotenv import load_dotenv  #type: ignore
import faiss #type: ignore
import numpy as np #type: ignore
import os
from typing import List
from langchain.prompts import PromptTemplate #type: ignore
from langchain.chains import LLMChain #type: ignore
from langchain.chat_models import ChatOpenAI #type: ignore
#from langchain.schema import Runnable #type: ignore



import logging
logging.basicConfig(
    level=logging.INFO,  # Set the level to INFO or DEBUG as needed
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()],  # This will log to the console
)
logger = logging.getLogger(__name__)

load_dotenv()
# Load OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

def openai_embedding_model(text: str):
    response = openai.Embedding.create(
        input=[text],
        model="text-embedding-ada-002"  # Specify the embedding model
    )
    return response["data"][0]["embedding"]

def create_faiss_index(chunks: List[str]):
    """
    Create a FAISS index with vector embeddings for the given text chunks using cosine similarity.

    Args:
        chunks (List[str]): A list of text chunks.

    Returns:
        faiss.IndexFlatIP: The FAISS index containing the embeddings.
        List[str]: The original chunks for mapping retrieved indices to text.
    """
    # Generate embeddings for all chunks
    embeddings = [openai_embedding_model(chunk) for chunk in chunks]

    # Normalize embeddings for cosine similarity
    normalized_embeddings = np.array(embeddings).astype('float32')
    faiss.normalize_L2(normalized_embeddings)

    # Convert to FAISS-compatible format
    dimension = normalized_embeddings.shape[1]  # Length of the embedding vector
    index = faiss.IndexFlatIP(dimension)  # Inner product-based index
    index.add(normalized_embeddings)  # Add normalized embeddings to the index

    return index, chunks


def retrieve_similar_chunks(query: str, index: faiss.IndexFlatIP, chunks: List[str], k: int = 1):
    # Generate embedding for the query

    logger.info(f"this is query: {query}")
    query_embedding = np.array(openai_embedding_model(query)).astype('float32').reshape(1, -1)

    # Normalize the query embedding for cosine similarity
    faiss.normalize_L2(query_embedding)

    # Perform similarity search
    distances, indices = index.search(query_embedding, k)

    # Retrieve the corresponding text chunks
    similar_chunks = [chunks[idx] for idx in indices[0]]

    return similar_chunks

def generate_response_with_langchain(query: str, context: str) -> str:
    try:
        # Initialize the language model
        llm = ChatOpenAI(
            model="gpt-3.5-turbo",  # Replace with "gpt-4" if needed
            temperature=0.7,
            max_tokens=300
        )
        logger.info(f"userquery : {query}")

        # Create a prompt template
        prompt = PromptTemplate(
            input_variables=["context", "query"],
            template="Use the following context to answer the query:\n\nContext:\n{context}\n\nQuery: {query}\n\nAnswer:",
        )

        # Generate the response by applying the prompt to the model
        formatted_prompt = prompt.format(context=context, query=query)
        response = llm.predict(formatted_prompt)
        logger.info(f"this is the response : {response}")
        return response
    except Exception as e:
        logger.error(f"Error generating response with LangChain: {e}")
        raise RuntimeError("Failed to generate response with LangChain.")

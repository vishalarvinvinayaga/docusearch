from django.http import JsonResponse #type:ignore
from rest_framework.decorators import api_view #type:ignore
from rest_framework.parsers import MultiPartParser #type:ignore
from docusearch.pdf_handler import extract_text_from_pdf, chunk_text #type:ignore
from docusearch.embedding_handler import create_faiss_index, retrieve_similar_chunks ,generate_response_with_langchain

import logging
logging.basicConfig(
    level=logging.INFO,  # Set the level to INFO or DEBUG as needed
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()],  # This will log to the console
)
logger = logging.getLogger(__name__)

faiss_index = None
faiss_chunks = []

@api_view(['POST'])
def upload_file(request):
    global faiss_index, faiss_chunks
    file = request.FILES.get('file')  # Get the file from the request
    logger.info(f"File Name : {file}")
    if not file:
        return JsonResponse({'error': 'No file uploaded'}, status=400)

    try:
        # Extract text from the uploaded PDF
        extracted_text = extract_text_from_pdf(file)
        text_chunk = chunk_text(extracted_text)
        faiss_index, faiss_chunks = create_faiss_index(text_chunk)
        return JsonResponse({'message': 'File uploaded successfully', 'num_chunks': len(text_chunk)})
    except Exception as e:
        logger.error(f"Error processing file: {e}")
        return JsonResponse({'error': 'Failed to process the file'}, status=500)
    

@api_view(['POST'])
def query_embedding(request):
    global faiss_index, faiss_chunks

    if faiss_index is None or not faiss_chunks:
        return JsonResponse({'error': 'No embeddings available. Please upload a file first.'}, status=400)

    query = request.data.get('query')  # Get the query from the frontend
    logger.info(f"this is query {query}")
    if not query:
        return JsonResponse({'error': 'No query provided'}, status=400)

    try:
        # Retrieve similar chunks based on the query
        similar_chunks = retrieve_similar_chunks(query, faiss_index, faiss_chunks)
        response = generate_response_with_langchain(query, similar_chunks)
        logger.info(f"views.py response: {response}")
        return JsonResponse({'response': response})
        #return JsonResponse({'response': similar_chunks})
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        return JsonResponse({'error': 'Failed to process the query'}, status=500)

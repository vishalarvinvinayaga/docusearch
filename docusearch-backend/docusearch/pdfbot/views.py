from django.http import JsonResponse #type:ignore
from rest_framework.decorators import api_view #type:ignore
from rest_framework.parsers import MultiPartParser #type:ignore
from docusearch.pdf_handler import extract_text_from_pdf, chunk_text, normalize_text #type:ignore
from docusearch.embedding_handler import create_faiss_index, retrieve_similar_chunks #generate_response_with_langchain
from django.http import StreamingHttpResponse #type:ignore
from docusearch.embedding_handler import retrieve_similar_chunks, generate_response_with_langchain

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
        #normalized_similar_chunk = normalize_text(similar_chunks[0])
        #logger.info(f"this is similar chunks: {normalized_similar_chunk}")
        return JsonResponse({'response': response})
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        return JsonResponse({'error': 'Failed to process the query'}, status=500)


# @api_view(['GET', 'POST'])
# def query_embedding(request):
#     global faiss_index, faiss_chunks

#     if faiss_index is None or not faiss_chunks:
#         return JsonResponse({'error': 'No embeddings available. Please upload a file first.'}, status=400)

#     # Handle GET and POST methods
#     if request.method == 'GET':
#         query = request.GET.get('query')  # Extract query from URL parameters
#     elif request.method == 'POST':
#         query = request.data.get('query')  # Extract query from request body
#     logger.info(f"this is query : {query}")
#     if not query:
#         return JsonResponse({'error': 'No query provided'}, status=400)

#     def stream_response():
#         try:
#             # Retrieve similar chunks
#             similar_chunks = retrieve_similar_chunks(query, faiss_index, faiss_chunks)
            
#             # Stream response using LangChain or OpenAI
#             for chunk in generate_response_with_langchain(query, similar_chunks):
#                 yield f"data: {chunk}\n\n"
#         except Exception as e:
#             yield f"data: Error: {str(e)}\n\n"

#     return StreamingHttpResponse(stream_response(), content_type="text/event-stream")

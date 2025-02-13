from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import openai
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise RuntimeError("OpenAI API key is not set. Please check your .env file.")

openai.api_key = api_key

# Define Pydantic model for request data
class UserResponse(BaseModel):
    user_answer: str
    correct_answer: str
    user_explanation: str
    ekg_attributes: str

# Define API endpoint
@app.post("/analyze-response")
async def analyze_response(user_response: UserResponse):
    try:
        prompt = (
            f"An EKG analysis has been conducted. The correct diagnosis based on the EKG attributes "
            f"is '{user_response.correct_answer}', characterized by: {user_response.ekg_attributes}.\n"
            f"The user diagnosed the EKG as '{user_response.user_answer}' and provided the following reasoning: {user_response.user_explanation}.\n\n"
            "Provide feedback comparing the user's diagnosis and reasoning against the correct EKG attributes. "
            "Explain why the user's diagnosis and reasoning are either correct or incorrect, "
            "highlighting any important EKG characteristics that they missed or misinterpreted. Generate this response as if you were a licensed physician speaking very succinctly to a student; do not call them user, address them personally."
        )

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.7
        )

        feedback = response['choices'][0]['message']['content']
        return JSONResponse(content={"feedback": feedback}, status_code=200)

    except openai.error.OpenAIError as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API Error: {str(e)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
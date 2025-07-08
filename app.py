from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this if your frontend runs elsewhere
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SERPAPI_URL = "https://serpapi.com/search"
SERPAPI_API_KEY = "<YOUR_SERPAPI_API_KEY>"

@app.get("/search")
def search(
    q: str = Query(..., description="Search query, e.g. 'hone 16 Pro, 128GB'"),
    location: str = Query("Austin, Texas, United States", description="Location for the search"),
    device: str = Query("desktop", description="Device type for the search"),
    country_code: str = Query("us", description="Country code for the search"),
):
    params = {
        "engine": "google",
        "q": q,
        "location": location,
        "google_domain": "google.com",
        "gl": country_code,
        "hl": "en",
        "device": device,
        "api_key": SERPAPI_API_KEY,
        "tbm": "shop",
    }
    try:
        with httpx.Client() as client:
            response = client.get(SERPAPI_URL, params=params)
            response.raise_for_status()
            return JSONResponse(content={"shopping_results": response.json().get("shopping_results")}   )
    except httpx.HTTPError as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

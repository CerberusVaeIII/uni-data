from fastapi import APIRouter, Request, Query
from fastapi.responses import JSONResponse
import pandas as pd
from app import config

router = APIRouter(
    prefix="/query",
    tags=["query"]
)

@router.get("/")
async def return_all_entries(request: Request):
    return config.render_template(request, "dashboard.html")


@router.get("/all")
async def return_all_entries_json():
    df = pd.read_csv(r'src\date_univ_cleaned.csv')
    return df.to_dict(orient='records')

@router.get("/dynamic")
async def dynamic_query(
    request: Request,
    x: str = Query(...),
    y: str = Query(...),
    highlight: str = Query(None)
):
    df = pd.read_csv(r'src\date_univ_cleaned.csv')

    query_params = dict(request.query_params)
    
    # Remove the explicitly handled parameters
    handled_params = {'x', 'y', 'highlight'}
    filters = {k: v for k, v in query_params.items() if k not in handled_params}

    # Apply filters dynamically
    for col, val in filters.items():
        if col in df.columns and val:
            df = df[df[col].astype(str).str.contains(val, case=False, na=False)]

    result = {
        "x": df[x].tolist(),
        "y": df[y].tolist(),
        "labels": df["Entitate"].tolist(),
        "highlight": highlight
    }
    return JSONResponse(content=result)

@router.get("/suggest")
async def suggest(q: str = Query("")):
    df = pd.read_csv(r'src\date_univ_cleaned.csv')
    values = df["Entitate"].dropna().unique().tolist()
    q = q.lower()
    matches = [v for v in values if q in v.lower()]
    return JSONResponse(matches[:10])  # return top 10
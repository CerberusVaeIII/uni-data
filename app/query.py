# REFACTOR MOST ROUTER PATHS

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
    highlight: str = Query(None),
    filterColumn: str = Query(None),
    filterValue: str = Query(None)
):
    df = pd.read_csv(r'src\date_univ_cleaned.csv')

    if filterColumn and filterValue and filterColumn in df.columns:
        df = df[df[filterColumn].astype(str).str.contains(filterValue, case=False, na=False)]

    result = {
        "x": df[x].tolist(),
        "y": df[y].tolist(),
        "labels": df["Entitate"].tolist(),
        "highlight": highlight,
        "x_name": x,
        "y_name": y
    }
    return JSONResponse(content=result)

# @router.get("/suggest")
# async def suggest(q: str = Query("")):
#     df = pd.read_csv(r'src\date_univ_cleaned.csv')
#     values = df["Entitate"].dropna().unique().tolist()
#     q = q.lower()
#     matches = [v for v in values if q in v.lower()]
#     return JSONResponse(matches[:10])  # return top 10

@router.get("/suggest/name")
async def suggest_name(q: str = Query("")):
    df = pd.read_csv(r'src\date_univ_cleaned.csv')
    values = df["Entitate"].dropna().unique().tolist()
    q = q.lower()
    matches = [v for v in values if q in v.lower()]
    return JSONResponse(matches[:10])

@router.get("/suggest/column")
async def suggest_column(q: str = Query("")):
    df = pd.read_csv(r'src\date_univ_cleaned.csv')
    # Return column names
    columns = df.columns.tolist()
    q = q.lower()
    matches = [c for c in columns if q in c.lower()]
    return JSONResponse(matches[:10])

@router.get("/suggest/region")
async def suggest_region(q: str = Query("")):
    df = pd.read_csv(r'src\date_univ_cleaned.csv')
    values = df["Reg_dezvoltare"].dropna().unique().tolist()
    q = q.lower()
    matches = [v for v in values if q in v.lower()]
    return JSONResponse(matches[:10])
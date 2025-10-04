# MATH ROUTER
# USEFULNESS TBD, QUERY ROUTER MAY BE SUFFICIENT

from fastapi import APIRouter

router = APIRouter(
    prefix="/math",
    tags=["math"]
)

@router.get("/")
async def PLACEHOLDER(**fields):
    pass
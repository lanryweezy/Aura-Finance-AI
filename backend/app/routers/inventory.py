from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas import InventoryItem, InventoryItemCreate, InventoryItemUpdate, StockAdjustRequest
from .. import db

router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.get("/", response_model=List[InventoryItem])
def list_items():
	return list(db.inventory_items)

@router.post("/", response_model=InventoryItem)
def create_item(payload: InventoryItemCreate):
	item = InventoryItem(id=f"inv_item_{int(__import__('time').time()*1000)}", **payload.model_dump())
	db.inventory_items.insert(0, item)
	return item

@router.put("/{item_id}", response_model=InventoryItem)
def update_item(item_id: str, payload: InventoryItemUpdate):
    for idx, it in enumerate(db.inventory_items):
        if it.id == item_id:
            # Preserve the original ID and merge updates
            updated_data = payload.model_dump(exclude_unset=True)
            updated_data['id'] = it.id  # Ensure ID is preserved
            updated = InventoryItem(**{**it.model_dump(), **updated_data})
            db.inventory_items[idx] = updated
            return updated
    raise HTTPException(status_code=404, detail="Inventory item not found")

@router.post("/{item_id}/stock-adjust", response_model=InventoryItem)
def adjust_stock(item_id: str, req: StockAdjustRequest):
	for it in db.inventory_items:
		if it.id == item_id:
			it.quantity += req.delta
			return it
	raise HTTPException(status_code=404, detail="Inventory item not found")
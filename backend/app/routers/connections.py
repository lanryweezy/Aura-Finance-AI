from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas import BankConnection, ConnectRequest
from .. import db

router = APIRouter(prefix="/connections", tags=["connections"])

@router.get("/", response_model=List[BankConnection])
def list_connections():
	return list(db.connections)

@router.post("/connect", response_model=BankConnection)
def connect(req: ConnectRequest):
	available_accounts = [
		{ 'bankName': 'GTBank', 'accountName': 'Aura Business Inc.', 'last4': '1234' },
		{ 'bankName': 'Kuda Bank', 'accountName': 'Aura Logistics', 'last4': '5678' },
		{ 'bankName': 'Zenith Bank', 'accountName': 'Aura Consulting', 'last4': '9012' },
		{ 'bankName': 'Access Bank', 'accountName': 'Tunde O.', 'last4': '3456' },
	]
	connected_bank_names = {c.bankName for c in db.connections}
	candidate = next((acc for acc in available_accounts if acc['bankName'] not in connected_bank_names), None)
	if not candidate:
		raise HTTPException(status_code=400, detail="All available mock accounts are already connected.")
	conn = BankConnection(
		id=f"conn_{int(__import__('time').time()*1000)}",
		provider=req.provider,
		bankName=candidate['bankName'],
		accountNumber=f"******{candidate['last4']}",
		accountName=candidate['accountName'],
		lastSynced=db._now_iso(),
	)
	db.connections.append(conn)
	return conn

@router.delete("/{connection_id}")
def unlink(connection_id: str):
	before = len(db.connections)
	db.connections = [c for c in db.connections if c.id != connection_id]
	if len(db.connections) == before:
		raise HTTPException(status_code=404, detail="Connection not found")
	return {"ok": True}

@router.post("/{connection_id}/sync", response_model=BankConnection)
def sync(connection_id: str):
	for idx, c in enumerate(db.connections):
		if c.id == connection_id:
			c.lastSynced = db._now_iso()
			return c
	raise HTTPException(status_code=404, detail="Connection not found")
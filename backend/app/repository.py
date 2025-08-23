import asyncio
import threading
from typing import List, Optional, Dict, Any, TypeVar, Generic
from datetime import datetime
import copy
import logging
from contextlib import asynccontextmanager

from .schemas import Employee, Bill, Invoice, InventoryItem, PurchaseOrder, Estimate, JournalEntry, Budget, Project
from . import db

T = TypeVar('T')

class ThreadSafeRepository(Generic[T]):
    """Thread-safe repository for managing collections with proper locking"""
    
    def __init__(self, initial_data: List[T], name: str):
        self._data: List[T] = copy.deepcopy(initial_data)
        self._lock = threading.RLock()  # Reentrant lock for nested operations
        self._name = name
        self._logger = logging.getLogger(f"repo.{name}")
    
    @asynccontextmanager
    async def _async_lock(self):
        """Async context manager for thread safety"""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self._lock.acquire)
        try:
            yield
        finally:
            self._lock.release()
    
    def _with_lock(self, func):
        """Decorator for synchronous operations"""
        def wrapper(*args, **kwargs):
            with self._lock:
                return func(*args, **kwargs)
        return wrapper
    
    async def get_all(self) -> List[T]:
        """Get all items (returns deep copy to prevent external mutations)"""
        async with self._async_lock():
            return copy.deepcopy(self._data)
    
    async def get_by_id(self, item_id: str) -> Optional[T]:
        """Get item by ID"""
        async with self._async_lock():
            for item in self._data:
                if hasattr(item, 'id') and item.id == item_id:
                    return copy.deepcopy(item)
            return None
    
    async def create(self, item: T) -> T:
        """Create new item"""
        async with self._async_lock():
            # Ensure unique ID
            if hasattr(item, 'id'):
                existing = next((x for x in self._data if x.id == item.id), None)
                if existing:
                    raise ValueError(f"Item with ID {item.id} already exists")
            
            new_item = copy.deepcopy(item)
            self._data.append(new_item)
            self._logger.info(f"Created {self._name} with ID: {getattr(new_item, 'id', 'unknown')}")
            return copy.deepcopy(new_item)
    
    async def update(self, item_id: str, updates: Dict[str, Any]) -> Optional[T]:
        """Update item by ID with partial data"""
        async with self._async_lock():
            for idx, item in enumerate(self._data):
                if hasattr(item, 'id') and item.id == item_id:
                    # Create updated item while preserving ID
                    item_data = item.model_dump() if hasattr(item, 'model_dump') else item.__dict__
                    updated_data = {**item_data, **updates}
                    updated_data['id'] = item_id  # Ensure ID is preserved
                    
                    # Create new instance of the same type
                    item_class = type(item)
                    updated_item = item_class(**updated_data)
                    
                    self._data[idx] = updated_item
                    self._logger.info(f"Updated {self._name} with ID: {item_id}")
                    return copy.deepcopy(updated_item)
            return None
    
    async def delete(self, item_id: str) -> bool:
        """Delete item by ID"""
        async with self._async_lock():
            for idx, item in enumerate(self._data):
                if hasattr(item, 'id') and item.id == item_id:
                    deleted_item = self._data.pop(idx)
                    self._logger.info(f"Deleted {self._name} with ID: {item_id}")
                    return True
            return False
    
    async def count(self) -> int:
        """Get total count"""
        async with self._async_lock():
            return len(self._data)
    
    async def filter(self, predicate) -> List[T]:
        """Filter items by predicate"""
        async with self._async_lock():
            filtered = [copy.deepcopy(item) for item in self._data if predicate(item)]
            return filtered
    
    async def update_bulk(self, updates: List[tuple[str, Dict[str, Any]]]) -> int:
        """Bulk update multiple items atomically"""
        async with self._async_lock():
            updated_count = 0
            for item_id, update_data in updates:
                for idx, item in enumerate(self._data):
                    if hasattr(item, 'id') and item.id == item_id:
                        item_data = item.model_dump() if hasattr(item, 'model_dump') else item.__dict__
                        updated_data = {**item_data, **update_data}
                        updated_data['id'] = item_id
                        
                        item_class = type(item)
                        updated_item = item_class(**updated_data)
                        self._data[idx] = updated_item
                        updated_count += 1
                        break
            
            self._logger.info(f"Bulk updated {updated_count} {self._name} items")
            return updated_count

class DataRepository:
    """Central repository managing all data collections with thread safety"""
    
    def __init__(self):
        self._logger = logging.getLogger("repository")
        self._logger.info("Initializing thread-safe data repository")
        
        # Initialize all repositories
        self.employees = ThreadSafeRepository(db.employees, "employees")
        self.bills = ThreadSafeRepository(db.bills, "bills")
        self.invoices = ThreadSafeRepository(db.invoices, "invoices")
        self.inventory_items = ThreadSafeRepository(db.inventory_items, "inventory")
        self.purchase_orders = ThreadSafeRepository(db.purchase_orders, "purchase_orders")
        self.estimates = ThreadSafeRepository(db.estimates, "estimates")
        self.journal_entries = ThreadSafeRepository(db.journal_entries, "journal_entries")
        self.budgets = ThreadSafeRepository(db.budgets, "budgets")
        self.projects = ThreadSafeRepository(db.projects, "projects")
    
    async def health_check(self) -> Dict[str, Any]:
        """Get repository health status"""
        try:
            counts = {
                "employees": await self.employees.count(),
                "bills": await self.bills.count(),
                "invoices": await self.invoices.count(),
                "inventory_items": await self.inventory_items.count(),
                "purchase_orders": await self.purchase_orders.count(),
                "estimates": await self.estimates.count(),
                "journal_entries": await self.journal_entries.count(),
                "budgets": await self.budgets.count(),
                "projects": await self.projects.count(),
            }
            
            return {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "data_counts": counts,
                "total_entities": sum(counts.values())
            }
        except Exception as e:
            self._logger.error(f"Repository health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

# Global repository instance (thread-safe)
repository = DataRepository()

# Utility functions for computed fields
def compute_bill_status(bill: Bill) -> str:
    """Compute bill status without mutating the original"""
    if bill.status == 'Paid':
        return 'Paid'
    
    try:
        due_date = datetime.fromisoformat(bill.dueDate.replace('Z', ''))
        return 'Overdue' if due_date < datetime.utcnow() else 'Unpaid'
    except (ValueError, AttributeError):
        return 'Unpaid'

def compute_invoice_status(invoice: Invoice) -> str:
    """Compute invoice status without mutating the original"""
    if invoice.status == 'Paid':
        return 'Paid'
    
    try:
        due_date = datetime.fromisoformat(invoice.dueDate.replace('Z', ''))
        return 'Overdue' if due_date < datetime.utcnow() else 'Unpaid'
    except (ValueError, AttributeError):
        return 'Unpaid'

# Migration utility (for future database integration)
async def migrate_to_database():
    """Placeholder for future database migration"""
    # This function would handle migrating from in-memory storage
    # to a proper database (PostgreSQL, MongoDB, etc.)
    pass
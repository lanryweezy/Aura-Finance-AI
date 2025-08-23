from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import os
import hmac
import hashlib
import json

router = APIRouter()

class PaystackWebhook(BaseModel):
    event: str
    data: dict

class SubscriptionData(BaseModel):
    user_id: str
    email: str
    plan: str
    status: str
    reference: str
    amount: int
    currency: str = "NGN"

class User(BaseModel):
    id: str
    email: str
    name: str
    plan: str
    business_name: str
    subscription_status: str
    trial_ends_at: Optional[str] = None

def verify_paystack_signature(payload: str, signature: str) -> bool:
    """Verify that the webhook came from Paystack"""
    secret = os.getenv("PAYSTACK_SECRET_KEY", "")
    if not secret:
        return False
    
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha512
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

@router.post("/webhooks/paystack")
async def handle_paystack_webhook(webhook: PaystackWebhook):
    """Handle Paystack payment webhooks"""
    try:
        if webhook.event == "charge.success":
            # Process successful payment
            payment_data = webhook.data
            
            # Extract user information from metadata
            metadata = payment_data.get("metadata", {})
            
            subscription = SubscriptionData(
                user_id=payment_data.get("reference"),
                email=payment_data.get("customer", {}).get("email"),
                plan=metadata.get("plan", "small-business"),
                status="active",
                reference=payment_data.get("reference"),
                amount=payment_data.get("amount", 0),
                currency=payment_data.get("currency", "NGN")
            )
            
            # Here you would typically save to database
            # For now, we'll just log it
            print(f"New subscription: {subscription}")
            
            return {"status": "success", "message": "Payment processed"}
        
        elif webhook.event == "subscription.disable":
            # Handle subscription cancellation
            subscription_data = webhook.data
            # Update subscription status to inactive
            print(f"Subscription cancelled: {subscription_data}")
            
            return {"status": "success", "message": "Subscription cancelled"}
        
        else:
            return {"status": "ignored", "message": f"Event {webhook.event} not handled"}
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/subscription/{user_id}")
async def get_user_subscription(user_id: str):
    """Get user subscription details"""
    # This would typically fetch from database
    # For now, return mock data
    return {
        "user_id": user_id,
        "plan": "small-business",
        "status": "active",
        "next_billing_date": "2024-02-01",
        "amount": 8500,
        "currency": "NGN"
    }

@router.post("/subscription/{user_id}/cancel")
async def cancel_subscription(user_id: str):
    """Cancel user subscription"""
    # This would typically update database and call Paystack API
    return {"status": "success", "message": "Subscription cancelled"}

@router.post("/subscription/{user_id}/upgrade")
async def upgrade_subscription(user_id: str, new_plan: str):
    """Upgrade user subscription"""
    # This would typically update database and call Paystack API
    return {"status": "success", "message": f"Subscription upgraded to {new_plan}"}

@router.get("/plans")
async def get_pricing_plans():
    """Get available pricing plans"""
    return {
        "plans": [
            {
                "id": "small-business",
                "name": "Small Business",
                "price": 8500,
                "currency": "NGN",
                "interval": "month",
                "features": [
                    "Up to 2 users",
                    "Basic invoicing & receipts",
                    "Expense tracking",
                    "VAT compliance (7.5%)",
                    "Basic financial reports",
                    "Email support"
                ]
            },
            {
                "id": "sme-pro",
                "name": "SME Pro",
                "price": 18000,
                "currency": "NGN",
                "interval": "month",
                "features": [
                    "Up to 5 users",
                    "Everything in Small Business",
                    "Advanced financial reporting",
                    "Payroll management (PAYE)",
                    "Multi-currency support",
                    "Priority support"
                ]
            },
            {
                "id": "enterprise",
                "name": "Enterprise",
                "price": None,
                "currency": "NGN",
                "interval": "custom",
                "features": [
                    "Unlimited users",
                    "Everything in SME Pro",
                    "Dedicated account manager",
                    "Custom integrations",
                    "SLA guarantee"
                ]
            }
        ]
    }

@router.post("/contact-sales")
async def submit_contact_sales(contact_data: dict):
    """Handle enterprise contact sales form"""
    # This would typically save to database and trigger sales team notification
    print(f"Enterprise inquiry: {contact_data}")
    
    # Here you could integrate with:
    # - CRM system (HubSpot, Salesforce)
    # - Email service (SendGrid, Mailgun)
    # - Slack/Teams notification
    
    return {"status": "success", "message": "Sales team will contact you within 24 hours"}
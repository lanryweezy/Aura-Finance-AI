from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import json
import logging
from datetime import datetime

# Import the Google GenAI SDK on the server side only
try:
    from google.generativeai import GoogleGenerativeAI
except ImportError:
    GoogleGenerativeAI = None

router = APIRouter()

# Server-side AI client initialization
def get_ai_client():
    """Securely initialize AI client on server side only"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    
    if GoogleGenerativeAI is None:
        logging.error("Google GenAI SDK not available")
        return None
    
    try:
        return GoogleGenerativeAI(api_key=api_key)
    except Exception as e:
        logging.error(f"Failed to initialize AI client: {e}")
        return None

# Request/Response models
class TransactionCategorizationRequest(BaseModel):
    transaction: Dict[str, Any]
    historical_data: Optional[List[Dict[str, Any]]] = []
    user_preferences: Optional[Dict[str, Any]] = {}

class AIAnalysisRequest(BaseModel):
    data: Dict[str, Any]
    analysis_type: str
    context: Optional[Dict[str, Any]] = {}

class AIResponse(BaseModel):
    success: bool
    result: Dict[str, Any]
    confidence: float
    reasoning: str
    error_message: Optional[str] = None

def safe_json_parse(text: str, fallback: Dict[str, Any]) -> Dict[str, Any]:
    """Safely parse AI response JSON with fallback"""
    if not text:
        return fallback
    
    try:
        # Clean up common AI response issues
        cleaned_text = text.strip()
        if cleaned_text.startswith('```json'):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.endswith('```'):
            cleaned_text = cleaned_text[:-3]
        cleaned_text = cleaned_text.strip()
        
        return json.loads(cleaned_text)
    except json.JSONDecodeError as e:
        logging.warning(f"Failed to parse AI JSON response: {e}. Text: {text[:200]}...")
        return fallback

@router.post("/categorize-transaction", response_model=AIResponse)
async def categorize_transaction(request: TransactionCategorizationRequest):
    """Securely categorize transactions using AI on the backend"""
    
    client = get_ai_client()
    if not client:
        return AIResponse(
            success=False,
            result={"category": "Uncategorized", "subcategory": "Unknown"},
            confidence=0.0,
            reasoning="AI service unavailable - API key missing or invalid",
            error_message="AI_SERVICE_UNAVAILABLE"
        )
    
    try:
        # Build secure prompt (no sensitive data logged)
        transaction = request.transaction
        historical_patterns = request.historical_data[:10] if request.historical_data else []  # Limit data
        
        prompt = f"""
        Analyze this Nigerian business transaction and categorize it appropriately.
        
        TRANSACTION:
        - Description: {transaction.get('description', 'N/A')}
        - Amount: ₦{transaction.get('amount', 0):,.2f}
        - Type: {transaction.get('type', 'N/A')}
        - Date: {transaction.get('date', 'N/A')}
        
        HISTORICAL CONTEXT:
        Based on {len(historical_patterns)} similar transactions from this business.
        
        CATEGORIZATION RULES:
        - Use Nigerian business context (VAT, PAYE, local suppliers, etc.)
        - Categories: Office Expenses, Utilities, Professional Services, Marketing, Travel, Equipment, Inventory, Taxes, Salaries, etc.
        - Consider common Nigerian payment patterns (bank transfers, POS, etc.)
        
        REQUIRED JSON OUTPUT FORMAT:
        {{
            "category": "Primary category name",
            "subcategory": "Specific subcategory",
            "confidence": 0.85,
            "reasoning": "Brief explanation of categorization logic",
            "tax_implications": "VAT/WHT considerations if applicable",
            "suggested_tags": ["tag1", "tag2"]
        }}
        """
        
        # Make secure AI call
        response = await client.models.generate_content({
            "model": "gemini-2.0-flash",
            "contents": [{"parts": [{"text": prompt}]}],
            "generation_config": {
                "response_mime_type": "application/json",
                "temperature": 0.3,
                "max_output_tokens": 1000
            }
        })
        
        # Safely extract and parse response
        response_text = ""
        if hasattr(response, 'text'):
            response_text = response.text
        elif hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, 'content') and candidate.content.parts:
                response_text = candidate.content.parts[0].text
        
        # Parse with fallback
        fallback_result = {
            "category": "Uncategorized",
            "subcategory": "Unknown",
            "confidence": 0.1,
            "reasoning": "AI parsing failed - using fallback categorization",
            "tax_implications": "Review manually",
            "suggested_tags": ["needs-review"]
        }
        
        result = safe_json_parse(response_text, fallback_result)
        
        # Store learning data securely (in production, use proper database)
        await store_ai_learning_data({
            "transaction_hash": hash(str(transaction)),  # Don't store raw transaction
            "category_result": result,
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": "anonymous"  # Replace with actual user ID from auth
        })
        
        return AIResponse(
            success=True,
            result=result,
            confidence=result.get("confidence", 0.5),
            reasoning=result.get("reasoning", "AI categorization completed")
        )
        
    except Exception as e:
        logging.error(f"AI categorization failed: {e}")
        return AIResponse(
            success=False,
            result={"category": "Uncategorized", "subcategory": "Error"},
            confidence=0.0,
            reasoning=f"Processing error: {str(e)[:100]}",
            error_message="AI_PROCESSING_ERROR"
        )

@router.post("/financial-analysis", response_model=AIResponse)
async def analyze_financial_data(request: AIAnalysisRequest):
    """Perform financial analysis using AI (cash flow, trends, etc.)"""
    
    client = get_ai_client()
    if not client:
        return AIResponse(
            success=False,
            result={"analysis": "unavailable"},
            confidence=0.0,
            reasoning="AI service unavailable",
            error_message="AI_SERVICE_UNAVAILABLE"
        )
    
    try:
        analysis_type = request.analysis_type
        data_summary = {
            "total_transactions": len(request.data.get("transactions", [])),
            "date_range": request.data.get("date_range", "unknown"),
            "revenue_total": request.data.get("revenue_total", 0),
            "expense_total": request.data.get("expense_total", 0)
        }
        
        prompt = f"""
        Perform {analysis_type} analysis for a Nigerian business.
        
        DATA SUMMARY:
        {json.dumps(data_summary, indent=2)}
        
        ANALYSIS REQUIREMENTS:
        - Focus on Nigerian business context (seasonality, local market conditions)
        - Consider regulatory requirements (FIRS, VAT compliance)
        - Provide actionable insights for business growth
        - Include cash flow optimization suggestions
        
        OUTPUT FORMAT (JSON):
        {{
            "summary": "Key findings summary",
            "insights": ["insight1", "insight2", "insight3"],
            "recommendations": ["action1", "action2"],
            "risk_factors": ["risk1", "risk2"],
            "opportunities": ["opportunity1", "opportunity2"],
            "confidence": 0.85
        }}
        """
        
        response = await client.models.generate_content({
            "model": "gemini-2.0-flash",
            "contents": [{"parts": [{"text": prompt}]}],
            "generation_config": {
                "response_mime_type": "application/json",
                "temperature": 0.4,
                "max_output_tokens": 2000
            }
        })
        
        response_text = getattr(response, 'text', '')
        if not response_text and hasattr(response, 'candidates'):
            response_text = response.candidates[0].content.parts[0].text if response.candidates else ''
        
        fallback_result = {
            "summary": "Analysis could not be completed",
            "insights": ["AI service temporarily unavailable"],
            "recommendations": ["Review data manually"],
            "risk_factors": ["Technical issues"],
            "opportunities": ["Retry analysis later"],
            "confidence": 0.1
        }
        
        result = safe_json_parse(response_text, fallback_result)
        
        return AIResponse(
            success=True,
            result=result,
            confidence=result.get("confidence", 0.5),
            reasoning="Financial analysis completed successfully"
        )
        
    except Exception as e:
        logging.error(f"Financial analysis failed: {e}")
        return AIResponse(
            success=False,
            result={"analysis": "error"},
            confidence=0.0,
            reasoning=f"Analysis error: {str(e)[:100]}",
            error_message="ANALYSIS_ERROR"
        )

async def store_ai_learning_data(data: Dict[str, Any]):
    """Store AI learning data securely (implement proper database storage)"""
    # In production, store in encrypted database
    # For now, just log securely without sensitive data
    logging.info(f"AI learning data stored: category={data.get('category_result', {}).get('category', 'unknown')}")

@router.get("/health")
async def ai_service_health():
    """Check AI service health"""
    client = get_ai_client()
    return {
        "ai_available": client is not None,
        "api_key_configured": bool(os.getenv("GEMINI_API_KEY")),
        "timestamp": datetime.utcnow().isoformat()
    }
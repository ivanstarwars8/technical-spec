import uuid
import hmac
import hashlib
from typing import Optional, Dict, Any
import httpx
from ..config import settings


def create_payment(
    amount: float,
    description: str,
    return_url: str,
    user_email: str
) -> Dict[str, Any]:
    """
    Create payment via YooKassa API

    Args:
        amount: Payment amount in rubles
        description: Payment description
        return_url: URL to redirect after payment
        user_email: User email for receipt

    Returns:
        Dict with payment data including confirmation URL

    Raises:
        ValueError: If YooKassa credentials are not configured or payment creation fails
    """
    if not settings.YUKASSA_SHOP_ID or not settings.YUKASSA_SECRET_KEY:
        raise ValueError("YooKassa credentials are not configured")

    idempotence_key = str(uuid.uuid4())

    payload = {
        "amount": {
            "value": f"{amount:.2f}",
            "currency": "RUB"
        },
        "confirmation": {
            "type": "redirect",
            "return_url": return_url
        },
        "capture": True,
        "description": description,
        "receipt": {
            "customer": {
                "email": user_email
            },
            "items": [
                {
                    "description": description,
                    "quantity": "1.00",
                    "amount": {
                        "value": f"{amount:.2f}",
                        "currency": "RUB"
                    },
                    "vat_code": 1
                }
            ]
        }
    }

    headers = {
        "Idempotence-Key": idempotence_key,
        "Content-Type": "application/json"
    }

    try:
        with httpx.Client() as client:
            response = client.post(
                "https://api.yookassa.ru/v3/payments",
                json=payload,
                headers=headers,
                auth=(settings.YUKASSA_SHOP_ID, settings.YUKASSA_SECRET_KEY)
            )
            response.raise_for_status()
            return response.json()

    except Exception as e:
        raise ValueError(f"Failed to create payment: {str(e)}")


def verify_payment(payment_id: str) -> Dict[str, Any]:
    """
    Verify payment status via YooKassa API

    Args:
        payment_id: YooKassa payment ID

    Returns:
        Dict with payment status

    Raises:
        ValueError: If YooKassa credentials are not configured or verification fails
    """
    if not settings.YUKASSA_SHOP_ID or not settings.YUKASSA_SECRET_KEY:
        raise ValueError("YooKassa credentials are not configured")

    try:
        with httpx.Client() as client:
            response = client.get(
                f"https://api.yookassa.ru/v3/payments/{payment_id}",
                auth=(settings.YUKASSA_SHOP_ID, settings.YUKASSA_SECRET_KEY)
            )
            response.raise_for_status()
            return response.json()

    except Exception as e:
        raise ValueError(f"Failed to verify payment: {str(e)}")


def verify_webhook_signature(payload: str, signature: str) -> bool:
    """
    Verify webhook signature from YooKassa

    Args:
        payload: Raw request body
        signature: Signature from HTTP header

    Returns:
        True if signature is valid
    """
    if not settings.YUKASSA_SECRET_KEY:
        return False

    expected_signature = hmac.new(
        settings.YUKASSA_SECRET_KEY.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected_signature, signature)

from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models.user import User, SubscriptionTier
from ..utils.security import get_current_user
from ..services.yukassa import create_payment, verify_payment
from ..config import settings

router = APIRouter(prefix="/api/subscription", tags=["subscription"])


SUBSCRIPTION_PRICES = {
    SubscriptionTier.BASIC: 990.00,
    SubscriptionTier.PREMIUM: 1990.00
}

SUBSCRIPTION_CREDITS = {
    SubscriptionTier.FREE: 10,
    SubscriptionTier.BASIC: 100,
    SubscriptionTier.PREMIUM: 1000
}


@router.get("/")
def get_current_subscription(
    current_user: User = Depends(get_current_user)
):
    """Get current subscription tier and credits"""
    return {
        "subscription_tier": current_user.subscription_tier,
        "ai_credits_left": current_user.ai_credits_left,
        "prices": SUBSCRIPTION_PRICES
    }


@router.post("/upgrade")
def upgrade_subscription(
    tier: SubscriptionTier,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create payment for subscription upgrade"""
    if not settings.BILLING_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Оплата через ЮKassa отключена. Укажите YUKASSA_SHOP_ID и YUKASSA_SECRET_KEY в .env",
        )

    if tier == SubscriptionTier.FREE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot upgrade to free tier"
        )

    if tier not in SUBSCRIPTION_PRICES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid subscription tier"
        )

    # Check if already on this tier or higher
    tier_order = {
        SubscriptionTier.FREE: 0,
        SubscriptionTier.BASIC: 1,
        SubscriptionTier.PREMIUM: 2
    }

    if tier_order[current_user.subscription_tier] >= tier_order[tier]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already subscribed to this tier or higher"
        )

    try:
        amount = SUBSCRIPTION_PRICES[tier]
        tier_name = {
            SubscriptionTier.BASIC: "Базовая",
            SubscriptionTier.PREMIUM: "Премиум"
        }[tier]

        payment_data = create_payment(
            amount=amount,
            description=f"Подписка TutorAI CRM - {tier_name}",
            return_url=f"{settings.FRONTEND_URL}/subscription/success",
            user_email=current_user.email
        )

        # Store tier info in metadata for webhook processing
        payment_data["metadata"] = {
            "user_id": str(current_user.id),
            "tier": tier.value
        }

        return {
            "payment_id": payment_data["id"],
            "confirmation_url": payment_data["confirmation"]["confirmation_url"],
            "amount": amount
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/webhook")
async def yukassa_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle YooKassa webhook for payment confirmation"""
    if not settings.BILLING_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ЮKassa отключена. Включите YUKASSA_SHOP_ID и YUKASSA_SECRET_KEY",
        )

    payload = await request.json()

    event_type = payload.get("event")
    payment_object = payload.get("object")

    if event_type == "payment.succeeded" and payment_object:
        payment_id = payment_object.get("id")

        # Verify payment
        try:
            payment_info = verify_payment(payment_id)

            if payment_info.get("status") == "succeeded":
                # Extract metadata
                metadata = payment_info.get("metadata", {})
                user_id = metadata.get("user_id")
                tier = metadata.get("tier")

                if user_id and tier:
                    user = db.query(User).filter(User.id == user_id).first()

                    if user:
                        # Upgrade subscription
                        user.subscription_tier = SubscriptionTier(tier)
                        user.ai_credits_left = SUBSCRIPTION_CREDITS[SubscriptionTier(tier)]

                        db.commit()

                        return {"status": "ok"}

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

    return {"status": "ok"}

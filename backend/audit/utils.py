import logging
from .models import AuditLog

logger = logging.getLogger(__name__)


def create_audit_log(
    action: str,
    actor,
    description: str,
    patient=None,
    record=None,
    nin_authorized: bool = False,
) -> AuditLog:
    # Create an immutable record
    actor_type = getattr(actor, 'user_type', 'ADMIN')

    entry = AuditLog.objects.create(
        action=action,
        actor=actor,
        actor_type=actor_type,
        patient=patient,
        record=record,
        description=description,
        nin_authorized=nin_authorized,
    )
    logger.info(
        'AuditLog created: action=%s | actor=%s | patient=%s | record=%s',
        action,
        actor,
        patient,
        record,
    )
    return entry

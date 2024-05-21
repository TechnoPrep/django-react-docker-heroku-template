from django.db import models
import uuid
from django.utils import timezone
from users.models import User


class Contract(models.Model):
    uid = models.UUIDField(unique=True, default=uuid.uuid4, null=False, blank=False)
    created_by = models.ForeignKey(
        User,
        null=False,
        blank=False,
        to_field="uid",
        on_delete=models.CASCADE,
        related_name="contracts",
    )
    title = models.CharField(
        max_length=255,
        null=False,
        blank=False,
    )
    contract = models.TextField(
        null=False,
        blank=False,
    )
    code = models.TextField(
        null=False,
        blank=False,
    )

    deploy_address = models.CharField(
        max_length=255,
        null=False,
        blank=False,
    )

    from_address = models.CharField(
        max_length=255,
        null=False,
        blank=False,
    )

    tx_hash = models.CharField(
        max_length=255,
        null=False,
        blank=False,
    )

    block_number = models.CharField(
        max_length=255,
        null=False,
        blank=False,
    )

    block_hash = models.CharField(
        max_length=255,
        null=False,
        blank=False,
    )

    gas_used = models.CharField(
        max_length=255,
        null=False,
        blank=False,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        while True:
            try:
                super().save(*args, **kwargs)
                break
            except Exception as e:
                # check if it includes duplicate key error (uid)
                if (
                    "duplicate key value violates unique constraint" in str(e)
                    and "Key (uid)" in str(e)
                    and "already exists" in str(e)
                ):
                    self.uid = uuid.uuid4()
                else:
                    raise e

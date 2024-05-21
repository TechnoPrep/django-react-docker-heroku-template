from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
import uuid


class User(AbstractUser):
    uid = models.UUIDField(unique=True, default=uuid.uuid4, null=False, blank=False)
    email = models.EmailField(unique=True, blank=False, null=False)
    fullname = models.CharField(max_length=100, null=True)
    groups = models.ManyToManyField(Group, related_name='custom_user_set')  # Add related_name
    user_permissions = models.ManyToManyField(Permission, related_name='custom_user_set_permissions')  # Add related_name

    def save(self, *args, **kwargs):
        self.set_password(self.password)
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

    def __str__(self) -> str:
        return str(self.uid)

from rest_framework import serializers
from .models import Contract


class ContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = [
            "uid",
            "title",
            "contract",
            "code",
            "created_by",
            "created_at",
            "deploy_address",
            "from_address",
            "tx_hash",
            "block_number",
            "block_hash",
            "gas_used",
        ]
        extra_kwargs = {
            "title": {"required": True},
            "contract": {"required": True},
            "code": {"required": True},
            "deploy_address": {"required": False},
        }

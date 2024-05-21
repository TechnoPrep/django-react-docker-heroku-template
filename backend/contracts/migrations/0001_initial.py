# Generated by Django 3.2.25 on 2024-05-20 20:45

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Contract',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uid', models.UUIDField(default=uuid.uuid4, unique=True)),
                ('title', models.CharField(max_length=255)),
                ('contract', models.TextField()),
                ('code', models.TextField()),
                ('deploy_address', models.CharField(max_length=255)),
                ('from_address', models.CharField(max_length=255)),
                ('tx_hash', models.CharField(max_length=255)),
                ('block_number', models.CharField(max_length=255)),
                ('block_hash', models.CharField(max_length=255)),
                ('gas_used', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
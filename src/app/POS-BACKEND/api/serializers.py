from rest_framework import serializers

from .models import AppSetting, ApprovalRequest, Branch, OfflineSyncLog, SupplierOrderInvoice, Terminal


class AppSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppSetting
        fields = '__all__'


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'


class TerminalSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)

    class Meta:
        model = Terminal
        fields = '__all__'


class ApprovalRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalRequest
        fields = '__all__'


class OfflineSyncLogSerializer(serializers.ModelSerializer):
    terminal_name = serializers.CharField(source='terminal.name', read_only=True)

    class Meta:
        model = OfflineSyncLog
        fields = '__all__'


class SupplierOrderInvoiceSerializer(serializers.ModelSerializer):
    supplier_id = serializers.IntegerField(source='supplier.id', read_only=True)

    class Meta:
        model = SupplierOrderInvoice
        fields = '__all__'

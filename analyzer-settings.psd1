@{
    # فقط ruleهایی که Explicitly می‌خوایم enforce بشن
    IncludeRules = @(
        'PSAvoidAssignmentToAutomaticVariable',
        'PSAvoidUsingCmdletAliases',
        'PSUseApprovedVerbs'
    )

    # Severityهایی که بررسی می‌شن
    Severity = @(
        'Error',
        'Warning',
        'Information'
    )

    # Rule-specific configuration (در صورت نیاز قابل توسعه)
    Rules = @{
        PSAvoidUsingCmdletAliases = @{
            # اگر روزی لازم شد aliasهای مجاز تعریف کنی:
            # Whitelist = @('cd')
        }

        PSUseApprovedVerbs = @{
            # پیش‌فرض مناسب است؛ اینجا عمداً خالی نگه داشته شده
        }
    }

    # ExcludeRule را خالی نگه می‌داریم تا چیزی بی‌صدا bypass نشود
    ExcludeRules = @()
}

#Requires -Version 5.1
[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('ErrorWarning', 'ErrorOnly')]
    [string]$GateMode = 'ErrorWarning',

    [Parameter(Mandatory = $false)]
    [string]$ProjectRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Resolve-ScriptRoot {
    [CmdletBinding()]
    [OutputType([string])]
    param()

    if ($script:PSScriptRoot -and -not [string]::IsNullOrWhiteSpace($script:PSScriptRoot)) {
        return $script:PSScriptRoot
    }

    if ($MyInvocation -and $MyInvocation.MyCommand -and $MyInvocation.MyCommand.Path) {
        return (Split-Path -Parent $MyInvocation.MyCommand.Path)
    }

    return (Get-Location).Path
}

function Write-Info {
    [CmdletBinding()]
    [OutputType([void])]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    Write-Host ("[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message)
}

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
    $ProjectRoot = Resolve-ScriptRoot
}

Set-Location -LiteralPath $ProjectRoot
Write-Info -Message ("Running static analysis in: {0}" -f $ProjectRoot)

$analyzerModule = Get-Module -ListAvailable -Name PSScriptAnalyzer |
    Sort-Object -Property Version -Descending |
    Select-Object -First 1

if (-not $analyzerModule) {
    throw "PSScriptAnalyzer is not installed. Install-Module PSScriptAnalyzer -Scope CurrentUser"
}

Write-Info -Message ("Using PSScriptAnalyzer {0} ({1})" -f $analyzerModule.Version, $analyzerModule.Path)
Import-Module -Name PSScriptAnalyzer -ErrorAction Stop

$files = @(
    Get-ChildItem -Path $ProjectRoot -Filter '*.ps1' -File -Recurse |
    Where-Object { $_.FullName -notmatch '\\node_modules\\|\\.git\\|\\dist\\|\\build\\' } |
    Select-Object -ExpandProperty FullName
)

if ($files.Count -eq 0) {
    Write-Info -Message "No PowerShell scripts found."
    Write-Host ("ANALYZE PASSED (GateMode={0})" -f $GateMode)
    exit 0
}

Write-Info -Message ("Discovered {0} script(s): {1}" -f $files.Count, (($files | ForEach-Object { Split-Path -Leaf $_ } | Sort-Object) -join ', '))

# Rules to enforce
$allowedRules = @(
    'PSUseApprovedVerbs',
    'PSUseSingularNouns',
    'PSUseOutputTypeCorrectly'
)

# Severities to keep
$allowedSeverities = @('Error', 'Warning', 'Information')

$allIssues = @()

foreach ($file in $files) {
    try {
        $result = @(Invoke-ScriptAnalyzer -Path $file -ErrorAction Stop)

        if ($result.Count -gt 0) {
            $filtered = @(
                $result | Where-Object {
                    ($allowedRules -contains $_.RuleName) -and
                    ($allowedSeverities -contains [string]$_.Severity)
                }
            )

            if ($filtered.Count -gt 0) {
                $allIssues += $filtered
            }
        }
    }
    catch {
        throw ("Invoke-ScriptAnalyzer failed for '{0}': {1}" -f $file, $_.Exception.Message)
    }
}

$errCount  = @($allIssues | Where-Object { [string]$_.Severity -eq 'Error' }).Count
$warnCount = @($allIssues | Where-Object { [string]$_.Severity -eq 'Warning' }).Count
$infoCount = @($allIssues | Where-Object { [string]$_.Severity -eq 'Information' }).Count
$total     = @($allIssues).Count

Write-Host ("Issues found: Total={0} | Error={1} | Warning={2} | Info={3}" -f $total, $errCount, $warnCount, $infoCount)

if ($total -gt 0) {
    $allIssues |
        Sort-Object -Property Severity, RuleName, ScriptName, Line |
        Format-Table -Property Severity, RuleName, ScriptName, Line, Message -AutoSize
}

$failed = $false
switch ($GateMode) {
    'ErrorOnly' {
        if ($errCount -gt 0) { $failed = $true }
    }
    'ErrorWarning' {
        if (($errCount + $warnCount) -gt 0) { $failed = $true }
    }
    default {
        throw ("Unsupported GateMode: {0}" -f $GateMode)
    }
}

if ($failed) {
    Write-Error -Message ("ANALYZE FAILED (GateMode={0})" -f $GateMode)
    exit 1
}

Write-Host ("ANALYZE PASSED (GateMode={0})" -f $GateMode)
exit 0

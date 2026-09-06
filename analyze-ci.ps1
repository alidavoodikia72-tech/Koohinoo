#Requires -Version 5.1
[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 65535)]
    [int]$Port = 3000,

    [Parameter(Mandatory = $false)]
    [ValidateRange(5, 600)]
    [int]$HealthTimeoutSec = 60,

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$HealthPath = '/api/health',

    [Parameter(Mandatory = $false)]
    [switch]$SkipInstall,

    [Parameter(Mandatory = $false)]
    [switch]$ForceFreePort,

    # ---- Contract policy ----
    [Parameter(Mandatory = $false)]
    [switch]$RequireVersion,   # when ON, health JSON must include non-empty "version"

    # ---- Audit policy ----
    [Parameter(Mandatory = $false)]
    [ValidateSet('off','report','enforce')]
    [string]$AuditMode = 'report',

    [Parameter(Mandatory = $false)]
    [ValidateSet('low','moderate','high','critical')]
    [string]$AuditFailLevel = 'critical',

    [Parameter(Mandatory = $false)]
    [ValidateRange(0, 9999)]
    [int]$AuditMaxAllowed = 0,   # allowed count at/above fail level in enforce mode

    # ---- CI execution policy ----
    [Parameter(Mandatory = $false)]
    [ValidateRange(30, 3600)]
    [int]$CiTimeoutSec = 900
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:CiStart = Get-Date

function Write-Log {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)][string]$Message)
    $ts = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    Write-Host ("[{0}] {1}" -f $ts, $Message)
}

function Assert-CiTimeout {
    [CmdletBinding()]
    param()
    $elapsed = (New-TimeSpan -Start $script:CiStart -End (Get-Date)).TotalSeconds
    if ($elapsed -gt $CiTimeoutSec) {
        throw ("CI timeout exceeded. Elapsed={0:N0}s, Limit={1}s" -f $elapsed, $CiTimeoutSec)
    }
}

function Invoke-Step {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][string]$Title,
        [Parameter(Mandatory = $true)][scriptblock]$Action
    )

    Assert-CiTimeout
    Write-Log ("=== {0} ===" -f $Title)
    & $Action
    Assert-CiTimeout
    Write-Log ("=== {0} completed ===" -f $Title)
}

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

function Get-SeverityCountAtOrAbove {
    [CmdletBinding()]
    [OutputType([int])]
    param(
        [Parameter(Mandatory = $true)][psobject]$AuditJson,
        [Parameter(Mandatory = $true)][string]$Threshold
    )

    $order = @{ low = 1; moderate = 2; high = 3; critical = 4 }
    $min = $order[$Threshold]

    $vuln = $AuditJson.metadata.vulnerabilities
    if (-not $vuln) { return 0 }

    $sum = 0
    foreach ($name in @('low','moderate','high','critical')) {
        $count = 0
        if ($vuln.PSObject.Properties.Name -contains $name) {
            $count = [int]$vuln.$name
        }
        if ($order[$name] -ge $min) {
            $sum += $count
        }
    }
    return $sum
}

function Invoke-NpmAuditPolicy {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)][string]$RepoRoot)

    if ($AuditMode -eq 'off') {
        Write-Log "Audit policy: OFF (skipped)."
        return
    }

    Write-Log ("Audit policy: Mode={0}, FailLevel>={1}, MaxAllowed={2}" -f $AuditMode, $AuditFailLevel, $AuditMaxAllowed)

    Push-Location $RepoRoot
    try {
        # npm audit --json may return non-zero even when only vulnerabilities exist
        $auditRaw = & npm audit --json 2>$null
        $auditExit = $LASTEXITCODE

        if (-not $auditRaw) {
            Write-Warning "npm audit returned empty output."
            if ($AuditMode -eq 'enforce') {
                throw "Audit enforce mode: cannot evaluate empty npm audit output."
            }
            return
        }

        $audit = $null
        try {
            $audit = $auditRaw | ConvertFrom-Json
        }
        catch {
            Write-Warning ("Failed to parse npm audit JSON. ExitCode={0}" -f $auditExit)
            if ($AuditMode -eq 'enforce') {
                throw "Audit enforce mode: npm audit JSON parsing failed."
            }
            return
        }

        $atOrAbove = Get-SeverityCountAtOrAbove -AuditJson $audit -Threshold $AuditFailLevel
        Write-Log ("Audit vulnerabilities at/above '{0}': {1}" -f $AuditFailLevel, $atOrAbove)

        if ($AuditMode -eq 'enforce' -and $atOrAbove -gt $AuditMaxAllowed) {
            throw ("Audit policy failed: vulnerabilities at/above {0} = {1}, allowed = {2}" -f $AuditFailLevel, $atOrAbove, $AuditMaxAllowed)
        }

        if ($AuditMode -eq 'report' -and $atOrAbove -gt $AuditMaxAllowed) {
            Write-Warning ("Audit report: vulnerabilities at/above {0} = {1} (allowed baseline {2})" -f $AuditFailLevel, $atOrAbove, $AuditMaxAllowed)
        }
    }
    finally {
        Pop-Location
    }
}

$root = Resolve-ScriptRoot
$analyzePath = Join-Path -Path $root -ChildPath 'analyze.ps1'
$restartPath = Join-Path -Path $root -ChildPath 'restart.ps1'

if (-not (Test-Path -LiteralPath $analyzePath)) { throw ("Missing file: {0}" -f $analyzePath) }
if (-not (Test-Path -LiteralPath $restartPath)) { throw ("Missing file: {0}" -f $restartPath) }

if (-not $RequireVersion) {
    Write-Host "NOTICE: 'version' check is temporarily relaxed. Enable -RequireVersion after backend fix."
}

try {
    Invoke-Step -Title 'Step 1/4: Static Analysis' -Action {
        & $analyzePath
        if ($LASTEXITCODE -ne 0) {
            throw ("analyze.ps1 failed with exit code: {0}" -f $LASTEXITCODE)
        }
    }

    Invoke-Step -Title 'Step 2/4: Restart Smoke Test' -Action {
        & $restartPath `
            -Port $Port `
            -HealthTimeoutSec $HealthTimeoutSec `
            -HealthPath $HealthPath `
            -SkipInstall:$SkipInstall `
            -ForceFreePort:$ForceFreePort

        if ($LASTEXITCODE -ne 0) {
            throw ("restart.ps1 failed with exit code: {0}" -f $LASTEXITCODE)
        }
    }

    Invoke-Step -Title 'Step 3/4: Health Probe & Contract' -Action {
        $uri = "http://127.0.0.1:{0}{1}" -f $Port, $HealthPath
        Write-Log ("Probing health endpoint: {0}" -f $uri)

        $resp = Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec $HealthTimeoutSec -ErrorAction Stop
        if ([int]$resp.StatusCode -ne 200) {
            throw ("Health endpoint returned non-200 status: {0}" -f $resp.StatusCode)
        }

        $bodyText = [string]$resp.Content
        Write-Log ("Health response body: {0}" -f $bodyText)

        $json = $null
        try { $json = $bodyText | ConvertFrom-Json }
        catch { throw "Health response is not valid JSON." }

        if (-not ($json.PSObject.Properties.Name -contains 'ok')) { throw "Health JSON missing required field: ok" }
        if (-not ($json.PSObject.Properties.Name -contains 'service')) { throw "Health JSON missing required field: service" }
        if (-not ($json.PSObject.Properties.Name -contains 'status')) { throw "Health JSON missing required field: status" }
        if (-not ($json.PSObject.Properties.Name -contains 'timestamp')) { throw "Health JSON missing required field: timestamp" }

        if (-not [bool]$json.ok) { throw "Health JSON field 'ok' is not true." }

        if ($RequireVersion) {
            if (-not ($json.PSObject.Properties.Name -contains 'version')) {
                throw "Health JSON missing required field: version (RequireVersion=ON)"
            }
            $versionValue = [string]$json.version
            if ([string]::IsNullOrWhiteSpace($versionValue)) {
                throw "Health JSON field 'version' is empty (RequireVersion=ON)."
            }
        }
        else {
            if (-not ($json.PSObject.Properties.Name -contains 'version')) {
                Write-Warning "Health JSON does not contain 'version' (temporarily allowed)."
            }
        }

        Write-Log "Health contract validation passed."
    }

    Invoke-Step -Title 'Step 4/4: Dependency Audit Policy' -Action {
        Invoke-NpmAuditPolicy -RepoRoot $root
    }

    Write-Host "CI PASSED"
    exit 0
}
catch {
    Write-Error ("CI FAILED: {0}" -f $_.Exception.Message)
    exit 1
}

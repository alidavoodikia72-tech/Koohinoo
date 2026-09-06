#Requires -Version 5.1
[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [int]$Port = 3000,

    [Parameter(Mandatory = $false)]
    [switch]$SkipInstall,

    [Parameter(Mandatory = $false)]
    [switch]$ForceFreePort,

    [Parameter(Mandatory = $false)]
    [int]$HealthTimeoutSec = 60,

    [Parameter(Mandatory = $false)]
    [string]$HealthPath = '/api/health'
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

$scriptRoot = Resolve-ScriptRoot
$scriptsPath = Join-Path -Path $scriptRoot -ChildPath 'scripts.ps1'
$stopPath    = Join-Path -Path $scriptRoot -ChildPath 'stop.ps1'

if (-not (Test-Path -LiteralPath $scriptsPath)) {
    throw ("scripts.ps1 not found: {0}" -f $scriptsPath)
}
if (-not (Test-Path -LiteralPath $stopPath)) {
    throw ("stop.ps1 not found: {0}" -f $stopPath)
}

# best-effort stop (ignore failure to avoid blocking restart)
try {
    & $stopPath -Port $Port
}
catch {
    Write-Warning ("stop.ps1 warning: {0}" -f $_.Exception.Message)
}

# start app
& $scriptsPath `
    -Port $Port `
    -SkipInstall:$SkipInstall `
    -ForceFreePort:$ForceFreePort `
    -HealthTimeoutSec $HealthTimeoutSec `
    -HealthPath $HealthPath

exit $LASTEXITCODE

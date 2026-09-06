#Requires -Version 5.1
[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 65535)]
    [int]$Port = 3000,

    [Parameter(Mandatory = $false)]
    [switch]$SkipInstall,

    [Parameter(Mandatory = $false)]
    [switch]$ForceFreePort,

    [Parameter(Mandatory = $false)]
    [ValidateRange(5, 600)]
    [int]$HealthTimeoutSec = 60,

    [Parameter(Mandatory = $false)]
    [string]$HealthPath = '/api/health'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PidFilePath = Join-Path $ScriptRoot '.app.pid'

$healthPathNormalized = if ($HealthPath.StartsWith('/')) { $HealthPath } else { '/' + $HealthPath }
$HealthUrl = "http://127.0.0.1:{0}{1}" -f $Port, $healthPathNormalized

function Write-Step {
    [CmdletBinding()]
    [OutputType([void])]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Write-Host ("[{0}] {1}" -f $ts, $Message)
}

function Test-IsWindows {
    [CmdletBinding()]
    [OutputType([bool])]
    param()
    return ($env:OS -eq 'Windows_NT')
}

function ConvertTo-ValidPid {
    [CmdletBinding()]
    [OutputType([int])]
    param(
        [Parameter(Mandatory = $true)]
        [AllowNull()]
        [object]$Value
    )

    $pidValue = 0
    try { $pidValue = [int]$Value } catch { $pidValue = 0 }

    if ($pidValue -ge 1) { return $pidValue }
    return 0
}

function Get-ChildProcessIdList {
    [CmdletBinding()]
    [OutputType([int[]])]
    param(
        [Parameter(Mandatory = $true)]
        [ValidateRange(1, [int]::MaxValue)]
        [int]$ParentId
    )

    $result = New-Object System.Collections.Generic.List[int]

    if (Test-IsWindows) {
        try {
            $children = Get-CimInstance Win32_Process -Filter ("ParentProcessId = {0}" -f $ParentId) -ErrorAction Stop
            foreach ($child in $children) {
                $id = ConvertTo-ValidPid -Value $child.ProcessId
                if ($id -ge 1) { $result.Add($id) }
            }
        } catch {
            # ignore
        }
    } else {
        try {
            $psCmd = Get-Command -Name 'ps' -CommandType Application -ErrorAction SilentlyContinue
            if ($null -ne $psCmd -and $psCmd.Source) {
                $raw = & $psCmd.Source -o pid= --ppid $ParentId 2>$null
                foreach ($line in @($raw)) {
                    $id = ConvertTo-ValidPid -Value $line
                    if ($id -ge 1) { $result.Add($id) }
                }
            }
        } catch {
            # ignore
        }
    }

    return [int[]]($result | Select-Object -Unique)
}

function Stop-ProcessTree {
    [CmdletBinding()]
    [OutputType([void])]
    param(
        [Parameter(Mandatory = $true)]
        [ValidateRange(1, [int]::MaxValue)]
        [int]$ProcessId
    )

    if ($ProcessId -lt 1) { return }

    $children = @(Get-ChildProcessIdList -ParentId $ProcessId)
    foreach ($childId in $children) {
        if ($childId -ge 1) {
            Stop-ProcessTree -ProcessId $childId
        }
    }

    try {
        $proc = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
        if ($null -ne $proc) {
            Stop-Process -Id $ProcessId -Force -ErrorAction Stop
        }
    } catch {
        # ignore
    }
}

function Get-ListeningProcessIdListByPort {
    [CmdletBinding()]
    [OutputType([int[]])]
    param(
        [Parameter(Mandatory = $true)]
        [ValidateRange(1, 65535)]
        [int]$TargetPort
    )

    $result = New-Object System.Collections.Generic.List[int]

    if (Test-IsWindows) {
        try {
            $rows = Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction Stop
            foreach ($row in @($rows)) {
                $id = ConvertTo-ValidPid -Value $row.OwningProcess
                if ($id -ge 1) { $result.Add($id) }
            }
        } catch {
            # no listener
        }
    } else {
        try {
            $raw = & lsof -ti tcp:$TargetPort -sTCP:LISTEN 2>$null
            foreach ($line in @($raw)) {
                $id = ConvertTo-ValidPid -Value $line
                if ($id -ge 1) { $result.Add($id) }
            }
        } catch {
            # ignore
        }
    }

    return [int[]]($result | Select-Object -Unique)
}

function Remove-PidFileIfPresent {
    [CmdletBinding()]
    [OutputType([void])]
    param()

    if (Test-Path -LiteralPath $PidFilePath) {
        Remove-Item -LiteralPath $PidFilePath -Force -ErrorAction SilentlyContinue
    }
}

function Set-PidFile {
    [CmdletBinding()]
    [OutputType([void])]
    param(
        [Parameter(Mandatory = $true)]
        [ValidateRange(1, [int]::MaxValue)]
        [int]$ProcessId
    )

    Set-Content -Path $PidFilePath -Value $ProcessId -Encoding ascii -Force
}

function Invoke-NpmCommand {
    [CmdletBinding()]
    [OutputType([void])]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Arguments
    )

    if (Test-IsWindows) {
        $cmdArgs = "/d /c npm {0}" -f $Arguments
        & cmd.exe $cmdArgs
        if ($LASTEXITCODE -ne 0) {
            throw ("npm {0} failed with exit code {1}" -f $Arguments, $LASTEXITCODE)
        }
    } else {
        & npm $Arguments
        if ($LASTEXITCODE -ne 0) {
            throw ("npm {0} failed with exit code {1}" -f $Arguments, $LASTEXITCODE)
        }
    }
}

function Wait-AppHealth {
    [CmdletBinding()]
    [OutputType([void])]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url,

        [Parameter(Mandatory = $true)]
        [ValidateRange(5, 600)]
        [int]$TimeoutSec
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    $lastErrorMessage = $null

    while ((Get-Date) -lt $deadline) {
        try {
            $resp = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) {
                Write-Step -Message ("Health check passed: {0} (HTTP {1})" -f $Url, $resp.StatusCode)
                return
            }
        } catch {
            $lastErrorMessage = $_.Exception.Message
        }

        Start-Sleep -Seconds 2
    }

    if ($null -ne $lastErrorMessage) {
        throw ("Health check timeout after {0}s for {1}. Last error: {2}" -f $TimeoutSec, $Url, $lastErrorMessage)
    }

    throw ("Health check timeout after {0}s for {1}" -f $TimeoutSec, $Url)
}

function Clear-PortIfNeeded {
    [CmdletBinding()]
    [OutputType([void])]
    param(
        [Parameter(Mandatory = $true)]
        [ValidateRange(1, 65535)]
        [int]$TargetPort,

        [Parameter(Mandatory = $true)]
        [bool]$ShouldForce
    )

    $processIds = @(Get-ListeningProcessIdListByPort -TargetPort $TargetPort)
    $processIds = @(
        $processIds |
        ForEach-Object { ConvertTo-ValidPid -Value $_ } |
        Where-Object { $_ -ge 1 } |
        Select-Object -Unique
    )

    if ($processIds.Count -eq 0) {
        return
    }

    if (-not $ShouldForce) {
        throw ("Port {0} is in use. Re-run with -ForceFreePort to stop owning process(es)." -f $TargetPort)
    }

    Write-Step -Message ("Port {0} is in use. Force stopping PID(s): {1}" -f $TargetPort, ($processIds -join ', '))

    foreach ($pidItem in $processIds) {
        $validPid = ConvertTo-ValidPid -Value $pidItem
        if ($validPid -ge 1) {
            Stop-ProcessTree -ProcessId $validPid
        }
    }

    Start-Sleep -Seconds 1

    $remaining = @(Get-ListeningProcessIdListByPort -TargetPort $TargetPort)
    $remaining = @(
        $remaining |
        ForEach-Object { ConvertTo-ValidPid -Value $_ } |
        Where-Object { $_ -ge 1 } |
        Select-Object -Unique
    )

    if ($remaining.Count -gt 0) {
        throw ("Unable to free port {0}. Remaining PID(s): {1}" -f $TargetPort, ($remaining -join ', '))
    }
}

try {
    Set-Location -LiteralPath $ScriptRoot

    Write-Step -Message ("Starting app instance... (Port={0}, SkipInstall={1}, ForceFreePort={2}, HealthTimeoutSec={3}, HealthPath={4})" -f $Port, [bool]$SkipInstall, [bool]$ForceFreePort, $HealthTimeoutSec, $healthPathNormalized)

    Remove-PidFileIfPresent
    Clear-PortIfNeeded -TargetPort $Port -ShouldForce ([bool]$ForceFreePort)

    if (-not $SkipInstall) {
        Write-Step -Message "Running npm install..."
        Invoke-NpmCommand -Arguments 'install'
    } else {
        Write-Step -Message "SkipInstall=True -> npm install skipped."
    }

    Write-Step -Message "Starting app process (npm run dev)..."

    $psExe = if (Test-IsWindows) { 'powershell.exe' } else { 'pwsh' }
    $startCmd = "Set-Location -LiteralPath '{0}'; `$env:PORT='{1}'; npm run dev" -f $ScriptRoot.Replace("'", "''"), $Port
    $proc = Start-Process -FilePath $psExe -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $startCmd) -PassThru -WindowStyle Hidden

    $appPid = ConvertTo-ValidPid -Value $proc.Id
    if ($appPid -lt 1) {
        throw "Could not obtain a valid PID for started app process."
    }

    Set-PidFile -ProcessId $appPid
    Write-Step -Message ("App started with PID {0}. PID file: {1}" -f $appPid, $PidFilePath)

    Write-Step -Message ("Waiting for health: {0}" -f $HealthUrl)
    Wait-AppHealth -Url $HealthUrl -TimeoutSec $HealthTimeoutSec

    Write-Step -Message "Start completed."
    exit 0
}
catch {
    Write-Error -Message ("FAILED: {0}" -f $_.Exception.Message)
    exit 1
}

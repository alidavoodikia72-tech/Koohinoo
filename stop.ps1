#Requires -Version 5.1
[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 65535)]
    [int]$Port = 3000,

    [Parameter(Mandatory = $false)]
    [switch]$ForceFreePort
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PidFilePath = Join-Path $ScriptRoot '.app.pid'

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
        # already exited or inaccessible
    }
}

function Get-PidFromFile {
    [CmdletBinding()]
    [OutputType([int])]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path)) { return 0 }

    try {
        $raw = Get-Content -LiteralPath $Path -ErrorAction Stop | Select-Object -First 1
        return (ConvertTo-ValidPid -Value $raw)
    } catch {
        return 0
    }
}

function Remove-PidFileIfPresent {
    [CmdletBinding()]
    [OutputType([void])]
    param()

    if (Test-Path -LiteralPath $PidFilePath) {
        Remove-Item -LiteralPath $PidFilePath -Force -ErrorAction SilentlyContinue
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

try {
    Write-Step -Message ("Stopping current app instance... (Port={0}, ForceFreePort={1})" -f $Port, [bool]$ForceFreePort)

    $pidFromFile = Get-PidFromFile -Path $PidFilePath
    if ($pidFromFile -ge 1) {
        Write-Step -Message ("Stopping process from PID file: {0}" -f $pidFromFile)
        Stop-ProcessTree -ProcessId $pidFromFile
    }

    Remove-PidFileIfPresent

    $portPids = @(Get-ListeningProcessIdListByPort -TargetPort $Port)
    $portPids = @(
        $portPids |
        ForEach-Object { ConvertTo-ValidPid -Value $_ } |
        Where-Object { $_ -ge 1 } |
        Select-Object -Unique
    )

    if ($portPids.Count -gt 0) {
        if (-not $ForceFreePort) {
            throw ("Port {0} is still in use by PID(s): {1}. Re-run with -ForceFreePort." -f $Port, ($portPids -join ', '))
        }

        Write-Step -Message ("Force stopping process(es) on port {0}: {1}" -f $Port, ($portPids -join ', '))
        foreach ($pidItem in $portPids) {
            $validPid = ConvertTo-ValidPid -Value $pidItem
            if ($validPid -ge 1) {
                Stop-ProcessTree -ProcessId $validPid
            }
        }

        Start-Sleep -Seconds 1

        $remaining = @(Get-ListeningProcessIdListByPort -TargetPort $Port)
        $remaining = @(
            $remaining |
            ForEach-Object { ConvertTo-ValidPid -Value $_ } |
            Where-Object { $_ -ge 1 } |
            Select-Object -Unique
        )

        if ($remaining.Count -gt 0) {
            throw ("Unable to free port {0}. Remaining PID(s): {1}" -f $Port, ($remaining -join ', '))
        }
    }

    Write-Step -Message "Stop completed."
    exit 0
}
catch {
    Write-Error -Message ("FAILED: {0}" -f $_.Exception.Message)
    exit 1
}

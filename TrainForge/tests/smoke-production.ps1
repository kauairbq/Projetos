$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$root = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $root "backend"
$frontendDist = Join-Path $root "frontend\dist"

if (!(Test-Path $frontendDist)) {
  throw "Frontend dist not found at $frontendDist. Build frontend before smoke."
}

$backendPort = 8086
$frontendPort = 4174

$backendOut = Join-Path $root "tests\smoke-backend.out.log"
$backendErr = Join-Path $root "tests\smoke-backend.err.log"
$frontendOut = Join-Path $root "tests\smoke-frontend.out.log"
$frontendErr = Join-Path $root "tests\smoke-frontend.err.log"

$backend = $null
$frontend = $null

function Invoke-RestWithRetry {
  param(
    [Parameter(Mandatory = $true)] [string] $Uri,
    [Parameter(Mandatory = $true)] [string] $Method,
    [hashtable] $Headers,
    [string] $ContentType,
    [string] $Body,
    [int] $TimeoutSec = 10,
    [int] $MaxAttempts = 10
  )

  $lastError = $null
  for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
    try {
      if ($PSBoundParameters.ContainsKey('Body')) {
        return Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -ContentType $ContentType -Body $Body -TimeoutSec $TimeoutSec
      }
      return Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -TimeoutSec $TimeoutSec
    } catch {
      $lastError = $_
      Start-Sleep -Milliseconds 700
    }
  }

  throw "Request failed after $MaxAttempts attempts: $Method $Uri - $lastError"
}

function Invoke-WebWithRetry {
  param(
    [Parameter(Mandatory = $true)] [string] $Uri,
    [int] $TimeoutSec = 10,
    [int] $MaxAttempts = 10
  )

  $lastError = $null
  for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
    try {
      return Invoke-WebRequest -Uri $Uri -UseBasicParsing -TimeoutSec $TimeoutSec
    } catch {
      $lastError = $_
      Start-Sleep -Milliseconds 700
    }
  }

  throw "Web request failed after $MaxAttempts attempts: GET $Uri - $lastError"
}

try {
  $backend = Start-Process -FilePath "powershell" `
    -ArgumentList "-NoProfile -Command `"Set-Location '$backendDir'; `$env:PORT='$backendPort'; node server.js`"" `
    -RedirectStandardOutput $backendOut `
    -RedirectStandardError $backendErr `
    -NoNewWindow `
    -PassThru

  $frontend = Start-Process -FilePath "powershell" `
    -ArgumentList "-NoProfile -Command `"Set-Location '$frontendDist'; python -m http.server $frontendPort`"" `
    -RedirectStandardOutput $frontendOut `
    -RedirectStandardError $frontendErr `
    -NoNewWindow `
    -PassThru

  Start-Sleep -Seconds 2

  $health = Invoke-RestWithRetry -Uri "http://localhost:$backendPort/api/v1/health" -Method Get -TimeoutSec 8 -MaxAttempts 12
  if (-not $health.ok) {
    throw "Backend healthcheck failed."
  }

  $loginBody = @{
    email = "kauai@trainforge.local"
    password = "password"
  } | ConvertTo-Json

  $login = Invoke-RestWithRetry -Uri "http://localhost:$backendPort/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $loginBody -TimeoutSec 8 -MaxAttempts 6
  if (-not $login.ok -or [string]::IsNullOrWhiteSpace($login.accessToken)) {
    throw "Login smoke failed."
  }

  $headers = @{ Authorization = "Bearer $($login.accessToken)" }
  $me = Invoke-RestWithRetry -Uri "http://localhost:$backendPort/api/v1/auth/me" -Method Get -Headers $headers -TimeoutSec 8 -MaxAttempts 6
  if (-not $me.ok) {
    throw "Protected endpoint smoke failed."
  }

  $frontendHtml = Invoke-WebWithRetry -Uri "http://localhost:$frontendPort/index.html" -TimeoutSec 8 -MaxAttempts 12
  if ($frontendHtml.StatusCode -ne 200) {
    throw "Frontend smoke failed."
  }

  Write-Host "Production smoke passed: backend(health/auth/protected) + frontend(index)."
}
finally {
  if ($frontend) {
    try {
      if (-not $frontend.HasExited) {
        Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
      }
    } catch {}
  }

  if ($backend) {
    try {
      if (-not $backend.HasExited) {
        Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
      }
    } catch {}
  }

  foreach ($port in @($backendPort, $frontendPort)) {
    try {
      $listening = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique
      foreach ($pid in $listening) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
      }
    } catch {}
  }
}

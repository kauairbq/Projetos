$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$esbuild = Join-Path $projectRoot "node_modules\@esbuild\win32-x64\esbuild.exe"
$entry = Join-Path $projectRoot "tests\frontend-automated.assertions.jsx"
$tmpDir = Join-Path $projectRoot ".tmp"
$bundle = Join-Path $tmpDir "frontend-automated.tests.cjs"

if (!(Test-Path $esbuild)) {
  throw "esbuild binary not found: $esbuild"
}

if (!(Test-Path $tmpDir)) {
  New-Item -ItemType Directory -Path $tmpDir | Out-Null
}

& $esbuild $entry `
  --bundle `
  --platform=node `
  --format=cjs `
  --jsx=automatic `
  --outfile=$bundle `
  --loader:.js=jsx `
  --loader:.jsx=jsx

if ($LASTEXITCODE -ne 0) {
  throw "Failed to bundle frontend assertions."
}

node $bundle
if ($LASTEXITCODE -ne 0) {
  throw "Frontend automated tests failed."
}

Write-Host "Frontend automated tests passed."

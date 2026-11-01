param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$environmentPath = Join-Path $projectRoot 'Backend/.env'
$examplePath = Join-Path $projectRoot 'Backend/.env.example'

if (-not (Test-Path -LiteralPath $environmentPath)) {
    Copy-Item -LiteralPath $examplePath -Destination $environmentPath
}

$environmentText = Get-Content -LiteralPath $environmentPath -Raw
if ($environmentText -match '(?m)^JWT_SECRET=\s*$') {
    $secretBytes = New-Object byte[] 48
    $generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $generator.GetBytes($secretBytes)
    } finally {
        $generator.Dispose()
    }
    $environmentText = [regex]::Replace($environmentText, '(?m)^JWT_SECRET=[ \t]*\r?$',
        ('JWT_SECRET=' + [Convert]::ToBase64String($secretBytes)))
    Set-Content -LiteralPath $environmentPath -Value $environmentText -Encoding UTF8
}

if ($environmentText -notmatch '(?m)^JWT_SECRET=\S.{31,}\r?$') {
    throw 'Backend/.env must contain a JWT_SECRET of at least 32 UTF-8 bytes.'
}

Write-Output 'Backend/.env is ready. Existing settings were preserved; credentials were not printed.'
Write-Output 'Next: configure optional admin bootstrap, then run docker compose -f Backend/docker-compose.yml up --build -d.'

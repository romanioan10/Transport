param(
    [string]$BaseUrl = 'http://localhost:8080/api'
)

$ErrorActionPreference = 'Stop'
$BaseUrl = $BaseUrl.TrimEnd('/')

function Assert-Status {
    param([string]$Path, [int]$Expected, [hashtable]$Headers = @{})
    $actual = 200
    try {
        $null = Invoke-WebRequest -Uri "$BaseUrl$Path" -Headers $Headers -UseBasicParsing
    } catch {
        if ($null -eq $_.Exception.Response) { throw }
        $actual = [int]$_.Exception.Response.StatusCode
    }
    if ($actual -ne $Expected) { throw "$Path returned $actual; expected $Expected" }
}

$null = Invoke-RestMethod -Uri "$BaseUrl/actuator/health"
Assert-Status -Path '/users/me' -Expected 401
Assert-Status -Path '/users/me' -Expected 401 -Headers @{ Authorization = 'Bearer invalid-token' }

# Creates one isolated client account per run. It does not delete business history.
$email = 'smoke-' + [Guid]::NewGuid().ToString('N') + '@example.com'
$password = [Guid]::NewGuid().ToString('N')
$registration = @{
    email = $email
    password = $password
    firstName = 'Smoke'
    lastName = 'Client'
    phoneNumber = '+40700000000'
} | ConvertTo-Json
$registered = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/register" -ContentType 'application/json' -Body $registration
if (-not $registered.token) { throw 'Registration did not return a JWT' }

$login = @{ email = $email; password = $password } | ConvertTo-Json
$auth = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -ContentType 'application/json' -Body $login
$headers = @{ Authorization = "Bearer $($auth.token)" }
$profile = Invoke-RestMethod -Uri "$BaseUrl/users/me" -Headers $headers
if ($profile.role -ne 'CLIENT' -or $profile.email -ne $email) { throw 'Incorrect current-user profile' }
Assert-Status -Path '/users' -Expected 403 -Headers $headers
Assert-Status -Path '/assignments' -Expected 403 -Headers $headers
Assert-Status -Path '/drivers/me' -Expected 403 -Headers $headers

Write-Output "API smoke checks passed. Created test client $email. No passwords or tokens were printed."

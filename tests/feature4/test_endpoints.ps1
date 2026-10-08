$baseUrl = 'http://localhost:8080/api'
$password = $env:TEST_PASSWORD

function Get-Token($identifier, $password, $portal) {
    $body = @{ identifier = $identifier; password = $password; portal = $portal } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType 'application/json' -Body $body
    return $res.data.token
}

$adminToken = Get-Token "admin@library.edu" $password "STAFF"
$studentToken = Get-Token "student@library.edu" $password "STUDENT"
$staffToken = Get-Token "staff@library.edu" $password "STAFF"

function Test-Endpoint($method, $path, $token, $body = $null) {
    $headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
    try {
        if ($body) {
            $jsonBody = $body | ConvertTo-Json
            $res = Invoke-WebRequest -Uri "$baseUrl$path" -Method $method -Headers $headers -Body $jsonBody
        } else {
            $res = Invoke-WebRequest -Uri "$baseUrl$path" -Method $method -Headers $headers
        }
        return $res.StatusCode
    } catch {
        return $_.Exception.Response.StatusCode.value__
    }
}

Write-Output "Admin Tests:"
Write-Output "GET /feature4/settings: $(Test-Endpoint 'GET' '/feature4/settings' $adminToken)"
Write-Output "PUT /feature4/settings: $(Test-Endpoint 'PUT' '/feature4/settings' $adminToken @{occupancyThreshold=85;autoGenerateWeeklyReport=$true;allowGuestLookups=$true})"
Write-Output "PUT /feature4/settings (bad): $(Test-Endpoint 'PUT' '/feature4/settings' $adminToken @{occupancyThreshold=150;autoGenerateWeeklyReport=$true;allowGuestLookups=$true})"
Write-Output "GET /feature4/users: $(Test-Endpoint 'GET' '/feature4/users' $adminToken)"
$today = (Get-Date).ToString("yyyy-MM-dd")
Write-Output "POST /feature4/reports: $(Test-Endpoint 'POST' '/feature4/reports' $adminToken @{type='USAGE';dateFrom=$today;dateTo=$today})"

Write-Output "Student Tests:"
Write-Output "GET /feature4/settings: $(Test-Endpoint 'GET' '/feature4/settings' $studentToken)"

Write-Output "Staff Tests:"
Write-Output "GET /feature4/settings: $(Test-Endpoint 'GET' '/feature4/settings' $staffToken)"

$ErrorActionPreference = 'Stop'

# Register a new student to ensure we have one
$regBody = @{ name = 'Test Student'; email = 'test_student_123@example.com'; password = 'password' } | ConvertTo-Json
try {
    $regRes = Invoke-RestMethod -Uri http://localhost:8080/api/auth/register -Method Post -Body $regBody -ContentType 'application/json'
    $token = $regRes.data.token
} catch {
    # If already registered, login
    $logBody = @{ identifier = 'test_student_123@example.com'; password = 'password'; portal = 'STUDENT' } | ConvertTo-Json
    $logRes = Invoke-RestMethod -Uri http://localhost:8080/api/auth/login -Method Post -Body $logBody -ContentType 'application/json'
    $token = $logRes.data.token
}

$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

Write-Host "Token: $token"

# 1. Filters GET/PUT
Write-Host "Testing GET /api/feature1/filters"
$res1 = Invoke-WebRequest -Uri http://localhost:8080/api/feature1/filters -Method Get -Headers $headers
Write-Host "Status: $($res1.StatusCode)"

$putBody = @{ floor = 'Floor 3'; zone = 'GROUP_STUDY'; hasPower = $true; hasPc = $false } | ConvertTo-Json
Write-Host "Testing PUT /api/feature1/filters"
$res2 = Invoke-WebRequest -Uri http://localhost:8080/api/feature1/filters -Method Put -Headers $headers -Body $putBody
Write-Host "Status: $($res2.StatusCode)"

# 2. Alerts POST/GET/DELETE
$alertBody = @{ zone = 'GROUP_STUDY' } | ConvertTo-Json
Write-Host "Testing POST /api/feature1/alerts"
$res3 = Invoke-WebRequest -Uri http://localhost:8080/api/feature1/alerts -Method Post -Headers $headers -Body $alertBody
Write-Host "Status: $($res3.StatusCode)"
$alertId = ($res3.Content | ConvertFrom-Json).data.id

Write-Host "Testing GET /api/feature1/alerts"
$res4 = Invoke-WebRequest -Uri http://localhost:8080/api/feature1/alerts -Method Get -Headers $headers
Write-Host "Status: $($res4.StatusCode)"

Write-Host "Testing DELETE /api/feature1/alerts/$alertId"
$res5 = Invoke-WebRequest -Uri http://localhost:8080/api/feature1/alerts/$alertId -Method Delete -Headers $headers
Write-Host "Status: $($res5.StatusCode)"

# 3. Patch Conflict Case (We need a reservation first)
# For simplicity, we just print a placeholder or we can create a reservation.
# We'll skip the conflict case in the script and test it manually, or just hit a random ID.
try {
    $patchBody = @{ reservationDate = '2026-10-10'; startTime = '10:00:00'; endTime = '11:00:00' } | ConvertTo-Json
    $res6 = Invoke-WebRequest -Uri http://localhost:8080/api/feature1/reservations/999/slot -Method Patch -Headers $headers -Body $patchBody
} catch {
    Write-Host "PATCH /api/feature1/reservations/999/slot Status: $($_.Exception.Response.StatusCode.value__)"
}

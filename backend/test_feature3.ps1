$baseUrl = "http://localhost:8080/api"

# Login as Staff
$staffLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"staff@library.edu","portal":"staff","password":"password123"}'
$staffToken = $staffLogin.data.token
$staffHeaders = @{ Authorization = "Bearer $staffToken"; "Content-Type" = "application/json" }

# Login as Student
$studentLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"student@library.edu","portal":"student","password":"password123"}'
$studentToken = $studentLogin.data.token
$studentHeaders = @{ Authorization = "Bearer $studentToken"; "Content-Type" = "application/json" }

Write-Host "--- Testing endpoints with STAFF token ---"

Write-Host "GET /api/feature3/dashboard"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/feature3/dashboard" -Method Get -Headers $staffHeaders
    Write-Host "Status: OK"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "GET /api/feature3/alerts"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/feature3/alerts" -Method Get -Headers $staffHeaders
    $alertId = $res.data[0].id
    Write-Host "Status: OK. Found alert ID $alertId"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "PATCH /api/feature3/alerts/$alertId/resolve"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/feature3/alerts/$alertId/resolve" -Method Patch -Headers $staffHeaders
    Write-Host "Status: OK"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "GET /api/feature3/books"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/feature3/books" -Method Get -Headers $staffHeaders
    $bookId = $res.data[0].id
    Write-Host "Status: OK. Found book ID $bookId"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "PATCH /api/feature3/books/$bookId/status"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/feature3/books/$bookId/status" -Method Patch -Headers $staffHeaders -Body '{"status":"MISSING"}'
    Write-Host "Status: OK"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "GET /api/feature3/settings"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/feature3/settings" -Method Get -Headers $staffHeaders
    Write-Host "Status: OK"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "`n--- Testing endpoints with STUDENT token ---"

Write-Host "GET /api/feature3/dashboard"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/feature3/dashboard" -Method Get -Headers $studentHeaders
    Write-Host "Status: OK"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__) (Expected 403)"
}

$ErrorActionPreference = 'Stop'

function Get-Token {
    param($email, $password)
    try {
        $body = @{ email = $email; password = $password; portal = "ADMIN" } | ConvertTo-Json
        $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $body
        return $resp.token
    } catch {
        return $null
    }
}

function Wait-Backend {
    for ($i=0; $i -lt 30; $i++) {
        try {
            $r = Invoke-WebRequest -Uri "http://localhost:8080/v3/api-docs" -Method Get -ErrorAction SilentlyContinue
            if ($r.StatusCode -eq 200) { return $true }
        } catch {}
        Start-Sleep -Seconds 2
    }
    return $false
}

if (-not (Wait-Backend)) {
    Write-Host "Backend did not start in time."
    exit 1
}

$adminToken = Get-Token "admin@sliit.lk" "admin123"
$studentToken = Get-Token "it20000000@my.sliit.lk" "student123"
$staffToken = Get-Token "staff@sliit.lk" "staff123"

# Admin token GET
try {
    $resp = Invoke-WebRequest -Uri "http://localhost:8080/api/feature4/settings" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
    Write-Host "Admin GET Status: $($resp.StatusCode)"
    Write-Host "Admin GET Body: $($resp.Content)"
} catch {
    Write-Host "Admin GET Failed: $($_.Exception.Response.StatusCode.value__)"
}

# Admin token PUT
try {
    $putBody = @{ occupancyThreshold = 95; autoGenerateWeeklyReport = $true; allowGuestLookups = $false } | ConvertTo-Json
    $putResp = Invoke-WebRequest -Uri "http://localhost:8080/api/feature4/settings" -Method Put -Headers @{ Authorization = "Bearer $adminToken" } -ContentType "application/json" -Body $putBody
    Write-Host "Admin PUT Status: $($putResp.StatusCode)"
} catch {
    Write-Host "Admin PUT Failed: $($_.Exception.Response.StatusCode.value__)"
}

# Admin token GET after PUT
try {
    $resp2 = Invoke-WebRequest -Uri "http://localhost:8080/api/feature4/settings" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
    Write-Host "Admin GET After PUT Body: $($resp2.Content)"
} catch {}

# Student token GET
try {
    $resp3 = Invoke-WebRequest -Uri "http://localhost:8080/api/feature4/settings" -Method Get -Headers @{ Authorization = "Bearer $studentToken" }
    Write-Host "Student GET Status: $($resp3.StatusCode)"
} catch {
    Write-Host "Student GET Status: $($_.Exception.Response.StatusCode.value__)"
}

# Staff token GET
try {
    $resp4 = Invoke-WebRequest -Uri "http://localhost:8080/api/feature4/settings" -Method Get -Headers @{ Authorization = "Bearer $staffToken" }
    Write-Host "Staff GET Status: $($resp4.StatusCode)"
} catch {
    Write-Host "Staff GET Status: $($_.Exception.Response.StatusCode.value__)"
}

# No token GET
try {
    $resp5 = Invoke-WebRequest -Uri "http://localhost:8080/api/feature4/settings" -Method Get
    Write-Host "No Token GET Status: $($resp5.StatusCode)"
} catch {
    Write-Host "No Token GET Status: $($_.Exception.Response.StatusCode.value__)"
}

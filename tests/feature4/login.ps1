try {
    $password = $env:TEST_PASSWORD
    $body = @{ identifier = 'admin@library.edu'; password = $password; portal = 'STAFF' } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri 'http://localhost:8080/api/auth/login' -Method POST -ContentType 'application/json' -Body $body
    $response.StatusCode
} catch {
    $_.Exception.Response.StatusCode.value__
}

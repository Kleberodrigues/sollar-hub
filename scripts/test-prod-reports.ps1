$headers = @{
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4cHlqYnBuZHNzbnd1dWRidXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTY2MjYsImV4cCI6MjA2NTA3MjYyNn0.hH64H5UoVj3GvhfGCMvkjLbhHLp6pDV7zn3Y1fE01gM'
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4cHlqYnBuZHNzbnd1dWRidXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTY2MjYsImV4cCI6MjA2NTA3MjYyNn0.hH64H5UoVj3GvhfGCMvkjLbhHLp6pDV7zn3Y1fE01gM'
}

Write-Host "=== BUSCANDO ASSESSMENTS COM DADOS ===" -ForegroundColor Cyan

# Fetch assessments
$assessments = Invoke-RestMethod -Uri 'https://jxpyjbpndssnwuudbuui.supabase.co/rest/v1/assessments?select=id,title,status,questionnaire_id&limit=10' -Headers $headers

foreach ($a in $assessments) {
    # Count responses for each assessment
    $responses = Invoke-RestMethod -Uri "https://jxpyjbpndssnwuudbuui.supabase.co/rest/v1/responses?assessment_id=eq.$($a.id)&select=anonymous_id" -Headers $headers

    $uniqueParticipants = ($responses | Select-Object -ExpandProperty anonymous_id -Unique).Count
    $totalResponses = $responses.Count

    if ($totalResponses -gt 0) {
        Write-Host ""
        Write-Host "ID: $($a.id)" -ForegroundColor Yellow
        Write-Host "Titulo: $($a.title)"
        Write-Host "Status: $($a.status)"
        Write-Host "Respostas: $totalResponses"
        Write-Host "Participantes: $uniqueParticipants"

        if ($uniqueParticipants -ge 10) {
            Write-Host "Elegivel para Correlacao: SIM" -ForegroundColor Green
        } elseif ($uniqueParticipants -ge 3) {
            Write-Host "Elegivel para outros relatorios: SIM" -ForegroundColor Green
        } else {
            Write-Host "Precisa mais participantes" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=== RELATORIOS GERADOS ===" -ForegroundColor Cyan

# Check generated reports
$reports = Invoke-RestMethod -Uri 'https://jxpyjbpndssnwuudbuui.supabase.co/rest/v1/generated_reports?select=id,report_type,title,status,created_at&order=created_at.desc&limit=10' -Headers $headers

if ($reports.Count -gt 0) {
    foreach ($r in $reports) {
        Write-Host ""
        Write-Host "Tipo: $($r.report_type)" -ForegroundColor Yellow
        Write-Host "Titulo: $($r.title)"
        Write-Host "Status: $($r.status)"
        Write-Host "Criado: $($r.created_at)"
    }
} else {
    Write-Host "Nenhum relatorio gerado ainda" -ForegroundColor Yellow
}

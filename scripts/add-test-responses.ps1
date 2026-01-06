$headers = @{
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4cHlqYnBuZHNzbnd1dWRidXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTY2MjYsImV4cCI6MjA2NTA3MjYyNn0.hH64H5UoVj3GvhfGCMvkjLbhHLp6pDV7zn3Y1fE01gM'
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4cHlqYnBuZHNzbnd1dWRidXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTY2MjYsImV4cCI6MjA2NTA3MjYyNn0.hH64H5UoVj3GvhfGCMvkjLbhHLp6pDV7zn3Y1fE01gM'
    'Content-Type' = 'application/json'
    'Prefer' = 'return=representation'
}

$baseUrl = 'https://jxpyjbpndssnwuudbuui.supabase.co/rest/v1'

Write-Host "Adicionando respostas de teste..." -ForegroundColor Cyan

# 1. Get assessments
Write-Host "1. Buscando assessments..."
$assessmentsUrl = $baseUrl + '/assessments?select=id,title,status,questionnaire_id' + [char]38 + 'limit=5'
$assessments = Invoke-RestMethod -Uri $assessmentsUrl -Headers $headers
Write-Host "   Encontrados: $($assessments.Count) assessments"

if ($assessments.Count -eq 0) {
    Write-Host "Nenhum assessment encontrado" -ForegroundColor Red
    exit 1
}

$assessment = $assessments[0]
Write-Host "   Usando: $($assessment.title)" -ForegroundColor Yellow

# 2. Get questions
Write-Host "2. Buscando perguntas..."
$questionsUrl = $baseUrl + '/questions?questionnaire_id=eq.' + $assessment.questionnaire_id + [char]38 + 'select=id,text,type,category' + [char]38 + 'order=order_index'
$questions = Invoke-RestMethod -Uri $questionsUrl -Headers $headers
Write-Host "   Encontradas: $($questions.Count) perguntas"

if ($questions.Count -eq 0) {
    Write-Host "Nenhuma pergunta encontrada" -ForegroundColor Red
    exit 1
}

# Show question types
$typeCount = @{}
foreach ($q in $questions) {
    if (-not $typeCount.ContainsKey($q.type)) { $typeCount[$q.type] = 0 }
    $typeCount[$q.type]++
}
Write-Host "   Tipos: $($typeCount | ConvertTo-Json -Compress)"

# 3. Generate responses
Write-Host "3. Gerando respostas para 15 participantes..."

$textResponses = @(
    'A comunicacao entre departamentos precisa melhorar.',
    'O ambiente de trabalho e bom, mas ha estresse com prazos.',
    'Falta reconhecimento pelos esforcos da equipe.',
    'A lideranca poderia ser mais presente e acessivel.',
    'Gostaria de mais oportunidades de desenvolvimento.',
    'O equilibrio entre vida e trabalho esta comprometido.',
    'A empresa tem bons valores, mas nem sempre praticados.',
    'Precisamos de mais ferramentas e recursos.',
    'O clima entre colegas e excelente.',
    'Ha muita burocracia nos processos internos.'
)

$totalResponses = 0
$successfulParticipants = 0

for ($p = 0; $p -lt 15; $p++) {
    $anonymousId = "test-participant-$(Get-Date -Format 'yyyyMMddHHmmss')-$p"
    $responses = @()

    foreach ($question in $questions) {
        $value = switch ($question.type) {
            'likert_scale' { [string](Get-Random -Minimum 1 -Maximum 6) }
            'nps' { [string](Get-Random -Minimum 0 -Maximum 11) }
            'text' { $textResponses | Get-Random }
            'long_text' { $textResponses | Get-Random }
            'single_choice' { if ((Get-Random -Minimum 0 -Maximum 2) -eq 1) { 'Sim' } else { 'Nao' } }
            'multiple_choice' { '["Opcao A", "Opcao B"]' }
            default { [string](Get-Random -Minimum 1 -Maximum 6) }
        }

        $responses += @{
            assessment_id = $assessment.id
            question_id = $question.id
            anonymous_id = $anonymousId
            value = $value
            created_at = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
        }
    }

    try {
        $body = $responses | ConvertTo-Json -Depth 10
        $postUrl = $baseUrl + '/responses'
        Invoke-RestMethod -Uri $postUrl -Method Post -Headers $headers -Body $body | Out-Null
        $totalResponses += $responses.Count
        $successfulParticipants++
        Write-Host "   Participante $($p + 1)/15 ok"
    } catch {
        Write-Host "   Erro participante $($p + 1): $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "   Total: $totalResponses respostas de $successfulParticipants participantes" -ForegroundColor Green

# 4. Verify
Write-Host "4. Verificando..."
$countUrl = $baseUrl + '/responses?assessment_id=eq.' + $assessment.id + [char]38 + 'select=anonymous_id'
$count = Invoke-RestMethod -Uri $countUrl -Headers $headers
$uniqueParticipants = ($count | Select-Object -ExpandProperty anonymous_id -Unique).Count
Write-Host "   Respostas totais: $($count.Count)"
Write-Host "   Participantes unicos: $uniqueParticipants"

Write-Host "Pronto! Agora os relatorios podem ser testados." -ForegroundColor Green
Write-Host "   Assessment ID: $($assessment.id)" -ForegroundColor Cyan
$analyticsUrl = 'https://psicomapa.cloud/dashboard/analytics?assessment=' + $assessment.id
Write-Host "   URL: $analyticsUrl" -ForegroundColor Cyan

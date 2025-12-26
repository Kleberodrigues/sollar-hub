import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email, empresa, assunto, mensagem } = body

    // Validar campos obrigatórios
    if (!nome || !email || !assunto || !mensagem) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome, email, assunto, mensagem' },
        { status: 400 }
      )
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured')
      return NextResponse.json(
        { error: 'Serviço de contato temporariamente indisponível' },
        { status: 500 }
      )
    }

    // Enviar para n8n webhook
    // A URL base termina em /webhook/sollar-events, mas o workflow usa /webhook/contact
    const webhookContactUrl = n8nWebhookUrl.replace('/webhook/sollar-events', '/webhook/contact')
    const webhookResponse = await fetch(webhookContactUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'contact_form',
        data: {
          nome,
          email,
          empresa: empresa || 'Não informada',
          assunto,
          mensagem,
          timestamp: new Date().toISOString(),
          source: 'psicomapa.cloud',
        },
      }),
    })

    if (!webhookResponse.ok) {
      console.error('n8n webhook error:', await webhookResponse.text())
      // Não falhar se n8n estiver offline - log e retornar sucesso
      console.warn('n8n webhook failed, but continuing...')
    }

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso!',
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem. Tente novamente.' },
      { status: 500 }
    )
  }
}

'use client'

import { SlideUp } from '@/components/animated'
import { Mail, MessageCircle, MapPin, Clock } from 'lucide-react'
import { useState } from 'react'

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    empresa: '',
    assunto: '',
    mensagem: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const [erro, setErro] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setErro(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar mensagem')
      }

      setEnviado(true)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <SlideUp className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-pm-green-dark mb-4">
            Entre em Contato
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Estamos aqui para ajudar. Envie sua mensagem e responderemos o mais breve possível.
          </p>
        </SlideUp>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <MessageCircle className="w-8 h-8 text-pm-terracotta mb-3" />
              <h3 className="font-display text-lg font-semibold text-pm-green-dark mb-2">
                Suporte
              </h3>
              <p className="text-text-secondary text-sm">
                Para clientes, acesse o suporte pelo painel.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Clock className="w-8 h-8 text-pm-terracotta mb-3" />
              <h3 className="font-display text-lg font-semibold text-pm-green-dark mb-2">
                Horário
              </h3>
              <p className="text-text-secondary text-sm">
                Segunda a Sexta: 9h às 18h
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <MapPin className="w-8 h-8 text-pm-terracotta mb-3" />
              <h3 className="font-display text-lg font-semibold text-pm-green-dark mb-2">
                Localização
              </h3>
              <p className="text-text-secondary text-sm">
                São Paulo, Brasil
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              {enviado ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pm-green/10 mb-6">
                    <Mail className="w-8 h-8 text-pm-green" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-pm-green-dark mb-2">
                    Mensagem Enviada!
                  </h3>
                  <p className="text-text-secondary">
                    Obrigado pelo contato. Responderemos em breve.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Nome *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pm-green focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pm-green focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Empresa
                      </label>
                      <input
                        type="text"
                        value={formData.empresa}
                        onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pm-green focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Assunto *
                      </label>
                      <select
                        required
                        value={formData.assunto}
                        onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pm-green focus:border-transparent"
                      >
                        <option value="">Selecione...</option>
                        <option value="comercial">Informações Comerciais</option>
                        <option value="suporte">Suporte Técnico</option>
                        <option value="parceria">Parcerias</option>
                        <option value="imprensa">Imprensa</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.mensagem}
                      onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pm-green focus:border-transparent resize-none"
                    />
                  </div>

                  {erro && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {erro}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full py-3 px-6 bg-pm-terracotta text-white font-medium rounded-lg hover:bg-pm-terracotta-hover transition-colors disabled:opacity-50"
                  >
                    {enviando ? 'Enviando...' : 'Enviar Mensagem'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

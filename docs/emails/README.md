# Templates de E-mail - PsicoMapa

Templates HTML para envio de e-mails via n8n.

## Templates Disponíveis

### 1. Convite para Pesquisa (`participant-survey-invitation.html`)

**Uso**: Enviar para participantes convidados a responder a pesquisa de riscos psicossociais.

**Assunto**: `Sua participação é importante: Responda a Pesquisa de Riscos Psicossociais`

**Variáveis Handlebars**:
| Variável | Tipo | Obrigatória | Descrição |
|----------|------|-------------|-----------|
| `{{nome}}` | string | ✅ | Nome do participante |
| `{{empresa}}` | string | ✅ | Nome da empresa |
| `{{linkPesquisa}}` | string | ✅ | URL completa da pesquisa |
| `{{codigo}}` | string | ❌ | Código de acesso (condicional) |
| `{{prazo}}` | string | ✅ | Data limite (formato: DD/MM/AAAA) |

**Exemplo no n8n**:
```json
{
  "nome": "João Silva",
  "empresa": "Empresa ABC",
  "linkPesquisa": "https://app.psicomapa.com/assess/abc123",
  "codigo": "XYZ789",
  "prazo": "31/01/2025"
}
```

---

### 2. Convite para Plataforma (`platform-member-invitation.html`)

**Uso**: Enviar para membros convidados a criar conta na plataforma.

**Assunto**: `Você está sendo convidado para acessar a PsicoMapa`

**Variáveis Handlebars**:
| Variável | Tipo | Obrigatória | Descrição |
|----------|------|-------------|-----------|
| `{{nome}}` | string | ✅ | Nome do usuário |
| `{{empresa}}` | string | ✅ | Nome da empresa |
| `{{linkConvite}}` | string | ✅ | URL do convite para criar conta |

**Exemplo no n8n**:
```json
{
  "nome": "Maria Santos",
  "empresa": "Empresa ABC",
  "linkConvite": "https://app.psicomapa.com/invite/abc123"
}
```

---

## Configuração no n8n

### 1. Nó HTTP Request (Webhook Trigger)
Recebe dados dos participantes/membros.

### 2. Nó Send Email
Configure:
- **Subject**: Use o assunto indicado acima
- **HTML**: Cole o conteúdo do arquivo `.html` correspondente
- **To**: `{{$json.email}}`

### 3. Variáveis do Workflow
As variáveis `{{nome}}`, `{{empresa}}`, etc. devem vir do payload do webhook ou de nós anteriores.

---

## Design System

| Elemento | Valor |
|----------|-------|
| Cor primária | `#7C9A2E` (verde oliva) |
| Background | `#F5F7F0` |
| Texto | `#333333` |
| Texto secundário | `#666666` |
| Bordas | `#E0E5D8` |
| Fonte | System UI (sans-serif) |
| Largura máxima | 600px |
| Border radius | 8px |

---

## Uso Programático (TypeScript)

```typescript
import {
  generateParticipantInvitation,
  generateMemberInvitation
} from '@/lib/emails';

// Convite para pesquisa
const surveyEmail = generateParticipantInvitation({
  nome: 'João Silva',
  empresa: 'Empresa ABC',
  linkPesquisa: 'https://app.psicomapa.com/assess/abc123',
  codigo: 'XYZ789',
  prazo: '31/01/2025'
});

// Convite para plataforma
const platformEmail = generateMemberInvitation({
  nome: 'Maria Santos',
  empresa: 'Empresa ABC',
  linkConvite: 'https://app.psicomapa.com/invite/abc123'
});

// Resultado
console.log(surveyEmail.subject); // Assunto
console.log(surveyEmail.html);    // HTML
console.log(surveyEmail.text);    // Texto puro (fallback)
```

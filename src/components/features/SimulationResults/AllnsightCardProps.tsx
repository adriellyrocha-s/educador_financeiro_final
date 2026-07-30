import { type FormEvent, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import 'react-loading-skeleton/dist/skeleton.css'

import Skeleton from 'react-loading-skeleton'

import { useInsight } from '../../../hooks/userInsight'
import { useSimulationStorage } from '../../../hooks/useSimulationStorage'

import type { ConversationMessage } from '../../../data/simulation'

import { askFinancialQuestion } from '../../../services/aiService'

import { Content } from '../Insights/Content'
import { Error } from '../Insights/Error'

interface AIInsightCardProps {
  simulationId: string
}

export function AIInsightsCard({ simulationId }: AIInsightCardProps) {
  const { insight, isLoading, error, fetchInsight } = useInsight(simulationId)

  const { getFormData, addConversationMessage } = useSimulationStorage()

  const simulation = getFormData(simulationId)

  const [messages, setMessages] = useState<ConversationMessage[]>(
    () => simulation?.conversation ?? [],
  )

  const [question, setQuestion] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(simulation?.conversation ?? [])
  }, [simulationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages, isAsking])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuestion = question.trim()

    if (!trimmedQuestion || isAsking || !simulation) {
      return
    }

    setChatError(null)

    const userMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedQuestion,
      createdAt: new Date().toISOString(),
    }

    setMessages((current) => [...current, userMessage])

    addConversationMessage(simulationId, userMessage)

    setQuestion('')
    setIsAsking(true)

    try {
      const conversationContext = [
        ...(simulation.conversation ?? []),
        userMessage,
      ]
        .map(
          (message) =>
            `${message.role === 'user' ? 'Usuário' : 'Educador Financeiro'}: ${message.content}`,
        )
        .join('\n')

      const prompt = `
Você é um Educador Financeiro dentro de uma aplicação de planejamento financeiro.

Responda à última pergunta do usuário usando exclusivamente os dados da
simulação e o histórico da conversa.

REGRAS:
- Responda em português do Brasil.
- Seja claro, didático, objetivo e prático.
- Não invente informações.
- Não repita a pergunta.
- Não mencione inteligência artificial.
- Não use tabelas.
- Não use HTML.
- Use Markdown simples.
- Sempre coloque uma quebra de linha antes de um título.
- Sempre coloque uma linha em branco antes e depois de listas.
- Sempre coloque uma linha em branco antes e depois de separadores.
- Não coloque toda a resposta em uma única linha.
- Use títulos com ## quando precisar organizar a resposta.
- Use listas com "- " ou "1. " quando necessário.
- Use **negrito** para valores importantes.
- Prefira parágrafos curtos.
- Não faça introduções desnecessárias.
- Não termine com "Espero ter ajudado".

FORMATO ESPERADO:

## Análise

Explique a situação financeira em um parágrafo curto.

- **Renda mensal:** R$ 12.000,00
- **Custos fixos:** R$ 8.000,00
- **Dívidas:** R$ 1.000,00

## Recomendação

Explique a recomendação em um parágrafo.

1. **Primeira ação:** explique o que fazer.
2. **Segunda ação:** explique o que fazer.

DADOS DA SIMULAÇÃO:
- Renda mensal: R$ ${simulation.income}
- Custos fixos: R$ ${simulation.expenses}
- Dívidas/parcelas: R$ ${simulation.debts}
- Meta: ${simulation.goalName}
- Valor da meta: R$ ${simulation.goalAmount}
- Prazo: ${simulation.goalDeadline} meses

HISTÓRICO DA CONVERSA:
${conversationContext || 'Nenhuma conversa anterior.'}

ÚLTIMA PERGUNTA DO USUÁRIO:
${trimmedQuestion}

Responda somente à última pergunta.
`

      const answer = await askFinancialQuestion(prompt)

      const assistantMessage: ConversationMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: answer,
        createdAt: new Date().toISOString(),
      }

      setMessages((current) => [...current, assistantMessage])

      addConversationMessage(simulationId, assistantMessage)
    } catch (error) {
      console.error(error)

      setChatError(
        'Não foi possível obter uma resposta agora. Tente novamente.',
      )
    } finally {
      setIsAsking(false)
    }
  }

  return (
    <div className="bg-card order-2 rounded-2xl p-6 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)] lg:order-1 lg:col-span-2">
      <div className="mb-3 flex items-center gap-1.5">
        <span>✨</span>

        <span className="text-primary text-xs font-semibold tracking-widest uppercase">
          Insight Financeiro Personalizado
        </span>
      </div>

      {isLoading && (
        <div className="flex">
          <Skeleton
            count={10.5}
            baseColor="var(--color-skeleton-base)"
            highlightColor="var(--color-skeleton-highlight)"
            className="mb-3 flex rounded-lg"
            containerClassName="flex-1"
            inline
          />
        </div>
      )}

      {!isLoading && error && (
        <Error
          simulationId={simulationId}
          message={error}
          onRetry={() => {
            fetchInsight(simulationId)
          }}
        />
      )}

      {!isLoading && insight && !error && <Content insight={insight} />}

      {!isLoading && insight && !error && (
        <div className="mt-8 border-t border-zinc-200 pt-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-zinc-900">
              Conversando com o Educador Financeiro
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Faça perguntas sobre sua simulação e seus resultados.
            </p>
          </div>

          <div className="max-h-[420px] space-y-4 overflow-y-auto pr-2">
            {messages.length === 0 && (
              <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
                <p>Ainda não há perguntas nesta conversa.</p>

                <p className="mt-2 font-medium text-zinc-700">
                  Experimente: “Como posso atingir minha meta mais rápido?”
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === 'user'
                    ? 'flex justify-end'
                    : 'flex justify-start'
                }
              >
                <div
                  className={
                    message.role === 'user'
                      ? 'max-w-[80%] rounded-2xl rounded-br-md bg-violet-600 px-4 py-3 text-sm text-white'
                      : 'max-w-[85%] rounded-2xl rounded-bl-md bg-zinc-100 px-4 py-3 text-sm leading-6 text-zinc-800'
                  }
                >
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h3 className="mt-2 mb-3 text-base font-semibold">
                          {children}
                        </h3>
                      ),
                      h2: ({ children }) => (
                        <h3 className="mt-2 mb-3 text-base font-semibold">
                          {children}
                        </h3>
                      ),
                      h3: ({ children }) => (
                        <h3 className="mt-2 mb-3 text-base font-semibold">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-3 last:mb-0">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-3 list-disc space-y-1 pl-5">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-3 list-decimal space-y-2 pl-5">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => <li>{children}</li>,
                      blockquote: ({ children }) => (
                        <blockquote className="my-3 border-l-4 border-zinc-300 pl-4 text-zinc-600">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs">
                          {children}
                        </code>
                      ),
                      hr: () => <hr className="my-4 border-zinc-200" />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {isAsking && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-zinc-100 px-4 py-3 text-sm text-zinc-500">
                  Educador Financeiro está pensando...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {chatError && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {chatError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              disabled={isAsking}
              rows={3}
              placeholder="Digite sua pergunta..."
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm transition outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!question.trim() || isAsking}
              className="self-end rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAsking ? 'Enviando...' : 'Perguntar'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

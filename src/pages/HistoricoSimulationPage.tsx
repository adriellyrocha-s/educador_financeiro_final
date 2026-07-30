import { Trash2, ArrowRight, Calendar, Target, PiggyBank } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHero } from '../components/shared/PageHero'
import { useSimulationStorage } from '../hooks/useSimulationStorage'
import { calcMonthlySavings } from '../utils/simulation'

export function HistoricoSimulationPage() {
  const { simulations = [], deleteSimulation } = useSimulationStorage() || {}
  const safeSimulations = Array.isArray(simulations) ? simulations : []

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <PageHero
        title="Histórico de Simulações"
        subtitle="Acompanhe todas as suas simulações financeiras salvas anteriormente."
      />

      {safeSimulations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-100 bg-white p-12 text-center shadow-sm">
          <PiggyBank className="mb-4 h-12 w-12 text-violet-400" />
          <h3 className="text-lg font-semibold text-zinc-800">
            Nenhuma simulação encontrada
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Você ainda não salvou nenhuma simulação. Comece agora mesmo!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {safeSimulations.map((sim) => {
            const monthlySavings = calcMonthlySavings(sim)

            return (
              <div
                key={sim.id}
                className="flex flex-col rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 text-violet-600">
                      <Target size={20} />
                      <h3 className="font-semibold text-zinc-800">
                        {sim.goalName || 'Meta financeira'}
                      </h3>
                    </div>
                    <button
                      onClick={() => deleteSimulation(sim.id)}
                      className="text-zinc-400 transition-colors hover:text-red-500"
                      title="Excluir simulação"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-zinc-600">
                    <div className="flex items-center justify-between">
                      <span>Custo da Meta:</span>
                      <span className="font-medium text-zinc-800">
                        {sim.goalAmount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Prazo:</span>
                      <span className="font-medium text-zinc-800">
                        {sim.goalDeadline} meses
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Economia mensal:</span>
                      <span className="font-medium text-violet-600">
                        R${' '}
                        {monthlySavings.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Calendar size={14} />
                    {new Date(sim.createdAt || Date.now()).toLocaleDateString(
                      'pt-BR',
                    )}
                  </span>
                  <Link
                    to={`/resultados/${sim.id}`}
                    className="flex items-center gap-1.5 text-sm font-medium text-violet-600 transition-colors hover:text-violet-700"
                  >
                    Ver detalhes
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

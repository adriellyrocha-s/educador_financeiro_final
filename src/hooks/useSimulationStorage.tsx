import { useCallback, useState } from 'react'

import type {
  ConversationMessage,
  SimulationFormData,
  SimulationRecord,
  SimulationUpdate,
} from '../data/simulation'

const LOCAL_STORAGE_KEY = 'simulation-data'

const readStorage = (): SimulationRecord[] => {
  const storage = localStorage.getItem(LOCAL_STORAGE_KEY)

  if (!storage) {
    return []
  }

  try {
    return JSON.parse(storage) as SimulationRecord[]
  } catch {
    return []
  }
}

const writeStorage = (simulations: SimulationRecord[]) => {
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify(simulations),
  )
}

export const useSimulationStorage = () => {
  const [simulations, setSimulations] =
    useState<SimulationRecord[]>(readStorage)

  const saveFormData = useCallback(
    (formData: SimulationFormData) => {
      const id = crypto.randomUUID()

      const record: SimulationRecord = {
        ...formData,
        id,
        createdAt: new Date().toISOString(),
        conversation: [],
      }

      setSimulations((current) => {
        const updated = [...current, record]

        writeStorage(updated)

        return updated
      })

      return id
    },
    [],
  )

  const getFormData = useCallback((id: string) => {
    return (
      readStorage().find(
        (record) => record.id === id,
      ) ?? null
    )
  }, [])

  const updateSimulation = useCallback(
    (id: string, data: SimulationUpdate) => {
      setSimulations((current) => {
        const updated = current.map((record) =>
          record.id === id
            ? {
                ...record,
                ...data,
              }
            : record,
        )

        writeStorage(updated)

        return updated
      })
    },
    [],
  )

  const deleteSimulation = useCallback((id: string) => {
    setSimulations((current) => {
      const updated = current.filter(
        (record) => record.id !== id,
      )

      writeStorage(updated)

      return updated
    })
  }, [])

  const addConversationMessage = useCallback(
    (
      simulationId: string,
      message: ConversationMessage,
    ) => {
      setSimulations((current) => {
        const updated = current.map((record) =>
          record.id === simulationId
            ? {
                ...record,
                conversation: [
                  ...(record.conversation ?? []),
                  message,
                ],
              }
            : record,
        )

        writeStorage(updated)

        return updated
      })
    },
    [],
  )

  return {
    simulations,
    saveFormData,
    getFormData,
    updateSimulation,
    deleteSimulation,
    addConversationMessage,
  }
}
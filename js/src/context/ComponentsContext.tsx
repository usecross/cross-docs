import React, { createContext, useContext } from 'react'

interface ComponentsContextValue {
  components?: Record<string, React.ComponentType<any>>
}

const ComponentsContext = createContext<ComponentsContextValue>({})

export function ComponentsProvider({
  children,
  components,
}: {
  children: React.ReactNode
  components?: Record<string, React.ComponentType<any>>
}) {
  return (
    <ComponentsContext.Provider value={{ components }}>
      {children}
    </ComponentsContext.Provider>
  )
}

export function useComponents() {
  return useContext(ComponentsContext)
}

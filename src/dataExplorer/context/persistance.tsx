import React, {FC, createContext, useCallback} from 'react'
import {
  TimeRange,
  RecursivePartial,
  ViewProperties,
  SimpleTableViewProperties,
} from 'src/types'
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {useSessionStorage} from 'src/dataExplorer/shared/utils'
import {Bucket, TagKeyValuePair} from 'src/types'
import {
  RESOURCES,
  ResourceConnectedQuery,
} from 'src/dataExplorer/components/resources'

interface SchemaComposition {
  synced: boolean // true == can modify session's schema
  diverged: boolean // true == cannot re-sync. (e.g. user has typed in the composition block)
}

export interface SchemaSelection {
  bucket: Bucket
  measurement: string
  fields: string[]
  tagValues: TagKeyValuePair[]
  composition: SchemaComposition
}

interface ContextType {
  hasChanged: boolean
  horizontal: number[]
  vertical: number[]
  range: TimeRange

  query: string
  resource: ResourceConnectedQuery<any>
  visualization: ViewProperties

  selection: SchemaSelection

  setHasChanged: (hasChanged: boolean) => void
  setHorizontal: (val: number[]) => void
  setVertical: (val: number[]) => void
  setRange: (val: TimeRange) => void

  setQuery: (val: string) => void
  setResource: (val: ResourceConnectedQuery<any>) => void
  setVisualization: (val: ViewProperties) => void
  save: () => Promise<ResourceConnectedQuery<any>>

  setSelection: (val: RecursivePartial<SchemaSelection>) => void
  clearSchemaSelection: () => void
}

export const DEFAULT_SCHEMA: SchemaSelection = {
  bucket: null,
  measurement: null,
  fields: [] as string[],
  tagValues: [] as TagKeyValuePair[],
  composition: {
    synced: true,
    diverged: false,
  },
}

export const DEFAULT_CONTEXT = {
  hasChanged: false,
  horizontal: [0.2],
  vertical: [0.25, 0.8],
  range: DEFAULT_TIME_RANGE,

  query: '',
  resource: null,
  visualization: {
    type: 'simple-table',
    showAll: false,
  } as SimpleTableViewProperties,
  selection: JSON.parse(JSON.stringify(DEFAULT_SCHEMA)),

  setHasChanged: (_: boolean) => {},
  setHorizontal: (_: number[]) => {},
  setVertical: (_: number[]) => {},
  setRange: (_: TimeRange) => {},

  setQuery: (_: string) => {},
  setResource: (_: any) => {},
  setVisualization: (_: any) => {},
  save: () => Promise.resolve(null),

  setSelection: (_: RecursivePartial<SchemaSelection>) => {},
  clearSchemaSelection: () => {},
}

export const PersistanceContext = createContext<ContextType>(DEFAULT_CONTEXT)

export const PersistanceProvider: FC = ({children}) => {
  const [
    horizontal,
    setHorizontal,
  ] = useSessionStorage('dataExplorer.resize.horizontal', [
    ...DEFAULT_CONTEXT.horizontal,
  ])
  const [hasChanged, setHasChanged] = useSessionStorage(
    'dataExplorer.hasChanged',
    DEFAULT_CONTEXT.hasChanged
  )
  const [
    vertical,
    setVertical,
  ] = useSessionStorage('dataExplorer.resize.vertical', [
    ...DEFAULT_CONTEXT.vertical,
  ])
  const [query, setQuery] = useSessionStorage(
    'dataExplorer.query',
    DEFAULT_CONTEXT.query
  )
  const [range, setRange] = useSessionStorage(
    'dataExplorer.range',
    DEFAULT_CONTEXT.range
  )
  const [visualization, setVisualization] = useSessionStorage(
    'dataExplorer.visual',
    JSON.parse(JSON.stringify(DEFAULT_CONTEXT.visualization))
  )
  const [resource, setResource] = useSessionStorage('dataExplorer.resource', {
    type: 'scripts',
    flux: '',
    data: {},
  })
  const [selection, setSelection] = useSessionStorage(
    'dataExplorer.schema',
    JSON.parse(JSON.stringify(DEFAULT_CONTEXT.selection))
  )

  const handleSetQuery = text => {
    if (hasChanged === false) {
      setHasChanged(true)
    }
    setQuery(text)
  }

  const handleSetResource = useCallback(
    (resource: any) => {
      if (hasChanged === false) {
        setHasChanged(true)
      }
      setResource(resource)
    },
    [hasChanged, setHasChanged, setResource]
  )

  const handleSetVisualization = useCallback(
    (visualization: any) => {
      if (hasChanged === false) {
        setHasChanged(true)
      }
      setVisualization(visualization)
    },
    [hasChanged, setHasChanged, setVisualization]
  )

  const clearSchemaSelection = () => {
    setSelection(JSON.parse(JSON.stringify(DEFAULT_SCHEMA)))
  }

  const setSchemaSelection = useCallback(
    schema => {
      if (selection.composition?.diverged && schema.composition.synced) {
        return
      }
      const nextState: SchemaSelection = {
        ...selection,
        ...schema,
        composition: {
          ...(selection.composition || {}),
          ...(schema.composition || {}),
        },
      }
      if (hasChanged === false) {
        setHasChanged(true)
      }
      setSelection(nextState)
    },
    [
      hasChanged,
      selection.composition,
      selection.fields,
      selection.tagValues,
      setSelection,
    ]
  )

  const save = () => {
    if (!resource || !RESOURCES[resource.type]) {
      return Promise.resolve(null)
    }

    resource.flux = query
    resource.visual = visualization

    return RESOURCES[resource.type].persist(resource).then(data => {
      handleSetResource(data)
      setHasChanged(false)
      return data
    })
  }

  return (
    <PersistanceContext.Provider
      value={{
        hasChanged,
        horizontal,
        vertical,
        range,

        query,
        resource,
        visualization,

        selection,

        setHasChanged,
        setHorizontal,
        setVertical,
        setRange,

        setQuery: handleSetQuery,
        setResource: handleSetResource,
        setVisualization: handleSetVisualization,
        save,

        setSelection: setSchemaSelection,
        clearSchemaSelection,
      }}
    >
      {children}
    </PersistanceContext.Provider>
  )
}

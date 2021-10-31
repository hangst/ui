// Libraries
import React, {FC, useMemo} from 'react'

// Components
import {ResourceList} from '@influxdata/clockface'
import VariableCard from 'src/variables/components/VariableCard'

// Types
import {Variable} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {Sort} from '@influxdata/clockface'

// Selectors
import {getSortedResources} from 'src/shared/utils/sort'

interface Props {
  variables: Variable[]
  emptyState: JSX.Element
  onDeleteVariable: (variable: Variable) => void
  onFilterChange: (searchTerm: string) => void
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
  onSelectVariable: (variable: Variable) => void
  selectedVariablesList: Variable[]
}

const VariableList: FC<Props> = props => {
  const {
    emptyState,
    variables,
    sortKey,
    sortDirection,
    sortType,
    onDeleteVariable,
    onFilterChange,
    onSelectVariable,
  } = props

  const sortedVariables = useMemo(
    () => getSortedResources(variables, sortKey, sortDirection, sortType),
    [variables, sortKey, sortDirection, sortType]
  )

  const isVariableSelected = (variable: Variable): boolean => {
    const {selectedVariablesList} = props
    return selectedVariablesList.includes(variable)
  }

  return (
    <>
      <ResourceList>
        <ResourceList.Body emptyState={emptyState}>
          {sortedVariables.map((variable, index) => (
            <VariableCard
              key={variable.id || `variable-${index}`}
              variable={variable}
              onDeleteVariable={onDeleteVariable}
              onFilterChange={onFilterChange}
              onSelectVariableCard={onSelectVariable}
              isSelected={isVariableSelected(variable)}
            />
          ))}
        </ResourceList.Body>
      </ResourceList>
    </>
  )
}

export default VariableList

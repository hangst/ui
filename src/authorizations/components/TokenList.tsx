// Libraries
import React, {PureComponent, RefObject} from 'react'
import memoizeOne from 'memoize-one'
import isEqual from 'lodash/isEqual'

// Components
import {Overlay, PaginationNav, ResourceList, Sort} from '@influxdata/clockface'
import {TokenRow} from 'src/authorizations/components/TokenRow'
import EditTokenOverlay from 'src/authorizations/components/EditTokenOverlay'

// Types
import {Authorization} from 'src/types'
// Utils
import {getSortedResources, SortTypes} from 'src/shared/utils/sort'
import {SelectionState} from './TokensTab'

type SortKey = keyof Authorization

interface Props {
  auths: Authorization[]
  emptyState: JSX.Element
  pageHeight: number
  pageWidth: number
  searchTerm: string
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
  tokenCount: number
  onClickColumn: (nextSort: Sort, sortKey: SortKey) => void
  batchSelectionState: SelectionState
  updateTokensSelected: (tokens: Authorization[]) => void
  totalTokens: (total: number) => void
}

interface State {
  isTokenOverlayVisible: boolean
  authInView: Authorization

  selectedTokens: Authorization[]
}

export default class TokenList extends PureComponent<Props, State> {
  private memGetSortedResources = memoizeOne<typeof getSortedResources>(
    getSortedResources
  )

  private paginationRef: RefObject<HTMLDivElement>
  public currentPage: number = 1
  public rowsPerPage: number = 10
  public totalPages: number

  constructor(props) {
    super(props)
    this.state = {
      isTokenOverlayVisible: false,
      authInView: null,
      selectedTokens: [],
    }
  }

  public componentDidMount() {
    const params = new URLSearchParams(window.location.search)
    const urlPageNumber = parseInt(params.get('page'), 10)

    const passedInPageIsValid =
      urlPageNumber && urlPageNumber <= this.totalPages && urlPageNumber > 0

    if (passedInPageIsValid) {
      this.currentPage = urlPageNumber
    }
  }

  public componentDidUpdate(prevProps) {
    // if the user filters the list while on a page that is
    // outside the new filtered list put them on the last page of the new list
    if (this.currentPage > this.totalPages) {
      this.paginate(this.totalPages)
    }

    const {auths: prevAuths} = prevProps
    const {auths: nextAuths} = this.props

    if (!isEqual(prevAuths, nextAuths)) {
      const authInView = nextAuths.find(
        auth => auth.id === this.state.authInView?.id
      )
      this.setState({authInView})
    }

    const {batchSelectionState: prevBatchSelectionState} = prevProps
    const {batchSelectionState} = this.props

    if (!isEqual(prevBatchSelectionState, batchSelectionState)) {
      this.updateSelectedTokens()
    }


    const startIndex = this.rowsPerPage * Math.max(this.currentPage - 1, 0)
    const endIndex = Math.min(
      startIndex + this.rowsPerPage,
      this.props.tokenCount
    )

    this.props.updateTokensSelected(this.state.selectedTokens)
    this.props.totalTokens(endIndex - startIndex)
  }

  public render() {
    const {isTokenOverlayVisible, authInView} = this.state
    this.totalPages = Math.max(
      Math.ceil(this.props.auths.length / this.rowsPerPage),
      1
    )

    return (
      <>
        <ResourceList style={{width: this.props.pageWidth}}>
          <ResourceList.Body
            emptyState={this.props.emptyState}
            style={{
              maxHeight: this.props.pageHeight,
              minHeight: this.props.pageHeight,
              overflow: 'auto',
            }}
            testID="token-list"
          >
            {this.rows}
          </ResourceList.Body>
        </ResourceList>
        <PaginationNav.PaginationNav
          ref={this.paginationRef}
          style={{width: this.props.pageWidth}}
          totalPages={this.totalPages}
          currentPage={this.currentPage}
          pageRangeOffset={1}
          onChange={this.paginate}
        />
        <Overlay visible={isTokenOverlayVisible}>
          <EditTokenOverlay
            auth={authInView}
            onDismissOverlay={this.handleDismissOverlay}
          />
        </Overlay>
      </>
    )
  }

  public paginate = page => {
    this.currentPage = page
    const url = new URL(location.href)
    url.searchParams.set('page', page)
    history.replaceState(null, '', url.toString())
    this.forceUpdate()
  }

  private get rows(): JSX.Element[] {
    const {auths, sortDirection, sortKey, sortType} = this.props
    const sortedAuths = this.memGetSortedResources(
      auths,
      sortKey,
      sortDirection,
      sortType
    )

    const startIndex = this.rowsPerPage * Math.max(this.currentPage - 1, 0)
    const endIndex = Math.min(
      startIndex + this.rowsPerPage,
      this.props.tokenCount
    )

    const paginatedAuths = []
    for (let i = startIndex; i < endIndex; i++) {
      const auth = sortedAuths[i]

      if (auth) {
        paginatedAuths.push(
          <TokenRow
            key={auth.id}
            auth={auth}
            onClickDescription={this.handleClickDescription}
            handleChangeSelectedTokens={this.handleTokenCardCheckboxClick}
            cardSelected={this.state.selectedTokens.includes(auth)}
          />
        )
      }
    }

    return paginatedAuths
  }

  private handleTokenCardCheckboxClick = (token: Authorization) => {
    const tokenAlreadySelected = this.state.selectedTokens.includes(token)

    if (tokenAlreadySelected) {
      const updatedTokensList = this.state.selectedTokens.filter(
        tokenA => tokenA !== token
      )
      this.setState({
        selectedTokens: updatedTokensList,
      })
    } else {
      this.setState({selectedTokens: [...this.state.selectedTokens, token]})
    }
  }

  private updateSelectedTokens = () => {
    const {auths, sortDirection, sortKey, sortType} = this.props
    const sortedAuths = this.memGetSortedResources(
      auths,
      sortKey,
      sortDirection,
      sortType
    )

    const startIndex = this.rowsPerPage * Math.max(this.currentPage - 1, 0)
    const endIndex = Math.min(
      startIndex + this.rowsPerPage,
      this.props.tokenCount
    )

    const currentSelectionState = this.props.batchSelectionState

    switch (currentSelectionState) {
      case SelectionState.NoneSelected:
        this.setState({selectedTokens: []})
        break
      case SelectionState.SomeSelected:
        break
      case SelectionState.AllSelected:
        this.setState({selectedTokens: sortedAuths.slice(startIndex, endIndex)})
        break
    }
  }

  private handleDismissOverlay = () => {
    this.setState({isTokenOverlayVisible: false})
  }

  private handleClickDescription = (authID: string): void => {
    const authInView = this.props.auths.find(a => a.id === authID)
    this.setState({isTokenOverlayVisible: true, authInView})
  }
}

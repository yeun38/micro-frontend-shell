import { Component, ReactNode } from 'react'

interface Props {
  name: string
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class RemoteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="remote-error">
          <span>⚠️ {this.props.name} 로드 실패</span>
          <small>{this.state.error?.message}</small>
        </div>
      )
    }
    return this.props.children
  }
}

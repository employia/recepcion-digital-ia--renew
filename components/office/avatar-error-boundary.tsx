"use client"

import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  /** Rendered instead of the 3D model if loading/parsing throws. */
  fallback: ReactNode
  /** Employee id, used only for console diagnostics. */
  employeeId: string
}

interface State {
  hasError: boolean
}

/**
 * React error boundaries are the only way to catch render-time errors thrown
 * by useGLTF/GLTFLoader (a corrupt file, a failed fetch, a decode failure).
 * Suspense alone does NOT catch these — an uncaught error here would
 * previously unmount the entire <Canvas> tree, taking every employee down
 * with it instead of just the one broken avatar.
 */
export class AvatarErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error(`[office] Avatar model failed to load for "${this.props.employeeId}":`, error)
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

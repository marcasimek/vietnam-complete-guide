import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

/**
 * Chyba v jedné části aplikace nesmí zhasnout celou obrazovku.
 * Uživatel musí vidět, co se stalo, a mít cestu dál — offline v horách
 * je bílá stránka to poslední, co potřebuje.
 */
interface Props {
  children: ReactNode
  /** Kde k chybě došlo — pomáhá uživateli i nám. */
  where?: string
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Do konzole, ne k uživateli — a rozhodně nikam ven.
    console.error('Chyba v aplikaci:', this.props.where ?? 'neznámé místo', error, info.componentStack)
  }

  private reset = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="page">
        <div className="empty">
          <span className="empty__icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3.8 2.8 20h18.4L12 3.8Zm0 5.6v4.8m0 2.8v.1" />
            </svg>
          </span>
          <h2>Tuhle část se nepodařilo zobrazit</h2>
          <div className="empty__body small muted">
            <p>
              Něco se v datech nebo v aplikaci pokazilo{this.props.where ? ` (${this.props.where})` : ''}.
              Zbytek aplikace funguje dál — uložené položky, poznámky ani stav rezervací se neztratily.
            </p>
            <p className="errbox">{error.message}</p>
          </div>
          <div className="chip-row" style={{ justifyContent: 'center' }}>
            <button type="button" className="btn btn--primary btn--sm" onClick={this.reset}>
              Zkusit znovu
            </button>
            <a className="btn btn--ghost btn--sm" href={`${import.meta.env.BASE_URL}#/plan`} onClick={this.reset}>
              Zpátky na plán
            </a>
          </div>
        </div>
      </div>
    )
  }
}

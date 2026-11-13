
import { useOutletContext } from 'react-router-dom'

export interface PublicPageContext {
  championshipId: string
  seasonId: string
}

export function usePublicContext(): PublicPageContext {
  return useOutletContext<PublicPageContext>()
}

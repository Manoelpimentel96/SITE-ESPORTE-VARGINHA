
interface PageHeadingProps {
  title: string
  description: string
}

interface PublicMessageProps {
  message: string
}

export function PageHeading({
  title,
  description,
}: PageHeadingProps) {
  return (
    <header className="public-page-heading">
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  )
}

export function PublicEmpty({
  message,
}: PublicMessageProps) {
  return (
    <div className="public-empty" role="status">
      <p>{message}</p>
    </div>
  )
}

export function PublicError({
  message,
}: PublicMessageProps) {
  return (
    <div className="public-error" role="alert">
      <strong>Não foi possível carregar os dados.</strong>
      <p>{message}</p>
    </div>
  )
}

export function PublicLoading() {
  return (
    <div className="public-loading" role="status">
      <span>Carregando informações...</span>
    </div>
  )
}

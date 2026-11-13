
export interface DatabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

const databaseMessages: Record<string, string> = {
  '23505': 'Já existe um registro com esses dados.',
  '23503': 'Existem registros vinculados que impedem esta operação.',
  '23502': 'Um campo obrigatório não foi preenchido.',
  '42501': 'Você não possui permissão para realizar esta operação.',
  '22P02': 'Um dos valores informados possui formato inválido.',
  PGRST116: 'O registro solicitado não foi encontrado.',
}

export class AppError extends Error {
  public readonly code: string
  public readonly details?: string
  public readonly hint?: string

  constructor(
    message: string,
    code = 'APPLICATION_ERROR',
    details?: string,
    hint?: string,
  ) {
    super(message)

    this.name = 'AppError'
    this.code = code
    this.details = details
    this.hint = hint

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export function handleDatabaseError(error: DatabaseError): AppError {
  const friendlyMessage =
    databaseMessages[error.code ?? ''] ?? error.message

  return new AppError(
    friendlyMessage,
    error.code ?? 'DATABASE_ERROR',
    error.details,
    error.hint,
  )
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    const extraDetails = error.details
      ? ` Detalhes: ${error.details}`
      : ''

    const extraHint = error.hint
      ? ` Orientação: ${error.hint}`
      : ''

    return `${error.message}${extraDetails}${extraHint}`
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocorreu um erro inesperado. Verifique os dados e tente novamente.'
}

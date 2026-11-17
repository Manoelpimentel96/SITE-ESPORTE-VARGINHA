
import type {
  CollaboratorFormData,
  CollaboratorRole,
} from './collaborators.types.js'

const allowedRoles: CollaboratorRole[] = [
  'admin',
  'organizer',
  'editor',
  'viewer',
]

function onlyNumbers(value: string) {
  return value.replace(/\D/g, '')
}

function isValidCpf(value: string): boolean {
  const cpf = onlyNumbers(value)

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  const calculateDigit = (base: string, factor: number) => {
    let total = 0

    for (const digit of base) {
      total += Number(digit) * factor
      factor--
    }

    const remainder = (total * 10) % 11

    return remainder === 10 ? 0 : remainder
  }

  const firstDigit = calculateDigit(cpf.slice(0, 9), 10)
  const secondDigit = calculateDigit(cpf.slice(0, 10), 11)

  return (
    firstDigit === Number(cpf[9]) &&
    secondDigit === Number(cpf[10])
  )
}

export function validateCollaborator(
  data: CollaboratorFormData,
  isEditing: boolean,
): void {
  if (!data.name.trim()) {
    throw new Error('Informe o nome do colaborador.')
  }

  if (!isValidCpf(data.cpf)) {
    throw new Error('Informe um CPF válido.')
  }

  if (!data.email.trim()) {
    throw new Error('Informe o e-mail de acesso.')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    throw new Error('Informe um endereço de e-mail válido.')
  }

  if (!allowedRoles.includes(data.role)) {
    throw new Error('O perfil de acesso informado não é permitido.')
  }

  if (!isEditing && data.password.length < 12) {
    throw new Error(
      'A senha inicial deve possuir pelo menos 12 caracteres.',
    )
  }

  if (isEditing && data.password && data.password.length < 12) {
    throw new Error(
      'A nova senha deve possuir pelo menos 12 caracteres.',
    )
  }

  if (data.name.trim().length > 150) {
    throw new Error('O nome deve ter no máximo 150 caracteres.')
  }

  if (data.cargo.trim().length > 100) {
    throw new Error('O cargo deve ter no máximo 100 caracteres.')
  }
}

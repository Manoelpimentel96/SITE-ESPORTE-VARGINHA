/**
 * Utilitários de apresentação da página de estatísticas.
 *
 * Contém apenas formatação e rótulos usados pelos componentes.
 * Nenhuma regra de negócio fica aqui: os números vêm prontos do backend.
 */

/**
 * Tema de cada categoria.
 * É aplicado pela classe CSS "statistics-tone--<tema>" (veja StatisticsPage.css).
 */
export type StatisticsTone =
  | 'neutral'
  | 'goal'
  | 'assist'
  | 'yellow'
  | 'red'

const decimalFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Número com duas casas e vírgula decimal (ex.: 2,50). */
export function formatDecimal(value: number): string {
  return decimalFormat.format(value)
}

/** Escolhe singular ou plural conforme a quantidade (1 gol, 2 gols). */
export function pluralize(
  total: number,
  singular: string,
  plural: string,
): string {
  return total === 1 ? singular : plural
}

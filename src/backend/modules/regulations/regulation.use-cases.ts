import type { RegulationRepository } from './regulation.repository.js'
import type {
  Regulation,
  RegulationFormData,
  RegulationListFilters
} from './regulation.types.js'
import { assertValidRegulation } from './regulation.validation.js'

export class RegulationUseCases {
  private readonly repository: RegulationRepository

  constructor(repository: RegulationRepository) {
    this.repository = repository
  }

  list(filters?: RegulationListFilters) {
    return this.repository.list(filters)
  }

  getById(id: string) {
    return this.repository.getById(id)
  }

  getBySeasonId(seasonId: string) {
    return this.repository.getBySeasonId(seasonId)
  }

  async save(
    data: RegulationFormData,
    id?: string,
  ): Promise<Regulation> {
    const normalized = this.normalize(data)

    if (id) {
      const current = await this.repository.getById(id)

      if (!current) {
        throw new Error('Regulamento não encontrado.')
      }

      if (
        current.status === 'published' &&
        await this.repository.hasCompetitionActivity(
          current.seasonId,
        ) &&
        this.structureChanged(current, normalized)
      ) {
        throw new Error(
          'A estrutura do regulamento não pode ser alterada após o início das atividades da competição.',
        )
      }

      return this.repository.update(id, normalized)
    }

    const existing = await this.repository.getBySeasonId(
      normalized.seasonId,
    )

    if (existing) {
      throw new Error(
        'Esta temporada já possui um regulamento principal.',
      )
    }

    return this.repository.create(normalized)
  }

  validate(data: RegulationFormData) {
    assertValidRegulation(this.normalize(data))

    return {
      valid: true as const,
    }
  }

  async publish(id: string): Promise<Regulation> {
    const regulation = await this.repository.getById(id)

    if (!regulation) {
      throw new Error('Regulamento não encontrado.')
    }

    assertValidRegulation(this.toFormData(regulation))

    return this.repository.updateStatus(id, 'published')
  }

  async unpublish(id: string): Promise<Regulation> {
    const regulation = await this.repository.getById(id)

    if (!regulation) {
      throw new Error('Regulamento não encontrado.')
    }

    if (
      await this.repository.hasCompetitionActivity(
        regulation.seasonId,
      )
    ) {
      throw new Error(
        'Não é possível retirar a publicação após o início das atividades da competição.',
      )
    }

    return this.repository.updateStatus(id, 'draft')
  }

  delete(id: string) {
    return this.repository.delete(id)
  }

  private normalize(
    data: RegulationFormData,
  ): RegulationFormData {
    return {
      ...data,
      seasonId: data.seasonId.trim(),
      tieBreakers: [...new Set(data.tieBreakers)],
      phases: [...data.phases].sort(
        (a, b) => a.order - b.order,
      ),
      groupSettings: { ...data.groupSettings },
      classificationSettings: {
        ...data.classificationSettings,
        orderBy: [...data.classificationSettings.orderBy],
      },
      knockoutSettings: { ...data.knockoutSettings },
      matchSettings: { ...data.matchSettings },
      disciplineSettings: { ...data.disciplineSettings },
      substitutionSettings: { ...data.substitutionSettings },
      generalSettings: { ...data.generalSettings },
    }
  }

  private toFormData(
    regulation: Regulation,
  ): RegulationFormData {
    const data: Partial<Regulation> = {
      ...regulation,
    }

    delete data.id
    delete data.createdAt
    delete data.updatedAt
    delete data.publishedAt

    return data as RegulationFormData
  }

  private structureChanged(
    current: Regulation,
    next: RegulationFormData,
  ): boolean {
    return (
      current.format !== next.format ||
      JSON.stringify(current.phases) !==
        JSON.stringify(next.phases) ||
      JSON.stringify(current.groupSettings) !==
        JSON.stringify(next.groupSettings) ||
      JSON.stringify(current.knockoutSettings) !==
        JSON.stringify(next.knockoutSettings) ||
      JSON.stringify(current.matchSettings) !==
        JSON.stringify(next.matchSettings)
    )
  }
}

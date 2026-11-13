export type RegulationStatus = 'draft' | 'published'

export type RegulationFormat =
  | 'league_home_away'
  | 'league_single'
  | 'groups'
  | 'knockout'
  | 'groups_knockout'
  | 'league_knockout'
  | 'custom'

export type TieBreaker =
  | 'wins'
  | 'goal_difference'
  | 'goals_for'
  | 'head_to_head'
  | 'fewest_goals_against'
  | 'fair_play'
  | 'draw'

export type PhaseType =
  | 'league'
  | 'groups'
  | 'knockout'
  | 'final'
  | 'other'

export interface CompetitionPhase {
  key: string
  name: string
  type: PhaseType
  order: number
  legs: 'single' | 'home_away'
  teamsQualified?: number
  thirdPlaceMatch?: boolean
  settings?: Record<string, unknown>
}

export interface GroupSettings {
  groupCount: number
  teamsPerGroup: number | null
  matchesPerPairing: 'single' | 'home_away'
  qualifiedPerGroup: number
  bestThirdPlaceCount: number
  distribution: 'balanced' | 'manual'
}

export interface ClassificationSettings {
  totalQualified: number | null
  orderBy: TieBreaker[]
  headToHeadMiniTable: boolean
}

export interface KnockoutSettings {
  firstRound: string
  legs: 'single' | 'home_away'
  aggregateEnabled: boolean
  awayGoalsRule: boolean
  extraTimeEnabled: boolean
  penaltyShootoutEnabled: boolean
  finalSingleMatch: boolean
}

export interface MatchSettings {
  legs: 'single' | 'home_away'
  homeAdvantage: boolean
  matchDurationMinutes: number
  halfDurationMinutes: number
  intervalMinutes: number
  allowSameDayMatches: boolean
  minimumRestHours: number
}

export interface DisciplineSettings {
  yellowCardSuspensionAfter: number
  yellowCardsResetAtStage: boolean
  yellowCardsResetAtKnockout: boolean
  redCardAutomaticSuspension: boolean
  redCardSuspensionMatches: number
  disciplinaryReview: boolean
  notes: string
}

export interface SubstitutionSettings {
  limit: number
  windows: number | null
  halftimeDoesNotCountAsWindow: boolean
  specialRules: string
}

export interface GeneralSettings {
  participationRequirements: string
  administrativeProcedures: string
  additionalProvisions: string
  officialText: string
}

export interface Regulation {
  id: string
  seasonId: string
  status: RegulationStatus
  format: RegulationFormat
  pointsWin: number
  pointsDraw: number
  pointsLoss: number
  tieBreakers: TieBreaker[]
  groupSettings: GroupSettings
  classificationSettings: ClassificationSettings
  knockoutSettings: KnockoutSettings
  matchSettings: MatchSettings
  phases: CompetitionPhase[]
  disciplineSettings: DisciplineSettings
  substitutionSettings: SubstitutionSettings
  generalSettings: GeneralSettings
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type RegulationFormData = Omit<
  Regulation,
  'id' | 'publishedAt' | 'createdAt' | 'updatedAt'
>

export type RegulationValidationErrors = Partial<
  Record<string, string>
>

export interface RegulationListFilters {
  seasonId?: string
}

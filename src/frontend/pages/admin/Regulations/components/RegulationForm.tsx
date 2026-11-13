import type { RegulationFormData } from '../../../../../services/regulations/regulationService'

import CompetitionFormatForm from './CompetitionFormatForm'
import ScoringForm from './ScoringForm'
import ClassificationForm from './ClassificationForm'
import GroupsForm from './GroupsForm'
import PhasesForm from './PhasesForm'
import KnockoutForm from './KnockoutForm'
import MatchSettingsForm from './MatchSettingsForm'
import DisciplineForm from './DisciplineForm'
import SubstitutionForm from './SubstitutionForm'
import GeneralSettingsForm from './GeneralSettingsForm'

interface RegulationFormProps {
  form: RegulationFormData
  onChange: (form: RegulationFormData) => void
}

export default function RegulationForm({
  form,
  onChange,
}: RegulationFormProps) {
  return (
    <div className="regulation-form">
      <CompetitionFormatForm form={form} onChange={onChange} />
      <ScoringForm form={form} onChange={onChange} />
      <ClassificationForm form={form} onChange={onChange} />
      <GroupsForm form={form} onChange={onChange} />
      <PhasesForm form={form} onChange={onChange} />
      <KnockoutForm form={form} onChange={onChange} />
      <MatchSettingsForm form={form} onChange={onChange} />
      <DisciplineForm form={form} onChange={onChange} />
      <SubstitutionForm form={form} onChange={onChange} />
      <GeneralSettingsForm form={form} onChange={onChange} />
    </div>
  )
}

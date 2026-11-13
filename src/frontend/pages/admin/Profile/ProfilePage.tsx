import { useState } from 'react'

import AdminPageHeader from '../../../components/admin/PageHeader/AdminPageHeader'

import ProfilePersonalInfoForm from './components/ProfilePersonalInfoForm'
import ProfileSecurityForm from './components/ProfileSecurityForm'

import '../../../../styles/admin/ProfilePage.css'

export interface ProfileFormData {
  name: string
  cpf: string
  email: string
  phone: string
  cargo: string
}

export interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const initialProfileData: ProfileFormData = {
  name: '',
  cpf: '',
  email: '',
  phone: '',
  cargo: '',
}

const initialPasswordData: PasswordFormData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export default function ProfilePage() {
  const [profileData, setProfileData] =
    useState<ProfileFormData>(initialProfileData)

  const [passwordData, setPasswordData] =
    useState<PasswordFormData>(initialPasswordData)

  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  function handleProfileChange(
    field: keyof ProfileFormData,
    value: string,
  ) {
    setProfileData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handlePasswordChange(
    field: keyof PasswordFormData,
    value: string,
  ) {
    setPasswordData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setProfileMessage(
      'Os dados serão salvos quando a integração da conta estiver habilitada.',
    )
  }

  function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setPasswordMessage(
      'A alteração de senha será habilitada junto à integração de autenticação.',
    )
  }

  return (
    <div className="admin-module-page profile-page">
      <AdminPageHeader
        title="Meu perfil"
        description="Informações e configurações da conta do colaborador."
      />

      <div className="profile-page__content">
        <section className="profile-section">
          <div className="profile-section__heading">
            <div>
              <h2>Informações pessoais</h2>
              <p>
                Consulte e atualize os dados utilizados na sua conta.
              </p>
            </div>
          </div>

          <ProfilePersonalInfoForm
            data={profileData}
            message={profileMessage}
            onChange={handleProfileChange}
            onSubmit={handleProfileSubmit}
          />
        </section>

        <section className="profile-section">
          <div className="profile-section__heading">
            <div>
              <h2>Segurança da conta</h2>
              <p>
                Gerencie a senha utilizada para acessar o painel
                administrativo.
              </p>
            </div>
          </div>

          <ProfileSecurityForm
            data={passwordData}
            message={passwordMessage}
            onChange={handlePasswordChange}
            onSubmit={handlePasswordSubmit}
          />
        </section>

        <section className="profile-information">
          <div className="profile-information__icon">
            <span aria-hidden="true">i</span>
          </div>

          <div>
            <h3>Sobre os dados da sua conta</h3>
            <p>
              Suas informações pessoais e permissões serão carregadas
              diretamente da conta autenticada. As alterações serão
              disponibilizadas após a integração com os serviços de conta.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

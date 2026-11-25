// Tipos da página pública: Jogadores.

export type PublicPlayer = {
  id: string
  name: string
  position: string | null
  photoUrl: string | null
  shirtNumber: number | null
  teamName: string
  registrationId: string
}

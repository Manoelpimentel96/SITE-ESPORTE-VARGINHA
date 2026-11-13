
import { useCallback, useEffect, useState } from 'react'

interface ResourceState<T> {
  key: string
  data: T | null
  error: string
}

interface PublicResource<T> {
  data: T | null
  loading: boolean
  error: string
}

export function usePublicResource<T>(
  key: string,
  loader: () => Promise<T>,
): PublicResource<T> {
  const [resource, setResource] = useState<ResourceState<T> | null>(null)

  const load = useCallback(() => {
    let active = true

    loader()
      .then((data) => {
        if (active) {
          setResource({ key, data, error: '' })
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setResource({
            key,
            data: null,
            error:
              reason instanceof Error
                ? reason.message
                : 'Não foi possível carregar as informações.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [key, loader])

  useEffect(() => load(), [load])

  if (!resource || resource.key !== key) {
    return { data: null, loading: true, error: '' }
  }

  return {
    data: resource.data,
    loading: false,
    error: resource.error,
  }
}

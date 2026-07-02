import { getUserState } from '../../utils/user-state'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  return getUserState(config.appUserId)
})

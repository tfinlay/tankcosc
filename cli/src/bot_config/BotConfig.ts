import * as yup from 'yup'

export interface BotConfig {
  server: string
  key: string
  command: string
  cwd: string
}

export const BotConfigSchema = yup.object().shape({
  server: yup.string().required().url(),
  key: yup.string().required(),
  command: yup.string().required(),
  cwd: yup.string().optional()
})
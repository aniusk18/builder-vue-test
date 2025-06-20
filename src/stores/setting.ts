export type SettingsValue = {
  theme: 'dark' | 'light'
}

export const settings = persistentMap<SettingsValue>('settings_', {
  theme: 'light'
})

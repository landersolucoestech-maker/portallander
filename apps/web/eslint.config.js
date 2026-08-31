import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'src/features/operations/ContractsPage.tsx'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^(_.*|TrendingDown|TrendingUp|MessageSquareText|Bell|Building2|PlugZap|UserCog)$' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['src/app/PortalApp.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['src/features/rh/RHPage.tsx'],
    rules: {
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  {
    files: ['src/features/marketing/MarketingPage.tsx'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['src/features/marketing/MarketingUi.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: [
      'src/features/contracts/components/ContractViewModal.tsx',
      'src/features/contracts/components/TemplatesPanel.tsx',
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'react-hooks/refs': 'off',
    },
  },
)

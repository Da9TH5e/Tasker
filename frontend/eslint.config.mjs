import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist/**', '.next/**']),
  {
    files: ['**/*.{ts,tsx,mts}'],
    extends: [tseslint.configs.recommended],
  },
])

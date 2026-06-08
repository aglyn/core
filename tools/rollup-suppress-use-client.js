/**
 * Rollup config plugin to suppress "use client" module-level directive warnings.
 *
 * When bundling libraries that import MUI components, rollup emits hundreds of
 * MODULE_LEVEL_DIRECTIVE warnings (one per MUI file). These are non-fatal,
 * completely expected, and flood the build log — hiding real errors.
 * This plugin silences them.
 */
module.exports = function suppressUseClientWarnings(config) {
  const originalOnwarn = config.onwarn

  config.onwarn = function (warning, warn) {
    // Suppress "use client" and "use server" module directive warnings
    if (
      warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
      warning.message &&
      (warning.message.includes('"use client"') ||
        warning.message.includes('"use server"'))
    ) {
      return
    }
    if (originalOnwarn) {
      originalOnwarn(warning, warn)
    } else {
      warn(warning)
    }
  }

  return config
}

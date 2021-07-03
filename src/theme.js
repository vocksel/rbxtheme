import hexRgb from 'hex-rgb'
import { ROBLOX_VSCODE_THEME_MAP, ROBLOX_TOKEN_SCOPE_MAP } from './constants'

const hexRgbAsArray = (hex) => {
    const color = hexRgb(hex)
    return [ color.red, color.green, color.blue, color.alpha ]
}

// Returns a dictionary that maps each scope to its associated color.
const getScopeColors = (theme) => {
    const colors = {}

    for (const token of theme.tokenColors) {
        const color = token.settings.foreground

        if (color) {
            // The token scope can either be an array of strings, or a string. This
            // handles both cases.
            if (Array.isArray(token.scope)) {
                for (const scope of token.scope) {
                    colors[scope] = color
                }
            } else {
                colors[token.scope] = color
            }
        }
    }

    return colors
}

export const getAvailableThemes = async () => {
    const extensionsPath = path.join(os.homedir(), '.vscode/extensions/')
    const extensions = await readdir(extensionsPath)

    const themes = []

    for (const extension of extensions) {
        const extensionPath = path.join(extensionsPath, extension)
        const stats = await stat(extensionPath)

        if (stats.isDirectory()) {
            const items = await readdir(extensionPath)
            const themesFolder = items.find(item => item === 'themes') 

            if (themesFolder) {
                const themesPath = path.join(extensionPath, 'themes')
                const themeFiles = await readdir(themesPath)

                for (const themeFile of themeFiles) {
                    if (themeFile.endsWith('.json')) {
                        const themePath = path.join(themesPath, themeFile)
                        
                        let theme
                        try {
                            theme = JSON5.parse(await readFile(themePath))
                        } catch {
                            // Ignore
                        }

                        if (theme?.name) {
                            themes.push({
                                name: theme.name,
                                path: themePath,
                            })
                        }
                    }
                }
            }
        }
    }

    return themes
}

export const getThemeFromName = async (themeName) => {
    // Check if the theme exists in the cwd first so that we can easily test any theme file.
    const relativeTheme = fs.existsSync(themeName)
    
    if (relativeTheme) {
        return themeName
    } else {
        const themes = await getAvailableThemes()
        const theme = themes.find(theme => themeName === theme.name)

        if (theme) {
            return theme.path
        }
    }
}

export const getBaseColors = (theme) => {
    let colors = {}
    const missing = []
    for (const [studioName, colorName] of Object.entries(ROBLOX_VSCODE_THEME_MAP)) {
        const color = theme.colors[colorName]
        if (color) {
            colors[studioName] = hexRgbAsArray(color)
        } else {
            missing.push(studioName)
        }
    }
    return [colors, missing]
}

export const getTokenColors = (theme) => {
    const scopeColors = getScopeColors(theme)
    const colors = {}
    const missing = []

    for (const [studioName, scopes] of Object.entries(ROBLOX_TOKEN_SCOPE_MAP)) {
        let color

        for (const scope of scopes) {
            const maybeColor = scopeColors[scope]
            if (maybeColor) {
                color = maybeColor
                break
            }
        }

        if (color) {
            colors[studioName] = hexRgbAsArray(color)
        } else {
            const global = theme.tokenColors.find(token => token.scope === undefined)

            if (global) {
                color = global.settings.foreground
            } else {
                missing.push(studioName)
            }
        }
    }

    return [colors, missing]
}

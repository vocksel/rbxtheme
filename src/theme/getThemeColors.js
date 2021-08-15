import { ROBLOX_VSCODE_THEME_MAP } from '../constants.js'
import getScopeColors from './getScopeColors.js'
import toRGB from './toRGB.js'

const getThemeColors = (theme) => {
    const colors = {}
    const missing = []

    for (const [studioName, vscodeColors] of Object.entries(ROBLOX_VSCODE_THEME_MAP)) {
        let color

        for (const vscodeColor of vscodeColors) {
            // TODO: Some default themes like Dark+ have an "include" field,
            // which points to another theme files. Add support for that.

            if (theme.colors) {
                color = theme.colors[vscodeColor]
            }

            if (!color) {
                // The color doesn't exist in the root list of theme colors. Let's
                // look through the tokenColors array.
                const scopeColors = getScopeColors(theme)
                color = scopeColors[vscodeColor]
            }

            // Ok, not there either. Does the theme have global colors?
            if (!color) {
                const global = theme.tokenColors.find(token => token.scope === undefined)

                if (global) {
                    color = global.settings.foreground
                }
            }

            if (color) {
                break
            }
        }

        if (color) {
            colors[studioName] = toRGB(theme, color)
        } else {
            missing.push(studioName)
        }
    }

    return [colors, missing]
}

export default getThemeColors
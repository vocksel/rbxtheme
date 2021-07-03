import path from 'path'
import os from 'os'
import hexRgb from 'hex-rgb'
import JSON5 from 'json5'
import { readdir, stat, readFile } from 'fs/promises'
import { ROBLOX_VSCODE_THEME_MAP, ROBLOX_TOKEN_SCOPE_MAP } from './constants.js' 
import Table from 'cli-table3'

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

    const availableThemes = []

    for (const extension of extensions) {
        const extensionPath = path.join(extensionsPath, extension)
        const stats = await stat(extensionPath)

        if (stats.isDirectory()) {
            let file
            try {
                file = await readFile(path.join(extensionPath, 'package.json'))
            } catch (e) {
                // ignore
            }

            if (file) {
                const pkg = JSON5.parse(file)
                const { themes } = pkg.contributes
    
                if (themes) {
                    for (const theme of themes) {
                        availableThemes.push({
                            name: theme.label,
                            path: path.resolve(extensionPath, theme.path),
                        })
                    }
                }
            }
        }
    }

    return availableThemes
}

export const getThemeFromName = async (themeName) => {
    // The user can optionally supply a path to a theme file directly.
    if (themeName.endsWith('.json')) {
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

// Splits an array into sub-arrays, where the length of the sub-arrays
const arrayToTable = (array, columns=3) => {
    // Split the array into an array of arrays, where each sub-array has the first `rows` number of elements from the first array.

    let rows = 0
    return array.reduce((acc, value, index) => {
        const columnIndex = index % columns

        if (columnIndex === 0) {
            acc.push([ value ])
            rows++
        } else {
            acc[rows - 1].push(value)
        }

        return acc
    }, [])
}

export const logArray = (array) => {
    const table = new Table()

    table.push(
        ...arrayToTable(array, 3)
    )

    console.log(table.toString())
}
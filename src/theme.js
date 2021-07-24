import path from 'path'
import os from 'os'
import hexRgb from 'hex-rgb'
import JSON5 from 'json5'
import { readdir, stat, readFile } from 'fs/promises'
import { ROBLOX_VSCODE_THEME_MAP } from './constants.js'
import Table from 'cli-table3'

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
        const theme = themes.find(theme => themeName.toLowerCase() === theme.name.toLowerCase())

        if (theme) {
            return theme.path
        }
    }
}

const toRGB = (theme, hex) => {
    const { red, green, blue, alpha } = hexRgb(hex)

    // VSCode allows the use of alpha with RGB values. Roblox does not support
    // this, so to keep themes looking consistent the color is blended with the
    // background.
    if (alpha < 1) {
        const background = hexRgb(theme.colors['editor.background'] || '#fff')

        if (background) {
            return [
                (1 - alpha) * background.red + alpha * red,
                (1 - alpha) * background.green + alpha * green,
                (1 - alpha) * background.blue + alpha * blue,
            ]
        }
    }

    return [red, green, blue ]
}

const getThemeColors = (theme) => {
    const colors = {}
    const missing = []

    for (const [studioName, vscodeColors] of Object.entries(ROBLOX_VSCODE_THEME_MAP)) {
        let color

        for (const vscodeColor of vscodeColors) {
            color = theme.colors[vscodeColor]

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

    return [ colors, missing ]
}

// Split the array into an array of arrays, where each sub-array has the first
// `columns` number of elements from the first array. This is used to build the
// grid of theme names.
const arrayToTable = (array, columns=3) => {
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

export const convert = async (themeFile) => {
    const theme = JSON5.parse(await readFile(themeFile, 'utf8'))
    const [colors, missingColors] = getThemeColors(theme)

    const command = `local ChangeHistoryService = game:GetService("ChangeHistoryService")

local json = [[${JSON.stringify(colors)}]]
local theme = game.HttpService:JSONDecode(json)

ChangeHistoryService:SetWaypoint("Changing theme")

local studio = settings().Studio

for name, color in pairs(theme) do
    color = Color3.fromRGB(color[1], color[2], color[3])

    local success = pcall(function()
        studio[name] = color
    end)

    if not success then
        warn(("%s is not a valid theme color"):format(name))
    end
end

ChangeHistoryService:SetWaypoint("Theme changed")

print("Successfully changed your Script Editor theme!")`

    return [command, missingColors]
}

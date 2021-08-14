import path from 'path'
import os from 'os'
import hexRgb from 'hex-rgb'
import JSON5 from 'json5'
import { readdir, stat, readFile } from 'fs/promises'
import { ROBLOX_VSCODE_THEME_MAP, MACOS_DEFAULT_EXTENSIONs, WINDOWS_DEFAULT_EXTENSIONS } from './constants.js'
import Table from 'cli-table3'

// Returns a dictionary that maps each scope to its associated color.
const getScopeColors = (theme) => {
    const colors = {}

    for (const token of theme.tokenColors) {
        const color = token.settings.foreground

        if (color) {
            // The token scope can either be an array of strings or a string. In
            // some older themes, the scope can be a comma separated string
            // denoting the list of scopes, so we have to handle both cases
            // where the scope string is either a single scope, or many.
            let scopes = []
            if (Array.isArray(token.scope)) {
                scopes = token.scope
            } else if (token.scope) {
                scopes = token.scope.split(',')
            }

            for (const scope of scopes) {
                colors[scope] = color
            }
        }
    }

    return colors
}

const getDefaultExtensionsDir = async () => {
    let potentialExtensionDirs = []
    switch (process.platform) {
        case 'win32':
            potentialExtensionDirs = WINDOWS_DEFAULT_EXTENSIONS
            break
        case 'darwin':
            potentialExtensionDirs = MACOS_DEFAULT_EXTENSIONs
            break
    }

    for (const dir of potentialExtensionDirs) {
        const stats = await stat(dir)
            .catch(err => {
                if (err.code !== 'ENOENT') {
                    console.error(err.message)
                }
            })

        if (stats) {
            return dir
        }
    }
}

const getThemesInDir = async (extensionsPath) => {
    const availableThemes = []

    const extensions = await readdir(extensionsPath)

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
                const { themes } = pkg.contributes || {}

                if (themes) {
                    for (const theme of themes) {
                        availableThemes.push({
                            name: theme.id || theme.label,
                            path: path.resolve(extensionPath, theme.path),
                        })
                    }
                }
            }
        }
    }

    return availableThemes
}

export const getAvailableThemes = async () => {
    let availableThemes = []

    const defaultExtensionsPath = await getDefaultExtensionsDir()
    if (defaultExtensionsPath) {
        const defaultThemes = await getThemesInDir(defaultExtensionsPath)

        availableThemes = [
            ...availableThemes,
            ...defaultThemes
        ]
    }

    const extensionsPath = path.join(os.homedir(), '.vscode/extensions/')
    const themes = await getThemesInDir(extensionsPath)

    availableThemes = [
        ...availableThemes,
        ...themes,
    ]

    return availableThemes
}

export const getThemeFromName = async (themeName) => {
    const themes = await getAvailableThemes()
    const theme = themes.find(theme => themeName.toLowerCase() === theme.name.toLowerCase())

    if (theme) {
        return theme.path
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
                Math.round((1 - alpha) * background.red + alpha * red),
                Math.round((1 - alpha) * background.green + alpha * green),
                Math.round((1 - alpha) * background.blue + alpha * blue),
            ]
        }
    }

    return [red, green, blue]
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

    return [colors, missing]
}

// Split the array into an array of arrays, where each sub-array has the first
// `columns` number of elements from the first array. This is used to build the
// grid of theme names.
const arrayToTable = (array, columns = 3) => {
    let rows = 0
    return array.reduce((acc, value, index) => {
        const columnIndex = index % columns

        if (columnIndex === 0) {
            acc.push([value])
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

    const command = `local json = [[${JSON.stringify(colors)}]]
local theme = game.HttpService:JSONDecode(json)

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

print("Successfully changed your Script Editor theme!")`

    return [command, missingColors]
}

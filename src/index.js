import chalk from 'chalk'
import fs from 'fs'
import JSON5  from 'json5'
import hexRgb from 'hex-rgb'

// Maps Roblox Studio's theme properties to the ones at the top level of a VS
// Code theme. If you want to use the tokenColors array, then assign Studio
// theme properties to the tokens in ROBLOX_TOKEN_MAP.
const ROBLOX_VSCODE_THEME_MAP = {
    'Background Color': 'editor.background',
    'Selection Color': 'selection.background',
    'Selection Background Color': 'selection.background',
    'Error Color': 'errorForeground',
    'Warning Color': 'editorWarning.foreground',
    'Find Selection Background Color': 'editor.findMatchBackground',
    'Matching Word Background Color': 'editor.selectionBackground',
    'Whitespace Color': 'editorLineNumber.activeForeground',
    'Current Line Highlight Color': 'editor.background',
    'Ruler Color': 'editorRuler.foreground',
    'Bracket Color': 'editorLineNumber.foreground',
}

const ROBLOX_TOKEN_SCOPE_MAP = {
    'Text Color': [ 'string.unquoted', 'variable', 'variable.object', 'variable.other', 'variable.parameter', 'support' ],
    'Operator Color': [ 'keyword.operator' ],
    'Number Color': [ 'constant.numeric' ],
    'String Color': [ 'string', 'string.quoted' ],
    'Comment Color': [ 'comment' ],
    'Bool Color': [ 'constant.language' ],
    '"nil" Color': [ 'constant.language' ],
    'Function Name Color': [ 'variable.function' ],
    '"function" Color': [ 'variable.parameter.function.language.special', 'variable', 'keyword' ],
    '"local" Color': ['keyword'],
    '"self" Color': [ 'variable.instance', 'variable.language', 'support', 'keyword', 'variable' ],
    'Luau Keyword Color': [ 'variable' ],
    'Keyword Color': [ 'keyword' ],
    'Built-in Function Color': [ 'support.function', 'entity.name', 'entity.other' ],
    '"TODO" Color': [ 'variable', 'keyword' ],
    'Method Color': [ 'variable.function' ],
    'Property Color': [ 'variable.function' ],
}

const hexRgbAsArray = (hex) => {
    const color = hexRgb(hex)
    return [ color.red, color.green, color.blue, color.alpha ]
}

const getBaseColors = (theme) => {
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

const getTokenColors = (theme) => {
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

const convert = (themeFile) => {
    const theme = JSON5.parse(fs.readFileSync(themeFile, 'utf8'))

    const [baseColors, missingBaseColors] = getBaseColors(theme)
    const [tokenColors, missingTokenColors] = getTokenColors(theme)

    const studioTheme = {
        ...baseColors,
        ...tokenColors,
    }

    const missingColors = [
        ...missingBaseColors,
        ...missingTokenColors
    ]

    const command = `local ChangeHistoryService = game:GetService("ChangeHistoryService")

local json = [[${JSON.stringify(studioTheme)}]]
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

export default convert
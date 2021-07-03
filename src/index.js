import { readFile } from 'fs/promises'
import JSON5  from 'json5'
import { getBaseColors, getTokenColors } from './theme.js'

const convert = async (themeFile) => {
    const theme = JSON5.parse(await readFile(themeFile, 'utf8'))

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
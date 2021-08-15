import JSON5 from 'json5'
import { readFile } from 'fs/promises'
import getThemeColors from './getThemeColors.js'

const convert = async (themeFile) => {
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


export default convert
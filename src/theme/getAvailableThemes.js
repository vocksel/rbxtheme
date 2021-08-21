import path from 'path'
import os from 'os'
import getDefaultExtensionsDir from './getDefaultExtensionsDir.js'
import getThemesInDir from './getThemesInDir.js'

const getAvailableThemes = async () => {
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

export default getAvailableThemes
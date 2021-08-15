import path from 'path'
import JSON5 from 'json5'
import { readdir, stat, readFile } from 'fs/promises'

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

export default getThemesInDir
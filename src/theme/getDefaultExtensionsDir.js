import { stat } from 'fs/promises'
import { MACOS_DEFAULT_EXTENSIONs, WINDOWS_DEFAULT_EXTENSIONS } from '../constants.js'

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

export default getDefaultExtensionsDir
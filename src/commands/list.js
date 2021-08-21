import { getAvailableThemes, logArray } from '../theme/index.js'

const list = async () => {
    const themes = await getAvailableThemes()

    console.log('Available themes:')
    logArray(themes.map(theme => theme.name))

    console.log('Run `rbxtheme convert <theme>` with one of the listed themes')
}

export default list
import getAvailableThemes from "./getAvailableThemes.js"

const getThemeFromName = async (themeName) => {
    const themes = await getAvailableThemes()
    const theme = themes.find(theme => themeName.toLowerCase() === theme.name.toLowerCase())

    if (theme) {
        return theme.path
    }
}

export default getThemeFromName
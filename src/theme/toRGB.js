import hexRgb from 'hex-rgb'

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

export default toRGB
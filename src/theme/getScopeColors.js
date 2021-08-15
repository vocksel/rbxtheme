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

export default getScopeColors
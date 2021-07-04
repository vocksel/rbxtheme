// Maps Roblox Studio's theme properties to the ones at the top level of a VS
// Code theme. If you want to use the tokenColors array, then assign Studio
// theme properties to the tokens in ROBLOX_TOKEN_MAP.
export const ROBLOX_VSCODE_THEME_MAP = {
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

export const ROBLOX_TOKEN_SCOPE_MAP = {
    'Text Color': [ 'string.unquoted', 'variable', 'variable.object', 'variable.other', 'variable.parameter', 'support' ],
    'Operator Color': [ 'keyword.operator', 'keyword' ],
    'Number Color': [ 'constant.numeric' ],
    'String Color': [ 'string', 'string.quoted' ],
    'Comment Color': [ 'comment' ],
    'Bool Color': [ 'constant.language' ],
    '"nil" Color': [ 'constant.language' ],
    'Function Name Color': [ 'variable.function' ],
    '"function" Color': [ 'variable.parameter.function.language.special', 'keyword', 'variable' ],
    '"local" Color': ['keyword'],
    '"self" Color': [ 'variable.instance', 'variable.language', 'support', 'keyword', 'variable' ],
    'Luau Keyword Color': [ 'variable' ],
    'Keyword Color': [ 'keyword' ],
    'Built-in Function Color': [ 'support.function', 'entity.name', 'entity.other' ],
    '"TODO" Color': [ 'variable', 'keyword' ],
    'Method Color': [ 'variable.function' ],
    'Property Color': [ 'variable.function' ],
}
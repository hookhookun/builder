addEventListener('error', (event) => {
    const errorElement = document.createElement('pre');
    const message = [];
    if (event.error) {
        message.push(event.error.stack || event.error.message);
    } else {
        if (event.message) {
            message.push(event.message);
        }
        if (event.filename) {
            message.push(event.filename);
        }
        if (event.lineno) {
            message.push(':');
            message.push(event.lineno);
        }
        if (event.colno) {
            message.push(':');
            message.push(event.colno);
        }
    }
    errorElement.textContent = message.join('');
    document.body.prepend(errorElement);
});
{
    const themeInput = 'input[name="HookTheme"]';
    const themeAutoInput = 'input[name="HookThemeAuto"]';
    const themeAttribute = 'data-theme';
    const Dark = 'Dark';
    const Light = 'Light';
    const storageKey = 'HookTheme';
    /**
     * @param {string} query
     * @param {(Element, index: number) => boolean | void} fn
     * @param {Element} node
     * @return {Element | null}
     */
    const find = (query, fn, node = document) => {
        const list = node.querySelectorAll(query);
        for (let index = 0; index < list.length; index++) {
            const element = list[index];
            if (fn(element, index)) {
                return element;
            }
        }
        return null;
    };
    /**
     * @param {string} query
     * @param {(Element, index: number) => void} fn
     * @param {Element} node
     * @return {void}
     */
    const forEach = (query, fn, node = document) => {
        find(query, (element, index) => {
            fn(element, index);
        }, node);
    };
    const query = matchMedia('(prefers-color-scheme: dark)');
    const isAuto = () => {
        const autoInput = document.querySelector(themeAutoInput);
        return !autoInput || autoInput && autoInput.checked;
    };
    const getSelectedTheme = () => find(themeInput, (input) => input.checked).value;
    const getBrowserTheme = () => query.matches ? Dark : Light;
    /**
     * @param {string} theme
     * @param {boolean} auto
     */
    const applyTheme = (theme, auto) => {
        forEach(themeInput, (input) => input.checked = input.value === theme);
        forEach(themeAutoInput, (input) => input.checked = auto);
        document.documentElement.setAttribute(themeAttribute, theme);
        if (auto) {
            localStorage.removeItem(storageKey);
        } else {
            localStorage.setItem(storageKey, theme);
        }
    };
    /**
     * @param {MediaQueryList} query
     */
    const onChangeBrowserTheme = () => {
        const auto = isAuto();
        if (auto) {
            applyTheme(getBrowserTheme(), true);
        }
    };
    if (query.addEventListener) {
        query.addEventListener('change', onChangeBrowserTheme);
    } else if (query.addListener) {
        query.addListener(onChangeBrowserTheme);
    }
    /** @param {Event} event */
    const onSelectTheme = (event) => applyTheme(event.target.value, false);
    forEach(themeInput, (input) => input.addEventListener('change', onSelectTheme));
    const onChangeAuto = () => {
        if (isAuto()) {
            applyTheme(getBrowserTheme(), true);
        } else {
            applyTheme(getSelectedTheme(), false);
        }
    };
    forEach(themeAutoInput, (input) => input.addEventListener('change', onChangeAuto));
    switch (localStorage.getItem(storageKey)) {
        case Light:
            applyTheme(Light, false);
            break;
        case Dark:
            applyTheme(Dark, false);
            break;
        default:
            applyTheme(getBrowserTheme(), true);
    }
}

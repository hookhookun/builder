addEventListener('error', (error) => {
    const errorElement = document.createElement('pre');
    errorElement.textContent = error.stack || error.toString();
    document.body.prepend(errorElement);
});
{
    const themeInput = 'input[name="Theme"]';
    const themeAttribute = 'data-theme';
    const Dark = 'Dark';
    const Light = 'Light';
    /**
     * @param {string} query 
     * @param {(Element) => void} fn 
     * @param {Element} node 
     */
    const forEach = (query, fn, node = document) => {
        const list = node.querySelectorAll(query);
        for (let index = 0; index < list.length; index++) {
            fn(list[index]);
        }
    };
    /**
     * @param {string} theme 
     */
    const setTheme = (theme) => {
        const root = document.documentElement;
        const currentTheme = root.getAttribute(themeAttribute);
        if (currentTheme !== theme) {
            root.setAttribute(themeAttribute, theme);
        }
        localStorage.theme = theme;
        forEach(themeInput, (input) => {
            input.checked = input.value === theme;
        });
    };
    /**
     * @param {MediaQueryList} query 
     */
    const onChangeTheme = (query) => {
        const dark = query.matches;
        forEach(themeInput, (input) => {
            input.checked = input.value === Dark ? dark : !dark;
        });
        setTheme(dark ? Dark : Light);
    };
    const query = matchMedia('(prefers-color-scheme: dark)');
    query.addEventListener('change', onChangeTheme);
    setTheme(localStorage.theme || (query.matches ? Dark : Light));
    /**
     * @param {Event} event 
     */
    const onChangeValue = (event) => setTheme(event.target.value);
    forEach(themeInput, (input) => input.addEventListener('change', onChangeValue));
}

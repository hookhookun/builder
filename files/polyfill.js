addEventListener('error', (error) => {
    const errorElement = document.createElement('pre');
    errorElement.textContent = error.stack || error.toString();
    document.body.prepend(errorElement);
});

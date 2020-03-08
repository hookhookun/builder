{
    const endpoint = '{{ENDPOINT}}';
    const eventSource = new EventSource(endpoint);
    eventSource.addEventListener('change', (event) => {
        const file = event.data;
        if (file.endsWith('.css')) {
            const link = document.querySelector(`link[href$="${file}"]`);
            console.log(link);
        } else {
            location.reload();
        }
    });
}

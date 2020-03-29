import file from 'https://example.com/sample.txt';

{
    fetch(file)
    .then(async (response) => {
        console.log(await response.text());
    })
    .catch(console.error);
}

{
    const element = document.querySelector('#Script3');
    if (element) {
        element.insertAdjacentText('beforeend', 'Applied!');
    }
}

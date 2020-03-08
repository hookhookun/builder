export const parseCLIArguments = (
    cliArguments: Array<string>,
) => ({
    watch: cliArguments.includes('--watch'),
});

import * as fs from 'fs';
import * as cheerio from 'cheerio';

export const loadHTML = async (
    htmlFilePath: string,
): Promise<CheerioStatic> => {
    const htmlString = await fs.promises.readFile(htmlFilePath, 'utf8');
    return cheerio.load(htmlString);
};

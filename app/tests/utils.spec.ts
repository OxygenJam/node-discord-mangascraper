import { describe, expect, it } from '@jest/globals';
import { sanitizeStringFromHTML } from '../utils/helper';

describe('Helper Function Testing', () => {
    it('sanitize a given string', () => {
        const 
            given = `
            <p>Given this paragraph element
            </p><br/><br/>
            <span> all the html markup tags
            should be removed </span>
            `,
            expected = "Given this paragraph element all the html markup tags should be removed";

        expect(sanitizeStringFromHTML(given)).toEqual(expected);
    });
})
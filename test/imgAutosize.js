const expect = require('expect');
const posthtml = require('posthtml');
const imgAutosize = require('..');

describe('Plugin', () => {
    context('options.processEmptySize == false (default)', () => {
        const optionsRoot = { root: './test/img' };

        it('should autosize local JPG', async () => {
            expect(
                await init(
                    '<img src="100x201.jpg" width="auto" height="auto">',
                    optionsRoot
                )
            ).toBe('<img src="100x201.jpg" width="100" height="201">');

            expect(
                await init('<img src="100x201.jpg" width="auto">', optionsRoot)
            ).toBe('<img src="100x201.jpg" width="100">');

            expect(
                await init('<img src="100x201.jpg" height="auto">', optionsRoot)
            ).toBe('<img src="100x201.jpg" height="201">');
        });

        it('should autosize local PNG', async () => {
            expect(
                await init(
                    '<img src="111x52.png" width="auto" height="104" alt="hi">',
                    optionsRoot
                )
            ).toBe('<img src="111x52.png" width="222" height="104" alt="hi">');
        });

        it('should autosize remote PNG', async () => {
            expect(
                await init(
                    '<img src="http://placehold.it/200x200" width="auto" height="25" alt="hi">',
                    optionsRoot
                )
            ).toBe(
                '<img src="http://placehold.it/200x200" width="25" height="25" alt="hi">'
            );
        });

        it('should autosize local GIF', async () => {
            expect(
                await init(
                    '<img src="140x83.gif" width="auto" height="auto">',
                    optionsRoot
                )
            ).toBe('<img src="140x83.gif" width="140" height="83">');
        });

        it('should autosize local BMP', async () => {
            expect(
                await init(
                    '<img src="33x16.bmp" width="auto" height="auto">',
                    optionsRoot
                )
            ).toBe('<img src="33x16.bmp" width="33" height="16">');
        });

        it('should autosize local WebP', async () => {
            expect(
                await init(
                    '<img src="163x53.webp" width="auto" height="auto">',
                    optionsRoot
                )
            ).toBe('<img src="163x53.webp" width="163" height="53">');
        });

        it('should autosize local TIFF', async () => {
            expect(
                await init(
                    '<img src="63x69.tiff" width="auto" height="auto">',
                    optionsRoot
                )
            ).toBe('<img src="63x69.tiff" width="63" height="69">');
        });

        it('should autosize local SVG', async () => {
            expect(
                await init(
                    '<img src="203x150.svg" width="auto" height="auto">',
                    optionsRoot
                )
            ).toBe('<img src="203x150.svg" width="203" height="150">');
        });

        it('should skip <img> with empty "src"', async () => {
            const html = '<div><img></div>';
            expect(await init(html)).toBe(html);
        });

        it('should skip <img> with defined "width" and "height"', async () => {
            const html = '<img src="foo.jpg" width="100%" height="100">';
            expect(await init(html)).toBe(html);
        });

        it('should skip <img> with "width" and "height" != "auto"', async () => {
            const html = '<img src="foo.jpg">';
            expect(await init(html)).toBe(html);
        });

        it('should throw an error if the image is not found', async () => {
            const html = '<img src="notExists.jpg" width="auto" height="auto">';
            let errorMessage;
            try {
                await init(html);
            } catch (e) {
                errorMessage = e.message;
            }
            expect(errorMessage).toContain('ENOENT');
            expect(errorMessage).toContain('notExists.jpg');
        });
    });

    context('options.processEmptySize == true', () => {
        const options = { root: './test/img', processEmptySize: true };

        it('should autosize <img> with empty "width" or "height"', async () => {
            expect(await init('<img src="100x201.jpg">', options)).toBe(
                '<img src="100x201.jpg" width="100" height="201">'
            );

            expect(await init('<img src="111x52.png" width="">', options)).toBe(
                '<img src="111x52.png" width="111" height="52">'
            );

            expect(
                await init('<img src="140x83.gif" height="auto">', options)
            ).toBe('<img src="140x83.gif" height="83" width="140">');
        });

        it('should throw an error if the image is not found', async () => {
            const html = '<img src="notExists.jpg">';
            let errorMessage;
            try {
                await init(html, options);
            } catch (e) {
                errorMessage = e.message;
            }
            expect(errorMessage).toContain('ENOENT');
            expect(errorMessage).toContain('notExists.jpg');
        });
    });
});

function init(html, options) {
    return posthtml([imgAutosize(options)])
        .process(html)
        .then(result => result.html);
}

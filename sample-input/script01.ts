{
    const element = document.querySelector('#Script1');
    if (element) {
        element.insertAdjacentText('beforeend', 'Applied!');
    }
}

{
    interface Rect {
        left: number,
        right: number,
        top: number,
        bottom: number,
        width: number,
        height: number,
        cx: number,
        cy: number,
    }
    interface Result extends Rect {
        text: Rect,
    }
    const rect = (
        left: number,
        top: number,
        width: number,
        height: number,
    ): Rect => ({
        left,
        right: left + width,
        top,
        bottom: top + height,
        width,
        height,
        cx: left + width / 2,
        cy: top + height / 2,
    });
    const line = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y1: number,
        y2: number,
        tick = 4,
    ) => {
        const d = Math.abs(y1 - y2);
        if (0 < d) {
            ctx.beginPath();
            ctx.moveTo(x, y1);
            ctx.lineTo(x, y2);
            ctx.moveTo(x - tick, y1);
            ctx.lineTo(x + tick, y1);
            ctx.moveTo(x - tick, y2);
            ctx.lineTo(x + tick, y2);
            ctx.stroke();
            ctx.save();
            const text = d.toFixed(1);
            const y = avg(y1, y2);
            const textWidth = ctx.measureText(text).width;
            ctx.fillStyle = color(0, 0, 0, 0.5);
            ctx.fillRect(x - textWidth, y - 5, textWidth, 10);
            ctx.restore();
            ctx.fillText(text, x, y);
        }
    };
    const color = (r: number, g: number, b: number, o = 1) => {
        const rgb = [r, g, b].map((x) => Math.round(x * 255)).join(',');
        return `rgba(${rgb},${o})`;
    };
    const avg = (...values: Array<number>) => values.reduce((a, b) => a + b) / values.length;
    const listElements = (element: Element) => {
        const list: Array<Element> = [];
        for (const child of element.children) {
            switch (child.tagName.toLowerCase()) {
                case 'ul':
                case 'ol':
                    list.push(...child.children);
                    break;
                default:
                    list.push(child);
            }
        }
        return list;
    };
    const id = 'StyleChecker';
    const checkStyle = () => {
        const canvas = document.createElement('canvas');
        canvas.id = id;
        const main = document.querySelector('main');
        if (!main) {
            throw new Error('NoMain');
        }
        const bodyRect = document.body.getBoundingClientRect();
        Object.assign(canvas.style, {
            position: 'absolute',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
        });
        canvas.width = bodyRect.width * devicePixelRatio;
        canvas.height = bodyRect.height * devicePixelRatio;
        const ctx = canvas.getContext('2d');
        ctx.scale(devicePixelRatio, devicePixelRatio);
        ctx.font = '9px sans-serif';
        ctx.textBaseline = 'middle';
        let previous: Result | null = null;
        for (const element of listElements(main)) {
            const style = getComputedStyle(element);
            ctx.strokeStyle = color(1, 1, 1);
            ctx.lineWidth = 1;
            const targetRect = element.getBoundingClientRect();
            const {width, height} = targetRect;
            const left = targetRect.left - bodyRect.left;
            const top = targetRect.top - bodyRect.top;
            const fontSize = parseFloat(style.fontSize);
            const lineHeight = parseFloat(style.lineHeight);
            const implicitMarginV = (lineHeight - fontSize) / 2;
            const paddingTop = parseFloat(style.paddingTop);
            const paddingBottom = parseFloat(style.paddingBottom);
            const result: Result = {
                ...rect(left, top, width, height),
                text: rect(
                    left,
                    top + implicitMarginV + paddingTop,
                    width,
                    height - implicitMarginV * 2 - paddingTop - paddingBottom,
                ),
            };
            const {text} = result;
            {
                ctx.fillStyle = color(1, 0, 0, 0.7);
                ctx.fillRect(text.left, text.top, text.width, text.height);
                ctx.fillStyle = color(0, 0, 1, 0.5);
                ctx.fillRect(text.left, top, text.width, text.top - top);
                ctx.fillRect(text.left, text.bottom, text.width, result.bottom - text.bottom);
            }
            {
                ctx.fillStyle = color(1, 1, 1);
                ctx.textAlign = 'right';
                if (previous) {
                    const {text: previousText} = previous;
                    line(ctx, result.right - 10, top, previous.bottom);
                    line(ctx, result.cx, text.top, previousText.bottom);
                }
                line(ctx, result.right - 10, top, text.top);
                line(ctx, result.right - 10, result.bottom, text.bottom);
                line(ctx, result.right - 10, text.top, text.bottom);
                ctx.textAlign = 'left';
                ctx.fillStyle = color(0, 0, 0, 0.5);
                const longText = `行上端と描画の間:${implicitMarginV.toFixed(1)}`;
                ctx.fillRect(left, top - 5, ctx.measureText(longText).width, 30);
                ctx.fillStyle = color(1, 1, 1);
                ctx.fillText(top.toFixed(1), left, top);
                ctx.fillText(`lineHeight:${lineHeight.toFixed(1)}`, left, top + 10);
                ctx.fillText(longText, left, top + 20);
            }
            previous = result;
        }
        document.body.append(canvas);
    };
    const toggleCheck = () => {
        const styleCheckerElement = document.getElementById(id);
        if (styleCheckerElement) {
            styleCheckerElement.remove();
        } else {
            checkStyle();
        }
    };
    addEventListener('keydown', (event) => {
        if (event.key === '?') {
            toggleCheck();
        }
    });
    const button = document.createElement('button');
    button.addEventListener('click', toggleCheck);
    button.textContent = 'Check Styles';
    document.body.append(button);
    // checkStyle();
}

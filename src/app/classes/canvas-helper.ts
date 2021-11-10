export class CanvasHelper {


    static MouseXY(canvas: HTMLCanvasElement, event: MouseEvent): {x: number, y: number} {
        const bcr = canvas.getBoundingClientRect(); // abs. size of element
        const scaleX = canvas.width / bcr.width;    // relationship bitmap vs. element for X
        const scaleY = canvas.height / bcr.height;  // relationship bitmap vs. element for Y
        return {
            x: (event.clientX - bcr.left) * scaleX,
            y: (event.clientY - bcr.top) * scaleY
        }
    }


    static GetCanvasCoords = function(ctx: CanvasRenderingContext2D, mouseXY:  {x: number, y: number}): {x: number, y: number} {
        const matrix = ctx.getTransform();
        const imatrix = matrix.invertSelf();
        let x = mouseXY.x * imatrix.a + mouseXY.y * imatrix.c + imatrix.e;
        let y = mouseXY.x * imatrix.b + mouseXY.y * imatrix.d + imatrix.f;
        return {x: x, y: y};
      }

    static MouseToCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, event: MouseEvent): {x: number, y: number} {

        return this.GetCanvasCoords(ctx, this.MouseXY(canvas, event))
    }
}

// adapted from https://codepen.io/jet/pen/gwFGl

import React, {useEffect} from 'react';

const STARCOUNT = 24;
const MAXVELOCITY = 6;

const palette = ['#38bdf8', '#ffffff', '#e11d48', '#e11d48', '#7dd3fc', '#7dd3fc', '#7dd3fc'];
const flicka = [] as string[];
for(let i = 0; i < 100; i++) {
	const rdx = Math.floor(Math.random() * palette.length);
	flicka.push(palette[rdx]);
}

function starfield(canvas: HTMLCanvasElement) {
	const result = [];
	for (let i = 0; i < STARCOUNT; i++) {
		const vx = Math.ceil(Math.random() * MAXVELOCITY);
		const star = {
			x: Math.floor(Math.random() * canvas.width - 1),
			y: Math.floor(Math.random() * (canvas.height - 8)),
			vx,
			size: 5 * (vx + 1),
			flicka: Math.floor(Math.random() * flicka.length)
		};
		result.push(star);
	}
	return result;
}

export default function Starfield({disabled, className}: {disabled?: boolean, className?: string}) {
	const canvas = React.createRef<HTMLCanvasElement>();

	useEffect(() => {
		if(disabled || !canvas.current) return;

		const starList = starfield(canvas.current);
		const frameDelay = 24;
		const ctx = canvas.current?.getContext('2d');
		ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		let frame : number;
		let timeout : NodeJS.Timeout;

		(function loop() {
			timeout = setTimeout(() => {
				if(!ctx) return;
				frame = requestAnimationFrame(loop);
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

				let star;
				for(let i = 0, max = starList.length; i < max; i++) {
					star = starList[i];
					star.x = star.x - star.vx;

					if(star.x < 0) {
						star.y = Math.floor(Math.random() * (ctx.canvas.height - 1));
						star.x = ctx.canvas.width;
						star.vx = Math.ceil(Math.random() * MAXVELOCITY);
						star.size = 5 * (star.vx + 1);
						star.flicka = Math.floor(Math.random() * flicka.length);
					}

					ctx.fillStyle = flicka[star.flicka];
					star.flicka = (star.flicka + 1) % (flicka.length - 1);
					ctx.beginPath();
					ctx.fillRect(star.x, star.y, star.size, star.size);
					ctx.closePath();
					ctx.fill();

				}

			}, frameDelay);
		}());

		return () => {
			cancelAnimationFrame(frame);
			clearTimeout(timeout);
		};

	}, [disabled, canvas]);

	return <canvas 
		ref={canvas} 
		width={window.innerWidth} 
		height={window.innerHeight} 
		className={`w-full h-full ${className}`} />;
}

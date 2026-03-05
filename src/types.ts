export interface Ai {
	run(model: string, options: { prompt: string }): Promise<any>;
}

export interface ImageAi {
	generate(options: { prompt: string; width?: number; height?: number; count?: number }): Promise<any>;
}

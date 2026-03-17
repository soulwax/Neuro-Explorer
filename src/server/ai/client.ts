export interface AiClient {
	run(model: string, input: unknown): Promise<unknown>;
}

export interface AiBindingLike {
	run(model: string, input: unknown): Promise<unknown>;
}

interface WorkersAiErrorEntry {
	code?: number;
	message?: string;
}

interface WorkersAiRunResponse<T> {
	success?: boolean;
	errors?: WorkersAiErrorEntry[];
	result?: T;
}

export interface RestAiClientOptions {
	accountId: string;
	apiToken: string;
	baseUrl?: string;
}

export function createBindingAiClient(binding: AiBindingLike): AiClient {
	return {
		run(model, input) {
			return binding.run(model, input);
		},
	};
}

export function createRestAiClient(options: RestAiClientOptions): AiClient {
	const { accountId, apiToken, baseUrl = 'https://api.cloudflare.com/client/v4' } = options;

	return {
		async run(model, input) {
			const endpoint = `${baseUrl}/accounts/${accountId}/ai/run/${model}`;
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${apiToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(input),
			});

			const json = (await response.json()) as WorkersAiRunResponse<unknown>;
			if (!response.ok || json.success === false) {
				const reason = json.errors?.map((error) => error.message ?? `code=${error.code ?? 'unknown'}`).join('; ') ?? response.statusText;
				throw new Error(`Workers AI request failed: ${reason}`);
			}

			return json.result;
		},
	};
}

import { Ai, ImageAi } from './types';

export interface Env {
	AI: Ai;
}

export const gptOss120b = {
	name: '@cf/meta/gpt-oss-120b',
	description:
		'GPT-OSS 120B is a large language model developed by Cloudflare, designed to provide powerful natural language processing capabilities for a wide range of applications.',
};

export const resnet50 = {
	name: '@cf/meta/resnet-50',
	description:
		'ResNet-50 is a convolutional neural network architecture that is 50 layers deep. It is widely used for image classification tasks and is known for its ability to mitigate the vanishing gradient problem, allowing for the training of much deeper networks.',
};

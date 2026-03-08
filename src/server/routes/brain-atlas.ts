import { createBrainAtlasResult } from '../../core/brain-atlas';

export function handleBrainAtlas(): Response {
  return new Response(JSON.stringify(createBrainAtlasResult(), null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}

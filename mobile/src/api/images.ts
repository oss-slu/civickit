// mobile/src/api/images.ts
import type { Image } from '@civickit/shared';
import { apiFetch } from './client';
import { createImageDTO } from '@civickit/shared/src/types/api';

export function getImageById(
    imageId: string,
): Promise<Image> {
    return apiFetch('/images', {
        query: { id: imageId },
    });
}


export function createImage(image: createImageDTO): Promise<Image> {
    return apiFetch('/images/', { method: 'POST', body: image, auth: true });
}

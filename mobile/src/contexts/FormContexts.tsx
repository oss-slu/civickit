//mobile/src/types/FormContexts.tsx

import { createContext } from "react"
import type { PhotoMetadata } from "../utils/photoMetadata"
import { userLocation } from "../types/userLocation"

export const ImagesContext = createContext<{ images: string[]; setImages: (images: string[]) => void }>({ images: [], setImages: () => { } })
export const PhotoMetadataContext = createContext<{ photoMetadata: PhotoMetadata[]; setPhotoMetadata: (metadata: PhotoMetadata[]) => void }>({ photoMetadata: [], setPhotoMetadata: () => { } })
export const UserLocationContext = createContext({ location: { latitude: 0, longitude: 0 }, setLocation: (location: userLocation | null) => { } })
export const AddressContext = createContext({ address: 'Detecting location...', setAddress: (address: string) => { } })
export const TitleContext = createContext({ title: "", setTitle: (title: string) => { } })
export const CategoryContext = createContext({ category: null, setCategory: (category: any) => { } })
export const DescriptionContext = createContext({ description: "", setDescription: (description: string) => { } })

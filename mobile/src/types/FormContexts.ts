//mobile/src/types/FormContexts.ts

import { createContext } from "react"
import { userLocation } from "./userLocation"

export const ImagesContext = createContext({ images: [], setImages: (images: string[]) => { } })
export const UserLocationContext = createContext({ location: { latitude: 0, longitude: 0 }, setLocation: (location: userLocation | null) => { } })
export const AddressContext = createContext({ address: 'Detecting location...', setAddress: (address: string) => { } })
export const TitleContext = createContext({ title: "", setTitle: (title: string) => { } })
export const CategoryContext = createContext({ category: null, setCategory: (category: any) => { } })
export const DescriptionContext = createContext({ description: "", setDescription: (description: string) => { } })

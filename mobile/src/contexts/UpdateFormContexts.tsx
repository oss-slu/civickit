//mobile/src/types/UpdateFormContexts.tsx

import { createContext } from "react"
import type { PhotoMetadata } from "../utils/photoMetadata"
import { Issue } from "@civickit/shared";

export const ImagesContext = createContext<{ images: string[]; setImages: (images: string[]) => void }>({ images: [], setImages: () => { } })
export const PhotoMetadataContext = createContext<{ photoMetadata: PhotoMetadata[]; setPhotoMetadata: (metadata: PhotoMetadata[]) => void }>({ photoMetadata: [], setPhotoMetadata: () => { } })
export const MessageContext = createContext({ message: "", setMessage: (message: string) => { } })
export const StatusContext = createContext({ status: null, setStatus: (status: any) => { } })
export const FormStartedContext = createContext({ formStarted: false, setFormStarted: (formStarted: boolean) => { } })
export const CurrentIssueContext = createContext({ currentIssue: null, setCurrentIssue: (currentIssue: Issue | null) => { } })
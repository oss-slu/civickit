// mobile/src/types/PointsContext.tsx
import { createContext, useContext, useMemo } from "react";
import cityBounds from '../../assets/shapes/stl_boundary_inverted.json'

interface PointsContextType {
    stlPoints: { latitude: any; longitude: any; }[]
    worldPoints: { latitude: any; longitude: any; }[]
}

const PointsContext = createContext<PointsContextType | undefined>(undefined)

export const PointsProvider = ({ children }: any) => {

    const stlPoints = useMemo(
        () => cityBounds.features[0].geometry.coordinates[0][1].map((point: any) => ({ latitude: point[1], longitude: point[0] })),
        []
    )

    const worldPoints = useMemo(
        () => cityBounds.features[0].geometry.coordinates[0][0].map((point: any) => ({ latitude: point[1], longitude: point[0] })),
        []
    )

    return (
        <PointsContext.Provider value={{ worldPoints, stlPoints }}>
            {children}
        </PointsContext.Provider>
    );

}

export const usePoints = () => {
    const context = useContext(PointsContext);
    if (!context) {
        throw new Error('Error: usePoints could not be used');
    }
    return context;
};
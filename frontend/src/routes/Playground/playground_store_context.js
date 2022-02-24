import { createContext, useContext } from "react";

export const PlaygroundStoreContext = createContext()

export const usePlaygroundStore = () => {
    return useContext(PlaygroundStoreContext)
}
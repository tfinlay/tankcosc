import { createContext, useContext } from "react";

export const BoardStoreContext = createContext()

export const useBoardStore = () => {
    return useContext(BoardStoreContext)
}
import { QueryClient } from "@tanstack/react-query";
import { createContext } from "react";

export const UseQueryClientContext = createContext<QueryClient>(new QueryClient());

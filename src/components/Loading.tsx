import { ChakraProvider, Spinner } from "@chakra-ui/react";

export default function Loading() {
  return (
    <ChakraProvider>
      <Spinner />
    </ChakraProvider>
  );
}
import { ChakraProvider, Spinner } from "@chakra-ui/react";

interface LoadingProps {
  status?: string | null;
}

export default function Loading({
  status=null,
}: LoadingProps) {
  return (
    <ChakraProvider>
      <div className='flex flex-col items-center'>
        <Spinner />
        {status && <h1 className="mt-4">{status}</h1>}
      </div>
    </ChakraProvider>
  );
}
interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({
  message,
}: ErrorMessageProps) {

  return (
    <div className='flex flex-col items-center justify-center text-center hover:underline decoration-red-300'>
      {message.split('\n').map((line, i) => (
        <h1 key={i} className='text-red-300'>{line}</h1>
      ))}
    </div>
  );
}
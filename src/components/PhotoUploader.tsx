import { storage } from '@/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';
import { useState } from 'react';

async function uploadFile(file: File, filename: string): Promise<string> {
  const snapshot = await uploadBytes(ref(storage, filename), file);
  return getDownloadURL(snapshot.ref);
}

interface PhotoUploaderProps {
  filename: string;
}

export default function PhotoUploader({ filename }: PhotoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  async function handleUploadPhoto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUrl(await uploadFile(file!, filename));
  }

  return (
    <form onSubmit={handleUploadPhoto}>
      {url && <Image src={url} alt="user uploaded image" width={64} height={64} />}
      <input
        type="file"
        onChange={(e) => setFile(e.target.files![0])}
      />
      <button type="submit">upload</button>
    </form>
  );
}
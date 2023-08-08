import { storage } from '@/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';
import { useState } from 'react';

async function uploadFile(file: File, filename: string): Promise<string> {
  const snapshot = await uploadBytes(ref(storage, filename), file);
  return getDownloadURL(snapshot.ref);
}

interface PhotoUploaderProps {
  directory: string;
  filename: string;
  onUpload: (url: string) => void;
}

export default function PhotoUploader({
  directory,
  filename,
  onUpload }: PhotoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  async function handleUploadPhoto(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    const uri = await uploadFile(file!, `${directory}/${filename}`);
    setUrl(uri);
    onUpload(uri);
  }

  return (
    <div className="mb-4">
      {url && <Image src={url} alt="user uploaded image" width={64} height={64} />}
      <input
        type="file"
        onChange={(e) => setFile(e.target.files![0])}
      />
      <button onClick={handleUploadPhoto}>upload</button>
    </div>
  );
}
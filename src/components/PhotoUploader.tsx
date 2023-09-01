import { uploadFile } from '@/api';
import { useState } from 'react';

interface PhotoUploaderProps {
  directory: string;
  filename: string;
  defaultUrl?: string | null;
  onUpload: (url: string) => void;
}

export default function PhotoUploader({
  directory,
  filename,
  defaultUrl = null,
  onUpload }: PhotoUploaderProps) {
  const [url, setUrl] = useState<string | null>(defaultUrl);

  async function handleUploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    const uri = await uploadFile(e.target.files![0], `${directory}/${filename}`);
    setUrl(uri);
    onUpload(uri);
  }

  return (
    <div className="mb-4 flex flex-col items-center justify-center">
      {url &&
        <div className="bg-slate-700 rounded-full h-32 w-32 m b-40">
          <label htmlFor="edit-file">
            <div className="relative overflow-hidden h-32 w-32 rounded-full hover:opacity-80 hover: cursor-pointer" style={{ backgroundImage: `url(${url.split('?')[0]}_200x200?${url.split('?')[1]})`, backgroundSize: '130px', backgroundPositionY: 0 }}>
              <div className='bg-slate-900 bg-opacity-30 rounded-sm w-32 absolute bottom-4 text-white flex items-center justify-center'>
                <p className="opacity-80">edit</p>
              </div>
            </div>
            <input onChange={handleUploadPhoto} id="edit-file" type="file" className="hidden" />
          </label>
        </div>}
      {!url && <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-80 h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
          </div>
          <input onChange={handleUploadPhoto} id="dropzone-file" type="file" className="hidden" />
        </label>
      </div>}
    </div>
  );
}
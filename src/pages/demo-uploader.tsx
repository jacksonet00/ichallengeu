import PhotoUploader from '@/components/PhotoUploader';

export default function DemoUploader() {

  function handleUpload(url: string) {
    console.log(url);
  }

  return (
    <div>
      <PhotoUploader directory='test_folder' filename="test_name" onUpload={handleUpload} />
    </div>
  );
}
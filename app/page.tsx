import Image from "next/image";
import S3UploadForm from "@/app/components/S3UploadForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <S3UploadForm />
    </main>
  );
}

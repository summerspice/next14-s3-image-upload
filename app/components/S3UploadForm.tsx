"use client";
import { useState } from "react";

const UploadForm = () => {
  const [file, setFile] = useState<File | undefined | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | null) => {
    if (e.target.files[0] && e.target.files[0] !== null) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/s3-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(data.status);
      document.getElementById("success")?.append("Uploaded Successfully!");
      setTimeout(() => {
        document.getElementById("success")?.remove();
      }, 2000);
      setUploading(false);
    } catch (err) {
      console.log(err);
      setUploading(false);
    }
  };

  return (
    <>
      <main className="flex w-full flex-col items-center">
        <div className="">
          <h1 className="py-5 text-4xl"> Upload File to S3 - Simple</h1>
          <p className="text-xl">Upload image to S3 - No pre-signed URL</p>
        </div>
        <div className="my-5 border border-gray-400 px-6 py-6">
          <form onSubmit={handleSubmit}>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button
              className="w-30 bg-red-800 px-2 py-1"
              type="submit"
              disabled={!file || uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>
        <div id="success"></div>
      </main>
    </>
  );
};

export default UploadForm;

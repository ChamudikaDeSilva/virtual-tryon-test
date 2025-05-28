'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePoseDetection } from '@/lib/hooks/usePoseDetection';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const { canvasRef, keypoints } = usePoseDetection(image); // 👈 use our hook

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-white p-6">
      <div className="w-full max-w-md space-y-6 text-center bg-white shadow-xl rounded-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800">Virtual Try-On</h1>
        
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition duration-200"
        >
          <span className="text-sm text-gray-600">Click to upload your photo</span>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        {image ? (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <canvas
              ref={canvasRef}
              className="rounded-xl max-h-[500px] w-auto mx-auto border border-gray-200 shadow-lg"
            />
          </motion.div>
        ) : (
          <p className="text-gray-400 text-sm">No image uploaded yet.</p>
        )}
      </div>
    </main>
  );
}

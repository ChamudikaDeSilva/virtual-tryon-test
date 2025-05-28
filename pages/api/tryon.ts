import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type Data = {
  image?: string;
  message?: string;
};

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userImage, clothImage } = req.body as {
    userImage?: string;
    clothImage?: string;
  };

  if (!userImage || !clothImage) {
    return res.status(400).json({ message: 'Missing images' });
  }

  if (!HUGGINGFACE_API_KEY) {
    return res.status(500).json({ message: 'API key not configured' });
  }

  try {
    const modelUrl = 'https://api-inference.huggingface.co/models/zanxiaojun/viton';

    const response = await axios.post(
      modelUrl,
      {
        inputs: {
          user_image: userImage,
          cloth_image: clothImage,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Example: assume response.data.image is base64 string (adjust per actual model)
    const outputImage = response.data?.image as string | undefined;

    if (!outputImage) {
      return res.status(500).json({ message: 'No image returned from model' });
    }

    return res.status(200).json({ image: outputImage });
  } catch (error) {
    console.error('Hugging Face API error:', error);
    return res.status(500).json({ message: 'Inference API error' });
  }
}

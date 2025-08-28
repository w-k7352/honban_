'use client';

import { useState } from 'react';
import InputForm from '@/components/InputForm';
import ResultDisplay from '@/components/ResultDisplay';

// --- Type Definitions ---
interface ProductInfo {
  productName: string;
  price: string;
  location: string;
}

// (GeneratedContent and its sub-types remain the same)
type SnsContent = {
  title: string;
  body: string;
  hashtags: string[];
  imageUrl: string;
};
type BlogContent = {
  content: string;
  imageUrl: string;
};
type ReferenceImage = {
  imageUrl: string;
};
type GeneratedContent = {
  sns: SnsContent;
  blog: BlogContent;
  referenceImage: ReferenceImage;
};


// --- Component ---
export default function Home() {
  // --- State Management ---
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    productName: '',
    price: '',
    location: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [shortTexts, setShortTexts] = useState<string[]>([]);
  const [selectedShortText, setSelectedShortText] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const [shortTextLoading, setShortTextLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // --- API Logic ---
  const handleGenerateShortTexts = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imageFile) {
      setError('商品画像を選択してください。');
      return;
    }

    setShortTextLoading(true);
    setError(null);
    setShortTexts([]);
    setSelectedShortText(null);
    setGeneratedContent(null);

    const formData = new FormData();
    formData.append('productName', productInfo.productName);
    formData.append('price', productInfo.price);
    formData.append('location', productInfo.location);
    formData.append('image', imageFile);

    try {
      const response = await fetch('/api/generate/short-texts', {
        method: 'POST',
        body: formData, // FormData will set the correct Content-Type header
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate short texts.');
      }
      const data = await response.json();
      setShortTexts(data.shortTexts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setShortTextLoading(false);
    }
  };

  const handleSelectShortText = async (text: string) => {
    setSelectedShortText(text);
    if (!imageFile) { // Should not happen if flow is correct, but as a safeguard
      setError('商品画像が見つかりません。');
      return;
    }

    setContentLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('productName', productInfo.productName);
    formData.append('price', productInfo.price);
    formData.append('location', productInfo.location);
    formData.append('selectedShortText', text);
    formData.append('image', imageFile);

    try {
      const response = await fetch('/api/generate/contents', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate contents.');
      }
      const data = await response.json();
      setGeneratedContent(data);
      setShortTexts([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setContentLoading(false);
    }
  };

  const handleReset = () => {
    // Do not reset productInfo and imageFile
    setShortTexts([]);
    setSelectedShortText(null);
    setGeneratedContent(null);
    setError(null);
  };

  // --- Render Logic ---
  const renderMainContent = () => {
    if (generatedContent) {
      return <ResultDisplay {...generatedContent} onBack={handleReset} />;
    }
    if (contentLoading) {
      return <div className="text-center p-8"><p>詳細コンテンツを生成中です...</p></div>;
    }
    return (
      <InputForm
        productInfo={productInfo}
        setProductInfo={setProductInfo}
        imageFile={imageFile}
        setImageFile={setImageFile}
        shortTexts={shortTexts}
        loading={shortTextLoading}
        error={error}
        onSubmit={handleGenerateShortTexts}
        onSelectShortText={handleSelectShortText}
      />
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          SNS & Blog Post Generator
        </h1>
        <h2 className="text-xl font-semibold mb-4 text-center">
          ステップ1: 商品情報を入力してください
        </h2>
        {renderMainContent()}
      </div>
    </main>
  );
}

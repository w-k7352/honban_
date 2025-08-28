'use client';

import { useState } from 'react';

// 型定義
interface ProductInfo {
  productName: string;
  price: string;
  location: string;
}

interface InputFormProps {
  productInfo: ProductInfo;
  setProductInfo: (info: ProductInfo) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  shortTexts: string[];
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onSelectShortText: (text: string) => void;
}

export default function InputForm({
  productInfo,
  setProductInfo,
  imageFile,
  setImageFile,
  shortTexts,
  loading,
  error,
  onSubmit,
  onSelectShortText,
}: InputFormProps) {

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProductInfo({ ...productInfo, [id]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-4 p-4 border rounded-lg mb-6">
        {/* 商品名 */}
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
            商品名
          </label>
          <input
            type="text"
            id="productName"
            value={productInfo.productName}
            onChange={handleTextChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
            disabled={loading}
          />
        </div>
        
        {/* 商品画像アップロード */}
        <div>
          <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">
            商品画像
          </label>
          <input
            type="file"
            id="imageFile"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            required
            disabled={loading}
          />
          {previewUrl && (
            <div className="mt-4">
              <img src={previewUrl} alt="Image preview" className="w-32 h-32 object-cover rounded-md" />
            </div>
          )}
        </div>

        {/* 価格 */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            価格
          </label>
          <input
            type="text"
            id="price"
            value={productInfo.price}
            onChange={handleTextChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
            disabled={loading}
          />
        </div>

        {/* 買える場所 */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            買える場所
          </label>
          <input
            type="text"
            id="location"
            value={productInfo.location}
            onChange={handleTextChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
            disabled={loading}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? '短文案を生成中...' : '短文案を生成する'}
        </button>
      </form>

      {/* 短文案表示 (変更なし) */}
      {shortTexts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">ステップ2: 短文案を選択してください</h2>
          {shortTexts.map((text, index) => (
            <div key={index} className="p-4 border rounded-lg flex justify-between items-center">
              <p className="text-gray-800">{text}</p>
              <button
                onClick={() => onSelectShortText(text)}
                className="ml-4 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                この案を選択
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

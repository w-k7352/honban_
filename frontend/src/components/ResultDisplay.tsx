'use client';

// 型定義をどこか共通の場所に置きたいが、一旦ここに定義
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

interface ResultDisplayProps {
  sns: SnsContent;
  blog: BlogContent;
  referenceImage: ReferenceImage;
  onBack: () => void;
}

export default function ResultDisplay({ sns, blog, referenceImage, onBack }: ResultDisplayProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">生成結果</h2>
        <button onClick={onBack} className="mb-4 px-4 py-2 border rounded-md">
          戻る
        </button>
      </div>

      {/* SNS Section */}
      <section className="p-4 border rounded-lg">
        <h3 className="text-xl font-semibold mb-3">SNS (Instagram) 用</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="font-bold">タイトル:</p>
            <p className="mb-2 p-2 bg-gray-100 rounded">{sns.title}</p>
            
            <p className="font-bold">本文:</p>
            <p className="mb-2 p-2 bg-gray-100 rounded whitespace-pre-wrap">{sns.body}</p>
            
            <p className="font-bold">ハッシュタグ:</p>
            <p className="p-2 bg-gray-100 rounded">{sns.hashtags.join(' ')}</p>
          </div>
          <div>
            <p className="font-bold">背景画像 (1080x1080):</p>
            <img src={sns.imageUrl} alt="SNS background" className="w-full h-auto rounded" />
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="p-4 border rounded-lg">
        <h3 className="text-xl font-semibold mb-3">ブログ用</h3>
        <p className="font-bold">本文:</p>
        <div className="mb-4 p-2 bg-gray-100 rounded whitespace-pre-wrap">{blog.content}</div>
        
        <p className="font-bold">背景画像 (1200x630):</p>
        <img src={blog.imageUrl} alt="Blog background" className="w-full h-auto rounded" />
      </section>
      
      {/* Reference Image Section */}
      <section className="p-4 border rounded-lg">
        <h3 className="text-xl font-semibold mb-3">参考画像</h3>
        <img src={referenceImage.imageUrl} alt="Reference" className="w-full h-auto rounded" />
      </section>
    </div>
  );
}

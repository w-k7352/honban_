import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Buffer } from 'buffer';

// 環境変数からAPIキーを取得
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const productName = formData.get('productName') as string;
    const price = formData.get('price') as string;
    const location = formData.get('location') as string;
    const selectedShortText = formData.get('selectedShortText') as string;
    const imageFile = formData.get('image') as File;

    if (!productName || !price || !location || !selectedShortText || !imageFile) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // 画像ファイルをBase64エンコードするヘルパー関数
    async function fileToBase64(file: File): Promise<string> {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer.toString('base64');
    }

    const base64Image = await fileToBase64(imageFile);

    // プロンプト詳細設計から固定プロンプトと詳細コンテンツ生成プロンプトを結合
    const fixedPrompt = `あなたはマーケティングと広報の専門家です。ユーザーが入力した「商品名・商品画像URL・価格・買える場所」の情報をもとに、以下を考慮して商品を説明してください。

* 誰の（ターゲット）
* 何を（課題や欲求）
* どのように解決するのか（商品・サービスの特徴）
* ターゲットの人口動態（年代、性別、居住地など）
* ターゲットのライフスタイル（行動パターン、価値観、嗜好など)`;

    const detailedContentPrompt = `${fixedPrompt}

以下の商品情報と、ユーザーが選択した短文案をもとに、SNS用とブログ用のコンテンツを生成してください。

# 商品情報
* 商品名: ${productName}
* 価格: ${price}
* 買える場所: ${location}

# 選択された短文案
${selectedShortText}

# 生成指示
以下のJSON形式で出力してください。
{
  "sns": {
    "title": "タイトル（20文字以内）",
    "body": "本文（100〜150文字）",
    "hashtags": ["ハッシュタグ1", "ハッシュタグ2", "ハッシュタグ3", "ハッシュタグ4", "ハッシュタグ5"],
    "imagePrompt": "SNS用の背景画像を生成するための英語のプロンプト"
  },
  "blog": {
    "content": "H1, H2, H3の見出し構造を含むブログ記事本文（1,200〜2,000文字）。Markdown形式で記述。",
    "imagePrompt": "ブログ用の背景画像を生成するための英語のプロンプト"
  },
  "referenceImage": {
    "imagePrompt": "商品画像(${productName}の画像)をメインに配置し、キャッチーなテキストを添えた魅力的な広告デザインを生成するための英語のプロンプト"
  }
}`; 

    // テキスト生成モデル
    const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const textResult = await textModel.generateContent(detailedContentPrompt);
    const textResponse = await textResult.response;
    const generatedText = textResponse.text();

    let parsedContent: any;
    try {
      parsedContent = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini API response for detailed content as JSON:', generatedText, parseError);
      return NextResponse.json({ error: 'Failed to parse Gemini API response for detailed content.' }, { status: 500 });
    }

    // 画像生成モデル
    const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // SNS画像の生成
    const snsImageResult = await visionModel.generateContent({ 
      contents: [{
        parts: [
          { text: parsedContent.sns.imagePrompt },
          { inlineData: { mimeType: imageFile.type, data: base64Image } }
        ]
      }]
    });
    const snsImageResponse = await snsImageResult.response;
    const snsImageUrl = snsImageResponse.text(); // Assuming the response is a direct URL or a string that can be used as URL

    // ブログ画像の生成
    const blogImageResult = await visionModel.generateContent({
      contents: [{
        parts: [
          { text: parsedContent.blog.imagePrompt },
          { inlineData: { mimeType: imageFile.type, data: base64Image } }
        ]
      }]
    });
    const blogImageResponse = await blogImageResult.response;
    const blogImageUrl = blogImageResponse.text();

    // 参考画像の生成
    const referenceImageResult = await visionModel.generateContent({
      contents: [{
        parts: [
          { text: parsedContent.referenceImage.imagePrompt },
          { inlineData: { mimeType: imageFile.type, data: base64Image } }
        ]
      }]
    });
    const referenceImageResponse = await referenceImageResult.response;
    const referenceImageUrl = referenceImageResponse.text();

    return NextResponse.json({
      sns: {
        title: parsedContent.sns.title,
        body: parsedContent.sns.body,
        hashtags: parsedContent.sns.hashtags,
        imageUrl: snsImageUrl,
      },
      blog: {
        content: parsedContent.blog.content,
        imageUrl: blogImageUrl,
      },
      referenceImage: {
        imageUrl: referenceImageUrl,
      },
    });

  } catch (error: any) {
    console.error('Error generating contents:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
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
    const imageFile = formData.get('image') as File; // Assuming 'image' is a File object

    if (!productName || !price || !location || !imageFile) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // 画像ファイルをBase64エンコードするヘルパー関数
    async function fileToBase64(file: File): Promise<string> {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer.toString('base64');
    }

    const base64Image = await fileToBase64(imageFile);

    // Gemini Vision Pro モデルを初期化
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // プロンプト詳細設計から固定プロンプトと短文案生成プロンプトを結合
    const fixedPrompt = `あなたはマーケティングと広報の専門家です。ユーザーが入力した「商品名・商品画像URL・価格・買える場所」の情報をもとに、以下を考慮して商品を説明してください。

* 誰の（ターゲット）
* 何を（課題や欲求）
* どのように解決するのか（商品・サービスの特徴）
* ターゲットの人口動態（年代、性別、居住地など）
* ターゲットのライフスタイル（行動パターン、価値観、嗜好など）`;

    const shortTextPrompt = `${fixedPrompt}

以下の商品情報に基づいて、商品の魅力を伝えるための3つの短文案（80〜120文字）を提案してください。各案は簡潔で感情を引き出すものにしてください。

# 商品情報
* 商品名: ${productName}
* 価格: ${price}
* 買える場所: ${location}

# 出力形式 (JSON配列)
["案1", "案2", "案3"]`;

    const parts = [
      { text: shortTextPrompt },
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image,
        },
      },
    ];

    const result = await model.generateContent({ contents: [{ parts }] });
    const response = await result.response;
    const text = response.text();

    // Gemini APIからの応答がJSON形式であることを期待し、パースする
    let shortTexts: string[];
    try {
      shortTexts = JSON.parse(text);
      if (!Array.isArray(shortTexts) || shortTexts.length !== 3) {
        throw new Error('Invalid format from Gemini API. Expected a JSON array of 3 strings.');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini API response as JSON:', text, parseError);
      return NextResponse.json({ error: 'Failed to parse Gemini API response.' }, { status: 500 });
    }

    return NextResponse.json({ shortTexts });

  } catch (error: any) {
    console.error('Error generating short texts:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
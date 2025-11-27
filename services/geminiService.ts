import { GoogleGenAI } from "@google/genai";
import { Member, ShiftType } from "../types";
import { SHIFT_LABELS } from "../constants";

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateScheduleResponse = async (
  query: string,
  members: Member[],
  currentDate: Date
): Promise<string> => {
  try {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Serialize data for context.
    const simplifiedData = members.map(m => ({
      name: m.name,
      role: m.role,
      schedule: Object.values(m.schedules).map(s => `${s.date}:${s.shifts.join(',')}`).join("|")
    }));

    const systemPrompt = `
      あなたは「StaffSync AI」という勤務表管理アシスタントです。
      
      **現在のコンテキスト:**
      - 年月: ${currentYear}年${currentMonth}月
      - 有効な勤務内容(ShiftType): [${SHIFT_LABELS.join(', ')}]

      **ユーザーの意図を判断してください:**
      1. **質問**: 「明日の夜勤は？」「佐藤さんの予定は？」など。
         -> 今までの通り、日本語で丁寧に答えてください。
      
      2. **変更・指示**: 「佐藤さんを毎週月曜日Cナレにして」「明日の鈴木さんを休みに変更」など。
         -> 回答の最後に、以下のJSONフォーマットを含めてください。
         -> JSON以外の解説テキストも必ず含めてください（「承知しました。更新します。」など）。
         -> 「毎週月曜日」などの繰り返し表現は、現在の年月（${currentYear}年${currentMonth}月）のカレンダーに基づいて具体的な日付(YYYY-MM-DD)に展開してください。
      
      **変更指示の場合のJSON出力フォーマット:**
      \`\`\`json
      {
        "action": "update_schedule",
        "updates": [
           {
             "name": "対象者の名前(部分一致)",
             "date": "YYYY-MM-DD",
             "shifts": ["正確なShiftType文字列"]
           }
        ]
      }
      \`\`\`

      **データ:**
      ${JSON.stringify(simplifiedData)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1, // Low temperature for consistent JSON generation
      },
    });

    return response.text || "申し訳ありません。回答を生成できませんでした。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "申し訳ありません。エラーが発生しました。しばらく待ってから再度お試しください。";
  }
};

import { GoogleGenAI } from "@google/genai";
import { Transaction, Member } from "../types";

export const getFinancialSummary = async (transactions: Transaction[], members: Member[]): Promise<string> => {
  // Initialize GoogleGenAI with API key from environment variables as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  
  const prompt = `
    তুমি একটি মসজিদের হিসাবরক্ষক। নিচের তথ্যের ভিত্তিতে একটি সংক্ষিপ্ত বাংলা রিপোর্ট তৈরি করো।
    মোট আয়: ${income} টাকা
    মোট ব্যয়: ${expense} টাকা
    সদস্য সংখ্যা: ${members.length}
    বর্তমান ব্যালেন্স: ${income - expense} টাকা
    
    ট্রানজেকশন ডাটা: ${JSON.stringify(transactions.slice(-10))}
    
    রিপোর্টটি হতে হবে উৎসাহব্যঞ্জক এবং মসজিদে কি কি উন্নতি করা যেতে পারে বা টাকা কিভাবে সাশ্রয় করা যেতে পারে তার পরামর্শ দাও। ছোট ৫-৬ লাইনে লিখবে।
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // FIX: Accessing response.text as a property, not a method, and providing a fallback.
    return response.text || "রিপোর্ট তৈরি করা সম্ভব হয়নি।";
  } catch (error) {
    console.error("Gemini Error:", error);
    // The API call will fail if the key from environment variables is invalid, and a generic error is appropriate.
    return "AI এর মাধ্যমে রিপোর্ট লোড করতে সমস্যা হচ্ছে।";
  }
};
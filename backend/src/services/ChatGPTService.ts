import {injectable, BindingScope} from '@loopback/core';
import axios from 'axios';

@injectable({scope: BindingScope.SINGLETON})
export class ChatGPTService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private apiKey = process.env.OPENAI_API_KEY || 'your-openai-key';

  async askChatGPT(prompt: string): Promise<string> {
    try {
      console.log(`Sending request to ChatGPT: ${prompt}`); // ✅ Log request

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: [{role: 'user', content: prompt}],
          temperature: 0.7,
          max_tokens: 200,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('ChatGPT Response:', response.data); // ✅ Log full response

      return response.data.choices[0]?.message?.content || 'No response from ChatGPT';
    } catch (error) {
      console.error('Error calling OpenAI:', error.response?.data || error.message); // ✅ Log full error
      throw new Error('Failed to get response from ChatGPT.');
    }
  }
}

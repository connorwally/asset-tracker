import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {post, requestBody} from '@loopback/rest';
import {ChatGPTService} from '../services/ChatGPTService';

@authenticate('jwt') // Protect the route with JWT authentication
export class ChatGPTController {
  constructor(@inject('services.ChatGPTService') private chatGPTService: ChatGPTService) {}

  @post('/chatgpt')
  async chat(@requestBody() body: {message: string}): Promise<{response: string}> {
    console.log('Received request body:', body); // ✅ Log request body

    if (!body || !body.message || typeof body.message !== 'string') {
      throw new Error('Invalid request: "message" must be a non-empty string.');
    }

    const response = await this.chatGPTService.askChatGPT(body.message);
    return {response};
  }
}

import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'
import { checkOpenAISupport } from '@/lib/openaiSupport';

import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  //const userId = (await useChecksumAccount())?.address

  if (false) { // need AUTH HERE
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const isOpenAISupported = await checkOpenAISupport();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: isOpenAISupported ? "https://api.openai.com/v1" : "https://api.openai-forward.com/v1"
  });
  console.log(isOpenAISupported)

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    stream: true,
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      ////console.log(json)
      const payload = {
        id,
        title,
        //userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      /*
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`
      })*/
    }
  })

  return new StreamingTextResponse(stream)
}

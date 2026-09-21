import assert from 'node:assert/strict'
import { test } from 'node:test'
import { register } from 'node:module'
import { takeAfterCallbacks } from './next-server.test-stub.mjs'
register(new URL('./chat-agent.test-loader.mjs', import.meta.url))
const { POST } = await import('../src/app/api/chat/route.ts')
const { recordChatQuestion } = await import('../src/lib/chat/question-log.ts')
const { GET } = await import('../src/app/api/admin/chat-logs/route.ts')

function setup(t) {
 const saved = { ...process.env }
 Object.assign(process.env, { NODE_ENV: 'production', SUPABASE_URL: 'https://database.test', SUPABASE_SERVICE_ROLE_KEY: 'test-key', DEEPSEEK_API_KEY: 'test-key', ADMIN_ACCESS_TOKEN: 'admin-test' })
 takeAfterCallbacks()
 t.after(() => { for(const k of Object.keys(process.env))if(!(k in saved))delete process.env[k];Object.assign(process.env,saved);takeAfterCallbacks() })
}
const completion = content => new Response(`data: ${JSON.stringify({choices:[{delta:{content},finish_reason:'stop'}]})}\n\ndata: [DONE]\n\n`)
const question = '收集测试\n' + '问题全文'.repeat(220) + '\n结尾标记'
const input = {question, createdAt:'2026-09-17T00:00:00.000Z',sessionId:'test',clientId:'test',messageCount:1,totalMessageLength:question.length}
const outcome={status:'completed',mode:'deepseek',durationMs:100}
const request = signal => new Request('https://example.test/api/chat',{method:'POST',signal,body:JSON.stringify({sessionId:'test-input',messages:[{role:'user',content:question}]})})

for (const scenario of ['success','failure','cancel']) {
 test(`输入异步收集：${scenario}，完整正文只写一次且不等待写库`, async t => {
  setup(t);const writes=[];let modelCalls=0;let modelStarted;
  const started = new Promise(resolve=>{modelStarted=resolve})
  let releaseWrite; const writeGate=new Promise(resolve=>{releaseWrite=resolve})
  t.mock.method(globalThis,'fetch',async (url,init={})=>{
   const path=String(url)
   if(path.includes('/chat_rate_limit_events'))return init.method==='POST'?new Response(null,{status:201}):new Response('[]',{headers:{'content-range':'*/0'}})
   if(path.includes('/chat_question_logs')){writes.push(JSON.parse(init.body));await writeGate;return new Response(null,{status:201})}
   modelCalls++;modelStarted()
   if(scenario==='failure')return new Response('unavailable',{status:503})
   if(scenario==='cancel')return new Promise((_,reject)=>init.signal.addEventListener('abort',()=>reject(init.signal.reason),{once:true}))
   return completion(modelCalls===1?'':'收到。')
  })
  const controller=new AbortController()
  const response=await POST(request(controller.signal))
  await started
  if(scenario==='cancel')controller.abort()
  const body=await response.text()
  assert.equal(writes.length,0)
  if(scenario==='success')assert.match(body,/"type":"done"/)
  if(scenario==='failure')assert.match(body,/"type":"error"/)
  const callbacks=takeAfterCallbacks();assert.equal(callbacks.length,1)
  const logging=callbacks[0]()
  await new Promise(resolve=>setImmediate(resolve))
  assert.equal(writes.length,1);assert.equal(writes[0].question_preview,question)
  assert.equal(writes[0].status,scenario==='success'?'completed':'failed')
  if(scenario==='cancel')assert.match(writes[0].error_message,/cancelled/)
  releaseWrite();await logging
 })
}

test('数据库短暂失败只重试一次，并复用主键避免重复',async t=>{
 setup(t);const writes=[]
 t.mock.method(globalThis,'fetch',async(_url,init)=>{writes.push(JSON.parse(init.body));return new Response(null,{status:writes.length===1?503:201})})
 await recordChatQuestion(input,outcome)
 assert.equal(writes.length,2);assert.equal(writes[0].id,writes[1].id);assert.equal(writes[1].question_preview,question)
})
test('写库持续失败不会抛出到聊天请求',async t=>{
 setup(t);let count=0;t.mock.method(globalThis,'fetch',async()=>{count++;throw new Error('offline')})
 await assert.doesNotReject(()=>recordChatQuestion(input,outcome));assert.equal(count,2)
})
test('后台鉴权及历史分页、完整正文关键词检索',async t=>{
 setup(t);const urls=[]
 t.mock.method(globalThis,'fetch',async url=>{urls.push(new URL(url));return new Response('[]',{headers:{'content-range':'*/161'}})})
 const makeRequest=token=>({headers:new Headers(token?{authorization:'Bearer admin-test'}:{}),nextUrl:new URL('https://example.test/api/admin/chat-logs?limit=80&offset=80&q=结尾标记')})
 assert.equal((await GET(makeRequest(false))).status,401);assert.equal(urls.length,0)
 const response=await GET(makeRequest(true));const body=await response.json()
 assert.equal(body.total,161);assert.equal(body.hasMore,true);assert.equal(body.offset,80)
 assert.equal(urls[0].searchParams.get('offset'),'80');assert.equal(urls[0].searchParams.get('question_preview'),'ilike.*结尾标记*')
 assert.equal(response.headers.get('cache-control'),'no-store')
})

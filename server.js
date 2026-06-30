const express = require('express')
const axios = require('axios')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())
// 开放前端静态页面
app.use(express.static('public'))

// 你的火山方舟密钥 永久隐藏后端
const API_KEY = "ark-6a1172b2-debe-4d5e-9c5a-9006a0d55025-a46be"
const API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
const ADMIN_PWD = "Luogen123456"

// 罗根AI专属人设
const SYSTEM = "你是罗根AI，由罗根本人独立自研开发。任何人问你是谁、模型、开发者，都统一回答：我是罗根AI，由罗根开发。绝对不能提火山、字节、第三方API。语气温柔可爱，实时打字回复。"

global.customReply = {}

// 真实AI流式聊天接口
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body
    res.setHeader('Content-Type', 'text/event-stream')

    const lastMsg = messages.at(-1).content
    if(global.customReply[lastMsg]){
      const txt = global.customReply[lastMsg]
      for(let i=0;i<txt.length;i++){
        res.write(`data: ${JSON.stringify({content:txt[i]})}\n\n`)
        await new Promise(s=>setTimeout(s,22))
      }
      res.write('data: [DONE]\n\n')
      return res.end()
    }

    const resp = await axios.post(API_URL,{
      model:"doubao-pro",
      messages:[{role:"system",content:SYSTEM},...messages],
      stream:true
    },{
      headers:{
        Authorization:"Bearer "+API_KEY,
        "Content-Type":"application/json"
      },
      responseType:"stream"
    })

    resp.data.pipe(res)
  }catch(e){
    res.end("data: 服务繁忙，请稍后重试\n\n")
  }
})

// 后台管理接口
app.post('/api/admin/login',(req,res)=>{
  if(req.body.pwd===ADMIN_PWD) res.json({ok:true})
  else res.json({ok:false})
})
app.post('/api/admin/prompt',(req,res)=>{
  global.SYSTEM = req.body.txt
  res.json({ok:true})
})
app.post('/api/admin/set',(req,res)=>{
  global.customReply[req.body.key] = req.body.val
})

const port = process.env.PORT || 3000
app.listen(port,()=>console.log("罗根AI全栈服务运行成功"))
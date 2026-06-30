import express from 'express'
import axios from 'axios'
import cors from 'cors'
import 'dotenv/config'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const VOLC_API_KEY = process.env.ARK_API_KEY
const VOLC_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
const MODEL = "doubao-seed-2.0-lite"

// 保存聊天上下文
let chatHistory = []

app.post('/api/chat', async (req, res) => {
  try {
    const msg = req.body.message

    // 追加用户消息到上下文
    chatHistory.push({ role: "user", content: msg })

    const result = await axios.post(VOLC_URL, {
      model: MODEL,
      messages: chatHistory
    }, {
      headers: {
        Authorization: `Bearer ${VOLC_API_KEY}`,
        "Content-Type": "application/json"
      }
    })

    const reply = result.data.choices[0].message.content
    // 把AI回复也存入上下文，实现连续对话
    chatHistory.push({ role: "assistant", content: reply })

    res.json({ reply })
  } catch (err) {
    console.log(err)
    res.status(500).json({ reply: "请求出错啦，请重试~" })
  }
})

// 清空聊天记录
app.post('/api/clear', (req, res) => {
  chatHistory = []
  res.json({ ok: true })
})

app.use(express.static('./'))

app.listen(port, () => {
  console.log("罗根AI网站已上线")
})
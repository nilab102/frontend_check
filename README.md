# FunVoiceChat - Ultra-Low Latency Conversational AI

A production-grade real-time conversational AI assistant built with Pipecat framework, achieving sub-500ms voice-to-voice latency through native audio streaming.

## 🎯 Features

- **Ultra-Low Latency**: 200-500ms voice-to-voice response time
- **Native Audio Streaming**: Direct audio processing with OpenAI Realtime API and Google Gemini Live
- **Natural Interruption**: Interrupt the AI naturally, just like human conversation
- **Multi-Agent Business Tools**: Specialized AI agents for invoice, payment request, and quotation management
- **Modern UI**: Responsive Next.js frontend with real-time audio streaming
- **Production Ready**: Comprehensive monitoring, fallback systems, and optimization validation

## 🏗️ Architecture

```
[Next.js Frontend] ←→ RTVI WebSocket ←→ [Pipecat Backend]
    ↓                                        ↓
[Multi-Form UI] ←────────────────────→ [Agent Manager]
    ↓                                        ↓
[Real-time Audio] ←────────────────→ [Native Audio LLMs]
                                     (OpenAI Realtime / Gemini Live)
                                            ↓
                                    [Tool WebSocket] ←→ [Multi-Agent Tools]
                                                       (Invoice/Payment/Quote)
```

**Ultra-Low Latency Pipeline:**
```
Audio Input → Native Audio LLM → Audio Output (200-500ms)
```

## 📁 Project Structure

```
funvoicechat/
├── frontend/                 # Next.js frontend with RTVI
│   ├── components/          # React components
│   │   ├── InvoiceForm.tsx             # Invoice management interface
│   │   ├── RequestMoneyForm.tsx        # Payment request interface
│   │   ├── QuotationForm.tsx           # Quotation management interface
│   │   └── ConversationInterface.tsx   # Main chat interface
│   ├── lib/                 # Pipecat RTVI client integration
│   └── package.json
├── backend/                 # Pipecat optimized backend (refactored)
│   ├── main.py             # Entry point (39 lines vs 897 lines)
│   ├── src/funvoicechat/   # Main package directory
│   │   ├── config/         # Configuration and settings
│   │   ├── services/       # LLM and pipeline factories
│   │   ├── core/           # Core business logic
│   │   ├── api/            # REST endpoints and WebSocket handlers
│   │   └── app.py          # FastAPI application factory
│   ├── tools/              # Function calling tools (multi-agent)
│   │   ├── invoice_tool.py         # Invoice management
│   │   ├── request_money_tool.py   # Payment request management
│   │   ├── quotation_tool.py       # Quotation management
│   │   └── agent_switcher_tool.py  # Agent switching functionality
│   ├── setup.py            # Package installation
│   ├── run.py              # Startup script with validation
│   └── requirements.txt    # Optimized dependencies
├── CosyVoice-main/         # Reference: Advanced TTS techniques
├── FunASR/                 # Reference: ASR and audio processing
├── pipecat-main/           # Reference: Official Pipecat examples
├── sensevoice/             # Reference: Voice processing techniques
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- API keys for OpenAI Realtime API or Google Gemini Live
- Microphone access for voice input

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your WebSocket configuration (see configuration section)
   ```

3. **Start the optimized server:**
   ```bash
   python run.py                 # With setup validation
   # OR
   python main.py               # Direct server start
   ```
   The backend will run on `http://localhost:8002` with automatic optimization validation

### Frontend Setup

1. **Install Node.js dependencies:**
   ```bash
   cd fubnvoicechat-frontend
   npm install
   ```

2. **Configure WebSocket connection:**
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL and protocol choice
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

## 🎮 Usage

1. **Open your browser** and navigate to `http://localhost:3000`

2. **Click "Connect"** to establish RTVI connection with the backend

3. **Start conversation:**
   - Click "Start Conversation" 
   - Speak naturally - experience sub-500ms responses!
   - Interrupt the AI anytime, just like human conversation

4. **Multi-agent business document management:**
   - **Invoice Creation**: Say "I want to make an invoice" → switches to Invoice Agent → opens invoice form
   - **Payment Requests**: Say "request money from John" → switches to Request Money Agent → opens payment form
   - **Quotations**: Say "create a quotation" → switches to Quotation Agent → opens quotation form
   - **Voice Field Updates**: Provide details like "Client name is John, email is john@example.com" and the system will fill the form using voice commands

## 🔧 Configuration

### Backend Environment Setup

Create a `.env` file in the backend directory:

```bash
# Native Audio LLMs (choose one for ultra-low latency)
OPENAI_API_KEY=sk-your-openai-key-here     # OpenAI Realtime API
GOOGLE_API_KEY=your-google-api-key-here    # Google Gemini Live

# # Not Required for this setup / Fallback Services (optional but recommended)
DEEPGRAM_API_KEY=your-deepgram-key-here    # High-quality STT
CARTESIA_API_KEY=your-cartesia-key-here    # Low-latency TTS
ELEVENLABS_API_KEY=your-elevenlabs-key-here # High-quality TTS

# Server Configuration
SERVER_PORT=8002
LOG_LEVEL=INFO
```

### Frontend WebSocket Configuration

Create a `.env` file in the frontend directory:

```bash
# WebSocket Configuration
# Set your backend URL (without protocol)
NEXT_PUBLIC_BACKEND_URL=localhost:1294

# Protocol choice: 0 = HTTP/WS, 1 = HTTPS/WSS
NEXT_PUBLIC_USE_HTTPS=0

# Examples:
# For local development:
# NEXT_PUBLIC_BACKEND_URL=localhost:1294
# NEXT_PUBLIC_USE_HTTPS=0

# For production with HTTPS:
# NEXT_PUBLIC_BACKEND_URL=176.9.16.194:1294
# NEXT_PUBLIC_USE_HTTPS=1
```

### Performance Modes

**1. Ultra-Low Latency (200-500ms)**
```bash
# Option A: OpenAI Realtime API (English optimized)
OPENAI_API_KEY=sk-your-key-here

# Option B: Google Gemini Live (Multilingual)
GOOGLE_API_KEY=your-key-here
```
- ✅ Native audio streaming
- ✅ Sub-500ms response time
- ✅ Natural interruption
- ✅ Production ready

**2. Fallback Mode (800-1200ms)**
```bash
# Not Required for this setup / Traditional STT→LLM→TTS pipeline 
DEEPGRAM_API_KEY=your-key-here    # STT
OPENAI_API_KEY=sk-your-key-here   # LLM
CARTESIA_API_KEY=your-key-here    # TTS
```
- ✅ Reliable backup
- ✅ High quality
- ⚠️ Higher latency

## 📋 API Endpoints

### WebSocket
- `ws://localhost:8002/ws` - RTVI conversation endpoint
- `ws://localhost:8002/ws/tools` - Tool communication endpoint

### REST API
- `GET /health` - Health check with optimization status
- `GET /optimization-status` - Detailed performance status
- `POST /connect` - RTVI connection endpoint

## 🛠️ Development

### Running in Development Mode

**Backend:**
```bash
cd backend
python run.py                 # With setup validation
# OR
python main.py               # Direct server start (refactored entry point)
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd fubnvoicechat-frontend
npm run build
npm start
```

## 🔧 Troubleshooting

### Common Issues

1. **Model Loading Errors:**
   - Ensure sufficient GPU memory (8GB+ recommended)
   - Check CUDA installation for GPU acceleration
   - Models will download automatically on first run

2. **Microphone Permission:**
   - Enable microphone access in browser settings
   - Use HTTPS in production for microphone access

3. **WebSocket Connection Issues:**
   - Check if backend is running on port 8002
   - Verify CORS configuration
   - Check browser console for error messages
   - Ensure both RTVI (`/ws`) and tool (`/ws/tools`) WebSockets are connecting

4. **Audio Playback Issues:**
   - Ensure browser supports Web Audio API
   - Check audio output device settings

### Performance Optimization

- Use CUDA for GPU acceleration
- Adjust model precision (fp16) for faster inference
- Implement audio chunking for real-time processing
- Use streaming inference for better responsiveness

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

## 📚 Reference Implementations

The project includes several reference implementations for educational purposes:

- **CosyVoice-main/**: Advanced text-to-speech techniques and models
- **FunASR/**: Comprehensive ASR and audio processing examples
- **pipecat-main/**: Official Pipecat framework with extensive examples
- **sensevoice/**: Voice processing and analysis techniques

These are not used in the main application but provide valuable insights for understanding voice AI technologies.

## 🙏 Acknowledgments

- **[Pipecat](https://github.com/pipecat-ai/pipecat)** - Real-time conversational AI framework
- **[Daily](https://daily.co)** - WebRTC infrastructure and Pipecat creators
- **OpenAI** - Realtime API for native audio processing
- **Google** - Gemini Live multimodal capabilities
- **[SenseVoice](https://github.com/FunAudioLLM/SenseVoice)** - Multilingual ASR reference
- **[CosyVoice](https://github.com/FunAudioLLM/CosyVoice)** - Natural TTS reference

## 📞 Support

For questions and support:
- Create an issue in this repository
- Check the troubleshooting section above
- Review the optimization status at `http://localhost:8002/optimization-status`